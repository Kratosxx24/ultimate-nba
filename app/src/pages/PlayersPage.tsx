import { useMemo, useState } from 'react';
import { getAllPlayers } from '../lib/players';
import OvrBadge from '../components/OvrBadge';

type SortKey = 'OVR' | 'ppg' | 'rpg' | 'apg' | 'name';

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
    <div className="space-y-4">
      <div>
        <h1
          className="text-text-hi"
          style={{ fontFamily: 'Archivo, sans-serif', fontVariationSettings: "'wdth' 78,'wght' 800", fontSize: 30 }}
        >
          Players
        </h1>
        <p className="text-sm text-text-mid mt-1">
          {players.length} player-seasons. Showing top {filtered.length}.
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

      <div className="border border-surface-4 overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-1 text-text-low text-[10px] font-mono uppercase tracking-[.12em]">
            <tr>
              <th className="text-left px-3 py-2">OVR</th>
              <th className="text-left px-3 py-2">Player</th>
              <th className="text-left px-3 py-2">Team/Yr</th>
              <th className="text-left px-3 py-2">Pos</th>
              <th className="text-right px-3 py-2">PTS</th>
              <th className="text-right px-3 py-2">REB</th>
              <th className="text-right px-3 py-2">AST</th>
              <th className="text-left px-3 py-2">Playoff</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr
                key={p.id}
                className={`border-t border-hairline hover:bg-surface-3 ${i % 2 === 1 ? 'bg-surface-1' : ''}`}
              >
                <td className="px-3 py-2">
                  <OvrBadge ovr={p.OVR} size="xs" />
                </td>
                <td className="px-3 py-2 text-text-hi whitespace-nowrap">{p.name}</td>
                <td className="px-3 py-2 font-mono text-text-low whitespace-nowrap">{p.eraTeam}</td>
                <td className="px-3 py-2 text-text-mid">{p.pos}</td>
                <td className="px-3 py-2 text-right font-mono font-tnum text-text-mid">{p.ppg}</td>
                <td className="px-3 py-2 text-right font-mono font-tnum text-text-mid">{p.rpg}</td>
                <td className="px-3 py-2 text-right font-mono font-tnum text-text-mid">{p.apg}</td>
                <td className="px-3 py-2 font-mono text-text-low">{p.playoffRound}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
