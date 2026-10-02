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

Interactive exploded axos of the plans, one self-contained `floor-plans/index.html` (inline SVG, no libraries). Names and descriptions live in the `PLANS` object at the top of the `<script>`; brand colors and the font stack are CSS variables at the top of the `<style>`.

The podium drawing is traced from the SCB "podium circulation" sheet (DPD intake, 09.08.2026). `floor-plans/tools/build_podium.py` holds the traced geometry and regenerates the SVG between the `axo:podium` markers; hand edits inside those markers are overwritten if it is re-run.
