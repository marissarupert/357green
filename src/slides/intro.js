// Dark text panel beside a full-height image.
// Fields: title, body, kicker, image{src, alt, focus?, video?}, bleed?
//   bleed: true runs the image under the whole slide (slow push-in) with the
//   text in a left column over a midnight gradient; focus is the part of the
//   image kept in frame, as CSS object-position (e.g. "50% 30%"). With bleed,
//   image.video plays a muted loop in place of the still (its poster).
import { esc, img, loopVideo, pauseLoop, playLoop, rich, ruleBar } from '../lib/html.js'

export default {
  render: (s) => `
    ${s.bleed
      ? `<div class="abs media bleed"${s.image.focus ? ` style="--focus:${esc(s.image.focus)}"` : ''}><div class="push" data-in="push">${s.image.video ? loopVideo(s.image.video, s.image.src, s.image.alt, 'cover-img') : img(s.image.src, s.image.alt, 'cover-img')}</div></div>
    <div class="abs scrim" aria-hidden="true"></div>`
      : `<div class="abs media">${img(s.image.src, s.image.alt, 'cover-img')}</div>
    <div class="abs panel"></div>`}
    <h1 class="abs title" data-in="up">${rich(s.title)}</h1>
    ${ruleBar()}
    <p class="abs body" data-in="up">${rich(s.body)}</p>
    <p class="abs kicker" data-in="up">${rich(s.kicker)}</p>`,
  enter: playLoop,
  leave: pauseLoop,
}
