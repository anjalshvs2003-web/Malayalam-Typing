import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Keyboard,
  Languages,
  Trash2,
  ClipboardPaste,
  Sparkles,
  Check,
  Wand2,
} from 'lucide-react';
import { InputMode, TransliterationState } from '../transliteration/types';
import {
  getTransliterationCandidates,
  transliterateParagraph,
} from '../transliteration/transliterationService';
import { pasteFromClipboard } from '../utils/clipboard';

interface ManglishEditorProps {
  text: string;
  setText: (text: string) => void;
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

  // Helper to extract the English word currently under the cursor
  const getWordAtCursor = (
    val: string,
    cursorPos: number
  ): { word: string; start: number; end: number } | null => {
    if (cursorPos < 0) return null;

    // Look backward for start of English word
    let start = cursorPos;
    while (start > 0 && /[a-zA-Z]/.test(val[start - 1])) {
      start--;
    }

    // Look forward for end of English word
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
    // Ignore navigation keys handled in keydown
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

  const handleClear = () => {
    setText('');
    setSuggestionState((prev) => ({ ...prev, isOpen: false, activeWord: '' }));
    textareaRef.current?.focus();
  };

  const handleLoadSample = () => {
    const sample = 'എന്റെ പേര് അഞ്ജൽഷ് ആണ്. മലയാളം നമ്മുടെ അഭിമാനമാണ്.';
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
          
          {/* Mode Switch Pills */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-200/60 dark:bg-slate-800 border border-slate-300/40 dark:border-slate-700/60 text-xs">
            <button
              onClick={() => setInputMode('manglish')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-medium transition-all ${
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
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-medium transition-all ${
                inputMode === 'direct'
                  ? 'bg-brand-blue text-white shadow-sm shadow-brand-blue/30 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>Direct Malayalam</span>
            </button>
          </div>

          {/* Utility Controls: Sample, Paste, Transliterate All, Clear */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs">
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
              <span>Sample</span>
            </button>

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

        {/* Main Textarea Area */}
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
                ? "Type Malayalam using English letters (e.g. 'ente peru anjalsh aanu'). Press Space to transliterate..."
                : "ഇവിടെ മലയാളം ടൈപ്പ് ചെയ്യുക അല്ലെങ്കിൽ പേസ്റ്റ് ചെയ്യുക..."
            }
            className="w-full flex-1 bg-transparent resize-none border-0 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 text-lg sm:text-2xl font-malayalam focus:outline-none focus:ring-0 leading-relaxed min-h-[220px]"
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

          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            {inputMode === 'manglish' ? (
              <span>Phonetic Mode: Press Space after each word</span>
            ) : (
              <span>Direct Unicode Mode</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
