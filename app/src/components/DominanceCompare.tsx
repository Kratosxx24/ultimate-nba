import { useMemo } from 'react';
import type { Player } from '../types/player';
import { calcDR, projectRecord, lineupReadout, talentIndex, isLegalLineup, SLOTS } from '../lib/dr';
import { namedSynergies } from '../lib/playerFunctions';

// Head-to-head Dominance Rating. Two numbers per side, on purpose:
//   DR     — how good these five are on paper, right now
//   record — what 82 games with them would actually look like
// They can disagree, and when they do that IS the interesting result: a lineup can
// win on DR and lose on record because a structural flaw (nobody guards the ball,
// everybody needs it) barely dents a paper rating but compounds over a season.

type Side = {
  legal: boolean;
  filled: number;
  dr: number;
  wins: number;
  record: string;
  talent: number;
  friction: number;
  strengths: string[];
  holes: string[];
  synergies: string[];
};

function evaluate(five: Player[], pool: Player[]): Side {
  const filled = five.length;
  if (filled !== 5 || !isLegalLineup(five)) {
    return { legal: false, filled, dr: 0, wins: 0, record: '—', talent: 0, friction: 0, strengths: [], holes: [], synergies: [] };
  }
  const readout = lineupReadout(five);
  return {
    legal: true,
    filled,
    dr: calcDR(five, pool),
    wins: projectRecord(five, pool).wins,
    record: projectRecord(five, pool).label,
    talent: talentIndex(five),
    friction: readout.friction,
    strengths: readout.strengths.slice(0, 2).map((s) => s.label),
    holes: (readout.weaknesses.length ? readout.weaknesses : readout.thin.slice(0, 1)).map((s) => s.label),
    synergies: namedSynergies(five).map((s) => s.name),
  };
}

/** One comparison row. `better` says which side wins; higherWins flips for friction. */
function Row({
  label,
  a,
  b,
  higherWins = true,
  format = (v: number) => v.toFixed(1),
  live,
}: {
  label: string;
  a: number;
  b: number;
  higherWins?: boolean;
  format?: (v: number) => string;
  live: boolean;
}) {
  const aWins = live && (higherWins ? a > b : a < b);
  const bWins = live && (higherWins ? b > a : b < a);
  const win = 'text-amber-300 font-semibold';
  const norm = 'text-text-body-hi';
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-1.5 border-b border-hairline last:border-b-0">
      <span className={`font-mono font-tnum text-sm text-right ${aWins ? win : norm}`}>
        {live ? format(a) : '—'}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[.12em] text-text-low text-center whitespace-nowrap">
        {label}
      </span>
      <span className={`font-mono font-tnum text-sm ${bWins ? win : norm}`}>{live ? format(b) : '—'}</span>
    </div>
  );
}

function Tags({ items, align, tone }: { items: string[]; align: 'left' | 'right'; tone: 'good' | 'note' }) {
  if (!items.length) return <div />;
  return (
    <div className={`flex flex-wrap gap-1 ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
      {items.map((t) => (
        <span
          key={t}
          className="font-mono text-[9px] uppercase tracking-[.08em] px-1.5 py-0.5 border"
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

export default function DominanceCompare({
  lineupA,
  lineupB,
  pool,
}: {
  lineupA: Player[];
  lineupB: Player[];
  pool: Player[];
}) {
  const { A, B } = useMemo(
    () => ({ A: evaluate(lineupA, pool), B: evaluate(lineupB, pool) }),
    [lineupA, lineupB, pool],
  );

  const live = A.legal && B.legal;
  const drDiff = A.dr - B.dr;
  const winDiff = A.wins - B.wins;

  // The interesting case: DR says one thing, the season says another.
  const split = live && drDiff !== 0 && winDiff !== 0 && Math.sign(drDiff) !== Math.sign(winDiff);

  const note = (s: Side, name: string) =>
    s.filled < 5
      ? `${name}: ${s.filled}/5 picked`
      : `${name} can't field PG/SG/SF/PF/C — two players are stuck on the same spot`;

  return (
    <div className="border border-surface-4 rounded-2xl p-4" style={{ background: 'var(--color-surface-2)' }}>
      <div
        className="mb-3 text-text-hi text-center"
        style={{ fontFamily: 'Archivo, sans-serif', fontVariationSettings: "'wdth' 82,'wght' 700", fontSize: 15 }}
      >
        Dominance Rating — Head to Head
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3 mb-3">
        <div className="text-right">
          <div
            className={`font-mono font-tnum text-3xl leading-none ${live && drDiff > 0 ? 'text-amber-300 font-semibold' : 'text-text-hi'}`}
          >
            {live ? A.dr.toFixed(1) : '—'}
          </div>
          <div className="font-mono font-tnum text-sm text-text-mid mt-1">{live ? A.record : '—'}</div>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[.14em] text-text-low pb-1">vs</div>
        <div>
          <div
            className={`font-mono font-tnum text-3xl leading-none ${live && drDiff < 0 ? 'text-amber-300 font-semibold' : 'text-text-hi'}`}
          >
            {live ? B.dr.toFixed(1) : '—'}
          </div>
          <div className="font-mono font-tnum text-sm text-text-mid mt-1">{live ? B.record : '—'}</div>
        </div>
      </div>

      <Row label="DR" a={A.dr} b={B.dr} live={live} />
      <Row label="Proj. wins" a={A.wins} b={B.wins} live={live} format={(v) => String(Math.round(v))} />
      <Row label="Talent" a={A.talent} b={B.talent} live={live} />
      {/* lower friction is better — the ball fits together */}
      <Row label="Friction" a={A.friction} b={B.friction} higherWins={false} live={live} format={(v) => v.toFixed(2)} />

      {live && (A.strengths.length > 0 || B.strengths.length > 0) && (
        <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3 mt-3">
          <Tags items={A.strengths} align="right" tone="good" />
          <span className="font-mono text-[9px] uppercase tracking-[.14em] text-text-low">strengths</span>
          <Tags items={B.strengths} align="left" tone="good" />
        </div>
      )}

      {live && (A.holes.length > 0 || B.holes.length > 0) && (
        <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3 mt-2">
          <Tags items={A.holes} align="right" tone="note" />
          <span className="font-mono text-[9px] uppercase tracking-[.14em] text-text-low">holes</span>
          <Tags items={B.holes} align="left" tone="note" />
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-hairline text-center">
        {!live ? (
          <p className="text-[11px] text-text-low">
            {!A.legal && note(A, 'Lineup A')}
            {!A.legal && !B.legal && ' · '}
            {!B.legal && note(B, 'Lineup B')}
          </p>
        ) : drDiff === 0 && winDiff === 0 ? (
          <p className="text-sm text-text-mid">Dead even.</p>
        ) : split ? (
          // DR and the season disagree — say so plainly, it's the most useful read here
          <p className="text-[12px] leading-snug text-text-mid">
            <span className="text-text-hi font-semibold">Lineup {drDiff > 0 ? 'A' : 'B'}</span> is better on paper
            (+{Math.abs(drDiff).toFixed(1)} DR), but{' '}
            <span className="text-text-hi font-semibold">Lineup {winDiff > 0 ? 'A' : 'B'}</span> projects{' '}
            {Math.abs(winDiff)} more wins over 82 games.
          </p>
        ) : (
          <p className="text-sm text-text-hi">
            <span className="font-semibold text-amber-300">Lineup {drDiff > 0 ? 'A' : 'B'}</span> leads by{' '}
            {Math.abs(drDiff).toFixed(1)} DR
            {winDiff !== 0 && ` and ${Math.abs(winDiff)} projected wins`}.
          </p>
        )}
      </div>

      {live && (A.synergies.length > 0 || B.synergies.length > 0) && (
        <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-start gap-3">
          <Tags items={A.synergies} align="right" tone="good" />
          <span className="font-mono text-[9px] uppercase tracking-[.14em] text-text-low">synergies</span>
          <Tags items={B.synergies} align="left" tone="good" />
        </div>
      )}

      {live && (
        <p className="mt-3 text-center font-mono text-[9px] uppercase tracking-[.1em] text-text-low">
          slots {SLOTS.join(' · ')}
        </p>
      )}
    </div>
  );
}
