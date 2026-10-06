// Light slide: a drawing with a numbered key. Hovering or focusing a key
// item highlights its spot on the drawing, and the reverse.
// Fields: eyebrow, title, image{src, alt} | drawing (name of an SVG below),
//         items[{n, label, spot?:[x,y]}]
//   spot is in stage px; items without one get no marker (an image drawing
//   also shows a placeholder note until positions are supplied).
//   A drawing is laid out full width with the key underneath; it plays in
//   from the ground up (see the .s-keyed.wide rules in slides.css).
import { esc, img, nBand, placeholderTag, rich } from '../lib/html.js'
import plazaAscent from '../assets/svg/plaza-ascent.svg?raw'

const DRAWINGS = { 'plaza-ascent': plazaAscent }

export default {
  render: (s) => {
    const missing = s.items.some((it) => !it.spot)
    return `
    <p class="abs eyebrow" data-in="up">${esc(s.eyebrow)}</p>
    <h1 class="abs title" data-in="up">${esc(s.title)}</h1>
    ${s.drawing
      ? `<div class="abs drawing svg">${DRAWINGS[s.drawing]}</div>`
      : `<div class="abs drawing" data-in="fade">${img(s.image.src, s.image.alt)}${missing ? placeholderTag('Placeholder · spot positions needed from the source diagram') : ''}</div>
    <span class="hairline drawing-rule" data-in="line"></span>`}
    ${s.items.filter((it) => it.spot).map((it) => `<button class="abs spot" data-spot="${esc(it.n)}" style="left:${it.spot[0]}px;top:${it.spot[1]}px" aria-label="${esc(it.label.replace(/<br>/g, ' '))}">${esc(it.n)}</button>`).join('')}
    <ol class="abs key">
      ${s.items.map((it, i) => `<li data-in="up"${s.drawing ? ` data-at="${(2.4 + i * 0.06).toFixed(2)}"` : ''}><button data-spot="${esc(it.n)}"><span class="n">${esc(it.n)}</span><span class="l">${rich(it.label)}</span></button></li>`).join('')}
    </ol>
    ${nBand([0, 963, 1920, 117], { origin: [-21, 726 - 963] })}`
  },
  // A drawing builds from the ground up: ground line, building, the ascent,
  // people, then the sightlines and connections draw out and the levels tick up.
  enter(el, tl) {
    const svg = el.querySelector('.drawing.svg svg')
    if (!svg) return
    const q = (sel) => [...svg.querySelectorAll(sel)]
    const draw = (paths, at, dur, stagger = 0) => paths.forEach((p, i) => {
      const len = Math.ceil(p.getTotalLength())
      tl.fromTo(p, { strokeDasharray: `${len} ${len}`, strokeDashoffset: len }, { strokeDashoffset: 0, duration: dur, ease: 'power2.inOut', clearProps: 'strokeDasharray,strokeDashoffset' }, at + i * stagger)
    })
    // only groups without a transform of their own move; everything else just fades
    const show = (els, at, from = {}, stagger = 0.05, dur = 0.5) =>
      tl.fromTo(els, { opacity: 0, ...from }, { opacity: 1, ...('y' in from ? { y: 0 } : {}), duration: dur, ease: 'power2.out', stagger, clearProps: 'opacity' }, at)
    draw(q('#pa-ground'), 0.2, 1.1)
    show(q('#pa-trees > g, #pa-car'), 0.5, { y: 12 }, 0.08)
    show(q('#pa-building'), 0.55, { y: -24 }, 0, 0.8)
    show(q('#pa-cols rect'), 0.9, {}, 0.06)
    tl.fromTo(svg.querySelector('#pa-ascent'), { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1, ease: 'power2.inOut', clearProps: 'clipPath' }, 1.0)
    show(q('#pa-terrace, #pa-rails, #pa-planters'), 1.3, {}, 0.08)
    show(q('#pa-people > g'), 1.5, { y: 6 }, 0.03, 0.35)
    show(q('#pa-elev text'), 1.6, { y: 8 }, 0.12, 0.4)
    show(q('#pa-labels text'), 1.9, {}, 0.05)
    draw(q('.pa-sight'), 2.1, 0.8, 0.15)
    draw(q('.pa-conn'), 2.3, 1.2, 0.2)
    show(q('.pa-sight-head, .pa-conn-head, .pa-lbl-wrap, .pa-lbl-conn'), 2.9, {}, 0.04, 0.35)
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
