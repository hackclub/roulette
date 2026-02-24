// astro.config.mjs
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

import dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  vite: {
    server: {
        allowedHosts: [".ngrok-free.app", "roulette.hackclub.com"],
    },
  },
});
