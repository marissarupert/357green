# Redraw the lobby and second-floor plans as crisp vector art.
#
# The only sources are ~1,200 px screenshots (tools/plan-sources/), which blur
# when a screen scales them up. This snaps each pixel to the deck's palette
# (the legend colours), traces every colour layer into smooth curves with
# potrace and writes public/assets/plans/<name>.svg. The labels and level tags
# are erased from the source first: the slide sets them as live text instead
# (see `labels` on the floor-plan slides in src/content.js).
#
#   pip install potracer opencv-python-headless
#   python3 tools/vectorize-plans.py            # both plans, ~5 min each
import sys, pathlib, cv2, numpy as np, potrace

ROOT = pathlib.Path(__file__).resolve().parent.parent
SCALE = 3  # trace at 3x for smooth curves

# (layer, colours sampled from the screenshots, colour drawn), light to dark.
PALETTE = [
    ('paper',   ['#f9f9fa', '#f6f6f6', '#fdfdfd'],               '#fafafa'),
    ('light',   ['#ebebec'],                                     '#ececee'),
    ('ground',  ['#dfdfe1', '#dedfe2'],                          '#e0e1e3'),
    ('road',    ['#d4d5d7', '#d3d6d8'],                          '#d3d5d8'),
    ('blue',    ['#c1c9d0', '#bac9d6'],                          '#bccad5'),
    ('context', ['#b9b9bd', '#bfc0c4', '#a7a8ad', '#a9abb1'],     '#b3b5ba'),
    ('copper',  ['#b27557', '#b47658', '#946653'],               '#b77859'),
    ('service', ['#8c9797', '#8b9697'],                          '#8d9899'),
    ('slate',   ['#7d8187', '#6b6f76', '#74797e'],               '#73787e'),
    ('brown',   ['#625a5b', '#625859'],                          '#665b56'),
    ('ink',     ['#24232f', '#2b2a34', '#474349'],               '#26252e'),
]

# Source-pixel boxes [x0, y0, x1, y1] of text to erase (re-set as live text),
# and of level tags (erased whole: marker and figure).
PLANS = {
    'lobby': {
        'text': [[594, 89, 763, 109], [1120, 131, 1150, 415], [191, 485, 210, 656], [387, 312, 451, 329],
                 [381, 339, 454, 355], [392, 557, 447, 570], [529, 721, 560, 737], [505, 743, 579, 762],
                 [804, 672, 867, 690], [822, 749, 911, 769], [709, 774, 748, 788]],
        'tags': [[298, 634, 362, 656], [484, 836, 546, 860], [574, 856, 636, 880]],
    },
    'second-floor': {
        'text': [[282, 34, 417, 55], [367, 128, 466, 150], [368, 157, 465, 179], [356, 445, 486, 455],
                 [125, 339, 149, 542], [1240, 285, 1251, 520]],
        'tags': [[262, 508, 328, 532], [1062, 566, 1126, 590], [822, 606, 886, 630], [707, 656, 771, 680],
                 [612, 738, 676, 762], [482, 748, 546, 772]],
    },
}

hexrgb = lambda h: [int(h[i:i + 2], 16) for i in (1, 3, 5)]
to_lab = lambda rgb: cv2.cvtColor(np.uint8([[rgb]]), cv2.COLOR_RGB2LAB).reshape(3).astype(float)


def erase(img, boxes, whole):
    """Paint over boxes from their surroundings (whole box, or just the dark strokes)."""
    mask = np.zeros(img.shape[:2], np.uint8)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    for x0, y0, x1, y1 in boxes:
        x0, y0, x1, y1 = x0 - 3, y0 - 3, x1 + 4, y1 + 4
        if whole:
            mask[y0:y1, x0:x1] = 255
        else:
            local = gray[y0:y1, x0:x1]
            mask[y0:y1, x0:x1] = np.where(local < np.median(local) - 25, 255, 0)
    mask = cv2.dilate(mask, np.ones((3, 3), np.uint8), iterations=2)
    return cv2.inpaint(img, mask, 5, cv2.INPAINT_TELEA)


def classify(img):
    rgb = cv2.resize(img, None, fx=SCALE, fy=SCALE, interpolation=cv2.INTER_CUBIC)[:, :, ::-1]
    rgb = cv2.bilateralFilter(np.ascontiguousarray(rgb), 9, 30, 9)
    lab = cv2.cvtColor(rgb, cv2.COLOR_RGB2LAB).reshape(-1, 3).astype(float)
    best, cls = np.full(len(lab), np.inf), np.zeros(len(lab), np.uint8)
    for i, (_, samples, _) in enumerate(PALETTE):
        for s in samples:
            d = ((lab - to_lab(hexrgb(s))) ** 2).sum(1)
            m = d < best
            best[m], cls[m] = d[m], i
    return cv2.medianBlur(cls.reshape(rgb.shape[:2]), 5)


def path_data(curves):
    f = lambda p: f'{p.x / SCALE:.1f} {p.y / SCALE:.1f}'
    out = []
    for c in curves:
        d = ['M' + f(c.start_point)]
        for s in c.segments:
            d.append(f'L{f(s.c)}L{f(s.end_point)}' if s.is_corner else f'C{f(s.c1)} {f(s.c2)} {f(s.end_point)}')
        out.append(''.join(d) + 'Z')
    return ''.join(out)


def build(name):
    spec = PLANS[name]
    img = cv2.imread(str(ROOT / 'tools/plan-sources' / f'{name}.jpg'))
    img = erase(img, spec['tags'], whole=True)
    img = erase(img, spec['text'], whole=False)
    cls = classify(img)
    h, w = img.shape[:2]
    parts = [f'<rect width="{w}" height="{h}" fill="{PALETTE[0][2]}"/>']
    for i, (layer, _, fill) in enumerate(PALETTE[1:], 1):
        # Stack light to dark: each layer also covers every darker one, so
        # neighbouring shapes overlap instead of leaving hairline gaps.
        mask = cls == i if layer == 'ink' else cls >= i
        curves = potrace.Bitmap(~mask).trace(turdsize=6 * SCALE * SCALE, alphamax=1.0, opticurve=True, opttolerance=0.4)
        parts.append(f'<path fill="{fill}" fill-rule="evenodd" d="{path_data(curves)}"/>')
        print(name, layer, flush=True)
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">{"".join(parts)}</svg>\n'
    out = ROOT / 'public/assets/plans' / f'{name}.svg'
    out.write_text(svg)
    print('wrote', out, len(svg) // 1024, 'KB')


for n in sys.argv[1:] or PLANS:
    build(n)
