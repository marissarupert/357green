// Location: stats over a photo on the left, interactive map on the right.
// Fields: eyebrow, title, background, stats[{value, label, placeholder?}],
//         neighborsLabel, neighbors[{src, alt, height?}], map{url, title, label?}
//   Logos sit at a common height (default 44px); set height to balance one
//   that looks too big or small, and whiten: true to turn a grey logo white.
import { countable, esc, hairline, img, placeholderTag, rich, ruleBar } from '../lib/html.js'

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
    ${hairline('hq-rule')}
    <p class="abs eyebrow hq-label" data-in="up">${esc(s.neighborsLabel)}</p>
    <div class="abs logos">
      ${s.neighbors.map((n, i) => `<span data-in="up" data-at="${(1 + i * 0.12).toFixed(2)}" style="height:${Number(n.height) || 44}px"${n.whiten ? ' class="whiten"' : ''}>${img(n.src, n.alt)}</span>`).join('')}
    </div>
    <div class="abs map" data-interactive>
      ${s.map?.url
        ? `<p class="loading">Loading map…<span>Interactive map needs an internet connection</span></p>
           <iframe data-src="${esc(s.map.url)}" title="${esc(s.map.title || 'Map')}" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe>
           <p class="img-tag map-tag" data-in="tag" data-at="0.6"><span>${esc(s.map.label || s.title)}</span></p>`
        : `<div class="word">MAP</div>${placeholderTag('Placeholder · add map URL in content.js')}`}
    </div>`,
}
