import { useState, useCallback } from 'react';
import { getTier } from '../utils/scoring';

const STATS_KEY = 'tandem-stats';

function getDefaultStats() {
  return {
    gamesPlayed: 0,
    currentStreak: 0,
    maxStreak: 0,
    bestScore: null,
    totalScore: 0,
    lastCompletedDate: null,
    distribution: [0, 0, 0, 0], // indexed by star tier 0-3
  };
}

function loadStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return getDefaultStats();
    return { ...getDefaultStats(), ...JSON.parse(raw) };
  } catch { return getDefaultStats(); }
}

function saveStats(stats) {
  try { localStorage.setItem(STATS_KEY, JSON.stringify(stats)); } catch {}
}

function isConsecutiveDay(dateA, dateB) {
  if (!dateA || !dateB) return false;
  const diff = Math.abs(new Date(dateB) - new Date(dateA));
  return diff >= 86400000 && diff < 172800000;
}

export function useStats() {
  const [stats, setStats] = useState(loadStats);

  const recordGame = useCallback((dateKey, score) => {
    setStats((prev) => {
      if (prev.lastCompletedDate === dateKey) return prev;
      const next = { ...prev, distribution: [...prev.distribution] };
      next.gamesPlayed += 1;
      next.totalScore += score;
      next.lastCompletedDate = dateKey;
      if (next.bestScore === null || score > next.bestScore) {
        next.bestScore = score;
      }
      if (isConsecutiveDay(prev.lastCompletedDate, dateKey) || prev.gamesPlayed === 0) {
        next.currentStreak = prev.currentStreak + 1;
      } else {
        next.currentStreak = 1;
      }
      next.maxStreak = Math.max(next.maxStreak, next.currentStreak);
      next.distribution[getTier(score)] += 1;
      saveStats(next);
      return next;
    });
  }, []);

  return { stats, recordGame };
}
