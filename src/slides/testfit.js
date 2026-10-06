// Test-fit plan with Low Rise / High Rise and Open / Perimeter toggles that
// swap the plan and stats in place.
// Fields: eyebrow, fits{ "low-open": {...}, ... }, show: "low-open"
//   each fit: {rise, layout, title, seats, seatsDetail, rsf, area, plan{src, alt, box}}
import { gsap } from 'gsap'
import { esc, img, nBand, rich, ruleBar } from '../lib/html.js'
import { reducedMotion } from '../motion.js'

const RISE = [['low', 'Low Rise'], ['high', 'High Rise']]
const LAYOUT = [['open', 'Open'], ['perimeter', 'Perimeter']]

const fitHtml = (s, key) => {
  const f = s.fits[key]
  return `
    <p class="abs eyebrow" data-in="up">${esc(s.eyebrow)} | ${esc(f.rise === 'low' ? 'Low-Rise' : 'High-Rise')}</p>
    <h1 class="abs title" data-in="up">${esc(f.title)}</h1>
    <p class="abs big seats" data-in="up">${esc(f.seats)}</p>
    <p class="abs small seats-d" data-in="up">${rich(f.seatsDetail)}</p>
    <p class="abs big rsf" data-in="up">${esc(f.rsf)}</p>
    <p class="abs small area" data-in="up">${esc(f.area)}</p>`
}

// plan.box is stage px [left, top, width, height].
const box = ([l, t, w, h]) => `left:${l}px;top:${t}px;width:${w}px;height:${h}px`
const planHtml = (f) => `<div class="pimg" style="${box(f.plan.box)}">${img(f.plan.src, f.plan.alt)}</div>`

const toggle = (name, opts, cur) => `<div class="seg" role="group" aria-label="${name}">${opts.map(([v, l]) =>
  `<button data-${name}="${v}" aria-pressed="${v === cur}">${l}</button>`).join('')}</div>`

export default {
  render: (s) => {
    const f = s.fits[s.show]
    return `
    <div class="abs panel"></div>
    <div class="abs text">${fitHtml(s, s.show)}</div>
    ${ruleBar()}
    ${nBand([0, 887, 800, 193], { origin: [-1146, 0] })}
    <div class="abs plan" data-in="fade">${planHtml(f)}</div>
    <div class="abs toggles" data-interactive>${toggle('rise', RISE, f.rise)}${toggle('layout', LAYOUT, f.layout)}</div>`
  },
  mount(el, s) {
    const text = el.querySelector('.text')
    const plan = el.querySelector('.plan')
    let cur = s.show
    const set = (key, animate = true) => {
      if (!s.fits[key] || key === cur) return
      cur = key
      const f = s.fits[key]
      el.querySelectorAll('[data-rise]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.rise === f.rise))
      el.querySelectorAll('[data-layout]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.layout === f.layout))
      const apply = () => {
        text.innerHTML = fitHtml(s, key)
        plan.innerHTML = planHtml(f)
        plan.querySelectorAll('[data-src]').forEach((n) => { n.src = n.dataset.src; n.removeAttribute('data-src') })
      }
      if (!animate || reducedMotion.matches) return apply()
      gsap.timeline()
        .to([text, plan], { autoAlpha: 0, duration: 0.2, ease: 'power1.in' })
        .add(apply)
        .to([text, plan], { autoAlpha: 1, duration: 0.35, ease: 'power1.out' })
        .add(() => gsap.from(text.children, { y: 12, duration: 0.4, stagger: 0.04, ease: 'power3.out' }), '<')
    }
    const now = () => s.fits[cur]
    el.querySelectorAll('[data-rise]').forEach((b) => b.addEventListener('click', () => set(`${b.dataset.rise}-${now().layout}`)))
    el.querySelectorAll('[data-layout]').forEach((b) => b.addEventListener('click', () => set(`${now().rise}-${b.dataset.layout}`)))
    el._setFit = set
  },
  // Coming back to the slide shows its own fit again.
  leave(el, s) { el._setFit?.(s.show, false) },
}
