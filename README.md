# 357 Green

Interactive landing page for 357 Green, built from the approved presentation design. `index.html` plus images in `assets/`. No build step: open `index.html` in a browser.

## Editing

Content lives in the `SLIDES` array near the top of the `<script>` block. Each entry is one full-screen section:

- `layout` picks the renderer: `hero` (text + photo split; add `reverse: true` for photo on the left), `statement`, `stats`, `features`, `contact`
- `theme` is `dark` (slate) or `light` (paper)
- `nav` is the label shown in the hamburger menu
- `placeholder: true` shows the dashed "Placeholder" tag; remove it once the section has real content

Images are mapped by key in `IMG`.

## Status

The opening section ("The New Standard") is final. The other five sections are layout placeholders waiting on content.

The tower rendering in `assets/tower.jpg` was extracted from the PDF at 395×535 px and looks soft full-screen. Replace it with the original rendering file when available.

Headings and body use Jost from Google Fonts as a stand-in for Futura.
