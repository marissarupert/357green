"""Builds the podium axo SVG and splices it into ../index.html.

Every coordinate is a point traced from the SCB "podium circulation" sheet
(DPD intake, 09.08.2026, p.22) rendered at 110 dpi, so the drawing keeps the
original camera angle. Prisms are given as a roof polygon plus a drop (px) per
vertex; side faces that face the viewer are generated from that.

    python3 floor-plans/tools/build_podium.py
"""
import pathlib
import re

HTML = pathlib.Path(__file__).resolve().parent.parent / "index.html"
START, END = "<!-- axo:podium:start -->", "<!-- axo:podium:end -->"


def fmt(pts):
    return " ".join(f"{x:g},{y:g}" for x, y in pts)


def poly(pts, cls, extra=""):
    return f'<polygon class="{cls}" points="{fmt(pts)}"{extra}/>'


def area(pts):
    return sum(x1 * y2 - x2 * y1 for (x1, y1), (x2, y2) in zip(pts, pts[1:] + pts[:1])) / 2


def prism(top, drop, face="face", roof="roof", floor_lines=(), mullion=0):
    """Visible walls (back to front) then the roof. drop: px per vertex or one number."""
    n = len(top)
    if not isinstance(drop, (list, tuple)):
        drop = [drop] * n
    base = [(x, y + d) for (x, y), d in zip(top, drop)]
    sign = 1 if area(top) > 0 else -1
    walls = []
    for i in range(n):
        j = (i + 1) % n
        (x1, y1), (x2, y2) = top[i], top[j]
        # outward normal in screen space; a wall is seen when it points down
        nx, ny = (y2 - y1) * sign, -(x2 - x1) * sign
        if ny <= 0:
            continue
        quad = [top[i], top[j], base[j], base[i]]
        out = [poly(quad, face)]
        for f in floor_lines:
            a = (x1, y1 + drop[i] * f)
            b = (x2, y2 + drop[j] * f)
            out.append(f'<line class="detail" x1="{a[0]:g}" y1="{a[1]:g}" x2="{b[0]:g}" y2="{b[1]:g}"/>')
        if mullion:
            length = ((x2 - x1) ** 2 + (y2 - y1) ** 2) ** 0.5
            k = int(length // mullion)
            for m in range(1, k):
                t = m / k
                x, y = x1 + (x2 - x1) * t, y1 + (y2 - y1) * t
                d = drop[i] + (drop[j] - drop[i]) * t
                out.append(f'<line class="mullion" x1="{x:.1f}" y1="{y:.1f}" x2="{x:.1f}" y2="{y + d:.1f}"/>')
        walls.append((max(y1, y2), "".join(out)))
    walls.sort()
    return "".join(w for _, w in walls) + poly(top, roof), base


def steps(front_a, front_b, count, back, rise, cls):
    """A flight from front edge a-b climbing `count` steps; back = (dx, dy) per step."""
    out = []
    (ax, ay), (bx, by) = front_a, front_b
    bx_, by_ = back
    treads = []
    for i in range(count):
        # riser i stands on tread i-1 (or the floor) and lifts by `rise`
        ox, oy = bx_ * i, by_ * i - rise * i
        a0, b0 = (ax + ox, ay + oy), (bx + ox, by + oy)
        a1, b1 = (a0[0], a0[1] - rise), (b0[0], b0[1] - rise)
        a2, b2 = (a1[0] + bx_, a1[1] + by_), (b1[0] + bx_, b1[1] + by_)
        treads.append((poly([a0, b0, b1, a1], f"{cls}-riser"), poly([a1, b1, b2, a2], f"{cls}-tread")))
    # back to front so lower steps sit in front
    for riser, tread in reversed(treads):
        out.append(riser + tread)
    # stepped profile on the open west end
    prof = [(ax, ay)]
    for i in range(count):
        x, y = prof[-1]
        prof.append((x, y - rise))
        prof.append((x + bx_, y - rise + by_))
    prof.append((prof[-1][0], ay + by_ * count))
    out.append(poly(prof, f"{cls}-cheek"))
    top_a = (ax + bx_ * count, ay + by_ * count - rise * count)
    top_b = (bx + bx_ * count, by + by_ * count - rise * count)
    return "".join(out), top_a, top_b


def label(x, y, key, cls="lbl", rot=0, anchor="middle"):
    t = f' transform="rotate({rot:g} {x:g} {y:g})"' if rot else ""
    return (f'<text class="{cls}" x="{x:g}" y="{y:g}" text-anchor="{anchor}"{t} '
            f'data-copy="{key}">{key.split(".")[-1].replace("_", " ")}</text>')


def arrow(p, q, name):
    """Double route arrow: head at p (outside), tick at q (building)."""
    (x1, y1), (x2, y2) = p, q
    dx, dy = x1 - x2, y1 - y2
    L = (dx * dx + dy * dy) ** 0.5
    ux, uy = dx / L, dy / L
    nx, ny = -uy, ux
    h, w, t = 16, 6, 8
    head = [(x1, y1), (x1 - ux * h + nx * w, y1 - uy * h + ny * w), (x1 - ux * h - nx * w, y1 - uy * h - ny * w)]
    return (f'<g id="{name}"><line class="arrow" x1="{x2:g}" y1="{y2:g}" x2="{x1 - ux * h:.1f}" y2="{y1 - uy * h:.1f}"/>'
            f'{poly(head, "arrowhead")}'
            f'<line class="arrow" x1="{x2 + nx * t:.1f}" y1="{y2 + ny * t:.1f}" x2="{x2 - nx * t:.1f}" y2="{y2 - ny * t:.1f}"/></g>')


def build():
    g = []

    # ---------------------------------------------------------------- context
    c = []
    c.append('<rect class="ground" x="100" y="148" width="1670" height="954"/>')
    # n green st (+0'): property line, two curbs
    c.append('<g id="n_green_st">'
             + poly([(100, 700), (1770, 1034), (1770, 1102), (100, 1102)], "street")
             + '<line class="curb" x1="100" y1="676" x2="1770" y2="1010"/>'
             + '<line class="curb" x1="100" y1="700" x2="1770" y2="1034"/>'
             + '<line class="curb" x1="100" y1="850" x2="1270" y2="1084"/>'
             + '<line class="lane" x1="100" y1="775" x2="1730" y2="1101"/>'
             + label(500, 872, "context.n_green_st", "lbl-ctx", 11.3) + '</g>')
    # w kinzie st, running under the viaduct
    c.append('<g id="w_kinzie_st">'
             + poly([(100, 520), (560, 205), (700, 205), (220, 690), (100, 690)], "street")
             + '<line class="curb" x1="100" y1="520" x2="560" y2="205"/>'
             + '<line class="curb" x1="220" y1="690" x2="700" y2="205"/>'
             + '<line class="lane" x1="160" y1="605" x2="630" y2="205"/>'
             + label(255, 622, "context.w_kinzie_st", "lbl-ctx", -43) + '</g>')
    # union pacific tracks below the viaduct
    c.append('<g id="rail">'
             + "".join(f'<path class="lane" d="M{x},{148} C{x - 10},{500} {x - 40},{800} {x - 90},{1102}"/>'
                       for x in (1340, 1370, 1400, 1430))
             + '</g>')
    # n halsted st viaduct (+25')
    deck = [(100, 148), (1770, 148), (1770, 262), (1500, 348), (1440, 345), (1000, 298), (560, 248), (100, 205)]
    fascia = [(100, 205), (560, 248), (1000, 298), (1440, 345), (1500, 348), (1500, 366), (1440, 363), (1000, 316),
              (560, 266), (100, 223)]
    c.append('<g id="n_halsted_st_viaduct">'
             + poly([(848, 312), (870, 314), (870, 360), (848, 358)], "mass")
             + poly(fascia, "mass") + poly(deck, "street")
             + '<line class="lane" x1="100" y1="180" x2="1770" y2="200"/>'
             + '<line class="lane dash" x1="1060" y1="244" x2="1700" y2="168"/>'
             + label(1080, 262, "context.n_halsted_st", "lbl-ctx", 6.5, "start") + '</g>')
    # 360 n green, across green st
    c.append('<g id="b_360_n_green">'
             + poly([(100, 905), (560, 997), (470, 1102), (100, 1102)], "mass")
             + label(110, 1030, "context.b_360_n_green", "lbl-ctx", 0, "start") + '</g>')
    # 333 n green, south of the site
    c.append('<g id="b_333_n_green">'
             + poly([(1500, 360), (1610, 148), (1770, 148), (1770, 640), (1500, 810)], "mass")
             + poly([(1640, 148), (1770, 148), (1770, 500)], "mass-dark")
             + '<line class="detail" x1="1500" y1="810" x2="1770" y2="1000"/>'
             + label(1520, 640, "context.b_333_n_green", "lbl-ctx", 0, "start") + '</g>')
    g.append('<g id="context">' + "".join(c) + '</g>')

    # --------------------------------------------------------- activated plaza
    floor = [(698, 800), (1190, 905), (1300, 565), (1215, 575), (1150, 560), (1034, 520), (950, 503), (870, 608),
             (722, 660), (712, 712)]
    stair_svg, s_top_a, _ = steps((930, 712), (990, 726), 16, (6.5, -7.5), 4.5, "stair")
    seat_svg, _, seat_top_b = steps((990, 726), (1160, 764), 8, (13, -15), 9, "seat")
    g.append('<g id="activated_plaza" class="piece" data-piece="activated_plaza">'
             + '<g id="plaza_floor">' + poly(floor, "roof") + '</g>'
             + '<g id="stepped_seating">' + seat_svg + '</g>'
             + '<g id="stairs">' + stair_svg + '</g>'
             + label(1000, 840, "pieces.activated_plaza.name")
             + '</g>')

    # ------------------------------------------------------------------ paseo
    corridor = [(915, 298), (1060, 295), (1093, 392), (1095, 475), (1150, 546), (1034, 520), (950, 503), (963, 460),
                (950, 425)]
    band = [(820, 826), (880, 839), (990, 726), (930, 712)]
    g.append('<g id="paseo" class="piece" data-piece="paseo">'
             + '<g id="paseo_green_st_entry">' + poly(band, "roof") + '</g>'
             + '<g id="paseo_halsted_link">' + poly(corridor, "roof") + '</g>'
             + label(1005, 395, "pieces.paseo.name", "lbl", -72)
             + '</g>')

    # ---------------------------------------------------- residential bike room
    bike_top = [(1093, 322), (1108, 300), (1195, 290), (1388, 316), (1345, 385), (1215, 412), (1150, 400), (1095, 345)]
    bike_drop = [70, 50, 50, 110, 150, 163, 160, 130]
    bike_svg, _ = prism(bike_top, bike_drop, floor_lines=(0.52,))
    g.append('<g id="residential_bike_room" class="piece" data-piece="residential_bike_room">'
             + bike_svg
             + label(1240, 345, "pieces.residential_bike_room.name")
             + '</g>')

    # ------------------------------------------------------------------ retail
    retail_top = [(337, 597), (542, 395), (600, 398), (920, 338), (950, 385), (963, 420), (950, 458), (870, 563),
                  (722, 600), (683, 668)]
    retail_drop = [105, 105, 105, 60, 40, 40, 45, 45, 60, 105]
    retail_svg, _ = prism(retail_top, retail_drop, floor_lines=(0.5,), mullion=34)
    upper = [(675, 466), (925, 410), (950, 456), (688, 516)]
    upper_svg, _ = prism(upper, 85, mullion=34)
    g.append('<g id="retail" class="piece" data-piece="retail">'
             + '<g id="retail_podium">' + retail_svg + '</g>'
             + '<g id="retail_upper">' + upper_svg + '</g>'
             + label(560, 530, "pieces.retail.name")
             + '</g>')

    # -------------------------------------------------------- residential lobby
    lobby_top = [(705, 720), (915, 676), (930, 640), (722, 684)]
    lobby_svg, _ = prism(lobby_top, 44, mullion=30)
    g.append('<g id="residential_lobby" class="piece" data-piece="residential_lobby">'
             + lobby_svg
             + label(812, 752, "pieces.residential_lobby.name", "lbl", -11.5)
             + '</g>')

    # ------------------------------------------------------ circulation arrows
    g.append('<g id="circulation_arrows">'
             + arrow((580, 935), (750, 762), "arrow_green_st")
             + arrow((770, 130), (952, 378), "arrow_halsted_north")
             + arrow((1195, 120), (1058, 312), "arrow_halsted_south")
             + arrow((1430, 980), (1140, 552), "arrow_333_n_green")
             + '</g>')

    # ------------------------------------------------- visual connection arcs
    g.append('<g id="visual_connection_arcs">'
             + '<path id="arc_halsted" class="arc" d="M795,178 Q982,58 1170,152"/>'
             + '<path id="arc_green" class="arc" d="M640,880 Q1000,1066 1375,895"/>'
             + '<text class="lbl-ctx"><textPath href="#arc_green" startOffset="30%" data-copy="labels.visual_connection">'
               'visual connection</textPath></text>'
             + '</g>')

    return "\n".join(g)


def main():
    html = HTML.read_text()
    svg = build()
    new = re.sub(re.escape(START) + r".*?" + re.escape(END), lambda _: f"{START}\n{svg}\n{END}", html, flags=re.S)
    HTML.write_text(new)
    print(f"wrote {HTML} ({len(svg)} chars of svg)")


if __name__ == "__main__":
    main()
