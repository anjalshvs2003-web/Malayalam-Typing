import { useState, useRef, useEffect, useCallback } from 'react';
import { transliterateOfflineWord } from '../transliteration/offlineEngine';

export type VoiceTypingStatus = 'idle' | 'listening' | 'processing' | 'completed' | 'error';
export type VoiceLanguageMode = 'ml-IN' | 'en-IN';

export interface UseVoiceTypingOptions {
  onLiveChunk?: (chunk: string, isFinal: boolean) => void;
  lang?: VoiceLanguageMode;
}

export interface UseVoiceTypingReturn {
  status: VoiceTypingStatus;
  isListening: boolean;
  isSpeaking: boolean;
  isSupported: boolean;
  interimTranscript: string;
  errorMessage: string | null;
  voiceLang: VoiceLanguageMode;
  setVoiceLang: (lang: VoiceLanguageMode) => void;
  startListening: () => void;
  stopListening: () => void;
  clearError: () => void;
}

// Window type augmentation for Web Speech API
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

/**
 * Enhances recognized speech text.
 * If any English/Romanized phonetic words appear, instantly converts them to Malayalam Unicode.
 * Preserves existing Malayalam script and numbers.
 */
export function enhanceMalayalamSpeech(rawText: string): string {
  if (!rawText || !rawText.trim()) return '';

  const tokens = rawText.trim().split(/\s+/);
  const converted = tokens.map((tok) => {
    // Pure Malayalam or punctuation
    if (/^[ഀ-ൿ0-9\s.,!?:;'"()-]+$/.test(tok)) {
      return tok;
    }

    // Contains English letters: phonetic conversion
    const cleanWord = tok.replace(/[^a-zA-Z]/g, '').toLowerCase();
    if (cleanWord.length > 0) {
      const candidates = transliterateOfflineWord(cleanWord);
      if (candidates && candidates.length > 0) {
        return tok.replace(/[a-zA-Z]+/g, candidates[0]);
      }
    }

    return tok;
  });

  return converted.join(' ').replace(/\s+([.,!?])/g, '$1');
}

export function useVoiceTyping({
  onLiveChunk,
  lang = 'ml-IN',
}: UseVoiceTypingOptions = {}): UseVoiceTypingReturn {
  const [status, setStatus] = useState<VoiceTypingStatus>('idle');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [voiceLang, setVoiceLang] = useState<VoiceLanguageMode>(lang);

  const recognitionRef = useRef<any>(null);
  const isExplicitStopRef = useRef<boolean>(false);
  const statusRef = useRef<VoiceTypingStatus>('idle');
  statusRef.current = status;

  const onLiveChunkRef = useRef(onLiveChunk);
  onLiveChunkRef.current = onLiveChunk;

  const speakingTimeoutRef = useRef<any>(null);

  // Check Web Speech API support safely
  const isSupported =
    typeof window !== 'undefined' &&
    Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  const markSpeaking = useCallback(() => {
    setIsSpeaking(true);
    if (speakingTimeoutRef.current) {
      clearTimeout(speakingTimeoutRef.current);
    }
    speakingTimeoutRef.current = setTimeout(() => {
      setIsSpeaking(false);
    }, 1500);
  }, []);

  const stopListening = useCallback(() => {
    isExplicitStopRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Recognition already stopped
      }
    }
    setIsSpeaking(false);
    setInterimTranscript('');
    setStatus('idle');
  }, []);

  const clearError = useCallback(() => {
    setErrorMessage(null);
    setStatus('idle');
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setStatus('error');
      setErrorMessage(
        'Malayalam Voice Typing is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Safari.'
      );
      return;
    }

    // Stop existing session safely
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // Safe ignore
      }
    }

    try {
      const SpeechRecognitionConstructor =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      const recognition = new SpeechRecognitionConstructor();
      recognitionRef.current = recognition;

      recognition.lang = voiceLang; // 'ml-IN' or 'en-IN'
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      isExplicitStopRef.current = false;
      setErrorMessage(null);
      setInterimTranscript('');
      setStatus('listening');

      recognition.onstart = () => {
        setStatus('listening');
      };

      recognition.onspeechstart = () => {
        markSpeaking();
      };

      recognition.onsoundstart = () => {
        markSpeaking();
      };

      recognition.onspeechend = () => {
        // Let speaking indicator transition softly
        if (speakingTimeoutRef.current) {
          clearTimeout(speakingTimeoutRef.current);
        }
        speakingTimeoutRef.current = setTimeout(() => {
          setIsSpeaking(false);
        }, 600);
      };

      // FAST REAL-TIME WORD-BY-WORD STREAMING
      recognition.onresult = (event: any) => {
        markSpeaking();

        let liveFullString = '';
        let hasFinal = false;

        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          const transcriptChunk = res[0]?.transcript || '';
          if (transcriptChunk) {
            liveFullString += (liveFullString ? ' ' : '') + transcriptChunk.trim();
          }
          if (res.isFinal) {
            hasFinal = true;
          }
        }

        // Clean & enhance with phonetic Malayalam normalization
        const enhancedLive = enhanceMalayalamSpeech(liveFullString);

        if (enhancedLive) {
          setInterimTranscript(enhancedLive);
          setStatus(hasFinal ? 'completed' : 'processing');

          // Deliver directly to editor in real time!
          onLiveChunkRef.current?.(enhancedLive, hasFinal);

          // If final, return status back to listening for continuous speech
          if (hasFinal) {
            setTimeout(() => {
              if (!isExplicitStopRef.current && recognitionRef.current) {
                setStatus('listening');
              }
            }, 300);
          }
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'aborted' && isExplicitStopRef.current) {
          setStatus('idle');
          return;
        }

        let userMsg = 'Voice recognition error.';

        switch (event.error) {
          case 'not-allowed':
          case 'service-not-allowed':
            userMsg =
              'Microphone access was denied. Please allow microphone permissions in your browser settings to use voice typing.';
            break;
          case 'no-speech':
            // Don't show hard error for normal silent pauses; keep listening active
            return;
          case 'network':
            userMsg =
              'Network error: Speech recognition requires an active internet connection.';
            break;
          case 'audio-capture':
            userMsg = 'No microphone detected. Please check your audio input settings.';
            break;
          default:
            userMsg = `Voice recognition error (${event.error || 'unknown'}).`;
            break;
        }

        setErrorMessage(userMsg);
        setStatus('error');
        setInterimTranscript('');
        setIsSpeaking(false);
      };

      recognition.onend = () => {
        setIsSpeaking(false);
        if (!isExplicitStopRef.current && statusRef.current !== 'error') {
          // Continuous listening: restart automatically if disconnected by pause
          try {
            recognition.start();
          } catch {
            setStatus('idle');
          }
        } else {
          setStatus('idle');
        }
      };

      recognition.start();
    } catch (err: any) {
      console.error('Speech recognition startup error:', err);
      setStatus('error');
      setErrorMessage(
        err?.message || 'Could not start voice recognition. Please verify microphone permissions.'
      );
    }
  }, [isSupported, voiceLang, markSpeaking]);

  useEffect(() => {
    return () => {
      if (speakingTimeoutRef.current) {
        clearTimeout(speakingTimeoutRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Cleanup
        }
      }
    };
  }, []);

  return {
    status,
    isListening: status === 'listening' || status === 'processing',
    isSpeaking,
    isSupported,
    interimTranscript,
    errorMessage,
    voiceLang,
    setVoiceLang,
    startListening,
    stopListening,
    clearError,
  };
}
