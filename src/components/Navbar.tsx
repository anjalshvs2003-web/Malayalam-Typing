import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { InputMode } from '../transliteration/types';

interface NavbarProps {
  inputMode: InputMode;
  setInputMode: (mode: InputMode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ inputMode, setInputMode }) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return true;
  });

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'py-3.5 bg-white/80 dark:bg-brand-black/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-apple-sm'
          : 'py-5 bg-transparent'
      }`}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Logo */}
        <a href="#" className="flex items-center space-x-3 group focus:outline-none">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-brand-blue to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-brand-blue/30 group-hover:scale-105 transition-transform duration-200">
            <span className="font-malayalam">മ</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-tight text-slate-900 dark:text-white text-base sm:text-lg flex items-center gap-1.5">
              MALAYALAM TEXT LAB
              <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
            </span>
            <span className="text-[10px] tracking-widest uppercase text-slate-500 dark:text-slate-400 font-medium">
              Manglish & Encoding Studio
            </span>
          </div>
        </a>

        {/* Right Actions: Mode Indicator + Theme Toggle */}
        <div className="flex items-center space-x-3">
          
          {/* Quick Mode Badge */}
          <button
            onClick={() => setInputMode(inputMode === 'manglish' ? 'direct' : 'manglish')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue border border-brand-blue/30 hover:bg-brand-blue/20 transition-all"
            title="Click to toggle input mode"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>{inputMode === 'manglish' ? 'Manglish Active' : 'Direct Unicode'}</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-brand-black-card/70 text-slate-700 dark:text-slate-300 hover:text-brand-blue hover:border-brand-blue transition-all"
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-500" />}
          </button>

        </div>
      </div>
    </header>
  );
};
