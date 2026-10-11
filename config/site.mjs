import { z } from 'zod';

const siteSchema = z.object({
  SITE_URL: z.url().refine((value) => {
    const url = new URL(value);
    return (
      ['http:', 'https:'].includes(url.protocol) &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash &&
      url.pathname === '/'
    );
  }, 'SITE_URL harus berupa origin HTTP(S), tanpa path, kredensial, query, atau hash.'),
  SITE_INDEXABLE: z.enum(['true', 'false']),
});

export function resolveSite(env) {
  const parsed = siteSchema.parse({
    SITE_URL: env.SITE_URL ?? 'https://nex-plus-home.vercel.app',
    SITE_INDEXABLE: env.SITE_INDEXABLE ?? 'true',
  });
  return {
    url: new URL(parsed.SITE_URL).origin,
    indexable:
      parsed.SITE_INDEXABLE === 'true' &&
      env.VERCEL_ENV !== 'preview' &&
      env.VERCEL_ENV !== 'development',
  };
}
