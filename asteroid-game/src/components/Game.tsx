import { useEffect, useRef, useState } from 'react'
import type { GameState, Ship, Bullet, Asteroid, Enemy } from '../types'
import { useKeyboard } from '../hooks/useKeyboard'
import styles from './ArcadeCabinet.module.css'
import Modal from './Modal'
import Scoreboard from './Scoreboard'
import Rules from './Rules'
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  SHIP_ACCELERATION,
  SHIP_ROTATION_SPEED,
  SHIP_FRICTION,
  SHIP_MAX_SPEED,
  SHIP_SIZE,
  BULLET_SPEED,
  BULLET_LIFETIME,
  ASTEROID_SIZES,
  ENEMY_SIZE,
  ENEMY_SPEED,
  ENEMY_SHOOT_INTERVAL,
  ENEMY_BULLET_SPEED,
  ENEMY_SCORE,
  wrapPosition,
  checkCollision,
  randomPosition,
  randomVelocity,
  getRandomAsteroidSize,
  getSmallerSize,
} from '../utils/physics'
import {
  drawShip,
  drawBullet,
  drawAsteroid,
  drawScore,
  drawGameOver,
  drawEnemy,
  drawPaused,
  drawStartScreen,
} from '../utils/renderer'
import { audioManager } from '../utils/audio'

const INITIAL_ASTEROID_SPAWN_RATE = 180
const MIN_ASTEROID_SPAWN_RATE = 30
const MAX_ASTEROIDS_AT_START = 3
const MAX_ASTEROIDS_AT_1000 = 15
const SCORE_FOR_MAX_ASTEROIDS = 1000
const ENEMY_SPAWN_INTERVAL = 300

function createInitialShip(): Ship {
  return {
    position: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 },
    velocity: { x: 0, y: 0 },
    rotation: -Math.PI / 2,
    rotationSpeed: 0,
    isAccelerating: false,
  }
}

function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const keysRef = useKeyboard()
  const gameStateRef = useRef<GameState>({
    ship: createInitialShip(),
    bullets: [],
    asteroids: [],
    enemies: [],
    score: 0,
    isGameOver: false,
    isPaused: false,
  })
  const lastShotTimeRef = useRef(0)
  const asteroidSpawnTimerRef = useRef(0)
  const asteroidSpawnRateRef = useRef(INITIAL_ASTEROID_SPAWN_RATE)
  const gameTimeRef = useRef(0)
  const lastEnemySpawnScoreRef = useRef(0)
  const lastPauseKeyPressRef = useRef(0)
  const hasScoreSavedRef = useRef(false)

  const [isMusicEnabled, setIsMusicEnabled] = useState(true)
  const [hasGameStarted, setHasGameStarted] = useState(false)
  const [isScoreboardOpen, setIsScoreboardOpen] = useState(false)
  const [isRulesOpen, setIsRulesOpen] = useState(false)
  const [highScores, setHighScores] = useState<Array<{ score: number; date: string }>>(() => {
    const saved = localStorage.getItem('asteroidHighScores')
    return saved ? JSON.parse(saved) : []
  })
  const [, forceUpdate] = useState({})

  const createAsteroid = (size = getRandomAsteroidSize(), position = randomPosition()): Asteroid => {
    const sizeConfig = ASTEROID_SIZES[size]
    return {
      id: Math.random().toString(36),
      position,
      velocity: randomVelocity(sizeConfig.speed.min, sizeConfig.speed.max),
      radius: sizeConfig.radius,
      rotation: 0,
      rotationSpeed: (Math.random() - 0.5) * 0.05,
      size,
    }
  }

  const splitAsteroid = (asteroid: Asteroid): Asteroid[] => {
    const smallerSize = getSmallerSize(asteroid.size)
    if (!smallerSize) return []

    const fragments: Asteroid[] = []
    const numFragments = 2

    for (let i = 0; i < numFragments; i++) {
      const angle = (Math.PI * 2 * i) / numFragments + Math.random() * 0.5
      const fragment = createAsteroid(smallerSize, { ...asteroid.position })
      const speed = ASTEROID_SIZES[smallerSize].speed.max
      fragment.velocity = {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed,
      }
      fragments.push(fragment)
    }

    return fragments
  }

  const createEnemy = (): Enemy => {
    return {
      id: Math.random().toString(36),
      position: randomPosition(),
      velocity: { x: 0, y: 0 },
      rotation: 0,
      health: 2,
      lastShotTime: Date.now(),
    }
  }

  const saveHighScore = (score: number) => {
    const newScore = {
      score,
      date: new Date().toLocaleDateString(),
    }
    const updatedScores = [...highScores, newScore]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
    setHighScores(updatedScores)
    localStorage.setItem('asteroidHighScores', JSON.stringify(updatedScores))
  }

  const resetGame = () => {
    gameStateRef.current = {
      ship: createInitialShip(),
      bullets: [],
      asteroids: [],
      enemies: [],
      score: 0,
      isGameOver: false,
      isPaused: false,
    }
    lastShotTimeRef.current = 0
    asteroidSpawnTimerRef.current = 0
    asteroidSpawnRateRef.current = INITIAL_ASTEROID_SPAWN_RATE
    gameTimeRef.current = 0
    lastEnemySpawnScoreRef.current = 0
    hasScoreSavedRef.current = false
    setHasGameStarted(false)
    forceUpdate({})
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Enter' && gameStateRef.current.isGameOver) {
        resetGame()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (isMusicEnabled) {
      audioManager.playBackgroundMusic()
    } else {
      audioManager.stopBackgroundMusic()
    }
  }, [isMusicEnabled])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number

    const gameLoop = () => {
      const gameState = gameStateRef.current
      const keys = keysRef.current

      // Check if game should start
      if (!hasGameStarted) {
        const anyMovementKey = keys.KeyW || keys.KeyA || keys.KeyS || keys.KeyD ||
                               keys.ArrowUp || keys.ArrowLeft || keys.ArrowDown || keys.ArrowRight ||
                               keys.Space
        if (anyMovementKey) {
          setHasGameStarted(true)
        } else {
          drawStartScreen(ctx, CANVAS_WIDTH, CANVAS_HEIGHT)
          animationFrameId = requestAnimationFrame(gameLoop)
          return
        }
      }

      const now = Date.now()
      if ((keys.KeyP || keys.Escape) && now - lastPauseKeyPressRef.current > 200) {
        gameState.isPaused = !gameState.isPaused
        lastPauseKeyPressRef.current = now
      }

      if (gameState.isGameOver) {
        if (!hasScoreSavedRef.current && gameState.score > 0) {
          saveHighScore(gameState.score)
          hasScoreSavedRef.current = true
        }
        ctx.fillStyle = '#000'
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
        drawScore(ctx, gameState.score)
        drawGameOver(ctx, gameState.score, CANVAS_WIDTH, CANVAS_HEIGHT)
        animationFrameId = requestAnimationFrame(gameLoop)
        return
      }

      if (gameState.isPaused) {
        ctx.fillStyle = '#000'
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
        drawShip(ctx, gameState.ship)
        gameState.bullets.forEach((bullet) => drawBullet(ctx, bullet))
        gameState.asteroids.forEach((asteroid) => drawAsteroid(ctx, asteroid))
        gameState.enemies.forEach((enemy) => drawEnemy(ctx, enemy))
        drawScore(ctx, gameState.score)
        drawPaused(ctx, CANVAS_WIDTH, CANVAS_HEIGHT)
        animationFrameId = requestAnimationFrame(gameLoop)
        return
      }

      gameTimeRef.current++

      asteroidSpawnRateRef.current = Math.max(
        MIN_ASTEROID_SPAWN_RATE,
        INITIAL_ASTEROID_SPAWN_RATE - Math.floor((gameState.score / SCORE_FOR_MAX_ASTEROIDS) * (INITIAL_ASTEROID_SPAWN_RATE - MIN_ASTEROID_SPAWN_RATE))
      )

      const isRotatingLeft = keys.ArrowLeft || keys.KeyA
      const isRotatingRight = keys.ArrowRight || keys.KeyD
      const isAccelerating = keys.ArrowUp || keys.KeyW

      if (isRotatingLeft) {
        gameState.ship.rotation -= SHIP_ROTATION_SPEED
      }
      if (isRotatingRight) {
        gameState.ship.rotation += SHIP_ROTATION_SPEED
      }

      if (isAccelerating) {
        gameState.ship.velocity.x += Math.cos(gameState.ship.rotation) * SHIP_ACCELERATION
        gameState.ship.velocity.y += Math.sin(gameState.ship.rotation) * SHIP_ACCELERATION

        const speed = Math.sqrt(
          gameState.ship.velocity.x ** 2 + gameState.ship.velocity.y ** 2
        )
        if (speed > SHIP_MAX_SPEED) {
          gameState.ship.velocity.x = (gameState.ship.velocity.x / speed) * SHIP_MAX_SPEED
          gameState.ship.velocity.y = (gameState.ship.velocity.y / speed) * SHIP_MAX_SPEED
        }
      }

      gameState.ship.isAccelerating = isAccelerating

      gameState.ship.velocity.x *= SHIP_FRICTION
      gameState.ship.velocity.y *= SHIP_FRICTION

      gameState.ship.position.x += gameState.ship.velocity.x
      gameState.ship.position.y += gameState.ship.velocity.y
      gameState.ship.position = wrapPosition(gameState.ship.position)

      if (keys.Space) {
        if (now - lastShotTimeRef.current > 250) {
          const bullet: Bullet = {
            id: Math.random().toString(36),
            position: { ...gameState.ship.position },
            velocity: {
              x: Math.cos(gameState.ship.rotation) * BULLET_SPEED + gameState.ship.velocity.x,
              y: Math.sin(gameState.ship.rotation) * BULLET_SPEED + gameState.ship.velocity.y,
            },
            lifetime: BULLET_LIFETIME,
          }
          gameState.bullets.push(bullet)
          lastShotTimeRef.current = now
          audioManager.playShoot()
        }
      }

      gameState.bullets = gameState.bullets.filter((bullet) => {
        bullet.position.x += bullet.velocity.x
        bullet.position.y += bullet.velocity.y
        bullet.position = wrapPosition(bullet.position)
        bullet.lifetime--
        return bullet.lifetime > 0
      })

      const maxAsteroids = Math.min(
        MAX_ASTEROIDS_AT_1000,
        MAX_ASTEROIDS_AT_START +
          Math.floor((gameState.score / SCORE_FOR_MAX_ASTEROIDS) * (MAX_ASTEROIDS_AT_1000 - MAX_ASTEROIDS_AT_START))
      )

      asteroidSpawnTimerRef.current++
      if (asteroidSpawnTimerRef.current >= asteroidSpawnRateRef.current && gameState.asteroids.length < maxAsteroids) {
        gameState.asteroids.push(createAsteroid())
        asteroidSpawnTimerRef.current = 0
      }

      if (gameState.score >= lastEnemySpawnScoreRef.current + ENEMY_SPAWN_INTERVAL) {
        gameState.enemies.push(createEnemy())
        lastEnemySpawnScoreRef.current = Math.floor(gameState.score / ENEMY_SPAWN_INTERVAL) * ENEMY_SPAWN_INTERVAL
      }

      gameState.enemies.forEach((enemy) => {
        const dx = gameState.ship.position.x - enemy.position.x
        const dy = gameState.ship.position.y - enemy.position.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        enemy.rotation = Math.atan2(dy, dx)

        enemy.velocity.x = (dx / distance) * ENEMY_SPEED
        enemy.velocity.y = (dy / distance) * ENEMY_SPEED

        enemy.position.x += enemy.velocity.x
        enemy.position.y += enemy.velocity.y
        enemy.position = wrapPosition(enemy.position)

        if (now - enemy.lastShotTime > ENEMY_SHOOT_INTERVAL) {
          const bulletVelocity = {
            x: (dx / distance) * ENEMY_BULLET_SPEED,
            y: (dy / distance) * ENEMY_BULLET_SPEED,
          }
          gameState.bullets.push({
            id: Math.random().toString(36),
            position: { ...enemy.position },
            velocity: bulletVelocity,
            lifetime: BULLET_LIFETIME,
            isEnemyBullet: true,
          })
          enemy.lastShotTime = now
          audioManager.playShoot()
        }
      })

      gameState.asteroids.forEach((asteroid) => {
        asteroid.position.x += asteroid.velocity.x
        asteroid.position.y += asteroid.velocity.y
        asteroid.position = wrapPosition(asteroid.position)
        asteroid.rotation += asteroid.rotationSpeed
      })

      for (let i = gameState.asteroids.length - 1; i >= 0; i--) {
        const asteroid = gameState.asteroids[i]

        if (checkCollision(gameState.ship.position, SHIP_SIZE, asteroid.position, asteroid.radius)) {
          gameState.isGameOver = true
          audioManager.playGameOver()
          break
        }

        for (let j = gameState.bullets.length - 1; j >= 0; j--) {
          const bullet = gameState.bullets[j]
          if (!bullet.isEnemyBullet && checkCollision(bullet.position, 3, asteroid.position, asteroid.radius)) {
            const destroyedAsteroid = gameState.asteroids.splice(i, 1)[0]
            gameState.bullets.splice(j, 1)
            gameState.score += ASTEROID_SIZES[destroyedAsteroid.size].score
            audioManager.playExplosion()

            const fragments = splitAsteroid(destroyedAsteroid)
            gameState.asteroids.push(...fragments)

            break
          }
        }
      }

      for (let i = gameState.enemies.length - 1; i >= 0; i--) {
        const enemy = gameState.enemies[i]

        if (checkCollision(gameState.ship.position, SHIP_SIZE, enemy.position, ENEMY_SIZE)) {
          gameState.isGameOver = true
          audioManager.playGameOver()
          break
        }

        for (let j = gameState.bullets.length - 1; j >= 0; j--) {
          const bullet = gameState.bullets[j]
          if (!bullet.isEnemyBullet && checkCollision(bullet.position, 3, enemy.position, ENEMY_SIZE)) {
            enemy.health--
            gameState.bullets.splice(j, 1)
            audioManager.playExplosion()

            if (enemy.health <= 0) {
              gameState.enemies.splice(i, 1)
              gameState.score += ENEMY_SCORE
            }
            break
          }
        }
      }

      for (let i = gameState.bullets.length - 1; i >= 0; i--) {
        const bullet = gameState.bullets[i]
        if (bullet.isEnemyBullet && checkCollision(bullet.position, 3, gameState.ship.position, SHIP_SIZE)) {
          gameState.isGameOver = true
          audioManager.playGameOver()
          break
        }
      }

      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      drawShip(ctx, gameState.ship)
      gameState.bullets.forEach((bullet) => drawBullet(ctx, bullet))
      gameState.asteroids.forEach((asteroid) => drawAsteroid(ctx, asteroid))
      gameState.enemies.forEach((enemy) => drawEnemy(ctx, enemy))
      drawScore(ctx, gameState.score)

      animationFrameId = requestAnimationFrame(gameLoop)
    }

    gameLoop()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [hasGameStarted])

  const toggleMusic = () => {
    setIsMusicEnabled(!isMusicEnabled)
  }

  const handlePause = () => {
    gameStateRef.current.isPaused = !gameStateRef.current.isPaused
  }

  return (
    <div className={styles.arcadeCabinet}>
      <div className={styles.gameContainer}>
        <div className={styles.marquee}>
          <h1 className={styles.title}>ASTEROIDS</h1>
        </div>

        <div className={styles.screenBezel}>
          <div className={styles.screen}>
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
            />
          </div>
        </div>

        <div className={styles.controlPanel}>
          <div className={styles.buttonGroup}>
            <button
              className={`${styles.button} ${!isMusicEnabled ? styles.off : ''} ${styles.musicButton}`}
              onClick={toggleMusic}
              title={isMusicEnabled ? 'Music ON' : 'Music OFF'}
            >
              {isMusicEnabled ? '♪' : '♪̸'}
            </button>
            <div className={styles.buttonLabel}>Music</div>
          </div>

          <div className={styles.buttonGroup}>
            <button
              className={styles.button}
              onClick={handlePause}
              title="Pause/Resume"
            >
              ⏸
            </button>
            <div className={styles.buttonLabel}>Pause</div>
          </div>

          <div className={styles.buttonGroup}>
            <button
              className={`${styles.button} ${styles.scoreboardButton}`}
              onClick={() => setIsScoreboardOpen(true)}
              title="High Scores"
            >
              🏆
            </button>
            <div className={styles.buttonLabel}>Scores</div>
          </div>

          <div className={styles.buttonGroup}>
            <button
              className={`${styles.button} ${styles.rulesButton}`}
              onClick={() => setIsRulesOpen(true)}
              title="Game Rules"
            >
              ?
            </button>
            <div className={styles.buttonLabel}>Rules</div>
          </div>
        </div>
      </div>

      <Modal isOpen={isScoreboardOpen} onClose={() => setIsScoreboardOpen(false)} title="HIGH SCORES">
        <Scoreboard scores={highScores} />
      </Modal>

      <Modal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} title="HOW TO PLAY">
        <Rules />
      </Modal>
    </div>
  )
}

export default Game
