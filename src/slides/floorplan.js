// Light slide: floor plan with a legend.
// Fields: eyebrow, title, subtitle?, legend[{swatch, label, outline?}], image{src, alt, box:[l,t,w,h]}
import { esc, img, nBand, ruleBar } from '../lib/html.js'

export default {
  render: (s) => `
    <div class="abs plan" data-in="fade" style="left:${s.image.box[0]}px;top:${s.image.box[1]}px;width:${s.image.box[2]}px;height:${s.image.box[3]}px">${img(s.image.src, s.image.alt)}</div>
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
