import { useMemo, useState } from 'react';
import { getAllPlayers } from '../lib/players';
import { emptyLineup, randomPlayers, summarizeLineup, type LineupSlot } from '../lib/lineup';
import PlayerCard from '../components/PlayerCard';
import EmptySlot from '../components/EmptySlot';
import LineupSummaryPanel from '../components/LineupSummaryPanel';

const SPIN_DURATION_MS = 700;

export default function DynastyRoulettePage() {
  const players = useMemo(() => getAllPlayers(), []);
  const [slots, setSlots] = useState<LineupSlot[]>(emptyLineup());
  const [spinning, setSpinning] = useState<boolean[]>(Array(5).fill(false));

  const summary = summarizeLineup(slots);

  function usedIds(excludeIndex?: number): Set<string> {
    return new Set(
      slots
        .filter((_, i) => i !== excludeIndex)
        .filter((p): p is NonNullable<LineupSlot> => p !== null)
        .map((p) => p.id),
    );
  }

  function spinSlot(index: number) {
    setSpinning((prev) => prev.map((v, i) => (i === index ? true : v)));
    window.setTimeout(() => {
      const [picked] = randomPlayers(players, 1, usedIds(index));
      setSlots((prev) => prev.map((p, i) => (i === index ? picked ?? p : p)));
      setSpinning((prev) => prev.map((v, i) => (i === index ? false : v)));
    }, SPIN_DURATION_MS);
  }

  function spinAll() {
    setSpinning(Array(5).fill(true));
    window.setTimeout(() => {
      const picked = randomPlayers(players, 5);
      setSlots(picked);
      setSpinning(Array(5).fill(false));
    }, SPIN_DURATION_MS);
  }

  function clearSlot(index: number) {
    setSlots((prev) => prev.map((p, i) => (i === index ? null : p)));
  }

  function clearAll() {
    setSlots(emptyLineup());
  }

  const anySpinning = spinning.some(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1
            className="text-text-hi"
            style={{ fontFamily: 'Archivo, sans-serif', fontVariationSettings: "'wdth' 78,'wght' 800", fontSize: 30 }}
          >
            Dynasty Roulette
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={spinAll}
            disabled={anySpinning}
            className="px-4 py-2 bg-amber-500 text-[#1A1410] text-sm font-semibold font-mono uppercase tracking-[.08em] hover:bg-amber-300 disabled:opacity-50 transition-colors"
          >
            🎰 Spin All
          </button>
          <button
            type="button"
            onClick={clearAll}
            disabled={anySpinning}
            className="px-4 py-2 border border-surface-4 text-text-mid text-sm font-medium hover:bg-surface-3 disabled:opacity-50 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-2">
          {slots.map((slot, i) =>
            spinning[i] ? (
              <div
                key={i}
                className="border border-amber-700 bg-amber-900/20 p-3 flex items-center gap-3 animate-pulse"
              >
                <div className="w-10 h-10 bg-amber-700/40" style={{ clipPath: 'polygon(0 0,100% 0,100% 74%,78% 100%,0 100%)' }} />
                <div className="text-sm font-mono uppercase tracking-[.1em] text-amber-300">Spinning...</div>
              </div>
            ) : slot ? (
              <PlayerCard
                key={slot.id}
                player={slot}
                compact
                onReroll={() => spinSlot(i)}
                onRemove={() => clearSlot(i)}
              />
            ) : (
              <EmptySlot key={i} label={`Slot ${i + 1} — empty`} onClick={() => spinSlot(i)} />
            ),
          )}
        </div>

        <div>
          <LineupSummaryPanel summary={summary} title="Dynasty Summary" />
        </div>
      </div>
    </div>
  );
}
