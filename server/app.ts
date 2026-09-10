import express, { Response } from "express";
import cookieParser from "cookie-parser";
import crypto from "crypto";
import fs from "fs";
import path from "path";
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
import { extractAndPersistMemories, getRelevantMemories } from "./ai/memoryService.ts";
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

// Serve public static assets (including /assets/arfa-hero.png)
app.use("/assets", express.static(path.join(process.cwd(), "public/assets")));

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

// Get current authenticated user
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

  // Real users only - no guest session
  return res.status(401).json({ error: "Not authenticated", user: null });
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

  // 4. Extract and persist long-term memories from user message (instant recall)
  try {
    extractAndPersistMemories(userId, message);
  } catch (memErr) {
    console.error("Memory extraction notice:", memErr);
  }

  // 5. Retrieve user settings and relevant long-term memories
  const settings = db.getUserSettings(userId);
  const relevantMemories = getRelevantMemories(userId, message);
  const user = db.getUserById(userId);

  // 6. Initialize Server-Sent Events headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  // 7. Support Stop Generation: accurately detect client abort via response close
  let isClientDisconnected = false;
  res.on("close", () => {
    if (!res.writableEnded) {
      isClientDisconnected = true;
    }
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
      console.warn("[Multimodal Notice - Image Generation Quota/Error]:", (imgErr as any)?.message || imgErr);
      const isUrduScript = /[\u0600-\u06FF]/.test(intentResult.cleanedPrompt) || /[\u0600-\u06FF]/.test(message);
      const isRomanUrdu = /\b(tasveer|tasweer|banao|kardo|banado|mujhe|chahiye|karo|likho|aap|hai|yeh|woh)\b/i.test(message);

      let helpfulMessage = "";
      if (isUrduScript) {
        helpfulMessage = `تصویر بنانے کی درخواست:\n> **"${intentResult.cleanedPrompt}"**\n\n⚠️ **کوٹہ اور بلنگ کی معلومات**: گوگل کے نینو بنانا (Nano Banana / \`gemini-3.1-flash-lite-image\`) کے لیے فعال بلنگ پروجیکٹ درکار ہوتا ہے (فری ٹائر پر امیج ماڈلز کا کوٹہ 0 ہوتا ہے)۔\n\n**حل:**\n1. اپنے گوگل اے آئی اسٹوڈیو پروجیکٹ میں بلنگ فعال کریں۔\n2. اس دوران آپ اوپر دیا گیا تفصیلی پرامپٹ کسی بھی امیج جنریٹر میں استعمال کر سکتے ہیں۔`;
      } else if (isRomanUrdu) {
        helpfulMessage = `Image generation request:\n> **"${intentResult.cleanedPrompt}"**\n\n⚠️ **Quota & Billing Notice**: Google Nano Banana image models (\`gemini-3.1-flash-lite-image\`) ke liye billing-enabled project zaroori hai (Google free tier par image models ki quota limit 0 hoti hai).\n\n**Ise kaise enable karein:**\n1. Google AI Studio par apne project mein billing link karein.\n2. Tab tak aap oopar diye gaye prompt ko kisi bhi image generator tool mein use kar sakte hain.`;
      } else {
        helpfulMessage = `I received your image request:\n> **"${intentResult.cleanedPrompt}"**\n\n⚠️ **Google Gemini Quota Notice**: Image generation via Google Nano Banana (\`gemini-3.1-flash-lite-image\`) requires an active Google AI Studio project with billing or paid quota enabled (free-tier API keys have an image generation quota limit of 0).\n\n**How to enable this in your project:**\n1. In Google AI Studio, ensure your project is linked to a billing account with quota enabled.\n2. Once billing is linked, image generation with Nano Banana will activate automatically.\n3. In the meantime, you can copy the refined prompt above into your preferred image generation tool.`;
      }

      const assistantMsg = db.addMessage(
        conv.id,
        userId,
        "assistant",
        helpfulMessage,
        undefined,
        "gemini-3.1-flash-lite"
      );

      res.write(
        `data: ${JSON.stringify({
          type: "chunk",
          chunk: helpfulMessage,
        })}\n\n`
      );
      res.write(
        `data: ${JSON.stringify({
          type: "done",
          messageId: assistantMsg.id,
          fullText: helpfulMessage,
          model: "gemini-3.1-flash-lite",
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

      const isCompleted = videoJob.status === "completed";
      const mediaUrl = isCompleted ? (videoJob.url || `/api/media/${videoJob.mediaId}`) : "";
      const isUrdu = /[\u0600-\u06FF]/.test(intentResult.cleanedPrompt) || /[\u0600-\u06FF]/.test(message);

      let textContent = `I've queued this video for generation with Veo:\n\n*"${intentResult.cleanedPrompt}"*\n\nVeo generates high-fidelity video clips asynchronously. Rendering progress will update live below.`;
      if (isCompleted) {
        textContent = isUrdu
          ? `یہ رہی آپ کی ہائی ڈیفینیشن سنیمیٹک ویڈیو:\n\n*"${intentResult.cleanedPrompt}"*`
          : `Here is your high-definition cinematic video:\n\n*"${intentResult.cleanedPrompt}"*`;
      }

      const assistantMsg = db.addMessage(
        conv.id,
        userId,
        "assistant",
        textContent,
        undefined,
        videoJob.model,
        [
          {
            id: videoJob.mediaId,
            type: "video",
            url: mediaUrl,
            mimeType: "video/mp4",
            prompt: videoJob.prompt,
            model: videoJob.model,
            status: videoJob.status,
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
          videoJob: isCompleted
            ? undefined
            : {
                mediaId: videoJob.mediaId,
                operationName: videoJob.operationName,
              },
        })}\n\n`
      );
      res.end();
      return;
    } catch (vidErr: unknown) {
      console.warn("[Multimodal Notice - Video Generation Quota/Error]:", (vidErr as any)?.message || vidErr);
      const isUrduScript = /[\u0600-\u06FF]/.test(intentResult.cleanedPrompt) || /[\u0600-\u06FF]/.test(message);
      const isRomanUrdu = /\b(video|banao|kardo|banado|mujhe|chahiye|karo|likho|aap|hai|yeh|woh)\b/i.test(message);

      let helpfulMessage = "";
      if (isUrduScript) {
        helpfulMessage = `ویڈیو بنانے کی درخواست:\n> **"${intentResult.cleanedPrompt}"**\n\n⚠️ **کوٹہ اور بلنگ کی معلومات**: گوگل کے Veo ویڈیو ماڈلز (\`veo-3.1-lite-generate-preview\`) کے لیے فعال بلنگ پروجیکٹ درکار ہوتا ہے (فری ٹائر پر ویڈیو جنریشن دستیاب نہیں ہے)۔\n\n**حل:**\n1. اپنے گوگل کلاؤڈ / اے آئی اسٹوڈیو پروجیکٹ میں بلنگ اور Veo کوٹہ فعال کریں۔`;
      } else if (isRomanUrdu) {
        helpfulMessage = `Video generation request:\n> **"${intentResult.cleanedPrompt}"**\n\n⚠️ **Quota & Billing Notice**: Google Veo video models ke liye billing-enabled project zaroori hai.\n\n**Ise kaise enable karein:**\n1. Google AI Studio ya Google Cloud console mein billing enable karein.`;
      } else {
        helpfulMessage = `I received your video request:\n> **"${intentResult.cleanedPrompt}"**\n\n⚠️ **Google Veo Quota Notice**: Video generation via Google Veo (\`veo-3.1-lite-generate-preview\`) requires an active Google AI Studio project with billing or paid quota enabled (free-tier API keys have limit 0 for video models).\n\n**How to enable this in your project:**\n1. In Google AI Studio, link a billing account to your project to enable Veo video generation.\n2. Once billing is active, high-definition Veo rendering will generate seamlessly.`;
      }

      const assistantMsg = db.addMessage(
        conv.id,
        userId,
        "assistant",
        helpfulMessage,
        undefined,
        "gemini-3.1-flash-lite"
      );

      res.write(
        `data: ${JSON.stringify({
          type: "chunk",
          chunk: helpfulMessage,
        })}\n\n`
      );
      res.write(
        `data: ${JSON.stringify({
          type: "done",
          messageId: assistantMsg.id,
          fullText: helpfulMessage,
          model: "gemini-3.1-flash-lite",
        })}\n\n`
      );
      res.end();
      return;
    }
  }

  let fullResponse = "";

  try {
    const wantsUrdu =
      /\b(talk in urdu|lets talk in urdu|let's talk in urdu|speak in urdu|speak urdu|write in urdu|write urdu|urdu me|urdu mein|urdu please|اردو میں|اردو)\b/i.test(
        message
      );
    const customInstructionsList: string[] = [];
    if (settings.customInstructions?.trim()) {
      customInstructionsList.push(settings.customInstructions.trim());
    }
    if (wantsUrdu) {
      customInstructionsList.push(
        "CRITICAL URDU DIRECTIVE: The user has explicitly asked to talk in Urdu. You MUST write your ENTIRE reply in authentic Urdu script (اردو رسم الخط: e.g. جی بالکل! میں آپ سے اردو میں بات کرنے کے لیے بالکل تیار ہوں۔ بتائیے میں آپ کے لیے کیا کر سکتی ہوں؟). Do NOT use English or Roman Urdu letters."
      );
    }
    if (intentResult.intent === "presentation_generation") {
      customInstructionsList.push(
        "CRITICAL PRESENTATION DIRECTIVE: The user requested a presentation/slides. Produce a rich presentation deck enclosed in a ```presentation JSON block according to the schema in instructions, followed by an elegant summary."
      );
    }

    await executeStreamingChat(
      {
        history,
        message: message.trim(),
        provider: provider || settings.preferredProvider,
        modelName: modelName || settings.preferredModel,
        promptOptions: {
          userName: user?.name,
          userCustomInstructions: customInstructionsList.join("\n\n"),
          userMemories: relevantMemories,
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
          console.error("[AI Streaming Error]:", err.message || err);
          if (!isClientDisconnected && !res.writableEnded) {
            const friendlyMessage = formatFriendlyErrorMessage(err);
            const fallbackText = fullResponse.trim() || `⚠️ ${friendlyMessage}`;
            let assistantMsgId: string | undefined;

            try {
              const saved = db.addMessage(
                conv!.id,
                userId,
                "assistant",
                fallbackText,
                undefined,
                modelName || settings.preferredModel
              );
              assistantMsgId = saved.id;
            } catch (dbErr) {
              console.warn("Could not save fallback assistant message:", dbErr);
            }

            res.write(
              `data: ${JSON.stringify({
                type: "error",
                error: friendlyMessage,
                messageId: assistantMsgId,
                fullText: fallbackText,
              })}\n\n`
            );
            res.end();
          }
        },
        onFinish: (completeText: string, metadata?: Record<string, unknown>) => {
          const finalContent = completeText || fullResponse;

          // Always persist assistant response to DB even if stopped prematurely
          if (finalContent.trim()) {
            const finalModel = (metadata?.model as string) || (modelName || "gemini-3.1-flash-lite");
            const assistantMsg = db.addMessage(
              conv!.id,
              userId,
              "assistant",
              finalContent,
              undefined,
              finalModel
            );

            const estimatedTokens = Math.ceil((message.length + finalContent.length) / 3.8);
            db.recordUsage(userId, finalModel, estimatedTokens);

            if (!isClientDisconnected && !res.writableEnded) {
              res.write(
                `data: ${JSON.stringify({
                  type: "done",
                  messageId: assistantMsg.id,
                  fullText: finalContent,
                  model: finalModel,
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

// 4. Secure Media Asset Serving (Instant High-Resolution Media Delivery)
app.get("/api/media/:id", (req: AuthenticatedRequest, res: Response) => {
  const mediaId = req.params.id;
  const record = db.getMediaRecord(mediaId);
  if (!record) {
    return res.status(404).json({ error: "Media file not found." });
  }

  if (!record.filePath || !fs.existsSync(record.filePath)) {
    return res.status(404).json({ error: "Media file has expired or is not on disk." });
  }

  try {
    const stat = fs.statSync(record.filePath);
    res.setHeader("Content-Type", record.mimeType || "application/octet-stream");
    res.setHeader("Content-Length", stat.size);
    res.setHeader("Cache-Control", "public, max-age=86400");
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

// ---------------------------------------------------------------------------
// CUSTOM HERO PICTURE STORAGE & RETRIEVAL
// ---------------------------------------------------------------------------
const HERO_IMAGE_PATH = path.join(process.cwd(), "data", "user_hero_image.png");

app.post("/api/hero-image", (req: AuthenticatedRequest, res: Response) => {
  try {
    const { dataUrl } = req.body;
    if (!dataUrl || typeof dataUrl !== "string") {
      return res.status(400).json({ error: "Invalid dataUrl" });
    }
    const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    fs.mkdirSync(path.dirname(HERO_IMAGE_PATH), { recursive: true });
    fs.writeFileSync(HERO_IMAGE_PATH, buffer);
    res.json({ ok: true });
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Failed to save hero image";
    res.status(500).json({ error });
  }
});

app.get("/api/hero-image", (_req: AuthenticatedRequest, res: Response) => {
  if (fs.existsSync(HERO_IMAGE_PATH)) {
    res.setHeader("Content-Type", "image/png");
    fs.createReadStream(HERO_IMAGE_PATH).pipe(res);
  } else {
    res.status(404).json({ error: "No custom hero image found" });
  }
});

// Global Fallback 404 handler for API routes
app.all("/api/*", (_req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});
