---
inclusion: always
---

# Oden Framework Core Rules

This steering file contains the fundamental rules and principles for the Oden Framework. These rules MUST be followed for all form generation and development.

## Framework Overview

The Oden Framework is a Flask-based backend with Custom Webix frontend that uses:
- **Backend**: Python with exec-based library loading
- **Frontend**: Custom Webix JavaScript library
- **Session Management**: Redis for storing object hierarchy
- **Database**: PostgreSQL with encoded connection strings
- **Architecture**: Object-oriented with Container → Form → Block → Record → Item hierarchy

### Object Hierarchy and parentObj

Understanding the object hierarchy is CRITICAL for validation and accessing properties:

```
Container
└── Form (has actionActive: "INSERT", "UPDATE", "DELETE")
    └── Block (parentObj)
        └── Record (parentObj.parentObj)
            └── Item (parentObj.parentObj.parentObj)
```

**Accessing actionActive from different levels:**

```python
# From Block level
self.parentObj.actionActive  # Form is parent

# From Record level  
self.parentObj.parentObj.actionActive  # Record → Block → Form

# From Item level
self.parentObj.parentObj.parentObj.actionActive  # Item → Record → Block → Form
```

**Common use case - Check if INSERT mode in Item validation:**

```python
class FORM_Cempcode(TextPrimary):
    def validate(self):
        # Check only on INSERT to avoid false positives on UPDATE
        if self.parentObj.parentObj.parentObj.actionActive == "INSERT":
            # Check uniqueness
            sql = "select count(*) as count from table where code = %(code)s"
            result = selectHeaderQueryRO(sql, {"code": self.value})
            if result["data"][0]["count"] > 0:
                return {"status": False, "msg": "Code already exists"}
        
        return {"status": True, "msg": ""}
```

**IMPORTANT**: Always use the correct number of `parentObj` based on your current level in the hierarchy.

## Critical Rules

### 1. Library Loading (NEVER IMPORT)

**RULE**: Never use `import` statements in form files. All libraries are loaded via `exec()` in main.py.

```python
# ❌ WRONG - Never do this
from common.base import FormLayout
import requests

# ✅ CORRECT - Libraries already available via exec()
class MyBlock(FormLayout):  # FormLayout is already in globals()
    pass
```

**Why**: The `getLibrary()` function in main.py uses `exec()` to load all common libraries into the global namespace.

### 2. File Naming Conventions

**Backend (Python)**:
- Location: `application/`
- Format: `MENU_ID.py` (uppercase, underscores allowed)
- Example: `EMPLOYEE_FORM.py`, `HRA_50.py`

**Frontend (JavaScript)**:
- Location: `static/application/`
- Format: `MENU_ID.js` (must match Python filename exactly)
- Example: `EMPLOYEE_FORM.js`, `HRA_50.js`

**Custom Oden Templates**:
- Location: `templates/`
- Format: `MENU_ID.html` (must match Python filename)
- Example: `EMPLOYEE_FORM.html`

### 3. Class Naming Convention - Short Descriptor

**CRITICAL**: Python class and variable names MUST use SHORT DESCRIPTOR, not full menu ID.

```python
# Menu ID: EMPLOYEE_FORM → Short Descriptor: EMPF

# ✅ CORRECT
class EMPF_CEmployeeHead(FormLayout):
class EMPF_Cempcode(TextPrimary):
EMPF_vContainer = Container()

# ❌ WRONG
class EMPLOYEE_FORM_CEmployeeHead(FormLayout):  # Too long
class EMPLOYEE_FORM_Cempcode(TextPrimary):      # Too long
EMPLOYEE_FORM_vContainer = Container()          # Too long
```

**Short Descriptor Rules**:
- **Minimum 4 characters** (CRITICAL)
- Remove underscores
- Use meaningful abbreviation

**Examples**:
- `EMPLOYEE_FORM` → `EMPF` (4 chars)
- `HRA_119` → `HRA119` (6 chars)
- `MASTER_DATA_FORM` → `MDAF` (4 chars)
- `ORDER_MANAGEMENT` → `ORDM` (4 chars)
- `ORDER_FORM` → `ORDF` (4 chars)

**Reason**: Keeps code concise and readable while maintaining uniqueness.

### 4. Item ID Naming Convention

**CRITICAL**: All itemIds MUST be lowercase, no camelCase or snake_case.

```python
# ✅ CORRECT
class EMPF_Cempname(TextNormal):
    itemId = "empname"           # lowercase
    databaseColumn = "emp_name"  # database column can have underscores

# ❌ WRONG
itemId = "empName"    # camelCase - WRONG
itemId = "emp_name"   # snake_case - WRONG
```

**Reason**: Database responses are all lowercase, and itemIds must match for data binding.

### 5. Mandatory Components for Every Form

Every Oden form MUST have these components:

**Python File**:
1. Block classes (FormLayout or DataGridLayout)
2. Record classes (one per block)
3. Item classes (for each business column)
4. execVcount variable (object hierarchy)
5. newInstance functions (ONE per block - MANDATORY)
6. @exposeApi decorator on all custom functions

**JavaScript File**:
1. menuId variable
2. winFormTitle variable
3. winConfigForm object (block configuration)
4. winRestApi function
5. hideButton object
6. Element arrays (one per block)
7. Rules objects (one per block)
8. Block creation (form.SimpleForm or datatable.SimpleDatatable)
9. renderLov function (if LOV fields exist)
10. Layout definition

### 6. Audit Columns - DO NOT CREATE ITEMS

**CRITICAL**: Audit columns are managed by database triggers. DO NOT create Item classes for them.

**CRITICAL**: Oden Framework **REQUIRES BOTH** `createUser` AND `updateUser` in `nonVisibleItems`, even for INSERT-only tables. The database table MUST have both columns.

**Audit Column Patterns** (exclude from Item classes):
- Create/Update Date: `*_create_date`, `*_update_date`, `*_created_date`, `*_updated_date`, `*_modified_date`, `create_date`, `update_date`, `upd_date`, `crt_date`, `mod_date`
- Create/Update User: `*_create_user`, `*_update_user`, `*_created_by`, `*_updated_by`, `*_modified_by`, `create_user`, `update_user`, `upd_user`, `crt_user`, `mod_user`

**Database Schema Requirements**:
```sql
-- MUST have BOTH create_user AND update_user columns
CREATE TABLE example_table (
    id VARCHAR2(10) PRIMARY KEY,
    data VARCHAR2(100),
    create_at TIMESTAMP,
    create_user VARCHAR2(10),  -- REQUIRED
    update_user VARCHAR2(10)   -- REQUIRED (even if only INSERT operations)
);
```

```python
# ❌ WRONG - Never create Item classes for audit columns
class FORM_Ccreatedate(Calendar):
    itemId = "createdate"
    databaseColumn = "create_date"

# ❌ WRONG - Missing updateUser (will cause SQL error)
class FORM_CEmployeeBlock(FormLayout):
    def __init__(self, blockId):
        super().__init__(blockId)
        self.nonVisibleItems = [
            ["emp_create_user", "createUser"]
            # Missing updateUser - will cause INSERT error!
        ]

# ✅ CORRECT - BOTH createUser AND updateUser required
class FORM_CEmployeeBlock(FormLayout):
    def __init__(self, blockId):
        super().__init__(blockId)
        self.nonVisibleItems = [
            ["emp_create_user", "createUser"],
            ["emp_update_user", "updateUser"]  # MANDATORY
        ]
```

**Why both are required:**
- Framework generates INSERT statements with BOTH `createUser` and `updateUser` parameters
- Missing `updateUser` causes: `ERROR: INSERT has more expressions than target columns`
- Even if your table never gets UPDATE operations, the column must exist
- Database triggers can manage the values, but columns must be present

### 7. newInstance Functions - MANDATORY

**RULE**: Create ONE newInstance function for EVERY block in the form.

```python
# Naming convention: newInstance_MENUID_BLOCKNAME
def newInstance_EMPLOYEE_FORM_EMPLOYEE_HEAD(**kwargs):
    """
    Default values for EMPLOYEE_HEAD block
    """
    newInstance = {"status": True, "data": {}, "msg": ""}
    # Optional: Add default values
    # newInstance["data"]["empstatus"] = "A"
    return newInstance

def newInstance_EMPLOYEE_FORM_EMPLOYEE_DETAIL(**kwargs):
    """
    Default values for EMPLOYEE_DETAIL block
    """
    newInstance = {"status": True, "data": {}, "msg": ""}
    return newInstance
```

**If you have 8 blocks, create 8 newInstance functions. This is NON-NEGOTIABLE.**

### 8. itemId Consistency Between Python and JavaScript

**CRITICAL**: itemIds must match EXACTLY between Python and JavaScript.

```python
# Python
class FORM_Cempcode(TextPrimary):
    itemId = "empcode"  # ← Must match JavaScript
    databaseColumn = "emp_code"
```

```javascript
// JavaScript
var winConfigForm = {
    "EMPLOYEE_BLOCK": {
        "ELEMENT": ["empcode", "empname"],  // ← Must match Python itemId
        "PRIMARY_KEY": ["empcode"]
    }
}

let elementEMPLOYEE_BLOCK = [
    TEXTBOX.TEXTPRIMARY({ITEM_ID: "empcode", LABEL: "Employee Code", LENGTH: 10, IS_PRIMARY_KEY: true})
]
```

### 9. Parent-Child Relationships

**Parent Block**:
```python
class FORM_CParentBlock(FormLayout):
    def __init__(self, blockId):
        super().__init__(blockId)
        self.whereclause = ""
        self.databaseTable = "schema.parent_table"
```

```javascript
var winConfigForm = {
    "PARENT_BLOCK": {
        "ELEMENT": ["parentid", "parentname"],
        "PRIMARY_KEY": ["parentid"],
        "RELATION_KEY": [],  // Parent always has empty RELATION_KEY
        "BLOCK_TYPE": ["FORM", "PARENT"]
    }
}
```

**Child Block**:
```python
class FORM_CChildBlock(DataGridLayout):
    def __init__(self, blockId):
        super().__init__(blockId)
        # Bind to parent's primary key
        self.whereclause = "child_parent_id = %(parentid)s"
        self.databaseTable = "schema.child_table"
```

```javascript
var winConfigForm = {
    "CHILD_BLOCK": {
        "ELEMENT": ["childid", "childname"],  // Foreign key NOT in ELEMENT
        "PRIMARY_KEY": ["childid"],
        "RELATION_KEY": ["parentid"],  // References parent's PRIMARY_KEY
        "BLOCK_TYPE": ["DATAGRID", "CHILD"],
        "LOAD_DATA_AT_START": true,
        "REST_API": {
            "BLOCK_NAME": "CHILD_BLOCK",  // Current block name, NOT parent
            "PARAM_ID": ["parentid"]
        }
    }
}
```

**CRITICAL: FK Item in Child Block Python Class**:
The FK item (e.g., `child_parent_id`) must have `primaryKey = False` in its Python item class. The framework's `getPkJs` looks for all `primaryKey=True` items in the frontend data — but the FK is NOT sent from the frontend (it's set by `preInsert`). Setting `primaryKey = True` on FK items causes `KeyError` during insert.

```python
# FK item class - primaryKey MUST be False
class FORM_Cchildparentid(TextPrimary):
    itemId = "childparentid"
    databaseColumn = "child_parent_id"
    databaseItem = True
    nullable = False
    primaryKey = False  # CRITICAL: False for FK items

# Child block preInsert sets the FK value
class FORM_CChildBlock(DataGridLayout):
    def preInsert(self):
        self.item("childparentid").value = self.parentObj.block("PARENT_BLOCK").item("parentid").value
        return {"status": True, "msg": ""}
```

### 10. LOV (List of Values) Implementation

**Python LOV Function**:
```python
@exposeApi
def lov_itemId_MENU_ID():
    """
    LOV function naming: lov_{itemId}_{MENU_ID}
    """
    ajaxData = request.json.get("data")  # MANDATORY
    sqlData = """
        select 
            column1 as lovDisplayCode, 
            column2 as lovDisplayDesc 
        from schema.table
        where (column1 like %(search)s or column2 like %(search)s)
        offset %(offset)s
        limit 50
    """
    return selectDataHeaderQueryRO(sqlData, ajaxData)
```

**JavaScript LOV Configuration**:
```javascript
var winConfigForm = {
    "BLOCK_NAME": {
        "LOV_API": {
            "itemcode": {  // itemId for the code field
                "ITEM_ID": "itemcode",
                "TABLE_ID": "dtLovItem"  // dt + LovName from renderLov
            }
        }
    }
}

function renderLov() {
    return [
        lov.lovField(
            "LovItem",  // Window name (dt + this = TABLE_ID)
            ["itemcode", "itemdesc"],  // itemIds
            ["Item Code", "Item Description"],  // Labels (match SQL aliases)
            2  // Number of columns
        )
    ]
}
```

### 11. @exposeApi Decorator

**RULE**: All custom functions (except newInstance) MUST have @exposeApi decorator.

```python
# ✅ CORRECT
@exposeApi
def customFunction_MENU_ID():
    ajaxData = request.json.get("data")
    # Your logic here
    return {"status": True, "data": result}

# ❌ WRONG - Missing decorator
def customFunction_MENU_ID():
    return {"status": True}
```

### 12. execVcount Structure

**MANDATORY Structure**:
```python
execVcount = """
session["loggedId"] = kwargs

# Create Container and Form (ONCE per form)
MENUID_vContainer = Container()
MENUID_vForm = Form()
MENUID_vContainer.update(MENUID_vForm)

# Create each block
MENUID_vBlockName = MENUID_CBlockName("BLOCK_NAME")
MENUID_vBlockName.setListObj([MENUID_Citem1, MENUID_Citem2, ...])
MENUID_vBlockName.ObjRecord = MENUID_CRecordBlockName

# For child blocks, set relationBlock
MENUID_vChildBlock.relationBlock = MENUID_vParentBlock

# Append all blocks to form
MENUID_vContainer.getForm().dataBlocks = []
MENUID_vContainer.getForm().append(MENUID_vBlockName)
MENUID_vContainer.getForm().append(MENUID_vChildBlock)
"""
```

### 13. Validation Hierarchy

**Client-Side Validation** (JavaScript):
- Light validation
- UI feedback
- Use `webix.rules.isNotEmpty`, custom functions

**Server-Side Validation** (Python):
- Database queries
- Complex business logic
- Item.validate(), Record.validate(), Block pre/post hooks

### 14. Connection Configuration

**Database Connection**:
- Use `config/CreateConnection.py` to generate `Connection2.cfg`
- Format: Encoded ASCII values separated by spaces
- Never commit Connection2.cfg with real credentials

### 15. Development vs Production

**Development** (`PRODUCTION_ODEN = "N"`):
- Use `CustomOden` class with bypassed authentication
- Include `staticOdenMenu.py`
- Local Redis: `127.0.0.1:6379`
- Local PostgreSQL

**Production** (`PRODUCTION_ODEN = "Y"`):
- Use standard `Oden` class with SSO
- Remove `staticOdenMenu.py`
- GCP Memorystore Redis (private IP)
- Cloud SQL / existing PostgreSQL
- Deploy to Cloud Run

## Common Mistakes to Avoid

1. ❌ Using full menu ID instead of short descriptor in class names
2. ❌ Using `import` statements in form files
3. ❌ Creating Item classes for audit columns
4. ❌ Missing newInstance functions
5. ❌ itemId mismatch between Python and JavaScript
6. ❌ Including foreign keys in child block ELEMENT array
7. ❌ Using camelCase or snake_case for itemIds
8. ❌ Missing @exposeApi decorator on custom functions
9. ❌ Creating LOV functions without user confirmation
10. ❌ Wrong REST_API BLOCK_NAME (should be current block, not parent)
11. ❌ Forgetting to set relationBlock for child blocks

## Quality Checklist

Before considering a form complete, verify:

- [ ] Python classes use SHORT DESCRIPTOR (EMPF, not EMPLOYEE_FORM)
- [ ] All itemIds are lowercase
- [ ] itemIds match between Python and JavaScript
- [ ] newInstance function exists for EVERY block
- [ ] No Item classes for audit columns
- [ ] All custom functions have @exposeApi
- [ ] ELEMENT arrays match setListObj in Python
- [ ] PRIMARY_KEY matches primaryKey=True in Python (excluding FK items)
- [ ] FK items in child blocks have primaryKey=False (even if DB composite PK includes them)
- [ ] Child block preInsert sets FK value from parent: self.item("fkitem").value = self.parentObj.block("PARENT").item("parentpk").value
- [ ] RELATION_KEY only in child blocks
- [ ] LOV_API has corresponding Python functions
- [ ] Child blocks have relationBlock set
- [ ] REST_API BLOCK_NAME is correct
- [ ] COMBOLISTAPI elements have matching restapi.restApiCombo in webix.ready and Python API returning `id` and `value` aliases
- [ ] No import statements in form files

## When in Doubt

1. **Ask the user** for clarification rather than guessing
2. **Refer to examples** in Reference folder
3. **Follow the patterns** exactly as documented
4. **Validate consistency** between Python and JavaScript
5. **Test locally** before deployment

---

**Remember**: Consistency is key. Follow these rules exactly, and the Oden Framework will work flawlessly.
