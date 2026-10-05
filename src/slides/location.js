// Location: stats over a photo on the left, interactive map on the right.
// Fields: eyebrow, title, background, stats[{value, label, placeholder?}],
//         neighborsLabel, neighbors[{src, alt, width}], map{url, title}
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
    <div class="abs logos" data-in="fade">
      ${s.neighbors.map((n) => `<span style="width:${Number(n.width) || 100}px">${img(n.src, n.alt)}</span>`).join('')}
    </div>
    <div class="abs map" data-interactive>
      ${s.map?.url
        ? `<iframe data-src="${esc(s.map.url)}" title="${esc(s.map.title || 'Map')}" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe>`
        : `<div class="word">MAP</div>${placeholderTag('Placeholder · add map URL in content.js')}`}
    </div>`,
}
