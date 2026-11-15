import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Sustituye __SITE__ en el HTML por el dominio del despliegue.
 *
 * Open Graph exige URLs absolutas para la imagen; sin dominio, se queda en
 * rutas relativas (que la mayoría de scrapers resuelven igual).
 *
 *   SITE_URL=https://astroarchive.earth/ bun run build
 */
function siteUrl(): Plugin {
  const site = (process.env.SITE_URL ?? './').replace(/\/*$/, '/');
  return {
    name: 'site-url',
    transformIndexHtml(html) {
      return html.replaceAll('__SITE__', site);
    },
  };
}

export default defineConfig({
  plugins: [react(), siteUrl()],
  base: './',
  build: {
    target: 'es2020',
    assetsInlineLimit: 0,
  },
});
