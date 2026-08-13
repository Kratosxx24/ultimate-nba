import type { LineupSummary } from '../lib/lineup';

interface StatRowProps {
  label: string;
  value: string | number;
  highlight?: boolean;
}

function StatRow({ label, value, highlight }: StatRowProps) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-gray-400">{label}</span>
      <span className={`text-sm font-medium ${highlight ? 'text-purple-300' : 'text-white'}`}>
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
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="text-sm font-semibold text-white mb-2">{title}</div>
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
