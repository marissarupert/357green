import logo357 from './assets/svg/logo-357.svg?raw'
import { esc } from './lib/html.js'

const icon = {
  full: '<svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
  exit: '<svg viewBox="0 0 24 24"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>',
}

const strip = (t) => String(t || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
const humanize = (id) => id.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ')
const pad = (n) => String(n).padStart(2, '0')

// What a slide is called in the menu: its title, else its image label, else
// its eyebrow (when that says more than the section name), else its id.
const nameOf = (s, sectionLabel) =>
  strip(s.title) || strip(s.label) || (strip(s.eyebrow) !== sectionLabel && strip(s.eyebrow)) || humanize(s.id)

// Slim bar pinned above the slide: the 357 mark and a menu button. The menu
// drops down from the bar: the seven sections on the left, the slides of the
// one you point at on the right, slide counter and full screen underneath.
// ☰ or M opens and closes it; Esc, a click outside or picking a slide closes it.
// The deck scales the slide into the space below the bar.
export function createTopbar(app, deck, { sections, slides, chrome }) {
  const groups = sections.map((sec) => ({
    ...sec,
    items: slides.map((s, i) => ({ s, i })).filter(({ s }) => s.section === sec.id),
  }))

  app.insertAdjacentHTML('afterbegin', `
    <header class="topbar">
      <button class="tb-logo" aria-label="357 Green, back to the start">${logo357}</button>
      <p class="tb-here" aria-hidden="true"></p>
      <button class="tb-burger" aria-label="Menu (M)" aria-expanded="false" aria-controls="tb-panel"><i></i><i></i><i></i></button>
      <span class="tb-progress" aria-hidden="true"><i></i></span>
      <nav class="tb-panel" id="tb-panel" aria-label="Sections">
        <ol class="tb-secs">
          ${groups.map((g, n) => `
            <li><button class="tb-sec" data-section="${esc(g.id)}" data-go="${g.items[0]?.i ?? -1}"${g.items.length ? '' : ' disabled'}>
              <span class="n">${pad(n + 1)}</span><span class="t">${esc(g.label)}</span>
            </button></li>`).join('')}
        </ol>
        <div class="tb-slides">
          ${groups.map((g) => `
            <ol class="tb-list" data-section="${esc(g.id)}">
              ${g.items.map(({ s, i }) => `<li><button class="tb-item" data-go="${i}" tabindex="-1"><span class="n">${pad(i + 1)}</span><span class="t">${esc(nameOf(s, g.label))}</span></button></li>`).join('')}
            </ol>`).join('')}
        </div>
        <div class="tb-foot">
          <p class="tb-count"><b></b> / ${pad(slides.length)}</p>
          <button class="tb-fs">${icon.full}<span>Full screen</span></button>
        </div>
      </nav>
    </header>`)

  const bar = app.querySelector('.topbar')
  const $ = (sel) => bar.querySelector(sel)
  const burger = $('.tb-burger')
  const secBtns = [...bar.querySelectorAll('.tb-sec')]
  const lists = [...bar.querySelectorAll('.tb-list')]
  let current = 0

  // ---------- which section's slides the right-hand pane shows ----------
  const preview = (id) => {
    secBtns.forEach((b) => b.classList.toggle('shown', b.dataset.section === id))
    lists.forEach((l) => {
      const on = l.dataset.section === id
      l.classList.toggle('on', on)
      l.querySelectorAll('button').forEach((b) => { b.tabIndex = on ? 0 : -1 })
    })
  }
  secBtns.forEach((b) => {
    b.addEventListener('pointerenter', () => preview(b.dataset.section))
    b.addEventListener('focus', () => preview(b.dataset.section))
  })

  // ---------- open / close ----------
  const keys = {
    onKey(e) {
      if (e.key === 'Escape' || e.key === 'm' || e.key === 'M') { close(); return true }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const col = document.activeElement?.closest('.tb-list') ? [...bar.querySelectorAll('.tb-list.on button')] : secBtns.filter((b) => !b.disabled)
        const at = col.indexOf(document.activeElement)
        col[(at + (e.key === 'ArrowDown' ? 1 : -1) + col.length) % col.length]?.focus()
        return true
      }
      if (e.key === 'ArrowRight') { bar.querySelector('.tb-list.on button')?.focus(); return true }
      if (e.key === 'ArrowLeft') { bar.querySelector('.tb-sec.shown')?.focus(); return true }
      return e.key !== 'Tab' && e.key !== 'Enter' && e.key !== ' '
    },
  }
  const isOpen = () => bar.classList.contains('open')
  function open() {
    if (isOpen()) return
    const sec = slides[current]?.section
    preview(sec || groups[0].id)
    bar.classList.add('open')
    burger.setAttribute('aria-expanded', 'true')
    burger.setAttribute('aria-label', 'Close menu (M)')
    deck.block(keys)
    ;(secBtns.find((b) => b.dataset.section === sec) || secBtns[0]).focus({ preventScroll: true })
  }
  function close() {
    if (!isOpen()) return
    bar.classList.remove('open')
    burger.setAttribute('aria-expanded', 'false')
    burger.setAttribute('aria-label', 'Menu (M)')
    deck.unblock(keys)
    burger.focus({ preventScroll: true })
  }
  burger.addEventListener('click', () => (isOpen() ? close() : open()))
  // a click outside only closes the menu; it doesn't also advance the slide
  let swallow = 0
  addEventListener('pointerdown', (e) => { if (isOpen() && !bar.contains(e.target)) { close(); swallow = e.timeStamp } })
  addEventListener('click', (e) => { if (swallow && e.timeStamp - swallow < 600) { e.stopPropagation(); e.preventDefault() } swallow = 0 }, true)
  addEventListener('keydown', (e) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || isOpen()) return
    if ((e.key === 'm' || e.key === 'M') && !document.querySelector('.lightbox.open')) { e.preventDefault(); open() }
  })

  // ---------- jumping ----------
  bar.addEventListener('click', (e) => {
    const b = e.target.closest('[data-go]')
    if (!b || b.disabled) return
    const i = Number(b.dataset.go)
    close()
    if (i >= 0) deck.go(i)
  })
  $('.tb-logo').addEventListener('click', () => { close(); deck.go(0) })

  // ---------- full screen ----------
  const fsBtn = $('.tb-fs')
  fsBtn.addEventListener('click', chrome.toggleFullscreen)
  document.addEventListener('fullscreenchange', () => {
    fsBtn.innerHTML = `${document.fullscreenElement ? icon.exit : icon.full}<span>${document.fullscreenElement ? 'Exit full screen' : 'Full screen'}</span>`
  })

  return {
    update(i) {
      current = i
      const sec = slides[i]?.section
      secBtns.forEach((b) => b.classList.toggle('here', b.dataset.section === sec))
      bar.querySelectorAll('.tb-item').forEach((b) => b.classList.toggle('here', Number(b.dataset.go) === i))
      $('.tb-here').textContent = groups.find((g) => g.id === sec)?.label ?? ''
      $('.tb-count b').textContent = pad(i + 1)
      $('.tb-progress i').style.transform = `scaleX(${(i + 1) / slides.length})`
    },
  }
}
