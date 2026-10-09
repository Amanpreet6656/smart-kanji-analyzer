# 漢 Smart Kanji & JLPT Analyzer

A production-ready, single-page web application that instantly breaks down any Japanese sentence into its component kanji — color-coded by JLPT difficulty level — with interactive flashcard review.

![License](https://img.shields.io/badge/license-MIT-blue)
![Deploy](https://img.shields.io/badge/deploy-GitHub%20Pages-brightgreen)
![API](https://img.shields.io/badge/API-kanjiapi.dev-orange)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Real-Time Parsing** | Paste any Japanese text and extract unique kanji characters instantly |
| **JLPT Color Coding** | Each kanji is tagged with its official JLPT level (N5 → N1) using intuitive color badges |
| **Kanji Breakdown Cards** | View stroke count, Kun/On readings, English meanings, and grade for every character |
| **Interactive Flashcards** | Auto-generated flashcard deck with smooth 3D flip animation |
| **JLPT Level Filtering** | Filter the kanji grid by any JLPT level or view all at once |
| **Graceful Offline Mode** | Rich mock data ensures the app remains fully functional without network access |
| **Defensive DOM Safety** | Every DOM update is wrapped in existence checks — zero null-reference crashes |

---

## 🏗️ Project Structure

```
kanji-project/
├── index.html          # Main interface (input, dashboard, grid, flashcards)
├── css/
│   └── style.css       # BEM-style design tokens, JLPT badges, animations
├── js/
│   ├── state.js        # Centralized state manager (observer pattern)
│   ├── parser.js       # Unicode-based kanji/hiragana/katakana classifier
│   ├── api.js          # kanjiapi.dev fetch service + AbortController + fallbacks
│   └── ui.js           # Pure rendering engine with defensive DOM checks
└── README.md           # This file
```

---

## 🔌 API Sources

### Primary — [kanjiapi.dev](https://kanjiapi.dev)

Free, open, CORS-enabled REST API for kanji data.

```
GET https://kanjiapi.dev/v1/kanji/{character}

Response:
{
  "kanji": "日",
  "grade": 1,
  "stroke_count": 4,
  "meanings": ["day", "sun", "Japan"],
  "kun_readings": ["ひ", "か"],
  "on_readings": ["ニチ", "ジツ"],
  "jlpt": 5,
  "unicode": "65e5"
}
```

### Secondary — [Jisho.org](https://jisho.org)

Referenced for word-level lookups. Due to browser CORS restrictions, direct Jisho API calls are handled via mock fallbacks in client-side mode.

---

## 🎨 JLPT Color Legend

| Level | Color | Difficulty |
|-------|-------|------------|
| **N5** | 🟢 Green | Beginner |
| **N4** | 🔵 Blue | Elementary |
| **N3** | 🟡 Yellow | Intermediate |
| **N2** | 🟠 Orange | Upper Intermediate |
| **N1** | 🔴 Red | Advanced |
| **—** | ⚪ Gray | Unrated |

---

## 🚀 Deployment

### GitHub Pages (Recommended)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Smart Kanji & JLPT Analyzer"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/kanji-analyzer.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   - Go to **Settings → Pages**
   - Source: **Deploy from a branch**
   - Branch: `main`, folder: `/ (root)`
   - Click **Save**

3. Your site will be live at:
   ```
   https://YOUR_USERNAME.github.io/kanji-analyzer/
   ```

### Local Development

No build step required. Just open `index.html` in any modern browser:

```bash
# Using Python's built-in server
python -m http.server 8000

# Using Node's http-server
npx http-server -p 8000
```

Then visit `http://localhost:8000`.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Enter` | Analyze the current text |
| `◀ / ▶` buttons | Navigate flashcards |
| `Click / Enter / Space` | Flip a flashcard |

---

## 🧩 Architecture

```
User Input
    │
    ▼
┌──────────┐     ┌──────────┐     ┌──────────┐
│ parser.js │────▶│  api.js  │────▶│ state.js │
│ (extract) │     │ (fetch)  │     │ (store)  │
└──────────┘     └──────────┘     └────┬─────┘
                                       │ notify()
                                       ▼
                                  ┌──────────┐
                                  │  ui.js   │
                                  │ (render) │
                                  └──────────┘
```

**Data Flow**: Input → Parse → Fetch → Store → Render

---

## 📄 License

MIT — free for personal and commercial use.
