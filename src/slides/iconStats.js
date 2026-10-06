// Light slide: icon stat row beside a photo carousel (Onni Group).
// Fields: eyebrow, title, headline, stats[{icon, value, label}], photos[] (see lib/carousel.js)
import { countable, esc, img, rich, ruleBar } from '../lib/html.js'
import { carousel, mountCarousel } from '../lib/carousel.js'

export default {
  render: (s) => `
    <p class="abs eyebrow" data-in="up">${esc(s.eyebrow)}</p>
    <h1 class="abs title" data-in="up">${esc(s.title)}</h1>
    ${ruleBar()}
    <p class="abs headline" data-in="up">${esc(s.headline)}</p>
    <div class="abs icons">
      ${s.stats.map((st) => `
        <div class="ic" data-in="up">
          <div class="glyph">${img(st.icon, '')}</div>
          <p class="v">${countable(rich(st.value))}</p>
          <p class="l">${rich(st.label)}</p>
        </div>`).join('')}
    </div>
    ${carousel(s.photos, 'photo', 'photo-bars')}`,
  mount: (el) => mountCarousel(el),
}
