# Plaza & Ascent section, redrawn in the brand palette from the supplied diagram (2000 x 545 px
# source; coordinates below are in that space). Run: python3 tools/plaza-ascent.py  (writes src/assets/svg/plaza-ascent.svg)
import math
O = []
def a(s): O.append(s)
f = lambda v: f'{v:.1f}'.rstrip('0').rstrip('.')

# ---- stepped ascent profile: building edge (+0) up to the paseo (+22.5') ----
runs = [  # stair (x0, y0) -> (x1, y1), steps
    ((728, 468), (762, 448), 3),
    ((890, 448), (970, 410), 6),
    ((1075, 410), (1135, 377), 5),
    ((1240, 377), (1305, 342), 5),
]
def stairs(x0, y0, x1, y1, n):
    pts = []
    dx, dy = (x1 - x0) / n, (y1 - y0) / n
    x, y = x0, y0
    for _ in range(n):
        y += dy; pts.append((x, y)); x += dx; pts.append((x, y))
    return pts
prof = [(728, 468)]
for i, ((x0, y0), (x1, y1), n) in enumerate(runs):
    if prof[-1] != (x0, y0): prof.append((x0, y0))
    prof += stairs(x0, y0, x1, y1, n)
prof += [(1305, 342), (1905, 327)]
P = lambda pts: ' '.join(f'{f(x)},{f(y)}' for x, y in pts)

a('<svg class="pa-svg" viewBox="20 20 1970 525" role="img" aria-label="Section through the plaza, the ascent and the paseo, from the adjacent park and North Green Street up 25 feet to North Halsted Street">')

# ---- building ----
a('<g id="pa-building">')
a('<rect class="pa-glass" x="728" y="240" width="1060" height="100"/>')
a('<polygon class="pa-glass" points="1305,340 1788,330 1788,342 1305,342"/>')
a('<rect class="pa-mass" x="728" y="33" width="1124" height="207"/>')
for y in (93, 160): a(f'<line class="pa-floor" x1="728" y1="{y}" x2="1852" y2="{y}"/>')
a('<rect class="pa-slab" x="728" y="225" width="1124" height="15"/>')
a('<line class="pa-mullion" x1="1788" y1="240" x2="1788" y2="330"/>')
a('</g>')

# ---- ascent volume under the balcony terrace ----
vol = [(728, 340)] + [(x, y) for x, y in prof if x <= 1305] + [(1305, 340)]
a(f'<polygon id="pa-ascent" class="pa-ascent" points="{P(vol)}"/>')

# columns stand on the ascent
a('<g id="pa-cols">')
for cx, bot in ((818, 448), (1109, 410), (1271, 377), (1562, 335)):
    a(f'<rect class="pa-col" x="{cx-9}" y="240" width="18" height="{bot-240}"/>')
a('</g>')

# balcony terrace deck + guardrail
a('<g id="pa-terrace">')
a('<line class="pa-deck" x1="728" y1="340" x2="1305" y2="340"/>')
a('<line class="pa-rail" x1="728" y1="322" x2="1300" y2="322"/>')
for x in range(746, 1300, 26): a(f'<line class="pa-post" x1="{x}" y1="322" x2="{x}" y2="340"/>')
a('</g>')

# stair handrails
a('<g id="pa-rails">')
for (x0, y0), (x1, y1), n in runs:
    a(f'<polyline class="pa-rail" points="{f(x0)},{f(y0-22)} {f(x1)},{f(y1-22)}"/>')
    a(f'<line class="pa-post" x1="{x0}" y1="{y0-22}" x2="{x0}" y2="{y0}"/><line class="pa-post" x1="{x1}" y1="{y1-22}" x2="{x1}" y2="{y1}"/>')
a('</g>')

# ---- trees, street, car ----
def tree(cx, base, top, r, cls='pa-tree'):
    a(f'<g class="{cls}"><rect class="pa-trunk" x="{cx-2.5}" y="{top+r}" width="5" height="{base-top-r}"/>'
      f'<circle cx="{cx}" cy="{top+r}" r="{r}"/><circle cx="{cx-r*.75}" cy="{top+r*1.55}" r="{r*.72}"/><circle cx="{cx+r*.8}" cy="{top+r*1.45}" r="{r*.75}"/></g>')
a('<g id="pa-trees">')
tree(70, 468, 342, 26); tree(128, 468, 336, 30); tree(188, 468, 346, 25)
tree(405, 468, 345, 30, 'pa-tree pa-tree-lt')
a('</g>')
a('<g id="pa-car"><path class="pa-car" d="M331,466 v-14 q0,-7 7,-8 l6,-9 q2,-3 6,-3 h14 q4,0 6,3 l5,9 q6,1 6,8 v14 z"/>'
  '<circle class="pa-wheel" cx="342" cy="467" r="5"/><circle class="pa-wheel" cx="367" cy="467" r="5"/></g>')

# ---- planters with seating ----
a('<g id="pa-planters">')
for x0, x1, y in ((468, 632, 466), (1306, 1408, 341), (1512, 1615, 337), (1763, 1845, 330)):
    a(f'<rect class="pa-planter" x="{x0}" y="{y-11}" width="{x1-x0}" height="11"/>')
    a(f'<path class="pa-green" d="M{x0+3},{y-11} ' + ' '.join(f'q{4},-{7 if i % 2 else 4} 8,0' for i in range((x1 - x0 - 6) // 8)) + ' z"/>')
a('</g>')

# ---- ground: park, Green St, plaza, the ascent, the paseo up to Halsted ----
ground = [(37, 468), (248, 468), (248, 473), (384, 473), (384, 468)] + prof
a(f'<polyline id="pa-ground" class="pa-ground" points="{P(ground)}"/>')

# ---- people ----
def person(x, y, h=30, flip=False):
    s = h / 30
    a(f'<g class="pa-person"><g transform="translate({x} {y}) scale({-s if flip else s} {s})">'
      '<circle cx="0" cy="-26" r="3.6"/><path d="M-3.6,-21 h7.2 l1.4,10 h-2.2 l-.6,11 h-2.2 l-.6,-8 h-.8 l-.6,8 h-2.2 l-.6,-11 h-2.2 z"/></g></g>')
a('<g id="pa-people">')
for x, y, fl in ((478, 455, 0), (586, 455, 1), (672, 468, 0), (735, 322, 1), (884, 322, 0), (921, 322, 1), (1064, 322, 0),
                 (1212, 322, 0), (1222, 322, 1), (1320, 330, 0), (1443, 339, 1), (1580, 335, 0), (1797, 329, 1),
                 (762, 448, 0), (866, 448, 1), (966, 416, 0), (1024, 410, 1), (1135, 377, 0), (1215, 377, 1)):
    person(x, y, 30, fl)
a('</g>')

# ---- sightlines (copper) and pedestrian connections ----
def arrow(x, y, ang, cls, size=13):
    ca, sa = math.cos(ang), math.sin(ang)
    p1 = (x - size * ca + size * .45 * sa, y - size * sa - size * .45 * ca)
    p2 = (x - size * ca - size * .45 * sa, y - size * sa + size * .45 * ca)
    a(f'<polygon class="{cls}" points="{f(x)},{f(y)} {f(p1[0])},{f(p1[1])} {f(p2[0])},{f(p2[1])}"/>')
a('<g id="pa-sight">')
for i, (x0, y0, x1, y1) in enumerate(((728, 314, 98, 382), (965, 404, 182, 436), (728, 314, 590, 430))):
    a(f'<path id="pa-sight-{i}" class="pa-sight" d="M{x0},{y0} L{x1},{y1}"/>')
    arrow(x1, y1, math.atan2(y1 - y0, x1 - x0), 'pa-sight-head')
ang = math.degrees(math.atan2(314 - 382, 728 - 98))
a(f'<g class="pa-lbl-wrap"><text class="pa-lbl pa-lbl-sight" transform="translate(430 336) rotate({ang:.1f})" text-anchor="middle">VIEW TO ADJACENT PARK</text></g>')
a('<g class="pa-lbl-wrap"><text class="pa-lbl pa-lbl-sight" transform="translate(648 362) rotate(-40)" text-anchor="middle">VIEW TO PLAZA</text></g>')
a('</g>')
a('<g id="pa-conn">')
a('<path id="pa-conn-halsted" class="pa-conn" d="M740,480 C980,476 1180,430 1460,408 S1790,394 1872,393"/>')
arrow(1880, 393, 0, 'pa-conn-head')
a('<path id="pa-conn-park" class="pa-conn" d="M1225,446 C1010,488 820,514 600,514 L203,514"/>')
arrow(195, 514, math.pi, 'pa-conn-head')
a('<text class="pa-lbl pa-lbl-conn" x="1686" y="432" text-anchor="middle">PEDESTRIAN CONNECTION TO HALSTED</text>')
a('<text class="pa-lbl pa-lbl-conn" x="392" y="537" text-anchor="middle">PEDESTRIAN CONNECTION TO PARK</text>')
a('</g>')

# ---- elevations along the climb ----
a('<g id="pa-elev">')
for x, y, t, on in ((550, 448, "+0.0'", 0), (630, 448, "+1.5'", 0), (848, 440, "+4.0'", 1), (1003, 402, "+10.0'", 1), (1183, 369, "+16.0'", 1), (1357, 326, "+22.5'", 0), (1880, 318, "+25.0'", 0)):
    a(f'<text class="pa-tag{" on-copper" if on else ""}" x="{x}" y="{y}" text-anchor="middle">{t}</text>')
a('</g>')

# ---- place labels ----
a('<g id="pa-labels">')
for x, y, t, anc in ((128, 500, 'ADJACENT PARK', 'middle'), (318, 500, 'NORTH GREEN ST', 'middle'), (526, 500, 'THE PLAZA', 'middle'),
                     (1022, 448, 'THE ASCENT', 'middle'), (1450, 374, 'THE PASEO', 'middle'), (1925, 374, 'NORTH HALSTED ST', 'end'),
                     (948, 292, 'BALCONY TERRACE', 'middle')):
    a(f'<text class="pa-lbl pa-place" x="{x}" y="{y}" text-anchor="{anc}">{t}</text>')
a('</g>')
a('</svg>')
open(__import__('pathlib').Path(__file__).resolve().parent.parent / 'src/assets/svg/plaza-ascent.svg', 'w').write(
    '<!-- Plaza & Ascent section, redrawn in the brand palette from the supplied diagram.\n     Generated; positions are in the source diagram\'s 2000 x 545 px space. -->\n' + '\n'.join(O) + '\n')
print(len('\n'.join(O)))
