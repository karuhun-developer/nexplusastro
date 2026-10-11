# NEX+

Website NEX+ dibangun ulang menggunakan **Astro, React islands, TypeScript, dan Tailwind CSS**. Konten dan ilustrasi dirender sebagai HTML statis; React hanya digunakan untuk interaksi. Logo, font, foto, dan ilustrasi berasal dari website awal.

## Menjalankan proyek

Gunakan Node.js 22.12 atau lebih baru dan npm.

```sh
npm ci
cp .env.example .env
npm run dev
```

`npm ci` memakai lockfile, konfigurasi peer dependency di `.npmrc`, dan override plugin React yang telah diuji bersama integrasi Astro/Vite.

```sh
npm run build
npm run preview
```

Output statis berada di `dist/`. Untuk Vercel, gunakan build command `npm run build` dan output directory `dist`. Tidak ada API server atau database.

## Environment dan SEO

| Variable         | Nilai awal                         | Fungsi                                                               |
| ---------------- | ---------------------------------- | -------------------------------------------------------------------- |
| `SITE_URL`       | `https://nex-plus-home.vercel.app` | Origin produksi untuk canonical, sitemap, schema, dan social preview |
| `SITE_INDEXABLE` | `true`                             | Mengizinkan indexing pada produksi                                   |
| `VERCEL_ENV`     | Diisi Vercel                       | Preview/development selalu noindex                                   |

`SITE_URL` harus berupa origin HTTP(S), tanpa path, query, hash, atau kredensial. **Rebuild setelah mengubah environment** karena metadata tertanam di output statis. `.env` tidak masuk Git. Saat pindah domain, ubah `SITE_URL` sebelum build.

Setiap halaman mempunyai judul, deskripsi, canonical, Open Graph, Twitter card, dan schema. Sitemap produksi memuat 12 URL. Monitoring dan 404 selalu noindex. Preview menolak crawling dan tidak memasukkan halaman ke sitemap. Buat ulang OG image lokal dengan `npm run generate:og`.

## Halaman

| Route                           | Isi                                                           |
| ------------------------------- | ------------------------------------------------------------- |
| `/`                             | Hero, kebutuhan bisnis, cakupan, pelanggan, perjalanan, mitra |
| `/solutions`                    | Katalog lima layanan                                          |
| `/solutions/internet-dedicated` | Internet Dedicated                                            |
| `/solutions/metro-e`            | Metro E                                                       |
| `/solutions/vsat`               | VSAT                                                          |
| `/solutions/managed-services`   | Managed Services                                              |
| `/solutions/iptv-hospitality`   | IPTV System Hospitality                                       |
| `/contact`                      | Formulir konsultasi dan kontak                                |
| `/coverage`                     | Permintaan pengecekan lokasi                                  |
| `/bandwidth-calculator`         | Estimasi bandwidth                                            |
| `/speed-test`                   | Uji download dan latency HTTP                                 |
| `/infrastructure`               | Diagram konektivitas interaktif                               |
| `/monitoring`                   | Dashboard demonstrasi                                         |
| `404.html`                      | Pemulihan URL yang tidak ditemukan                            |

Navigasi memakai link multipage biasa. Anchor lama `/solutions#service-*`, `/#customers`, `/#journey`, dan `/#partners` tetap tersedia. Tentang perusahaan, pelanggan, dan mitra berada di Home.

## Struktur komponen

```text
config/site.mjs               Environment dan indexing
src/layouts/SiteLayout.astro  Metadata, shell, tema
src/components/atoms         Brand, Icon, Kicker, LinkButton, Panel
src/components/molecules     Heading, breadcrumb, card, hasil pesan, grafik
src/components/organisms     Header/footer, Home, formulir, dialog, alat
src/components/ui            Button CVA/Radix, field, select
src/components/art           Ilustrasi SVG tanpa hydration
src/lib                      Konten dan logika domain tanpa UI
src/pages                    Halaman Astro dan robots.txt
src/styles/global.css        Token tema dan Tailwind
public                       Logo, font, foto, favicon, OG
```

Edit layanan/kontak di `src/lib/content.ts`, logo di `src/lib/logos.ts`, data demo di `src/lib/monitoring.ts`, dan token di `src/styles/global.css`. Halaman layanan menggunakan satu template. Pedoman tampilan: [DESIGN.md](DESIGN.md).

Button mengikuti komposisi shadcn dengan CVA dan Radix Slot; dialog memakai Radix Dialog. Proyek tidak membutuhkan registry shadcn. Tambahkan island hanya saat interaksi membutuhkannya.

## Kontak resmi

Kontak awal adalah **contoh**, termasuk `sales@nexplus.example`. Formulir memvalidasi input dan menyiapkan pesan yang bisa disalin, tanpa mengirim data ke server. Cek cakupan menyiapkan permintaan verifikasi lokasi dan tidak mengklaim lokasi sudah terjangkau.

Isi `company.email`, `company.phone`, dan `company.whatsapp` di `src/lib/content.ts` dengan kontak yang disetujui, lalu ubah `contactIsPlaceholder` menjadi `false`. WhatsApp memakai kode negara tanpa awalan 0. Rebuild setelah perubahan; label kontak pada footer/halaman ikut berubah.

WhatsApp valid menjadi kanal utama, email valid menjadi fallback. Jika belum tersedia, pengguna tetap bisa menyalin pesan. Link membuka kanal eksternal dengan pesan terisi; pengguna mengirimnya sendiri. Clipboard yang ditolak menyediakan teks untuk disalin manual. Dialog adalah panduan konsultasi tanpa layanan AI.

## Perilaku alat

- **Kalkulator:** pengguna aktif × Mbps per pengguna; default 250 × 2 = 500 Mbps. Profil, CCTV, dan layanan lain menjadi konteks pesan, tanpa penambahan bandwidth otomatis.
- **Uji kecepatan:** enam probe HTTP berurutan, hingga empat stream download dari dua foto lokal, tanpa retry. Latency dibatasi 5 detik; download 7 detik dan 16 MiB untuk payload bawaan. UI diperbarui per 100 ms dan dapat dibatalkan. Hasil dipengaruhi host/browser/cache/koneksi, tidak mengukur upload atau menjamin SLA. Sampel singkat ditandai sebagai batas bawah. Saat mengganti foto uji, pertahankan masing-masing di bawah 1 MiB atau sesuaikan reservasi dan tes.
- **Infrastruktur:** tiga node yang dapat dipilih dan replay 1,8 detik; berhenti saat tab tersembunyi dan mengikuti reduced motion.
- **Monitoring:** perangkat, trafik, dan insiden merupakan data contoh tetap. Jam WITA mengikuti waktu browser, berhenti memperbarui saat tab tersembunyi. Tidak terhubung ke monitoring produksi.

## Pemeriksaan

```sh
npm run format:check
npm run check
npm test
npm run build
npm run test:seo
npx playwright install chromium
npm run test:e2e
VERCEL_ENV=preview npm run build -- --outDir dist-preview
node tests/seo.mjs dist-preview --noindex
```

E2E menjalankan production preview pada port 4322. `BROWSER_PATH` opsional untuk Chromium yang telah terpasang. CI menjalankan format, tipe, unit, build, SEO produksi/preview, dan E2E.

`npm run audit:react` adalah audit tambahan. Probe latency sengaja berurutan agar pengukuran tidak saling mengganggu. Checkbox memiliki label native yang membungkus input; nama aksesibelnya diperiksa di browser.

Capture visual memakai library Omowright dari skill browser dan Bun, setelah `npm run preview`:

```sh
OMO_BROWSER_SKILL=/path/to/skills/browser QA_DIR=/tmp/nexplus-qa bun tests/browser/capture.mjs
```

Script memeriksa 14 halaman × lebar 320/390/768/1440/1920 × dua tema, menyimpan screenshot atas/bawah dan `matrix.json`. Library skill bukan dependency aplikasi. `QA_BASE_URL` dapat mengganti URL preview. Ringkasan bukti: [docs/verification.md](docs/verification.md).
