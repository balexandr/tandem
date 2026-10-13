// Tandem's own definition of what counts as winning: pairs matched
// before time runs out, higher is better (matches the 'desc'
// sort_direction seeded for 'tandem' in leaderboard_games). Unlike
// every other game in the suite this one has no win/lose state
// (gameStatus is ready/playing/ended) — any ended run with a score is
// leaderboard-eligible, not just a "won" one, since there's no pass/
// fail bar to clear in the first place.
export function toLeaderboardScore(score) {
  return { score, tiebreak: null, scoreDisplay: `${score} pair${score === 1 ? '' : 's'}` }
}
