# -*- coding: utf-8 -*-
"""
tag_copy.py — 给产品页/联系页的关键文案元素打上 data-cms 标记,
并把当前文案原样导出到 assets/data/copy-{lang}.json。
之后 content.js 会用 JSON 里的内容原地替换,市场人员在后台改 JSON 即可。
幂等:已标记过的文件会跳过。
"""
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def tag_file(path, prefix_key, extra, copy, content_js_prefix, copy_json):
    """extra: list of (regex, key_fn) 自定义标记规则,在通用规则后执行。"""
    p = os.path.join(ROOT, path)
    with open(p, encoding="utf-8") as f:
        src = f.read()
    if "data-cms=" in src:
        print("skip   ", path)
        return

    def sub_tag_noop():
        pass

    # page-hero h1 + lead p
    m = re.search(r'<section class="page-hero">.*?<h1>(?P<inner>.*?)</h1>\s*<p>(?P<inner2>.*?)</p>', src, re.S)
    if m:
        set_key(copy, prefix_key + ".hero.title", m.group("inner").strip())
        set_key(copy, prefix_key + ".hero.lead", m.group("inner2").strip())
        block = m.group(0)
        newblock = block.replace("<h1>", '<h1 data-cms="%s.hero.title">' % prefix_key, 1)
        # 只替换 hero 内的第一个 <p>
        h1_end = newblock.find("</h1>")
        ppos = newblock.find("<p>", h1_end)
        newblock = newblock[:ppos] + '<p data-cms="%s.hero.lead">' % prefix_key + newblock[ppos + 3:]
        src = src.replace(block, newblock, 1)
    else:
        print("  !! no page-hero in", path)

    # overview 块(产品页特有,eyebrow 带内联样式)
    m = re.search(
        r'(?P<open><span class="eyebrow" style="[^"]*">)(?P<e>.*?)</span>\s*<h2>(?P<h>.*?)</h2>\s*<p>(?P<p1>.*?)</p>\s*<p>(?P<p2>.*?)</p>',
        src, re.S)
    if m:
        set_key(copy, prefix_key + ".s1.eyebrow", m.group("e").strip())
        set_key(copy, prefix_key + ".s1.h2", m.group("h").strip())
        set_key(copy, prefix_key + ".s1.p1", m.group("p1").strip())
        set_key(copy, prefix_key + ".s1.p2", m.group("p2").strip())
        old = m.group(0)
        new = old.replace(m.group("open"), m.group("open")[:-1] + ' data-cms="%s.s1.eyebrow">' % prefix_key, 1)
        new = new.replace("<h2>", '<h2 data-cms="%s.s1.h2">' % prefix_key, 1)
        new = new.replace("<p>", '<p data-cms="%s.s1.p1">' % prefix_key, 1)
        # 第二个 <p>
        first_p_end = new.find("</p>") + 4
        p2pos = new.find("<p>", first_p_end)
        new = new[:p2pos] + '<p data-cms="%s.s1.p2">' % prefix_key + new[p2pos + 3:]
        src = src.replace(old, new, 1)

    # 通用 section-header(s2 起编号;s1 已被 overview 占用时从 s2 开始)
    idx = 2 if m else 1
    for sm in re.finditer(
            r'<div class="section-header">\s*<span class="eyebrow">(?P<e>.*?)</span>\s*<h2>(?P<h>.*?)</h2>(?:\s*<p>(?P<p>.*?)</p>)?',
            src, re.S):
        key = "%s.s%d" % (prefix_key, idx)
        set_key(copy, key + ".eyebrow", sm.group("e").strip())
        set_key(copy, key + ".h2", sm.group("h").strip())
        if sm.group("p"):
            set_key(copy, key + ".lead", sm.group("p").strip())
        old = sm.group(0)
        new = old.replace('<span class="eyebrow">', '<span class="eyebrow" data-cms="%s.eyebrow">' % key, 1)
        new = new.replace("<h2>", '<h2 data-cms="%s.h2">' % key, 1)
        if sm.group("p"):
            new = new.replace("<p>", '<p data-cms="%s.lead">' % key, 1)
        src = src.replace(old, new, 1)
        idx += 1

    # CTA
    m = re.search(r'<div class="cta-section fade-in">\s*<h2>(?P<h>.*?)</h2>\s*<p>(?P<p>.*?)</p>', src, re.S)
    if m:
        set_key(copy, prefix_key + ".cta.h2", m.group("h").strip())
        set_key(copy, prefix_key + ".cta.p", m.group("p").strip())
        old = m.group(0)
        new = old.replace("<h2>", '<h2 data-cms="%s.cta.h2">' % prefix_key, 1)
        new = new.replace("<p>", '<p data-cms="%s.cta.p">' % prefix_key, 1)
        src = src.replace(old, new, 1)

    # 页面特有规则
    for rule in extra:
        src = rule(src, copy)

    # body data-copy-src + content.js
    src = src.replace("<body>", '<body data-copy-src="%s">' % copy_json, 1)
    src = src.replace(
        '<script src="%sjs/main.js' % content_js_prefix,
        '<script src="%sjs/content.js?v=20260903" defer></script>\n  <script src="%sjs/main.js' % (content_js_prefix, content_js_prefix),
        1,
    )
    with open(p, "w", encoding="utf-8") as f:
        f.write(src)
    print("tagged ", path)


def set_key(copy, dotted, value):
    parts = dotted.split(".")
    d = copy
    for k in parts[:-1]:
        d = d.setdefault(k, {})
    d[parts[-1]] = value


def contact_extras(src, copy):
    # 电话显示文字
    m = re.search(r'<a href="tel:[^"]+">(?P<inner>[^<]+)</a>', src)
    if m:
        set_key(copy, "contact.phone", m.group("inner").strip())
        src = src.replace(m.group(0), m.group(0).replace("<a ", '<a data-cms="contact.phone" ', 1), 1)
    # 邮箱显示文字
    m = re.search(r'<a href="mailto:inter@mebo\.com">(?P<inner>[^<]+)</a>', src)
    if m:
        set_key(copy, "contact.email", m.group("inner").strip())
        src = src.replace(m.group(0), m.group(0).replace("<a ", '<a data-cms="contact.email" ', 1), 1)
    # 分销合作提示行
    m = re.search(r'(?P<open><p class="distributor-line fade-in">)(?P<inner>.*?)</p>', src, re.S)
    if m:
        set_key(copy, "contact.distributor", m.group("inner").strip())
        src = src.replace(m.group(0), m.group("open")[:-1] + ' data-cms="contact.distributor">' + m.group("inner") + "</p>", 1)
    return src


if __name__ == "__main__":
    copy_es, copy_en = {}, {}
    tag_file("producto.html", "product", [], copy_es, "", "assets/data/copy-es.json")
    tag_file("contacto.html", "contact", [contact_extras], copy_es, "", "assets/data/copy-es.json")
    tag_file("en/product.html", "product", [], copy_en, "../", "../assets/data/copy-en.json")
    tag_file("en/contact.html", "contact", [contact_extras], copy_en, "../", "../assets/data/copy-en.json")
    with open(os.path.join(ROOT, "assets/data/copy-es.json"), "w", encoding="utf-8") as f:
        json.dump(copy_es, f, ensure_ascii=False, indent=2)
    with open(os.path.join(ROOT, "assets/data/copy-en.json"), "w", encoding="utf-8") as f:
        json.dump(copy_en, f, ensure_ascii=False, indent=2)
    print("copy json keys es:", len(str(copy_es)), "en:", len(str(copy_en)))
