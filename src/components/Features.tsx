import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Layers } from 'lucide-react';

const FEATURES = [
  {
    icon: Sparkles,
    title: 'Accurate Conversion',
    description:
      'Genuine character-to-character encoding conversion. Handles complex conjuncts, chillus, viramas, and pre-base vowels with 100% precision.',
    badge: 'Authentic Mappings',
  },
  {
    icon: Zap,
    title: 'Instant Copy & Export',
    description:
      'Copy converted text with one touch or download raw TXT files preserving 8-bit character encoding bytes for Adobe Premiere, InDesign, or DaVinci Resolve.',
    badge: '1-Click Flow',
  },
  {
    icon: Layers,
    title: 'Multiple Font Formats',
    description:
      'Supports FML (Manorama / Panchami), ML-TT (Karthika / Revathi), and standard Unicode with real-time phonetic Manglish typing.',
    badge: 'Universal Formats',
  },
];

export const Features: React.FC = () => {
  return (
    <section className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue text-xs font-semibold uppercase tracking-wider mb-3"
        >
          Built for Malayalam Creators
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed"
        >
          A modern workspace for converting, editing, and working with Malayalam typography across different digital formats.
        </motion.p>
      </div>

      {/* 3 Minimal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {FEATURES.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 rounded-3xl bg-white dark:bg-brand-black-card border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:shadow-apple-glow dark:hover:shadow-apple-dark-glow hover:border-brand-blue/40 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-brand-blue px-2 py-0.5 rounded-full bg-brand-blue/10 dark:bg-brand-blue/20 font-mono">
                    {feat.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  {feat.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
