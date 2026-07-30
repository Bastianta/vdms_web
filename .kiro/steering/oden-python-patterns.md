---
inclusion: always
---

# Oden Framework Python Patterns

This steering file contains detailed Python code generation patterns for the Oden Framework.

## CRITICAL: Short Descriptor Naming Convention

**ALL Python class and variable names MUST use SHORT DESCRIPTOR, not full menu ID.**

### Short Descriptor Rules

**CRITICAL**: Short descriptor must be **minimum 4 characters**.

| Menu ID | Short Descriptor | Usage |
|---------|------------------|-------|
| EMPLOYEE_FORM | EMPF | `EMPF_CEmployeeHead` |
| HRA_119 | HRA119 | `HRA119_CEmployeeHead` |
| MASTER_DATA_FORM | MDAF | `MDAF_CMasterHead` |
| ORDER_MANAGEMENT | ORDM | `ORDM_COrderHead` |
| ORDER_FORM | ORDF | `ORDF_COrderHead` |

**Pattern**: Remove underscores and use abbreviation (minimum 4 characters, typically 4-6 characters)

**Examples**:
- ❌ WRONG: `EMPLOYEE_FORM_CEmployeeHead`
- ✅ CORRECT: `EMPF_CEmployeeHead`

- ❌ WRONG: `EMPLOYEE_FORM_Cempcode`
- ✅ CORRECT: `EMPF_Cempcode`

- ❌ WRONG: `EMPLOYEE_FORM_vContainer`
- ✅ CORRECT: `EMPF_vContainer`

## Python File Structure

Every Python form file MUST follow this exact structure:

```python
# 1. Block Classes (FormLayout or DataGridLayout) - use SHORT DESCRIPTOR
# 2. Record Classes (one per block) - use SHORT DESCRIPTOR
# 3. Item Classes (one per business column) - use SHORT DESCRIPTOR
# 4. execVcount Variable (object hierarchy) - use SHORT DESCRIPTOR
# 5. newInstance Functions (one per block) - use FULL MENU_ID
# 6. Custom Functions with @exposeApi decorator - use FULL MENU_ID
```

## 1. Block Classes

**CRITICAL**: Class names use SHORT DESCRIPTOR, not full menu ID.

**Naming Convention**:
- Menu ID: `EMPLOYEE_FORM` → Short Descriptor: `EMPF`
- Menu ID: `HRA_119` → Short Descriptor: `HRA119`
- Menu ID: `MASTER_DATA_FORM` → Short Descriptor: `MDF`

**Pattern**: `SHORTDESC_CBlockName`

### FormLayout Block (Single Record View)

```python
class EMPF_CEmployeeHead(FormLayout):
    """
    Block class for employee header
    Short descriptor: EMPF (from EMPLOYEE_FORM)
    """
    def __init__(self, blockId):
        super().__init__(blockId)
        self.whereclause = ""
        self.databaseTable = "schema.table_name"
        self.nonVisibleItems = [
            ["table_create_user", "createUser"],
            ["table_update_user", "updateUser"]
        ]
        self.noDbItems = []  # Items not in database
        self.orderBy = ""
```

### DataGridLayout Block (Multiple Records View)

```python
class EMPF_CEmployeeDetail(DataGridLayout):
    """
    Block class for employee detail
    Short descriptor: EMPF (from EMPLOYEE_FORM)
    """
    def __init__(self, blockId):
        super().__init__(blockId)
        self.whereclause = ""
        self.databaseTable = "schema.table_name"
        self.nonVisibleItems = [
            ["table_create_user", "createUser"],
            ["table_update_user", "updateUser"]
        ]
        self.noDbItems = []
        self.orderBy = "column_name ASC"
```

### Block with History Table (Automatic Delete/Update Logging)

```python
class EMPF_CEmployeeHead(FormLayout):
    """
    Block with automatic history logging
    When record is deleted, it's automatically inserted to history table
    """
    def __init__(self, blockId):
        super().__init__(blockId)
        self.whereclause = ""
        self.databaseTable = "schema.employees"
        self.databaseTableHistory = "schema.employees_history"  # Automatic history logging
        self.nonVisibleItems = [
            ["emp_create_user", "createUser"],
            ["emp_update_user", "updateUser"]
        ]
        self.noDbItems = []
```

**History Table Standard**:

1. **Same column names** as main table
2. **Optional _new columns** for UPDATE tracking (e.g., `column_name_new`)
3. **Three mandatory audit columns**:
   - `prefix_tanggal_proses` (timestamp)
   - `prefix_user_proses` (varchar)
   - `prefix_flag_proses` (char(1): 'D' for Delete, 'U' for Update)

**Example History Table DDL**:
```sql
-- Main table
CREATE TABLE ldr.files (
    file_id varchar(20) PRIMARY KEY,
    file_name varchar(255),
    file_path varchar(500),
    file_size bigint,
    upload_date timestamp
);

-- History table
CREATE TABLE ldr.files_history (
    -- Same columns as main table
    file_id varchar(20),
    file_name varchar(255),
    file_path varchar(500),
    file_size bigint,
    upload_date timestamp,
    
    -- Optional: _new columns for UPDATE tracking
    file_name_new varchar(255),
    file_path_new varchar(500),
    file_size_new bigint,
    
    -- Mandatory audit columns (prefix = schema/module name)
    ldr_tanggal_proses timestamp DEFAULT CURRENT_TIMESTAMP,
    ldr_user_proses varchar(50),
    ldr_flag_proses char(1)  -- 'D' = Delete, 'U' = Update
);
```

**How it works**:
- Framework automatically inserts deleted records into `databaseTableHistory`
- No need for `preDelete` or `postDelete` hooks
- Audit columns are populated automatically by the framework

### Child Block with Relationship

```python
class EMPF_CEmployeeHistory(DataGridLayout):
    """
    Child block linked to parent
    Short descriptor: EMPF (from EMPLOYEE_FORM)
    """
    def __init__(self, blockId):
        super().__init__(blockId)
        # Bind to parent's primary key using %(itemId)s syntax
        self.whereclause = "history_emp_code = %(empcode)s"
        self.databaseTable = "schema.employee_history"
        self.nonVisibleItems = [
            ["history_create_user", "createUser"],
            ["history_update_user", "updateUser"]
        ]
        self.noDbItems = []
        self.orderBy = "history_date DESC"
```

### Block Lifecycle Hooks

```python
class EMPF_CEmployeeHead(FormLayout):
    """
    Short descriptor: EMPF (from EMPLOYEE_FORM)
    """
    def __init__(self, blockId):
        super().__init__(blockId)
        self.whereclause = ""
        self.databaseTable = "schema.table_name"
        self.nonVisibleItems = []
        self.noDbItems = []
    
    def preSelect(self, data):
        """
        Called BEFORE selecting data
        Use to modify whereclause dynamically
        """
        # Example: Add additional filter
        # self.whereclause += " AND status = 'A'"
        return {"status": True}
    
    def postSelect(self, data):
        """
        Called AFTER selecting data
        Use to fetch additional fields not in base table
        
        CRITICAL - getDataDisplayItem contract:
        - INPUT:  DATA must be {"status": ..., "data": [...]}
        - OUTPUT: returns {"status": ..., "data": [...]}
        
        When chaining multiple calls, pass the FULL result directly as DATA.
        Do NOT pass result["data"] — that's just the list, not the expected dict.
        """
        sql = """
            select 
                emp_name as empname,
                dept_name as deptname
            from hr.employees, hr.departments
            where emp_id = %(empid)s
            and emp_dept_id = dept_id
        """
        param = ["empid"]  # itemIds to bind
        setDesc = ["empname", "deptname"]  # itemIds to set
        data = getDataDisplayItem({
            "DATA": data,
            "BLOCK_TYPE": self.blockType,
            "SQL": sql,
            "PARAM": param,
            "SET_DESC": setDesc
        })
        return {"status": data["status"], "data": data["data"]}
    
    def postSelect_CHAINING_EXAMPLE(self, data):
        """
        EXAMPLE: Multiple getDataDisplayItem calls (chaining)
        
        CORRECT: Always pass 'data' directly (the full dict), never data["data"]
        Because getDataDisplayItem expects DATA = {"status": ..., "data": [...]}
        and returns the same structure.
        """
        # First call — 'data' is already {"status": ..., "data": [...]} from framework
        sql1 = """
            select dept_name as deptdesc
            from hr.departments
            where dept_code = %(deptcode)s
        """
        data = getDataDisplayItem({
            "DATA": data,
            "BLOCK_TYPE": self.blockType,
            "SQL": sql1,
            "PARAM": ["deptcode"],
            "SET_DESC": ["deptdesc"]
        })

        # Second call — pass 'data' directly, NOT data["data"]
        sql2 = """
            select branch_name as branchdesc
            from hr.branches
            where branch_code = %(branchcode)s
        """
        data = getDataDisplayItem({
            "DATA": data,
            "BLOCK_TYPE": self.blockType,
            "SQL": sql2,
            "PARAM": ["branchcode"],
            "SET_DESC": ["branchdesc"]
        })

        # Third call — same pattern, always pass full 'data'
        sql3 = """
            select position_name as positiondesc
            from hr.positions
            where position_code = %(positioncode)s
        """
        data = getDataDisplayItem({
            "DATA": data,
            "BLOCK_TYPE": self.blockType,
            "SQL": sql3,
            "PARAM": ["positioncode"],
            "SET_DESC": ["positiondesc"]
        })

        # Final return
        return {"status": data["status"], "data": data["data"]}
    
    def preInsert(self):
        """
        Called BEFORE inserting record
        Use to set values or generate sequences
        """
        # Example: Generate auto number
        import datetime
        itemElement = self.item("recordid")
        itemElement.value = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
        return {"status": True, "msg": ""}
    
    def postInsert(self):
        """
        Called AFTER inserting record
        Use for additional operations after insert
        """
        return {"status": True, "msg": ""}
    
    def preUpdate(self):
        """
        Called BEFORE updating record
        """
        return {"status": True, "msg": ""}
    
    def postUpdate(self):
        """
        Called AFTER updating record
        """
        return {"status": True, "msg": ""}
    
    def preDelete(self):
        """
        Called BEFORE deleting record
        """
        return {"status": True, "msg": ""}
    
    def postDelete(self):
        """
        Called AFTER deleting record
        """
        return {"status": True, "msg": ""}
```

## 2. Record Classes

**CRITICAL**: Record class names also use SHORT DESCRIPTOR.

```python
class EMPF_CRecordEmployeeHead(Record):
    """
    Record class for validation
    Short descriptor: EMPF (from EMPLOYEE_FORM)
    One record class per block
    """
    def validate(self):
        """
        Validate entire record before CRUD operations
        @return: dict with status (bool) and msg (str)
        """
        # Example validation
        empcode = self.item("empcode").value
        if not empcode:
            return {"status": False, "msg": "Employee code is required"}
        
        # Access all items in record
        for item in self.items:
            if item.primaryKey and not item.value:
                return {"status": False, "msg": f"{item.itemId} is required"}
        
        return {"status": True, "msg": ""}
```

## 3. Item Classes

### Item Class Inheritance Mapping

| Database Type | Python Class | JavaScript Element |
|---------------|--------------|-------------------|
| varchar, text | TextNormal, TextUpper, TextLower | TEXTBOX.TEXTNORMAL |
| varchar (PK) | TextPrimary | TEXTBOX.TEXTPRIMARY |
| varchar (display only) | TextNormal | TEXTBOX.TEXTDISPLAY |
| text (multiline) | TextArea | TEXTBOX.TEXTAREA |
| integer | NumericNormal | NUMERIC.NUMERICNORMAL |
| numeric(x,0) | NumericNormal | NUMERIC.NUMERICNORMAL |
| numeric(x,y) | NumericNormal | NUMERIC.FLOAT |
| money, decimal | Currency | NUMERIC.CURRENCY |
| date | Calendar | DATE.DDMMYY |
| timestamp | Calendar | DATE.DDMMYY |
| time | Time | DATE.CLOCK |
| boolean, char(1) | CheckBox | CHECKBOX.NORMALCHECKBOX |
| varchar (LOV) | Lov | LOVFIELD.TEXTLOVMULTICOLS |
| varchar (combo) | ComboList | COMBO.COMBOLISTDEFAULT |

### TextPrimary (Primary Key)

**CRITICAL**: Item class names also use SHORT DESCRIPTOR.

```python
class EMPF_Cempcode(TextPrimary):
    lengthItem = 20
    itemId = "empcode"
    databaseColumn = "emp_code"
    databaseItem = True
    nullable = False
    primaryKey = True
    allowSpecialChar = []
    
    def validate(self):
        """
        Item-level validation
        """
        if not self.value:
            return {"status": False, "msg": "Employee code cannot be empty"}
        if len(self.value) < 5:
            return {"status": False, "msg": "Employee code must be at least 5 characters"}
        return {"status": True, "msg": ""}
```

### TextPrimary as FK Item in Child Block

**CRITICAL**: FK items in child blocks MUST have `primaryKey = False`. The value is set in `preInsert`, not from the frontend. If `primaryKey = True`, the framework's `getPkJs` will throw `KeyError` because the frontend sends the parent's itemId (via RELATION_KEY), not the child's FK itemId.

```python
# WRONG - causes KeyError: 'detailempcode' during insert
class EMPF_Cdetailempcode(TextPrimary):
    itemId = "detailempcode"
    databaseColumn = "detail_emp_code"
    databaseItem = True
    nullable = False
    primaryKey = True  # ❌ WRONG - will cause KeyError in getPkJs

# CORRECT
class EMPF_Cdetailempcode(TextPrimary):
    itemId = "detailempcode"
    databaseColumn = "detail_emp_code"
    databaseItem = True
    nullable = False
    primaryKey = False  # ✅ CORRECT - FK in child block must be False

    def validate(self):
        return {"status": True, "msg": ""}
```

The FK value is assigned in the child block's `preInsert`:
```python
def preInsert(self):
    self.item("detailempcode").value = self.parentObj.block("PARENT_BLOCK").item("empcode").value
    return {"status": True, "msg": ""}
```

### TextNormal (Regular Text)

```python
class EMPF_Cempname(TextNormal):
    lengthItem = 100
    itemId = "empname"
    databaseColumn = "emp_name"
    databaseItem = True
    nullable = False
    primaryKey = False
    allowSpecialChar = []
    
    def validate(self):
        return {"status": True, "msg": ""}
```

### TextUpper (Uppercase Text)

```python
class EMPF_Cempemail(TextUpper):
    lengthItem = 100
    itemId = "empemail"
    databaseColumn = "emp_email"
    databaseItem = True
    nullable = True
    primaryKey = False
    allowSpecialChar = ["@", ".", "-", "_"]
    
    def validate(self):
        if self.value and "@" not in self.value:
            return {"status": False, "msg": "Invalid email format"}
        return {"status": True, "msg": ""}
```

### TextArea (Multiline Text)

```python
class EMPF_Cnotes(TextArea):
    lengthItem = 500
    itemId = "notes"
    databaseColumn = "notes"
    databaseItem = True
    nullable = True
    primaryKey = False
    allowSpecialChar = []
    
    def validate(self):
        return {"status": True, "msg": ""}
```

### NumericNormal (Integer or Decimal)

```python
class EMPF_Cage(NumericNormal):
    lengthItem = 3
    itemId = "age"
    databaseColumn = "age"
    databaseItem = True
    nullable = True
    primaryKey = False
    
    def validate(self):
        if self.value and (int(self.value) < 18 or int(self.value) > 65):
            return {"status": False, "msg": "Age must be between 18 and 65"}
        return {"status": True, "msg": ""}
```

### Currency (Money Fields)

```python
class EMPF_Csalary(Currency):
    lengthItem = 15
    itemId = "salary"
    databaseColumn = "salary"
    databaseItem = True
    nullable = True
    primaryKey = False
    
    def validate(self):
        if self.value and float(self.value) < 0:
            return {"status": False, "msg": "Salary cannot be negative"}
        return {"status": True, "msg": ""}
```

### Calendar (Date Fields)

```python
class EMPF_Chiredate(Calendar):
    lengthItem = 20
    itemId = "hiredate"
    databaseColumn = "hire_date"
    databaseItem = True
    nullable = False
    primaryKey = False
    allowSpecialChar = []
    
    def validate(self):
        return {"status": True, "msg": ""}
```

### CheckBox (Boolean Fields)

```python
class EMPF_Cisactive(CheckBox):
    lengthItem = 1
    itemId = "isactive"
    databaseColumn = "is_active"
    databaseItem = True
    nullable = True
    primaryKey = False
    
    def validate(self):
        return {"status": True, "msg": ""}
```

### Lov (List of Values)

```python
class EMPF_Cdeptcode(Lov):
    lengthItem = 20
    itemId = "deptcode"
    databaseColumn = "dept_code"
    databaseItem = True
    nullable = False
    primaryKey = False
    allowSpecialChar = []
    
    def validate(self):
        return {"status": True, "msg": ""}

# Display field for LOV (not in database)
class EMPF_Cdeptdesc(TextNormal):
    lengthItem = 100
    itemId = "deptdesc"
    databaseColumn = ""  # Not in database
    databaseItem = False
    nullable = True
    primaryKey = False
    allowSpecialChar = []
    
    def validate(self):
        return {"status": True, "msg": ""}
```

### ComboList (Dropdown)

```python
class EMPF_Cstatus(ComboList):
    lengthItem = 1
    itemId = "status"
    databaseColumn = "status"
    databaseItem = True
    nullable = False
    primaryKey = False
    
    def validate(self):
        valid_values = ['A', 'I', 'P']
        if self.value not in valid_values:
            return {"status": False, "msg": f"Status must be one of {valid_values}"}
        return {"status": True, "msg": ""}
```

## 4. execVcount Variable

**CRITICAL**: Variable names use SHORT DESCRIPTOR.

```python
execVcount = """
session["loggedId"] = kwargs

# Create Container and Form (once per form)
EMPF_vContainer = Container()
EMPF_vForm = Form()
EMPF_vContainer.update(EMPF_vForm)

# Parent Block
EMPF_vEmployeeHead = EMPF_CEmployeeHead("EMPLOYEE_HEAD")
EMPF_vEmployeeHead.setListObj([
    EMPF_Cempcode,
    EMPF_Cempname,
    EMPF_Cempemail
])
EMPF_vEmployeeHead.ObjRecord = EMPF_CRecordEmployeeHead

# Child Block 1
EMPF_vEmployeeDetail = EMPF_CEmployeeDetail("EMPLOYEE_DETAIL")
EMPF_vEmployeeDetail.relationBlock = EMPF_vEmployeeHead  # Link to parent
EMPF_vEmployeeDetail.setListObj([
    EMPF_Cdetailid,
    EMPF_Cdetailtype,
    EMPF_Cdetailvalue
])
EMPF_vEmployeeDetail.ObjRecord = EMPF_CRecordEmployeeDetail

# Child Block 2
EMPF_vEmployeeHistory = EMPF_CEmployeeHistory("EMPLOYEE_HISTORY")
EMPF_vEmployeeHistory.relationBlock = EMPF_vEmployeeHead  # Link to parent
EMPF_vEmployeeHistory.setListObj([
    EMPF_Chistoryid,
    EMPF_Chistorydate,
    EMPF_Chistorynotes
])
EMPF_vEmployeeHistory.ObjRecord = EMPF_CRecordEmployeeHistory

# Append all blocks to form
EMPF_vContainer.getForm().dataBlocks = []
EMPF_vContainer.getForm().append(EMPF_vEmployeeHead)
EMPF_vContainer.getForm().append(EMPF_vEmployeeDetail)
EMPF_vContainer.getForm().append(EMPF_vEmployeeHistory)
"""
```

## 5. newInstance Functions

```python
def newInstance_MENU_ID_BLOCK_NAME(**kwargs):
    """
    Provide default values for new records in BLOCK_NAME
    Called when user clicks "Add" button
    """
    newInstance = {"status": True, "data": {}, "msg": ""}
    
    # Optional: Set default values
    # newInstance["data"]["status"] = "A"
    # newInstance["data"]["createdate"] = datetime.datetime.now().strftime("%Y-%m-%d")
    
    return newInstance

# Example with default values
def newInstance_EMPLOYEE_FORM_EMPLOYEE_HEAD(**kwargs):
    """
    Default values for new employee
    """
    import datetime
    newInstance = {"status": True, "data": {}, "msg": ""}
    newInstance["data"]["status"] = "A"
    newInstance["data"]["hiredate"] = datetime.datetime.now().strftime("%Y-%m-%d")
    newInstance["data"]["isactive"] = "Y"
    return newInstance
```

## 6. LOV Functions

```python
@exposeApi
def lov_itemId_MENU_ID():
    """
    LOV function for itemId field
    MUST follow naming convention: lov_{itemId}_{MENU_ID}
    QUERY MUST follow the third parameter of the lov.lovField in the javascript !
    Example : 
    lov.lovField(
            "LovKategori",
            ["mkkcode", "mkkdesc"],
            ["Kode Kategori", "Deskripsi Kategori"],
            2
        )
    so the aliases should be lovkodekategori, and lovdeskripsikategori
    """
    ajaxData = request.json.get("data")  # MANDATORY - contains search and offset
    
    sqlData = """
        select 
            dept_code as lovDepartmentCode,
            dept_name as lovDepartmentName,
            dept_manager as lovDepartmentManager
        from hr.departments
        where (
            dept_code like %(search)s 
            or dept_name like %(search)s
            or dept_manager like %(search)s
        )
        order by dept_code
        offset %(offset)s
        limit 50
    """
    
    return selectDataHeaderQueryRO(sqlData, ajaxData)

# If LOV source is unknown, create placeholder
@exposeApi
def lov_deptcode_EMPLOYEE_FORM():
    """
    Placeholder LOV - replace with actual query
    """
    ajaxData = request.json.get("data")
    sqlData = """
        select 
            '' as lovDepartmentCode,
            '' as lovDepartmentName
        where (
            '' like %(search)s 
            or '' like %(search)s
        )
        offset %(offset)s
        limit 50
    """
    return selectDataHeaderQueryRO(sqlData, ajaxData)
```

## 7. Custom API Functions

```python
@exposeApi
def customFunction_MENU_ID():
    """
    Custom API function
    MUST have @exposeApi decorator
    """
    ajaxData = request.json.get("data")
    
    # Your business logic here
    empcode = ajaxData.get("empcode")
    
    sql = """
        select emp_name, emp_dept, emp_salary
        from hr.employees
        where emp_code = %(empcode)s
    """
    
    result = selectDataHeaderQueryRO(sql, {"empcode": empcode})
    
    if result["status"]:
        return {
            "status": True,
            "data": result["data"],
            "msg": "Success"
        }
    else:
        return {
            "status": False,
            "data": [],
            "msg": "Employee not found"
        }

@exposeApi
def calculateBonus_EMPLOYEE_FORM():
    """
    Calculate employee bonus
    """
    ajaxData = request.json.get("data")
    salary = float(ajaxData.get("salary", 0))
    performance = ajaxData.get("performance", "C")
    
    bonus_rates = {"A": 0.20, "B": 0.15, "C": 0.10, "D": 0.05}
    bonus = salary * bonus_rates.get(performance, 0)
    
    return {
        "status": True,
        "data": {"bonus": bonus},
        "msg": "Bonus calculated"
    }
```

## 8. Call Form Implementation

```python
# Calling Form (Level 0)
execVcount = """
session["loggedId"] = kwargs
FORM01_vContainer = Container()
FORM01_vForm = Form()
FORM01_vForm.callFormLevel = 0  # Calling form
FORM01_vContainer.update(FORM01_vForm)
# ... rest of execVcount
"""

# Called Form (Level 1) - must have _ND suffix
execVcount = """
session["loggedId"] = kwargs
FORM02_ND_vContainer = Container()
FORM02_ND_vForm = Form()
FORM02_ND_vForm.callFormLevel = 1  # Called form
FORM02_ND_vContainer.update(FORM02_ND_vForm)
# ... rest of execVcount
"""

# Call Form API
def callForm_FORM_02_ND_FORM_01():
    """
    API to pass parameters from FORM_01 to FORM_02_ND
    Naming: callForm_{destination}_{source}
    """
    pass  # Framework handles parameter passing
```

## Common Patterns

### Pattern: Auto Number Sequence

```python
def preInsert(self):
    """
    Generate auto number for primary key
    """
    import datetime
    itemElement = self.item("recordid")
    
    # Option 1: Timestamp-based
    itemElement.value = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    
    # Option 2: Database sequence
    # sql = "SELECT nextval('sequence_name') as sequence"
    # result = selectHeaderQueryRO(sql)
    # itemElement.value = result['data'][0]['sequence']
    
    return {'status': True, 'msg': ''}
```

### Pattern: Fetch Description Fields

```python
def postSelect(self, data):
    """
    Fetch description fields from related tables
    """
    sql = """
        select 
            dept_name as deptdesc,
            mgr_name as mgrdesc
        from hr.departments, hr.employees
        where dept_code = %(deptcode)s
        and dept_manager = emp_code
    """
    param = ["deptcode"]
    setDesc = ["deptdesc", "mgrdesc"]
    
    data = getDataDisplayItem({
        "DATA": data,
        "BLOCK_TYPE": self.blockType,
        "SQL": sql,
        "PARAM": param,
        "SET_DESC": setDesc
    })
    
    return {"status": data["status"], "data": data["data"]}
```

### Pattern: Cross-Field Validation

```python
class MENUID_CRecordEmployee(Record):
    def validate(self):
        """
        Validate relationships between fields
        """
        startdate = self.item("startdate").value
        enddate = self.item("enddate").value
        
        if startdate and enddate:
            if enddate < startdate:
                return {
                    "status": False,
                    "msg": "End date must be after start date"
                }
        
        return {"status": True, "msg": ""}
```

## Pattern: Usage of database data fetcher and execute function

### selectHeaderQueryRO(query) — Read-only, no bind params

```python
sql = """
    select count(*) as count
    from hr.employees
    where status = 'A'
"""
result = selectHeaderQueryRO(sql)
# result = {"status": True, "data": [{"count": 42}]}
```

### selectHeaderQuery(query) — Read-write connection, no bind params
```
python
sql = """
    select nextval('hr.emp_sequence') as sequence
"""
result = selectHeaderQuery(sql)
# result = {"status": True, "data": [{"sequence": "100001"}]}
```

### selectDataHeaderQueryRO(query, param) — Read-only with bind params
```
python
sql = """
    select emp_code as empcode, emp_name as empname
    from hr.employees
    where emp_dept = %(deptcode)s
    and emp_status = %(status)s
    offset %(offset)s
    limit 50
"""
param = {"deptcode": "IT001", "status": "A", "offset": 0}
result = selectDataHeaderQueryRO(sql, param)
# result = {"status": True, "data": [{"empcode": "E001", "empname": "John"}, ...]}
```

### selectDataHeaderQuery(query, param) — Read-write with bind params
```
python
sql = """
    select emp_code as empcode, emp_salary as empsalary
    from hr.employees
    where emp_code = %(empcode)s
"""
param = {"empcode": "E001"}
result = selectDataHeaderQuery(sql, param)
# result = {"status": True, "data": [{"empcode": "E001", "empsalary": "5000000"}]}
```

### selectQuery(query) — Raw select, no bind params, returns raw tuples
```
python
sql = """
    select emp_code, emp_name, emp_dept
    from hr.employees
    where status = 'A'
"""
result = selectQuery(sql)
# result = {"status": True, "data": [("E001", "John", "IT"), ("E002", "Jane", "HR")]}
```

### selectDataQuery(query, param) — Raw select with bind params, returns raw tuples
```
python
sql = """
    select emp_code, emp_name
    from hr.employees
    where emp_dept = %(deptcode)s
"""
param = {"deptcode": "IT001"}
result = selectDataQuery(sql, param)
# result = {"status": True, "data": [("E001", "John"), ("E003", "Bob")]}
```

### selectDataQueryRO(query, param) — Read-only raw select with bind params
```
python
sql = """
    select dept_code, dept_name
    from hr.departments
    where dept_status = %(status)s
"""
param = {"status": "A"}
result = selectDataQueryRO(sql, param)
# result = {"status": True, "data": [("IT001", "Information Technology"), ("HR001", "Human Resources")]}
```

### executeQuery(query) — Execute DML without bind params
```
python
sql = """
    UPDATE hr.employees
    SET emp_status = 'I'
    WHERE emp_resign_date < CURRENT_DATE
"""
result = executeQuery(sql)
# result = {"status": True, "msg": "OK"}
```

### executeDataQuery(query, param) — Execute DML with bind params
```
python
sql = """
    UPDATE hr.employees
    SET emp_status = %(status)s, emp_update_user = %(updateUser)s
    WHERE emp_code = %(empcode)s
"""
param = {"status": "I", "updateUser": "admin", "empcode": "E001"}
result = executeDataQuery(sql, param)
# result = {"status": True, "msg": "OK"}
```

### executeDataMany(query, param, blocks) — Batch execute (multiple statements)
```
python
# Used internally by the framework for multi-block transactions
# Typically called via getInsertStatement/getUpdateStatement, not directly
query = "INSERT INTO hr.employees (emp_code, emp_name) VALUES (%(empcode)s, %(empname)s)"
param = [{"empcode": "E010", "empname": "Alice"}, {"empcode": "E011", "empname": "Bob"}]
blocks = ["EMPLOYEE_HEAD"]
result = executeDataMany(query, param, blocks)
# result = {"status": True, "data": ...}
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


### Key differences summary for the :

| Function | Connection | Bind Params | Returns |
|----------|-----------|-------------|---------|
| selectHeaderQueryRO | Read-only | No | [{dict}] |
| selectHeaderQuery | Read-write | No | [{dict}] |
| selectDataHeaderQueryRO | Read-only | Yes | [{dict}] |
| selectDataHeaderQuery | Read-write | Yes | [{dict}] |
| selectQuery | Read-write | No | [(tuples)] |
| selectDataQuery | Read-write | Yes | [(tuples)] |
| selectDataQueryRO | Read-only | Yes | [(tuples)] |
| executeQuery | Read-write | No | {status, msg} |
| executeDataQuery | Read-write | Yes | {status, msg} |
| executeDataMany | Read-write | Yes (batch) | {status, data} |

### Note for Database functions in oden: 
- All return from database using function from oden will return into string, even for integer, date, timestamp
- Making validation in python means you need to parse first if you want to use python operator like >, or < using int() or float()
- All aliases returned from all of that function will become all lowercase and without _ 
Example : 


"""
    select msj_code, msj_desc from dmhr.ms_jabatan
"""

This will return msjcode and msjdesc as the aliases

"""
    select ps_nik as NIKKARYAWAN_AKTIF, ps_nama as NAMA_KARYAWAN from dmhr.ps_karyawan
"""

This will return aliases to nikkaryawanaktif and namakaryawan

## Checklist for Python Files

- [ ] All Item classes created (except audit columns)
- [ ] Block classes inherit from FormLayout or DataGridLayout
- [ ] Record classes have validate() method
- [ ] execVcount properly structured
- [ ] newInstance function for EVERY block
- [ ] Child blocks have relationBlock set
- [ ] Child blocks have whereclause with bind parameters
- [ ] LOV functions follow naming convention
- [ ] Custom functions have @exposeApi decorator
- [ ] No import statements used
- [ ] All itemIds are lowercase
- [ ] nonVisibleItems includes audit columns

---

**Remember**: Python files define the data structure and business logic. They must be perfectly synchronized with JavaScript files.
