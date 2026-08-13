import { useMemo } from 'react';
import type { Player } from '../types/player';
import { calcDR, projectRecord, lineupReadout, talentIndex, isLegalLineup } from '../lib/dr';

// A live-updating horizontal readout of the Dynasty Roulette build, sitting between the
// roll banner and the position cards — same numbers as DominancePanel/DominanceCompare
// (DR, projected record, talent, friction), just laid out as a strip instead of a block
// so it's visible while you're still drafting, not only once the five is complete.

function StatItem({ label, value, hero }: { label: string; value: string; hero?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span
        className={`font-mono font-tnum leading-none ${hero ? 'text-2xl text-amber-300 font-semibold' : 'text-lg text-text-hi'}`}
      >
        {value}
      </span>
      <span className="font-mono text-[9px] uppercase tracking-[.14em] text-text-low">{label}</span>
    </div>
  );
}

function Divider() {
  return <div className="w-px self-stretch bg-surface-4" />;
}

function Tags({ items, tone }: { items: string[]; tone: 'good' | 'note' }) {
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap gap-1 justify-center">
      {items.map((t) => (
        <span
          key={t}
          className="font-mono text-[9px] uppercase tracking-[.08em] px-1.5 py-0.5 rounded-full border"
          style={{
            color: tone === 'good' ? 'var(--color-amber-300, #F0A56C)' : 'var(--color-text-low)',
            borderColor: tone === 'good' ? 'var(--color-amber-700, rgba(240,135,58,.35))' : 'var(--color-surface-4)',
            background: tone === 'good' ? 'rgba(240,135,58,.10)' : 'transparent',
          }}
        >
          {t}
        </span>
      ))}
    </div>
  );
}

export default function DrStatBar({ five, pool, lockedCount }: { five: Player[]; pool: Player[]; lockedCount: number }) {
  const data = useMemo(() => {
    if (five.length !== 5 || !isLegalLineup(five)) return null;
    const readout = lineupReadout(five);
    return {
      dr: calcDR(five, pool),
      record: projectRecord(five, pool),
      talent: talentIndex(five),
      friction: readout.friction,
      strengths: readout.strengths.slice(0, 3).map((s) => s.label),
      holes: (readout.weaknesses.length ? readout.weaknesses : readout.thin.slice(0, 2)).map((s) => s.label),
    };
  }, [five, pool]);

  return (
    <div
      className="border border-surface-4 rounded-2xl px-5 py-3 flex flex-col items-center gap-2 transition-[background] duration-500"
      style={{ background: 'var(--color-surface-2)' }}
    >
      <div className="flex items-center justify-center gap-5 flex-wrap w-full">
        <StatItem label="DR" value={data ? data.dr.toFixed(1) : '—'} hero />
        <Divider />
        <StatItem label="Proj. record" value={data ? data.record.label : '—'} />
        <Divider />
        <StatItem label="Talent" value={data ? data.talent.toFixed(1) : '—'} />
        <Divider />
        <StatItem label="Friction" value={data ? data.friction.toFixed(2) : '—'} />
        {!data && (
          <span className="font-mono text-[10px] uppercase tracking-[.1em] text-text-low ml-1">
            {lockedCount}/5 locked
          </span>
        )}
      </div>
      {data && (data.strengths.length > 0 || data.holes.length > 0) && (
        <div className="flex items-center gap-4 flex-wrap justify-center pt-1 border-t border-hairline w-full mt-1">
          <Tags items={data.strengths} tone="good" />
          <Tags items={data.holes} tone="note" />
        </div>
      )}
    </div>
  );
}
