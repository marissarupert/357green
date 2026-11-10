// Two diagrams with leader-line callouts. On entry each callout plays in
// turn, top to bottom: the dot pops (and pulses once), the line draws out to
// its label, the label fades in. Hovering or focusing a label highlights its
// spot on the diagram, and the reverse, and opens a zoom lens on the line
// showing that spot close up. Clicking (or Enter) locks a callout: the rest
// of the drawings dim around a spotlight until it's clicked again or Esc.
// Fields: eyebrow, title, diagrams[{src, alt, box:[l,t,w,h], caption?}] (a caption
//         sets a photo with its label beneath, for a slide with no callouts),
//         callouts[{label, at:[x,y] label top-left, line:[x1,x2,y], dot:[x,y], photo?}],
//         (photo: an image that pops out on hover/click in place of the zoom lens)
//         notes[{title, body, x, y}], leaders?: false (no line from label to dot),
//         noteRules?: false (no rule under each note's title)
import { esc, img, nBand, rich, ruleBar } from '../lib/html.js'

const START = 0.7 // seconds before the first callout
const STEP = 0.32 // seconds between callouts
const ZOOM = 2.6 // lens magnification
const LENS = 180 // lens diameter, stage px
const PHOTO_W = 280 // width of a callout's photo pop-out, stage px

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
    ${s.diagrams.map((d, i) => `<div class="abs diagram${d.caption ? ' photo' : ''}" data-in="fade"${d.caption ? ` data-at="${(0.5 + i * 0.15).toFixed(2)}"` : ''} style="left:${d.box[0]}px;top:${d.box[1]}px;width:${d.box[2]}px;height:${d.box[3]}px">${img(d.src, d.alt)}${d.caption ? `<p class="diagram-cap"><span class="n">${String(i + 1).padStart(2, '0')}</span><span class="t">${rich(d.caption)}</span></p>` : ''}</div>`).join('')}
    <div class="abs dim" aria-hidden="true"></div>
    <div class="abs callouts${s.leaders === false ? ' no-leaders' : ''}">
      <div class="lens" aria-hidden="true"></div>
      ${s.callouts.map((c, i) => {
        // the line grows from the dot's end toward the label
        const fromLeft = Math.abs(c.dot[0] - Math.min(c.line[0], c.line[1])) < Math.abs(c.dot[0] - Math.max(c.line[0], c.line[1]))
        return `
        ${s.leaders === false ? '' : `<span class="leader" data-spot="${i}" data-in="draw" data-at="${(at(i) + 0.1).toFixed(2)}" style="left:${Math.min(c.line[0], c.line[1])}px;top:${c.line[2]}px;width:${Math.abs(c.line[1] - c.line[0])}px;transform-origin:${fromLeft ? 'left' : 'right'} center"></span>`}
        <button class="dot" data-spot="${i}" data-in="pop" data-at="${at(i).toFixed(2)}" style="left:${c.dot[0]}px;top:${c.dot[1]}px;--pulse:${(at(i) + 0.3).toFixed(2)}s" aria-label="${esc(c.label.replace(/<br>/g, ' '))}"></button>
        <button class="label" data-spot="${i}" data-in="fade" data-at="${(at(i) + 0.55).toFixed(2)}" style="left:${c.at[0]}px;top:${c.at[1]}px">${rich(c.label)}</button>`
      }).join('')}
    </div>
    ${s.notes.map((n) => `
      <div class="abs note" data-in="up" style="left:${n.x}px;top:${n.y}px">
        <h3>${esc(n.title)}</h3>${s.noteRules === false ? '' : '<span class="hairline"></span>'}<p>${rich(n.body)}</p>
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
      if (c.photo) return showPhoto(c)
      lens.classList.remove('photo')
      lens.style.width = lens.style.height = ''
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
    // A callout with a photo pops the photo out instead: a card just past the
    // label's end of the line, centred on it, kept on the slide.
    const showPhoto = (c) => {
      const im = new Image()
      im.src = c.photo
      const place = () => {
        const w = PHOTO_W, h = Math.round(PHOTO_W * (im.naturalHeight / im.naturalWidth || 1.3))
        // beside its label: past the end of the label list, centred on it, kept on the slide
        const label = el.querySelector(`.callouts .label[data-spot="${s.callouts.indexOf(c)}"]`)
        const listEnd = Math.max(...[...el.querySelectorAll('.callouts .label')].map((n) => n.offsetLeft + n.offsetWidth))
        const left = s.leaders === false && label ? listEnd + 40 : Math.min(c.line[0], c.line[1]) + 14
        const cy = s.leaders === false && label ? label.offsetTop + label.offsetHeight / 2 : c.dot[1]
        const top = Math.min(Math.max(cy - h / 2, 110), 1080 - 60 - h)
        Object.assign(lens.style, {
          left: `${left}px`, top: `${top}px`, width: `${w}px`, height: `${h}px`,
          backgroundImage: `url("${c.photo}")`, backgroundSize: 'cover', backgroundPosition: '50% 50%',
        })
        lens.classList.add('photo', 'on')
      }
      if (im.complete && im.naturalWidth) place(); else im.onload = place
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
