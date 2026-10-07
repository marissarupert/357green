// Photo carousel with the deck's copper/grey bars (slides 6 and 7).
// photos: [{src, alt, caption?, focus?}] or {placeholder: "label", caption?} for a
// photo still to come. caption shows as the deck's angled label tag.
// While its slide is on screen the carousel turns by itself: the current bar
// fills with copper and the next photo fades in when it is full. Pointing at
// the photo or the bars pauses it; clicking still steps through by hand.
import { esc, img, placeholderTag } from './html.js'

const caption = (p) => (p.caption ? `<p class="img-tag frame-tag"><span>${esc(p.caption)}</span></p>` : '')

export const carousel = (photos, cls, barsCls) => `
  <div class="carousel ${cls}" data-interactive data-carousel>
    ${photos.map((p, i) => `<div class="frame${i ? '' : ' on'}${p.placeholder ? ' ph' : ''}">${
      p.placeholder ? placeholderTag(`Placeholder · ${p.placeholder}`) : img(p.src, p.alt || p.caption || '', 'cover-img').replace('<img ', `<img style="object-position:${esc(p.focus || '50% 50%')}" `)}${caption(p)}</div>`).join('')}
  </div>
  ${photos.length > 1 ? `<div class="bars ${barsCls}" data-interactive>${photos.map((p, i) =>
    `<button class="${i ? '' : 'on'}" aria-label="${esc(p.caption || `Photo ${i + 1}`)} (${i + 1} of ${photos.length})${p.placeholder ? ', placeholder' : ''}"></button>`).join('')}</div>` : ''}`

export function mountCarousel(el) {
  const frames = [...el.querySelectorAll('[data-carousel] .frame')]
  const barsEl = el.querySelector('.bars')
  const bars = [...el.querySelectorAll('.bars button')]
  if (frames.length < 2) return
  let i = 0
  const show = (n) => {
    i = (n + frames.length) % frames.length
    frames.forEach((f, j) => f.classList.toggle('on', j === i))
    bars.forEach((b, j) => b.classList.toggle('on', j === i))
  }
  bars.forEach((b, j) => b.addEventListener('click', () => show(j)))
  const stage = el.querySelector('[data-carousel]')
  stage.addEventListener('click', () => show(i + 1))

  // The copper fill on the current bar is the timer: when it finishes, move on.
  barsEl.addEventListener('animationend', (e) => { if (e.animationName === 'bar-fill') show(i + 1) })
  const pause = (on) => barsEl.classList.toggle('paused', on)
  for (const t of [stage, barsEl]) {
    t.addEventListener('pointerenter', () => pause(true))
    t.addEventListener('pointerleave', () => pause(false))
  }
  el._carousel = {
    start: () => barsEl.classList.add('auto'),
    stop: () => barsEl.classList.remove('auto', 'paused'),
  }
}

export const startCarousel = (el) => el._carousel?.start()
export const stopCarousel = (el) => el._carousel?.stop()
