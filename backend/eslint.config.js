// Nur TS linten, JS/CJS & Build-Ordner ignorieren
const tseslint = require('typescript-eslint');
const globals = require('globals');

module.exports = [
  { ignores: ['dist/**', 'coverage/**', 'node_modules/**', 'test-results/**', 'eslint.config.*', '**/*.cjs', '**/*.js'] },

  // TS-Empfehlungen
  ...tseslint.configs.recommended,

  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        //project: './tsconfig.eslint.json',
        tsconfigRootDir: __dirname
      },
      globals: globals.node
    },
    plugins: { '@typescript-eslint': tseslint.plugin },
    rules: {
      // eigene Regeln hier
    }
  }
];
