// Stats grid beside a full-height image.
// Fields: title, subtitle, image{src, alt}, stats[{value, detail?, wide?}] (two columns,
// row by row; wide: true spans both columns with the detail beside the value)
import { countable, esc, hairline, img, rich, ruleBar } from '../lib/html.js'

export default {
  render: (s) => `
    <h1 class="abs title" data-in="up">${esc(s.title)}</h1>
    <p class="abs subtitle" data-in="up">${rich(s.subtitle)}</p>
    ${ruleBar()}
    <div class="abs stats">
      ${s.stats.map((st) => `
        <div class="stat${st.wide ? ' wide' : ''}" data-in="up">
          ${hairline()}
          <p class="v">${countable(rich(st.value))}</p>
          ${st.detail ? `<p class="d">${rich(st.detail)}</p>` : ''}
        </div>`).join('')}
    </div>
    <div class="abs media">${img(s.image.src, s.image.alt, 'cover-img')}</div>`,
}
