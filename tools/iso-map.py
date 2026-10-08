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

  python3 tools/iso-map.py osm.xml[,more.xml...] city.json src/assets/svg/iso-map.svg [gis-dir]
  (The OSM API caps one download, so fetch the wider surroundings as tiles and
  pass them comma-separated.)

  gis-dir   (optional) the Stream GIS map's layers as GeoJSON, for the highlights:
            restaurants, hotels, site, walk, lstations, llines, mstations, mlines
            Web map 13ec007148e2465e9c4c01feffdbdde9 (app 3d12fababd414716a631c254206783e6);
            each layer: <FeatureServer layer>/query?where=1%3D1&outFields=*&outSR=4326&f=geojson

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
GIS = sys.argv[4] if len(sys.argv) > 4 else None

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

# ---------- highlights from the Stream GIS map ----------
from shapely.geometry import shape
def gis(name):
    return json.load(open(f'{GIS}/{name}.geojson'))['features'] if GIS else []
def gm(lon, lat, z=0.0): return S(*m(lon, lat), z)
def lines_d(geom):
    g = shape(geom)
    parts = g.geoms if hasattr(g, 'geoms') else [g]
    out = []
    for ln in parts:
        pts = [gm(x, y) for x, y in ln.coords]
        if any(-50 < a < W + 50 and -50 < b < H + 50 for a, b in pts):
            out.append('M' + 'L'.join(f'{a} {b}' for a, b in pts))
    return ''.join(out)
labels_after = []
KEY = {'neighbors': [], 'restaurants': [], 'hotels': [], 'cta': [], 'metra': [], 'walk': []}   # lists for the slide's map key

# Corporate neighbors (addresses from public lease announcements; positions are the
# buildings' OSM outlines, and the ArcGIS geocoder for 725 W. Randolph, not yet built).
NEIGHBORS = [
    ('McDonald\u2019s HQ', '110 N. Carpenter St.', -87.653994, 41.883710),
    ('WPP', '333 N. Green St.', -87.648034, 41.887695),
    ('BCG', '360 N. Green St.', -87.649379, 41.888696),
    ('John Deere', '800 W. Fulton Market', -87.648153, 41.887118),
    ('Sidley', '725 W. Randolph St. (planned, late 2030)', -87.646692, 41.884185),
]
if GIS:
    walk = gis('walk')
    rings = {}
    for limit in (5, 10):
        u = unary_union([shape(f['geometry']) for f in walk if f['properties']['ToBreak'] <= limit]).buffer(0)
        geoms = u.geoms if hasattr(u, 'geoms') else [u]
        big = max(geoms, key=lambda g: g.area)
        pts = [gm(x, y) for x, y in big.exterior.coords]
        svg.append(f'<path class="walk" data-k="walk-{limit}" d="{path(pts)}"/>')
        KEY['walk'].append({'k': f'walk-{limit}', 'name': f'{limit} min walk', 'street': 'from 357 Green'})
        # 10 min: label at the ring's top; 5 min: at its west (left) edge, clear of the callout
        rings[limit] = min(pts, key=lambda p: p[1]) if limit == 10 else min(pts, key=lambda p: p[0])
    # walking routes from the Metra stations (routes.json: shortest paths on OSM's
    # walkable network, timed at 80 m a minute)
    import os
    routes = json.load(open(f'{GIS}/routes.json')) if os.path.exists(f'{GIS}/routes.json') else {}
    for name, rt in routes.items():
        rk = 'route-' + name.split()[0].lower()
        pts = [gm(x, y) for x, y in rt['path']]
        svg.append(f'<path class="route" data-k="{rk}" d="M{"L".join(f"{a} {b}" for a, b in pts)}"/>')
        # tag at the station, or where the route leaves the map if the station is off it
        inside = [p for p in pts if 40 < p[0] < W - 40 and 90 < p[1] < H - 120]
        ax, ay = inside[0] if inside else pts[-1]
        mins = round(rt['m'] / 80)
        KEY['walk'].append({'k': rk, 'name': f'From {name}', 'street': f'{mins} min walk \u00b7 {rt["m"] / 1000:.1f} km', 'x': ax, 'y': ay})
    METRA = {'UPN': 'Union Pacific North', 'UPNW': 'Union Pacific Northwest', 'UPW': 'Union Pacific West',
             'MDN': 'Milwaukee District North', 'MDW': 'Milwaukee District West', 'NCS': 'North Central Service',
             'BNSF': 'BNSF', 'HC': 'Heritage Corridor', 'ME': 'Metra Electric', 'RID': 'Rock Island', 'SWS': 'SouthWest Service'}
    for f in gis('mlines'):
        code = f['properties']['NAME']
        d = lines_d(f['geometry'])
        if d and code in METRA:
            svg.append(f'<path class="metra" data-k="metra-{code}" d="{d}"/>')
            KEY['metra'].append({'k': f'metra-{code}', 'name': METRA[code]})
    CTA = {'Blue': '#00a1de', 'Green': '#009b3a', 'Pink': '#e27ea6'}
    for colour in ('Blue', 'Green', 'Pink'):
        for f in gis('llines'):
            if f['properties']['COLOR'] == colour:
                d = lines_d(f['geometry'])
                if d:
                    svg.append(f'<path class="cta cta-{colour.lower()}" data-k="cta-{colour.lower()}" stroke="{CTA[colour]}" d="{d}"/>')
                    KEY['cta'].append({'k': f'cta-{colour.lower()}', 'name': f'{colour} Line', 'colour': CTA[colour]})

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

# point highlights sit on top of the model
if GIS:
    ov = ['<g class="ov">']
    gx0, gy0 = gm(*gis('site')[0]['geometry']['coordinates']) if gis('site') else S(gx, gy)
    def delay(a, b): return min(1, math.hypot(a - gx0, b - gy0) / 520)
    def places(layer):
        fs = sorted(gis(layer), key=lambda f: (f['properties']['CONAME'].lower(), f['properties']['STREET'] or ''))
        return [(f, *gm(*f['geometry']['coordinates'][:2])) for f in fs]
    for i, (f, a, b) in enumerate(places('restaurants')):
        p = f['properties']
        ov.append(f'<circle class="rest" data-i="{i}" cx="{a}" cy="{b}" r="3.4" style="--d:{delay(a, b):.2f}"/>')
        KEY['restaurants'].append({'name': p['CONAME'], 'street': p['STREET'], 'x': a, 'y': b})
    roofs = STRtree([b['poly'] for b in blds])
    for i, (name, addr, lon, lat) in enumerate(NEIGHBORS):
        pt = Point(m(lon, lat))
        hit = [blds[j] for j in roofs.query(pt, predicate='within')]
        top = max([b['h'] for b in hit], default=0)
        a, b = gm(lon, lat, top)
        ov.append(f'<g class="nbr" data-i="{i}" style="--d:{delay(a, b):.2f}"><path d="M{a} {b}V{b - 34}"/><rect x="{a - 7}" y="{b - 41}" width="14" height="14" transform="rotate(45 {a} {b - 34})"/></g>')
        KEY['neighbors'].append({'name': name, 'street': addr, 'x': a, 'y': b - 34})
    for i, (f, a, b) in enumerate(places('hotels')):
        p = f['properties']
        ov.append(f'<g class="hotel" data-i="{i}" style="--d:{delay(a, b):.2f}"><path d="M{a} {b}V{b - 30}"/><circle cx="{a}" cy="{b - 30}" r="6.5"/></g>')
        KEY['hotels'].append({'name': p['CONAME'], 'street': p['STREET'], 'x': a, 'y': b - 30})
    LEG = {'BL': ['#00a1de'], 'GR': ['#009b3a', '#e27ea6'], 'PK': ['#e27ea6']}
    def station(a, b, name, cols, cls='l'):
        ring = ''.join(f'<circle cx="{a}" cy="{b - 44}" r="{11 - i * 4}" fill="{c}"/>' for i, c in enumerate(cols))
        return (f'<g class="stn {cls}"><path d="M{a} {b}V{b - 44}"/>{ring}<circle class="hole" cx="{a}" cy="{b - 44}" r="{max(2, 11 - len(cols) * 4)}"/>'
                f'<text x="{a}" y="{b - 64}" text-anchor="middle">{name}</text></g>')
    metra_drawn = False
    NEAR = 1000   # metres from 357 Green
    site_m = m(*gis('site')[0]['geometry']['coordinates'][:2])
    near = lambda x, y: math.dist(m(x, y), site_m) < NEAR
    for f in gis('lstations'):
        x, y = f['geometry']['coordinates'][:2]
        a, b = gm(x, y)
        if near(x, y) and 30 < a < W - 30 and 80 < b < H - 30 and f['properties']['LEGEND'] in LEG:
            name = f['properties']['LONGNAME'].split('/')[0].split('-')[0].upper()
            ov.append(station(a, b, name, LEG[f['properties']['LEGEND']]))
            lines_at = {'BL': 'Blue Line', 'GR': 'Green & Pink Lines', 'PK': 'Pink Line'}[f['properties']['LEGEND']]
            KEY['cta'].insert(0, {'name': f"{name.title()} station", 'street': lines_at, 'x': a, 'y': b - 44})
    for f in gis('mstations'):
        c = f['geometry']['coordinates']; x, y = (c[0] if isinstance(c[0], list) else c)[:2]
        a, b = gm(x, y)
        if near(x, y) and 30 < a < W - 30 and 80 < b < H - 30:
            name = f['properties']['LONGNAME'].replace(' Transportation Center', '').upper()
            metra_drawn = True
            ov.append(f'<g class="stn m"><path d="M{a} {b}V{b - 44}"/><rect x="{a - 9}" y="{b - 53}" width="18" height="18" rx="2"/>'
                      f'<text x="{a}" y="{b - 64}" text-anchor="middle">{name}</text></g>')
    for limit, (a, b) in rings.items():
        anchor = 'middle' if limit == 10 else 'start'
        ov.append(f'<text class="walk-lbl" x="{a + (0 if limit == 10 else 8)}" y="{b - 10}" text-anchor="{anchor}">{limit} MIN WALK</text>')
    ov.append('</g>')
    svg.extend(ov)
    # legend, bottom left (only when the SVG is used on its own; the slide has a map key)
    lx, ly = 32, H - 230
    rows_off = True
    rows = [('<circle class="rest" cx="9" cy="0" r="4.5"/>', 'Restaurants (148)'),
            ('<g class="hotel"><circle cx="9" cy="0" r="6.5"/></g>', 'Hotels (12)'),
            ('<circle cx="9" cy="0" r="8" fill="#009b3a"/><circle cx="9" cy="0" r="4" fill="#e27ea6"/><circle class="hole" cx="9" cy="0" r="2"/>', 'CTA \u2018L\u2019 station'),
            ('<rect class="m" x="1" y="-8" width="16" height="16" rx="2"/>', 'Metra station') if metra_drawn
            else ('<path class="metra" d="M0 0H18"/>', 'Metra lines'),
            ('<path class="walk" d="M0 0H18"/>', '5 and 10 min walk')]
    leg = [f'<g class="legend" transform="translate({lx} {ly})">']
    for i, (mark, text) in enumerate(rows):
        leg.append(f'<g transform="translate(0 {i * 30})">{mark}<text x="30" y="0" dominant-baseline="middle">{text}</text></g>')
    leg.append('</g>')
    if not rows_off: svg.extend(leg)

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
CALL = 150 if GIS else 78   # clears the station pins near the site
svg.append(f'<g class="callout"><circle cx="{tx}" cy="{ty}" r="5"/><path d="M{tx} {ty}V{ty - CALL}"/>'
           f'<text x="{tx}" y="{ty - CALL - 14}" text-anchor="middle">357 GREEN</text></g>')
# north arrow and credit
nx_, ny_ = P(0, 1); nl = math.hypot(nx_, ny_); ux, uy = nx_ / nl, ny_ / nl
cx0, cy0 = (W - 180, H - 60) if GIS else (70, H - 100)   # clear of the legend and the deck's arrows
svg.append(f'<g class="north"><path d="M{cx0 - ux * 22:.0f} {cy0 - uy * 22:.0f}L{cx0 + ux * 22:.0f} {cy0 + uy * 22:.0f}"/>'
           f'<path class="head" d="M{cx0 + ux * 26:.0f} {cy0 + uy * 26:.0f}L{cx0 + ux * 12 - uy * 7:.0f} {cy0 + uy * 12 + ux * 7:.0f}L{cx0 + ux * 12 + uy * 7:.0f} {cy0 + uy * 12 - ux * 7:.0f}Z"/>'
           f'<text x="{cx0 + ux * 44:.0f}" y="{cy0 + uy * 44:.0f}" text-anchor="middle" dominant-baseline="middle">N</text></g>')
svg.append(f'<text class="credit" x="{W / 2:.0f}" y="{H - 22}" text-anchor="middle">Map data © OpenStreetMap contributors · City of Chicago</text>')
svg.append('</svg>')
open(OUT, 'w').write('\n'.join(svg))
if GIS: json.dump(KEY, open(OUT.replace('.svg', '-key.json'), 'w'), indent=0, ensure_ascii=False)
print(len(items), 'buildings drawn,', sum(t[2] for t in items), 'inside;', fallback, 'without any height (2 storeys)')
print(anchors)
