/**
 * ═══════════════════════════════════════════════════════════
 *  API.JS — Kanji Data Service (kanjiapi.dev + Fallbacks)
 * ═══════════════════════════════════════════════════════════
 *
 *  Primary source: https://kanjiapi.dev/v1/kanji/{character}
 *    Returns: { kanji, grade, stroke_count, meanings,
 *               kun_readings, on_readings, jlpt, unicode }
 *
 *  Secondary source (for word-level lookups):
 *    https://jisho.org/api/v1/search/words?keyword={character}
 *    ⚠ Jisho blocks browser CORS, so we fall back to mock data
 *      for word definitions when running client-side.
 *
 *  Features:
 *    • Per-request AbortController with configurable timeout
 *    • Graceful fallback to curated mock data on any failure
 *    • Console-logged diagnostics (never throws to the UI)
 *    • Parallel batch fetching with Promise.allSettled
 */

/* exported KanjiAPI */

const KanjiAPI = (() => {
  'use strict';

  const BASE_URL = 'https://kanjiapi.dev/v1/kanji';
  const TIMEOUT_MS = 8000; // 8-second timeout per request

  // ────────────────────────────────────────────────
  //  MOCK DATA — realistic fallbacks for offline use
  // ────────────────────────────────────────────────
  const MOCK_DATA = {
    '私':  { character: '私', grade: 6, stroke_count: 7,  meanings: ['private', 'I', 'me'],         kun_readings: ['わたくし', 'わたし'], on_readings: ['シ'],       jlpt: 4 },
    '日':  { character: '日', grade: 1, stroke_count: 4,  meanings: ['day', 'sun', 'Japan'],        kun_readings: ['ひ', 'か'],          on_readings: ['ニチ', 'ジツ'], jlpt: 5 },
    '本':  { character: '本', grade: 1, stroke_count: 5,  meanings: ['book', 'origin', 'main'],     kun_readings: ['もと'],              on_readings: ['ホン'],     jlpt: 5 },
    '人':  { character: '人', grade: 1, stroke_count: 2,  meanings: ['person', 'people'],           kun_readings: ['ひと'],              on_readings: ['ジン', 'ニン'], jlpt: 5 },
    '工':  { character: '工', grade: 2, stroke_count: 3,  meanings: ['craft', 'construction'],      kun_readings: [],                    on_readings: ['コウ', 'ク'],   jlpt: 3 },
    '知':  { character: '知', grade: 2, stroke_count: 8,  meanings: ['know', 'wisdom'],             kun_readings: ['し.る', 'し.らせる'],  on_readings: ['チ'],       jlpt: 4 },
    '能':  { character: '能', grade: 5, stroke_count: 10, meanings: ['ability', 'talent', 'skill'], kun_readings: ['よ.く'],             on_readings: ['ノウ'],     jlpt: 3 },
    '勉':  { character: '勉', grade: 3, stroke_count: 10, meanings: ['exertion', 'endeavour'],      kun_readings: ['つと.める'],          on_readings: ['ベン'],     jlpt: 4 },
    '強':  { character: '強', grade: 2, stroke_count: 11, meanings: ['strong', 'powerful'],         kun_readings: ['つよ.い', 'し.いる'], on_readings: ['キョウ', 'ゴウ'], jlpt: 4 },
    '学':  { character: '学', grade: 1, stroke_count: 8,  meanings: ['study', 'learning'],          kun_readings: ['まな.ぶ'],           on_readings: ['ガク'],     jlpt: 5 },
    '生':  { character: '生', grade: 1, stroke_count: 5,  meanings: ['life', 'birth', 'raw'],       kun_readings: ['い.きる', 'う.まれる'], on_readings: ['セイ', 'ショウ'], jlpt: 5 },
    '大':  { character: '大', grade: 1, stroke_count: 3,  meanings: ['large', 'big', 'great'],      kun_readings: ['おお.きい'],          on_readings: ['ダイ', 'タイ'], jlpt: 5 },
    '食':  { character: '食', grade: 2, stroke_count: 9,  meanings: ['eat', 'food'],                kun_readings: ['く.う', 'た.べる'],   on_readings: ['ショク', 'ジキ'], jlpt: 5 },
    '話':  { character: '話', grade: 2, stroke_count: 13, meanings: ['tale', 'talk', 'speech'],     kun_readings: ['はな.す', 'はなし'],  on_readings: ['ワ'],       jlpt: 5 },
    '語':  { character: '語', grade: 2, stroke_count: 14, meanings: ['word', 'speech', 'language'], kun_readings: ['かた.る', 'かた.らう'], on_readings: ['ゴ'],     jlpt: 5 },
    '読':  { character: '読', grade: 2, stroke_count: 14, meanings: ['read'],                      kun_readings: ['よ.む'],             on_readings: ['ドク', 'トク', 'トウ'], jlpt: 5 },
    '書':  { character: '書', grade: 2, stroke_count: 10, meanings: ['write', 'book'],              kun_readings: ['か.く'],             on_readings: ['ショ'],     jlpt: 5 },
    '見':  { character: '見', grade: 1, stroke_count: 7,  meanings: ['see', 'look', 'view'],        kun_readings: ['み.る', 'み.せる'],   on_readings: ['ケン'],     jlpt: 5 },
    '行':  { character: '行', grade: 2, stroke_count: 6,  meanings: ['go', 'carry out', 'line'],    kun_readings: ['い.く', 'おこな.う'], on_readings: ['コウ', 'ギョウ'], jlpt: 5 },
    '来':  { character: '来', grade: 2, stroke_count: 7,  meanings: ['come', 'next'],               kun_readings: ['く.る', 'きた.る'],   on_readings: ['ライ'],     jlpt: 5 },
    '出':  { character: '出', grade: 1, stroke_count: 5,  meanings: ['exit', 'leave', 'emerge'],    kun_readings: ['で.る', 'だ.す'],     on_readings: ['シュツ', 'スイ'], jlpt: 5 },
    '国':  { character: '国', grade: 2, stroke_count: 8,  meanings: ['country', 'nation'],          kun_readings: ['くに'],              on_readings: ['コク'],     jlpt: 5 },
    '時':  { character: '時', grade: 2, stroke_count: 10, meanings: ['time', 'hour'],               kun_readings: ['とき'],              on_readings: ['ジ'],       jlpt: 5 },
    '年':  { character: '年', grade: 1, stroke_count: 6,  meanings: ['year', 'age'],                kun_readings: ['とし'],              on_readings: ['ネン'],     jlpt: 5 },
    '月':  { character: '月', grade: 1, stroke_count: 4,  meanings: ['month', 'moon'],              kun_readings: ['つき'],              on_readings: ['ゲツ', 'ガツ'], jlpt: 5 },
    '山':  { character: '山', grade: 1, stroke_count: 3,  meanings: ['mountain'],                   kun_readings: ['やま'],              on_readings: ['サン', 'セン'], jlpt: 5 },
    '川':  { character: '川', grade: 1, stroke_count: 3,  meanings: ['river', 'stream'],            kun_readings: ['かわ'],              on_readings: ['セン'],     jlpt: 5 },
    '水':  { character: '水', grade: 1, stroke_count: 4,  meanings: ['water'],                      kun_readings: ['みず'],              on_readings: ['スイ'],     jlpt: 5 },
    '火':  { character: '火', grade: 1, stroke_count: 4,  meanings: ['fire'],                       kun_readings: ['ひ', 'ほ'],          on_readings: ['カ'],       jlpt: 5 },
    '木':  { character: '木', grade: 1, stroke_count: 4,  meanings: ['tree', 'wood'],               kun_readings: ['き', 'こ'],          on_readings: ['モク', 'ボク'], jlpt: 5 },
    '金':  { character: '金', grade: 1, stroke_count: 8,  meanings: ['gold', 'money', 'metal'],     kun_readings: ['かね', 'かな'],      on_readings: ['キン', 'コン'], jlpt: 5 },
    '土':  { character: '土', grade: 1, stroke_count: 3,  meanings: ['soil', 'earth', 'ground'],    kun_readings: ['つち'],              on_readings: ['ド', 'ト'],   jlpt: 5 },
    '天':  { character: '天', grade: 1, stroke_count: 4,  meanings: ['heaven', 'sky'],              kun_readings: ['あめ', 'あま'],      on_readings: ['テン'],     jlpt: 4 },
    '気':  { character: '気', grade: 1, stroke_count: 6,  meanings: ['spirit', 'mood', 'air'],      kun_readings: ['き'],                on_readings: ['キ', 'ケ'],   jlpt: 4 },
    '電':  { character: '電', grade: 2, stroke_count: 13, meanings: ['electricity', 'electric'],    kun_readings: [],                    on_readings: ['デン'],     jlpt: 5 },
    '車':  { character: '車', grade: 1, stroke_count: 7,  meanings: ['car', 'vehicle'],             kun_readings: ['くるま'],            on_readings: ['シャ'],     jlpt: 5 },
    '花':  { character: '花', grade: 1, stroke_count: 7,  meanings: ['flower', 'blossom'],          kun_readings: ['はな'],              on_readings: ['カ', 'ケ'],   jlpt: 4 },
    '雨':  { character: '雨', grade: 1, stroke_count: 8,  meanings: ['rain'],                       kun_readings: ['あめ', 'あま'],      on_readings: ['ウ'],       jlpt: 5 },
    '風':  { character: '風', grade: 2, stroke_count: 9,  meanings: ['wind', 'style'],              kun_readings: ['かぜ', 'かざ'],      on_readings: ['フウ', 'フ'],   jlpt: 3 },
    '空':  { character: '空', grade: 1, stroke_count: 8,  meanings: ['sky', 'empty', 'void'],       kun_readings: ['そら', 'あ.く', 'から'], on_readings: ['クウ'],   jlpt: 4 },
    '海':  { character: '海', grade: 2, stroke_count: 9,  meanings: ['sea', 'ocean'],               kun_readings: ['うみ'],              on_readings: ['カイ'],     jlpt: 3 },
    '力':  { character: '力', grade: 1, stroke_count: 2,  meanings: ['power', 'strength', 'force'], kun_readings: ['ちから'],            on_readings: ['リョク', 'リキ'], jlpt: 4 },
    '心':  { character: '心', grade: 2, stroke_count: 4,  meanings: ['heart', 'mind', 'spirit'],    kun_readings: ['こころ'],            on_readings: ['シン'],     jlpt: 4 },
    '手':  { character: '手', grade: 1, stroke_count: 4,  meanings: ['hand'],                       kun_readings: ['て', 'た'],          on_readings: ['シュ'],     jlpt: 5 },
    '目':  { character: '目', grade: 1, stroke_count: 5,  meanings: ['eye', 'look'],                kun_readings: ['め', 'ま'],          on_readings: ['モク', 'ボク'], jlpt: 4 },
    '耳':  { character: '耳', grade: 1, stroke_count: 6,  meanings: ['ear'],                        kun_readings: ['みみ'],              on_readings: ['ジ'],       jlpt: 3 },
    '口':  { character: '口', grade: 1, stroke_count: 3,  meanings: ['mouth', 'opening'],           kun_readings: ['くち'],              on_readings: ['コウ', 'ク'],   jlpt: 4 },
  };

  // ────────────────────────────────────────────────
  //  FETCH HELPERS
  // ────────────────────────────────────────────────

  /**
   * Fetch a single kanji's data from kanjiapi.dev.
   * Uses an AbortController to enforce a timeout.
   *
   * @param {string} character - A single kanji character.
   * @returns {Promise<Object>} Normalized kanji data object.
   */
  async function fetchOne(character) {
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const url = `${BASE_URL}/${encodeURIComponent(character)}`;
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} for ${character}`);
      }

      const data = await res.json();

      // Normalize the response into our standard shape
      return {
        character:     data.kanji        || character,
        grade:         data.grade        || null,
        stroke_count:  data.stroke_count || 0,
        meanings:      data.meanings     || [],
        kun_readings:  data.kun_readings || [],
        on_readings:   data.on_readings  || [],
        jlpt:          data.jlpt         || null,       // jlpt is numeric: 1–5 or null
        unicode:       data.unicode      || '',
        _source:       'kanjiapi.dev',
      };
    } catch (err) {
      clearTimeout(timeoutId);

      // Log a clean diagnostic — never surface raw errors to the user
      if (err.name === 'AbortError') {
        console.info(`[API] ⏱ Timeout for "${character}" — using fallback data.`);
      } else {
        console.info(`[API] ⚠ Fetch failed for "${character}":`, err.message, '— using fallback data.');
      }

      return getMockData(character);
    }
  }

  /**
   * Return mock/fallback data for a single kanji.
   * If we don't have curated data, generate a plausible placeholder.
   *
   * @param {string} character
   * @returns {Object}
   */
  function getMockData(character) {
    if (MOCK_DATA[character]) {
      return Object.assign({}, MOCK_DATA[character], { _source: 'mock' });
    }

    // Generic placeholder for kanji not in our curated set
    return {
      character,
      grade:        null,
      stroke_count: 0,
      meanings:     ['(meaning unavailable offline)'],
      kun_readings: [],
      on_readings:  [],
      jlpt:         null,
      unicode:      character.codePointAt(0).toString(16),
      _source:      'placeholder',
    };
  }

  /**
   * Fetch data for an array of kanji characters in parallel.
   * Uses Promise.allSettled so one failure doesn't block the rest.
   *
   * @param {string[]} kanjiList - Array of single kanji characters.
   * @returns {Promise<Object[]>} Array of normalized data objects.
   */
  async function fetchAll(kanjiList) {
    if (!Array.isArray(kanjiList) || kanjiList.length === 0) return [];

    const promises = kanjiList.map((char) => fetchOne(char));
    const results  = await Promise.allSettled(promises);

    return results.map((result, i) => {
      if (result.status === 'fulfilled') {
        return result.value;
      }
      // Should rarely reach here since fetchOne already catches errors
      console.info(`[API] Unexpected rejection for "${kanjiList[i]}" — using fallback.`);
      return getMockData(kanjiList[i]);
    });
  }

  // ── Public API ───────────────────────────────────
  return { fetchOne, fetchAll, getMockData };
})();
