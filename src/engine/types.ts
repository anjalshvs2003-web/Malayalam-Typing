export type FontFormatId =
  | 'unicode'
  | 'fml-manorama'
  | 'fml-panchari'
  | 'mltt-karthika'
  | 'mltt-revathi'
  | 'mltt-ambili'
  | 'mltt-nandini'
  | 'mlbtt-indulekha'
  | 'haritha'
  | 'matweb'
  | 'charaka'
  | 'uma';

export type FontCategory = 'unicode' | 'fml' | 'ml-tt' | 'other';

export interface FormatDefinition {
  id: FontFormatId;
  name: string;
  category: FontCategory;
  categoryLabel: string;
  sublabel: string;
  mapKey?: string;
  isLegacy: boolean;
  description: string;
  popularUses: string;
  fontFamilyFallback: string;
}

export interface TextStats {
  characters: number;
  words: number;
  lines: number;
  nonSpaceChars: number;
}

export interface ConversionResult {
  outputText: string;
  sourceFormat: FontFormatId;
  targetFormat: FontFormatId;
  durationMs: number;
  stats: TextStats;
  isIdentity?: boolean;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  sourceFormat: FontFormatId;
  targetFormat: FontFormatId;
  inputText: string;
  outputText: string;
  charCount: number;
}

export interface FontPreviewConfig {
  fontFamily: string;
  displayName: string;
  googleFont?: boolean;
  category: 'unicode' | 'simulated-legacy';
}
