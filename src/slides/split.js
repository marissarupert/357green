// Light slide: text on the left, image on the right.
// Fields: eyebrow, eyebrowAccent?, title, body, image{src, alt},
//         variant: "photo" (full-height image) | "diagram" (inset drawing over the N band)
import { esc, img, nBand, rich, ruleBar } from '../lib/html.js'

export default {
  render: (s) => `
    <div class="abs media ${s.variant || 'photo'}" data-in="fade">${img(s.image.src, s.image.alt, 'cover-img')}</div>
    ${s.variant === 'diagram' ? nBand([0, 963, 1920, 117], { origin: [-21, 726 - 963] }) : ''}
    <p class="abs eyebrow" data-in="up">${esc(s.eyebrow)}${s.eyebrowAccent ? ` | <span class="accent">${esc(s.eyebrowAccent)}</span>` : ''}</p>
    <h1 class="abs title" data-in="up">${esc(s.title)}</h1>
    ${ruleBar()}
    <p class="abs body" data-in="up">${rich(s.body)}</p>`,
}
