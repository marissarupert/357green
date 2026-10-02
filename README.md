# 357 Green

Interactive landing page for 357 Green, built from the approved presentation design. `index.html` plus images in `assets/`. No build step: open `index.html` in a browser.

## Editing

Content lives in the `SLIDES` array near the top of the `<script>` block. Each entry is one full-screen section:

- `layout` picks the renderer: `hero` (text + photo split; add `reverse: true` for photo on the left), `statement`, `stats`, `features`, `contact`
- `theme` is `dark` (slate) or `light` (paper)
- `nav` is the label shown in the hamburger menu
- `placeholder: true` shows the dashed "Placeholder" tag; remove it once the section has real content

Images are mapped by key in `IMG`. The building logo (`assets/logo.png`, white on transparent) sits top left on every section and is darkened automatically on `light` sections.

## Status

The opening section ("The New Standard") is final. The other five sections are layout placeholders waiting on content.

The tower rendering in `assets/tower.jpg` was extracted from the PDF at 395×535 px and looks soft full-screen. Replace it with the original rendering file when available.

Headings and body use Jost from Google Fonts as a stand-in for Futura.

## Floor plans (`floor-plans/`)

A 16:9 slide deck on white built around an interactive exploded axo of each plan. It's one self-contained `floor-plans/index.html` (inline SVG, vanilla JS, no libraries) that scales to its container and embeds in an iframe (Ceros / Wix). On phones the slide stacks vertically instead of letterboxing.

- **Copy**: `PLANS` (piece names, descriptions, street labels), `KEY` and `SLIDES` sit at the top of the `<script>`. Each slide either lifts a piece, turns circulation on, or explodes the podium.
- **Brand**: the five colors, the per-piece colors (`--c-retail` and so on), and the font stack are CSS variables at the top of the `<style>`. Rust is reserved for the hovered or selected piece and the circulation route.
- **Interaction**: hover or tab to a piece to highlight it, click/tap/Enter to lift it, Esc resets. Navigate slides with the arrow buttons, ← → keys, or a swipe.
- **Logo**: two dashed placeholders (header and cover), marked with comments, are waiting for the real SVG.

The podium drawing is traced from the SCB "podium circulation" sheet (DPD intake, 09.08.2026). `floor-plans/tools/build_podium.py` holds the traced geometry and regenerates the SVG between the `axo:podium` markers. Hand edits inside those markers are overwritten if it is re-run.
