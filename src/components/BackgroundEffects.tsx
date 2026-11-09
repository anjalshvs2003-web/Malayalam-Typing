import React from 'react';
import { motion } from 'framer-motion';

// Floating Malayalam characters with unique floating paths and glowing opacities
const FLOATING_CHARS = [
  { char: 'അ', x: '8%', y: '15%', size: 'text-6xl', delay: 0, duration: 9 },
  { char: 'മ', x: '88%', y: '18%', size: 'text-5xl', delay: 1.2, duration: 11 },
  { char: 'ല', x: '18%', y: '65%', size: 'text-5xl', delay: 2.1, duration: 10 },
  { char: 'യ', x: '78%', y: '72%', size: 'text-6xl', delay: 0.8, duration: 12 },
  { char: 'ള', x: '45%', y: '8%', size: 'text-4xl', delay: 1.8, duration: 8 },
  { char: 'ം', x: '92%', y: '48%', size: 'text-5xl', delay: 2.7, duration: 9 },
  { char: 'ക', x: '5%', y: '82%', size: 'text-5xl', delay: 1.5, duration: 11 },
  { char: 'ഴ', x: '62%', y: '88%', size: 'text-4xl', delay: 2.4, duration: 10 },
  { char: 'ൃ', x: '32%', y: '35%', size: 'text-4xl', delay: 0.5, duration: 7 },
  { char: 'ർ', x: '68%', y: '28%', size: 'text-4xl', delay: 3.0, duration: 13 },
];

export const BackgroundEffects: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 select-none">
      {/* Dynamic radial gradient blobs */}
      <div className="absolute top-[-15%] left-[20%] w-[650px] h-[650px] rounded-full bg-brand-blue/10 dark:bg-brand-blue/15 blur-[120px] animate-glow-pulse" />
      <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#38bdf8]/10 dark:bg-brand-blue/10 blur-[140px] animate-pulse-subtle" />
      <div className="absolute bottom-[-10%] left-[10%] w-[700px] h-[700px] rounded-full bg-brand-navy/5 dark:bg-brand-blue/5 blur-[150px]" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 dark:opacity-40" />

      {/* Floating Malayalam Glyphs */}
      {FLOATING_CHARS.map((item, idx) => (
        <motion.div
          key={idx}
          className={`absolute font-malayalam font-bold text-brand-blue/15 dark:text-brand-blue/20 filter drop-shadow-[0_0_12px_rgba(22,119,255,0.25)] ${item.size}`}
          style={{ left: item.x, top: item.y }}
          animate={{
            y: [0, -18, 0],
            rotate: [0, 4, -4, 0],
            opacity: [0.15, 0.28, 0.15],
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            delay: item.delay,
            ease: 'easeInOut',
          }}
        >
          {item.char}
        </motion.div>
      ))}

      {/* Subtle light beams */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[350px] bg-gradient-to-b from-brand-blue/10 via-brand-blue/5 to-transparent blur-3xl" />
    </div>
  );
};
