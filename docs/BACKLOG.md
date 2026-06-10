# 📋 UMKMoo's — Product Backlog

> **Platform Manajemen Bisnis All-in-One untuk UMKM Indonesia**
> Versi: 1.0.0 | Status: In Development | Terakhir diperbarui: 2026-06-10

---

## 📑 Daftar Isi

- [Ringkasan](#ringkasan)
- [Epic 1 — Manajemen Akun & Autentikasi](#epic-1--manajemen-akun--autentikasi)
- [Epic 2 — POS (Point of Sale) / Kasir](#epic-2--pos-point-of-sale--kasir)
- [Epic 3 — Manajemen Stok](#epic-3--manajemen-stok)
- [Epic 4 — Laporan Keuangan Syariah](#epic-4--laporan-keuangan-syariah)
- [Epic 5 — Zakat Mal](#epic-5--zakat-mal)
- [Epic 6 — Manajemen Karyawan & Absensi](#epic-6--manajemen-karyawan--absensi)
- [Epic 7 — Budgeting](#epic-7--budgeting)
- [Epic 8 — Dashboard & Analytics](#epic-8--dashboard--analytics)
- [Epic 9 — Integrasi AI & OCR](#epic-9--integrasi-ai--ocr)
- [Epic 10 — WhatsApp Bot](#epic-10--whatsapp-bot)
- [Epic 11 — Keamanan & Kepatuhan (Compliance)](#epic-11--keamanan--kepatuhan-compliance)
- [Epic 12 — Infrastruktur & DevOps](#epic-12--infrastruktur--devops)
- [Prioritas & Estimasi](#prioritas--estimasi)

---

## Ringkasan

UMKMoo's adalah platform berbasis **web (Next.js)** dan **mobile (React Native)** dengan backend **Node.js/Go** dan database **Supabase (PostgreSQL)**, yang dirancang untuk UMKM Indonesia. Backlog ini disusun berdasarkan seluruh dokumentasi proyek mencakup fitur produk, aturan bisnis, keamanan, kepatuhan, dan panduan pengembang.

**Peran Pengguna dalam Sistem:**

| Peran | Deskripsi |
|---|---|
| **Admin** | Akses penuh — manajemen akun & pengaturan sistem |
| **Pemilik Usaha** | Dashboard, laporan, zakat, budgeting, stok |
| **Kasir / Staff** | POS, riwayat transaksi harian |
| **Akuntan** | Laporan keuangan, riwayat transaksi, export |
| **Logistik** | Manajemen stok, laporan persediaan |

---

## Epic 1 — Manajemen Akun & Autentikasi

> Registrasi bisnis, login, manajemen peran, onboarding, dan pengaturan metode pembayaran.

### 🔵 US-001 | Registrasi Akun Bisnis Baru
**Sebagai** calon pengguna,  
**Saya ingin** mendaftar akun bisnis baru dengan data valid,  
**Sehingga** saya dapat mulai mengelola bisnis saya di platform.

**Kriteria Penerimaan:**
- [ ] Form registrasi dengan field: nama, email, nomor telepon, alamat, nama usaha, logo
- [ ] Validasi email unik
- [ ] Upload dokumen identitas (KTP / paspor) untuk KYC
- [ ] Upload dokumen verifikasi alamat
- [ ] Email konfirmasi dikirim setelah registrasi
- [ ] Sistem menyimpan data ke tabel `users` dan `businesses`

**Prioritas:** 🔴 Sangat Tinggi | **Estimasi:** 5 SP

---

### 🔵 US-002 | Login & Autentikasi JWT
**Sebagai** pengguna terdaftar,  
**Saya ingin** login menggunakan email dan password,  
**Sehingga** saya dapat mengakses fitur sesuai peran saya.

**Kriteria Penerimaan:**
- [ ] Form login dengan email & password
- [ ] Autentikasi via Supabase Auth (JWT)
- [ ] Token JWT disimpan dan digunakan untuk setiap request API
- [ ] Redirect ke dashboard sesuai peran (Admin / Kasir / Akuntan / Logistik)
- [ ] Pesan error yang informatif jika login gagal
- [ ] Fitur logout yang menghapus sesi

**Prioritas:** 🔴 Sangat Tinggi | **Estimasi:** 3 SP

---

### 🔵 US-003 | Manajemen Peran & Hak Akses (RBAC)
**Sebagai** Admin,  
**Saya ingin** mengatur peran dan hak akses setiap pengguna,  
**Sehingga** setiap user hanya dapat mengakses fitur yang relevan dengan perannya.

**Kriteria Penerimaan:**
- [ ] Admin dapat membuat, mengubah, dan menghapus akun pengguna
- [ ] Admin dapat mengatur peran: Pemilik Usaha, Kasir, Akuntan, Logistik
- [ ] Sistem memblokir akses ke fitur yang di luar hak akses peran
- [ ] Kasir tidak bisa mengakses laporan keuangan
- [ ] Admin Sistem tidak bisa mengakses data keuangan

**Prioritas:** 🔴 Sangat Tinggi | **Estimasi:** 5 SP

---

### 🔵 US-004 | Onboarding Bisnis
**Sebagai** pengguna baru,  
**Saya ingin** melalui proses setup awal yang terpandu,  
**Sehingga** bisnis saya siap digunakan dengan cepat.

**Kriteria Penerimaan:**
- [ ] Wizard/stepper onboarding: profil bisnis → sistem akuntansi → kategori pengeluaran → produk & stok awal → undang karyawan → anggaran bulanan
- [ ] Pilihan sistem akuntansi: Syariah / Konvensional
- [ ] Upload logo bisnis ke Supabase Storage
- [ ] Data tersimpan ke tabel `businesses`

**Prioritas:** 🟠 Tinggi | **Estimasi:** 5 SP

---

### 🔵 US-005 | Pengaturan Metode Pembayaran
**Sebagai** Admin / Pemilik Usaha,  
**Saya ingin** mengatur metode pembayaran yang tersedia di kasir,  
**Sehingga** kasir dapat menerima pembayaran sesuai pilihan yang diaktifkan.

**Kriteria Penerimaan:**
- [ ] Opsi metode pembayaran: Cash, QRIS, e-wallet, transfer bank
- [ ] Admin dapat mengaktifkan/menonaktifkan metode pembayaran tertentu
- [ ] Pengaturan tersimpan dan langsung berlaku di modul POS

**Prioritas:** 🟠 Tinggi | **Estimasi:** 2 SP

---

## Epic 2 — POS (Point of Sale) / Kasir

> Proses transaksi penjualan, auto-potong stok, struk digital, dan void transaksi.

### 🔵 US-006 | Proses Transaksi Penjualan
**Sebagai** Kasir,  
**Saya ingin** melakukan transaksi penjualan dengan memilih produk atau scan barcode,  
**Sehingga** transaksi tercatat otomatis dan stok terpotong.

**Kriteria Penerimaan:**
- [ ] Tampilan kasir dengan daftar produk dan fitur pencarian / scan barcode
- [ ] Tambah produk ke keranjang dengan pilihan kuantitas
- [ ] Kalkulasi total otomatis termasuk diskon (jika ada)
- [ ] Pilih metode pembayaran: Cash, QRIS, e-wallet, transfer
- [ ] Konfirmasi transaksi → stok terpotong otomatis
- [ ] Data transaksi tersimpan ke tabel `transactions`
- [ ] API endpoint `POST /transaction` dipanggil saat konfirmasi

**Prioritas:** 🔴 Sangat Tinggi | **Estimasi:** 8 SP

---

### 🔵 US-007 | Struk Digital
**Sebagai** Kasir,  
**Saya ingin** mencetak atau mengirimkan struk digital setelah transaksi,  
**Sehingga** pelanggan mendapatkan bukti pembayaran.

**Kriteria Penerimaan:**
- [ ] Struk digital digenerate otomatis setelah transaksi berhasil
- [ ] Struk dapat dikirim via WhatsApp atau email
- [ ] Tampilan struk mencakup: nama bisnis, daftar produk, total, metode bayar, tanggal & waktu
- [ ] Struk dapat diunduh sebagai PDF

**Prioritas:** 🟠 Tinggi | **Estimasi:** 3 SP

---

### 🔵 US-008 | Void / Pembatalan Transaksi
**Sebagai** Kasir / Admin,  
**Saya ingin** membatalkan transaksi yang salah,  
**Sehingga** stok dan laporan keuangan tetap akurat.

**Kriteria Penerimaan:**
- [ ] Kasir dapat melakukan void transaksi dengan alasan yang dicatat
- [ ] Stok dikembalikan secara otomatis setelah void
- [ ] Void dicatat dalam audit trail (tabel `transactions` dengan tipe `retur`)
- [ ] Notifikasi dikirim ke Admin/Pemilik Usaha

**Prioritas:** 🟠 Tinggi | **Estimasi:** 3 SP

---

### 🔵 US-009 | Persetujuan Transaksi Besar (Four Eyes Rule)
**Sebagai** sistem,  
**Saya ingin** meminta persetujuan dua pihak untuk transaksi besar,  
**Sehingga** transaksi dengan nilai signifikan tidak dapat diproses sepihak.

**Kriteria Penerimaan:**
- [ ] Transaksi < Rp 1.000.000: langsung diproses tanpa persetujuan tambahan
- [ ] Transaksi Rp 1.000.000 – Rp 5.000.000: persetujuan satu pihak (Manajer Keuangan)
- [ ] Transaksi > Rp 5.000.000: persetujuan dua pihak (Pemilik Usaha + Akuntan)
- [ ] Notifikasi otomatis dikirim ke pihak yang berwenang
- [ ] Transaksi ditunda (pending) hingga persetujuan diterima

**Prioritas:** 🟡 Sedang | **Estimasi:** 5 SP

---

### 🔵 US-010 | Riwayat Transaksi
**Sebagai** Kasir / Admin / Akuntan,  
**Saya ingin** melihat riwayat transaksi berdasarkan tanggal dan filter tertentu,  
**Sehingga** saya dapat memonitor aktivitas penjualan.

**Kriteria Penerimaan:**
- [ ] Daftar transaksi dengan filter: tanggal, metode bayar, jenis (penjualan/pengeluaran/retur)
- [ ] Detail transaksi dapat dibuka (produk, jumlah, pembayar)
- [ ] Kasir hanya melihat transaksi hari ini; Akuntan dapat melihat semua periode

**Prioritas:** 🟠 Tinggi | **Estimasi:** 3 SP

---

## Epic 3 — Manajemen Stok

> Input stok, pemantauan real-time, HPP otomatis, notifikasi stok menipis, laporan stok.

### 🔵 US-011 | Input & Pengelolaan Produk
**Sebagai** Admin / Logistik,  
**Saya ingin** menambahkan dan mengelola data produk,  
**Sehingga** stok dan harga produk selalu terupdate.

**Kriteria Penerimaan:**
- [ ] Form tambah/edit produk: nama, kategori, harga jual, HPP, stok awal, stok minimum, satuan
- [ ] Data produk tersimpan ke tabel `products`
- [ ] Produk dapat dinonaktifkan tanpa dihapus (soft delete)
- [ ] Pencarian dan filter produk berdasarkan kategori

**Prioritas:** 🔴 Sangat Tinggi | **Estimasi:** 5 SP

---

### 🔵 US-012 | Pemantauan Stok Real-time
**Sebagai** Admin / Logistik,  
**Saya ingin** melihat status stok semua produk secara real-time,  
**Sehingga** saya dapat mengambil keputusan pengadaan yang tepat.

**Kriteria Penerimaan:**
- [ ] Halaman manajemen stok menampilkan daftar produk beserta jumlah stok terkini
- [ ] Stok terpotong otomatis setiap ada transaksi penjualan via POS
- [ ] API endpoint `GET /stock` mengembalikan data stok saat ini
- [ ] Indikator visual (hijau/kuning/merah) berdasarkan level stok vs minimum

**Prioritas:** 🔴 Sangat Tinggi | **Estimasi:** 5 SP

---

### 🔵 US-013 | Kalkulasi HPP (Harga Pokok Penjualan) Otomatis
**Sebagai** sistem,  
**Saya ingin** menghitung HPP secara otomatis berdasarkan data produk,  
**Sehingga** laporan laba rugi akurat tanpa perhitungan manual.

**Kriteria Penerimaan:**
- [ ] HPP dihitung otomatis saat produk ditambahkan atau stok diperbarui
- [ ] Logika HPP diimplementasikan di backend (service layer)
- [ ] Nilai HPP tercermin dalam laporan laba rugi

**Prioritas:** 🔴 Sangat Tinggi | **Estimasi:** 3 SP

---

### 🔵 US-014 | Notifikasi Stok Menipis
**Sebagai** Admin / Logistik,  
**Saya ingin** menerima notifikasi saat stok produk mendekati batas minimum,  
**Sehingga** saya dapat segera melakukan pengadaan.

**Kriteria Penerimaan:**
- [ ] Sistem mendeteksi stok ≤ `min_stock` pada tabel `products`
- [ ] Notifikasi dikirim ke Admin dan Logistik (in-app notification)
- [ ] Opsional: notifikasi via WhatsApp

**Prioritas:** 🟠 Tinggi | **Estimasi:** 3 SP

---

### 🔵 US-015 | Laporan Stok Masuk & Keluar
**Sebagai** Admin / Logistik / Akuntan,  
**Saya ingin** melihat laporan pergerakan stok (masuk & keluar),  
**Sehingga** saya dapat mengaudit persediaan secara akurat.

**Kriteria Penerimaan:**
- [ ] Laporan mencakup: tanggal, produk, jumlah masuk/keluar, saldo akhir
- [ ] Filter berdasarkan periode dan kategori produk
- [ ] Export laporan ke PDF dan Excel

**Prioritas:** 🟡 Sedang | **Estimasi:** 3 SP

---

## Epic 4 — Laporan Keuangan Syariah

> Laporan laba rugi, neraca saldo, hutang-piutang syariah, dan export laporan.

### 🔵 US-016 | Laporan Laba Rugi
**Sebagai** Pemilik Usaha / Akuntan,  
**Saya ingin** melihat laporan laba rugi per periode,  
**Sehingga** saya memahami profitabilitas bisnis.

**Kriteria Penerimaan:**
- [ ] Laporan laba rugi menampilkan: total pendapatan, total HPP, laba kotor, pengeluaran operasional, laba bersih
- [ ] Filter berdasarkan periode (harian, mingguan, bulanan, tahunan)
- [ ] Berbasis prinsip akuntansi syariah
- [ ] Export ke PDF dan Excel

**Prioritas:** 🔴 Sangat Tinggi | **Estimasi:** 5 SP

---

### 🔵 US-017 | Neraca Saldo
**Sebagai** Pemilik Usaha / Akuntan,  
**Saya ingin** melihat neraca saldo bisnis,  
**Sehingga** saya memahami posisi keuangan bisnis secara keseluruhan.

**Kriteria Penerimaan:**
- [ ] Neraca menampilkan: aset, liabilitas, ekuitas
- [ ] Data neraca konsisten dengan laporan laba rugi
- [ ] Export ke PDF dan Excel

**Prioritas:** 🟠 Tinggi | **Estimasi:** 5 SP

---

### 🔵 US-018 | Manajemen Hutang-Piutang Syariah
**Sebagai** Pemilik Usaha / Akuntan,  
**Saya ingin** mencatat dan memantau hutang-piutang bisnis berbasis syariah,  
**Sehingga** tidak ada riba dalam pencatatan keuangan.

**Kriteria Penerimaan:**
- [ ] Form input hutang dan piutang dengan deskripsi, jumlah, pihak terkait, jatuh tempo
- [ ] Daftar hutang-piutang yang aktif dan sudah lunas
- [ ] Tidak ada pencatatan bunga (sesuai prinsip syariah)
- [ ] Notifikasi mendekati jatuh tempo

**Prioritas:** 🟠 Tinggi | **Estimasi:** 5 SP

---

### 🔵 US-019 | Export Laporan Keuangan (PDF & Excel)
**Sebagai** Pemilik Usaha / Akuntan,  
**Saya ingin** mengunduh laporan keuangan dalam format PDF dan Excel,  
**Sehingga** saya dapat berbagi laporan dengan pihak luar (investor, pajak, dll.).

**Kriteria Penerimaan:**
- [ ] Tombol export tersedia di semua halaman laporan
- [ ] PDF diformat rapi dengan logo bisnis dan tanggal generate
- [ ] Excel mencakup semua data mentah untuk analisis lebih lanjut
- [ ] Proses generate dijalankan di backend (layanan generasi laporan)

**Prioritas:** 🟠 Tinggi | **Estimasi:** 5 SP

---

### 🔵 US-020 | Laporan Ringkasan Pengeluaran
**Sebagai** Pemilik Usaha / Akuntan,  
**Saya ingin** melihat ringkasan pengeluaran per kategori,  
**Sehingga** saya memahami alokasi biaya bisnis.

**Kriteria Penerimaan:**
- [ ] Pengeluaran dikelompokkan berdasarkan kategori
- [ ] Grafik pie/bar untuk visualisasi distribusi pengeluaran
- [ ] Filter periode dan kategori
- [ ] Laporan dibuat otomatis setiap bulan

**Prioritas:** 🟡 Sedang | **Estimasi:** 3 SP

---

## Epic 5 — Zakat Mal

> Pengecekan nisab & haul, kalkulasi zakat 2,5%, notifikasi, verifikasi masjid, dan riwayat pembayaran.

### 🔵 US-021 | Pengecekan Nisab & Pemantauan Haul
**Sebagai** Pemilik Usaha,  
**Saya ingin** sistem memeriksa apakah aset bisnis sudah mencapai nisab dan haul,  
**Sehingga** saya tahu kapan kewajiban zakat harus dibayarkan.

**Kriteria Penerimaan:**
- [ ] Sistem mengambil harga emas terkini via API eksternal (Gold Price API)
- [ ] Sistem menghitung nilai nisab (85 gram emas)
- [ ] Sistem memantau haul (1 tahun kepemilikan aset)
- [ ] Status nisab & haul ditampilkan di halaman Zakat
- [ ] API endpoint `GET /zakat` mengembalikan data nisab, haul, dan kewajiban zakat

**Prioritas:** 🟠 Tinggi | **Estimasi:** 5 SP

---

### 🔵 US-022 | Kalkulasi Zakat Mal Otomatis (2,5%)
**Sebagai** Pemilik Usaha / sistem,  
**Saya ingin** sistem menghitung zakat mal secara otomatis sebesar 2,5% dari aset yang memenuhi nisab dan haul,  
**Sehingga** kewajiban zakat dapat dihitung dengan akurat tanpa perhitungan manual.

**Kriteria Penerimaan:**
- [ ] Kalkulasi dilakukan di backend (service layer: `zakat.service`)
- [ ] Hasil kalkulasi ditampilkan di halaman Zakat
- [ ] Persetujuan dua pihak diperlukan sebelum pembayaran diproses (Pemilik Usaha + Akuntan)
- [ ] Pembayaran zakat dicatat dan disimpan dalam sistem

**Prioritas:** 🟠 Tinggi | **Estimasi:** 5 SP

---

### 🔵 US-023 | Notifikasi Kewajiban Zakat
**Sebagai** Pemilik Usaha,  
**Saya ingin** menerima notifikasi saat kewajiban zakat terpenuhi,  
**Sehingga** saya tidak melewatkan pembayaran zakat.

**Kriteria Penerimaan:**
- [ ] Notifikasi in-app muncul saat nisab + haul terpenuhi
- [ ] Opsional: notifikasi via WhatsApp Bot
- [ ] Notifikasi berisi jumlah zakat yang wajib dibayarkan

**Prioritas:** 🟡 Sedang | **Estimasi:** 2 SP

---

### 🔵 US-024 | Verifikasi & Daftar Masjid Penerima Zakat
**Sebagai** Admin sistem,  
**Saya ingin** memverifikasi masjid yang akan menerima zakat melalui platform,  
**Sehingga** penyaluran zakat sesuai dengan syariah.

**Kriteria Penerimaan:**
- [ ] Masjid dapat mendaftar dengan mengisi formulir dan upload dokumen legalitas
- [ ] Tim admin melakukan verifikasi dokumen
- [ ] Masjid terverifikasi mendapat status "terverifikasi" dan masuk daftar penerima zakat
- [ ] Pengguna dapat memilih masjid terverifikasi saat membayar zakat

**Prioritas:** 🟡 Sedang | **Estimasi:** 5 SP

---

### 🔵 US-025 | Riwayat Pembayaran Zakat
**Sebagai** Pemilik Usaha / Akuntan,  
**Saya ingin** melihat riwayat pembayaran zakat yang telah dilakukan,  
**Sehingga** saya memiliki dokumentasi kewajiban zakat yang terpenuhi.

**Kriteria Penerimaan:**
- [ ] Daftar riwayat zakat: tanggal, jumlah, penerima (masjid), status
- [ ] Data disimpan minimal 5 tahun sesuai kebijakan data retention
- [ ] Export riwayat ke PDF / Excel

**Prioritas:** 🟡 Sedang | **Estimasi:** 2 SP

---

## Epic 6 — Manajemen Karyawan & Absensi

> Data karyawan, absensi harian (check-in/check-out), rekap kehadiran, dan jadwal shift.

### 🔵 US-026 | Data Karyawan
**Sebagai** Admin / Pemilik Usaha,  
**Saya ingin** mengelola data karyawan bisnis,  
**Sehingga** informasi karyawan tersimpan dan terstruktur dengan baik.

**Kriteria Penerimaan:**
- [ ] Form tambah/edit karyawan: nama, jabatan, nomor telepon, tanggal bergabung
- [ ] Data tersimpan ke tabel `employees`
- [ ] Karyawan dapat dinonaktifkan (soft delete)
- [ ] Daftar karyawan dapat dicari dan difilter berdasarkan jabatan

**Prioritas:** 🟠 Tinggi | **Estimasi:** 3 SP

---

### 🔵 US-027 | Pencatatan Absensi Harian (Check-in/Check-out)
**Sebagai** Karyawan / Admin,  
**Saya ingin** mencatat kehadiran harian dengan check-in dan check-out,  
**Sehingga** absensi terdokumentasi secara digital dan akurat.

**Kriteria Penerimaan:**
- [ ] Tombol check-in dan check-out di aplikasi mobile
- [ ] Timestamp check-in/check-out tersimpan ke tabel `attendance`
- [ ] Status kehadiran: hadir, izin, sakit, alpa
- [ ] Admin dapat memodifikasi data absensi jika diperlukan

**Prioritas:** 🟠 Tinggi | **Estimasi:** 5 SP

---

### 🔵 US-028 | Rekap Kehadiran Bulanan
**Sebagai** Admin / Pemilik Usaha,  
**Saya ingin** melihat rekap kehadiran karyawan per bulan,  
**Sehingga** saya dapat mengevaluasi kedisiplinan karyawan.

**Kriteria Penerimaan:**
- [ ] Rekap menampilkan: total hadir, izin, sakit, alpa per karyawan per bulan
- [ ] Grafik visualisasi kehadiran (opsional)
- [ ] Export rekap ke PDF / Excel

**Prioritas:** 🟡 Sedang | **Estimasi:** 3 SP

---

### 🔵 US-029 | Pengaturan Jadwal Shift Karyawan
**Sebagai** Admin / Pemilik Usaha,  
**Saya ingin** mengatur jadwal shift karyawan,  
**Sehingga** operasional bisnis berjalan terstruktur.

**Kriteria Penerimaan:**
- [ ] Form buat/edit shift: nama shift, jam mulai, jam selesai
- [ ] Assign karyawan ke shift tertentu per hari/minggu
- [ ] Jadwal shift tampil di halaman manajemen karyawan

**Prioritas:** 🟢 Rendah | **Estimasi:** 5 SP

---

## Epic 7 — Budgeting

> Penetapan anggaran per kategori, pemantauan realisasi, dan notifikasi over-budget.

### 🔵 US-030 | Penetapan Anggaran Per Kategori
**Sebagai** Pemilik Usaha / Admin,  
**Saya ingin** menetapkan batas anggaran pengeluaran per kategori per periode,  
**Sehingga** pengeluaran bisnis lebih terkontrol.

**Kriteria Penerimaan:**
- [ ] Form buat anggaran: kategori, jumlah batas, periode (bulan)
- [ ] Data anggaran tersimpan ke tabel `budget`
- [ ] Kategori pengeluaran dapat dikustomisasi sesuai bisnis

**Prioritas:** 🟠 Tinggi | **Estimasi:** 3 SP

---

### 🔵 US-031 | Pemantauan Realisasi vs Rencana Anggaran
**Sebagai** Pemilik Usaha / Admin,  
**Saya ingin** memantau realisasi pengeluaran dibanding anggaran yang telah ditetapkan,  
**Sehingga** saya bisa mengidentifikasi kategori yang boros.

**Kriteria Penerimaan:**
- [ ] Halaman budgeting menampilkan: anggaran, realisasi, sisa anggaran per kategori
- [ ] Progress bar visual untuk setiap kategori
- [ ] Data diperbarui otomatis setiap ada transaksi pengeluaran baru

**Prioritas:** 🟠 Tinggi | **Estimasi:** 3 SP

---

### 🔵 US-032 | Notifikasi Over-Budget
**Sebagai** Pemilik Usaha / Admin,  
**Saya ingin** mendapat notifikasi saat pengeluaran melebihi anggaran yang ditetapkan,  
**Sehingga** saya dapat segera mengambil tindakan.

**Kriteria Penerimaan:**
- [ ] Notifikasi in-app dikirim saat realisasi ≥ 80% dari batas anggaran (peringatan awal)
- [ ] Notifikasi in-app dikirim saat realisasi melebihi 100% batas anggaran
- [ ] Opsional: notifikasi via WhatsApp

**Prioritas:** 🟡 Sedang | **Estimasi:** 2 SP

---

## Epic 8 — Dashboard & Analytics

> KPI real-time, grafik tren penjualan, produk terlaris, analisis margin, dan indikator kesehatan bisnis.

### 🔵 US-033 | Dashboard KPI Bisnis Real-time
**Sebagai** Pemilik Usaha / Admin,  
**Saya ingin** melihat KPI bisnis utama di dashboard,  
**Sehingga** saya dapat memantau kesehatan bisnis secara sekilas.

**Kriteria Penerimaan:**
- [ ] KPI yang ditampilkan: total penjualan hari ini, total penjualan bulan ini, jumlah transaksi, keuntungan bersih
- [ ] Data KPI diperbarui secara real-time
- [ ] API endpoint `GET /dashboard` mengembalikan data KPI

**Prioritas:** 🟠 Tinggi | **Estimasi:** 5 SP

---

### 🔵 US-034 | Grafik Tren Penjualan
**Sebagai** Pemilik Usaha / Admin,  
**Saya ingin** melihat grafik tren penjualan per periode,  
**Sehingga** saya dapat mengidentifikasi pola penjualan bisnis.

**Kriteria Penerimaan:**
- [ ] Grafik garis / batang menampilkan tren penjualan: harian, mingguan, bulanan
- [ ] Periode dapat diubah oleh pengguna
- [ ] Interaktif: hover menampilkan detail nilai

**Prioritas:** 🟠 Tinggi | **Estimasi:** 5 SP

---

### 🔵 US-035 | Produk Terlaris & Analisis Margin Keuntungan
**Sebagai** Pemilik Usaha / Admin,  
**Saya ingin** mengetahui produk terlaris dan margin keuntungan per produk,  
**Sehingga** saya dapat mengoptimalkan portofolio produk.

**Kriteria Penerimaan:**
- [ ] Daftar top 5/10 produk terlaris berdasarkan periode
- [ ] Margin keuntungan (%) per produk dihitung dari (harga jual - HPP) / harga jual
- [ ] Visualisasi dengan grafik pie atau bar

**Prioritas:** 🟡 Sedang | **Estimasi:** 3 SP

---

### 🔵 US-036 | Indikator Kesehatan Bisnis
**Sebagai** Pemilik Usaha,  
**Saya ingin** melihat indikator kesehatan bisnis secara keseluruhan,  
**Sehingga** saya dapat mengambil keputusan strategis.

**Kriteria Penerimaan:**
- [ ] Indikator: skor kesehatan keuangan, status zakat, status budget, stok kritis
- [ ] Notifikasi / peringatan menonjol jika ada indikator dalam kondisi buruk

**Prioritas:** 🟡 Sedang | **Estimasi:** 5 SP

---

## Epic 9 — Integrasi AI & OCR

> AI Prompt Registry, integrasi OCR untuk struk/dokumen, dan integration contracts.

### 🔵 US-037 | OCR — Upload & Ekstraksi Struk Transaksi
**Sebagai** Pengguna,  
**Saya ingin** mengunggah foto struk atau dokumen dan sistem mengekstrak data teksnya secara otomatis,  
**Sehingga** pencatatan transaksi lebih cepat dan mengurangi kesalahan input manual.

**Kriteria Penerimaan:**
- [ ] Form upload gambar (struk / dokumen)
- [ ] Sistem memanggil API OCR eksternal untuk mengekstrak teks
- [ ] Data teks hasil OCR diisi ke form transaksi / laporan secara otomatis
- [ ] Pengguna dapat mengoreksi hasil OCR sebelum konfirmasi
- [ ] API endpoint tersedia untuk integrasi OCR

**Prioritas:** 🟡 Sedang | **Estimasi:** 8 SP

---

### 🔵 US-038 | AI Prompt Registry
**Sebagai** sistem / developer,  
**Saya ingin** memiliki registry prompt AI yang terstandarisasi,  
**Sehingga** fitur berbasis AI di platform konsisten dan mudah dikelola.

**Kriteria Penerimaan:**
- [ ] Sistem registry prompt untuk: laporan keuangan, kalkulasi zakat, ringkasan transaksi
- [ ] Prompt dapat diperbarui tanpa perubahan kode besar
- [ ] Setiap prompt memiliki label dan kategori

**Prioritas:** 🟢 Rendah | **Estimasi:** 5 SP

---

### 🔵 US-039 | Integration Contracts (API Specification)
**Sebagai** developer / tim integrasi,  
**Saya ingin** semua integrasi eksternal didefinisikan dalam integration contracts,  
**Sehingga** komunikasi antar sistem terstandar dan dapat diaudit.

**Kriteria Penerimaan:**
- [ ] Kontrak integrasi tersedia untuk: API Laporan Keuangan, API OCR, WhatsApp API, Gold Price API
- [ ] Setiap kontrak mencakup: endpoint, format data (JSON), autentikasi, error handling
- [ ] Kontrak terdokumentasi dan diakses oleh tim developer

**Prioritas:** 🟡 Sedang | **Estimasi:** 5 SP

---

## Epic 10 — WhatsApp Bot

> Chatbot WhatsApp untuk laporan keuangan, pengecekan transaksi, dan kalkulasi zakat.

### 🔵 US-040 | WhatsApp Bot — Laporan Keuangan via Chat
**Sebagai** Pemilik Usaha,  
**Saya ingin** meminta laporan keuangan ringkas melalui WhatsApp,  
**Sehingga** saya dapat memantau keuangan bisnis dari mana saja tanpa membuka aplikasi.

**Kriteria Penerimaan:**
- [ ] Bot menerima pesan permintaan laporan dan merespons dengan ringkasan
- [ ] Bot memverifikasi identitas pengguna sebelum memberikan data
- [ ] Respons bot mencakup: total penjualan, laba bersih, pengeluaran bulan ini
- [ ] Jika perlu tindakan lebih lanjut, bot mengarahkan ke aplikasi

**Prioritas:** 🟡 Sedang | **Estimasi:** 8 SP

---

### 🔵 US-041 | WhatsApp Bot — Kalkulasi Zakat
**Sebagai** Pemilik Usaha,  
**Saya ingin** meminta kalkulasi zakat melalui WhatsApp,  
**Sehingga** saya mengetahui kewajiban zakat secara cepat.

**Kriteria Penerimaan:**
- [ ] Bot merespons permintaan kalkulasi zakat dengan data nisab dan jumlah yang wajib dibayarkan
- [ ] Bot memberikan opsi untuk melanjutkan proses persetujuan zakat di aplikasi

**Prioritas:** 🟡 Sedang | **Estimasi:** 3 SP

---

### 🔵 US-042 | WhatsApp Bot — Status Transaksi
**Sebagai** Pengguna,  
**Saya ingin** mengecek status transaksi terbaru melalui WhatsApp,  
**Sehingga** saya mendapat informasi real-time tanpa harus login ke aplikasi.

**Kriteria Penerimaan:**
- [ ] Bot merespons dengan daftar transaksi terbaru (5 terakhir)
- [ ] Status transaksi: sukses, pending (menunggu persetujuan), void
- [ ] Konfirmasi pembayaran dapat dilakukan melalui bot (opsional)

**Prioritas:** 🟢 Rendah | **Estimasi:** 5 SP

---

## Epic 11 — Keamanan & Kepatuhan (Compliance)

> KYC/AML, audit trail, Four Eyes Rule, kebijakan privasi, data retention, dan keamanan infrastruktur.

### 🔵 US-043 | Audit Trail (Log Aktivitas)
**Sebagai** Admin / sistem,  
**Saya ingin** setiap tindakan penting tercatat dalam audit trail,  
**Sehingga** sistem dapat diaudit dan integritas data terjaga.

**Kriteria Penerimaan:**
- [ ] Setiap tindakan dicatat: ID pengguna, jenis tindakan, waktu, deskripsi, IP address
- [ ] Audit log tersimpan di database
- [ ] Audit log hanya dapat dilihat oleh Admin
- [ ] Audit log tidak dapat diubah atau dihapus oleh pengguna

**Prioritas:** 🟠 Tinggi | **Estimasi:** 5 SP

---

### 🔵 US-044 | Enkripsi Data & Keamanan Aplikasi
**Sebagai** sistem,  
**Saya ingin** semua data sensitif dienkripsi dan komunikasi dilindungi,  
**Sehingga** data pengguna aman dari akses tidak sah.

**Kriteria Penerimaan:**
- [ ] Semua data sensitif dienkripsi menggunakan standar industri
- [ ] Semua komunikasi menggunakan HTTPS
- [ ] Dependensi diperbarui secara berkala dengan patch keamanan terbaru
- [ ] Firewall dikonfigurasi untuk membatasi akses server

**Prioritas:** 🔴 Sangat Tinggi | **Estimasi:** 5 SP

---

### 🔵 US-045 | Kebijakan Data Retention
**Sebagai** sistem / legal,  
**Saya ingin** data pengguna dan transaksi disimpan sesuai kebijakan retensi yang berlaku,  
**Sehingga** platform patuh terhadap regulasi.

**Kriteria Penerimaan:**
- [ ] Data transaksi & laporan keuangan disimpan minimal 5 tahun
- [ ] Data zakat disimpan minimal 5 tahun
- [ ] Data pribadi pengguna disimpan selama akun aktif
- [ ] Mekanisme penghapusan data otomatis setelah periode retensi berakhir
- [ ] Mekanisme hapus akun manual oleh pengguna

**Prioritas:** 🟡 Sedang | **Estimasi:** 3 SP

---

### 🔵 US-046 | Kebijakan Privasi & Persetujuan Pengguna
**Sebagai** pengguna,  
**Saya ingin** mengetahui bagaimana data saya digunakan dan memberikan persetujuan,  
**Sehingga** saya memiliki kontrol atas data pribadi saya.

**Kriteria Penerimaan:**
- [ ] Halaman kebijakan privasi tersedia dan dapat diakses
- [ ] Pengguna harus menyetujui kebijakan privasi saat registrasi
- [ ] Data tidak dibagikan ke pihak ketiga tanpa izin pengguna (kecuali diwajibkan hukum)

**Prioritas:** 🟡 Sedang | **Estimasi:** 2 SP

---

## Epic 12 — Infrastruktur & DevOps

> CI/CD, monitoring, backup, incident response, dan standar pengembangan.

### 🔵 US-047 | Pipeline CI/CD (GitHub Actions)
**Sebagai** developer,  
**Saya ingin** pipeline CI/CD yang otomatis menjalankan test dan deploy ke staging/production,  
**Sehingga** proses rilis lebih cepat, aman, dan konsisten.

**Kriteria Penerimaan:**
- [ ] GitHub Actions dikonfigurasi untuk: lint, unit test, integration test pada setiap PR
- [ ] Deploy otomatis ke staging setelah merge ke `develop`
- [ ] Deploy ke production membutuhkan approval manual
- [ ] Test coverage minimal 80% wajib dipenuhi sebelum merge

**Prioritas:** 🟠 Tinggi | **Estimasi:** 5 SP

---

### 🔵 US-048 | Monitoring & Alerting (Prometheus + Grafana)
**Sebagai** tim DevOps,  
**Saya ingin** sistem monitoring real-time untuk aplikasi dan infrastruktur,  
**Sehingga** kami dapat mendeteksi dan merespons gangguan dengan cepat.

**Kriteria Penerimaan:**
- [ ] Prometheus dan Grafana dikonfigurasi untuk memantau: uptime, CPU, memori, response time API
- [ ] Target uptime minimal 99,5%
- [ ] Alert via Slack atau email jika threshold terlampaui
- [ ] Dashboard Grafana menampilkan metrik utama secara visual

**Prioritas:** 🟠 Tinggi | **Estimasi:** 5 SP

---

### 🔵 US-049 | Strategi Backup & Recovery
**Sebagai** tim DevOps,  
**Saya ingin** sistem backup dan recovery yang andal,  
**Sehingga** data dapat dipulihkan jika terjadi bencana atau kegagalan sistem.

**Kriteria Penerimaan:**
- [ ] Backup incremental harian dan backup full mingguan
- [ ] Backup disimpan terenkripsi di cloud storage
- [ ] Prosedur pemulihan diuji secara berkala
- [ ] Rollback plan tersedia untuk setiap rilis ke production

**Prioritas:** 🟠 Tinggi | **Estimasi:** 3 SP

---

### 🔵 US-050 | Incident Response Plan
**Sebagai** tim keamanan / DevOps,  
**Saya ingin** prosedur tanggap insiden yang terdokumentasi,  
**Sehingga** tim dapat merespons insiden keamanan dengan terstruktur dan cepat.

**Kriteria Penerimaan:**
- [ ] Dokumen runbook tersedia untuk: isolasi sistem, pemulihan data, pengujian pasca-pemulihan
- [ ] Kontak darurat terdokumentasi: security@umkmoos.com, devops@umkmoos.com
- [ ] Setiap insiden dicatat dan dievaluasi pasca-penanganan

**Prioritas:** 🟡 Sedang | **Estimasi:** 3 SP

---

## Prioritas & Estimasi

### Ringkasan Story Points per Epic

| Epic | Judul | Total SP | Prioritas |
|------|-------|----------|-----------|
| Epic 1 | Manajemen Akun & Autentikasi | 20 SP | 🔴 Sangat Tinggi |
| Epic 2 | POS (Point of Sale) / Kasir | 22 SP | 🔴 Sangat Tinggi |
| Epic 3 | Manajemen Stok | 19 SP | 🔴 Sangat Tinggi |
| Epic 4 | Laporan Keuangan Syariah | 21 SP | 🔴 Sangat Tinggi |
| Epic 5 | Zakat Mal | 19 SP | 🟠 Tinggi |
| Epic 6 | Manajemen Karyawan & Absensi | 16 SP | 🟠 Tinggi |
| Epic 7 | Budgeting | 8 SP | 🟠 Tinggi |
| Epic 8 | Dashboard & Analytics | 18 SP | 🟠 Tinggi |
| Epic 9 | Integrasi AI & OCR | 18 SP | 🟡 Sedang |
| Epic 10 | WhatsApp Bot | 16 SP | 🟡 Sedang |
| Epic 11 | Keamanan & Kepatuhan | 15 SP | 🟠 Tinggi |
| Epic 12 | Infrastruktur & DevOps | 16 SP | 🟠 Tinggi |
| **Total** | | **208 SP** | |

---

### Legenda Prioritas

| Simbol | Prioritas | Deskripsi |
|--------|-----------|-----------|
| 🔴 | Sangat Tinggi | Wajib ada di MVP (Minimum Viable Product) |
| 🟠 | Tinggi | Penting, dijadwalkan setelah MVP |
| 🟡 | Sedang | Valuable, dapat dijadwalkan di iterasi berikutnya |
| 🟢 | Rendah | Nice to have, dapat dikerjakan jika ada kapasitas |

### Legenda Estimasi (Story Points)

| SP | Kompleksitas |
|----|-------------|
| 1–2 | Sangat Sederhana (konfigurasi, UI minor) |
| 3 | Sederhana (CRUD standar, komponen tunggal) |
| 5 | Menengah (integrasi multi-komponen) |
| 8 | Kompleks (integrasi eksternal, logika bisnis kompleks) |
| 13+ | Sangat Kompleks (perlu dipecah menjadi sub-task) |

---

> 📌 **Catatan**: Backlog ini disusun berdasarkan dokumen [README.md](./README.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [BUSINESS_RULES.md](./BUSINESS_RULES.md), [COMPLIANCE.md](./COMPLIANCE.md), [SECURITY.md](./SECURITY.md), [AI_SPEC.md](./AI_SPEC.md), [UI_GUIDE.md](./UI_GUIDE.md), dan [DEV_GUIDE.md](./DEV_GUIDE.md).  
> Backlog ini bersifat **living document** dan akan diperbarui secara berkala seiring perkembangan proyek.
