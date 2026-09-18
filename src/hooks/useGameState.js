import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { selectDailyPool, seedFromString, mulberry32, isValidCompound } from '../data/wordBank';
import { getTier, formatElapsed } from '../utils/scoring';
import { computeRefill, rescueStranded } from '../utils/refill';

const STORAGE_KEY = 'tandem-game-state';
const EPOCH = '2026-09-15';
const GRID_SIZE = 16; // 4x4 = 8 live pairs at once
const GAME_SECONDS = 60;
// Every match adds time, so a run is no longer capped at 60s — a skilled
// player could plausibly run the day's whole pool dry. Bumped from 40 to
// comfortably under the bank's measured per-day ceiling (~138-147 pairs,
// limited by word reuse across pairs, not pair count) — see
// GAME_DESIGN.md "Time bonus" for the measurement.
const POOL_SIZE = 130;
const TIME_BONUS_SECONDS = 15;

function getTodayKey() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
}

function shuffle(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// Deterministic starting board: same pool + same layout for every player on
// a given date. Refills later in the session (which exact freed slot gets
// the "first" vs "second" word) are cosmetic-only and use plain Math.random
// — see the click handler below — since they don't affect which pairs
// exist or in what order, only which pixel they land on.
function buildInitialBoard(pool, dateKey) {
  const rng = mulberry32(seedFromString(`${dateKey}:layout`));
  const slots = Array.from({ length: GRID_SIZE }, (_, i) => i);
  shuffle(slots, rng);

  const board = new Array(GRID_SIZE).fill(null);
  const pairsToPlace = Math.min(GRID_SIZE / 2, pool.length);
  for (let i = 0; i < pairsToPlace; i++) {
    const pair = pool[i];
    const pairId = i;
    const slotA = slots[i * 2];
    const slotB = slots[i * 2 + 1];
    const firstGetsA = rng() < 0.5;
    board[firstGetsA ? slotA : slotB] = { word: pair[0], pairId, role: 'first' };
    board[firstGetsA ? slotB : slotA] = { word: pair[1], pairId, role: 'second' };
  }
  return { board, poolIndex: pairsToPlace };
}

function loadState(dateKey, fingerprint) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (saved.dateKey !== dateKey) return null;
    if (saved.fingerprint !== fingerprint) return null;
    return saved;
  } catch { return null; }
}

function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

export function useGameState() {
  const dateKey = getTodayKey();
  const puzzleNumber = Math.floor((new Date(dateKey) - new Date(EPOCH)) / 86400000) + 1;

  const pool = useMemo(() => selectDailyPool(dateKey, POOL_SIZE), [dateKey]);
  // Content fingerprint so a stale save from a wordBank edit (new pairs
  // added, old ones removed) after someone may have already played today
  // never silently carries over — same lesson Mirror learned the hard way.
  const fingerprint = useMemo(() => String(seedFromString(JSON.stringify(pool))), [pool]);

  const [game, setGame] = useState(null); // { board, poolIndex, score, selectedIndex, wrongFlash, flashToken, correctFlash, correctToken, timeBonusToken }
  const [gameStatus, setGameStatus] = useState('ready'); // ready | playing | ended
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  // Counts UP in parallel with timeLeft counting down, so the share text
  // and result screen can report how long a run actually took — no longer
  // a fixed "60s" now that matches extend the clock.
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [initialized, setInitialized] = useState(false);

  const timerRef = useRef(null);
  // Tracks the last timeBonusToken we've already applied a bonus for, so
  // the effect below (which fires whenever a match bumps that token) never
  // double-applies on a re-render. Previously this was done by writing a
  // ref inside setGame's functional updater and reading it synchronously
  // right after calling setGame, relying on React running that updater
  // eagerly. That only actually happens on some renders (an internal
  // optimization, not a guarantee): confirmed live that the very first
  // match of a run got its +15s but every match after that silently
  // didn't. Watching the real committed state via an effect instead is
  // dependable regardless of React's internal scheduling.
  const appliedTimeBonusToken = useRef(0);

  // Init — restore today's in-progress or finished attempt if one exists,
  // otherwise deal a fresh board. One attempt per day once it ends (see
  // GAME_DESIGN.md "Built" section): an 'ended' save just restores the
  // frozen result screen, it never re-deals the grid.
  useEffect(() => {
    const saved = loadState(dateKey, fingerprint);
    if (saved) {
      setGame({
        board: saved.board,
        poolIndex: saved.poolIndex,
        score: saved.score,
        selectedIndex: null,
        wrongFlash: [],
        flashToken: 0,
        correctFlash: [],
        correctToken: 0,
        orphanQueue: saved.orphanQueue || [],
        timeBonusToken: 0,
        boardCleared: saved.boardCleared || false,
      });
      setGameStatus(saved.gameStatus || 'ready');
      setTimeLeft(saved.timeLeft ?? GAME_SECONDS);
      setElapsedSeconds(saved.elapsedSeconds ?? 0);
    } else {
      const { board, poolIndex } = buildInitialBoard(pool, dateKey);
      setGame({
        board, poolIndex, score: 0, selectedIndex: null,
        wrongFlash: [], flashToken: 0, correctFlash: [], correctToken: 0,
        orphanQueue: [], timeBonusToken: 0, boardCleared: false,
      });
      setGameStatus('ready');
      setTimeLeft(GAME_SECONDS);
      setElapsedSeconds(0);
    }
    setInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateKey, fingerprint]);

  // Countdown timer — runs only once 'playing' (first tap), not on load.
  useEffect(() => {
    if (gameStatus !== 'playing') { clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setGameStatus('ended');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [gameStatus]);

  // Clear a wrong-pair flash a moment after it's set.
  useEffect(() => {
    if (!game || game.wrongFlash.length === 0) return;
    const t = setTimeout(() => {
      setGame((prev) => (prev && prev.wrongFlash.length ? { ...prev, wrongFlash: [] } : prev));
    }, 400);
    return () => clearTimeout(t);
  }, [game && game.flashToken]); // eslint-disable-line react-hooks/exhaustive-deps

  // Clear a correct-match glow a moment after it's set. The board swap
  // itself already happened synchronously in handleCellClick — this only
  // clears the CSS animation flag, so there's no window where a refresh
  // could see a matched pair still sitting there, clickable, unswapped.
  useEffect(() => {
    if (!game || game.correctFlash.length === 0) return;
    const t = setTimeout(() => {
      setGame((prev) => (prev && prev.correctFlash.length ? { ...prev, correctFlash: [] } : prev));
    }, 420);
    return () => clearTimeout(t);
  }, [game && game.correctToken]); // eslint-disable-line react-hooks/exhaustive-deps

  // Apply the +15s time bonus (and any board-cleared early end) exactly
  // once per match, driven by the real committed timeBonusToken rather
  // than a same-tick ref read. See appliedTimeBonusToken's comment above.
  useEffect(() => {
    if (!game) return;
    if (game.timeBonusToken > appliedTimeBonusToken.current) {
      appliedTimeBonusToken.current = game.timeBonusToken;
      setTimeLeft((t) => t + TIME_BONUS_SECONDS);
      if (game.boardCleared) setGameStatus('ended');
    }
  }, [game && game.timeBonusToken]); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist every relevant change.
  useEffect(() => {
    if (!initialized || !game) return;
    saveState({
      dateKey,
      fingerprint,
      board: game.board,
      poolIndex: game.poolIndex,
      orphanQueue: game.orphanQueue,
      score: game.score,
      gameStatus,
      timeLeft,
      elapsedSeconds,
      boardCleared: game.boardCleared,
    });
  }, [initialized, game, gameStatus, timeLeft, elapsedSeconds, dateKey, fingerprint]);

  const handleCellClick = useCallback((index) => {
    if (gameStatus === 'ended') return;
    setGame((prev) => {
      if (!prev) return prev;
      const cell = prev.board[index];
      if (!cell) return prev; // empty slot (pool exhausted), ignore

      if (prev.selectedIndex === null) {
        return { ...prev, selectedIndex: index };
      }
      if (prev.selectedIndex === index) {
        return { ...prev, selectedIndex: null }; // tap same tile again = cancel
      }

      const firstCell = prev.board[prev.selectedIndex];
      // Any real compound counts now, not just the exact pair a tile was
      // originally dealt as. See isValidCompound in wordBank.js for why:
      // strict pairId matching rejected true compounds like BACKFIRE
      // whenever BACK and FIRE landed as halves of two different pairs.
      const isMatch = isValidCompound(firstCell.word, cell.word);

      if (isMatch) {
        const freedSlots = [prev.selectedIndex, index];
        const refilled = computeRefill({
          board: prev.board,
          freedSlots,
          poolIndex: prev.poolIndex,
          orphanQueue: prev.orphanQueue,
          pool,
        });
        // A cross-pair match (firstCell and cell weren't each other's own
        // dealt partner) can leave each one's real designated partner
        // stranded elsewhere on the board. Rescue it if it's now
        // unmatchable rather than let it sit dead. See rescueStranded's
        // comment in refill.js.
        const { board: nextBoard, poolIndex: nextPoolIndex, orphanQueue } = rescueStranded({
          board: refilled.board,
          freedSlots,
          matchedPairIds: [firstCell.pairId, cell.pairId],
          poolIndex: refilled.poolIndex,
          orphanQueue: refilled.orphanQueue,
          pool,
          isValidCompound,
        });
        // Only reachable once the pool is fully drawn AND nothing's left
        // waiting to complete — every pair in today's set has been found.
        // See "Time bonus" in GAME_DESIGN.md: this was near-impossible in
        // a hard 60s cap, but a real outcome now that matches extend time.
        const boardCleared = nextBoard.every((c) => c === null);

        return {
          board: nextBoard,
          poolIndex: nextPoolIndex,
          orphanQueue,
          score: prev.score + 1,
          selectedIndex: null,
          wrongFlash: [],
          flashToken: prev.flashToken,
          correctFlash: freedSlots,
          correctToken: prev.correctToken + 1,
          timeBonusToken: prev.timeBonusToken + 1,
          boardCleared,
        };
      }

      return {
        ...prev,
        selectedIndex: null,
        wrongFlash: [prev.selectedIndex, index],
        flashToken: prev.flashToken + 1,
      };
    });

    setGameStatus((s) => (s === 'ready' ? 'playing' : s));
  }, [gameStatus, pool]);

  const generateShareText = useCallback(() => {
    if (!game || gameStatus !== 'ended') return '';
    const tier = getTier(game.score);
    const pairWord = game.score === 1 ? 'pair' : 'pairs';
    // Actual time played, not a fixed "60s" — matches extend the clock now,
    // so a real run's length varies. See "Time bonus" in GAME_DESIGN.md.
    const lines = [`Tandem #${puzzleNumber} 🤝`, `${game.score} ${pairWord} in ${formatElapsed(elapsedSeconds)}`];
    // No placeholder line at all for a 0-star run — a dash there reads as
    // an error, not "no stars yet." Two lines is a perfectly normal share.
    if (tier > 0) lines.push('⭐'.repeat(tier));
    return lines.join('\n');
  }, [game, gameStatus, puzzleNumber, elapsedSeconds]);

  return {
    dateKey,
    puzzleNumber,
    initialized,
    board: game?.board ?? new Array(GRID_SIZE).fill(null),
    selectedIndex: game?.selectedIndex ?? null,
    wrongFlash: game?.wrongFlash ?? [],
    correctFlash: game?.correctFlash ?? [],
    score: game?.score ?? 0,
    gameStatus,
    timeLeft,
    elapsedSeconds,
    timeBonusToken: game?.timeBonusToken ?? 0,
    boardCleared: game?.boardCleared ?? false,
    handleCellClick,
    generateShareText,
  };
}
