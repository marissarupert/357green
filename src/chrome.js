import arrowUp from './assets/svg/arrow-up.svg?raw'
import arrowDown from './assets/svg/arrow-down.svg?raw'
import logo357 from './assets/svg/logo-357.svg?raw'
import watermark from './assets/svg/watermark-357.svg?raw'
import { esc } from './lib/html.js'

const icon = {
  close: '<svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5 5 19"/></svg>',
}

// Arrows and the full-screen section menu (the top bar holds the rest).
export function createChrome(stage, deck, { sections, slides }) {
  stage.insertAdjacentHTML('beforeend', `
    <div class="deck-arrows">
      <button class="up" aria-label="Previous slide">${arrowUp}</button>
      <button class="down" aria-label="Next slide">${arrowDown}</button>
    </div>
    <nav class="deck-menu" aria-label="Sections" role="dialog" aria-modal="true">
      <div class="wm" aria-hidden="true">${watermark}</div>
      <div>
        <p class="eyebrow menu-head">Sections</p>
        <ol class="menu-list">
          ${sections.map((sec, n) => `
            <li><button class="menu-item" data-section="${esc(sec.id)}">
              <span class="n">${String(n + 1).padStart(2, '0')}</span><span class="t">${esc(sec.label)}</span>
            </button></li>`).join('')}
        </ol>
      </div>
      <div class="menu-side">
        <button class="ctl menu-close" aria-label="Close sections">${icon.close}</button>
        <div class="logo" aria-hidden="true">${logo357}</div>
      </div>
    </nav>`)

  const $ = (sel) => stage.querySelector(sel)
  const menu = $('.deck-menu')
  const items = [...stage.querySelectorAll('.menu-item')]
  const firstOf = (id) => slides.findIndex((s) => s.section === id)

  items.forEach((b) => {
    const target = firstOf(b.dataset.section)
    if (target < 0) b.disabled = true
    b.addEventListener('click', () => { closeMenu(); deck.go(target) })
  })

  // ---------- menu ----------
  let opener = null
  const menuApi = {
    onKey(e) {
      if (e.key === 'Escape' || e.key === 'm' || e.key === 'M') { closeMenu(); return true }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const live = items.filter((b) => !b.disabled)
        const at = live.indexOf(document.activeElement)
        live[(at + (e.key === 'ArrowDown' ? 1 : -1) + live.length) % live.length].focus()
        return true
      }
      return e.key !== 'Tab' && e.key !== 'Enter' && e.key !== ' '
    },
  }
  function openMenu() {
    const sec = slides[deck.current]?.section
    items.forEach((b) => b.classList.toggle('active', b.dataset.section === sec))
    menu.classList.add('open')
    opener = document.activeElement
    deck.block(menuApi)
    ;(items.find((b) => b.classList.contains('active')) || items.find((b) => !b.disabled))?.focus({ preventScroll: true })
  }
  function closeMenu() {
    menu.classList.remove('open')
    deck.unblock(menuApi)
    opener?.focus?.({ preventScroll: true })
  }
  $('.menu-close').addEventListener('click', closeMenu)

  // ---------- fullscreen ----------
  const toggleFs = () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.())?.catch?.(() => {})

  addEventListener('keydown', (e) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || menu.classList.contains('open')) return
    if (e.key === 'f' || e.key === 'F') toggleFs()
    else if ((e.key === 'm' || e.key === 'M') && !stage.querySelector('.lightbox.open')) openMenu()
  })

  // ---------- arrows ----------
  $('.deck-arrows .up').addEventListener('click', deck.prev)
  $('.deck-arrows .down').addEventListener('click', deck.next)

  return {
    openMenu,
    toggleFullscreen: toggleFs,
    update(i) {
      $('.deck-arrows .up').disabled = i === 0
      $('.deck-arrows .down').disabled = i === slides.length - 1
    },
  }
}
