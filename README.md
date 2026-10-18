# Smart Kanji & JLPT Analyzer

A client-side JavaScript application designed to parse Japanese text, isolate Kanji characters via Unicode block evaluation, and retrieve morphological data and JLPT classifications. Built entirely with Vanilla JavaScript to study custom state management, asynchronous data pipelining, and defensive DOM rendering.

## System Architecture & Mechanics

- **Unicode Parsing Pipeline (`parser.js`):** Evaluates input strings against Japanese Unicode ranges (e.g., `\u4E00-\u9FAF`) to isolate Kanji. Utilizes ES6 Spread syntax for safe multi-byte character handling and `Set` objects for O(1) duplicate filtering.
- **Network & Fallback Layer (`api.js`):** Interfaces with external REST APIs to fetch character readings and JLPT data. Implements a robust offline-first fallback mechanism routing to local mock data to prevent application crashes during network failure.
- **State Management (`state.js`):** Employs a centralized observer pattern to decouple data processing from the user interface. 
- **Defensive Rendering (`ui.js`):** Pure rendering engine that strictly enforces DOM existence checks before mutation, guaranteeing zero null-reference exceptions.

## Project Structure

```text
kanji-project/
├── index.html          # Core document structure
├── css/
│   └── style.css       # BEM-methodology styling and JLPT color tokens
├── js/
│   ├── state.js        # Centralized state initialization and mutation logic
│   ├── parser.js       # Character isolation and Unicode evaluation
│   ├── api.js          # Network requests, Promise handling, and mock fallbacks
│   └── ui.js           # DOM manipulation and event listeners
└── README.md           # System documentation
```

## Data Flow

```text
User Input
    │
    ▼
┌──────────┐     ┌──────────┐     ┌──────────┐
│ parser.js│────▶│  api.js  │────▶│ state.js │
│(extract) │     │ (fetch)  │     │ (store)  │
└──────────┘     └──────────┘     └────┬─────┘
                                       │ notify()
                                       ▼
                                  ┌──────────┐
                                  │  ui.js   │
                                  │ (render) │
                                  └──────────┘
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

## Local Development

To run the project locally, serve the directory using a local web server:

**Using Python 3:**
```bash
python -m http.server 8000
```

**Using Node.js:**
```bash
npx http-server -p 8000
```
