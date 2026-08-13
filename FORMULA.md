# Ultimate NBA — Rating Formula (v38 — era-relative rebounding + rebounding outlier)

**This session (v38): rebounding is finally era-normalized, and the rebPct
percentile ceiling is broken.** Two changes, both in STEP 0:

1. **`ERA_AVG_TRB`** — real league-average team rebounds per game by decade,
   sourced from Basketball-Reference. Rebounding was the last major stat in the
   formula with NO era normalization, and the effect is larger than shooting's:
   the 1960s had **65.6** team rebounds per game against **42.6** in the 2010s,
   54% more. `rebPct` now ranks era-adjusted boards.
2. **Rebounding outlier term** — `rebPct` is a percentile and saturates, so
   Rodman's 14.9 RPG and Garnett's 13.9 both read ~1.00 and the formula could
   say "best in the pool" but never "historic outlier." A bounded term now
   measures how far past the league's 97th percentile a player is in real
   era-adjusted boards, gated on the same `defBase` credit as v37's `led`.

Together these close the *residual* limitation logged when v37 closed open item
#1. **Dennis Rodman '96 Bulls: 86 → 89** (80 → 89 cumulative from v36).
119 players rise, 98 fall, 758 unchanged; 7 move by 3 or more.

**Two hand-rating corrections this session** (made because the ratings were
wrong, not to hit a target):
- **Dennis Rodman '96 `defBase` 49 → 51**, tying Bill Russell atop the scale.
- **Elgin Baylor '62 `defBase` 45 → 38.** At 45 he was rated a better defender
  than Walt Frazier (44), Scottie Pippen '91 (44), Gary Payton '94 (44), David
  Robinson '91 (44) and Patrick Ewing '94 (44) — indefensible for an
  offense-first scorer with chronic knee problems. 38 puts him with Havlicek and
  Elvin Hayes. His OFF stays at 47; 38.3 PPG earns it. Baylor 97 → 96.

---

# (v37 — strongest-evidence defPct)

**This session (v37): `defPct` now takes a defender's STRONGEST signal, gated on
the hand-assigned `defBase`.** This closes "Known open item #1" (Rodman/Laimbeer
positioning defense), which had been open since v34. See STEP 0 and the
"Strongest-evidence defPct" section below. Dennis Rodman '96 Bulls goes 80 → 86;
109 players rise, 60 fall, 806 are unchanged, and only 4 move by 3 or more.

**Also this session (data, not formula):** six missing player-seasons added
(Tim Duncan / Tony Parker / Manu Ginobili '14 Spurs, Chris Paul / Devin Booker
'21 Suns, Mark West '93 Suns — all stats sourced from Basketball-Reference), and
six `pos` values widened to a real second position (Chet Holmgren '25 → `C/PF`,
Klay Thompson '22 → `SG/SF`, Toni Kukoc '96 → `SF/PF`, James Posey '08 →
`SF/PF`, Andrei Kirilenko '07 → `PF/SF`, Marco Belinelli '14 → `SG/SF`). Only
SECONDARY slots were appended — no primary position changed, so no OVR moved
from the `pos` edits. Roster is now 975 player-seasons.

---

# (v36 — 5-way position groups)

This is the complete, from-scratch stats-based OVR formula built over multiple
tuning sessions. `players.js` in this folder has real STL/BLK data (columns 15-16,
16 pre-1974 rows use archetype-based estimates — see the file's header comment),
real per-eraTeam `teamWins`/`teamLosses`/`playoffRound` (columns 17-19), and real
per-player `mpg` (column 20) — all sourced via web research this session.

**Big change this session: SCALED is now the OVR.** `OVR = round(SCALED)`,
capped at 100. There is no longer a separately-derived OVR number — one
rating, not two. See STEP 9 below.

**New this session: 5-way position groups.** Position groups went from 3 coarse
buckets (Guards {PG,SG} / Wings {SF} / Bigs {PF,C}) to 5 — PG, SG, SF, PF, C —
each with its own defensive-percentile pool and its own point on a smooth
off/def-weight gradient (PG leans offense hardest, C leans defense hardest),
instead of a single hard cliff between "guard" and "everyone else." See STEP 0
and STEP 4 below, and "5-way position groups" further down for the full
rationale and validation.

**Opponent playoff strength** (previous session). `playoff_opponents.json`
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
Position groups: PG / SG / SF / PF / C  (use primary/first-listed position;
                  an unrecognized primary position falls back to SF)
ERA_AVG_TRB = league-average TEAM rebounds per game, by decade (v38, real
              reference constants from Basketball-Reference — NOT dataset-derived):
    1960s: 65.56   1970s: 48.65   1980s: 43.54   1990s: 41.45
    2000s: 41.76   2010s: 42.59   2020s: 43.36
rpgEra     = RPG × (ERA_AVG_TRB[2010s] / ERA_AVG_TRB[player's decade])
              [v38 — rebounding was the LAST major stat with no era normalization,
               and the effect is bigger than shooting's: the 1960s had 54% more
               rebounds available per game than the 2010s. The 1990s were the
               lowest-rebounding era, so 90s boards are slightly harder-earned.]

stlBlkPct  = percentile rank of (STL+BLK) WITHIN position group
rebPct     = percentile rank of rpgEra WITHIN position group   [v38: era-adjusted]

blend      = stlBlkPct × 0.6 + rebPct × 0.4          [the v36 formula — now a FLOOR]
led        = max(stlBlkPct, rebPct) × 0.75 + min(stlBlkPct, rebPct) × 0.25
defCredit  = clamp((defBase − 34) / 14, 0, 1)        [defBase 34 → 0, 48 → 1]
defPct     = blend + defCredit × max(0, led − blend)

OUT_BAR    = 97th percentile of rpgEra ACROSS THE WHOLE DATASET  (currently 12.38)
rebOutlier = min(0.12, max(0, rpgEra − OUT_BAR) × 0.05) × defCredit
defPct     = min(1, defPct + rebOutlier)
              [v38 — rebPct is a PERCENTILE and therefore saturates: Rodman '96
               (14.9 RPG) and Garnett '04 (13.9) both sit at ~1.00, so the formula
               could say "best in the pool" but never "historic outlier." This
               reads ABSOLUTE era-adjusted boards against a league-wide bar so
               that distinction can exist. Gated on the same defCredit as `led`,
               so rebounding volume is never a back door to defensive value for a
               non-defender. The bar is LEAGUE-WIDE, not per-position: an earlier
               per-position version was abandoned because centers all rebound, so
               the C bar sat at 13.6 while the SG bar sat at 5.4 — Josh Hart (9.4
               RPG) scored a bigger "outlier" than Rodman, while Mutombo, Wemby,
               Hakeem and Mark Eaton all LOST ground on a rebounding term.
               Historic rebounding is historic regardless of position; rebPct
               already handles "unusual for your spot."]
              [v37 — STRONGEST EVIDENCE, GATED ON THE HAND RATING.
               v34 changed defPct from STL+BLK-only to the 60/40 blend, which
               helped but did not fix the problem: Dennis Rodman '96 Bulls has
               rebPct 1.00 (the highest in the dataset, 10th in RPG league-wide
               all-time) and stlBlkPct 0.17, giving blend = 0.501 — the greatest
               rebounder ever reading as an exactly average defender. Worse, two
               bonuses are gated above that value (defCombo at 0.70, the
               defensive half of twoWay at 0.60), so he collected ZERO from
               both. Positioning and physicality defense simply do not appear in
               STL+BLK, and a fixed 60/40 blend forces every defender to be
               judged mostly on events.

               `led` fixes that by judging a defender on whichever signal is
               stronger — it is symmetric, so it also rewards event-heavy /
               glass-light defenders (Manute Bol '86: stlBlkPct 0.97, rebPct
               0.19, +4 OVR).

               `defCredit` is the essential half. Ungated, `led` treats
               REBOUNDING VOLUME as proof of DEFENSE, which is only true for
               some players — it handed +4 to Kevin Love '14, Domantas Sabonis
               '24, Karl-Anthony Towns '25, Zach Randolph '11 and Carlos Boozer
               '03, and +5 to Josh Giddey '25, all high-rebound/low-defense
               players. But the formula already knew the difference: their
               hand-assigned defBase values are 31, 30, 32, 34 and 30, against
               Rodman 49, Bol 48, Oakley 44 and Laimbeer 42. So the human rating
               decides WHETHER a player may claim positioning defense, and the
               stats decide HOW MUCH. This is the hybrid philosophy applied
               exactly: hand ratings anchor, real stats modulate.

               Gating cut the blast radius from 55 players moving ≥3 OVR to 4,
               and every previously-validated reference case (Shaq '93 Magic,
               McGrady '04 Magic, Draymond Green '19, Robert Williams III '22,
               Dejounte Murray '22) is unchanged or moved by at most 1.]
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
offWeight = { PG: 0.60, SG: 0.575, SF: 0.55, PF: 0.525, C: 0.50 }
defWeight = 1 − offWeight
              [smooth gradient, not a hard cliff — PG leans offense hardest,
               C leans defense hardest, stepping evenly through SG/SF/PF.
               Replaces the old binary Guards-58/42-vs-everyone-else-55/45
               split, which treated an SF and a C identically despite very
               different defensive value profiles.]
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
1. ~~**Bill Laimbeer / Dennis Rodman vs Robert Williams III**~~ — **CLOSED in v37.**
   `defPct` now takes a defender's strongest signal (`led`) rather than forcing a
   fixed 60/40 event-weighted blend, gated on `defBase` so only players the hand
   rating already calls defenders may claim it. Rodman '96 80 → 86, Laimbeer '90
   71 → 73, Oakley '94 75 → 78, Manute Bol '86 58 → 62. See STEP 0 and the
   "Strongest-evidence defPct" section.
   *Residual limitation:* `rebPct` is a percentile and therefore saturates —
   Rodman's 14.9 RPG and Garnett's 13.9 both sit at ~1.00, so the formula still
   cannot express "historic outlier rebounder" as distinct from "best in the
   pool." Breaking that ceiling would need a non-percentile rebounding term and
   would touch every rebounder; not attempted.
2. **Harden's real-world defensive reputation**: the hand-anchored `defBase`
   is what catches this (not a computed term) — if `defBase` is ever revised
   for a player, that's the lever that matters most for "he doesn't really
   play D" cases.
3. **New players added to players.js need real OFF/DEF hand ratings**
   assigned before this formula works for them — same requirement as the old
   system.
4. **Shai Gilgeous-Alexander / very recent players reading as top-15
   all-time**: confirmed this is a hand-rating issue, not a formula bug —
   his OFF/DEF anchor is set at all-time-great level (48/36), and ANCHORED is
   ~80% of RAW, so the formula is correctly amplifying that rating. Left
   unresolved — no formula mechanism currently accounts for career-length/
   sample-size validation (a monster single season reads identically to a
   decade of sustained excellence). If this still bothers you, the fix is
   either (a) lower his hand rating, or (b) design a longevity-discount term
   — neither was implemented this session.

## Playoff/team-success data (added this session)
- All 967 player rows carry real `teamWins`, `teamLosses`, `playoffRound` for
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

By this point `compute_ovr.js` and `app/src/lib/formula.ts` were both live
copies of the same logic (kept in sync per the pairing note at the top of
`formula.ts`) — the note previously in this doc claiming the opponent-strength
work "never touched the live app" was stale.

## 5-way position groups (shipped this session)
Position groups went from 3 coarse buckets (Guards {PG,SG} / Wings {SF} /
Bigs {PF,C}) to 5 — PG, SG, SF, PF, C — each using its *own* primary position
as the bucket (no grouping at all). This affects two things:
- **STEP 0 defensive percentiles** (`stlBlkPct`, `rebPct`) are now ranked
  within each of the 5 positions separately, not within 3 broad buckets.
  Sample sizes stay healthy (143-199 players per position even after this
  split, so no small-sample noise).
- **STEP 4 offWeight/defWeight** is now a smooth gradient — `{PG: .60, SG:
  .575, SF: .55, PF: .525, C: .50}` — instead of a hard cliff between
  "Guard" (58/42) and "everyone else" (55/45). A PF and a C used to get
  treated identically despite very different defensive value profiles; now
  each position sits at its own point on the curve.

**Why:** the old 3-bucket split meant an SF and a C were weighted offense/
defense identically (both "not a Guard" → 55/45), even though centers are
meaningfully more defense-first than wings in how the game is actually
played. Grouping PG with SG also meant a play-making floor general and a
high-usage shooting guard shared one defensive percentile pool.

**Validation:** ran the sandbox before/after on the full 967-player dataset.
382/967 players (39%) moved, almost entirely by ±1-2 OVR (max ±3 anywhere in
the dataset), all in the expected direction — defense-heavy PFs and wings
(Rodman '90 Pistons +3, Draymond Green '17 Warriors +2, Karl Malone '93 Jazz
+2) gained, while offense-first centers who previously borrowed a PF-level
defWeight lost a touch (Jokic '22 Nuggets −2, Embiid '24 76ers −2, Patrick
Ewing '95 Knicks −2). Every previously-validated reference case (Shaq '93
Magic, McGrady '04 Magic, Dejounte Murray '22 Spurs, Draymond Green, Dennis
Rodman) moved by at most 1 point, no regressions.

### Full formula (post-change)
See the "Full formula" section above — STEP 0 and STEP 4 are the only steps
that changed this session; everything else (STEP 1-3, 5-9) is unchanged.

### Top 30 (by SCALED = OVR), post-change
```json
[
  { "name": "LeBron James", "eraTeam": "'13 Heat", "scaled": 100.5, "ovr": 100, "playoff": "CHAMPION" },
  { "name": "Michael Jordan", "eraTeam": "'91 Bulls", "scaled": 100.5, "ovr": 100, "playoff": "CHAMPION" },
  { "name": "Wilt Chamberlain", "eraTeam": "'67 76ers", "scaled": 100.4, "ovr": 100, "playoff": "CHAMPION" },
  { "name": "Michael Jordan", "eraTeam": "'96 Bulls", "scaled": 100.4, "ovr": 100, "playoff": "CHAMPION" },
  { "name": "Wilt Chamberlain", "eraTeam": "'64 Warriors", "scaled": 100.2, "ovr": 100, "playoff": "FINALS" },
  { "name": "Michael Jordan", "eraTeam": "'92 Bulls", "scaled": 100.1, "ovr": 100, "playoff": "CHAMPION" },
  { "name": "Stephen Curry", "eraTeam": "'16 Warriors", "scaled": 99.9, "ovr": 100, "playoff": "FINALS" },
  { "name": "Shaquille O'Neal", "eraTeam": "'00 Lakers", "scaled": 99.8, "ovr": 100, "playoff": "CHAMPION" },
  { "name": "LeBron James", "eraTeam": "'09 Cavs", "scaled": 99.7, "ovr": 100, "playoff": "CF" },
  { "name": "LeBron James", "eraTeam": "'18 Cavs", "scaled": 99.7, "ovr": 100, "playoff": "FINALS" },
  { "name": "Kevin Durant", "eraTeam": "'17 Warriors", "scaled": 99.5, "ovr": 99, "playoff": "CHAMPION" },
  { "name": "Shai Gilgeous-Alexander", "eraTeam": "'25 Thunder", "scaled": 99.2, "ovr": 99, "playoff": "CHAMPION" },
  { "name": "Hakeem Olajuwon", "eraTeam": "'94 Rockets", "scaled": 99.0, "ovr": 99, "playoff": "CHAMPION" },
  { "name": "Kareem Abdul-Jabbar", "eraTeam": "'80 Lakers", "scaled": 99.0, "ovr": 99, "playoff": "CHAMPION" },
  { "name": "Tim Duncan", "eraTeam": "'03 Spurs", "scaled": 99.0, "ovr": 99, "playoff": "CHAMPION" },
  { "name": "Larry Bird", "eraTeam": "'86 Celtics", "scaled": 99.0, "ovr": 99, "playoff": "CHAMPION" },
  { "name": "Shaquille O'Neal", "eraTeam": "'01 Lakers", "scaled": 98.9, "ovr": 99, "playoff": "CHAMPION" },
  { "name": "Giannis Antetokounmpo", "eraTeam": "'21 Bucks", "scaled": 98.8, "ovr": 99, "playoff": "CHAMPION" },
  { "name": "LeBron James", "eraTeam": "'16 Cavs", "scaled": 98.7, "ovr": 99, "playoff": "CHAMPION" },
  { "name": "Charles Barkley", "eraTeam": "'93 Suns", "scaled": 98.5, "ovr": 99, "playoff": "FINALS" },
  { "name": "Kevin Garnett", "eraTeam": "'04 Timberwolves", "scaled": 98.5, "ovr": 98, "playoff": "CF" },
  { "name": "Magic Johnson", "eraTeam": "'87 Lakers", "scaled": 98.2, "ovr": 98, "playoff": "CHAMPION" },
  { "name": "Kawhi Leonard", "eraTeam": "'19 Raptors", "scaled": 98.0, "ovr": 98, "playoff": "CHAMPION" },
  { "name": "Nikola Jokic", "eraTeam": "'23 Nuggets", "scaled": 97.8, "ovr": 98, "playoff": "CHAMPION" },
  { "name": "Bill Russell", "eraTeam": "'64 Celtics", "scaled": 97.8, "ovr": 98, "playoff": "CHAMPION" },
  { "name": "LeBron James", "eraTeam": "'07 Cavaliers", "scaled": 97.7, "ovr": 98, "playoff": "FINALS" },
  { "name": "Anthony Davis", "eraTeam": "'20 Lakers", "scaled": 97.5, "ovr": 98, "playoff": "CHAMPION" },
  { "name": "Kobe Bryant", "eraTeam": "'01 Lakers", "scaled": 97.5, "ovr": 97, "playoff": "CHAMPION" },
  { "name": "Kevin Durant", "eraTeam": "'14 Thunder", "scaled": 97.4, "ovr": 97, "playoff": "CF" },
  { "name": "Victor Wembanyama", "eraTeam": "'26 Spurs", "scaled": 97.3, "ovr": 97, "playoff": "FINALS" }
]
```

### Random 30 (by SCALED = OVR), post-change
```json
[
  { "name": "Stephen Curry", "eraTeam": "'16 Warriors", "scaled": 99.9, "ovr": 100, "playoff": "FINALS" },
  { "name": "Tim Duncan", "eraTeam": "'03 Spurs", "scaled": 99.0, "ovr": 99, "playoff": "CHAMPION" },
  { "name": "Clyde Drexler", "eraTeam": "'90 Blazers", "scaled": 94.7, "ovr": 95, "playoff": "FINALS" },
  { "name": "Julius Erving", "eraTeam": "'81 Sixers", "scaled": 94.6, "ovr": 95, "playoff": "CF" },
  { "name": "Shawn Kemp", "eraTeam": "'96 SuperSonics", "scaled": 94.5, "ovr": 95, "playoff": "FINALS" },
  { "name": "Chris Paul", "eraTeam": "'11 Hornets", "scaled": 91.0, "ovr": 91, "playoff": "R1" },
  { "name": "Paul Pierce", "eraTeam": "'08 Celtics", "scaled": 90.2, "ovr": 90, "playoff": "CHAMPION" },
  { "name": "Klay Thompson", "eraTeam": "'15 Warriors", "scaled": 87.1, "ovr": 87, "playoff": "CHAMPION" },
  { "name": "Jermaine O'Neal", "eraTeam": "'02 Pacers", "scaled": 85.5, "ovr": 86, "playoff": "R1" },
  { "name": "Joakim Noah", "eraTeam": "'14 Bulls", "scaled": 83.6, "ovr": 84, "playoff": "R1" },
  { "name": "Chauncey Billups", "eraTeam": "'04 Pistons", "scaled": 83.5, "ovr": 84, "playoff": "CHAMPION" },
  { "name": "Jrue Holiday", "eraTeam": "'22 Bucks", "scaled": 82.1, "ovr": 82, "playoff": "R2" },
  { "name": "Isaiah Thomas", "eraTeam": "'17 Celtics", "scaled": 82.0, "ovr": 82, "playoff": "CF" },
  { "name": "Carmelo Anthony", "eraTeam": "'07 Nuggets", "scaled": 80.6, "ovr": 81, "playoff": "R1" },
  { "name": "Joe Dumars", "eraTeam": "'89 Pistons", "scaled": 80.5, "ovr": 81, "playoff": "CHAMPION" },
  { "name": "Isaiah Hartenstein", "eraTeam": "'25 Thunder", "scaled": 80.5, "ovr": 80, "playoff": "CHAMPION" },
  { "name": "Joe Johnson", "eraTeam": "'09 Hawks", "scaled": 79.9, "ovr": 80, "playoff": "R2" },
  { "name": "Gordon Hayward", "eraTeam": "'17 Jazz", "scaled": 79.7, "ovr": 80, "playoff": "R2" },
  { "name": "Shai Gilgeous-Alexander", "eraTeam": "'20 Thunder", "scaled": 79.0, "ovr": 79, "playoff": "R1" },
  { "name": "Zach LaVine", "eraTeam": "'21 Bulls", "scaled": 78.4, "ovr": 78, "playoff": "MISSED" },
  { "name": "Brad Daugherty", "eraTeam": "'95 Cavaliers", "scaled": 77.2, "ovr": 77, "playoff": "R1" },
  { "name": "Brook Lopez", "eraTeam": "'21 Bucks", "scaled": 76.8, "ovr": 77, "playoff": "CHAMPION" },
  { "name": "Yao Ming", "eraTeam": "'05 Rockets", "scaled": 75.8, "ovr": 76, "playoff": "R1" },
  { "name": "Draymond Green", "eraTeam": "'19 Warriors", "scaled": 75.1, "ovr": 75, "playoff": "FINALS" },
  { "name": "Mikal Bridges", "eraTeam": "'21 Suns", "scaled": 72.9, "ovr": 73, "playoff": "FINALS" },
  { "name": "Boris Diaw", "eraTeam": "'07 Suns", "scaled": 71.6, "ovr": 72, "playoff": "R2" },
  { "name": "Richard Jefferson", "eraTeam": "'02 Nets", "scaled": 70.9, "ovr": 71, "playoff": "FINALS" },
  { "name": "Jaden McDaniels", "eraTeam": "'25 Timberwolves", "scaled": 70.1, "ovr": 70, "playoff": "CF" },
  { "name": "Tyrone Hill", "eraTeam": "'95 Cavaliers", "scaled": 70.1, "ovr": 70, "playoff": "R1" },
  { "name": "Kenny Smith", "eraTeam": "'94 Rockets", "scaled": 69.6, "ovr": 70, "playoff": "CHAMPION" }
]
```

## Strongest-evidence defPct (shipped this session — v37)

`defPct` no longer forces every defender through a fixed 60/40 STL+BLK/rebounding
blend. A player is now judged on whichever defensive signal is stronger, but only
in proportion to how high his hand-assigned `defBase` already is. See STEP 0 for
the full rationale.

**Why it was needed.** Rodman '96 sat at defPct 0.501 — below the 0.60 and 0.70
gates on `twoWay` and `defCombo` — so the best rebounder in the dataset earned
nothing from either defensive bonus.

**Biggest movers (975 players: 109 up, 60 down, 806 unchanged; only 4 move ≥3):**

| player | v36 | v37 | rpg | stl+blk | defBase |
|---|---:|---:|---:|---:|---:|
| Dennis Rodman '96 Bulls | 80 | **86** | 14.9 | 1.0 | 49 |
| Manute Bol '86 Bullets | 58 | **62** | 6.0 | 5.4 | 48 |
| Charles Oakley '94 Knicks | 75 | **78** | 11.7 | 1.5 | 44 |
| Ben Simmons '22 Nets | 55 | **58** | 6.9 | 0.0 | 42 |
| Michael Cooper '87 Lakers | 77 | 79 | 3.1 | 2.1 | 44 |
| Andrei Kirilenko '04 Jazz | 82 | 84 | 8.1 | 5.2 | 48 |
| Ron Artest '04 Pacers | 80 | 82 | 5.0 | 3.1 | 46 |
| Rudy Gobert '22 Jazz | 87 | 89 | 14.7 | 2.8 | 48 |
| Bill Laimbeer '90 Pistons | 71 | 73 | 9.4 | 1.0 | 42 |
| Serge Ibaka '12 Thunder | 79 | 81 | 7.5 | 4.5 | 44 |

Every gainer is a recognised defender. The fallers are all −1 and are all
offense-first guards who rebound well for their position (Westbrook '17, Harden
'21, Kyrie '24, Cade '25, Jamal Murray '23, Klay '17) — they lose nothing
absolute; everyone else's defense rose and they were the ones quietly collecting
defensive credit for rebounding volume.

**Reference-case regression check — all clean:**

| case | v36 | v37 |
|---|---:|---:|
| Shaquille O'Neal '93 Magic | 91 | 91 |
| Tracy McGrady '04 Magic | 88 | 88 |
| Draymond Green '19 Warriors | 75 | 75 |
| Robert Williams III '22 Celtics | 83 | 83 |
| Dejounte Murray '22 Spurs | 83 | 84 |
| Dennis Rodman '90 Pistons | 80 | 80 |

### Top 30 (by SCALED = OVR), v37
```json
[
  { "name": "LeBron James", "eraTeam": "'13 Heat", "scaled": 100.5, "ovr": 100, "playoff": "CHAMPION" },
  { "name": "Michael Jordan", "eraTeam": "'91 Bulls", "scaled": 100.5, "ovr": 100, "playoff": "CHAMPION" },
  { "name": "Wilt Chamberlain", "eraTeam": "'67 76ers", "scaled": 100.5, "ovr": 100, "playoff": "CHAMPION" },
  { "name": "Michael Jordan", "eraTeam": "'96 Bulls", "scaled": 100.4, "ovr": 100, "playoff": "CHAMPION" },
  { "name": "Wilt Chamberlain", "eraTeam": "'64 Warriors", "scaled": 100.2, "ovr": 100, "playoff": "FINALS" },
  { "name": "Michael Jordan", "eraTeam": "'92 Bulls", "scaled": 100.1, "ovr": 100, "playoff": "CHAMPION" },
  { "name": "Stephen Curry", "eraTeam": "'16 Warriors", "scaled": 99.9, "ovr": 100, "playoff": "FINALS" },
  { "name": "Shaquille O'Neal", "eraTeam": "'00 Lakers", "scaled": 99.8, "ovr": 100, "playoff": "CHAMPION" },
  { "name": "LeBron James", "eraTeam": "'18 Cavs", "scaled": 99.8, "ovr": 100, "playoff": "FINALS" },
  { "name": "LeBron James", "eraTeam": "'09 Cavs", "scaled": 99.7, "ovr": 100, "playoff": "CF" },
  { "name": "Kevin Durant", "eraTeam": "'17 Warriors", "scaled": 99.5, "ovr": 99, "playoff": "CHAMPION" },
  { "name": "Kareem Abdul-Jabbar", "eraTeam": "'80 Lakers", "scaled": 99.2, "ovr": 99, "playoff": "CHAMPION" },
  { "name": "Hakeem Olajuwon", "eraTeam": "'94 Rockets", "scaled": 99.1, "ovr": 99, "playoff": "CHAMPION" },
  { "name": "Shai Gilgeous-Alexander", "eraTeam": "'25 Thunder", "scaled": 99.1, "ovr": 99, "playoff": "CHAMPION" },
  { "name": "Giannis Antetokounmpo", "eraTeam": "'21 Bucks", "scaled": 99.1, "ovr": 99, "playoff": "CHAMPION" },
  { "name": "Larry Bird", "eraTeam": "'86 Celtics", "scaled": 99.1, "ovr": 99, "playoff": "CHAMPION" },
  { "name": "Tim Duncan", "eraTeam": "'03 Spurs", "scaled": 99.0, "ovr": 99, "playoff": "CHAMPION" },
  { "name": "Shaquille O'Neal", "eraTeam": "'01 Lakers", "scaled": 99.0, "ovr": 99, "playoff": "CHAMPION" },
  { "name": "LeBron James", "eraTeam": "'16 Cavs", "scaled": 98.9, "ovr": 99, "playoff": "CHAMPION" },
  { "name": "Charles Barkley", "eraTeam": "'93 Suns", "scaled": 98.7, "ovr": 99, "playoff": "FINALS" },
  { "name": "Kevin Garnett", "eraTeam": "'04 Timberwolves", "scaled": 98.5, "ovr": 98, "playoff": "CF" },
  { "name": "Magic Johnson", "eraTeam": "'87 Lakers", "scaled": 98.2, "ovr": 98, "playoff": "CHAMPION" },
  { "name": "Kawhi Leonard", "eraTeam": "'19 Raptors", "scaled": 98.1, "ovr": 98, "playoff": "CHAMPION" },
  { "name": "Nikola Jokic", "eraTeam": "'23 Nuggets", "scaled": 98.0, "ovr": 98, "playoff": "CHAMPION" },
  { "name": "Elgin Baylor", "eraTeam": "'62 Lakers", "scaled": 97.9, "ovr": 98, "playoff": "FINALS" },
  { "name": "Anthony Davis", "eraTeam": "'20 Lakers", "scaled": 97.9, "ovr": 98, "playoff": "CHAMPION" },
  { "name": "Bill Russell", "eraTeam": "'64 Celtics", "scaled": 97.8, "ovr": 98, "playoff": "CHAMPION" },
  { "name": "LeBron James", "eraTeam": "'07 Cavaliers", "scaled": 97.7, "ovr": 98, "playoff": "FINALS" },
  { "name": "Victor Wembanyama", "eraTeam": "'26 Spurs", "scaled": 97.6, "ovr": 98, "playoff": "FINALS" },
  { "name": "Hakeem Olajuwon", "eraTeam": "'86 Rockets", "scaled": 97.5, "ovr": 98, "playoff": "FINALS" }
]
```

### Random 30 (by SCALED = OVR), v37
```json
[
  { "name": "Luka Doncic", "eraTeam": "'24 Mavericks", "scaled": 97.3, "ovr": 97, "playoff": "FINALS" },
  { "name": "LeBron James", "eraTeam": "'20 Lakers", "scaled": 95.9, "ovr": 96, "playoff": "CHAMPION" },
  { "name": "Allen Iverson", "eraTeam": "'01 76ers", "scaled": 93.8, "ovr": 94, "playoff": "FINALS" },
  { "name": "Bob McAdoo", "eraTeam": "'75 Braves", "scaled": 88.5, "ovr": 89, "playoff": "R2" },
  { "name": "John Stockton", "eraTeam": "'91 Jazz", "scaled": 88.1, "ovr": 88, "playoff": "CF" },
  { "name": "Jason Kidd", "eraTeam": "'02 Nets", "scaled": 88.0, "ovr": 88, "playoff": "FINALS" },
  { "name": "Patrick Ewing", "eraTeam": "'97 Knicks", "scaled": 86.1, "ovr": 86, "playoff": "R2" },
  { "name": "Kyrie Irving", "eraTeam": "'15 Cavaliers", "scaled": 86.1, "ovr": 86, "playoff": "FINALS" },
  { "name": "Shawn Marion", "eraTeam": "'11 Mavericks", "scaled": 85.2, "ovr": 85, "playoff": "CHAMPION" },
  { "name": "Dennis Johnson", "eraTeam": "'86 Celtics", "scaled": 85.2, "ovr": 85, "playoff": "CHAMPION" },
  { "name": "Chet Holmgren", "eraTeam": "'25 Thunder", "scaled": 83.4, "ovr": 83, "playoff": "CHAMPION" },
  { "name": "Jrue Holiday", "eraTeam": "'24 Celtics", "scaled": 82.9, "ovr": 83, "playoff": "CHAMPION" },
  { "name": "Baron Davis", "eraTeam": "'03 Hornets", "scaled": 81.1, "ovr": 81, "playoff": "R1" },
  { "name": "Wes Unseld", "eraTeam": "'78 Bullets", "scaled": 79.0, "ovr": 79, "playoff": "CHAMPION" },
  { "name": "Darius Garland", "eraTeam": "'25 Cavs", "scaled": 76.3, "ovr": 76, "playoff": "CF" },
  { "name": "Al Horford", "eraTeam": "'13 Hawks", "scaled": 73.1, "ovr": 73, "playoff": "R1" },
  { "name": "VJ Edgecombe", "eraTeam": "'26 76ers", "scaled": 71.9, "ovr": 72, "playoff": "R2" },
  { "name": "Mike Bibby", "eraTeam": "'02 Kings", "scaled": 70.2, "ovr": 70, "playoff": "R2" },
  { "name": "Marvin Williams", "eraTeam": "'09 Hawks", "scaled": 67.4, "ovr": 67, "playoff": "R2" },
  { "name": "De'Andre Hunter", "eraTeam": "'25 Cavs", "scaled": 67.2, "ovr": 67, "playoff": "CF" },
  { "name": "Keith Van Horn", "eraTeam": "'03 Sixers", "scaled": 66.8, "ovr": 67, "playoff": "R2" },
  { "name": "Jalen Green", "eraTeam": "'24 Rockets", "scaled": 66.8, "ovr": 67, "playoff": "MISSED" },
  { "name": "Delonte West", "eraTeam": "'09 Cavaliers", "scaled": 66.7, "ovr": 67, "playoff": "CF" },
  { "name": "Jameer Nelson", "eraTeam": "'11 Magic", "scaled": 64.7, "ovr": 65, "playoff": "R1" },
  { "name": "Matt Barnes", "eraTeam": "'07 Warriors", "scaled": 61.8, "ovr": 62, "playoff": "R2" },
  { "name": "Greg Monroe", "eraTeam": "'17 Bucks", "scaled": 58.9, "ovr": 59, "playoff": "R1" },
  { "name": "Glen Davis", "eraTeam": "'10 Celtics", "scaled": 56.1, "ovr": 56, "playoff": "FINALS" },
  { "name": "Joe Smith", "eraTeam": "'97 Timberwolves", "scaled": 55.3, "ovr": 55, "playoff": "R1" },
  { "name": "Frank Johnson", "eraTeam": "'93 Suns", "scaled": 50.1, "ovr": 50, "playoff": "FINALS" },
  { "name": "Kirk Snyder", "eraTeam": "'07 Jazz", "scaled": 41.9, "ovr": 42, "playoff": "CF" }
]
```

## Era-relative rebounding + rebounding outlier (shipped this session — v38)

### Why era-relative rebounding was needed

Real league-average team rebounds per game (Basketball-Reference, NBA League
Averages / Per Game), and the resulting normalization factor against a 2010s base:

| decade | seasons | TRB/team/game | factor |
|---|---:|---:|---:|
| 1960s | 16 | 65.56 | ×0.650 |
| 1970s | 20 | 48.65 | ×0.875 |
| 1980s | 20 | 43.54 | ×0.978 |
| 1990s | 20 | 41.45 | ×1.028 |
| 2000s | 20 | 41.76 | ×1.020 |
| 2010s | 20 | 42.59 | ×1.000 |
| 2020s | 14 | 43.36 | ×0.982 |

These are REFERENCE CONSTANTS, deliberately not derived from this dataset. A
dataset-derived mean is invalid for the early decades: the 1960s bucket here is
five all-time greats, so normalizing against it defines Wilt and Russell as
average — a first attempt did exactly that and scaled Wilt's 24.2 RPG to 6.6,
which is nonsense. The 1990s were the LOWEST-rebounding era in the data, so
1990s boards are slightly harder-earned than they look (Rodman 14.9 → 15.3).

### Why the outlier term was needed

`rebPct` saturates. Rodman '96 and Garnett '04 both sit at ~1.00 despite a full
rebound per game between them. The outlier term reads absolute era-adjusted
boards against a league-wide 97th-percentile bar (12.38 era-adjusted RPG), so
"historic" can exist as a category distinct from "best in the pool."

Reading ERA-ADJUSTED boards is what keeps the 1960s out of it: Elgin Baylor's
18.6 becomes **12.1**, below the bar, so he collects nothing. An earlier version
measured against a PER-POSITION bar and was abandoned — because centers all
rebound, the C bar sat at 13.6 while the SG bar sat at 5.4, so Josh Hart (9.4
RPG) scored a bigger "outlier" than Rodman while Mutombo, Wembanyama, Hakeem and
Mark Eaton all LOST ground on a rebounding term. Position-relative was the wrong
frame; historic rebounding is historic regardless of position, and `rebPct`
already handles "unusual for your spot."

### Movers, v36 → v38 (cumulative, includes v37)

| player | v36 | v38 | note |
|---|---:|---:|---|
| Dennis Rodman '96 Bulls | 80 | **89** | +6 from v37, +3 from v38 |
| Rudy Gobert '22 Jazz | 87 | **91** | 14.7 RPG, defBase 48 |
| Charles Oakley '94 Knicks | 75 | **79** | |
| Manute Bol '86 Bullets | 58 | **62** | event-led side of `led` |
| DeAndre Jordan '15 Clippers | 81 | **84** | |
| Andre Drummond '19 Pistons | 81 | **84** | |
| Dave Cowens '74 Celtics | 90 | 92 | |
| Bill Laimbeer '90 Pistons | 71 | 73 | |
| Elgin Baylor '62 Lakers | 97 | 96 | hand-rating correction, not the formula |
| David Thompson '77 Nuggets | 83 | 81 | era-adjusted down |

### Reference-case regression check — all clean

| case | v36 | v38 |
|---|---:|---:|
| Wilt Chamberlain '67 76ers | 100 | 100 |
| Bill Russell '64 Celtics | 98 | 98 |
| Shaquille O'Neal '93 Magic | 91 | 92 |
| Tracy McGrady '04 Magic | 88 | 88 |
| Draymond Green '19 Warriors | 75 | 75 |
| Robert Williams III '22 Celtics | 83 | 83 |

Wilt and Russell are unchanged: their era-adjusted 15.7 RPG still tops every
position pool, so the clamp costs them nothing.

### Top 30 (by SCALED = OVR), v38

```json
[
  { "name": "LeBron James", "eraTeam": "'13 Heat", "scaled": 100.5, "ovr": 100, "playoff": "CHAMPION" },
  { "name": "Michael Jordan", "eraTeam": "'91 Bulls", "scaled": 100.5, "ovr": 100, "playoff": "CHAMPION" },
  { "name": "Wilt Chamberlain", "eraTeam": "'67 76ers", "scaled": 100.5, "ovr": 100, "playoff": "CHAMPION" },
  { "name": "Michael Jordan", "eraTeam": "'96 Bulls", "scaled": 100.4, "ovr": 100, "playoff": "CHAMPION" },
  { "name": "Wilt Chamberlain", "eraTeam": "'64 Warriors", "scaled": 100.2, "ovr": 100, "playoff": "FINALS" },
  { "name": "Shaquille O'Neal", "eraTeam": "'00 Lakers", "scaled": 100.2, "ovr": 100, "playoff": "CHAMPION" },
  { "name": "Michael Jordan", "eraTeam": "'92 Bulls", "scaled": 100.1, "ovr": 100, "playoff": "CHAMPION" },
  { "name": "Stephen Curry", "eraTeam": "'16 Warriors", "scaled": 99.9, "ovr": 100, "playoff": "FINALS" },
  { "name": "LeBron James", "eraTeam": "'18 Cavs", "scaled": 99.8, "ovr": 100, "playoff": "FINALS" },
  { "name": "LeBron James", "eraTeam": "'09 Cavs", "scaled": 99.7, "ovr": 100, "playoff": "CF" },
  { "name": "Kevin Durant", "eraTeam": "'17 Warriors", "scaled": 99.5, "ovr": 99, "playoff": "CHAMPION" },
  { "name": "Shaquille O'Neal", "eraTeam": "'01 Lakers", "scaled": 99.3, "ovr": 99, "playoff": "CHAMPION" },
  { "name": "Tim Duncan", "eraTeam": "'03 Spurs", "scaled": 99.2, "ovr": 99, "playoff": "CHAMPION" },
  { "name": "Hakeem Olajuwon", "eraTeam": "'94 Rockets", "scaled": 99.2, "ovr": 99, "playoff": "CHAMPION" },
  { "name": "Kareem Abdul-Jabbar", "eraTeam": "'80 Lakers", "scaled": 99.1, "ovr": 99, "playoff": "CHAMPION" },
  { "name": "Shai Gilgeous-Alexander", "eraTeam": "'25 Thunder", "scaled": 99.1, "ovr": 99, "playoff": "CHAMPION" },
  { "name": "Larry Bird", "eraTeam": "'86 Celtics", "scaled": 99.1, "ovr": 99, "playoff": "CHAMPION" },
  { "name": "Giannis Antetokounmpo", "eraTeam": "'21 Bucks", "scaled": 99.0, "ovr": 99, "playoff": "CHAMPION" },
  { "name": "LeBron James", "eraTeam": "'16 Cavs", "scaled": 99.0, "ovr": 99, "playoff": "CHAMPION" },
  { "name": "Charles Barkley", "eraTeam": "'93 Suns", "scaled": 98.9, "ovr": 99, "playoff": "FINALS" },
  { "name": "Kevin Garnett", "eraTeam": "'04 Timberwolves", "scaled": 98.6, "ovr": 99, "playoff": "CF" },
  { "name": "Magic Johnson", "eraTeam": "'87 Lakers", "scaled": 98.2, "ovr": 98, "playoff": "CHAMPION" },
  { "name": "Kawhi Leonard", "eraTeam": "'19 Raptors", "scaled": 98.2, "ovr": 98, "playoff": "CHAMPION" },
  { "name": "Dwight Howard", "eraTeam": "'09 Magic", "scaled": 98.1, "ovr": 98, "playoff": "FINALS" },
  { "name": "Nikola Jokic", "eraTeam": "'23 Nuggets", "scaled": 98.0, "ovr": 98, "playoff": "CHAMPION" },
  { "name": "Bill Russell", "eraTeam": "'64 Celtics", "scaled": 97.8, "ovr": 98, "playoff": "CHAMPION" },
  { "name": "Anthony Davis", "eraTeam": "'20 Lakers", "scaled": 97.8, "ovr": 98, "playoff": "CHAMPION" },
  { "name": "LeBron James", "eraTeam": "'07 Cavaliers", "scaled": 97.7, "ovr": 98, "playoff": "FINALS" },
  { "name": "Moses Malone", "eraTeam": "'83 Sixers", "scaled": 97.5, "ovr": 98, "playoff": "CHAMPION" },
  { "name": "Victor Wembanyama", "eraTeam": "'26 Spurs", "scaled": 97.5, "ovr": 97, "playoff": "FINALS" }
]
```

### Random 30 (by SCALED = OVR), v38

```json
[
  { "name": "Luka Doncic", "eraTeam": "'24 Mavericks", "scaled": 97.3, "ovr": 97, "playoff": "FINALS" },
  { "name": "LeBron James", "eraTeam": "'20 Lakers", "scaled": 95.9, "ovr": 96, "playoff": "CHAMPION" },
  { "name": "Allen Iverson", "eraTeam": "'01 76ers", "scaled": 93.8, "ovr": 94, "playoff": "FINALS" },
  { "name": "John Stockton", "eraTeam": "'91 Jazz", "scaled": 88.1, "ovr": 88, "playoff": "CF" },
  { "name": "Jason Kidd", "eraTeam": "'02 Nets", "scaled": 88.0, "ovr": 88, "playoff": "FINALS" },
  { "name": "Bob McAdoo", "eraTeam": "'75 Braves", "scaled": 87.9, "ovr": 88, "playoff": "R2" },
  { "name": "Patrick Ewing", "eraTeam": "'97 Knicks", "scaled": 86.3, "ovr": 86, "playoff": "R2" },
  { "name": "Kyrie Irving", "eraTeam": "'15 Cavaliers", "scaled": 86.0, "ovr": 86, "playoff": "FINALS" },
  { "name": "Shawn Marion", "eraTeam": "'11 Mavericks", "scaled": 85.0, "ovr": 85, "playoff": "CHAMPION" },
  { "name": "Dennis Johnson", "eraTeam": "'86 Celtics", "scaled": 84.9, "ovr": 85, "playoff": "CHAMPION" },
  { "name": "Chet Holmgren", "eraTeam": "'25 Thunder", "scaled": 83.2, "ovr": 83, "playoff": "CHAMPION" },
  { "name": "Jrue Holiday", "eraTeam": "'24 Celtics", "scaled": 82.8, "ovr": 83, "playoff": "CHAMPION" },
  { "name": "Baron Davis", "eraTeam": "'03 Hornets", "scaled": 81.1, "ovr": 81, "playoff": "R1" },
  { "name": "Wes Unseld", "eraTeam": "'78 Bullets", "scaled": 77.2, "ovr": 77, "playoff": "CHAMPION" },
  { "name": "Darius Garland", "eraTeam": "'25 Cavs", "scaled": 76.2, "ovr": 76, "playoff": "CF" },
  { "name": "Al Horford", "eraTeam": "'13 Hawks", "scaled": 73.0, "ovr": 73, "playoff": "R1" },
  { "name": "VJ Edgecombe", "eraTeam": "'26 76ers", "scaled": 71.8, "ovr": 72, "playoff": "R2" },
  { "name": "Mike Bibby", "eraTeam": "'02 Kings", "scaled": 70.3, "ovr": 70, "playoff": "R2" },
  { "name": "Marvin Williams", "eraTeam": "'09 Hawks", "scaled": 67.6, "ovr": 68, "playoff": "R2" },
  { "name": "De'Andre Hunter", "eraTeam": "'25 Cavs", "scaled": 67.1, "ovr": 67, "playoff": "CF" },
  { "name": "Keith Van Horn", "eraTeam": "'03 Sixers", "scaled": 66.9, "ovr": 67, "playoff": "R2" },
  { "name": "Delonte West", "eraTeam": "'09 Cavaliers", "scaled": 66.7, "ovr": 67, "playoff": "CF" },
  { "name": "Jalen Green", "eraTeam": "'24 Rockets", "scaled": 66.6, "ovr": 67, "playoff": "MISSED" },
  { "name": "Jameer Nelson", "eraTeam": "'11 Magic", "scaled": 64.6, "ovr": 65, "playoff": "R1" },
  { "name": "Matt Barnes", "eraTeam": "'07 Warriors", "scaled": 61.9, "ovr": 62, "playoff": "R2" },
  { "name": "Greg Monroe", "eraTeam": "'17 Bucks", "scaled": 58.9, "ovr": 59, "playoff": "R1" },
  { "name": "Glen Davis", "eraTeam": "'10 Celtics", "scaled": 56.1, "ovr": 56, "playoff": "FINALS" },
  { "name": "Joe Smith", "eraTeam": "'97 Timberwolves", "scaled": 55.4, "ovr": 55, "playoff": "R1" },
  { "name": "Frank Johnson", "eraTeam": "'93 Suns", "scaled": 50.1, "ovr": 50, "playoff": "FINALS" },
  { "name": "Kirk Snyder", "eraTeam": "'07 Jazz", "scaled": 42.0, "ovr": 42, "playoff": "CF" }
]
```

## Suggested next steps for a future session
- Position groups are now 5-way (PG/SG/SF/PF/C) — see "5-way position groups"
  above. `compute_ovr.js` (sandbox) and `app/src/lib/formula.ts` (live app)
  are both current and in sync as of this change.
- The `stl`/`blk`/`mpg`/`teamWins`/`teamLosses`/`playoffRound`/opponent data
  is real, researched data — safe to build from without re-sourcing.
- Still open: career-length/longevity discount (SGA-type recent-season
  inflation, see "Known open items" #4) and the Laimbeer/Rodman positioning-
  defense gap (#1) — neither has a concrete design yet.
