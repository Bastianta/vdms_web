TEMPLATE_MENU = '''

<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>[APP_NAME]</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script type="text/javascript" src="static/webix/webix.min.js"></script>
    <link rel="stylesheet" type="text/css" href="static/webix/webix.min.css">
    <link rel="shortcut icon" href="https://hocdnoden0201.sat.co.id/images/iconalfamart.jpg">
    <link rel="stylesheet" type="text/css" media="screen" href="static/webix/skins/materialdesignicon.css" /> 
    <script src="[URL_CDN]/element.js"></script>
    <script src="[URL_CDN]/lov.js"></script>
    <script src="[URL_CDN]/restApi.js"></script>
    <script src="[URL_CDN]/form.js"></script>
    <script src="[URL_CDN]/layouts.js"></script>
    <script src="[URL_CDN]/datatable.js"></script>
    <script src="[URL_CDN]/multiview.js"></script>
    <script src="https://hocdnoden0201.sat.co.id/moment.min.js"></script>
    <link rel="stylesheet" href="https://hocdnoden0201.sat.co.id/css/style.css" type="text/css">
    <script src="https://hocdnoden0201.sat.co.id/video-tutorial/panduan_oden.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.12.313/pdf.min.js"></script>
</head>
<body>

    <style>
        .webix_inp_label {
            white-space: normal!important;
            word-wrap: break-word;
            overflow: visible;
            display: block;
            text-align: right !important;
        }

        .webix_view.webix_control.webix_el_tabbar {
            border-radius: 10px !important;
        }

        .webix_all_tabs .webix_item_tab {
            border-radius: 10px !important;
        }

        .webix_view.webix_toolbar.webix_layout_toolbar {
            border-radius: 10px !important;
        }

        .webix_view .webix_layout_line {
            margin-bottom: -4px !important;
        }

        .webix_view .webix_list {
            border-radius: 10px !important;
        }

        .webix_view .webix_multiview {
            border-radius: 10px !important;
        }

        .webix_sidebar.webix_dark {
            border-bottom-right-radius: 10px !important;
            border-bottom-left-radius: 10px !important;
        }
        
        .center_checkbox_datagrid {
            text-align: center !important;
        }
    </style>
    
    <script>
        window.winLayout_v2 = true

        // multilanguage requirement
        //[tagVarAlwaysUpdateMultiLanguage]
        //[tagJSONMultiLanguage]
        // multilanguage requirement

        if ( screen.width < 450 ) {
            var viewport = document.querySelector( "meta[name=viewport]" );
            viewport.parentNode.removeChild( viewport );

            var newViewport = document.createElement( "meta" );
            newViewport.setAttribute( "name", "viewport" );
            newViewport.setAttribute( "content", "width=500" );
            document.head.appendChild( newViewport );
        }

        function zoom() {
            document.body.style.zoom = "90%" 
        }
        function setWidthSizeByPercent(size){
            let widthWindow = document.body.offsetWidth;
            return (size / 100) * widthWindow
        }
        function setWidthSize(size, fullSize){
            return setWidthSizeByPercent((size / fullSize) * 100)
        }
        function setHeightSizeByPercent(size){
            let heightWindow = window.screen.height;
            return (size / 100) * heightWindow
        }
        function setHeightSize(size, fullSize){
            return setHeightSizeByPercent((size / fullSize) * 100)
        }
        function resizeSideBar(){
            widthWindow = document.body.offsetWidth;
            $$("$sidebar1").refresh();
            if (widthWindow < 1366){
                $$("$sidebar1").collapse();
            }
            else if (widthWindow >= 1366){
                $$("$sidebar1").expand()
            }
            if (widthWindow < 800){
                $$("textApp").hide();
            }
            else if (widthWindow >= 800){
                $$("textApp").show()
            }
        }
        webix.UIManager.addHotKey("Ctrl+M", function() {
        });

        if (!webix.env.touch && webix.env.scrollSize)
            webix.CustomScroll.init();

        [contentCustom]
        
        webix.ui(
            {
                id:"app",
                scroll:true,
                rows:[
                    
                    {   
                        view: "toolbar", 
                        padding:3,
                        height:55,
                        css: "backgroudHeader",
                        elements: [
                                    { view: "icon", type: "icon", icon: "mdi  mdi-menu",width: 37, align: "left", css: "toggle_webix", 
                                        click: function(){
                                            $$("$sidebar1").toggle();
                                            if($$("$sidebar1").config.collapsed){
                                                $$("filterSidebar").hide()
                                            }else{
                                                $$("filterSidebar").show()
                                            }
                                        }
                                    },
                                    { view: "label", label: "<img src='https://hocdnoden0201.sat.co.id/images/logo [COMPANY_CODE].png' style='height:90%;padding:2px;'>", width: 120 },                            
                                    { id:"textApp", view: "label", label: "<div style='font-size: 1.2em;'>[APP_NAME]</div>"},
                                    {},
                                    {
                                        view: 'template', id: 'btnPanduan', borderless: true, css: "oden-btnPanduan", template: `
                                            <button class="oden-panduan-btn" onclick="showAnimate('popUpJenisTraining')">
                                                <span style="font-weight:bold">Panduan Penggunaan Aplikasi</span> 
                                                <span style = "vertical-align: middle;">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="#FFFFFFFF" id="Bold" viewBox="0 0 24 24" width="14" height="14"><path d="M12,0A12,12,0,1,0,24,12,12.013,12.013,0,0,0,12,0Zm0,21a9,9,0,1,1,9-9A9.011,9.011,0,0,1,12,21Z"/><path d="M11.545,9.545h-.3A1.577,1.577,0,0,0,9.64,10.938,1.5,1.5,0,0,0,11,12.532v4.65a1.5,1.5,0,0,0,3,0V12A2.455,2.455,0,0,0,11.545,9.545Z"/><path d="M11.83,8.466A1.716,1.716,0,1,0,10.114,6.75,1.715,1.715,0,0,0,11.83,8.466Z"/></svg>
                                                </span>
                                        </button>`
                                    },
                                    // multilanguage requirement
                                    /*{
                                        id:"comboMultiLanguage",
                                        view:"combo", 
                                        label: '', 
                                        options:[optionsComboMultilanguage],
                                        width: 120
                                    },*/
                                    // multilanguage requirement
                                    {autowidth: true, view: "label", label: `[NIK_SSO]&nbsp;&nbsp;|&nbsp;&nbsp;[NAMA_SSO]       &nbsp;&nbsp;&nbsp;</span>`, align: "left",
                                    },
        
                                    {
                                        autowidth: true, view: "label", label: `<span class='webix_icon mdi mdi-logout'></span>`, css: "pointer_cursor", align: "left",
                                                on: {
                                                    onItemClick: function () {
                                                        webix.send("/",{'type':'LOGOUT'},'GET')
                                                    }
                                                }
                                    },
                                    {
                                        width:25
                                    },
                        ],   
                    },
                    {
                        cols:[
                            {
                                width:10,
                                css:{
                                    "background":"#EBEDF0"
                                }
                            },
                            {
                                css:{
                                    "background":"#EBEDF0",
                                    // "border-radius":"15px"
                                },
                                rows:[
                                    {
                                        height:10,
                                        css:{
                                            "background":"#EBEDF0"
                                        }
                                    },
                                    {
                                        css:{
                                            "background":"#4A4E58",
                                            "border-top-right-radius": "10px",
                                            "border-top-left-radius": "10px"
                                        },
                                        cols:[
                                            {width:15},
                                            {
                                                rows:[
                                                    {height:10},
                                                    {
                                                        id:"filterSidebar",
                                                        view:"search",
                                                        css:{
                                                            "color":"white",
                                                            "background":"#4A4E58",
                                                            "border-top-left-radius":"10px",
                                                            "border-top-right-radius":"10px"
                                                        },
                                                        placeholder:"    Search item on sidebar..."
                                                    },
                                                    {height:10},
                                                ]
                                            },
                                            {width:15}
                                        ]
                                    },
                                    {
                                        height:5,
                                        css:{
                                            "background":"#4A4E58"
                                        }
                                    },
                                    {
                                        view: "sidebar",
                                        width:340,
                                        collapsedWidth:50,
                                        multipleOpen:true,
                                        scroll:"xy",
                                        data: [sidebarCustom],
                                        autoHeight:true,
                                        css:"webix_dark",
                                        borderless:true,
                                        template: function(obj, common) {
                                            let level = obj.$level || 1;
                                            let padding = Math.min((level - 1) * 15);
                                            sidebar = $$("$sidebar1")
                                            let isCollapsed = sidebar.config.collapsed;
                                            if (isCollapsed) {
                                            return `<span style="text-align:center; display:block;">
                                                        <i class="${obj.icon} webix_sidebar_icon" style="font-size:20px;"></i>
                                                    </span>`;
                                            }
                                            if(level == 2){
                                                padding = 0
                                            }
                                            if(level > 3){
                                                padding += 15 * (level - 3)
                                            }
                                            let rightIcon = "";
                                            if (obj.data || obj.$count > 0) {
                                                const chevron = obj.open ? "wxi-angle-down" : "wxi-angle-left";
                                                rightIcon = `<span class="webix_sidebar_dir_icon webix_icon ${chevron}"
                                                style="position:absolute; right:5px; top:50%; transform:translateY(-50%);"></span>`;
                                            }

                                            return `
                                            <div style="position:relative; padding-left:${padding}px;">
                                                <span class="webix_sidebar_icon">
                                                    <i class="${obj.icon}" style="margin-right:8px;"></i>
                                                </span>
                                                <span class="webix_sidebar_item_text">${obj.value}</span>
                                                ${rightIcon}
                                            </div>
                                            `;
                                        },
                                        on:{
                                            onItemClick:function(id){
                                                let menuSelected = this.getItem(id)
                                                if(!menuSelected.href) return;
                                                webix.send(menuSelected.href,{'type':'VIEW','menuId':menuSelected.id},'GET')
                                            },
                                        },
                                    },
                                    {
                                        height:35,
                                        css:{
                                            "background":"#EBEDF0"
                                        }
                                    },
                                ]
                            },
                            content  
                        ]
                    },
                ]
            }
        )
        
        
        resizeSideBar()
        webix.ready(function () {
            let sidebar = $$("$sidebar1")
            let urlParams = new URLSearchParams(window.location.search);
            let menuId = urlParams.get('menuId');
            sidebar.toggle_ = sidebar.toggle
            sidebar.toggle = function() {
                sidebar.toggle_()
                sidebar.refresh()
            }
            try {
                let parentMenuId = sidebar.getParentId(menuId);
                while (parentMenuId) {
                  sidebar.open(parentMenuId);
                  parentMenuId = sidebar.getParentId(parentMenuId);
                }
                sidebar.select(menuId);
            } catch (error) {}

            sidebar.attachEvent("onAfterSelect", function(id){
                let menuSelected = this.getItem(id)
                if(!menuSelected.href) return;
                webix.send(menuSelected.href,{'type':'VIEW','menuId':menuSelected.id},'GET')
            })
        
            $$("filterSidebar").attachEvent("onTimedKeyPress",function(){
            $$("$sidebar1").filter("#value#",this.getValue());
                if(this.getValue() == ""){
                    $$("$sidebar1").closeAll();
                }
            })
            let menu = $$("$sidebar1").getPopup().queryView({view: "menu"})
			let observer = new MutationObserver(function (mutationsList, observer) {
			    for (let mutation of mutationsList) {
			        if (mutation.type === "childList") {
			            mutation.addedNodes.forEach(node => {
			                if (node.nodeType === 1) {
			                    let element_id = node.getAttribute("view_id")
			                    let element_role = node.getAttribute("role")
			                    if (element_role === "menubar" && node.classList.contains("webix_sidebar_popup_list")) {
			                        let submenu = $$(element_id)
			                        if (Object.keys(submenu.data.pull).length >= 15) {
			                            submenu.define({
			                                height: 500,
			                                scroll: true,
			                                autoheight: false,
			                            })
			                        } else {
			                            submenu.define({
			                                scroll: false,
			                                autoheight: true,
			                            })
			                        }
			                        submenu.resize()
			                        node.style.width = "auto"
			                    }
			                }
			            })
			        }
			    }
			})
			
			menu.define({
			    height: 500,
			    scroll: true,
			    autoheight: false
			})
			
			menu.resize()
			
			observer.observe(document.body, {
			    childList: true, subtree: true,
			})

            // multilanguage requirement
            /*$$("comboMultiLanguage").setValue("ID")
            
            $$("comboMultiLanguage").attachEvent("onChange", function(newValue, oldValue, config){
                winMultilanguage.old = oldValue
                winMultilanguage.target = newValue
                setMultiLanguage(oldValue, newValue)
            });
            $$("comboMultiLanguage").setValue([DEFAULT_MULTILANGUAGE])

            winRestApi = extendFunction(winRestApi, setMultiLanguage)
            */
            // multilanguage requirement
            addEventEnterDatagrid()
            hideColumnsDatagrids()
        })

        webix.extend($$(menuId), webix.ProgressBar);
        $$(menuId).showProgress({type:"icon",hide:false});//loading
        $$(menuId).disable()//enable

        webix.event(window,"resize",function(){
            resizeSideBar()
        });
        
        if(renderLov()){
            renderLov().forEach(function (objLov) {
                if (Array.isArray(objLov)) {
                    objLov.forEach(function (obj) {
                        webix.ui(obj);
                    })
                } else {
                    webix.ui(objLov);
                }
            })
        }

        if($$("prev")!=undefined){
            webix.event($$("prev").$view, "mousemove", function(e){
            if(!winPrevRecord){
                winPrevRecord = true
            }
            });
            
            webix.event($$("prev").$view, "mouseout", function(e){
                if(winPrevRecord){
                    winPrevRecord = false
                }
            });
        }

        if($$("next")!=undefined){
            webix.event($$("next").$view, "mousemove", function(e){
                if(!winNextRecord){
                    winNextRecord = true
                    
                }
            });
            
            webix.event($$("next").$view, "mouseout", function(e){
                if(winNextRecord){
                    winNextRecord = false
                    
                }
            });
        }

        if($$("searchValue")!=undefined){
            webix.event($$("searchValue").$view, "click", function (e) {
                if (!winSearchRecord) {
                    winSearchRecord = true
                }else{
                    winSearchRecord = false
                }
            });
        }

        if($$("addValue")!=undefined){
            webix.event($$("addValue").$view, "mousemove", function(e){
                if(!winAddRecord && !winAddData){
                    winAddRecord = true
                    
                }
            });
            
            webix.event($$("addValue").$view, "mouseout", function(e){
                if(winAddRecord){
                    winAddRecord = false
                    
                }
            });
        }

        if($$("deleteValue")!=undefined){
            webix.event($$("deleteValue").$view, "mousemove", function(e){
                if(!winDeleteRecord){
                    winDeleteRecord = true
                    
                }
            });
            
            webix.event($$("deleteValue").$view, "mouseout", function(e){
                if(winDeleteRecord){
                    winDeleteRecord = false
                    
                }
            });
        }

        if($$("clearBtn")!=undefined){
            webix.event($$("clearBtn").$view, "mousemove", function(e){
                if(!winClearResetRecord){
                    winClearResetRecord = true
                    
                }
            });
            
            webix.event($$("clearBtn").$view, "mouseout", function(e){
                if(winClearResetRecord){
                    winClearResetRecord = false
                    
                }
            });
        }
        
    </script>   

</body>

</html>

'''
