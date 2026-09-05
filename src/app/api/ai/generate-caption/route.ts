import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";
import { generateAIContent } from "@/lib/ai/gemini";
import { recordContentGeneration, recordTokenUsage } from "@/lib/supabase/server";
import { getSystemInstructionForMode } from "@/lib/ai/prompts";

export async function POST(req: NextRequest) {
  try {
    const { topic, platform, tone, details } = await req.json();

    const promptText = topic || details;
    if (!promptText) {
      return NextResponse.json({ error: "Topic or post description is required" }, { status: 400 });
    }

    const baseInstruction = `You are a social media copywriter for ${platform || "Instagram"}. Tone: ${tone || "engaging"}.`;
    const systemInstruction = getSystemInstructionForMode("caption", baseInstruction);

    const response = await generateAIContent({
      prompt: `Write a viral social post and caption about: ${promptText}`,
      systemInstruction,
    });

    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (session?.user?.id) {
        await recordTokenUsage(
          session.user.id,
          "content_generate_caption",
          response.tokens.input,
          response.tokens.output
        );

        await recordContentGeneration(
          session.user.id,
          "caption",
          promptText,
          response.text
        );
      }
    } catch (dbErr) {
      console.warn("Could not persist caption generation to DB:", dbErr);
    }

    return NextResponse.json({
      caption: response.text,
      output: response.text,
      tokens: response.tokens,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate caption" },
      { status: 500 }
    );
  }
}
