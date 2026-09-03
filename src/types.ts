export interface User {
  id: string;
  email: string;
  name: string;
  isGuest: boolean;
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
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
  attachments?: MessageAttachment[];
  model?: string;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
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

export interface UsageStats {
  totalRequests: number;
  totalTokens: number;
  recentRecords: Array<{
    id: string;
    timestamp: string;
    model: string;
    tokensEstimated: number;
  }>;
}

export interface ArfaKnowledgeProfile {
  name: string;
  aiIdentity: string;
  tagline: string;
  summary: string;
  coreValues: string[];
  interests: string[];
  learningJourney: {
    domain: string;
    topics: string[];
  }[];
  featuredProjects: {
    title: string;
    category: string;
    description: string;
    techStack: string[];
  }[];
  careerGoals: string[];
  communicationStyle: {
    tone: string[];
    strengths: string[];
    boundaries: string[];
  };
}
