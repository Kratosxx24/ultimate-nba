import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllPlayers } from '../lib/players';
import OvrBadge, { getTier } from '../components/OvrBadge';
import type { Player } from '../types/player';
import { useTheme } from '../lib/ThemeContext';
import { getTeamColors } from '../lib/teamColors';

type NumericKey =
  | 'OVR'
  | 'year'
  | 'cost'
  | 'ppg'
  | 'rpg'
  | 'apg'
  | 'usg'
  | 'ts'
  | 'ws48'
  | 'stl'
  | 'blk'
  | 'offBase'
  | 'defBase';

interface Col {
  key: NumericKey | 'rank' | 'name' | 'team' | 'pos' | 'archetype';
  label: string;
  sortable: boolean;
  width: string;
  align?: 'right' | 'left';
}

const COLS: Col[] = [
  { key: 'rank', label: 'Rk', sortable: false, width: '40px' },
  { key: 'year', label: 'Year', sortable: true, width: '58px' },
  { key: 'team', label: 'Team', sortable: false, width: 'minmax(90px,140px)' },
  { key: 'name', label: 'Player', sortable: false, width: 'minmax(160px,1fr)' },
  { key: 'pos', label: 'Pos', sortable: false, width: '60px' },
  { key: 'cost', label: 'Cost', sortable: true, width: '54px', align: 'right' },
  { key: 'OVR', label: 'OVR', sortable: true, width: '66px' },
  { key: 'ppg', label: 'PPG', sortable: true, width: '54px', align: 'right' },
  { key: 'rpg', label: 'RPG', sortable: true, width: '54px', align: 'right' },
  { key: 'apg', label: 'APG', sortable: true, width: '54px', align: 'right' },
  { key: 'usg', label: 'USG%', sortable: true, width: '58px', align: 'right' },
  { key: 'ts', label: 'TS%', sortable: true, width: '54px', align: 'right' },
  { key: 'ws48', label: 'WS/48', sortable: true, width: '58px', align: 'right' },
  { key: 'stl', label: 'STL', sortable: true, width: '48px', align: 'right' },
  { key: 'blk', label: 'BLK', sortable: true, width: '48px', align: 'right' },
  { key: 'offBase', label: 'OFF', sortable: true, width: '48px', align: 'right' },
  { key: 'defBase', label: 'DEF', sortable: true, width: '48px', align: 'right' },
  { key: 'archetype', label: 'Archetype', sortable: false, width: '170px' },
];

const GRID_COLS = COLS.map((c) => c.width).join(' ');

// Archetype family -> token-consistent hue. Buckets derived from the actual archetype
// strings in players.csv (playmaking / defense / scoring-shooting / big-post / role).
const ARCHETYPE_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  playmaking: { bg: 'rgba(92,141,214,.14)', text: '#9CC0F0', border: 'rgba(92,141,214,.35)' },
  defense: { bg: 'rgba(90,180,150,.14)', text: '#8FCBAE', border: 'rgba(90,180,150,.35)' },
  scoring: { bg: 'rgba(240,135,58,.14)', text: '#F0A56C', border: 'rgba(240,135,58,.35)' },
  post: { bg: 'rgba(178,140,214,.14)', text: '#C6A8E8', border: 'rgba(178,140,214,.35)' },
  role: { bg: 'rgba(184,177,169,.12)', text: '#B8B1A9', border: 'rgba(184,177,169,.3)' },
};

function archetypeFamily(archetype: string): keyof typeof ARCHETYPE_STYLE {
  if (/Playmaker|Floor General|Transition Maestro/i.test(archetype)) return 'playmaking';
  if (/Defender|Enforcer|Anchor|Rim Protector|Unicorn|3&D/i.test(archetype)) return 'defense';
  if (/Shot Creator|Sniper/i.test(archetype)) return 'scoring';
  if (/Post|Rim Runner|Stretch Big/i.test(archetype)) return 'post';
  return 'role';
}

function ArchetypePill({ archetype }: { archetype: string }) {
  const s = ARCHETYPE_STYLE[archetypeFamily(archetype)];
  return (
    <span
      className="inline-block text-[10.5px] px-2 py-0.5 whitespace-nowrap truncate max-w-full"
      style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}
      title={archetype}
    >
      {archetype}
    </span>
  );
}

// Position -> token-consistent color, echoing the archetype pill treatment so the
// role-at-a-glance read (playmaking blue, wing orange, big purple) stays consistent.
const POS_STYLE: Record<string, { text: string; border: string }> = {
  PG: { text: '#9CC0F0', border: 'rgba(92,141,214,.4)' },
  SG: { text: '#F0A56C', border: 'rgba(240,135,58,.4)' },
  SF: { text: '#8FCBAE', border: 'rgba(90,180,150,.4)' },
  PF: { text: '#C6A8E8', border: 'rgba(178,140,214,.4)' },
  C: { text: '#E8A0AC', border: 'rgba(212,110,128,.4)' },
};

function PosTag({ pos }: { pos: string }) {
  const key = pos.split('/')[0].trim().toUpperCase();
  const s = POS_STYLE[key] ?? { text: 'var(--color-text-mid)', border: 'var(--color-surface-4)' };
  return (
    <span
      className="text-[11px] font-mono font-semibold px-1.5 py-0.5 justify-self-start"
      style={{ color: s.text, border: `1px solid ${s.border}` }}
    >
      {pos}
    </span>
  );
}

function yearOf(p: Player): number {
  const m = p.eraTeam.match(/^'?(\d{2,4})/);
  if (!m) return 0;
  const n = parseInt(m[1], 10);
  return n < 100 ? (n >= 40 ? 1900 + n : 2000 + n) : n;
}

export default function PlayersPage() {
  const { theme } = useTheme();
  const players = useMemo(() => getAllPlayers(), []);
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<NumericKey>('OVR');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? players.filter((p) => p.name.toLowerCase().includes(q) || p.eraTeam.toLowerCase().includes(q))
      : players;
    const withYear = list.map((p) => ({ p, year: yearOf(p) }));
    const dir = sortDir === 'asc' ? 1 : -1;
    withYear.sort((a, b) => {
      const av = sortKey === 'year' ? a.year : (a.p[sortKey] as number);
      const bv = sortKey === 'year' ? b.year : (b.p[sortKey] as number);
      return (av - bv) * dir;
    });
    return withYear;
  }, [players, query, sortKey, sortDir]);

  function toggleSort(key: NumericKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-baseline gap-3 mb-1.5">
          <span className="font-mono text-[11px] tracking-[.22em] text-muted">01</span>
          <h1
            className="text-text-hi"
            style={{ fontFamily: 'Archivo, sans-serif', fontVariationSettings: "'wdth' 78,'wght' 800", fontSize: 34, lineHeight: 1 }}
          >
            SEASONS
          </h1>
        </div>
        <p className="text-sm text-text-mid max-w-[66ch]">
          Showing {rows.length.toLocaleString()} of {players.length.toLocaleString()}.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        <input
          type="text"
          placeholder="Search player or team/year..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 min-w-[200px] bg-surface-1 border border-surface-4 px-3 py-2 text-sm text-text-body-hi placeholder:text-text-low outline-none focus:border-blue-500"
        />
      </div>

      <div className="border border-hairline overflow-x-auto" style={{ background: 'var(--color-surface-1)' }}>
        <div
          className="grid gap-3 py-3 border-b border-hairline font-mono text-[10px] tracking-[.1em] uppercase text-muted items-center"
          style={{ gridTemplateColumns: GRID_COLS, minWidth: 1380, paddingLeft: 'calc(1.25rem + 3px)', paddingRight: '1.25rem' }}
        >
          {COLS.map((c) => (
            <button
              key={c.key}
              type="button"
              disabled={!c.sortable}
              onClick={() => c.sortable && toggleSort(c.key as NumericKey)}
              className={`flex items-center gap-1 bg-transparent border-0 p-0 font-mono text-[10px] tracking-[.1em] uppercase ${
                c.sortable ? 'cursor-pointer hover:text-text-mid' : 'cursor-default'
              } ${c.align === 'right' ? 'justify-end text-right' : 'text-left'}`}
              style={{ color: sortKey === c.key ? 'var(--color-amber-500)' : undefined }}
            >
              {c.label}
              {c.sortable && sortKey === c.key && <span>{sortDir === 'asc' ? '▲' : '▼'}</span>}
            </button>
          ))}
        </div>

        {rows.map(({ p, year }, i) => {
          const tier = getTier(p.OVR, theme);
          const dim = p.OVR < 60;
          const teamColors = getTeamColors(p.teamKey);
          const topRank = i < 3;
          return (
            <Link
              key={p.id}
              to={`/season/${encodeURIComponent(p.id)}`}
              className="grid gap-3 py-3.5 last:border-b-0 items-center hover:bg-surface-3 transition-colors"
              style={{
                gridTemplateColumns: GRID_COLS,
                minWidth: 1380,
                paddingLeft: '1.25rem',
                paddingRight: '1.25rem',
                background: i % 2 === 1 ? 'var(--color-surface-2)' : 'var(--color-surface-1)',
                borderLeft: `3px solid ${teamColors.primary}`,
                borderBottom: '1px solid var(--color-hairline)',
              }}
            >
              <span
                className="font-mono text-[12px] font-tnum"
                style={{ color: topRank ? 'var(--color-amber-500)' : 'var(--color-muted)', fontWeight: topRank ? 700 : 400 }}
              >
                {i + 1}
              </span>
              <span
                className="font-tnum"
                style={{ fontFamily: 'Archivo, sans-serif', fontVariationSettings: "'wdth' 78,'wght' 700", fontSize: 16, color: tier.numeral }}
              >
                {year ? `'${String(year).slice(-2)}` : ''}
              </span>
              <span
                className="font-mono text-[11px] font-semibold truncate uppercase tracking-[.04em]"
                style={{ color: teamColors.primary }}
              >
                {p.teamKey}
              </span>
              <span
                className="truncate min-w-0"
                style={{
                  fontFamily: 'Archivo, sans-serif',
                  fontVariationSettings: "'wdth' 84,'wght' 600",
                  fontSize: 15,
                  color: dim ? 'var(--color-text-mid)' : 'var(--color-text-hi)',
                }}
              >
                {p.name}
              </span>
              <PosTag pos={p.pos} />
              <span
                className="font-mono text-[13.5px] text-right font-tnum font-bold"
                style={{ color: 'var(--color-amber-500)' }}
              >
                {p.cost}
              </span>
              <OvrBadge ovr={p.OVR} size="sm" />
              <span className="font-mono text-[12.5px] text-text-body-hi text-right font-tnum">{p.ppg.toFixed(1)}</span>
              <span className="font-mono text-[12.5px] text-text-body-hi text-right font-tnum">{p.rpg.toFixed(1)}</span>
              <span className="font-mono text-[12.5px] text-text-body-hi text-right font-tnum">{p.apg.toFixed(1)}</span>
              <span className="font-mono text-[12.5px] text-text-mid text-right font-tnum">{p.usg.toFixed(1)}</span>
              <span className="font-mono text-[12.5px] text-text-body-hi text-right font-tnum">{p.ts.toFixed(3)}</span>
              <span className="font-mono text-[12.5px] text-text-body-hi text-right font-tnum">{p.ws48.toFixed(3)}</span>
              <span className="font-mono text-[12.5px] text-text-mid text-right font-tnum">{p.stl.toFixed(1)}</span>
              <span className="font-mono text-[12.5px] text-text-mid text-right font-tnum">{p.blk.toFixed(1)}</span>
              <span className="font-mono text-[12.5px] text-text-mid text-right font-tnum">{p.offBase}</span>
              <span className="font-mono text-[12.5px] text-text-mid text-right font-tnum">{p.defBase}</span>
              <ArchetypePill archetype={p.archetype} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
