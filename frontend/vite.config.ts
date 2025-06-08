/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'text-summary', 'text'],
      reportsDirectory: './coverage',
    },
    reporters: ['default', 'vitest-sonar-reporter', 'junit'],
    outputFile: {
      'vitest-sonar-reporter': 'test-results/sonar-report.xml',
      junit: './test-results/junit.xml',
    },
  },
});
