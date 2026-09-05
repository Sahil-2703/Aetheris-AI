import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";
import { generateAIContent } from "@/lib/ai/gemini";
import { recordContentGeneration, recordTokenUsage } from "@/lib/supabase/server";
import { getSystemInstructionForMode } from "@/lib/ai/prompts";

export async function POST(req: NextRequest) {
  try {
    const { topic, tone, platform, lengthPreference, details } = await req.json();

    const promptText = topic || details;
    if (!promptText) {
      return NextResponse.json({ error: "Topic or details are required" }, { status: 400 });
    }

    const baseInstruction = `You are an elite creator scriptwriter for ${platform || "YouTube / Reels"}. Target pacing: ${lengthPreference || "60s"}. Tone: ${tone || "engaging"}.`;
    const systemInstruction = getSystemInstructionForMode("script", baseInstruction);

    const response = await generateAIContent({
      prompt: `Write an authentic, spoken creator script about: ${promptText}`,
      systemInstruction,
    });

    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (session?.user?.id) {
        await recordTokenUsage(
          session.user.id,
          "content_generate_script",
          response.tokens.input,
          response.tokens.output
        );

        await recordContentGeneration(
          session.user.id,
          "script",
          promptText,
          response.text
        );
      }
    } catch (dbErr) {
      console.warn("Could not persist script generation to DB:", dbErr);
    }

    return NextResponse.json({
      script: response.text,
      output: response.text,
      tokens: response.tokens,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate video script" },
      { status: 500 }
    );
  }
}
