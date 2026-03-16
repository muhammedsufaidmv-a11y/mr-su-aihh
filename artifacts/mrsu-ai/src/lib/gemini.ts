import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? (process as any).env?.GEMINI_API_KEY : undefined);

let ai: GoogleGenAI | null = null;

export function getAI(): GoogleGenAI {
  if (!ai) {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

export async function generateText(prompt: string, systemInstruction?: string): Promise<string> {
  const client = getAI();
  const response = await client.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
    config: systemInstruction ? { systemInstruction } : undefined,
  });
  return response.text ?? "";
}

export async function generateStream(
  prompt: string,
  onChunk: (text: string) => void,
  systemInstruction?: string
): Promise<void> {
  const client = getAI();
  const stream = await client.models.generateContentStream({
    model: "gemini-2.0-flash",
    contents: prompt,
    config: systemInstruction ? { systemInstruction } : undefined,
  });
  for await (const chunk of stream) {
    if (chunk.text) onChunk(chunk.text);
  }
}
