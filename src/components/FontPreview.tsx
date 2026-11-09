import React, { useState } from 'react';
import { Type, Info, Sliders, Sun, Moon } from 'lucide-react';

interface FontOption {
  id: string;
  name: string;
  fontFamily: string;
  designer: string;
  tag: string;
}

const MALAYALAM_FONTS: FontOption[] = [
  {
    id: 'noto-sans',
    name: 'Noto Sans Malayalam',
    fontFamily: '"Noto Sans Malayalam", sans-serif',
    designer: 'Google Fonts',
    tag: 'Modern Sans',
  },
  {
    id: 'manjari',
    name: 'Manjari',
    fontFamily: 'Manjari, sans-serif',
    designer: 'Santhosh Thottingal (SMC)',
    tag: 'Curved Geometry',
  },
  {
    id: 'gayathri',
    name: 'Gayathri',
    fontFamily: 'Gayathri, sans-serif',
    designer: 'Binoy V R (SMC)',
    tag: 'Gentle Display',
  },
  {
    id: 'chilanka',
    name: 'Chilanka',
    fontFamily: 'Chilanka, cursive',
    designer: 'Santhosh Thottingal (SMC)',
    tag: 'Handwriting / Script',
  },
  {
    id: 'anek',
    name: 'Anek Malayalam',
    fontFamily: '"Anek Malayalam", sans-serif',
    designer: 'Ek Type',
    tag: 'Contemporary Bold',
  },
  {
    id: 'system',
    name: 'System Default Malayalam',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    designer: 'Apple / OS Standard',
    tag: 'Native System',
  },
];

interface FontPreviewProps {
  currentUnicodeText: string;
}

export const FontPreview: React.FC<FontPreviewProps> = ({ currentUnicodeText }) => {
  const [selectedFont, setSelectedFont] = useState<FontOption>(MALAYALAM_FONTS[0]);
  const [fontSize, setFontSize] = useState<number>(32);
  const [fontWeight, setFontWeight] = useState<number>(400);
  const [previewDark, setPreviewDark] = useState<boolean>(true);
  const [customText, setCustomText] = useState<string>(
    currentUnicodeText || 'മലയാളം ഭാഷ നമ്മുടെ അഭിമാനമാണ്. അക്ഷരങ്ങളിലൂടെ സംസ്കാരം ജീവിക്കുന്നു.'
  );

  return (
    <section id="preview" className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue text-xs font-semibold uppercase tracking-wider mb-2">
          <Type className="w-3.5 h-3.5" />
          Typography Studio
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          Malayalam Font Preview
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Inspect how Malayalam typography renders across authentic open-source typefaces.
        </p>
      </div>

      {/* Critical Distinction Notice (As required by prompt) */}
      <div className="mb-8 rounded-2xl bg-blue-50 dark:bg-brand-navy/60 border border-blue-200 dark:border-brand-navy-border p-4 sm:p-5 flex items-start gap-3.5 shadow-sm">
        <div className="p-2 rounded-xl bg-brand-blue/10 text-brand-blue shrink-0 mt-0.5">
          <Info className="w-5 h-5" />
        </div>
        <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <span className="font-semibold text-brand-blue dark:text-blue-400 block mb-0.5">
            Typography Insight: Visual Font Styling vs. Underlying Text Encoding
          </span>
          Changing the typeface in this section changes only the <strong className="text-slate-900 dark:text-white">visual CSS rendering</strong> on your display. 
          In contrast, the <a href="#converter" className="underline font-medium text-brand-blue hover:text-brand-blue-hover">Converter tool above</a> alters the <strong className="text-slate-900 dark:text-white">actual character encoding</strong> (mapping Unicode code points to legacy 8-bit ASCII characters), which is required for legacy applications like Adobe PageMaker, Premiere Pro, or DaVinci Resolve that cannot parse Unicode OpenType shaping engines.
        </div>
      </div>

      {/* Typography Preview Control Panel */}
      <div className="rounded-3xl bg-white dark:bg-brand-black-card border border-slate-200 dark:border-slate-800 shadow-apple dark:shadow-apple-dark overflow-hidden">
        
        {/* Controls Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 flex flex-wrap items-center justify-between gap-4">
          
          {/* Font Family Selector */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Select Typeface
            </label>
            <select
              value={selectedFont.id}
              onChange={(e) => {
                const found = MALAYALAM_FONTS.find((f) => f.id === e.target.value);
                if (found) setSelectedFont(found);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-brand-blue focus:outline-none cursor-pointer"
            >
              {MALAYALAM_FONTS.map((font) => (
                <option key={font.id} value={font.id}>
                  {font.name} — {font.tag}
                </option>
              ))}
            </select>
          </div>

          {/* Font Size Slider */}
          <div className="w-48 sm:w-56">
            <div className="flex justify-between items-center text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              <span className="flex items-center gap-1">
                <Sliders className="w-3 h-3" /> Size
              </span>
              <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">{fontSize}px</span>
            </div>
            <input
              type="range"
              min="16"
              max="72"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full accent-brand-blue cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
            />
          </div>

          {/* Weight Toggles */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Weight
            </label>
            <div className="flex rounded-xl bg-slate-200/70 dark:bg-slate-800 p-0.5 text-xs">
              {[
                { label: 'Regular', val: 400 },
                { label: 'Medium', val: 500 },
                { label: 'Bold', val: 700 },
              ].map((wt) => (
                <button
                  key={wt.val}
                  onClick={() => setFontWeight(wt.val)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    fontWeight === wt.val
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {wt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Background Scheme Toggle (Light / Dark Preview) */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Canvas Tone
            </label>
            <button
              onClick={() => setPreviewDark(!previewDark)}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-brand-blue transition-colors flex items-center gap-2 text-xs"
              title="Toggle preview background canvas"
            >
              {previewDark ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-blue-400" />
                  <span>Dark Canvas</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Light Canvas</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Typography Canvas */}
        <div
          className={`p-8 sm:p-12 transition-colors duration-200 min-h-[300px] flex flex-col justify-center ${
            previewDark
              ? 'bg-[#090d16] text-white selection:bg-brand-blue selection:text-white'
              : 'bg-[#fafcff] text-slate-900 selection:bg-brand-blue selection:text-white'
          }`}
        >
          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            rows={4}
            className="w-full bg-transparent resize-none border-0 focus:outline-none leading-relaxed transition-all"
            style={{
              fontFamily: selectedFont.fontFamily,
              fontSize: `${fontSize}px`,
              fontWeight: fontWeight,
            }}
          />
        </div>

        {/* Canvas Footer Bar */}
        <div className="px-6 py-3 bg-slate-50/80 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 font-mono gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedFont.name}</span>
            <span>•</span>
            <span>{selectedFont.designer}</span>
          </div>
          <div>Click canvas above to type or edit preview text directly</div>
        </div>
      </div>
    </section>
  );
};
