import { GoogleGenAI } from "@google/genai";
import type { ChatMessage, StreamCallbacks } from "./types.ts";

let geminiInstance: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  if (!geminiInstance) {
    geminiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiInstance;
}

/**
 * Checks whether an error is transient (e.g. 503 high demand, 429 rate limit, network timeout)
 */
export function isTransientError(err: unknown): boolean {
  if (!err) return false;
  const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
  return (
    msg.includes("503") ||
    msg.includes("unavailable") ||
    msg.includes("high demand") ||
    msg.includes("spikes in demand") ||
    msg.includes("429") ||
    msg.includes("resource_exhausted") ||
    msg.includes("too many requests") ||
    msg.includes("rate limit") ||
    msg.includes("econnreset") ||
    msg.includes("etimedout") ||
    msg.includes("fetch failed") ||
    msg.includes("socket hang up")
  );
}

/**
 * Converts raw error objects / JSON strings into clean user-readable messages
 */
export function formatFriendlyErrorMessage(err: unknown): string {
  if (!err) return "An unexpected error occurred while generating a response.";
  const rawMsg = err instanceof Error ? err.message : String(err);
  const lower = rawMsg.toLowerCase();

  if (lower.includes("503") || lower.includes("high demand") || lower.includes("unavailable")) {
    return "Google Gemini is currently experiencing temporary high demand (503). Please try again in a few moments.";
  }
  if (lower.includes("429") || lower.includes("resource_exhausted") || lower.includes("too many requests")) {
    return "Rate limit reached. Please wait a moment before sending another message.";
  }
  if (lower.includes("gemini_api_key")) {
    return "GEMINI_API_KEY is not configured or is invalid.";
  }
  return "Arfa AI couldn't complete that response.";
}

const sleep = (ms: number) =>
  new Promise((r) => setTimeout(r, ms + Math.floor(Math.random() * 300)));

export async function streamGeminiChat(
  systemInstruction: string,
  history: ChatMessage[],
  latestPrompt: string,
  callbacks: StreamCallbacks,
  modelName: string = "gemini-3.8-flash"
): Promise<void> {
  const ai = getGeminiClient();

  // Convert history into Gemini contents format
  const contents = [];

  for (const msg of history) {
    if (msg.content && msg.content.trim()) {
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      });
    }
  }

  // Append current prompt
  contents.push({
    role: "user",
    parts: [{ text: latestPrompt }],
  });

  // Construct prioritized fallback list:
  // 1. Requested model (e.g. gemini-3.8-flash)
  // 2. gemini-3.1-flash-lite (high availability lightweight model)
  // 3. gemini-flash-latest (latest alias)
  const candidatePool = [
    modelName,
    "gemini-3.1-flash-lite",
    "gemini-flash-latest",
    "gemini-3.8-flash",
  ];

  const candidateModels: string[] = [];
  for (const candidate of candidatePool) {
    if (candidate && !candidateModels.includes(candidate)) {
      candidateModels.push(candidate);
    }
  }

  let hasFinished = false;
  const safeFinish = (text: string, meta?: Record<string, unknown>) => {
    if (hasFinished) return;
    hasFinished = true;
    callbacks.onFinish(text, meta);
  };

  const safeError = (err: Error) => {
    if (hasFinished) return;
    hasFinished = true;
    callbacks.onError(err);
  };

  let lastError: Error | null = null;
  const MAX_RETRIES_PER_MODEL = 2;

  for (const candidate of candidateModels) {
    for (let attempt = 0; attempt < MAX_RETRIES_PER_MODEL; attempt++) {
      let chunkEmitted = false;
      let fullAccumulated = "";

      // Low-latency configuration: set thinkingBudget to 0 so the model streams tokens immediately
      const modelConfig: any = {
        systemInstruction,
        temperature: 0.7,
      };

      if (candidate.includes("flash")) {
        modelConfig.thinkingConfig = { thinkingBudget: 0 };
      }

      try {
        let responseStream;
        try {
          responseStream = await ai.models.generateContentStream({
            model: candidate,
            contents,
            config: modelConfig,
          });
        } catch (configErr: any) {
          if (modelConfig.thinkingConfig) {
            delete modelConfig.thinkingConfig;
            responseStream = await ai.models.generateContentStream({
              model: candidate,
              contents,
              config: modelConfig,
            });
          } else {
            throw configErr;
          }
        }

        for await (const chunk of responseStream) {
          const textChunk = chunk.text || "";
          if (textChunk) {
            chunkEmitted = true;
            fullAccumulated += textChunk;
            callbacks.onChunk(textChunk);
          }
        }

        if (chunkEmitted) {
          safeFinish(fullAccumulated, {
            model: candidate,
            provider: "gemini",
          });
          return;
        }

        // If stream finished without yielding text, try unary generateContent
        const response = await ai.models.generateContent({
          model: candidate,
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        const unaryText = response.text || "";
        if (unaryText) {
          callbacks.onChunk(unaryText);
          safeFinish(unaryText, {
            model: candidate,
            provider: "gemini",
          });
          return;
        }
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.warn(
          `Model ${candidate} attempt ${attempt + 1}/${MAX_RETRIES_PER_MODEL} failed:`,
          lastError.message
        );

        // If chunks were already sent to user, we cannot switch models mid-flight
        if (chunkEmitted) {
          safeFinish(fullAccumulated, {
            model: candidate,
            provider: "gemini",
          });
          return;
        }

        // Try non-streaming fallback on the same model if this was a stream-transport failure
        try {
          const response = await ai.models.generateContent({
            model: candidate,
            contents,
            config: {
              systemInstruction,
              temperature: 0.7,
            },
          });
          const text = response.text || "";
          if (text) {
            callbacks.onChunk(text);
            safeFinish(text, {
              model: candidate,
              provider: "gemini",
            });
            return;
          }
        } catch {
          // Unary also failed, continue to retry or candidate fallback
        }

        // Check if transient error to apply backoff before next attempt
        if (isTransientError(lastError) && attempt < MAX_RETRIES_PER_MODEL - 1) {
          const backoffTime = 800 * (attempt + 1);
          await sleep(backoffTime);
        }
      }
    }

    // Brief delay before switching to the next candidate model
    await sleep(300);
  }

  if (lastError) {
    const friendlyMsg = formatFriendlyErrorMessage(lastError);
    safeError(new Error(friendlyMsg));
  }
}

