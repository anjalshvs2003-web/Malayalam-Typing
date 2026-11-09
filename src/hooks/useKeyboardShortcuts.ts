import { useEffect } from 'react';

interface ShortcutHandlers {
  onConvert?: () => void;
  onCopy?: () => void;
  onEscape?: () => void;
}

export function useKeyboardShortcuts({
  onConvert,
  onCopy,
  onEscape,
}: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      // Cmd/Ctrl + Shift + C -> Copy output
      if (isCmdOrCtrl && e.shiftKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        onCopy?.();
        return;
      }

      // Cmd/Ctrl + Enter -> Convert
      if (isCmdOrCtrl && e.key === 'Enter') {
        e.preventDefault();
        onConvert?.();
        return;
      }

      // Escape -> Clear or close modal
      if (e.key === 'Escape') {
        onEscape?.();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onConvert, onCopy, onEscape]);
}
