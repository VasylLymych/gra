import Shared from './shared'
import Config from './config'
import { Hero, draw as drawHero, update as updateHero } from './hero'
import { Bullet, draw as drawBullet, update as updateBullet } from './bullet'
import { Level, draw as drawLevel, update as updateLevel } from './level'
import { updateObjs, room } from './rooms'
import { Debug, draw as drawDebug } from './debug'
import { logo, fn, on, off, findObjById, findObjByDrawFn, isMobile, show, hide, text } from './utils'
import { Music, play, stop } from './music'
import { Picked, draw as drawPicked } from './picked'
import { Sounds } from './sounds'
import { preload } from './assets'

let stopped = false

const playBtn = document.querySelector(Config.playQuery)
const spinner = document.querySelector(Config.spinnerQuery)
const doc = document

function main() {
  Shared.ctx = doc.getElementById(Config.canvasId).getContext('2d')
  Shared.ctx.canvas.width = Config.width
  Shared.ctx.canvas.height = Config.height
  Shared.ctx.fillStyle = Config.frontColor
  Shared.ctx.font = Config.frontFont
  Shared.ctx.imageSmoothingEnabled = false

  if (!checkDesktop()) return
  show(spinner)
  resize()
  logo()
  on(window, 'resize', resize)
  preload(onAssets)
}

function animate() {
  Shared.ctx.clearRect(0, 0, Config.width, Config.height)
  draw()
  update()
  Config.useSetTimeout ? setTimeout(animate) : requestAnimationFrame(animate)
}

function draw() {
  Shared.objs.forEach(o => o.draw(o.o))
  Shared.stop && drawStop()
}

function update() {
  !Shared.stop && Shared.objs.forEach(o => o.update(o.o))
}

function checkDesktop() {
  const isDesktop = !isMobile()
  if (!isDesktop) {
    Shared.ctx.font = Config.fontGameOver
    Shared.ctx.fillText(Config.msgs.noMobileSupport, 120, 300)
  }
  return isDesktop
}

function onAssets() {
  createObjs()
  updateObjs(null, room())
  on(playBtn, 'click', start)
  show(playBtn)
  hide(spinner)
}

function start() {
  // TODO: remove in production
  on(window, 'keyup', onPrompt)

  hide(playBtn)
  off(playBtn, 'click', start)
  play(Shared.music)
  animate()
}

function drawStop() {
  if (Shared.stop === Config.gameOverId) {
    text(Config.msgs.gameOver, Config.width / 2 - 55, Config.height / 2, Config.fontGameOver)
  } else if (Shared.stop === Config.gameCompletedId) {
    text(Config.msgs.youWin, Config.width / 2 - 45, Config.height / 2, Config.fontGameOver)
  }

  if (!stopped) {
    if (Shared.stop === Config.gameOverId) Shared.sounds.gameOver.play()
    else if(Shared.stop === Config.gameCompletedId) Shared.sounds.win.play()
    stop(Shared.music)
    stopped = true
  }
}

function onPrompt(e) {
  if (e.key !== '+' && e.key !== '=') return
  const v = prompt('Type room coordinates (like 1,2)')
  const offs = v.split(',')
  const x = Shared.offsX
  const y = Shared.offsY
  Shared.offsX = Config.width * offs[0].trim()
  Shared.offsY = Config.height * offs[1].trim()
  updateObjs(room(x, y), room())
}

function resize() {
  doc.body.style.zoom = window.innerHeight * .9 / Config.height
}

function createObjs() {
  // Static items. Order is important!
  const objs = Shared.objs = [
    { draw: drawLevel,  update: updateLevel,  o: Level() },
    { draw: drawHero,   update: updateHero,   o: Hero(),   id: Config.heroId },
    { draw: drawBullet, update: updateBullet, o: Bullet(), id: Config.bulletId },
    { draw: drawPicked, update: fn,           o: Picked() }
  ]

  Config.debug && objs.push({ draw: drawDebug, update: fn, o: Debug() })
  Shared.music = Music()
  Shared.sounds = Sounds()
  Shared.picked = findObjByDrawFn(drawPicked)
  Shared.hero = findObjById(Config.heroId)
  Shared.bullet = findObjById(Config.bulletId)
}

main()