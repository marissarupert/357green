// Location: stats over a photo on the left, interactive map on the right.
// Fields: eyebrow, title, background, stats[{value, label, placeholder?}],
//         transitLabel?, transit?[{lines:[css colour…], name, detail}] (no colours
//         draws a road marker), neighborsLabel, neighbors[{src, alt, height?}],
//         map{drawing?, url, title, label?}
//   map.drawing 'iso-map' shows the isometric massing map in the panel (its
//   buildings rise into place as the slide opens); otherwise url embeds an
//   interactive map.
//   Logos sit at a common height (default 44px); set height to balance one
//   that looks too big or small, and whiten: true to turn a grey logo white.
import { countable, esc, hairline, img, placeholderTag, rich, ruleBar } from '../lib/html.js'
import { reducedMotion } from '../motion.js'
import isoMap from '../assets/svg/iso-map.svg?raw'
import isoKey from '../assets/svg/iso-map-key.json'

const DRAWINGS = { 'iso-map': isoMap }
// Map key for the drawing: each section opens a list; pointing at an entry
// marks it on the map (places get a name tag, lines and rings light up).
const KEYS = { 'iso-map': isoKey }
const SECTIONS = [
  ['neighbors', 'Neighbors', 'k-nbr'],
  ['restaurants', 'Restaurants', 'k-rest'],
  ['hotels', 'Hotels', 'k-hotel'],
  ['cta', 'CTA \u2018L\u2019', 'k-cta'],
  ['metra', 'Metra', 'k-metra'],
  ['walk', 'Walk times', 'k-walk'],
]
const caret = `<svg class="caret" viewBox="0 0 12 12" aria-hidden="true"><path d="M4 2l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>`
const mapKey = (key) => `
  <div class="map-key">
    <button class="mk-toggle" aria-expanded="false">Map key ${caret}</button>
    <div class="mk-panel" role="region" aria-label="Map key">
      ${SECTIONS.filter(([id]) => key[id]?.length).map(([id, label, icon]) => `
        <div class="mk-sec" data-sec="${id}">
          <button class="mk-head" aria-expanded="false"><i class="${icon}"></i><span>${esc(label)}${['restaurants', 'hotels'].includes(id) ? ` (${key[id].length})` : ''}</span>${caret}</button>
          <ul class="mk-list">${key[id].map((it, i) => `
            <li><button data-sec="${id}" data-i="${i}">${it.colour ? `<i class="sw" style="background:${esc(it.colour)}"></i>` : ''}<b>${esc(it.name)}</b>${it.street ? `<span>${esc(it.street)}</span>` : ''}</button></li>`).join('')}
          </ul>
        </div>`).join('')}
    </div>
  </div>
  <div class="map-ring" hidden></div>
  <p class="map-tip" hidden><b></b><span></span></p>`

function mountKey(el, key) {
  const box = el.querySelector('.map-key')
  if (!box) return
  const svg = el.querySelector('.iso-map')
  const tip = el.querySelector('.map-tip')
  const ring = el.querySelector('.map-ring')
  const toggle = box.querySelector('.mk-toggle')
  let pinned = null

  const clear = () => {
    tip.hidden = ring.hidden = true
    svg.classList.remove('has-hl')
    svg.querySelectorAll('.hl').forEach((n) => n.classList.remove('hl'))
    box.querySelectorAll('.mk-list .on').forEach((b) => b.classList.remove('on'))
  }
  const show = (sec, i) => {
    clear()
    const it = key[sec]?.[i]
    if (!it) return
    box.querySelector(`.mk-list [data-sec="${sec}"][data-i="${i}"]`)?.classList.add('on')
    if (it.k) {
      svg.classList.add('has-hl')
      svg.querySelectorAll(`[data-k="${it.k}"]`).forEach((n) => n.classList.add('hl'))
    }
    if (it.x != null) {
      tip.querySelector('b').textContent = it.name
      tip.querySelector('span').textContent = it.street || ''
      for (const n of [tip, ring]) { n.style.left = it.x + 'px'; n.style.top = it.y + 'px'; n.hidden = false }
      // keep the name tag inside the panel near its edges
      const half = tip.offsetWidth / 2, w = tip.offsetParent?.clientWidth || 914
      tip.style.left = Math.min(Math.max(it.x, half + 12), w - half - 12) + 'px'
    }
  }
  const restore = () => (pinned ? show(...pinned) : clear())
  const close = () => {
    box.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false')
    pinned = null; clear()
  }

  toggle.addEventListener('click', () => {
    const open = !box.classList.contains('open')
    if (!open) return close()
    box.classList.add('open'); toggle.setAttribute('aria-expanded', 'true')
  })
  box.querySelectorAll('.mk-head').forEach((h) => h.addEventListener('click', () => {
    const sec = h.closest('.mk-sec')
    const open = !sec.classList.contains('open')
    box.querySelectorAll('.mk-sec').forEach((x) => { x.classList.remove('open'); x.querySelector('.mk-head').setAttribute('aria-expanded', 'false') })
    if (open) { sec.classList.add('open'); h.setAttribute('aria-expanded', 'true') }
  }))
  box.querySelectorAll('.mk-list button').forEach((b) => {
    const args = [b.dataset.sec, Number(b.dataset.i)]
    b.addEventListener('pointerenter', () => show(...args))
    b.addEventListener('focus', () => show(...args))
    b.addEventListener('pointerleave', restore)
    b.addEventListener('blur', restore)
    b.addEventListener('click', () => {
      pinned = pinned && pinned[0] === args[0] && pinned[1] === args[1] ? null : args
      restore()
    })
  })
  // Arrow keys move through the key (and don't change slides); Esc closes it.
  box.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); close(); toggle.focus(); return }
    if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', ' ', 'PageDown', 'PageUp'].includes(e.key)) return
    if (e.key === ' ') return e.stopPropagation()
    e.preventDefault()
    const all = [...box.querySelectorAll('.mk-toggle, .mk-head, .mk-sec.open .mk-list button')].filter((n) => n.offsetParent)
    const at = all.indexOf(document.activeElement)
    const step = ['ArrowDown', 'ArrowRight', 'PageDown'].includes(e.key) ? 1 : -1
    all[Math.max(0, Math.min(all.length - 1, at + step))]?.focus()
  })
  // Pointing at a place on the map shows its name too.
  svg.addEventListener('pointerover', (e) => {
    const n = e.target.closest('.rest, .hotel, .nbr')
    if (n) show(n.classList.contains('rest') ? 'restaurants' : n.classList.contains('hotel') ? 'hotels' : 'neighbors', Number(n.dataset.i))
  })
  svg.addEventListener('pointerout', (e) => { if (e.target.closest('.rest, .hotel, .nbr')) restore() })
  el._closeKey = close
}

export default {
  render: (s) => `
    <div class="abs bg">${img(s.background, '', 'cover-img')}</div>
    <p class="abs eyebrow" data-in="up">${esc(s.eyebrow)}</p>
    <h1 class="abs title" data-in="up">${esc(s.title)}</h1>
    ${ruleBar()}
    <div class="abs stats">
      ${s.stats.map((st) => `
        <div class="stat" data-in="up">
          <p class="v">${st.placeholder ? `<span class="placeholder-val">${esc(st.value)}</span>${placeholderTag()}` : countable(rich(st.value))}</p>
          <p class="l">${rich(st.label)}</p>
        </div>`).join('')}
    </div>
    ${s.transit ? `
    <p class="abs eyebrow transit-label" data-in="up" data-at="0.9">${esc(s.transitLabel || 'Transit')}</p>
    <ul class="abs transit">
      ${s.transit.map((t, i) => `<li data-in="up" data-at="${(1 + i * 0.1).toFixed(2)}">
        <span class="marks">${t.lines.length ? t.lines.map((c) => `<i style="background:${esc(c)}"></i>`).join('') : '<i class="road"></i>'}</span>
        <span class="t"><b>${esc(t.name)}</b><span>${esc(t.detail)}</span></span>
      </li>`).join('')}
    </ul>` : ''}
    ${hairline('hq-rule')}
    <p class="abs eyebrow hq-label" data-in="up">${esc(s.neighborsLabel)}</p>
    <div class="abs logos">
      ${s.neighbors.map((n, i) => `<span data-in="up" data-at="${(1 + i * 0.12).toFixed(2)}" style="height:${Number(n.height) || 44}px"${n.whiten ? ' class="whiten"' : ''}>${img(n.src, n.alt)}</span>`).join('')}
    </div>
    <div class="abs map" data-interactive>
      ${DRAWINGS[s.map?.drawing]
        ? `${DRAWINGS[s.map.drawing]}${KEYS[s.map.drawing] ? mapKey(KEYS[s.map.drawing]) : ''}
           <p class="img-tag map-tag" data-in="tag" data-at="0.6"><span>${esc(s.map.label || s.title)}</span></p>`
        : s.map?.url
        ? `<p class="loading">Loading map…<span>Interactive map needs an internet connection</span></p>
           <iframe data-src="${esc(s.map.url)}" title="${esc(s.map.title || 'Map')}" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe>
           <p class="img-tag map-tag" data-in="tag" data-at="0.6"><span>${esc(s.map.label || s.title)}</span></p>`
        : `<div class="word">MAP</div>${placeholderTag('Placeholder · add map URL in content.js')}`}
    </div>`,

  mount(el, s) { if (KEYS[s.map?.drawing]) mountKey(el, KEYS[s.map.drawing]) },
  // Replay the iso map's rise each time the slide opens.
  enter(el) {
    const m = el.querySelector('.iso-map')
    if (!m || reducedMotion.matches) return
    m.classList.remove('play'); void m.getBoundingClientRect(); m.classList.add('play')
  },
  leave(el) { el.querySelector('.iso-map')?.classList.remove('play'); el._closeKey?.() },
}
