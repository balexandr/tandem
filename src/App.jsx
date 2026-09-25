import { useState, useEffect } from 'react';
import { useGameState } from './hooks/useGameState';
import { useStats } from './hooks/useStats';
import TandemGrid from './components/TandemGrid';
import ResultScreen from './components/ResultScreen';
import HowToPlay from './components/HowToPlay';
import StatsScreen from './components/StatsScreen';
import styles from './App.module.css';
import { GameLogo } from './components/GameLogo';
import { NoodleLogoIcon } from './components/NoodleLogo';
import { recordTodayShare, getCompletedTodayCount, buildShareAllText, TOTAL_GAMES } from './utils/shareAll';

const HOW_TO_PLAY_KEY = 'tandem-how-to-play-seen';

export default function App() {
  const {
    dateKey,
    puzzleNumber,
    initialized,
    board,
    selectedIndex,
    wrongFlash,
    correctFlash,
    score,
    gameStatus,
    timeLeft,
    timeBonusToken,
    elapsedSeconds,
    boardCleared,
    handleCellClick,
    handleShuffle,
    missedIndices,
    generateShareText,
  } = useGameState();

  const { stats, recordGame } = useStats();

  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [resultDismissed, setResultDismissed] = useState(false);
  // Hold the result modal back a beat when time runs out so the player sees
  // the frozen board with missed pairs highlighted first — the "duh" moment
  // only lands if they actually see it before being whisked to the share
  // screen. Same pattern as Dial's win-reveal delay.
  const [revealResult, setRevealResult] = useState(false);
  useEffect(() => {
    if (gameStatus !== 'ended') { setRevealResult(false); return; }
    const t = setTimeout(() => setRevealResult(true), 1600);
    return () => clearTimeout(t);
  }, [gameStatus]);
  const [shareAllCount, setShareAllCount] = useState(0);
  const [shareAllCopied, setShareAllCopied] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    try {
      if (!localStorage.getItem(HOW_TO_PLAY_KEY)) setShowHowToPlay(true);
    } catch {}
  }, []);

  const dismissHowToPlay = () => {
    setShowHowToPlay(false);
    try { localStorage.setItem(HOW_TO_PLAY_KEY, '1'); } catch {}
  };

  useEffect(() => {
    if (gameStatus === 'ended') {
      recordGame(dateKey, score);
      recordTodayShare('tandem', dateKey, generateShareText());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStatus]);

  useEffect(() => {
    setShareAllCount(getCompletedTodayCount(dateKey));
  }, [gameStatus, dateKey]);

  const handleShareAll = async () => {
    const text = buildShareAllText(dateKey);
    if (!text) return;
    if (navigator.share) {
      try { await navigator.share({ text }); return; } catch {}
    }
    try { await navigator.clipboard.writeText(text); }
    catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setShareAllCopied(true);
    setTimeout(() => setShareAllCopied(false), 2500);
  };

  const footer = (
    <footer className={styles.footer}>
      <a href="https://noodlegames.co" target="_blank" rel="noopener noreferrer" className={styles.footerLogo}>
        <NoodleLogoIcon size={18} /> NoodleGames
      </a>
      {shareAllCount > 0 && (
        <button
          className={`${styles.footerShareAll} ${shareAllCopied ? styles.copied : ''}`}
          onClick={handleShareAll}
        >
          {shareAllCopied ? '✓ Copied' : `⬆ Share all completed (${shareAllCount}/${TOTAL_GAMES})`}
        </button>
      )}
      <a href="https://noodlegames.co/privacy" target="_blank" rel="noopener noreferrer" className={styles.footerPrivacy}>Privacy Policy</a>
      <span className={styles.footerCopy}>© {currentYear} NoodleGames.co</span>
    </footer>
  );

  const Logo = () => (
    <h1 className={styles.logo}>
      <GameLogo />
      <span className={styles.logoText}>Tandem</span>
    </h1>
  );

  if (!initialized) return null;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Logo />
          {puzzleNumber > 0 && <span className={styles.puzzleNumber}>#{puzzleNumber}</span>}
        </div>
        <div className={styles.headerRight}>
          <button className={styles.iconButton} onClick={() => setShowStats(true)} aria-label="Statistics">
            <svg className={styles.statsIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M4 20H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <rect x="6" y="11" width="2.8" height="7" rx="1" fill="currentColor" />
              <rect x="10.6" y="7" width="2.8" height="11" rx="1" fill="currentColor" opacity="0.9" />
              <rect x="15.2" y="4" width="2.8" height="14" rx="1" fill="currentColor" opacity="0.8" />
            </svg>
          </button>
          <button className={styles.iconButton} onClick={() => setShowHowToPlay(true)} aria-label="How to play">?</button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.statusBar}>
          <div className={styles.timerBlock}>
            <span className={styles.timerLabel}>Time</span>
            <span className={`${styles.timerValue} ${timeLeft <= 10 && gameStatus === 'playing' ? styles.timerLow : ''}`}>
              {timeLeft}
            </span>
            {/* key={timeBonusToken} remounts on every match (and only
                then, unlike timeLeft which changes every second too),
                replaying a float-and-fade CSS animation for free. */}
            {timeBonusToken > 0 && (
              <span key={timeBonusToken} className={styles.timeBonus}>+15s</span>
            )}
          </div>
          <div className={styles.scoreBlock}>
            <span className={styles.scoreLabel}>Pairs</span>
            {/* key={score} remounts the span on every match, replaying the
                CSS pop animation for free — no extra state needed. */}
            <span key={score} className={styles.scoreValue}>{score}</span>
          </div>
          <button
            type="button"
            className={styles.shuffleButton}
            onClick={handleShuffle}
            disabled={gameStatus === 'ended'}
            aria-label="Shuffle board"
          >
            <svg className={styles.shuffleIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M17 3h4v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 3l-6.5 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 21l5.5-5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M17 21h4v-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 21l-5.5-5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 3l4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Shuffle
          </button>
        </div>

        <TandemGrid
          board={board}
          selectedIndex={selectedIndex}
          wrongFlash={wrongFlash}
          correctFlash={correctFlash}
          missedIndices={gameStatus === 'ended' ? missedIndices : []}
          onCellClick={handleCellClick}
          locked={gameStatus === 'ended'}
        />

        {gameStatus === 'ready' && (
          <p className={styles.hint}>
            Tap two words that pair up, in order. The clock starts on your first tap, and every match adds 15 seconds
          </p>
        )}
        {gameStatus === 'playing' && (
          <p className={styles.hint}>
            Wrong guesses are free, no penalty. Just keep going
          </p>
        )}
        {gameStatus === 'ended' && missedIndices.length > 0 && (
          <p className={styles.hint}>
            Time's up! The glowing tiles were pairs waiting to be found
          </p>
        )}
      </main>

      {gameStatus === 'ended' && revealResult && !resultDismissed && (
        <ResultScreen
          puzzleNumber={puzzleNumber}
          score={score}
          elapsedSeconds={elapsedSeconds}
          boardCleared={boardCleared}
          generateShareText={generateShareText}
          stats={stats}
          onDismiss={() => setResultDismissed(true)}
        />
      )}

      {showHowToPlay && <HowToPlay onClose={dismissHowToPlay} />}
      {showStats && <StatsScreen stats={stats} onClose={() => setShowStats(false)} />}

      {footer}
    </div>
  );
}
