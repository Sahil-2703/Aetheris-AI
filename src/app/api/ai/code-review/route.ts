import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";
import { generateAIContent } from "@/lib/ai/gemini";
import { recordCodeReview, recordTokenUsage } from "@/lib/supabase/server";
import { getSystemInstructionForMode } from "@/lib/ai/prompts";

export async function POST(req: NextRequest) {
  try {
    const { code, mode, issueDescription } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Code snippet is required" }, { status: 400 });
    }

    const systemInstruction = getSystemInstructionForMode(mode || "debug");

    const response = await generateAIContent({
      prompt: code,
      systemInstruction,
    });

    // Record token usage and code review if session exists
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (session?.user?.id) {
        await recordTokenUsage(
          session.user.id,
          `code_review_${mode || "default"}`,
          response.tokens.input,
          response.tokens.output
        );

        await recordCodeReview(
          session.user.id,
          code,
          response.text,
          issueDescription
        );
      }
    } catch (dbErr) {
      console.warn("Could not persist code review to DB:", dbErr);
    }

    return NextResponse.json({
      review: response.text,
      output: response.text,
      tokens: response.tokens,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to review code" },
      { status: 500 }
    );
  }
}
