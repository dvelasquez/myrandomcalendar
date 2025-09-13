import { fileURLToPath } from "node:url";
import { includeIgnoreFile } from "@eslint/compat";
import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import eslintPluginAstro from 'eslint-plugin-astro';
import eslintPluginImport from 'eslint-plugin-import';
import globals from "globals";
import tseslint from 'typescript-eslint';

const gitignorePath = fileURLToPath(new URL(".gitignore", import.meta.url));

export default defineConfig([
  {
		languageOptions: {
			globals: {
				...globals.browser,
        ...globals.node,
			},
		},
	},
  includeIgnoreFile(gitignorePath, "Imported .gitignore patterns"),
  // Add more generic rule sets here, such as:
  eslint.configs.recommended,
  tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
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
            order: 'asc'
          },
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index'
          ],
          'newlines-between': 'never'
        }
      ],
      
      // Disable the built-in sort-imports rule (not auto-fixable)
      'sort-imports': 'off'
    }
  }]
);