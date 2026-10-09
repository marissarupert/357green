// Full-bleed photo carousel with a label tag and the copper bars along the
// bottom; it turns by itself while on screen (see lib/carousel.js).
// Fields: label, photos[{src, alt, caption?, focus?}]
import { tag } from '../lib/html.js'
import { carousel, mountCarousel, startCarousel, stopCarousel } from '../lib/carousel.js'

export default {
  render: (s) => `
    ${carousel(s.photos, 'abs fill gallery', 'gallery-bars')}
    <div class="abs gallery-scrim" aria-hidden="true"></div>
    ${tag(s.label)}`,
  mount: (el) => mountCarousel(el),
  enter: (el) => startCarousel(el),
  leave: (el) => stopCarousel(el),
}
