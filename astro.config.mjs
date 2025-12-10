import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import netlify from '@astrojs/netlify';

export default defineConfig({
  integrations: [
    react(),
    tailwind()
  ],
  output: 'server',
  adapter: netlify(),
  vite: {
    define: {
      'process.env': process.env,
    },
  },
  server: {
    host: true,
    port: 3000
  }
});