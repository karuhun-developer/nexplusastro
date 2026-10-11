# Verifikasi migrasi NEX+

Verifikasi dilakukan pada 11 Oktober 2026 terhadap production build lokal. Hasil: 13 halaman konten dan halaman 404 tersedia, navigasi multipage berjalan, dan tidak ditemukan masalah yang menghalangi penggunaan pada cakupan pengujian berikut.

## Halaman dan visual

Matriks browser mencakup **14 halaman × 5 lebar (320, 390, 768, 1440, 1920) × 2 tema = 140 kombinasi**, dengan 280 screenshot atas/bawah. Lebar 390 memakai emulasi iPhone 14; 320 memakai viewport ponsel dengan DPR 3. Setiap navigasi menerapkan ulang emulasi.

Semua kombinasi memiliki satu H1, gambar berhasil dimuat, tanpa exception runtime dan tanpa overflow horizontal utama. Screenshot atas benar-benar berada di posisi 0; screenshot bawah mencapai akhir dokumen. Contact sheet diperiksa untuk setiap halaman, ukuran, dan tema. Home juga diperiksa melalui capture bagian tengah pada ponsel/desktop dalam kedua tema. Capture halaman penuh tambahan menggunakan viewport 390/1440 dengan DPR 1 tanpa emulasi mobile, karena capture CDP dalam emulasi mobile tidak menggambar seluruh dokumen.

| Halaman                         | Verdict | Bukti perilaku/tampilan                                                                 |
| ------------------------------- | ------- | --------------------------------------------------------------------------------------- |
| `/`                             | PASS    | Split hero, ilustrasi asli, kartu layanan, pelanggan, perjalanan, mitra, CTA dan footer |
| `/solutions`                    | PASS    | Lima layanan, anchor kompatibel dan link detail                                         |
| `/solutions/internet-dedicated` | PASS    | Breadcrumb, ilustrasi, konteks, konsultasi dan layanan terkait                          |
| `/solutions/metro-e`            | PASS    | Template layanan dan ilustrasi dua lokasi                                               |
| `/solutions/vsat`               | PASS    | Template layanan dan ilustrasi satelit                                                  |
| `/solutions/managed-services`   | PASS    | Template layanan dan konteks pengelolaan                                                |
| `/solutions/iptv-hospitality`   | PASS    | Template layanan dan ilustrasi hospitality                                              |
| `/contact`                      | PASS    | Validasi, pilihan layanan dari query, pesan dan clipboard fallback                      |
| `/coverage`                     | PASS    | Validasi lokasi dan penyusunan permintaan pengecekan                                    |
| `/bandwidth-calculator`         | PASS    | 500 Mbps awal, perubahan desimal, input invalid memblokir konsultasi                    |
| `/speed-test`                   | PASS    | Download nyata, cancellation, kegagalan jaringan dan pemulihan                          |
| `/infrastructure`               | PASS    | Pemilihan node, replay, interupsi dan reduced motion                                    |
| `/monitoring`                   | PASS    | Label demo, filter status, grafik dan status dengan teks                                |
| URL tidak ditemukan             | PASS    | Halaman 404 dengan link pemulihan                                                       |

Referensi Home dibandingkan pada viewport desktop yang sama. Logo, font, hero, ilustrasi server, warna merah dan urutan konten dipertahankan. Spacing, ringkasan statistik, navigasi alat dan tata letak responsif mengikuti [kontrak desain](../DESIGN.md); migrasi ini bukan salinan piksel identik. Halaman lain mengikuti kontrak yang sama.

## Interaksi dan aksesibilitas

- Menu ponsel dan dropdown desktop dapat dibuka/dipakai; Escape menutup dan fokus kembali ke pemicu. Tema tersimpan lintas halaman.
- Dialog memakai Radix dengan close, Escape, focus trap dan pemulihan fokus. Clipboard berhasil dibaca kembali; penolakan clipboard menyediakan teks untuk disalin manual.
- Formulir memfokuskan input invalid pertama, mengaitkan error dengan field dan menyiapkan pesan tanpa POST.
- Kalkulator menghitung 250 × 2 = 500 Mbps dan 250 × 3,5 = 875 Mbps; asumsi 0 memblokir tindakan.
- Replay infrastruktur selesai dalam 1,8 detik, dapat dihentikan, dan disabled pada reduced motion. Marquee pelanggan dapat dijeda dan berhenti pada reduced motion.
- Speed test berhasil memakai aset host lokal. Abort/cancellation dan kegagalan request juga diuji melalui browser.
- Fokus, label, hierarki, reflow ponsel, teks status dan light/dark diperiksa. Ini pengujian browser Chromium dan emulasi perangkat, bukan sertifikasi aksesibilitas atau pengujian Safari/Firefox/perangkat fisik.

## Pemeriksaan otomatis

| Pemeriksaan                                    | Hasil                                                       |
| ---------------------------------------------- | ----------------------------------------------------------- |
| `npm ci`                                       | PASS, lockfile terpasang                                    |
| `npm run format:check`                         | PASS                                                        |
| `npm run check`                                | PASS, tanpa error/warning/hint                              |
| `npm test`                                     | PASS, 17 unit test                                          |
| `npm run build`                                | PASS, 14 halaman statis                                     |
| `npm run test:seo`                             | PASS, metadata/schema/robots/12 URL sitemap/aset/anchor     |
| `npm run test:e2e`                             | PASS, 5 skenario browser                                    |
| Build `VERCEL_ENV=preview` dan SEO `--noindex` | PASS, semua noindex, robots menolak crawling, tanpa sitemap |
| `npm run audit:react`                          | 82/100; 0 error dan 2 warning yang ditinjau                 |

Audit React hanya mengecualikan output build/generated melalui `doctor.config.json`, tanpa menonaktifkan rule pada source. Dua warning tersisa: checkbox kalkulator berada di dalam label native (nama aksesibelnya diperiksa di browser), dan `await` pada loop latency memang diperlukan untuk enam probe berurutan. Keduanya tetap terlihat pada laporan audit.

CI pada push `main`/pull request menjalankan format, tipe, unit, build, SEO produksi, E2E Chromium, serta build/SEO preview.

## Reproduksi dan artefak

Perintah pengujian utama tersedia di [README](../README.md#pemeriksaan). Untuk capture interaksi setelah production preview berjalan:

```sh
OMO_BROWSER_SKILL=/path/to/skills/browser QA_DIR=/tmp/nexplus-qa bun tests/browser/interactions.mjs
```

Artefak sesi lokal berada di `/tmp/nexplus-final-qa`: `matrix.json`, `interactions.json`, screenshot halaman/interaksi, capture Home penuh, dan contact sheet. Artefak sementara tidak masuk repo; script untuk membuatnya kembali tersedia di `tests/browser`.

## Batas fungsi

Kontak masih contoh dan harus diganti sebelum digunakan untuk konsultasi nyata. Formulir/dialog menyiapkan pesan; tidak mengirim data atau memakai AI. Monitoring adalah data demo statis dan selalu noindex. Pengecekan cakupan tidak menyatakan lokasi sudah terjangkau. Speed test mengukur download dan latency HTTP ke host halaman, bukan upload/ICMP/SLA; batas 16 MiB berlaku untuk payload bawaan di bawah 1 MiB. Metadata domain dan indexing memerlukan rebuild setelah environment berubah.
