import { TextStats } from '../engine/types';

export function calculateTextStats(text: string): TextStats {
  if (!text) {
    return {
      characters: 0,
      words: 0,
      lines: 0,
      nonSpaceChars: 0,
    };
  }

  const characters = text.length;
  const nonSpaceChars = text.replace(/\s/g, '').length;
  
  // Count words: split on any whitespace sequence
  const wordsArray = text.trim().split(/\s+/).filter(Boolean);
  const words = text.trim() === '' ? 0 : wordsArray.length;

  // Count lines: split on newline characters
  const lines = text.split(/\r\n|\r|\n/).length;

  return {
    characters,
    words,
    lines,
    nonSpaceChars,
  };
}
