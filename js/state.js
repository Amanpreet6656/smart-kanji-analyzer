// state.js — central app state w/ pub-sub notifications

const AppState = (() => {
  'use strict';

  const _state = {
    inputText:      '',
    parsedKanji:    [],
    charStats:      { total: 0, kanji: 0, hiragana: 0, katakana: 0 },
    kanjiData:      [],
    flashcards:     [],
    flashcardIndex: 0,
    jlptFilter:     'all',
    isLoading:      false,
  };

  const _listeners = [];

  // deep-copy arrays/objects so subscribers can't mutate internals
  function _notify() {
    const snapshot = {
      inputText:      _state.inputText,
      parsedKanji:    [..._state.parsedKanji],
      charStats:      Object.assign({}, _state.charStats),
      kanjiData:      _state.kanjiData.map((k) => ({
        ...k,
        meanings:     Array.isArray(k.meanings) ? [...k.meanings] : [],
        kun_readings: Array.isArray(k.kun_readings) ? [...k.kun_readings] : [],
        on_readings:  Array.isArray(k.on_readings) ? [...k.on_readings] : [],
      })),
      flashcards:     _state.flashcards.map((c) => Object.assign({}, c)),
      flashcardIndex: _state.flashcardIndex,
      jlptFilter:     _state.jlptFilter,
      isLoading:      _state.isLoading,
    };
    _listeners.forEach((fn) => {
      try { fn(snapshot); }
      catch (err) { console.error('[State] Subscriber error:', err); }
    });
  }

  return {
    subscribe(fn) {
      if (typeof fn === 'function') {
        _listeners.push(fn);
        return () => {
          const idx = _listeners.indexOf(fn);
          if (idx !== -1) _listeners.splice(idx, 1);
        };
      }
    },
    unsubscribe(fn) {
      const idx = _listeners.indexOf(fn);
      if (idx !== -1) _listeners.splice(idx, 1);
    },

    // getters return copies to keep internals safe
    get inputText()      { return _state.inputText; },
    get parsedKanji()    { return [..._state.parsedKanji]; },
    get charStats()      { return Object.assign({}, _state.charStats); },
    get kanjiData()      { return [..._state.kanjiData]; },
    get flashcards()     { return [..._state.flashcards]; },
    get flashcardIndex() { return _state.flashcardIndex; },
    get jlptFilter()     { return _state.jlptFilter; },
    get isLoading()      { return _state.isLoading; },

    setInputText(text) {
      _state.inputText = String(text ?? '');
      _notify();
    },

    setParsedKanji(kanji) {
      _state.parsedKanji = Array.isArray(kanji) ? kanji : [];
      _notify();
    },

    setCharStats(stats) {
      _state.charStats = Object.assign({ total: 0, kanji: 0, hiragana: 0, katakana: 0 }, stats);
      _notify();
    },

    setKanjiData(data) {
      _state.kanjiData = Array.isArray(data) ? data : [];
      _notify();
    },

    setFlashcards(cards) {
      _state.flashcards = Array.isArray(cards) ? cards : [];
      _state.flashcardIndex = 0;
      _notify();
    },

    setJlptFilter(level) {
      _state.jlptFilter = level;
      _notify();
    },

    setLoading(flag) {
      _state.isLoading = Boolean(flag);
      _notify();
    },

    // wraps around at both ends
    nextFlashcard() {
      if (_state.flashcards.length === 0) return;
      _state.flashcardIndex = (_state.flashcardIndex + 1) % _state.flashcards.length;
      _notify();
    },

    prevFlashcard() {
      if (_state.flashcards.length === 0) return;
      _state.flashcardIndex =
        (_state.flashcardIndex - 1 + _state.flashcards.length) % _state.flashcards.length;
      _notify();
    },

    toggleFlashcard(index) {
      if (index >= 0 && index < _state.flashcards.length) {
        _state.flashcards[index].flipped = !_state.flashcards[index].flipped;
        _notify();
      }
    },

    reset() {
      _state.inputText      = '';
      _state.parsedKanji    = [];
      _state.charStats      = { total: 0, kanji: 0, hiragana: 0, katakana: 0 };
      _state.kanjiData      = [];
      _state.flashcards     = [];
      _state.flashcardIndex = 0;
      _state.jlptFilter     = 'all';
      _state.isLoading      = false;
      _notify();
    },
  };
})();
