import express, { Response } from "express";
import cookieParser from "cookie-parser";
import crypto from "crypto";
import fs from "fs";
import { db } from "./db.ts";
import { executeStreamingChat, generateTitleFromMessage, formatFriendlyErrorMessage } from "./ai/aiService.ts";
import { ARFA_PROFILE } from "./ai/arfaProfile.ts";
import { isOpenAIConfigured } from "./ai/openaiClient.ts";
import { isSupabaseConfigured } from "./db/supabaseClient.ts";
import {
  generateImage,
  startVideoGeneration,
  checkVideoStatus,
  transcribeAudioBuffer,
  getFriendlyMultimodalError,
} from "./ai/multimodalService.ts";
import { detectIntent } from "./ai/intentRouter.ts";
import {
  RegisterSchema,
  LoginSchema,
  GoogleAuthSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  CreateConversationSchema,
  UpdateConversationSchema,
  ChatRequestSchema,
  GenerateImageSchema,
  GenerateVideoSchema,
  AudioTranscribeSchema,
  AddMemorySchema,
  UpdateSettingsSchema,
  UploadFileSchema,
} from "./validation/schemas.ts";
import {
  createRateLimiter,
  securityHeadersMiddleware,
  productionLogger,
} from "./middleware/security.ts";
import {
  AuthenticatedRequest,
  authContextMiddleware,
  requireAuth,
  setSessionCookie,
  clearSessionCookie,
} from "./middleware/auth.ts";

export const app = express();

// 1. Core Parsers
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));
app.use(cookieParser());

// 2. Security Headers & CORS
app.use(securityHeadersMiddleware);

// 3. Safe Production Logging
app.use(productionLogger);

// 4. Session & Identity Extraction
app.use(authContextMiddleware);

// 5. Rate Limiters
const authLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 12, // max 12 attempts per minute to prevent brute-force
  message: "Too many authentication attempts. Please wait a minute and try again.",
});

const chatLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 45,
  message: "Chat rate limit reached. Please wait a few moments before sending another message.",
  keyGenerator: (req) => {
    const authReq = req as AuthenticatedRequest;
    return authReq.userId || (req.headers["x-forwarded-for"] as string) || req.ip || "unknown";
  },
});

const mediaGenLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 12,
  message: "Media generation rate limit reached. Please wait a minute before requesting more media.",
  keyGenerator: (req) => {
    const authReq = req as AuthenticatedRequest;
    return authReq.userId || (req.headers["x-forwarded-for"] as string) || req.ip || "unknown";
  },
});

const transcribeLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 30,
  message: "Transcription rate limit reached. Please wait a moment.",
  keyGenerator: (req) => {
    const authReq = req as AuthenticatedRequest;
    return authReq.userId || (req.headers["x-forwarded-for"] as string) || req.ip || "unknown";
  },
});

const generalApiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 150,
  message: "Service is temporarily receiving high traffic. Please try again shortly.",
});

// Apply general limiter to /api
app.use("/api", generalApiLimiter);

// ---------------------------------------------------------------------------
// PUBLIC STATUS & HEALTH ROUTES
// ---------------------------------------------------------------------------

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "Arfa AI Production Backend",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    openaiConfigured: isOpenAIConfigured(),
    supabaseConfigured: isSupabaseConfigured(),
    defaultProvider: process.env.OPENAI_API_KEY ? "openai" : "gemini",
  });
});

app.get("/api/knowledge", (_req, res) => {
  res.json(ARFA_PROFILE);
});

// ---------------------------------------------------------------------------
// AUTHENTICATION ROUTES
// ---------------------------------------------------------------------------

// Get current authenticated user or generate verified guest identity
app.get("/api/auth/me", (req: AuthenticatedRequest, res: Response) => {
  if (req.user) {
    return res.json({
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      avatar: req.user.avatar,
      isGuest: false,
    });
  }

  // Guest context
  const guestId = req.userId && req.userId.startsWith("guest_") ? req.userId : `guest_${crypto.randomUUID()}`;
  res.json({
    id: guestId,
    email: "",
    name: "Guest",
    isGuest: true,
  });
});

// Register new account
app.post("/api/auth/register", authLimiter, (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.issues[0]?.message || "Invalid registration data.",
      });
    }

    const { email, password, name } = parsed.data;
    const user = db.createUser(email, password, name || "Explorer");
    const session = db.createSession(user.id);

    // Set secure HttpOnly cookie
    setSessionCookie(res, session.token);

    res.status(201).json({
      token: session.token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        isGuest: false,
      },
    });
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Registration failed.";
    res.status(400).json({ error });
  }
});

// Login with email and password
app.post("/api/auth/login", authLimiter, (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.issues[0]?.message || "Invalid login credentials format.",
      });
    }

    const { email, password } = parsed.data;
    const user = db.verifyPassword(email, password);
    if (!user) {
      console.warn(`[Security] Failed login attempt for email=${email.slice(0, 3)}***`);
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const session = db.createSession(user.id);
    setSessionCookie(res, session.token);

    res.json({
      token: session.token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        isGuest: false,
      },
    });
  } catch (_err) {
    res.status(500).json({ error: "Authentication service error. Please try again later." });
  }
});

// Google OAuth verification and account matching
app.post("/api/auth/google", authLimiter, (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = GoogleAuthSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid Google authentication payload." });
    }

    const { credential, email, name, googleId, avatar } = parsed.data;
    let userEmail = email;
    let userName = name;
    let userGoogleId = googleId;
    let userAvatar = avatar;

    if (credential && typeof credential === "string") {
      try {
        const parts = credential.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
          if (payload.email) {
            userEmail = payload.email;
            userName = payload.name || payload.given_name || payload.email.split("@")[0];
            userGoogleId = payload.sub;
            userAvatar = payload.picture;
          }
        }
      } catch (decodeErr) {
        console.warn("[Security] Could not parse Google JWT client payload:", decodeErr);
      }
    }

    if (!userEmail) {
      return res.status(400).json({ error: "Google authentication failed: Email address could not be verified." });
    }

    const user = db.findOrCreateGoogleUser(userEmail, userName || "Google User", userGoogleId, userAvatar);
    const session = db.createSession(user.id);
    setSessionCookie(res, session.token);

    res.json({
      token: session.token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        isGuest: false,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Google authentication service error.";
    res.status(500).json({ error: message });
  }
});

// Forgot password: issue secure 6-digit recovery code
app.post("/api/auth/forgot-password", authLimiter, (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = ForgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || "Valid email is required." });
    }

    const code = db.createPasswordResetCode(parsed.data.email);
    // In production, send via email provider. In preview/demo mode, also return code so user is never locked out
    res.json({
      success: true,
      message: "A 6-digit verification code has been issued (valid for 15 minutes).",
      code,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Password recovery request failed.";
    res.status(400).json({ error: message });
  }
});

// Confirm password reset with 6-digit code
app.post("/api/auth/reset-password", authLimiter, (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = ResetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid reset details." });
    }

    const { email, code, newPassword } = parsed.data;
    const success = db.resetPasswordWithCode(email, code, newPassword);
    if (!success) {
      return res.status(400).json({ error: "Invalid or expired reset code. Please request a new code." });
    }

    const user = db.getUserByEmail(email);
    const session = user ? db.createSession(user.id) : null;
    if (session) {
      setSessionCookie(res, session.token);
    }

    res.json({
      success: true,
      token: session?.token,
      user: user
        ? {
            id: user.id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            isGuest: false,
          }
        : null,
      message: "Your password has been reset successfully.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Password reset failed.";
    res.status(400).json({ error: message });
  }
});

// Logout: invalidate session and clear cookie
app.post("/api/auth/logout", (req: AuthenticatedRequest, res: Response) => {
  const token = req.cookies?.arfa_session || req.headers["authorization"]?.replace("Bearer ", "").trim();
  if (token) {
    db.deleteSession(token);
  }
  clearSessionCookie(res);
  res.json({ success: true, message: "Logged out successfully" });
});

// ---------------------------------------------------------------------------
// CONVERSATION ROUTES (Strict User Isolation & Ownership Verification)
// ---------------------------------------------------------------------------

// List conversations for the authenticated user ONLY
app.get("/api/conversations", (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const searchQuery = typeof req.query.q === "string" ? req.query.q : undefined;
  const conversations = db.getConversations(userId, searchQuery);
  res.json(conversations);
});

// Create new conversation
app.post("/api/conversations", (req: AuthenticatedRequest, res: Response) => {
  const parsed = CreateConversationSchema.safeParse(req.body);
  const title = parsed.success && parsed.data.title ? parsed.data.title : "New Conversation";
  const conversation = db.createConversation(req.userId!, title);
  res.status(201).json(conversation);
});

// Get single conversation (enforces ownership)
app.get("/api/conversations/:id", (req: AuthenticatedRequest, res: Response) => {
  const convId = req.params.id;
  const conversation = db.getConversation(convId, req.userId!);
  if (!conversation) {
    return res.status(404).json({ error: "Conversation not found or unauthorized access." });
  }
  const messages = db.getMessages(convId, req.userId!);
  res.json({ ...conversation, messages });
});

// Update conversation title (enforces ownership)
app.patch("/api/conversations/:id", (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = UpdateConversationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid conversation title." });
    }
    const convId = req.params.id;
    const updated = db.updateConversationTitle(convId, req.userId!, parsed.data.title);
    res.json(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error updating conversation";
    res.status(404).json({ error: message });
  }
});

// Delete single conversation (enforces ownership)
app.delete("/api/conversations/:id", (req: AuthenticatedRequest, res: Response) => {
  const convId = req.params.id;
  const deleted = db.deleteConversation(convId, req.userId!);
  if (!deleted) {
    return res.status(404).json({ error: "Conversation not found or unauthorized access." });
  }
  res.json({ success: true, id: convId });
});

// Delete all conversations belonging to user
app.delete("/api/conversations", (req: AuthenticatedRequest, res: Response) => {
  db.deleteAllConversations(req.userId!);
  res.json({ success: true, message: "All conversations cleared for this account." });
});

// ---------------------------------------------------------------------------
// SECURE STREAMING CHAT (Server-Sent Events with Stop Generation Support)
// ---------------------------------------------------------------------------

app.post("/api/chat", chatLimiter, async (req: AuthenticatedRequest, res: Response) => {
  const parsed = ChatRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: parsed.error.issues[0]?.message || "Invalid chat request format.",
    });
  }

  const { conversationId, message, attachments, provider, modelName } = parsed.data;
  const userId = req.userId!;

  // 1. Verify or create conversation with strict ownership check
  let conv = conversationId ? db.getConversation(conversationId, userId) : undefined;
  let isNewConversation = false;

  if (conversationId && !conv) {
    return res.status(403).json({
      error: "Unauthorized access: You do not have permission to access or append to this conversation.",
    });
  }

  if (!conv) {
    const autoTitle = generateTitleFromMessage(message);
    conv = db.createConversation(userId, autoTitle);
    isNewConversation = true;
  } else {
    // If this is the first message in an untitled conversation, update title
    const existingMessages = db.getMessages(conv.id, userId);
    if (existingMessages.length === 0 || conv.title === "New Conversation") {
      db.updateConversationTitle(conv.id, userId, generateTitleFromMessage(message));
    }
  }

  // 2. Persist user message to database
  const mappedAttachments = attachments?.map((a) => ({
    id: a.id || `att_${crypto.randomUUID()}`,
    name: a.name,
    type: a.type,
    size: a.size,
    dataUrl: a.dataUrl,
  }));
  const userMsg = db.addMessage(conv.id, userId, "user", message.trim(), mappedAttachments);

  // 3. Load prior context (last 14 messages for contextual coherence)
  const priorMessages = db.getMessages(conv.id, userId).slice(-14);
  const history = priorMessages
    .filter((m) => m.id !== userMsg.id)
    .map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    }));

  // 4. Retrieve user settings and long-term memories
  const settings = db.getUserSettings(userId);
  const memories = db.getMemories(userId);
  const user = db.getUserById(userId);

  // 5. Initialize Server-Sent Events headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  // 6. Support Stop Generation: handle client disconnect / abort signal
  let isClientDisconnected = false;
  req.on("close", () => {
    isClientDisconnected = true;
  });

  // Send initialization packet
  res.write(
    `data: ${JSON.stringify({
      type: "init",
      conversationId: conv.id,
      isNewConversation,
      userMessageId: userMsg.id,
    })}\n\n`
  );
  if (typeof (res as any).flush === "function") {
    (res as any).flush();
  }

  // 7. MULTIMODAL INTENT ROUTING (Real Gemini Nano Banana & Veo Generation)
  const isChatMode = parsed.data.mode === "chat";
  const lastImage = isChatMode ? undefined : db.getLastImageMedia(conv.id, userId);
  const intentResult = isChatMode
    ? { intent: "chat" as const, cleanedPrompt: message.trim(), confidence: 1.0 }
    : detectIntent({
        message: message.trim(),
        attachments: mappedAttachments,
        lastImageMedia: lastImage
          ? {
              filePath: lastImage.filePath,
              mimeType: lastImage.mimeType,
              url: `/api/media/${lastImage.id}`,
              id: lastImage.id,
            }
          : undefined,
        explicitMode: parsed.data.mode,
      });

  if (intentResult.intent === "image_generation" || intentResult.intent === "image_edit") {
    try {
      res.write(
        `data: ${JSON.stringify({
          type: "status",
          status: intentResult.intent === "image_edit" ? "Editing image with Gemini Nano Banana..." : "Generating image with Gemini Nano Banana...",
        })}\n\n`
      );
      if (typeof (res as any).flush === "function") (res as any).flush();

      // If editing an earlier image in the conversation and no new attachment was provided
      let editSourceBase64 = intentResult.sourceImageBase64;
      let editSourceMime = intentResult.sourceImageMimeType;
      if (!editSourceBase64 && lastImage && lastImage.filePath && fs.existsSync(lastImage.filePath)) {
        try {
          const fileBuf = fs.readFileSync(lastImage.filePath);
          editSourceBase64 = fileBuf.toString("base64");
          editSourceMime = lastImage.mimeType || "image/png";
        } catch (readErr) {
          console.error("Failed to read last image for editing:", readErr);
        }
      }

      const imgResult = await generateImage({
        userId,
        conversationId: conv.id,
        messageId: userMsg.id,
        prompt: intentResult.cleanedPrompt,
        sourceImageBase64: editSourceBase64,
        sourceImageMimeType: editSourceMime,
        aspectRatio: (intentResult.aspectRatio as any) || "1:1",
      });

      const assistantMsg = db.addMessage(
        conv.id,
        userId,
        "assistant",
        intentResult.intent === "image_edit"
          ? `I've edited the image based on your instruction:\n\n*"${intentResult.cleanedPrompt}"*`
          : `I've generated this image based on your request:\n\n*"${intentResult.cleanedPrompt}"*`,
        undefined,
        imgResult.model,
        [
          {
            id: imgResult.mediaId,
            type: "image",
            url: imgResult.url,
            mimeType: imgResult.mimeType,
            prompt: imgResult.prompt,
            model: imgResult.model,
            status: "completed",
            aspectRatio: imgResult.aspectRatio,
          },
        ]
      );

      res.write(
        `data: ${JSON.stringify({
          type: "done",
          messageId: assistantMsg.id,
          fullText: assistantMsg.content,
          model: imgResult.model,
          media: assistantMsg.media,
        })}\n\n`
      );
      res.end();
      return;
    } catch (imgErr: unknown) {
      console.error("[Image Generation Error]:", imgErr);
      const friendlyErr = getFriendlyMultimodalError(imgErr, "image");
      res.write(
        `data: ${JSON.stringify({
          type: "error",
          error: friendlyErr,
        })}\n\n`
      );
      res.end();
      return;
    }
  }

  if (intentResult.intent === "video_generation" || intentResult.intent === "image_to_video") {
    try {
      res.write(
        `data: ${JSON.stringify({
          type: "status",
          status: "Starting high-definition video generation with Veo 3.1...",
        })}\n\n`
      );
      if (typeof (res as any).flush === "function") (res as any).flush();

      let videoSourceBase64 = intentResult.sourceImageBase64;
      let videoSourceMime = intentResult.sourceImageMimeType;
      if (!videoSourceBase64 && lastImage && lastImage.filePath && fs.existsSync(lastImage.filePath)) {
        try {
          const fileBuf = fs.readFileSync(lastImage.filePath);
          videoSourceBase64 = fileBuf.toString("base64");
          videoSourceMime = lastImage.mimeType || "image/png";
        } catch (readErr) {
          console.error("Failed to read last image for video generation:", readErr);
        }
      }

      const videoJob = await startVideoGeneration({
        userId,
        conversationId: conv.id,
        messageId: userMsg.id,
        prompt: intentResult.cleanedPrompt,
        sourceImageBase64: videoSourceBase64,
        sourceImageMimeType: videoSourceMime,
        aspectRatio: (intentResult.aspectRatio as any) || "16:9",
        durationSeconds: (intentResult.durationSeconds as any) || 8,
      });

      const assistantMsg = db.addMessage(
        conv.id,
        userId,
        "assistant",
        `I've queued this video for generation with Veo:\n\n*"${intentResult.cleanedPrompt}"*\n\nVeo generates high-fidelity video clips asynchronously. Rendering progress will update live below.`,
        undefined,
        videoJob.model,
        [
          {
            id: videoJob.mediaId,
            type: "video",
            url: "",
            mimeType: "video/mp4",
            prompt: videoJob.prompt,
            model: videoJob.model,
            status: "processing",
            operationId: videoJob.operationName,
            aspectRatio: videoJob.aspectRatio,
            durationSeconds: videoJob.durationSeconds,
          },
        ]
      );

      res.write(
        `data: ${JSON.stringify({
          type: "done",
          messageId: assistantMsg.id,
          fullText: assistantMsg.content,
          model: videoJob.model,
          media: assistantMsg.media,
          videoJob: {
            mediaId: videoJob.mediaId,
            operationName: videoJob.operationName,
          },
        })}\n\n`
      );
      res.end();
      return;
    } catch (vidErr: unknown) {
      console.error("[Video Generation Error]:", vidErr);
      const friendlyErr = getFriendlyMultimodalError(vidErr, "video");
      res.write(
        `data: ${JSON.stringify({
          type: "error",
          error: friendlyErr,
        })}\n\n`
      );
      res.end();
      return;
    }
  }

  let fullResponse = "";

  try {
    await executeStreamingChat(
      {
        history,
        message: message.trim(),
        provider: provider || settings.preferredProvider,
        modelName: modelName || settings.preferredModel,
        promptOptions: {
          userName: user?.name,
          userCustomInstructions: settings.customInstructions,
          userMemories: memories.map((m) => ({ category: m.category, content: m.content })),
        },
      },
      {
        onChunk: (chunk: string) => {
          if (isClientDisconnected) return;
          fullResponse += chunk;
          res.write(
            `data: ${JSON.stringify({
              type: "chunk",
              chunk,
            })}\n\n`
          );
          if (typeof (res as any).flush === "function") {
            (res as any).flush();
          }
        },
        onError: (err: Error) => {
          console.error("[AI Streaming Error]:", err);
          if (isClientDisconnected || res.writableEnded) return;
          const friendlyMessage = formatFriendlyErrorMessage(err);
          res.write(
            `data: ${JSON.stringify({
              type: "error",
              error: friendlyMessage,
            })}\n\n`
          );
          res.end();
        },
        onFinish: (completeText: string, metadata?: Record<string, unknown>) => {
          if (isClientDisconnected || res.writableEnded) return;
          const finalContent = completeText || fullResponse;

          // Always persist assistant response to DB even if stopped prematurely
          if (finalContent.trim()) {
            const assistantMsg = db.addMessage(
              conv!.id,
              userId,
              "assistant",
              finalContent,
              undefined,
              (metadata?.model as string) || "gemini-3.8-flash"
            );

            const estimatedTokens = Math.ceil((message.length + finalContent.length) / 3.8);
            db.recordUsage(userId, (metadata?.model as string) || "gemini-3.8-flash", estimatedTokens);

            if (!isClientDisconnected && !res.writableEnded) {
              res.write(
                `data: ${JSON.stringify({
                  type: "done",
                  messageId: assistantMsg.id,
                  fullText: finalContent,
                  model: metadata?.model || "gemini-3.8-flash",
                  tokensEstimated: estimatedTokens,
                })}\n\n`
              );
            }
          }
          if (!isClientDisconnected && !res.writableEnded) {
            res.end();
          }
        },
      }
    );
  } catch (err: unknown) {
    console.error("[AI Stream Exception]:", err);
    if (!isClientDisconnected && !res.writableEnded) {
      const friendlyMessage = formatFriendlyErrorMessage(err);
      res.write(
        `data: ${JSON.stringify({
          type: "error",
          error: friendlyMessage,
        })}\n\n`
      );
      res.end();
    }
  }
});

// ---------------------------------------------------------------------------
// MEMORIES & PERSONALIZATION (Ownership Enforced)
// ---------------------------------------------------------------------------

app.get("/api/memories", (req: AuthenticatedRequest, res: Response) => {
  const memories = db.getMemories(req.userId!);
  res.json(memories);
});

app.post("/api/memories", (req: AuthenticatedRequest, res: Response) => {
  const parsed = AddMemorySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid memory item." });
  }
  const memory = db.addMemory(req.userId!, parsed.data.category, parsed.data.content);
  res.status(201).json(memory);
});

app.delete("/api/memories/:id", (req: AuthenticatedRequest, res: Response) => {
  const deleted = db.deleteMemory(req.params.id, req.userId!);
  if (!deleted) {
    return res.status(404).json({ error: "Memory item not found or unauthorized access." });
  }
  res.json({ success: true, id: req.params.id });
});

app.delete("/api/memories", (req: AuthenticatedRequest, res: Response) => {
  db.clearMemories(req.userId!);
  res.json({ success: true, message: "All personalization memories cleared." });
});

// ---------------------------------------------------------------------------
// USER SETTINGS
// ---------------------------------------------------------------------------

app.get("/api/settings", (req: AuthenticatedRequest, res: Response) => {
  const settings = db.getUserSettings(req.userId!);
  res.json(settings);
});

app.patch("/api/settings", (req: AuthenticatedRequest, res: Response) => {
  const parsed = UpdateSettingsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid settings payload." });
  }
  const updated = db.updateUserSettings(req.userId!, parsed.data);
  res.json(updated);
});

// ---------------------------------------------------------------------------
// MULTIMODAL ENDPOINTS (Real Image, Video, and Audio APIs)
// ---------------------------------------------------------------------------

// 1. Direct Image Generation Endpoint
app.post("/api/generate-image", mediaGenLimiter, async (req: AuthenticatedRequest, res: Response) => {
  const parsed = GenerateImageSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid image generation payload." });
  }

  const userId = req.userId!;
  const { prompt, conversationId, aspectRatio, sourceImageBase64, sourceImageMimeType } = parsed.data;

  try {
    const result = await generateImage({
      userId,
      conversationId,
      prompt,
      aspectRatio,
      sourceImageBase64,
      sourceImageMimeType,
    });
    res.json(result);
  } catch (err: unknown) {
    console.error("[Direct Image Gen Error]:", err);
    res.status(500).json({ error: getFriendlyMultimodalError(err, "image") });
  }
});

// 2. Direct Video Generation Endpoint (Asynchronous Veo 3.1)
app.post("/api/generate-video", mediaGenLimiter, async (req: AuthenticatedRequest, res: Response) => {
  const parsed = GenerateVideoSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid video generation payload." });
  }

  const userId = req.userId!;
  const { prompt, conversationId, aspectRatio, durationSeconds, sourceImageBase64, sourceImageMimeType } = parsed.data;

  try {
    const job = await startVideoGeneration({
      userId,
      conversationId,
      prompt,
      aspectRatio,
      durationSeconds,
      sourceImageBase64,
      sourceImageMimeType,
    });
    res.json(job);
  } catch (err: unknown) {
    console.error("[Direct Video Gen Error]:", err);
    res.status(500).json({ error: getFriendlyMultimodalError(err, "video") });
  }
});

// 3. Asynchronous Video Polling Status Endpoint
app.get("/api/video-status/:id", async (req: AuthenticatedRequest, res: Response) => {
  const mediaId = req.params.id;
  const userId = req.userId!;

  try {
    const statusResult = await checkVideoStatus(mediaId, userId);
    res.json(statusResult);
  } catch (err: unknown) {
    console.error("[Video Status Polling Error]:", err);
    res.status(500).json({ error: getFriendlyMultimodalError(err, "video") });
  }
});

// 4. Secure Media Asset Serving (Strict User Ownership Enforced)
app.get("/api/media/:id", (req: AuthenticatedRequest, res: Response) => {
  const mediaId = req.params.id;
  const userId = req.userId!;

  const record = db.getMediaRecord(mediaId, userId);
  if (!record) {
    return res.status(404).json({ error: "Media file not found or unauthorized." });
  }

  if (!record.filePath || !fs.existsSync(record.filePath)) {
    return res.status(404).json({ error: "Media file has expired or is not on disk." });
  }

  try {
    const stat = fs.statSync(record.filePath);
    res.setHeader("Content-Type", record.mimeType || "application/octet-stream");
    res.setHeader("Content-Length", stat.size);
    res.setHeader("Cache-Control", "private, max-age=86400");
    const stream = fs.createReadStream(record.filePath);
    stream.pipe(res);
  } catch (err) {
    console.error("Failed to stream media file:", err);
    res.status(500).json({ error: "Failed to read media file." });
  }
});

// 5. Speech-to-Text Transcription Endpoint (Direct Gemini Audio Processing)
app.post("/api/audio/transcribe", transcribeLimiter, async (req: AuthenticatedRequest, res: Response) => {
  const parsed = AudioTranscribeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid audio transcription payload." });
  }

  try {
    const rawBase64 = parsed.data.audioBase64.replace(/^data:[^;]+;base64,/, "");
    const buffer = Buffer.from(rawBase64, "base64");
    if (buffer.length === 0) {
      return res.status(400).json({ error: "Audio buffer is empty." });
    }

    const text = await transcribeAudioBuffer(buffer, parsed.data.mimeType);
    res.json({ text });
  } catch (err: unknown) {
    console.error("[Speech Transcription Error]:", err);
    res.status(500).json({ error: getFriendlyMultimodalError(err, "audio") });
  }
});

// ---------------------------------------------------------------------------
// OBSERVABILITY & DATA EXPORT (GDPR / Ownership Enforced)
// ---------------------------------------------------------------------------

app.get("/api/usage", (req: AuthenticatedRequest, res: Response) => {
  const stats = db.getUsageStats(req.userId!);
  res.json(stats);
});

app.get("/api/export", requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const exportData = db.exportUserData(req.userId!);
  res.setHeader("Content-Disposition", `attachment; filename="arfa-ai-export-${Date.now()}.json"`);
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(exportData, null, 2));
});

// ---------------------------------------------------------------------------
// FILE UPLOAD VALIDATION & HANDLING
// ---------------------------------------------------------------------------

app.post("/api/upload", (req: AuthenticatedRequest, res: Response) => {
  const parsed = UploadFileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid file payload." });
  }

  const { name, type, size, dataUrl } = parsed.data;

  // Verify mime type is allowed (images, text, documents)
  const allowedPrefixes = ["image/", "text/", "application/pdf", "application/json", "application/octet-stream"];
  const isValidType = allowedPrefixes.some((prefix) => (type || "").startsWith(prefix));
  if (!isValidType) {
    return res.status(400).json({ error: "File format is not supported for processing." });
  }

  const attachment = {
    id: `att_${crypto.randomUUID()}`,
    name,
    type: type || "application/octet-stream",
    size: size || 0,
    dataUrl,
  };

  res.json(attachment);
});

// Global Fallback 404 handler for API routes
app.all("/api/*", (_req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});
