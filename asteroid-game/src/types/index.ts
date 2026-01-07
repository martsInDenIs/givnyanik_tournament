export interface Position {
  x: number
  y: number
}

export interface Velocity {
  x: number
  y: number
}

export interface Ship {
  position: Position
  velocity: Velocity
  rotation: number
  rotationSpeed: number
  isAccelerating: boolean
}

export interface Bullet {
  id: string
  position: Position
  velocity: Velocity
  lifetime: number
  isEnemyBullet?: boolean
}

export interface Enemy {
  id: string
  position: Position
  velocity: Velocity
  rotation: number
  health: number
  lastShotTime: number
}

export type AsteroidSize = 'small' | 'medium' | 'large'

export interface Asteroid {
  id: string
  position: Position
  velocity: Velocity
  radius: number
  rotation: number
  rotationSpeed: number
  size: AsteroidSize
}

export interface GameState {
  ship: Ship
  bullets: Bullet[]
  asteroids: Asteroid[]
  enemies: Enemy[]
  score: number
  isGameOver: boolean
  isPaused: boolean
}

export interface Keys {
  ArrowUp: boolean
  ArrowDown: boolean
  ArrowLeft: boolean
  ArrowRight: boolean
  KeyW: boolean
  KeyS: boolean
  KeyA: boolean
  KeyD: boolean
  Space: boolean
  KeyP: boolean
  Escape: boolean
}
