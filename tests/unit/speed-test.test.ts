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
          new Response(new Uint8Array(Number(new URL(request.url).searchParams.get('bytes')))),
      ),
    );
    const result = await measureSpeed(new AbortController().signal, () => {});
    expect(result.kind).toBe('done');
    if (result.kind === 'done') {
      expect(result.result.bytes).toBeLessThanOrEqual(speedLimits.bytes);
      expect(result.result.uploadedBytes).toBe(speedLimits.uploadBytes);
      expect(result.result.uploadMbps).toBeGreaterThan(0);
      expect(result.result.floor).toBe(true);
    }
  });
  it('measures the public network even when the page runs on localhost', async () => {
    vi.stubGlobal('location', { origin: 'http://localhost:4321' });
    const requests: Request[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (request: Request) => {
        requests.push(request);
        return new Response(new Uint8Array(request.method === 'POST' ? 0 : 524288));
      }),
    );
    const result = await measureSpeed(new AbortController().signal, () => {});
    expect(result.kind).toBe('done');
    expect(
      requests.every((request) => new URL(request.url).origin === 'https://speed.cloudflare.com'),
    ).toBe(true);
    expect(requests.some((request) => request.method === 'POST')).toBe(true);
  });
  it('keeps the download result when the upload server fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (request: Request) =>
        request.method === 'POST'
          ? new Response('unavailable', { status: 503 })
          : new Response(new Uint8Array(Number(new URL(request.url).searchParams.get('bytes')))),
      ),
    );
    const outcome = await measureSpeed(new AbortController().signal, () => {});
    expect(outcome.kind).toBe('done');
    if (outcome.kind === 'done') {
      expect(outcome.result.mbps).toBeGreaterThan(0);
      expect(outcome.result.uploadMbps).toBeNull();
      expect(outcome.result.uploadedBytes).toBe(0);
    }
  });
  it('honors cancellation during upload', async () => {
    const controller = new AbortController();
    vi.stubGlobal(
      'fetch',
      vi.fn(async (request: Request) => {
        if (request.method === 'POST') {
          controller.abort();
          throw new DOMException('Aborted', 'AbortError');
        }
        return new Response(new Uint8Array(Number(new URL(request.url).searchParams.get('bytes'))));
      }),
    );
    expect((await measureSpeed(controller.signal, () => {})).kind).toBe('cancelled');
  });
  it('rejects empty downloads instead of looping until the time limit', async () => {
    const fetch = vi.fn(async () => new Response(''));
    vi.stubGlobal('fetch', fetch);
    expect((await measureSpeed(new AbortController().signal, () => {})).kind).toBe('error');
    expect(fetch.mock.calls.length).toBeLessThanOrEqual(6 + speedLimits.streams);
  });
  it('stops immediately when latency probes receive a rate limit', async () => {
    const fetch = vi.fn(async () => new Response('limited', { status: 429 }));
    vi.stubGlobal('fetch', fetch);
    const outcome = await measureSpeed(new AbortController().signal, () => {});
    expect(outcome.kind).toBe('error');
    if (outcome.kind === 'error') expect(outcome.message).toContain('membatasi permintaan');
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it('keeps the download while explaining an upload rate limit', async () => {
    let posts = 0;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (request: Request) => {
        if (request.method === 'POST') {
          posts++;
          return new Response('limited', { status: 429 });
        }
        return new Response(new Uint8Array(Number(new URL(request.url).searchParams.get('bytes'))));
      }),
    );
    const outcome = await measureSpeed(new AbortController().signal, () => {});
    expect(outcome.kind).toBe('done');
    if (outcome.kind === 'done') {
      expect(outcome.result.mbps).toBeGreaterThan(0);
      expect(outcome.result.uploadMbps).toBeNull();
      expect(outcome.result.uploadError).toContain('membatasi permintaan');
    }
    expect(posts).toBe(1);
  });
});
