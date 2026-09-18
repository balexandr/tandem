import styles from './HowToPlay.module.css';

export default function HowToPlay({ onClose }) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>How to Play</h2>
        <p className={styles.intro}>
          Click two words that pair up, in the right order, before the
          60 second clock runs out.
        </p>

        <div className={styles.steps}>
          <div className={styles.step}>
            <span className={styles.stepIcon}>👆</span>
            <div>
              <p className={styles.stepTitle}>Tap the first word, then the second</p>
              <p className={styles.stepDesc}>PENCIL, then CASE. Order matters, same as the words in a real compound word.</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepIcon}>✅</span>
            <div>
              <p className={styles.stepTitle}>Right pair? It clears</p>
              <p className={styles.stepDesc}>Both tiles vanish and two brand new words take their place instantly.</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepIcon}>❌</span>
            <div>
              <p className={styles.stepTitle}>Wrong guess costs nothing</p>
              <p className={styles.stepDesc}>Just a red flash. The clock keeps running, nothing else changes. Guess freely.</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepIcon}>⏱️</span>
            <div>
              <p className={styles.stepTitle}>60 seconds to start, +15s per match</p>
              <p className={styles.stepDesc}>Every pair you find adds time, so a good streak keeps the clock alive. One attempt a day, same word set for everyone today.</p>
            </div>
          </div>
        </div>

        <div className={styles.example}>
          <p className={styles.exampleLabel}>Example</p>
          <div className={styles.exampleRow}>
            <span className={styles.exTile}>PENCIL</span>
            <span className={styles.exArrow}>→</span>
            <span className={styles.exTile}>CASE</span>
            <span className={styles.exCheck}>✅</span>
          </div>
          <p className={styles.exampleCaption}>Tap PENCIL first, then CASE, to clear the pair.</p>
        </div>

        <button className={styles.playButton} onClick={onClose}>
          Start playing
        </button>
      </div>
    </div>
  );
}
