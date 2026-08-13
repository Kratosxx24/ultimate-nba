// Archetype family -> token-consistent hue. Buckets derived from the actual archetype
// strings in players.csv (playmaking / defense / scoring-shooting / big-post / role).
export const ARCHETYPE_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  playmaking: { bg: 'rgba(92,141,214,.14)', text: '#9CC0F0', border: 'rgba(92,141,214,.35)' },
  defense: { bg: 'rgba(90,180,150,.14)', text: '#8FCBAE', border: 'rgba(90,180,150,.35)' },
  scoring: { bg: 'rgba(240,135,58,.14)', text: '#F0A56C', border: 'rgba(240,135,58,.35)' },
  post: { bg: 'rgba(178,140,214,.14)', text: '#C6A8E8', border: 'rgba(178,140,214,.35)' },
  role: { bg: 'rgba(184,177,169,.12)', text: '#B8B1A9', border: 'rgba(184,177,169,.3)' },
};

export function archetypeFamily(archetype: string): keyof typeof ARCHETYPE_STYLE {
  if (/Playmaker|Floor General|Transition Maestro/i.test(archetype)) return 'playmaking';
  if (/Defender|Enforcer|Anchor|Rim Protector|Unicorn|3&D/i.test(archetype)) return 'defense';
  if (/Shot Creator|Sniper/i.test(archetype)) return 'scoring';
  if (/Post|Rim Runner|Stretch Big/i.test(archetype)) return 'post';
  return 'role';
}
