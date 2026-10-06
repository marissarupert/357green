// Section divider. Fields: number, title
import { gsap } from 'gsap'
import { esc } from '../lib/html.js'
import { watermark } from '../lib/marks.js'
import { reducedMotion } from '../motion.js'

export default {
  render: (s) => `
    ${watermark()}
    <h1 class="abs heading"><span class="num" data-in="up">${esc(s.number)}</span><span class="t" data-in="up" data-at="0.25">${esc(s.title)}</span></h1>
    <span class="hairline rule" data-in="line" data-at="0.35"></span>`,
  // The watermark drifts slowly for as long as the slide is up.
  enter(el) {
    if (reducedMotion.matches) return
    el._drift = gsap.fromTo(el.querySelector('[data-drift]'), { x: 0, y: 0 }, { x: -60, y: -24, duration: 24, ease: 'sine.inOut', yoyo: true, repeat: -1 })
  },
  leave(el) { el._drift?.kill(); gsap.set(el.querySelector('[data-drift]'), { clearProps: 'transform' }) },
}
