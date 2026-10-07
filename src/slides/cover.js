// Cover. Fields: logo, tagline, partners[{src, alt}], eyebrow?, background?
//   tagline: a string, or an array of lines. The last line is heavy, with a
//   copper full stop (it eases up from hairline weight as it arrives); the
//   line before it is hairline weight; any earlier lines are a small lead-in.
//   background: full-bleed render behind the cover (slow push-in, midnight
//   gradient so the logo and title read over it).
import { gsap } from 'gsap'
import { esc, img } from '../lib/html.js'

const lines = (t) => (Array.isArray(t) ? t : [t])
const role = (i, n) => (i === n - 1 ? 'heavy' : i === n - 2 ? 'hair' : 'lead')
const stop = (t) => esc(t).replace(/\.$/, '<span class="stop">.</span>')

export default {
  render: (s) => `
    ${s.background ? `<div class="abs bg"><div class="push" data-in="push">${img(s.background, '', 'cover-img')}</div></div><div class="abs scrim" aria-hidden="true"></div>` : ''}
    <div class="abs logo" data-in="up">${img(s.logo, '357 Green')}</div>
    ${s.eyebrow ? `<p class="abs eyebrow" data-in="up" data-at="0.5">${esc(s.eyebrow)}</p>` : ''}
    <h1 class="abs tagline" aria-label="${esc(lines(s.tagline).join(' '))}">
      ${lines(s.tagline).map((l, i, all) => `<span class="ln ${role(i, all.length)}" data-in="mask" data-at="${0.6 + i * 0.16}" aria-hidden="true"><span>${stop(l)}</span></span>`).join('')}
    </h1>
    <div class="rule-bar" data-in="rule-bar" data-at="1.2"></div>
    <div class="abs partners" data-in="fade" data-at="1.5">
      ${s.partners.map((p) => img(p.src, p.alt)).join('')}
    </div>`,
  // The heavy last line arrives at hairline weight and thickens into place.
  enter(el, tl) {
    const last = el.querySelector('.tagline .heavy > span')
    if (last) tl.from(last, { fontWeight: 200, duration: 1.6, ease: 'power2.inOut', clearProps: 'fontWeight' }, 0.95)
  },
}
