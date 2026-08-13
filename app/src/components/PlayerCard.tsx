import type { Player } from '../types/player';
import OvrBadge, { getTier } from './OvrBadge';

interface PlayerCardProps {
  player: Player;
  onRemove?: () => void;
  onReroll?: () => void;
  compact?: boolean;
  onClick?: () => void;
}

// Deterministic hue from team key so the monogram plate always reads the
// same for a given franchise, without needing a real color table.
function teamHue(key: string): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return hash % 360;
}

// eraTeam is formatted like "'96 Bulls" — a 2-digit clipped year plus the franchise name.
function parseYear(eraTeam: string): { year: string; team: string } {
  const match = eraTeam.match(/^'(\d{2})\s*(.*)$/);
  if (match) return { year: match[1], team: match[2] || eraTeam };
  return { year: '', team: eraTeam };
}

function splitName(name: string): [string, string] {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return [parts[0], ''];
  return [parts.slice(0, -1).join(' '), parts[parts.length - 1]];
}

/** Player card · card density — the grid/lineup-slot layout from the Foundations mockup:
 * a vertical year spine on the left, a two-line name + team chip, the rating badge with its
 * tier glow top-right, and a stat row underneath a hairline. */
export default function PlayerCard({ player, onRemove, onReroll, compact, onClick }: PlayerCardProps) {
  const { year, team } = parseYear(player.eraTeam);
  const [first, last] = splitName(player.name);
  const hue = teamHue(player.teamKey || player.eraTeam);
  const tier = getTier(player.OVR);
  const dim = player.OVR < 60;

  const spineBg = `linear-gradient(180deg, hsl(${hue} 42% 14%), hsl(${hue} 30% 8%))`;
  const spineBorder = `hsl(${hue} 40% 22%)`;
  const nameColor = dim ? 'var(--color-text-mid)' : 'var(--color-text-hi)';

  return (
    <div
      className="group flex overflow-hidden bg-surface-2 border border-surface-4 hover:border-[#4A423D] hover:bg-[#221D1B] transition-colors cursor-pointer"
      style={{ opacity: dim ? 0.94 : 1 }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      {/* year spine */}
      <div
        className="flex-none flex items-center justify-center border-r"
        style={{ width: 30, background: spineBg, borderColor: spineBorder }}
      >
        <span
          style={{
            fontFamily: 'Archivo, sans-serif',
            fontVariationSettings: "'wdth' 74,'wght' 700",
            fontSize: 16,
            color: tier.numeral,
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            letterSpacing: '.06em',
            fontFeatureSettings: "'tnum' 1",
          }}
        >
          {year ? `'${year}` : '—'}
        </span>
      </div>

      <div className="flex-1 min-w-0 p-3.5">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0">
            <div
              style={{
                fontFamily: 'Archivo, sans-serif',
                fontVariationSettings: "'wdth' 78,'wght' 700",
                fontSize: 20,
                lineHeight: 1.05,
                color: nameColor,
              }}
            >
              {first}
              {last && (
                <>
                  <br />
                  {last}
                </>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-[7px]">
              <span
                className="font-mono text-[10.5px] pl-1.5"
                style={{
                  color: dim ? 'var(--color-muted)' : 'var(--color-text-mid)',
                  borderLeft: `2px solid var(--color-amber-500)`,
                }}
              >
                {team || player.eraTeam}
              </span>
              <span className="text-[10.5px] text-muted">{player.pos}</span>
            </div>
          </div>

          <OvrBadge ovr={player.OVR} size={compact ? 'sm' : 'md'} />
        </div>

        {!compact && (
          <div className="flex gap-3 mt-3.5 pt-3 border-t border-hairline">
            <div>
              <div className="font-mono text-[9px] tracking-[.1em] text-muted">PTS</div>
              <div className="font-mono font-tnum text-[14px] text-text-body-hi">{player.ppg}</div>
            </div>
            <div>
              <div className="font-mono text-[9px] tracking-[.1em] text-muted">REB</div>
              <div className="font-mono font-tnum text-[14px] text-text-body-hi">{player.rpg}</div>
            </div>
            <div>
              <div className="font-mono text-[9px] tracking-[.1em] text-muted">AST</div>
              <div className="font-mono font-tnum text-[14px] text-text-body-hi">{player.apg}</div>
            </div>
            <div className="ml-auto text-right">
              <div className="font-mono text-[9px] tracking-[.1em] text-muted">COST</div>
              <div className="font-mono font-tnum text-[14px] text-amber-500">{player.cost}</div>
            </div>
          </div>
        )}
      </div>

      {(onReroll || onRemove) && (
        <div
          className="flex-none flex flex-col gap-1 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
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
