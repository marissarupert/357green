"""Isometric massing map of the area around 357 Green -> src/assets/svg/iso-map.svg

Bounded by Grand Avenue (north), the Kennedy Expressway (east), Washington
Boulevard (south) and Ogden Avenue (west). Buildings inside the boundary are
drawn as a white massing model; those just outside are drawn faintly for
context. 357 Green itself is modelled from the deck's own plans and stats.

Sources (fetch these, then run with the three paths):
  osm.xml   OpenStreetMap (c) OpenStreetMap contributors, ODbL:
            https://api.openstreetmap.org/api/0.6/map?bbox=-87.6700,41.8820,-87.6400,41.8935
  city.json City of Chicago Building Footprints (2015 snapshot), used only for
            the number of stories where OSM has no height:
            https://data.cityofchicago.org/resource/syp8-uezg.geojson?$where=within_box(the_geom,41.8935,-87.6700,41.8820,-87.6400)&$limit=20000

  python3 tools/iso-map.py osm.xml[,more.xml...] city.json src/assets/svg/iso-map.svg
  (The OSM API caps one download, so fetch the wider surroundings as tiles and
  pass them comma-separated.)

357 Green massing (approximate, from the deck):
  podium     ground-floor outline (public/assets/plans/lobby.jpg) to the top of
             the parking levels (floor 7)
  low rise   floors 8-15, 34,600 SF plate (testfit plans, thin outline)
  high rise  floors 16-30, 29,500 SF plate (testfit plans, thick outline)
  Office floors 13'3" slab to slab.
"""
import json, math, sys
import xml.etree.ElementTree as ET
from shapely.geometry import Polygon, LineString, Point, MultiPolygon
from shapely.geometry.polygon import orient
from shapely.ops import unary_union, polygonize, transform
from shapely.strtree import STRtree

OSM, CITY, OUT = sys.argv[1:4]

LAT0, LON0 = 41.8875, -87.6550
MX = 111320 * math.cos(math.radians(LAT0))
MY = 111132
def m(lon, lat): return ((lon - LON0) * MX, (lat - LAT0) * MY)
def geo(x, y): return (LON0 + x / MX, LAT0 + y / MY)

# ---------- read OSM ----------
roots = [ET.parse(f).getroot() for f in OSM.split(',')]
nodes = {n.get('id'): m(float(n.get('lon')), float(n.get('lat'))) for root in roots for n in root.iter('node')}
ways, relations = {}, {}
for root in roots:
    for w in root.iter('way'):
        tags = {t.get('k'): t.get('v') for t in w.findall('tag')}
        ways[w.get('id')] = (tags, [nodes[r.get('ref')] for r in w.findall('nd') if r.get('ref') in nodes])
    for r in root.iter('relation'): relations[r.get('id')] = r

def num(v):
    try: return float(str(v).split(';')[0].replace('m', '').strip())
    except (TypeError, ValueError): return None

LEVEL = 3.6  # metres per storey when only a level count is known

def heights(tags):
    h = num(tags.get('height'))
    lv = num(tags.get('building:levels'))
    if h is None and lv is not None: h = lv * LEVEL
    base = num(tags.get('min_height'))
    if base is None and num(tags.get('building:min_level')) is not None: base = num(tags.get('building:min_level')) * LEVEL
    return h, base or 0.0

blds = []
for wid, (tags, pts) in ways.items():
    if ('building' in tags or 'building:part' in tags) and len(pts) >= 4:
        p = Polygon(pts)
        if not p.is_valid: p = p.buffer(0)
        if p.is_empty or p.area < 12: continue
        h, base = heights(tags)
        blds.append({'poly': p, 'h': h, 'base': base, 'part': 'building:part' in tags and 'building' not in tags, 'tags': tags})
for r in relations.values():
    tags = {t.get('k'): t.get('v') for t in r.findall('tag')}
    if 'building' not in tags and 'building:part' not in tags: continue
    outers = [Polygon(ways[x.get('ref')][1]) for x in r.findall('member')
              if x.get('type') == 'way' and x.get('role') == 'outer' and x.get('ref') in ways and len(ways[x.get('ref')][1]) >= 4]
    if not outers: continue
    p = unary_union([o.buffer(0) for o in outers])
    h, base = heights(tags)
    for g in (p.geoms if isinstance(p, MultiPolygon) else [p]):
        blds.append({'poly': g, 'h': h, 'base': base, 'part': 'building' not in tags, 'tags': tags})

# An outline that has building:parts inside it is drawn by its parts.
parts = [b for b in blds if b['part']]
ptree = STRtree([b['poly'].representative_point() for b in parts])
keep = []
for b in blds:
    if not b['part'] and len(ptree.query(b['poly'], predicate='contains')): continue
    keep.append(b)
blds = keep

# Missing heights: City of Chicago stories, else two storeys.
city = json.load(open(CITY))['features']
cpolys, cstories = [], []
for f in city:
    st = num(f['properties'].get('stories')) or num(f['properties'].get('no_stories'))
    if not st: continue
    g = f['geometry']
    rings = [g['coordinates'][0]] if g['type'] == 'Polygon' else [pp[0] for pp in g['coordinates']]
    for ring in rings:
        cp = Polygon([m(*c[:2]) for c in ring])
        if cp.is_valid and cp.area > 5: cpolys.append(cp); cstories.append(st)
ctree = STRtree(cpolys)
fallback = 0
for b in blds:
    if b['h'] is None:
        hits = ctree.query(b['poly'].representative_point(), predicate='within')
        if len(hits): b['h'] = max(cstories[i] for i in hits) * LEVEL
        else: b['h'] = 2 * LEVEL; fallback += 1
    b['h'] = max(b['h'], b['base'] + 3)

# ---------- boundary ----------
def lines(match):
    out = []
    for tags, pts in ways.values():
        if 'highway' in tags and len(pts) > 1 and match(tags): out.append(LineString(pts))
    return out
named = lambda n: (lambda t: t.get('name', '').endswith(n) and t.get('highway') not in ('footway', 'cycleway', 'service', 'path'))
kennedy = lambda t: t.get('highway') == 'motorway' and ('I 90' in t.get('ref', '') or 'I 94' in t.get('ref', ''))
B = {'Grand Avenue': lines(named('Grand Avenue')), 'Washington Boulevard': lines(named('Washington Boulevard')),
     'Ogden Avenue': lines(named('Ogden Avenue')), 'Kennedy Expressway': lines(kennedy)}
site_pt = Point(m(-87.6482, 41.8884))
faces = list(polygonize(unary_union([l for ls in B.values() for l in ls])))
area = next(f for f in faces if f.contains(site_pt))
area = orient(area.buffer(0))   # (357 Green is added below: the expressway runs along its edge)
print('area', round(area.area / 1e6, 3), 'km2')

# ---------- 357 Green ----------
# Ground-floor plan (lobby.jpg, 2000px-wide coordinates). Green and Halsted
# centrelines and the Kinzie centreline georeference it; north is up.
def cl(name, axis, at):
    best = None
    for l in B.get(name) or lines(named(name)):
        for (x1, y1), (x2, y2) in zip(l.coords[:-1], l.coords[1:]):
            lo, hi = sorted((y1, y2) if axis == 'x' else (x1, x2))
            if lo <= at <= hi:
                t = (at - (y1 if axis == 'x' else x1)) / (((y2 - y1) if axis == 'x' else (x2 - x1)) or 1)
                v = x1 + t * (x2 - x1) if axis == 'x' else y1 + t * (y2 - y1)
                best = v if best is None else (best + v) / 2
    return best
sy0 = site_pt.y
green_x, halsted_x = cl('Green Street', 'x', sy0), cl('Halsted Street', 'x', sy0)
kinzie_y = cl('Kinzie Street', 'y', site_pt.x)
PX_GREEN, PX_HALSTED, PY_KINZIE = 318, 1845, 132
s = (halsted_x - green_x) / (PX_HALSTED - PX_GREEN)
plan = lambda px, py: (green_x + (px - PX_GREEN) * s, kinzie_y - (py - PY_KINZIE) * s)
podium = Polygon([plan(*p) for p in [(485, 378), (810, 378), (835, 395), (880, 640), (1100, 1060), (1355, 1050),
                                       (1525, 1295), (1665, 1295), (1665, 1620), (920, 1610), (1000, 1265), (830, 1300), (485, 775)]])
print('357 podium', round(podium.area * 10.764), 'SF', 'plan scale', round(s, 4), 'm/px')
# Typical floor plates (testfit-highrise-open.jpg coordinates), scaled to the stated areas and
# anchored at the north-west corner of the ground-floor outline.
def plate(pts, sf):
    raw = Polygon(pts)
    k = math.sqrt(sf / 10.764 / raw.area)
    ox, oy = plan(485, 378)
    return Polygon([(ox + (x - pts[0][0]) * k, oy - (y - pts[0][1]) * k) for x, y in pts])
high = plate([(10, 10), (300, 10), (345, 22), (390, 55), (820, 655), (705, 868), (440, 868), (400, 845), (380, 815), (130, 318), (10, 318)], 29500)
low = plate([(10, 10), (300, 10), (345, 22), (390, 55), (820, 655), (905, 975), (600, 975), (520, 950), (440, 900), (10, 330)], 34600)
FL = 13.25 * 0.3048
podium_top = 7 * 4.0
low_top = podium_top + 8 * FL
high_top = low_top + 15 * FL
green = [(podium, 0, podium_top), (low, podium_top, low_top), (high, low_top, high_top)]
print('357 height', round(high_top), 'm')
area = orient(unary_union([area, podium.buffer(4, join_style=2)]).buffer(0))
# Drop anything OSM has on the site (surface parking today).
blds = [b for b in blds if not podium.contains(b['poly'].representative_point())]

# ---------- projection ----------
# True isometric, looking north-east from the south-west: the street grid runs
# at 30 degrees, the Loop rises at the back right.
C30, S30 = math.cos(math.radians(30)), 0.5
R = 0.0
VD = (math.cos(math.radians(45) - R), math.sin(math.radians(45) - R))   # viewing direction on the ground
def P(x, y, z=0.0):
    x, y = x * math.cos(R) - y * math.sin(R), x * math.sin(R) + y * math.cos(R)
    return ((x - y) * C30, -(x + y) * S30 - z)
pts = [P(x, y) for x, y in area.exterior.coords] + [P(x, y, 150) for x, y in area.exterior.coords]
minx = min(p[0] for p in pts); maxx = max(p[0] for p in pts); miny = min(p[1] for p in pts); maxy = max(p[1] for p in pts)
W, H = 914, 1080                 # the Location slide's map panel
box = (30, 300, 884, 860)        # where the boundary area sits in it (the city fills the rest)
k = min((box[2] - box[0]) / (maxx - minx), (box[3] - box[1]) / (maxy - miny))
ox = box[0] + ((box[2] - box[0]) - (maxx - minx) * k) / 2 - minx * k
oy = box[1] + ((box[3] - box[1]) - (maxy - miny) * k) / 2 - miny * k
def S(x, y, z=0.0):
    a, b = P(x, y, z); return (round(a * k + ox), round(b * k + oy))
def path(ptsl): return 'M' + 'L'.join(f'{a} {b}' for a, b in ptsl) + 'Z'
view = Polygon([(0, 0), (W, 0), (W, H), (0, H)]).buffer(60)
def onstage(poly):
    return view.intersects(Polygon([S(x, y) for x, y in poly.exterior.coords]))

# ---------- draw ----------
def shade(n, lit, mid, dark):
    # light from the south-south-west; n is the wall's outward normal
    L = (-0.45, -0.89); d = (n[0] * L[0] + n[1] * L[1])
    return lit if d > 0.55 else mid if d > 0.1 else dark

def prism(poly, z0, z1, col, tol=0.6):
    poly = orient(poly.simplify(tol))
    walls = []
    cs = list(poly.exterior.coords)
    for (x1, y1), (x2, y2) in zip(cs[:-1], cs[1:]):
        dx, dy = x2 - x1, y2 - y1; ln = math.hypot(dx, dy)
        if ln < 0.3: continue
        n = (dy / ln, -dx / ln)
        if n[0] * VD[0] + n[1] * VD[1] >= 0: continue    # faces away from the viewer
        depth = -((x1 + x2) / 2 * VD[0] + (y1 + y2) / 2 * VD[1])
        walls.append((depth, shade(n, *col[1:]) if len(col) == 4 else col[1], path([S(x1, y1, z0), S(x2, y2, z0), S(x2, y2, z1), S(x1, y1, z1)])))
    walls.sort()
    by = {}
    for _, c, d in walls: by.setdefault(c, []).append(d)
    if len(col) == 2:   # context: one wall tone
        by = {col[1]: [d for ds in by.values() for d in ds]}
    out = [f'<path fill="{c}" d="{"".join(ds)}"/>' for c, ds in by.items()]
    out.append(f'<path class="roof" fill="{col[0]}" d="{path([S(x, y, z1) for x, y in poly.exterior.coords[:-1]])}"/>')
    return out

IN = ('#eef1f5', '#c3cad4', '#a3abb8', '#8a93a2')     # roof, lit wall, mid wall, dark wall
OUT_ = ('#34374a', '#2a2c3e')
CU = ('#c9784c', '#a5552f', '#8f4826', '#783b1e')

items = []
for b in blds:
    p = b['poly']
    if not onstage(p): continue
    inside = area.contains(p.representative_point())
    if not inside and p.area < 60 and b['h'] < 12: continue
    c = p.centroid
    items.append((-(c.x * VD[0] + c.y * VD[1]), b['base'], inside,
                  prism(p, b['base'], b['h'], IN) if inside else prism(p, b['base'], b['h'], OUT_, 1.5), (c.x, c.y)))
items.sort(key=lambda t: (t[0], t[1]))

# delay for the rise animation: distance from 357 Green, so buildings ripple outward
far = max(math.hypot(t[4][0] - site_pt.x, t[4][1] - site_pt.y) for t in items if t[2])

svg = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" class="iso-map" role="img" aria-label="Isometric map of the blocks bounded by Grand Avenue, the Kennedy Expressway, Washington Boulevard and Ogden Avenue, with 357 Green at Green and Kinzie">']
# ground: the boundary area and the street network
svg.append(f'<path class="area" d="{path([S(x, y) for x, y in area.exterior.coords[:-1]])}"/>')
street_d = []
for tags, ptsl in ways.values():
    if tags.get('highway') in ('motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'residential', 'unclassified', 'motorway_link') and len(ptsl) > 1:
        street_d.append('M' + 'L'.join(f'{a} {b}' for a, b in (S(x, y) for x, y in ptsl)))
svg.append(f'<path class="streets" d="{"".join(street_d)}"/>')
xway = ['M' + 'L'.join(f'{a} {b}' for a, b in (S(x, y) for x, y in l.coords)) for l in B['Kennedy Expressway']]
svg.append(f'<path class="xway" d="{"".join(xway)}"/>')
edge = [S(x, y) for x, y in area.exterior.coords]
svg.append(f'<path class="edge" d="M{"L".join(f"{a} {b}" for a, b in edge)}"/>')

placed = False
gx, gy = site_pt.x, site_pt.y
for depth, base, inside, parts_svg, (cx, cy) in items:
    if not placed and depth > -(gx * VD[0] + gy * VD[1]):
        svg.append('<g class="b357">' + ''.join(sum((prism(pp, z0, z1, CU) for pp, z0, z1 in green), [])) + '</g>')
        placed = True
    d = min(1, math.hypot(cx - gx, cy - gy) / far)
    cls = 'b in' if inside else 'b out'
    svg.append(f'<g class="{cls}" style="--d:{d:.2f}">' + ''.join(parts_svg) + '</g>')
if not placed:
    svg.append('<g class="b357">' + ''.join(sum((prism(pp, z0, z1, CU) for pp, z0, z1 in green), [])) + '</g>')

# label anchors (stage px) for the slide to place HTML labels
def mid(ls):
    u = unary_union(ls).intersection(area.buffer(30))
    u = max(u.geoms, key=lambda g: g.length) if hasattr(u, 'geoms') else u
    p = u.interpolate(0.5, normalized=True)
    return S(p.x, p.y)
anchors = {n: mid(ls) for n, ls in B.items()}
top = high.representative_point()
anchors['357 Green'] = S(top.x, top.y, high_top)

# street labels along the boundary, set at the iso angle of the edge they name
ac = area.centroid
acs = S(ac.x, ac.y)
ring = list(area.exterior.coords)
edges = []
for (x1, y1), (x2, y2) in zip(ring[:-1], ring[1:]):
    mpt = Point((x1 + x2) / 2, (y1 + y2) / 2)
    name = min(B, key=lambda n: min(l.distance(mpt) for l in B[n]))
    if min(l.distance(mpt) for l in B[name]) < 40: edges.append((name, (x1, y1), (x2, y2)))
LABEL = {'Grand Avenue': 'GRAND AVE', 'Washington Boulevard': 'WASHINGTON BLVD', 'Ogden Avenue': 'OGDEN AVE', 'Kennedy Expressway': 'KENNEDY EXPY'}
for name, text in LABEL.items():
    es = [e for e in edges if e[0] == name]
    if not es: continue
    # the stretch of this street's boundary that shows best: the longest on screen
    _, a, b = max(es, key=lambda e: math.dist(S(*e[1]), S(*e[2])))
    (sx1, sy1), (sx2, sy2) = S(*a), S(*b)
    ang = math.degrees(math.atan2(sy2 - sy1, sx2 - sx1))
    if ang > 90: ang -= 180
    if ang < -90: ang += 180
    mx, my = (sx1 + sx2) / 2, (sy1 + sy2) / 2
    nx, ny = mx - acs[0], my - acs[1]; nl = math.hypot(nx, ny) or 1
    lx, ly = mx + nx / nl * 22, my + ny / nl * 22
    svg.append(f'<text class="lbl" x="{lx:.0f}" y="{ly:.0f}" transform="rotate({ang:.1f} {lx:.0f} {ly:.0f})" text-anchor="middle" dominant-baseline="middle">{text}</text>')

# 357 Green callout
tx, ty = S(*high.representative_point().coords[0], high_top)
svg.append(f'<g class="callout"><circle cx="{tx}" cy="{ty}" r="5"/><path d="M{tx} {ty}V{ty - 78}"/>'
           f'<text x="{tx}" y="{ty - 92}" text-anchor="middle">357 GREEN</text></g>')
# north arrow and credit
nx_, ny_ = P(0, 1); nl = math.hypot(nx_, ny_); ux, uy = nx_ / nl, ny_ / nl
cx0, cy0 = 70, H - 100   # bottom left: the deck's arrows sit bottom right
svg.append(f'<g class="north"><path d="M{cx0 - ux * 22:.0f} {cy0 - uy * 22:.0f}L{cx0 + ux * 22:.0f} {cy0 + uy * 22:.0f}"/>'
           f'<path class="head" d="M{cx0 + ux * 26:.0f} {cy0 + uy * 26:.0f}L{cx0 + ux * 12 - uy * 7:.0f} {cy0 + uy * 12 + ux * 7:.0f}L{cx0 + ux * 12 + uy * 7:.0f} {cy0 + uy * 12 - ux * 7:.0f}Z"/>'
           f'<text x="{cx0 + ux * 44:.0f}" y="{cy0 + uy * 44:.0f}" text-anchor="middle" dominant-baseline="middle">N</text></g>')
svg.append(f'<text class="credit" x="24" y="{H - 22}">Map data © OpenStreetMap contributors · City of Chicago</text>')
svg.append('</svg>')
open(OUT, 'w').write('\n'.join(svg))
json.dump(anchors, open(OUT.replace('.svg', '.json'), 'w'), indent=1)
print(len(items), 'buildings drawn,', sum(t[2] for t in items), 'inside;', fallback, 'without any height (2 storeys)')
print(anchors)
