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
// Map key for the drawing: a slim row of buttons along the bottom of the map.
// A button lights up its group on the map (the rest fades back); again clears
// it. Pointing at a place on the map shows its name. Neighbors and the walking
// routes, being few, also get name tags on the map while their group is on.
const KEYS = { 'iso-map': isoKey }
const SECTIONS = [
  ['neighbors', 'Neighbors', 'k-nbr'],
  ['restaurants', 'Restaurants', 'k-rest'],
  ['hotels', 'Hotels', 'k-hotel'],
  ['cta', 'CTA ‘L’', 'k-cta'],
  ['metra', 'Metra', 'k-metra'],
  ['walk', 'Walk times', 'k-walk'],
]
const TAGGED = ['neighbors', 'walk']   // groups whose places get name tags when on
const mapKey = (key) => `
  <div class="map-chips" role="toolbar" aria-label="Map key">
    ${SECTIONS.filter(([id]) => key[id]?.length).map(([id, label, icon]) => `
      <button type="button" data-sec="${id}" aria-pressed="false"><i class="${icon}"></i>${esc(label)}${['restaurants', 'hotels'].includes(id) ? ` <span class="ct">${key[id].length}</span>` : ''}</button>`).join('')}
  </div>
  <div class="map-tags">
    ${TAGGED.flatMap((sec) => (key[sec] || []).map((it) => (it.x == null ? '' : `
      <p class="map-tag-pin" data-sec="${sec}" style="left:${it.x}px;top:${it.y}px"><b>${esc(it.name)}</b>${it.street ? `<span>${esc(it.street)}</span>` : ''}</p>`))).join('')}
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
  // keep the on-map name tags inside the panel near its edges
  // and lift any tag that would sit on top of another (neighbors cluster on Green St)
  requestAnimationFrame(() => {
    const placed = []
    const tags = [...el.querySelectorAll('.map-tag-pin')].sort((a, b) => parseFloat(b.style.top) - parseFloat(a.style.top))
    for (const t of tags) {
      const w = map.clientWidth || 914, half = t.offsetWidth / 2, h = t.offsetHeight
      const x = Math.min(Math.max(parseFloat(t.style.left), half + 12), w - half - 12)
      t.style.left = x + 'px'
      let lift = 0
      const box = () => ({ l: x - half, r: x + half, b: parseFloat(t.style.top) - 14 - lift, t: parseFloat(t.style.top) - 14 - lift - h })
      for (let tries = 0; tries < 6; tries++) {
        const me = box(), hit = placed.find((o) => o.sec === t.dataset.sec && me.l < o.r && me.r > o.l && me.t < o.b && me.b > o.t)
        if (!hit) break
        lift += me.b - hit.t + 4
      }
      if (lift) t.style.setProperty('--lift', lift + 'px')
      placed.push({ ...box(), sec: t.dataset.sec })
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
