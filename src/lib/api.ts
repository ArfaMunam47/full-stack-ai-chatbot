import {
  Conversation,
  Message,
  User,
  UserSettings,
  MemoryItem,
  UsageStats,
  ArfaKnowledgeProfile,
  MessageAttachment,
} from "../types.ts";

const AUTH_TOKEN_KEY = "arfa_auth_token";
const GUEST_SESSION_KEY = "arfa_guest_session_id";

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

export function getGuestSessionId(): string {
  let id = localStorage.getItem(GUEST_SESSION_KEY);
  if (!id || !id.startsWith("guest_")) {
    id = `guest_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
    localStorage.setItem(GUEST_SESSION_KEY, id);
  }
  return id;
}

export function resetGuestSession(): string {
  const newId = `guest_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
  localStorage.setItem(GUEST_SESSION_KEY, newId);
  return newId;
}

function getHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else {
    headers["x-guest-session-id"] = getGuestSessionId();
  }
  return headers;
}

// Secure client fetch wrapper ensuring HttpOnly cookies and authorization tokens
async function secureFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  return fetch(input, {
    credentials: "include",
    ...init,
    headers: {
      ...getHeaders(),
      ...(init?.headers || {}),
    },
  });
}

export const api = {
  // Auth
  async getCurrentUser(): Promise<User | null> {
    try {
      const res = await secureFetch("/api/auth/me");
      if (!res.ok) return null;
      const user = await res.json();
      if (!user || user.isGuest) return null;
      return user;
    } catch {
      return null;
    }
  },

  async login(email: string, password: string): Promise<User> {
    const res = await secureFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    if (data.token) {
      setAuthToken(data.token);
    }
    return data.user;
  },

  async register(email: string, password: string, name: string): Promise<User> {
    const res = await secureFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");
    if (data.token) {
      setAuthToken(data.token);
    }
    return data.user;
  },

  async googleAuth(payload: { credential?: string; email?: string; name?: string; googleId?: string; avatar?: string }): Promise<User> {
    const res = await secureFetch("/api/auth/google", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Google authentication failed");
    if (data.token) {
      setAuthToken(data.token);
    }
    return data.user;
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string; code?: string }> {
    const res = await secureFetch("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Password reset request failed");
    return data;
  },

  async resetPassword(email: string, code: string, newPassword: string): Promise<User | null> {
    const res = await secureFetch("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, code, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Password reset failed");
    if (data.token) {
      setAuthToken(data.token);
    }
    return data.user || null;
  },

  async logout(): Promise<void> {
    await secureFetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setAuthToken(null);
    resetGuestSession();
  },

  // Conversations
  async getConversations(searchQuery?: string): Promise<Conversation[]> {
    const url = searchQuery
      ? `/api/conversations?q=${encodeURIComponent(searchQuery)}`
      : "/api/conversations";
    const res = await secureFetch(url);
    if (!res.ok) throw new Error("Failed to fetch conversations");
    return res.json();
  },

  async getConversation(id: string): Promise<Conversation & { messages: Message[] }> {
    const res = await secureFetch(`/api/conversations/${id}`);
    if (!res.ok) throw new Error("Failed to fetch conversation");
    return res.json();
  },

  async createConversation(title?: string): Promise<Conversation> {
    const res = await secureFetch("/api/conversations", {
      method: "POST",
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error("Failed to create conversation");
    return res.json();
  },

  async updateConversation(id: string, title: string): Promise<Conversation> {
    const res = await secureFetch(`/api/conversations/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error("Failed to update conversation");
    return res.json();
  },

  async renameConversation(id: string, title: string): Promise<Conversation> {
    return this.updateConversation(id, title);
  },

  async deleteConversation(id: string): Promise<void> {
    const res = await secureFetch(`/api/conversations/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete conversation");
  },

  async deleteAllConversations(): Promise<void> {
    const res = await secureFetch("/api/conversations", {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to clear conversations");
  },

  // Memories
  async getMemories(): Promise<MemoryItem[]> {
    const res = await secureFetch("/api/memories");
    if (!res.ok) throw new Error("Failed to load memories");
    return res.json();
  },

  async addMemory(category: MemoryItem["category"], content: string): Promise<MemoryItem> {
    const res = await secureFetch("/api/memories", {
      method: "POST",
      body: JSON.stringify({ category, content }),
    });
    if (!res.ok) throw new Error("Failed to add memory");
    return res.json();
  },

  async deleteMemory(id: string): Promise<void> {
    const res = await secureFetch(`/api/memories/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete memory");
  },

  async clearMemories(): Promise<void> {
    const res = await secureFetch("/api/memories", {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to clear memories");
  },

  // Settings
  async getSettings(): Promise<UserSettings> {
    const res = await secureFetch("/api/settings");
    if (!res.ok) throw new Error("Failed to load settings");
    return res.json();
  },

  async updateSettings(updates: Partial<UserSettings>): Promise<UserSettings> {
    const res = await secureFetch("/api/settings", {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update settings");
    return res.json();
  },

  // Usage & Observability
  async getUsage(): Promise<UsageStats> {
    const res = await secureFetch("/api/usage");
    if (!res.ok) throw new Error("Failed to load usage stats");
    return res.json();
  },

  // Arfa Knowledge Profile
  async getKnowledge(): Promise<ArfaKnowledgeProfile> {
    const res = await secureFetch("/api/knowledge");
    if (!res.ok) throw new Error("Failed to load Arfa knowledge profile");
    return res.json();
  },

  // Upload file
  async uploadFile(file: File): Promise<MessageAttachment> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const res = await secureFetch("/api/upload", {
            method: "POST",
            body: JSON.stringify({
              name: file.name,
              type: file.type,
              size: file.size,
              dataUrl: reader.result as string,
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "File upload failed");
          resolve(data);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  },

  // Multimodal Generation & Processing
  async generateImage(payload: {
    prompt: string;
    conversationId?: string;
    aspectRatio?: "1:1" | "16:9" | "9:16" | "4:3" | "3:4";
    sourceImageBase64?: string;
    sourceImageMimeType?: string;
  }): Promise<{
    mediaId: string;
    url: string;
    prompt: string;
    model: string;
    mimeType: string;
    aspectRatio: string;
  }> {
    const res = await secureFetch("/api/generate-image", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Image generation failed");
    return data;
  },

  async generateVideo(payload: {
    prompt: string;
    conversationId?: string;
    aspectRatio?: "16:9" | "9:16";
    durationSeconds?: 4 | 6 | 8;
    sourceImageBase64?: string;
    sourceImageMimeType?: string;
  }): Promise<{
    mediaId: string;
    operationName: string;
    prompt: string;
    model: string;
    status: "processing";
    aspectRatio: string;
    durationSeconds: number;
  }> {
    const res = await secureFetch("/api/generate-video", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Video generation failed");
    return data;
  },

  async checkVideoStatus(mediaId: string): Promise<{
    mediaId: string;
    status: "processing" | "completed" | "failed";
    url?: string;
    error?: string;
    progressPercent?: number;
  }> {
    const res = await secureFetch(`/api/video-status/${mediaId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to check video status");
    return data;
  },

  async transcribeAudio(audioBase64: string, mimeType: string = "audio/webm"): Promise<string> {
    const res = await secureFetch("/api/audio/transcribe", {
      method: "POST",
      body: JSON.stringify({ audioBase64, mimeType }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to transcribe audio");
    return data.text || "";
  },

  // Streaming SSE
  streamChat(
    payload: {
      conversationId?: string;
      message: string;
      attachments?: MessageAttachment[];
      provider?: "gemini" | "openai";
      modelName?: string;
      mode?: "chat" | "image" | "video" | "presentation";
    },
    options: {
      onInit?: (data: { conversationId: string; isNewConversation: boolean; userMessageId: string }) => void;
      onStatus?: (status: string) => void;
      onChunk: (chunk: string) => void;
      onError: (error: string) => void;
      onDone: (data: {
        messageId: string;
        fullText: string;
        model: string;
        media?: any[];
        videoJob?: { mediaId: string; operationName: string };
      }) => void;
      signal?: AbortSignal;
    }
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          credentials: "include",
          headers: getHeaders(),
          body: JSON.stringify(payload),
          signal: options.signal,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData.error || `HTTP error ${response.status}`;
          options.onError(errMsg);
          return reject(new Error(errMsg));
        }

        const reader = response.body?.getReader();
        if (!reader) {
          options.onError("Stream reader is not available.");
          return reject(new Error("Stream reader not available"));
        }

        const decoder = new TextDecoder();
        let buffer = "";

        let isDone = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const block of lines) {
            const trimmed = block.trim();
            if (trimmed.startsWith("data: ")) {
              try {
                const data = JSON.parse(trimmed.slice(6));
                if (data.type === "init" && options.onInit) {
                  options.onInit(data);
                } else if (data.type === "status" && options.onStatus) {
                  options.onStatus(data.status);
                } else if (data.type === "chunk") {
                  options.onChunk(data.chunk);
                } else if (data.type === "error") {
                  if (!isDone) {
                    options.onError(data.error);
                  }
                } else if (data.type === "done") {
                  if (!isDone) {
                    isDone = true;
                    options.onDone(data);
                  }
                  try {
                    await reader.cancel();
                  } catch {}
                  resolve();
                  return;
                }
              } catch (e) {
                console.warn("Failed to parse SSE line", trimmed, e);
              }
            }
          }
        }
        resolve();
      } catch (err: unknown) {
        if (options.signal?.aborted) {
          // Handled cancellation
          resolve();
        } else {
          // Only propagate error if we haven't successfully completed
          const errMsg = err instanceof Error ? err.message : "Network error";
          options.onError(errMsg);
          reject(err);
        }
      }
    });
  },
};
