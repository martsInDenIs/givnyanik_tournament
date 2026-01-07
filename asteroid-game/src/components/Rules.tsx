import styles from './Modal.module.css'

function Rules() {
  return (
    <div>
      <div className={styles.rulesSection}>
        <h3>How to Play</h3>
        <p>
          <span className={styles.highlight}>WASD</span> or{' '}
          <span className={styles.highlight}>Arrow Keys</span>: Control your spaceship
        </p>
        <p>
          <span className={styles.highlight}>W/Up</span>: Accelerate forward
        </p>
        <p>
          <span className={styles.highlight}>A/Left</span>: Rotate left
        </p>
        <p>
          <span className={styles.highlight}>D/Right</span>: Rotate right
        </p>
        <p>
          <span className={styles.highlight}>Space</span>: Shoot bullets
        </p>
        <p>
          <span className={styles.highlight}>P or ESC</span>: Pause/Resume game
        </p>
        <p>
          <span className={styles.highlight}>Enter</span>: Restart game (when game over)
        </p>
      </div>

      <div className={styles.rulesSection}>
        <h3>Scoring</h3>
        <ul>
          <li>Large asteroids: +10 points</li>
          <li>Medium asteroids: +20 points</li>
          <li>Small asteroids: +30 points</li>
          <li>Enemy spaceships: +100 points</li>
        </ul>
      </div>

      <div className={styles.rulesSection}>
        <h3>Game Mechanics</h3>
        <ul>
          <li>Asteroids split into smaller pieces when destroyed</li>
          <li>Difficulty increases with your score (more asteroids spawn)</li>
          <li>Enemy spaceships appear every 300 points</li>
          <li>Enemies chase you and shoot at your position</li>
          <li>Enemies have 2 health points and change color when damaged</li>
          <li>Avoid collisions with asteroids and enemy ships to survive!</li>
        </ul>
      </div>
    </div>
  )
}

export default Rules
