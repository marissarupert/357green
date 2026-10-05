// Dark text panel beside a full-height image. Fields: title, body, kicker, image{src, alt}
import { esc, img, rich, ruleBar } from '../lib/html.js'

export default {
  render: (s) => `
    <div class="abs media">${img(s.image.src, s.image.alt, 'cover-img')}</div>
    <div class="abs panel"></div>
    <h1 class="abs title" data-in="up">${rich(s.title)}</h1>
    ${ruleBar()}
    <p class="abs body" data-in="up">${rich(s.body)}</p>
    <p class="abs kicker" data-in="up">${esc(s.kicker)}</p>`,
}
