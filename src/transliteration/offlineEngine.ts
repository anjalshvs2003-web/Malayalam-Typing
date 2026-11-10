/**
 * Offline Malayalam Phonetic Transliteration Engine (Mozhi-inspired)
 * High-performance, zero-latency rule-based transliterator.
 */

// High-priority common Malayalam words mapped phonetically
const COMMON_DICTIONARY: Record<string, string[]> = {
  ente: ['എന്റെ', 'എൻറെ', 'എൻ്റെ'],
  peru: ['പേര്', 'പേരു'],
  aanu: ['ആണ്', 'ആണു', 'ആണു്'],
  aano: ['ആണോ'],
  malayalam: ['മലയാളം'],
  sughamano: ['സുഖമാണോ', 'സുഖമാണൊ'],
  sukhamano: ['സുഖമാണോ'],
  njan: ['ഞാൻ', 'ഞാന്‍'],
  ningal: ['നിങ്ങൾ', 'നിങ്ങള്‍'],
  veedu: ['വീട്', 'വീടു'],
  sneham: ['സ്നേഹം'],
  keralam: ['കേരളം'],
  nanni: ['നന്ദി', 'നന്നി'],
  namaskaram: ['നമസ്കാരം'],
  engane: ['എങ്ങനെ'],
  evide: ['എവിടെ'],
  eppol: ['എപ്പോൾ'],
  ippol: ['ഇപ്പോൾ'],
  appol: ['അപ്പോൾ'],
  aarannu: ['ആരാണ്'],
  enthannu: ['എന്താണ്'],
  entha: ['എന്താ'],
  alle: ['അല്ലേ', 'അല്ലെ'],
  athe: ['അതെ', 'അതേ'],
  illa: ['ഇല്ല'],
  undu: ['ഉണ്ട്'],
  pinne: ['പിന്നെ'],
  santhosham: ['സന്തോഷം'],
  viswasam: ['വിശ്വാസം'],
  sahayam: ['സഹായം'],
  hridhyam: ['ഹൃദ്യം'],
  kootukaran: ['കൂട്ടുകാരൻ'],
  kootukari: ['കൂട്ടുകാരി'],
  nattil: ['നാട്ടിൽ'],
  nadu: ['നാട്'],
  amma: ['അമ്മ'],
  achan: ['അച്ഛൻ', 'അച്ചൻ'],
  chettan: ['ചേട്ടൻ'],
  chechi: ['ചേച്ചി'],
  aniyathi: ['അനിയത്തി'],
  aniyan: ['അനിയൻ'],
  poyi: ['പോയി'],
  varum: ['വരും'],
  vannu: ['വന്നു'],
  kanam: ['കാണാം'],
  kandu: ['കണ്ടു'],
  cheyyam: ['ചെയ്യാം'],
  cheythu: ['ചെയ്തു'],
  parayam: ['പറയാം'],
  paranju: ['പറഞ്ഞു'],
  nalla: ['നല്ല'],
  valare: ['വളരെ'],
  adhikam: ['അധികം'],
  shari: ['ശരി'],
  sherikkum: ['ശരിക്കും'],
  bhasha: ['ഭാഷ'],
  aksharam: ['അക്ഷരം'],
  pusthakam: ['പുസ്തകം'],
  pathram: ['പത്രം'],
};

// Independent vowels
const INDEPENDENT_VOWELS: Record<string, string> = {
  aa: 'ആ',
  a: 'അ',
  A: 'ആ',
  ee: 'ഈ',
  ii: 'ഈ',
  i: 'ഇ',
  I: 'ഈ',
  oo: 'ഊ',
  uu: 'ഊ',
  u: 'ഉ',
  U: 'ഊ',
  ea: 'ഏ',
  E: 'ഏ',
  e: 'എ',
  ai: 'ഐ',
  oa: 'ഓ',
  O: 'ഓ',
  o: 'ഒ',
  ou: 'ഔ',
  au: 'ഔ',
  R: 'ഋ',
};

// Dependent vowel signs (attached to consonants)
const VOWEL_SIGNS: Record<string, string> = {
  aa: 'ാ',
  a: '',
  A: 'ാ',
  ee: 'ീ',
  ii: 'ീ',
  i: 'ി',
  I: 'ീ',
  oo: 'ൂ',
  uu: 'ൂ',
  u: 'ു',
  U: 'ൂ',
  ea: 'േ',
  E: 'േ',
  e: 'െ',
  ai: 'ൈ',
  oa: 'ോ',
  O: 'ോ',
  o: 'ൊ',
  ou: 'ൗ',
  au: 'ൗ',
  R: 'ൃ',
};

// Consonants and conjunct clusters (sorted longest first)
const CONSONANTS: Array<[string, string]> = [
  ['chch', 'ച്ച'],
  ['cch', 'ച്ച'],
  ['chh', 'ഛ്'],
  ['ch', 'ച്'],
  ['thth', 'ത്ത'],
  ['tth', 'ത്ഥ'],
  ['th', 'ത്'],
  ['dh', 'ധ്'],
  ['bh', 'ഭ്'],
  ['ph', 'ഫ്'],
  ['gh', 'ഘ്'],
  ['kh', 'ഖ്'],
  ['jh', 'ഝ്'],
  ['sh', 'ശ്'],
  ['zh', 'ഴ്'],
  ['nj', 'ഞ്'],
  ['ng', 'ങ്'],
  ['kk', 'ക്ക'],
  ['tt', 'ട്ട'],
  ['pp', 'പ്പ'],
  ['mm', 'മ്മ'],
  ['nn', 'ന്ന'],
  ['ll', 'ല്ല'],
  ['LL', 'ള്ള'],
  ['bb', 'ബ്ബ'],
  ['gg', 'ഗ്ഗ'],
  ['ss', 'സ്സ'],
  ['yy', 'യ്യ'],
  ['vv', 'വ്വ'],
  ['ww', 'വ്വ'],
  ['nd', 'ണ്ട'],
  ['nth', 'ന്ത'],
  ['nt', 'ന്റ'],
  ['mp', 'മ്പ'],
  ['nch', 'ഞ്ച'],
  ['nk', 'ങ്ക'],
  ['k', 'ക്'],
  ['g', 'ഗ്'],
  ['c', 'ച്'],
  ['j', 'ജ്'],
  ['t', 'റ്റ്'],
  ['d', 'ദ്'],
  ['n', 'ന്'],
  ['p', 'പ്'],
  ['f', 'ഫ്'],
  ['b', 'ബ്'],
  ['m', 'മ്'],
  ['y', 'യ്'],
  ['r', 'ര്'],
  ['l', 'ല്'],
  ['v', 'വ്'],
  ['w', 'വ്'],
  ['s', 'സ്'],
  ['h', 'ഹ്'],
  ['L', 'ള്'],
  ['R', 'റ്'],
  ['x', 'ക്സ്'],
  ['z', 'സ്'],
];

/**
 * Phonetically transliterates a single English/Manglish word to Malayalam.
 */
export function transliterateOfflineWord(rawWord: string): string[] {
  if (!rawWord) return [];

  const lowerWord = rawWord.toLowerCase();

  // 1. Direct dictionary match
  if (COMMON_DICTIONARY[lowerWord]) {
    return COMMON_DICTIONARY[lowerWord];
  }

  // 2. Rule-based phonetic parser
  let idx = 0;
  let out = '';
  const len = rawWord.length;

  while (idx < len) {
    // Check if at start of syllable or word: try independent vowel
    if (idx === 0 || out.endsWith(' ') || out.endsWith('\n')) {
      let vowelMatched = false;
      const vowelKeys = Object.keys(INDEPENDENT_VOWELS).sort((a, b) => b.length - a.length);
      for (const vk of vowelKeys) {
        if (rawWord.startsWith(vk, idx)) {
          out += INDEPENDENT_VOWELS[vk];
          idx += vk.length;
          vowelMatched = true;
          break;
        }
      }
      if (vowelMatched) continue;
    }

    // Try matching consonant cluster
    let consonantMatched = false;
    for (const [cKey, cVal] of CONSONANTS) {
      if (rawWord.startsWith(cKey, idx)) {
        idx += cKey.length;
        consonantMatched = true;

        // Check if followed by a vowel sign
        let vowelSignMatched = false;
        const vsKeys = Object.keys(VOWEL_SIGNS).sort((a, b) => b.length - a.length);
        for (const vk of vsKeys) {
          if (rawWord.startsWith(vk, idx)) {
            const base = cVal.endsWith('്') ? cVal.slice(0, -1) : cVal;
            out += base + VOWEL_SIGNS[vk];
            idx += vk.length;
            vowelSignMatched = true;
            break;
          }
        }

        // If no vowel followed, check if word-final chillu or virama
        if (!vowelSignMatched) {
          const isAtWordEnd = idx >= len || !/[a-zA-Z]/.test(rawWord[idx]);
          if (isAtWordEnd) {
            // Apply chillu rules for word-final consonants
            if (cKey === 'n') out += 'ൻ';
            else if (cKey === 'l') out += 'ൽ';
            else if (cKey === 'r') out += 'ർ';
            else if (cKey === 'L') out += 'ൾ';
            else if (cKey === 'm') out += 'ം';
            else out += cVal;
          } else {
            out += cVal;
          }
        }
        break;
      }
    }

    if (!consonantMatched) {
      // Single character or symbol fallback
      const ch = rawWord[idx];
      if (INDEPENDENT_VOWELS[ch]) {
        out += INDEPENDENT_VOWELS[ch];
      } else {
        out += ch;
      }
      idx++;
    }
  }

  // Generate alternative variants (e.g. with chillu or chandrakkala)
  const candidates: string[] = [out];

  // If ends in ് or ു, add variant
  if (out.endsWith('്')) {
    candidates.push(out.slice(0, -1) + 'ു');
  } else if (out.endsWith('ു')) {
    candidates.push(out.slice(0, -1) + '്');
  }

  // Distinct candidates list
  return Array.from(new Set(candidates)).filter(Boolean);
}
