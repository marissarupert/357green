import { gsap } from 'gsap'

// Entrance animations. Slide markup opts in with data-in="…"; elements play
// in document order with a short stagger unless they set data-at="seconds".
//
//   up        fade in while rising 24px
//   fade      fade in
//   rule-bar  copper bar wipes in, then the hairline draws
//   line      hairline draws left to right
//   push      slow push-in on a full-bleed image
//   tag       label tag slides in from the left
//   draw      callout leader line draws out from its dot
//   pop       callout dot scales up from nothing
//   count     (automatic) figures inside count up

export const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')

const STEP = 0.08

const FROM = {
  up: (el, tl, at) => tl.from(el, { y: 24, autoAlpha: 0, duration: 0.7, ease: 'power3.out' }, at),
  fade: (el, tl, at) => tl.from(el, { autoAlpha: 0, duration: 0.6, ease: 'power2.out' }, at),
  line: (el, tl, at) => tl.from(el, { scaleX: 0, duration: 0.9, ease: 'power3.inOut' }, at),
  'rule-bar': (el, tl, at) =>
    tl.fromTo(el, { '--bar': 0, '--line': 0 }, { '--bar': 1, duration: 0.45, ease: 'power2.out' }, at)
      .to(el, { '--line': 1, duration: 0.9, ease: 'power3.inOut' }, at + 0.25),
  push: (el, tl, at) => tl.fromTo(el, { scale: 1.08 }, { scale: 1, duration: 7, ease: 'power1.out' }, at),
  tag: (el, tl, at) => tl.from(el, { xPercent: -100, autoAlpha: 0, duration: 0.6, ease: 'power3.out' }, at),
  // These two hand transform back to CSS afterwards so hover states still apply.
  draw: (el, tl, at) => tl.from(el, { scaleX: 0, duration: 0.7, ease: 'power2.inOut', clearProps: 'transform' }, at),
  pop: (el, tl, at) => tl.from(el, { scale: 0, autoAlpha: 0, duration: 0.45, ease: 'back.out(2.4)', clearProps: 'transform,opacity,visibility' }, at),
}

function countUp(el, tl, at) {
  const target = Number(el.dataset.count)
  const comma = el.dataset.comma === '1'
  const fmt = (n) => (comma ? n.toLocaleString('en-US') : String(n))
  // Count with even-width digits so the line doesn't jitter, then hand the
  // final figure back to the font's normal spacing.
  el.style.fontVariantNumeric = 'tabular-nums'
  const release = () => { el.style.fontVariantNumeric = '' }
  const o = { v: 0 }
  tl.fromTo(o, { v: 0 }, {
    v: target, duration: 1.4, ease: 'power2.out',
    onUpdate: () => { el.textContent = fmt(Math.round(o.v)) },
    onComplete: () => { el.textContent = fmt(target); release() },
  }, at)
}

// Build and play the entrance for a slide. Returns the timeline so the deck
// can kill it if the presenter moves on mid-animation.
export function playEntrance(slideEl, extra) {
  const tl = gsap.timeline({ delay: 0.1 })
  let t = 0
  slideEl.querySelectorAll('[data-in]').forEach((el) => {
    const at = el.dataset.at !== undefined ? Number(el.dataset.at) : t
    FROM[el.dataset.in]?.(el, tl, at)
    el.querySelectorAll('.count').forEach((c) => countUp(c, tl, at + 0.1))
    if (el.dataset.at === undefined) t += STEP
  })
  extra?.(tl)
  if (reducedMotion.matches) { tl.progress(1).kill(); settleCounts(slideEl) }
  return tl
}

// Snap everything back to its final state (used when leaving a slide).
export function settle(slideEl, tl) {
  tl?.kill()
  const animated = slideEl.querySelectorAll('[data-in]')
  if (animated.length) gsap.set(animated, { clearProps: 'transform,opacity,visibility,--bar,--line' })
  settleCounts(slideEl)
}

function settleCounts(slideEl) {
  slideEl.querySelectorAll('.count').forEach((c) => {
    const n = Number(c.dataset.count)
    c.textContent = c.dataset.comma === '1' ? n.toLocaleString('en-US') : String(n)
    c.style.fontVariantNumeric = ''
  })
}
