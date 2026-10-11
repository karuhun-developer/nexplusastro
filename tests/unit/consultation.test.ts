import { describe, it, expect } from 'vitest';
import {
  consultationLink,
  contactSchema,
  coverageSchema,
  composeContact,
} from '@/lib/consultation';
describe('consultation', () => {
  it('never dispatches sample contacts', () => {
    expect(
      consultationLink(
        { contactIsPlaceholder: true, whatsapp: '628123456789', email: 'team@example.com' },
        'test',
      ),
    ).toBeNull();
  });
  it('prefers valid WhatsApp and encodes human messages', () => {
    expect(
      consultationLink(
        { contactIsPlaceholder: false, whatsapp: '+62 812 3456789', email: 'team@example.com' },
        'Halo & NEX+',
      ),
    ).toBe('https://wa.me/628123456789?text=Halo%20%26%20NEX%2B');
  });
  it('falls back to email or selectable text when a channel is absent', () => {
    expect(
      consultationLink(
        { contactIsPlaceholder: false, whatsapp: 'xxx', email: 'team@example.com' },
        'a\nb',
      ),
    ).toContain('body=a%0Ab');
    expect(
      consultationLink({ contactIsPlaceholder: false, whatsapp: null, email: 'invalid' }, 'test'),
    ).toBeNull();
  });
  it('rejects whitespace location and invalid phone or email', () => {
    expect(
      coverageSchema.safeParse({ location: '   ', businessType: '', service: '' }).success,
    ).toBe(false);
    expect(
      contactSchema.safeParse({
        name: 'Bayu',
        companyName: '',
        phone: 'abcdefgh',
        email: 'broken',
        location: 'Banjarmasin',
        service: '',
        notes: '',
      }).success,
    ).toBe(false);
  });
  it('trims values and preserves complete consultation details', () => {
    const data = contactSchema.parse({
      name: ' Bayu ',
      companyName: 'Nexus',
      phone: '+62 8123456789',
      email: 'test@example.com',
      location: ' Banjarbaru ',
      service: 'Metro E',
      notes: 'Dua kantor',
    });
    expect(composeContact(data)).toContain('Nama: Bayu\nPerusahaan: Nexus');
    expect(composeContact(data)).toContain('Lokasi pemasangan: Banjarbaru');
    expect(composeContact(data)).toContain('Catatan: Dua kantor');
  });
});
