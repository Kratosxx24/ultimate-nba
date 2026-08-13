import type { LineupSummary } from '../lib/lineup';

interface StatRowProps {
  label: string;
  value: string | number;
  highlight?: boolean;
}

function StatRow({ label, value, highlight }: StatRowProps) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-hairline last:border-b-0">
      <span className="font-mono text-[10px] uppercase tracking-[.12em] text-text-low">{label}</span>
      <span
        className={`font-mono font-tnum text-sm ${highlight ? 'text-amber-300 font-semibold' : 'text-text-body-hi'}`}
      >
        {value}
      </span>
    </div>
  );
}

export default function LineupSummaryPanel({
  summary,
  title = 'Team Summary',
}: {
  summary: LineupSummary;
  title?: string;
}) {
  return (
    <div className="border border-surface-4 bg-surface-2 p-4">
      <div
        className="mb-2 text-text-hi"
        style={{ fontFamily: 'Archivo, sans-serif', fontVariationSettings: "'wdth' 82,'wght' 700", fontSize: 15 }}
      >
        {title}
      </div>
      <StatRow label="Avg OVR" value={summary.filledCount ? summary.avgOvr.toFixed(1) : '—'} highlight />
      <StatRow label="Best Player OVR" value={summary.bestPlayer?.OVR ?? '—'} />
      <StatRow label="Avg OFF anchor" value={summary.filledCount ? summary.avgOff.toFixed(1) : '—'} />
      <StatRow label="Avg DEF anchor" value={summary.filledCount ? summary.avgDef.toFixed(1) : '—'} />
      <StatRow label="Avg PPG" value={summary.filledCount ? summary.avgPpg.toFixed(1) : '—'} />
      <StatRow label="Avg RPG" value={summary.filledCount ? summary.avgRpg.toFixed(1) : '—'} />
      <StatRow label="Avg APG" value={summary.filledCount ? summary.avgApg.toFixed(1) : '—'} />
      <StatRow label="Total Cost" value={summary.totalCost} />
    </div>
  );
}
