---
inclusion: always
---

# Oden Framework Database Mapping Guide

This steering file contains comprehensive database-to-code mapping patterns for the Oden Framework.

## Database Type to Python/JavaScript Mapping

### Complete Mapping Table

| PostgreSQL Type | Python Class | JavaScript Element | Notes |
|----------------|--------------|-------------------|-------|
| `varchar(n)` | `TextNormal` | `TEXTBOX.TEXTNORMAL` | Regular text |
| `varchar(n)` (PK) | `TextPrimary` | `TEXTBOX.TEXTPRIMARY` | Primary key |
| `varchar(n)` (uppercase) | `TextUpper` | `TEXTBOX.TEXTUPPER` | Auto-uppercase |
| `varchar(n)` (lowercase) | `TextLower` | `TEXTBOX.TEXTLOWER` | Auto-lowercase |
| `text` | `TextArea` | `TEXTBOX.TEXTAREA` | Multiline text |
| `char(n)` | `TextNormal` | `TEXTBOX.TEXTNORMAL` | Fixed length |
| `integer` | `NumericNormal` | `NUMERIC.NUMERICNORMAL` | Whole numbers |
| `bigint` | `NumericNormal` | `NUMERIC.NUMERICNORMAL` | Large integers |
| `smallint` | `NumericNormal` | `NUMERIC.NUMERICNORMAL` | Small integers |
| `numeric(x,0)` | `NumericNormal` | `NUMERIC.NUMERICNORMAL` | No decimals |
| `numeric(x,y)` | `NumericNormal` | `NUMERIC.FLOAT` | With decimals |
| `decimal(x,y)` | `NumericNormal` | `NUMERIC.FLOAT` | With decimals |
| `real` | `NumericNormal` | `NUMERIC.FLOAT` | Floating point |
| `double precision` | `NumericNormal` | `NUMERIC.FLOAT` | Double precision |
| `money` | `Currency` | `NUMERIC.CURRENCY` | Currency format |
| `date` | `Calendar` | `DATE.DDMMYY` | Date only |
| `timestamp` | `Calendar` | `DATE.TIMESTAMP` | Date + time |
| `time` | `Time` | `DATE.CLOCK` | Time only |
| `boolean` | `CheckBox` | `CHECKBOX.NORMALCHECKBOX` | True/false |
| `char(1)` (Y/N) | `CheckBox` | `CHECKBOX.NORMALCHECKBOX` | Yes/No flag |
| `varchar(n)` (LOV) | `Lov` | `LOVFIELD.TEXTLOVMULTICOLS` | List of values |
| `varchar(n)` (combo) | `ComboList` | `COMBO.COMBOLISTDEFAULT` | Dropdown |

## DDL Analysis Patterns

### Pattern 1: Simple Table

```sql
CREATE TABLE hr.employees (
    emp_code varchar(20) PRIMARY KEY,
    emp_name varchar(100) NOT NULL,
    emp_email varchar(100),
    emp_age integer,
    emp_salary numeric(15,2),
    emp_hire_date date,
    emp_is_active char(1) DEFAULT 'Y',
    emp_create_date timestamp DEFAULT CURRENT_TIMESTAMP,
    emp_create_user varchar(50),
    emp_update_date timestamp,
    emp_update_user varchar(50)
);
```

**Analysis**:
- **Primary Key**: `emp_code` → TextPrimary
- **Required Fields**: `emp_name` → nullable=False
- **Optional Fields**: `emp_email`, `emp_age` → nullable=True
- **Numeric with Decimals**: `emp_salary` → NumericNormal (Python), NUMERIC.FLOAT (JS)
- **Date**: `emp_hire_date` → Calendar
- **Boolean Flag**: `emp_is_active` → CheckBox
- **Audit Columns**: `emp_create_date`, `emp_create_user`, `emp_update_date`, `emp_update_user` → **DO NOT CREATE ITEMS**

**Python Items to Create**:
```python
class FORM_Cempcode(TextPrimary):
    itemId = "empcode"
    databaseColumn = "emp_code"
    primaryKey = True
    nullable = False

class FORM_Cempname(TextNormal):
    itemId = "empname"
    databaseColumn = "emp_name"
    nullable = False

class FORM_Cempemail(TextNormal):
    itemId = "empemail"
    databaseColumn = "emp_email"
    nullable = True

class FORM_Cempage(NumericNormal):
    itemId = "empage"
    databaseColumn = "emp_age"
    nullable = True

class FORM_Cempsalary(NumericNormal):
    itemId = "empsalary"
    databaseColumn = "emp_salary"
    nullable = True

class FORM_Cemphiredate(Calendar):
    itemId = "emphiredate"
    databaseColumn = "emp_hire_date"
    nullable = True

class FORM_Cempisactive(CheckBox):
    itemId = "empisactive"
    databaseColumn = "emp_is_active"
    nullable = True

# Audit columns in nonVisibleItems only
class FORM_CEmployeeBlock(FormLayout):
    def __init__(self, blockId):
        super().__init__(blockId)
        self.nonVisibleItems = [
            ["emp_create_user", "createUser"],
            ["emp_update_user", "updateUser"]
        ]
```

### Pattern 2: Foreign Key Relationships

```sql
CREATE TABLE hr.employee_details (
    detail_id varchar(20) PRIMARY KEY,
    detail_emp_code varchar(20) REFERENCES hr.employees(emp_code),
    detail_type varchar(50),
    detail_value numeric(15,2),
    detail_date date
);
```

**Analysis**:
- **Primary Key**: `detail_id`
- **Foreign Key**: `detail_emp_code` → Used in whereclause, NOT in ELEMENT array
- **Parent-Child Relationship**: Child block

**CRITICAL FK Item Rule**: The FK item class in the child block MUST have `primaryKey = False` even if the database column is part of a composite primary key. The framework's `getPkJs` runs before `preInsert` and will throw `KeyError` if the FK item is marked `primaryKey = True` (because the frontend sends the parent's itemId via RELATION_KEY, not the child's FK itemId).

**CRITICAL Audit Column**: Audit columns are mandatory in oden framework, if the table doesnt have audit column, usually ends with user (like prefix_update_user, and prefix_create_user). Oden will be broken when inserting new data, so audit columns 
are really matters 

**Python**:
```python
class FORM_CEmployeeDetailBlock(DataGridLayout):
    def __init__(self, blockId):
        super().__init__(blockId)
        # Bind to parent using foreign key
        self.whereclause = "detail_emp_code = %(empcode)s"
        self.databaseTable = "hr.employee_details"
```

**Python FK Item** (MUST be `primaryKey = False`):
```python
class FORM_Cdetailempcode(TextPrimary):
    itemId = "detailempcode"
    databaseColumn = "detail_emp_code"
    databaseItem = True
    nullable = False
    primaryKey = False  # CRITICAL: Must be False for FK items in child blocks

    def validate(self):
        return {"status": True, "msg": ""}
```

**Python preInsert** (sets FK value from parent):
```python
def preInsert(self):
    self.item("detailempcode").value = self.parentObj.block("PARENT_BLOCK").item("empcode").value
    return {"status": True, "msg": ""}
```

**JavaScript**:
```javascript
var winConfigForm = {
    "EMPLOYEE_DETAIL": {
        "ELEMENT": ["detailid", "detailtype", "detailvalue", "detaildate"],
        // Foreign key NOT in ELEMENT
        "PRIMARY_KEY": ["detailid"],
        "RELATION_KEY": ["empcode"],  // Parent's primary key
        "BLOCK_TYPE": ["DATAGRID", "CHILD"]
    }
}
```

### Pattern 3: Lookup/Reference Tables

```sql
-- Department table (lookup)
CREATE TABLE hr.departments (
    dept_code varchar(20) PRIMARY KEY,
    dept_name varchar(100),
    dept_status char(1)
);

-- Employee table with department reference
CREATE TABLE hr.employees (
    emp_code varchar(20) PRIMARY KEY,
    emp_dept_code varchar(20) REFERENCES hr.departments(dept_code),
    emp_name varchar(100)
);
```

**Analysis**:
- `emp_dept_code` should be LOV field
- Need description field `emp_dept_desc` (not in database)

**Python**:
```python
# Code field (in database)
class FORM_Cempdeptcode(Lov):
    itemId = "empdeptcode"
    databaseColumn = "emp_dept_code"
    databaseItem = True

# Description field (NOT in database)
class FORM_Cempdeptdesc(TextNormal):
    itemId = "empdeptdesc"
    databaseColumn = ""  # Empty - not in database
    databaseItem = False

# Fetch description in postSelect
class FORM_CEmployeeBlock(FormLayout):
    def postSelect(self, data):
        sql = """
            select dept_name as empdeptdesc
            from hr.departments
            where dept_code = %(empdeptcode)s
        """
        param = ["empdeptcode"]
        setDesc = ["empdeptdesc"]
        
        data = getDataDisplayItem({
            "DATA": data,
            "BLOCK_TYPE": self.blockType,
            "SQL": sql,
            "PARAM": param,
            "SET_DESC": setDesc
        })
        
        return {"status": data["status"], "data": data["data"]}
```

**JavaScript**:
```javascript
let elementEMPLOYEE = [
    LOVFIELD.TEXTLOVMULTICOLS({
        ITEM_ID: ["empdeptcode", "empdeptdesc"],
        LABEL: ["Department Code", "Department Name"],
        WINDOW_ID: "wdLovDepartment",
        TOTAL_COLS: 2,
        LENGTH: 0,
        UPPER: true
    })
]

function renderLov() {
    return [
        lov.lovField(
            "LovDepartment",
            ["empdeptcode", "empdeptdesc"],
            ["Department Code", "Department Name"],
            2
        )
    ]
}
```

## Special Column Patterns

### Pattern 1: Status/Flag Columns

```sql
status char(1) CHECK (status IN ('A', 'I', 'P'))
```

**Use ComboList**:
```python
class FORM_Cstatus(ComboList):
    itemId = "status"
    databaseColumn = "status"
```

```javascript
COMBO.COMBOLISTDEFAULT({
    ITEM_ID: "status",
    LABEL: "Status",
    OPTIONS: [
        { id: "A", value: "Active" },
        { id: "I", value: "Inactive" },
        { id: "P", value: "Pending" }
    ]
})
```

### Pattern 2: Yes/No Flags

```sql
is_active char(1) DEFAULT 'Y'
```

**Use CheckBox**:
```python
class FORM_Cisactive(CheckBox):
    itemId = "isactive"
    databaseColumn = "is_active"
```

```javascript
CHECKBOX.NORMALCHECKBOX({
    ITEM_ID: "isactive",
    LABEL: "Active",
    CHECK_VALUE: 'Y'
})
```

### Pattern 3: Sequence/Auto-Number

```sql
record_id varchar(20) PRIMARY KEY
-- Generated by sequence or timestamp
```

**Use autoNumberSeq**:
```javascript
var winConfigForm = {
    "BLOCK_NAME": {
        "WHEN_NEW_FORM": {
            "recordid": autoNumberSeq
        }
    }
}
```

```python
class FORM_CBlockName(FormLayout):
    def preInsert(self):
        import datetime
        itemElement = self.item("recordid")
        itemElement.value = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
        return {'status': True, 'message': ''}
```

### Pattern 4: Computed/Calculated Fields

```sql
-- Not in database, calculated on client
total_amount numeric(15,2)  -- sum of line items
```

**Create as noDbItems**:
```python
class FORM_Ctotalamount(Currency):
    itemId = "totalamount"
    databaseColumn = ""
    databaseItem = False  # Not in database

class FORM_CBlockName(FormLayout):
    def __init__(self, blockId):
        super().__init__(blockId)
        self.noDbItems = ["totalamount"]
```

### Pattern 5: JSON/JSONB Columns

```sql
metadata jsonb
```

**Treat as TextArea**:
```python
class FORM_Cmetadata(TextArea):
    itemId = "metadata"
    databaseColumn = "metadata"
```

```javascript
TEXTBOX.TEXTAREA({
    ITEM_ID: "metadata",
    LABEL: "Metadata (JSON)",
    LENGTH: 1000
})
```

## Constraint Analysis

### Primary Key Constraints

```sql
PRIMARY KEY (column1, column2)  -- Composite key
```

**Multiple primary keys**:
```python
class FORM_Ccolumn1(TextPrimary):
    primaryKey = True

class FORM_Ccolumn2(TextPrimary):
    primaryKey = True
```

```javascript
var winConfigForm = {
    "BLOCK_NAME": {
        "PRIMARY_KEY": ["column1", "column2"]
    }
}
```

### NOT NULL Constraints

```sql
column_name varchar(100) NOT NULL
```

**Set nullable=False**:
```python
class FORM_Ccolumnname(TextNormal):
    nullable = False
```

```javascript
let rulesBlock = {
    "columnname": webix.rules.isNotEmpty
}
```

### CHECK Constraints

```sql
CHECK (age >= 18 AND age <= 65)
```

**Implement in validation**:
```python
class FORM_Cage(NumericNormal):
    def validate(self):
        if self.value:
            age = int(self.value)
            if age < 18 or age > 65:
                return {"status": False, "msg": "Age must be between 18 and 65"}
        return {"status": True, "msg": ""}
```

### UNIQUE Constraints

```sql
UNIQUE (email)
```

**Check in validation**:
```python
class FORM_Cemail(TextNormal):
    def validate(self):
        # Check only on INSERT (Item → Record → Block → Form)
        if self.parentObj.parentObj.parentObj.actionActive == "INSERT":
            sql = """
                select count(*) as count
                from schema.table
                where email = %(email)s
            """
            result = selectHeaderQueryRO(sql, {"email": self.value})
            
            if result["data"][0]["count"] > 0:
                return {"status": False, "msg": "Email already exists"}
        
        return {"status": True, "msg": ""}
```

## Common DDL Patterns

### Pattern 1: Master-Detail Tables

```sql
-- Master
CREATE TABLE orders (
    order_id varchar(20) PRIMARY KEY,
    order_date date,
    customer_code varchar(20)
);

-- Detail
CREATE TABLE order_items (
    item_id varchar(20) PRIMARY KEY,
    order_id varchar(20) REFERENCES orders(order_id),
    product_code varchar(20),
    quantity integer,
    price numeric(15,2)
);
```

**Form Structure**:
- Parent: FormLayout (orders)
- Child: DataGridLayout (order_items)
- Relationship: `order_items.order_id = orders.order_id`

### Pattern 2: Multi-Level Hierarchy

```sql
-- Level 1
CREATE TABLE departments (
    dept_code varchar(20) PRIMARY KEY,
    dept_name varchar(100)
);

-- Level 2
CREATE TABLE employees (
    emp_code varchar(20) PRIMARY KEY,
    dept_code varchar(20) REFERENCES departments(dept_code),
    emp_name varchar(100)
);

-- Level 3
CREATE TABLE employee_skills (
    skill_id varchar(20) PRIMARY KEY,
    emp_code varchar(20) REFERENCES employees(emp_code),
    skill_name varchar(100)
);
```

**Form Structure**:
- Parent: departments (FORM, PARENT)
- Child: employees (DATAGRID, CHILD)
- Sub-Child: employee_skills (DATAGRID, SUB_CHILD)

### Pattern 3: Self-Referencing Tables

```sql
CREATE TABLE employees (
    emp_code varchar(20) PRIMARY KEY,
    emp_name varchar(100),
    manager_code varchar(20) REFERENCES employees(emp_code)
);
```

**Handle as LOV**:
```python
class FORM_Cmanagercode(Lov):
    itemId = "managercode"
    databaseColumn = "manager_code"

class FORM_Cmanagername(TextNormal):
    itemId = "managername"
    databaseColumn = ""
    databaseItem = False
```

## itemId Generation Rules

### Rule 1: Remove Underscores and Lowercase

```sql
emp_first_name → empfirstname
dept_code → deptcode
is_active → isactive
```

### Rule 2: Remove Table Prefix

```sql
emp_code → empcode (not code)
dept_name → deptname (not name)
```

**Why**: Keeps context, avoids conflicts

### Rule 3: Description Fields

```sql
-- Database column
dept_code

-- Generated itemIds
deptcode (code field)
deptdesc (description field, not in DB)
```

### Rule 4: Composite Keys

```sql
-- Database columns
period_year, period_month

-- itemIds
periodyear
periodmonth
```

## Checklist for DDL Analysis

- [ ] Identify all tables and relationships
- [ ] Mark primary keys
- [ ] Mark foreign keys (for whereclause)
- [ ] Identify NOT NULL columns
- [ ] Identify UNIQUE constraints
- [ ] Identify CHECK constraints
- [ ] Identify DEFAULT values
- [ ] Identify audit columns (exclude from items)
- [ ] Identify lookup/reference tables (LOV candidates)
- [ ] Determine parent-child relationships
- [ ] Map data types to Python/JavaScript classes
- [ ] Generate itemIds (lowercase, no underscores)
- [ ] Plan description fields for LOVs

## Quick Reference

### When to Use Each Type

**TextPrimary**: Primary key fields
**TextNormal**: Regular text, names, descriptions
**TextUpper**: Codes that should be uppercase
**TextLower**: Email addresses, URLs
**TextArea**: Long text, notes, comments
**NumericNormal**: Integers, quantities, IDs
**Currency**: Money, prices, salaries
**Calendar**: Dates, timestamps
**Time**: Time values
**CheckBox**: Boolean flags, Y/N fields
**Lov**: Foreign keys, lookup values
**ComboList**: Status fields, fixed options

---

**Remember**: Accurate database mapping is crucial. Take time to analyze the DDL thoroughly before generating code.
