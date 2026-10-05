// Light slide: features listed beside a full-height image; each press of
// Next reveals one more feature before moving on.
// Fields: eyebrow, title, features[{title, body}], image{src, alt}
import { gsap } from 'gsap'
import { esc, img, nBand, rich, ruleBar } from '../lib/html.js'
import { reducedMotion } from '../motion.js'

const items = (el) => [...el.querySelectorAll('.feature')]

function reveal(el, n, animate = true) {
  el._shown = n
  items(el).forEach((f, i) => {
    const on = i < n
    const was = f.classList.contains('on')
    f.classList.toggle('on', on)
    if (animate && on && !was && !reducedMotion.matches) gsap.fromTo(f, { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out' })
    else if (!(on && was)) gsap.set(f, { autoAlpha: on ? 1 : 0, y: 0 })
  })
}

export default {
  render: (s) => `
    <div class="abs media">${img(s.image.src, s.image.alt, 'cover-img')}</div>
    ${nBand([1101, 963, 819, 117], { origin: [529 - 1101, 809 - 963] })}
    <p class="abs eyebrow" data-in="up">${esc(s.eyebrow)}</p>
    <h1 class="abs title" data-in="up">${esc(s.title)}</h1>
    ${ruleBar()}
    <div class="abs list">${s.features.map((f) => `
      <div class="feature"><h3>${esc(f.title)}</h3><p>${rich(f.body)}</p></div>`).join('')}
    </div>`,
  enter(el, tl, s, { backwards }) {
    reveal(el, 0, false)
    tl.call(() => reveal(el, backwards ? s.features.length : 1), [], 0.35)
  },
  step(el, dir, s) {
    const n = el._shown ?? s.features.length
    if (dir > 0 && n < s.features.length) { reveal(el, n + 1); return true }
    if (dir < 0 && n > 1) { reveal(el, n - 1); return true }
    return false
  },
  leave(el, s) { reveal(el, s.features.length, false) },
}
