---
inclusion: always
---

# Project Structure

## Folder Layout

```
project/
|-- main.py                  # Entry point, load libraries via exec(), route setup
|-- globalVar.py             # Configuration (production flag, CDN URL, Redis, menu type)
|-- staticOdenMenu.py        # Menu tree definition (menu ID, nama form, parent)
|-- common/                  # Framework libraries (DO NOT MODIFY)
|   |-- oden_v1.2.py        # Core Oden class, routing, session management
|   |-- utilities_v1.2.py   # Utility functions (selectQuery, executeQuery, etc.)
|   `-- base.py             # Base classes (FormLayout, DataGridLayout, Record, Items)
|-- application/             # Python backend -- satu file per form (MENU_ID.py)
|-- static/application/      # JavaScript frontend -- satu file per form (MENU_ID.js)
|-- templates/               # Custom HTML views untuk Custom View (MENU_ID.html)
|-- config/                  # Database connection
|   |-- CreateConnection.py  # Generator config (run once)
|   `-- Connection2.cfg      # Encoded connection string (DO NOT COMMIT with real creds)
`-- Reference/               # Screenshots, DDL, documentation per form
    `-- MENU_ID/             # Subfolder per menu
```

## File Naming Conventions

| Location | Format | Example |
|----------|--------|---------|
| Python backend | `MENU_ID.py` (uppercase) | `EMPLOYEE_FORM.py`, `HRA_50.py` |
| JavaScript frontend | `MENU_ID.js` (match Python) | `EMPLOYEE_FORM.js`, `HRA_50.js` |
| Custom HTML template | `MENU_ID.html` (match Python) | `DASHBOARD_HRD.html` |

## Code Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Python class | `SHORTDESC_CBlockName` | `EMPF_CEmployeeHead` |
| Python item class | `SHORTDESC_Citemid` | `EMPF_Cempcode` |
| Python variable | `SHORTDESC_vBlockName` | `EMPF_vEmployeeHead` |
| itemId | lowercase, no underscore | `empcode`, `empname` |
| Database column | lowercase_with_underscore | `emp_code`, `emp_name` |
| Block name (JS/Python) | UPPERCASE_WITH_UNDERSCORE | `EMPLOYEE_HEAD` |
| Short descriptor | Min 4 chars, no underscore | `EMPF`, `HRA119`, `ORDM` |

## Architecture: Object Hierarchy

```
Container
`-- Form (actionActive: INSERT/UPDATE/DELETE)
    `-- Block (FormLayout or DataGridLayout)
        `-- Record (validation)
            `-- Item (field definition + validation)
```

Hierarchy disimpan di Redis session. Setiap form memiliki satu Container, satu Form, dan satu atau lebih Block.

## Menu Structure (staticOdenMenu.py)

```python
menu = [
    ['MENU_PARENT', 'Nama Group', ''],
    ['MENU_ID_1', 'Nama Form 1', 'MENU_PARENT'],
    ['MENU_ID_2', 'Nama Form 2', 'MENU_PARENT'],
]
# Index 0: menu ID
# Index 1: display name
# Index 2: parent menu ID (kosong = root) Jika root pastikan ada file py nya pada folder application, jika tidak saat di klik akan error
```
