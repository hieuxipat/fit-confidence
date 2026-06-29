import { defineConfig } from 'vitest/config';

// Standalone Vitest config — intentionally does NOT extend vite.config.js so the
// React Router plugin is not loaded for unit tests. Covers the pure logic
// modules (size chart) and the storefront sizing core.
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['extensions/**/*.test.js', 'app/**/*.test.js'],
  },
});
