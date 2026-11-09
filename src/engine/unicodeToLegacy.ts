import { rawMaps } from './maps/rawMaps';
import { normalizeMalayalam } from './normalizer';

const VIRAMA = '്';
const ZWJ = '\u200D';
const ZWNJ = '\u200C';

const CONSONANTS: Record<string, string> = {
  'ക': 'I', 'ഖ': 'J', 'ഗ': 'K', 'ഘ': 'L', 'ങ': 'M',
  'ച': 'N', 'ഛ': 'O', 'ജ': 'P', 'ഝ': 'Q', 'ഞ': 'R',
  'ട': 'S', 'ഠ': 'T', 'ഡ': 'U', 'ഢ': 'V', 'ണ': 'W',
  'ത': 'X', 'ഥ': 'Y', 'ദ': 'Z', 'ധ': '[', 'ന': '\\',
  'പ': ']', 'ഫ': '^', 'ബ': '_', 'ഭ': '`', 'മ': 'a',
  'യ': 'b', 'ര': 'c', 'റ': 'd', 'ല': 'e', 'ള': 'f',
  'ഴ': 'g', 'വ': 'h', 'ശ': 'i', 'ഷ': 'j', 'സ': 'k', 'ഹ': 'l',
};

const VOWELS: Record<string, string> = {
  'അ': 'A', 'ആ': 'B', 'ഇ': 'C', 'ഈ': 'Cu', 'ഉ': 'D', 'ഊ': 'Du', 'ഋ': 'E',
  'എ': 'F', 'ഏ': 'G', 'ഐ': 'sF', 'ഒ': 'H', 'ഓ': 'Hm', 'ഔ': 'Hu',
};

const SIGNS: Record<string, [string, string]> = {
  'ാ': ['', 'm'], 'ി': ['', 'n'], 'ീ': ['', 'o'], 'ു': ['', 'p'], 'ൂ': ['', 'q'],
  'ൃ': ['', 'r'], 'ൄ': ['', 'r'], 'െ': ['s', ''], 'േ': ['t', ''], 'ൈ': ['ss', ''],
  'ൊ': ['s', 'm'], 'ോ': ['t', 'm'], 'ൌ': ['s', 'u'], 'ൗ': ['', 'u'],
};

const MODIFIERS: Record<string, string> = {
  'ം': 'w',
  'ഃ': 'x',
  [VIRAMA]: 'v',
};

const CHILLUS: Record<string, string> = {
  'ൺ': '¬',
  'ൻ': '³',
  'ർ': 'À',
  'ൽ': 'Â',
  'ൾ': 'Ä',
  'ൿ': 'Iv',
};

const CONJUNCTS: Record<string, string | null> = {
  'ക്ക': '¡', 'ക്ല': '¢', 'ക്ഷ': '£', 'ഗ്ഗ': '¤', 'ഗ്ല': '¥', 'ങ്ക': '¦', 'ങ്ങ': '§',
  'ച്ച': '¨', 'ഞ്ച': '©', 'ഞ്ഞ': 'ª', 'ട്ട': '«', 'ണ്ട': null, 'ണ്ണ': '®', 'ത്ത': '¯',
  'ത്ഥ': '°', 'ദ്ദ': '±', 'ദ്ധ': '²', 'ന്ത': '´', 'ന്ദ': 'µ', 'ന്ന': '¶', 'ന്മ': '·',
  'പ്പ': '¸', 'പ്ല': '¹', 'ബ്ബ': 'º', 'ബ്ല': '»', 'മ്പ': '¼', 'മ്മ': '½', 'മ്ല': '¾',
  'യ്യ': '¿', 'ല്ല': 'Ã', 'ള്ള': 'Å', 'വ്വ': 'Æ', 'ശ്ല': 'Ç', 'ശ്ശ': 'È', 'സ്ല': 'É',
  'സ്സ': 'Ê', 'ഹ്ല': 'Ë', 'സ്റ്റ': 'Ì', 'ഡ്ഡ': 'Í', 'ക്ട': 'Î', 'ബ്ധ': 'Ï', 'ബ്ദ': 'Ð',
  'ച്ഛ': 'Ñ', 'ഹ്മ': 'Ò', 'ഹ്ന': 'Ó', 'ന്ധ': 'Ô', 'ത്സ': 'Õ', 'ജ്ജ': 'Ö', 'ണ്മ': '×',
  'സ്ഥ': 'Ø', 'ന്ഥ': 'Ù', 'ജ്ഞ': 'Ú', 'ത്ഭ': 'Û', 'ഗ്മ': 'Ü', 'ശ്ച': 'Ý', 'ണ്ഡ': 'Þ',
  'ത്മ': 'ß', 'ക്ത': 'à', 'ഗ്ന': 'á', 'ന്റ': 'â', 'ഷ്ട': 'ã', 'റ്റ': 'ä', 'ല്പ': 'å',
};

const MAX_CONJUNCT = 3;
const POST_BASE: Record<string, string> = { 'യ': 'y', 'വ': 'z' };
const RA = 'ര';
const RAKAR = '{';

const isConsonant = (ch: string) => ch in CONSONANTS;

function ndaGlyph(encoding: string, forDisplay: boolean): string {
  return encoding === 'fml' || forDisplay ? 'ï' : '\u00AD';
}

function normalize(text: string): string {
  return text
    .normalize('NFC')
    .replace(/ണ്\u200D/g, 'ൺ').replace(/ന്\u200D/g, 'ൻ').replace(/ര്\u200D/g, 'ർ')
    .replace(/ല്\u200D/g, 'ൽ').replace(/ള്\u200D/g, 'ൾ').replace(/ക്\u200D/g, 'ൿ')
    .replace(/ൻ്റ/g, 'ന്റ').replace(/ൻറ്/g, 'ന്റ്')
    .replace(/ൌ/g, 'ൌ')
    .replace(/[൦-൯]/g, (d) => String(d.charCodeAt(0) - 0x0D66));
}

function conjunctGlyph(cluster: string, encoding: string, forDisplay: boolean): string | null {
  if (cluster === 'ണ്ട') return ndaGlyph(encoding, forDisplay);
  return CONJUNCTS[cluster] ?? null;
}

function segment(consonants: string[], encoding: string, forDisplay: boolean): string[] {
  const units: string[] = [];
  let i = 0;
  while (i < consonants.length) {
    let taken = false;
    for (let len = Math.min(MAX_CONJUNCT, consonants.length - i); len > 1; len--) {
      const glyph = conjunctGlyph(consonants.slice(i, i + len).join(VIRAMA), encoding, forDisplay);
      if (glyph) {
        units.push(glyph);
        i += len;
        taken = true;
        break;
      }
    }
    if (!taken) units.push(CONSONANTS[consonants[i++]]);
  }
  return units;
}

function hasConjunct(a: string, b: string): boolean {
  return (a + VIRAMA + b) in CONJUNCTS;
}

/**
 * Standard TrueType Malayalam encoder supporting FML (Aparna, Leela) and ML-TT (Karthika, Revathi).
 */
export function toLegacy(
  text: string,
  encoding: 'ml' | 'fml' = 'fml',
  { forDisplay = false }: { forDisplay?: boolean } = {}
): string {
  const t = normalize(text);
  let out = '';
  let i = 0;

  while (i < t.length) {
    const ch = t[i];

    if (isConsonant(ch)) {
      const cons = [ch];
      let j = i + 1;
      while (t[j] === VIRAMA && isConsonant(t[j + 1])) {
        cons.push(t[j + 1]);
        j += 2;
      }
      let pre = '';
      let post = '';
      if (t[j] in SIGNS) {
        [pre, post] = SIGNS[t[j]];
        j++;
      }

      let postBase = '';
      let rakar = false;
      const last = () => cons[cons.length - 1];
      const prev = () => cons[cons.length - 2];
      if (cons.length > 1 && last() in POST_BASE && !hasConjunct(prev(), last())) {
        postBase = POST_BASE[cons.pop()!];
      }
      if (cons.length > 1 && last() === RA) {
        cons.pop();
        rakar = true;
      }

      const units = segment(cons, encoding, forDisplay);
      const lead = units.slice(0, -1).map((u) => u + 'v').join('');
      out += lead + pre + (rakar ? RAKAR : '') + units[units.length - 1] + postBase + post;
      i = j;
      continue;
    }

    if (ch in VOWELS) out += VOWELS[ch];
    else if (ch in SIGNS) out += SIGNS[ch].join('');
    else if (ch in MODIFIERS) out += MODIFIERS[ch];
    else if (ch in CHILLUS) out += CHILLUS[ch];
    else if (ch === ZWJ || ch === ZWNJ) {}
    else if (ch === '-') out += 'þ';
    else if (ch === '‘') out += '"';
    else if (ch === '’') out += "'";
    else out += ch;
    i++;
  }

  return out;
}

// Fallback logic for arbitrary legacy maps (Haritha, Matweb, etc.)
const PREBASE_UNICODE_LETTERS = ['േ', 'ൈ', '്ര', 'െ'];
const POSTBASE_UNICODE_LETTERS = ['ാ', 'ി', 'ീ', 'ു', 'ൂ', 'ൃ', 'ൗ', 'ം', 'ഃ', '്യ', '്വ'];

interface PreparedMap {
  revRules: Map<string, string>;
  sortedTokens: string[];
  prebaseAscii: Set<string>;
  postbaseAscii: Set<string>;
}

const mapCache = new Map<string, PreparedMap>();

function getPreparedMap(mapKey: string): PreparedMap {
  const cached = mapCache.get(mapKey);
  if (cached) return cached;

  const fontMap = rawMaps[mapKey];
  if (!fontMap) {
    throw new Error(`Font mapping table '${mapKey}' not found.`);
  }

  const revRules = new Map<string, string>();
  const prebaseAscii = new Set<string>();
  const postbaseAscii = new Set<string>();

  const entries = Object.entries(fontMap);
  entries.sort((a, b) => b[1].length - a[1].length);

  for (const [asciiKey, rawVal] of entries) {
    if (!asciiKey || !rawVal || !asciiKey.trim() || !rawVal.trim()) continue;
    const uniVal = normalizeMalayalam(rawVal);
    if (!uniVal || uniVal.length === 0) continue;

    if (!revRules.has(uniVal)) {
      revRules.set(uniVal, asciiKey);
    }
    if (PREBASE_UNICODE_LETTERS.includes(uniVal)) {
      prebaseAscii.add(asciiKey);
    }
    if (POSTBASE_UNICODE_LETTERS.includes(uniVal)) {
      postbaseAscii.add(asciiKey);
    }
  }

  const sortedTokens = Array.from(revRules.keys())
    .filter((token) => token && token.length > 0)
    .sort((a, b) => b.length - a.length);

  const prepared: PreparedMap = {
    revRules,
    sortedTokens,
    prebaseAscii,
    postbaseAscii,
  };

  mapCache.set(mapKey, prepared);
  return prepared;
}

/**
 * Universal Unicode to Legacy converter.
 * Routes FML to the FML engine, ML-TT to the ML engine, and others to generic map tables.
 */
export function convertUnicodeToLegacy(text: string, mapKey: string): string {
  if (!text) return '';

  const lowerKey = mapKey.toLowerCase();

  // 1. FML Formats (Aparna, Leela, Karthika, Panchami, etc.)
  if (lowerKey === 'fml' || lowerKey.includes('manorama') || lowerKey.includes('panchari')) {
    return toLegacy(text, 'fml');
  }

  // 2. ML-TT Formats (Karthika, Revathi, Ambili, Nandini, Indulekha)
  if (
    lowerKey === 'ml' ||
    lowerKey.includes('ml-tt') ||
    lowerKey.includes('mlb-tt') ||
    lowerKey === 'revathi'
  ) {
    return toLegacy(text, 'ml');
  }

  // 3. Generic map-based legacy fonts (Haritha, Matweb, Charaka, Uma)
  const normalized = normalizeMalayalam(text);
  const { revRules, sortedTokens, prebaseAscii } = getPreparedMap(mapKey);

  let idx = 0;
  let out = '';
  const len = normalized.length;

  while (idx < len) {
    let matched = false;

    for (let i = 0; i < sortedTokens.length; i++) {
      const token = sortedTokens[i];
      if (token.length > 0 && normalized.startsWith(token, idx)) {
        const code = revRules.get(token)!;

        if (token === 'െ' || token === 'േ' || token === 'ൈ') {
          if (out.length >= 2 && prebaseAscii.has(out[out.length - 2])) {
            out = out.slice(0, -2) + code + out.slice(-2);
          } else if (out.length >= 1) {
            out = out.slice(0, -1) + code + out.slice(-1);
          } else {
            out += code;
          }
        } else if (token === 'ൊ' || token === 'ോ' || token === 'ൌ') {
          if (code.length >= 2) {
            const c1 = code[0];
            const c2 = code.slice(1);
            if (out.length >= 2 && prebaseAscii.has(out[out.length - 2])) {
              out = out.slice(0, -2) + c1 + out.slice(-2) + c2;
            } else if (out.length >= 1) {
              out = out.slice(0, -1) + c1 + out.slice(-1) + c2;
            } else {
              out += code;
            }
          } else {
            out += code;
          }
        } else if (token === '്ര') {
          if (prebaseAscii.has(code)) {
            if (out.length >= 1) {
              out = out.slice(0, -1) + code + out.slice(-1);
            } else {
              out += code;
            }
          } else {
            out += code;
          }
        } else {
          out += code;
        }

        idx += token.length;
        matched = true;
        break;
      }
    }

    if (!matched) {
      out += normalized[idx];
      idx += 1;
    }
  }

  return out;
}
