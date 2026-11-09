import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy,
  Check,
  Download,
  Trash2,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FontFormatId } from '../engine/types';
import { FORMAT_MAP } from '../engine/conversionRegistry';
import { copyToClipboard } from '../utils/clipboard';
import { downloadTextAsFile } from '../utils/download';

interface OutputPanelProps {
  outputText: string;
  formatId: FontFormatId;
  durationMs: number;
  onClear: () => void;
  onConvertAgain: (formatId: FontFormatId) => void;
}

export const OutputPanel: React.FC<OutputPanelProps> = ({
  outputText,
  formatId,
  durationMs,
  onClear,
  onConvertAgain,
}) => {
  const [copied, setCopied] = useState(false);
  const formatDef = FORMAT_MAP[formatId];

  const handleCopy = async () => {
    if (!outputText) return;
    const ok = await copyToClipboard(outputText);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);

      try {
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.75 },
          colors: ['#1677FF', '#38bdf8', '#DCEBFF'],
        });
      } catch {
        // Visual bonus
      }
    }
  };

  const handleDownload = () => {
    if (!outputText) return;
    const filename = `malayalam-${formatId}-${Date.now()}.txt`;
    downloadTextAsFile(outputText, filename);
  };

  return (
    <AnimatePresence>
      {outputText && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-4xl mx-auto my-6 sm:my-8"
        >
          <div className="rounded-3xl bg-white dark:bg-brand-black-card border border-brand-blue/30 dark:border-brand-blue/40 shadow-apple-glow dark:shadow-apple-dark-glow overflow-hidden">
            
            {/* Header: Format Badge, Duration, Actions */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 flex flex-wrap items-center justify-between gap-3">
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Converted Output
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-blue/10 text-brand-blue dark:bg-brand-blue/20 font-mono">
                      {formatDef?.name || formatId}
                    </span>
                    {durationMs > 0 && (
                      <span className="text-[10px] text-brand-blue font-mono">
                        ⚡ {durationMs}ms
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    {formatDef?.description || 'Authentic character encoding'}
                  </p>
                </div>
              </div>

              {/* Top Quick Actions */}
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <button
                  onClick={handleDownload}
                  title="Download as TXT file"
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download TXT</span>
                </button>

                <button
                  onClick={onClear}
                  title="Clear output"
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Converted Output Display Area */}
            <div className="p-6 sm:p-8 bg-slate-50/30 dark:bg-slate-900/20">
              <textarea
                readOnly
                value={outputText}
                rows={5}
                className="w-full bg-transparent resize-none border-0 text-slate-900 dark:text-slate-100 text-lg sm:text-xl font-mono focus:outline-none leading-relaxed select-text"
              />
            </div>

            {/* Bottom Actions Bar with Large Prominent COPY button */}
            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 flex flex-wrap items-center justify-between gap-4">
              
              {/* Quick Format Switchers */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 mr-1 hidden sm:inline">Convert again:</span>
                {(['fml-manorama', 'mltt-karthika', 'unicode'] as FontFormatId[]).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => onConvertAgain(fmt)}
                    className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                      formatId === fmt
                        ? 'bg-brand-blue/15 text-brand-blue border border-brand-blue/30 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                    }`}
                  >
                    {fmt === 'fml-manorama' ? 'FML' : fmt === 'mltt-karthika' ? 'ML-TT' : 'Unicode'}
                  </button>
                ))}
              </div>

              {/* Prominent COPY Button */}
              <div className="flex items-center gap-3">
                {copied && (
                  <motion.span
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xs font-bold text-emerald-500 flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Copied Successfully!
                  </motion.span>
                )}

                <button
                  onClick={handleCopy}
                  className={`px-7 py-3 rounded-2xl font-bold text-sm sm:text-base flex items-center gap-2 shadow-lg transition-all active:scale-95 ${
                    copied
                      ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                      : 'bg-brand-blue hover:bg-brand-blue-hover text-white shadow-brand-blue/30'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>COPIED!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>COPY TEXT</span>
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
