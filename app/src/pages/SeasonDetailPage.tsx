import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getAllPlayers, getPlayerById } from '../lib/players';
import playoffOpponentsJson from '../data/playoffOpponents.json';
import type { OpponentSeries, Player } from '../types/player';
import OvrBadge, { getTier } from '../components/OvrBadge';

const playoffOpponents = playoffOpponentsJson as Record<string, OpponentSeries[]>;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function percentile(players: Player[], key: keyof Player, value: number): number {
  const vals = players.map((p) => p[key] as number).sort((a, b) => a - b);
  let lo = 0;
  let hi = vals.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (vals[mid] < value) lo = mid + 1;
    else hi = mid;
  }
  return Math.round((lo / vals.length) * 100);
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

/** Season Detail — the flagship page from the "02 Season Detail" mockup: hero card, full
 * stat line, breakdown waterfall, percentiles against the whole database, teammates and
 * playoff path. */
export default function SeasonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const player = id ? getPlayerById(decodeURIComponent(id)) : undefined;
  const allPlayers = useMemo(() => getAllPlayers(), []);

  if (!player) {
    return (
      <div className="py-24 text-center">
        <div
          style={{ fontFamily: 'Archivo, sans-serif', fontVariationSettings: "'wdth' 78,'wght' 800", fontSize: 32 }}
          className="text-text-hi"
        >
          Season not found
        </div>
        <Link to="/players" className="text-amber-500 text-sm mt-3 inline-block">
          ← Back to Players
        </Link>
      </div>
    );
  }

  const tier = getTier(player.OVR);
  const rank = allPlayers.findIndex((p) => p.id === player.id) + 1;
  const [year, ...teamParts] = player.eraTeam.split(/\s+/);
  const team = teamParts.join(' ') || player.eraTeam;
  const record = `${player.teamWins}–${player.teamLosses}`;
  const teammates = allPlayers
    .filter((p) => p.eraTeam === player.eraTeam && p.id !== player.id)
    .sort((a, b) => b.OVR - a.OVR)
    .slice(0, 5);
  const series = playoffOpponents[player.eraTeam] ?? [];

  const stats: { label: string; value: string | number; pct: number; hi?: boolean }[] = [
    { label: 'PTS', value: player.ppg, pct: percentile(allPlayers, 'ppg', player.ppg), hi: true },
    { label: 'REB', value: player.rpg, pct: percentile(allPlayers, 'rpg', player.rpg) },
    { label: 'AST', value: player.apg, pct: percentile(allPlayers, 'apg', player.apg) },
    { label: 'STL', value: player.stl, pct: percentile(allPlayers, 'stl', player.stl) },
    { label: 'TS%', value: player.ts.toFixed(3), pct: percentile(allPlayers, 'ts', player.ts) },
    { label: 'WS/48', value: player.ws48.toFixed(3), pct: percentile(allPlayers, 'ws48', player.ws48), hi: true },
    { label: 'MIN', value: player.mpg, pct: percentile(allPlayers, 'mpg', player.mpg) },
  ];

  // Breakdown waterfall built from real intermediate formula terms (each an independent
  // named contribution to RAW, not a strict running sum — ANCHORED already folds together
  // offense and defense with positional weighting, so it's shown as one anchored baseline).
  let running = player.ANCHORED;
  const waterfall = [
    { label: 'Anchored production', delta: player.ANCHORED, running },
    { label: 'Win-share term', delta: player.wsTerm, running: (running += player.wsTerm) },
    { label: 'Team success', delta: player.teamTerm, running: (running += player.teamTerm) },
    { label: 'Playoff round', delta: player.roundTerm, running: (running += player.roundTerm) },
    { label: 'Two-way bonus', delta: player.twoWay, running: (running += player.twoWay) },
  ];
  const maxRun = Math.max(...waterfall.map((w) => Math.abs(w.running)), player.OVR, 1);

  return (
    <div className="space-y-7 pb-16">
      {/* breadcrumb */}
      <div className="flex items-center gap-2 font-mono text-[11px] text-muted">
        <Link to="/players" className="hover:text-text-mid">
          SEASONS
        </Link>
        <span className="text-[#4A423D]">/</span>
        <span>{year}</span>
        <span className="text-[#4A423D]">/</span>
        <span className="uppercase">{team}</span>
        <span className="text-[#4A423D]">/</span>
        <span className="text-text-mid">{player.name.toUpperCase()}</span>
      </div>

      {/* hero */}
      <div
        className="border overflow-hidden"
        style={{
          background:
            'radial-gradient(110% 150% at 84% 4%, rgba(255,214,150,.17), transparent 56%), linear-gradient(165deg,#241C15,#100D0C 60%)',
          borderColor: '#4A3A26',
          borderTopWidth: 3,
          borderTopColor: 'var(--color-amber-500)',
        }}
      >
        <div className="p-5 md:p-8 flex gap-6 md:gap-8 items-start flex-wrap">
          <div
            className="flex-none w-[110px] h-[138px] md:w-[132px] md:h-[166px] flex flex-col items-center justify-center gap-2"
            style={{ background: 'linear-gradient(160deg,#3A1620,#170D10)', border: '1px solid #52202C' }}
          >
            <span
              style={{ fontFamily: 'Archivo, sans-serif', fontVariationSettings: "'wdth' 72,'wght' 800", fontSize: 44, color: '#E8697C', lineHeight: 1 }}
            >
              {initials(player.name)}
            </span>
            <span className="font-mono text-[8.5px] tracking-[.16em]" style={{ color: '#9A5A66' }}>
              NO PHOTO · '{year.slice(-2)} {player.teamKey}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-3 flex-wrap">
              <span
                className="font-mono text-[10px] tracking-[.18em] uppercase whitespace-nowrap px-2 py-1"
                style={{ color: '#C9A96E', border: '1px solid #4A3A26' }}
              >
                {tier.name} · #{rank} all-time
              </span>
              <span className="font-mono text-[10px] tracking-[.14em] uppercase text-muted whitespace-nowrap">
                {player.archetype}
              </span>
            </div>
            <div
              style={{
                fontFamily: 'Archivo, sans-serif',
                fontVariationSettings: "'wdth' 68,'wght' 800",
                fontSize: 'clamp(30px,5.2vw,60px)',
                lineHeight: 0.9,
                letterSpacing: '-.015em',
                color: 'var(--color-text-hi)',
              }}
            >
              {player.name.toUpperCase()}
            </div>
            <div className="flex items-center gap-2.5 mt-4 flex-wrap">
              <span
                className="inline-flex items-center gap-2 font-mono text-[11.5px] px-2.5 py-1.5 whitespace-nowrap"
                style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-surface-4)', color: 'var(--color-text-body-hi)' }}
              >
                <span className="w-[3px] h-3.5" style={{ background: 'var(--color-amber-500)' }} />
                '{year.slice(-2)} {player.teamKey} · {record} · {player.playoffRound}
              </span>
              <span className="text-[11.5px] px-2.5 py-1.5 text-text-mid border border-surface-4">{player.pos}</span>
            </div>
          </div>

          <div className="flex-none ml-auto flex flex-col items-end gap-3.5">
            <OvrBadge ovr={player.OVR} size="hero" />
            <div className="flex gap-2">
              <button className="text-xs font-semibold px-3.5 py-2" style={{ color: 'var(--color-surface-0)', background: 'var(--color-amber-500)' }}>
                Add to lineup
              </button>
              <button className="text-xs px-3.5 py-2 text-text-body-hi border border-[#4A423D]">Compare</button>
              <button className="text-xs px-3.5 py-2 text-text-body-hi border border-[#4A423D]">Share</button>
            </div>
          </div>
        </div>

        <div
          className="grid border-t"
          style={{ gridTemplateColumns: `repeat(auto-fit, minmax(100px, 1fr))`, borderColor: '#322C29' }}
        >
          {stats.map((s, i) => (
            <div key={s.label} className="px-4 py-4" style={{ borderRight: i < stats.length - 1 ? '1px solid var(--color-hairline)' : undefined }}>
              <div className="font-mono text-[9.5px] tracking-[.12em] text-muted">{s.label}</div>
              <div className="font-mono font-tnum text-[22px] text-text-hi mt-1">{s.value}</div>
              <div className="h-[3px] mt-2" style={{ background: '#2A2422' }}>
                <div
                  className="h-[3px]"
                  style={{ width: `${s.pct}%`, background: s.hi ? 'var(--color-amber-500)' : 'var(--color-blue-500)' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* two column body */}
      <div className="grid gap-6 items-start" style={{ gridTemplateColumns: 'minmax(0,1fr) 340px' }}>
        <div className="flex flex-col gap-6 min-w-0">
          {/* breakdown waterfall */}
          <div className="border border-hairline bg-surface-1">
            <div className="px-5 py-4 border-b border-hairline">
              <div style={{ fontFamily: 'Archivo, sans-serif', fontVariationSettings: "'wdth' 86,'wght' 700", fontSize: 18 }} className="text-text-hi">
                How the {player.OVR} was built
              </div>
              <div className="text-xs text-muted mt-1">Contributions to the composite, in the order they're applied.</div>
            </div>
            <div className="px-5 py-4">
              {waterfall.map((w) => (
                <div key={w.label} className="flex items-center gap-4 mb-3">
                  <span className="w-[132px] flex-none text-[12.5px] text-text-mid">{w.label}</span>
                  <span className="flex-1 h-[22px] relative" style={{ background: '#1A1716' }}>
                    <span
                      className="absolute top-0 h-[22px]"
                      style={{
                        left: 0,
                        width: `${Math.min(100, (Math.abs(w.running) / maxRun) * 100)}%`,
                        background: w.delta >= 0 ? '#2E8C58' : '#A33F3A',
                      }}
                    />
                  </span>
                  <span
                    className="w-[52px] flex-none text-right font-mono text-[13px] font-tnum"
                    style={{ color: w.delta >= 0 ? 'var(--color-up-text)' : 'var(--color-down-text)' }}
                  >
                    {w.delta >= 0 ? '+' : ''}
                    {w.delta.toFixed(1)}
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-4 pt-3.5 border-t border-hairline mt-2">
                <span
                  className="w-[132px] flex-none"
                  style={{ fontFamily: 'Archivo, sans-serif', fontVariationSettings: "'wdth' 84,'wght' 700", fontSize: 15, color: tier.numeral }}
                >
                  RATING
                </span>
                <span className="flex-1 h-[26px] relative" style={{ background: '#1A1716' }}>
                  <span
                    className="absolute top-0 h-[26px]"
                    style={{ left: 0, width: `${(player.OVR / maxRun) * 100}%`, background: 'linear-gradient(90deg,#8A5A10,#FFD48F)' }}
                  />
                </span>
                <span
                  className="w-[52px] flex-none text-right font-tnum"
                  style={{ fontFamily: 'Archivo, sans-serif', fontVariationSettings: "'wdth' 66,'wght' 900", fontSize: 26, color: tier.numeral }}
                >
                  {player.OVR}
                </span>
              </div>
            </div>
          </div>

          {/* percentiles */}
          <div className="border border-hairline bg-surface-1">
            <div className="px-5 py-4 border-b border-hairline flex items-baseline gap-3">
              <div style={{ fontFamily: 'Archivo, sans-serif', fontVariationSettings: "'wdth' 86,'wght' 700", fontSize: 18 }} className="text-text-hi">
                Against every season since 1962
              </div>
              <span className="font-mono text-[10px] text-muted">n = {allPlayers.length.toLocaleString()}</span>
            </div>
            <div className="px-5 py-5 flex flex-col gap-4">
              {stats.slice(0, 5).map((s) => (
                <div key={s.label} className="flex items-center gap-4">
                  <span className="w-[104px] flex-none font-mono text-[11px] tracking-[.1em] text-text-mid">{s.label}</span>
                  <span className="flex-1 h-2 relative" style={{ background: '#1A1716' }}>
                    <span
                      className="absolute top-0 h-2"
                      style={{ left: 0, width: `${s.pct}%`, background: 'linear-gradient(90deg,#2B4276,#9CC0F0)' }}
                    />
                    <span className="absolute top-[-4px] w-px h-4" style={{ left: '50%', background: '#4A423D' }} />
                  </span>
                  <span className="w-[44px] flex-none text-right font-mono text-[12.5px] font-tnum text-text-mid">{ordinal(s.pct)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* teammates */}
          {teammates.length > 0 && (
            <div className="border border-hairline bg-surface-1">
              <div className="px-5 py-4 border-b border-hairline flex items-center justify-between flex-wrap gap-2">
                <div style={{ fontFamily: 'Archivo, sans-serif', fontVariationSettings: "'wdth' 86,'wght' 700", fontSize: 18 }} className="text-text-hi">
                  Teammates · {player.eraTeam}
                </div>
              </div>
              <div
                className="grid px-5 py-2.5 bg-surface-0 border-b border-hairline font-mono text-[9.5px] tracking-[.12em] uppercase text-muted"
                style={{ gridTemplateColumns: '54px minmax(0,1fr) 60px 76px 58px 58px' }}
              >
                <span>Year</span>
                <span>Player · team</span>
                <span>Pos</span>
                <span>Rating</span>
                <span className="text-right">PTS</span>
                <span className="text-right">REB</span>
              </div>
              {teammates.map((t, i) => (
                <Link
                  key={t.id}
                  to={`/season/${encodeURIComponent(t.id)}`}
                  className="grid items-center px-5 py-2.5 border-b border-hairline last:border-b-0 hover:bg-surface-3"
                  style={{ gridTemplateColumns: '54px minmax(0,1fr) 60px 76px 58px 58px', background: i % 2 === 1 ? 'var(--color-surface-2)' : undefined }}
                >
                  <span style={{ fontFamily: 'Archivo, sans-serif', fontVariationSettings: "'wdth' 78,'wght' 700", fontSize: 17, color: getTier(t.OVR).numeral }} className="font-tnum">
                    {t.eraTeam.match(/^\d{4}/)?.[0]}
                  </span>
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="text-text-hi text-[16px] truncate" style={{ fontFamily: 'Archivo, sans-serif', fontVariationSettings: "'wdth' 84,'wght' 600" }}>
                      {t.name}
                    </span>
                  </span>
                  <span className="text-[11px] text-text-mid border border-surface-4 px-1.5 py-0.5 justify-self-start">{t.pos}</span>
                  <OvrBadge ovr={t.OVR} size="sm" />
                  <span className="font-mono text-[12.5px] text-text-body-hi text-right font-tnum">{t.ppg}</span>
                  <span className="font-mono text-[12.5px] text-text-mid text-right font-tnum">{t.rpg}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* right rail — playoff path */}
        <div className="flex flex-col gap-6">
          <div className="border border-hairline bg-surface-1">
            <div className="px-5 py-4 border-b border-hairline">
              <div style={{ fontFamily: 'Archivo, sans-serif', fontVariationSettings: "'wdth' 86,'wght' 700", fontSize: 17 }} className="text-text-hi">
                Playoff path
              </div>
              <div className="text-[11.5px] text-muted mt-1">
                {record} · {player.playoffRound}
              </div>
            </div>
            <div className="px-5 py-4">
              {series.length === 0 ? (
                <p className="text-[12.5px] text-muted">No playoff series recorded for this season.</p>
              ) : (
                <div className="flex gap-3.5">
                  <div className="w-px flex-none my-2" style={{ background: 'linear-gradient(180deg,#3A3531,#C98A2E)' }} />
                  <div className="flex-1 flex flex-col gap-3.5">
                    {series.map((s) => {
                      const [wStr, lStr] = s.result.replace(/^(won|lost)\s*/i, '').split('-');
                      const won = /^won/i.test(s.result);
                      return (
                        <div key={`${s.round}-${s.opponent}`} className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="font-mono text-[9.5px] tracking-[.14em] text-muted">{s.round}</div>
                            <div className="text-[13.5px] text-text-body-hi mt-0.5">
                              {s.opponent} <span className="text-muted">· {s.opponentWins}–{s.opponentLosses}</span>
                            </div>
                          </div>
                          <span
                            className="font-mono text-[12px] px-1.5 py-0.5 font-tnum"
                            style={
                              won
                                ? { color: 'var(--color-up-text)', background: 'var(--color-up-bg)', border: '1px solid var(--color-up-border)' }
                                : { color: 'var(--color-down-text)', background: 'var(--color-down-bg)', border: '1px solid var(--color-down-border)' }
                            }
                          >
                            {wStr}–{lStr}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
