import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Keyboard,
  Languages,
  Trash2,
  ClipboardPaste,
  Sparkles,
  Check,
  Wand2,
  Mic,
  Square,
  Copy,
  CheckCheck,
  AlertCircle,
  X,
} from 'lucide-react';
import { InputMode, TransliterationState } from '../transliteration/types';
import {
  getTransliterationCandidates,
  transliterateParagraph,
} from '../transliteration/transliterationService';
import { pasteFromClipboard, copyToClipboard } from '../utils/clipboard';
import { useVoiceTyping } from '../hooks/useVoiceTyping';

interface ManglishEditorProps {
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>> | ((text: string) => void);
  inputMode: InputMode;
  setInputMode: (mode: InputMode) => void;
}

export const ManglishEditor: React.FC<ManglishEditorProps> = ({
  text,
  setText,
  inputMode,
  setInputMode,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textRef = useRef(text);
  textRef.current = text;

  const [suggestionState, setSuggestionState] = useState<TransliterationState>({
    activeWord: '',
    wordStartIndex: -1,
    wordEndIndex: -1,
    candidates: [],
    selectedIndex: 0,
    isOpen: false,
    position: { top: 0, left: 0 },
  });

  const [isTransliteratingAll, setIsTransliteratingAll] = useState(false);
  const [copiedInput, setCopiedInput] = useState(false);

  // Append recognized Malayalam speech safely into the editor without duplicates
  const handleVoiceFinalResult = useCallback(
    (spokenText: string) => {
      if (!spokenText.trim()) return;

      const current = textRef.current.trim();
      const updated = current ? `${current} ${spokenText.trim()}` : spokenText.trim();
      setText(updated);

      // Maintain focus on textarea for seamless continuation
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const len = textareaRef.current.value.length;
          textareaRef.current.setSelectionRange(len, len);
        }
      }, 50);
    },
    [setText]
  );

  // Hook for Web Speech API Malayalam (ml-IN) voice recognition
  const {
    status: voiceStatus,
    isListening,
    isSupported: isVoiceSupported,
    interimTranscript,
    errorMessage: voiceError,
    startListening,
    stopListening,
    clearError: clearVoiceError,
  } = useVoiceTyping({
    onFinalResult: handleVoiceFinalResult,
    lang: 'ml-IN',
  });

  // Helper to extract the English word currently under the cursor
  const getWordAtCursor = (
    val: string,
    cursorPos: number
  ): { word: string; start: number; end: number } | null => {
    if (cursorPos < 0) return null;

    let start = cursorPos;
    while (start > 0 && /[a-zA-Z]/.test(val[start - 1])) {
      start--;
    }

    let end = cursorPos;
    while (end < val.length && /[a-zA-Z]/.test(val[end])) {
      end++;
    }

    if (start === end) return null;
    const word = val.slice(start, end);
    return { word, start, end };
  };

  // Check word under cursor whenever cursor moves or text changes
  const checkCursorWord = useCallback(
    async (currentText: string, cursorPos: number) => {
      if (inputMode !== 'manglish') {
        setSuggestionState((prev) => ({ ...prev, isOpen: false }));
        return;
      }

      const wordInfo = getWordAtCursor(currentText, cursorPos);
      if (!wordInfo || wordInfo.word.length === 0) {
        setSuggestionState((prev) => ({ ...prev, isOpen: false, activeWord: '' }));
        return;
      }

      const candidates = await getTransliterationCandidates(wordInfo.word);
      if (candidates.length > 0) {
        setSuggestionState({
          activeWord: wordInfo.word,
          wordStartIndex: wordInfo.start,
          wordEndIndex: wordInfo.end,
          candidates,
          selectedIndex: 0,
          isOpen: true,
          position: { top: 0, left: 0 },
        });
      } else {
        setSuggestionState((prev) => ({ ...prev, isOpen: false }));
      }
    },
    [inputMode]
  );

  // Commit a candidate into the textarea at the active word location
  const commitCandidate = useCallback(
    (candidate: string, trailingChar = ' ') => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const { wordStartIndex, wordEndIndex } = suggestionState;
      if (wordStartIndex === -1 || wordEndIndex === -1) return;

      const before = text.slice(0, wordStartIndex);
      const after = text.slice(wordEndIndex);
      const newText = before + candidate + trailingChar + after;
      const newCursorPos = before.length + candidate.length + trailingChar.length;

      setText(newText);
      setSuggestionState((prev) => ({ ...prev, isOpen: false, activeWord: '' }));

      // Restore focus and cursor position
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    },
    [suggestionState, text, setText]
  );

  // Handle keyboard navigation for suggestions and trigger keys (Space, Enter, Numbers)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!suggestionState.isOpen || suggestionState.candidates.length === 0) {
      return;
    }

    const { candidates, selectedIndex } = suggestionState;

    // Space or Enter: Commit currently highlighted candidate
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      const chosen = candidates[selectedIndex] || candidates[0];
      commitCandidate(chosen, e.key === 'Enter' ? '\n' : ' ');
      return;
    }

    // Number keys 1-5: Commit candidate by number
    if (/^[1-5]$/.test(e.key)) {
      const numIdx = parseInt(e.key, 10) - 1;
      if (numIdx < candidates.length) {
        e.preventDefault();
        commitCandidate(candidates[numIdx], ' ');
        return;
      }
    }

    // Arrow down: Next candidate
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSuggestionState((prev) => ({
        ...prev,
        selectedIndex: (prev.selectedIndex + 1) % candidates.length,
      }));
      return;
    }

    // Arrow up: Previous candidate
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSuggestionState((prev) => ({
        ...prev,
        selectedIndex: (prev.selectedIndex - 1 + candidates.length) % candidates.length,
      }));
      return;
    }

    // Escape: Close suggestions without committing
    if (e.key === 'Escape') {
      e.preventDefault();
      setSuggestionState((prev) => ({ ...prev, isOpen: false }));
      return;
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (['ArrowUp', 'ArrowDown', 'Enter', 'Escape'].includes(e.key)) {
      return;
    }
    const cursorPos = textareaRef.current?.selectionStart ?? text.length;
    checkCursorWord(text, cursorPos);
  };

  const handleClick = () => {
    const cursorPos = textareaRef.current?.selectionStart ?? text.length;
    checkCursorWord(text, cursorPos);
  };

  const handlePaste = async () => {
    const clipboardText = await pasteFromClipboard();
    if (clipboardText) {
      setText(text ? `${text} ${clipboardText}` : clipboardText);
    }
  };

  const handleCopy = async () => {
    if (!text) return;
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedInput(true);
      setTimeout(() => setCopiedInput(false), 2000);
    }
  };

  const handleSelectAll = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  };

  const handleClear = () => {
    setText('');
    setSuggestionState((prev) => ({ ...prev, isOpen: false, activeWord: '' }));
    textareaRef.current?.focus();
  };

  const handleLoadSample = () => {
    const sample = 'മലയാളം ഒരു മനോഹരമായ ഭാഷയാണ്. ഇവിടെ നിങ്ങൾക്ക് എളുപ്പത്തിൽ മലയാളം ടൈപ്പ് ചെയ്യാം.';
    setText(sample);
    textareaRef.current?.focus();
  };

  const handleTransliterateAll = async () => {
    if (!text.trim()) return;
    setIsTransliteratingAll(true);
    try {
      const result = await transliterateParagraph(text);
      setText(result);
    } finally {
      setIsTransliteratingAll(false);
    }
  };

  // Close suggestions if clicked outside
  useEffect(() => {
    const handleClickOutside = (evt: MouseEvent) => {
      if (
        textareaRef.current &&
        !textareaRef.current.contains(evt.target as Node)
      ) {
        setSuggestionState((prev) => ({ ...prev, isOpen: false }));
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Editor Main Container */}
      <div className="rounded-3xl bg-white dark:bg-brand-black-card border border-slate-200/90 dark:border-slate-800/90 shadow-apple dark:shadow-apple-dark overflow-hidden transition-all duration-300">
        
        {/* Editor Top Bar: Mode Toggle & Action Buttons */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/40 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
          
          {/* Mode Switch Pills & Voice Typing Trigger */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-200/60 dark:bg-slate-800 border border-slate-300/40 dark:border-slate-700/60 text-xs">
              <button
                onClick={() => setInputMode('manglish')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                  inputMode === 'manglish'
                    ? 'bg-brand-blue text-white shadow-sm shadow-brand-blue/30 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Languages className="w-3.5 h-3.5" />
                <span>Manglish Typing</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
              </button>

              <button
                onClick={() => {
                  setInputMode('direct');
                  setSuggestionState((prev) => ({ ...prev, isOpen: false }));
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                  inputMode === 'direct'
                    ? 'bg-brand-blue text-white shadow-sm shadow-brand-blue/30 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Keyboard className="w-3.5 h-3.5" />
                <span>Direct Malayalam</span>
              </button>
            </div>

            {/* Malayalam Voice Typing Primary Action */}
            {isVoiceSupported ? (
              <button
                onClick={isListening ? stopListening : startListening}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-semibold text-xs transition-all border ${
                  isListening
                    ? 'bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-500/30 animate-pulse'
                    : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/20 dark:border-rose-500/30 shadow-sm'
                }`}
                title="Malayalam Voice Typing (ml-IN) - Speak to type in Malayalam"
              >
                {isListening ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-white" />
                    <span>Stop Listening</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                    <span>Voice Typing</span>
                  </>
                )}
              </button>
            ) : (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 cursor-not-allowed"
                title="Voice typing requires Google Chrome, Microsoft Edge, or Safari"
              >
                <Mic className="w-3 h-3 opacity-50" />
                <span>Voice (Chrome/Safari)</span>
              </span>
            )}
          </div>

          {/* Utility Controls: Sample, Select All, Copy, Paste, Clear */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 text-xs">
            {/* Transliterate All button (visible if English text detected) */}
            {/[a-zA-Z]{2,}/.test(text) && (
              <button
                onClick={handleTransliterateAll}
                disabled={isTransliteratingAll}
                title="Convert all English words in editor to Malayalam"
                className="px-2.5 py-1.5 rounded-xl text-brand-blue bg-brand-blue/10 hover:bg-brand-blue/20 transition-colors font-medium flex items-center gap-1 text-[11px]"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>{isTransliteratingAll ? 'Converting...' : 'Transliterate All'}</span>
              </button>
            )}

            <button
              onClick={handleLoadSample}
              className="px-2.5 py-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors font-medium flex items-center gap-1 text-[11px]"
              title="Load example Malayalam sentence"
            >
              <Sparkles className="w-3 h-3 text-brand-blue" />
              <span className="hidden sm:inline">Sample</span>
            </button>

            {text && (
              <>
                <button
                  onClick={handleSelectAll}
                  className="px-2 py-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors font-medium text-[11px]"
                  title="Select all text"
                >
                  Select All
                </button>

                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors font-medium flex items-center gap-1 text-[11px]"
                  title="Copy editor text"
                >
                  {copiedInput ? (
                    <>
                      <CheckCheck className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-500 font-semibold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </>
            )}

            <button
              onClick={handlePaste}
              className="px-2.5 py-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors font-medium flex items-center gap-1 text-[11px]"
              title="Paste from clipboard"
            >
              <ClipboardPaste className="w-3 h-3" />
              <span>Paste</span>
            </button>

            {text && (
              <button
                onClick={handleClear}
                className="px-2.5 py-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors font-medium flex items-center gap-1 text-[11px]"
                title="Clear text"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Clear Instructional Banner (Requirement 1) */}
        <div className="px-6 py-2.5 border-b border-slate-100/80 dark:border-slate-800/60 bg-slate-50/40 dark:bg-slate-900/20 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
          <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
            <Languages className="w-3.5 h-3.5 text-brand-blue" />
            <span>Type in English letters to write in Malayalam</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800 font-mono text-[10px] text-slate-700 dark:text-slate-300 border border-slate-300/40 dark:border-slate-700/50">
              SPACE
            </span>
            <span>Press SPACE to convert</span>
          </div>
        </div>

        {/* Voice Typing Dynamic Status Banner (Requirement 3) */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-b border-rose-200/80 dark:border-rose-900/60 bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent px-6 py-3 flex flex-wrap items-center justify-between gap-3"
            >
              <div className="flex items-center space-x-3">
                {/* Animated pulsating microphone indicator */}
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </span>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 tracking-wide uppercase font-mono">
                      {voiceStatus === 'processing'
                        ? 'Converting your speech...'
                        : 'Listening... (Speak in Malayalam)'}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono bg-rose-500/10 text-rose-500 font-semibold">
                      ml-IN
                    </span>
                  </div>

                  {interimTranscript ? (
                    <p className="text-sm font-malayalam text-slate-900 dark:text-white italic">
                      "{interimTranscript}"
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Speak clearly into your microphone in Malayalam. Your words will appear in the editor.
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={stopListening}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Square className="w-3 h-3 fill-white" />
                <span>Stop Listening</span>
              </button>
            </motion.div>
          )}

          {/* Voice Typing Error Notification */}
          {voiceError && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-amber-200 dark:border-amber-900/50 bg-amber-500/10 px-6 py-2.5 flex items-center justify-between text-xs text-amber-700 dark:text-amber-300"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{voiceError}</span>
              </div>
              <button
                onClick={clearVoiceError}
                className="p-1 rounded-lg hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 transition-colors"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Textarea Area with Universal Placeholders (Requirement 1 & 2) */}
        <div className="relative p-6 sm:p-8 min-h-[280px] sm:min-h-[340px] flex flex-col">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => {
              const val = e.target.value;
              setText(val);
              checkCursorWord(val, e.target.selectionStart);
            }}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            onClick={handleClick}
            placeholder={
              inputMode === 'manglish'
                ? 'മലയാളം ഒരു മനോഹരമായ ഭാഷയാണ്. ഇവിടെ തുടങ്ങാം...'
                : 'നിങ്ങൾക്ക് മലയാളത്തിൽ എന്തും ടൈപ്പ് ചെയ്യാം.'
            }
            className="w-full flex-1 bg-transparent resize-none border-0 text-slate-900 dark:text-slate-100 placeholder-slate-400/80 dark:placeholder-slate-600 text-lg sm:text-2xl font-malayalam focus:outline-none focus:ring-0 leading-relaxed min-h-[220px]"
            spellCheck={false}
            autoFocus
          />

          {/* Floating Suggestion Box */}
          {suggestionState.isOpen && suggestionState.candidates.length > 0 && (
            <div className="absolute left-6 sm:left-8 bottom-14 z-30 max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-brand-blue/30 dark:border-brand-blue/40 shadow-2xl p-1.5 flex flex-wrap items-center gap-1 animate-in fade-in slide-in-from-bottom-2 duration-150 backdrop-blur-xl">
              <span className="text-[10px] text-brand-blue font-semibold uppercase tracking-wider px-2 py-0.5">
                Suggestions:
              </span>
              {suggestionState.candidates.slice(0, 5).map((candidate, idx) => (
                <button
                  key={idx}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    commitCandidate(candidate, ' ');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-sm font-malayalam transition-all flex items-center gap-1.5 ${
                    suggestionState.selectedIndex === idx
                      ? 'bg-brand-blue text-white font-bold shadow-md shadow-brand-blue/20 scale-105'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="text-[10px] opacity-60 font-mono">{idx + 1}.</span>
                  <span>{candidate}</span>
                  {suggestionState.selectedIndex === idx && (
                    <Check className="w-3 h-3 text-white ml-0.5" />
                  )}
                </button>
              ))}
              <span className="text-[10px] text-slate-400 font-mono px-1.5">
                Space/Enter to accept
              </span>
            </div>
          )}
        </div>

        {/* Editor Bottom Meta Bar */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 flex flex-wrap items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-3">
            <span>{charCount} characters</span>
            <span>•</span>
            <span>{wordCount} words</span>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            {inputMode === 'manglish' ? (
              <span>Phonetic Mode: Press SPACE after each word to convert</span>
            ) : (
              <span>Direct Unicode Malayalam Mode</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
