import eslintPluginAstro from 'eslint-plugin-astro';
import js from '@eslint/js';

export default [
  // Add more generic rule sets here, such as:
  js.configs.all,
  ...eslintPluginAstro.configs.recommended,
  {
    rules: {
      // Override/add rules settings here, such as:
      // "astro/no-set-html-directive": "error"
    }
  }
];