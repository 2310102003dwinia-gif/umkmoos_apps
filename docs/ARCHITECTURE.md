
# UMKMoo's - Architecture Documentation

Dokumentasi ini menjelaskan arsitektur sistem, skema database, alur data, dan spesifikasi API untuk platform UMKMoo's yang berbasis web dan mobile.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Database Schema](#database-schema)
3. [Data Flow](#data-flow)
4. [API Specification](#api-specification)

---

## Architecture Overview

UMKMoo's menggunakan arsitektur **client-server** dengan pemisahan yang jelas antara lapisan frontend, backend, dan database. Berikut adalah gambaran umum arsitektur sistem UMKMoo's:

### 1. **Frontend (Client)**
   - **Mobile (React Native)**: Menyediakan aplikasi kasir (POS) yang cepat di tablet atau smartphone.
   - **Web (Next.js)**: Menyediakan dashboard analitik yang detail dan akses ke laporan keuangan serta pengelolaan stok.

### 2. **Backend (Server)**
   - **Node.js / Go**: Menangani logika bisnis, seperti perhitungan Nisab Zakat, Harga Pokok Penjualan (HPP), margin keuntungan, dan pemrosesan transaksi.
   - Backend berfungsi untuk menghubungkan frontend dengan database, memproses permintaan pengguna, serta menghasilkan laporan.

### 3. **Database**
   - **Supabase (PostgreSQL)**: Database relasional yang menyimpan data transaksi, stok, laporan keuangan, karyawan, dan lainnya.
   - Supabase menyediakan autentikasi dan penyimpanan file terkait transaksi dan bukti pembayaran.

### 4. **Cloud Storage**
   - **Supabase Storage**: Menyimpan file terkait transaksi, seperti struk digital dan bukti pembayaran.

### 5. **Security & Auth**
   - **Supabase Auth**: Menyediakan autentikasi berbasis token (JWT) dan kontrol akses berbasis peran (RBAC) untuk memastikan bahwa hanya pengguna yang berwenang yang dapat mengakses data tertentu.

---

## Database Schema

Berikut adalah skema database yang digunakan oleh UMKMoo's:

### 1. **users** - Menyimpan identitas pengguna dan peran mereka dalam sistem.
| Column        | Type   | Description                |
|---------------|--------|----------------------------|
| id            | UUID   | Primary Key                |
| name          | VARCHAR| Nama lengkap pengguna      |
| email         | VARCHAR| Email (unique)             |
| role          | ENUM   | admin, kasir, akuntan, logistik |
| business_id   | UUID   | Foreign Key ke tabel `businesses` |
| created_at    | TIMESTAMP | Tanggal pendaftaran pengguna |

### 2. **businesses** - Menyimpan profil bisnis.
| Column        | Type   | Description                |
|---------------|--------|----------------------------|
| id            | UUID   | Primary Key                |
| name          | VARCHAR| Nama usaha                 |
| address       | TEXT   | Alamat usaha               |
| logo_url      | TEXT   | Path logo di cloud storage |
| accounting_system | ENUM | syariah, konvensional    |
| created_at    | TIMESTAMP | Tanggal pendaftaran bisnis |

### 3. **transactions** - Catatan transaksi penjualan atau pengeluaran.
| Column        | Type   | Description                |
|---------------|--------|----------------------------|
| id            | UUID   | Primary Key                |
| business_id   | UUID   | Foreign Key ke `businesses` |
| type          | ENUM   | penjualan, pengeluaran, retur |
| total_amount  | DECIMAL| Total transaksi            |
| payment_method| ENUM   | cash, qris, e-wallet, transfer |
| category      | VARCHAR| Kategori pengeluaran (jika relevan) |
| description   | TEXT   | Deskripsi transaksi        |
| created_by    | UUID   | Foreign Key ke `users`     |
| date          | DATE   | Tanggal transaksi          |
| created_at    | TIMESTAMP | Tanggal pencatatan transaksi |

### 4. **products** - Data produk yang dijual atau bahan baku.
| Column        | Type   | Description                |
|---------------|--------|----------------------------|
| id            | UUID   | Primary Key                |
| business_id   | UUID   | Foreign Key ke `businesses` |
| name          | VARCHAR| Nama produk                |
| category      | VARCHAR| Kategori produk            |
| price         | DECIMAL| Harga jual                 |
| hpp           | DECIMAL| Harga pokok penjualan      |
| stock         | INTEGER| Jumlah stok saat ini       |
| min_stock     | INTEGER| Batas stok minimum         |
| unit          | VARCHAR| Satuan produk (pcs, kg, dll.) |

### 5. **budget** - Data anggaran untuk pengeluaran bisnis.
| Column        | Type   | Description                |
|---------------|--------|----------------------------|
| id            | UUID   | Primary Key                |
| business_id   | UUID   | Foreign Key ke `businesses` |
| category      | VARCHAR| Kategori pengeluaran       |
| amount        | DECIMAL| Batas anggaran             |
| period        | DATE   | Periode anggaran (bulan)   |
| created_at    | TIMESTAMP | Waktu pembuatan anggaran |

### 6. **employees** - Data karyawan bisnis.
| Column        | Type   | Description                |
|---------------|--------|----------------------------|
| id            | UUID   | Primary Key                |
| business_id   | UUID   | Foreign Key ke `businesses` |
| name          | VARCHAR| Nama karyawan              |
| position      | VARCHAR| Jabatan karyawan           |
| phone         | VARCHAR| Nomor telepon              |
| join_date     | DATE   | Tanggal bergabung          |

### 7. **attendance** - Data absensi karyawan.
| Column        | Type   | Description                |
|---------------|--------|----------------------------|
| id            | UUID   | Primary Key                |
| employee_id   | UUID   | Foreign Key ke `employees` |
| date          | DATE   | Tanggal absensi            |
| check_in      | TIMESTAMP | Waktu check-in          |
| check_out     | TIMESTAMP | Waktu check-out         |
| status        | ENUM   | hadir, izin, sakit, alpa  |

---

## Data Flow

### 1. **User Login Flow**
   - Pengguna masuk ke aplikasi menggunakan email dan password yang telah terdaftar di **Supabase Auth**.
   - Autentikasi dilakukan dengan token JWT yang mengidentifikasi peran pengguna dan akses ke fitur tertentu.

### 2. **Transaction Flow (POS)**
   - Kasir memilih produk atau scan barcode, memasukkan kuantitas, dan memilih metode pembayaran (Cash, QRIS, e-wallet, atau transfer).
   - Sistem otomatis memotong stok sesuai dengan produk yang dibeli, dan transaksi dicatat dalam tabel **transactions**.
   - Struk digital dihasilkan dan dapat dikirim ke pelanggan melalui WhatsApp atau email.

### 3. **Stock Management Flow**
   - Pengguna dapat memantau stok produk secara real-time di halaman **Manajemen Stok**.
   - Admin/logistik dapat memperbarui stok secara manual setelah pembelian atau pengiriman barang.
   - Notifikasi dikirim saat stok produk mencapai batas minimum yang ditentukan.

---

## API Specification (Ringkasan)

Berikut adalah ringkasan endpoint API yang disediakan oleh backend untuk mengakses data aplikasi UMKMoo's.

### 1. **POST /login**
   - **Description**: Autentikasi pengguna untuk login ke sistem.
   - **Body**:
     ```json
     {
       "email": "user@example.com",
       "password": "password123"
     }
     ```
   - **Response**:
     ```json
     {
       "token": "JWT_TOKEN"
     }
     ```

### 2. **GET /dashboard**
   - **Description**: Mendapatkan ringkasan KPI bisnis (total penjualan, produk unggulan, keuntungan).
   - **Headers**:
     ```json
     {
       "Authorization": "Bearer JWT_TOKEN"
     }
     ```

### 3. **POST /transaction**
   - **Description**: Mencatat transaksi penjualan.
   - **Body**:
     ```json
     {
       "business_id": "UUID",
       "type": "penjualan",
       "total_amount": 100000,
       "payment_method": "QRIS",
       "products": [
         {
           "product_id": "UUID",
           "quantity": 2
         }
       ]
     }
     ```
   - **Response**:
     ```json
     {
       "transaction_id": "UUID",
       "status": "success"
     }
     ```

### 4. **GET /stock**
   - **Description**: Mendapatkan status stok produk saat ini.
   - **Response**:
     ```json
     {
       "products": [
         {
           "id": "UUID",
           "name": "Produk A",
           "stock": 50
         }
       ]
     }
     ```

### 5. **GET /zakat**
   - **Description**: Menghitung kewajiban zakat berdasarkan nisab dan haul.
   - **Response**:
     ```json
     {
       "nisab": 85,
       "haul": 1,
       "zakat": 25000
     }
     ```

---

Dokumen ini memberikan gambaran lengkap tentang arsitektur, skema database, alur data, dan spesifikasi API untuk aplikasi UMKMoo's. Ini dirancang untuk membantu tim pengembang dalam memahami alur dan struktur sistem yang digunakan.
