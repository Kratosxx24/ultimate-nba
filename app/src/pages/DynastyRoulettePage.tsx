import { useMemo, useState } from 'react';
import { getAllPlayers } from '../lib/players';
import { getTeamColors } from '../lib/teamColors';
import { emptyLineup, summarizeLineup, type LineupSlot } from '../lib/lineup';
import PlayerCard from '../components/PlayerCard';
import EmptySlot from '../components/EmptySlot';
import LineupSummaryPanel from '../components/LineupSummaryPanel';
import PlayerPickerModal from '../components/PlayerPickerModal';
import type { Player } from '../types/player';

const SPIN_DURATION_MS = 650;

function decadeOf(eraTeam: string): number {
  const m = eraTeam.match(/^'?(\d{2,4})/);
  if (!m) return 0;
  const n = parseInt(m[1], 10);
  const year = n < 100 ? (n >= 40 ? 1900 + n : 2000 + n) : n;
  return Math.floor(year / 10) * 10;
}

interface Roll {
  teamKey: string;
  decade: number;
}

export default function DynastyRoulettePage() {
  const players = useMemo(() => getAllPlayers(), []);

  // Every (team, decade) pair that actually has players, so a roll never lands empty.
  const rollablePairs = useMemo(() => {
    const seen = new Map<string, Roll>();
    for (const p of players) {
      const key = `${p.teamKey}::${decadeOf(p.eraTeam)}`;
      if (!seen.has(key)) seen.set(key, { teamKey: p.teamKey, decade: decadeOf(p.eraTeam) });
    }
    return [...seen.values()];
  }, [players]);

  const [roll, setRoll] = useState<Roll | null>(null);
  const [rolling, setRolling] = useState(false);
  const [slots, setSlots] = useState<LineupSlot[]>(emptyLineup());
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);
  const [veteranMode, setVeteranMode] = useState(false);

  const pool: Player[] = useMemo(() => {
    if (!roll) return [];
    return players.filter((p) => p.teamKey === roll.teamKey && decadeOf(p.eraTeam) === roll.decade);
  }, [players, roll]);

  const summary = summarizeLineup(slots);
  const teamColors = roll ? getTeamColors(roll.teamKey) : null;

  function usedIds(excludeIndex?: number): Set<string> {
    return new Set(
      slots
        .filter((_, i) => i !== excludeIndex)
        .filter((p): p is NonNullable<LineupSlot> => p !== null)
        .map((p) => p.id),
    );
  }

  function spin() {
    setRolling(true);
    setSlots(emptyLineup());
    window.setTimeout(() => {
      const next = rollablePairs[Math.floor(Math.random() * rollablePairs.length)];
      setRoll(next);
      setRolling(false);
    }, SPIN_DURATION_MS);
  }

  function clearSlot(index: number) {
    setSlots((prev) => prev.map((p, i) => (i === index ? null : p)));
  }

  function clearAll() {
    setSlots(emptyLineup());
  }

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

      {/* roll banner — spin lands on a team + decade, then you draft five from that era */}
      <div
        className="border border-surface-4 p-6 flex flex-wrap items-center justify-between gap-6"
        style={{
          background: teamColors
            ? `linear-gradient(120deg, ${teamColors.primary}22, var(--color-surface-1))`
            : 'var(--color-surface-1)',
        }}
      >
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[.22em] text-muted mb-2">🎲 Dynasty Roulette</div>
          {rolling ? (
            <div
              className="text-text-hi animate-pulse"
              style={{ fontFamily: 'Archivo, sans-serif', fontVariationSettings: "'wdth' 72,'wght' 800", fontSize: 34 }}
            >
              Rolling…
            </div>
          ) : roll ? (
            <div className="flex items-baseline gap-3">
              <span
                style={{
                  fontFamily: 'Archivo, sans-serif',
                  fontVariationSettings: "'wdth' 72,'wght' 800",
                  fontSize: 34,
                  color: teamColors?.primary,
                }}
              >
                {roll.teamKey}
              </span>
              <span className="font-mono text-lg text-text-mid">{roll.decade}s</span>
            </div>
          ) : (
            <div
              className="text-text-mid"
              style={{ fontFamily: 'Archivo, sans-serif', fontVariationSettings: "'wdth' 72,'wght' 800", fontSize: 34 }}
            >
              Hit spin to roll
            </div>
          )}
          <p className="text-xs text-text-low mt-2 max-w-md">
            Each spin lands a team + decade — draft your five from that franchise era.
            {veteranMode && ' Veteran mode is on: ratings and archetypes stay hidden while you draft.'}
          </p>
        </div>
        <button
          type="button"
          onClick={spin}
          disabled={rolling}
          className="px-5 py-2.5 bg-amber-500 text-[#1A1410] text-sm font-semibold font-mono uppercase tracking-[.08em] hover:bg-amber-300 disabled:opacity-50 transition-colors flex-none"
        >
          🎲 Spin
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-2">
          {!roll ? (
            <div className="border border-dashed border-surface-4 p-8 text-center text-sm text-text-low font-mono">
              Spin to roll a team and decade, then draft your five.
            </div>
          ) : (
            slots.map((slot, i) =>
              slot ? (
                <PlayerCard key={slot.id} player={slot} compact onRemove={() => clearSlot(i)} />
              ) : (
                <EmptySlot key={i} label={`Slot ${i + 1} — draft from ${roll.teamKey}`} onClick={() => setPickerIndex(i)} />
              ),
            )
          )}
          {roll && (
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

      {pickerIndex !== null && (
        <PlayerPickerModal
          players={pool.filter((p) => !usedIds(pickerIndex).has(p.id))}
          blind={veteranMode}
          onClose={() => setPickerIndex(null)}
          onSelect={(p) => {
            setSlots((prev) => prev.map((s, i) => (i === pickerIndex ? p : s)));
            setPickerIndex(null);
          }}
        />
      )}
    </div>
  );
}
