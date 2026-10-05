// Light slide with a single drawing. Fields: eyebrow, image{src, alt}, note?
import { esc, img, nBand, placeholderTag } from '../lib/html.js'

export default {
  render: (s) => `
    <p class="abs eyebrow" data-in="up">${esc(s.eyebrow)}</p>
    <div class="abs drawing" data-in="fade">${img(s.image.src, s.image.alt)}${s.note ? placeholderTag(s.note) : ''}</div>
    ${nBand([0, 963, 1920, 117], { origin: [-21, 726 - 963] })}`,
}
