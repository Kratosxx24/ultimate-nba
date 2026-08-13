# Ultimate NBA — Session Summary & Handoff

This is a plain-English recap of what happened this session, for context in a
future chat. For the actual formula spec, read `FORMULA.md` — this file is
the "why" and "what's next," not the math itself.

## What this session did, in order

1. **Added real playoff/team data to every player.** All 969 rows in
   `players.js` now carry that eraTeam's real regular-season `teamWins`/
   `teamLosses` and real `playoffRound` result (MISSED/R1/R2/CF/FINALS/
   CHAMPION), sourced via parallel web-research agents across all 496 unique
   team-seasons in the file (1962-2026).
2. **Added a Team Success formula step (6.5)** that folds win% and playoff
   depth into each player's rating, weighted by how "central" they were to
   the team (via `conf`) — a star gets real credit for winning it all and
   real blame for missing the playoffs; a bench guy gets a dampened version
   of both.
3. **Added real per-player minutes (`mpg`) to every row**, also via parallel
   web research. Used it to fix a real problem: heavy-minutes, low-scoring
   glue guys (Draymond Green, Jrue Holiday) were getting capped by the
   usage/confidence system even though 30+ real minutes is proof they're a
   genuine rotation piece. `mpgConf` now lets minutes satisfy that gate too.
4. **Added a Two-Way Impact step (6.6)** that rewards playmaking + defensive
   activity specifically weighted by real minutes played — the direct fix
   for "hard-working glue guy" cases the user cared about (Rodman, Draymond,
   Josh Hart types).
5. **Fixed the defensive-activity metric** to blend in rebounding (not just
   steals+blocks), which had been unfairly punishing elite-rebounding bigs
   like Dennis Rodman and Bill Laimbeer who don't rack up steals/blocks.
6. **Fixed a small-sample-size TS% problem** — Robert Williams III's 74.0%
   true shooting (all dunks/putbacks, 14% usage) was reading as more
   historically significant than real high-volume efficiency. Added a
   usage-based dampener on the "shooting rarity" bonus.
7. **Extensively tuned, then REVERTED, the MISSED-playoff penalty.** Spent a
   long stretch trying to soften the flat penalty for missing the playoffs
   (shifted break-even win total, tapered the cliff by how close to
   .500 the team was, added a high-confidence carve-out) because Shaquille
   O'Neal's '93 Magic season and Tracy McGrady's '04 Magic season seemed
   "too low." After actually re-checking the numbers side by side, concluded
   they were already in a reasonable spot at the ORIGINAL settings — the
   "too low" read was a misjudgment, not a real formula problem. **All of
   that tuning was reverted.** Current formula uses the original flat -4.0
   MISSED penalty, .500 break-even, ×6 weight.
8. **Retired the two-number system.** Previously there was a `SCALED`
   display number AND a separately re-derived `OVR` (percentile-clamped to
   25-99). As of this session, **`OVR = round(SCALED)`, capped at 100** —
   one rating number, not two. This was an explicit, deliberate ask: the
   next planned feature (opponent playoff strength, see below) will feed
   into SCALED, and having only one final number makes that clean.

## Where things ended up (confirmed, tested, and locked in)

- Formula lives in `FORMULA.md` (full spec with reasoning for every term).
- Reference implementation lives in `compute_ovr.js` in this same folder —
  run `node compute_ovr.js` for Top 50 / Random 50, or see the file's header
  comment for other usage (single-team breakdown, named-player lookup).
- `players.js` has all real data: STL/BLK (953 real + 16 estimated
  pre-1974), MPG (969 real), teamWins/teamLosses/playoffRound (496 unique
  eraTeams, shared across every player on that team-season).
- Extensively outlier-tested: bottom-of-the-barrel busts, champions who
  barely benefit from low minutes, missed-playoffs stars who stay
  statistically strong, same-player season-to-season swings, TS% extremes,
  low-confidence high-defense players (Alex Caruso pattern), and
  most-rewarded/most-punished by team outcome. See conversation history for
  the full "Monster Outlier Table" if you want to re-run that kind of audit.
- Confirmed-good reference cases (don't re-litigate these without a strong
  reason): Michael Jordan/LeBron/Shaq at the very top; Draymond Green and
  Jrue Holiday landing as legitimate stars, not just role players; Dennis
  Rodman/Bill Laimbeer meaningfully improved but still capped by real
  defensive-metric limitations; Robert Williams III brought down from
  inflated efficiency; Shaq '93 Magic and Tracy McGrady '04 Magic confirmed
  as "already fine" at the original team-success settings; Dejounte Murray
  '22 Spurs correctly penalized for a missed-playoffs season as the clear
  #1 option.

## Known unresolved items (deliberately left open)

- **Shai Gilgeous-Alexander / very recent stars reading as top-15
  all-time.** Diagnosed as a hand-rating issue (his OFF/DEF anchor is set
  at Jordan/LeBron level), NOT a formula bug — the formula is correctly
  amplifying an anchor that's already elite. Two possible fixes, neither
  implemented: (a) lower his hand OFF/DEF rating directly, or (b) design a
  new "career longevity/sample size" discount term so a monster single
  season doesn't read identically to a decade of sustained excellence.
  Needs a decision, not more formula tuning on existing terms.
- **Position groups are coarse** (3 buckets: Guards/Wings/Bigs). A
  finer-grained system (PG vs SG, PF vs C separately) was discussed, never
  built.
- **Rodman/Laimbeer still can't fully match a shot-blocking specialist** on
  the defensive-activity metric — positioning/physicality defense isn't
  fully capturable from any box-score stat. Acknowledged limitation, not a
  bug to chase further.
- **New players added to `players.js` need real hand-assigned OFF/DEF
  ratings** before the formula works for them, same as always.

## Opponent playoff strength (built and shipped this session)

Added the feature described in the previous version of this doc as "next
planned." Ran 24 parallel web-research agents to source, for every one of
the 377 eraTeams that made the playoffs (1962-2026), the real opponent and
that opponent's real regular-season record for EVERY playoff series that
eraTeam played that year — saved to `playoff_opponents.json`. New STEP
6.5.5 in the formula turns this into a bounded (±3.5) EXPONENTIAL modifier
(exponent 2.5, not linear) on `teamRaw` — facing a genuinely elite opponent
(e.g. a 73-9 juggernaut) contributes convexly more than facing a merely
above-average one, so legendary gauntlet runs read as categorically
different, not just "a bit more than average." The exponent was tuned
twice this session (1.0 linear → 1.5 → 2.5) to make the top end
progressively "crazier" per explicit user request — LeBron's '16 Cavs run
through the 73-9 Warriors ended at oppStrengthMod +1.74, the single
biggest bonus of any Top-30 player, while an average title run (MJ '91
Bulls) sits at only +0.37. Weighted so later playoff rounds (Finals
opponent quality) count more than early ones (R1). Beating tougher
competition scores a real bonus; losing to tougher competition is
dampened relative to losing to a weak team. Teams that missed the playoffs
are untouched (oppStrengthMod=0), so this cannot reopen the Shaq
'93/McGrady '04/Dejounte '22 cases — verified
unchanged. Top-30 and Random-30 reference tables re-run and confirmed
stable (no unexplained regressions).

## Standing workflow preference (already saved to memory)

Every time the formula changes, give the full updated formula plus fresh
Top 30/50 and Random 30/50 tables in the same response — don't wait to be
asked. This has been the pattern all session and should continue.
