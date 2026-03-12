import GameOfLifeDashboard from './components/GameOfLifeDashboard';

// ── Data Loading ─────────────────────────────────────────────
// The dashboard imports student data from src/data/students.json.
// 
// That file ships with 12 sample students so the app works out
// of the box. To load your real roster, run:
//
//   npm run build-data
//
// which reads data/master.csv and overwrites src/data/students.json
// with the full dataset. See README.md for details.
// ─────────────────────────────────────────────────────────────

export default function App() {
  return <GameOfLifeDashboard />;
}
