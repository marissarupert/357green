// Full-bleed muted looping video. Fields: video{src, poster, position?, label, zoom?, focus?}
// position: which part of the video stays in frame (CSS object-position, e.g. "50% 80%").
// zoom/focus crop the poster still (1 = fill, focus = transform origin).
// With no src the poster shows on its own, full bleed with a slow push-in.
import { esc, img, pauseLoop, playLoop } from '../lib/html.js'

export default {
  render: (s) => s.video.src
    ? `<video class="abs fill" data-src="${esc(s.video.src)}" poster="${esc(s.video.poster || '')}"${s.video.position ? ` style="object-position:${esc(s.video.position)}"` : ''} muted loop playsinline preload="none"></video>`
    : `<div class="abs fill" style="transform:scale(${Number(s.video.zoom) || 1});transform-origin:${esc(s.video.focus || '50% 50%')}"><div class="abs fill" data-in="push">${img(s.video.poster, '', 'cover-img')}</div></div>`,
  enter: playLoop,
  leave: pauseLoop,
}
