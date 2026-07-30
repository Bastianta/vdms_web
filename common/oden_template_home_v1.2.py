TEMPLATE_HOME_NAVBAR = '''
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
    <link rel="stylesheet" href="https://hocdnoden0201.sat.co.id/css/style.css" type="text/css">
    <script src="https://hocdnoden0201.sat.co.id/video-tutorial/panduan_oden.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.12.313/pdf.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;700&display=swap" rel="stylesheet">
</head>

<body>

    <style>
        html {
            background-color: #EBEDF0;
        }

        .container-menuid {
            animation: slideInUp 0.3s ease-out !important;

        }

        .transparent-header {
            border-bottom: 5px solid #EE2A32 !important;
            margin: 5px !important;
        }

        .user-menu-icon {
            cursor: pointer;
            font-size: 24px;
            color: #333;
            border: none;
        }

        .minimal-menu-button {
            background: transparent !important;
            color: #666 !important;
            font-weight: 400 !important;
            font-size: 13px !important;
            transition: all 0.2s ease !important;
            border: none;
            margin-left: 20px !important;
        }

        .minimal-menu-button:hover {
            border-color: #333 !important;
            color: #333 !important;
            border: none;
        }

        .minimal-menu-popup {
            background: none !important;
            box-shadow: none !important;
            border-radius: 2px !important;
            border: none;
        }

        .minimal-menu-list {
            font-family: 'Quicksand', sans-serif !important;
            font-size: 13px !important;
            font-weight: bold !important;
            border-radius: 2px !important;
        }

        .minimal-menu-list .webix_list_item {
            padding: 8px 16px !important;
            color: #666 !important;
            transition: all 0.15s ease !important;
            width: 200px !important;
            display: inline-block !important;
            vertical-align: top !important;
            border-radius: 2px !important;
        }

        .minimal-menu-list .webix_list_item:hover {
            background: linear-gradient(90deg, rgba(179, 14, 14, 1) 0%, rgba(255, 0, 0, 1) 100%);
            color: white !important;
            border-radius: 2px !important;
            font-weight: bold !important;
        }

        .minimal-menu-list .webix_selected {
            background: linear-gradient(90deg, rgba(179, 14, 14, 1) 0%, rgba(255, 0, 0, 1) 100%) !important;
            color: white !important;
            font-weight: bold !important;
        }

        .minimal-menu-list .webix_selected:hover {
            background: linear-gradient(90deg, rgba(179, 14, 14, 1) 0%, rgba(255, 0, 0, 1) 100%);
            color: white !important;
            font-weight: bold !important;
        }

        .container-menu-bar {
            background-color: white !important;
        }

        .horizontal-menu-bar {
            background: #EBEDF0 !important;
            padding: 5px !important;
            border-bottom: 1px solid #e0e0e0 !important;
            border-top: 1px solid #808080 !important;
            border-radius: 20px !important;
            padding: 0 !important;
            margin: 5px !important;
            margin-top: 1px !important;
            margin-right: 10px !important;
            margin-bottom: 25px !important;
            transition: all 0.5s ease !important;
            position: relative !important;
        }

        .horizontal-menu-bar:hover {
            height: 40px !important;
            border-radius: 0px !important;
        }
        .scroll-button {
            background: linear-gradient(135deg, #EE2A32, #d41e26) !important;
            color: white !important;
            border: none !important;
            width: 35px !important;
            height: 25px !important;
            border-radius: 8px !important;
            cursor: pointer !important;
            display: block !important;
            text-align: center !important;
            line-height: 30px !important;
            font-size: 18px !important;
            font-weight: bold !important;
            transition: all 0.3s ease !important;
            margin: 0 2px !important;
            padding: 0 !important;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
        }

        .scroll-button:hover {
            background: linear-gradient(135deg, #d41e26, #b31a1a) !important;
            transform: translateY(-2px) scale(1.05) !important;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3) !important;
        }

        .scroll-button:active {
            transform: translateY(0) scale(0.95) !important;
            transition: all 0.1s ease !important;
        }

        .horizontal-menu-item {
            padding: 0px !important;
            margin: 0px !important;
            padding-top: 2px !important;
            font-family: 'Quicksand', sans-serif !important;
            font-size: 14px !important;
            font-weight: bold !important;
            color: #333 !important;
            cursor: pointer !important;
            transition: all 0.2s ease !important;
            border-right: 3px solid #f0f0f0 !important;
            white-space: nowrap !important;
            display: inline-block !important;
            background-color: white !important;
            text-align: center !important;
        }

        .horizontal-menu-item:hover {
            background: linear-gradient(90deg, rgba(179, 14, 14, 1) 0%, rgba(255, 0, 0, 1) 100%) !important;
            font-weight: bold !important;
            color: white !important;
            transform: translateY(-1px) !important;
            box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3) !important;
        }

        .horizontal-menu-item-active {
            background: linear-gradient(90deg, rgba(179, 14, 14, 1) 0%, rgba(255, 0, 0, 1) 100%) !important;
            transform: translateY(0) !important;
            font-weight: bold !important;
            color: white !important;
            box-shadow: 0 2px 4px rgba(0, 123, 255, 0.4) !important;
        }

        .search-input {
            background: #EBEDF0 !important;
            border: none !important;
            height: 30px !important;
            font-size: 13px !important;
            color: #666 !important;
            padding: 0 10px !important;
            margin-top: 0px !important;
        }

        .toggle_webix {
            margin-left: 10px !important;
            margin-right: 10px !important;
        }

        .webix_inp_label {
            white-space: normal !important;
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

        .user-menu-icon {
            cursor: pointer;
            font-size: 24px;
            color: #333;
            border: none;
        }
        .btnNavbarOden .webix_icon{
            color: white !important;
        }
        .btnNavbarOden button.webix_icon_button::before{
            border-radius: 8px !important;
            background-color: transparent !important;
        } 
        .btnNavbarOden .webix_icon_button{
            background-color: transparent !important;
            border-radius: 8px !important;
            border: 2px solid #b31a1a !important;
            background-color: #b31a1a !important;
        }
        .btnNavbarOden .webix_el_box button:hover{
            background-color: white !important;
        } 
        .btnNavbarOden .webix_el_box button:hover > span.webix_icon{
            color: black !important;
        } 
        .btnNavbarOden .webix_el_box button{
            transition: all .3s ease !important;
        } 

        .minimal-menu-button {
            background: transparent !important;
            color: #666 !important;
            font-weight: 400 !important;
            font-size: 13px !important;
            transition: all .5s ease !important;
            border: none;
            margin-left: 20px !important;
        }

        .minimal-menu-button:hover {
            border-color: #333 !important;
            color: #333 !important;
            border: none;
        }

        .minimal-menu-popup {
            background: none !important;
            box-shadow: none !important;
            border-radius: 2px !important;
            border: none;
        }

        .minimal-menu-list .webix_list_item {
            padding: 8px 12px !important;
            border-bottom: 1px solid #f0f0f0 !important;
            transition: background-color 0.2s ease !important;
            margin: 0 !important;
        }

        .minimal-menu-list .webix_list_item:hover {
            background: linear-gradient(90deg, rgba(179, 14, 14, 1) 0%, rgba(255, 0, 0, 1) 100%);
            color: white !important;
            border-radius: 2px !important;
            font-weight: bold !important;
        }

        .minimal-menu-list .webix_list_item:last-child {
            border-bottom: none !important;
        }

        .toggle_webix {
            margin-left: 10px !important;
            margin-right: 10px !important;
        }

        /* Beautiful Results Styling */
        #results {
            height: 400px !important;
            overflow-y: auto;
            background: white;
            margin: -4px -12px !important;
        }

        .result-item {
            padding: 12px 16px;
            border-bottom: 1px solid #f5f5f5;
            cursor: pointer;
            transition: all 0.2s ease;
            background: white;
            position: relative;
            overflow: hidden;
        }

        .result-item:hover {
            background: linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%);
            border-left: 8px solid #EE2A32;
            box-shadow: 0 2px 8px rgba(0, 123, 255, 0.15);
        }

        .result-item:last-child {
            border-bottom: none;
            border-radius: 0 0 8px 8px;
        }

        .result-item:first-child {
            border-radius: 8px 8px 0 0;
        }

        .result-title {
            font-family: 'Quicksand', sans-serif;
            font-size: 14px;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 4px;
            line-height: 1.4;
        }

        .result-path {
            font-family: 'Quicksand', sans-serif;
            font-size: 12px;
            color: #7f8c8d;
            font-weight: 400;
            line-height: 1.3;
            opacity: 0.8;
        }

        .result-item:hover .result-title {
            color: #EE2A32;
            font-weight: 700;
        }

        .result-item:hover .result-path {
            color: #495057;
            opacity: 1;
        }

        /* Empty state styling */
        #results p {
            text-align: center;
            padding: 40px 20px;
            color: #6c757d;
            font-family: 'Quicksand', sans-serif;
            font-size: 14px;
            margin: 0;
            font-style: italic;
        }

        /* Scrollbar styling for results */
        #results::-webkit-scrollbar {
            width: 6px;
        }

        #results::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 3px;
        }

        #results::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 3px;
        }

        #results::-webkit-scrollbar-thumb:hover {
            background: #a8a8a8;
        }

        /* Animation for results appearing */
        .result-item {
            animation: slideInUp 0.3s ease-out;
        }

        @keyframes slideInUp {
            from {
                opacity: 0;
                transform: translateY(10px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .resultsContainer {
            min-height: 250px !important;
            border-radius: 0 0 15px 15px !important;
        }


        .headerPopUp {
            width: 500px !important;
            background-color: #EBEDF0 !important
                /* Untuk menempatkan di tengah halaman */
        }

        #searchMenuOden {
            width: 470px !important;
            font-size: 16px;
            padding: 15px;
            border: 1px solid #ccc;
            border-radius: 15px 15px 0 0;
            outline: none;
            /* Menghilangkan garis biru saat fokus */
            transition: all 0.3s ease;
        }

        /* Efek saat input fokus */
        #searchMenuOden:focus {
            border-color: #EE2A32;
            box-shadow: 0 0 5px #EE2A32;
        }

        .button-search {
            background-color: grey !important;
            color: white !important;
            font-weight: bold !important;
            margin-left: 10px !important;
        }
    </style>
    <script src="https://hocdnoden0201.sat.co.id/video-tutorial/panduan_oden.js"></script>

</head>

<body>

    <script>
        window.MASTER_MULTILANGUAGE_ACCESS = [MASTERMULTILANGUAGEACCESS]
        if (screen.width < 450) {
            var viewport = document.querySelector("meta[name=viewport]");
            viewport.parentNode.removeChild(viewport);

            var newViewport = document.createElement("meta");
            newViewport.setAttribute("name", "viewport");
            newViewport.setAttribute("content", "width=500");
            document.head.appendChild(newViewport);
        }

        function zoom() {
            document.body.style.zoom = "90%"
        }
        function setWidthSizeByPercent(size) {
            let widthWindow = document.body.offsetWidth;
            return (size / 100) * widthWindow
        }
        function setWidthSize(size, fullSize) {
            return setWidthSizeByPercent((size / fullSize) * 100)
        }
        function setHeightSizeByPercent(size) {
            let heightWindow = window.screen.height;
            return (size / 100) * heightWindow
        }
        function setHeightSize(size, fullSize) {
            return setHeightSizeByPercent((size / fullSize) * 100)
        }
        function resizeSideBar() {
            // Simplified for floating sidebar
        }

        webix.UIManager.addHotKey("Ctrl+M", function () {
        });

        if (!webix.env.touch && webix.env.scrollSize)
            webix.CustomScroll.init();

        [contentCustom]
        //sidebar or menubar requirement
        [tagsidebarnavbar]
        //sidebar or menubar requirement

        webix.ui(
            {
                id: "app",
                scroll: true,
                rows: [

                    {
                        view: "toolbar",
                        padding: 10,
                        height: 70,
                        css: "transparent-header",
                        elements: [
                            {
                                view: "icon", type: "icon", icon: "mdi  mdi-menu", width: 37, align: "left", css: "toggle_webix",
                                on: {
                                    onItemClick: function () {
                                        if ($$("containerMenuBar").isVisible()) {
                                            hideAnimate("containerMenuBar")
                                        } else {
                                            showAnimate("containerMenuBar")
                                        }
                                    }
                                }
                            },

                            { view: "label", label: "<img src='https://hocdnoden0201.sat.co.id/images/logo [COMPANY_CODE].png' style='height:80%;padding:2px;'>", width: 120 },
                            { id: "textApp", view: "label", label: "<div style='font-size: 1.2em;'>[APP_NAME]</div>" },
                            {},
                            {
                                id: "btnSettingMultilangOden",
                                view: "icon",
                                icon: "mdi mdi-translate",
                                width: 40,
                                css: "btnNavbarOden",
                                hidden:true,
                                click: function () {
                                    window.location.href = "/?type=VIEW&menuId=MULTILANGUAGE_ODEN";
                                }
                            }, 
                            {
                                id:"btnPanduanOden",
                                view: "icon",
                                icon: "mdi mdi-information-outline",
                                width: 40,
                                css: "btnNavbarOden",
                                tooltip:"How to use the application",
                                click: function () {
                                    showAnimate('popUpJenisTraining')
                                }
                            },
                            { width: 10 },
                            {
                                id:"btnProfileOden",
                                view: "icon",
                                icon: "mdi mdi-account-circle",
                                width: 40,
                                css: "user-menu-icon",
                                popup: {
                                    view: "popup",
                                    id: "userPopup",
                                    autowidth: true,
                                    autoheight: true,
                                    body: {
                                        view: "list",
                                        autowidth: true,
                                        autoheight: true,
                                        css: "minimal-menu-popup",
                                        data: [
                                            { id: "info", value: "[NIK_SSO]", icon: "mdi mdi-account" },
                                            { id: "nama", value: "[NAMA_SSO]", icon: "mdi mdi-account-outline" },
                                            { id: "company", value: "[COMPANY_SSO]", icon: "mdi mdi-account-outline" },
                                            { id: "jabatan", value: "[JABATAN_SSO]", icon: "mdi mdi-account-outline" },
                                            { id: "branch", value: "[BRANCH_SSO]", icon: "mdi mdi-account-outline" },
                                            { id: "logout", value: "Logout", icon: "mdi mdi-logout" }
                                        ],
                                        template: "<span class='webix_icon #icon#'></span> #value#",
                                        select: false,
                                        
                                        on: {
                                            onItemClick: function (id) {
                                                if (id === "logout") {
                                                    webix.send("/", { 'type': 'LOGOUT' }, 'GET');
                                                }
                                                $$("userPopup").hide();
                                            }
                                        }
                                    }
                                }
                            },
                            { autowidth: true, view: "label", label: `[NIK_SSO]` },
                            { width: 25 }
                        ],

                    },
                    {
                        id: "containerMenuBar",
                        css: "container-menu-bar",
                        cols: [
                            {
                                view: "template",
                                id: "searchBtn",
                                template: `<div class="custom-menu-button " id="" data-item-id="">🔍 PENCARIAN MENU...</div>`,
                                css: "horizontal-menu-item button-search",
                                width: 200,
                                borderless: true,
                                onClick: {
                                    "button-search": function (e, id) {
                                        console.log("onclick")
                                        let buttonRect = e.target.getBoundingClientRect();
                                        $$("resultsContainer").show({
                                            x: buttonRect.left,
                                            y: buttonRect.bottom + 5
                                        });
                                        const searchMenuOden = document.getElementById('searchMenuOden');
                                        searchMenuOden.focus();
                                    }
                                },
                            },
                            {
                                view: "scrollview",
                                id: "horizontalMenuBar",
                                scroll: "x",
                                autowidth: true,
                                height: 30,
                                css: "horizontal-menu-bar",
                                body: {
                                    cols: []
                                }
                            },
                            {
                                view: "template",
                                id: "scrollButtons",
                                template: `<div style="display: flex; gap: 2px;"><button class="scroll-button" onclick="scrollHorizontalMenu('left')">
                                    <span class="mdi mdi-arrow-left"></span></button><button class="scroll-button" onclick="scrollHorizontalMenu('right')"><span class="mdi mdi-arrow-right"></span></button></div>`,
                                width: 120,
                                height: 30,
                                borderless: true,
                                hidden: true
                            }
                        ]
                    },

                    content
                ]
            }
        )

        webix.ui({
            view: "popup",
            id: "myMenu",
            width: 200,
            autoheight: true,
            maxHeight: 400,
            css: "minimal-menu-popup",
            body: {
                view: "list",
                id: "menuList",
                tooltip: true,
                autoheight: true,
                scroll: "y",
                //data: [sidebarCustom],
                data: [sidebarCustom],
                css: "minimal-menu-list",
                template: function (obj) {
                    let arrow = obj.data && obj.data.length > 0 ? '<span class="mdi mdi-arrow-left"></span>' : "";
                    return `${obj.value}${arrow}`;
                },
                on: {
                    onItemClick: function (id) {
                        this.select(id);
                        let menuSelected = this.getItem(id);
                        if (menuSelected.data && menuSelected.data.length > 0) {
                            this.showSubmenu(id, menuSelected.data, 1);
                        } else if (menuSelected.href) {
                            webix.send(menuSelected.href, { 'type': 'VIEW', 'menuId': menuSelected.id }, 'GET');
                            this.closeAllMenus();
                        }
                    },
                }
            },
            on: {
                onHide: function () {
                    $$(menuId).enable()
                }
            }
        });

        webix.ui({
            view: "popup",
            id: "resultsContainer",
            css: "resultsContainer",
            minHeight: 250,
            maxWidth: 500,
            body: {
                padding: 0,
                rows: [
                    {
                        template: `<div class="headerPopUp">
                        <input placeholder="Masukkan Nama Menu..." id="searchMenuOden"  onkeyup="searchMenuOdenKeyDown(event,this)" type="text" value="" >
                    </div>`,
                        autoheight: true,
                        autowidth: true,
                    },
                    {
                        padding: 0,
                        template: `
                        <div id="results" style='overflow-x:hidden'> 
                            <p>🔍 Menu Tidak Ditemukan.</p>
                        </div>`,
                        id: "templateResult",
                        autoheight: true,
                        autowidth: true,
                        borderless: true
                    }
                ]
            }
        });

        // Reposition popup on window resize
        window.addEventListener('resize', function () {
            if ($$("resultsContainer") && $$("resultsContainer").isVisible()) {
                let searchBtn = document.getElementById('searchBtn');
                if (searchBtn) {
                    let buttonRect = searchBtn.getBoundingClientRect();
                    $$("resultsContainer").setPosition(buttonRect.left, buttonRect.bottom + 5);
                }
            }
        });



        // Method to populate horizontal menu with parent items as buttons
        window.populateHorizontalMenu = function (menuData) {
            let horizontalItems = [];

            // Add menu items
            let sizeHorizontalItems = 0
            menuData.forEach(function (item) {
                let itemWidth = item.value.length * 10
                if(itemWidth < 150){
                    itemWidth = 150
                }
                horizontalItems.push({
                    view: "template",
                    id: `menuOden${item.id}`,
                    template: `<div class="custom-menu-button" id="${item.id}" data-item-id="${item.id}">${item.value}</div>`,
                    css: "horizontal-menu-item",
                    width: (item.value.length * 10) < 150 ? 150 : (item.value.length * 10),
                    borderless: true,
                    minWidth: 150,
                    borderless: true,
                    data: item,
                    onClick: {
                        "horizontal-menu-item": function (e, id) {
                            let dom = this.getNode();
                            dom.classList.add("horizontal-menu-item-active");
                            let itemData = this.config.data;
                            if (itemData.data && itemData.data.length > 0) {
                                window.showSubmenu(e.target, itemData.data, itemData.id);
                            } else if (itemData.href) {
                                webix.send(itemData.href, { 'type': 'VIEW', 'menuId': itemData.id }, 'GET');
                            }
                        }
                    },
                });
            });

            // Add spacer only
            if (sizeHorizontalItems > window.innerWidth) {
                horizontalItems.push({ "width": 50, "css": { "background-color": "white" } });
            }

            let menuLayout = $$("horizontalMenuBar").getBody();
            menuLayout.define("cols", horizontalItems);
            menuLayout.reconstruct();
            if (sizeHorizontalItems > window.innerWidth) {
                $$("scrollButtons").show()
            }
            console.log("Horizontal menu populated");
        };

        // Auto-scroll function with smooth animation
        window.scrollHorizontalMenu = function (direction) {
            let scrollView = $$("horizontalMenuBar");
            let scrollState = scrollView.getScrollState();
            let currentScroll = scrollState.x || 0;
            let itemWidth = 150;
            let scrollAmount = itemWidth * 3;

            let targetScroll;
            if (direction === 'left') {
                targetScroll = Math.max(0, currentScroll - scrollAmount);
            } else {
                targetScroll = currentScroll + scrollAmount;
            }

            // Animate scroll with custom easing
            let startScroll = currentScroll;
            let distance = targetScroll - startScroll;
            let duration = 500; // 500ms animation
            let startTime = Date.now();

            function animateScroll() {
                let elapsed = Date.now() - startTime;
                let progress = Math.min(elapsed / duration, 1);

                // Easing function (ease-out-cubic)
                let easeProgress = 1 - Math.pow(1 - progress, 3);
                let currentPos = startScroll + (distance * easeProgress);

                scrollView.scrollTo(currentPos, 0);

                if (progress < 1) {
                    requestAnimationFrame(animateScroll);
                }
            }

            animateScroll();
        };

        // Populate horizontal menu after UI is created
        populateHorizontalMenu([sidebarCustom]);

        // Search functionality
        window.searchAndOpenMenu = function (searchValue) {
            if (!searchValue.trim()) return;

            function findAllMatches(menuData, path = []) {
                let matches = [];
                for (let item of menuData) {
                    let currentPath = [...path, item];

                    if (item.value.toLowerCase() === searchValue.toLowerCase()) {
                        matches.push(currentPath);
                    }

                    if (item.data && item.data.length > 0) {
                        matches = matches.concat(findAllMatches(item.data, currentPath));
                    }
                }
                return matches;
            }

            let allMatches = findAllMatches([sidebarCustom]);
            if (allMatches.length > 0) {
                allMatches.forEach((path, index) => {
                    setTimeout(() => openMenuPath(path), index * 100);
                });
            } else {
                webix.message("Menu item not found", "error");
            }
        };

        window.openMenuPath = function (path) {
            if (path.length === 0) return;

            // Close any existing popups
            if (window.activeSubmenu) {
                window.activeSubmenu.destructor();
            }

            // Find the horizontal menu button for the root item
            let rootItem = path[0];
            let rootButton = document.querySelector(`[data-item-id="${rootItem.id}"]`);

            if (!rootButton) return;

            // Open nested popups following the path
            let currentNode = rootButton;
            for (let i = 1; i < path.length; i++) {
                let item = path[i - 1];
                if (item.data && item.data.length > 0) {
                    window.showSubmenu(currentNode, item.data, item.id, i - 1);

                    // Wait for popup to render, then find next item
                    setTimeout(() => {
                        let submenuId = "submenu_" + (i - 1) + "_" + item.id;
                        let popup = $$(submenuId);
                        if (popup) {
                            let nextItem = path[i];
                            popup.select(nextItem.id);
                            let listNode = popup.getNode();
                            let nextButton = listNode.querySelector(`[webix_l_id="${nextItem.id}"]`);
                            if (nextButton) {
                                currentNode = nextButton;
                            }
                        }
                    }, 100 * i);
                }
            }
        };

        // Populate horizontal menu after UI is created
        populateHorizontalMenu([sidebarCustom]);

        webix.ready(function () {

            // Submenu functionality
            window.activeSubmenu = null;
            window.parentSelected = null;

            window.showSubmenu = function (parentNode, submenuData, parentId, level = 0) {
                // Don't close parent submenu if this is a nested level
                if (level === 0 && window.activeSubmenu) {
                    window.activeSubmenu.destructor();
                }

                let rect = parentNode.getBoundingClientRect();
                let submenuId = "submenu_" + level + "_" + parentId;

                webix.ui({
                    view: "popup",
                    id: submenuId,
                    width: 200,
                    autoheight: true,
                    maxHeight: 400,
                    css: "minimal-menu-popup",
                    body: {
                        view: "list",
                        autoheight: true,
                        scroll: "y",
                        data: submenuData,
                        tooltip: true,
                        css: "minimal-menu-list",
                        template: function (obj) {
                            let arrow = obj.data && obj.data.length > 0 ? '<span class="mdi mdi-arrow-right" style="margin-left:auto;"></span>' : "";
                            return `<div style='display:flex;align-items:center;'><span style='flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>${obj.value}</span>${arrow}</div>`;
                        },
                        on: {
                            onItemClick: function (id) {
                                this.select(id);
                                let menuSelected = this.getItem(id);
                                if (menuSelected.data && menuSelected.data.length > 0) {
                                    // Show sub-submenu to the right
                                    let itemNode = this.getItemNode(id);
                                    window.showSubmenu(itemNode, menuSelected.data, menuSelected.id, level + 1);
                                } else if (menuSelected.href) {
                                    webix.send(menuSelected.href, { 'type': 'VIEW', 'menuId': menuSelected.id }, 'GET');
                                    // Close all submenus
                                    if (window.activeSubmenu) window.activeSubmenu.hide();
                                }
                            }
                        }
                    },
                    on: {
                        onHide: function () {
                            let parentObj = parentSelected
                            if (parentObj && level == 0) {
                                parentSelected.classList.remove("horizontal-menu-item-active")
                            }
                        },
                        onShow: function () {
                            if (level == 0) {
                                parentSelected = parentNode.closest(".horizontal-menu-item")
                            }
                            let parentObj = parentSelected
                            if (parentObj && level == 0) {
                                parentSelected.classList.add("horizontal-menu-item-active")
                            }
                        }
                    }
                });

                let popup = $$(submenuId);
                // Position nested submenus to the right of parent
                if (level > 0) {
                    popup.show({ x: rect.right + 5, y: rect.top });
                    const dom = popup.getNode();
                    dom.classList.remove("oden-fadeOut");
                    dom.classList.add("oden-fadeIn");
                } else {
                    popup.show({ x: rect.left, y: rect.bottom + 5 });
                    const dom = popup.getNode();
                    dom.classList.remove("oden-fadeOut");
                    dom.classList.add("oden-fadeIn");
                    window.activeSubmenu = popup;
                    parentSelected = parentNode.closest(".horizontal-menu-item")
                }

                popup.getBody().sort("#value#", "asc");
            };
            webix.extend($$("menuList"), {
                activeMenus: [],
                showSubmenu: function (parentId, submenuData, level) {
                    console.log("showSubmenu called for:", parentId, "level:", level);
                    console.log("activeMenus:", this.activeMenus);

                    let parentObj;
                    if (level > 1) {
                        parentObj = $$(this.activeMenus[level - 1]).getBody();
                    } else {
                        parentObj = this;
                    }

                    console.log("parentObj:", parentObj);
                    let parentNode = parentObj.getItemNode(parentId);
                    console.log("parentNode found:", !!parentNode);

                    if (!parentNode) {
                        console.log("Node not found, using fallback position");
                        let fallbackRect = { right: 400, top: 100 };
                        var rect = fallbackRect;
                    } else {
                        var rect = parentNode.getBoundingClientRect();
                    }

                    console.log("rect:", rect);

                    // Close menus at this level and deeper
                    this.closeMenusFromLevel(level);

                    let submenuId = "submenu_" + level + "_" + parentId;
                    console.log("Creating submenu:", submenuId);

                    webix.ui({
                        view: "popup",
                        id: submenuId,
                        width: 200,
                        autoheight: true,
                        maxHeight: 400,
                        css: "minimal-menu-popup",
                        body: {
                            view: "list",
                            autoheight: true,
                            scroll: "y",
                            data: submenuData,
                            tooltip: true,
                            css: "minimal-menu-list",
                            template: function (obj) {
                                let arrow = obj.data && obj.data.length > 0 ? '<span class="mdi mdi-arrow-right" style="margin-left:auto;"></span>' : "";
                                return `<div style='display:flex;align-items:center;'><span style='flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>${obj.value}</span>${arrow}</div>`;
                            },
                            on: {
                                onItemClick: function (id) {
                                    this.select(id); // Select the clicked item
                                    let menuSelected = this.getItem(id);
                                    if (menuSelected.data && menuSelected.data.length > 0) {
                                        $$("menuList").showSubmenu(id, menuSelected.data, level + 1);
                                    } else if (menuSelected.href) {
                                        webix.send(menuSelected.href, { 'type': 'VIEW', 'menuId': menuSelected.id }, 'GET');
                                        $$("menuList").closeAllMenus();
                                    }
                                }
                            }
                        }
                    });
                    this.activeMenus[level] = submenuId;
                    $$(submenuId).show({ x: rect.right + 5, y: rect.top });
                },
                closeMenusFromLevel: function (level) {
                    for (let i = level; i < this.activeMenus.length; i++) {
                        if (this.activeMenus[i] && $$(this.activeMenus[i])) {
                            $$(this.activeMenus[i]).destructor();
                        }
                    }
                    this.activeMenus = this.activeMenus.slice(0, level);
                },

                closeAllMenus: function () {
                    this.closeMenusFromLevel(0);
                    $$("myMenu").hide();
                }
            });

            // Sort menu data alphabetically
            $$("menuList").sort("#value#", "asc");

        });
        if(window.MASTER_MULTILANGUAGE_ACCESS == 'N'){
            $$("$toolbar1").removeView("btnSettingMultilangOden")
        }else{
            $$("btnSettingMultilangOden").show()
        }
            

        webix.event(window, "resize", function () {
            // Responsive handling for floating sidebar
        });
        function searchMenuOdenKeyDown(e, element) {
            let value = element.value;
            let resultsDiv = document.getElementById('results');
            if (value == '') {
                resultsDiv.innerHTML = '<p>🔍 Menu Tidak Ditemukan.</p>'
                return;
            } else {
                if (value.length >= 2) {
                    searchMenu(value);
                }
            }
        }
        function searchMenu(p_searchValue) {

            function findAllMatches(menuData, path = []) {
                let matches = [];
                for (let item of menuData) {
                    let currentPath = [...path, item];

                    // Only add items that have href (actual menu items)
                    if (item.href != undefined) {
                        if (item.value.toLowerCase().includes(p_searchValue.toLowerCase())) {
                            matches.push({ item: item, path: currentPath });
                        }
                    }

                    if (item.data && item.data.length > 0) {
                        matches = matches.concat(findAllMatches(item.data, currentPath));
                    }
                }
                return matches;
            }

            function findParentMatches(menuData, p_searchValue, path = []) {
                let parentMatches = [];
                for (let item of menuData) {
                    let currentPath = [...path, item];

                    // If parent matches search term, add ALL children with href
                    if (item.value.toLowerCase().includes(p_searchValue.toLowerCase()) && item.data && item.data.length > 0) {
                        function addAllChildren(children, parentPath) {
                            children.forEach(child => {
                                let childPath = [...parentPath, child];
                                if (child.href != undefined) {
                                    parentMatches.push({ item: child, path: childPath });
                                }
                                if (child.data && child.data.length > 0) {
                                    addAllChildren(child.data, childPath);
                                }
                            });
                        }
                        addAllChildren(item.data, currentPath);
                    }

                    if (item.data && item.data.length > 0) {
                        parentMatches = parentMatches.concat(findParentMatches(item.data, p_searchValue, currentPath));
                    }
                }
                return parentMatches;
            }

            let directMatches = findAllMatches([sidebarCustom]);
            let parentMatches = findParentMatches([sidebarCustom], p_searchValue);

            let allMatches = [...directMatches];
            parentMatches.forEach(parentMatch => {
                if (!allMatches.some(match => match.item.id === parentMatch.item.id)) {
                    allMatches.push(parentMatch);
                }
            });
            displayResults(allMatches);

            if ($$("resultsContainer")) {
                showAnimate("resultsContainer")
            }
        }

        function displayResults(matches) {

            const resultsDiv = document.getElementById('results');
            if (!resultsDiv) {
                console.warn('Results div not found');
                return;
            }
            let size = 0;

            if (matches.length === 0) {
                resultsDiv.innerHTML = '<p>🔍 Menu Tidak Ditemukan.</p>';
                $$("resultsContainer").define("height", 120)
                $$("resultsContainer").resize()
                return;
            }

            let html = '';
            matches.forEach((match, index) => {
                let pathString = match.path.map(p => p.value).join(' <span class="mdi mdi-arrow-right"></span> ');
                let icon = match.item.icon || 'mdi mdi-file-document-outline';
                html += `
                    <div class="result-item" onclick="navigateToMenu('${match.item.href}', '${match.item.id}')" style="animation-delay: ${index * 0.05}s">
                        <div class="result-title">
                            <i class="${icon}" style="margin-right: 8px; color: #EE2A32;"></i>
                            ${match.item.value}
                        </div>
                        <div class="result-path">${pathString}</div>
                    </div>
                `;
            });
            if (matches.length < 5) {
                $$("resultsContainer").define("height", matches.length * 80 + 60) // 60 --> Height dari search input
                $$("resultsContainer").resize()
            } else {
                $$("resultsContainer").define("height", 460)
                $$("resultsContainer").resize()
            }
            resultsDiv.innerHTML = html;
        }

        function navigateToMenu(href, menuId) {
            if (href) {
                console.log(`Navigating to: ${href} (Menu ID: ${menuId})`);
                if ($$("resultsContainer")) {
                    hideAnimate("resultsContainer")
                }
                if ($$("menuSearchBox")) $$("menuSearchBox").setValue("");
                webix.send(href, { 'type': 'VIEW', 'menuId': menuId }, 'GET');
                webix.message("Loading menu...", "info", 2000);
            }
        }


    </script>

</body>

</html>
'''

TEMPLATE_HOME_SIDEBAR = '''

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
    <style>
        .btnNavbarOden .webix_icon{
            color: white !important;
        }
        .btnNavbarOden button.webix_icon_button::before{
            border-radius: 8px !important;
            background-color: transparent !important;
        } 
        .btnNavbarOden .webix_icon_button{
            background-color: transparent !important;
            border-radius: 8px !important;
            border: 2px solid #b31a1a !important;
            background-color: #b31a1a !important;
        }
        .btnNavbarOden .webix_el_box button:hover{
            background-color: white !important;
        } 
        .btnNavbarOden .webix_el_box button:hover > span.webix_icon{
            color: black !important;
        } 
        .btnNavbarOden .webix_el_box button{
            transition: all .3s ease !important;
        } 
    </style>
    <script>
        window.MASTER_MULTILANGUAGE_ACCESS = [MASTERMULTILANGUAGEACCESS]
        
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
                                    {
                                        id:"btnSettingMultilangOden",
                                        view: "icon",
                                        icon: "mdi mdi-translate",
                                        width: 40,
                                        css: "btnNavbarOden",
                                        hidden:true,
                                        click: function () {
                                            window.location.href = "/?type=VIEW&menuId=MULTILANGUAGE_ODEN";
                                        }
                                    },
                                    {
                                        id:"btnPanduanOden",
                                        view: "icon",
                                        icon: "mdi mdi-information-outline",
                                        width: 40,
                                        css: "btnNavbarOden",
                                        tooltip:"How to use the application",
                                        click: function () {
                                            showAnimate('popUpJenisTraining')
                                        }
                                    },
                                    {
                                        width:10
                                    },
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
        if(window.MASTER_MULTILANGUAGE_ACCESS == 'N'){
            $$("$toolbar1").removeView("btnSettingMultilangOden")
        }else{
            $$("btnSettingMultilangOden").show()
        }

        webix.event(window,"resize",function(){
            resizeSideBar()
        });

    </script>   

</body>

</html>

'''
