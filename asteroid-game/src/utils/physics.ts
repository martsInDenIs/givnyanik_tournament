import type { Position, AsteroidSize } from '../types'

export const CANVAS_WIDTH = 800
export const CANVAS_HEIGHT = 600

export const SHIP_ACCELERATION = 0.15
export const SHIP_ROTATION_SPEED = 0.08
export const SHIP_FRICTION = 0.98
export const SHIP_MAX_SPEED = 8
export const SHIP_SIZE = 15

export const BULLET_SPEED = 10
export const BULLET_LIFETIME = 60
export const BULLET_SIZE = 3

export const ASTEROID_SIZES = {
  small: { radius: 15, speed: { min: 1.5, max: 2.5 }, score: 30 },
  medium: { radius: 30, speed: { min: 1, max: 2 }, score: 20 },
  large: { radius: 50, speed: { min: 0.5, max: 1.5 }, score: 10 },
}

export const ASTEROID_SPAWN_WEIGHTS = {
  small: 0.1,
  medium: 0.7,
  large: 0.2,
}

export const ENEMY_SIZE = 20
export const ENEMY_SPEED = 1.5
export const ENEMY_SHOOT_INTERVAL = 2000
export const ENEMY_BULLET_SPEED = 6
export const ENEMY_SCORE = 100

export function wrapPosition(position: Position): Position {
  return {
    x: ((position.x % CANVAS_WIDTH) + CANVAS_WIDTH) % CANVAS_WIDTH,
    y: ((position.y % CANVAS_HEIGHT) + CANVAS_HEIGHT) % CANVAS_HEIGHT,
  }
}

export function getDistance(pos1: Position, pos2: Position): number {
  const dx = pos1.x - pos2.x
  const dy = pos1.y - pos2.y
  return Math.sqrt(dx * dx + dy * dy)
}

export function checkCollision(
  pos1: Position,
  radius1: number,
  pos2: Position,
  radius2: number
): boolean {
  return getDistance(pos1, pos2) < radius1 + radius2
}

export function randomPosition(): Position {
  const edge = Math.floor(Math.random() * 4)

  switch (edge) {
    case 0:
      return { x: Math.random() * CANVAS_WIDTH, y: -50 }
    case 1:
      return { x: CANVAS_WIDTH + 50, y: Math.random() * CANVAS_HEIGHT }
    case 2:
      return { x: Math.random() * CANVAS_WIDTH, y: CANVAS_HEIGHT + 50 }
    default:
      return { x: -50, y: Math.random() * CANVAS_HEIGHT }
  }
}

export function randomVelocity(min: number, max: number): { x: number; y: number } {
  const angle = Math.random() * Math.PI * 2
  const speed = min + Math.random() * (max - min)
  return {
    x: Math.cos(angle) * speed,
    y: Math.sin(angle) * speed,
  }
}

export function getRandomAsteroidSize(): AsteroidSize {
  const rand = Math.random()
  if (rand < ASTEROID_SPAWN_WEIGHTS.small) {
    return 'small'
  } else if (rand < ASTEROID_SPAWN_WEIGHTS.small + ASTEROID_SPAWN_WEIGHTS.medium) {
    return 'medium'
  } else {
    return 'large'
  }
}

export function getSmallerSize(size: AsteroidSize): AsteroidSize | null {
  if (size === 'large') return 'medium'
  if (size === 'medium') return 'small'
  return null
}
