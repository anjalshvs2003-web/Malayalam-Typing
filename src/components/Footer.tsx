import React from 'react';
import { Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative border-t border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-brand-black/60 backdrop-blur-md pt-12 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-200/80 dark:border-slate-800/80 text-center sm:text-left">
        
        {/* Brand info */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-center sm:justify-start space-x-2.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-brand-blue to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-brand-blue/30">
              <span className="font-malayalam">മ</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white tracking-tight text-sm">
              MALAYALAM TEXT LAB
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            "Your language. Your typography. Your freedom."
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex items-center space-x-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span>Unicode</span>
          <span>•</span>
          <span>FML</span>
          <span>•</span>
          <span>ML-TT</span>
          <span>•</span>
          <span>Manglish</span>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-5xl mx-auto mt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
        <p>© {new Date().getFullYear()} Malayalam Text Lab. Built for Malayalam creators.</p>
        <p className="flex items-center gap-1">
          Crafted with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for Malayalam typography
        </p>
      </div>
    </footer>
  );
};
