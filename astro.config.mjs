// @ts-check
import db from '@astrojs/db';
import node from '@astrojs/node';
import react from '@astrojs/react';
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from 'astro/config';



// https://astro.build/config
export default defineConfig({
  adapter: node({
    mode: 'standalone'
  }),
  integrations: [react(), db()],
  output: 'server',
  vite: {
    plugins: [tailwindcss()],
  },
});