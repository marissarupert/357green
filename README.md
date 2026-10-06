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
| `video` | 2 | muted looping video; poster + placeholder until `video.src` is set |
| `intro` | 3 | `bleed: true`: full-bleed render with a slow push-in, text in a left column over a midnight gradient |
| `overview` | 4 | numbers count up, rows stagger in |
| `divider` | 5, 8, 10, 18, 34, 40, 43 | numeral and title animate in, watermark drifts |
| `iconStats` | 6 | numbers count up; carousel bars switch photos |
| `bullets` | 7 | carousel bars switch photos |
| `location` | 9 | numbers count up; embedded interactive map (`map.url`) |
| `features` | 11 | features come in one after another, automatically |
| `elevation` | 12 | elevations rise from the ground as level markers tick on, callouts reach out to both towers; hover a level for a guide line across both, hover a callout to pick out its points |
| `callouts` | 13 | callouts play in; hover a label or dot for a zoom lens, click to spotlight (Esc to clear) |
| `render` | 14–15, 21–28, 31–33 | slow push-in, label tag slides in (`zoom`/`focus` crop the image) |
| `section` | 16 | section wipes up, callouts draw out; hover a legend item to highlight that zone |
| `featureGrid` | 17 | subtle clouds drift across the sky behind the text (`clouds`), still under reduced motion |
| `split` | 19, 29 | 19 (`axo: true`): podium pieces drop in and the paseo route draws down from Halsted; hover a piece or key entry to pick it out, click to lift it (Esc sets it back), Paseo route toggle |
| `keyed` | 20 | section drawing builds up from the ground (ascent fills, levels tick up, sightlines and connections draw out); hover/focus a key item to highlight its spot (add `spot: [x, y]`) |
| `amenities` | 30 | each "View more photos" opens a lightbox gallery |
| `programming` | 35 | each "View plan" jumps to its test fit |
| `testfit` | 36–39 | Low/High Rise and Open/Perimeter toggles swap plan and stats |
| `views` | 41, 42 | drag/arrow keys/trackpad to pan; Both/East/West and height toggles |
| `floorplan` | 44, 45 | static (plans are flat images, not layered SVG) |
| `contact` | 46 | phone and email are live links |

All positions are in 1920×1080 stage pixels taken from the static deck, so a
new slide of an existing type lines up automatically.

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
- **Slide 2** video file
- **Slide 20** keyed site plan with the 01–11 positions (the section is redrawn as `src/assets/svg/plaza-ascent.svg`)
- **Views** original wide panoramas (the deck's are 863 px wide)

Low-resolution in the source PDF, and soft on large screens: plaza section (20),
views (41, 42),
aerial (11) and the Fulton Market photo (9).
