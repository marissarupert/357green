// Light slide: tower section with a floor-to-floor detail and a zone legend.
// On entry the section wipes up floor by floor, the detail follows, the zoom
// box on the tower pulses once, and the callouts draw out top to bottom.
// Hovering or focusing a legend item fades the section back except that zone.
// Fields: eyebrow, title,
//         drawing{src, alt, box:[l,t,w,h]} or drawing{svg, alt, box},
//         detail{src, alt, box, size?, note?{text, sub?, at:[x,y], arrowTo?:[x,y]} in the detail image's px}, ring:[l,t,w,h],
//         zones[{key, label, swatch, src?, box?}], callouts[{text, y, x1, x2, x}]
//   drawing.svg names a vector redraw (tools/section-svg.py) shown inline; its
//   zones are groups marked data-zone, so the raster zone overlays aren't needed.
import { esc, img, nBand, rich, ruleBar } from '../lib/html.js'
import buildingSection from '../assets/svg/building-section.svg?raw'

const SVGS = { 'building-section': buildingSection }

const box = ([l, t, w, h]) => `left:${l}px;top:${t}px;width:${w}px;height:${h}px`

// A label over the floor detail, with an arrow up to the point it names.
const note = (d) => {
  const pct = ([x, y]) => [x / d.size[0] * 100, y / d.size[1] * 100].map((v) => v.toFixed(1))
  const [l, t] = pct(d.note.at)
  const arrow = d.note.arrowTo ? (() => { const [, t0] = pct(d.note.arrowTo); return `<span class="detail-arrow" style="left:${l}%;top:${t0}%;height:${(t - t0).toFixed(1)}%"></span>` })() : ''
  return `${arrow}<span class="detail-note" aria-hidden="true" style="left:${l}%;top:${t}%"><b>${esc(d.note.text)}</b>${d.note.sub ? `<span>${esc(d.note.sub)}</span>` : ''}</span>`
}

export default {
  render: (s) => `
    <p class="abs eyebrow" data-in="up">${esc(s.eyebrow)}</p>
    <h1 class="abs title" data-in="up">${esc(s.title)}</h1>
    ${ruleBar()}
    <div class="abs drawing${s.drawing.svg ? ' svg' : ''}" data-in="wipe" data-at="0.35" style="${box(s.drawing.box)}">
      ${s.drawing.svg ? SVGS[s.drawing.svg] : img(s.drawing.src, s.drawing.alt)}
    </div>
    ${s.drawing.svg ? '' : `<div class="abs zone-dim" style="${box(s.drawing.box)}"></div>
    ${s.zones.map((z) => `<div class="abs zone" data-zone="${esc(z.key)}" style="${box(z.box)}">${img(z.src, '')}</div>`).join('')}`}
    <span class="abs ring" style="${box(s.ring)}"></span>
    <div class="abs detail" data-in="up" data-at="1.1" style="${box(s.detail.box)}">${img(s.detail.src, s.detail.alt)}${s.detail.note ? note(s.detail) : ''}</div>
    ${s.callouts.map((c, i) => `
      <span class="abs leader" data-in="draw" data-at="${(1.5 + i * 0.28).toFixed(2)}" style="left:${c.x1}px;top:${c.y}px;width:${c.x2 - c.x1}px"></span>
      <p class="abs callout" data-in="fade" data-at="${(1.85 + i * 0.28).toFixed(2)}" style="left:${c.x}px;top:${c.y - 10}px">${rich(c.text)}</p>`).join('')}
    <ul class="abs legend">
      ${s.zones.map((z, i) => `<li data-in="up" data-at="${(1.4 + i * 0.1).toFixed(2)}"><button data-zone="${esc(z.key)}"><i style="background:${esc(z.swatch)}"></i>${esc(z.label)}</button></li>`).join('')}
    </ul>
    ${nBand([1487, 0, 433, 1080], { vertical: true, origin: [1394 - 1487, -378] })}`,

  mount(el) {
    const show = (k) => {
      el.classList.toggle('zoning', !!k)
      el.querySelectorAll('[data-zone]').forEach((n) => n.classList.toggle('on', n.dataset.zone === k))
    }
    el.querySelectorAll('.legend button').forEach((b) => {
      b.addEventListener('pointerenter', () => show(b.dataset.zone))
      b.addEventListener('pointerleave', () => show(null))
      b.addEventListener('focus', () => show(b.dataset.zone))
      b.addEventListener('blur', () => show(null))
    })
  },
}
