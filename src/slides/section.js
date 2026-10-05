// Light slide: building section drawing with legend.
// Fields: eyebrow, title, image{src, alt}, legendNote?
import { esc, img, nBand, placeholderTag, ruleBar } from '../lib/html.js'

export default {
  render: (s) => `
    <p class="abs eyebrow" data-in="up">${esc(s.eyebrow)}</p>
    <h1 class="abs title" data-in="up">${esc(s.title)}</h1>
    ${ruleBar()}
    <div class="abs drawing" data-in="fade">${img(s.image.src, s.image.alt)}</div>
    ${s.legendNote ? `<div class="abs note">${placeholderTag(s.legendNote)}</div>` : ''}
    ${nBand([1487, 0, 433, 1080], { vertical: true, origin: [1394 - 1487, -378] })}`,
}
