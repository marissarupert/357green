// Amenity cards; each "View more photos" opens a lightbox gallery.
// Fields: eyebrow, eyebrowAccent, title, stat{value, label}, body,
//         cards[{title, link, photos[{src, caption}]}] (first photo is the thumbnail)
import { countable, esc, hairline, img, rich, ruleBar } from '../lib/html.js'

const chevron = `<svg viewBox="0 0 22 20" aria-hidden="true"><path d="M2 1.5 20 10 2 18.5" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linejoin="miter"/></svg>`

export default {
  render: (s) => `
    <p class="abs eyebrow" data-in="up">${esc(s.eyebrow)} | <span class="accent">${esc(s.eyebrowAccent)}</span></p>
    <h1 class="abs title" data-in="up">${esc(s.title)}</h1>
    <div class="abs stat" data-in="up">
      <p class="v">${countable(rich(s.stat.value))}</p>
      <p class="l">${esc(s.stat.label)}</p>
    </div>
    ${ruleBar()}
    <p class="abs body" data-in="up">${rich(s.body)}</p>
    <div class="abs cards">
      ${s.cards.map((c, i) => `
        <div class="card" data-in="up">
          <button class="thumb" data-gallery="${i}" aria-label="${esc(c.title)}: open photos">${img(c.photos[0].src, '')}</button>
          ${hairline()}
          <h3>${esc(c.title)}</h3>
          <button class="more" data-gallery="${i}">${esc(c.link || 'View more photos')} ${chevron}</button>
        </div>`).join('')}
    </div>`,

  mount(el, s, deck) {
    el.querySelectorAll('[data-gallery]').forEach((b) =>
      b.addEventListener('click', () => deck.lightbox.open(s.cards[b.dataset.gallery].photos, 0, b)))
  },
}
