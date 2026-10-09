// Full-bleed render with a label tag; slow push-in on entry.
// Fields: label, image{src, alt}, zoom? (1 = fill), focus? ("50% 50%"),
//         video? (src of a muted looping video shown in place of the still;
//         the still is its poster, so the slide never shows blank)
import { esc, img, loopVideo, pauseLoop, playLoop, tag } from '../lib/html.js'

export default {
  render: (s) => `
    <div class="abs fill render" data-in="push" data-at="0">
      <div class="abs fill" style="transform:scale(${Number(s.zoom) || 1});transform-origin:${esc(s.focus || '50% 50%')}">
        ${s.video
          ? loopVideo(s.video, s.image.src, s.image.alt || s.label, 'cover-img')
          : img(s.image.src, s.image.alt || s.label, 'cover-img')}
      </div>
    </div>
    ${tag(s.label)}`,
  enter: playLoop,
  leave: pauseLoop,
}
