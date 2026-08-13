import { useMemo, useState } from 'react';
import type { Player } from '../types/player';
import { getAllPlayers } from '../lib/players';
import OvrBadge from './OvrBadge';

interface PlayerPickerModalProps {
  onSelect: (player: Player) => void;
  onClose: () => void;
}

export default function PlayerPickerModal({ onSelect, onClose }: PlayerPickerModalProps) {
  const [query, setQuery] = useState('');
  const allPlayers = useMemo(() => getAllPlayers(), []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allPlayers.slice(0, 40);
    return allPlayers
      .filter((p) => p.name.toLowerCase().includes(q) || p.eraTeam.toLowerCase().includes(q))
      .slice(0, 40);
  }, [query, allPlayers]);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-start justify-center pt-20 px-4" onClick={onClose}>
      <div
        className="bg-[#14161c] border border-white/10 rounded-xl w-full max-w-lg max-h-[70vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 border-b border-white/10">
          <input
            autoFocus
            type="text"
            placeholder="Search player or team/year..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 outline-none focus:border-purple-400/50"
          />
        </div>
        <div className="overflow-y-auto flex-1 p-2">
          {results.length === 0 && (
            <div className="text-sm text-gray-500 text-center py-8">No players found</div>
          )}
          {results.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p)}
              className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 text-left"
            >
              <OvrBadge ovr={p.OVR} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="text-sm text-white truncate">{p.name}</div>
                <div className="text-xs text-gray-500 truncate">
                  {p.eraTeam} · {p.pos}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
