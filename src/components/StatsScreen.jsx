import { starsText } from '../utils/scoring';
import styles from './StatsScreen.module.css';

export default function StatsScreen({ stats, onClose }) {
  const avgScore = stats.gamesPlayed > 0 ? (stats.totalScore / stats.gamesPlayed).toFixed(1) : '--';
  const maxCount = Math.max(1, ...stats.distribution);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Statistics</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{stats.gamesPlayed}</span>
            <span className={styles.statLabel}>Played</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{stats.currentStreak}</span>
            <span className={styles.statLabel}>Streak</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{stats.maxStreak}</span>
            <span className={styles.statLabel}>Best streak</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{stats.bestScore ?? 0}</span>
            <span className={styles.statLabel}>Best score</span>
          </div>
        </div>

        <div className={styles.timeStats}>
          <div className={styles.timeItem}>
            <span className={styles.timeLabel}>Avg score</span>
            <span className={styles.timeValue}>{avgScore}</span>
          </div>
        </div>

        <div className={styles.distribution}>
          <p className={styles.distLabel}>Star distribution</p>
          {[3, 2, 1, 0].map((tier) => {
            const count = stats.distribution[tier] ?? 0;
            const pct = count > 0 ? Math.max(Math.round((count / maxCount) * 100), 6) : 0;
            return (
              <div key={tier} className={styles.distRow}>
                <span className={styles.distTierLabel}>{tier > 0 ? starsText(tier) : '0'}</span>
                <div className={styles.distBarTrack}>
                  <div className={styles.distBar} style={{ width: `${pct}%` }} />
                </div>
                <span className={styles.distCount}>{count}</span>
              </div>
            );
          })}
        </div>

        <button className={styles.doneButton} onClick={onClose}>Done</button>
      </div>
    </div>
  );
}
