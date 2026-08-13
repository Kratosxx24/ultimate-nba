import type { Player } from '../types/player';
import OvrBadge from './OvrBadge';

interface PlayerCardProps {
  player: Player;
  onRemove?: () => void;
  onReroll?: () => void;
  compact?: boolean;
}

export default function PlayerCard({ player, onRemove, onReroll, compact }: PlayerCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-center gap-3 group">
      <OvrBadge ovr={player.OVR} size={compact ? 'sm' : 'md'} />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-white truncate">{player.name}</div>
        <div className="text-xs text-gray-400 truncate">
          {player.eraTeam} · {player.pos}
        </div>
        {!compact && (
          <div className="text-[11px] text-gray-500 mt-0.5">
            {player.ppg} PPG · {player.rpg} RPG · {player.apg} APG
          </div>
        )}
      </div>
      {(onReroll || onRemove) && (
        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onReroll && (
            <button
              type="button"
              onClick={onReroll}
              title="Reroll this slot"
              className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
            >
              🎲
            </button>
          )}
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              title="Clear this slot"
              className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-300 hover:bg-red-500/30"
            >
              ✕
            </button>
          )}
        </div>
      )}
    </div>
  );
}
