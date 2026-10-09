/**
 * ═══════════════════════════════════════════════════════════
 *  UI.JS — Pure Rendering Engine
 * ═══════════════════════════════════════════════════════════
 *
 *  Rules:
 *    1. Every DOM access is wrapped in a defensive check:
 *         if (el) { el.textContent = ... }
 *       This ensures ZERO null-reference crashes.
 *
 *    2. Functions are pure renderers — they read state and
 *       paint the DOM, with no side-effects on the state.
 *
 *    3. `render(state)` is the single entry point called by
 *       AppState.subscribe(). It delegates to sub-renderers.
 */

/* global AppState */
/* exported UIRenderer */

const UIRenderer = (() => {
  'use strict';

  // ── JLPT level → color-class mapping ────────────
  const JLPT_CLASS_MAP = {
    5:    'jlpt-badge--n5',   // Green
    4:    'jlpt-badge--n4',   // Blue
    3:    'jlpt-badge--n3',   // Yellow
    2:    'jlpt-badge--n2',   // Orange
    1:    'jlpt-badge--n1',   // Red
    null: 'jlpt-badge--none', // Gray (unrated)
  };

  const JLPT_LABEL_MAP = {
    5: 'N5', 4: 'N4', 3: 'N3', 2: 'N2', 1: 'N1', null: '—',
  };

  // ────────────────────────────────────────────────
  //  STATUS BAR
  // ────────────────────────────────────────────────

  /**
   * Update the status bar with a message and visual style.
   * @param {string} message - Human-readable status text.
   * @param {'info'|'loading'|'success'|'warn'|'error'} type
   */
  function setStatus(message, type = 'info') {
    const bar = document.getElementById('status-bar');
    if (bar) {
      bar.className = 'status-bar status-bar--' + type;
      const textEl = bar.querySelector('.status-bar__text');
      if (textEl) {
        textEl.textContent = message;
      }
    }
  }

  // ────────────────────────────────────────────────
  //  STATS DASHBOARD
  // ────────────────────────────────────────────────

  function renderStats(state) {
    const dashboard = document.getElementById('stats-dashboard');
    if (!dashboard) return;

    const hasData = state.parsedKanji && state.parsedKanji.length > 0;
    dashboard.hidden = !hasData;

    if (!hasData) return;

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setVal('stat-total',    state.charStats.total);
    setVal('stat-kanji',    state.charStats.kanji);
    setVal('stat-hiragana', state.charStats.hiragana);
    setVal('stat-katakana', state.charStats.katakana);
  }

  // ────────────────────────────────────────────────
  //  JLPT FILTER TABS
  // ────────────────────────────────────────────────

  function renderFilters(state) {
    const nav = document.getElementById('jlpt-filters');
    if (!nav) return;

    const hasData = state.kanjiData && state.kanjiData.length > 0;
    nav.hidden = !hasData;
    if (!hasData) return;

    const tabs = nav.querySelectorAll('.jlpt-filters__tab');
    tabs.forEach((tab) => {
      if (tab) {
        const isActive = tab.dataset.level === state.jlptFilter;
        tab.classList.toggle('jlpt-filters__tab--active', isActive);
      }
    });
  }

  // ────────────────────────────────────────────────
  //  KANJI BREAKDOWN GRID
  // ────────────────────────────────────────────────

  /**
   * Filter kanji data based on the active JLPT level.
   */
  function getFilteredKanji(state) {
    if (!state.kanjiData) return [];
    if (state.jlptFilter === 'all') return state.kanjiData;
    if (state.jlptFilter === 'none') {
      return state.kanjiData.filter((k) => k.jlpt === null || k.jlpt === undefined);
    }
    return state.kanjiData.filter((k) => String(k.jlpt) === state.jlptFilter);
  }

  /**
   * Build the HTML for a single kanji breakdown card.
   */
  function buildKanjiCard(entry) {
    const jlptNum   = entry.jlpt;
    const badgeClass = JLPT_CLASS_MAP[jlptNum] || JLPT_CLASS_MAP[null];
    const badgeLabel = JLPT_LABEL_MAP[jlptNum] || '—';

    const kun = (entry.kun_readings || []).join('、 ') || '—';
    const on  = (entry.on_readings  || []).join('、 ') || '—';
    const meanings = (entry.meanings || []).join(', ') || 'No data';

    return `
      <article class="kanji-card" data-jlpt="${jlptNum}">
        <div class="kanji-card__header">
          <span class="kanji-card__glyph">${entry.character}</span>
          <span class="kanji-card__badge ${badgeClass}">${badgeLabel}</span>
        </div>
        <div class="kanji-card__body">
          <div class="kanji-card__row">
            <span class="kanji-card__label">Kun</span>
            <span class="kanji-card__value">${kun}</span>
          </div>
          <div class="kanji-card__row">
            <span class="kanji-card__label">On</span>
            <span class="kanji-card__value">${on}</span>
          </div>
          <div class="kanji-card__row">
            <span class="kanji-card__label">Meaning</span>
            <span class="kanji-card__value">${meanings}</span>
          </div>
          <div class="kanji-card__row">
            <span class="kanji-card__label">Strokes</span>
            <span class="kanji-card__value">${entry.stroke_count || '?'}</span>
          </div>
        </div>
        ${entry._source === 'mock' || entry._source === 'placeholder'
          ? '<div class="kanji-card__offline-tag">offline data</div>'
          : ''}
      </article>
    `;
  }

  function renderKanjiGrid(state) {
    const grid = document.getElementById('kanji-grid');
    if (!grid) return;

    const filtered = getFilteredKanji(state);

    if (!filtered || filtered.length === 0) {
      if (state.kanjiData && state.kanjiData.length > 0) {
        // Data exists but nothing matches filter
        grid.innerHTML = `
          <div class="kanji-grid__empty">
            <p>No kanji match the selected JLPT level. Try "All" to see everything.</p>
          </div>`;
      } else {
        grid.innerHTML = '';
      }
      return;
    }

    grid.innerHTML = filtered.map(buildKanjiCard).join('');
  }

  // ────────────────────────────────────────────────
  //  FLASHCARD SECTION
  // ────────────────────────────────────────────────

  function renderFlashcards(state) {
    const section = document.getElementById('flashcard-section');
    const stage   = document.getElementById('flashcard-stage');
    const counter = document.getElementById('flashcard-counter');

    if (!section || !stage) return;

    const cards = state.flashcards;
    if (!cards || cards.length === 0) {
      section.hidden = true;
      return;
    }

    section.hidden = false;
    const idx  = state.flashcardIndex;
    const card = cards[idx];
    if (!card) return;

    // Update counter
    if (counter) {
      counter.textContent = `${idx + 1} / ${cards.length}`;
    }

    const jlptBadgeClass = JLPT_CLASS_MAP[card.jlpt] || JLPT_CLASS_MAP[null];
    const jlptLabel      = JLPT_LABEL_MAP[card.jlpt] || '—';
    const flipped        = card.flipped;

    stage.innerHTML = `
      <div class="flashcard ${flipped ? 'flashcard--flipped' : ''}"
           data-index="${idx}"
           tabindex="0"
           role="button"
           aria-label="Flashcard for ${card.character}. ${flipped ? 'Showing answer.' : 'Click to reveal.'}">
        <div class="flashcard__inner">
          <div class="flashcard__front">
            <span class="flashcard__glyph">${card.front}</span>
            <span class="flashcard__prompt">Tap to reveal</span>
          </div>
          <div class="flashcard__back">
            <span class="flashcard__badge ${jlptBadgeClass}">${jlptLabel}</span>
            <span class="flashcard__readings">${card.readings || '—'}</span>
            <span class="flashcard__meanings">${card.meanings || '—'}</span>
          </div>
        </div>
      </div>
    `;

    // Attach flip handler (event delegation on the stage)
    const flashcardEl = stage.querySelector('.flashcard');
    if (flashcardEl) {
      flashcardEl.addEventListener('click', () => {
        AppState.toggleFlashcard(idx);
      });
      flashcardEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          AppState.toggleFlashcard(idx);
        }
      });
    }
  }

  // ────────────────────────────────────────────────
  //  LOADING INDICATOR
  // ────────────────────────────────────────────────

  function renderLoading(state) {
    const btn = document.getElementById('analyze-btn');
    if (btn) {
      btn.disabled = state.isLoading;
      const icon = btn.querySelector('.analyzer-input__button-icon');
      if (icon) {
        icon.textContent = state.isLoading ? '⏳' : '🔍';
      }
    }
  }

  // ────────────────────────────────────────────────
  //  MASTER RENDER (called on every state change)
  // ────────────────────────────────────────────────

  /**
   * Central render dispatcher. Receives a state snapshot
   * and delegates to each sub-renderer.
   */
  function render(state) {
    renderLoading(state);
    renderStats(state);
    renderFilters(state);
    renderKanjiGrid(state);
    renderFlashcards(state);
  }

  // ── Public API ───────────────────────────────────
  return { render, setStatus };
})();
