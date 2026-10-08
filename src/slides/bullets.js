// Dark panel with "//" bullets beside a photo carousel (SCB Architects).
// Fields: eyebrow, title, titleLogo?, subtitle, bullets[] | body[] (paragraphs),
//         photos[] (see lib/carousel.js), grid?
//   grid: true lays the photos out as a captioned grid instead of a carousel.
//   titleLogo: a logo shown (in white) in place of the title text.
import { esc, img, rich, ruleBar } from '../lib/html.js'
import { carousel, mountCarousel, startCarousel, stopCarousel } from '../lib/carousel.js'

const grid = (photos) => `
  <div class="abs photo-grid">${photos.map((p, i) => `
    <figure data-in="fade" data-at="${(0.2 + i * 0.12).toFixed(2)}">${img(p.src, p.alt || p.caption || '', 'cover-img').replace('<img ', `<img style="object-position:${esc(p.focus || '50% 50%')}" `)}
      ${p.caption ? `<p class="img-tag"><span>${esc(p.caption)}</span></p>` : ''}</figure>`).join('')}
  </div>`

export default {
  render: (s) => `
    ${s.grid ? grid(s.photos) : carousel(s.photos, 'photo', 'photo-bars')}
    <div class="abs panel"></div>
    <p class="abs eyebrow" data-in="up">${esc(s.eyebrow)}</p>
    <h1 class="abs title${s.titleLogo ? ' has-logo' : ''}" data-in="up">${s.titleLogo ? img(s.titleLogo, s.title) : esc(s.title)}</h1>
    ${s.subtitle ? `<p class="abs subtitle" data-in="up">${esc(s.subtitle)}</p>` : ''}
    ${ruleBar()}
    ${s.body
      ? `<div class="abs prose">${s.body.map((t) => `<p data-in="up">${rich(t)}</p>`).join('')}</div>`
      : `<ul class="abs list">${s.bullets.map((b) => `<li data-in="up"><span class="mark">//</span>${rich(b)}</li>`).join('')}</ul>`}`,
  mount: (el) => mountCarousel(el),
  enter: (el) => startCarousel(el),
  leave: (el) => stopCarousel(el),
}
