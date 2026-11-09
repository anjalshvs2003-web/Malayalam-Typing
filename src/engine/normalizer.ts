/**
 * Malayalam Unicode Normalizer
 * Standardizes decomposed characters, legacy ZWJ chillus, and multi-part vowel signs
 * based on Swathanthra Malayalam Computing (SMC) standards.
 */

export function normalizeMalayalam(input: string): string {
  if (!input) return '';

  let text = input;

  // 1. Remove zero-width non-characters and soft hyphens
  text = text.replace(/[\u200B\uFEFF\u00AD]/g, '');

  // 2. Normalize ZWJ Chillus to atomic Chillus (Unicode 5.1+)
  text = text
    .replace(/\u0D23\u0D4D\u200D/g, 'ൺ') // ണ്‍ -> ൺ
    .replace(/\u0D28\u0D4D\u200D/g, 'ൻ') // ന്‍ -> ൻ
    .replace(/\u0D30\u0D4D\u200D/g, 'ർ') // ര്‍ -> ർ
    .replace(/\u0D32\u0D4D\u200D/g, 'ൽ') // ല്‍ -> ൽ
    .replace(/\u0D33\u0D4D\u200D/g, 'ൾ') // ള്‍ -> ൾ
    .replace(/\u0D15\u0D4D\u200D/g, 'ൿ'); // ക്‍ -> ൿ

  // 3. Normalize split / decomposed vowel signs
  text = text
    .replace(/െെ/g, 'ൈ')
    .replace(/ൊ/g, 'ൊ')
    .replace(/ാെ/g, 'ൊ')
    .replace(/ോ/g, 'ോ')
    .replace(/ാേ/g, 'ോ')
    .replace(/ൌ/g, 'ൗ')
    .replace(/ൗെ/g, 'ൗ')
    .replace(/ൌ/g, 'ൗ')
    .replace(/െഎ/g, 'ഐ')
    .replace(/എെ/g, 'ഐ')
    .replace(/ഇൗ/g, 'ഈ')
    .replace(/ഉൗ/g, 'ഊ')
    .replace(/ഒൗ/g, 'ഔ')
    .replace(/ഒാ/g, 'ഓ');

  // 4. Normalize common ligature combinations
  text = text
    .replace(/ൻ്റ/g, 'ന്റ')
    .replace(/ൎയ്യ/g, 'ര്യ')
    .replace(/ൎ/g, 'ർ')
    .replace(/ൻറെ/g, 'ന്റെ')
    .replace(/ൻറും/g, 'ന്റും')
    .replace(/ൻറ്/g, 'ന്റ്');

  return text;
}
