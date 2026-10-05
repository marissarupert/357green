// Full-bleed muted looping video. Fields: video{src, poster, label, zoom?, focus?}
// zoom/focus crop the poster still (1 = fill, focus = transform origin).
// With no src the poster shows with the "Video Animation" placeholder box.
import { esc, img, placeholderTag } from '../lib/html.js'

export default {
  render: (s) => s.video.src
    ? `<video class="abs fill" data-src="${esc(s.video.src)}" poster="${esc(s.video.poster || '')}" muted loop playsinline preload="none"></video>`
    : `<div class="abs fill" style="transform:scale(${Number(s.video.zoom) || 1});transform-origin:${esc(s.video.focus || '50% 50%')}">${img(s.video.poster, '', 'cover-img')}</div>
       <div class="abs vbox" data-in="fade"><p>${esc(s.video.label || 'Video Animation')}</p>${placeholderTag('Placeholder · add video src in content.js')}</div>`,
  enter(el) { const v = el.querySelector('video'); if (v) { v.currentTime = 0; v.play().catch(() => {}) } },
  leave(el) { el.querySelector('video')?.pause() },
}
