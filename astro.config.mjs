// astro.config.mjs
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

import dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  mode: 'server',
  vite: {
    server: {
        allowedHosts: [".ngrok-free.app", "roulette.hackclub.com"],
    },
  },
});
