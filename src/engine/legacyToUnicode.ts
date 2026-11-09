import { rawMaps } from './maps/rawMaps';
import { normalizeMalayalam } from './normalizer';

const VIRAMA = '്';
const RAKAR = '{';

const CONSONANTS: Record<string, string> = {
  'ക': 'I', 'ഖ': 'J', 'ഗ': 'K', 'ഘ': 'L', 'ങ': 'M',
  'ച': 'N', 'ഛ': 'O', 'ജ': 'P', 'ഝ': 'Q', 'ഞ': 'R',
  'ട': 'S', 'ഠ': 'T', 'ഡ': 'U', 'ഢ': 'V', 'ണ': 'W',
  'ത': 'X', 'ഥ': 'Y', 'ദ': 'Z', 'ധ': '[', 'ന': '\\',
  'പ': ']', 'ഫ': '^', 'ബ': '_', 'ഭ': '`', 'മ': 'a',
  'യ': 'b', 'ര': 'c', 'റ': 'd', 'ല': 'e', 'ള': 'f',
  'ഴ': 'g', 'വ': 'h', 'ശ': 'i', 'ഷ': 'j', 'സ': 'k', 'ഹ': 'l',
};

const CONJUNCTS: Record<string, string | null> = {
  'ക്ക': '¡', 'ക്ല': '¢', 'ക്ഷ': '£', 'ഗ്ഗ': '¤', 'ഗ്ല': '¥', 'ങ്ക': '¦', 'ങ്ങ': '§',
  'ച്ച': '¨', 'ഞ്ച': '©', 'ഞ്ഞ': 'ª', 'ട്ട': '«', 'ണ്ട': null, 'ണ്ണ': '®', 'ത്ത': '¯',
  'ത്ഥ': '°', 'ദ്ദ': '±', 'ദ്ധ': '²', 'ന്ത': '´', 'ന്ദ': 'µ', 'ന്ന': '¶', 'ന്മ': '·',
  'പ്പ': '¸', 'പ്ല': '¹', 'ബ്ബ': 'º', 'ബ്ല': '»', 'മ്പ': '¼', 'മ്മ': '½', 'മ്ല': '¾',
  'യ്യ': '¿', 'ല്ല': 'Ã', 'ള്ള': 'Å', 'വ്വ': 'Æ', 'ശ്ല': 'Ç', 'ശ്ശ': 'È', 'സ്ല': 'É',
  'സ്സ': 'Ê', 'ഹ്ല': 'Ë', 'സ്റ്റ': 'Ì', 'ഡ്ഡ': 'Í', 'ക്ട': 'Î', 'ബ്ധ': 'Ï', 'ബ്ദ': 'Ð',
  'ച്ഛ': 'Ñ', 'ഹ്മ': 'Ò', 'ഹ്ന': 'Ó', 'ന്ധ': 'Ô', 'ത്സ': 'Õ', 'ജ്ജ': 'Ö', 'ണ്മ': '×',
  'സ്ഥ': 'Ø', 'ANTH': 'Ù', 'ജ്ഞ': 'Ú', 'ത്ഭ': 'Û', 'ഗ്മ': 'Ü', 'ശ്ച': 'Ý', 'ണ്ഡ': 'Þ',
  'ത്മ': 'ß', 'ക്ത': 'à', 'ഗ്ന': 'á', 'ന്റ': 'â', 'ഷ്ട': 'ã', 'റ്റ': 'ä', 'ല്പ': 'å',
};

const GLYPH_TO_UNICODE: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const [u, g] of Object.entries(CONSONANTS)) map[g] = u;
  for (const [u, g] of Object.entries(CONJUNCTS)) {
    if (g) map[g] = u;
  }
  map['\u00AD'] = 'ണ്ട';
  map['ï'] = 'ണ്ട';
  map['Á'] = 'റ്റ';
  map['ä'] = 'റ്റ';
  map['Œ'] = 'മ്പ';
  map['¼'] = 'മ്പ';
  Object.assign(map, {
    'æ': 'കു',
    'ç': 'ക്കു',
    'è': 'ങ്കു',
    'é': 'ണു',
    'ê': 'രു',
    'ë': 'നു',
    'ì': 'ന്നു',
    'í': 'യ്ക്ക',
  });
  return map;
})();

const VOWEL_GLYPHS: Record<string, string> = {
  A: 'അ', B: 'ആ', C: 'ഇ', D: 'ഉ', E: 'ഋ', F: 'എ', G: 'ഏ', H: 'ഒ'
};

const VOWEL_LENGTHENED: Record<string, string> = {
  Cu: 'ഈ', Du: 'ഊ', Hm: 'ഓ', Hu: 'ഔ'
};

const POST_GLYPHS: Record<string, string> = {
  m: 'ാ', n: 'ി', o: 'ീ', p: 'ു', q: 'ൂ', r: 'ൃ', u: 'ൗ'
};

const POST_BASE_GLYPHS: Record<string, string> = {
  y: '്യ', z: '്വ', '|': '്യു', '}': '്യൂ'
};

const OTHER_GLYPHS: Record<string, string> = {
  v: VIRAMA,
  w: 'ം',
  x: 'ഃ',
  '¬': 'ൺ',
  '³': 'ൻ',
  'À': 'ർ',
  'Â': 'ൽ',
  'Ä': 'ൾ',
  'þ': '-',
  '-': '',
};

/**
 * Standard TrueType Malayalam decoder for FML and ML-TT encodings back to Unicode.
 */
export function fromLegacy(text: string): string {
  if (!text) return '';
  let out = '';
  let i = 0;
  const s = text;

  while (i < s.length) {
    let pre = '';
    let rakar = false;
    let j = i;

    while (s[j] === 's' || s[j] === 't' || s[j] === RAKAR) {
      if (s[j] === RAKAR) rakar = true;
      else pre += s[j];
      j++;
    }
    const base = s[j];

    // Special standalone vowel: sF -> ഐ
    if (pre === 's' && !rakar && base === 'F') {
      out += 'ഐ';
      i = j + 1;
      continue;
    }

    if (base in GLYPH_TO_UNICODE) {
      let syl = GLYPH_TO_UNICODE[base];
      j++;
      if (rakar) syl += '്ര';
      while (s[j] in POST_BASE_GLYPHS) {
        syl += POST_BASE_GLYPHS[s[j++]];
      }
      if (pre === 's' && s[j] === 'm') { syl += 'ൊ'; j++; }
      else if (pre === 't' && s[j] === 'm') { syl += 'ോ'; j++; }
      else if (pre === 's' && s[j] === 'u') { syl += 'ൌ'; j++; }
      else if (pre === 's') syl += 'െ';
      else if (pre === 't') syl += 'േ';
      else if (pre === 'ss') syl += 'ൈ';
      else if (pre) syl += pre;

      out += syl;
      i = j;
      continue;
    }

    if (pre || rakar) {
      out += s.slice(i, j);
      i = j;
      continue;
    }

    const two = s.slice(i, i + 2);
    if (two in VOWEL_LENGTHENED) {
      out += VOWEL_LENGTHENED[two];
      i += 2;
      continue;
    }

    const ch = s[i];
    if (ch in VOWEL_GLYPHS) out += VOWEL_GLYPHS[ch];
    else if (ch in POST_GLYPHS) out += POST_GLYPHS[ch];
    else if (ch in POST_BASE_GLYPHS) out += POST_BASE_GLYPHS[ch];
    else if (ch in OTHER_GLYPHS) out += OTHER_GLYPHS[ch];
    else out += ch;
    i++;
  }

  return normalizeMalayalam(out);
}

// Fallback logic for arbitrary legacy maps (Haritha, Matweb, etc.)
const PREBASE_UNICODE_LETTERS = ['േ', 'ൈ', '്ര', 'െ'];
const POSTBASE_UNICODE_LETTERS = ['ാ', 'ി', 'ീ', 'ു', 'ൂ', 'ൃ', 'ൗ', 'ം', 'ഃ', '്യ', '്വ'];

interface PreparedReverseMap {
  rules: Record<string, string>;
  sortedAsciiKeys: string[];
  prebaseAscii: Set<string>;
  postbaseAscii: Set<string>;
  compoundVowels: Record<string, string>;
}

const reverseMapCache = new Map<string, PreparedReverseMap>();

function getPreparedReverseMap(mapKey: string): PreparedReverseMap {
  const cached = reverseMapCache.get(mapKey);
  if (cached) return cached;

  const fontMap = rawMaps[mapKey];
  if (!fontMap) {
    throw new Error(`Font mapping table '${mapKey}' not found.`);
  }

  const cleanedRules: Record<string, string> = {};
  const prebaseAscii = new Set<string>();
  const postbaseAscii = new Set<string>();
  const compoundVowels: Record<string, string> = {};

  for (const [asciiKey, rawVal] of Object.entries(fontMap)) {
    if (!asciiKey || !rawVal || !asciiKey.trim() || !rawVal.trim()) continue;
    const uniVal = normalizeMalayalam(rawVal);
    if (!uniVal || uniVal.length === 0) continue;

    cleanedRules[asciiKey] = uniVal;

    if (PREBASE_UNICODE_LETTERS.includes(uniVal)) {
      prebaseAscii.add(asciiKey);
    }
    if (POSTBASE_UNICODE_LETTERS.includes(uniVal)) {
      postbaseAscii.add(asciiKey);
    }
    if (
      asciiKey.length > 1 &&
      ['ഐ', 'ഓ', 'ഔ', 'ഈ', 'ഊ', 'ഌ', 'ോ', 'ൊ', 'ൌ'].includes(uniVal)
    ) {
      compoundVowels[asciiKey] = uniVal;
    }
  }

  const sortedAsciiKeys = Object.keys(cleanedRules)
    .filter((k) => k && k.length > 0)
    .sort((a, b) => b.length - a.length);

  const prepared: PreparedReverseMap = {
    rules: cleanedRules,
    sortedAsciiKeys,
    prebaseAscii,
    postbaseAscii,
    compoundVowels,
  };

  reverseMapCache.set(mapKey, prepared);
  return prepared;
}

/**
 * Universal Legacy to Unicode converter.
 * Routes FML and ML-TT directly to high-accuracy fromLegacy decoder.
 */
export function convertLegacyToUnicode(text: string, mapKey: string): string {
  if (!text) return '';

  const lowerKey = mapKey.toLowerCase();

  // 1. FML and ML-TT formats
  if (
    lowerKey === 'fml' ||
    lowerKey.includes('manorama') ||
    lowerKey.includes('panchari') ||
    lowerKey === 'ml' ||
    lowerKey.includes('ml-tt') ||
    lowerKey.includes('mlb-tt') ||
    lowerKey === 'revathi'
  ) {
    return fromLegacy(text);
  }

  // 2. Generic reverse map fallback
  const { rules, sortedAsciiKeys, prebaseAscii, postbaseAscii, compoundVowels } =
    getPreparedReverseMap(mapKey);

  let processed = text;

  for (const [compKey, uniVal] of Object.entries(compoundVowels)) {
    if (processed.includes(compKey)) {
      processed = processed.split(compKey).join(uniVal);
    }
  }

  let transposed = '';
  let prebaseBuffer = '';

  for (let i = 0; i < processed.length; i++) {
    const ch = processed[i];

    if (prebaseAscii.has(ch)) {
      prebaseBuffer = ch + prebaseBuffer;
    } else if (postbaseAscii.has(ch)) {
      transposed += ch + prebaseBuffer;
      prebaseBuffer = '';
    } else {
      transposed += ch + prebaseBuffer;
      prebaseBuffer = '';
    }
  }

  if (prebaseBuffer) {
    transposed += prebaseBuffer;
  }

  let idx = 0;
  let decoded = '';
  const len = transposed.length;

  while (idx < len) {
    let matched = false;

    for (let k = 0; k < sortedAsciiKeys.length; k++) {
      const asciiToken = sortedAsciiKeys[k];
      if (asciiToken.length > 0 && transposed.startsWith(asciiToken, idx)) {
        decoded += rules[asciiToken];
        idx += asciiToken.length;
        matched = true;
        break;
      }
    }

    if (!matched) {
      decoded += transposed[idx];
      idx += 1;
    }
  }

  return normalizeMalayalam(decoded);
}
