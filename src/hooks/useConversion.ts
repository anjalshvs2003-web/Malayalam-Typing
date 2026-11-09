import { useState, useEffect, useCallback, useRef } from 'react';
import { FontFormatId, TextStats } from '../engine/types';
import { convertText } from '../engine/conversionRegistry';
import { calculateTextStats } from '../utils/textStats';

interface UseConversionProps {
  onSuccess?: (input: string, output: string, source: FontFormatId, target: FontFormatId) => void;
}

export function useConversion({ onSuccess }: UseConversionProps = {}) {
  const [sourceFormat, setSourceFormat] = useState<FontFormatId>('unicode');
  const [targetFormat, setTargetFormat] = useState<FontFormatId>('mltt-karthika');
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [autoConvert, setAutoConvert] = useState<boolean>(true);
  const [durationMs, setDurationMs] = useState<number>(0);
  const [justConverted, setJustConverted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedInputRef = useRef<string>('');

  const inputStats: TextStats = calculateTextStats(inputText);
  const outputStats: TextStats = calculateTextStats(outputText);

  const performConversion = useCallback(
    (text: string, src: FontFormatId, tgt: FontFormatId, recordHistory = false) => {
      if (!text || !text.trim()) {
        setOutputText('');
        setDurationMs(0);
        setErrorMessage(null);
        return;
      }

      setIsConverting(true);
      setErrorMessage(null);

      try {
        const result = convertText(text, src, tgt);
        setOutputText(result.outputText);
        setDurationMs(result.durationMs);

        // Flash converted animation state
        setJustConverted(true);
        setTimeout(() => setJustConverted(false), 900);

        if (recordHistory && onSuccess && text.trim().length > 0) {
          lastSavedInputRef.current = text;
          onSuccess(text, result.outputText, src, tgt);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Conversion failed.';
        setErrorMessage(msg);
        console.error('Conversion error:', err);
      } finally {
        setIsConverting(false);
      }
    },
    [onSuccess]
  );

  // Debounced auto-conversion on input or format change
  useEffect(() => {
    if (!autoConvert) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!inputText.trim()) {
      setOutputText('');
      setDurationMs(0);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      performConversion(inputText, sourceFormat, targetFormat, false);
    }, 120);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inputText, sourceFormat, targetFormat, autoConvert, performConversion]);

  // Manual convert trigger (also commits to history)
  const convertNow = useCallback(() => {
    performConversion(inputText, sourceFormat, targetFormat, true);
  }, [inputText, sourceFormat, targetFormat, performConversion]);

  // Swap Source and Target formats
  const swapFormats = useCallback(() => {
    const prevSource = sourceFormat;
    const prevTarget = targetFormat;
    const prevOutput = outputText;

    setSourceFormat(prevTarget);
    setTargetFormat(prevSource);

    // If we have output text, set it as the new input text
    if (prevOutput) {
      setInputText(prevOutput);
      performConversion(prevOutput, prevTarget, prevSource, true);
    }
  }, [sourceFormat, targetFormat, outputText, performConversion]);

  const clearInput = useCallback(() => {
    setInputText('');
    setOutputText('');
    setErrorMessage(null);
  }, []);

  const loadSample = useCallback(
    (sampleText: string) => {
      setSourceFormat('unicode');
      setInputText(sampleText);
      performConversion(sampleText, 'unicode', targetFormat, true);
    },
    [targetFormat, performConversion]
  );

  return {
    sourceFormat,
    setSourceFormat,
    targetFormat,
    setTargetFormat,
    inputText,
    setInputText,
    outputText,
    setOutputText,
    isConverting,
    autoConvert,
    setAutoConvert,
    durationMs,
    justConverted,
    errorMessage,
    inputStats,
    outputStats,
    convertNow,
    swapFormats,
    clearInput,
    loadSample,
  };
}
