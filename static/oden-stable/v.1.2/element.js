/*
	JS-Oden-Stable V.1.2
	Update : 2025-11-21
	Common Library - element.js
		Update : 
			- grid to grid
*/

window.winCountOffsetRecord = {}
window.winOpenPopUp = "closed";
window.winCurrentItem = "";
window.winListIdBtn = ["prev","next","searchValue","addValue","addRowDb","updateValue","clearBtn"];
window.winCheckRadio = [];
window.winSearchMode = false;
window.winAddData = false;
window.winReadOnly = [];
window.winDataRow = "";
window.winEditor = "";
window.winTypeDisplay = "";
window.winActiveBlock = {"lastFocus":"", "focusNow":""};
window.winJenisAddValue = ''
window.winDisplayItem = []
window.winFloatData = []
window.winSideBarCursor = false;
window.winResetData = false;
window.winNextRecord = false;
window.winPrevRecord = false;
window.winSearchRecord = false;
window.winClearResetRecord = false;
window.winAddRecord = false;
window.winDeleteRecord = false;
window.winUpperText = []
window.winLowerText = []
window.winDataAtStart = true
window.winIsPrimary = []
window.winPopUpUploaderDt = []
window.winUploaderFile = []
window.winFlagInsertBlock = ""
window.winFlagInsertChild = []
window.winDisabledButton = []
window.winImageElement = []
window.winSearchParam = {status:false, param:{}}
window.winValidateItemPos = {} 
window.winStartEditAfterLoadData = false
window.winOpenValidation = false
window.winThereIsSubChild = false
window.winSubParent = []
window.winSubChild = {}
window.winStatusCallForm = false
window.additionalMultiLanguage = []
window.winLOV = []
window.winCombo = {}
window.winRadio = {}
window.winAdditionalTemplate = {}
window.winMultilanguage = {"old":"", "target":""}
window.validationErrorForm = []
window.isGridToGrid = false
window.statusMasterDetailGridToGrid = {parent: '', child: [], grandchild: []}
window.haveRowAdded = false
window.tempLanguageForm = {}
var winAutoNumber = 0;
var insertType = ""
var adaFile = false

window.winNextItem = [] //gakepake cuman biar ga error
let searchCount = 0;
let addCount = 0;
let currentValue = {};
let lovIconClick = 0;

var lovPopUp = true
var statPopUpWd = false



function setDefaultLangMSG(htmlString) {
    console.log("ALERT STRING = ",htmlString);
    
    let targetLang = 'ID'
    if (window.winMultilanguage['target'] != 'ID') {
        targetLang = 'EN'
    }
    let jsonTranslate= ''
    if (window["jsonMultiLanguage_"+menuId] != undefined) {
        jsonTranslate = window["jsonMultiLanguage_"+menuId][targetLang]
    }else{
        return htmlString
    }
    const tempDiv = document.createElement('div');
    
    tempDiv.innerHTML = htmlString;
    
    function translateTextNodes(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent.trim();
            if (text && jsonTranslate && jsonTranslate[text]) {
                node.textContent = jsonTranslate[text];
            }
        } else {
            for (let child of node.childNodes) {
                translateTextNodes(child);
            }
        }
    }
    
    translateTextNodes(tempDiv);
    console.log("TRANSLATE ALERT STRING = ",tempDiv.innerHTML)
    return tempDiv.innerHTML;
}
var hideButton = {
/*  
    Digunakan untuk hidden button default diatas form.
    
    Value :
        true    :   hidden button
        false   :   show button
*/
    "prev" : false,
    "next" : false,
    "searchValue" : false,
    "addValue" : false,
    "addRowDb": false,
    "updateValue" : false,
    "deleteValue" : false,
    "clearBtn" : false,
} //umum


var reloadAfterTransaction = {
/*
    Digunakan untuk indikator perlu / tidak reload data setelah transaksi.
    
    Value   :
        true   :   setelah proses transaksi maka otomatis reload data.
        false  :   setelah proses transaksi tidak reload data.
    
    Case apabila bernilai true :
        Insert  & Update
            Form
                Insert & Update :   Setelah transaksi maka akan reload data
                                    sesuai id Primary Key yang diinput sebelumnya.
                Delete          :   Melakukan reset Data Awal dari database.
            Datatable
                Insert & Update & Delete :
                    Setelah transaksi maka akan reload data sesuai idPK Header.
        Delete  :
            Form        :   Melakukan reset Data Awal dari database.
            Datatable   :   Reload data sesuai id Primary Key Header.
*/
    "insert"    : true,
    "update"    : false,
    "delete"    : true,
} //umum

// function reloadBreadCrumb(data){
//     console.log("set data crumb", data)
//     if(data.length!=0){
//         let idx = 0
//         data.forEach(function(record){
//             console.log(record)
//             $$("breadcrumb_"+menuId).add(record,idx)
//             $$("breadcrumb_"+menuId).refresh()
//             idx+=1
//         })
//         $$("breadcrumb_"+menuId).define("hidden",false)
//         $$("breadcrumb_"+menuId).refresh()
//         console.log($$("breadcrumb_"+menuId).config)
//     }else{
//         $$("breadcrumb_"+menuId).define("hidden",true)
//         $$("breadcrumb_"+menuId).refresh()
//     }
// }

function translateOden(string) {
    let target= winMultilanguage.target
    let stringTranslate = '' 
    if (Object.keys(window["jsonMultiLanguage_"+menuId][target]).includes(string)) {
        stringTranslate = window["jsonMultiLanguage_"+menuId][target][string]
    }else{
        stringTranslate = string
    }
    return stringTranslate
    
}


function hideOverlay(blockId) {
    if(blockId in winActiveOverlay){
        delete winActiveOverlay[blockId]
    }
    $$(blockId).hideOverlay();
}

function selectMenuId(){
    urlParam = new URLSearchParams(location.search)
    if(urlParam.get("menuId")!=null){
        checkMenuNotDisp = urlParam.get("menuId").search("_ND")
        if(checkMenuNotDisp==-1){
            parentMenuId = $$("$sidebar1").getParentId(urlParam.get("menuId"))
            if(parentMenuId != 0){
                parentMenuIdNd = $$("$sidebar1").getParentId(parentMenuId)
                if(parentMenuIdNd != 0){
                    $$("$sidebar1").open(parentMenuIdNd)
                }
                $$("$sidebar1").open(parentMenuId)
            }
            $$("$sidebar1").select(urlParam.get("menuId"))
        }
    }
}

let functionGetHost = function(imageName){
    let listScript = document.querySelectorAll("script")
    let returnVal = ""
    listScript.forEach(function(param){
        if(param.src != "" && param.src != undefined){
            let url = new URL(param.src)
            if(url.pathname.split("/").includes("element.js")){
                returnVal = url.origin+imageName
            }
        }
    })
    return returnVal
}

function checkGridtoGrid() {
    let parentBlockType;
    let childBlockType;
    let grandChildBlockType;

    Object.keys(winConfigForm).every(function (blockId) {
        winConfigForm[blockId]["WIN_ACTIVE_CELL_BLOCK"] = {}
        if (winConfigForm[blockId].BLOCK_TYPE[0] == 'DATAGRID') {
            if(winConfigForm[blockId]["BLOCK_TYPE"][1] == "PARENT"){
                parentBlockType = winConfigForm[blockId].BLOCK_TYPE[0];
                window.statusMasterDetailGridToGrid['parent'] = blockId;
            }
            if (winConfigForm[blockId]["BLOCK_TYPE"][1] == "CHILD") {
                childBlockType = winConfigForm[blockId].BLOCK_TYPE[0];
                window.statusMasterDetailGridToGrid['child'].push(blockId);
            }
            if (winConfigForm[blockId]["BLOCK_TYPE"][1] == "GRANDCHILD") {
                grandChildBlockType = winConfigForm[blockId].BLOCK_TYPE[0];
                window.statusMasterDetailGridToGrid['grandchild'].push(blockId);
                return false
            }
        }
        return true
    })

    let block_parent = getBlockParent()
    
    if ((parentBlockType === childBlockType) && (parentBlockType === 'DATAGRID' && childBlockType === 'DATAGRID')){
        isGridToGrid = true;
        if ($$(block_parent).getFirstId() != undefined) {
            $$(block_parent).select($$(block_parent).getFirstId(),$$(block_parent).getColumns()[0].id)
            winConfigForm[block_parent]['WIN_ACTIVE_CELL_BLOCK'] = {'pos': $$(block_parent).getSelectedId(), 'view': $$(block_parent)}
        }
    }
}

function loadDataBlockAtStart(){
/*
Digunakan untuk men-trigger load block data setelah load data master.

Membutuhkan update winconfigform terbaru:
    - "LOAD_DATA_AT_START" : true,
    - REST_API": {"BLOCK_NAME":"[BLOCK]","PARAM_ID":[]},
*/

    Object.keys(winConfigForm).every(function (blockId) {
        if (winConfigForm[blockId]['TRANSACTION_BLOCK'] == undefined) {
            winConfigForm[blockId]['TRANSACTION_BLOCK'] = {
                'INSERT':true,
                'UPDATE':true,
                'DELETE':true
            }
        }
    })

    Object.keys(winConfigForm).every(function (blockId) {
        if (winConfigForm[blockId]["BLOCK_TYPE"][1] == "SUB_CHILD") {
            winThereIsSubChild = true
            return false
        }
        return true
    })

    if (winDataAtStart) {
        Object.keys(winConfigForm).forEach(function (block) {
            if (winConfigForm[block].BLOCK_TYPE[1]!="PARENT"){
                if (winConfigForm[block].LOAD_DATA_AT_START) {
                    restapi.restApiParam(winConfigForm[block].REST_API)
                    winHeightMultiview[block] = $$(block).$height
                }
            }
        })

        if(winMultiviewBlocks.length!=0){
            let firstView = $$("tabbar"+menuId).config.options[0].id
            $$("tabbar"+menuId).setValue(firstView)
            $$("tabbar"+firstView).show()
        }else if(winMultiviewBlocksVertical.length!=0){
            $$("listMultiviewVertical"+menuId).select($$("listMultiviewVertical"+menuId).getFirstId());
        }
        winDataAtStart = false;
    }else{
        nextPrevMulti()
    }
} //umum

function setFirstRowFocus() {
    if(isGridToGrid){
        if(window.winActiveBlock['focusNow'] == statusMasterDetailGridToGrid.parent){
            let blockParent = $$(statusMasterDetailGridToGrid.parent)
            let page = blockParent.getPage() + 1;
            let pageSize = blockParent.config.pager.size;
            let firstRowIndex = (page - 1) * pageSize;
            let firstRow = blockParent.getItem(blockParent.data.order[firstRowIndex]);
            let firstRowId = firstRow.id;
            
            $$(statusMasterDetailGridToGrid.parent).select(
                firstRowId, 
                $$(statusMasterDetailGridToGrid.parent).getColumns()[0].id
            )
        }else if(statusMasterDetailGridToGrid.child.includes(window.winActiveBlock['focusNow'])){
            let blockChild = $$(window.winActiveBlock['focusNow'])
            let page = blockChild.getPage() + 1;
            let pageSize = blockChild.config.pager.size;
            let firstRowIndex = (page - 1) * pageSize;
            let firstRow = blockChild.getItem(blockChild.data.order[firstRowIndex]);
            let firstRowId = firstRow.id;

            blockChild.select(
                firstRowId, 
                blockChild.getColumns()[0].id
            )
        }
    }
}

function getErrorLocation(err) {
    if (!err || !err.stack) return {line:0,column:0};

    // Chrome / Edge / Firefox format
    const match = err.stack.match(/:(\d+):(\d+)/);
    if (!match) return {line:0,column:0};

    return {
        line: Number(match[1]),
        column: Number(match[2])
    };
}

function setColumnUpdateAlert(updatedBlock) {
    let adaDataMaster = false 
    let textAlert = ''
    let descTextAlert = ''
    function setTextAlert(idBlock) {
        winConfigForm[idBlock]['PRIMARY_KEY'].forEach(function(idPk){
            if($$(getBlockItem(idPk)).config.view=="form"){
                textAlert+="<strong>"+String($$(idPk).config.label)+"</strong> : "+String(updatedBlock[idBlock]['data'][0][idPk])+"<br>"
            }else{
                textAlert+="<strong>"+String($$(idBlock).getColumnConfig(idPk)['header'][0]['text'])+"</strong> : "+String(updatedBlock[idBlock]['data'][0][idPk])+"<br>"
            }
        })
        Object.keys(updatedBlock[idBlock]['data'][0]).forEach(function(id){
            if(!winConfigForm[idBlock]['PRIMARY_KEY'].includes(id)){
                if($$(getBlockItem(id)).config.view=="form"){
                    textAlert+="<strong>"+String($$(id).config.label)+"</strong> : "+String(updatedBlock[idBlock]['data'][0][id])+"<br>"
                }else{
                    if (isGridToGrid && winConfigForm[idBlock]['BLOCK_TYPE'][1] == 'CHILD') {
                        let getBlock = idBlock
                        if (winConfigForm[idBlock]['RELATION_KEY'].includes(id)) {
                            getBlock = getBlockParent()
                        }
                        textAlert+="<strong>"+String($$(getBlock).getColumnConfig(id)['header'][0]['text'])+"</strong> : "+String(updatedBlock[idBlock]['data'][0][id])+"<br>"
                    }else{
                        textAlert+="<strong>"+String($$(idBlock).getColumnConfig(id)['header'][0]['text'])+"</strong> : "+String(updatedBlock[idBlock]['data'][0][id])+"<br>"
                    }
                }
            }
        })
    }
    Object.keys(updatedBlock).forEach(function(idBlock){
        if (isGridToGrid) {
            adaDataMaster = true
            descTextAlert = "Data has been changed in <b>"+idBlock+"</b>"
            setTextAlert(idBlock)
        }else{
            if(winConfigForm[idBlock]["BLOCK_TYPE"][1]=="PARENT"){
                adaDataMaster = true
                descTextAlert = "Data has been changed at master"
                setTextAlert(idBlock)
            }
        }
    })
    return {'adaDataMaster':adaDataMaster,'descTextAlert':descTextAlert,'textAlert':textAlert}
}


let dateParsersCore = webix.Date.strToDate("%d-%m-%Y")
function validateStartEndDate(dateStart,dateEnd,msg){
    /*
    Digunakan untuk pengecekan sederhana tanggal awal dan tanggal akhir
    dengan pesan yang dapat di custom.

    Return Value :  status,tipe,pesan
    */
    let datestart = dateParsersCore(getItemValue(dateStart), "DD-MM-YYYY")
    let dateend = dateParsersCore(getItemValue(dateEnd), "DD-MM-YYYY")
    if(datestart != "" && dateend != ""){
		if(datestart > dateend){
			return {"status":false, "tipe":"error", "pesan":msg}
		 }
	}
    return{"status":true}
}//umum

function validateSystemDate(date,condition,msg){
    /*
    Digunakan untuk pengecekan sederhana tanggal acuan dan tanggal system
    dengan pesan yang dapat di custom.

    Parameter : date sebagai item acuan, condition before/after, msg custom

    Return Value :  status,tipe,pesan
    */
    let dateparam = dateParsersCore(getItemValue(date), "DD-MM-YYYY")
	let sysdate = new Date();
    if(condition == "after"){
        if(dateparam != ""){
            if(dateparam > sysdate){
                    return {"status":false, "tipe":"error", "pesan":msg}
                }
        }
    }else if(condition == "before"){
        if(dateparam != ""){
            if(dateparam < sysdate){
                    return {"status":false, "tipe":"error", "pesan":msg}
                }
        }
    }
    return{"status":true}
}//umum

function setFocusAfterValidate(block){

    if($$(block).config.view == "form"){
        let namaBlock

        if(winMultiviewBlocksVertical.includes(block)){
            namaBlock = findObjectById(block, $$("listMultiviewVertical"+menuId).data)[0].title
        }else if(winMultiviewBlocks.includes(block)){
            namaBlock = findObjectById(block,$$('tabbar'+menuId).config.options)[0].value
        }else{
            namaBlock = block
        }
        if(!isWebixPopupOpen()){
            let labelItemErrorValidate = getLabelErrorValidation(block)
            webix.alert(ALERT.ALERTWARNING("Error Validate in Block "+namaBlock+"<br><b>" +labelItemErrorValidate + '</b>')).then(function(){
                $$(window.menuId).enable();
                if(winActiveBlock["focusNow"] != block) {
                    GO_BLOCK(block)
                }
                let statFocus = false
                validationErrorForm.every(function(itemId){
                    if(getBlockItem(itemId) == block){
                        if(statFocus==false){
                            statFocus=true
                            $$(itemId).focus()
                            return false
                        }
                    }
                })
            })
        }
        
    }else{
        GO_BLOCK(block)
        validateAndFocus(block)
    }
   
}


function getLabelErrorValidation(block){
    let returnValue = ""
    if($$(block).config.view == "form"){
        validationErrorForm.forEach(function(itemId){
            if(getBlockItem(itemId) == block){
                returnValue += $$(itemId).config.label
                returnValue += "<br>"
            }
        })
    }
    else if($$(block).config.view == "datatable"){

        invalidColumnsDt.forEach(function(itemId){
            if(getBlockItem(itemId) == block){
                if( $$(block).getColumnConfig(itemId).header[0] != null){
                    returnValue += $$(block).getColumnConfig(itemId).header[0]['text']
                }else if($$(block).getColumnConfig(itemId).header[0] == null && $$(block).getColumnConfig(itemId).header[1] != null ){
                    returnValue += $$(block).getColumnConfig(itemId).header[1]['text']
                }
                returnValue += "<br>"
            }
        })
    }
    return returnValue
}

function getBlockItem(id){
/*
    Digunakan untuk mencari block dari parameter id element yang dituju.

    Return Value :  Id block dati id element
*/
    let blockName = ''
    Object.keys(winConfigForm).forEach(function(blockId){
        if(winConfigForm[blockId].ELEMENT.includes(id)){
            blockName=blockId
        }
    })
    return blockName
} //umum
function onEnterCheckbox(view,pos){
           
    let blocks = Object.keys(winConfigForm)
    let valueCheckbox = $$(view.config.id).getItem(pos.row)
    if(valueCheckbox[pos.column]!=undefined){
        if(valueCheckbox[pos.column]==view.getColumnConfig(pos.column)['checkValue']){
            valueCheckbox[pos.column] = view.getColumnConfig(pos.column)['uncheckValue']
        }else if(valueCheckbox[pos.column]==view.getColumnConfig(pos.column)['uncheckValue']){
            valueCheckbox[pos.column] = view.getColumnConfig(pos.column)['checkValue']
        }
    }else{
        valueCheckbox[pos.column] = view.getColumnConfig(pos.column)['checkValue']
    }
    view.callEvent("onCheck",[pos.row,pos.column,valueCheckbox[pos.column]])
    // $$(view.config.id).updateItem(pos.row, valueCheckbox);
    
    // checkToDatachanged({rowId:pos.row, columnId:pos.column})
}
function addEventEnterDatagrid(){
/*
Digunakan untuk menambahkan event enter di setiap view datagrid
*/
    let blocks = Object.keys(winConfigForm)
    let datagridBlocks = []
    blocks.forEach(function(block){
        if(winConfigForm[block]["BLOCK_TYPE"][0]=="DATAGRID"){
            datagridBlocks.push(block)
        }
    })
    datagridBlocks.forEach(function(blockId){
        webix.UIManager.addHotKey("enter", function(){
            if($$(window.winActiveBlock['focusNow']).config.view=="datatable" && $$(window.winActiveBlock['focusNow']).getSelectedId() != undefined){
                let view = $$(window.winActiveBlock['focusNow'])
                let pos = view.getSelectedId();
                window.winActiveCell = {'pos':pos,'view':view}
                let thisColumn = view.config.columns[view.getColumnIndex(window.winActiveCell['pos'].column)]
                if (!window.winIdAttach.includes(thisColumn.id)){
                    window.winIdAttach.push(thisColumn.id)
                }
                if(thisColumn.jenis=="checkBox"){
                    if(window.winAddData==true){
                        window.winActiveCell = {"pos":pos, "view":view}
                        let editCellAddData = true
                        for (let x=0; x<window.winIdOldRecordDt[winActiveBlock.focusNow].length; x++){
                            if(window.winIdOldRecordDt[winActiveBlock.focusNow][x]==pos.row){
                                editCellAddData = false
                                break;
                            }
                        }
                        if(editCellAddData){
                            onEnterCheckbox(view,pos)    
                        }
                    }else{
                        onEnterCheckbox(view,pos)
                    }
                }else{
                    if(window.winAddData==true){
                        window.winActiveCell = {"pos":pos, "view":view}
                        let editCellAddData = true
                        for (let x=0; x<window.winIdOldRecordDt[winActiveBlock.focusNow].length; x++){
                            if(window.winIdOldRecordDt[winActiveBlock.focusNow][x]==pos.row){
                                editCellAddData = false
                                break;
                            }
                        }
                        if(editCellAddData){
                            view.edit(pos);    
                        }
                    }
                    else if(thisColumn.jenis=="textarea"){
                        window.winActiveCell = {"pos":pos, "view":view}
                        
                        if(popUpTextAreaDt==false){
                            view.edit(pos)
                        }else{
                            popUpTextAreaDt = false
                        }
                    }else if(window.winSearchMode==true){
                        window.winActiveCell = {"pos":pos, "view":view}
                        if(!winDisplayItem.includes(pos.column)){
                            view.edit(pos);
                        }
                    }else{
                        let InArrayOldRowData = window.winIdOldRecordDt[winActiveBlock.focusNow].includes(pos.row)
                        let inArrayPK = winConfigForm[window.winActiveBlock['focusNow']]["PRIMARY_KEY"].includes(pos.column)
                        if(InArrayOldRowData == false  && inArrayPK == false){
                            view.edit(pos);
                            window.winActiveCell = {"pos":pos, "view":view}
                        }else if (InArrayOldRowData == true  && inArrayPK == false){
                            view.edit(pos);
                            window.winActiveCell = {"pos":pos, "view":view}
                        }
                        window.winActiveCell = {"pos":pos, "view":view}
                    }
                }
            }
        },$$(blockId))
    })
}
function convertCurrency(item){

    if (item != '' && item != null){
        let newCurrency = item.replaceAll(".", "")
        let last = newCurrency.slice(-3);
        if(last==",00"){
            newCurrency=newCurrency.replace(",00","")
        }else{
        newCurrency=newCurrency.replace(",",".")
        }
        let first = newCurrency.substring(0, 3);
        newCurrency=newCurrency.replace(first,"")
        item = newCurrency
    }else{
        item = "";
        
    }
    return item
}

function makePromise(validateItem){
    return function(){
        let promise = new Promise((resolve)=>{
            validateItem(resolve)
        })
        return promise
    }
} //umum

function getBlockParent(){
/*  
    Digunakan untuk mengambil nama block yang bersifat PARENT dari form yang dibuat
    
    Return Value :  Id block yang bersifat PARENT
*/
    let parentBlockId = ""
    Object.keys(winConfigForm).every(function(idBlock){
        if(winConfigForm[idBlock]["BLOCK_TYPE"][1]=="PARENT"){
            parentBlockId = idBlock
            return false
        }else{
            return true
        }
    })
    return parentBlockId
} //umum

function getBlockParentMultiGrid(block){
    let blockType = winConfigForm[block]['BLOCK_TYPE'][1]
    if (isGridToGrid) {
        if (blockType == 'CHILD') {
            return statusMasterDetailGridToGrid.parent
        }else if(blockType == 'GRANDCHILD'){
            return statusMasterDetailGridToGrid.child[0]
        }else{
            return block
        }
    }else{
        console.warn("===== Developer Warning ===== \n Bukan Menu Grid to Grid")
    }
    
} //umum
function getAllPKinForm(){
/*  
    Digunakan untuk mendapatkan Primary Key dari semua Block
    
    Return Value : list yang berisi Primary Key
*/
    let allPK = []

    Object.keys(winConfigForm).forEach(function(block){
        winConfigForm[block]['PRIMARY_KEY'].forEach(function(idPK){
            allPK.push(idPK)
        })
    })
    return allPK
} //umum

function getLabelDeleteButton(block, view){
    let pesan = ""
    winConfigForm[block]['PRIMARY_KEY'].forEach(function(primaryId){
        if(getItemValue(primaryId)!=undefined){
            let labelItem
            if(view == "form"){
                labelItem = $$(primaryId).config.label
            }else if(view == "datatable" && $$(block).getColumnConfig(primaryId)!= undefined){
                if( $$(block).getColumnConfig(primaryId).header[0] != null){
                    labelItem = $$(block).getColumnConfig(primaryId).header[0]['text']
                }else if($$(block).getColumnConfig(primaryId).header[0] == null && $$(block).getColumnConfig(primaryId).header[1] != null ){
                    labelItem = $$(block).getColumnConfig(primaryId).header[1]['text']
                }
            }
            pesan+=labelItem+"&nbsp;&nbsp;:&nbsp;&nbsp;"+getItemValue(primaryId)+"<br>"
        }
    })
    return pesan
}

function getRecordForCompare(block,idRow){
/*  
    Digunakan untuk mendapatkan record data pada datatable

    Param :
        block   : block yang memiliki Id yang dituju
        idRow   : Spesifik Id dari row yang dituju
    
    Return Value : 1 dictionary data yang sesuai dengan parameter
*/
    let returnRecord
    if(winDataDtSelect[block]!=undefined){
        winDataDtSelect[block].every(function(row){
            if(row['id']==idRow){
                returnRecord = row
                return false
            }else{
                return true
            }
        })
    }else{
        returnRecord = undefined
    }
    return returnRecord
}

function autoNumberSeq(){
/*  
    Digunakan untuk membentuk value sequence sementara
    
    Return Value :
        Form        :   String "AUTO"
        Datatable   :   String "AUTO"+sequence number
*/
    if($$(window.winActiveBlock['focusNow']).config.view=='form'){
        return "AUTO"    
    }else if($$(window.winActiveBlock['focusNow']).config.view=='datatable'){
        winAutoNumber+=1
        return "AUTO"+winAutoNumber
    }
} //umum

function getDataThisIdNewForm(key){
    if(key!=undefined){
        return getItemValue(key)
    }
    return ""
}

function defineReadOnlyFalse(idBlock){
    /*  
    Digunakan untuk mendefine not readonly pada semua element di block
    */
    winConfigForm[idBlock]["ELEMENT"].forEach(function(id){
        if(!winDisplayItem.includes(id)){
            if($$(id) != undefined){
                $$(id).define("readonly",false)
                $$(id).refresh()
            }
        }
    })
}

function getItemDt(columnId,isValidate){
    // try{
    //     throw Error()
    // }catch(e){
    //     console.error(e)
    // }
/*  
    Digunakan untuk mengambil value dari item pada Datagrid
    
    Param   :   Spesifik Id dari row yang dituju

    Return Value :  String value
*/
    let record = ""
    let blockActive = ""
    let indexRecord = 0
    let haveSubChild = [] 
    let blockActiveGridToGrid = ""
    Object.keys(winConfigForm).forEach(function (blockId) {
        if (winConfigForm[blockId]["BLOCK_TYPE"][2] != undefined) {
            haveSubChild.push(blockId)
        }
        if (!haveSubChild.includes(winConfigForm[blockId]["BLOCK_TYPE"][2])) {
            if(winConfigForm[blockId]["BLOCK_TYPE"][2]!= undefined){
                haveSubChild.push(winConfigForm[blockId]["BLOCK_TYPE"][2])
            }
        }
        if (isGridToGrid) {        
            if (winConfigForm[blockId]['ELEMENT'].includes(columnId)) {
                blockActiveGridToGrid = winConfigForm[blockId]['WIN_ACTIVE_CELL_BLOCK']
            }
        }
    })
    // if(!isValidate){
    //     if(Object.keys(winConfigForm).includes(winActiveBlock.focusNow)){
    //         record = $$(window.winActiveBlock['focusNow']).getItem(window.winActiveCell['pos']['row']);
    //         blockActive = window.winActiveBlock['focusNow']
    //     }else{
    //         record = $$(window.winActiveBlock['lastFocus']).getItem(window.winActiveCell['pos']['row']);
    //         blockActive = window.winActiveBlock['lastFocus']
    //     }
    // }else{
    let rowActive
    
    if (isGridToGrid) {
        rowActive = blockActiveGridToGrid.pos.row
        if(winActiveBlock.focusNow.includes("wd")){
            record = $$(window.winActiveBlock['lastFocus']).getItem(rowActive);
            blockActive = window.winActiveBlock['lastFocus']
        }else{
            record = $$(blockActiveGridToGrid.view).getItem(rowActive);
            blockActive = blockActiveGridToGrid.view
        }
    }else{
        if(Object.keys(window.winValidateItemPos).length != 0 && !winDeleteRecord){
            rowActive = window.winValidateItemPos['pos']['row']
        }else{
            rowActive = winActiveCell.pos.row
        }
        if(winActiveBlock.focusNow.includes("wd")){
            record = $$(window.winActiveBlock['lastFocus']).getItem(rowActive);
            blockActive = window.winActiveBlock['lastFocus']
        }else{
            if(Object.keys(window.winValidateItemPos).length != 0){
                record = $$(winValidateItemPos.view).getItem(rowActive);
                blockActive = winValidateItemPos.view.config.id
            }else{
                record = $$(window.winActiveBlock['focusNow']).getItem(rowActive);
                blockActive = window.winActiveBlock['focusNow']
            }
        }
    }

    // }
    if(winThereIsSubChild){
        if (haveSubChild.includes(winActiveBlock.focusNow)) {
            Object.keys(winConfigForm).every(function(blockId){
                if(winConfigForm[blockId]['ELEMENT'].includes(columnId)){
                    blockActive = blockId                    
                    //dapat block dari column nya
                    let idActive = rowActive
                    indexRecord = $$(blockActive).serialize().findIndex(record1 => record1.id === idActive);    //update index id row
                    // let idActive = rowActive
                    // indexRecord = winActiveCell.view.serialize().findIndex(record1 => record1.id === idActive.row);
                    if(indexRecord == -1){
                        return true
                    }else{
                        record = $$(blockId).serialize()[indexRecord]
                        return false
                    }
                }
                return true
            })
        }
    }
    
    let itemValue = record[columnId]
    if(window.winDateType.includes(columnId)){
        if(itemValue!="" && itemValue!=null){
            let splitDate = itemValue.split("-")
            if(splitDate.length==1){
                let datechoice = moment(splitDate[0], "DD-MM-YYYY").format("DD-MM-YYYY")
                splitDate = datechoice.split("-")
            }
            let newDate = ''
            if(splitDate[0].length == 2){
                newDate = splitDate.reverse().join("-")
            }else if(splitDate[0].length == 4){
                newDate = itemValue
            }
            itemValue = newDate
        }
    }
    if(window.winDateTypeMMYY.includes(columnId)){
        if(itemValue!="" && itemValue!=null){
            let splitDate = itemValue.split("-")
            if(splitDate.length==1){
                let datechoice = moment(splitDate[0], "MM-YYYY").format("MM-YYYY")
                splitDate = datechoice.split("-")
            }
            let newDate = ''
            if(splitDate[0].length == 2){
                newDate = splitDate.reverse().join("-")
            }else if(splitDate[0].length == 4){
                newDate = itemValue
            }
            itemValue = newDate
        }
    }
    let idColumnThisTable = []
    $$(blockActive).config.columns.forEach(function(column){
        idColumnThisTable.push(column.id)
    })
    if(idColumnThisTable.includes(columnId)){
        if(winUpperText.includes(columnId) || $$(blockActive).getColumnConfig(columnId).upperValue){
            if(itemValue!=undefined){
                itemValue = itemValue.toUpperCase()
            }
            
        }else if(winLowerText.includes(columnId) || $$(blockActive).getColumnConfig(columnId).lowerValue){
            if(itemValue!=undefined){
                itemValue = itemValue.toLowerCase()
            }
            
        }
    }
    return itemValue
} //umum

function getIndexRecordDt(paramId){
    let indexData
    winDataDtSelect[winActiveBlock.focusNow].every(function(record){
        if(record.id==paramId){
            indexData = winDataDtSelect[winActiveBlock.focusNow].indexOf(record);
            return false
        }
        return true
    })
    return indexData
}

function getItemValue(id,isValidate){
/*  
    Digunakan untuk mengambil value dari suatu item
    
    Param   :   Id element yang akan dituju

    Return Value :  String value
*/
    let returnValue = ''
    let blockName = ''
    if(Object.keys(winConfigForm).includes(winActiveBlock.focusNow)){
        if(winConfigForm[winActiveBlock.focusNow]['ELEMENT'].includes(id)){
            blockName = winActiveBlock.focusNow
        }else{
            for(block in winConfigForm){
                if(winConfigForm[block]['ELEMENT'].includes(id)){
                    blockName = block
                }
            }
        }
    }else{
        for(block in winConfigForm){
            if(winConfigForm[block]['ELEMENT'].includes(id)){
                blockName = block
            }
        }
    }
    if(winConfigForm[blockName]['BLOCK_TYPE'][0]=='FORM'){
        returnValue = $$(id).getValue()
        if(winUpperText.includes(id) || $$(id).config.upperValue){
            returnValue = returnValue.toUpperCase()
        }else if(winLowerText.includes(id) || $$(id).config.lowerValue){
            returnValue = returnValue.toLowerCase()
        }else if(winDateType.includes(id)){
            returnValue = cekDate(returnValue, "DD-MM-YYYY")
        }else if(winDateTypeMMYY.includes(id)){
            returnValue = cekDate(returnValue, "MM-YYYY")
        }else if(winDateTypeYY.includes(id)){
            returnValue = cekDate(returnValue, "YYYY")
        }
    }else if (winConfigForm[blockName]['BLOCK_TYPE'][0]=='DATAGRID'){
        if(isValidate){
            returnValue = getItemDt(id,true)  
        }else{
            returnValue = getItemDt(id)  
        }
    }
    if(returnValue==null){
        returnValue = ""
    }
    return returnValue
} //umum

function getBlockValue(blockName){
/*  
Digunakan untuk mendapatkan value dari block

Param :
    blockName   : block id yang akan diambil seluruh valuenya

Return Value : 1 dictionary data yang sesuai dengan parameter block name
*/
    let returnValue = ''
    if(Object.keys(winConfigForm).includes(blockName)){
        if(winConfigForm[blockName]['BLOCK_TYPE'][0]=='FORM'){
            returnValue = $$(blockName).getValues()
            Object.keys(returnValue).forEach(function(idReturn){
                if(winButtonCallForm.includes(idReturn)){
                    if(returnValue[idReturn]!=""){
                        returnValue[idReturn] = ""
                    }
                }
                if(winCheckRadio.includes(idReturn)){
                    if($$(idReturn).config.nullValue){
                        returnValue[idReturn] = ""
                    }
                }
                if(winDateType.includes(idReturn)){
                    if(returnValue[idReturn]!=""){
                        returnValue[idReturn] = cekDate(returnValue[idReturn],"DD-MM-YYYY")
                    }
                }else if(winDateTypeMMYY.includes(idReturn)){
                    if(returnValue[idReturn]!=""){
                        returnValue[idReturn] = cekDate(returnValue[idReturn],"MM-YYYY")
                    }
                }else if(winDateTypeYY.includes(idReturn)){
                    if(returnValue[idReturn]!=""){
                        returnValue[idReturn] = cekDate(returnValue[idReturn],"YYYY")
                    }
                }
            })
        } else if (winConfigForm[blockName]['BLOCK_TYPE'][0] == 'DATAGRID') {
            returnValue = $$(blockName).serialize()
        }
        return returnValue
    }
    else{
        RMSGBOX("BLOCK NOT FOUND")
    }
} //umum

function getRecordValueDt(blockName){
    if(window.isGridToGrid){
        if(Object.keys(winConfigForm).includes(blockName)){
            return $$(blockName).getItem(winConfigForm[blockName]['WIN_ACTIVE_CELL_BLOCK']['pos']['row'])
        }
        else{
            RMSGBOX("BLOCK NOT FOUND")
        }
    }else{
        if(Object.keys(winConfigForm).includes(blockName)){
            return $$(blockName).getItem(window.winActiveCell['pos']['row'])
        }
        else{
            RMSGBOX("BLOCK NOT FOUND")
        }
    }
}

function notNullValidate(id){
/*  
    Digunakan untuk pengecekan not null
    
    Param   :   Spesifik Id yang akan dicek

    Return Value :
        Dictionary  :
            status  :   true / false
            tipe    :   apabila status false    => info, warning, error
            pesan   :   string pesan yang muncul apabila status false

*/
    let returnValue = {'status':true, 'tipe':'', 'pesan':''}
    
    let status = true
    let labelId = ''
    if($$(getBlockItem(id)).config.view=="form"){
        labelId = $$(id).config.label
    }else if($$(getBlockItem(id)).config.view=="datatable"){
        labelId = $$(getBlockItem(id)).getColumnConfig(id).header[0]['text']
    }

    if(winConfigForm[winActiveBlock.focusNow]['ELEMENT'].includes(id)){
        if(winConfigForm[winActiveBlock.focusNow]['BLOCK_TYPE'][0]=='FORM'){
            if($$(id).getValue()=='' || $$(id).getValue()==null){
                status = false
            }
        }else if (winConfigForm[winActiveBlock.focusNow]['BLOCK_TYPE'][0]=='DATAGRID'){
            if(getItemDt(id)=='' || getItemDt(id)==null){
                status = false
            }
        }

        if(!status){
            returnValue = {'status':false, 'tipe':'error', 'pesan':labelId+' cannot be empty'}
        }
    }else{
        status = false
        returnValue = {'status':false, 'tipe':'error', 'pesan':labelId+' tidak ada pada active window'}
    }

    return returnValue
} 

function validateLov(param){
/*  
    Digunakan untuk validasi data dari tampilan LOV
    
    param   : {
        "LOV_CODE":"id lov code",
        "DISPLAY_ID":["id display item lov"],
        "API_NAME":"api",                           #harus terdapat +menuId
        "PARAM_ID":["id parameter column/item"]
    }
        

    Return Value :  String value
*/
    let promise = new Promise((resolve)=>{
        let returnValue = {'status':true, 'tipe':'', 'pesan':''}
        let blockItemLOV = getBlockItem(param.LOV_CODE)
        if(winConfigForm[blockItemLOV]['ELEMENT'].includes(param.LOV_CODE)){
            if(winConfigForm[blockItemLOV]['BLOCK_TYPE'][0]=='FORM'){
                if($$(param.LOV_CODE).getValue()=='' || $$(param.LOV_CODE).getValue()==null){
                    let labelId = ''
                    if($$(getBlockItem(param.LOV_CODE)).config.view=="form"){
                        labelId = $$(param.LOV_CODE).config.label
                    }else if($$(getBlockItem(param.LOV_CODE)).config.view=="datatable"){
                        labelId = $$(getBlockItem(param.LOV_CODE)).getColumnConfig(param.LOV_CODE).header[0]['text']
                    }
                    resolve({'status':false, 'tipe':'error', 'pesan':labelId+' cannot be empty'})
                }else{
                    let dictParam = {}
                    dictParam["API_NAME"] = param.API_NAME
                    dictParam["DISPLAY_ID"] = param.DISPLAY_ID
                    dictParam["BLOCK_ID"] = blockItemLOV
                    dictParam["DATA"] = {}
                    dictParam["DATA"][param.LOV_CODE] = $$(param.LOV_CODE).getValue()
                    if($$(param.LOV_CODE).config.upperValue){
                        dictParam["DATA"][param.LOV_CODE] = $$(param.LOV_CODE).getValue().toUpperCase()
                    }else if($$(param.LOV_CODE).config.lowerValue){
                        dictParam["DATA"][param.LOV_CODE] = $$(param.LOV_CODE).getValue().toLowerCase()
                    }
                    if(param.PARAM_ID!= undefined){
                        param.PARAM_ID.forEach(function(keys){
                            dictParam.DATA[keys] = getItemValue(keys)
                            if (getItemValue(keys)==""){
                                dictParam.DATA[keys] = "%%"
                            }
                        })
                    }
                    // let blockName = winActiveBlock.focusNow
                    // let blockType = winConfigForm[winActiveBlock.focusNow].BLOCK_TYPE[0]
                    // let dataFormat = {}
                    // dataFormat[blockName] = {"blockType":blockType,"data":[dictParam["DATA"]]}
                    // dictParam["DATA"] = formatParamAjax(dataFormat,"Search Data")
                    let apiLOV = restapi.restApiData(dictParam)
                    apiLOV.then(function(apiLOV){
                        if(!apiLOV.status){
                            if(apiLOV['msg']==undefined){
                                let value = $$(param.LOV_CODE).getValue()
                                if($$(param.LOV_CODE).config.upperValue){
                                    value = $$(param.LOV_CODE).getValue().toUpperCase()
                                }else if($$(param.LOV_CODE).config.lowerValue){
                                    value = $$(param.LOV_CODE).getValue().toLowerCase()
                                }
                                resolve({'status':false, 'tipe':'error', 'pesan':'data '+value+' not found'})
                            }else{
                                resolve({'status':false, 'tipe':'error', 'pesan':apiLOV.msg})
                            }
                            
                        }else{
                            resolve({"status":true})
                        }
                    })
                }
            }else if (winConfigForm[blockItemLOV]['BLOCK_TYPE'][0]=='DATAGRID'){
                if(getItemDt(param.LOV_CODE)=='' || getItemDt(param.LOV_CODE)==null){
                    let labelId = ''
                    if($$(getBlockItem(param.LOV_CODE)).config.view=="form"){
                        labelId = $$(param.LOV_CODE).config.label
                    }else if($$(getBlockItem(param.LOV_CODE)).config.view=="datatable"){
                        labelId = $$(getBlockItem(param.LOV_CODE)).getColumnConfig(param.LOV_CODE).header[0]['text']
                    }
                    resolve({'status':false, 'tipe':'error', 'pesan':param.LOV_CODE+' cannot be empty'})
                }else{
                    let dictParam = {}
                    dictParam["API_NAME"] = param.API_NAME
                    dictParam["DISPLAY_ID"] = param.DISPLAY_ID
                    dictParam["BLOCK_ID"] = blockItemLOV
                    dictParam["DATA"] = {}
                    dictParam["DATA"][param.LOV_CODE] = getItemDt(param.LOV_CODE,true)
                    dictParam["VALIDATE_LOV"] = true
                    dictParam["ROW_ID"] = window.winValidateItemPos
                    if(param.PARAM_ID!= undefined){
                        param.PARAM_ID.forEach(function(keys){
                            dictParam.DATA[keys] = getItemValue(keys,true)
                            if (getItemValue(keys,true)==""){
                                dictParam.DATA[keys] = "%%"
                            }
                        })
                    }
                    let apiLOV = restapi.restApiData(dictParam)
                    apiLOV.then(function(apiLOV){
                        if(!apiLOV.status){
                            if(apiLOV['msg']==undefined){
                                resolve({'status':false, 'tipe':'error', 'pesan':'data '+getItemDt(param.LOV_CODE,true)+' not found'})
                            }else{
                                resolve({'status':false, 'tipe':'error', 'pesan':apiLOV.msg})
                            }
                        }else{
                            resolve({"status":true})
                        }
                    })
                }
            } 
        }else{
            resolve({'status':false, 'tipe':'error', 'pesan':param.ID_LOV_CODE+' item is not found in active window'})
        }
    })
    return promise
} //umum

function setValueDt(idColumn,valueData){
/*  
Digunakan untuk set value data pada id colommn aktif yang dituju

Param :
    idColumn   : list berisi idColumn
    valueData   : list berisi valueData sesuai dengan list idColumn

*/
    if(winThereIsSubChild){
        let record
        let blockActive
        let indexRecord
        idColumn.forEach(function(colsId){
            let indexColsId = idColumn.indexOf(colsId)
            Object.keys(winConfigForm).every(function(blockId){
                if(winConfigForm[blockId]['ELEMENT'].includes(colsId)){
                    blockActive = blockId       
                    let idActive     //dapat block dari column nya                        
                    idActive = winValidateItemPos.pos.row        //dapat id row active dari focus now
                    indexRecord = winValidateItemPos.view.serialize().findIndex(record1 => record1.id === idActive);    //update index id row
                    record = $$(blockActive).serialize()[indexRecord]
                    record[colsId] = valueData[indexColsId]
                    $$(blockActive).refresh(idActive.row);
                    $$(blockActive).refresh();
                    let idxDataLama = undefined
                    winDataChanged[blockActive].every(function(recordDataChanged){
                        
                        if(recordDataChanged["id"]==record["id"]){
                            idxDataLama = winDataChanged[blockActive].indexOf(recordDataChanged)
                            return false
                        }
                        return true
                    })
                    if(idxDataLama!=undefined){
                        winDataChanged[blockActive][idxDataLama] = record
                    }else{
                        winDataChanged[blockActive].push(record)
                    }
                    if($$(blockActive).config.customOperator){
                        //updateOperatorCustomDt($$(blockActive).config.customOperator);
                        updateFooterDatagrid(blockActive)
                    }

                    return false
                }
                return true
            })
        })
        
    }else{
        let record = $$(winValidateItemPos.view).getItem(winValidateItemPos.pos.row);
        // record[idColumn[0]] = valueData;
        for(let i = 0; i < idColumn.length; i++){
            record[idColumn[i]] = valueData[i]
        }
        $$(winValidateItemPos.view).refresh(winValidateItemPos.pos.row);
        $$(winValidateItemPos.view).refresh();

        let idxDataLama = undefined
        winDataChanged[window.winActiveBlock['focusNow']].every(function(recordDataChanged){
            if(recordDataChanged["id"]==record["id"]){
                idxDataLama = winDataChanged[window.winActiveBlock['focusNow']].indexOf(recordDataChanged)
                return false
            }
            return true
        })

        if(idxDataLama!=undefined){
            winDataChanged[window.winActiveBlock['focusNow']][idxDataLama] = record
        }else{
            winDataChanged[window.winActiveBlock['focusNow']].push(record)
        }

        if($$(window.winActiveBlock['focusNow']).config.customOperator){
            //updateOperatorCustomDt($$(window.winActiveBlock['focusNow']).config.customOperator);
            updateFooterDatagrid(window.winActiveBlock['focusNow'])
        }
    }
    
} //umum

function MSGBOX(message) {
/*  
Digunakan untuk menampilkan pop up error

Param :
    message   : text message yang akan tampil pada popup
*/
    if(!isWebixPopupOpen()){
        return webix.alert(ALERT.ALERTINFO(message))
    }
} //umum

function RMSGBOX(message,thenFunction=function(){}) {
/*  
Digunakan untuk menampilkan pop up error message dan menjalankan function setelah klik ok pada popup error

Param :
    message   : text message yang akan tampil pada popup
    thenFunction : fungsi tambahan yang akan dijalankan setelah user klik ok pada popup error
*/
    if(!isWebixPopupOpen()){
        return webix.alert(ALERT.ALERTERROR(message)).then(thenFunction)
    }
} //umum

function GO_ITEM(idItem){
/*  
Digunakan untuk memindahkan fokus secara custom ke item

Param :
    idItem   : id element yang akan dituju

*/
    let blockActive = ""
    Object.keys(winConfigForm).every(function(block){
        if(winConfigForm[block]["ELEMENT"].includes(idItem)){
            blockActive = block
            return false
        }
        return true
    })

    if(blockActive!=""){
        if(blockActive==winActiveBlock.focusNow){
            if(winConfigForm[blockActive]["BLOCK_TYPE"][0]=="FORM"){
                $$(idItem).focus()
            }else if(winConfigForm[blockActive]["BLOCK_TYPE"][0]=="DATAGRID"){
                if(winActiveCell!=""){
                    $$(blockActive).select(winActiveCell.pos.row, idItem);
                }else{
                    let firstId = $$(blockActive).getFirstId();
                    $$(blockActive).select(firstId, idItem);
                }
            }
        }else{
            // webix.alert(ALERT.ALERTWARNING("ID "+idItem+" tidak terdapat pada block Active"))
            // error perbedaan jenis block
            if(winConfigForm[blockActive]["BLOCK_TYPE"][0]=="FORM"){
                webix.UIManager.setFocus($$(blockActive))
                $$(idItem).focus()
            }else if(winConfigForm[blockActive]["BLOCK_TYPE"][0]=="DATAGRID"){
                webix.UIManager.setFocus($$(blockActive))
                if(winActiveCell!=""){
                    $$(blockActive).select(winActiveCell.pos.row, idItem);
                }else{
                    let firstId = $$(blockActive).getFirstId();
                    $$(blockActive).select(firstId, idItem);
                }
            }
        }
    }else{
        if(!isWebixPopupOpen()){
            webix.alert(ALERT.ALERTERROR("ID "+idItem+" not found"))
        }
        // error id Item not found
    }
} //umum

function GO_BLOCK(idBlock){
/*  
Digunakan untuk memindahkan focus secara custom ke block

Param :
    idBlock   : id block yang akan dituju

*/
    webix.UIManager.setFocus($$(idBlock));
    if(winMultiviewBlocks.includes(idBlock)){
        if($$("tabbar"+idBlock)){
            $$("tabbar"+idBlock).show()    
        }
        $$('tabbar'+menuId).setValue(winActiveBlock.focusNow);
    }else if(winMultiviewBlocksVertical.includes(idBlock)){
        webix.$$(idBlock+"_verticalTab").show();
        $$("listMultiviewVertical"+menuId).select(idBlock)
    }
} //umum

function cekDate(value,format){
/*  
Digunakan untuk membuat format date

Param :
    value   : value date string
    format  : format date yang diinginkan

Return Value : string formatted date
*/
    let dateString = moment(value, format).format()
    let dateObject = new Date(dateString)
    if (!isNaN(dateObject.getTime())){
        return moment(dateObject).format(format)
    }else{
        return null 
    }
} //umum

function generateElementColsLov(id,label,totalCols,lovFirst,isDate, isHidden, alignRight){
/*  
Digunakan untuk generate elemet columns tampilan lov

Param :
    id      : list id 
    label   : list label
    totalCOls   : total column yang akan digenerate
    lovFirst    : object pertama lov => code
    isDate      : flag lov berupa date
    isHidden    : flag lov hidden

Return Value : 1 dictionary object element lov
*/
    let hideItem = isHidden || false
    let elementsLov = [] 
    let genElement = {}
    let kumpulanId = [lovFirst.id]
    let elementColsNumb = totalCols 
    let rightAlign = alignRight || undefined
    if(totalCols==null || totalCols=="" || totalCols==0 || totalCols==1){
        elementColsNumb = 0
    }
    let firstLov = lovFirst;
    let bottomLabel = firstLov['bottomLabel'] || undefined
    if(isDate.includes(firstLov.id)){
        firstLov = Object.assign(firstLov, {view:"search", icon:"mdi mdi-table-edit",attributes:{ maxlength:10 },bottomLabel:"* Number only"})
        winDateType.push(firstLov.id)
    }else{
        firstLov =  Object.assign(firstLov, {view:"search", icon:"mdi mdi-table-edit"})
    }
    if(rightAlign){
        if(rightAlign.includes(firstLov.id)){
            firstLov = Object.assign(firstLov, {inputAlign:"right"})
        }
    }
    
    
    elementsLov.push(firstLov);
    for(let i=1; i<elementColsNumb ; i++){
        if(isDate.includes(id[i])){
            genElement = {view:"text", css:'textdisplay', label:label[i], placeholder:label[i],readonly:true,jenis:"display",hidden:hideItem,displayItem:true,labelPosition: window.labelPosition || "top", id:id[i], name:id[i], attributes:{ maxlength:10 },bottomLabel:"* Number only"}
            winDateType.push(id[i])
        }else{
            genElement = {view:"text",css:'textdisplay',label:label[i], placeholder:label[i], readonly:true,jenis:"display",hidden:hideItem,displayItem:true,labelPosition: window.labelPosition || "top", id:id[i], name:id[i]}
        }
        if(rightAlign){
            if(rightAlign.includes(id[i])){
                genElement = Object.assign(genElement, {inputAlign:"right"})
            }
        }
        additionalMultiLanguage.push(id[i])
        kumpulanId.push(id[i])

        if(bottomLabel!=undefined){
            genElement = Object.assign(genElement,{bottomLabel:""})
        }
        elementsLov.push(genElement);
        winDisplayItem.push(id[i])        
    }

    let viewElementLov = {
        kumpulanId:kumpulanId,
        hidden:isHidden, 
        cols:elementsLov
    }
    return viewElementLov
}

function checkingFormat(data,type){
/*  
Digunakan untuk membuat format dictionary data yang akan dikirim ke API serta pengecekan value agar sesuai dengan format elementnya masing-masing

Param :
    data    : dictionary kumpulan data-data dari seluruh block
    type    : type API

Return Value : 1 dictionary data
*/
    Object.keys(data).forEach(function(block){
    //looping block
        if (data[block]["blockType"]=="form"){
            data[block]['data'].forEach(function(recordData){
            //looping record
                Object.keys(recordData).forEach(function(item){
                    if(window.winDateType.includes(item)){
                        if (window.winConfigForm[block]["ELEMENT"].includes(item)){
                            let configColumn = $$(item).config
                            if (recordData[item]!='' && recordData[item]!=null){
                                recordData[item] = cekDate(recordData[item], "DD-MM-YYYY");
                                if(recordData[item].length==configColumn.attributes.maxlength && recordData[item].split("-").length<=3 && recordData[item].split("-")[0].length==4){
                                    recordData[item] = recordData[item].split("-").join("-");
                                }else if(recordData[item].length==configColumn.attributes.maxlength && recordData[item].split("-").length<=3 && recordData[item].split("-")[0].length==2){
                                    recordData[item] = recordData[item].split("-").reverse().join("-");
                                }
                            }else{
                                recordData[item] = null;
                            }
                        }
                    }
                    if(window.winDateTypeMMYY.includes(item)){
                        if (window.winConfigForm[block]["ELEMENT"].includes(item)){
                            let configColumn = $$(item).config
                            if (recordData[item]!='' && recordData[item]!=null){
                                recordData[item] = cekDate(recordData[item], "MM-YYYY");
                                if(recordData[item].length==configColumn.attributes.maxlength && recordData[item].split("-").length<=3 && recordData[item].split("-")[0].length==4){
                                    recordData[item] = recordData[item].split("-").join("-");
                                }else if(recordData[item].length==configColumn.attributes.maxlength && recordData[item].split("-").length<=3 && recordData[item].split("-")[0].length==2){
                                    recordData[item] = recordData[item].split("-").reverse().join("-")+"-01";
                                }
                            }else{
                                recordData[item] = null;
                            }
                        }
                    }
                    if(window.winDateTypeYY.includes(item)){
                        if (window.winConfigForm[block]["ELEMENT"].includes(item)){
                            let configColumn = $$(item).config
                            if (recordData[item]!='' && recordData[item]!=null){
                                if(recordData[item].length==configColumn.attributes.maxlength && recordData[item].split("-").length<=3 && recordData[item].split("-")[0].length==4){
                                    recordData[item] = recordData[item].split("-").join("-")+"-01-01";
                                }else if(recordData[item].length==configColumn.attributes.maxlength && recordData[item].split("-").length<=3 && recordData[item].split("-")[0].length==2){
                                    recordData[item] = recordData[item].split("-").reverse().join("-");
                                }
                            }else{
                                recordData[item] = null;
                            }
                        }
                    }
                    if(window.winClockType.includes(item)){
                        if (window.winConfigForm[block]["ELEMENT"].includes(item)){
                            let configDateId = $$(item).config.dateId 
                            let configAddSecond = $$(item).config.addSecond
                            if (recordData[item]!='' && recordData[item]!=null){
                                if(configDateId == undefined && configAddSecond == false){
                                    let time = moment(recordData[item]+':00', 'HH:mm:ss').format('HH:mm:ss')
                                    let today = moment().format("YYYY-MM-DD")
                                    let datetime = today + " " + time
                                    recordData[item] = datetime
                                }
                                else if(configDateId == undefined && configAddSecond == true){
                                    let time = moment(recordData[item], 'HH:mm:ss').format('HH:mm:ss')
                                    let today = moment().format("YYYY-MM-DD")
                                    let datetime = today + " " + time
                                    recordData[item] = datetime
                                }
                                else if(configDateId != "" && configDateId != undefined && configAddSecond == false){
                                    let time = moment(recordData[item]+':00', 'HH:mm:ss').format('HH:mm:ss')
                                    let datetime = recordData[configDateId] + " " + time 
                                    recordData[item] = datetime
                                }
                                else if(configDateId != "" && configDateId != undefined && configAddSecond == true){
                                    let time = moment(recordData[item], 'HH:mm:ss').format('HH:mm:ss')
                                    let datetime = recordData[configDateId] + " " + time 
                                    recordData[item] = datetime
                                }
                            }else{
                                recordData[item] = null;
                            }
                        }
                    }
                    if(window.winTimestampType.includes(item)){
                        if (window.winConfigForm[block]["ELEMENT"].includes(item)){
                            let configColumn = $$(item).config
                            if (recordData[item]!='' && recordData[item]!=null){
                                if(recordData[item].split(" ")[0].split("-")[0].length == 2){
                                    recordData[item] = cekDate(recordData[item], "DD-MM-YYYY HH:mm:ss");
                                }else if(recordData[item].split(" ")[0].split("-")[0].length == 4){
                                    recordData[item] = cekDate(recordData[item], "YYYY-MM-DD HH:mm:ss");
                                }
                                let dateRecord = recordData[item].split(' ')[0]
                                let time = recordData[item].split(' ')[1]
                                let date
                                if(dateRecord.length == 10){
                                    if(recordData[item].length==configColumn.attributes.maxlength && dateRecord.split("-").length<=3 && dateRecord.split("-")[0].length==4){
                                        date = dateRecord.split("-").join("-");
                                    }
                                    else if(recordData[item].length==configColumn.attributes.maxlength && dateRecord.split("-").length<=3 && dateRecord.split("-")[0].length==2){
                                        date = dateRecord.split("-").reverse().join("-");
                                    }
                                    recordData[item] = date + " " + time
                                }else{
                                    recordData[item] = null;
                                }
                            }
                            else{
                                recordData[item] = null;
                            }
                        }
                    }
                    if(window.winCurrency.includes(item)){
                        if (window.winConfigForm[block]["ELEMENT"].includes(item)){
                            if (recordData[item]!='' && recordData[item] != null){
                                let newCurrency = recordData[item].replace(/\./g, "")
                                let last = newCurrency.slice(-3);
                                if(last==",00"){
                                    newCurrency=newCurrency.replace(",00","")
                                }else{
                                newCurrency=newCurrency.replace(",",".")
                                }
                                let first = newCurrency.substring(0, 3);
                                newCurrency=newCurrency.replace(first,"")
                                recordData[item] = newCurrency
                            }else{
                                recordData[item] = "";
                            }
                        }
                    }
                    if(window.winUpperText.includes(item)){
                        if (window.winConfigForm[block]["ELEMENT"].includes(item)){
                            if (recordData[item]!='' && recordData[item] != null){
                                recordData[item] = recordData[item].toUpperCase()
                            }else{
                                recordData[item] = "";
                            }
                        }
                    }

                    if(window.winLowerText.includes(item)){
                        if (window.winConfigForm[block]["ELEMENT"].includes(item)){
                            if (recordData[item]!='' && recordData[item] != null){
                                recordData[item] = recordData[item].toLowerCase()
                            }else{
                                recordData[item] = "";
                            }
                        }
                    }
                })
                
            })
        }else if(data[block]["blockType"]=="datagrid"){
            data[block]['data'].forEach(function(record){
                Object.keys(record).forEach(function(item){
                    if(window.winDateType.includes(item)){
                        if (window.winConfigForm[block]["ELEMENT"].includes(item)){
                            let configColumn = $$(block).getColumnConfig(item)
                            if (record[item]!='' && record[item]!=null){
                                if(record[item].length==configColumn.maxLength && record[item].split("-").length<=3 && record[item].split("-")[0].length==4){
                                    record[item] = record[item].split("-").join("-");
                                }else if(record[item].length==configColumn.maxLength && record[item].split("-").length<=3 && record[item].split("-")[0].length==2){
                                    record[item] = record[item].split("-").reverse().join("-");
                                }
                            }else{
                                record[item] = null;
                            }
                        }
                    }
                    if(window.winDateTypeMMYY.includes(item)){
                        if (window.winConfigForm[block]["ELEMENT"].includes(item)){
                            let configColumn = $$(block).getColumnConfig(item)
                            if (record[item]!='' && record[item]!=null){
                                if(record[item].length==configColumn.maxLength && record[item].split("-").length<=2 && record[item].split("-")[0].length==4){
                                    record[item] = record[item].split("-").join("-")+'-01';
                                }else if(record[item].length==configColumn.maxLength && record[item].split("-").length<=2 && record[item].split("-")[0].length==2){
                                    record[item] = record[item].split("-").reverse().join("-")+'-01';
                                }
                            }else{
                                record[item] = null;
                            }
                        }
                    }
                    if(window.winDateTypeYY.includes(item)){
                        if (window.winConfigForm[block]["ELEMENT"].includes(item) && Object.keys(record).includes(item)){
                            let configColumn = $$(block).getColumnConfig(item)
                            if (record[item]!='' && record[item]!=null){
                                if(record[item].length==configColumn.maxLength && record[item].split("-").length<=2 && record[item].split("-")[0].length==4){
                                    record[item] = record[item].split("-").join("-")+'-01-01';
                                }else if(record[item].length==configColumn.maxLength && record[item].split("-").length<=2 && record[item].split("-")[0].length==2){
                                    record[item] = record[item].split("-").reverse().join("-");
                                }
                            }else{
                                record[item] = null;
                            }
                        }
                    }
                    if(window.winClockType.includes(item)){
                        if (window.winConfigForm[block]["ELEMENT"].includes(item)){
                            let configDateId = $$(block).getColumnConfig(item).dateId
                            let configAddSecond = $$(block).getColumnConfig(item).addSecond
                            if (record[item]!='' && record[item]!=null){
                                if(configDateId == undefined && configAddSecond == false){
                                    let time = moment(record[item], 'HH:mm:ss').format('HH:mm:ss')
                                    let today = moment().format("YYYY-MM-DD")
                                    let datetime = today + " " + time
                                    record[item] = datetime
                                }
                                else if(configDateId == undefined && configAddSecond == true){
                                    let time = moment(record[item], 'HH:mm:ss').format('HH:mm:ss')
                                    let today = moment().format("YYYY-MM-DD")
                                    let datetime = today + " " + time
                                    record[item] = datetime
                                }
                                else if(configDateId != "" && configDateId != undefined && configAddSecond == false){
                                    let time = moment(record[item], 'HH:mm:ss').format('HH:mm:ss')
                                    let datetime = record[configDateId] + " " + time 
                                    record[item] = datetime
                                }
                                else if(configDateId != "" && configDateId != undefined && configAddSecond == true){
                                    let time = moment(record[item], 'HH:mm:ss').format('HH:mm:ss')
                                    let datetime = record[configDateId] + " " + time 
                                    record[item] = datetime
                                }
                            }else{
                                record[item] = null;
                            }
                        }
                    }
                    if(window.winTimestampType.includes(item)){
                        if (window.winConfigForm[block]["ELEMENT"].includes(item)){
                            let configColumn = $$(block).getColumnConfig(item)
                            if (record[item]!='' && record[item]!=null){
                                if(record[item].split(" ")[0].split("-")[0].length == 2){
                                    record[item] = cekDate(record[item], "DD-MM-YYYY HH:mm:ss");
                                }else if(record[item].split(" ")[0].split("-")[0].length == 4){
                                    record[item] = cekDate(record[item], "YYYY-MM-DD HH:mm:ss");
                                }
                                let dateRecord = record[item].split(' ')[0]
                                let time = record[item].split(' ')[1]
                                let date
                                if(record[item].length==configColumn.maxLength && dateRecord.split("-").length<=3 && dateRecord.split("-")[0].length==4){
                                    date = dateRecord.split("-").join("-");
                                }
                                else if(record[item].length==configColumn.maxLength && dateRecord.split("-").length<=3 && dateRecord.split("-")[0].length==2){
                                    date = dateRecord.split("-").reverse().join("-");
                                }
                                record[item] = date + " " + time
                            }else{
                                record[item] = null;
                            }
                        }
                    }
                    if(window.winUpperText.includes(item)){
                        if (window.winConfigForm[block]["ELEMENT"].includes(item)){
                            if (record[item]!='' && record[item]!=null){
                                record[item] = record[item].toUpperCase()
                            }else{
                                record[item] = '';
                            }
                        }
                    }
                    if(window.winLowerText.includes(item)){
                        if (window.winConfigForm[block]["ELEMENT"].includes(item)){
                            if (record[item]!='' && record[item]!=null){
                                record[item] = record[item].toLowerCase()
                            }else{
                                record[item] = '';
                            }
                        }
                    }
                })

            })
        }
        data[block]['data'].forEach(function(recordData){
            Object.keys(recordData).forEach(function(id){
                Object.keys(winConfigForm).forEach(function(blockPK){
                    if (winConfigForm[blockPK]['BASE_TABLE'] == undefined){
                        winConfigForm[blockPK]['BASE_TABLE'] = true
                    }
                    if(winConfigForm[blockPK]["PRIMARY_KEY"].includes(id) && winConfigForm[blockPK]['BASE_TABLE']){
                        if(winConfigForm[blockPK]["BLOCK_TYPE"][0]=="FORM"){
                            if(Object.keys(winConfigForm).length > 1){
                                Object.keys(winConfigForm).forEach(function(block){
                                    if(winConfigForm[block]['BLOCK_TYPE'][1]=='PARENT'){
                                        if(winConfigForm[block]['BLOCK_TYPE'][0]=='FORM'){
                                            winConfigForm[block]['PRIMARY_KEY'].forEach(function(idPk){
                                                recordData[idPk] = $$(idPk).getValue()

                                                if(window.winDateType.includes(idPk)){
                                                    if (window.winConfigForm[block]["ELEMENT"].includes(idPk)){
                                                        let configColumn = $$(idPk).config
                                                        if (recordData[idPk]!='' && recordData[idPk]!=null){
                                                            recordData[idPk] = cekDate(recordData[idPk], "DD-MM-YYYY");
                                                            if(recordData[idPk].length==configColumn.attributes.maxlength && recordData[idPk].split("-").length<=3 && recordData[idPk].split("-")[0].length==4){
                                                                recordData[idPk] = recordData[idPk].split("-").join("-");
                                                            }else if(recordData[idPk].length==configColumn.attributes.maxlength && recordData[idPk].split("-").length<=3 && recordData[idPk].split("-")[0].length==2){
                                                                recordData[idPk] = recordData[idPk].split("-").reverse().join("-");
                                                            }
                                                        }else{
                                                            recordData[idPk] = null;
                                                        }
                                                    }
                                                }
                                                if(window.winDateTypeMMYY.includes(idPk)){
                                                    if (window.winConfigForm[block]["ELEMENT"].includes(idPk)){
                                                        let configColumn = $$(idPk).config
                                                        if (recordData[idPk]!='' && recordData[idPk]!=null){
                                                            recordData[idPk] = cekDate(recordData[idPk], "MM-YYYY");
                                                            if(recordData[idPk].length==configColumn.attributes.maxlength && recordData[idPk].split("-").length<=3 && recordData[idPk].split("-")[0].length==4){
                                                                recordData[idPk] = recordData[idPk].split("-").join("-");
                                                            }else if(recordData[idPk].length==configColumn.attributes.maxlength && recordData[idPk].split("-").length<=3 && recordData[idPk].split("-")[0].length==2){
                                                                recordData[idPk] = recordData[idPk].split("-").reverse().join("-")+"-01";
                                                            }
                                                        }else{
                                                            recordData[idPk] = null;
                                                        }
                                                    }
                                                }
                                                if(window.winDateTypeYY.includes(idPk)){
                                                    if (window.winConfigForm[block]["ELEMENT"].includes(idPk)){
                                                        let configColumn = $$(idPk).config
                                                        if (recordData[idPk]!='' && recordData[idPk]!=null){
                                                            if(recordData[idPk].length==configColumn.attributes.maxlength && recordData[idPk].split("-").length<=3 && recordData[idPk].split("-")[0].length==4){
                                                                recordData[idPk] = recordData[idPk].split("-").join("-")+"-01-01";
                                                            }else if(recordData[idPk].length==configColumn.attributes.maxlength && recordData[idPk].split("-").length<=3 && recordData[idPk].split("-")[0].length==2){
                                                                recordData[idPk] = recordData[idPk].split("-").reverse().join("-");
                                                            }
                                                        }else{
                                                            recordData[idPk] = null;
                                                        }
                                                    }
                                                }
                                                if(window.winClockType.includes(idPk)){
                                                    if (window.winConfigForm[block]["ELEMENT"].includes(idPk)){
                                                        let configDateId = $$(idPk).config.dateId 
                                                        let configAddSecond = $$(idPk).config.addSecond
                                                        if (recordData[idPk]!='' && recordData[idPk]!=null){
                                                            if(configDateId == undefined && configAddSecond == false){
                                                                let time = moment(recordData[idPk]+':00', 'HH:mm:ss').format('HH:mm:ss')
                                                                let today = moment().format("YYYY-MM-DD")
                                                                let datetime = today + " " + time
                                                                recordData[idPk] = datetime
                                                            }
                                                            else if(configDateId == undefined && configAddSecond == true){
                                                                let time = moment(recordData[idPk], 'HH:mm:ss').format('HH:mm:ss')
                                                                let today = moment().format("YYYY-MM-DD")
                                                                let datetime = today + " " + time
                                                                recordData[idPk] = datetime
                                                            }
                                                            else if(configDateId != "" && configDateId != undefined && configAddSecond == false){
                                                                let time = moment(recordData[idPk]+':00', 'HH:mm:ss').format('HH:mm:ss')
                                                                let datetime = recordData[configDateId] + " " + time 
                                                                recordData[idPk] = datetime
                                                            }
                                                            else if(configDateId != "" && configDateId != undefined && configAddSecond == true){
                                                                let time = moment(recordData[idPk], 'HH:mm:ss').format('HH:mm:ss')
                                                                let datetime = recordData[configDateId] + " " + time 
                                                                recordData[idPk] = datetime
                                                            }
                                                        }else{
                                                            recordData[idPk] = null;
                                                        }
                                                    }
                                                }
                                                if(window.winTimestampType.includes(idPk)){
                                                    if (window.winConfigForm[block]["ELEMENT"].includes(idPk)){
                                                        let configColumn = $$(idPk).config
                                                        if (recordData[idPk]!='' && recordData[idPk]!=null){
                                                            if(recordData[idPk].split(" ")[0].split("-")[0].length == 2){
                                                                recordData[idPk] = cekDate(recordData[idPk], "DD-MM-YYYY HH:mm:ss");
                                                            }else if(recordData[idPk].split(" ")[0].split("-")[0].length == 4){
                                                                recordData[idPk] = cekDate(recordData[idPk], "YYYY-MM-DD HH:mm:ss");
                                                            }
                                                            let dateRecord = recordData[idPk].split(' ')[0]
                                                            let time = recordData[idPk].split(' ')[1]
                                                            let date
                                                            if(dateRecord.length == 10){
                                                                if(recordData[idPk].length==configColumn.attributes.maxlength && dateRecord.split("-").length<=3 && dateRecord.split("-")[0].length==4){
                                                                    date = dateRecord.split("-").join("-");
                                                                }
                                                                else if(recordData[idPk].length==configColumn.attributes.maxlength && dateRecord.split("-").length<=3 && dateRecord.split("-")[0].length==2){
                                                                    date = dateRecord.split("-").reverse().join("-");
                                                                }
                                                                recordData[idPk] = date + " " + time
                                                            }else{
                                                                recordData[idPk] = null;
                                                            }
                                                        }
                                                        else{
                                                            recordData[idPk] = null;
                                                        }
                                                    }
                                                }
                                            })
                                        }
                                    }
                                })
                            }
                        }
                    }
                })
            })
            Object.keys(recordData).forEach(function(id){
            //looping record
                Object.keys(winConfigForm).forEach(function(blockPK){
                    if (winConfigForm[blockPK]['BASE_TABLE'] == undefined){
                        winConfigForm[blockPK]['BASE_TABLE'] = true
                    }
                    if(winConfigForm[blockPK]["PRIMARY_KEY"].includes(id) && winConfigForm[blockPK]['BASE_TABLE']){
                        
                        if(winConfigForm[blockPK]["BLOCK_TYPE"][0]=="FORM"){
                            // if(Object.keys(winConfigForm).length > 1){
                            //     Object.keys(winConfigForm).forEach(function(block){
                            //         if(winConfigForm[block]['BLOCK_TYPE'][1]=='PARENT'){
                            //             if(winConfigForm[block]['BLOCK_TYPE'][0]=='FORM'){
                            //                 winConfigForm[block]['PRIMARY_KEY'].forEach(function(idPk){
                            //                     recordData[idPk] = $$(idPk).getValue()
                            //                 })
                            //             }
                            //         }
                            //     })
                            // }
                            window.winDateType.forEach(function(item){
                                if (item==id){
                                    let configColumn = $$(id).config
                                    if (recordData[id]!='' && recordData[id]!=null){
                                        if(recordData[id].length==configColumn.attributes.maxlength && recordData[id].split("-").length<=3 && recordData[id].split("-")[0].length==4){
                                            recordData[id] = recordData[id].split("-").join("-");
                                        }else if(recordData[id].length==configColumn.attributes.maxlength && recordData[id].split("-").length<=3 && recordData[id].split("-")[0].length==2){
                                            recordData[id] = recordData[id].split("-").reverse().join("-");
                                        }else if(recordData[id].length<configColumn.attributes.maxlength){
                                            recordData[id] = cekDate(recordData[id], "DD-MM-YYYY");
                                            if(recordData[id].length==configColumn.attributes.maxlength && recordData[id].split("-").length<=3 && recordData[id].split("-")[0].length==4){
                                                recordData[id] = recordData[id].split("-").join("-");
                                            }else if(recordData[id].length==configColumn.attributes.maxlength && recordData[id].split("-").length<=3 && recordData[id].split("-")[0].length==2){
                                                recordData[id] = recordData[id].split("-").reverse().join("-");
                                            }
                                        }
                                    }else{
                                        recordData[id] = null;
                                    }
                                }
                            })
                            window.winDateTypeMMYY.forEach(function(item){
                                if (item==id){
                                    let configColumn = $$(id).config
                                    if (recordData[id]!='' && recordData[id]!=null){
                                        if(recordData[id].length==configColumn.attributes.maxlength && recordData[id].split("-").length<=3 && recordData[id].split("-")[0].length==4){
                                            recordData[id] = recordData[id].split("-").join("-");
                                        }else if(recordData[id].length==configColumn.attributes.maxlength && recordData[id].split("-").length<=3 && recordData[id].split("-")[0].length==2){
                                            recordData[id] = recordData[id].split("-").reverse().join("-")+"-01";
                                        }else if(recordData[id].length<configColumn.attributes.maxlength){
                                            recordData[id] = cekDate(recordData[id], "MM-YYYY");
                                            if(recordData[id].length==configColumn.attributes.maxlength && recordData[id].split("-").length<=3 && recordData[id].split("-")[0].length==4){
                                                recordData[id] = recordData[id].split("-").join("-");
                                            }else if(recordData[id].length==configColumn.attributes.maxlength && recordData[id].split("-").length<=3 && recordData[id].split("-")[0].length==2){
                                                recordData[id] = recordData[id].split("-").reverse().join("-")+"-01";
                                            }
                                        }else if(recordData[id].length==10){
                                            if(recordData[id].length==configColumn.attributes.maxlength && recordData[id].split("-").length<=3 && recordData[id].split("-")[0].length==4){
                                                recordData[id] = recordData[id].split("-").join("-");
                                            }else if(recordData[id].length==configColumn.attributes.maxlength && recordData[id].split("-").length<=3 && recordData[id].split("-")[0].length==2){
                                                recordData[id] = recordData[id].split("-").reverse().join("-");
                                            }
                                        }
                                    }else{
                                        recordData[id] = null;
                                    }
                                }
                            })
                            window.winDateTypeYY.forEach(function(item){
                                if (item==id){
                                    let configColumn = $$(id).config
                                    if (recordData[id]!='' && recordData[id]!=null){
                                        if(recordData[id].length==configColumn.attributes.maxlength && recordData[id].split("-").length<=3 && recordData[id].split("-")[0].length==4){
                                            recordData[id] = recordData[id].split("-").join("-")+"-01-01";
                                        }else if(recordData[id].length==configColumn.attributes.maxlength && recordData[id].split("-").length<=3 && recordData[id].split("-")[0].length==2){
                                            recordData[id] = recordData[id].split("-").reverse().join("-");
                                        }else if(recordData[id].length<configColumn.attributes.maxlength){
                                            recordData[id] = cekDate(recordData[id], "YYYY");
                                            if(recordData[id].length==configColumn.attributes.maxlength && recordData[id].split("-").length<=3 && recordData[id].split("-")[0].length==4){
                                                recordData[id] = recordData[id].split("-").join("-")+"-01-01";
                                            }else if(recordData[id].length==configColumn.attributes.maxlength && recordData[id].split("-").length<=3 && recordData[id].split("-")[0].length==2){
                                                recordData[id] = recordData[id].split("-").reverse().join("-");
                                            }
                                        }else if(recordData[id].length==10){
                                            if(recordData[id].length==configColumn.attributes.maxlength && recordData[id].split("-").length<=3 && recordData[id].split("-")[0].length==4){
                                                recordData[id] = recordData[id].split("-").join("-");
                                            }else if(recordData[id].length==configColumn.attributes.maxlength && recordData[id].split("-").length<=3 && recordData[id].split("-")[0].length==2){
                                                recordData[id] = recordData[id].split("-").reverse().join("-");
                                            }
                                        }
                                    }else{
                                        recordData[id] = null;
                                    }
                                }
                            })

                            window.winUpperText.forEach(function(item){
                                if (item==id){
                                    if (recordData[id]!='' && recordData[id]!=null){
                                        recordData[id] = recordData[id].toUpperCase()
                                    }else{
                                        recordData[id] = '';
                                    }
                                }
                            })

                            window.winLowerText.forEach(function(item){
                                if (item==id){
                                    if (recordData[id]!='' && recordData[id]!=null){
                                        recordData[id] = recordData[id].toLowerCase()
                                    }else{
                                        recordData[id] = '';
                                    }
                                }
                            })

                        }else if (winConfigForm[blockPK]["BLOCK_TYPE"][0]=="DATAGRID"){
                            window.winDateType.forEach(function(item){
                                if (item==id){
                                    let configColumn = $$(blockPK).getColumnConfig(id)
                                    if (recordData[id]!='' && recordData[id]!=null){
                                        if(recordData[id].length==configColumn.maxLength && recordData[id].split("-").length<=3 && recordData[id].split("-")[0].length==4){
                                            recordData[id] = recordData[id].split("-").join("-");
                                        }else if(recordData[id].length==configColumn.maxLength && recordData[id].split("-").length<=3 && recordData[id].split("-")[0].length==2){
                                            recordData[id] = recordData[id].split("-").reverse().join("-");
                                        }
                                    }else{
                                        recordData[id] = null;
                                    }
                                }
                            })
                            window.winDateTypeMMYY.forEach(function(item){
                                if (item==id){
                                    let configColumn = $$(blockPK).getColumnConfig(id)
                                    if (recordData[id]!='' && recordData[id]!=null){
                                        if(recordData[id].length==configColumn.maxLength && recordData[id].split("-").length<=2 && recordData[id].split("-")[0].length==4){
                                            recordData[id] = recordData[id].split("-").join("-")+'-01';
                                        }else if(recordData[id].length==configColumn.maxLength && recordData[id].split("-").length<=2 && recordData[id].split("-")[0].length==2){
                                            recordData[id] = recordData[id].split("-").reverse().join("-")+'-01';
                                        }
                                    }else{
                                        recordData[id] = null;
                                    }
                                }
                            })
                            window.winDateTypeYY.forEach(function(item){
                                if (item==id){
                                    let configColumn = $$(blockPK).getColumnConfig(id)
                                    if (recordData[id]!='' && recordData[id]!=null){
                                        if(recordData[id].length==configColumn.maxLength && recordData[id].split("-").length<=2 && recordData[id].split("-")[0].length==4){
                                            recordData[id] = recordData[id].split("-").join("-")+'-01-01';
                                        }else if(recordData[id].length==configColumn.maxLength && recordData[id].split("-").length<=2 && recordData[id].split("-")[0].length==2){
                                            recordData[id] = recordData[id].split("-").reverse().join("-");
                                        }
                                    }else{
                                        recordData[id] = null;
                                    }
                                }
                            })

                            window.winUpperText.forEach(function(item){
                                if (item==id){
                                    if (recordData[id]!='' && recordData[id]!=null){
                                        recordData[id] = recordData[id].toUpperCase()
                                    }else{
                                        recordData[id] = '';
                                    }
                                }
                            })

                            window.winLowerText.forEach(function(item){
                                if (item==id){
                                    if (recordData[id]!='' && recordData[id]!=null){
                                        recordData[id] = recordData[id].toLowerCase()
                                    }else{
                                        recordData[id] = '';
                                    }
                                }
                            })

                            if(Object.keys(winConfigForm).length > 1){
                                Object.keys(winConfigForm).forEach(function(block){
                                    if(winConfigForm[block]['BLOCK_TYPE'][1]=='PARENT'){
                                        if(winConfigForm[block]['ELEMENT'].includes(id) && winConfigForm[block]['BLOCK_TYPE'][0]=='FORM'){
                                            recordData[id] = $$(id).getValue()
                                        }
                                    }
                                })
                            }
                        }
                    }
                })
            })
        })

        // data[block]['data'].forEach(function(recordData){
        //     if(winConfigForm[block]["BLOCK_TYPE"][0]=="FORM"){
        //         Object.keys(recordData).forEach(function(id){
        //             if($$(id).config.view=="button"){
        //                 delete recordData[id]
        //             }
        //         })
        //     }
        // })

    })

    if(type=="Update Data" ){
        
        // checking changed record
        Object.keys(data).forEach(function(block){
            if(data[block]["blockType"]=="datagrid"){
                data[block]['data'].forEach(function(newRecord){
                    let allPKinForm = getAllPKinForm()
                    let oldRecord = getRecordForCompare(block,newRecord['id'])
                    
                    if(oldRecord!=undefined){
                        Object.keys(oldRecord).forEach(function(idOld){
                            if(oldRecord[idOld]==null){
                                oldRecord[idOld]=""
                            }
                        })
        
                        let notIdPK = []
                        // compared 2 dictionary (old with new)
                        Object.keys(newRecord).every(function(idNew){
                            if(newRecord[idNew]!=oldRecord[idNew]){
                                if(newRecord[idNew]!=null){
                                    notIdPK.push(idNew)
                                }else{
                                    delete newRecord[idNew]
                                }
                            }else{
                                if(!allPKinForm.includes(idNew) && idNew!='id'){
                                    delete newRecord[idNew]
                                }
                            }
                            return true
                        })
        
                        // cek apakah ada value berubah selain idPK
                        if(notIdPK.length!=0){
                            // jika ada data selain idPK yang berubah maka akan push ke datachanged
                            // window.winDataChanged.push(newChangedRecord)
                        }else{
                            // jika tidak ada data selain idPK yang berubah maka akan hapus record di datachanged
                            let indx = data[block]["data"].findIndex(record => record.id === newRecord['id']);
                            if(indx!=-1){
                                data[block]["data"].splice(indx,1)
                            }
        
                            let indxDatachanged = window.winDataChanged[block].findIndex(record1 => record1.id === newRecord['id']);
                            if(indxDatachanged!=-1){
                                window.winDataChanged[block].splice(indxDatachanged,1)
                            }
                        }
                    }
                })    
            }
        })

        Object.keys(data).forEach(function(block){
            if(data[block]["blockType"]=="datagrid"){
                data[block]['data'].forEach(function(newRecord){
                    let allPKinForm = getAllPKinForm()
                    let oldRecord = getRecordForCompare(block,newRecord['id'])
                    
                    if(oldRecord!=undefined){
                        Object.keys(oldRecord).forEach(function(idOld){
                            if(!winDateType.includes(idOld) || !winDateTypeMMYY.includes(idOld) || !winDateTypeYY.includes(idOld) || !winTimestampType.includes(idOld) || !winClockType.includes(idOld)){
                                if(oldRecord[idOld]==null){
                                    oldRecord[idOld]=""
                                }
                            }else{
                                if(oldRecord[idOld]==""){
                                    oldRecord[idOld]=null
                                }
                            }
                        })
                        let notIdPK = []
                        // compared 2 dictionary (old with new)
                        Object.keys(newRecord).every(function(idNew){
                            if(newRecord[idNew]!=oldRecord[idNew]){
                                if(newRecord[idNew]!=null){
                                    notIdPK.push(idNew)
                                }else{
                                    delete newRecord[idNew]
                                }
                            }else{
                                if(!allPKinForm.includes(idNew) && idNew!='id'){
                                    delete newRecord[idNew]
                                }
                            }
                            return true
                        })
        
                        // cek apakah ada value berubah selain idPK
                        if(notIdPK.length!=0){
                            // jika ada data selain idPK yang berubah maka akan push ke datachanged
                            // window.winDataChanged.push(newChangedRecord)
                        }else{
                            // jika tidak ada data selain idPK yang berubah maka akan hapus record di datachanged
                            let indx = data[block]["data"].findIndex(record => record.id === newRecord['id']);
                            if(indx!=-1){
                                data[block]["data"].splice(indx,1)
                            }
        
                            let indxDatachanged = window.winDataChanged[block].findIndex(record1 => record1.id === newRecord['id']);
                            if(indxDatachanged!=-1){
                                window.winDataChanged[block].splice(indxDatachanged,1)
                            }
                        }
                    }
                })
            }
        })

        // formating SUB_CHILD
        Object.keys(data).forEach(function(idBlock){
            if(winConfigForm[idBlock]["BLOCK_TYPE"][1]=="SUB_CHILD"){
                if(data[idBlock].data.length!=0){
                    if(data[winConfigForm[idBlock]["BLOCK_TYPE"][2]]==undefined){
                        data[winConfigForm[idBlock]["BLOCK_TYPE"][2]] = {
                            "blockType":winConfigForm[winConfigForm[idBlock]["BLOCK_TYPE"][2]]["BLOCK_TYPE"][0].toLowerCase(),
                            "data":[]
                        }
                    }
                    
                    data[idBlock].data.forEach(function(record){
                        if(data[winConfigForm[idBlock]["BLOCK_TYPE"][2]]['data'].length==0){
                            data[winConfigForm[idBlock]["BLOCK_TYPE"][2]]['data'] = [record]
                        }else{
                            
                            let newData = true
                            let recordUpdateActive
                            
                            let pkParentChild = winConfigForm[winConfigForm[idBlock]["BLOCK_TYPE"][2]]['PRIMARY_KEY']
                            let pkParentOld = []
                            data[winConfigForm[idBlock]["BLOCK_TYPE"][2]]['data'].forEach(function(oldRecord){
                                let listPKOld = []
                                pkParentChild.forEach(function(idPK){
                                    listPKOld.push(oldRecord[idPK])
                                })
                                pkParentOld.push(listPKOld)
                            })
                            function isSubarrayPresent(arrayOfArrays, subarray) {
                                return arrayOfArrays.some(arr => 
                                    arr.length === subarray.length && arr.every((value, index) => value === subarray[index])
                                );
                            }

                            function findSubarrayIndex(arrayOfArrays, subarray) {
                                return arrayOfArrays.findIndex(arr => 
                                    arr.length === subarray.length && arr.every((value, index) => value === subarray[index])
                                );
                            }

                            pkNew = []
                            pkParentChild.forEach(function(idPK){
                                pkNew.push(record[idPK])
                            })
                            if(isSubarrayPresent(pkParentOld, pkNew)){
                                let indexRecord = findSubarrayIndex(pkParentOld, pkNew);
                                recordUpdateActive = data[winConfigForm[idBlock]["BLOCK_TYPE"][2]]['data'][indexRecord]
                                newData = false
                            }
                            
                            if(newData){
                                data[winConfigForm[idBlock]["BLOCK_TYPE"][2]]['data'].push(record)
                            }else{
                                Object.keys(record).forEach(function(id){
                                    if(id!="id"){
                                    recordUpdateActive[id] = record[id]
                                    }
                                })
                            }
                        }
                    })
                    data[idBlock]['data'] = [] 
                }
            }
        })
    }
    if (type == "Insert Data") {
        // del data compare yg sama
        data = webix.copy(data)
        // console.log(1307,winDataCompare, Object.keys(winDataCompare).length)
        if(Object.keys(winDataCompare).length!=0){
            Object.keys(data).forEach(function(block){
                if(data[block]['blockType']=="form"){
                    if(Object.keys(winDataCompare[block]['data']).length!=0){
                        // console.log(1311)
                        if(data[block]['data'].length !=0){
                            let delId = []
                            Object.keys(data[block]['data'][0]).forEach(function(idItem){
                                if(data[block]['data'][idItem]==winDataCompare[block][idItem]){
                                    delId.push(idItem)
                                }
                            })
                            delId.forEach(function(idDel){
                                delete data[block]['data'][0][idDel]
                            })
                            if(Object.keys(data[block]['data'][0]).length == 0){
                                data[block]['data'].splice(0,1)
                            }
                        }
                    }else{
                        let delRecordData = true
                        winConfigForm[block]['ELEMENT'].every(function(idItemBlock){
                            if(data[block]["data"].length != 0){
                                if(data[block]['data'][0][idItemBlock]!=""){
                                    delRecordData = false
                                    return false
                                }   
                                return true
                            }
                            return true
                        })
                        if(delRecordData){
                            data[block]['data'] = []
                        }
                    }
                    
                }
                // else if(data[block]['blockType']=="datagrid"){
                //     Object.keys(data[block]['data']).forEach(function(record){
                //         Object.keys(record).forEach(function(idItem){
                //             if(data[block]['data'][idItem]==winDataCompare[block][idItem]){
                //                 delId.push(idItem)
                //             }
                //         })
                        
                //     })
                // }
            })
        }
    }
    
    // formating SUB_PARENT
    Object.keys(data).forEach(function(idBlock){
        if(winConfigForm[idBlock]["BLOCK_TYPE"][1]=="SUB_PARENT"){
            if(data[idBlock].data.length!=0){
                if(data[getBlockParent()]==undefined){
                    data[getBlockParent()] = {
                        "blockType":winConfigForm[getBlockParent()]["BLOCK_TYPE"][0].toLowerCase(),
                        "data":[]
                    }
                }
    
                if(data[getBlockParent()]['data'].length==0){
                    let newRecord = {}
                    Object.keys(data[idBlock]['data'][0]).forEach(function(idRecord){
                        newRecord[idRecord] = data[idBlock]['data'][0][idRecord]
                    })
                    data[getBlockParent()]['data'] = [newRecord]
                    data[idBlock]['data'] = []  
                }else{
                    Object.keys(data[idBlock]['data'][0]).forEach(function(idRecord){

                        data[getBlockParent()]['data'][0][idRecord] = data[idBlock]['data'][0][idRecord]
                    })
                    data[idBlock]['data'] = []  
                }
            }
        }
    })

    // formating SUB_CHILD
    Object.keys(data).forEach(function (idBlock) {
        if (winConfigForm[idBlock]["BLOCK_TYPE"][1] == "SUB_CHILD") {
            if (data[idBlock].data.length != 0) {
                if (data[winConfigForm[idBlock]["BLOCK_TYPE"][2]] == undefined) {
                    data[winConfigForm[idBlock]["BLOCK_TYPE"][2]] = {
                        "blockType": winConfigForm[winConfigForm[idBlock]["BLOCK_TYPE"][2]]["BLOCK_TYPE"][0].toLowerCase(),
                        "data": []
                    }
                }
                if (data[winConfigForm[idBlock]["BLOCK_TYPE"][2]]['data'].length == 0) {
                    let newRecord = {}
                    Object.keys(data[idBlock]['data'][0]).forEach(function (idRecord) {
                        newRecord[idRecord] = data[idBlock]['data'][0][idRecord]
                    })
                    data[winConfigForm[idBlock]["BLOCK_TYPE"][2]]['data'] = [newRecord]
                    data[idBlock]['data'] = []
                } else {
                    data[idBlock]['data'].forEach(function (idRecord, index) {
                        Object.keys(idRecord).forEach(function (itemId) {
                            data[winConfigForm[idBlock]["BLOCK_TYPE"][2]]['data'][index][itemId] = data[idBlock]['data'][index][itemId]
                        })        
                    })
                    data[idBlock]['data'] = []
                }
            }
        }
    })
    let deleteBlock = []
    Object.keys(data).forEach(function(block){
        if(data[block]['data'].length==0){
            deleteBlock.push(block)
        }
    })
    deleteBlock.forEach(function(idBlockDelete){
        delete data[idBlockDelete]
    })

    Object.keys(data).forEach(function(block){
        if(data[block]['blockType']=="datagrid"){
            data[block]["idChanged"] = []
            data[block]["data"].forEach(function(record){
                data[block]["idChanged"].push(record['id'])
            })
        }
    })

    // del ID in cols dt
    Object.keys(data).forEach(function(block){
        if(data[block]['data'].length!=0){
            data[block]['data'].forEach(function(record){
                if(record['id']){
                    delete record['id']
                }
            })
        }
    })

    // del ID button
    Object.keys(data).forEach(function(block){
        if(data[block]['blockType']=="form"){
            data[block]['data'].forEach(function(record){
                let idButton = []
                Object.keys(record).forEach(function(idElement){
                    if($$(idElement)!=undefined){
                        if($$(idElement).config.view=="button"){
                            if(!idButton.includes(idElement)){
                                idButton.push(idElement)
                            }
                        }
                    }
                })
                idButton.forEach(function(idButton){
                    delete record[idButton]
                })
            })
        }
    })

    Object.keys(data).forEach(function(block){
        data[block]['data'].forEach(function(record){
            Object.keys(record).forEach(function(id){
                if(record[id]===""){
                    record[id]= null
                }
            })
        })
    })

    return data
}

function deleteIdDataNotBasetable(data){
    let dataNow = webix.copy(data)
    Object.keys(dataNow).forEach(function(block){
        dataNow[block]['data'].forEach(function(record){
            Object.keys(record).forEach(function(id){
                let statusNotBasetable = true

                Object.keys(winConfigForm).every(function(blockId){
                    if(winConfigForm[blockId]['ELEMENT'].includes(id)){
                        statusNotBasetable = false
                        return false
                    }
                    return true
                })
                if(statusNotBasetable==true){
                    delete record[id]
                }
            })
        })
    })
    return dataNow
}
function isDifferent(record, data) {
    for (let key in data) {
        if (key !== "id" && record[key] !== data[key]) {
            return true;
        }
    }
    return false;
}

function deleteDataNotChange(data){
/*  
Digunakan untuk delete item yang datanya tidak berubah

Param :
    data   : dictionary data value dari seluruh block

Return Value : 1 dictionary data
*/
    data = webix.copy(data)
    let deleteBlockEmpty = []
    Object.keys(data).forEach(function(block){
        if(data[block]['blockType']=="form"){
            if(Object.keys(winDataCompare[block]['data']).length!=0){
                let delId = []
                Object.keys(data[block]['data'][0]).forEach(function(idItem){
                    if(data[block]['data'][idItem]==winDataCompare[block][idItem]){
                        delId.push(idItem)
                    }
                })
                delId.forEach(function(idDel){
                    delete data[block]['data'][0][idDel]
                })
                if(Object.keys(data[block]['data'][0]).length == 0){
                    data[block]['data'].splice(0,1)
                }
            }
        }else{
            let deleteIndexData = []
            data[block]['data'].forEach(function(record, index){
                let dictIdPK = {}
                let idPK = winConfigForm[block]['PRIMARY_KEY']
                idPK.forEach(function(idPK){
                    dictIdPK[idPK] = record[idPK]
                })
                let idPKParent = winConfigForm[getBlockParent()]['PRIMARY_KEY']
                idPKParent.forEach(function(idPK){
                    dictIdPK[idPK] = getItemValue(idPK)
                })

                let recordCompare = winDataDtSelect[block].find(item =>
                    Object.keys(dictIdPK).every(key => item[key] === dictIdPK[key])
                );

                //console.log("windatadtselect",recordCompare)
                //console.log("data", record)


                if(isDifferent(record, recordCompare)==false){
                    deleteIndexData.push(index)
                }
            })
            //console.log(2298, deleteIndexData)
            deleteIndexData.forEach(function(indexData){
                delete data[block]['data'][indexData]
                delete data[block]['idChanged'][indexData]
            })

            //console.log(webix.copy(data[block]['data']))
            //console.log(data[block]['data'].length, block)
            if(webix.copy(data[block]['data']).length==0){
                deleteBlockEmpty.push(block)
            }
            
        }
    })
    deleteBlockEmpty.forEach(function(blockName){
        delete data[blockName]
    })
    return data
}

function formatParamAjax(data,method){
/*  
Digunakan untuk filter method data sebelum ke checking Format

Param :
    data   : dictionary data value dari seluruh block

Return Value : 1 dictionary data yang akan dikirim melalui API
*/
    if (method=="Search Data"){
        data = data
        window.winCountOffsetRecord[winActiveBlock.focusNow] = 0;
        if (winThereIsSubChild) {
            if ( winConfigForm[winActiveBlock['focusNow']]["BLOCK_TYPE"][2] != undefined) {
                let parent = winConfigForm[winActiveBlock.focusNow]["BLOCK_TYPE"][2]  
                data = checkingFormat(data,method)[parent]['data'][0]
            }else{
                data = checkingFormat(data,method)[winActiveBlock.focusNow]['data'][0]
            }
        }else{
            if(winConfigForm[winActiveBlock.focusNow]['BLOCK_TYPE'][1]=="SUB_PARENT"){
                data = checkingFormat(data,method)[getBlockParent()]['data'][0]
            }else{
                data = checkingFormat(data,method)[winActiveBlock.focusNow]['data'][0]
            }
        }
        Object.keys(data).forEach(function(key){
            if(data[key]=="" || data[key]== null){
                delete(data[key])
            }
        })
        currentValue = data
        return data
    }else if(method=="Insert Data"){
        data = checkingFormat(data,method)
        // data = deleteBlockDataNotBasetable(data)
        data = deleteIdDataNotBasetable(data)
        // data = deleteDataNotChange(data)
        return data
    }else if(method=="Update Data"){
        data = checkingFormat(data,method)
        // data = deleteBlockDataNotBasetable(data)
        data = deleteIdDataNotBasetable(data)
        // data = deleteDataNotChange(data)

        return data
    }else if(method=="Delete Data"){
        data = checkingFormat(data,method)
        return data
    }else if(method=="Print Data"){
        data = checkingFormat(data,method)
        // data = deleteBlockDataNotBasetable(data)
        // data = deleteIdDataNotBasetable(data)

        return data
    }else if(method=="Validation"){
        data = checkingFormat(data,method)[winActiveBlock.focusNow]['data'][0]
        Object.keys(data).forEach(function(key){
            if(data[key]=="" || data[key]== null){
                delete(data[key])
            }
        })
        currentValue = data
        return data
    }
}

function getParentViewCustom(id){
    /*  
    Digunakan untuk mendapatkan object parent
    
    Param :
        id   : id block yang akan dicari parent objectnya
    
    Return Value : 1 object / dictionary parent
    */
    let parentId
    let checkParent = $$(id).getParentView()
    let checkParentId = $$(id).getParentView().config.id
    if(checkParent.config.type=="form"||checkParent.config.type=="datagrid"){
        parentId = checkParent.config.id
    }else{
        if(checkParentId == checkParentId.match(/^\$layout.*$/)){
            while($$(checkParentId).config.view!="form" && $$(checkParentId).config.view!="datatable"){
                checkParentId = $$(checkParentId).getParentView().config.id
            }
            parentId = checkParentId
        }
    }

    return parentId
}

function visibleColLov(id,status){
    if(status=="show"){
        $$($$(id).getParentView().config.id).show()
        $$($$(id).getParentView().config.id).config.kumpulanId.forEach(function(idShow){
            $$(idShow).show()
        })
    }else if(status=="hide"){
        $$($$(id).getParentView().config.id).hide()
        $$($$(id).getParentView().config.id).config.kumpulanId.forEach(function(idHide){
            $$(idHide).hide()
        })
    }
}

function addDataRecordDt(param){
    console.log("ADD DATA RECORD DT");
    
    // {"BLOCK":"CB_ASS_KARY_DET_DUA","DATA":record, "TRANSACTION":true}
    if(param.BLOCK==undefined){
        let allRecordDt = getBlockValue(window.winActiveBlock['focusNow'])
        let delNewNullRecordsId = []
        allRecordDt.forEach(function(recordDt){
            if(Object.keys(recordDt).length==1){
                delNewNullRecordsId.push(recordDt.id)
            }else{
                let delEmptyRecord = []
                Object.keys(recordDt).forEach(function(id){
                    if(recordDt[id]=="" || recordDt[id]==null || recordDt[id]==undefined){
                        delEmptyRecord.push(id)
                    }
                })
                if(delEmptyRecord.length == Object.keys(recordDt).length-1){
                    delNewNullRecordsId.push(recordDt.id)
                }
            }
        })
        $$(window.winActiveBlock['focusNow']).remove(delNewNullRecordsId);
        // $$(window.winActiveBlock['focusNow']).add(param["DATA"],$$("pager_"+window.winActiveBlock['focusNow'])['data']['old_count'])
        $$(window.winActiveBlock['focusNow']).parse(param["DATA"])
        // webix.UIManager.setFocus(winActiveBlock['focusNow'])

        let blocks = Object.keys(winConfigForm)
        let indexObj = blocks.indexOf(param.BLOCK)
        for(let a=0; a<=indexObj; a++){
            if (winConfigForm[blocks[a]]['BASE_TABLE'] == undefined){
                winConfigForm[blocks[a]]['BASE_TABLE'] = true
            }
            if(winConfigForm[blocks[a]]['BLOCK_TYPE'][0]=="FORM" && winConfigForm[blocks[a]]['BASE_TABLE']){
                winConfigForm[blocks[a]]["PRIMARY_KEY"].forEach(function(id){
                    let item = $$(id).config
                    param["DATA"][id] = $$(id).getValue()
                    if (window.winDateType.includes(id) || window.winDateTypeMMYY.includes(id)){
                        if(param["DATA"][id].length != item.attributes.maxLength){
                            param["DATA"][id] = param["DATA"][id].split("-").reverse().join("-");
                            param["DATA"][id] = param["DATA"][id].substring(param["DATA"][id].length-item.attributes.maxLength)
                            if(window.winDateTypeMMYY.includes(id)){
                                param["DATA"][id]=param["DATA"][id]+"-01"
                            }
                        }
                        if(param["DATA"][id].length==item.attributes.maxLength && param["DATA"][id].split("-").length>1 && param["DATA"][id].split("-")[0].length==4){
                            param["DATA"][id] = param["DATA"][id].split("-").reverse().join("-");
                        } 
                    }else if(window.winDateTypeYY.includes(id)){
                        param["DATA"][id]=param["DATA"][id]+"-01-01"
                    }
                })
            }
        }
        if(param.TRANSACTION==undefined || param.TRANSACTION == true){
            winDataChanged[winActiveBlock.focusNow].push(param["DATA"])
        }
        let row_id
        
        if(param.FOCUS=="first"){ 
            row_id = $$(window.winActiveBlock['focusNow']).getFirstId();
            $$(window.winActiveBlock['focusNow']).setPage(0);
            $$(window.winActiveBlock['focusNow']).select(row_id,$$(window.winActiveBlock['focusNow'])['config']['columns'][0]['id'], false)
        }else if(param.FOCUS=="last"){
            row_id = $$(window.winActiveBlock['focusNow']).getLastId();
            $$(window.winActiveBlock['focusNow']).setPage($$("pager_"+window.winActiveBlock['focusNow'])['data']['limit']);
            $$(window.winActiveBlock['focusNow']).select(row_id,$$(window.winActiveBlock['focusNow'])['config']['columns'][0]['id'], false)
        }
        
    }else{
        let allRecordDt = getBlockValue(param.BLOCK)
        // console.log(1408,allRecordDt)
        let delNewNullRecordsId = []
        allRecordDt.forEach(function(recordDt){
            if(Object.keys(recordDt).length==1){
                delNewNullRecordsId.push(recordDt.id)
            }else{
                let delEmptyRecord = []
                Object.keys(recordDt).forEach(function(id){
                    if(recordDt[id]=="" || recordDt[id]==null || recordDt[id]==undefined){
                        delEmptyRecord.push(id)
                    }
                })
                if(delEmptyRecord.length == Object.keys(recordDt).length-1){
                    delNewNullRecordsId.push(recordDt.id)
                }
            }
        })
        $$(param.BLOCK).remove(delNewNullRecordsId);
        // $$(param.BLOCK).add(param["DATA"],$$("pager_"+param.BLOCK)['data']['old_count'])
        $$(param.BLOCK).parse(param["DATA"])
        // $$(param.BLOCK).setPage($$("pager_"+param.BLOCK)['data']['limit']);
        let blocks = Object.keys(winConfigForm)
        let indexObj = blocks.indexOf(param.BLOCK)
        for(let a=0; a<=indexObj; a++){
            if (winConfigForm[blocks[a]]['BASE_TABLE'] == undefined){
                winConfigForm[blocks[a]]['BASE_TABLE'] = true
            }
            if(winConfigForm[blocks[a]]['BLOCK_TYPE'][0]=="FORM" && winConfigForm[blocks[a]]['BASE_TABLE']){
                winConfigForm[blocks[a]]["PRIMARY_KEY"].forEach(function(id){
                    let item = $$(id).config
                    param["DATA"][id] = $$(id).getValue()
                    if (window.winDateType.includes(id) || window.winDateTypeMMYY.includes(id)){
                        if(param["DATA"][id].length != item.attributes.maxLength){
                            param["DATA"][id] = param["DATA"][id].split("-").reverse().join("-");
                            param["DATA"][id] = param["DATA"][id].substring(param["DATA"][id].length-item.attributes.maxLength)
                            if(window.winDateTypeMMYY.includes(id)){
                                param["DATA"][id]=param["DATA"][id]+"-01"
                            }
                        }
                        if(param["DATA"][id].length==item.attributes.maxLength && param["DATA"][id].split("-").length>1 && param["DATA"][id].split("-")[0].length==4){
                            param["DATA"][id] = param["DATA"][id].split("-").reverse().join("-");
                        } 
                    }else if(window.winDateTypeYY.includes(id)){
                        param["DATA"][id]=param["DATA"][id]+"-01-01"
                    }
                })
            }
        }
         if (isGridToGrid) {
            if (winConfigForm[param.BLOCK]['BASE_TABLE'] == undefined){
                winConfigForm[param.BLOCK]['BASE_TABLE'] = true
            }
            if(winConfigForm[param.BLOCK]['BLOCK_TYPE'][0]=="DATAGRID" && winConfigForm[param.BLOCK]['BASE_TABLE']){
                winConfigForm[param.BLOCK]["RELATION_KEY"].forEach(function(id){
                    param["DATA"][id] = getItemValue(id)
                })
            }
        }
        if(param.TRANSACTION==undefined || param.TRANSACTION == true){
            winDataChanged[param.BLOCK].push(param["DATA"])
        }
        
        if($$(param.BLOCK).config.customOperator!=undefined){
            //updateOperatorCustomDt($$(param.BLOCK).config.customOperator);
            updateFooterDatagrid(param.BLOCK)
        }

        // webix.UIManager.setFocus(winActiveBlock['focusNow'])
        console.log(2725,winActiveBlock);
        let row_id
        if(param.FOCUS=="first"){
            row_id = $$(param.BLOCK).getFirstId();
            $$(param.BLOCK).setPage(0);
            // $$(param.BLOCK).unselectAll();
            // webix.UIManager.setFocus($$(param.BLOCK));
            $$(param.BLOCK).select(row_id,$$(param.BLOCK)['config']['columns'][0]['id'], false)
        }else if(param.FOCUS=="last"){
            console.log(2817,winActiveBlock);

            row_id = $$(param.BLOCK).getLastId();
            // $$(param.BLOCK).unselectAll();
            // webix.UIManager.setFocus($$(param.BLOCK));
            $$(param.BLOCK).setPage($$("pager_"+param.BLOCK)['data']['limit']);
            $$(param.BLOCK).select(row_id,$$(param.BLOCK)['config']['columns'][0]['id'], false)
            console.log(2824,winActiveBlock);

        }
        
    }
}

function checkAllDt(param){
    if($$(param.BLOCK_ID).getColumnConfig(param.COLUMN_ID).jenis=="checkBox"){
        let allRecords = $$(param.BLOCK_ID).serialize()
        let page = $$(param.BLOCK_ID).getPage()
        let beginData = page*10
        let lastData = beginData+9
        if(lastData>allRecords.length-1){
            lastData = lastData-1
        }
        if(winConfigForm[param.BLOCK_ID] != undefined){
            if(winConfigForm[param.BLOCK_ID].DATA_PER_PAGE != undefined){
                beginData = page*winConfigForm[param.BLOCK_ID].DATA_PER_PAGE
                lastData = beginData+winConfigForm[param.BLOCK_ID].DATA_PER_PAGE-1
            }
        }

        if (winAddData) {
            let allRecordExist = winDataDtSelect[param.BLOCK_ID]
            let newRecord = []
            let tampunganAllId = []

            allRecordExist.forEach(recordNew => {
                tampunganAllId.push(recordNew.id)
            });
            allRecords.forEach(function (record) {
                if (!tampunganAllId.includes(record["id"])) {
                    newRecord.push(record)
                }
            })
            newRecord.forEach(function(record){
                if(allRecords.indexOf(record)>=beginData && allRecords.indexOf(record)<=lastData){
                    record[param.COLUMN_ID] = $$(param.BLOCK_ID).getColumnConfig(param.COLUMN_ID).checkValue
                    checkToDatachanged({rowId:record.id, columnId:param.COLUMN_ID, dataRow:record})
                    $$(param.BLOCK_ID).refresh()
                }
            })
        }else{
            allRecords.forEach(function(record){
                if(allRecords.indexOf(record)>=beginData && allRecords.indexOf(record)<=lastData){
                    record[param.COLUMN_ID] = $$(param.BLOCK_ID).getColumnConfig(param.COLUMN_ID).checkValue
                    checkToDatachanged({rowId:record.id, columnId:param.COLUMN_ID, dataRow:record})
                    $$(param.BLOCK_ID).refresh()
                }
            })
        }
    }else{
        RMSGBOX(param.COLUMN_ID+"<br>IS NOT CHECKBOX")
    }
}

function uncheckAllDt(param){
    if($$(param.BLOCK_ID).getColumnConfig(param.COLUMN_ID).jenis=="checkBox"){
        let allRecords = $$(param.BLOCK_ID).serialize()
        let page = $$(param.BLOCK_ID).getPage()
        let beginData = page*10
        let lastData = beginData+9
        if(winConfigForm[param.BLOCK_ID] != undefined){
            if(winConfigForm[param.BLOCK_ID].DATA_PER_PAGE != undefined){
                beginData = page*winConfigForm[param.BLOCK_ID].DATA_PER_PAGE
                lastData = beginData+winConfigForm[param.BLOCK_ID].DATA_PER_PAGE-1
            }
        }

        if(lastData>allRecords.length-1){
            lastData = lastData-1
        }

        if (winAddData) {
            let allRecordExist = winDataDtSelect[param.BLOCK_ID]
            let newRecord = []
            let tampunganAllId = []

            allRecordExist.forEach(recordNew => {
                tampunganAllId.push(recordNew.id)
            });
            allRecords.forEach(function (record) {
                if (!tampunganAllId.includes(record["id"])) {
                    newRecord.push(record)
                }
            })
            newRecord.forEach(function(record){
                if(allRecords.indexOf(record)>=beginData && allRecords.indexOf(record)<=lastData){
                    record[param.COLUMN_ID] = $$(param.BLOCK_ID).getColumnConfig(param.COLUMN_ID).uncheckValue
                    checkToDatachanged({rowId:record.id, columnId:param.COLUMN_ID, dataRow:record})
                    $$(param.BLOCK_ID).refresh()
                }
            })
        }else{
            allRecords.forEach(function(record){
                if(allRecords.indexOf(record)>=beginData && allRecords.indexOf(record)<=lastData){
                    record[param.COLUMN_ID] = $$(param.BLOCK_ID).getColumnConfig(param.COLUMN_ID).uncheckValue
                    checkToDatachanged({rowId:record.id, columnId:param.COLUMN_ID, dataRow:record})
                    $$(param.BLOCK_ID).refresh()
                }
            })
        }
    }else{
        RMSGBOX(param.COLUMN_ID+"<br>IS NOT CHECKBOX")
    }
}

function saveInsertData(param){
    if(param){
        let statusValidate = true;
        let errorBlock = [];
        param.BLOCKS.every(function(block){
            if(!$$(block).validate()){
                statusValidate = false;
                errorBlock.push(block)
                return false
            }
            return true
        })
        if(errorBlock.length==0 && statusValidate==true){
            let valuesData = {}
            param.BLOCKS.forEach(function(block){
                if (winConfigForm[block]['BASE_TABLE'] == undefined){
                    winConfigForm[block]['BASE_TABLE'] = true
                }
                if(winConfigForm[block]['BASE_TABLE']){
                    if($$(block).config.view=="form"){
                        let valuesForm = ""
                        if(blocks.length==1){
                            valuesForm = $$(block).getValues()
                        }else if(blocks.length>1){
                            if(window.winJenisAddValue=="PARENT"){
                                valuesForm = $$(block).getValues()
                            }else if(window.winJenisAddValue=="CHILD"){
                                valuesForm = null
                            }
                        }

                        if (valuesForm == null){
                            valuesForm = []
                        }else{
                            
                            if(insertType!="master"){
                                valuesForm = []
                            }else{
                                valuesForm = [valuesForm]
                            }   
                        }
                        
                        valuesData[block] = {}
                        valuesData[block]['blockType'] = "form"
                        valuesData[block]['data'] = valuesForm
                    }else if($$(block).config.view=="datatable"){
                        valuesData[block] = {}
                        valuesData[block]['blockType'] = "datagrid"
                        valuesData[block]['data'] = webix.copy(winDataChanged[block])
                    }
                }
            })
            let insertBlock = formatParamAjax(valuesData,"Insert Data")
            if(Object.keys(insertBlock)!=0){
                restapi.restApiSubmit({'type':'INSERT','menuId':menuId,'data':insertBlock},"Insert Data")
            }else{
                if(!isWebixPopupOpen()){
                    webix.alert(ALERT.ALERTWARNING("No records to insert")).then(function(){
                        $$(window.menuId).enable();
                        // $$(window.menuId).showProgress({type:"icon",hide:true});
                    })
                }
            }
        }else{
            let idBlock = errorBlock[0]
            setFocusAfterValidate(idBlock)
            
        }
    }else{
        if(!isWebixPopupOpen()){
            webix.alert(ALERT.ALERTWARNING("Function needs parameter"))
        }
    }
}

function saveUpdateData(param){
    if(param){
        let statusValidate = true;
        let errorBlock = [];
        param.BLOCKS.every(function(block){
            if(!$$(block).validate()){
                statusValidate = false;
                errorBlock.push(block)
                return false
            }
            return true
        })
        if(errorBlock.length==0 && statusValidate==true){
            let valuesData = {}
            param.BLOCKS.forEach(function(block){
                if (winConfigForm[block]['BASE_TABLE'] == undefined){
                    winConfigForm[block]['BASE_TABLE'] = true
                }
                if(winConfigForm[block]['BASE_TABLE']){
                    if($$(block).config.view=="form"){
                        let changedForm = {}
                        let valuesForm = $$(block).getValues()    
                        winConfigForm[block]["PRIMARY_KEY"].forEach(function (item) {
                            valuesForm[item] = $$(item).getValue()
                        });
                        changedForm[block] = {}
                        changedForm[block]["datachanged"]
                        Object.keys(window.winDataCompare).forEach(function(blockCompare){
                            let listIdChanged = []
                            Object.keys(window.winDataCompare[blockCompare]["data"]).forEach(function(idItem){
                                if(window.winDataCompare[blockCompare]["data"][idItem]!=valuesForm[idItem]){
                                    // if($$(idItem).config.jenis!="display"){
                                    listIdChanged.push(idItem)
                                    // }
                                }else{
                                    delete valuesForm[idItem]
                                }
                            })
                            changedForm[block] = {}
                            changedForm[block]["datachanged"]=listIdChanged
                            
                        })
                        if(changedForm[block]["datachanged"].length!=0){
                            winConfigForm[block]["PRIMARY_KEY"].forEach(function (item) {
                                valuesForm[item] = $$(item).getValue()
                            });
                            valuesForm = [valuesForm]
                        }else{
                            valuesForm = []
                        }
                        valuesData[block] = {}
                        valuesData[block]['blockType'] = "form"
                        valuesData[block]['data'] = valuesForm
                    }else if($$(block).config.view=="datatable"){
                        valuesData[block] = {}
                        valuesData[block]['blockType'] = "datagrid"
                        valuesData[block]['data'] = webix.copy(winDataChanged[block])

                        // winDataChanged.forEach(function(record){
                        //     let blockPK = []
                        //     Object.keys(record).forEach(function(idKey){
                        //         if(idKey!='id'){
                        //             if(winConfigForm[block]['PRIMARY_KEY'].includes(idKey)){
                        //                 blockPK.push(idKey)
                        //             }
                        //         }
                        //     })
                        //     if(blockPK.length==winConfigForm[block]['PRIMARY_KEY'].length){
                        //         valuesData[block]['data'].push(webix.copy(record))
                        //     }
                        // })
                    }
                }
                
            })
            let statusUpdateData = false
            Object.keys(valuesData).forEach(function(block){
                if(valuesData[block].data.length>0){
                    statusUpdateData = true
                }
            })
            if(statusUpdateData){
                let updatedBlock = formatParamAjax(valuesData,"Update Data")
                if(Object.keys(updatedBlock)!=0){
                    restapi.restApiSubmit({'type':'UPDATE','menuId':menuId,'data':updatedBlock},"Update Data")
                }else{
                    if(!isWebixPopupOpen()){
                        webix.alert(ALERT.ALERTWARNING("No data has changed")).then(function(){
                            $$(window.menuId).enable();
                            // $$(window.menuId).showProgress({type:"icon",hide:true});
                        })
                    }
                }
                
            }else{
                if(!isWebixPopupOpen()){
                    webix.alert(ALERT.ALERTWARNING("No data has changed")).then(function(){
                        $$(window.menuId).enable();
                        // $$(window.menuId).showProgress({type:"icon",hide:true});
                    })
                }
            }
            
        }else{
            let idBlock = errorBlock[0]
            setFocusAfterValidate(idBlock)
        }
    }else{
        if(!isWebixPopupOpen()){
            webix.alert(ALERT.ALERTWARNING("Function needs parameter"))
        }
    }
}

function checkGoBlockGoItem(goBlock, goItem){
    if(goBlock!=undefined){
        if(typeof(goBlock)=="function"){
            let goBlockId = goBlock()
            GO_BLOCK(goBlockId)
        }else if(typeof(goBlock)=="string"){
            GO_BLOCK(goBlock)
        }
    }
    if(goItem!=undefined){
        if(typeof(goItem)=="function"){
            let goItemId = goItem()
            GO_ITEM(goItemId)
        }else if(typeof(goItem)=="string"){
            GO_ITEM(goItem)
        }
    }
}

function deleteChecklistData(param){
    let dataThisBlock = webix.copy(winDataChanged[param.BLOCK_ID])
    let dataAfterCheck = []

    dataThisBlock.forEach(function(record){
        let status = true
        Object.keys(param.PARAM_CHECK).every(function(idCheck){
            if(record[idCheck]!=param.PARAM_CHECK[idCheck]){
                status = false
                return false
            }
            return true
        })

        if(status){
            let PKAll = getAllPKinForm()
            let pkDelData = {}
            PKAll.forEach(function(idPK){
                pkDelData[idPK] = record[idPK]
            })
            pkDelData['id'] = record['id'] 
            dataAfterCheck.push(pkDelData)
        }
    })

    webix.confirm({
        title:"Konfirmasi Hapus Data",
        text:"Delete Data",
        cancel:"Batal",
        type:"alert-warning"
    }).then(function(result){
        if(result){
            // some action when the alert window is closed
            let blocks = Object.keys(winConfigForm)
            let valuesData = {}
            blocks.forEach(function(block){
                if($$(block).config.view=='form'){
                    valuesData[block] = {}
                    valuesData[block]['blockType'] = "form"
                    valuesData[block]['data'] = []
                }else{
                    
                    valuesData[block] = {}
                    valuesData[block]['blockType'] = "datagrid"
                    valuesData[block]['data'] = []
                }
            })
            valuesData[param.BLOCK_ID]['data'] = dataAfterCheck
            restapi.restApiSubmit({'type':'DELETE','menuId':menuId,'data':formatParamAjax(valuesData,"Delete Data")},"Delete Data")
        }
    });
}

function getAllChecklistData(param){
    let dataThisBlock = webix.copy(winDataChanged[param.BLOCK_ID])
    let dataAfterCheck = []

    dataThisBlock.forEach(function(record){
        let status = true
        Object.keys(param.PARAM_CHECK).every(function(idCheck){
            if(record[idCheck]!=param.PARAM_CHECK[idCheck]){
                status = false
                return false
            }
            return true
        })

        if(status){
            if(param.OUTPUT==undefined){
                dataAfterCheck.push(record)
            }else{
                if(param.OUTPUT=="PK"){
                    let PKAll = getAllPKinForm()
                    let pkData = {}
                    PKAll.forEach(function(idPK){
                        pkData[idPK] = record[idPK]
                    })
                    pkData['id'] = record['id'] 
                    dataAfterCheck.push(pkData)
                }else if(param.OUTPUT=="RECORD"){
                    dataAfterCheck.push(record)
                }
            }
        }
    })

    let blocks = Object.keys(winConfigForm)
    let valuesData = {}
    blocks.forEach(function(block){
        if($$(block).config.view=='form'){
            valuesData[block] = {}
            valuesData[block]['blockType'] = "form"
            valuesData[block]['data'] = []
        }else{
            
            valuesData[block] = {}
            valuesData[block]['blockType'] = "datagrid"
            valuesData[block]['data'] = []
        }
    })
    valuesData[param.BLOCK_ID]['data'] = dataAfterCheck
    return valuesData
}

function callBack(menuId){
    if(window.winOpenPopUp=="closed"){
        let blocks = Object.keys(winConfigForm)
        let statusValidate = true;
        let errorBlock = [];
        blocks.every(function(block){
            if(!$$(block).validate()){
                statusValidate = false;
                errorBlock.push(block)
                return false
            }
            return true
        })
        if(errorBlock.length==0 && statusValidate==true){
            let valuesData = {}
            blocks.forEach(function(block){
                if (winConfigForm[block]['BASE_TABLE'] == undefined){
                    winConfigForm[block]['BASE_TABLE'] = true
                }
                if(winConfigForm[block]['BASE_TABLE']){
                    if($$(block).config.view=="form"){
                        let changedForm = {}
                        let valuesForm = getBlockValue(block)    
                        winConfigForm[block]["PRIMARY_KEY"].forEach(function (item) {
                            valuesForm[item] = $$(item).getValue()
                        });
                        winConfigForm[block]["RELATION_KEY"].forEach(function (item) {
                            valuesForm[item] = $$(item).getValue()
                        });

                        let listIdChanged = []
                        Object.keys(window.winDataCompare[block]["data"]).forEach(function(idItem){
                            
                            if(window.winDataCompare[block]["data"][idItem]!=valuesForm[idItem]){
                                if($$(idItem).config.jenis!="display"){
                                    listIdChanged.push(idItem)
                                }
                            }else{
                                delete valuesForm[idItem]
                            }
                            
                        })
                        changedForm[block] = {}
                        changedForm[block]["datachanged"]=listIdChanged

                        if(changedForm[block]["datachanged"].length!=0){
                            winConfigForm[block]["PRIMARY_KEY"].forEach(function (item) {
                                valuesForm[item] = $$(item).getValue()
                            });
                            valuesForm = [valuesForm]
                        }else{
                            valuesForm = []
                        }
                        valuesData[block] = {}
                        valuesData[block]['blockType'] = "form"
                        valuesData[block]['data'] = valuesForm
                    }else if($$(block).config.view=="datatable"){
                        valuesData[block] = {}
                        valuesData[block]['blockType'] = "datagrid"
                        valuesData[block]['data'] = webix.copy(winDataChanged[block])
                    }
                }
                
            })
            let statusUpdateData = false
            Object.keys(valuesData).forEach(function(block){
                if(valuesData[block].data.length>0){
                    statusUpdateData = true
                }
            })
            if(statusUpdateData){
                let updatedBlock = formatParamAjax(valuesData,"Update Data")
                if(Object.keys(updatedBlock)!=0){
                    webix.confirm({
                        title:"Switch Form Confirmation",
                        text:"Data has been changed, do you want to save and switch to last form?",
                        cancel:"Batal",
                        type:"alert-warning"
                    }).then(function(result){
                        if(result){
                            let resultUp = restapi.restApiSubmit({'type':'UPDATE','menuId':menuId,'data':updatedBlock},"Update Data")
                            resultUp.then(function(respond){
                                if(respond.status){
                                    return webix.send("/",{"type":"VIEW","menuId":menuId},"GET")
                                }else{
                                    return respond
                                }
                            })
                        }else{
                            $$(window.menuId).enable();
                        }
                    });
                }else{
                    $$(window.menuId).enable();
                    return webix.send("/",{"type":"VIEW","menuId":menuId},"GET")
                }
                
            }else{
                $$(window.menuId).enable();
                return webix.send("/",{"type":"VIEW","menuId":menuId},"GET")
            }
            
        }else{
            let idBlock = errorBlock[0]
            setFocusAfterValidate(idBlock)
        }
    }
}

function callForm(CALLFORM_ID){
    if(window.winOpenPopUp=="closed"){
        if(winAddData){
            webix.confirm({
                title:"Switch Form Confirmation",
                text: "Data has been changed, do you want to save and switch to last form?",
                cancel:"Batal",
                type:"alert-warning"
            }).then(function(result){   
                if(result){
                    winStatusCallForm = true
                    let promise = new Promise((resolve)=>{
                        $$("addValue").callEvent("onItemClick")
                    })
                    promise.then(function(respond){
                        return configCallForm(CALLFORM_ID)
                    })
                }
            })
        }else{
            let blocks = Object.keys(winConfigForm)
            let statusValidate = true;
            let errorBlock = [];
            blocks.every(function(block){
                if(!$$(block).validate()){
                    statusValidate = false;
                    errorBlock.push(block)
                    return false
                }
                return true
            })
            if(errorBlock.length==0 && statusValidate==true){
                let valuesData = {} 
                let isUpdateHidden = $$("updateValue").config.hidden
                if(!isUpdateHidden){
                    blocks.forEach(function(block){
                        if (winConfigForm[block]['BASE_TABLE'] == undefined){
                            winConfigForm[block]['BASE_TABLE'] = true
                        }
                        if(winConfigForm[block]['BASE_TABLE']){
                            if($$(block).config.view=="form"){
                                let changedForm = {}
                                let valuesForm = getBlockValue(block)
                                winConfigForm[block]["PRIMARY_KEY"].forEach(function (item) {
                                    valuesForm[item] = $$(item).getValue()
                                });
                                winConfigForm[block]["RELATION_KEY"].forEach(function (item) {
                                    valuesForm[item] = $$(item).getValue()
                                });
    
                                let listIdChanged = []
                                Object.keys(window.winDataCompare[block]["data"]).forEach(function(idItem){
                                    
                                    if(window.winDataCompare[block]["data"][idItem]!=valuesForm[idItem]){
                                        if($$(idItem).config.jenis!="display"){
                                            listIdChanged.push(idItem)
                                        }
                                    }else{
                                        delete valuesForm[idItem]
                                    }
                                    
                                })
                                changedForm[block] = {}
                                changedForm[block]["datachanged"]=listIdChanged
    
                                if(changedForm[block]["datachanged"].length!=0){
                                    winConfigForm[block]["PRIMARY_KEY"].forEach(function (item) {
                                        valuesForm[item] = $$(item).getValue()
                                    });
                                    valuesForm = [valuesForm]
                                }else{
                                    valuesForm = []
                                }
                                valuesData[block] = {}
                                valuesData[block]['blockType'] = "form"
                                valuesData[block]['data'] = valuesForm
                            }else if($$(block).config.view=="datatable"){
                                valuesData[block] = {}
                                valuesData[block]['blockType'] = "datagrid"
                                valuesData[block]['data'] = webix.copy(winDataChanged[block])
                            }
                        }
                        
                    })
                }
                let statusUpdateData = false
                Object.keys(valuesData).forEach(function(block){
                    // console.log(2197, webix.copy(valuesData[block]))   
                    if(valuesData[block].data.length>0){
                        statusUpdateData = true
                    }
                })
                if(window.openHTTPs != 0){
                    return webix.message({
                        text:"Please wait, <br> Your document is being loaded.",
                        type:"debug", 
                        expire: 800,
                    });
                }
                if(statusUpdateData && !isUpdateHidden){
                    let updatedBlock = formatParamAjax(valuesData,"Update Data")
                    if(Object.keys(updatedBlock)!=0){
                        webix.confirm({
                            title:"Switch Form Confirmation",
                            text:"Data has been changed, do you want to save and switch to last form?",
                            cancel:"Batal",
                            type:"alert-warning"
                        }).then(function(result){
                            if(result){
                                let resultUp = restapi.restApiSubmit({'type':'UPDATE','menuId':menuId,'data':updatedBlock},"Update Data")
                                resultUp.then(function(respond){
                                    if(respond.status){
                                        return configCallForm(CALLFORM_ID)
                                    }else{
                                        return respond
                                    }
                                })
                            }else{
                                $$(window.menuId).enable();
                            }
                        });
                    }else{
                        $$(window.menuId).enable();
                        return configCallForm(CALLFORM_ID)
                    }
                    
                }else{
                    $$(window.menuId).enable();
                    return configCallForm(CALLFORM_ID)
                }
                
            }else{
                let idBlock = errorBlock[0]
                setFocusAfterValidate(idBlock)
            }
        }
    }
}

function configCallForm(CALLFORM_ID){
    let callFormData = getCallFormData()
    let callBackData = getCallBackData()
    let blockName = winActiveBlock["focusNow"]
    if(winConfigForm[winActiveBlock["focusNow"]]["BLOCK_TYPE"][1] =="SUB_PARENT"){
        blockName = getBlockParent()
    }
    if(!winAddData){
        $$(menuId).showProgress()
        $$(menuId).disable()
        let dataCall = restapi.restApiCallForm({"DATA":{blockNameCallForm:blockName, callFormData:callFormData, blockNameCallBack:callBackData[1], callBackData:callBackData[0], callFormId:CALLFORM_ID}, "ITEM_ID":"callForm_"+CALLFORM_ID})
        dataCall.then(function(respond){
            if(respond.status){
                $$(menuId).hideProgress()
                return webix.send("/",{"type":"VIEW","menuId":CALLFORM_ID},"GET")
            }else{
                RMSGBOX(respond.msg)    
                $$(menuId).hideProgress()
                $$(menuId).enable()
            }
        })
    }
}

function getCallFormData(){
    let pkData = []
    let dataVal = {[winActiveBlock["focusNow"]]:{}}
    let dataParent = {}

    if ((winConfigForm[winActiveBlock["focusNow"]]["BLOCK_TYPE"][1])!="NONE"){
        if($$(winActiveBlock["focusNow"]).config.view=="form"){
            dataVal[winActiveBlock["focusNow"]].blockType = "form"
            dataVal[winActiveBlock["focusNow"]].data = [{}]
            dataTemp = getBlockValue(winActiveBlock["focusNow"])
            if ((winConfigForm[winActiveBlock["focusNow"]]["PRIMARY_KEY"]).length!=0){
                (winConfigForm[winActiveBlock["focusNow"]]["PRIMARY_KEY"]).forEach(function(id){
                    dataVal[winActiveBlock["focusNow"]].data[0][id] = dataTemp[id]
                })
            }
        }else if($$(winActiveBlock["focusNow"]).config.view=="datatable"){
            dataVal[winActiveBlock["focusNow"]].blockType = "datagrid"
            dataVal[winActiveBlock["focusNow"]].data = [{}]
            dataTemp = getRecordValueDt(winActiveBlock["focusNow"])
            if ((winConfigForm[winActiveBlock["focusNow"]]["PRIMARY_KEY"]).length!=0){
                (winConfigForm[winActiveBlock["focusNow"]]["PRIMARY_KEY"]).forEach(function(id){
                    dataVal[winActiveBlock["focusNow"]].data[0][id] = dataTemp[id]
                })
            }
        }
        if(winConfigForm[winActiveBlock["focusNow"]]["BLOCK_TYPE"][1]!="PARENT"){
            Object.keys(winConfigForm).forEach(function(block){
                if (winConfigForm[block]["BLOCK_TYPE"][1]=="PARENT"){
                    if($$(block).config.view == "form"){
                        dataParent = getBlockValue(block)
                    }else{
                        dataParent = getRecordValueDt(block)
                    }
                }
            })
            for(let pk of winConfigForm[winActiveBlock["focusNow"]]["RELATION_KEY"]){
                dataVal[winActiveBlock["focusNow"]].data[0][pk] = dataParent[pk]
                
            }
        }
        
    }else{
        if($$(winActiveBlock["focusNow"]).config.view=="form"){
            dataVal[winActiveBlock["focusNow"]].blockType = "form"
            dataVal[winActiveBlock["focusNow"]].data = [{}]
            dataVal[winActiveBlock["focusNow"]].data[0] = getBlockValue(winActiveBlock["focusNow"])
        }else if($$(winActiveBlock["focusNow"]).config.view=="datatable"){
            dataVal[winActiveBlock["focusNow"]].blockType = "datagrid"
            dataVal[winActiveBlock["focusNow"]].data = [{}]
            dataVal[winActiveBlock["focusNow"]].data[0] = getRecordValueDt(winActiveBlock["focusNow"])
        }
    }

    dataVal = checkingFormat(dataVal,"CALL FORM")
    if ((winConfigForm[winActiveBlock["focusNow"]]["BLOCK_TYPE"][1])!="NONE"){
        if(winConfigForm[winActiveBlock["focusNow"]]["BLOCK_TYPE"][1] =="SUB_PARENT"){
            blockParent = getBlockParent()
            for (let pk in dataVal[blockParent].data[0]){
                pkData.push(dataVal[blockParent].data[0][pk])
            }
        }else{
            for (let pk in dataVal[winActiveBlock["focusNow"]].data[0]){
                pkData.push(dataVal[winActiveBlock["focusNow"]].data[0][pk])
            }
        }
    }else{
        pkData = dataVal[winActiveBlock["focusNow"]].data[0]
    }
    return pkData
}

function getCallBackData(){
    let pkData = []
    let blockName = winActiveBlock["focusNow"]
    let dataVal = {}
    let blockFilter = false

    if(Object.keys(winConfigForm).length==1){
        if($$(winActiveBlock["focusNow"]).config.view=="form"){
            dataVal = {[blockName]:{}}
            dataVal[blockName].blockType = "form"
            dataVal[blockName].data = [{}]
            dataTemp = getBlockValue(blockName)
            if ((winConfigForm[blockName]["PRIMARY_KEY"]).length!=0){
                (winConfigForm[blockName]["PRIMARY_KEY"]).forEach(function(id){
                    dataVal[blockName].data[0][id] = dataTemp[id]
                })
            }
        }else if($$(winActiveBlock["focusNow"]).config.view=="datatable"){
            dataVal = {[blockName]:{}}
            dataVal[blockName].blockType = "datagrid"
            dataVal[blockName].data = [{}]
            dataTemp = getRecordValueDt(winActiveBlock["focusNow"])
            if ((winConfigForm[blockName]["PRIMARY_KEY"]).length!=0){
                (winConfigForm[blockName]["PRIMARY_KEY"]).forEach(function(id){
                    dataVal[blockName].data[0][id] = dataTemp[id]
                })
            }
        }
    }
    else if(Object.keys(winConfigForm).length>1){
        Object.keys(winConfigForm).forEach(function(block){
            if (winConfigForm[block]["BLOCK_TYPE"][0]=="FORM" && winConfigForm[block]["BLOCK_TYPE"][1]=="NONE"){
                blockName = block
                dataVal = {[blockName]:{}}
                dataVal[blockName].data = [{}]
                dataVal[blockName].blockType = "form"
                dataVal[blockName].data[0] = getBlockValue(blockName)
                blockFilter = true
            }
        })
        if(blockFilter == false){
            Object.keys(winConfigForm).forEach(function(block){
                if (winConfigForm[block]["BLOCK_TYPE"][1]=="PARENT"){
                    blockName = block
                    dataVal = {[blockName]:{}}
                    dataVal[blockName].data = [{}]
                    dataTemp = {}
                    if($$(blockName).config.view == "form"){
                        dataVal[blockName].blockType = "form"
                        dataTemp = getBlockValue(blockName)
                    }else{
                        dataVal[blockName].blockType = "datagrid"
                        dataTemp = getRecordValueDt(blockName)
                    }
                    if ((winConfigForm[block]["PRIMARY_KEY"]).length!=0){
                        (winConfigForm[block]["PRIMARY_KEY"]).forEach(function(id){
                            dataVal[blockName].data[0][id] = dataTemp[id]
                        })
                    }
                }
            })
        }
    }
    dataVal = checkingFormat(dataVal,"CALL FORM")
    if(blockFilter == false){
        if(Object.keys(dataVal).length!=0){
            for (let pk in dataVal[blockName].data[0]){
                pkData.push(dataVal[blockName].data[0][pk])
            }
        }
    }else{
        pkData = dataVal[blockName].data[0]
    }
    return [pkData,blockName]
}

function nextPrevMulti(){
    if(winMultiviewBlocks.length!=0){
        if($$($$("tabbar"+menuId).getValue()).config.view=="form"){
            if(!winSearchMode && !winAddData){
                if(winConfigForm[$$("tabbar"+menuId).getValue()]['REST_API']!=undefined){
                    webix.extend($$($$("tabbar"+menuId).getValue()), webix.ProgressBar);
                    $$($$("tabbar"+menuId).getValue()).disable()
                    $$($$("tabbar"+menuId).getValue()).clear()
                    // webix.delay(function(){

                    restapi.restApiParam(winConfigForm[$$("tabbar"+menuId).getValue()].REST_API);
                    // }, null, null, 1000);
                    
                    $$($$("tabbar"+menuId).getValue()).enable()
                }
            }
        }else if($$($$("tabbar"+menuId).getValue()).config.view=="datatable"){
            if(!winSearchMode && !winAddData){
                if(winConfigForm[$$("tabbar"+menuId).getValue()]['REST_API']!=undefined){
                    webix.extend($$($$("tabbar"+menuId).getValue()), webix.ProgressBar);
                    $$($$("tabbar"+menuId).getValue()).disable()
                    $$($$("tabbar"+menuId).getValue()).clearAll()
                    let param    
                    if (winThereIsSubChild) {
                        winDataDtSelect = {}
                        if (winConfigForm[$$("tabbar"+menuId).getValue()]["BLOCK_TYPE"][1]=="SUB_CHILD") {
                             param = winConfigForm[winConfigForm[$$("tabbar"+menuId).getValue()]["BLOCK_TYPE"][2]].REST_API
                        }else {
                             param = winConfigForm[$$("tabbar"+menuId).getValue()].REST_API;
                        }
                        if (param) {
                            if (param.hasOwnProperty('OFFSET_NUMBER')) {
                                delete param.OFFSET_NUMBER
                                delete param.LOAD_MORE_DATA
                            }
                        }
                        restapi.restApiParam(param)
                    }else{
                        param = winConfigForm[$$("tabbar"+menuId).getValue()].REST_API
                        restapi.restApiParam(param)
                    }
                     $$($$("tabbar"+menuId).getValue()).enable()
                }
            }
        }
    }else if(winMultiviewBlocksVertical.length!=0){
        if($$($$("listMultiviewVertical"+menuId).getSelectedId()).config.view=="form"){
            if(!winSearchMode && !winAddData){
                if(winConfigForm[$$("listMultiviewVertical"+menuId).getSelectedId()]['REST_API']!=undefined){
                    webix.extend($$($$("listMultiviewVertical"+menuId).getSelectedId()), webix.ProgressBar);
                    $$($$("listMultiviewVertical"+menuId).getSelectedId()).disable()
                    $$($$("listMultiviewVertical"+menuId).getSelectedId()).clear()
                    
                    
                    restapi.restApiParam(winConfigForm[$$("listMultiviewVertical"+menuId).getSelectedId()].REST_API);
                    
                    $$($$("listMultiviewVertical"+menuId).getSelectedId()).enable()
                }
            }
        }else if($$($$("listMultiviewVertical"+menuId).getSelectedId()).config.view=="datatable"){
            if(!winSearchMode && !winAddData){
                if(winConfigForm[$$("listMultiviewVertical"+menuId).getSelectedId()]['REST_API']!=undefined){
                    webix.extend($$($$("listMultiviewVertical"+menuId).getSelectedId()), webix.ProgressBar);
                    $$($$("listMultiviewVertical"+menuId).getSelectedId()).disable()
                    $$($$("listMultiviewVertical"+menuId).getSelectedId()).clearAll()
                    let param
                    if (winThereIsSubChild) {
                        winDataDtSelect = {}
                        if (winConfigForm[$$("listMultiviewVertical"+menuId).getSelectedId()]["BLOCK_TYPE"][1]=="SUB_CHILD") {
                            param = winConfigForm[winConfigForm[$$("listMultiviewVertical"+menuId).getSelectedId()]["BLOCK_TYPE"][2]].REST_API
                        }else {
                            param = winConfigForm[$$("listMultiviewVertical"+menuId).getSelectedId()].REST_API; 
                        }
                        if (param) {
                            if (param.hasOwnProperty('OFFSET_NUMBER')) {
                                delete param.OFFSET_NUMBER
                                delete param.LOAD_MORE_DATA 
                            }
                        }
                        restapi.restApiParam(param)   
                    }else{
                        restapi.restApiParam( winConfigForm[$$("listMultiviewVertical"+menuId).getSelectedId()].REST_API)
                    }
                        $$($$("listMultiviewVertical"+menuId).getSelectedId()).enable()
                }
            }
        }
    }else{
        Object.keys(winConfigForm).forEach(function(idBlock){
            if(winConfigForm[idBlock]['BLOCK_TYPE'][1]=='CHILD'){
                let deleteObject = winConfigForm[idBlock]['REST_API'];
                    if (deleteObject) {
                        if (deleteObject.hasOwnProperty('OFFSET_NUMBER')) {
                            delete deleteObject.OFFSET_NUMBER;
                            delete deleteObject.LOAD_MORE_DATA; 
                        }
                    }              
                if(!winSearchMode && !winAddData){
                    if(winConfigForm[idBlock]['REST_API']!=undefined){
                        restapi.restApiParam(deleteObject);
                    }
                }
            }
        })
    }
}

function loadPhoto(dataParam){

    dataParam['DATA'].forEach(function(paramFile){
        let param = {
            "DATA":[paramFile],
            "API_NAME":dataParam['API_NAME'],
            "FILE_TYPE":"single",
            "TYPE":"loadPhoto"
        }
        restapi.restApiFile(param)
    })
    
}

function checkingFormatDate(param){
    // checkingFormatDate({valueDate, formatDate, output, input})
    // param = valueDate, formatDate, output, input
    // console.log(805, param)
    if (param.valueDate!='' && param.valueDate!=null){
        if(param.valueDate.includes("-")){
            param.valueDate = param.valueDate.split(" ")[0]
            let splittedDate = param.valueDate.split("-")
            let formatDate
            if(splittedDate[0].length == 4){
                formatDate = "YYYY-MM-DD"
            }else{
                formatDate = "DD-MM-YYYY"
            }
            let parsedDate = moment(param.valueDate, formatDate);
            if(param.output=="year"){
                param.valueDate = parsedDate.format('YYYY-MM-DD');
            }else if(param.output=="day"){
                param.valueDate = parsedDate.format('DD-MM-YYYY');
            }
        }else{
            let parsedDate = moment(param.valueDate, param.formatDate.replace("-",""));
            if(param.output=="year"){
                param.valueDate = parsedDate.format('YYYY-MM-DD');
            }else if(param.output=="day"){
                param.valueDate = parsedDate.format('DD-MM-YYYY');
            }
        }
    }else{
        param.valueDate = null;
    }
    return param.valueDate
}

function detectTimeStampFormat(dateString) {
    const formatsToCheck = ['YYYY-MM-DD HH:mm:ss', 'DD-MM-YYYY HH:mm:ss'];

    for (let format of formatsToCheck) {
        const parsedDate = moment(dateString, format, true); // The true flag enables strict parsing

        if (parsedDate.isValid()) {
        return format;
        }
    }

    return null; // Indicate that the format is not recognized
}

function checkingFormatTimeStamp(param){
    // param = valueTimeStamp, type
    if (param.valueTimeStamp!='' && param.valueTimeStamp!=null){
        let timeStampFormat = detectTimeStampFormat(param.valueTimeStamp)
        let parsedTimeStamp = moment(param.valueTimeStamp, timeStampFormat);
        let formattedTimeStamp
        if(param.type=="year"){
            formattedTimeStamp = parsedTimeStamp.format('YYYY-MM-DD HH:mm:ss');
        }else if(param.type=="day"){
            formattedTimeStamp = parsedTimeStamp.format('DD-MM-YYYY HH:mm:ss');
        }
        param.valueTimeStamp = formattedTimeStamp
    }else{
        param.valueTimeStamp = null;
    }
    return param.valueTimeStamp
}

function checkingFormatClock(clockString) {
    const formatsToCheck = ['HH:mm', 'HH:mm:ss'];

    for (let format of formatsToCheck) {
        const parsedTime = moment(clockString, format, true); // The true flag enables strict parsing

        if (parsedTime.isValid()) {
        return format;
        }
    }
    return null; // Indicate that the format is not recognized
}

function checkingClock(param){
    // param = valueClock, date, type, second
    let formattedDateAndClock
    if (param.valueClock!='' && param.valueClock!=null){
        let clockFormat = checkingFormatClock(param.valueClock)
        let parsedClock = moment(param.valueClock, clockFormat);
        param.valueClock = parsedClock.format("HH:mm:ss")

        if(param.second==undefined || param.second==false){
            param.valueClock = parsedClock.format("HH:mm")
        }
        
        if(param.date!=undefined){
            param.date = checkingFormatDate({"valueDate":param.date, "output":"year"})
        }else{
            param.date = moment().format("YYYY-MM-DD")
        }
        
        if(param.type=="clock"){
            formattedDateAndClock = param.valueClock
        }else if(param.type=="dateandclock"){
            formattedDateAndClock = String(param.date)+" "+String(param.valueClock)
        }
    }else{
        formattedDateAndClock = null;
    }
    return formattedDateAndClock
}   

function checkCompareBeforeAPI(dataAfterFormat){
    // param = dataBaru, idChanged, block
    let cloneDataAfterFormat = webix.copy(dataAfterFormat)

    Object.keys(cloneDataAfterFormat).forEach(function(idBlock){
        if(cloneDataAfterFormat[idBlock]['blockType']=="datagrid"){
            let cloneDataBaru = webix.copy(cloneDataAfterFormat[idBlock]['data'])
            function findObjectById(idRecord, data){
                return data.find(obj => obj.id === idRecord)
            }
            cloneDataAfterFormat[idBlock]['idChanged'].forEach(function(idRecord){
                let index = cloneDataAfterFormat[idBlock]['idChanged'].indexOf(idRecord)
                let dataAwal
                Object.keys(winDataDtSelect).every(function(blockDt){
                    if(findObjectById(idRecord, winDataDtSelect[blockDt])!=undefined){
                        dataAwal = findObjectById(idRecord, winDataDtSelect[blockDt])
                        return false
                    }
                    return true
                })
                Object.keys(cloneDataBaru[index]).forEach(function(keyRecord){
                    if(winDateType.includes(keyRecord)){
                        dataAwal[keyRecord] = checkingFormatDate({"valueDate":dataAwal[keyRecord], "output":"year"})
                    }else if(winDateTypeMMYY.includes(keyRecord)){
                        dataAwal[keyRecord] = checkingFormatDate({"valueDate":"01-"+dataAwal[keyRecord], "output":"year"})
                    }else if(winDateTypeYY.includes(keyRecord)){
                        dataAwal[keyRecord] = checkingFormatDate({"valueDate":"01-01-"+dataAwal[keyRecord], "output":"year"})
                    }
                    if(dataAwal.hasOwnProperty(keyRecord)){
                        if(!getAllPKinForm().includes(keyRecord)){
                            console.log("Compare Data : ",keyRecord,cloneDataBaru[index][keyRecord],dataAwal[keyRecord])
                            if(cloneDataBaru[index][keyRecord]==dataAwal[keyRecord]){
                                delete cloneDataBaru[index][keyRecord]
                            }
                        }else{
                            delete cloneDataBaru[index][keyRecord]
                        }
                    }else{
                        if(!winConfigForm[idBlock]['ELEMENT'].includes(keyRecord)){
                            delete cloneDataBaru[index][keyRecord]
                        }
                    }
                })
        
                if(Object.keys(cloneDataBaru[index]).length==0){
                    let indexDataAfterFormat = dataAfterFormat[idBlock]['idChanged'].indexOf(idRecord)
                    dataAfterFormat[idBlock]['data'].splice(indexDataAfterFormat,1)
                    dataAfterFormat[idBlock]['idChanged'].splice(indexDataAfterFormat,1)
                }
            })
        }
        if(dataAfterFormat[idBlock]['data'].length==0){
            delete dataAfterFormat[idBlock]
        }
    })
    return dataAfterFormat
}

function setMultiLanguage(oldLanguage='', newLanguage=window.DEFAULT_MULTILANG){
    if (window.MULTILANGUAGE == 'N'){
        return new Promise((resolve)=>{
            $$("progressLoadingMultilanguage").hide();
            resolve({"status":true})
        })
    } 

    if (oldLanguage==''&& newLanguage != 'ID' ) {
        oldLanguage = 'ID'
    }
    console.log("setMultiLanguage = ",oldLanguage, newLanguage)
    if(winMultilanguage.old!='' && winMultilanguage.target!=''){
        oldLanguage = winMultilanguage.old
        newLanguage = winMultilanguage.target
    }

    let dictAllElement = {}
    let dictCore = {}
    let dtLOVObject = {} 
    let comboObj = {}
    let radioObj = {}
    let multiviewObj = {}
    let multiviewVerticalObj = {}
    let templateCustomObj = {}

    function getIdAndLabel(data) {
        var result = {};
        data.forEach(function(item) {
            var id = item.id;
            var label = item.header && item.header.length > 0 ? item.header[0].text : "";
            result[id] = label;
        });
        return result;
    }

    function extractAllElements(winConfigForm) {
        let dictAllElement = {};

        Object.keys(winConfigForm).forEach(blockId => {
            let blockType = winConfigForm[blockId]['BLOCK_TYPE'][0];
            let blockView = $$(blockId);

            if (!blockView) return; // skip kalau view tidak ada

            // === FORM ===
            if (blockType === "FORM" && blockView.elements) {
                const els = blockView.elements;

                const processItem = (cfg, idKey) => {
                    if (!cfg) return;

                    const id = cfg.name || cfg.id || idKey;
                    if (!id) return;

                    if (cfg.label !== undefined) dictAllElement[id] = cfg.label;
                    else if (cfg.value !== undefined) dictAllElement[id] = cfg.value;
                    else dictAllElement[id] = "";

                    if (cfg.bottomLabel !== undefined) dictAllElement[id + "__bottomLabel"] = cfg.bottomLabel;
                    if (cfg.placeholder !== undefined) dictAllElement[id + "__placeholder"] = cfg.placeholder;

                    // === options untuk combo / richselect / radio ===
                    if (Array.isArray(cfg.options)) {
                        cfg.options.forEach((opt, idx) => {
                            if (opt.value !== undefined) {
                                let keyType = "__option_"; // default untuk combo/richselect
                                let optionId = idx;

                                if (cfg.view === "radio") {
                                    keyType = "__radio_";
                                    optionId = opt.id;
                                }

                                // buat key unik, termasuk formId kalau ada
                                let fullKey = (blockId + "__") + id + keyType + optionId;
                                dictAllElement[fullKey] = opt.value;
                            }
                        });
                    }
                };

                if (Array.isArray(els)) {
                    els.forEach(item => processItem(item.config || item));
                } else if (typeof els === "object") {
                    Object.keys(els).forEach(key => processItem((els[key].config || els[key]), key));
                }
            }

            // === DATAGRID ===
            if (blockType === "DATAGRID" && blockView.config && Array.isArray(blockView.config.columns)) {
                
                blockView.config.columns.forEach((col, idx) => {
                    const colId = col.id;
                    if (!colId) return;

                    // Header
                    if (Array.isArray(col.header)) {
                        col.header.forEach((h, hidx) => {
                            if (h && h.text !== undefined) {
                                dictAllElement[colId + "__header_" + hidx] = h.text;
                            }
                        });
                    }
                    // Footer
                    if (col.customFooter != undefined) {
                        if (Array.isArray(col.customFooter)) {
                            col.customFooter.forEach((recordFooter) => {
                                dictAllElement[colId + "__customfooter"] = recordFooter.columns[0];
                            });
                        }
                    }

                    // Tooltip
                    if (col.tooltip !== undefined) dictAllElement[colId + "__tooltip"] = col.tooltip;

                    // Button Datagrid
                    // if (col.editor === "btnDatagrid") {
                    //     let btnLabel = col.template && typeof col.template === "string"
                    //         ? (col.template.match(/value\s*=\s*['"]?([^'">]+)['"]?/) || [])[1]
                    //         : col.COLUMN_LABEL || "";
                    //     dictAllElement[colId + "__btnDatagrid"] = btnLabel;
                    //     console.log(4014,btnLabel);
                        
                    // }
                });
            }

            // === Fallback collect SECTION ===
            document.querySelectorAll(".webix_view.webix_section").forEach(el => {
                let viewId = el.getAttribute("view_id");
                let textContent = el.textContent.trim();
                if (viewId && textContent) dictAllElement["section__" + viewId] = textContent;
            });

            // === LOV API ===
            Object.keys(winConfigForm).forEach(blockId => {
                let fieldObj = winConfigForm[blockId];
                if (fieldObj.LOV_API!=undefined){
                    if (Object.keys(fieldObj.LOV_API).length!=0) {
                        Object.keys(fieldObj.LOV_API).forEach(function(objLOV){
                            
                            let tableId = fieldObj.LOV_API[objLOV]["TABLE_ID"]
                            if (!tableId) return;
                            let winId = "wd" + tableId.replace(/^dt/, ""); // contoh: dtLovCodedis -> wdLovCodedis
                            let popupWin = $$(winId);
                            if (!popupWin || !popupWin.config.body) return;
                            popupWin.config.body.rows.forEach(row => traversePopupElement(row, winId, dictAllElement));
                            
                        })
                    }
                }
            })



        });

        return dictAllElement;
    }

    // traverse popup body
    function traversePopupElement(el, winId, dictAllElement){
        if(!el) return;

        // Search
        if(el.view === "search"){
            let keyPlaceholder = winId + "__" + el.id + "__placeholder";
            let keyTooltip = winId + "__" + el.id + "__tooltip";
            if(el.placeholder) dictAllElement[keyPlaceholder] = el.placeholder;
            if(el.tooltip) dictAllElement[keyTooltip] = el.tooltip;
        }

        // Datatable
        if(el.view === "datatable" && Array.isArray(el.columns)){
            el.columns.forEach((col, idx) => {
                if(col.header && col.header[0] && col.header[0].text !== undefined){
                    dictAllElement[el.id + "__" + col.id + "__header_0"] = col.header[0].text;
                    }
            });
            }

        // // Radio / Combo
        // if(el.view === "radio" && Array.isArray(el.options)){
        //     el.options.forEach(opt => {
        //         console.log(winId + "__" + el.id + "__radio_" + opt.id)
        //         dictAllElement[winId + "__" + el.id + "__radio_" + opt.id] = opt.value;
        //     });
        // }
        // if((el.view==="combo" || el.view==="richselect") && el.getList){
        //     el.getList().data.each(function(item, idx){
        //         console.log(winId + "__" + el.id + "__option_" + idx)
        //         dictAllElement[winId + "__" + el.id + "__option_" + idx] = item.value;
        //     });
        // }

        // traverse subrows/cols
        if(Array.isArray(el.rows)) el.rows.forEach(r => traversePopupElement(r, winId, dictAllElement));
        if(Array.isArray(el.cols)) el.cols.forEach(c => traversePopupElement(c, winId, dictAllElement));
    }









    dictAllElement = extractAllElements(winConfigForm)
    
    // lov
    Object.keys(dtLOVObject).forEach(function(idDtLov){
        Object.keys(dtLOVObject[idDtLov]).forEach(function(idColumn){
            dictAllElement[idColumn] = dtLOVObject[idDtLov][idColumn]
        })
    })

    // combo option make object tampungan
    if(Object.keys(winCombo).length!=0){
        for (let key in winCombo) {
            if (winCombo.hasOwnProperty(key)) {
                comboObj[key] = {};
                for (var i = 0; i < winCombo[key].length; i++) {
                var item = winCombo[key][i];
                comboObj[key][item.id] = item.value;
                }
            }
        }
    }

    // radio option make object tampilan
    if(Object.keys(winRadio).length!=0){
        for (let key in winRadio) {
            if (winRadio.hasOwnProperty(key)) {
                radioObj[key] = {};
                for (var i = 0; i < winRadio[key].length; i++) {
                var item = winRadio[key][i];
                radioObj[key][item.id] = item.value;
                }
            }
        }
    }

    // multiview option make object tampungan
    if(Object.keys(winMultiviewMultiLanguage).length!=0){
        for (let key in winMultiviewMultiLanguage) {
            if (winMultiviewMultiLanguage.hasOwnProperty(key)) {
                multiviewObj[key] = {};
                    for (var i = 0; i < winMultiviewMultiLanguage[key].length; i++) {
                    var item = winMultiviewMultiLanguage[key][i];
                multiviewObj[key][item.id] = item.value;
                }
            }
        }
    }

    // multiview option make object tampungan    
    if(Object.keys(winMultiviewVerticalMultiLanguage).length!=0){
        multiviewVerticalObj["listMultiviewVertical"+menuId] = {}
        winMultiviewVerticalMultiLanguage.forEach(function(record){
            multiviewVerticalObj["listMultiviewVertical"+menuId][record['id']] = record['title']
        })
    }

    // template custom make object tampungan
    if(Object.keys(winAdditionalTemplate).length!=0){
        templateCustomObj["template"] = {};
        for (let key in winAdditionalTemplate) {
            if ($$(key)!=undefined){
                if($$(key).config.view=="template"){
                    templateCustomObj["template"][key] = $$(key).config.template();
                }
            }
        }
    }

    // add option combo to dictAllElement
    Object.keys(comboObj).forEach(function(idComboObj){
        let objCombo = $$(idComboObj);
        let parentId = null;

        while (objCombo) {
            objCombo = objCombo.getParentView();
            if (!objCombo) break; // sudah sampai root, berhenti

            const viewType = objCombo.config.view;
            if (viewType === "form" || viewType === "datatable") {
                parentId = objCombo.config.id; // simpan id parent yang ditemukan
                break; // berhenti setelah ketemu form/datatable
            }
        }
        Object.keys(comboObj[idComboObj]).forEach(function(idOption){
            dictAllElement[parentId+"__"+idComboObj+"__option_"+idOption] = comboObj[idComboObj][idOption]
        })
    })

    // add option radio to dictAllElement
    Object.keys(radioObj).forEach(function(idradioObj){
        Object.keys(radioObj[idradioObj]).forEach(function(idOption){
            dictAllElement[idOption] = radioObj[idradioObj][idOption]
        })
    })

    // add multiview to dictAllElement
    Object.keys(multiviewObj).forEach(function(idmultiviewObj){
        Object.keys(multiviewObj[idmultiviewObj]).forEach(function(idMultiviewObj){
            dictAllElement[idMultiviewObj] = multiviewObj[idmultiviewObj][idMultiviewObj]
        })
    })

    // add multiviewVertical to dictAllElement
    Object.keys(multiviewVerticalObj).forEach(function(idmultiviewVerticalObj){
        Object.keys(multiviewVerticalObj[idmultiviewVerticalObj]).forEach(function(idMultiviewVerticalObj){
            dictAllElement[idMultiviewVerticalObj] = multiviewVerticalObj[idmultiviewVerticalObj][idMultiviewVerticalObj]
        })
    })

    // add template custom to dictAllElement
    Object.keys(templateCustomObj).forEach(function(idtemplateCustomObj){
        Object.keys(templateCustomObj[idtemplateCustomObj]).forEach(function(idTemplate){
            dictAllElement[idTemplate] = templateCustomObj[idtemplateCustomObj][idTemplate]
        })
    })

    


    additionalMultiLanguage.forEach(function(idItem){
        if($$(idItem)!=undefined){
            if($$(idItem).config.view=="button" || $$(idItem).config.view=="uploader"){
                dictAllElement[idItem] = $$(idItem).config.value
                if($$("section_"+idItem)!=undefined){
                    if(String($$("section_"+idItem).config.template()) !=""){
                        dictAllElement["section_"+idItem] = String($$("section_"+idItem).config.template())            //ADDITIONAL
                    }
                }
            }else if(winLOV.includes(idItem)){
                if($$(idItem)!=undefined){
                    if($$(idItem).config.label!="" && $$(idItem).config.label!="‎"){
                        dictAllElement[idItem] = $$(idItem).config.label 
                    }
                }
            }else if(winDisplayItem.includes(idItem)){
                if($$(idItem)!=undefined){
                    if($$(idItem).config.view == "text" && $$(idItem).config.label!="‎"){
                        dictAllElement[idItem] = $$(idItem).config.label
                    }
                }
            }else if(Object.keys(comboObj).includes(idItem)){
                dictAllElement[idItem] = $$(idItem).config.label
            }else if(Object.keys(radioObj).includes(idItem)){
                dictAllElement[idItem] = $$(idItem).config.label
            }else if($$(idItem).config.view=="template"){
                dictAllElement[idItem] = $$(idItem).config.template()
                dictAllElement[idItem] = $$(idTemplate).config.template()
            }
        }else{
            if(winLOV.includes(idItem)){
                Object.keys(winConfigForm).forEach(function(idBlock){
                    if(winConfigForm[idBlock]["BLOCK_TYPE"][0]=="DATAGRID"){
                        if($$(idBlock).getColumnConfig(idItem)!=undefined){
                            if($$(idBlock).getColumnConfig(idItem)["header"][0]['text']!="" && $$(idBlock).getColumnConfig(idItem)["header"][0]['text'] != "‎"){
                                dictAllElement[idItem] = $$(idBlock).getColumnConfig(idItem)["header"][0]['text']
                            }
                        }
                    }
                })
            }else{
                Object.keys(winConfigForm).forEach(function(idBlock){
                    if(winConfigForm[idBlock]["BLOCK_TYPE"][0]=="DATAGRID"){
                        if($$(idBlock).getColumnConfig(idItem)!=undefined){
                            let colObj = $$(idBlock).getColumnConfig(idItem)
                            if(colObj["header"][0]['text']!="" && colObj["header"][0]['text'] != "‎"){
                                dictAllElement[idItem] = colObj["header"][0]['text']
                            }
                            if (colObj["jenis"] == 'combo'){
                                let list = colObj.collection.serialize();
                                list.forEach(function(item){
                                    let key = idBlock + "__" + colObj.id + "__option_" + item['id'];
                                    dictAllElement[key] = item['value']
                                });
                            }
                        }
                    }
                })
            }
        }
    })

    Object.keys(winAdditionalTemplate).forEach(function(idObj){
        if(!(idObj in dictAllElement)){
            dictCore[idObj] = winAdditionalTemplate[idObj]
        }
    })
    function checkKeyInDictionaries(obj, keyToCheck) {
        // Iterate over each key in the main object
        for (let dictKey in obj) {
            // Check if the keyToCheck exists in the current dictionary
            if (obj[dictKey].hasOwnProperty(keyToCheck)) {
                return { status: true, dictionary: dictKey };
            }
        }
        return { status: false, dictionary: null };
    }
    if (!Object.keys(tempLanguageForm).includes(newLanguage)) {
        if((!Object.keys(tempLanguageForm).includes(oldLanguage) && oldLanguage=='ID') || (oldLanguage == '' && newLanguage =='ID')){
            tempLanguageForm['ID'] = translateToLanguage('ID', 'ID', dictAllElement, dictCore)
        }
        let respondData = translateToLanguage('ID', newLanguage, tempLanguageForm['ID'], dictCore)
        tempLanguageForm[newLanguage] = respondData
    }

    function updateLabel(idElement, newLabel, allLabelDict){
        let blockElement = getBlockItem(idElement);

        // === bottomLabel pada FORM ===
        if(idElement.includes("__bottomLabel")){
            let realId = idElement.replace("__bottomLabel","");
            Object.keys(winConfigForm).forEach(function(block){
                let blockType = winConfigForm[block]['BLOCK_TYPE'][0];
                if(blockType=="FORM" && $$(block)){
                    let form = $$(block);
                    if(form.elements && form.elements[realId]){
                        form.elements[realId].define("bottomLabel", newLabel);
                        form.elements[realId].refresh();
                    }
                }
            });
            return;
        }

        // === tooltip pada DATAGRID ===
        if(idElement.includes("__tooltip")){
            let realId = idElement.replace("__tooltip","");
            Object.keys(winConfigForm).forEach(function(block){
                let blockType = winConfigForm[block]['BLOCK_TYPE'][0];
                if(blockType=="DATAGRID" && $$(block)){
                    let datatable = $$(block);
                    let col = datatable.getColumnConfig(realId);
                    if(col){
                        col.tooltip = newLabel;
                        datatable.refreshColumns();
                    }
                }
            });
            return;
        }

        // === header pada DATAGRID ===
        if(idElement.includes("__header_")){
            if (idElement.startsWith("dt")) {
                let [dtLov,column,headCol] = idElement.split("__")
                let headerIdx = headCol.split("_")[1]
                headerIdx = parseInt(headerIdx, 10);
                let datatable = $$(dtLov);
                let col = datatable.getColumnConfig(column);
                if(col && Array.isArray(col.header) && col.header[headerIdx]){
                    col.header[headerIdx].text = newLabel;
                    datatable.refreshColumns();
                }
            }else{
                let [realId, headerIdx] = idElement.split("__header_");
                headerIdx = parseInt(headerIdx, 10);
                Object.keys(winConfigForm).forEach(function(block){
                    let blockType = winConfigForm[block]['BLOCK_TYPE'][0];
                        let blockElement = winConfigForm[block]['ELEMENT']
                        if(blockType=="DATAGRID" && $$(block) && (blockElement.includes(realId))){
                            let datatable = $$(block);
                            let col = datatable.getColumnConfig(realId);
                            if(col && Array.isArray(col.header) && col.header[headerIdx]){
                                col.header[headerIdx].text = newLabel;
                                datatable.refreshColumns();
                            }
                        }
                    });
            }
            
            return;
        }
        if(idElement.includes("__customfooter")){
            let realId = idElement.replace("__customfooter","");
            Object.keys(winConfigForm).forEach(function(block){
                let blockType = winConfigForm[block]['BLOCK_TYPE'][0];
                let blockElement = winConfigForm[block]['ELEMENT']
                if(blockType=="DATAGRID" && (blockElement.includes(realId))){
                    let datatable = $$(block);
                    let col = datatable.getColumnConfig(realId);
                    if (Array.isArray(col.footer)){
                        let keyText = col.customFooter[0].columns[0]
                        col.customFooter[0].columns[0] = newLabel
                        let newHTML = col.footer[0].text.replace(keyText,newLabel)
                        col.footer[0].text = newHTML
                        datatable.refreshColumns();
                    }
                }
                return;
            });
        }
        

        // if (idElement.includes("__btnDatagrid")) {
        //     let realId = idElement.replace("__btnDatagrid", "");
        //     Object.keys(winConfigForm).forEach(function(block) {
        //         let blockType = winConfigForm[block]['BLOCK_TYPE'][0];
        //         if (blockType == "DATAGRID" && $$(block)) {
        //             let datatable = $$(block);
        //             let col = datatable.getColumnConfig(realId);
        //             if (col.editor === "btnDatagrid") {
        //                 col.template = `<input class='detailCustomButton' 
        //                                         type='button' 
        //                                         value='${newLabel}' 
        //                                         data-colid='${realId}' />`;
        //                 datatable.refreshColumns();
        //             }
        //         }
        //     });
        //     return;
        // }

        // === apply khusus pager & count pager ===
        if (idElement.startsWith("pager_")) {
            let cmp = $$(idElement);
            if (cmp) {
                cmp.define("template", newLabel);
                cmp.refresh();
                cmp.render();
            }
            return;
        }

        if (idElement.startsWith("section__")) {
            let viewId = idElement.replace("section__", "");
            let el = document.querySelector(
                `.webix_view.webix_section[view_id='${viewId}'] .webix_template`
            );

            if (el) {
                el.textContent = newLabel;
            }
            return;
        }


       // === apply khusus count pager ===
        if (idElement.startsWith("count_")) {
            let [countId,string] = idElement.split("__");
            let cmp = $$(countId);
            if (cmp) {
                // simpan template asli kalau belum ada
                if (!cmp._originalTemplate) {
                    cmp._originalTemplate = cmp.config.template;
                }

                let newTemplate = function(obj, common){
                    let html = cmp._originalTemplate.call(this, obj, common);

                    html = html.replace(/Showing/g, allLabelDict[idElement.split("__")[0]+'__showing']);
                    html = html.replace(/from/g, allLabelDict[idElement.split("__")[0]+'__from']);
                    return html;
                };

                cmp.define("template", newTemplate);
                cmp.refresh();
                cmp.render();
            }
            return;
        }

        // === LABEL biasa (FORM / DATAGRID) ===
        if(blockElement!=''){
            if(winConfigForm[blockElement]['BLOCK_TYPE'][0]=="FORM"){
                let objForm = $$(idElement)
                if(objForm.config.label!=undefined){
                        objForm.define("label", newLabel);
                }
                if(objForm.config.view =='checkbox'){
                    if(objForm.config.labelRight!=undefined){
                        let valueLabelRight = `${idElement}_labelRight`
                        objForm.define("labelRight", allLabelDict[valueLabelRight]);
                    }
                    if(objForm.config.labelLeft!=undefined){
                        let valueLabelLeft = `${idElement}_labelLeft`
                        objForm.define("labelLeft", allLabelDict[valueLabelLeft]);
                    }
                }
                objForm.refresh();
                return;
            }else if(winConfigForm[blockElement]['BLOCK_TYPE'][0]=="DATAGRID"){
                $$(blockElement).getColumnConfig(idElement)["header"][0]['text'] = newLabel;
                $$(blockElement).refreshColumns();
                return;
            }
        } else {
            // --- blockElement kosong → cek manual di semua form/datagrid
            Object.keys(winConfigForm).forEach(function(block){
                let blockType = winConfigForm[block]['BLOCK_TYPE'][0];

                // FORM
                if(blockType=="FORM" && $$(block)){
                    let form = $$(block);
                    if(form.elements && form.elements[idElement]){
                        form.elements[idElement].define("label", newLabel);
                        form.elements[idElement].refresh();
                        return;
                    }
                }

                // DATAGRID
                if(blockType=="DATAGRID" && $$(block)){
                    let datatable = $$(block);
                    let col = datatable.getColumnConfig(idElement);
                    if(col){
                        col.header[0].text = newLabel;
                        datatable.refreshColumns();
                        return;
                    }
                }
            });
        }

        // === LOV ===
        let checkLov = checkKeyInDictionaries(dtLOVObject, idElement);
        if(checkLov.status){
            $$(checkLov.dictionary).getColumnConfig(idElement)["header"][0]['text'] = newLabel;
            $$(checkLov.dictionary).refreshColumns();
            return;
        }

        // === placeholder pada FORM ===
        if (idElement.includes("__placeholder")) {
            let realId = ''
            if (idElement.startsWith("wd")) {
                let [wdLov,idSearchLov,placeholder] = idElement.split("__");
                realId = idSearchLov
            }else{
                realId = idElement.replace("__placeholder", "");
            }
            if (realId != '') {
                $$(realId).define("placeholder",newLabel)
                $$(realId).refresh()
            }
            return;
        }

        // === Section (template view) ===
        if (idElement.startsWith("section__")) {
            let realId = idElement.replace("section__", "");
            let cmp = $$(realId);
            if (cmp && cmp.config.view === "template") {
                cmp.define("template", newLabel);
                cmp.refresh();
            }
            return;
        }



        // === FORM radio & combo/richselect update ===
        Object.keys(winConfigForm).forEach(blockId => {
            let blockType = winConfigForm[blockId]['BLOCK_TYPE'][0];
            if(blockType === "FORM" && $$(blockId)) {
                let form = $$(blockId);
                if(form.elements) {
                    Object.keys(form.elements).forEach(elId => {
                        let el = form.elements[elId];

                        // === RADIO ===
                        if(el.config.view === "radio" && Array.isArray(el.config.options)) {
                            let changed = false;
                            el.config.options.forEach(opt => {
                                let key = blockId + "__" + el.config.id + "__radio_" + opt.id;
                                if(allLabelDict[key] !== undefined) {
                                    opt.value = allLabelDict[key];
                                    changed = true;
                                }
                            });
                            if(changed){
                                el.refresh(); // paksa render ulang radio
                            }
                        }

                        // === COMBO / RICHSELECT ===
                        if((el.config.view === "combo" || el.config.view === "richselect") && el.getList()) {
                            let list = el.getList();
                            list.data.each(function(item, idx){
                                let key = blockId + "__" + el.config.id + "__option_" + item['id'];
                                if(allLabelDict[key] !== undefined){
                                    item.value = allLabelDict[key];
                                    list.updateItem(item.id, item);
                                }
                            });
                            el.refresh();
                        }
                    });
                }
            }else{
                let datagrid = $$(blockId);
                let columns = datagrid.getColumns()
                columns.forEach(el => {
					if((el.jenis === "combo") && additionalMultiLanguage.includes(el.id)) {
                        let list = el.collection.serialize();
                        list.forEach(function(item){
						    let key = blockId + "__" + el.id + "__option_" + item['id'];
							if(allLabelDict[key] !== undefined){
                                item.value = allLabelDict[key];
                            }
                        });
                    }
                });
            }
        });

        // === LOV popup ===
        Object.keys(winConfigForm).forEach(blockId => {
            let fieldObj = winConfigForm[blockId];
            if (fieldObj.LOV_API!=undefined){
                if (Object.keys(fieldObj.LOV_API).length!=0) {
                    Object.keys(fieldObj.LOV_API).forEach(function(objLOV){
                        let tableId = fieldObj.LOV_API[objLOV]["TABLE_ID"]
                        if (!tableId) return;
                        
                        let winId = "wd" + tableId.replace(/^dt/, ""); // contoh: dtLovCodedis -> wdLovCodedis
                        let popupWin = $$(winId);
                        if (!popupWin || !popupWin.config.body) return;

                        // traverse body
                        popupWin.config.body.rows.forEach(row => traversePopupUpdate(row, winId, idElement, newLabel, allLabelDict));
                    })
                }
            }
        });

        // === traverse popup untuk updateLabel ===
        function traversePopupUpdate(el, winId, idElement, newLabel, allLabelDict){
            
            if(!el) return;

            // Search
            // if(el.view == "search"){
            //     let keyPlaceholder = winId + "__" + el.id + "__placeholder";
            //     let keyTooltip = winId + "__" + el.id + "__tooltip";
            //     if(keyPlaceholder === idElement) el.define("placeholder", newLabel);
            //     if(keyTooltip === idElement) el.define("tooltip", newLabel);
            //     console.log(4742,el)
            //     try{
            //         el.refresh();
            //     }catch(error){
            //         console.log(error)
            //     }
            // }

            // Datatable
            if(el.view === "datatable" && Array.isArray(el.columns)){
                // console.log(4753, el.columns)
                el.columns.forEach((col, idx) => {
                    let keyHeader = el.id + "__" + col.id + "__header_0"; // hanya header_0 untuk simplicity
                    if(keyHeader == idElement){
                        col.header[0].text = newLabel;
                        el.refreshColumns();
                    }
                });
            }

            // // Radio / Combo di popup (kalau ada)
            // if(el.view === "radio" && Array.isArray(el.options)){
            //     el.options.forEach(opt => {
            //         let key = winId + "__" + el.id + "__radio_" + opt.id;
            //         if(key === idElement){
            //             opt.value = newLabel;
            //             el.refresh();
            //         }
            //     });
            // }
            // if((el.view==="combo" || el.view==="richselect") && el.getList){
            //     let list = el.getList();
            //     list.data.each(function(item, idx){
            //         let key = winId + "__" + el.id + "__option_" + idx;
            //         if(key === idElement){
            //             item.value = newLabel;
            //             list.updateItem(item.id, item);
            //         }
            //     });
            //     el.refresh();
            // }

            // traverse subrows/cols
            if(Array.isArray(el.rows)) el.rows.forEach(r => traversePopupUpdate(r, winId, idElement, newLabel, allLabelDict));
            if(Array.isArray(el.cols)) el.cols.forEach(c => traversePopupUpdate(c, winId, idElement, newLabel, allLabelDict));
        }






        // === Multiview ===
        let checkMulti = checkKeyInDictionaries(multiviewObj, idElement);
        if(checkMulti.status){
            Object.keys(multiviewObj).forEach(function(idMulti){
                $$(idMulti).config.options.forEach(opt=>{
                    if(opt.id==idElement) opt.value=newLabel;
                });
                $$(idMulti).refresh();
            });
            return;
        }

        // === Vertical multiview ===
        let checkVmulti = checkKeyInDictionaries(multiviewVerticalObj, idElement);
        if(checkVmulti.status){
            Object.keys(multiviewVerticalObj).forEach(function(idVMulti){
                let list = $$(idVMulti);
                if (list) {
                    // pastikan template pakai title
                    list.define("template", "#title#");

                    list.data.each(function(item){
                        if(item.id == idElement){
                            item.title = newLabel;
                            list.updateItem(item.id, item);
                        }
                    });

                    list.refresh();
                }
            });
            return;
        }

        // === Webix object langsung ===
        if($$(idElement)!=undefined){
            let obj = $$(idElement);
            if(obj.config.view=="button" || obj.config.view=="uploader"){
                obj.define("value", newLabel);
            }else if(obj.config.view=="template"){
                obj.define("template", newLabel);
            }else if (obj.config.view =='radio'){
                obj.define("label", newLabel);
                obj.config.options.forEach(opt => {
                    let key = obj.config.id + "_option_" + opt.id;
                    if(allLabelDict[key] !== undefined) {
                        opt.value = allLabelDict[key];
                    }
                });
            }else if(obj.config.view =='checkbox'){
                if(obj.config.label!=undefined){
                    obj.define("label", newLabel);
                }
                if(obj.config.labelRight!=undefined){
                    let valueLabelRight = `${idElement}_labelRight`
                    obj.define("labelRight", allLabelDict[valueLabelRight]);
                }
                if(obj.config.labelLeft!=undefined){
                    let valueLabelLeft = `${idElement}_labelLeft`
                    obj.define("labelLeft", allLabelDict[valueLabelLeft]);
                }
            }else if(obj.config.view === "combo" || obj.config.view === "richselect"){
                obj.define("label", newLabel);
				let list = obj.getList();
				list.data.each(function(item, idx){
					let key = obj.config.id + "_option_" + item['id'];
					if(allLabelDict[key] !== undefined){
						item.value = allLabelDict[key];
						list.updateItem(item.id, item);
					}
				});
			}else{
                if(obj.config.label!=undefined){
                    obj.define("label", newLabel);
                }
            }
            if (obj && typeof obj.refresh === 'function') {
                obj.refresh();
            }
            return;
        }

        // === Button DOM (custom) ===
        let stringLabelButton = dictAllElement[idElement] || "";
        document.querySelectorAll('input.detailCustomButton, button.detailCustomButton').forEach(function(btn){
			if (idElement.includes("__btnDatagrid")) {
				let realId = idElement.replace("__btnDatagrid", "");
				if (realId == btn.getAttribute('id')) {
                    if (btn.tagName == 'INPUT') {
                        btn.value = newLabel;
                        btn.replaceWith(btn.cloneNode(true)); 
                    }else if(btn.tagName == 'BUTTON'){
                        btn.innerHTML = newLabel
                    }
				}
			}else{
				if(btn.value.trim() == stringLabelButton){
	                btn.value = newLabel;
	                btn.replaceWith(btn.cloneNode(true)); // refresh handler
	            }else if(btn.querySelector("span") && btn.querySelector("span").textContent==stringLabelButton){
	                btn.querySelector("span").textContent = newLabel;
	            }
			}
        });

        // === Overlay ===
        if(Object.keys(winActiveOverlay).length!=0){
            Object.keys(winActiveOverlay).forEach(function(idOverlay){
                $$(idOverlay).showOverlay(allLabelDict[winActiveOverlay[idOverlay]]);
            });
        }
    }


    winMultilanguage.old = oldLanguage
    winMultilanguage.target = newLanguage
    if((oldLanguage=='' && newLanguage=='ID') || !window['jsonMultiLanguage_'+menuId] || Object.keys(window["jsonMultiLanguage_"+menuId]).length == 0){
        return restapi.restApiMultiLanguage({"oldLanguage":"", "newLanguage":"ID"}, dictAllElement, dictCore).then(function(resultMultilanguage){
            let result = resultMultilanguage.json()
            window['jsonMultiLanguage_'+menuId] = result['data']
            $$("progressLoadingMultilanguage").hide();
            $$("comboMultiLanguage").enable()
            // $$(menuId).hideProgress();
            Object.keys(tempLanguageForm[newLanguage]).forEach(function(idElement){
                updateLabel(idElement,tempLanguageForm[newLanguage][idElement], tempLanguageForm[newLanguage]);
            });
            return restapi.restApiSetMultiLanguageSession(newLanguage)
        })
    }else{
        $$("progressLoadingMultilanguage").hide();
        $$("comboMultiLanguage").enable()
        Object.keys(tempLanguageForm[newLanguage]).forEach(function(idElement){
            updateLabel(idElement,tempLanguageForm[newLanguage][idElement], tempLanguageForm[newLanguage]);
        });
        return restapi.restApiSetMultiLanguageSession(newLanguage)
    }
}

function translateToLanguage(sourceLang, targetLang, ajaxData, dictCore) {

    ajaxData = Object.assign({}, ajaxData, dictCore);
    // Load existing data from the file
    const languageHistory = window['jsonMultiLanguage_' + menuId] || {};

    if (Object.keys(languageHistory).length === 0) {
        return ajaxData;
    }

    // Initialize result dictionary
    const resultTranslation = {};

    // List of languages in priority order for fallback
    const fallbackLanguages = Object.keys(languageHistory).filter(lang => lang !== sourceLang);

    // Loop through each item in the ajaxData
    for (var key in ajaxData) {
        if (ajaxData.hasOwnProperty(key)) {
            var sourceValue = ajaxData[key];

            // Find the key for the source value in any language
            var keyForValue = null;
            var sourceLangFound = sourceLang;
            
            // Search in the source language first
            for (var k in languageHistory[sourceLang]) {
                if (languageHistory[sourceLang].hasOwnProperty(k) && languageHistory[sourceLang][k] === sourceValue) {
                    keyForValue = k;
                    break;
                }
            }
            
            // If not found in the source language, search in fallback languages
            if (keyForValue === null) {
                for (var i = 0; i < fallbackLanguages.length; i++) {
                    var fallbackLang = fallbackLanguages[i];
                    for (var k in languageHistory[fallbackLang]) {
                        if (languageHistory[fallbackLang].hasOwnProperty(k) && languageHistory[fallbackLang][k] === sourceValue) {
                            keyForValue = k;
                            sourceLangFound = fallbackLang;
                            break;
                        }
                    }
                    if (keyForValue !== null) {
                        break;
                    }
                }
            }

            if (keyForValue !== null) {
                var translatedValue = languageHistory[targetLang][keyForValue];

                if (translatedValue !== undefined && translatedValue !== "") {
                    resultTranslation[key] = translatedValue;
                } else {
                    // If target language has no value, fallback to previous language value
                    var previousValue = languageHistory[sourceLangFound][keyForValue];
                    resultTranslation[key] = previousValue !== undefined && previousValue !== "" ? previousValue : sourceValue;
                }
            } else {
                resultTranslation[key] = sourceValue;  // If keyForValue is not found, return original value from ajaxData
            }
        }
    }

    return resultTranslation;
}


function extendFunction(originalFunction, extension) {
    return function() {
        originalFunction(); // Call the original function
        extension(); // Call the extension function
    };
};

function isWebixPopupOpen() {
    // Check if any Webix popup alerts exist
    var popupAlerts = document.querySelectorAll('.webix_popup.webix_alert, .webix_popup.webix_warning, .webix_popup.webix_info');
    return popupAlerts.length > 0;
}


class Base{
    baseCommonKeyPress(extendOnKeyPress=(function(){}),elementId,searchLike, goBlock, goItem) {
        return (code,e)=>{
            if(searchLike==false){
                if(e.shiftKey && code == 53 ){
                    e.preventDefault()
                }
                if(e.shiftKey && code == 189){
                    e.preventDefault()
                }
            }
            if(code==38){
                let parentId = window.winActiveBlock['focusNow']
                if(parentId==parentId.match(/^\$layout.*$/)){
                    parentId = $$(parentId).getParentView().config.id
                }
                let parentListItem = window.winConfigForm[parentId]['ELEMENT']
                let nowId = webix.UIManager.getFocus().config.id
                let indexNow =  parentListItem.indexOf(nowId)
                let indexPrev = indexNow-1
                let lastIndex = parentListItem.length - 1
                
                let disabledPrevItem = false
                
                if(indexPrev>=0){
                    disabledPrevItem = $$(parentListItem[indexPrev]).config.disableItem || false
                }
                if(indexPrev>=0 && disabledPrevItem==false){
                    webix.UIManager.setFocus($$(parentListItem[indexPrev]))
                }else if(indexPrev>=0 && disabledPrevItem==true){
                    for(let x=indexPrev; x>=0; x--){
                        let disabledItem = $$(parentListItem[x]).config.disableItem || false
                        if(disabledItem==false){
                            webix.UIManager.setFocus($$(parentListItem[x]))
                            break;
                        }
                        if(x==0){
                            for(let x=lastIndex; x>=0; x--){
                                let disabledItem = $$(parentListItem[x]).config.disableItem || false 
                                if(disabledItem==false){
                                    webix.UIManager.setFocus($$(parentListItem[x]))
                                    break;
                                }
                            }
                        }
                    }
                }else if(indexPrev<0){
                    for(let x=lastIndex; x>=0; x--){
                        let disabledItem = $$(parentListItem[x]).config.disableItem || false 
                        if(disabledItem==false){
                            webix.UIManager.setFocus($$(parentListItem[x]))
                            break;
                        }
                    }
                }
                
            }else if(code==40||code==13){
                // if(goBlock==undefined && goItem==undefined){
                let parentId = window.winActiveBlock['focusNow']
                if(parentId==parentId.match(/^\$layout.*$/)){
                    parentId = $$(parentId).getParentView().config.id
                }
                let parentListItem = window.winConfigForm[parentId]['ELEMENT']
                let nowId = webix.UIManager.getFocus().config.id
                let indexNow =  parentListItem.indexOf(nowId)
                let indexNext = indexNow+1
                let lastIndex = parentListItem.length - 1
                
                let disabledNextItem = false
                
                if(indexNext<=lastIndex){
                    disabledNextItem = $$(parentListItem[indexNext]).config.disableItem || false
                }
                if(indexNext<=lastIndex && disabledNextItem==false){
                    webix.UIManager.setFocus($$(parentListItem[indexNext]))
                    checkGoBlockGoItem(goBlock, goItem)
                }else if(indexNext<=lastIndex && disabledNextItem==true){
                    for(let x=indexNext; x<=lastIndex; x++){
                        let disabledItem = $$(parentListItem[x]).config.disableItem || false 
                        if(disabledItem==false){
                            webix.UIManager.setFocus($$(parentListItem[x]))
                            checkGoBlockGoItem(goBlock, goItem)
                            break;
                        }
                    }
                }else if(indexNext>lastIndex){
                    for(let x=0; x<=lastIndex; x++){
                        let disabledItem = $$(parentListItem[x]).config.disableItem || false 
                        if(disabledItem==false){
                            webix.UIManager.setFocus($$(parentListItem[x]))
                            checkGoBlockGoItem(goBlock, goItem)
                            break;
                        }
                    }
                }
                // }else{
                //     if(goBlock!=undefined){
                //         // GO_BLOCK(goBlock)
                //         if(typeof(goBlock)=="function"){
                //             let goBlockId = goBlock()
                //             GO_BLOCK(goBlockId)
                //         }else if(typeof(goBlock)=="string"){
                //             GO_BLOCK(goBlock)
                //         }
                //     }
                //     if(goItem!=undefined){
                //         if(typeof(goItem)=="function"){
                //             let goItemId = goItem()
                //             GO_ITEM(goItemId)
                //         }else if(typeof(goItem)=="string"){
                //             GO_ITEM(goItem)
                //         }
                //     }
                // }
                
            }
            window.winCurrentItem = webix.UIManager.getFocus().config.id
            if(extendOnKeyPress!=undefined){
                extendOnKeyPress(code,e)
            }
            
            
        }
        
    }
    baseWhenValidateItem(validateItem=function(){let promise = new Promise((resolve)=>{resolve({"status":true,"tipe":"error","pesan":"Inputan Salah"})});return promise},extendOnBlur=function(){}){
        return(prev_item)=>{
            if(window.winOpenPopUp=="closed"){
                if(window.winSearchMode==false){
                    if(!winAddRecord && !winNextRecord && !winPrevRecord && !winDeleteRecord && !winSearchRecord && !winClearResetRecord && !winSideBarCursor){
                        let validateFunc = validateItem()
                        validateFunc.then(function(respond){
                            let statusValidate = respond.status
                            let pesanValidate = respond.pesan || ''
                            let tipeValidate = respond.tipe || 'error'
                            if(statusValidate){
                                if(extendOnBlur!=undefined){
                                    extendOnBlur(prev_item)
                                }
                            }else{
                                let actionAlert = function(result){
                                    const fView = webix.UIManager.getFocus()//get the view that is currently focused
                                    if(fView && typeof fView.blockEvent === 'function'){
                                        fView.blockEvent();//prevent continuous event triggering
                                    }
                                    prev_item.focus();//revert focus back to the original view
                                    $$(prev_item).setValue("");//set value ""
                                    if(fView && typeof fView.unblockEvent === 'function'){
                                        fView.unblockEvent();//resume event flow
                                    }
                                };
                                if(!isWebixPopupOpen()){
                                    if (tipeValidate=="info"){
                                        webix.alert(ALERT.ALERTINFO(pesanValidate)).then(actionAlert)
                                    }else if (tipeValidate=="warning"){
                                        webix.alert(ALERT.ALERTWARNING(pesanValidate)).then(actionAlert)
                                    }else if (tipeValidate=="error"){
                                        webix.alert(ALERT.ALERTERROR(pesanValidate)).then(actionAlert)
                                    }else{
                                        webix.alert(ALERT.ALERTERROR(pesanValidate)).then(actionAlert)    
                                    }
                                }
                            }
                        })
                    }
                }else if(window.winSearchMode==true){
                    if(extendOnBlur!=undefined){
                        extendOnBlur(prev_item)
                    }
                }
                
            }
        }

    }
    baseText(property,trigger) {
        let id = property.id
        let label = property.label
        let customWidth = property.customWidth || undefined
        let length = property.length || undefined
        let hideItem = property.hideItem || false
        let extendOnKeyPress = trigger.extendOnKeyPress
        let validateItem = trigger.validateItem
        let extendOnBlur = trigger.extendOnBlur
        let extendOn = trigger.extendOn || {}
        let labelPosition = window.labelPosition || "top"
        let invalidMessage = trigger.invalidMessage || false
        let preItem = trigger.preItem || false
        let searchLike = trigger.SEARCH_LIKE
        let disableItem = property.displayItem || false
        let goItem = trigger.GO_ITEM || undefined
        let goBlock = trigger.GO_BLOCK || undefined
        let base = {
            "id": id, "name": id, "label": label, "view": "text", "disableItem":disableItem, hidden:hideItem,
            "placeholder": label, "labelPosition": labelPosition,"validateItem":validateItem,"attributes":{maxlength:length}, "on": {
                onKeyPress:this.baseCommonKeyPress(extendOnKeyPress,id,searchLike,goBlock,goItem),
                onBlur:this.baseWhenValidateItem(validateItem,extendOnBlur),
                onFocus:function(){
                    let parentViewThisId = getParentViewCustom(id)
                    console.log(5167,parentViewThisId)
                    if(window.winActiveBlock["focusNow"]==""){
                        let activeNow = window.winActiveBlock["focusNow"] = parentViewThisId
                        while($$(activeNow).config.view!="form" && $$(activeNow).config.view!="datatable"){
                            activeNow = $$(activeNow).getParentView().config.id
                        }
                        window.winActiveBlock['focusNow'] = activeNow
                        if(window.winActiveBlock["lastFocus"]!=""){
                            webix.html.removeCss($$(window.winActiveBlock["lastFocus"]).getNode(), "datablock-focus")
                        }
                        webix.html.addCss($$(window.winActiveBlock["focusNow"]).getNode(), "datablock-focus")
                    }else if(window.winActiveBlock["focusNow"]==parentViewThisId){
                        if(preItem!=false){
                            preItem()
                        }
                    }else if(window.winActiveBlock["focusNow"]!=parentViewThisId && $$(window.winActiveBlock["focusNow"]).validate()===true && $$(window.winActiveBlock["focusNow"]).validate()!= ''){
                        window.winActiveBlock["lastFocus"] = window.winActiveBlock["focusNow"]
                        let activeNow = window.winActiveBlock["focusNow"] = parentViewThisId

                        while($$(activeNow).config.view!="form" && $$(activeNow).config.view!="datatable"){
                            activeNow = $$(activeNow).getParentView().config.id
                        }


                        window.winActiveBlock['focusNow'] = activeNow
                        if(window.winActiveBlock["lastFocus"]!=""){
                            webix.html.removeCss($$(window.winActiveBlock["lastFocus"]).getNode(), "datablock-focus")
                        }
                        webix.html.addCss($$(window.winActiveBlock["focusNow"]).getNode(), "datablock-focus")
                    }else if(window.winActiveBlock["focusNow"]!=parentViewThisId && ($$(window.winActiveBlock["focusNow"]).validate()==false||$$(window.winActiveBlock["focusNow"]).validate()=='')){
                        if($$(window.winActiveBlock['focusNow']).config.view == "datatable"){
                            if(!isWebixPopupOpen()){
                                webix.alert(ALERT.ALERTERROR('Validasi Gagal')).then(function(){
                                    window.winActiveCell['view'].editCell(window.winActiveCell['pos']['row'], window.winActiveCell['pos']['column']);
                                })
                            }
                        }
                    }
                    
                    
                },
            },"required":invalidMessage
        }
        Object.assign(base.on, extendOn)
        
        if(window.labelPosition == "left"){
            let calcWidth = Math.max(125, label.length * 8)
            base = Object.assign(base, { labelWidth: calcWidth })
        }

        if(customWidth!=undefined){
            base = Object.assign(base,{width:customWidth, customWidth:customWidth}) 
        }

        if(invalidMessage!=false){
            base.invalidMessage = base.label+" cannot be empty";
        }
        if (disableItem){
            window.winDisplayItem.push(id)
        }
        return base
    }
}

class TextBox extends Base{
    TEXTNORMAL(property,trigger={}){
        let id = property.ITEM_ID
        let label = property.LABEL
        let length = property.LENGTH
        let customWidth = property.CUSTOM_WIDTH || undefined
        let hideItem = property.HIDE || false
        let bottomLabel = property.BOTTOM_LABEL || undefined
        let validateItem = function(){
            let promise = new Promise((resolve)=>{
                if(trigger.VALIDATE_ITEM != undefined){
                    resolve(trigger.VALIDATE_ITEM())
                }
                resolve({"status":true})
            })
            return promise
        }
        let searchlike = trigger.SEARCH_LIKE
        let isPrimaryKey = property.IS_PRIMARY_KEY || false
        let disableItem = property.DISPLAY_ITEM || false
        let upperValue = property.UPPER || false
        let lowerValue = property.LOWER || false
        let extendOnBlur = function(prev){}
        let goBlock = trigger.GO_BLOCK || undefined
        let goItem = trigger.GO_ITEM || undefined
        let customFooterDt = property.CUSTOM_FOOTER || undefined
        // let bottomLabel = '*view only'
        if(lowerValue){
            winLowerText.push(id[0])
            extendOnBlur=function(prev){
                prev.setValue(prev.getValue().toLowerCase())
            }
        }
        if(upperValue){
            winUpperText.push(id[0])
            extendOnBlur=function(prev){
                prev.setValue(prev.getValue().toUpperCase())
            }
        }

        let normal = super.baseText({id:id,label:label,length:length, displayItem:disableItem, hideItem:hideItem, customWidth: customWidth},{validateItem:validateItem,extendOnBlur:extendOnBlur,SEARCH_LIKE:searchlike,GO_BLOCK:goBlock ,GO_ITEM:goItem})
        normal = Object.assign(normal,{upperValue:upperValue, lowerValue:lowerValue, customFooterDt:customFooterDt})
        if(isPrimaryKey){
            normal = Object.assign(normal, {css:"primary_key",cssDt:"primary_cell", readonly:true, isPrimaryKey:true})
            winIsPrimary.push(id)
        }
        if(disableItem){
            normal = Object.assign(normal, {css:"textdisplay",cssDt:"textdisplay", readonly:true})
            winDisplayItem.push(id)
        }

        if(bottomLabel!=undefined){
            if(bottomLabel!=""){
                normal = Object.assign(normal,{bottomLabel:bottomLabel})
            }else{
                normal = Object.assign(normal,{bottomLabel:""})
            }
        }
        
        return normal
    }

    TEXTDISPLAY(property,trigger={}){
        let id = property.ITEM_ID
        let label = property.LABEL
        let length = property.LENGTH
        let customWidth = property.CUSTOM_WIDTH || undefined
        let hideItem = property.HIDE || false
        let bottomLabel = property.BOTTOM_LABEL || undefined
        let validateItem = function(){
            let promise = new Promise((resolve)=>{
                if(trigger.VALIDATE_ITEM != undefined){
                    resolve(trigger.VALIDATE_ITEM())
                }
                resolve({"status":true})
            })
            return promise
        }
        let formatDate = property.FORMAT_DATE  || false
        let customFooterDt = property.CUSTOM_FOOTER || undefined
        let extendOn = {}
        if(formatDate){
            extendOn = {
                onChange:function(newValue){
                    let value = newValue.split("-")
                }
            }
        }
        let itemDisplay = super.baseText({id:id,label:label,length:length, displayItem:true, hideItem:hideItem, customWidth: customWidth},{validateItem:validateItem, extendOn:extendOn})
        itemDisplay = Object.assign(itemDisplay, {css: 'textdisplay',jenis:"display",readonly:true, customFooterDt:customFooterDt,disableItem:true}) 
        // itemDisplay.disabled = "true"
        winDisplayItem.push(id)

        if(bottomLabel!=undefined){
            if(bottomLabel!=""){
                itemDisplay = Object.assign(itemDisplay,{bottomLabel:bottomLabel})
            }else{
                itemDisplay = Object.assign(itemDisplay,{bottomLabel:""})
            }
        }

        return itemDisplay
    }

    TEXTUPPER(property,trigger={}){
        let id = property.ITEM_ID
        let label = property.LABEL
        let length = property.LENGTH
        let customWidth = property.CUSTOM_WIDTH || undefined
        let hideItem = property.HIDE || false
        let bottomLabel = property.BOTTOM_LABEL || undefined
        let validateItem = function(){
            let promise = new Promise((resolve)=>{
                if(trigger.VALIDATE_ITEM != undefined){
                    resolve(trigger.VALIDATE_ITEM())
                }
                resolve({"status":true})
            })
            return promise
        }
        let searchlike = trigger.SEARCH_LIKE
        let disableItem = property.DISPLAY_ITEM || false
        let isPrimaryKey = property.IS_PRIMARY_KEY || false
        let upperValue = true
        let goBlock = trigger.GO_BLOCK || undefined
        let goItem = trigger.GO_ITEM || undefined
        let customFooterDt = property.CUSTOM_FOOTER || undefined
        let extendOnBlur=function(prev){
            prev.setValue(prev.getValue().toUpperCase())
        }
        let upper = super.baseText({id:id,label:label,length:length,displayItem:disableItem, hideItem:hideItem, customWidth: customWidth},{validateItem:validateItem,extendOnBlur:extendOnBlur,SEARCH_LIKE:searchlike,GO_BLOCK:goBlock ,GO_ITEM:goItem})
        upper = Object.assign(upper, {jenis:"upperText"})
        if(isPrimaryKey){
            upper = Object.assign(upper,{css:"primary_key",cssDt:"primary_cell", readonly:true, jenis:"upperText", isPrimaryKey:true})
            winIsPrimary.push(id)
        }
        upper = Object.assign(upper, {upperValue:upperValue, customFooterDt:customFooterDt})
        winUpperText.push(id)
        if(disableItem){
            upper = Object.assign(upper,{css:"textdisplay", readonly:true, jenis:"upperText"})
            winDisplayItem.push(id)
        }

        if(bottomLabel!=undefined){
            if(bottomLabel!=""){
                upper = Object.assign(upper,{bottomLabel:bottomLabel})
            }else{
                upper = Object.assign(upper,{bottomLabel:""})
            }
        }

        return upper
    }

    TEXTLOWER(property,trigger={}){
        let id = property.ITEM_ID
        let label = property.LABEL
        let length = property.LENGTH
        let customWidth = property.CUSTOM_WIDTH || undefined
        let hideItem = property.HIDE || false
        let bottomLabel = property.BOTTOM_LABEL || undefined
        let validateItem = function(){
            let promise = new Promise((resolve)=>{
                if(trigger.VALIDATE_ITEM != undefined){
                    resolve(trigger.VALIDATE_ITEM())
                }
                resolve({"status":true})
            })
            return promise
        }
        let searchlike = trigger.SEARCH_LIKE
        let disableItem = property.DISPLAY_ITEM || false
        let isPrimaryKey = property.IS_PRIMARY_KEY || false
        let lowerValue = true
        let goBlock = trigger.GO_BLOCK || undefined
        let goItem = trigger.GO_ITEM || undefined
        let customFooterDt = property.CUSTOM_FOOTER || undefined
        let extendOnBlur=function(prev){
            prev.setValue(prev.getValue().toLowerCase())
        }
        let lower = super.baseText({id:id,label:label,length:length, displayItem:disableItem, hideItem:hideItem, customWidth: customWidth},{validateItem:validateItem,extendOnBlur:extendOnBlur,SEARCH_LIKE:searchlike,GO_BLOCK:goBlock ,GO_ITEM:goItem})
        lower = Object.assign(lower, {jenis:"lowerText"})
        if(isPrimaryKey){
            lower = Object.assign(lower, {css:"primary_key",cssDt:"primary_cell", readonly:true, jenis:"lowerText", isPrimaryKey:true})
            winIsPrimary.push(id)
        }
        lower = Object.assign(lower, {lowerValue:lowerValue, customFooterDt:customFooterDt})
        winLowerText.push(id)
        if(disableItem){
            lower = Object.assign(lower,{css:"textdisplay", readonly:true, jenis:"lowerText"})
            winDisplayItem.push(id)
        }

        if(bottomLabel!=undefined){
            if(bottomLabel!=""){
                lower = Object.assign(lower,{bottomLabel:bottomLabel})
            }else{
                lower = Object.assign(lower,{bottomLabel:""})
            }
        }

        return lower
    }

    TEXTAREA(property,trigger={}){
        let id = property.ITEM_ID
        let label = property.LABEL
        let length = property.LENGTH
        let customWidth = property.CUSTOM_WIDTH || undefined
        let hideItem = property.HIDE || false
        let bottomLabel = property.BOTTOM_LABEL || undefined
        let validateItem = function(){
            let promise = new Promise((resolve)=>{
                if(trigger.VALIDATE_ITEM != undefined){
                    resolve(trigger.VALIDATE_ITEM())
                }
                resolve({"status":true})
            })
            return promise
        }
        let preItem = trigger.preItem || undefined
        let searchlike = trigger.SEARCH_LIKE
        let disableItem = property.DISPLAY_ITEM || false
        let extendOnBlur = function(prev){}
        let upperValue = property.UPPER || false
        let lowerValue = property.LOWER || false
        let goBlock = trigger.GO_BLOCK || undefined
        let goItem = trigger.GO_ITEM || undefined
        let customHeight = property.HEIGHT || undefined
        let customFooterDt = property.CUSTOM_FOOTER || undefined
        if(lowerValue){
            winLowerText.push(id[0])
            extendOnBlur=function(prev){
                prev.setValue(prev.getValue().toLowerCase())
            }
        }
        if(upperValue){
            winUpperText.push(id[0])
            extendOnBlur=function(prev){
                prev.setValue(prev.getValue().toUpperCase())
            }
        }

        function setHeight(customheight){
            let setCustomHeight = 100
            if(customHeight!=undefined){
                setCustomHeight = customHeight
            }
            return setCustomHeight
        }

        let area = super.baseText({id:id,label:label,length:length, displayItem:disableItem, hideItem:hideItem, customWidth: customWidth},{validateItem:validateItem,extendOnBlur:extendOnBlur,SEARCH_LIKE:searchlike,GO_BLOCK:goBlock ,GO_ITEM:goItem})
        area = Object.assign(area, {view:"textarea", height:setHeight(customHeight),jenis:"textarea", 
        on:{
            onKeyPress:function(){},
            onBlur:base.baseWhenValidateItem(validateItem,extendOnBlur),
            onFocus:function(){
                let parentViewThisId = getParentViewCustom(id)
                if(window.winActiveBlock["focusNow"]==""){
                    
                    window.winActiveBlock['focusNow'] = parentViewThisId
                    webix.html.addCss($$(window.winActiveBlock["focusNow"]).getNode(), "datablock-focus")
                }else if(window.winActiveBlock["focusNow"]==$$(id).getParentView().config.id){
                    if(preItem!=undefined){
                        preItem()
                    }
                }else if(window.winActiveBlock["focusNow"]!=$$(id).getParentView().config.id && $$(window.winActiveBlock["focusNow"]).validate()===true && $$(window.winActiveBlock["focusNow"]).validate()!= ''){
                    
                    window.winActiveBlock["lastFocus"] = window.winActiveBlock["focusNow"]

                    if($$(this.getParentView().config.id).config.view == "form"){
                        window.winActiveBlock['focusNow'] = this.getParentView().config.id
                        webix.html.removeCss($$(window.winActiveBlock["lastFocus"]).getNode(), "datablock-focus")
                    }else{
                        window.winActiveBlock['focusNow'] = parentViewThisId
                        if(window.winActiveBlock["lastFocus"]!=""){
                            webix.html.removeCss($$(window.winActiveBlock["lastFocus"]).getNode(), "datablock-focus")
                        }
                    }

                    webix.html.addCss($$(window.winActiveBlock["focusNow"]).getNode(), "datablock-focus")
                }else if(window.winActiveBlock["focusNow"]!=$$(id).getParentView().config.id && ($$(window.winActiveBlock["focusNow"]).validate()==false||$$(window.winActiveBlock["focusNow"]).validate()=='')){
                    if($$(window.winActiveBlock['focusNow']).config.view == "datatable"){
                        if(!isWebixPopupOpen()){
                            webix.alert(ALERT.ALERTERROR('Validasi Gagal')).then(function(){
                                window.winActiveCell['view'].editCell(window.winActiveCell['pos']['row'], window.winActiveCell['pos']['column']);
                            })
                        }
                    }
                }
                
                
            },
        }})
        area = Object.assign(area, {view:"textarea",jenis:"textarea", upperValue:upperValue, lowerValue,lowerValue, customFooterDt:customFooterDt})

        if(disableItem){
            area = Object.assign(area,{css:"textdisplay", readonly:true, jenis:"textarea"})
            winDisplayItem.push(id)
        }

        if(bottomLabel!=undefined){
            if(bottomLabel!=""){
                area = Object.assign(area,{bottomLabel:bottomLabel})
            }else{
                area = Object.assign(area,{bottomLabel:""})
            }
        }

        return area
    }

    TEXTPRIMARY(property,trigger={}){
        let id = property.ITEM_ID
        let label = property.LABEL
        let length = property.LENGTH
        let customWidth = property.CUSTOM_WIDTH || undefined
        let hideItem = property.HIDE || false
        let bottomLabel = property.BOTTOM_LABEL || undefined
        let validateItem = function(){
            let promise = new Promise((resolve)=>{
                if(trigger.VALIDATE_ITEM != undefined){
                    resolve(trigger.VALIDATE_ITEM())
                }
                resolve({"status":true})
            })
            return promise
        }
        let searchlike = trigger.SEARCH_LIKE
        let upperValue = property.UPPER || false
        let lowerValue = property.LOWER || false
        let disableItem = property.DISPLAY_ITEM || false
        let goBlock = trigger.GO_BLOCK || undefined
        let goItem = trigger.GO_ITEM || undefined
        let extendOnBlur = function(prev){}
        let customFooterDt = property.CUSTOM_FOOTER || undefined
        if(lowerValue){
            extendOnBlur=function(prev){
                prev.setValue(prev.getValue().toLowerCase())
            }
        }else if(upperValue){
            extendOnBlur=function(prev){
                prev.setValue(prev.getValue().toUpperCase())
            }
        }
        let primary = super.baseText({id:id,label:label,length:length, displayItem:disableItem, hideItem:hideItem, customWidth: customWidth},{validateItem:validateItem,extendOnBlur:extendOnBlur,SEARCH_LIKE:searchlike,GO_BLOCK:goBlock ,GO_ITEM:goItem})
        primary = Object.assign(primary, {css:"primary_key",cssDt:"primary_cell", readonly:true, isPrimaryKey:true, upperValue:upperValue, lowerValue,lowerValue, customFooterDt:customFooterDt})
        winIsPrimary.push(id)
        if(disableItem){
            primary = Object.assign(primary,{css:"primary_key", readonly:true})
            winDisplayItem.push(id)
        }
        if(bottomLabel!=undefined){
            if(bottomLabel!=""){
                primary = Object.assign(primary,{bottomLabel:bottomLabel})
            }else{
                primary = Object.assign(primary,{bottomLabel:""})
            }
        }
        return primary
    }
    
    // TEXTPRIMARYDEFAULT(property,trigger={}){
    //     let id = property.ITEM_ID
    //     let label = property.LABEL
    //     let length = property.LENGTH
    //     let validateItem = function(){
    //     let extendOn = {
    //         onFocus:function(){
    //             webix.html.addCss($$($$(this.getParentView().config.id).config.id).getParentView().getNode(), "datablock-focus")
    //             window.winActiveBlock['lastFocus'] = window.winActiveBlock['focusNow']
    //             let activeNow = $$($$(this.getParentView().config.id).config.id).getParentView().config.id
    //             if(activeNow==activeNow.match(/^\$layout.*$/)){
    //                 activeNow = $$(activeNow).getParentView().config.id
    //             }
    //             window.winActiveBlock['focusNow'] = activeNow
    //         }
    //     }

    //     let primary = super.baseText({id:id[0],label:label[0],length:length},{validateItem:validateItem, extendOn:extendOn})
    //     primary = {...primary,...{css:"primary_key"}}
    //     let primaryView = {
    //         cols:[
    //                 primary,
    //                 { view:"text",name:id[1],label:label[1],disabled:true,readonly:true,jenis:"display",displayItem:true,"labelPosition": "top", id:id[1], name:id[1]}
    //         ]
    //     }
    //     return primaryView
    // }
}

class LOV extends Base {
    TEXTLOVMULTICOLS(property,trigger={}){
        let id = property.ITEM_ID
        let label = property.LABEL
        let idLov = property.WINDOW_ID
        let totalCols = property.TOTAL_COLS
        let length = property.LENGTH
        let customWidth = property.CUSTOM_WIDTH || undefined
        let hideItem = property.HIDE || false
        let bottomLabel = property.BOTTOM_LABEL || undefined
        let validateItem = function(){
            let promise = new Promise((resolve)=>{
                if(trigger.VALIDATE_ITEM != undefined){
                    resolve(trigger.VALIDATE_ITEM())
                }
                resolve({"status":true})
            })
            return promise
        }
        let preItem = trigger.PRE_ITEM || undefined
        let idParam = property.ID_PARAM || ""
        let restApiLov = trigger.REST_API || ""
        let searchlike = trigger.SEARCH_LIKE
        let statusPreItem = false
        let upperValue = property.UPPER || false
        let lowerValue = property.LOWER || false
        let numericOnly = property.NUMERIC_ONLY || false
        let isPrimary = property.IS_PRIMARY_KEY || false
        let goBlock = trigger.GO_BLOCK || undefined
        let goItem = trigger.GO_ITEM || undefined
        let isDate = property.ID_DATE_TYPE || []
        let customFooterDt = property.CUSTOM_FOOTER || undefined
        let alignRight = property.ALIGN_RIGHT || undefined

        let extendOnKeyPress=function(code,e){
            if ( code == 119 ) { // f8
                if(!isPrimary){
                    window.winOpenPopUp = "open";
                    $$( idLov ).show();
                }else{
                    if(winAddData || winSearchMode){
                        window.winOpenPopUp = "open";
                        $$( idLov ).show();
                    }
                }
            }
            
            if (numericOnly){
                if(e.ctrlKey==false){
                    if ((code < 48 || code > 57) && code != 190 && code!=8 && code!=9 && code!=13 && code!=37 && code!=39 && code != 119) {
                        e.preventDefault()
                    }
                }
            }
        }

        let extendOnBlur = function(prev){
            //console.log(isDate)
            // if(isDate != []){
            //     //console.log("masuk")
            //     isDate.forEach(function(itemId){
            //         let newValue = $$(itemId).getValue()
            //         let hasil = cekDate(newValue, "DD-MM-YYYY");
            //         $$(itemId).setValue(hasil)
            //     })
            // }
        }

        let extendOn = {
            onSearchIconClick:function(e){
                if(!isPrimary){
                    if(lovPopUp && preItem==undefined){
                        let focusId = this.getParentView().config.id
                        while(focusId==focusId.match(/^\$layout.*$/)){
                            focusId = $$(focusId).getParentView().config.id
                            if(focusId!=focusId.match(/^\$layout.*$/)){
                                if($$(focusId).config.view!="form" && $$(focusId).config.view!="datatable"){
                                    focusId = $$(focusId).getParentView().config.id
                                }
                            }
                        }
                        window.winActiveBlock['focusNow'] = focusId
                        window.winOpenPopUp = "open";
                        $$( idLov ).show();
                    }else if(lovPopUp){
                        this.config.statusPreItem = preItem()
                        if (this.config.statusPreItem){
                            let focusId = this.getParentView().config.id
                            while(focusId==focusId.match(/^\$layout.*$/)){
                                focusId = $$(focusId).getParentView().config.id
                                if(focusId!=focusId.match(/^\$layout.*$/)){
                                    if($$(focusId).config.view!="form" && $$(focusId).config.view!="datatable"){
                                        focusId = $$(focusId).getParentView().config.id
                                    }
                                }
                            }
                            window.winActiveBlock['focusNow'] = focusId
                            window.winOpenPopUp = "open";
                            $$( idLov ).show();
                        }
                    }
                }else{
                    if(winAddData || winSearchMode){
                        if(lovPopUp && preItem==undefined){
                            let focusId = this.getParentView().config.id
                            while(focusId==focusId.match(/^\$layout.*$/)){
                                focusId = $$(focusId).getParentView().config.id
                                if(focusId!=focusId.match(/^\$layout.*$/)){
                                    if($$(focusId).config.view!="form" && $$(focusId).config.view!="datatable"){
                                        focusId = $$(focusId).getParentView().config.id
                                    }
                                }
                            }
                            window.winActiveBlock['focusNow'] = focusId
                            window.winOpenPopUp = "open";
                            $$( idLov ).show();
                        }else if(lovPopUp){
                            if (this.config.statusPreItem){
                                let focusId = this.getParentView().config.id
                                while(focusId==focusId.match(/^\$layout.*$/)){
                                    focusId = $$(focusId).getParentView().config.id
                                    if(focusId!=focusId.match(/^\$layout.*$/)){
                                        if($$(focusId).config.view!="form" && $$(focusId).config.view!="datatable"){
                                            focusId = $$(focusId).getParentView().config.id
                                        }
                                    }
                                }
                                window.winActiveBlock['focusNow'] = focusId
                                window.winOpenPopUp = "open";
                                $$( idLov ).show();
                            }
                        }
                    }
                }
            },
            onFocus:function(){
                if(preItem!=undefined){
                    this.config.statusPreItem = preItem()
                }else{
                    lovPopUp = true
                }
                window.winActiveBlock['lastFocus'] = window.winActiveBlock['focusNow']
                let focusId = this.getParentView().config.id
                while(focusId==focusId.match(/^\$layout.*$/)){
                    focusId = $$(focusId).getParentView().config.id
                    if(focusId!=focusId.match(/^\$layout.*$/)){
                        if($$(focusId).config.view!="form" && $$(focusId).config.view!="datatable"){
                            focusId = $$(focusId).getParentView().config.id
                        }
                    }
                }
                window.winActiveBlock['focusNow'] = focusId
                if(window.winActiveBlock["lastFocus"]!="" && window.winActiveBlock["lastFocus"]!=window.winActiveBlock['focusNow']){
                    webix.html.removeCss($$(window.winActiveBlock["lastFocus"]).getNode(), "datablock-focus")
                }
                webix.html.addCss($$(winActiveBlock['focusNow']).getNode(), "datablock-focus")
                // window.winActiveBlock['lastFocus'] = $$()

                if(lovPopUp){
                    webix.UIManager.removeHotKey("ctrl+l", null, this);
                    webix.UIManager.addHotKey("ctrl+l", function(view,e){
                        if(!isPrimary){
                            window.winOpenPopUp = "open";
                            e.preventDefault()
                            $$( idLov ).show();
                        }else{
                            if(winAddData || winSearchMode){
                                window.winOpenPopUp = "open";
                                e.preventDefault()
                                $$( idLov ).show();
                            }
                        }
                    },this)
                }
                
            },
            onChange:function(newValue,oldValue, config){
                if (idParam != ""){
                    if(typeof idParam=="string"){
                        $$(idParam).setValue("")
                        $$(idParam).refresh()
                    }else if(typeof idParam=="object"){
                        idParam.forEach(function(id){
                            $$(id).setValue("")
                            $$(id).refresh()
                        })
                    }
                }
            }
        }
        
        if(lowerValue){
            winLowerText.push(id[0])
            extendOnBlur=function(prev){
                prev.setValue(prev.getValue().toLowerCase())
                if(isDate != []){
                    //console.log("masuk")
                    // isDate.forEach(function(itemId){
                    //     let newValue = $$(itemId).getValue()
                    //     let hasil = cekDate(newValue, "DD-MM-YYYY");
                    //     $$(itemId).setValue(hasil)
                    // })
                }
            }
        }
        if(upperValue){
            winUpperText.push(id[0])
            extendOnBlur=function(prev){
                //console.log(prev, isDate)
                prev.setValue(prev.getValue().toUpperCase())
                if(isDate != []){
                    // isDate.forEach(function(itemId){
                    //     let newValue = $$(itemId).getValue()
                    //     let hasil = cekDate(newValue, "DD-MM-YYYY");
                    //     $$(itemId).setValue(hasil)
                    // })
                }
            }
        }
        let firstLov = super.baseText({id:id[0], label:label[0], length:length, hideItem:hideItem, customWidth: customWidth}, {extendOnKeyPress:extendOnKeyPress,validateItem:validateItem, extendOn:extendOn,extendOnBlur:extendOnBlur,SEARCH_LIKE:searchlike,GO_BLOCK:goBlock ,GO_ITEM:goItem})
        firstLov = Object.assign(firstLov, {statusPreItem:statusPreItem, view:"search",  css:"lov", cssDt:"lov_cell", jenis:"lov", idWd:idLov, restApiLov:restApiLov, upperValue:upperValue, lowerValue:lowerValue, numericOnly:numericOnly, preItem:preItem,customFooterDt:customFooterDt})
        if(isPrimary){
            firstLov = Object.assign(firstLov, {statusPreItem:statusPreItem, view:"search",  css:"lov", cssDt:"lov_cell", jenis:"lov", idWd:idLov, restApiLov:restApiLov, upperValue:upperValue, lowerValue:lowerValue, numericOnly:numericOnly, readonly:true,isPrimaryKey:true})
            winIsPrimary.push(id[0])
        }

        if(isDate != []){
            firstLov = Object.assign(firstLov, {statusPreItem:statusPreItem, view:"search",  css:"lov", cssDt:"lov_cell", jenis:"lov", idWd:idLov, restApiLov:restApiLov, upperValue:upperValue, lowerValue:lowerValue, numericOnly:numericOnly, formatJenis : "DD-MM-YYYY"})
            
        }

        if(bottomLabel!=undefined){
            if(bottomLabel!=""){
                firstLov = Object.assign(firstLov,{bottomLabel:bottomLabel})
            }else{
                firstLov = Object.assign(firstLov,{bottomLabel:" "})
            }
        }
        
        let lovView = generateElementColsLov(id,label,totalCols,firstLov,isDate, hideItem, alignRight)
        return lovView   
    }
}

window.winCurrency = []
class Numeric extends Base{
    NUMERICNORMAL(property,trigger={}) {
        let id = property.ITEM_ID
        let label = property.LABEL
        let length = property.LENGTH
        let customWidth = property.CUSTOM_WIDTH || undefined
        let hideItem = property.HIDE || false
        let validateItem = function(){
            let promise = new Promise((resolve)=>{
                if(trigger.VALIDATE_ITEM != undefined){
                    resolve(trigger.VALIDATE_ITEM())
                }
                resolve({"status":true})
            })
            return promise
        }
        let disableItem = property.DISPLAY_ITEM || false
        let isPrimaryKey = property.IS_PRIMARY_KEY || false
        let goBlock = trigger.GO_BLOCK || undefined
        let goItem = trigger.GO_ITEM || undefined
        let customFooterDt = property.CUSTOM_FOOTER || undefined
        let bottomLabel = property.BOTTOM_LABEL || "* Number only"
        let tooltip = property.HOVER_TEXT || "* Number only"
        let alignRight = property.ALIGN_RIGHT || undefined
        let extendOnKeyPress=function(code,e){
            if(e.ctrlKey==false){
                if (e.shiftKey ||(code < 48 || code > 57) && code != 190 && code!=8 && code!=9 && code!=13 && code!=37 && code!=39 && code!=189) {
                    e.preventDefault()
                }
            }
        }
        let extendOn = {
            onFocus:function(){
                let parentViewThisId = getParentViewCustom(id)
                if(window.winActiveBlock["focusNow"]==""){
                    window.winActiveBlock["focusNow"] = parentViewThisId
                    webix.html.addCss($$(window.winActiveBlock["focusNow"]).getNode(), "datablock-focus")
                }else if(window.winActiveBlock["focusNow"]==parentViewThisId){
                    // if(preItem!=false){
                    //     preItem()
                    // } 
                }else if(window.winActiveBlock["focusNow"]!=parentViewThisId && $$(window.winActiveBlock["focusNow"]).validate()===true && $$(window.winActiveBlock["focusNow"]).validate()!= ''){
                    window.winActiveBlock["lastFocus"] = window.winActiveBlock["focusNow"]
                    let activeNow = window.winActiveBlock["focusNow"] = parentViewThisId
                    while($$(activeNow).config.view!="form" && $$(activeNow).config.view!="datatable"){
                        activeNow = $$(activeNow).getParentView().config.id
                    }
                    window.winActiveBlock['focusNow'] = activeNow
                    if(window.winActiveBlock["lastFocus"]!=""){
                        webix.html.removeCss($$(window.winActiveBlock["lastFocus"]).getNode(), "datablock-focus")
                    }
                    webix.html.addCss($$(window.winActiveBlock["focusNow"]).getNode(), "datablock-focus")
                }else if(window.winActiveBlock["focusNow"]!=parentViewThisId && ($$(window.winActiveBlock["focusNow"]).validate()==false||$$(window.winActiveBlock["focusNow"]).validate()=='')){
                    if($$(window.winActiveBlock['focusNow']).config.view == "datatable"){
                        if(!isWebixPopupOpen()){
                            webix.alert(ALERT.ALERTERROR('Validasi Gagal')).then(function(){
                                window.winActiveCell['view'].editCell(window.winActiveCell['pos']['row'], window.winActiveCell['pos']['column']);
                            })
                        }
                    }
                }
                

                let a = this.getValue()
                if(a!=null && a!=""){   
                    this.setValue(parseInt(a))
                }
            },
            onChange:function(newValue){
                let a = newValue
                if(a!="" && a!=null){
                    this.setValue(parseInt(a))
                }else{
                    $$(id).setValue("")
                }
            }
        }
        let extendOnBlur = function(prev_item){
            let a = $$(prev_item.config.id).getValue()
            if(a!="" && a!=null){
                $$(prev_item.config.id).setValue(parseInt(a))
            }else{
                $$(prev_item.config.id).setValue("")
            }
        }
        // let textNumeric =  super.baseText({id:id,label:label,length:length, displayItem:disableItem},{validateItem:validateItem, GO_BLOCK:goBlock,GO_ITEM:goItem}) validateItem:validateItem,extendOnBlur:extendOnBlur,extendOnKeyPress:extendOnKeyPress,extendOn:extendOn,GO_BLOCK:goBlock ,GO_ITEM:goItem
        // textNumeric = {...textNumeric,...{jenis:"number", pattern:{ mask:maxMask("number",length), allow:/[0-9]/g}}}
        let textNumeric =  super.baseText({id:id,label:label,length:length, displayItem:disableItem, hideItem:hideItem, customWidth: customWidth},{extendOnKeyPress:extendOnKeyPress,extendOnBlur:extendOnBlur,validateItem:validateItem, extendOn:extendOn, GO_BLOCK:goBlock,GO_ITEM:goItem})
        textNumeric = Object.assign(textNumeric, {jenis:"number",customFooterDt:customFooterDt, bottomLabel:bottomLabel, tooltip:tooltip})
        if(isPrimaryKey){
            textNumeric = Object.assign(textNumeric, {css:"primary_key",cssDt:"primary_cell", readonly:true, jenis:"number", isPrimaryKey:true})
            winIsPrimary.push(id)
        }
        if(disableItem){
            textNumeric = Object.assign(textNumeric, {css:"textdisplay",cssDt:"textdisplay", readonly:true, jenis:"number", bottomLabel:'*view only'})
            winDisplayItem.push(id)
        }
        if(alignRight){
            textNumeric = Object.assign(textNumeric, {inputAlign:"right"})
        }
        return textNumeric
    }

    TELEPHONE(property,trigger={}) {
        let id = property.ITEM_ID
        let label = property.LABEL
        let length = property.LENGTH
        let customWidth = property.CUSTOM_WIDTH || undefined
        let hideItem = property.HIDE || false
        let validateItem = function(){
            let promise = new Promise((resolve)=>{
                if(trigger.VALIDATE_ITEM != undefined){
                    resolve(trigger.VALIDATE_ITEM())
                }
                resolve({"status":true})
            })
            return promise
        }
        let disableItem = property.DISPLAY_ITEM || false
        let goBlock = trigger.GO_BLOCK || undefined
        let goItem = trigger.GO_ITEM || undefined
        let extendOnKeyPress=function(code,e){
            if(e.ctrlKey==false){
                if (e.shiftKey ||(code < 48 || code > 57) && code!=8 && code!=9 && code!=13 && code!=37 && code!=39 && code!=189 && code!=187) { //numeric  .     
                    e.preventDefault()
                }
            }
        }
        let telephone =  super.baseText({id:id,label:label,length:length, displayItem:disableItem, hideItem:hideItem, customWidth: customWidth},{extendOnKeyPress:extendOnKeyPress,validateItem:validateItem,GO_BLOCK:goBlock ,GO_ITEM:goItem})
        telephone = Object.assign(telephone,{jenis:"telephone"})

        if(disableItem){
            telephone = Object.assign(telephone, {css:"textdisplay",cssDt:"textdisplay", readonly:true, jenis:"telephone", bottomLabel:'*view only'})
            winDisplayItem.push(id)
        }
        return telephone
    }

    FLOAT(property,trigger={}) {
        let id = property.ITEM_ID
        let label = property.LABEL
        let length = property.LENGTH
        let customWidth = property.CUSTOM_WIDTH || undefined
        let hideItem = property.HIDE || false
        let validateItem = function(){
            let promise = new Promise((resolve)=>{
                if(trigger.VALIDATE_ITEM != undefined){
                    resolve(trigger.VALIDATE_ITEM())
                }
                resolve({"status":true})
            })
            return promise
        }
        let disableItem = property.DISPLAY_ITEM || false
        let isPrimaryKey = property.IS_PRIMARY_KEY || false
        let customFooterDt = property.CUSTOM_FOOTER || undefined
        let goBlock = trigger.GO_BLOCK || undefined
        let goItem = trigger.GO_ITEM || undefined
        let bottomLabel = property.BOTTOM_LABEL || "* Number only (float)"
        let tooltip = property.HOVER_TEXT || "* Number only (float)"
        let alignRight = property.ALIGN_RIGHT || undefined
        let extendOnKeyPress=function(code,e){
            if(e.ctrlKey==false){
                if (e.shiftKey ||(code < 48 || code > 57) && code != 190 && code!=8 && code!=9 && code!=13 && code!=37 && code!=39) {
                    e.preventDefault()
                }
            }
        } 
        
        let extendOnBlur = function(prev_item){
            let a = $$(prev_item.config.id).getValue()
            if(a!=""){
                if(a.includes('.')){
                    let numbers = a.split(".")
                    $$(prev_item.config.id).setValue(numbers[0]+'.'+numbers[1])
                }else{
                    $$(prev_item.config.id).setValue(a+'.0')
                }
            }else{
                $$(prev_item.config.id).setValue("")
            }
        }
        let textFloat =  super.baseText({id:id,label:label,length:length, displayItem:disableItem, hideItem:hideItem, customWidth: customWidth},{extendOnBlur:extendOnBlur,extendOnKeyPress:extendOnKeyPress,validateItem:validateItem,GO_BLOCK:goBlock ,GO_ITEM:goItem})
        textFloat = Object.assign(textFloat, {jenis:"float", customFooterDt:customFooterDt, bottomLabel:bottomLabel, tooltip:tooltip})
        if(isPrimaryKey){
            textFloat = Object.assign(textFloat, {css:"primary_key",cssDt:"primary_cell", readonly:true, jenis:"float", isPrimaryKey:true})
            winIsPrimary.push(id)
        }
        window.winFloatData.push(id)
        if(disableItem){
            textFloat = Object.assign(textFloat, {css:"textdisplay",cssDt:"textdisplay", readonly:true, jenis:"float", bottomLabel:'*view only'})
            winDisplayItem.push(id)
        }
        if(alignRight){
            textFloat = Object.assign(textFloat, {inputAlign:"right"})
        }
        return textFloat
    }

    CURRENCY(property,trigger={}){
        let id = property.ITEM_ID
        let label = property.LABEL
        let length = property.LENGTH
        let currencyCode = property.CURRENCY_CODE || "IDR"
        let customWidth = property.CUSTOM_WIDTH || undefined
        let hideItem = property.HIDE || false
        let validateItem = function(){
            let promise = new Promise((resolve)=>{
                if(trigger.VALIDATE_ITEM != undefined){
                    resolve(trigger.VALIDATE_ITEM())
                }
                resolve({"status":true})
            })
            return promise
        }
        let disableItem = property.DISPLAY_ITEM || false
        let customFooterDt = property.CUSTOM_FOOTER || undefined
        let goBlock = trigger.GO_BLOCK || undefined
        let goItem = trigger.GO_ITEM || undefined
        let bottomLabel = property.BOTTOM_LABEL || "* Number only"
        let tooltip = property.HOVER_TEXT || "* Number only"
        let alignRight = property.ALIGN_RIGHT || undefined
        let extendOnKeyPress=function(code,e){
            if(e.ctrlKey==false){
                if (e.shiftKey ||(code < 48 || code > 57) && code != 190 && code!=8 && code!=9 && code!=13 && code!=37 && code!=39) {
                    e.preventDefault()
                }
            }
        }
        let extendOn = {
            onFocus:function(){
                let parentViewThisId = getParentViewCustom(id)
                if(window.winActiveBlock["focusNow"]==""){
                    window.winActiveBlock["focusNow"] = parentViewThisId
                    webix.html.addCss($$(window.winActiveBlock["focusNow"]).getNode(), "datablock-focus")
                }else if(window.winActiveBlock["focusNow"]==parentViewThisId){
                    // if(preItem!=false){
                    //     preItem()
                    // } 
                }else if(window.winActiveBlock["focusNow"]!=parentViewThisId && $$(window.winActiveBlock["focusNow"]).validate()===true && $$(window.winActiveBlock["focusNow"]).validate()!= ''){
                    window.winActiveBlock["lastFocus"] = window.winActiveBlock["focusNow"]
                    let activeNow = window.winActiveBlock["focusNow"] = parentViewThisId
                    while($$(activeNow).config.view!="form" && $$(activeNow).config.view!="datatable"){
                        activeNow = $$(activeNow).getParentView().config.id
                    }
                    window.winActiveBlock['focusNow'] = activeNow
                    if(window.winActiveBlock["lastFocus"]!=""){
                        webix.html.removeCss($$(window.winActiveBlock["lastFocus"]).getNode(), "datablock-focus")
                    }
                    webix.html.addCss($$(window.winActiveBlock["focusNow"]).getNode(), "datablock-focus")
                }else if(window.winActiveBlock["focusNow"]!=parentViewThisId && ($$(window.winActiveBlock["focusNow"]).validate()==false||$$(window.winActiveBlock["focusNow"]).validate()=='')){
                    if($$(window.winActiveBlock['focusNow']).config.view == "datatable"){
                        if(!isWebixPopupOpen()){
                            webix.alert(ALERT.ALERTERROR('Validasi Gagal')).then(function(){
                                window.winActiveCell['view'].editCell(window.winActiveCell['pos']['row'], window.winActiveCell['pos']['column']);
                            })
                        }
                    }
                }
                

                let a = this.getValue()
                if(a!=null && a!=""){
                    a = a.replace(/[^\d,-]/g, "").replace(",", ".");
                    a = parseFloat(a);
                    // Check if the decimal part is zero
                    if (Number.isInteger(a)) {
                        a = parseInt(a);
                    }
                    $$(id).setValue(a)
                }
            },
            onChange:function(newValue){
                // let a = newValue
                // if(a!="" && a!=null){
                //     if(a.substring(0, 3)=="Rp\xA0"){
                //         a = a.replace(/\./g, "")
                //         let last = a.slice(-3);
                //         if(last==",00"){
                //                 a=a.replace(",00","")
                //         }else{
                //             a=a.replace(",",".") 
                //         }
                //         let first = a.substring(0, 3);
                //         a=a.replace(first,"")
                //         a = Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(a);
                //         $$(id).setValue(a);
                //     }else{
                //         a = Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(a);
                //         $$(id).setValue(a);
                //     }
                //         // this.setValue(a)
                    
                //     // if(newValue.split("")[0]!="Rp"){
                //     //     newValue = Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(newValue);
                //     //     // $$(id).setValue(a)
                //     // }
                // }else{
                //     $$(id).setValue("")
                // }
            }
        }
        let extendOnBlur = function(prev_item){
            let a = $$(prev_item.config.id).getValue()
            if(a!="" && a!=null){
                if(a.substring(0, 3)=="Rp\xA0"){
                    a = a.replace(/\./g, "")
                    let last = a.slice(-3);
                    if(last==",00"){
                            a=a.replace(",00","")
                    }else{
                        a=a.replace(",",".") 
                    }
                    let first = a.substring(0, 3);
                    a=a.replace(first,"")
                    a = Intl.NumberFormat("id-ID", { style: "currency", currency: currencyCode }).format(a)
                    a = a.replace(",", "#").replace(".", ",").replace(/#/g, ".");
                    if(a!="RpNaN"){
                        $$(prev_item.config.id).setValue(a)
                    }else{
                        $$(prev_item.config.id).setValue("")
                    }
                }else{
                    a = Intl.NumberFormat("id-ID", { style: "currency", currency: currencyCode }).format(a)
                    // a = a.replace(",", "#").replace(".", ",").replace(/#/g, ".");
                    if(a!="RpNaN"){
                        $$(prev_item.config.id).setValue(a)
                    }else{
                        $$(prev_item.config.id).setValue("")
                    }
                }
            }else{
                $$(prev_item.config.id).setValue("")
            }
        }
        // let textNumeric =  super.baseText({id:id,label:label,length:length},{extendOnKeyPress:extendOnKeyPress,validateItem:validateItem})
        // textNumeric = {...textNumeric,...{jenis:"number"}}
        let currency = super.baseText({id:id,label:label,length:length,displayItem:disableItem, hideItem:hideItem, customWidth: customWidth},{validateItem:validateItem,extendOnBlur:extendOnBlur,extendOnKeyPress:extendOnKeyPress,extendOn:extendOn,GO_BLOCK:goBlock ,GO_ITEM:goItem})
        currency = Object.assign(currency, {jenis:"currency", customFooterDt:customFooterDt, bottomLabel:bottomLabel, tooltip:tooltip})
        window.winCurrency.push(id)
        if(disableItem){
            currency = Object.assign(currency, {css:"textdisplay",cssDt:"textdisplay", readonly:true, jenis:"currency", bottomLabel:'*view only'})
            winDisplayItem.push(id)
        }
        if(alignRight){
            currency = Object.assign(currency, {inputAlign:"right"})
        }
        return currency            
    }
    NIK(property,trigger={}){
        let id = property.ITEM_ID
        let label = property.LABEL
        let customWidth = property.CUSTOM_WIDTH || undefined
        let hideItem = property.HIDE || false
        let validateItem = function(){
            let promise = new Promise((resolve)=>{
                if(trigger.VALIDATE_ITEM != undefined){
                    resolve(trigger.VALIDATE_ITEM())
                }
                resolve({"status":true})
            })
            return promise
        }
        let disableItem = property.DISPLAY_ITEM || false
        let isPrimaryKey = property.IS_PRIMARY_KEY || false
        let nik = this.numericNormal({id:id,label:label,displayItem:disableItem, hideItem:hideItem, customWidth: customWidth},{validateItem:validateItem})
        nik.attributes = {maxlength:10}
        if(isPrimaryKey){
            nik = Object.assign(nik, {css:"primary_key",cssDt:"primary_cell", readonly:true, jenis:"number", isPrimaryKey:true})
            winIsPrimary.push(id)
        }
        if(disableItem){
            nik = Object.assign(nik, {css:"textdisplay",cssDt:"textdisplay", readonly:true, jenis:"number", bottomLabel:'*view only'})
            winDisplayItem.push(id)
        }
        return nik
    }   
}

class Datatable {
    CREATEDATATABLENORMAL(id,pagination,height,columns,data){
        let datatable = {"id":id,view:"datatable", "pager":pagination, "height":height,"columns":columns,"data":data}
        return datatable
    }
    CREATECOLUMN(id,header,fillspace){
        let column  = {"id":id, "header":header, "fillspace":fillspace}
        return column
    }
    
    CREATEDATATABLELOV(id,columns=[],idField,colsLov,idSearch, idWd){
        let enterEvent = {
            "onEnter": function () {
                if ( colsLov == 1 ) {
                    let columnCode = $$( id ).columnId( 0 )
                    let blocks = Object.keys(winConfigForm)
                    if($$(window.winActiveBlock['lastFocus']).config.view=="datatable"){
                        let code = $$( id ).getSelectedItem()
                        let record = $$(window.winActiveBlock['lastFocus']).getItem(window.winActiveCell.pos.row);
                        record[idField[0]] = code[columnCode];
                        $$(window.winActiveBlock['lastFocus']).refresh(window.winActiveCell.pos.row);
                        window.winDataRow = record
                        Object.keys(window.winDataRow).forEach(function(id){
                            if(window.winDataRow[id] == null){
                                winDataRow[id] = ""
                            }
                        })
                        winConfigForm[window.winActiveBlock['lastFocus']]['ELEMENT'].forEach(function(idCol){
                            if(window.winDataRow[idCol]==undefined){
                                if(winCheckRadio.includes(idCol)){
                                    winDataRow[idCol] = $$(winActiveBlock.lastFocus).getColumnConfig(idCol).uncheckValue
                                }else{
                                    winDataRow[idCol] = ''
                                }
                            }
                        })
                        Object.keys(window.winDataRow).forEach(function(id){
                            if(window.winDataRow[id] == null){
                                if(winCheckRadio.includes(id)){
                                    winDataRow[id] = $$(winActiveBlock.lastFocus).getColumnConfig(id).uncheckValue
                                }else{
                                    winDataRow[id] = ''
                                }
                            }
                        })
                        let idBaru = true;
                        if(window.winDataChanged.length != 0){
                            for (var i in window.winDataChanged) {
                                if (window.winDataChanged[i].id == window.winDataRow.id) {
                                    delete window.winDataChanged[i]
                                    let indexObj = blocks.indexOf(winActiveBlock.lastFocus)
                                    for(let a=0; a<=indexObj; a++){
                                        if(winConfigForm[blocks[a]]["BLOCK_TYPE"][0]=="FORM"){
                                            winConfigForm[blocks[a]]["PRIMARY_KEY"].forEach(function(id){
                                                window.winDataRow[id] = $$(id).getValue()
                                            })
                                        }
                                    }
                                    window.winDataChanged = window.winDataChanged.filter((a) => a);
                                    window.winDataChanged.push(window.winDataRow)
                                    idBaru = false;
                                    break; //Stop this loop, we found it!
                                }
                            }
                        }

                        if(idBaru==true){
                            let indexObj = blocks.indexOf(winActiveBlock.lastFocus)
                            for(let a=0; a<=indexObj; a++){
                                if(winConfigForm[blocks[a]]["BLOCK_TYPE"][0]=="FORM"){
                                    winConfigForm[blocks[a]]["PRIMARY_KEY"].forEach(function(id){
                                        window.winDataRow[id] = $$(id).getValue()
                                    })
                                }
                            }
                            window.winDataChanged.push(window.winDataRow)
                        }
                        $$( id ).clearSelection();
                        window.winOpenPopUp = "closed";
                        if($$(window.winActiveBlock['lastFocus']).config.view=="datatable"){
                            $$(idSearch).setValue("")
                            $$(idSearch).refresh()
                            $$(id).filterByAll();
                            window.winActiveBlock['focusNow'] = window.winActiveBlock['lastFocus']
                            window.winActiveBlock['lastFocus'] = ""
                            $$(idWd).hide()
                            $$(window.winActiveBlock['focusNow']).select(window.winActiveCell.pos.row,window.winActiveCell.pos.column, false)
                            $$(window.winActiveBlock['focusNow']).editStop();
                            window.winEditor = {row:window.winActiveCell.pos.row,column:window.winActiveCell.pos.column}
                            webix.UIManager.setFocus($$(window.winActiveBlock['focusNow']))
                        }else{
                            $$(idSearch).setValue("")
                            $$(idSearch).refresh()
                            $$(id).filterByAll();
                            $$(idWd).hide()
                            
                            webix.UIManager.setFocus($$(idField[0]))
                        }
                        
                    }else{
                        let code = $$( id ).getSelectedItem()
                        $$( idField[ 0 ] ).setValue( code[ columnCode ] )
                        $$( id ).clearSelection();
                        window.winOpenPopUp = "closed";
                        if($$(window.winActiveBlock['lastFocus']).config.view=="datatable"){
                            $$(idSearch).setValue("")
                            $$(idSearch).refresh()
                            $$(id).filterByAll();
                            window.winActiveBlock['focusNow'] = window.winActiveBlock['lastFocus']
                            window.winActiveBlock['lastFocus'] = ""
                            $$(idWd).hide()
                            $$(window.winActiveBlock['focusNow']).select(window.winActiveCell.pos.row,window.winActiveCell.pos.column, false)
                            $$(window.winActiveBlock['focusNow']).editStop();
                            window.winEditor = {row:window.winActiveCell.pos.row,column:window.winActiveCell.pos.column}
                            webix.UIManager.setFocus($$(window.winActiveBlock['focusNow']))
                        }else{
                            $$(idSearch).setValue("")
                            $$(idSearch).refresh()
                            $$(id).filterByAll();
                            $$(idWd).hide()

                            webix.UIManager.setFocus($$(idField[0]))
                        }
                        // webix.UIManager.setFocus($$(window.winActiveBlock['focusNow']))
                    }
                    
                }else if ( colsLov == 2 ) {
                    let columnCode = $$( id ).columnId( 0 )
                    let columnDesc = $$( id ).columnId( 1 )
                    let blocks = Object.keys(winConfigForm)
                    if($$(window.winActiveBlock['lastFocus']).config.view=="datatable"){
                        let code = $$( id ).getSelectedItem()
                        let record = $$(window.winActiveBlock['lastFocus']).getItem(window.winActiveCell.pos.row);
                        record[idField[0]] = code[columnCode];
                        record[idField[1]] = code[columnDesc];
                        $$(window.winActiveBlock['lastFocus']).refresh(window.winActiveCell.pos.row);
                        window.winDataRow = record
                        Object.keys(window.winDataRow).forEach(function(id){
                            if(window.winDataRow[id] == null){
                                winDataRow[id] = ""
                            }
                        })
                        winConfigForm[window.winActiveBlock['lastFocus']]['ELEMENT'].forEach(function(idCol){
                            if(window.winDataRow[idCol]==undefined){
                                if(winCheckRadio.includes(idCol)){
                                    winDataRow[idCol] = $$(winActiveBlock.lastFocus).getColumnConfig(idCol).uncheckValue
                                }else{
                                    winDataRow[idCol] = ''
                                }
                            }
                        })
                        Object.keys(window.winDataRow).forEach(function(id){
                            if(window.winDataRow[id] == null){
                                if(winCheckRadio.includes(id)){
                                    winDataRow[id] = $$(winActiveBlock.lastFocus).getColumnConfig(id).uncheckValue
                                }else{
                                    winDataRow[id] = ''
                                }
                            }
                        })
                        let idBaru = true;
                        if(window.winDataChanged.length != 0){
                            for (var i in window.winDataChanged) {
                                if (window.winDataChanged[i].id == window.winDataRow.id) {
                                    delete window.winDataChanged[i]
                                    let indexObj = blocks.indexOf(winActiveBlock.lastFocus)
                                    for(let a=0; a<=indexObj; a++){
                                        if(winConfigForm[blocks[a]]["BLOCK_TYPE"][0]=="FORM"){
                                            winConfigForm[blocks[a]]["PRIMARY_KEY"].forEach(function(id){
                                                window.winDataRow[id] = $$(id).getValue()
                                            })
                                        }
                                    }
                                    window.winDataChanged = window.winDataChanged.filter((a) => a);
                                    window.winDataChanged.push(window.winDataRow)
                                    idBaru = false;
                                    break; //Stop this loop, we found it!
                                }
                            }
                        }

                        if(idBaru==true){
                            let indexObj = blocks.indexOf(winActiveBlock.lastFocus)
                            for(let a=0; a<=indexObj; a++){
                                if(winConfigForm[blocks[a]]["BLOCK_TYPE"][0]=="FORM"){
                                    winConfigForm[blocks[a]]["PRIMARY_KEY"].forEach(function(id){
                                        window.winDataRow[id] = $$(id).getValue()
                                    })
                                }
                            }
                            window.winDataChanged.push(window.winDataRow)
                        }
                        $$( id ).clearSelection();
                        window.winOpenPopUp = "closed";
                        if($$(window.winActiveBlock['lastFocus']).config.view=="datatable"){
                            $$(idSearch).setValue("")
                            $$(idSearch).refresh()
                            $$(id).filterByAll();
                            window.winActiveBlock['focusNow'] = window.winActiveBlock['lastFocus']
                            window.winActiveBlock['lastFocus'] = ""
                            $$(idWd).hide()
                            $$(window.winActiveBlock['focusNow']).select(window.winActiveCell.pos.row,window.winActiveCell.pos.column, false)
                            $$(window.winActiveBlock['focusNow']).editStop();
                            window.winEditor = {row:window.winActiveCell.pos.row,column:window.winActiveCell.pos.column}
                            webix.UIManager.setFocus($$(window.winActiveBlock['focusNow']))
                        }else{
                            $$(idSearch).setValue("")
                            $$(idSearch).refresh()
                            $$(id).filterByAll();
                            $$(idWd).hide()

                            webix.UIManager.setFocus($$(idField[0]))
                        }
                        
                    }else{
                        let code = $$( id ).getSelectedItem()
                        $$( idField[ 0 ] ).setValue( code[ columnCode ] )
                        $$( idField[ 1 ] ).setValue( code[ columnDesc ] )
                        $$( id ).clearSelection();
                        window.winOpenPopUp = "closed";
                        if($$(window.winActiveBlock['lastFocus']).config.view=="datatable"){
                            $$(idSearch).setValue("")
                            $$(idSearch).refresh()
                            $$(id).filterByAll();
                            window.winActiveBlock['focusNow'] = window.winActiveBlock['lastFocus']
                            window.winActiveBlock['lastFocus'] = ""
                            $$(idWd).hide()
                            $$(window.winActiveBlock['focusNow']).select(window.winActiveCell.pos.row,window.winActiveCell.pos.column, false)
                            $$(window.winActiveBlock['focusNow']).editStop();
                            window.winEditor = {row:window.winActiveCell.pos.row,column:window.winActiveCell.pos.column}
                            webix.UIManager.setFocus($$(window.winActiveBlock['focusNow']))
                        }else{
                            $$(idSearch).setValue("")
                            $$(idSearch).refresh()
                            $$(id).filterByAll();
                            $$(idWd).hide()

                            webix.UIManager.setFocus($$(idField[0]))
                        }
                        // webix.UIManager.setFocus($$(window.winActiveBlock['focusNow']))
                    }
                    
                } else if ( colsLov > 2 ) {
                    let code = $$( id ).getSelectedItem()
                    let blocks = Object.keys(winConfigForm)
                    if(code[$$( id ).columnId( 0 )]!=window.winOldCellLov){
                        for ( let j = 0; j < colsLov; j++ ) {
                            if($$(window.winActiveBlock['lastFocus']).config.view=="datatable"){
                                let record = $$(window.winActiveBlock['lastFocus']).getItem(window.winActiveCell.pos.row);
                                let columnCode = $$( id ).columnId( j )
                                record[idField[j]] = code[columnCode];
                                $$(window.winActiveBlock['lastFocus']).refresh(window.winActiveCell.pos.row);
                                window.winDataRow = record
                                Object.keys(window.winDataRow).forEach(function(id){
                                    if(window.winDataRow[id] == null){
                                        winDataRow[id] = ""
                                    }
                                })
                                winConfigForm[window.winActiveBlock['lastFocus']]['ELEMENT'].forEach(function(idCol){
                                    if(window.winDataRow[idCol]==undefined){
                                        if(winCheckRadio.includes(idCol)){
                                            winDataRow[idCol] = $$(winActiveBlock.lastFocus).getColumnConfig(idCol).uncheckValue
                                        }else{
                                            winDataRow[idCol] = ''
                                        }
                                    }
                                })
                                Object.keys(window.winDataRow).forEach(function(id){
                                    if(window.winDataRow[id] == null){
                                        if(winCheckRadio.includes(id)){
                                            winDataRow[id] = $$(winActiveBlock.lastFocus).getColumnConfig(id).uncheckValue
                                        }else{
                                            winDataRow[id] = ''
                                        }
                                    }
                                })
                            }else{
                                let columnCode = $$( id ).columnId( j )
                                $$(idField[j]).setValue(code[columnCode])
                            }
                            
                        }
    
                        if($$(window.winActiveBlock['lastFocus']).config.view=="datatable"){
                            let idBaru = true;
                            if(window.winDataChanged.length != 0){
                                for (var i in window.winDataChanged) {
                                    if (window.winDataChanged[i].id == window.winDataRow.id) {
                                        delete window.winDataChanged[i]
                                        let indexObj = blocks.indexOf(winActiveBlock.lastFocus)
                                        for(let a=0; a<=indexObj; a++){
                                            if(winConfigForm[blocks[a]]["BLOCK_TYPE"][0]=="FORM"){
                                                winConfigForm[blocks[a]]["PRIMARY_KEY"].forEach(function(id){
                                                    window.winDataRow[id] = $$(id).getValue()
                                                })
                                            }
                                        }
                                        window.winDataChanged = window.winDataChanged.filter((a) => a);
                                        window.winDataChanged.push(window.winDataRow)
                                        idBaru = false;
                                        break;
                                    }
                                }
                            }
        
                            if(idBaru==true){
                                if(window.winDataRow!==""){
                                    let indexObj = blocks.indexOf(winActiveBlock.lastFocus)
                                    for(let a=0; a<=indexObj; a++){
                                        if(winConfigForm[blocks[a]]["BLOCK_TYPE"][0]=="FORM"){
                                            winConfigForm[blocks[a]]["PRIMARY_KEY"].forEach(function(id){
                                                window.winDataRow[id] = $$(id).getValue()
                                            })
                                        }
                                    }
                                    window.winDataChanged.push(window.winDataRow)
                                }
                                
                            }
                        }
                    }
                    

                    $$( id ).clearSelection();
                    window.winOpenPopUp = "closed";
                    if($$(window.winActiveBlock['lastFocus']).config.view=="datatable"){
                        $$(idSearch).setValue("")
                        $$(idSearch).refresh()
                        $$(id).filterByAll();
                        window.winActiveBlock['focusNow'] = window.winActiveBlock['lastFocus']
                        window.winActiveBlock['lastFocus'] = ""
                        $$(idWd).hide()
                        $$(window.winActiveBlock['focusNow']).select(window.winActiveCell.pos.row,window.winActiveCell.pos.column, false)
                        $$(window.winActiveBlock['focusNow']).editStop();
                        window.winEditor = {row:window.winActiveCell.pos.row,column:window.winActiveCell.pos.column}
                        webix.UIManager.setFocus($$(window.winActiveBlock['focusNow']));
                    }else{
                        $$(idSearch).setValue("")
                        $$(idSearch).refresh()
                        $$(id).filterByAll();
                        $$(idWd).hide()
                        webix.UIManager.setFocus($$(idField[0]))
                        // webix.UIManager.setFocus($$(idField[0]));
                    }
                    
                }

            },
            "onItemDblClick":function(){
                if ( colsLov == 1 ) {
                    let columnCode = $$( id ).columnId( 0 )
                    let blocks = Object.keys(winConfigForm)
                    if($$(window.winActiveBlock['lastFocus']).config.view=="datatable"){
                        let code = $$( id ).getSelectedItem()
                        let record = $$(window.winActiveBlock['lastFocus']).getItem(window.winActiveCell.pos.row);
                        record[idField[0]] = code[columnCode];
                        $$(window.winActiveBlock['lastFocus']).refresh(window.winActiveCell.pos.row);
                        window.winDataRow = record
                        Object.keys(window.winDataRow).forEach(function(id){
                            if(window.winDataRow[id] == null){
                                winDataRow[id] = ""
                            }
                        })
                        winConfigForm[window.winActiveBlock['lastFocus']]['ELEMENT'].forEach(function(idCol){
                            if(window.winDataRow[idCol]==undefined){
                                if(winCheckRadio.includes(idCol)){
                                    winDataRow[idCol] = $$(winActiveBlock.lastFocus).getColumnConfig(idCol).uncheckValue
                                }else{
                                    winDataRow[idCol] = ''
                                }
                            }
                        })
                        Object.keys(window.winDataRow).forEach(function(id){
                            if(window.winDataRow[id] == null){
                                if(winCheckRadio.includes(id)){
                                    winDataRow[id] = $$(winActiveBlock.lastFocus).getColumnConfig(id).uncheckValue
                                }else{
                                    winDataRow[id] = ''
                                }
                            }
                        })
                        let idBaru = true;
                        if(window.winDataChanged.length != 0){
                            for (var i in window.winDataChanged) {
                                if (window.winDataChanged[i].id == window.winDataRow.id) {
                                    delete window.winDataChanged[i]
                                    let indexObj = blocks.indexOf(winActiveBlock.lastFocus)
                                    for(let a=0; a<=indexObj; a++){
                                        if(winConfigForm[blocks[a]]["BLOCK_TYPE"][0]=="FORM"){
                                            winConfigForm[blocks[a]]["PRIMARY_KEY"].forEach(function(id){
                                                window.winDataRow[id] = $$(id).getValue()
                                            })
                                        }
                                    }
                                    window.winDataChanged = window.winDataChanged.filter((a) => a);
                                    window.winDataChanged.push(window.winDataRow)
                                    idBaru = false;
                                    break; //Stop this loop, we found it!
                                }
                            }
                        }

                        if(idBaru==true){
                            let indexObj = blocks.indexOf(winActiveBlock.lastFocus)
                            for(let a=0; a<=indexObj; a++){
                                if(winConfigForm[blocks[a]]["BLOCK_TYPE"][0]=="FORM"){
                                    winConfigForm[blocks[a]]["PRIMARY_KEY"].forEach(function(id){
                                        window.winDataRow[id] = $$(id).getValue()
                                    })
                                }
                            }
                            window.winDataChanged.push(window.winDataRow)
                        }
                        $$( id ).clearSelection();
                        window.winOpenPopUp = "closed";
                        if($$(window.winActiveBlock['lastFocus']).config.view=="datatable"){
                            $$(idSearch).setValue("")
                            $$(idSearch).refresh()
                            $$(id).filterByAll();
                            window.winActiveBlock['focusNow'] = window.winActiveBlock['lastFocus']
                            window.winActiveBlock['lastFocus'] = ""
                            $$(idWd).hide()
                            $$(window.winActiveBlock['focusNow']).select(window.winActiveCell.pos.row,window.winActiveCell.pos.column, false)
                            $$(window.winActiveBlock['focusNow']).editStop();
                            window.winEditor = {row:window.winActiveCell.pos.row,column:window.winActiveCell.pos.column}
                            webix.UIManager.setFocus($$(window.winActiveBlock['focusNow']))
                        }else{
                            $$(idSearch).setValue("")
                            $$(idSearch).refresh()
                            $$(id).filterByAll();
                            $$(idWd).hide()

                            webix.UIManager.setFocus($$(idField[0]))
                        }
                        
                    }else{
                        let code = $$( id ).getSelectedItem()
                        $$( idField[ 0 ] ).setValue( code[ columnCode ] )
                        $$( id ).clearSelection();
                        window.winOpenPopUp = "closed";
                        if($$(window.winActiveBlock['lastFocus']).config.view=="datatable"){
                            $$(idSearch).setValue("")
                            $$(idSearch).refresh()
                            $$(id).filterByAll();
                            window.winActiveBlock['focusNow'] = window.winActiveBlock['lastFocus']
                            window.winActiveBlock['lastFocus'] = ""
                            $$(idWd).hide()
                            $$(window.winActiveBlock['focusNow']).select(window.winActiveCell.pos.row,window.winActiveCell.pos.column, false)
                            $$(window.winActiveBlock['focusNow']).editStop();
                            window.winEditor = {row:window.winActiveCell.pos.row,column:window.winActiveCell.pos.column}
                            webix.UIManager.setFocus($$(window.winActiveBlock['focusNow']))
                        }else{
                            $$(idSearch).setValue("")
                            $$(idSearch).refresh()
                            $$(id).filterByAll();
                            $$(idWd).hide()

                            webix.UIManager.setFocus($$(idField[0]))
                        }
                        // webix.UIManager.setFocus($$(window.winActiveBlock['focusNow']))
                    }
                    
                }else if ( colsLov == 2 ) {
                    let columnCode = $$( id ).columnId( 0 )
                    let columnDesc = $$( id ).columnId( 1 )
                    let blocks = Object.keys(winConfigForm)
                    if($$(window.winActiveBlock['lastFocus']).config.view=="datatable"){
                        let code = $$( id ).getSelectedItem()
                        let record = $$(window.winActiveBlock['lastFocus']).getItem(window.winActiveCell.pos.row);
                        record[idField[0]] = code[columnCode];
                        record[idField[1]] = code[columnDesc];
                        $$(window.winActiveBlock['lastFocus']).refresh(window.winActiveCell.pos.row);
                        window.winDataRow = record
                        Object.keys(window.winDataRow).forEach(function(id){
                            if(window.winDataRow[id] == null){
                                winDataRow[id] = ""
                            }
                        })
                        winConfigForm[window.winActiveBlock['lastFocus']]['ELEMENT'].forEach(function(idCol){
                            if(window.winDataRow[idCol]==undefined){
                                if(winCheckRadio.includes(idCol)){
                                    winDataRow[idCol] = $$(winActiveBlock.lastFocus).getColumnConfig(idCol).uncheckValue
                                }else{
                                    winDataRow[idCol] = ''
                                }
                            }
                        })
                        Object.keys(window.winDataRow).forEach(function(id){
                            if(window.winDataRow[id] == null){
                                if(winCheckRadio.includes(id)){
                                    winDataRow[id] = $$(winActiveBlock.lastFocus).getColumnConfig(id).uncheckValue
                                }else{
                                    winDataRow[id] = ''
                                }
                            }
                        })
                        let idBaru = true;
                        if(window.winDataChanged.length != 0){
                            for (var i in window.winDataChanged) {
                                if (window.winDataChanged[i].id == window.winDataRow.id) {
                                    delete window.winDataChanged[i]
                                    let indexObj = blocks.indexOf(winActiveBlock.lastFocus)
                                    for(let a=0; a<=indexObj; a++){
                                        if(winConfigForm[blocks[a]]["BLOCK_TYPE"][0]=="FORM"){
                                            winConfigForm[blocks[a]]["PRIMARY_KEY"].forEach(function(id){
                                                window.winDataRow[id] = $$(id).getValue()
                                            })
                                        }
                                    }
                                    window.winDataChanged = window.winDataChanged.filter((a) => a);
                                    window.winDataChanged.push(window.winDataRow)
                                    idBaru = false;
                                    break; //Stop this loop, we found it!
                                }
                            }
                        }

                        if(idBaru==true){
                            let indexObj = blocks.indexOf(winActiveBlock.lastFocus)
                            for(let a=0; a<=indexObj; a++){
                                if(winConfigForm[blocks[a]]["BLOCK_TYPE"][0]=="FORM"){
                                    winConfigForm[blocks[a]]["PRIMARY_KEY"].forEach(function(id){
                                        window.winDataRow[id] = $$(id).getValue()
                                    })
                                }
                            }
                            window.winDataChanged.push(window.winDataRow)
                        }
                        $$( id ).clearSelection();
                        window.winOpenPopUp = "closed";
                        if($$(window.winActiveBlock['lastFocus']).config.view=="datatable"){

                            window.winActiveBlock['focusNow'] = window.winActiveBlock['lastFocus']
                            window.winActiveBlock['lastFocus'] = ""
                            this.getParentView().getParentView().hide()
                            $$(window.winActiveBlock['focusNow']).select(window.winActiveCell.pos.row,window.winActiveCell.pos.column, false)
                            $$(window.winActiveBlock['focusNow']).editStop();
                            window.winEditor = {row:window.winActiveCell.pos.row,column:window.winActiveCell.pos.column}
                            webix.UIManager.setFocus($$(window.winActiveBlock['focusNow']));
                        }else{
                            this.getParentView().getParentView().hide()
                        }
                    }else{
                        let code = $$( id ).getSelectedItem()
                        $$( idField[ 0 ] ).setValue( code[ columnCode ] )
                        $$( idField[ 1 ] ).setValue( code[ columnDesc ] )
                        $$( id ).clearSelection();
                        window.winOpenPopUp = "closed";
                        if($$(window.winActiveBlock['lastFocus']).config.view=="datatable"){
                            $$(idSearch).setValue("")
                            $$(idSearch).refresh()
                            $$(id).filterByAll();
                            window.winActiveBlock['focusNow'] = window.winActiveBlock['lastFocus']
                            window.winActiveBlock['lastFocus'] = ""
                            $$(idWd).hide()
                            $$(window.winActiveBlock['focusNow']).select(window.winActiveCell.pos.row,window.winActiveCell.pos.column, false)
                            $$(window.winActiveBlock['focusNow']).editStop();
                            window.winEditor = {row:window.winActiveCell.pos.row,column:window.winActiveCell.pos.column}
                            webix.UIManager.setFocus($$(window.winActiveBlock['focusNow']));
                        }else{
                            $$(idSearch).setValue("")
                            $$(idSearch).refresh()
                            $$(id).filterByAll();
                            $$(idWd).hide()

                            webix.UIManager.setFocus($$(idField[0]))
                        }
                    }
                    
                } else if ( colsLov > 2 ) {
                    let code = $$( id ).getSelectedItem()
                    let blocks = Object.keys(winConfigForm)
                    if(code[$$( id ).columnId( 0 )]!=window.winOldCellLov){
                        for ( let j = 0; j < colsLov; j++ ) {
                            if($$(window.winActiveBlock['lastFocus']).config.view=="datatable"){
                                let record = $$(window.winActiveBlock['lastFocus']).getItem(window.winActiveCell.pos.row);
                                let columnCode = $$( id ).columnId( j )
                                record[idField[j]] = code[columnCode];
                                $$(window.winActiveBlock['lastFocus']).refresh(window.winActiveCell.pos.row);
                                window.winDataRow = record
                                Object.keys(window.winDataRow).forEach(function(id){
                                    if(window.winDataRow[id] == null){
                                        winDataRow[id] = ""
                                    }
                                })
                                winConfigForm[window.winActiveBlock['lastFocus']]['ELEMENT'].forEach(function(idCol){
                                    if(window.winDataRow[idCol]==undefined){
                                        if(winCheckRadio.includes(idCol)){
                                            winDataRow[idCol] = $$(winActiveBlock.lastFocus).getColumnConfig(idCol).uncheckValue
                                        }else{
                                            winDataRow[idCol] = ''
                                        }
                                    }
                                })
                                Object.keys(window.winDataRow).forEach(function(id){
                                    if(window.winDataRow[id] == null){
                                        if(winCheckRadio.includes(id)){
                                            winDataRow[id] = $$(winActiveBlock.lastFocus).getColumnConfig(id).uncheckValue
                                        }else{
                                            winDataRow[id] = ''
                                        }
                                    }
                                })
                            }else{
                                let columnCode = $$( id ).columnId( j )
                                $$(idField[j]).setValue(code[columnCode])
                            }
                            
                        }
    
                        if($$(window.winActiveBlock['lastFocus']).config.view=="datatable"){
                            let idBaru = true;
                            
                            if(window.winDataChanged.length != 0){
                                for (var i in window.winDataChanged) {
                                    if (window.winDataChanged[i].id == window.winDataRow.id) {
                                        delete window.winDataChanged[i]
                                        let indexObj = blocks.indexOf(winActiveBlock.lastFocus)
                                        for(let a=0; a<=indexObj; a++){
                                            if(winConfigForm[blocks[a]]["BLOCK_TYPE"][0]=="FORM"){
                                                winConfigForm[blocks[a]]["PRIMARY_KEY"].forEach(function(id){
                                                    window.winDataRow[id] = $$(id).getValue()
                                                })
                                            }
                                        }
                                        window.winDataChanged = window.winDataChanged.filter((a) => a);
                                        window.winDataChanged.push(window.winDataRow)
                                        idBaru = false;
                                        break;
                                    }
                                }
                            }
        
                            if(idBaru==true){
                                if(window.winDataRow!==""){
                                    let indexObj = blocks.indexOf(winActiveBlock.lastFocus)
                                    for(let a=0; a<=indexObj; a++){
                                        if(winConfigForm[blocks[a]]["BLOCK_TYPE"][0]=="FORM"){
                                            winConfigForm[blocks[a]]["PRIMARY_KEY"].forEach(function(id){
                                                window.winDataRow[id] = $$(id).getValue()
                                            })
                                        }
                                    }
                                    window.winDataChanged.push(window.winDataRow)
                                }
                                
                            }
                        }
                    }
                    

                    $$( id ).clearSelection();
                    window.winOpenPopUp = "closed";
                    if($$(window.winActiveBlock['lastFocus']).config.view=="datatable"){
                        $$(idSearch).setValue("")
                        $$(idSearch).refresh()
                        $$(id).filterByAll();
                        window.winActiveBlock['focusNow'] = window.winActiveBlock['lastFocus']
                        window.winActiveBlock['lastFocus'] = ""
                        $$(idWd).hide()
                        $$(window.winActiveBlock['focusNow']).select(window.winActiveCell.pos.row,window.winActiveCell.pos.column, false)
                        $$(window.winActiveBlock['focusNow']).editStop();
                        window.winEditor = {row:window.winActiveCell.pos.row,column:window.winActiveCell.pos.column}
                        webix.UIManager.setFocus($$(window.winActiveBlock['focusNow']));
                    }else{
                        $$(idSearch).setValue("")
                        $$(idSearch).refresh()
                        $$(id).filterByAll();
                        $$(idWd).hide()

                        webix.UIManager.setFocus($$(idField[0]))
                    }
                    
                }
            },
            "onKeyPress":function(code){
                if((code >= 48 && code <= 57) || (code >= 65 && code <= 90)){
                    $$("searchLov").focus();
                }
            },
        }

        let datatable = {
            "view":"datatable",
            "id":id,
            "name":id,
            "width":window.innerWidth/2,
            "editable":true,
            "select":"row",
            "scroll":"xy",
            "columns":columns,
            "resizeColumn":true,    
        }
        datatable["on"] = enterEvent
        return datatable        
    }
    
    CREATECOLUMNDT(id,header){
        let columns = { "id":id,"css":{'text-align':'left'},"header":header, adjust:true, minWidth:250}
        return columns
    }
}

class Radio extends Base{
    RADIOBUTTON(property,trigger={}){
        let id = property.ITEM_ID
        let label = property.LABEL
        let hideItem = property.HIDE || false
        let customWidth = property.CUSTOM_WIDTH || undefined
        let validateItem = function(){
            let promise = new Promise((resolve)=>{
                if(trigger.VALIDATE_ITEM != undefined){
                    resolve(trigger.VALIDATE_ITEM())
                }
                resolve({"status":true})
            })
            return promise
        }
        let options = property.OPTIONS
        let goBlock = trigger.GO_BLOCK || undefined
        let goItem = trigger.GO_ITEM || undefined
        let radio = super.baseText({id:id,label:label, hideItem:hideItem, customWidth: customWidth},{validateItem:validateItem,GO_BLOCK:goBlock ,GO_ITEM:goItem})
        radio = Object.assign(radio, {view:"radio", options:options})
        // window.winCheckRadio.push(id)
        additionalMultiLanguage.push(property.ITEM_ID)
        winRadio[property.ITEM_ID] = property.OPTIONS
        return radio
    }
}

class Combo extends Base{

    COMBOLISTDEFAULT(property,trigger={}){
        let id = property.ITEM_ID
        let label = property.LABEL
        let options = property.OPTIONS
        let valueCombo = property.VALUE
        let idParam = property.ID_PARAM || ""
        let customWidth = property.CUSTOM_WIDTH || undefined
        let isPrimaryKey = property.IS_PRIMARY_KEY || false
        let bottomLabel = property.BOTTOM_LABEL || undefined
        let hideItem = property.HIDE || false
        let preItem = trigger.PRE_ITEM
        let validateItem = function(){
            let promise = new Promise((resolve)=>{
                if(trigger.VALIDATE_ITEM != undefined){
                    resolve(trigger.VALIDATE_ITEM())
                }
                resolve({"status":true})
            })
            return promise
        }
        let disableItem = property.DISPLAY_ITEM || false
        let goBlock = trigger.GO_BLOCK || undefined
        let goItem = trigger.GO_ITEM || undefined
        let customFooterDt = property.CUSTOM_FOOTER || undefined
        let extendOn = {
            onChange:function(newValue,oldValue, config){
                try{
                    if (idParam != ""){
                        if($$(getBlockItem(idParam)).config.view=="form"){
                            if(typeof idParam=="string"){
                                $$(idParam).setValue("")
                                $$(idParam).refresh()
                            }else if(typeof idParam=="object"){
                                idParam.forEach(function(id){
                                    $$(id).setValue("")
                                    $$(id).refresh()
                                })
                            }
                        }else{
                            if(typeof idParam=="string"){
                                $$(getBlockItem(idParam)).setValueDt([idParam],[""])
                                $$(getBlockItem(idParam)).refresh()
                            }else if(typeof idParam=="object"){
                                idParam.forEach(function(id){
                                    $$(getBlockItem(idParam)).setValueDt([idParam],[""])
                                    $$(getBlockItem(idParam)).refresh()
                                })
                            }
                        }
                        
                    }
                    if($$(getBlockItem(id)).config.view=="form"){
                        this.setValue(newValue)
                    }else{
                        $$(getBlockItem(id)).setValueDt([id],[newValue])
                    }
                }catch(error){
                    //console.log(error)
                }     
                if(winStartEditAfterLoadData && winOpenValidation){
                    let validateFunc = validateItem()
                    validateFunc.then(function(respond){
                        let pesanValidate = respond.pesan || ''
                        if(!respond.status){ 
                            let actionAlert = function(result){
                                const fView = webix.UIManager.getFocus()//get the view that is currently focused
                                if(fView && typeof fView.blockEvent === 'function'){
                                    fView.blockEvent();//prevent continuous event triggering
                                }
                                $(id).focus();//revert focus back to the original view
                                $$(id).setValue(oldValue);//set value ""
                                if(fView && typeof fView.unblockEvent === 'function'){
                                    fView.unblockEvent();//resume event flow
                                }
                            };
                            if(!isWebixPopupOpen()){
                                webix.alert(ALERT.ALERTWARNING(pesanValidate)).then(actionAlert)
                            }
                        }
                    })
                }
            }
    }
        let combo = super.baseText({id:id,label:label,displayItem:disableItem, hideItem:hideItem, customWidth: customWidth},{preItem:preItem,extendOn:extendOn,GO_BLOCK:goBlock ,GO_ITEM:goItem})
        combo = Object.assign(combo, {view:"combo", options:options, value:valueCombo, jenis:"combo", customFooterDt:customFooterDt, validateDt:validateItem})
        if(isPrimaryKey){
            combo = Object.assign(combo, {jenis:"combo", isPrimaryKey:true})
            winIsPrimary.push(id)
        }
        additionalMultiLanguage.push(property.ITEM_ID)
        winCombo[property.ITEM_ID] = property.OPTIONS
        if(disableItem){
            winDisplayItem.push(id)
            combo = Object.assign(combo, {disableItem:disableItem})
        }
        if(bottomLabel!=undefined){
            if(bottomLabel!=""){
                combo = Object.assign(combo,{bottomLabel:bottomLabel})
            }else{
                combo = Object.assign(combo,{bottomLabel:" "})
            }
        }
        return combo

    }

    COMBOLISTAPI(property,trigger={}){
        let id = property.ITEM_ID
        let label = property.LABEL
        let data = property.DATA
        let customWidth = property.CUSTOM_WIDTH || undefined
        let hideItem = property.HIDE || false
        let isPrimaryKey = property.IS_PRIMARY_KEY || false
        let bottomLabel = property.BOTTOM_LABEL || undefined
        let validateItem = function(){
            let promise = new Promise((resolve)=>{
                if(trigger.VALIDATE_ITEM != undefined){
                    resolve(trigger.VALIDATE_ITEM())
                }
                resolve({"status":true})
            })
            return promise
        }
        let idParam = property.ID_PARAM || ""
        let preItem = trigger.PRE_ITEM
        let disableItem = property.DISPLAY_ITEM || false
        let goBlock = trigger.GO_BLOCK || undefined
        let goItem = trigger.GO_ITEM || undefined
        let customFooterDt = property.CUSTOM_FOOTER || undefined
        let extendOn = {
            onChange:function(newValue,oldValue, config){
                if (idParam != ""){
                    if($$(getBlockItem(idParam)).config.view=="form"){
                        if(typeof idParam=="string"){
                            $$(idParam).setValue("")
                            $$(idParam).refresh()
                        }else if(typeof idParam=="object"){
                            idParam.forEach(function(id){
                                $$(id).setValue("")
                                $$(id).refresh()
                            })
                        }
                    }else{
                        if(typeof idParam=="string"){
                            $$(getBlockItem(idParam)).setValueDt([idParam],[""])
                            $$(getBlockItem(idParam)).refresh()
                        }else if(typeof idParam=="object"){
                            idParam.forEach(function(id){
                                $$(getBlockItem(idParam)).setValueDt([idParam],[""])
                                $$(getBlockItem(idParam)).refresh()
                            })
                        }
                    }
                    
                }
                if($$(getBlockItem(id)).config.view=="form"){
                    this.setValue(newValue)
                }else{
                    $$(getBlockItem(id)).setValueDt([id],[newValue])
                }
                if(winStartEditAfterLoadData && winOpenValidation){
                    let validateFunc = validateItem()
                    validateFunc.then(function(respond){
                        let pesanValidate = respond.pesan || ''
                        if(!respond.status){ 
                            let actionAlert = function(result){
                                const fView = webix.UIManager.getFocus()//get the view that is currently focused
                                if(fView && typeof fView.blockEvent === 'function'){
                                    fView.blockEvent();//prevent continuous event triggering
                                }
                                $(id).focus();//revert focus back to the original view
                                $$(id).setValue(oldValue);//set value ""
                                if(fView && typeof fView.unblockEvent === 'function'){
                                    fView.unblockEvent();//resume event flow
                                }
                            };
                            if(!isWebixPopupOpen()){
                                webix.alert(ALERT.ALERTWARNING(pesanValidate)).then(actionAlert)
                            }
                        }
                    })
                }
            }
        }
        let combo = super.baseText({id:id,label:label,displayItem:disableItem, hideItem:hideItem, customWidth: customWidth},{preItem:preItem,extendOn:extendOn,GO_BLOCK:goBlock ,GO_ITEM:goItem})
        combo.view = "combo"
        combo = Object.assign(combo,{view:"combo", options:{
            "filter":function(item, value){
                if(item.value.toString().toLowerCase().indexOf(value.toLowerCase())===0)
                    return true;
                return false;
            },
            body:{template:"#value#",yCount:5,data:data}
        },jenis:"combo", customFooterDt:customFooterDt, validateDt:validateItem})
        if(isPrimaryKey){
            combo = Object.assign(combo,{jenis:"combo", isPrimaryKey:true})
            winIsPrimary.push(id)
        }
        if(disableItem){
            winDisplayItem.push(id)
            combo = Object.assign(combo, {disableItem:disableItem})
        }
        if(bottomLabel!=undefined){
            if(bottomLabel!=""){
                combo = Object.assign(combo,{bottomLabel:bottomLabel})
            }else{
                combo = Object.assign(combo,{bottomLabel:" "})
            }
        }
        return combo
    }

    COMBOLISTAPIDATA(property,trigger={}){
        let id = property.ITEM_ID
        let label = property.LABEL
        let data = property.DATA
        let customWidth = property.CUSTOM_WIDTH || undefined
        let hideItem = property.HIDE || false
        let isPrimaryKey = property.IS_PRIMARY_KEY || false
        let bottomLabel = property.BOTTOM_LABEL || undefined
        let idParam = property.ID_PARAM || ""
        let validateItem = trigger.VALIDATE_ITEM || function(){
            let promise = new Promise((resolve)=>{
                resolve({"status":true})
            })
            return promise
        }
        let preItem = trigger.PRE_ITEM
        let disableItem = property.DISPLAY_ITEM || false
        let goBlock = trigger.GO_BLOCK || undefined
        let goItem = trigger.GO_ITEM || undefined
        let customFooterDt = property.CUSTOM_FOOTER || undefined
        let extendOn = {
            onChange:function(newValue,oldValue, config){
                if (idParam != ""){
                    if($$(getBlockItem(idParam)).config.view=="form"){
                        if(typeof idParam=="string"){
                            $$(idParam).setValue("")
                            $$(idParam).refresh()
                        }else if(typeof idParam=="object"){
                            idParam.forEach(function(id){
                                $$(id).setValue("")
                                $$(id).refresh()
                            })
                        }
                    }else{
                        if(typeof idParam=="string"){
                            $$(getBlockItem(idParam)).setValueDt([idParam],[""])
                            $$(getBlockItem(idParam)).refresh()
                        }else if(typeof idParam=="object"){
                            idParam.forEach(function(id){
                                $$(getBlockItem(idParam)).setValueDt([idParam],[""])
                                $$(getBlockItem(idParam)).refresh()
                            })
                        }
                    }
                    
                }
                if($$(getBlockItem(id)).config.view=="form"){
                    this.setValue(newValue)
                }else{
                    $$(getBlockItem(id)).setValueDt([id],[newValue])
                }
                if(winStartEditAfterLoadData && winOpenValidation){
                    let validateFunc = validateItem()
                    validateFunc.then(function(respond){
                        let pesanValidate = respond.pesan || ''
                        if(!respond.status){ 
                            let actionAlert = function(result){
                                const fView = webix.UIManager.getFocus()//get the view that is currently focused
                                if(fView && typeof fView.blockEvent === 'function'){
                                    fView.blockEvent();//prevent continuous event triggering
                                }
                                $(id).focus();//revert focus back to the original view
                                $$(id).setValue(oldValue);//set value ""
                                if(fView && typeof fView.unblockEvent === 'function'){
                                    fView.unblockEvent();//resume event flow
                                }
                            };
                            if(!isWebixPopupOpen()){
                                webix.alert(ALERT.ALERTWARNING(pesanValidate)).then(actionAlert)
                            }
                        }
                    })
                }
                
            },
        }
        let combo = super.baseText({id:id,label:label,displayItem:disableItem, hideItem:hideItem, customWidth: customWidth},{preItem:preItem,extendOn:extendOn,GO_BLOCK:goBlock ,GO_ITEM:goItem})
        combo.view = "combo"
        combo = Object.assign(combo, {view:"combo", options:{
            "filter":function(item, value){
                if(item.value.toString().toLowerCase().indexOf(value.toLowerCase())===0)
                    return true;
                return false;
            },
            body:{template:"#value#",yCount:5,data:data}
        },jenis:"combo", customFooterDt:customFooterDt, validateDt:validateItem})
        if(isPrimaryKey){
            combo = Object.assign(combo, {jenis:"combo", isPrimaryKey:true})
            winIsPrimary.push(id)
        }
        if(disableItem){
            winDisplayItem.push(id)
            combo = Object.assign(combo, {disableItem:disableItem})
        }
        if(bottomLabel!=undefined){
            if(bottomLabel!=""){
                combo = Object.assign(combo,{bottomLabel:bottomLabel})
            }else{
                combo = Object.assign(combo,{bottomLabel:" "})
            }
        }
        return combo
    }
}

class Checkbox extends Base{
    NORMALCHECKBOX(property,trigger={}){
        let id = property.ITEM_ID
        let label = property.LABEL
        let value = property.VALUE
        let disableItem = property.DISPLAY_ITEM || false
        let customWidth = property.CUSTOM_WIDTH || undefined
        let hideItem = property.HIDE || false
        let customErrorSymbol = property.CUSTOM_ERROR_SYMBOL || false
        let bottomLabel = property.BOTTOM_LABEL || undefined
        let validateItem = function(){
            let promise = new Promise((resolve)=>{
                if(trigger.VALIDATE_ITEM != undefined){
                    resolve(trigger.VALIDATE_ITEM())
                }
                resolve({"status":true})
            })
            return promise
        }
        let defaultCheckValue = property.CHECK_VALUE
        let goBlock = trigger.GO_BLOCK || undefined
        let goItem = trigger.GO_ITEM || undefined
        let customFooterDt = property.CUSTOM_FOOTER || undefined
        let nullValue = false
        let checkValue = ''
        let uncheckValue = ''
        if (defaultCheckValue == undefined){
            checkValue = 'Y'
            uncheckValue = 'N'
        }else if (defaultCheckValue == 'Y' || defaultCheckValue == 'N'){
            checkValue = 'Y'
            uncheckValue = 'N'
        }else if(defaultCheckValue == 'T' || defaultCheckValue == 'F'){
            checkValue = 'T'
            uncheckValue = 'F'
        }else if(defaultCheckValue == 1 || defaultCheckValue == 0){
            checkValue = 1
            uncheckValue = 0
        }
        let extendOn = {
            onItemClick:function() {
                this.config.searchItem = true;
                this.config.nullValue = false
                let validateFunc = validateItem()
                    validateFunc.then(function(respond){
                        let pesanValidate = respond.pesan || ''
                        if(!respond.status){ 
                            let actionAlert = function(result){
                                const fView = webix.UIManager.getFocus()//get the view that is currently focused
                                if(fView && typeof fView.blockEvent === 'function'){
                                    fView.blockEvent();//prevent continuous event triggering
                                }
                                $$(id).focus();//revert focus back to the original view
                                let lastValue = ($$(id).getValue() == checkValue)? uncheckValue : checkValue;
                                $$(id).setValue(lastValue);//set value ""
                                if(fView && typeof fView.unblockEvent === 'function'){
                                    fView.unblockEvent();//resume event flow
                                }
                            };
                            if(!isWebixPopupOpen()){
                                webix.alert(ALERT.ALERTWARNING(pesanValidate)).then(actionAlert)
                            }
                        }
                })
            }
        }
        let checkbox = super.baseText({id:id,label:label, hideItem:hideItem, customWidth: customWidth, displayItem:disableItem},{extendOn:extendOn,GO_BLOCK:goBlock ,GO_ITEM:goItem})
        checkbox = Object.assign(checkbox,{view:"checkbox", labelPosition : window.labelPosition || "top", value:value, checkValue:checkValue, uncheckValue:uncheckValue, jenis:"checkBox", searchItem:false,customFooterDt:customFooterDt, validateDt:validateItem, customErrorSymbol:customErrorSymbol})
        window.winCheckRadio.push(id)
        if(disableItem){
            winDisplayItem.push(id)
            checkbox.disabled = disableItem
        }

        if (customErrorSymbol) {
            let elementCustom = "<a role='presentation' onclick='javascript:void(0)'><button role='checkbox' aria-checked='false' aria-label='' type='button' aria-invalid='' class='webix_custom_checkbox_x_form' ></button></a>"
            checkbox = Object.assign(checkbox, {customCheckbox:elementCustom})
            
        }

        if(bottomLabel!=undefined){
            if(bottomLabel!=""){
                checkbox = Object.assign(checkbox,{bottomLabel:bottomLabel})
            }else{
                checkbox = Object.assign(checkbox,{bottomLabel:" "})
            }
        }

        return checkbox
    }
}

class Alert{
    ALERTINFO(message,customWidth){
        let alert = {title:"Info", ok:"OK", type:"alert", text:setDefaultLangMSG(message)}
        if(customWidth){
            alert.width = customWidth
        }
        return alert     
    }
    ALERTWARNING(message,customWidth){
        let warning = this.ALERTINFO(message, customWidth)
        warning.title = "Warning"
        warning.type = "alert-warning"
        return warning
    }
    ALERTERROR(message, customWidth){
        let error = this.ALERTINFO(message, customWidth)
        error.title = "Error"
        error.type = "alert-error"
        return error
    }
}

window.winDateType=[];
window.winDateTypeMMYY=[];
window.winDateTypeYY=[];
window.winClockType=[];
window.winTimestampType=[];
class Calendar extends Base{

    // POP-UP BASE CALENDAR----------------------------------------------------------------------------
        POPCALENDAR(id,type,format, paramExt,typeUse){
            let dateValue = $$(id).getValue()
           
            if(window.winDateTypeMMYY.includes(id)){
                    let configColumn = $$(id).config
                    if (dateValue!='' && dateValue!=null){
                        dateValue = cekDate(dateValue, "MM-YYYY");
                        if(dateValue.length==configColumn.attributes.maxlength && dateValue.split("-").length<=3 && dateValue.split("-")[0].length==4){
                            dateValue = dateValue.split("-").join("-");
                        }else if(dateValue.length==configColumn.attributes.maxlength && dateValue.split("-").length<=3 && dateValue.split("-")[0].length==2){
                            dateValue = dateValue.split("-").reverse().join("-")+"-01";
                        }
                    }else{
                        dateValue = null;
                    }
                
            }else if(window.winDateTypeYY.includes(id)){
                    let configColumn = $$(id).config
                    if (dateValue!='' && dateValue!=null){
                        if(dateValue.length==configColumn.attributes.maxlength && dateValue.split("-").length<=3 && dateValue.split("-")[0].length==4){
                            dateValue = dateValue.split("-").join("-")+"-01-01";
                        }else if(dateValue.length==configColumn.attributes.maxlength && dateValue.split("-").length<=3 && dateValue.split("-")[0].length==2){
                            dateValue = dateValue.split("-").reverse().join("-");
                        }
                    }else{
                        dateValue = null;
                    }
            }else{
                dateValue = dateParsersCore(dateValue)
            }
            
            let popCalendar = webix.ui(
            {
                view:"popup",
                width:300,
                position:"center",
                body:{
                    view:"calendar",
                    id:"calendar"+id,
                    date:dateValue,
                    type:type,
                    on:{
                        onAfterDateSelect: function(date){
                            let format1 = webix.Date.dateToStr(format);
                            $$(id).setValue(format1(date));
                            window.winOpenPopUp = "closed";
                            this.hide()
                        }
                    }
                },
                on:{
                    onHide:function(){
                        window.winOpenPopUp = "closed";
                        $$(menuId).enable()
                    }
                }
            });
            if (typeUse == "property") {
                paramExt['minDate'] = checkingFormatDate({"valueDate":paramExt['minDate'], "output":"year"})
                paramExt['maxDate'] = checkingFormatDate({"valueDate":paramExt['maxDate'], "output":"year"})
            }
            if (paramExt['minDate'] != undefined){
                $$(popCalendar.config.body.id).define("minDate", paramExt['minDate'])
            }
            if (paramExt['maxDate'] != undefined){
                $$(popCalendar.config.body.id).define("maxDate", paramExt['maxDate'])
            }
           
            if (dateValue != '') {
                $$("calendar"+id).selectDate(dateValue) 
            }
            return popCalendar
        }
    //------------------------------------------------------------------------------------------------- 
    
    // POP-UP BASE CLOCK----------------------------------------------------------------------------
    POPCLOCK(id,type,format,addSecond){
        let popClock = webix.ui(
        {
            view:"popup",
            width:300,
            position:"center",
            body:{
                view:"calendar",
                type:type,
                stringResult:true,
                calendarTime:"%H:%i",
                on:{
                    onAfterDateSelect: function(time){
                        let format1 = moment(time,format).format(format)
                        if(addSecond){
                            $$(id).setValue(format1+':00');
                        }else{
                            $$(id).setValue(format1);
                        }
                        window.winOpenPopUp = "closed";
                        this.hide()
                    },
                    onEnter: function(){
                        let format1 = moment(this.config.date,format).format(format)
                        if(addSecond){
                            $$(id).setValue(format1+':00');
                        }else{
                            $$(id).setValue(format1);
                        }
                        window.winOpenPopUp = "closed";
                        this.hide()
                    }
                }
            },
            on:{
                onHide:function(){
                    window.winOpenPopUp = "closed";
                    $$(menuId).enable()
                }
            }
        });
        return popClock
    }
//------------------------------------------------------------------------------------------------- 

// POP-UP BASE TIMESTAMP----------------------------------------------------------------------------
    POPTIMESTAMP(id,type,format){
        let popTimestamp = webix.ui(
        {
            view:"popup",
            width:300,
            position:"center",
            body:{
                view:"calendar",
                type:type,
                timepicker:true,
                calendarTime:"%H:%i",
                on:{
                    onAfterDateSelect: function(date){
                        let format1 = moment(date,format).format(format)
                        $$(id).setValue(format1);
                        this.hide()
                    },
                    onEnter: function(){
                        window.winOpenPopUp = "closed";
                        this.hide()
                    }
                }
            },
            on:{
                onHide:function(){
                    window.winOpenPopUp = "closed";
                    $$(menuId).enable()
                }
            }
        });
        return popTimestamp
    }
//------------------------------------------------------------------------------------------------- 

    
    // JENIS DATE ddmmyy/ddmmyyyy
        DDMMYY(property,trigger={}){
            let id = property.ITEM_ID
            let label = property.LABEL
            let customWidth = property.CUSTOM_WIDTH || undefined
            let hideItem = property.HIDE || false
            let validateItem = function(){
            let promise = new Promise((resolve)=>{
                    if(trigger.VALIDATE_ITEM != undefined){
                        resolve(trigger.VALIDATE_ITEM())
                    }
                    resolve({"status":true})
                })
                return promise
            }
            let searchlike = trigger.SEARCH_LIKE
            let disableItem = property.DISPLAY_ITEM || false
            let isPrimaryKey = property.IS_PRIMARY_KEY || false
            let customFooterDt = property.CUSTOM_FOOTER || undefined
            let bottomLabel = property.BOTTOM_LABEL || "* Date only (DD-MM-YYYY)"
            let tooltip = property.HOVER_TEXT || "* Date only (DD-MM-YYYY)"
            let goBlock = trigger.GO_BLOCK || undefined
            let goItem = trigger.GO_ITEM || undefined
            let minDate = property.MIN_DATE || undefined
            let maxDate = property.MAX_DATE || undefined
            let minDateParam = ""
            let maxDateParam = ""
            let rangeDateItem = function(){
                let promise = new Promise((resolve)=>{
                        if(trigger.RANGE_DATE != undefined){
                            resolve(trigger.RANGE_DATE())
                        }
                        resolve({"status":true})
                    })
                    return promise
            }
            let superthis = this

            let extendOnKeyPress=function(code,e){
                if(e.ctrlKey==false){
                    if ((code < 48 || code > 57) && code!=8 && code!=9 && code!=13 && code!=37 && code!=39) {
                        e.preventDefault()
                    }
                }
            }
            let extendOnBlur=function(prev){
                let newValue = prev.getValue()
                let hasil = cekDate(newValue, "DD-MM-YYYY");
                if(trigger.RANGE_DATE != undefined){
                    let varMinDate = rangeDateItem()
                    varMinDate.then(function (response) {
                        minDateParam = moment(response['minDate'], "DD-MM-YYYY") || undefined
                        maxDateParam = moment(response['maxDate'], "DD-MM-YYYY") || undefined
                        
                        let hasilFormat = moment(hasil, "DD-MM-YYYY")
                        if (hasilFormat.isBefore(minDateParam)) {
                            if(!isWebixPopupOpen()){
                                webix.alert(ALERT.ALERTERROR("Input date is before the minimum allowed date !")).then(function () {
                                    $$(id).focus()
                                    $$(id).setValue("")
                                })
                            }
                        }
                        if (hasilFormat.isAfter(maxDateParam)) {
                            if(!isWebixPopupOpen()){
                                webix.alert(ALERT.ALERTERROR("Input date is more than the maximum allowed date !")).then(function () {
                                    $$(id).focus()
                                    $$(id).setValue("")
                                })
                            }
                        }
                    })
                }
                $$(id).setValue(hasil)
            }
            let extendOn={
                onSearchIconClick:function(e){
                    let typeUse = ""
                    if(trigger.RANGE_DATE != undefined){

                        let varMinDate = rangeDateItem()
                        varMinDate.then(function (response) {
                            typeUse = "trigger"
                            minDateParam = moment(response['minDate'], "DD-MM-YYYY").format('YYYY-MM-DD') || undefined
                            maxDateParam = moment(response['maxDate'], "DD-MM-YYYY").format('YYYY-MM-DD') || undefined
                            if(!isPrimaryKey && !disableItem){
                                let hasil = cekDate($$(id).getValue(), "DD-MM-YYYY");
                                $$(id).setValue(hasil)
                                window.winOpenPopUp = "open";
                                
                                let paramExt = {"minDate":minDateParam, "maxDate":maxDateParam}
                                superthis.POPCALENDAR(id,"date","%d-%m-%Y", paramExt,typeUse).show()
                                $$(menuId).disable()
                            }else if(isPrimaryKey){
                                if(winAddData || winSearchMode){
                                    let hasil = cekDate($$(id).getValue(), "DD-MM-YYYY");
                                    $$(id).setValue(hasil)
                                    window.winOpenPopUp = "open";
                                    let paramExt = {"minDate":minDateParam, "maxDate":maxDateParam}
                                    superthis.POPCALENDAR(id,"date","%d-%m-%Y", paramExt,typeUse).show()
                                    $$(menuId).disable()
                                }
                            }
                            
                        })
                    }else{
                        typeUse = "property"
                        if(!isPrimaryKey && !disableItem){
                            let hasil = cekDate($$(id).getValue(), "DD-MM-YYYY");
                            $$(id).setValue(hasil)
                            window.winOpenPopUp = "open";
                            
                            let paramExt = {"minDate":minDate, "maxDate":maxDate}
                            superthis.POPCALENDAR(id,"date","%d-%m-%Y", paramExt,typeUse).show()
                            $$(menuId).disable()
                        }else if(isPrimaryKey){
                            if(winAddData || winSearchMode){
                                let hasil = cekDate($$(id).getValue(), "DD-MM-YYYY");
                                $$(id).setValue(hasil)
                                window.winOpenPopUp = "open";
                                let paramExt = {"minDate":minDate, "maxDate":maxDate}
                                superthis.POPCALENDAR(id,"date","%d-%m-%Y", paramExt, typeUse).show()
                                $$(menuId).disable()
                            }
                        }
                    }
                }
            }

            let date = super.baseText({id:id, label:label, displayItem:disableItem, hideItem:hideItem, customWidth: customWidth},{extendOnKeyPress:extendOnKeyPress,validateItem:validateItem,extendOnBlur:extendOnBlur,extendOn:extendOn,SEARCH_LIKE:searchlike,GO_BLOCK:goBlock ,GO_ITEM:goItem})
            date = Object.assign(date, {view:"search", attributes:{ maxlength:10 },rangeDateItem:rangeDateItem,
            icon:"mdi mdi-calendar", jenis:"date", formatJenis : "DD-MM-YYYY", customFooterDt:customFooterDt, bottomLabel:bottomLabel, tooltip:tooltip})
            if(isPrimaryKey){
                date = Object.assign(date, {css:"primary_key",cssDt:"primary_cell", readonly:true, jenis:"date", isPrimaryKey:true})
                winIsPrimary.push(id)
            }
            if(disableItem){
                date = Object.assign(date, {css:"textdisplay",cssDt:"textdisplay", readonly:true, jenis:"date", bottomLabel:'*view only'})
                winDisplayItem.push(id)
            }
            window.winDateType.push(id)
            return date;
        }

        MMYY(property,trigger={}){
            let id = property.ITEM_ID
            let label = property.LABEL
            let customWidth = property.CUSTOM_WIDTH || undefined
            let hideItem = property.HIDE || false
            let validateItem = function(){
            let promise = new Promise((resolve)=>{
                if(trigger.VALIDATE_ITEM != undefined){
                    resolve(trigger.VALIDATE_ITEM())
                }
                    resolve({"status":true})
                })
                return promise
            }
            let searchlike = trigger.SEARCH_LIKE
            let disableItem = property.DISPLAY_ITEM || false
            let isPrimaryKey = property.IS_PRIMARY_KEY || false
            let customFooterDt = property.CUSTOM_FOOTER || undefined
            let bottomLabel = property.BOTTOM_LABEL || "* Date only (MM-YYYY)"
            let tooltip = property.HOVER_TEXT || "* Date only (MM-YYYY)"
            let goBlock = trigger.GO_BLOCK || undefined
            let goItem = trigger.GO_ITEM || undefined
            let minDate = property.MIN_DATE || undefined
            let maxDate = property.MAX_DATE || undefined
            let minDateParam = ""
            let maxDateParam = ""
            let rangeDateItem = function(){
                let promise = new Promise((resolve)=>{
                        if(trigger.RANGE_DATE != undefined){
                            resolve(trigger.RANGE_DATE())
                        }
                        resolve({"status":true})
                    })
                    return promise
            }
            let superthis = this

            let extendOnKeyPress=function(code,e){
                if(e.ctrlKey==false){
                    if ((code < 48 || code > 57) && code!=8 && code!=9 && code!=13 && code!=37 && code!=39) {
                        e.preventDefault()
                    }
                }
            }
            let extendOnBlur=function(prev){
                let newValue = prev.getValue()
                let hasil = cekDate(newValue,"MM-YYYY")
                if(trigger.RANGE_DATE != undefined){
                    let varMinDate = rangeDateItem()
                    varMinDate.then(function (response) {   
                        minDateParam = moment(response['minDate'], "MM-YYYY") || undefined
                        maxDateParam = moment(response['maxDate'], "MM-YYYY") || undefined
                        let hasilFormat = moment(hasil, "MM-YYYY")
                        if (hasilFormat.isBefore(minDateParam)) {
                            if(!isWebixPopupOpen()){
                                webix.alert(ALERT.ALERTERROR("Input date is before the minimum allowed date !")).then(function () {
                                    $$(id).focus()
                                    $$(id).setValue("")
                                })
                            }
                        }
                        if (hasilFormat.isAfter(maxDateParam)) {
                            if(!isWebixPopupOpen()){
                                webix.alert(ALERT.ALERTERROR("Input date is more than the maximum allowed date !")).then(function () {
                                    $$(id).focus()
                                    $$(id).setValue("")
                                })
                            }
                        }
                        
                        
                    })
                }
                $$(id).setValue(hasil)
            }
            let extendOn={
                onSearchIconClick:function(e){
                    let typeUse = ""
                    if(trigger.RANGE_DATE != undefined){
                        typeUse = "trigger"
                        let varMinDate = rangeDateItem()
                        varMinDate.then(function (response) {
                            minDateParam = moment(response['minDate'], "MM-YYYY").format("YYYY-MM") || undefined
                            maxDateParam = moment(response['maxDate'], "MM-YYYY").format("YYYY-MM") || undefined
                            if(!isPrimaryKey && !disableItem){
                                let hasil = cekDate($$(id).getValue(), "MM-YYYY");
                                $$(id).setValue(hasil)
                                window.winOpenPopUp = "open";
                                
                                let paramExt = {"minDate":minDateParam, "maxDate":maxDateParam}
                                superthis.POPCALENDAR(id,"month","%m-%Y", paramExt,typeUse).show()
                                $$(menuId).disable()
                            }else if(isPrimaryKey){
                                if(winAddData || winSearchMode){
                                    let hasil = cekDate($$(id).getValue(), "MM-YYYY");
                                    $$(id).setValue(hasil)
                                    window.winOpenPopUp = "open";
                                    let paramExt = {"minDate":minDateParam, "maxDate":maxDateParam}
                                    superthis.POPCALENDAR(id,"month","%m-%Y", paramExt,typeUse).show()
                                    $$(menuId).disable()
                                }
                            }
                        })
                    }else{
                        typeUse = "property"
                        if(!isPrimaryKey && !disableItem){
                            let hasil = cekDate($$(id).getValue(),"MM-YYYY")
                            $$(id).setValue(hasil)
                            window.winOpenPopUp = "open";
                            let paramExt = {"minDate":minDate, "maxDate":maxDate}
                            superthis.POPCALENDAR(id,"month","%m-%Y", paramExt,typeUse).show()
                            $$(menuId).disable()
                        }else if(isPrimaryKey){
                            if(winAddData || winSearchMode){
                                let hasil = cekDate($$(id).getValue(),"MM-YYYY")
                                $$(id).setValue(hasil)
                                window.winOpenPopUp = "open";
                                let paramExt = {"minDate":minDate, "maxDate":maxDate}
                                superthis.POPCALENDAR(id,"month","%m-%Y", paramExt,typeUse).show()
                                $$(menuId).disable()
                            }
                        }
                    }
                }
            }

            let date = super.baseText({id:id, label:label, displayItem:disableItem, hideItem:hideItem, customWidth: customWidth},{extendOnKeyPress:extendOnKeyPress,validateItem:validateItem,extendOnBlur:extendOnBlur,extendOn:extendOn,SEARCH_LIKE:searchlike,GO_BLOCK:goBlock ,GO_ITEM:goItem})
            date = Object.assign(date,{view:"search", attributes:{ maxlength:7 },rangeDateItem:rangeDateItem,
            icon:"mdi mdi-calendar", jenis:"date", formatJenis : "MM-YYYY", customFooterDt:customFooterDt, bottomLabel:bottomLabel, tooltip:tooltip})
            if(isPrimaryKey){
                date = Object.assign(date,{css:"primary_key",cssDt:"primary_cell", readonly:true, jenis:"date", isPrimaryKey:true})
                winIsPrimary.push(id)
            }
            if(disableItem){
                date = Object.assign(date, {css:"textdisplay",cssDt:"textdisplay", readonly:true, jenis:"date", bottomLabel:'*view only'})
                winDisplayItem.push(id)
            }
            window.winDateTypeMMYY.push(id)
            return date;
        }

        YY(property,trigger={}){
            let id = property.ITEM_ID
            let label = property.LABEL
            let customWidth = property.CUSTOM_WIDTH || undefined
            let hideItem = property.HIDE || false
            let validateItem = function(){
            let promise = new Promise((resolve)=>{
                    if(trigger.VALIDATE_ITEM != undefined){
                        resolve(trigger.VALIDATE_ITEM())
                    }
                    resolve({"status":true})
                })
                return promise
            }
            let searchlike = trigger.SEARCH_LIKE
            let disableItem = property.DISPLAY_ITEM || false
            let isPrimaryKey = property.IS_PRIMARY_KEY || false
            let customFooterDt = property.CUSTOM_FOOTER || undefined
            let bottomLabel = property.BOTTOM_LABEL || "* Date only (YYYY)"
            let tooltip = property.HOVER_TEXT || "* Date only (YYYY)"
            let goBlock = trigger.GO_BLOCK || undefined
            let goItem = trigger.GO_ITEM || undefined
            let minDate = property.MIN_DATE || undefined
            let maxDate = property.MAX_DATE || undefined
            let minDateParam = ""
            let maxDateParam = ""
            let rangeDateItem = function(){
                let promise = new Promise((resolve)=>{
                        if(trigger.RANGE_DATE != undefined){
                            resolve(trigger.RANGE_DATE())
                        }
                        resolve({"status":true})
                    })
                    return promise
            }
            let superthis = this

            let extendOnKeyPress=function(code,e){
                if(e.ctrlKey==false){
                    if ((code < 48 || code > 57) && code!=8 && code!=9 && code!=13 && code!=37 && code!=39) {
                        e.preventDefault()
                    }
                }
            }
            let extendOnBlur=function(prev){
                let newValue = prev.getValue()
                let hasil = cekDate(newValue, "YYYY");
                if(trigger.RANGE_DATE != undefined){
                    let varMinDate = rangeDateItem()
                    varMinDate.then(function (response) {
                        minDateParam = moment(response['minDate'], "YYYY") || undefined
                        maxDateParam = moment(response['maxDate'], "YYYY") || undefined
                        let hasilFormat = moment(hasil, "YYYY")
                        if (hasilFormat.isBefore(minDateParam)) {
                            if(!isWebixPopupOpen()){
                                webix.alert(ALERT.ALERTERROR("Input date is before the minimum allowed date !")).then(function () {
                                    $$(id).focus()
                                    $$(id).setValue("")
                                })
                            }
                        }
                        if (hasilFormat.isAfter(maxDateParam)) {
                            if(!isWebixPopupOpen()){
                                webix.alert(ALERT.ALERTERROR("Input date is more than the maximum allowed date !")).then(function () {
                                    $$(id).focus()
                                    $$(id).setValue("")
                                })
                            }
                        }
                        
                    })
                }
                $$(id).setValue(hasil)
            }
            let extendOn={
                onSearchIconClick:function(e){
                    let typeUse = ""
                    if(trigger.RANGE_DATE != undefined){
                        typeUse = "trigger"
                        let varMinDate = rangeDateItem()
                        varMinDate.then(function (response) {
                            minDateParam = response['minDate'] || undefined
                            maxDateParam = response['maxDate'] || undefined
                            if(!isPrimaryKey && !disableItem){
                                let hasil = cekDate($$(id).getValue(), "YYYY");
                                $$(id).setValue(hasil)
                                window.winOpenPopUp = "open";
                                
                                let paramExt = {"minDate":minDateParam, "maxDate":maxDateParam}
                                superthis.POPCALENDAR(id,"year","%Y", paramExt,typeUse).show()
                                $$(menuId).disable()
                            }else if(isPrimaryKey){
                                if(winAddData || winSearchMode){
                                    let hasil = cekDate($$(id).getValue(), "YYYY");
                                    $$(id).setValue(hasil)
                                    window.winOpenPopUp = "open";
                                    let paramExt = {"minDate":minDateParam, "maxDate":maxDateParam}
                                    superthis.POPCALENDAR(id,"year","%Y", paramExt,typeUse).show()
                                    $$(menuId).disable()
                                }
                            }
                            
                        })
                    }else{
                        typeUse = "property"
                        if(!isPrimaryKey && !disableItem){
                            let hasil = cekDate($$(id).getValue(), "YYYY");
                            $$(id).setValue(hasil)
                            window.winOpenPopUp = "open";
                            let paramExt = {"minDate":minDate, "maxDate":maxDate}
                            superthis.POPCALENDAR(id,"year","%Y", paramExt,typeUse).show()
                            $$(menuId).disable()
                        }else if(isPrimaryKey){
                            if(winAddData || winSearchMode){
                                let hasil = cekDate($$(id).getValue(), "YYYY");
                                $$(id).setValue(hasil)
                                window.winOpenPopUp = "open";
                                let paramExt = {"minDate":minDate, "maxDate":maxDate}
                                superthis.POPCALENDAR(id,"year","%Y", paramExt,typeUse).show()
                                $$(menuId).disable()
                            }
                        }
                    }
                }
            }

            let date = super.baseText({id:id, label:label, displayItem:disableItem, hideItem:hideItem, customWidth: customWidth},{extendOnKeyPress:extendOnKeyPress,validateItem:validateItem,extendOnBlur:extendOnBlur,extendOn:extendOn,SEARCH_LIKE:searchlike,GO_BLOCK:goBlock ,GO_ITEM:goItem})
            date = Object.assign(date, {view:"search", attributes:{ maxlength:4 },rangeDateItem:rangeDateItem,
            icon:"mdi mdi-calendar",jenis:"date", formatJenis : "YYYY", customFooterDt:customFooterDt,bottomLabel:bottomLabel, tooltip:tooltip})
            if(isPrimaryKey){
                date = Object.assign(date, {css:"primary_key",cssDt:"primary_cell", readonly:true, jenis:"date", isPrimaryKey:true})
                winIsPrimary.push(id)
            }
            if(disableItem){
                date = Object.assign(date, {css:"textdisplay",cssDt:"textdisplay", readonly:true, jenis:"date", bottomLabel:'*view only'})
                winDisplayItem.push(id)
            }
            window.winDateTypeYY.push(id)
            return date;
        }

        CLOCK(property,trigger={}){
            // moment('23:59:59','HHmmss').format("HH:mm:ss")
            let id = property.ITEM_ID
            let label = property.LABEL
            let customWidth = property.CUSTOM_WIDTH || undefined
            let hideItem = property.HIDE || false
            let addSecond = property.ADD_SECOND || false
            let dateId = property.DATE_ID || undefined
            let validateItem = function(){
            let promise = new Promise((resolve)=>{
                    if(trigger.VALIDATE_ITEM != undefined){
                        resolve(trigger.VALIDATE_ITEM())
                    }
                    resolve({"status":true})
                })
                return promise
            }
            let searchlike = trigger.SEARCH_LIKE
            let disableItem = property.DISPLAY_ITEM || false
            let customFooterDt = property.CUSTOM_FOOTER || undefined
            let bottomLabel = property.BOTTOM_LABEL || "* Time only (HH:MM/HH:MM:ss)"
            let tooltip = property.HOVER_TEXT || "* Time only (HH:MM/HH:MM:ss)"
            let goBlock = trigger.GO_BLOCK || undefined
            let goItem = trigger.GO_ITEM || undefined
            let superthis = this

            let extendOnKeyPress=function(code,e){
                if(e.ctrlKey==false){
                    if ((code < 48 || code > 58) && code!=8 && code!=9 && code!=13 && code!=37 && code!=39) {
                        e.preventDefault()
                    }
                }
            }

            let extendOnBlur=function(prev){
                let newValue = prev.getValue()
                if(newValue.includes(":")){
                    let hasil = ""
                    if(parseInt(newValue.slice(0, 2))<24){
                        if(parseInt(newValue.slice(3, 5))<=59){
                            if(parseInt(newValue.slice(6, 8))<=59 && !isNaN(parseInt(newValue.slice(6, 8)))){
                                hasil = moment(newValue,'HH:mm:ss').format("HH:mm:ss")
                            }
                            else if(isNaN(parseInt(newValue.slice(6, 8))) && addSecond){
                                hasil = moment(newValue,'HH:mm').format("HH:mm")+':00'
                            }
                            else if(isNaN(parseInt(newValue.slice(6, 8))) && !addSecond){
                                hasil = moment(newValue,'HH:mm').format("HH:mm")
                            }
                            else{
                                
                            hasil = ""
                            }
                        }else{
                            hasil = ""
                        }
                    }
                    else{
                        hasil = ""
                    }
                    $$(id).setValue(hasil)   
                }else{
                    let hasil = ""
                    if(parseInt(newValue.slice(0, 2))<24){
                        if(parseInt(newValue.slice(2, 4))<=59){
                            if(parseInt(newValue.slice(4, 6))<=59 && !isNaN(parseInt(newValue.slice(4, 6)))){
                                if(addSecond){
                                    hasil = moment(newValue,'HH:mm:ss').format("HH:mm:ss")
                                }else{
                                    hasil = moment(newValue,'HH:mm').format("HH:mm")
                                }
                            }
                            else if(isNaN(parseInt(newValue.slice(4, 6))) && addSecond){
                                hasil = moment(newValue,'HH:mm').format("HH:mm")+':00'
                            }   
                            else if(isNaN(parseInt(newValue.slice(4, 6))) && !addSecond){
                                hasil = moment(newValue,'HH:mm').format("HH:mm")
                            }
                            else{
                                
                            hasil = ""
                            }
                        }else if(isNaN(parseInt(newValue.slice(2, 4)))){
                            hasil = moment(newValue,'HH:mm').format("HH:mm")
                        }else{
                            hasil = ""
                        }
                    }
                    else{
                        hasil = ""
                    }
                    $$(id).setValue(hasil)
                }
            }

            let extendOn={
                onSearchIconClick:function(e){
                    if(!disableItem){
                        window.winOpenPopUp = "open";
                        superthis.POPCLOCK(id,"time","HH:mm").show()
                        $$(menuId).disable()
                    }
                    
                }
            }
            
            let clock = super.baseText({id:id, label:label, displayItem:disableItem, hideItem:hideItem, customWidth: customWidth},{extendOnKeyPress:extendOnKeyPress,validateItem:validateItem,extendOnBlur:extendOnBlur,extendOn:extendOn,SEARCH_LIKE:searchlike,GO_BLOCK:goBlock ,GO_ITEM:goItem})
            if(addSecond){
                clock = Object.assign(clock, {view:"search", attributes:{ maxlength:8 }, icon:"mdi mdi-clock",jenis:"clock", dateId:dateId, addSecond:addSecond,customFooterDt:customFooterDt, bottomLabel:bottomLabel, tooltip:tooltip})
            }else{
                clock = Object.assign(clock, {view:"search", attributes:{ maxlength:5 }, icon:"mdi mdi-clock",jenis:"clock", dateId:dateId, addSecond:addSecond, customFooterDt:customFooterDt, bottomLabel:bottomLabel, tooltip:tooltip})
            }
            window.winClockType.push(id)
            if(disableItem){
                clock = Object.assign(clock, {css:"textdisplay",cssDt:"textdisplay", readonly:true, jenis:"clock", bottomLabel:'*view only'})
                winDisplayItem.push(id)
            }
            return clock;
        }
        TIMESTAMP(property,trigger={}){
            let id = property.ITEM_ID
            let label = property.LABEL
            let maxLength = 19
            let customWidth = property.CUSTOM_WIDTH || undefined
            let hideItem = property.HIDE || false
            let formatTimestamp = "DD-MM-YYYY HH:mm:ss"
            let validateItem = function(){
            let promise = new Promise((resolve)=>{
                    if(trigger.VALIDATE_ITEM != undefined){
                        resolve(trigger.VALIDATE_ITEM())
                    }
                    resolve({"status":true})
                })
                return promise
            }
            let searchlike = trigger.SEARCH_LIKE
            let disableItem = property.DISPLAY_ITEM || false
            let isPrimaryKey = property.IS_PRIMARY_KEY || false
            let customFooterDt = property.CUSTOM_FOOTER || undefined
            let bottomLabel = property.BOTTOM_LABEL || "* Timestamp only"
            let tooltip = property.HOVER_TEXT || "* Timestamp only"
            let goBlock = trigger.GO_BLOCK || undefined
            let goItem = trigger.GO_ITEM || undefined
            let hideSecond = property.HIDE_SECOND || false
            let hideMinute = property.HIDE_MINUTE || false

            if(hideMinute){
                maxLength = 13
                formatTimestamp = "DD-MM-YYYY HH"
            }else if(hideSecond){
                maxLength = 16
                formatTimestamp = "DD-MM-YYYY HH:mm"
            }

            let superthis = this

            let extendOnKeyPress=function(code,e){
                if(e.ctrlKey==false){
                    if ((code < 48 || code > 58) && code!=8 && code!=9 && code!=13 && code!=37 && code!=39 && code!=32) {
                        e.preventDefault()
                    }
                }
            }
            let extendOnBlur=function(prev){
                let newValue = prev.getValue()
                let hasil = cekDate(newValue, formatTimestamp);
                
                $$(id).setValue(hasil)
            }
            let extendOn={
                onSearchIconClick:function(e){
                    if(!isPrimaryKey && !disableItem){
                        let hasil = cekDate($$(id).getValue(),formatTimestamp)
                        $$(id).setValue(hasil)
                        window.winOpenPopUp = "open";
                        superthis.POPTIMESTAMP(id,"date",formatTimestamp).show()
                        $$(menuId).disable()
                    }else if(isPrimaryKey){
                        // let inNewForm = id in Object.keys(winConfigForm[window.winActiveBlock['focusNow']]['WHEN_NEW_FORM'])
                        if(winAddData || winSearchMode){
                            let hasil = cekDate($$(id).getValue(),formatTimestamp)
                            $$(id).setValue(hasil)
                            window.winOpenPopUp = "open";
                            superthis.POPTIMESTAMP(id,"date",formatTimestamp).show()
                            $$(menuId).disable()
                        }
                    }
                }
            }
    
            let timestamp = super.baseText({id:id, label:label, displayItem:disableItem, hideItem:hideItem, customWidth: customWidth},{extendOnKeyPress:extendOnKeyPress,validateItem:validateItem,extendOnBlur:extendOnBlur,extendOn:extendOn,SEARCH_LIKE:searchlike,GO_BLOCK:goBlock ,GO_ITEM:goItem})
            timestamp = Object.assign(timestamp,{view:"search", attributes:{ maxlength:maxLength },
            icon:"mdi mdi-calendar-clock", customFooterDt:customFooterDt, bottomLabel:bottomLabel, tooltip:tooltip, jenis:"timestamp", hideSecond:hideSecond, hideMinute:hideMinute, formatJenis : formatTimestamp })
            window.winTimestampType.push(id)

            if(isPrimaryKey){
                timestamp = Object.assign(timestamp, {css:"primary_key",cssDt:"primary_cell", readonly:true, isPrimaryKey:true})
                winIsPrimary.push(id)
            }
            if(disableItem){
                timestamp = Object.assign(timestamp, {css:"textdisplay",cssDt:"textdisplay", readonly:true, jenis:"timestamp", bottomLabel:'*view only'})
                winDisplayItem.push(id)
            }
            return timestamp;
        }
    // ------------------------------------------------------------------------------------------------------
    
    
}

class Picture extends Base{
    PASPHOTO(property,trigger={}){
        let id = property.ITEM_ID
        let length = property.LENGTH
        let customWidth = property.CUSTOM_WIDTH || 220
        let hideItem = true
        let validateItem = function(){
            let promise = new Promise((resolve)=>{
                if(trigger.VALIDATE_ITEM != undefined){
                    resolve(trigger.VALIDATE_ITEM())
                }
                resolve({"status":true})
            })
            return promise
        }
        let formatDate = property.FORMAT_DATE  || false
        let customFooterDt = property.CUSTOM_FOOTER || undefined
        let extendOn = {}
        let pasphototext = super.baseText({id:id,label:"ÃƒÂ¢Ã¢â€šÂ¬Ã…Â½",length:length, displayItem:true, hideItem:hideItem, customWidth: customWidth},{validateItem:validateItem, extendOn:extendOn})
        pasphototext = Object.assign(pasphototext, {jenis:"display",displayItem:true, customFooterDt:customFooterDt})
        pasphototext.readonly = true
        winDisplayItem.push(id)
        let pasphototemplate = {view: "template", id:"pasphoto_"+id, height:200, width:180, template: "<img src='static/fotoprofil.jpeg' width='180px' height='200px' class='content' ondragstart='return false'/>",borderless: 1 }
        winImageElement.push({idElement:id, idTemplate:"pasphoto_"+id})
        return {
            rows:[
                pasphototemplate,
                pasphototext
            ]
        }
    }
}

class Pager{
    NORMALPAGER(id,size,group){
        let pager = {
            view:"pager",
            id:id,
            template:`{common.first()} {common.prev()} {common.pages()}
                    {common.next()} {common.last()}`,
            size:size,
            group:group
        }
        return pager
    }
}

class ListView{
    LISTVIEW(property,trigger){
        let id = property.ITEM_ID
        let listFile = {
            view:"list",  
            id:id, 
            type:"uploader",
            autoheight:true, 
            borderless:true 
        }
        return listFile
    }
}

class Custom extends Base{
    CUSTOMELEMENTDT(property,trigger){
        let id = property.ITEM_ID
        let label = property.LABEL
        let customWidth = property.CUSTOM_WIDTH || undefined
        let customTemplate = property.TEMPLATE || ""
        let compare = property.COMPARE || undefined
        let itemStatus = property.ITEM_STATUS || undefined
        let callForm = property.CALL_FORM || false
        let customElementDt = {id: id, header:{ text:label, css:{'text-align':'center'}}, fillspace:false, "call_form":callForm, 
            width:customWidth||150, template:customTemplate,css:"datatablAlignCenter", jenis:"customElement", compare:compare, status:itemStatus, editor:"customElement"}
        return customElementDt
    }
}

window.winButtonCallForm = []
class Button extends Base{

    BUTTONDATAGRID(property, trigger){
        let id = property.ITEM_ID
        let label = property.LABEL
        let labelColumn = property.COLUMN_LABEL || label
        let customWidth = property.CUSTOM_WIDTH || undefined
        let callForm = property.CALL_FORM || false
        let triggerOnClick = trigger.CUSTOM_CLICK
        let detailBtn = {id: id, header:{ text:labelColumn, css:"datatablAlignCenter"}, fillspace:false, "call_form":callForm, 
            width:customWidth||150, template:`<input data-id='${id}' class='detailCustomButton' type='button' value= '${label}'>`, 
            css:"datatablAlignCenter", jenis:"btnDatagrid", editor:"btnDatagrid", customWidth:customWidth, customTrigger : triggerOnClick}

        if(callForm){
            window.winButtonCallForm.push(id)
        }
        additionalMultiLanguage.push(property.ITEM_ID)

        winAdditionalTemplate[id+"__btnDatagrid"] = label
        return detailBtn
    }

    BUTTONFORM(property, trigger){
        let id = property.ITEM_ID
        let label = property.LABEL
        let customWidth = property.CUSTOM_WIDTH || undefined
        let callForm = property.CALL_FORM || false
        let disabledBtn = property.DISPLAY_ITEM || false
        let triggerOnClick = trigger.CUSTOM_CLICK
        let customBtnForm = {
            "id": id, "name": id, "value": label, "view": "button",disabled:disabledBtn, css: "webix_primary", width:customWidth||150, height:38, "call_form":callForm,
            "on": {
                onFocus:function(){
                    if(window.winActiveBlock["focusNow"]==""){
                        let activeNow = getParentViewCustom(id)
                        while(activeNow==activeNow.match(/^\$layout.*$/)){
                            activeNow = $$(activeNow).getParentView().config.id
                            if(activeNow!=activeNow.match(/^\$layout.*$/)){
                                if($$(activeNow).config.view!="form" && $$(activeNow).config.view!="datatable"){
                                    activeNow = $$(activeNow).getParentView().config.id
                                }
                            }
                        }
                        window.winActiveBlock['focusNow'] = activeNow
                        if(window.winActiveBlock["lastFocus"]!=""){
                            webix.html.removeCss($$(window.winActiveBlock["lastFocus"]).getNode(), "datablock-focus")
                        }
                        webix.html.addCss($$(window.winActiveBlock["focusNow"]).getNode(), "datablock-focus")
                    // }else if(window.winActiveBlock["focusNow"]==$$(id).getParentView().getParentView().config.id){
                    //     if(preItem!=false){
                    //         preItem()
                    //     }
                    }else if(window.winActiveBlock["focusNow"]!=$$(id).getParentView().getParentView().config.id && $$(window.winActiveBlock["focusNow"]).validate()===true && $$(window.winActiveBlock["focusNow"]).validate()!= ''){
                        window.winActiveBlock["lastFocus"] = window.winActiveBlock["focusNow"]
                        let activeNow = window.winActiveBlock["focusNow"] = $$(id).getParentView().getParentView().config.id
                        while($$(activeNow).config.view!="form" && $$(activeNow).config.view!="datatable"){
                            activeNow = $$(activeNow).getParentView().config.id
                        }
                        window.winActiveBlock['focusNow'] = activeNow
                        if(window.winActiveBlock["lastFocus"]!=""){
                            webix.html.removeCss($$(window.winActiveBlock["lastFocus"]).getNode(), "datablock-focus")
                        }
                        webix.html.addCss($$(window.winActiveBlock["focusNow"]).getNode(), "datablock-focus")
                    }else if(window.winActiveBlock["focusNow"]!=$$(id).getParentView().config.id && ($$(window.winActiveBlock["focusNow"]).validate()==false||$$(window.winActiveBlock["focusNow"]).validate()=='')){
                        if($$(window.winActiveBlock['focusNow']).config.view == "datatable"){
                            if(!isWebixPopupOpen()){
                                webix.alert(ALERT.ALERTERROR('Validation Failed')).then(function(){
                                    window.winActiveCell['view'].editCell(window.winActiveCell['pos']['row'], window.winActiveCell['pos']['column']);
                                })
                            }
                        }
                    }else{
                        let activeNow = window.winActiveBlock["focusNow"] = $$(id).getParentView().getParentView().config.id

                        while($$(activeNow).config.view!="form" && $$(activeNow).config.view!="datatable"){
                            activeNow = $$(activeNow).getParentView().config.id
                        }
                        window.winActiveBlock['focusNow'] = activeNow
                        if(window.winActiveBlock["lastFocus"]!=""){
                            webix.html.removeCss($$(window.winActiveBlock["lastFocus"]).getNode(), "datablock-focus")
                        }
                        webix.html.addCss($$(window.winActiveBlock["focusNow"]).getNode(), "datablock-focus")
                    }
                },
                onItemClick:function(){
                    triggerOnClick()
                },
                onKeyPress:base.baseCommonKeyPress(),
            },
        }
        // //console.log(4891,this)
        customBtnForm = {rows:[{height:24},customBtnForm]}
        if(callForm){
            window.winButtonCallForm.push(id)
        } 
        if(disabledBtn){
            window.winDisabledButton.push(id)
        }
        additionalMultiLanguage.push(property.ITEM_ID)
        return customBtnForm
    }

    BUTTONUPLOADERFORM(property, trigger){
        let idUploader = property.ITEM_ID
        let idDatagridUploader = property.DATAGRID_UPLOADER || undefined
        let label = property.LABEL
        let sectionLabel = property.SECTION || ""
        let allowFile = property.ALLOW_FILE || undefined
        let downloadFile, deleteFile, viewFile
        if(property.DOWNLOAD_FILE != undefined){
            downloadFile = property.DOWNLOAD_FILE
        }else{
            downloadFile = true
        }

        if(property.DELETE_FILE != undefined){
            deleteFile = property.DELETE_FILE
        }else{
            deleteFile = true
        }

        if(property.VIEW_FILE != undefined){
            viewFile = property.VIEW_FILE
        }else{
            viewFile = true
        } 
        let maxSize = property.MAX_SIZE || undefined
        let multipleFile = property.MULTIPLE_FILES || false
        let colsFile = property.COLS_FILE || {"oldFileName":"oldFileName","newFileName":"newFileName"}
        let id_datatable = property.ID_DT || undefined
        let file_required = property.REQUIRED || false
        let jenis_file = property.JENIS_FILE || undefined
        let dataParam = property.ADD_PARAM || []
        let useStamp = property.USE_STAMP || undefined //confidential / internaluse
        let heightPopup = property.HEIGHT_POPUP || undefined
        let widthPopup = property.WIDTH_POPUP || undefined
        let positionStamp = property.POSITION_STAMP || "bottom-right" //bottom-right / bottom-center / bottom-left
        let allowExtentionFile = []
        let allowExtNameFile = []
        let renameFileById = property.RENAME_FILE_BY_ID || undefined
        let triggerOnClickRemove = function(){return {"status":true}}
        if(trigger!=undefined){
            triggerOnClickRemove = trigger.CUSTOM_CLICK.REMOVE || function(){return {"status":true}}
        }
        let triggerOnClickDownload = function(){return {"status":true}}
        if(trigger!=undefined){
            triggerOnClickDownload = trigger.CUSTOM_CLICK.DOWNLOAD || function(){return {"status":true}}
        }
        let triggerOnClickView = function(){return {"status":true}}
        if(trigger!=undefined){
            triggerOnClickView = trigger.CUSTOM_CLICK.VIEW || function(){return {"status":true}}
        }

        let zoompdf = property.ZOOM_PDF || '100%'

        let textMaxSize
        let maxSizeConvert
        if(maxSize!=undefined){
            maxSizeConvert = maxSize*1000
            if (maxSize < 1000 ){
                textMaxSize = maxSize+" KB"
            }else if (maxSize >= 1000){
                textMaxSize = (maxSize/1000)+" MB"
            }
        }

        if(allowFile!=undefined){
            allowFile.forEach(function(ext){
                allowExtentionFile.push("."+ext.toLowerCase())
                allowExtNameFile.push(ext.toLowerCase())
            })
        }

        let sectionUploaderHeader = { 
            id:"section_"+idUploader,
            view:"template", 
            template:sectionLabel, 
            type:"section"
        }

        let itemOldHidden = TEXTBOX.TEXTNORMAL({ITEM_ID: colsFile['oldFileName'], LABEL: "", LENGTH: 100, HIDE:true})
        let itemNewHidden = TEXTBOX.TEXTNORMAL({ITEM_ID: colsFile['newFileName'], LABEL: "", LENGTH: 100, HIDE:true})
        
        let listFile = {
            view:"list",  
            id:"listUploader_"+idUploader+"_"+menuId, 
            type:"uploader",
            template:"<div class='webix_remove_upload' style='position: relative;'>" +
            "<span class='dl webix_icon wxi-close' title='delete file' style='cursor: pointer; color: initial;' " +
            "onmouseover='this.style.color=&quot;red&quot;' " +
            "onmouseout='this.style.color=&quot;initial&quot;'></span>" +
            "</div>" +
            "<div class='webix_download_file '>" +
            "<span class='dl webix_icon wxi-download' title='download file'></span>" +
            "</div>" +
            "<div class='webix_view_file'>" +
            "<span class='dl webix_icon wxi-eye' title='view file'></span>" +
            "</div>" +
            "{common.percent()}" +
            "<div style='float:right'>#sizetext#</div>" +
            "{common.fileName()}",
            autoheight:true, 
            borderless:true,
            onClick: {
                webix_remove_upload(e, id) {
                    let resultTrigger = triggerOnClickRemove()
                    
                    if(resultTrigger['status']){
                        // custom logic
                        
                        let objUploader = $$(this.config.uploader)
                        let objList = this
                        let detailFile = objUploader.files.getItem(id)
                        if(detailFile.status == "client" || detailFile.status == "error"){
                            webix.confirm({
                                title:"Konfirmasi Hapus File",
                                text:"Hapus File<br>"+detailFile.name,
                                ok:"Hapus",
                                cancel:"Batal",
                                type:"alert-warning"
                            }).then(function(result){
                                if(result){
                                    $$("listUploader_"+idUploader+"_"+menuId).remove(detailFile.id);
                                    $$(idUploader).files.remove(detailFile.id)
                                }
                            })
                        }else if(detailFile.status == "server"){
                            webix.confirm({
                                title:"Konfirmasi Hapus File",
                                text:"Hapus File<br>"+detailFile.name,
                                ok:"Hapus",
                                cancel:"Batal",
                                type:"alert-warning"
                            }).then(function(result){
                                if(result){
                                    
                                let apiNameDownload = objList.config.uploader+"_"+menuId
                                if (idDatagridUploader!= undefined){
                                    apiNameDownload = idDatagridUploader+"_"+menuId
                                }
                                    let param = {
                                        "DATA":[],
                                        "API_NAME":apiNameDownload,
                                        "FILE_TYPE":"single",
                                        "TYPE":"delete",
                                        "JENIS_FILE":jenis_file,
                                        "DATA_PARAM": {}
                                    }
                                    //console.log(7930)
                                    dataParam.forEach(function(idParam){
                                        param["DATA_PARAM"][idParam] = getItemValue(idParam)
                                    })
                                    if(detailFile.tempName!=undefined){
                                        param['DATA'].push(detailFile.tempName)
                                    }else if (detailFile.sequenceName!=undefined){
                                        param['DATA'].push(detailFile.sequenceName)
                                    }else{
                                        param['DATA'].push(detailFile.filename[0])
                                    }

                                    if(detailFile.sequenceName!=undefined){
                                        let newNameDeleted = getItemValue(colsFile['newFileName'])                                   
                                        let oldNameDeleted = getItemValue(colsFile['oldFileName'])
                                        let idxFileName = undefined
                                        idxFileName = newNameDeleted.split("|").indexOf(detailFile.sequenceName.split("/")[detailFile.sequenceName.split("/").length-1])
                                        oldNameDeleted = oldNameDeleted.split("|")
                                        oldNameDeleted.splice(idxFileName,1)
    
                                        $$("listUploader_"+idUploader+"_"+menuId).remove(detailFile.id);
                                        $$(idUploader).files.remove(detailFile.id)
                                        let sequenceName = ""
                                        Object.keys($$(objList).data.pull).forEach(function(idPull){
                                            if($$(objList).data.pull[idPull].tempName!=undefined){
                                                sequenceName+=($$(objList).data.pull[idPull].tempName+"|")
                                            }else{
                                                sequenceName+=($$(objList).data.pull[idPull].sequenceName+"|")
                                            }
                                        })
                                        sequenceName = sequenceName.substring(0, sequenceName.length-1);
    
                                        let oldNameDb = ""
                                        oldNameDeleted.forEach(function(oldNameFile){
                                            oldNameDb+=(oldNameFile+"|")
                                        }) 
                                        oldNameDb = oldNameDb.substring(0, oldNameDb.length-1);
    
    
                                        if(id_datatable!=undefined){
                                            
                                            let record = $$(id_datatable).getItem(winActiveCell.pos.row)
                                            record[colsFile['oldFileName']] = oldNameDb
                                            record[colsFile['newFileName']] = sequenceName
                                            $$(id_datatable).updateItem(winActiveCell.pos.row, record);
                                            winDataChanged[id_datatable].push(record)
                                        }else{
                                            $$($$(idUploader).config.colsFile.oldFileName).setValue(oldNameDb)
                                            $$($$(idUploader).config.colsFile.newFileName).setValue(sequenceName)
                                        }
                                        try{
                                            let valuesData = {}
                                            let blocks = Object.keys(winConfigForm)
                                            blocks.forEach(function(block){
                                                if (winConfigForm[block]['BASE_TABLE'] == undefined){
                                                    winConfigForm[block]['BASE_TABLE'] = true
                                                }
                                                if(winConfigForm[block]['BASE_TABLE']){
                                                    if($$(block).config.view=="form"){
                                                        let changedForm = {}
                                                        let valuesForm = getBlockValue(block)
                                                        winConfigForm[block]["PRIMARY_KEY"].forEach(function (item) {
                                                            valuesForm[item] = $$(item).getValue()
                                                        });
                                                        winConfigForm[block]["RELATION_KEY"].forEach(function (item) {
                                                            valuesForm[item] = $$(item).getValue()
                                                        });
    
                                                        let listIdChanged = []
                                                        Object.keys(window.winDataCompare[block]["data"]).forEach(function(idItem){
                                                            
                                                            if(window.winDataCompare[block]["data"][idItem]!=valuesForm[idItem]){
                                                                if($$(idItem).config.jenis!="display"){
                                                                    listIdChanged.push(idItem)
                                                                }
                                                            }else{
                                                                delete valuesForm[idItem]
                                                            }
                                                            
                                                        })
                                                        changedForm[block] = {}
                                                        changedForm[block]["datachanged"]=listIdChanged
    
                                                        if(changedForm[block]["datachanged"].length!=0){
                                                            winConfigForm[block]["PRIMARY_KEY"].forEach(function (item) {
                                                                valuesForm[item] = $$(item).getValue()
                                                            });
                                                            valuesForm = [valuesForm]
                                                        }else{
                                                            valuesForm = []
                                                        }
                                                        valuesData[block] = {}
                                                        valuesData[block]['blockType'] = "form"
                                                        valuesData[block]['data'] = valuesForm
                                                    }else if($$(block).config.view=="datatable"){
                                                        valuesData[block] = {}
                                                        valuesData[block]['blockType'] = "datagrid"
                                                        valuesData[block]['data'] = webix.copy(winDataChanged[block])
                
                                                    }
                                                }
                                                
                                            })
                                            let statusUpdateData = false
                                            Object.keys(valuesData).forEach(function(block){
                                                if(valuesData[block].data.length>0){
                                                    statusUpdateData = true
                                                }
                                            })
                                            
                                            if(statusUpdateData){
                                                let updatedBlock = formatParamAjax(valuesData,"Update Data")
                                                if(Object.keys(updatedBlock)!=0){
                                                    restapi.restApiSubmit({'type':'UPDATE','menuId':menuId,'data':updatedBlock},"Update Data").then(function(){
                                                        let deletedFile = restapi.restApiFile(param)
                                                        deletedFile.then(function(respond){
                                                            if(!respond.status){
                                                                if(!isWebixPopupOpen()){
                                                                    webix.alert(ALERT.ALERTWARNING(respond.msg))
                                                                }
                                                            }
                                                        })
                                                    })
                                                    
                                                    winPopUpUploaderDt.forEach(function(idPopUp){
                                                        $$(idPopUp).hide()
                                                        $$(idPopUp).close()
                                                        winOpenPopUp = "closed"
                                                    })
    
                                                    winPopUpUploaderDt = []
                                                }else{
                                                    if(!isWebixPopupOpen()){
                                                        webix.alert(ALERT.ALERTWARNING("No data has been changed")).then(function(){
                                                            $$(window.menuId).enable();
                                                        })
                                                    }
                                                }
                                                
                                            }else{
                                                if(!isWebixPopupOpen()){
                                                    webix.alert(ALERT.ALERTWARNING("No data has been changed")).then(function(){
                                                        $$(window.menuId).enable();
                                                    })
                                                }
                                            }
                                        }catch(error){
                                            //console.log(error)
                                        }
                                    }
                                    else if(detailFile.sequenceName == undefined && detailFile.tempName != undefined){
                                        let deletedFile = restapi.restApiFile(param)
                                        deletedFile.then(function(respond){
                                            if(!respond.status){
                                                if(!isWebixPopupOpen()){
                                                    webix.alert(ALERT.ALERTWARNING(respond.msg))
                                                }
                                            }else{
                                                let newNameDeleted = getItemValue(colsFile['newFileName'])                                   
                                                let oldNameDeleted = getItemValue(colsFile['oldFileName'])
                                                let idxFileName = undefined
                                                let flagBackSlash = false
                                                if (respond.filename.file_name.includes("\\")) {
                                                    respond.filename.file_name = respond.filename.file_name.replaceAll("\\", "/")
                                                }else{
                                                    flagBackSlash = true
                                                }
                                                idxFileName = newNameDeleted.split("|").indexOf(detailFile.tempName.split("/")[detailFile.tempName.split("/").length-1])
                                                oldNameDeleted = oldNameDeleted.split("|")
                                                oldNameDeleted.splice(idxFileName,1)
            
                                                $$("listUploader_"+idUploader+"_"+menuId).remove(detailFile.id);
                                                $$(idUploader).files.remove(detailFile.id)
                                                let sequenceName = ""
                                                Object.keys($$(objList).data.pull).forEach(function(idPull){
                                                    if($$(objList).data.pull[idPull].tempName!=undefined){
                                                        sequenceName+=($$(objList).data.pull[idPull].tempName+"|")
                                                    }else{
                                                        sequenceName+=($$(objList).data.pull[idPull].sequenceName+"|")
                                                    }
                                                })
                                                sequenceName = sequenceName.substring(0, sequenceName.length-1);
            
                                                let oldNameDb = ""
                                                oldNameDeleted.forEach(function(oldNameFile){
                                                    oldNameDb+=(oldNameFile+"|")
                                                }) 
                                                oldNameDb = oldNameDb.substring(0, oldNameDb.length-1);
                                                if (!flagBackSlash) {
                                                    oldNameDb = oldNameDb.replaceAll("/","\\")
                                                }
            
                                                if(id_datatable!=undefined){
                                                    
                                                    let record = $$(id_datatable).getItem(winActiveCell.pos.row)
                                                    record[colsFile['oldFileName']] = oldNameDb
                                                    record[colsFile['newFileName']] = sequenceName
                                                    $$(id_datatable).updateItem(winActiveCell.pos.row, record);
                                                    winDataChanged[id_datatable].push(record)
                                                }else{
                                                    $$($$(idUploader).config.colsFile.oldFileName).setValue(oldNameDb)
                                                    $$($$(idUploader).config.colsFile.newFileName).setValue(sequenceName)
                                                }
                                            }
                                        })
                                    }
                                    
                                }
                                
                            })
                        }
                    }else{
                        //webix alert error
                    }
                },
                webix_download_file(ev, id) {
                    let resultTrigger = triggerOnClickDownload()

                    if(resultTrigger['status']){
                        // some logic
                        // //console.log("webix_download_file",$$(this.config.uploader).files.getItem(id));
                        let detailFile = $$(this.config.uploader).files.getItem(id)
                        if(detailFile.status == "server"){
                            let apiNameDownload = this.config.uploader+"_"+menuId
                            if (idDatagridUploader!= undefined){
                                apiNameDownload = idDatagridUploader+"_"+menuId
                            }
                            let param = {
                                "DATA":[],
                                "API_NAME":apiNameDownload,
                                "FILE_TYPE":"single",
                                "TYPE":"download",
                                "JENIS_FILE":jenis_file,
                                "DATA_PARAM":{}
                            }
    
                            dataParam.forEach(function(idParam){
                                param["DATA_PARAM"][idParam] = getItemValue(idParam)
                            })
                            param['DATA'].push({sequenceName:detailFile.sequenceName||detailFile.filename[0].newFileName, oldName:detailFile.name||detailFile.name, tempName:detailFile.tempName})
                            restapi.restApiFile(param) 
                        }else{
                            //console.log("file belum terdapat di bucket")
                            webix.message({
                                text:"File is not found in bucket",
                                type:"debug", 
                                expire: 10000,
                            }); 
                        }
                    }else{
                        // webix alert
                    }
                },
                webix_view_file(ev, id) {
                    let resultTrigger = triggerOnClickView()

                    if(resultTrigger['status']){
                        // some logic
                        // //console.log("webix_view_file",$$(this.config.uploader).files.getItem(id));
                        let detailFile = $$(this.config.uploader).files.getItem(id)
                        if(detailFile.status == "server"){
                            let apiNameViewFile = this.config.uploader+"_"+menuId
                            if (idDatagridUploader!= undefined){
                                apiNameViewFile = idDatagridUploader+"_"+menuId
                            }
                            let param = {
                                "DATA":[],
                                "API_NAME":apiNameViewFile,
                                "FILE_TYPE":"single",
                                "TYPE":"viewFile",
                                "JENIS_FILE":jenis_file,
                                "DOWNLOAD_FILE":downloadFile,
                                "DATA_PARAM":{},
                                "WD_POPUP":"",
                                "USESTAMP":useStamp,
                                "HEIGHT_POPUP":heightPopup,
                                "WIDTH_POPUP":widthPopup,
                                "POSITION_STAMP":positionStamp,
                                "ZOOM_PDF":zoompdf
                            }
                            if(winActiveCell!=""){
                                if (this.config.uploader.includes(String(winActiveCell.pos.row))){
                                    param["WD_POPUP"] = $$(this.config.uploader).config.id
                                }
                            }
                            dataParam.forEach(function(idParam){
                                param["DATA_PARAM"][idParam] = getItemValue(idParam)
                            })
    
                            let sequenceNameFix = ""
                            if (detailFile.sequenceName != undefined){
                                sequenceNameFix = detailFile.sequenceName
                            }else if(typeof(detailFile.filename[0]) == 'object'){
                                if ("newfilename" in detailFile.filename[0]){
                                    sequenceNameFix = detailFile.filename[0].newFileName
                                }
                            }else {
                                sequenceNameFix = detailFile.filename[0]
                            }
    
                            param['DATA'].push({sequenceName:sequenceNameFix, oldName:detailFile.name||detailFile.name, tempName:detailFile.tempName})
                            // param['DATA'].push({sequenceName:detailFile.sequenceName||detailFile.filename[0].newFileName, oldName:detailFile.name||detailFile.name, tempName:detailFile.tempName})
                            restapi.restApiFile(param) 
                        }else{
                            //console.log("file belum terdapat di bucket")
                            webix.message({
                                text:"File is not found in bucket",
                                type:"debug", 
                                expire: 10000,
                            }); 
                        }
                    }else{
                        //webix alert
                    }
                    // webix.message({
                    //     text:"Fitur show data belum tersedia",
                    //     type:"debug", 
                    //     expire: 10000,
                    // }); 
                }
            },
            on:{
                onDataUpdate:function(id,data,old){
                    // //console.log(5039, id, data, old)
                }
            }
        }

        if(downloadFile == false){
            listFile['template'] = listFile['template'].replace("<div class='webix_download_file '>" +
            "<span class='dl webix_icon wxi-download' title='download file'></span>" +
            "</div>","")
        }

        if(deleteFile == false){
            listFile['template'] = listFile['template'].replace("<div class='webix_remove_upload' style='position: relative;'>" +
            "<span class='dl webix_icon wxi-close' title='delete file' style='cursor: pointer; color: initial;' " +
            "onmouseover='this.style.color=&quot;red&quot;' " +
            "onmouseout='this.style.color=&quot;initial&quot;'></span>" +
            "</div>","")
        }

        if(viewFile == false){
            listFile['template'] = listFile['template'].replace("<div class='webix_view_file'>" +
            "<span class='dl webix_icon wxi-eye' title='view file'></span>" +
            "</div>","")
        }

        
        let apiUploader = idUploader.split("_")[0]

        

        function setDataFixParam(idUploader){
            let returnStatus = true
            let errorMsg = ""
            let dataFixParam = {}

            dataParam.every(function(idParam){
                dataFixParam[idParam] = getItemValue(idParam)
                if(dataFixParam[idParam]=="" || dataFixParam[idParam]==undefined || dataFixParam[idParam] == null){
                    returnStatus = false
                    let blockType = $$(getBlockItem(idParam)).config.view
                    if(blockType=="form"){
                        errorMsg = "Parameter "+$$(idParam).config.label+" cannot be empty."
                    }else{
                        errorMsg = "Parameter "+$$(getBlockItem(idParam)).getColumnConfig(idParam).header[0].text+" cannot be empty."
                    }
                    return false
                }
                return true
            })

            $$(idUploader).config.formData['dataParam'] = JSON.stringify(dataFixParam)
            return {"status":returnStatus, "msg":errorMsg}
        }

        let uploadBtn = {
            id: idUploader,
            name: idUploader,
            value: label,
            view:"uploader", 
            inputName:"uploader_"+menuId, 
            multiple:multipleFile,
            link:"listUploader_"+idUploader+"_"+menuId,
            upload:"/fileOden",
            datatype:"json",
            autosend:true,
            formData:{
                "type": "UPLOADFILES",
                "menuId": menuId,
                "apiName": apiUploader+"_"+menuId,
                "jenisFile":jenis_file,
            },
            colsFile: colsFile,
            sectionLabel:sectionLabel,
            file_required:file_required,
            width:150,
            height:38,
            on:{
                onBeforeFileAdd: function(file){
                    let statusFile = true
                    // BATASAN SIZE FILE
                    if(maxSize!=undefined){
                        if (file.size > maxSizeConvert){
                            statusFile = false
                            if(!isWebixPopupOpen()){
                                webix.alert({
                                    width:350,
                                    type:"alert-error",
                                    title:"Error File Input",
                                    text:"File exceeds upload limit "+textMaxSize
                                })
                            }
                        }
                    }
                    if(statusFile){
                        // BATASAN JENIS FILE
                        if(allowExtNameFile.length>0){
                            //console.log(file.type)
                            if (!allowExtNameFile.includes(file.type.toLowerCase())){
                                statusFile = false
                                if(!isWebixPopupOpen()){
                                    webix.alert({
                                        width:350,
                                        type:"alert-error",
                                        title:"Error File Input",
                                        text:"This file type("+file.type+") not allowed"
                                    })
                                }
                            }
                        }
                    }
                    if(renameFileById!=undefined){
                        let blockItem = getBlockItem(renameFileById)
                        if(blockItem!="" || blockItem!=undefined){
                            file.name = getItemValue(renameFileById)+"."+file.type
                        }else{
                            if(winDisplayItem.includes(renameFileById)){
                                if($$(renameFileById)!=undefined){
                                    file.name = $$(renameFileById).getValue+"."+file.type
                                }else{
                                    file.name = getItemDt(renameFileById)+"."+file.type
                                }
                            }
                        }
                    }
                    if(statusFile){
                        let statusSetDataParam = setDataFixParam(idUploader)
                        if(statusSetDataParam.status == false){
                            statusFile = false
                            if(!isWebixPopupOpen()){
                                webix.alert({
                                    width:350,
                                    type:"alert-error",
                                    title:"Error Additional Parameter",
                                    text:statusSetDataParam.msg
                                })
                            }
                        }
                    }
                    
                    $$(idUploader).config.formData['sizeFile'] = file.file.size
                    return statusFile
                },
                onAfterFileAdd: function(file){
                    let statusFile = true
                    if(maxSize!=undefined){
                        if (file.file.size > maxSizeConvert){
                            statusFile = false
                        }
                    }
                    if(statusFile){
                        if(allowExtNameFile.length>0){
                            if (!allowExtNameFile.includes(file.type)){
                                statusFile = false
                            }
                        }
                    }
                    
                    if(statusFile){
                        if(colsFile!=undefined){
                            if(id_datatable!=undefined){
                                let record = $$(id_datatable).getItem(winActiveCell.pos.row)
                                record[colsFile['oldFileName']] = file.name
                                $$(id_datatable).updateItem(winActiveCell.pos.row, record)
                            }
                        }
                    }

                    return statusFile
                },
                onFileUpload: function(file,response){
                    if(response.status){
                        let dataList = $$("listUploader_"+idUploader+"_"+menuId).data.pull
                        Object.keys($$("listUploader_"+idUploader+"_"+menuId).data.pull).forEach(function(keyId){
                            if (dataList[keyId]['file'] != undefined && typeof(dataList[keyId]['file']) =='object') {
                                response['filename'].forEach(function(file){
                                    if(dataList[keyId]['name']==file['oldfilename'] ){
                                        console.log(8377,dataList[keyId]['name'],file['oldfilename'])
                                        dataList[keyId]['tempName'] = file['newfilename'].split("/")[file['newfilename'].split("/").length-1]
                                        $$("listUploader_"+idUploader+"_"+menuId).updateItem(keyId,dataList[keyId])
                                    } 
                                })
                            }
                        })
                        $$(idUploader).refresh()
                        $$("listUploader_"+idUploader+"_"+menuId).refresh()

                        if(id_datatable!=undefined){
                            let oldFileNameCustom = ""
                            Object.keys($$(idUploader).files.data.pull).forEach(function(idPull){
                                if($$(idUploader).files.data.pull[idPull].oldFileNameDb!=undefined){
                                    oldFileNameCustom+=($$(idUploader).files.data.pull[idPull].oldFileNameDb+"|")
                                }else{
                                    oldFileNameCustom+=($$(idUploader).files.data.pull[idPull].name+"|")
                                }
                            })
                            oldFileNameCustom = oldFileNameCustom.substring(0, oldFileNameCustom.length-1);
                            let newFileNameCustom = ""
                            
                            Object.keys($$(idUploader).files.data.pull).forEach(function(idPull){
                                if($$(idUploader).files.data.pull[idPull].tempName!=undefined){
                                    newFileNameCustom+=($$(idUploader).files.data.pull[idPull].tempName+"|")
                                }else{
                                    if(($$(idUploader).files.data.pull[idPull].sequenceName)!=undefined){
                                        newFileNameCustom+=($$(idUploader).files.data.pull[idPull].sequenceName+"|")
                                    }else if($$(idUploader).files.data.pull[idPull].filename!=undefined){
                                        newFileNameCustom+=($$(idUploader).files.data.pull[idPull].filename[0]+"|")
                                    }
                                }
                            })
                            newFileNameCustom = newFileNameCustom.substring(0, newFileNameCustom.length-1);

                            let record = $$(id_datatable).getItem(winActiveCell.pos.row)
                            record[colsFile['oldFileName']] = oldFileNameCustom
                            record[colsFile['newFileName']] = newFileNameCustom
                            
                            $$(id_datatable).updateItem(winActiveCell.pos.row, record);
                            let listIdDatachanged = []
                            winDataChanged[id_datatable].forEach(function(recordDataChanged){
                                listIdDatachanged.push(recordDataChanged['id'])
                            })
                            if(listIdDatachanged.includes(winActiveCell.pos.row)){
                                winDataChanged[id_datatable].splice(listIdDatachanged.indexOf(winActiveCell.pos.row),1,record)
                            }else{
                                winDataChanged[id_datatable].push(record)
                            }
                        }else{
                            let oldFileNameCustom = ""
                            Object.keys($$(idUploader).files.data.pull).forEach(function(idPull){
                                if($$(idUploader).files.data.pull[idPull].oldFileNameDb!=undefined){
                                    oldFileNameCustom+=($$(idUploader).files.data.pull[idPull].oldFileNameDb+"|")
                                }else{
                                    oldFileNameCustom+=($$(idUploader).files.data.pull[idPull].name+"|")
                                }
                            })
                            oldFileNameCustom = oldFileNameCustom.substring(0, oldFileNameCustom.length-1);
                            $$($$(idUploader).config.colsFile.oldFileName).setValue(oldFileNameCustom)
                            let newFileNameCustom = ""
                            Object.keys($$(idUploader).files.data.pull).forEach(function(idPull,index){
                                if($$(idUploader).files.data.pull[idPull].tempName!=undefined){
                                    newFileNameCustom+=($$(idUploader).files.data.pull[idPull].tempName+"|")
                                }else{
                                    if(($$(idUploader).files.data.pull[idPull].sequenceName)!=undefined){
                                        newFileNameCustom+=($$(idUploader).files.data.pull[idPull].sequenceName+"|")
                                    }else if($$(idUploader).files.data.pull[idPull].filename!=undefined){
                                        newFileNameCustom+=($$(idUploader).files.data.pull[idPull].filename[0]+"|")
                                    }
                                }
                                
                            })
                            newFileNameCustom = newFileNameCustom.substring(0, newFileNameCustom.length-1);
                            $$($$(idUploader).config.colsFile.newFileName).setValue(newFileNameCustom)
                        }
                    }else{
                        
                        // ricky
                        $$(idUploader).files.data.pull[file.id].status = "error"
                        if(!isWebixPopupOpen()){
                            webix.alert(ALERT.ALERTWARNING(response.msg)).then(function(){
                                
                                // ricky
                                $$("listUploader_"+idUploader+"_"+menuId).remove(file.id)
                                $$(idUploader).files.remove(file.id)

                                if(id_datatable!=undefined){
                                    let oldFileNameCustom = ""
                                    Object.keys($$(idUploader).files.data.pull).forEach(function(idPull){
                                        if($$(idUploader).files.data.pull[idPull].oldFileNameDb!=undefined){
                                            oldFileNameCustom+=($$(idUploader).files.data.pull[idPull].oldFileNameDb+"|")
                                        }else{
                                            oldFileNameCustom+=($$(idUploader).files.data.pull[idPull].name+"|")
                                        }
                                    })
                                    oldFileNameCustom = oldFileNameCustom.substring(0, oldFileNameCustom.length-1);
                                    let newFileNameCustom = ""
                                    
        
                                    Object.keys($$(idUploader).files.data.pull).forEach(function(idPull){
                                        if($$(idUploader).files.data.pull[idPull].tempName!=undefined){
                                            newFileNameCustom+=($$(idUploader).files.data.pull[idPull].tempName+"|")
                                        }else{
                                            newFileNameCustom+=($$(idUploader).files.data.pull[idPull].sequenceName+"|")
                                        }
                                    })
                                    newFileNameCustom = newFileNameCustom.substring(0, newFileNameCustom.length-1);
        
                                    let record = $$(id_datatable).getItem(winActiveCell.pos.row)
                                    record[colsFile['oldFileName']] = oldFileNameCustom
                                    record[colsFile['newFileName']] = newFileNameCustom
                                    
                                    $$(id_datatable).updateItem(winActiveCell.pos.row, record);
                                    let listIdDatachanged = []
                                    winDataChanged[id_datatable].forEach(function(recordDataChanged){
                                        listIdDatachanged.push(recordDataChanged['id'])
                                    })
                                    if(listIdDatachanged.includes(winActiveCell.pos.row)){
                                        winDataChanged[id_datatable].splice(listIdDatachanged.indexOf(winActiveCell.pos.row),1,record)
                                    }else{
                                        winDataChanged[id_datatable].push(record)
                                    }
                                }else{
                                    let oldFileNameCustom = ""
                                    Object.keys($$(idUploader).files.data.pull).forEach(function(idPull){
                                        if($$(idUploader).files.data.pull[idPull].oldFileNameDb!=undefined){
                                            oldFileNameCustom+=($$(idUploader).files.data.pull[idPull].oldFileNameDb+"|")
                                        }else{
                                            oldFileNameCustom+=($$(idUploader).files.data.pull[idPull].name+"|")
                                        }
                                    })
                                    oldFileNameCustom = oldFileNameCustom.substring(0, oldFileNameCustom.length-1);
                                    $$($$(idUploader).config.colsFile.oldFileName).setValue(oldFileNameCustom)
                                    let newFileNameCustom = ""
                                    Object.keys($$(idUploader).files.data.pull).forEach(function(idPull){
                                        if($$(idUploader).files.data.pull[idPull].tempName!=undefined){
                                            newFileNameCustom+=($$(idUploader).files.data.pull[idPull].tempName+"|")
                                        }else{
                                            newFileNameCustom+=($$(idUploader).files.data.pull[idPull].sequenceName+"|")
                                        }
                                        
                                    })
                                    newFileNameCustom = newFileNameCustom.substring(0, newFileNameCustom.length-1);
                                    $$($$(idUploader).config.colsFile.newFileName).setValue(newFileNameCustom)
                                }
                            })
                        }
                    }                    
                },
                onFileUploadError: function(file,response){
                }
            }
        }
        if(allowFile!=undefined){
            uploadBtn = Object.assign(uploadBtn,{accept: allowExtentionFile})
        }
        let uploaderBtn = {rows:[sectionUploaderHeader,itemOldHidden,itemNewHidden,listFile,{cols:[uploadBtn,{}]}]}
        
        if(id_datatable==undefined){
            winUploaderFile.push(idUploader)
        }
        additionalMultiLanguage.push(property.ITEM_ID)
        return uploaderBtn
        
    }

    BUTTONUPLOADERDATAGRID(property, trigger){

        let idUploader = property.ITEM_ID
        let label = property.LABEL
        let downloadFile, deleteFile
        if(property.DOWNLOAD_FILE != undefined){
            downloadFile = property.DOWNLOAD_FILE
            deleteFile = property.DELETE_FILE
        }else{
            downloadFile = true
            deleteFile = true
        }
        let jenis_file = property.JENIS_FILE || undefined
        let dataParam = property.ADD_PARAM || []
        let allowFile = property.ALLOW_FILE || undefined
        let maxSize = property.MAX_SIZE || undefined
        let multipleFile = property.MULTIPLE_FILES || false
        let customWidth = property.CUSTOM_WIDTH || undefined
        let callForm = property.CALL_FORM || false
        let colsFile = property.COLS_FILE || undefined
        let customHeightDt = property.CUSTOM_HEIGHT || undefined
        let section = property.SECTION || ""
        let useStamp = property.USE_STAMP || undefined //confidential / internaluse
        let heightPopup = property.HEIGHT_POPUP || undefined
        let widthPopup = property.WIDTH_POPUP || undefined
        let positionStamp = property.POSITION_STAMP || "bottom-right" //bottom-right / bottom-center / bottom-left
        // let triggerOnClick = trigger.CUSTOM_CLICK
        let detailBtn = {id: idUploader, header:{ text:label, css:"datatablAlignCenter"}, fillspace:false, "call_form":callForm, 
            width:customWidth||150, 
            template:function(obj, common, value, config){
                if(obj[colsFile['oldFileName']]!="" && obj[colsFile['oldFileName']]!=undefined){
                    // //console.log(5440,obj[colsFile['oldFileName']])
                    let countFile = obj[colsFile['oldFileName']].split("|").length
                    // //console.log(5442,obj['id'],countFile)
                    return String(countFile)+` files - <input class='detailCustomButton' style="width:100px" type='button' value= FILES>`
                }else{
                    return `0 files - <input class='detailCustomButton' style="width:100px" type='button' value= FILES>`
                }
           },
            // template:`1 files - <input class='detailCustomButton' style="width:100px" type='button' value= FILES>`, 
            css:"datatablAlignCenter", jenis:"btnDatagrid", editor:"btnDatagrid",customWidth:customWidth, customTrigger : function(){
                if($$("wdPopUp"+idUploader.charAt( 0 ).toUpperCase() + idUploader.slice( 1 )+winActiveCell.pos.row)!=undefined){
                    $$("wdPopUp"+idUploader.charAt( 0 ).toUpperCase() + idUploader.slice( 1 )+winActiveCell.pos.row).show()
                }else{
                    let pkId = []
                    winConfigForm[winActiveBlock.focusNow].PRIMARY_KEY.forEach(function(idKey){
                        // if(!$$(winActiveBlock.focusNow).getColumnConfig(idKey).hideItem){
                            pkId.push(idKey)
                        // }
                    })
                    let elementsPopUpForm = []
                    pkId.forEach(function(idKey){
                        let block = winActiveBlock.focusNow
                        let labelNew = ''
                        if( $$(block).getColumnConfig(idKey).header[0] != null){
                            labelNew = $$(block).getColumnConfig(idKey).header[0]['text']
                        }else if($$(block).getColumnConfig(idKey).header[0] == null && $$(block).getColumnConfig(idKey).header[1] != null ){
                            labelNew = $$(block).getColumnConfig(idKey).header[1]['text']
                        }
                        elementsPopUpForm.push(TEXTBOX.TEXTDISPLAY({ITEM_ID: idKey, LABEL: labelNew}))
                    })
                    let labelUploaderMultiLanguage
                    if($$("comboMultiLanguage")!=undefined){
                        let getLanguageCode = $$("comboMultiLanguage").getValue()
                        labelUploaderMultiLanguage = window["jsonMultiLanguage_"+menuId][getLanguageCode]["UPLOAD FILE"] || "UPLOAD FILE"
                    }else{
                        labelUploaderMultiLanguage = "UPLOAD FILE"
                    }
                    // elementsPopUpForm.push(BUTTON.CUSTOMBUTTON({ITEM_ID:"checker", LABEL:"check", CUSTOM_WIDTH:250},{CUSTOM_CLICK:function(){
                    //     //console.log(7744,$$("checker").getParentView().getParentView().config)
                    // }}))
                    elementsPopUpForm.push(BUTTON.BUTTONUPLOADERFORM({
                        ITEM_ID: idUploader+"_"+String(winActiveCell.pos.row),
                        DATAGRID_UPLOADER:idUploader,
                        LABEL: labelUploaderMultiLanguage,
                        SECTION:section,
                        MULTIPLE_FILES:multipleFile,
                        ALLOW_FILE:allowFile,
                        MAX_SIZE:maxSize,
                        COLS_FILE:colsFile,
                        ID_DT:winActiveBlock["focusNow"] ,
                        DOWNLOAD_FILE:downloadFile,
                        DELETE_FILE:deleteFile,
                        JENIS_FILE:jenis_file,
                        ADD_PARAM:dataParam,
                        USE_STAMP:useStamp,
                        HEIGHT_POPUP:heightPopup,
                        WIDTH_POPUP:widthPopup,
                        POSITION_STAMP:positionStamp
                    }))
                    webix.ui(wdForm.windowForm(idUploader+winActiveCell.pos.row,elementsPopUpForm, customHeightDt))

                    $$("wdPopUpForm"+idUploader.charAt( 0 ).toUpperCase() + idUploader.slice( 1 )+winActiveCell.pos.row).parse($$(winActiveBlock.focusNow).getItem(winActiveCell.pos.row))
                    winPopUpUploaderDt.push("wdPopUp"+idUploader.charAt( 0 ).toUpperCase() + idUploader.slice( 1 )+winActiveCell.pos.row)
                    $$("wdPopUp"+idUploader.charAt( 0 ).toUpperCase() + idUploader.slice( 1 )+winActiveCell.pos.row).show()

                    winUploaderFile.forEach(function(idUploader){
                        if(winConfigForm[winActiveBlock.focusNow]["ELEMENT"].includes(idUploader)){
                            if(winConfigForm[winActiveBlock.focusNow]['ELEMENT'].includes(colsFile.newFileName)){
                                if ($$(idUploader+"_"+String(winActiveCell.pos.row))) {
                                    let dataFile = []
                                    let fileNameDb = getItemValue(colsFile.newFileName)
                                    let oldFileNameDb = getItemValue(colsFile.oldFileName)
                                    if(fileNameDb!=""){
                                        let fileNameSplited = fileNameDb.split("|")
                                        let oldFileNameSplited = oldFileNameDb.split("|")
                                        oldFileNameSplited.forEach(function(nameFile){
                                            let idxName = oldFileNameSplited.indexOf(nameFile)
                                            dataFile.push({ name:nameFile, sizetext:"",status:"server", sequenceName:fileNameSplited[idxName]})
                                        })
                                    }
                                    $$(idUploader+"_"+String(winActiveCell.pos.row)).files.parse(dataFile)
                                }
                            }
                        }else{
                            console.warn("===== Developer Warning ===== \n List Data Tidak Muncul karena Item Id Button Uploader, tidak terdaftar pada Element di winConfigForm")
                        }
                        
                    })
                    
                }
                
            }}

        if(callForm){
            window.winButtonCallForm.push(id)
        }
        winUploaderFile.push(idUploader)
        additionalMultiLanguage.push(property.ITEM_ID)
        return detailBtn
    }

    NORMALBUTTON(id, value, extendOnKeyPress,extendOn = {}) {
        let normalBtn = {
            "id": id, "name": id, "value": value, "view": "button",
            "on": {
                onKeyPress:super.baseCommonKeyPress(extendOnKeyPress),
            },
        }
        Object.assign(normalBtn.on,extendOn)
        return normalBtn
    }

    SUBMITBUTTON(id,value,restAPI=[]){
        let extendOnKeyPress=function(code,e){
            if(code==40){// down
                if(webix.UIManager.getNext(webix.UIManager.getFocus()).config.id!="app"){
                    webix.UIManager.getNext(webix.UIManager.getFocus()).focus()
                }
                else{
                    let first = Object.keys(webix.UIManager.getFocus().getParentView().elements)[0]
                    webix.UIManager.getFocus().getParentView().elements[first].focus()
                }
            }else if(code==13){
                $$(id).callEvent("onItemClick");
            }
        }

        let extendOn ={ 
            onItemClick: function(){
                if (this.getParentView().validate()){
                    let elements = Object.values(this.getParentView().elements)
                    let valuesForm = this.getParentView().getValues()
                    webix.confirm({
                        title: "Confirm Submit",
                        text: "Are you sure for all values form?",
                        type:"confirm-error"
                    })
                        .then(function(result){
                            restapi.restApiSubmit(restAPI[0],restAPI[1],valuesForm)  
                        })
                            .fail(function(){
                                $$(elements[0].config.id).focus();
                            });
                  
                }else{
                    let elements = Object.values(this.getParentView().elements)
                    if(!isWebixPopupOpen()){
                        webix.alert({
                            width:400,
                            title: "Error Submit",
                            text: "Please correct your input form again",
                            type: "alert-error"
                        }).then(function(result){
                            $$(elements[0].config.id).focus();
                        });
                    }
                }

            }
        }

        let submitBtn = this.NORMALBUTTON(id, value, extendOnKeyPress, extendOn);
        return submitBtn   
    }

    RESETBUTTON(id,value){
        let extendOn ={ 
            onItemClick: function(){
                webix.confirm({
                    width:400,
                    title:"Reset Form Value Button",
                    ok:"Yes", cancel:"No",
                    text:"Are you sure to reset all value in this block?"
                })
                  .then(function(){
                    let idForm = $$(id).getParentView().config.id;
                    $$(idForm).clear();
                  })
                    .fail(function(){
                      
                    });
            }
        }

        let resetBtn = this.NORMALBUTTON(id, value, function(){}, extendOn)
        return resetBtn   
    }

    SAVEBUTTON(id,value){
        let extendOn ={ 
            onItemClick: function(){
                webix.confirm({
                    width:400,
                    title:"Save Confirmation",
                    ok:"Yes", cancel:"No",
                    text:"Are you sure to save all changes?"
                }).then(function(){
                    let idForm = $$(id).getParentView().config.id;
                    $$(idForm).clear();
                }).fail(function(){
                      
                });
            }
        }

        let saveBtn = this.NORMALBUTTON(id, value, function(){}, extendOn)
        saveBtn.width = 150
        saveBtn.css = "webix_primary"
        return saveBtn   
    }




    // =================== BUTTON DEFAULT =================================

    PREVBUTTON(id){ 
        let prevBtn = this.NORMALBUTTON(id,"<",(function(){}),{})
        prevBtn =  Object.assign(prevBtn,{"type":"image", "image":"https://hocdnoden0201.sat.co.id/img/prevBtn.png","width": 60,hotkey:'ctrl+left',
        "on":{
                onItemClick:function(){
                    // try{
                        if(window.winOpenPopUp=="closed"){
                            winDataAtStart = false;
                            let blocks = Object.keys(winConfigForm)
                            if($$(window.winActiveBlock['focusNow'])==null){
                                if(window.winCountOffsetRecord[blocks[0]]>0){
                                    Object.keys(winDataChanged).forEach(function(idBlock){
                                        winDataChanged[idBlock] = []
                                    })
                                    window.winCountOffsetRecord[blocks[0]]-=1
                                    Object.keys(window.winPagerDatatable).forEach(function(idBlock){
                                        window.winPagerDatatable[idBlock][0]=0
                                    })
                                    Object.keys(winCountOffsetRecord).forEach(function(blockname){
                                        if(blockname!=blocks[0]){
                                            winCountOffsetRecord[blockname] = 0
                                        }
                                    })
                                    restapi.restApiSelect({'data':currentValue,'offsetNumber':window.winCountOffsetRecord[blocks[0]]})
                                    if(isGridToGrid){
                                        if(window.winActiveBlock['focusNow'] == statusMasterDetailGridToGrid.parent){
                                            let blockParent = $$(statusMasterDetailGridToGrid.parent)
                                            let page = blockParent.getPage() + 1;
                                            let pageSize = blockParent.config.pager.size;
                                            let firstRowIndex = (page - 1) * pageSize;
                                            let firstRow = blockParent.getItem(blockParent.data.order[firstRowIndex]);
                                            let firstRowId = firstRow.id;

                                            $$(statusMasterDetailGridToGrid.parent).select(
                                                firstRowId, 
                                                winConfigForm[statusMasterDetailGridToGrid.parent].PRIMARY_KEY[0]
                                            )
                                        }else if(statusMasterDetailGridToGrid.child.includes(window.winActiveBlock['focusNow'])){
                                            let blockChild = $$(window.winActiveBlock['focusNow'])
                                            let page = blockChild.getPage() + 1;
                                            let pageSize = blockChild.config.pager.size;
                                            let firstRowIndex = (page - 1) * pageSize;
                                            let firstRow = blockChild.getItem(blockChild.data.order[firstRowIndex]);
                                            let firstRowId = firstRow.id;

                                            blockChild.select(
                                                firstRowId, 
                                                winConfigForm[window.winActiveBlock['focusNow']].PRIMARY_KEY[0]
                                            )
                                        }
                                    }
                                    // nextPrevMulti()
                                    // $$(window.menuId).disable();
                                    // $$(window.menuId).showProgress({type:"icon",hide:false});
                                }
                            }else{
                                if($$(window.winActiveBlock['focusNow']).config.view=="form" || $$(window.winActiveBlock['focusNow']).config.view==""){
                                    if(window.winCountOffsetRecord[window.winActiveBlock['focusNow']]>0){
                                        Object.keys(winDataChanged).forEach(function(idBlock){
                                            winDataChanged[idBlock] = []
                                        })
                                        window.winCountOffsetRecord[window.winActiveBlock['focusNow']]-=1
                                        Object.keys(window.winPagerDatatable).forEach(function(idBlock){
                                            window.winPagerDatatable[idBlock][0]=0
                                        })

                                        if(winConfigForm[window.winActiveBlock['focusNow']]["BLOCK_TYPE"][1]=="PARENT"){
                                            Object.keys(winCountOffsetRecord).forEach(function(blockname){
                                                if(blockname!=window.winActiveBlock['focusNow']){
                                                    winCountOffsetRecord[blockname] = 0
                                                }
                                            })
                                            winPopUpUploaderDt.forEach(function(idWd){
                                                $$(idWd).close()
        
                                                let index = winPopUpUploaderDt.indexOf(idWd)
                                                winPopUpUploaderDt.splice(index, 1);
                                            })
                                            restapi.restApiSelect({'data':currentValue,'offsetNumber':window.winCountOffsetRecord[window.winActiveBlock['focusNow']]})
                                            // nextPrevMulti()
                                        }else if(winConfigForm[window.winActiveBlock['focusNow']]["BLOCK_TYPE"][1]=="CHILD"){
                                            let param = winConfigForm[winActiveBlock['focusNow']]['REST_API']
                                            param['OFFSET_NUMBER'] = window.winCountOffsetRecord[window.winActiveBlock['focusNow']]
                                            restapi.restApiParam(param)
                                        }
                                        // $$(window.menuId).disable();
                                        // $$(window.menuId).showProgress({type:"icon",hide:false});
                                    }
                                }else if($$(window.winActiveBlock['focusNow']).config.view=="datatable"){
                                    // //console.log("prev", window.winPagerDatatable[winActiveBlock.focusNow][0]) 
                                    if (window.winPagerDatatable[winActiveBlock.focusNow][0] > 0) {
                                        if (winThereIsSubChild) {
                                            if(Object.keys(winSubChild).includes(winActiveBlock.focusNow) || winConfigForm[winActiveBlock['focusNow']]["BLOCK_TYPE"][2] != undefined){
                                                let ChildParent = winConfigForm[winActiveBlock['focusNow']]["BLOCK_TYPE"][2] || winActiveBlock.focusNow
                                                winSubChild[ChildParent].forEach(function(blockId){
                                                    window.winPagerDatatable[blockId][0] -= 1
                                                    $$(blockId).setPage(window.winPagerDatatable[blockId][0])
                                                })
                                                window.winPagerDatatable[ChildParent][0] -= 1
                                                $$(ChildParent).setPage(window.winPagerDatatable[ChildParent][0])
                                            }else{
                                                window.winPagerDatatable[winActiveBlock['focusNow']][0] -= 1
                                                $$(winActiveBlock['focusNow']).setPage(window.winPagerDatatable[winActiveBlock['focusNow']][0])
                                            }
                                        } else {
                                            window.winPagerDatatable[winActiveBlock.focusNow][0] -= 1
                                            $$(window.winActiveBlock['focusNow']).setPage(window.winPagerDatatable[winActiveBlock.focusNow][0])
                                            if(isGridToGrid){
                                                if(window.winActiveBlock['focusNow'] == statusMasterDetailGridToGrid.parent){
                                                    let blockParent = $$(statusMasterDetailGridToGrid.parent)
                                                    let page = blockParent.getPage() + 1;
                                                    let pageSize = blockParent.config.pager.size;
                                                    let firstRowIndex = (page - 1) * pageSize;
                                                    let firstRow = blockParent.getItem(blockParent.data.order[firstRowIndex]);
                                                    let firstRowId = firstRow.id;

                                                    $$(statusMasterDetailGridToGrid.parent).select(
                                                        firstRowId, 
                                                        winConfigForm[statusMasterDetailGridToGrid.parent].PRIMARY_KEY[0]
                                                    )
                                                }else if(statusMasterDetailGridToGrid.child.includes(window.winActiveBlock['focusNow'])){
                                                    let blockChild = $$(window.winActiveBlock['focusNow'])
                                                    let page = blockChild.getPage() + 1;
                                                    let pageSize = blockChild.config.pager.size;
                                                    let firstRowIndex = (page - 1) * pageSize;
                                                    let firstRow = blockChild.getItem(blockChild.data.order[firstRowIndex]);
                                                    let firstRowId = firstRow.id;

                                                    $$(statusMasterDetailGridToGrid.child).select(
                                                        firstRowId, 
                                                        winConfigForm[statusMasterDetailGridToGrid.child].PRIMARY_KEY[0]
                                                    )
                                                }
                                            }
                                        }

                                    }
                                    webix.UIManager.setFocus(window.winActiveBlock['focusNow']);
                                }
                            }
                        }
                }
            },
            hidden:hideButton[id]}
        )
        
        return prevBtn;
    }

    NEXTBUTTON(id){
        let nextBtn = this.NORMALBUTTON(id,">",(function(){}),{})
        nextBtn = Object.assign(nextBtn,{"type":"image", "image":"https://hocdnoden0201.sat.co.id/img/nextBtn.png","width": 60, hotkey:'ctrl+right',"on":{
            onItemClick:function(){
                    // try{
                        if(window.winOpenPopUp=="closed"){
                            // //console.log(5861)
                            winDataAtStart = false;
                            let blocks = Object.keys(winConfigForm)
                            if($$(window.winActiveBlock['focusNow'])==null){
                                
                                Object.keys(winDataChanged).forEach(function(idBlock){
                                    winDataChanged[idBlock] = []
                                })
                                window.winCountOffsetRecord[blocks[0]]+=1
                                Object.keys(window.winPagerDatatable).forEach(function(idBlock){
                                    window.winPagerDatatable[idBlock][0]=0
                                })
                                Object.keys(winCountOffsetRecord).forEach(function(blockname){
                                    if(blockname!=blocks[0]){
                                        winCountOffsetRecord[blockname] = 0
                                    }
                                })
                                
                                if(winSearchParam['status']==true){
                                    restapi.restApiSelect({'data':winSearchParam['param'],'offsetNumber':window.winCountOffsetRecord[blocks[0]]})
                                }else{
                                    restapi.restApiSelect({'data':currentValue,'offsetNumber':window.winCountOffsetRecord[blocks[0]]})
                                }
                                
                                // nextPrevMulti()
                                // $$(window.menuId).disable();
                                // $$(window.menuId).showProgress({type:"icon",hide:false});
                            }else{
                                let getParamData = ''
                                if($$(window.winActiveBlock['focusNow']).config.view=="form" || $$(window.winActiveBlock['focusNow']).config.view==""){
                                    // //console.log(1884)
                                    Object.keys(winDataChanged).forEach(function(idBlock){
                                        winDataChanged[idBlock] = []
                                    })
                                    window.winCountOffsetRecord[window.winActiveBlock['focusNow']]+=1
                                    Object.keys(window.winPagerDatatable).forEach(function(idBlock){
                                        window.winPagerDatatable[idBlock][0]=0
                                    })
                                    
                                    if(winConfigForm[window.winActiveBlock['focusNow']]["BLOCK_TYPE"][1]=="PARENT"){   
                                        let getPrimaryKey = winConfigForm[winActiveBlock['focusNow']]["PRIMARY_KEY"][0]
                                        getParamData = (window.winDataMaster = $$(window.winActiveBlock['focusNow']).getValues()[getPrimaryKey])  
                                        Object.keys(winCountOffsetRecord).forEach(function(blockname){
                                            if(blockname!=window.winActiveBlock['focusNow']){
                                                winCountOffsetRecord[blockname] = 0
                                            }
                                        })

                                        winPopUpUploaderDt.forEach(function(idWd){
                                            $$(idWd).close()
    
                                            let index = winPopUpUploaderDt.indexOf(idWd)
                                            winPopUpUploaderDt.splice(index, 1);
                                        })
                                        if(winSearchParam['status']==true){
                                            restapi.restApiSelect({'data':winSearchParam['param'],'offsetNumber':window.winCountOffsetRecord[window.winActiveBlock['focusNow']]})
                                        }else{
                                            restapi.restApiSelect({'data':currentValue,'offsetNumber':window.winCountOffsetRecord[window.winActiveBlock['focusNow']]})
                                        }
                                        
                                        // nextPrevMulti()
                                    }else if(winConfigForm[window.winActiveBlock['focusNow']]["BLOCK_TYPE"][1]=="CHILD"){
                                        let param = winConfigForm[winActiveBlock['focusNow']]['REST_API']
                                        param['OFFSET_NUMBER'] = window.winCountOffsetRecord[window.winActiveBlock['focusNow']]
                                        
                                        if(winSearchParam['status']==true){
                                            param['DATA'] = winSearchParam['param']
                                            restapi.restApiParam(param)
                                        }else{
                                            restapi.restApiParam(param)
                                        }
                                        
                                    }
                                    // $$(window.menuId).disable();
                                    // $$(window.menuId).showProgress({type:"icon",hide:false});
                                }else if($$(window.winActiveBlock['focusNow']).config.view=="datatable"){
                                    if(window.winPagerDatatable[winActiveBlock.focusNow][0]<window.winPagerDatatable[winActiveBlock.focusNow][1]-1 && winConfigForm[winActiveBlock.focusNow]["LIMIT_DATA"] != 10){
                                        if (winThereIsSubChild) {
                                            if(Object.keys(winSubChild).includes(winActiveBlock.focusNow) || winConfigForm[winActiveBlock['focusNow']]["BLOCK_TYPE"][2] != undefined){
                                                let ChildParent = winConfigForm[winActiveBlock['focusNow']]["BLOCK_TYPE"][2] || winActiveBlock.focusNow
                                                winSubChild[ChildParent].forEach(function(blockId){
                                                    window.winPagerDatatable[blockId][0] += 1
                                                    $$(blockId).setPage(window.winPagerDatatable[blockId][0])
                                                })
                                                window.winPagerDatatable[ChildParent][0] += 1
                                                $$(ChildParent).setPage(window.winPagerDatatable[ChildParent][0])
                                            }else{
                                                window.winPagerDatatable[winActiveBlock['focusNow']][0] += 1
                                                $$(winActiveBlock['focusNow']).setPage(window.winPagerDatatable[winActiveBlock['focusNow']][0])
                                            }
                                        }else{
                                            window.winPagerDatatable[winActiveBlock.focusNow][0] += 1
                                            $$(window.winActiveBlock['focusNow']).setPage(window.winPagerDatatable[winActiveBlock.focusNow][0])
                                            if(isGridToGrid){
                                                if(window.winActiveBlock['focusNow'] == statusMasterDetailGridToGrid.parent){
                                                    let blockParent = $$(statusMasterDetailGridToGrid.parent)
                                                    let page = blockParent.getPage() + 1;
                                                    let pageSize = blockParent.config.pager.size;
                                                    let firstRowIndex = (page - 1) * pageSize;
                                                    let firstRow = blockParent.getItem(blockParent.data.order[firstRowIndex]);
                                                    let firstRowId = firstRow.id;
                                                    
                                                    $$(statusMasterDetailGridToGrid.parent).select(
                                                        firstRowId, 
                                                        winConfigForm[statusMasterDetailGridToGrid.parent].PRIMARY_KEY[0]
                                                    )
                                                }else if(statusMasterDetailGridToGrid.child.includes(window.winActiveBlock['focusNow'])){
                                                    let blockChild = $$(window.winActiveBlock['focusNow'])
                                                    let page = blockChild.getPage() + 1;
                                                    let pageSize = blockChild.config.pager.size;
                                                    let firstRowIndex = (page - 1) * pageSize;
                                                    let firstRow = blockChild.getItem(blockChild.data.order[firstRowIndex]);
                                                    let firstRowId = firstRow.id;

                                                    blockChild.select(
                                                        firstRowId, 
                                                        winConfigForm[window.winActiveBlock['focusNow']].PRIMARY_KEY[0]
                                                    )
                                                }
                                            }
                                        }
                                    }else if (window.winPagerDatatable[winActiveBlock.focusNow][0] == window.winPagerDatatable[winActiveBlock.focusNow][1] - 1 && winConfigForm[winActiveBlock.focusNow]["LIMIT_DATA"] != 10) {
                                        let param
                                        if (winConfigForm[winActiveBlock.focusNow].REST_API != undefined) {
                                            if (winThereIsSubChild) {
                                                if(Object.keys(winSubChild).includes(winActiveBlock.focusNow) || winConfigForm[winActiveBlock['focusNow']]["BLOCK_TYPE"][2] != undefined){
                                                    let ChildParent = winConfigForm[winActiveBlock['focusNow']]["BLOCK_TYPE"][2] || winActiveBlock.focusNow
                                                    param = winConfigForm[ChildParent].REST_API || undefined
                                                    winSubChild[ChildParent].forEach(function (blockId) {
                                                        window.winPagerDatatable[blockId][0] += 1
                                                        $$(blockId).setPage(window.winPagerDatatable[blockId][0])
                                                    })
                                                    window.winPagerDatatable[ChildParent][0] += 1
                                                    $$(ChildParent).setPage(window.winPagerDatatable[ChildParent][0])    
                                                    if(param!=undefined){
                                                        param['BLOCK_NAME'] = ChildParent
                                                        param['LOAD_MORE_DATA'] = true
                                                        param['OFFSET_NUMBER'] = $$(ChildParent).config.dynamicLoadData + winDataDtSelect[ChildParent].length || 500 
                                                        param['LIMIT'] = winConfigForm[ChildParent]["LIMIT_DATA"] || 500
                                                        $$(ChildParent).define('dynamicLoadData', $$(ChildParent).config.dynamicLoadData + winConfigForm[ChildParent]["LIMIT_DATA"] || 500)
                                                        $$(ChildParent).refresh()
                                                        winCountOffsetRecord[ChildParent] = $$(ChildParent).config.dynamicLoadData + winConfigForm[ChildParent]["LIMIT_DATA"] || 500  
                                                        // // $$(menuId).showProgress({hide:false});
                                                        // // webix.delay(function(){
                                                        if (winSearchParam['status'] == true) {
                                                            param['DATA'] = getParamData  
                                                            restapi.restApiParam(param)
                                                        }
                                                        else {
                                                            restapi.restApiParam(param)
                                                        }
                                                    }
                                                    window.winPagerDatatable[ChildParent][0] == 0
                                                    $$(ChildParent).setPage(window.winPagerDatatable[ChildParent][0])
                                                }else{
                                                    window.winPagerDatatable[winActiveBlock['focusNow']][0] += 1
                                                    $$(winActiveBlock['focusNow']).setPage(window.winPagerDatatable[winActiveBlock['focusNow']][0])
                                                    param = winConfigForm[winActiveBlock.focusNow].REST_API
                                                    //"tidak punya subchild"
                                                    if(winConfigForm[winActiveBlock.focusNow].REST_API!=undefined){
                                                            param['BLOCK_NAME'] = winActiveBlock['focusNow']
                                                            param['LOAD_MORE_DATA'] = true
                                                            param['OFFSET_NUMBER'] = $$(window.winActiveBlock['focusNow']).config.dynamicLoadData + winDataDtSelect[window.winActiveBlock['focusNow']].length || 500 
                                                            param['LIMIT'] = winConfigForm[window.winActiveBlock['focusNow']]["LIMIT_DATA"] || 500
                                                            $$(window.winActiveBlock['focusNow']).define('dynamicLoadData', $$(window.winActiveBlock['focusNow']).config.dynamicLoadData + winConfigForm[window.winActiveBlock['focusNow']]["LIMIT_DATA"] || 500)
                                                            $$(window.winActiveBlock['focusNow']).refresh()
                                                            winCountOffsetRecord[window.winActiveBlock['focusNow']] = $$(window.winActiveBlock['focusNow']).config.dynamicLoadData + winConfigForm[window.winActiveBlock['focusNow']]["LIMIT_DATA"] || 500  
                                                        if (winSearchParam['status'] == true) {
                                                            param['DATA'] = getParamData 
                                                            restapi.restApiParam(param)
                                                        }
                                                        else {
                                                            restapi.restApiParam(param)
                                                        }
                                                    }
                                                    window.winPagerDatatable[winActiveBlock.focusNow][0] == 0
                                                    $$(window.winActiveBlock['focusNow']).setPage(window.winPagerDatatable[winActiveBlock.focusNow][0])
                                                }
                                            }else{
                                                window.winPagerDatatable[winActiveBlock.focusNow][0]+=1
                                                $$(window.winActiveBlock['focusNow']).setPage(window.winPagerDatatable[winActiveBlock.focusNow][0])
                                                if(winConfigForm[winActiveBlock.focusNow].REST_API!=undefined){
                                                    let param = winConfigForm[winActiveBlock.focusNow].REST_API
                                                    param['LOAD_MORE_DATA'] = true
                                                    param['LIMIT'] = winConfigForm[winActiveBlock.focusNow]["LIMIT_DATA"] || 500
                                                    param['OFFSET_NUMBER'] = $$(winActiveBlock.focusNow).config.dynamicLoadData + (winConfigForm[winActiveBlock.focusNow]["LIMIT_DATA"] || 500)
                                                    $$(winActiveBlock.focusNow).define('dynamicLoadData',$$(winActiveBlock.focusNow).config.dynamicLoadData + (winConfigForm[winActiveBlock.focusNow]["LIMIT_DATA"] || 500))
                                                    $$(winActiveBlock.focusNow).refresh()
                                                    winCountOffsetRecord[winActiveBlock.focusNow] = $$(winActiveBlock.focusNow).config.dynamicLoadData + (winConfigForm[winActiveBlock.focusNow]["LIMIT_DATA"] || 500)
                                                    if(winConfigForm[window.winActiveBlock['focusNow']]["BLOCK_TYPE"][1]=="PARENT"){
                                                        Object.keys(winCountOffsetRecord).forEach(function(blockname){
                                                            if(blockname!=window.winActiveBlock['focusNow']){
                                                                winCountOffsetRecord[blockname] = 0
                                                            }
                                                        })
                                                        winPopUpUploaderDt.forEach(function(idWd){
                                                            $$(idWd).close()
                                                            let index = winPopUpUploaderDt.indexOf(idWd)
                                                            winPopUpUploaderDt.splice(index, 1);
                                                        })
                                                    }
                                                    if(winSearchParam['status']==true){
                                                        param['DATA'] = winSearchParam["param"]
                                                        restapi.restApiParam(param)
                                                    }else{
                                                        restapi.restApiParam(param)
                                                    }
                                                }else{
                                                    window.winPagerDatatable[winActiveBlock.focusNow][0]+=1
                                                    $$(window.winActiveBlock['focusNow']).setPage(window.winPagerDatatable[winActiveBlock.focusNow][0])
                                                } 
                                                setFirstRowFocus()
                                            }
                                        }else{
                                            window.winPagerDatatable[winActiveBlock.focusNow][0] += 1
                                            $$(window.winActiveBlock['focusNow']).setPage(window.winPagerDatatable[winActiveBlock.focusNow][0])
                                            setFirstRowFocus()
                                            
                                        }
                                    }else if(window.winPagerDatatable[winActiveBlock.focusNow][0] < window.winPagerDatatable[winActiveBlock.focusNow][1]  && winConfigForm[winActiveBlock.focusNow]["LIMIT_DATA"] == 10){
                                            if (winThereIsSubChild) {
                                                if(Object.keys(winSubChild).includes(winActiveBlock.focusNow) || winConfigForm[winActiveBlock['focusNow']]["BLOCK_TYPE"][2] != undefined){
                                                    let ChildParent = winConfigForm[winActiveBlock['focusNow']]["BLOCK_TYPE"][2] || winActiveBlock.focusNow
                                                    winSubChild[ChildParent].forEach(function(blockId){
                                                        window.winPagerDatatable[blockId][0] += 1
                                                        $$(blockId).setPage(window.winPagerDatatable[blockId][0])
                                                    })
                                                    window.winPagerDatatable[ChildParent][0] += 1
                                                    $$(ChildParent).setPage(window.winPagerDatatable[ChildParent][0])
                                                }else{
                                                    window.winPagerDatatable[winActiveBlock['focusNow']][0] += 1
                                                    $$(winActiveBlock['focusNow']).setPage(window.winPagerDatatable[winActiveBlock['focusNow']][0])
                                                }
                                            }else{
                                                window.winPagerDatatable[winActiveBlock.focusNow][0] += 1
                                                $$(window.winActiveBlock['focusNow']).setPage(window.winPagerDatatable[winActiveBlock.focusNow][0])
                                                setFirstRowFocus()
                                            }
                                            $$(window.winActiveBlock['focusNow']).setPage(window.winPagerDatatable[winActiveBlock.focusNow][0])
                                    }else if(window.winPagerDatatable[winActiveBlock.focusNow][0] == window.winPagerDatatable[winActiveBlock.focusNow][1] && winConfigForm[winActiveBlock.focusNow]["LIMIT_DATA"] == 10){
                                        let param 
                                        if (winConfigForm[winActiveBlock.focusNow].REST_API != undefined) {
                                            if (winThereIsSubChild) {
                                                if(Object.keys(winSubChild).includes(winActiveBlock.focusNow) || winConfigForm[winActiveBlock['focusNow']]["BLOCK_TYPE"][2] != undefined){
                                                    let ChildParent = winConfigForm[winActiveBlock['focusNow']]["BLOCK_TYPE"][2] || winActiveBlock.focusNow
                                                    param = winConfigForm[ChildParent].REST_API
                                                    //yang ada subchild
                                                    winSubChild[ChildParent].forEach(function (blockId) {
                                                        window.winPagerDatatable[blockId][0] += 1
                                                        $$(blockId).setPage(window.winPagerDatatable[blockId][0])
                                                    })
                                                    window.winPagerDatatable[ChildParent][0] += 1
                                                    $$(ChildParent).setPage(window.winPagerDatatable[ChildParent][0])
                                                    
                                                    if(winConfigForm[ChildParent].REST_API!=undefined){
                                                        param['BLOCK_NAME'] = ChildParent
                                                        param['LOAD_MORE_DATA'] = true
                                                        param['OFFSET_NUMBER'] = $$(ChildParent).config.dynamicLoadData + winConfigForm[ChildParent]["LIMIT_DATA"] || 500 
                                                        param['LIMIT'] = winConfigForm[ChildParent]["LIMIT_DATA"] || 500
                                                        $$(ChildParent).define('dynamicLoadData', $$(ChildParent).config.dynamicLoadData + winConfigForm[ChildParent]["LIMIT_DATA"] || 500)
                                                        $$(ChildParent).refresh()
                                                        winCountOffsetRecord[ChildParent] = $$(ChildParent).config.dynamicLoadData + winConfigForm[ChildParent]["LIMIT_DATA"] || 500  
                                                        // // $$(menuId).showProgress({hide:false});
                                                        // // webix.delay(function(){
                                                        if (winSearchParam['status'] == true) {
                                                            param['DATA'] = getParamData  
                                                            restapi.restApiParam(param)
                                                        }
                                                        else {
                                                            restapi.restApiParam(param)
                                                        }
                                                    }
                                                    window.winPagerDatatable[ChildParent][0] == 0
                                                    $$(ChildParent).setPage(window.winPagerDatatable[ChildParent][0])
                                                }else{
                                                    param = winConfigForm[winActiveBlock.focusNow].REST_API
                                                    window.winPagerDatatable[winActiveBlock['focusNow']][0] += 1
                                                    $$(winActiveBlock['focusNow']).setPage(window.winPagerDatatable[winActiveBlock['focusNow']][0])
                                                    if(winConfigForm[winActiveBlock.focusNow].REST_API!=undefined){
                                                        param['BLOCK_NAME'] = winActiveBlock['focusNow']
                                                        param['LOAD_MORE_DATA'] = true
                                                        param['OFFSET_NUMBER'] = $$(window.winActiveBlock['focusNow']).config.dynamicLoadData + winDataDtSelect[window.winActiveBlock['focusNow']].length || 500 
                                                        param['LIMIT'] = winConfigForm[window.winActiveBlock['focusNow']]["LIMIT_DATA"] || 500
                                                        $$(window.winActiveBlock['focusNow']).define('dynamicLoadData', $$(window.winActiveBlock['focusNow']).config.dynamicLoadData + winConfigForm[window.winActiveBlock['focusNow']]["LIMIT_DATA"] || 500)
                                                        $$(window.winActiveBlock['focusNow']).refresh()
                                                        winCountOffsetRecord[window.winActiveBlock['focusNow']] = $$(window.winActiveBlock['focusNow']).config.dynamicLoadData + winConfigForm[window.winActiveBlock['focusNow']]["LIMIT_DATA"] || 500 
                                                        // // $$(menuId).showProgress({hide:false});
                                                        // // webix.delay(function(){
                                                        if (winSearchParam['status'] == true) {
                                                            param['DATA'] = getParamData 
                                                            let apidt = restapi.restApiParam(param)
                                                            apidt.then(function(respond){
                                                                $$(window.winActiveBlock['focusNow']).setPage(window.winPagerDatatable[winActiveBlock.focusNow][0])
                                                            })
                                                        }
                                                        else {
                                                            let apidt = restapi.restApiParam(param)
                                                            apidt.then(function(respond){
                                                                $$(window.winActiveBlock['focusNow']).setPage(window.winPagerDatatable[winActiveBlock.focusNow][0])
                                                            })
                                                        }
                                                    }
                                                    window.winPagerDatatable[winActiveBlock.focusNow][0] == 0
                                                    $$(window.winActiveBlock['focusNow']).setPage(window.winPagerDatatable[winActiveBlock.focusNow][0])
                                                }
                                            }else{
                                                $$(window.winActiveBlock['focusNow']).setPage(window.winPagerDatatable[winActiveBlock.focusNow][0])
                                                if(winConfigForm[winActiveBlock.focusNow].REST_API!=undefined){
                                                    let param = winConfigForm[winActiveBlock.focusNow].REST_API
                                                    param['LOAD_MORE_DATA'] = true
                                                    param['LIMIT'] = winConfigForm[winActiveBlock.focusNow]["LIMIT_DATA"] || 500
                                                    param['OFFSET_NUMBER'] = $$(winActiveBlock.focusNow).config.dynamicLoadData + winConfigForm[winActiveBlock.focusNow]["LIMIT_DATA"] || 500
                                                    $$(winActiveBlock.focusNow).define('dynamicLoadData',$$(winActiveBlock.focusNow).config.dynamicLoadData + winConfigForm[winActiveBlock.focusNow]["LIMIT_DATA"] || 500)
                                                    $$(winActiveBlock.focusNow).refresh()
                                                    winCountOffsetRecord[winActiveBlock.focusNow] = $$(winActiveBlock.focusNow).config.dynamicLoadData + winConfigForm[winActiveBlock.focusNow]["LIMIT_DATA"] || 500
                                                    if(winConfigForm[window.winActiveBlock['focusNow']]["BLOCK_TYPE"][1]=="PARENT"){
                                                        Object.keys(winCountOffsetRecord).forEach(function(blockname){
                                                            if(blockname!=window.winActiveBlock['focusNow']){
                                                                winCountOffsetRecord[blockname] = 0
                                                            }
                                                        })
                                                        winPopUpUploaderDt.forEach(function(idWd){
                                                            $$(idWd).close()
                    
                                                            let index = winPopUpUploaderDt.indexOf(idWd)
                                                            winPopUpUploaderDt.splice(index, 1);
                                                        })
                                                    }
                                                    if(winSearchParam['status']==true){
                                                        param['DATA'] = winSearchParam["param"]
                                                        restapi.restApiParam(param)
                                                    }else{
                                                        restapi.restApiParam(param)
                                                    }
                                                }
                                                setFirstRowFocus()
                                            }
                                        }else {
                                            window.winPagerDatatable[winActiveBlock.focusNow][0]+=1
                                            $$(window.winActiveBlock['focusNow']).setPage(window.winPagerDatatable[winActiveBlock.focusNow][0])
                                            if(winConfigForm[winActiveBlock.focusNow].REST_API!=undefined){
                                                let param = winConfigForm[winActiveBlock.focusNow].REST_API
                                                param['LOAD_MORE_DATA'] = true
                                                param['LIMIT'] = winConfigForm[winActiveBlock.focusNow]["LIMIT_DATA"] || 500
                                                param['OFFSET_NUMBER'] = $$(winActiveBlock.focusNow).config.dynamicLoadData + winConfigForm[winActiveBlock.focusNow]["LIMIT_DATA"] || 500
                                                $$(winActiveBlock.focusNow).define('dynamicLoadData',$$(winActiveBlock.focusNow).config.dynamicLoadData + winConfigForm[winActiveBlock.focusNow]["LIMIT_DATA"] || 500)
                                                $$(winActiveBlock.focusNow).refresh()
                                                winCountOffsetRecord[winActiveBlock.focusNow] = $$(winActiveBlock.focusNow).config.dynamicLoadData + winConfigForm[winActiveBlock.focusNow]["LIMIT_DATA"] || 500
                                                if(winConfigForm[window.winActiveBlock['focusNow']]["BLOCK_TYPE"][1]=="PARENT"){
                                                    Object.keys(winCountOffsetRecord).forEach(function(blockname){
                                                        if(blockname!=window.winActiveBlock['focusNow']){
                                                            winCountOffsetRecord[blockname] = 0
                                                        }
                                                    })
                                                    winPopUpUploaderDt.forEach(function(idWd){
                                                        $$(idWd).close()
                
                                                        let index = winPopUpUploaderDt.indexOf(idWd)
                                                        winPopUpUploaderDt.splice(index, 1);
                                                    })
                                                }
                                                if(winSearchParam['status']==true){
                                                    param['DATA'] = winSearchParam["param"]
                                                    restapi.restApiParam(param)
                                                }else{
                                                    restapi.restApiParam(param)
                                                }

                                                setFirstRowFocus()
                                            }else{
                                                window.winPagerDatatable[winActiveBlock.focusNow][0]+=1
                                                $$(window.winActiveBlock['focusNow']).setPage(window.winPagerDatatable[winActiveBlock.focusNow][0])
                                            } 
                                        }
                                    }
                                   
                                    webix.UIManager.setFocus(window.winActiveBlock['focusNow']);
                                }
                            }
                        }
                    // }catch(err){
                    //     $$(menuId).showProgress({type:"icon",hide:true});//loading
                    //     $$(menuId).disable()//enable
                    //     webix.message({
                    //         text:"Error Detected, please capture this error and contact IT HO: <br><br>Error: JS - Element - NextButton - "+err,
                    //         type:"error", 
                    //         expire: 10000,
                    //     });
                    //     //console.log("JS - Element - NextButton - Error: ",err)
                    // }
                    }
                },
                hidden: hideButton[id]
            }
        )
        return nextBtn;
    }

    PREVBLOCKBUTTON(id){
        let prevBlockBtn = this.NORMALBUTTON(id,"prevBlock",(function(){}),{})
        prevBlockBtn = Object.assign(prevBlockBtn,{"width": 1, hidden:false,hotkey:'ctrl+up',"on":{
                onItemClick:function(){
                    // try{
                        if(window.winOpenPopUp=="closed"){
                            let blocks = Object.keys(winConfigForm)
                            let blocksLength = blocks.length
                            let idxNow = blocks.indexOf(winActiveBlock['focusNow'])
                            let prevIdx = idxNow-1
                            if(prevIdx==-1){
                                prevIdx=blocksLength-1
                            }
                            if($$(window.winActiveBlock['focusNow'])==null || $$(window.winActiveBlock['focusNow'])==""){
                                if($$(blocks[prevIdx]).validate()){
                                    if($$(blocks[prevIdx]).config.view=="form"){
                                        webix.html.removeCss($$(window.winActiveBlock["focusNow"]).getNode(), "datablock-focus")
                                        webix.UIManager.setFocus($$(blocks[prevIdx]))
                                        if(winMultiviewBlocks.includes(blocks[prevIdx])){
                                            $$("tabbar"+menuId).setValue(blocks[prevIdx])
                                            $$("tabbar"+blocks[prevIdx]).show()
                                        }else if(winMultiviewBlocksVertical.includes(blocks[prevIdx])){
                                            $$("listMultiviewVertical"+menuId).select(blocks[prevIdx])
                                            $$(blocks[prevIdx]+"_verticalTab").show()
                                        }
                                        winActiveBlock['lastFocus'] = winActiveBlock['focusNow']                                          
                                        winActiveBlock['focusNow'] = blocks[prevIdx]                                          
                                        webix.html.addCss($$(window.winActiveBlock["focusNow"]).getNode(), "datablock-focus")
                                        let elementsBlock = Object.keys($$(blocks[prevIdx]).elements)
                                        for(let x=0; x<=elementsBlock.length-1; x++){
                                            let disabledItem = $$(elementsBlock[x]).config.disableItem || false
                                            if(disabledItem==false){
                                                webix.UIManager.setFocus(elementsBlock[x])
                                                break;
                                            }    
                                        }
                                    }else if($$(blocks[prevIdx]).config.view=="datatable"){
                                        webix.UIManager.setFocus($$(blocks[prevIdx]))
                                        if(winMultiviewBlocks.includes(blocks[prevIdx])){
                                            $$("tabbar"+menuId).setValue(blocks[prevIdx])
                                            $$("tabbar"+blocks[prevIdx]).show()
                                        }else if(winMultiviewBlocksVertical.includes(blocks[prevIdx])){
                                            $$("listMultiviewVertical"+menuId).select(blocks[prevIdx])
                                            $$(blocks[prevIdx]+"_verticalTab").show()
                                        }
                                    }
                                }else{

                                }
                            }else{
                                if($$(winActiveBlock.focusNow).validate()){
                                    // if(blocks[prevIdx]!=undefined){
                                    if($$(blocks[prevIdx]).config.view=="form"){
                                        webix.html.removeCss($$(window.winActiveBlock["focusNow"]).getNode(), "datablock-focus")
                                        webix.UIManager.setFocus($$(blocks[prevIdx]))
                                        if(winMultiviewBlocks.includes(blocks[prevIdx])){
                                            $$("tabbar"+menuId).setValue(blocks[prevIdx])
                                            $$("tabbar"+blocks[prevIdx]).show()
                                        }else if(winMultiviewBlocksVertical.includes(blocks[prevIdx])){
                                            $$("listMultiviewVertical"+menuId).select(blocks[prevIdx])
                                            $$(blocks[prevIdx]+"_verticalTab").show()
                                        }
                                        winActiveBlock['lastFocus'] = winActiveBlock['focusNow']
                                        winActiveBlock['focusNow'] = blocks[prevIdx]                                          
                                        webix.html.addCss($$(window.winActiveBlock["focusNow"]).getNode(), "datablock-focus")
                                        let elementsBlock = Object.keys($$(blocks[prevIdx]).elements)
                                        for(let x=0; x<=elementsBlock.length-1; x++){
                                            let disabledItem = $$(elementsBlock[x]).config.disableItem || false
                                            if(disabledItem==false){
                                                webix.UIManager.setFocus(elementsBlock[x])
                                                break;
                                            }    
                                        }
                                    }else if($$(blocks[prevIdx]).config.view=="datatable"){
                                        webix.UIManager.setFocus($$(blocks[prevIdx]))
                                        if(winMultiviewBlocks.includes(blocks[prevIdx])){
                                            $$("tabbar"+menuId).setValue(blocks[prevIdx])
                                            $$("tabbar"+blocks[prevIdx]).show()
                                        }else if(winMultiviewBlocksVertical.includes(blocks[prevIdx])){
                                            $$("listMultiviewVertical"+menuId).select(blocks[prevIdx])
                                            $$(blocks[prevIdx]+"_verticalTab").show()
                                        }
                                    }
                                }
                            }
                        }
                }
            }})
        return prevBlockBtn;
    }

    NEXTBLOCKBUTTON(id){
        let nextBlockBtn = this.NORMALBUTTON(id,"nextBlock",(function(){}),{})
        nextBlockBtn = Object.assign(nextBlockBtn,{"width": 1, hidden:false ,hotkey:'ctrl+down',"on":{
                onItemClick:function(){
                    // try{
                        if(window.winOpenPopUp=="closed"){
                            let blocks = Object.keys(winConfigForm)
                            let blocksLength = blocks.length
                            let idxNow = blocks.indexOf(winActiveBlock['focusNow'])
                            let nextIdx = idxNow+1
                            if(nextIdx==blocksLength){
                                nextIdx = 0
                            }
                            if($$(window.winActiveBlock['focusNow'])==null || $$(window.winActiveBlock['focusNow'])==""){
                                if($$(blocks[nextIdx]).validate()){
                                    if($$(blocks[nextIdx]).config.view=="form"){
                                        webix.html.removeCss($$(window.winActiveBlock["focusNow"]).getNode(), "datablock-focus")
                                        webix.UIManager.setFocus($$(blocks[nextIdx]))
                                        if(winMultiviewBlocks.includes(blocks[nextIdx])){
                                            $$("tabbar"+menuId).setValue(blocks[nextIdx])
                                            $$("tabbar"+blocks[nextIdx]).show()
                                        }else if(winMultiviewBlocksVertical.includes(blocks[nextIdx])){
                                            $$("listMultiviewVertical"+menuId).select(blocks[nextIdx])
                                            $$(blocks[nextIdx]+"_verticalTab").show()
                                        }
                                        winActiveBlock['lastFocus'] = winActiveBlock['focusNow']                                          
                                        winActiveBlock['focusNow'] = blocks[nextIdx]                                          
                                        webix.html.addCss($$(window.winActiveBlock["focusNow"]).getNode(), "datablock-focus")
                                        let elementsBlock = Object.keys($$(blocks[nextIdx]).elements)
                                        for(let x=0; x<=elementsBlock.length-1; x++){
                                                let disabledItem = $$(elementsBlock[x]).config.disableItem || false
                                                if(disabledItem==false){
                                                    webix.UIManager.setFocus(elementsBlock[x])
                                                    break;
                                                }    
                                            }
                                    }else if($$(blocks[nextIdx]).config.view=="datatable"){
                                        webix.UIManager.setFocus($$(blocks[nextIdx]))
                                        if(winMultiviewBlocks.includes(blocks[nextIdx])){
                                            $$("tabbar"+menuId).setValue(blocks[nextIdx])
                                            $$("tabbar"+blocks[nextIdx]).show()
                                        }else if(winMultiviewBlocksVertical.includes(blocks[nextIdx])){
                                            $$("listMultiviewVertical"+menuId).select(blocks[nextIdx])
                                            $$(blocks[nextIdx]+"_verticalTab").show()
                                        }
                                    }
                                }else{

                                }
                            }else{
                                if($$(winActiveBlock.focusNow).validate()){
                                    if(blocks[nextIdx]!=undefined){
                                        if($$(blocks[nextIdx]).config.view=="form"){
                                            webix.html.removeCss($$(window.winActiveBlock["focusNow"]).getNode(), "datablock-focus")
                                            webix.UIManager.setFocus($$(blocks[nextIdx]))
                                            if(winMultiviewBlocks.includes(blocks[nextIdx])){
                                                $$("tabbar"+menuId).setValue(blocks[nextIdx])
                                                $$("tabbar"+blocks[nextIdx]).show()
                                            }else if(winMultiviewBlocksVertical.includes(blocks[nextIdx])){
                                                $$("listMultiviewVertical"+menuId).select(blocks[nextIdx])
                                                $$(blocks[nextIdx]+"_verticalTab").show()
                                            }
                                            winActiveBlock['lastFocus'] = winActiveBlock['focusNow']                                          
                                            winActiveBlock['focusNow'] = blocks[nextIdx]                                          
                                            webix.html.addCss($$(window.winActiveBlock["focusNow"]).getNode(), "datablock-focus")
                                            let elementsBlock = Object.keys($$(blocks[nextIdx]).elements)
                                            for(let x=0; x<=elementsBlock.length-1; x++){
                                                let disabledItem = $$(elementsBlock[x]).config.disableItem || false
                                                if(disabledItem==false){
                                                    webix.UIManager.setFocus(elementsBlock[x])
                                                    break;
                                                }    
                                            }
                                        }else if($$(blocks[nextIdx]).config.view=="datatable"){
                                            webix.UIManager.setFocus($$(blocks[nextIdx]))
                                            if(winMultiviewBlocks.includes(blocks[nextIdx])){
                                                $$("tabbar"+menuId).setValue(blocks[nextIdx])
                                                $$("tabbar"+blocks[nextIdx]).show()
                                            }else if(winMultiviewBlocksVertical.includes(blocks[nextIdx])){
                                                $$("listMultiviewVertical"+menuId).select(blocks[nextIdx])
                                                $$(blocks[nextIdx]+"_verticalTab").show()
                                            }
                                        }
                                    }else{
                                        if($$(blocks[nextIdx]).config.view=="form"){
                                            webix.html.removeCss($$(window.winActiveBlock["focusNow"]).getNode(), "datablock-focus")
                                            webix.UIManager.setFocus($$(blocks[nextIdx]))
                                            if(winMultiviewBlocks.includes(blocks[nextIdx])){
                                                $$("tabbar"+menuId).setValue(blocks[nextIdx])
                                                $$("tabbar"+blocks[nextIdx]).show()
                                            }else if(winMultiviewBlocksVertical.includes(blocks[nextIdx])){
                                                $$("listMultiviewVertical"+menuId).select(blocks[nextIdx])
                                                $$(blocks[nextIdx]+"_verticalTab").show()
                                            }
                                            winActiveBlock['lastFocus'] = winActiveBlock['focusNow']                                          
                                            winActiveBlock['focusNow'] = blocks[nextIdx]                                          
                                            webix.html.addCss($$(window.winActiveBlock["focusNow"]).getNode(), "datablock-focus")
                                            let elementsBlock = Object.keys($$(blocks[nextIdx]).elements)
                                            for(let x=0; x<=elementsBlock.length-1; x++){
                                                let disabledItem = $$(elementsBlock[x]).config.disableItem || false
                                                if(disabledItem==false){
                                                    webix.UIManager.setFocus(elementsBlock[x])
                                                    break;
                                                }    
                                            }
                                        }else if($$(blocks[nextIdx]).config.view=="datatable"){
                                            webix.UIManager.setFocus($$(blocks[nextIdx]))
                                            if(winMultiviewBlocks.includes(blocks[nextIdx])){
                                                $$("tabbar"+menuId).setValue(blocks[nextIdx])
                                                $$("tabbar"+blocks[nextIdx]).show()
                                            }else if(winMultiviewBlocksVertical.includes(blocks[nextIdx])){
                                                $$("listMultiviewVertical"+menuId).select(blocks[nextIdx])
                                                $$(blocks[nextIdx]+"_verticalTab").show()
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    // }catch(err){
                    //     $$(menuId).showProgress({type:"icon",hide:true});//loading
                    //     $$(menuId).disable()//enable
                    //     webix.message({
                    //         text:"Error Detected, please capture this error and contact IT HO: <br><br>Error: JS - Element - NextBlockButton - "+err,
                    //         type:"error", 
                    //         expire: 10000,
                    //     });
                    //     //console.log("JS - Element - NextBlockButton - Error: ",err)
                    // }
                }
            }})
        return nextBlockBtn;
    }

    SEARCHBUTTON(id,url){
        let extendOn ={ 
            onItemClick: function(){
                // try{
                    if(window.openHTTPs != 0){
                        return webix.message({
                            text:"Please wait, <br> Your document is being loaded.",
                            type:"debug", 
                            expire: 800,
                        });
                    }
                    if(window.winOpenPopUp=="closed"){
                        let blocks = Object.keys(winConfigForm)
                        if(window.winSearchMode==false){
                            winDataAtStart = false;
                            winSearchParam = {status:false, param:{}}
                            if(winConfigForm[winActiveBlock.focusNow]['BLOCK_TYPE'][1]=="PARENT"){
                                if(winConfigForm[winActiveBlock.focusNow]['BLOCK_TYPE'][0]!="DATAGRID"){
                                    window.winCheckRadio.forEach(function(item){
                                        if($$(item)!=undefined){
                                            $$(item).disable()
                                        }
                                    })
                                    window.winButtonCallForm.forEach(function(item){
                                        if($$(item)!=undefined){
                                            $$(item).define('disabled',true)
                                        }
                                    })
                                    $$("searchValue").define('css', "webix_custom_button")
                                    $$("searchValue").refresh()
                                    $$("addValue").$view.classList.remove("webix_custom_button")
                                    $$("addValue").refresh()
                                    $$("addRowDb").hide()
                                    let blockName = winActiveBlock.focusNow
                                    for(id in winCheckRadio){
                                        if(winConfigForm[blockName]["ELEMENT"].includes(winCheckRadio[id])){
                                            $$(winCheckRadio[id]).config.searchItem = false
                                        }
                                    }
                                    if(winSubParent.length != 0){
                                        winSubParent.forEach(function(blockSubParent){
                                            for(id in winCheckRadio){
                                                if(winConfigForm[blockSubParent]["ELEMENT"].includes(winCheckRadio[id])){
                                                    $$(winCheckRadio[id]).config.searchItem = false
                                                }
                                            }
                                        })
                                    }
                                    webix.message({text:"Search Mode",expire: 2000});
                                    
                                    this.config.value="Search Data"
                                    this.refresh()
                                    window.winSearchMode=true;
                                    window.winAddData=false;
                                    
                                    if($$(window.winActiveBlock['focusNow']).config.view=="form" || $$(window.winActiveBlock['focusNow']).config.view=="datatable" ){
                                        Object.keys(winDataChanged).forEach(function(idBlock){
                                            winDataChanged[idBlock] = []
                                        })
                                        winConfigForm[winActiveBlock.focusNow]['ELEMENT'].forEach(function(id){
                                            if (!winDisplayItem.includes(id)){
                                                if($$(id)!=undefined){
                                                    $$(id).enable()
                                                }
                                            }
                                        })

                                        if(blocks.length==1){
                                            if($$(window.winActiveBlock['focusNow']).config.view=="form"){
                                                $$(winActiveBlock.focusNow).clear()
                                                $$(winActiveBlock.focusNow).clearValidation()
                                                if(!$$(winConfigForm[winActiveBlock.focusNow]["ELEMENT"][0]).config.hidden){
                                                    webix.UIManager.setFocus($$(winConfigForm[winActiveBlock.focusNow]["ELEMENT"][0])); 
                                                }else{
                                                    winConfigForm[winActiveBlock.focusNow]["ELEMENT"].every(function(element){
                                                        if(!$$(element).config.hidden && !$$(element).config.displayItem){
                                                            webix.UIManager.setFocus($$(element))
                                                            return false
                                                        }
                                                        return true
                                                    })
                                                }
                                            }else if($$(window.winActiveBlock['focusNow']).config.view=="datatable"){
                                                $$(winActiveBlock.focusNow).clearAll()
                                                $$(winActiveBlock.focusNow).clearValidation()
                                                
                                                
                                                ///////////
                                                // webix.UIManager.setFocus($$(winConfigForm[winActiveBlock.focusNow]["ELEMENT"][0])); 
                                            }
                                        }else if(blocks.length>1){
                                            if(winConfigForm[winActiveBlock.focusNow]['BLOCK_TYPE'][1]=="PARENT"){
                                                blocks.forEach(function(blockId){
                                                    if(blockId!=winActiveBlock.focusNow){
                                                        if(winConfigForm[blockId]['BLOCK_TYPE'][1]!="SUB_PARENT"){
                                                            if($$(blockId).config.view=="form"){
                                                                $$(blockId).disable()
                                                                $$(blockId).clear()
                                                            }else if($$(blockId).config.view=="datatable"){
                                                                $$(blockId).disable()
                                                                $$(blockId).clearAll()
                                                            }
                                                        }else{
                                                            if($$(blockId).config.view=="form"){
                                                                $$(blockId).clear()
                                                            }else if($$(blockId).config.view=="datatable"){
                                                                $$(blockId).clearAll()
                                                            }
                                                        }
                                                    }
                                                })
                                            }else{
                                                blocks.forEach(function(blockId){
                                                    if(blockId!=winActiveBlock.focusNow){
                                                        $$(blockId).disable()
                                                    }
                                                })
                                            }
                                            if($$(window.winActiveBlock['focusNow']).config.view=="form"){
                                                $$(winActiveBlock.focusNow).clear()
                                                $$(winActiveBlock.focusNow).clearValidation()
                                                if(!$$(winConfigForm[winActiveBlock.focusNow]["ELEMENT"][0]).config.hidden){
                                                    webix.UIManager.setFocus($$(winConfigForm[winActiveBlock.focusNow]["ELEMENT"][0])); 
                                                }else{
                                                    winConfigForm[winActiveBlock.focusNow]["ELEMENT"].every(function(element){
                                                        if(!$$(element).config.hidden && !$$(element).config.displayItem){
                                                            webix.UIManager.setFocus($$(element))
                                                            return false
                                                        }
                                                        return true
                                                    })
                                                }
                                                winCountOffsetRecord[winActiveBlock.focusNow] = 0 
                                            }else if($$(window.winActiveBlock['focusNow']).config.view=="datatable"){
                                                $$(winActiveBlock.focusNow).clearAll()
                                                $$(winActiveBlock.focusNow).clearValidation()
    
                                                ////////////////////////////////////////////
                                            }
                                            // webix.UIManager.setFocus($$(winConfigForm[blocks[0]]["ELEMENT"][0]));
                                        }
                                        winConfigForm[winActiveBlock.focusNow]["PRIMARY_KEY"].forEach(function (item) {
                                            if(!$$(item).config.displayItem){
                                                if (!winDisplayItem.includes(item)){
                                                    $$(item).define("disabled",false)
                                                    $$(item).define("readonly",false)
                                                    $$(item).refresh()
                                                }
                                            }
                                            
                                        });

                                        winIsPrimary.forEach(function(pkId){
                                            if(getBlockItem(pkId)==winActiveBlock.focusNow){
                                                if(!$$(pkId).config.displayItem){
                                                    if (!winDisplayItem.includes(pkId)){
                                                        $$(pkId).define("disabled",false)
                                                        $$(pkId).define("readonly",false)
                                                        $$(pkId).refresh()
                                                    }
                                                }
                                            }
                                        })
                                    }
                                    blocks.forEach(function(block){
                                        if(winConfigForm[block]['BLOCK_TYPE'][0]=="DATAGRID"){
                                            winConfigForm[block]["PRIMARY_KEY"].forEach(function(pkCol){
                                                let columns = $$(block).config.columns
                                                columns.forEach(function(colObj){
                                                    if(colObj.id==pkCol){
                                                        if(!$$(block).getColumnConfig(colObj.id).disabledItem){
                                                            if(colObj.jenis!="combo"){
                                                                colObj.editor = "text"
                                                            }
                                                        }
                                                        
                                                    }
                                                })
                                            })
                                        }
                                    })
                                    winPopUpUploaderDt.forEach(function(idWd){
                                        $$(idWd).close()

                                        let index = winPopUpUploaderDt.indexOf(idWd)
                                        winPopUpUploaderDt.splice(index, 1);
                                    })
                                    
                                    winImageElement.forEach(function (obj) {
                                        $$(obj['idTemplate']).setHTML('<img src="static/fotoprofil.jpeg" width="180px" height="200px" class="content" ondragstart="return false"/>')
                                    })

                                    $$("addValue").config.value="Add New Data"
                                    $$("addValue").config.image="https://hocdnoden0201.sat.co.id/img/addBtn.png"
                                    $$("addValue").refresh()
                                    $$("prev").define('disabled',true)
                                    $$("next").define('disabled',true)
                                    $$("addValue").define('disabled',false)
                                    $$("updateValue").define('disabled',true)
                                    $$("deleteValue").define('disabled',true)
                                }else{
                                    Object.keys(winDataChanged).forEach(function(idBlock){
                                        winDataChanged[idBlock] = []
                                    })
                                    $$(winActiveBlock.focusNow).config.dynamicLoadData = 0
                                    if(winConfigForm[winActiveBlock.focusNow]['BLOCK_TYPE'][1]=="PARENT"){
                                        blocks.forEach(function(blockId){
                                            if(blockId!=winActiveBlock.focusNow){
                                                if($$(blockId).config.view=="form"){
                                                    $$(blockId).disable()
                                                    $$(blockId).clear()
                                                }else if($$(blockId).config.view=="datatable"){
                                                    $$(blockId).disable()
                                                    $$(blockId).clearAll()
                                                }
                                            }
                                        })
                                    }else{
                                        blocks.forEach(function(blockId){
                                            if(blockId!=winActiveBlock.focusNow){
                                                $$(blockId).disable()
                                            }
                                        })
                                    }
                                    $$(winActiveBlock.focusNow).clearAll()
                                    $$(winActiveBlock.focusNow).clearValidation()
    
                                    $$("searchValue").define('css', "webix_custom_button")
                                    $$("searchValue").refresh()
                                    $$("addValue").$view.classList.remove("webix_custom_button")
                                    $$("addValue").refresh()
                                    this.config.value="Search Data"
                                    this.refresh()
                                    window.winSearchMode=true;
                                    window.winAddData=false;

                                    $$(window.winActiveBlock['focusNow']).add({},$$("pager_"+window.winActiveBlock['focusNow'])['data']['old_count'])
                                    $$(window.winActiveBlock['focusNow']).setPage($$("pager_"+window.winActiveBlock['focusNow'])['data']['limit']);
                                    let row_id = $$(window.winActiveBlock['focusNow']).getLastId();
                                    webix.UIManager.setFocus(winActiveBlock['focusNow'])
                                    
                                    // $$(window.winActiveBlock['focusNow']).editCell(row_id,$$(window.winActiveBlock['focusNow'])['config']['columns'][0]['id']);
                                    if (isGridToGrid) {
                                        window.winActiveCell = window.winValidateItemPos
                                        winConfigForm[window.winActiveBlock['focusNow']]['WIN_ACTIVE_CELL_BLOCK'] = window.winActiveCell
                                    }else{
                                        $$(window.winActiveBlock['focusNow']).select(row_id,$$(window.winActiveBlock['focusNow'])['config']['columns'][0]['id'], false)
                                    }
                                    
                                    for(id in winCheckRadio){
                                        if(winConfigForm[winActiveBlock.focusNow]["ELEMENT"].includes(winCheckRadio[id])){
                                            $$(winActiveBlock.focusNow).getColumnConfig(winCheckRadio[id]).searchItem = false
                                        }
                                    }
                                    $$("addValue").config.value="Add New Data"
                                    $$("addValue").config.image="https://hocdnoden0201.sat.co.id/img/addBtn.png"
                                    $$("addValue").refresh()
                                    $$("prev").define('disabled',true)
                                    $$("next").define('disabled',true)
                                    $$("addValue").define('disabled',false)
                                    $$("updateValue").define('disabled',true)
                                    $$("deleteValue").define('disabled',true)
                                }
                            }else if (winConfigForm[winActiveBlock.focusNow]['BLOCK_TYPE'][1]=="SUB_CHILD" || winConfigForm[winActiveBlock.focusNow]['BLOCK_TYPE'][1]=="CHILD") {
                                if (winThereIsSubChild) {
                                    if (winConfigForm[winActiveBlock.focusNow]['BLOCK_TYPE'][1]=="SUB_CHILD") {
                                        $$(winActiveBlock.focusNow).config.dynamicLoadData = 0
                                        let parent= winConfigForm[winActiveBlock.focusNow]["BLOCK_TYPE"][2]    
                                        blocks.forEach(function(blockId){
                                            if (winConfigForm[blockId]["BLOCK_TYPE"][2] != parent && blockId != parent) {
                                                $$(blockId).disable()
                                            }else{
                                                $$(blockId).clearAll()
                                                $$(blockId).clearValidation();
                                                $$(blockId).add({}, $$("pager_" + blockId)['data']['old_count'])
                                                $$(blockId).setPage($$("pager_" + blockId)['data']['limit']);
                                                $$("count_"+blockId).define("count",1)
                                                $$("count_"+blockId).define("page",1-1)
                                                $$("count_"+blockId).refresh()
                                            }
                                        })
                                        $$("searchValue").define('css', "webix_custom_button")
                                        $$("searchValue").refresh()
                                        $$("addValue").$view.classList.remove("webix_custom_button")
                                        $$("addValue").refresh()
                                        let row_id = $$(window.winActiveBlock['focusNow']).getLastId();
                                        $$(window.winActiveBlock['focusNow']).setPage($$("pager_"+window.winActiveBlock['focusNow'])['data']['limit']);                                
                                        // $$("count_"+window.winActiveBlock['focusNow']).define("count",1)
                                        
                                        $$(window.winActiveBlock['focusNow']).select(row_id,$$(window.winActiveBlock['focusNow'])['config']['columns'][0]['id'], false)
                                        webix.UIManager.setFocus(winActiveBlock['focusNow'])
                                        let view = $$(window.winActiveBlock['focusNow'])
                                        let pos = view.getSelectedId();
                                        window.winActiveCell = {"pos":pos, "view":view}
                                        
        
                                        this.config.value="Search Data"
                                        this.refresh()
                                        window.winSearchMode=true;
                                        window.winAddData=false;
        
        
                                        $$("addValue").config.value="Add New Data"
                                        $$("addValue").config.image="https://hocdnoden0201.sat.co.id/img/addBtn.png"
                                        $$("addValue").refresh()
                                        $$("prev").define('disabled',true)
                                        $$("next").define('disabled',true)
                                        $$("addValue").define('disabled',false)
                                        $$("updateValue").define('disabled',true)
                                        $$("deleteValue").define('disabled',true)
                                    }else if(winConfigForm[winActiveBlock.focusNow]['BLOCK_TYPE'][1]=="CHILD"){
                                        $$(winActiveBlock.focusNow).config.dynamicLoadData = 0
                                        if(winConfigForm[winActiveBlock.focusNow]['BLOCK_TYPE'][1]=="PARENT"){
                                            blocks.forEach(function(blockId){
                                                if(blockId!=winActiveBlock.focusNow){
                                                    if($$(blockId).config.view=="form"){
                                                        $$(blockId).disable()
                                                        $$(blockId).clear()
                                                    }else if($$(blockId).config.view=="datatable"){
                                                        $$(blockId).disable()
                                                        $$(blockId).clearAll()
                                                    }
                                                }
                                            })
                                        }else{
                                            blocks.forEach(function(blockId){
                                                if(winConfigForm[blockId]["BLOCK_TYPE"][2] != winActiveBlock.focusNow && blockId != winActiveBlock.focusNow){
                                                    $$(blockId).disable()
                                                }else{
                                                    $$(blockId).clearAll()
                                                    $$(blockId).clearValidation();
                                                    $$(blockId).add({}, $$("pager_" + blockId)['data']['old_count'])
                                                    $$(blockId).setPage($$("pager_" + blockId)['data']['limit']);
                                                    $$("count_"+blockId).define("count",1)
                                                    $$("count_"+blockId).define("page",1-1)
                                                    $$("count_"+blockId).refresh()
                                                }
                                            })
                                        }
        
                                        $$("searchValue").define('css', "webix_custom_button")
                                        $$("searchValue").refresh()
                                        $$("addValue").$view.classList.remove("webix_custom_button")
                                        $$("addValue").refresh()
        
                                        // $$(window.winActiveBlock['focusNow']).setPage($$("pager_"+window.winActiveBlock['focusNow'])['data']['limit']);
                                        let row_id = $$(window.winActiveBlock['focusNow']).getLastId();
                                        $$(window.winActiveBlock['focusNow']).select(row_id,$$(window.winActiveBlock['focusNow'])['config']['columns'][0]['id'], false)
                                        webix.UIManager.setFocus(winActiveBlock['focusNow'])
                                        // $$(window.winActiveBlock['focusNow']).editCell(row_id,$$(window.winActiveBlock['focusNow'])['config']['columns'][0]['id']);
                                        let view = $$(window.winActiveBlock['focusNow'])
                                        let pos = view.getSelectedId();
                                        window.winActiveCell = {"pos":pos, "view":view}
                                        
        
                                        this.config.value="Search Data"
                                        this.refresh()
                                        window.winSearchMode=true;
                                        window.winAddData=false;
    
        
                                        $$("addValue").config.value="Add New Data"
                                        $$("addValue").config.image="https://hocdnoden0201.sat.co.id/img/addBtn.png"
                                        $$("addValue").refresh()
                                        $$("prev").define('disabled',true)
                                        $$("next").define('disabled',true)
                                        $$("addValue").define('disabled',false)
                                        $$("updateValue").define('disabled',true)
                                        $$("deleteValue").define('disabled',true)
                                    }
                                }else{
                                    $$(winActiveBlock.focusNow).config.dynamicLoadData = 0
                                    if(winConfigForm[winActiveBlock.focusNow]['BLOCK_TYPE'][1]=="PARENT"){
                                        blocks.forEach(function(blockId){
                                            if(blockId!=winActiveBlock.focusNow){
                                                if($$(blockId).config.view=="form"){
                                                    $$(blockId).disable()
                                                    $$(blockId).clear()
                                                }else if($$(blockId).config.view=="datatable"){
                                                    $$(blockId).disable()
                                                    $$(blockId).clearAll()
                                                }
                                            }
                                        })
                                    }else{
                                        blocks.forEach(function(blockId){
                                            if(blockId!=winActiveBlock.focusNow){
                                                $$(blockId).disable()
                                                if (isGridToGrid && statusMasterDetailGridToGrid != "") {
                                                    if (winConfigForm[blockId]['BLOCK_TYPE'][1] == 'GRANDCHILD') {
                                                        $$(blockId).clearAll()
                                                    }
                                                }
                                            }
                                        })
                                    }
                                    $$("searchValue").define('css', "webix_custom_button")
                                    $$("searchValue").refresh()
                                    $$("addValue").$view.classList.remove("webix_custom_button")
                                    $$("addValue").refresh()
    
    
                                    this.config.value="Search Data"
                                    this.refresh()
                                    window.winSearchMode=true;
                                    window.winAddData=false;

                                    if($$(window.winActiveBlock['focusNow']).config.view=="form"){
                                        $$(winActiveBlock.focusNow).clear()
                                        $$(winActiveBlock.focusNow).clearValidation()
                                        if(!$$(winConfigForm[winActiveBlock.focusNow]["ELEMENT"][0]).config.hidden){
                                            webix.UIManager.setFocus($$(winConfigForm[winActiveBlock.focusNow]["ELEMENT"][0])); 
                                        }else{
                                            winConfigForm[winActiveBlock.focusNow]["ELEMENT"].every(function(element){
                                                if(!$$(element).config.hidden && !$$(element).config.displayItem){
                                                    webix.UIManager.setFocus($$(element))
                                                    return false
                                                }
                                                return true
                                            })
                                        }
                                        winCountOffsetRecord[winActiveBlock.focusNow] = 0 
                                    }else if($$(window.winActiveBlock['focusNow']).config.view=="datatable"){
                                        $$(winActiveBlock.focusNow).clearAll()
                                        $$(winActiveBlock.focusNow).clearValidation()
                                        $$(window.winActiveBlock['focusNow']).add({},$$("pager_"+window.winActiveBlock['focusNow'])['data']['old_count'])
                                        $$(window.winActiveBlock['focusNow']).setPage($$("pager_"+window.winActiveBlock['focusNow'])['data']['limit']);
                                        let row_id = $$(window.winActiveBlock['focusNow']).getLastId();
                                        
                                        $$(window.winActiveBlock['focusNow']).select(row_id,$$(window.winActiveBlock['focusNow'])['config']['columns'][0]['id'], false)
                                        webix.UIManager.setFocus(winActiveBlock['focusNow'])
                                        // $$(window.winActiveBlock['focusNow']).editCell(row_id,$$(window.winActiveBlock['focusNow'])['config']['columns'][0]['id']);
                                        let view = $$(window.winActiveBlock['focusNow'])
                                        let pos = view.getSelectedId();
                                        window.winActiveCell = {"pos":pos, "view":view}
                                    }
    
                                    $$("addValue").config.value="Add New Data"
                                    $$("addValue").config.image="https://hocdnoden0201.sat.co.id/img/addBtn.png"
                                    $$("addValue").refresh()
                                    $$("prev").define('disabled',true)
                                    $$("next").define('disabled',true)
                                    $$("addValue").define('disabled',false)
                                    $$("updateValue").define('disabled',true)
                                    $$("deleteValue").define('disabled',true)
                                        // webix.alert(ALERT.ALERTWARNING("Datagrid<br>Tidak tersedia fitur Search Data"))
                                }
                            }else{
                                
                                if(winConfigForm[winActiveBlock.focusNow]['BLOCK_TYPE'][1]=="SUB_PARENT"){
                                    if(winConfigForm[winActiveBlock.focusNow]['BLOCK_TYPE'][0]!="DATAGRID"){
                                        window.winCheckRadio.forEach(function(item){
                                            if($$(item)!=undefined){
                                                $$(item).disable()
                                            }
                                        })
                                        window.winButtonCallForm.forEach(function(item){
                                            if($$(item)!=undefined){
                                                $$(item).define('disabled',true)
                                            }
                                        })
                                        $$("searchValue").define('css', "webix_custom_button")
                                        $$("searchValue").refresh()
                                        $$("addValue").$view.classList.remove("webix_custom_button")
                                        $$("addValue").refresh()
                                        $$("addRowDb").hide()
                                        let blockName = winActiveBlock.focusNow
                                        for(id in winCheckRadio){
                                            if(winConfigForm[blockName]["ELEMENT"].includes(winCheckRadio[id])){
                                                $$(winCheckRadio[id]).config.searchItem = false
                                            }
                                        }
                                        webix.message({text:"Search Mode",expire: 2000});
                                        
                                        this.config.value="Search Data"
                                        this.refresh()
                                        window.winSearchMode=true;
                                        window.winAddData=false;
                                        
                                        if($$(window.winActiveBlock['focusNow']).config.view=="form" || $$(window.winActiveBlock['focusNow']).config.view=="datatable" ){
                                            Object.keys(winDataChanged).forEach(function(idBlock){
                                                winDataChanged[idBlock] = []
                                            })
                                            winConfigForm[winActiveBlock.focusNow]['ELEMENT'].forEach(function(id){
                                                if (!winDisplayItem.includes(id)){
                                                    if($$(id)!=undefined){
                                                        $$(id).enable()
                                                    }
                                                }
                                            })
                                            let indexObj = blocks.indexOf(winActiveBlock.focusNow)
                                            winConfigForm[winActiveBlock.focusNow]["PRIMARY_KEY"].forEach(function (item) {
                                                if(!$$(item).config.displayItem){
                                                    if (!winDisplayItem.includes(item)){
                                                        $$(item).define("disabled",false)
                                                        $$(item).define("readonly",false)
                                                        $$(item).refresh()
                                                    }
                                                }
                                                
                                            });
    
                                            winIsPrimary.forEach(function(pkId){
                                                if(getBlockItem(pkId)==winActiveBlock.focusNow){
                                                    if(!$$(pkId).config.displayItem){
                                                        if (!winDisplayItem.includes(pkId)){
                                                            $$(pkId).define("disabled",false)
                                                            $$(pkId).define("readonly",false)
                                                            $$(pkId).refresh()
                                                        }
                                                    }
                                                }
                                            })
    
                                            if(blocks.length==1){
                                                if($$(window.winActiveBlock['focusNow']).config.view=="form"){
                                                    $$(winActiveBlock.focusNow).clear()
                                                    $$(winActiveBlock.focusNow).clearValidation()
                                                    if(!$$(winConfigForm[winActiveBlock.focusNow]["ELEMENT"][0]).config.hidden){
                                                        webix.UIManager.setFocus($$(winConfigForm[winActiveBlock.focusNow]["ELEMENT"][0])); 
                                                    }else{
                                                        winConfigForm[winActiveBlock.focusNow]["ELEMENT"].every(function(element){
                                                            if(!$$(element).config.hidden && !$$(element).config.displayItem){
                                                                webix.UIManager.setFocus($$(element))
                                                                return false
                                                            }
                                                            return true
                                                        })
                                                    }
                                                }else if($$(window.winActiveBlock['focusNow']).config.view=="datatable"){
                                                    $$(winActiveBlock.focusNow).clearAll()
                                                    $$(winActiveBlock.focusNow).clearValidation()
                                                    
                                                    
                                                    ///////////
                                                    // webix.UIManager.setFocus($$(winConfigForm[winActiveBlock.focusNow]["ELEMENT"][0])); 
                                                }
                                            }else if(blocks.length>1){
                                                if(winConfigForm[winActiveBlock.focusNow]['BLOCK_TYPE'][1]=="SUB_PARENT"){
                                                    blocks.forEach(function(blockId){
                                                        if(blockId!=winActiveBlock.focusNow){
                                                            if(winConfigForm[blockId]['BLOCK_TYPE'][1]!="SUB_PARENT" && winConfigForm[blockId]['BLOCK_TYPE'][1]!="PARENT" ){
                                                                if($$(blockId).config.view=="form"){
                                                                    $$(blockId).disable()
                                                                    $$(blockId).clear()
                                                                }else if($$(blockId).config.view=="datatable"){
                                                                    $$(blockId).disable()
                                                                    $$(blockId).clearAll()
                                                                }
                                                            }else{
                                                                if($$(blockId).config.view=="form"){
                                                                    $$(blockId).clear()
                                                                }else if($$(blockId).config.view=="datatable"){
                                                                    $$(blockId).clearAll()
                                                                }
                                                            }
                                                        }
                                                    })
                                                }else{
                                                    blocks.forEach(function(blockId){
                                                        if(blockId!=winActiveBlock.focusNow){
                                                            $$(blockId).disable()
                                                        }
                                                    })
                                                }
                                                if($$(window.winActiveBlock['focusNow']).config.view=="form"){
                                                    $$(winActiveBlock.focusNow).clear()
                                                    $$(winActiveBlock.focusNow).clearValidation()
                                                    if(!$$(winConfigForm[winActiveBlock.focusNow]["ELEMENT"][0]).config.hidden){
                                                        webix.UIManager.setFocus($$(winConfigForm[winActiveBlock.focusNow]["ELEMENT"][0])); 
                                                    }else{
                                                        winConfigForm[winActiveBlock.focusNow]["ELEMENT"].every(function(element){
                                                            if(!$$(element).config.hidden && !$$(element).config.displayItem){
                                                                webix.UIManager.setFocus($$(element))
                                                                return false
                                                            }
                                                            return true
                                                        })
                                                    }
                                                    winCountOffsetRecord[winActiveBlock.focusNow] = 0 
                                                }else if($$(window.winActiveBlock['focusNow']).config.view=="datatable"){
                                                    $$(winActiveBlock.focusNow).clearAll()
                                                    $$(winActiveBlock.focusNow).clearValidation()
        
                                                    ////////////////////////////////////////////
                                                }
                                                // webix.UIManager.setFocus($$(winConfigForm[blocks[0]]["ELEMENT"][0]));
                                            }
                                        }
                                        blocks.forEach(function(block){
                                            if(winConfigForm[block]['BLOCK_TYPE'][0]=="DATAGRID"){
                                                winConfigForm[block]["PRIMARY_KEY"].forEach(function(pkCol){
                                                    let columns = $$(block).config.columns
                                                    columns.forEach(function(colObj){
                                                        if(colObj.id==pkCol){
                                                            if(!$$(block).getColumnConfig(colObj.id).disabledItem){
                                                                if(colObj.jenis!="combo"){
                                                                    colObj.editor = "text"
                                                                }
                                                            }
                                                            
                                                        }
                                                    })
                                                })
                                            }
                                        })
                                        winPopUpUploaderDt.forEach(function(idWd){
                                            $$(idWd).close()
    
                                            let index = winPopUpUploaderDt.indexOf(idWd)
                                            winPopUpUploaderDt.splice(index, 1);
                                        })
                                        
                                        winImageElement.forEach(function (obj) {
                                            $$(obj['idTemplate']).setHTML('<img src="static/fotoprofil.jpeg" width="180px" height="200px" class="content" ondragstart="return false"/>')
                                        })
    
                                        $$("addValue").config.value="Add New Data"
                                        $$("addValue").config.image="https://hocdnoden0201.sat.co.id/img/addBtn.png"
                                        $$("addValue").refresh()
                                        $$("prev").define('disabled',true)
                                        $$("next").define('disabled',true)
                                        $$("addValue").define('disabled',false)
                                        $$("updateValue").define('disabled',true)
                                        $$("deleteValue").define('disabled',true)
                                    }else{
                                        $$(winActiveBlock.focusNow).config.dynamicLoadData = 0
                                        if(winConfigForm[winActiveBlock.focusNow]['BLOCK_TYPE'][1]=="PARENT"){
                                            blocks.forEach(function(blockId){
                                                if(blockId!=winActiveBlock.focusNow){
                                                    if($$(blockId).config.view=="form"){
                                                        $$(blockId).disable()
                                                        $$(blockId).clear()
                                                    }else if($$(blockId).config.view=="datatable"){
                                                        $$(blockId).disable()
                                                        $$(blockId).clearAll()
                                                    }
                                                }
                                            })
                                        }else{
                                            blocks.forEach(function(blockId){
                                                if(blockId!=winActiveBlock.focusNow){
                                                    $$(blockId).disable()
                                                }
                                            })
                                        }
                                        $$(winActiveBlock.focusNow).clearAll()
                                        $$(winActiveBlock.focusNow).clearValidation()
        
                                        $$("searchValue").define('css', "webix_custom_button")
                                        $$("searchValue").refresh()
                                        $$("addValue").$view.classList.remove("webix_custom_button")
                                        $$("addValue").refresh()
        
                                        $$(window.winActiveBlock['focusNow']).add({},$$("pager_"+window.winActiveBlock['focusNow'])['data']['old_count'])
                                        $$(window.winActiveBlock['focusNow']).setPage($$("pager_"+window.winActiveBlock['focusNow'])['data']['limit']);
                                        let row_id = $$(window.winActiveBlock['focusNow']).getLastId();
                                        
                                        $$(window.winActiveBlock['focusNow']).select(row_id,$$(window.winActiveBlock['focusNow'])['config']['columns'][0]['id'], false)
                                        webix.UIManager.setFocus(winActiveBlock['focusNow'])
                                        // $$(window.winActiveBlock['focusNow']).editCell(row_id,$$(window.winActiveBlock['focusNow'])['config']['columns'][0]['id']);
                                        let view = $$(window.winActiveBlock['focusNow'])
                                        let pos = view.getSelectedId();
                                        window.winActiveCell = {"pos":pos, "view":view}
                                        
        
                                        this.config.value="Search Data"
                                        this.refresh()
                                        window.winSearchMode=true;
                                        window.winAddData=false;
    
        
                                        $$("addValue").config.value="Add New Data"
                                        $$("addValue").config.image="https://hocdnoden0201.sat.co.id/img/addBtn.png"
                                        $$("addValue").refresh()
                                        $$("prev").define('disabled',true)
                                        $$("next").define('disabled',true)
                                        $$("addValue").define('disabled',false)
                                        $$("updateValue").define('disabled',true)
                                        $$("deleteValue").define('disabled',true)
                                    }
                                }else{
                                    if(!isWebixPopupOpen()){
                                        webix.alert(ALERT.ALERTWARNING("Filter/Searching non-Base diharapkan menggunakan Custom Button Search/Filter"))
                                    }
                                }
                            }
                        }else{
                            console.log("MASUK CEK SEARCH")
                            let valueForm
                            let searchData = {}
                            
                            if(winConfigForm[winActiveBlock.focusNow]['BLOCK_TYPE'][0]=="FORM"){
                                searchData[winActiveBlock.focusNow] = {}
                                valueForm = $$(winActiveBlock.focusNow).getValues()
                                searchData[winActiveBlock.focusNow]['blockType'] = "form"
                                searchData[winActiveBlock.focusNow]['data'] = [valueForm]
                                if(winSubParent.length != 0){
                                    if(winConfigForm[winActiveBlock.focusNow]['BLOCK_TYPE'][1]=="PARENT" || winSubParent.includes(winActiveBlock.focusNow)){
                                        if(!Object.keys(searchData).includes(getBlockParent())){
                                            searchData[getBlockParent()] = {}
                                            searchData[getBlockParent()]['blockType'] = "form"
                                            valueForm = $$(getBlockParent()).getValues()
                                            searchData[getBlockParent()]['data'] = [valueForm]
                                        }
                                        winSubParent.forEach(function(block){
                                            let valueFormSubParent = $$(block).getValues()
                                            Object.assign(searchData[getBlockParent()]['data'][0],  valueFormSubParent)
                                        }) 
                                    }
                                }
                            }else if(winConfigForm[winActiveBlock.focusNow]['BLOCK_TYPE'][0]=="DATAGRID"){
                                if (winThereIsSubChild) {
                                    if (winConfigForm[winActiveBlock.focusNow]["BLOCK_TYPE"][2] == undefined) {
                                        blocks.forEach(function(blockId){
                                            if(winConfigForm[blockId]["BLOCK_TYPE"][2] != winActiveBlock.focusNow && blockId != winActiveBlock.focusNow){
                                            }else{
                                                searchData[blockId] = {}
                                                $$(blockId).clearAll()
                                                $$(blockId).clearValidation()
                                                searchData[blockId]['blockType'] = "datagrid"
                                                valueForm = webix.copy(winDataChanged[blockId][0])
                                                searchData[blockId]['data'] = [valueForm]
                                            }
                                        })
                                    } else {
                                        let parent= winConfigForm[winActiveBlock.focusNow]["BLOCK_TYPE"][2]    
                                        blocks.forEach(function(blockId){
                                            if(winConfigForm[blockId]["BLOCK_TYPE"][2] != parent && blockId != parent){
                                            }else{
                                                searchData[blockId] = {}
                                                $$(blockId).clearAll()
                                                $$(blockId).clearValidation()
                                                searchData[blockId]['blockType'] = "datagrid"
                                                valueForm = webix.copy(winDataChanged[blockId][0])
                                                searchData[blockId]['data'] = [valueForm]
                                            }
                                        })
                                    }                                      
                                }else{
                                    $$(winActiveBlock.focusNow).clearAll()
                                    $$(winActiveBlock.focusNow).clearValidation()
                                    valueForm = webix.copy(winDataChanged[winActiveBlock.focusNow][0])
                                    searchData[winActiveBlock.focusNow] = {}
                                    searchData[winActiveBlock.focusNow]['blockType'] = "datagrid"
                                    searchData[winActiveBlock.focusNow]['data'] = [valueForm]
                                }
                            }
                            // let valueForm = $$(winActiveBlock.focusNow).getValues()
                            
                            for(let block in searchData){
                                if(winConfigForm[block]['BLOCK_TYPE'][0]=="FORM"){
                                    let idCheck = ""
                                    for(id in winCheckRadio){
                                        if(winConfigForm[block]["ELEMENT"].includes(winCheckRadio[id])){
                                            idCheck = winCheckRadio[id]
                                            if($$(winCheckRadio[id]).config.searchItem==false){
                                                delete searchData[block]["data"][0][idCheck]
                                            }
                                        }
                                    }
                                    if(winSubParent.length != 0){
                                        winSubParent.forEach(function(blockSubParent){
                                            for(id in winCheckRadio){
                                                if(winConfigForm[blockSubParent]["ELEMENT"].includes(winCheckRadio[id])){
                                                    idCheck = winCheckRadio[id]
                                                    if($$(winCheckRadio[id]).config.searchItem==false){
                                                        delete searchData[block]["data"][0][idCheck]
                                                    }
                                                }
                                            }
                                        })
                                    }
                                }else{
                                    let idCheck = ""
                                    for(id in winCheckRadio){   
                                        if(winConfigForm[block]["ELEMENT"].includes(winCheckRadio[id])){
                                            idCheck = winCheckRadio[id]
                                            if($$(block).getColumnConfig(winCheckRadio[id]).searchItem==false){
                                                delete searchData[block]["data"][0][idCheck]
                                            }
                                        }
                                    } 
                                } 
                            }
                            Object.keys(window.winPagerDatatable).forEach(function(idBlock){
                                window.winPagerDatatable[idBlock][0]=0
                            })
                            // //console.log(window.winPagerDatatable)
                            if(winConfigForm[winActiveBlock.focusNow]['BLOCK_TYPE'][1]=="PARENT"){
                                let param = formatParamAjax(searchData,"Search Data")
                                //console.log(7009, param)
                                winSearchParam = {status:true, param:param}
                                restapi.restApiSelect({'data':param})
                            }else if(winConfigForm[winActiveBlock.focusNow]['BLOCK_TYPE'][1]=="CHILD"){
                                if(winConfigForm[winActiveBlock['focusNow']]['REST_API']!=undefined){
                                    let param = winConfigForm[winActiveBlock['focusNow']]['REST_API']
                                    // param['OFFSET_NUMBER'] = window.winCountOffsetRecord[window.winActiveBlock['focusNow']]
                                    param['OFFSET_NUMBER'] = 0
                                    param['data'] = formatParamAjax(searchData,"Search Data")
                                    winSearchParam = {status:true, param:param}
                                    restapi.restApiParam(param)
                                }else{
                                    let param = {"BLOCK_NAME":winActiveBlock['focusNow'],"PARAM_ID":[]}
                                    // param['OFFSET_NUMBER'] = window.winCountOffsetRecord[window.winActiveBlock['focusNow']]
                                    param['OFFSET_NUMBER'] = 0
                                    param['data'] = formatParamAjax(searchData,"Search Data")
                                    winSearchParam = {status:true, param:param}
                                    restapi.restApiParam(param)
                                }
                            }else if(winConfigForm[winActiveBlock.focusNow]['BLOCK_TYPE'][1]=="SUB_CHILD"){
                                let parent = winConfigForm[winActiveBlock.focusNow]["BLOCK_TYPE"][2]  
                                if(winConfigForm[parent]['REST_API']!=undefined){
                                    let param = winConfigForm[parent]['REST_API']
                                    param['OFFSET_NUMBER'] = window.winCountOffsetRecord[window.parent]
                                    param['data'] = formatParamAjax(searchData,"Search Data")
                                    winSearchParam = {status:true, param:param}
                                    restapi.restApiParam(param)
                                }else{
                                    let param = {"BLOCK_NAME":parent,"PARAM_ID":[]}
                                    param['OFFSET_NUMBER'] = window.winCountOffsetRecord[parent]
                                    param['data'] = formatParamAjax(searchData,"Search Data")
                                    winSearchParam = {status:true, param:param}
                                    restapi.restApiParam(param)
                                }
                            }else if(winConfigForm[winActiveBlock.focusNow]['BLOCK_TYPE'][1]=="SUB_PARENT"){
                                let param = formatParamAjax(searchData,"Search Data")
                                // //console.log(7009, param)
                                winSearchParam = {status:true, param:param}
                                restapi.restApiSelect({'data':param})
                            }
                        }
                    }
                // }catch(err){
                //     $$(menuId).showProgress({type:"icon",hide:true});//loading
                //     $$(menuId).disable()//enable
                //     webix.message({
                //         text:"Error Detected, please capture this error and contact IT HO: <br><br>Error: JS - Element - SearchButton - "+err,
                //         type:"error", 
                //         expire: 10000,
                //     });
                //     //console.log("JS - Element - SearchButton - Error: ",err)
                // }
            }
        }

        let searchButton = this.NORMALBUTTON(id, "Search Mode", function(){}, extendOn)
        searchButton = Object.assign(searchButton,{"type":"image", "image":"https://hocdnoden0201.sat.co.id/img/searchBtn.png", "width": 60, "hotkey": 'ctrl+F',
        hidden:hideButton[id]})
        return searchButton   
    }

    ADDVALUEBUTTON(id,idBtnAddRow){
        let addBtn = this.NORMALBUTTON(id,"Add New Data",(function(){}),{})
        addBtn = Object.assign(addBtn,{"type":"image", "image":"https://hocdnoden0201.sat.co.id/img/addBtn.png", "width": 60, "hotkey": 'ctrl+alt+n',  "on":{
            onItemClick:function(){
                    try{
                        if (winConfigForm[winActiveBlock.focusNow]['TRANSACTION_BLOCK'] != undefined) {
                            if (winConfigForm[winActiveBlock.focusNow]['TRANSACTION_BLOCK']['INSERT'] == false) {
                                let nameTab = "ini"
                                if(winMultiviewBlocksVertical.includes(winActiveBlock.focusNow)){
                                    nameTab = findObjectById(winActiveBlock.focusNow,$$("listMultiviewVertical"+menuId).config.data).title
                                }else if(winMultiviewBlocks.includes(winActiveBlock.focusNow)){
                                    nameTab = findObjectById(winActiveBlock.focusNow,$$("tabbar"+menuId).config.options).value
                                }
                                return webix.alert(ALERT.ALERTWARNING(`Cannot add data in block ${nameTab}.`))
                            }
                        }
                        
                        if(window.openHTTPs != 0){
                            return webix.message({
                                        text:"Please wait, <br> Your document is being loaded.",
                                        type:"debug", 
                                        expire: 800,
                                    });
                        }
                        if(window.winOpenPopUp=="closed"){
                            winSearchParam = {status:false, param:{}}
                            let valuesData = {}
                            let blocks = Object.keys(winConfigForm)
                            let statusUpdateData = true
                            let isUpdateHidden = $$("updateValue").config.hidden
                            
                            
                            if(winSearchMode == false && !isUpdateHidden){
                               
                                blocks.forEach(function(block){
                                    if (winConfigForm[block]['BASE_TABLE'] == undefined){
                                        winConfigForm[block]['BASE_TABLE'] = true
                                    }
                                    if(winConfigForm[block]['BASE_TABLE']){
                                        if($$(block).config.view=="form"){
                                            let changedForm = {}
                                            let valuesForm = getBlockValue(block)
                                            winConfigForm[block]["PRIMARY_KEY"].forEach(function (item) {
                                                valuesForm[item] = getItemValue(item)
                                            });
                                            winConfigForm[block]["RELATION_KEY"].forEach(function (item) {
                                                valuesForm[item] = getItemValue(item)
                                            });

                                            let listIdChanged = []
                                            Object.keys(window.winDataCompare[block]["data"]).forEach(function(idItem){
                                                let itemWinDataCompare = window.winDataCompare[block]["data"][idItem]
												let itemDataNow = valuesForm[idItem]
                                                if (typeof(itemWinDataCompare) != 'number' && typeof(itemDataNow) != 'number') {
                                                    itemWinDataCompare = itemWinDataCompare.replace(/[\r]/g,'')
                                                    itemDataNow = itemDataNow.replace(/[\r]/g,'')
                                                }
                                                if(itemWinDataCompare!=itemDataNow){
                                                    if($$(idItem).config.jenis!="display"){
                                                        listIdChanged.push(idItem)
                                                    }
                                                }else{
                                                    delete valuesForm[idItem]
                                                }
                                                
                                            })
                                            let dataDelIdCompare = webix.copy(valuesForm) 
                                            Object.keys(dataDelIdCompare).forEach(function(idItem){
                                                if(!Object.keys(window.winDataCompare[block]["data"]).includes(idItem)){
                                                    delete valuesForm[idItem]
                                                }
                                            })
                                            changedForm[block] = {}
                                            changedForm[block]["datachanged"]=listIdChanged

                                            if(changedForm[block]["datachanged"].length!=0){
                                                winConfigForm[block]["PRIMARY_KEY"].forEach(function (item) {
                                                    valuesForm[item] = getItemValue(item)
                                                });
                                                winConfigForm[block]["RELATION_KEY"].forEach(function (item) {
                                                    valuesForm[item] = getItemValue(item)
                                                });
                                                valuesForm = [valuesForm]
                                            }else{
                                                valuesForm = []
                                            }
                                            valuesData[block] = {}
                                            valuesData[block]['blockType'] = "form"
                                            valuesData[block]['data'] = valuesForm
                                        }else if($$(block).config.view=="datatable"){
                                            valuesData[block] = {}
                                            valuesData[block]['blockType'] = "datagrid"
                                            valuesData[block]['data'] = webix.copy(winDataChanged[block])
                                        }
                                    }
                                        
                                })
                                statusUpdateData = false
                                Object.keys(valuesData).forEach(function(block){
                                    if(valuesData[block].data.length>0){
                                        statusUpdateData = true
                                    }
                                })
                            }

                            

                            if(statusUpdateData && winAddData == false && winSearchMode == false && !isUpdateHidden){
                                
                                let statusValidate = true;
                                let errorBlock = [];
                                blocks.every(function(block){
                                    if(!$$(block).validate()){
                                        statusValidate = false;
                                        errorBlock.push(block)
                                        return false
                                    }
                                    return true
                                })


                                if(errorBlock.length==0 && statusValidate==true){
                                    let updatedBlock = formatParamAjax(valuesData,"Update Data")
                                    updatedBlock = checkCompareBeforeAPI(updatedBlock)
                                    if(Object.keys(updatedBlock)!=0){
                                        let textAlert = ""
                                        let adaDataMaster = false
                                        let descTextAlert = ""
                                        let returnSetColumnUpdate = setColumnUpdateAlert(updatedBlock)
                                        adaDataMaster = returnSetColumnUpdate['adaDataMaster']
                                        textAlert = returnSetColumnUpdate['textAlert']
                                        descTextAlert = returnSetColumnUpdate['descTextAlert']

                                        if(adaDataMaster){
                                            webix.confirm({
                                                title: "Update Data before Insert Mode",
                                                text: descTextAlert+":<br><br>"+textAlert,
                                                type:"confirm-warning",
                                                width:300,
                                                ok:"Update",
                                            }).then(function(result){
                                                let resultUp = restapi.restApiSubmit({'type':'UPDATE','menuId':menuId,'data':updatedBlock},"Update Data")
                                                resultUp.then(function(respond){
                                                    if(respond.status){
                                                        $$("addValue").callEvent("onItemClick")    
                                                    }
                                                })
                                            })
                                        }else{
                                            let resultUp = restapi.restApiSubmit({'type':'UPDATE','menuId':menuId,'data':updatedBlock},"Update Data")
                                            resultUp.then(function(respond){
                                                if(respond.status){
                                                    $$("addValue").callEvent("onItemClick")    
                                                }
                                            })
                                        }
                                        
                                    }else{
                                        $$("addValue").callEvent("onItemClick")  
                                    }
                                }else{
                                    let idBlock = errorBlock[0]
                                    setFocusAfterValidate(idBlock)
                                }
                            }else{
                                blocks.forEach(function(id){
                                    if($$(id).config.view=="datatable"){
                                        if(winThereIsSubChild){
                                            if (!winDataDtSelect[id]){
                                                winDataDtSelect[id] = []
                                            }                                        
                                        }
                                        if(!hideButton[idBtnAddRow]){
                                            $$(idBtnAddRow).show()
                                        }
                                        $$(id).showColumn("action_"+id)
                                        // $$(id).define('width', $$(id).config.width +)
                                        // $$(id).adjustColumn("action_"+id,"header")
                                        // $$(id).refreshColumns()
                                        $$(id).refresh()
                                    }
                                })
                                if (isGridToGrid) {
                                    let flagSave = false;
                                    for(let blockname in window.winConfigForm){
                                        if (winConfigForm[blockname]['BLOCK_TYPE'][0] == 'DATAGRID') {
                                            if(winDataChanged[blockname].length != 0){
                                                flagSave = true;
                                            }
                                        }
                                    }
                                    if(flagSave == false){
                                        winFlagInsertBlock = window.winActiveBlock.focusNow
                                        if(statusMasterDetailGridToGrid.parent == winFlagInsertBlock && statusMasterDetailGridToGrid.child.length != 0){
                                            winFlagInsertChild.concat(statusMasterDetailGridToGrid.child)
                                        }else if(statusMasterDetailGridToGrid.child.includes(winFlagInsertBlock)&& statusMasterDetailGridToGrid.grandchild.length != 0){
                                            winFlagInsertChild.concat(statusMasterDetailGridToGrid.grandchild)
                                        }
                                    }
                                }else{
                                    winFlagInsertBlock = window.winActiveBlock.focusNow
                                }
                                
                                if(window.winAddData==false){
                                    if (window.winActiveBlock['focusNow']=="" && window.winJenisAddValue==""){
                                        window.winJenisAddValue = "PARENT"
                                        Object.keys(winConfigForm).forEach(function(idBlock){
                                            
                                            if(winConfigForm[idBlock]['BLOCK_TYPE'][0]=="FORM"){
                                                window.winDataCompare[idBlock]['data'] = {}
                                            }
                                        })
                                    }else if((winConfigForm[window.winActiveBlock['focusNow']]['BLOCK_TYPE'][1]=="PARENT" || winConfigForm[window.winActiveBlock['focusNow']]['BLOCK_TYPE'][1] == "SUB_PARENT") && window.winJenisAddValue==""){
                                        window.winJenisAddValue = "PARENT"
                                        Object.keys(winConfigForm).forEach(function(idBlock){
                                            
                                            if(winConfigForm[idBlock]['BLOCK_TYPE'][0]=="FORM"){
                                                window.winDataCompare[idBlock]['data'] = {}
                                            }
                                            if(winConfigForm[idBlock]['BLOCK_TYPE'][0]=="FORM" && (winConfigForm[idBlock]['BLOCK_TYPE'][1]=="CHILD" || winSubParent.includes(idBlock))){
                                                defineReadOnlyFalse(idBlock)
                                            }
                                        })
                                    }else if(winConfigForm[window.winActiveBlock['focusNow']]['BLOCK_TYPE'][1]=="CHILD" && window.winJenisAddValue==""){
                                        window.winJenisAddValue = "CHILD"
                                        
                                        Object.keys(winConfigForm).forEach(function(idBlock){
                                            if(winConfigForm[idBlock]['BLOCK_TYPE'][1]=="CHILD"){
                                                if(winConfigForm[idBlock]['BLOCK_TYPE'][0]=="FORM" && window.winActiveBlock['focusNow']==idBlock){
                                                    window.winDataCompare[idBlock]['data'] = {}
                                                    defineReadOnlyFalse(idBlock)
                                                }
                                            }
                                        })
                                    }else if(winConfigForm[window.winActiveBlock['focusNow']]['BLOCK_TYPE'][1]=="GRANDCHILD" && window.winJenisAddValue==""){
                                        window.winJenisAddValue = "GRANDCHILD"
                                    }

                                    if(isGridToGrid){
                                        if(winActiveBlock.focusNow == statusMasterDetailGridToGrid.parent){
                                            if(statusMasterDetailGridToGrid.child.length != 0){
                                                statusMasterDetailGridToGrid.child.forEach(blockChildName => {
                                                    $$(blockChildName).clearAll();
                                                });
                                            }
                                            if(statusMasterDetailGridToGrid.grandchild.length != 0){
                                                statusMasterDetailGridToGrid.grandchild.forEach(blockGrandchildName => {
                                                    $$(blockGrandchildName).clearAll();
                                                    $$(blockGrandchildName).disable();
                                                });
                                            }
                                        }else if(statusMasterDetailGridToGrid.child.includes(winActiveBlock.focusNow)){
                                            if(statusMasterDetailGridToGrid.grandchild.length != 0){
                                                statusMasterDetailGridToGrid.grandchild.forEach(blockGrandchildName => {
                                                    $$(blockGrandchildName).clearAll();
                                                });
                                            }
                                        }
                                    }

                                    Object.keys(winDataChanged).forEach(function(idBlock){
                                        winDataChanged[idBlock] = []
                                    })
                                    window.winCheckRadio.forEach(function(item){
                                        if($$(item)!=undefined){
                                            if(window.winConfigForm[window.winActiveBlock['focusNow']]['ELEMENT'].includes(item)){
                                                $$(item).setValue($$(item).config.uncheckValue)
                                            }
                                        }
                                    })
                                    window.winButtonCallForm.forEach(function(item){
                                        if($$(item)!=undefined){
                                            $$(item).define('disabled',true)
                                        }
                                    })

                                    $$("addValue").config.value = "Save"
                                    $$("addValue").config.image = "https://hocdnoden0201.sat.co.id/img/saveBtn.png"
                                    $$("addValue").define('css', "webix_custom_button")
                                    $$("addValue").refresh()
                                    $$("searchValue").$view.classList.remove("webix_custom_button")
                                    $$("searchValue").refresh()
                                    winValidatePromise = {}
                                    this.config.value="Save"
                                    this.config.image="https://hocdnoden0201.sat.co.id/img/saveBtn.png"
                                    this.define('hotkey','ctrl+alt+s')
                                    this.refresh()
                                    webix.message({text:"Add New Data Mode",expire: 2000});
                                    
                                    for(let i=0; i < window.winListIdBtn.length; i++){
                                        if(i==2 || i==3 || i==4 || i==6){
                                            continue
                                        }
                                        $$(window.winListIdBtn[i]).define("disabled",true)
                                    }
                                    
                                    if($$(window.winActiveBlock['focusNow']).config.view=="form"){
                                        winConfigForm[window.winActiveBlock['focusNow']]['ELEMENT'].forEach(function(id){
                                            if (!winDisplayItem.includes(id)){
                                                if($$(id)!=undefined){
                                                    $$(id).enable()
                                                }
                                            }
                                        })
                                        if(blocks.length==1){
                                            winOpenValidation = false
                                            if($$(blocks[0]).config.view=="form"){
                                                $$(blocks[0]).clear()
                                                $$(blocks[0]).clearValidation()
                                                console.log("MASUKK")
                                                //URL WHEN NEW FORM
                                                restapi.restApiNewForm(window.winActiveBlock['focusNow']).then(function(respond){
                                                    let newFormInstance = webix.copy(winConfigForm[window.winActiveBlock['focusNow']]['WHEN_NEW_FORM'])
                                                    for (var key in newFormInstance){
                                                        if(typeof(newFormInstance[key])=='function'){
                                                            $$(key).setValue(newFormInstance[key](key))
                                                        }else{
                                                            $$(key).setValue(newFormInstance[key])
                                                        }
                                                    }
                                                    Object.keys(winConfigForm[window.winActiveBlock['focusNow']]['WHEN_NEW_FORM']).forEach(function(key){
                                                        if(winConfigForm[window.winActiveBlock['focusNow']]["PRIMARY_KEY"].includes(key)){
                                                            $$(key).disable()
                                                        }
                                                    })
                                                })
                                                // webix.UIManager.setFocus($$(winConfigForm[blocks[0]]["ELEMENT"][0]));
                                            }else if ($$(blocks[0]).config.view=="datatable"){
                                                winPopUpUploaderDt.forEach(function(idWd){
                                                    $$(idWd).close()
            
                                                    let index = winPopUpUploaderDt.indexOf(idWd)
                                                    winPopUpUploaderDt.splice(index, 1);
                                                })
                                                $$(blocks[0]).clearAll()
                                                $$(blocks[0]).clearValidation()
                                                webix.UIManager.setFocus($$(blocks[0]));
                                                //URL WHEN NEW FORM
                                                hideOverlay(blocks[0])
                                                restapi.restApiNewForm(window.winActiveBlock['focusNow']).then(function(respond){
                                                    let newFormInstance = webix.copy(winConfigForm[window.winActiveBlock['focusNow']]['WHEN_NEW_FORM'])
                                                    for (var key in newFormInstance){
                                                        if(typeof(newFormInstance[key])=='function'){
                                                            newFormInstance[key] = newFormInstance[key](key)
                                                        }else{
                                                            newFormInstance[key] = newFormInstance[key]
                                                        }
                                                    }
                                                    let dataNew = webix.copy(newFormInstance)
                                                    Object.keys(dataNew).forEach(function(id){
                                                        if(typeof(dataNew[id])=='function'){
                                                            dataNew[id] = dataNew[id]()
                                                        }
                                                    })
                                                    $$(blocks[0]).add(dataNew,$$("pager_"+blocks[0])['data']['old_count'])
                                                    $$(blocks[0]).setPage($$("pager_"+blocks[0])['data']['limit']);
                                                    if($$(blocks[0]).config.customOperator!=undefined){
                                                        let additionalCustomOperator = webix.copy($$(blocks[0]).config.customOperator)
                                                        additionalCustomOperator["RESET_DATA"] = true
                                                        //updateOperatorCustomDt(additionalCustomOperator);
                                                        updateFooterDatagrid(blocks[0])
                                                    }
                                                    let row_id = $$(blocks[0]).getLastId();
                                                    $$(blocks[0]).select(row_id,$$(blocks[0])['config']['columns'][0]['id'], false)
                                                })
                                            }
                                        }else if(blocks.length>1){
                                            winOpenValidation = false
                                            for(let i=0;i<blocks.length;i++){
                                                if($$(blocks[i]).config.view=="form"){
                                                    if(blocks[i]==winActiveBlock.focusNow){
                                                        $$(blocks[i]).clear()
                                                        $$(blocks[i]).clearValidation()
                                                        //URL WHEN NEW FORM
                                                        if(winSubParent.length != 0){
                                                            if(winSubParent.includes(blocks[i]) || getBlockParent()==blocks[i]){
                                                                restapi.restApiNewForm(getBlockParent()).then(function(respond){
                                                                    let newFormInstance = webix.copy(winConfigForm[getBlockParent()]['WHEN_NEW_FORM'])
                                                                    for (var key in newFormInstance){
                                                                        if(typeof(newFormInstance[key])=='function'){
                                                                            $$(key).setValue(newFormInstance[key](key))
                                                                        }else{
                                                                            $$(key).setValue(newFormInstance[key])
                                                                        }
                                                                    }
                                                                    Object.keys(winConfigForm[getBlockParent()]['WHEN_NEW_FORM']).forEach(function(key){
                                                                        if(winConfigForm[getBlockParent()]["PRIMARY_KEY"].includes(key)){
                                                                                $$(key).disable()
                                                                            
                                                                        }
                                                                    })
                                                                })
                                                                winSubParent.forEach(function(block){
                                                                    $$(block).clear()
                                                                    $$(block).clearValidation()
                                                                    let newFormInstance = webix.copy(winConfigForm[block]['WHEN_NEW_FORM'])
                                                                    for (var key in newFormInstance){
                                                                        if(typeof(newFormInstance[key])=='function'){
                                                                            $$(key).setValue(newFormInstance[key](key))
                                                                        }else{
                                                                            $$(key).setValue(newFormInstance[key])
                                                                        }
                                                                    }
                                                                    Object.keys(winConfigForm[block]['WHEN_NEW_FORM']).forEach(function(key){
                                                                        if(winConfigForm[block]["PRIMARY_KEY"].includes(key)){
                                                                                $$(key).disable()
                                                                        }
                                                                    })
                                                                })
                                                            }else{
                                                                restapi.restApiNewForm(window.winActiveBlock['focusNow']).then(function(respond){
                                                                    let newFormInstance = webix.copy(winConfigForm[window.winActiveBlock['focusNow']]['WHEN_NEW_FORM'])
                                                                    for (var key in newFormInstance){
                                                                        if(typeof(newFormInstance[key])=='function'){
                                                                            $$(key).setValue(newFormInstance[key](key))
                                                                        }else{
                                                                            $$(key).setValue(newFormInstance[key])
                                                                        }
                                                                    }
                                                                    Object.keys(winConfigForm[window.winActiveBlock['focusNow']]['WHEN_NEW_FORM']).forEach(function(key){
                                                                        if(winConfigForm[window.winActiveBlock['focusNow']]["PRIMARY_KEY"].includes(key)){
                                                                            $$(key).disable()
                                                                        }
                                                                    })
                                                                })
                                                            }
                                                        }else{
                                                            restapi.restApiNewForm(window.winActiveBlock['focusNow']).then(function(respond){
                                                                let newFormInstance = webix.copy(winConfigForm[window.winActiveBlock['focusNow']]['WHEN_NEW_FORM'])
                                                                for (var key in newFormInstance){
                                                                    if(typeof(newFormInstance[key])=='function'){
                                                                        $$(key).setValue(newFormInstance[key](key))
                                                                    }else{
                                                                        $$(key).setValue(newFormInstance[key])
                                                                    }
                                                                }
                                                                Object.keys(winConfigForm[window.winActiveBlock['focusNow']]['WHEN_NEW_FORM']).forEach(function(key){
                                                                    if(winConfigForm[window.winActiveBlock['focusNow']]["PRIMARY_KEY"].includes(key)){
                                                                            $$(key).disable()
                                                                        
                                                                    }
                                                                })
                                                            })
                                                        }
                                                    }else{
                                                        if(winConfigForm[blocks[i]]['BLOCK_TYPE'][1]=="PARENT" || winConfigForm[blocks[i]]['BLOCK_TYPE'][1]=="SUB_PARENT"){
                                                            if(winSubParent.length != 0 && winJenisAddValue == "PARENT" && !winSubParent.includes(blocks[i])){
                                                                $$(blocks[i]).clear()
                                                                $$(blocks[i]).clearValidation()
                                                                $$(blocks[i]).enable()
                                                            }else{
                                                                if(!winSubParent.includes(blocks[i])){
                                                                    $$(blocks[i]).disable()
                                                                }
                                                            }
                                                        }else{
                                                            restapi.restApiNewForm(blocks[i]).then(function(respond){
                                                                let newFormInstance = webix.copy(winConfigForm[blocks[i]]['WHEN_NEW_FORM'])
                                                                for (var key in newFormInstance){
                                                                    if(typeof(newFormInstance[key])=='function'){
                                                                        $$(key).setValue(newFormInstance[key](key))
                                                                    }else{
                                                                        $$(key).setValue(newFormInstance[key])
                                                                    }
                                                                }
                                                                Object.keys(winConfigForm[blocks[i]]['WHEN_NEW_FORM']).forEach(function(key){
                                                                    if(winConfigForm[blocks[i]]["PRIMARY_KEY"].includes(key)){
                                                                            $$(key).disable()
                                                                        
                                                                    }
                                                                })
                                                            })
                                                            $$(blocks[i]).clear()
                                                            $$(blocks[i]).clearValidation()
                                                            $$(blocks[i]).enable()
                                                        }
                                                    }
                                                }else if ($$(blocks[i]).config.view=="datatable" && winJenisAddValue == "PARENT"){
                                                    $$(blocks[i]).enable()
                                                    winPopUpUploaderDt.forEach(function(idWd){
                                                        $$(idWd).close()
                
                                                        let index = winPopUpUploaderDt.indexOf(idWd)
                                                        winPopUpUploaderDt.splice(index, 1);
                                                    })
                                                    $$(blocks[i]).clearAll()
                                                    if(winConfigForm[blocks[i]]['BLOCK_TYPE'][0]=="DATAGRID" && winConfigForm[blocks[i]]['BLOCK_TYPE'][1]=="CHILD"){
                                                        let verticalMulti = $$("listMultiviewVertical"+menuId) || false
                                                        let horizontalMulti = $$('tabbar'+menuId) || false
                                                        if(verticalMulti!=false){
                                                            verticalMulti = verticalMulti.config.prevFocusList 
                                                            verticalMulti = verticalMulti == blocks[i]
                                                        }
                                                        if(horizontalMulti!=false){
                                                            horizontalMulti = horizontalMulti.config.value
                                                            horizontalMulti = horizontalMulti == blocks[i]
                                                        }
                                                        if(winConfigForm[blocks[i]]['WHEN_NEW_FORM']!=undefined){
                                                            restapi.restApiNewForm(blocks[i]).then(function(respond){
                                                                if(i==1 || horizontalMulti ||  verticalMulti){
                                                                    let newFormInstance = webix.copy(winConfigForm[blocks[i]]['WHEN_NEW_FORM'])
                                                                    for (var key in newFormInstance){
                                                                        if(typeof(newFormInstance[key])=='function'){
                                                                            newFormInstance[key] = newFormInstance[key](key)
                                                                        }else{
                                                                            newFormInstance[key] = newFormInstance[key]
                                                                        }
                                                                    }
                                                                    let dataNew = webix.copy(newFormInstance)
                                                                    Object.keys(dataNew).forEach(function(id){
                                                                        if(typeof(dataNew[id])=='function'){
                                                                            dataNew[id] = dataNew[id]()
                                                                        }
                                                                    })
                                                                    $$(blocks[i]).add(dataNew,$$("pager_"+blocks[i])['data']['old_count'])
                                                                    $$(blocks[i]).setPage($$("pager_"+blocks[i])['data']['limit']);
                                                                }
                                                            })
                                                        }else{
                                                            let dataNew = {}
                                                            $$(blocks[i]).add(dataNew,$$("pager_"+blocks[i])['data']['old_count'])
                                                            $$(blocks[i]).setPage($$("pager_"+blocks[i])['data']['limit']);
                                                        }

                                                    }else if(winConfigForm[blocks[i]]['BLOCK_TYPE'][1] == "SUB_CHILD"){
                                                        let verticalMulti = $$("listMultiviewVertical" + menuId) || false
                                                        let horizontalMulti = $$('tabbar' + menuId) || false
                                                        
                                                        if (horizontalMulti || verticalMulti) {
                                                            let newFormInstance = webix.copy(winConfigForm[blocks[i]]['WHEN_NEW_FORM'])
                                                            for (var key in newFormInstance) {
                                                                if (typeof (newFormInstance[key]) == 'function') {
                                                                    newFormInstance[key] = newFormInstance[key](key)
                                                                } else {
                                                                    newFormInstance[key] = newFormInstance[key]
                                                                }
                                                            }
                                                            let dataNew = webix.copy(newFormInstance)
                                                            Object.keys(dataNew).forEach(function (id) {
                                                                if (typeof (dataNew[id]) == 'function') {
                                                                    dataNew[id] = dataNew[id]()
                                                                }
                                                            })
                                                            $$(blocks[i]).add(dataNew, $$("pager_" + blocks[i])['data']['old_count'])
                                                            // ^ SET NEW FORM   

                                                            $$(blocks[i]).setPage($$("pager_" + blocks[i])['data']['limit']);
                                                        }
                                                    }
                                                    $$(blocks[i]).clearValidation()
                                                    hideOverlay(blocks[i])
                                                    if($$(blocks[i]).config.customOperator!=undefined){
                                                        let additionalCustomOperator = webix.copy($$(blocks[i]).config.customOperator)
                                                        additionalCustomOperator["RESET_DATA"] = true
                                                        //updateOperatorCustomDt(additionalCustomOperator);
                                                        updateFooterDatagrid(blocks[i])
                                                    }
                                                }
                                            }
                                        }
                                        winOpenValidation = true
                                        Object.keys(winConfigForm[window.winActiveBlock['focusNow']]['WHEN_NEW_FORM']).forEach(function(key){
                                            if(winConfigForm[window.winActiveBlock['focusNow']]["PRIMARY_KEY"].includes(key)){
                                                $$(key).disable()

                                            }
                                        })
                                        // webix.UIManager.setFocus($$(winConfigForm[blocks[0]]["ELEMENT"][0]));
                                    }else if($$(window.winActiveBlock['focusNow']).config.view=="datatable" ){
                                        if (isGridToGrid) {
                                            winOpenValidation = true
                                            haveRowAdded = true
                                            let blocksInsert = []
                                            blocks.forEach(function(block){
                                                if(block!=window.winActiveBlock['focusNow']){
                                                    if($$(block).config.view == "form"){
                                                        Object.keys($$(block).elements).forEach(function(id){
                                                            if($$(id).config.view!="button"){
                                                                $$(id).disable()
                                                            }
                                                        })
                                                    }
                                                }
                                                if (winJenisAddValue == 'PARENT') {
                                                    if (winConfigForm[block]['BLOCK_TYPE'][1] == 'CHILD' || block == window.winActiveBlock['focusNow']) {
                                                        blocksInsert.push(block)
                                                    }
                                                }else if(winJenisAddValue == 'CHILD'){
                                                    if (winConfigForm[block]['BLOCK_TYPE'][1] == 'GRANDCHILD' || block == window.winActiveBlock['focusNow']) {
                                                        blocksInsert.push(block)
                                                    }
                                                }else if(winJenisAddValue == 'GRANDCHILD'){
                                                    if (blocksInsert.length == 0) {
                                                        blocksInsert.push(window.winActiveBlock['focusNow'])
                                                    }
                                                }
                                            })
                                            blocksInsert.forEach(function (blockInsert) {
                                                hideOverlay(blockInsert);
                                                $$(blockInsert).enable();
                                                restapi.restApiNewForm(blockInsert).then(function(respond){
                                                    if ($$(winActiveBlock['focusNow']).config.customOperator != undefined) {
                                                        if ($$(winActiveBlock['focusNow']).count() == 0) {
                                                            let additionalCustomOperator = webix.copy($$(winActiveBlock['focusNow']).config.customOperator)
                                                            additionalCustomOperator["RESET_DATA"] = true
                                                            //updateOperatorCustomDt(additionalCustomOperator);
                                                            updateFooterDatagrid(winActiveBlock['focusNow'])
                                                        }
                                                    }
                                                    let newFormInstance = webix.copy(winConfigForm[blockInsert]['WHEN_NEW_FORM'])
                                                    for (var key in newFormInstance){
                                                        if(typeof(newFormInstance[key])=='function'){
                                                            newFormInstance[key] = newFormInstance[key](key)
                                                        }else{
                                                            newFormInstance[key] = newFormInstance[key]
                                                        }
                                                    }
                                                    let dataNew = webix.copy(newFormInstance)
                                                    Object.keys(dataNew).forEach(function(id){
                                                        if(typeof(dataNew[id])=='function'){
                                                            dataNew[id] = dataNew[id]()
                                                        }
                                                    })
                                                    //console.log(10162,blockInsert);
                                                    $$(blockInsert).add(dataNew,$$("pager_"+blockInsert)['data']['old_count'])
                                                    $$(blockInsert).setPage($$("pager_"+blockInsert)['data']['limit']);
                                                    let row_id = $$(blockInsert).getLastId();
                                                    $$(blockInsert).addRowCss(row_id, "highlight-focus-row")
                                                    $$(winActiveBlock['focusNow']).clearValidation();
                                                    // $$(blockInsert).editCell(row_id,$$(blockInsert)['config']['columns'][0]['id']);
                                                    let view = $$(winFlagInsertBlock)
                                                    let pos = view.getSelectedId();
                                                    window.winActiveCell = {"pos":pos, "view":view}
                                                    //console.log("ADDVALUEBTN",winActiveCell);
                                                    $$(winFlagInsertBlock).select($$(winFlagInsertBlock).getLastId(),$$(winFlagInsertBlock)['config']['columns'][0]['id'], false)
                                                    
                                                    Object.keys(winConfigForm[blockInsert]['WHEN_NEW_FORM']).forEach(function(key){
                                                        if(winConfigForm[blockInsert]["PRIMARY_KEY"].includes(key)){
                                                                let columns = $$(blockInsert).config.columns
                                                                columns.forEach(function(colObj){
                                                                    if(colObj.id==key){
                                                                        colObj.editor = undefined
                                                                    }
                                                                })
                                                            
                                                        }
                                                    })
                                                })
                                            })
                                            
                                        }else{
                                            winOpenValidation = true
                                            blocks.forEach(function(block){
                                                if(block!=window.winActiveBlock['focusNow']){
                                                    if($$(block).config.view == "form"){
                                                        Object.keys($$(block).elements).forEach(function(id){
                                                            if($$(id).config.view!="button"){
                                                                $$(id).disable()
                                                            }
                                                        })
                                                    }
                                                }
                                            })
                                            if (winThereIsSubChild) {
                                                let ChildParent = ''
                                                Object.keys(winConfigForm).every(function (blockId) {
                                                    if (winConfigForm[blockId]['BLOCK_TYPE'][1] == "SUB_CHILD") {
                                                        if (winConfigForm[blockId]['BLOCK_TYPE'][2] == winActiveBlock['focusNow']) {
                                                            ChildParent = winActiveBlock['focusNow']
                                                            return false
                                                        } else {
                                                            ChildParent = winConfigForm[winActiveBlock['focusNow']]['BLOCK_TYPE'][2]
                                                            return false
                                                        }
                                                    }
                                                    return true
                                                })
                                                if(ChildParent!=undefined){
                                                    restapi.restApiNewForm(ChildParent).then(function(){
                                                        Object.keys(winConfigForm).forEach(function (blockId) {
                                                            if (winConfigForm[blockId]['BLOCK_TYPE'][1] == "SUB_CHILD") {
                                                                if (winConfigForm[blockId]['BLOCK_TYPE'][2] == ChildParent) {
                                                                    hideOverlay(blockId);
                                                                    // restapi.restApiNewForm(blockId)
                                                                    if ($$(blockId).config.customOperator != undefined) {
                                                                        if ($$(blockId).count() == 0) {
                                                                            let additionalCustomOperator = webix.copy($$(blockId).config.customOperator)
                                                                            additionalCustomOperator["RESET_DATA"] = true
                                                                            //updateOperatorCustomDt(additionalCustomOperator);
                                                                            updateFooterDatagrid(blockId)
                                                                        }
                                                                    }
            
                                                                    let newFormInstance = webix.copy(winConfigForm[blockId]['WHEN_NEW_FORM'])
                                                                    for (var key in newFormInstance) {
                                                                        if (typeof (newFormInstance[key]) == 'function') {
                                                                            newFormInstance[key] = newFormInstance[key](key)
                                                                        } else {
                                                                            newFormInstance[key] = newFormInstance[key]
                                                                        }
                                                                    }
                                                                    let dataNew = webix.copy(newFormInstance)
                                                                    Object.keys(dataNew).forEach(function (id) {
                                                                        if (typeof (dataNew[id]) == 'function') {
                                                                            dataNew[id] = dataNew[id]()
                                                                        }
                                                                    })
                                                                    $$(blockId).add(dataNew, $$("pager_" + blockId)['data']['old_count'])
                                                                    $$(blockId).setPage($$("pager_" + blockId)['data']['limit']);
                                                                    $$(blockId).clearValidation();
                                                                    Object.keys(winConfigForm[blockId]['WHEN_NEW_FORM']).forEach(function (key) {
                                                                        if (winConfigForm[blockId]["PRIMARY_KEY"].includes(key)) {
                                                                            let columns = $$(blockId).config.columns
                                                                            columns.forEach(function (colObj) {
                                                                                if (colObj.id == key) {
                                                                                    colObj.editor = undefined
                                                                                }
                                                                            })
            
                                                                        }
                                                                    })
                                                                }
                                                            }
                                                        })
                                                        hideOverlay(ChildParent)
                                                        if ($$(winActiveBlock['focusNow']).config.customOperator != undefined) {
                                                            if ($$(winActiveBlock['focusNow']).count() == 0) {
                                                                let additionalCustomOperator = webix.copy($$(winActiveBlock['focusNow']).config.customOperator)
                                                                additionalCustomOperator["RESET_DATA"] = true
                                                                //updateOperatorCustomDt(additionalCustomOperator);
                                                                updateFooterDatagrid(winActiveBlock['focusNow'])
                                                            }
                                                        }
            
                                                        let newFormInstance = webix.copy(winConfigForm[ChildParent]['WHEN_NEW_FORM'])
                                                        for (var key in newFormInstance) {
                                                            if (typeof (newFormInstance[key]) == 'function') {
                                                                newFormInstance[key] = newFormInstance[key](key)
                                                            } else {
                                                                newFormInstance[key] = newFormInstance[key]
                                                            }
                                                        }
                                                        let dataNew = webix.copy(newFormInstance)
                                                        Object.keys(dataNew).forEach(function (id) {
                                                            if (typeof (dataNew[id]) == 'function') {
                                                                dataNew[id] = dataNew[id]()
                                                            }
                                                        })
                                                        $$(ChildParent).add(dataNew, $$("pager_" + ChildParent)['data']['old_count'])
                                                        $$(ChildParent).setPage($$("pager_" + ChildParent)['data']['limit']);
                                                        let row_id = $$(ChildParent).getLastId();
                                                        $$(winActiveBlock['focusNow']).clearValidation();
                                                        Object.keys(winConfigForm[ChildParent]['WHEN_NEW_FORM']).forEach(function (key) {
                                                            if (winConfigForm[ChildParent]["PRIMARY_KEY"].includes(key)) {
                                                                let columns = $$(ChildParent).config.columns
                                                                columns.forEach(function (colObj) {
                                                                    if (colObj.id == key) {
                                                                        colObj.editor = undefined
                                                                    }
                                                                })
            
                                                            }
                                                        })
                                                        $$(window.winActiveBlock['focusNow']).select($$(window.winActiveBlock['focusNow']).getLastId(), $$(window.winActiveBlock['focusNow'])['config']['columns'][0]['id'], false)
                                                        let view = $$(window.winActiveBlock['focusNow'])
                                                        let pos = view.getSelectedId();
                                                        window.winActiveCell = { "pos": pos, "view": view }
                                                    })
                                                }else{
                                                    hideOverlay(window.winActiveBlock['focusNow'])
                                                    restapi.restApiNewForm(window.winActiveBlock['focusNow']).then(function(){
                                                        if ($$(winActiveBlock['focusNow']).config.customOperator != undefined) {
                                                            if ($$(winActiveBlock['focusNow']).count() == 0) {
                                                                let additionalCustomOperator = webix.copy($$(winActiveBlock['focusNow']).config.customOperator)
                                                                additionalCustomOperator["RESET_DATA"] = true
                                                                //updateOperatorCustomDt(additionalCustomOperator);
                                                                updateFooterDatagrid(winActiveBlock['focusNow'])
                                                            }
                                                        }
                
                                                        let newFormInstance = webix.copy(winConfigForm[window.winActiveBlock['focusNow']]['WHEN_NEW_FORM'])
                                                        for (var key in newFormInstance){
                                                            if(typeof(newFormInstance[key])=='function'){
                                                                newFormInstance[key] = newFormInstance[key](key)
                                                            }else{
                                                                newFormInstance[key] = newFormInstance[key]
                                                            }
                                                        }
                                                        let dataNew = webix.copy(newFormInstance)
                                                        Object.keys(dataNew).forEach(function(id){
                                                            if(typeof(dataNew[id])=='function'){
                                                                dataNew[id] = dataNew[id]()
                                                            }
                                                        })
                                                        $$(window.winActiveBlock['focusNow']).add(dataNew,$$("pager_"+window.winActiveBlock['focusNow'])['data']['old_count'])
                                                        $$(window.winActiveBlock['focusNow']).setPage($$("pager_"+window.winActiveBlock['focusNow'])['data']['limit']);
                                                        let row_id = $$(window.winActiveBlock['focusNow']).getLastId();
                                                        $$(winActiveBlock['focusNow']).clearValidation();
                                                        $$(window.winActiveBlock['focusNow']).select(row_id,$$(window.winActiveBlock['focusNow'])['config']['columns'][0]['id'], false)
                                                        // $$(window.winActiveBlock['focusNow']).editCell(row_id,$$(window.winActiveBlock['focusNow'])['config']['columns'][0]['id']);
                                                        let view = $$(window.winActiveBlock['focusNow'])
                                                        let pos = view.getSelectedId();
                                                        window.winActiveCell = {"pos":pos, "view":view}
                                                        Object.keys(winConfigForm[window.winActiveBlock['focusNow']]['WHEN_NEW_FORM']).forEach(function(key){
                                                            if(winConfigForm[window.winActiveBlock['focusNow']]["PRIMARY_KEY"].includes(key)){
                                                                    let columns = $$(window.winActiveBlock['focusNow']).config.columns
                                                                    columns.forEach(function(colObj){
                                                                        if(colObj.id==key){
                                                                            colObj.editor = undefined
                                                                        }
                                                                    })
                                                                
                                                            }
                                                        })
                                                    })
                                                }
                                            } else {
                                                hideOverlay(window.winActiveBlock['focusNow'])
                                                restapi.restApiNewForm(window.winActiveBlock['focusNow']).then(function(respond){
                                                    //console.log(" ==== REST API NEW FORM ====",window.winActiveBlock['focusNow']);
                                                    
                                                    if ($$(winActiveBlock['focusNow']).config.customOperator != undefined) {
                                                        if ($$(winActiveBlock['focusNow']).count() == 0) {
                                                            let additionalCustomOperator = webix.copy($$(winActiveBlock['focusNow']).config.customOperator)
                                                            additionalCustomOperator["RESET_DATA"] = true
                                                            //updateOperatorCustomDt(additionalCustomOperator);
                                                            updateFooterDatagrid(winActiveBlock['focusNow'])
                                                        }
                                                    }
            
                                                    let newFormInstance = webix.copy(winConfigForm[window.winActiveBlock['focusNow']]['WHEN_NEW_FORM'])
                                                    for (var key in newFormInstance){
                                                        if(typeof(newFormInstance[key])=='function'){
                                                            newFormInstance[key] = newFormInstance[key](key)
                                                        }else{
                                                            newFormInstance[key] = newFormInstance[key]
                                                        }
                                                    }
                                                    let dataNew = webix.copy(newFormInstance)
                                                    Object.keys(dataNew).forEach(function(id){
                                                        if(typeof(dataNew[id])=='function'){
                                                            dataNew[id] = dataNew[id]()
                                                        }
                                                    })
                                                    $$(window.winActiveBlock['focusNow']).add(dataNew,$$("pager_"+window.winActiveBlock['focusNow'])['data']['old_count'])
                                                    $$(window.winActiveBlock['focusNow']).setPage($$("pager_"+window.winActiveBlock['focusNow'])['data']['limit']);
                                                    let row_id = $$(window.winActiveBlock['focusNow']).getLastId();
                                                    $$(winActiveBlock['focusNow']).clearValidation();
                                                    $$(window.winActiveBlock['focusNow']).select(row_id,$$(window.winActiveBlock['focusNow'])['config']['columns'][0]['id'], false)
                                                    // $$(window.winActiveBlock['focusNow']).editCell(row_id,$$(window.winActiveBlock['focusNow'])['config']['columns'][0]['id']);
                                                    let view = $$(window.winActiveBlock['focusNow'])
                                                    let pos = view.getSelectedId();
                                                    window.winActiveCell = {"pos":pos, "view":view}
                                                    Object.keys(winConfigForm[window.winActiveBlock['focusNow']]['WHEN_NEW_FORM']).forEach(function(key){
                                                        if(winConfigForm[window.winActiveBlock['focusNow']]["PRIMARY_KEY"].includes(key)){
                                                                let columns = $$(window.winActiveBlock['focusNow']).config.columns
                                                                columns.forEach(function(colObj){
                                                                    if(colObj.id==key){
                                                                        colObj.editor = undefined
                                                                    }
                                                                })
                                                            
                                                        }
                                                    })
                                                })
                                            }
                                        }

                                    }

                                    let indexObj = blocks.indexOf(winActiveBlock.focusNow)
                                    for(let a=0; a<=indexObj; a++){
                                        if(winConfigForm[blocks[a]]["BLOCK_TYPE"][0]=="FORM"){
                                            winConfigForm[blocks[a]]["PRIMARY_KEY"].forEach(function (item) {
                                                if(!$$(item).config.displayItem){
                                                    $$(item).define("disabled",false)
                                                    $$(item).define("readonly",false)
                                                    $$(item).refresh()
                                                }
                                            });
                                        }
                                    }
                                    winImageElement.forEach(function (obj) {
                                        $$(obj['idTemplate']).setHTML('<img src="static/fotoprofil.jpeg" width="180px" height="200px" class="content" ondragstart="return false"/>')
                                    })
                                    winOpenValidation = true
                                    window.winAddData=true
                                    // $$("searchValue").config.value="Search Mode"
                                    $$("searchValue").refresh()
                                    $$("prev").define('disabled',true)
                                    $$("next").define('disabled',true)
                                    $$("searchValue").define('disabled',false)
                                    $$("updateValue").define('disabled',true)
                                    $$("deleteValue").define('disabled',false)
                                    if(winSubParent.includes(winActiveBlock.focusNow)){
                                        webix.UIManager.setFocus($$(getBlockParent()));
                                    }else{
                                        webix.UIManager.setFocus($$(winActiveBlock['focusNow']));
                                    }
                                    window.winSearchMode=false;
                                    winAddRecord = false
                                    if(winConfigForm[winActiveBlock.focusNow]["BLOCK_TYPE"][1]=="PARENT" || winConfigForm[winActiveBlock.focusNow]["BLOCK_TYPE"][1]=="SUB_PARENT"){
                                        insertType = "master"
                                    }else{
                                        insertType = "detail"
                                    }
                                    
                                }else if(window.winAddData==true){
                                    let statusValidate = true;
                                    let errorBlock = [];
                                    blocks.every(function(block){
                                        if(!$$(block).validate()){
                                            statusValidate = false;
                                            errorBlock.push(block)
                                            return false
                                        }
                                        return true
                                    })
                                    if(errorBlock.length==0 && statusValidate==true){
                                        let valuesData = {}
                                        blocks.forEach(function(block){
                                            if (winConfigForm[block]['BASE_TABLE'] == undefined){
                                                winConfigForm[block]['BASE_TABLE'] = true
                                            }
                                            if(winConfigForm[block]['BASE_TABLE']){
                                                if($$(block).config.view=="form"){
                                                    let valuesForm = ""
                                                    if(blocks.length==1){
                                                        valuesForm = getBlockValue(block)
                                                    }else if(blocks.length>1){
                                                        if(window.winJenisAddValue=="PARENT"){
                                                            valuesForm = getBlockValue(block)
                                                        }else if(window.winJenisAddValue=="CHILD"){
                                                            // if(block==winActiveBlock.focusNow){
                                                                valuesForm = getBlockValue(block)
                                                                winConfigForm[block].RELATION_KEY.forEach(function(id){
                                                                    valuesForm[id] = getItemValue(id)
                                                                })
                                                            // }else{
                                                            //     valuesForm = null
                                                            // }
                                                        }
                                                    }
                                                    let statusInsert = false
                                                    Object.keys(valuesForm).every(function(key){
                                                        if(valuesForm[key] != ""){
                                                            if(!winConfigForm[block].RELATION_KEY.includes(key)){
                                                                if(!winCheckRadio.includes(key)){
                                                                    statusInsert = true
                                                                    return false
                                                                }
                                                                return true
                                                            }
                                                            return true
                                                        }
                                                        return true
                                                    })
                                                    if(statusInsert == false){
                                                        // //console.log("masuk")
                                                        valuesForm = null
                                                    }
                                                    if (valuesForm == null){
                                                        valuesForm = []
                                                    }else{
                                                        valuesForm = [valuesForm]
                                                    }
                                                    
                                                    valuesData[block] = {}
                                                    valuesData[block]['blockType'] = "form"
                                                    valuesData[block]['data'] = valuesForm
                                                }else if($$(block).config.view=="datatable"){
                                                    valuesData[block] = {}
                                                    valuesData[block]['blockType'] = "datagrid"
                                                    valuesData[block]['data'] = webix.copy(winDataChanged[block])
                                                }
                                            }
                                        })
                                        if($$(winActiveBlock.focusNow).config.view == "datatable"){
                                            $$(winActiveBlock.focusNow).unselectAll()
                                        }
                                        console.log(12060,valuesData)
                                        let insertBlock = formatParamAjax(valuesData,"Insert Data")
                                        let preInsertStatus = true
                                        if(window.preInsert != undefined){
                                            let preInsertCustom = window.preInsert(insertBlock)
                                            if(preInsertCustom["status"] == false){
                                                preInsertStatus = false
                                                RMSGBOX(preInsertCustom["msg"])
                                            }else{
                                                insertBlock = preInsertCustom["data"]
                                            }
                                        }
                                        if(preInsertStatus && Object.keys(insertBlock)!=0){
                                            restapi.restApiSubmit({'type':'INSERT','menuId':menuId,'data':insertBlock},"Insert Data")
                                        }else{
                                            if(!isWebixPopupOpen() && preInsertStatus){
                                                webix.alert(ALERT.ALERTWARNING("No records to insert")).then(function(){
                                                    $$(window.menuId).enable();
                                                    // $$(window.menuId).showProgress({type:"icon",hide:true});
                                                })
                                            }
                                        }
                                        this.define('hotkey','ctrl+alt+n')
                                        this.refresh()
                                    }else{
                                        let idBlock = errorBlock[0]
                                        setFocusAfterValidate(idBlock)
                                    }
                                }
                            }
                        }
                    }catch(err){
                        $$(menuId).showProgress({type:"icon",hide:true});//loading
                        $$(menuId).disable()//enable
                        let loc = {line:0,column:0}
                        loc = getErrorLocation(err)
                        webix.message({
                            text:"Error Detected, please capture this error and contact IT HO: <br><br>Error: JS - Element - AddButton/SaveButton - " +"Line: "+loc.line+"<br>"+err,
                            type:"error", 
                            expire: 10000,
                        });
                        console.log("JS - Element - AddButton/SaveButton - Error: ",err)
                    }
                }
            },
            hidden:hideButton[id]})
        return addBtn
    }

    ADDROWDATABUTTON(id){
        let addRowBtn = this.NORMALBUTTON(id,"Add Row Data",(function(){}),{})
        addRowBtn = Object.assign(addRowBtn, {"type":"image", "image":"https://hocdnoden0201.sat.co.id/img/addrowBtn.png", "width": 60, hidden:true, "hotkey": 'ctrl+=', "on":{
            onItemClick:function(){
                // try{
                    if(window.openHTTPs != 0){
                        return webix.message({
                                    text:"Please wait, <br> Your document is being loaded.",
                                    type:"debug", 
                                    expire: 800,
                                });
                    }
                    if(window.winOpenPopUp=="closed"){
                        let view = $$(window.winActiveBlock['focusNow'])
                        if(view.config.view == "datatable"){
                            let blockGagalValidasi
                            Object.keys(winConfigForm).every(function (blockId) {
                                let blockLoop = $$(blockId)
                                if (!blockLoop.validate()) {
                                    blockGagalValidasi = blockId 
                                    return false
                                }else{
                                    return true
                                }
                            })
                            if(blockGagalValidasi == undefined) {
                                winValidatePromise = {}
                                if(winDataChanged[winActiveBlock.focusNow].length>0){
                                    if(winThereIsSubChild){
                                        let ChildParent = ''
                                        Object.keys(winConfigForm).every(function(blockId){
                                            if(winConfigForm[blockId]['BLOCK_TYPE'][1]=="SUB_CHILD"){
                                                if(winConfigForm[blockId]['BLOCK_TYPE'][2]==winActiveBlock['focusNow']){
                                                    ChildParent = winActiveBlock['focusNow']
                                                    return false
                                                }else{
                                                    ChildParent = winConfigForm[winActiveBlock['focusNow']]['BLOCK_TYPE'][2]
                                                    return false
                                                }
                                            }
                                            return true
                                        })
                                        if(ChildParent!=undefined){
                                            restapi.restApiNewForm(ChildParent).then(function(respond){
                                                Object.keys(winConfigForm).forEach(function(blockId){
                                                    if(winConfigForm[blockId]['BLOCK_TYPE'][1]=="SUB_CHILD"){
                                                        if(winConfigForm[blockId]['BLOCK_TYPE'][2]==ChildParent){
                                                            hideOverlay(blockId)
                                                            // restapi.restApiNewForm(ChildParent)
                                                            let newFormInstance = webix.copy(winConfigForm[blockId]['WHEN_NEW_FORM'])
                                                            for (var key in newFormInstance){
                                                                if(typeof(newFormInstance[key])=='function'){
                                                                    newFormInstance[key] = newFormInstance[key](key)
                                                                }else{
                                                                    newFormInstance[key] = newFormInstance[key]
                                                                }
                                                            }
                                                            let dataNew = webix.copy(newFormInstance)
                                                            Object.keys(dataNew).forEach(function(id){
                                                                if(typeof(dataNew[id])=='function'){
                                                                    dataNew[id] = dataNew[id]()
                                                                }
                                                            })
                                                            if($$(blockId).config.view=="datatable"){
                                                                hideOverlay(blockId)
                                                                $$(blockId).add(dataNew,$$("pager_"+blockId)['data']['old_count'])
                                                                $$(blockId).setPage($$("pager_"+blockId)['data']['limit']);
                                                                $$(winActiveBlock['focusNow']).clearValidation();
                                                                Object.keys(winConfigForm[blockId]['WHEN_NEW_FORM']).forEach(function(key){
                                                                    if(winConfigForm[blockId]["PRIMARY_KEY"].includes(key)){
                                                                            let columns = $$(blockId).config.columns
                                                                            columns.forEach(function(colObj){
                                                                                if(colObj.id==key && colObj.jenis!="combo"){
                                                                                    colObj.editor = undefined
                                                                                }
                                                                            })
                                                                        
                                                                    }
                                                                })
                                                            }
                                                        }
                                                    }
                                                })
    
                                                hideOverlay(ChildParent);
                                                
                                                let newFormInstance = webix.copy(winConfigForm[ChildParent]['WHEN_NEW_FORM'])
                                                for (var key in newFormInstance){
                                                    if(typeof(newFormInstance[key])=='function'){
                                                        newFormInstance[key] = newFormInstance[key](key)
                                                    }else{
                                                        newFormInstance[key] = newFormInstance[key]
                                                    }
                                                }
                                                let dataNew = webix.copy(newFormInstance)
                                                Object.keys(dataNew).forEach(function(id){
                                                    if(typeof(dataNew[id])=='function'){
                                                        dataNew[id] = dataNew[id]()
                                                    }
                                                })
                                                if($$(ChildParent).config.view=="datatable"){
                                                    hideOverlay(ChildParent);
                                                    $$(ChildParent).add(dataNew,$$("pager_"+ChildParent)['data']['old_count'])
                                                    $$(ChildParent).setPage($$("pager_"+ChildParent)['data']['limit']);
                                                    $$(winActiveBlock['focusNow']).clearValidation();
                                                    let row_id = $$(ChildParent).getLastId();
                                                    webix.UIManager.setFocus($$(ChildParent));
                                                    $$(ChildParent).select(row_id,$$(ChildParent)['config']['columns'][0]['id'], false)
                                                    // $$(ChildParent).editCell(row_id,$$(ChildParent)['config']['columns'][0]['id']);
                                                    let view = $$(ChildParent)
                                                    let pos = view.getSelectedId();
                                                    window.winActiveCell = {"pos":pos, "view":view}
                                                    Object.keys(winConfigForm[ChildParent]['WHEN_NEW_FORM']).forEach(function(key){
                                                        if(winConfigForm[ChildParent]["PRIMARY_KEY"].includes(key)){
                                                                let columns = $$(ChildParent).config.columns
                                                                columns.forEach(function(colObj){
                                                                    if(colObj.id==key && colObj.jenis!="combo"){
                                                                        colObj.editor = undefined
                                                                    }
                                                                })
                                                            
                                                        }
                                                    })
                                                }
                                            })
                                        }else{
                                            hideOverlay(window.winActiveBlock['focusNow']);
                                            restapi.restApiNewForm(window.winActiveBlock['focusNow']).then(function(respond){
                                                let newFormInstance = webix.copy(winConfigForm[window.winActiveBlock['focusNow']]['WHEN_NEW_FORM'])
                                                for (var key in newFormInstance){
                                                    if(typeof(newFormInstance[key])=='function'){
                                                        newFormInstance[key] = newFormInstance[key](key)
                                                    }else{
                                                        newFormInstance[key] = newFormInstance[key]
                                                    }
                                                }
                                                let dataNew = webix.copy(newFormInstance)
                                                Object.keys(dataNew).forEach(function(id){
                                                    if(typeof(dataNew[id])=='function'){
                                                        dataNew[id] = dataNew[id]()
                                                    }
                                                })
                                                if($$(window.winActiveBlock['focusNow']).config.view=="datatable"){
                                                    hideOverlay(window.winActiveBlock['focusNow']);
                                                    $$(window.winActiveBlock['focusNow']).add(dataNew,$$("pager_"+window.winActiveBlock['focusNow'])['data']['old_count'])
                                                    $$(window.winActiveBlock['focusNow']).setPage($$("pager_"+window.winActiveBlock['focusNow'])['data']['limit']);
                                                    $$(winActiveBlock['focusNow']).clearValidation();
                                                    let row_id = $$(window.winActiveBlock['focusNow']).getLastId();
                                                    webix.UIManager.setFocus($$(window.winActiveBlock['focusNow']));
                                                    $$(window.winActiveBlock['focusNow']).select(row_id,$$(window.winActiveBlock['focusNow'])['config']['columns'][0]['id'], false)
                                                    // $$(window.winActiveBlock['focusNow']).editCell(row_id,$$(window.winActiveBlock['focusNow'])['config']['columns'][0]['id']);
                                                    let view = $$(window.winActiveBlock['focusNow'])
                                                    let pos = view.getSelectedId();
                                                    window.winActiveCell = {"pos":pos, "view":view}
                                                    Object.keys(winConfigForm[window.winActiveBlock['focusNow']]['WHEN_NEW_FORM']).forEach(function(key){
                                                        if(winConfigForm[window.winActiveBlock['focusNow']]["PRIMARY_KEY"].includes(key)){
                                                                let columns = $$(window.winActiveBlock['focusNow']).config.columns
                                                                columns.forEach(function(colObj){
                                                                    if(colObj.id==key && colObj.jenis!="combo"){
                                                                        colObj.editor = undefined
                                                                    }
                                                                })
                                                            
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                        
                                    }else{
                                        hideOverlay(window.winActiveBlock['focusNow'])
                                        restapi.restApiNewForm(window.winActiveBlock['focusNow']).then(function(respond){
                                            let newFormInstance = webix.copy(winConfigForm[window.winActiveBlock['focusNow']]['WHEN_NEW_FORM'])
                                            for (var key in newFormInstance){
                                                if(typeof(newFormInstance[key])=='function'){
                                                    newFormInstance[key] = newFormInstance[key](key)
                                                }else{
                                                    newFormInstance[key] = newFormInstance[key]
                                                }
                                            }
                                            let dataNew = webix.copy(newFormInstance)
                                            Object.keys(dataNew).forEach(function(id){
                                                if(typeof(dataNew[id])=='function'){
                                                    dataNew[id] = dataNew[id]()
                                                }
                                            })
                                            if($$(window.winActiveBlock['focusNow']).config.view=="datatable"){
                                                hideOverlay(window.winActiveBlock['focusNow'])
                                                $$(window.winActiveBlock['focusNow']).add(dataNew,$$("pager_"+window.winActiveBlock['focusNow'])['data']['old_count'])
                                                $$(window.winActiveBlock['focusNow']).setPage($$("pager_"+window.winActiveBlock['focusNow'])['data']['limit']);
                                                $$(winActiveBlock['focusNow']).clearValidation();
                                                let row_id = $$(window.winActiveBlock['focusNow']).getLastId();
                                                webix.UIManager.setFocus($$(window.winActiveBlock['focusNow']));
                                                $$(window.winActiveBlock['focusNow']).select(row_id,$$(window.winActiveBlock['focusNow'])['config']['columns'][0]['id'], false)
                                                // $$(window.winActiveBlock['focusNow']).editCell(row_id,$$(window.winActiveBlock['focusNow'])['config']['columns'][0]['id']);
                                                let view = $$(window.winActiveBlock['focusNow'])
                                                let pos = view.getSelectedId();
                                                window.winActiveCell = {"pos":pos, "view":view}
                                                Object.keys(winConfigForm[window.winActiveBlock['focusNow']]['WHEN_NEW_FORM']).forEach(function(key){
                                                    if(winConfigForm[window.winActiveBlock['focusNow']]["PRIMARY_KEY"].includes(key)){
                                                            let columns = $$(window.winActiveBlock['focusNow']).config.columns
                                                            columns.forEach(function(colObj){
                                                                if(colObj.id==key && colObj.jenis!="combo"){
                                                                    colObj.editor = undefined
                                                                }
                                                            })
                                                        
                                                    }
                                                })
                                            }
                                        })
                                    }
                                }else{
                                    if(winThereIsSubChild){
                                        if(Object.keys(winSubChild).includes(winActiveBlock.focusNow) || winConfigForm[winActiveBlock['focusNow']]["BLOCK_TYPE"][2] != undefined){
                                            let ChildParent = winConfigForm[winActiveBlock['focusNow']]["BLOCK_TYPE"][2] || winActiveBlock.focusNow
                                            restapi.restApiNewForm(ChildParent).then(function(respond){
                                                Object.keys(winConfigForm).forEach(function(blockId){
                                                    if(winConfigForm[blockId]['BLOCK_TYPE'][1]=="SUB_CHILD"){
                                                        if(winConfigForm[blockId]['BLOCK_TYPE'][2]==ChildParent){
                                                            // restapi.restApiNewForm(ChildParent)
                                                            let newFormInstance = webix.copy(winConfigForm[blockId]['WHEN_NEW_FORM'])
                                                            for (var key in newFormInstance){
                                                                if(typeof(newFormInstance[key])=='function'){
                                                                    newFormInstance[key] = newFormInstance[key](key)
                                                                }else{
                                                                    newFormInstance[key] = newFormInstance[key]
                                                                }
                                                            }
                                                            let dataNew = webix.copy(newFormInstance)
                                                            Object.keys(dataNew).forEach(function(id){
                                                                if(typeof(dataNew[id])=='function'){
                                                                    dataNew[id] = dataNew[id]()
                                                                }
                                                            })
                                                            if($$(blockId).config.view=="datatable"){
                                                                hideOverlay(blockId)
                                                                $$(blockId).add(dataNew,$$("pager_"+blockId)['data']['old_count'])
                                                                $$(blockId).setPage($$("pager_"+blockId)['data']['limit']);
                                                                $$(winActiveBlock['focusNow']).clearValidation();
                                                                // let row_id = $$(blockId).getLastId();
                                                                // webix.UIManager.setFocus($$(blockId));
                                                                // $$(blockId).select(row_id,$$(blockId)['config']['columns'][0]['id'], false)
                                                                // $$(blockId).editCell(row_id,$$(blockId)['config']['columns'][0]['id']);
                                                                // let view = $$(blockId)
                                                                // let pos = view.getSelectedId();
                                                                // window.winActiveCell = {"pos":pos, "view":view}
                                                                Object.keys(winConfigForm[blockId]['WHEN_NEW_FORM']).forEach(function(key){
                                                                    if(winConfigForm[blockId]["PRIMARY_KEY"].includes(key)){
                                                                            let columns = $$(blockId).config.columns
                                                                            columns.forEach(function(colObj){
                                                                                if(colObj.id==key && colObj.jenis!="combo"){
                                                                                    colObj.editor = undefined
                                                                                }
                                                                            })
                                                                        
                                                                    }
                                                                })
                                                            }
                                                        }
                                                    }
                                                })
        
                                                let newFormInstance = webix.copy(winConfigForm[ChildParent]['WHEN_NEW_FORM'])
                                                for (var key in newFormInstance){
                                                    if(typeof(newFormInstance[key])=='function'){
                                                        newFormInstance[key] = newFormInstance[key](key)
                                                    }else{
                                                        newFormInstance[key] = newFormInstance[key]
                                                    }
                                                }
                                                let dataNew = webix.copy(newFormInstance)
                                                Object.keys(dataNew).forEach(function(id){
                                                    if(typeof(dataNew[id])=='function'){
                                                        dataNew[id] = dataNew[id]()
                                                    }
                                                })
                                                if($$(ChildParent).config.view=="datatable"){
                                                    hideOverlay(ChildParent)
                                                    $$(ChildParent).add(dataNew,$$("pager_"+ChildParent)['data']['old_count'])
                                                    $$(ChildParent).setPage($$("pager_"+ChildParent)['data']['limit']);
                                                    $$(winActiveBlock['focusNow']).clearValidation();
                                                    let row_id = $$(ChildParent).getLastId();
                                                    webix.UIManager.setFocus($$(ChildParent));
                                                    $$(ChildParent).select(row_id,$$(ChildParent)['config']['columns'][0]['id'], false)
                                                    // $$(ChildParent).editCell(row_id,$$(ChildParent)['config']['columns'][0]['id']);
                                                    let view = $$(ChildParent)
                                                    let pos = view.getSelectedId();
                                                    window.winActiveCell = {"pos":pos, "view":view}
                                                    Object.keys(winConfigForm[ChildParent]['WHEN_NEW_FORM']).forEach(function(key){
                                                        if(winConfigForm[ChildParent]["PRIMARY_KEY"].includes(key)){
                                                                let columns = $$(ChildParent).config.columns
                                                                columns.forEach(function(colObj){
                                                                    if(colObj.id==key && colObj.jenis!="combo"){
                                                                        colObj.editor = undefined
                                                                    }
                                                                })
                                                            
                                                        }
                                                    })
                                                }
                                            })
                                        }else{      
                                            restapi.restApiNewForm(window.winActiveBlock['focusNow']).then(function(respond){
                                                let newFormInstance = webix.copy(winConfigForm[window.winActiveBlock['focusNow']]['WHEN_NEW_FORM'])
                                                for (var key in newFormInstance){
                                                    if(typeof(newFormInstance[key])=='function'){
                                                        newFormInstance[key] = newFormInstance[key](key)
                                                    }else{
                                                        newFormInstance[key] = newFormInstance[key]
                                                    }
                                                }
                                                let dataNew = webix.copy(newFormInstance)
                                                Object.keys(dataNew).forEach(function(id){
                                                    if(typeof(dataNew[id])=='function'){
                                                        dataNew[id] = dataNew[id]()
                                                    }
                                                })
                                                if($$(window.winActiveBlock['focusNow']).config.view=="datatable"){
                                                    hideOverlay(window.winActiveBlock['focusNow'])
                                                    $$(window.winActiveBlock['focusNow']).add(dataNew,$$("pager_"+window.winActiveBlock['focusNow'])['data']['old_count'])
                                                    $$(window.winActiveBlock['focusNow']).setPage($$("pager_"+window.winActiveBlock['focusNow'])['data']['limit']);
                                                    $$(winActiveBlock['focusNow']).clearValidation();
                                                    let row_id = $$(window.winActiveBlock['focusNow']).getLastId();
                                                    webix.UIManager.setFocus($$(window.winActiveBlock['focusNow']));
                                                    $$(window.winActiveBlock['focusNow']).select(row_id,$$(window.winActiveBlock['focusNow'])['config']['columns'][0]['id'], false)
                                                    // $$(window.winActiveBlock['focusNow']).editCell(row_id,$$(window.winActiveBlock['focusNow'])['config']['columns'][0]['id']);
                                                    let view = $$(window.winActiveBlock['focusNow'])
                                                    let pos = view.getSelectedId();
                                                    window.winActiveCell = {"pos":pos, "view":view}
                                                    Object.keys(winConfigForm[window.winActiveBlock['focusNow']]['WHEN_NEW_FORM']).forEach(function(key){
                                                        if(winConfigForm[window.winActiveBlock['focusNow']]["PRIMARY_KEY"].includes(key)){
                                                                let columns = $$(window.winActiveBlock['focusNow']).config.columns
                                                                columns.forEach(function(colObj){
                                                                    if(colObj.id==key && colObj.jenis!="combo"){
                                                                        colObj.editor = undefined
                                                                    }
                                                                })
                                                            
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    }else{
                                        $$(window.winActiveBlock['focusNow']).showColumn("action_"+window.winActiveBlock['focusNow'])
                                        restapi.restApiNewForm(window.winActiveBlock['focusNow']).then(function(respond){
                                            let newFormInstance = webix.copy(winConfigForm[window.winActiveBlock['focusNow']]['WHEN_NEW_FORM'])
                                            for (var key in newFormInstance){
                                                if(typeof(newFormInstance[key])=='function'){
                                                    newFormInstance[key] = newFormInstance[key](key)
                                                }else{
                                                    newFormInstance[key] = newFormInstance[key]
                                                }
                                            }
                                            let dataNew = webix.copy(newFormInstance)
                                            Object.keys(dataNew).forEach(function(id){
                                                if(typeof(dataNew[id])=='function'){
                                                    dataNew[id] = dataNew[id]()
                                                }
                                            })
                                            if($$(window.winActiveBlock['focusNow']).config.view=="datatable"){
                                                hideOverlay(window.winActiveBlock['focusNow'])
                                                $$(window.winActiveBlock['focusNow']).add(dataNew,$$("pager_"+window.winActiveBlock['focusNow'])['data']['old_count'])
                                                $$(window.winActiveBlock['focusNow']).setPage($$("pager_"+window.winActiveBlock['focusNow'])['data']['limit']);
                                                $$(winActiveBlock['focusNow']).clearValidation();
                                                let row_id = $$(window.winActiveBlock['focusNow']).getLastId();
                                                webix.UIManager.setFocus($$(window.winActiveBlock['focusNow']));
                                                $$(window.winActiveBlock['focusNow']).select(row_id,$$(window.winActiveBlock['focusNow'])['config']['columns'][0]['id'], false)
                                                // $$(window.winActiveBlock['focusNow']).editCell(row_id,$$(window.winActiveBlock['focusNow'])['config']['columns'][0]['id']);
                                                let view = $$(window.winActiveBlock['focusNow'])
                                                let pos = view.getSelectedId();
                                                window.winActiveCell = {"pos":pos, "view":view}
                                                Object.keys(winConfigForm[window.winActiveBlock['focusNow']]['WHEN_NEW_FORM']).forEach(function(key){
                                                    if(winConfigForm[window.winActiveBlock['focusNow']]["PRIMARY_KEY"].includes(key)){
                                                            let columns = $$(window.winActiveBlock['focusNow']).config.columns
                                                            columns.forEach(function(colObj){
                                                                if(colObj.id==key && colObj.jenis!="combo"){
                                                                    colObj.editor = undefined
                                                                }
                                                            })
                                                        
                                                    }
                                                })
                                            }
                                        })
                                    }
                                }
                            }else{
                                let nameTab = ""
                                if(winMultiviewBlocksVertical.includes(blockGagalValidasi)){
                                    nameTab = findObjectById(blockGagalValidasi,$$("listMultiviewVertical"+menuId).config.data).title
                                }else if(winMultiviewBlocks.includes(blockGagalValidasi)){
                                    nameTab = findObjectById(blockGagalValidasi,$$("tabbar"+menuId).config.options).value
                                }
                                if(!isWebixPopupOpen()){
                                    // let nameTab = findObjectById(blockGagalValidasi,$$("listMultiviewVertical"+menuId).config.data).title
                                    webix.alert(ALERT.ALERTERROR('Validasi Gagal '+nameTab)).then(function(){
                                        window.winActiveCell['view'].editCell(window.winActiveCell['pos']['row'], window.winActiveCell['pos']['column']);
                                        if(winMultiviewBlocks.length!=0){
                                            $$('tabbar'+menuId).setValue(blockGagalValidasi);
                                            $$("tabbar"+blockGagalValidasi).show()
                                            webix.UIManager.setFocus($$(blockGagalValidasi));
                                        }else if(winMultiviewBlocksVertical.length!=0){
                                            $$("listMultiviewVertical"+menuId).select(blockGagalValidasi)
                                            webix.$$(blockGagalValidasi+"_verticalTab").show();
                                            webix.UIManager.setFocus($$(blockGagalValidasi));
                                        }
                                    })
                                }
                            }
                        }else{
                            if(!isWebixPopupOpen()){
                                webix.alert(ALERT.ALERTERROR('Tidak Berada pada Block Datagrid')).then(function(){
                                    $$(view).focus()
                                })
                            }
                        }
                    }
                // }catch(err){
                //     $$(menuId).showProgress({type:"icon",hide:true});//loading
                //     $$(menuId).disable()//enable
                //     webix.message({
                //         text:"Error Detected, please capture this error and contact IT HO: <br><br>Error: JS - Element - AddRowButton - "+err,
                //         type:"error", 
                //         expire: 10000,
                //     });
                //     //console.log("JS - Element - AddRowButton - Error: ",err)
                // }
            }
        }})
        return addRowBtn
    }

    UPDATEVALUEBUTTON(id){
        let updateBtn = this.NORMALBUTTON(id,"Update",(function(){}),{})
        updateBtn = Object.assign(updateBtn,{"type":"image", "image":"https://hocdnoden0201.sat.co.id/img/updateBtn.png", "width": 60, "hotkey": 'ctrl+U', "on":{
                onItemClick:function(){
                    // try{

                        if(window.winOpenPopUp=="closed"){
                            if (winConfigForm[winActiveBlock.focusNow]['TRANSACTION_BLOCK'] != undefined) {
                                if (winConfigForm[winActiveBlock.focusNow]['TRANSACTION_BLOCK']['UPDATE'] == false) {
                                    let nameTab = "ini"
                                    if(winMultiviewBlocksVertical.includes(winActiveBlock.focusNow)){
                                        nameTab = findObjectById(winActiveBlock.focusNow,$$("listMultiviewVertical"+menuId).config.data).title
                                    }else if(winMultiviewBlocks.includes(winActiveBlock.focusNow)){
                                        nameTab = findObjectById(winActiveBlock.focusNow,$$("tabbar"+menuId).config.options).value
                                    }
                                    return webix.alert(ALERT.ALERTWARNING(`Cannot update data in block ${nameTab}.`))
                                }
                            }
                            // $$(window.menuId).disable()//enable
                            // $$(window.menuId).showProgress({type:"icon",hide:false});//loading
                            let blocks = Object.keys(winConfigForm)
                            let statusValidate = true;
                            let errorBlock = [];
                            blocks.every(function(block){
                                if(!$$(block).validate()){
                                    statusValidate = false;
                                    errorBlock.push(block)
                                    return false
                                }
                                return true
                            })
                            if(errorBlock.length==0 && statusValidate==true){
                                let valuesData = {}
                                blocks.forEach(function(block){
                                    if (winConfigForm[block]['BASE_TABLE'] == undefined){
                                        winConfigForm[block]['BASE_TABLE'] = true
                                    }
                                    if(winConfigForm[block]['BASE_TABLE']){
                                        if($$(block).config.view=="form"){
                                            let changedForm = {}
                                            let valuesForm = getBlockValue(block)
                                            winConfigForm[block]["PRIMARY_KEY"].forEach(function (item) {
                                                valuesForm[item] = $$(item).getValue()
                                            });
                                            winConfigForm[block]["RELATION_KEY"].forEach(function (item) {
                                                valuesForm[item] = $$(item).getValue()
                                            });

                                            let listIdChanged = []
                                            Object.keys(window.winDataCompare[block]["data"]).forEach(function(idItem){
                                                console.log(12006,idItem);
                                                console.log(12007,window.winDataCompare[block]["data"][idItem],valuesForm[idItem]);
                                                console.log(12008,window.winDataCompare[block]["data"][idItem]!=valuesForm[idItem]);
                                                if(window.winDataCompare[block]["data"][idItem]!=valuesForm[idItem]){
                                                    // if($$(idItem).config.jenis!="display"){
                                                        listIdChanged.push(idItem)
                                                    // }
                                                }else{
                                                    console.log("DATA SAMA",idItem);
                                                    
                                                    delete valuesForm[idItem]
                                                }
                                                
                                            })
                                            changedForm[block] = {}
                                            changedForm[block]["datachanged"]=listIdChanged

                                            if(changedForm[block]["datachanged"].length!=0){
                                                valuesForm = {}
                                                changedForm[block]["datachanged"].forEach(function(idChanged){
                                                    valuesForm[idChanged] = $$(idChanged).getValue()
                                                })
                                                winConfigForm[block]["PRIMARY_KEY"].forEach(function (item) {
                                                    valuesForm[item] = getItemValue(item)
                                                });
                                                winConfigForm[block]["RELATION_KEY"].forEach(function (item) {
                                                    valuesForm[item] = getItemValue(item)
                                                });
                                                valuesForm = [valuesForm]
                                            }else{
                                                valuesForm = []
                                            }
                                            valuesData[block] = {}
                                            valuesData[block]['blockType'] = "form"
                                            valuesData[block]['data'] = valuesForm
                                        }else if($$(block).config.view=="datatable"){
                                            valuesData[block] = {}
                                            valuesData[block]['blockType'] = "datagrid"
                                            valuesData[block]['data'] = webix.copy(winDataChanged[block])
                                        }
                                    }
                                    
                                })
                                let statusUpdateData = false
                                Object.keys(valuesData).forEach(function(block){
                                    if(valuesData[block].data.length>0){
                                        statusUpdateData = true
                                    }
                                })
                                // //console.log(webix.copy(valuesData))
                                console.log(12051,valuesData);
                                
                                if(statusUpdateData){
                                    let updatedBlock = formatParamAjax(valuesData,"Update Data")
                                    updatedBlock = checkCompareBeforeAPI(updatedBlock)
                                    
                                    if(Object.keys(updatedBlock)!=0){
                                        restapi.restApiSubmit({'type':'UPDATE','menuId':menuId,'data':updatedBlock},"Update Data")
                                    }else{
                                        if(!isWebixPopupOpen()){
                                            webix.alert(ALERT.ALERTWARNING("No data has changed")).then(function(){
                                                $$(window.menuId).enable();
                                                // $$(window.menuId).showProgress({type:"icon",hide:true});
                                            })
                                        }
                                    }
                                    
                                }else{
                                    if(!isWebixPopupOpen()){
                                        webix.alert(ALERT.ALERTWARNING("No data has changed")).then(function(){
                                            $$(window.menuId).enable();
                                            // $$(window.menuId).showProgress({type:"icon",hide:true});
                                        })
                                    }
                                }
                                
                            }else{
                                let idBlock = errorBlock[0]
                                setFocusAfterValidate(idBlock)
                            }
                        }
                    // }catch(err){
                    //     $$(menuId).showProgress({type:"icon",hide:true});//loading
                    //     $$(menuId).disable()//enable
                    //     webix.message({
                    //         text:"Error Detected, please capture this error and contact IT HO: <br><br>Error: JS - Element - UpdateButton - "+err,
                    //         type:"error", 
                    //         expire: 10000,
                    //     });
                    //     //console.log("JS - Element - UpdateButton - Error: ",err)
                    // }
                    
                }
            },
            hidden:hideButton[id]})
        return updateBtn
    }

    CLEARBUTTON(id){
        let clearBtn = this.NORMALBUTTON(id,"Reset",(function(){}),{})
        clearBtn = Object.assign(clearBtn,{"type":"image", "image":"https://hocdnoden0201.sat.co.id/img/refreshBtn.png", "width": 60, hotkey:'ctrl+R', "on":{
                onItemClick:function(){
                    // try{
                        if(window.openHTTPs != 0){
                            return webix.message({
                                        text:"Please wait, <br> Your document is being loaded.",
                                        type:"debug", 
                                        expire: 800,
                                    });
                        }
                        if(window.winOpenPopUp=="closed"){
                            winDataAtStart = true;
                            window.winResetData = true;
                            winSearchParam = {status:false, param:{}}
                            Object.keys(winDataChanged).forEach(function(idBlock){
                                winDataChanged[idBlock] = []
                            })
                            let blocks = Object.keys(winConfigForm)
                            // $$(window.menuId).disable();
                            blocks.forEach(function(block){
                                if($$(block).config.view == "form"){
                                    Object.keys($$(block).elements).forEach(function(id){
                                        if (!winDisplayItem.includes(id)){
                                            if($$(id)!=undefined){
                                                $$(id).enable()
                                            }
                                        }
                                    })
                                }else if($$(block).config.view == "datatable"){
                                    $$(block).enable()
                                    if (isGridToGrid) {
                                        winConfigForm[block]['WIN_ACTIVE_CELL_BLOCK'] = {}
                                    }
                                    winFailedValidateItem[block] = {}
                                    winConfigForm[block]["PRIMARY_KEY"].forEach(function(pkCol){
                                        let columns = $$(block).config.columns
                                        columns.forEach(function(colObj){
                                            if(colObj.id==pkCol && colObj.jenis!="combo"){
                                                if(!$$(block).getColumnConfig(colObj.id).disabledItem){
                                                    colObj.editor = "text"
                                                }
                                            }
                                        })
                                    })
                                        
                                }
                            })
                            window.winCheckRadio.forEach(function(item){
                                if($$(item)!=undefined){
                                    if(!winDisplayItem.includes(item)){
                                        $$(item).enable()
                                    }
                                }
                            })
                            // $$(window.menuId).showProgress({type:"icon",hide:false});
                            let indexObj = blocks.indexOf(winActiveBlock.focusNow)
                            blocks.forEach(function(block){
                                if($$(block).config.view=="form"){
                                    winConfigForm[block]["PRIMARY_KEY"].forEach(function (item) {
                                        if(!$$(item).config.displayItem){
                                            $$(item).define("readonly",true)
                                            $$(item).refresh()
                                        }
                                    });
                                }
                            })
                            
                            $$("addValue").config.value = "Add New Data"
                            $$("addValue").config.image = "https://hocdnoden0201.sat.co.id/img/addBtn.png"
                            $$("addValue").$view.classList.remove("webix_custom_button")
                            $$("addValue").refresh()
                            // $$("searchValue").config.value = "Search Mode"
                            $$("searchValue").$view.classList.remove("webix_custom_button")
                            $$("searchValue").refresh()
                            $$("prev").define("disabled",false);   //prev
                            $$("next").define("disabled",false);   //next
                            $$("searchValue").define("disabled",false);   //search
                            $$("addValue").define("disabled",false);   //add
                            $$("addRowDb").define("disabled",false);   //addrow
                            $$("addRowDb").hide()   //addrow
                            $$("updateValue").define("disabled",false);   //update
                            $$("clearBtn").define("disabled",false);   //reset
                            winValidatePromise = {}
    
                            winAutoNumber = 0;
    
                            $$("deleteValue").define('disabled',false)
                            if(window.winActiveBlock["focusNow"]){
                                webix.html.removeCss($$(window.winActiveBlock["focusNow"]).getNode(), "datablock-focus")
                            }
                            if (winConfigForm[winActiveBlock.focusNow]["BLOCK_TYPE"][1]=="SUB_CHILD") {
                                let param = winConfigForm[ winConfigForm[winActiveBlock.focusNow]["BLOCK_TYPE"][2]].REST_API
                                if (param) {
                                    if (param.hasOwnProperty('OFFSET_NUMBER')) {
                                        delete param.OFFSET_NUMBER
                                        delete param.LOAD_MORE_DATA
                                    }
                                    if (param.hasOwnProperty('data')) {
                                        delete param.data
                                    }
                                }
                            }else{
                                let param = winConfigForm[winActiveBlock.focusNow].REST_API;
                                if (param) {
                                    if (param.hasOwnProperty('OFFSET_NUMBER')) {
                                        delete param.OFFSET_NUMBER
                                        delete param.LOAD_MORE_DATA
                                    }
                                    if (param.hasOwnProperty('data')) {
                                        delete param.data
                                    }
                                }
                            }
                            
                            window.winActiveBlock["lastFocus"]=""
                            window.winActiveBlock["focusNow"]=""
                            window.winSearchMode = false;
                            window.winAddData = false;
                            window.haveRowAdded = false
                            Object.keys(winCountOffsetRecord).forEach(function(block){
                                window.winCountOffsetRecord[block] = 0
                            })
                            winPopUpUploaderDt.forEach(function(idWd){
                                $$(idWd).close()

                                let index = winPopUpUploaderDt.indexOf(idWd)
                                winPopUpUploaderDt.splice(index, 1);
                            })
                            blocks.forEach(function(block){
                                if($$(block).config.view=="form"){
                                    $$(block).define('dynamicLoadData',0)
                                    $$(block).clear()
                                    $$(block).clearValidation()
                                }else if($$(block).config.view=="datatable"){
                                    $$(block).define('dynamicLoadData',0)
                                    $$(block).clearAll()
                                    $$(block).clearValidation()
                                    $$(block).detachEvent("onKeyPress");
                                }
                            })
                            currentValue = {}
                            // window.winCountOffsetRecord+=1
                            Object.keys(window.winPagerDatatable).forEach(function(idBlock){
                                window.winPagerDatatable[idBlock][0]=0
                            })
                            winJenisAddValue = ""

                            if(winMultiviewBlocks.length!=0){
                                let firstView = $$("tabbar"+menuId).config.options[0].id
                                $$("tabbar"+menuId).setValue(firstView)
                                $$("tabbar"+firstView).show()
                                
                            }else if(winMultiviewBlocksVertical.length!=0){
                                webix.$$($$("listMultiviewVertical"+menuId).getFirstId()+"_verticalTab").show();
                                $$("listMultiviewVertical"+menuId).select($$("listMultiviewVertical"+menuId).getFirstId());
                            }
                            if(menuId.includes("_ND")){
                                location.reload()
                            }else{
                                restapi.restApiSelect()
                            }
                        }
                    // }catch(err){
                    //     $$(menuId).showProgress({type:"icon",hide:true});//loading
                    //     $$(menuId).disable()//enable
                    //     webix.message({
                    //         text:"Error Detected, please capture this error and contact IT HO: <br><br>Error: JS - Element - ResetButton - "+err,
                    //         type:"error", 
                    //         expire: 10000,
                    //     });
                    //     //console.log("JS - Element - ResetButton - Error: ",err)
                    // }
                }
            },
            hidden:hideButton[id]})
        return clearBtn
    }

    DELETEBUTTON(id){
        let deleteBtn = this.NORMALBUTTON(id,"Delete Data",(function(){}),{})
        deleteBtn = Object.assign(deleteBtn, {"type":"image", "image":"https://hocdnoden0201.sat.co.id/img/deleteBtn.png", "width": 60, hidden:false, "on":{
                onItemClick:function(){
                    // try{
                        if(window.winOpenPopUp=="closed"){
                            if (winConfigForm[winActiveBlock.focusNow]['TRANSACTION_BLOCK'] != undefined) {
                                if (winConfigForm[winActiveBlock.focusNow]['TRANSACTION_BLOCK']['DELETE'] == false) {
                                    let nameTab = "ini"
                                    if(winMultiviewBlocksVertical.includes(winActiveBlock.focusNow)){
                                        nameTab = findObjectById(winActiveBlock.focusNow,$$("listMultiviewVertical"+menuId).config.data).title
                                    }else if(winMultiviewBlocks.includes(winActiveBlock.focusNow)){
                                        nameTab = findObjectById(winActiveBlock.focusNow,$$("tabbar"+menuId).config.options).value
                                    }
                                    return webix.alert(ALERT.ALERTWARNING(`Cannot delete data in block ${nameTab}.`))
                                }
                            }
                            let blockAlert = ""
                            if(isGridToGrid){
                                statusMasterDetailGridToGrid.child.every(function(blockChild){
                                    if(winDataDtSelect[blockChild].length!=0){
                                        blockAlert += blockChild + ", "
                                        return false
                                    }
                                    return true
                                })
                                blockAlert = blockAlert.slice(0, -2)
                            }
                            if(!winAddData){
                                let pesan = "Are You Sure to Delete Data: <br><br>"
                                let view = $$(window.winActiveBlock['focusNow']).config.view
                                let flagActiveCell = true
                                let thereIsData = false
                                
                                if(view == "form"){
                                    pesan += getLabelDeleteButton(winActiveBlock['focusNow'],view)
                                    if(Object.keys(winDataCompare[winActiveBlock['focusNow']]['data']).length != 0 ){
                                        thereIsData = true
                                    }
                                }else if(view =='datatable'){
                                    if(winDataDtSelect[winActiveBlock['focusNow']].length != 0 ){
                                        thereIsData = true
                                    }
                                    if ($$(winActiveBlock['focusNow']).getSelectedId() == undefined) {
                                        flagActiveCell = false
                                    }
                                    if (flagActiveCell) {
                                        if(winConfigForm[winActiveBlock.focusNow]["BLOCK_TYPE"][1]=="PARENT"){
                                            pesan += getLabelDeleteButton(winActiveBlock['focusNow'],view)
                                        }else{
                                            let parentBlockId = getBlockParent()
                                            pesan += getLabelDeleteButton(parentBlockId, $$(parentBlockId).config.view)
                                            pesan += getLabelDeleteButton(winActiveBlock['focusNow'],view)
                                        }
                                    }else{
                                        if(!isWebixPopupOpen()){
                                            webix.alert(ALERT.ALERTWARNING("Please select row first before deleting data."))
                                        }
                                    }
                                }

                                if(thereIsData == false){
                                    return webix.alert(ALERT.ALERTWARNING("Sorry, data is empty, nothing to delete."))
                                }
                                if (flagActiveCell) {
                                    if(!isGridToGrid){
                                        webix.confirm({
                                            title:"Delete Data Confirmation",
                                            text:pesan,
                                            cancel:"Batal",
                                            type:"alert-warning"
                                        }).then(function(result){
                                            if(result){
                                                // some action when the alert window is closed
                                                let blocks = Object.keys(winConfigForm)
                                                let valuesData = {}
                                                blocks.forEach(function(block){
                                                    
                                                    if($$(block).config.view=='form'){
                                                        if(winActiveBlock.focusNow==block){
                                                            valuesData[block] = {}
                                                            valuesData[block]['blockType'] = "form"
                                                            valuesData[block]['data'] = []
                                                            if($$(window.winActiveBlock['focusNow']).config.view=='form'){
                                                                let datadelete = {}
                                                                winConfigForm[winActiveBlock['focusNow']]['PRIMARY_KEY'].forEach(function(primaryId){
                                                                    datadelete[primaryId] = $$(primaryId).getValue()
                                                                })
                                                                valuesData[block]['data'].push(datadelete)
                                                            }
                                                        }
                                                    }else{
                                                        if($$(window.winActiveBlock['focusNow']).config.view=='datatable'){
                                                            valuesData[block] = {}
                                                            valuesData[block]['blockType'] = "datagrid"
                                                            valuesData[block]['data'] = []
                                                            
                                                            if(winActiveBlock.focusNow==block){
                                                                let datadelete = {}
                                                                winConfigForm[winActiveBlock['focusNow']]['PRIMARY_KEY'].forEach(function(primaryId){
                                                                    datadelete[primaryId] = $$(winActiveBlock['focusNow']).getItem($$(winActiveBlock['focusNow']).getSelectedId(true)[0].row)[primaryId]
                                                                })
                                                                
                                                                let indexObj = blocks.indexOf(winActiveBlock.focusNow)
                                                                for(let a=0; a<=indexObj; a++){
                                                                    if(winConfigForm[blocks[a]]["BLOCK_TYPE"][0]=="FORM"){
                                                                        winConfigForm[blocks[a]]["PRIMARY_KEY"].forEach(function(id){
                                                                            datadelete[id] = $$(id).getValue()
                                                                        })
                                                                    }
                                                                }
                                                                valuesData[block]['data'].push(datadelete)
                                                            }
                                                        }
                                                    }
                                                })
                                                restapi.restApiSubmit({'type':'DELETE','menuId':menuId,'data':formatParamAjax(valuesData,"Delete Data")},"Delete Data")
                                            }
                                        });
                                    }else{
                                        let textWarning = "Please Delete All Data "
                                        let title_alert = "There is data in the block "
                                        let blockFocusChild = ''
                                        let isEmpty = true
                                        
                                        if(winConfigForm[winActiveBlock['focusNow']]['BLOCK_TYPE'][1]=="PARENT"){
                                            title_alert += '<b>'+blockAlert+'</b>'
                                            textWarning += '<b>'+blockAlert+'</b> terlebih dahulu !'
                                            Object.keys(winDataDtSelect).every(function(block){
                                                if (winConfigForm[block]['BLOCK_TYPE'][1] != 'PARENT') {
                                                    if(statusMasterDetailGridToGrid.child.includes(block)){
                                                        if(winDataDtSelect[block].length!=0){
                                                    isEmpty = false
                                                            blockFocusChild = block
                                                            return false
                                                }else{
                                                    isEmpty = true
                                                }
                                                    }
                                                }
                                                return true
                                            })
                                        }else if(winConfigForm[winActiveBlock['focusNow']]['BLOCK_TYPE'][1]=="CHILD" && (statusMasterDetailGridToGrid.grandchild).length !=0){
                                            statusMasterDetailGridToGrid.grandchild.every(function(blockGrandchild){
                                                title_alert += '<b>'+blockGrandchild+'</b>'
                                                textWarning += '<b>'+blockGrandchild+'</b> terlebih dahulu !'
                                                blockFocusChild = blockGrandchild
                                                if(winDataDtSelect[blockGrandchild].length!=0){
                                                    isEmpty = false
                                                    return false
                                                }else{
                                                    isEmpty = true
                                                    return true
                                                }
                                            })
                                        }else{
                                            if(winConfigForm[winActiveBlock.focusNow]["BLOCK_TYPE"][1]=="GRANDCHILD"){
                                                isEmpty = true
                                            }
                                        }
                                            
                                            if(isEmpty==true){
                                                webix.confirm({
                                                    title:"Delete Data Confirmation",
                                                    text:pesan,
                                                    cancel:"Batal",
                                                    type:"alert-warning"
                                                }).then(function(result){
                                                    if(result){
                                                        // some action when the alert window is closed
                                                        let blocks = Object.keys(winConfigForm)
                                                        let valuesData = {}
                                                        blocks.forEach(function(block){
                                                                valuesData[block] = {}
                                                                valuesData[block]['blockType'] = "datagrid"
                                                                valuesData[block]['data'] = []
                                                                    
                                                                if(winActiveBlock.focusNow==block){
                                                                    let datadelete = {}
                                                                    winConfigForm[winActiveBlock['focusNow']]['PRIMARY_KEY'].forEach(function(primaryId){
                                                                        datadelete[primaryId] = $$(winActiveBlock['focusNow']).getItem($$(winActiveBlock['focusNow']).getSelectedId(true)[0].row)[primaryId]
                                                                    })
                                                                    
                                                                    let indexObj = blocks.indexOf(winActiveBlock.focusNow)
                                                                    for(let a=0; a<=indexObj; a++){
                                                                    if(winConfigForm[blocks[a]]["BLOCK_TYPE"][0]=="DATAGRID" && winConfigForm[blocks[a]]["BLOCK_TYPE"][1] == "PARENT"){
                                                                            winConfigForm[blocks[a]]["PRIMARY_KEY"].forEach(function(id){
                                                                                datadelete[id] = getItemDt(id)
                                                                            })
                                                                        }
                                                                    }
                                                                    valuesData[block]['data'].push(datadelete)
                                                                }
                                                        })
                                                        restapi.restApiSubmit({'type':'DELETE','menuId':menuId,'data':formatParamAjax(valuesData,"Delete Data")},"Delete Data")
                                                    }
                                                    isEmpty = false
                                                });
                                            }else{
                                                if(!isWebixPopupOpen()){
                                                    webix.alert({
                                                        title:title_alert,
                                                        ok:"OK",
                                                        type:"alert-error",
                                                        text:textWarning,
                                                    }).then(function(result){
                                                        if(result){
                                                            winActiveBlock['lastFocus'] = winActiveBlock['focusNow']
                                                            $$(blockFocusChild).unselectAll()
                                                            $$(blockFocusChild).select($$(blockFocusChild).getFirstId(), winConfigForm[blockFocusChild].PRIMARY_KEY[0])
                                                            webix.UIManager.setFocus(blockFocusChild);
                                                            $$(blockFocusChild).setPage(0);
                                                        }
                                                    })    
                                                }
                                            }
    
                                            
                                    }        
                                    
                                }

                            }else{
                                if($$(window.winActiveBlock['focusNow']).config.view=='datatable'){
                                    if(!winIdOldRecordDt[winActiveBlock['focusNow']].includes(window.winActiveCell.pos.row)){
                                        $$(window.winActiveBlock['focusNow']).unselectAll()
                                        let pesan = "Are you sure to delete this data: <br><br>"
                                        let view = $$(window.winActiveBlock['focusNow']).config.view
                                        if(view=='form'){
                                            pesan += getLabelDeleteButton(winActiveBlock['focusNow'],view)
                                        }else if(view=='datatable'){
                                            if(winConfigForm[winActiveBlock.focusNow]["BLOCK_TYPE"][1]=="PARENT"){
                                                pesan += getLabelDeleteButton(winActiveBlock['focusNow'],view)
                                            }else{
                                                let parentBlockId = getBlockParent()
                                                pesan += getLabelDeleteButton(parentBlockId, $$(parentBlockId).config.view)
                                                pesan += getLabelDeleteButton(winActiveBlock['focusNow'],view)
                                            }
                                        }
                                        if(isGridToGrid && winConfigForm[winActiveBlock.focusNow]['BLOCK_TYPE'][1]==winJenisAddValue){
                                            if(winJenisAddValue=='PARENT'){
                                                pesan += '<br/>'+'Data dari block : '+' '+'<b>'+blockAlert+'</b>'+' '+'akan ikut terhapus!' 
                                            }else if(winJenisAddValue=='CHILD'){
                                                pesan += '<br/>'+'Data dari block : '+' '+'<b>'+statusMasterDetailGridToGrid.grandchild+'</b>'+' '+ 'akan ikut terhapus!' 
                                            }
                                        }
                                        webix.confirm({
                                            title:"Delete Data Insert Confirmation",
                                            text:pesan,
                                            cancel:"Batal",
                                            type:"alert-warning"
                                        }).then(function(result){
                                            if(result){
                                                winValidatePromise = {}
                                                if (winThereIsSubChild) {
                                                    let ChildParent = ''
                                                    let indexDelRecord
                                                    Object.keys(winConfigForm).every(function(blockId){
                                                        if(winConfigForm[blockId]['BLOCK_TYPE'][1]=="SUB_CHILD"){
                                                            if(winConfigForm[blockId]['BLOCK_TYPE'][2]==winActiveBlock['focusNow']){
                                                                ChildParent = winActiveBlock['focusNow']
                                                                let datagridData = $$(winActiveBlock['focusNow']).serialize()
                                                                indexDelRecord = datagridData.findIndex(record => record.id === winActiveCell['pos']['row'])
                                                                return false
                                                            }else{
                                                                ChildParent =  winConfigForm[winActiveBlock['focusNow']]['BLOCK_TYPE'][2] 
                                                                let datagridData = $$(winActiveBlock['focusNow']).serialize()
                                                                indexDelRecord = datagridData.findIndex(record => record.id === winActiveCell['pos']['row'])
                                                                return false
                                                            }
                                                        }
                                                        return true
                                                    })
                                                    
                                                    Object.keys(winConfigForm).forEach(function(blockId){
                                                        if(winConfigForm[blockId]['BLOCK_TYPE'][1]=="SUB_CHILD"){
                                                            if(winConfigForm[blockId]['BLOCK_TYPE'][2]==ChildParent){
                                                                // if(indexDelRecord!=undefined){
                                                                //     winDataChanged[winActiveBlock.focusNow].splice(indexDelRecord, 1);
                                                                // }
    
                                                                deleteRecordFromDataChanged(blockId, indexDelRecord) 
                                                                let datagridData = $$(blockId).serialize()
                                                                let idDelRow = datagridData[indexDelRecord]['id'] 
                                                            
                                                                $$(blockId).remove(idDelRow);
                                                                if (winActiveBlock.focusNow == blockId) {
                                                                    if (!indexDelRecord == 0 ) {   
                                                                        $$(blockId).select(datagridData[indexDelRecord-1].id,$$(blockId).config.columns[0].id)
                                                                    }else if(indexDelRecord == 0 && datagridData.length > 1){
                                                                        $$(blockId).select(datagridData[indexDelRecord+1].id,$$(blockId).config.columns[0].id)
                                                                    }
                                                                }
                                                                
                                                                // let row_id = $$(blockId).getLastId();
                                                                // $$(blockId).select(row_id,$$(blockId)['config']['columns'][0]['id'], false)
                                                            }
                                                        }
                                                        if(blockId == ChildParent){
                                                            // Fungsi Menghapus WinDataChanges SubChild    
                                                            deleteRecordFromDataChanged(ChildParent, indexDelRecord)
                                                            let datagridData = $$(ChildParent).serialize()
                                                            let idDelRow = datagridData[indexDelRecord]['id'] 
                                                            
                                                            $$(ChildParent).remove(idDelRow);
                                                            if (winActiveBlock.focusNow == ChildParent) {
                                                                if (!indexDelRecord == 0 ) {   
                                                                    $$(ChildParent).select(datagridData[indexDelRecord-1].id,$$(ChildParent).config.columns[0].id)
                                                                }else if(indexDelRecord == 0 && datagridData.length > 1){
                                                                    $$(ChildParent).select(datagridData[indexDelRecord+1].id,$$(ChildParent).config.columns[0].id)
                                                                }
                                                            }
                                                        }
                                                    })
                                                }else{
                                                    let idDelRow = winActiveCell.pos.row
                                                    let indxDelRow
                                                    if(isGridToGrid){
                                                        if(winConfigForm[winActiveBlock.focusNow]['BLOCK_TYPE'][1] == 'PARENT' && winJenisAddValue == 'PARENT'){
                                                            $$(statusMasterDetailGridToGrid.child).clearAll()
                                                            winDataChanged[statusMasterDetailGridToGrid.child] = [] 
                                                            $$('addRowDb').show();
                                                            haveRowAdded = false
                                                        }else if(winConfigForm[winActiveBlock.focusNow]['BLOCK_TYPE'][1] == 'CHILD' && winJenisAddValue == 'CHILD'){
                                                            if (statusMasterDetailGridToGrid.grandchild != "") {
                                                                $$(statusMasterDetailGridToGrid.grandchild).clearAll()
                                                                winDataChanged[statusMasterDetailGridToGrid.grandchild] = [] 
                                                                $$('addRowDb').show();
                                                                haveRowAdded = false
                                                            }
                                                        }
                                                    }
                                                    winDataChanged[winActiveBlock.focusNow].every(function(recordInsert){
                                                        if(recordInsert.id==idDelRow){
                                                            indxDelRow = winDataChanged[winActiveBlock.focusNow].indexOf(recordInsert)
                                                            return false
                                                        }
                                                        return true
                                                    })
                                                    if(indxDelRow!=undefined){
                                                        winDataChanged[winActiveBlock.focusNow].splice(indxDelRow, 1);
                                                    }
                                                    $$(window.winActiveBlock['focusNow']).remove(winActiveCell.pos);
                                                    let row_id = $$(window.winActiveBlock['focusNow']).getLastId();
                                                    $$(window.winActiveBlock['focusNow']).select(row_id,$$(window.winActiveBlock['focusNow'])['config']['columns'][0]['id'], false)


                                                }

                                            }
                                        });
                                    }else{
                                        webix.message({
                                                text:"Cannot delete existing record in database on Add Mode",
                                                type:"debug", 
                                                expire: 10000,
                                            });
                                    }
                                }
                            }
                            
                        }
                    // }catch(err){
                    //     $$(menuId).showProgress({type:"icon",hide:true});//loading
                    //     $$(menuId).disable()//enable
                    //     webix.message({
                    //         text:"Error Detected, please capture this error and contact IT HO: <br><br>Error: JS - Element - DeleteButton - "+err,
                    //         type:"error", 
                    //         expire: 10000,
                    //     });
                    //     //console.log("JS - Element - DeleteButton - Error: ",err)
                    // }
                }
            },
            hidden:hideButton[id]})
        return deleteBtn
    }

    //=============================================================
    //======================BUTTON REPORT==========================
    //=============================================================
    PRINTBUTTON(id,idForm,label, functionValidate){
        let customLabel = label || "EXPORT DATA"
        let printBtn = this.NORMALBUTTON(id,customLabel,(function(){}),{})
        printBtn = Object.assign(printBtn, {"width": 150,css:"webix_primary", "on":{
                onItemClick:function(){
                    // try{
                        if ($$(idForm).validate()){

                            let validatePrintButton = function(){
                                let promise = new Promise((resolve)=>{
                                    if(functionValidate != undefined){
                                        resolve(functionValidate())
                                    }
                                    resolve({"status":true})
                                })
                                return promise
                            }
                            validatePrintButton().then(function (respond) {
                                if(respond.status){
                                    let blocks = Object.keys(winConfigForm)
                                    let valuesData = {} 
                                    blocks.forEach(function(block){
                                        if($$(block).config.view=="form"){
                                            let valuesForm = ""
                                            if(blocks.length==1){
                                                valuesForm = $$(block).getValues()
                                            }else if(blocks.length>1){
                                                if(window.winJenisAddValue=="PARENT"){
                                                    valuesForm = $$(block).getValues()
                                                }else if(window.winJenisAddValue=="CHILD"){
                                                    valuesForm = null
                                                }else if(window.winJenisAddValue==""){
                                                    valuesForm = $$(block).getValues()
                                                }
                                            }
                                            if (valuesForm == null){
                                                valuesForm = []
                                            }else{
                                                if(afterInsertHead){
                                                    valuesForm = []
                                                }else{
                                                    valuesForm = [valuesForm]
                                                }   
                                            }
                                            valuesData[block] = {}
                                            valuesData[block]['blockType'] = "form"
                                            valuesData[block]['data'] = valuesForm
                                        }else if($$(block).config.view=="datatable"){
                                            
                                            valuesData[block] = {}
                                            valuesData[block]['blockType'] = "datagrid"
                                            valuesData[block]['data'] = window.winDataChanged[block]
                                        }
                                    })
                                    let dataParam = {}
                                    dataParam.type = "REPORT"
                                    dataParam.menuId = menuId
                                    // console.log(webix.copy(valuesData))
                                    dataParam.data = formatParamAjax(valuesData,"Print Data")
                                    dataParam.apiName = menuId+"_geturlPrintReport"
                                    console.log("dataParam",dataParam);
                                    
                                    webix.ajax().headers({'Content-Type':'application/json'}).get("/",dataParam).then(function(data){
                                        let status = data.json().status
                                        if(status){
                                            window.open(data.json().url, '_blank');
                                        }
                                        else{
                                            RMSGBOX(data.json().msg)
                                        }
                                    }).fail(function(xhr){
                                        webix.message(data.json().message);
                                    });
                                }else{
                                    if(!isWebixPopupOpen()){
                                        webix.alert(ALERT.ALERTWARNING(respond.pesan))
                                    }
                                }
                            })
                            
                        }    
                    // }catch(err){
                    //     $$(menuId).showProgress({type:"icon",hide:true});//loading
                    //     $$(menuId).disable()//enable
                    //     webix.message({
                    //         text:"Error Detected, please capture this error and contact IT HO: <br><br>Error: JS - Element - PrintButton - "+err,
                    //         type:"error", 
                    //         expire: 10000,
                    //     });
                    //     //console.log("JS - Element - PrintButton - Error: ",err)
                    // }
                    
                }
            }
        })
        printBtn = {rows:[{height:23},printBtn]} 
        window.winButtonCallForm.push(id)
        additionalMultiLanguage.push(id)
        return printBtn;
    }

    CLEARBUTTONRPT(id,idForm){
        let clrBtn = this.NORMALBUTTON(id,"CLEAR FILTER",(function(){}),{})
        clrBtn = Object.assign(clrBtn, {"width": 150, "on":{
                onItemClick:function(){
                    $$(idForm).clear();
                }
            }})
        clrBtn = {rows:[{height:23},clrBtn]} 
        additionalMultiLanguage.push(id)
        return clrBtn;
    }

    CUSTOMBUTTON(property, trigger){
        let id = property.ITEM_ID
        let label = property.LABEL
        let callForm = property.CALL_FORM || false
        let customWidth = property.CUSTOM_WIDTH || undefined
        let triggerOnClick = trigger.CUSTOM_CLICK
        let disabledBtn = property.DISPLAY_ITEM || false
        let customBtnForm = {
            "id": id, "name": id, "value": label, "view": "button", css: "webix_primary", width:customWidth||150 ,"call_form":callForm,
            // width:150,
            height:38, disabled:disabledBtn,
            "on": {
                onItemClick:function(){
                    triggerOnClick()
                },
                onKeyPress:base.baseCommonKeyPress(),
            },
        }
        customBtnForm = {rows:[customBtnForm]} 
        if(callForm){
            window.winButtonCallForm.push(id)
        }

        if(disabledBtn){
            window.winDisabledButton.push(id)
        }
        additionalMultiLanguage.push(property.ITEM_ID)
        return customBtnForm
    }

    MULTISELECTBUTTON(property, trigger){
        let id = property.ITEM_ID
        let idLov = property.WINDOW_ID
        let label = property.LABEL
        let customWidth = property.CUSTOM_WIDTH || undefined
        let disabledBtn = property.DISPLAY_ITEM || false
        let customBtnForm = {
            "id": id, "name": id, "value": label, "view": "button", css: "webix_primary", width:customWidth||150 ,"call_form":callForm,
            // width:150,
            height:38, disabled:disabledBtn,
            "on": {
                onItemClick:function(){
                    let blockActiveLov = ''
                    Object.keys(winConfigForm).forEach(function (block) {
                        if(winConfigForm[block]["ELEMENT"].includes(id)){
                            blockActiveLov = block
                        }
                    })
                    if(!winAddData){
                        if(winActiveBlock.focusNow != blockActiveLov){
                            webix.UIManager.setFocus(blockActiveLov)
                        }
                        $$("addValue").callEvent("onItemClick")
                        $$(blockActiveLov).detachEvent("onAfterAdd")
                        $$(blockActiveLov).attachEvent("onAfterAdd", function(){
                            $$(blockActiveLov).remove($$(blockActiveLov).getLastId())
                            $$(blockActiveLov).unselectAll()
                        })
                    }else{
                        if(winDataDtSelect[blockActiveLov].length == 0){
                            hideOverlay(blockActiveLov)
                            
                        }
                    }
                    $$(blockActiveLov).unselectAll()
                    $$(idLov+"multiselect").show()
                    
                    $$(id).blur()
                },
            },
        }
        customBtnForm = {rows:[customBtnForm]} 

        if(disabledBtn){
            window.winDisabledButton.push(id)
        }
        return customBtnForm
    }
}

var base = new Base();
var TEXTBOX = new TextBox(); //on going
var NUMERIC = new Numeric(); //on going
var DATE = new Calendar(); //on going
var DATATABLES = new Datatable();
var RADIO = new Radio(); //on going
var CHECKBOX = new Checkbox(); //on going
var ALERT = new Alert();
var COMBO = new Combo(); //on going
var CUSTOM = new Custom();
var BUTTON = new Button();
var LOVFIELD = new LOV(); //on going
var PAGING = new Pager();
var LISTVIEW = new ListView();
var PICTURE = new Picture();