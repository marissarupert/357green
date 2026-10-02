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

## Launch hub (`hub/`)

`hub/index.html` is the internal go-to-market hub for the marketing and leasing teams: teaser launch countdown, the 30/60/90 day plan as an editable board, a timeline, a brand quick reference and resource links.

The live version is a private claude.ai artifact. Tasks, owners, dates, notes and links are stored in that artifact's shared database, so teammates with Contributor access edit them and everyone sees the same state. Opened outside claude.ai, the page shows the layout but not the plan data. `hub/seed.json` is the plan as first loaded; the live data has moved on since.

For internal use only. Don't host the hub publicly.
