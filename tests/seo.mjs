import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const directory = resolve(process.argv[2] ?? 'dist');
const indexable = !process.argv.includes('--noindex');
const origin = new URL(process.env.SITE_URL ?? 'https://nex-plus-home.vercel.app').origin;
const routes = [
  '/',
  '/solutions',
  '/solutions/internet-dedicated',
  '/solutions/metro-e',
  '/solutions/vsat',
  '/solutions/managed-services',
  '/solutions/iptv-hospitality',
  '/contact',
  '/coverage',
  '/bandwidth-calculator',
  '/speed-test',
  '/infrastructure',
  '/monitoring',
  '/404',
];
const html = new Map(
  await Promise.all(
    routes.map(async (route) => [
      route,
      await readFile(
        join(
          directory,
          route === '/404' ? '404.html' : route.slice(1),
          route === '/404' ? '' : 'index.html',
        ),
        'utf8',
      ),
    ]),
  ),
);
const titles = new Set();
const descriptions = new Set();
for (const [route, page] of html) {
  assert.equal((page.match(/<h1[ >]/g) ?? []).length, 1, route + ': one H1');
  assert.equal((page.match(/<main[ >]/g) ?? []).length, 1, route + ': main landmark');
  const title = page.match(/<title>(.*?)<\/title>/s)?.[1];
  const description = page.match(/<meta name="description" content="([^"]+)"/)?.[1];
  assert(title && description, route + ': metadata');
  assert(!titles.has(title) && !descriptions.has(description), route + ': unique metadata');
  titles.add(title);
  descriptions.add(description);
  const shouldIndex = indexable && !['/monitoring', '/404'].includes(route);
  assert(
    page.includes('content="' + (shouldIndex ? 'index, follow' : 'noindex, nofollow') + '"'),
    route + ': robots',
  );
  assert(
    page.includes('rel="canonical" href="' + origin + (route === '/404' ? '/404' : route) + '"'),
    route + ': canonical',
  );
  assert(!/unpkg.com|react-grab|react-scan/.test(page), route + ': no development tooling');
  const schema = JSON.parse(
    page.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)?.[1] ?? 'null',
  );
  assert(
    Array.isArray(schema) &&
      schema.some((item) => item['@type'] === 'Organization') &&
      schema.some((item) => item['@type'] === 'WebPage'),
    route + ': structured data',
  );
  for (const [, value] of page.matchAll(/(?:href|src)="([^"<>]+)"/g)) {
    if (!value || /^(?:https?:|mailto:|tel:|data:)/.test(value)) continue;
    const url = new URL(value.replaceAll('&amp;', '&'), origin + route);
    if (url.pathname.startsWith('/_astro/') || /\.[a-z0-9]+$/i.test(url.pathname)) {
      await access(join(directory, url.pathname));
      continue;
    }
    const destination = html.get(url.pathname.replace(/\/$/, '') || '/');
    assert(destination, route + ': destination ' + value);
    if (url.hash)
      assert(
        destination.includes('id="' + decodeURIComponent(url.hash.slice(1)) + '"'),
        route + ': anchor ' + value,
      );
  }
}
const robots = await readFile(join(directory, 'robots.txt'), 'utf8');
assert(robots.includes(indexable ? 'Allow: /' : 'Disallow: /'));
if (indexable) {
  const sitemap = await readFile(join(directory, 'sitemap-0.xml'), 'utf8');
  assert(
    !sitemap.includes('/monitoring') && !sitemap.includes('/404') && !sitemap.includes('/dev/'),
  );
  assert.equal((sitemap.match(/<loc>/g) ?? []).length, 12);
} else {
  for (const file of ['sitemap-0.xml', 'sitemap-index.xml']) {
    await assert.rejects(access(join(directory, file)), { code: 'ENOENT' });
    assert(!robots.includes('Sitemap:'), 'Preview must not advertise a sitemap.');
  }
}
await access(join(directory, 'og.png'));
console.log(
  'PASS: 14 pages, metadata, schemas, robots, sitemap, local assets and anchors (' +
    (indexable ? 'production' : 'preview') +
    ').',
);
