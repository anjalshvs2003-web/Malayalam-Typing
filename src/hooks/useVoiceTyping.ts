import { useState, useRef, useEffect, useCallback } from 'react';

export type VoiceTypingStatus = 'idle' | 'listening' | 'processing' | 'completed' | 'error';

export interface UseVoiceTypingOptions {
  onFinalResult?: (text: string) => void;
  lang?: string;
}

export interface UseVoiceTypingReturn {
  status: VoiceTypingStatus;
  isListening: boolean;
  isSupported: boolean;
  interimTranscript: string;
  errorMessage: string | null;
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

export function useVoiceTyping({
  onFinalResult,
  lang = 'ml-IN',
}: UseVoiceTypingOptions = {}): UseVoiceTypingReturn {
  const [status, setStatus] = useState<VoiceTypingStatus>('idle');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const isExplicitStopRef = useRef<boolean>(false);
  const onFinalResultRef = useRef(onFinalResult);
  onFinalResultRef.current = onFinalResult;

  // Check Web Speech API support safely across SSR / browser environments
  const isSupported =
    typeof window !== 'undefined' &&
    Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  const stopListening = useCallback(() => {
    isExplicitStopRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Recognition already stopped
      }
    }
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

    // Stop any existing session
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // Safe fallback
      }
    }

    try {
      const SpeechRecognitionConstructor =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      const recognition = new SpeechRecognitionConstructor();
      recognitionRef.current = recognition;

      recognition.lang = lang; // 'ml-IN' for Malayalam (India)
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

      recognition.onresult = (event: any) => {
        let finalChunk = '';
        let interimChunk = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          const transcriptText = item[0]?.transcript || '';

          if (item.isFinal) {
            finalChunk += transcriptText;
          } else {
            interimChunk += transcriptText;
          }
        }

        if (finalChunk.trim()) {
          setStatus('completed');
          onFinalResultRef.current?.(finalChunk.trim());
          setInterimTranscript('');

          // Return to listening state after a brief moment if not stopped
          setTimeout(() => {
            if (!isExplicitStopRef.current && recognitionRef.current) {
              setStatus('listening');
            }
          }, 800);
        } else if (interimChunk.trim()) {
          setStatus('processing');
          setInterimTranscript(interimChunk.trim());
        }
      };

      recognition.onerror = (event: any) => {
        // If aborted explicitly by user, don't show error
        if (event.error === 'aborted' && isExplicitStopRef.current) {
          setStatus('idle');
          return;
        }

        let userMsg = 'An error occurred during voice recognition.';

        switch (event.error) {
          case 'not-allowed':
          case 'service-not-allowed':
            userMsg =
              'Microphone permission was denied. Please allow microphone access in your browser settings to use voice typing.';
            break;
          case 'no-speech':
            userMsg = 'No Malayalam speech was detected. Please try speaking again.';
            break;
          case 'network':
            userMsg =
              'Network error: Malayalam speech recognition requires an active internet connection.';
            break;
          case 'audio-capture':
            userMsg = 'No microphone was detected. Please connect a microphone and try again.';
            break;
          default:
            userMsg = `Voice recognition error: ${event.error || 'Unknown issue'}.`;
            break;
        }

        setErrorMessage(userMsg);
        setStatus('error');
        setInterimTranscript('');
      };

      recognition.onend = () => {
        if (!isExplicitStopRef.current && status === 'listening') {
          // In Chrome, continuous recognition may pause on long silence. Re-engage gracefully.
          try {
            recognition.start();
          } catch {
            setStatus('idle');
          }
        } else if (isExplicitStopRef.current) {
          setStatus('idle');
        }
      };

      recognition.start();
    } catch (err: any) {
      console.error('Voice typing initialization error:', err);
      setStatus('error');
      setErrorMessage(
        err?.message || 'Could not start voice recognition. Please check microphone permissions.'
      );
    }
  }, [isSupported, lang, status]);

  // Clean up recognition instance on component unmount
  useEffect(() => {
    return () => {
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
    isSupported,
    interimTranscript,
    errorMessage,
    startListening,
    stopListening,
    clearError,
  };
}
