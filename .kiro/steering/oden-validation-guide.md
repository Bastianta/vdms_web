---
inclusion: always
---

# Oden Framework Validation Guide

This steering file contains comprehensive validation patterns and best practices for the Oden Framework.

## Validation Hierarchy

```
Client-Side (JavaScript)
├── Field-level validation (on blur)
├── Form-level validation (on submit)
└── Cross-field validation

Server-Side (Python)
├── Item.validate() - Individual field validation
├── Record.validate() - Cross-field validation
├── Block pre/post hooks - Business logic validation
└── Custom API validation - Complex queries
```

## Client-Side Validation (JavaScript)

### 1. Built-in Webix Rules

```javascript
let rulesEMPLOYEE_HEAD = {
    "empcode": webix.rules.isNotEmpty,
    "empname": webix.rules.isNotEmpty,
    "empemail": webix.rules.isEmail,
    "age": webix.rules.isNumber,
    "salary": function(value) {
        return value > 0
    }
}
```

### 2. Custom Validation Functions

```javascript
// Simple validation
let validateAge = function() {
    return new Promise((resolve, reject) => {
        let age = getItemValue("age")
        
        if (age < 18 || age > 65) {
            resolve({
                "status": false,
                "tipe": "error",
                "pesan": "Age must be between 18 and 65"
            })
        } else {
            resolve({"status": true})
        }
    })
}

// Attach to element
NUMERIC.NUMERICNORMAL({
    ITEM_ID: "age",
    LABEL: "Age",
    LENGTH: 3
}, {
    VALIDATE_ITEM: validateAge
})
```

### 3. Cross-Field Validation

```javascript
let validateDateRange = function() {
    return new Promise((resolve, reject) => {
        let startdate = getItemValue("startdate")
        let enddate = getItemValue("enddate")
        
        if (!startdate || !enddate) {
            resolve({"status": true})  // Skip if either is empty
            return
        }
        
        if (enddate < startdate) {
            resolve({
                "status": false,
                "tipe": "error",
                "pesan": "End date must be after start date"
            })
        } else {
            resolve({"status": true})
        }
    })
}

// Attach to end date field
DATE.DDMMYY({
    ITEM_ID: "enddate",
    LABEL: "End Date"
}, {
    VALIDATE_ITEM: validateDateRange
})
```

### 4. Server-Side Validation from Client

```javascript
let validateEmployeeCode = function() {
    return new Promise((resolve, reject) => {
        let empcode = getItemValue("empcode")
        
        if (!empcode) {
            resolve({"status": true})
            return
        }
        
        // Call server to check if code exists
        restapi.restApiCustom({
            "DATA": {"empcode": empcode},
            "ITEM_ID": "checkEmployeeCode"
        }).then(function(response) {
            if (response.status) {
                if (response.data.exists) {
                    resolve({
                        "status": false,
                        "tipe": "error",
                        "pesan": "Employee code already exists"
                    })
                } else {
                    resolve({"status": true})
                }
            } else {
                resolve({
                    "status": false,
                    "tipe": "error",
                    "pesan": response.msg
                })
            }
        })
    })
}
```

### 5. LOV Validation

```javascript
let validateLovDepartment = function() {
    return validateLov({
        "LOV_CODE": "deptcode",
        "DISPLAY_ID": ["deptdesc"],
        "API_NAME": "validateLovDepartment_" + menuId
    })
}

// Attach to LOV field
LOVFIELD.TEXTLOVMULTICOLS({
    ITEM_ID: ["deptcode", "deptdesc"],
    LABEL: ["Dept Code", "Dept Name"],
    WINDOW_ID: "wdLovDepartment",
    TOTAL_COLS: 2,
    LENGTH: 0,
    UPPER: true
}, {
    VALIDATE_ITEM: validateLovDepartment
})
```

## Server-Side Validation (Python)

### 1. Item-Level Validation

```python
class FORM_Cempcode(TextPrimary):
    lengthItem = 20
    itemId = "empcode"
    databaseColumn = "emp_code"
    databaseItem = True
    nullable = False
    primaryKey = True
    allowSpecialChar = []
    
    def validate(self):
        """
        Validate individual field
        """
        if not self.value:
            return {"status": False, "msg": "Employee code is required"}
        
        if len(self.value) < 5:
            return {"status": False, "msg": "Employee code must be at least 5 characters"}
        
        # Check if code already exists (for new records)
        # Access actionActive from Form level: Item → Record → Block → Form
        if self.parentObj.parentObj.parentObj.actionActive == "INSERT":
            sql = """
                select count(*) as count
                from hr.employees
                where emp_code = %(empcode)s
            """
            result = selectDataHeaderQueryRO(sql, {"empcode": self.value})
            
            if result["data"][0]["count"] > 0:
                return {"status": False, "msg": "Employee code already exists"}
        
        return {"status": True, "msg": ""}
```

```python
class FORM_Cempemail(TextNormal):
    lengthItem = 100
    itemId = "empemail"
    databaseColumn = "emp_email"
    databaseItem = True
    nullable = True
    primaryKey = False
    allowSpecialChar = ["@", ".", "-", "_"]
    
    def validate(self):
        """
        Validate email format
        """
        if not self.value:
            return {"status": True, "msg": ""}  # Optional field
        
        import re
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        
        if not re.match(email_pattern, self.value):
            return {"status": False, "msg": "Invalid email format"}
        
        return {"status": True, "msg": ""}
```

```python
class FORM_Cage(NumericNormal):
    lengthItem = 3
    itemId = "age"
    databaseColumn = "age"
    databaseItem = True
    nullable = True
    primaryKey = False
    
    def validate(self):
        """
        Validate age range
        """
        if not self.value:
            return {"status": True, "msg": ""}
        
        age = int(self.value)
        
        if age < 18:
            return {"status": False, "msg": "Employee must be at least 18 years old"}
        
        if age > 65:
            return {"status": False, "msg": "Employee cannot be older than 65 years"}
        
        return {"status": True, "msg": ""}
```

### 2. Record-Level Validation

```python
class FORM_CRecordEmployee(Record):
    def validate(self):
        """
        Validate relationships between fields
        """
        # Get field values
        startdate = self.item("startdate").value
        enddate = self.item("enddate").value
        salary = self.item("salary").value
        position = self.item("position").value
        
        # Date range validation
        if startdate and enddate:
            if enddate < startdate:
                return {
                    "status": False,
                    "msg": "End date must be after start date"
                }
        
        # Salary validation based on position
        if position and salary:
            sql = """
                select min_salary, max_salary
                from hr.positions
                where position_code = %(position)s
            """
            result = selectDataHeaderQueryRO(sql, {"position": position})
            
            if result["data"]:
                min_sal = float(result["data"][0]["min_salary"])
                max_sal = float(result["data"][0]["max_salary"])
                sal = float(salary)
                
                if sal < min_sal or sal > max_sal:
                    return {
                        "status": False,
                        "msg": f"Salary must be between {min_sal} and {max_sal} for this position"
                    }
        
        # Check required fields
        required_fields = ["empcode", "empname", "hiredate"]
        for field_id in required_fields:
            item = self.item(field_id)
            if not item.value:
                return {
                    "status": False,
                    "msg": f"{field_id} is required"
                }
        
        return {"status": True, "msg": ""}
```

### 3. Block-Level Validation (Pre/Post Hooks)

```python
class FORM_CEmployeeBlock(FormLayout):
    def __init__(self, blockId):
        super().__init__(blockId)
        self.whereclause = ""
        self.databaseTable = "hr.employees"
        self.nonVisibleItems = []
        self.noDbItems = []
    
    def preInsert(self):
        """
        Validate before insert
        """
        # Check if department is active
        deptcode = self.item("deptcode").value
        
        sql = """
            select status
            from hr.departments
            where dept_code = %(deptcode)s
        """
        result = selectDataHeaderQueryRO(sql, {"deptcode": deptcode})
        
        if not result["data"]:
            return {"status": False, "msg": "Department not found"}
        
        if result["data"][0]["status"] != "A":
            return {"status": False, "msg": "Cannot assign employee to inactive department"}
        
        # Generate employee number
        import datetime
        empnumber = self.item("empnumber")
        empnumber.value = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
        
        return {"status": True, "msg": ""}
    
    def preUpdate(self):
        """
        Validate before update
        """
        # Check if employee has pending transactions
        empcode = self.item("empcode").value
        
        sql = """
            select count(*) as count
            from hr.transactions
            where emp_code = %(empcode)s
            and status = 'P'
        """
        result = selectDataHeaderQueryRO(sql, {"empcode": empcode})
        
        if result["data"][0]["count"] > 0:
            return {
                "status": False,
                "msg": "Cannot update employee with pending transactions"
            }
        
        return {"status": True, "msg": ""}
    
    def preDelete(self):
        """
        Validate before delete
        """
        empcode = self.item("empcode").value
        
        # Check if employee has any history
        sql = """
            select count(*) as count
            from hr.employee_history
            where emp_code = %(empcode)s
        """
        result = selectDataHeaderQueryRO(sql, {"empcode": empcode})
        
        if result["data"][0]["count"] > 0:
            return {
                "status": False,
                "msg": "Cannot delete employee with history records. Consider marking as inactive instead."
            }
        
        return {"status": True, "msg": ""}
```

### 4. Custom API Validation

```python
@exposeApi
def checkEmployeeCode_EMPLOYEE_FORM():
    """
    Check if employee code exists
    Called from client-side validation
    """
    ajaxData = request.json.get("data")
    empcode = ajaxData.get("empcode")
    
    sql = """
        select count(*) as count
        from hr.employees
        where emp_code = %(empcode)s
    """
    
    result = selectDataHeaderQueryRO(sql, {"empcode": empcode})
    
    exists = result["data"][0]["count"] > 0
    
    return {
        "status": True,
        "data": {"exists": exists},
        "msg": "Check complete"
    }

@exposeApi
def validateLovDepartment_EMPLOYEE_FORM():
    """
    Validate LOV selection and fetch description

    only take the description for the validation of LOV
    Dont return dict using your own logic, instead just return the result or the selectDataQueryRO, no need to create your own dict.

    """
    ajaxData = request.json.get("data")
    deptcode = ajaxData.get("deptcode")
    
    sql = """
        select 
            dept_name,
            status
        from hr.departments
        where dept_code = %(deptcode)s
    """
    
    result = selectDataQueryRO(sql, {"deptcode": deptcode})
    
    if not result["data"]:
        return {
            "status": False,
            "data": {},
            "msg": "Department not found"
        }
    
    return result

```

## Validation Patterns

### Pattern 1: Required Field

```python
# Python
def validate(self):
    if not self.value:
        return {"status": False, "msg": f"{self.itemId} is required"}
    return {"status": True, "msg": ""}
```

```javascript
// JavaScript
let rulesBlock = {
    "fieldname": webix.rules.isNotEmpty
}
```

### Pattern 2: Format Validation

```python
# Python - Email
import re
def validate(self):
    if self.value:
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(pattern, self.value):
            return {"status": False, "msg": "Invalid email format"}
    return {"status": True, "msg": ""}
```

```python
# Python - Phone
def validate(self):
    if self.value:
        # Remove non-digits
        digits = ''.join(filter(str.isdigit, self.value))
        if len(digits) < 10:
            return {"status": False, "msg": "Phone number must have at least 10 digits"}
    return {"status": True, "msg": ""}
```

### Pattern 3: Range Validation

```python
# Python
def validate(self):
    if self.value:
        value = float(self.value)
        if value < 0 or value > 100:
            return {"status": False, "msg": "Value must be between 0 and 100"}
    return {"status": True, "msg": ""}
```

### Pattern 4: Uniqueness Check

```python
# Python
def validate(self):
    # Check only on INSERT (Item → Record → Block → Form)
    if self.parentObj.parentObj.parentObj.actionActive == "INSERT":
        sql = """
            select count(*) as count
            from schema.table
            where column = %(value)s
        """
        result = selectDataHeaderQueryRO(sql, {"value": self.value})
        
        if result["data"][0]["count"] > 0:
            return {"status": False, "msg": "Value already exists"}
    
    return {"status": True, "msg": ""}
```

### Pattern 5: Conditional Validation

```python
# Python - Field required based on another field
class FORM_CRecordEmployee(Record):
    def validate(self):
        emptype = self.item("emptype").value
        contractnumber = self.item("contractnumber").value
        
        # Contract number required for contract employees
        if emptype == "CONTRACT" and not contractnumber:
            return {
                "status": False,
                "msg": "Contract number is required for contract employees"
            }
        
        return {"status": True, "msg": ""}
```

### Pattern 6: Database Constraint Validation

```python
# Python - Check foreign key exists
def validate(self):
    if self.value:
        sql = """
            select count(*) as count
            from hr.departments
            where dept_code = %(deptcode)s
            and status = 'A'
        """
        result = selectDataHeaderQueryRO(sql, {"deptcode": self.value})
        
        if result["data"][0]["count"] == 0:
            return {"status": False, "msg": "Invalid or inactive department"}
    
    return {"status": True, "msg": ""}
```

### Pattern 7: Business Rule Validation

```python
# Python - Complex business logic
class FORM_CEmployeeBlock(FormLayout):
    def preInsert(self):
        # Check if department has capacity
        deptcode = self.item("deptcode").value
        
        sql = """
            select 
                d.max_employees,
                count(e.emp_code) as current_count
            from hr.departments d
            left join hr.employees e on e.dept_code = d.dept_code
            where d.dept_code = %(deptcode)s
            group by d.max_employees
        """
        result = selectDataHeaderQueryRO(sql, {"deptcode": deptcode})
        
        if result["data"]:
            max_emp = result["data"][0]["max_employees"]
            current = result["data"][0]["current_count"]
            
            if current >= max_emp:
                return {
                    "status": False,
                    "msg": f"Department has reached maximum capacity ({max_emp} employees)"
                }
        
        return {"status": True, "msg": ""}
```

## Best Practices

### 1. When to Use Client vs Server Validation

**Client-Side (JavaScript)**:
- ✅ Format validation (email, phone, etc.)
- ✅ Required field checks
- ✅ Range validation
- ✅ Immediate user feedback
- ✅ Reduce server load

**Server-Side (Python)**:
- ✅ Database queries
- ✅ Uniqueness checks
- ✅ Foreign key validation
- ✅ Complex business rules
- ✅ Security-critical validation

**Both**:
- ✅ Important validations (defense in depth)
- ✅ User experience + security

### 2. Error Messages

**Good Error Messages**:
- ✅ "Employee code must be at least 5 characters"
- ✅ "End date must be after start date"
- ✅ "Department is inactive and cannot accept new employees"

**Bad Error Messages**:
- ❌ "Invalid input"
- ❌ "Error"
- ❌ "Validation failed"

### 3. Validation Timing

**On Blur** (field loses focus):
- Format validation
- Required field check
- Simple validations

**On Submit** (save/update):
- Cross-field validation
- Database checks
- Complex business rules

**Real-time** (as user types):
- Character limits
- Format hints
- Availability checks (debounced)

### 4. Performance Considerations

```python
# ❌ BAD - Query in loop
for item in self.items:
    sql = "select * from table where id = %(id)s"
    result = selectDataHeaderQueryRO(sql, {"id": item.value})

# ✅ GOOD - Single query
item_ids = [item.value for item in self.items]
sql = "select * from table where id = ANY(%(ids)s)"
result = selectDataHeaderQueryRO(sql, {"ids": item_ids})
```

### 5. Validation Order

1. **Format validation** (cheapest)
2. **Required field checks**
3. **Range validation**
4. **Cross-field validation**
5. **Database queries** (most expensive)

## Common Validation Scenarios

### Scenario 1: Master-Detail Validation

```python
# Ensure child records exist before allowing parent delete
class FORM_CParentBlock(FormLayout):
    def preDelete(self):
        parentid = self.item("parentid").value
        
        sql = """
            select count(*) as count
            from schema.child_table
            where parent_id = %(parentid)s
        """
        result = selectDataHeaderQueryRO(sql, {"parentid": parentid})
        
        if result["data"][0]["count"] > 0:
            return {
                "status": False,
                "msg": "Cannot delete parent record with existing child records"
            }
        
        return {"status": True, "msg": ""}
```

### Scenario 2: Date Range Validation

```python
# Record-level validation
class FORM_CRecordContract(Record):
    def validate(self):
        startdate = self.item("startdate").value
        enddate = self.item("enddate").value
        
        if startdate and enddate:
            from datetime import datetime
            start = datetime.strptime(startdate, "%Y-%m-%d")
            end = datetime.strptime(enddate, "%Y-%m-%d")
            
            if end <= start:
                return {"status": False, "msg": "End date must be after start date"}
            
            # Check minimum contract duration
            duration = (end - start).days
            if duration < 30:
                return {"status": False, "msg": "Contract must be at least 30 days"}
        
        return {"status": True, "msg": ""}
```

### Scenario 3: Conditional Required Fields

```javascript
// JavaScript - Dynamic validation
let validateContractNumber = function() {
    return new Promise((resolve, reject) => {
        let emptype = getItemValue("emptype")
        let contractnumber = getItemValue("contractnumber")
        
        if (emptype === "CONTRACT" && !contractnumber) {
            resolve({
                "status": false,
                "tipe": "error",
                "pesan": "Contract number is required for contract employees"
            })
        } else {
            resolve({"status": true})
        }
    })
}
```

## Validation Checklist

- [ ] All required fields validated
- [ ] Format validation for emails, phones, etc.
- [ ] Range validation for numbers and dates
- [ ] Uniqueness checks for primary keys
- [ ] Foreign key validation
- [ ] Cross-field validation
- [ ] Business rule validation
- [ ] Clear, helpful error messages
- [ ] Client-side validation for UX
- [ ] Server-side validation for security
- [ ] Performance optimized (minimal queries)
- [ ] Validation order optimized (cheap first)

---

**Remember**: Validation is your first line of defense against bad data. Validate early, validate often, and always validate on the server.
