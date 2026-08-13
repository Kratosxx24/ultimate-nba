# Ultimate NBA — Rating Formula (v35 — opponent playoff strength era)

This is the complete, from-scratch stats-based OVR formula built over multiple
tuning sessions. `players.js` in this folder has real STL/BLK data (columns 15-16,
16 pre-1974 rows use archetype-based estimates — see the file's header comment),
real per-eraTeam `teamWins`/`teamLosses`/`playoffRound` (columns 17-19), and real
per-player `mpg` (column 20) — all sourced via web research this session.

**Big change this session: SCALED is now the OVR.** `OVR = round(SCALED)`,
capped at 100. There is no longer a separately-derived OVR number — one
rating, not two. See STEP 9 below.

**New this session: opponent playoff strength.** `playoff_opponents.json`
(sibling file, keyed by eraTeam) holds the real opponent for every playoff
SERIES a team played, with that opponent's real regular-season record —
sourced via 24 parallel web-research agents across all 377 eraTeams that
made the playoffs. STEP 6.5.5 folds this into `teamRaw` as a bounded
modifier so a team that beat (or lost to) tougher competition on the way
reads differently than one that had a soft path. See STEP 6.5.5 below.

## CSV format (players.js)
```
eraTeam, name, pos, cost, ppg, rpg, apg, usg%, ts%, ws/48, off, def, archetype, teamKey, stl, blk, teamWins, teamLosses, playoffRound, mpg
```
`mpg` (column 20) is that PLAYER's real minutes-per-game for that season
(per-player, not per-team like teamWins/teamLosses/playoffRound). 0.0 means
the player recorded real stats for the season but did not play (season-long
injury/absence) — kept as 0.0 rather than omitted so the row stays intact.
`off` / `def` (columns 11-12) are the ORIGINAL hand-assigned ratings (0-50 scale) —
these are still used as the anchor in the new formula below, NOT replaced.

`teamWins` / `teamLosses` (columns 17-18) are that eraTeam's REAL regular-season
record (win% is derived from these at formula-run time, not stored). `playoffRound`
(column 19) is that eraTeam's real playoff result that season, one of: `MISSED`,
`R1`, `R2`, `CF` (lost conference finals), `FINALS` (lost NBA Finals), `CHAMPION`.
Every player on the same eraTeam shares the same three values — this is TEAM data,
not individual data, added so team success can modulate individual ratings (a
star on a 68-win champion should read differently than the same stat-line on a
25-win lottery team). Sourced via web research across all 496 unique eraTeams.

## Design philosophy (why it's built this way)
- **Hybrid, not pure-stats.** Hand-assigned OFF/DEF are the anchor because they
  capture things box scores structurally can't (defensive engagement/reputation,
  shot-creation gravity — e.g. James Harden's real defensive shortcomings show up
  nowhere in STL/BLK/rebounds). Real stats then MODULATE that anchor, they don't
  replace it. If a hand rating produces a wildly wrong result relative to its box
  stats, that's a signal to reconsider the rating, not a formula bug.
- **No override list.** Earlier iterations of this app relied on a large
  `OVR_OVERRIDES` / `PANTHEON_TIER` patch list to fix cases the formula couldn't
  handle. This version's philosophy is to fix the FORMULA when a real case breaks
  it (Harden, Wilt, Robert Williams, Boban all drove real formula changes this
  session), not to special-case the player.
- **Position-relative & era-relative normalization** wherever a flat league-wide
  constant would unfairly favor one group (guards vs bigs for defensive activity;
  modern vs older decades for TS%, since 2020s league-average TS% is genuinely
  ~58.8% vs ~53-56% in most other decades).
- **Usage/PPG confidence gating.** Bonuses (not penalties) are usage-gated so a
  tiny-sample outlier (Boban Marjanovic's .270 WS/48 on 5.5 PPG) can't hijack the
  formula. Below-average numbers are NEVER gated — a bad stat doesn't get an
  "excuse," only a good one needs proof of real sample size.

## Full formula

```
═══════════════════════════════════════════════════════════════
STEP 0 — PREPROCESSING (once, across the whole dataset)
═══════════════════════════════════════════════════════════════
Position groups: Guards {PG,SG} / Wings {SF} / Bigs {PF,C}  (use primary/first-listed position)
stlBlkPct  = percentile rank of (STL+BLK) WITHIN position group
rebPct     = percentile rank of RPG WITHIN position group
defPct     = stlBlkPct × 0.6 + rebPct × 0.4
              [previously defPct was STL+BLK only, which is blind to elite
               rebounders whose defensive value is real but doesn't show up
               in steals/blocks — Dennis Rodman '96 Bulls scored in the
               13th percentile on defPct despite historic rebounding.
               Blending in rebPct fixes this for Rodman/Laimbeer-type
               bruisers without overriding STL+BLK as the primary signal
               for perimeter/rim-protection defenders]
tsPctEra   = percentile rank of TS% WITHIN decade bucket (decade = floor(year/10)*10)
eraAvgTs   = average TS% for that decade
  Reference era averages found this session:
    1960s: 55.4   1970s: 53.6   1980s: 55.3   1990s: 55.2
    2000s: 53.8   2010s: 55.6   2020s: 58.8

═══════════════════════════════════════════════════════════════
STEP 1 — USAGE CONFIDENCE (single smooth curve — NOT a hard cliff)
═══════════════════════════════════════════════════════════════
usgConf(usg) = 1 / (1 + e^(-0.5 × (usg − 17)))
ppgConf(ppg) = 1 / (1 + e^(-0.3 × (ppg − 9)))
mpgConf(mpg) = 1 / (1 + e^(-0.35 × (mpg − 20)))
conf = max(usgConf, mpgConf × 0.85) × max(ppgConf, mpgConf)
  Real minutes now can satisfy EITHER gate, not just the scoring one.
  Originally usgConf was a mandatory, un-rescuable multiplier — a genuinely
  heavy-minutes low-usage glue guy (Draymond Green: ~32-34 MPG but only
  ~16% usage) still got capped hard even after mpgConf fixed the PPG side,
  because low usage% alone was treated as low confidence regardless of
  minutes. That's backwards: a player logging 30+ real minutes on a
  contender IS a proven, meaningfully-used rotation piece by definition,
  whether or not he's asked to create offense. The ×0.85 discount means
  minutes alone can't fully outweigh a genuine low-usage/low-minutes bench
  outlier (mpgConf must still be high, i.e. real sustained minutes) — this
  isn't a blanket loosening, it's specifically for players who prove
  themselves through minutes rather than shot volume.

═══════════════════════════════════════════════════════════════
STEP 2 — OFFENSE (hand-anchored, era-relative, confidence-gated bonus only)
═══════════════════════════════════════════════════════════════
tsRatio = TS% / eraAvgTs
tsMod   = if tsRatio > 1:  1 + (tsRatio^0.35 − 1) × conf     [bonus IS gated]
          else:            tsRatio^0.35                       [penalty NOT gated]
usageMod  = (USG%/22)^0.30
offScore  = offBase × tsMod × usageMod × (0.55 + 0.45 × conf)

═══════════════════════════════════════════════════════════════
STEP 3 — DEFENSE (hand-anchored, blended with real stats, NEVER usage-gated —
                    there is no such thing as "defensive usage")
═══════════════════════════════════════════════════════════════
rebMod       = 0.85 + min(0.3, RPG/40)
activityMod  = 0.8 + defPct × 0.4
anchoredDef  = defBase × rebMod × activityMod
pureDefScore = defPct × 40 + min(10, RPG × 0.5)
defScore     = anchoredDef × 0.6 + pureDefScore × 0.4

═══════════════════════════════════════════════════════════════
STEP 4 — ANCHOR COMBINE (position-dependent split, then boosted)
═══════════════════════════════════════════════════════════════
offWeight/defWeight = Guards: 58/42   |   Wings & Bigs: 55/45
ANCHORED = (offScore × offWeight + defScore × defWeight) × 1.35   [anchor boost]

═══════════════════════════════════════════════════════════════
STEP 5 — WS/48 OVERLAY (mildly exponential, confidence-gated)
═══════════════════════════════════════════════════════════════
delta  = WS/48 − 0.100
wsTerm = sign(delta) × |delta × 40|^1.08 × conf

═══════════════════════════════════════════════════════════════
STEP 6 — IGB ("Intangibles" — four additive components)
═══════════════════════════════════════════════════════════════
usageNorm = USG%/22
effNorm   = TS%/55

effCombo    = max(0, usageNorm × effNorm² − 1)^1.6 × 1.2 × conf
              [offensive "dawg": usage × efficiency, squared to separate true
               outliers from merely-great — usage IS a real offense stat here]

defCombo    = max(0, defPct − 0.7) × 8
              [defensive "dawg": activity alone, NO usage gate — usage doesn't
               apply to defense conceptually]

volumeDampener = min(1, USG%/20)
gravityBonus = ln(1 + max(0, tsPctEra − 0.85) × 100) × 1.3 × (0.5 + 0.5×conf) × volumeDampener
              [era-relative shooting rarity; log-capped so no single outlier
               stat (e.g. Wilt's historic FG%) can single-handedly run away
               with the ranking — diminishing returns above the 85th era
               percentile. volumeDampener added because extreme TS% at very
               low usage is often a small-sample artifact (dunks/putbacks
               only, no jumpshots/shot creation) rather than genuine
               historic shooting — Robert Williams III's 74.0% TS% on 14%
               usage was reading as more historically significant than
               Wilt's or Jokic's real high-volume efficiency. Full-usage
               players (≥20%) are unaffected.]

astBonus    = ln(1 + APG) × 1.15
              [logarithmic — playmaking counts for real now, but a historic-
               volume passer doesn't leapfrog scoring/defense legends purely
               off assist totals. Lives in IGB deliberately, NOT folded into
               offScore — offBase already implicitly captures playmaking via
               the human rating (a "Generational Playmaker" archetype already
               scores high OFF); adding apg into offScore would double-count
               it. IGB is specifically the "real stats add evidence on top of
               the anchor" layer, which is exactly assists' role.]

IGB = effCombo + defCombo + gravityBonus + astBonus

═══════════════════════════════════════════════════════════════
STEP 6.5 — TEAM SUCCESS (real record + playoff depth, confidence-gated bonus only)
═══════════════════════════════════════════════════════════════
winPct     = teamWins / (teamWins + teamLosses)
winPctTerm = (winPct − 0.50) × 6
roundScore = MISSED:−4.0, R1:−0.04, R2:+0.97, CF:+2.78, FINALS:+8.5, CHAMPION:+10.0
              [REVERTED — a session of tuning (34-win break-even, ×4 weight,
               tapered/softened MISSED cliff, high-conf winPct disregard)
               was walked back after re-checking the actual numbers: Shaq
               '93 Magic (79 OVR) and Tracy McGrady '04 Magic (71 OVR) were
               already in a reasonable spot at the ORIGINAL flat -4.0/.500
               settings — the "they're undervalued" read was a misreading
               of the numbers, not a real formula problem. Back to .500
               break-even, ×6 weight, flat -4.0 MISSED cliff. R1 is close
               to a wash —
               making the playoffs at all barely counts either way. R2→CF→
               FINALS grow EXPONENTIALLY, and the CF→FINALS jump in
               particular is now the steepest step in the whole curve
               (+5.7, roughly ×3.1) — making the Finals at all is a huge
               leap in team accomplishment, bigger than any other round
               transition. CHAMPION still does NOT continue that
               exponential pace — the gap between "lost the Finals" and
               "won the title" stays deliberately SMALL (+1.5 over FINALS),
               because reaching the Finals is already the hard part;
               winning it adds real but modest extra credit on top, not
               another exponential jump.]
teamRaw    = winPctTerm + roundScore + oppStrengthMod   [oppStrengthMod from STEP 6.5.5 below]
teamTerm   = teamRaw × (0.4 + 0.6 × conf)   [SYMMETRIC confidence scaling —
               applies to bonus AND penalty alike now, not just the bonus.
               This is a deliberate philosophy change for this term only:
               team outcome should reflect on a player PROPORTIONAL TO HOW
               CENTRAL THEY WERE, in both directions. A conf≈1.0 star who
               wins it all was "the guy who won it" — full credit. A
               conf≈1.0 star whose team missed the playoffs was "the guy
               who couldn't get it done" — real penalty, not a shrug. A
               low-usage/low-minutes role player (conf≈0.1-0.3) was neither
               truly responsible for the title nor the collapse, so both the
               credit and the blame are dampened toward the 0.4 floor (never
               fully zeroed — even a bench guy absorbs a bit of team
               context). This intentionally breaks from the general
               "penalties are never gated" rule used elsewhere in the
               formula (Step 2, Step 6) — those gate INDIVIDUAL stat
               credibility (is this a real sample?), while this term is
               about OWNERSHIP of a team outcome, a different question
               entirely.]

═══════════════════════════════════════════════════════════════
STEP 6.5.5 — OPPONENT PLAYOFF STRENGTH (EXPONENTIAL modifier on teamRaw,
                                          only applies if the team made the playoffs)
═══════════════════════════════════════════════════════════════
For every eraTeam that made the playoffs (playoffRound ≠ MISSED), real data
exists (playoff_opponents.json) on every playoff SERIES that team played:
who the opponent was, and that opponent's REAL regular-season win% that
same season. Sourced via parallel web research across all 377 playoff
eraTeams (1962-2026), one entry per series (round, opponent, opponent's
W-L, series result).

ROUND_WEIGHT = { R1: 1.0, R2: 1.5, CF: 2.0, FINALS: 2.5 }
  [later-round opponents matter more — who you play in the Finals says
   more about the difficulty of a run than who you played in R1]

For each series: diff = opponentWinPct − 0.50
                 seriesVal = sign(diff) × |diff|^2.5        [OPP_EXP = 2.5]
  [EXPONENTIAL, not linear — this is the key design choice. A convex curve
   means facing a truly elite team (say a 73-9 juggernaut, diff=+0.39)
   contributes MUCH more than proportionally more than facing an average
   .500 team, while a merely-above-average opponent (diff=+0.10) barely
   moves the needle. Linear scaling was tried first (OPP_EXP=1.0) and
   treated a 55-win team and a 73-win team as differing only by degree;
   OPP_EXP was then pushed from 1.5 up to 2.5 specifically to make the top
   end "crazier" — beating history-book teams should read as categorically
   special, not just "a bit more than average," and merely-good playoff
   opponents should barely register at all.]

oppStrengthRaw = Σ(seriesVal × ROUND_WEIGHT[round]) / Σ(ROUND_WEIGHT[round])
                 across every series that eraTeam played that postseason
oppStrengthMod = clamp(oppStrengthRaw × 45, −3.5, +3.5)     [OPP_MULT = 45]
  [0 = league-average opponents, no adjustment. OPP_MULT and the clamp
   were both raised together with OPP_EXP so the curve stays a MODIFIER,
   not a new dominant term — for reference, the roundScore steps range
   from −4.0 (MISSED) up to +10.0 (CHAMPION), with the CF→FINALS jump
   alone being +5.7. Empirically across the real dataset, oppStrengthMod
   ranges from about −0.005 (softest real playoff path, '84 Jazz) up to
   the +3.5 cap itself (toughest real playoff path, '96 Heat — the only
   team currently hitting the ceiling). The steeper curve makes legendary
   gauntlet runs visibly special: LeBron's '16 Cavs (beat the 73-9
   Warriors in the Finals) get oppStrengthMod = +1.74 — the single biggest
   bonus in the current Top 30 by a wide margin — while an average title
   run like MJ's '91 Bulls barely moves (+0.37) and a soft-schedule
   champion like SGA's '25 Thunder moves almost nothing (+0.15). Teams
   that missed the playoffs entirely get oppStrengthMod = 0 (no opponents
   to measure) — this term never touches the already-validated
   MISSED-playoff cases (Shaq '93 Magic, McGrady '04 Magic, Dejounte
   Murray '22 Spurs all confirmed unchanged after adding this step).]

═══════════════════════════════════════════════════════════════
STEP 6.6 — TWO-WAY IMPACT (playmaking + defense, weighted by REAL MINUTES —
                            not usage, not scoring)
═══════════════════════════════════════════════════════════════
twoWay = (ln(1 + APG) × 1.5 + max(0, defPct − 0.6) × 10) × mpgConf
  [astBonus and defCombo in IGB already exist, but neither one scales with
   how many minutes the player actually played — a starter logging 32+ MPG
   of playmaking and defensive activity reads identically to a bench player
   with the same per-game rate over 15 minutes. This step is the fix:
   sustained two-way value (ball-handling + defensive activity) earns a
   direct bonus gated ONLY by mpgConf, independent of usage/scoring, since a
   glue guy's value is real regardless of how much he shoots. This is what
   makes cases like Draymond Green (elite AST+defense on 32+ MPG for a
   champion, but low usage/PPG) separate properly from a low-minutes bench
   player putting up similar per-game numbers over a small sample.]

═══════════════════════════════════════════════════════════════
STEP 7 — FINAL RAW
═══════════════════════════════════════════════════════════════
RAW = ANCHORED + wsTerm + IGB + teamTerm + twoWay, floored at 1   (raw production, unbounded above)

═══════════════════════════════════════════════════════════════
STEP 8 — SCALED (0-100ish display number, heavy top compression)
═══════════════════════════════════════════════════════════════
maxRaw, minRaw = max/min RAW across the full dataset
D = maxRaw − RAW                       (distance below the top scorer)
SCALED = 100.5 − C × D^1.9
  where C = (100.5 − 25) / (maxRaw − minRaw)^1.9
  This scales the GAP from the top, not RAW itself — small gaps near the max
  compress hard (legends cluster 91-100.5), while larger gaps further down
  spread out more, preserving real tiering through the mid/bottom of the roster.

═══════════════════════════════════════════════════════════════
STEP 9 — OVR (the number actually shown in-game) — CHANGED THIS SESSION
═══════════════════════════════════════════════════════════════
OVR = round(SCALED), capped at 100 if SCALED > 100.
  SCALED **is now the OVR** (rounded to nearest whole number, no separate
  percentile-clamp/rescale step). The old Step 9 (percentile-clamp RAW to
  [1st,99th] → linear-map to [25,99]) is RETIRED — it produced a second,
  independently-derived number that happened to correlate with SCALED but
  wasn't identical to it, which was confusing and redundant. Now there is
  ONE rating number, not two. Since SCALED already compresses hard near the
  top (100.5 max) and spreads out lower down, OVR display range is
  effectively ~13-100 across the current dataset, with 100 as a hard
  ceiling for anyone whose SCALED computes above it (currently nobody does,
  but future data — e.g. incorporating opponent playoff strength — could
  push someone over).
```

## Known open items / judgment calls (still open, low priority)
1. **Bill Laimbeer / Dennis Rodman vs Robert Williams III**: `defPct` now blends
   STL+BLK (60%) with rebounding percentile (40%), which meaningfully helped
   Rodman/Laimbeer, but they still can't fully match a shot-blocking specialist
   on defPct alone — positioning/physicality defense still isn't fully
   captured by any box-score stat. Left as-is; a real, acknowledged formula
   limitation, not a bug.
2. **Harden's real-world defensive reputation**: the hand-anchored `defBase`
   is what catches this (not a computed term) — if `defBase` is ever revised
   for a player, that's the lever that matters most for "he doesn't really
   play D" cases.
3. **Position groups are coarse** (3 buckets: G/W/B). A finer-grained system
   (PG vs SG, PF vs C separately) was discussed but never built.
4. **New players added to players.js need real OFF/DEF hand ratings**
   assigned before this formula works for them — same requirement as the old
   system.
5. **Shai Gilgeous-Alexander / very recent players reading as top-15
   all-time**: confirmed this is a hand-rating issue, not a formula bug —
   his OFF/DEF anchor is set at all-time-great level (48/36), and ANCHORED is
   ~80% of RAW, so the formula is correctly amplifying that rating. Left
   unresolved — no formula mechanism currently accounts for career-length/
   sample-size validation (a monster single season reads identically to a
   decade of sustained excellence). If this still bothers you, the fix is
   either (a) lower his hand rating, or (b) design a longevity-discount term
   — neither was implemented this session.

## Playoff/team-success data (added this session)
- All 969 player rows carry real `teamWins`, `teamLosses`, `playoffRound` for
  their eraTeam (496 unique eraTeams), and real per-player `mpg`, all sourced
  via web research (Basketball-Reference) across parallel agent batches.
- STEP 6.5 (team success) and STEP 6.6 (two-way impact) both fold this into
  RAW. Extensively tuned and outlier-tested this session — see the tuning
  history below.

## This session's tuning history (for context on WHY things are where they are)
1. Added playoff/team data + STEP 6.5 (team success) and STEP 6.6 (two-way
   impact, MPG-weighted playmaking/defense).
2. Added `mpg` confidence (`mpgConf`) so heavy-minutes/low-usage players
   (Draymond Green) get real confidence credit, not just high-scorers.
3. Let minutes also satisfy the usage-confidence gate (`max(usgConf,
   mpgConf×0.85)`), fixing role players capped by low usage despite proven
   heavy minutes.
4. Fixed `defPct` to blend rebounding, not just STL+BLK (Rodman/Laimbeer fix).
5. Dampened `gravityBonus` at low usage via `volumeDampener` (Robert
   Williams III fix — his 74.0% TS% on 14% usage was reading as more
   historically significant than real high-volume efficiency).
6. Extensively tuned STEP 6.5's MISSED-playoff penalty and win% break-even
   (tried: softened MISSED cliff, shifted break-even to 34 wins, tapered
   penalty by how close to break-even, high-confidence disregard rule) to
   address Shaq '93 Magic / Tracy McGrady '04 Magic reading as "too low" —
   then REVERTED all of it after re-checking the numbers: they were already
   in a reasonable spot at the original settings. Final STEP 6.5 is the
   ORIGINAL version: `.500` break-even, `×6` weight, flat `−4.0` MISSED
   cliff, symmetric `(0.4+0.6×conf)` confidence scaling on the whole
   `teamRaw` (both bonus and penalty scale with how central the player was).
7. Retired the old two-number system (SCALED for display, separately-derived
   percentile-clamped OVR for the in-game stat) — **OVR = round(SCALED)**
   now, capped at 100. One number, not two.

## Opponent playoff strength (shipped this session)
`playoff_opponents.json` holds, for every one of the 377 eraTeams that made
the playoffs (1962-2026), the real opponent and that opponent's real
regular-season W-L for every playoff series that eraTeam played — sourced
via 24 parallel web-research agents. STEP 6.5.5 turns this into a bounded
EXPONENTIAL modifier (±3.5, OPP_EXP=2.5) on `teamRaw` so beating elite
opponents reads as categorically special, not just proportionally better.
Re-tested against every previously-validated
reference case (Shaq '93 Magic, McGrady '04 Magic, Dejounte Murray '22
Spurs, Draymond Green, Dennis Rodman, top-30/random-30 tables) — all
unchanged or moved only via the new mechanism working as designed, no
regressions.

## Suggested next steps for a future session
- Position groups are still coarse (G/W/B, 3 buckets) — a finer system
  (PG/SG/SF/PF/C) was discussed, never built.
- Consider whether to formalize this into `script.js` for the actual app, or
  keep prototyping in a standalone Node script first (this session did all
  testing via a standalone Node script — `compute_ovr.js` — against
  `players.js` and the new `playoff_opponents.json`, never touched the live
  app).
- The `stl`/`blk`/`mpg`/`teamWins`/`teamLosses`/`playoffRound`/opponent data
  is real, researched data — safe to build from without re-sourcing.
