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

// Matching now accepts ANY real compound on the board, not just the exact
// pair a tile was originally dealt as (see isValidCompound in wordBank.js).
// That means a cross-pair match (BACK from BACK+PACK matched against FIRE
// from FIRE+FLY, forming BACKFIRE) leaves each word's original designated
// partner (PACK, FLY) orphaned somewhere: either sitting on the board
// already, or still withheld in orphanQueue waiting to be revealed later.
// Most of the time an orphaned word still has SOME other valid compound
// available on the board, so there's nothing to do. But if it doesn't (its
// only real partner in the whole bank was the word that just got used
// elsewhere), it deadlocks: an on-board leftover sits dead for the rest of
// the run, and a still-queued one is worse, since it gets placed later with
// NO completion possibly coming, which fuzzing (see the "Any real compound
// counts" section of GAME_DESIGN.md) proved can starve the whole board of
// matches well before the pool runs out. This drops any now-unfulfillable
// queue entry before it's ever placed, and re-rolls a truly-stranded
// on-board leftover into a fresh pair, instead of leaving either to rot.
export function rescueStranded({ board, freedSlots, matchedPairIds, poolIndex, orphanQueue, pool, isValidCompound }) {
  if (matchedPairIds[0] === matchedPairIds[1]) {
    // Not a cross-match: both tiles were each other's own dealt partner,
    // so there's no orphan to check.
    return { board, poolIndex, orphanQueue };
  }

  // A queued entry whose pairId matches either word we just matched away
  // was waiting specifically for that word, which is now gone for good.
  // Drop it rather than let it get placed later with nothing to complete
  // it. Losing an occasional queued word is a fair trade for never
  // deadlocking. `.filter` always returns a fresh array, so nextOrphanQueue
  // is already a safe-to-mutate copy regardless of whether anything matched.
  const nextOrphanQueue = orphanQueue.filter((entry) => !matchedPairIds.includes(entry.pairId));

  let nextBoard = board;
  let nextPoolIndex = poolIndex;
  let boardCloned = false;

  for (const pairId of matchedPairIds) {
    const leftoverIndex = nextBoard.findIndex((c, i) => c && !freedSlots.includes(i) && c.pairId === pairId);
    if (leftoverIndex === -1) continue;

    const leftoverWord = nextBoard[leftoverIndex].word;
    const stillMatchable = nextBoard.some((c, i) => {
      if (!c || i === leftoverIndex) return false;
      return isValidCompound(c.word, leftoverWord) || isValidCompound(leftoverWord, c.word);
    });
    if (stillMatchable) continue;
    if (nextPoolIndex >= pool.length) continue; // pool exhausted, nothing better available

    if (!boardCloned) {
      nextBoard = [...nextBoard];
      boardCloned = true;
    }
    const pair = pool[nextPoolIndex];
    const freshPairId = nextPoolIndex;
    nextPoolIndex += 1;
    nextBoard[leftoverIndex] = { word: pair[0], pairId: freshPairId, role: 'first' };
    nextOrphanQueue.push({ pairId: freshPairId, word: pair[1] });
  }

  return { board: nextBoard, poolIndex: nextPoolIndex, orphanQueue: nextOrphanQueue };
}
