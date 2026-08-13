import { Link } from 'react-router-dom';
import { getAllPlayers } from '../lib/players';

export default function HomePage() {
  const players = getAllPlayers();
  const teamCount = new Set(players.map((p) => p.eraTeam)).size;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Ultimate NBA</h1>
        <p className="text-gray-400 mt-2 max-w-xl">
          {players.length} player-seasons across {teamCount} eraTeams, rated by the v35 formula
          (real box stats, real playoff data, and exponential opponent-strength scaling).
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          to="/roulette"
          className="rounded-xl border border-white/10 bg-gradient-to-br from-purple-500/10 to-transparent p-6 hover:border-purple-400/40 transition-colors"
        >
          <div className="text-2xl mb-1">🎰</div>
          <div className="text-lg font-semibold text-white">Dynasty Roulette</div>
          <p className="text-sm text-gray-400 mt-1">
            Spin the wheel to build a random 5-man dynasty roster from every era. Reroll slots you
            don't like.
          </p>
        </Link>

        <Link
          to="/compare"
          className="rounded-xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-transparent p-6 hover:border-blue-400/40 transition-colors"
        >
          <div className="text-2xl mb-1">⚖️</div>
          <div className="text-lg font-semibold text-white">Compare Lineups</div>
          <p className="text-sm text-gray-400 mt-1">
            Build two custom 5-man lineups and compare their ratings side by side.
          </p>
        </Link>
      </div>

      <div>
        <Link to="/players" className="text-sm text-purple-300 hover:text-purple-200">
          Browse all {players.length} player-seasons →
        </Link>
      </div>
    </div>
  );
}
