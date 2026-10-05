// Light slide: features listed beside a full-height image. The features
// come in on their own, one after another, once the title is up.
// Fields: eyebrow, title, features[{title, body}], image{src, alt}
import { esc, img, nBand, rich, ruleBar } from '../lib/html.js'

const FIRST = 0.5 // seconds after the slide appears
const GAP = 0.45 // seconds between features

export default {
  render: (s) => `
    <div class="abs media">${img(s.image.src, s.image.alt, 'cover-img')}</div>
    ${nBand([1101, 963, 819, 117], { origin: [529 - 1101, 809 - 963] })}
    <p class="abs eyebrow" data-in="up">${esc(s.eyebrow)}</p>
    <h1 class="abs title" data-in="up">${esc(s.title)}</h1>
    ${ruleBar()}
    <div class="abs list">${s.features.map((f, i) => `
      <div class="feature" data-in="up" data-at="${FIRST + i * GAP}"><h3>${esc(f.title)}</h3><p>${rich(f.body)}</p></div>`).join('')}
    </div>`,
}
