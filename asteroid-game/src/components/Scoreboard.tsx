import styles from './Modal.module.css'

interface ScoreEntry {
  score: number
  date: string
}

interface ScoreboardProps {
  scores: ScoreEntry[]
}

function Scoreboard({ scores }: ScoreboardProps) {
  if (scores.length === 0) {
    return <div className={styles.noScores}>No high scores yet. Play to set a record!</div>
  }

  return (
    <ul className={styles.scoreList}>
      {scores.map((entry, index) => (
        <li key={index} className={styles.scoreItem}>
          <span className={styles.rank}>#{index + 1}</span>
          <span className={styles.score}>{entry.score}</span>
          <span className={styles.date}>{entry.date}</span>
        </li>
      ))}
    </ul>
  )
}

export default Scoreboard
