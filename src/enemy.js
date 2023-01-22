import Config from './config'
import Shared from './shared'
import { Sprite, draw as drawSprite, update as updateSprite } from './sprite'
import { rightBarrier, leftBarrier, topBarrier, downBarrier, xyBarrier } from './barriers'
import { touches } from './utils'

const STEP_TIME = 17
const RIGHT = 1
const LEFT  = -1
const UP    = -1
const DOWN  = 1

export function Enemy(spriteCfg, speed, horizontal, scr) {
  const enemy = {
    scr,
    speed,
    dir: horizontal ? RIGHT : DOWN,
    horizontal,
    sprite: Sprite(...spriteCfg),
    stepTime: performance.now(),
    touchTime: performance.now()
  }

  enemy.sprite.img = horizontal ? enemy.sprite.imgs.idleRight : enemy.sprite.imgs.idleDown
  return enemy
}

export function draw(e) {
  drawSprite(e.sprite)
}

export function update(e) {
  const t = performance.now()

  if (e.horizontal) {
    t - e.stepTime > STEP_TIME && (e.sprite.x += (e.speed * e.dir))

    if (e.dir === RIGHT && (rightBarrier(e.sprite) || !barrierRightBelow(e.sprite) || e.sprite.x + e.sprite.width > Config.width))
      e.dir = LEFT, e.sprite.img = e.sprite.imgs.idleLeft
    else if (e.dir === LEFT && (leftBarrier(e.sprite) || !barrierLeftBelow(e.sprite) || e.sprite.x < 0))
      e.dir = RIGHT, e.sprite.img = e.sprite.imgs.idleRight
  } else {
    t - e.stepTime > STEP_TIME && (e.sprite.y += (e.speed * e.dir))

    if (e.dir === DOWN && (downBarrier(e.sprite) || !barrierBelowLeft(e.sprite) || e.sprite.y + e.sprite.height > Config.height))
      e.dir = UP, e.sprite.img = e.sprite.imgs.idleUp
    else if (e.dir === UP && (topBarrier(e.sprite) || !barrierAboveLeft(e.sprite) || e.sprite.y < 0))
      e.dir = DOWN, e.sprite.img = e.sprite.imgs.idleDown
  }

  if (touches(e.sprite, Shared.hero.sprite) && (t - e.touchTime > Config.touchDelay)) {
    Shared.hero.hit = true
    e.touchTime = t
    // const sprite = Sprite({ x: 0, y: 0 }, l.sprite.img.img.src)
    // sprite.width = l.sprite.img.frames.width
    // Shared.picked.items.push(sprite)
    // const idx = findObjIdx(Shared.objs, l)
    // idx !== -1 && Shared.objs.splice(idx, 1)
  }

  updateSprite(e.sprite)
}

function barrierRightBelow(sprite) {
  return xyBarrier(sprite.x + sprite.width, sprite.y + sprite.height + 1)
}

function barrierLeftBelow(sprite) {
  return xyBarrier(sprite.x, sprite.y + sprite.height + 1)
}

function barrierBelowLeft(sprite) {
  return xyBarrier(sprite.x - 1, sprite.y + sprite.height)
}

function barrierAboveLeft(sprite) {
  return xyBarrier(sprite.x - 1, sprite.y)
}