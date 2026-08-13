import { useMemo, useRef, useState } from 'react';
import { getAllPlayers } from '../lib/players';
import { getTeamColors } from '../lib/teamColors';
import { archetypeFamily } from '../lib/archetype';
import OvrBadge, { getTier } from '../components/OvrBadge';
import { useTheme } from '../lib/ThemeContext';
import type { Player } from '../types/player';

// Ported from the original NBA Ultimate Lineup Builder's "Dynasty Roulette" (conference.js
// + styles.css): five fixed position slots, each its own spin. Spin lands a team + decade;
// drafting replaces the slot row in place (not a modal) with a position-chip switcher and a
// grid of rich stat cards; picking locks that spot for good, then you spin again.
const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C'] as const;
type Position = (typeof POSITIONS)[number];

// Exact position accents from the original app's :root tokens (--pos-pg, --pos-sg, ...).
const POSITION_COLOR: Record<Position, string> = {
  PG: '#2563eb',
  SG: '#7c3aed',
  SF: '#16a34a',
  PF: '#dc2626',
  C: '#ea580c',
};

const FLASH_STEPS = 30;
const FLASH_TOTAL_DELAY = (step: number) => 43 + Math.pow(step / FLASH_STEPS, 2.4) * 129;

function decadeOf(eraTeam: string): number {
  const m = eraTeam.match(/^'?(\d{2,4})/);
  if (!m) return 0;
  const n = parseInt(m[1], 10);
  const year = n < 100 ? (n >= 40 ? 1900 + n : 2000 + n) : n;
  return Math.floor(year / 10) * 10;
}

function positionsOf(p: Player): string[] {
  return p.pos.split('/').map((s) => s.trim());
}

// eraTeam is formatted like "'96 Bulls" — split so year and team can share the same
// font/color treatment as the roll banner's decade (amber) + team (brand color) pairing.
function splitEraTeam(eraTeam: string): { year: string; team: string } {
  const m = eraTeam.match(/^('?\d{2,4})\s*(.*)$/);
  if (m) return { year: m[1], team: m[2] || eraTeam };
  return { year: '', team: eraTeam };
}

function YearTeam({ eraTeam, teamColor }: { eraTeam: string; teamColor: string }) {
  const { year, team } = splitEraTeam(eraTeam);
  return (
    <div className="font-mono text-[11px] flex items-baseline gap-1">
      <span style={{ color: 'var(--color-amber-500)' }}>{year}</span>
      <span style={{ color: teamColor }}>{team}</span>
    </div>
  );
}

interface Combo {
  teamKey: string;
  decade: number;
}

type Roster = Record<Position, Player | null>;
const emptyRoster = (): Roster => ({ PG: null, SG: null, SF: null, PF: null, C: null });

// Solid-fill variant of the shared archetype palette — the translucent/light-text version
// reads fine in a dense table row but washes out on these bigger draft cards, especially
// in light mode, so these cards use the family hue as a solid background with white text.
const ARCHETYPE_SOLID: Record<string, string> = {
  playmaking: '#3D6BB0',
  defense: '#3E8F73',
  scoring: '#C46A2E',
  post: '#8460AE',
  role: '#6B655F',
};

function ArchetypeBadge({ archetype }: { archetype: string }) {
  const bg = ARCHETYPE_SOLID[archetypeFamily(archetype)];
  return (
    <span className="inline-block text-[10.5px] font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: bg }}>
      {archetype}
    </span>
  );
}

function StatCell({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between font-mono text-[11px]">
      <span className="text-text-low">{label}</span>
      <strong className="text-text-body-hi font-tnum">{value}</strong>
    </div>
  );
}

export default function DynastyRoulettePage() {
  const { theme } = useTheme();
  const players = useMemo(() => getAllPlayers(), []);

  const rollablePairs = useMemo(() => {
    const seen = new Map<string, Combo>();
    for (const p of players) {
      const key = `${p.teamKey}::${decadeOf(p.eraTeam)}`;
      if (!seen.has(key)) seen.set(key, { teamKey: p.teamKey, decade: decadeOf(p.eraTeam) });
    }
    return [...seen.values()];
  }, [players]);

  const [roster, setRoster] = useState<Roster>(emptyRoster());
  const [combo, setCombo] = useState<Combo | null>(null);
  const [flashCombo, setFlashCombo] = useState<Combo | null>(null);
  const [rolling, setRolling] = useState(false);
  const [awaiting, setAwaiting] = useState(false); // rolled, not yet drafted from
  const [usedTeamReroll, setUsedTeamReroll] = useState(false);
  const [usedDecadeReroll, setUsedDecadeReroll] = useState(false);
  const [viewPos, setViewPos] = useState<Position | null>(null); // which position's pool is open
  const [veteranMode, setVeteranMode] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const usedNames = useMemo(
    () => new Set(POSITIONS.map((pos) => roster[pos]).filter((p): p is Player => p !== null).map((p) => p.name)),
    [roster],
  );
  const openPositions = useMemo(() => POSITIONS.filter((pos) => !roster[pos]), [roster]);
  const lockedCount = POSITIONS.length - openPositions.length;
  const allLocked = openPositions.length === 0;

  const fillablePositions = useMemo(() => {
    if (!combo) return new Set<Position>();
    const out = new Set<Position>();
    for (const p of players) {
      if (p.teamKey !== combo.teamKey || decadeOf(p.eraTeam) !== combo.decade || usedNames.has(p.name)) continue;
      for (const pos of positionsOf(p)) {
        if ((POSITIONS as readonly string[]).includes(pos) && openPositions.includes(pos as Position)) {
          out.add(pos as Position);
        }
      }
    }
    return out;
  }, [players, combo, usedNames, openPositions]);

  function poolFor(pos: Position): Player[] {
    if (!combo) return [];
    const seen = new Set<string>();
    return players
      .filter((p) => {
        if (p.teamKey !== combo.teamKey || decadeOf(p.eraTeam) !== combo.decade) return false;
        if (usedNames.has(p.name) || seen.has(p.name)) return false;
        if (!positionsOf(p).includes(pos)) return false;
        seen.add(p.name);
        return true;
      })
      .sort((a, b) => b.OVR - a.OVR)
      .slice(0, 5); // cap the display pool at 5, like the original — best OVR first
  }

  const teamColors = getTeamColors((flashCombo ?? combo)?.teamKey);

  function comboFillsAnyOpen(c: Combo, open: Position[], used: Set<string>): boolean {
    return players.some(
      (p) => p.teamKey === c.teamKey && decadeOf(p.eraTeam) === c.decade && !used.has(p.name) && positionsOf(p).some((pos) => open.includes(pos as Position)),
    );
  }

  function flashRoll(finalPick: () => Combo, onLand: (c: Combo) => void) {
    setRolling(true);
    setViewPos(null);
    let step = 0;
    function tick() {
      if (step >= FLASH_STEPS) {
        setRolling(false);
        const landed = finalPick();
        setFlashCombo(landed);
        onLand(landed);
        return;
      }
      const r = rollablePairs[Math.floor(Math.random() * rollablePairs.length)];
      setFlashCombo(r);
      step++;
      timeoutRef.current = window.setTimeout(tick, FLASH_TOTAL_DELAY(step));
    }
    tick();
  }

  function spin() {
    if (rolling || awaiting || allLocked) return;
    const fillable = rollablePairs.filter((c) => comboFillsAnyOpen(c, openPositions, usedNames));
    if (!fillable.length) return;
    flashRoll(
      () => fillable[Math.floor(Math.random() * fillable.length)],
      (landed) => {
        setCombo(landed);
        setAwaiting(true);
      },
    );
  }

  function switchTeam() {
    if (rolling || !awaiting || usedTeamReroll || !combo) return;
    const opts = rollablePairs.filter((c) => c.decade === combo.decade && comboFillsAnyOpen(c, openPositions, usedNames));
    if (!opts.length) return;
    setUsedTeamReroll(true);
    flashRoll(
      () => opts[Math.floor(Math.random() * opts.length)],
      (landed) => setCombo(landed),
    );
  }

  function rerollDecade() {
    if (rolling || !awaiting || usedDecadeReroll || !combo) return;
    const opts = rollablePairs.filter((c) => c.teamKey === combo.teamKey && comboFillsAnyOpen(c, openPositions, usedNames));
    if (!opts.length) return;
    setUsedDecadeReroll(true);
    flashRoll(
      () => opts[Math.floor(Math.random() * opts.length)],
      (landed) => setCombo(landed),
    );
  }

  function pickForPosition(pos: Position, p: Player) {
    setRoster((prev) => ({ ...prev, [pos]: p }));
    setAwaiting(false);
    setViewPos(null);
  }

  function clearAll() {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    setRoster(emptyRoster());
    setCombo(null);
    setFlashCombo(null);
    setRolling(false);
    setAwaiting(false);
    setUsedTeamReroll(false);
    setUsedDecadeReroll(false);
    setViewPos(null);
  }

  const shownCombo = flashCombo ?? combo;
  const fillableList = [...fillablePositions];
  const drafting = awaiting && viewPos !== null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setVeteranMode((v) => !v)}
          className="px-3 py-1.5 border border-surface-4 text-xs font-mono uppercase tracking-[.1em] hover:bg-surface-3 transition-colors flex items-center gap-2"
        >
          <span
            className="w-1.5 h-1.5 rounded-full inline-block"
            style={{ background: veteranMode ? 'var(--color-amber-500)' : 'var(--color-surface-5)' }}
          />
          Veteran mode: {veteranMode ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* roll banner — compact, centered */}
      <div
        className="border border-surface-4 px-5 py-3 flex flex-col items-center text-center gap-1.5"
        style={{
          background: shownCombo
            ? `linear-gradient(120deg, ${teamColors.primary}22, var(--color-surface-1))`
            : 'var(--color-surface-1)',
        }}
      >
        <div className="flex items-baseline gap-2" style={rolling ? { animation: 'cbRollPulse 0.12s ease-in-out infinite alternate' } : undefined}>
          {shownCombo ? (
            <>
              <span
                style={{
                  fontFamily: 'Archivo, sans-serif',
                  fontVariationSettings: "'wdth' 100,'wght' 800",
                  fontSize: 52,
                  color: teamColors.primary,
                }}
              >
                {shownCombo.teamKey}
              </span>
              <span
                style={{
                  fontFamily: 'Archivo, sans-serif',
                  fontVariationSettings: "'wdth' 100,'wght' 800",
                  fontSize: 52,
                  color: teamColors.primary,
                }}
              >
                {shownCombo.decade}s
              </span>
            </>
          ) : (
            <span className="text-text-mid" style={{ fontFamily: 'Archivo, sans-serif', fontVariationSettings: "'wdth' 100,'wght' 800", fontSize: 52 }}>
              Hit spin to roll
            </span>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={spin}
            disabled={rolling || awaiting || allLocked}
            className="px-3 py-1 bg-amber-500 text-[#1A1410] text-[10px] font-semibold font-mono uppercase tracking-[.08em] hover:bg-amber-300 disabled:opacity-50 transition-colors"
          >
            🎲 {allLocked ? 'Complete' : awaiting ? 'Pick a spot' : combo ? 'Spin for next spot' : 'Spin'}
          </button>

          {awaiting && !rolling && (
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={switchTeam}
                disabled={usedTeamReroll}
                className="text-[9px] font-mono uppercase tracking-[.08em] px-1.5 py-1 border disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                style={{ color: 'var(--color-amber-500)', borderColor: 'var(--color-amber-700)' }}
              >
                {usedTeamReroll ? '✓ Team used' : 'Switch team'}
              </button>
              <button
                type="button"
                onClick={rerollDecade}
                disabled={usedDecadeReroll}
                className="text-[9px] font-mono uppercase tracking-[.08em] px-1.5 py-1 border disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                style={{ color: 'var(--color-amber-500)', borderColor: 'var(--color-amber-700)' }}
              >
                {usedDecadeReroll ? '✓ Decade used' : 'Re-roll decade'}
              </button>
            </div>
          )}
        </div>

        <p className="text-[11px] text-text-low max-w-md">
          {rolling
            ? 'Rolling a team & decade…'
            : allLocked
              ? 'Dynasty complete — five locked picks across five rolls.'
              : awaiting
                ? `Open: ${fillableList.join(' · ') || '—'} · ${lockedCount}/5 locked`
                : `Spin, draft into an open position, then spin again. ${lockedCount}/5 locked.`}
          {veteranMode && !rolling && ' Veteran mode: ratings and archetypes hidden.'}
        </p>
      </div>

      {/* draft overlay — replaces the position row in place while awaiting a pick with a chosen position */}
      {drafting && viewPos ? (
        <div className="border border-surface-4 p-4 animate-[confOverlayIn_.18s_ease]" style={{ background: 'var(--color-surface-1)' }}>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 mb-4">
            <div className="text-sm">
              <span className="text-text-hi">Drafting </span>
              <b style={{ color: 'var(--color-amber-500)' }}>{viewPos}</b>
              <span className="text-text-low"> · {combo?.teamKey} {combo?.decade}s</span>
            </div>
            <div className="flex items-center gap-2 justify-self-center">
              {POSITIONS.map((pos) => {
                const isOpen = openPositions.includes(pos);
                const isAvail = fillablePositions.has(pos);
                const isCurrent = pos === viewPos;
                const filledPlayer = roster[pos];
                return (
                  <button
                    key={pos}
                    type="button"
                    disabled={!isOpen || !isAvail}
                    onClick={() => setViewPos(pos)}
                    title={filledPlayer ? `${pos} — locked` : isAvail ? `${pos} — available this spin` : `${pos} — not this spin`}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold transition-transform"
                    style={{
                      border: isCurrent ? `2px solid ${POSITION_COLOR[pos]}` : '2px dashed var(--color-surface-4)',
                      background: filledPlayer ? POSITION_COLOR[pos] : isAvail ? `${POSITION_COLOR[pos]}22` : 'transparent',
                      color: filledPlayer ? '#fff' : isAvail ? POSITION_COLOR[pos] : 'var(--color-text-low)',
                      opacity: isOpen && !isAvail ? 0.4 : 1,
                      cursor: isOpen && isAvail ? 'pointer' : 'default',
                      transform: isCurrent ? 'scale(1.08)' : undefined,
                    }}
                  >
                    {pos}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => setViewPos(null)}
              title="Back to spots"
              className="w-8 h-8 justify-self-end border border-surface-4 text-text-low hover:border-amber-500 hover:text-text-hi transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {poolFor(viewPos).map((p) => {
              const pc = getTeamColors(p.teamKey);
              return (
                <div
                  key={p.id}
                  className="flex flex-col p-4 gap-2.5 w-[260px] flex-none"
                  style={{ background: 'var(--color-surface-2)', borderTop: `4px solid ${pc.primary}`, border: '1px solid var(--color-surface-4)', borderTopWidth: 4, borderTopColor: pc.primary }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <YearTeam eraTeam={p.eraTeam} teamColor={pc.primary} />
                      <div className="text-base font-semibold text-text-hi leading-tight break-words">{p.name}</div>
                    </div>
                    {veteranMode ? (
                      <span className="font-mono text-base px-3 py-2 rounded" style={{ background: 'var(--color-surface-3)', color: 'var(--color-text-low)' }}>
                        ?
                      </span>
                    ) : (
                      <OvrBadge ovr={p.OVR} size="md" />
                    )}
                  </div>
                  {!veteranMode && <ArchetypeBadge archetype={p.archetype} />}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-2 border-t border-hairline">
                    <StatCell label="PPG" value={p.ppg.toFixed(1)} />
                    <StatCell label="RPG" value={p.rpg.toFixed(1)} />
                    <StatCell label="APG" value={p.apg.toFixed(1)} />
                    {!veteranMode && (
                      <>
                        <StatCell label="USG" value={`${p.usg.toFixed(0)}%`} />
                        <StatCell label="TS%" value={p.ts.toFixed(1)} />
                        <StatCell label="WS/48" value={p.ws48.toFixed(3)} />
                        <StatCell label="OFF" value={p.offBase} />
                        <StatCell label="DEF" value={p.defBase} />
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => pickForPosition(viewPos, p)}
                    className="mt-1 py-2 text-xs font-mono uppercase tracking-[.08em] font-semibold text-white transition-colors"
                    style={{ background: 'var(--color-amber-600)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-amber-500)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-amber-600)')}
                  >
                    Draft into {viewPos}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* five position slots, horizontal row */
        <div className="grid grid-cols-5 gap-3">
          {POSITIONS.map((pos) => {
            const player = roster[pos];
            const isFillable = awaiting && fillablePositions.has(pos);
            const isDimmed = awaiting && !player && !fillablePositions.has(pos);
            const posColor = POSITION_COLOR[pos];

            if (player) {
              const tier = getTier(player.OVR, theme);
              const pc = getTeamColors(player.teamKey);
              return (
                <div
                  key={pos}
                  className="p-4 flex flex-col items-center text-center gap-2.5 min-h-[180px] justify-center"
                  style={{
                    background: 'var(--color-surface-1)',
                    borderLeft: '1px solid var(--color-surface-4)',
                    borderRight: '1px solid var(--color-surface-4)',
                    borderBottom: '1px solid var(--color-surface-4)',
                    borderTop: `4px solid ${pc.primary}`,
                  }}
                >
                  <span className="font-mono text-[11px] uppercase tracking-[.14em] text-muted">{pos}</span>
                  <OvrBadge ovr={player.OVR} size="lg" />
                  <div className="text-base leading-tight" style={{ color: tier.numeral === '#6B655F' ? undefined : 'var(--color-text-hi)' }}>
                    {player.name}
                  </div>
                  <YearTeam eraTeam={player.eraTeam} teamColor={pc.primary} />
                  <ArchetypeBadge archetype={player.archetype} />
                </div>
              );
            }

            return (
              <button
                key={pos}
                type="button"
                disabled={!isFillable}
                onClick={() => isFillable && setViewPos(pos)}
                className="border border-dashed p-4 flex flex-col items-center justify-center gap-2.5 min-h-[180px] transition-colors"
                style={{
                  borderColor: awaiting ? (isFillable ? posColor : 'var(--color-surface-4)') : posColor,
                  background: isFillable ? `${posColor}14` : 'var(--color-surface-1)',
                  opacity: isDimmed ? 0.4 : 1,
                  filter: isDimmed ? 'grayscale(.35)' : undefined,
                  cursor: isFillable ? 'pointer' : 'default',
                }}
              >
                <span className="font-mono text-sm uppercase tracking-[.14em]" style={{ color: isFillable ? posColor : 'var(--color-text-low)' }}>
                  {pos}
                </span>
                <span className="text-2xl text-text-low">+</span>
                <span className="text-[11px] font-mono text-text-low text-center">
                  {isFillable ? 'draft here' : awaiting ? 'unavailable' : 'spin to unlock'}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {(combo || POSITIONS.some((pos) => roster[pos])) && (
        <button
          type="button"
          onClick={clearAll}
          className="text-xs font-mono uppercase tracking-[.1em] text-text-low hover:text-text-mid transition-colors"
        >
          Clear picks
        </button>
      )}
    </div>
  );
}
