// The Paseo: two views on one slide, switched by the tabs on the band.
//   "Podium & Route": text beside the interactive podium axo (lib/podium.js).
//   "Plaza & Ascent": the plaza section drawing with its numbered key; hovering
//   or focusing a key item lights up its marker on the drawing, and the reverse.
// Presenting, the next-slide key first steps from the podium to the plaza.
// Fields: eyebrow, title, body, items[{n, label, spot?:[x,y]}] (spot in stage px)
import { gsap } from 'gsap'
import { esc, nBand, rich, ruleBar } from '../lib/html.js'
import * as podium from '../lib/podium.js'
import keyed from './keyed.js'
import plazaAscent from '../assets/svg/plaza-ascent.svg?raw'

const VIEWS = [['route', 'Podium & Route'], ['plaza', 'Plaza & Ascent']]

function show(el, view, { animate = true } = {}) {
  if (el.dataset.view === view) return
  el.dataset.view = view
  el.querySelectorAll('.pv-tabs button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === view)))
  // the plaza drawing builds itself each time it comes into view
  if (view === 'plaza' && animate) {
    el._plazaTl?.kill()
    el._plazaTl = gsap.timeline()
    keyed.enter(el, el._plazaTl)
  }
}

export default {
  render: (s) => `
    <p class="abs eyebrow" data-in="up">${esc(s.eyebrow)}</p>
    <h1 class="abs title" data-in="up">${esc(s.title)}</h1>
    <div class="pv pv-route">
      ${ruleBar()}
      <p class="abs body" data-in="up">${rich(s.body)}</p>
      ${podium.render()}
    </div>
    <div class="pv pv-plaza">
      <div class="abs drawing svg">${plazaAscent}</div>
      ${s.items.filter((it) => it.spot).map((it) => `<button class="abs spot" data-spot="${esc(it.n)}" style="left:${it.spot[0]}px;top:${it.spot[1]}px" aria-label="${esc(it.label.replace(/<br>/g, ' '))}">${esc(it.n)}</button>`).join('')}
      <ol class="abs key">
        ${s.items.map((it) => `<li><button data-spot="${esc(it.n)}"${it.spot ? '' : ' class="no-spot"'}><span class="n">${esc(it.n)}</span><span class="l">${rich(it.label)}</span></button></li>`).join('')}
      </ol>
    </div>
    ${nBand([0, 963, 1920, 117], { origin: [-21, 726 - 963] })}
    <div class="abs pv-tabs" data-interactive data-in="up" data-at="1.2" role="group" aria-label="View">
      ${VIEWS.map(([v, label], i) => `<button type="button" data-view="${v}" aria-pressed="${i === 0}">${esc(label)}</button>`).join('')}
    </div>`,

  mount(el) {
    el.dataset.view = 'route'
    podium.mount(el)
    keyed.mount(el)
    el.querySelectorAll('.pv-tabs button').forEach((b) => b.addEventListener('click', () => show(el, b.dataset.view)))
  },
  enter(el, tl, s, { backwards } = {}) {
    show(el, backwards ? 'plaza' : 'route', { animate: false })
    el._axo?.enter(tl)
  },
  // the next/previous keys move between the two views before leaving the slide
  step(el, dir) {
    if (dir > 0 && el.dataset.view === 'route') { show(el, 'plaza'); return true }
    if (dir < 0 && el.dataset.view === 'plaza') { show(el, 'route'); return true }
    return false
  },
  leave(el) {
    el._plazaTl?.kill()
    el._axo?.leave()
  },
}
