import { describe, expect, it } from 'vitest';
import { resolveSite } from '../../config/site.mjs';

describe('site configuration', () => {
  it('uses the accepted production origin and normalizes its slash', () => {
    expect(resolveSite({})).toEqual({ url: 'https://nex-plus-home.vercel.app', indexable: true });
    expect(resolveSite({ SITE_URL: 'https://example.com/' }).url).toBe('https://example.com');
  });
  it('disables indexing for previews, development, and explicit opt-out', () => {
    for (const env of [
      { VERCEL_ENV: 'preview' },
      { VERCEL_ENV: 'development' },
      { SITE_INDEXABLE: 'false' },
    ]) {
      expect(resolveSite(env).indexable).toBe(false);
    }
    expect(resolveSite({ VERCEL_ENV: 'production' }).indexable).toBe(true);
  });
  it('rejects invalid origins and ambiguous indexing flags', () => {
    for (const SITE_URL of [
      'ftp://example.com',
      'https://user:password@example.com',
      'https://example.com/path',
      'https://example.com?x=1',
      'https://example.com#fragment',
      'not-a-url',
    ]) {
      expect(() => resolveSite({ SITE_URL })).toThrow();
    }
    expect(() => resolveSite({ SITE_INDEXABLE: 'yes' })).toThrow();
  });
});
