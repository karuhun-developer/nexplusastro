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
- Verifikasi migrasi awal memakai aset host lokal. Perubahan berikutnya ke server publik dijelaskan pada catatan verifikasi di bawah.
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

Kontak masih contoh dan harus diganti sebelum digunakan untuk konsultasi nyata. Formulir/dialog menyiapkan pesan; tidak mengirim data atau memakai AI. Monitoring adalah data demo statis dan selalu noindex. Pengecekan cakupan tidak menyatakan lokasi sudah terjangkau. Speed test mengukur unduh, unggah, dan latensi HTTP ke server publik Cloudflare; bukan ICMP atau jaminan SLA. Payload dibatasi 32 MiB unduh dan 8 MiB unggah; ketersediaan server eksternal memengaruhi hasil. Metadata domain dan indexing memerlukan rebuild setelah environment berubah.

## Perbaikan dropdown dan server pengujian, 11 Oktober 2026

Dropdown Solusi/Alat memakai SVG 20px dari atom Icon. Chromium mengamati rotasi 180 derajat saat terbuka, aktivasi keyboard, Escape dan pemulihan fokus; reduced motion menghasilkan transisi 0 detik. Semua 14 route diperiksa pada 390/1440/1920 dalam light/dark, bagian atas dan akhir dokumen: 84 kombinasi dan 168 capture. Tidak ada overflow, gambar rusak, atau exception runtime. Contact sheet untuk setiap pasangan ukuran/tema diperiksa secara visual; hasil PASS per route. Halaman speed test ditangkap ulang setelah penambahan jeda antartes.

Permintaan nyata dari localhost berhasil menuju endpoint publik Cloudflare: hasil terakhir 35,9 Mbps unduh dan 32,4 Mbps unggah, dengan 38 MiB payload terukur. Angka tersebut hanya hasil koneksi sesi pengujian, bukan patokan kecepatan pengguna. Pengujian berhenti pada batas waktu/data, dan mempertahankan unduh saat unggah gagal. HTTP 429 menghentikan tahap tanpa retry; jeda 60 detik sejak mulai tes tersimpan dalam sesi tab. Pembatasan di browser bukan penegakan per IP atau jaminan bebas rate limit dari penyedia.

Artefak lokal: `/tmp/nexplus-header-speed-qa`, termasuk hasil permintaan nyata, dropdown sebelum/sesudah, matrix, contact sheet, menu ponsel dan reduced motion. Output build tetap 14 halaman HTML dengan `output: static`, tanpa adapter SSR. Pengecekan tipe tanpa error/warning/hint dan 23 unit test lulus, termasuk endpoint eksternal dari localhost, batas transfer, pembatalan unggah, unggah gagal, respons kosong, serta HTTP 429.

Tujuh skenario E2E dan pemeriksaan SEO produksi lulus setelah perubahan terakhir. E2E membuktikan pembatalan/pemulihan jaringan, unggahan 8 MiB, tombol tertahan selama jeda, jeda tetap berlaku setelah refresh, dan tombol tersedia lagi setelah waktu berlalu. Endpoint E2E diintersep agar pengujian otomatis tidak membebani server publik; pengujian transfer nyata dilakukan terpisah melalui browser.
