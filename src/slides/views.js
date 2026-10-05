// Panoramic views: drag (or arrow keys / trackpad) to pan each strip.
// "East / West" enlarges one direction to fill the slide; "Both" stacks them.
// The height toggle swaps in the view taken from that height, where one exists.
// Fields: views[{id, direction, height, label, src}], show:[topId, bottomId],
//         strips?: [[top, height], [top, height]] in stage px
import { gsap } from 'gsap'
import { esc, placeholderTag } from '../lib/html.js'

const DIRS = [['both', 'Both'], ['east', 'East'], ['west', 'West']]
const HEIGHTS = [['high-rise', 'High-Rise'], ['mid-rise', 'Mid-Rise']]
const cap = (s) => s[0].toUpperCase() + s.slice(1)

export default {
  render: (s) => `
    ${s.show.map((id, i) => {
      const v = s.views.find((x) => x.id === id)
      const [t, h] = s.strips?.[i] || (i ? [553, 527] : [0, 527])
      return `<div class="strip ${i ? 'bottom' : 'top'}" style="--t:${t}px;--h:${h}px" data-dir="${esc(v.direction)}" data-drag tabindex="0" aria-label="${esc(v.label)} panorama. Drag or use arrow keys to pan.">
        <div class="pan"><img data-src="${esc(v.src)}" alt="${esc(v.label)}" draggable="false"></div>
        <div class="missing">${placeholderTag('Placeholder')}</div>
        <p class="img-tag view-tag"><span>${esc(v.label)}</span></p>
      </div>`
    }).join('')}
    <div class="abs toggles" data-interactive>
      <div class="seg" role="group" aria-label="Direction">${DIRS.map(([v, l]) => `<button data-dir-btn="${v}" aria-pressed="${v === 'both'}">${l}</button>`).join('')}</div>
      <div class="seg" role="group" aria-label="Height">${HEIGHTS.map(([v, l]) => `<button data-height="${v}">${l}</button>`).join('')}</div>
    </div>`,

  mount(el, s) {
    const strips = [...el.querySelectorAll('.strip')]
    const state = strips.map((st, i) => ({ st, view: s.views.find((x) => x.id === s.show[i]), x: 0, zoom: 1.15 }))

    const layout = (o) => {
      const img = o.st.querySelector('img')
      const h = o.st.clientHeight * o.zoom
      const ratio = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 3.66
      o.w = h * ratio
      img.style.height = `${h}px`
      img.style.width = `${o.w}px`
      img.style.top = `${(o.st.clientHeight - h) / 2}px`
      pan(o, o.x ?? (o.st.clientWidth - o.w) / 2, false)
    }
    const pan = (o, x, animate = true) => {
      const min = Math.min(0, o.st.clientWidth - o.w)
      o.x = Math.max(min, Math.min(0, x))
      gsap.to(o.st.querySelector('.pan'), { x: o.x, duration: animate ? 0.5 : 0, ease: 'power3.out', overwrite: true })
    }
    const centre = (o) => { o.x = null; layout(o) }

    const setView = (o, view) => {
      o.view = view
      o.st.classList.toggle('none', !view.src)
      o.st.querySelector('.view-tag span').textContent = view.label
      o.st.querySelector('.missing .ph-tag').textContent = `Placeholder · ${view.label} not supplied`
      const img = o.st.querySelector('img')
      if (view.src) { img.src = view.src; img.alt = view.label; img.decode?.().then(() => centre(o)).catch(() => {}) }
    }
    const refreshButtons = () => {
      const heights = new Set(state.filter((o) => !o.st.classList.contains('hidden')).map((o) => o.view.height))
      el.querySelectorAll('[data-height]').forEach((b) => b.setAttribute('aria-pressed', heights.has(b.dataset.height)))
    }

    el.querySelectorAll('[data-dir-btn]').forEach((b) => b.addEventListener('click', () => {
      const d = b.dataset.dirBtn
      el.querySelectorAll('[data-dir-btn]').forEach((x) => x.setAttribute('aria-pressed', x === b))
      state.forEach((o) => {
        o.st.classList.toggle('solo', d !== 'both' && o.view.direction === d)
        o.st.classList.toggle('hidden', d !== 'both' && o.view.direction !== d)
        o.zoom = d === 'both' ? 1.15 : 1
      })
      requestAnimationFrame(() => state.forEach(centre))
      refreshButtons()
    }))
    el.querySelectorAll('[data-height]').forEach((b) => b.addEventListener('click', () => {
      const h = b.dataset.height
      state.forEach((o) => {
        if (o.st.classList.contains('hidden') || o.view.height === h) return
        const own = s.views.find((v) => s.show.includes(v.id) && v.direction === o.view.direction && v.height === h)
        const any = s.views.find((v) => v.direction === o.view.direction && v.height === h)
        setView(o, own || any || { id: '', direction: o.view.direction, height: h, label: `View ${cap(o.view.direction)} | ${HEIGHTS.find(([v]) => v === h)[1]}`, src: '' })
      })
      refreshButtons()
    }))

    // dragging, wheel and keys
    state.forEach((o) => {
      const img = o.st.querySelector('img')
      img.addEventListener('load', () => centre(o))
      let drag = null
      o.st.addEventListener('pointerdown', (e) => {
        drag = { x: e.clientX, start: o.x, t: performance.now(), last: e.clientX }
        o.st.setPointerCapture(e.pointerId)
        o.st.classList.add('dragging')
      })
      o.st.addEventListener('pointermove', (e) => {
        if (!drag) return
        const scale = o.st.getBoundingClientRect().width / o.st.clientWidth
        drag.v = (e.clientX - drag.last) / scale
        drag.last = e.clientX
        pan(o, drag.start + (e.clientX - drag.x) / scale, false)
      })
      const end = () => {
        if (!drag) return
        if (drag.v) pan(o, o.x + drag.v * 12)
        drag = null
        o.st.classList.remove('dragging')
      }
      o.st.addEventListener('pointerup', end)
      o.st.addEventListener('pointercancel', end)
      o.st.addEventListener('click', (e) => e.stopPropagation())
      o.st.addEventListener('wheel', (e) => {
        const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.shiftKey ? e.deltaY : 0
        if (!d) return
        e.preventDefault()
        pan(o, o.x - d, false)
      }, { passive: false })
      o.st.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
        e.preventDefault()
        pan(o, o.x + (e.key === 'ArrowLeft' ? 240 : -240))
      })
    })
    el._layout = () => state.forEach(centre)
    refreshButtons()
  },
  enter(el) { requestAnimationFrame(() => el._layout?.()) },
}
