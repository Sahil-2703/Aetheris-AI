import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";
import { generateAIContent } from "@/lib/ai/gemini";
import { recordContentGeneration, recordTokenUsage } from "@/lib/supabase/server";
import { getSystemInstructionForMode } from "@/lib/ai/prompts";

export async function POST(req: NextRequest) {
  try {
    const { content, mode, instructions } = await req.json();

    if (!content && !instructions) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const systemInstruction = getSystemInstructionForMode(mode || "reply");
    const promptText = `${instructions ? `Instructions: ${instructions}\n\n` : ""}Content: ${content || ""}`;

    const response = await generateAIContent({
      prompt: promptText,
      systemInstruction,
    });

    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (session?.user?.id) {
        await recordTokenUsage(
          session.user.id,
          `email_${mode || "draft"}`,
          response.tokens.input,
          response.tokens.output
        );

        await recordContentGeneration(
          session.user.id,
          `email_${mode || "draft"}`,
          promptText,
          response.text
        );
      }
    } catch (dbErr) {
      console.warn("Could not persist email generation to DB:", dbErr);
    }

    return NextResponse.json({
      draft: response.text,
      output: response.text,
      tokens: response.tokens,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate draft" },
      { status: 500 }
    );
  }
}
