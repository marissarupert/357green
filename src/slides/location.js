// Location: stats over a photo on the left, interactive map on the right.
// Fields: eyebrow, title, background, stats[{value, label, placeholder?}],
//         transitLabel?, transit?[{lines:[css colour…], name, detail}] (no colours
//         draws a road marker), neighbors[{src, alt, height?}], neighborsLabel?
//   neighbors' logos tag their buildings on the map (always shown); with
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
// it. Pointing at a place on the map shows its name. Neighbors have no button:
// their logo tags stay on the map until another group is picked. The walk
// times' station tags show while Walk times is on.
const KEYS = { 'iso-map': isoKey }
const SECTIONS = [
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
const mapKey = (key, { neighbors = [], hotels = [] }) => `
  <div class="map-chips" role="toolbar" aria-label="Map key">
    ${SECTIONS.filter(([id]) => key[id]?.length).map(([id, label, icon]) => `
      <button type="button" data-sec="${id}" aria-pressed="false"><i class="${icon}"></i>${esc(label)}${['restaurants', 'hotels'].includes(id) ? ` <span class="ct">${key[id].length}</span>` : ''}</button>`).join('')}
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
  const select = (sec) => {
    map.dataset.show = sec || ''
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.sec === sec)))
    svg.classList.toggle('has-hl', !!sec)
    svg.querySelectorAll('.hl').forEach((n) => n.classList.remove('hl'))
    // lines and rings carry their key id; light the group's ones
    for (const it of key[sec] || []) if (it.k) svg.querySelectorAll(`[data-k="${it.k}"]`).forEach((n) => n.classList.add('hl'))
  }
  chips.forEach((c) => c.addEventListener('click', () => select(map.dataset.show === c.dataset.sec ? '' : c.dataset.sec)))
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
  // keep the on-map tags inside the panel, lift any that would sit on another
  // tag of its group (neighbors cluster on Green St), and drop below its pin
  // any that would run off the top; nothing covers the 357 Green label
  requestAnimationFrame(() => {
    const w = map.clientWidth || 914, h = map.clientHeight || 1080
    const site = svg.querySelector('.callout text')?.getBBox()
    const fixed = site ? [{ l: site.x - 6, r: site.x + site.width + 6, t: site.y - 4, b: site.y + site.height + 4 }] : []
    const placed = []
    const hits = (me, sec) => [...fixed, ...placed.filter((o) => o.sec === sec)].find((o) => me.l < o.r && me.r > o.l && me.t < o.b && me.b > o.t)
    const tags = [...el.querySelectorAll('.map-tag-pin')].sort((a, b) => parseFloat(b.style.top) - parseFloat(a.style.top))
    for (const t of tags) {
      const half = t.offsetWidth / 2, th = t.offsetHeight, y = parseFloat(t.style.top)
      const x = Math.min(Math.max(parseFloat(t.style.left), half + 12), w - half - 12)
      t.style.left = x + 'px'
      const above = (lift) => ({ l: x - half, r: x + half, b: y - 14 - lift, t: y - 14 - lift - th })
      const below = (drop) => ({ l: x - half, r: x + half, t: y + 14 + drop, b: y + 14 + drop + th })
      let lift = 0, box = above(0), hit
      for (let n = 0; n < 8 && (hit = hits(box, t.dataset.sec)); n++) { lift += box.b - hit.t + 4; box = above(lift) }
      if (box.t < 96) {
        let drop = 0
        box = below(0)
        for (let n = 0; n < 8 && (hit = hits(box, t.dataset.sec)); n++) { drop += hit.b - box.t + 4; box = below(drop) }
        if (box.b < h - 80) { t.classList.add('below'); if (drop) t.style.setProperty('--drop', drop + 'px') }
        else { box = above(lift); if (lift) t.style.setProperty('--lift', lift + 'px') }
      } else if (lift) t.style.setProperty('--lift', lift + 'px')
      placed.push({ ...box, sec: t.dataset.sec })
    }
  })
  el._closeKey = () => { select(''); hideTip() }
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
  enter(el) {
    const m = el.querySelector('.iso-map')
    if (!m || reducedMotion.matches) return
    m.classList.remove('play'); void m.getBoundingClientRect(); m.classList.add('play')
  },
  leave(el) { el.querySelector('.iso-map')?.classList.remove('play'); el._closeKey?.() },
}
