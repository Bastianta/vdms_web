---
# VDMS — Vehicle Dealer Management System
# Custom View Spec (Oden + Tailwind CSS)

---

## IDENTITAS

**Nama Project**: VDMS — Vehicle Dealer Management System
**Schema**: public
**CSS Framework**: Tailwind CSS (via CDN)

**Menu Structure:**
```
LOGIN      > Login (root — no parent, serves as landing page)
VEHICLES   > Vehicle Inventory (root parent group)
  ├── VEHICLE_LIST   > Vehicles
  └── VEHICLE_ADD    > Add Vehicle
```

---

## ROLES

- **Admin**: full access — lihat inventory, tambah kendaraan, edit kendaraan, hapus (soft delete) kendaraan, lihat semua data
- **User**: view-only — lihat inventory, filter/search, buka detail kendaraan, TIDAK bisa add/edit/delete

Sidebar navigation beda per role:
- Admin: tampil "Vehicles" dan "Add Vehicle"
- User: tampil "Vehicles" saja

---

## DDL (FIXED)

```sql
-- NOTE: DDL di bawah sudah diperbaiki dari versi original

CREATE TABLE vehicle (
    vehicle_id          SERIAL PRIMARY KEY,
    vehicle_type        VARCHAR(20)     NOT NULL,
    vehicle_brand       VARCHAR(50)     NOT NULL,
    vehicle_name        VARCHAR(100)    NOT NULL,
    vehicle_trim        VARCHAR(50)     NOT NULL,
    vehicle_year        INT             NOT NULL,
    vehicle_price       NUMERIC(15, 2)  NOT NULL,
    vehicle_condition   VARCHAR(100),
    vehicle_is_new      BOOLEAN         NOT NULL DEFAULT TRUE,
    vehicle_mileage     INT             DEFAULT 0,
    vehicle_image_path  VARCHAR(255),
    vehicle_availability BOOLEAN        NOT NULL DEFAULT TRUE,
    vehicle_is_deleted  BOOLEAN         NOT NULL DEFAULT FALSE,
    vehicle_create_user VARCHAR(50),
    vehicle_update_user VARCHAR(50)
);

CREATE TABLE app_user (
    as_id       SERIAL PRIMARY KEY,
    as_name     VARCHAR(50)  UNIQUE NOT NULL,
    as_pass     VARCHAR(255) NOT NULL,
    as_role     VARCHAR(20)  NOT NULL CHECK (as_role IN ('admin', 'user'))
);

CREATE TABLE vehicle_image (
    image_id    SERIAL PRIMARY KEY,
    vehicle_id  INT NOT NULL REFERENCES vehicle(vehicle_id),
    image_path  VARCHAR(255) NOT NULL,
    sort_order  INT DEFAULT 0
);
```

---

## STATE MACHINE

Tidak ada approval workflow. Status yang ada: `vehicle_availability` (true/false) dan `vehicle_is_deleted` (soft delete).

| State Awal | Aksi | Siapa | State Baru | Siapa yang Diberitahu | Apa yang Dilihat Setelahnya |
|------------|------|-------|------------|----------------------|----------------------------|
| (none) | Login (valid, role=admin) | - | Authenticated Admin | - | Redirect ke VEHICLE_LIST dengan sidebar Admin |
| (none) | Login (valid, role=user) | - | Authenticated User | - | Redirect ke VEHICLE_LIST dengan sidebar User |
| (none) | Login (invalid) | - | Unauthenticated | - | Error message "Invalid credentials" di form login |
| (none) | Add Vehicle | Admin | vehicle saved | - | Redirect ke VEHICLE_LIST, vehicle baru muncul di tabel |
| Existing | Edit Vehicle | Admin | vehicle updated | - | Redirect ke VEHICLE_LIST, data updated |
| Existing | Remove Vehicle | Admin | vehicle_is_deleted=true | - | Vehicle hilang dari list (soft delete) |
| Existing | Toggle Availability | Admin | vehicle_availability flipped | - | Badge availability berubah di list |

---

## SCREENS

### Screen: LOGIN
**MENU_ID**: LOGIN
**File**: templates/LOGIN.html + application/LOGIN.py

**Saat buka halaman:**
- Form login centered di dark navy background (#0f172a)
- Logo VDMS (icon mobil kecil), judul "Vehicle Dealer Management System"
- Fields: Username, Password
- Tombol "Sign In" (dark navy, full width)
- Demo hint di bawah: "Demo: admin / adminOf:user / user"

**Yang bisa dilakukan user:**

| Aksi | Apa yang Terjadi |
|------|-----------------|
| Isi username + password, klik Sign In | POST ke backend, validasi credentials |
| Credentials salah | Swal.fire error "Invalid credentials" |
| Credentials benar, role=admin | Session disimpan, redirect ke /?type=CUSTOM_VIEW&menuId=VEHICLE_LIST |
| Credentials benar, role=user | Session disimpan, redirect ke /?type=CUSTOM_VIEW&menuId=VEHICLE_LIST |

**Beda per role:** Semua user melihat form yang sama. Redirect tujuan sama (VEHICLE_LIST), tapi sidebar yang muncul berbeda berdasarkan role di session.

---

### Screen: VEHICLE_LIST
**MENU_ID**: VEHICLE_LIST
**File**: templates/VEHICLE_LIST.html + application/VEHICLE_LIST.py

**Saat buka halaman:**
- Sidebar kiri: VDMS logo + "Dealer Management" subtitle, Navigation links (Vehicles [active], Add Vehicle [admin only]), bottom: "Signed in as [name]" + role badge (Full Access/View Only) + Log Out
- Header: "Vehicle Inventory", subtitle "X vehicles in inventory"
- Filter bar: search input (title/brand), dropdown "All Brands", dropdown "All Types" (Car/Motorcycle), dropdown "All Availability"
- Tombol "+ Add Vehicle" di kanan (admin only, hidden untuk user)
- Tabel dengan kolom: PHOTO, TITLE, TYPE, PRICE, AVAILABILITY, ACTIONS
  - PHOTO: thumbnail gambar (50x50, vehicle_image_path)
  - TITLE: "Brand Name Trim Year" (bold), di bawah "New/Used · X km" (gray, small)
  - TYPE: badge dengan icon (🚗 Car / 🏍 Motorcycle)
  - PRICE: "Rp X.XXX.XXX.XXX" formatted
  - AVAILABILITY: badge hijau "Available" / badge abu "Not Available"
  - ACTIONS: icon edit (✏️) + icon delete (🗑️) — admin only, hidden untuk user
- Pagination bawah: "Showing X-Y of Z", prev/next buttons, page numbers
- Klik row vehicle: buka modal detail kendaraan

**Yang bisa dilakukan user:**

| Aksi | Apa yang Terjadi |
|------|-----------------|
| Search by title/brand | Filter list real-time (debounced 300ms) |
| Filter Brand dropdown | Reload list dengan filter brand |
| Filter Type dropdown | Reload list dengan filter type (Car/Motorcycle) |
| Filter Availability dropdown | Reload list dengan filter availability |
| Klik row (semua role) | Buka modal detail kendaraan |
| Klik Edit icon (admin) | Redirect ke VEHICLE_ADD dengan mode edit, pre-filled data |
| Klik Delete icon (admin) | Swal confirm "Remove Vehicle — Remove [Title] from inventory? This action cannot be undone." |
| Confirm delete | Soft delete (vehicle_is_deleted=true), refresh list |
| Cancel delete | Modal tutup, tidak ada perubahan |
| Klik + Add Vehicle (admin) | Redirect ke VEHICLE_ADD (mode add baru) |
| Klik Log Out | Clear session, redirect ke LOGIN |
| Pagination prev/next/page | Load halaman berikutnya (8 per halaman) |

**Detail Modal (klik row):**
- Header: "[Brand Name Trim Year]" + X close button + badge Available/Not Available
- Image carousel dengan thumbnail navigator (vehicle_image table)
- Info grid 2 kolom: Vehicle Type, Brand, Vehicle Name, Trim/Variant, Year, Price (formatted Rp), Condition Type (New/Used), Mileage (X km)
- Condition Notes (full width, jika ada)

**Beda per role:**
- Admin: tampil ACTIONS kolom (Edit + Delete), tampil "+ Add Vehicle" button
- User: ACTIONS kolom tidak tampil, tidak ada "+ Add Vehicle" button, sidebar hanya "Vehicles"

---

### Screen: VEHICLE_ADD (Add + Edit)
**MENU_ID**: VEHICLE_ADD
**File**: templates/VEHICLE_ADD.html + application/VEHICLE_ADD.py

**Saat buka halaman (Add mode):**
- Header: "Add New Vehicle", subtext "Title preview: [Brand Name Trim Year]" — live preview
- Section "BASIC INFORMATION":
  - Vehicle Type: toggle button "🚗 Car" / "🏍 Motorcycle" (pill style)
  - Brand (input), Vehicle Name (input) — side by side
  - Trim/Variant (input), Year (input, default current year) — side by side
- Section "PRICING & CONDITION":
  - Price (Rupiah) — number input, prefixed "Rp"
  - Condition Type: toggle "New" / "Used" (pill style)
  - Mileage (km) — number input (disabled jika New, enabled jika Used)
  - Condition Notes — textarea
- Section "VEHICLE PHOTOS":
  - Label "Required" merah
  - Upload area: drag & drop atau klik, preview thumbnail setelah upload
  - Caption: "Upload at least 1 photo. JPEG, PNG, or WebP supported"
- Section "AVAILABILITY":
  - Toggle switch "Available for sale"
- Footer: tombol "Save Vehicle" (dark) + "Cancel" (text)

**Saat buka halaman (Edit mode):**
- Header: "Edit Vehicle", subtext "Title preview: [current title]"
- Semua field pre-filled dari data existing
- Footer: tombol "Update Vehicle" (dark) + "Cancel" (text) + "Remove Vehicle" (text, merah, kanan)
- "Remove Vehicle" = same soft delete, confirm dulu

**Yang bisa dilakukan user:**

| Aksi | Apa yang Terjadi |
|------|-----------------|
| Toggle Vehicle Type | Update preview, update icon |
| Isi Brand/Name/Trim/Year | Live update Title Preview di header |
| Toggle Condition Type ke "New" | Set mileage = 0, disable mileage input |
| Toggle Condition Type ke "Used" | Enable mileage input |
| Upload foto | Preview thumbnail muncul, simpan ke vehicle_image |
| Klik Save Vehicle | Validasi semua required fields, submit ke backend |
| Validasi gagal | Swal.fire error dengan daftar field yang kosong |
| Submit berhasil | Swal success, redirect ke VEHICLE_LIST |
| Klik Cancel | Redirect ke VEHICLE_LIST tanpa simpan |
| Klik Remove Vehicle (edit mode) | Swal confirm soft delete |

**Beda per role:** Halaman ini hanya dapat diakses Admin. Jika User mencoba akses langsung, redirect ke VEHICLE_LIST.

---

## END-TO-END FLOWS

```
FLOW: Login sebagai Admin

1. Admin buka app (GET /)
2. Oden redirect ke LOGIN screen
3. Admin isi username=admin, password=adminOf:user, klik Sign In
4. Backend verifikasi ke app_user table (bcrypt/plain match)
5. Session disimpan: nik=admin, role=admin, name=Admin
6. Redirect ke /?type=CUSTOM_VIEW&menuId=VEHICLE_LIST
7. VEHICLE_LIST render dengan sidebar Full Access, tampil "+ Add Vehicle" button, tampil ACTIONS kolom
```

```
FLOW: Login sebagai User

1. User buka app
2. Isi username=user, password=user, klik Sign In
3. Session disimpan: role=user
4. Redirect ke VEHICLE_LIST
5. Sidebar tampil "View Only" badge, tidak ada "+ Add Vehicle", tidak ada ACTIONS kolom
```

```
FLOW: Login Gagal

1. User isi credentials salah, klik Sign In
2. Backend return {status: false, msg: "Invalid credentials"}
3. Swal.fire({icon: 'error', text: 'Invalid credentials'})
4. User tetap di LOGIN screen
```

```
FLOW: Admin Tambah Kendaraan

1. Admin di VEHICLE_LIST, klik "+ Add Vehicle"
2. Redirect ke VEHICLE_ADD (add mode)
3. Admin pilih Vehicle Type = "Car"
4. Admin isi Brand="Toyota", Name="Camry", Trim="V6 XSE", Year="2024"
5. Title Preview update: "Toyota Camry V6 XSE 2024"
6. Admin isi Price=650000000
7. Admin pilih Condition="Used", isi Mileage=12500
8. Admin isi Condition Notes
9. Admin upload 1+ foto
10. Admin toggle Availability = ON
11. Admin klik "Save Vehicle"
12. Backend INSERT ke vehicle + vehicle_image
13. Swal success, redirect ke VEHICLE_LIST
14. Toyota Camry V6 XSE 2024 muncul di baris pertama tabel
```

```
FLOW: Admin Edit Kendaraan

1. Admin di VEHICLE_LIST, klik Edit icon (✏️) pada row
2. Redirect ke VEHICLE_ADD?id=X (edit mode)
3. Form pre-filled dengan data existing
4. Admin ubah Price, klik "Update Vehicle"
5. Backend UPDATE vehicle SET ... WHERE vehicle_id = X
6. Swal success, redirect ke VEHICLE_LIST
7. Row di list menampilkan harga baru
```

```
FLOW: Admin Hapus Kendaraan

1. Admin di VEHICLE_LIST, klik Delete icon (🗑️) pada row Toyota Camry
2. Swal confirm: "Remove Toyota Camry V6 XSE 2024 from inventory? This action cannot be undone."
3. Admin klik "Remove" (merah)
4. Backend UPDATE vehicle SET vehicle_is_deleted=true WHERE vehicle_id=X
5. List reload, Toyota Camry tidak muncul lagi
```

```
FLOW: User Lihat Detail Kendaraan

1. User di VEHICLE_LIST (tidak ada ACTIONS kolom)
2. User filter Type="Motorcycle"
3. List refresh menampilkan hanya motor
4. User klik row "Ducati Panigale V4 S 2023"
5. Modal detail muncul dengan carousel foto + info grid
6. User lihat semua detail: harga, mileage, kondisi, catatan
7. User klik X, modal tutup
```

```
FLOW: Filter dan Search

1. User/Admin di VEHICLE_LIST
2. Ketik "Toyota" di search box → list filter real-time
3. Pilih "All Brands" → filter by brand
4. Pilih "Car" di All Types → hanya tampil Car
5. Pilih "Available" di All Availability → hanya tampil yang tersedia
6. Semua filter bisa dikombinasikan
7. Pagination reset ke halaman 1 saat filter berubah
```

```
FLOW: Logout

1. User/Admin klik "Log Out" di sidebar
2. Session cleared
3. Redirect ke LOGIN screen
```

---

## VALIDASI

- Login: username dan password wajib diisi
- Add/Edit Vehicle: Brand, Vehicle Name, Trim, Year, Price wajib diisi
- Add/Edit Vehicle: minimal 1 foto wajib diupload
- Year: harus angka 4 digit, antara 1900–2030
- Price: harus > 0
- Mileage: jika Used, harus >= 0
- Edit/Delete: hanya admin yang boleh akses, redirect user ke VEHICLE_LIST

---

## LOGIC TAMBAHAN

- **Title Preview**: `[Brand] [Vehicle Name] [Trim] [Year]` — live update saat user mengetik
- **Price Formatting**: tampilkan sebagai "Rp X.XXX.XXX.XXX" di list dan modal detail
- **Pagination**: 8 records per halaman, server-side dengan OFFSET/LIMIT
- **Soft Delete**: vehicle tidak benar-benar dihapus, hanya vehicle_is_deleted=true; semua query WHERE vehicle_is_deleted=false
- **Image Upload**: simpan ke local folder (development) atau GCS bucket (production)
- **Session Auth**: semua halaman kecuali LOGIN require valid session; jika tidak ada session → redirect LOGIN
- **Tailwind via CDN**: `<script src="https://cdn.tailwindcss.com"></script>`
- **SweetAlert2 via CDN**: `<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>`
- **jQuery via CDN**: untuk callAPI helper

---

## FILE LIST YANG AKAN DIBUAT

| File | Keterangan |
|------|-----------|
| `application/LOGIN.py` | Auth logic, session management |
| `templates/LOGIN.html` | Login page (dark navy, centered form) |
| `application/VEHICLE_LIST.py` | List, filter, delete, toggle availability |
| `templates/VEHICLE_LIST.html` | Inventory table + sidebar + detail modal |
| `application/VEHICLE_ADD.py` | Insert, update, image upload |
| `templates/VEHICLE_ADD.html` | Add/Edit form dengan live preview |
| `staticOdenMenu.py` | Menu registration |
| `main.py` | CustomOden dengan authenticate, index, customView, view |
| `Database/vmd_fixed.sql` | DDL yang sudah diperbaiki |

---

## MENU REGISTRATION (staticOdenMenu.py)

```python
menu = [
    ['LOGIN', 'Login', ''],
    ['VEHICLES', 'Vehicles', ''],
    ['VEHICLE_LIST', 'Vehicles', 'VEHICLES'],
    ['VEHICLE_ADD', 'Add Vehicle', 'VEHICLES'],
]
```
