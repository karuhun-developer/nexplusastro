import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { downloadMbps, latencyStats, measureSpeed, speedLimits } from '@/lib/speed-test';
beforeEach(() => vi.stubGlobal('location', { origin: 'https://test.example' }));
afterEach(() => vi.unstubAllGlobals());
describe('bounded speed measurement', () => {
  it('converts bytes to megabits using measured seconds', () => {
    expect(downloadMbps(1_000_000, 2)).toBe(4);
    expect(downloadMbps(10, 0)).toBe(0);
  });
  it('uses a median and reports unavailable latency honestly', () => {
    expect(latencyStats([10, 20, 100]).latency).toBe(20);
    expect(latencyStats([10, 20]).latency).toBe(15);
    expect(latencyStats([])).toEqual({ latency: null, jitter: null });
  });
  it('honors cancellation before network work', async () => {
    const signal = AbortSignal.abort();
    expect((await measureSpeed(signal, () => {})).kind).toBe('cancelled');
  });
  it('does not turn HTTP errors into successful measurements', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('no', { status: 500 })),
    );
    expect((await measureSpeed(new AbortController().signal, () => {})).kind).toBe('error');
  });
  it('stops fast streams at the transfer budget', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async (request: Request) =>
          new Response(new Uint8Array(request.url.includes('favicon') ? 64 : 524288)),
      ),
    );
    const result = await measureSpeed(new AbortController().signal, () => {});
    expect(result.kind).toBe('done');
    if (result.kind === 'done') {
      expect(result.result.bytes).toBeLessThanOrEqual(speedLimits.bytes);
      expect(result.result.floor).toBe(true);
    }
  });
});
