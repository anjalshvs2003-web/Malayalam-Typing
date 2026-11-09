import { convertText } from '../conversionRegistry';

console.log('==================================================');
console.log('  MALAYALAM TEXT LAB - MULTI-FONT SUITE');
console.log('==================================================\n');

const sentences = [
  'മലയാളം നമ്മുടെ മാതൃഭാഷയാണ്.',
  'കേരളത്തിലെ പ്രകൃതിഭംഗി മനോഹരമാണ്.',
  'വിദ്യാഭ്യാസം ഓരോ വ്യക്തിയുടെയും അവകാശമാണ്.',
  'ശാസ്ത്ര സാങ്കേതിക രംഗത്ത് നാം ഏറെ മുന്നേറി.',
  'കമ്പ്യൂട്ടർ പ്രോഗ്രാമിംഗ് പുതിയ ലോകം തുറക്കുന്നു.',
];

const fonts = [
  { id: 'mltt-karthika', name: 'ML-TT Karthika' },
  { id: 'mltt-revathi', name: 'ML-TT Revathi' },
  { id: 'mltt-ambili', name: 'ML-TT Ambili' },
  { id: 'mltt-nandini', name: 'ML-TT Nandini' },
  { id: 'fml-manorama', name: 'FML Manorama' },
  { id: 'fml-panchari', name: 'FML Panchari' },
];

let total = 0;
let passed = 0;

for (const font of fonts) {
  console.log(`\n--- Testing ${font.name} ---`);
  for (const sentence of sentences) {
    total++;
    const enc = convertText(sentence, 'unicode', font.id);
    const dec = convertText(enc.outputText, font.id, 'unicode');
    const ok = dec.outputText === sentence;
    if (ok) {
      console.log(`  ✓ ${sentence}`);
      passed++;
    } else {
      console.log(`  ✗ ${sentence}`);
      console.log(`    Decoded: ${dec.outputText}`);
    }
  }
}

console.log('\n==================================================');
console.log(`Total: ${total} | Passed: ${passed} | Rate: ${Math.round((passed / total) * 100)}%`);
console.log('==================================================\n');

if (passed === total) {
  console.log('🌟 ALL 30 FONT CONVERSION TESTS PASSED WITH 100% ACCURACY!');
} else {
  process.exit(1);
}
