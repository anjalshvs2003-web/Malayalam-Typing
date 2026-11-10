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
  Volume2,
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

  // Baseline editor text saved when voice typing session starts
  const baseVoiceTextRef = useRef<string>('');

  // FAST WORD-BY-WORD STREAMING VOICE TYPING HANDLER
  // Updates editor immediately when a word is spoken
  const handleLiveVoiceChunk = useCallback(
    (liveSessionText: string, isFinal: boolean) => {
      if (!liveSessionText.trim()) return;

      const base = baseVoiceTextRef.current;
      const combined = base ? `${base} ${liveSessionText.trim()}` : liveSessionText.trim();
      setText(combined);

      if (isFinal) {
        baseVoiceTextRef.current = combined;
      }

      // Auto-scroll textarea down as speech arrives
      if (textareaRef.current) {
        textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
      }
    },
    [setText]
  );

  // Hook for Web Speech API Malayalam voice recognition
  const {
    status: voiceStatus,
    isListening,
    isSpeaking,
    isSupported: isVoiceSupported,
    interimTranscript,
    errorMessage: voiceError,
    voiceLang,
    setVoiceLang,
    startListening,
    stopListening,
    clearError: clearVoiceError,
  } = useVoiceTyping({
    onLiveChunk: handleLiveVoiceChunk,
    lang: 'ml-IN',
  });

  const handleStartVoice = () => {
    baseVoiceTextRef.current = textRef.current.trim();
    startListening();
  };

  const handleStopVoice = () => {
    stopListening();
    // Re-focus cursor at the end of the text
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const len = textareaRef.current.value.length;
        textareaRef.current.setSelectionRange(len, len);
      }
    }, 100);
  };

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
    baseVoiceTextRef.current = '';
    setSuggestionState((prev) => ({ ...prev, isOpen: false, activeWord: '' }));
    textareaRef.current?.focus();
  };

  const handleLoadSample = () => {
    const sample = 'മലയാളം ഒരു മനോഹരമായ ഭാഷയാണ്. ഇവിടെ നിങ്ങൾക്ക് എളുപ്പത്തിൽ മലയാളം ടൈപ്പ് ചെയ്യാം.';
    setText(sample);
    baseVoiceTextRef.current = sample;
    textareaRef.current?.focus();
  };

  const handleTransliterateAll = async () => {
    if (!text.trim()) return;
    setIsTransliteratingAll(true);
    try {
      const result = await transliterateParagraph(text);
      setText(result);
      baseVoiceTextRef.current = result;
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
          
          {/* Mode Switch Pills & Voice Typing Primary Trigger */}
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
                onClick={isListening ? handleStopVoice : handleStartVoice}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl font-semibold text-xs transition-all border ${
                  isListening
                    ? 'bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-500/30'
                    : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/20 dark:border-rose-500/30 shadow-sm'
                }`}
                title="Malayalam Voice Typing - Speak any word to type it instantly"
              >
                {isListening ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-white" />
                    <span>Stop Voice Typing</span>
                    <span className="w-2 h-2 rounded-full bg-white animate-ping ml-0.5" />
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                    <span>Voice Typing</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 font-mono">
                      Fast
                    </span>
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

        {/* FAST REAL-TIME VOICE TYPING LIVE BAR */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-b border-rose-200/80 dark:border-rose-900/60 bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent px-6 py-3 flex flex-wrap items-center justify-between gap-3"
            >
              <div className="flex items-center space-x-3.5">
                {/* Real-time Animated Soundwave Visualizer */}
                <div className="flex items-center gap-1 h-5 px-1">
                  {[40, 90, 60, 100, 50].map((h, i) => (
                    <motion.span
                      key={i}
                      animate={{
                        scaleY: isSpeaking ? [0.25, h / 100, 0.35] : 0.25,
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.35 + i * 0.08,
                        ease: 'easeInOut',
                      }}
                      className="w-1 bg-rose-500 rounded-full origin-bottom h-full"
                    />
                  ))}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 tracking-wide uppercase font-mono flex items-center gap-1.5">
                      {isSpeaking ? (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                          <span>Speaking... Typing Live</span>
                        </>
                      ) : voiceStatus === 'processing' ? (
                        <span>Converting speech...</span>
                      ) : (
                        <span>Listening... Speak any Malayalam word</span>
                      )}
                    </span>

                    {/* Language Engine Switcher */}
                    <div className="flex items-center gap-1 bg-white/80 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] ml-1">
                      <button
                        onClick={() => setVoiceLang('ml-IN')}
                        className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                          voiceLang === 'ml-IN'
                            ? 'bg-rose-500 text-white font-bold'
                            : 'text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white'
                        }`}
                        title="Native Malayalam speech model (ml-IN)"
                      >
                        മലയാളം
                      </button>
                      <button
                        onClick={() => setVoiceLang('en-IN')}
                        className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                          voiceLang === 'en-IN'
                            ? 'bg-rose-500 text-white font-bold'
                            : 'text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white'
                        }`}
                        title="Phonetic Manglish voice model (speak phonetically)"
                      >
                        Manglish
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {interimTranscript ? (
                      <span className="font-malayalam text-slate-900 dark:text-white font-medium">
                        Live stream: "{interimTranscript}"
                      </span>
                    ) : (
                      'Speak one word or full sentences — text appears live in the editor as you speak.'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleStopVoice}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Square className="w-3 h-3 fill-white" />
                  <span>Done / Stop</span>
                </button>
              </div>
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
              baseVoiceTextRef.current = val.trim();
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
            {isListening ? (
              <span className="text-rose-500 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                Live Voice Stream Active (Speak single words or full sentences)
              </span>
            ) : inputMode === 'manglish' ? (
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
