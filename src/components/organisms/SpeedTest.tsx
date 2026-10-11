import { useEffect, useRef, useState } from 'react';
import { Play, Square, RotateCcw } from 'lucide-react';
import { Button } from '../ui/button';
import { SpeedGauge } from '../molecules/SpeedGauge';
import { measureSpeed, speedLimits, speedServer } from '@/lib/speed-test';
import type { SpeedOutcome, SpeedProgress, SpeedResult } from '@/lib/speed-test';

type SpeedState =
  | { readonly kind: 'idle' }
  | { readonly kind: 'running'; readonly progress: SpeedProgress }
  | SpeedOutcome;

function statusText(state: SpeedState): string {
  switch (state.kind) {
    case 'idle':
      return 'Siap mengukur koneksi Anda.';
    case 'running':
      switch (state.progress.phase) {
        case 'latency':
          return 'Mengukur respons HTTP…';
        case 'download':
          return 'Mengukur kecepatan unduh…';
        case 'upload':
          return 'Mengukur kecepatan unggah…';
      }
    case 'done':
      return (
        'Pengujian selesai. Unduh ' +
        state.result.mbps.toFixed(1) +
        ' Mbps.' +
        (state.result.uploadMbps != null
          ? ' Unggah ' + state.result.uploadMbps.toFixed(1) + ' Mbps.'
          : ' ' + (state.result.uploadError ?? 'Unggah tidak tersedia; coba ukur ulang.'))
      );
    case 'cancelled':
      return 'Pengujian dibatalkan.';
    case 'error':
      return state.message;
  }
}

function SpeedMetrics({
  result,
  bytes,
}: {
  readonly result: SpeedResult | null;
  readonly bytes: number;
}) {
  const values = [
    {
      label: 'Unduh',
      value: result ? result.mbps.toFixed(1) + ' Mbps' : '—',
    },
    {
      label: 'Unggah',
      value:
        result?.uploadMbps != null
          ? result.uploadMbps.toFixed(1) + ' Mbps'
          : result
            ? 'Tidak tersedia'
            : '—',
    },
    {
      label: 'Latensi HTTP',
      value: result?.latency != null ? Math.round(result.latency) + ' ms' : '—',
    },
    {
      label: 'Jitter HTTP',
      value: result?.jitter != null ? Math.round(result.jitter) + ' ms' : '—',
    },
    { label: 'Data terukur', value: (bytes / 1024 / 1024).toFixed(1) + ' MiB' },
    { label: 'Server pengujian', value: speedServer.name },
  ];
  return (
    <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-rule pt-6 sm:grid-cols-3">
      {values.map((value) => (
        <div key={value.label}>
          <dt className="text-xs text-muted">{value.label}</dt>
          <dd className="mt-2 text-lg tabular-nums">{value.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function SpeedTest() {
  const controller = useRef<AbortController | null>(null);
  const retryAt = useRef(0);
  const [cooldown, setCooldown] = useState(0);
  const [state, setState] = useState<SpeedState>({ kind: 'idle' });
  useEffect(() => {
    try {
      const saved = Number(sessionStorage.getItem('nex-speed-test-retry-at'));
      if (Number.isFinite(saved))
        retryAt.current = Math.min(saved, Date.now() + speedLimits.cooldownMs);
    } catch (error) {
      if (!(error instanceof DOMException)) throw error;
    }
    const update = () => setCooldown(Math.max(0, Math.ceil((retryAt.current - Date.now()) / 1000)));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(
    () => () => {
      controller.current?.abort();
      controller.current = null;
    },
    [],
  );

  async function run() {
    if (controller.current) {
      controller.current.abort();
      return;
    }
    if (Date.now() < retryAt.current) return;
    retryAt.current = Date.now() + speedLimits.cooldownMs;
    setCooldown(Math.ceil(speedLimits.cooldownMs / 1000));
    try {
      sessionStorage.setItem('nex-speed-test-retry-at', String(retryAt.current));
    } catch (error) {
      if (!(error instanceof DOMException)) throw error;
    }
    const current = new AbortController();
    controller.current = current;
    setState({
      kind: 'running',
      progress: { phase: 'latency', mbps: 0, bytes: 0, uploadedBytes: 0 },
    });
    try {
      const outcome = await measureSpeed(current.signal, (progress) => {
        if (controller.current === current) setState({ kind: 'running', progress });
      });
      if (controller.current === current) setState(outcome);
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      if (controller.current === current)
        setState({ kind: 'error', message: 'Pengujian gagal: ' + error.message });
    } finally {
      if (controller.current === current) controller.current = null;
    }
  }

  const busy = state.kind === 'running';
  const result = state.kind === 'done' ? state.result : null;
  const progress = state.kind === 'running' ? state.progress : null;
  const mbps = result?.mbps ?? progress?.mbps ?? 0;
  const buttonLabel = busy ? 'Batalkan pengujian' : result ? 'Ukur ulang' : 'Mulai pengujian';
  const ActionIcon = busy ? Square : result ? RotateCcw : Play;
  const direction = progress?.phase === 'upload' ? 'unggah' : 'unduh';

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="glass p-6 sm:p-8">
        <div className="mx-auto max-w-sm">
          <SpeedGauge mbps={mbps} direction={direction} />
          <span className="sr-only">
            {direction} {mbps.toFixed(1)} Mbps
          </span>
        </div>
        <Button
          type="button"
          className="mx-auto flex min-w-52"
          onClick={run}
          disabled={!busy && cooldown > 0}
        >
          <ActionIcon size={18} aria-hidden />
          {buttonLabel}
        </Button>
        <p className="mt-5 text-center text-sm text-muted" role="status">
          {statusText(state)}
        </p>
        {!busy && cooldown > 0 && (
          <p className="mt-3 text-center text-xs text-muted">
            Pengujian berikutnya tersedia dalam {cooldown} detik.
          </p>
        )}
        {busy && (
          <progress
            aria-label="Pengujian sedang berjalan"
            className="mt-4 h-2 w-full accent-action"
          />
        )}
        <SpeedMetrics
          result={result}
          bytes={
            (result?.bytes ?? progress?.bytes ?? 0) +
            (result?.uploadedBytes ?? progress?.uploadedBytes ?? 0)
          }
        />
        {(result?.floor || result?.uploadFloor) && (
          <p className="mt-6 rounded-control bg-raised p-4 text-sm text-muted">
            Sampel{' '}
            {result.floor && result.uploadFloor
              ? 'unduh dan unggah'
              : result.floor
                ? 'unduh'
                : 'unggah'}{' '}
            terlalu singkat untuk pengukuran stabil. Hasil adalah perkiraan; ukur ulang untuk
            membandingkan.
          </p>
        )}
      </div>
      <aside className="glass p-6 sm:p-8">
        <h2 className="text-xl">Yang diukur di sini</h2>
        <ul className="mt-6 space-y-5 text-sm text-muted">
          <li>Unduh, unggah, dan respons HTTP diukur ke jaringan publik {speedServer.name}.</li>
          <li>Hasil mencerminkan koneksi yang sedang Anda gunakan, apa pun penyedianya.</li>
          <li>Ada jeda 60 detik antartes untuk mengurangi permintaan berulang.</li>
          <li>
            Hasil menunjukkan jalur koneksi Anda ke server pengujian, termasuk saat membuka halaman
            dari localhost.
          </li>
          <li>
            Hingga 32 MiB unduh dan 8 MiB unggah; sekitar 17 detik batas tahap pengukuran. Anda bisa
            membatalkannya kapan saja.
          </li>
        </ul>
        <p className="mt-6 border-t border-rule pt-6 text-xs text-muted">
          Permintaan tes dikirim langsung ke {speedServer.name} setelah Anda menekan mulai. Wi-Fi,
          perangkat, VPN, dan server memengaruhi hasil. Respons HTTP bukan ping ICMP atau jaminan
          SLA.
        </p>
      </aside>
    </div>
  );
}
