import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { db } from "./server/db.ts";
import { executeStreamingChat, generateTitleFromMessage, formatFriendlyErrorMessage } from "./server/ai/aiService.ts";
import { ARFA_PROFILE } from "./server/ai/arfaProfile.ts";
import { isOpenAIConfigured } from "./server/ai/openaiClient.ts";

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json({ limit: "15mb" }));

// Basic Rate Limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function rateLimiter(limit: number = 30, windowMs: number = 60000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = (req.headers["x-user-id"] as string) || req.ip || "unknown";
    const now = Date.now();
    const record = rateLimitMap.get(key);

    if (!record || now > record.resetAt) {
      rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (record.count >= limit) {
      return res.status(429).json({
        error: "Arfa AI is temporarily busy. Please try again in a few moments.",
      });
    }

    record.count++;
    next();
  };
}

// User Context Extraction Middleware
// Derives user identity from session token, or isolated guest session ID
function getUserContext(req: Request): string {
  const authHeader = req.headers["authorization"] || (req.headers["x-auth-token"] as string);
  if (authHeader) {
    const token = typeof authHeader === "string" && authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : String(authHeader).trim();
    const user = db.verifySession(token);
    if (user) {
      return user.id;
    }
  }

  // Check isolated guest session ID
  const guestHeader = req.headers["x-guest-session-id"] as string;
  if (guestHeader && typeof guestHeader === "string" && guestHeader.startsWith("guest_")) {
    return guestHeader;
  }

  // Fallback to x-user-id if valid user
  const customId = req.headers["x-user-id"] as string;
  if (customId && db.getUserById(customId)) {
    return customId;
  }

  return "guest_anonymous";
}

// --- API ROUTES ---

// Health & Status
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "Arfa AI Service",
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    openaiConfigured: isOpenAIConfigured(),
    defaultProvider: process.env.OPENAI_API_KEY ? "openai" : "gemini",
  });
});

// Arfa Knowledge Base
app.get("/api/knowledge", (_req, res) => {
  res.json(ARFA_PROFILE);
});

// Auth Routes
app.get("/api/auth/me", (req, res) => {
  const authHeader = req.headers["authorization"] || (req.headers["x-auth-token"] as string);
  if (authHeader) {
    const token = typeof authHeader === "string" && authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : String(authHeader).trim();
    const user = db.verifySession(token);
    if (user) {
      return res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        isGuest: false,
      });
    }
  }

  // Check guest session ID
  const guestHeader = req.headers["x-guest-session-id"] as string;
  if (guestHeader && typeof guestHeader === "string" && guestHeader.startsWith("guest_")) {
    return res.json({
      id: guestHeader,
      email: "",
      name: "Guest",
      isGuest: true,
    });
  }

  const newGuestId = `guest_${crypto.randomUUID()}`;
  res.json({
    id: newGuestId,
    email: "",
    name: "Guest",
    isGuest: true,
  });
});

app.post("/api/auth/register", (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || password.length < 6) {
      return res.status(400).json({ error: "Please enter a valid email and a password with at least 6 characters." });
    }
    const user = db.createUser(email, password, name);
    const session = db.createSession(user.id);
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
    const error = err instanceof Error ? err.message : "Registration failed";
    res.status(400).json({ error });
  }
});

app.post("/api/auth/login", (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Please enter your email and password." });
    }
    const user = db.verifyPassword(email, password);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    const session = db.createSession(user.id);
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
    res.status(500).json({ error: "Authentication service error." });
  }
});

app.post("/api/auth/google", async (req, res) => {
  try {
    const { credential, email, name, googleId, avatar } = req.body;

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
        console.warn("Could not decode Google JWT directly:", decodeErr);
      }
    }

    if (!userEmail) {
      return res.status(400).json({ error: "Google authentication failed: Email not found." });
    }

    const user = db.findOrCreateGoogleUser(userEmail, userName || "Google User", userGoogleId, userAvatar);
    const session = db.createSession(user.id);

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
    const message = err instanceof Error ? err.message : "Google authentication failed.";
    res.status(500).json({ error: message });
  }
});

app.post("/api/auth/forgot-password", (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Please provide your email address." });
    }
    const code = db.createPasswordResetCode(email);
    res.json({
      success: true,
      message: "A 6-digit verification code has been issued.",
      code,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Password recovery request failed.";
    res.status(400).json({ error: message });
  }
});

app.post("/api/auth/reset-password", (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "Please enter your email, 6-digit code, and new password (min 6 characters)." });
    }
    const success = db.resetPasswordWithCode(email, code.trim(), newPassword);
    if (!success) {
      return res.status(400).json({ error: "Invalid or expired reset code. Please try again." });
    }
    const user = db.getUserByEmail(email);
    const session = user ? db.createSession(user.id) : null;
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

app.post("/api/auth/logout", (req, res) => {
  const authHeader = req.headers["authorization"] || (req.headers["x-auth-token"] as string);
  if (authHeader) {
    const token = typeof authHeader === "string" && authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : String(authHeader).trim();
    db.deleteSession(token);
  }
  res.json({ success: true, message: "Logged out successfully" });
});

// Conversation Routes
app.get("/api/conversations", (req, res) => {
  const userId = getUserContext(req);
  const search = typeof req.query.q === "string" ? req.query.q : undefined;
  const conversations = db.getConversations(userId, search);
  res.json(conversations);
});

app.post("/api/conversations", (req, res) => {
  const userId = getUserContext(req);
  const title = (req.body.title as string) || "New Conversation";
  const conversation = db.createConversation(userId, title);
  res.status(201).json(conversation);
});

app.get("/api/conversations/:id", (req, res) => {
  const userId = getUserContext(req);
  const convId = req.params.id;
  const conversation = db.getConversation(convId, userId);
  if (!conversation) {
    return res.status(404).json({ error: "Conversation not found" });
  }
  const messages = db.getMessages(convId, userId);
  res.json({ ...conversation, messages });
});

app.patch("/api/conversations/:id", (req, res) => {
  try {
    const userId = getUserContext(req);
    const convId = req.params.id;
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }
    const updated = db.updateConversationTitle(convId, userId, title);
    res.json(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error updating conversation";
    res.status(404).json({ error: message });
  }
});

app.delete("/api/conversations/:id", (req, res) => {
  const userId = getUserContext(req);
  const convId = req.params.id;
  const deleted = db.deleteConversation(convId, userId);
  if (!deleted) {
    return res.status(404).json({ error: "Conversation not found" });
  }
  res.json({ success: true, id: convId });
});

app.delete("/api/conversations", (req, res) => {
  const userId = getUserContext(req);
  db.deleteAllConversations(userId);
  res.json({ success: true, message: "All conversations cleared" });
});

// Streaming Chat (Server-Sent Events)
app.post("/api/chat", rateLimiter(45, 60000), async (req, res) => {
  const userId = getUserContext(req);
  const { conversationId, message, attachments, provider, modelName } = req.body;

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Message content cannot be empty." });
  }

  // Find or create conversation
  let conv = conversationId ? db.getConversation(conversationId, userId) : undefined;
  let isNewConversation = false;

  if (!conv) {
    const autoTitle = generateTitleFromMessage(message);
    conv = db.createConversation(userId, autoTitle);
    isNewConversation = true;
  } else {
    // If it was an untitled or default conversation and this is the first message, update title
    const existingMessages = db.getMessages(conv.id, userId);
    if (existingMessages.length === 0 || conv.title === "New Conversation") {
      db.updateConversationTitle(conv.id, userId, generateTitleFromMessage(message));
    }
  }

  // Persist the user message
  const userMsg = db.addMessage(conv.id, userId, "user", message.trim(), attachments);

  // Load prior messages for context window (last 14 messages)
  const priorMessages = db.getMessages(conv.id, userId).slice(-14);
  const history = priorMessages
    .filter((m) => m.id !== userMsg.id)
    .map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    }));

  // Retrieve user settings and memories
  const settings = db.getUserSettings(userId);
  const memories = db.getMemories(userId);
  const user = db.getUserById(userId);

  // Set SSE Headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  // Send initialization metadata
  res.write(
    `data: ${JSON.stringify({
      type: "init",
      conversationId: conv.id,
      isNewConversation,
      userMessageId: userMsg.id,
    })}\n\n`
  );

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
          fullResponse += chunk;
          res.write(
            `data: ${JSON.stringify({
              type: "chunk",
              chunk,
            })}\n\n`
          );
        },
        onError: (err: Error) => {
          console.error("Chat streaming error:", err);
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
          // Persist the assistant message
          const assistantMsg = db.addMessage(
            conv!.id,
            userId,
            "assistant",
            completeText || fullResponse,
            undefined,
            (metadata?.model as string) || "gemini-3.8-flash"
          );

          // Record token usage estimate
          const estimatedTokens = Math.ceil((message.length + (completeText || fullResponse).length) / 3.8);
          db.recordUsage(userId, (metadata?.model as string) || "gemini-3.8-flash", estimatedTokens);

          res.write(
            `data: ${JSON.stringify({
              type: "done",
              messageId: assistantMsg.id,
              fullText: completeText || fullResponse,
              model: metadata?.model || "gemini-3.8-flash",
              tokensEstimated: estimatedTokens,
            })}\n\n`
          );
          res.end();
        },
      }
    );
  } catch (err: unknown) {
    console.error("Chat handler exception:", err);
    const friendlyMessage = formatFriendlyErrorMessage(err);
    res.write(
      `data: ${JSON.stringify({
        type: "error",
        error: friendlyMessage,
      })}\n\n`
    );
    res.end();
  }
});

// Memories
app.get("/api/memories", (req, res) => {
  const userId = getUserContext(req);
  const memories = db.getMemories(userId);
  res.json(memories);
});

app.post("/api/memories", (req, res) => {
  const userId = getUserContext(req);
  const { category, content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: "Memory content cannot be empty" });
  }
  const memory = db.addMemory(userId, category || "preference", content);
  res.status(201).json(memory);
});

app.delete("/api/memories/:id", (req, res) => {
  const userId = getUserContext(req);
  const deleted = db.deleteMemory(req.params.id, userId);
  if (!deleted) {
    return res.status(404).json({ error: "Memory not found" });
  }
  res.json({ success: true, id: req.params.id });
});

app.delete("/api/memories", (req, res) => {
  const userId = getUserContext(req);
  db.clearMemories(userId);
  res.json({ success: true, message: "All memories cleared" });
});

// Settings
app.get("/api/settings", (req, res) => {
  const userId = getUserContext(req);
  const settings = db.getUserSettings(userId);
  res.json(settings);
});

app.patch("/api/settings", (req, res) => {
  const userId = getUserContext(req);
  const updated = db.updateUserSettings(userId, req.body);
  res.json(updated);
});

// Observability & Usage
app.get("/api/usage", (req, res) => {
  const userId = getUserContext(req);
  const stats = db.getUsageStats(userId);
  res.json(stats);
});

// Data Export
app.get("/api/export", (req, res) => {
  const userId = getUserContext(req);
  const exportData = db.exportUserData(userId);
  res.setHeader("Content-Disposition", `attachment; filename="arfa-ai-export-${Date.now()}.json"`);
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(exportData, null, 2));
});

// File Upload Handler (Base64 / Multipart simulation)
app.post("/api/upload", (req, res) => {
  const { name, type, size, dataUrl } = req.body;
  if (!name || !dataUrl) {
    return res.status(400).json({ error: "File data is required" });
  }
  // Max size 5MB
  if (size && size > 5 * 1024 * 1024) {
    return res.status(400).json({ error: "File size exceeds 5MB limit." });
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

// --- VITE DEV / PRODUCTION STATIC SERVING ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Arfa AI Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
