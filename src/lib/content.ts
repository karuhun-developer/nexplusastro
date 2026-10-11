export type Service = {
  readonly id: string; readonly number: string; readonly title: string; readonly category: string;
  readonly description: string; readonly endpoints: readonly string[]; readonly useCase: string; readonly contextHref: string;
};
export const services = [
  { id: 'internet-dedicated', number: '01', title: 'Internet Dedicated', category: 'ENTERPRISE CONNECTIVITY', description: 'Konektivitas internet untuk mendukung kebutuhan dan aktivitas bisnis Anda.', endpoints: ['FIBER', 'NEX+', 'ENTERPRISE'], useCase: 'Cocok untuk bisnis yang butuh koneksi internet mendukung operasional sehari-hari.', contextHref: '/coverage' },
  { id: 'metro-e', number: '02', title: 'Metro E', category: 'OFFICE NETWORK', description: 'Koneksi jaringan untuk menghubungkan kebutuhan kantor dan bisnis Anda.', endpoints: ['OFFICE A', 'METRO E', 'OFFICE B'], useCase: 'Cocok untuk perusahaan dengan lebih dari satu lokasi kantor.', contextHref: '/coverage' },
  { id: 'vsat', number: '03', title: 'VSAT', category: 'SATELLITE CONNECTIVITY', description: 'Konektivitas berbasis satelit untuk kebutuhan komunikasi bisnis Anda.', endpoints: ['GROUND', 'SATELLITE', 'REMOTE SITE'], useCase: 'Cocok untuk lokasi yang sulit dijangkau jaringan kabel.', contextHref: '/coverage' },
  { id: 'managed-services', number: '04', title: 'Managed Services', category: 'TECHNICAL OPERATIONS', description: 'Dukungan pengelolaan layanan dan operasional teknis untuk bisnis Anda.', endpoints: ['NETWORK', 'OPERATIONS', 'SUPPORT'], useCase: 'Cocok untuk tim yang butuh dukungan pengelolaan dan pemantauan jaringan.', contextHref: '/contact' },
  { id: 'iptv-hospitality', number: '05', title: 'IPTV System Hospitality', category: 'HOSPITALITY TECHNOLOGY', description: 'Sistem IPTV untuk mendukung kebutuhan teknologi di lingkungan hospitality.', endpoints: ['IPTV', 'SYSTEM', 'HOSPITALITY'], useCase: 'Cocok untuk hotel dan bisnis hospitality.', contextHref: '/contact' },
] as const satisfies readonly Service[];
export const company = { legalName: 'PT. Nexus Indonesia Plus', contactIsPlaceholder: true, email: 'sales@nexplus.example', phone: '+62 8xx xxxx xxxx', whatsapp: null, address: null, logo: '/brand/nexus-logo.svg' } satisfies { readonly legalName: string; readonly contactIsPlaceholder: boolean; readonly email: string | null; readonly phone: string | null; readonly whatsapp: string | null; readonly address: string | null; readonly logo: string };
export const credentials = [{ value: '2018', label: 'Melayani konektivitas sejak' }, { value: '2024', label: 'Izin ISP resmi terbit' }, { value: '20+', label: 'Perusahaan terlayani hingga Q3 2025' }] as const;
export const milestones = [
  { year: '2018', title: 'Awal sebuah koneksi.', description: 'Memulai perjalanan sebagai penyedia internet untuk pengguna retail dan rumahan di bawah PT. First Global Network.' },
  { year: '2022', title: 'Tumbuh bersama bisnis.', description: 'Mulai mendapatkan kepercayaan sebagai solusi akses internet untuk perusahaan.' },
  { year: '2024', title: 'Babak baru. NEX+.', description: 'Bertransformasi menjadi PT. Nexus Indonesia Plus setelah terbitnya izin ISP, melayani empat perusahaan di Kalimantan Selatan.' },
  { year: '2025', title: 'Kepercayaan yang meluas.', description: 'Hingga Q3 2025, NEX+ telah tumbuh melayani lebih dari 20 perusahaan.' },
] as const;
export const excellence = [
  { title: 'After Sales Support', description: 'Dukungan yang berlanjut setelah layanan berjalan.' },
  { title: 'Non-Stop Monitoring', description: 'Pemantauan layanan secara berkelanjutan.' },
  { title: 'Bandwidth on Demand', description: 'Bandwidth untuk kebutuhan bisnis Anda.' },
  { title: 'Private Support', description: 'Dukungan untuk kebutuhan pelanggan.' },
] as const;
export const businessTypes = ['Hotel dan hospitality', 'Rumah sakit dan klinik', 'Kampus dan sekolah', 'Instansi pemerintah', 'Kantor dan perusahaan', 'Lainnya'] as const;
export const navigation = [{ label: 'Cakupan', href: '/coverage' }, { label: 'Infrastruktur', href: '/infrastructure' }, { label: 'Pelanggan', href: '/#customers' }, { label: 'Tentang', href: '/#journey' }] as const;
