import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.string().trim().email("Invalid email format").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
  name: z.string().trim().min(1, "Name cannot be empty").max(100).optional(),
});

export const LoginSchema = z.object({
  email: z.string().trim().email("Invalid email format").max(255),
  password: z.string().min(1, "Password is required").max(128),
});

export const GoogleAuthSchema = z.object({
  credential: z.string().optional(),
  email: z.string().trim().email().optional(),
  name: z.string().trim().optional(),
  googleId: z.string().optional(),
  avatar: z.string().url().optional().or(z.string()),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().trim().email("Invalid email format").max(255),
});

export const ResetPasswordSchema = z.object({
  email: z.string().trim().email("Invalid email format").max(255),
  code: z.string().trim().length(6, "Reset code must be 6 digits"),
  newPassword: z.string().min(6, "Password must be at least 6 characters").max(128),
});

export const CreateConversationSchema = z.object({
  title: z.string().trim().max(150).optional(),
});

export const UpdateConversationSchema = z.object({
  title: z.string().trim().min(1, "Title cannot be empty").max(150),
});

export const ChatAttachmentSchema = z.object({
  id: z.string().optional(),
  name: z.string().max(255),
  type: z.string().max(100),
  size: z.number().max(10 * 1024 * 1024, "Attachment exceeds 10MB limit"),
  dataUrl: z.string().max(15 * 1024 * 1024, "Attachment data exceeds maximum size limit"),
});

export const ChatRequestSchema = z.object({
  conversationId: z.string().trim().max(100).optional(),
  message: z.string().trim().min(1, "Message content cannot be empty").max(35000, "Message exceeds 35,000 character limit"),
  attachments: z.array(ChatAttachmentSchema).max(5, "Maximum of 5 attachments allowed per message").optional(),
  provider: z.enum(["gemini", "openai"]).optional(),
  modelName: z.string().trim().max(100).optional(),
  mode: z.enum(["chat", "image", "video"]).optional(),
});

export const GenerateImageSchema = z.object({
  prompt: z.string().trim().min(1, "Prompt cannot be empty").max(2500, "Prompt exceeds maximum length"),
  conversationId: z.string().trim().max(100).optional(),
  aspectRatio: z.enum(["1:1", "16:9", "9:16", "4:3", "3:4"]).optional(),
  sourceImageBase64: z.string().max(15 * 1024 * 1024).optional(),
  sourceImageMimeType: z.string().max(100).optional(),
});

export const GenerateVideoSchema = z.object({
  prompt: z.string().trim().min(1, "Prompt cannot be empty").max(2500, "Prompt exceeds maximum length"),
  conversationId: z.string().trim().max(100).optional(),
  aspectRatio: z.enum(["16:9", "9:16"]).optional(),
  durationSeconds: z.union([z.literal(4), z.literal(6), z.literal(8)]).optional(),
  sourceImageBase64: z.string().max(15 * 1024 * 1024).optional(),
  sourceImageMimeType: z.string().max(100).optional(),
});

export const AudioTranscribeSchema = z.object({
  audioBase64: z.string().min(1, "Audio data is required").max(15 * 1024 * 1024),
  mimeType: z.string().default("audio/webm"),
});

export const AddMemorySchema = z.object({
  category: z.enum(["preference", "fact", "project", "instruction"]).default("preference"),
  content: z.string().trim().min(1, "Memory content cannot be empty").max(2000, "Memory content exceeds 2,000 characters"),
});

export const UpdateSettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  preferredProvider: z.enum(["gemini", "openai"]).optional(),
  preferredModel: z.string().trim().max(100).optional(),
  customInstructions: z.string().max(5000).optional(),
  temperature: z.number().min(0).max(2).optional(),
  voiceEnabled: z.boolean().optional(),
});

export const UploadFileSchema = z.object({
  name: z.string().trim().min(1).max(255),
  type: z.string().max(100).optional(),
  size: z.number().max(10 * 1024 * 1024, "File size exceeds 10MB"),
  dataUrl: z.string().min(1, "File payload is required").max(15 * 1024 * 1024),
});
