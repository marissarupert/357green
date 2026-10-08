import logo357 from './assets/svg/logo-357.svg?raw'
import { esc } from './lib/html.js'

const icon = {
  full: '<svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
  exit: '<svg viewBox="0 0 24 24"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>',
}

const pad = (n) => String(n).padStart(2, '0')

// A floating ☰ in the top-right corner, over the slide. It drops a slim strip
// down from the top: the 357 mark (back to the start), the sections in one row
// (each jumps to the start of its section), then the slide counter and full
// screen. ☰ or M opens and closes it; Esc, a click outside or picking a
// section closes it.
export function createMenu(app, deck, { sections, slides, chrome }) {
  const groups = sections.map((sec) => ({
    ...sec,
    items: slides.map((s, i) => ({ s, i })).filter(({ s }) => s.section === sec.id),
  }))

  app.insertAdjacentHTML('afterbegin', `
    <div class="deck-nav">
      <button class="mn-burger" aria-label="Menu (M)" aria-expanded="false" aria-controls="mn-panel"><i></i><i></i><i></i></button>
      <nav class="mn-panel" id="mn-panel" aria-label="Sections">
        <button class="mn-logo" aria-label="357 Green, back to the start">${logo357}</button>
        <ol class="mn-secs">
          ${groups.map((g, n) => `
            <li><button class="mn-sec" data-section="${esc(g.id)}" data-go="${g.items[0]?.i ?? -1}"${g.items.length ? '' : ' disabled'}>
              <span class="n">${pad(n + 1)}</span><span class="t">${esc(g.label)}</span>
            </button></li>`).join('')}
        </ol>
        <div class="mn-foot">
          <p class="mn-count"><b></b> / ${pad(slides.length)}</p>
          <button class="mn-fs">${icon.full}<span>Full screen</span></button>
        </div>
      </nav>
    </div>`)

  const bar = app.querySelector('.deck-nav')
  const $ = (sel) => bar.querySelector(sel)
  const burger = $('.mn-burger')
  const secBtns = [...bar.querySelectorAll('.mn-sec')]
  let current = 0

  // ---------- open / close ----------
  const keys = {
    onKey(e) {
      if (e.key === 'Escape' || e.key === 'm' || e.key === 'M') { close(); return true }
      if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        const row = secBtns.filter((b) => !b.disabled)
        const at = row.indexOf(document.activeElement)
        const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1
        row[(at + step + row.length) % row.length]?.focus()
        return true
      }
      return e.key !== 'Tab' && e.key !== 'Enter' && e.key !== ' '
    },
  }
  const isOpen = () => bar.classList.contains('open')
  function open() {
    if (isOpen()) return
    const sec = slides[current]?.section
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
  $('.mn-logo').addEventListener('click', () => { close(); deck.go(0) })

  // ---------- full screen ----------
  const fsBtn = $('.mn-fs')
  fsBtn.addEventListener('click', chrome.toggleFullscreen)
  document.addEventListener('fullscreenchange', () => {
    fsBtn.innerHTML = `${document.fullscreenElement ? icon.exit : icon.full}<span>${document.fullscreenElement ? 'Exit full screen' : 'Full screen'}</span>`
  })

  return {
    update(i) {
      current = i
      const sec = slides[i]?.section
      secBtns.forEach((b) => b.classList.toggle('here', b.dataset.section === sec))
      $('.mn-count b').textContent = pad(i + 1)
    },
  }
}
