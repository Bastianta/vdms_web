/*
	JS-Oden-Stable V.1
	Update : 2025-05-19
	Common Library - datatable.js
		Update : 
			- New Layouting Oden (Form)
*/

window.winActiveCell = "";
window.winValOld = "";
window.winDataChanged = {};
window.winPagerDatatable = {};
window.winIdAttach = [];
window.winIdOldRecordDt = {}
window.winNewDataDt = {}
window.winDataAwalDt = {}
window.winAllowEditCell = true
window.winIdOldRecordDt = {}
window.winPagerDatatable = {}
window.winTotalRecordDt = {}
window.winHideColumnsDt = {}
window.winOperatorDt = {}
window.winValidatePromise = {}
window.winFooterCustomFunction = {}
window.invalidColumnsDt = []
window.oldUpdatedCell = {}
var oldValueCombo = ""
var popUpTextAreaDt = false
var idPopUp = []
var winChangedRecord = {}
window.winFailedValidateItem = {}
var collectWidthTable = {}
var widthCustomDt = {}
var onAfterRenderDt = {}

let isBlockValidated = function (block) {
    if (($$(block).validate()==false||$$(block).validate()==''||$$(block).validate()==undefined)) {
        return false
    }else{
        return true
    }
    

}

let checkFailedValidateItem = function (statusValidate,block,row,col) {
    // The purpose of this function is to set the row error validate item in that block (checking run in Grid to Grid)
    if (statusValidate) {
        if (Object.keys(winFailedValidateItem[block]).length != 0) {
            winFailedValidateItem[block] = {}
        }
    }else{
        if (Object.keys(winFailedValidateItem[block]).length == 0) {
            winFailedValidateItem[block] = {'row':row,'column':col}
        }
    }
}

let validateUpdateGridToGrid = function(view, onlyCheck=false){
    let statusValidateUpdate = true
    let blockName = view.config.id
    let lastIndexDataChanged = 0
    let lastDataChanged;
    if(winDataChanged[statusMasterDetailGridToGrid.parent].length != 0){
        // KETIKA UPDATE DI LEVEL 1 TAPI LANGSUNG DOUBLE KLIK DI LEVEL 3
        // TODO: LOCK FOCUS
        
        if(view.config.id == statusMasterDetailGridToGrid.grandchild){
            $$(statusMasterDetailGridToGrid.grandchild).unselect();
            $$(statusMasterDetailGridToGrid.grandchild).clearSelection();
            webix.html.removeCss($$(statusMasterDetailGridToGrid.grandchild).getNode(), "datablock-focus")
            $$(statusMasterDetailGridToGrid.grandchild).removeCss(winActiveCell.pos.row, "highlight-focus-row")
            
            winActiveBlock.focusNow = statusMasterDetailGridToGrid.parent
            winActiveCell = {'pos': $$(statusMasterDetailGridToGrid.parent).getSelectedId(), 'view': $$(statusMasterDetailGridToGrid.parent)}
            
            webix.UIManager.setFocus($$(statusMasterDetailGridToGrid.parent))
            validateAndFocus(statusMasterDetailGridToGrid.parent)

            statusValidateUpdate = false
        }
    }else if(winDataChanged[statusMasterDetailGridToGrid.child].length != 0){
        // KETIKA UPDATE DI LEVEL 2
        if(winDataChanged[statusMasterDetailGridToGrid.parent].length != 0){
            // SUDAH PASTI UPDATE DI LEVEL 1 DAN 2
            if(view.config.id == statusMasterDetailGridToGrid.grandchild){
                $$(statusMasterDetailGridToGrid.grandchild).unselect();
                $$(statusMasterDetailGridToGrid.grandchild).clearSelection();
                webix.html.removeCss($$(statusMasterDetailGridToGrid.grandchild).getNode(), "datablock-focus")
                $$(statusMasterDetailGridToGrid.grandchild).removeCss(winActiveCell.pos.row, "highlight-focus-row")
                
                winActiveBlock.focusNow = statusMasterDetailGridToGrid.child
                winActiveCell = {'pos': $$(statusMasterDetailGridToGrid.child).getSelectedId(), 'view': $$(statusMasterDetailGridToGrid.child)}
                
                webix.UIManager.setFocus($$(statusMasterDetailGridToGrid.child))
                validateAndFocus(statusMasterDetailGridToGrid.child)

                statusValidateUpdate = false
            }
        }else if(statusMasterDetailGridToGrid.grandchild != "" && winDataChanged[statusMasterDetailGridToGrid.grandchild].length != 0){
            // SUDAH PASTI UPDATE DI LEVEL 2 DAN 3
            if(view.config.id == statusMasterDetailGridToGrid.parent){
                $$(statusMasterDetailGridToGrid.parent).unselect();
                $$(statusMasterDetailGridToGrid.parent).clearSelection();
                webix.html.removeCss($$(statusMasterDetailGridToGrid.parent).getNode(), "datablock-focus")
                $$(statusMasterDetailGridToGrid.parent).removeCss(winActiveCell.pos.row, "highlight-focus-row")
                
                winActiveBlock.focusNow = statusMasterDetailGridToGrid.grandchild
                winActiveCell = {'pos': $$(statusMasterDetailGridToGrid.grandchild).getSelectedId(), 'view': $$(statusMasterDetailGridToGrid.grandchild)}
                
                webix.UIManager.setFocus($$(statusMasterDetailGridToGrid.grandchild))
                validateAndFocus(statusMasterDetailGridToGrid.grandchild)

                statusValidateUpdate = false
            }
        }
    }else if(statusMasterDetailGridToGrid.grandchild != "" && winDataChanged[statusMasterDetailGridToGrid.grandchild].length != 0){
        // KETIKA UPDATE DI LEVEL 3
        if(winDataChanged[statusMasterDetailGridToGrid.child].length != 0){
            // SUDAH PASTI UPDATE DI LEVEL 2 DAN 3
            if(view.config.id == statusMasterDetailGridToGrid.parent){
                $$(statusMasterDetailGridToGrid.parent).unselect();
                $$(statusMasterDetailGridToGrid.parent).clearSelection();
                webix.html.removeCss($$(statusMasterDetailGridToGrid.parent).getNode(), "datablock-focus")
                $$(statusMasterDetailGridToGrid.parent).removeCss(winActiveCell.pos.row, "highlight-focus-row")
                
                winActiveBlock.focusNow = statusMasterDetailGridToGrid.grandchild
                winActiveCell = {'pos': $$(statusMasterDetailGridToGrid.grandchild).getSelectedId(), 'view': $$(statusMasterDetailGridToGrid.grandchild)}
                
                webix.UIManager.setFocus($$(statusMasterDetailGridToGrid.grandchild))
                validateAndFocus(statusMasterDetailGridToGrid.grandchild)

                statusValidateUpdate = false
            }
        }
    }

    if(onlyCheck == true){
        return statusValidateUpdate;
    }
    
    if(statusValidateUpdate == true && onlyCheck == false){
        lastIndexDataChanged = winDataChanged[blockName].length - 1;
        lastDataChanged = winDataChanged[blockName][lastIndexDataChanged];
        if(winConfigForm[blockName]['BLOCK_TYPE'][1] == 'PARENT'){
            // KALO EDIT PARENT (LEVEL 1), SUDAH PASTI HANYA BOLEH KE CHILD (LEVEL 2)
            let childBlockName = statusMasterDetailGridToGrid.child;
            let grandchildBlockName = statusMasterDetailGridToGrid.grandchild;
           
            // lastDataChanged = data yg diedit di block yang sedang fokus
            if(lastDataChanged){
                // KETIKA BLOCK LEVEL 1 SUDAH DIEDIT
                if(childBlockName != '' && winDataChanged[childBlockName].length > 0){
                    // KETIKA LEVEL 2 DIEDIT
                    if(winActiveCell.pos.row != lastDataChanged.id){
                        // KETIKA LEVEL 1 DIEDIT --> LEVEL 2 DIEDIT --> PINDAH KE BLOCK LAIN
                        if(winDataChanged[blockName].length > 0 && isBlockValidated(blockName) == false){
                            // KETIKA PINDAH KE LEVEL 3
                            if(!isWebixPopupOpen()){
                                webix.alert(ALERT.ALERTWARNING("Hanya boleh update 2 level block"))
                            }
                            return false
                        }else if(winDataChanged[blockName].length > 0 && isBlockValidated(blockName) == true){
                            // KETIKA PINDAH KE LEVEL 1 TAPI BEDA ROW
                            webix.confirm(ALERT.ALERTWARNING(`Terdapat perubahan pada block ${childBlockName}. Apakah Anda ingin menyimpan perubahan?`)).then(function (result) {
                                if(result){
                                    $$('updateValue').callEvent("onItemClick")
                                    $$(blockName).select(oldUpdatedCell[blockName].pos.row)
                                    $$(blockName).addRowCss(oldUpdatedCell[blockName].pos.row, "highlight-focus-row")

                                    $$(blockName).removeRowCss(winActiveCell.pos.row, "highlight-focus-row")
                                    $$(blockName).unselect();
                                }else{
                                    
                                    $$(blockName).removeRowCss(winActiveCell.pos.row, "highlight-focus-row")
                                    $$(blockName).unselect();
                                    $$(blockName).select(oldUpdatedCell[blockName].pos.row)
                                    $$(blockName).addRowCss(oldUpdatedCell[blockName].pos.row, "highlight-focus-row")
                                    // webix.html.removeCss($$(blockName).getNode(), "datablock-focus")

                                    if(lastDataChanged.id){
                                        $$(blockName).select(lastDataChanged.id)
                                        $$(blockName).addRowCss(lastDataChanged.id, "highlight-focus-row")
                                    }

                                    window.winActiveBlock.focusNow = childBlockName
                                    webix.UIManager.setFocus($$(childBlockName))
                                    winActiveCell = winActiveCellBlockOld
                                    
                                    winConfigForm[childBlockName]['WIN_ACTIVE_CELL_BLOCK'] =  $$(childBlockName).getSelectedId()
                                    return false
                                }
                            })
                            return false
                        }
                    }else{
                        return false
                    }
                }
            }else{
                // KETIKA BLOCK LEVEL 1 TIDAK DIEDIT
                if(winDataChanged[childBlockName].length > 0 && isBlockValidated(childBlockName) == true){
                    // KETIKA LEVEL 2 DIEDIT
                    webix.confirm(ALERT.ALERTWARNING(`Terdapat perubahan pada block ${childBlockName}. Apakah Anda ingin menyimpan perubahan?`)).then(function (result) {
                        if(result){
                            $$('updateValue').callEvent("onItemClick")
                            $$(blockName).select(oldUpdatedCell[blockName].pos.row)
                            $$(blockName).addRowCss(oldUpdatedCell[blockName].pos.row, "highlight-focus-row")

                            $$(blockName).removeRowCss(winActiveCell.pos.row, "highlight-focus-row")
                            $$(blockName).unselect();
                        }else{
                            let lastIndexDataChanged = winDataChanged[blockName].length - 1
                            let lastDataChanged = winDataChanged[blockName][lastIndexDataChanged]

                            $$(blockName).removeRowCss(winActiveCell.pos.row, "highlight-focus-row")
                            $$(blockName).unselect();
                            $$(blockName).select(oldUpdatedCell[blockName].pos.row)
                            $$(blockName).addRowCss(oldUpdatedCell[blockName].pos.row, "highlight-focus-row")
                            webix.html.removeCss($$(blockName).getNode(), "datablock-focus")
                            webix.UIManager.setFocus($$(childBlockName))


                            $$(childBlockName).select(lastDataChanged.id, lastDataChanged.column)
                            $$(childBlockName).addRowCss(lastDataChanged.id, "highlight-focus-row")

                            window.winActiveBlock.focusNow = childBlockName
                            winActiveCell = winActiveCellBlockOld

                            winConfigForm[childBlockName]['WIN_ACTIVE_CELL_BLOCK'] =  $$(childBlockName).getSelectedId()
                            return false
                        }
                    })
                    return false
                }
            }
            
        }else if(winConfigForm[blockName]['BLOCK_TYPE'][1] == 'CHILD'){
            let parentBlockName = statusMasterDetailGridToGrid.parent;
            let childBlockName = statusMasterDetailGridToGrid.child;
            let grandChildBlockName = statusMasterDetailGridToGrid.grandchild;
            
            if(lastDataChanged){        
                // KETIKA LEVEL 2 DIEDIT 
                if(grandChildBlockName != '' && winDataChanged[grandChildBlockName].length > 0){
                    // KETIKA LEVEL 3 DIEDIT
                    if(winActiveCell.pos.row != lastDataChanged.id){
                        // KETIKA LEVEL 2 DIEDIT --> LEVEL 3 DIEDIT --> PINDAH KE BLOCK LAIN
                        if(winDataChanged[blockName].length > 0 && isBlockValidated(blockName) == false){
                            if(!isWebixPopupOpen()){
                                webix.alert(ALERT.ALERTWARNING("Hanya boleh update 2 level block"))
                            }
                            return false
                        }else if(winDataChanged[blockName].length > 0 && isBlockValidated(blockName) == true){
                            webix.confirm(ALERT.ALERTWARNING(`Terdapat perubahan pada block ${grandChildBlockName}. Apakah Anda ingin menyimpan perubahan?`)).then(function (result) {
                                if(result){
                                    $$('updateValue').callEvent("onItemClick")
                                    $$(blockName).select(oldUpdatedCell[blockName].pos.row)
                                    $$(blockName).addRowCss(oldUpdatedCell[blockName].pos.row, "highlight-focus-row")

                                    $$(blockName).removeRowCss(winActiveCell.pos.row, "highlight-focus-row")
                                    $$(blockName).unselect();
                                }else{
                                    
                                    $$(blockName).removeRowCss(winActiveCell.pos.row, "highlight-focus-row")
                                    $$(blockName).unselect();
                                    $$(blockName).select(oldUpdatedCell[blockName].pos.row)
                                    $$(blockName).addRowCss(oldUpdatedCell[blockName].pos.row, "highlight-focus-row")
                                    webix.html.removeCss($$(blockName).getNode(), "datablock-focus")

                                    if(lastDataChanged.id){
                                        $$(blockName).select(lastDataChanged.id)
                                        $$(blockName).addRowCss(lastDataChanged.id, "highlight-focus-row")
                                    }

                                    // $$(grandChildBlockName).select(lastDataChanged.id, lastDataChanged.column)
                                    // $$(grandChildBlockName).addRowCss(lastDataChanged.id, "highlight-focus-row")
                                    window.winActiveBlock.focusNow = grandChildBlockName
                                    webix.UIManager.setFocus($$(grandChildBlockName))
                                    winActiveCell = winActiveCellBlockOld

                                    winConfigForm[grandChildBlockName]['WIN_ACTIVE_CELL_BLOCK'] =  $$(grandChildBlockName).getSelectedId()
                                    return false
                                }
                            })
                            return false
                        }
                    }else{
                        return false
                    }
                } 
            }else{
                // KETIKA LEVEL 3 DIEDIT TANPA EDIT LEVEL 2
                if(grandChildBlockName != "" && winDataChanged[grandChildBlockName].length > 0 && isBlockValidated(grandChildBlockName) == true){
                    webix.confirm(ALERT.ALERTWARNING(`Terdapat perubahan pada block ${grandChildBlockName}. Apakah Anda ingin menyimpan perubahan?`)).then(function (result) {
                        if(result){
                            $$('updateValue').callEvent("onItemClick")
                            $$(blockName).select(oldUpdatedCell[blockName].pos.row)
                            $$(blockName).addRowCss(oldUpdatedCell[blockName].pos.row, "highlight-focus-row")

                            $$(blockName).removeRowCss(winActiveCell.pos.row, "highlight-focus-row")
                            $$(blockName).unselect();
                        }else{
                            let lastIndexDataChanged = winDataChanged[blockName].length - 1
                            let lastDataChanged = winDataChanged[blockName][lastIndexDataChanged]

                            $$(blockName).removeRowCss(winActiveCell.pos.row, "highlight-focus-row")
                            $$(blockName).unselect();
                            $$(blockName).select(oldUpdatedCell[blockName].pos.row)
                            $$(blockName).addRowCss(oldUpdatedCell[blockName].pos.row, "highlight-focus-row")
                            webix.UIManager.setFocus($$(grandChildBlockName))

                            // webix.html.removeCss($$(blockName).getNode(), "datablock-focus")

                            $$(grandChildBlockName).select(lastDataChanged.id, lastDataChanged.column)
                            $$(grandChildBlockName).addRowCss(lastDataChanged.id, "highlight-focus-row")

                            window.winActiveBlock.focusNow = grandChildBlockName
                            winActiveCell = winActiveCellBlockOld

                            winConfigForm[grandChildBlockName]['WIN_ACTIVE_CELL_BLOCK'] =  $$(grandChildBlockName).getSelectedId()
                            return false
                        }
                    })
                    return false
                }
            }
            
        }else if(winConfigForm[blockName]['BLOCK_TYPE'][1] == 'GRANDCHILD'){
            
        }
    }else{
        // KETIKA LEVEL 2 DAN LEVEL 3 DIUPDATE LALU KE LEVEL 1
        if(winDataChanged[statusMasterDetailGridToGrid.parent].length > 0 || winDataChanged[statusMasterDetailGridToGrid.child].length > 0 || winDataChanged[statusMasterDetailGridToGrid.grandchild].length > 0){
            let changedBlock = [];
            Object.keys(winDataChanged).every(function (blockId){
                if(winDataChanged[blockId].length > 0){
                    changedBlock.push(blockId)
                }
                return true
            })
            
            webix.confirm(ALERT.ALERTWARNING(`Terdapat perubahan pada block ${changedBlock.toString()}. Apakah Anda ingin menyimpan perubahan?`)).then(function (result) {
                if(result){
                    $$('updateValue').callEvent("onItemClick")
                    $$(blockName).select(oldUpdatedCell[blockName].pos.row)
                    $$(blockName).addRowCss(oldUpdatedCell[blockName].pos.row, "highlight-focus-row")

                    $$(blockName).removeRowCss(winActiveCell.pos.row, "highlight-focus-row")
                    $$(blockName).unselect();
                }else{
                    let lastIndexDataChanged = winDataChanged[changedBlock[0]].length - 1
                    let lastDataChanged = winDataChanged[changedBlock[0]][lastIndexDataChanged]

                    $$(blockName).removeRowCss(winActiveCell.pos.row, "highlight-focus-row")
                    $$(blockName).unselect();
                    $$(blockName).select(oldUpdatedCell[blockName].pos.row)
                    $$(blockName).addRowCss(oldUpdatedCell[blockName].pos.row, "highlight-focus-row")
                    // webix.html.removeCss($$(blockName).getNode(), "datablock-focus")

                    $$(changedBlock[0]).select(lastDataChanged.id, lastDataChanged.column)
                    $$(changedBlock[0]).addRowCss(lastDataChanged.id, "highlight-focus-row")

                    window.winActiveBlock.focusNow = changedBlock[0]
                    webix.UIManager.setFocus($$(changedBlock[0]))
                    winActiveCell = winActiveCellBlockOld

                    winConfigForm[changedBlock[0]]['WIN_ACTIVE_CELL_BLOCK'] =  $$(changedBlock[0]).getSelectedId()
                    return false
                }
            })
            return false
        }
    }
    return true;
}


// Function to validate and focus on the first invalid cell
let validateAndFocus = function(idDatatable){
    const table = $$(idDatatable); // Replace 'datatable' with your actual ID
    const data = table.serialize(); // Get all rows as an array of objects
    const columns = table.config.columns; // Get the column configuration 
    const rules = table.config.rules; // Access the rules defined in the DataTable

    // Iterate through rows
    for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
        const row = data[rowIndex]; // Get the current row

        // Iterate through columns
        for (let colIndex = 0; colIndex < columns.length; colIndex++) {
            const column = columns[colIndex];
            const columnId = column.id;

            // Check if there is a rule for this column
            if (rules && rules[columnId]) {
                const isValid = rules[columnId](row[columnId]); // Validate the cell

                if (rules && rules[columnId]) {
                    const isValid = rules[columnId](row[columnId]); // Validate the cell
    
                    if (!isValid) {
                        if(!isWebixPopupOpen()){
                            webix.alert(ALERT.ALERTWARNING('Error Validate pada Block '+window.winActiveBlock["focusNow"]+' <br> <b>'+column.header[0]['text']+'</b>')).then(function(){
                                winOpenPopUp="closed"
                                // Validation failed, focus on the cell
                                table.editCell(row.id, columnId);
                            })
                        }
                        return; // Exit after focusing the first invalid cell
                    }
                }
            }
        }
    }
    // webix.message("All data is valid!");
};

// Call this function after block.validate() returns false
// validateAndFocus();



function onClickLOVCell(obj,rowCell,columnCell){
    let view = $$(getBlockItem(columnCell))
    view.unselectAll()
    view.select(rowCell,columnCell)
    winValidateItemPos = winActiveCell
    let editCellAddData = true
    if(view.getColumnConfig(columnCell).preItem){
        if(!view.getColumnConfig(columnCell).preItem()){
            editCellAddData = false
            view.editCancel();
        }else{
            editCellAddData = true
        }
    }else{
        editCellAddData = true
    }
    if(window.winAddData){
        for (let x=0; x<window.winIdOldRecordDt[winActiveBlock.focusNow].length; x++){
            if(window.winIdOldRecordDt[winActiveBlock.focusNow][x]==rowCell){
                editCellAddData = false
                break;
            }
        }
    }
    
    if (!winAddData) {
        if(winConfigForm[view.config.id]['PRIMARY_KEY'].includes(columnCell) && !winSearchMode){
            editCellAddData = false
        }
    }
    if(editCellAddData){
        if(openHTTPs == 0){
            let thisColumn = $$(winActiveBlock.focusNow).getColumnConfig(winActiveCell.pos.column)
            if(thisColumn.restApiLov !=""){
                thisColumn.restApiLov()
            }
            window.winOpenPopUp = "open";
            window.winOldCellLov = $$(view.config.id).getItem(window.winActiveCell['pos'].row)[window.winActiveCell['pos'].column]
            window.winActiveBlock['lastFocus'] = window.winActiveBlock['focusNow'] 
            window.winActiveBlock['focusNow'] = thisColumn.wdLOV
            $$(window.winActiveBlock['lastFocus']).editCancel();
            $$(thisColumn.wdLOV).show()
        }else{
            webix.message({
                text:"Please wait, <br> validating your request, please click the icon again.",
                type:"info", 
                expire: 2000,
            });
        }
    }
}

function hideColumnsDatagrids(){
    Object.keys(winHideColumnsDt).forEach(function(block){
        if(winHideColumnsDt[block].length!=0){
            winHideColumnsDt[block].forEach(function(idCols){
                $$(block).hideColumn(idCols)
            })
        }
        $$(block).hideColumn("action_"+block)
    })
}

function cekDate(value,format){
    let dateString = moment(value, format).format()
    let dateObject = new Date(dateString)
    if (!isNaN(dateObject.getTime())){
        return moment(dateObject).format(format)
    }else{
        return null
    }
}

function getRulesNotNull(rulesId){
    let rulesFix = {};
    for (let i = 0; i < rulesId.length; i++) {
        rulesFix[rulesId[i]] = webix.rules.isNotEmpty
    }
    return rulesFix
}

function updateFooterDatagrid(idTable){
    let dtTable = $$(idTable)
    let promiseAll = []
    let columnFooter = []
    
    for (let column of dtTable.config.columns) {
        if(column.customFooter!=undefined){
            columnFooter.push(column)
            promiseAll.push(updateFooterDt(dtTable,column))
        }
    }

    Promise.all(promiseAll).then(function(respond){
        let level = 0
        respond.forEach(function(result,index){
            columnFooter[index]['footer']=result
            if(result.length>level){
                level = result.length
                dtTable.define("footerLevel",result.length) 
                dtTable.define("height",dtTable.$height+=(result.length*43))
            }
        })
        dtTable.refreshColumns();
        // dtTable.resize()
    })
}


function deleteRecordFromDataChanged(blockId, indexDelRecord) {

    // ^ PENJELASAN FUNGSI
    // ------------------------------------------------------
    // ^ Fungsi ini digunakan untuk menghapus tempat tampungan data atau winDataChanged.
    // ^ blockId -> nama block yang akan dihapus winDataChanged nya
    // ^ indexDelRecord -> index record datagrid yang ingin di hapus dari data changed



    let idDelRow = $$(blockId).serialize()[indexDelRecord]['id'];
    let indxDelRow;

    winDataChanged[blockId].every(function (recordInsert) {
        if (recordInsert.id === idDelRow) {
            indxDelRow = winDataChanged[blockId].indexOf(recordInsert);
        }
        if (indxDelRow !== undefined) {
            winDataChanged[blockId].splice(indxDelRow, 1);
            return false;
        }
        return true;
    });
}

function checkToDatachanged(param) {

    // param = rowId, columnId, datarow
    let blocks = Object.keys(winConfigForm)
    let idBaru = true;
    let activeCellRow
    let blockActive = param.blockActive || winActiveBlock.focusNow
    let indexRecord = undefined

    if (param.dataRow != undefined) {
        winDataRow = param.dataRow
        activeCellRow = param.dataRow.id
    } else {
        winDataRow = $$(blockActive).getItem(param.rowId)
        activeCellRow = winActiveCell.pos.row
    }
    function formatDateDtRow(id,item,type) {
        let maxLengthItem = 0
        if (type == 'FORM') {
            maxLengthItem = item.attributes.maxLength
        }else{
            maxLengthItem = item.maxLength
        }

        if (window.winDateType.includes(id) || window.winDateTypeMMYY.includes(id)){
            if(window.winDataRow[id].length != maxLengthItem){
                window.winDataRow[id] = window.winDataRow[id].split("-").reverse().join("-");
                window.winDataRow[id] = window.winDataRow[id].substring(window.winDataRow[id].length-maxLengthItem)
                if(window.winDateTypeMMYY.includes(id)){
                    window.winDataRow[id]=window.winDataRow[id]+"-01"
                }
            }
            if(window.winDataRow[id].length==maxLengthItem && window.winDataRow[id].split("-").length>1 && window.winDataRow[id].split("-")[0].length==4){
                window.winDataRow[id] = window.winDataRow[id].split("-").reverse().join("-");
            } 
        }else if(window.winDateTypeYY.includes(id)){
            window.winDataRow[id]=window.winDataRow[id]+"-01-01"
        }
    }
    
    if(window.winDataChanged[blockActive]!=undefined){
        if (window.winDataChanged[blockActive].length != 0) {
            for (var i in window.winDataChanged[blockActive]) {
                if (window.winDataChanged[blockActive][i].id == window.winDataRow.id) {
                    
                    indexRecord = i
                    let indexObj = blocks.indexOf(blockActive)
                    
                    for(let a=0; a<=indexObj; a++){
                        if (winConfigForm[blocks[a]]['BASE_TABLE'] == undefined){
                            winConfigForm[blocks[a]]['BASE_TABLE'] = true
                        }
                        if(winConfigForm[blocks[a]]['BLOCK_TYPE'][0]=="FORM"  && winConfigForm[blocks[a]]['BASE_TABLE']){
                            let typeBlock = winConfigForm[blocks[a]]['BLOCK_TYPE'][0]
                            winConfigForm[blocks[a]]["PRIMARY_KEY"].forEach(function(id){
                                let item = $$(id).config
                                window.winDataRow[id] = $$(id).getValue()
                                formatDateDtRow(id,item,typeBlock)
                            })
                            winConfigForm[blockActive]["RELATION_KEY"].forEach(function(id){
                                let item = $$(id).config
                                window.winDataRow[id] = $$(id).getValue()
                                formatDateDtRow(id,item,typeBlock)
                            })
                        }
                        if (isGridToGrid && winConfigForm[blocks[a]]['BLOCK_TYPE'][0]=="DATAGRID" && blocks[a] == blockActive) {
                            let typeBlock = winConfigForm[blocks[a]]['BLOCK_TYPE'][0]
                            winConfigForm[blockActive]["RELATION_KEY"].forEach(function(id){
                                
                                let blockParent = getBlockParentMultiGrid(blockActive)
                                let item = $$(blockParent).getColumnConfig(id)
                                let rowActive = winConfigForm[blockParent]['WIN_ACTIVE_CELL_BLOCK'].pos.row
                                let recordParent = $$(getBlockParentMultiGrid(blockActive)).getItem(rowActive);
                                window.winDataRow[id] = recordParent[id]
                                formatDateDtRow(id,item,typeBlock)
                            })
                        }
                        
                       
                    }

                    if (winThereIsSubChild) {
                        if (winConfigForm[winActiveBlock.focusNow]["BLOCK_TYPE"][2] == undefined) {
                            let subChild = 0
                            blocks.forEach(function (id) {
                                if (winConfigForm[id]["BLOCK_TYPE"][2] == winActiveBlock.focusNow) {
                                    subChild++
                                }
                            })
                            if (subChild != 0) {
                                window.winDataChanged[blockActive].splice(i,1,winDataRow)
                            } else {
                                window.winDataChanged[blockActive].splice(i,1,winDataRow)
                            }
                        } else {
                            if (winThereIsSubChild) {
                                window.winDataChanged[blockActive].splice(i,1,winDataRow)
                                
                            }
                        }                    
                    }else{
                        window.winDataChanged[blockActive].splice(i,1,winDataRow)
                    }
                    idBaru = false;
                    break; //Stop this loop, we found it!
                }
            }
        }
        if(idBaru==true){
            if(param.rowId==activeCellRow){
                let indexObj = blocks.indexOf(blockActive)
                for(let a=0; a<=indexObj; a++){
                    if (winConfigForm[blocks[a]]['BASE_TABLE'] == undefined){
                        winConfigForm[blocks[a]]['BASE_TABLE'] = true
                    }
                    if(winConfigForm[blocks[a]]['BLOCK_TYPE'][0]=="FORM"  && winConfigForm[blocks[a]]['BASE_TABLE']){
                        let typeBlock = winConfigForm[blocks[a]]['BLOCK_TYPE'][0]
                        winConfigForm[blocks[a]]["PRIMARY_KEY"].forEach(function(id){
                            let item = $$(id).config
                            winDataRow[id] = $$(id).getValue()
                            formatDateDtRow(id,item,typeBlock)
                        })
                        winConfigForm[blockActive]["RELATION_KEY"].forEach(function(id){
                            let item = $$(id).config
                            window.winDataRow[id] = $$(id).getValue()
                            formatDateDtRow(id,item,typeBlock)
                        })
                    }
                    if (isGridToGrid && winConfigForm[blocks[a]]['BLOCK_TYPE'][0]=="DATAGRID" && blocks[a] == blockActive) {
                        let typeBlock = winConfigForm[blocks[a]]['BLOCK_TYPE'][0]
                        winConfigForm[blockActive]["RELATION_KEY"].forEach(function(id){
                            let blockParent = getBlockParentMultiGrid(blockActive)
                            let item = $$(blockParent).getColumnConfig(id)
                            let rowActive = winConfigForm[blockParent]['WIN_ACTIVE_CELL_BLOCK'].pos.row
                            let recordParent = $$(getBlockParentMultiGrid(blockActive)).getItem(rowActive);
                            window.winDataRow[id] = recordParent[id]
                            formatDateDtRow(id,item,typeBlock)
                        })
                    }

                }

                if (winThereIsSubChild) { 
                    if (winConfigForm[blockActive]["BLOCK_TYPE"][2] == undefined) {
                        let subChild = 0
                        blocks.forEach(function (id) {
                            if (winConfigForm[id]["BLOCK_TYPE"][2] == blockActive) {
                                subChild++
                            }
                        })
                        if (subChild != 0) {
                            window.winDataChanged[blockActive].push(winDataRow)
                        } else {
                            window.winDataChanged[blockActive].push(winDataRow)
                        }
                    } else {
                        if (winThereIsSubChild) {
                            window.winDataChanged[blockActive].push(winDataRow)
                        }   
                    }
                }else{
                    window.winDataChanged[blockActive].push(winDataRow)
                }
            }
        }
        if(winThereIsSubChild){
            let parentChild = ""
            let child = []
            blocks.every(function (blockId) {
                if (winConfigForm[blockId]["BLOCK_TYPE"][2] != undefined) {
                    parentChild = winConfigForm[blockId]["BLOCK_TYPE"][2]
                    return false;
                }
                return true
            })
            blocks.forEach(function (blockId) {
                if (winConfigForm[blockId]["BLOCK_TYPE"][2] == parentChild) {
                    child.push(blockId)
                }
            })
            if (winDataChanged[parentChild].length != 0) {
                if (indexRecord == undefined) {
                    indexRecord = (winDataChanged[parentChild].length) - 1
                }
                let recordParent = winDataChanged[parentChild][indexRecord]
                child.forEach(function (childId) {
                    if(winConfigForm[parentChild].PRIMARY_KEY != undefined){
                        winConfigForm[parentChild].PRIMARY_KEY.every(function(idPK){
                            if (winDataChanged[childId][indexRecord] != undefined) {
                                if (winDataChanged[childId][indexRecord][idPK] == undefined) {
                                    winDataChanged[childId][indexRecord][idPK]=recordParent[idPK]
                                }
                            }
                        })  
                    }
                })
            }
        }
    }
}

function onClickComboDt(dtTable,objValue){
    let blocks = Object.keys(winConfigForm)
    let pos = $$(dtTable.id).getSelectedId();
    let valueCombo = $$($$(dtTable.id).config.id).getItem(pos.row)
    valueCombo[pos.column] = objValue.id
    let newValueCombo = valueCombo[pos.column]
    $$(window.winActiveBlock['focusNow']).updateItem(pos.row, valueCombo);
    if(oldValueCombo!=newValueCombo){
    	winValidateItemPos = {'pos':{'row':pos.row,'column':pos.column,'id':pos.row+'_'+pos.column},'view':$$(dtTable.id)}
        $$(dtTable.id).getColumnConfig(pos.column).validateItem(newValueCombo).then(function(respond){
            if (isGridToGrid) {
                checkFailedValidateItem(respond.status,dtTable.id,window.winValidateItemPos.pos.row,window.winValidateItemPos.pos.column)
            }
            if(respond.status){
                checkToDatachanged({rowId:pos.row, columnId:pos.column})
                $$(dtTable.id).refreshColumns();
            }else{
                function isWebixPopupOpen() {
                    // Check if any Webix popup alerts exist
                    var popupAlerts = document.querySelectorAll('.webix_alert-error, .webix_alert-warning');
                    return popupAlerts.length > 0;
                }
                if(isWebixPopupOpen()==false){
                    let messageAlert
                    if($$("comboMultiLanguage")!=undefined){
                        let getLanguageCode = $$("comboMultiLanguage").getValue()
                        messageAlert = window["jsonMultiLanguage_"+menuId][getLanguageCode]["Kolom"] || "Kolom"
                    }else{
                        messageAlert = "Kolom"
                    }

                    let messageErrorAlert = respond.pesan+"<br><br><strong>Kolom "+$$(dtTable.id).getColumnConfig(pos.column).header[0].text+"</strong>"
                    messageErrorAlert = messageErrorAlert.replace("Kolom",messageAlert)

                    if(!isWebixPopupOpen()){
                        if (respond.tipe=="info"){
                            webix.alert(ALERT.ALERTINFO(messageErrorAlert)).then(
                                function(){
                                    $$(window.menuId).enable()//enable
                                    winValidateItemPos.view.edit(winValidateItemPos.pos)
                                }
                                )
                        }else if (respond.tipe=="warning"){
                            webix.alert(ALERT.ALERTWARNING(messageErrorAlert)).then(
                                function(){
                                    $$(window.menuId).enable()//enable
                                    winValidateItemPos.view.edit(winValidateItemPos.pos)
                                }
                                )
                        }else if (respond.tipe=="error"){
                            webix.alert(ALERT.ALERTERROR(messageErrorAlert)).then(
                                function(){
                                    
                                    $$(window.menuId).enable()//enable
                                    setValueDt([pos.column],[oldValueCombo])
                                    winValidateItemPos.view.edit(winValidateItemPos.pos)
                                }
                                )
                        }else{
                            let defaultErrorMsg = "<strong>Kolom "+$$(dtTable.id).getColumnConfig(pos.column).header[0].text+"</strong>"
                            defaultErrorMsg = defaultErrorMsg.replace("Kolom",messageAlert)
                            webix.alert(ALERT.ALERTERROR(defaultErrorMsg)).then(
                                function(){
                                    $$(window.menuId).enable()//enable
                                    setValueDt([pos.column],[oldValueCombo])
                                    winValidateItemPos.view.edit(winValidateItemPos.pos)
                                }
                                )    
                        }
                    }
                }
            }
        })
    }
    webix.UIManager.setFocus($$(window.winActiveBlock['focusNow']));
    $$(window.winActiveBlock.focusNow).select(winActiveCell.pos.row, winActiveCell.pos.column)
}

function onClickToolbarResize(){
    /**
     * Fungsi ini untuk attach event onClick pada Toolbar
    */
    //console.log("==== start on Click Toolbar Resize ====")
    $$("app").getChildViews()[0].getChildViews()[0].define("click",function(){            
        $$("$sidebar1").toggle();
        if($$("$sidebar1").config.collapsed){
            $$("filterSidebar").hide()
        }else{
            $$("filterSidebar").show()
        }
        selectMenuId()
        layoutContentObj.forEach(function(objLayout, index){
            if(index==0){
                if(objLayout.view=="form"){
                    let totalWidth = $$(objLayout.id).$width
                    if(objLayout['customWidthParam']=="full"){
                        $$("colsToolbar1").define("width",window.innerWidth - ($$("$sidebar1").$width+40))
                        $$("colsToolbar2").define("width",window.innerWidth - ($$("$sidebar1").$width+40))
                        $$(objLayout['id']).define("width",window.innerWidth - ($$("$sidebar1").$width+40))
                        widthCustomDt[objLayout['id']] = window.innerWidth - ($$("$sidebar1").$width+40)
                    }else if(typeof(objLayout['customWidthParam'])=="number" && !isNaN(objLayout['customWidthParam'])){
                        $$("colsToolbar1").define("width",objLayout['customWidthParam'])
                        $$("colsToolbar2").define("width",objLayout['customWidthParam'])
                        $$(objLayout['id']).define("width",objLayout['customWidthParam'])
                        widthCustomDt[objLayout['id']] = objLayout['customWidthParam']
                    }else{
                        if(totalWidth>window.innerWidth - ($$("$sidebar1").$width+40)){
                            $$("colsToolbar1").define("width",totalWidth)
                            $$("colsToolbar2").define("width",totalWidth)
                            $$(objLayout['id']).define("width",totalWidth)
                            widthCustomDt[objLayout['id']] = totalWidth
                        }else if(totalWidth>(window.innerWidth - 340)/2.5){
                            $$("colsToolbar1").define("width",totalWidth)
                            $$("colsToolbar2").define("width",totalWidth)
                            $$(objLayout['id']).define("width",totalWidth)
                            widthCustomDt[objLayout['id']] = totalWidth
                        }else{
                            $$("colsToolbar1").define("width",totalWidth)
                            $$("colsToolbar2").define("width",totalWidth)
                            $$(objLayout['id']).define("width",totalWidth)
                            widthCustomDt[objLayout['id']] = totalWidth
                        }
                    }
                    collectWidthTable[objLayout['id']] = widthCustomDt[objLayout['id']]
                    $$(objLayout['id']).resize()
                    $$("colsToolbar1").resize()
                    $$("colsToolbar2").resize()
                    $$("app").define("width",window.innerWidth)
                    $$("app").resize()
                }
            }
            if(Array.isArray(objLayout)){
                let idDatatable = objLayout[0]['id']
                let totalWidth = 0    
                let columns = $$(idDatatable).config.columns;
                if(columns!=undefined){
                    if (columns.length > 0) {
                        columns[columns.length - 1].fillspace = false;
                        $$(idDatatable).refreshColumns();
                    }
                }
                if($$(idDatatable).config.columns!=undefined){
                    $$(idDatatable).config.columns.forEach(function(colObj){
                        if(colObj.jenis!="textarea"){
                            if(colObj.jenis=="checkBox"){
                                $$(idDatatable).adjustColumn(colObj.id, "header")
                            }else{
                                $$(idDatatable).adjustColumn(colObj.id, "all")
                            }
                            if(colObj.customWidth==undefined){
                                if(colObj['jenis']=="lov"){
                                    if(colObj['widthLovCol']==undefined){
                                        colObj['widthLovCol'] = colObj['width']+20
                                    }
                                    colObj['width'] = colObj['widthLovCol']
                                }
                                if(colObj.editor=="btnDatagrid"){
                                    colObj['minWidth'] = 150
                                    colObj['width'] = 150
                                }
                            }else{
                                colObj['minWidth'] = colObj['customWidth']
                                colObj['width'] = colObj['customWidth']
                            }
                        }
                    })
                    $$(idDatatable).refreshColumns()
                    $$(idDatatable).config.columns.forEach(function(col){
                        if(!col.hidden){
                            totalWidth += col.width;
                        }
                    });
                }
                if(totalWidth>window.innerWidth - ($$("$sidebar1").$width+40)){ // kondisi total width content lebih besar dari sisa screen - sidebar expand    
                    if($$(idDatatable).config.view == "datatable"){
                        collectWidthTable[idDatatable] = window.innerWidth - ($$("$sidebar1").$width+40)
                    }else{
                        if($$(idDatatable).config.customWidthParam!=undefined){
                            if(typeof($$(idDatatable).config.customWidthParam)=="number"&& !isNaN($$(idDatatable).config.customWidthParam)){
                                collectWidthTable[idDatatable] = $$(idDatatable).config.customWidthParam
                            }
                        }
                    }
                    let highestWidth = 0
                    Object.keys(collectWidthTable).forEach(function(blockObjId){
                        if(collectWidthTable[blockObjId]>highestWidth){
                            highestWidth = collectWidthTable[blockObjId]
                        }
                    })
                    if($$("colsMasterToolbar")!=undefined){
                        $$("colsMasterToolbar").define("width",highestWidth)
                    }
                    if($$("customColsAuto")!=undefined){
                        $$("customColsAuto").define("width",highestWidth)
                    }
                    $$("myToolbar").define("width",highestWidth)
                    $$("myToolbar2").define("width",highestWidth)    
                }else{    
                    if($$(idDatatable).config.columns!=undefined){
                        $$(idDatatable).config.columns.forEach(function(colObj){
                            if(colObj.jenis!="textarea"){
                                if(colObj.jenis=="checkBox"){
                                    $$(idDatatable).adjustColumn(colObj.id, "header")
                                }else{
                                    $$(idDatatable).adjustColumn(colObj.id, "all")
                                }
                                if(colObj.customWidth==undefined){
                                    if(colObj['jenis']=="lov"){
                                        if(colObj['widthLovCol']==undefined){
                                            colObj['widthLovCol'] = colObj['width']+20
                                        }
                                        colObj['width'] = colObj['widthLovCol']
                                    }

                                    if(colObj.editor=="btnDatagrid"){
                                        colObj['minWidth'] = 150
                                        colObj['width'] = 150
                                    }
                                }else{
                                    colObj['minWidth'] = colObj['customWidth']
                                    colObj['width'] = colObj['customWidth']
                                }
                            }
                        })
                    }
                    $$(idDatatable).refreshColumns()
                    if($$(idDatatable).config.view == "datatable"){
                        if(collectWidthTable[idDatatable]<totalWidth){
                            collectWidthTable[idDatatable] = totalWidth
                        }
                    }else{
                        if($$(idDatatable).config.customWidthParam!=undefined){
                            if(typeof($$(idDatatable).config.customWidthParam)=="number"&& !isNaN($$(idDatatable).config.customWidthParam)){
                                collectWidthTable[idDatatable] = $$(idDatatable).config.customWidthParam
                            }
                        }
                    }
                    let highestWidth = 0
                    Object.keys(collectWidthTable).forEach(function(blockObjId){
                        if(collectWidthTable[blockObjId]>highestWidth){
                            highestWidth = collectWidthTable[blockObjId]
                        }
                    })
                    if($$("colsMasterToolbar")!=undefined){
                        $$("colsMasterToolbar").define("width",highestWidth)
                    }
                    if($$("customColsAuto")!=undefined){
                        $$("customColsAuto").define("width",highestWidth)
                    }
                    $$("myToolbar").define("width",highestWidth)
                    $$("myToolbar2").define("width",highestWidth)    
                    if(columns!=undefined){
                        if (columns.length > 0) {
                            columns[columns.length - 1].fillspace = true;
                            $$(idDatatable).refreshColumns();
                        }
                    }
                }
                if(columns!=undefined){
                    if (columns.length > 0) {
                        if(winMultiviewBlocksVertical.length!=0){
                            let highestWidth = 0
                            Object.keys(collectWidthTable).forEach(function(blockObjId){
                                if(collectWidthTable[blockObjId]>highestWidth){
                                    highestWidth = collectWidthTable[blockObjId]
                                }
                            })
                            if($$(idDatatable).config.view=="datatable"){
                                let toleranceWidth = window.innerWidth - ($$("$sidebar1").$width+40) - 270
                                if(highestWidth-270>=toleranceWidth){
                                    columns[columns.length - 1].fillspace = false;
                                }
                            }
                        }
                        $$(idDatatable).refreshColumns();
                    }
                }
                $$("customColsAuto").resize()
                $$("myToolbar").resize()
                $$("myToolbar2").resize()
                $$("app").define("width",window.innerWidth)
                $$("app").resize()
            }else{
                if(winMultiviewBlocksVertical.includes(objLayout.id)){
                    if(layoutContentObj[0]['customWidthParam']=="full"){
                        $$(objLayout.id).define("width",(window.innerWidth - ($$("$sidebar1").$width+40) - 270))
                        widthCustomDt[objLayout.id] = (window.innerWidth - ($$("$sidebar1").$width+40) - 270)
                        collectWidthTable[objLayout['id']] = window.innerWidth - ($$("$sidebar1").$width+40)
                        $$(objLayout.id).resize()
                    }else if(typeof(layoutContentObj[0]['customWidthParam'])=="number" && !isNaN(layoutContentObj[0]['customWidthParam'])){
                        $$("colsToolbar1").define("width",layoutContentObj[0]['customWidthParam'])
                        $$("colsToolbar2").define("width",layoutContentObj[0]['customWidthParam'])
                        $$(objLayout['id']).define("width",layoutContentObj[0]['customWidthParam']-270)
                        widthCustomDt[objLayout['id']] = layoutContentObj[0]['customWidthParam']-270
                        collectWidthTable[objLayout['id']] = layoutContentObj[0]['customWidthParam']
                    }
                    $$("colsToolbar1").resize()
                    $$("colsToolbar2").resize()
                }
            }
        })
    })
    //console.log("==== end on Click Toolbar Resize ====")
}

function conditionFormReLayoutingOden(paramObjForm){
    /**
     * Fungsi ini untuk re-layouting pada object form.
     * @param {dictionary / object} paramObjForm - {"objDatagrid":$$(callerId), "totalWidth":totalWidth, "customWidthForm":undefined / staticValue}.
    */
    let objForm = paramObjForm["objForm"]
    let idObjForm = paramObjForm["objForm"].config.id
    let totalWidth = paramObjForm["totalWidth"]
    // //console.log("==== start Condition Form Relayouting Oden | "+idObjForm+" | ====")
    if(!winMultiviewBlocksVertical.includes(idObjForm) && !winMultiviewBlocks.includes(idObjForm)){
        if(objForm['config']['customWidthParam']=="full"){
            $$("colsToolbar1").define("width",window.innerWidth - ($$("$sidebar1").$width+40))
            $$("colsToolbar2").define("width",window.innerWidth - ($$("$sidebar1").$width+40))
            $$(idObjForm).define("width",window.innerWidth - ($$("$sidebar1").$width+40))
            if(winMultiviewBlocksVertical.includes(idObjForm)){
                $$(idObjForm).define("width",window.innerWidth - ($$("$sidebar1").$width+40)-270)
            }
            widthCustomDt[idObjForm] = window.innerWidth - ($$("$sidebar1").$width+40)
        }else if(typeof(objForm['config']['customWidthParam'])=="number" && !isNaN(objForm['config']['customWidthParam'])){
            $$("colsToolbar1").define("width",objForm['config']['customWidthParam'])
            $$("colsToolbar2").define("width",objForm['config']['customWidthParam'])
            $$(idObjForm).define("width",objForm['config']['customWidthParam'])
            widthCustomDt[idObjForm] = objForm['config']['customWidthParam']
        }else{
            if(paramObjForm["customWidthForm"]!=undefined){
                if(paramObjForm["customWidthForm"]=="full"){
                    $$("colsToolbar1").define("width",window.innerWidth - ($$("$sidebar1").$width+40))
                    $$("colsToolbar2").define("width",window.innerWidth - ($$("$sidebar1").$width+40))
                    $$(idObjForm).define("width",window.innerWidth - ($$("$sidebar1").$width+40))
                    if(winMultiviewBlocksVertical.includes(idObjForm)){
                        $$(idObjForm).define("width",window.innerWidth - ($$("$sidebar1").$width+40)-270)
                    }
                    widthCustomDt[idObjForm] = window.innerWidth - ($$("$sidebar1").$width+40)
                }else if(typeof(paramObjForm["customWidthForm"])=="number" && !isNaN(paramObjForm["customWidthForm"])){
                    $$("colsToolbar1").define("width",paramObjForm["customWidthForm"])
                    $$("colsToolbar2").define("width",paramObjForm["customWidthForm"])
                    $$(idObjForm).define("width",paramObjForm["customWidthForm"])
                    widthCustomDt[idObjForm] = paramObjForm["customWidthForm"]
                }
            }else{
                if(totalWidth>window.innerWidth - ($$("$sidebar1").$width+40)){
                    if(collectWidthTable[idObjForm]==undefined){
                        if(objForm.customWidthParam!=undefined){
                            if(typeof(objForm.customWidthParam)=="number"&& !isNaN(objForm.customWidthParam)){
                                collectWidthTable[idObjForm] = objForm.customWidthParam
                            }
                        }
                    }
                    let highestWidth = 0
                    Object.keys(collectWidthTable).forEach(function(blockObjId){
                        if(collectWidthTable[blockObjId]>highestWidth){
                            highestWidth = collectWidthTable[blockObjId]
                        }
                    })
                    if($$("colsMasterToolbar")!=undefined){
                        $$("colsMasterToolbar").define("width",highestWidth)
                    }
                    if($$("customColsAuto")!=undefined){
                        $$("customColsAuto").define("width",highestWidth)
                    }
                    $$("myToolbar").define("width",highestWidth)
                    $$("myToolbar2").define("width",highestWidth)
                    $$(idObjForm).define("width",highestWidth)
                    widthCustomDt[idObjForm] = highestWidth                        
                }else if(totalWidth>(window.innerWidth - 340)/2.5){
                    if(collectWidthTable[idObjForm]==undefined){
                        if(objForm.customWidthParam!=undefined){
                            if(typeof(objForm.customWidthParam)=="number"&& !isNaN(objForm.customWidthParam)){
                                collectWidthTable[idObjForm] = objForm.customWidthParam
                            }
                        }
                    }
                    let highestWidth = 0
                    Object.keys(collectWidthTable).forEach(function(blockObjId){
                        if(collectWidthTable[blockObjId]>highestWidth){
                            highestWidth = collectWidthTable[blockObjId]
                        }
                    })
                    if($$("colsMasterToolbar")!=undefined){
                        $$("colsMasterToolbar").define("width",highestWidth)
                    }
                    if($$("customColsAuto")!=undefined){
                        $$("customColsAuto").define("width",highestWidth)
                    }
                    $$("myToolbar").define("width",highestWidth)
                    $$("myToolbar2").define("width",highestWidth)
                    $$(idObjForm).define("width",highestWidth)
                    widthCustomDt[idObjForm] = highestWidth
                }else{
                    if(collectWidthTable[idObjForm]==undefined){
                        collectWidthTable[idObjForm] = (window.innerWidth - 340)/2.5
                        if(objForm.customWidthParam!=undefined){
                            if(typeof(objForm.customWidthParam)=="number"&& !isNaN(objForm.customWidthParam)){
                                collectWidthTable[idObjForm] = objForm.customWidthParam
                            }
                        }
                    }else{
                        ////console.log(1151, "ke else")
                    }
                    let highestWidth = 0
                    Object.keys(collectWidthTable).forEach(function(blockObjId){
                        if(collectWidthTable[blockObjId]>highestWidth){
                            highestWidth = collectWidthTable[blockObjId]
                        }
                    })
                    if($$("colsMasterToolbar")!=undefined){
                        $$("colsMasterToolbar").define("width",highestWidth)
                    }
                    if($$("customColsAuto")!=undefined){
                        $$("customColsAuto").define("width",highestWidth)
                    }
                    
                    $$("myToolbar").define("width",highestWidth)
                    $$("myToolbar2").define("width",highestWidth)
                    $$(idObjForm).define("width",highestWidth)
                    widthCustomDt[idObjForm] = highestWidth
                }
            }
        }
    }else{
        if(winMultiviewBlocksVertical.includes(idObjForm)){
            if(typeof(paramObjForm['customWidthForm'])=="number" && !isNaN(paramObjForm['customWidthForm'])){
                $$(idObjForm).define("width",paramObjForm['customWidthForm']-270)
                widthCustomDt[idObjForm] = paramObjForm['customWidthForm']-270
            }
        }
        if(winMultiviewBlocks.includes(idObjForm)){
            if(typeof(paramObjForm['customWidthForm'])=="number" && !isNaN(paramObjForm['customWidthForm'])){
                $$(idObjForm).define("width",paramObjForm['customWidthForm'])
                widthCustomDt[idObjForm] = paramObjForm['customWidthForm']
            }
        }
        $$(idObjForm).resize()
    }
    if($$("colsMasterToolbar")!=undefined){
        $$("colsMasterToolbar").resize()
    }
    if($$("customColsAuto")!=undefined){
        $$("customColsAuto").resize()
    }
    if($$("colsToolbar1")!=undefined){
        $$("colsToolbar1").resize()
    }
    if($$("colsToolbar1")!=undefined){
        $$("colsToolbar2").resize()
    }
    // //console.log("==== end Condition Form Relayouting Oden | "+idObjForm+" | "+$$(idObjForm).$width+" | ====")
}

function conditionDatagridReLayoutingOden(paramObjDatagrid){
    /**
     * Fungsi ini untuk re-layouting pada object datagrid
     * @param {dictionary / object} paramObjDatagrid - {"objDatagrid":$$(callerId), "totalWidth":totalWidth, "customWidthForm":undefined / staticValue}.
    */
    //console.log("==== start Condition Datagrid Relayouting Oden | "+idObjDatagrid+" | ====")
    let objDatagrid = paramObjDatagrid["objDatagrid"]
    let idObjDatagrid = paramObjDatagrid["objDatagrid"].config.id
    let totalWidth = paramObjDatagrid["totalWidth"]
    let customWidthForm = paramObjDatagrid['customWidthForm']
    if(totalWidth>window.innerWidth - ($$("$sidebar1").$width+40)){
        if(collectWidthTable[idObjDatagrid]==undefined){
            collectWidthTable[idObjDatagrid] = window.innerWidth - ($$("$sidebar1").$width+40)
        }
        let highestWidth = 0
        Object.keys(collectWidthTable).forEach(function(blockObjId){
            if(collectWidthTable[blockObjId]>highestWidth){
                highestWidth = collectWidthTable[blockObjId]
            }
        })
        if($$("colsMasterToolbar")!=undefined){
            $$("colsMasterToolbar").define("width",highestWidth)
        }
        if($$("customColsAuto")!=undefined){
            $$("customColsAuto").define("width",highestWidth)
        }
        $$("myToolbar").define("width",highestWidth)
        $$("myToolbar2").define("width",highestWidth)
        widthCustomDt[idObjDatagrid] = highestWidth
    }else if(totalWidth>(window.innerWidth - 340)/2.5){        
        if(collectWidthTable[idObjDatagrid]==undefined){
            collectWidthTable[idObjDatagrid] = totalWidth
        }else{
            if(collectWidthTable[idObjDatagrid]<totalWidth){
                collectWidthTable[idObjDatagrid] = totalWidth
            }
        }
        let highestWidth = 0
        Object.keys(collectWidthTable).forEach(function(blockObjId){
            if(collectWidthTable[blockObjId]>highestWidth){
                highestWidth = collectWidthTable[blockObjId]
            }
        })
        if($$("colsMasterToolbar")!=undefined){
            $$("colsMasterToolbar").define("width",highestWidth)
        }
        if($$("customColsAuto")!=undefined){
            $$("customColsAuto").define("width",highestWidth)
        }
        $$("myToolbar").define("width",highestWidth)
        $$("myToolbar2").define("width",highestWidth)
        widthCustomDt[idObjDatagrid] = highestWidth
        let columns = objDatagrid.config.columns;
        if(columns!=undefined){
            if (columns.length > 0) {
                columns[columns.length - 1].fillspace = true;
                if(winMultiviewBlocksVertical.length!=0){
                    if(objDatagrid.config.view=="datatable"){
                        let toleranceWidth = window.innerWidth - ($$("$sidebar1").$width+40) - 270
                        if(highestWidth>=toleranceWidth){
                            columns[columns.length - 1].fillspace = false;
                        }
                    }
                }
                objDatagrid.refreshColumns();
            }
        }
    }else{
        if(collectWidthTable[idObjDatagrid]==undefined){
            collectWidthTable[idObjDatagrid] = (window.innerWidth - 340)/2.5
        }
        let highestWidth = 0
        Object.keys(collectWidthTable).forEach(function(blockObjId){
            if(collectWidthTable[blockObjId]>highestWidth){
                highestWidth = collectWidthTable[blockObjId]
            }
        })
        if($$("colsMasterToolbar")!=undefined){
            $$("colsMasterToolbar").define("width",highestWidth)
        }
        if($$("customColsAuto")!=undefined){
            $$("customColsAuto").define("width",highestWidth)
        }
        $$("myToolbar").define("width",highestWidth)
        $$("myToolbar2").define("width",highestWidth)
        widthCustomDt[idObjDatagrid] = highestWidth
        let columns = objDatagrid.config.columns;
        if(columns!=undefined){
            if (columns.length > 0) {
                columns[columns.length - 1].fillspace = true;
                if(winMultiviewBlocksVertical.length!=0){
                    if(objDatagrid.config.view=="datatable"){
                        let toleranceWidth = window.innerWidth - ($$("$sidebar1").$width+40) - 270
                        if(highestWidth>=toleranceWidth){
                            columns[columns.length - 1].fillspace = false;
                        }
                    }
                }
                objDatagrid.refreshColumns();
            }
        }
    }

    if(customWidthForm!=undefined){
        let highestWidth = 0
        if(customWidthForm=="full"){
            highestWidth = window.innerWidth - ($$("$sidebar1").$width+40) - 270
            widthCustomDt[idObjDatagrid] = window.innerWidth - ($$("$sidebar1").$width+40) - 270
        }else if(typeof(customWidthForm)=="number" && !isNaN(customWidthForm)){
            highestWidth = customWidthForm - 270
            widthCustomDt[idObjDatagrid] = customWidthForm - 270
        }
        Object.keys(widthCustomDt).forEach(function(blockObjId){
            if(widthCustomDt[blockObjId]>highestWidth){
                highestWidth = widthCustomDt[blockObjId]
            }
            if(collectWidthTable[blockObjId]>highestWidth){
                highestWidth = collectWidthTable[blockObjId]
            }
        })
        if($$("colsMasterToolbar")!=undefined){
            $$("colsMasterToolbar").define("width",highestWidth)
        }

        if($$("customColsAuto")!=undefined){
            $$("customColsAuto").define("width",highestWidth)
        }
        $$("myToolbar").define("width",highestWidth)
        $$("myToolbar2").define("width",highestWidth)
        widthCustomDt[idObjDatagrid] = highestWidth
        let columns = objDatagrid.config.columns;
        if(columns!=undefined){
            if (columns.length > 0) {
                columns[columns.length - 1]["fillspace"] = true;
                if(winMultiviewBlocksVertical.length!=0){
                    if(objDatagrid.config.view=="datatable"){
                        let toleranceWidth = window.innerWidth - ($$("$sidebar1").$width+40) - 270
                        if(highestWidth-270>=toleranceWidth){
                            columns[columns.length - 1]["fillspace"] = false;
                        }
                    }
                }
                if(columns[columns.length - 1]['jenis']=='checkBox'){
                    columns[columns.length - 1]["fillspace"] = false;
                    columns[columns.length - 1]["width"] = 100;
                }
                objDatagrid.refreshColumns();
            }
        }
    }
    //console.log("==== end Condition Datagrid Relayouting Oden | "+idObjDatagrid+" | ====")
}

function validationReLayoutingOden(paramValidationRelayout){
    /**
        * Fungsi ini untuk memvalidasi kondisi dari object caller autolayout
        * @param {dictionary / object} paramValidationRelayout - {"idCaller":tableId}.
    */
    //console.log("==== start Validation Relayouting Oden | "+callerId+" | ====")
    let callerId = paramValidationRelayout['idCaller']
    if($$("customColsAuto")!=undefined){
        onClickToolbarResize()
        if(layoutContentObj.length==1){
            if($$(callerId).config.view == "form"){
                conditionFormReLayoutingOden({"objForm":$$(callerId)})
            }else{                
                $$(callerId).config.columns.forEach(function(colObj){
                    if(colObj.jenis!="textarea"){
                        if(colObj.jenis=="checkBox"){
                            $$(callerId).adjustColumn(colObj.id, "header")
                        }else{
                            $$(callerId).adjustColumn(colObj.id, "all")
                        }
                        if(colObj.customWidth==undefined){
                            if(colObj['jenis']=="lov"){
                                if(colObj['widthLovCol']==undefined){
                                    colObj['widthLovCol'] = colObj['width']+20
                                }
                                colObj['width'] = colObj['widthLovCol']
                            }
                            if(colObj.editor=="btnDatagrid"){
                                colObj['minWidth'] = 150
                                colObj['width'] = 150
                            }
                        }else{
                            colObj['minWidth'] = colObj['customWidth']
                            colObj['width'] = colObj['customWidth']
                        }
                    }
                    colObj.fillspace = false
                })
                $$(callerId).refreshColumns()
                let totalWidth = 0
                if($$(callerId).config.columns!=undefined){
                    $$(callerId).config.columns.forEach(function(col){
                        if(!col.hidden){
                            totalWidth += col.width;
                        }
                    });
                }
                conditionDatagridReLayoutingOden({"objDatagrid":$$(callerId), "totalWidth":totalWidth, "customWidthForm":undefined})
            }
        }else{
            if($$(callerId).config.view == "form"){
                let customWidthForm0
                if(layoutContentObj[0].view=="form"){
                    if(layoutContentObj[0].customWidthParam!=undefined){
                        customWidthForm0 = layoutContentObj[0]['customWidthParam']
                    }
                }
                conditionFormReLayoutingOden({"objForm":$$(callerId),"customWidthForm":customWidthForm0})                
            }else{
                let totalWidth = 0
                if($$(callerId).config.columns!=undefined){
                    if($$(callerId).serialize().length!=0){
                        $$(callerId).config.columns.forEach(function(col){
                            if(!col.hidden){
                                totalWidth += col.width;
                            }
                        });
                    }
                }
                let customWidthForm0
                if(layoutContentObj[0].view=="form"){
                    if(layoutContentObj[0].customWidthParam!=undefined){
                        customWidthForm0 = layoutContentObj[0]['customWidthParam']
                    }
                }
                conditionDatagridReLayoutingOden({"objDatagrid":$$(callerId), "totalWidth":totalWidth, "customWidthForm":customWidthForm0})
            }
        }
        if($$("colsMasterToolbar")!=undefined){
            $$("colsMasterToolbar").resize()
        }
        if($$("customColsAuto")!=undefined){
            $$("customColsAuto").resize()
        }
        $$("myToolbar").resize()
        $$("myToolbar2").resize()
    }else{
        if(layoutContentObj.length==1){
            if($$(callerId).config.view == "form"){
                onClickToolbarResize()                
                let customWidthForm0
                if(layoutContentObj[0].view=="form"){
                    if(layoutContentObj[0].customWidthParam!=undefined){
                        customWidthForm0 = layoutContentObj[0]['customWidthParam']
                    }
                }
                conditionFormReLayoutingOden({"objForm":$$(callerId),"customWidthForm":customWidthForm0})
                $$("myToolbar").resize()
                $$("myToolbar2").resize()
                $$(callerId).resize()
            }
        }else{
            ////console.log(1582, "resize")
        }
    }
    ////console.log("==== end Validation Relayouting Oden | "+callerId+" | ====")
}

function reLayoutOden(tableId){
    /**
        * Fungsi ini untuk mastering layout Oden
        * @param {string} tableId - ID Object.
    */
    console.log("==== start Relayout Oden | "+tableId+" | ====")
    validationReLayoutingOden({"idCaller":tableId})
    console.log("==== end Relayout Oden | "+tableId+" | ====")
}

window.calculateDt = function(datatableId, columnId, operation, customFunction, idOperatorDt, digitAfterComa, isCurrency=false){
    let promise = new Promise(resolve=>{
        var datatable = $$(datatableId);
        if(datatable==undefined){
            resolve(0)
        }
        var data = webix.copy(datatable.data.pull);
        var values = [];

        for (var id in data) {
            if (data.hasOwnProperty(id)) {
                values.push(data[id][columnId]);
            }
        }

        values = values.map(function(item) {
            if (item === "") {
                return 0
            }else if (!isNaN(item)) {
                return parseFloat(item)
            }
        });

        switch (operation) {
            case "SUM":
                var sum = 0;
                for (var i = 0; i < values.length; i++) {
                    if(isNaN(values[i])){
                        sum += 0;
                    }else{
                        sum += values[i]
                    }
                }
                if (!winOperatorDt[datatable.config.id]) {
                    winOperatorDt[datatable.config.id] = {};
                }

                //parseFloat 4 angka belakang koma
                sum = parseFloat(sum.toFixed(4))
                winOperatorDt[datatable.config.id][idOperatorDt] = sum
                if(isCurrency){
                    if($$(datatableId).getColumnConfig(columnId)['currencyCode']!=undefined){
                        sum = Intl.NumberFormat(undefined, { style: "currency", currency: item.currencyCode }).format(sum)
                    }else{
                        sum = Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(sum);
                    }
                }
                resolve(sum)
                break
            case "MIN":
                var min = null;
                for (var i = 0; i < values.length; i++) {
                    if(!isNaN(values[i])){
                        if (values[i] < min) {
                            min = values[i];
                        }
                    }
                }
                if (!winOperatorDt[datatable.config.id]) {
                    winOperatorDt[datatable.config.id] = {};
                }

                min = parseFloat(min.toFixed(4))
                winOperatorDt[datatable.config.id][idOperatorDt] = min
                if(isCurrency){
                    if($$(datatableId).getColumnConfig(columnId)['currencyCode']!=undefined){
                        min = Intl.NumberFormat(undefined, { style: "currency", currency: item.currencyCode }).format(min)
                    }else{
                        min = Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(min);
                    }
                }
                resolve(min);
                break
            case "MAX":
                var max = null;
                for (var i = 0; i < values.length; i++) {
                    if(!isNaN(values[i])){
                        if (values[i] > max) {
                            max = values[i];
                        }
                    }
                }
                if (!winOperatorDt[datatable.config.id]) {
                    winOperatorDt[datatable.config.id] = {};
                }

                max = parseFloat(max.toFixed(4))
                winOperatorDt[datatable.config.id][idOperatorDt] = max
                if(isCurrency){
                    if($$(datatableId).getColumnConfig(columnId)['currencyCode']!=undefined){
                        max = Intl.NumberFormat(undefined, { style: "currency", currency: item.currencyCode }).format(max)
                    }else{
                        max = Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(max);
                    }
                }
                resolve(max)
                break
            case "AVG":
                var sum = 0;
                for (var i = 0; i < values.length; i++) {
                    if(isNaN(values[i])){
                        sum += 0;
                    }else{
                        sum += values[i]
                    }
                }
                let avg = sum / values.length
                if(digitAfterComa!=undefined){
                    avg = avg.toFixed(digitAfterComa)
                }else{
                    avg = avg.toFixed(4)
                }
                if (!winOperatorDt[datatable.config.id]) {
                    winOperatorDt[datatable.config.id] = {};
                }
                winOperatorDt[datatable.config.id][idOperatorDt] = avg
                if(isCurrency){
                    if($$(datatableId).getColumnConfig(columnId)['currencyCode']!=undefined){
                        avg = Intl.NumberFormat(undefined, { style: "currency", currency: item.currencyCode }).format(avg)
                    }else{
                        avg = Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(avg);
                    }
                }
                resolve(avg);
                break
            case "CUSTOM_FUNCTION":
                let resultFunction = customFunction().then(function(result){
                    resolve(result)
                })
                break
            default:
                resolve(0)
                break
        }
    })
    return promise
}

window.updateFooterDt = function(block,item){
    let promise = new Promise((resolve)=>{
        let respondFooterObj = []
        let tampunganOperator = []
        for (let footerObj of item.customFooter) {
            let operatorseq = 0
            if(footerObj.content == "MULTI_COLUMNS"){
                let tampunganmulti = []

                for (let subFooterObj of footerObj.columns) {
                    if(typeof(subFooterObj)=="string"){
                        tampunganmulti.push(`<div>${subFooterObj}</div>`)
                    }else{
                        let idOperatorDt = item.id + "." + subFooterObj.content;
                        while (tampunganOperator.includes(idOperatorDt)) {
                            operatorseq++;
                            idOperatorDt = item.id + "." + subFooterObj.content + "." + operatorseq;
                        }
                        tampunganOperator.push(idOperatorDt)
                        let isCurrency = false
                        if("isCurrency" in subFooterObj){
                        	isCurrency = subFooterObj["isCurrency"]
                        }
                        calculateDt(block,item.id,subFooterObj.content, subFooterObj.customFunction, idOperatorDt, subFooterObj.digitAfterComa, isCurrency).then(function(result){
                            tampunganmulti.push(`<div>${result}</div>`)
                            let respondFooterColumnsObj = `<div class="two-column-cell">${tampunganmulti.join('')}</div>`
                            respondFooterObj.push(respondFooterColumnsObj)
                            resolve(respondFooterObj)
                        })
                        
                    }
                }
            }else{
                let idOperatorDt = item.id + "." + footerObj.content
                while (tampunganOperator.includes(idOperatorDt)) {
                    operatorseq++;
                    idOperatorDt = item.id + "." + footerObj.content + "." + operatorseq;
                }
                let respondFooterColumnsObj
                let tampunganmulti = []
                tampunganOperator.push(idOperatorDt)
                let isCurrency = false
                if("isCurrency" in footerObj){
                	isCurrency = footerObj["isCurrency"]
                }
                if("customText" in footerObj){
                    tampunganmulti.push(`<div>${footerObj['customText']}</div>`)
                    calculateDt(block,item.id,footerObj.content, footerObj.customFunction, idOperatorDt, footerObj.digitAfterComa, isCurrency).then(function(result){
                        tampunganmulti.push(`<div>${result}</div>`)
                        respondFooterColumnsObj = `<div class="two-column-cell">${tampunganmulti.join('')}</div>`
                        respondFooterObj.push(respondFooterColumnsObj)
                        resolve(respondFooterObj)
                    })
                }else{
                    respondFooterColumnsObj = calculateDt(block,item.id,footerObj.content, footerObj.customFunction, idOperatorDt, footerObj.digitAfterComa, isCurrency).then(function(result){
                        respondFooterObj.push(respondFooterColumnsObj)
                        resolve(respondFooterObj)
                    })
                }
            }
        }
    })
    return promise
}

class DatatableCustom { 
    // "ODENTABLEDET", elementODENTABLEDET, rulesODENTABLEDET,[0,0], buttonDatagrid,customOperatorDatagrid 
    SimpleDatatable(idTable,columnsCustom,notNullElements,splitDt=[0,0], additionalButton, additionalCustomOperator, actionDatagrid={"delete":"temp", "status":undefined}){
        let blocks = Object.keys(winConfigForm)
        winIdOldRecordDt[idTable] = []
        winPagerDatatable[idTable] = [0,0]
        winDataChanged[idTable] = []
        window.winCountOffsetRecord[idTable] = 0
        window.winTotalRecordDt[idTable] = 0
        window.winHideColumnsDt[idTable] = []
        winDataDtSelect[idTable] = []
        window.winNewCustomOperator = {}
        window.winFailedValidateItem[idTable] = {}
        // Main of Datatable Object
        let dtTable = {
            view:"datatable",
            resizeColumn:true, 
            id:idTable,
            // height:403,
            // autoheight:true,
            minHeight:403,
            customOperator:additionalCustomOperator || undefined,
            tooltip:true,
            scroll:"x",
            dynamicLoadData:0,
            editable:true,
            footer:true,
            footerLevel:0,
            pager:"pager_"+idTable,
            select:"cell",
            editaction: "custom",
            columns:[],
            leftSplit:splitDt[0],
            rightSplit:splitDt[1]+1,
            rules:notNullElements,
            scheme:{
                $change:function(cell){
                        let columnDatatable = $$(this.owner).config.columns
                        let dtTable = $$(this.owner)
                        columnDatatable.forEach(function(item){
                            if (item.editor==undefined || item.disabledItem==true){
                                dtTable.addCellCss(cell.id, item.id, "disableCells", true); 
                            }
                            
                            if(item.jenis=="checkBox"){
                                dtTable.addCellCss(cell.id, item.id, "center_checkbox_datagrid", true);
                            }
                            
                        })
                }
            },
            on:{
                onAfterAdd: function (id, index) {
                    if(winThereIsSubChild){
                        checkToDatachanged({ rowId: id, dataRow: this.getItem(id) , blockActive:this.config.id})
                    }

                    let columnDatatable = this.config.columns
                    let dtTable = this
                    columnDatatable.forEach(function(item){
                        if (item.editor==undefined || item.disabledItem==true){
                            dtTable.addCellCss(id, item.id, "disableCells", true); 
                        }
                        if(item.jenis=="checkBox"){
                            dtTable.addCellCss(id, item.id, "center_checkbox_datagrid", true);
                        }
                    })
                },
                onBeforeSelect:function (id) {
                    console.log("============ ON BEFORE SELECT ============");
                    
                    let view = this
                    let blockNow =  this.config.id
                    
                    if (isGridToGrid) {
                        
                        if (winAddData) {
                            let pos = view.getSelectedId();
                            let statusBlock = winConfigForm[winFlagInsertBlock]['BLOCK_TYPE'][1] 
                            let statusBlockNow =  winConfigForm[blockNow]['BLOCK_TYPE'][1]
                            
                            function isWebixPopupOpen() {
                                // Check if any Webix popup alerts exist
                                var popupAlerts = document.querySelectorAll('.webix_alert-error, .webix_alert-warning, .webix_alert-info');
                                return popupAlerts.length == 0;
                            }
                            
                            if(statusBlock == "CHILD"){
                                if (statusBlockNow =='PARENT') {
                                    if(isWebixPopupOpen()){
                                        webix.alert(ALERT.ALERTWARNING("Sedang dalam mode tambah data, tidak dapat pindah baris !"))
                                    }
                                    return false
                                }
                            }else if(statusBlock == "GRANDCHILD"){
                                if (statusBlockNow == 'PARENT' ||statusBlockNow == 'CHILD') {
                                    if(isWebixPopupOpen()){
                                        webix.alert(ALERT.ALERTWARNING("Sedang dalam mode tambah data, tidak dapat pindah baris !"))
                                    }
                                    return false
                                }
                            }
                            return true
                        }
                        let blockFailed = ''
                        Object.keys(winFailedValidateItem).every(function (block) {
                            if (Object.keys(winFailedValidateItem[block]).length != 0) {
                                blockFailed = block
                                return false
                            }
                            return true
                        })
                        
                        
                        if (blockFailed != '') {
                            let row =winFailedValidateItem[blockFailed]['row']
                            let column =winFailedValidateItem[blockFailed]['column']
                            
                            if (id.row == row) {
                                return true
                            }else{
                                
                                webix.UIManager.setFocus($$(blockFailed));
                                $$(blockFailed).select(row,column)
                                $$(blockFailed).editCell(row,column);
                                return false
                            }
                        }
                       
                        
                    }
                },
                onBeforeUnselect(){
                    console.log("============ ON BEFORE UNSELECT ============");

                    let positionNow = window.winActiveCell
                    let validationData = {'status':true}
                    if(!winAddRecord && !winNextRecord && !winPrevRecord && !winDeleteRecord && !winSearchRecord && !winClearResetRecord){
                        if(!(winValidatePromise instanceof Promise)){
                            window.winValidateItemPos = positionNow
                        }
                        if(positionNow!='' && !positionNow.pos.column.includes("action_")){
                            if(window.winActiveCell.view.getColumnConfig(window.winActiveCell.pos.column).validateItem){
                                let jenis = ''
                                if (this.getColumnConfig(window.winActiveCell.pos.column) != undefined) {
                                    jenis = this.getColumnConfig(window.winActiveCell.pos.column).jenis
                                }
                                if(!window.winResetData){
                                    if(window.winActiveCell.pos.row==winEditor.row && window.winActiveCell.pos.column==winEditor.column){
                                        let headerColumn = ""
                                        if(window.winActiveCell.view.getColumnConfig(window.winActiveCell.pos.column).header[0] != null){
                                            headerColumn = window.winActiveCell.view.getColumnConfig(window.winActiveCell.pos.column).header[0].text
                                        }
                                        validationData = window.winActiveCell.view.getColumnConfig(window.winActiveCell.pos.column).validateItem()
                                        
                                        winValidatePromise = validationData
                                        validationData.then(function(respond){
                                            if (isGridToGrid) {
                                                checkFailedValidateItem(respond.status,positionNow.view.config.id,positionNow.pos.row,positionNow.pos.column)
                                            }
                                            if(respond.status){
                                                winEditor = {}
                                                winValidatePromise = {}
                                                validationData = {status:true}
                                            }else{
                                                if(isWebixPopupOpen()==false){
                                                    if (jenis != "checkBox") {
                                                        if (respond.tipe=="info"){
                                                            webix.alert(ALERT.ALERTINFO(respond.pesan+"<br><br><strong>Kolom "+headerColumn+"</strong>")).then(
                                                                function(){
                                                                    $$(window.menuId).enable()//enable
                                                                    $$(window.winActiveBlock.focusNow).select(positionNow.pos.row, positionNow.pos.column)
                                                                    positionNow.view.edit(positionNow.pos)
                                                                }
                                                                )
                                                        }else if (respond.tipe=="warning"){
                                                            webix.alert(ALERT.ALERTWARNING(respond.pesan+"<br><br><strong>Kolom "+headerColumn+"</strong>")).then(
                                                                function(){
                                                                    $$(window.menuId).enable()//enable
                                                                    $$(window.winActiveBlock.focusNow).select(positionNow.pos.row, positionNow.pos.column)
                                                                    positionNow.view.edit(positionNow.pos)
                                                                }
                                                                )
                                                        }else if (respond.tipe=="error"){
                                                            webix.alert(ALERT.ALERTERROR(respond.pesan+"<br><br><strong>Kolom "+headerColumn+"</strong>")).then(
                                                                function(){
                                                                    $$(window.menuId).enable()//enable
                                                                    $$(window.winActiveBlock.focusNow).select(positionNow.pos.row, positionNow.pos.column)
                                                                    positionNow.view.edit(positionNow.pos)
                                                                }
                                                                ) 
                                                        }else{
                                                            webix.alert(ALERT.ALERTERROR("<strong>Kolom "+headerColumn+"</strong>")).then(
                                                                function(){
                                                                    $$(window.menuId).enable()//enable
                                                                    $$(window.winActiveBlock.focusNow).select(positionNow.pos.row, positionNow.pos.column)
                                                                    positionNow.view.edit(positionNow.pos)
                                                                }
                                                                )    
                                                        }
                                                    }
                                                }
                                            }
                                        })
                                    }else{
                                        validationData = {status:true}
                                    }
                                    
                                }
                            }else{

                                validationData = {status:true}
                            }
                        }
                    }
                },
                onAfterUnselect:function(selection){
                    console.log("============ ON AFTER UNSELECT ============");

                    this.unselect(selection.row, selection.column);
                    this.unselectAll();
                    if (!isGridToGrid) {
                        $$(this).removeRowCss(selection.row, "highlight-focus-row")
                    }
                },
                onAfterSelect:function(){
                    console.log("============ ON AFTER SELECT ============");
                    
                    let view = this
                    let pos = view.getSelectedId();
                    if (winActiveCell != '' && winActiveCell.pos != undefined) {
                        $$(view).removeRowCss(winActiveCell.pos.row, "highlight-focus-row")
                    }
                    window.winActiveCell = {'pos':pos,'view':view}
                    
                    $$(view).addRowCss(winActiveCell.pos.row, "highlight-focus-row")
                    
                    
                    // START mar
                    let blockName = this.config.id;
                    if(window.isGridToGrid){
                        window.winValidateItemPos = window.winActiveCell
                        window.winActiveBlock.focusNow = this.config.id;
                        if (Object.keys(winConfigForm[blockName]['WIN_ACTIVE_CELL_BLOCK']).length != 0) {
                            $$(view).removeRowCss(winConfigForm[blockName]['WIN_ACTIVE_CELL_BLOCK'].pos.row, "highlight-focus-row")
                            $$(view).removeRowCss(oldUpdatedCell[blockName]['pos']['row'], "highlight-focus-row")
                            
                        }
                        let winActiveCellBlockOld = winConfigForm[blockName]['WIN_ACTIVE_CELL_BLOCK']
                        winConfigForm[blockName]['WIN_ACTIVE_CELL_BLOCK'] = window.winValidateItemPos
                        if(blockName in oldUpdatedCell == false){
                            oldUpdatedCell[blockName] = window.winActiveCell
                        }
                        $$(blockName).addRowCss(window.winActiveCell.pos.row, "highlight-focus-row")
                        
                        if(!winAddData && !winSearchMode){
                            let lastIndexDataChanged = winDataChanged[blockName].length - 1
                            let lastDataChanged = winDataChanged[blockName][lastIndexDataChanged]
                            // CHECK JIKA ADA DATA YANG TERUPDATE TETAPI PINDAH KE MASTER
                            let statusValidateUpdate = validateUpdateGridToGrid(this) 
                            
                            if(statusValidateUpdate == false){
                                winActiveCell = {'pos': winConfigForm[winActiveBlock.lastFocus]['WIN_ACTIVE_CELL_BLOCK'], 'view': $$(winConfigForm[winActiveBlock.lastFocus])}
                                return false
                            }
                            window.winAllowEditCell = true
                            if(winConfigForm[blockName]["BLOCK_TYPE"][1] == "CHILD" && winActiveCellBlockOld.pos == undefined){
                                winConfigForm[blockName]['WIN_ACTIVE_CELL_BLOCK'] = {'pos':pos,'view':view}
                                winActiveCellBlockOld = winConfigForm[blockName]['WIN_ACTIVE_CELL_BLOCK']
                                let grandChildBlockName = '';
                                Object.keys(winConfigForm).every(function (blockId) {
                                    if (winConfigForm[blockId]["BLOCK_TYPE"][1] == "GRANDCHILD") {
                                        grandChildBlockName = blockId
                                        return false;
                                    }
                                    return true;
                                })
                                if (grandChildBlockName != ''){
                                    loadingShow()

                                    restapi.restApiParam(winConfigForm[grandChildBlockName]['REST_API']).then(function (response) {
                                        $$(menuId).enable()//enable
                                        $$(menuId).hideProgress();
                                        
                                    })
                                }
                            }

                            if(!winSearchMode){
                                if(winConfigForm[blockName]["BLOCK_TYPE"][1] == "PARENT" && winActiveCellBlockOld.pos != undefined && pos.row != winActiveCellBlockOld.pos.row){ //mar
                                    // ketika parent merubah child pertama
                                    loadingShow()
                                    
                                    let childBlockName = statusMasterDetailGridToGrid.child;
                                    Object.keys(winConfigForm).forEach(function (blockId) {
                                        if(winConfigForm[blockId]["BLOCK_TYPE"][1] != "PARENT" && winConfigForm[blockId]["BLOCK_TYPE"][1] != "NONE"){
                                            $$(blockId).clearAll()
                                            $$(blockId).refresh()
                                        }
                                    })
                                    if(childBlockName != "" && window.statusMasterDetailGridToGrid['grandchild'] != ""){
                                        $$(window.statusMasterDetailGridToGrid['grandchild']).showOverlay("Please select master data first!")
                                        $$(window.statusMasterDetailGridToGrid['grandchild']).disable()
                                    }
                                    // if (Object.keys(winConfigForm[blockName]['WIN_ACTIVE_CELL_BLOCK']).length != 0) {
                                    //     $$(view).removeRowCss(winConfigForm[blockName]['WIN_ACTIVE_CELL_BLOCK'].pos.row, "highlight-focus-row")
                                    // }
                                    restapi.restApiParam(winConfigForm[childBlockName]['REST_API']).then(function (response) {
                                        $$(menuId).enable()
                                        $$(menuId).hideProgress();
                                    })
                                    
                                } else if(winConfigForm[blockName]["BLOCK_TYPE"][1] == "CHILD" && winActiveCellBlockOld.pos != undefined && pos.row != winActiveCellBlockOld.pos.row){
                                    let grandChildBlockName = '';
                                    Object.keys(winConfigForm).every(function (blockId) {
                                        if (winConfigForm[blockId]["BLOCK_TYPE"][1] == "GRANDCHILD") {
                                            grandChildBlockName = blockId
                                            return false;
                                        }
                                        return true;
                                    })
                                    if (grandChildBlockName != ''){
                                        loadingShow()
                                        restapi.restApiParam(winConfigForm[grandChildBlockName]['REST_API']).then(function (response) {
                                            $$(menuId).enable()//enable
                                            $$(menuId).hideProgress();
                                        
                                        })
                                    }
                                    
                                }
                            }
                        }

                        oldUpdatedCell[blockName] = window.winActiveCell
                        
                    }else{
                        if (Object.keys(winActiveCell).length != 0) {
                            $$(view).removeRowCss(winActiveCell.pos.row, "highlight-focus-row")
                        }
                        $$(blockName).addRowCss((winActiveCell).pos.row, "highlight-focus-row")
                    }
                    webix.UIManager.setFocus(view);

                },
                onItemClick:function(id){
                    console.log("============ ON ITEM CLICK ============");

                    let view = this;
                    let pos = view.getSelectedId();
                    if (isGridToGrid) {
                        
                        if(winAddData && this.config.id != window.winFlagInsertBlock && isBlockValidated(window.winFlagInsertBlock) == false){
                            $$(this.config.id).unselect();
                            $$(this.config.id).clearSelection();
                            view = $$(window.winFlagInsertBlock);
                            pos = view.getSelectedId();
                            window.winActiveBlock.focusNow = window.winFlagInsertBlock;
                            window.winActiveCell = {'pos':pos,'view':view}

                            
                            webix.UIManager.setFocus(view)
                            return false
                        }else if(winAddData && $$(window.winFlagInsertBlock).validate()) {
                            if (window.winFlagInsertChild.length != 0) {
                                // Kondisi ItemClick saat Add Memiliki Child (CHILD - GRANDCHILD)
                                if (isBlockValidated(window.winFlagInsertChild[0]) == false) {
                                    $$(window.winFlagInsertBlock).unselect();
                                    $$(window.winFlagInsertBlock).clearSelection();
                                    view = $$(window.winFlagInsertChild[0]);
                                    pos = view.getSelectedId();
                                    window.winActiveBlock.focusNow = window.winFlagInsertChild[0];
                                    window.winActiveCell = {'pos':pos,'view':view}
                                    webix.UIManager.setFocus(view)
                                    return false
                                }
                            }else{
                                // Kondisi ItemClick saat Add Tidak Memiliki Child (GRANDCHILD/CHILD TOK)
                                if (isBlockValidated(winFlagInsertBlock) == false) {
                                    view = $$(winFlagInsertBlock);
                                    pos = view.getSelectedId();
                                    window.winActiveBlock.focusNow = winFlagInsertBlock;
                                    window.winActiveCell = {'pos':pos,'view':view}
                                    webix.UIManager.setFocus(view)
                                    return false
                                }
                            }
                            

                        }else{
                            if(validateUpdateGridToGrid(this, true) == false){
                                return false
                            }
                            webix.UIManager.setFocus(view)
                            window.winActiveBlock.focusNow = this.config.id
                            pos = view.getSelectedId();
                            if (view.getSelectedId()) {
                                window.winActiveCell = {'pos':pos,'view':view}
                            }
                        }
                    }else{
                        webix.UIManager.setFocus(view)
                        window.winActiveBlock.focusNow = this.config.id
                        let pos = view.getSelectedId();
                        window.winActiveCell = {'pos':pos,'view':view}
                    }
                    let thisColumn = view.config.columns[view.getColumnIndex(window.winActiveCell['pos'].column)]
                    if (thisColumn != undefined) {
                        if(thisColumn.editor=="btnDatagrid"){
                            window.winValidateItemPos = window.winActiveCell
                            thisColumn.customTrigger()
                        }else if(thisColumn.jenis=="combo"){
                            if (winAddData) {     
                                let editCellAddData = true
                                for (let x=0; x<window.winIdOldRecordDt[winActiveBlock.focusNow].length; x++){
                                    if(window.winIdOldRecordDt[winActiveBlock.focusNow][x]==pos.row){
                                        editCellAddData = false
                                        break;
                                    }
                                }
                                if(editCellAddData){
                                    if(!(winValidatePromise instanceof Promise)){
                                        $$(winActiveBlock.focusNow).edit(id);
                                    }else{
                                        winValidatePromise.then(function(respond){
                                            if(respond.status == true || winValidateItemPos.pos.column == pos.column){
                                                $$(winActiveBlock.focusNow).edit(id);
                                            }
                                        })
                                    }
                                }
                            }else{
                                $$(winActiveBlock.focusNow).edit(id);
                            }
                        }
                    }
                    
                    
                },
                onItemDblClick:function(id, e, node){
                    console.log("============ ON ITEM DBL CLICK ============");

                    if($$(window.winActiveBlock['focusNow']).config.view=="datatable"){
                        let view = $$(window.winActiveBlock['focusNow'])
                        let pos = view.getSelectedId();
                        window.winActiveCell = {'pos':pos,'view':view}
                        // start mar
                        if (window.isGridToGrid) {
                            if(!winAddData && !winSearchMode ){
                                if(statusMasterDetailGridToGrid.parent == ''){
                                    statusMasterDetailGridToGrid.parent = window.winActiveBlock['focusNow'];
                                }else if(statusMasterDetailGridToGrid.child == '' && window.winActiveBlock['focusNow'] != statusMasterDetailGridToGrid.parent){
                                    statusMasterDetailGridToGrid.child = window.winActiveBlock['focusNow'];
                                }
                                
                            }else{
                                if(winAddData && this.config.id != window.winFlagInsertBlock && isBlockValidated(window.winFlagInsertBlock) == false ){
                                    $$(this.config.id).unselect();
                                    $$(this.config.id).clearSelection();
                                    view = $$(window.winFlagInsertBlock);
                                    let pos = view.getSelectedId();
                                    window.winActiveBlock.focusNow = window.winFlagInsertBlock;
                                    window.winActiveCell = {'pos':pos,'view':view}
                                    webix.UIManager.setFocus(view)
                                    return false
                                }else if(winAddData && $$(window.winFlagInsertBlock).validate()) {
                                    
                                    if (window.winFlagInsertChild.length != 0) {
                                        // Kondisi ItemClick saat Add Memiliki Child (CHILD - GRANDCHILD)
                                        if (this.config.id != window.winFlagInsertChild[0] && isBlockValidated(window.winFlagInsertChild[0]) == false) {
                                            $$(window.winFlagInsertBlock).unselect();
                                            $$(window.winFlagInsertBlock).clearSelection();
                                            view = $$(window.winFlagInsertChild[0]);
                                            let pos = view.getSelectedId();
                                            window.winActiveBlock.focusNow = window.winFlagInsertChild[0];
                                            window.winActiveCell = {'pos':pos,'view':view}
                                            webix.UIManager.setFocus(view)
                                            return false
                                        }
                                    }else{
                                        // Kondisi ItemClick saat Add Tidak Memiliki Child (GRANDCHILD/CHILD TOK)
                                        if (this.config.id != window.winFlagInsertBlock && isBlockValidated(winFlagInsertBlock) == false) {
                                            view = $$(winFlagInsertBlock);
                                            pos = view.getSelectedId();
                                            window.winActiveBlock.focusNow = winFlagInsertBlock;
                                            window.winActiveCell = {'pos':pos,'view':view}
                                            webix.UIManager.setFocus(view)
                                            return false
                                        }
                                    }
                                }else{
                                    webix.UIManager.setFocus(view)
                                    window.winActiveBlock.focusNow = this.config.id
                                    let pos = view.getSelectedId();
                                    window.winActiveCell = {'pos':pos,'view':view}
                                }
                                // if(window.isGridToGrid && $$(window.winFlagInsertBlock).validate() && window.winFlagInsertBlock == this.config.id){
                                //     $$(window.winFlagInsertBlock).unselect();
                                //     $$(window.winFlagInsertBlock).clearSelection();
                                //     view = $$(window.winActiveBlock.lastFocus);
                                //     let pos = view.getSelectedId();
                                //     window.winActiveBlock.focusNow = window.winActiveBlock.lastFocus;
                                //     window.winActiveCell = {'pos':pos,'view':view}
                                //     webix.UIManager.setFocus(view)
                                //     return false
                                // }
                            } 
                        }
                        // end mar
                        let thisColumn = view.config.columns[view.getColumnIndex(window.winActiveCell['pos'].column)]
                        if (!window.winIdAttach.includes(thisColumn.id)){
                            window.winIdAttach.push(thisColumn.id)
                        }
                        if(thisColumn.jenis=="checkBox"){
                            if(!thisColumn.disabledItem){
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
                            }
                        }else if(thisColumn.jenis=="customElement"){

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
                                    if(!(winValidatePromise instanceof Promise)){
                                        view.edit(pos);
                                    }else{
                                        winValidatePromise.then(function(respond){
                                            if(respond.status == true || winValidateItemPos.pos.column == pos.column){
                                                view.edit(pos);
                                            }
                                        })
                                    }
                                }
                            }else if(window.winSearchMode==true){
                                window.winActiveCell = {"pos":pos, "view":view}
                                if(!winDisplayItem.includes(pos.column)){
                                    view.edit(pos);
                                }
                            }else{
                                let inArrayPK = winConfigForm[window.winActiveBlock['focusNow']]["PRIMARY_KEY"].includes(pos.column)
                                if(inArrayPK == false){
                                    if(!(winValidatePromise instanceof Promise)){
                                        view.edit(pos);
                                    }else{
                                        winValidatePromise.then(function(respond){
                                            if(respond.status == true || winValidateItemPos.pos.column == pos.column){
                                                view.edit(pos);
                                            }
                                        })
                                    }
                                    window.winActiveCell = {"pos":pos, "view":view}
                                }
                                window.winActiveCell = {"pos":pos, "view":view}
                            }
                        }
                    }
                },
                onFocus:function(){
                    console.log("============ ON FOCUS ============");
                    
                    let activeBlock = this.config.id
                    
                    if(window.isGridToGrid){
                        if (winAddData) {
                            
                            let statusBlock = winConfigForm[activeBlock]["BLOCK_TYPE"][1]
                            if (winJenisAddValue == 'PARENT') {
                                if (statusBlock == 'PARENT') {
                                    if (haveRowAdded == false) {
                                        $$('addRowDb').show();
                                    }else{
                                        $$('addRowDb').hide();
                                    }
                                }else if(statusBlock == 'CHILD'){
                                    $$('addRowDb').show();
                                }
                            }else if(winJenisAddValue == 'CHILD'){
                                if (statusMasterDetailGridToGrid.grandchild != '') {
                                    if (statusBlock == 'CHILD') {
                                        if (haveRowAdded == false) {
                                            $$('addRowDb').show();
                                        }else{
                                            $$('addRowDb').hide();
                                        }
                                    }else if(statusBlock == 'GRANDCHILD'){
                                        $$('addRowDb').show();
                                    }
                                }else{
                                    $$('addRowDb').show();
                                }
                            }else{
                                if (statusBlock == 'CHILD' || statusBlock == 'PARENT') {
                                    $$('addRowDb').hide();
                                }else{
                                    $$('addRowDb').show();
                                }
                            }                        
                        }
                        
                        
                    }
                    
                    
                    if(window.winActiveBlock["focusNow"]==""){
                        window.winActiveBlock["focusNow"] = this.config.id
                        webix.html.addCss($$(window.winActiveBlock["focusNow"]).getNode(), "datablock-focus")
                    }else if(window.winActiveBlock["focusNow"]==this.config.id){
                        let blocks = Object.keys(winConfigForm)
                        if(blocks.includes(window.winActiveBlock["lastFocus"])){
                            webix.html.removeCss($$(window.winActiveBlock["lastFocus"]).getNode(), "datablock-focus")
                        }
                        webix.html.addCss($$(window.winActiveBlock["focusNow"]).getNode(), "datablock-focus")
                    }else if(window.winActiveBlock["focusNow"]!=this.config.id && $$(window.winActiveBlock["focusNow"]).validate()==true){
                        window.winActiveBlock["lastFocus"] = window.winActiveBlock["focusNow"]
                        window.winActiveBlock["focusNow"] = this.config.id
                        if(window.winActiveBlock["lastFocus"]!=""){
                            webix.html.removeCss($$(window.winActiveBlock["lastFocus"]).getNode(), "datablock-focus")
                        }
                        webix.html.addCss($$(window.winActiveBlock["focusNow"]).getNode(), "datablock-focus")
                    }else if(window.isGridToGrid && winAddData && window.winActiveBlock['focusNow']!=this.config.id 
                        && ($$(window.winActiveBlock["focusNow"]).validate()==false || $$(window.winActiveBlock["focusNow"]).validate()=='' || $$(window.winActiveBlock["focusNow"]).validate()==undefined)){
                        if($$(window.winFlagInsertBlock).validate()){
                            window.winActiveBlock["focusNow"] = window.winFlagInsertChild[0]
                        }else{
                            window.winActiveBlock["focusNow"] = window.winFlagInsertBlock
                        }
                        validateAndFocus(window.winActiveBlock["focusNow"])
                        
                    }else if(window.winActiveBlock["focusNow"]!=this.config.id && $$(window.winActiveBlock["focusNow"]).validate()==false){
                        if(!isWebixPopupOpen()){
                            webix.alert(ALERT.ALERTERROR('Validasi Gagal'))
                        }
                    }
                    
                    
                 
                },
                onBeforeEditStart:function(cell){
                    console.log("============ ON BEFORE EDIT START ============");
                    this.select(cell.row, cell.column)
                    if(this.getColumnConfig(cell.column).preItem){
                        if(!this.getColumnConfig(cell.column).preItem()){
                            winAllowEditCell = false
                            this.editCancel();
                        }else{
                            winAllowEditCell = true
                        }
                    }else{
                        winAllowEditCell = true
                    }
                    if(this.getColumnConfig(cell.column).isPrimaryKey && this.getColumnConfig(cell.column).jenis =="combo"){
                        if(winAddData && !winIdOldRecordDt[this.config.id].includes(this.getSelectedId().row)|| winSearchMode ){
                            winAllowEditCell = true
                        }else{
                            winAllowEditCell = false
                            this.editCancel();
                        }
                    }
                    
                },
                onBeforeEditStop:function(state,editor){
                    console.log("============ ON BEFORE EDIT STOP ============");

                    let item = this.getColumnConfig(editor.column)
                    if (window.winDateType.includes(editor.column) || window.winDateTypeMMYY.includes(editor.column)){
                            if(state.value!="" && state.value!=null){
                                if(state.value.length != item.maxLength){
                                    state.value = state.value.split("-").reverse().join("-");
                                    state.value = state.value.substring(state.value.length-item.maxLength)
                                }
                                if(state.value.length==item.maxLength && state.value.split("-").length>1 && state.value.split("-")[0].length==4){
                                    state.value = state.value.split("-").reverse().join("-");
                                } 
                                state.value = cekDate(state.value, item.formatJenis);
                            }
                    }
                },
                onAfterEditStart:function(){
                    console.log("============ ON AFTER EDIT START ============");

                    if(winAllowEditCell){
                        let editState = this.getEditState()
                        this.select(winActiveCell.pos.row, editState.column)
                        this.refresh()
                        let blocks = Object.keys(winConfigForm)
                        let view = this
                        let pos = view.getSelectedId();
                        window.winActiveCell = {'pos':pos,'view':view}
                        
                        let thisColumn = view.config.columns[view.getColumnIndex(window.winActiveCell['pos'].column)]
                        attchActionEvent(thisColumn)
                        if(thisColumn.jenis!="textarea"){
                            $$(window.winActiveBlock.focusNow).getEditor().getInputNode().setAttribute("maxlength",thisColumn.maxLength)
                        }
                        if(thisColumn.editor=="combo"){
                            let pos = view.getSelectedId();
                            oldValueCombo = $$(view.config.id).getItem(pos.row)[pos.column]
                        }
                        window.winDataAwalDt = view.getItem(pos.row)[pos.column]
                    }else{
                        this.editCancel()
                    }
                },
                onAfterEditStop:function(state,editor){
                    console.log("============ ON AFTER EDIT STOP ============");
                    
                    if(!winAddRecord && !winNextRecord && !winPrevRecord && !winDeleteRecord && !winSearchRecord && !winClearResetRecord){
                        if(editor.config.jenis=="lov"){
                            webix.UIManager.removeHotKey("ctrl+l", null, this);
                        }
                        window.winOldCellLov = this.getItem(window.winActiveCell['pos'].row)[window.winActiveCell['pos'].column]
                        
                        if(editor.config.jenis!='textarea'){
                            // jika bukan text area
                            if(window.winOpenPopUp=="closed"){
                                if (editor.config.jenis!="combo"){
                                    let status = false;
                                    window.winEditor = {row:editor.row,column:editor.column}
                                    winValidateItemPos = {'pos':{'row':editor.row,'column':editor.column,'id':editor.row+'_'+editor.column},'view':this}
                                    if (isGridToGrid) {
                                        winConfigForm[this.config.id]['WIN_ACTIVE_CELL_BLOCK'] = window.winValidateItemPos
                                    }
                                    let validationData = this.getColumnConfig(editor.column).validateItem(state.value)
                                    winValidatePromise = validationData
                                    let view = this
                                    validationData.then(function(respond){
                                        if(winSearchMode){
                                            respond.status = true
                                        }
                                        status = respond.status
                                        if(window.winOpenPopUp=="closed"){
                                            if (isGridToGrid) {
                                                checkFailedValidateItem(status,winValidateItemPos.view.config.id,winValidateItemPos.pos.row,winValidateItemPos.pos.column)
                                            }
                                            if (status){
                                                
                                                $$(window.winActiveBlock.focusNow).detachEvent("onKeyPress");
                                                winValidatePromise = {}
                                                if(state.value!="" && state.value!=state.old){
                                                    checkToDatachanged({rowId:editor.row, columnId:editor.column,blockActive:view.config.id})
                                                }
                                            }else{
                                                if(isWebixPopupOpen()==false){
                                                    if (editor.config.jenis != "checkBox") {
                                                        if (respond.tipe=="info"){
                                                            webix.alert(ALERT.ALERTINFO(respond.pesan+"<br><br><strong>Kolom "+editor.config.header[0].text+"</strong>")).then(
                                                                function(){
                                                                    $$(window.menuId).enable()//enable
                                                                    winValidateItemPos.view.edit(winValidateItemPos.pos)
                                                                }
                                                                )
                                                        }else if (respond.tipe=="warning"){
                                                            webix.alert(ALERT.ALERTWARNING(respond.pesan+"<br><br><strong>Kolom "+editor.config.header[0].text+"</strong>")).then(
                                                                function(){
                                                                    $$(window.menuId).enable()//enable
                                                                    winValidateItemPos.view.edit(winValidateItemPos.pos)
                                                                }
                                                                )
                                                        }else if (respond.tipe=="error"){
                                                            webix.alert(ALERT.ALERTERROR(respond.pesan+"<br><br><strong>Kolom "+editor.config.header[0].text+"</strong>")).then(
                                                                function(){
                                                                    
                                                                    $$(window.menuId).enable()//enable
                                                                    winValidateItemPos.view.edit(winValidateItemPos.pos)
                                                                }
                                                                )
                                                        }else{
                                                            webix.alert(ALERT.ALERTERROR("<strong>Kolom "+editor.config.header[0].text+"</strong>")).then(
                                                                function(){
                                                                    $$(window.menuId).enable()//enable
                                                                    winValidateItemPos.view.edit(winValidateItemPos.pos)
                                                                }
                                                            )    
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    })
                                }   
                            }
                        }else{
                            // jika item jenis text area
                            let dataBaruTextArea = this.getItem(editor.row)[editor.column]
                            if(dataBaruTextArea!=window.winDataAwalDt){
                                checkToDatachanged({rowId:editor.row, columnId:editor.column, dataRow:this.getItem(editor.row)})
                            }
                        }
                        
                        
                        let item = this.getColumnConfig(editor.column)
                        let wdLov = winActiveBlock.focusNow
                        if (window.winDateType.includes(editor.column) || window.winDateTypeMMYY.includes(editor.column)){
                            if(winOpenPopUp == "open"){
                                // if(editor.config.jenis=="lov"){
                                winActiveBlock.focusNow = winActiveBlock.lastFocus
                                // }
                            }
                            window.winDataChanged[window.winActiveBlock['focusNow']].forEach(function(record){
                                if(record.id==editor.row){
                                    let idx = winDataChanged[window.winActiveBlock['focusNow']].indexOf(record)
                                    if(record[editor.column]!="" && record[editor.column]!=null){
                                        if(record[editor.column].length != item.maxLength){
                                            record[editor.column] = record[editor.column].split("-").reverse().join("-");
                                            record[editor.column] = record[editor.column].substring(record[editor.column].length-item.maxLength)
                                        }
                                        if(record[editor.column].length==item.maxLength && record[editor.column].split("-").length>1 && record[editor.column].split("-")[0].length==4){
                                            record[editor.column] = record[editor.column].split("-").reverse().join("-");
                                        } 
                                        record[editor.column] = cekDate(record[editor.column], item.formatJenis);
                                    }
                                }
                            })
                            if(winOpenPopUp == "open"){
                                if(editor.config.jenis=="lov"){
                                    winActiveBlock.focusNow = wdLov
                                }
                            }
                        }

                        let dtTable = this
                        let promiseAll = []
                        let columnFooter = []
                        
                        for (let column of dtTable.config.columns) {
                            if(column.customFooter!=undefined){
                                columnFooter.push(column)
                                promiseAll.push(updateFooterDt(dtTable,column))
                            }
                        }

                        Promise.all(promiseAll).then(function(respond){
                            let level = 0
                            respond.forEach(function(result,index){
                                columnFooter[index]['footer']=result
                                if(result.length>level){
                                    level = result.length
                                    dtTable.define("footerLevel",result.length) 
                                    dtTable.define("height",dtTable.$height+=(result.length*43))
                                }
                            })
                            dtTable.refreshColumns();
                            // dtTable.resize()
                        })
    
                        webix.UIManager.setFocus($$(window.winActiveBlock['focusNow']));
                    }
                }, 
                onEditorChange: function(id, value){
                    console.log("============ ON EDITOR CHANGE ============");

                    // let view = $$(window.winActiveBlock['focusNow'])
                    // let pos = view.getSelectedId();
                    // window.winActiveCell = {'pos':pos,'view':view}
                    window.winEditor = {row:id.row,column:id.column}
                    if(this.getColumnConfig(id.column).jenis=="currency"){
                        value = this.getColumnConfig(id.column).editFormat(value)
                    }else{
                        if(this.getColumnConfig(id.column).format){
                            value = this.getColumnConfig(id.column).format(value)
                        }
                    }

                    let item = this.getColumnConfig(id.column)
                    if(item.jenis == "lov" && window.winActiveBlock.focusNow == item.wdLOV){
                        window.winActiveBlock.focusNow = window.winActiveBlock.lastFocus
                    }
                    window.winDataRow = $$(window.winActiveBlock['focusNow']).getItem(id.row)
                    if (window.winDateType.includes(id.column) || window.winDateTypeMMYY.includes(id.column)){
                        window.winDataChanged[winActiveBlock.focusNow].forEach(function(record){
                            if(record.id==id.row){
                                let idx = winDataChanged[winActiveBlock.focusNow].indexOf(record)
                                if(record[id.column]!="" && record[id.column]!=null){
                                    if(record[id.column].length != item.maxLength){
                                        record[id.column] = record[id.column].split("-").reverse().join("-");
                                        record[id.column] = record[id.column].substring(record[id.column].length-item.maxLength)
                                    }
                                    if(record[id.column].length==item.maxLength && record[id.column].split("-").length>1 && record[id.column].split("-")[0].length==4){
                                        record[id.column] = record[id.column].split("-").reverse().join("-");
                                    } 
                                    record[id.column] = cekDate(record[id.column], item.formatJenis);
                                }
                            }
                        })
                    }

                    winDataRow[id.column] = value
                    let datarowEditorchanged = webix.copy(winDataRow)
                    
                    checkToDatachanged({rowId:id.row, columnId:id.column, dataRow:datarowEditorchanged}) 
                    
                    if (window.winDateType.includes(id.column) || window.winDateTypeMMYY.includes(id.column)){
                        window.winDataChanged[winActiveBlock.focusNow].forEach(function(record){
                            if(record.id==id.row){
                                if(record[id.column]!="" && record[id.column]!=null){
                                    if(record[id.column].length != item.maxLength){
                                        record[id.column] = record[id.column].split("-").reverse().join("-");
                                        record[id.column] = record[id.column].substring(record[id.column].length-item.maxLength)
                                    }
                                    if(record[id.column].length==item.maxLength && record[id.column].split("-").length>1 && record[id.column].split("-")[0].length==4){
                                        record[id.column] = record[id.column].split("-").reverse().join("-");
                                    } 
                                    record[id.column] = cekDate(record[id.column], item.formatJenis);
                                }
                            }
                        })
                    }
                },
                onCheck:function(row, col, val){

                    let view = $$(window.winActiveBlock['focusNow'])
                    let pos = { column:col, row:row}
                    let headerColumn = this.getColumnConfig(col).header[0].text
                    window.winActiveCell = {'pos':pos,'view':view}
                    window.winEditor = {row:row,column:col}
                    let blocks = Object.keys(winConfigForm)
                    let columnsDt = this.config.columns
                    view.getColumnConfig(col).searchItem = true
                    view.refresh()
                    let recordActive = $$(window.winActiveBlock.focusNow).getItem(row);
                    window.winValidateItemPos = winActiveCell
                    
                    if(window.winAddData==true){
                        window.winActiveCell = {"pos":pos, "view":view}
                        let editCellAddData = true
                        function checkValueOld(idPos) {
                            let oldVal = ''
                            winDataDtSelect[winActiveBlock.focusNow].every(function (data) {
                                if (idPos == data["id"]) {
                                    oldVal = data[col]
                                    return false
                                }
                                return true
                            })
                            return oldVal
                        }
                        for (let x=0; x<window.winIdOldRecordDt[winActiveBlock.focusNow].length; x++){
                            if (window.winIdOldRecordDt[winActiveBlock.focusNow][x] == pos.row) {
                                val = checkValueOld(window.winIdOldRecordDt[winActiveBlock.focusNow][x])
                                recordActive[col] = val
                                editCellAddData = false
                                break;
                            }
                        }
                        if(editCellAddData){
                            this.getColumnConfig(col).validateItem().then((respond)=>{
                                if (isGridToGrid) {
                                    checkFailedValidateItem(respond.status,winActiveBlock.focusNow,window.winActiveCell.pos.row,window.winActiveCell.pos.column)
                                }
                                if(respond.status){
                                    recordActive[col] = val
                                    winDataRow = recordActive
        
                                    let datarowOnCheck = webix.copy(winDataRow)
                                    
                                    checkToDatachanged({rowId:row, columnId:col, dataRow:datarowOnCheck})
                                    
                                    let item = this.getColumnConfig(col)
                                    if (window.winDateType.includes(col) || window.winDateTypeMMYY.includes(col)){
                                        window.winDataChanged[winActiveBlock.focusNow].forEach(function(record){
                                            if(record.id==row){
                                                let idx = winDataChanged[winActiveBlock.focusNow].indexOf(record)
                                                
                                                if(record[col].length != item.maxLength){
                                                    record[col] = record[col].split("-").reverse().join("-");
                                                    record[col] = record[col].substring(record[col].length-item.maxLength)
                                                }
                                                if(record[col].length==item.maxLength && record[col].split("-").length>1 && record[col].split("-")[0].length==4){
                                                    record[col] = record[col].split("-").reverse().join("-");
                                                } 
                                                record[col] = cekDate(record[col], item.formatJenis);
                                            }
                                        })
                                    }
                                    let dtTable = view
                                    let promiseAll = []
                                    let columnFooter = []
                                    
                                    for (let column of dtTable.config.columns) {
                                        if(column.customFooter!=undefined){
                                            columnFooter.push(column)
                                            promiseAll.push(updateFooterDt(dtTable,column))
                                        }
                                    }
        
                                    Promise.all(promiseAll).then(function(respond){
                                        let level = 0
                                        respond.forEach(function(result,index){
                                            columnFooter[index]['footer']=result
                                            if(result.length>level){
                                                level = result.length
                                                dtTable.define("footerLevel",result.length) 
                                                dtTable.define("height",dtTable.$height+=(result.length*43))
                                            }
                                        })
                                        dtTable.refreshColumns();
                                        // dtTable.resize()
                                    })
                                }else{
                                    if(isWebixPopupOpen()==false){
                                        if (respond.tipe=="info"){
                                            webix.alert(ALERT.ALERTINFO(respond.pesan+"<br><br><strong>Kolom "+headerColumn+"</strong>"))
                                        }else if (respond.tipe=="warning"){
                                            webix.alert(ALERT.ALERTWARNING(respond.pesan+"<br><br><strong>Kolom "+headerColumn+"</strong>"))
                                        }else if (respond.tipe=="error"){
                                            webix.alert(ALERT.ALERTERROR(respond.pesan+"<br><br><strong>Kolom "+headerColumn+"</strong>"))
                                        }else{
                                            webix.alert(ALERT.ALERTERROR("<strong>Kolom "+headerColumn+"</strong>"))
                                        }
                                        if(val==this.getColumnConfig(col).checkValue){
                                            recordActive[col] = this.getColumnConfig(col).uncheckValue
                                        }else if(val==this.getColumnConfig(col).uncheckValue){
                                            recordActive[col] = this.getColumnConfig(col).checkValue
                                        }
                                    }
                                    $$(window.winActiveBlock.focusNow).updateItem(row, recordActive);
                                }
                            })    
                        }else{
                            $$(window.winActiveBlock.focusNow).updateItem(row, recordActive);
                        }
                    }else{
                        this.getColumnConfig(col).validateItem().then((respond)=>{
                            if (isGridToGrid) {
                                checkFailedValidateItem(respond.status,winActiveBlock.focusNow,window.winActiveCell.pos.row,window.winActiveCell.pos.column)
                            }
                            if(respond.status){
                                recordActive[col] = val
                                winDataRow = recordActive
    
                                let datarowOnCheck = webix.copy(winDataRow)
                                
                                checkToDatachanged({rowId:row, columnId:col, dataRow:datarowOnCheck})
                                
                                let item = this.getColumnConfig(col)
                                if (window.winDateType.includes(col) || window.winDateTypeMMYY.includes(col)){
                                    window.winDataChanged[winActiveBlock.focusNow].forEach(function(record){
                                        if(record.id==row){
                                            let idx = winDataChanged[winActiveBlock.focusNow].indexOf(record)
                                            
                                            if(record[col].length != item.maxLength){
                                                record[col] = record[col].split("-").reverse().join("-");
                                                record[col] = record[col].substring(record[col].length-item.maxLength)
                                            }
                                            if(record[col].length==item.maxLength && record[col].split("-").length>1 && record[col].split("-")[0].length==4){
                                                record[col] = record[col].split("-").reverse().join("-");
                                            } 
                                            record[col] = cekDate(record[col], item.formatJenis);
                                        }
                                    })
                                }
                                let dtTable = view
                                let promiseAll = []
                                let columnFooter = []
                                
                                for (let column of dtTable.config.columns) {
                                    if(column.customFooter!=undefined){
                                        columnFooter.push(column)
                                        promiseAll.push(updateFooterDt(dtTable,column))
                                    }
                                }
    
                                Promise.all(promiseAll).then(function(respond){
                                    let level = 0
                                    respond.forEach(function(result,index){
                                        columnFooter[index]['footer']=result
                                        if(result.length>level){
                                            level = result.length
                                            dtTable.define("footerLevel",result.length) 
                                            dtTable.define("height",dtTable.$height+=(result.length*43))
                                        }
                                    })
                                    dtTable.refreshColumns();
                                    // dtTable.resize()
                                })
                            }else{
                                if(isWebixPopupOpen()==false){
                                    if (respond.tipe=="info"){
                                        webix.alert(ALERT.ALERTINFO(respond.pesan+"<br><br><strong>Kolom "+headerColumn+"</strong>"))
                                    }else if (respond.tipe=="warning"){
                                        webix.alert(ALERT.ALERTWARNING(respond.pesan+"<br><br><strong>Kolom "+headerColumn+"</strong>"))
                                    }else if (respond.tipe=="error"){
                                        webix.alert(ALERT.ALERTERROR(respond.pesan+"<br><br><strong>Kolom "+headerColumn+"</strong>"))
                                    }else{
                                        webix.alert(ALERT.ALERTERROR("<strong>Kolom "+headerColumn+"</strong>"))
                                    }
                                    if(val==this.getColumnConfig(col).checkValue){
                                        recordActive[col] = this.getColumnConfig(col).uncheckValue
                                    }else if(val==this.getColumnConfig(col).uncheckValue){
                                        recordActive[col] = this.getColumnConfig(col).checkValue
                                    }
                                }
                                $$(window.winActiveBlock.focusNow).updateItem(row, recordActive);
                            }
                        })
                    }
                    
                },
                onAfterLoad:function(){
                    if(winConfigForm[idTable]['DATA_PER_PAGE']!=undefined){
                        let footerHeight = 0
                        if(document.getElementsByClassName("webix_ss_footer")){
                            Array.from(document.getElementsByClassName("webix_ss_footer")).every(function(divObj){
                                if(divObj.parentElement.getAttribute("view_id")==idTable){
                                    footerHeight = divObj.offsetHeight
                                    return false
                                }
                                return true
                            })
                            
                        }
                        $$(idTable).define("height", (winConfigForm[idTable]['DATA_PER_PAGE']*36)+43+footerHeight)
                        $$(idTable).resize()
                    }else{
                        let footerHeight = 0
                        if(document.getElementsByClassName("webix_ss_footer")){
                            Array.from(document.getElementsByClassName("webix_ss_footer")).every(function(divObj){
                                if(divObj.parentElement.getAttribute("view_id")==idTable){
                                    footerHeight = divObj.offsetHeight
                                    return false
                                }
                                return true
                            })
                            
                        }
                        $$(idTable).define("height", this.minHeight+footerHeight)
                        $$(idTable).resize()
                    }
                    winOperatorDt[this.config.id] = {}
                    if(!winAddData){
                        let idGenWebixDt = []
                        this.data.order.forEach(function(index){
                            idGenWebixDt.push(index)
                        })
                        window.winIdOldRecordDt[idTable] = idGenWebixDt
                        window.winPagerDatatable[idTable][1] = $$("pager_"+idTable).data.old_limit-1
                        window.winTotalRecordDt[idTable] = $$(idTable).count()
                        $$("count_"+idTable).define("count",window.winTotalRecordDt[idTable])
                        $$("count_"+idTable).define("page",window.winTotalRecordDt[idTable]-1)
                        $$("count_"+idTable).refresh()
                    }

                    let dtTable = this
                    let promiseAll = []
                    let columnFooter = []
                    
                    for (let column of dtTable.config.columns) {
                        if(column.customFooter!=undefined){
                            columnFooter.push(column)
                            promiseAll.push(updateFooterDt(dtTable,column))
                        }
                    }

                    Promise.all(promiseAll).then(function(respond){
                        let level = 0
                        respond.forEach(function(result,index){
                            columnFooter[index]['footer']=result
                            if(result.length>level){
                                level = result.length
                                dtTable.define("footerLevel",result.length) 
                                dtTable.define("height",dtTable.$height+=(result.length*43))
                            }
                        })
                        dtTable.refreshColumns();
                        dtTable.resize()
                    })

                    // tambahan adjust columns width - 4 Mar 25
                    // dtTable.config.columns.forEach(function(columnObj){
                    //     if(columnObj['jenis']!="textarea"){
                    //         dtTable.adjustColumn(columnObj['id'],"all");
                    //     }
                    // })
                    // tambahan adjust columns width - 4 Mar 25

                    dtTable.config.columns.forEach(function(colObj){
                        if(colObj.jenis!="textarea"){
                            if(colObj.jenis=="checkBox"){
                                dtTable.adjustColumn(colObj.id, "header")
                            }else{
                                dtTable.adjustColumn(colObj.id, "all")
                            }
                            
                            if(colObj.customWidth==undefined){
                                if(colObj['jenis']=="lov"){
                                    if(colObj['widthLovCol']==undefined){
                                        colObj['widthLovCol'] = colObj['width']+20
                                    }
                                    colObj['minWidth'] = colObj['widthLovCol']
                                    colObj['width'] = colObj['widthLovCol']
                                }

                                if(colObj.editor=="btnDatagrid"){
                                    colObj['minWidth'] = 150
                                    colObj['width'] = 150
                                }
                            }else{
                                colObj['minWidth'] = colObj['customWidth']
                                colObj['width'] = colObj['customWidth']
                            }
                        }
                    })
                    dtTable.refreshColumns()

                    let totalWidth2 = 0

                    if(dtTable.config.columns!=undefined){
                        dtTable.config.columns.forEach(function(col){
                            if(!col.hidden){
                                // console.log(3194,col.id, col.width)
                                totalWidth2 += col.width;
                            }
                        });
                    }else{
                        totalWidth2 = dtTable.$width
                    }

                    // console.log(3201,totalWidth2) 
                    ////console.log(2974, "onAfterLoad", dtTable.config.id)
                    // ////console.log(2974)
                    if(winLayout_v2 == true){
                        reLayoutOden(dtTable.config.id)
                    }else{
                        console.log(3193)
                        dtTable.config.columns[dtTable.config.columns.length - 1].fillspace = true
                        // newColumsThis.reverse().forEach(function(colObj){
                        //     ////console.log(3126,colObj)
                        // })
                        dtTable.refreshColumns()
                    }
                },
                onBlur:function(){
                    console.log("============ ON BLUR ============");

                    this.editStop()
                },
                onKeyPress:function(code,e){
                    console.log("============ ON KEY PRESS ============");

                    if(code==9){
                        // webix.UIManager.removeHotKey("tab", null);
                        e.preventDefault();
                        this.editStop()
                    }
                },
                onScrollX:function(){
                    let state = this.getScrollState();
                    if($$('customOperatorDatagrid_'+dtTable.id).config.hidden==false){
                        $$('customOperatorDatagrid_'+dtTable.id).scrollTo(state.x)
                    }    
                    
                },
                onValidationError: function (id, obj, details) {
                    let invalidColumns = Object.keys(details);
                    
                    // Store invalid details globally or pass them to another function
                    window.invalidColumnsDt = invalidColumns;
                }
            },
            onClick:{
                "deleteRowDt":function(event, id, node){
                    if($$(winActiveBlock.focusNow).getSelectedId() == undefined){
                        $$(window.winActiveBlock['focusNow']).select($$(winActiveBlock.focusNow).getFirstId(), "action_"+winActiveBlock.focusNow)
                    }
                    $$(window.winActiveBlock['focusNow']).unselectAll()
                    let pesan = "Apakah Anda Yakin untuk Menghapus Data: <br><br>"
                    
                    if(winConfigForm[winActiveBlock.focusNow]["BLOCK_TYPE"][1]=="PARENT"){
                        winConfigForm[winActiveBlock['focusNow']]['PRIMARY_KEY'].forEach(function(primaryId){
                            pesan+=primaryId+"&nbsp;&nbsp;:&nbsp;&nbsp;"+$$(winActiveBlock['focusNow']).getItem(id.row)[primaryId]+"<br>"
                        })
                    }else{
                        if(winThereIsSubChild){
                            let haveSubChild = [] 
                            Object.keys(winConfigForm).forEach(function (blockId) {
                                if (winConfigForm[blockId]["BLOCK_TYPE"][2] != undefined) {
                                    haveSubChild.push(blockId)
                                }
                                if (!haveSubChild.includes(winConfigForm[blockId]["BLOCK_TYPE"][2])) {
                                    if(winConfigForm[blockId]["BLOCK_TYPE"][2]!= undefined){
                                        haveSubChild.push(winConfigForm[blockId]["BLOCK_TYPE"][2])
                                    }
                                }
                            })
                            let parentBlockId = getBlockParent()
                            if (!haveSubChild.includes(winActiveBlock.focusNow)) {
                                winConfigForm[parentBlockId]['PRIMARY_KEY'].forEach(function(primaryId){
                                    if(getItemValue(primaryId)!=undefined){
                                        let labelItem = ""
                                        if($$(parentBlockId).config.view == "form"){
                                            labelItem = $$(primaryId).config.label
                                        }else if($$(parentBlockId).config.view == "datatable"){
                                            labelItem = $$(winActiveBlock['focusNow']).getColumnConfig(primaryId).header[0]['text']
                                        }
                                        pesan+=labelItem+"&nbsp;&nbsp;:&nbsp;&nbsp;"+$$(winActiveBlock['focusNow']).getItem(id.row)[primaryId]+"<br>"
                                    }
                                })
                                winConfigForm[winActiveBlock['focusNow']]['PRIMARY_KEY'].forEach(function(primaryId){
                                    if(getItemValue(primaryId)!=undefined){
                                        if($$(winActiveBlock['focusNow']).getColumnConfig(primaryId)!=undefined){
                                            let labelItem = $$(winActiveBlock['focusNow']).getColumnConfig(primaryId).header[0]['text']
                                            pesan+=labelItem+"&nbsp;&nbsp;:&nbsp;&nbsp;"+$$(winActiveBlock['focusNow']).getItem(id.row)[primaryId]+"<br>"
                                        }
                                    }
                                })
                            }else{
                                winConfigForm[parentBlockId]['PRIMARY_KEY'].forEach(function(primaryId){
                                    if(getItemValue(primaryId)!=undefined){
                                        let labelItem = ""
                                        if($$(parentBlockId).config.view == "form"){
                                            labelItem = $$(primaryId).config.label
                                        }else if($$(parentBlockId).config.view == "datatable"){
                                            labelItem = $$(winActiveBlock['focusNow']).getColumnConfig(primaryId).header[0]['text']
                                        }
                                        pesan+=labelItem+"&nbsp;&nbsp;:&nbsp;&nbsp;"+$$(winActiveBlock['focusNow']).getItem(id.row)[primaryId]+"<br>"    
                                    }
                                })
                                if(winConfigForm[winActiveBlock['focusNow']]['BLOCK_TYPE'][1]=="SUB_CHILD"){
                                    winConfigForm[winConfigForm[winActiveBlock['focusNow']]['BLOCK_TYPE'][2]]['PRIMARY_KEY'].forEach(function(primaryId){
                                        if(winDataRow[primaryId]!=undefined){
                                            if($$(winConfigForm[winActiveBlock['focusNow']]['BLOCK_TYPE'][2]).getColumnConfig(primaryId)!=undefined){
                                                let labelItem = $$(winConfigForm[winActiveBlock['focusNow']]['BLOCK_TYPE'][2]).getColumnConfig(primaryId).header[0]['text']
                                                pesan+=labelItem+"&nbsp;&nbsp;:&nbsp;&nbsp;"+$$(winActiveBlock['focusNow']).getItem(id.row)[primaryId]+"<br>"
                                            }
                                        }
                                    })
                                }
                                else{
                                    winConfigForm[winActiveBlock['focusNow']]['PRIMARY_KEY'].forEach(function(primaryId){
                                        if(getItemValue(primaryId)!=undefined){
                                            if($$(winActiveBlock['focusNow']).getColumnConfig(primaryId)!=undefined){
                                                let labelItem = $$(winActiveBlock['focusNow']).getColumnConfig(primaryId).header[0]['text']
                                                pesan+=labelItem+"&nbsp;&nbsp;:&nbsp;&nbsp;"+$$(winActiveBlock['focusNow']).getItem(id.row)[primaryId]+"<br>"
                                            }
                                        }
                                    })
                                }    
                            }

                        }else if(window.isGridToGrid){
                            
                            winConfigForm[winActiveBlock['focusNow']]['PRIMARY_KEY'].forEach(function(primaryId){
                                if(getItemValue(primaryId)!=undefined){
                                    if($$(winActiveBlock['focusNow']).getColumnConfig(primaryId)!=undefined){
                                        let labelItem = $$(winActiveBlock['focusNow']).getColumnConfig(primaryId).header[0]['text']
                                        pesan+=labelItem+"&nbsp;&nbsp;:&nbsp;&nbsp;"+$$(winActiveBlock['focusNow']).getItem(id.row)[primaryId]+"<br>"
                                    }
                                }
                            })
                        }else{
                            let parentBlockId = getBlockParent()
                            winConfigForm[parentBlockId]['PRIMARY_KEY'].forEach(function(primaryId){
                                if(getItemValue(primaryId)!=undefined){
                                    let labelItem = ""
                                    if($$(parentBlockId).config.view == "form"){
                                        labelItem = $$(primaryId).config.label
                                    }else if($$(parentBlockId).config.view == "datatable"){
                                        labelItem = $$(winActiveBlock['focusNow']).getColumnConfig(primaryId).header[0]['text']
                                    }
                                    pesan+=labelItem+"&nbsp;&nbsp;:&nbsp;&nbsp;"+$$(winActiveBlock['focusNow']).getItem(id.row)[primaryId]+"<br>"
                                }
                            })
                            
                            winConfigForm[winActiveBlock['focusNow']]['PRIMARY_KEY'].forEach(function(primaryId){
                                if(getItemValue(primaryId)!=undefined){
                                    if($$(winActiveBlock['focusNow']).getColumnConfig(primaryId)!=undefined){
                                        let labelItem = $$(winActiveBlock['focusNow']).getColumnConfig(primaryId).header[0]['text']
                                        pesan+=labelItem+"&nbsp;&nbsp;:&nbsp;&nbsp;"+$$(winActiveBlock['focusNow']).getItem(id.row)[primaryId]+"<br>"
                                    }
                                }
                            })
                            
                        }
                        
                    }
                    if(isGridToGrid && winConfigForm[winActiveBlock.focusNow]['BLOCK_TYPE'][1]==winJenisAddValue){
                        if (statusMasterDetailGridToGrid.grandchild != "") {
                            if(winJenisAddValue=='PARENT'){
                                pesan += '<br/>'+'Data dari block : '+' '+'<b>'+statusMasterDetailGridToGrid.child+'</b>'+' '+'akan ikut terhapus!' 
                            }else if(winJenisAddValue=='CHILD'){
                                pesan += '<br/>'+'Data dari block : '+' '+'<b>'+statusMasterDetailGridToGrid.grandchild+'</b>'+' '+ 'akan ikut terhapus!' 
                            }
                        }
                    }
                    webix.confirm({
                        title:"Konfirmasi Hapus Data Insert",
                        text:pesan,
                        cancel:"Batal",
                        type:"alert-warning"
                    }).then(function(result){
                        if(result){
                            if(winThereIsSubChild){
                                let haveSubChild = [] 
                                Object.keys(winConfigForm).forEach(function (blockId) {
                                    if (winConfigForm[blockId]["BLOCK_TYPE"][2] != undefined) {
                                        haveSubChild.push(blockId)
                                    }
                                    if (!haveSubChild.includes(winConfigForm[blockId]["BLOCK_TYPE"][2])) {
                                        if(winConfigForm[blockId]["BLOCK_TYPE"][2]!= undefined){
                                            haveSubChild.push(winConfigForm[blockId]["BLOCK_TYPE"][2])
                                        }
                                    }
                                })
                                if (!haveSubChild.includes(winActiveBlock.focusNow)) {
                                    let idDelRow = id.row
                                    let indxDelRow
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
                                    
                                    $$(window.winActiveBlock['focusNow']).remove(idDelRow);
                                    let row_id = $$(window.winActiveBlock['focusNow']).getLastId();
                                    $$(window.winActiveBlock['focusNow']).select(row_id,$$(window.winActiveBlock['focusNow'])['config']['columns'][0]['id'], false)
                                }else{
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
                                            }
                                        }
                                        if(blockId == ChildParent){
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
                                }
                            }else{
                                let idDelRow = id.row
                                let indxDelRow
                                if(isGridToGrid){
                                    if (winAddData) {
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
                                        }else{
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
                                        }
                                    }
                                }else{
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
                                }
                                $$(window.winActiveBlock['focusNow']).remove(idDelRow);
                                let row_id = $$(window.winActiveBlock['focusNow']).getLastId();
                                $$(window.winActiveBlock['focusNow']).select(row_id,$$(window.winActiveBlock['focusNow'])['config']['columns'][0]['id'], false)
                            }
                            
                        }
                    });
                }
            },
            ready:function(){
            }
        }

        let pagerCustom = {
			view:"pager",
			id:"pager_"+idTable,
			size:winConfigForm[idTable]['DATA_PER_PAGE'] || 10,
			// group:5,
            width:140,
            count:0,
			template: "&nbsp;Page {common.page()} from #limit#",
            css:{
                "margin-top":"inherit !important",
            }
		};
        winAdditionalTemplate["pager_"+idTable] = "&nbsp;Page {common.page()} from #limit#"


        function attchActionEvent(){
            let thisColumn = $$(winActiveBlock.focusNow).getColumnConfig($$(winActiveBlock.focusNow).getSelectedId().column)
            if($$(window.winActiveBlock['focusNow']).config.view=="datatable"){
                $$(winActiveBlock.focusNow).detachEvent("onKeyPress");
                if(thisColumn.jenis=="number"){
                    $$(window.winActiveBlock.focusNow).attachEvent("onKeyPress",function(code,e){
                        if ((code < 48 || code > 57) && code != 190 && code!=8 && code!=9 && code!=13 && code!=37 && code!=39 && code!=189) {
                            e.preventDefault()
                        }
                    });
                }
                if(thisColumn.jenis=="float"){
                    $$(window.winActiveBlock.focusNow).attachEvent("onKeyPress",function(code,e){
                        if ((code < 48 || code > 57) && code != 190 && code!=8 && code!=9 && code!=13 && code!=37 && code!=39) {
                            e.preventDefault()
                        }
                    });
                }
                if(thisColumn.jenis=="currency"){
                    $$(window.winActiveBlock.focusNow).attachEvent("onKeyPress",function(code,e){
                        if ((code < 48 || code > 57) && code != 190 && code!=8 && code!=9 && code!=13 && code!=37 && code!=39) {
                            e.preventDefault()
                        }
                    },thisColumn)
                }else if(thisColumn.jenis=="date"){
                    $$(window.winActiveBlock.focusNow).attachEvent("onKeyPress",function(code,e){
                        if ((code < 48 || code > 57) && code!=8 && code!=9 && code!=13 && code!=37 && code!=39) {
                            e.preventDefault()
                        }
                        // view.getColumnConfig()
                    })
                }else if(thisColumn.jenis=="clock"){
                    $$(window.winActiveBlock.focusNow).attachEvent("onKeyPress",function(code,e){
                        if ((code < 48 || code > 58) && code!=8 && code!=9 && code!=13 && code!=37 && code!=39) {
                            e.preventDefault()
                        }
                        // view.getColumnConfig()
                    })
                }else if(thisColumn.jenis=="timestamp"){
                    $$(window.winActiveBlock.focusNow).attachEvent("onKeyPress",function(code,e){
                        if ((code < 48 || code > 58) && code!=8 && code!=9 && code!=13 && code!=37 && code!=39 && code!=32) {
                            e.preventDefault()
                        }
                        // view.getColumnConfig()
                    })
                }else if(thisColumn.jenis=="lov"){
                    webix.UIManager.removeHotKey("ctrl+l", null, window.winActiveCell['view']);
                    webix.UIManager.addHotKey("ctrl+l", function(view,e){
                        if(thisColumn.restApiLov !=""){
                            thisColumn.restApiLov()
                        }
                        window.winOpenPopUp = "open";
                        e.preventDefault()
                        window.winOldCellLov = $$(view.config.id).getItem(window.winActiveCell['pos'].row)[window.winActiveCell['pos'].column]
                        window.winActiveBlock['lastFocus'] = window.winActiveBlock['focusNow'] 
                        window.winActiveBlock['focusNow'] = thisColumn.wdLOV
                        $$(window.winActiveBlock['lastFocus']).editCancel();
                        $$(thisColumn.wdLOV).show()
                    },window.winActiveCell['view'])
                }else if(thisColumn.jenis=="telephone"){                    
                    $$(window.winActiveBlock.focusNow).attachEvent("onKeyPress",function(code,e){  
                        if ((code < 48 || code > 57) && code!=8 && code!=9 && code!=13 && code!=37 && code!=39) {                            
                            e.preventDefault()                        
                        }                    
                    });                
                }
            }
        }

        function onEnterCheckbox(view,pos,thisColumn){
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

        this.addElement(dtTable,columnsCustom)

        // let totalCountDt = {
        //     view:"label",
        //     label:"&nbsp;Showing {Object.keys(winConfigForm).length} from {Object.keys(winConfigForm).length}"
        // }

        let countCustom = {
            view:"pager",
            id:"count_"+idTable,
            master:false,
            width:300,
            size: 1,
            template: '- &nbsp;Showing {common.page()} &nbsp;&nbsp;from #limit#&nbsp;',
            css:{
                "margin-top":"inherit !important",
            },
        };
		if(winConfigForm[idTable]["BASE_TABLE"] == true || winConfigForm[idTable]["BASE_TABLE"] == undefined ){
            countCustom.template = `- &nbsp;Showing {common.page()} &nbsp;&nbsp;from #limit#&nbsp;&nbsp;
                    <a id="viewCount" style="cursor:pointer;text-decoration:underline; vertical-align:middle;display: inline-block;
                        position: relative; 
                        z-index: 1;" onclick="restapi.restApiCountData('${idTable}')"/>
                    <span style = "display: inline-block;margin-top:-2px">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="#475466" id="Bold" viewBox="0 0 24 24" width="14" height="14"><path d="M12,0A12,12,0,1,0,24,12,12.013,12.013,0,0,0,12,0Zm0,21a9,9,0,1,1,9-9A9.011,9.011,0,0,1,12,21Z"/><path d="M11.545,9.545h-.3A1.577,1.577,0,0,0,9.64,10.938,1.5,1.5,0,0,0,11,12.532v4.65a1.5,1.5,0,0,0,3,0V12A2.455,2.455,0,0,0,11.545,9.545Z"/><path d="M11.83,8.466A1.716,1.716,0,1,0,10.114,6.75,1.715,1.715,0,0,0,11.83,8.466Z"/></svg>

                    </span>    
                    </a>`,
            Object.assign(countCustom, 
                {
                    on:{
                        "onAfterRender": function(){
                            let popupCount = function(idTable) {
                                var popuptotaldata = webix.ui({
                                    view: 'popup',
                                    id: 'popupcount'+idTable,
                                    height:75,
                                    width:100,
                                    css:{
                                        "border-radius":"10px"
                                    },
                                    body:{
                                        view: "text",
                                        id: "totalcount"+idTable,
                                        value: "",
                                        readonly:true
                                    }
                                })
                                return popuptotaldata
                            }
                                popupCount(idTable)
                        }
                        }
                    })
        }

        let belowDatagrid = {cols:[pagerCustom,countCustom,{}]}
        if(additionalButton!=undefined){
            if(additionalButton.length!=0){
                additionalButton.forEach(function(button){
                    belowDatagrid.cols.push(button)
                })
            }
        }
        

        let customOperatorDatagrid = {
            view:"datatable", 
            header:false,
            autoheight:true,
            borderless:true,
            hidden:true,
            select:false,
            blockselect:false,
            id:'customOperatorDatagrid_'+dtTable.id,
            columns:[],
            on:{
                onScrollX:function(){
                    let state = this.getScrollState();
                    $$(dtTable.id).scrollTo(state.x)  
                },
            }
        }
        if(winConfigForm[dtTable.id]["BLOCK_TYPE"][1] != "NONE"){
            this.addActionColumn(dtTable, idTable, additionalCustomOperator, actionDatagrid)
        }
        if(winConfigForm[dtTable.id]["BLOCK_TYPE"][1] == "SUB_CHILD"){
            if(!winSubChild.hasOwnProperty(winConfigForm[dtTable.id]["BLOCK_TYPE"][2])){
                winSubChild[winConfigForm[dtTable.id]["BLOCK_TYPE"][2]] = []
                winSubChild[winConfigForm[dtTable.id]["BLOCK_TYPE"][2]].push(dtTable.id)
            }else{
                winSubChild[winConfigForm[dtTable.id]["BLOCK_TYPE"][2]].push(dtTable.id)
            }
        }
		return [dtTable,customOperatorDatagrid ,belowDatagrid]
    }

    addActionColumn(dtTable, idTable, additionalCustomOperator, actionDatagrid){
        let thisDatatable = dtTable 
        if(actionDatagrid['delete']==undefined){
            actionDatagrid['delete'] = 'temp'
        }
        function actionDatagridDelete(obj){
            if(actionDatagrid['delete']!=undefined){
                let delicon = "<span class='deleteRowDt mdi mdi-24px mdi-delete-empty' style='color:red;'></span>";
                if(winIdOldRecordDt[idTable]!=undefined){
                    if(winIdOldRecordDt[idTable].length!=0){
                        if(actionDatagrid['delete']=="temp"){
                            if(winIdOldRecordDt[idTable].includes(obj.id)){
                                return ''
                            }else{
                                return delicon
                            }
                        }else{
                            return delicon
                        }
                    }else{
                        return delicon
                    }
                }else{
                    return ''
                }
            }else{
                return false
            }
        }
        
        
        
        function actionDatagridStatus(obj){
            if(actionDatagrid['status']!=undefined){
                let checkGreen = "<span class='statusTrueDt mdi mdi-24px mdi-checkbox-marked-circle-outline' style='color:green;'></span>";
                let closeRed = "<span class='statusFalseDt mdi mdi-24px mdi-close-circle-outline' style='color:red;'></span>";
                
                let value = obj[actionDatagrid['status']]
                if(value==true || value=='Y' || value==1 || value=="1"){
                    return checkGreen
                }else{
                    return closeRed
                }
            }else{
                return false
            }
        }

        let lastColumn = { id:"action_"+idTable, header:[{ text:"ActionButton",css:{'text-align':'center'}}],css:{'text-align':'center'},width:200, template:function(obj, common, value, config){
            let customTemplate = [actionDatagridStatus(obj),actionDatagridDelete(obj)]
            let copytampungan = webix.copy(customTemplate)
            copytampungan.forEach(function(value){
                if(value==false){
                    customTemplate.splice(copytampungan.indexOf(value),1)
                }
            })
            let templatehtml = ''
            if(customTemplate.length>0){
                customTemplate.forEach(function(icon){
                    if(customTemplate.indexOf(icon)==customTemplate.length-1){
                        templatehtml+=icon
                    }else{
                        templatehtml+=(icon+"&emsp;")
                    }
                    
                })
            }
            let statusHtml = false
            let delBtn = false
            if(templatehtml.includes("circle-outline")){
                statusHtml = true
            }
            if(templatehtml.includes("delete-empty")){
                delBtn = true
            }
            if(statusHtml && delBtn){
                $$(idTable).getColumnConfig("action_"+idTable).header = 'Status Data | Delete Row';
                $$(idTable).getHeaderNode("action_"+idTable).innerHTML = 'Status Data | Delete Row';
            }else if(statusHtml==false && delBtn==true){
                $$(idTable).getColumnConfig("action_"+idTable).header = 'Delete Row';
                $$(idTable).getHeaderNode("action_"+idTable).innerHTML = 'Delete Row';
            }else{
                $$(idTable).getColumnConfig("action_"+idTable).header = 'action';
                $$(idTable).getHeaderNode("action_"+idTable).innerHTML = 'action';
            }
            return templatehtml
        }}
        let lastFormat = {
            editor: "",
            tooltip:"",
            // hidden:true,
        }
        thisDatatable.columns.push(Object.assign(lastColumn, lastFormat))

    }

    addElement(dtTable,items){
        let additionalFooter = []
        items.forEach(function(item,index,array){
            if(item.cols){
                for(let i in item.cols){
                    let format = {}
                    let column = {}
                    if(i==0){
                        function cekVal(value) {
                            if(value=="" || value==undefined){
                                return "‎"
                            }else{
                                return value
                            }
                        }
                        column = {
                            id: item.cols[i].id,
                            header: item.cols[i].label,
                            width: item.cols[i].customWidth || 300,
                            jenis: item.cols[i].jenis,
                            preItem: item.cols[i].preItem || function(){return true},
                            formatJenis: item.cols[i].formatJenis,
                            validateItem: item.cols[i].validateItem || function(){return {"status":true}},
                            maxLength : item.cols[i].attributes.maxlength,
                            css:item.cols[i].cssDt,
                            preItem: item.cols[i].preItem || function(){return true},
                            wdLOV:item.cols[i].idWd,
                            restApiLov:item.cols[i].restApiLov,
                            isPrimaryKey:item.cols[i].isPrimaryKey,
                            upperValue:item.cols[i].upperValue,
                            lowerValue:item.cols[i].lowerValue,
                            hideItem:item.cols[i].hidden || false,
                            inputAlign: item.cols[i].inputAlign || undefined,
                            // hidden:item.cols[i].hidden || false,
                            customFooter:item.cols[i].customFooterDt,
                            tooltip:item.cols[i].tooltip || "LOV",
                            customWidth:item.cols[i].customWidth || undefined,
                            // template:"#!"+item.cols[i].id+"#"
                            template: (r,s,val,obj,idval) => {
                                return `<div class="content_cell_icon_datagrid">${cekVal(r[item.cols[i].id])} <span class='test1 webix_input_icon mdi mdi-table-edit' style='cursor:pointer;' onclick='onClickLOVCell(this,`+r.id+`,"`+obj.id+`")'></span></div>`;
                            },
                        }
                        
                        if(item.cols[i].inputAlign != undefined){
                            if(item.cols[i].inputAlign == "right"){
                                let textAlignRightCss = webix.html.createCss({"text-align":"right !important", "background-color": "#ffe972"});
                                column.css = textAlignRightCss
                                column.template = function(r,s,val,obj,idval){
                                    return `<div class="content_cell_icon_datagrid" style="justify-content: right !important">${cekVal(r[item.cols[i].id])} <span class='test1 webix_input_icon mdi mdi-table-edit' style='cursor:pointer;' onclick='onClickLOVCell(this,`+r.id+`,"`+obj.id+`")'></span></div>`;
                                }
                            }
                        }
                        
                        
                        if(item.cols[i].width!=undefined){
                            column.width = item.cols[i].width
                        }

                        if(column.hideItem){
                            window.winHideColumnsDt[dtTable.id].push(column.id)
                        }
                        
                        let footercolumn = item.cols[i].customFooterDt || []
                        if(footercolumn.length!=0){
                            additionalFooter.push(column.id)
                        }

                        format = {
                            editor: "text",
                            format: (value) => { return value },
                            editFormat: (value) => { return value },
                        }

                        if(item.cols[i].upperValue){
                            format = {
                                editor: "text",
                                format: (value) => {
                                    return value.toUpperCase()
                                },
                                editFormat: (value) => { return value },
                                editParse: (value) => {
                                    return value.toUpperCase()
                                },
                            }
                        }

                        if(item.cols[i].lowerValue){
                            format = {
                                editor: "text",
                                format: (value) => {
                                    return value.toLowerCase()
                                },
                                editFormat: (value) => { return value },
                                editParse: (value) => {
                                    return value.toLowerCase()
                                },
                            }
                        }
                    }else{
                        column = {
                            id: item.cols[i].id,
                            header: item.cols[i].label,
                            width: 300,
                            jenis: item.cols[i].jenis,
                            formatJenis: item.cols[i].formatJenis,
                            css:item.cols[i].cssDt,
                            hideItem:item.cols[i].hidden || false,
                            inputAlign: item.cols[i].inputAlign || undefined,
                            // hidden:item.cols[i].hidden || false,
                            customFooter:item.cols[i].customFooterDt,
                            tooltip:item.cols[i].tooltip || ""  ,
                            template:"#!"+item.cols[i].id+"#",
                            customWidth:item.cols[i].customWidth || undefined
                        }

                        if(item.cols[i].width!=undefined){
                            column.width = item.cols[i].width
                        }

                        if(item.cols[i].inputAlign != undefined){
                            if(item.cols[i].inputAlign == "right"){
                                let textAlignRightCss = webix.html.createCss({"text-align":"right"});
                                column.css = textAlignRightCss
                            }
                        }

                        let footercolumn = item.cols[i].customFooterDt || []
                        if(footercolumn.length!=0){
                            additionalFooter.push(column.id)
                        }

                        if(column.hideItem){
                            window.winHideColumnsDt[dtTable.id].push(column.id)
                        }
                        format = {
                            editor: item.view,
                            format: (value) => { return value },
                            editFormat: (value) => { return value },
                        }
                    }
                    if(index===array.length-1){
                        if(winLayout_v2==true){
                            // column.minWidth = 300,
                            column.fillspace=false
                        }else{
                            // console.log(3948, column)
                            column.minWidth = 300,
                            column.fillspace=true
                        }
                    }
                    // console.log(3975, column, format)
                    dtTable.columns.push(Object.assign(column,format))
                }
            }else{
                // if(item.customFooterDt!=undefined){
                //     if(item.customFooterDt.length>dtTable.footerLevel){
                //         dtTable.footerLevel = item.customFooterDt.length
                //         dtTable.minHeight+=(item.customFooterDt.length*43)
                //         dtTable.height = dtTable.minHeight
                //     }
                // }
                let column = {}
                let format = {}
                if(item.jenis == 'btnDatagrid'){
                    column = {
                        id : item.id,
                        header : item.header,
                        fillspace : item.fillspace,
                        width : item.width,
                        template : item.template,
                        css : item.css,
                        editor : item.editor,
                        customTrigger : item.customTrigger,
                        customFooter:item.customFooterDt,
                        tooltip:"",
                        customWidth:item.customWidth || undefined
                    }
                    format = {}
                    column.minWidth = 150
                    if(index===array.length-1){
                        if(winLayout_v2==true){
                            // column.minWidth = 300,
                            column.fillspace=false
                        }else{
                            console.log(3986, column)
                            column.minWidth = 300,
                            column.fillspace=true
                        }
                    }
                    let footercolumn = item.customFooterDt || []
                    if(footercolumn.length!=0){
                        additionalFooter.push(column.id)
                    }
                }else if(item.jenis == "customElement"){

                    let templateItem
                
                    if(typeof(item.template)!= "function"){
                        templateItem = function(obj, common, value, config){
                            let template = ""
                            if(item.compare != undefined && item.status != undefined){
                                if(obj[item.status] == "Y" || obj[item.status]==true|| obj[item.status]==1 || obj[item.status]=="1"){
                                    template = item.compare.true
                                }else{
                                    template = item.compare.false
                                }
                            }
                            template += item.template
                            return template
                        }
                    }else{
                        templateItem = item.template
                    }

                    column = {
                        id : item.id,
                        header : item.header,
                        fillspace : item.fillspace,
                        jenis : item.jenis,
                        width : item.width,
                        status : item.status,
                        compare : item.compare,
                        template : templateItem,
                        css : item.css,
                        editor : item.editor,
                        tooltip:"",
                        customWidth:item.customWidth || undefined
                    }
                    if(index===array.length-1){
                        if(winLayout_v2==true){
                            // column.minWidth = 300,
                            column.fillspace=false
                        }else{
                            console.log(4035, column)
                            column.minWidth = 300,
                            column.fillspace=true
                        }
                    }
                    format = {}
                }else{
                    column = {
                        id: item.id,
                        header: item.label,
                        width: 300,
                        jenis: item.jenis,
                        addSecond: item.addSecond || false,
                        dateId: item.dateId || undefined,
                        hideSecond: item.hideSecond || false,
                        hideMinute: item.hideMinute || false,
                        formatJenis: item.formatJenis,
                        validateItem: item.validateItem || item.validateDt || function(){return {"status":true}},
                        maxLength : item.attributes.maxlength,
                        css:item.cssDt,
                        preItem: item.preItem || function(){return true},
                        isPrimaryKey:item.isPrimaryKey,
                        upperValue:item.upperValue,
                        lowerValue:item.lowerValue,
                        hideItem:item.hidden || false,
                        customErrorSymbol:item.customErrorSymbol || false,
                        // hidden:item.hidden || false,
                        disabledItem:item.disableItem || false,
                        customFooter:item.customFooterDt,
                        tooltip:item.tooltip || "",
                        template:"#!"+item.id+"#",
                        customWidth:item.customWidth || undefined
                        // options:item.options, 
                        // fillspace:true,
                    }
                    if(item.customFooterDt!=undefined){
                        additionalFooter.push(column.id)
                    }
                    if(item.width!=undefined){
                        column.width = item.width
                    }
                    
                    if(column.hideItem){
                        window.winHideColumnsDt[dtTable.id].push(column.id)
                    }

                    format = {}
                    if (item.view === "checkbox") {
                        format = {
                            editor: item.view,
                            checkValue:item.checkValue,
                            uncheckValue:item.uncheckValue,
                            defaultValue:item.uncheckValue,
                            template: "{common.checkbox()}",
                        }
                        
                        column["searchItem"] = false
                        
                        let disabledCheck = ""
                        let cssCheckX = ""
                        if(item.disableItem){
                            disabledCheck = "disabled"
                            format.editor = undefined
                        }
                        if (item.customErrorSymbol) {
                            cssCheckX = "checkbox_dt_x"
                        }
                        format.template = function(obj, common, value, config){
                            var checked = (value == config.checkValue) ? 'checked="true"' : '';
                            return `<input ${disabledCheck} class='webix_table_checkbox ${cssCheckX}' type='checkbox' ${checked}>`;
                        }

                        let itemId = item.id
                        window.winNewDataDt[itemId]=item.checkValue
                    } else {
                        if (item.format !== undefined) {
                            format = {
                                editor: item.view,
                                numberFormat: item.format,
                            }
                        } else {
                            if (item.jenis=="date"){
                                let returnEditor = "text"
                                if(!item.isPrimaryKey){
                                    if(item.disableItem){
                                        returnEditor =  undefined
                                    }
                                }
                                format = {
                                    editor: returnEditor,
                                    format: (value) => {
                                        if(value!="" && value!=null){
                        
                                            if(value.split(" ")[0].length != item.attributes.maxlength){
                                                value = value.split(" ")[0].split("-").reverse().join("-");
                                                value = value.split(" ")[0].substring(value.split(" ")[0].length-item.attributes.maxlength)
                                            }
                                            if(value.split(" ")[0].length==item.attributes.maxlength && value.split(" ")[0].split("-").length>1 && value.split(" ")[0].split("-")[0].length==4){
                                                value = value.split(" ")[0].split("-").reverse().join("-");
                                            }
                                            let hasil = cekDate(value, item.formatJenis);
                                            
                                            return hasil
                                        }else{
                                            return value
                                        }
                                    },
                                    editFormat: (value) => {
                                        if(value!="" && value!=null){
                                            if(value.length != item.attributes.maxlength){
                                                value = value.split("-").reverse().join("-");
                                                value = value.substring(value.length-item.attributes.maxlength)
                                            }
                                            if(value.length==item.attributes.maxlength && value.split("-").length>1 && value.split("-")[0].length==4){
                                                value = value.split("-").reverse().join("-");
                                            }
                                            let hasil = cekDate(value, item.formatJenis);
                                            return hasil
                                        }else{
                                            return value
                                        }
                                    },
                                    editParse: (value) => {
                                        // if(value!=""){
                                        //     let hasil = cekDate(value, item.formatJenis);
                                        //     return hasil
                                        // }
                                        return value
                                    },
                                }
                            }else if(item.jenis=="clock"){
                                let returnEditor = "text"
                                if(!item.isPrimaryKey){
                                    if(item.disableItem){
                                        returnEditor =  undefined
                                    }
                                }
                                format = {
                                    editor: returnEditor,
                                    format: (value) => {
                                        if(value.includes(":")){
                                                if(parseInt(value.slice(0, 2))<24){     // check hour
                                                    if(parseInt(value.slice(3, 5))<=59){    // check minuutes
                                                        if(parseInt(value.slice(6, 8))<=59 && !isNaN(parseInt(value.slice(6, 8)))){ // check seconds 
                                                            value = moment(value,'HH:mm:ss').format("HH:mm:ss")
                                                            return value
                                                        }
                                                        else if(isNaN(parseInt(value.slice(6, 8))) && item.addSecond){
                                                            value = moment(value,'HH:mm').format("HH:mm")+':00'
                                                            return value
                                                        }
                                                        else if(isNaN(parseInt(value.slice(6, 8))) && !item.addSecond){
                                                            value = moment(value,'HH:mm').format("HH:mm")
                                                            return value
                                                        }
                                                        else{
                                                            value = ""
                                                            return value
                                                        }
                                                    }else{
                                                        value = ""
                                                        return value
                                                    }
                                                }
                                                else{
                                                    value = ""
                                                    return value
                                                }
                                            }else{
                                                if(parseInt(value.slice(0, 2))<24){
                                                    if(parseInt(value.slice(2, 4))<=59 && !isNaN(parseInt(value.slice(2, 4)))){
                                                        if(parseInt(value.slice(4, 6))<=59 && !isNaN(parseInt(value.slice(4, 6)))){
                                                            if(item.addSecond){
                                                                value = moment(value,'HH:mm:ss').format("HH:mm:ss")
                                                                return value
                                                            }else{
                                                                value = moment(value,'HH:mm').format("HH:mm")
                                                                return value
                                                            }
                                                        }
                                                        else if(isNaN(parseInt(value.slice(4, 6))) && item.addSecond){
                                                            value = moment(value,'HH:mm').format("HH:mm")+':00'
                                                            return value
                                                        }
                                                        else if(isNaN(parseInt(value.slice(4, 6))) && !item.addSecond){
                                                            value = moment(value,'HH:mm').format("HH:mm")
                                                            return value
                                                        }
                                                        else{
                                                            value = ""
                                                            return value
                                                        }
                                                    }else if(isNaN(parseInt(value.slice(2, 4)))){
                                                        value = moment(value,'HH:mm').format("HH:mm")
                                                        return value
                                                    }else{
                                                        value = ""
                                                        return value
                                                    }
                                                }
                                                else{
                                                    value = ""
                                                    return value
                                                }
                                            }
                                        },
                                    editFormat: (value) => {    
                                        if(value.includes(":")){
                                                if(parseInt(value.slice(0, 2))<24){
                                                    if(parseInt(value.slice(3, 5))<=59){
                                                        if(parseInt(value.slice(6, 8))<=59 && !isNaN(parseInt(value.slice(6, 8)))){
                                                            value = moment(value,'HH:mm:ss').format("HH:mm:ss")
                                                            return value
                                                        }
                                                        else if(isNaN(parseInt(value.slice(6, 8))) && item.addSecond){
                                                            value = moment(value,'HH:mm').format("HH:mm")+':00'
                                                            return value
                                                        }
                                                        else if(isNaN(parseInt(value.slice(6, 8))) && !item.addSecond){
                                                            value = moment(value,'HH:mm').format("HH:mm")
                                                            return value
                                                        }
                                                        else{
                                                            value = ""
                                                            return value
                                                        }
                                                    }else{
                                                        value = ""
                                                        return value
                                                    }
                                                }
                                                else{
                                                    value = ""
                                                    return value
                                                }
                                            }else{
                                                if(parseInt(value.slice(0, 2))<24){
                                                    if(parseInt(value.slice(2, 4))<=59 && !isNaN(parseInt(value.slice(2, 4)))){
                                                        if(parseInt(value.slice(4, 6))<=59 && !isNaN(parseInt(value.slice(4, 6)))){
                                                            if(item.addSecond){
                                                                value = moment(value,'HH:mm:ss').format("HH:mm:ss")
                                                                return value
                                                            }else{
                                                                value = moment(value,'HH:mm').format("HH:mm")
                                                                return value
                                                            }
                                                        }
                                                        else if(isNaN(parseInt(value.slice(4, 6))) && item.addSecond){
                                                            value = moment(value,'HH:mm').format("HH:mm")+':00'
                                                            return value
                                                        }
                                                        else if(isNaN(parseInt(value.slice(4, 6))) && !item.addSecond){
                                                            value = moment(value,'HH:mm').format("HH:mm")
                                                            return value
                                                        }
                                                        else{
                                                            value = ""
                                                            return value
                                                        }
                                                    }else if(isNaN(parseInt(value.slice(2, 4)))){
                                                        value = moment(value,'HH:mm').format("HH:mm")
                                                        return value
                                                    }else{
                                                        value = ""
                                                        return value
                                                    }
                                                }
                                                else{
                                                    value = ""
                                                    return value
                                                }
                                            }
                                    },
                                    editParse: (value) => {
                                        if(value.includes(":")){
                                            if(parseInt(value.slice(0, 2))<24){
                                                if(parseInt(value.slice(3, 5))<=59){
                                                    if(parseInt(value.slice(6, 8))<=59 && !isNaN(parseInt(value.slice(6, 8)))){
                                                        value = moment(value,'HH:mm:ss').format("HH:mm:ss")
                                                        return value
                                                    }
                                                    else if(isNaN(parseInt(value.slice(6, 8))) && item.addSecond){
                                                        value = moment(value,'HH:mm').format("HH:mm")+':00'
                                                        return value
                                                    }
                                                    else if(isNaN(parseInt(value.slice(6, 8))) && !item.addSecond){
                                                        value = moment(value,'HH:mm').format("HH:mm")
                                                        return value
                                                    }
                                                    else{
                                                        value = ""
                                                        return value
                                                    }
                                                }else{
                                                    value = ""
                                                    return value
                                                }
                                            }
                                            else{
                                                value = ""
                                                return value
                                            }
                                        }else{
                                            if(parseInt(value.slice(0, 2))<24){
                                                if(parseInt(value.slice(2, 4))<=59 && !isNaN(parseInt(value.slice(2, 4)))){
                                                    if(parseInt(value.slice(4, 6))<=59 && !isNaN(parseInt(value.slice(4, 6)))){
                                                        if(item.addSecond){
                                                            value = moment(value,'HH:mm:ss').format("HH:mm:ss")
                                                            return value
                                                        }else{
                                                            value = moment(value,'HH:mm').format("HH:mm")
                                                            return value
                                                        }
                                                    }
                                                    else if(isNaN(parseInt(value.slice(4, 6))) && item.addSecond){
                                                        value = moment(value,'HH:mm').format("HH:mm")+':00'
                                                        return value
                                                    }
                                                    else if(isNaN(parseInt(value.slice(4, 6))) && !item.addSecond){
                                                        value = moment(value,'HH:mm').format("HH:mm")
                                                        return value
                                                    }
                                                    else{
                                                        value = ""
                                                        return value
                                                    }
                                                }else if(isNaN(parseInt(value.slice(2, 4)))){
                                                    value = moment(value,'HH:mm').format("HH:mm")
                                                    return value
                                                }else{
                                                    value = ""
                                                    return value
                                                }
                                            }
                                            else{
                                                value = ""
                                                return value
                                            }
                                        }
                                    },   
                                }
                            }else if(item.jenis=="timestamp"){
                                let returnEditor = "text"
                                if(!item.isPrimaryKey){
                                    if(item.disableItem){
                                        returnEditor =  undefined
                                    }
                                }
                                format = {
                                    editor: returnEditor,
                                    format: (value) => {
                                        if(value!="" && value!=null){
                                            if(item.hideMinute){
                                                value = cekDate(value, "DD-MM-YYYY HH")
                                                return value
                                            }
                                            if(item.hideSecond){
                                                value = cekDate(value, "DD-MM-YYYY HH:mm")
                                                return value
                                            }
                                            value = cekDate(value, "DD-MM-YYYY HH:mm:ss")
                                            return value
                                        }else{
                                            return value
                                        }
                                    },
                                    editFormat: (value) => {
                                        if(value!="" && value!=null){
                                            if(item.hideMinute){
                                                value = cekDate(value, "DD-MM-YYYY HH")
                                                return value
                                            }
                                            if(item.hideSecond){
                                                value = cekDate(value, "DD-MM-YYYY HH:mm")
                                                return value
                                            }
                                            value = cekDate(value, "DD-MM-YYYY HH:mm:ss")
                                            return value
                                        }else{
                                            return value
                                        }
                                    },
                                    editParse: (value) => {
                                        if(value!="" && value!=null){
                                            if(item.hideMinute){
                                                value = cekDate(value, "DD-MM-YYYY HH")
                                                return value
                                            }
                                            if(item.hideSecond){
                                                value = cekDate(value, "DD-MM-YYYY HH:mm")
                                                return value
                                            }
                                            value = cekDate(value, "DD-MM-YYYY HH:mm:ss")
                                            return value
                                        }else{
                                            return value
                                        }
                                    }, 
                                }
                            }else if (item.jenis=="upperText"){
                                let returnEditor = "text"
                                if(!item.isPrimaryKey){
                                    if(item.disableItem){
                                        returnEditor =  undefined
                                    }
                                }
                                format = {
                                    editor: returnEditor,
                                    format: (value) => {
                                        return value.toUpperCase()
                                    },
                                    editFormat: (value) => { return value },
                                    editParse: (value) => {
                                        return value.toUpperCase()
                                    },
                                }
                            }else if (item.jenis=="lowerText"){
                                let returnEditor = "text"
                                if(!item.isPrimaryKey){
                                    if(item.disableItem){
                                        returnEditor =  undefined
                                    }
                                }
                                format = {
                                    editor: returnEditor,
                                    format: (value) => {
                                        return value.toLowerCase()
                                    },
                                    editFormat: (value) => { return value },
                                    editParse: (value) => {
                                        return value.toLowerCase()
                                    },
                                }
                            }else if (item.jenis=="combo"){
                                
                                let returnEditor = "combo"
                                if(!item.isPrimaryKey){
                                    if(item.disableItem){
                                        returnEditor =  undefined
                                    }
                                }

                                function getValueById(dicttemp,id) {
                                    for (var key in dicttemp) {
                                        if (dicttemp[key].id === id) {
                                            return dicttemp[key].value;
                                        }
                                    }
                                    // If id is not found, return null or any other appropriate value
                                    return "‎";
                                }
                                
                                column = Object.assign(column,{
                                    collection:item.options || [],
                                    editor:returnEditor,
                                    template: (r,s,val,obj,idval) => {
                                        return `<div class="content_cell_icon_datagrid">${getValueById(obj['collection']['data']['pull'],r[item.id])} <span class='test1 webix_icon wxi-angle-down'></span></div>`;
                                    },
                                    suggest:{
                                        on:{
                                            onValueSuggest:function(objValue){
                                                onClickComboDt(dtTable,objValue)
                                            }
                                        }
                                    }
                                })

                                delete column['template']
                            }else if (item.jenis=="display"){
                                format = {
                                    format: (value) => { return value },
                                    editFormat: (value) => { return value },
                                }
                            }else if (item.jenis=="textarea"){
                                let returnEditor = "popup"
                                // if(item.disableItem){
                                //     // returnEditor =  undefined
                                // }
                                format = {
                                    editor: returnEditor,
                                    format: (value) => { return value },
                                    editFormat: (value) => { return value },
                                }

                                if(item.upperValue){
                                    format = {
                                        editor: returnEditor,
                                        format: (value) => {
                                            return value.toUpperCase()
                                        },
                                        editFormat: (value) => { return value },
                                        editParse: (value) => {
                                            return value.toUpperCase()
                                        },
                                    }
                                }
        
                                if(item.lowerValue){
                                    format = {
                                        editor: returnEditor,
                                        format: (value) => {
                                            return value.toLowerCase()
                                        },
                                        editFormat: (value) => { return value },
                                        editParse: (value) => {
                                            return value.toLowerCase()
                                        },
                                    }
                                }
                                let editablepopup
                                if(item.disableItem){
                                    editablepopup = false
                                }else{
                                    editablepopup = true
                                }
                                webix.editors.$popup = {
                                    text:{
                                        view:"popup",
                                        id:item.id+"popup",
                                        body:{
                                            view:"textarea",
                                            width:250,
                                            height:100,
                                            attributes:{maxlength:item.attributes.maxlength}
                                        },
                                        on:{
                                            onBeforeShow:function(){
                                                //console.log(4562, $$(winActiveBlock.focusNow).getColumnConfig(winActiveCell.pos.column))
                                                $$(item.id+"popup").getBody().define("width",$$(winActiveBlock.focusNow).getColumnConfig(winActiveCell.pos.column).width)
                                                $$(item.id+"popup").getBody().resize()
                                                popUpTextAreaDt = true
                                                if($$(winActiveBlock.focusNow).getColumnConfig(winActiveCell.pos.column).disabledItem){
                                                    this.getBody().define("readonly",true)
                                                    // this.disable()
                                                }else{
                                                    this.getBody().define("readonly",false)
                                                    // this.enable()
                                                }
                                            },
                                            onHide :function(){
                                                if(winSearchMode == true){
                                                    let editor = $$(dtTable.id).getSelectedId()
                                                    let dataBaruTextArea = $$(dtTable.id).getItem(editor.row)[editor.column]
                                                    if(dataBaruTextArea!=window.winDataAwalDt){
                                                        checkToDatachanged({rowId:editor.row, columnId:editor.column, dataRow:$$(dtTable.id).getItem(editor.row)})
                                                    }
                                                }
                                            }
                                        }
                                    }
                                };
                            }else if (item.jenis=="currency"){
                                let textAlignRightCss = webix.html.createCss({"text-align":"right"});
                                if(column['isPrimaryKey']){
                                    textAlignRightCss = webix.html.createCss({"text-align":"right", "background-color": "lightgreen"});
                                }
                                column['css'] = textAlignRightCss
                                let returnEditor = item.view
                                if(item.disableItem){
                                    returnEditor =  undefined
                                }
                                format = {
                                    editor: returnEditor,
                                    format: (value) => {
                                        if(value!==null && value!=""){
                                            if(item.currencyCode!=undefined){
                                                return Intl.NumberFormat(undefined, { style: "currency", currency: item.currencyCode }).format(value)
                                            }else{
                                                return Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(value);
                                            }
                                        }else{
                                            return value
                                        }                                    
                                    },
                                    editFormat: (value) => {
                                        return value
                                    },
                                }
                                delete column['template']
                            }else if (item.jenis=="number"){
                                let textAlignRightCss = webix.html.createCss({"text-align":"right"});
                                if(column['isPrimaryKey']){
                                    textAlignRightCss = webix.html.createCss({"text-align":"right", "background-color": "lightgreen"});
                                }
                                column['css'] = textAlignRightCss
                                let returnEditor = item.view
                                if(item.disableItem){
                                    returnEditor =  undefined
                                    if(item.isPrimaryKey){
                                        returnEditor = "text"
                                    }
                                }
                                format = {
                                    editor: returnEditor,
                                    format: (value) => {
                                        if(value!==null && value!=""){
                                            if(parseInt(value)!=0){
                                                return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                                            }else{
                                                return parseInt(value)
                                            }
                                        }else{
                                            return value
                                        }                                    
                                    },
                                    editFormat: (value) => {
                                        if(value!==null && value!=""){
                                            return value
                                        }else{
                                            return value
                                        }  
                                    },
                                }
                                delete column['template']
                            }else if (item.jenis=="telephone"){                                
                                let returnEditor = item.view                                
                                if(item.disableItem){                                    
                                    returnEditor =  undefined                                    
                                    if(item.isPrimaryKey){                                        
                                        returnEditor = "text"                                    
                                    }                                
                                }                                
                                    
                                format = {                                    
                                    editor: returnEditor,                                    
                                    format: (value) => {                                        
                                        return value                                                                 
                                    },                                    
                                    editFormat: (value) => {                                        
                                    return value                                    
                                    },                                
                                }                            
                            }else if(item.jenis=="float"){
                                let textAlignRightCss = webix.html.createCss({"text-align":"right"});
                                if(column['isPrimaryKey']){
                                    textAlignRightCss = webix.html.createCss({"text-align":"right", "background-color": "lightgreen"});
                                }
                                column['css'] = textAlignRightCss
                                let returnEditor = item.view
                                if(item.disableItem){
                                    returnEditor =  undefined
                                    if(item.isPrimaryKey){
                                        returnEditor = "text"
                                    }
                                }
                                format = {
                                    editor: returnEditor,
                                    format: (value) => {
                                        if(value != "" && value != null){
                                            if(!(value.toString().includes('.'))){
                                                let newValue = value.toString() + '.0'
                                                return newValue
                                            }else{
                                                return value
                                            }
                                        }else{
                                            return value
                                        }
                                        
                                    },
                                    editFormat: (value) => {
                                        if(value != "" && value != null){
                                            if(!(value.toString().includes('.'))){
                                                let newValue = value.toString() + '.0'
                                                return newValue
                                            }else{
                                                return value
                                            }
                                        }else{
                                            return value
                                        }
                                    },
                                }
                                delete column['template']
                            }else{
                                if(item.isPrimaryKey){
                                        let returnEditor = "text"
                                        format = {
                                            editor: returnEditor,
                                            format: (value) => { return value },
                                            editFormat: (value) => { return value },
                                        }
                                        if(item.upperValue){
                                            format = {
                                                editor: returnEditor,
                                                format: (value) => {
                                                    return value.toUpperCase()
                                                },
                                                editFormat: (value) => { return value },
                                                editParse: (value) => {
                                                    return value.toUpperCase()
                                                },
                                            }
                                        }
                
                                        if(item.lowerValue){
                                            format = {
                                                editor: returnEditor,
                                                format: (value) => {
                                                    return value.toLowerCase()
                                                },
                                                editFormat: (value) => { return value },
                                                editParse: (value) => {
                                                    return value.toLowerCase()
                                                },
                                            }
                                        }
                                }else{
                                    let returnEditor = item.view
                                    if(item.disableItem){
                                        returnEditor =  undefined
                                    }
                                    format = {
                                        editor: returnEditor,
                                        format: (value) => { return value },
                                        editFormat: (value) => { return value },
                                    }
                                    if(item.upperValue){
                                        format = {
                                            editor: item.view,
                                            format: (value) => {
                                                return value.toUpperCase()
                                            },
                                            editFormat: (value) => { return value },
                                            editParse: (value) => {
                                                return value.toUpperCase()
                                            },
                                        }
                                    }
            
                                    if(item.lowerValue){
                                        format = {
                                            editor: item.view,
                                            format: (value) => {
                                                return value.toLowerCase()
                                            },
                                            editFormat: (value) => { return value },
                                            editParse: (value) => {
                                                return value.toLowerCase()
                                            },
                                        }
                                    }
                                }
                            }
                        }
                    }

                    
                    // console.log(4791, column)
                    if(column['jenis']=='checkBox' && column["customWidth"]==undefined){
                        column["width"] = 100;
                        column["minWidth"] = 100;
                        column["customWidth"] = 100;
                    }

                    if(index===array.length-1){
                        if(winLayout_v2 == true){
                            // column.minWidth = 300,
                            column.fillspace=false
                        }else{
                            // console.log(4787, column)
                            // console.log(aaaa)
                            if(column.customWidth==undefined){
                                column.minWidth = 300
                            }else{
                                column.minWidth = column.customWidth
                            }
                            column.fillspace=true
                        }
                    }
                }

                // console.log(4831, column, format)

                dtTable.columns.push(Object.assign(column,format))
            }
            
        })
        if(additionalFooter.length==0){
            dtTable.footer = false
        }
        // dtTable.columns.push({ id: "detail", header:{ text:"Detail", css:"datatablAlignCenter",}, fillspace:false, width:150, template:"<input class='detail' type='button' value=' Detail '>", css:"datatablAlignCenter", editor:"btn"})
    }
}

let datatable = new DatatableCustom()
