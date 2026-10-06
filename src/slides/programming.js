// Light slide: two columns of test-fit options, each linking to its plan slide.
// Fields: eyebrow, title, columns[{heading, rows[{name, meta, link, target}]}]
//   target = id of the slide "View plan" opens
import { esc, nBand, rich, ruleBar } from '../lib/html.js'

const chevron = `<svg viewBox="0 0 22 20" aria-hidden="true"><path d="M2 1.5 20 10 2 18.5" fill="none" stroke="currentColor" stroke-width="3.2"/></svg>`

export default {
  render: (s) => `
    <p class="abs eyebrow" data-in="up">${esc(s.eyebrow)}</p>
    <h1 class="abs title" data-in="up">${esc(s.title)}</h1>
    ${ruleBar()}
    ${s.columns.map((c, ci) => `
      <div class="abs col" style="left:${ci ? 933 : 59}px">
        <h2 data-in="up">${esc(c.heading)}</h2>
        ${c.rows.map((r) => `
          <div class="row" data-in="up">
            <h3>${esc(r.name)}</h3>
            <p class="meta">${rich(r.meta)}</p>
            <button class="more" data-target="${esc(r.target)}">${esc(r.link || 'View plan')} ${chevron}</button>
          </div>`).join('')}
      </div>`).join('')}
    ${nBand([1793, 0, 127, 1080], { vertical: true, origin: [1726 - 1793, -632] })}`,
  mount(el, s, deck) {
    el.querySelectorAll('[data-target]').forEach((b) => b.addEventListener('click', () => {
      const i = deck.indexOf(b.dataset.target)
      if (i >= 0) deck.go(i)
    }))
  },
}
