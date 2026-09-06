import fs from "fs";
import path from "path";
import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";
import { db, MediaRecord } from "../db.ts";

const MEDIA_ROOT_DIR = path.join(process.cwd(), "data", "media");

let geminiInstance: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured on the server.");
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

export function ensureUserMediaDir(userId: string): string {
  const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, "_");
  const userDir = path.join(MEDIA_ROOT_DIR, safeUserId);
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }
  return userDir;
}

export function getFriendlyMultimodalError(err: unknown, modality: "image" | "video" | "audio"): string {
  if (!err) return `An unexpected error occurred during ${modality} generation.`;
  const msg = err instanceof Error ? err.message : String(err);
  const lower = msg.toLowerCase();

  if (lower.includes("429") || lower.includes("resource_exhausted") || lower.includes("quota exceeded")) {
    return `Gemini API quota exceeded for ${modality} generation. Google's Nano Banana and Veo models require a project with billing or quota enabled. Please check your Gemini API plan.`;
  }
  if (lower.includes("safety") || lower.includes("blocked") || lower.includes("filtered")) {
    return `The request or generated ${modality} was restricted by Gemini safety policies. Please rephrase your prompt.`;
  }
  if (lower.includes("503") || lower.includes("unavailable") || lower.includes("high demand")) {
    return `Gemini ${modality} generation servers are currently experiencing high demand. Please try again shortly.`;
  }
  if (lower.includes("api_key") || lower.includes("missing")) {
    return "GEMINI_API_KEY is not configured or is invalid on the server.";
  }
  return `Failed to process ${modality} generation. (${msg.slice(0, 140)})`;
}

// =============================================================================
// IMAGE GENERATION & EDITING (Nano Banana models)
// =============================================================================

export interface GenerateImageParams {
  userId: string;
  conversationId?: string;
  messageId?: string;
  prompt: string;
  sourceImageBase64?: string;
  sourceImageMimeType?: string;
  aspectRatio?: "1:1" | "16:9" | "9:16" | "4:3" | "3:4";
}

export interface GeneratedImageResult {
  mediaId: string;
  url: string;
  prompt: string;
  model: string;
  mimeType: string;
  aspectRatio: string;
  width?: number;
  height?: number;
}

export async function generateImage(params: GenerateImageParams): Promise<GeneratedImageResult> {
  const {
    userId,
    conversationId,
    messageId,
    prompt,
    sourceImageBase64,
    sourceImageMimeType,
    aspectRatio = "1:1",
  } = params;

  const ai = getGeminiClient();

  // Model selection: Prioritize fast Nano Banana (gemini-3.1-flash-lite-image) with fallback to gemini-3.1-flash-image
  const configuredModel = process.env.GEMINI_IMAGE_MODEL || "gemini-3.1-flash-lite-image";
  const candidateModels = [
    configuredModel,
    "gemini-3.1-flash-lite-image",
    "gemini-3.1-flash-image",
  ].filter((v, i, a) => a.indexOf(v) === i);

  let lastError: Error | null = null;
  let chosenModel = configuredModel;
  let imageBase64: string | null = null;
  let imageMimeType: string = "image/png";

  for (const model of candidateModels) {
    try {
      console.log(`[Multimodal] Generating image with model: ${model}, prompt: "${prompt.slice(0, 50)}..."`);

      const parts: any[] = [];
      if (sourceImageBase64) {
        // Image-to-image / editing request
        parts.push({
          inlineData: {
            data: sourceImageBase64.replace(/^data:[^;]+;base64,/, ""),
            mimeType: sourceImageMimeType || "image/png",
          },
        });
        parts.push({
          text: `Please edit this image according to the following instruction: ${prompt}`,
        });
      } else {
        // Text-to-image request
        parts.push({ text: prompt });
      }

      const response = await ai.models.generateContent({
        model,
        contents: {
          parts,
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any,
          },
        },
      });

      const candidateParts = response.candidates?.[0]?.content?.parts || [];
      for (const part of candidateParts) {
        if (part.inlineData?.data) {
          imageBase64 = part.inlineData.data;
          imageMimeType = part.inlineData.mimeType || "image/png";
          break;
        }
      }

      if (imageBase64) {
        chosenModel = model;
        break;
      } else {
        throw new Error("Gemini returned a response without image content.");
      }
    } catch (err: any) {
      console.warn(`[Multimodal] Failed image generation with ${model}:`, err.message);
      lastError = err;
      if (err.message?.includes("RESOURCE_EXHAUSTED") || err.message?.includes("429")) {
        // Quota error affects both models under the same project
        break;
      }
    }
  }

  if (!imageBase64) {
    throw new Error(getFriendlyMultimodalError(lastError, "image"));
  }

  // Persist image to disk in secure per-user folder
  const userDir = ensureUserMediaDir(userId);
  const mediaId = `img_${crypto.randomUUID()}`;
  const ext = imageMimeType.includes("jpeg") || imageMimeType.includes("jpg") ? "jpg" : "png";
  const fileName = `${mediaId}.${ext}`;
  const filePath = path.join(userDir, fileName);

  const buffer = Buffer.from(imageBase64, "base64");
  fs.writeFileSync(filePath, buffer);

  // Store in database
  const record = db.createMediaRecord({
    userId,
    conversationId,
    messageId,
    type: "image",
    prompt,
    model: chosenModel,
    status: "completed",
    fileName,
    filePath,
    mimeType: imageMimeType,
    aspectRatio,
  });

  return {
    mediaId: record.id,
    url: `/api/media/${record.id}`,
    prompt,
    model: chosenModel,
    mimeType: imageMimeType,
    aspectRatio,
  };
}

// =============================================================================
// VIDEO GENERATION (Veo 3.1 models - Asynchronous Flow)
// =============================================================================

export interface StartVideoParams {
  userId: string;
  conversationId?: string;
  messageId?: string;
  prompt: string;
  sourceImageBase64?: string;
  sourceImageMimeType?: string;
  aspectRatio?: "16:9" | "9:16";
  durationSeconds?: 4 | 6 | 8;
}

export interface VideoJobResult {
  mediaId: string;
  operationName: string;
  prompt: string;
  model: string;
  status: "processing";
  aspectRatio: string;
  durationSeconds: number;
}

export async function startVideoGeneration(params: StartVideoParams): Promise<VideoJobResult> {
  const {
    userId,
    conversationId,
    messageId,
    prompt,
    sourceImageBase64,
    sourceImageMimeType,
    aspectRatio = "16:9",
    durationSeconds = 8,
  } = params;

  const ai = getGeminiClient();

  const configuredModel = process.env.GEMINI_VIDEO_MODEL || "veo-3.1-generate-preview";
  const candidateModels = [
    configuredModel,
    "veo-3.1-generate-preview",
    "veo-3.1-lite-generate-preview",
  ].filter((v, i, a) => a.indexOf(v) === i);

  let lastError: Error | null = null;
  let chosenModel = configuredModel;
  let operation: any = null;

  for (const model of candidateModels) {
    try {
      console.log(`[Multimodal] Starting video generation with model: ${model}, prompt: "${prompt.slice(0, 50)}..."`);

      const source: any = { prompt };
      if (sourceImageBase64) {
        source.image = {
          imageBytes: sourceImageBase64.replace(/^data:[^;]+;base64,/, ""),
          mimeType: sourceImageMimeType || "image/png",
        };
      }

      operation = await ai.models.generateVideos({
        model,
        source,
        config: {
          numberOfVideos: 1,
          resolution: "720p",
          aspectRatio,
          durationSeconds,
        },
      });

      if (operation && operation.name) {
        chosenModel = model;
        break;
      }
    } catch (err: any) {
      console.warn(`[Multimodal] Failed video initiation with ${model}:`, err.message);
      lastError = err;
      if (err.message?.includes("RESOURCE_EXHAUSTED") || err.message?.includes("429")) {
        break;
      }
    }
  }

  if (!operation || !operation.name) {
    throw new Error(getFriendlyMultimodalError(lastError, "video"));
  }

  // Create pending/processing media record
  const record = db.createMediaRecord({
    userId,
    conversationId,
    messageId,
    type: "video",
    prompt,
    model: chosenModel,
    status: "processing",
    operationName: operation.name,
    mimeType: "video/mp4",
    aspectRatio,
    durationSeconds,
  });

  return {
    mediaId: record.id,
    operationName: operation.name,
    prompt,
    model: chosenModel,
    status: "processing",
    aspectRatio,
    durationSeconds,
  };
}

export async function checkVideoStatus(
  mediaId: string,
  userId: string
): Promise<{
  mediaId: string;
  status: "processing" | "completed" | "failed";
  url?: string;
  error?: string;
  progressPercent?: number;
}> {
  const record = db.getMediaRecord(mediaId, userId);
  if (!record) {
    throw new Error("Media record not found or unauthorized access.");
  }

  // If already completed or failed, return cached status
  if (record.status === "completed") {
    return {
      mediaId: record.id,
      status: "completed",
      url: `/api/media/${record.id}`,
    };
  }

  if (record.status === "failed") {
    return {
      mediaId: record.id,
      status: "failed",
      error: record.error || "Video generation failed.",
    };
  }

  if (!record.operationName) {
    return {
      mediaId: record.id,
      status: "failed",
      error: "No active operation associated with this video generation.",
    };
  }

  const ai = getGeminiClient();

  try {
    const op = await ai.operations.getVideosOperation({
      operation: { name: record.operationName } as any,
    });

    if (!op.done) {
      return {
        mediaId: record.id,
        status: "processing",
        progressPercent: 50,
      };
    }

    if (op.error) {
      const errMsg = typeof op.error === "object" && op.error !== null && "message" in op.error
        ? String((op.error as any).message)
        : "Video rendering error";
      const friendlyErr = getFriendlyMultimodalError(new Error(errMsg), "video");
      db.updateMediaRecord(record.id, {
        status: "failed",
        error: friendlyErr,
      });
      return {
        mediaId: record.id,
        status: "failed",
        error: friendlyErr,
      };
    }

    const downloadUri = op.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadUri) {
      const errText = "Video generation completed but no video URI was returned.";
      db.updateMediaRecord(record.id, {
        status: "failed",
        error: errText,
      });
      return {
        mediaId: record.id,
        status: "failed",
        error: errText,
      };
    }

    // Download video stream server-side using GEMINI_API_KEY
    const apiKey = process.env.GEMINI_API_KEY!;
    const downloadRes = await fetch(downloadUri, {
      headers: {
        "x-goog-api-key": apiKey,
      },
    });

    if (!downloadRes.ok) {
      throw new Error(`Failed to download video file from Gemini service (HTTP ${downloadRes.status})`);
    }

    const arrayBuffer = await downloadRes.arrayBuffer();
    const userDir = ensureUserMediaDir(userId);
    const fileName = `${record.id}.mp4`;
    const filePath = path.join(userDir, fileName);

    fs.writeFileSync(filePath, Buffer.from(arrayBuffer));

    db.updateMediaRecord(record.id, {
      status: "completed",
      fileName,
      filePath,
      mimeType: "video/mp4",
    });

    return {
      mediaId: record.id,
      status: "completed",
      url: `/api/media/${record.id}`,
    };
  } catch (err: any) {
    console.error("[Multimodal] Error checking video status:", err);
    return {
      mediaId: record.id,
      status: "processing", // Don't fail immediately on transient network checks
      error: err.message,
    };
  }
}

// =============================================================================
// SPEECH TO TEXT TRANSCRIPTION (Server-Side Fallback / Direct Processing)
// =============================================================================

export async function transcribeAudioBuffer(
  audioBuffer: Buffer,
  mimeType: string = "audio/webm"
): Promise<string> {
  const ai = getGeminiClient();

  const model = "gemini-3.8-flash";
  const base64Data = audioBuffer.toString("base64");

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
          {
            text: "Transcribe the spoken words in this audio exactly and concisely. Return ONLY the transcribed text. Do not add conversational prefixes, explanations, or quotes.",
          },
        ],
      },
    ],
  });

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return text.trim();
}
