TEMPLATE_HOME = '''

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
    <link rel="stylesheet" type="text/css" href="static/webix/webix.css">
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
    <link rel="stylesheet" href="https://hocdnoden0201.sat.co.id/css-dev/style.css" type="text/css">
    <script src="https://hocdnoden0201.sat.co.id/video-tutorial/panduan_oden.js"></script>

</head>
<body>
    
    <script>
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
            if (widthWindow < 1366){
                $$("$sidebar1").collapse();
                $$("$sidebar1").refresh();
            }
            else if (widthWindow >= 1366){
                $$("$sidebar1").expand()
                $$("$sidebar1").refresh();
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
                                    // multilanguage requirement
                                    /*{
                                        id:"comboMultiLanguage",
                                        view:"combo", 
                                        label: '', 
                                        options:[{id:"ID", value:"Indonesia"}],
                                        width: 120,
                                        disable:true
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
                                            onAfterSelect:function(id){
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
            $$("filterSidebar").attachEvent("onTimedKeyPress",function(){
            $$("$sidebar1").filter("#value#",this.getValue());
                if(this.getValue() == ""){
                    $$("$sidebar1").closeAll();
                }
            })
            $$("$sidebar1").toggle_ = $$("$sidebar1").toggle
            $$("$sidebar1").toggle = function() {
                $$("$sidebar1").toggle_()
                $$("$sidebar1").refresh()
            }
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
        })

        webix.event(window,"resize",function(){
            resizeSideBar()
        });

    </script>   

</body>

</html>

'''
