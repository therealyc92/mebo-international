# -*- coding: utf-8 -*-
"""
extract_content.py — 一次性内容抽取脚本
从现有硬编码 HTML 中提取内容,生成 assets/data/*.json(供 CMS 后台编辑)。
只读 HTML,不修改任何页面。重复运行会覆盖 JSON(用于校准)。
"""
import json
import os
import re
import html as htmlmod

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "assets", "data")
os.makedirs(DATA, exist_ok=True)


def read(p):
    with open(os.path.join(ROOT, p), encoding="utf-8") as f:
        return f.read()


def dump(name, obj):
    p = os.path.join(DATA, name)
    with open(p, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)
    print("written", os.path.relpath(p, ROOT))


def clean(s):
    return htmlmod.unescape(s).strip()


# ---------------- 新闻列表 ----------------
ITEM_RE = re.compile(
    r'<article class="story-item" data-cat="(?P<cat>[^"]+)">.*?'
    r'<a class="story-thumb-link" href="(?P<href>[^"]+)"[^>]*>'
    r'<img class="story-thumb" src="(?P<img>[^"]+)" alt="(?P<alt>[^"]*)"[^>]*></a>.*?'
    r'<span class="story-date">(?P<date>.*?)</span>\s*'
    r'<span class="story-cat">(?P<catlabel>.*?)</span>\s*'
    r'<h3 class="story-title"><a href="[^"]+">(?P<title>.*?)</a></h3>\s*'
    r'<p class="story-excerpt">(?P<excerpt>.*?)</p>',
    re.S,
)


def extract_news(page, out):
    src = read(page)
    items = []
    for m in ITEM_RE.finditer(src):
        href = m.group("href")
        slug = os.path.splitext(os.path.basename(href))[0]
        items.append({
            "slug": slug,
            "cat": m.group("cat"),
            "cat_label": clean(m.group("catlabel")),
            "date": clean(m.group("date")),
            "title": clean(m.group("title")),
            "excerpt": clean(m.group("excerpt")),
            "image": m.group("img"),
            "image_alt": clean(m.group("alt")),
            "url": href,
            "body": "",
        })
    dump(out, {"items": items})
    return items


# ---------------- 首页轮播 ----------------
SLIDE_RE = re.compile(
    r'<div class="hero-slide(?P<cls>[^"]*)"\s+data-slide="\d+"\s+style="background-image:url\(\'(?P<bg>[^\']+)\'\);">'
    r'(?P<body>.*?)(?=<div class="hero-slide|<div class="hero-dots)',
    re.S,
)
BADGE_IMG_RE = re.compile(r'<img src="([^"]+)" alt="([^"]*)" class="hero-badge-logo">')
BADGE_YEAR_RE = re.compile(r'<div class="apec-badge-year">(.*?)</div>\s*<div class="apec-badge-sub">(.*?)</div>', re.S)
ACTION_RE = re.compile(r'<a href="([^"]+)" class="btn btn--(accent|light) btn--lg">(.*?)</a>', re.S)
H1_RE = re.compile(r'<h1(?P<cls>[^>]*)>(?P<html>.*?)</h1>', re.S)


def detect_badge_icon(body):
    if "hero-badge-logo" in body:
        m = BADGE_IMG_RE.search(body)
        return {"type": "image", "image": m.group(1), "alt": clean(m.group(2))}
    if "apec-badge" in body and ">2023</text>" in body or "APEC" in body and "<svg" in body and "hero-badge-icon" not in body:
        return {"type": "icon", "icon": "apec"}
    if "<polygon" in body:  # webinar play icon
        return {"type": "icon", "icon": "webinar"}
    if "M4 3c0 5" in body:  # dna
        return {"type": "icon", "icon": "dna"}
    return {"type": "none"}


def extract_hero(page, out):
    src = read(page)
    slides = []
    for m in SLIDE_RE.finditer(src):
        body = m.group("body")
        badge = detect_badge_icon(body)
        ym = BADGE_YEAR_RE.search(body)
        if ym:
            badge["title"] = clean(ym.group(1))
            badge["subtitle"] = clean(ym.group(2))
        h1 = H1_RE.search(body)
        h1cls = h1.group("cls").strip()
        h1cls = re.sub(r'^class="|"$', "", h1cls).strip()
        sub = re.search(r'<p class="hero-subtitle">(.*?)</p>', body, re.S)
        actions = [
            {"href": a.group(1), "style": a.group(2), "label": clean(a.group(3))}
            for a in ACTION_RE.finditer(body)
        ]
        extra = " ".join(c for c in m.group("cls").split() if c != "active")
        slides.append({
            "extra_class": extra.strip(),
            "background": m.group("bg"),
            "badge": badge,
            "title_html": clean(h1.group("html")),
            "title_class": h1cls,
            "subtitle": clean(sub.group(1)) if sub else "",
            "actions": actions,
        })
    dump(out, {"slides": slides})
    return slides


# ---------------- 临床证据 ----------------
def extract_evidence(page, out):
    src = read(page)
    facts = []
    for m in re.finditer(
        r'<div class="fact-cell fade-in">\s*<span class="fact-value">(.*?)</span>\s*'
        r'<span class="fact-label">(.*?)</span>\s*<span class="fact-source">(.*?)</span>', src, re.S):
        facts.append({"value": clean(m.group(1)), "label": clean(m.group(2)), "source": clean(m.group(3))})

    rct = []
    for card in re.finditer(
        r'<div class="data-card fade-in">\s*<div class="data-head"><span class="data-badge">(.*?)</span><h3>(.*?)</h3></div>'
        r'(?P<metrics>.*?)<p class="data-cite">(.*?)</p>', src, re.S):
        metrics = []
        for mm in re.finditer(
            r'<div class="data-metric-head"><span class="data-metric-label">(.*?)</span><span class="data-metric-unit">(.*?)</span></div>'
            r'(?P<bars>.*?)<div class="data-metric-note">(.*?)</div>', card.group("metrics"), re.S):
            rows = re.findall(
                r'<span class="data-row-name data-row-name--(mebo|ctrl)">(.*?)</span>'
                r'<div class="data-track"><div class="data-fill data-fill--\1" style="width:([\d.]+)%;?">([\d.]+)</div>',
                mm.group("bars"))
            metrics.append({
                "label": clean(mm.group(1)), "unit": clean(mm.group(2)),
                "mebo_label": clean(rows[0][1]), "mebo_width": rows[0][2], "mebo_value": rows[0][3],
                "ctrl_label": clean(rows[1][1]), "ctrl_width": rows[1][2], "ctrl_value": rows[1][3],
                "note": clean(mm.group(4)),
            })
        rct.append({"badge": clean(card.group(1)), "title": clean(card.group(2)),
                    "metrics": metrics, "cite_html": clean(card.group(3))})

    studies = []
    for m in re.finditer(
        r'<div class="study-card fade-in">\s*<h3>(.*?)</h3>\s*<p>(.*?)</p>\s*'
        r'<div class="study-meta"><span class="study-src">(.*?)</span><a href="([^"]+)"[^>]*>(.*?)</a>', src, re.S):
        studies.append({"title": clean(m.group(1)), "summary": clean(m.group(2)),
                        "source": clean(m.group(3)), "url": m.group(4), "link_label": clean(m.group(5))})
    dump(out, {"facts": facts, "rct_cards": rct, "studies": studies})
    return facts, rct, studies


if __name__ == "__main__":
    es = extract_news("noticias.html", "news-es.json")
    en = extract_news("en/news.html", "news-en.json")
    print("news es/en:", len(es), len(en))
    print("slug sets equal:", {i["slug"] for i in es} == {i["slug"] for i in en})

    hes = extract_hero("index.html", "hero-es.json")
    hen = extract_hero("en/index.html", "hero-en.json")
    print("hero es/en:", len(hes), len(hen))
    for s in hes:
        print("  es slide badge:", s["badge"].get("type"), s["badge"].get("icon", s["badge"].get("image", "")))

    extract_evidence("evidencia.html", "evidence-es.json")
    extract_evidence("en/evidence.html", "evidence-en.json")
