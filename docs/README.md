<div align="center">

# 🛒 UMKMoo's

**Platform Manajemen Bisnis All-in-One untuk UMKM Indonesia**

_Kelola transaksi, stok, keuangan, karyawan, dan zakat — dalam satu aplikasi berbasis syariah._

[![Status](https://img.shields.io/badge/Status-In%20Development-yellow)](.)
[![Version](https://img.shields.io/badge/Versi-1.0.0-blue)](.)
[![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20Mobile-green)](.)
[![License](https://img.shields.io/badge/Lisensi-MIT-lightgrey)](.)

</div>

---

## 📋 Daftar Isi

- [Tentang Proyek](#-tentang-proyek)
- [Fitur Unggulan](#-fitur-unggulan)
- [Tech Stack](#-tech-stack)
- [Arsitektur Sistem](#-arsitektur-sistem)
- [Memulai](#-memulai)
  - [Prasyarat](#prasyarat)
  - [Instalasi](#instalasi)
  - [Konfigurasi Environment](#konfigurasi-environment)
  - [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Struktur Proyek](#-struktur-proyek)
- [Modul Aplikasi](#-modul-aplikasi)
- [Skema Database](#-skema-database)
- [Panduan Penggunaan](#-panduan-penggunaan)
- [Peran Pengguna](#-peran-pengguna)
- [Kontribusi](#-kontribusi)
- [Lisensi](#-lisensi)

---

## 🌟 Tentang Proyek

**UMKMoo's** adalah platform berbasis **web dan mobile** yang dirancang khusus untuk membantu Usaha Mikro, Kecil, dan Menengah (UMKM) Indonesia dalam mengelola operasional bisnis secara terintegrasi dan efisien.

### Masalah yang Dipecahkan

Mayoritas UMKM di Indonesia masih mengelola bisnis secara manual. UMKMoo's hadir untuk mengatasi:

| Masalah | Solusi UMKMoo's |
|---|---|
| 📦 Stok tidak terpantau dengan akurat | Manajemen stok real-time terintegrasi dengan POS |
| 💸 Pengeluaran tidak terkendali | Modul budgeting dengan notifikasi over-budget |
| 🕌 Kebutuhan prinsip syariah | Akuntansi syariah + kalkulasi Zakat Mal otomatis |
| 📊 Laporan keuangan manual & rawan salah | Laporan otomatis: laba rugi, neraca, HPP |

---

## ✨ Fitur Unggulan

- 🖥️ **Dashboard Analitik** — Visualisasi KPI, tren penjualan, dan kesehatan bisnis secara real-time
- 💳 **POS (Point of Sale)** — Kasir cepat dengan auto-potong stok dan berbagai metode pembayaran (Cash, QRIS, e-wallet, transfer)
- 📦 **Manajemen Stok** — Pantau persediaan, hitung HPP otomatis, dan dapatkan notifikasi stok menipis
- 💰 **Laporan Keuangan Syariah** — Laba rugi, neraca saldo, dan manajemen hutang-piutang berbasis akuntansi syariah
- 🕌 **Zakat Mal Otomatis** — Pengecekan nisab & haul, kalkulasi 2,5%, dan notifikasi kewajiban zakat
- 👥 **Manajemen Karyawan** — Data karyawan, absensi harian, dan rekap kehadiran bulanan
- 📊 **Budgeting** — Tetapkan batas anggaran per kategori dan pantau realisasi pengeluaran
- 📄 **Export Laporan** — Unduh laporan ke format PDF dan Excel kapan saja

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| **Frontend Mobile** | React Native |
| **Frontend Web** | Next.js |
| **Backend / API** | Node.js / Go |
| **Database** | Supabase (PostgreSQL) |
| **Auth & Security** | Supabase Auth (JWT + RBAC) |
| **Cloud Storage** | Supabase Storage |

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────┐
│                   PENGGUNA                       │
└───────────────────┬─────────────────────────────┘
                    │
        ┌───────────┴────────────┐
        │                        │
┌───────▼────────┐     ┌─────────▼────────┐
│  Mobile App    │     │    Web App       │
│ (React Native) │     │   (Next.js)      │
│                │     │                  │
│ • POS / Kasir  │     │ • Dashboard      │
│ • Stok         │     │ • Laporan        │
│ • Absensi      │     │ • Pengaturan     │
└───────┬────────┘     └─────────┬────────┘
        └───────────┬────────────┘
                    │
        ┌───────────▼────────────┐
        │   Backend API          │
        │   (Node.js / Go)       │
        │                        │
        │ • Logika HPP & Margin  │
        │ • Kalkulasi Nisab Zakat│
        │ • Generasi Laporan     │
        │ • Pemrosesan Transaksi │
        └───────────┬────────────┘
                    │
        ┌───────────▼────────────┐
        │   Supabase             │
        │                        │
        │ • PostgreSQL (DB)      │
        │ • Auth & Session       │
        │ • Cloud Storage        │
        └────────────────────────┘
```

---

## 🚀 Memulai

### Prasyarat

Pastikan sudah terinstal di mesin Anda:

- [Node.js](https://nodejs.org/) v18+
- [npm](https://www.npmjs.com/) atau [yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)
- Akun [Supabase](https://supabase.com/) (gratis)

### Instalasi

1. **Clone repositori**

```bash
git clone https://github.com/username/umkmoos.git
cd umkmoos
```

2. **Install dependensi — Web (Next.js)**

```bash
cd apps/web
npm install
```

3. **Install dependensi — Mobile (React Native)**

```bash
cd apps/mobile
npm install
```

4. **Install dependensi — Backend**

```bash
cd apps/backend
npm install
```

### Konfigurasi Environment

1. Salin file environment contoh:

```bash
cp .env.example .env.local
```

2. Isi variabel berikut di `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# API Backend
BACKEND_API_URL=http://localhost:4000

# Harga Emas (untuk kalkulasi Nisab Zakat)
GOLD_PRICE_API_KEY=your-api-key
GOLD_PRICE_API_URL=https://api.hargaemas.example.com

# WhatsApp (Opsional)
WHATSAPP_API_KEY=your-wa-api-key
```

### Menjalankan Aplikasi

**Development — Web**

```bash
cd apps/web
npm run dev
# Buka http://localhost:3000
```

**Development — Backend**

```bash
cd apps/backend
npm run dev
# API berjalan di http://localhost:4000
```

**Development — Mobile**

```bash
cd apps/mobile
npx expo start
# Scan QR Code dengan aplikasi Expo Go
```

**Migrasi Database**

```bash
npx supabase db push
```

---

## 📁 Struktur Proyek

```
umkmoos/
├── apps/
│   ├── web/                    # Frontend Next.js
│   │   ├── src/
│   │   │   ├── app/            # App Router (halaman-halaman)
│   │   │   ├── components/     # Komponen UI yang dapat digunakan ulang
│   │   │   ├── lib/            # Utilitas dan konfigurasi
│   │   │   └── hooks/          # Custom React hooks
│   │   └── package.json
│   │
│   ├── mobile/                 # Frontend React Native
│   │   ├── src/
│   │   │   ├── screens/        # Layar-layar aplikasi
│   │   │   ├── components/     # Komponen UI mobile
│   │   │   └── navigation/     # Konfigurasi navigasi
│   │   └── package.json
│   │
│   └── backend/                # API Backend (Node.js / Go)
│       ├── src/
│       │   ├── routes/         # Definisi endpoint API
│       │   ├── controllers/    # Logika handler
│       │   ├── services/       # Logika bisnis (HPP, Zakat, dll.)
│       │   └── middleware/     # Auth, validasi, logging
│       └── package.json
│
├── packages/
│   └── shared/                 # Tipe TypeScript dan utilitas bersama
│
├── supabase/
│   ├── migrations/             # Migrasi database
│   └── seed.sql                # Data awal
│
├── docs/
│   └── PRD_UMKMoos.md          # Product Requirements Document
│
├── .env.example
└── README.md
```

---

## 📦 Modul Aplikasi

### 1. 🔐 Manajemen Akun
Registrasi bisnis, login, manajemen peran pengguna (Admin, Kasir, Akuntan, Logistik), dan pengaturan metode pembayaran.

### 2. 🛒 POS — Kasir
Proses transaksi penjualan dengan pembaruan stok otomatis. Mendukung Cash, QRIS, e-wallet, dan transfer bank. Dilengkapi struk digital dan fitur void transaksi.

### 3. 📦 Manajemen Stok
Input dan pemantauan stok real-time, perhitungan HPP otomatis, notifikasi stok menipis, dan laporan stok masuk/keluar.

### 4. 👥 Manajemen Karyawan
Profil karyawan, pencatatan absensi harian (check-in/check-out), rekap kehadiran bulanan, dan pengaturan jadwal shift.

### 5. 📊 Laporan Keuangan
Laporan laba rugi, neraca saldo, manajemen hutang-piutang syariah, serta export ke PDF dan Excel — semua berbasis akuntansi syariah.

### 6. 🕌 Zakat Mal
Pengecekan nisab otomatis, pemantauan haul, kalkulasi zakat 2,5%, notifikasi kewajiban, dan riwayat pembayaran zakat.

### 7. 💰 Budgeting
Penetapan anggaran per kategori pengeluaran, pemantauan realisasi vs. rencana, dan notifikasi over-budget.

### 8. 📈 Dashboard & Analytics
KPI bisnis real-time, grafik tren penjualan, produk terlaris, analisis margin keuntungan, dan indikator kesehatan bisnis.

---

## 🗄️ Skema Database

Berikut entitas utama dalam database:

```
users           → Identitas pengguna dan peran
businesses      → Profil dan identitas bisnis
transactions    → Catatan transaksi penjualan & pengeluaran
products        → Data produk dan stok
budget          → Alokasi anggaran per periode
employees       → Data karyawan
attendance      → Catatan absensi karyawan
evidence_docs   → Bukti transaksi (foto struk)
```

> Lihat skema lengkap di [`supabase/migrations/`](./supabase/migrations/) atau di [PRD — Bagian 9](./docs/PRD_UMKMoos.md#9-skema-database).

---

## 📖 Panduan Penggunaan

### Setup Awal (Onboarding)

```
1. Daftar akun bisnis baru
2. Lengkapi profil bisnis (nama, alamat, logo)
3. Pilih sistem akuntansi: Syariah / Konvensional
4. Buat kategori pengeluaran sesuai bisnis Anda
5. Tambahkan produk dan stok awal
6. Undang karyawan dan atur peran masing-masing
7. Tetapkan anggaran bulanan per kategori
8. ✅ Siap digunakan!
```

### Alur Transaksi Kasir

```
Login → Buka Menu Kasir → Pilih Produk / Scan Barcode
→ Konfirmasi Keranjang → Pilih Metode Pembayaran
→ Proses → Stok Terpotong Otomatis → Struk Digital Tergenerate
```

### Akses Laporan Keuangan

```
Login → Menu Laporan → Pilih Periode → Pilih Jenis Laporan
→ Pratinjau → Export ke PDF / Excel
```

---

## 👤 Peran Pengguna

| Peran | Akses |
|---|---|
| **Admin** | Semua fitur — manajemen akun, pengaturan sistem |
| **Pemilik Usaha** | Dashboard, laporan, zakat, budgeting, stok |
| **Kasir / Staff** | POS, riwayat transaksi harian |
| **Akuntan** | Laporan keuangan, riwayat transaksi, export |
| **Logistik** | Manajemen stok, laporan persediaan |

---

## 🤝 Kontribusi

Kontribusi sangat disambut! Ikuti langkah berikut:

1. **Fork** repositori ini
2. Buat branch fitur baru: `git checkout -b fitur/nama-fitur`
3. Commit perubahan: `git commit -m 'feat: tambahkan fitur X'`
4. Push ke branch: `git push origin fitur/nama-fitur`
5. Buka **Pull Request**

Pastikan mengikuti [panduan kontribusi](./CONTRIBUTING.md) dan konvensi commit yang berlaku.

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](./LICENSE).

---

<div align="center">

Dibuat dengan ❤️ oleh **Dwinia Asa Bhagia**

_UMKMoo's — Memajukan UMKM Indonesia, Satu Transaksi Pada Satu Waktu_

</div>
