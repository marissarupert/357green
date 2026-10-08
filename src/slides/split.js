// Light slide: text on the left, image on the right.
// Fields: eyebrow, eyebrowAccent?, title, body, image{src, alt, focus?} (focus: which part of
//         the image stays in frame, as CSS object-position, e.g. "22% 50%"),
//         variant: "photo" (full-height image) | "diagram" (inset drawing over the N band)
//         axo: true puts the interactive podium axo in place of the image
//         feature?{logo, label, photos[{src, caption}]}: a tenant feature under the
//         text (Dialtone): its logo (in the slide's ink), a label, and photos that
//         open full screen
import { esc, img, nBand, rich, ruleBar } from '../lib/html.js'
import * as podium from '../lib/podium.js'

export default {
  render: (s) => `
    ${s.axo ? podium.render() : `<div class="abs media ${s.variant || 'photo'}" data-in="fade"${s.image.focus ? ` style="--focus:${esc(s.image.focus)}"` : ''}>${img(s.image.src, s.image.alt, 'cover-img')}</div>`}
    ${s.variant === 'diagram' ? nBand([0, 963, 1920, 117], { origin: [-21, 726 - 963] }) : ''}
    <p class="abs eyebrow" data-in="up">${esc(s.eyebrow)}${s.eyebrowAccent ? ` | <span class="accent">${esc(s.eyebrowAccent)}</span>` : ''}</p>
    <h1 class="abs title" data-in="up">${esc(s.title)}</h1>
    ${ruleBar()}
    <p class="abs body" data-in="up">${rich(s.body)}</p>
    ${s.feature ? `
    <div class="abs feature" data-in="up" data-at="0.9">
      <span class="f-logo" role="img" aria-label="${esc(s.feature.label)}" style="-webkit-mask-image:url('${esc(s.feature.logo)}');mask-image:url('${esc(s.feature.logo)}')"></span>
      <p class="f-label">${esc(s.feature.label)}</p>
      <div class="f-photos">${s.feature.photos.map((p, i) => `<button class="f-photo" data-photo="${i}" aria-label="${esc(p.caption || s.feature.label)}: view full screen">${img(p.src, '')}</button>`).join('')}</div>
    </div>` : ''}`,
  mount(el, s, deck) {
    if (s.axo) podium.mount(el)
    el.querySelectorAll('.f-photo').forEach((b) =>
      b.addEventListener('click', () => deck.lightbox.open(s.feature.photos, Number(b.dataset.photo), b)))
  },
  enter(el, tl) { el._axo?.enter(tl) },
  leave(el) { el._axo?.leave() },
}
