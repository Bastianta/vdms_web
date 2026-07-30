/*
	JS-Oden-Stable V.1
	Update : 2025-05-19
	Common Library - multiview.js
		Update : 
			- New Layouting Oden
*/

window.winMultiviewBlocks = []
window.winMultiviewBlocksVertical = []
window.winHeightMultiview = {}
window.winMultiviewMultiLanguage = {}
window.winMultiviewVerticalMultiLanguage = {}
window.winChangeTab = false

function calculatePageSubChild(index, PAGE) {
    let pagination = 1
    do {
        if (index+1 <= PAGE*pagination) {
            return pagination;
        } else {
            pagination += 1;
        }
    } while (true);
}

function findObjectById(idTab, data){
    return data.find(obj => obj.id === idTab)
}

class MultiView{

    view(multiViewElement){
        let optionMultiView = []
        winMultiviewMultiLanguage['tabbar'+menuId] = []
        multiViewElement.forEach(function(block){
            optionMultiView.push({id:block.rows[0].id,value:block.header})
            winMultiviewMultiLanguage['tabbar'+menuId].push({id:block.rows[0].id,value:block.header})
        })
        let view = {
            id:"viewTabbar"+menuId,
            viewCustom:"tabbar",
            type:"clean",
            rows:[
                { 
                    borderless:true,
                    view:"tabbar",
                    id:'tabbar'+menuId,
                    prevFocusTab:optionMultiView[0].id,
                    multiview:true,
                    value:"tabbar"+optionMultiView[0].id,
                    options:optionMultiView,
                    validateStatus:false,
                    on:{
                        'onBeforeTabClick':function(id){
                            if(getBlockParent()!=""){
                                if(Object.keys(winDataCompare[getBlockParent()].data).length!=0 || winAddData!=false){
                                    let view = this
                                    if($$(winActiveBlock.focusNow).validate()){
                                        if(winConfigForm[winActiveBlock.focusNow]["BLOCK_TYPE"][0] == "DATAGRID"){
                                            $$(winActiveBlock.focusNow).unselectAll()
                                        }
                                        let subChild = []
                                        let subParent = []
                                        let validationSucces = true
                                        winValidateItemPos = {}
                                        if (winThereIsSubChild) {
                                            if (winConfigForm[winActiveBlock.focusNow]["BLOCK_TYPE"][2] != undefined) {
                                                Object.keys(winConfigForm).forEach(function (blockId) {
                                                    if (winConfigForm[blockId]["BLOCK_TYPE"][2] ==  winConfigForm[winActiveBlock.focusNow]["BLOCK_TYPE"][2]) {
                                                        subChild.push(blockId)
                                                    }else if(blockId == winConfigForm[winActiveBlock.focusNow]["BLOCK_TYPE"][2]){
                                                        subChild.push(blockId)
                                                    }
                                                })
                                            }else{
                                                Object.keys(winConfigForm).forEach(function (blockId) {
                                                if (winActiveBlock.focusNow == winConfigForm[blockId]["BLOCK_TYPE"][2] ) {
                                                        subChild.push(blockId)
                                                }else if(winActiveBlock.focusNow == blockId){
                                                        subChild.push(blockId)
                                                }
                                                })
                                            }
                                            subChild.every(function (childId) {
                                                if (!$$(childId).validate()){
                                                    winChangeTab = false
                                                    validationSucces = false
                                                    if(!isWebixPopupOpen()){
                                                        let nameTab = findObjectById(childId,view.config.options).value
                                                        webix.alert(ALERT.ALERTERROR('Validasi Gagal pada Block '+nameTab)).then(function(){
                                                            $$('tabbar'+menuId).setValue(childId);
                                                            $$("tabbar"+childId).show()
                                                            webix.UIManager.setFocus($$(childId));
                                                        })
                                                    }
                                                    return false
                                                }
                                                return true
                                            })
                                            if(winConfigForm[winActiveBlock.focusNow]["BLOCK_TYPE"][1] == "SUB_PARENT"){
                                                Object.keys(winConfigForm).forEach(function (blockId) {
                                                    if (winConfigForm[blockId]["BLOCK_TYPE"][1] ==  "SUB_PARENT") {
                                                        subParent.push(blockId)
                                                    }else if(blockId == getBlockParent(winActiveBlock.focusNow)){
                                                        subParent.push(blockId)
                                                    }
                                                })
                                            }
                                            subParent.every(function (subParentId) {
                                                if (!$$(subParentId).validate()){
                                                    winChangeTab = false
                                                    validationSucces = false
                                                    if(!isWebixPopupOpen()){
                                                        let nameTab = findObjectById(subParentId,view.config.options).value
                                                        webix.alert(ALERT.ALERTERROR('Validasi Gagal pada Block '+nameTab)).then(function(){
                                                            $$('tabbar'+menuId).setValue(subParentId);
                                                            $$("tabbar"+subParentId).show()
                                                            webix.UIManager.setFocus($$(subParentId));
                                                        })
                                                    }
                                                    return false
                                                }
                                                return true
                                            })
                                            if(validationSucces){
                                                winChangeTab = true
                                            }
                                            if(winChangeTab) {
                                                var prevValue = this.getValue();
                                                let nameTab = findObjectById(id,this.config.options).value
                                                let messageAlert
                                                if($$("comboMultiLanguage")!=undefined){
                                                    let getLanguageCode = $$("comboMultiLanguage").getValue()
                                                    messageAlert = window["jsonMultiLanguage_"+menuId][getLanguageCode]["Tab changed to "] || "Tab changed to "
                                                }else{
                                                    messageAlert = "Tab changed to "
                                                }
                                                webix.message({
                                                    text:messageAlert+nameTab,
                                                    type:"info", 
                                                    expire: 500,
                                                });
                                                if(prevValue!=''){
                                                    $$(prevValue).hide()
                                                }
                                                $$("tabbar"+id).show()
                                                this.define('value',"tabbar"+id)
                                                if($$(id).config.view=="datatable"){
                                                    $$("multiview"+menuId).define("height", $$(id).$height+100)
                                                    $$("multiview"+menuId).resize()
                                                }else if($$(id).config.view=="form"){
                                                    $$("multiview"+menuId).define("height", $$(id).$height)
                                                    $$("multiview"+menuId).resize()
                                                }
                                                if($$(id).config.view=="form"){
                                                    if(!winAddData){
                                                        let valueNow = getBlockValue(id)
                                                        let changedId = []
                                                        Object.keys(winDataCompare[id]['data']).forEach(function(item){
                                                            if(winDataCompare[id]['data'][item]!=valueNow[item]){
                                                                changedId.push(item)
                                                            }
                                                        })
                                                        if(changedId.length==0){
                                                            if(!winSearchMode){
                                                                if(winConfigForm[id]['REST_API']!=undefined){
                                                                    webix.extend($$(id), webix.ProgressBar);
                                                                    $$(id).disable()
                                                                    $$(id).clear()
                                                                    restapi.restApiParam(winConfigForm[id].REST_API);
                                                                    $$(id).enable()
                                                                }
                                                            }
                                                        }
                                                    }  
                                                    if(winAddData && winJenisAddValue != "PARENT"){
                                                        if(id != winFlagInsertBlock && winConfigForm[id]['REST_API']!=undefined){
                                                            webix.extend($$(id), webix.ProgressBar);
                                                            $$(id).disable()
                                                            $$(id).clear()
                                                            restapi.restApiParam(winConfigForm[id].REST_API);
                                                            $$(id).enable()
                                                        }
                                                        if(winFlagInsertBlock != ""){
                                                            if(winConfigForm[winFlagInsertBlock]["BLOCK_TYPE"][0]=="DATAGRID" && winConfigForm[id]["BLOCK_TYPE"][0]=="FORM"){
                                                                $$(id).disable()
                                                            }else{
                                                                $$(id).enable()
                                                            }
                                                            if(winConfigForm[winFlagInsertBlock]["BLOCK_TYPE"][0]=="FORM" && winConfigForm[id]["BLOCK_TYPE"][0]=="FORM"){
                                                                if(Object.keys(winDataCompare[id]["data"]).length != 0){
                                                                    winConfigForm[id]["ELEMENT"].forEach(function(itemId){
                                                                        $$(itemId).define("readonly",true)
                                                                        $$(itemId).refresh()
                                                                    })
                                                                }else{
                                                                    winConfigForm[id]["ELEMENT"].forEach(function(itemId){
                                                                        $$(itemId).define("readonly",false)
                                                                        $$(itemId).refresh()
                                                                    })
                                                                }
                                                                if(id == winFlagInsertBlock){
                                                                    winConfigForm[id]["ELEMENT"].forEach(function(itemId){
                                                                        $$(itemId).define("readonly",false)
                                                                        $$(itemId).refresh()
                                                                    })
                                                                }
                                                            }
                                                        }
                                                    }
                                                }else if($$(id).config.view=="datatable"){
                                                    if(winDataChanged[id].length==0){
                                                        if(!winSearchMode && winJenisAddValue!="PARENT"){
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
                                                            if (!haveSubChild.includes(id)) {
                                                                if(winConfigForm[id]['REST_API']!=undefined){
                                                                    webix.extend($$(id), webix.ProgressBar);
                                                                    $$(id).disable()
                                                                    $$(id).clearAll()
                                                                    restapi.restApiParam(winConfigForm[id].REST_API);
                                                                    $$(id).enable()
                                                                }
                                                            }else{
                                                                if (!winDataDtSelect.hasOwnProperty(id)) {
                                                                    if (winConfigForm[id]["BLOCK_TYPE"][2] == undefined) {
                                                                        if(winConfigForm[id]['REST_API']!=undefined){
                                                                            webix.extend($$(id), webix.ProgressBar);
                                                                            $$(id).disable()
                                                                            $$(id).clearAll()
                                                                            restapi.restApiParam(winConfigForm[id].REST_API);
                                                                            $$(id).enable()
                                                                        }
                                                                    }else{
                                                                        if(winConfigForm[id]['REST_API']!=undefined){
                                                                            let parent = winConfigForm[id]["BLOCK_TYPE"][2]
                                                                            webix.extend($$(id), webix.ProgressBar);
                                                                            $$(id).disable()
                                                                            $$(id).clearAll()
                                                                            restapi.restApiParam(winConfigForm[parent].REST_API);
                                                                            $$(id).enable()
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }else{
                                            if (winConfigForm[winActiveBlock.focusNow]["BLOCK_TYPE"][1] == "SUB_PARENT") {
                                                Object.keys(winConfigForm).forEach(function (blockId) {
                                                    if (winConfigForm[blockId]["BLOCK_TYPE"][1] ==  "SUB_PARENT") {
                                                        subParent.push(blockId)
                                                    }else if(blockId == getBlockParent(winActiveBlock.focusNow)){
                                                        subParent.push(blockId)
                                                    }
                                                })
                                            }
                                            subParent.every(function (subParentId) {
                                                if (!$$(subParentId).validate()){
                                                    winChangeTab = false
                                                    validationSucces = false
                                                    if(!isWebixPopupOpen()){
                                                        let nameTab = findObjectById(subParentId,view.config.options).value
                                                        webix.alert(ALERT.ALERTERROR('Validasi Gagal pada Block '+nameTab)).then(function(){
                                                            $$('tabbar'+menuId).setValue(subParentId);
                                                            $$("tabbar"+subParentId).show()
                                                            webix.UIManager.setFocus($$(subParentId));
                                                        })
                                                    }
                                                    return false
                                                }
                                                return true
                                            })
                                            var prevValue = this.getValue();
                                            let nameTab = findObjectById(id,this.config.options).value
                                            let messageAlert
                                            if($$("comboMultiLanguage")!=undefined){
                                                let getLanguageCode = $$("comboMultiLanguage").getValue()
                                                messageAlert = window["jsonMultiLanguage_"+menuId][getLanguageCode]["Tab changed to "] || "Tab changed to "
                                            }else{
                                                messageAlert = "Tab changed to "
                                            }
                                            webix.message({
                                                text:messageAlert+nameTab,
                                                type:"info", 
                                                expire: 500,
                                            });
                                            if(prevValue!=''){
                                                $$(prevValue).hide()
                                            }
                                            this.define()
                                            $$("tabbar"+id).show()
                                            this.define('value',"tabbar"+id)
                                            if($$(id).config.view=="form"){
                                                if(!winAddData){
                                                    let valueNow = getBlockValue(id)
                                                    let changedId = []
                                                    Object.keys(winDataCompare[id]['data']).forEach(function(item){
                                                        if(winDataCompare[id]['data'][item]!=valueNow[item]){
                                                            changedId.push(item)
                                                        }
                                                    })
                                                    if(changedId.length==0){
                                                        if(!winSearchMode){
                                                            if(winConfigForm[id]['REST_API']!=undefined){
                                                                webix.extend($$(id), webix.ProgressBar);
                                                                $$(id).disable()
                                                                $$(id).clear()
                                                                restapi.restApiParam(winConfigForm[id].REST_API);
                                                                $$(id).enable()
                                                            }
                                                        }
                                                    }
                                                }  
                                                if(winAddData && winJenisAddValue != "PARENT"){
                                                    if(id != winFlagInsertBlock && winConfigForm[id]['REST_API']!=undefined){
                                                        webix.extend($$(id), webix.ProgressBar);
                                                        $$(id).disable()
                                                        $$(id).clear()
                                                        restapi.restApiParam(winConfigForm[id].REST_API);
                                                        $$(id).enable()
                                                    }
                                                    if(winFlagInsertBlock != ""){
                                                        if(winConfigForm[winFlagInsertBlock]["BLOCK_TYPE"][0]=="DATAGRID" && winConfigForm[id]["BLOCK_TYPE"][0]=="FORM"){
                                                            $$(id).disable()
                                                        }else{
                                                            $$(id).enable()
                                                        }
                                                        if(winConfigForm[winFlagInsertBlock]["BLOCK_TYPE"][0]=="FORM" && winConfigForm[id]["BLOCK_TYPE"][0]=="FORM"){
                                                            if(Object.keys(winDataCompare[id]["data"]).length != 0){
                                                                winConfigForm[id]["ELEMENT"].forEach(function(itemId){
                                                                    $$(itemId).define("readonly",true)
                                                                    $$(itemId).refresh()
                                                                })
                                                            }else{
                                                                winConfigForm[id]["ELEMENT"].forEach(function(itemId){
                                                                    $$(itemId).define("readonly",false)
                                                                    $$(itemId).refresh()
                                                                })
                                                            }
                                                            if(id == winFlagInsertBlock){
                                                                winConfigForm[id]["ELEMENT"].forEach(function(itemId){
                                                                    $$(itemId).define("readonly",false)
                                                                    $$(itemId).refresh()
                                                                })
                                                            }
                                                        }
                                                    }
                                                }
                                            }else if($$(id).config.view=="datatable"){
                                                if(winDataChanged[id].length==0){
                                                    if(!winSearchMode && winJenisAddValue!="PARENT"){
                                                        if(!winThereIsSubChild){
                                                            if(winConfigForm[id]['REST_API']!=undefined){
                                                                webix.extend($$(id), webix.ProgressBar);
                                                                $$(id).disable()
                                                                $$(id).clearAll()
                                                                restapi.restApiParam(winConfigForm[id].REST_API);
                                                                $$(id).enable()
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                            winChangeTab = true
                                        }
                                    }else{
                                        winChangeTab = false
                                        setFocusAfterValidate($$('tabbar'+menuId).config.prevFocusTab)
                                    }
                                }
                            }else{
                                var prevValue = this.getValue();
                                let nameTab = findObjectById(id,this.config.options).value
                                let messageAlert
                                if($$("comboMultiLanguage")!=undefined){
                                    let getLanguageCode = $$("comboMultiLanguage").getValue()
                                    messageAlert = window["jsonMultiLanguage_"+menuId][getLanguageCode]["Tab changed to "] || "Tab changed to "
                                }else{
                                    messageAlert = "Tab changed to "
                                }
                                webix.message({
                                    text:messageAlert+nameTab,
                                    type:"info", 
                                    expire: 500,
                                });
                                if(prevValue!=''){
                                    $$(prevValue).hide()
                                }
                                this.define()
                                $$("tabbar"+id).show()
                                this.define('value',"tabbar"+id)
                                if($$(id).config.view=="datatable"){
                                    $$("multiview"+menuId).define("height", $$(id).$height+100)
                                    $$("multiview"+menuId).resize()
                                }else if($$(id).config.view=="form"){
                                    $$("multiview"+menuId).define("height", $$(id).$height)
                                    $$("multiview"+menuId).resize()
                                }
                                if($$(id).config.view=="form"){
                                    if(!winAddData){
                                        let valueNow = getBlockValue(id)
                                        let changedId = []
                                        Object.keys(winDataCompare[id]['data']).forEach(function(item){
                                            if(winDataCompare[id]['data'][item]!=valueNow[item]){
                                                changedId.push(item)
                                            }
                                        })
                                        if(changedId.length==0){
                                            if(!winSearchMode){
                                                if(winConfigForm[id]['REST_API']!=undefined){
                                                    webix.extend($$(id), webix.ProgressBar);
                                                    $$(id).disable()
                                                    $$(id).clear()
                                                    restapi.restApiParam(winConfigForm[id].REST_API);
                                                    $$(id).enable()
                                                }
                                            }
                                        }
                                    }  
                                    if(winAddData && winJenisAddValue != "PARENT"){
                                        if(id != winFlagInsertBlock && winConfigForm[id]['REST_API']!=undefined){
                                            webix.extend($$(id), webix.ProgressBar);
                                            $$(id).disable()
                                            $$(id).clear()
                                            restapi.restApiParam(winConfigForm[id].REST_API);
                                            $$(id).enable()
                                        }
                                        if(winFlagInsertBlock != ""){
                                            if(winConfigForm[winFlagInsertBlock]["BLOCK_TYPE"][0]=="DATAGRID" && winConfigForm[id]["BLOCK_TYPE"][0]=="FORM"){
                                                $$(id).disable()
                                            }else{
                                                $$(id).enable()
                                            }
                                            if(winConfigForm[winFlagInsertBlock]["BLOCK_TYPE"][0]=="FORM" && winConfigForm[id]["BLOCK_TYPE"][0]=="FORM"){
                                                if(Object.keys(winDataCompare[id]["data"]).length != 0){
                                                    winConfigForm[id]["ELEMENT"].forEach(function(itemId){
                                                        $$(itemId).define("readonly",true)
                                                        $$(itemId).refresh()
                                                    })
                                                }else{
                                                    winConfigForm[id]["ELEMENT"].forEach(function(itemId){
                                                        $$(itemId).define("readonly",false)
                                                        $$(itemId).refresh()
                                                    })
                                                }
                                                if(id == winFlagInsertBlock){
                                                    winConfigForm[id]["ELEMENT"].forEach(function(itemId){
                                                        $$(itemId).define("readonly",false)
                                                        $$(itemId).refresh()
                                                    })
                                                }
                                            }
                                        }
                                    }
                                }else if($$(id).config.view=="datatable"){
                                    if(winDataChanged[id].length==0){
                                        if(!winSearchMode && winJenisAddValue!="PARENT"){
                                            if(!winThereIsSubChild){
                                                if(winConfigForm[id]['REST_API']!=undefined){
                                                    webix.extend($$(id), webix.ProgressBar);
                                                    $$(id).disable()
                                                    $$(id).clearAll()
                                                    restapi.restApiParam(winConfigForm[id].REST_API);
                                                    $$(id).enable()
                                                }
                                            }
                                        }
                                    }
                                }
                                winChangeTab = true
                            }
                        },
                        'onAfterTabClick':function(id){
                            if(getBlockParent()!=""){
                                if(Object.keys(winDataCompare[getBlockParent()].data).length!=0 || winAddData!=false){
                                    if (winChangeTab) {
                                        winActiveBlock.lastFocus = winActiveBlock.focusNow
                                        winActiveBlock.focusNow = id
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
                                        if($$(winActiveBlock.focusNow).validate()){
                                            let getId
                                            if (winActiveBlock.lastFocus != '' && winConfigForm[winActiveBlock.lastFocus]["BLOCK_TYPE"][1] != "PARENT" && winConfigForm[winActiveBlock.lastFocus]["BLOCK_TYPE"][0] != "FORM") {
                                                getId = $$(winActiveBlock.lastFocus).getSelectedId()
                                            }
                                            if (winAddData && winThereIsSubChild) {
                                                if (winActiveBlock.lastFocus != '' && winConfigForm[winActiveBlock.lastFocus]["BLOCK_TYPE"][1] != "PARENT") {
                                                    if(ChildParent!=undefined){
                                                        if (getId != undefined) {
                                                            let lastIndex = $$(winActiveBlock.lastFocus).getIndexById(getId.row)
                                                            let page = winConfigForm[winActiveBlock.lastFocus]['DATA_PER_PAGE'] || 10
                                                            let hasil = calculatePageSubChild(lastIndex,page)
                                                            $$(winActiveBlock.focusNow).setPage(hasil-1)
                                                        }
                                                    }else{
                                                        $$(id).setPage(winPagerDatatable[id][0])
                                                    }
                                                }
                                            }
                                        
                                            webix.UIManager.setFocus($$(id));
                                            if(winConfigForm[id]["BLOCK_TYPE"][0]=="DATAGRID"){
                                                if (winThereIsSubChild && getId != undefined) {
                                                    if(ChildParent!=undefined){
                                                        let lastIndex = $$(winActiveBlock.lastFocus).getIndexById(getId.row)
                                                        let indexNow = $$(id).getIdByIndex(lastIndex)
                                                        $$(id).select(indexNow,$$(id).config.columns[0].id);
                                                    }else{
                                                        if($$(winActiveBlock.focusNow).serialize().length!=0){
                                                            $$(winActiveBlock.focusNow).select($$(winActiveBlock.focusNow).getFirstId(),$$(winActiveBlock.focusNow).config.columns[0].id);
                                                        }
                                                    }
                                                }
                                            }
                                            if(winActiveBlock.lastFocus!=""){
                                                webix.html.removeCss($$(winActiveBlock.lastFocus).getNode(), "datablock-focus")
                                            }
                                            webix.html.addCss($$(winActiveBlock.focusNow).getNode(), "datablock-focus")
                                            $$('tabbar'+menuId).config.prevFocusTab = $$("tabbar"+menuId).getValue().split("tabbar")[1]
                                        }
                                    }
                                }
                            }else{
                                if (winChangeTab) {
                                    winActiveBlock.lastFocus = winActiveBlock.focusNow
                                    winActiveBlock.focusNow = id
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
                                    if($$(winActiveBlock.focusNow).validate()){
                                        let getId
                                        if (winActiveBlock.lastFocus != '' && winConfigForm[winActiveBlock.lastFocus]["BLOCK_TYPE"][1] != "PARENT" && winConfigForm[winActiveBlock.lastFocus]["BLOCK_TYPE"][0] != "FORM") {
                                            getId = $$(winActiveBlock.lastFocus).getSelectedId()
                                        }
                                        if (winAddData && winThereIsSubChild) {
                                            if (winActiveBlock.lastFocus != '' && winConfigForm[winActiveBlock.lastFocus]["BLOCK_TYPE"][1] != "PARENT") {
                                                if(ChildParent!=undefined){
                                                    if (getId != undefined) {
                                                        let lastIndex = $$(winActiveBlock.lastFocus).getIndexById(getId.row)
                                                        let page = winConfigForm[winActiveBlock.lastFocus]['DATA_PER_PAGE'] || 10
                                                        let hasil = calculatePageSubChild(lastIndex,page)
                                                        $$(winActiveBlock.focusNow).setPage(hasil-1)
                                                    }
                                                }else{
                                                    $$(id).setPage(winPagerDatatable[id][0])
                                                }
                                            }
                                        }
                                        webix.UIManager.setFocus($$(id));
                                        if(winConfigForm[id]["BLOCK_TYPE"][0]=="DATAGRID"){
                                            if (winThereIsSubChild && getId != undefined) {
                                                if(ChildParent!=undefined){
                                                    let lastIndex = $$(winActiveBlock.lastFocus).getIndexById(getId.row)
                                                    let indexNow = $$(id).getIdByIndex(lastIndex)
                                                    $$(id).select(indexNow,$$(id).config.columns[0].id);
                                                }else{
                                                    if($$(winActiveBlock.focusNow).serialize().length!=0){
                                                        $$(winActiveBlock.focusNow).select($$(winActiveBlock.focusNow).getFirstId(),$$(winActiveBlock.focusNow).config.columns[0].id);
                                                    }
                                                }
                                            }
                                        }
                                        if(winActiveBlock.lastFocus!=""){
                                            webix.html.removeCss($$(winActiveBlock.lastFocus).getNode(), "datablock-focus")
                                        }
                                        webix.html.addCss($$(winActiveBlock.focusNow).getNode(), "datablock-focus")
                                        $$('tabbar'+menuId).config.prevFocusTab = $$("tabbar"+menuId).getValue().split("tabbar")[1]
                                    }
                                }
                            }
                            if(winLayout_v2 == true){
                                reLayoutOden(id)
                            }
                        }
                    }
                },
                {
                    cells:multiViewElement
                }
            ]
        }
        return view
    }
    
    element(titleView,dataBlock){
        let idBlock
        if(dataBlock.length==undefined){
            idBlock = dataBlock.id
        }else{
            idBlock = dataBlock[0].id
        }
        let element = {
            id:"tabbar"+idBlock,
            header:titleView,
            type:"space",
            padding:0,
            rows:this.fixElement(dataBlock)
        }
        winMultiviewBlocks.push(idBlock)
        return element
    }

    fixElement(blockItems){
        let fixBlock = []
        if(blockItems.view == undefined){
            blockItems.forEach(function(block){
                if(block.view != undefined){
                    fixBlock.push(block)
                }else{
                    if(block.cols){
                        fixBlock.push(block)
                    }else{
                        block.forEach(function(itemBlock){
                            fixBlock.push(itemBlock)
                        })
                    }
                }
            })
        }else{
            fixBlock.push(blockItems)
        }
        fixBlock.push({height:10})
        return fixBlock
    }
}

class VerticalMultiView{
    view(multiViewElement){
        let idMultiview = []
        let fixElementVerticalMultiview = []
        if (winThereIsSubChild) {
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
        }
        multiViewElement.forEach(function(block){
            if(block.length!=undefined){
                block.id = block[0].id+"_verticalTab"
                block.type = "wide",
                block.rows = [] 
                idMultiview.push({id:block[0].id, title:block[0].title})
                block.forEach(function(object){
                    block.rows.push(object)
                })
                block.rows.push({height:80})
                block.rows.push({})
                let viewForm = {
                    id:block[0].id+"_verticalTab",
                    rows:block.rows
                }
                fixElementVerticalMultiview.push(viewForm)
                winMultiviewBlocksVertical.push(block[0].id)
            }else{
                let viewForm = {
                    id:block.id+"_verticalTab",
                    rows:[
                        block
                    ]
                }
                winMultiviewBlocksVertical.push(block.id)
                idMultiview.push({id:block.id, title:block.title})
                fixElementVerticalMultiview.push(viewForm)
            }
        })
        winMultiviewVerticalMultiLanguage = idMultiview
        let view = 
            {
                rows:[
                    {
                        cols:[
                            {
                                rows:[
                                    {
                                        view:"list", 
                                        template:"#title#",
                                        id:"listMultiviewVertical"+menuId,
                                        prevFocusList:idMultiview[0].id,
                                        data:idMultiview,
                                        borderless:true,
                                        width:250,
                                        select:true,
                                        scroll:"y", 
                                        on:{
                                            onItemClick:function(id){
                                                if(Object.keys(winDataCompare[getBlockParent()].data).length!=0 || winAddData!=false){
                                                    if($$(winActiveBlock.focusNow).validate()){
                                                        let subChild = []
                                                        let subParent = []
                                                        let validationSucces = true
                                                        if (winThereIsSubChild) {
                                                            if (winConfigForm[winActiveBlock.focusNow]["BLOCK_TYPE"][2] != undefined) {
                                                                Object.keys(winConfigForm).forEach(function (blockId) {
                                                                    if (winConfigForm[blockId]["BLOCK_TYPE"][2] ==  winConfigForm[winActiveBlock.focusNow]["BLOCK_TYPE"][2]) {
                                                                        subChild.push(blockId)
                                                                    }else if(blockId == winConfigForm[winActiveBlock.focusNow]["BLOCK_TYPE"][2]){
                                                                        subChild.push(blockId)
                                                                    }
                                                                })
                                                            }else{
                                                                Object.keys(winConfigForm).forEach(function (blockId) {
                                                                    if (winActiveBlock.focusNow == winConfigForm[blockId]["BLOCK_TYPE"][2] ) {
                                                                            subChild.push(blockId)
                                                                    }else if(winActiveBlock.focusNow == blockId){
                                                                            subChild.push(blockId)
                                                                    }
                                                                })
                                                            }
                                                            subChild.every(function (childId) {
                                                                if (!$$(childId).validate()){
                                                                    winChangeTab = false
                                                                    validationSucces = false
                                                                    if(!isWebixPopupOpen()){
                                                                        let nameTab = findObjectById(childId,idMultiview).title
                                                                        webix.alert(ALERT.ALERTERROR('Validasi Gagal pada Block '+nameTab)).then(function(){
                                                                            $$("listMultiviewVertical"+menuId).select(childId)
                                                                            webix.$$(childId+"_verticalTab").show();
                                                                            webix.UIManager.setFocus($$(childId));
                                                                        })
                                                                    }
                                                                    return false
                                                                }
                                                                return true
                                                            })
                                                            if (winConfigForm[winActiveBlock.focusNow]["BLOCK_TYPE"][1] == "SUB_PARENT") {
                                                                Object.keys(winConfigForm).forEach(function (blockId) {
                                                                    if (winConfigForm[blockId]["BLOCK_TYPE"][1] ==  "SUB_PARENT") {
                                                                        subParent.push(blockId)
                                                                    }else if(blockId == getBlockParent(winActiveBlock.focusNow)){
                                                                        subParent.push(blockId)
                                                                    }
                                                                })
                                                            }
                                                            subParent.every(function (subParentId) {
                                                                if (winActiveBlock.focusNow==subParentId){
                                                                    if (!$$(subParentId).validate()){
                                                                        winChangeTab = false
                                                                        validationSucces = false
                                                                        if(!isWebixPopupOpen()){
                                                                            let nameTab = findObjectById(subParentId,idMultiview).title
                                                                            webix.alert(ALERT.ALERTERROR('Validasi Gagal pada Block '+nameTab)).then(function(){
                                                                                $$("listMultiviewVertical"+menuId).select(subParentId)
                                                                                webix.$$(subParentId+"_verticalTab").show();
                                                                                webix.UIManager.setFocus($$(subParentId));
                                                                            })
                                                                        }
                                                                        return false
                                                                    }
                                                                    return true
                                                                }else{
                                                                    return true
                                                                }
                                                            })
            
                                                            if(validationSucces){
                                                                winChangeTab = true
                                                            }
                                                            if(winChangeTab){
                                                                webix.$$(id+"_verticalTab").show();
                                                                if($$(id).config.view=="datatable"){
                                                                    $$("multiview"+menuId).define("height", $$(id).$height+100)
                                                                    $$("multiview"+menuId).resize()
                                                                    $$("multiview"+menuId).adjust()
                                                                }else if($$(id).config.view=="form"){
                                                                    $$("multiview"+menuId).define("height", $$(id).$height)
                                                                    $$("multiview"+menuId).resize()
                                                                    $$("multiview"+menuId).adjust()
                                                                }
                                                                if($$(id).config.view=="form"){
                                                                    if(!winAddData){
                                                                        let valueNow = getBlockValue(id)
                                                                        let changedId = []
                                                                        Object.keys(winDataCompare[id]['data']).forEach(function(item){
                                                                            if(winDataCompare[id]['data'][item]!=valueNow[item]){
                                                                                changedId.push(item)
                                                                            }
                                                                        })
                                                                        if(changedId.length==0){
                                                                            if(!winSearchMode){
                                                                                if(winConfigForm[id]['REST_API']!=undefined){
                                                                                    webix.extend($$(id), webix.ProgressBar);
                                                                                    $$(id).disable()
                                                                                    $$(id).clear()
                                                                                    restapi.restApiParam(winConfigForm[id].REST_API);
                                                                                    $$(id).enable()
                                                                                }
                                                                            }
                                                                        }
                                                                    }  
                                                                    if(winAddData && winJenisAddValue != "PARENT"){
                                                                        if(id != winFlagInsertBlock && winConfigForm[id]['REST_API']!=undefined){
                                                                            webix.extend($$(id), webix.ProgressBar);
                                                                            $$(id).disable()
                                                                            $$(id).clear()
                                                                            restapi.restApiParam(winConfigForm[id].REST_API);
                                                                            $$(id).enable()
                                                                        }
                                                                        if(winFlagInsertBlock != ""){
                                                                            if(winConfigForm[winFlagInsertBlock]["BLOCK_TYPE"][0]=="DATAGRID" && winConfigForm[id]["BLOCK_TYPE"][0]=="FORM"){
                                                                                $$(id).disable()
                                                                            }else{
                                                                                $$(id).enable()
                                                                            }
                                                                            if(winConfigForm[winFlagInsertBlock]["BLOCK_TYPE"][0]=="FORM" && winConfigForm[id]["BLOCK_TYPE"][0]=="FORM"){
                                                                                if(Object.keys(winDataCompare[id]["data"]).length != 0){
                                                                                    winConfigForm[id]["ELEMENT"].forEach(function(itemId){
                                                                                        $$(itemId).define("readonly",true)
                                                                                        $$(itemId).refresh()
                                                                                    })
                                                                                }else{
                                                                                    winConfigForm[id]["ELEMENT"].forEach(function(itemId){
                                                                                        $$(itemId).define("readonly",false)
                                                                                        $$(itemId).refresh()
                                                                                    })
                                                                                }
                                                                                if(id == winFlagInsertBlock){
                                                                                    winConfigForm[id]["ELEMENT"].forEach(function(itemId){
                                                                                        $$(itemId).define("readonly",false)
                                                                                        $$(itemId).refresh()
                                                                                    })
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }else if($$(id).config.view=="datatable"){
                                                                    if(winDataChanged[id].length==0){
                                                                        if(!winDataAtStart){
                                                                            if(!winSearchMode && winJenisAddValue!="PARENT"){
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
                                                                                if (!haveSubChild.includes(id)) {
                                                                                    if(winConfigForm[id]['REST_API']!=undefined){
                                                                                        webix.extend($$(id), webix.ProgressBar);
                                                                                        $$(id).disable()
                                                                                        $$(id).clearAll()
                                                                                        restapi.restApiParam(winConfigForm[id].REST_API);
                                                                                        $$(id).enable()
                                                                                    }
                                                                                }else{
                                                                                    if (!winDataDtSelect.hasOwnProperty(id)) {
                                                                                        if (winConfigForm[id]["BLOCK_TYPE"][2] == undefined) {
                                                                                            if(winConfigForm[id]['REST_API']!=undefined){
                                                                                                webix.extend($$(id), webix.ProgressBar);
                                                                                                $$(id).disable()
                                                                                                $$(id).clearAll()
                                                                                                restapi.restApiParam(winConfigForm[id].REST_API);
                                                                                                $$(id).enable()
                                                                                            }
                                                                                        }else{
                                                                                            if(winConfigForm[id]['REST_API']!=undefined){
                                                                                                let parent = winConfigForm[id]["BLOCK_TYPE"][2]
                                                                                                webix.extend($$(id), webix.ProgressBar);
                                                                                                $$(id).disable()
                                                                                                $$(id).clearAll()
                                                                                                restapi.restApiParam(winConfigForm[parent].REST_API);
                                                                                                $$(id).enable()
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }else{
                                                            let subParent = []
                                                            if (winConfigForm[winActiveBlock.focusNow]["BLOCK_TYPE"][1] == "SUB_PARENT") {
                                                                Object.keys(winConfigForm).forEach(function (blockId) {
                                                                    if (winConfigForm[blockId]["BLOCK_TYPE"][1] ==  "SUB_PARENT") {
                                                                        subParent.push(blockId)
                                                                    }else if(blockId == getBlockParent(winActiveBlock.focusNow)){
                                                                        subParent.push(blockId)
                                                                    }
                                                                })
                                                            }
                                                            subParent.every(function (subParentId) {
                                                                if (winActiveBlock.focusNow==subParentId){
                                                                    if (!$$(subParentId).validate()){
                                                                        winChangeTab = false
                                                                        validationSucces = false
                                                                        if(!isWebixPopupOpen()){
                                                                            let nameTab = findObjectById(subParentId,idMultiview).title
                                                                            webix.alert(ALERT.ALERTERROR('Validasi Gagal pada Block '+nameTab)).then(function(){
                                                                                $$("listMultiviewVertical"+menuId).select(subParentId)
                                                                                webix.$$(subParentId+"_verticalTab").show();
                                                                                webix.UIManager.setFocus($$(subParentId));
                                                                            })
                                                                        }
                                                                        return false
                                                                    }
                                                                    return true
                                                                }else{
                                                                    return true
                                                                }
                                                            })
                                                        
                                                            webix.$$(id+"_verticalTab").show();
            
                                                            let heightId = $$(id+"_verticalTab").$height
                                                            if($$(id).config.view=="datatable"){
                                                                $$("multiview"+menuId).define("height", $$(id).$height+100)
                                                                $$("multiview"+menuId).resize()
                                                                $$("multiview"+menuId).adjust()
                                                            }else if($$(id).config.view=="form"){
                                                                $$("multiview"+menuId).define("height", $$(id).$height)
                                                                $$("multiview"+menuId).resize()
                                                                $$("multiview"+menuId).adjust()
                                                            }
                                                            if($$(id).config.view=="form"){
                                                                if(!winAddData){
                                                                    let valueNow = getBlockValue(id)
                                                                    let changedId = []
                                                                    Object.keys(winDataCompare[id]['data']).forEach(function(item){
                                                                        if(winDataCompare[id]['data'][item]!=valueNow[item]){
                                                                            changedId.push(item)
                                                                        }
                                                                    })
                                                                    if(changedId.length==0){
                                                                        if(!winSearchMode){
                                                                            if(winConfigForm[id]['REST_API']!=undefined){
                                                                                webix.extend($$(id), webix.ProgressBar);
                                                                                $$(id).disable()
                                                                                $$(id).clear()
                                                                                restapi.restApiParam(winConfigForm[id].REST_API);
                                                                                $$(id).enable()
                                                                            }
                                                                        }
                                                                        if(winConfigForm[id]['BLOCK_TYPE'][1] == "SUB_PARENT"){
                                                                            webix.UIManager.setFocus($$(id))
                                                                        }
                                                                    }
                                                                }  
                                                                if(winAddData && winJenisAddValue != "PARENT"){
                                                                    if(id != winFlagInsertBlock && winConfigForm[id]['REST_API']!=undefined){
                                                                        webix.extend($$(id), webix.ProgressBar);
                                                                        $$(id).disable()
                                                                        $$(id).clear()
                                                                        restapi.restApiParam(winConfigForm[id].REST_API);
                                                                        $$(id).enable()
                                                                    }
                                                                    if(winFlagInsertBlock != ""){
                                                                        if(winConfigForm[winFlagInsertBlock]["BLOCK_TYPE"][0]=="DATAGRID" && winConfigForm[id]["BLOCK_TYPE"][0]=="FORM"){
                                                                            $$(id).disable()
                                                                        }else{
                                                                            $$(id).enable()
                                                                        }
                                                                        if(winConfigForm[winFlagInsertBlock]["BLOCK_TYPE"][0]=="FORM" && winConfigForm[id]["BLOCK_TYPE"][0]=="FORM"){
                                                                            if(Object.keys(winDataCompare[id]["data"]).length != 0){
                                                                                winConfigForm[id]["ELEMENT"].forEach(function(itemId){
                                                                                    $$(itemId).define("readonly",true)
                                                                                    $$(itemId).refresh()
                                                                                })
                                                                            }else{
                                                                                winConfigForm[id]["ELEMENT"].forEach(function(itemId){
                                                                                    $$(itemId).define("readonly",false)
                                                                                    $$(itemId).refresh()
                                                                                })
                                                                            }
                                                                            if(id == winFlagInsertBlock){
                                                                                winConfigForm[id]["ELEMENT"].forEach(function(itemId){
                                                                                    $$(itemId).define("readonly",false)
                                                                                    $$(itemId).refresh()
                                                                                })
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }else if($$(id).config.view=="datatable"){
                                                                if(winDataChanged[id].length==0){
                                                                    if(!winDataAtStart){
                                                                        if(!winSearchMode && winJenisAddValue!="PARENT"){
                                                                            if(!winThereIsSubChild){
                                                                                if(winConfigForm[id]['REST_API']!=undefined){
                                                                                    webix.extend($$(id), webix.ProgressBar);
                                                                                    $$(id).disable()
                                                                                    $$(id).clearAll()
                                                                                    restapi.restApiParam(winConfigForm[id].REST_API);
                                                                                    $$(id).enable()
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                            winChangeTab = true
                                                        }
                                                    }else{
                                                        winChangeTab = false
                                                        setFocusAfterValidate(winActiveBlock.focusNow)
                                                        return false
                                                    }
                                                }
                                                if(winLayout_v2 == true){
                                                    reLayoutOden(id)
                                                }
                                            },
                                            onAfterSelect:function(id){
                                                if($$(id).config.view=="datatable"){
                                                    $$("multiview"+menuId).define("height", $$(id).$height+100)
                                                    $$("multiview"+menuId).resize()
                                                    $$("multiview"+menuId).adjust()
                                                }else if($$(id).config.view=="form"){
                                                    $$("multiview"+menuId).define("height", $$(id).$height)
                                                    $$("multiview"+menuId).resize()
                                                    $$("multiview"+menuId).adjust()
                                                }
                                                if(Object.keys(winDataCompare[getBlockParent()].data).length!=0 || winAddData!=false){
                                                    if (winChangeTab) {
                                                        webix.$$(id+"_verticalTab").show();
                                                        winActiveBlock.lastFocus = winActiveBlock.focusNow
                                                        winActiveBlock.focusNow = id
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
                                                        if($$(winActiveBlock.focusNow).validate()){ 
                                                            let getId
                                                            if (winActiveBlock.lastFocus != '' && winConfigForm[winActiveBlock.lastFocus]["BLOCK_TYPE"][1] != "PARENT" && winConfigForm[winActiveBlock.lastFocus]["BLOCK_TYPE"][0] != "FORM") {
                                                                getId = $$(winActiveBlock.lastFocus).getSelectedId()
                                                            }
                                                            if (winAddData && winThereIsSubChild) {
                                                                if (winActiveBlock.lastFocus != '' && winConfigForm[winActiveBlock.lastFocus]["BLOCK_TYPE"][1] != "PARENT") {
                                                                    if(ChildParent!=undefined){
                                                                        if (getId != undefined) {
                                                                            let lastIndex = $$(winActiveBlock.lastFocus).getIndexById(getId.row)
                                                                            let page = winConfigForm[winActiveBlock.lastFocus]['DATA_PER_PAGE'] || 10
                                                                            let hasil = calculatePageSubChild(lastIndex,page)
                                                                            $$(id).setPage(hasil-1)
                                                                        }
                                                                    }else{
                                                                        $$(id).setPage(winPagerDatatable[id][0])
                                                                    }
                                                                }
                                                            }
                                                            if(winConfigForm[id]["BLOCK_TYPE"][0]=="DATAGRID"){
                                                                if (winThereIsSubChild && getId != undefined) {
                                                                    if(ChildParent!=undefined){
                                                                        let lastIndex = $$(winActiveBlock.lastFocus).getIndexById(getId.row)
                                                                        let indexNow = $$(id).getIdByIndex(lastIndex)
                                                                        if (indexNow!=undefined) {
                                                                            $$(id).select(indexNow,$$(id).config.columns[0].id);
                                                                        }
                                                                    }else{
                                                                        if($$(winActiveBlock.focusNow).serialize().length!=0){
                                                                            $$(winActiveBlock.focusNow).select($$(winActiveBlock.focusNow).getFirstId(),$$(winActiveBlock.focusNow).config.columns[0].id);
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                            if(winActiveBlock.lastFocus!=""){
                                                                webix.html.removeCss($$(winActiveBlock.lastFocus).getNode(), "datablock-focus")
                                                            }
                                                            webix.html.addCss($$(winActiveBlock.focusNow).getNode(), "datablock-focus")
                                                            $$("listMultiviewVertical"+menuId).config.prevFocusList = id
                                                        }
                                                    }
                                                }
                                                if(winLayout_v2 == true){
                                                    reLayoutOden(id)
                                                }
                                            }
                                        },
                                        ready:function(){
                                            $$(this.config.id).define("height",$$(this.config.id).config.data.length*36)
                                            $$(this.config.id).resize()
                                            $$(this.config.id).select($$(this.config.id).getFirstId());
                                        }
                                    },
                                    {}
                                ]
                            },
                            {
                                width:20
                            },
                            {
                                view:"multiview",
                                animate:false,
                                id:"multiview"+menuId,
                                cells:fixElementVerticalMultiview,
                            }
                        ]
                    }
                ]    
            }
        return view
    }

    element(titleView,dataBlock){
        let elementBlock = dataBlock
        if(dataBlock.length!=undefined){
            dataBlock[0]['title'] = titleView
        }else{
            dataBlock['title'] = titleView
        }
        return elementBlock
    }
}

let multiview = new MultiView();
let verticalMultiView = new VerticalMultiView();

winAdditionalTemplate["Tab changed to "] = "Tab changed to "