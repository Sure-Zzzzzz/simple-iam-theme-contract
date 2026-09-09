import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      all: true,
      include: ['src/**/*.ts', 'src/**/*.vue'],
      exclude: ['src/**/*.test.ts'],
      reporter: ['text', 'html', 'json-summary', 'lcov'],
      thresholds: {
        statements: 95,
        branches: 90,
        functions: 95,
        lines: 95
      }
    }
  }
});
