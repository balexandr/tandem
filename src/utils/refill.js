// Refill logic for Tandem's board after a match, extracted as a pure
// function (no React, no localStorage) specifically so it can be fuzz-
// tested directly rather than only eyeballed through a browser — see
// GAME_DESIGN.md "Refill mix" for why this needed a real invariant check.
//
// The goal: after a match frees two cells, mix "good data" (a word whose
// partner is already visible elsewhere on the board, or will be shortly)
// with "bad data" (a fresh distractor whose partner hasn't been dealt
// yet) — rather than always dropping a whole matched pair into the two
// slots you just cleared, which needs no searching at all once you've
// learned the mechanic once.
//
// Hard invariant this function must never violate: after every refill,
// at least one complete pair (both halves present) exists SOMEWHERE on
// the board. Breaking that would soft-lock a player for the rest of the
// 60s with nothing clickable that can succeed.

// Tuned by simulation, not guessed — see GAME_DESIGN.md "How many answers
// should be on the board" for the full data. Measured at a realistic ~14-
// match pace (what a real 60s run reaches), the old values (4 / 0.45)
// averaged 6.93 of the 8 possible pairs complete at any moment — over 75%
// of the board was "real," which is why mixing barely registered as
// harder. These land at an average of 3.43, never dropping below 2 across
// 28,000 simulated samples (MAX_ORPHANS=14 gets closer to an average of 3
// but spends ~40% of the game at the bare floor of 1, which read as unfair
// rather than hard).
export const MAX_ORPHANS = 12;
export const ORPHAN_COMPLETE_CHANCE = 0.1;

export function computeRefill({ board, freedSlots, poolIndex, orphanQueue, pool, random = Math.random }) {
  const nextBoard = [...board];
  let nextPoolIndex = poolIndex;
  const nextOrphanQueue = [...orphanQueue];

  const drawFreshPair = () => {
    if (nextPoolIndex >= pool.length) return null;
    const pair = pool[nextPoolIndex];
    const pairId = nextPoolIndex;
    nextPoolIndex += 1;
    return { pairId, first: pair[0], second: pair[1] };
  };

  // Does a complete pair already exist among the OTHER 14 cells, ignoring
  // the two slots about to be refilled?
  const presentRoles = new Map();
  board.forEach((c, i) => {
    if (!c || freedSlots.includes(i)) return;
    if (!presentRoles.has(c.pairId)) presentRoles.set(c.pairId, new Set());
    presentRoles.get(c.pairId).add(c.role);
  });
  let hasGuaranteedMatch = false;
  for (const roles of presentRoles.values()) {
    if (roles.has('first') && roles.has('second')) { hasGuaranteedMatch = true; break; }
  }

  if (!hasGuaranteedMatch && nextOrphanQueue.length === 0) {
    // No other complete pair anywhere AND nothing waiting to complete —
    // fall back to dealing a whole fresh pair into both freed slots
    // together, guaranteeing a findable match. Only fails if the pool
    // itself is exhausted (the day's whole word set already dealt out).
    const fresh = drawFreshPair();
    if (fresh) {
      const flip = random() < 0.5;
      nextBoard[freedSlots[flip ? 0 : 1]] = { word: fresh.first, pairId: fresh.pairId, role: 'first' };
      nextBoard[freedSlots[flip ? 1 : 0]] = { word: fresh.second, pairId: fresh.pairId, role: 'second' };
    } else {
      nextBoard[freedSlots[0]] = null;
      nextBoard[freedSlots[1]] = null;
    }
  } else {
    // Safe to mix — either a match already exists elsewhere, or we can
    // force a completion below before we run out of slots to fill.
    let guaranteed = hasGuaranteedMatch;
    const order = random() < 0.5 ? [0, 1] : [1, 0];
    order.forEach((pos, i) => {
      const slot = freedSlots[pos];
      const isLastChance = !guaranteed && i === order.length - 1;
      const atOrphanCap = nextOrphanQueue.length >= MAX_ORPHANS;
      let completeOne;
      if (nextOrphanQueue.length === 0) completeOne = false;
      else if (isLastChance || atOrphanCap) completeOne = true;
      else completeOne = random() < ORPHAN_COMPLETE_CHANCE;

      if (completeOne) {
        const entry = nextOrphanQueue.shift();
        nextBoard[slot] = { word: entry.word, pairId: entry.pairId, role: 'second' };
        guaranteed = true;
      } else {
        const fresh = drawFreshPair();
        if (fresh) {
          nextBoard[slot] = { word: fresh.first, pairId: fresh.pairId, role: 'first' };
          nextOrphanQueue.push({ pairId: fresh.pairId, word: fresh.second });
        } else {
          nextBoard[slot] = null;
        }
      }
    });
  }

  return { board: nextBoard, poolIndex: nextPoolIndex, orphanQueue: nextOrphanQueue };
}
