export type PosGroup = 'PG' | 'SG' | 'SF' | 'PF' | 'C';

export type PlayoffRound =
  | 'MISSED'
  | 'R1'
  | 'R2'
  | 'CF'
  | 'FINALS'
  | 'CHAMPION'
  | 'IN_PROGRESS';

// Raw row straight out of players.csv, before any formula math runs.
export interface RawPlayer {
  eraTeam: string;
  name: string;
  pos: string;
  cost: number;
  ppg: number;
  rpg: number;
  apg: number;
  usg: number;
  ts: number;
  ws48: number;
  offBase: number;
  defBase: number;
  archetype: string;
  teamKey: string;
  stl: number;
  blk: number;
  teamWins: number;
  teamLosses: number;
  playoffRound: PlayoffRound;
  mpg: number;
}

export interface OpponentSeries {
  round: string;
  opponent: string;
  opponentWins: number;
  opponentLosses: number;
  result: string;
}

// A fully-computed player: every intermediate formula term is kept around
// (not just OVR) so the UI can show breakdowns without recomputing.
export interface Player extends RawPlayer {
  id: string; // `${eraTeam}::${name}`, stable key for lists/roulette

  posGroup: PosGroup;
  stlBlkPct: number;
  rebPct: number;
  defPct: number;
  tsPctEra: number;
  eraAvgTs: number;

  conf: number;
  usgConf: number;
  ppgConf: number;
  mpgConf: number;

  offScore: number;
  defScore: number;
  ANCHORED: number;

  wsTerm: number;

  IGB: number;

  winPct: number;
  winPctTerm: number;
  roundTerm: number;
  oppStrength: number | null;
  oppStrengthMod: number;
  teamRaw: number;
  teamTerm: number;

  twoWay: number;

  RAW: number;
  SCALED: number;
  OVR: number;
}
