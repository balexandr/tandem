# Tandem — Design Doc

Status: **concept locked, not built yet**. Name/color below are proposals,
easy to swap before build starts.

## Core mechanic

Grid of words. Click two words, in the correct order, that form a known
pair (e.g. PENCIL → CASE, PAINT → BRUSH, HORSE → JOCKEY). Correct pair
clears and both cells refill with a brand-new pair. Wrong pair: red flash,
no penalty, words stay put. Score = pairs found in 60 seconds. Same board
for everyone that calendar day (Wordle-style, not endless/random).

Decisions locked with user 2026-09-15:
- **Fixed daily board** — deterministic per date, comparable scores.
- **Order matters** — must click first-word-of-pair, then second.
- **Wrong click = no penalty**, just visual flash. Matches the rest of the
  suite's low-guess-anxiety design goal (see Realm/Pathways precedent).
- **Score + star tiers** on the result screen, not a raw high-score-only
  screen — keeps it consistent with the suite's stats-modal convention.
- **No difficulty ramp by weekday** — user wants flat difficulty every day
  (unlike Mirror/Pathways/Sprout/Realm which scale by day-of-week).

## Open risk — flagging, not guessing past it

Order-matters was chosen, but it only has an *objective* basis for real
compound words (PENCIL CASE is a word, CASE PENCIL isn't). For pure
association pairs like HORSE + JOCKEY, there's no spelling to anchor the
"correct" direction — the canonical order will be arbitrary and some
players will click the "wrong" direction and feel cheated by a rule that
looks unfair. Mitigation: lean the pair pool toward real compound words
first, use association pairs sparingly, and watch for "why didn't that
count" feedback same way Mirror watched for "too easy" — don't pre-tune
past a real signal.

## Generation — the hard part (per Realm/Mirror precedent)

Naive fill risks a "dead grid": no valid pair currently visible, player
stuck staring at a wall for seconds off a 60s clock. Fix: **never split a
pair across visible/hidden.** Grid cells are always populated in complete
pairs pulled from the day's pool — when a pair clears, both its cells
refill with both words of the *next* unused pair from the pool, never one
word at a time. This guarantees every word on the board has its partner
on the board too, at all times, with zero runtime solvability checking
needed.

Constraint on the daily pool: **no word appears in more than one pair**
that day. If PAINT+BRUSH and TOOTH+BRUSH both exist in the same day's
pool, and PAINT and TOOTH are ever on-grid together with BRUSH, the
correct pair becomes ambiguous. Dedup this at pool-authoring time (a
script check, not manual review, same as Realm/Mirror's puzzle
verification step).

## Board + pool sizing (proposed, tune after first playtest)

- Grid: 4×4 = 16 cells = 8 live pairs at once.
- Daily pool: ~24-30 pairs, shuffled; grid seeded from the front, rest
  queued as refills. Pool sized so a fast player can't exhaust it before
  60s runs out (needs a real playtest number, not a guess — flag if
  someone empties the pool before time's up).
- EPOCH: set to actual build/ship date, not backdated (per Realm's
  same-day-ship precedent — no multi-day tuning window risk here either
  as long as the pool-exhaustion question above gets tested pre-launch).

## Scoring / stars (proposed, needs real data to calibrate)

Star thresholds guessed cold, same as every other game's par numbers —
expect to retune after real scores come in, don't treat these as final:
- 0 stars: < 4 pairs
- 1 star: 4-7 pairs
- 2 stars: 8-11 pairs
- 3 stars: 12+ pairs

## Persistence (matches suite convention)

- `tandem-game-state` — keyed by date, content-fingerprinted per the
  Mirror lesson (stale saved state must invalidate if the day's puzzle
  data is edited after someone may have played it).
- `tandem-stats` — streak + score distribution (bucketed by star tier,
  same shape as Mirror/Realm's stats modal).
- `tandem-how-to-play-seen` — first-visit modal flag.

## Suite-wide conformance (per CLAUDE.md NoodleGames rule)

- Same footer ("© YEAR NoodleGames.co • noodlegames.co"), same logo font
  as every other game.
- Icon: unique to Tandem but same visual "feel" as siblings' icons —
  something reading as two-things-linked (distinct from Chain Link's
  existing path/link icon, since the concept overlaps in spirit).
- Text-message share, same convention as the rest of the suite. Proposed
  format (no colored-grid emoji makes sense here since there's no board
  state to encode, just a score):

  ```
  Tandem #12 🍜
  14 pairs in 60s
  ⭐⭐⭐
  noodlegames.co
  ```

- Accent color: **proposing lime `#84cc16`** (pink ruled out) — not used
  by any sibling yet (existing roster: orange, green/amber/red, coral,
  purple, cyan, rose, gold, blue/gold/rose, green, indigo, teal). Swap if
  you don't like it.
- Must get added to `noodle_games/src/data/games.js` hub AND every
  sibling's `src/utils/shareAll.js` GAMES roster at build time, per the
  shared-contract comment at the top of that file (same step every prior
  game required).

## Word bank — built

`src/data/wordBank.js` — 603 real, fact-checked compound-word pairs
(`[FIRST, SECOND]`, order = how they actually combine). Coincidental-
spelling non-compounds (CARGO, SANDWICH, LIGHTNING, PARKING) deliberately
excluded — they'd look like a pair to the code but not read as one to a
player. Also exports `selectDailyPool(dateKey, count)`: seeds a
deterministic PRNG off the date string (same convention as every other
game's `getTodayKey()`), shuffles, and greedily picks `count` pairs while
enforcing the no-shared-word-per-day rule from "Generation" above —
verified by script: 0 exact duplicates, 0 self-pairs in the bank, 0 word
overlaps in a sampled daily pool of 28.

Association pairs (HORSE+JOCKEY-style) are NOT in the bank yet — per the
"Open risk" section above, those need more judgment calls per entry, so
starting compounds-only and adding association pairs later (sparingly,
if at all) is the safer order.

## Not decided yet — needs a build-time call, not blocking the doc

- Whether to add any association pairs at all, given the open risk above.
- Whether a "tick" sound/animation on correct pair matters for feel —
  not scoped, revisit if it plays flat.

## Built — 2026-09-15

Live at `/Users/bryanalexander/Code/tandem`, same React 19 + Vite + CSS
Modules + localStorage stack as every sibling. EPOCH set to today
(same-day-ship, no backdated tuning window — Realm's precedent).

**One attempt per day** — a call made during build, not asked about
upfront: once the 60s clock ends, that score is locked in and the result
screen shows on every later visit that day (the grid doesn't re-deal).
Unlimited same-day retries would let players farm a great score before
sharing, undermining the "same board, comparable scores" decision from
the original ask. Mid-session refresh resumes exactly where you left off
(board, score, time remaining all persist) rather than losing progress —
that's not the same thing as a retry.

**No stored puzzle file, unlike every other game.** Realm/Mirror/etc.
keep a `puzzles.json` generated ahead of time. Tandem's "puzzle" is fully
procedural: `selectDailyPool(dateKey, 40)` from `wordBank.js` plus a
seeded layout shuffle (also keyed off `dateKey`) reproduce the exact same
starting board for anyone on the same date, computed on the fly — no
generation script, nothing to regenerate when the bank grows. Refill
slot-orientation (which of the two freed cells gets the "first" vs
"second" word) uses plain `Math.random()` since it's cosmetic only and
doesn't affect which pairs exist or in what order everyone sees them.

**Verified end-to-end with a real browser, not just a green build**
(`npm run build` passing was not treated as proof it works): drove the
dev server with Playwright and confirmed, with screenshots —
- Reversed click order (MAT then PLACE) does NOT match — both flash red,
  score stays 0. Confirms "order matters" actually holds at runtime, not
  just in the data shape.
- Correct order (PLACE then MAT) matches, score increments.
- The freed slots refill in place with a new real pair (WORK+OUT,
  i.e. "workout") in the exact two positions vacated — confirms the
  never-split-a-pair refill guarantee from "Generation" above holds
  during actual play, not just in the selection-time dedup check.
- Timer starts on first tap (not on load) and counts down correctly.
- Zero console errors across the whole interaction.

**Hub + sibling wiring done same pass**, per precedent (Mirror/Realm's
build notes): added to `noodle_games/src/data/games.js`, and added
`{ id: 'tandem', label: 'Tandem' }` to all 9 sibling repos'
`src/utils/shareAll.js` GAMES roster (verified all 9 were byte-identical
before editing, per that file's own "copied byte-for-byte" contract
comment) plus Tandem's own copy — 10 repos now agree on the roster.

**Not done yet, deliberately left for the user to trigger** (all
outward-facing): no git init/commit in the new `tandem` repo, no push,
no deploy, no og-image.png (every sibling has a real designed one;
generating a placeholder wasn't worth doing over asking).

## Real-play gap found — 2026-09-15, same day

User hit BACK+ROOM in actual play and it didn't register — a real,
common pair ("backroom deal," the back room of a store) that simply
wasn't in the bank. Not a logic bug: the order-matters/match-checking
code was verified working correctly in the "Built" section above; this
was a content gap. `BACK` only had 9 pairs despite being one of the most
productive prefixes in English. Expanded to 32 (ROOM, LOG, SIDE, SPACE,
TRACK, UP, WARD, WOODS, HAND, DOOR, FIELD, LASH, SEAT, STROKE, SWING,
TALK, COUNTRY, BURNER, BEAT, ORDER, PEDAL, SLIDE, SPIN added). Re-ran
the same dedup/self-pair/pool-overlap checks used at every prior edit —
still clean at 626 total pairs.

This is the closed-dictionary risk from earlier in this doc showing up
for compounds, not just the flagged association-pair case — a fixed
list can never cover every real pair a player tries, and "the game is
wrong" and "the bank is missing this one" look identical from the
player's side. No fix makes this zero; the practical answer is the same
one Mirror's stale-save bug pointed at: when the bank changes mid-day,
the existing content-fingerprint guard in `useGameState.js` already
invalidates any in-progress save and re-deals a fresh board rather than
serving a mismatched one — confirmed that mechanism is doing its job
here, not just for puzzle-file edits. Report more misses as they turn up
rather than trying to pre-audit the full 600+ entry bank by hand.

## Refill mix — 2026-09-15, same day

User feedback: refilling both freed slots with the two halves of the
SAME new pair made post-match play trivial — once you've matched once,
you know the two tiles that just appeared are each other's answer, no
searching required for the rest of the run. That's a real design gap
from the original "Generation" section above, which optimized only for
"never soft-lock," not for "stay interesting after move one."

Fix, in `src/utils/refill.js` (pulled out of the hook into a pure
function specifically so it could be fuzz-tested, not just eyeballed):
each freed slot is now filled independently. A slot either **completes
an existing orphan** — a word already sitting on the board whose
partner hasn't shown up yet, placed in a *different* slot than its
partner so finding it takes a real scan — or **starts a fresh
distractor**, a new word whose partner is deliberately withheld and
queued (`orphanQueue`) for some later refill. Capped at `MAX_ORPHANS = 4`
simultaneous distractors so the board never turns mostly-lonely, and
`ORPHAN_COMPLETE_CHANCE = 0.45` is a first guess at the good/bad mix —
untuned against real play, same caveat as every other constant in this
doc.

**Hard invariant, not a best-effort one**: after every single refill, at
least one complete pair exists somewhere on the board. The function
checks whether a match already exists among the other 14 cells before
deciding anything; if not, it forces one slot to complete a waiting
orphan, or — if there's no orphan to complete either — falls back to
dealing one whole fresh pair into both freed slots together (the old
behavior, but now only invoked when actually necessary). The only way
to violate this is the pool itself running dry, which just means the
day's content is exhausted, not a bug.

**Verified with a fuzz test, not just play-testing by hand**: simulated
500 independent daily pools x 200 forced matches each (20,000 refills
total, far beyond what a real 60-second run could reach) asserting the
invariant every single time. Result: 0 dead boards, 0 duplicate words
ever simultaneously on the board, orphan count never exceeded the cap of
4, averaged 1.78 concurrent orphans across all refills — confirms
distractors are actually showing up in volume, not a rare edge case.
Then confirmed live in the browser too: matching OVER+COAT produced two
non-matching distractors (AIR, WORK); the next match then completed AIR
with CRAFT placed in an unrelated slot ("aircraft"), proving the
cross-board search actually works end to end, not just in the isolated
function.

## More bank gaps found in play, then a real sweep — 2026-09-16

Same pattern as BACK+ROOM: user hit BOARD+ROOM (boardroom) not
registering, plus WHITE+OUT (whiteout). Checked — `BOARD` had 9 pairs and
every single one had BOARD as the *second* word (keyboard, headboard,
whiteboard, etc.), never the first. Same shape of gap twice in two days
is a systematic blind spot, not bad luck, so instead of patching just
these two: pulled every word in the bank that appears ONLY as a second
half (224 of them), and read through the whole list for ones that are
also common first-halves in real English. Added 88 new pairs total this
way (ROOMMATE, HOUSEHOLD, WATCHDOG, PASSWORD, CHECKMATE, WORMHOLE,
STOPWATCH, and more — full list in the "Third batch" comment in
`wordBank.js`), not just the two reported. 723 pairs now, same dedup/
self-pair/pool-overlap checks re-run clean (this run's script also
caught a real mistake before it shipped: BOARD/WHITE's fix got pasted in
twice by accident, once earlier in the file and once in the new batch —
the duplicate check flagged it immediately, exactly the kind of error
it's there to catch).

Not exhaustive — this was a manual read-through of a 224-word list, not
an algorithmic proof every gap is closed, so more misses are still
likely. But the shape of the bug (second-only words that are secretly
also common first-halves) should be much rarer now than it was
yesterday.

## Second full sweep — 2026-09-17

User asked for a broader pass rather than reacting one pair at a time
(prompted by FIELD+HOUSE, missing despite "fieldhouse" being a common
US sports-facility term). Re-ran the same method as the 2026-09-16
sweep against the bank as it now stands (grown since then via the BACK
audit and other additions): pulled every word that's currently
second-only (192 of them, re-derived fresh since the list changes as the
bank grows) and read through the whole thing again for real first-half
compounds. Added 93 pairs this pass (feedback, paperback, lockdown,
walkout, rootbeer, wheelhouse, hattrick, and more — full list in the
"broader sweep" comment in `wordBank.js`). 836 total pairs now, same
dedup/self-pair/pool-overlap checks re-run clean across 3 sample dates.

Same caveat as the first sweep, worth repeating: this is a manual
read-through, not a proof. The set of "second-only" words changes every
time new pairs get added (some words graduate off the list, new ones
join), so this is realistically a sweep worth re-running again after
future additions, not a one-time fix.

## How many answers should be on the board — 2026-09-16

User asked directly: how many complete, findable pairs should exist on
the board at once to be difficult but not impossible? Answered with
measurement instead of a guess, for once — every other threshold in this
doc (star cutoffs, pool size, MAX_ORPHANS/ORPHAN_COMPLETE_CHANCE's
original values) was a cold number tuned only after a user noticed it
felt wrong. This is the first one checked against simulated play before
shipping.

Measured the ORIGINAL "Refill mix" tuning (`MAX_ORPHANS=4`,
`ORPHAN_COMPLETE_CHANCE=0.45`) at a realistic ~14-match pace (roughly
what a real 60s run reaches, not the 150-match stress test used to prove
the no-dead-board invariant): averaged **6.93 of the 8 possible pairs
complete at any moment**, and never once dropped below 6 across 28,000
sampled points. Over 75% of the board was always "real" — confirms the
mixing feature from the previous session barely mattered in an actual
run, even though it fixed the literal complaint (refills stopped being
guaranteed-obvious pairs).

Target picked: **~3 complete pairs live out of 8 possible** — about a
third of the board real, enough that a couple of options always exist
(never a single needle) while requiring genuine scanning most of the
time. Swept `MAX_ORPHANS` x `ORPHAN_COMPLETE_CHANCE` combinations through
the same simulation harness rather than guessing which numbers would
land there:

| MAX_ORPHANS | CHANCE | avg complete | min seen (28k samples) |
|---|---|---|---|
| 4 (old) | 0.45 (old) | 6.93 | 6 |
| 8 | 0.2 | 4.94 | 4 |
| 10 | 0.2 | 4.41 | 3 |
| 12 | 0.2 | 3.99 | 2 |
| 12 | 0.1 | 3.43 | 2 |
| 14 | 0.1 | 2.96 | **1** |

`MAX_ORPHANS=14` lands closest to a pure average of 3, but spends ~40% of
the game sitting at exactly 1 findable pair — that's the difference
between "hard" and "feels unfair," not just a smaller number. Shipped
**`MAX_ORPHANS=12, ORPHAN_COMPLETE_CHANCE=0.1`**: average 3.43, never
below 2 in 28,000 samples. The true hard invariant (never zero) is
unchanged and structural, proved separately in "Refill mix" above — this
tuning only moves the *typical* and *comfortable-floor* numbers, not the
safety guarantee.

Re-ran the original no-dead-board fuzz test (20,000 matches) against the
new constants before shipping: still 0 dead boards, still 0 duplicate
words ever on the board simultaneously. Confirmed live in-browser too —
matching still works, scoring still increments, zero console errors.

Caveat same as everywhere else in this doc: 3.43 is a reasoned target,
not a validated-fun number — nobody has actually played 60 seconds at
this difficulty yet. Watch for "too hard now" the same way past
increases got watched for "too easy."

## Visual identity — 2026-09-17

User feedback: tiles read too close to Odd One Out's (same flat dark
rounded-rect card, same border/hover-glow treatment, same generic dark-
dot-grid background). Checked `odd_one_out/src/components/WordTile.module.css`
directly rather than going on memory — confirmed the overlap was real,
not just a vibe: near-identical card gradient, near-identical hover lift
+ colored glow, and index.css's dot-grid background is the *exact* same
pattern (`radial-gradient(circle, ...) `on a ~24-38px tile) both games
happened to land on independently.

Redesigned both layers so they no longer share a visual language:

- **Background** (`src/index.css`): dropped the dot-grid entirely.
  Replaced with a `repeating-conic-gradient` sunburst of rays anchored at
  the bottom edge, masked to a radial falloff and slowly rotating (90s/
  turn) so it reads as energy rising off an arcade floor rather than
  wallpaper. Layered with drifting spark motes (same visual language as
  the match-pop and result-screen sparks, so a correct match's burst
  feels like "more of what's already in the air," not an effect from
  nowhere) that twinkle and drift upward on a loop.
- **Tiles** (`TandemGrid.module.css`): asymmetric corner rounding
  (`18px 7px 18px 7px`) instead of a uniform rounded rectangle — a
  distinct "chip" silhouette at a glance, not just a recolor. Glass-style
  gradient surface instead of a flat card fill, a small glowing rim-light
  along the bottom edge of every tile. Originally shipped with an idle
  shimmer sweep staggered across the 16 cells too — user didn't like it
  in practice (liked the background, not the tile motion) and it got
  pulled same day. Background sunburst/sparks and the bottom rim-light
  stayed; only the per-tile sweep animation and its keyframes are gone.
- **Board frame**: added a thin pulsing LED strip along the top edge,
  arcade-console detail rather than a plain container border.

Kept unchanged, deliberately: footer, logo font, header layout, modal
structure — the CLAUDE.md rule is same *overall* styles and same footer/
logo across NoodleGames, unique per-game *feel* everywhere else (Mirror's
dusk map, Realm's crown-jewel theme are the existing precedent for this).
Verified live: zero console errors, selected-tile glow and shimmer both
confirmed visible and legible in screenshots, text never washed out by
the shimmer overlay despite it painting across the whole tile.

Follow-up same day: user didn't like the tile shimmer sweep specifically
(liked the background). Pulled just that animation and its keyframes;
background sunburst/sparks and the bottom rim-light stayed.

## Time bonus — 2026-09-17

User request: every match adds 15 seconds to the clock. Straightforward
on its face, but it changes what kind of game this is — a run is no
longer capped at 60s, so a skilled/lucky player can keep extending
indefinitely. That has real downstream consequences, handled rather than
ignored:

- **Pool exhaustion goes from "near impossible" to "the expected outcome
  of a long run."** `POOL_SIZE` was 40, sized for a hard 60s cap where
  draining it was barely conceivable. Measured the bank's real per-day
  ceiling first rather than guessing a bigger number: `selectDailyPool`
  tops out around 138-147 pairs/day (capped by word reuse across pairs,
  not raw pair count — e.g. every `BACK,*` pair shares the word BACK, so
  only one can ever be picked per day). Set `POOL_SIZE = 130`, safely
  under the measured floor across 28 sample dates.
- **"Board fully cleared" is now a real, reachable end state, not a
  theoretical one.** Simulated 500 games playing optimally (every click a
  match, no misses) — all 500 fully cleared their day's pool within 200
  matches. A real player won't play perfectly, but this confirms it's a
  path worth designing for, not an edge case to shrug off. Detection is
  exact, not a heuristic: if `orphanQueue` is empty, every non-null board
  cell must already be part of a complete pair (that's what "orphan"
  means in this codebase — a cell whose partner isn't dealt yet); so
  "no complete pair exists AND no orphans waiting" can only mean the
  board is entirely empty. Checking `board.every(c => c === null)` after
  a refill is a direct, provable test for "today's whole pool is spent,"
  not a guess. When true, the game now ends immediately (via a ref-based
  side channel out of the match-detection reducer, since the outcome is
  decided inside a functional state updater but the early-end decision
  has to happen in the same handler call) rather than sitting on a dead
  board until the clock — now potentially minutes away — runs out.
- **Share text and the result screen can't say "in 60s" anymore.** Added
  a real `elapsedSeconds` counter (ticks up in parallel with the
  countdown) instead of hardcoding the old constant. Both the result
  screen's new Time metric and the share text use the same
  `formatElapsed()` (mm:ss for anything over a minute, else "Ns") so a
  3-minute run reads as "3:07" in both places consistently, not "187s"
  in one and "3:07" in the other — caught and fixed the mismatch before
  shipping by actually rendering the result screen and reading it,
  not just by reasoning about the code.
- **Result screen distinguishes a genuine board-clear from a normal
  timeout** — different emoji, title ("Board Cleared!"), and subtitle,
  using the same `boardCleared` flag (persisted, so it survives a reload
  rather than being lost the moment the ref-based signal goes out of
  scope).
- **In-game copy updated**: the hint text and How to Play step that used
  to say "60 seconds, one attempt a day" now mention the bonus instead of
  contradicting the actual mechanic on screen.
- Caught myself putting a fresh em dash into the new board-cleared
  subtitle two messages after fixing the last em-dash violation in this
  same file — a live reminder that this needs an actual grep pass every
  time, not just "I'll remember this time."

Verified: re-ran the refill invariant fuzz test at the new `POOL_SIZE`
(65,000 simulated matches) — still 0 dead boards, 0 duplicate words ever
on the board. Confirmed live in-browser: a real match took the clock from
60 to exactly 75, the "+15s" badge appeared (first attempt overlapped the
adjacent "PAIRS" label and had to be repositioned above the timer instead
of beside it), and the result screen's three-metric row and share text
both render correctly with a faked multi-minute elapsed time.

Not addressed, flagged rather than silently changed: the star tier
thresholds (4/8/12 pairs) were tuned assuming a hard 60s ceiling. With
time now extending on every match, reaching 12+ pairs is a matter of
patience more than speed for anyone who doesn't miss — those thresholds
may need retuning once real runs happen, same "watch and adjust" pattern
as everything else in this doc.

## Any real compound counts: 2026-09-17, opening pairs also tuned same day

User hit BACK + FIRE while playing (backfire, a real compound) and it
registered as wrong. Root cause wasn't a bank gap: BACK was dealt as
BACK+PACK, FIRE as FIRE+FLY, and the match check required the exact dealt
pairId, so a real compound between two words from DIFFERENT dealt pairs
was always rejected. Same underlying complaint as the "only like 2 words
usable" feedback earlier that day (which prompted opening the board with
EASY_PAIRS-biased pairs, see the wordBank.js `selectDailyPool` change
above): the strict pairId rule made most of a 16-word board decorative.

Fix: `isValidCompound(first, second)` in `wordBank.js` (a lookup built
from every WORD_BANK entry) replaces the old `pairId`/`role` equality
check in `useGameState.js`'s click handler. Any two tiles that form a
real compound in click order now match, not just the pair they were
originally dealt as.

That surfaced a real second-order problem, caught by fuzzing before it
shipped rather than by a player report: a cross-pair match can strand
the matched words' ORIGINAL designated partners two different ways,
either sitting on the board already (its own partner now gone), or worse,
still sitting in `orphanQueue` waiting to be revealed with a completion
that will never come. The first fuzz pass (300 simulated days x 150
forced matches against the real 130-pair daily pool) found dead boards as
early as match #24, with 40-90+ pairs still unused in the pool: a real
deadlock, not content exhaustion.

Fixed with `rescueStranded()` in `refill.js`, run right after
`computeRefill` on every match: drops any orphan-queue entry whose
designated partner was just consumed by a cross-match (rather than let it
get placed later with nothing to complete it), and re-rolls a genuinely
stranded on-board leftover into a fresh pair instead of leaving it dead.
Re-ran the same fuzz harness after the fix: 0 premature dead boards across
300 days x up to 400 forced matches (over twice the original stress
level) against the real pool, and 0 duplicate words ever on the board
simultaneously. Remaining "dead boards" in the results are genuine content
exhaustion (poolIndex already at pool.length), the same accepted,
pre-existing limit as before, not a new one. At a realistic pace, roughly
1 in 10 matches is a cross-pair bonus match and rescues fire on about 1%
of matches: frequent enough to feel like a real mechanic, rare enough not
to visibly reshuffle the board's intended content most of the time.

Not yet verified live in-browser (fuzz-tested only). The underlying
`computeRefill` invariant math (the "at least ~3 of 8 pairs findable"
tuning) is untouched, so difficulty pacing shouldn't shift, but that's
reasoning, not a measurement, same caveat as everywhere else in this doc.

## Time bonus only applied on the first match, 2026-09-18

User reported: matching a pair didn't add +15s. Reproduced with
Playwright against a real running instance (not just reasoning about
the code): the very first match of a run got its bonus correctly (60
to 75), but every match after that silently didn't (75 to 74 instead
of 90, one tick down with no bonus at all, PAIRS still incremented
correctly).

Root cause was in the original "Time bonus" mechanism above, not
anything from today's matching change. `handleCellClick` wrote a
`matchOutcomeRef.current` flag inside `setGame`'s functional updater,
then read that ref synchronously right after calling `setGame`, on
the assumption that React always runs a functional updater eagerly at
call time. It doesn't: that's an internal bailout optimization React
applies under specific conditions, not a guarantee, and once other
state was already in flight (any run past the very first match) the
updater stopped running eagerly, so the ref read outside still saw
its stale reset-to-null value. This is why the original build's own
"Confirmed live in-browser" note only ever describes a single match,
never a sequence: a second-match test would have caught this
immediately.

Fixed by dropping the ref side-channel entirely. A new effect watches
`game.timeBonusToken` (already incremented on every match) against an
`appliedTimeBonusToken` ref, and applies the bonus and any
boardCleared-triggered game end whenever the real committed state
shows a new token value. This only depends on state React has
actually committed, not on when an updater happens to run, so it
can't go stale the way the old pattern could.

Verified with Playwright against the dev server: three matches in a
row (LIGHT+HOUSE, DOOR+BELL, SEA+SHELL) with a real 2.5s wait between
two of them to rule out an interval-timing issue, not just an
instant-click one. Timer went 60 to 75 to 89 to 86 (waiting) to 100,
every one of the three matches applying its +15s correctly, PAIRS
counting 1, 2, 3. Not yet redeployed live: this session's Tandem work
(EASY_PAIRS opening bias, the any-real-compound matching change, the
word-bank sweeps, and this fix) has all been sitting uncommitted and
undeployed since the initial gh-pages push, so the live site is still
running the very first build.
