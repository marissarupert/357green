import { esc } from './lib/html.js'

const icon = {
  prev: '<svg viewBox="0 0 24 24"><path d="M15 4 7 12l8 8"/></svg>',
  next: '<svg viewBox="0 0 24 24"><path d="m9 4 8 8-8 8"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5 5 19"/></svg>',
}

// Full-stage photo gallery. open(photos[{src, caption}], startIndex, returnFocusTo)
export function createLightbox(stage, deck) {
  const el = document.createElement('div')
  el.className = 'lightbox'
  el.setAttribute('role', 'dialog')
  el.setAttribute('aria-modal', 'true')
  el.setAttribute('aria-label', 'Photo gallery')
  el.innerHTML = `
    <div class="lb-frame" data-interactive><img alt=""></div>
    <p class="lb-tag"><span class="cap"></span><span class="of"></span></p>
    <button class="ctl lb-nav prev" aria-label="Previous photo">${icon.prev}</button>
    <button class="ctl lb-nav next" aria-label="Next photo">${icon.next}</button>
    <button class="ctl lb-close" aria-label="Close gallery">${icon.close}</button>`
  stage.append(el)

  const image = el.querySelector('img')
  let photos = []
  let i = 0
  let returnTo = null
  let touchX = null

  const show = (n) => {
    i = (n + photos.length) % photos.length
    image.src = photos[i].src
    image.alt = photos[i].caption || ''
    el.querySelector('.cap').innerHTML = esc(photos[i].caption || '')
    el.querySelector('.of').textContent = `${i + 1} / ${photos.length}`
    photos.forEach((p, j) => { if (Math.abs(j - i) === 1) new Image().src = p.src })
  }

  const api = {
    open(list, start = 0, from = null) {
      photos = list
      returnTo = from
      el.classList.toggle('single', photos.length < 2)
      show(start)
      el.classList.add('open')
      deck.block(api)
      el.querySelector('.lb-close').focus({ preventScroll: true })
    },
    close() {
      el.classList.remove('open')
      deck.unblock(api)
      returnTo?.focus({ preventScroll: true })
    },
    onKey(e) {
      if (e.key === 'Escape') api.close()
      else if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(e.key)) show(i + 1)
      else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) show(i - 1)
      else if (e.key === 'Tab') return false
      return true
    },
  }

  el.querySelector('.prev').addEventListener('click', () => show(i - 1))
  el.querySelector('.next').addEventListener('click', () => show(i + 1))
  el.querySelector('.lb-close').addEventListener('click', api.close)
  el.addEventListener('click', (e) => { if (e.target === el) api.close() })
  el.addEventListener('pointerdown', (e) => { touchX = e.pointerType === 'mouse' ? null : e.clientX })
  el.addEventListener('pointerup', (e) => {
    if (touchX === null) return
    const dx = e.clientX - touchX
    if (Math.abs(dx) > 50) show(i + (dx < 0 ? 1 : -1))
    touchX = null
  })
  return api
}
