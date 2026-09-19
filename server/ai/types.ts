export interface AttachmentItem {
  id?: string;
  name?: string;
  type?: string;
  size?: number;
  dataUrl?: string;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface StreamCallbacks {
  onChunk: (text: string) => void;
  onError: (err: Error) => void;
  onFinish: (fullText: string, metadata?: Record<string, unknown>) => void;
}

export interface AIProviderConfig {
  provider: "gemini" | "openai";
  modelName: string;
  apiKey?: string;
}

export const AI_TYPES_VERSION = "1.0.0";
