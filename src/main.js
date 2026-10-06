import './styles/base.css'
import './styles/chrome.css'
import './styles/slides.css'
import { sections, slides as content } from './content.js'
import { types } from './slides/index.js'
import { createDeck } from './deck.js'
import { createChrome } from './chrome.js'
import { createMenu } from './menu.js'
import { createLightbox } from './lightbox.js'
import { esc } from './lib/html.js'

const app = document.getElementById('app')
app.innerHTML = '<main id="stage" aria-roledescription="presentation" aria-label="357 Green"></main>'
const stage = document.getElementById('stage')

// A page can show a single slide on its own (e.g. location.html, a link for
// brokers): <div id="app" data-only="slide-id">. It gets no menu or arrows,
// and with one slide there is nowhere to move to.
const only = app.dataset.only
const shown = only ? content.filter((s) => s.id === only) : content
if (only) document.documentElement.classList.add('single-slide')

// Build every slide from content.js.
const slides = shown.map((s, i) => {
  const type = types[s.type]
  const el = document.createElement('section')
  el.className = `slide s-${s.type} ${s.theme === 'light' ? 'light' : 'dark'}`
  el.id = `slide-${s.id}`
  el.setAttribute('aria-roledescription', 'slide')
  el.setAttribute('aria-label', `${i + 1} of ${shown.length}`)
  el.setAttribute('aria-hidden', 'true')
  el.inert = true
  el.innerHTML = type
    ? type.render(s)
    : `<p style="position:absolute;left:80px;top:80px;font-size:40px">Unknown slide type “${esc(s.type)}”</p>`
  stage.append(el)
  return { ...s, el, type }
})

const deck = createDeck({ stage, slides, onChange: (i) => { chrome.update(i); menu?.update(i) } })
deck.lightbox = createLightbox(stage, deck)
const chrome = createChrome(stage, deck, { slides })
const menu = only ? null : createMenu(app, deck, { sections, slides, chrome })

slides.forEach((s) => s.type?.mount?.(s.el, s, deck))

// Wait for the font so first-slide text doesn't reflow mid-animation, but
// never longer than a second.
Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1000))]).then(() => deck.start())
