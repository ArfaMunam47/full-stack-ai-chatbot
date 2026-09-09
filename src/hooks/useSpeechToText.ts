import { useState, useRef, useEffect, useCallback } from "react";

// Cross-browser speech recognition interfaces
export interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

export interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

export interface UseSpeechToTextOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  onError?: (errorMessage: string, rawCode?: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export interface UseSpeechToTextReturn {
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
  transcript: string;
  interimTranscript: string;
  startListening: (overrideLang?: string) => Promise<boolean>;
  stopListening: () => void;
  toggleListening: () => Promise<void>;
  resetTranscript: () => void;
  clearError: () => void;
}

/**
 * Custom React Hook: useSpeechToText
 * 
 * Provides robust, production-grade speech-to-text with:
 * - Cross-browser SpeechRecognition setup (standard & webkit prefixed)
 * - Explicit navigator.mediaDevices.getUserMedia microphone permission verification
 * - Comprehensive event listeners: onstart, onresult, onspeechend, onerror, onend
 * - Graceful handling of not-allowed, no-speech, network, and hardware conflicts
 * - Strict state synchronization to prevent stuck UI states
 */
export function useSpeechToText(options: UseSpeechToTextOptions = {}): UseSpeechToTextReturn {
  const {
    lang = "en-US",
    continuous = true,
    interimResults = true,
    maxAlternatives = 1,
    onTranscript,
    onError,
    onStart,
    onEnd,
  } = options;

  const [isListening, setIsListening] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [interimTranscript, setInterimTranscript] = useState<string>("");

  // Store active recognition instance
  const recognitionRef = useRef<any>(null);
  const isManuallyStoppedRef = useRef<boolean>(false);
  const callbacksRef = useRef({ onTranscript, onError, onStart, onEnd });

  // Keep latest callbacks in ref without triggering re-initialization
  useEffect(() => {
    callbacksRef.current = { onTranscript, onError, onStart, onEnd };
  });

  // Check whether Web Speech API is supported in the current environment
  const isSupported = typeof window !== "undefined" && Boolean(
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
  }, []);

  const stopListening = useCallback(() => {
    isManuallyStoppedRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn("Speech recognition stop error:", err);
      }
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(
    async (overrideLang?: string): Promise<boolean> => {
      clearError();
      isManuallyStoppedRef.current = false;

      // 1. Cross-Browser API Check
      if (typeof window === "undefined") return false;

      const SpeechRecognitionConstructor =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognitionConstructor) {
        const msg =
          "Speech recognition is not supported in this browser. Please try Google Chrome, Microsoft Edge, or Safari.";
        setError(msg);
        callbacksRef.current.onError?.(msg, "not-supported");
        return false;
      }

      // 2. Explicit Permission Requesting
      // Request mic permission first to present an explicit browser prompt & catch blocks
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          // Crucial: immediately release the test stream so the recognition engine has unobstructed hardware access
          stream.getTracks().forEach((track) => track.stop());
        }
      } catch (permErr: any) {
        let friendlyMsg = "Microphone access was denied. Please allow microphone permissions in your browser address bar.";
        const errName = permErr?.name || "";

        if (errName === "NotAllowedError" || errName === "PermissionDeniedError") {
          friendlyMsg = "Microphone permission is blocked. Please enable microphone access in your browser settings.";
        } else if (errName === "NotFoundError" || errName === "DevicesNotFoundError") {
          friendlyMsg = "No microphone was found on this device. Please connect a microphone and try again.";
        } else if (errName === "NotReadableError" || errName === "TrackStartError") {
          friendlyMsg = "Microphone is in use by another application. Please free the device and try again.";
        }

        setError(friendlyMsg);
        callbacksRef.current.onError?.(friendlyMsg, "permission-denied");
        setIsListening(false);
        return false;
      }

      // 3. Stop any existing instance
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
        recognitionRef.current = null;
      }

      // 4. Initialize new SpeechRecognition instance
      try {
        const recognition = new SpeechRecognitionConstructor();
        recognition.continuous = continuous;
        recognition.interimResults = interimResults;
        recognition.maxAlternatives = maxAlternatives;
        recognition.lang = overrideLang || lang;

        // Core Event: onstart
        recognition.onstart = () => {
          setIsListening(true);
          setError(null);
          callbacksRef.current.onStart?.();
        };

        // Core Event: onresult
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let currentFinal = "";
          let currentInterim = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const result = event.results[i];
            const text = result[0]?.transcript || "";

            if (result.isFinal) {
              currentFinal += text;
            } else {
              currentInterim += text;
            }
          }

          if (currentFinal) {
            setTranscript((prev) => (prev ? `${prev} ${currentFinal.trim()}` : currentFinal.trim()));
            callbacksRef.current.onTranscript?.(currentFinal.trim(), true);
          }

          setInterimTranscript(currentInterim);
          if (currentInterim && !currentFinal) {
            callbacksRef.current.onTranscript?.(currentInterim, false);
          }
        };

        // Core Event: onspeechend
        recognition.onspeechend = () => {
          // If not in continuous mode, we stop after speech ends
          if (!continuous) {
            try {
              recognition.stop();
            } catch {}
          }
        };

        // Core Event: onerror
        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          const rawError = event.error;
          let userMsg = "";

          switch (rawError) {
            case "not-allowed":
            case "service-not-allowed":
              userMsg =
                "Microphone permission is disabled. Please allow microphone access in your browser settings.";
              break;
            case "no-speech":
              // Non-fatal: user was silent; stop cleanly without disrupting user workflow
              userMsg = "";
              break;
            case "network":
              userMsg =
                "Network connection dropped during speech recognition. Please verify your connection.";
              break;
            case "audio-capture":
              userMsg =
                "No audio capture hardware found. Please verify your microphone is plugged in.";
              break;
            case "aborted":
              // User or app triggered manual cancellation; silent cleanup
              break;
            default:
              userMsg = `Voice recognition error: ${rawError}`;
              break;
          }

          if (userMsg) {
            setError(userMsg);
            callbacksRef.current.onError?.(userMsg, rawError);
          }
        };

        // Core Event: onend
        recognition.onend = () => {
          setIsListening(false);
          setInterimTranscript("");
          callbacksRef.current.onEnd?.();
        };

        recognition.start();
        recognitionRef.current = recognition;
        return true;
      } catch (startErr: any) {
        console.error("Failed to start SpeechRecognition:", startErr);
        const fallbackMsg = "Could not initialize speech recognition. Please verify microphone permissions.";
        setError(fallbackMsg);
        callbacksRef.current.onError?.(fallbackMsg, "start-failed");
        setIsListening(false);
        return false;
      }
    },
    [lang, continuous, interimResults, maxAlternatives, clearError]
  );

  const toggleListening = useCallback(async () => {
    if (isListening) {
      stopListening();
    } else {
      await startListening();
    }
  }, [isListening, stopListening, startListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
        recognitionRef.current = null;
      }
    };
  }, []);

  return {
    isListening,
    isSupported,
    error,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript,
    clearError,
  };
}
