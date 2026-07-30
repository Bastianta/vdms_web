---
inclusion: always
---

# Product Overview

## Nama Produk
[Nama aplikasi -- isi sesuai project]

## Tujuan
```Contoh :
Aplikasi internal berbasis web untuk mengelola data perusahaan menggunakan Oden Framework. Setiap form menyediakan fungsi CRUD (Create, Read, Update, Delete) dengan validasi, LOV, dan audit trail otomatis.
```

Tujuan aplikasi :
```
```

## Target User
```Contoh:
- Staff operasional untuk input dan maintenance data harian
- Manager untuk review, approval, dan monitoring
- Admin untuk pengelolaan master data dan konfigurasi menu
```
Target user :
```
```
## Fitur Utama
```Contoh:
- Master data management (CRUD forms dengan parent-child relationship)
- List of Values (LOV) untuk referensi data antar tabel
- Validasi client-side dan server-side
- Audit trail otomatis (create/update user & timestamp via DB trigger)
- Multi-tab view (SUB_PARENT) untuk tabel dengan banyak kolom
- Custom View untuk dashboard dan reporting
- Export data dan cetak laporan
```

Fitur-fitur yang terdapat pada aplikasi :
```
```

## Business Rules Global
- Semua transaksi harus ter-audit (create/update user + timestamp dikelola DB trigger)
- Data tidak boleh dihapus, hanya boleh pengupdatean status aktif
- Akses menu berdasarkan role user (diatur via SSO di production)
- Field LOV/Combo harus didefinisikan eksplisit -- tidak bisa ditebak dari DDL saja
- History table digunakan untuk logging otomatis delete/update jika diperlukan
