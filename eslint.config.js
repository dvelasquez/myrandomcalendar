import { fileURLToPath } from 'node:url';
import { includeIgnoreFile } from '@eslint/compat';
import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier';
import eslintPluginAstro from 'eslint-plugin-astro';
import eslintPluginImport from 'eslint-plugin-import';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url));

export default defineConfig([
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  includeIgnoreFile(gitignorePath, 'Imported .gitignore patterns'),
  // Add more generic rule sets here, such as:
  eslint.configs.recommended,
  tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  // IMPORTANT: This must be last to override formatting rules
  prettierConfig,
  {
    plugins: {
      import: eslintPluginImport,
    },
    rules: {
      // Override/add rules settings here, such as:
      // "astro/no-set-html-directive": "error"

      // Use the more powerful import/order rule (auto-fixable)
      'import/order': [
        'error',
        {
          alphabetize: {
            caseInsensitive: true,
            order: 'asc',
          },
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'never',
        },
      ],

      // Disable the built-in sort-imports rule (not auto-fixable)
      'sort-imports': 'off',
    },
  },
  // Configuration for test files - disable type checking rules
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    rules: {
      // Disable TypeScript type checking rules for test files
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/prefer-as-const': 'off',
      '@typescript-eslint/triple-slash-reference': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-explicit-return-type': 'off',
      '@typescript-eslint/no-parameter-properties': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-unnecessary-type-constraint': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/unbound-method': 'off',
      // Allow any type assertions in tests
      '@typescript-eslint/consistent-type-assertions': 'off',
      // Allow any imports in tests
      '@typescript-eslint/consistent-type-imports': 'off',
      // Allow any exports in tests
      '@typescript-eslint/consistent-type-exports': 'off',
    },
  },
]);
