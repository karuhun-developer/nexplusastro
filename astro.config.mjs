import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { loadEnv } from 'vite';
import { resolveSite } from './config/site.mjs';

const site = resolveSite({
  ...loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), ''),
  ...process.env,
});
const indexable = site.indexable;
export default defineConfig({
  site: site.url,
  output: 'static',
  trailingSlash: 'never',
  integrations: [
    react(),
    sitemap({
      filter: (page) =>
        indexable &&
        !['/monitoring', '/404', '/dev/primitives'].includes(
          new URL(page).pathname.replace(/\/$/, ''),
        ),
    }),
  ],
  vite: { plugins: [tailwindcss()], define: { __SITE_INDEXABLE__: JSON.stringify(indexable) } },
});
