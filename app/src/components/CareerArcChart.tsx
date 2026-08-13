import { getTier } from './OvrBadge';
import { useTheme } from '../lib/ThemeContext';

interface CareerArcSeason {
  id: string;
  year: number;
  ovr: number;
}

/** Small dot-plot showing OVR across a player's seasons — x = year (evenly spaced),
 * y = OVR (bottom = low, top = high). The single best season gets a bigger glowing dot
 * with a floating "PEAK" label, matching the "02 Season Detail" mockup's career-arc chart. */
export default function CareerArcChart({ seasons }: { seasons: CareerArcSeason[] }) {
  const { theme } = useTheme();
  if (seasons.length < 2) return null;

  const minYear = seasons[0].year;
  const maxYear = seasons[seasons.length - 1].year;
  const yearSpan = Math.max(1, maxYear - minYear);
  const minOvr = Math.min(...seasons.map((s) => s.ovr));
  const maxOvr = Math.max(...seasons.map((s) => s.ovr));
  const ovrSpan = Math.max(1, maxOvr - minOvr);

  const peak = seasons.reduce((best, s) => (s.ovr > best.ovr ? s : best), seasons[0]);
  const peakTier = getTier(peak.ovr, theme);
  const glowColor = peakTier.glow ?? 'rgba(255,222,168,.5)';

  // Pick a handful of evenly-spaced year labels along the bottom axis (mockup shows ~5).
  const labelCount = Math.min(5, seasons.length);
  const yearLabels = Array.from({ length: labelCount }, (_, i) => {
    const idx = Math.round((i / (labelCount - 1 || 1)) * (seasons.length - 1));
    return seasons[idx].year;
  });

  return (
    <div className="border border-hairline bg-surface-1">
      <div className="px-5 py-4 border-b border-hairline flex items-baseline justify-between">
        <div style={{ fontFamily: 'Archivo, sans-serif', fontVariationSettings: "'wdth' 86,'wght' 700", fontSize: 18 }} className="text-text-hi">
          Career arc
        </div>
        <span className="font-mono text-[10px] text-muted">
          {seasons.length} seasons · peak &apos;{String(peak.year).slice(-2)}
        </span>
      </div>
      <div className="px-5 pt-5 pb-3">
        <div className="relative h-[112px] border-b border-hairline border-l border-hairline">
          <div className="absolute left-0 right-0 top-[14px] h-px" style={{ background: 'var(--color-hairline)' }} />
          <div className="absolute left-0 right-0 top-[56px] h-px" style={{ background: 'var(--color-hairline)' }} />
          {seasons.map((s) => {
            const isPeak = s.id === peak.id;
            const leftPct = ((s.year - minYear) / yearSpan) * 100;
            const bottomPct = ((s.ovr - minOvr) / ovrSpan) * 100;
            const tier = getTier(s.ovr, theme);
            const size = isPeak ? 11 : 7;
            return (
              <div
                key={s.id}
                style={{
                  position: 'absolute',
                  left: `${leftPct}%`,
                  bottom: `${bottomPct}%`,
                  width: size,
                  height: size,
                  background: isPeak ? peakTier.numeral : tier.numeral,
                  transform: 'translate(-50%,50%)',
                  filter: isPeak ? `drop-shadow(0 0 8px ${glowColor})` : undefined,
                }}
                title={`${s.year} · ${s.ovr} OVR`}
              />
            );
          })}
          <div
            style={{
              position: 'absolute',
              left: `${((peak.year - minYear) / yearSpan) * 100}%`,
              bottom: `${((peak.ovr - minOvr) / ovrSpan) * 100}%`,
              transform: 'translate(-50%,-120%)',
              whiteSpace: 'nowrap',
            }}
          >
            <span
              className="font-mono text-[9.5px] px-[5px] py-[2px]"
              style={{ color: peakTier.numeral, background: 'var(--color-surface-2)', border: '1px solid var(--color-hairline)' }}
            >
              PEAK {peak.ovr}
            </span>
          </div>
        </div>
        <div className="flex justify-between font-mono text-[9.5px] text-muted pt-2">
          {yearLabels.map((y, i) => (
            <span key={`${y}-${i}`}>&apos;{String(y).slice(-2)}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
