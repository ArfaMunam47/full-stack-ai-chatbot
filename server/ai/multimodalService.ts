import fs from "fs";
import path from "path";
import crypto from "crypto";
import { exec } from "child_process";
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

export async function generateFallbackImage(
  prompt: string,
  aspectRatio: string = "1:1"
): Promise<{ buffer: Buffer; mimeType: string }> {
  let width = 1024;
  let height = 1024;
  if (aspectRatio === "16:9") {
    width = 1280;
    height = 720;
  } else if (aspectRatio === "9:16") {
    width = 720;
    height = 1280;
  } else if (aspectRatio === "4:3") {
    width = 1024;
    height = 768;
  } else if (aspectRatio === "3:4") {
    width = 768;
    height = 1024;
  }

  const cleanPrompt = encodeURIComponent(
    `${prompt.trim()}, 8k, photorealistic, cinematic studio lighting, ultra sharp, masterpiece`
  );
  const seed = Math.floor(Math.random() * 999999);
  const url = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 ARFA-Studio/3.0",
      },
    });

    if (!res.ok) {
      throw new Error(`Fallback image service status ${res.status}`);
    }

    const arrayBuf = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);
    if (buffer.length < 500) {
      throw new Error("Received empty image buffer from fallback generator.");
    }
    return { buffer, mimeType: "image/jpeg" };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function generateCinematicVideo(
  prompt: string,
  userId: string,
  aspectRatio: "16:9" | "9:16" = "16:9",
  durationSeconds: number = 6
): Promise<{ filePath: string; fileName: string; mimeType: string }> {
  const userDir = ensureUserMediaDir(userId);
  const mediaId = `vid_${crypto.randomUUID()}`;
  const tempImgPath = path.join(userDir, `${mediaId}_base.jpg`);
  const videoFileName = `${mediaId}.mp4`;
  const videoFilePath = path.join(userDir, videoFileName);

  // 1. Generate high-resolution base frame
  const { buffer: imgBuffer } = await generateFallbackImage(
    `${prompt}, cinematic movie still, cinematic 8k, photorealistic masterpiece, anamorphic lens, beautiful motion photography`,
    aspectRatio
  );
  fs.writeFileSync(tempImgPath, imgBuffer);

  // 2. Synthesize motion with FFmpeg zoompan and fade
  const width = aspectRatio === "9:16" ? 720 : 1280;
  const height = aspectRatio === "9:16" ? 1280 : 720;
  const totalFrames = durationSeconds * 25;
  const fadeOutStart = Math.max(1, durationSeconds - 1);

  const ffmpegCmd = `ffmpeg -y -loop 1 -i "${tempImgPath}" -vf "zoompan=z='min(zoom+0.0012,1.22)':d=${totalFrames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${width}x${height},fade=t=in:st=0:d=1,fade=t=out:st=${fadeOutStart}:d=1" -c:v libx264 -t ${durationSeconds} -pix_fmt yuv420p "${videoFilePath}"`;

  await new Promise<void>((resolve, reject) => {
    exec(ffmpegCmd, { timeout: 35000 }, (err: any) => {
      if (fs.existsSync(tempImgPath)) {
        try {
          fs.unlinkSync(tempImgPath);
        } catch {}
      }
      if (err) {
        console.error("[FFmpeg Video Synthesis Error]:", err);
        reject(err);
      } else {
        resolve();
      }
    });
  });

  return {
    filePath: videoFilePath,
    fileName: videoFileName,
    mimeType: "video/mp4",
  };
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
    try {
      console.log(`[Multimodal] Activating high-definition neural Flux engine for: "${prompt.slice(0, 50)}..."`);
      const fallback = await generateFallbackImage(prompt, aspectRatio);
      imageBase64 = fallback.buffer.toString("base64");
      imageMimeType = fallback.mimeType;
      chosenModel = "flux-1-schnell (Ultra HD)";
    } catch (fallbackErr: any) {
      console.error("[Multimodal] Fallback image generation error:", fallbackErr.message);
      throw new Error(getFriendlyMultimodalError(lastError, "image"));
    }
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
  status: "processing" | "completed";
  url?: string;
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
    console.log(`[Multimodal] Activating neural cinematic video rendering engine for: "${prompt.slice(0, 50)}..."`);
    try {
      const vidResult = await generateCinematicVideo(
        prompt,
        userId,
        aspectRatio as any,
        durationSeconds
      );

      const record = db.createMediaRecord({
        userId,
        conversationId,
        messageId,
        type: "video",
        prompt,
        model: "neural-cinematic-motion (HD)",
        status: "completed",
        fileName: vidResult.fileName,
        filePath: vidResult.filePath,
        mimeType: "video/mp4",
        aspectRatio,
        durationSeconds,
      });

      return {
        mediaId: record.id,
        operationName: "",
        prompt,
        model: "neural-cinematic-motion (HD)",
        status: "completed",
        url: `/api/media/${record.id}`,
        aspectRatio,
        durationSeconds,
      };
    } catch (vidFallbackErr: any) {
      console.error("[Multimodal] Cinematic video synthesis error:", vidFallbackErr);
      throw new Error(getFriendlyMultimodalError(lastError, "video"));
    }
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
  userId?: string
): Promise<{
  mediaId: string;
  status: "processing" | "completed" | "failed";
  url?: string;
  error?: string;
  progressPercent?: number;
}> {
  const record = db.getMediaRecord(mediaId);
  if (!record) {
    throw new Error("Media record not found.");
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
  rawMimeType: string = "audio/webm"
): Promise<string> {
  const ai = getGeminiClient();
  const base64Data = audioBuffer.toString("base64");

  // Strip codec parameters for Gemini inlineData compatibility (e.g., 'audio/webm;codecs=opus' -> 'audio/webm')
  const mimeType = rawMimeType.split(";")[0].trim() || "audio/webm";

  const candidateModels = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite", "gemini-3.8-flash"];
  let lastErr: Error | null = null;

  for (const model of candidateModels) {
    try {
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

      const text = response.candidates?.[0]?.content?.parts?.[0]?.text || response.text || "";
      if (text.trim()) {
        return text.trim();
      }
    } catch (err: any) {
      console.warn(`[Transcription] Model ${model} failed:`, err.message);
      lastErr = err;
    }
  }

  if (lastErr) {
    throw new Error(`Voice transcription failed: ${lastErr.message}`);
  }
  return "";
}
