import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";
import { getConnectedAccounts, recordInboxEvent } from "@/lib/supabase/server";
import { ensureFreshToken, ConnectedAccountRow } from "@/lib/integrations/token-refresh";
import { google } from "googleapis";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pageToken = req.nextUrl.searchParams.get("pageToken") || undefined;
    const searchQuery = req.nextUrl.searchParams.get("q") || "";
    const userId = session.user.id;
    const accounts = await getConnectedAccounts(userId);
    const gmailAccount = accounts.find((a) => a.provider === "gmail");

    if (!gmailAccount) {
      return NextResponse.json({
        isConnected: false,
        messages: [],
        nextPageToken: null,
        message: "No Gmail account connected. Please connect your Gmail account.",
      });
    }

    // Ensure valid, unexpired access token
    let accessToken = gmailAccount.access_token;
    try {
      accessToken = await ensureFreshToken(gmailAccount as ConnectedAccountRow);
    } catch (tokenErr) {
      console.warn("Token refresh failed, using stored token:", tokenErr);
    }

    // Initialize Google OAuth Client & Gmail API
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/integrations/gmail/connect`;

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: gmailAccount.refresh_token || undefined,
    });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // Build search query: if user provided a query, search within INBOX for it; otherwise list all INBOX
    const gmailQuery = searchQuery
      ? `label:INBOX ${searchQuery}`
      : "label:INBOX";

    // Fetch inbox messages list with pageToken and search support
    const listRes = await gmail.users.messages.list({
      userId: "me",
      q: gmailQuery,
      maxResults: 10,
      pageToken,
    });

    const messagesList = listRes.data.messages || [];
    const nextPageToken = listRes.data.nextPageToken || null;
    const formattedEmails = [];

    for (const msgItem of messagesList) {
      if (!msgItem.id) continue;
      try {
        const msgRes = await gmail.users.messages.get({
          userId: "me",
          id: msgItem.id,
          format: "full",
        });

        const msgData = msgRes.data;
        const headersList = msgData.payload?.headers || [];

        const fromHeader = headersList.find((h) => h.name?.toLowerCase() === "from")?.value || "Unknown Sender";
        const subjectHeader = headersList.find((h) => h.name?.toLowerCase() === "subject")?.value || "(No Subject)";
        const dateHeader = headersList.find((h) => h.name?.toLowerCase() === "date")?.value || "";

        // Extract sender name and email address
        let senderName = fromHeader;
        let senderEmail = fromHeader;
        const match = fromHeader.match(/^(?:"?([^"]*)"?\s)?<([^>]+)>$/);
        if (match) {
          senderName = match[1] || match[2].split("@")[0];
          senderEmail = match[2];
        }

        // Format date string
        let formattedDate = "Recently";
        if (dateHeader) {
          try {
            const parsedDate = new Date(dateHeader);
            formattedDate = parsedDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          } catch (e) {}
        }

        // Extract email body snippet/text
        let bodyText = msgData.snippet || "Email content preview...";
        if (msgData.payload?.body?.data) {
          bodyText = Buffer.from(msgData.payload.body.data, "base64").toString("utf-8");
        } else if (msgData.payload?.parts) {
          const textPart = msgData.payload.parts.find((p) => p.mimeType === "text/plain");
          if (textPart?.body?.data) {
            bodyText = Buffer.from(textPart.body.data, "base64").toString("utf-8");
          }
        }

        const emailObj = {
          id: msgItem.id,
          senderName,
          senderEmail,
          subject: subjectHeader,
          snippet: msgData.snippet || bodyText.slice(0, 120),
          content: bodyText,
          date: formattedDate,
          unread: msgData.labelIds?.includes("UNREAD") || false,
        };

        formattedEmails.push(emailObj);

        // Record in inbox_events table in Supabase
        await recordInboxEvent({
          userId,
          connectedAccountId: gmailAccount.id,
          provider: "gmail",
          providerMessageId: msgItem.id,
          fromAddress: senderEmail,
          subject: subjectHeader,
          snippet: msgData.snippet || bodyText.slice(0, 120),
        });
      } catch (itemErr) {
        console.warn(`Error fetching details for message ${msgItem.id}:`, itemErr);
      }
    }

    return NextResponse.json({
      isConnected: true,
      emailAddress: gmailAccount.provider_account_id,
      messages: formattedEmails,
      nextPageToken,
    });
  } catch (error: any) {
    console.error("Failed to fetch live Gmail messages:", error);
    const isApiDisabled = error.message?.includes("Gmail API has not been used") || error.message?.includes("disabled");

    return NextResponse.json({
      isConnected: true,
      apiDisabled: isApiDisabled,
      enableUrl: "https://console.developers.google.com/apis/api/gmail.googleapis.com/overview?project=151333311311",
      error: isApiDisabled
        ? "Gmail API is disabled in Google Cloud Project 151333311311. Please enable it in Google Cloud Console."
        : error.message || "Failed to fetch live Gmail messages",
      messages: [],
      nextPageToken: null,
    });
  }
}
