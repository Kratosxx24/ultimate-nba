import type { Player } from '../types/player';

export const LINEUP_SIZE = 5;

/** A lineup slot is either empty or holds one player-season. */
export type LineupSlot = Player | null;

export function emptyLineup(size: number = LINEUP_SIZE): LineupSlot[] {
  return Array.from({ length: size }, () => null);
}

export interface LineupSummary {
  filledCount: number;
  avgOvr: number;
  totalCost: number;
  avgOff: number;
  avgDef: number;
  avgPpg: number;
  avgRpg: number;
  avgApg: number;
  bestPlayer: Player | null;
}

export function summarizeLineup(slots: LineupSlot[]): LineupSummary {
  const players = slots.filter((p): p is Player => p !== null);
  const n = players.length;

  const avg = (fn: (p: Player) => number) => (n === 0 ? 0 : players.reduce((s, p) => s + fn(p), 0) / n);

  const bestPlayer = players.reduce<Player | null>((best, p) => {
    if (!best || p.OVR > best.OVR) return p;
    return best;
  }, null);

  return {
    filledCount: n,
    avgOvr: avg((p) => p.OVR),
    totalCost: players.reduce((s, p) => s + p.cost, 0),
    avgOff: avg((p) => p.offBase),
    avgDef: avg((p) => p.defBase),
    avgPpg: avg((p) => p.ppg),
    avgRpg: avg((p) => p.rpg),
    avgApg: avg((p) => p.apg),
    bestPlayer,
  };
}

/** Picks `count` distinct random players from `pool`, honoring an optional exclusion set. */
export function randomPlayers(pool: Player[], count: number, excludeIds: Set<string> = new Set()): Player[] {
  const eligible = pool.filter((p) => !excludeIds.has(p.id));
  const picked: Player[] = [];
  const used = new Set<string>();
  while (picked.length < count && used.size < eligible.length) {
    const candidate = eligible[Math.floor(Math.random() * eligible.length)];
    if (used.has(candidate.id)) continue;
    used.add(candidate.id);
    picked.push(candidate);
  }
  return picked;
}
