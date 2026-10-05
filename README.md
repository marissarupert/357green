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
| Section menu | M, or the ☰ button bottom left |
| Full screen | F, or the ⛶ button bottom left |

The menu and full-screen buttons fade out when the mouse is still. Every slide
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
