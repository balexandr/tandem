// Tandem's own definition of what counts as winning: pairs matched
// before time runs out, higher is better (matches the 'desc'
// sort_direction seeded for 'tandem' in leaderboard_games). Unlike
// every other game in the suite this one has no win/lose state
// (gameStatus is ready/playing/ended) — any ended run with a score is
// leaderboard-eligible, not just a "won" one, since there's no pass/
// fail bar to clear in the first place. Pair counts repeat often, so
// solve time breaks ties ('asc', faster wins — differentiates a board
// cleared early from one that ran the full clock at the same score).
export function toLeaderboardScore(score, elapsedSeconds) {
  const scoreLabel = `${score} pair${score === 1 ? '' : 's'}`
  if (elapsedSeconds == null) return { score, tiebreak: null, scoreDisplay: scoreLabel }
  const mm = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0')
  const ss = String(elapsedSeconds % 60).padStart(2, '0')
  return { score, tiebreak: elapsedSeconds, scoreDisplay: `${scoreLabel} · ${mm}:${ss}` }
}
