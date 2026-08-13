// compute_ovr.js — reference implementation of the formula in FORMULA.md
// Run with: node "compute_ovr.js" [eraTeam] [comma,separated,names] [combine]
//   node compute_ovr.js                         -> prints Top 50 / Random 50
//   node compute_ovr.js "'17 Warriors"            -> full breakdown for that team
//   node compute_ovr.js "" "Name1,Name2"          -> lookup specific players
//   node compute_ovr.js "" "Name1,Name2" combine   -> those players merged into Random 50, sorted

const fs = require('fs');
const path = require('path');
const content = fs.readFileSync(path.join(__dirname, 'players.js'), 'utf8');
const m = content.match(/const PLAYER_CSV = `([\s\S]*?)`/);
const lines = m[1].trim().split('\n').filter(Boolean);
const playoffOpponents = JSON.parse(fs.readFileSync(path.join(__dirname, 'playoff_opponents.json'), 'utf8'));

// STEP 6.5.5 helper — EXPONENTIAL opponent-strength curve. Each series contributes
// sign(pct-0.5) * |pct-0.5|^OPP_EXP, so facing a truly elite team (e.g. a 73-9 juggernaut)
// contributes disproportionately more than facing an average .500 team — not just
// proportionally more, but convexly more. Later rounds weighted heavier since who you
// play deep in a run says more than round 1.
const ROUND_WEIGHT = { R1: 1.0, R2: 1.5, CF: 2.0, FINALS: 2.5 };
const OPP_EXP = 2.5;
const OPP_MULT = 45;
function roundKey(r) {
  const u = r.toUpperCase();
  if (u.includes('FINAL') && !u.includes('CONF')) return 'FINALS';
  if (u.includes('CF') || (u.includes('CONF') && u.includes('FINAL'))) return 'CF';
  if (u.includes('R2') || u.includes('SEMI')) return 'R2';
  return 'R1';
}
const oppStrengthByTeam = {};   // raw weighted-avg opponent win% (display/diagnostic only)
const oppStrengthModByTeam = {}; // exponential-curve mod actually used in the formula
for (const [eraTeam, series] of Object.entries(playoffOpponents)) {
  let wSum = 0, wTot = 0, expSum = 0;
  for (const s of series) {
    const pct = (s.opponentWins + s.opponentLosses) > 0 ? s.opponentWins / (s.opponentWins + s.opponentLosses) : 0.5;
    const wt = ROUND_WEIGHT[roundKey(s.round)] || 1.0;
    const diff = pct - 0.5;
    const expVal = Math.sign(diff) * Math.pow(Math.abs(diff), OPP_EXP);
    wSum += pct * wt;
    expSum += expVal * wt;
    wTot += wt;
  }
  oppStrengthByTeam[eraTeam] = wTot > 0 ? wSum / wTot : 0.5;
  oppStrengthModByTeam[eraTeam] = wTot > 0 ? Math.max(-3.5, Math.min(3.5, (expSum / wTot) * OPP_MULT)) : 0;
}

const players = lines.map(line => {
  const p = line.split(',');
  return {
    eraTeam: p[0], name: p[1], pos: p[2], cost: +p[3],
    ppg: +p[4], rpg: +p[5], apg: +p[6], usg: +p[7], ts: +p[8], ws48: +p[9],
    offBase: +p[10], defBase: +p[11], archetype: p[12], teamKey: p[13],
    stl: +p[14], blk: +p[15], teamWins: +p[16], teamLosses: +p[17], playoffRound: p[18], mpg: +p[19]
  };
});

function yearOf(eraTeam) {
  const yr = parseInt(eraTeam.match(/'(\d+)/)[1]);
  return yr < 30 ? 2000 + yr : 1900 + yr;
}
function posGroup(pos) {
  const primary = pos.split('/')[0];
  if (primary === 'PG' || primary === 'SG' || primary === 'SF' || primary === 'PF' || primary === 'C') {
    return primary;
  }
  return 'SF'; // unrecognized primary — fall back to a neutral middle bucket
}
// Smooth off/def-weight gradient across the 5 positions — PG leans offense hardest,
// C leans defense hardest, stepping evenly through SG/SF/PF rather than a hard G/W/B cliff.
const OFF_WEIGHT = { PG: 0.60, SG: 0.575, SF: 0.55, PF: 0.525, C: 0.50 };
function percentileRank(arr, val) {
  const sorted = [...arr].sort((a, b) => a - b);
  let count = 0;
  for (const v of sorted) if (v <= val) count++;
  return count / sorted.length;
}

// STEP 0 — preprocessing
const groups = { PG: [], SG: [], SF: [], PF: [], C: [] };
players.forEach(p => groups[posGroup(p.pos)].push(p));
players.forEach(p => {
  const g = groups[posGroup(p.pos)];
  p.stlBlkPct = percentileRank(g.map(x => x.stl + x.blk), p.stl + p.blk);
  p.rebPct = percentileRank(g.map(x => x.rpg), p.rpg);
  p.defPct = p.stlBlkPct * 0.6 + p.rebPct * 0.4;
});

const decadeBuckets = {};
players.forEach(p => {
  const decade = Math.floor(yearOf(p.eraTeam) / 10) * 10;
  (decadeBuckets[decade] = decadeBuckets[decade] || []).push(p);
});
const eraAvgTs = { 1960: 55.4, 1970: 53.6, 1980: 55.3, 1990: 55.2, 2000: 53.8, 2010: 55.6, 2020: 58.8 };
players.forEach(p => {
  const decade = Math.floor(yearOf(p.eraTeam) / 10) * 10;
  const bucket = decadeBuckets[decade];
  p.tsPctEra = percentileRank(bucket.map(x => x.ts), p.ts);
  p.eraAvgTs = eraAvgTs[decade] !== undefined ? eraAvgTs[decade] : (bucket.reduce((s, x) => s + x.ts, 0) / bucket.length);
});

const roundScore = { MISSED: -4.0, R1: -0.04, R2: 0.97, CF: 2.78, FINALS: 8.5, CHAMPION: 10.0, IN_PROGRESS: 0 };

players.forEach(p => {
  // STEP 1 — confidence
  const usgConf = 1 / (1 + Math.exp(-0.5 * (p.usg - 17)));
  const ppgConf = 1 / (1 + Math.exp(-0.3 * (p.ppg - 9)));
  const mpgConf = 1 / (1 + Math.exp(-0.35 * (p.mpg - 20)));
  const conf = Math.max(usgConf, mpgConf * 0.85) * Math.max(ppgConf, mpgConf);

  // STEP 2 — offense
  const tsRatio = p.ts / p.eraAvgTs;
  const tsMod = tsRatio > 1 ? 1 + (Math.pow(tsRatio, 0.35) - 1) * conf : Math.pow(tsRatio, 0.35);
  const usageMod = Math.pow(p.usg / 22, 0.30);
  const offScore = p.offBase * tsMod * usageMod * (0.55 + 0.45 * conf);

  // STEP 3 — defense
  const rebMod = 0.85 + Math.min(0.3, p.rpg / 40);
  const activityMod = 0.8 + p.defPct * 0.4;
  const anchoredDef = p.defBase * rebMod * activityMod;
  const pureDefScore = p.defPct * 40 + Math.min(10, p.rpg * 0.5);
  const defScore = anchoredDef * 0.6 + pureDefScore * 0.4;

  // STEP 4 — anchor combine
  const g = posGroup(p.pos);
  const offWeight = OFF_WEIGHT[g];
  const defWeight = 1 - offWeight;
  const ANCHORED = (offScore * offWeight + defScore * defWeight) * 1.35;

  // STEP 5 — WS/48 overlay
  const delta = p.ws48 - 0.100;
  const wsTerm = Math.sign(delta) * Math.pow(Math.abs(delta * 40), 1.08) * conf;

  // STEP 6 — IGB
  const usageNorm = p.usg / 22;
  const effNorm = p.ts / 55;
  const effCombo = Math.pow(Math.max(0, usageNorm * effNorm * effNorm - 1), 1.6) * 1.2 * conf;
  const defCombo = Math.max(0, p.defPct - 0.7) * 8;
  const volumeDampener = Math.min(1, p.usg / 20);
  const gravityBonus = Math.log(1 + Math.max(0, p.tsPctEra - 0.85) * 100) * 1.3 * (0.5 + 0.5 * conf) * volumeDampener;
  const astBonus = Math.log(1 + p.apg) * 1.15;
  const IGB = effCombo + defCombo + gravityBonus + astBonus;

  // STEP 6.5 — team success
  const winPct = p.teamWins / (p.teamWins + p.teamLosses);
  const rs = roundScore[p.playoffRound] !== undefined ? roundScore[p.playoffRound] : 0;
  const winPctTerm = (winPct - 0.50) * 6;

  // STEP 6.5.5 — opponent playoff strength (exponential curve; only applies if the team made the playoffs)
  const oppStrength = oppStrengthByTeam[p.eraTeam];
  const oppStrengthMod = oppStrengthModByTeam[p.eraTeam] !== undefined ? oppStrengthModByTeam[p.eraTeam] : 0;
  p.oppStrength = oppStrength;
  p.oppStrengthMod = oppStrengthMod;

  const teamRaw = winPctTerm + rs + oppStrengthMod;
  const teamTerm = teamRaw * (0.4 + 0.6 * conf);

  // STEP 6.6 — two-way impact
  const twoWay = (Math.log(1 + p.apg) * 1.5 + Math.max(0, p.defPct - 0.6) * 10) * mpgConf;

  // STEP 7 — final RAW
  const RAW = Math.max(1, ANCHORED + wsTerm + IGB + teamTerm + twoWay);

  p.RAW = RAW;
  p.conf = conf;
  p.mpgConf = mpgConf;
  p.teamTerm = teamTerm;
  p.winPct = winPct;
  p.winPctTerm = winPctTerm;
  p.roundTerm = rs;
  p.ANCHORED = ANCHORED;
  p.offScore = offScore;
  p.defScore = defScore;
  p.wsTerm = wsTerm;
  p.IGB = IGB;
  p.twoWay = twoWay;
});

// STEP 8 — SCALED
const raws = players.map(p => p.RAW);
const maxRaw = Math.max(...raws);
const minRaw = Math.min(...raws);
const C = (100.5 - 25) / Math.pow(maxRaw - minRaw, 1.9);
players.forEach(p => {
  const D = maxRaw - p.RAW;
  p.SCALED = 100.5 - C * Math.pow(D, 1.9);
});

// STEP 9 — OVR = round(SCALED), capped at 100. SCALED *is* the OVR now.
players.forEach(p => {
  p.OVR = Math.min(100, Math.round(p.SCALED));
});

players.sort((a, b) => b.SCALED - a.SCALED);

if (process.env.DUMP_JSON) {
  fs.writeFileSync(process.env.DUMP_JSON, JSON.stringify(players.map(p => ({
    name: p.name, eraTeam: p.eraTeam, ovr: p.OVR, scaled: +p.SCALED.toFixed(1), conf: +p.conf.toFixed(2),
    ppg: p.ppg, rpg: p.rpg, apg: p.apg, usg: p.usg, ts: p.ts, ws48: p.ws48, mpg: p.mpg,
    off: p.offBase, def: p.defBase, record: p.teamWins + '-' + p.teamLosses, playoff: p.playoffRound,
    oppStrength: p.oppStrength !== undefined ? +p.oppStrength.toFixed(3) : null,
    oppStrengthMod: +p.oppStrengthMod.toFixed(2), teamTerm: +p.teamTerm.toFixed(2), raw: +p.RAW.toFixed(2)
  }))));
}

function printRich(title, list) {
  console.log('\n=== ' + title + ' ===');
  console.log(JSON.stringify(list.map(p => ({
    name: p.name, eraTeam: p.eraTeam,
    scaled: +p.SCALED.toFixed(1), ovr: p.OVR, conf: +p.conf.toFixed(2),
    ppg: p.ppg, rpg: p.rpg, apg: p.apg, usg: p.usg, ts: p.ts, ws48: p.ws48, mpg: p.mpg,
    off: p.offBase, def: p.defBase,
    record: p.teamWins + '-' + p.teamLosses, playoff: p.playoffRound
  })), null, 2));
}

const top50 = players.slice(0, 50);
const shuffled = [...players];
let seed = 42;
function rand() { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }
for (let i = shuffled.length - 1; i > 0; i--) {
  const j = Math.floor(rand() * (i + 1));
  [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
}
const random50 = shuffled.slice(0, 50).sort((a, b) => b.SCALED - a.SCALED);

printRich('TOP 50 (by SCALED = OVR)', top50);
printRich('RANDOM 50 (by SCALED = OVR)', random50);

// Optional CLI lookups
const teamArg = process.argv[2];
if (teamArg) {
  const teamPlayers = players.filter(p => p.eraTeam === teamArg).sort((a, b) => b.SCALED - a.SCALED);
  console.log('\n=== ' + teamArg + ' full breakdown ===');
  console.log(JSON.stringify(teamPlayers.map(p => ({
    name: p.name, pos: p.pos, ppg: p.ppg, rpg: p.rpg, apg: p.apg, usg: p.usg, ts: p.ts, ws48: p.ws48, mpg: p.mpg,
    off: p.offBase, def: p.defBase, stl: p.stl, blk: p.blk,
    offScore: +p.offScore.toFixed(2), defScore: +p.defScore.toFixed(2), ANCHORED: +p.ANCHORED.toFixed(2),
    wsTerm: +p.wsTerm.toFixed(2), IGB: +p.IGB.toFixed(2),
    winPctTerm: +p.winPctTerm.toFixed(2), roundTerm: +p.roundTerm.toFixed(2), teamTerm: +p.teamTerm.toFixed(2),
    conf: +p.conf.toFixed(2), RAW: +p.RAW.toFixed(2), SCALED: +p.SCALED.toFixed(1), OVR: p.OVR
  })), null, 2));
}

const nameArg = process.argv[3];
if (nameArg) {
  const names = nameArg.split(',');
  const matches = players.filter(p => names.includes(p.name)).sort((a, b) => b.SCALED - a.SCALED);
  console.log('\n=== player lookup ===');
  console.log(JSON.stringify(matches.map(p => ({
    name: p.name, eraTeam: p.eraTeam, mpg: p.mpg, ppg: p.ppg, apg: p.apg, defPct: +p.defPct.toFixed(2),
    conf: +p.conf.toFixed(2), mpgConf: +p.mpgConf.toFixed(2),
    ANCHORED: +p.ANCHORED.toFixed(2), teamTerm: +p.teamTerm.toFixed(2), twoWay: +p.twoWay.toFixed(2),
    RAW: +p.RAW.toFixed(2), SCALED: +p.SCALED.toFixed(1), OVR: p.OVR
  })), null, 2));

  const combineArg = process.argv[4];
  if (combineArg === 'combine') {
    const combinedMap = new Map();
    [...random50, ...matches].forEach(p => combinedMap.set(p.eraTeam + '|' + p.name, p));
    const combined = [...combinedMap.values()].sort((a, b) => b.SCALED - a.SCALED);
    console.log('\n=== COMBINED (random50 + lookup), sorted by SCALED ===');
    console.log(JSON.stringify(combined.map(p => ({
      name: p.name, eraTeam: p.eraTeam, pos: p.pos,
      ppg: p.ppg, rpg: p.rpg, apg: p.apg, usg: p.usg, ts: p.ts, ws48: p.ws48, mpg: p.mpg,
      off: p.offBase, def: p.defBase, conf: +p.conf.toFixed(2),
      teamRecord: p.teamWins + '-' + p.teamLosses, playoffRound: p.playoffRound,
      RAW: +p.RAW.toFixed(1), SCALED: +p.SCALED.toFixed(1), OVR: p.OVR
    })), null, 2));
  }
}
