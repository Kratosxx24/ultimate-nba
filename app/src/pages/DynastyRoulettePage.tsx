import { useMemo, useRef, useState } from 'react';
import { getAllPlayers } from '../lib/players';
import { getTeamColors } from '../lib/teamColors';
import { summarizeLineup } from '../lib/lineup';
import OvrBadge, { getTier } from '../components/OvrBadge';
import LineupSummaryPanel from '../components/LineupSummaryPanel';
import PlayerPickerModal from '../components/PlayerPickerModal';
import { useTheme } from '../lib/ThemeContext';
import type { Player } from '../types/player';

// Ported from the original NBA Ultimate Lineup Builder's "Dynasty Roulette" (conference.js):
// five fixed position slots (PG/SG/SF/PF/C), each its own spin. Spin lands a team + decade,
// you draft one player from that era into an OPEN position, the spot locks, then spin again.
const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C'] as const;
type Position = (typeof POSITIONS)[number];

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

interface Combo {
  teamKey: string;
  decade: number;
}

type Roster = Record<Position, Player | null>;
const emptyRoster = (): Roster => ({ PG: null, SG: null, SF: null, PF: null, C: null });

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
  const [pickerPos, setPickerPos] = useState<Position | null>(null);
  const [veteranMode, setVeteranMode] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const usedNames = useMemo(
    () => new Set(POSITIONS.map((pos) => roster[pos]).filter((p): p is Player => p !== null).map((p) => p.name)),
    [roster],
  );
  const openPositions = useMemo(() => POSITIONS.filter((pos) => !roster[pos]), [roster]);
  const allLocked = openPositions.length === 0;

  // Which open positions can THIS roll actually fill (has an unused player at that spot)?
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
    return players.filter((p) => {
      if (p.teamKey !== combo.teamKey || decadeOf(p.eraTeam) !== combo.decade) return false;
      if (usedNames.has(p.name) || seen.has(p.name)) return false;
      if (!positionsOf(p).includes(pos)) return false;
      seen.add(p.name);
      return true;
    });
  }

  const summary = summarizeLineup(POSITIONS.map((pos) => roster[pos]));
  const teamColors = getTeamColors((flashCombo ?? combo)?.teamKey);

  function comboFillsAnyOpen(c: Combo, open: Position[], used: Set<string>): boolean {
    return players.some(
      (p) => p.teamKey === c.teamKey && decadeOf(p.eraTeam) === c.decade && !used.has(p.name) && positionsOf(p).some((pos) => open.includes(pos as Position)),
    );
  }

  function flashRoll(finalPick: () => Combo, onLand: (c: Combo) => void) {
    setRolling(true);
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
    setPickerPos(null);
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
  }

  const shownCombo = flashCombo ?? combo;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1
          className="text-text-hi"
          style={{ fontFamily: 'Archivo, sans-serif', fontVariationSettings: "'wdth' 78,'wght' 800", fontSize: 30 }}
        >
          Dynasty Roulette
        </h1>
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

      {/* roll banner */}
      <div
        className="border border-surface-4 p-6 flex flex-wrap items-center justify-between gap-6"
        style={{
          background: shownCombo
            ? `linear-gradient(120deg, ${teamColors.primary}22, var(--color-surface-1))`
            : 'var(--color-surface-1)',
        }}
      >
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[.22em] text-muted mb-2">
            🎲 Dynasty Roulette · 82&#8209;0 run
          </div>
          <div
            className="flex items-baseline gap-3"
            style={rolling ? { animation: 'cbRollPulse 0.12s ease-in-out infinite alternate' } : undefined}
          >
            {shownCombo ? (
              <>
                <span
                  style={{
                    fontFamily: 'Archivo, sans-serif',
                    fontVariationSettings: "'wdth' 72,'wght' 800",
                    fontSize: 34,
                    color: teamColors.primary,
                  }}
                >
                  {shownCombo.teamKey}
                </span>
                <span className="font-mono text-lg" style={{ color: 'var(--color-amber-500)' }}>
                  {shownCombo.decade}s
                </span>
              </>
            ) : (
              <span
                className="text-text-mid"
                style={{ fontFamily: 'Archivo, sans-serif', fontVariationSettings: "'wdth' 72,'wght' 800", fontSize: 34 }}
              >
                Hit spin to roll
              </span>
            )}
          </div>
          <p className="text-xs text-text-low mt-2 max-w-md">
            {rolling
              ? 'Rolling a team & decade…'
              : allLocked
                ? 'Dynasty complete — five locked picks across five rolls.'
                : awaiting
                  ? 'Pick a highlighted position to draft from this era — that spot locks for good.'
                  : 'Spin for a team + decade, draft one player into an open position, then spin again for the next.'}
            {veteranMode && !rolling && ' Veteran mode is on: ratings and archetypes stay hidden while you draft.'}
          </p>
          {awaiting && !rolling && (
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={switchTeam}
                disabled={usedTeamReroll}
                className="text-[11px] font-mono uppercase tracking-[.08em] px-3 py-1.5 border disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                style={{ color: 'var(--color-amber-500)', borderColor: 'var(--color-amber-700)' }}
              >
                {usedTeamReroll ? '✓ Switch team used' : 'Switch team'}
              </button>
              <button
                type="button"
                onClick={rerollDecade}
                disabled={usedDecadeReroll}
                className="text-[11px] font-mono uppercase tracking-[.08em] px-3 py-1.5 border disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                style={{ color: 'var(--color-amber-500)', borderColor: 'var(--color-amber-700)' }}
              >
                {usedDecadeReroll ? '✓ Re-roll decade used' : 'Re-roll decade'}
              </button>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={spin}
          disabled={rolling || awaiting || allLocked}
          className="px-5 py-2.5 bg-amber-500 text-[#1A1410] text-sm font-semibold font-mono uppercase tracking-[.08em] hover:bg-amber-300 disabled:opacity-50 transition-colors flex-none"
        >
          🎲 {allLocked ? 'Complete' : awaiting ? 'Pick a spot' : combo ? 'Spin for next spot' : 'Spin'}
        </button>
      </div>

      {/* five position slots, horizontal row */}
      <div className="grid grid-cols-5 gap-3">
        {POSITIONS.map((pos) => {
          const player = roster[pos];
          const isFillable = awaiting && fillablePositions.has(pos);
          const isDimmed = awaiting && !player && !fillablePositions.has(pos);

          if (player) {
            const tier = getTier(player.OVR, theme);
            const pc = getTeamColors(player.teamKey);
            return (
              <div key={pos} className="border p-3 flex flex-col items-center text-center gap-2" style={{ borderColor: `${pc.primary}55`, background: 'var(--color-surface-1)' }}>
                <span className="font-mono text-[10px] uppercase tracking-[.14em] text-muted">{pos}</span>
                <OvrBadge ovr={player.OVR} size="md" />
                <div className="text-sm leading-tight" style={{ color: tier.numeral === '#6B655F' ? undefined : 'var(--color-text-hi)' }}>
                  {player.name}
                </div>
                <div className="font-mono text-[10px] text-text-low">{player.eraTeam}</div>
              </div>
            );
          }

          return (
            <button
              key={pos}
              type="button"
              disabled={!isFillable}
              onClick={() => isFillable && setPickerPos(pos)}
              className="border border-dashed p-3 flex flex-col items-center justify-center gap-2 min-h-[128px] transition-colors"
              style={{
                borderColor: isFillable ? 'var(--color-amber-500)' : 'var(--color-surface-4)',
                background: isFillable ? 'var(--color-card-hover)' : 'var(--color-surface-1)',
                opacity: isDimmed ? 0.4 : 1,
                filter: isDimmed ? 'grayscale(.35)' : undefined,
                cursor: isFillable ? 'pointer' : 'default',
              }}
            >
              <span
                className="font-mono text-[11px] uppercase tracking-[.14em]"
                style={{ color: isFillable ? 'var(--color-amber-500)' : 'var(--color-text-low)' }}
              >
                {pos}
              </span>
              <span className="text-lg text-text-low">+</span>
              <span className="text-[10px] font-mono text-text-low text-center">
                {isFillable ? 'draft here' : awaiting ? 'unavailable' : 'spin to unlock'}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
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
        <div>
          <LineupSummaryPanel summary={summary} title="Dynasty Summary" />
        </div>
      </div>

      {pickerPos !== null && (
        <PlayerPickerModal
          players={poolFor(pickerPos)}
          blind={veteranMode}
          onClose={() => setPickerPos(null)}
          onSelect={(p) => pickForPosition(pickerPos, p)}
        />
      )}
    </div>
  );
}
