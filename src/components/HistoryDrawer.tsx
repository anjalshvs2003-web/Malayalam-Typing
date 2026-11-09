import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ArrowRight, Copy, RotateCcw, Clock } from 'lucide-react';
import { HistoryEntry, FontFormatId } from '../engine/types';
import { FORMAT_MAP } from '../engine/conversionRegistry';
import { copyToClipboard } from '../utils/clipboard';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryEntry[];
  onReuse: (input: string, source: FontFormatId, target: FontFormatId) => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onReuse,
  onRemove,
  onClearAll,
}) => {
  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(ts).toLocaleDateString();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="w-screen max-w-md bg-white dark:bg-brand-black border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-brand-blue" />
                    Conversion History
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {history.length} saved {history.length === 1 ? 'entry' : 'entries'} locally
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {history.length > 0 && (
                    <button
                      onClick={onClearAll}
                      title="Clear All History"
                      className="p-2 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* History List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {history.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                    <Clock className="w-12 h-12 text-slate-300 dark:text-slate-700 stroke-1 mb-3" />
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      No conversions yet
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
                      Convert any text in the workspace and it will be preserved here automatically.
                    </p>
                  </div>
                ) : (
                  history.map((entry) => {
                    const src = FORMAT_MAP[entry.sourceFormat]?.name || entry.sourceFormat;
                    const tgt = FORMAT_MAP[entry.targetFormat]?.name || entry.targetFormat;

                    return (
                      <div
                        key={entry.id}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-brand-black-card border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3"
                      >
                        {/* Meta header */}
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                            <span className="truncate max-w-[120px]">{src}</span>
                            <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[120px] text-brand-blue">{tgt}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatTime(entry.timestamp)}
                          </span>
                        </div>

                        {/* Input Preview */}
                        <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 font-malayalam bg-white dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                          {entry.inputText}
                        </div>

                        {/* Card Actions */}
                        <div className="flex items-center justify-between pt-1">
                          <button
                            onClick={() => {
                              onReuse(entry.inputText, entry.sourceFormat, entry.targetFormat);
                              onClose();
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-brand-blue hover:bg-brand-blue-hover shadow-sm transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Reuse
                          </button>

                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => copyToClipboard(entry.outputText)}
                              title="Copy Result"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onRemove(entry.id)}
                              title="Delete Item"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
