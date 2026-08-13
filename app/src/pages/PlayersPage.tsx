import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllPlayers } from '../lib/players';
import OvrBadge, { getTier } from '../components/OvrBadge';

type SortKey = 'OVR' | 'ppg' | 'rpg' | 'apg' | 'name';

const COLS = '44px 62px minmax(0,1fr) 70px 88px 56px 56px 56px 56px';

export default function PlayersPage() {
  const players = useMemo(() => getAllPlayers(), []);
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('OVR');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? players.filter((p) => p.name.toLowerCase().includes(q) || p.eraTeam.toLowerCase().includes(q))
      : players;
    const sorted = [...list].sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name);
      return b[sortKey] - a[sortKey];
    });
    return sorted.slice(0, 200);
  }, [players, query, sortKey]);

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
          {players.length.toLocaleString()} player-seasons, 1962 to today. Showing the top {filtered.length}.
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
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="bg-surface-1 border border-surface-4 px-3 py-2 text-sm text-text-body-hi outline-none focus:border-blue-500"
        >
          <option value="OVR">Sort: OVR</option>
          <option value="ppg">Sort: PPG</option>
          <option value="rpg">Sort: RPG</option>
          <option value="apg">Sort: APG</option>
          <option value="name">Sort: Name</option>
        </select>
      </div>

      <div className="border border-hairline bg-[#0F0D0C] overflow-x-auto">
        <div
          className="grid gap-3.5 px-5 py-2.5 bg-surface-1 border-b border-hairline font-mono text-[10px] tracking-[.12em] uppercase text-muted items-center"
          style={{ gridTemplateColumns: COLS, minWidth: 640 }}
        >
          <span>Rk</span>
          <span>Year</span>
          <span>Player · team</span>
          <span>Pos</span>
          <span>Rating</span>
          <span className="text-right">PTS</span>
          <span className="text-right">REB</span>
          <span className="text-right">AST</span>
          <span className="text-right">TS%</span>
        </div>

        {filtered.map((p, i) => {
          const tier = getTier(p.OVR);
          const year = p.eraTeam.match(/^'(\d{2})/)?.[1] ?? '';
          const dim = p.OVR < 60;
          return (
            <Link
              key={p.id}
              to={`/season/${encodeURIComponent(p.id)}`}
              className="grid gap-3.5 px-5 py-3 border-b border-hairline last:border-b-0 items-center hover:bg-surface-3 transition-colors"
              style={{
                gridTemplateColumns: COLS,
                minWidth: 640,
                background: i % 2 === 1 ? 'var(--color-surface-1)' : undefined,
              }}
            >
              <span className="font-mono text-[12px] text-muted font-tnum">{i + 1}</span>
              <span
                className="font-tnum"
                style={{ fontFamily: 'Archivo, sans-serif', fontVariationSettings: "'wdth' 78,'wght' 700", fontSize: 19, color: tier.numeral }}
              >
                {year ? `'${year}` : ''}
              </span>
              <span className="min-w-0 flex items-center gap-2">
                <span
                  className="truncate"
                  style={{
                    fontFamily: 'Archivo, sans-serif',
                    fontVariationSettings: "'wdth' 84,'wght' 600",
                    fontSize: 17,
                    color: dim ? 'var(--color-text-mid)' : 'var(--color-text-hi)',
                  }}
                >
                  {p.name}
                </span>
                <span
                  className="font-mono text-[11px] text-muted pl-1.5 flex-none"
                  style={{ borderLeft: `2px solid var(--color-amber-500)` }}
                >
                  {p.teamKey}
                </span>
              </span>
              <span className="text-[11px] text-text-mid border border-surface-4 px-1.5 py-0.5 justify-self-start">{p.pos}</span>
              <OvrBadge ovr={p.OVR} size="sm" />
              <span className="font-mono text-[13px] text-text-body-hi text-right font-tnum">{p.ppg}</span>
              <span className="font-mono text-[13px] text-text-mid text-right font-tnum">{p.rpg}</span>
              <span className="font-mono text-[13px] text-text-mid text-right font-tnum">{p.apg}</span>
              <span className="font-mono text-[13px] text-text-mid text-right font-tnum">{p.ts.toFixed(3)}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
