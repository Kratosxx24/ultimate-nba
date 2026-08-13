import { useState } from 'react';
import { emptyLineup, summarizeLineup, type LineupSlot } from '../lib/lineup';
import type { Player } from '../types/player';
import PlayerCard from '../components/PlayerCard';
import EmptySlot from '../components/EmptySlot';
import LineupSummaryPanel from '../components/LineupSummaryPanel';
import PlayerPickerModal from '../components/PlayerPickerModal';

interface PickerTarget {
  side: 'a' | 'b';
  index: number;
}

function LineupColumn({
  title,
  slots,
  onPick,
  onRemove,
}: {
  title: string;
  slots: LineupSlot[];
  onPick: (index: number) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="space-y-2">
      <h2 className="text-sm font-mono uppercase tracking-[.12em] text-text-low">{title}</h2>
      {slots.map((slot, i) =>
        slot ? (
          <PlayerCard key={slot.id} player={slot} onRemove={() => onRemove(i)} />
        ) : (
          <EmptySlot key={i} label={`Slot ${i + 1} — pick a player`} onClick={() => onPick(i)} />
        ),
      )}
    </div>
  );
}

export default function CompareLineupsPage() {
  const [lineupA, setLineupA] = useState<LineupSlot[]>(emptyLineup());
  const [lineupB, setLineupB] = useState<LineupSlot[]>(emptyLineup());
  const [pickerTarget, setPickerTarget] = useState<PickerTarget | null>(null);

  const summaryA = summarizeLineup(lineupA);
  const summaryB = summarizeLineup(lineupB);

  function applyPick(player: Player) {
    if (!pickerTarget) return;
    const setter = pickerTarget.side === 'a' ? setLineupA : setLineupB;
    setter((prev) => prev.map((p, i) => (i === pickerTarget.index ? player : p)));
    setPickerTarget(null);
  }

  function removeFrom(side: 'a' | 'b', index: number) {
    const setter = side === 'a' ? setLineupA : setLineupB;
    setter((prev) => prev.map((p, i) => (i === index ? null : p)));
  }

  const diff = summaryA.avgOvr - summaryB.avgOvr;

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-text-hi"
          style={{ fontFamily: 'Archivo, sans-serif', fontVariationSettings: "'wdth' 78,'wght' 800", fontSize: 30 }}
        >
          Compare Lineups
        </h1>
        <p className="text-sm text-text-mid mt-1">
          Build two 5-man lineups from any era and see how they stack up.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <LineupColumn
          title="Lineup A"
          slots={lineupA}
          onPick={(index) => setPickerTarget({ side: 'a', index })}
          onRemove={(index) => removeFrom('a', index)}
        />
        <LineupColumn
          title="Lineup B"
          slots={lineupB}
          onPick={(index) => setPickerTarget({ side: 'b', index })}
          onRemove={(index) => removeFrom('b', index)}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <LineupSummaryPanel summary={summaryA} title="Lineup A Summary" />
        <LineupSummaryPanel summary={summaryB} title="Lineup B Summary" />
      </div>

      {(summaryA.filledCount > 0 || summaryB.filledCount > 0) && (
        <div className="border border-surface-4 bg-surface-2 p-4 text-center">
          {diff === 0 ? (
            <span className="text-text-mid">Dead even on average OVR.</span>
          ) : (
            <span className="text-text-hi">
              <span className="font-semibold text-blue-300">Lineup {diff > 0 ? 'A' : 'B'}</span>{' '}
              leads by {Math.abs(diff).toFixed(1)} avg OVR
            </span>
          )}
        </div>
      )}

      {pickerTarget && (
        <PlayerPickerModal onSelect={applyPick} onClose={() => setPickerTarget(null)} />
      )}
    </div>
  );
}
