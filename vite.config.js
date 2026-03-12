import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // ── IMPORTANT ──────────────────────────────────────────────
  // Change this to match your GitHub repo name.
  // If your repo is: github.com/youruser/gol-budget-dashboard
  // then base should be: '/gol-budget-dashboard/'
  //
  // For local dev this doesn't matter (vite dev ignores it).
  // ───────────────────────────────────────────────────────────
  base: '/GameOfLife/',
});
