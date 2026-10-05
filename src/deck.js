import { gsap } from 'gsap'
import { playEntrance, reducedMotion, settle } from './motion.js'

const W = 1920
const H = 1080

// Owns the stage, the current slide and every way of moving between slides.
export function createDeck({ stage, slides, onChange }) {
  const els = slides.map((s) => s.el)
  let current = -1
  let entrance = null
  let scale = 1
  const blockers = new Set() // overlays (menu, lightbox) that take over the keys

  // ---------- fit the 16:9 stage to the window, letterboxed ----------
  const fit = () => {
    const vw = innerWidth || document.documentElement.clientWidth
    const vh = innerHeight || document.documentElement.clientHeight
    scale = Math.min(vw / W, vh / H) || 1
    stage.style.transform = `translate(-50%, -50%) scale(${scale})`
  }
  addEventListener('resize', fit)
  new ResizeObserver(fit).observe(document.documentElement)
  fit()

  // ---------- images load for the current slide and its neighbours ----------
  const warm = (i) => {
    for (const j of [i, i + 1, i - 1, i + 2]) {
      els[j]?.querySelectorAll('[data-src]').forEach((n) => {
        if (n.tagName === 'VIDEO') { if (j !== i) return; n.src = n.dataset.src }
        else n.src = n.dataset.src
        n.removeAttribute('data-src')
        // decode off the main thread now so the slide doesn't stall on entry
        n.decode?.().catch(() => {})
      })
    }
  }

  const indexOf = (id) => slides.findIndex((s) => s.id === id)

  function go(i, { instant = false } = {}) {
    i = Math.max(0, Math.min(slides.length - 1, i))
    if (i === current) return
    const prev = els[current]
    const next = els[i]
    warm(i)

    if (prev) {
      settle(prev, entrance)
      prev.classList.remove('is-current')
      prev.classList.add('is-leaving')
      prev.setAttribute('aria-hidden', 'true')
      prev.inert = true
      slides[current].type?.leave?.(prev, slides[current])
      const done = () => { prev.classList.remove('is-leaving'); gsap.set(prev, { clearProps: 'opacity' }) }
      if (instant || reducedMotion.matches) done()
      else gsap.to(prev, { opacity: 0, duration: 0.35, ease: 'power1.out', onComplete: done })
    }

    const backwards = i < current
    current = i
    next.classList.add('is-current')
    next.removeAttribute('aria-hidden')
    next.inert = false
    stage.classList.toggle('on-light', slides[i].theme === 'light')
    gsap.fromTo(next, { opacity: 0 }, { opacity: 1, duration: instant || reducedMotion.matches ? 0.01 : 0.4, ease: 'power1.out' })
    entrance = playEntrance(next, (tl) => slides[i].type?.enter?.(next, tl, slides[i], { backwards }))

    // Sandboxed frames (embedded previews) can refuse history updates.
    if (location.hash.slice(1) !== slides[i].id) try { history.replaceState(null, '', `#${slides[i].id}`) } catch {}
    onChange?.(i)
  }

  // A slide type can take over next/prev for in-slide steps (step returns
  // true when it consumed the press).
  const step = (dir) => {
    const s = slides[current]
    return s?.type?.step?.(s.el, dir, s) === true
  }
  const next = () => { if (!step(1)) go(current + 1) }
  const prev = () => { if (!step(-1)) go(current - 1) }

  // ---------- keyboard ----------
  addEventListener('keydown', (e) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return
    if (blockers.size) {
      for (const b of blockers) if (b.onKey?.(e)) e.preventDefault()
      return
    }
    const k = e.key
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(k)) { e.preventDefault(); next() }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(k)) { e.preventDefault(); prev() }
    else if (k === 'Home') go(0)
    else if (k === 'End') go(slides.length - 1)
  })

  // ---------- click to advance (anything that isn't a control) ----------
  const INTERACTIVE = 'a, button, input, select, textarea, iframe, label, [data-interactive], [data-drag]'
  stage.addEventListener('click', (e) => {
    if (blockers.size || e.target.closest(INTERACTIVE)) return
    if (getSelection()?.toString()) return
    next()
  })

  // ---------- swipe (touch and pen; mouse drags are left to the slides) ----------
  let touch = null
  stage.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' || e.target.closest('[data-drag]')) return
    touch = { x: e.clientX, y: e.clientY, t: performance.now() }
  })
  stage.addEventListener('pointerup', (e) => {
    if (!touch || blockers.size) { touch = null; return }
    const dx = e.clientX - touch.x
    const dy = e.clientY - touch.y
    const quick = performance.now() - touch.t < 700
    touch = null
    if (!quick || Math.max(Math.abs(dx), Math.abs(dy)) < 50) return
    const forward = Math.abs(dx) > Math.abs(dy) ? dx < 0 : dy < 0
    forward ? next() : prev()
  })

  // ---------- deep links ----------
  addEventListener('hashchange', () => {
    const i = indexOf(decodeURIComponent(location.hash.slice(1)))
    if (i >= 0) go(i)
  })

  return {
    go, next, prev, indexOf,
    get current() { return current },
    get count() { return slides.length },
    get scale() { return scale },
    block: (b) => blockers.add(b),
    unblock: (b) => blockers.delete(b),
    start() {
      fit()
      const i = indexOf(decodeURIComponent(location.hash.slice(1)))
      go(i >= 0 ? i : 0, { instant: true })
    },
  }
}
