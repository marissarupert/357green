// Light slide: tower section with a floor-to-floor detail and a zone legend.
// On entry the section wipes up floor by floor, the detail follows, the zoom
// box on the tower pulses once, and the callouts draw out top to bottom.
// Hovering or focusing a legend item fades the section back except that zone.
// Fields: eyebrow, title,
//         drawing{src, alt, box:[l,t,w,h]}, detail{src, alt, box}, ring:[l,t,w,h],
//         zones[{key, label, swatch, src, box}], callouts[{text, y, x1, x2, x}]
import { esc, img, nBand, ruleBar } from '../lib/html.js'

const box = ([l, t, w, h]) => `left:${l}px;top:${t}px;width:${w}px;height:${h}px`

export default {
  render: (s) => `
    <p class="abs eyebrow" data-in="up">${esc(s.eyebrow)}</p>
    <h1 class="abs title" data-in="up">${esc(s.title)}</h1>
    ${ruleBar()}
    <div class="abs drawing" data-in="wipe" data-at="0.35" style="${box(s.drawing.box)}">
      ${img(s.drawing.src, s.drawing.alt)}
    </div>
    <div class="abs zone-dim" style="${box(s.drawing.box)}"></div>
    ${s.zones.map((z) => `<div class="abs zone" data-zone="${esc(z.key)}" style="${box(z.box)}">${img(z.src, '')}</div>`).join('')}
    <span class="abs ring" style="${box(s.ring)}"></span>
    <div class="abs detail" data-in="up" data-at="1.1" style="${box(s.detail.box)}">${img(s.detail.src, s.detail.alt)}</div>
    ${s.callouts.map((c, i) => `
      <span class="abs leader" data-in="draw" data-at="${(1.5 + i * 0.28).toFixed(2)}" style="left:${c.x1}px;top:${c.y}px;width:${c.x2 - c.x1}px"></span>
      <p class="abs callout" data-in="fade" data-at="${(1.85 + i * 0.28).toFixed(2)}" style="left:${c.x}px;top:${c.y - 10}px">${esc(c.text)}</p>`).join('')}
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
