import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    browser: {
      enabled: true,
      provider: playwright() as any,
      instances: [{ browser: 'chromium' }],
    },
    pool: 'browser',
    poolOptions: {
      browser: {
        isolate: false,
      },
    },
    include: [
      'backend/src/test/react-example/test/**/*.{test,spec}.{ts,tsx}',
      'test/**/*.test.ts', // Include build validation tests
    ],
    exclude: ['**/node_modules/**', '**/dist/**', '**/out/**'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
    // Use browser conditions to match production build behavior
    conditions: ['browser', 'module', 'import'],
    mainFields: ['browser', 'module', 'main'],
  },
  define: {
    'process.env.NODE_ENV': '"production"',
    global: 'globalThis',
  },
  optimizeDeps: {
    esbuildOptions: {
      // Match browser environment
      platform: 'browser',
      mainFields: ['browser', 'module', 'main'],
    },
  },
});