import { Link } from 'react-router-dom';
import { getAllPlayers } from '../lib/players';
import PlayerCard from '../components/PlayerCard';

export default function HomePage() {
  const players = getAllPlayers();
  const teamCount = new Set(players.map((p) => p.eraTeam)).size;
  const top = players.slice(0, 4);

  return (
    <div className="space-y-10">
      <div>
        <h1
          className="text-text-hi"
          style={{
            fontFamily: 'Archivo, sans-serif',
            fontVariationSettings: "'wdth' 70,'wght' 800",
            fontSize: 'clamp(36px, 5vw, 56px)',
            lineHeight: 0.95,
          }}
        >
          ULTIMATE NBA
        </h1>
        <p className="text-text-mid mt-3 max-w-xl">
          {players.length} player-seasons across {teamCount} eraTeams.
        </p>
      </div>

      <div>
        <div className="flex items-baseline gap-3 mb-4">
          <span className="font-mono text-[11px] tracking-[.22em] text-muted">01</span>
          <h2
            className="text-text-hi"
            style={{ fontFamily: 'Archivo, sans-serif', fontVariationSettings: "'wdth' 78,'wght' 800", fontSize: 24 }}
          >
            ALL-TIME LEADERBOARD
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {top.map((p) => (
            <Link key={p.id} to={`/season/${encodeURIComponent(p.id)}`}>
              <PlayerCard player={p} />
            </Link>
          ))}
        </div>
        <Link to="/players" className="text-sm font-mono text-blue-300 hover:text-blue-200 mt-4 inline-block">
          Browse all {players.length} player-seasons →
        </Link>
      </div>
    </div>
  );
}
