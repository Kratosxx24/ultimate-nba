import type { PlayoffRound, RawPlayer } from '../types/player';

// Mirrors the column order documented in FORMULA.md / players.js's header comment.
export function parsePlayersCsv(csv: string): RawPlayer[] {
  return csv
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const p = line.split(',');
      return {
        eraTeam: p[0],
        name: p[1],
        pos: p[2],
        cost: +p[3],
        ppg: +p[4],
        rpg: +p[5],
        apg: +p[6],
        usg: +p[7],
        ts: +p[8],
        ws48: +p[9],
        offBase: +p[10],
        defBase: +p[11],
        archetype: p[12],
        teamKey: p[13],
        stl: +p[14],
        blk: +p[15],
        teamWins: +p[16],
        teamLosses: +p[17],
        playoffRound: p[18] as PlayoffRound,
        mpg: +p[19],
      };
    });
}
