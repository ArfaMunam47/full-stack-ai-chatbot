import OpenAI from "openai";
import type { ChatMessage, StreamCallbacks, AttachmentItem } from "./types.ts";

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
  modelName: string = process.env.OPENAI_MODEL || "gpt-4o",
  attachments?: AttachmentItem[]
): Promise<void> {
  const openai = getOpenAIClient();
  const effectiveModel = sanitizeOpenAIModelName(modelName);

  let userText = latestPrompt || "";
  const contentParts: any[] = [];

  if (attachments && attachments.length > 0) {
    for (const att of attachments) {
      if (!att.dataUrl) continue;
      const mimeType = att.type || "";
      if (mimeType.startsWith("image/")) {
        contentParts.push({
          type: "image_url",
          image_url: { url: att.dataUrl },
        });
      } else {
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
        } catch {
          // ignore
        }
      }
    }
  }

  contentParts.push({ type: "text", text: userText.trim() || "Please analyze the attached file." });

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: systemInstruction },
    ...history.map((h) => ({
      role: h.role as "user" | "assistant" | "system",
      content: h.content,
    })),
    { role: "user", content: contentParts.length === 1 && contentParts[0].type === "text" ? contentParts[0].text : contentParts },
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
