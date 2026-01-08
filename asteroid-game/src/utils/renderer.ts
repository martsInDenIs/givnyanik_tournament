import type { Ship, Bullet, Asteroid, Enemy } from '../types'
import { SHIP_SIZE, BULLET_SIZE, ENEMY_SIZE } from './physics'

export function drawShip(ctx: CanvasRenderingContext2D, ship: Ship): void {
  ctx.save()
  ctx.translate(ship.position.x, ship.position.y)
  ctx.rotate(ship.rotation)

  ctx.strokeStyle = ship.isAccelerating ? '#00ff00' : '#fff'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(SHIP_SIZE, 0)
  ctx.lineTo(-SHIP_SIZE, -SHIP_SIZE * 0.6)
  ctx.lineTo(-SHIP_SIZE * 0.6, 0)
  ctx.lineTo(-SHIP_SIZE, SHIP_SIZE * 0.6)
  ctx.closePath()
  ctx.stroke()

  if (ship.isAccelerating) {
    ctx.strokeStyle = '#ff6600'
    ctx.beginPath()
    ctx.moveTo(-SHIP_SIZE * 0.6, -SHIP_SIZE * 0.3)
    ctx.lineTo(-SHIP_SIZE * 1.2, 0)
    ctx.lineTo(-SHIP_SIZE * 0.6, SHIP_SIZE * 0.3)
    ctx.stroke()
  }

  ctx.restore()
}

export function drawBullet(ctx: CanvasRenderingContext2D, bullet: Bullet): void {
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(bullet.position.x, bullet.position.y, BULLET_SIZE, 0, Math.PI * 2)
  ctx.fill()
}

export function drawAsteroid(ctx: CanvasRenderingContext2D, asteroid: Asteroid): void {
  ctx.save()
  ctx.translate(asteroid.position.x, asteroid.position.y)
  ctx.rotate(asteroid.rotation)

  ctx.strokeStyle = '#888'
  ctx.lineWidth = 2
  ctx.beginPath()

  const points = 8
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2
    const variance = 0.7 + Math.random() * 0.3
    const radius = asteroid.radius * variance
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius

    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }

  ctx.closePath()
  ctx.stroke()
  ctx.restore()
}

export function drawScore(
  ctx: CanvasRenderingContext2D,
  score: number
): void {
  ctx.fillStyle = '#fff'
  ctx.font = '24px "Courier New", monospace'
  ctx.textAlign = 'left'
  ctx.fillText(`SCORE: ${score}`, 20, 40)
}

export function drawGameOver(
  ctx: CanvasRenderingContext2D,
  score: number,
  width: number,
  height: number
): void {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = '#fff'
  ctx.font = '48px "Courier New", monospace'
  ctx.textAlign = 'center'
  ctx.fillText('GAME OVER', width / 2, height / 2 - 40)

  ctx.font = '32px "Courier New", monospace'
  ctx.fillText(`FINAL SCORE: ${score}`, width / 2, height / 2 + 20)

  ctx.font = '20px "Courier New", monospace'
  ctx.fillText('Press ENTER to restart', width / 2, height / 2 + 80)
}

export function drawEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy): void {
  ctx.save()
  ctx.translate(enemy.position.x, enemy.position.y)
  ctx.rotate(enemy.rotation)

  ctx.strokeStyle = enemy.health === 2 ? '#ff4444' : '#ff8844'
  ctx.fillStyle = enemy.health === 2 ? '#ff4444' : '#ff8844'
  ctx.lineWidth = 2

  const points = 5
  const outerRadius = ENEMY_SIZE
  const innerRadius = ENEMY_SIZE * 0.5

  ctx.beginPath()
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius
    const angle = (i * Math.PI) / points
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius
    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }
  ctx.closePath()
  ctx.stroke()
  ctx.fill()

  ctx.restore()
}

export function drawPaused(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = '#fff'
  ctx.font = '48px "Courier New", monospace'
  ctx.textAlign = 'center'
  ctx.fillText('PAUSED', width / 2, height / 2 - 20)

  ctx.font = '20px "Courier New", monospace'
  ctx.fillText('Press P or ESC to resume', width / 2, height / 2 + 30)
}

export function drawStartScreen(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = '#ff00de'
  ctx.font = 'bold 56px "Courier New", monospace'
  ctx.textAlign = 'center'
  ctx.shadowColor = '#ff00de'
  ctx.shadowBlur = 20
  ctx.fillText('ASTEROIDS', width / 2, height / 2 - 80)
  ctx.shadowBlur = 0

  ctx.fillStyle = '#00ff88'
  ctx.font = '24px "Courier New", monospace'
  ctx.fillText('Press any key to start', width / 2, height / 2 + 20)

  ctx.fillStyle = '#888'
  ctx.font = '16px "Courier New", monospace'
  ctx.fillText('WASD or Arrow Keys to move', width / 2, height / 2 + 80)
  ctx.fillText('SPACE to shoot', width / 2, height / 2 + 110)
}
