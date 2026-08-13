import playersCsv from '../data/players.csv?raw';
import playoffOpponentsJson from '../data/playoffOpponents.json';
import { parsePlayersCsv } from './parsePlayers';
import { computePlayers } from './formula';
import type { OpponentSeries, Player } from '../types/player';

const playoffOpponents = playoffOpponentsJson as Record<string, OpponentSeries[]>;

let cached: Player[] | null = null;

/** All 969 players with the full formula (OVR, SCALED, every intermediate term) applied. */
export function getAllPlayers(): Player[] {
  if (!cached) {
    const raw = parsePlayersCsv(playersCsv);
    cached = computePlayers(raw, playoffOpponents).sort((a, b) => b.SCALED - a.SCALED);
  }
  return cached;
}

export function getPlayerById(id: string): Player | undefined {
  return getAllPlayers().find((p) => p.id === id);
}

/** Distinct player names, for name-based lookups/search (a name can span multiple eraTeams). */
export function getAllNames(): string[] {
  return [...new Set(getAllPlayers().map((p) => p.name))].sort();
}

export function getSeasonsForName(name: string): Player[] {
  return getAllPlayers()
    .filter((p) => p.name === name)
    .sort((a, b) => b.SCALED - a.SCALED);
}
