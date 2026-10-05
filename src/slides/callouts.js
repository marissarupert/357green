// Two diagrams with leader-line callouts. On entry each callout plays in
// turn, top to bottom: the dot pops (and pulses once), the line draws out to
// its label, the label fades in. Hovering or focusing a label highlights its
// spot on the diagram, and the reverse, and opens a zoom lens on the line
// showing that spot close up. Clicking (or Enter) locks a callout: the rest
// of the drawings dim around a spotlight until it's clicked again or Esc.
// Fields: eyebrow, title, diagrams[{src, alt, box:[l,t,w,h]}],
//         callouts[{label, at:[x,y] label top-left, line:[x1,x2,y], dot:[x,y]}],
//         notes[{title, body, x, y}]
import { esc, img, nBand, rich, ruleBar } from '../lib/html.js'

const START = 0.7 // seconds before the first callout
const STEP = 0.32 // seconds between callouts
const ZOOM = 2.6 // lens magnification
const LENS = 180 // lens diameter, stage px

const inBox = ([x, y], [l, t, w, h]) => x >= l && x <= l + w && y >= t && y <= t + h

export default {
  render: (s) => {
    // play callouts top to bottom, whichever drawing they belong to
    const order = s.callouts.map((c, i) => [c.line[2], i]).sort((a, b) => a[0] - b[0]).map(([, i]) => i)
    const at = (i) => START + order.indexOf(i) * STEP
    return `
    <p class="abs eyebrow" data-in="up">${esc(s.eyebrow)}</p>
    <h1 class="abs title" data-in="up">${esc(s.title)}</h1>
    ${ruleBar()}
    ${s.diagrams.map((d) => `<div class="abs diagram" data-in="fade" style="left:${d.box[0]}px;top:${d.box[1]}px;width:${d.box[2]}px;height:${d.box[3]}px">${img(d.src, d.alt)}</div>`).join('')}
    <div class="abs dim" aria-hidden="true"></div>
    <div class="abs callouts">
      <div class="lens" aria-hidden="true"></div>
      ${s.callouts.map((c, i) => {
        // the line grows from the dot's end toward the label
        const fromLeft = Math.abs(c.dot[0] - Math.min(c.line[0], c.line[1])) < Math.abs(c.dot[0] - Math.max(c.line[0], c.line[1]))
        return `
        <span class="leader" data-spot="${i}" data-in="draw" data-at="${(at(i) + 0.1).toFixed(2)}" style="left:${Math.min(c.line[0], c.line[1])}px;top:${c.line[2]}px;width:${Math.abs(c.line[1] - c.line[0])}px;transform-origin:${fromLeft ? 'left' : 'right'} center"></span>
        <button class="dot" data-spot="${i}" data-in="pop" data-at="${at(i).toFixed(2)}" style="left:${c.dot[0]}px;top:${c.dot[1]}px;--pulse:${(at(i) + 0.3).toFixed(2)}s" aria-label="${esc(c.label.replace(/<br>/g, ' '))}"></button>
        <button class="label" data-spot="${i}" data-in="fade" data-at="${(at(i) + 0.55).toFixed(2)}" style="left:${c.at[0]}px;top:${c.at[1]}px">${rich(c.label)}</button>`
      }).join('')}
    </div>
    ${s.notes.map((n) => `
      <div class="abs note" data-in="up" style="left:${n.x}px;top:${n.y}px">
        <h3>${esc(n.title)}</h3><span class="hairline"></span><p>${rich(n.body)}</p>
      </div>`).join('')}
    ${nBand([1793, 0, 127, 1080], { vertical: true, origin: [1792 - 1793, -633] })}`
  },
  mount(el, s) {
    const lens = el.querySelector('.lens')
    const dim = el.querySelector('.dim')
    let locked = null

    // Lens sits on the leader line, between the drawing and the label, and
    // shows the drawing around the dot at ZOOM.
    const showLens = (i) => {
      const c = s.callouts[i]
      const d = s.diagrams.find((g) => inBox(c.dot, g.box))
      if (!d) return lens.classList.remove('on')
      const [l, t, w, h] = d.box
      const labelEnd = Math.abs(c.line[0] - c.dot[0]) > Math.abs(c.line[1] - c.dot[0]) ? c.line[0] : c.line[1]
      const cx = labelEnd + (labelEnd > c.dot[0] ? -1 : 1) * (LENS / 2 + 20)
      const r = LENS / 2
      Object.assign(lens.style, {
        left: `${cx - r}px`, top: `${c.dot[1] - r}px`,
        backgroundImage: `url("${d.src}")`,
        backgroundSize: `${w * ZOOM}px ${h * ZOOM}px`,
        backgroundPosition: `${r - (c.dot[0] - l) * ZOOM}px ${r - (c.dot[1] - t) * ZOOM}px`,
      })
      lens.classList.add('on')
    }
    const set = (i) => {
      el.querySelectorAll('.callouts [data-spot]').forEach((n) => n.classList.toggle('active', n.dataset.spot === i))
      if (i === null) lens.classList.remove('on')
      else showLens(Number(i))
    }
    const lock = (i) => {
      locked = locked === i ? null : i
      el.classList.toggle('locked', locked !== null)
      el.querySelectorAll('.callouts [data-spot]').forEach((n) => n.classList.toggle('chosen', n.dataset.spot === locked))
      if (locked !== null) {
        const [x, y] = s.callouts[Number(locked)].dot
        dim.style.setProperty('--sx', `${x}px`)
        dim.style.setProperty('--sy', `${y}px`)
      }
      set(locked)
    }
    el._unlock = () => { if (locked !== null) lock(locked) }

    el.querySelectorAll('.callouts [data-spot]').forEach((n) => {
      const i = n.dataset.spot
      n.addEventListener('pointerenter', () => { if (locked === null) set(i) })
      n.addEventListener('pointerleave', () => { if (locked === null) set(null) })
      n.addEventListener('focus', () => { if (locked === null) set(i) })
      n.addEventListener('blur', () => { if (locked === null) set(null) })
      if (n.tagName === 'BUTTON') n.addEventListener('click', () => lock(i))
    })
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && locked !== null) { e.preventDefault(); e.stopPropagation(); lock(locked) }
    })
  },
  leave(el) { el._unlock?.() },
}
