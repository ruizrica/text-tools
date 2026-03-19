/**
 * Text Tools — Application Controller
 * Stackable operations pipeline: each toolbar click adds an operation
 * to the chain. The result is computed by piping original text through
 * all active operations in order. Effects bar shows applied ops as
 * toggleable pills.
 */

(function () {
  'use strict';

  // --- Friendly labels for operations ---

  var OP_LABELS = {
    removeExtraSpaces: 'Spaces',
    removeExtraLineBreaks: 'Line Breaks',
    trimWhitespace: 'Trim',
    removeAllLineBreaks: 'Flatten',
    toUpperCase: 'UPPER',
    toLowerCase: 'lower',
    toTitleCase: 'Title Case',
    toCamelCase: 'camelCase',
    sortLinesAZ: 'Sort A-Z',
    sortLinesZA: 'Sort Z-A',
    sortLinesNatural: 'Sort Natural',
    removeDuplicateLines: 'Dedup',
    urlEncode: 'URL Encode',
    urlDecode: 'URL Decode',
  };

  // Operations that are mutually exclusive (only one case op at a time, etc.)
  var CASE_OPS = ['toUpperCase', 'toLowerCase', 'toTitleCase', 'toCamelCase'];
  var SORT_OPS = ['sortLinesAZ', 'sortLinesZA', 'sortLinesNatural'];

  // --- DOM References ---

  var els = {
    panes: document.getElementById('panes'),
    inputOriginal: document.getElementById('input-original'),
    inputResult: document.getElementById('input-result'),
    diffOverlay: document.getElementById('diff-overlay'),
    effectsBar: document.getElementById('effects-bar'),
    effectsList: document.getElementById('effects-list'),
    effectsClear: document.getElementById('effects-clear'),
    btnLayoutToggle: document.getElementById('btn-layout-toggle'),
    btnSwap: document.getElementById('btn-swap'),
    btnDiffToggle: document.getElementById('btn-diff-toggle'),
    btnFindReplace: document.getElementById('btn-find-replace'),
    findReplaceBar: document.getElementById('find-replace-bar'),
    findInput: document.getElementById('find-input'),
    replaceInput: document.getElementById('replace-input'),
    frRegex: document.getElementById('fr-regex'),
    frCase: document.getElementById('fr-case'),
    frApply: document.getElementById('fr-apply'),
    frClose: document.getElementById('fr-close'),
    statChars: document.getElementById('stat-chars'),
    statWords: document.getElementById('stat-words'),
    statLines: document.getElementById('stat-lines'),
  };

  // --- State ---

  var state = {
    layout: localStorage.getItem('tt-layout') || 'side-by-side',
    diffActive: false,
    // Pipeline: ordered list of { op, enabled, params }
    pipeline: [],
  };

  // --- Initialization ---

  function init() {
    applyLayout(state.layout);
    bindToolbar();
    bindMenus();
    bindPaneControls();
    bindSwap();
    bindDiffToggle();
    bindLayoutToggle();
    bindFindReplace();
    bindStatsUpdate();
    bindEffectsBar();
    updateStats();
  }

  // --- Pipeline Engine ---

  /**
   * Add an operation to the pipeline. If it's a mutually exclusive op
   * (e.g., case ops), replace the existing one in the same group.
   * If the exact same op already exists and is enabled, remove it (toggle off).
   */
  function addToPipeline(opName, params) {
    // Check for existing identical operation
    var existingIdx = state.pipeline.findIndex(function (item) {
      return item.op === opName;
    });

    if (existingIdx !== -1) {
      // Toggle: if clicking same op again, remove it
      state.pipeline.splice(existingIdx, 1);
      recompute();
      return;
    }

    // Handle mutually exclusive groups — replace, don't stack
    var exclusiveGroup = null;
    if (CASE_OPS.indexOf(opName) !== -1) exclusiveGroup = CASE_OPS;
    if (SORT_OPS.indexOf(opName) !== -1) exclusiveGroup = SORT_OPS;

    if (exclusiveGroup) {
      state.pipeline = state.pipeline.filter(function (item) {
        return exclusiveGroup.indexOf(item.op) === -1;
      });
    }

    state.pipeline.push({ op: opName, enabled: true, params: params || null });
    recompute();
  }

  /**
   * Recompute the result by piping original text through all enabled
   * pipeline operations in order.
   */
  function recompute() {
    var input = els.inputOriginal.value;
    if (!input) {
      els.inputResult.value = '';
      renderEffectsBar();
      updateStats();
      return;
    }

    var result = input;
    state.pipeline.forEach(function (item) {
      if (!item.enabled) return;

      if (item.op === 'findAndReplace' && item.params) {
        result = TextOps.findAndReplace(
          result, item.params.find, item.params.replace, {
            useRegex: item.params.useRegex,
            caseSensitive: item.params.caseSensitive,
          }
        );
      } else if (typeof TextOps[item.op] === 'function') {
        result = TextOps[item.op](result);
      }
    });

    els.inputResult.value = result;
    renderEffectsBar();

    if (state.diffActive) {
      renderDiff();
    }

    updateStats();
  }

  // --- Effects Bar ---

  function renderEffectsBar() {
    if (state.pipeline.length === 0) {
      els.effectsBar.hidden = true;
      return;
    }

    els.effectsBar.hidden = false;
    els.effectsList.innerHTML = '';

    state.pipeline.forEach(function (item, idx) {
      var pill = document.createElement('button');
      pill.className = 'effect-pill' + (item.enabled ? '' : ' disabled');
      pill.dataset.idx = idx;
      pill.title = item.enabled ? 'Click to disable' : 'Click to enable';

      var label = OP_LABELS[item.op] || item.op;
      if (item.op === 'findAndReplace' && item.params) {
        label = '"' + item.params.find + '" → "' + item.params.replace + '"';
      }

      pill.innerHTML = '<span class="pill-label">' + escapeHTML(label) + '</span>'
        + '<span class="pill-remove">'
        + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"'
        + ' stroke-linecap="round" stroke-linejoin="round">'
        + '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'
        + '</svg></span>';

      // Left click toggles enabled/disabled
      pill.addEventListener('click', function (e) {
        // If clicking the X remove icon, remove from pipeline
        if (e.target.closest('.pill-remove')) {
          state.pipeline.splice(idx, 1);
        } else {
          item.enabled = !item.enabled;
        }
        recompute();
      });

      els.effectsList.appendChild(pill);
    });
  }

  function bindEffectsBar() {
    els.effectsClear.addEventListener('click', function () {
      state.pipeline = [];
      recompute();
      showToast('Effects cleared');
    });
  }

  // --- Layout ---

  function applyLayout(layout) {
    state.layout = layout;
    if (layout === 'stacked') {
      els.panes.classList.add('stacked');
      updateLayoutIcon(true);
    } else {
      els.panes.classList.remove('stacked');
      updateLayoutIcon(false);
    }
    localStorage.setItem('tt-layout', layout);
  }

  function updateLayoutIcon(isStacked) {
    var iconEl = document.getElementById('layout-icon');
    if (iconEl) {
      var newIcon = isStacked ? 'rows-2' : 'columns-2';
      iconEl.setAttribute('data-lucide', newIcon);
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
    els.btnLayoutToggle.title = isStacked
      ? 'Switch to side-by-side' : 'Switch to stacked';
  }

  function bindLayoutToggle() {
    els.btnLayoutToggle.addEventListener('click', function () {
      var next = state.layout === 'side-by-side' ? 'stacked' : 'side-by-side';
      applyLayout(next);
    });
  }

  // --- Toolbar Operations ---

  function bindToolbar() {
    document.querySelectorAll('[data-op]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var op = btn.dataset.op;

        if (op === 'findAndReplace') {
          toggleFindReplace();
          return;
        }

        addToPipeline(op);
      });
    });
  }

  function flashButton(btn) {
    btn.classList.add('active');
    setTimeout(function () { btn.classList.remove('active'); }, 300);
  }

  // --- Menubar ---

  function bindMenus() {
    var menuItems = document.querySelectorAll('.menu-item');
    var menubarActive = false;

    menuItems.forEach(function (item) {
      var trigger = item.querySelector('.menu-trigger');

      trigger.addEventListener('click', function (e) {
        e.stopPropagation();
        var wasOpen = item.classList.contains('open');
        closeAllMenus();
        if (!wasOpen) {
          item.classList.add('open');
          trigger.setAttribute('aria-expanded', 'true');
          menubarActive = true;
        } else {
          menubarActive = false;
        }
      });

      trigger.addEventListener('mouseenter', function () {
        if (menubarActive) {
          closeAllMenus();
          item.classList.add('open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    });

    document.querySelectorAll('.menu-action').forEach(function (action) {
      action.addEventListener('click', function () {
        closeAllMenus();
        menubarActive = false;
      });
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.menu-item')) {
        closeAllMenus();
        menubarActive = false;
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeAllMenus();
        menubarActive = false;
      }
    });

    function closeAllMenus() {
      menuItems.forEach(function (mi) {
        mi.classList.remove('open');
        mi.querySelector('.menu-trigger').setAttribute('aria-expanded', 'false');
      });
    }
  }

  // --- Find and Replace ---

  function toggleFindReplace() {
    var isHidden = els.findReplaceBar.hidden;
    els.findReplaceBar.hidden = !isHidden;
    els.btnFindReplace.classList.toggle('active', isHidden);
    if (isHidden) els.findInput.focus();
  }

  function bindFindReplace() {
    els.frApply.addEventListener('click', executeFindReplace);
    els.frClose.addEventListener('click', function () {
      els.findReplaceBar.hidden = true;
      els.btnFindReplace.classList.remove('active');
    });
    els.findInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') executeFindReplace();
    });
    els.replaceInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') executeFindReplace();
    });
  }

  function executeFindReplace() {
    var find = els.findInput.value;
    var replace = els.replaceInput.value;
    if (!find) return;

    addToPipeline('findAndReplace', {
      find: find,
      replace: replace,
      useRegex: els.frRegex.checked,
      caseSensitive: els.frCase.checked,
    });
    showToast('Find/Replace added');
  }

  // --- Pane Controls ---

  function bindPaneControls() {
    document.querySelectorAll('.pane-btn[data-action]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var action = btn.dataset.action;
        var pane = btn.dataset.pane;
        var textarea = pane === 'original'
          ? els.inputOriginal : els.inputResult;

        if (action === 'copy') {
          copyToClipboard(textarea.value, btn);
        } else if (action === 'clear') {
          textarea.value = '';
          if (pane === 'original') {
            // Clear pipeline too since source is gone
            state.pipeline = [];
            els.inputResult.value = '';
            renderEffectsBar();
          }
          if (pane === 'result') {
            state.pipeline = [];
            renderEffectsBar();
            hideDiff();
          }
          updateStats();
        }
      });
    });
  }

  function copyToClipboard(text, btn) {
    navigator.clipboard.writeText(text).then(function () {
      btn.classList.add('feedback');
      setTimeout(function () { btn.classList.remove('feedback'); }, 600);
      showToast('Copied to clipboard');
    }).catch(function () {
      showToast('Copy failed');
    });
  }

  // --- Swap ---

  function bindSwap() {
    els.btnSwap.addEventListener('click', function () {
      var resultText = els.inputResult.value;
      if (!resultText) return;

      els.inputOriginal.value = resultText;
      els.inputResult.value = '';
      state.pipeline = [];
      renderEffectsBar();
      hideDiff();
      updateStats();
      showToast('Swapped');
    });
  }

  // --- Diff Toggle ---

  function bindDiffToggle() {
    els.btnDiffToggle.addEventListener('click', function () {
      state.diffActive = !state.diffActive;
      els.btnDiffToggle.dataset.active = state.diffActive;
      els.btnDiffToggle.title = state.diffActive
        ? 'Show clean result' : 'Show diff view';

      if (state.diffActive) {
        renderDiff();
      } else {
        hideDiff();
      }
    });
  }

  function renderDiff() {
    var original = els.inputOriginal.value;
    var result = els.inputResult.value;

    if (!original && !result) { hideDiff(); return; }

    var segments = DiffEngine.computeDiff(original, result);
    els.diffOverlay.innerHTML = DiffEngine.renderHTML(segments);
    els.diffOverlay.hidden = false;
    els.inputResult.style.visibility = 'hidden';
  }

  function hideDiff() {
    els.diffOverlay.hidden = true;
    els.inputResult.style.visibility = 'visible';
    state.diffActive = false;
    els.btnDiffToggle.dataset.active = 'false';
  }

  // --- Stats ---

  function bindStatsUpdate() {
    els.inputOriginal.addEventListener('input', function () {
      // Re-run pipeline when original text changes
      if (state.pipeline.length > 0) recompute();
      updateStats();
    });
    els.inputResult.addEventListener('input', updateStats);
  }

  function updateStats() {
    var text = els.inputOriginal.value || els.inputResult.value || '';
    var stats = TextOps.countStats(text);

    els.statChars.textContent = stats.characters
      + ' character' + (stats.characters !== 1 ? 's' : '');
    els.statWords.textContent = stats.words
      + ' word' + (stats.words !== 1 ? 's' : '');
    els.statLines.textContent = stats.lines
      + ' line' + (stats.lines !== 1 ? 's' : '');
  }

  // --- Toast ---

  var toastTimeout;
  function showToast(message) {
    var toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(function () {
      toast.classList.remove('visible');
    }, 1500);
  }

  // --- Helpers ---

  function escapeHTML(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // --- Keyboard Shortcuts ---

  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'H') {
      e.preventDefault();
      toggleFindReplace();
    }
    if (e.key === 'Escape' && !els.findReplaceBar.hidden) {
      els.findReplaceBar.hidden = true;
      els.btnFindReplace.classList.remove('active');
    }
  });

  // --- Start ---

  init();

  // Initialize Lucide icons after DOM is ready
  if (typeof lucide !== 'undefined') lucide.createIcons();

})();
