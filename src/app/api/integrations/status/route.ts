import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";
import { getConnectedAccounts, disconnectAccount } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accounts = await getConnectedAccounts(session.user.id);

    const gmailAccount = accounts.find((a) => a.provider === "gmail");
    const outlookAccount = accounts.find((a) => a.provider === "outlook");
    const instagramAccount = accounts.find((a) => a.provider === "instagram");

    return NextResponse.json({
      gmail: !!gmailAccount,
      outlook: !!outlookAccount,
      instagram: !!instagramAccount,
      accounts: {
        gmail: gmailAccount ? { id: gmailAccount.id, email: gmailAccount.provider_account_id } : null,
        outlook: outlookAccount ? { id: outlookAccount.id, email: outlookAccount.provider_account_id } : null,
        instagram: instagramAccount ? { id: instagramAccount.id, name: instagramAccount.provider_account_id } : null,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch integration status" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { provider } = await req.json();

    if (!provider || !["gmail", "outlook", "instagram"].includes(provider)) {
      return NextResponse.json({ error: "Invalid provider specified" }, { status: 400 });
    }

    await disconnectAccount(session.user.id, provider as "gmail" | "outlook" | "instagram");

    return NextResponse.json({ success: true, message: `${provider} account disconnected successfully.` });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to disconnect integration account" },
      { status: 500 }
    );
  }
}
