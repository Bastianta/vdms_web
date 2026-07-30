# VDMS — Implementation Tasks

## Task Dependency Graph

```
T1 (DB + DDL)
  └── T2 (Oden init + main.py)
        ├── T3 (LOGIN screen)
        │     └── T4 (VEHICLE_LIST screen)
        │           └── T5 (VEHICLE_ADD screen)
        └── T6 (staticOdenMenu + sidebar)
              ├── T4
              └── T5
```

Execution order: T1 → T2 → T6 → T3 → T4 → T5

---

## Task 1 — Fix & Apply Database DDL

**File**: `Database/vmd_fixed.sql`

Fix 3 bugs from original DDL and add required audit columns:

- [x] Fix `CHECK (role IN ...)` → `CHECK (as_role IN ('admin', 'user'))`
- [x] Add missing comma in `vehicle_image` table after FK constraint line
- [x] Add `vehicle_create_user VARCHAR(50)` to `vehicle` table
- [x] Add `vehicle_update_user VARCHAR(50)` to `vehicle` table
- [x] Add seed data: 2 users (admin/adminOf:user role=admin, user/user role=user)
- [x] Write complete fixed DDL to `Database/vmd_fixed.sql`

**Acceptance**: `Database/vmd_fixed.sql` executes in PostgreSQL without errors.

---

## Task 2 — Initialize Oden Project

**Files**: `main.py`, `globalVar.py`

Download and unpack the Oden starter, configure for this project:

- [x] Download `curl -O "https://hocdnoden0201.sat.co.id/oden-qdev.tar.gz"` and unpack
- [x] Set `PRODUCTION_ODEN = "N"` in `globalVar.py`
- [x] Ensure Redis running on `127.0.0.1:6379`
- [x] Configure `config/Connection2.cfg` for local PostgreSQL
- [x] Write `main.py` with `CustomOden` class:
  - `authenticate()` — bypass SSO (dev mode), return `{nik: "dev", attributes: {name: "Dev"}}`
  - `authorize()` — return full access dict
  - `index()` — if session exists redirect to VEHICLE_LIST, else serve `LOGIN.html` via `fileToString`
  - `customView(menuId, html)` — for `VEHICLE_LIST` and `VEHICLE_ADD`, inject `[SIDEBAR]` from `templates/common/sidebar.html`
  - `view()` — return html unchanged
  - `CustomOden.name = "VDMS"`, port 8000
- [x] Create `mkdir -p templates/common static/uploads/vehicles application`

**Acceptance**: `python main.py` starts without error on port 8000. `GET /` returns the LOGIN page HTML.

---

## Task 3 — LOGIN Screen

**Files**: `application/LOGIN.py`, `templates/LOGIN.html`

### application/LOGIN.py

- [x] `login_LOGIN()` with `@exposeApi`:
  - Read `ajaxData = request.json.get("data")`
  - Auth guard: NOT needed on login (public)
  - SQL: `SELECT as_id, as_name, as_role FROM app_user WHERE as_name = %(username)s AND as_pass = %(password)s`
  - Use `selectDataHeaderQueryRO`
  - If found: `session["loggedId"] = {"nik": row["asname"], "role": row["asrole"], "name": row["asname"]}`, return `{status: True, data: {role, name}, msg: ""}`
  - If not found: return `{status: False, data: {}, msg: "Invalid credentials"}`
- [x] `logout_LOGIN()` with `@exposeApi`:
  - `session.pop("loggedId", None)`
  - return `{status: True, data: {}, msg: "Logged out"}`
- [x] `execVcount = ""`

### templates/LOGIN.html

- [x] Dark navy background `bg-[#0f172a]`, full screen, centered
- [x] White card: rounded-xl, shadow, w-96, p-8
- [x] VDMS logo (car emoji or SVG icon) + "VDMS" text
- [x] Title: "Vehicle Dealer Management System" (bold, large)
- [x] Subtitle: "Sign in to access the dashboard" (gray, small)
- [x] Username input: label "Username", placeholder "Enter username"
- [x] Password input: label "Password", placeholder "Enter password", type=password
- [x] Sign In button: full width, dark navy bg, white text, rounded
- [x] Demo hint: "Demo: admin / adminOf:user / user" (gray, small, centered)
- [x] CDN includes: Tailwind, SweetAlert2, jQuery
- [x] JS: `callAPI("LOGIN", "login_LOGIN", {username, password})`
  - On success: `window.location.href = "/?type=CUSTOM_VIEW&menuId=VEHICLE_LIST"`
  - On fail: `Swal.fire({icon: 'error', title: 'Login Failed', text: response.msg})`
- [x] Enter key on password field triggers Sign In

**Acceptance**: Login with admin/adminOf:user redirects to VEHICLE_LIST. Login with wrong credentials shows Swal error. Login with user/user redirects to VEHICLE_LIST.

---

## Task 4 — VEHICLE_LIST Screen

**Files**: `application/VEHICLE_LIST.py`, `templates/VEHICLE_LIST.html`

### application/VEHICLE_LIST.py

- [x] Auth guard helper (inline in each function): check `session.get("loggedId")`, return Unauthorized if missing
- [x] `getVehicles_VEHICLE_LIST()` with `@exposeApi`:
  - Inputs: `{search, brand, type, availability, page}` (all optional, default to empty/1)
  - Build filter SQL with OFFSET/LIMIT (8 per page)
  - Run count query separately for pagination total
  - Return: `{status, data: {vehicles: [...], total: N, page: N, per_page: 8}, msg}`
  - Cast all non-text columns with `::text` in SELECT aliases
  - All aliases lowercase, no underscore (e.g. `vehicleid`, `vehiclebrand`)
  - Include `firstimage` from vehicle_image (LEFT JOIN, MIN sort_order)
- [x] `getBrands_VEHICLE_LIST()` with `@exposeApi`:
  - `SELECT DISTINCT vehicle_brand AS vehiclebrand FROM vehicle WHERE vehicle_is_deleted = false ORDER BY vehicle_brand`
  - Return list of brands for dropdown
- [x] `getVehicleDetail_VEHICLE_LIST()` with `@exposeApi`:
  - Input: `{vehicle_id}`
  - Query vehicle + all vehicle_image rows (ORDER BY sort_order)
  - Return `{status, data: {vehicle: {...}, images: [{imagepath, sortorder}, ...]}, msg}`
- [x] `deleteVehicle_VEHICLE_LIST()` with `@exposeApi`:
  - Admin-only guard: check `session["loggedId"]["role"] == "admin"`
  - `UPDATE vehicle SET vehicle_is_deleted = true WHERE vehicle_id = %(vehicleid)s`
  - Use `executeDataQuery`
  - Return `{status, msg}`
- [ ] `execVcount = ""`

### templates/VEHICLE_LIST.html

- [ ] CDN includes: Tailwind, SweetAlert2, jQuery
- [x] `[SIDEBAR]` placeholder at start of body
- [x] `window.VDMS_CONFIG = {role: "[USER_ROLE]", name: "[USER_NAMA]"}` (NOTE: Oden replaces `[USER_NAMA]` but NOT `[USER_ROLE]` — store role in session and inject it from Python or use a custom placeholder in customView)
- [x] Page layout: flex h-screen, sidebar + main content area
- [x] Header section: "Vehicle Inventory" h1, subtitle "X vehicles in inventory" (updated by JS), "+ Add Vehicle" button (data-admin-only)
- [x] Filter bar: search text input (debounced 300ms), brand `<select>`, type `<select>` (All Types / Car / Motorcycle), availability `<select>` (All / Available / Not Available)
- [x] Table columns: PHOTO | TITLE | TYPE | PRICE | AVAILABILITY | ACTIONS
  - PHOTO: 48x48 img thumbnail, fallback placeholder if no image
  - TITLE: bold "Brand Name Trim Year", gray small "New/Used · Xkm"
  - TYPE: pill badge (dark for Car, orange-ish for Motorcycle)
  - PRICE: `formatRupiah(price)`
  - AVAILABILITY: green badge "Available" / gray badge "Not Available"
  - ACTIONS column (data-admin-only): edit icon button → redirect, delete icon button → confirmDelete
- [x] Table rows clickable → `openDetailModal(vehicleId)` (click on row, not on action buttons)
- [x] Pagination: "Showing X-Y of Z", page number buttons, prev/next
- [x] Detail modal (hidden): overlay, white card, title + availability badge, image carousel (thumbnails at bottom), 2-col info grid, condition notes, close X button
- [x] JS functions:
  - `formatRupiah(value)` — `'Rp ' + num.toLocaleString('id-ID')`
  - `loadBrands()` — populate brand dropdown
  - `loadVehicles(page)` — fetch + render table rows + update pagination + update count
  - `openDetailModal(vehicleId)` — fetch detail, render modal, show
  - `closeModal()` — hide modal
  - `confirmDelete(vehicleId, title)` — Swal confirm → deleteVehicle → reload
  - `applyAdminVisibility()` — hide `[data-admin-only]` if role != admin
  - Debounced search: 300ms delay on input event
  - Filter selects: immediate reload on change
- [x] On page load: `loadBrands()`, `loadVehicles(1)`, `applyAdminVisibility()`

**Acceptance**:
- Page shows table with vehicles from DB
- Filters work and reset pagination
- Row click opens modal with correct data and images
- Admin sees Edit/Delete icons; User does not
- Delete confirms, soft-deletes, and refreshes list
- Pagination shows correct pages

---

## Task 5 — VEHICLE_ADD Screen

**Files**: `application/VEHICLE_ADD.py`, `templates/VEHICLE_ADD.html`

### application/VEHICLE_ADD.py

- [x] Admin-only guard in every function
- [x] `uploadVehicleImage_VEHICLE_ADD()` with `@exposeApi`:
  - Receive file as base64 string from frontend
  - Decode and save to `static/uploads/vehicles/vehicle_{timestamp}.{ext}`
  - Return `{status: True, data: {path: "static/uploads/vehicles/..."}, msg: ""}`
- [x] `getVehicleForEdit_VEHICLE_ADD()` with `@exposeApi`:
  - Input: `{vehicle_id}`
  - Query vehicle table + vehicle_image table
  - Return full vehicle data + images array
  - Cast all numeric/boolean to `::text`
- [x] `saveVehicle_VEHICLE_ADD()` with `@exposeApi`:
  - Validate: brand, name, trim, year, price all present; year is int 1900-2030; price > 0
  - `INSERT INTO vehicle (vehicle_type, vehicle_brand, vehicle_name, vehicle_trim, vehicle_year, vehicle_price, vehicle_condition, vehicle_is_new, vehicle_mileage, vehicle_availability, vehicle_create_user, vehicle_update_user) VALUES (...) RETURNING vehicle_id`
  - For each image in `data["images"]`: `INSERT INTO vehicle_image (vehicle_id, image_path, sort_order) VALUES (...)`
  - Return `{status: True, data: {vehicleid: new_id}, msg: "Vehicle saved"}`
- [x] `updateVehicle_VEHICLE_ADD()` with `@exposeApi`:
  - Validate same as save
  - `UPDATE vehicle SET ... WHERE vehicle_id = %(vehicleid)s`
  - Delete old images: `DELETE FROM vehicle_image WHERE vehicle_id = %(vehicleid)s`
  - Re-insert all images from `data["images"]`
  - Return `{status: True, data: {}, msg: "Vehicle updated"}`
- [x] `removeVehicle_VEHICLE_ADD()` with `@exposeApi`:
  - `UPDATE vehicle SET vehicle_is_deleted = true WHERE vehicle_id = %(vehicleid)s`
  - Return `{status: True, data: {}, msg: "Vehicle removed"}`
- [ ] `execVcount = ""`

### templates/VEHICLE_ADD.html

- [ ] CDN includes: Tailwind, SweetAlert2, jQuery
- [x] `[SIDEBAR]` placeholder
- [x] `window.VDMS_CONFIG` injection
- [x] Admin guard: if role != admin, redirect to VEHICLE_LIST
- [x] Header: dynamic "Add New Vehicle" or "Edit Vehicle" based on EDIT_MODE
- [x] Live title preview: "Title preview: Brand Name Trim Year" updates on every input
- [x] Section "BASIC INFORMATION" (white card):
  - Vehicle Type toggle: two pill buttons "🚗 Car" / "🏍 Motorcycle", active = dark navy
  - Brand (text input) + Vehicle Name (text input) — 2 col grid
  - Trim/Variant (text input) + Year (number input, default=current year) — 2 col grid
- [x] Section "PRICING & CONDITION" (white card):
  - Price: label "Price (Rupiah) *", input with "Rp " prefix, number type
  - Condition Type toggle: "New" / "Used" pill buttons
  - Mileage input (disabled when New, enabled when Used, reset to 0 on New)
  - Condition Notes: `<textarea>` full width
- [x] Section "VEHICLE PHOTOS" (white card):
  - Label + "Required" red badge
  - Upload area: dashed border, click to select, or drag & drop
  - Preview thumbnails shown after upload
  - Max file size hint, accepted types hint
  - Multiple photos allowed
- [x] Section "AVAILABILITY" (white card):
  - Toggle switch (HTML checkbox styled as toggle), label "Available for sale"
- [x] Footer bar (fixed at bottom or below form):
  - Left: "Save Vehicle" (add mode) or "Update Vehicle" (edit mode) — dark navy button
  - Left: "Cancel" text button → `window.location.href = VEHICLE_LIST`
  - Right (edit mode only): "Remove Vehicle" red text button
- [ ] JS functions:
  - `detectEditMode()` — read `?id=` from URL
  - `prefillForm(data)` — fill all fields from vehicle data (edit mode)
  - `updateTitlePreview()` — concat brand + name + trim + year
  - `toggleConditionType(type)` — enable/disable mileage, reset to 0 if New
  - `handleFileSelect(files)` — loop files, read as base64, call uploadVehicleImage, show preview
  - `collectFormData()` — gather all field values + uploaded image paths array
  - `validateForm(data)` — check required fields, return `{valid, errors}`
  - `submitVehicle()` — validate → saveVehicle or updateVehicle → Swal success → redirect
  - `confirmRemove()` — Swal confirm → removeVehicle → redirect to VEHICLE_LIST
- [x] On page load: if EDIT_MODE, call `getVehicleForEdit`, then `prefillForm`

**Acceptance**:
- Add mode: fill form, upload photo, save → appears in VEHICLE_LIST
- Edit mode: pre-filled, change field, update → updated in VEHICLE_LIST
- Validation: missing required field → Swal error listing missing fields
- Remove: Swal confirm → vehicle gone from list
- User accessing VEHICLE_ADD directly → redirected to VEHICLE_LIST

---

## Task 6 — Sidebar + Menu Registration

**Files**: `templates/common/sidebar.html`, `staticOdenMenu.py`

### templates/common/sidebar.html

- [x] Fixed width sidebar (w-64), dark navy background (`bg-[#0f172a]`), white text, full height
- [x] Top section: car icon + "VDMS" brand + "Dealer Management" subtitle (gray small)
- [x] Divider
- [x] Nav label "NAVIGATION" (gray uppercase small)
- [x] Nav links:
  - "Vehicles" link → `/?type=CUSTOM_VIEW&menuId=VEHICLE_LIST`
  - "Add Vehicle" link → `/?type=CUSTOM_VIEW&menuId=VEHICLE_ADD` (with `data-admin-only`)
  - Active state: lighter background + white text
- [x] Bottom section (mt-auto):
  - "SIGNED IN AS" label (gray uppercase small)
  - User name display
  - Role badge: green pill "Full Access" (admin) / blue pill "View Only" (user)
  - "Log Out" button with icon → `callAPI("LOGIN", "logout_LOGIN", {})` → redirect to `/`

### staticOdenMenu.py

- [x] Write menu list:
```python
menu = [
    ['LOGIN',        'Login',       ''],
    ['VEHICLES',     'Vehicles',    ''],
    ['VEHICLE_LIST', 'Vehicles',    'VEHICLES'],
    ['VEHICLE_ADD',  'Add Vehicle', 'VEHICLES'],
]
```

**Acceptance**: Sidebar appears on VEHICLE_LIST and VEHICLE_ADD. Role badge shows correctly. Log Out clears session and returns to login page. "Add Vehicle" nav link only visible to admin.

---

## Task 7 — Integration & Final Wiring

- [x] Verify `main.py` `index()` correctly redirects authenticated users to VEHICLE_LIST
- [x] Verify `customView()` correctly injects sidebar for VEHICLE_LIST and VEHICLE_ADD
- [x] Test end-to-end flow: Login → List → Add → Edit → Delete → Logout
- [x] Test User role: Login as user → can see list + detail modal, cannot access VEHICLE_ADD, no action buttons
- [x] Test session expiry: manually clear session → redirect to LOGIN on next API call
- [x] Verify price formatting shows correctly (Rp X.XXX.XXX)
- [x] Verify pagination works (add enough test data)
- [x] Verify image upload saves to `static/uploads/vehicles/` and displays in list + modal
- [x] Verify soft delete: deleted vehicles not shown in list

**Acceptance**: All 8 end-to-end flows from requirements.md pass manually.

---

## Summary

| Task | Files | Depends On |
|------|-------|------------|
| T1 — Fix DDL | `Database/vmd_fixed.sql` | — |
| T2 — Oden Init | `main.py`, `globalVar.py` | T1 |
| T3 — LOGIN | `application/LOGIN.py`, `templates/LOGIN.html` | T2 |
| T4 — VEHICLE_LIST | `application/VEHICLE_LIST.py`, `templates/VEHICLE_LIST.html` | T2, T3, T6 |
| T5 — VEHICLE_ADD | `application/VEHICLE_ADD.py`, `templates/VEHICLE_ADD.html` | T2, T3, T6 |
| T6 — Sidebar + Menu | `templates/common/sidebar.html`, `staticOdenMenu.py` | T2 |
| T7 — Integration | (no new files) | T3, T4, T5, T6 |
