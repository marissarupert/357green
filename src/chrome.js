import arrowUp from './assets/svg/arrow-up.svg?raw'
import arrowDown from './assets/svg/arrow-down.svg?raw'
import logo357 from './assets/svg/logo-357.svg?raw'
import watermark from './assets/svg/watermark-357.svg?raw'
import { esc } from './lib/html.js'

const icon = {
  menu: '<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  full: '<svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
  exit: '<svg viewBox="0 0 24 24"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5 5 19"/></svg>',
}

// Arrows, presenter controls, progress bar and the section menu.
export function createChrome(stage, deck, { sections, slides }) {
  stage.insertAdjacentHTML('beforeend', `
    <div class="deck-arrows">
      <button class="up" aria-label="Previous slide">${arrowUp}</button>
      <button class="down" aria-label="Next slide">${arrowDown}</button>
    </div>
    <div class="deck-controls">
      <button class="ctl menu-btn" aria-label="Sections (M)" aria-haspopup="dialog">${icon.menu}</button>
      <button class="ctl fs-btn" aria-label="Full screen (F)">${icon.full}</button>
    </div>
    <div class="deck-progress" aria-hidden="true"><i></i></div>
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
    deck.block(menuApi)
    ;(items.find((b) => b.classList.contains('active')) || items.find((b) => !b.disabled))?.focus({ preventScroll: true })
  }
  function closeMenu() {
    menu.classList.remove('open')
    deck.unblock(menuApi)
    $('.menu-btn').focus({ preventScroll: true })
  }
  $('.menu-btn').addEventListener('click', openMenu)
  $('.menu-close').addEventListener('click', closeMenu)

  // ---------- fullscreen ----------
  const fsBtn = $('.fs-btn')
  const toggleFs = () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.())?.catch?.(() => {})
  fsBtn.addEventListener('click', toggleFs)
  document.addEventListener('fullscreenchange', () => {
    fsBtn.innerHTML = document.fullscreenElement ? icon.exit : icon.full
    fsBtn.setAttribute('aria-label', document.fullscreenElement ? 'Exit full screen (F)' : 'Full screen (F)')
  })

  addEventListener('keydown', (e) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || menu.classList.contains('open')) return
    if (e.key === 'f' || e.key === 'F') toggleFs()
    else if ((e.key === 'm' || e.key === 'M') && !stage.querySelector('.lightbox.open')) openMenu()
  })

  // ---------- arrows ----------
  $('.deck-arrows .up').addEventListener('click', deck.prev)
  $('.deck-arrows .down').addEventListener('click', deck.next)

  // ---------- controls fade out while the presenter isn't using the mouse ----------
  let idleTimer
  const wake = () => {
    stage.classList.remove('idle')
    clearTimeout(idleTimer)
    idleTimer = setTimeout(() => stage.classList.add('idle'), 2500)
  }
  addEventListener('pointermove', wake)
  wake()

  return {
    update(i) {
      $('.deck-progress i').style.width = `${((i + 1) / slides.length) * 100}%`
      $('.deck-arrows .up').disabled = i === 0
      $('.deck-arrows .down').disabled = i === slides.length - 1
    },
  }
}
