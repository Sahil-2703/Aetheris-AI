import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";
import { generateAIContent } from "@/lib/ai/gemini";
import { recordContentGeneration, recordTokenUsage } from "@/lib/supabase/server";
import { getSystemInstructionForMode } from "@/lib/ai/prompts";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      message, 
      prompt, 
      code, 
      topic, 
      content, 
      details, 
      mode, 
      systemInstruction: customSystemInstruction 
    } = body;

    const userPrompt = message || prompt || code || topic || content || details;

    if (!userPrompt) {
      return NextResponse.json(
        { error: "Message or prompt content is required" },
        { status: 400 }
      );
    }

    // Determine target system instruction based on mode or explicit custom instruction
    const systemInstruction = getSystemInstructionForMode(mode || "general", customSystemInstruction);

    const response = await generateAIContent({
      prompt: userPrompt,
      systemInstruction,
    });

    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (session?.user?.id) {
        // 1. Record token usage
        await recordTokenUsage(
          session.user.id,
          `chat_${mode || "general"}`,
          response.tokens.input,
          response.tokens.output
        );

        // 2. Persist conversation / generation in Supabase database
        await recordContentGeneration(
          session.user.id,
          mode || "chat",
          userPrompt,
          response.text
        );
      }
    } catch (dbErr) {
      console.warn("Could not persist chat content generation to DB:", dbErr);
    }

    return NextResponse.json({
      reply: response.text,
      output: response.text,
      tokens: response.tokens,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate AI response" },
      { status: 500 }
    );
  }
}
