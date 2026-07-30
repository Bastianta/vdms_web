/*
    JS-Oden-Stable V.1
    Update : 2025-05-19
    Common Library - layout.js
        Update : 
            - New Layouting Oden (Form dan Datagrid)
*/

window.winLayout_v2 = false
var layoutContentObj = []
var winFormTitle = winFormTitle ? winFormTitle : "Master Detail"
var autoLayout = true

function heightCustom(words){
    let widthFormNameLabel = 500;
    let widthWords = webix.html.getTextSize(words).width
    if(widthWords <= widthFormNameLabel){
        return 60
    }else{
        return 80
    }
}

class Layout{

    indexLayout(){
        let output = {
            id:"indexLayout",
            view: "scrollview",
            scroll: false,
            body: {
                type:"space",
                css:{
                    "background-image":"url(../static/img/background.png)",
                    "background-position": "center",
                    "background-repeat": "no-repeat",
                    "background-size": "cover"
                }, 
                rows:[
                ]
            }
        }
        return output
    }
    baseLayout(blockItems){
        /**
            * Fungsi ini untuk membuat kerangka layouting tampilan Oden.
            * @param {list / array} blockItems
            * @return {dictionary / Object} output 
        */

        let output
        if(autoLayout==false){
            function getBlock(blockItems){
                let fixBlock = []
                blockItems.forEach(function(block){
                    if(block.view != undefined){
                        fixBlock.push(block)
                    }else if(block.viewCustom=='tabbar'){
                        fixBlock.push(block)
                    }else if(block.cols!=undefined){
                        let tempObj = {
                            type:"space",
                            borderless:true,
                            cols:[
                            ] 
                        }
                        block.cols.forEach(function(allBlockDatagrid){
                            let tempObjBlock = {
                                rows:[
                                ] 
                            }
                            tempObjBlock.rows.push({view:"template", type:"header", template:allBlockDatagrid[0], height:40})
                            tempObjBlock.rows.push({height:10})
                            tempObjBlock.rows.push(allBlockDatagrid[1][0])
                            tempObjBlock.rows.push(allBlockDatagrid[1][1])
                            tempObjBlock.rows.push(allBlockDatagrid[1][2])
                            tempObj.cols.push(tempObjBlock)
                        })
                        fixBlock.push(tempObj)
                    }
                    else{
                        if(block.rows!=undefined){
                            block.rows.forEach(function(rowBlock){
                                fixBlock.push(rowBlock)
                            })
                        }else{
                            block.forEach(function(itemBlock){
                                fixBlock.push(itemBlock)
                            })
                        }
                    }
                })
                fixBlock.push({})
                fixBlock.push({height:30})
                
                return fixBlock
            }
            /*
                Tampilan Layout Lama - Perlu Dihapus apabila sudah migrasi ke autolayout
            */
            output = {
                id:menuId,
                view: "scrollview",
                body: {
                    type:"space",
                    id:"a1",
                    rows:[
                        {
                            view:"toolbar",
                            id:"myToolbar",
                            borderless:true,
                            responsive:"a1",
                            height:heightCustom(winFormTitle),
                            cols:[
                                {
                                    responsive:"myToolbar",
                                    id:"formNameLabel",
                                    borderless:true,
                                    view:"template",
                                    template: "<h3>"+winFormTitle||0+"</h3>",
                                    width:(140+webix.html.getTextSize(winFormTitle).width),
                                },
                                {
                                    cols:[
                                        {},
                                        BUTTON.PREVBUTTON("prev"),//berubah
                                        BUTTON.NEXTBUTTON("next"),//berubah
                                        BUTTON.PREVBLOCKBUTTON("prevBlock"),//berubah
                                        BUTTON.NEXTBLOCKBUTTON("nextBlock"),//berubah
                                        BUTTON.SEARCHBUTTON("searchValue","/"),//berubah
                                        BUTTON.ADDVALUEBUTTON("addValue","addRowDb"),//berubah
                                        BUTTON.ADDROWDATABUTTON("addRowDb"),//berubah
                                        BUTTON.UPDATEVALUEBUTTON("updateValue"),//berubah
                                        BUTTON.DELETEBUTTON("deleteValue"),
                                        BUTTON.CLEARBUTTON("clearBtn")
                                    ]
                                },
                            ]
                        },
                        {
                            view: "scrollview",
                            minWidth:300,
                            borderless:true,
                            scroll: "y",
                            body:{
                                type:"space",
                                padding:{
                                    right:2, left:0, top:0
                                },
                                rows:getBlock(blockItems)
                            }
                        },
                    ]
                }
            }
        }else{
            winLayout_v2 = true
            function getBlock(blockItems){
                let fixBlock = []
                fixBlock.push(
                    {
                        id:"customObjAuto",
                        cols:[
                            {
                                id:"customColsAuto",
                                rows:[]
                            },
                            {}
                        ]
                    }
                )
                blockItems.forEach(function(block){
                    if(block.view != undefined){
                        layoutContentObj.push(block)
                        if(blockItems.length==1 && block.view=="form"){
                            let haveCustomWidth = false
                            let customWidthParam = 0
                            if(block['customWidthParam']!=undefined){
                                haveCustomWidth = true
                                customWidthParam = block['customWidthParam']
                            }
                            if (haveCustomWidth){
                                if(typeof(customWidthParam) == 'number' && !isNaN(customWidthParam)){
                                    block['width'] = customWidthParam
                                }else if(typeof(customWidthParam) == 'string'){
                                    block['width'] = window.innerWidth-380
                                }
                                fixBlock = []
                                fixBlock.push(block)
                            }else{
                                fixBlock[0]['cols'][0]['rows'].push(block)
                            }
                        }else{
                            fixBlock[0]['cols'][0]['rows'].push(block)
                        }
                    }else if(block.viewCustom=='tabbar'){
                        block['rows'][1]['cells'].forEach(function(objTabbar){
                            layoutContentObj.push(objTabbar['rows'])
                        })
                        block.rows.splice(1,0,{height:5})
                        fixBlock[0]['cols'][0]['rows'].push(block)
                    }else if(block.cols!=undefined){
                        block.cols.forEach(function(allBlockDatagrid){
                            fixBlock[0]['cols'][0]['rows'].push({view:"template", type:"header", template:allBlockDatagrid[0], height:40})
                            fixBlock[0]['cols'][0]['rows'].push({height:10})
                            fixBlock[0]['cols'][0]['rows'].push(allBlockDatagrid[1][0])
                            fixBlock[0]['cols'][0]['rows'].push(allBlockDatagrid[1][1])
                            fixBlock[0]['cols'][0]['rows'].push(allBlockDatagrid[1][2])
                        })
                    }else{
                        if(block.rows!=undefined){
                            block.rows.forEach(function(rowBlock){
                                fixBlock[0]['cols'][0]['rows'].push(rowBlock)
                                if(rowBlock.cols!=undefined){
                                    if(rowBlock.cols[2]['cells']!=undefined){
                                        rowBlock.cols[2]['cells'].forEach(function(objRowBlock){
                                            if(objRowBlock.rows.length>1){
                                                layoutContentObj.push(objRowBlock.rows)
                                            }else{
                                                layoutContentObj.push(objRowBlock.rows[0])
                                            }
                                        })
                                    }
                                }
                            })
                        }else{
                            layoutContentObj.push(block)
                            block.forEach(function(itemBlock){
                                fixBlock[0]['cols'][0]['rows'].push(itemBlock)
                            })
                        }
                    }
                    if(fixBlock[0]['cols']!=undefined){
                        fixBlock[0]['cols'][0]['rows'].push({height:10})
                    }
                })
                fixBlock.push({})
                fixBlock.push({height:30})
                return fixBlock
            }
            /*
                Tampilan Layout Baru
                Update:
                    Toolbar:
                        - Menjadi 2 bagian : Form Title dan Button Action
            */
            output = {
                id:menuId,
                view: "scrollview",
                body: {
                    type:"space",
                    id:"a1",
                    rows:[
                        {
                            id:"centeredContentLayout",
                            cols:[
                                {},
                                {
                                    id:"colsMasterToolbar",
                                    rows:[
                                        {   
                                            id:"colsToolbar1",
                                            cols:[
                                                {
                                                    view:"toolbar",
                                                    id:"myToolbar",
                                                    borderless:true,
                                                    height:heightCustom(winFormTitle),
                                                    cols:[
                                                        {
                                                            responsive:"myToolbar",
                                                            id:"formNameLabel",
                                                            borderless:true,
                                                            view:"template",
                                                            template: "<h3>"+winFormTitle||0+"</h3>",
                                                        },
                                                    ]
                                                },
                                            ]
                                        },
                                        {
                                            height:10
                                        },
                                        {
                                            id:"colsToolbar2",
                                            cols:[
                                                {
                                                    view:"toolbar",
                                                    id:"myToolbar2",
                                                    borderless:true,
                                                    height:heightCustom(winFormTitle),
                                                    cols:[
                                                        {
                                                            paddingX:10,
                                                            cols:[
                                                                BUTTON.PREVBUTTON("prev"),//berubah
                                                                BUTTON.NEXTBUTTON("next"),//berubah
                                                                BUTTON.PREVBLOCKBUTTON("prevBlock"),//berubah
                                                                BUTTON.NEXTBLOCKBUTTON("nextBlock"),//berubah
                                                                BUTTON.SEARCHBUTTON("searchValue","/"),//berubah
                                                                BUTTON.ADDVALUEBUTTON("addValue","addRowDb"),//berubah
                                                                BUTTON.ADDROWDATABUTTON("addRowDb"),//berubah
                                                                BUTTON.UPDATEVALUEBUTTON("updateValue"),//berubah
                                                                BUTTON.DELETEBUTTON("deleteValue"),
                                                                BUTTON.CLEARBUTTON("clearBtn"),
                                                                {}
                                                        ]},
                                                    ]
                                                },
                                            ]
                                        }
                                    ]
                                },
                                {}
                            ]
                        },
                        {
                            id:"scrollview_content_"+menuId,
                            view: "scrollview",
                            minWidth:300,
                            borderless:true,
                            scroll: "y",
                            body:{
                                type:"space",
                                padding:{
                                    right:2, left:0, top:0
                                },
                                rows:[
                                    {
                                        cols:[
                                            {},
                                            {
                                                rows:getBlock(blockItems)
                                            },
                                            {}
                                        ]
                                    }
                                ]
                            }
                        },
                    ]
                }
            }
        }
        return output
    }
    baseLayoutReport(blockItems){
        /**
            * Fungsi ini untuk membuat kerangka layouting tampilan Report yang memakai Oden.
            * @param {list / array} blockItems
            * @return {dictionary / Object} outputReport
        */

        let outputReport
        if(autoLayout==false){
            function getBlockReport(blockItems){
                let fixBlock = []
                blockItems.forEach(function(block){
                    if(block.view != undefined){
                        fixBlock.push(block)
                    }else{
                        block.forEach(function(itemBlock){
                            fixBlock.push(itemBlock)
                        })
                    }
                })
                fixBlock.push({cols:[BUTTON.PRINTBUTTON("printBtn",blockItems[0]['id']),BUTTON.CLEARBUTTONRPT("clearBtn",blockItems[0]['id']),[]]}) 
                return fixBlock
            }
            /*
                Tampilan Layout Lama - Perlu Dihapus apabila sudah migrasi ke autolayout
            */
            outputReport = {
                id:menuId,
                view: "scrollview",
                body: {
                    type:"space",
                    id:"a1",
                    rows:[
                        {
                            view:"toolbar",
                            id:"myToolbar",
                            responsive:"a1",
                            height:heightCustom(winFormTitle),
                            cols:[
                                {
                                    responsive:"myToolbar",
                                    id:"formNameLabel",
                                    borderless:true,
                                    view:"template",
                                    template: "<h3>"+winFormTitle||0+"</h3>",
                                    width:(70+webix.html.getTextSize(winFormTitle).width),
                                },
                                {
                                    cols:[
                                        {},
                                    ]
                                },
                            ]
                        },
                        {
                            view: "scrollview",
                            minWidth:300,
                            borderless:true,
                            scroll: "xy",
                            body:{
                                type:"space",
                                padding:{
                                    right:2, left:0, top:0
                                },
                                rows:getBlockReport(blockItems),
                                
                            }
                        },
                    ]
                }
            }
        }else{ 
            winLayout_v2 = true
            /*
                Tampilan Layout Baru
                Update:
                    - AutoAdjust form report
                    - Beberapa form perlu adjust dari developer untuk merapikan
            */
            function getBlock(blockItems){
                let fixBlock = []
                fixBlock.push(
                    {
                        id:"customObjAuto",
                        cols:[
                            {
                                id:"customColsAuto",
                                rows:[]
                            },
                            {}
                        ]
                    }
                )
                blockItems.forEach(function(block){
                    if(block.view != undefined){
                        layoutContentObj.push(block)
                        if(blockItems.length==1 && block.view=="form"){
                            let haveCustomWidth = false
                            let customWidthParam = 0
                            if(block['customWidthParam']!=undefined){
                                haveCustomWidth = true
                                customWidthParam = block['customWidthParam']
                            }
                            if (haveCustomWidth){
                                if(typeof(customWidthParam) == 'number' && !isNaN(customWidthParam)){
                                    block['width'] = customWidthParam
                                }else if(typeof(customWidthParam) == 'string'){
                                    block['width'] = window.innerWidth-380
                                }
                                fixBlock = []
                                fixBlock.push(block)
                            }else{
                                fixBlock[0]['cols'][0]['rows'].push(block)
                            }
                        }else{
                            fixBlock[0]['cols'][0]['rows'].push(block)
                        }
                    }else if(block.viewCustom=='tabbar'){
                        block['rows'][1]['cells'].forEach(function(objTabbar){
                            layoutContentObj.push(objTabbar['rows'])
                        })
                        block.rows.splice(1,0,{height:5})
                        fixBlock[0]['cols'][0]['rows'].push(block)
                    }else if(block.cols!=undefined){
                        block.cols.forEach(function(allBlockDatagrid){
                            fixBlock[0]['cols'][0]['rows'].push({view:"template", type:"header", template:allBlockDatagrid[0], height:40})
                            fixBlock[0]['cols'][0]['rows'].push({height:10})
                            fixBlock[0]['cols'][0]['rows'].push(allBlockDatagrid[1][0])
                            fixBlock[0]['cols'][0]['rows'].push(allBlockDatagrid[1][1])
                            fixBlock[0]['cols'][0]['rows'].push(allBlockDatagrid[1][2])
                        
                        })
                    }else{
                        if(block.rows!=undefined){
                            block.rows.forEach(function(rowBlock){
                                fixBlock[0]['cols'][0]['rows'].push(rowBlock)
                                if(rowBlock.cols!=undefined){
                                    if(rowBlock.cols[2]['cells']!=undefined){
                                        rowBlock.cols[2]['cells'].forEach(function(objRowBlock){
                                            layoutContentObj.push(objRowBlock)
                                        })
                                    }
                                }
                            })
                        }else{
                            layoutContentObj.push(block)
                            block.forEach(function(itemBlock){
                                fixBlock[0]['cols'][0]['rows'].push(itemBlock)
                            })
                        }
                    }
                    if(fixBlock[0]['cols']!=undefined){
                        fixBlock[0]['cols'][0]['rows'].push({height:10})
                    }
                })
                fixBlock.push({cols:[BUTTON.PRINTBUTTON("printBtn",blockItems[0]['id']),BUTTON.CLEARBUTTONRPT("clearBtn",blockItems[0]['id']),[]]})
                fixBlock.push({})
                fixBlock.push({height:30})
                return fixBlock
            }

            outputReport = {
                id:menuId,
                view: "scrollview",
                body: {
                    type:"space",
                    id:"a1",
                    rows:[
                        {
                            id:"centeredContentLayout",
                            cols:[
                                {},
                                {
                                    rows:[
                                        {   
                                            id:"colsToolbar1",
                                            cols:[
                                                {
                                                    view:"toolbar",
                                                    id:"myToolbar",
                                                    borderless:true,
                                                    height:heightCustom(winFormTitle),
                                                    cols:[
                                                        {
                                                            responsive:"myToolbar",
                                                            id:"formNameLabel",
                                                            borderless:true,
                                                            view:"template",
                                                            template: "<h3>"+winFormTitle||0+"</h3>",
                                                        },
                                                    ]
                                                },
                                            ]
                                        },
                                        {
                                            id:"colsToolbar2",
                                            hidden:true,
                                            cols:[
                                                {
                                                    view:"toolbar",
                                                    id:"myToolbar2",
                                                    borderless:true,
                                                    height:heightCustom(winFormTitle),
                                                    cols:[
                                                        {
                                                            paddingX:10,
                                                            cols:[
                                                                BUTTON.PREVBUTTON("prev"),//berubah
                                                                BUTTON.NEXTBUTTON("next"),//berubah
                                                                BUTTON.PREVBLOCKBUTTON("prevBlock"),//berubah
                                                                BUTTON.NEXTBLOCKBUTTON("nextBlock"),//berubah
                                                                BUTTON.SEARCHBUTTON("searchValue","/"),//berubah
                                                                BUTTON.ADDVALUEBUTTON("addValue","addRowDb"),//berubah
                                                                BUTTON.ADDROWDATABUTTON("addRowDb"),//berubah
                                                                BUTTON.UPDATEVALUEBUTTON("updateValue"),//berubah
                                                                BUTTON.DELETEBUTTON("deleteValue"),
                                                                BUTTON.CLEARBUTTON("clearBtn"),
                                                                {}
                                                        ]},
                                                    ]
                                                },
                                            ]
                                        }
                                    ]
                                },
                                {}
                            ]
                        },
                        {
                            id:"scrollview_content_"+menuId,
                            view: "scrollview",
                            minWidth:300,
                            borderless:true,
                            scroll: "y",
                            body:{
                                type:"space",
                                padding:{
                                    right:2, left:0, top:0
                                },
                                rows:[
                                    {
                                        cols:[
                                            {},
                                            {
                                                rows:getBlock(blockItems)
                                            },
                                            {}
                                        ]
                                    }
                                ]
                            }
                        },
                    ]
                }
            }
        }
        return outputReport
    }
}

function adjustBtn(dataBtn){
    Object.keys(dataBtn).forEach(function(id){
        if(dataBtn[id]==false){
            $$(id).define("hidden",true)
        }
    })
}

let layout = new Layout()