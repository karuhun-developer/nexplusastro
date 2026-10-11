import * as Dialog from '@radix-ui/react-dialog';
import { X, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import type { SubmitEvent } from 'react';
import { Button } from '../ui/button';
import { TextareaField } from '../ui/select-field';
import { MessageResult } from '../molecules/MessageResult';
export function ConsultationDialog({ floating = false }: { readonly floating?: boolean }) {
  const [question, setQuestion] = useState('');
  const [message, setMessage] = useState('');
  function submit(e: SubmitEvent) {
    e.preventDefault();
    if (question.trim().length >= 3)
      setMessage('Halo NEX+, saya punya pertanyaan:\n' + question.trim());
  }
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        {floating ? (
          <button
            className="fixed right-4 bottom-5 z-40 flex size-14 items-center justify-center rounded-full border border-rule bg-action text-white shadow-xl sm:right-6"
            aria-label="Buka asisten NEX+"
          >
            <MessageCircle size={24} aria-hidden />
          </button>
        ) : (
          <Button variant="outline">
            Tanya tim NEX+
            <MessageCircle size={18} aria-hidden />
          </Button>
        )}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" />
        <Dialog.Content className="glass fixed top-1/2 left-1/2 z-50 max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg -translate-1/2 overflow-y-auto p-6 sm:p-8">
          <Dialog.Title className="pr-10 font-display text-2xl">Asisten NEX+</Dialog.Title>
          <Dialog.Description className="mt-4 text-sm text-muted">
            Tulis pertanyaan seputar layanan NEX+. Tim kami yang membalas langsung melalui kanal
            resmi; ini bukan jawaban otomatis.
          </Dialog.Description>
          <Dialog.Close asChild>
            <button
              aria-label="Tutup asisten NEX+"
              className="absolute top-3 right-3 flex size-11 items-center justify-center rounded-control hover:bg-raised"
            >
              <X size={20} aria-hidden />
            </button>
          </Dialog.Close>
          <form className="mt-6 grid gap-4" onSubmit={submit}>
            <TextareaField
              label="Pertanyaan Anda"
              rows={3}
              minLength={3}
              maxLength={2000}
              required
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value);
                setMessage('');
              }}
              placeholder="Contoh: bagaimana proses pemasangan Internet Dedicated?"
            />
            <Button type="submit" disabled={question.trim().length < 3}>
              Susun pertanyaan
            </Button>
          </form>
          {message && <MessageResult key={message} message={message} />}
          <div className="mt-6 grid gap-2 border-t border-rule pt-5 text-sm">
            <a href="/coverage" className="min-h-11 rounded-control p-3 hover:bg-raised">
              Cek cakupan lokasi →
            </a>
            <a
              href="/bandwidth-calculator"
              className="min-h-11 rounded-control p-3 hover:bg-raised"
            >
              Hitung kebutuhan bandwidth →
            </a>
            <a href="/contact" className="min-h-11 rounded-control p-3 hover:bg-raised">
              Halaman konsultasi →
            </a>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
