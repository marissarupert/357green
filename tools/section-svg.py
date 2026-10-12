#!/usr/bin/env python3
"""Redraw the building section (slide 16) as a crisp vector SVG.

The source deck only has the section as a small raster, so its labels blur on
screen. This traces it: every floor line, wall and fill is measured from
public/assets/diagrams/building-section.jpg (1938 x 1391 px) and drawn in the
same coordinates, so the slide's callouts, ring and detail still line up.
Labels are set in the deck's type at a size that reads on the slide (the
drawing shows at 0.514 scale), grouped by zone instead of repeated per floor.

    python3 tools/section-svg.py > src/assets/svg/building-section.svg
"""

W, H = 1938, 1391
OFFICE, AMENITY, PARKING, MECH = '#becad5', '#b77859', '#8d9899', '#c4bab4'
INK, SLAB, CORE, NEIGHBOR = '#2a2b33', '#6f7a80', '#ffffff', '#e1e3e5'

# floor: (top, bottom) in px, from the drawing's slab lines
FLOORS = {
    29: (157, 200), 28: (200, 239), 27: (239, 276), 26: (276, 313), 25: (313, 348),
    24: (348, 386), 23: (386, 423), 22: (423, 461), 21: (461, 498), 20: (498, 535),
    19: (535, 572), 18: (572, 608), 17: (608, 645), 16: (645, 682), 15: (689, 729),
    14: (736, 775), 13: (775, 812), 12: (812, 849), 11: (849, 886), 10: (886, 924),
    9: (924, 958), 8: (966, 1009), 7: (1017, 1072), 6: (1076, 1100), 5: (1100, 1125),
    4: (1129, 1153), 3: (1153, 1178), 2: (1189, 1250), 1: (1250, 1303),
}
GROUND = 1303
out = []
a = out.append


def rect(x, y, w, h, fill, stroke=INK, sw=2, extra=''):
    a(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"{extra}/>')


def text(x, y, s, size=24, anchor='middle', weight=500, fill=INK, extra=''):
    a(f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{weight}" text-anchor="{anchor}" fill="{fill}"{extra}>{s}</text>')


a(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" class="section-svg" role="img" aria-label="Building section through the tower">')
a('<defs><linearGradient id="sg-ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7d8287"/><stop offset="1" stop-color="#b9bcbf"/></linearGradient></defs>')
a(f'<g font-family="Jost, Futura, sans-serif" letter-spacing="1.5" stroke-linejoin="round">')

# ---- context: 360 N Green to the west, Halsted to the east, ground, I-90/94
a('<g class="ctx">')
for x, y, w, h in ((50, 270, 246, 853), (50, 395, 165, 728), (50, 360, 73, 35), (50, 1123, 167, 74), (50, 1197, 259, 53), (50, 1250, 192, 53)):
    rect(x, y, w, h, NEIGHBOR, '#8e9398', 2)
text(296, 216, '390′', 28, 'end', 600)
text(296, 251, 'T/ 360 N GREEN', 28, 'end', 600)
text(146, 1294, '360 N GREEN', 24, 'middle', 600)
for x, w in ((1215, 127), (1342, 194)):
    rect(x, 1246, w, 57, NEIGHBOR, '#8e9398', 2)
rect(1536, 1237, 399, 66, NEIGHBOR, '#8e9398', 2)
a('<path d="M1188 1237H1535V1246H1188Z" fill="#cfd3d6" stroke="#8e9398" stroke-width="2"/>')
rect(50, GROUND, 1885, 80, 'url(#sg-ground)', 'none', 0)
rect(993, 1318, 287, 52, '#ffffff', INK, 3)
text(1136, 1348, 'I-90/94', 26, 'middle', 600)
for cx in (1050, 1092, 1183, 1235):
    a(f'<rect x="{cx - 9}" y="1352" width="18" height="16" rx="5" fill="none" stroke="{INK}" stroke-width="3"/>')
# street names, set vertically as in the source
a(f'<text transform="translate(350 1296) rotate(-90)" font-size="22" font-weight="600" fill="{INK}">N GREEN</text>')
text(362, 1300, '+0′-0″', 22, 'start', 600)
# set flat on the Halsted grade, under the slide's 2nd-floor leader (y 1203)
text(1196, 1231, 'N HALSTED  +25′-0″', 20, 'start', 600)
a('</g>')

# ---- the tower, zone by zone (data-zone matches the legend)
f = FLOORS
a('<g data-zone="parking">')
for n in (7, 6):
    t, b = f[n]; rect(595, t, 133, b - t, PARKING); rect(848, t, 120, b - t, PARKING)
for n in (5, 4, 3):
    t, b = f[n]; rect(528, t, 200, b - t, PARKING); rect(848, t, 120, b - t, PARKING)
for t, b in ((1072, 1076), (1125, 1129)):
    rect(595 if t < 1100 else 528, t, 373 if t < 1100 else 440, b - t, SLAB, 'none', 0)
a('</g>')

a('<g data-zone="office">')
for n in range(16, 29):
    t, b = f[n]; rect(633, t, 147, b - t, OFFICE); rect(848, t, 120, b - t, OFFICE)
for n in range(8, 15):
    t, b = f[n]; rect(633, t, 122, b - t, OFFICE); rect(848, t, 120, b - t, OFFICE)
a('</g>')

a('<g data-zone="amenity">')
t, b = f[15]; rect(633, t, 122, b - t, AMENITY); rect(848, t, 120, b - t, AMENITY)
t, b = f[29]; rect(848, t, 120, b - t, AMENITY)
a('</g>')

a('<g data-zone="mech">')
rect(848, 70, 120, 80, MECH)
a('</g>')

# slabs between zones, the roof edge, the screen wall and the cores
a('<g class="ctx">')
for y0, y1, x0, x1 in ((150, 157, 848, 968), (682, 689, 633, 968), (729, 736, 633, 968), (958, 966, 633, 968),
                       (1009, 1017, 595, 968), (1178, 1189, 528, 968)):
    rect(x0, y0, x1 - x0, y1 - y0, SLAB, 'none', 0)
rect(633, 188, 147, 12, '#ffffff', INK, 2)              # roof edge west of the core
rect(780, 35, 188, 35, '#ffffff', INK, 2.5)            # screen wall
rect(780, 50, 68, 1128, CORE, INK, 2.5)                # elevator core
a(f'<path d="M809 50V1178" stroke="{INK}" stroke-width="2"/>')
rect(755, 682, 25, 327, CORE, INK, 2)                  # low-rise core
rect(728, 1017, 28, 161, CORE, INK, 2)                 # parking core
rect(756, 1017, 24, 161, CORE, INK, 2)
rect(595, 999, 38, 10, '#ffffff', INK, 2)              # setback at floor 8
for n in list(range(16, 30)):
    t, b = f[n]; a(f'<circle cx="795" cy="{(t + b) / 2:.0f}" r="7" fill="{INK}"/>')
for n in list(range(8, 16)):
    t, b = f[n]; a(f'<circle cx="768" cy="{(t + b) / 2:.0f}" r="7" fill="{INK}"/>')
a(f'<circle cx="795" cy="{(f[15][0] + f[15][1]) / 2:.0f}" r="7" fill="{INK}"/>')
for n in (7, 6, 5, 4, 3):
    t, b = f[n]; a(f'<circle cx="742" cy="{(t + b) / 2:.0f}" r="7" fill="{INK}"/>')
# parked cars on floors 3-7
for n in (7, 6, 4, 3):
    t, b = f[n]; a(f'<path d="M681 {b - 4}h40v-9q-3-6-11-7l-6-4h-12q-6 0-9 5l-2 6z" fill="{INK}"/>')
# floors 1-2: the paseo above, back of house below, with the ramp up to Halsted
rect(528, 1189, 440, 61, '#ffffff', INK, 2)
a(f'<path d="M528 1303V1250H968V1303Z" fill="#ffffff" stroke="{INK}" stroke-width="2"/>')
a(f'<path d="M625 1303L663 1271H712L755 1250H968V1303Z" fill="{MECH}" stroke="none"/>')
a(f'<path d="M487 1301H571L612 1291H625L663 1271H712L755 1250L1188 1237H1535" fill="none" stroke="{INK}" stroke-width="5" stroke-linejoin="round"/>')
a('</g>')

# ---- labels: one per zone, in the deck's type
a('<g class="labels">')
text(908, 120, 'MECH', 26, 'middle', 600)
text(706, 454, 'OFFICE', 25, 'middle', 600)
text(694, 717, 'AMENITY', 19, 'middle', 600, '#ffffff')
text(694, 841, 'OFFICE', 22, 'middle', 600)
text(908, 1041, 'PARKING /', 20, 'middle', 600, '#ffffff')
text(908, 1064, 'MECH', 20, 'middle', 600, '#ffffff')
text(908, 1121, 'PARKING', 22, 'middle', 600, '#ffffff')
text(748, 1231, 'PASEO', 30, 'middle', 600)
text(852, 1292, 'BACK OF HOUSE', 20, 'middle', 600)
for n, (t, b) in f.items():
    text(1001, (t + b) / 2 + 9, str(n), 24, 'middle', 600)
# elevations, right side
# (labels sit clear of the slide's callout leaders, which run out at y 173, 447, 709 and 1203)
for y, s, sub in ((36, 'T/ SCREEN WALL', '484′-6″'), (200, 'ROOFTOP', '421′-0″'), (1009, 'T/ PARKING', '108′-6″')):
    a(f'<path d="M1040 {y}H1288" stroke="{INK}" stroke-width="2.5"/>')
    if y == 200:
        text(1288, y + 32, f'{s} {sub}', 26, 'end', 600)
    else:
        text(1288, y - 10, s, 28, 'end', 600)
        text(1288, y + 32, sub, 26, 'end', 500)
a(f'<path d="M1040 150H1288" stroke="{INK}" stroke-width="2"/>')
a('</g>')

# ---- callout dots (the slide draws the leaders out from these) and the zoom box
a('<g class="marks">')
for x, y in ((874, 173), (871, 709), (871, 1203)):
    a(f'<circle cx="{x}" cy="{y}" r="9" fill="{INK}"/><path d="M{x} {y}H975" stroke="{INK}" stroke-width="4"/>')
a(f'<path d="M0 550H601" stroke="{INK}" stroke-width="6"/>')
a(f'<rect x="601" y="508" width="82" height="86" rx="12" fill="none" stroke="{INK}" stroke-width="4"/>')
a('</g>')

a('</g></svg>')
print('\n'.join(out))
