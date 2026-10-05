import arrowUp from './assets/svg/arrow-up.svg?raw'
import arrowDown from './assets/svg/arrow-down.svg?raw'

// Slide arrows and full screen (the top bar holds the menu).
export function createChrome(stage, deck, { slides }) {
  stage.insertAdjacentHTML('beforeend', `
    <div class="deck-arrows">
      <button class="up" aria-label="Previous slide">${arrowUp}</button>
      <button class="down" aria-label="Next slide">${arrowDown}</button>
    </div>`)

  const $ = (sel) => stage.querySelector(sel)

  // ---------- fullscreen ----------
  const toggleFs = () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.())?.catch?.(() => {})

  addEventListener('keydown', (e) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return
    if (e.key === 'f' || e.key === 'F') toggleFs()
  })

  // ---------- arrows ----------
  $('.deck-arrows .up').addEventListener('click', deck.prev)
  $('.deck-arrows .down').addEventListener('click', deck.next)

  return {
    toggleFullscreen: toggleFs,
    update(i) {
      $('.deck-arrows .up').disabled = i === 0
      $('.deck-arrows .down').disabled = i === slides.length - 1
    },
  }
}
