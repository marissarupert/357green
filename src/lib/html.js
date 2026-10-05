// Small helpers shared by the slide renderers.

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
export const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ESC[c])

// Content copy may use <b>, </b> and <br>; anything else is shown as text.
export const rich = (s = '') => esc(s).replace(/&lt;(\/?b|br\s*\/?)&gt;/g, '<$1>')

// Copper bar + hairline. `anim` lets the entrance animate both parts.
export const ruleBar = (cls = '') => `<div class="rule-bar ${cls}" data-in="rule-bar"></div>`

export const hairline = (cls = '') => `<span class="hairline ${cls}" data-in="line"></span>`

export const placeholderTag = (label = 'Placeholder') => `<span class="ph-tag">${esc(label)}</span>`

// Wrap a leading figure ("34,600 SF", "120 +") so it can count up on entry.
// Figures glued to feet/inch marks (13’3”) are left alone.
export function countable(html) {
  return html.replace(/^(\d{1,3}(?:,\d{3})+|\d+)(?![\d’'”".])/, (m) =>
    `<span class="count" data-count="${m.replace(/,/g, '')}" data-comma="${m.includes(',') ? 1 : 0}">${m}</span>`)
}

export const img = (src, alt = '', cls = '') =>
  `<img class="${cls}" data-src="${esc(src)}" alt="${esc(alt)}" draggable="false">`
