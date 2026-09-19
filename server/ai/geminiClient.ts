import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import type { ChatMessage, StreamCallbacks, AttachmentItem } from "./types.ts";

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
  modelName: string = "gemini-3.8-flash",
  attachments?: AttachmentItem[]
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

  // Construct user parts with multimodal file handling
  const userParts: any[] = [];
  let userText = latestPrompt || "";

  if (attachments && attachments.length > 0) {
    for (const att of attachments) {
      if (!att.dataUrl) continue;
      const mimeType = att.type || "application/octet-stream";

      // Native Gemini inline binary support for images & PDFs
      if (mimeType.startsWith("image/") || mimeType === "application/pdf") {
        const base64Data = att.dataUrl.includes(",")
          ? att.dataUrl.split(",")[1]
          : att.dataUrl;
        userParts.push({
          inlineData: {
            mimeType: mimeType,
            data: base64Data,
          },
        });
      } else {
        // Document & code file extraction
        try {
          let textContent = "";
          if (att.dataUrl.startsWith("data:")) {
            const commaIdx = att.dataUrl.indexOf(",");
            const meta = att.dataUrl.slice(0, commaIdx);
            const raw = att.dataUrl.slice(commaIdx + 1);
            if (meta.includes(";base64")) {
              textContent = Buffer.from(raw, "base64").toString("utf-8");
            } else {
              textContent = decodeURIComponent(raw);
            }
          } else {
            textContent = att.dataUrl;
          }
          userText += `\n\n--- [Attached File: "${att.name || "document"}"] ---\n\`\`\`\n${textContent.slice(0, 60000)}\n\`\`\`\n`;
        } catch (decErr) {
          console.warn("Could not decode text attachment:", decErr);
        }
      }
    }
  }

  userParts.push({ text: userText.trim() || "Please analyze the attached document or file." });

  // Append current prompt with multimodal contents
  contents.push({
    role: "user",
    parts: userParts,
  });

  // Construct prioritized fallback list:
  // 1. Primary: gemini-3.1-flash-lite (fastest sub-second TTFT and response generation)
  // 2. High-capacity fallback: gemini-3.8-flash (with ThinkingLevel.LOW)
  // 3. Robust fallback: gemini-flash-latest
  let requestedModel = (modelName && modelName !== "gemini-2.5-flash") ? modelName : "gemini-3.1-flash-lite";
  if (requestedModel.includes("image")) {
    requestedModel = "gemini-3.1-flash-lite";
  }

  const candidatePool = [
    requestedModel,
    "gemini-3.1-flash-lite",
    "gemini-3.8-flash",
    "gemini-flash-latest",
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
  const overallStartTime = Date.now();

  for (const candidate of candidateModels) {
    const candidateStartTime = Date.now();
    let chunkEmitted = false;
    let fullAccumulated = "";
    let firstTokenTime: number | null = null;

    // Ultra-low-latency configuration:
    // - gemini-3.1-flash-lite: ThinkingLevel.MINIMAL (sub-second TTFT ~1s)
    // - gemini-3.8-flash / flash-latest: ThinkingLevel.LOW (low-latency reasoning ~2-4s)
    const modelConfig: any = {
      systemInstruction,
      temperature: 0.7,
    };

    if (candidate === "gemini-3.1-flash-lite" || candidate.includes("lite")) {
      modelConfig.thinkingConfig = { thinkingLevel: ThinkingLevel.MINIMAL };
    } else if (candidate.includes("3.8") || candidate.includes("flash")) {
      modelConfig.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
    }

    try {
      console.log(`[Gemini Stream] Connecting with model: ${candidate}...`);
      let responseStream;
      try {
        responseStream = await ai.models.generateContentStream({
          model: candidate,
          contents,
          config: modelConfig,
        });
      } catch (configErr: any) {
        // If thinkingConfig isn't accepted by a specific model alias, strip and retry immediately
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
          if (!chunkEmitted) {
            firstTokenTime = Date.now() - candidateStartTime;
            console.log(`[Gemini Stream] ${candidate} First token received in ${firstTokenTime}ms`);
          }
          chunkEmitted = true;
          fullAccumulated += textChunk;
          callbacks.onChunk(textChunk);
        }
      }

      if (chunkEmitted) {
        const totalDuration = Date.now() - overallStartTime;
        console.log(`[Gemini Stream] ${candidate} finished successfully in ${totalDuration}ms total`);
        safeFinish(fullAccumulated, {
          model: candidate,
          provider: "gemini",
        });
        return;
      }

      // If stream finished without yielding text and without throwing, try quick unary generateContent
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
      console.warn(`[Gemini Stream] Model ${candidate} failed: ${lastError.message}`);

      // If chunks were already partially emitted to user, do not restart with another model mid-stream
      if (chunkEmitted) {
        safeFinish(fullAccumulated, {
          model: candidate,
          provider: "gemini",
        });
        return;
      }

      // Rate limit / Quota reached: Immediately advance to the next candidate model or provider without waiting
      const isQuota = isTransientError(lastError) && (
        lastError.message.includes("429") ||
        lastError.message.includes("resource_exhausted") ||
        lastError.message.includes("quota")
      );

      if (!isQuota) {
        // Only brief pause for network transport hiccups
        await sleep(150);
      }
    }
  }

  if (lastError) {
    const friendlyMsg = formatFriendlyErrorMessage(lastError);
    safeError(new Error(friendlyMsg));
  }
}

