// Dark panel with "//" bullets beside a photo carousel (SCB Architects).
// Fields: eyebrow, title, subtitle, bullets[], photos[] (see lib/carousel.js)
import { esc, rich, ruleBar } from '../lib/html.js'
import { carousel, mountCarousel, startCarousel, stopCarousel } from '../lib/carousel.js'

export default {
  render: (s) => `
    ${carousel(s.photos, 'photo', 'photo-bars')}
    <div class="abs panel"></div>
    <p class="abs eyebrow" data-in="up">${esc(s.eyebrow)}</p>
    <h1 class="abs title" data-in="up">${esc(s.title)}</h1>
    <p class="abs subtitle" data-in="up">${esc(s.subtitle)}</p>
    ${ruleBar()}
    <ul class="abs list">${s.bullets.map((b) => `<li data-in="up"><span class="mark">//</span>${rich(b)}</li>`).join('')}</ul>`,
  mount: (el) => mountCarousel(el),
  enter: (el) => startCarousel(el),
  leave: (el) => stopCarousel(el),
}
