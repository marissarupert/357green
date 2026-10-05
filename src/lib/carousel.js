// Photo carousel with the deck's copper/grey bars (slides 6 and 7).
// photos: [{src, alt}] or {placeholder: "label"} for a photo still to come.
import { esc, img, placeholderTag } from './html.js'

export const carousel = (photos, cls, barsCls) => `
  <div class="carousel ${cls}" data-interactive data-carousel>
    ${photos.map((p, i) => `<div class="frame${i ? '' : ' on'}${p.placeholder ? ' ph' : ''}">${
      p.placeholder ? placeholderTag(`Placeholder · ${p.placeholder}`) : img(p.src, p.alt, 'cover-img')}</div>`).join('')}
  </div>
  ${photos.length > 1 ? `<div class="bars ${barsCls}" data-interactive>${photos.map((p, i) =>
    `<button class="${i ? '' : 'on'}" aria-label="Photo ${i + 1} of ${photos.length}${p.placeholder ? ' (placeholder)' : ''}"></button>`).join('')}</div>` : ''}`

export function mountCarousel(el) {
  const frames = [...el.querySelectorAll('[data-carousel] .frame')]
  const bars = [...el.querySelectorAll('.bars button')]
  if (frames.length < 2) return
  let i = 0
  const show = (n) => {
    i = (n + frames.length) % frames.length
    frames.forEach((f, j) => f.classList.toggle('on', j === i))
    bars.forEach((b, j) => b.classList.toggle('on', j === i))
  }
  bars.forEach((b, j) => b.addEventListener('click', () => show(j)))
  el.querySelector('[data-carousel]').addEventListener('click', () => show(i + 1))
}
