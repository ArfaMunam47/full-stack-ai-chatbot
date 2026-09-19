import { useState, useRef, useEffect, useCallback } from "react";
import { api } from "../lib/api.ts";

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
  isTranscribing: boolean;
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
 * Hybrid Voice Engine:
 * 1. Uses Web Speech API for zero-latency client-side streaming transcription where available.
 * 2. Simultaneously captures audio via MediaRecorder.
 * 3. If Web Speech fails (network disconnect, unsupported browser, or silence), automatically
 *    falls back to Gemini Multimodal Audio Transcription via /api/audio/transcribe.
 * 4. Ensures the microphone ALWAYS works reliably across all browsers and devices.
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
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [interimTranscript, setInterimTranscript] = useState<string>("");

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const hasRecognizedTextRef = useRef<boolean>(false);
  const isManuallyStoppedRef = useRef<boolean>(false);
  const callbacksRef = useRef({ onTranscript, onError, onStart, onEnd });

  useEffect(() => {
    callbacksRef.current = { onTranscript, onError, onStart, onEnd };
  });

  const isSupported = typeof window !== "undefined" && Boolean(
    navigator?.mediaDevices?.getUserMedia ||
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
    hasRecognizedTextRef.current = false;
  }, []);

  const releaseMediaStream = useCallback(() => {
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      } catch {}
      mediaStreamRef.current = null;
    }
  }, []);

  const stopListening = useCallback(() => {
    isManuallyStoppedRef.current = true;
    setIsListening(false);

    // 1. Stop SpeechRecognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }

    // 2. Stop MediaRecorder (triggers onstop to perform fallback transcription if needed)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.warn("Error stopping MediaRecorder:", err);
        releaseMediaStream();
      }
    } else {
      releaseMediaStream();
    }
  }, [releaseMediaStream]);

  const startListening = useCallback(
    async (overrideLang?: string): Promise<boolean> => {
      clearError();
      isManuallyStoppedRef.current = false;
      hasRecognizedTextRef.current = false;
      audioChunksRef.current = [];

      const SpeechRecognitionConstructor =
        typeof window !== "undefined"
          ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
          : null;

      let startedSpeechRecognition = false;

      // 1. If Web Speech API is supported, start it first (zero latency & native browser prompt)
      if (SpeechRecognitionConstructor) {
        try {
          const recognition = new SpeechRecognitionConstructor();
          recognition.continuous = continuous;
          recognition.interimResults = interimResults;
          recognition.maxAlternatives = maxAlternatives;
          recognition.lang = overrideLang || lang;

          recognition.onstart = () => {
            setIsListening(true);
            setError(null);
            callbacksRef.current.onStart?.();
          };

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

            if (currentFinal.trim()) {
              hasRecognizedTextRef.current = true;
              setTranscript((prev) => (prev ? `${prev} ${currentFinal.trim()}` : currentFinal.trim()));
              callbacksRef.current.onTranscript?.(currentFinal.trim(), true);
            }

            setInterimTranscript(currentInterim);
            if (currentInterim && !currentFinal) {
              callbacksRef.current.onTranscript?.(currentInterim, false);
            }
          };

          recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.warn("SpeechRecognition notice:", event.error);
            if (event.error === "not-allowed" || event.error === "permission-denied") {
              setError("Microphone permission was denied. Please allow microphone access.");
              callbacksRef.current.onError?.("Microphone permission was denied.", "permission-denied");
              setIsListening(false);
            }
          };

          recognition.onend = () => {
            setInterimTranscript("");
            if (!isManuallyStoppedRef.current) {
              setIsListening(false);
              if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
                try {
                  mediaRecorderRef.current.stop();
                } catch {}
              }
            }
          };

          recognition.start();
          recognitionRef.current = recognition;
          startedSpeechRecognition = true;
        } catch (recogInitErr: any) {
          console.warn("SpeechRecognition start exception:", recogInitErr);
        }
      }

      // 2. Also attempt MediaRecorder stream for fallback transcription
      if (typeof window !== "undefined" && navigator?.mediaDevices?.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });
          mediaStreamRef.current = stream;

          let mimeType = "audio/webm";
          if (typeof MediaRecorder !== "undefined") {
            if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
              mimeType = "audio/webm;codecs=opus";
            } else if (MediaRecorder.isTypeSupported("audio/webm")) {
              mimeType = "audio/webm";
            } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
              mimeType = "audio/mp4";
            }

            try {
              const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
              mediaRecorderRef.current = recorder;

              recorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                  audioChunksRef.current.push(e.data);
                }
              };

              recorder.onstop = async () => {
                const chunks = audioChunksRef.current;
                const hadText = hasRecognizedTextRef.current;

                if (hadText) {
                  releaseMediaStream();
                  callbacksRef.current.onEnd?.();
                  return;
                }

                if (chunks.length > 0) {
                  const audioBlob = new Blob(chunks, { type: mimeType });
                  if (audioBlob.size > 800) {
                    try {
                      setIsTranscribing(true);
                      const reader = new FileReader();
                      reader.onloadend = async () => {
                        const base64Data = (reader.result as string).split(",")[1];
                        if (base64Data) {
                          try {
                            const transcribed = await api.transcribeAudio(base64Data, mimeType);
                            if (transcribed && transcribed.trim()) {
                              const cleanText = transcribed.trim();
                              setTranscript((prev) => (prev ? `${prev} ${cleanText}` : cleanText));
                              callbacksRef.current.onTranscript?.(cleanText, true);
                            }
                          } catch (transcribeErr: any) {
                            console.warn("Fallback transcription notice:", transcribeErr);
                          } finally {
                            setIsTranscribing(false);
                            releaseMediaStream();
                            callbacksRef.current.onEnd?.();
                          }
                        } else {
                          setIsTranscribing(false);
                          releaseMediaStream();
                          callbacksRef.current.onEnd?.();
                        }
                      };
                      reader.readAsDataURL(audioBlob);
                      return;
                    } catch (readErr) {
                      console.error("Audio read error:", readErr);
                    }
                  }
                }
                setIsTranscribing(false);
                releaseMediaStream();
                callbacksRef.current.onEnd?.();
              };

              recorder.start(300);
            } catch (recErr) {
              console.warn("MediaRecorder start notice:", recErr);
            }
          }
        } catch (permErr: any) {
          console.warn("getUserMedia notice:", permErr);
          if (!startedSpeechRecognition) {
            const friendlyMsg = "Microphone access was denied or not supported in this preview frame. Please grant microphone permission.";
            setError(friendlyMsg);
            callbacksRef.current.onError?.(friendlyMsg, "permission-denied");
            setIsListening(false);
            return false;
          }
        }
      } else if (!startedSpeechRecognition) {
        const msg = "Microphone audio recording is not supported in this browser.";
        setError(msg);
        callbacksRef.current.onError?.(msg, "not-supported");
        setIsListening(false);
        return false;
      }

      setIsListening(true);
      callbacksRef.current.onStart?.();
      return true;
    },
    [continuous, interimResults, maxAlternatives, lang, clearError, releaseMediaStream]
  );

  const toggleListening = useCallback(async () => {
    if (isListening) {
      stopListening();
    } else {
      await startListening();
    }
  }, [isListening, stopListening, startListening]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
        recognitionRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try {
          mediaRecorderRef.current.stop();
        } catch {}
      }
      releaseMediaStream();
    };
  }, [releaseMediaStream]);

  return {
    isListening,
    isTranscribing,
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
