// Amenity cards; each "View more photos" opens a lightbox gallery. The text and
// the cards share one column, so the cards always sit below however long the text runs.
// Fields: eyebrow, eyebrowAccent, title, stat{value, label}, body,
//         cards[{title, link, photos[{src, caption}]}] (first photo is the thumbnail)
// While the slide is on screen each thumbnail cross-fades through its card's
// photos, the three cards a beat apart; pointing at a card pauses it.
import { countable, esc, hairline, img, rich, ruleBar } from '../lib/html.js'

// Index of the photo a thumbnail is showing (the gallery opens on it).
const shown = (thumb) => Math.max(0, [...thumb.querySelectorAll('img')].findIndex((i) => i.classList.contains('on')))

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
    <div class="abs flow">
    <p class="body" data-in="up">${rich(s.body)}</p>
    <div class="cards">
      ${s.cards.map((c, i) => `
        <div class="card" data-in="up">
          <button class="thumb" data-gallery="${i}" aria-label="${esc(c.title)}: open photos">${c.photos.map((p, j) => img(p.src, '', j ? '' : 'on')).join('')}</button>
          ${hairline()}
          <h3>${esc(c.title)}</h3>
          <button class="more" data-gallery="${i}">${esc(c.link || 'View more photos')} ${chevron}</button>
        </div>`).join('')}
    </div>
    </div>`,

  mount(el, s, deck) {
    el.querySelectorAll('[data-gallery]').forEach((b) =>
      b.addEventListener('click', () => deck.lightbox.open(s.cards[b.dataset.gallery].photos, shown(b), b)))
    el.querySelectorAll('.card').forEach((c) => {
      c.addEventListener('pointerenter', () => { c.dataset.hold = '1' })
      c.addEventListener('pointerleave', () => { delete c.dataset.hold })
    })
  },

  enter(el) {
    const thumbs = [...el.querySelectorAll('.thumb')].filter((t) => t.children.length > 1)
    let tick = 0
    // One clock for all three cards; each turns on its own beat, a third apart.
    el._rotate = setInterval(() => {
      const t = thumbs[tick++ % thumbs.length]
      if (!t || t.closest('.card').dataset.hold) return
      const imgs = [...t.children]
      const n = shown(t)
      imgs[n].classList.remove('on')
      imgs[(n + 1) % imgs.length].classList.add('on')
    }, 1800)
  },

  leave(el) { clearInterval(el._rotate) },
}
