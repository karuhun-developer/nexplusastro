import { z } from 'zod';
export type ContactChannel = {
  readonly contactIsPlaceholder: boolean;
  readonly whatsapp: string | null;
  readonly email: string | null;
};
export function consultationLink(channel: ContactChannel, message: string): string | null {
  if (channel.contactIsPlaceholder) return null;
  const phone = channel.whatsapp?.replace(/\D/g, '');
  if (phone && /^[1-9]\d{7,14}$/.test(phone))
    return 'https://wa.me/' + phone + '?text=' + encodeURIComponent(message);
  const email = z.email().safeParse(channel.email);
  return email.success
    ? 'mailto:' +
        email.data +
        '?subject=' +
        encodeURIComponent('Konsultasi NEX+') +
        '&body=' +
        encodeURIComponent(message)
    : null;
}
const text = (min: number, max: number, message: string) =>
  z.string().trim().min(min, message).max(max, 'Teks terlalu panjang.');
export const coverageSchema = z.object({
  location: text(3, 300, 'Tulis lokasi atau alamat, minimal nama kelurahan.'),
  businessType: z.string().max(100),
  service: z.string().max(100),
});
export const contactSchema = z.object({
  name: text(2, 100, 'Tulis nama Anda dulu.'),
  companyName: z.string().trim().max(150),
  phone: text(8, 30, 'Tulis nomor WhatsApp atau telepon yang valid.').refine(
    (v) =>
      /^[+()\d\s-]+$/.test(v) &&
      v.replace(/\D/g, '').length >= 8 &&
      v.replace(/\D/g, '').length <= 15,
    'Tulis nomor WhatsApp atau telepon yang valid.',
  ),
  email: z.union([z.literal(''), z.email('Format email belum benar.')]),
  location: text(3, 300, 'Tulis lokasi pemasangan, minimal nama kelurahan.'),
  service: z.string().max(100),
  notes: z.string().trim().max(2000),
});
export function composeContact(data: z.infer<typeof contactSchema>): string {
  return [
    'Halo NEX+, saya ingin konsultasi kebutuhan konektivitas.',
    'Nama: ' + data.name,
    ...(data.companyName ? ['Perusahaan: ' + data.companyName] : []),
    'WhatsApp/Telepon: ' + data.phone,
    ...(data.email ? ['Email: ' + data.email] : []),
    'Lokasi pemasangan: ' + data.location,
    ...(data.service ? ['Layanan diminati: ' + data.service] : []),
    ...(data.notes ? ['Catatan: ' + data.notes] : []),
  ].join('\n');
}
export function composeCoverage(data: z.infer<typeof coverageSchema>): string {
  return [
    'Halo NEX+, saya ingin menanyakan ketersediaan layanan.',
    'Lokasi: ' + data.location,
    ...(data.businessType ? ['Jenis: ' + data.businessType] : []),
    ...(data.service ? ['Layanan diminati: ' + data.service] : []),
  ].join('\n');
}
