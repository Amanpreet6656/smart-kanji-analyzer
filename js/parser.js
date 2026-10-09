/**
 * ═══════════════════════════════════════════════════════════
 *  PARSER.JS — Japanese Text Analysis Utility
 * ═══════════════════════════════════════════════════════════
 *
 *  Responsible for:
 *    1. Classifying characters into Kanji / Hiragana / Katakana.
 *    2. Extracting unique Kanji glyphs from arbitrary text.
 *    3. Counting script-category totals for the stats dashboard.
 *
 *  Unicode Ranges Used:
 *    Kanji (CJK Unified Ideographs):  U+4E00 – U+9FAF
 *    CJK Extension A:                 U+3400 – U+4DBF
 *    Hiragana:                        U+3040 – U+309F
 *    Katakana:                        U+30A0 – U+30FF
 */

/* exported KanjiParser */

const KanjiParser = (() => {
  'use strict';

  // ── Character classification regexes ─────────────
  // These cover the vast majority of modern Japanese text.
  const RE_KANJI    = /[\u4E00-\u9FAF\u3400-\u4DBF]/;
  const RE_HIRAGANA = /[\u3040-\u309F]/;
  const RE_KATAKANA = /[\u30A0-\u30FF]/;

  /**
   * Test whether a single character is a CJK Kanji glyph.
   * @param {string} char - A single character.
   * @returns {boolean}
   */
  function isKanji(char) {
    return RE_KANJI.test(char);
  }

  /**
   * Test whether a single character is Hiragana.
   * @param {string} char
   * @returns {boolean}
   */
  function isHiragana(char) {
    return RE_HIRAGANA.test(char);
  }

  /**
   * Test whether a single character is Katakana.
   * @param {string} char
   * @returns {boolean}
   */
  function isKatakana(char) {
    return RE_KATAKANA.test(char);
  }

  /**
   * Parse a Japanese text string and return:
   *   - `kanji`: deduplicated array of Kanji characters (preserves first-occurrence order)
   *   - `stats`: counts for total chars, unique kanji, hiragana, and katakana
   *
   * @param {string} text - Any text that may contain Japanese characters.
   * @returns {{ kanji: string[], stats: { total: number, kanji: number, hiragana: number, katakana: number } }}
   *
   * @example
   *   KanjiParser.parse('私は日本で人工知能を勉強したいです');
   *   // => {
   *   //   kanji: ['私', '日', '本', '人', '工', '知', '能', '勉', '強'],
   *   //   stats: { total: 16, kanji: 9, hiragana: 7, katakana: 0 }
   *   // }
   */
  function parse(text) {
    const chars = [...String(text)]; // Spread handles multi-byte correctly

    const seen  = new Set();
    const kanji = [];
    let hiraganaCount = 0;
    let katakanaCount = 0;

    for (const ch of chars) {
      if (isKanji(ch)) {
        // Deduplicate: only push the first occurrence
        if (!seen.has(ch)) {
          seen.add(ch);
          kanji.push(ch);
        }
      } else if (isHiragana(ch)) {
        hiraganaCount++;
      } else if (isKatakana(ch)) {
        katakanaCount++;
      }
      // Everything else (punctuation, romaji, spaces) is ignored
    }

    return {
      kanji,
      stats: {
        total:    chars.length,
        kanji:    kanji.length,
        hiragana: hiraganaCount,
        katakana: katakanaCount,
      },
    };
  }

  // ── Public API ───────────────────────────────────
  return { isKanji, isHiragana, isKatakana, parse };
})();
