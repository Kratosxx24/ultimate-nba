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
      <div className="min-h-screen flex flex-col bg-surface-0 text-text-body-hi">
        <header className="border-b border-hairline bg-[#0F0D0C]/90 backdrop-blur sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-6">
            <span
              className="tracking-tight"
              style={{
                fontFamily: 'Archivo, sans-serif',
                fontVariationSettings: "'wdth' 82,'wght' 800",
                fontSize: 19,
                color: 'var(--color-text-hi)',
              }}
            >
              ULTIMATE<span style={{ color: 'var(--color-amber-500)' }}>NBA</span>
            </span>
            <nav className="flex gap-1">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `px-3 py-1.5 text-sm font-medium font-mono uppercase tracking-[.08em] transition-colors ${
                      isActive
                        ? 'text-amber-300 border-b-2 border-amber-500'
                        : 'text-text-low hover:text-text-mid'
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

        <footer className="border-t border-hairline py-4 text-center text-xs font-mono text-text-low">
          Ultimate NBA — v35 formula
        </footer>
      </div>
    </HashRouter>
  );
}

export default App;
