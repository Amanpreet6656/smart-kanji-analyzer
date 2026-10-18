// parser.js — extract and classify Japanese characters from text

const KanjiParser = (() => {
  'use strict';

  // unicode ranges for CJK, hiragana, katakana
  const RE_KANJI    = /[\u4E00-\u9FAF\u3400-\u4DBF]/;
  const RE_HIRAGANA = /[\u3040-\u309F]/;
  const RE_KATAKANA = /[\u30A0-\u30FF]/;

  function isKanji(char) {
    return RE_KANJI.test(char);
  }

  function isHiragana(char) {
    return RE_HIRAGANA.test(char);
  }

  function isKatakana(char) {
    return RE_KATAKANA.test(char);
  }

  // returns deduplicated kanji array + script counts
  function parse(text) {
    const chars = text ? [...String(text)] : []; // spread handles surrogate pairs

    const seen  = new Set();
    const kanji = [];
    let hiraganaCount = 0;
    let katakanaCount = 0;

    for (const ch of chars) {
      if (isKanji(ch)) {
        if (!seen.has(ch)) {
          seen.add(ch);
          kanji.push(ch);
        }
      } else if (isHiragana(ch)) {
        hiraganaCount++;
      } else if (isKatakana(ch)) {
        katakanaCount++;
      }
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

  return { isKanji, isHiragana, isKatakana, parse };
})();
