// The 8-function player model that Dominance Rating reads.
//
// Ported from the prior NBA Lineup Builder's scouting-knowledge.js. The idea: an
// archetype label gives a baseline of what a player PROVIDES across eight
// functions, then that player's real stats nudge it, then curated basketball
// knowledge corrects the cases a box score gets wrong. The data half lives in
// ./functionData.ts (generated).
//
// Two things this exists to solve that raw stats cannot:
//   1. SPACING. TS% is a terrible proxy — Rim Runners have the HIGHEST mean TS in
//      the dataset (61.1) and are the least floor-stretching archetype, because
//      their TS is dunk rate. Hence RIM_TS_ARCHETYPES and KNOWN_NON_SHOOTERS.
//   2. BALL DOMINANCE / ELASTICITY. "Can this star scale down off the ball?" is
//      what separates a Curry + Klay + Durant stack (frictionless) from a
//      Westbrook + Harden + Dončić stack (not), at identical total usage.

import type { Player } from '../types/player';
import {
  ARCH_ZONE,
  ARCHETYPE_FALLBACK,
  ARCHETYPE_FUNCTIONS,
  GENERATIONAL_RIM_PROTECTORS,
  KNOWN_NON_SHOOTERS,
  ONBALL_MAESTROS,
  OFFBALL_STARS,
  PLAYER_FUNCTION_OVERRIDES,
  PLAYERS_META,
  PLAYERS_VOICE,
  RIM_TS_ARCHETYPES,
  TEAM_FUNCTIONS,
  ZONE_COLLISION,
  type FnKey,
  type FnProfile,
  type UsageZone,
} from './functionData';

export type { FnKey, FnProfile, UsageZone };
export { TEAM_FUNCTIONS };

const clamp10 = (x: number) => Math.max(0, Math.min(10, x));
/** ~0.7 at (avg - spread), ~1.3 at (avg + spread), clamped. */
const scaleAroundAvg = (val: number, avg: number, spread: number) =>
  Math.max(0.6, Math.min(1.4, 1 + ((val - avg) / spread) * 0.3));

const keyOf = (p: Player) => `${p.name}|${p.eraTeam}`;
const isFrontcourt = (p: Player) => p.pos.split('/').some((x) => x === 'PF' || x === 'C');

/** Season-specific meta wins over the bare-name default, matching the source precedence. */
function metaOf(p: Player) {
  return { ...(PLAYERS_META[p.name] ?? {}), ...(PLAYERS_META[keyOf(p)] ?? {}) };
}
function voiceOf(p: Player) {
  return { ...(PLAYERS_VOICE[p.name] ?? {}), ...(PLAYERS_VOICE[keyOf(p)] ?? {}) };
}
const hasFlag = (p: Player, flag: string) => Boolean(voiceOf(p).flags?.[flag]);

const profileCache = new Map<string, FnProfile>();

/** The 0-10 profile across all eight functions for one player-season. */
export function playerFunctionProfile(p: Player): FnProfile {
  const cached = profileCache.get(p.id);
  if (cached) return cached;

  const base = ARCHETYPE_FUNCTIONS[p.archetype] ?? ARCHETYPE_FALLBACK;
  const prof = { ...base } as FnProfile;

  // Stat-driven nudges — archetype shape dominates, real stats separate players.
  const offF = scaleAroundAvg(p.offBase, 35.5, 12);
  const defF = scaleAroundAvg(p.defBase, 35, 12);
  const usgF = scaleAroundAvg(p.usg, 21, 9);
  prof.shotCreate = clamp10(prof.shotCreate * offF);
  prof.finish = clamp10(prof.finish * offF);
  prof.spacing = clamp10(prof.spacing * (0.5 + offF * 0.5)); // spacing is less stat-sensitive
  prof.rimProtect = clamp10(prof.rimProtect * defF);
  prof.perimeterD = clamp10(prof.perimeterD * defF);
  prof.rebound = clamp10(prof.rebound * (0.6 + defF * 0.4));
  prof.ballDominance = clamp10(prof.ballDominance * usgF);
  // playmake is left archetype-driven here; the APG floor below carries the real signal.

  // TS-based spacing FLOOR. Gated three ways, because TS only proxies shooting for
  // players who actually shoot: skip the rim/post archetypes (TS = dunk rate), skip
  // any frontcourt player under 18 usage (a 13-usage centre at 70 TS is a finisher),
  // and skip the curated non-shooter list.
  const tsProxiesShooting =
    !RIM_TS_ARCHETYPES.includes(p.archetype) &&
    !KNOWN_NON_SHOOTERS.includes(p.name) &&
    !(isFrontcourt(p) && p.usg < 18);
  if (tsProxiesShooting) {
    let floor = 0;
    if (p.ts >= 60) floor = 8;
    else if (p.ts >= 58) floor = 7;
    else if (p.ts >= 56) floor = 6;
    else if (p.ts >= 54) floor = 5;
    if (floor > prof.spacing) prof.spacing = floor;
  }

  // RPG-based rebound floor, position-relative — a guard's rebounding means something
  // very different from a centre's. Lifts genuinely elite crashers whose archetype
  // label is offense-first (Pippen '96, Durant '17, Draymond '17 all read ~2/10 without it).
  // NOTE: this buckets on the RAW `pos` string, not posGroup — so a multi-position
  // player ("SG/PG") lands in 'big' and gets no guard floor. That is faithful to the
  // source and load-bearing: changing it moves 42 players (Austin Reaves '25 rebound
  // 1.9 -> 5.0, for one). Left as-is rather than silently 'improved' during the port.
  const group = ['PG', 'SG'].includes(p.pos) ? 'guard' : p.pos === 'SF' ? 'wing' : 'big';
  let rebFloor = 0;
  if (group === 'guard') {
    if (p.rpg >= 8) rebFloor = 8;
    else if (p.rpg >= 6.5) rebFloor = 7;
    else if (p.rpg >= 5) rebFloor = 6;
    else if (p.rpg >= 4) rebFloor = 5;
  } else if (group === 'wing') {
    if (p.rpg >= 9) rebFloor = 9;
    else if (p.rpg >= 7.5) rebFloor = 8;
    else if (p.rpg >= 6) rebFloor = 7;
    else if (p.rpg >= 4.5) rebFloor = 6;
  } else {
    if (p.rpg >= 13) rebFloor = 10;
    else if (p.rpg >= 11) rebFloor = 9;
    else if (p.rpg >= 9) rebFloor = 8;
    else if (p.rpg >= 7) rebFloor = 7;
    else if (p.rpg >= 5) rebFloor = 6;
  }
  if (rebFloor > prof.rebound) prof.rebound = rebFloor;

  // ...and the downward arm, frontcourt only: if the archetype claims glass control
  // and the player never got a rebound, believe the rebounds. ("Enforcer" sets 9 for
  // everyone, which rated Royce White at 0.8 rpg as a 7+ rebounder.)
  if (isFrontcourt(p)) {
    let ceil: number | null = null;
    if (p.rpg < 4) ceil = 4;
    else if (p.rpg < 6) ceil = 6;
    else if (p.rpg < 8) ceil = 8;
    if (ceil !== null && prof.rebound > ceil) prof.rebound = ceil;
  }

  // APG-based playmake floor. Assists are the cleanest signal in the row —
  // position-neutral, no proxy problem, no era adjustment needed.
  let astFloor = 0;
  if (p.apg >= 9) astFloor = 9;
  else if (p.apg >= 7.5) astFloor = 8;
  else if (p.apg >= 6) astFloor = 7;
  else if (p.apg >= 4.5) astFloor = 6;
  else if (p.apg >= 3) astFloor = 4;
  if (astFloor > prof.playmake) prof.playmake = astFloor;

  // Position-gated rim-protection floor: the guard archetypes hardcode rimProtect 0-1,
  // which is wrong for the frontcourt players wearing those tags (Marc Gasol as a
  // "Floor General" read as a ZERO rim protector).
  if (isFrontcourt(p)) {
    let rpFloor = 0;
    if (p.defBase >= 45) rpFloor = 7;
    else if (p.defBase >= 40) rpFloor = 5;
    else if (p.defBase >= 25) rpFloor = 2;
    if (rpFloor > prof.rimProtect) prof.rimProtect = rpFloor;
  }

  // Meta-driven defensive correction — archetype labels are the player's PRIMARY
  // (usually offensive) role, so two-way stars tagged "Elite Shot Creator" (Kawhi,
  // prime Kobe) read as poor defenders. Lean toward meta, it's reality the label can't see.
  const md = metaOf(p);
  if (typeof md.perimeterDef === 'number') prof.perimeterD = clamp10(prof.perimeterD * 0.4 + md.perimeterDef * 0.6);
  if (typeof md.shotBlocking === 'number') prof.rimProtect = clamp10(prof.rimProtect * 0.4 + md.shotBlocking * 0.6);

  // Explicit overrides get the final word: legacy table first, then voice.
  const ovr = PLAYER_FUNCTION_OVERRIDES[keyOf(p)];
  if (ovr) for (const k of Object.keys(ovr) as FnKey[]) prof[k] = ovr[k]!;
  const vo = voiceOf(p).overrides;
  if (vo) for (const k of Object.keys(vo) as FnKey[]) if (TEAM_FUNCTIONS.includes(k)) prof[k] = vo[k]!;

  // Category truth: an all-time paint anchor should never read as a weak rim protector
  // just because his archetype weights offense.
  if (GENERATIONAL_RIM_PROTECTORS.includes(p.name) && prof.rimProtect < 9) prof.rimProtect = 9;

  // TS-based shotCreate ceiling — high-usage creation at league-average-or-worse
  // efficiency is empty volume, not creation under duress. Never lowers a genuinely
  // elite, efficient creator.
  const CREATE_ARCH = ['Elite Shot Creator', 'Shot Creator', 'Heliocentric Playmaker', 'Generational Playmaker', 'Elite Playmaker'];
  if (p.usg >= 20 && CREATE_ARCH.includes(p.archetype)) {
    let scCeil: number | null = null;
    if (p.ts < 50) scCeil = 6;
    else if (p.ts < 53) scCeil = 7;
    else if (p.ts < 56) scCeil = 8;
    if (scCeil !== null && prof.shotCreate > scCeil) prof.shotCreate = scCeil;
  }

  for (const k of TEAM_FUNCTIONS) prof[k] = Math.round(prof[k] * 10) / 10;
  profileCache.set(p.id, prof);
  return prof;
}

// ── ball-usage modelling ─────────────────────────────────────────────────────
// "Ball-dominant" is a spectrum, not a flag. ELASTICITY is how gracefully a player
// scales down off the ball; USAGE ZONE is WHERE his usage happens. Two ball-needy
// stars in different zones barely clash (Shaq posts, Kobe works the wing); two in
// the same zone is the real friction.

export function usageZone(p: Player): UsageZone {
  // Voice only — PLAYERS_META also carries a usageZone but the source never reads it
  // here, and honouring it would shift 43 players. Fallback keys off the raw `pos`.
  const v = voiceOf(p);
  if (v.usageZone) return v.usageZone;
  const z = ARCH_ZONE[p.archetype];
  if (z) return z;
  if (p.pos === 'C') return 'post';
  if (p.pos === 'PG') return 'onball';
  return 'wing';
}

/** 0-1. Higher = loses less when someone else has the ball. */
export function elasticity(p: Player): number {
  const v = voiceOf(p);
  if (typeof v.elasticity === 'number') return Math.max(0, Math.min(1, v.elasticity));
  // deliberately NOT reading PLAYERS_META.elasticity — the source doesn't
  const prof = playerFunctionProfile(p);
  const zone = usageZone(p);
  let e = ({ offball: 0.9, post: 0.65, wing: 0.6, onball: 0.4 } as Record<UsageZone, number>)[zone] ?? 0.6;
  e -= Math.max(0, prof.ballDominance - 6) * 0.05; // needing the rock drags it down
  e += Math.max(0, prof.spacing - 6) * 0.04; // a real catch-and-shoot threat scales down easily
  e += (p.ts - 56) * 0.004;
  if (hasFlag(p, 'noOffball')) e = Math.min(e, 0.35);
  return Math.max(0.15, Math.min(1, e));
}

const zoneCollision = (a: UsageZone, b: UsageZone) => ZONE_COLLISION[[a, b].sort().join('|')] ?? 0.3;

/** 0-1. Two players clash when BOTH are ball-needy AND their zones overlap. */
export function pairFriction(a: Player, b: Player): number {
  const neediness = (1 - elasticity(a)) * (1 - elasticity(b)); // only high if BOTH are rigid
  return neediness * zoneCollision(usageZone(a), usageZone(b));
}

/**
 * Lineup friction, 0-1. Asymptotic rather than hard-capped: a flat `min(1, sum)`
 * pinned BOTH the '19 Raptors (a real Finals team) and a degenerate five-alpha
 * stack at exactly 1.00, leaving no headroom between them.
 */
export function teamFriction(five: Player[]): number {
  let total = 0;
  for (let i = 0; i < five.length; i++)
    for (let j = i + 1; j < five.length; j++) {
      const f = pairFriction(five[i], five[j]);
      if (f > 0.12) total += f; // ignore trivial overlaps
    }
  return 1 - Math.exp(-total * 0.55);
}

// ── team-level reads ─────────────────────────────────────────────────────────

export interface TeamFunctionProfile {
  profiles: { player: Player; prof: FnProfile }[];
  best: Record<FnKey, { value: number; player: Player | null }>;
  providers: Record<FnKey, number>;
}

export function teamFunctionProfile(five: Player[]): TeamFunctionProfile {
  const profiles = five.map((player) => ({ player, prof: playerFunctionProfile(player) }));
  const best = {} as TeamFunctionProfile['best'];
  const providers = {} as TeamFunctionProfile['providers'];
  for (const k of TEAM_FUNCTIONS) {
    let bv = -1;
    let bp: Player | null = null;
    let n = 0;
    for (const { player, prof } of profiles) {
      if (prof[k] > bv) { bv = prof[k]; bp = player; }
      if (prof[k] >= 6) n++; // "credible provider" threshold
    }
    best[k] = { value: bv, player: bp };
    providers[k] = n;
  }
  return { profiles, best, providers };
}

// ballDominance is deliberately excluded from coverage — that's a usage/friction
// concern owned by teamFriction, not a skill you need someone to cover.
const COVERAGE_FUNCTIONS: FnKey[] = ['rimProtect', 'perimeterD', 'rebound', 'shotCreate', 'spacing', 'playmake', 'finish'];

function coverage(five: Player[], eliteBonus: number, holeSteps: number[], lo: number, hi: number): number {
  const tp = teamFunctionProfile(five);
  let bonus = 0;
  let holes = 0;
  for (const k of COVERAGE_FUNCTIONS) {
    const v = tp.best[k].value;
    if (v >= 7.5) bonus += eliteBonus;
    else if (v < 3) holes++; // nobody on the floor can do this at all
  }
  let penalty = 0;
  for (let i = 0; i < holeSteps.length; i++) if (holes >= i + 1) penalty += holeSteps[i];
  return Math.max(lo, Math.min(hi, bonus - penalty));
}

/** Gentle version — DR is a talent snapshot. */
export const coverageDrDelta = (five: Player[]) => coverage(five, 0.15, [0.6, 1.2, 2.0], -3, 1.5);
/** ~2x harsher — a real hole gets exploited every night across 82 games. */
export const coverageWinDelta = (five: Player[]) => coverage(five, 0.3, [1.5, 2.0, 2.5], -6, 3);

export interface NamedSynergy { key: string; icon: string; name: string; text: string; players: Player[]; }

/**
 * The six named synergies, detected off what players actually DO rather than off
 * archetype-string matching (which missed the '17 Hamptons Five entirely).
 * Display only — these are NOT in the DR or record maths: measured against the
 * post-talent residual across 41 real teams they came out WRONG-SIGNED (-0.153),
 * so they earn their place as badges, not as points.
 */
export function namedSynergies(five: Player[]): NamedSynergy[] {
  const tp = teamFunctionProfile(five);
  const countAtLeast = (k: FnKey, t: number) => tp.profiles.filter((x) => x.prof[k] >= t).length;
  const topAtLeast = (k: FnKey, t: number, n: number) =>
    tp.profiles.filter((x) => x.prof[k] >= t).sort((a, b) => b.prof[k] - a.prof[k]).slice(0, n).map((x) => x.player);
  const bestOf = (k: FnKey) => tp.best[k].value;
  const bestPlayerOf = (k: FnKey) => tp.best[k].player!;
  const out: NamedSynergy[] = [];

  // Thresholds were tuned against random-draft fire rates, not guessed: with five
  // players drawn from ~1000, SOMEONE is near 10 at any single skill, so a naive
  // "best >= high number" test is not rare on its own.
  if (bestOf('shotCreate') >= 9.8 && countAtLeast('spacing', 7) >= 3)
    out.push({ key: 'heliocentricSpacing', icon: '☀️', name: 'Heliocentric Spacing',
      text: 'Elite shot-creator surrounded by kick-out shooters.',
      players: [bestPlayerOf('shotCreate'), ...topAtLeast('spacing', 8, 3)] });

  if (bestOf('shotCreate') >= 10 && bestOf('rebound') >= 9.5)
    out.push({ key: 'midrangeGrit', icon: '📐', name: 'Midrange Grit',
      text: 'Isolation scoring backed by physical rebounding.',
      players: [bestPlayerOf('shotCreate'), bestPlayerOf('rebound')] });

  const bigs = five.filter((p) => ['PF', 'C'].includes(p.posGroup)).map(playerFunctionProfile);
  if (bigs.filter((b) => b.rimProtect >= 8.5).length >= 2)
    out.push({ key: 'twinTowers', icon: '🗼', name: 'Twin Towers',
      text: 'Massive interior presence suppressing opponents.',
      players: five.filter((p) => ['PF', 'C'].includes(p.posGroup) && playerFunctionProfile(p).rimProtect >= 8.5) });

  if (countAtLeast('spacing', 7) >= 3 && bestOf('playmake') >= 8.5)
    out.push({ key: 'paceAndSpace', icon: '🎯', name: 'Pace & Space',
      text: 'Constant ball movement and elite floor spacing.',
      players: [...topAtLeast('spacing', 7.5, 3), bestPlayerOf('playmake')] });

  if (bestOf('spacing') >= 9.0) {
    const anchors = tp.profiles.filter((x) => x.prof.rimProtect >= 8 || x.prof.perimeterD >= 9).map((x) => x.player);
    if (anchors.length >= 2)
      out.push({ key: 'splashZone', icon: '🌊', name: 'Splash Zone',
        text: "A gravity shooter plus real defensive infrastructure — opponents can't sag off the perimeter AND protect the rim.",
        players: [bestPlayerOf('spacing'), ...anchors] });
  }
  return out;
}

/** Higher = better suited to playing without the ball. Fixes "LeBron is the off-ball weapon". */
export function offBallFitness(p: Player): number {
  const prof = playerFunctionProfile(p);
  const last = p.name.split(' ').slice(-1)[0];
  let score = 0;
  if (OFFBALL_STARS.includes(last) || OFFBALL_STARS.includes(p.name)) score += 6;
  if (ONBALL_MAESTROS.includes(last) || ONBALL_MAESTROS.includes(p.name)) score -= 6;
  score += (prof.spacing - 5) * 0.8;
  score += (p.ts - 56) * 0.15;
  score -= (prof.ballDominance - 6) * 0.9;
  if (hasFlag(p, 'noOffball')) score -= 100;
  return score;
}
