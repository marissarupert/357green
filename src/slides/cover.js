// Cover. Fields: logo, tagline, partners[{src, alt}]
import { esc, img } from '../lib/html.js'

export default {
  render: (s) => `
    <div class="abs logo" data-in="up">${img(s.logo, '357 Green')}</div>
    <div class="abs partners" data-in="fade" data-at="1.3">
      ${s.partners.map((p) => img(p.src, p.alt)).join('')}
    </div>
    <h1 class="abs tagline" data-in="up" data-at="1.0">${esc(s.tagline)}</h1>
    <div class="rule-bar" data-in="rule-bar" data-at="0.45"></div>`,
  // Logo first, then the copper rule, then the tagline and partner logos.
}
