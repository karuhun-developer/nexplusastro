import { useEffect, useRef, useState } from 'react';
import { Play, Square, RotateCcw } from 'lucide-react';
import { Button } from '../ui/button';
import { SpeedGauge } from '../molecules/SpeedGauge';
import { measureSpeed } from '@/lib/speed-test';
import type { SpeedOutcome, SpeedProgress, SpeedResult } from '@/lib/speed-test';

type SpeedState = { readonly kind: 'idle' } | { readonly kind: 'running'; readonly progress: SpeedProgress } | SpeedOutcome;

function statusText(state: SpeedState): string {
  switch (state.kind) {
    case 'idle': return 'Siap mengukur koneksi Anda.';
    case 'running': return state.progress.phase === 'latency' ? 'Mengukur respons HTTP…' : 'Mengukur kecepatan unduh…';
    case 'done': return 'Pengujian selesai. Unduh ' + state.result.mbps.toFixed(1) + ' Mbps.';
    case 'cancelled': return 'Pengujian dibatalkan.';
    case 'error': return state.message;
  }
}

function SpeedMetrics({ result, bytes }: { readonly result: SpeedResult | null; readonly bytes: number }) {
  const values = [
    { label: 'Latensi HTTP', value: result?.latency != null ? Math.round(result.latency) + ' ms' : '—' },
    { label: 'Jitter HTTP', value: result?.jitter != null ? Math.round(result.jitter) + ' ms' : '—' },
    { label: 'Data terpakai', value: (bytes / 1024 / 1024).toFixed(1) + ' MiB' },
    { label: 'Durasi unduh', value: result ? result.seconds.toFixed(2) + ' detik' : '—' },
  ];
  return <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-rule pt-6 sm:grid-cols-4">{values.map(value => <div key={value.label}><dt className="text-xs text-muted">{value.label}</dt><dd className="mt-2 text-lg">{value.value}</dd></div>)}</dl>;
}

export function SpeedTest() {
  const controller = useRef<AbortController | null>(null);
  const [state, setState] = useState<SpeedState>({ kind: 'idle' });
  useEffect(() => () => { controller.current?.abort(); controller.current = null; }, []);

  async function run() {
    if (controller.current) { controller.current.abort(); return; }
    const current = new AbortController();
    controller.current = current;
    setState({ kind: 'running', progress: { phase: 'latency', mbps: 0, bytes: 0 } });
    try {
      const outcome = await measureSpeed(current.signal, progress => {
        if (controller.current === current) setState({ kind: 'running', progress });
      });
      if (controller.current === current) setState(outcome);
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      if (controller.current === current) setState({ kind: 'error', message: 'Pengujian gagal: ' + error.message });
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

  return <div className="grid items-start gap-6 lg:grid-cols-[1.4fr_1fr]">
    <div className="glass p-6 sm:p-8">
      <div className="mx-auto max-w-sm"><SpeedGauge mbps={mbps} /><span className="sr-only">Unduh {mbps.toFixed(1)} Mbps</span></div>
      <Button type="button" className="mx-auto flex min-w-52" onClick={run}><ActionIcon size={18} aria-hidden />{buttonLabel}</Button>
      <p className="mt-5 text-center text-sm text-muted" role="status">{statusText(state)}</p>
      {busy && <progress aria-label="Pengujian sedang berjalan" className="mt-4 h-2 w-full accent-action" />}
      <SpeedMetrics result={result} bytes={result?.bytes ?? progress?.bytes ?? 0} />
      {result?.floor && <p className="mt-6 rounded-control bg-raised p-4 text-sm text-muted">Batas data tercapai dalam {result.seconds.toFixed(2)} detik. Sampel terlalu singkat untuk pengukuran stabil; {result.mbps.toFixed(1)} Mbps adalah indikasi batas bawah, bukan kecepatan pasti.</p>}
    </div>
    <aside className="glass p-6 sm:p-8"><h2 className="text-xl">Yang diukur di sini</h2><ul className="mt-6 space-y-5 text-sm text-muted"><li>Unduh dan respons HTTP diukur dari perangkat Anda ke host halaman ini.</li><li>Hasil mencerminkan koneksi yang sedang Anda gunakan, apa pun penyedianya.</li><li>Unggah tidak diuji. Situs statis ini tidak menerima data unggahan.</li><li>Hingga 16 MiB data; sekitar 12 detik batas tahap pengukuran. Anda bisa membatalkannya kapan saja.</li></ul><p className="mt-6 border-t border-rule pt-6 text-xs text-muted">Wi-Fi, perangkat, cache jaringan, dan server memengaruhi hasil. Respons HTTP bukan ping ICMP atau jaminan SLA.</p></aside>
  </div>;
}
