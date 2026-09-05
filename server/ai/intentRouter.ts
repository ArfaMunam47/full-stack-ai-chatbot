export type DetectedIntent =
  | "chat"
  | "image_generation"
  | "image_edit"
  | "video_generation"
  | "image_to_video";

export interface IntentAnalysisResult {
  intent: DetectedIntent;
  cleanedPrompt: string;
  sourceImageBase64?: string;
  sourceImageMimeType?: string;
  aspectRatio?: string;
  durationSeconds?: 4 | 6 | 8;
  confidence: number;
}

export function detectIntent(params: {
  message: string;
  attachments?: Array<{ type?: string; dataUrl?: string }>;
  lastImageMedia?: { filePath?: string; mimeType?: string; url?: string; id?: string };
  explicitMode?: string;
}): IntentAnalysisResult {
  const { message, attachments, lastImageMedia, explicitMode } = params;
  const rawText = message.trim();
  const lower = rawText.toLowerCase();

  // Find image attachment if any
  const imageAttachment = attachments?.find((a) => a.type?.startsWith("image/") && a.dataUrl);

  // Aspect ratio detection from prompt text (e.g. "16:9", "widescreen", "square", "portrait", "9:16")
  let detectedAspectRatio: string | undefined;
  if (lower.includes("16:9") || lower.includes("widescreen") || lower.includes("landscape")) {
    detectedAspectRatio = "16:9";
  } else if (lower.includes("9:16") || lower.includes("portrait") || lower.includes("vertical")) {
    detectedAspectRatio = "9:16";
  } else if (lower.includes("1:1") || lower.includes("square")) {
    detectedAspectRatio = "1:1";
  }

  // 1. Explicit mode override if specified
  if (explicitMode === "image") {
    return {
      intent: imageAttachment ? "image_edit" : "image_generation",
      cleanedPrompt: cleanPrompt(rawText),
      sourceImageBase64: imageAttachment?.dataUrl,
      sourceImageMimeType: imageAttachment?.type,
      aspectRatio: detectedAspectRatio || "1:1",
      confidence: 1.0,
    };
  }

  if (explicitMode === "video") {
    return {
      intent: imageAttachment ? "image_to_video" : "video_generation",
      cleanedPrompt: cleanPrompt(rawText),
      sourceImageBase64: imageAttachment?.dataUrl,
      sourceImageMimeType: imageAttachment?.type,
      aspectRatio: detectedAspectRatio === "9:16" ? "9:16" : "16:9",
      confidence: 1.0,
    };
  }

  // 2. Video intent detection
  const isVideoGenerationPrompt =
    /^(generate|create|make|render|produce)\s+(an?\s+)?(\d+\s*(?:sec|second|s)\s+)?(cinematic\s+)?(video|animation|clip|short film)\b/i.test(
      rawText
    ) ||
    /\b(create|generate|produce)\s+(a\s+)?(cinematic\s+)?video\s+(of|about|depicting|showing)\b/i.test(
      rawText
    ) ||
    /^(make|render|produce)\s+a\s+video\b/i.test(rawText);

  const isAnimateExistingImage =
    /\b(animate|turn this into a video|make a video from this|convert to video|video of this)\b/i.test(
      rawText
    );

  if (imageAttachment && (isVideoGenerationPrompt || isAnimateExistingImage)) {
    return {
      intent: "image_to_video",
      cleanedPrompt: cleanPrompt(rawText),
      sourceImageBase64: imageAttachment.dataUrl,
      sourceImageMimeType: imageAttachment.type,
      aspectRatio: detectedAspectRatio === "9:16" ? "9:16" : "16:9",
      confidence: 0.95,
    };
  }

  if (isVideoGenerationPrompt) {
    return {
      intent: "video_generation",
      cleanedPrompt: cleanPrompt(rawText),
      aspectRatio: detectedAspectRatio === "9:16" ? "9:16" : "16:9",
      confidence: 0.92,
    };
  }

  // 3. Image editing detection
  // If image attachment is present and prompt describes edit/transformation
  if (imageAttachment) {
    const isEditWord =
      /\b(edit|change|modify|replace|remove|add|make it|turn|transform|filter|recolor|adjust|swap|enhance)\b/i.test(
        lower
      );
    if (isEditWord) {
      return {
        intent: "image_edit",
        cleanedPrompt: rawText,
        sourceImageBase64: imageAttachment.dataUrl,
        sourceImageMimeType: imageAttachment.type,
        aspectRatio: detectedAspectRatio || "1:1",
        confidence: 0.95,
      };
    }
  }

  // Follow-up image edit on recently generated image in conversation
  if (lastImageMedia && !imageAttachment) {
    const isConversationalImageEdit =
      /^(now\s+)?(make|turn|change|edit|replace|remove|add|give|modify|recolor)\s+(it|this|the\s+image|the\s+picture|the\s+background|the\s+color|the\s+sky)\b/i.test(
        lower
      ) ||
      /\b(make it darker|make it brighter|turn the background|remove the|change the color to)\b/i.test(
        lower
      );

    if (isConversationalImageEdit) {
      return {
        intent: "image_edit",
        cleanedPrompt: rawText,
        aspectRatio: detectedAspectRatio || "1:1",
        confidence: 0.88,
      };
    }
  }

  // 4. Image Generation detection
  const isImageGenerationPrompt =
    /^(generate|create|draw|paint|sketch|illustrate|render|make)\s+(an?\s+)?(image|picture|photo|illustration|drawing|artwork|portrait|render|painting|wallpaper)\b/i.test(
      rawText
    ) ||
    /\b(generate|create|render)\s+(an?\s+)?(image|picture|illustration|photo)\s+(of|depicting|showing|with)\b/i.test(
      rawText
    ) ||
    /^(draw|paint)\s+(me\s+)?(a|an)\s+[a-z]/i.test(rawText) ||
    /^(a\s+photo\s+of|an\s+image\s+of|a\s+rendering\s+of|digital\s+art\s+of)\b/i.test(rawText);

  if (isImageGenerationPrompt) {
    return {
      intent: "image_generation",
      cleanedPrompt: cleanPrompt(rawText),
      aspectRatio: detectedAspectRatio || "1:1",
      confidence: 0.92,
    };
  }

  // 5. Default to standard conversational chat
  return {
    intent: "chat",
    cleanedPrompt: rawText,
    confidence: 1.0,
  };
}

function cleanPrompt(text: string): string {
  // Strip common request prefixes while preserving prompt fidelity
  return text
    .replace(
      /^(please\s+)?(generate|create|make|render|produce|draw|paint|illustrate)\s+(an?\s+)?(cinematic\s+)?(video|image|picture|photo|illustration|animation|clip)\s+(of|about|depicting|showing)?\s*/i,
      ""
    )
    .replace(/^["']|["']$/g, "")
    .trim() || text;
}
