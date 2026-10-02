import { GoogleGenerativeAI } from "@google/generative-ai";

function getApiKey(): string {
  const rawKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
  return rawKey.trim();
}

export const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash";

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
 * Generate AI content with token usage estimation and multi-model retries
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
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured or is empty. Please set a valid key in your server .env file.");
  }

  const modelsToTry = [
    modelName,
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-flash-latest",
    "gemini-3.1-pro-preview",
    "gemini-3.8-flash",
    "gemini-3.6-flash"
  ];
  const uniqueModels = Array.from(new Set(modelsToTry.filter(Boolean)));

  let lastError: Error | null = null;

  for (const targetModel of uniqueModels) {
    try {
      const model = getGeminiModel(targetModel, systemInstruction);
      const estimatedInputTokens = estimateTokenCount(prompt + (systemInstruction || ""));
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      if (responseText && responseText.trim().length > 0) {
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
    } catch (err: any) {
      lastError = err;
      console.error(`[Gemini API Error] Model '${targetModel}' execution failed:`, err.message || err);
    }
  }

  throw new Error(
    `Gemini API execution failed across all models (${uniqueModels.join(", ")}): ${lastError?.message || "No content generated"}`
  );
}
