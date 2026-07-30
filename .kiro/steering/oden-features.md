---
inclusion: always
---

# Oden Framework Features Guide

This steering file documents advanced Oden features that span both Python and JavaScript.

---

## 1. SUB_PARENT — Splitting One Record Across Multiple Tabs

### Purpose

When a single database table has too many columns to fit in one form view, use `SUB_PARENT` to split fields across multiple tabs (via verticalMultiView) while keeping them as **one logical record**.

### Key Rules

- All `SUB_PARENT` blocks share the **same database table** as the `PARENT` block
- The framework **merges** SUB_PARENT data into the parent before INSERT/UPDATE/DELETE
- On SELECT, the framework **distributes** parent record fields to each SUB_PARENT block

### JavaScript Configuration

```javascript
var winConfigForm = {
    // PARENT block — main tab
    "PS_KARYAWAN": {
        "ELEMENT": ["psnik", "psnama", "pskdstore", ...],
        "PRIMARY_KEY": ["psnik"],
        "RELATION_KEY": [],
        "BLOCK_TYPE": ["FORM", "PARENT"],
        ...
    },
    // SUB_PARENT block — additional tab (same table)
    "PS_MASTER": {
        "ELEMENT": ["pstmplahir", "pstgllahir", "psjeniskelamin", ...],
        "PRIMARY_KEY": [],              // No PK — it's the parent's PK
        "RELATION_KEY": ["psnik"],      // References parent's PK
        "BLOCK_TYPE": ["FORM", "SUB_PARENT"],
        "LOV_API": { ... }
    },
    // Another SUB_PARENT block — another tab (same table)
    "PS_HUMAN_RESOURCE_DEPARTMENT": {
        "ELEMENT": ["psjabatan", "psrekeningbank", ...],
        "PRIMARY_KEY": [],
        "RELATION_KEY": ["psnik"],
        "BLOCK_TYPE": ["FORM", "SUB_PARENT"],
        "LOV_API": { ... }
    }
}
```

### JavaScript Block Creation & Layout

```javascript
// Each SUB_PARENT gets its own form.SimpleForm
let blockPS_MASTER = form.SimpleForm("PS_MASTER", elementPS_MASTER, rulesPS_MASTER)
let blockPS_HRD = form.SimpleForm("PS_HUMAN_RESOURCE_DEPARTMENT", elementPS_HRD, rulesPS_HRD)

// Use verticalMultiView to create tabs
let tab0 = verticalMultiView.element("MASTER", blockPS_MASTER)
let tab1 = verticalMultiView.element("HRD", blockPS_HRD)
let multiView = verticalMultiView.view([tab0, tab1])

// Layout: parent form + multiview tabs
let content = layout.baseLayout([blockPS_KARYAWAN, multiView])
```

### Python Backend — CRITICAL Differences

**1. NO separate block class for SUB_PARENT blocks.** All items go into the PARENT block class:

```python
class TRSHRA50_CPs_Karyawan(FormLayout):
    def __init__(self, blockId):
        super().__init__(blockId)
        self.databaseTable = "dmhr.ps_karyawan"  # ONE table for all
        self.nonVisibleItems = [["ps_create_user","createUser"], ["ps_update_user","updateUser"]]
        self.noDbItems = []
```

**2. ALL items (parent + all SUB_PARENT) go into the parent's `setListObj()`:**

```python
TRSHRA50_vBlockPs_Karyawan = TRSHRA50_CPs_Karyawan("PS_KARYAWAN")
TRSHRA50_vBlockPs_Karyawan.setListObj([
    # Items visually in PS_KARYAWAN (PARENT tab)
    TRSHRA50_Cps_nik, TRSHRA50_Cps_nama, TRSHRA50_Cps_kd_store,
    # Items visually in PS_MASTER (SUB_PARENT tab)
    TRSHRA50_Cps_tmp_lahir, TRSHRA50_Cps_tgl_lahir, TRSHRA50_Cps_jenis_kelamin,
    # Items visually in PS_HUMAN_RESOURCE_DEPARTMENT (SUB_PARENT tab)
    TRSHRA50_Cps_jabatan, TRSHRA50_Cps_rekening_bank,
    # ... all items from all SUB_PARENT blocks
])
TRSHRA50_vBlockPs_Karyawan.ObjRecord = TRSHRA50_CRecordPs_Karyawan
```

**3. SUB_PARENT blocks are NOT appended to the form in `execVcount`:**

```python
execVcount = """
session["loggedId"] = kwargs
TRSHRA50_vContainer = Container()
TRSHRA50_vForm = Form()
TRSHRA50_vContainer.update(TRSHRA50_vForm)

# Only PARENT block is created and appended
TRSHRA50_vBlockPs_Karyawan = TRSHRA50_CPs_Karyawan("PS_KARYAWAN")
TRSHRA50_vBlockPs_Karyawan.setListObj([...all items...])
TRSHRA50_vBlockPs_Karyawan.ObjRecord = TRSHRA50_CRecordPs_Karyawan

# CHILD blocks are appended
TRSHRA50_vBlockPendidikan = TRSHRA50_CPendidikan("PS_PENDIDIKAN_FORMAL")
TRSHRA50_vBlockPendidikan.relationBlock = TRSHRA50_vBlockPs_Karyawan
...

TRSHRA50_vContainer.getForm().dataBlocks = []
TRSHRA50_vContainer.getForm().append(TRSHRA50_vBlockPs_Karyawan)  # PARENT only
TRSHRA50_vContainer.getForm().append(TRSHRA50_vBlockPendidikan)   # CHILD blocks
# NO append for SUB_PARENT blocks!
"""
```

**4. newInstance functions ARE required for SUB_PARENT blocks:**

```python
def newInstance_HRA_50_PS_KARYAWAN(**kwargs):
    newInstance = {"status": True, "data": {}, "msg": ""}
    return newInstance

def newInstance_HRA_50_PS_MASTER(**kwargs):
    newInstance = {"status": True, "data": {}, "msg": ""}
    return newInstance

def newInstance_HRA_50_PS_HUMAN_RESOURCE_DEPARTMENT(**kwargs):
    newInstance = {"status": True, "data": {}, "msg": ""}
    return newInstance
```

### Summary Table

| Aspect | PARENT | SUB_PARENT | CHILD |
|--------|--------|------------|-------|
| Database table | Main table | **Same as PARENT** | Different table |
| JS BLOCK_TYPE | `["FORM", "PARENT"]` | `["FORM", "SUB_PARENT"]` | `["DATAGRID", "CHILD"]` |
| JS PRIMARY_KEY | Has PK | `[]` empty | Has own PK |
| JS RELATION_KEY | `[]` empty | Parent's PK | Parent's PK |
| Python block class | Has own class | **NO class** | Has own class |
| Python setListObj | Contains ALL items (parent + SUB_PARENT) | N/A | Contains own items |
| Python execVcount append | Appended | **NOT appended** | Appended |
| Python relationBlock | N/A | N/A | Set to parent |
| Python newInstance | Required | Required | Required |
| Records | Single record | Same single record | Multiple records |
| Block creation (JS) | `form.SimpleForm(...)` | `form.SimpleForm(...)` | `datatable.SimpleDatatable(...)` |

### When to Use SUB_PARENT

- Table has 30+ columns that won't fit in one form view
- You want to organize fields into logical tabs (Personal, HR, Finance, etc.)
- All fields belong to the **same database record**

---

## 2. BUTTON UPLOADER — File Upload to GCS Bucket or Local Storage

### Purpose

The Oden Framework provides built-in file upload components that handle uploading files to Google Cloud Storage (GCS bucket) or local storage. There are two variants:
- **BUTTONUPLOADERFORM** — Used inside `FormLayout` blocks (single record view)
- **BUTTONUPLOADERDATAGRID** — Used inside `DataGridLayout` blocks (multi-record datagrid)

Both variants share the same backend API pattern using `odenFileToBucket()`.

---

### 2.1 BUTTONUPLOADERFORM (Form Block Upload)

Used when you need a file upload button inside a form (FormLayout). Typical use case: uploading a single document per record.

#### JavaScript Configuration

```javascript
// Hidden items to store file names (MUST be in element array)
TEXTBOX.TEXTNORMAL({ITEM_ID: "oldFileName", LABEL: "Old File", LENGTH: 300, HIDE: true}),
TEXTBOX.TEXTNORMAL({ITEM_ID: "newFileName", LABEL: "New File", LENGTH: 300, HIDE: true}),

// The uploader button
BUTTON.BUTTONUPLOADERFORM({
    ITEM_ID: "btnUploadPDF",          // Unique button ID
    LABEL: "Upload File",              // Button label text
    SECTION: "Upload Document",        // Section title displayed above
    COLS_FILE: {
        "oldFileName": "oldFileName",  // itemId to store original filename
        "newFileName": "newFileName"   // itemId to store server filename (sequence)
    },
    MULTIPLE_FILES: false,             // true = allow multiple files, false = single
    ALLOW_FILE: ["pdf"],               // Allowed extensions (lowercase)
    MAX_SIZE: 2000,                    // Max file size in KB
    REQUIRED: true,                    // Is upload required?
    DOWNLOAD_FILE: false,              // Show download button for existing file?
    DELETE_FILE: false,                // Show delete button?
    ADD_PARAM: ["empcode"]             // Additional itemIds to pass to Python API (optional)
})
```

#### Advanced BUTTONUPLOADERFORM Options

```javascript
BUTTON.BUTTONUPLOADERFORM({
    ITEM_ID: "btnUploaderKtp",
    LABEL: "UPLOAD FILE",
    SECTION: "<b>Kartu Tanda Penduduk</b>",
    COLS_FILE: {
        "oldFileName": "rufnamaktp",     // Original file name storage
        "newFileName": "rufktp"          // Server-side sequence name storage
    },
    MULTIPLE_FILES: false,
    ALLOW_FILE: ["pdf", "png", "jpg", "jpeg"],
    MAX_SIZE: 2000,
    REQUIRED: false,
    DOWNLOAD_FILE: false,
    DELETE_FILE: false,
    ADD_PARAM: ["rkcode", "dispstatusseleksi", "dispnik"],  // Extra params to Python
    JENIS_FILE: "KTP",                   // File type identifier (passed to Python)
    USE_STAMP: "confidential",           // Watermark stamp on file (optional)
    POSITION_STAMP: "bottom-center"      // Stamp position (optional)
}, {CUSTOM_CLICK: triggerUploaderSt})    // Optional custom click handler
```

#### winConfigForm for BUTTONUPLOADERFORM

```javascript
var winConfigForm = {
    "FORM_UPLOAD": {
        "ELEMENT": ["fpnikupload", "fpnamaupload", "oldFileName", "newFileName"],
        "PRIMARY_KEY": [],
        "RELATION_KEY": [],
        "WHEN_NEW_FORM": {},
        "BLOCK_TYPE": ["FORM", "NONE"],   // "NONE" = non-base table block
        "BASE_TABLE": false               // No database table backing this block
    }
}
```

#### Python Backend — BUTTONUPLOADERFORM

**CRITICAL**: The Python function name MUST follow the pattern: `{ITEM_ID}_{MENU_ID}(param)`

```python
@exposeApi
def btnUploadPDF_MENU_ID(param):
    """
    File upload handler for BUTTONUPLOADERFORM
    
    CRITICAL:
    - Function name = ITEM_ID + "_" + MENU_ID
    - Must accept 'param' argument (framework passes upload action type)
    - Must return odenFileToBucket() result
    
    param values:
    - "uploadFile" : user is uploading a file
    - "viewFile"   : user is viewing/downloading existing file
    - "deleteFile" : user is deleting a file
    """
    allowedExtension = ["pDf"]  # Case-insensitive matching
    bucketName = "your-gcs-bucket-name"   # GCS bucket name or "local"
    tempFolderName = "tempFileOden/"       # Temp folder for processing
    folderName = "UPLOADS/"               # Destination folder in bucket

    return odenFileToBucket(param, {
        "allowedExtension": allowedExtension,
        "bucketName": bucketName,
        "tempFolderName": tempFolderName,
        "folderName": folderName
    })
```

#### Python Item Classes for Uploader (Form)

```python
class MENUID_ColdFileName(TextItem):
    lengthItem = 300
    itemId = "oldFileName"
    databaseColumn = ""
    databaseItem = False
    nullable = False
    allowSpecialChar = ["_", ".", "(", ")", "-"]
    def validate(self):
        return {"status": True, "msg": ""}

class MENUID_CnewFileName(TextItem):
    lengthItem = 300
    itemId = "newFileName"
    databaseColumn = ""
    databaseItem = False
    nullable = False
    allowSpecialChar = ["_", ".", "(", ")", "-"]
    def validate(self):
        return {"status": True, "msg": ""}
```

#### Complete Flow: Upload → Save to Database (Non-Base Block Pattern)

When the uploader is in a non-base block (BLOCK_TYPE: ["FORM", "NONE"]), you handle the database insert manually via a custom @exposeApi function:

```python
@exposeApi
def simpanData_MENU_ID():
    ajaxData = request.json.get('data')
    
    # Validate non-base block
    cekNullable = nonBaseBlockValidate("FORM_UPLOAD")
    if cekNullable["status"] == False:
        return {"status": False, "data": {}, "msg": cekNullable["msg"]}
    
    # Get sequence for primary key
    sqlSeq = "select nextval('schema.sequence_name')"
    sequence = selectQuery(sqlSeq)
    if sequence["status"] == False:
        return {"status": False, "data": {}, "msg": "Error get sequence"}
    
    recordId = sequence["data"][0][0]
    
    # Set newFileName on the block object for preTransactionFileData
    session["vForm"].actionActive = "NON-BASE"
    objBlock = session["vForm"].getBlock("FORM_UPLOAD")
    objBlock.item("newFileName").value = ajaxData["newFileName"]
    
    # Rename file in bucket using sequence
    sequenceName = str(recordId) + '-DocType'
    idFileBucket = sequenceName + '.pdf'
    
    result = preTransactionFileData(objBlock, "insert", {
        "columnIdSequence": "newFileName",
        "bucketName": "your-gcs-bucket-name",
        "tempFolderName": "tempFileOden/",
        "folderName": "UPLOADS/",
        "sequenceName": sequenceName
    })
    
    if result["status"] == True:
        # Insert record to database
        sql = """
            INSERT INTO schema.table (id, file_name, file_id, create_user)
            VALUES (%(id)s, %(filename)s, %(fileid)s, %(user)s)
        """
        param = {
            "id": recordId,
            "filename": ajaxData["oldFileName"],
            "fileid": idFileBucket,
            "user": session["loggedId"]["nik"]
        }
        result = executeDataQuery(sql, param)
        return {"status": result["status"], "data": {}, "msg": result["msg"]}
    else:
        return {"status": False, "data": {}, "msg": "Upload File Failed"}
```

#### JavaScript: Trigger Save with Upload Validation

```javascript
let btnSimpanData = makePromise(function(resolve) {
    // Check if file was uploaded
    if (Object.keys($$("btnUploadPDF").files.data.pull).length === 0) {
        webix.alert(ALERT.ALERTWARNING("Please upload file first."))
        resolve({"status": false})
    }
    else if (getItemValue("oldFileName") == "") {
        RMSGBOX("Please wait, file is still being uploaded.")
        resolve({"status": false})
    }
    else {
        webix.confirm({
            type: "confirm-warning",
            title: "Confirm Save",
            ok: "Save", cancel: "Cancel",
            text: "Are you sure you want to save?"
        }).then(function() {
            let result = restapi.restApiCustom({
                "ITEM_ID": "simpanData",
                "DATA": getBlockValue("FORM_UPLOAD")
            })
            result.then(function(response) {
                if (response.status == true) {
                    webix.alert("File uploaded successfully.").then(function() {
                        location.reload()
                        resolve({"status": true})
                    })
                } else {
                    webix.alert(ALERT.ALERTWARNING(response.msg))
                    resolve({"status": false})
                }
            })
        })
    }
})
```

#### JavaScript: View/Download Existing File

```javascript
let btnViewFile = function() {
    let filename = getItemValue("mpcnamafile")
    let sequenceName = getItemValue("mpcidfilebucket")

    let param = {
        "DATA": [{
            "oldName": filename,
            "sequenceName": sequenceName
        }],
        "API_NAME": "btnUploadPDF_" + menuId,
        "FILE_TYPE": "single",
        "TYPE": "viewFile",
        "DOWNLOAD_FILE": false,
        "DATA_PARAM": {}
    }
    restapi.restApiFile(param)
}
```

---

### 2.2 BUTTONUPLOADERDATAGRID (Datagrid Block Upload)

Used when you need a file upload button in each row of a datagrid (DataGridLayout). Each row can have its own uploaded file.

#### JavaScript Configuration

```javascript
let elementDATAGRID_BLOCK = [
    TEXTBOX.TEXTPRIMARY({ITEM_ID: "recordid", LABEL: "ID", LENGTH: 20, IS_PRIMARY_KEY: true}),
    TEXTBOX.TEXTNORMAL({ITEM_ID: "description", LABEL: "Description", LENGTH: 100}),
    
    // Hidden items to store file names (MUST be in element array)
    TEXTBOX.TEXTNORMAL({ITEM_ID: "oldfilename", LABEL: "Filename", LENGTH: 300, HIDE: true}),
    TEXTBOX.TEXTNORMAL({ITEM_ID: "sequencefile", LABEL: "Sequence", LENGTH: 300, HIDE: true}),
    
    // The uploader button in datagrid
    BUTTON.BUTTONUPLOADERDATAGRID({
        ITEM_ID: "btnUploaderDt",          // Unique button ID
        LABEL: "Upload File",               // Button label
        SECTION: "Uploader Default",        // Section identifier
        COLS_FILE: {
            "oldFileName": "oldfilename",   // itemId for original filename
            "newFileName": "sequencefile"   // itemId for server filename
        },
        MULTIPLE_FILES: false,              // Allow multiple files per row
        ALLOW_FILE: ["pdf", "png", "jpg"],  // Allowed extensions
        MAX_SIZE: 2000,                     // Max size in KB
        REQUIRED: true,                     // Required field
        DOWNLOAD_FILE: true,                // Show download button
        DELETE_FILE: false,                 // Show delete button
        CUSTOM_WIDTH: 300,                  // Column width in datagrid
        CUSTOM_HEIGHT: 300,                 // Upload area height (optional)
        ADD_PARAM: ["parentcode"]           // Additional params from parent (optional)
    })
]
```

#### winConfigForm for BUTTONUPLOADERDATAGRID

**CRITICAL**: The `ELEMENT` array MUST include the uploader button ITEM_ID:

```javascript
var winConfigForm = {
    "DATAGRID_BLOCK": {
        "ELEMENT": ["recordid", "description", "oldfilename", "sequencefile", "btnUploaderDt"],
        "PRIMARY_KEY": ["recordid"],
        "RELATION_KEY": [],
        "BLOCK_TYPE": ["DATAGRID", "PARENT"],
        "LOAD_DATA_AT_START": true,
        "REST_API": {"BLOCK_NAME": "DATAGRID_BLOCK", "PARAM_ID": []}
    }
}
```

#### Python Backend — BUTTONUPLOADERDATAGRID

**CRITICAL**: Same naming pattern as form uploader: `{ITEM_ID}_{MENU_ID}(param)`

```python
def btnUploaderDt_MENU_ID(param):
    """
    File upload handler for BUTTONUPLOADERDATAGRID
    
    CRITICAL:
    - Function name = ITEM_ID + "_" + MENU_ID
    - Must accept 'param' argument
    - Must return odenFileToBucket() result
    - Does NOT need @exposeApi decorator (framework auto-discovers uploader functions)
    """
    bucketName = "your-gcs-bucket-name"   # GCS bucket or "local" for local storage
    tempFolderName = "tempFileOden/"
    folderName = "UPLOADS/"
    allowedExtension = ["pDf", "PNG", "jpg"]  # Case pattern for matching

    return odenFileToBucket(param, {
        "allowedExtension": allowedExtension,
        "bucketName": bucketName,
        "tempFolderName": tempFolderName,
        "folderName": folderName
    })
```

#### Using preTransactionFileData in DataGridLayout Block

When the datagrid block is a base-table block (has `databaseTable`), use `preTransactionFileData` in the block's `preInsert`/`preUpdate` hooks to automatically rename and move uploaded files:

```python
class MENUID_CDatagridBlock(DataGridLayout):
    def __init__(self, blockId):
        super().__init__(blockId)
        self.databaseTable = "schema.table_name"
        self.nonVisibleItems = [["col_create_user", "createUser"], ["col_update_user", "updateUser"]]
        self.noDbItems = []
    
    def preInsert(self):
        """
        Handle file rename during insert
        columnIdSequence = the itemId that holds the newFileName (server-side name)
        """
        result = preTransactionFileData(self, "insert", {
            "columnIdSequence": "sequencefile",
            "bucketName": "your-gcs-bucket-name",
            "tempFolderName": "tempFileOden/",
            "folderName": "UPLOADS/"
        })
        return result
    
    def preUpdate(self):
        """
        Handle file rename during update
        """
        result = preTransactionFileData(self, "update", {
            "columnIdSequence": "sequencefile",
            "bucketName": "your-gcs-bucket-name",
            "tempFolderName": "tempFileOden/",
            "folderName": "UPLOADS/"
        })
        return result
```

#### Using Custom Sequence for File Naming

```python
def preInsert(self):
    sqlSequence = """SELECT nextval('schema.file_seq') as sequence"""
    result = preTransactionFileData(self, "insert", {
        "columnIdSequence": "sequencefile",
        "bucketName": "your-gcs-bucket-name",
        "tempFolderName": "tempFileOden/",
        "folderName": "UPLOADS/",
        "sqlSequence": sqlSequence  # Custom sequence SQL
    })
    return result
```

---

### 2.3 odenFileToBucket Parameters Reference

| Parameter | Type | Description |
|-----------|------|-------------|
| `allowedExtension` | list | File extensions allowed (case-insensitive patterns like `"pDf"`, `"PNG"`) |
| `bucketName` | str | GCS bucket name, or `"local"` for local file storage |
| `tempFolderName` | str | Temporary folder path (usually `"tempFileOden/"`) |
| `folderName` | str | Destination folder path in bucket |
| `idParam` | str | Identifier parameter (optional, for file manager integration) |
| `urlFileManager` | str | URL for external file manager upload API (optional) |
| `urlDownloadFileManager` | str | URL for external file manager download API (optional) |
| `urlDeleteFileManager` | str | URL for external file manager delete API (optional) |
| `jenisFile` | str | File type identifier (optional, passed from JS `JENIS_FILE`) |
| `idFile` | str | File ID for existing file operations (optional) |
| `filterParam` | str | Filter parameter (optional) |

### 2.4 preTransactionFileData Parameters Reference

| Parameter | Type | Description |
|-----------|------|-------------|
| `self` or `objBlock` | Block | The block object (self in preInsert/preUpdate, or objBlock for non-base) |
| action | str | `"insert"` or `"update"` |
| `columnIdSequence` | str | The itemId holding the new filename |
| `bucketName` | str | GCS bucket name |
| `tempFolderName` | str | Temp folder path |
| `folderName` | str | Destination folder in bucket |
| `sequenceName` | str | Custom filename for the uploaded file (optional) |
| `sqlSequence` | str | SQL to generate sequence number for filename (optional) |

### 2.5 Local Storage vs GCS Bucket

| Setting | Usage |
|---------|-------|
| `bucketName = "local"` | Stores files locally on server (development) |
| `bucketName = "your-bucket-name"` | Stores files in Google Cloud Storage (production) |

For local storage, files are stored in `{folderName}` relative to the project root.

### 2.6 Summary: BUTTONUPLOADERFORM vs BUTTONUPLOADERDATAGRID

| Aspect | BUTTONUPLOADERFORM | BUTTONUPLOADERDATAGRID |
|--------|-------------------|----------------------|
| Used in | FormLayout (form.SimpleForm) | DataGridLayout (datatable.SimpleDatatable) |
| Records | One file per form view | One file per datagrid row |
| JS element | In form element array | In datagrid element array |
| winConfigForm ELEMENT | Hidden items included | Hidden items + button ITEM_ID included |
| Python function | `btnItemId_MENU_ID(param)` | `btnItemId_MENU_ID(param)` |
| Python decorator | `@exposeApi` required | No `@exposeApi` needed (auto-discovered) |
| File handling in base block | preInsert/preUpdate with `preTransactionFileData` | preInsert/preUpdate with `preTransactionFileData` |
| File handling in non-base | Manual via custom @exposeApi function | N/A (datagrid usually is base block) |

### 2.7 Checklist for File Upload Implementation

- [ ] Hidden `TextItem` or `TextNormal` items created for `oldFileName` and `newFileName`
- [ ] `COLS_FILE` maps to correct itemIds
- [ ] `ALLOW_FILE` extensions match Python `allowedExtension`
- [ ] Python function named `{ITEM_ID}_{MENU_ID}(param)`
- [ ] `odenFileToBucket` called with correct bucket and folder config
- [ ] For base-table blocks: `preTransactionFileData` in `preInsert`/`preUpdate`
- [ ] For non-base blocks: manual `preTransactionFileData` + custom save function
- [ ] Hidden items included in `ELEMENT` array (winConfigForm)
- [ ] For BUTTONUPLOADERDATAGRID: button ITEM_ID also in `ELEMENT` array
- [ ] `MAX_SIZE` set appropriately (in KB)
- [ ] View/download functionality uses `restapi.restApiFile()` with correct params
