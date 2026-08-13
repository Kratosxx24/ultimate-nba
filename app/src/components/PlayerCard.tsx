import type { Player } from '../types/player';
import OvrBadge from './OvrBadge';

interface PlayerCardProps {
  player: Player;
  onRemove?: () => void;
  onReroll?: () => void;
  compact?: boolean;
}

// Deterministic hue from team key so the monogram plate always reads the
// same for a given franchise, without needing a real color table.
function teamHue(key: string): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return hash % 360;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function parseYear(eraTeam: string): { year: string; team: string } {
  const match = eraTeam.match(/^(\d{4})\s*(.*)$/);
  if (match) return { year: match[1], team: match[2] || eraTeam };
  return { year: '', team: eraTeam };
}

export default function PlayerCard({ player, onRemove, onReroll, compact }: PlayerCardProps) {
  const { year, team } = parseYear(player.eraTeam);
  const hue = teamHue(player.teamKey || player.eraTeam);
  const plateBg = `linear-gradient(160deg, hsl(${hue} 45% 16%), hsl(${hue} 30% 8%))`;
  const plateBorder = `hsl(${hue} 40% 26%)`;
  const initialColor = `hsl(${hue} 65% 68%)`;
  const spineBg = `linear-gradient(180deg, hsl(${hue} 40% 12%), hsl(${hue} 30% 8%))`;

  return (
    <div className="group flex overflow-hidden border border-surface-4 bg-surface-2 hover:border-[hsl(0_0%_35%)] transition-colors">
      {/* year spine */}
      <div
        className="flex-none flex items-center justify-center border-r border-hairline"
        style={{ width: compact ? 22 : 30, background: spineBg }}
      >
        <span
          className="font-tnum"
          style={{
            fontFamily: 'Archivo, sans-serif',
            fontVariationSettings: "'wdth' 74,'wght' 700",
            fontSize: compact ? 12 : 15,
            color: initialColor,
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            letterSpacing: '.06em',
          }}
        >
          {year || '—'}
        </span>
      </div>

      <div className="flex-1 min-w-0 p-3">
        <div className="flex items-start gap-3">
          {!compact && (
            <div
              className="flex-none flex flex-col items-center justify-center"
              style={{
                width: 42,
                height: 52,
                background: plateBg,
                border: `1px solid ${plateBorder}`,
              }}
            >
              <span
                style={{
                  fontFamily: 'Archivo, sans-serif',
                  fontVariationSettings: "'wdth' 74,'wght' 800",
                  fontSize: 18,
                  color: initialColor,
                  lineHeight: 1,
                }}
              >
                {initials(player.name)}
              </span>
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div
              className="truncate text-text-hi"
              style={{
                fontFamily: 'Archivo, sans-serif',
                fontVariationSettings: "'wdth' 84,'wght' 600",
                fontSize: compact ? 14 : 16,
                lineHeight: 1.1,
              }}
            >
              {player.name}
            </div>
            <div className="flex items-center gap-2 mt-1 text-[10.5px]">
              <span
                className="font-mono text-text-mid pl-1.5"
                style={{ borderLeft: '2px solid var(--color-amber-500)' }}
              >
                {team || player.eraTeam}
              </span>
              <span className="text-muted">{player.pos}</span>
              {year && <span className="text-muted">· {year}</span>}
            </div>
          </div>

          <OvrBadge ovr={player.OVR} size={compact ? 'sm' : 'md'} />
        </div>

        {!compact && (
          <div className="flex gap-3 mt-3 pt-2.5 border-t border-hairline">
            <div>
              <div className="font-mono text-[9px] tracking-[.1em] text-muted">PTS</div>
              <div className="font-mono font-tnum text-[13px] text-text-body-hi">{player.ppg}</div>
            </div>
            <div>
              <div className="font-mono text-[9px] tracking-[.1em] text-muted">REB</div>
              <div className="font-mono font-tnum text-[13px] text-text-body-hi">{player.rpg}</div>
            </div>
            <div>
              <div className="font-mono text-[9px] tracking-[.1em] text-muted">AST</div>
              <div className="font-mono font-tnum text-[13px] text-text-body-hi">{player.apg}</div>
            </div>
            <div className="ml-auto text-right">
              <div className="font-mono text-[9px] tracking-[.1em] text-muted">COST</div>
              <div className="font-mono font-tnum text-[13px] text-amber-500">{player.cost}</div>
            </div>
          </div>
        )}
      </div>

      {(onReroll || onRemove) && (
        <div className="flex-none flex flex-col gap-1 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onReroll && (
            <button
              type="button"
              onClick={onReroll}
              title="Reroll this slot"
              className="text-xs px-2 py-1 border border-amber-700 text-amber-300 hover:bg-amber-900/40"
            >
              ⟳
            </button>
          )}
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              title="Clear this slot"
              className="text-xs px-2 py-1 border border-[--color-down-border] text-[--color-down-text] hover:bg-[--color-down-bg]"
            >
              ✕
            </button>
          )}
        </div>
      )}
    </div>
  );
}
