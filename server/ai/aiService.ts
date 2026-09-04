import { streamGeminiChat, formatFriendlyErrorMessage } from "./geminiClient.ts";
import { streamOpenAIChat, isOpenAIConfigured } from "./openaiClient.ts";
import type { ChatMessage, StreamCallbacks } from "./types.ts";
import type { SystemPromptOptions } from "./systemPrompt.ts";
import { buildArfaSystemPrompt } from "./systemPrompt.ts";

export { formatFriendlyErrorMessage };


export interface ChatRequestOptions {
  history: ChatMessage[];
  message: string;
  provider?: "gemini" | "openai";
  modelName?: string;
  promptOptions?: SystemPromptOptions;
}

export async function executeStreamingChat(
  options: ChatRequestOptions,
  callbacks: StreamCallbacks
): Promise<void> {
  const { history, message, provider, modelName, promptOptions } = options;

  // Build the structured system prompt
  const systemInstruction = buildArfaSystemPrompt(promptOptions);

  // Determine provider preference:
  // If provider is explicitly specified as 'openai', or if DEFAULT_MODEL_PROVIDER is 'openai'
  const isExplicitOpenAI = provider === "openai";
  const isDefaultOpenAI = !provider && process.env.DEFAULT_MODEL_PROVIDER === "openai";
  const shouldTryOpenAI = (isExplicitOpenAI || isDefaultOpenAI) && isOpenAIConfigured();

  // Primary attempt based on provider preference
  if (shouldTryOpenAI) {
    const selectedModel = modelName || process.env.OPENAI_MODEL || "gpt-4o";
    try {
      console.log(`Attempting chat with OpenAI (${selectedModel})...`);
      await streamOpenAIChat(systemInstruction, history, message, callbacks, selectedModel);
      return;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(
        `OpenAI stream failed before emitting tokens (${errMsg}). Falling back to Gemini...`
      );
      // Fallback to Gemini
      const geminiModel = "gemini-3.8-flash";
      await streamGeminiChat(systemInstruction, history, message, callbacks, geminiModel);
      return;
    }
  }

  // Gemini primary flow (high-speed streaming)
  const selectedGeminiModel = modelName || "gemini-3.8-flash";
  try {
    await streamGeminiChat(systemInstruction, history, message, callbacks, selectedGeminiModel);
  } catch (geminiErr: unknown) {
    if (isOpenAIConfigured()) {
      const geminiMsg = geminiErr instanceof Error ? geminiErr.message : String(geminiErr);
      console.warn(
        `Gemini stream failed (${geminiMsg}). Seamlessly falling back to OpenAI...`
      );
      const openAiModel = process.env.OPENAI_MODEL || "gpt-4o";
      await streamOpenAIChat(systemInstruction, history, message, callbacks, openAiModel);
      return;
    }
    throw geminiErr;
  }
}

export function generateTitleFromMessage(userMessage: string): string {
  const cleaned = userMessage.trim().replace(/^["']|["']$/g, "");
  if (cleaned.length <= 36) {
    return cleaned;
  }
  // Extract first 5-7 words
  const words = cleaned.split(/\s+/).slice(0, 6).join(" ");
  return words.length < cleaned.length ? `${words}...` : words;
}
