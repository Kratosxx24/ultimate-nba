import { useMemo, useState } from 'react';
import type { Player } from '../types/player';
import { getAllPlayers } from '../lib/players';
import OvrBadge from './OvrBadge';

interface PlayerPickerModalProps {
  onSelect: (player: Player) => void;
  onClose: () => void;
  /** Constrain the pool (e.g. to a rolled team+decade). Defaults to every player-season. */
  players?: Player[];
  /** Blind-draft: hides rating/archetype and shuffles order — ball knowledge only. */
  blind?: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function PlayerPickerModal({ onSelect, onClose, players, blind }: PlayerPickerModalProps) {
  const [query, setQuery] = useState('');
  const allPlayers = useMemo(() => players ?? getAllPlayers(), [players]);
  const ordered = useMemo(() => (blind ? shuffle(allPlayers) : allPlayers), [allPlayers, blind]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ordered.slice(0, 40);
    return ordered
      .filter((p) => p.name.toLowerCase().includes(q) || p.eraTeam.toLowerCase().includes(q))
      .slice(0, 40);
  }, [query, ordered]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-start justify-center pt-20 px-4"
      onClick={onClose}
    >
      <div
        className="bg-surface-2 border border-surface-4 w-full max-w-lg max-h-[70vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 border-b border-hairline">
          <input
            autoFocus
            type="text"
            placeholder="Search player or team/year..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-surface-1 border border-surface-4 px-3 py-2 text-sm text-text-body-hi placeholder:text-text-low outline-none focus:border-blue-500"
          />
        </div>
        <div className="overflow-y-auto flex-1 p-2">
          {results.length === 0 && (
            <div className="text-sm text-text-low text-center py-8">No players found</div>
          )}
          {results.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p)}
              className="w-full flex items-center gap-3 px-2 py-2 hover:bg-surface-3 text-left"
            >
              {blind ? (
                <div
                  className="flex-none w-9 h-9 flex items-center justify-center text-text-low"
                  style={{ background: 'var(--color-surface-3)', clipPath: 'polygon(0 0,100% 0,100% 74%,78% 100%,0 100%)' }}
                >
                  ?
                </div>
              ) : (
                <OvrBadge ovr={p.OVR} size="sm" />
              )}
              <div className="min-w-0 flex-1">
                <div className="text-sm text-text-hi truncate">{p.name}</div>
                <div className="text-xs font-mono text-text-low truncate">
                  {blind ? p.eraTeam.replace(/^'(\d{2}).*/, "'$1") : `${p.eraTeam} · ${p.pos}`}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
