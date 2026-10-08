# 357 Green — leasing deck

Interactive, animated web version of the 357 Green leasing presentation, built
to be shown full screen. Vite + vanilla JS + GSAP, no backend.

The static deck it reproduces is in `reference/slides/` (one JPG per slide,
1920×1080). That is the source of truth for layout, type and colour.

## Run and build

```sh
npm install
npm run dev      # live preview at http://localhost:5173
npm run build    # writes the finished deck to dist/
```

`dist/` works two ways:

- **Offline:** copy the folder anywhere and double-click `dist/index.html`.
  No server or internet needed (the map slot is the one exception).
- **Hosted:** upload the folder to any static host. Netlify builds it from
  `main` automatically using `netlify.toml`.

## Presenting

| Action | Keys / gestures |
|---|---|
| Next slide | → ↓ Space PageDown, click anywhere, swipe left/up, ↓ button bottom right |
| Previous slide | ← ↑ PageUp, swipe right/down, ↑ button bottom right |
| First / last | Home / End |
| Menu | ☰ top right, or M: the menu drops down; point at a section to see its slides, click to jump, or the 357 mark for the start. Esc or a click outside closes it |
| Full screen | F, or Full screen in the menu |

On the **Views** slides, ←/→ pan the focused panorama instead of
changing slides; click a panorama or Tab to it first.

The ☰ button floats in the top-right corner of every slide; the menu also
shows the slide number. Every slide
has its own link (for example `…/#project-overview`), so you can open the deck
straight to a slide.

## Share a single slide

`location.html` (hosted at `…/location`) shows only the Fulton Market slide,
with its map: no menu, no arrows, nothing to page through. It is the link
to send brokers. To make another one, copy `public/location.html` and change
`data-only` to that slide's `id`.

## Change content

Everything a slide shows lives in **`src/content.js`**: order, copy, stats and
image paths. Layout code never needs to change.

- **Reorder or remove a slide:** move or delete its entry in the `slides` list.
- **Add a slide:** copy an existing entry of the type you want, give it a new
  `id`, and edit the fields. Each layout lists the fields it reads at the top of
  its file in `src/slides/`.
- **Mark something as not final:** add `placeholder: true` (stats) or leave the
  map `url` empty. It shows a dashed "Placeholder" label.

### Slide types

| `type` | Used for | Interaction |
|---|---|---|
| `cover` | 1 | logo, copper rule, then tagline animate in |
| `video` | 2 | muted looping video; until `video.src` is set the poster render shows full bleed with a slow push-in |
| `intro` | 3 | `bleed: true`: full-bleed render with a slow push-in, text in a left column over a midnight gradient |
| `overview` | 4 | numbers count up, rows stagger in |
| `divider` | 5, 8, 10, 16, 33, 39 | numeral and title animate in, watermark drifts |
| `iconStats` | 6 | numbers count up; photos rotate on their own (the copper bar fills, then the next photo fades in; hover pauses, bars or a click switch by hand) |
| `bullets` | 7 | photos rotate on their own, as on slide 6; `grid: true` shows them as a captioned photo grid instead (SCB), `body` paragraphs replace the bullets, `titleLogo` puts a logo in place of the title |
| `location` | 9 | numbers count up; nearby transit list (`transit`); isometric massing map of Grand / Kennedy Expressway / Washington / Ogden (`map.drawing: 'iso-map'`): buildings rise outward from 357 Green, which rises last in copper. A **Map key** dropdown lists everything on it (neighbors, restaurants, hotels, CTA, Metra, walk times and the walking routes from Ogilvie and Union Station); point at an entry, or at a place on the map, to mark it. Remove `drawing` to show the interactive map (`map.url`) instead |
| `features` | 11 | features come in one after another, automatically |
| `elevation` | (not in the deck) | elevations rise from the ground as level markers tick on, callouts reach out to both towers; hover a level for a guide line across both, hover a callout to pick out its points |
| `callouts` | 12 | callouts play in; hover a label or dot for a zoom lens, click to spotlight (Esc to clear) |
| `render` | 13–14, 18–19, 21–26, 28–30 | slow push-in, label tag slides in (`zoom`/`focus` crop the image) |
| `section` | 15 | section wipes up, callouts draw out; hover a legend item to highlight that zone |
| `featureGrid` | 42 | subtle clouds drift across the sky behind the text (`clouds`), still under reduced motion |
| `split` | 31 | text beside a photo; `feature` adds a tenant block under the text (logo, label, photos that open full screen: Dialtone); `axo: true` puts the interactive podium axo in place of the photo |
| `paseo` | 17 | two views, switched on the band (or with →): the podium axo (pieces drop in, the paseo route draws down from Halsted; hover a piece or key entry to pick it out, click to lift it) and the plaza section (builds up from the ground; hover/focus a numbered item to light its marker, `spot: [x, y]`) |
| `keyed` | (not in the deck) | a drawing with a numbered key, as the plaza view above |
| `amenities` | 20 | each card thumbnail cross-fades through its photos (hover pauses); "View more photos" opens a lightbox gallery at the photo showing |
| `programming` | 34 | each "View plan" jumps to its test fit |
| `testfit` | 35–38 | Low/High Rise and Open/Perimeter toggles swap plan and stats |
| `views` | 40, 41 | drag/arrow keys/trackpad to pan; Both/East/West and height toggles |
| `floorplan` | 27, 32 | static (plans are flat images, not layered SVG) |
| `contact` | 43 | phone and email are live links |

All positions are in 1920×1080 stage pixels taken from the static deck, so a
new slide of an existing type lines up automatically.

The isometric map on slide 9 (`src/assets/svg/iso-map.svg`) is generated by
`tools/iso-map.py` from OpenStreetMap buildings (heights from OSM, else the City
of Chicago's storey counts, else two storeys); 357 Green is modelled from the
deck's ground-floor and test-fit plans. The highlights (restaurants, hotels,
CTA and Metra lines and stations, 5 and 10 minute walks) come from the Stream
GIS map's layers. The script's header lists the source URLs. Keep the "© OpenStreetMap contributors" credit on the map.

The podium axo on slide 19 is a traced SVG (`src/assets/svg/podium-axo.svg`)
from the SCB podium circulation sheet, made in the floor-plans session
(branch `claude/relaxed-cerf-azko0e`, `floor-plans/tools/build_podium.py`).

## Swap an asset

Images live in `public/assets/` and are referenced by path from
`src/content.js`. To replace one, drop the new file over the old one with the
same name, or put it alongside and update the path. Use JPG for photos (up to
3840 px wide is plenty for a 4K screen) and PNG or SVG for logos.

## Fonts

The deck is designed in Futura 100. Until the licensed web fonts are supplied,
Jost (open source, very close in shape) stands in. To switch, put the Futura
`.woff2` files in `src/assets/fonts/` and point the `@font-face` rule at the top
of `src/styles/base.css` at them. Fonts are embedded into the build so they also
work offline.

## Still needed

Where these appear in the deck they are marked with a dashed "Placeholder" label:

- **Futura 100** web fonts (Jost stands in)
- **Slide 2** video file (optional; the render shows until then)
- **The Paseo (17)** positions for items 06, 07 and 09, which don't show in the section (a keyed site plan would place them)
- **Onni (6)** 161 Clark renovation renders, 200 N. LaSalle hero shot
- **Views** original wide panoramas (the deck's are 863 px wide)

Low-resolution in the source PDF, and soft on large screens: plaza section (17),
views (40, 41), aerial (11) and the Fulton Market photo (9).
