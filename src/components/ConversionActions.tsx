import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, FileText, CheckCircle2 } from 'lucide-react';
import { FontFormatId } from '../engine/types';

interface ConversionActionsProps {
  onConvert: (targetFormat: FontFormatId) => void;
  activeFormat?: FontFormatId;
  disabled?: boolean;
}

export const ConversionActions: React.FC<ConversionActionsProps> = ({
  onConvert,
  activeFormat,
  disabled = false,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto my-6 sm:my-8">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
        
        {/* PRIMARY BUTTON: Convert to FML */}
        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onConvert('fml-manorama')}
          disabled={disabled}
          className={`flex-1 sm:flex-initial px-7 py-4 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-apple-glow ${
            activeFormat === 'fml-manorama'
              ? 'bg-brand-blue text-white ring-4 ring-brand-blue/30'
              : 'bg-brand-blue hover:bg-brand-blue-hover text-white'
          } disabled:opacity-50 disabled:pointer-events-none`}
        >
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          <span>Convert to FML</span>
        </motion.button>

        {/* SECONDARY BUTTON: Convert to ML-TT */}
        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onConvert('mltt-karthika')}
          disabled={disabled}
          className={`flex-1 sm:flex-initial px-7 py-4 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all border ${
            activeFormat === 'mltt-karthika'
              ? 'bg-brand-navy text-white border-brand-blue ring-4 ring-brand-blue/30 dark:bg-slate-800'
              : 'bg-white dark:bg-brand-black-card text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-800 hover:border-brand-blue hover:bg-slate-50 dark:hover:bg-slate-800'
          } shadow-sm disabled:opacity-50 disabled:pointer-events-none`}
        >
          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-brand-blue" />
          <span>Convert to ML-TT</span>
        </motion.button>

        {/* TERTIARY BUTTON: Unicode */}
        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onConvert('unicode')}
          disabled={disabled}
          className={`flex-1 sm:flex-initial px-6 py-4 rounded-2xl font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-all border ${
            activeFormat === 'unicode'
              ? 'bg-emerald-500 text-white border-emerald-500 ring-4 ring-emerald-500/20'
              : 'bg-white/70 dark:bg-brand-black-card/70 text-slate-700 dark:text-slate-300 border-slate-200/90 dark:border-slate-800/90 hover:bg-white dark:hover:bg-slate-800'
          } shadow-sm disabled:opacity-50 disabled:pointer-events-none`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Unicode</span>
        </motion.button>

      </div>
    </div>
  );
};
