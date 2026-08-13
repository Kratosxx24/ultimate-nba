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
          <h1 className="text-2xl font-bold text-white tracking-tight">Dynasty Roulette</h1>
          <p className="text-sm text-gray-400 mt-1">
            Spin to build a random 5-man roster pulled from every era. Reroll any slot you don't
            like.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={spinAll}
            disabled={anySpinning}
            className="px-4 py-2 rounded-lg bg-purple-500 text-white text-sm font-medium hover:bg-purple-400 disabled:opacity-50 transition-colors"
          >
            🎰 Spin All
          </button>
          <button
            type="button"
            onClick={clearAll}
            disabled={anySpinning}
            className="px-4 py-2 rounded-lg bg-white/5 text-gray-300 text-sm font-medium hover:bg-white/10 disabled:opacity-50 transition-colors"
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
                className="rounded-xl border border-purple-400/30 bg-purple-500/10 p-3 flex items-center gap-3 animate-pulse"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-400/30" />
                <div className="text-sm text-purple-300">Spinning...</div>
              </div>
            ) : slot ? (
              <PlayerCard
                key={slot.id}
                player={slot}
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
