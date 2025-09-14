import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules', 'dist', '.astro'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '.astro/',
        'src/**/*.astro',
        'src/**/*.tsx', // Exclude React components for now
        'src/pages/**', // Exclude Astro pages
        'src/layouts/**', // Exclude Astro layouts
        'src/components/**', // Exclude UI components
      ],
    },
  },
});
