// Dark full-bleed photo with a titled 2×2 feature grid and badges.
// Fields: eyebrow, title, background, features[{title, body}], badges[{src, alt}],
//         clouds? [far, near] cloud textures (white on transparent, tiling
//         sideways) that drift slowly across the sky while the slide is up
import { esc, img, rich, ruleBar } from '../lib/html.js'
import { reducedMotion } from '../motion.js'

// The clouds are soft, so they're drawn at half the stage resolution: one
// cheap canvas instead of full-screen layers the browser has to blend.
const W = 960, H = 540
const LAYERS = [{ alpha: 0.18, secs: 150 }, { alpha: 0.13, secs: 95, phase: 0.42 }] // secs to cross the slide

// Where clouds may show: right of the tower's sloping edge, and the sky above
// its roof. Same geometry as a CSS linear-gradient(52.6deg, …) on the stage.
function skyMask() {
  const c = Object.assign(document.createElement('canvas'), { width: W, height: H })
  const g = c.getContext('2d')
  const a = (52.6 * Math.PI) / 180, dx = Math.sin(a), dy = -Math.cos(a)
  const len = Math.abs(W * dx) + Math.abs(H * dy)
  const edge = g.createLinearGradient(W / 2 - (dx * len) / 2, H / 2 - (dy * len) / 2, W / 2 + (dx * len) / 2, H / 2 + (dy * len) / 2)
  edge.addColorStop(0.39, 'rgba(0,0,0,0)'); edge.addColorStop(0.52, '#000')
  g.fillStyle = edge; g.fillRect(0, 0, W, H)
  const top = g.createLinearGradient(0, 0, 0, H)
  top.addColorStop(0.12, '#000'); top.addColorStop(0.24, 'rgba(0,0,0,0)')
  g.fillStyle = top; g.fillRect(0, 0, W, H)
  return c
}

function draw(el, t) {
  const { ctx, imgs, mask } = el._sky
  ctx.globalCompositeOperation = 'source-over'
  ctx.clearRect(0, 0, W, H)
  imgs.forEach((im, i) => {
    const L = LAYERS[i] || LAYERS[0]
    if (!im.complete || !im.naturalWidth) return
    const x = (((t / L.secs + (L.phase || 0)) % 1) * W)
    ctx.globalAlpha = L.alpha
    ctx.drawImage(im, -x, 0, W, H)
    ctx.drawImage(im, W - x, 0, W, H)
  })
  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = 'destination-in'
  ctx.drawImage(mask, 0, 0)
}

export default {
  render: (s) => `
    <div class="abs fill">${img(s.background, '', 'cover-img')}</div>
    ${s.clouds ? `<canvas class="abs sky" width="${W}" height="${H}" aria-hidden="true"></canvas>` : ''}
    <p class="abs eyebrow" data-in="up">${esc(s.eyebrow)}</p>
    <h1 class="abs title" data-in="up">${esc(s.title)}</h1>
    ${ruleBar()}
    <div class="abs grid">
      ${s.features.map((f) => `<div class="f" data-in="up"><h3>${esc(f.title)}</h3><p>${rich(f.body)}</p></div>`).join('')}
      <div class="badges" data-in="up">${s.badges.map((b) => img(b.src, b.alt)).join('')}</div>
    </div>`,
  mount(el, s) {
    const canvas = el.querySelector('canvas.sky')
    if (!canvas) return
    const imgs = s.clouds.map((src) => Object.assign(new Image(), { src }))
    el._sky = { ctx: canvas.getContext('2d'), imgs, mask: skyMask(), t: 0 }
    imgs.forEach((im) => im.addEventListener('load', () => draw(el, el._sky.t)))
  },
  enter(el) {
    const sky = el._sky
    if (!sky || reducedMotion.matches) return
    let last = performance.now()
    const tick = (now) => {
      sky.t += Math.min(now - last, 100) / 1000 // don't jump after a stalled tab
      last = now
      draw(el, sky.t)
      sky.raf = requestAnimationFrame(tick)
    }
    sky.raf = requestAnimationFrame(tick)
  },
  leave(el) { if (el._sky) cancelAnimationFrame(el._sky.raf) },
}
