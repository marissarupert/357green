// Closing slide with live phone and email links.
// Fields: title, firm, logos[{src, alt}], people[{name, role, phone, email}]
import { esc, img } from '../lib/html.js'
import { watermark } from '../lib/marks.js'

const tel = (p) => `tel:+1${p.replace(/\D/g, '')}`

export default {
  render: (s) => `
    ${watermark()}
    <h1 class="abs title" data-in="up">${esc(s.title)}</h1>
    <div class="rule-bar" data-in="rule-bar"></div>
    <p class="abs firm" data-in="up">${esc(s.firm)}</p>
    <div class="abs logos" data-in="fade">${s.logos.map((l) => img(l.src, l.alt)).join('')}</div>
    ${s.people.map((p, i) => `
      <div class="abs person p${i + 1}" data-in="up">
        <span class="hairline"></span>
        <p class="name">${esc(p.name)}</p>
        <p class="role">${esc(p.role)}</p>
        <a class="phone" href="${tel(p.phone)}">${esc(p.phone)}</a>
        <a class="email" href="mailto:${esc(p.email)}">${esc(p.email)}</a>
      </div>`).join('')}`,
}
