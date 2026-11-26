const assert = require('assert');
const KanjiParser = require('../js/parser.js');

const basic = KanjiParser.parse('私は日本で人工知能を勉強したいです。カタカナテスト');
assert.deepStrictEqual(basic.kanji, ['私', '日', '本', '人', '工', '知', '能', '勉', '強']);
assert.strictEqual(basic.stats.kanji, 9);
assert.strictEqual(basic.stats.hiragana, 8);
assert.strictEqual(basic.stats.katakana, 7);

// Deduplication preserves first-seen order
const dupes = KanjiParser.parse('日本日本東京');
assert.deepStrictEqual(dupes.kanji, ['日', '本', '東', '京']);

// Surrogate pair Extension B Kanji (U+20B9F 𠮟)
const extB = KanjiParser.parse('𠮟る');
assert.deepStrictEqual(extB.kanji, ['𠮟']);
assert.strictEqual(extB.stats.hiragana, 1);

// Empty input
const empty = KanjiParser.parse('');
assert.deepStrictEqual(empty.kanji, []);
assert.strictEqual(empty.stats.total, 0);

console.log('PASS: All Smart Kanji Parser tests succeeded.');
