import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftRight,
  Copy,
  Check,
  Download,
  Trash2,
  ClipboardPaste,
  Sparkles,
  Zap,
  Info,
  BookOpen,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  FORMAT_MAP,
  SAMPLE_TEXTS,
} from '../engine/conversionRegistry';
import { FontFormatId } from '../engine/types';
import { copyToClipboard, pasteFromClipboard } from '../utils/clipboard';
import { downloadTextAsFile } from '../utils/download';

interface ConverterProps {
  sourceFormat: FontFormatId;
  setSourceFormat: (fmt: FontFormatId) => void;
  targetFormat: FontFormatId;
  setTargetFormat: (fmt: FontFormatId) => void;
  inputText: string;
  setInputText: (text: string) => void;
  outputText: string;
  setOutputText: (text: string) => void;
  isConverting: boolean;
  autoConvert: boolean;
  setAutoConvert: (auto: boolean) => void;
  durationMs: number;
  justConverted: boolean;
  errorMessage: string | null;
  inputStats: { characters: number; words: number; lines: number };
  outputStats: { characters: number; words: number; lines: number };
  convertNow: () => void;
  swapFormats: () => void;
  clearInput: () => void;
  loadSample: (text: string) => void;
}

export const Converter: React.FC<ConverterProps> = ({
  sourceFormat,
  setSourceFormat,
  targetFormat,
  setTargetFormat,
  inputText,
  setInputText,
  outputText,
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
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [sampleDropdownOpen, setSampleDropdownOpen] = useState<boolean>(false);
  const [isSwapping, setIsSwapping] = useState<boolean>(false);

  const sourceDef = FORMAT_MAP[sourceFormat];
  const targetDef = FORMAT_MAP[targetFormat];

  const handleCopy = async () => {
    if (!outputText) return;
    const ok = await copyToClipboard(outputText);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      try {
        confetti({
          particleCount: 28,
          spread: 45,
          origin: { y: 0.7 },
          colors: ['#1677FF', '#38bdf8', '#DCEBFF'],
        });
      } catch {
        // Confetti is a visual bonus
      }
    }
  };

  const handlePaste = async () => {
    const text = await pasteFromClipboard();
    if (text) {
      setInputText(text);
    }
  };

  const handleDownload = () => {
    if (!outputText) return;
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `malayalam-${targetDef.id}-${timestamp}.txt`;
    downloadTextAsFile(outputText, filename);
  };

  const triggerSwap = () => {
    setIsSwapping(true);
    swapFormats();
    setTimeout(() => setIsSwapping(false), 300);
  };

  return (
    <section id="converter" className="relative py-12 md:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue text-xs font-semibold uppercase tracking-wider mb-2">
            <Zap className="w-3.5 h-3.5" />
            Active Workspace
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Malayalam Text Converter
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time character encoding converter for Malayalam typography.
          </p>
        </div>

        {/* Quick Sample Selector */}
        <div className="relative">
          <button
            onClick={() => setSampleDropdownOpen(!sampleDropdownOpen)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-brand-blue transition-colors shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5 text-brand-blue" />
            <span>Load Sample Text</span>
          </button>

          {sampleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-brand-black-card border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-30 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Select Malayalam Sample
              </div>
              {SAMPLE_TEXTS.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    loadSample(sample.text);
                    setSampleDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300"
                >
                  <p className="font-medium text-slate-900 dark:text-white">{sample.title}</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5 font-malayalam">
                    {sample.text}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Converter Card */}
      <div className="relative rounded-3xl bg-white dark:bg-brand-black-card border border-slate-200/90 dark:border-slate-800/90 shadow-apple dark:shadow-apple-dark overflow-hidden transition-all duration-300">
        
        {/* Controls Toolbar */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/40 backdrop-blur-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Format Selectors and Swap */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            {/* Source Format */}
            <div className="flex-1">
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500 mb-1.5">
                Source Format
              </label>
              <select
                value={sourceFormat}
                onChange={(e) => setSourceFormat(e.target.value as FontFormatId)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue transition-all cursor-pointer"
              >
                <optgroup label="Modern Universal Standard">
                  <option value="unicode">Unicode Malayalam (UTF-8)</option>
                </optgroup>
                <optgroup label="FML Series (Manorama / Panchami)">
                  <option value="fml-manorama">FML — Manorama</option>
                  <option value="fml-panchari">FML — Panchari / Panchami</option>
                </optgroup>
                <optgroup label="ML-TT Series (TrueType DTP)">
                  <option value="mltt-karthika">ML-TT — Karthika</option>
                  <option value="mltt-revathi">ML-TT — Revathi</option>
                  <option value="mltt-ambili">ML-TT — Ambili</option>
                  <option value="mltt-nandini">ML-TT — Nandini</option>
                  <option value="mlbtt-indulekha">MLB-TT — Indulekha (Bold)</option>
                </optgroup>
                <optgroup label="Other Legacy Encodings">
                  <option value="haritha">Haritha</option>
                  <option value="matweb">Matweb (Mathrubhumi)</option>
                  <option value="charaka">Charaka</option>
                  <option value="uma">Uma</option>
                </optgroup>
              </select>
            </div>

            {/* Swap Button */}
            <div className="flex items-center justify-center pt-2 sm:pt-5">
              <button
                onClick={triggerSwap}
                title="Swap Formats and Text"
                className={`p-2.5 rounded-xl bg-slate-200/70 dark:bg-slate-800 hover:bg-brand-blue hover:text-white text-slate-700 dark:text-slate-300 transition-all duration-300 shadow-sm active:scale-90 ${
                  isSwapping ? 'rotate-180 bg-brand-blue text-white' : ''
                }`}
                aria-label="Swap source and target formats"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>
            </div>

            {/* Target Format */}
            <div className="flex-1">
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500 mb-1.5">
                Target Format
              </label>
              <select
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value as FontFormatId)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue transition-all cursor-pointer"
              >
                <optgroup label="ML-TT Series (TrueType DTP)">
                  <option value="mltt-karthika">ML-TT — Karthika</option>
                  <option value="mltt-revathi">ML-TT — Revathi</option>
                  <option value="mltt-ambili">ML-TT — Ambili</option>
                  <option value="mltt-nandini">ML-TT — Nandini</option>
                  <option value="mlbtt-indulekha">MLB-TT — Indulekha (Bold)</option>
                </optgroup>
                <optgroup label="FML Series (Manorama / Panchami)">
                  <option value="fml-manorama">FML — Manorama</option>
                  <option value="fml-panchari">FML — Panchari / Panchami</option>
                </optgroup>
                <optgroup label="Modern Universal Standard">
                  <option value="unicode">Unicode Malayalam (UTF-8)</option>
                </optgroup>
                <optgroup label="Other Legacy Encodings">
                  <option value="haritha">Haritha</option>
                  <option value="matweb">Matweb (Mathrubhumi)</option>
                  <option value="charaka">Charaka</option>
                  <option value="uma">Uma</option>
                </optgroup>
              </select>
            </div>
          </div>

          {/* Action Button & Auto Toggle */}
          <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 lg:pt-5">
            {/* Auto Convert Switch */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoConvert}
                onChange={(e) => setAutoConvert(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-brand-blue relative"></div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1">
                Auto
                {autoConvert && (
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                )}
              </span>
            </label>

            {/* Convert Button */}
            <button
              onClick={convertNow}
              disabled={isConverting || !inputText.trim()}
              className="px-6 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue-hover disabled:opacity-50 text-white font-semibold text-xs sm:text-sm tracking-wide shadow-md shadow-brand-blue/20 hover:shadow-brand-blue/30 active:scale-95 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              CONVERT TEXT
            </button>
          </div>
        </div>

        {/* Error notification banner if any */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2.5 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2"
            >
              <Info className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Two-Panel Text Editor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800 min-h-[380px]">
          
          {/* LEFT PANEL: Input Text Area */}
          <div className="flex flex-col p-4 sm:p-6 bg-transparent">
            {/* Panel Top Meta */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Input
                </span>
                <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono">
                  {sourceDef.name}
                </span>
              </div>

              {/* Paste and Clear Buttons */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={handlePaste}
                  title="Paste from Clipboard"
                  className="px-2.5 py-1 text-xs rounded-lg text-slate-500 hover:text-brand-blue hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
                >
                  <ClipboardPaste className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Paste</span>
                </button>
                {inputText && (
                  <button
                    onClick={clearInput}
                    title="Clear Text"
                    className="px-2.5 py-1 text-xs rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Clear</span>
                  </button>
                )}
              </div>
            </div>

            {/* Input Textarea */}
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="ഇവിടെ മലയാളം ടൈപ്പ് ചെയ്യുക അല്ലെങ്കിൽ പേസ്റ്റ് ചെയ്യുക..."
              className={`flex-1 w-full bg-transparent resize-none border-0 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 text-base sm:text-lg focus:outline-none focus:ring-0 leading-relaxed font-malayalam min-h-[260px]`}
              spellCheck={false}
            />

            {/* Left Panel Footer Stats */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-mono">
              <div className="flex items-center space-x-3">
                <span>{inputStats.characters} chars</span>
                <span>•</span>
                <span>{inputStats.words} words</span>
                <span>•</span>
                <span>{inputStats.lines} lines</span>
              </div>
              <span className="text-[10px] text-slate-400 hidden sm:inline">
                {sourceDef.categoryLabel}
              </span>
            </div>
          </div>

          {/* RIGHT PANEL: Converted Output Text Area */}
          <div
            className={`flex flex-col p-4 sm:p-6 bg-slate-50/40 dark:bg-slate-900/20 transition-all duration-300 relative ${
              justConverted
                ? 'ring-2 ring-brand-blue/60 bg-brand-blue/[0.02] dark:bg-brand-blue/[0.04]'
                : ''
            }`}
          >
            {/* Panel Top Meta */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Output
                </span>
                <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-brand-blue/10 text-brand-blue dark:bg-brand-blue/20 dark:text-blue-400 font-mono">
                  {targetDef.name}
                </span>
              </div>

              {/* Action Buttons: Copy and Download */}
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={handleDownload}
                  disabled={!outputText}
                  title="Download as TXT"
                  className="px-2.5 py-1 text-xs rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">TXT</span>
                </button>

                <button
                  onClick={handleCopy}
                  disabled={!outputText}
                  title="Copy Converted Text"
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-40 ${
                    copied
                      ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                      : 'bg-brand-blue text-white hover:bg-brand-blue-hover shadow-brand-blue/20'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Output Readout */}
            <div className="flex-1 relative min-h-[260px]">
              <textarea
                readOnly
                value={outputText}
                placeholder="കൺവേർഷൻ ചെയ്ത ഫലം ഇവിടെ കാണാം..."
                className={`w-full h-full bg-transparent resize-none border-0 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 text-base sm:text-lg focus:outline-none leading-relaxed select-text font-mono`}
              />
              {isConverting && (
                <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Right Panel Footer Stats */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-mono">
              <div className="flex items-center space-x-3">
                <span>{outputStats.characters} chars</span>
                <span>•</span>
                <span>{outputStats.words} words</span>
                <span>•</span>
                <span>{outputStats.lines} lines</span>
              </div>
              <span className="text-[10px] text-brand-blue font-medium">
                {durationMs > 0 ? `⚡ ${durationMs}ms` : 'Ready'}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Format Details Pill */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {targetDef.name}:
            </span>
            <span className="truncate max-w-xl">{targetDef.description}</span>
          </div>
          <div className="hidden md:flex items-center gap-2 shrink-0 font-mono text-[10px] text-slate-400">
            <span>Cmd+Enter: Convert</span>
            <span>•</span>
            <span>Cmd+Shift+C: Copy</span>
          </div>
        </div>
      </div>
    </section>
  );
};
