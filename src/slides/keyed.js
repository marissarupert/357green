// Light slide: a drawing with a numbered key. Hovering or focusing a key
// item highlights its spot on the drawing, and the reverse.
// Fields: eyebrow, title, image{src, alt}, items[{n, label, spot?:[x,y]}]
//   spot is in stage px; items without one get no marker, and the drawing
//   shows a placeholder note until positions are supplied.
import { esc, img, nBand, placeholderTag, rich } from '../lib/html.js'

export default {
  render: (s) => {
    const missing = s.items.some((it) => !it.spot)
    return `
    <p class="abs eyebrow" data-in="up">${esc(s.eyebrow)}</p>
    <h1 class="abs title" data-in="up">${esc(s.title)}</h1>
    <div class="abs drawing" data-in="fade">${img(s.image.src, s.image.alt)}${missing ? placeholderTag('Placeholder · spot positions needed from the source diagram') : ''}</div>
    <span class="hairline drawing-rule" data-in="line"></span>
    ${s.items.filter((it) => it.spot).map((it) => `<button class="abs spot" data-spot="${esc(it.n)}" style="left:${it.spot[0]}px;top:${it.spot[1]}px" aria-label="${esc(it.label.replace(/<br>/g, ' '))}">${esc(it.n)}</button>`).join('')}
    <ol class="abs key">
      ${s.items.map((it) => `<li data-in="up"><button data-spot="${esc(it.n)}"><span class="n">${esc(it.n)}</span><span class="l">${rich(it.label)}</span></button></li>`).join('')}
    </ol>
    ${nBand([0, 963, 1920, 117], { origin: [-21, 726 - 963] })}`
  },
  mount(el) {
    const set = (n) => el.querySelectorAll('[data-spot]').forEach((x) => x.classList.toggle('active', x.dataset.spot === n))
    el.querySelectorAll('[data-spot]').forEach((x) => {
      x.addEventListener('pointerenter', () => set(x.dataset.spot))
      x.addEventListener('pointerleave', () => set(null))
      x.addEventListener('focus', () => set(x.dataset.spot))
      x.addEventListener('blur', () => set(null))
    })
  },
}
