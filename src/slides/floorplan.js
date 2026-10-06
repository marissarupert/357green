// Light slide: floor plan with a legend.
// Fields: eyebrow, title, subtitle?, legend[{swatch, label, outline?}],
//         image{src, alt, box:[l,t,w,h], size?:[w,h]},
//         labels?[{text, at:[x,y], size, rotate?, kind?}]
//   labels are set as live text over the plan: `at` (centre) and `size` are in
//   the plan image's own pixels (image.size), so they scale with the box.
//   kind: "street" (bold), "tag" (small level marker + figure).
import { esc, img, nBand, ruleBar } from '../lib/html.js'

const TAG = '<svg viewBox="0 0 10 10" aria-hidden="true"><circle cx="5" cy="5" r="4.2" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M5 5V.8A4.2 4.2 0 0 1 9.2 5zM5 5v4.2A4.2 4.2 0 0 1 .8 5z" fill="currentColor"/></svg>'

const labels = (s) => {
  if (!s.labels) return ''
  const k = s.image.box[2] / s.image.size[0]
  const px = (v) => +(v * k).toFixed(1)
  return `<div class="plan-labels" aria-hidden="true">${s.labels.map((l) => `<span class="pl ${esc(l.kind || '')}" style="left:${px(l.at[0])}px;top:${px(l.at[1])}px;font-size:${px(l.size)}px${l.rotate ? `;--r:${l.rotate}deg` : ''}">${l.kind === 'tag' ? TAG : ''}${esc(l.text)}</span>`).join('')}</div>`
}

export default {
  render: (s) => `
    <div class="abs plan" data-in="fade" style="left:${s.image.box[0]}px;top:${s.image.box[1]}px;width:${s.image.box[2]}px;height:${s.image.box[3]}px">${img(s.image.src, s.image.alt)}${labels(s)}</div>
    ${nBand([0, 954, 1920, 126], { origin: [-30, 651 - 954], cls: 'charcoal' })}
    <div class="${s.subtitle ? 'has-sub' : ''}">
      <p class="abs eyebrow" data-in="up">${esc(s.eyebrow)}</p>
      <h1 class="abs title" data-in="up">${esc(s.title)}</h1>
      ${s.subtitle ? `<p class="abs subtitle" data-in="up">${esc(s.subtitle)}</p>` : ''}
      ${ruleBar()}
      <p class="abs legend-head" data-in="up">Legend</p>
      <ul class="abs legend">
        ${s.legend.map((l) => `<li data-in="up"><i style="background:${esc(l.swatch)}${l.outline ? ';box-shadow:inset 0 0 0 1px #5a5a5a' : ''}"></i>${esc(l.label)}</li>`).join('')}
      </ul>
    </div>`,
}
