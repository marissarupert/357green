import logo357 from './assets/svg/logo-357.svg?raw'
import { esc } from './lib/html.js'

const icon = {
  menu: '<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  full: '<svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
  exit: '<svg viewBox="0 0 24 24"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>',
  chev: '<svg viewBox="0 0 24 24"><path d="m7 10 5 5 5-5"/></svg>',
}

const strip = (t) => String(t || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
const humanize = (id) => id.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ')
const pad = (n) => String(n).padStart(2, '0')

// What a slide is called in the menus: its title, else its image label, else
// its eyebrow (when that says more than the section name), else its id.
const nameOf = (s, sectionLabel) =>
  strip(s.title) || strip(s.label) || (strip(s.eyebrow) !== sectionLabel && strip(s.eyebrow)) || humanize(s.id)

// Menu bar pinned above the slide: logo, the seven sections (each opens a
// list of its slides), slide counter, all-sections menu and full screen.
// The deck scales the slide into the space below it.
export function createTopbar(app, deck, { sections, slides, chrome }) {
  const groups = sections.map((sec) => ({
    ...sec,
    items: slides.map((s, i) => ({ s, i })).filter(({ s }) => s.section === sec.id),
  }))

  app.insertAdjacentHTML('afterbegin', `
    <header class="topbar">
      <button class="tb-logo" aria-label="357 Green, back to the start">${logo357}</button>
      <nav class="tb-nav" aria-label="Sections">
        <ul>
          ${groups.map((g, n) => `
            <li class="tb-sec" data-section="${esc(g.id)}">
              <button class="tb-tab" data-go="${g.items[0]?.i ?? -1}" aria-haspopup="true" aria-expanded="false"${g.items.length ? '' : ' disabled'}>
                <span class="n">${pad(n + 1)}</span>${esc(g.label)}
              </button>
              <div class="tb-drop" role="menu">
                ${g.items.map(({ s, i }) => `<button class="tb-item" role="menuitem" data-go="${i}"><span class="n">${pad(i + 1)}</span><span class="t">${esc(nameOf(s, g.label))}</span></button>`).join('')}
              </div>
            </li>`).join('')}
        </ul>
        <span class="tb-ink" aria-hidden="true"></span>
      </nav>
      <p class="tb-here" aria-hidden="true"></p>
      <div class="tb-right">
        <p class="tb-count" aria-live="polite"><b></b> / ${pad(slides.length)}</p>
        <button class="tb-btn tb-menu" aria-label="All sections (M)">${icon.menu}</button>
        <button class="tb-btn tb-fs" aria-label="Full screen (F)">${icon.full}</button>
      </div>
      <span class="tb-progress" aria-hidden="true"><i></i></span>
    </header>`)

  const bar = app.querySelector('.topbar')
  const $ = (sel) => bar.querySelector(sel)
  const secs = [...bar.querySelectorAll('.tb-sec')]
  const ink = $('.tb-ink')

  // ---------- jumping ----------
  bar.addEventListener('click', (e) => {
    const b = e.target.closest('[data-go]')
    if (!b || b.disabled) return
    const i = Number(b.dataset.go)
    if (i >= 0) deck.go(i)
    const li = b.closest('.tb-sec')
    if (li) { li.classList.add('shut'); b.blur() } // close the dropdown until the pointer leaves
  })
  $('.tb-logo').addEventListener('click', () => deck.go(0))
  secs.forEach((li) => {
    const tab = li.querySelector('.tb-tab')
    const open = (on) => tab.setAttribute('aria-expanded', on)
    li.addEventListener('pointerenter', () => open(true))
    li.addEventListener('pointerleave', () => { open(false); li.classList.remove('shut') })
    li.addEventListener('focusin', () => open(true))
    li.addEventListener('focusout', (e) => { if (!li.contains(e.relatedTarget)) { open(false); li.classList.remove('shut') } })
  })

  // ---------- buttons ----------
  $('.tb-menu').addEventListener('click', () => chrome.openMenu())
  const fsBtn = $('.tb-fs')
  fsBtn.addEventListener('click', chrome.toggleFullscreen)
  document.addEventListener('fullscreenchange', () => {
    fsBtn.innerHTML = document.fullscreenElement ? icon.exit : icon.full
    fsBtn.setAttribute('aria-label', document.fullscreenElement ? 'Exit full screen (F)' : 'Full screen (F)')
  })

  // ---------- the copper underline slides to the current section ----------
  let active = null
  const placeInk = () => {
    const li = secs.find((n) => n.dataset.section === active)
    if (!li || getComputedStyle($('.tb-nav')).display === 'none') { ink.style.opacity = 0; return }
    const tab = li.querySelector('.tb-tab')
    ink.style.opacity = 1
    ink.style.transform = `translateX(${li.offsetLeft + 14}px)`
    ink.style.width = `${tab.offsetWidth - 28}px`
  }
  addEventListener('resize', placeInk)
  document.fonts?.ready.then(placeInk)

  return {
    update(i) {
      const s = slides[i]
      active = s?.section ?? null
      secs.forEach((li) => {
        const on = li.dataset.section === active
        li.classList.toggle('on', on)
        li.querySelector('.tb-tab').toggleAttribute('aria-current', on)
      })
      bar.querySelectorAll('.tb-item').forEach((b) => b.classList.toggle('here', Number(b.dataset.go) === i))
      $('.tb-here').textContent = groups.find((g) => g.id === active)?.label ?? ''
      $('.tb-count b').textContent = pad(i + 1)
      $('.tb-progress i').style.transform = `scaleX(${(i + 1) / slides.length})`
      placeInk()
    },
  }
}
