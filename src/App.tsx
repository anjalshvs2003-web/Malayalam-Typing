import React, { useState, useCallback } from 'react';
import { BackgroundEffects } from './components/BackgroundEffects';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ManglishEditor } from './components/ManglishEditor';
import { ConversionActions } from './components/ConversionActions';
import { OutputPanel } from './components/OutputPanel';
import { Features } from './components/Features';
import { Footer } from './components/Footer';
import { InputMode } from './transliteration/types';
import { FontFormatId } from './engine/types';
import { convertText } from './engine/conversionRegistry';
import { copyToClipboard } from './utils/clipboard';

export const App: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [inputMode, setInputMode] = useState<InputMode>('manglish');
  
  // Output state
  const [outputText, setOutputText] = useState<string>('');
  const [activeOutputFormat, setActiveOutputFormat] = useState<FontFormatId>('fml-manorama');
  const [durationMs, setDurationMs] = useState<number>(0);

  // Conversion handler
  const handleConvert = useCallback(
    (targetFormat: FontFormatId) => {
      if (!text.trim()) {
        setOutputText('');
        return;
      }

      const startTime = performance.now();
      try {
        // Source is always the Malayalam text in the editor (Unicode)
        const result = convertText(text, 'unicode', targetFormat);
        setOutputText(result.outputText);
        setActiveOutputFormat(targetFormat);
        setDurationMs(Math.round((performance.now() - startTime) * 100) / 100);
      } catch (err) {
        console.error('Conversion failed:', err);
      }
    },
    [text]
  );

  // Keyboard shortcut listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      // Cmd/Ctrl + Enter -> Convert
      if (isCmdOrCtrl && e.key === 'Enter') {
        e.preventDefault();
        handleConvert(activeOutputFormat);
      }

      // Cmd/Ctrl + Shift + C -> Copy output
      if (isCmdOrCtrl && e.shiftKey && (e.key === 'c' || e.key === 'C')) {
        if (outputText) {
          e.preventDefault();
          copyToClipboard(outputText);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleConvert, activeOutputFormat, outputText]);

  return (
    <div className="relative min-h-screen text-slate-800 dark:text-slate-100 font-sans selection:bg-brand-blue selection:text-white">
      {/* Background Ambience & Floating Malayalam Letters */}
      <BackgroundEffects />

      {/* Floating Glass Navbar */}
      <Navbar inputMode={inputMode} setInputMode={setInputMode} />

      {/* Main Content Layout */}
      <main className="px-4 sm:px-6 lg:px-8">
        
        {/* 1. Hero Section */}
        <Hero />

        {/* 2. ONE Large Clean Main Editor */}
        <ManglishEditor
          text={text}
          setText={setText}
          inputMode={inputMode}
          setInputMode={setInputMode}
        />

        {/* 3. Three Clear Conversion Buttons */}
        <ConversionActions
          onConvert={handleConvert}
          activeFormat={outputText ? activeOutputFormat : undefined}
          disabled={!text.trim()}
        />

        {/* 4. Converted Output Interface */}
        <OutputPanel
          outputText={outputText}
          formatId={activeOutputFormat}
          durationMs={durationMs}
          onClear={() => setOutputText('')}
          onConvertAgain={handleConvert}
        />

        {/* 5. Minimal Features & About Section */}
        <Features />

      </main>

      {/* 6. Minimal Footer */}
      <Footer />
    </div>
  );
};

export default App;
