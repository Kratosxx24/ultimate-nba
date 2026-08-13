// Reference: ../../../FORMULA.md (v35 — opponent playoff strength era).
// This is a straight TypeScript port of ../../../compute_ovr.js — keep the two in sync.
// Every formula change should land in compute_ovr.js first (it's the fast CLI sandbox
// for testing formula tweaks), then get mirrored here.

import type { OpponentSeries, Player, PosGroup, RawPlayer } from '../types/player';

function yearOf(eraTeam: string): number {
  const match = eraTeam.match(/'(\d+)/);
  const yr = match ? parseInt(match[1], 10) : 0;
  return yr < 30 ? 2000 + yr : 1900 + yr;
}

function posGroup(pos: string): PosGroup {
  const primary = pos.split('/')[0];
  if (primary === 'PG' || primary === 'SG') return 'G';
  if (primary === 'SF') return 'W';
  return 'B'; // PF, C
}

function percentileRank(arr: number[], val: number): number {
  const sorted = [...arr].sort((a, b) => a - b);
  let count = 0;
  for (const v of sorted) if (v <= val) count++;
  return count / sorted.length;
}

const ROUND_SCORE: Record<string, number> = {
  MISSED: -4.0,
  R1: -0.04,
  R2: 0.97,
  CF: 2.78,
  FINALS: 8.5,
  CHAMPION: 10.0,
  IN_PROGRESS: 0,
};

const ROUND_WEIGHT: Record<string, number> = { R1: 1.0, R2: 1.5, CF: 2.0, FINALS: 2.5 };
const OPP_EXP = 2.5;
const OPP_MULT = 45;
const OPP_CAP = 3.5;

function roundKey(r: string): keyof typeof ROUND_WEIGHT {
  const u = r.toUpperCase();
  if (u.includes('FINAL') && !u.includes('CONF')) return 'FINALS';
  if (u.includes('CF') || (u.includes('CONF') && u.includes('FINAL'))) return 'CF';
  if (u.includes('R2') || u.includes('SEMI')) return 'R2';
  return 'R1';
}

const ERA_AVG_TS: Record<number, number> = {
  1960: 55.4,
  1970: 53.6,
  1980: 55.3,
  1990: 55.2,
  2000: 53.8,
  2010: 55.6,
  2020: 58.8,
};

interface OppStrengthResult {
  strength: number; // weighted avg opponent win% (display/diagnostic)
  mod: number; // exponential-curve modifier actually used in the formula
}

function computeOppStrengthByTeam(
  playoffOpponents: Record<string, OpponentSeries[]>,
): Record<string, OppStrengthResult> {
  const out: Record<string, OppStrengthResult> = {};
  for (const [eraTeam, series] of Object.entries(playoffOpponents)) {
    let wSum = 0;
    let wTot = 0;
    let expSum = 0;
    for (const s of series) {
      const total = s.opponentWins + s.opponentLosses;
      const pct = total > 0 ? s.opponentWins / total : 0.5;
      const wt = ROUND_WEIGHT[roundKey(s.round)] ?? 1.0;
      const diff = pct - 0.5;
      const expVal = Math.sign(diff) * Math.pow(Math.abs(diff), OPP_EXP);
      wSum += pct * wt;
      expSum += expVal * wt;
      wTot += wt;
    }
    out[eraTeam] = {
      strength: wTot > 0 ? wSum / wTot : 0.5,
      mod: wTot > 0 ? Math.max(-OPP_CAP, Math.min(OPP_CAP, (expSum / wTot) * OPP_MULT)) : 0,
    };
  }
  return out;
}

/**
 * Runs the full formula (STEP 0 through STEP 9) over the whole roster at once —
 * several terms (percentile ranks, era TS averages, top/bottom RAW for SCALED)
 * are dataset-relative, so this can't be done per-player in isolation.
 */
export function computePlayers(
  rawPlayers: RawPlayer[],
  playoffOpponents: Record<string, OpponentSeries[]>,
): Player[] {
  const oppStrengthByTeam = computeOppStrengthByTeam(playoffOpponents);

  // STEP 0 — preprocessing
  const groups: Record<PosGroup, RawPlayer[]> = { G: [], W: [], B: [] };
  rawPlayers.forEach((p) => groups[posGroup(p.pos)].push(p));

  const stlBlkPctOf = new Map<RawPlayer, number>();
  const rebPctOf = new Map<RawPlayer, number>();
  const defPctOf = new Map<RawPlayer, number>();
  rawPlayers.forEach((p) => {
    const g = groups[posGroup(p.pos)];
    const stlBlkPct = percentileRank(
      g.map((x) => x.stl + x.blk),
      p.stl + p.blk,
    );
    const rebPct = percentileRank(
      g.map((x) => x.rpg),
      p.rpg,
    );
    stlBlkPctOf.set(p, stlBlkPct);
    rebPctOf.set(p, rebPct);
    defPctOf.set(p, stlBlkPct * 0.6 + rebPct * 0.4);
  });

  const decadeBuckets: Record<number, RawPlayer[]> = {};
  rawPlayers.forEach((p) => {
    const decade = Math.floor(yearOf(p.eraTeam) / 10) * 10;
    (decadeBuckets[decade] ||= []).push(p);
  });
  const tsPctEraOf = new Map<RawPlayer, number>();
  const eraAvgTsOf = new Map<RawPlayer, number>();
  rawPlayers.forEach((p) => {
    const decade = Math.floor(yearOf(p.eraTeam) / 10) * 10;
    const bucket = decadeBuckets[decade];
    tsPctEraOf.set(
      p,
      percentileRank(
        bucket.map((x) => x.ts),
        p.ts,
      ),
    );
    eraAvgTsOf.set(
      p,
      ERA_AVG_TS[decade] !== undefined
        ? ERA_AVG_TS[decade]
        : bucket.reduce((s, x) => s + x.ts, 0) / bucket.length,
    );
  });

  const partial = rawPlayers.map((p) => {
    const defPct = defPctOf.get(p)!;
    const tsPctEra = tsPctEraOf.get(p)!;
    const eraAvgTs = eraAvgTsOf.get(p)!;

    // STEP 1 — confidence
    const usgConf = 1 / (1 + Math.exp(-0.5 * (p.usg - 17)));
    const ppgConf = 1 / (1 + Math.exp(-0.3 * (p.ppg - 9)));
    const mpgConf = 1 / (1 + Math.exp(-0.35 * (p.mpg - 20)));
    const conf = Math.max(usgConf, mpgConf * 0.85) * Math.max(ppgConf, mpgConf);

    // STEP 2 — offense
    const tsRatio = p.ts / eraAvgTs;
    const tsMod =
      tsRatio > 1 ? 1 + (Math.pow(tsRatio, 0.35) - 1) * conf : Math.pow(tsRatio, 0.35);
    const usageMod = Math.pow(p.usg / 22, 0.3);
    const offScore = p.offBase * tsMod * usageMod * (0.55 + 0.45 * conf);

    // STEP 3 — defense
    const rebMod = 0.85 + Math.min(0.3, p.rpg / 40);
    const activityMod = 0.8 + defPct * 0.4;
    const anchoredDef = p.defBase * rebMod * activityMod;
    const pureDefScore = defPct * 40 + Math.min(10, p.rpg * 0.5);
    const defScore = anchoredDef * 0.6 + pureDefScore * 0.4;

    // STEP 4 — anchor combine
    const g = posGroup(p.pos);
    const offWeight = g === 'G' ? 0.58 : 0.55;
    const defWeight = g === 'G' ? 0.42 : 0.45;
    const ANCHORED = (offScore * offWeight + defScore * defWeight) * 1.35;

    // STEP 5 — WS/48 overlay
    const delta = p.ws48 - 0.1;
    const wsTerm = Math.sign(delta) * Math.pow(Math.abs(delta * 40), 1.08) * conf;

    // STEP 6 — IGB
    const usageNorm = p.usg / 22;
    const effNorm = p.ts / 55;
    const effCombo =
      Math.pow(Math.max(0, usageNorm * effNorm * effNorm - 1), 1.6) * 1.2 * conf;
    const defCombo = Math.max(0, defPct - 0.7) * 8;
    const volumeDampener = Math.min(1, p.usg / 20);
    const gravityBonus =
      Math.log(1 + Math.max(0, tsPctEra - 0.85) * 100) * 1.3 * (0.5 + 0.5 * conf) * volumeDampener;
    const astBonus = Math.log(1 + p.apg) * 1.15;
    const IGB = effCombo + defCombo + gravityBonus + astBonus;

    // STEP 6.5 — team success
    const winPct = p.teamWins / (p.teamWins + p.teamLosses);
    const rs = ROUND_SCORE[p.playoffRound] ?? 0;
    const winPctTerm = (winPct - 0.5) * 6;

    // STEP 6.5.5 — opponent playoff strength (exponential; playoff teams only)
    const oppEntry = oppStrengthByTeam[p.eraTeam];
    const oppStrength = oppEntry ? oppEntry.strength : null;
    const oppStrengthMod = oppEntry ? oppEntry.mod : 0;

    const teamRaw = winPctTerm + rs + oppStrengthMod;
    const teamTerm = teamRaw * (0.4 + 0.6 * conf);

    // STEP 6.6 — two-way impact
    const twoWay = (Math.log(1 + p.apg) * 1.5 + Math.max(0, defPct - 0.6) * 10) * mpgConf;

    // STEP 7 — final RAW
    const RAW = Math.max(1, ANCHORED + wsTerm + IGB + teamTerm + twoWay);

    return {
      ...p,
      id: `${p.eraTeam}::${p.name}`,
      posGroup: g,
      stlBlkPct: stlBlkPctOf.get(p)!,
      rebPct: rebPctOf.get(p)!,
      defPct,
      tsPctEra,
      eraAvgTs,
      conf,
      usgConf,
      ppgConf,
      mpgConf,
      offScore,
      defScore,
      ANCHORED,
      wsTerm,
      IGB,
      winPct,
      winPctTerm,
      roundTerm: rs,
      oppStrength,
      oppStrengthMod,
      teamRaw,
      teamTerm,
      twoWay,
      RAW,
    };
  });

  // STEP 8 — SCALED
  const raws = partial.map((p) => p.RAW);
  const maxRaw = Math.max(...raws);
  const minRaw = Math.min(...raws);
  const C = (100.5 - 25) / Math.pow(maxRaw - minRaw, 1.9);

  // STEP 9 — OVR = round(SCALED), capped at 100
  return partial.map((p) => {
    const D = maxRaw - p.RAW;
    const SCALED = 100.5 - C * Math.pow(D, 1.9);
    const OVR = Math.min(100, Math.round(SCALED));
    return { ...p, SCALED, OVR };
  });
}
