
# UMKMoo's - Business Rules Documentation

Dokumentasi ini menjelaskan aturan bisnis yang diterapkan dalam platform UMKMoo's. Ini mencakup workflow persetujuan, pengelolaan peran dan hak akses, batasan transaksi, alur program, serta alur verifikasi masjid untuk memastikan proses operasional yang efisien dan terstruktur.

---

## Table of Contents

1. [Approval Workflow](#approval-workflow)
2. [Role & Hak Akses](#role-hak-akses)
3. [Threshold Transaksi](#threshold-transaksi)
4. [Alur Program](#alur-program)
5. [Alur Verifikasi Masjid](#alur-verifikasi-masjid)

---

## Approval Workflow

### 1. **Proses Persetujuan Transaksi Besar**
   - Setiap transaksi yang melebihi batas yang telah ditentukan harus mendapatkan persetujuan dari dua pihak yang berbeda, sesuai dengan aturan **Four Eyes Rule**.
   - **Contoh Proses**:
     1. Pengguna (misalnya, kasir) melakukan transaksi penjualan atau pembelian dengan nilai besar.
     2. Transaksi tersebut akan diajukan untuk persetujuan kepada **Manajer Keuangan**.
     3. Setelah disetujui oleh Manajer Keuangan, transaksi dapat diproses lebih lanjut dan diselesaikan.

### 2. **Persetujuan Pembayaran Zakat**
   - Pembayaran Zakat Mal harus mendapat persetujuan dari dua pihak yang berbeda (misalnya, Pemilik Usaha dan Akuntan) sebelum diproses.
   - **Langkah-langkah**:
     1. Bot WhatsApp menghitung zakat berdasarkan data yang terintegrasi.
     2. Pengguna atau pemilik usaha memverifikasi jumlah zakat yang dihitung.
     3. Persetujuan diberikan oleh dua pihak yang terlibat (Pemilik Usaha dan Akuntan).

---

## Role & Hak Akses

### 1. **Peran Pengguna dalam UMKMoo's**
   - **Pemilik Usaha**: Memiliki hak akses penuh ke semua fitur sistem, termasuk laporan keuangan, manajemen stok, manajemen karyawan, dan verifikasi zakat.
   - **Kasir**: Dapat mengakses dan mengelola transaksi penjualan, termasuk pemrosesan pembayaran dan pengelolaan stok melalui POS (Point of Sale).
   - **Akuntan**: Dapat mengakses dan menghasilkan laporan keuangan (laba rugi, neraca saldo) serta memverifikasi pembayaran zakat.
   - **Admin Sistem**: Dapat mengelola akun pengguna, mengatur hak akses, dan melakukan pengaturan sistem.

### 2. **Hak Akses**
   - Setiap peran memiliki hak akses berbeda sesuai dengan fungsinya.
   - **Pemilik Usaha** dan **Akuntan** memiliki hak akses untuk melihat dan menyetujui laporan keuangan dan zakat.
   - **Kasir** hanya memiliki akses untuk melakukan transaksi dan memperbarui stok, tanpa akses ke laporan keuangan.
   - **Admin Sistem** memiliki hak akses penuh untuk konfigurasi sistem, namun tidak dapat mengakses data keuangan.

---

## Threshold Transaksi

### 1. **Definisi Threshold Transaksi**
   - **Batas Transaksi Kecil**: Semua transaksi di bawah batas Rp 1.000.000 tidak memerlukan persetujuan lebih lanjut.
   - **Batas Transaksi Menengah**: Transaksi antara Rp 1.000.000 hingga Rp 5.000.000 memerlukan persetujuan dari **Manajer Keuangan**.
   - **Batas Transaksi Besar**: Semua transaksi di atas Rp 5.000.000 memerlukan persetujuan dari dua pihak: **Pemilik Usaha** dan **Akuntan**.

### 2. **Proses Transaksi Besar**
   - Untuk transaksi besar, sistem akan mengirimkan notifikasi otomatis ke pihak yang berwenang untuk mendapatkan persetujuan.
   - Transaksi akan ditunda hingga persetujuan diterima.

---

## Alur Program

### 1. **Program Manajemen Zakat**
   - UMKMoo's menyediakan sistem perhitungan Zakat Mal yang otomatis, namun setiap perhitungan zakat memerlukan persetujuan dari dua pihak: **Pemilik Usaha** dan **Akuntan**.
   - **Langkah-langkah**:
     1. Sistem menghitung zakat berdasarkan nilai nisab dan haul.
     2. Pengguna menerima perhitungan dan memverifikasi jumlah zakat.
     3. Persetujuan dilakukan oleh Pemilik Usaha dan Akuntan.
     4. Setelah disetujui, zakat dapat dibayarkan dan laporan terkait dihasilkan.

### 2. **Program Laporan Keuangan**
   - Laporan keuangan akan dibuat secara otomatis setiap bulan dan dapat diakses oleh Pemilik Usaha dan Akuntan untuk verifikasi dan analisis lebih lanjut.
   - Laporan yang dihasilkan mencakup **Laporan Laba Rugi**, **Neraca Saldo**, dan **Ringkasan Pengeluaran**.

---

## Alur Verifikasi Masjid

### 1. **Definisi Alur Verifikasi Masjid**
   - **Masjid** yang menerima Zakat Mal melalui platform harus terdaftar dan terverifikasi secara sah untuk memastikan bahwa zakat yang disalurkan sesuai dengan syariah.
   - Proses verifikasi ini mencakup:
     1. **Pendaftaran Masjid**: Masjid harus mengisi formulir pendaftaran dan mengunggah dokumen legalitas (misalnya, surat izin masjid).
     2. **Verifikasi Legalitas**: Tim verifikasi memeriksa dokumen yang diajukan oleh masjid.
     3. **Status Terverifikasi**: Setelah diverifikasi, masjid akan mendapatkan status **terverifikasi** yang memungkinkan mereka untuk menerima Zakat Mal dari platform.

### 2. **Proses Verifikasi**
   - Setiap masjid yang baru mendaftar akan menjalani proses verifikasi untuk memastikan bahwa mereka memenuhi kriteria syariah untuk menerima zakat.
   - Masjid yang telah terverifikasi akan tercantum dalam daftar penerima zakat yang sah.

---

Dokumen ini memberikan panduan tentang aturan bisnis yang diterapkan pada platform UMKMoo's untuk memastikan operasional yang efisien dan sesuai dengan prinsip-prinsip bisnis yang telah ditentukan. Setiap pengembang dan pemilik usaha harus mematuhi aturan ini agar sistem berfungsi dengan baik dan sesuai regulasi.
