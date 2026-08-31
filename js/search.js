/* MEBO site search — client-side, lazy index, instant results */
(function () {
  'use strict';

  var lang = /\/en\//.test(location.pathname) ? 'en' : 'es';
  var base = (function () {
    // fetch base to site root for the JSON index
    var p = location.pathname;
    if (/\/en\/news\//.test(p) || /\/noticias\//.test(p)) return '../../';
    if (/\/en\//.test(p)) return '../';
    return '';
  })();
  var linkBase = /\/(en\/news|noticias)\//.test(location.pathname) ? '../' : '';

  var I18N = {
    en: {
      placeholder: 'Search MEBO…',
      hint: 'Type to search across pages and news',
      nores: 'No results for',
      close: 'Close',
      results: 'results'
    },
    es: {
      placeholder: 'Buscar en MEBO…',
      hint: 'Escriba para buscar en páginas y noticias',
      nores: 'Sin resultados para',
      close: 'Cerrar',
      results: 'resultados'
    }
  }[lang];

  var index = null, loading = false, overlay, input, list, meta, activeIdx = -1, debounce;

  function loadIndex(cb) {
    if (index) return cb();
    if (loading) { setTimeout(function () { loadIndex(cb); }, 120); return; }
    loading = true;
    fetch(base + 'assets/search-index-' + lang + '.json')
      .then(function (r) { return r.json(); })
      .then(function (d) { index = d; cb(); })
      .catch(function () { index = []; cb(); });
  }

  function build() {
    overlay = document.createElement('div');
    overlay.className = 'search-overlay';
    overlay.innerHTML =
      '<div class="search-box" role="dialog" aria-modal="true">' +
        '<div class="search-bar">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
          '<input type="search" class="search-input" placeholder="' + I18N.placeholder + '" aria-label="' + I18N.placeholder + '" autocomplete="off">' +
          '<button class="search-close" aria-label="' + I18N.close + '">&times;</button>' +
        '</div>' +
        '<div class="search-meta">' + I18N.hint + '</div>' +
        '<div class="search-results"></div>' +
      '</div>';
    document.body.appendChild(overlay);
    input = overlay.querySelector('.search-input');
    list = overlay.querySelector('.search-results');
    meta = overlay.querySelector('.search-meta');

    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    overlay.querySelector('.search-close').addEventListener('click', close);
    input.addEventListener('input', function () {
      clearTimeout(debounce);
      debounce = setTimeout(run, 160);
    });
    input.addEventListener('keydown', function (e) {
      var items = list.querySelectorAll('.search-item');
      if (e.key === 'ArrowDown') { e.preventDefault(); move(1, items); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1, items); }
      else if (e.key === 'Enter' && activeIdx >= 0 && items[activeIdx]) {
        location.href = items[activeIdx].href;
      }
    });
  }

  function move(d, items) {
    if (!items.length) return;
    activeIdx = (activeIdx + d + items.length) % items.length;
    items.forEach(function (it, i) { it.classList.toggle('active', i === activeIdx); });
    items[activeIdx].scrollIntoView({ block: 'nearest' });
  }

  function open() {
    if (!overlay) build();
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(function () { input.focus(); }, 60);
    loadIndex(run);
  }

  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    activeIdx = -1;
  }

  function esc(s) {
    return s.replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function highlight(text, terms) {
    var out = esc(text);
    terms.forEach(function (t) {
      if (!t) return;
      var re = new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
      out = out.replace(re, '<mark>$1</mark>');
    });
    return out;
  }

  function snippet(text, terms) {
    var lower = text.toLowerCase(), pos = -1;
    for (var i = 0; i < terms.length; i++) {
      var p = lower.indexOf(terms[i].toLowerCase());
      if (p >= 0 && (pos < 0 || p < pos)) pos = p;
    }
    if (pos < 0) return text.slice(0, 160);
    var start = Math.max(0, pos - 50);
    return (start > 0 ? '…' : '') + text.slice(start, start + 170) + '…';
  }

  function run() {
    if (!index) return;
    var q = input.value.trim();
    activeIdx = -1;
    if (q.length < 2) {
      list.innerHTML = '';
      meta.textContent = I18N.hint;
      return;
    }
    var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    var scored = [];
    index.forEach(function (e) {
      var hay = {
        title: (e.title || '').toLowerCase(),
        heads: (e.headings || '').toLowerCase(),
        desc: (e.desc || '').toLowerCase(),
        text: (e.text || '').toLowerCase()
      };
      var score = 0, matched = 0;
      terms.forEach(function (t) {
        var hit = false;
        if (hay.title.indexOf(t) >= 0) { score += 10; hit = true; }
        if (hay.heads.indexOf(t) >= 0) { score += 6; hit = true; }
        if (hay.desc.indexOf(t) >= 0) { score += 4; hit = true; }
        if (hay.text.indexOf(t) >= 0) { score += 2; hit = true; }
        if (hit) matched++;
      });
      if (matched === terms.length) scored.push({ e: e, score: score });
    });
    scored.sort(function (a, b) { return b.score - a.score; });
    var top = scored.slice(0, 12);

    meta.textContent = top.length
      ? top.length + ' ' + I18N.results
      : I18N.nores + ' "' + q + '"';

    list.innerHTML = top.map(function (r) {
      var e = r.e;
      var snip = snippet(e.desc || e.text || '', terms);
      return '<a class="search-item" href="' + linkBase + e.url + '">' +
        '<span class="search-item-title">' + highlight(e.title || e.url, terms) + '</span>' +
        '<span class="search-item-snip">' + highlight(snip, terms) + '</span>' +
        '<span class="search-item-url">' + esc(e.url) + '</span>' +
      '</a>';
    }).join('');
  }

  // wire buttons & shortcuts
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.nav-search');
    if (b) { e.preventDefault(); open(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay && overlay.classList.contains('open')) close();
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); open(); }
  });
})();
