// Two diagrams with leader-line callouts. Hovering or focusing a label
// highlights its spot on the diagram, and the reverse.
// Fields: eyebrow, title, diagrams[{src, alt, box:[l,t,w,h]}],
//         callouts[{label, at:[x,y] label top-left, line:[x1,x2,y], dot:[x,y]}],
//         notes[{title, body, x, y}]
import { esc, img, nBand, rich, ruleBar } from '../lib/html.js'

export default {
  render: (s) => `
    <p class="abs eyebrow" data-in="up">${esc(s.eyebrow)}</p>
    <h1 class="abs title" data-in="up">${esc(s.title)}</h1>
    ${ruleBar()}
    ${s.diagrams.map((d) => `<div class="abs diagram" data-in="fade" style="left:${d.box[0]}px;top:${d.box[1]}px;width:${d.box[2]}px;height:${d.box[3]}px">${img(d.src, d.alt)}</div>`).join('')}
    <div class="abs callouts" data-in="fade">
      ${s.callouts.map((c, i) => `
        <span class="leader" data-spot="${i}" style="left:${Math.min(c.line[0], c.line[1])}px;top:${c.line[2]}px;width:${Math.abs(c.line[1] - c.line[0])}px"></span>
        <button class="dot" data-spot="${i}" style="left:${c.dot[0]}px;top:${c.dot[1]}px" aria-label="${esc(c.label.replace(/<br>/g, ' '))}"></button>
        <button class="label" data-spot="${i}" style="left:${c.at[0]}px;top:${c.at[1]}px">${rich(c.label)}</button>`).join('')}
    </div>
    ${s.notes.map((n) => `
      <div class="abs note" data-in="up" style="left:${n.x}px;top:${n.y}px">
        <h3>${esc(n.title)}</h3><span class="hairline"></span><p>${rich(n.body)}</p>
      </div>`).join('')}
    ${nBand([1793, 0, 127, 1080], { vertical: true, origin: [1792 - 1793, -633] })}`,
  mount(el) {
    const set = (i) => el.querySelectorAll('[data-spot]').forEach((n) => n.classList.toggle('active', n.dataset.spot === i))
    el.querySelectorAll('.callouts [data-spot]').forEach((n) => {
      n.addEventListener('pointerenter', () => set(n.dataset.spot))
      n.addEventListener('pointerleave', () => set(null))
      n.addEventListener('focus', () => set(n.dataset.spot))
      n.addEventListener('blur', () => set(null))
    })
  },
}
