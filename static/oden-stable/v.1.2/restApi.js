/*
	JS-Oden-Stable V.1.2
	Update : 2025-12-09
	Common Library - restapi.js
		Update : 
			- grid to grid
*/
window.winDataCompare = {}
window.winDataDtSelect = {}
window.winApiCombos = []
window.winActiveOverlay = {}
window.winIsWithoutAPI = false
window.winZoomViewFile = 1
window.winTotalDataDt = {} 
window.winCountDataDt = {}

var afterInsertHead = false;
history.pushState({}, document.title, location.search);

let liveApiRequest = function() {
    /* Fungsi untuk check apakah ada API yang masih berlangsung
    Jika iya, maka prevent default untuk button transaksi yang tidak refresh halaman di element.js
    */
    var oldOpen = XMLHttpRequest.prototype.open;
    let whiteListURL = ["https://example.com","https://hocdnoden0201.sat.co.id/video-tutorial/list-video.json"]
    window.openHTTPs = 0;
    XMLHttpRequest.prototype.open = function(method, url, async, user, pass) {
        if (!whiteListURL.includes(url)) {
            window.openHTTPs++;
            this.addEventListener("readystatechange", function() {
                if(this.readyState == 4) {
                    window.openHTTPs--;
                }
            }, false);
        }
        oldOpen.call(this, method, url, async, user, pass);
    }   
}

liveApiRequest()

function loadingShow(){
    $$(menuId).disable()//enable
    $$(menuId).showProgress();//loading
}

function preventDownload(iframe) {
    iframe.contentWindow.document.oncontextmenu = function() { return false; };
    iframe.contentWindow.document.body.addEventListener('click', function(e) {
        if (e.target.tagName === 'A' && e.target.download !== undefined) {
            e.preventDefault();
        }
    });
}

// async function showLoading(){
//     await loadingShow()
// }

class RestApi{
    restApi(param){
        //api ini tidak digunakan
        let dataParam = {}
        dataParam.type = "API"
        dataParam.menuId = menuId
        dataParam.data = {}
        dataParam.apiName = param.API_NAME
        webix.ajax().headers({'Content-Type':'application/json'}).post("/",dataParam).then(function(respond){
            let jsonData = respond.json()
            let getData = jsonData.data;
            let getStatus = jsonData.status;
            if(getStatus == true && getData.length!=0){
                $$(param.ITEM_ID).clearAll();
                $$(param.ITEM_ID).parse(getData);
                $$(param.ITEM_ID).refresh();
            }
        })
    }
    
    restApiModalForm(param){
        let dataParam = {}
        dataParam.type = "API"
        dataParam.menuId = menuId
        dataParam.data = {}
        if(param.PARAM_ID!=undefined){
            param.PARAM_ID.forEach(function(keys){
                dataParam.data[keys] = getItemValue(keys)
                if (getItemValue(keys)==""){
                    dataParam.data[keys] = "%%"
                }        
            });

        }
        dataParam.apiName = param.API_NAME
        webix.ajax().headers({'Content-Type':'application/json'}).post("/",dataParam).then(function(respond){
            let jsonData = respond.json()
            let getData = jsonData.data;
            let getStatus = jsonData.status;
            if(getStatus == true && getData.length!=0){
                $$(param.ITEM_ID).clear();
                $$(param.ITEM_ID).parse(getData);
                $$(param.ITEM_ID).refresh();
            }else if(getStatus == true && getData.length==0){
                let messageAlert
                if($$("comboMultiLanguage")!=undefined){
                    let getLanguageCode = $$("comboMultiLanguage").getValue()
                    messageAlert = window["jsonMultiLanguage_"+menuId][getLanguageCode]["Tidak Ada Data"] || "Tidak Ada Data"
                }else{
                    messageAlert = "No Data Found"
                }
                // messageAlert = messageAlert.replace("/n","<br>")
                // messageAlert = messageAlert.replace("+winFormTitle+",winFormTitle)
                if(!isWebixPopupOpen()){
                    webix.alert(messageAlert,"alert-error");
                }
            }else{
                if(!isWebixPopupOpen()){
                    webix.alert(jsonData['msg'],"alert-error");
                }
            }
        })
    }

    restApiParam(param){
        let errorThisFunc = {'statusCode':undefined,'statusText':undefined,'msg':undefined}
        let blockName = param['BLOCK_NAME']
        let blockType = ""
        let dataParam = {}
        let requestValue = {}
        let bindParam = param.data || {}
        let offsetNumber = param['OFFSET_NUMBER'] || 0
        dataParam.type = "SELECT"
        dataParam.menuId = menuId
        param['PARAM_ID'].forEach(function(itemId){
            bindParam[itemId] = getItemValue(itemId)
            if (window.winDateType.includes(itemId)){
                if(bindParam[itemId]!=null && bindParam[itemId]!=''){
                    let value = bindParam[itemId].split(" ")[0]
                    let dateDDMMYY = value.split("-").reverse().join("-")
                    bindParam[itemId]=dateDDMMYY
                }
            }
            if (window.winDateTypeMMYY.includes(itemId)){
                if(bindParam[itemId]!=null && bindParam[itemId]!=''){
                    let value = bindParam[itemId].split(" ")[0]
                    let dateMMYY = value.split("-").reverse().join("-")
                    bindParam[itemId]=dateMMYY+'-01'
                }
            }
            if (window.winDateTypeYY.includes(itemId)){
                if(bindParam[itemId]!=null && bindParam[itemId]!=''){
                    let value = bindParam[itemId].split(" ")[0]
                    let dateYY = value.split("-").reverse().join("-")
                    bindParam[itemId]=dateYY+'-01-01'
                }
            }
        });
        requestValue.data = bindParam
        if("DATA" in param){
            Object.keys(param['DATA']).forEach(function(idParam){
                requestValue.data[idParam] = param['DATA'][idParam]
            })
        }
        if(winConfigForm[blockName]["BLOCK_TYPE"][0]=="FORM"){
            if(offsetNumber==undefined){
                offsetNumber = 0
            }
            requestValue.blockName = blockName
            requestValue.blockType = "form";
            requestValue.data['offsetNumber'] = offsetNumber;
            blockType = "form";
        }else if(winConfigForm[blockName]["BLOCK_TYPE"][0]=="DATAGRID"){
            requestValue.blockName = blockName
            requestValue.blockType = "datagrid";
            blockType = "datagrid";
            requestValue.data['offsetNumber'] = offsetNumber;
        }
        dataParam.data = requestValue
        winStartEditAfterLoadData = false

        //Check is there is subchild
        let subChildId = []
        if(winThereIsSubChild){
            Object.keys(winConfigForm).forEach(function(blockId){
                if(winConfigForm[blockId]["BLOCK_TYPE"][2] == blockName){
                    subChildId.push(blockId)
                }
            })
        }

        subChildId.forEach(function(idChild){
            webix.extend($$(idChild), webix.ProgressBar)
            $$(idChild).showProgress()
        })
        webix.extend($$(blockName), webix.ProgressBar)
        $$(blockName).showProgress()
        if(winConfigForm[blockName]["BLOCK_TYPE"][0] == "DATAGRID"){
            $$(blockName).hideColumn("action_"+blockName)
        }
        
        
        let promise = new Promise((resolve)=>{
            webix.ajax().headers({'Content-Type':'application/json'}).post("/",dataParam).then(function(respond){
                let jsonData = respond.json()
                let getData = jsonData.data;
                let getStatus = jsonData.status;
                winValidatePromise = {}
                Object.keys(winCountDataDt).forEach(function(blockCount){
                    winCountDataDt[blockCount] = false
                })
                
                if(getStatus == true && getData.length!=0){
                    getData.forEach(function(record){
                        let keysRecord = Object.keys(record)
                        keysRecord.forEach(function(key){
                            if (window.winDateType.includes(key)){
                                if(record[key]!=null && record[key]!=''){
                                    let value = record[key].split(" ")[0]
                                    let dateDDMMYY = value.split("-").reverse().join("-")
                                    record[key]=dateDDMMYY
                                }
                            }
                            if (window.winDateTypeMMYY.includes(key)){
                                if(record[key]!=null && record[key]!=''){
                                    let value = record[key].split(" ")[0]
                                    let dateMMYY = value.split("-").reverse().join("-")
                                    record[key]=dateMMYY.slice(3,10)
                                }
                            }
                            if (window.winDateTypeYY.includes(key)){
                                if(record[key]!=null && record[key]!=''){
                                    let value = record[key].split(" ")[0]
                                    let dateYY = value.split("-").reverse().join("-")
                                    record[key]=dateYY.slice(6,10)
                                }
                            }
                            if (window.winClockType.includes(key)){
                                if(record[key]!=null && record[key]!=''){
                                    let time = record[key].split(" ")[1]
                                    let addSecond
                                    if(blockType == 'datagrid'){
                                        addSecond = $$(blockName).getColumnConfig(key).addSecond
                                    }else{
                                        addSecond = $$(key).config.addSecond
                                    }
                                    if(!addSecond){
                                        record[key] = time.slice(0,5)
                                    }else{
                                        record[key] = time
                                    }
                                }
                            }
                            if (window.winTimestampType.includes(key)){
                                if(record[key]!=null && record[key]!=''){
                                    let date = record[key].split(" ")[0].split("-").reverse().join("-")
                                    let time = record[key].split(" ")[1]
                                    record[key] = date + ' ' +time
                                }
                            }
                        })
                    })
                    if(!winAddData){
                        window.winSearchRecord = false
                        $$("searchValue").config.value="Search Mode"
                        $$("searchValue").refresh()
                        $$("searchValue").$view.classList.remove("webix_custom_button")
                        $$("searchValue").refresh()
                        $$("addValue").$view.classList.remove("webix_custom_button")
                        $$("addValue").refresh()
                        $$("prev").define("disabled",false)
                        $$("next").define("disabled",false)
                        // window.winAddData=false;
                        winFlagInsertBlock = ""
                        winFlagInsertChild = []
                        $$("addValue").define('disabled',false)
                        $$("updateValue").define('disabled',false)
                        $$("deleteValue").define('disabled',false)
                        window.winSearchMode = false
                    }
                    window.winCheckRadio.forEach(function(item){
                        if(!winDisplayItem.includes(item)){
                            if($$(item)!=undefined){
                                $$(item).enable()
                            }
                        }
                    })
                    if (blockType=="form"){
                        winConfigForm[blockName]['ELEMENT'].forEach(function(id){
                            if(!winDisplayItem.includes(id)){
                                if($$(id)!=undefined){
                                    $$(id).enable()
                                }
                            }
                        })
                        if(!winAddData){
                            winConfigForm[blockName]["ELEMENT"].forEach(function(id){
                                if($$(id) != undefined){
                                    $$(id).define("readonly",false)
                                    $$(id).refresh()
                                }
                            })
                        }
                        
                        window.winDataCompare[blockName] = {"data":{}}
                        
                        Object.keys(getData[0]).forEach(function(key){
                            if (window.winCurrency.includes(key)){
                                let currency = getData[0][key]
                                getData[0][key] = Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(currency)
                            }
                            if(getData[0][key]==null){
                                getData[0][key] = ''
                            }
                            if(getData[0][key]==undefined){
                                window.winDataCompare[blockName]["data"][key] = ""
                            }else{
                                window.winDataCompare[blockName]["data"][key] = getData[0][key]
                            }
                            if(winCheckRadio.includes(key)){
                                if(getData[0][key]=='' || getData[0][key]=='null'){
                                    $$(key).config.nullValue = true
                                }else{
                                    $$(key).config.nullValue = false
                                }
                            }
                        })
                        $$(blockName).parse(getData[0])
                        window.winDataMaster = getBlockValue(blockName)
                        winUploaderFile.forEach(function(idUploader){
                            if($$(idUploader)!=undefined){
                                if(winConfigForm[blockName]['ELEMENT'].includes($$(idUploader).config.colsFile.newFileName)){
                                    let dataFile = []
                                    let fileNameDb = getItemValue($$(idUploader).config.colsFile.newFileName)
                                    let oldFileNameDb = getItemValue($$(idUploader).config.colsFile.oldFileName)
                                    if(fileNameDb!=""){
                                        let fileNameSplited = fileNameDb.split("|")
                                        let oldFileNameSplited = oldFileNameDb.split("|")
                                        oldFileNameSplited.forEach(function(nameFile,idx){
                                            dataFile.push({ name:nameFile, sizetext:"",status:"server", sequenceName:fileNameSplited[idx]})
                                        })
                                    }
                                    $$(idUploader).files.parse(dataFile)
                                }
                            }
                        })
                        afterInsertHead = false
                        winConfigForm[blockName]["PRIMARY_KEY"].forEach(function (item) {
                            $$(item).define("readonly",true)
                            $$(item).refresh()
                        });
                        winIsPrimary.forEach(function (item) {
                            if($$(getBlockItem(item)).config.view=="form"){
                                $$(item).define("readonly",true)
                                $$(item).refresh()
                            }
                        });

                        if(winMultiviewBlocksVertical.includes(blockName)){
                            if($$(blockName).$height+20<460){
                                // $$("multiviewParentId_"+menuId).define("height", 460+20);
                                $$("multiview"+menuId).define("height", 480)
                                $$("multiview"+menuId).resize()
                                $$("multiview"+menuId).adjust()
                            }else{
                                // $$("multiviewParentId_"+menuId).define("height", $$(blockName).$height+20);
                                $$("multiview"+menuId).define("height", $$(blockName).$height)
                                $$("multiview"+menuId).resize()
                                $$("multiview"+menuId).adjust()
                            }
                            // $$("multiviewParentId_"+menuId).resize();

                            let heightMultiview = $$(blockName).$height
                            if(heightMultiview>winHeightMultiview[blockName]){
                                winHeightMultiview[blockName] = heightMultiview
                            }
                        }
                        
                    $$(blockName).hideProgress()
                    }else if(blockType=="datagrid"){
                        
                        if(param.LOAD_MORE_DATA!=undefined){
                            if(param.LOAD_MORE_DATA){
                                if (winThereIsSubChild) {
                                    Object.keys(winConfigForm).forEach(function (blockId) {
                                        if (winConfigForm[blockId]['BLOCK_TYPE'][1] != "PARENT") {
                                            if (winConfigForm[blockId]['BLOCK_TYPE'][1]=="SUB_CHILD"){
                                                $$(blockId).parse(getData)
                                                $$(blockId).refresh();
                                                // winDataDtSelect[blockId] = webix.copy(getData)
                                                // winDataDtSelect[blockId].push.apply(winDataDtSelect[blockId], webix.copy(getData))
                                                // winCountOffsetRecord[blockId] = winDataDtSelect[blockId].length
                                                
                                                winDataDtSelect[blockId].push.apply(winDataDtSelect[blockId],webix.copy(getData))
                                                winCountOffsetRecord[blockId] = winDataDtSelect[blockId].length
                                                $$(blockId).enable()
                                                // winDataChanged[blockId] = []
                                            }else{
                                                $$(blockId).parse(getData)
                                                $$(blockId).refresh();
                                                winDataDtSelect[blockId].push.apply(winDataDtSelect[blockId],webix.copy(getData))
                                                winCountOffsetRecord[blockId] = winDataDtSelect[blockId].length
                                                $$(blockId).enable()
                                                // winDataChanged[blockId] = []
                                            }
                                        }
                                    })
        
        
                                }else {
                                    hideOverlay(blockName)
                                    $$(blockName).parse(getData);
                                    $$(blockName).refresh();
                                    winDataDtSelect[blockName].push.apply(winDataDtSelect[blockName],webix.copy(getData))
                                    winCountOffsetRecord[blockName] = winDataDtSelect[blockName].length
                                    $$(blockName).enable()
                                    // winDataChanged[blockName] = []
                                }
                            }
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
                                if (haveSubChild.includes(blockName)) {
                                    let partitionData = {}
                                    Object.keys(winConfigForm).forEach(function(blockId){
                                        let parentChild
                                        if(winConfigForm[blockId]['BLOCK_TYPE'][1]=="SUB_CHILD"){
                                            parentChild = winConfigForm[blockId]['BLOCK_TYPE'][2]
                                            partitionData[blockId] = []
                                            getData.forEach(function(record){
                                                let newRecordPartition = {}
                                                Object.keys(record).forEach(function(keyRecord){
                                                    if(winConfigForm[blockId]['ELEMENT'].includes(keyRecord)){
                                                        newRecordPartition[keyRecord] = record[keyRecord]
                                                    }
                                                    winConfigForm[winConfigForm[blockId]['BLOCK_TYPE'][2]]['PRIMARY_KEY'].forEach(function(idPkRecord){
                                                        newRecordPartition[idPkRecord] = record[idPkRecord]
                                                    })
        
                                                })
                                                partitionData[blockId].push(newRecordPartition)
                                            })
                                        }
                                      

                                        if(parentChild!=undefined){
                                          
                                            if(partitionData[parentChild]==undefined){
                                                partitionData[parentChild] = []
                                                getData.forEach(function(record){
                                                    let newRecordPartition = {}
                                                    Object.keys(record).forEach(function(keyRecord){
                                                        if(winConfigForm[parentChild]['ELEMENT'].includes(keyRecord)){
                                                            newRecordPartition[keyRecord] = record[keyRecord]
                                                        }
                                                        winConfigForm[parentChild]['PRIMARY_KEY'].forEach(function(idPkRecord){
                                                            newRecordPartition[idPkRecord] = record[idPkRecord]
                                                        })
                                                    })
                                                    partitionData[parentChild].push(newRecordPartition)
                                                })
                                            }
                                        }
                                    })
                                    if (winDataDtSelect.hasOwnProperty(blockName)) {
                                        winDataDtSelect = webix.copy(partitionData)
                                    }else{
                                        Object.assign(winDataDtSelect, partitionData);
                                    }
                                    
                                    Object.keys(winDataDtSelect).forEach(function(blockId){
                                        window.winPagerDatatable[blockId][0] = 0   
                                        $$(blockId).unselectAll();
                                        $$(blockId).clearAll();
                                        hideOverlay(blockId)
                                        $$(blockId).parse(webix.copy(winDataDtSelect[blockId]));
                                        $$(blockId).refresh();
                                        $$(blockId).enable()
                                        winDataChanged[blockId] = []
                                        winDataDtSelect[blockId] = webix.copy($$(blockId).serialize())
                                    })
                                }else{
                                    $$(blockName).clearAll();
                                    hideOverlay(blockName)
                                    $$(blockName).parse(getData);
                                    winDataDtSelect[blockName] = webix.copy(getData)
                                    $$(blockName).refresh();
                                    $$(blockName).enable()
                                    winDataChanged[blockName] = []
                                    window.winPagerDatatable[blockName][0] = 0   
                                }   
                            }else{ 
                                try{
                                    $$(blockName).clearAll();
                                    hideOverlay(blockName)
                                    $$(blockName).parse(getData);
                                    winDataDtSelect[blockName] = webix.copy(getData)
                                    $$(blockName).refresh();
                                    $$(blockName).enable()
                                    winDataChanged[blockName] = []
                                } catch (error){
                                }
                            }
                            window.winPagerDatatable[blockName][0] = 0   
                        }
                        Object.keys(winConfigForm).forEach(function(blockId){
                            $$(blockId).enable()
                        })
                        let idGenWebixDt = []
                        $$(blockName).data.order.forEach(function(index){
                            idGenWebixDt.push(index)
                        })
                        
                        window.winIdOldRecordDt[blockName] = idGenWebixDt
                        window.winPagerDatatable[blockName][1] = $$("pager_"+blockName).data.old_limit-1
                        window.winTotalRecordDt[blockName] = $$(blockName).count()
                        $$("count_"+blockName).define("count",window.winTotalRecordDt[blockName])
                        $$("count_"+blockName).define("page",window.winTotalRecordDt[blockName]-1)
                        $$("count_"+blockName).refresh()
                    }
                    $$(window.winListIdBtn[4]).define("disabled",false);
                    searchCount=0
    
                    $$(menuId).enable()//enable
                    if(subChildId.length!=0){
                        subChildId.forEach(function(idChild){
                            $$(idChild).hideProgress()
                        })
                    }

                    if(winLayout_v2 == true){
                        reLayoutOden(blockName)
                    }

                    $$(blockName).hideProgress();//loading
                }else if(getStatus == true && getData.length==0){
                    if(winConfigForm[blockName]["BLOCK_TYPE"][0]=="FORM"){
                        window.winDataCompare[blockName] = {"data":{}}
                        if(winSearchMode){
                            if(!isWebixPopupOpen()){
                                webix.alert(ALERT.ALERTWARNING("Data not found | "+blockName)).then(function(){
                                    $$(blockName).clear();
                                    $$(blockName).hideProgress()
                                    $$(menuId).enable()//enable
                                    $$(blockName).enable()
                                    $$("next").define('disabled',true)
                                    $$(winConfigForm[winActiveBlock.focusNow]["ELEMENT"][0]).focus()
                                })
                            }
                        }else{
                            if(winCountOffsetRecord[blockName]==0){
                                $$(blockName).clear();
                                $$(menuId).enable()//enable
                                $$(blockName).enable()
                                if(!winAddData){
                                    winConfigForm[blockName]["ELEMENT"].forEach(function(id){
                                        if($$(id) != undefined){
                                            $$(id).define("readonly",true)
                                            $$(id).refresh()
                                        }
                                    })
                                }
                                let blockNameMessage = blockName
                                if(winMultiviewBlocks.includes(blockName)){
                                    $$("tabbar"+menuId).config.options.every(function(optionRecord){
                                        if(optionRecord.id==blockName){
                                            blockNameMessage = optionRecord.value
                                            return false
                                        }
                                        return true
                                    })
                                }else if(winMultiviewBlocksVertical.includes(blockName)){
                                    $$("listMultiviewVertical"+menuId).config.data.every(function(optionRecord){
                                        if(optionRecord.id==blockName){
                                            blockNameMessage = optionRecord.title
                                            return false
                                        }
                                        return true
                                    })
                                }else{
                                    blockNameMessage = winFormTitle
                                }
                                let messageAlert
                                if($$("comboMultiLanguage")!=undefined && window["jsonMultiLanguage_"+menuId] && Object.keys(window["jsonMultiLanguage_"+menuId]).length){
                                    let getLanguageCode = $$("comboMultiLanguage").getValue()
                                    messageAlert = window["jsonMultiLanguage_"+menuId][getLanguageCode]["Tidak Ada Data/n+blockNameMessage+ (form)"] || "Tidak Ada Data<br>+blockNameMessage+ (form)"
                                }else{
                                    messageAlert = "No data found<br>+blockNameMessage+ (form)"
                                }
                                messageAlert = messageAlert.replace("/n","<br>")
                                messageAlert = messageAlert.replace("+blockNameMessage+",blockNameMessage)
                                webix.message({
                                    text:messageAlert,
                                    type:"debug", 
                                    expire: 10000,
                                });
                                $$(blockName).hideProgress()
                            }else if(winCountOffsetRecord[blockName]!=0){
                                let blockNameMessage = winFormTitle
                                let messageAlert
                                if($$("comboMultiLanguage")!=undefined && window["jsonMultiLanguage_"+menuId] && Object.keys(window["jsonMultiLanguage_"+menuId]).length){
                                    let getLanguageCode = $$("comboMultiLanguage").getValue()
                                    messageAlert = window["jsonMultiLanguage_"+menuId][getLanguageCode]["Tidak Ada Data/n+blockNameMessage+ (form)"] || "Tidak Ada Data<br>+blockNameMessage+ (form)"
                                }else{
                                    messageAlert = "No Data Found<br>+blockNameMessage+ (form)"
                                }
                                messageAlert = messageAlert.replace("/n","<br>")
                                messageAlert = messageAlert.replace("+blockNameMessage+",blockNameMessage)
                                webix.message({
                                    text:messageAlert,
                                    type:"debug", 
                                    expire: 10000,
                                });
                                $$(blockName).clear();
                                $$(menuId).enable()//enable
                                $$(blockName).enable()
                                if(subChildId.length!=0){
                                    subChildId.forEach(function(idChild){
                                        $$(idChild).hideProgress()
                                    })
                                }
                                $$(blockName).hideProgress()
                            }
                        }
                    }else if(winConfigForm[blockName]["BLOCK_TYPE"][0]=="DATAGRID"){
                        if(param.LOAD_MORE_DATA==undefined){
                            $$(blockName).clearAll();
                        }
                        if($$(blockName).config.customOperator!=undefined){
                            let additionalCustomOperator = webix.copy($$(blockName).config.customOperator)
                            if(winDataDtSelect[blockName].length!=0){
                                additionalCustomOperator["RESET_DATA"] = false
                            }else{
                                additionalCustomOperator["RESET_DATA"] = true
                            }
                            //updateOperatorCustomDt(additionalCustomOperator);
                            updateFooterDatagrid(blockName)
                        }
                        if(winCountOffsetRecord[blockName]==0){
                            if(winMultiviewBlocks.includes(blockName)){
                                let labelItem
                                $$('tabbar'+menuId).config.options.every(function(objOption){
                                    if(objOption['id']==blockName){
                                        labelItem = "Tabbar "+objOption['value']
                                        return false
                                    }
                                    return true
                                })
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
                                    if (haveSubChild.includes(blockName)) {
                                        Object.keys(winConfigForm).forEach(function(blockId){
                                            if(winConfigForm[blockId]['BLOCK_TYPE'][1]=="SUB_CHILD"){
                                                let messageOverlay
                                                if($$("comboMultiLanguage")!=undefined && window["jsonMultiLanguage_"+menuId] && Object.keys(window["jsonMultiLanguage_"+menuId]).length){
                                                    let getLanguageCode = $$("comboMultiLanguage").getValue()
                                                    messageOverlay = window["jsonMultiLanguage_"+menuId][getLanguageCode]["Sorry, there is no data"] || "Sorry, there is no data"
                                                }else{
                                                    messageOverlay = "Sorry, there is no data"
                                                }
                                                $$(blockId).clearAll();
                                                $$(menuId).enable()//enable
                                                $$(blockId).enable()
                                                $$(blockId).showOverlay(messageOverlay);
                                                $$(blockId).hideProgress()
                                            }
                                            $$(blockName).clearAll();
                                            $$(blockName).enable()
                                            let messageOverlay
                                            if($$("comboMultiLanguage")!=undefined && window["jsonMultiLanguage_"+menuId] && Object.keys(window["jsonMultiLanguage_"+menuId]).length){
                                                let getLanguageCode = $$("comboMultiLanguage").getValue()
                                                messageOverlay = window["jsonMultiLanguage_"+menuId][getLanguageCode]["Sorry, there is no data"] || "Sorry, there is no data"
                                            }else{
                                                messageOverlay = "Sorry, there is no data"
                                            }
                                            $$(blockName).showOverlay(messageOverlay);
                                            $$(blockName).hideProgress()
                                        })
                                    }else{
                                        winDataDtSelect[blockName] = []
                                        if(blockId in winActiveOverlay){
                                            delete winActiveOverlay[blockId]
                                        }
                                        winActiveOverlay[blockId] = "Sorry, there is no data"
                                        let messageOverlay
                                        if($$("comboMultiLanguage")!=undefined && window["jsonMultiLanguage_"+menuId] && Object.keys(window["jsonMultiLanguage_"+menuId]).length){
                                            let getLanguageCode = $$("comboMultiLanguage").getValue()
                                            messageOverlay = window["jsonMultiLanguage_"+menuId][getLanguageCode]["Sorry, there is no data"] || "Sorry, there is no data"
                                        }else{
                                            messageOverlay = "Sorry, there is no data"
                                        }
                                        $$(blockName).clearAll();
                                        $$(menuId).enable()//enable
                                        $$(blockName).enable()
                                        $$(blockName).showOverlay(messageOverlay);
                                        $$(blockName).hideProgress()
                                    }
                                }else{
                                    winActiveOverlay[blockName] = "Sorry, there is no data"
                                    let messageOverlay
                                    if($$("comboMultiLanguage")!=undefined && window["jsonMultiLanguage_"+menuId] && Object.keys(window["jsonMultiLanguage_"+menuId]).length){
                                        let getLanguageCode = $$("comboMultiLanguage").getValue()
                                        messageOverlay = window["jsonMultiLanguage_"+menuId][getLanguageCode]["Sorry, there is no data"] || "Sorry, there is no data"
                                    }else{
                                        messageOverlay = "Sorry, there is no data"
                                    }
                                    $$(blockName).clearAll();
                                    $$(menuId).enable()//enable
                                    $$(blockName).enable()
                                    $$(blockName).showOverlay(messageOverlay);
                                    $$(blockName).hideProgress()
                                    
                                }
                                
                                // webix.message({
                                //     text:"Tidak Ada Data<br>"+blockNameMessage+" (datagrid)",
                                //     type:"debug", 
                                //     expire: 5000,
                                // }); 
                            }else{
                                
                                $$(blockName).clearAll();
                                if(winConfigForm[blockName]['DATA_PER_PAGE'] != undefined){
                                    $$(blockName).define("height", (winConfigForm[blockName]['DATA_PER_PAGE']*36)+43)
                                }else{
                                    $$(blockName).define("height", (10*36)+43)
                                }
                                if(blockName in winActiveOverlay){
                                    delete winActiveOverlay[blockName]
                                }
                                winActiveOverlay[blockName] = "Sorry, there is no data"
                                let messageOverlay
                                if($$("comboMultiLanguage")!=undefined && window["jsonMultiLanguage_"+menuId] && Object.keys(window["jsonMultiLanguage_"+menuId]).length){
                                    let getLanguageCode = $$("comboMultiLanguage").getValue()
                                    messageOverlay = window["jsonMultiLanguage_"+menuId][getLanguageCode]["Sorry, there is no data"] || "Sorry, there is no data"
                                }else{
                                    messageOverlay = "Sorry, there is no data"
                                }
                                $$(blockName).resize()
                                $$(menuId).enable()//enable
                                $$(blockName).enable()
                                $$(blockName).showOverlay(messageOverlay);
                                
                                if(subChildId.length!=0){
                                    subChildId.forEach(function(idChild){
                                        $$(idChild).hideProgress()
                                    })
                                }
                                
                                $$(blockName).hideProgress();//loading
                                // webix.message({
                                //     text:"Tidak Ada Data<br>"+blockNameMessage+" (datagrid)",
                                //     type:"debug", 
                                //     expire: 10000,
                                // }); 
                            }
                        }else if(winCountOffsetRecord[blockName]!=0){
                            winCountOffsetRecord[blockName] = winDataDtSelect[blockName].length
                            $$(blockName).config.dynamicLoadData = winDataDtSelect[blockName].length
                            let messageAlert
                            if($$("comboMultiLanguage")!=undefined && window["jsonMultiLanguage_"+menuId] && Object.keys(window["jsonMultiLanguage_"+menuId]).length){
                                let getLanguageCode = $$("comboMultiLanguage").getValue()
                                messageAlert = window["jsonMultiLanguage_"+menuId][getLanguageCode]["Data Tidak Ditemukan | "] || "Data Tidak Ditemukan | "
                            }else{
                                messageAlert = "No Data Found | "
                            }
                            // messageAlert = messageAlert.replace("/n","<br>")
                            // messageAlert = messageAlert.replace("+blockNameMessage+",blockNameMessage)
                            webix.message({
                                text:messageAlert+blockName,
                                type:"debug", 
                                expire: 10000,
                            }); 
                            if(winDataDtSelect[blockName].length==0){
                                $$(blockName).clearAll();
                            }
                            if(winConfigForm[blockName]["LIMIT_DATA"] == 10){
                                if(!winThereIsSubChild){
                                        window.winPagerDatatable[winActiveBlock.focusNow][0]-=1
                                }else{
                                    
                                    if (Object.keys(winSubChild).includes(winActiveBlock.focusNow) || winConfigForm[winActiveBlock.focusNow]["BLOCK_TYPE"][2] != undefined){
                                        if(winConfigForm[winActiveBlock.focusNow]["BLOCK_TYPE"][1] == "CHILD"){
                                            winSubChild[winActiveBlock.focusNow].forEach(function(blockSubChild){
                                                window.winPagerDatatable[blockSubChild][0]-=1
                                            })
                                            window.winPagerDatatable[winActiveBlock.focusNow][0]-=1
                                        }else if (winConfigForm[winActiveBlock.focusNow]["BLOCK_TYPE"][1] == "SUB_CHILD"){
                                            winSubChild[winConfigForm[winActiveBlock.focusNow]["BLOCK_TYPE"][2]].forEach(function(blockSubChild){
                                                window.winPagerDatatable[blockSubChild][0]-=1
                                            })
                                            window.winPagerDatatable[winConfigForm[winActiveBlock.focusNow]["BLOCK_TYPE"][2]][0]-=1
                                        }  
                                    }
                                    
                                }
                            }
                            $$(menuId).enable()//enable
                            $$(blockName).enable()
                            if(subChildId.length!=0){
                                subChildId.forEach(function(idChild){
                                    $$(idChild).hideProgress()
                                })
                            }
                            $$(blockName).hideProgress()
                        }
                        
                        if (isGridToGrid) {
                            if (statusMasterDetailGridToGrid.parent.includes(winActiveBlock['focusNow'])) {
                                statusMasterDetailGridToGrid.child.forEach(function (blockChild) {
                                        winDataDtSelect[blockChild] = []
                                })  
                                if ((statusMasterDetailGridToGrid.grandchild).length != 0) {
                                    statusMasterDetailGridToGrid.grandchild.forEach(function (blockGrandchild) {
                                        winDataDtSelect[blockGrandchild] = []
                                    })
                                }                                       
                            }else if(statusMasterDetailGridToGrid.child.includes(winActiveBlock['focusNow'])){
                                if ((statusMasterDetailGridToGrid.grandchild).length != 0) {
                                    statusMasterDetailGridToGrid.grandchild.forEach(function (blockGrandchild) {
                                        winDataDtSelect[blockGrandchild] = []
                                    })
                                }       
                            }  
                        }
                    }

                    if(winLayout_v2 == true){
                        reLayoutOden(blockName)
                    }
                }else{
                    if(!isWebixPopupOpen()){
                        if(getData==undefined){
                            errorThisFunc = {'statusCode':500,'statusText':"Internal Server Error",'msg':jsonData.msg}
                            webix.alert(ALERT.ALERTERROR(blockName+"<br>Error Code : 500 - "+jsonData.msg))
                        }else{
                            errorThisFunc = {'statusCode':500,'statusText':"Internal Server Error",'msg':getData}
                            webix.alert(ALERT.ALERTERROR(blockName+"<br>Error Code : "+getData))
                        }
                    }

                    let messageAlert1, messageAlert2
                    if($$("comboMultiLanguage")!=undefined && window["jsonMultiLanguage_"+menuId] && Object.keys(window["jsonMultiLanguage_"+menuId]).length){
                        let getLanguageCode = $$("comboMultiLanguage").getValue()
                        messageAlert1 = window["jsonMultiLanguage_"+menuId][getLanguageCode]["Internal Server Error"] || "Internal Server Error"
                        messageAlert2 = window["jsonMultiLanguage_"+menuId][getLanguageCode]["Error Detected, please capture this error and contact IT HO:"] || "Error Detected, please capture this error and contact IT HO:"
                    }else{
                        messageAlert1 = "Internal Server Error"
                        messageAlert2 = "Error Detected, please capture this error and contact IT HO:"
                    }
                    let textError = "Error Detected, please capture this error and contact IT HO: <br><br>Error: "+errorThisFunc.statusCode+" - ("+errorThisFunc.statusText+")<br><br> Python - "+errorThisFunc.msg
                    textError = textError.replace("Internal Server Error",messageAlert1)
                    textError = textError.replace("Error Detected, please capture this error and contact IT HO:",messageAlert2)

                    webix.message({
                        text:textError,
                        type:"error", 
                        expire: 10000,
                    });
                }
                // KETIKA LEVEL 1 & LEVEL 2
                let blockParent = getBlockParent()
                if(window.isGridToGrid && window.statusMasterDetailGridToGrid['grandchild'] != '' && window.winActiveBlock.focusNow == blockParent){
                    $$(window.statusMasterDetailGridToGrid['grandchild']).showOverlay("Please select master data first!")
                    $$(window.statusMasterDetailGridToGrid['grandchild']).disable()
                }
                winStartEditAfterLoadData = true    
                if(winConfigForm[blockName].EVENT_TRANSACTION != undefined){
                    if(winConfigForm[blockName].EVENT_TRANSACTION.postSelect != undefined){
                        resolve(winConfigForm[blockName]["EVENT_TRANSACTION"].postSelect(jsonData))
                    }
                }
                resolve()
            })
        })
        return promise
    }
    
    restApiData(param){
        let errorThisFunc = {'statusCode':undefined,'statusText':undefined,'msg':undefined}
            let dataParam = {}
            dataParam.type = "API"
            dataParam.menuId = menuId
            dataParam.data = param.DATA
            if(param.PARAM_ID!=undefined){
                param.PARAM_ID.forEach(function(keys){
                    dataParam.data[keys] = getItemValue(keys)
                    if (getItemValue(keys)==""){
                        dataParam.data[keys] = "%%"
                    }        
                });

            }
            dataParam.apiName = param.API_NAME
            let idField = param.DISPLAY_ID
            let rowId = param.ROW_ID
            let promise = new Promise((resolve,reject)=>{
                webix.ajax().headers({'Content-Type':'application/json'}).post("/",dataParam).then(function(respond){
                    let jsonData = respond.json()
                    let getData = jsonData.data;
                    let getStatus = jsonData.status;
                    
                    if(winConfigForm[param.BLOCK_ID]['BLOCK_TYPE'][0]=='FORM'){
                        if(getStatus == true && getData.length!=0){
                            if(window.winDatatable){
                                $$(window.winDatatable).clearAll();
                                $$(window.winDatatable).parse(getData);
                                $$(window.winDatatable).refresh();
                            }
                            
                            for (var x in getData[0]){
                                if (!getData[0][x] && getData[0][x]!="" && getData[0][x]!=null) continue;
                                if(getData[0][x]!="" && getData[0][x]!=null){
                                    if (window.winDateType.includes(idField[x])){
                                        getData[0][x] = getData[0][x].split(" ")[0]
                                        if(getData[0][x].length==$$(idField[x]).config.attributes.maxlength && getData[0][x].split("-").length<=3 && getData[0][x].split("-")[0].length==4){
                                            getData[0][x] = getData[0][x].split("-").reverse().join("-")
                                        }else if(getData[0][x].length==$$(idField[x]).config.attributes.maxlength && getData[0][x].split("-").length<=3 && getData[0][x].split("-")[0].length==2){
                                            getData[0][x] = getData[0][x].split("-").join("-");
                                        }
                                    }
                                    if (window.winDateTypeMMYY.includes(idField[x])){
                                        getData[0][x] = getData[0][x].split(" ")[0]
                                        if(getData[0][x].length==$$(idField[x]).config.attributes.maxlength && getData[0][x].split("-").length<=3 && getData[0][x].split("-")[0].length==4){
                                            getData[0][x] = getData[0][x].split("-").reverse().join("-");
                                        }else if(getData[0][x].length==$$(idField[x]).config.attributes.maxlength && getData[0][x].split("-").length<=3 && getData[0][x].split("-")[0].length==2){
                                            getData[0][x] = getData[0][x].split("-").join("-")
                                        }
                                        getData[0][x]= getData[0][x].slice(3,10)
                                    }
                                    if (window.winDateTypeYY.includes(idField[x])){
                                        getData[0][x] = getData[0][x].split(" ")[0]
                                        if(getData[0][x].length==$$(idField[x]).config.attributes.maxlength && getData[0][x].split("-").length<=3 && getData[0][x].split("-")[0].length==4){
                                            getData[0][x] = getData[0][x].split("-").reverse().join("-")
                                        }else if(getData[0][x].length==$$(idField[x]).config.attributes.maxlength && getData[0][x].split("-").length<=3 && getData[0][x].split("-")[0].length==2){
                                            getData[0][x] = getData[0][x].split("-").join("-");
                                        }
                                        getData[0][x]= getData[0][x].slice(6,10)
                                    }
                                }
                                $$(idField[x]).setValue(getData[0][x]);
                            } 
                            
                            // return {"status":true,"tipe":"","pesan":""}
                            resolve({"status":true,"tipe":"","pesan":""})
                        }else if(getStatus == true && getData.length==0){
                            if(typeof idField=="string"){
                                $$(idField).setValue("")
                            }else if(typeof idField=="object"){
                                idField.forEach(function(id){
                                    try {
                                        $$(id).setValue("")
                                    } catch (error) {
                                        console.warn(`===== Developer Warning ===== \n Validasi Tidak Berjalan dikarenakan ${id} tidak terdaftar pada Element di winConfigForm`)
                                    }
                                })
                            }
                            if(jsonData['msg']==undefined){
                                resolve({'status':false, 'tipe':'error', 'pesan':"No Data Found"})
                            }else{
                                resolve({'status':false, 'tipe':'error', 'pesan':"", 'msg':jsonData['msg']})
                            }
                        }else{
                            if(jsonData['msg']==undefined){
                                resolve({"status":false,"tipe":"error","pesan":"error database"})
                            }else{
                                resolve({'status':false, 'tipe':'error', 'pesan':'', 'msg':jsonData['msg']})
                            }
                        }
                    }else if(winConfigForm[param.BLOCK_ID]['BLOCK_TYPE'][0]=='DATAGRID'){
                        if(getStatus == true && getData.length!=0){
                            if(winThereIsSubChild){
                                for (var x in getData[0]){
                                    if(getData[0][x]!="" && getData[0][x]!=null){
                                        if (window.winDateType.includes(idField[x])){
                                            getData[0][x] = getData[0][x].split(" ")[0]
                                            if(getData[0][x].length==configColumn.maxLength && getData[0][x].split("-").length<=3 && getData[0][x].split("-")[0].length==4){
                                                getData[0][x] = getData[0][x].split("-").join("-")
                                            }else if(getData[0][x].length==configColumn.maxLength && getData[0][x].split("-").length<=3 && getData[0][x].split("-")[0].length==2){
                                                getData[0][x] = getData[0][x].split("-").reverse().join("-")
                                            }
                                        }
                                        if (window.winDateTypeMMYY.includes(idField[x])){
                                            getData[0][x] = getData[0][x].split(" ")[0]
                                            if(getData[0][x].length==configColumn.maxLength && getData[0][x].split("-").length<=3 && getData[0][x].split("-")[0].length==4){
                                                getData[0][x] = getData[0][x].split("-").join("-");
                                            }else if(getData[0][x].length==configColumn.maxLength && getData[0][x].split("-").length<=3 && getData[0][x].split("-")[0].length==2){
                                                getData[0][x] = getData[0][x].split("-").reverse().join("-")
                                            }
                                            getData[0][x]= getData[0][x].slice(3,10)
                                        }
                                        if (window.winDateTypeYY.includes(idField[x])){
                                            getData[0][x] = getData[0][x].split(" ")[0]
                                            if(getData[0][x].length==configColumn.maxLength && getData[0][x].split("-").length<=3 && getData[0][x].split("-")[0].length==4){
                                                getData[0][x] = getData[0][x].split("-").join("-")
                                            }else if(getData[0][x].length==configColumn.maxLength && getData[0][x].split("-").length<=3 && getData[0][x].split("-")[0].length==2){
                                                getData[0][x] = getData[0][x].split("-").reverse().join("-");
                                            }
                                            getData[0][x]= getData[0][x].slice(6,10)
                                        }
                                    }
                                }
                                setValueDt(idField,getData[0])
                            }else{
                                let record = $$(window.winActiveBlock['focusNow']).getItem(rowId.pos.row);
                                for (var x in getData[0]){
                                    let configColumn = $$(window.winActiveBlock['focusNow']).getColumnConfig(idField[x])
                                    console.log(1027,getData[0][x])
                                    if(getData[0][x]!="" && getData[0][x]!=null){
                                        if (window.winDateType.includes(idField[x])){
                                            console.log("MASUK!")
                                            getData[0][x] = getData[0][x].split(" ")[0]
                                            if(getData[0][x].length==configColumn.maxLength && getData[0][x].split("-").length<=3 && getData[0][x].split("-")[0].length==4){
                                                getData[0][x] = getData[0][x].split("-").join("-")
                                            }else if(getData[0][x].length==configColumn.maxLength && getData[0][x].split("-").length<=3 && getData[0][x].split("-")[0].length==2){
                                                getData[0][x] = getData[0][x].split("-").reverse().join("-")
                                            }
                                            console.log(1037,getData[0][x])
                                        }
                                        if (window.winDateTypeMMYY.includes(idField[x])){
                                            getData[0][x] = getData[0][x].split(" ")[0]
                                            if(getData[0][x].length==configColumn.maxLength && getData[0][x].split("-").length<=3 && getData[0][x].split("-")[0].length==4){
                                                getData[0][x] = getData[0][x].split("-").join("-");
                                            }else if(getData[0][x].length==configColumn.maxLength && getData[0][x].split("-").length<=3 && getData[0][x].split("-")[0].length==2){
                                                getData[0][x] = getData[0][x].split("-").reverse().join("-")
                                            }
                                            getData[0][x]= getData[0][x].slice(3,10)
                                        }
                                        if (window.winDateTypeYY.includes(idField[x])){
                                            getData[0][x] = getData[0][x].split(" ")[0]
                                            if(getData[0][x].length==configColumn.maxLength && getData[0][x].split("-").length<=3 && getData[0][x].split("-")[0].length==4){
                                                getData[0][x] = getData[0][x].split("-").join("-")
                                            }else if(getData[0][x].length==configColumn.maxLength && getData[0][x].split("-").length<=3 && getData[0][x].split("-")[0].length==2){
                                                getData[0][x] = getData[0][x].split("-").reverse().join("-");
                                            }
                                            getData[0][x]= getData[0][x].slice(6,10)
                                        }
                                    }
                                    if(record[idField[x]]==undefined){
                                        record[idField[x]] = getData[0][x];
                                    }else{
                                        record[idField[x]] = getData[0][x];
                                    }
                                    $$(window.winActiveBlock['focusNow']).refresh(window.winValidateItemPos.pos.row);
                                }
                                $$(menuId).enable()//enable
                            }
                            resolve({"status":true})
                        }else if(getStatus == true && getData.length==0){
                            let record = $$(window.winActiveBlock['focusNow']).getItem(window.winValidateItemPos.pos.row);
                            if(typeof idField=="string"){
                                record[idField] = ''
                                $$(window.winActiveBlock['focusNow']).refresh(window.winValidateItemPos.pos.row);
                            }else if(typeof idField=="object"){
                                idField.forEach(function(id){
                                    record[id] = ''
                                })
                                $$(window.winActiveBlock['focusNow']).refresh(window.winValidateItemPos.pos.row); 
                            }
                            
                            $$(window.winActiveBlock['focusNow']).refresh(window.winValidateItemPos.pos.row);
                            if(jsonData['msg']==undefined){
                                resolve({"status":false,"tipe":"error","pesan":"No Data Found"})
                            }else{
                                resolve({'status':false, 'tipe':'error', 'pesan':'','msg':jsonData['msg']})
                            }
                        }else{
                            let record = $$(window.winActiveBlock['focusNow']).getItem(window.winValidateItemPos.pos.row);
                            if(typeof idField=="string"){
                                record[idField] = ''
                                $$(window.winActiveBlock['focusNow']).refresh(window.winValidateItemPos.pos.row);
                            }else if(typeof idField=="object"){
                                idField.forEach(function(id){
                                    record[id] = ''
                                })
                                $$(window.winActiveBlock['focusNow']).refresh(window.winValidateItemPos.pos.row); 
                            }
                            $$(window.winActiveBlock['focusNow']).refresh(window.winValidateItemPos.pos.row);
                            if(jsonData['msg']==undefined){
                                resolve({"status":false,"tipe":"error","pesan":"error database"})
                            }else{
                                resolve({'status':false, 'tipe':'error', 'pesan':'','msg':jsonData['msg']})
                            }
                        }
                    }
                })
            })
            return promise
    }


    restApiSelect(param){
        let errorThisFunc = {'statusCode':undefined,'statusText':undefined,'msg':undefined}
        try{
            loadingShow()
            let blocksName = Object.keys(winConfigForm)
            let blockName = ''
            blocksName.forEach(function(name){
                if(winConfigForm[name]["BLOCK_TYPE"][1]=="PARENT"){
                    blockName = name
                }
            })
            if(param==undefined){
                param = {'data':{},'offsetNumber':0}
            }
            let blockType = "";
            let dataParam = {}
            let requestValue = {}
            let offsetNumber = 0
            dataParam.type = "SELECT"
            dataParam.menuId = menuId
            requestValue.data = param.data
            if(winConfigForm[blockName]["BLOCK_TYPE"][0]=="FORM"){
                if(param.offsetNumber!=undefined){
                    offsetNumber = param.offsetNumber
                }
                requestValue.blockName = blockName
                requestValue.blockType = "form";
                requestValue.data['offsetNumber'] = offsetNumber;
                blockType = "form";
                
            }else if(winConfigForm[blockName]["BLOCK_TYPE"][0]=="DATAGRID"){
                requestValue.blockName = blockName
                requestValue.blockType = "datagrid";
                blockType = "datagrid";
                if(param.offsetNumber!=undefined){
                    offsetNumber = param.offsetNumber
                    requestValue.data['offsetNumber'] = offsetNumber;
                }else{
                    requestValue.data['offsetNumber'] = offsetNumber
                }
                $$(blockName).hideColumn("action_"+blockName)
            }
            dataParam.data = requestValue
            window.winDataMaster = ''
            winStartEditAfterLoadData = false
            
            setMultiLanguage().then(()=>{
                let promiseApiCombo = []
                winApiCombos.forEach(function (api) {
                    promiseApiCombo.push(api())
                })
                winApiCombos = []
                let promiseAll = Promise.all(promiseApiCombo)
                promiseAll.then(()=>{
                    let restLoadApi = webix.ajax().headers({'Content-Type':'application/json'}).post("/",dataParam);
                    restLoadApi.then(function(respond){
                        winApiCombos.forEach(function (api) {
                            api()
                        })
                        winValidatePromise = {}
                        winApiCombos = []
                        winValidateItemPos = {}
                        winJenisAddValue = ""
                        
                        let blocks = Object.keys(winConfigForm)
                        let getData = respond.json().data;
                        let getStatus = respond.json().status;
                        Object.keys(winCountDataDt).forEach(function(blockCount){
                            winCountDataDt[blockCount] = false
                        })
                        checkGridtoGrid()
                        if(getStatus == true){
                            window.winResetData = false;
                            if(getData.length==0){
                                $$(menuId).hideProgress();//loading
                                $$(menuId).enable()//enable
                                window.winButtonCallForm.forEach(function(item){
                                    if($$(item)!=undefined){
                                        $$(item).define('disabled',true)
                                    }
                                })
                                if(blockType=="form"){
                                    winDataCompare[blockName]['data'] = {}
                                    if(!window.winSearchMode){
                                        winConfigForm[blockName]['ELEMENT'].forEach(function(id){
                                            if($$(id)!=undefined){
                                                $$(id).disable()
                                            }
                                        })
                                    }
                                    let messageAlert
                                    if($$("comboMultiLanguage")!=undefined && window["jsonMultiLanguage_"+menuId] && Object.keys(window["jsonMultiLanguage_"+menuId]).length){
                                        let getLanguageCode = $$("comboMultiLanguage").getValue()
                                        messageAlert = window["jsonMultiLanguage_"+menuId][getLanguageCode]["Tidak Ada Data/n+winFormTitle+ (form)"] || "Tidak Ada Data/n+winFormTitle+ (form)"
                                    }else{
                                        messageAlert = "No data found/n+winFormTitle+ (form)"
                                    }
                                    messageAlert = messageAlert.replace("/n","<br>")
                                    messageAlert = messageAlert.replace("+winFormTitle+",winFormTitle)
                                    webix.message({
                                        text:messageAlert,
                                        type:"debug", 
                                        expire: 10000,
                                    }); 
                                    winDisabledButton.forEach(function(idBtn){
                                        $$(idBtn).define('disabled',true)
                                    })
                                    $$("next").define('disabled',true)
                                    $$(winConfigForm[blocks[0]]["ELEMENT"][0]).focus()
                                    window.winActiveBlock.focusNow = Object.keys(winConfigForm)[0]
                                    Object.keys(winConfigForm).forEach(function(id){
                                        if($$(id).config.view=="form"){
                                            $$(id).clear()
                                        }else if ($$(id).config.view=="datatable"){
                                            $$(id).clearAll();
                                            $$(id).disable();
                                            $$(id).refresh();
                                        }
                                    })
                                    $$(blockName).clear()
                                }else if(blockType=="datagrid"){
                                    $$(blockName).clearAll();
                                    $$(blockName).refresh();
                                    let messageAlert
                                    if($$("comboMultiLanguage")!=undefined && window["jsonMultiLanguage_"+menuId] && Object.keys(window["jsonMultiLanguage_"+menuId]).length){
                                        let getLanguageCode = $$("comboMultiLanguage").getValue()
                                        messageAlert = window["jsonMultiLanguage_"+menuId][getLanguageCode]["Tidak Ada Data/n+winFormTitle+ (datagrid)"] || "Tidak Ada Data/n+winFormTitle+ (datagrid)"
                                    }else{
                                        messageAlert = "Tidak Ada Data/n+winFormTitle+ (datagrid)"
                                    }
                                    messageAlert = messageAlert.replace("/n","<br>")
                                    messageAlert = messageAlert.replace("+winFormTitle+",winFormTitle)
                                    webix.message({
                                        text:messageAlert,
                                        type:"debug", 
                                        expire: 10000,
                                    }); 
                                    winActiveOverlay[blockName] = "Sorry, there is no data"
                                    let messageOverlay
                                    if($$("comboMultiLanguage")!=undefined && window["jsonMultiLanguage_"+menuId] && Object.keys(window["jsonMultiLanguage_"+menuId]).length){
                                        let getLanguageCode = $$("comboMultiLanguage").getValue()
                                        messageOverlay = window["jsonMultiLanguage_"+menuId][getLanguageCode]["Sorry, there is no data"] || "Sorry, there is no data"
                                    }else{
                                        messageOverlay = "Sorry, there is no data"
                                    }
                                    $$(blockName).showOverlay(messageOverlay);  
                                    if($$(blockName).config.customOperator!=undefined){
                                        let additionalCustomOperator = webix.copy($$(blockName).config.customOperator)
                                        additionalCustomOperator["RESET_DATA"] = true
                                        //updateOperatorCustomDt(additionalCustomOperator);
                                        updateFooterDatagrid(blockName)
                                    }
                                    
                                }
                                if(winLayout_v2 == true){
                                    reLayoutOden(blockName)
                                }
                            }else{
                                window.winSearchRecord = false;
                                $$("searchValue").config.value="Search Mode"
                                $$("searchValue").refresh()
                                $$("searchValue").$view.classList.remove("webix_custom_button")
                                $$("searchValue").refresh()
                                $$("addValue").$view.classList.remove("webix_custom_button")
                                $$("addValue").refresh()
                                $$("prev").define("disabled",false);   //prev
                                $$("next").define("disabled",false);   //next
                                window.winAddData=false;
                                winFlagInsertBlock = ""
                                winFlagInsertChild = []
                                $$("addValue").define('disabled',false)
                                $$("updateValue").define('disabled',false)
                                $$("deleteValue").define('disabled',false)
                                window.winSearchMode = false;
                                window.winCheckRadio.forEach(function(item){
                                    if(!winDisplayItem.includes(item)){
                                        if($$(item)!=undefined){
                                            $$(item).enable()
                                        }
                                    }
                                })
                                window.winButtonCallForm.forEach(function(item){
                                    if($$(item)!=undefined){
                                        $$(item).define('disabled',false)
                                    }
                                })
                                Object.keys(winDataCompare).forEach(function(idBlock){
                                    winDataCompare[idBlock]['data'] = {}
                                })
                                
                                if (blockType=="form"){
                                    winConfigForm[blockName]['ELEMENT'].forEach(function(id){
                                        if(!winDisplayItem.includes(id)){
                                            if($$(id)!=undefined){
                                                $$(id).enable()
                                            }
                                        }
                                    })
                                    window.winDataCompare[blockName] = {"data":{}}
                                    Object.keys(getData[0]).forEach(function(key){
                                        if (window.winDateType.includes(key)){
                                            if(getData[0][key]!=null && getData[0][key]!=''){
                                                // let date = getData[0][key].split("-").reverse().join("-")
                                                // getData[0][key]=date
                                                let value = getData[0][key].split(" ")[0]
                                                if(value.length != 10){
                                                    value = value.split("-").reverse().join("-");
                                                    value = value.substring(value.length-10)
                                                }
                                                if(value.length==10 && value.split("-").length>1 && value.split("-")[0].length==4){
                                                    value = value.split("-").reverse().join("-");
                                                }
                                                let hasil = cekDate(value, "DD-MM-YYYY");
                                                getData[0][key] = hasil
                                            }
                                        }
                                        if (window.winDateTypeMMYY.includes(key)){
                                            if(getData[0][key]!=null && getData[0][key]!=''){
                                                // let dateMMYY = getData[0][key].split("-").reverse().join("-")
                                                // getData[0][key]=dateMMYY.slice(3,10)
                                                let value = getData[0][key].split(" ")[0]
                                                if(value.length != 7){
                                                    value = value.split("-").reverse().join("-");
                                                    value = value.substring(value.length-7)
                                                }
                                                if(value.length==7 && value.split("-").length>1 && value.split("-")[0].length==4){
                                                    value = value.split("-").reverse().join("-");
                                                }
                                                let hasil = cekDate(value, "MM-YYYY");
                                                getData[0][key] = hasil
                                            }
                                        }
                                        if (window.winDateTypeYY.includes(key)){
                                            if(getData[0][key]!=null && getData[0][key]!=''){
                                                if(getData[0][key].length!=4){
                                                    let value = getData[0][key].split(" ")[0]
                                                    let dateYY = value.split("-").reverse().join("-")
                                                    getData[0][key]=dateYY.slice(6,10)
                                                }
                                            }
                                        }
                                        if (window.winClockType.includes(key)){
                                            if(getData[0][key]!=null && getData[0][key]!=''){
                                                let time = getData[0][key].split(" ")[1]
                                                let addSecond = $$(key).config.addSecond
                                                if(!addSecond){
                                                    getData[0][key] = time.slice(0,5)
                                                }else{
                                                    getData[0][key] = time
                                                }
                                            }
                                        }
                                        if (window.winTimestampType.includes(key)){
                                            if(getData[0][key]!=null && getData[0][key]!=''){
                                                let value = getData[0][key].split(" ")[0]
                                                let time = getData[0][key].split(" ")[1]
                                                let hideMinute = $$(key).config.hideMinute
                                                let hideSecond = $$(key).config.hideSecond
                                                if(value.length != 10){
                                                    value = value.split("-").reverse().join("-");
                                                    value = value.substring(value.length-10)
                                                }
                                                if(value.length==10 && value.split("-").length>1 && value.split("-")[0].length==4){
                                                    value = value.split("-").reverse().join("-");
                                                }
                                                if(hideSecond){
                                                    time = time.slice(0,5)
                                                }
                                                if(hideMinute){
                                                    time = time.slice(0,3)
                                                }
                                                
                                                let hasil = cekDate(value, "DD-MM-YYYY");
                                                getData[0][key] = hasil + ' ' + time
                                            }
                                        }
                                        if (window.winCurrency.includes(key)){
                                            let currency = getData[0][key]
                                            getData[0][key] = Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(currency)
                                        }
                                        if(getData[0][key]==null){
                                            getData[0][key] = ''
                                        }
                                        if(getData[0][key]==undefined){
                                            window.winDataCompare[blockName]["data"][key] = ""
                                        }else{
                                            window.winDataCompare[blockName]["data"][key] = getData[0][key]
                                        }
                                        if(winCheckRadio.includes(key)){
                                            if(getData[0][key]=='' || getData[0][key]=='null'){
                                                $$(key).config.nullValue = true
                                            }else{
                                                $$(key).config.nullValue = false
                                            }
                                        }
                                    })
                                    window.winDataCompare[blockName]["data"] = getData[0]
                                    if(Object.keys(winDataCompare[blockName]["data"]).length!=0){
                                        Object.keys(winConfigForm).forEach(function(block){
                                            if(winConfigForm[block]["BLOCK_TYPE"][1]=="SUB_PARENT"){
                                                winConfigForm[block]["ELEMENT"].forEach(function(idElementBlock){
                                                    if(Object.keys(winDataCompare[blockName]["data"]).includes(idElementBlock)){
                                                        window.winDataCompare[block]["data"][idElementBlock] = winDataCompare[blockName]["data"][idElementBlock]
                                                    }
                                                })
                                            }
                                        })
                                    }
                                    Object.keys(winDataCompare[blockName]["data"]).forEach(function(id){
                                        if(winDataCompare[blockName]["data"][id]==undefined){
                                            winDataCompare[blockName]["data"][id] = ""
                                        }
                                    })
                                    $$(blockName).clear()
                                    $$(blockName).parse(getData[0])
                                    winUploaderFile.forEach(function(idUploader){
                                        if($$(idUploader)!=undefined){
                                            if(winConfigForm[blockName]['ELEMENT'].includes($$(idUploader).config.colsFile.newFileName)){
                                                let dataFile = []
                                                let fileNameDb = getItemValue($$(idUploader).config.colsFile.newFileName)
                                                let oldFileNameDb = getItemValue($$(idUploader).config.colsFile.oldFileName)
                                                if(fileNameDb!=""){
                                                    let fileNameSplited = fileNameDb.split("|")
                                                    let oldFileNameSplited = oldFileNameDb.split("|")
                                                    oldFileNameSplited.forEach(function(nameFile,idx){
                                                        dataFile.push({ name:nameFile, sizetext:"",status:"server", sequenceName:fileNameSplited[idx]})
                                                    })
                                                }
                                                $$(idUploader).files.parse(dataFile)
                                            }
                                        }
                                    })
        
                                    window.winDataMaster = getBlockValue(blockName)
                                    afterInsertHead = false
                                    winConfigForm[blockName]["PRIMARY_KEY"].forEach(function (item) {
                                        $$(item).define("readonly",true) 
                                        $$(item).refresh()
                                    });
                                    winIsPrimary.forEach(function (item) {
                                        if($$(getBlockItem(item)).config.view=="form"){
                                            $$(item).define("readonly",true)
                                            $$(item).refresh()
                                        }
                                    });
        
                                }else if(blockType=="datagrid"){
                                    getData.forEach(function(record){
                                        Object.keys(record).forEach(function(key){
                                            if (window.winDateType.includes(key)){
                                                if(record[key]!=null && record[key]!=''){
                                                    let value = record[key].split(" ")[0]
                                                    if(value.length != 10){
                                                        value = value.split("-").reverse().join("-");
                                                        value = value.substring(value.length-10)
                                                    }
                                                    if(value.length==10 && value.split("-").length>1 && value.split("-")[0].length==4){
                                                        value = value.split("-").reverse().join("-");
                                                    }
                                                    let hasil = cekDate(value, "DD-MM-YYYY");
                                                    record[key] = hasil
                                                }
                                            }
                                            if (window.winDateTypeMMYY.includes(key)){
                                                if(record[key]!=null && record[key]!=''){
                                                    let value = record[key].split(" ")[0]
                                                    if(value.length != 7){
                                                        value = value.split("-").reverse().join("-");
                                                        value = value.substring(value.length-7)
                                                    }
                                                    if(value.length==7 && value.split("-").length>1 && value.split("-")[0].length==4){
                                                        value = value.split("-").reverse().join("-");
                                                    }
                                                    let hasil = cekDate(value, "MM-YYYY");
                                                    record[key] = hasil
                                                }
                                            }
                                            if (window.winDateTypeYY.includes(key)){
                                                if(record[key]!=null && record[key]!=''){
                                                    let value = record[key].split(" ")[0]
                                                    let dateYY = value.split("-").reverse().join("-")
                                                    record[key]=dateYY.slice(6,10)
                                                }
                                            }
                                            if (window.winClockType.includes(key)){
                                                if(record[key]!=null && record[key]!=''){
                                                    let time = record[key].split(" ")[1]
                                                    let addSecond = $$(blockName).getColumnConfig(key).addSecond
                                                    if(!addSecond){
                                                        record[key] = time.slice(0,5)
                                                    }else{
                                                        record[key] = time
                                                    }
                                                }
                                            }
                                            if (window.winTimestampType.includes(key)){
                                                if(record[key]!=null && record[key]!=''){
                                                    let value = record[key].split(" ")[0]
                                                    let time = record[key].split(" ")[1]
                                                    if(value.length != 10){
                                                        value = value.split("-").reverse().join("-");
                                                        value = value.substring(value.length-10)
                                                    }
                                                    if(value.length==10 && value.split("-").length>1 && value.split("-")[0].length==4){
                                                        value = value.split("-").reverse().join("-");
                                                    }
                                                    let hasil = cekDate(value, "DD-MM-YYYY");
                                                    record[key] = hasil + ' ' + time
                                                }
                                            }
                                            if(record[key]==null){
                                                record[key] = ''
                                            }
                                        })
                                    })
                                    $$(blockName).unselectAll();
                                    hideOverlay(blockName)
                                    $$(blockName).clearAll();
                                    $$(blockName).parse(getData);
                                    $$(blockName).refresh();
                                    winCountOffsetRecord[blockName]+=getData.length
                                    winDataDtSelect[blockName] = webix.copy(getData)
                                    $$(blockName).enable()
                                    winDataChanged[blockName] = []    
                                    window.winPagerDatatable[blockName][0] = 0
                                    $$(blockName).config.dynamicLoadData = 0 
                                    if(window.isGridToGrid){
                                        $$(blockName).select($$(blockName).getIdByIndex(0), winConfigForm[blockName].PRIMARY_KEY[0])
                                        winConfigForm[blockName]["WIN_ACTIVE_CELL_BLOCK"] = {'pos': $$(blockName).getSelectedId(), 'view': $$(blockName)}
                                        
                                    }

                                    updateFooterDatagrid(blockName)
                                    if(winLayout_v2 == true){
                                        reLayoutOden(blockName)
                                    }
                                }
                                Object.keys(winConfigForm).forEach(function(blockId){
                                    $$(blockId).enable()
                                    if(winConfigForm[blockId]["BLOCK_TYPE"][1] != "PARENT" && winConfigForm[blockId]["BLOCK_TYPE"][0] == "DATAGRID"){
                                        hideOverlay(blockId)
                                        $$(blockId).clearAll()
                                    }
                                    $$(blockId).clearValidation()
                                })
                                if(winMultiviewBlocksVertical.length>0){
                                    winMultiviewBlocksVertical.forEach(function(idBlock){
                                        if(winConfigForm[idBlock]['BLOCK_TYPE'][1]=='SUB_PARENT'){
                                            $$(idBlock).parse(winDataCompare[idBlock]['data'])
                                            let heightMultiview = $$(idBlock).$height
                                            if(heightMultiview>winHeightMultiview[idBlock]){
                                                winHeightMultiview[idBlock] = heightMultiview
                                            }
                                        }
                                    })
                                    let getSelectedMultiviewVertical = $$("listMultiviewVertical"+menuId).getSelectedId()
                                    if($$(getSelectedMultiviewVertical).$height+20<460){
                                        // $$("multiviewParentId_"+menuId).define("height", 460+20);
                                        $$("multiview"+menuId).define("height", 480)
                                        $$("multiview"+menuId).resize()
                                        $$("multiview"+menuId).adjust()
                                    }else{
                                        $$("multiview"+menuId).define("height", $$(getSelectedMultiviewVertical).$height)
                                        $$("multiview"+menuId).resize()
                                        $$("multiview"+menuId).adjust()
                                    }
                                    
                                    // $$("multiviewParentId_"+menuId).resize();
                                }else if(winMultiviewBlocks.length>0){
                                    winMultiviewBlocks.forEach(function(idBlock){
                                        if(winConfigForm[idBlock]['BLOCK_TYPE'][1]=='SUB_PARENT'){
                                            $$(idBlock).parse(winDataCompare[idBlock]['data'])
                                        }
                                    })
                                }
                                blocks.forEach(function(blockId){
                                    if(blockId != blockName){
                                        if(winConfigForm[blockId].hasOwnProperty("REST_API")){
                                            if(winConfigForm[blockId]["REST_API"].hasOwnProperty("OFFSET_NUMBER")){
                                                winConfigForm[blockId]["REST_API"]["OFFSET_NUMBER"] = 0
                                            }
                                            if($$(blockId).config.view == "datatable"){
                                                $$(blockId).config.dynamicLoadData = 0 
                                            }
                                        }
                                    }
                                })
    
                                if(winLayout_v2 == true){
                                    reLayoutOden(blockName)
                                }
    
                                window.winRestApi()
                                if(Object.keys(winFooterCustomFunction).length!=0){
                                    Object.keys(winFooterCustomFunction).forEach(function(idCols){
                                        winFooterCustomFunction[idCols]()
                                    })
                                }
                                winOpenValidation = true
                                $$(window.winListIdBtn[4]).define("disabled",false); //update
                                searchCount=0
                                $$(menuId).enable()//enable
                                $$(menuId).hideProgress();//loading
                            }
                            if(winConfigForm[blockName]["BLOCK_TYPE"][0]=="FORM"){
                                let elementsBlock = Object.keys($$(blockName).elements)
                                elementsBlock.every(function(id){
                                    if($$(id).config.disabled!=true){
                                        webix.UIManager.setFocus($$(id))
                                        return false
                                    }
                                    return true
                                })
                                
                            }else if(winConfigForm[blockName]["BLOCK_TYPE"][0]=="DATAGRID"){
                                webix.UIManager.setFocus($$(blockName))
                            }
                            winStartEditAfterLoadData = true
                            blocksName.every(function(block){
                                if(winConfigForm[block]['BASE_TABLE']){
                                    window.winActiveBlock.focusNow = block
                                    return false
                                }
                                return true
                            })
                        }else{
                            $$(menuId).disable()//enable
                            $$(menuId).hideProgress();//loading
                            if($$(blockName).config.view=="form"){
                                $$(blockName).clear()
                            }else{
                                $$(blockName).clearAll()
                            }
                            
                            if(!isWebixPopupOpen()){
                                if(getData==undefined){
                                    errorThisFunc = {'statusCode':500,'statusText':"Internal Server Error",'msg':respond.json().msg}
                                    webix.alert(ALERT.ALERTERROR(blockName+"<br>Error Code : 500 - "+respond.json().msg))
                                }else{
                                    if(getData.code == 200){
                                        webix.alert(ALERT.ALERTERROR(blockName+"<br> "+getData.msg))
                                        $$(menuId).enable()//enable
                                        $$(menuId).hideProgress();//loading
                                    }else{
                                        errorThisFunc = {'statusCode':500,'statusText':"Internal Server Error",'msg':getData}
                                        webix.alert(ALERT.ALERTERROR(blockName+"<br>Error Code : "+getData))
                                    }
                                }
                            }
                            let messageAlert1, messageAlert2
                            if($$("comboMultiLanguage")!=undefined && window["jsonMultiLanguage_"+menuId] && Object.keys(window["jsonMultiLanguage_"+menuId]).length){
                                let getLanguageCode = $$("comboMultiLanguage").getValue()
                                messageAlert1 = window["jsonMultiLanguage_"+menuId][getLanguageCode]["Internal Server Error"] || "Internal Server Error"
                                messageAlert2 = window["jsonMultiLanguage_"+menuId][getLanguageCode]["Error Detected, please capture this error and contact IT HO:"] || "Error Detected, please capture this error and contact IT HO:"
                            }else{
                                messageAlert1 = "Internal Server Error"
                                messageAlert2 = "Error Detected, please capture this error and contact IT HO:"
                            }
    
                            let textError
                            textError = "Error Detected, please capture this error and contact IT HO: <br><br>Error: "+errorThisFunc.statusCode+" - ("+errorThisFunc.statusText+")<br><br> Python - "+errorThisFunc.msg
                            textError = textError.replace("Internal Server Error",messageAlert1)
                            textError = textError.replace("Error Detected, please capture this error and contact IT HO:",messageAlert2)
                            webix.message({
                                text:textError,
                                type:"error", 
                                expire: 10000,
                            });
                            
                        }
                        if(winConfigForm[blockName].EVENT_TRANSACTION != undefined){
                            if(winConfigForm[blockName].EVENT_TRANSACTION.postSelect != undefined){
                                return winConfigForm[blockName]["EVENT_TRANSACTION"].postSelect(getData)
                            }
                        }
                        if(winLayout_v2 == true){
                            reLayoutOden(blockName)
                        }
                    }).fail(function(respondFail){
                        let messageAlert1, messageAlert2
                        if($$("comboMultiLanguage")!=undefined && window["jsonMultiLanguage_"+menuId] && Object.keys(window["jsonMultiLanguage_"+menuId]).length){
                            let getLanguageCode = $$("comboMultiLanguage").getValue()
                            messageAlert1 = window["jsonMultiLanguage_"+menuId][getLanguageCode]["Internal Server Error"] || "Internal Server Error"
                            messageAlert2 = window["jsonMultiLanguage_"+menuId][getLanguageCode]["Error Detected, please capture this error and contact IT HO:"] || "Error Detected, please capture this error and contact IT HO:"
                        }else{
                            messageAlert1 = "Internal Server Error"
                            messageAlert2 = "Error Detected, please capture this error and contact IT HO:"
                        }
    
                        let textError
                        errorThisFunc = {'statusCode':undefined,'statusText':undefined,'msg':"RestApiSelect JS - Error Ajax Data Select"}
                        if(respondFail.status){
                            errorThisFunc = {'statusCode':respondFail.status,'statusText':respondFail.statusText,'msg':"RestApiSelect JS - Error Ajax Data Select"}
                            textError = "Error Detected, please capture this error and contact IT HO: <br><br>Error: "+errorThisFunc.statusCode+" - ("+errorThisFunc.statusText+")<br><br> AJAX"
                            textError = textError.replace("Error Detected, please capture this error and contact IT HO:",messageAlert2)
                        }else{
                            let stringError = String(respondFail.stack).split("at ")[1]
                            stringError = stringError.split("/")
                            let errorFile = stringError[stringError.length-1].split(":")[0]
                            let errorLine = stringError[stringError.length-1].split(":")[1]
                            errorThisFunc = {'statusCode':undefined,'statusText':undefined,'msg':"RestApiSelect JS - Error Ajax Data Select"}
                            textError = "Error Detected, please capture this error and contact IT HO: <br><br>Error: "+respondFail.message+"<br>Position Error : "+errorFile+" line "+errorLine
                            textError = textError.replace("Error Detected, please capture this error and contact IT HO:",messageAlert2)
                        }
                        $$(menuId).hideProgress();//loading
                        $$(menuId).disable()//enable
                        webix.message({
                            text:textError,
                            type:"error", 
                            expire: 10000,
                        });
                    })
                    if(winActiveBlock.lastFocus!='' && winActiveBlock.focusNow!=''){
                        webix.html.removeCss($$(window.winActiveBlock["lastFocus"]).getNode(), "datablock-focus")
                        webix.html.removeCss($$(window.winActiveBlock["focusNow"]).getNode(), "datablock-focus")
                    }else if(winActiveBlock.lastFocus=='' && winActiveBlock.focusNow!=''){
                        webix.html.removeCss($$(window.winActiveBlock["focusNow"]).getNode(), "datablock-focus")
                    }
                    webix.UIManager.setFocus($$(blocksName[0]))
                    window.winActiveBlock.focusNow = blocksName[0]
                    webix.html.addCss($$(window.winActiveBlock["focusNow"]).getNode(), "datablock-focus")
                })
            })


        }catch(err){
            let messageAlert1, messageAlert2
            if($$("comboMultiLanguage")!=undefined && window["jsonMultiLanguage_"+menuId] && Object.keys(window["jsonMultiLanguage_"+menuId]).length){
                let getLanguageCode = $$("comboMultiLanguage").getValue()
                messageAlert1 = window["jsonMultiLanguage_"+menuId][getLanguageCode]["Internal Server Error"] || "Internal Server Error"
                messageAlert2 = window["jsonMultiLanguage_"+menuId][getLanguageCode]["Error Detected, please capture this error and contact IT HO:"] || "Error Detected, please capture this error and contact IT HO:"
            }else{
                messageAlert1 = "Internal Server Error"
                messageAlert2 = "Error Detected, please capture this error and contact IT HO:"
            }

            let textError
            errorThisFunc = {'statusCode':undefined,'statusText':undefined,'msg':"RestApiSelect JS - Error Ajax Data Select"}
            if(err.status){
                errorThisFunc = {'statusCode':err.status,'statusText':err.statusText,'msg':"RestApiSelect JS - Error Ajax Data Select"}
                textError = "Error Detected, please capture this error and contact IT HO: <br><br>Error: "+errorThisFunc.statusCode+" - ("+errorThisFunc.statusText+")<br><br> AJAX"
                textError = textError.replace("Error Detected, please capture this error and contact IT HO:",messageAlert2)
            }else{
                let stringError = String(err.stack).split("at ")[1]
                stringError = stringError.split("/")
                let errorFile = stringError[stringError.length-1].split(":")[0]
                let errorLine = stringError[stringError.length-1].split(":")[1]
                errorThisFunc = {'statusCode':undefined,'statusText':undefined,'msg':"RestApiSelect JS - Error Ajax Data Select"}
                textError = "Error Detected, please capture this error and contact IT HO: <br><br>Error: "+err.message+"<br>Position Error : "+errorFile+" line "+errorLine
                textError = textError.replace("Error Detected, please capture this error and contact IT HO:",messageAlert2)
            }
            $$(menuId).hideProgress();//loading
            $$(menuId).disable()//enable
            webix.message({
                text:textError,
                type:"error", 
                expire: 10000,
            });
        }
        
    }

    restApiNewForm(blockName){
        // try{
        //     throw Error()
        // }catch(e){
        //     console.error(e)
        // }
        let errorThisFunc = {'statusCode':undefined,'statusText':undefined,'msg':undefined}
        // try{
            let dataParam = {}
            dataParam.type = "API"
            dataParam.menuId = menuId
            dataParam.data = {}
            if(winConfigForm[blockName]["BLOCK_TYPE"][1]=="CHILD"){
                let blocks = Object.keys(winConfigForm)
                blocks.forEach(function(id){
                    if(winConfigForm[id]["BLOCK_TYPE"][1]=="PARENT"){
                        if (isGridToGrid) {
                            dataParam.data = $$(id).getSelectedItem()
                        }else{
                            dataParam.data = getBlockValue(id)
                        }
                    }
                })
            }
            dataParam.apiName = "newInstance_"+menuId+"_"+blockName
            let promise = new Promise((resolve)=>{
                webix.ajax().headers({'Content-Type':'application/json'}).post("/",dataParam).then(function(respond){
                    let jsonData = respond.json()
                    let getMsg = jsonData.msg;
                    let getStatus = jsonData.status;
                    let getData = jsonData.data;
                    if(getStatus == true){
                        if(winThereIsSubChild){
                            let ChildParent
                            Object.keys(winConfigForm).every(function(blockId){
                                if(winConfigForm[blockId]['BLOCK_TYPE'][1]=="SUB_CHILD"){
                                    if(winConfigForm[blockId]['BLOCK_TYPE'][2]==blockId){
                                        ChildParent = blockId
                                        return false
                                    }else{
                                        ChildParent = winConfigForm[blockId]['BLOCK_TYPE'][2]
                                        return false
                                    }
                                }
                                return true
                            })
                            Object.keys(winConfigForm).forEach(function(blockId){
                                if(winConfigForm[blockId]['BLOCK_TYPE'][1]=="SUB_CHILD"){
                                    if(winConfigForm[blockId]['BLOCK_TYPE'][2]==ChildParent){
                                        let newDictData = {}
                                        Object.keys(getData).forEach(function(id){
                                            if(winConfigForm[blockId]['ELEMENT'].includes(id)){
                                                newDictData[id] = getData[id]
                                            }
                                        })
                                        winConfigForm[blockId]['WHEN_NEW_FORM'] = Object.assign({},winConfigForm[blockId]['WHEN_NEW_FORM'],newDictData)
                                    }
                                }
                            })
        
                            let newDictData = {}
                            Object.keys(getData).forEach(function(id){
                                if(winConfigForm[ChildParent]['ELEMENT'].includes(id)){
                                    newDictData[id] = getData[id]
                                }
                            })
                            winConfigForm[ChildParent]['WHEN_NEW_FORM'] = Object.assign({},winConfigForm[ChildParent]['WHEN_NEW_FORM'],newDictData)
                        }else{
                            winConfigForm[blockName]['WHEN_NEW_FORM'] = Object.assign({},winConfigForm[blockName]['WHEN_NEW_FORM'],getData)
                        }                    
                    }else{
                        if(!isWebixPopupOpen()){

                            webix.alert(ALERT.ALERTERROR(getMsg)).then(function(){
                                location.reload();
                            });
                        }
                    }
                    resolve()
                })
            })
            return promise
            
    }

    restApiSubmit(param,type){
        
        
        let errorThisFunc = {'statusCode':undefined,'statusText':undefined,'msg':undefined}
            loadingShow()
            let blocks = Object.keys(winConfigForm)
            let idChangedEachBlock = {}
            Object.keys(param['data']).forEach(function(blockId){
                if(param['data'][blockId]['blockType']=="datagrid"){
                    idChangedEachBlock[blockId] = param['data'][blockId]['idChanged']
                    delete param['data'][blockId]['idChanged']
                }
            })
            let promise = new Promise((resolve,reject)=>{
                webix.ajax().headers({'Content-Type':'application/json'}).post("/",param).then(function(respond){
                        let jsonData = respond.json()
                        let getMsg = jsonData.msg;
                        let getStatus = jsonData.status;
                        console.log(1876,getStatus,getMsg);
                        try {
                            if(getStatus == true){
                                winAutoNumber = 0;
                                winValidatePromise = {}
                                if(type=='Insert Data'){
                                    $$(window.winListIdBtn[3]).config.value = "Add New Data"
                                    $$(window.winListIdBtn[3]).config.image = "https://hocdnoden0201.sat.co.id/img/addBtn.png"
                                    $$(window.winListIdBtn[3]).$view.classList.remove("webix_custom_button")
                                    $$(window.winListIdBtn[3]).refresh()
                                    window.winAddData=false;
                                    winFlagInsertBlock = ""
                                    winFlagInsertChild = []
                                    window.winSearchMode=false;
                                    $$("prev").define('disabled',true)
                                    $$("next").define('disabled',true)
                                    $$("searchValue").define('disabled',false)
                                    $$("updateValue").define('disabled',false)
                                    $$("addRowDb").define('hidden',true)
                                    $$("deleteValue").define('disabled',false)
                                    $$(window.winListIdBtn[2]).$view.classList.remove("webix_custom_button")
                                    $$(window.winListIdBtn[2]).refresh()
    
                                    blocks.forEach(function(block){
                                        if(block!=window.winActiveBlock['focusNow']){
                                            if($$(block).config.view == "form"){
                                                Object.keys($$(block).elements).forEach(function(id){
                                                    if (!winDisplayItem.includes(id)){
                                                        if($$(id)!=undefined){
                                                            $$(id).enable()
                                                        }
                                                    }
                                                })
                                            }
                                        }
                                        if(block==winActiveBlock.focusNow){
                                            if(winConfigForm[block]['BLOCK_TYPE'][0]=="DATAGRID"){
                                                winConfigForm[block]["PRIMARY_KEY"].forEach(function(pkCol){
                                                    let columns = $$(block).config.columns
                                                    columns.forEach(function(colObj){
                                                        if(colObj.id==pkCol && colObj.jenis !="combo"){
                                                            if(!$$(block).getColumnConfig(colObj.id).disabledItem){
                                                                colObj.editor = "text"
                                                            }
                                                        }
                                                    })
                                                })
                                                let row_id = $$(window.winActiveBlock['focusNow']).getLastId();
                                                webix.UIManager.setFocus($$(window.winActiveBlock['focusNow']));
                                                if(row_id != undefined){
                                                    $$(window.winActiveBlock['focusNow']).select(row_id,winConfigForm[block]['PRIMARY_KEY'][0], false)
                                                }
                                            }
                                        }
                                    })
                                    
                                    let indexObj = blocks.indexOf(winActiveBlock.focusNow)
                                    for(let a=0; a<=indexObj; a++){
                                        if(winConfigForm[blocks[a]]['BLOCK_TYPE'][0]=="FORM"){
                                            winConfigForm[blocks[a]]["PRIMARY_KEY"].forEach(function (item) {
                                                $$(item).define("readonly",true)
                                                $$(item).refresh()
                                            });
                                        }
                                    }
                                    Object.keys(param).forEach(function(id){
                                        if (param[id]['blockType']=='form'){
                                            if(param[id]['data'].length!=0){
                                                afterInsertHead = true
                                            }else{
                                                afterInsertHead = false
                                            }
                                        }
                                    })
                                    for(let a=0; a<=indexObj; a++){
                                        if(winConfigForm[blocks[a]]['BLOCK_TYPE'][0]=="FORM"){
                                            let insertedData = getBlockValue(blocks[a])
                                            window.winDataCompare[blocks[a]] = {'data':{}}
                                            window.winDataCompare[blocks[a]]['data'] = insertedData
                                            Object.keys(winDataCompare[blocks[a]]['data']).forEach(function(id){
                                                if(winDataCompare[blocks[a]]['data'][id]==undefined || winButtonCallForm.includes(id)){
                                                    winDataCompare[blocks[a]]['data'][id] = ""
                                                }
                                            })
                                        }
                                    }
                                    winAddRecord = false
                                    Object.keys(param.data).forEach(function(block){
                                        if(winConfigForm[block]["BLOCK_TYPE"][0]=="FORM"){
    
                                        }else if(winConfigForm[block]["BLOCK_TYPE"][0]=="DATAGRID"){
                                            console.log(1967,block);
                                            
                                            param.data[block].data.forEach(function(recordInsert){
                                                console.log(1970,recordInsert);
                                                let copyLastRecord = webix.copy(winDataDtSelect[block][winDataDtSelect[block].length-1])
                                                console.log(1972,copyLastRecord);
                                                
                                                Object.keys(copyLastRecord).forEach(function(id){
                                                    copyLastRecord[id] = null
                                                })
                                                let indxRecord = param.data[block].data.indexOf(recordInsert)
                                                console.log(1976,indxRecord);
                                                
                                                Object.keys(winDataChanged[block][indxRecord]).forEach(function(id){
                                                    copyLastRecord[id] = winDataChanged[block][indxRecord][id]
                                                })
                                                winDataDtSelect[block].push(copyLastRecord)
                                            })
                                        }
                                        
                                    })
                                    if(reloadAfterTransaction.insert && !winStatusCallForm){
                                        webix.message({text:type+" Success",expire: 5000});
                                        let parentBlock
                                        
                                        Object.keys(winConfigForm).every(function(block){
                                            if(winConfigForm[block]['BLOCK_TYPE'][1]=="PARENT"){
                                                parentBlock = block
                                                return false 
                                            }else{
                                                return true
                                            }
                                        })
                                        
                                        Object.keys(jsonData.data).forEach(function(key){
                                            if(!winConfigForm[parentBlock]['ELEMENT'].includes(key)){
                                                delete jsonData.data[key]
                                            }
                                            if(!winConfigForm[parentBlock]['PRIMARY_KEY'].includes(key)){
                                                delete jsonData.data[key]
                                            }
                                        })
                                        if(Object.keys(param['data']).includes(getBlockParent())){
                                            if (isGridToGrid) {
                                                restapi.restApiSelect()
                                            }else{
                                                restapi.restApiSelect({'data':jsonData.data})    
                                            }
                                        }else{
                                            Object.keys(param['data']).forEach(function(idBlockParam){
                                                if(idBlockParam!=getBlockParent()){
                                                    // if(winConfigForm[idBlockParam]["LOAD_DATA_AT_START"]!=undefined && winConfigForm[idBlockParam]["LOAD_DATA_AT_START"]){
    
                                                    if(winConfigForm[idBlockParam]["LOAD_DATA_AT_START"]!=undefined){
                                                        let paramIdAfterTransaction = []
                                        
                                                        Object.keys(jsonData['data']).forEach(function(idParamAfterTransaction){
                                                            if (idParamAfterTransaction!="offsetNumber"){
                                                                paramIdAfterTransaction.push(idParamAfterTransaction)
                                                            }
                                                        })
                                                        
                                                        restapi.restApiParam({
                                                            "BLOCK_NAME": idBlockParam,
                                                            "PARAM_ID": paramIdAfterTransaction
                                                        })   
                                                    }
                                                }
                                            })    
                                        }
                                        
                                        winActiveCell = ''
                                        $$(menuId).enable()//enable
                                        $$(menuId).hideProgress();//loading
                                    }else{
                                        let parentBlock
    
                                        Object.keys(winConfigForm).every(function(block){
                                            if(winConfigForm[block]["BLOCK_TYPE"][0] == "DATAGRID"){
                                                $$(block).hideColumn("action_"+block)
                                            }
                                            if(winConfigForm[block]['BLOCK_TYPE'][1]=="PARENT"){
                                                parentBlock = block
                                                return false 
                                            }else{
                                                return true
                                            }
                                        })
                                        webix.message({text:type+" Success",expire: 5000});
                                        
                                        $$(menuId).enable()//enable
                                        $$(menuId).hideProgress();//loading
                                    }
                                    Object.keys(winDataChanged).forEach(function(block){
                                        winDataChanged[block] = []
                                    })
                                    winJenisAddValue = ""
                                }else if(type=='Update Data'){
                                    
                                    let blockName = Object.keys(winConfigForm)
                                    blockName.forEach(function(block){
                                        if($$(block).config.view=="form"){
                                            window.winDataCompare[block] = {'data':{}}
                                            if($$(block).config.view=="form"){
                                                let updatedData =  getBlockValue(block)
                                                window.winDataCompare[block]['data'] = updatedData
                                            }
                                        }
                                    })
                                    
                                    window.winAddData=false;
                                    winFlagInsertBlock = ""
                                    winFlagInsertChild = []
                                    window.winSearchMode=false;
                                    
                                    Object.keys(param['data']).forEach(function(blockUpd){
                                        if(param['data'][blockUpd]['blockType']!="form"){
                                            if (winThereIsSubChild) {
                                                idChangedEachBlock[blockUpd].forEach(function(idChanged){
                                                    let indx = idChangedEachBlock[blockUpd].indexOf(idChanged)
                                                    let tampungan = {}
                                                    if(getRecordForCompare(blockUpd,idChanged) != undefined){
                                                            tampungan = getRecordForCompare(blockUpd,idChanged)
                                                    }
                                                    Object.keys(param['data'][blockUpd]['data'][indx]).forEach(function(idUpdSuccess){
                                                        tampungan[idUpdSuccess] = param['data'][blockUpd]['data'][indx][idUpdSuccess]
                                                    })
                                                })    
                                            }else{
                                                idChangedEachBlock[blockUpd].forEach(function(idChanged){
                                                    let indx = idChangedEachBlock[blockUpd].indexOf(idChanged)
                                                    let tampungan = getRecordForCompare(blockUpd,idChanged)
                                                    Object.keys(param['data'][blockUpd]['data'][indx]).forEach(function(idUpdSuccess){
                                                        tampungan[idUpdSuccess] = param['data'][blockUpd]['data'][indx][idUpdSuccess]
                                                    })
                                                })
                                            }
                                        }
                                    })
                                    
                                    Object.keys(param.data).forEach(function(block){
                                        if(winConfigForm[block]["BLOCK_TYPE"][0]=="FORM"){
                                        }else if(winConfigForm[block]["BLOCK_TYPE"][0]=="DATAGRID"){
                                            param.data[block].data.forEach(function(recordUpd){
                                                let indxRecord = param.data[block].data.indexOf(recordUpd)
                                                winDataDtSelect[block].forEach(function(recordDtSelect){
                                                    if(recordDtSelect["id"]==idChangedEachBlock[block][indxRecord]){
                                                        Object.keys(recordUpd).forEach(function(id){
                                                            recordDtSelect[id] = recordUpd[id]
                                                        })
                                                    }
                                                })
                                            })
                                        }
                                    })
                                    
                                    if(reloadAfterTransaction.update){
                                        winSearchParam = {status:false, param:{}}
                                        webix.message({text:type+" Success",expire: 5000});
                                        let parentBlock
                                        Object.keys(winConfigForm).every(function(block){
                                            if(winConfigForm[block]['BLOCK_TYPE'][1]=="PARENT"){
                                                parentBlock = block
                                                return false
                                            }else{
                                                return true
                                            }
                                        })
                                        Object.keys(jsonData.data).forEach(function(key){
                                            if(!winConfigForm[parentBlock]['ELEMENT'].includes(key)){
                                                delete jsonData.data[key]
                                            }
                                            if(!winConfigForm[parentBlock]['PRIMARY_KEY'].includes(key)){
                                                delete jsonData.data[key]
                                            }
                                        })
                                        if(Object.keys(param['data']).includes(getBlockParent())){
                                            restapi.restApiSelect({'data':jsonData.data})    
                                        }else{
                                            Object.keys(param['data']).forEach(function(idBlockParam){
                                                if(idBlockParam!=getBlockParent()){
                                                    if(winConfigForm[idBlockParam]["LOAD_DATA_AT_START"]!=undefined && !winConfigForm[idBlockParam]["LOAD_DATA_AT_START"]){
                                                        let paramIdAfterTransaction = []
                                        
                                                        Object.keys(jsonData['data']).forEach(function(idParamAfterTransaction){
                                                            if (idParamAfterTransaction!="offsetNumber"){
                                                                paramIdAfterTransaction.push(idParamAfterTransaction)
                                                            }
                                                        })
                                                        
                                                        restapi.restApiParam({
                                                            "BLOCK_NAME": idBlockParam,
                                                            "PARAM_ID": paramIdAfterTransaction
                                                        })   
                                                    }
                                                }
                                            })    
                                        }
                                        winActiveCell = ''
                                        $$(menuId).enable()//enable
                                        $$(menuId).hideProgress();//loading
                                    }else{
                                        webix.message({text:type+" Success",expire: 5000});
                                        $$(menuId).enable()//enable
                                        $$(menuId).hideProgress();//loading
                                    }
                                    Object.keys(winDataChanged).forEach(function(block){
                                        winDataChanged[block] = []
                                    })
                                    $$("prev").define('disabled',false)
                                    $$("next").define('disabled',false)
                                    $$("searchValue").define('disabled',false)
                                    $$("addValue").define('disabled',false)
    
                                    let indexObj = blocks.indexOf(winActiveBlock.focusNow)
                                    for(let a=0; a<=indexObj; a++){
                                        if(winConfigForm[blocks[a]]['BLOCK_TYPE'][0]=="FORM"){
                                            let updatedData = getBlockValue(blocks[a])
                                            window.winDataCompare[blocks[a]] = {'data':{}}
                                            window.winDataCompare[blocks[a]]['data'] = updatedData
                                            Object.keys(winDataCompare[blocks[a]]['data']).forEach(function(id){
                                                if(winButtonCallForm.includes(id)){
                                                    winDataCompare[blocks[a]]['data'][id] = ""
                                                }
                                            })
                                        }
                                    }
                                    resolve({"status":true, "message":"Submit Success"})
                                }else if(type=='Delete Data'){
                                    if($$(window.winActiveBlock['focusNow']).config.view=='form'){
                                        webix.message({text:type+" Success",expire: 5000});
                                        if(reloadAfterTransaction.delete){
                                            if(winConfigForm[window.winActiveBlock['focusNow']]["BLOCK_TYPE"][1] == "CHILD"){
                                                let param = [{}]
                                                let valuesData = {}
                                                winConfigForm[getBlockParent()]['PRIMARY_KEY'].forEach(function(itemId){
                                                    param[0][itemId] = $$(itemId).getValue()
                                                })
                                                valuesData[getBlockParent()] = {}
                                                valuesData[getBlockParent()]["blockType"] = "form"
                                                valuesData[getBlockParent()]['data'] = param
                                                let formattedParam = formatParamAjax(valuesData,"Delete Data")
                                                restapi.restApiSelect({'data':formattedParam[getBlockParent()]['data'][0]})  
                                            }else{
                                                restapi.restApiSelect()
                                                winActiveCell = ''
                                                // $$(menuId).enable()//enable
                                                // $$(menuId).hideProgress();//loading
                                            }
                                        }
                                    }else if($$(window.winActiveBlock['focusNow']).config.view=='datatable'){
                                        if(winThereIsSubChild){
                                            let idFocusNow = $$(window.winActiveBlock['focusNow']).getSelectedId().row
                                            let indexDelete
                                            $$(window.winActiveBlock['focusNow']).serialize().forEach(function(record, idx){
                                                if(idFocusNow == record.id){
                                                    indexDelete = idx
                                                }
                                            })
    
                                            if (Object.keys(winSubChild).includes(winActiveBlock.focusNow) || winConfigForm[winActiveBlock.focusNow]["BLOCK_TYPE"][2] != undefined){
                                                if(winConfigForm[winActiveBlock.focusNow]["BLOCK_TYPE"][1] == "CHILD"){
                                                    winSubChild[winActiveBlock.focusNow].forEach(function(blockSubChild){
                                                        let subChildId = $$(blockSubChild).serialize()[indexDelete].id
                                                        $$(blockSubChild).remove(subChildId)
                                                    })
                                                    let parentChildId = $$(winActiveBlock.focusNow).serialize()[indexDelete].id
                                                    $$(winActiveBlock.focusNow).remove(parentChildId);
                                                }else if (winConfigForm[winActiveBlock.focusNow]["BLOCK_TYPE"][1] == "SUB_CHILD"){
                                                    winSubChild[winConfigForm[winActiveBlock.focusNow]["BLOCK_TYPE"][2]].forEach(function(blockSubChild){
                                                        let subChildId = $$(blockSubChild).serialize()[indexDelete].id
                                                        $$(blockSubChild).remove(subChildId)
                                                    })
                                                    let parentChildId = $$(winConfigForm[winActiveBlock.focusNow]["BLOCK_TYPE"][2]).serialize()[indexDelete].id
                                                    $$(winConfigForm[winActiveBlock.focusNow]["BLOCK_TYPE"][2]).remove(parentChildId);
                                                }   
                                            }
                                        }else{ 
                                                $$(window.winActiveBlock['focusNow']).remove($$(window.winActiveBlock['focusNow']).getSelectedId());        
                                                let countData = $$(window.winActiveBlock['focusNow']).count()
                                                if(countData != 0){
                                                    $$("count_"+window.winActiveBlock['focusNow']).define("count",countData)
                                                $$("count_"+window.winActiveBlock['focusNow']).define("page",countData-1)
                                                    $$("count_"+window.winActiveBlock['focusNow']).refresh()       
                                                }
                                                if(reloadAfterTransaction.delete){
                                                if(winConfigForm[window.winActiveBlock['focusNow']]["BLOCK_TYPE"][1] == "PARENT"){
                                                    restapi.restApiSelect()
                                                    winActiveCell = ''
                                                    // $$(menuId).enable()//enable
                                                    // $$(menuId).hideProgress();//loading
                                                }
                                            }  
                                        }
                                        webix.message({text:type+" Success",expire: 5000});
                                        $$(menuId).enable()//enable
                                        $$(menuId).hideProgress();//loading
                                    }
                                    resolve({status:true})
                                }
                                Object.keys(winConfigForm).forEach(function(block){
                                    if(winConfigForm[block].EVENT_TRANSACTION != undefined){
                                        if(type == "Insert Data"){
                                            if(winConfigForm[block].EVENT_TRANSACTION.postInsert != undefined){
                                                return winConfigForm[block]["EVENT_TRANSACTION"].postInsert(jsonData, Object.keys(param["data"]))
                                            }
                                        }else if(type == "Update Data"){
                                            if(winConfigForm[block].EVENT_TRANSACTION.postUpdate != undefined){
                                                return winConfigForm[block]["EVENT_TRANSACTION"].postUpdate(jsonData, Object.keys(param["data"]))
                                            }
                                        }else if(type == "Delete Data"){
                                            if(winConfigForm[block].EVENT_TRANSACTION.postDelete != undefined){
                                                return winConfigForm[block]["EVENT_TRANSACTION"].postDelete(jsonData, Object.keys(param["data"]))
                                            }
                                        }
                                    }
                                })
                            }else{
                                $$(menuId).hideProgress();//loading
                                $$(menuId).enable()//enable
                                
                                let messageAlert
                                if($$("comboMultiLanguage")!=undefined && window["jsonMultiLanguage_"+menuId] && Object.keys(window["jsonMultiLanguage_"+menuId]).length){
                                    let getLanguageCode = $$("comboMultiLanguage").getValue()
                                    messageAlert = window["jsonMultiLanguage_"+menuId][getLanguageCode][getMsg] || getMsg
                                }else{
                                    messageAlert = getMsg
                                }
                                if(!isWebixPopupOpen()){
                                    webix.alert(ALERT.ALERTERROR(getMsg)).then(function(){
                                        $$(window.winCurrentItem).focus();
                                    });
                                }
                                resolve({"status":false, "message":"Submit Failed"})
                            }
                            
                        } catch (error) {
                            console.log(error);
                            
                        }
                })
            })
            return promise
            
                // if(restLoadApi.status!=200){
                //     errorThisFunc = {'statusCode':restLoadApi.status,'statusText':restLoadApi.statusText,'msg':"RestApiCombo JS - Error Back-End"}
                //     throw errorThisFunc
                // }
                
        
        // catch(err){
        //     $$(menuId).showProgress({type:"icon",hide:true});//loading
        //     $$(menuId).disable()//enable
        //     webix.message({
        //         text:"Error Detected, please capture this error and contact IT HO: <br><br>Error: JS - RestApiSubmit - "+err,
        //         type:"error", 
        //         expire: 10000,
        //     });
        // }
        // }catch(err){
        //     let textError
        //     errorThisFunc = {'statusCode':undefined,'statusText':undefined,'msg':"RestApiSelect JS - Error Ajax Data Select"}
        //     if(err.status){
        //         errorThisFunc = {'statusCode':err.status,'statusText':err.statusText,'msg':"RestApiSelect JS - Error Ajax Data Select"}
        //         textError = "Error Detected, please capture this error and contact IT HO: <br><br>Error: "+errorThisFunc.statusCode+" - ("+errorThisFunc.statusText+")<br><br> AJAX"
        //     }else{
        //         let stringError = String(err.stack).split("at ")[1]
        //         stringError = stringError.split("/")
        //         let errorFile = stringError[stringError.length-1].split(":")[0]
        //         let errorLine = stringError[stringError.length-1].split(":")[1]
        //         textError = "Error Detected, please capture this error and contact IT HO: <br><br>Error: "+err.message+"<br>Position Error : "+errorFile+" line "+errorLine
        //     }
        //     $$(menuId).showProgress({type:"icon",hide:true});//loading
        //     $$(menuId).disable()//enable
            
        //     webix.message({
        //         text:textError,
        //         type:"error", 
        //         expire: 10000,
        //     });
        // }
    }

    restApiCombo(param){
        let errorThisFunc = {'statusCode':undefined,'statusText':undefined,'msg':undefined}
        // try{
            let dataParam = {}
            dataParam.type = "API"
            dataParam.menuId = menuId
            dataParam.data = {}
            dataParam.apiName = param.API_NAME
            let blocks = Object.keys(winConfigForm)
            let blockName = ""
            blocks.forEach(function(block){
                if(winConfigForm[block]['ELEMENT'].includes(param.ITEM_ID)){
                    blockName = block
                } 
            })
            if(winConfigForm[blockName]["BLOCK_TYPE"][0] == "FORM"){
                let fungsiCombo = function () {
                    let idFieldcombo = $$(param.ITEM_ID).getPopup().getList();
                    let result = webix.ajax().headers({'Content-Type':'application/json'}).post("/",dataParam).then(function(respond){
                        let jsonData = respond.json()
                        let getData = jsonData.data;
                        let getStatus = jsonData.status;
                        if(getStatus == true){
                            idFieldcombo.clearAll();
                            idFieldcombo.parse(getData);
                            idFieldcombo.refresh();
                        }
                    })
                    return result
                }

                winApiCombos.push(fungsiCombo)

                if(winIsWithoutAPI){
                    let idFieldcombo = $$(param.ITEM_ID).getPopup().getList();
                    webix.ajax().headers({'Content-Type':'application/json'}).post("/",dataParam).then(function(respond){
                        let jsonData = respond.json()
                        let getData = jsonData.data;
                        let getStatus = jsonData.status;
                        if(getStatus == true){
                            idFieldcombo.clearAll();
                            idFieldcombo.parse(getData);
                            idFieldcombo.refresh();
                        }
                    })
                }

                // if(restLoadApi.status!=200){
                //     errorThisFunc = {'statusCode':restLoadApi.status,'statusText':restLoadApi.statusText,'msg':"RestApiCombo JS - Error Back-End"}
                //     throw errorThisFunc
                // }
            }else {
                let fungsiCombo = function () {
                    let fieldComboDt = $$(blockName).getColumnConfig(param.ITEM_ID).collection
                    let result = webix.ajax().headers({'Content-Type':'application/json'}).post("/",dataParam).then(function(respond){
                        let jsonData = respond.json()
                        let getData = jsonData.data;
                        let getStatus = jsonData.status;
                        if(getStatus == true){
                                fieldComboDt.clearAll()
                                fieldComboDt.parse(getData)
                        }else{
                            let messageAlert
                            if($$("comboMultiLanguage")!=undefined && window["jsonMultiLanguage_"+menuId] && Object.keys(window["jsonMultiLanguage_"+menuId]).length){
                                let getLanguageCode = $$("comboMultiLanguage").getValue()
                                messageAlert = window["jsonMultiLanguage_"+menuId][getLanguageCode]["Tidak Ada Data"] || "Tidak Ada Data"
                            }else{
                                messageAlert = "No Data Found"
                            }
                            if(!isWebixPopupOpen()){
                                webix.alert(messageAlert,"alert-error"); 
                            }
                        }
                    })   
                    return result
                }
                winApiCombos.push(fungsiCombo)   
                
                if(winIsWithoutAPI){
                    let fieldComboDt = $$(blockName).getColumnConfig(param.ITEM_ID).collection
                    webix.ajax().headers({'Content-Type':'application/json'}).post("/",dataParam).then(function(respond){
                        let jsonData = respond.json()
                        let getData = jsonData.data;
                        let getStatus = jsonData.status;
                        if(getStatus == true){
                                fieldComboDt.clearAll()
                                fieldComboDt.parse(getData)
                        }else{
                            let messageAlert
                            if($$("comboMultiLanguage")!=undefined && window["jsonMultiLanguage_"+menuId] && Object.keys(window["jsonMultiLanguage_"+menuId]).length){
                                let getLanguageCode = $$("comboMultiLanguage").getValue()
                                messageAlert = window["jsonMultiLanguage_"+menuId][getLanguageCode]["Tidak Ada Data"] || "Tidak Ada Data"
                            }else{
                                messageAlert = "No Data Found"
                            }
                            // messageAlert = messageAlert.replace("/n","<br>")
                            // messageAlert = messageAlert.replace("+winFormTitle+",winFormTitle)
                            if(!isWebixPopupOpen()){
                                webix.alert(messageAlert,"alert-error"); 
                            }
                        }
                    })   
                }
            }

    }

    restApiDataCombo(param){
        let errorThisFunc = {'statusCode':undefined,'statusText':undefined,'msg':undefined}
        let dataParam = {}
        dataParam.type = "API"
        dataParam.menuId = menuId
        dataParam.data = {}
        dataParam.apiName = param.API_NAME
        param.PARAM_ID.forEach(function(keys){
            dataParam.data[keys] = getItemValue(keys)            
        });
        let blocks = Object.keys(winConfigForm)
        let blockName = ""
        blocks.forEach(function(block){
            if(winConfigForm[block]['ELEMENT'].includes(param.ITEM_ID)){
                blockName = block
            }
        })
        if(winConfigForm[blockName]["BLOCK_TYPE"][0] == "FORM"){
            let idFieldcombo = $$(param.ITEM_ID).getPopup().getList();
            webix.ajax().headers({'Content-Type':'application/json'}).post("/",dataParam).then(function(respond){
                let jsonData = respond.json()
                let getData = jsonData.data;
                let getStatus = jsonData.status;
                if(getStatus == true){
                    idFieldcombo.clearAll();
                    idFieldcombo.parse(getData);
                    idFieldcombo.refresh();
                }                   
            })
        }else{
            let fieldComboDt = $$(blockName).getColumnConfig(param.ITEM_ID).collection
            webix.ajax().headers({'Content-Type':'application/json'}).post("/",dataParam).then(function(respond){
                let jsonData = respond.json()
                let getData = jsonData.data;
                let getStatus = jsonData.status;
                if(getStatus == true){
                        fieldComboDt.clearAll()
                        fieldComboDt.parse(getData)
                }  
            })
        }
    }

    restApiLov(param){
            let errorThisFunc = {'statusCode':undefined,'statusText':undefined,'msg':undefined}
        // try{
            let dataParam = {}
            dataParam.type = "API"
            dataParam.menuId = menuId
            dataParam.data = param.DATA
            if(winAddData){
                dataParam.actionActive = "INSERT"
            }else if (winSearchMode){
                dataParam.actionActive = "SEARCH"
            }

            if(param.ID_LOV_DISPLAY!=undefined){
                dataParam.data["offset"] = 0
            }else{
                if(dataParam.data==undefined){
                    dataParam.data = {"offset":0, "search":"%%"}
                }
                if(dataParam.data["search"]==undefined){
                    dataParam.data["search"] = "%%"
                }else if(dataParam.data["search"]!="%%"){
                    dataParam.data["search"] = "%"+dataParam.data["search"].toUpperCase()+"%"
                }
            }
            if(param.PARAM_ID!=undefined){
                $$(param.TABLE_ID).define("paramId",param.PARAM_ID)
                param.PARAM_ID.forEach(function(keys){
                    dataParam.data[keys] = getItemValue(keys)
                    if (getItemValue(keys)==""){
                        dataParam.data[keys] = "%%"
                    }        
                });

            }else if($$(param.TABLE_ID).config.paramId.length!=0){
                $$(param.TABLE_ID).config.paramId.forEach(function(keys){
                    dataParam.data[keys] = getItemValue(keys)
                    if (getItemValue(keys)==""){
                        dataParam.data[keys] = "%%"
                    }        
                });
            }
            if(dataParam.data['offset']==undefined){
                dataParam.data["offset"] = 0
            }
            dataParam.apiName = "lov_"+param.ITEM_ID+"_"+menuId
            webix.extend($$(param.TABLE_ID), webix.ProgressBar);
            $$(param.TABLE_ID).showProgress()
            
            let promise = new Promise((resolve)=>{

                let restLoadApi = webix.ajax().headers({'Content-Type':'application/json'}).post("/",dataParam);
                // if(restLoadApi.status!=200){
                //     errorThisFunc = {'statusCode':restLoadApi.status,'statusText':restLoadApi.statusText,'msg':"RestApiCombo JS - Error Back-End"}
                //     throw errorThisFunc
                // }
                restLoadApi.then(function(respond){
                    
                    let jsonData = respond.json()
                    let getData = jsonData.data;
                    if(getData.length==0){
                        let labelItem
                        let blockId = getBlockItem(param.ITEM_ID)
                        if($$(blockId).config.view == "form"){
                            labelItem = $$(param.ITEM_ID).config.label
                        }else if($$(blockId).config.view == "datatable"){
                            if($$(blockId).getColumnConfig(param.ITEM_ID) != undefined){
                                labelItem = $$(blockId).getColumnConfig(param.ITEM_ID).header[0]['text']
                            }else{
                                labelItem = param.TABLE_ID.slice(2)
                            }
                        }
                        $$(param.TABLE_ID).config.scrollCondition = false
                        $$(param.TABLE_ID).hideProgress()
                        webix.message({
                            text:"No Data Found | "+labelItem,
                            type:"warning", 
                            expire: 10000,
                        });
                    }
                    let getStatus = jsonData.status;
                    if(getStatus == true && getData.length!=0){
                        if(param.ID_DATE_TYPE != undefined){
                            if(param.ID_DATE_TYPE.length != 0){
                                getData.forEach(function(record){
                                    param.ID_DATE_TYPE.forEach(function(id){
                                        let value = record[id].split(" ")[0]
                                            if(value.length != 10){
                                                value = value.split("-").reverse().join("-");
                                                value = value.substring(value.length-10)
                                            }
                                            if(value.length==10 && value.split("-").length>1 && value.split("-")[0].length==4){
                                                value = value.split("-").reverse().join("-");
                                            }
                                            let hasil = cekDate(value, "DD-MM-YYYY");
                                            record[id] = hasil
                                    })
                                })
                            }
                        }
                        if(param.DATA==undefined){
                            $$(param.TABLE_ID).clearAll();
                            $$(param.TABLE_ID).parse(getData);
                            $$(param.TABLE_ID).refresh();
                        }else{
                            $$(param.TABLE_ID).parse(getData);
                            $$(param.TABLE_ID).refresh();
                        }
                    }else if(getData.length==0 && param.DATA==undefined){
                        $$(param.TABLE_ID).clearAll();
                        $$(param.TABLE_ID).refresh();
                    }
                    $$(param.TABLE_ID).hideProgress()
                    if(param.WD_ID){
                        $$(param.WD_ID).enable()//enable
                        // $$(param.WD_ID).showProgress({type:"icon",hide:true});//loading
                    }else{
                        $$(menuId).enable()//enable
                        // $$(menuId).showProgress({type:"icon",hide:true});//loading
                    }
                })
                resolve()
            })
            return promise
                
            // })
    }

    isWithoutApi(menuId){
        winIsWithoutAPI = true
        winStartEditAfterLoadData = true
        winOpenValidation = true
        let promiseApiCombo = []
        winApiCombos.forEach(function (api) {
            promiseApiCombo.push(api())
        })
        Object.keys(winConfigForm).forEach(function (blockId) {
            if (winConfigForm[blockId]['TRANSACTION_BLOCK'] == undefined) {
                winConfigForm[blockId]['TRANSACTION_BLOCK'] = {
                    'INSERT':true,
                    'UPDATE':true,
                    'DELETE':true
                }
            }
        })
        setMultiLanguage().then(()=>{
            let promiseAll = Promise.all(promiseApiCombo)
            promiseAll.then(()=>{
                $$(menuId).showProgress({type:"icon",hide:true});//loading
                $$(menuId).enable()//enable
                if(winLayout_v2 == true){
                    layoutContentObj.forEach(function(objItem){
                        if(Array.isArray(objItem)){
                            reLayoutOden(objItem[0].id)
                        }else{
                            reLayoutOden(objItem.id)
                        }
                    })
                }
                if ($$("progressLoadingMultilanguage")) {
                    $$("progressLoadingMultilanguage").hide();
                }
                if(typeof afterIsWithoutAPI !== 'undefined'){
                    return afterIsWithoutAPI()
                }
            })
        })
    }

    restApiCustom(param){
        let dataParam = {}
        dataParam.type = "API"
        dataParam.menuId = menuId
        dataParam.data = param.DATA
        dataParam.apiName = param.ITEM_ID+"_"+menuId
        $$(menuId).showProgress();//loading
        let promise = new Promise((resolve,reject)=>{
            webix.ajax().headers({'Content-Type':'application/json'}).post("/",dataParam).then(function(respond,xhr){
                let jsonData = respond.json()
                let getData = jsonData.data;
                let getStatus = jsonData.status;
                let getMsg = jsonData.msg;
                resolve({status:getStatus,data:getData,msg:getMsg, pesan:getMsg})
                $$(menuId).hideProgress();//loading
            })
        })
        return promise
    }

    restApiMultiLanguage(param, dictAllElement, dictCore){
        let dataParam = {}
        dataParam.type = "MULTI_LANGUAGE"
        dataParam.menuId = menuId
        dataParam.oldLanguage = param.oldLanguage
        dataParam.newLanguage = param.newLanguage
        dataParam.data = {
            "FORM" : dictAllElement,
            "CORE" :dictCore
        }
        dataParam.apiName = "multilanguage_"+menuId
        $$(menuId).showProgress();//loading
        $$("progressLoadingMultilanguage").show();
        $$("comboMultiLanguage").disable()
        return webix.ajax().headers({'Content-Type':'application/json'}).post("/",dataParam)
        
    }

    restApiSetMultiLanguageSession(target_language){
        let dataParam = {}
        dataParam.type = "SET_MULTILANGUAGE_SESSION"
        dataParam.menuId = menuId
        dataParam.newLanguage = target_language
        // dataParam.apiName = "set_multilanguage_"+menuId
        // $$(menuId).showProgress();//loading
        return webix.ajax().headers({'Content-Type':'application/json'}).post("/",dataParam)
        
        // return promise
    }

    restApiCallForm(param){
        let dataParam = {}
        dataParam.type = "CALL_FORM"
        dataParam.menuId = menuId
        dataParam.data = param.DATA
        dataParam.apiName = param.ITEM_ID+"_"+menuId
        
        let promise = new Promise((resolve,reject)=>{
        
        let restLoadApi = webix.ajax().headers({'Content-Type':'application/json'}).post("/",dataParam);
            restLoadApi.then(function(respond){
                let jsonData = respond.json()
                let getData = jsonData.data;
                let getStatus = jsonData.status;
                let getMsg = jsonData.msg;
                resolve({status:getStatus,data:getData,msg:getMsg})
            })
        })
        return promise
    }

    restApiTotalCount(param){
        let dataParam = {}
        dataParam.type = "API"
        dataParam.menuId = menuId
        dataParam.data = param.DATA || {}
        dataParam.apiName = "totalCount_"+param.BLOCK_NAME+"_"+menuId
        let restLoadApi = webix.ajax().headers({'Content-Type':'application/json'}).post("/",dataParam);
        restLoadApi.then(function(respond){
            let jsonData = respond.json()
            let getData = jsonData.data;
            let getStatus = jsonData.status;
            let getMsg = jsonData.msg;
            if(getStatus){
                $$("count_"+param.BLOCK_NAME).define("count",getData[0])
                $$("count_"+param.BLOCK_NAME).refresh()
            }
        })
    }
    
    restApiCountData(blockName){
        
    	let dataParam = {}
        dataParam.type = "API"
        dataParam.menuId = menuId
        dataParam.data = {}
       	dataParam.data["blockName"] = blockName
       	dataParam.data["param"] = {}
        dataParam.apiName = `getCountData`
        if(!Object.keys(winTotalDataDt).includes(blockName)){
        	window.winTotalDataDt[blockName]
        }
        if(!Object.keys(winCountDataDt).includes(blockName)){
        	window.winCountDataDt[blockName] = false
        }

        // if(winConfigForm[blockName]["BLOCK_TYPE"][1] == "CHILD"){
        if(winConfigForm[blockName]["REST_API"] != undefined){
            winConfigForm[blockName]["REST_API"]['PARAM_ID'].forEach(function(itemId){
                dataParam.data["param"][itemId] = getItemValue(itemId)
                if (window.winDateType.includes(itemId)){
                    if(dataParam.data["param"][itemId]!=null && dataParam.data["param"][itemId]!=''){
                        let value = dataParam.data["param"][itemId].split(" ")[0]
                        let dateDDMMYY = value.split("-").reverse().join("-")
                        dataParam.data["param"][itemId]=dateDDMMYY
                    }
                }
                if (window.winDateTypeMMYY.includes(itemId)){
                    if(dataParam.data["param"][itemId]!=null && dataParam.data["param"][itemId]!=''){
                        let value = dataParam.data["param"][itemId].split(" ")[0]
                        let dateMMYY = value.split("-").reverse().join("-")
                        dataParam.data["param"][itemId]=dateMMYY+'-01'
                    }
                }
                if (window.winDateTypeYY.includes(itemId)){
                    if(dataParam.data["param"][itemId]!=null && dataParam.data["param"][itemId]!=''){
                        let value = dataParam.data["param"][itemId].split(" ")[0]
                        let dateYY = value.split("-").reverse().join("-")
                        dataParam.data["param"][itemId]=dateYY+'-01-01'
                    }
                }
            })
        }
        // }
		
        $$("popupcount"+blockName).show($$("count_"+blockName).$view,{"pos":"right",x:-125}) 
        $$("totalcount"+blockName).setValue("")
        webix.extend($$("popupcount"+blockName), webix.ProgressBar);
        $$("popupcount"+blockName).showProgress()
        if(window.winCountDataDt[blockName] == false){
            
        	let restLoadApi = webix.ajax().headers({'Content-Type':'application/json'}).post("/",dataParam);
   	  	        restLoadApi.then(function(respond){
   	  	            let jsonData = respond.json()
   	  	            let getData = jsonData.data;
   	  	            let getStatus = jsonData.status;
   	  	            let getMsg = jsonData.msg;
   	  	            if(getStatus){
                        $$("popupcount"+blockName).hideProgress()
   	  	            	if(window.winTotalDataDt[blockName] == getData[0]["count"]){
   	  	            		window.winCountDataDt[blockName] = true
   	  	            	}else{
 	  	            		window.winTotalDataDt[blockName] = getData[0]["count"]
 	  	            		window.winCountDataDt[blockName] = false
                        }
                        $$("totalcount"+blockName).setValue("Total Data : "+getData[0]["count"])
   						$$("popupcount"+blockName).config.width = 110 + (''+window.winTotalDataDt[blockName]).length * 10 
   						$$("popupcount"+blockName).resize()         	
   		            }
			})
        }else{
            $$("totalcount"+blockName).setValue("Total Data : "+window.winTotalDataDt[blockName])
            $$("popupcount"+blockName).hideProgress()
        }
    }

    restApiFile(param){

        function base64ToUrl(base64String, mimeType = 'application/octet-stream') {
            // Decode Base64 to binary data
            const binaryString = atob(base64String);
            const binaryData = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                binaryData[i] = binaryString.charCodeAt(i);
            }
        
            // Create a Blob
            const blob = new Blob([binaryData], { type: mimeType });
        
            // Generate a URL from the Blob
            const url = URL.createObjectURL(blob);
        
            return url;
        }

        function base64ToBlob(base64, mimeType = '') {
            // Decode the Base64 string
            const byteCharacters = atob(base64);
            const byteArrays = [];
        
            // Convert the byte string to an array of bytes
            for (let i = 0; i < byteCharacters.length; i++) {
                byteArrays.push(byteCharacters.charCodeAt(i));
            }
        
            // Create a Blob from the byte array
            return new Blob([new Uint8Array(byteArrays)], { type: mimeType });
        }

        let dataParam = {}
        let typeAPI = param.TYPE
        let useStamp = param.USESTAMP
        let heightPopup = param.HEIGHT_POPUP 
        let widthPopup = param.WIDTH_POPUP
        let stampPosition = param.POSITION_STAMP
        let stampImage_confidential = "https://hocdnoden0201.sat.co.id/images/confidential.png"
        let stampImage_internal_use_only = "https://hocdnoden0201.sat.co.id/images/internaluseonly.png"
        if(typeAPI =="download"){
            dataParam.type = "DOWNLOADFILES"
            dataParam.menuId = menuId
            dataParam.data = param.DATA
            dataParam.apiName = param.API_NAME
            dataParam.jenisFile = param.JENIS_FILE
            dataParam.dataParam = param.DATA_PARAM
            $$(menuId).showProgress()
            webix.ajax().headers({'Content-Type':'application/json'}).post("/fileOden",dataParam).then(function(file){
                $$(menuId).hideProgress()
                let fileExtension = file.json()['data']['mimetype'];
                if (file.json()['status']==false){
                    // file.text().then(function(stringFile){
                        if(!isWebixPopupOpen()){
                            webix.alert(file.json()['msg'],"alert-error");
                        }
                    // })
                }else{
                    if(param["FILE_TYPE"]=="single"){
                        let link=document.createElement('a');
                        // link.href=window.URL.createObjectURL(file);
                        link.href = base64ToUrl(file.json()['file'],file.json()['data']['mimetype'])
                        link.download=param.DATA[0]['oldName'];
                        link.click();
                    }
                }
                $$(menuId).hideProgress()
            });
        }else if(typeAPI =="viewFile"){
            dataParam.type = "DOWNLOADFILES"
            dataParam.menuId = menuId
            dataParam.data = param.DATA
            dataParam.apiName = param.API_NAME
            dataParam.jenisFile = param.JENIS_FILE
            dataParam.dataParam = param.DATA_PARAM
            $$(menuId).disable()
            if (param.WD_POPUP != "" && param.WD_POPUP != undefined){
                if($$("scrollview_wdPopUp" + param.WD_POPUP.charAt(0).toUpperCase() + param.WD_POPUP.slice(1).replace("_",""))!=undefined){
                    $$("scrollview_wdPopUp" + param.WD_POPUP.charAt(0).toUpperCase() + param.WD_POPUP.slice(1).replace("_","")).disable()
                }
            }
            $$(menuId).showProgress()
            webix.ajax().headers({'Content-Type':'application/json'}).post("/fileOden",dataParam).then(function(file){
                if(param["FILE_TYPE"]=="single"){
                    $$(menuId).hideProgress()
                    let fileExtension = file.json()['data']['mimetype'];
                    if (file.json()['status']==false){
                        // file.text().then(function(stringFile){
                        //     // //console.log(json.parse(stringFile))
                        if(!isWebixPopupOpen()){
                            webix.alert(file.json()['msg'],"alert-error");
                        }
                        // })
                    }else{
                        webix.protoUI({
                            name: "pdfviewer-alt",
                            $init() {
                                this.$ready.push(this._attachHandlers);
                            },
                            _attachHandlers() {
                                webix.event(this.$view, "scroll", (e) => {
                                const toolbar = this.config.toolbar && $$(this.config.toolbar);
                                if (toolbar) {
                                    if (e.target.scrollTop > (this._canvas.height * this.$pageNum) / 2) {
                                    if (this.$pageNum === this.$numPages) return;
                                    this.$pageNum += 1;
                                    toolbar.setPage(this.$pageNum);
                                    } else if (e.target.scrollTop < (this._canvas.height * (this.$pageNum - 1)) / 2) {
                                    if (this.$pageNum === 1) return;
                                    this.$pageNum -= 1;
                                    toolbar.setPage(this.$pageNum);
                                    }
                                }
                                });
                            },
                            $onLoad(data) {
                                webix.require([
                                    "https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.js",
                                    "https://unpkg.com/pdfjs-dist@3.4.120/web/pdf_viewer.js",
                                    "https://unpkg.com/pdfjs-dist@3.4.120/web/pdf_viewer.css"
                                    ], function () {
                                    // Explicit binding: pdfjsLib and pdfjsViewer are nested under window.pdfjsDist
                                    window.pdfjsLib = window.pdfjsLib || window["pdfjs-dist/build/pdf"];
                                    window.pdfjsViewer = window.pdfjsViewer || window["pdfjs-dist/web/pdf_viewer"];
                                    
                                    // Important: bind worker
                                    pdfjsLib.GlobalWorkerOptions.workerSrc = "https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.js";

                                    // window.PDFJS = window.pdfjsLib
                                    
                                    this._getDocument(data);
                                    }, this);                                  
                                return true;
                                },
                            _getDocument(data) {
                                if (data.name) {
                                const reader = new FileReader();
                                reader.onload = webix.bind(function (e) {
                                    this._getDocument({ data: e.target.result });
                                }, this);
                                reader.readAsArrayBuffer(data);
                                } else {
                                this._uploadDocument({ data: data.data });
                                }
                            },
                            _uploadDocument(options) {
								function checkPdfEncryption(arrayBuffer) {
								    return new Promise((resolve, reject) => {
								        // Check if the input is an ArrayBuffer
								        if (!(arrayBuffer instanceof ArrayBuffer)) {
								            reject(new Error('Expected an ArrayBuffer, but received something else.'));
								            return;
								        }
								
								        const uint8Array = new Uint8Array(arrayBuffer);
								        const fileHeader = new TextDecoder().decode(uint8Array);
								        if (fileHeader.includes('/Filter /Standard')) {
								            resolve(true); // PDF is encrypted
								        } else {
								            resolve(false); // PDF is not encrypted
								        }
								    });
								}
                                // Check if the PDF is encrypted before loading it
							    checkPdfEncryption(options.data).then(isEncrypted => {
							        if (isEncrypted) {
                                        this._openInNewTab(options.data)
							        } else {
							            // If not encrypted, proceed to load the PDF with pdf.js
							            pdfjsLib.getDocument({ data: options.data, password: options.password }).promise
                                .then((pdfDoc_) => {
                                    this.clear();
                                    this.$pdfDoc = pdfDoc_;
                                    this.$numPages = this.$pdfDoc.numPages;
                                    this.$pageNum = 1;
                                    this._renderDoc(pdfDoc_);
							                })
							                .catch((error) => {
                                    if (error.name === "PasswordException") {
                                    this._tryPassword(options);
							                    } else {
							                        console.error(error);
                                    }
							                });
							        }
							    }).catch(error => {
							        console.error('Error checking PDF encryption:', error);
                                });
							},
                            _openInNewTab(pdfData) {
                                const blob = new Blob([pdfData], { type: "application/pdf" });
                                const url = URL.createObjectURL(blob);
                                window.open(url, '_blank');
                            },
                            _tryPassword(options) {
                                const win = this.getPopup();
                                const form = win.getBody();
                                this._protectedData = options.data;
                            
                                if (options.password) {
                                form.markInvalid("password");
                                form.setValues({ password: options.password }, false, "auto");
                                }
                            
                                win.show();
                                form.focus();
                            },
                            _renderDoc(doc) {
                                this._clearCanvas();
                                for (let page = 1; page <= this.$numPages; page++) {
                                    this._renderPage(page);
                                }

                                if(param['ZOOM_PDF']!="100%"){
                                    const zoomVal = Number(param.ZOOM_PDF.replace("%", "")) / 100;
                                    this.setScale(zoomVal);
                                }
                            },
                            _clearCanvas() {
                                const cs = this.$view.querySelectorAll("canvas");
                                const layers = this.$view.querySelectorAll(".annotationLayer");
                                Array.from(cs).forEach(n => n.remove());
                                Array.from(layers).forEach(n => n.remove());
                            },

                            _renderPage(pageNum) {
                            return this.$pdfDoc.getPage(pageNum).then(page => {
                                const wrapper = this.$view.querySelector(".canvas_wrapper");

                                const scale = this._getScale(this.config.scale);
                                const viewport = page.getViewport({ scale });

                                // === Buat container khusus untuk 1 halaman ===
                                const pageContainer = document.createElement("div");
                                pageContainer.className = "pdf-page-container";
                                Object.assign(pageContainer.style, {
                                position: "relative",
                                width: viewport.width + "px",
                                height: viewport.height + "px",
                                margin: "0 auto"
                                });
                                wrapper.appendChild(pageContainer);

                                // === Buat dan tambahkan canvas ===
                                const canvas = document.createElement("canvas");
                                canvas.className = "pdf-page-canvas";
                                canvas.width = viewport.width;
                                canvas.height = viewport.height;
                                pageContainer.appendChild(canvas);

                                // === Tambahkan annotation layer (jika digunakan) ===
                                const annotationDiv = document.createElement("div");
                                annotationDiv.className = "pdf-annotation-layer";
                                pageContainer.appendChild(annotationDiv);

                                
                                // === Tambahkan stempel gambar (jika config.stampImage ada) ===
                                console.log(3149, useStamp)
                                if (useStamp) {
                                    let stampImage;
                                    if(useStamp == "confidential"){
                                        stampImage = stampImage_confidential;
                                    } else if(useStamp == 'internaluse'){
                                        stampImage = stampImage_internal_use_only;
                                    }
                                    console.log(stampImage)
                                    const stampImg = document.createElement("img");
                                    stampImg.src = stampImage;
                                    stampImg.className = "pdf-stamp-image";


                                    // Style default
                                    const style = {
                                        position: "absolute",
                                        width: "100px", // Ubah ukuran sesuai kebutuhan
                                        opacity: "0.5",
                                        zIndex: "10",
                                        pointerEvents: "none"
                                    };

                                    // Penentuan posisi dinamis
                                    switch (stampPosition) {
                                        case "bottom-left":
                                        style.bottom = "10px";
                                        style.left = "10px";
                                        break;
                                        case "bottom-right":
                                        style.bottom = "10px";
                                        style.right = "10px";
                                        break;
                                        case "bottom-center":
                                        style.bottom = "10px";
                                        style.left = "50%";
                                        style.transform = "translateX(-50%)";
                                        break;
                                        default:
                                        style.bottom = "10px";
                                        style.right = "10px";
                                    }

                                    Object.assign(stampImg.style, style);
                                    pageContainer.appendChild(stampImg);
                                }

                                // === Render halaman PDF ===
                                const renderContext = {
                                canvasContext: canvas.getContext("2d"),
                                viewport: viewport,
                                };

                                page.render(renderContext).promise.then(() => {
                                page.getAnnotations().then(annotations => {
                                    if (pageNum === this.$numPages) {
                                    this.callEvent("onDocumentReady");
                                    }
                                });
                                });

                                // Simpan canvas referensi untuk navigasi scroll
                                this._canvas = canvas;
                            });
                            },

                                                    
                            _getScale(value) {
                                if (!isNaN(parseFloat(value)))
                                    return parseFloat(value);
                                
                                if (isNaN(parseFloat(this.config.scale)))
                                    this.config.scale = 1;
                                
                                const viewWidth = this.$view.clientWidth || 800;
                                const viewHeight = this.$view.clientHeight || 600;
                                const canvasWidth = this._canvas?.clientWidth || 800;
                                const canvasHeight = this._canvas?.clientHeight || 600;
                                
                                let scale = 1;
                                const pageWidthScale = ((viewWidth - (webix.env.mobile ? 0 : 40)) * this.config.scale / canvasWidth).toFixed(2);
                                const pageHeightScale = ((viewHeight - (webix.env.mobile ? 0 : 10)) * this.config.scale / canvasHeight).toFixed(2);
                                
                                switch (value) {
                                    case "page-actual":
                                    scale = 1;
                                    break;
                                    case "page-width":
                                    scale = pageWidthScale;
                                    break;
                                    case "page-height":
                                    scale = pageHeightScale;
                                    break;
                                    case "page-fit":
                                    scale = Math.min(pageWidthScale, pageHeightScale);
                                    break;
                                    case "auto": {
                                    const isLandscape = viewWidth > viewHeight;
                                    const horizontalScale = isLandscape ? Math.min(pageHeightScale, pageWidthScale) : pageWidthScale;
                                    scale = Math.min(1, horizontalScale);
                                    break;
                                    }
                                }
                                
                                return parseFloat(scale);
                                },                              
                            setScale(value) {
                                if (!isNaN(parseFloat(value))) {
                                this._setScale(value);
                                } else {
                                const scale = this._getScale(value);
                                this._setScale(scale);
                                }
                            },
                            _setScale(newScale) {
                                // Simpan scale lama dan baru
                                const oldScale = this.config.scale || 1;
                                this.config.scale = newScale;

                                const wrapper = this.$view.querySelector(".canvas_wrapper");
                                if (!wrapper) return;

                                // Tambahkan efek transisi pada wrapper
                                wrapper.style.transition = "transform 0.25s ease-out";
                                wrapper.style.transformOrigin = "center top";

                                // Hitung rasio zoom (contoh: dari 1 → 1.25)
                                const ratio = parseFloat(newScale) / parseFloat(oldScale);

                                // Lakukan zoom halus via CSS transform sementara
                                wrapper.style.transform = `scale(${ratio})`;

                                // Setelah animasi selesai, render ulang dokumen di skala baru
                                setTimeout(() => {
                                    const wrapper = this.$view.querySelector(".canvas_wrapper");
                                    // Hapus efek sementara supaya layout kembali normal
                                    wrapper.style.transition = "none";
                                    wrapper.style.transform = "none";

                                    // Render ulang dokumen dengan skala baru (clean)
                                    if (wrapper) wrapper.innerHTML = "";

                                    // Render ulang halaman sesuai jumlah asli
                                    for (let page = 1; page <= this.$numPages; page++) {
                                    this._renderPage(page);
                                    }

                                    // Trigger event onScaleChange
                                this.callEvent("onScaleChange", [newScale]);
                                }, 250); // durasi animasi sesuai transition di atas
                            },
                            renderPage(num) {
                                if (!this.$pdfDoc || num <= 0 || num > this.$numPages)
                                return;
                            
                                this.$pageNum = num;
                                this.$view.scrollTop = this._canvas.height * (this.$pageNum - 1);
                            },
                            prevPage() {
                                if (this.$pageNum <= 1)
                                return;
                                this.$pageNum--;
                                this.$view.scrollTop = this._canvas.height * (this.$pageNum - 1);
                            },
                            nextPage() {
                                if (this.$pageNum >= this.$numPages)
                                return;
                                this.$pageNum++;
                                this.$view.scrollTop = this._canvas.height * (this.$pageNum - 1);
                            }
                            }, webix.ui.pdfviewer);

                        let urlFile = URL.createObjectURL(base64ToBlob(file.json()['file'], file.json()['data']['mimetype']))
                        let contentView

                        let fixContent = []
                        // Clean up previous views if they exist
                        if ($$("pdfViewer")) {
                            $$("pdfViewer").destructor();
                        }
                        if ($$("toolbarViewFile")) { 
                            $$("toolbarViewFile").destructor();
                        }

                        // Image viewer variables for zoom and rotate
                        let scale = 1;
                        let rotation = 0;

                        if (fileExtension.includes("pdf")) {
                            // PDF viewer remains unchanged
                            contentView = {
                                view: "pdfviewer-alt",
                                id: "pdfViewer",
                                toolbar : "toolbarViewFile",
                                url: `binary->${urlFile}`
                            }
                            fixContent.push({ view:"pdfbar", id:"toolbarViewFile" })
                            fixContent.push(contentView)
                        } else if (fileExtension.includes("video")) {
                            // Video viewer using iframe with stamp overlay
                            contentView = {
                                template: function() {
                                    let videoTemplate = `<div style="position: relative; width: 100%; height: 100%; background: #000;">
                                        <iframe src="${urlFile}" style="width: 100%; height: 100%; border: none;" allowfullscreen>
                                            Your browser does not support iframe.
                                        </iframe>`;
                                    
                                    // Add stamp overlay for video
                                    if (useStamp != undefined) {
                                        let stampImage;
                                        if(useStamp == "confidential"){
                                            stampImage = stampImage_confidential;
                                        } else if(useStamp == 'internaluse'){
                                            stampImage = stampImage_internal_use_only;
                                        }
                                        
                                        // Get stamp position outside template function
                                        let positionStamp;
                                        switch (stampPosition) {
                                            case "bottom-right": positionStamp = "bottom: 20px; right: 20px;"; break;
                                            case "bottom-center": positionStamp = "bottom: 20px; left: 50%; transform: translateX(-50%);"; break;
                                            case "bottom-left": positionStamp = "bottom: 20px; left: 20px;"; break;
                                            default: positionStamp = "bottom: 20px; right: 20px;";
                                        }
                                        
                                        videoTemplate += `
                                            <div style="position: absolute; ${positionStamp}; pointer-events: none; z-index: 15;">
                                                <img src="${stampImage}" style="width: 100px; opacity: 0.8;" />
                                            </div>`;
                                    }
                                    
                                    videoTemplate += `</div>`;
                                    return videoTemplate;
                                }
                            };
                            fixContent.push(contentView)
                        } else {
                            // Enhanced Image viewer with zoom controls
                            function updateImageTransform() {
                                const img = document.getElementById("imagePreview");
                                const overlay = document.getElementById("stampOverlay");
                                if (img) {
                                    img.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
                                }
                                if (overlay) {
                                    // Overlay ikut transform sama dengan image
                                    overlay.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
                                }
                                // Stamp di dalam overlay, counter-rotate agar tidak ikut rotate
                                const stamp = document.getElementById("stampLayer");
                                if (stamp) {
                                    stamp.style.transform = `rotate(${-rotation}deg)`;
                                }
                                
                                // Update viewport stamp visibility and rotation
                                updateViewportStamp();
                            }
                            
                            function updateViewportStamp() {
                                const viewportStamp = document.getElementById("viewportStamp");
                                if (viewportStamp) {
                                    // Show viewport stamp when zoomed in significantly
                                    if (scale > 1.5) {
                                        viewportStamp.style.display = 'block';
                                        // Viewport stamp tetap static, tidak ikut rotate (sama seperti image stamp)
                                        viewportStamp.style.transform = '';
                                        // Handle center positioning only
                                        if (stampPosition === "bottom-center") {
                                            viewportStamp.style.transform = `translateX(-50%)`;
                                        }
                                    } else {
                                        viewportStamp.style.display = 'none';
                                    }
                                }
                            }

                            function zoomIn() {
                                scale = Math.min(scale + 0.2, 3);
                                updateImageTransform();
                            }

                            function zoomOut() {
                                scale = Math.max(scale - 0.2, 0.3);
                                updateImageTransform();
                            }

                            function rotateImage() {
                                rotation = (rotation + 90)
                                updateImageTransform();
                            }

                            // Image stamp position function
                            function getStampPosition(){
                                switch (stampPosition) {
                                    case "bottom-right": return "bottom: 20px; right: 20px;";
                                    case "bottom-center": return "bottom: 20px; left: 50%; transform: translateX(-50%);";
                                    case "bottom-left": return "bottom: 20px; left: 20px;";
                                    default: return "bottom: 20px; right: 20px;";
                                }
                            }
                            
                            // Viewport stamp position - more centered in viewport
                            function getViewportStampPosition(){
                                switch (stampPosition) {
                                    case "bottom-right": return "bottom: 30%; right: 30%;";
                                    case "bottom-center": return "bottom: 30%; left: 50%; transform: translateX(-50%);";
                                    case "bottom-left": return "bottom: 30%; left: 30%;";
                                    default: return "bottom: 30%; right: 30%;";
                                }
                            }

                            if(param['DOWNLOAD_FILE']){
                                contentView = {
                                    template: function() {
                                        let imageTemplate = `
                                        <div style="position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #f8f9fa;">
                                            <div id="imageContainer" style="position: relative; display: inline-block;">
                                                <img id="imagePreview"
                                                    src="${urlFile}"
                                                    style="max-width: 100%; max-height: 100%; object-fit: contain; transition: transform 0.3s ease;" />
                                                
                                                <!-- Overlay layer dengan size sama dengan image -->
                                                <div id="stampOverlay" style="
                                                    position: absolute;
                                                    top: 0;
                                                    left: 0;
                                                    width: 100%;
                                                    height: 100%;
                                                    pointer-events: none;
                                                    z-index: 15;
                                                    transition: transform 0.3s ease;
                                                ">
                                        `;

                                        // Add stamp overlay if needed - positioned dalam overlay layer
                                        if (useStamp != undefined) {
                                            let stampImage;
                                            if(useStamp == "confidential"){
                                                stampImage = stampImage_confidential;
                                            } else if(useStamp == 'internaluse'){
                                                stampImage = stampImage_internal_use_only;
                                            }
                                            
                                            let positionStamp = getStampPosition();
                                            imageTemplate += `
                                                    <div id="stampLayer" style="position: absolute; ${positionStamp}; pointer-events: none; transition: transform 0.3s ease;">
                                                        <img src="${stampImage}" style="width: 100px; opacity: 0.8;" />
                                                    </div>`;
                                        }

                                        imageTemplate += `
                                                </div>
                                            </div>`;
                                            
                                        // Add viewport stamp - centered position with same size
                                        if (useStamp != undefined) {
                                            let stampImage;
                                            if(useStamp == "confidential"){
                                                stampImage = stampImage_confidential;
                                            } else if(useStamp == 'internaluse'){
                                                stampImage = stampImage_internal_use_only;
                                            }
                                            
                                            let viewportStampPosition = getViewportStampPosition();
                                            imageTemplate += `
                                            <!-- Viewport Stamp - Centered position with same size -->
                                            <div id="viewportStamp" style="
                                                position: absolute;
                                                ${viewportStampPosition}
                                                display: none;
                                                pointer-events: none;
                                                z-index: 18;
                                                transition: transform 0.3s ease;
                                            ">
                                                <img src="${stampImage}" style="width: 100px; opacity: 0.8;" />
                                            </div>`;
                                        }
                                        
                                        imageTemplate += `
                                            
                                            <!-- Floating Zoom Controls - Minimalist -->
                                            <div id="zoomControls" style="
                                                position: absolute; 
                                                bottom: 15px; 
                                                left: 50%; 
                                                transform: translateX(-50%);
                                                display: flex;
                                                gap: 8px;
                                                background: rgba(255,255,255,0.9);
                                                padding: 6px 12px;
                                                border-radius: 20px;
                                                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                                                z-index: 20;
                                            ">
                                                <button onclick="zoomOut()" style="
                                                    width: 32px; height: 32px; 
                                                    border: none; 
                                                    background: transparent; 
                                                    color: #666; 
                                                    border-radius: 50%; 
                                                    cursor: pointer;
                                                    font-size: 16px;
                                                    display: flex;
                                                    align-items: center;
                                                    justify-content: center;
                                                    transition: all 0.2s ease;
                                                " onmouseover="this.style.background='#f0f0f0'" onmouseout="this.style.background='transparent'">−</button>
                                                <button onclick="rotateImage()" style="
                                                    width: 32px; height: 32px; 
                                                    border: none; 
                                                    background: transparent; 
                                                    color: #666; 
                                                    border-radius: 50%; 
                                                    cursor: pointer;
                                                    font-size: 14px;
                                                    display: flex;
                                                    align-items: center;
                                                    justify-content: center;
                                                    transition: all 0.2s ease;
                                                " onmouseover="this.style.background='#f0f0f0'" onmouseout="this.style.background='transparent'">⟲</button>
                                                <button onclick="zoomIn()" style="
                                                    width: 32px; height: 32px; 
                                                    border: none; 
                                                    background: transparent; 
                                                    color: #666; 
                                                    border-radius: 50%; 
                                                    cursor: pointer;
                                                    font-size: 16px;
                                                    display: flex;
                                                    align-items: center;
                                                    justify-content: center;
                                                    transition: all 0.2s ease;
                                                " onmouseover="this.style.background='#f0f0f0'" onmouseout="this.style.background='transparent'">+</button>
                                            </div>
                                        </div>`;

                                        return imageTemplate;
                                    }
                                };
                            } else {
                                contentView = {
                                    template: function() {
                                        let imageTemplate = `
                                        <div style="position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #f8f9fa;">
                                            <div id="imageContainer" style="position: relative; display: inline-block;">
                                                <img id="imagePreview"
                                                    src="${urlFile}"
                                                    style="max-width: 100%; max-height: 100%; object-fit: contain; transition: transform 0.3s ease;" 
                                                    onload='preventDownload(this)' />
                                                
                                                <!-- Overlay layer dengan size sama dengan image -->
                                                <div id="stampOverlay" style="
                                                    position: absolute;
                                                    top: 0;
                                                    left: 0;
                                                    width: 100%;
                                                    height: 100%;
                                                    pointer-events: none;
                                                    z-index: 15;
                                                    transition: transform 0.3s ease;
                                                ">
                                        `;

                                        // Add stamp overlay if needed - positioned dalam overlay layer
                                        if (useStamp != undefined) {
                                            let stampImage;
                                            if(useStamp == "confidential"){
                                                stampImage = stampImage_confidential;
                                            } else if(useStamp == 'internaluse'){
                                                stampImage = stampImage_internal_use_only;
                                            }
                                            
                                            let positionStamp = getStampPosition();
                                            imageTemplate += `
                                                    <div id="stampLayer" style="position: absolute; ${positionStamp}; pointer-events: none; transition: transform 0.3s ease;">
                                                        <img src="${stampImage}" style="width: 100px; opacity: 0.8;" />
                                                    </div>`;
                                        }

                                        imageTemplate += `
                                                </div>
                                            </div>`;
                                            
                                        // Add viewport stamp - centered position with same size
                                        if (useStamp != undefined) {
                                            let stampImage;
                                            if(useStamp == "confidential"){
                                                stampImage = stampImage_confidential;
                                            } else if(useStamp == 'internaluse'){
                                                stampImage = stampImage_internal_use_only;
                                            }
                                            
                                            let viewportStampPosition = getViewportStampPosition();
                                            imageTemplate += `
                                            <!-- Viewport Stamp - Centered position with same size -->
                                            <div id="viewportStamp" style="
                                                position: absolute;
                                                ${viewportStampPosition}
                                                display: none;
                                                pointer-events: none;
                                                z-index: 18;
                                                transition: transform 0.3s ease;
                                            ">
                                                <img src="${stampImage}" style="width: 100px; opacity: 0.8;" />
                                            </div>`;
                                        }
                                        
                                        imageTemplate += `
                                            
                                            <!-- Floating Zoom Controls - Minimalist -->
                                            <div id="zoomControls" style="
                                                position: absolute; 
                                                bottom: 15px; 
                                                left: 50%; 
                                                transform: translateX(-50%);
                                                display: flex;
                                                gap: 8px;
                                                background: rgba(255,255,255,0.9);
                                                padding: 6px 12px;
                                                border-radius: 20px;
                                                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                                                z-index: 20;
                                            ">
                                                <button onclick="zoomOut()" style="
                                                    width: 32px; height: 32px; 
                                                    border: none; 
                                                    background: transparent; 
                                                    color: #666; 
                                                    border-radius: 50%; 
                                                    cursor: pointer;
                                                    font-size: 16px;
                                                    display: flex;
                                                    align-items: center;
                                                    justify-content: center;
                                                    transition: all 0.2s ease;
                                                " onmouseover="this.style.background='#f0f0f0'" onmouseout="this.style.background='transparent'">−</button>
                                                <button onclick="rotateImage()" style="
                                                    width: 32px; height: 32px; 
                                                    border: none; 
                                                    background: transparent; 
                                                    color: #666; 
                                                    border-radius: 50%; 
                                                    cursor: pointer;
                                                    font-size: 14px;
                                                    display: flex;
                                                    align-items: center;
                                                    justify-content: center;
                                                    transition: all 0.2s ease;
                                                " onmouseover="this.style.background='#f0f0f0'" onmouseout="this.style.background='transparent'">⟲</button>
                                                <button onclick="zoomIn()" style="
                                                    width: 32px; height: 32px; 
                                                    border: none; 
                                                    background: transparent; 
                                                    color: #666; 
                                                    border-radius: 50%; 
                                                    cursor: pointer;
                                                    font-size: 16px;
                                                    display: flex;
                                                    align-items: center;
                                                    justify-content: center;
                                                    transition: all 0.2s ease;
                                                " onmouseover="this.style.background='#f0f0f0'" onmouseout="this.style.background='transparent'">+</button>
                                            </div>
                                        </div>`;

                                        return imageTemplate;
                                    }
                                };
                            }
                            
                            fixContent.push(contentView);
                        }

                        // Make zoom functions global
                        window.zoomIn = function() {
                            scale = Math.min(scale + 0.2, 3);
                            updateImageTransform();
                        };

                        window.zoomOut = function() {
                            scale = Math.max(scale - 0.2, 0.3);
                            updateImageTransform();
                        };

                        window.rotateImage = function() {
                            rotation = (rotation + 90)
                            updateImageTransform();
                        };

                        window.updateImageTransform = function() {
                            const img = document.getElementById("imagePreview");
                            const overlay = document.getElementById("stampOverlay");
                            if (img) {
                                img.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
                            }
                            if (overlay) {
                                // Overlay ikut transform sama dengan image
                                overlay.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
                            }
                            // Stamp di dalam overlay, counter-rotate agar tidak ikut rotate
                            const stamp = document.getElementById("stampLayer");
                            if (stamp) {
                                stamp.style.transform = `rotate(${-rotation}deg)`;
                            }
                            
                            // Update viewport stamp visibility (static, tidak ikut rotate)
                            const viewportStamp = document.getElementById("viewportStamp");
                            if (viewportStamp) {
                                // Show viewport stamp when zoomed in significantly
                                if (scale > 1.5) {
                                    viewportStamp.style.display = 'block';
                                    // Viewport stamp tetap static, tidak ikut rotate
                                    viewportStamp.style.transform = '';
                                    // Handle center positioning only
                                    if (stampPosition === "bottom-center") {
                                        viewportStamp.style.transform = `translateX(-50%)`;
                                    }
                                } else {
                                    viewportStamp.style.display = 'none';
                                }
                            }
                        };
                        if (!heightPopup) {
                            heightPopup = 0.75*window.innerHeight
                        }else{
                            if (heightPopup >= window.innerHeight) {
                                heightPopup = window.innerHeight
                            }
                        }
                        if (!widthPopup) {
                            widthPopup = 0.75*window.innerWidth
                        }else{
                            if (widthPopup >= window.innerWidth) {
                                widthPopup = window.innerWidth
                            }
                        }

                        webix.ui({
                            view: "window",
                            id: "fileWindow",
                            height: heightPopup,
                            width: widthPopup,
                            move:true,
                            resize: true,
                            position:"center",
                            head: {
                                view: "toolbar", cols: [
                                    { view: "label", label: "File Viewer" },
                                    { view: "button", label: "Close", width: 100, align: "right", click: function(){
                                        $$('fileWindow').close();
                                        $$(menuId).enable()
                                        if (param.WD_POPUP != "" && param.WD_POPUP != undefined){
                                            if($$("scrollview_wdPopUp" + param.WD_POPUP.charAt(0).toUpperCase() + param.WD_POPUP.slice(1).replace("_",""))!=undefined){
                                                $$("scrollview_wdPopUp" + param.WD_POPUP.charAt(0).toUpperCase() + param.WD_POPUP.slice(1).replace("_","")).enable()
                                            }
                                        }
                                    } }
                                ]
                            },
                            body: {
                                rows:fixContent
                            },
                            on: {
                                onHide:function(){
                                    $$(menuId).enable()
                                }
                            }
                        }).show();


                        if(fileExtension.includes("pdf")){
                            

                            // $$("toolbarViewFile").queryView({"type":"icon", "icon":"wxi-download"}).hide()
                            let objsBtn = $$("toolbarViewFile").queryView({"view":"button"},"all")

                            objsBtn.forEach(function(objBtn){
                                if(objBtn==$$("toolbarViewFile").queryView({"type":"icon", "icon":"wxi-download"})){
                                    if(!param['DOWNLOAD_FILE']){
                                        objBtn.hide()
                                    }

                                    objBtn.define("click", function () {
                                        const pdfViewer = $$("pdfViewer");
                                        if (pdfViewer) {
                                            const url = pdfViewer.config.url.source;
                                            const link = document.createElement("a");
                                            link.href = url;
                                            link.download = param['DATA'][0]['oldName']//url.split("/").pop();
                                            // document.body.appendChild(link);
                                            link.click();
                                            // document.body.removeChild(link);
                                        }
                                    });

                                    // Apply changes to the button
                                    objBtn.refresh();
                                }else{
                                    objBtn.hide()
                                }
                            })
                            // objsBtn[0].hide()
                            // objsBtn[1].hide()
                            
                            let objsText = $$("toolbarViewFile").queryView({"view":"text"},"all")
                            objsText[0].hide()

                            let objsTemplate = $$("toolbarViewFile").queryView(function(view){
                                return view.config.data;
                            });
                            objsTemplate.hide()
                            
                        }
                    }
                }
                $$(menuId).hideProgress()
            });
        }
        else if(typeAPI == "delete"){
            dataParam.type = "DELETEFILES"
            dataParam.menuId = menuId
            dataParam.data = param.DATA
            dataParam.apiName = param.API_NAME
            dataParam.jenisFile = param.JENIS_FILE
            dataParam.dataParam = param.DATA_PARAM
            $$(menuId).showProgress()
            let promise = new Promise((resolve,reject)=>{
                webix.ajax().headers({'Content-Type':'application/json'}).post("/fileOden",dataParam).then(function(respond){
                    let jsonData = respond.json()
                    if(jsonData.status){
                        resolve({status:jsonData.status, filename:jsonData.filename})
                    }else{
                        resolve({status:jsonData.status, msg:jsonData.msg, pesan:jsonData.msg})
                    }
                    $$(menuId).hideProgress()
                }).catch(function(error){
                    reject(error)
                })
            })
            return promise
        }else if(typeAPI == "createSpreadsheet"){
            dataParam.type = "CREATESPREADSHEET"
            dataParam.menuId = menuId
            dataParam.data = param.DATA
            dataParam.apiName = param.API_NAME
            $$(menuId).showProgress();//loading
            $$(menuId).disable()//enable
            let promise = new Promise((resolve,reject)=>{
                let restLoadApi = webix.ajax().headers({'Content-Type':'application/json'}).post("/fileOden",dataParam);
                restLoadApi.then(function(respond){
                    let jsonDataCreate = respond.json()
                    if(jsonDataCreate.status){
                        if($$(getBlockItem(param.ID_FILE)).config.view == "form"){
                            $$(param.ID_FILE).setValue(jsonDataCreate.data['idFile'])
                            $$(param.FILE_NAME).setValue(jsonDataCreate.data['fileName'])
                        }else{
                            setValueDt([param.ID_FILE,param.FILE_NAME],[jsonDataCreate.data['idFile'],jsonDataCreate.data['fileName']])
                        }
                    }
                    $$(menuId).enable()//enable
                    $$(menuId).hideProgress();//loading
                    resolve(jsonDataCreate)
                }).catch(function(error){
                    reject(error)
                })
            })
            return promise
        }else if(typeAPI == "calculateSpreadsheet"){
            dataParam.type = "CALCULATESPREADSHEET"
            dataParam.menuId = menuId
            dataParam.data = param.DATA
            dataParam.apiName = param.API_NAME
            $$(menuId).showProgress();//loading
            $$(menuId).disable()//enable
            let promise = new Promise((resolve,reject)=>{
                let restLoadApi = webix.ajax().headers({'Content-Type':'application/json'}).post("/fileOden",dataParam).then(function(respond){
                    let jsonDataCreate = respond.json()
                    $$(menuId).enable()//enable
                    $$(menuId).hideProgress();//loading
                    resolve(jsonDataCreate)
                }).catch(function(error){
                    reject(error)
                })
            })
            return promise
        }else if(typeAPI == "loadPhoto"){
            dataParam.type = "LOADPHOTO"
            dataParam.menuId = menuId
            dataParam.data = param.DATA
            dataParam.apiName = param.API_NAME
            webix.ajax().response("blob").headers({'Content-Type':'application/json'}).post("/fileOden",dataParam).then(function(file){
                // fileJSON = JSON.parse(fileText)
                if(file.type!='application/json'){
                    let reader = new FileReader();
                    reader.readAsDataURL(file); 
                    reader.onloadend = function() {
                        let base64data = reader.result;  
                        $$(dataParam.data[0]['TEMPLATE_ID']).setHTML('<img src="'+base64data+'" width="180px" height="200px" class="content" ondragstart="return false"/>')              
                    }
                }else{
                    $$(dataParam.data[0]['TEMPLATE_ID']).setHTML('<img src="static/fotoprofil.jpeg" width="180px" height="200px" class="content" ondragstart="return false"/>')
                    
                }

                
            });
        }
    }

}

let restapi = new RestApi()

winAdditionalTemplate["Sorry, there is no data"] = "Sorry, there is no data"
winAdditionalTemplate["Tidak Ada Data/n+blockNameMessage+ (datagrid)"] = "Tidak Ada Data/n+blockNameMessage+ (datagrid)"
winAdditionalTemplate["Tidak Ada Data/n+blockNameMessage+ (form)"] = "Tidak Ada Data/n+blockNameMessage+ (form)"
winAdditionalTemplate["Data Tidak Ditemukan | "] = "Data Tidak Ditemukan | "
winAdditionalTemplate["Tidak ada Data"]= "Tidak ada Data"
winAdditionalTemplate["/nError Code : 500 - "] = "/nError Code : 500 - "
winAdditionalTemplate["Tidak Ada Data/n+winFormTitle+ (form)"] = "Tidak Ada Data/n+winFormTitle+ (form)"
winAdditionalTemplate["Tidak Ada Data/n+winFormTitle+ (datagrid)"] = "Tidak Ada Data/n+winFormTitle+ (datagrid)"
winAdditionalTemplate["Internal Server Error"] = "Internal Server Error"
winAdditionalTemplate["Error Detected, please capture this error and contact IT HO: /n/nError: "] = "Error Detected, please capture this error and contact IT HO: /n/nError: "