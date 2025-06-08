const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} */
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "tsconfig.json" }],
  },
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],

  // 🔽 Coverage-Einstellungen hinzufügen 🔽
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["lcov", "text-summary"], // Wichtig für SonarQube
  coveragePathIgnorePatterns: ["/node_modules/", "/test/"], // Optional: Unwichtige Pfade ignorieren
};