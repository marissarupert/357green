// Location: stats over a photo on the left, interactive map on the right.
// Fields: eyebrow, title, background, stats[{value | count, label, placeholder?}]
//         (count names a map group, e.g. 'hotels': the value is how many the map shows),
//         transitLabel?, transit?[{lines:[css colour…], name, detail}] (no colours
//         draws a road marker), neighbors[{src, alt, height?}], neighborsLabel?
//   neighbors' logos tag their buildings on the map while Neighbors is on; with
//   neighborsLabel they're also listed in a row under the stats.
//         map{drawing?, url, title, label?}
//   map.drawing 'iso-map' shows the isometric massing map in the panel (its
//   buildings rise into place as the slide opens); otherwise url embeds an
//   interactive map.
//   hotels?[{alt, src?, height?, tone?}]: hotels tagged on the map while Hotels
//   is on (alt matches the start of the hotel's name; no src shows the name).
//   Logos sit at a common height (default 44px); set height to balance one
//   that looks too big or small. On the map's dark tags, tone 'whiten' turns a
//   dark logo white and 'invert' flips one with its own box (e.g. GT).
import { countable, esc, hairline, img, placeholderTag, rich, ruleBar } from '../lib/html.js'
import { reducedMotion } from '../motion.js'
import isoMap from '../assets/svg/iso-map.svg?raw'
import isoKey from '../assets/svg/iso-map-key.json'

const DRAWINGS = { 'iso-map': isoMap }
// Map key for the drawing: a slim row of buttons along the bottom of the map.
// A button lights up its group on the map (the rest fades back); again clears
// it. Pointing at a place on the map shows its name. Neighbors' logo tags show
// whenever no other group is picked (Neighbors lights up their buildings);
// Hotels tags its hotels and Walk times its stations.
const KEYS = { 'iso-map': isoKey }
const SECTIONS = [
  ['neighbors', 'Neighbors', 'k-nbr'],
  ['restaurants', 'Restaurants', 'k-rest'],
  ['hotels', 'Hotels', 'k-hotel'],
  ['cta', 'CTA ‘L’', 'k-cta'],
  ['walk', 'Walk times', 'k-walk'],
]
const TAGGED = ['neighbors', 'hotels', 'walk']   // groups whose places get tags
// a logo for a place, matched by the start of its name from the slide's list
const logoFor = (name, list = []) => list.find((n) => name.toLowerCase().startsWith(n.alt.toLowerCase()))
// one tag per building: every tenant's logo side by side, the address beneath
const logoTag = (sec, it, logos) => `<p class="map-tag-pin logo" data-sec="${sec}" style="left:${it.x}px;top:${it.y}px"><span class="lg">${logos.map((l) => l.src
  ? `<img src="${esc(l.src)}" alt="${esc(l.alt)}" style="height:${Math.round((Number(l.height) || 44) * 0.5)}px"${l.tone ? ` class="${esc(l.tone)}"` : ''}>`
  : `<b>${esc(l.alt)}</b>`).join('')}</span><span>${esc(it.street || '')}</span></p>`
// places in a group; a neighbors entry is a building, so count its tenants
const count = (items) => items.reduce((n, it) => n + (it.names?.length || 1), 0)
const mapKey = (key, { neighbors = [], hotels = [] }) => `
  <div class="map-chips" role="toolbar" aria-label="Map key">
    ${SECTIONS.filter(([id]) => key[id]?.length).map(([id, label, icon]) => `
      <button type="button" data-sec="${id}" aria-pressed="false"><i class="${icon}"></i>${esc(label)}${['neighbors', 'restaurants', 'hotels'].includes(id) ? ` <span class="ct">${count(key[id])}</span>` : ''}</button>`).join('')}
  </div>
  <div class="map-tags">
    ${TAGGED.flatMap((sec) => (key[sec] || []).map((it) => {
      if (it.x == null) return ''
      if (sec === 'walk') return `<p class="map-tag-pin" data-sec="${sec}" style="left:${it.x}px;top:${it.y}px"><b>${esc(it.name)}</b>${it.street ? `<span>${esc(it.street)}</span>` : ''}</p>`
      // neighbors and hotels: tagged only where the slide lists them
      const logos = (it.names || [it.name]).map((n) => logoFor(n, sec === 'hotels' ? hotels : neighbors)).filter(Boolean)
      return logos.length ? logoTag(sec, it, logos) : ''
    })).join('')}
  </div>
  <div class="map-ring" hidden></div>
  <p class="map-tip" hidden><b></b><span></span></p>`

function mountKey(el, key) {
  const bar = el.querySelector('.map-chips')
  if (!bar) return
  const svg = el.querySelector('.iso-map')
  const tip = el.querySelector('.map-tip')
  const ring = el.querySelector('.map-ring')
  const chips = [...bar.querySelectorAll('button')]
  const map = el.querySelector('.map')

  const place = (it) => {
    tip.querySelector('b').textContent = it.name
    tip.querySelector('span').textContent = it.street || ''
    for (const n of [tip, ring]) { n.style.left = it.x + 'px'; n.style.top = it.y + 'px'; n.hidden = false }
    const half = tip.offsetWidth / 2, w = tip.offsetParent?.clientWidth || 914
    tip.style.left = Math.min(Math.max(it.x, half + 12), w - half - 12) + 'px'
  }
  const hideTip = () => { tip.hidden = ring.hidden = true }
  // one group at a time, plus Walk times, which can stay on over any of them
  let show = '', walk = false
  const select = (sec) => {
    if (sec === 'walk') walk = !walk
    else { show = sec; if (!sec) walk = false }
    map.dataset.show = show
    map.dataset.walk = walk ? '1' : ''
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.sec === 'walk' ? walk : c.dataset.sec === show)))
    svg.classList.toggle('has-hl', !!(show || walk))
    svg.querySelectorAll('.hl').forEach((n) => n.classList.remove('hl'))
    // lines and rings carry their key id; light the chosen groups' ones
    for (const g of [show, walk && 'walk']) for (const it of key[g] || []) if (it.k) svg.querySelectorAll(`[data-k="${it.k}"]`).forEach((n) => n.classList.add('hl'))
  }
  chips.forEach((c) => c.addEventListener('click', () => select(c.dataset.sec === 'walk' || show !== c.dataset.sec ? c.dataset.sec : '')))
  // arrows move along the row (and don't change slides); Esc clears
  bar.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); select('') ; return }
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return
    e.preventDefault()
    const at = chips.indexOf(document.activeElement)
    chips[(at + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1) + chips.length) % chips.length].focus()
  })
  // pointing at a place on the map shows its name
  svg.addEventListener('pointerover', (e) => {
    const n = e.target.closest('.rest, .hotel, .nbr')
    if (!n) return
    const sec = n.classList.contains('rest') ? 'restaurants' : n.classList.contains('hotel') ? 'hotels' : 'neighbors'
    const it = key[sec]?.[Number(n.dataset.i)]
    if (it) place(it)
  })
  svg.addEventListener('pointerout', (e) => { if (e.target.closest('.rest, .hotel, .nbr')) hideTip() })
  // Place the on-map tags: each sits over its pin if it can; otherwise it moves
  // up (or below, near the top), and sideways, to the nearest spot clear of
  // the other tags of its group, the walk-time tags (which can show with any
  // group) and 357 Green (tower, callout and label), and a thin leader line
  // runs back to its pin. Logos load after the slide is built, so this runs
  // again as each one arrives and the tags take their real widths.
  const tagsEl = el.querySelector('.map-tags')
  const NS = 'http://www.w3.org/2000/svg'
  const leaders = document.createElementNS(NS, 'svg')
  leaders.setAttribute('class', 'map-leaders')
  tagsEl.prepend(leaders)
  const tags = [...tagsEl.querySelectorAll('.map-tag-pin')]
  tags.forEach((t) => { t.dataset.x = parseFloat(t.style.left); t.dataset.y = parseFloat(t.style.top) })
  const box = (n, pad = 6) => { const b = n?.getBBox(); return b && { l: b.x - pad, r: b.x + b.width + pad, t: b.y - pad, b: b.y + b.height + pad } }
  const layout = () => {
    const w = map.clientWidth || 914, h = map.clientHeight || 1080
    const fixed = [box(svg.querySelector('.callout')), box(svg.querySelector('.b357'), 4)].filter(Boolean)
    const placed = []
    const clear = (me, sec) => ![...fixed, ...placed.filter((o) => o.sec === sec || o.sec === 'walk')]
      .some((o) => me.l < o.r && me.r > o.l && me.t < o.b && me.b > o.t)
    leaders.replaceChildren()
    // walk-time tags first (everything else keeps clear of them), then bottom up
    const order = [...tags].sort((a, b) => (b.dataset.sec === 'walk') - (a.dataset.sec === 'walk') || b.dataset.y - a.dataset.y)
    for (const t of order) {
      t.classList.remove('below'); t.style.removeProperty('--lift'); t.style.removeProperty('--drop')
      const x0 = +t.dataset.x, y0 = +t.dataset.y, half = t.offsetWidth / 2, th = t.offsetHeight, sec = t.dataset.sec
      const at = (dx, dy, under) => {
        const x = Math.min(Math.max(x0 + dx, half + 12), w - half - 12)
        const t1 = under ? y0 + 14 + dy : y0 - 14 - dy - th
        return { x, dy, under, l: x - half, r: x + half, t: t1, b: t1 + th }
      }
      const inside = (b) => b.t >= 96 && b.b <= h - 84
      let best = null
      for (let dy = 0; dy <= 360 && !best; dy += 12) {
        for (const dx of [0, -30, 30, -60, 60, -95, 95, -130, 130]) {
          for (const under of [false, true]) {
            const b = at(dx, dy, under)
            if (inside(b) && clear(b, sec)) { best = b; break }
          }
          if (best) break
        }
      }
      best ||= at(0, 0, false)
      t.style.left = best.x + 'px'
      if (best.under) { t.classList.add('below'); if (best.dy) t.style.setProperty('--drop', best.dy + 'px') }
      else if (best.dy) t.style.setProperty('--lift', best.dy + 'px')
      placed.push({ ...best, sec })
      // a leader back to the pin when the tag has moved off it
      if (best.dy || Math.abs(best.x - x0) > 1) {
        const ln = document.createElementNS(NS, 'line')
        ln.setAttribute('x1', x0); ln.setAttribute('y1', y0)
        ln.setAttribute('x2', best.x); ln.setAttribute('y2', best.under ? best.t : best.b)
        ln.dataset.sec = sec
        leaders.append(ln)
      }
    }
  }
  let queued = 0
  const relayout = () => { cancelAnimationFrame(queued); queued = requestAnimationFrame(layout) }
  tagsEl.querySelectorAll('img').forEach((im) => im.addEventListener('load', relayout))
  relayout()
  el._closeKey = () => { select(''); hideTip() }
}

export default {
  render: (s) => `
    <div class="abs bg">${img(s.background, '', 'cover-img')}</div>
    <p class="abs eyebrow" data-in="up">${esc(s.eyebrow)}</p>
    <h1 class="abs title" data-in="up">${esc(s.title)}</h1>
    ${ruleBar()}
    <div class="abs stats">
      ${s.stats.map((st) => ({ ...st, value: st.count ? String(count(isoKey[st.count] || [])) : st.value })).map((st) => `
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
    ${s.neighborsLabel ? `${hairline('hq-rule')}
    <p class="abs eyebrow hq-label" data-in="up">${esc(s.neighborsLabel)}</p>
    <div class="abs logos">
      ${s.neighbors.map((n, i) => `<span data-in="up" data-at="${(1 + i * 0.12).toFixed(2)}" style="height:${Number(n.height) || 44}px"${n.tone === 'whiten' ? ' class="whiten"' : ''}>${img(n.src, n.alt)}</span>`).join('')}
    </div>` : ''}
    <div class="abs map" data-interactive>
      ${DRAWINGS[s.map?.drawing]
        ? `${DRAWINGS[s.map.drawing]}${KEYS[s.map.drawing] ? mapKey(KEYS[s.map.drawing], s) : ''}
           <p class="img-tag map-tag" data-in="tag" data-at="0.6"><span>${esc(s.map.label || s.title)}</span></p>`
        : s.map?.url
        ? `<p class="loading">Loading map…<span>Interactive map needs an internet connection</span></p>
           <iframe data-src="${esc(s.map.url)}" title="${esc(s.map.title || 'Map')}" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe>
           <p class="img-tag map-tag" data-in="tag" data-at="0.6"><span>${esc(s.map.label || s.title)}</span></p>`
        : `<div class="word">MAP</div>${placeholderTag('Placeholder · add map URL in content.js')}`}
    </div>`,

  mount(el, s) { if (KEYS[s.map?.drawing]) mountKey(el, KEYS[s.map.drawing]) },
  // Replay the iso map's rise each time the slide opens.
  // (the reset waits until the slide has faded out, so nothing on the map
  // jumps while it's still visible, and re-entering needs no forced layout)
  enter(el) {
    const m = el.querySelector('.iso-map')
    clearTimeout(el._resetMap)
    if (!m || reducedMotion.matches) return
    if (m.classList.contains('play')) { m.classList.remove('play'); void m.getBoundingClientRect() }
    m.classList.add('play')
  },
  leave(el) {
    el._resetMap = setTimeout(() => { el.querySelector('.iso-map')?.classList.remove('play'); el._closeKey?.() }, 700)
  },
}
