import ky, { HTTPError, TimeoutError } from 'ky';
export const speedLimits = {
  latencyMs: 5000,
  downloadMs: 7000,
  uploadMs: 5000,
  requestMs: 2000,
  bytes: 32 * 1024 * 1024,
  uploadBytes: 8 * 1024 * 1024,
  streams: 4,
  cooldownMs: 60_000,
} as const;
export const speedServer = {
  name: 'Cloudflare',
  origin: 'https://speed.cloudflare.com',
} as const;
export type SpeedProgress = {
  readonly phase: 'latency' | 'download' | 'upload';
  readonly mbps: number;
  readonly bytes: number;
  readonly uploadedBytes: number;
};
export type SpeedResult = {
  readonly mbps: number;
  readonly latency: number | null;
  readonly jitter: number | null;
  readonly bytes: number;
  readonly seconds: number;
  readonly floor: boolean;
  readonly uploadMbps: number | null;
  readonly uploadedBytes: number;
  readonly uploadFloor: boolean;
  readonly uploadError: string | null;
};
export type SpeedOutcome =
  | { readonly kind: 'done'; readonly result: SpeedResult }
  | { readonly kind: 'cancelled' }
  | { readonly kind: 'error'; readonly message: string };
export function latencyStats(samples: readonly number[]): {
  readonly latency: number | null;
  readonly jitter: number | null;
} {
  if (!samples.length) return { latency: null, jitter: null };
  const sorted = [...samples].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const latency =
    sorted.length % 2
      ? (sorted[middle] ?? 0)
      : ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2;
  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  return {
    latency,
    jitter: Math.sqrt(samples.reduce((sum, s) => sum + (s - mean) ** 2, 0) / samples.length),
  };
}
export function downloadMbps(bytes: number, seconds: number): number {
  return seconds > 0 ? (bytes * 8) / seconds / 1_000_000 : 0;
}
function networkError(error: unknown): boolean {
  return (
    error instanceof HTTPError ||
    error instanceof TimeoutError ||
    error instanceof TypeError ||
    error instanceof DOMException
  );
}
function rateLimited(error: unknown): boolean {
  return error instanceof HTTPError && error.response.status === 429;
}
const rateLimitMessage =
  'Server pengujian membatasi permintaan. Tunggu beberapa saat sebelum mencoba lagi.';
export async function measureSpeed(
  signal: AbortSignal,
  report: (progress: SpeedProgress) => void,
): Promise<SpeedOutcome> {
  const controller = new AbortController();
  const activeSignal = AbortSignal.any([signal, controller.signal]);
  try {
    signal.throwIfAborted();
    const url = (path: string) => new URL(path, speedServer.origin).href;
    report({ phase: 'latency', mbps: 0, bytes: 0, uploadedBytes: 0 });
    const latencySignal = AbortSignal.any([
      activeSignal,
      AbortSignal.timeout(speedLimits.latencyMs),
    ]);
    const samples: number[] = [];
    for (let i = 0; i < 6 && !latencySignal.aborted; i++) {
      const start = performance.now();
      try {
        await ky
          .get(url('/__down?bytes=0&probe=' + crypto.randomUUID()), {
            signal: latencySignal,
            cache: 'no-store',
            retry: 0,
            timeout: speedLimits.requestMs,
          })
          .arrayBuffer();
        samples.push(performance.now() - start);
      } catch (error) {
        if (signal.aborted) return { kind: 'cancelled' };
        if (rateLimited(error)) return { kind: 'error', message: rateLimitMessage };
        if (!networkError(error)) throw error;
      }
    }
    signal.throwIfAborted();
    const started = performance.now();
    const downloadSignal = AbortSignal.any([
      activeSignal,
      AbortSignal.timeout(speedLimits.downloadMs),
    ]);
    let bytes = 0;
    let reserved = 0;
    let reportedAt = started;
    const reservation = 1024 * 1024;
    report({ phase: 'download', mbps: 0, bytes, uploadedBytes: 0 });
    async function stream() {
      while (!downloadSignal.aborted && bytes + reserved + reservation <= speedLimits.bytes) {
        reserved += reservation;
        let requestBytes = 0;
        try {
          const response = await ky.get(
            url('/__down?bytes=' + reservation + '&probe=' + crypto.randomUUID()),
            { signal: downloadSignal, cache: 'no-store', retry: 0, timeout: speedLimits.requestMs },
          );
          const reader = response.body?.getReader();
          if (!reader) throw new TypeError('Respons unduh tidak memiliki data.');
          try {
            while (true) {
              const chunk = await reader.read();
              if (chunk.done) break;
              const received = Math.min(chunk.value.byteLength, reservation - requestBytes);
              requestBytes += received;
              bytes += received;
              reserved -= received;
              const now = performance.now();
              if (now - reportedAt >= 100) {
                report({
                  phase: 'download',
                  mbps: downloadMbps(bytes, (now - started) / 1000),
                  bytes,
                  uploadedBytes: 0,
                });
                reportedAt = now;
              }
              if (requestBytes >= reservation) {
                await reader.cancel();
                break;
              }
            }
          } finally {
            reader.releaseLock();
          }
          if (!requestBytes) throw new TypeError('Respons unduh kosong.');
        } catch (error) {
          if (downloadSignal.aborted && networkError(error)) return;
          controller.abort();
          throw error;
        } finally {
          reserved -= reservation - requestBytes;
        }
      }
    }
    const outcomes = await Promise.allSettled(
      Array.from({ length: speedLimits.streams }, () => stream()),
    );
    if (signal.aborted) return { kind: 'cancelled' };
    const failed = outcomes.find((outcome) => outcome.status === 'rejected');
    if (failed?.status === 'rejected') throw failed.reason;
    const seconds = (performance.now() - started) / 1000;
    if (!bytes)
      return {
        kind: 'error',
        message: 'Tidak ada data yang berhasil diunduh. Periksa koneksi Anda lalu coba lagi.',
      };
    let uploadedBytes = 0;
    let uploadAvailable = true;
    let uploadError: string | null = null;
    const uploadStarted = performance.now();
    const uploadSignal = AbortSignal.any([activeSignal, AbortSignal.timeout(speedLimits.uploadMs)]);
    const uploadPayload = new Uint8Array(512 * 1024);
    report({ phase: 'upload', mbps: 0, bytes, uploadedBytes });
    while (
      !uploadSignal.aborted &&
      uploadedBytes + uploadPayload.byteLength <= speedLimits.uploadBytes
    ) {
      try {
        await ky
          .post(url('/__up?probe=' + crypto.randomUUID()), {
            body: uploadPayload,
            headers: { 'Content-Type': 'application/octet-stream' },
            signal: uploadSignal,
            retry: 0,
            timeout: speedLimits.requestMs,
          })
          .arrayBuffer();
        uploadedBytes += uploadPayload.byteLength;
        report({
          phase: 'upload',
          mbps: downloadMbps(uploadedBytes, (performance.now() - uploadStarted) / 1000),
          bytes,
          uploadedBytes,
        });
      } catch (error) {
        if (signal.aborted) return { kind: 'cancelled' };
        if (!networkError(error)) throw error;
        if (!uploadSignal.aborted) {
          uploadAvailable = false;
          uploadError = rateLimited(error)
            ? rateLimitMessage
            : 'Unggah tidak tersedia; coba ukur ulang.';
        }
        break;
      }
    }
    signal.throwIfAborted();
    const uploadSeconds = (performance.now() - uploadStarted) / 1000;
    return {
      kind: 'done',
      result: {
        ...latencyStats(samples),
        bytes,
        seconds,
        mbps: downloadMbps(bytes, seconds),
        floor: seconds < 1.5,
        uploadMbps:
          uploadAvailable && uploadedBytes ? downloadMbps(uploadedBytes, uploadSeconds) : null,
        uploadedBytes,
        uploadFloor: uploadSeconds < 1.5 && uploadedBytes > 0,
        uploadError,
      },
    };
  } catch (error) {
    if (signal.aborted) return { kind: 'cancelled' };
    if (rateLimited(error)) return { kind: 'error', message: rateLimitMessage };
    if (networkError(error))
      return {
        kind: 'error',
        message: 'Pengujian terhenti. Server tidak merespons atau koneksi bermasalah. Coba lagi.',
      };
    throw error;
  } finally {
    controller.abort();
  }
}
