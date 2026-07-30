# Custom Oden Framework Development Guide

## 1. Overview

Custom Oden extends the standard Oden Framework to support custom HTML templates while maintaining the same Python backend structure. You get full frontend freedom (Tailwind, Bootstrap, ShadCN, vanilla) with the same security model, routing, and database utilities.

**When to use Custom Oden instead of Standard Oden:**
- Dashboard/reporting views
- Mobile-first responsive apps
- Complex UI that Webix can't easily handle
- Multi-role apps with different layouts per role
- Apps with state machines (approval flows, workflows)

---

## 2. Technical Setup

### File Structure

```
project/
├── main.py                    # Oden v1.2 initialization + CustomOden overrides
├── globalVar.py               # Configuration
├── templates/                 # Custom HTML templates (MENU_ID.html)
├── templates/common/          # Shared partials (head, navbar, sidebar, footer)
├── application/               # Python backend (MENU_ID.py)
├── static/                    # Static assets
└── config/Connection2.cfg     # Database connection
```

### Mandatory Rules (Non-Negotiable)

| Rule | Why |
|------|-----|
| `execVcount = ""` in every `.py` file | Framework crashes without it |
| `@exposeApi` on every function | Framework won't discover the function |
| Menu registered in `staticOdenMenu.py` | Menu won't appear |
| Function naming: `functionName_MENU_ID` | Framework routing convention |
| Template naming: `templates/MENU_ID.html` (uppercase) | Auto-serving by Oden v1.2 |

### How Oden Routing Works (CustomOden hooks)

The `Oden` base class exposes three override hooks. Understanding which one to use is critical:

| Hook | When called | Use for |
|------|-------------|---------|
| `index(self)` | User hits `GET /` with no `?type` param | **Landing page** — return HTML directly to serve as the app home |
| `customView(self, menuId, html)` | `GET /?type=CUSTOM_VIEW&menuId=X` | **Inject shared partials** into a template (head, sidebar, navbar, footer) |
| `view(self, menuId, html)` | `GET /?type=VIEW&menuId=X` | **Intercept standard Webix views** — can redirect to CUSTOM_VIEW if needed |

### main.py Setup — Complete Example

```python
from flask import request, redirect

def getLibrary(param):
    with open(f"common/{param}.py", "r") as file:
        exec(file.read(), globals())

getLibrary("satlog")
getLibrary("satgetdatetime")
getLibrary("saturl")
getLibrary("satssowebclientnd")
getLibrary("satconnectserver2RO")
getLibrary("satconnectserver2")
getLibrary("lib_errorCodePG")
getLibrary("utilities_v1.2")
getLibrary("base")
getLibrary("satconnectredis")
getLibrary("satconnectbucket")
getLibrary("oden_v1.2")

class CustomOden(Oden):

    def authenticate(self):
        return True, {
            "nik": "admin",
            "attributes": {"name": "App Admin", "company_code": "01"}
        }

    def authorize(self, menuId):
        userAttributes = {
            "access_menu": {
                "status_access": {"delete": "Y", "insert": "Y", "update": "Y"},
                "success": True
            }
        }
        return True, userAttributes['access_menu']

    def index(self):
        """
        Landing page — called when user hits GET / with no params.
        Read the template manually, inject partials, return HTML string.
        Return False to fall back to default Oden home screen.
        """
        menuId = "MY_DASHBOARD"
        dynamicVal = fileToString(f'./templates/{menuId}.html')
        headHtml = fileToString(f'./templates/common/head_admin.html')
        headHtml = headHtml.replace("[MENUID]", menuId)
        sidebarHtml = fileToString(f'./templates/common/sidebar_admin.html')
        dynamicVal = dynamicVal.replace("[HEAD]", headHtml)
        dynamicVal = dynamicVal.replace("[SIDEBAR]", sidebarHtml)
        return dynamicVal

    def customView(self, menuId, html):
        """
        Called for every GET /?type=CUSTOM_VIEW&menuId=X request.
        Use to inject shared partials into the template HTML.
        The framework already replaces [USER_NIK], [USER_NAMA], [USER_MENU].
        """
        if menuId.startswith("ADMIN_"):
            # Admin layout: head + sidebar
            headHtml = fileToString(f'./templates/common/head_admin.html')
            headHtml = headHtml.replace("[MENUID]", menuId)
            sidebarHtml = fileToString(f'./templates/common/sidebar_admin.html')
            html = html.replace("[HEAD]", headHtml)
            html = html.replace("[SIDEBAR]", sidebarHtml)
        else:
            # User layout: head + navbar + footer
            headHtml = fileToString(f'./templates/common/head_user.html')
            headHtml = headHtml.replace("[MENUID]", menuId)
            navbarHtml = fileToString(f'./templates/common/navbar_user.html')
            footerHtml = fileToString(f'./templates/common/footer_user.html')
            html = html.replace("[HEAD]", headHtml)
            html = html.replace("[NAVBAR]", navbarHtml)
            html = html.replace("[FOOTER]", footerHtml)
        return html

    def view(self, menuId, html):
        """
        Called for standard Webix views (GET /?type=VIEW&menuId=X).
        Use ONLY when a standard Webix menu needs to redirect to a custom view.
        Return html unchanged for all other standard forms.
        """
        if menuId in ("SPECIAL_FORM_A", "SPECIAL_FORM_B"):
            return redirect(f"/?type=CUSTOM_VIEW&menuId={menuId}")
        return html

CustomOden.name = "App Name"
CustomOden(host='0.0.0.0', port=8000, debug=True)
```

### When to Use Each Hook

```
Use index()       → app has a single landing page / dashboard as home
Use customView()  → multiple menus share the same layout partials (head/sidebar/footer)
Use view()        → a standard Webix menu ID needs to serve as a custom view instead
```

### Simple App (Single Custom View as Home — No Shared Partials)

```python
def index(self):
    dynamicVal = fileToString('./templates/DOCS.html')
    return dynamicVal
    # Framework auto-replaces [USER_NIK], [USER_NAMA], [USER_MENU]
```

### How the Framework Serves Custom Views

When `GET /?type=CUSTOM_VIEW&menuId=MENU_ID` is called:
1. Framework execs `application/MENU_ID.py` (loads `@exposeApi` functions)
2. Reads `templates/MENU_ID.html` as string
3. Calls `self.customView(menuId, html)` — your hook to inject partials
4. Replaces `[USER_NIK]`, `[USER_NAMA]`, `[USER_MENU]` automatically
5. Returns final HTML to browser

### Frontend API Pattern

**CRITICAL**: Always append `_MENU_ID` to the API name in JavaScript calls.

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

**JavaScript API Call Pattern:**
```javascript
// ✅ CORRECT - apiName includes menuId suffix
callAPI('INDEX', 'getDashboardStats_INDEX', {})

// ❌ WRONG - missing menuId suffix
callAPI('INDEX', 'getDashboardStats', {})
```

**Common mistake**: Forgetting to append `_MENU_ID` to the `apiName` parameter. The framework requires this for routing.

### Python Backend Pattern

**Function naming MUST match the apiName from JavaScript:**

```python
@exposeApi
def getData_MENU_ID():
    """
    Function name = apiName from JavaScript callAPI()
    Pattern: functionName_MENU_ID
    """
    ajaxData = request.json.get("data")
    # Business logic
    return {"status": True, "data": result, "msg": ""}

execVcount = ""
```

**Naming Convention Examples:**
```python
# Dashboard menu (INDEX)
@exposeApi
def getDashboardStats_INDEX():
    pass

# Job Master menu (JOB_MASTER_ADD_ND)
@exposeApi
def saveJobMaster_JOB_MASTER_ADD_ND():
    pass

# Job Posting menu (LIST_JOB_POSTING)
@exposeApi
def filterJobPostings_LIST_JOB_POSTING():
    pass
```

---

## 3. Critical Rules & Gotchas

### 3.1 Data Type Serialization

PostgreSQL returns Python native types that are NOT JSON serializable. Cast them in SQL:

| PostgreSQL Type | Problem | Fix |
|----------------|---------|-----|
| `date` | Returns `datetime.date` | `column::text as alias` |
| `time` | Returns `datetime.time` | `column::text as alias` |
| `timestamp` | Returns `datetime.datetime` | `column::text as alias` |
| `numeric` | Returns `Decimal` | `column::text as alias` or `column::float` |
| `interval` | Returns `timedelta` | `column::text as alias` |

```python
# ❌ WRONG - crashes: "Object of type date is not JSON serializable"
sql = "select order_date, start_time from schema.orders"

# ✅ CORRECT
sql = "select order_date::text as orderdate, start_time::text as starttime from schema.orders"
```

### 3.2 NULL Handling

PostgreSQL NULL → Python `None` → JSON `null`. Always guard in frontend:

```javascript
const venue = item.venue || '-';
const remark = item.remark || 'No remark';
```

### 3.3 SQL String Escaping

Escape single quotes to prevent SQL errors (and basic injection):

```python
title = ajaxData.get("title", "").replace("'", "''")
sql = "INSERT INTO schema.table (col) VALUES ('%s')" % title
```

### 3.4 API Return Contract

Every `@exposeApi` function MUST return:

```python
# Success
return {"status": True, "data": {...} or [...], "msg": ""}

# Failure
return {"status": False, "data": {}, "msg": "Human-readable error"}
```

### 3.5 Database Functions Available

| Function | Use Case |
|----------|----------|
| `selectHeaderQueryRO(sql)` | Read-only, no params → `[{dict}]` |
| `selectDataHeaderQueryRO(sql, params)` | Read-only with bind params |
| `executeQuery(sql)` | INSERT/UPDATE/DELETE without params |
| `executeDataQuery(sql, params)` | INSERT/UPDATE/DELETE with bind params |

---

## 4. Spec-Driven Development Process

**Before writing ANY code, define these specs.** Missing specs = missing features at runtime.

### 4.1 State Machine

Required for any app that has a status/workflow field.

**Define:**
- All possible states
- What action transitions between states
- Who performs each action
- Who gets notified after each transition
- What each actor sees in each state

**Template:**

| Current State | Action | Actor | New State | Notify | What Actor Sees Next |
|---------------|--------|-------|-----------|--------|---------------------|
| (none) | Create | Role A | DRAFT | - | Success message, redirect to list |
| DRAFT | Submit | Role A | PENDING | Role B | "New request" notification |
| PENDING | Approve | Role B | APPROVED | Role A | "Approved" notification |
| PENDING | Reject | Role B | REJECTED | Role A | "Rejected + reason" notification |
| REJECTED | Revise | Role A | PENDING | Role B | "Revised request" notification |

**Rule**: Every row = one API endpoint + one DB update + one UI response. If you can't fill a cell, the feature is undefined.

### 4.2 Role-Screen Matrix

Required for any app with multiple user roles.

**Define:**
- Which screens each role can access
- Which actions each role can perform per screen
- How the frontend hides/shows elements per role

**Template:**

| Screen | Role A | Role B | Role C |
|--------|--------|--------|--------|
| Dashboard | ✅ See all data + Create button | ✅ Own data only | ❌ No access |
| Detail | ✅ View + Edit | ✅ View + Approve/Reject | ✅ View only |
| Admin | ❌ | ❌ | ✅ Full access |

### 4.3 Per-Screen Contract

Required for every template file. Defines what the screen loads, shows, and does.

**Template:**

```markdown
## Screen: MENU_ID

### Init (on page load)
- API call: functionName_MENU_ID({params})
- Renders: [describe what appears]

### Visual States
| Data Condition | What User Sees |
|----------------|---------------|
| Loading | Spinner or skeleton |
| Empty result | Placeholder message |
| Has data | List/cards/table with items |
| API error | Error message |

### User Actions
| Action | Trigger | API Call | On Success | On Failure |
|--------|---------|----------|------------|------------|
| (describe) | click/change | function_MENU | (result) | (error msg) |

### Role Differences
- Role A: sees X, can do Y
- Role B: sees X, cannot do Y, sees Z instead
```

### 4.4 End-to-End Flow Chains

Required for every business process that crosses screens or roles.

**Template:**

```
FLOW: [Name of the flow]

1. [Actor] opens [Screen]
2. [Actor] performs [action]
   → API: functionName_MENU_ID
   → DB: [what changes]
   → UI: [what user sees after]
3. [Other Actor] opens [Screen]
   → Sees: [specific data/state that proves step 2 worked]
4. [Other Actor] performs [action]
   → API: ...
   → DB: ...
   → UI: ...
(continue until flow is complete)
```

**Rule**: If you can't trace "what does the OTHER user see after this action?" for every step, the spec is incomplete. This catches 90% of missing features.

---

## 5. Implementation Checklist

### Before Writing Code

- [ ] State machine defined (if app has status fields)
- [ ] Role-screen matrix defined (if app has multiple roles)
- [ ] Per-screen contracts for all templates
- [ ] End-to-end flows for all business processes
- [ ] DDL finalized with sample data
- [ ] API list with input/output per function

### Per Template (repeat for each MENU_ID)

- [ ] `application/MENU_ID.py` — `@exposeApi` functions + `execVcount = ""`
- [ ] `templates/MENU_ID.html` — UI with `callAPI()` calls
- [ ] SQL queries use `::text` for date/time/timestamp/numeric
- [ ] NULL handled in frontend (`|| 'default'`)
- [ ] Loading state during API calls
- [ ] Error state when API returns `status: false`
- [ ] Role-based visibility implemented (show/hide per role)

### Integration

- [ ] `main.py` → `index()` overridden if app has a custom landing page
- [ ] `main.py` → `customView()` overridden if templates share common partials (head/sidebar/footer)
- [ ] `main.py` → `view()` overridden ONLY if standard Webix menus need to redirect to custom views
- [ ] `staticOdenMenu.py` → menu tree registered
- [ ] `Connection2.cfg` → correct DB alias (7 fields: alias, dbname, host, user, pass, port, schema)
- [ ] `globalVar.py` → `DB_NAME` matches alias in Connection2.cfg

### Testing (Per Flow, Not Per API)

- [ ] Each end-to-end flow works from start to finish
- [ ] Each role sees correct screens and actions
- [ ] Each status renders correctly (badge, color, available actions)
- [ ] Cross-role visibility works (action by Role A → visible to Role B)
- [ ] Empty states show placeholder, not blank screen
- [ ] Error states show message, not crash

---

## 6. Common Patterns

### Default Alert: SweetAlert2

All custom views MUST use SweetAlert2 instead of native `alert()` / `confirm()`.

**Include in every template `<head>`:**
```html
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
```

**Standard usage:**

```javascript
// Success
Swal.fire({ icon: 'success', title: 'Success', text: 'Data saved successfully', timer: 2000, showConfirmButton: false });

// Error
Swal.fire({ icon: 'error', title: 'Error', text: response.msg || 'Something went wrong' });

// Confirm before action (delete, reject, etc.)
Swal.fire({
    title: 'Are you sure?',
    text: 'This action cannot be undone',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Yes, proceed'
}).then((result) => {
    if (result.isConfirmed) {
        // do action
    }
});

// Toast (non-blocking notification)
const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
Toast.fire({ icon: 'success', title: 'Saved' });
```

**Rule**: Never use native `alert()`, `confirm()`, or `prompt()`. They block the thread and look inconsistent across browsers.

### Role-Based Rendering

```javascript
const CONFIG = { nik: "USER001", role: "ROLE_A", name: "User Name" };

function applyRoleVisibility() {
    document.querySelectorAll('[data-role]').forEach(el => {
        const allowed = el.dataset.role.split(',');
        if (!allowed.includes(CONFIG.role)) el.classList.add('hidden');
    });
}
```

```html
<button data-role="SECRETARY" onclick="addNew()">Add New</button>
<button data-role="DIRECTOR" onclick="approve()">Approve</button>
```

### Status Badge

```javascript
function statusBadge(status) {
    const map = {
        'P': { label: 'Pending', cls: 'bg-yellow-100 text-yellow-800' },
        'A': { label: 'Approved', cls: 'bg-green-100 text-green-800' },
        'R': { label: 'Rejected', cls: 'bg-red-100 text-red-800' }
    };
    const s = map[status] || { label: status, cls: 'bg-gray-100 text-gray-800' };
    return `<span class="text-xs px-2 py-1 rounded-full ${s.cls}">${s.label}</span>`;
}
```

### Loading + Error Handling

**CRITICAL**: Always append `_MENU_ID` to API names.

```javascript
function loadData(containerId, menuId, apiName, data) {
    const el = document.getElementById(containerId);
    el.innerHTML = '<div class="text-center py-8 text-gray-400">Loading...</div>';

    // ✅ CORRECT - apiName includes _menuId suffix
    callAPI(menuId, apiName + '_' + menuId, data).done(function(r) {
        if (r.status) {
            renderData(el, r.data);
        } else {
            el.innerHTML = `<div class="text-center py-8 text-red-400">${r.msg || 'Error loading data'}</div>`;
        }
    }).fail(function() {
        el.innerHTML = '<div class="text-center py-8 text-red-400">Network error</div>';
    });
}

// Example usage
loadData('dashboardStats', 'INDEX', 'getDashboardStats', {});
// This calls: callAPI('INDEX', 'getDashboardStats_INDEX', {})
```

### Complete API Call Examples

**Pattern 1: Dashboard loading stats**
```javascript
// Page initialization
const menuId = 'INDEX';

$(document).ready(function() {
    // ✅ CORRECT
    callAPI(menuId, 'getDashboardStats_' + menuId, {})
        .done(function(response) {
            if (response.status) {
                updateStatCards(response.data);
            }
        });
    
    // ❌ WRONG - missing _INDEX suffix
    // callAPI(menuId, 'getDashboardStats', {})
});
```

**Pattern 2: Form submission**
```javascript
// Submit button click
function submitForm() {
    const menuId = 'JOB_MASTER_ADD_ND';
    const formData = getFormData();
    
    // ✅ CORRECT
    callAPI(menuId, 'saveJobMaster_' + menuId, formData)
        .done(function(response) {
            if (response.status) {
                Swal.fire({ icon: 'success', title: 'Saved!' });
            } else {
                Swal.fire({ icon: 'error', text: response.msg });
            }
        });
    
    // ❌ WRONG - missing _JOB_MASTER_ADD_ND suffix
    // callAPI(menuId, 'saveJobMaster', formData)
}
```

**Pattern 3: List filtering**
```javascript
// Filter button click
function applyFilters() {
    const menuId = 'LIST_JOB_POSTING';
    const filters = {
        division: $('#divisionFilter').val(),
        department: $('#departmentFilter').val(),
        status: $('#statusFilter').val()
    };
    
    // ✅ CORRECT
    callAPI(menuId, 'filterJobPostings_' + menuId, filters)
        .done(function(response) {
            if (response.status) {
                renderTable(response.data);
            }
        });
    
    // ❌ WRONG - missing _LIST_JOB_POSTING suffix
    // callAPI(menuId, 'filterJobPostings', filters)
}
```

**Pattern 4: Delete with confirmation**
```javascript
function deleteRecord(id) {
    const menuId = 'MS_GROUPING';
    
    Swal.fire({
        title: 'Are you sure?',
        text: 'This will delete the record permanently',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it'
    }).then((result) => {
        if (result.isConfirmed) {
            // ✅ CORRECT
            callAPI(menuId, 'deleteGrouping_' + menuId, { id: id })
                .done(function(response) {
                    if (response.status) {
                        Swal.fire({ icon: 'success', title: 'Deleted!' });
                        refreshTable();
                    } else {
                        Swal.fire({ icon: 'error', text: response.msg });
                    }
                });
            
            // ❌ WRONG - missing _MS_GROUPING suffix
            // callAPI(menuId, 'deleteGrouping', { id: id })
        }
    });
}
```

**Pattern 5: Dependent dropdown (cascading)**
```javascript
// When division changes, load departments
function onDivisionChange() {
    const menuId = 'JOB_MASTER_ADD_ND';
    const divisionId = $('#division').val();
    
    // ✅ CORRECT
    callAPI(menuId, 'getDepartments_' + menuId, { divisionId: divisionId })
        .done(function(response) {
            if (response.status) {
                populateDepartmentDropdown(response.data);
            }
        });
    
    // ❌ WRONG - missing _JOB_MASTER_ADD_ND suffix
    // callAPI(menuId, 'getDepartments', { divisionId: divisionId })
}
```

### Matching Python Backend Functions

**Each JavaScript call MUST have matching Python function:**

```python
# Dashboard
@exposeApi
def getDashboardStats_INDEX():
    sql = "select count(*) as total from schema.jobs"
    result = selectHeaderQueryRO(sql)
    return {"status": True, "data": result["data"], "msg": ""}

# Form submission
@exposeApi
def saveJobMaster_JOB_MASTER_ADD_ND():
    ajaxData = request.json.get("data")
    # Save logic
    return {"status": True, "data": {}, "msg": "Saved successfully"}

# List filtering
@exposeApi
def filterJobPostings_LIST_JOB_POSTING():
    ajaxData = request.json.get("data")
    division = ajaxData.get("division", "")
    department = ajaxData.get("department", "")
    # Filter logic
    return {"status": True, "data": results, "msg": ""}

# Delete
@exposeApi
def deleteGrouping_MS_GROUPING():
    ajaxData = request.json.get("data")
    record_id = ajaxData.get("id")
    # Delete logic
    return {"status": True, "data": {}, "msg": "Deleted"}

# Dependent dropdown
@exposeApi
def getDepartments_JOB_MASTER_ADD_ND():
    ajaxData = request.json.get("data")
    divisionId = ajaxData.get("divisionId")
    sql = "select dept_id, dept_name from schema.departments where div_id = %(div)s"
    result = selectDataHeaderQueryRO(sql, {"div": divisionId})
    return result

execVcount = ""
```

### Common Mistake Checklist

❌ **WRONG** - These will fail:
```javascript
callAPI('INDEX', 'getDashboardStats', {})              // Missing _INDEX
callAPI('LIST_JOB_POSTING', 'filterJobs', filters)     // Missing _LIST_JOB_POSTING
callAPI('MS_GROUPING', 'delete', {id: 1})              // Missing _MS_GROUPING
```

✅ **CORRECT** - These will work:
```javascript
callAPI('INDEX', 'getDashboardStats_INDEX', {})
callAPI('LIST_JOB_POSTING', 'filterJobs_LIST_JOB_POSTING', filters)
callAPI('MS_GROUPING', 'delete_MS_GROUPING', {id: 1})
```

### Rule Summary

1. **JavaScript**: `callAPI(menuId, 'functionName_' + menuId, data)`
2. **Python**: `@exposeApi` + `def functionName_MENU_ID():`
3. **Always append** `_MENU_ID` to API names
4. **Never forget** the underscore separator
5. **menuId matches** the file name (MENU_ID.py, MENU_ID.html)

### Auto-Generate ID (Backend)

```python
import datetime
record_id = "PREFIX" + datetime.datetime.now().strftime("%Y%m%d%H%M%S")
```

---

## 7. Conclusion

Custom Oden gives frontend freedom. But freedom without structure = incomplete features.

**The formula:**
1. **Spec first** — state machine + role matrix + per-screen contracts + flow chains
2. **Build per spec** — each screen contract = 1 template + 1 python file
3. **Test per flow** — not per API, test the full cross-role chain

**The test for completeness:** For every action in your app, you must be able to answer: "What does each role see after this action, in each possible state?" If you can't answer that from your spec, the spec is incomplete — and the app will be too.

