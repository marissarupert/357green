// Interactive podium axo (Built to Connect). The drawing is the traced SCB
// podium circulation sheet; its geometry lives in assets/svg/podium-axo.svg.
// On entry the context fades in, the podium pieces drop into place one by one,
// then the paseo route draws itself down from Halsted Street to Green Street.
// Hover a piece (or its key entry) to pick it out; click or Enter lifts it off
// its footprint, again or Esc sets it back. "Paseo route" shows or hides the
// route and the visual connections.
import { gsap } from 'gsap'
import svg from '../assets/svg/podium-axo.svg?raw'
import { esc } from './html.js'
import { reducedMotion } from '../motion.js'

// piece keys as they appear in the drawing, in key order
export const PIECES = [
  ['paseo', 'Paseo'],
  ['activated_plaza', 'Activated plaza'],
  ['retail', 'Retail'],
  ['residential_lobby', 'Office lobby'],
  ['residential_bike_room', 'Bike room'],
]
const DROP = ['activated_plaza', 'paseo', 'retail', 'residential_lobby', 'residential_bike_room'] // entrance order
const LIFT = 150 // drawing units a selected piece rises

export const render = () => `
  <div class="abs axo" data-interactive>
    ${svg}
    <ul class="axo-key">
      ${PIECES.map(([k, name], i) => `<li data-in="up" data-at="${(1.1 + i * 0.08).toFixed(2)}"><button type="button" data-piece="${k}"><i></i>${esc(name)}</button></li>`).join('')}
    </ul>
    <div class="axo-ctl" data-in="up" data-at="1.5">
      <div class="seg"><button type="button" data-act="route" aria-pressed="true">Paseo route</button></div>
    </div>
  </div>`

export function mount(el) {
  const root = el.querySelector('.axo')
  const draw = root.querySelector('svg')
  const layer = draw.querySelector('#axo-pieces')
  const pieces = [...layer.querySelectorAll('.piece')]
  const byKey = (k) => layer.querySelector(`.piece[data-piece="${k}"]`)
  const forKey = (k) => draw.querySelectorAll(`[data-for="${k}"]`)
  const routeBtn = root.querySelector('[data-act="route"]')
  let selected = null, hot = null

  // the route draws from its Halsted end, so set its dash to its length
  const route = draw.querySelector('#axo-route_base')
  route.style.setProperty('--len', Math.ceil(route.getTotalLength()))

  function lift(k, amount) {
    gsap.to(byKey(k), { y: -amount, duration: reducedMotion.matches ? 0 : 0.45, ease: 'power2.out', overwrite: 'auto' })
    forKey(k).forEach((n) => {
      if (n.matches('.leader') && amount > 0) {
        n.setAttribute('d', `M${n.dataset.x},${n.dataset.y} V${n.dataset.y - amount}`)
        n.style.setProperty('--len', amount)
      }
      n.classList.toggle('is-on', amount > 0)
    })
  }
  function paint() {
    pieces.forEach((p) => {
      p.classList.toggle('is-hot', p.dataset.piece === hot)
      p.classList.toggle('is-selected', p.dataset.piece === selected)
    })
    root.querySelectorAll('.axo-key button').forEach((b) => b.classList.toggle('on', b.dataset.piece === (hot || selected)))
    draw.classList.toggle('has-focus', !!(hot || selected))
  }
  // keep the drawing's stacking order, except a lifted piece draws on top
  const restoreOrder = () => pieces.forEach((p) => layer.appendChild(p))

  function reset() {
    pieces.forEach((p) => lift(p.dataset.piece, 0))
    selected = null
    setTimeout(() => { if (!selected) restoreOrder() }, 450)
    paint()
  }
  function select(k) {
    if (selected === k) return reset()
    if (selected) lift(selected, 0)
    restoreOrder()
    selected = k
    layer.appendChild(byKey(k))
    lift(k, LIFT)
    paint()
  }
  const showRoute = (on) => { routeBtn.setAttribute('aria-pressed', on); draw.classList.toggle('show-route', on) }

  const hover = (k) => { hot = k; paint() }
  const unhover = (k) => { if (hot === k) { hot = null; paint() } }
  const bind = (n, k) => {
    n.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') hover(k) })
    n.addEventListener('pointerleave', () => unhover(k))
    n.addEventListener('focus', () => hover(k))
    n.addEventListener('blur', () => unhover(k))
    n.addEventListener('click', (e) => { e.stopPropagation(); select(k) })
  }
  pieces.forEach((p) => {
    bind(p, p.dataset.piece)
    p.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); select(p.dataset.piece) } })
  })
  root.querySelectorAll('.axo-key button').forEach((b) => bind(b, b.dataset.piece))
  draw.addEventListener('click', () => { if (selected) reset() })
  routeBtn.addEventListener('click', () => showRoute(routeBtn.getAttribute('aria-pressed') !== 'true'))
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && selected) { e.preventDefault(); e.stopPropagation(); reset() }
  })

  el._axo = {
    enter(tl) {
      hot = null; paint(); showRoute(false)
      tl.fromTo(draw.querySelector('#axo-context'), { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power1.out', clearProps: 'opacity' }, 0.2)
      DROP.forEach((k, i) => tl.fromTo(byKey(k), { y: -90, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', clearProps: 'opacity' }, 0.45 + i * 0.12))
      tl.fromTo(draw.querySelector('#axo-circulation_arrows'), { opacity: 0 }, { opacity: 1, duration: 0.5, clearProps: 'opacity' }, 1.15)
      tl.call(() => showRoute(true), null, 1.5)
    },
    leave() {
      gsap.killTweensOf(pieces)
      gsap.set(pieces, { y: 0 })
      gsap.set([...pieces, draw.querySelector('#axo-context'), draw.querySelector('#axo-circulation_arrows')], { clearProps: 'opacity' })
      pieces.forEach((p) => forKey(p.dataset.piece).forEach((n) => n.classList.remove('is-on')))
      selected = null; hot = null
      restoreOrder(); paint(); showRoute(false)
    },
  }
}
