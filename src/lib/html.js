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
  `<img class="${cls}" data-src="${esc(src)}" alt="${esc(alt)}" decoding="async" draggable="false">`

// A muted looping video with its still as the poster (the deck loads it only
// while its slide is on screen); playLoop/pauseLoop start and stop it.
export const loopVideo = (src, poster, alt = '', cls = '') =>
  `<video class="${cls}" data-src="${esc(src)}" poster="${esc(poster)}" aria-label="${esc(alt)}" muted loop playsinline preload="none"></video>`
export const playLoop = (el) => { const v = el.querySelector('video'); if (v) { v.currentTime = 0; v.play().catch(() => {}) } }
export const pauseLoop = (el) => el.querySelector('video')?.pause()

// The repeating "N" band. `box` = [left, top, width, height] in stage px.
// `origin` = where the PDF places the pattern image, relative to the box, so
// the N's line up with the static deck. `vertical` uses the rotated texture.
export const nBand = (box, { vertical = false, origin = [0, 0], cls = '' } = {}) => {
  const [l, t, w, h] = box
  const src = vertical ? 'assets/textures/n-band-v.jpg' : 'assets/textures/n-band.jpg'
  return `<div class="n-band${vertical ? ' v' : ''} ${cls}" aria-hidden="true" style="left:${l}px;top:${t}px;width:${w}px;height:${h}px;--band:url('${src}');--bx:${origin[0]}px;--by:${origin[1]}px"></div>`
}

// Dark angled label tag used on full-bleed renders and views.
export const tag = (label, cls = '') => `<p class="img-tag ${cls}" data-in="tag"><span>${esc(label)}</span></p>`
