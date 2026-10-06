// Light slide: text on the left, image on the right.
// Fields: eyebrow, eyebrowAccent?, title, body, image{src, alt, focus?} (focus: which part of
//         the image stays in frame, as CSS object-position, e.g. "22% 50%"),
//         variant: "photo" (full-height image) | "diagram" (inset drawing over the N band)
//         axo: true puts the interactive podium axo in place of the image
import { esc, img, nBand, rich, ruleBar } from '../lib/html.js'
import * as podium from '../lib/podium.js'

export default {
  render: (s) => `
    ${s.axo ? podium.render() : `<div class="abs media ${s.variant || 'photo'}" data-in="fade"${s.image.focus ? ` style="--focus:${esc(s.image.focus)}"` : ''}>${img(s.image.src, s.image.alt, 'cover-img')}</div>`}
    ${s.variant === 'diagram' ? nBand([0, 963, 1920, 117], { origin: [-21, 726 - 963] }) : ''}
    <p class="abs eyebrow" data-in="up">${esc(s.eyebrow)}${s.eyebrowAccent ? ` | <span class="accent">${esc(s.eyebrowAccent)}</span>` : ''}</p>
    <h1 class="abs title" data-in="up">${esc(s.title)}</h1>
    ${ruleBar()}
    <p class="abs body" data-in="up">${rich(s.body)}</p>`,
  mount(el, s) { if (s.axo) podium.mount(el) },
  enter(el, tl) { el._axo?.enter(tl) },
  leave(el) { el._axo?.leave() },
}
