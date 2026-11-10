import { transliterateOfflineWord } from '../offlineEngine';
import { transliterateParagraph } from '../transliterationService';

console.log('==================================================');
console.log('  MALAYALAM TRANSLITERATION ENGINE TEST SUITE');
console.log('==================================================\n');

const testPairs: Array<[string, string]> = [
  ['ente', 'എന്റെ'],
  ['peru', 'പേര്'],
  ['aanu', 'ആണ്'],
  ['malayalam', 'മലയാളം'],
  ['sughamano', 'സുഖമാണോ'],
  ['njan', 'ഞാൻ'],
  ['ningal', 'നിങ്ങൾ'],
  ['veedu', 'വീട്'],
  ['sneham', 'സ്നേഹം'],
  ['keralam', 'കേരളം'],
  ['nanni', 'നന്ദി'],
  ['namaskaram', 'നമസ്കാരം'],
];

let total = 0;
let passed = 0;

console.log('--- 1. Testing Offline Transliteration Word Tests ---');
for (const [english, expectedMalayalam] of testPairs) {
  total++;
  const candidates = transliterateOfflineWord(english);
  const match = candidates.includes(expectedMalayalam);
  if (match) {
    console.log(`  ✓ ${english} -> ${candidates[0]} (matched expected "${expectedMalayalam}")`);
    passed++;
  } else {
    console.log(`  ✗ ${english} -> got: ${JSON.stringify(candidates)}, expected: "${expectedMalayalam}"`);
  }
}

console.log('\n--- 2. Testing Sentence Transliteration ---');
async function testSentence() {
  total++;
  const inputSentence = 'malayalam oru manoharamaaya bhashayaanu';
  const expectedSentence = 'മലയാളം ഒരു മനോഹരമായ ഭാഷയാണ്';
  const result = await transliterateParagraph(inputSentence);
  const ok = result.trim() === expectedSentence.trim();
  if (ok) {
    console.log(`  ✓ "${inputSentence}" -> "${result}"`);
    passed++;
  } else {
    console.log(`  ✗ "${inputSentence}" -> got: "${result}", expected: "${expectedSentence}"`);
  }

  console.log('\n==================================================');
  console.log(`Total: ${total} | Passed: ${passed} | Rate: ${Math.round((passed / total) * 100)}%`);
  console.log('==================================================\n');

  if (passed === total) {
    console.log('🎉 ALL TRANSLITERATION TESTS PASSED PERFECTLY!\n');
  } else {
    process.exit(1);
  }
}

testSentence();
