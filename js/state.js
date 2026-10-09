/**
 * ═══════════════════════════════════════════════════════════
 *  STATE.JS — Centralized Application State Manager
 * ═══════════════════════════════════════════════════════════
 *
 *  Implements a lightweight observer / pub-sub pattern.
 *  Every mutation calls `notify()` so subscribed renderers
 *  can re-paint only what changed.
 *
 *  Tracked fields:
 *    - inputText      : raw user input string
 *    - parsedKanji    : array of unique kanji characters
 *    - charStats      : { total, kanji, hiragana, katakana }
 *    - kanjiData      : array of enriched kanji data objects
 *    - flashcards     : array of flashcard objects
 *    - flashcardIndex : currently displayed flashcard (0-based)
 *    - jlptFilter     : 'all' | '1' | '2' | '3' | '4' | '5' | 'none'
 *    - isLoading      : boolean indicating a fetch is in progress
 */

/* global */
/* exported AppState */

const AppState = (() => {
  'use strict';

  // ── Private State ────────────────────────────────
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

  // ── Subscribers ──────────────────────────────────
  const _listeners = [];

  /**
   * Notify every subscriber with the current state snapshot.
   * Uses a shallow copy to prevent external mutation of internals.
   */
  function _notify() {
    const snapshot = Object.assign({}, _state);
    _listeners.forEach((fn) => {
      try { fn(snapshot); }
      catch (err) { console.error('[State] Subscriber error:', err); }
    });
  }

  // ── Public API ───────────────────────────────────
  return {
    /** Register a callback that fires on every state change. */
    subscribe(fn) {
      if (typeof fn === 'function') _listeners.push(fn);
    },

    // ── Getters (return copies to protect internals) ──

    get inputText()      { return _state.inputText; },
    get parsedKanji()    { return [..._state.parsedKanji]; },
    get charStats()      { return Object.assign({}, _state.charStats); },
    get kanjiData()      { return [..._state.kanjiData]; },
    get flashcards()     { return [..._state.flashcards]; },
    get flashcardIndex() { return _state.flashcardIndex; },
    get jlptFilter()     { return _state.jlptFilter; },
    get isLoading()      { return _state.isLoading; },

    // ── Setters (mutate + notify) ──

    setInputText(text) {
      _state.inputText = String(text);
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

    // ── Flashcard Navigation ──

    /** Advance to the next flashcard, wrapping at the end. */
    nextFlashcard() {
      if (_state.flashcards.length === 0) return;
      _state.flashcardIndex = (_state.flashcardIndex + 1) % _state.flashcards.length;
      _notify();
    },

    /** Go back to the previous flashcard, wrapping at the start. */
    prevFlashcard() {
      if (_state.flashcards.length === 0) return;
      _state.flashcardIndex =
        (_state.flashcardIndex - 1 + _state.flashcards.length) % _state.flashcards.length;
      _notify();
    },

    /** Toggle the flipped state of a flashcard at a given index. */
    toggleFlashcard(index) {
      if (index >= 0 && index < _state.flashcards.length) {
        _state.flashcards[index].flipped = !_state.flashcards[index].flipped;
        _notify();
      }
    },

    /** Reset the entire state back to initial values. */
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
