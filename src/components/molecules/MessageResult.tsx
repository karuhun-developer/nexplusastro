import { useState } from 'react';
import { Copy, ArrowUpRight } from 'lucide-react';
import { Button } from '../ui/button';
import { company } from '@/lib/content';
import { consultationLink } from '@/lib/consultation';
export function MessageResult({ message }: { readonly message: string }) {
  const [copyState, setCopyState] = useState<'idle' | 'pending' | 'copied' | 'error'>('idle');
  const href = consultationLink(company, message);
  async function copy() {
    setCopyState('pending');
    try {
      await navigator.clipboard.writeText(message);
      setCopyState('copied');
    } catch (error) {
      if (error instanceof Error || error instanceof DOMException) {
        setCopyState('error');
      } else throw error;
    }
  }
  return (
    <section
      className="mt-6 rounded-control border border-rule bg-canvas p-5"
      aria-label="Pesan konsultasi"
    >
      <p className="text-xs uppercase tracking-widest text-accent-text">
        {href ? 'Pesan siap diteruskan' : 'Mode Preview'}
      </p>
      <p className="mt-3 text-sm text-muted">
        {href
          ? 'Buka kanal resmi untuk meneruskan pesan Anda.'
          : 'Kontak resmi belum aktif. Pesan belum dikirim; salin teks ini untuk digunakan saat kontak resmi tersedia.'}
      </p>
      <pre
        tabIndex={0}
        className="mt-4 max-h-72 overflow-y-auto whitespace-pre-wrap break-words rounded-lg bg-surface p-4 font-sans text-sm leading-relaxed"
      >
        {message}
      </pre>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button type="button" variant="outline" disabled={copyState === 'pending'} onClick={copy}>
          <Copy size={16} aria-hidden />
          {copyState === 'copied' ? 'Tersalin!' : 'Salin pesan'}
        </Button>
        {href && (
          <Button asChild>
            <a
              href={href}
              target={href.startsWith('https:') ? '_blank' : undefined}
              rel="noopener noreferrer"
            >
              Buka {href.startsWith('https:') ? 'WhatsApp' : 'Email'}
              <ArrowUpRight size={16} aria-hidden />
            </a>
          </Button>
        )}
      </div>
      <p role="status" className="mt-3 text-sm text-muted">
        {copyState === 'error'
          ? 'Pesan gagal disalin. Pilih teks di atas dan salin secara manual.'
          : copyState === 'copied'
            ? 'Pesan berhasil disalin.'
            : ''}
      </p>
    </section>
  );
}
