import { useState, useEffect } from 'react';
import { HistoryEntry, FontFormatId } from '../engine/types';

const STORAGE_KEY = 'malayalam_text_lab_history_v1';
const MAX_HISTORY = 40;

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to load conversion history from localStorage:', e);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save history to localStorage:', e);
    }
  }, [history]);

  const addEntry = (
    inputText: string,
    outputText: string,
    sourceFormat: FontFormatId,
    targetFormat: FontFormatId
  ) => {
    if (!inputText.trim() || !outputText.trim()) return;

    // Avoid duplicate adjacent entries
    if (
      history.length > 0 &&
      history[0].inputText === inputText &&
      history[0].sourceFormat === sourceFormat &&
      history[0].targetFormat === targetFormat
    ) {
      return;
    }

    const newEntry: HistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      sourceFormat,
      targetFormat,
      inputText,
      outputText,
      charCount: outputText.length,
    };

    setHistory((prev) => [newEntry, ...prev.slice(0, MAX_HISTORY - 1)]);
  };

  const removeEntry = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return {
    history,
    addEntry,
    removeEntry,
    clearHistory,
  };
}
