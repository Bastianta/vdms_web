---
inclusion: always
---

# Oden Framework JavaScript Patterns

This steering file contains detailed JavaScript code generation patterns for the Oden Framework frontend.

## JavaScript File Structure

Every JavaScript form file MUST follow this exact structure:

```javascript
// 1. menuId variable
// 2. winFormTitle variable
// 3. winConfigForm object (block configuration)
// 4. winRestApi function
// 5. hideButton object
// 6. Element arrays (one per block)
// 7. Rules objects (one per block)
// 8. Block creation (form.SimpleForm or datatable.SimpleDatatable)
// 9. renderLov function (if LOV fields exist)
// 10. Layout definition
// 11. webix.ready() initialization
```

## 1. menuId and winFormTitle

```javascript
var menuId = "EMPLOYEE_FORM"  // Must match Python filename

var winFormTitle = "Employee Management Form"  // Display title
```

## 2. winConfigForm Object

### Parent Block (Form)

```javascript
var winConfigForm = {
    "EMPLOYEE_HEAD": {
        "ELEMENT": ["empcode", "empname", "empemail", "hiredate", "salary", "status"],
        "PRIMARY_KEY": ["empcode"],
        "RELATION_KEY": [],  // Parent always empty
        "WHEN_NEW_FORM": {
            "empcode": autoNumberSeq  // Auto-generate on new record
        },
        "BLOCK_TYPE": ["FORM", "PARENT"],
        "LOV_API": {
            "deptcode": {
                "ITEM_ID": "deptcode",
                "TABLE_ID": "dtLovDepartment"
            }
        }
    }
}
```

### CRITICAL: autoNumberSeq Only Works with TEXTBOX Elements

**RULE**: The `autoNumberSeq` placeholder in `WHEN_NEW_FORM` **only works with TEXTBOX elements**, not with NUMERIC elements.

**❌ WRONG - autoNumberSeq with NUMERIC element:**
```javascript
var winConfigForm = {
    "TRANSACTION_HEAD": {
        "WHEN_NEW_FORM": {
            "transactionno": autoNumberSeq  // ❌ Won't show "AUTO" if field is NUMERIC
        }
    }
}

let elementTRANSACTION_HEAD = [
    NUMERIC.NUMERICNORMAL({  // ❌ WRONG - autoNumberSeq won't work
        ITEM_ID: "transactionno",
        LABEL: "Transaction No",
        LENGTH: 10,
        IS_PRIMARY_KEY: true
    })
]
```

**✅ CORRECT - autoNumberSeq with TEXTBOX element:**
```javascript
var winConfigForm = {
    "TRANSACTION_HEAD": {
        "WHEN_NEW_FORM": {
            "transactionno": autoNumberSeq  // ✅ Will show "AUTO" placeholder
        }
    }
}

let elementTRANSACTION_HEAD = [
    TEXTBOX.TEXTPRIMARY({  // ✅ CORRECT - autoNumberSeq works
        ITEM_ID: "transactionno",
        LABEL: "Transaction No (Auto)",
        LENGTH: 10,
        IS_PRIMARY_KEY: true,
        DISPLAY_ITEM: true  // Make it read-only since auto-generated
    })
]
```

**Why this matters:**
- When you click "Add" to create a new record, fields with `autoNumberSeq` in `WHEN_NEW_FORM` will show "AUTO" as placeholder
- This only works for TEXTBOX elements (TEXTPRIMARY, TEXTNORMAL, TEXTUPPER, etc.)
- NUMERIC elements cannot display the "AUTO" placeholder text
- Even if the database column is numeric, use TEXTBOX in JavaScript and let the backend handle type conversion

**Best Practice for Auto-Generated Numeric IDs:**
1. Use `TEXTBOX.TEXTPRIMARY` in JavaScript (not NUMERIC)
2. Set `DISPLAY_ITEM: true` to make it read-only
3. Add "(Auto)" to the label for clarity
4. Backend `preInsert` generates the actual numeric value
5. Database stores it as numeric type

### Child Block (Datagrid)

```javascript
var winConfigForm = {
    "EMPLOYEE_DETAIL": {
        "ELEMENT": ["detailid", "detailtype", "detailvalue", "detaildate"],
        "PRIMARY_KEY": ["detailid"],
        "RELATION_KEY": ["empcode"],  // References parent's PRIMARY_KEY
        "WHEN_NEW_FORM": {},
        "BLOCK_TYPE": ["DATAGRID", "CHILD"],
        "LOAD_DATA_AT_START": true,  // Load when parent record selected
        "REST_API": {
            "BLOCK_NAME": "EMPLOYEE_DETAIL",  // CRITICAL: Current block name, NOT parent
            "PARAM_ID": ["empcode"]  // Parent's primary key
        },
        "LOV_API": {}
    }
}
```

### Multi-Level Child (Sub-Child)

```javascript
var winConfigForm = {
    "EMPLOYEE_HISTORY": {
        "ELEMENT": ["historyid", "historydate", "historynotes"],
        "PRIMARY_KEY": ["historyid"],
        "RELATION_KEY": ["detailid"],  // References immediate parent
        "WHEN_NEW_FORM": {},
        "BLOCK_TYPE": ["DATAGRID", "SUB_CHILD"],
        "LOAD_DATA_AT_START": false,
        "REST_API": {
            "BLOCK_NAME": "EMPLOYEE_HISTORY",
            "PARAM_ID": ["detailid"]
        }
    }
}
```

## 3. winRestApi Function

```javascript
var winRestApi = function(){
    loadDataBlockAtStart()  // Loads blocks with LOAD_DATA_AT_START: true
}
```

## 4. hideButton Object

```javascript
var hideButton = {
    // true = hidden, false = visible
    "next": false,           // Next record button
    "searchValue": false,    // Search button
    "addValue": false,       // Add button
    "updateValue": false,    // Update button
    "deleteValue": false,    // Delete button
    "clearBtn": false        // Clear button
}
```

## 5. Element Arrays

### Form Elements

```javascript
let elementEMPLOYEE_HEAD = [
    // Text Primary (Primary Key)
    TEXTBOX.TEXTPRIMARY({
        ITEM_ID: "empcode",
        LABEL: "Employee Code",
        LENGTH: 20,
        IS_PRIMARY_KEY: true
    }),
    
    // Text Normal
    TEXTBOX.TEXTNORMAL({
        ITEM_ID: "empname",
        LABEL: "Employee Name",
        LENGTH: 100
    }),
    
    // Text Upper
    TEXTBOX.TEXTUPPER({
        ITEM_ID: "empemail",
        LABEL: "Email",
        LENGTH: 100
    }),
    
    // Text Display (Read-only, non-editable field)
    TEXTBOX.TEXTDISPLAY({
        ITEM_ID: "deptdesc",
        LABEL: "Department",
        LENGTH: 100
    }),
    
    // Text Area
    TEXTBOX.TEXTAREA({
        ITEM_ID: "notes",
        LABEL: "Notes",
        LENGTH: 500
    }),
    
    // Numeric Normal
    NUMERIC.NUMERICNORMAL({
        ITEM_ID: "age",
        LABEL: "Age",
        LENGTH: 3
    }),
    
    // Currency
    NUMERIC.CURRENCY({
        ITEM_ID: "salary",
        LABEL: "Salary",
        LENGTH: 15
    }),
    
    // Float (for decimal numbers)
    NUMERIC.FLOAT({
        ITEM_ID: "rating",
        LABEL: "Performance Rating",
        LENGTH: 5
    }),
    
    // Date
    DATE.DDMMYY({
        ITEM_ID: "hiredate",
        LABEL: "Hire Date"
    }),
    
    // Month/Year
    DATE.MMYY({
        ITEM_ID: "reviewmonth",
        LABEL: "Review Month"
    }),
    
    // Year
    DATE.YY({
        ITEM_ID: "reviewyear",
        LABEL: "Review Year"
    }),
    
    // Time
    DATE.CLOCK({
        ITEM_ID: "checkintime",
        LABEL: "Check-in Time",
        ADD_SECOND: false
    }),
    
    // Timestamp
    DATE.DDMMYY({
        ITEM_ID: "lastlogin",
        LABEL: "Last Login"
    }),
    
    // Checkbox
    CHECKBOX.NORMALCHECKBOX({
        ITEM_ID: "isactive",
        LABEL: "Active",
        CHECK_VALUE: 'Y'  // Value when checked
    }),
    
    // Combo List (Static Options)
    COMBO.COMBOLISTDEFAULT({
        ITEM_ID: "status",
        LABEL: "Status",
        OPTIONS: [
            { id: "A", value: "Active" },
            { id: "I", value: "Inactive" },
            { id: "P", value: "Pending" }
        ],
        IS_PRIMARY_KEY: false
    }),
    
    // Combo List (API-driven) - MUST have matching restapi.restApiCombo in webix.ready
    // and a Python @exposeApi function returning "id" and "value" aliases
    COMBO.COMBOLISTAPI({
        ITEM_ID: "category",
        LABEL: "Category",
        PARAM_ID: []  // Parameters to pass to API
    }),
    
    // Radio Button
    RADIO.RADIOBUTTON({
        ITEM_ID: "gender",
        LABEL: "Gender",
        OPTIONS: [
            { id: "M", value: "Male" },
            { id: "F", value: "Female" }
        ],
        IS_PRIMARY_KEY: false
    }),
    
    // LOV Field (Single Column)
    LOVFIELD.TEXTLOVMULTICOLS({
        ITEM_ID: ["deptcode"],
        LABEL: ["Department Code"],
        WINDOW_ID: "wdLovDepartment",
        TOTAL_COLS: 1,
        LENGTH: 0,
        UPPER: true
    }),
    
    // LOV Field (Multiple Columns)
    LOVFIELD.TEXTLOVMULTICOLS({
        ITEM_ID: ["deptcode", "deptdesc"],
        LABEL: ["Department Code", "Department Name"],
        WINDOW_ID: "wdLovDepartment",
        TOTAL_COLS: 2,
        LENGTH: 0,
        UPPER: true
    }),
    
    // Button in Form
    {cols: [
        {},
        BUTTON.BUTTONFORM({
            ITEM_ID: "btnCalculate",
            LABEL: "Calculate Bonus"
        }, {
            CUSTOM_CLICK: calculateBonus
        })
    ]}
]
```

### Datagrid Elements

```javascript
let elementEMPLOYEE_DETAIL = [
    TEXTBOX.TEXTPRIMARY({
        ITEM_ID: "detailid",
        LABEL: "Detail ID",
        LENGTH: 20,
        IS_PRIMARY_KEY: true
    }),
    
    TEXTBOX.TEXTNORMAL({
        ITEM_ID: "detailtype",
        LABEL: "Type",
        LENGTH: 50
    }),
    
    NUMERIC.CURRENCY({
        ITEM_ID: "detailvalue",
        LABEL: "Value",
        LENGTH: 15
    }),
    
    DATE.DDMMYY({
        ITEM_ID: "detaildate",
        LABEL: "Date"
    }),
    
    // Button in Datagrid
    BUTTON.BUTTONDATAGRID({
        ITEM_ID: "btnView",
        LABEL: "View"
    }, {
        CUSTOM_CLICK: viewDetail
    })
]
```

### Layout with Rows and Columns

```javascript
let elementEMPLOYEE_HEAD = [
    // Single row with multiple columns
    {cols: [
        TEXTBOX.TEXTPRIMARY({ITEM_ID: "empcode", LABEL: "Code", LENGTH: 20, IS_PRIMARY_KEY: true}),
        TEXTBOX.TEXTNORMAL({ITEM_ID: "empname", LABEL: "Name", LENGTH: 100})
    ]},
    
    // Another row
    {cols: [
        DATE.DDMMYY({ITEM_ID: "hiredate", LABEL: "Hire Date"}),
        NUMERIC.CURRENCY({ITEM_ID: "salary", LABEL: "Salary", LENGTH: 15})
    ]},
    
    // Full-width field
    TEXTBOX.TEXTAREA({ITEM_ID: "notes", LABEL: "Notes", LENGTH: 500})
]
```

### CRITICAL: Consistent Column Layout

**RULE**: For proper UI alignment, ALL fields in a form MUST use the `{cols: [...]}` structure consistently. If a row has only one field, add an empty object `{}` as the second column.

**❌ WRONG - Inconsistent layout causes misalignment:**
```javascript
let elementMY_FORM = [
    // Some fields with cols
    {cols: [
        TEXTBOX.TEXTPRIMARY({ITEM_ID: "field1", LABEL: "Field 1", LENGTH: 20}),
        TEXTBOX.TEXTNORMAL({ITEM_ID: "field2", LABEL: "Field 2", LENGTH: 50})
    ]},
    
    // Some fields without cols - THIS CAUSES MISALIGNMENT
    TEXTBOX.TEXTNORMAL({ITEM_ID: "field3", LABEL: "Field 3", LENGTH: 100}),
    
    TEXTBOX.TEXTAREA({ITEM_ID: "field4", LABEL: "Field 4", LENGTH: 200})
]
```

**✅ CORRECT - Consistent layout with proper alignment:**
```javascript
let elementMY_FORM = [
    // Row 1: Two fields side by side
    {cols: [
        TEXTBOX.TEXTPRIMARY({ITEM_ID: "field1", LABEL: "Field 1", LENGTH: 20}),
        TEXTBOX.TEXTNORMAL({ITEM_ID: "field2", LABEL: "Field 2", LENGTH: 50})
    ]},
    
    // Row 2: One field on left, empty space on right
    {cols: [
        TEXTBOX.TEXTNORMAL({ITEM_ID: "field3", LABEL: "Field 3", LENGTH: 100}),
        {}  // Empty object for consistent alignment
    ]},
    
    // Row 3: Full-width textarea
    {cols: [
        TEXTBOX.TEXTAREA({ITEM_ID: "field4", LABEL: "Field 4", LENGTH: 200}),
        {}  // Empty object for consistent alignment
    ]}
]
```

**Why this matters:**
- Without `{cols: [...]}`, fields shift to the right side of the form
- Inconsistent layout creates visual confusion and poor UX
- The framework expects either all fields in `{cols}` or none at all
- Mixing both styles breaks the layout engine's column calculation

**Best Practice:**
1. Wrap EVERY element in `{cols: [element1, element2]}`
2. If only one field in a row: `{cols: [element, {}]}`
3. Buttons can be paired: `{cols: [button1, button2]}`
4. Keep it consistent throughout the entire element array

## 6. Rules Objects

```javascript
// Form rules
let rulesEMPLOYEE_HEAD = {
    "empcode": webix.rules.isNotEmpty,
    "empname": webix.rules.isNotEmpty,
    "empemail": webix.rules.isEmail,
    "hiredate": webix.rules.isNotEmpty
}

// Datagrid rules
let rulesEMPLOYEE_DETAIL = {
    "detailid": webix.rules.isNotEmpty,
    "detailtype": webix.rules.isNotEmpty,
    "detailvalue": webix.rules.isNumber
}
```

## 7. Block Creation

### Form Block

```javascript
let blockEMPLOYEE_HEAD = form.SimpleForm(
    "EMPLOYEE_HEAD",           // Block name (matches winConfigForm key)
    elementEMPLOYEE_HEAD,      // Element array
    rulesEMPLOYEE_HEAD         // Rules object
)
```

### Datagrid Block

```javascript
let blockEMPLOYEE_DETAIL = datatable.SimpleDatatable(
    "EMPLOYEE_DETAIL",         // Block name
    elementEMPLOYEE_DETAIL,    // Element array
    rulesEMPLOYEE_DETAIL,      // Rules object
    [1, 0]                     // Freeze columns [left, right]
)
```

### Datagrid with Custom Buttons

```javascript
// Define buttons below the datagrid
let buttonDatagridEMPLOYEE_DETAIL = [
    BUTTON.CUSTOMBUTTON({
        ITEM_ID: "btnExport",
        LABEL: "Export to Excel",
        CUSTOM_WIDTH: 150,
        CALL_FORM: false
    }, {
        CUSTOM_CLICK: exportToExcel
    }),
    
    BUTTON.CUSTOMBUTTON({
        ITEM_ID: "btnCheckAll",
        LABEL: "Check All"
    }, {
        CUSTOM_CLICK: function() {
            checkAllDt({
                "BLOCK_ID": "EMPLOYEE_DETAIL",
                "COLUMN_ID": "isselected"
            })
        }
    })
]

let blockEMPLOYEE_DETAIL = datatable.SimpleDatatable(
    "EMPLOYEE_DETAIL",
    elementEMPLOYEE_DETAIL,
    rulesEMPLOYEE_DETAIL,
    [1, 0],
    buttonDatagridEMPLOYEE_DETAIL  // Pass buttons as 5th parameter
)
```

## 8. Multiview

### Horizontal Multiview

```javascript
let multi1 = multiview.element("Employee Details", blockEMPLOYEE_DETAIL)
let multi2 = multiview.element("Employee History", blockEMPLOYEE_HISTORY)
let multi3 = multiview.element("Employee Documents", blockEMPLOYEE_DOCS)

let multiviewGrouping = multiview.view([multi1, multi2, multi3])
```

### Vertical Multiview

```javascript
let multi1 = verticalMultiView.element("Details", blockEMPLOYEE_DETAIL)
let multi2 = verticalMultiView.element("History", blockEMPLOYEE_HISTORY)

let verticalMultiviewGrouping = verticalMultiView.view([multi1, multi2])
```

## 9. renderLov Function

```javascript
function renderLov() {
    return [
        // Single column LOV
        lov.lovField(
            "LovDepartment",                    // Window name (dt + this = TABLE_ID)
            ["deptcode"],                       // itemIds
            ["Department Code"],                // Labels
            1                                   // Number of columns
        ),
        
        // Multi-column LOV
        lov.lovField(
            "LovEmployee",
            ["empcode", "empname", "empdept", "empposition"],
            ["Code", "Name", "Department", "Position"],
            4
        ),
        
        // LOV with description fields
        lov.lovField(
            "LovBranch",
            ["branchcode", "branchdesc", "branchcity"],
            ["Branch Code", "Branch Name", "City"],
            3
        )
    ]
}
```

## 10. Layout Definition

### Simple Layout (Form + Datagrid)

```javascript
let content = layout.baseLayout([
    blockEMPLOYEE_HEAD,        // Parent form
    blockEMPLOYEE_DETAIL       // Child datagrid
])
```

### Layout with Multiview

```javascript
let content = layout.baseLayout([
    blockEMPLOYEE_HEAD,        // Parent form
    multiviewGrouping          // Multiple child views
])
```

### Complex Layout

```javascript
let content = layout.baseLayout([
    blockEMPLOYEE_HEAD,        // Parent
    blockEMPLOYEE_DETAIL,      // First child
    multiviewGrouping          // Additional children in tabs
])
```

## 11. webix.ready() Initialization

```javascript
webix.ready(function(){
    restapi.restApiSelect()  // Load initial data
    
    // CRITICAL: Every COMBO.COMBOLISTAPI element MUST have a corresponding restApiCombo call
    restapi.restApiCombo({"ITEM_ID": "category", "API_NAME": "getCategoryList_" + menuId, "PARAM_ID": []})
})
```

**CRITICAL**: For every `COMBO.COMBOLISTAPI` element, you MUST add a `restapi.restApiCombo` call in `webix.ready`. The Python API MUST return columns aliased as `id` and `value`:

```python
@exposeApi
def getCategoryList_MENU_ID():
    sql = """
        select column_code as id, column_desc as value
        from schema.table_name
        order by column_code
    """
    result = selectHeaderQueryRO(sql)
    return result
```

## Custom Functions

### Button Click Handler

```javascript
let calculateBonus = function() {
    // Get form values
    let salary = getItemValue("salary")
    let performance = getItemValue("performance")
    
    // Call custom API
    let data = {
        "salary": salary,
        "performance": performance
    }
    
    restapi.restApiCustom({
        "DATA": data,
        "ITEM_ID": "calculateBonus"
    }).then(function(response) {
        if (response.status) {
            // Set result
            $("bonus").setValue(response.data.bonus)
            MSGBOX("Bonus calculated: " + response.data.bonus)
        } else {
            RMSGBOX(response.msg)
        }
    })
}
```

### Validation Function

```javascript
let validateDate = function() {
    return new Promise((resolve, reject) => {
        let startdate = getItemValue("startdate")
        let enddate = getItemValue("enddate")
        
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

// Attach to element
DATE.DDMMYY({
    ITEM_ID: "enddate",
    LABEL: "End Date"
}, {
    VALIDATE_ITEM: validateDate
})
```

### Server-Side Validation

```javascript
let validateEmployee = function() {
    return new Promise((resolve, reject) => {
        let blockData = getBlockValue("EMPLOYEE_HEAD")
        
        restapi.restApiCustom({
            "DATA": blockData,
            "ITEM_ID": "validateEmployee"
        }).then(function(response) {
            if (response.status) {
                resolve({"status": true})
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

## Call Form Implementation

### Call Form Button

```javascript
let triggerCallForm = function() {
    callForm("EMPLOYEE_DETAIL_ND")  // Call another form
}

// In element array
BUTTON.BUTTONFORM({
    ITEM_ID: "btnViewDetail",
    LABEL: "View Detail",
    CALL_FORM: true  // CRITICAL: Must be true
}, {
    CUSTOM_CLICK: triggerCallForm
})
```

### Call Back Button

```javascript
let triggerCallBack = function() {
    return callBack("EMPLOYEE_FORM")  // Return to calling form
}

// In called form
BUTTON.BUTTONFORM({
    ITEM_ID: "btnBack",
    LABEL: "Back"
}, {
    CUSTOM_CLICK: triggerCallBack
})
```

## Display-Only Fields (Non-Editable)

### CRITICAL: DISPLAY_ITEM vs READ_ONLY

**RULE**: The Oden Framework does **NOT** support a `READ_ONLY` attribute. To create display-only (non-editable) fields, use one of these approaches:

**Option 1: Use TEXTBOX.TEXTDISPLAY element type** (Recommended)
```javascript
// ✅ CORRECT - Display-only field using TEXTDISPLAY
TEXTBOX.TEXTDISPLAY({
    ITEM_ID: "totalprice",
    LABEL: "Total Price",
    LENGTH: 15
})
```

**Option 2: Use DISPLAY_ITEM attribute with regular element types**
```javascript
// ✅ CORRECT - Display-only using DISPLAY_ITEM attribute
TEXTBOX.TEXTNORMAL({
    ITEM_ID: "calculatedfield",
    LABEL: "Calculated Field",
    LENGTH: 50,
    DISPLAY_ITEM: true  // Makes field non-editable
})

NUMERIC.CURRENCY({
    ITEM_ID: "balance",
    LABEL: "Account Balance",
    LENGTH: 15,
    DISPLAY_ITEM: true  // Makes field non-editable
})
```

**❌ WRONG - READ_ONLY does not exist in Oden**
```javascript
// ❌ WRONG - Will cause errors
TEXTBOX.TEXTNORMAL({
    ITEM_ID: "field",
    LABEL: "Field",
    LENGTH: 50,
    READ_ONLY: true  // ❌ INVALID ATTRIBUTE - does not exist
})

COMBO.COMBOLISTDEFAULT({
    ITEM_ID: "status",
    LABEL: "Status",
    OPTIONS: [...],
    READ_ONLY: true  // ❌ INVALID ATTRIBUTE - does not exist
})
```

**When to use each approach:**

| Approach | Use Case |
|----------|----------|
| `TEXTBOX.TEXTDISPLAY` | Description fields fetched from LOV, computed/calculated fields, audit fields (created/updated by/at) |
| `DISPLAY_ITEM: true` | Any field that should be visible but not editable, auto-generated IDs, status fields that change only via backend logic |

**Examples of common display-only fields:**
```javascript
// Auto-generated transaction ID
TEXTBOX.TEXTPRIMARY({
    ITEM_ID: "transactionid",
    LABEL: "Transaction ID",
    LENGTH: 20,
    IS_PRIMARY_KEY: true,
    DISPLAY_ITEM: true  // User cannot edit, auto-generated
})

// Status field (changes only via Approve/Reject buttons, not manual input)
COMBO.COMBOLISTDEFAULT({
    ITEM_ID: "approvalstatus",
    LABEL: "Status",
    OPTIONS: [
        { id: "P", value: "Pending" },
        { id: "A", value: "Approved" },
        { id: "R", value: "Rejected" }
    ],
    DISPLAY_ITEM: true  // Display only, changes via workflow buttons
})

// Calculated total
NUMERIC.CURRENCY({
    ITEM_ID: "grandtotal",
    LABEL: "Grand Total",
    LENGTH: 15,
    DISPLAY_ITEM: true  // Calculated from other fields, not editable
})

// LOV description field
TEXTBOX.TEXTDISPLAY({
    ITEM_ID: "customername",
    LABEL: "Customer Name",
    LENGTH: 100  // Fetched from LOV, not editable
})
```

**Remember**: 
- `READ_ONLY` attribute **does not exist** in Oden Framework
- Use `TEXTBOX.TEXTDISPLAY` for description fields
- Use `DISPLAY_ITEM: true` for any element that should be visible but not editable

## Helper Functions

### Get/Set Values

```javascript
// Get single item value
let empcode = getItemValue("empcode")

// Get entire block values (all fields)
let blockData = getBlockValue("EMPLOYEE_HEAD")

// Get current active row in datagrid
let activeRow = getRecordValueDt("EMPLOYEE_DETAIL")

// Set value in form
$("empname").setValue("John Doe")

// Set value in datagrid (active row)
setValueDt(["empname"], ["John Doe"])

// Set multiple values in datagrid
setValueDt(
    ["empname", "empemail"],
    ["John Doe", "john@example.com"]
)
```

### Messages

```javascript
// Info message
MSGBOX("Operation completed successfully")

// Error message
RMSGBOX("An error occurred")

// Confirm dialog
webix.confirm({
    title: "Confirm Delete",
    text: "Are you sure you want to delete this record?",
    callback: function(result) {
        if (result) {
            // User clicked OK
            deleteRecord()
        }
    }
})
```

### Checkbox Operations

```javascript
// Check all checkboxes in datagrid
checkAllDt({
    "BLOCK_ID": "EMPLOYEE_DETAIL",
    "COLUMN_ID": "isselected"
})

// Uncheck all checkboxes
uncheckAllDt({
    "BLOCK_ID": "EMPLOYEE_DETAIL",
    "COLUMN_ID": "isselected"
})
```

## Complete Example

```javascript
var menuId = "EMPLOYEE_FORM"
var winFormTitle = "Employee Management"

var winConfigForm = {
    "EMPLOYEE_HEAD": {
        "ELEMENT": ["empcode", "empname", "deptcode", "deptdesc", "salary", "hiredate"],
        "PRIMARY_KEY": ["empcode"],
        "RELATION_KEY": [],
        "WHEN_NEW_FORM": {"empcode": autoNumberSeq},
        "BLOCK_TYPE": ["FORM", "PARENT"],
        "LOV_API": {
            "deptcode": {"ITEM_ID": "deptcode", "TABLE_ID": "dtLovDepartment"}
        }
    },
    "EMPLOYEE_DETAIL": {
        "ELEMENT": ["detailid", "detailtype", "detailvalue"],
        "PRIMARY_KEY": ["detailid"],
        "RELATION_KEY": ["empcode"],
        "WHEN_NEW_FORM": {},
        "BLOCK_TYPE": ["DATAGRID", "CHILD"],
        "LOAD_DATA_AT_START": true,
        "REST_API": {
            "BLOCK_NAME": "EMPLOYEE_DETAIL",
            "PARAM_ID": ["empcode"]
        }
    }
}

var winRestApi = function(){
    loadDataBlockAtStart()
}

var hideButton = {
    "next": false,
    "searchValue": false,
    "addValue": false,
    "updateValue": false,
    "deleteValue": false,
    "clearBtn": false
}

let elementEMPLOYEE_HEAD = [
    TEXTBOX.TEXTPRIMARY({ITEM_ID: "empcode", LABEL: "Employee Code", LENGTH: 20, IS_PRIMARY_KEY: true}),
    TEXTBOX.TEXTNORMAL({ITEM_ID: "empname", LABEL: "Employee Name", LENGTH: 100}),
    LOVFIELD.TEXTLOVMULTICOLS({ITEM_ID: ["deptcode", "deptdesc"], LABEL: ["Dept Code", "Dept Name"], WINDOW_ID: "wdLovDepartment", TOTAL_COLS: 2, LENGTH: 0, UPPER: true}),
    NUMERIC.CURRENCY({ITEM_ID: "salary", LABEL: "Salary", LENGTH: 15}),
    DATE.DDMMYY({ITEM_ID: "hiredate", LABEL: "Hire Date"})
]

let rulesEMPLOYEE_HEAD = {
    "empcode": webix.rules.isNotEmpty,
    "empname": webix.rules.isNotEmpty
}

let blockEMPLOYEE_HEAD = form.SimpleForm("EMPLOYEE_HEAD", elementEMPLOYEE_HEAD, rulesEMPLOYEE_HEAD)

let elementEMPLOYEE_DETAIL = [
    TEXTBOX.TEXTPRIMARY({ITEM_ID: "detailid", LABEL: "ID", LENGTH: 20, IS_PRIMARY_KEY: true}),
    TEXTBOX.TEXTNORMAL({ITEM_ID: "detailtype", LABEL: "Type", LENGTH: 50}),
    NUMERIC.CURRENCY({ITEM_ID: "detailvalue", LABEL: "Value", LENGTH: 15})
]

let rulesEMPLOYEE_DETAIL = {
    "detailid": webix.rules.isNotEmpty
}

let blockEMPLOYEE_DETAIL = datatable.SimpleDatatable("EMPLOYEE_DETAIL", elementEMPLOYEE_DETAIL, rulesEMPLOYEE_DETAIL, [1, 0])

function renderLov() {
    return [
        lov.lovField("LovDepartment", ["deptcode", "deptdesc"], ["Department Code", "Department Name"], 2)
    ]
}

let content = layout.baseLayout([blockEMPLOYEE_HEAD, blockEMPLOYEE_DETAIL])

webix.ready(function(){
    restapi.restApiSelect()
})
```

## Checklist for JavaScript Files

- [ ] menuId matches Python filename
- [ ] winConfigForm keys match Python block names
- [ ] ELEMENT arrays match Python setListObj
- [ ] PRIMARY_KEY matches Python primaryKey=True
- [ ] RELATION_KEY only in child blocks
- [ ] REST_API BLOCK_NAME is current block
- [ ] LOV_API TABLE_ID matches renderLov
- [ ] All itemIds are lowercase
- [ ] Element arrays created for all blocks
- [ ] Rules objects defined
- [ ] Blocks created with correct type
- [ ] renderLov function if LOV fields exist
- [ ] Layout properly structured
- [ ] webix.ready() calls restApiSelect

---

**Remember**: JavaScript files define the UI and user interactions. They must be perfectly synchronized with Python files.