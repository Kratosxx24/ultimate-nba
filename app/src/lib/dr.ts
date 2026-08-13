// DOMINANCE RATING (DR) + projected record.
//
// DR asks "how good are these five on paper, right now."
// The record asks "what would a real 82-game season with this five look like."
// They are deliberately SEPARATE, hand-tuned curves over the same inputs, and the
// asymmetry between them is load-bearing: a structural flaw (no rim protection, no
// shot creation, badly overlapping usage) costs a possession here and there on
// paper, but over 82 games it compounds. So the record formula is ~2x harsher on
// every shared term. A roster CAN post a high DR and a pedestrian record — that's
// the intended read, not a bug. If you tune either curve, preserve the gap.
//
// Validated against the 42 real five-man units in the dataset (teams with 5+
// player-seasons present), normalised to an 82-game pace:
//   MAE 5.17 wins · corr 0.654 · 55% within 5 wins · 79% within 10
//
// Honest limits, worth knowing before trusting a number:
//   • n=42. Every fit-side term is inside noise at that sample size. The fit layer
//     is a design choice, not an empirically validated one — it moves DR by ~1
//     point at most (sd ~1.1 against talent's ~8.7).
//   • A team's real record is not a function of its starting five (bench, coaching,
//     health, conference), which caps how well ANY five-man model can do. corr
//     tops out near 0.65 for that reason, not because the curve is badly fitted.

import type { Player } from '../types/player';
import {
  coverageDrDelta,
  coverageWinDelta,
  elasticity,
  playerFunctionProfile,
  teamFriction,
  teamFunctionProfile,
  type FnKey,
} from './playerFunctions';

// ── legality ────────────────────────────────────────────────────────────────
// A lineup is five players filling PG/SG/SF/PF/C, one each, using only the
// positions that player is actually listed at. No adjacency, no stretch. Two
// players listed C-only cannot coexist — that group cannot take the floor, so it
// is not a lineup and does not get a rating.

export const SLOTS = ['PG', 'SG', 'SF', 'PF', 'C'] as const;
export type Slot = (typeof SLOTS)[number];

export const slotsOf = (p: Player): Slot[] =>
  p.pos.split('/').filter((s): s is Slot => (SLOTS as readonly string[]).includes(s));

/** Perfect matching of five players onto the five slots, or null if impossible. */
export function assignSlots(five: Player[]): Record<Slot, Player> | null {
  if (five.length !== 5) return null;
  const elig = five.map((p) => slotsOf(p).map((s) => SLOTS.indexOf(s)));
  const out: (Player | null)[] = [null, null, null, null, null];
  const used = [false, false, false, false, false];
  const go = (i: number): boolean => {
    if (i === 5) return true;
    for (const s of elig[i]) {
      if (used[s]) continue;
      used[s] = true;
      out[s] = five[i];
      if (go(i + 1)) return true;
      used[s] = false;
      out[s] = null;
    }
    return false;
  };
  if (!go(0)) return null;
  return Object.fromEntries(SLOTS.map((s, i) => [s, out[i]!])) as Record<Slot, Player>;
}

export const isLegalLineup = (five: Player[]) => assignSlots(five) !== null;

// ── talent ──────────────────────────────────────────────────────────────────

const TALENT_P = 8;

/**
 * Power mean of the five OVRs, p=8. NOT a flat average — superstar impact is convex.
 * A mean said Jordan+Pippen (100/95/80/70/70 -> 83.0) was worth LESS than five good
 * Pistons (89/84/84/82/79 -> 83.4). Sweeping p against the 42 real fives peaks at
 * p=8 on BOTH regular-season wins (r .589) and playoff round reached (r .598);
 * beyond that it declines, and p -> infinity is just max(), i.e. "your best player
 * IS your team."
 */
export const talentIndex = (five: Player[]) =>
  Math.pow(five.reduce((s, p) => s + Math.pow(p.SCALED, TALENT_P), 0) / five.length, 1 / TALENT_P);

let championEras: Set<string> | null = null;
function champDna(five: Player[], pool: Player[]) {
  if (!championEras) championEras = new Set(pool.filter((p) => p.playoffRound === 'CHAMPION').map((p) => p.eraTeam));
  const counts: Record<string, number> = {};
  five.forEach((p) => { if (championEras!.has(p.eraTeam)) counts[p.eraTeam] = (counts[p.eraTeam] ?? 0) + 1; });
  let win = 0, dr = 0;
  for (const n of Object.values(counts)) {
    if (n === 2) { win += 1; dr += 0.6; }
    else if (n === 3) { win += 2; dr += 1.2; }
    else if (n === 4) { win += 4; dr += 2; }
    else if (n >= 5) { win += 4; dr += 5; }
  }
  return { win, dr };
}

const sumOff = (f: Player[]) => f.reduce((s, p) => s + p.offBase, 0);
const sumDef = (f: Player[]) => f.reduce((s, p) => s + p.defBase, 0);

// ── touch economy ───────────────────────────────────────────────────────────
// Five players on the floor share 100% of the possessions, so a lineup's usages
// are renormalised to what a real five actually totals, and each player's OFFENSIVE
// production is re-run at that reallocated usage. Confidence, defense and team
// context are untouched — those describe the season actually played.
//
// The loss is then scaled by (1 - elasticity): a star who thrives off the ball
// barely feels the squeeze. That is the whole point. Curry/Klay/Durant/Dirk/Russell
// total 136 usage and pay ~0.25%; Westbrook/Harden/Dončić/Trae/Iverson total 178 and
// pay ~5.4%. A flat usage cap cannot tell those apart.

const TARGET_USG_SUM = 103; // median total usage across the 42 real elite fives
const TS_K = 0.45, TS_SAT = 6;
const OFF_WEIGHT: Record<string, number> = { PG: 0.6, SG: 0.575, SF: 0.55, PF: 0.525, C: 0.5 };

/** Usage-efficiency tradeoff: doing less makes you more efficient, saturating. */
const tsShift = (d: number) => Math.sign(d) * TS_SAT * (1 - Math.exp((-Math.abs(d) * TS_K) / TS_SAT));

/** The offensive half of the OVR formula, re-evaluated at a hypothetical usage. */
function offenceAt(p: Player, usg: number): number {
  const ts = p.ts + tsShift(p.usg - usg);
  const c = p.conf;
  const r = ts / p.eraAvgTs;
  const tsMod = r > 1 ? 1 + (Math.pow(r, 0.35) - 1) * c : Math.pow(r, 0.35);
  const capped = Math.min(usg, p.usg); // no free bonus for volume never actually proven
  return (
    p.offBase * tsMod * Math.pow(capped / 22, 0.3) * (0.55 + 0.45 * c) * OFF_WEIGHT[p.posGroup] * 1.35 +
    Math.pow(Math.max(0, (capped / 22) * Math.pow(ts / 55, 2) - 1), 1.6) * 1.2 * c +
    Math.log(1 + Math.max(0, p.tsPctEra - 0.85) * 100) * 1.3 * (0.5 + 0.5 * c) * Math.min(1, usg / 20)
  );
}

/** % of the lineup's raw production lost to sharing the ball, elasticity-weighted. */
export function touchEconomyPct(five: Player[]): number {
  const sum = five.reduce((s, p) => s + p.usg, 0);
  if (sum <= 0) return 0;
  const k = TARGET_USG_SUM / sum;
  const lost = five.reduce((s, p) => s + (offenceAt(p, p.usg * k) - offenceAt(p, p.usg)) * (1 - elasticity(p)), 0);
  const total = five.reduce((s, p) => s + p.RAW, 0);
  return total > 0 ? (100 * lost) / total : 0;
}

// ── the two numbers ─────────────────────────────────────────────────────────

export function calcDR(five: Player[], pool: Player[]): number {
  if (!isLegalLineup(five)) return 0;
  let dr = 50 + (talentIndex(five) * 2.5 - 155) * 0.55;
  dr += Math.min(1.9, Math.max(0, (sumDef(five) - 200) * 0.075));
  dr += Math.min(1.9, Math.max(0, (sumOff(five) - 195) * 0.075));
  dr -= Math.min(5, Math.max(0, (170 - sumDef(five)) * 0.22));
  dr += champDna(five, pool).dr;
  dr += coverageDrDelta(five);
  dr -= 2 * teamFriction(five);
  dr += touchEconomyPct(five) * 0.35;
  // NOTE: no "balance" term. `0.75 - |Soff-Sdef|/40` used to live here; its
  // correlation with the post-talent residual measured -0.006 (i.e. nothing), and it
  // was anti-predictive at the tails — it docked the '96 Bulls (72-10) hardest, for
  // Soff 182 / Sdef 235, when that team led the league in offensive rating. Soff is a
  // sum of individual scoring ratings, so it reads CONCENTRATED offense as "lopsided",
  // fighting the convex talent index directly.

  // Smooth asymptote toward 100 rather than a ramp. With ~1000 seasons and 20 of them
  // at OVR 100, the old `86 + overage*0.65` let a dozen different superteams pin at
  // exactly 100.0 — no separation where the game is most interesting.
  if (dr > 86) dr = 100 - 14 * Math.exp(-(dr - 86) / 14);
  return Math.max(20, Math.min(99.9, dr));
}

export function projectWins(five: Player[], pool: Player[]): number {
  if (!isLegalLineup(five)) return 0;
  let w = 15.0 + ((talentIndex(five) * 2.5 - 145) / 60) * 40;
  w += champDna(five, pool).win;
  w -= Math.min(11, Math.max(0, (170 - sumDef(five)) * 0.5));
  if (sumDef(five) >= 215) w += 2;
  if (sumOff(five) >= 195) w += 2;
  w += coverageWinDelta(five);
  w -= 5 * teamFriction(five); // ~2.5x the DR weighting, per the deliberate asymmetry
  w += touchEconomyPct(five) * 0.9; // ditto — the squeeze compounds over a season
  if (w > 60) w = 82 - 22 * Math.exp(-(w - 60) / 22);
  return Math.max(0, Math.min(81.9, w));
}

export const projectRecord = (five: Player[], pool: Player[]) => {
  const w = Math.round(projectWins(five, pool));
  return { wins: w, losses: 82 - w, label: `${w}-${82 - w}` };
};

// ── readout ─────────────────────────────────────────────────────────────────

export const FUNCTION_LABEL: Record<FnKey, string> = {
  rimProtect: 'rim protection',
  perimeterD: 'point-of-attack D',
  rebound: 'the glass',
  shotCreate: 'shot creation',
  spacing: 'floor spacing',
  playmake: 'playmaking',
  finish: 'finishing',
  ballDominance: 'ball dominance',
};

const READOUT_KEYS: FnKey[] = ['rimProtect', 'perimeterD', 'rebound', 'shotCreate', 'spacing', 'playmake', 'finish'];

export interface LineupReadout {
  rows: { key: FnKey; label: string; value: number; providers: number }[];
  strengths: { key: FnKey; label: string; value: number; providers: number }[];
  weaknesses: { key: FnKey; label: string; value: number; providers: number }[];
  thin: { key: FnKey; label: string; value: number; providers: number }[];
  deadSpots: { nonShooters: number; huntable: number };
  friction: number;
}

export function lineupReadout(five: Player[]): LineupReadout {
  const tp = teamFunctionProfile(five);
  const rows = READOUT_KEYS.map((key) => ({
    key, label: FUNCTION_LABEL[key], value: tp.best[key].value, providers: tp.providers[key],
  }));
  const profs = five.map(playerFunctionProfile);
  return {
    rows,
    // Ranked by DEPTH, not peak: with five players drawn from ~1000, SOMEBODY is near
    // 10 at any single skill, so peak value saturates and stops discriminating.
    strengths: rows.filter((r) => r.providers >= 2 && r.value >= 8).sort((a, b) => b.providers - a.providers || b.value - a.value),
    weaknesses: rows.filter((r) => r.value < 5).sort((a, b) => a.value - b.value),
    thin: rows.filter((r) => r.value >= 5 && r.value < 7).sort((a, b) => a.value - b.value),
    // Descriptive only, never scored: 10 of the 42 real elite fives carry 2+
    // non-shooters, including the '96 Bulls and '00 Lakers. Penalising it would dock
    // two of the best teams ever, and it's era-bound (1980s 0.0/five, 1990s 1.5).
    deadSpots: {
      nonShooters: profs.filter((x) => x.spacing <= 3).length,
      huntable: profs.filter((x) => x.perimeterD <= 4).length,
    },
    friction: teamFriction(five),
  };
}

/** Per-player usage squeeze, for the "Westbrook 41% -> 24%" line. Display only. */
export function usageSqueeze(five: Player[]) {
  const TARGET = 103; // median total usage across the 42 real elite fives
  const sum = five.reduce((s, p) => s + p.usg, 0);
  const k = sum > 0 ? TARGET / sum : 1;
  return five.map((p) => ({
    player: p,
    native: p.usg,
    adjusted: p.usg * k,
    elasticity: elasticity(p),
    // an elastic star barely feels the squeeze; an inelastic one loses real value
    strain: Math.max(0, p.usg - p.usg * k) * (1 - elasticity(p)),
  }));
}
