import { transliterateOfflineWord } from './offlineEngine';

// In-memory cache for fast typing responsiveness
const candidateCache = new Map<string, string[]>();

// Priority overrides for canonical words requested by user
const CANONICAL_OVERRIDES: Record<string, string> = {
  ente: 'എന്റെ',
  peru: 'പേര്',
  aanu: 'ആണ്',
  namaskaram: 'നമസ്കാരം',
  njan: 'ഞാൻ',
  ningal: 'നിങ്ങൾ',
  nanni: 'നന്ദി',
  keralam: 'കേരളം',
  malayalam: 'മലയാളം',
  sneham: 'സ്നേഹം',
  veedu: 'വീട്',
  sughamano: 'സുഖമാണോ',
};

/**
 * Fetches phonetic Malayalam transliteration candidates for a word.
 * Tries Google Input Tools first for rich suggestions; falls back to offline engine immediately on failure.
 */
export async function getTransliterationCandidates(word: string): Promise<string[]> {
  if (!word || !word.trim()) return [];

  const cleanWord = word.trim();
  const cacheKey = cleanWord.toLowerCase();

  if (candidateCache.has(cacheKey)) {
    return candidateCache.get(cacheKey)!;
  }

  // Pre-fetch offline candidates as baseline
  const offlineCandidates = transliterateOfflineWord(cleanWord);

  try {
    const url = `https://inputtools.google.com/request?text=${encodeURIComponent(
      cleanWord
    )}&itc=ml-t-i0-und&num=5`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data[0] === 'SUCCESS' && data[1] && data[1][0] && data[1][0][1]) {
        let googleCandidates: string[] = data[1][0][1];

        // If a canonical user-specified override exists, ensure it is ranked #1
        if (CANONICAL_OVERRIDES[cacheKey]) {
          const overrideVal = CANONICAL_OVERRIDES[cacheKey];
          googleCandidates = [
            overrideVal,
            ...googleCandidates.filter((c) => c !== overrideVal),
          ];
        }

        const merged = Array.from(new Set([...googleCandidates, ...offlineCandidates]));
        candidateCache.set(cacheKey, merged);
        return merged;
      }
    }
  } catch {
    // Network error or timeout: seamlessly use offline candidates
  }

  // Fallback to offline candidates with canonical preference
  let finalOffline = offlineCandidates;
  if (CANONICAL_OVERRIDES[cacheKey]) {
    const overrideVal = CANONICAL_OVERRIDES[cacheKey];
    finalOffline = [
      overrideVal,
      ...offlineCandidates.filter((c) => c !== overrideVal),
    ];
  }

  candidateCache.set(cacheKey, finalOffline);
  return finalOffline;
}

/**
 * Transliterates an entire block of text (e.g. pasted Manglish sentences or paragraphs).
 * Preserves spaces, punctuation, numbers, and formatting.
 */
export async function transliterateParagraph(text: string): Promise<string> {
  if (!text) return '';

  // Match English words while preserving whitespace and symbols
  const tokens = text.split(/([a-zA-Z]+)/);
  const resultTokens: string[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (/^[a-zA-Z]+$/.test(token)) {
      const candidates = await getTransliterationCandidates(token);
      resultTokens.push(candidates[0] || token);
    } else {
      resultTokens.push(token);
    }
  }

  return resultTokens.join('');
}
