import js from '@eslint/js';
import eslintPluginAstro from 'eslint-plugin-astro';
import eslintPluginImport from 'eslint-plugin-import';

export default [
  // Add more generic rule sets here, such as:
  js.configs.all,
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
  }
];