import { FontFormatId, FormatDefinition, ConversionResult } from './types';
import { convertUnicodeToLegacy } from './unicodeToLegacy';
import { convertLegacyToUnicode } from './legacyToUnicode';
import { normalizeMalayalam } from './normalizer';
import { calculateTextStats } from '../utils/textStats';

export const SUPPORTED_FORMATS: FormatDefinition[] = [
  {
    id: 'unicode',
    name: 'Unicode Malayalam',
    category: 'unicode',
    categoryLabel: 'Modern Standard',
    sublabel: 'UTF-8 / Web / Mobile Standard',
    isLegacy: false,
    description: 'Modern universal character encoding standard used across the web, iOS, Android, macOS, and Windows.',
    popularUses: 'Websites, social media, messaging, modern apps, Word, Google Docs',
    fontFamilyFallback: '"Noto Sans Malayalam", Inter, sans-serif',
  },
  {
    id: 'fml-manorama',
    name: 'FML Series (Aparna / Leela)',
    category: 'fml',
    categoryLabel: 'FML Series',
    sublabel: 'Designer & Video Editing Standard',
    mapKey: 'fml',
    isLegacy: true,
    description: 'Standard FML TrueType font format used across Adobe Photoshop, Premiere Pro, InDesign, and mobile graphic editing tools.',
    popularUses: 'Photoshop, Premiere Pro, After Effects, InDesign, YouTube thumbnails, posters',
    fontFamilyFallback: 'sans-serif',
  },
  {
    id: 'fml-panchari',
    name: 'FML Panchami',
    category: 'fml',
    categoryLabel: 'FML Series',
    sublabel: 'Magazine & Display Format',
    mapKey: 'fml',
    isLegacy: true,
    description: 'Widely used FML variant for Malayalam weekly magazines, book typography, and commercial print design.',
    popularUses: 'Magazines, books, print layouts, older advertising banners',
    fontFamilyFallback: 'sans-serif',
  },
  {
    id: 'mltt-karthika',
    name: 'ML-TT Karthika',
    category: 'ml-tt',
    categoryLabel: 'ML-TT Series',
    sublabel: 'Standard TrueType DTP',
    mapKey: 'ml',
    isLegacy: true,
    description: 'The definitive Malayalam TrueType standard in Kerala government offices, video editing, and DTP presses.',
    popularUses: 'DaVinci Resolve, Premiere Pro, Adobe Illustrator, Kerala Govt DTP',
    fontFamilyFallback: 'sans-serif',
  },
  {
    id: 'mltt-revathi',
    name: 'ML-TT Revathi',
    category: 'ml-tt',
    categoryLabel: 'ML-TT Series',
    sublabel: 'Traditional Newspaper Style',
    mapKey: 'ml',
    isLegacy: true,
    description: 'A classic TrueType font encoding with graceful traditional ligatures, popular in news desks.',
    popularUses: 'Newspaper layouts, editorial columns, formal documents',
    fontFamilyFallback: 'sans-serif',
  },
  {
    id: 'mltt-ambili',
    name: 'ML-TT Ambili',
    category: 'ml-tt',
    categoryLabel: 'ML-TT Series',
    sublabel: 'Curved Round Typography',
    mapKey: 'ml',
    isLegacy: true,
    description: 'Curved, flowing Malayalam font encoding recognized for its distinctive readability in headers.',
    popularUses: 'Notice boards, brochures, festival posters',
    fontFamilyFallback: 'sans-serif',
  },
  {
    id: 'mltt-nandini',
    name: 'ML-TT Nandini',
    category: 'ml-tt',
    categoryLabel: 'ML-TT Series',
    sublabel: 'High-Contrast Title Font',
    mapKey: 'ml',
    isLegacy: true,
    description: 'High-contrast headline font encoding for bold impact in display printing.',
    popularUses: 'Posters, banner headlines, book covers',
    fontFamilyFallback: 'sans-serif',
  },
  {
    id: 'mlbtt-indulekha',
    name: 'MLB-TT Indulekha',
    category: 'ml-tt',
    categoryLabel: 'ML-TT Series',
    sublabel: 'Heavy Bold TrueType',
    mapKey: 'ml',
    isLegacy: true,
    description: 'Heavy bold TrueType format tailored for prominent headings and cinema titles.',
    popularUses: 'Movie title cards, signages, billboard typography',
    fontFamilyFallback: 'sans-serif',
  },
  {
    id: 'haritha',
    name: 'Haritha',
    category: 'other',
    categoryLabel: 'Other Legacy',
    sublabel: 'Classic DTP ASCII',
    mapKey: 'Haritha',
    isLegacy: true,
    description: 'Classic Malayalam ASCII encoding commonly found in archived Kerala press archives.',
    popularUses: 'Archival printing, legacy text recovery',
    fontFamilyFallback: 'sans-serif',
  },
  {
    id: 'matweb',
    name: 'Matweb',
    category: 'other',
    categoryLabel: 'Other Legacy',
    sublabel: 'Mathrubhumi / Web Archive',
    mapKey: 'Matweb',
    isLegacy: true,
    description: 'Legacy web publishing encoding historically used for internet newspaper broadcasts.',
    popularUses: 'Historic news archives, digital newspaper archives',
    fontFamilyFallback: 'sans-serif',
  },
  {
    id: 'charaka',
    name: 'Charaka',
    category: 'other',
    categoryLabel: 'Other Legacy',
    sublabel: 'Classical Typography',
    mapKey: 'charaka',
    isLegacy: true,
    description: 'Encoding designed for classical treatises, Ayurvedic medical texts, and scholarly journals.',
    popularUses: 'Ayurvedic publications, Sanskrit-Malayalam academic texts',
    fontFamilyFallback: 'sans-serif',
  },
  {
    id: 'uma',
    name: 'Uma',
    category: 'other',
    categoryLabel: 'Other Legacy',
    sublabel: 'Literary Press Standard',
    mapKey: 'uma',
    isLegacy: true,
    description: 'Heritage font encoding popular in Kerala Sahitya Akademi and private book publishers.',
    popularUses: 'Novels, poetry collections, academic books',
    fontFamilyFallback: 'sans-serif',
  },
];

export const FORMAT_MAP: Record<FontFormatId, FormatDefinition> = SUPPORTED_FORMATS.reduce(
  (acc, fmt) => {
    acc[fmt.id] = fmt;
    return acc;
  },
  {} as Record<FontFormatId, FormatDefinition>
);

export const SAMPLE_TEXTS = [
  {
    title: 'ലഘു വാക്യം (Quick Sample)',
    text: 'നമസ്കാരം! മലയാളം ടെക്സ്റ്റ് ലാബിലേക്ക് സ്വാഗതം. നിങ്ങളുടെ പ്രിയപ്പെട്ട മലയാളം ഫോണ്ടുകളിലേക്ക് ഇവിടെ എളുപ്പത്തിൽ മാറ്റാം.',
  },
  {
    title: 'സംസ്കാരവും സാഹിത്യവും (Cultural Quote)',
    text: 'ഭാഷയാണ് സംസ്കാരം, സാഹിത്യമാണ് അതിന്റെ ജീവൻ. മലയാളം നമ്മുടെ അഭിമാനമാണ്. പുതിയ ഡിജിറ്റൽ ലോകത്തും നമ്മുടെ അക്ഷരങ്ങൾ തലയുയർത്തി നിൽക്കുന്നു.',
  },
  {
    title: 'സങ്കീർണ്ണ കൂട്ടക്ഷരങ്ങൾ (Complex Conjuncts)',
    text: 'പ്രോഗ്രാമിംഗ്, കമ്പ്യൂട്ടർ സയൻസ്, പത്രപ്രവർത്തനം, വിദ്യാഭ്യാസം, ഐക്യരാഷ്ട്രസഭ, എഴുത്തുകാരൻ, സൂര്യൻ, ചന്ദ്രൻ, ഭാരതം, സ്വാഗതം, അമ്മ.',
  },
  {
    title: 'പൂർണ്ണ ഖണ്ഡിക (Full Paragraph)',
    text: 'മലയാളം ഭാഷ നമ്മുടെ അഭിമാനമാണ്. കേരളത്തിലെ ജനങ്ങൾ സംസാരിക്കുന്ന പ്രധാന ഭാഷയാണിത്. കല, സാഹിത്യം, പത്രപ്രവർത്തനം എന്നിവയിൽ മലയാളം വലിയ സ്വാധീനം ചെലുത്തുന്നു. കമ്പ്യൂട്ടറിലും മൊബൈലിലും ഇന്ന് മലയാളം ടൈപ്പ് ചെയ്യുന്നത് വളരെ എളുപ്പമാണ്.',
  },
];

/**
 * Universal conversion orchestrator between any two formats.
 */
export function convertText(
  inputText: string,
  sourceFormat: FontFormatId,
  targetFormat: FontFormatId
): ConversionResult {
  const startTime = performance.now();

  if (!inputText || !inputText.trim()) {
    return {
      outputText: '',
      sourceFormat,
      targetFormat,
      durationMs: 0,
      stats: calculateTextStats(''),
      isIdentity: true,
    };
  }

  const sourceDef = FORMAT_MAP[sourceFormat];
  const targetDef = FORMAT_MAP[targetFormat];

  if (!sourceDef || !targetDef) {
    throw new Error(`Unsupported conversion format selected: ${sourceFormat} -> ${targetFormat}`);
  }

  let result = '';

  // 1. Same format (Identity / normalize if Unicode)
  if (sourceFormat === targetFormat) {
    result = sourceFormat === 'unicode' ? normalizeMalayalam(inputText) : inputText;
  }
  // 2. Unicode to Legacy
  else if (sourceFormat === 'unicode') {
    if (!targetDef.mapKey) {
      throw new Error(`Target format '${targetDef.name}' lacks a valid mapping table.`);
    }
    result = convertUnicodeToLegacy(inputText, targetDef.mapKey);
  }
  // 3. Legacy to Unicode
  else if (targetFormat === 'unicode') {
    if (!sourceDef.mapKey) {
      throw new Error(`Source format '${sourceDef.name}' lacks a valid mapping table.`);
    }
    result = convertLegacyToUnicode(inputText, sourceDef.mapKey);
  }
  // 4. Legacy to Legacy: Pivot through Unicode
  else {
    if (!sourceDef.mapKey || !targetDef.mapKey) {
      throw new Error('Both legacy formats must possess valid mapping tables.');
    }
    const intermediateUnicode = convertLegacyToUnicode(inputText, sourceDef.mapKey);
    result = convertUnicodeToLegacy(intermediateUnicode, targetDef.mapKey);
  }

  const durationMs = Math.round((performance.now() - startTime) * 100) / 100;
  const stats = calculateTextStats(result);

  return {
    outputText: result,
    sourceFormat,
    targetFormat,
    durationMs,
    stats,
    isIdentity: sourceFormat === targetFormat,
  };
}
