// Full-bleed render with a label tag; slow push-in on entry.
// Fields: label, image{src, alt}, zoom? (1 = fill), focus? ("50% 50%"),
//         video? (src of a muted looping video shown in place of the still;
//         the still is its poster, so the slide never shows blank)
import { esc, img, tag } from '../lib/html.js'

export default {
  render: (s) => `
    <div class="abs fill render" data-in="push" data-at="0">
      <div class="abs fill" style="transform:scale(${Number(s.zoom) || 1});transform-origin:${esc(s.focus || '50% 50%')}">
        ${s.video
          ? `<video class="cover-img" data-src="${esc(s.video)}" poster="${esc(s.image.src)}" aria-label="${esc(s.image.alt || s.label)}" muted loop playsinline preload="none"></video>`
          : img(s.image.src, s.image.alt || s.label, 'cover-img')}
      </div>
    </div>
    ${tag(s.label)}`,
  enter(el) { const v = el.querySelector('video'); if (v) { v.currentTime = 0; v.play().catch(() => {}) } },
  leave(el) { el.querySelector('video')?.pause() },
}
