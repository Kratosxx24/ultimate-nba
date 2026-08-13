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
        <h1 className="text-2xl font-bold text-white tracking-tight">Players</h1>
        <p className="text-sm text-gray-400 mt-1">
          {players.length} player-seasons. Showing top {filtered.length}.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        <input
          type="text"
          placeholder="Search player or team/year..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 min-w-[200px] bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 outline-none focus:border-purple-400/50"
        />
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-purple-400/50"
        >
          <option value="OVR">Sort: OVR</option>
          <option value="ppg">Sort: PPG</option>
          <option value="rpg">Sort: RPG</option>
          <option value="apg">Sort: APG</option>
          <option value="name">Sort: Name</option>
        </select>
      </div>

      <div className="rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-gray-400 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-3 py-2">OVR</th>
              <th className="text-left px-3 py-2">Player</th>
              <th className="text-left px-3 py-2">Team/Yr</th>
              <th className="text-left px-3 py-2">Pos</th>
              <th className="text-right px-3 py-2">PPG</th>
              <th className="text-right px-3 py-2">RPG</th>
              <th className="text-right px-3 py-2">APG</th>
              <th className="text-left px-3 py-2">Playoff</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-white/5 hover:bg-white/5">
                <td className="px-3 py-2">
                  <OvrBadge ovr={p.OVR} size="sm" />
                </td>
                <td className="px-3 py-2 text-white">{p.name}</td>
                <td className="px-3 py-2 text-gray-400">{p.eraTeam}</td>
                <td className="px-3 py-2 text-gray-400">{p.pos}</td>
                <td className="px-3 py-2 text-right text-gray-300">{p.ppg}</td>
                <td className="px-3 py-2 text-right text-gray-300">{p.rpg}</td>
                <td className="px-3 py-2 text-right text-gray-300">{p.apg}</td>
                <td className="px-3 py-2 text-gray-400">{p.playoffRound}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
