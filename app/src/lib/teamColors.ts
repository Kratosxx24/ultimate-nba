/**
 * Real franchise brand colors, keyed by the `teamKey` values found in players.csv.
 * Two historical franchises are included with research-appropriate colors even though
 * they're defunct/renamed: Royals (Cincinnati/Rochester Royals, Kings precursor) and
 * Sonics (Seattle SuperSonics, distinct green/gold — NOT Thunder's orange/blue).
 */
export interface TeamColorPair {
  primary: string;
  secondary: string;
}

export const TEAM_COLORS: Record<string, TeamColorPair> = {
  '76ers': { primary: '#006BB6', secondary: '#ED174C' },
  Blazers: { primary: '#E03A3E', secondary: '#000000' },
  Bucks: { primary: '#00471B', secondary: '#EEE1C6' },
  Bulls: { primary: '#CE1141', secondary: '#000000' },
  Cavaliers: { primary: '#860038', secondary: '#FDBB30' },
  Celtics: { primary: '#007A33', secondary: '#BA9653' },
  Clippers: { primary: '#C8102E', secondary: '#1D428A' },
  Grizzlies: { primary: '#5D76A9', secondary: '#12173F' },
  Hawks: { primary: '#E03A3E', secondary: '#C1D32F' },
  Heat: { primary: '#98002E', secondary: '#F9A01B' },
  Hornets: { primary: '#1D1160', secondary: '#00788C' },
  Jazz: { primary: '#002B5C', secondary: '#F9A01B' },
  Kings: { primary: '#5A2D81', secondary: '#63727A' },
  Knicks: { primary: '#006BB6', secondary: '#F58426' },
  Lakers: { primary: '#552583', secondary: '#FDB927' },
  Magic: { primary: '#0077C0', secondary: '#C4CED4' },
  Mavericks: { primary: '#00538C', secondary: '#002B5E' },
  Nets: { primary: '#000000', secondary: '#FFFFFF' },
  Nuggets: { primary: '#0E2240', secondary: '#FEC524' },
  Pacers: { primary: '#002D62', secondary: '#FDBB30' },
  Pelicans: { primary: '#0C2340', secondary: '#C8102E' },
  Pistons: { primary: '#C8102E', secondary: '#1D42BA' },
  Raptors: { primary: '#CE1141', secondary: '#000000' },
  Rockets: { primary: '#CE1141', secondary: '#000000' },
  // Cincinnati/Rochester Royals — deep maroon/purple in the Kings family lineage.
  Royals: { primary: '#6C2A3C', secondary: '#B8860B' },
  // Seattle SuperSonics — classic green/gold, distinct from Thunder's orange/blue.
  Sonics: { primary: '#00653A', secondary: '#FFC200' },
  Spurs: { primary: '#C4CED4', secondary: '#000000' },
  Suns: { primary: '#E56020', secondary: '#1D1160' },
  Thunder: { primary: '#007AC1', secondary: '#EF3B24' },
  Timberwolves: { primary: '#0C2340', secondary: '#78BE20' },
  Warriors: { primary: '#1D428A', secondary: '#FFC72C' },
  Wizards: { primary: '#002B5C', secondary: '#E31837' },
};

const FALLBACK: TeamColorPair = { primary: '#8A837B', secondary: '#3A332D' };

export function getTeamColors(teamKey: string | undefined | null): TeamColorPair {
  if (!teamKey) return FALLBACK;
  return TEAM_COLORS[teamKey] ?? FALLBACK;
}
