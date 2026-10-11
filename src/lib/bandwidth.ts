import { z } from 'zod';
export const bandwidthSchema = z.object({
  users: z.coerce.number().int().min(10).max(1000),
  perUserMbps: z.coerce.number().min(1).max(1000),
});
export function estimateBandwidth(input: unknown): number | null {
  const parsed = bandwidthSchema.safeParse(input);
  return parsed.success ? Math.round(parsed.data.users * parsed.data.perUserMbps) : null;
}
export type BandwidthContext = {
  readonly profile: string;
  readonly users: number;
  readonly perUserMbps: number;
  readonly services: readonly string[];
};
export function composeBandwidth(context: BandwidthContext): string {
  return [
    'Halo NEX+, saya ingin konsultasi perencanaan bandwidth.',
    'Jenis lokasi: ' + context.profile,
    'Pengguna aktif bersamaan: ' + context.users,
    'Asumsi per pengguna: ' + context.perUserMbps + ' Mbps',
    'Estimasi kebutuhan bandwidth: ' + estimateBandwidth(context) + ' Mbps',
    ...(context.services.length ? ['Layanan yang dibutuhkan: ' + context.services.join(', ')] : []),
  ].join('\n');
}
