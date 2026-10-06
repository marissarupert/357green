// Light slide: the two tower elevations with level markers and material callouts.
// On entry the ground draws, each elevation rises from it, the level markers
// tick on as the building passes them, then the callouts reach out to both
// towers top to bottom. Hover or focus a level to run a guide across both
// towers; hover or focus a callout (or one of its terracotta points) to pick
// out what it points at.
// Fields: eyebrow,
//   fit{scale, x, y}  maps source-drawing px to stage px (stage = x + scale * px)
//   and, all in source-drawing px:
//   drawings[{src, alt, box:[l,t,w,h]}] (west, east), ground:[x1, x2, y],
//   dims{x:[west, east], top}, levelLines:[[x1, x2], [x1, x2]],
//   levels[{label, value, y, note?}] (note: a copper floor tag under the east marker), labelX, callouts[{text, y, dots:[x, x], anchor?}] (text may use <br>)
//   anchor: 'last' hangs a multi-line label above its leader (default centred)
import { esc, img, nBand, rich } from '../lib/html.js'

const WIPE = [0.45, 0.7]   // when each elevation starts rising
const RISE = 1.6           // matches the "wipe" entrance (power2.inOut)
// Time for a power2.inOut tween to reach fraction f, so a marker ticks on just
// as the rising building reaches it.
const reach = (f) => (f < 0.5 ? Math.cbrt(f / 4) : 1 - Math.cbrt(2 * (1 - f)) / 2) * RISE

export default {
  render: (s) => {
    const { scale: k, x: ox, y: oy } = s.fit
    const X = (v) => +(ox + k * v).toFixed(1)
    const Y = (v) => +(oy + k * v).toFixed(1)
    const L = (v) => +(k * v).toFixed(1)
    const box = ([l, t, w, h]) => `left:${X(l)}px;top:${Y(t)}px;width:${L(w)}px;height:${L(h)}px`
    const [gx1, gx2, gy] = s.ground
    const cTime = (i) => 2.25 + i * 0.22
    return `
    <p class="abs eyebrow" data-in="up">${esc(s.eyebrow)}</p>
    ${s.drawings.map((d, i) => `<div class="abs drawing" data-in="wipe" data-at="${WIPE[i]}" style="${box(d.box)}">${img(d.src, d.alt)}</div>`).join('')}
    <span class="abs ground" data-in="line" data-at="0.15" style="left:${X(gx1)}px;top:${Y(gy)}px;width:${L(gx2 - gx1)}px"></span>
    ${s.dims.x.map((x, i) => `<span class="abs dim" data-in="rise" data-at="${WIPE[i]}" style="left:${X(x)}px;top:${Y(s.dims.top)}px;height:${L(gy - s.dims.top)}px"></span>`).join('')}
    ${s.levels.map((lv, j) => `<span class="abs guide" data-level="${j}" style="left:${X(s.levelLines[0][0])}px;top:${Y(lv.y)}px;width:${L(s.levelLines[1][1] - s.levelLines[0][0])}px"></span>`).join('')}
    ${s.levels.map((lv, j) => s.levelLines.map(([x1, x2], i) => {
      const [, t, , h] = s.drawings[i].box
      const at = (WIPE[i] + reach((t + h - lv.y) / h)).toFixed(2)
      return `<button class="abs level ${i ? 'east' : 'west'}" data-level="${j}" data-in="fade" data-at="${at}" style="left:${X(x1)}px;top:${Y(lv.y)}px;width:${L(x2 - x1)}px">
        <span class="rule"></span><span class="tick" style="left:${L(s.dims.x[i] - x1)}px"></span>
        <span class="t">${esc(lv.label)}</span><span class="v">${esc(lv.value)}</span>${lv.note && i ? `<span class="note">${esc(lv.note)}</span>` : ''}
      </button>`
    }).join('')).join('')}
    ${s.callouts.map((c, i) => {
      const [d1, d2] = c.dots, at = cTime(i)
      return `
      <span class="abs lead" data-co="${i}" data-in="line" data-at="${(at + 0.1).toFixed(2)}" style="left:${X(d1)}px;top:${Y(c.y)}px;width:${L(d2 - d1)}px"></span>
      ${c.dots.map((d) => `<span class="abs dot" data-co="${i}" data-in="pop" data-at="${(at + 0.55).toFixed(2)}" style="left:${X(d)}px;top:${Y(c.y)}px;--pulse:${(at + 0.85).toFixed(2)}s"></span>`).join('')}
      <button class="abs callout${c.anchor ? ` at-${esc(c.anchor)}` : ''}" data-co="${i}" data-in="fade" data-at="${at.toFixed(2)}" style="left:${X(s.labelX)}px;top:${Y(c.y)}px">${rich(c.text)}</button>`
    }).join('')}
    ${nBand([0, 963, 1920, 117], { origin: [-21, 726 - 963] })}`
  },

  mount(el) {
    const pick = (attr, v) => el.querySelectorAll(`[${attr}]`).forEach((n) => n.classList.toggle('on', n.getAttribute(attr) === v))
    const bind = (sel, attr) => el.querySelectorAll(sel).forEach((b) => {
      const on = () => pick(attr, b.getAttribute(attr)), off = () => pick(attr, null)
      b.addEventListener('pointerenter', on); b.addEventListener('focus', on)
      b.addEventListener('pointerleave', off); b.addEventListener('blur', off)
    })
    bind('.level', 'data-level')
    bind('.callout, .dot', 'data-co')
  },
}
