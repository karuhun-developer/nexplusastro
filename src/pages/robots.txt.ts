import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const body = __SITE_INDEXABLE__ && !import.meta.env.DEV
    ? `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap-index.xml', site).href}\n`
    : 'User-agent: *\nDisallow: /\n';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
