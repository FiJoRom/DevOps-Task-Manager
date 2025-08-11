const { createDefaultPreset } = require('ts-jest');

module.exports = {
  testEnvironment: 'node',
  transform: { '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }] },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],

  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text-summary'],
  coveragePathIgnorePatterns: ['/node_modules/', '/test/'],

  // Wichtig: jest-junit sicher auflösen
  reporters: [
    'default',
    [require.resolve('jest-junit'), { outputDirectory: 'test-results', outputName: 'junit.xml' }]
  ],
};
