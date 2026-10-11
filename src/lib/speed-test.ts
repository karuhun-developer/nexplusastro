import ky, { HTTPError, TimeoutError } from 'ky';
export const speedLimits = { latencyMs: 5000, downloadMs: 7000, requestMs: 2000, bytes: 16 * 1024 * 1024, streams: 4 } as const;
const payloads = ['/images/city.jpg', '/images/data-center.jpg'] as const;
export type SpeedProgress = { readonly phase: 'latency' | 'download'; readonly mbps: number; readonly bytes: number };
export type SpeedResult = { readonly mbps: number; readonly latency: number | null; readonly jitter: number | null; readonly bytes: number; readonly seconds: number; readonly floor: boolean };
export type SpeedOutcome = { readonly kind: 'done'; readonly result: SpeedResult } | { readonly kind: 'cancelled' } | { readonly kind: 'error'; readonly message: string };
export function latencyStats(samples: readonly number[]): { readonly latency: number | null; readonly jitter: number | null } {
  if (!samples.length) return { latency: null, jitter: null };
  const sorted = [...samples].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const latency = sorted.length % 2 ? sorted[middle] ?? 0 : ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2;
  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  return { latency, jitter: Math.sqrt(samples.reduce((sum, s) => sum + (s - mean) ** 2, 0) / samples.length) };
}
export function downloadMbps(bytes: number, seconds: number): number { return seconds > 0 ? bytes * 8 / seconds / 1_000_000 : 0; }
function networkError(error: unknown): boolean { return error instanceof HTTPError || error instanceof TimeoutError || error instanceof TypeError || error instanceof DOMException; }
export async function measureSpeed(signal: AbortSignal, report: (progress: SpeedProgress) => void): Promise<SpeedOutcome> {
  const controller = new AbortController();
  const activeSignal = AbortSignal.any([signal, controller.signal]);
  try {
    signal.throwIfAborted();
    const url = (path: string) => new URL(path, globalThis.location.origin).href;
    report({ phase: 'latency', mbps: 0, bytes: 0 });
    const latencySignal = AbortSignal.any([activeSignal, AbortSignal.timeout(speedLimits.latencyMs)]);
    const samples: number[] = [];
    for (let i = 0; i < 6 && !latencySignal.aborted; i++) {
      const start = performance.now();
      try {
        await ky.get(url('/favicon.svg?probe=' + crypto.randomUUID()), { signal: latencySignal, cache: 'no-store', retry: 0, timeout: speedLimits.requestMs }).arrayBuffer();
        samples.push(performance.now() - start);
      } catch (error) { if (signal.aborted) return { kind: 'cancelled' }; if (!networkError(error)) throw error; }
    }
    signal.throwIfAborted();
    const started = performance.now();
    const downloadSignal = AbortSignal.any([activeSignal, AbortSignal.timeout(speedLimits.downloadMs)]);
    let bytes = 0;
    let reserved = 0;
    let reportedAt = started;
    const reservation = 1024 * 1024;
    report({ phase: 'download', mbps: 0, bytes });
    async function stream(index: number) {
      let round = index;
      while (!downloadSignal.aborted && bytes + reserved + reservation <= speedLimits.bytes) {
        reserved += reservation;
        let requestBytes = 0;
        try {
          const response = await ky.get(url((payloads[round % payloads.length] ?? payloads[0]) + '?probe=' + crypto.randomUUID()), { signal: downloadSignal, cache: 'no-store', retry: 0, timeout: speedLimits.requestMs });
          const reader = response.body?.getReader();
          if (!reader) throw new TypeError('Respons unduh tidak memiliki data.');
          try {
            while (true) {
              const chunk = await reader.read();
              if (chunk.done) break;
              requestBytes += chunk.value.byteLength;
              bytes += chunk.value.byteLength;
              reserved -= chunk.value.byteLength;
              const now = performance.now();
              if (now - reportedAt >= 100) {
                report({ phase: 'download', mbps: downloadMbps(bytes, (now - started) / 1000), bytes });
                reportedAt = now;
              }
              if (requestBytes >= reservation) { await reader.cancel(); break; }
            }
          } finally { reader.releaseLock(); }
        } catch (error) {
          if (downloadSignal.aborted && networkError(error)) return;
          controller.abort();
          throw error;
        } finally { reserved -= reservation - requestBytes; }
        round++;
      }
    }
    const outcomes = await Promise.allSettled(Array.from({ length: speedLimits.streams }, (_, index) => stream(index)));
    if (signal.aborted) return { kind: 'cancelled' };
    const failed = outcomes.find(outcome => outcome.status === 'rejected');
    if (failed?.status === 'rejected') throw failed.reason;
    const seconds = (performance.now() - started) / 1000;
    if (!bytes) return { kind: 'error', message: 'Tidak ada data yang berhasil diunduh. Periksa koneksi Anda lalu coba lagi.' };
    return { kind: 'done', result: { ...latencyStats(samples), bytes, seconds, mbps: downloadMbps(bytes, seconds), floor: seconds < 1.5 } };
  } catch (error) {
    if (signal.aborted) return { kind: 'cancelled' };
    if (networkError(error)) return { kind: 'error', message: 'Pengujian terhenti. Server tidak merespons atau koneksi bermasalah. Coba lagi.' };
    throw error;
  } finally { controller.abort(); }
}
