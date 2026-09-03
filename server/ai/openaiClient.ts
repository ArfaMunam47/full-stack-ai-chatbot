import OpenAI from "openai";
import type { ChatMessage, StreamCallbacks } from "./types.ts";

let openaiInstance: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured on the server.");
  }
  if (!openaiInstance) {
    openaiInstance = new OpenAI({
      apiKey,
      timeout: 12000, // 12-second timeout to prevent 1-minute hangs
      maxRetries: 1,
    });
  }
  return openaiInstance;
}

export function isOpenAIConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim().length > 0);
}

/**
 * Normalizes OpenAI model name, stripping unintentional whitespace or trailing symbols
 */
export function sanitizeOpenAIModelName(name?: string): string {
  if (!name || typeof name !== "string") return "gpt-4o";
  const cleaned = name.trim().replace(/\s+/g, "");
  return cleaned || "gpt-4o";
}

export async function streamOpenAIChat(
  systemInstruction: string,
  history: ChatMessage[],
  latestPrompt: string,
  callbacks: StreamCallbacks,
  modelName: string = process.env.OPENAI_MODEL || "gpt-4o"
): Promise<void> {
  const openai = getOpenAIClient();
  const effectiveModel = sanitizeOpenAIModelName(modelName);

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: systemInstruction },
    ...history.map((h) => ({
      role: h.role as "user" | "assistant" | "system",
      content: h.content,
    })),
    { role: "user", content: latestPrompt },
  ];

  let chunkEmitted = false;
  let fullAccumulated = "";

  try {
    const stream = await openai.chat.completions.create({
      model: effectiveModel,
      messages,
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || "";
      if (delta) {
        chunkEmitted = true;
        fullAccumulated += delta;
        callbacks.onChunk(delta);
      }
    }

    if (!chunkEmitted && !fullAccumulated) {
      throw new Error("OpenAI stream completed with empty response.");
    }

    callbacks.onFinish(fullAccumulated, {
      model: effectiveModel,
      provider: "openai",
    });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.warn(`OpenAI streaming error (${effectiveModel}):`, error.message);

    // If no chunks were sent yet, rethrow so the caller can fall back smoothly
    if (!chunkEmitted) {
      throw error;
    }

    callbacks.onError(error);
  }
}
