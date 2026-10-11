import { useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { links } from '@/lib/monitoring';
import type { LinkStatus } from '@/lib/monitoring';
const statuses = {
  up: { label: 'Normal', icon: CheckCircle2, color: 'text-good' },
  warn: { label: 'Perhatian', icon: AlertTriangle, color: 'text-warning' },
  down: { label: 'Mati', icon: XCircle, color: 'text-accent-text' },
} as const;
export function MonitoringLinks() {
  const [filter, setFilter] = useState<'all' | LinkStatus>('all');
  const filtered = links.filter((l) => filter === 'all' || l.status === filter);
  return (
    <section className="glass p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl">Status tautan</h2>
        <div className="flex flex-wrap gap-1" role="group" aria-label="Filter status tautan">
          {(['all', 'up', 'warn', 'down'] as const).map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={filter === s}
              onClick={() => setFilter(s)}
              className={
                'min-h-11 rounded-lg px-3 text-xs ' +
                (filter === s ? 'bg-raised' : 'hover:bg-raised/60')
              }
            >
              {s === 'all' ? 'Semua' : statuses[s].label}
            </button>
          ))}
        </div>
      </div>
      <ul className="mt-5" aria-live="polite">
        {filtered.map((l) => {
          const status = statuses[l.status];
          const Icon = status.icon;
          return (
            <li
              key={l.id}
              className="flex flex-wrap items-center justify-between gap-4 border-t border-rule py-5"
            >
              <div className="min-w-0">
                <h3 className="text-sm">{l.name}</h3>
                <p className="mt-1 text-xs text-muted">
                  {l.location} · {l.detail}
                </p>
              </div>
              <span
                className={
                  'flex items-center gap-2 rounded-lg bg-raised px-3 py-2 text-xs ' + status.color
                }
              >
                <Icon size={14} aria-hidden />
                {status.label}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
