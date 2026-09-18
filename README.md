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
- Score = pairs found in 60 seconds.
- One attempt per day, same word set for everyone, resets at midnight ET.

---

## Scoring

Pairs found, bucketed into star tiers for the result screen and stats
modal. Thresholds are a cold guess pending real playtest data — see
`src/utils/scoring.js` and GAME_DESIGN.md.

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
set from it (same pool for every player on a given date) while guaranteeing
no word is reused across two pairs in the same day's set — see the file's
top comment and GAME_DESIGN.md's "Generation" section for why that
constraint matters.

See [GAME_DESIGN.md](./GAME_DESIGN.md) for the full design history.
