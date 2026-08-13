import { useMemo } from 'react';
import type { Player } from '../types/player';
import {
  calcDR,
  projectRecord,
  lineupReadout,
  talentIndex,
  isLegalLineup,
  assignSlots,
  SLOTS,
} from '../lib/dr';
import { namedSynergies } from '../lib/playerFunctions';

// The Dominance Rating readout for a completed five.
//
// Two numbers, deliberately: DR is "how good are these five on paper", the record is
// "what would 82 games actually look like". They diverge on purpose — a lineup can be
// stacked on paper and still project badly if it can't guard anyone or everybody
// needs the ball. The rest of the panel exists to explain WHY they diverge.

function Stat({ label, value, hero }: { label: string; value: string; hero?: boolean }) {
  return (
    <div className="flex items-baseline justify-between py-1.5 border-b border-hairline last:border-b-0">
      <span className="font-mono text-[10px] uppercase tracking-[.12em] text-text-low">{label}</span>
      <span
        className={`font-mono font-tnum ${hero ? 'text-amber-300 font-semibold text-base' : 'text-sm text-text-body-hi'}`}
      >
        {value}
      </span>
    </div>
  );
}

function Chip({ text, tone }: { text: string; tone: 'good' | 'note' }) {
  const good = tone === 'good';
  return (
    <span
      className="font-mono text-[10px] uppercase tracking-[.08em] px-1.5 py-0.5 border"
      style={{
        color: good ? 'var(--color-amber-300, #F0A56C)' : 'var(--color-text-low)',
        borderColor: good ? 'var(--color-amber-700, rgba(240,135,58,.35))' : 'var(--color-surface-4)',
        background: good ? 'rgba(240,135,58,.10)' : 'transparent',
      }}
    >
      {text}
    </span>
  );
}

export default function DominancePanel({ five, pool }: { five: Player[]; pool: Player[] }) {
  const data = useMemo(() => {
    if (five.length !== 5 || !isLegalLineup(five)) return null;
    return {
      dr: calcDR(five, pool),
      record: projectRecord(five, pool),
      talent: talentIndex(five),
      readout: lineupReadout(five),
      synergies: namedSynergies(five),
      assigned: assignSlots(five),
    };
  }, [five, pool]);

  if (!data) return null;
  const { dr, record, talent, readout, synergies, assigned } = data;

  return (
    <div className="border border-surface-4 rounded-2xl p-4" style={{ background: 'var(--color-surface-2)' }}>
      <div
        className="mb-3 text-text-hi"
        style={{ fontFamily: 'Archivo, sans-serif', fontVariationSettings: "'wdth' 82,'wght' 700", fontSize: 15 }}
      >
        Dominance Rating
      </div>

      <div className="flex items-end gap-4 mb-3">
        <div>
          <div className="font-mono font-tnum text-4xl leading-none text-amber-300 font-semibold">
            {dr.toFixed(1)}
          </div>
          <div className="font-mono text-[9px] uppercase tracking-[.14em] text-text-low mt-1">DR</div>
        </div>
        <div>
          <div className="font-mono font-tnum text-2xl leading-none text-text-hi">{record.label}</div>
          <div className="font-mono text-[9px] uppercase tracking-[.14em] text-text-low mt-1">
            projected 82 games
          </div>
        </div>
      </div>

      <Stat label="Talent index" value={talent.toFixed(1)} />
      <Stat label="Usage friction" value={readout.friction.toFixed(2)} />

      {readout.strengths.length > 0 && (
        <div className="mt-3">
          <div className="font-mono text-[9px] uppercase tracking-[.14em] text-text-low mb-1.5">Strengths</div>
          <div className="flex flex-wrap gap-1">
            {readout.strengths.slice(0, 3).map((s) => (
              <Chip key={s.key} tone="good" text={`${s.label} · ${s.providers} deep`} />
            ))}
          </div>
        </div>
      )}

      {(readout.weaknesses.length > 0 || readout.thin.length > 0) && (
        <div className="mt-3">
          <div className="font-mono text-[9px] uppercase tracking-[.14em] text-text-low mb-1.5">
            {readout.weaknesses.length ? 'Holes' : 'Thin'}
          </div>
          <div className="flex flex-wrap gap-1">
            {(readout.weaknesses.length ? readout.weaknesses : readout.thin.slice(0, 2)).map((s) => (
              <Chip key={s.key} tone="note" text={`${s.label} · best ${s.value.toFixed(1)}`} />
            ))}
          </div>
        </div>
      )}

      {synergies.length > 0 && (
        <div className="mt-3 space-y-1.5">
          <div className="font-mono text-[9px] uppercase tracking-[.14em] text-text-low">Synergies</div>
          {synergies.map((s) => (
            <div key={s.key} className="text-[11px] leading-snug text-text-mid">
              <span className="text-text-hi">
                {s.icon} {s.name}
              </span>{' '}
              — {s.text}
            </div>
          ))}
        </div>
      )}

      {(readout.deadSpots.nonShooters >= 2 || readout.deadSpots.huntable >= 3) && (
        <p className="mt-3 text-[10px] leading-snug text-text-low">
          {readout.deadSpots.nonShooters >= 2 && `${readout.deadSpots.nonShooters} non-shooters on the floor. `}
          {readout.deadSpots.huntable >= 3 && `${readout.deadSpots.huntable} defenders who can be hunted.`}
        </p>
      )}

      {assigned && (
        <p className="mt-3 pt-2 border-t border-hairline font-mono text-[10px] text-text-low">
          {SLOTS.map((s) => `${s} ${assigned[s].name.split(' ').slice(-1)[0]}`).join(' · ')}
        </p>
      )}
    </div>
  );
}
