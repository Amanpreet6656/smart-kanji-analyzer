# Smart Kanji & JLPT Analyzer

**[Live Deployment: smart-kanji-analyzer.vercel.app](https://smart-kanji-analyzer.vercel.app)**

A client-side JavaScript application designed to extract Kanji characters from Japanese text via Unicode block evaluation and retrieve readings, stroke counts, and JLPT levels from `kanjiapi.dev`. Built with Vanilla JavaScript (ES6+) to practice custom pub-sub state management, `localStorage` response caching, asynchronous API fallbacks, and escaped DOM rendering.

Note on scope: This tool performs character-level Unicode extraction rather than full sentence-level morphological segmentation (such as MeCab or Kuromoji).

## System Architecture & Mechanics

- **Unicode Parsing Pipeline (`parser.js`):** Evaluates input strings against Japanese Unicode ranges (CJK Unified Ideographs `\u4E00-\u9FAF`, Extension A `\u3400-\u4DBF`, Compatibility Ideographs `\uF900-\uFAFF`, and Extension B `\u{20000}-\u{2A6DF}`) to isolate unique Kanji. Uses ES6 spread syntax for safe multi-byte character iteration and `Set` objects for deduplication.
- **Network, Cache & Fallback Layer (`api.js`):** Queries `kanjiapi.dev` with `AbortController` timeouts, caches resolved entries in `localStorage` (`ska_kanji_cache_v1`), and falls back to curated offline entries when unreachable.
- **State Management (`state.js`):** Employs a centralized observer pattern (`AppState`) to decouple data processing from rendering.
- **Escaped DOM Rendering (`ui.js`):** Checks DOM node existence before updates and HTML-escapes API-sourced strings prior to insertion.

## Project Structure

```text
smart-kanji-analyzer/
├── index.html          # Document structure and event wiring
├── css/
│   └── style.css       # BEM-methodology styling and JLPT color tokens
├── js/
│   ├── state.js        # Centralized pub-sub state store
│   ├── parser.js       # Character isolation and Unicode evaluation
│   ├── api.js          # Network requests, localStorage cache, and fallbacks
│   └── ui.js           # Escaped DOM manipulation and flashcard interaction
├── tests/
│   └── test_parser.js  # Node.js unit tests for Unicode extraction
└── README.md           # Project documentation
```

## Verification

```bash
node tests/test_parser.js
```

## API Reference

**GET** `https://kanjiapi.dev/v1/kanji/日`

```json
{
  "kanji": "日",
  "grade": 1,
  "stroke_count": 4,
  "meanings": ["day", "sun", "Japan"],
  "kun_readings": ["ひ", "か"],
  "on_readings": ["ニチ", "ジツ"],
  "jlpt": 5
}
```
