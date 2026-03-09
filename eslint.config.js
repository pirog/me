import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import importPlugin from 'eslint-plugin-import';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

export default defineConfig([
  globalIgnores(['**/temp/**', '**/cache/**', '**/dist/**', '**/_site/**', '**/coverage/**']),
  js.configs.recommended,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.errors,
  importPlugin.flatConfigs.warnings,
  prettierRecommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        URL: 'readonly',
        process: 'readonly',
      },
    },
    rules: {
      'import/no-commonjs': 'error',
      'no-console': 'warn',
      'no-debugger': 'error',
      'prettier/prettier': 'error',
    },
    settings: {
      'import/resolver': {
        exports: true,
        node: true,
      },
    },
  },
]);
