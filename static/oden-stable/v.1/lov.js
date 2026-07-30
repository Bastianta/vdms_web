// ^ LAST UPDATE --> 02/12/24
window.winMultiSelect = {}
window.winDtLovMultiselect = []
window.lovApi = 0
function setDataLov(id,columns,idField,colsLov,idSearch,idWd,customInputCols){
    if(customInputCols==undefined){
        if ( colsLov == 1 ) {
            let errorThisFunc = {'statusCode':undefined,'statusText':undefined,'msg':undefined}
            try{
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
                    if(window.winDataChanged[winActiveBlock['lastFocus']].length != 0){
                        for (var i in window.winDataChanged[winActiveBlock['lastFocus']]) {
                            if (window.winDataChanged[winActiveBlock['lastFocus']][i].id == window.winDataRow.id) {
                                delete window.winDataChanged[winActiveBlock['lastFocus']][i]
                                let indexObj = blocks.indexOf(winActiveBlock.lastFocus)
                                for(let a=0; a<=indexObj; a++){
                                    if(winConfigForm[blocks[a]]["BLOCK_TYPE"][0]=="FORM"){
                                        winConfigForm[blocks[a]]["PRIMARY_KEY"].forEach(function(id){
                                            window.winDataRow[id] = $$(id).getValue()
                                        })
                                    }
                                }
                                window.winDataChanged[winActiveBlock['lastFocus']] = window.winDataChanged[winActiveBlock['lastFocus']].filter((a) => a);
                                window.winDataChanged[winActiveBlock['lastFocus']].push(window.winDataRow)
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
                        window.winDataChanged[winActiveBlock['lastFocus']].push(window.winDataRow)
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
            }catch(err){
                $$(menuId).showProgress({type:"icon",hide:true});//loading
                $$(menuId).disable()//enable
                webix.message({
                    text:"Error Detected, please capture this error and contact IT HO: <br><br>Error: JS - LOV - SetDataLov Cols 1 - "+err,
                    type:"error", 
                    expire: 10000,
                });
                
            }
        }else if ( colsLov == 2 ) {
            let errorThisFunc = {'statusCode':undefined,'statusText':undefined,'msg':undefined}
            try{
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
                    if(window.winDataChanged[winActiveBlock['lastFocus']].length != 0){
                        for (var i in window.winDataChanged[winActiveBlock['lastFocus']]) {
                            if (window.winDataChanged[winActiveBlock['lastFocus']][i].id == window.winDataRow.id) {
                                delete window.winDataChanged[winActiveBlock['lastFocus']][i]
                                let indexObj = blocks.indexOf(winActiveBlock.lastFocus)
                                for(let a=0; a<=indexObj; a++){
                                    if(winConfigForm[blocks[a]]["BLOCK_TYPE"][0]=="FORM"){
                                        winConfigForm[blocks[a]]["PRIMARY_KEY"].forEach(function(id){
                                            window.winDataRow[id] = $$(id).getValue()
                                        })
                                    }
                                }
                                window.winDataChanged[winActiveBlock['lastFocus']] = window.winDataChanged[winActiveBlock['lastFocus']].filter((a) => a);
                                window.winDataChanged[winActiveBlock['lastFocus']].push(window.winDataRow)
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
                        window.winDataChanged[winActiveBlock['lastFocus']].push(window.winDataRow)
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
            }catch(err){
                $$(menuId).showProgress({type:"icon",hide:true});//loading
                $$(menuId).disable()//enable
                webix.message({
                    text:"Error Detected, please capture this error and contact IT HO: <br><br>Error: JS - LOV - SetDataLov Cols 2 - "+err,
                    type:"error", 
                    expire: 10000,
                });
                
            }
        } else if ( colsLov > 2 ) {
            let errorThisFunc = {'statusCode':undefined,'statusText':undefined,'msg':undefined}
            try{
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
                        if(window.winDataChanged[winActiveBlock['lastFocus']].length != 0){
                            for (var i in window.winDataChanged[winActiveBlock['lastFocus']]) {
                                if (window.winDataChanged[winActiveBlock['lastFocus']][i].id == window.winDataRow.id) {
                                    delete window.winDataChanged[winActiveBlock['lastFocus']][i]
                                    let indexObj = blocks.indexOf(winActiveBlock.lastFocus)
                                    for(let a=0; a<=indexObj; a++){
                                        if(winConfigForm[blocks[a]]["BLOCK_TYPE"][0]=="FORM"){
                                            winConfigForm[blocks[a]]["PRIMARY_KEY"].forEach(function(id){
                                                window.winDataRow[id] = $$(id).getValue()
                                            })
                                        }
                                    }
                                    window.winDataChanged[winActiveBlock['lastFocus']] = window.winDataChanged[winActiveBlock['lastFocus']].filter((a) => a);
                                    window.winDataChanged[winActiveBlock['lastFocus']].push(window.winDataRow)
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
                                window.winDataChanged[winActiveBlock['lastFocus']].push(window.winDataRow)
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
            }catch(err){
                $$(menuId).showProgress({type:"icon",hide:true});//loading
                $$(menuId).disable()//enable
                webix.message({
                    text:"Error Detected, please capture this error and contact IT HO: <br><br>Error: JS - LOV - SetDataLov Cols > 2 - "+err,
                    type:"error", 
                    expire: 10000,
                });
                
            }
        }
    }else{
        let blocks = Object.keys(winConfigForm)
        if($$(window.winActiveBlock['lastFocus']).config.view=="datatable"){
            let code = $$( id ).getSelectedItem()
            let record = $$(window.winActiveBlock['lastFocus']).getItem(window.winActiveCell.pos.row);
            Object.keys(customInputCols).forEach(function(idCustom){
                record[idCustom] = code[customInputCols[idCustom]];
            })

            $$(window.winActiveBlock['lastFocus']).refresh(window.winActiveCell.pos.row);
            winDataRow = record
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
            if(window.winDataChanged[winActiveBlock['lastFocus']].length != 0){
                for (var i in window.winDataChanged[winActiveBlock['lastFocus']]) {
                    if (window.winDataChanged[winActiveBlock['lastFocus']][i].id == window.winDataRow.id) {
                        delete window.winDataChanged[winActiveBlock['lastFocus']][i]
                        let indexObj = blocks.indexOf(winActiveBlock.lastFocus)
                        for(let a=0; a<=indexObj; a++){
                            if(winConfigForm[blocks[a]]["BLOCK_TYPE"][0]=="FORM"){
                                winConfigForm[blocks[a]]["PRIMARY_KEY"].forEach(function(id){
                                    window.winDataRow[id] = $$(id).getValue()
                                })
                            }
                        }
                        window.winDataChanged[winActiveBlock['lastFocus']] = window.winDataChanged[winActiveBlock['lastFocus']].filter((a) => a);
                        window.winDataChanged[winActiveBlock['lastFocus']].push(window.winDataRow)
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
                window.winDataChanged[winActiveBlock['lastFocus']].push(window.winDataRow)
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
            Object.keys(customInputCols).forEach(function(idCustom){
                // record[idCustom] = code[customInputCols[idCustom]];
                $$(idCustom).setValue( code[ customInputCols[idCustom] ] )
            })
            // $$( idField[ 0 ] ).setValue( code[ columnCode ] )
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
        }
    }
    
} 


class DatatableLov {
    CREATEDATATABLENORMAL(id,pagination,height,columns,data){
        let datatable = {"id":id,view:"datatable", "pager":pagination, "height":height,"columns":columns,"data":data}
        return datatable
    }
    
    CREATECOLUMN(id,header,fillspace){
        let column  = {"id":id, "header":header, "fillspace":fillspace}
        return column
    } 
    CREATEDATATABLELOV(id,columns=[],idField,colsLov,idSearch, idWd, customInputCols, customMultiSelect){
        let enterEvent
        if(!customMultiSelect || customMultiSelect == "multiselect"){
            enterEvent = {
                "onEnter": function(){
                    if($$(getBlockItem(idField[0])).config.view=="datatable"){
                        checkToDatachanged({rowId:winActiveCell.pos.row, columnId :winActiveCell.pos.column,blockActive:getBlockItem(idField[0])})
                    }
                    setDataLov(id,columns,idField,colsLov,idSearch,idWd, customInputCols)
                },
                "onItemDblClick":function(){
                    if($$(getBlockItem(idField[0])).config.view=="datatable"){
                        checkToDatachanged({rowId:winActiveCell.pos.row, columnId :winActiveCell.pos.column,blockActive:getBlockItem(idField[0])})
                    }
                    setDataLov(id,columns,idField,colsLov,idSearch,idWd, customInputCols)
                },
                "onKeyPress":function(code){
                    if((code >= 48 && code <= 57) || (code >= 65 && code <= 90)){
                        $$(idSearch).focus();
                    }
                },
                "onAfterScroll":function(){
                    
                    let maxScrollState = (this.count() *35) - 342;
                    let currentState = this.getScrollState().y;
                    if (currentState >= maxScrollState && currentState !=0) {
                        let offsetLov = this.config.offsetNow + parseInt(this.config.limitTableLov)
                        console.log(531,"offsetLov : ",offsetLov);
                        this.define("offsetNow",offsetLov)
                        let data = {'offset':offsetLov, 'search':$$(idSearch).getValue()}
                        if(winConfigForm[getBlockItem(idField[0])]['LOV_API']!=undefined){
                            if(winConfigForm[getBlockItem(idField[0])]['LOV_API'][idField[0]]["DATA"]!=undefined){
                                if(Array.isArray(winConfigForm[getBlockItem(idField[0])]['LOV_API'][idField[0]]["DATA"])){
                                    winConfigForm[getBlockItem(idField[0])]['LOV_API'][idField[0]]["DATA"].forEach(function(idGetValue){
                                        data[idGetValue] = getItemValue(idGetValue)
                                    })
                                }else if(typeof(winConfigForm[getBlockItem(idField[0])]['LOV_API'][idField[0]]["DATA"])=="object"){
                                    Object.keys(winConfigForm[getBlockItem(idField[0])]['LOV_API'][idField[0]]["DATA"]).forEach(function(idItem){
                                        data[idItem] = winConfigForm[getBlockItem(idField[0])]['LOV_API'][idField[0]]["DATA"][idItem]
                                    })
                                }
                            }
                        }
                        
                        $$(window.menuId).disable()//enable
                        // $$(window.menuId).showProgress({type:"icon",hide:false});//loading
                        if(this.config.scrollCondition){
                            if(window.lovApi == 0 && window.openHTTPs == 0){
                                window.lovApi += 1
                                if(winConfigForm[getBlockItem(idField[0])]['LOV_API']!=undefined){
                                    let paramLOV = webix.copy(winConfigForm[getBlockItem(idField[0])]['LOV_API'][idField[0]])
                                    paramLOV["DATA"] = data
                                    restapi.restApiLov(paramLOV).then(function(respond){
                                        window.lovApi = 0
                                    })
                                }else{
                                    restapi.restApiLov({"ITEM_ID":idField[0],"TABLE_ID":this.config.id,"DATA":data}).then(function(respond){
                                        window.lovApi = 0
                                    })
                                }
                            }

                        }
                        // webix.message('jalan ' + numberPage);
                    }
                },
            }
        }else{
            enterEvent = {
                "onEnter": function(){
                    
                },
                "onItemDblClick":function(){
                   
                },
                "onAfterLoad":function(){
                    window.lovApi = 0
                },
                "onBeforeSelect":function(object){
                    let blockMultiRow
                    let itemSelected = $$(id).getItem(object.id)
                    Object.keys(winConfigForm).forEach(function(block){
                        if(winConfigForm[block]["LOV_API"]!= undefined){
                            if(Object.keys(winConfigForm[block]["LOV_API"]).includes(idField[0])){
                                blockMultiRow = block
                            }
                        }
                    })
                    if(winConfigForm[blockMultiRow]["PRIMARY_KEY"].includes(idField[0].split("multiselect")[0])){
                        let recordExisted
                        $$(blockMultiRow).serialize().forEach(function(record){
                            if(itemSelected[columns[0].id] == record[idField[0].split("multiselect")[0]]){
                                recordExisted = itemSelected[columns[0].id]
                            }
                        })
                        if(recordExisted){
                            webix.alert(ALERT.ALERTINFO('Code '+recordExisted+' already exist in the table.'))
                            return false
                        }
                    }else{
                        return true
                    }  
                },
                "onAfterSelect":function(){
                    
                    let blockMultiRow
                    Object.keys(winConfigForm).forEach(function(block){
                        if(winConfigForm[block]["LOV_API"]!= undefined){
                            if(Object.keys(winConfigForm[block]["LOV_API"]).includes(idField[0])){
                                blockMultiRow = block
                            }
                        }
                    })

                    if($$(id).getSelectedItem() != undefined){
                        if(!Array.isArray($$(id).getSelectedItem())){
                            winMultiSelect[blockMultiRow] = []
                            winMultiSelect[blockMultiRow] = [$$(id).getSelectedItem()]
                        }else{
                            $$(id).getSelectedItem().forEach(function(selected){
                                winMultiSelect[blockMultiRow] = $$(id).getSelectedItem()
                            })
                        }
                    }
                },
                "onAfterUnSelect":function(selection){
                    
                    
                    let blockMultiRow
                    Object.keys(winConfigForm).forEach(function(block){
                        if(winConfigForm[block]["LOV_API"]!= undefined){
                            if(Object.keys(winConfigForm[block]["LOV_API"]).includes(idField[0])){
                                blockMultiRow = block
                            }
                        }
                    })
                    if($$(id).getSelectedItem() != undefined){
                        if(!Array.isArray($$(id).getSelectedItem())){
                            winMultiSelect[blockMultiRow] = []
                            winMultiSelect[blockMultiRow] = [$$(id).getSelectedItem()]
                        }else{
                            $$(id).getSelectedItem().forEach(function(selected){
                                winMultiSelect[blockMultiRow] = $$(id).getSelectedItem()
                            })
                        }
                    }else{
                        winMultiSelect[blockMultiRow] = []
                    }
                },
                "onKeyPress":function(code){
                    if((code >= 48 && code <= 57) || (code >= 65 && code <= 90)){
                        $$(idSearch).focus();
                    }
                },
                "onSelectChange":function(){
                    
                    
                },
                "onAfterScroll":function(){
                    let maxScrollState = (this.count() *35) - 342;
                    let currentState = this.getScrollState().y;
                    
                    if (currentState >= maxScrollState && currentState !=0) {
                        let offsetLov = this.config.offsetNow + parseInt(this.config.limitTableLov)
                        console.log(667,"offsetLov : ",offsetLov);
                        
                        this.define("offsetNow",offsetLov)
                        let data = {'offset':offsetLov, 'search':$$(idSearch).getValue()}
                        if(winConfigForm[getBlockItem(idField[0])]['LOV_API']!=undefined){
                            if(winConfigForm[getBlockItem(idField[0])]['LOV_API'][idField[0]]["DATA"]!=undefined){
                                if(Array.isArray(winConfigForm[getBlockItem(idField[0])]['LOV_API'][idField[0]]["DATA"])){
                                    winConfigForm[getBlockItem(idField[0])]['LOV_API'][idField[0]]["DATA"].forEach(function(idGetValue){
                                        data[idGetValue] = getItemValue(idGetValue)
                                    })
                                }else if(typeof(winConfigForm[getBlockItem(idField[0])]['LOV_API'][idField[0]]["DATA"])=="object"){
                                    Object.keys(winConfigForm[getBlockItem(idField[0])]['LOV_API'][idField[0]]["DATA"]).forEach(function(idItem){
                                        data[idItem] = winConfigForm[getBlockItem(idField[0])]['LOV_API'][idField[0]]["DATA"][idItem]
                                    })
                                }
                            }
                        }
                        
                        $$(window.menuId).disable()//enable
                        // $$(window.menuId).showProgress({type:"icon",hide:false});//loading
                        if(this.config.scrollCondition){
                            if(window.lovApi == 0 && window.openHTTPs == 0){
                                window.lovApi += 1
                                if(winConfigForm[getBlockItem(idField[0])]['LOV_API']!=undefined){
                                    let paramLOV = webix.copy(winConfigForm[getBlockItem(idField[0])]['LOV_API'][idField[0]])
                                    paramLOV["DATA"] = data
                                    restapi.restApiLov(paramLOV).then(function(respond){
                                        window.lovApi = 0
                                    })
                                }else{
                                    restapi.restApiLov({"ITEM_ID":idField[0],"TABLE_ID":this.config.id,"DATA":data}).then(function(respond){
                                        window.lovApi = 0
                                    })
                                }
                            }

                        }
                        // webix.message('jalan ' + numberPage);
                    }else{
                        
                    }
                },
            }
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
            "multiselect": customMultiSelect == true? "touch":false,
            "resizeColumn":true,
            "offsetNow":0,
            "limitTableLov":50,
            "paramId": [],
            "scrollCondition":true
        }


        datatable["on"] = enterEvent
        return datatable        
    }
    
    CREATECOLUMNDT(id,header, rightAlign){
        let columns = { "id":id,"css":{'text-align':'left'},"header":header, adjust:true, minWidth:250}
        if(rightAlign){
            columns.css = {'text-align':'right'}
        }
        return columns
    }
}

var DATATABLES_LOV = new DatatableLov();

class Lov {
    /**
    *Berfungsi untuk membuat id pada column tabel secara otomatis berdasarkan header tabel.
    *@param el adalah array berisi nama-nama header tabel.
    */
    generateTableCol( el , alignRight) {
        // create column for Datatable
        let tableEl = []
        for ( let i = 0; i < el.length; i++ ) {
            // convert text to lower case
            let temp = el[ i ].toLowerCase().split( " " )

            // generate col name
            let idCol = ''
            let colName = el[ i ]
            for ( let j = 0; j < temp.length; j++ ) {
                idCol = idCol + temp[ j ].toLowerCase()
            }
            let rightAlign = false
            if(alignRight.includes(el[i])){
                rightAlign = true
            }
            idCol = 'lov' + idCol
            // generate columnTable
            let colData = DATATABLES_LOV.CREATECOLUMNDT( idCol, colName, rightAlign)
            if(i===el.length-1){
                colData.minWidth = 250,
                colData.fillspace=true
            }
            tableEl.push( colData )
        }
        return tableEl
    }

    /**
    * Membuat window LOV secara dinamis.
    * idWd adalah id window
    * idTb adalah id datatable
    * tableEl adalah element column pada datatable
    * @param id adalah nama lov yang akan digunakan sebagai idWd dan idTb
    * @param el adalah nama2 header tabel 
    */
    lovField( id, idField, el, type, customInputCols, customMultiSelect=false) {
        let offsetLov = 0;
        let limitLov = 50;
        let alignRight = []
        let blockType = winConfigForm[getBlockItem(idField[0])]["BLOCK_TYPE"][0]
        if(blockType == "FORM"){
            idField.forEach(function(itemId){
                if($$(itemId) != undefined){
                    if($$(itemId).config.inputAlign == "right"){
                        alignRight.push(el[idField.indexOf(itemId)])
                    }
                }
            })
        }else if(blockType == "DATAGRID"){
            idField.forEach(function(itemId){
                if($$(getBlockItem(idField[0])).getColumnConfig(itemId) != undefined){
                    if($$(getBlockItem(idField[0])).getColumnConfig(itemId).inputAlign == "right"){
                        alignRight.push(el[idField.indexOf(itemId)])
                    }
                }
            })
        }
        let tableEl = this.generateTableCol( el, alignRight)
        let idTb = 'dt' + id.charAt( 0 ).toUpperCase() + id.slice( 1 )
        let idWd = 'wd' + id.charAt( 0 ).toUpperCase() + id.slice( 1 )
        let idSearch = "search_"+idField[0]
        let height = 500
        let multiSelectObject
        if(customMultiSelect == "multiselect"){
            let idFieldMultiSelect = []
            idField.forEach(function(itemId){
                idFieldMultiSelect.push(itemId+'multiselect')
            })
            multiSelectObject = this.lovField(id+'multiselect', idFieldMultiSelect, el, type, customInputCols, true)
        }
        if(customMultiSelect == true){
            height = 550
        }
        let lovWind = {
            "view": "window", "id": idWd, "position": "center", "height": height, "autoWidth": true,
            "modal": true, "move": true, "scroll": "xy",
            "head": {
                "view": "toolbar", "elements": [{cols:[
                    {},
                    {
                        view: "icon", icon: "wxi-close", hotkey:'esc',click: function () {
                            $$(idSearch).setValue("")
                            $$(idSearch).refresh()
                            $$(idTb).eachColumn(function(id, col){
                                var filter = this.getFilter(id);
                                if (filter){
                                    if (filter.setValue) filter.setValue("") 
                                    else filter.value = ""; 
                                }
                            });
                            
                            $$(idTb).filterByAll();
                            
                            window.winActiveBlock['focusNow'] = window.winActiveBlock['lastFocus']
                            window.winActiveBlock['lastFocus'] = ""
                            if($$(window.winActiveBlock['focusNow']).config.view=="form"){
                                webix.UIManager.setFocus($$(window.winActiveBlock['focusNow']));
                            }else if($$(window.winActiveBlock['focusNow']).config.view=="datatable"){
                                if(!customMultiSelect){
                                    $$(window.winActiveBlock['focusNow']).select(window.winActiveCell.pos.row,window.winActiveCell.pos.column, false)
                                    $$(window.winActiveBlock['focusNow']).editStop();
                                }
                                webix.UIManager.setFocus($$(window.winActiveBlock['focusNow']));
                            }
                            
                            $$( idWd ).hide();
                            window.winOpenPopUp = "closed";
                            // webix.UIManager.setFocus($$(window.winActiveBlock['focusNow']));
                        },
                    }
                ]}]
            },
            "body": {
                rows:[ 
                    {
                        view:"search", 
                        id:idSearch,
                        placeholder:"Press enter to search data ...",
                        tooltip:"Search data without enter will search data that have already loaded, press enter to search all data.",
                        on:{
                            onTimedKeyPress:function(){
                                var text = this.getValue().toLowerCase();
                                var table = $$(idTb);
                                var columns = table.config.columns;
                                table.filter(function(obj){
                                    for (var i=0; i<columns.length; i++){
                                        if (!obj[columns[i].id]) continue;
                                        if (obj[columns[i].id].toString().toLowerCase().indexOf(text) !== -1) return true;
                                    }
                                    return false;
                                })
                            },
                            onKeyPress:function(code,e){
                                if(code==40){
                                    // // $$(idTb).select($$(idTb).getFirstId());
                                    webix.UIManager.setFocus( $$(idTb) );
                                    $$(idTb).select($$(idTb).getFirstId());
                                }
                            },
                            onEnter:function(){
                                let data = {"offset":0, "search":this.getValue()}
                                // 
                                if(winConfigForm[getBlockItem(idField[0])]['LOV_API'] != undefined){
                                    if(winConfigForm[getBlockItem(idField[0])]['LOV_API'][idField[0]]['DATA']!=undefined){
                                        if(Array.isArray(winConfigForm[getBlockItem(idField[0])]['LOV_API'][idField[0]]['DATA'])){
                                            winConfigForm[getBlockItem(idField[0])]['LOV_API'][idField[0]]['DATA'].forEach(function(idGetValue){
                                                data[idGetValue] = getItemValue(idGetValue)
                                            })
                                        }else if(typeof(winConfigForm[getBlockItem(idField[0])]['LOV_API'][idField[0]]['DATA'])=="object"){
                                            Object.keys(winConfigForm[getBlockItem(idField[0])]['LOV_API'][idField[0]]['DATA']).forEach(function(idItem){
                                                data[idItem] = winConfigForm[getBlockItem(idField[0])]['LOV_API'][idField[0]]['DATA'][idItem]
                                            })
                                        }
                                    }
                                }
                                $$(idTb).clearAll()
                                $$(idTb).define("offsetNow",0)
                                $$(idTb).define("scrollCondition",true)
                                // $$(idWd).disable()//enable
                                // $$(idWd).showProgress({type:"icon",hide:false});//loading
                                if(winConfigForm[getBlockItem(idField[0])]['LOV_API']!=undefined){
                                    let paramLOV = webix.copy(winConfigForm[getBlockItem(idField[0])]['LOV_API'][idField[0]])
                                    paramLOV["DATA"] = data
                                    restapi.restApiLov(paramLOV)
                                }else{
                                    restapi.restApiLov({"ITEM_ID":idField[0],"TABLE_ID":idTb,"DATA":data, "WD_ID":idWd})
                                }
                                
                            }
                        }
                    },
                    DATATABLES_LOV.CREATEDATATABLELOV( idTb, tableEl, idField, type, idSearch, idWd, customInputCols, customMultiSelect),

                ]
            },
            "on":{
                onShow:function(){

                    if(window.winActiveBlock['lastFocus']=='' && window.winActiveBlock['lastFocus']!=idWd){
                        window.winActiveBlock['lastFocus'] = window.winActiveBlock['focusNow']
                        window.winActiveBlock['focusNow'] = idWd
                    }
                    if($$(winActiveBlock['focusNow']).config.view == "form"){
                        window.winActiveBlock['lastFocus'] = window.winActiveBlock['focusNow']
                        window.winActiveBlock['focusNow'] = idWd
                    }
                    // else if(window.winActiveBlock['lastFocus']!=='' && window.winActiveBlock['lastFocus']!=idWd){
                    //     window.winActiveBlock['lastFocus'] = window.winActiveBlock['focusNow']
                    //     window.winActiveBlock['focusNow'] = idWd
                    //     
                    // }
                    // 
                    if(winConfigForm[getBlockItem(idField[0])]['LOV_API']!=undefined){
                        // webix.extend($$(idTb), webix.ProgressBar);
                        $$(idTb).disable()
                        $$(idTb).clearAll()
                        // $$(idTb).showProgress({hide:false});
                        let paramLOV = webix.copy(winConfigForm[getBlockItem(idField[0])]['LOV_API'][idField[0]])
                        let newDataDict = {}
                        if(paramLOV["DATA"]!=undefined){
                            if(Array.isArray(paramLOV["DATA"])){
                                paramLOV['DATA'].forEach(function(idGetValue){
                                    newDataDict[idGetValue] = getItemValue(idGetValue)
                                })
                                paramLOV['DATA'] = newDataDict
                            }else if(typeof(paramLOV["DATA"])=="object"){
                                Object.keys(paramLOV["DATA"]).forEach(function(idItem){
                                    newDataDict[idItem] = paramLOV["DATA"][idItem]
                                })
                                paramLOV['DATA'] = newDataDict
                            }
                            
                        }
                        
                        restapi.restApiLov(paramLOV)
                        // webix.delay(function(){
                        //     $$(idTb).showProgress({hide:true});
                        // }, null, null, 1000);
                        
                        
                        $$(idTb).enable()
                    }
                    $$(idTb).refresh()
                    $$(idSearch).focus();
                    window.winOpenPopUp = "open";
                    $$(menuId).disable()//enable
                },
                onHide:function(){
                    window.winOpenPopUp = "closed";
                    $$(menuId).enable()//enable
                    if(customMultiSelect){
                        let blockMultiRow
                        Object.keys(winConfigForm).forEach(function(block){
                            if(winConfigForm[block]["LOV_API"]!= undefined){
                                if(Object.keys(winConfigForm[block]["LOV_API"]).includes(idField[0])){
                                    blockMultiRow = block
                                }
                            }
                        })
                        $$(blockMultiRow).detachEvent("onAfterAdd")
                        window.winActiveBlock.focusNow = blockMultiRow
                    }
                },
            }
        }
        if(customMultiSelect && customMultiSelect!="multiselect"){

            lovWind.body.rows.push({
                view:"",
                height:70,
                padding:{top:15,right:10,left:10,bottom:10},
                css:{'background-color': "#F4F5F9"},
                position:"right",
                cols:[{},
                    BUTTON.CUSTOMBUTTON({ ITEM_ID: "clear"+id, LABEL: "Clear Selected" }, { CUSTOM_CLICK: function(){$$(idTb).unselectAll(); $$("clear"+id).blur()} }),
	                BUTTON.CUSTOMBUTTON({ ITEM_ID: "generate"+id, LABEL: "Add", CUSTOM_WIDTH:100 }, { CUSTOM_CLICK: function(){
                        let generate = []
                        let blockMultiRow
                        Object.keys(winConfigForm).forEach(function(block){
                            if(winConfigForm[block]["LOV_API"]!= undefined){
                                if(Object.keys(winConfigForm[block]["LOV_API"]).includes(idField[0])){
                                    blockMultiRow = block
                                }
                            }
                        })
                        let index = 0
                        let indexCol = 0
                        winMultiSelect[blockMultiRow].forEach(function(recordSelected){
                            generate.push({})
                            
                            $$(idTb).config.columns.forEach(function(column){
                                generate[index][idField[indexCol].split("multiselect")[0]] = recordSelected[column.id]
                                generate[index]["phidprogram"] = "0"
                                indexCol +=1
                            })
                            indexCol = 0
                            index +=1
                        })

                        generate.forEach(function(record){
                            addDataRecordDt({"BLOCK":blockMultiRow,"FOCUS":"last","DATA":record})
                        })
                        $$(idWd).hide()
                    } }),
                ]
            })
        }

        if(multiSelectObject){
            let returnVal = []
            returnVal.push(lovWind)
            returnVal.push(multiSelectObject)
            
            return returnVal
        }
        return lovWind
    }
}


class popUpWindowForm {
    
    /**
    * Membuat window LOV secara dinamis.
    * idWd adalah id window
    * idTb adalah id datatable
    * tableEl adalah element column pada datatable
    * @param id adalah nama lov yang akan digunakan sebagai idWd dan idTb
    * @param el adalah nama2 header tabel 
    */
    windowForm( id, elements, customHeight) {
        let idForm = 'wdPopUpForm' + id.charAt( 0 ).toUpperCase() + id.slice( 1 )
        let idWd = 'wdPopUp' + id.charAt( 0 ).toUpperCase() + id.slice( 1 )
        let customHeightWd = customHeight || window.innerHeight/1.2
        let popupwindow = {
            "view": "window", "id": idWd, "position": "center", "height":customHeightWd, "autoWidth": true,
            "modal": true, "move": true, "scroll": "xy",
            "head": {
                "view": "toolbar", "elements": [{cols:[
                    {},
                    {
                        view: "icon", icon: "wxi-close", hotkey:'esc',click: function () {
                            
                            window.winActiveBlock['focusNow'] = window.winActiveBlock['lastFocus']
                            window.winActiveBlock['lastFocus'] = ""
                            $$( idWd ).hide();
                            window.winOpenPopUp = "closed";
                            statPopUpWd = false
                        },
                    }
                ]}]
            },
            "body": {
                view:"scrollview", 
                id:"scrollview_"+idWd, 
                scroll:"xy", 
                height: window.innerHeight/1.8, 
                width: document.body.scrollWidth*0.7,
                body:{
                    rows:[ 
                        {
                            view:"form",
                            id:idForm,
                            elements:elements
                        }
                    ]
                }
            },
            "on":{
                onShow:function(){
                    window.winOpenPopUp = "open";
                    statPopUpWd = true
                }
            }
        }
        return popupwindow
    }
}
let lov = new Lov()
let wdForm = new popUpWindowForm()