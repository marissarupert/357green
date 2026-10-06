// Cover. Fields: logo, tagline, partners[{src, alt}], eyebrow?, background?
//   background: full-bleed render behind the cover (slow push-in, midnight
//   gradient so the logo and title read over it).
import { esc, img } from '../lib/html.js'

export default {
  render: (s) => `
    ${s.background ? `<div class="abs bg"><div class="push" data-in="push">${img(s.background, '', 'cover-img')}</div></div><div class="abs scrim" aria-hidden="true"></div>` : ''}
    <div class="abs logo" data-in="up">${img(s.logo, '357 Green')}</div>
    ${s.eyebrow ? `<p class="abs eyebrow" data-in="up" data-at="0.6">${esc(s.eyebrow)}</p>` : ''}
    <h1 class="abs tagline" data-in="up" data-at="0.8">${esc(s.tagline)}</h1>
    <div class="rule-bar" data-in="rule-bar" data-at="1.1"></div>
    <div class="abs partners" data-in="fade" data-at="1.4">
      ${s.partners.map((p) => img(p.src, p.alt)).join('')}
    </div>`,
  // Logo first, then the title, a fine copper rule and the partner logos.
}
