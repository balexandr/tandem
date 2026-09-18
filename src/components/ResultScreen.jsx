import { useState, useEffect } from 'react';
import { getTier, formatElapsed } from '../utils/scoring';
import styles from './ResultScreen.module.css';

function getTimeToMidnight() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const diff = tomorrow - now;
  return {
    hours: Math.floor(diff / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

function pad(n) { return String(n).padStart(2, '0'); }

// Tiers reuse getTier's cold-guess thresholds — see GAME_DESIGN.md.
function getRating(tier) {
  if (tier === 3) return { emoji: '🏆', label: 'Perfect Sync' };
  if (tier === 2) return { emoji: '🔥', label: 'In Sync' };
  if (tier === 1) return { emoji: '👍', label: 'Getting There' };
  return { emoji: '🙂', label: 'Warming Up' };
}

export default function ResultScreen({ puzzleNumber, score, elapsedSeconds, boardCleared, generateShareText, stats, onDismiss }) {
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(getTimeToMidnight());
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 120);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setCountdown(getTimeToMidnight()), 1000);
    return () => clearInterval(interval);
  }, []);

  const tier = getTier(score);
  const rating = getRating(tier);
  const shareText = generateShareText();

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ text: shareText }); return; } catch {}
    }
    try { await navigator.clipboard.writeText(shareText); }
    catch {
      const ta = document.createElement('textarea');
      ta.value = shareText;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className={`${styles.overlay} ${showContent ? styles.visible : ''}`}>
      <div className={styles.modal}>
        <div className={styles.sparkContainer} aria-hidden="true">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className={styles.spark} style={{
              left: `${8 + i * (84 / 11)}%`,
              top: `${Math.random() * 100}%`,
              background: i % 2 === 0 ? '#84cc16' : '#a3e635',
              boxShadow: '0 0 4px #84cc16, 0 0 8px #84cc1688',
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1.5 + Math.random() * 2}s`,
            }} />
          ))}
        </div>

        <div className={styles.resultHeader}>
          <button className={styles.dismissBtn} onClick={onDismiss} aria-label="Close">✕</button>
          <span className={styles.ratingEmoji}>{boardCleared ? '🏅' : rating.emoji}</span>
          <h2 className={styles.title}>{boardCleared ? 'Board Cleared!' : `${rating.label}!`}</h2>
          <p className={styles.subtitle}>
            {boardCleared
              ? `Tandem #${puzzleNumber}, found every pair today`
              : `Tandem #${puzzleNumber}`}
          </p>
        </div>

        <div className={styles.metricsRow}>
          <div className={styles.metric}>
            <span className={styles.metricValue}>{score}</span>
            <span className={styles.metricLabel}>Pairs</span>
          </div>
          <div className={styles.metricDivider} />
          <div className={styles.metric}>
            <span className={styles.metricValue}>{formatElapsed(elapsedSeconds)}</span>
            <span className={styles.metricLabel}>Time</span>
          </div>
          <div className={styles.metricDivider} />
          <div className={styles.metric}>
            <span className={styles.metricValue}>{tier > 0 ? '⭐'.repeat(tier) : '0'}</span>
            <span className={styles.metricLabel}>Rating</span>
          </div>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{stats.gamesPlayed}</span>
            <span className={styles.statLabel}>Played</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{stats.bestScore ?? score}</span>
            <span className={styles.statLabel}>Best</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{stats.currentStreak}</span>
            <span className={styles.statLabel}>Streak</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{stats.maxStreak}</span>
            <span className={styles.statLabel}>Best streak</span>
          </div>
        </div>

        <div className={styles.sharePreview}>
          <p className={styles.sharePreviewLabel}>Share text</p>
          <div className={styles.sharePreviewBox}>
            {shareText.split('\n').map((line, i) => (
              <span key={i} className={styles.sharePreviewLine}>{line}</span>
            ))}
          </div>
        </div>

        <button
          className={`${styles.shareButton} ${copied ? styles.copied : ''}`}
          onClick={handleShare}
        >
          {copied ? '✓ Copied to clipboard' : '⬆ Share your result'}
        </button>

        <div className={styles.countdown}>
          <span className={styles.countdownLabel}>Next puzzle in</span>
          <span className={styles.countdownTime}>
            {pad(countdown.hours)}:{pad(countdown.minutes)}:{pad(countdown.seconds)}
          </span>
        </div>
      </div>
    </div>
  );
}
