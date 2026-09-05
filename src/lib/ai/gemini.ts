import { GoogleGenerativeAI } from "@google/generative-ai";

function getApiKey(): string {
  const rawKey = process.env.GEMINI_API_KEY || "";
  return rawKey.trim();
}

export const DEFAULT_GEMINI_MODEL = "gemini-3.6-flash";

export function getGeminiModel(
  modelName: string = DEFAULT_GEMINI_MODEL,
  systemInstruction?: string
) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in environment variables");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: systemInstruction ? systemInstruction : undefined,
  });
}

/**
 * Estimates token count from text using character heuristic (approx 4 chars per token)
 */
export function estimateTokenCount(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

/**
 * Generate AI content with token usage estimation and strict system instructions
 */
export async function generateAIContent({
  prompt,
  systemInstruction,
  modelName = DEFAULT_GEMINI_MODEL,
}: {
  prompt: string;
  systemInstruction?: string;
  modelName?: string;
}) {
  const model = getGeminiModel(modelName, systemInstruction);
  
  const estimatedInputTokens = estimateTokenCount(prompt + (systemInstruction || ""));
  
  const result = await model.generateContent(prompt);

  const responseText = result.response.text();
  const estimatedOutputTokens = estimateTokenCount(responseText);

  return {
    text: responseText,
    tokens: {
      input: estimatedInputTokens,
      output: estimatedOutputTokens,
      total: estimatedInputTokens + estimatedOutputTokens,
    },
  };
}
