# ⚡ MALAYALAM TEXT LAB (മലയാളം ടെക്സ്റ്റ് ലാബ്)

> **Minimalist Apple-Inspired Malayalam Transliteration & Encoding Converter**  
> Type Malayalam phonetically in English (Manglish) or directly in Unicode, then convert instantly into legacy **FML** and **ML-TT** font formats with one click.

---

## 🌟 Two Core Functions

1. **English-to-Malayalam Phonetic Transliteration (Manglish Typing)**:
   - Type naturally using English letters (e.g., `ente peru anjalsh aanu`).
   - Automatically renders live Malayalam Unicode (`എന്റെ പേര് അഞ്ജൽഷ് ആണ്`).
   - Features lightweight context-aware suggestion popups (Press Space, Enter, or 1–5 to select).
   - Instant toggle between **Manglish Typing** and **Direct Malayalam** input modes.
   - Built with a hybrid engine: online Google Input Tools API with instant offline rule-based fallback.

2. **Malayalam Unicode-to-Legacy Encoding Conversion**:
   - Converts the current Malayalam text into authentic 8-bit legacy encodings with verified character mappings:
     - **Convert to FML** (Primary: *Malayala Manorama* / Panchami DTP standard)
     - **Convert to ML-TT** (Secondary: *Karthika* / Revathi TrueType standard)
     - **Unicode** (Tertiary: Clean UTF-8 standard)
   - Genuine character-to-character encoding conversion (handles pre-base vowels, ra-karams, circumfixes, and complex conjuncts).
   - Prominent **COPY TEXT** button with animated checkmark and celebratory feedback.
   - Raw `.txt` export preserving original 8-bit encoded characters.

---

## 🚀 Quick Workflow

```
[ Type in English ] ──> ente peru anjalsh aanu
         │
         ▼
[ Live Malayalam  ] ──> എന്റെ പേര് അഞ്ജൽഷ് ആണ്
         │
         ▼
[ Choose Format   ] ──> [ Convert to FML ]  [ Convert to ML-TT ]  [ Unicode ]
         │
         ▼
[ Output & Copy   ] ──> Actual converted characters copied to clipboard in 1 click!
```

---

## 🧪 Automated Test Suite

Run all 43 automated unit tests for transliteration and multi-font conversion:

```bash
npm test
```

### Verified Test Cases:
- `ente` ➔ `എന്റെ`
- `peru` ➔ `പേര്`
- `aanu` ➔ `ആണ്`
- `malayalam` ➔ `മലയാളം`
- `sughamano` ➔ `സുഖമാണോ`
- `njan` ➔ `ഞാൻ`
- `ningal` ➔ `നിങ്ങൾ`
- `veedu` ➔ `വീട്`
- `sneham` ➔ `സ്നേഹം`
- `keralam` ➔ `കേരളം`
- `nanni` ➔ `നന്ദി`
- `anjalsh` ➔ `അഞ്ജൽഷ്`
- `ente peru anjalsh aanu` ➔ `എന്റെ പേര് അഞ്ജൽഷ് ആണ്`
- 100% Roundtrip accuracy across ML-TT Karthika, ML-TT Revathi, ML-TT Ambili, ML-TT Nandini, FML Manorama, and FML Panchari.

---

## 🚦 Local Development

```bash
# Start Vite development server
npm run dev

# Run test suite
npm test

# Build for production
npm run build
```
