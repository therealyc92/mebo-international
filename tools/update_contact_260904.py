# -*- coding: utf-8 -*-
"""
update_contact_260904.py — 联系页两项修改(2026-09-04,一次性):
1) 拉美联系人:删除 Xiaoyun (Alicia) Hu 卡片,保留 Wanting (Cecilia) Chen;
   .latam-grid 改为自适应居中(单卡居中,未来加卡自动并排)。
2) FAQ 区整段替换为 260904 QA.docx 的 5 组问答(EN 原文,ES 为对应西语译文)。
"""
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

CARD_ST = 'class="card fade-in" style="margin-bottom:var(--space-md);"'
H4_ST = 'style="margin-bottom:0.5rem;"'
P_ST = 'style="font-size:0.92rem;color:var(--color-text-light);margin:0;"'
P_MB_ST = 'style="font-size:0.92rem;color:var(--color-text-light);margin:0 0 0.5rem;"'
UL_ST = 'style="font-size:0.92rem;color:var(--color-text-light);margin:0;padding-left:1.1rem;"'
LI_ST = ' style="margin-bottom:0.35rem;"'


def card(h4, inner, last=False):
    st = 'class="card fade-in"' if last else CARD_ST
    return '        <div %s>\n          <h4 %s>%s</h4>\n%s\n        </div>' % (st, H4_ST, h4, inner)


def ul(items):
    lis = '\n'.join(
        '          <li%s>%s</li>' % ('' if i == len(items) - 1 else LI_ST, t)
        for i, t in enumerate(items))
    return '          <ul %s>\n%s\n          </ul>' % (UL_ST, lis)


# ---------------- EN ----------------
EN_FAQ = [
    card(
        'What is MEBO Wound Ointment? What are its active ingredients?',
        '          <p %s>MEBO is the English abbreviation for Moist Exposed Burn Ointment and is the core pharmaceutical product for implementing Regenerative Medical Technology.</p>\n'
        '          <p %s>The patented mechanism of MEBO Wound Ointment is based on beeswax and sesame oil. Beeswax provides the frame structure that holds sesame oil droplets containing all active constituents. The core active constituents are <strong>&beta;-sitosterol</strong>, <strong>baicalin</strong>, and <strong>berberine</strong>: &beta;-sitosterol has anti-inflammatory and antioxidant properties; baicalin has anti-microbial, anti-inflammatory, analgesic, nerve-protective, and antioxidant properties; berberine has anti-microbial and anti-inflammatory properties.</p>' % (P_MB_ST, P_ST),
    ),
    card(
        'With what can MEBO Wound Ointment be used in combination therapy?',
        ul([
            '<strong>Skin Grafting:</strong> Such as conventional split-thickness skin grafting, microskin grafting, MEEK microskin grafting, and skin flap transplantation. MEBO Wound Ointment is applied before surgery for wound debridement and wound bed preparation, and after surgery to promote graft survival and epithelialization.',
            '<strong>Negative Pressure Wound Therapy (NPWT):</strong> MEBO Wound Ointment can be used alternately with NPWT.',
            '<strong>Other Topical Agents:</strong> MEBO Wound Ointment can be combined with other topical medications, such as antibiotics/antimicrobial agents and growth factors, applied sequentially or alternately according to the wound condition.',
            '<strong>CO2 Laser Therapy:</strong> MEBO Wound Ointment is applied immediately after fractional CO2 laser treatment to promote wound healing and reduce scar formation and hyperpigmentation.',
            '<strong>Physical Therapy:</strong> In the wound healing stage, MEBO Wound Ointment can be combined with red and/or blue light therapy to further prevent infection and accelerate wound healing.',
        ]),
    ),
    card(
        'How often should the dressing be changed?',
        ul([
            '<strong>Acute Wounds:</strong> Dressing change is performed every 4 hours. The medication principles are &ldquo;early application&rdquo; (best applied within 4 hours post-injury) and &ldquo;continuous application&rdquo; (uninterrupted use throughout the treatment course).',
            '<strong>Chronic Wounds:</strong> Dressing change is performed once or twice daily.',
        ]),
    ),
    card(
        'What are the indications for MEBO Wound Ointment?',
        ul([
            '<strong>Burn Wounds:</strong> First-, second-, and third-degree burns, as well as thermal, chemical, and electrical burns, etc.',
            '<strong>Chronic Wounds:</strong> Diabetic foot ulcers (Wagner grades 1&ndash;5, including wet, dry, and mixed gangrene); pressure injuries (stages I&ndash;IV and unstageable pressure ulcers); lower extremity vascular ulcers; radiation ulcers.',
            '<strong>Surgical Wounds:</strong> Post-perianal surgery (perianal abscess, hemorrhoids, anal fistula surgery, etc.); donor sites and recipient sites of skin grafts.',
            '<strong>Traumatic Wounds:</strong> Abrasions, lacerations, animal bites, etc.',
            '<strong>Medical Aesthetics:</strong> After fractional CO2 laser treatment; post-chemical peeling.',
            '<strong>Special Types of Wounds:</strong> Wounds caused by necrotizing fasciitis; wounds with osteonecrosis of bone and joint.',
        ]),
    ),
    card(
        'Can MEBO Wound Ointment be used on infected wounds?',
        '          <p %s>MEBO Wound Ointment is not only suitable for infected wounds but also possesses a clear anti-infective mechanism of action.</p>\n'
        '          <p %s>Debridement serves as the foundation for anti-infection. The lipophilic components of MEBO Wound Ointment wrap around solid necrotic tissue under the action of body temperature and convert it from a solid to a liquid state through a series of chemical reactions, which are then actively expelled from the wound surface. During this process, bacteria and metabolites are removed together, thereby reducing bacterial colonization and disrupting biofilm structure, creating favorable conditions for anti-infection.</p>\n'
        '          <p %s>At the same time, MEBO Wound Ointment can also induce morphological changes in bacteria, reducing their reproductive capacity and virulence. Studies have shown that when cultured in a MEBO Wound Ointment-containing medium, the morphology of <em>Escherichia coli</em> and <em>Proteus vulgaris</em> undergoes significant alteration, and bacterial virulence is markedly decreased.</p>' % (P_MB_ST, P_MB_ST, P_ST),
        last=True,
    ),
]

# ---------------- ES ----------------
ES_FAQ = [
    card(
        '&iquest;Qu&eacute; es MEBO Ungüento para Heridas? &iquest;Cu&aacute;les son sus ingredientes activos?',
        '          <p %s>MEBO es la abreviatura en ingl&eacute;s de Moist Exposed Burn Ointment (Ung&uuml;ento para Quemaduras de Exposici&oacute;n H&uacute;meda) y es el producto farmac&eacute;utico central para la aplicaci&oacute;n de la Tecnolog&iacute;a M&eacute;dica Regenerativa.</p>\n'
        '          <p %s>El mecanismo patentado de MEBO Ungüento para Heridas se basa en la cera de abeja y el aceite de s&eacute;samo. La cera de abeja aporta la estructura que sostiene las gotas de aceite de s&eacute;samo que contienen todos los principios activos. Los principios activos centrales son <strong>&beta;-sitosterol</strong>, <strong>baicalina</strong> y <strong>berberina</strong>: el &beta;-sitosterol posee propiedades antiinflamatorias y antioxidantes; la baicalina, propiedades antimicrobianas, antiinflamatorias, analg&eacute;sicas, neuroprotectoras y antioxidantes; la berberina, propiedades antimicrobianas y antiinflamatorias.</p>' % (P_MB_ST, P_ST),
    ),
    card(
        '&iquest;Con qu&eacute; puede utilizarse MEBO Ungüento para Heridas en terapia combinada?',
        ul([
            '<strong>Injertos de piel:</strong> Como injertos convencionales de espesor parcial, microinjertos, microinjertos MEEK y colgajos. MEBO Ungüento para Heridas se aplica antes de la cirug&iacute;a para el desbridamiento y la preparaci&oacute;n del lecho de la herida, y despu&eacute;s de la cirug&iacute;a para favorecer la supervivencia del injerto y la epitelizaci&oacute;n.',
            '<strong>Terapia de presi&oacute;n negativa (NPWT):</strong> MEBO Ungüento para Heridas puede alternarse con la NPWT.',
            '<strong>Otros agentes t&oacute;picos:</strong> Puede combinarse con otros medicamentos t&oacute;picos, como antibi&oacute;ticos/agentes antimicrobianos y factores de crecimiento, aplicados de forma secuencial o alternada seg&uacute;n el estado de la herida.',
            '<strong>L&aacute;ser de CO2:</strong> Se aplica inmediatamente despu&eacute;s del tratamiento con l&aacute;ser fraccionado de CO2 para favorecer la cicatrizaci&oacute;n y reducir la formaci&oacute;n de cicatrices y la hiperpigmentaci&oacute;n.',
            '<strong>Fisioterapia:</strong> En la fase de cicatrizaci&oacute;n, puede combinarse con fototerapia de luz roja y/o azul para prevenir infecciones y acelerar la cicatrizaci&oacute;n.',
        ]),
    ),
    card(
        '&iquest;Con qu&eacute; frecuencia debe cambiarse el ap&oacute;sito?',
        ul([
            '<strong>Heridas agudas:</strong> El cambio de ap&oacute;sito se realiza cada 4 horas. Los principios de aplicaci&oacute;n son &laquo;aplicaci&oacute;n temprana&raquo; (idealmente dentro de las 4 horas posteriores a la lesi&oacute;n) y &laquo;aplicaci&oacute;n continua&raquo; (uso ininterrumpido durante todo el tratamiento).',
            '<strong>Heridas cr&oacute;nicas:</strong> El cambio de ap&oacute;sito se realiza una o dos veces al d&iacute;a.',
        ]),
    ),
    card(
        '&iquest;Cu&aacute;les son las indicaciones de MEBO Ungüento para Heridas?',
        ul([
            '<strong>Quemaduras:</strong> De primer, segundo y tercer grado, as&iacute; como quemaduras t&eacute;rmicas, qu&iacute;micas y el&eacute;ctricas, etc.',
            '<strong>Heridas cr&oacute;nicas:</strong> &Uacute;lceras de pie diab&eacute;tico (grados 1&ndash;5 de Wagner, incluidas gangrena h&uacute;meda, seca y mixta); lesiones por presi&oacute;n (estadios I&ndash;IV y &uacute;lceras por presi&oacute;n no clasificables); &uacute;lceras vasculares de extremidades inferiores; &uacute;lceras por radiaci&oacute;n.',
            '<strong>Heridas quir&uacute;rgicas:</strong> Postcirug&iacute;a perianal (absceso perianal, hemorroides, f&iacute;stula anal, etc.); zonas donante y receptora de injertos de piel.',
            '<strong>Heridas traum&aacute;ticas:</strong> Abrasiones, laceraciones, mordeduras de animales, etc.',
            '<strong>Est&eacute;tica m&eacute;dica:</strong> Despu&eacute;s de l&aacute;ser fraccionado de CO2; postpeeling qu&iacute;mico.',
            '<strong>Tipos especiales de heridas:</strong> Heridas causadas por fascitis necrosante; heridas con osteonecrosis &oacute;sea y articular.',
        ]),
    ),
    card(
        '&iquest;Puede utilizarse MEBO Ungüento para Heridas en heridas infectadas?',
        '          <p %s>MEBO Ungüento para Heridas no solo es apto para heridas infectadas, sino que posee un mecanismo de acci&oacute;n antiinfeccioso claro.</p>\n'
        '          <p %s>El desbridamiento constituye la base de la antiinfecci&oacute;n. Los componentes lipof&iacute;licos de MEBO Ungüento para Heridas envuelven el tejido necr&oacute;tico s&oacute;lido bajo la acci&oacute;n de la temperatura corporal y lo convierten de estado s&oacute;lido a l&iacute;quido mediante una serie de reacciones qu&iacute;micas, para luego expulsarlo activamente de la superficie de la herida. Durante este proceso, las bacterias y los metabolitos se eliminan conjuntamente, reduciendo la colonizaci&oacute;n bacteriana y rompiendo la estructura del biofilm, creando condiciones favorables para la antiinfecci&oacute;n.</p>\n'
        '          <p %s>Al mismo tiempo, MEBO Ungüento para Heridas tambi&eacute;n puede inducir cambios morfol&oacute;gicos en las bacterias, reduciendo su capacidad reproductiva y su virulencia. Los estudios han demostrado que, al cultivarse en un medio que contiene MEBO Ungüento para Heridas, la morfolog&iacute;a de <em>Escherichia coli</em> y <em>Proteus vulgaris</em> experimenta una alteraci&oacute;n significativa y la virulencia bacteriana disminuye notablemente.</p>' % (P_MB_ST, P_MB_ST, P_ST),
        last=True,
    ),
]

FAQ_REGION_RE = re.compile(
    r'<div style="max-width:760px;margin:0 auto;">.*?\n      </div>\n    </div>\n  </section>',
    re.S,
)

XH_CARD_RE = re.compile(
    r'\s*<div class="latam-card fade-in">\s*<div class="latam-avatar">XH</div>.*?</div>\s*</div>(?=\s*<div class="latam-card)',
    re.S,
)


def patch(path, faq_cards):
    p = os.path.join(ROOT, path)
    src = open(p, encoding='utf-8').read()

    # 1) 删除 XH 卡片
    out, n1 = XH_CARD_RE.subn('', src)
    assert n1 == 1, (path, 'XH card not found', n1)

    # 2) 替换 FAQ 区
    new_region = '<div style="max-width:760px;margin:0 auto;">\n' + '\n'.join(faq_cards) + '\n      </div>\n    </div>\n  </section>'
    out, n2 = FAQ_REGION_RE.subn(lambda m: new_region, out, count=1)
    assert n2 == 1, (path, 'FAQ region not found', n2)

    open(p, 'w', encoding='utf-8').write(out)
    print('patched', path)


# 3) .latam-grid 自适应居中
css_path = os.path.join(ROOT, 'css/style.css')
css = open(css_path, encoding='utf-8').read()
old_grid = '.latam-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); }'
new_grid = '.latam-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 400px)); gap: var(--space-md); justify-content: center; }'
assert old_grid in css, 'latam-grid rule not found'
css = css.replace(old_grid, new_grid, 1)
open(css_path, 'w', encoding='utf-8').write(css)
print('patched css/style.css')

patch('en/contact.html', EN_FAQ)
patch('contacto.html', ES_FAQ)
print('done')
