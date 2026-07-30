# VDMS — Technical Design
**Vehicle Dealer Management System — Custom Oden + Tailwind CSS**

---

## 1. Architecture Overview

```
Browser
  └── GET /  →  main.py CustomOden.index()  →  LOGIN.html
  └── POST / (API, type=API)  →  application/LOGIN.py  →  session
  └── GET /?type=CUSTOM_VIEW&menuId=VEHICLE_LIST  →  VEHICLE_LIST.html
  └── GET /?type=CUSTOM_VIEW&menuId=VEHICLE_ADD   →  VEHICLE_ADD.html
  └── POST / (API calls)  →  application/VEHICLE_LIST.py or VEHICLE_ADD.py
```

**Oden Hooks used in main.py:**
- `index()` → serves LOGIN.html as landing page (no session required)
- `customView(menuId, html)` → injects shared sidebar partial into all authenticated pages
- `view()` → not needed (no standard Webix forms)

**Auth Flow:**
- Session key: `session["loggedId"]` = `{"nik": as_name, "role": as_role, "name": as_name}`
- All pages except LOGIN check session in Python; if missing → `{"status": false, "msg": "Unauthorized"}`
- Frontend: if Unauthorized response → `window.location.href = '/?type=CUSTOM_VIEW&menuId=LOGIN'`

---

## 2. File Structure

```
project/
├── main.py                          # CustomOden: index, authenticate, customView
├── globalVar.py                     # PRODUCTION_ODEN="N", DB_NAME, CDN
├── staticOdenMenu.py                # Menu tree
├── application/
│   ├── LOGIN.py                     # login_LOGIN, logout_LOGIN
│   ├── VEHICLE_LIST.py              # getVehicles_VEHICLE_LIST, deleteVehicle_VEHICLE_LIST,
│   │                                #   getBrands_VEHICLE_LIST, getVehicleDetail_VEHICLE_LIST
│   └── VEHICLE_ADD.py               # getVehicleForEdit_VEHICLE_ADD, saveVehicle_VEHICLE_ADD,
│                                    #   updateVehicle_VEHICLE_ADD, removeVehicle_VEHICLE_ADD
├── templates/
│   ├── LOGIN.html
│   ├── VEHICLE_LIST.html
│   ├── VEHICLE_ADD.html
│   └── common/
│       └── sidebar.html             # Shared sidebar partial (injected via customView)
├── static/
│   └── uploads/vehicles/            # Local image storage (dev)
├── config/
│   └── Connection2.cfg
└── Database/
    └── vmd_fixed.sql                # Fixed DDL with audit columns
```

---

## 3. Database Design (Fixed DDL)

Three bugs fixed from original `vmd.sql`:
1. `CHECK (role IN ...)` → `CHECK (as_role IN ...)` 
2. Missing comma in `vehicle_image` after FK line
3. Added `vehicle_create_user` + `vehicle_update_user` (Oden framework requirement)

```sql
CREATE TABLE vehicle (
    vehicle_id           SERIAL PRIMARY KEY,
    vehicle_type         VARCHAR(20)    NOT NULL,              -- 'Car' or 'Motorcycle'
    vehicle_brand        VARCHAR(50)    NOT NULL,
    vehicle_name         VARCHAR(100)   NOT NULL,
    vehicle_trim         VARCHAR(50)    NOT NULL,
    vehicle_year         INT            NOT NULL,
    vehicle_price        NUMERIC(15,2)  NOT NULL,
    vehicle_condition    VARCHAR(100),                         -- free text notes
    vehicle_is_new       BOOLEAN        NOT NULL DEFAULT TRUE,
    vehicle_mileage      INT            DEFAULT 0,
    vehicle_image_path   VARCHAR(255),                         -- primary image (legacy, kept for compat)
    vehicle_availability BOOLEAN        NOT NULL DEFAULT TRUE,
    vehicle_is_deleted   BOOLEAN        NOT NULL DEFAULT FALSE, -- soft delete flag
    vehicle_create_user  VARCHAR(50),
    vehicle_update_user  VARCHAR(50)
);

CREATE TABLE app_user (
    as_id    SERIAL PRIMARY KEY,
    as_name  VARCHAR(50)  UNIQUE NOT NULL,
    as_pass  VARCHAR(255) NOT NULL,                            -- plain text for dev; hash for prod
    as_role  VARCHAR(20)  NOT NULL CHECK (as_role IN ('admin', 'user'))
);

CREATE TABLE vehicle_image (
    image_id   SERIAL PRIMARY KEY,
    vehicle_id INT          NOT NULL REFERENCES vehicle(vehicle_id),
    image_path VARCHAR(255) NOT NULL,
    sort_order INT          DEFAULT 0
);

-- Seed data for testing
INSERT INTO app_user (as_name, as_pass, as_role) VALUES
  ('admin', 'admin', 'admin'),
  ('user',  'user',         'user'),
  ('test', 'test', 'admin');
```

---

## 4. main.py Design

```python
class CustomOden(Oden):

    def authenticate(self):
        # Dev mode: bypass SSO, return dummy session
        return True, {
            "nik": "dev",
            "attributes": {"name": "Dev User", "company_code": "01"}
        }

    def authorize(self, menuId):
        return True, {
            "access_menu": {
                "status_access": {"delete": "Y", "insert": "Y", "update": "Y"},
                "success": True
            }
        }

    def index(self):
        # Landing page → serve LOGIN.html directly
        # If already logged in → redirect to VEHICLE_LIST
        if session.get("loggedId"):
            return redirect("/?type=CUSTOM_VIEW&menuId=VEHICLE_LIST")
        html = fileToString('./templates/LOGIN.html')
        return html

    def customView(self, menuId, html):
        # Inject sidebar into authenticated pages
        if menuId in ("VEHICLE_LIST", "VEHICLE_ADD"):
            sidebarHtml = fileToString('./templates/common/sidebar.html')
            html = html.replace("[SIDEBAR]", sidebarHtml)
        return html

    def view(self, menuId, html):
        # No standard Webix forms in this app
        return html

CustomOden.name = "VDMS"
CustomOden(host='0.0.0.0', port=8000, debug=True)
```

---

## 5. API Design

### callAPI helper (used in all HTML templates)
```javascript
function callAPI(menuId, apiName, data = {}) {
    return $.ajax({
        url: '/',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ "type": "API", "menuId": menuId, "data": data, "apiName": apiName }),
        dataType: 'json'
    });
}
```

### LOGIN.py — API Functions

| Function | Trigger | Input | Output |
|----------|---------|-------|--------|
| `login_LOGIN` | Sign In button | `{username, password}` | `{status, data: {role, name}, msg}` |
| `logout_LOGIN` | Log Out link | `{}` | `{status, msg}` — clears session |

**login_LOGIN logic:**
```
SELECT as_id, as_name, as_role FROM app_user 
WHERE as_name = %(username)s AND as_pass = %(password)s
```
- Found → set `session["loggedId"] = {nik: as_name, role: as_role, name: as_name}` → return `{status: true, data: {role, name}}`
- Not found → return `{status: false, msg: "Invalid credentials"}`

### VEHICLE_LIST.py — API Functions

| Function | Trigger | Input | Output |
|----------|---------|-------|--------|
| `getVehicles_VEHICLE_LIST` | Page load, filter change | `{search, brand, type, availability, page}` | `{status, data: {vehicles: [...], total, page, per_page}, msg}` |
| `getBrands_VEHICLE_LIST` | Page load (populate dropdown) | `{}` | `{status, data: [{brand}], msg}` |
| `getVehicleDetail_VEHICLE_LIST` | Row click | `{vehicle_id}` | `{status, data: {vehicle, images: [...]}, msg}` |
| `deleteVehicle_VEHICLE_LIST` | Confirm delete | `{vehicle_id}` | `{status, msg}` |

**getVehicles_VEHICLE_LIST SQL pattern:**
```sql
SELECT
    v.vehicle_id::text         AS vehicleid,
    v.vehicle_type             AS vehicletype,
    v.vehicle_brand            AS vehiclebrand,
    v.vehicle_name             AS vehiclename,
    v.vehicle_trim             AS vehicletrim,
    v.vehicle_year::text       AS vehicleyear,
    v.vehicle_price::text      AS vehicleprice,
    v.vehicle_is_new::text     AS vehicleisnew,
    v.vehicle_mileage::text    AS vehiclemileage,
    v.vehicle_image_path       AS vehicleimagepath,
    v.vehicle_availability::text AS vehicleavailability,
    vi.image_path              AS firstimage
FROM vehicle v
LEFT JOIN vehicle_image vi ON vi.vehicle_id = v.vehicle_id
    AND vi.sort_order = (SELECT MIN(sort_order) FROM vehicle_image WHERE vehicle_id = v.vehicle_id)
WHERE v.vehicle_is_deleted = false
  AND (%(search)s = '' OR v.vehicle_brand ILIKE %(searchlike)s OR v.vehicle_name ILIKE %(searchlike)s OR v.vehicle_trim ILIKE %(searchlike)s)
  AND (%(brand)s = '' OR v.vehicle_brand = %(brand)s)
  AND (%(type)s = '' OR v.vehicle_type = %(type)s)
  AND (%(availability)s = '' OR v.vehicle_availability::text = %(availability)s)
ORDER BY v.vehicle_id DESC
OFFSET %(offset)s LIMIT 8
```

### VEHICLE_ADD.py — API Functions

| Function | Trigger | Input | Output |
|----------|---------|-------|--------|
| `getVehicleForEdit_VEHICLE_ADD` | Edit page load | `{vehicle_id}` | `{status, data: {vehicle, images}, msg}` |
| `saveVehicle_VEHICLE_ADD` | Save Vehicle button | `{type, brand, name, trim, year, price, condition, is_new, mileage, availability, images: [...]}` | `{status, data: {vehicle_id}, msg}` |
| `updateVehicle_VEHICLE_ADD` | Update Vehicle button | `{vehicle_id, type, brand, name, trim, year, price, condition, is_new, mileage, availability, images: [...]}` | `{status, msg}` |
| `removeVehicle_VEHICLE_ADD` | Remove Vehicle button | `{vehicle_id}` | `{status, msg}` |

**saveVehicle_VEHICLE_ADD logic:**
1. Validate required fields server-side
2. INSERT INTO vehicle (...) VALUES (...) RETURNING vehicle_id
3. For each image path in images array: INSERT INTO vehicle_image (vehicle_id, image_path, sort_order)
4. Return `{status: true, data: {vehicle_id: new_id}}`

---

## 6. Template Design

### shared: templates/common/sidebar.html

Injected via `[SIDEBAR]` placeholder. Contains:
- VDMS logo + brand name
- Navigation links (rendered with JS based on `window.VDMS_CONFIG.role`)
- Bottom section: signed-in user, role badge, Log Out button

The sidebar reads `window.VDMS_CONFIG` which each page sets:
```html
<script>
window.VDMS_CONFIG = {
    role: "[USER_ROLE]",      // replaced by Oden framework via session
    name: "[USER_NAME]",
    menuId: "VEHICLE_LIST"
}
</script>
```
Oden auto-replaces `[USER_NIK]` and `[USER_NAMA]` — we use those placeholders.

### templates/LOGIN.html

Structure:
```
<body class="bg-[#0f172a] min-h-screen flex items-center justify-center">
  <div class="bg-white rounded-xl shadow-lg w-96 p-8">
    <!-- Logo + title -->
    <!-- Username input -->
    <!-- Password input -->
    <!-- Sign In button -->
    <!-- Demo credentials hint -->
  </div>
  <script> callAPI + form submit handler </script>
```

No sidebar, no Oden session check needed (public page).

### templates/VEHICLE_LIST.html

Structure:
```
<body class="bg-gray-50 flex h-screen">
  [SIDEBAR]                          ← injected by customView()
  <div class="flex-1 flex flex-col overflow-hidden">
    <!-- Header: title + count + Add Vehicle button -->
    <!-- Filter bar: search + 3 dropdowns -->
    <!-- Table: PHOTO, TITLE, TYPE, PRICE, AVAILABILITY, ACTIONS -->
    <!-- Pagination -->
  </div>
  <!-- Detail Modal (hidden by default) -->
  <script>
    window.VDMS_CONFIG = {role: "[USER_ROLE]", name: "[USER_NAMA]"}
    // page load → getBrands + getVehicles
    // filter change handlers
    // row click → getVehicleDetail → show modal
    // delete handler → Swal confirm → deleteVehicle
  </script>
```

Role-based visibility via JS after page load:
```javascript
if (window.VDMS_CONFIG.role !== 'admin') {
    document.querySelectorAll('[data-admin-only]').forEach(el => el.classList.add('hidden'))
}
```

### templates/VEHICLE_ADD.html

Structure:
```
<body class="bg-gray-50 flex h-screen">
  [SIDEBAR]
  <div class="flex-1 overflow-y-auto p-8">
    <!-- Header: Add/Edit title + live title preview -->
    <form id="vehicleForm">
      <!-- BASIC INFORMATION section -->
      <!-- PRICING & CONDITION section -->
      <!-- VEHICLE PHOTOS section -->
      <!-- AVAILABILITY section -->
    </form>
    <!-- Footer: Save/Update + Cancel + Remove (edit mode) -->
  </div>
  <script>
    const EDIT_MODE = /* from URL param ?id=X */
    // if EDIT_MODE → getVehicleForEdit → prefill form
    // live title preview on input
    // condition toggle → enable/disable mileage
    // image upload preview
    // form submit → saveVehicle or updateVehicle
  </script>
```

Edit mode detection:
```javascript
const urlParams = new URLSearchParams(window.location.search)
const vehicleId = urlParams.get('id')
const EDIT_MODE = vehicleId !== null
```

---

## 7. Image Upload Design

**Development**: files saved to `static/uploads/vehicles/`
- Served as static files via Flask: `<img src="/static/uploads/vehicles/filename.jpg">`
- File naming: `vehicle_{timestamp}_{originalname}`

**Upload flow (VEHICLE_ADD.html):**
1. User selects file via `<input type="file" accept="image/jpeg,image/png,image/webp">`
2. JS reads file, sends as base64 or FormData to a custom upload endpoint
3. Backend saves file, returns `{path: "static/uploads/vehicles/filename.jpg"}`
4. JS shows thumbnail preview
5. On Save Vehicle, image paths collected and sent with main form data

---

## 8. Price Formatting

```javascript
function formatRupiah(value) {
    const num = parseFloat(value) || 0
    return 'Rp ' + num.toLocaleString('id-ID')
}
// "Rp 650.000.000"
```

---

## 9. Pagination Design

**Server-side with OFFSET/LIMIT:**
```
page=1 → OFFSET 0  LIMIT 8
page=2 → OFFSET 8  LIMIT 8
page=N → OFFSET (N-1)*8  LIMIT 8
```

**State tracked client-side:**
```javascript
let currentPage = 1
let totalRecords = 0
const PER_PAGE = 8
```

**Count query runs in parallel with data query:**
```sql
SELECT COUNT(*) AS total FROM vehicle
WHERE vehicle_is_deleted = false
  AND (same filters as data query)
```

**Pagination UI:**
- "Showing 1-8 of 12"
- `< 1 2 >` buttons
- Active page highlighted (dark navy)
- Prev/Next disabled at boundaries

---

## 10. Session Auth Guard

Every `@exposeApi` function in `VEHICLE_LIST.py` and `VEHICLE_ADD.py` starts with:
```python
@exposeApi
def getVehicles_VEHICLE_LIST():
    if not session.get("loggedId"):
        return {"status": False, "data": {}, "msg": "Unauthorized"}
    # ... rest of function
```

Frontend universal handler:
```javascript
function callAPI(menuId, apiName, data = {}) {
    return $.ajax({...}).then(function(response) {
        if (response.msg === "Unauthorized") {
            window.location.href = "/?type=CUSTOM_VIEW&menuId=LOGIN"
        }
        return response
    })
}
```

Admin-only guard in VEHICLE_ADD.py:
```python
loggedId = session.get("loggedId", {})
if loggedId.get("role") != "admin":
    return {"status": False, "data": {}, "msg": "Forbidden"}
```

---

## 11. staticOdenMenu.py

```python
menu = [
    ['LOGIN',        'Login',        ''],
    ['VEHICLES',     'Vehicles',     ''],
    ['VEHICLE_LIST', 'Vehicles',     'VEHICLES'],
    ['VEHICLE_ADD',  'Add Vehicle',  'VEHICLES'],
]
```

Note: `LOGIN` has no parent (empty string) — Oden requires a `.py` file for root menu items. `LOGIN.py` fulfills this.

---

## 12. CDN Dependencies

All loaded via CDN in every template `<head>`:

```html
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com"></script>

<!-- SweetAlert2 -->
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

<!-- jQuery (for callAPI) -->
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
```

No other external dependencies. No build step required.

---

## 13. Component Breakdown per File

### application/LOGIN.py
- `login_LOGIN()` — authenticate user, set session
- `logout_LOGIN()` — clear session
- `execVcount = ""`

### application/VEHICLE_LIST.py
- `getVehicles_VEHICLE_LIST()` — paginated list with filters
- `getBrands_VEHICLE_LIST()` — distinct brands for dropdown
- `getVehicleDetail_VEHICLE_LIST()` — single vehicle + images for modal
- `deleteVehicle_VEHICLE_LIST()` — soft delete (admin only)
- `execVcount = ""`

### application/VEHICLE_ADD.py
- `getVehicleForEdit_VEHICLE_ADD()` — fetch existing vehicle data
- `saveVehicle_VEHICLE_ADD()` — INSERT vehicle + images
- `updateVehicle_VEHICLE_ADD()` — UPDATE vehicle + sync images
- `removeVehicle_VEHICLE_ADD()` — soft delete from edit page (admin only)
- `uploadVehicleImage_VEHICLE_ADD()` — handle single image upload, return path
- `execVcount = ""`

### templates/LOGIN.html
- Centered login card on dark navy background
- callAPI → login_LOGIN
- On success: `window.location.href = '/?type=CUSTOM_VIEW&menuId=VEHICLE_LIST'`
- On fail: Swal.fire error

### templates/VEHICLE_LIST.html
- `[SIDEBAR]` placeholder
- `window.VDMS_CONFIG` injection
- `loadVehicles(page)` — main data loader
- `loadBrands()` — populate brand dropdown
- `openDetailModal(vehicleId)` — load + show modal
- `confirmDelete(vehicleId, title)` — Swal confirm → deleteVehicle
- Role-based DOM hiding for admin-only elements

### templates/VEHICLE_ADD.html
- `[SIDEBAR]` placeholder
- `window.VDMS_CONFIG` injection
- Edit mode detection from URL `?id=X`
- `updateTitlePreview()` — live preview
- `toggleCondition(type)` — enable/disable mileage
- `handleImageUpload(file)` — upload + show preview
- `submitVehicle()` — validate + call saveVehicle or updateVehicle
- `confirmRemove(vehicleId)` — soft delete from edit page

### templates/common/sidebar.html
- VDMS logo + "Dealer Management" text
- Nav links: always "Vehicles" link, conditionally "Add Vehicle" (hidden via JS for non-admin)
- Bottom: `[USER_NAMA]` display, role badge, Log Out button → calls logout_LOGIN → redirect to LOGIN
