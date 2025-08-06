// astro.config.mjs
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

import dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
  vite: {
    server: {
        allowedHosts: [".ngrok-free.app"],
    },
  },
});
