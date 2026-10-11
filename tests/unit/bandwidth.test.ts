import { describe, it, expect } from 'vitest';
import { estimateBandwidth, composeBandwidth } from '@/lib/bandwidth';
describe('bandwidth planning', () => {
  it('starts at the source default of 500 Mbps', () => {
    expect(estimateBandwidth({ users: 250, perUserMbps: 2 })).toBe(500);
  });
  it('rounds fractional planning assumptions', () => {
    expect(estimateBandwidth({ users: 11, perUserMbps: 1.5 })).toBe(17);
  });
  it('rejects absent, nonfinite, and out-of-range inputs', () => {
    for (const input of [
      { users: 10, perUserMbps: '' },
      { users: 1001, perUserMbps: 2 },
      { users: 10, perUserMbps: Infinity },
      { users: 0, perUserMbps: 2 },
    ])
      expect(estimateBandwidth(input)).toBeNull();
  });
  it('keeps profile and optional services as context only', () => {
    const base = {
      profile: 'Hotel',
      users: 250,
      perUserMbps: 2,
      services: ['CCTV · 10 kamera', 'IPTV'],
    };
    expect(composeBandwidth(base)).toContain('Estimasi kebutuhan bandwidth: 500 Mbps');
    expect(composeBandwidth(base)).toContain('CCTV · 10 kamera, IPTV');
  });
});
