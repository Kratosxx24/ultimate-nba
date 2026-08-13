import { HashRouter, NavLink, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DynastyRoulettePage from './pages/DynastyRoulettePage';
import CompareLineupsPage from './pages/CompareLineupsPage';
import PlayersPage from './pages/PlayersPage';

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/roulette', label: 'Dynasty Roulette' },
  { to: '/compare', label: 'Compare Lineups' },
  { to: '/players', label: 'Players' },
];

function App() {
  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col">
        <header className="border-b border-white/10 bg-black/30 backdrop-blur sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-6">
            <span className="font-semibold tracking-tight text-lg text-white">
              Ultimate NBA
            </span>
            <nav className="flex gap-1">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-purple-500/20 text-purple-300'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </header>

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/roulette" element={<DynastyRoulettePage />} />
            <Route path="/compare" element={<CompareLineupsPage />} />
            <Route path="/players" element={<PlayersPage />} />
          </Routes>
        </main>

        <footer className="border-t border-white/10 py-4 text-center text-xs text-gray-500">
          Ultimate NBA — v35 formula
        </footer>
      </div>
    </HashRouter>
  );
}

export default App;
