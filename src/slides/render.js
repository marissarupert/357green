// Full-bleed render with a label tag; slow push-in on entry.
// Fields: label, image{src, alt}, zoom? (1 = fill), focus? ("50% 50%")
import { esc, img, tag } from '../lib/html.js'

export default {
  render: (s) => `
    <div class="abs fill render" data-in="push" data-at="0">
      <div class="abs fill" style="transform:scale(${Number(s.zoom) || 1});transform-origin:${esc(s.focus || '50% 50%')}">
        ${img(s.image.src, s.image.alt || s.label, 'cover-img')}
      </div>
    </div>
    ${tag(s.label)}`,
}
