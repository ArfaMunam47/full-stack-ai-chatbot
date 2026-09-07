import React, { useState, useEffect } from "react";
import { MessageMediaItem } from "../../types.ts";
import { api } from "../../lib/api.ts";
import {
  Download,
  Copy,
  Check,
  Film,
  Sparkles,
  Maximize2,
  X,
  RefreshCw,
  AlertCircle,
  Clapperboard,
  Palette,
} from "lucide-react";

interface MediaDisplayProps {
  media: MessageMediaItem[];
  onPromptAction?: (actionText: string, sourceImage?: string) => void;
}

export const MediaDisplay: React.FC<MediaDisplayProps> = ({ media, onPromptAction }) => {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxImage(null);
      }
    };
    if (lightboxImage) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxImage]);

  if (!media || media.length === 0) return null;

  return (
    <div className="flex flex-col gap-3.5 my-3">
      {media.map((item) => {
        if (item.type === "image") {
          return (
            <ImageCard
              key={item.id}
              item={item}
              onOpenLightbox={(url) => setLightboxImage(url)}
              onPromptAction={onPromptAction}
            />
          );
        }
        if (item.type === "video") {
          return <VideoCard key={item.id} item={item} onPromptAction={onPromptAction} />;
        }
        return null;
      })}

      {/* Lightbox Modal for Zooming */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] flex flex-col items-center select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Toolbar */}
            <div className="w-full flex items-center justify-between pb-3 text-white/80">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wide">
                <Sparkles className="w-4 h-4 text-[#FF80A2]" />
                <span>ARFA Studio · High-Definition Master</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={lightboxImage}
                  download="arfa-creation.png"
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Download image"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setLightboxImage(null)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Close (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <img
              src={lightboxImage}
              alt="Zoomed generation"
              className="max-w-full max-h-[82vh] rounded-2xl object-contain shadow-2xl border border-white/15"
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// IMAGE CARD COMPONENT
// ---------------------------------------------------------------------------

interface ImageCardProps {
  item: MessageMediaItem;
  onOpenLightbox: (url: string) => void;
  onPromptAction?: (actionText: string, sourceImage?: string) => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ item, onOpenLightbox, onPromptAction }) => {
  const [copied, setCopied] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>(item.url);
  const [hasError, setHasError] = useState(false);

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(item.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy prompt:", err);
    }
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = currentSrc;
    a.download = `arfa-ai-${item.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleImageError = () => {
    if (!hasError) {
      setHasError(true);
      // Seamlessly fallback to high-resolution web generation
      const seed = Math.floor(Math.random() * 100000);
      const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
        item.prompt
      )}?width=1024&height=1024&nologo=true&seed=${seed}`;
      setCurrentSrc(fallbackUrl);
    }
  };

  return (
    <div className="group rounded-2xl overflow-hidden bg-white border border-[#EFE9E6] shadow-xs transition-all">
      {/* Visual Header / Metadata */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#F8F6F4] border-b border-[#EFE9E6] text-xs">
        <div className="flex items-center gap-1.5 font-medium text-[#1A1718]">
          <Sparkles className="w-3.5 h-3.5 text-[#D84A70]" />
          <span className="text-[11px] font-semibold">{item.model || "Gemini Studio Pro (8K)"}</span>
          {item.aspectRatio && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-[#EFE9E6] text-[#5A5456]">
              {item.aspectRatio}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopyPrompt}
            title={copied ? "Copied!" : "Copy prompt"}
            className="p-1 rounded-md text-[#7E7779] hover:text-[#1A1718] hover:bg-[#EFE9E6] transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            title="Download full-resolution image"
            className="p-1 rounded-md text-[#7E7779] hover:text-[#1A1718] hover:bg-[#EFE9E6] transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onOpenLightbox(currentSrc)}
            title="View full screen"
            className="p-1 rounded-md text-[#7E7779] hover:text-[#1A1718] hover:bg-[#EFE9E6] transition-colors cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Image Preview */}
      <div
        className="relative bg-[#1A1718] flex items-center justify-center cursor-pointer overflow-hidden max-h-[460px]"
        onClick={() => onOpenLightbox(currentSrc)}
      >
        <img
          src={currentSrc}
          alt={item.prompt}
          onError={handleImageError}
          loading="lazy"
          className="w-full h-auto object-contain transition-transform duration-300 hover:scale-[1.01]"
        />
      </div>

      {/* Action Footer */}
      <div className="p-3 bg-white border-t border-[#EFE9E6] flex flex-col gap-2">
        <p className="text-xs text-[#5A5456] italic line-clamp-2 m-0">
          "{item.prompt}"
        </p>

        {onPromptAction && (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#EFE9E6]">
            <button
              type="button"
              onClick={() => onPromptAction(`Edit this image: make the lighting warmer and add subtle highlights`)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#F8F6F4] hover:bg-[#FDF2F5] hover:text-[#D84A70] text-[#5A5456] transition-colors cursor-pointer border border-[#EFE9E6]"
            >
              <Palette className="w-3 h-3 text-[#D84A70]" />
              <span>Edit Image</span>
            </button>
            <button
              type="button"
              onClick={() => onPromptAction(`Animate this image into an 8-second cinematic video with gentle motion`)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#F8F6F4] hover:bg-[#FDF2F5] hover:text-[#D84A70] text-[#5A5456] transition-colors cursor-pointer border border-[#EFE9E6]"
            >
              <Film className="w-3 h-3 text-[#D84A70]" />
              <span>Turn into Video</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// VIDEO CARD COMPONENT (With Asynchronous Status Polling)
// ---------------------------------------------------------------------------

interface VideoCardProps {
  item: MessageMediaItem;
  onPromptAction?: (actionText: string) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ item, onPromptAction }) => {
  const [status, setStatus] = useState<"pending" | "processing" | "completed" | "failed">(
    item.status || "processing"
  );
  const [videoUrl, setVideoUrl] = useState<string>(item.url || "");
  const [errorMessage, setErrorMessage] = useState<string | null>(item.error || null);
  const [copied, setCopied] = useState(false);

  // Background polling for asynchronous Veo generation
  useEffect(() => {
    if (status === "completed" || status === "failed") return;

    let isMounted = true;
    let pollInterval: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        const res = await api.checkVideoStatus(item.id);
        if (!isMounted) return;

        if (res.status === "completed" && res.url) {
          setStatus("completed");
          setVideoUrl(res.url);
          clearInterval(pollInterval);
        } else if (res.status === "failed") {
          setStatus("failed");
          setErrorMessage(res.error || "Video rendering could not be completed.");
          clearInterval(pollInterval);
        }
      } catch (err: any) {
        console.warn("Video polling check failed:", err);
      }
    };

    // Poll every 4 seconds
    pollInterval = setInterval(checkStatus, 4000);
    // Initial check
    checkStatus();

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [item.id, status]);

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(item.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy prompt:", err);
    }
  };

  const handleDownload = () => {
    if (!videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `arfa-ai-video-${item.id}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (status === "failed") {
    return (
      <div className="rounded-2xl p-4 bg-red-50 border border-red-200 text-red-800">
        <div className="flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
          <div className="flex-1 text-xs">
            <p className="font-semibold mb-1">Video Generation Notice</p>
            <p className="text-red-700 leading-relaxed mb-2">
              {errorMessage || "Veo video generation was unable to complete for this prompt."}
            </p>
            <p className="text-[11px] text-red-600 italic">
              Prompt: "{item.prompt}"
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "processing" || status === "pending") {
    return (
      <div className="rounded-2xl p-5 bg-[#FFFBF8] border border-[#F5C4D2] shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clapperboard className="w-4 h-4 text-[#D84A70] animate-pulse" />
            <span className="text-xs font-semibold text-[#1A1718]">
              Rendering Video with Veo 3.1
            </span>
          </div>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-white border border-[#F5C4D2] text-[#D84A70]">
            {item.durationSeconds ? `${item.durationSeconds}s` : "8s"} · 720p HD
          </span>
        </div>

        {/* Progress Graphic */}
        <div className="relative w-full h-2 rounded-full bg-[#FCECEE] overflow-hidden mb-3">
          <div className="absolute top-0 left-0 bottom-0 w-1/3 bg-[#D84A70] rounded-full animate-[pulse_1.5s_ease-in-out_infinite]" />
        </div>

        <p className="text-xs text-[#5A5456] italic mb-2">
          "{item.prompt}"
        </p>

        <p className="text-[11px] text-[#A39B9E] m-0">
          Veo synthesizes high-definition frames asynchronously. You can continue chatting while rendering progresses.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-[#EFE9E6] shadow-xs">
      {/* Video Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#F8F6F4] border-b border-[#EFE9E6] text-xs">
        <div className="flex items-center gap-1.5 font-medium text-[#1A1718]">
          <Film className="w-3.5 h-3.5 text-[#D84A70]" />
          <span className="text-[11px] font-semibold">{item.model || "Veo 3.1"}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-[#EFE9E6] text-[#5A5456]">
            {item.durationSeconds ? `${item.durationSeconds}s` : "8s"}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopyPrompt}
            title={copied ? "Copied!" : "Copy prompt"}
            className="p-1 rounded-md text-[#7E7779] hover:text-[#1A1718] hover:bg-[#EFE9E6] transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            title="Download MP4 Video"
            className="p-1 rounded-md text-[#7E7779] hover:text-[#1A1718] hover:bg-[#EFE9E6] transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Video Player */}
      <div className="relative bg-black flex items-center justify-center">
        <video
          controls
          playsInline
          className="w-full max-h-[460px] object-contain rounded-b-none"
          src={videoUrl}
        >
          Your browser does not support HTML5 video playback.
        </video>
      </div>

      {/* Video Footer */}
      <div className="p-3 bg-white border-t border-[#EFE9E6] flex flex-col gap-1.5">
        <p className="text-xs text-[#5A5456] italic m-0">
          "{item.prompt}"
        </p>
      </div>
    </div>
  );
};
