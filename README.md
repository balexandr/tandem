# Tandem — Daily Word Pair Sprint

A daily 60-second word game: click two words that pair up, in order,
before the clock runs out.

Part of the [NoodleGames](https://noodlegames.co) family.

---

## How to play

Tap a word, then tap the one that pairs with it — PENCIL, then CASE.
Order matters, same as the words in a real compound word.

- Right pair: both tiles clear and two new words take their place instantly.
- Wrong pair: a quick red flash, no penalty — the clock keeps running.
- Every match adds **15 seconds** to the clock, so a run isn't capped at
  60 seconds — a strong run can stretch well past it.
- Stuck? Tap **Shuffle** to rearrange the tiles currently on the board
  (same pairs, same score, free, no penalty) without dealing a new set.
- When time runs out, any pair still sitting on the board unmatched
  pulses amber for a moment before the result screen appears, so you
  can see what was right there.
- One attempt per day, same word set for everyone, resets at midnight ET.

---

## Scoring

Pairs found, bucketed into star tiers for the result screen and stats
modal.

---

## Sharing

After your run, share your score. Once you've finished at least one
NoodleGame today, a **Share all completed** button appears in the footer.

---

## Stack

React + Vite · CSS Modules · localStorage · GitHub Pages

---

## Word bank

`src/data/wordBank.js` holds hundreds of fact-checked real compound-word
pairs. `selectDailyPool(dateKey, count)` deterministically draws that day's
set from it (same pool for every player on a given date), guaranteeing no
word is reused across two pairs in the same day's set.
