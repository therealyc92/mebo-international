/* ============================================
   MEBO International — 内容渲染层 (CMS)
   从 assets/data/*.json 读取内容并渲染。
   页面内保留硬编码 HTML 作为兜底:
   JSON 加载失败时页面保持原样,不影响访问。
   约定:
   - data-src   : 数据文件路径(相对当前页面)
   - data-base  : 资源路径前缀("" / "../" / "../../")
   暴露 window.MEBO_READY,main.js 等它结束后再初始化。
   ============================================ */
(function () {
  'use strict';

  var jobs = [];

  function resolve(base, p) {
    if (!p) return p;
    if (/^(https?:)?\/\//.test(p) || p.charAt(0) === '#') return p;
    // 统一成"相对站点根目录"形式,再按页面层级补前缀;
    // 兼容 CMS 写出的根绝对路径(/assets/...)和 ../ 前缀
    return (base || '') + p.replace(/^(\.\.\/)+/, '').replace(/^\//, '');
  }

  function loadJSON(src) {
    return fetch(src, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ---------- 首页轮播 ---------- */
  var BADGE_SVG = {
    apec: '<svg viewBox="0 0 80 60" fill="none" aria-hidden="true">'
      + '<path d="M20 55 L40 5 L60 55" stroke="#5eead4" stroke-width="3" fill="none" stroke-linecap="round"/>'
      + '<path d="M28 40 L52 40" stroke="#5eead4" stroke-width="2" stroke-linecap="round"/>'
      + '<text x="62" y="18" fill="#5eead4" font-family="Poppins" font-weight="700" font-size="16">2023</text></svg>',
    webinar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="13" rx="2"/><polygon points="10 8 15 10.5 10 13" fill="currentColor" stroke="none"/><line x1="8" y1="21" x2="16" y2="21"/></svg>',
    dna: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 3c0 5 16 5 16 10S4 18 4 23"/><path d="M20 3c0 5-16 5-16 10s16 5 16 10" transform="translate(0 -2)"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="13" x2="16" y2="13"/></svg>'
  };

  function badgeHTML(badge, base) {
    if (!badge || badge.type === 'none') return '';
    var text = '<div class="apec-badge-text">'
      + '<div class="apec-badge-year">' + esc(badge.title) + '</div>'
      + '<div class="apec-badge-sub">' + esc(badge.subtitle) + '</div></div>';
    if (badge.type === 'image') {
      return '<div class="apec-badge hero-badge--img">'
        + '<img src="' + esc(resolve(base, badge.image)) + '" alt="' + esc(badge.alt) + '" class="hero-badge-logo">'
        + text + '</div>';
    }
    if (badge.type === 'icon' && badge.icon === 'apec') {
      return '<div class="apec-badge">' + BADGE_SVG.apec + text + '</div>';
    }
    if (badge.type === 'icon' && BADGE_SVG[badge.icon]) {
      return '<div class="apec-badge hero-badge--img">'
        + '<span class="hero-badge-icon" aria-hidden="true">' + BADGE_SVG[badge.icon] + '</span>'
        + text + '</div>';
    }
    return '';
  }

  function renderHero(container) {
    var base = container.getAttribute('data-base') || '';
    jobs.push(loadJSON(container.getAttribute('data-src')).then(function (data) {
      var slides = (data && data.slides) || [];
      if (!slides.length) return;
      container.innerHTML = slides.map(function (s, i) {
        var actions = (s.actions || []).map(function (a) {
          return '<a href="' + esc(a.href) + '" class="btn btn--' + esc(a.style || 'accent') + ' btn--lg">' + esc(a.label) + '</a>';
        }).join('');
        return '<div class="hero-slide ' + esc(s.extra_class || 'hero-slide--photo') + (i === 0 ? ' active' : '') + '"'
          + ' data-slide="' + i + '" style="background-image:url(\'' + esc(resolve(base, s.background)) + '\');">'
          + '<div class="hero-overlay" aria-hidden="true"></div>'
          + '<div class="container"><div class="hero-content">'
          + badgeHTML(s.badge, base)
          + '<h1' + (s.title_class ? ' class="' + esc(s.title_class) + '"' : '') + '>' + (s.title_html || '') + '</h1>'
          + '<p class="hero-subtitle">' + esc(s.subtitle) + '</p>'
          + '<div class="hero-actions">' + actions + '</div>'
          + '</div></div></div>';
      }).join('');
      var dots = container.parentElement.querySelector('.hero-dots');
      if (dots) {
        dots.innerHTML = slides.map(function (s, i) {
          return '<button class="hero-dot' + (i === 0 ? ' active' : '') + '" data-slide="' + i + '" aria-label="Slide ' + (i + 1) + '"></button>';
        }).join('');
      }
    }).catch(function (e) { console.warn('[content] hero:', e); }));
  }

  /* ---------- 新闻列表 ---------- */
  function storyLink(item, template) {
    if (item.url) return item.url;
    return template.replace('{slug}', encodeURIComponent(item.slug));
  }

  function renderNews(list) {
    var base = list.getAttribute('data-base') || '';
    var template = list.getAttribute('data-article-href') || 'articulo.html?slug={slug}';
    var readMore = list.getAttribute('data-read-more') || 'Leer la historia';
    jobs.push(loadJSON(list.getAttribute('data-src')).then(function (data) {
      var items = (data && data.items) || [];
      if (!items.length) return;
      list.innerHTML = items.map(function (it) {
        var link = storyLink(it, template);
        return '<article class="story-item" data-cat="' + esc(it.cat) + '">'
          + '<a class="story-thumb-link" href="' + esc(link) + '" aria-label="' + esc(it.title) + '">'
          + '<img class="story-thumb" src="' + esc(resolve(base, it.image)) + '" alt="' + esc(it.image_alt) + '" loading="lazy"></a>'
          + '<div class="story-content">'
          + '<span class="story-date">' + esc(it.date) + '</span>'
          + '<span class="story-cat">' + esc(it.cat_label) + '</span>'
          + '<h3 class="story-title"><a href="' + esc(link) + '">' + esc(it.title) + '</a></h3>'
          + '<p class="story-excerpt">' + esc(it.excerpt) + '</p>'
          + '<a class="story-link" href="' + esc(link) + '">' + esc(readMore) + '</a>'
          + '</div></article>';
      }).join('');
      if (typeof window.initNewsPager === 'function') window.initNewsPager();
    }).catch(function (e) { console.warn('[content] news:', e); }));
  }

  /* ---------- 临床证据 ---------- */
  function renderEvidence(strip) {
    var base = strip.getAttribute('data-base') || '';
    var page = strip.closest('main') || document;
    jobs.push(loadJSON(strip.getAttribute('data-src')).then(function (data) {
      if (!data) return;
      if (data.facts && data.facts.length) {
        strip.innerHTML = data.facts.map(function (f) {
          return '<div class="fact-cell fade-in"><span class="fact-value">' + esc(f.value) + '</span>'
            + '<span class="fact-label">' + esc(f.label) + '</span>'
            + '<span class="fact-source">' + esc(f.source) + '</span></div>';
        }).join('');
      }
      var grid = page.querySelector('.data-grid');
      if (grid && data.rct_cards && data.rct_cards.length) {
        grid.innerHTML = data.rct_cards.map(function (c) {
          var metrics = (c.metrics || []).map(function (m) {
            return '<div class="data-metric">'
              + '<div class="data-metric-head"><span class="data-metric-label">' + esc(m.label) + '</span><span class="data-metric-unit">' + esc(m.unit) + '</span></div>'
              + '<div class="data-bars">'
              + '<div class="data-row"><span class="data-row-name data-row-name--mebo">' + esc(m.mebo_label) + '</span><div class="data-track"><div class="data-fill data-fill--mebo" style="width:' + esc(m.mebo_width) + '%;">' + esc(m.mebo_value) + '</div></div></div>'
              + '<div class="data-row"><span class="data-row-name data-row-name--ctrl">' + esc(m.ctrl_label) + '</span><div class="data-track"><div class="data-fill data-fill--ctrl" style="width:' + esc(m.ctrl_width) + '%;">' + esc(m.ctrl_value) + '</div></div></div>'
              + '</div>'
              + '<div class="data-metric-note">' + esc(m.note) + '</div>'
              + '</div>';
          }).join('');
          return '<div class="data-card fade-in">'
            + '<div class="data-head"><span class="data-badge">' + esc(c.badge) + '</span><h3>' + esc(c.title) + '</h3></div>'
            + '<div class="data-metrics">' + metrics + '</div>'
            + '<div class="data-foot"><p class="data-cite">' + (c.cite_html || '') + '</p></div>'
            + '</div>';
        }).join('');
      }
      var studies = page.querySelector('.study-grid');
      if (studies && data.studies && data.studies.length) {
        studies.innerHTML = data.studies.map(function (s) {
          return '<div class="study-card fade-in"><h3>' + esc(s.title) + '</h3>'
            + '<p>' + esc(s.summary) + '</p>'
            + '<div class="study-meta"><span class="study-src">' + esc(s.source) + '</span>'
            + '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.link_label || 'View') + '</a></div></div>';
        }).join('');
      }
    }).catch(function (e) { console.warn('[content] evidence:', e); }));
  }

  /* ---------- 页面文案注入 ---------- */
  function renderCopy() {
    var src = document.body.getAttribute('data-copy-src');
    if (!src) return;
    jobs.push(loadJSON(src).then(function (data) {
      function lookup(key) {
        return key.split('.').reduce(function (o, k) {
          return o && o[k] != null ? o[k] : null;
        }, data);
      }
      document.querySelectorAll('[data-cms]').forEach(function (el) {
        var v = lookup(el.getAttribute('data-cms'));
        if (typeof v === 'string') el.innerHTML = v;
      });
    }).catch(function (e) { console.warn('[content] copy:', e); }));
  }

  /* ---------- 新闻文章模板页 ---------- */
  function mdInline(s) {
    return esc(s)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  }

  function mdToHTML(md, base) {
    return String(md || '').split(/\n{2,}/).map(function (block) {
      var t = block.trim();
      if (!t) return '';
      var img = t.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
      if (img) return '<p><img class="article-inline-img" src="' + esc(resolve(base, img[2])) + '" alt="' + esc(img[1]) + '" loading="lazy"></p>';
      if (t.indexOf('### ') === 0) return '<h4>' + mdInline(t.slice(4)) + '</h4>';
      if (t.indexOf('## ') === 0) return '<h3>' + mdInline(t.slice(3)) + '</h3>';
      if (t.indexOf('# ') === 0) return '<h2>' + mdInline(t.slice(2)) + '</h2>';
      if (t.indexOf('> ') === 0) return '<blockquote>' + mdInline(t.slice(2)) + '</blockquote>';
      if (/^[-*] /m.test(t)) {
        return '<ul>' + t.split('\n').map(function (l) {
          return '<li>' + mdInline(l.replace(/^[-*] /, '')) + '</li>';
        }).join('') + '</ul>';
      }
      return '<p>' + mdInline(t).replace(/\n/g, '<br>') + '</p>';
    }).join('\n');
  }

  function renderArticle() {
    var body = document.body;
    var src = body.getAttribute('data-src');
    if (!src) return;
    var base = body.getAttribute('data-base') || '';
    var selfTemplate = body.getAttribute('data-self-template') || 'articulo.html?slug={slug}';
    var slug = new URLSearchParams(location.search).get('slug');
    if (!slug) return;
    jobs.push(loadJSON(src).then(function (data) {
      var items = (data && data.items) || [];
      var idx = -1;
      for (var i = 0; i < items.length; i++) {
        if (items[i].slug === slug) { idx = i; break; }
      }
      var it = idx >= 0 ? items[idx] : null;
      var set = function (id, html) { var el = document.getElementById(id); if (el) el.innerHTML = html; };
      if (!it) {
        set('art-title', esc(body.getAttribute('data-notfound-title') || 'Artículo no encontrado'));
        set('art-body', '<p>' + esc(body.getAttribute('data-notfound-msg') || '') + '</p>');
        return;
      }
      if (!it.body) {
        // 旧文章:跳转到对应的静态页面
        location.replace(it.url ? it.url.replace(/^(noticias|news)\//, '') : './');
        return;
      }
      set('art-cat', esc(it.cat_label));
      set('art-title', esc(it.title));
      set('art-date', esc(it.date));
      set('art-tags', String(it.tags || '').split(',').filter(function (t) { return t.trim(); })
        .map(function (t) { return '<span class="article-tag">' + esc(t.trim().toUpperCase()) + '</span>'; }).join(''));
      var fig = document.getElementById('art-figure');
      if (fig && it.image) {
        fig.innerHTML = '<img class="article-hero-img" src="' + esc(resolve(base, it.image)) + '" alt="' + esc(it.image_alt) + '" loading="lazy">';
      }
      var html = mdToHTML(it.body, base);
      if (it.source_url) {
        html += '\n<div class="article-source">' + esc(it.source_label || '')
          + ' <a href="' + esc(it.source_url) + '" target="_blank" rel="noopener">' + esc(it.source_name || it.source_url) + '</a>.</div>';
      }
      set('art-body', html);
      document.title = it.title + ' | MEBO International';
      var nav = document.getElementById('art-nav');
      if (nav) {
        var linkFor = function (x) {
          return x.url ? x.url.replace(/^(noticias|news)\//, '') : selfTemplate.replace('{slug}', encodeURIComponent(x.slug));
        };
        var prev = idx > 0 ? items[idx - 1] : null;
        var next = idx < items.length - 1 ? items[idx + 1] : null;
        if (prev) {
          var pl = nav.querySelector('.prev');
          pl.href = linkFor(prev);
          pl.querySelector('.article-nav-title').textContent = prev.title;
        }
        if (next) {
          var nl = nav.querySelector('.next');
          nl.href = linkFor(next);
          nl.querySelector('.article-nav-title').textContent = next.title;
        }
      }
    }).catch(function (e) { console.warn('[content] article:', e); }));
  }

  /* ---------- 启动 ---------- */
  var heroBox = document.querySelector('.hero-slides[data-src]');
  if (heroBox) renderHero(heroBox);
  var newsList = document.querySelector('.story-list[data-src]');
  if (newsList) renderNews(newsList);
  var factStrip = document.querySelector('.fact-strip[data-src]');
  if (factStrip) renderEvidence(factStrip);
  renderCopy();
  renderArticle();

  window.MEBO_READY = jobs.length
    ? Promise.all(jobs)
    : Promise.resolve();
})();
