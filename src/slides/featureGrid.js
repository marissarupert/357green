// Dark full-bleed photo with a titled 2×2 feature grid and badges.
// Fields: eyebrow, title, background, features[{title, body}], badges[{src, alt}]
import { esc, img, rich, ruleBar } from '../lib/html.js'

export default {
  render: (s) => `
    <div class="abs fill">${img(s.background, '', 'cover-img')}</div>
    <p class="abs eyebrow" data-in="up">${esc(s.eyebrow)}</p>
    <h1 class="abs title" data-in="up">${esc(s.title)}</h1>
    ${ruleBar()}
    <div class="abs grid">
      ${s.features.map((f) => `<div class="f" data-in="up"><h3>${esc(f.title)}</h3><p>${rich(f.body)}</p></div>`).join('')}
      <div class="badges" data-in="up">${s.badges.map((b) => img(b.src, b.alt)).join('')}</div>
    </div>`,
}
