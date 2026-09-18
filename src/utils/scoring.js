// Star thresholds are a cold guess, same as every par/threshold number the
// rest of the suite has shipped with (see GAME_DESIGN.md "Scoring / stars").
// Expect to retune once real scores come in, don't treat these as final.
const TIERS = [
  { min: 12, stars: 3 },
  { min: 8, stars: 2 },
  { min: 4, stars: 1 },
  { min: 0, stars: 0 },
];

export function getTier(score) {
  const found = TIERS.find((t) => score >= t.min);
  return found ? found.stars : 0;
}

export function starsText(stars) {
  return stars > 0 ? '⭐'.repeat(stars) : '0';
}

// Shared by the result screen and the share text so a 3-minute run reads
// as "3:07" in both places, not "187s" in one and "3:07" in the other.
export function formatElapsed(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`;
}
