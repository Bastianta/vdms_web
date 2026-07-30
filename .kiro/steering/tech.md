---
inclusion: always
---

# Technology Stack

## Backend

- **Runtime**: Python 3.11 / 3.12
- **Framework**: Flask-based (via Oden library -- `oden_v1.2.py`)
- **Library Loading**: `exec()` -- semua library di-load ke global namespace
- **Session**: Redis (menyimpan object hierarchy per user session)
- **Database**: PostgreSQL
- **ORM**: Tidak ada -- raw SQL dengan bind parameters `%(param)s`

## Frontend

- **UI Library**: Custom Webix (loaded from CDN)
- **Language**: Vanilla JavaScript (no React/Vue/Angular)
- **Components**: FormLayout, DataGridLayout, Multiview, LOV, Combo, Button
- **API Communication**: `restapi.restApiSelect()`, `restapi.restApiCustom()`

## Infrastructure

### Development
- Local machine atau Compute Engine
- Redis: `127.0.0.1:6379`
- PostgreSQL: local atau remote
- CDN: `https://hocdnoden0201.sat.co.id/staging/v.1.2`
- `PRODUCTION_ODEN = "N"` (bypass auth, use CustomOden class)

### Production
- GCP Cloud Run (containerized)
- GCP Memorystore Redis (private IP)
- Cloud SQL PostgreSQL atau existing PostgreSQL
- `PRODUCTION_ODEN = "Y"` (SSO authentication, standard Oden class)

## Critical Constraints

### WAJIB DIIKUTI:
1. **NEVER use `import`** dalam file `application/` -- semua library sudah tersedia via `exec()`
2. **ALL custom functions MUST have `@exposeApi`** decorator
3. **itemId MUST be lowercase** -- no camelCase, no snake_case
4. **Audit columns NEVER get Item classes** -- hanya masuk `nonVisibleItems`
5. **Short descriptor minimum 4 characters** untuk Python class/variable names
6. **newInstance function WAJIB ada untuk SETIAP block** -- tanpa exception
7. **ELEMENT array di JS TIDAK boleh berisi foreign key** column child block
8. **REST_API.BLOCK_NAME = current block name**, bukan parent

### Database Functions (dari `utilities_v1.2.py`):

| Function | Connection | Bind Params | Returns |
|----------|-----------|-------------|---------|
| `selectHeaderQueryRO(sql)` | Read-only | No | `[{dict}]` |
| `selectHeaderQuery(sql)` | Read-write | No | `[{dict}]` |
| `selectDataHeaderQueryRO(sql, param)` | Read-only | Yes | `[{dict}]` |
| `selectDataHeaderQuery(sql, param)` | Read-write | Yes | `[{dict}]` |
| `selectQuery(sql)` | Read-write | No | `[(tuples)]` |
| `selectDataQuery(sql, param)` | Read-write | Yes | `[(tuples)]` |
| `selectDataQueryRO(sql, param)` | Read-only | Yes | `[(tuples)]` |
| `executeQuery(sql)` | Read-write | No | `{status, msg}` |
| `executeDataQuery(sql, param)` | Read-write | Yes | `{status, msg}` |

### Catatan Penting Database:
- Semua return value dari database adalah **string** (termasuk integer, date)
- Gunakan `int()` atau `float()` untuk perbandingan numerik di Python
- SQL aliases otomatis menjadi **lowercase tanpa underscore** (contoh: `emp_code as EMP_CODE` -> key `empcode`)

## Dependencies

- Redis server (port 6379)
- PostgreSQL server
- Python 3.x dengan Flask
- Browser modern (Chrome/Firefox/Edge) untuk frontend
