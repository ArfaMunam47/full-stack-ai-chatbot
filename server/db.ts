import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  name: string;
  createdAt: string;
  googleId?: string;
  avatar?: string;
}

export interface Session {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

export interface PasswordResetCode {
  email: string;
  code: string;
  expiresAt: number;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  userId: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
  attachments?: MessageAttachment[];
  model?: string;
}

export interface MemoryItem {
  id: string;
  userId: string;
  category: "preference" | "fact" | "project" | "instruction";
  content: string;
  createdAt: string;
}

export interface UserSettings {
  userId: string;
  theme: "light" | "dark" | "system";
  preferredProvider: "gemini" | "openai";
  preferredModel: string;
  customInstructions: string;
  temperature: number;
  voiceEnabled: boolean;
}

export interface UsageRecord {
  id: string;
  userId: string;
  timestamp: string;
  model: string;
  tokensEstimated: number;
}

interface DatabaseSchema {
  users: User[];
  sessions: Session[];
  passwordResetCodes: PasswordResetCode[];
  conversations: Conversation[];
  messages: Message[];
  memories: MemoryItem[];
  userSettings: UserSettings[];
  usageRecords: UsageRecord[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "arfa-store.json");

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
}

class Database {
  private data: DatabaseSchema = {
    users: [],
    sessions: [],
    passwordResetCodes: [],
    conversations: [],
    messages: [],
    memories: [],
    userSettings: [],
    usageRecords: [],
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        this.data = {
          users: parsed.users || [],
          sessions: parsed.sessions || [],
          passwordResetCodes: parsed.passwordResetCodes || [],
          conversations: parsed.conversations || [],
          messages: parsed.messages || [],
          memories: parsed.memories || [],
          userSettings: parsed.userSettings || [],
          usageRecords: parsed.usageRecords || [],
        };
        // Clean out any historic mock/placeholder conversations
        this.sanitizeStore();
      } else {
        this.seedDefault();
        this.save();
      }
    } catch (err) {
      console.error("Failed to load database file, initializing defaults:", err);
      this.seedDefault();
    }
  }

  private sanitizeStore() {
    // Remove any hardcoded seeded conversations from previous iterations
    const fakeTitles = [
      "Meet Arfa AI & Capabilities",
      "hey there",
      "Hello from flash lite! Say one word.",
      "Say hi in 5 words.",
      "Hello Arfa! Say hi in 5 words.",
      "Introduce yourself briefly as Arfa AI.",
      "Introduce yourself briefly as Arfa AI...",
    ];
    const initialCount = this.data.conversations.length;
    this.data.conversations = this.data.conversations.filter(
      (c) => !fakeTitles.includes(c.title) && c.userId !== "usr_guest_arfa"
    );
    const validConvIds = new Set(this.data.conversations.map((c) => c.id));
    this.data.messages = this.data.messages.filter((m) => validConvIds.has(m.conversationId));

    if (this.data.conversations.length !== initialCount) {
      this.save();
    }
  }

  private seedDefault() {
    // We intentionally start with NO fake conversations and NO fake messages.
    // Clean, genuine empty state for users.
    this.data.conversations = [];
    this.data.messages = [];
    this.data.memories = [];
    this.data.sessions = [];
    this.data.passwordResetCodes = [];
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to save database:", err);
    }
  }

  // Session Operations
  createSession(userId: string): { token: string; expiresAt: string } {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
    const session: Session = {
      token,
      userId,
      createdAt: new Date().toISOString(),
      expiresAt,
    };
    if (!this.data.sessions) this.data.sessions = [];
    // Clean expired sessions
    const now = Date.now();
    this.data.sessions = this.data.sessions.filter((s) => new Date(s.expiresAt).getTime() > now);
    this.data.sessions.push(session);
    this.save();
    return { token, expiresAt };
  }

  verifySession(token: string): User | null {
    if (!token || !this.data.sessions) return null;
    const session = this.data.sessions.find((s) => s.token === token);
    if (!session) return null;
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      this.deleteSession(token);
      return null;
    }
    const user = this.getUserById(session.userId);
    return user || null;
  }

  deleteSession(token: string): void {
    if (!this.data.sessions) return;
    this.data.sessions = this.data.sessions.filter((s) => s.token !== token);
    this.save();
  }

  // Password Recovery Operations
  createPasswordResetCode(email: string): string {
    const user = this.getUserByEmail(email);
    if (!user) {
      throw new Error("No account found with this email address.");
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    if (!this.data.passwordResetCodes) this.data.passwordResetCodes = [];
    // Expire in 15 minutes
    this.data.passwordResetCodes = this.data.passwordResetCodes.filter((c) => c.email !== email.toLowerCase());
    this.data.passwordResetCodes.push({
      email: email.toLowerCase(),
      code,
      expiresAt: Date.now() + 15 * 60 * 1000,
    });
    this.save();
    return code;
  }

  resetPasswordWithCode(email: string, code: string, newPassword: string): boolean {
    if (!this.data.passwordResetCodes) return false;
    const record = this.data.passwordResetCodes.find(
      (c) => c.email === email.toLowerCase() && c.code === code && c.expiresAt > Date.now()
    );
    if (!record) {
      return false;
    }
    const user = this.getUserByEmail(email);
    if (!user) return false;

    const salt = crypto.randomBytes(16).toString("hex");
    user.salt = salt;
    user.passwordHash = hashPassword(newPassword, salt);

    // Remove used code
    this.data.passwordResetCodes = this.data.passwordResetCodes.filter((c) => c !== record);
    this.save();
    return true;
  }

  // Google OAuth User Operations
  findOrCreateGoogleUser(email: string, name: string, googleId?: string, avatar?: string): User {
    let user = this.getUserByEmail(email);
    if (!user) {
      const salt = crypto.randomBytes(16).toString("hex");
      const passwordHash = hashPassword(crypto.randomBytes(32).toString("hex"), salt);
      user = {
        id: `usr_${crypto.randomUUID()}`,
        email: email.trim().toLowerCase(),
        name: name.trim() || email.split("@")[0],
        salt,
        passwordHash,
        googleId,
        avatar,
        createdAt: new Date().toISOString(),
      };
      this.data.users.push(user);
      this.data.userSettings.push({
        userId: user.id,
        theme: "light",
        preferredProvider: "gemini",
        preferredModel: "gemini-3.8-flash",
        customInstructions: "",
        temperature: 0.7,
        voiceEnabled: true,
      });
      this.save();
    } else {
      if (googleId && !user.googleId) {
        user.googleId = googleId;
      }
      if (avatar && !user.avatar) {
        user.avatar = avatar;
      }
      this.save();
    }
    return user;
  }

  // User Operations
  getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(email: string, password: string, name: string): User {
    const existing = this.getUserByEmail(email);
    if (existing) {
      throw new Error("A user with this email already exists.");
    }
    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = hashPassword(password, salt);
    const newUser: User = {
      id: `usr_${crypto.randomUUID()}`,
      email: email.trim().toLowerCase(),
      name: name.trim() || "Explorer",
      salt,
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);

    // Initial default settings
    this.data.userSettings.push({
      userId: newUser.id,
      theme: "light",
      preferredProvider: "gemini",
      preferredModel: "gemini-3.8-flash",
      customInstructions: "",
      temperature: 0.7,
      voiceEnabled: true,
    });

    this.save();
    return newUser;
  }

  verifyPassword(email: string, password: string): User | null {
    const user = this.getUserByEmail(email);
    if (!user) return null;
    const computed = hashPassword(password, user.salt);
    if (computed === user.passwordHash) {
      return user;
    }
    return null;
  }

  // Conversation Operations
  getConversations(userId: string, searchQuery?: string): Conversation[] {
    let list = this.data.conversations.filter((c) => c.userId === userId);

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((conv) => {
        // match title
        if (conv.title.toLowerCase().includes(q)) return true;
        // match any message content in this conversation
        const msgs = this.data.messages.filter((m) => m.conversationId === conv.id);
        return msgs.some((m) => m.content.toLowerCase().includes(q));
      });
    }

    // Sort descending by updatedAt
    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  getConversation(conversationId: string, userId: string): Conversation | undefined {
    return this.data.conversations.find((c) => c.id === conversationId && c.userId === userId);
  }

  createConversation(userId: string, title: string = "New Conversation"): Conversation {
    const now = new Date().toISOString();
    const newConv: Conversation = {
      id: `conv_${crypto.randomUUID()}`,
      userId,
      title,
      createdAt: now,
      updatedAt: now,
    };
    this.data.conversations.unshift(newConv);
    this.save();
    return newConv;
  }

  updateConversationTitle(conversationId: string, userId: string, newTitle: string): Conversation {
    const conv = this.getConversation(conversationId, userId);
    if (!conv) {
      throw new Error("Conversation not found or unauthorized.");
    }
    conv.title = newTitle.trim() || "Untitled Conversation";
    conv.updatedAt = new Date().toISOString();
    this.save();
    return conv;
  }

  deleteConversation(conversationId: string, userId: string): boolean {
    const convIndex = this.data.conversations.findIndex((c) => c.id === conversationId && c.userId === userId);
    if (convIndex === -1) {
      return false;
    }
    this.data.conversations.splice(convIndex, 1);
    // Also delete associated messages
    this.data.messages = this.data.messages.filter((m) => m.conversationId !== conversationId);
    this.save();
    return true;
  }

  deleteAllConversations(userId: string): void {
    const userConvs = this.data.conversations.filter((c) => c.userId === userId).map((c) => c.id);
    this.data.conversations = this.data.conversations.filter((c) => c.userId !== userId);
    this.data.messages = this.data.messages.filter((m) => !userConvs.includes(m.conversationId));
    this.save();
  }

  // Messages
  getMessages(conversationId: string, userId: string): Message[] {
    const conv = this.getConversation(conversationId, userId);
    if (!conv) {
      throw new Error("Conversation not found or unauthorized.");
    }
    return this.data.messages
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  addMessage(
    conversationId: string,
    userId: string,
    role: "user" | "assistant" | "system",
    content: string,
    attachments?: MessageAttachment[],
    model?: string
  ): Message {
    const conv = this.getConversation(conversationId, userId);
    if (!conv) {
      throw new Error("Conversation not found or unauthorized.");
    }

    const now = new Date().toISOString();
    const msg: Message = {
      id: `msg_${crypto.randomUUID()}`,
      conversationId,
      userId,
      role,
      content,
      createdAt: now,
      attachments,
      model,
    };

    this.data.messages.push(msg);
    conv.updatedAt = now;
    this.save();
    return msg;
  }

  // Memories
  getMemories(userId: string): MemoryItem[] {
    return this.data.memories
      .filter((m) => m.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  addMemory(
    userId: string,
    category: "preference" | "fact" | "project" | "instruction",
    content: string
  ): MemoryItem {
    const item: MemoryItem = {
      id: `mem_${crypto.randomUUID()}`,
      userId,
      category,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };
    this.data.memories.unshift(item);
    this.save();
    return item;
  }

  deleteMemory(memoryId: string, userId: string): boolean {
    const index = this.data.memories.findIndex((m) => m.id === memoryId && m.userId === userId);
    if (index === -1) return false;
    this.data.memories.splice(index, 1);
    this.save();
    return true;
  }

  clearMemories(userId: string): void {
    this.data.memories = this.data.memories.filter((m) => m.userId !== userId);
    this.save();
  }

  // Settings
  getUserSettings(userId: string): UserSettings {
    let settings = this.data.userSettings.find((s) => s.userId === userId);
    if (!settings) {
      settings = {
        userId,
        theme: "light",
        preferredProvider: "gemini",
        preferredModel: "gemini-3.8-flash",
        customInstructions: "",
        temperature: 0.7,
        voiceEnabled: true,
      };
      this.data.userSettings.push(settings);
      this.save();
    }
    return settings;
  }

  updateUserSettings(userId: string, updates: Partial<UserSettings>): UserSettings {
    const current = this.getUserSettings(userId);
    Object.assign(current, updates);
    this.save();
    return current;
  }

  // Usage & Observability
  recordUsage(userId: string, model: string, tokensEstimated: number): void {
    this.data.usageRecords.push({
      id: `usg_${crypto.randomUUID()}`,
      userId,
      timestamp: new Date().toISOString(),
      model,
      tokensEstimated,
    });
    // Keep last 1000 records
    if (this.data.usageRecords.length > 1000) {
      this.data.usageRecords = this.data.usageRecords.slice(-1000);
    }
    this.save();
  }

  getUsageStats(userId: string) {
    const userRecords = this.data.usageRecords.filter((r) => r.userId === userId);
    const totalRequests = userRecords.length;
    const totalTokens = userRecords.reduce((acc, r) => acc + (r.tokensEstimated || 0), 0);
    return {
      totalRequests,
      totalTokens,
      recentRecords: userRecords.slice(-10),
    };
  }

  exportUserData(userId: string) {
    const user = this.getUserById(userId);
    const conversations = this.getConversations(userId);
    const allMessages = this.data.messages.filter((m) => m.userId === userId);
    const memories = this.getMemories(userId);
    const settings = this.getUserSettings(userId);
    const usage = this.getUsageStats(userId);

    return {
      exportedAt: new Date().toISOString(),
      user: user ? { id: user.id, email: user.email, name: user.name } : null,
      conversations,
      messages: allMessages,
      memories,
      settings,
      usage,
    };
  }
}

export const db = new Database();
