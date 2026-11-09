export interface TransliterationCandidate {
  word: string;
  source: 'google' | 'offline' | 'dictionary';
}

export interface TransliterationState {
  activeWord: string;
  wordStartIndex: number;
  wordEndIndex: number;
  candidates: string[];
  selectedIndex: number;
  isOpen: boolean;
  position: { top: number; left: number };
}

export type InputMode = 'manglish' | 'direct';
