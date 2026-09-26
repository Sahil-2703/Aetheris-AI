import { GoogleGenerativeAI } from "@google/generative-ai";

function getApiKey(): string {
  const rawKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
  return rawKey.trim();
}

export function getGeminiModel(modelName: string = "gemini-1.5-flash") {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in environment variables");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: modelName });
}
