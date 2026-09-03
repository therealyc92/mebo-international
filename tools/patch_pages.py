# -*- coding: utf-8 -*-
"""
patch_pages.py — 页面接入 CMS 渲染层(幂等)。
做的事:
1. 给轮播/新闻列表/证据数据带挂上 data-src 等属性
2. 把新闻分页内联脚本改造成可重复初始化的 window.initNewsPager
3. 在 main.js 之前插入 content.js
硬编码内容全部保留,作为 JSON 加载失败时的兜底。
"""
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def patch(path, fn):
    p = os.path.join(ROOT, path)
    with open(p, encoding="utf-8") as f:
        src = f.read()
    out = fn(src)
    if out != src:
        with open(p, "w", encoding="utf-8") as f:
            f.write(out)
        print("patched", path)
    else:
        print("skip   ", path)


def add_content_js(prefix):
    def fn(src):
        if "js/content.js" in src:
            return src
        return src.replace(
            '<script src="%sjs/main.js' % prefix,
            '<script src="%sjs/content.js?v=20260903" defer></script>\n  <script src="%sjs/main.js' % (prefix, prefix),
            1,
        )
    return fn


def hero_attrs(json_path, base=""):
    def fn(src):
        if 'hero-slides" data-src' in src:
            return src
        return src.replace(
            '<div class="hero-slides">',
            '<div class="hero-slides" data-src="%s" data-base="%s">' % (json_path, base),
            1,
        )
    return fn


PAGER_RE = re.compile(r"<script>\s*\(function\(\)\{\s*var PAGE_SIZE = 5;.*?\}\)\(\);\s*</script>", re.S)

PAGER_TMPL = """<script>
  window.initNewsPager = (function () {
    var PAGE_SIZE = 5;
    var cat = 'all', page = 1, bound = false;
    var ofWord = '%s';
    function apply() {
      var btns = document.querySelectorAll('.news-filter button');
      var items = Array.prototype.slice.call(document.querySelectorAll('.story-item'));
      var pager = document.getElementById('story-pager');
      var label = document.getElementById('pager-label');
      var prev = document.getElementById('pager-prev');
      var next = document.getElementById('pager-next');
      var visible = items.filter(function (it) { return cat === 'all' || it.dataset.cat === cat; });
      var pages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
      if (page > pages) page = pages;
      items.forEach(function (it) { it.style.display = 'none'; });
      visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).forEach(function (it) { it.style.display = ''; });
      btns.forEach(function (b) { b.classList.toggle('active', b.dataset.cat === cat); });
      if (visible.length > PAGE_SIZE) {
        pager.style.display = 'flex';
        label.textContent = page + ' ' + ofWord + ' ' + pages;
        prev.disabled = (page === 1);
        next.disabled = (page === pages);
      } else {
        pager.style.display = 'none';
      }
    }
    function scrollTop() {
      document.getElementById('stories').scrollIntoView({ behavior: 'smooth' });
    }
    return function init() {
      if (!bound) {
        bound = true;
        document.querySelectorAll('.news-filter button').forEach(function (b) {
          b.addEventListener('click', function () {
            cat = b.dataset.cat; page = 1; apply();
            history.replaceState(null, '', '#' + cat);
            scrollTop();
          });
        });
        document.getElementById('pager-prev').addEventListener('click', function () { if (page > 1) { page--; apply(); scrollTop(); } });
        document.getElementById('pager-next').addEventListener('click', function () { page++; apply(); scrollTop(); });
        var h = location.hash.replace('#', '');
        if (['all', 'med', 'apec', 'gp', 'csr'].indexOf(h) > -1) cat = h;
      }
      apply();
    };
  })();
  window.initNewsPager();
  </script>"""


def news_page(json_path, base, article_href, read_more, of_word):
    def fn(src):
        out = src
        if 'story-list" id="story-list" data-src' not in out:
            out = out.replace(
                '<div class="story-list" id="story-list">',
                '<div class="story-list" id="story-list" data-src="%s" data-base="%s" data-article-href="%s" data-read-more="%s">'
                % (json_path, base, article_href, read_more),
                1,
            )
        if "window.initNewsPager" not in out:
            out = PAGER_RE.sub(lambda m: PAGER_TMPL % of_word, out, count=1)
        return out
    return fn


def evidence_attrs(json_path, base=""):
    def fn(src):
        if 'fact-strip" data-src' in src:
            return src
        return src.replace(
            '<div class="fact-strip">',
            '<div class="fact-strip" data-src="%s" data-base="%s">' % (json_path, base),
            1,
        )
    return fn


# 西语页
patch("index.html", lambda s: add_content_js("")(hero_attrs("assets/data/hero-es.json")(s)))
patch("noticias.html", lambda s: add_content_js("")(
    news_page("assets/data/news-es.json", "", "noticias/articulo.html?slug={slug}", "Leer la historia", "de")(s)))
patch("evidencia.html", lambda s: add_content_js("")(evidence_attrs("assets/data/evidence-es.json")(s)))

# 英语页
patch("en/index.html", lambda s: add_content_js("../")(hero_attrs("../assets/data/hero-en.json", "../")(s)))
patch("en/news.html", lambda s: add_content_js("../")(
    news_page("../assets/data/news-en.json", "../", "news/article.html?slug={slug}", "Read Story", "of")(s)))
patch("en/evidence.html", lambda s: add_content_js("../")(evidence_attrs("../assets/data/evidence-en.json", "../")(s)))

print("done")
