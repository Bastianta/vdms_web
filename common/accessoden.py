import time
def getMenu(companyId = "", nik = "", appCode = "") :
    """
    Fungsi getMenu ini digunakan untuk mendapatkan menu berdasarkan companyId, nik, appCode

    :param companyId: id dari perusahaan
    :param nik: nik dari karyawan
    :param appCode: kode dari aplikasi
    :type companyId: str
    :type nik: str
    :type appCode: str
    :return:
    :rtype: bool, dict
    - Example return:
        > status :
            - True : sukses mendapatkan menu
            - False : gagal mendapatkan menu
        > data sesuai api menu
            {'data':
                {'datetime': '29-11-22 03:54:05:619296',
                'menu_id': [['sample1', 'sample1', '']],
                'msg': 'success', 'success': True}
            }
    """
    status = False
    data = {'company_code' : companyId,'nik': nik, 'app_code': appCode}

    saltedData = saltedhash.create(globalVar.APP_ID, data)
    saltedData = saltedData.get("data", "")
    if saltedData != "":
        try:
            """
            Get api get_menu di server sso verify (IP internal)
            """
            beginGetMenu = time.time()
            # print("getMenu =====", beginGetMenu, "=====")
            response = requests.get(f'{globalVar.URL_SERVER_VERIFY}/get_menu?data={saltedData}')
            endGetMenu = time.time()
            print("getMenu =====", endGetMenu-beginGetMenu, "=====")
            dataResponse = json.loads(response.text)
            status, code, data = ServerRequest.validate(dataResponse)
            print(42,data)
            dataTemp = json.loads(data.get('data', dict()))
            data.update({'data': dataTemp})
            data.pop('appId')
            data.pop('datetime')
            data.pop('responsecode')
            data.pop('saltedHash')
            data.pop('status')
            Log.info(f'{status} | {code} | {nik} | {data}')
            return status, data
        except Exception as exp:
            Log.error(f'ERROR MENDAPATKAN MENU | {exp} |')
            return status, data
    else:
        Log.warning(f'{nik} | DATA MENU TIDAK DITEMUKAN | GAGAL SALTED DATA | ')
        return status, data

def getMenuAccess(companyId, nik, appCode, menuId) :
    """
    Fungsi getMenuAccess ini digunakan untuk mendapatkan hak akses menu berdasarkan
    companyId, nik, appCode, menuId

    :param companyId: id dari perusahaan
    :param nik: nik dari karyawan
    :param appCode: kode dari aplikasi
    :type companyId: str
    :type nik: str
    :type appCode: str
    :return:
    :rtype: bool, dict
    - Example return:
        > status :
            - True : sukses mendapatkan akses menu
            - False : gagal mendapatkan akses menu
        > data sesuai api akses menu
            {'data':
                {'branch': ['NZ01', 'MZ01', ... ],
                'msg': 'success',
                'short_desc': 'Y',
                'status_access':
                    {'delete': 'Y',
                    'insert': 'Y',
                    'update': 'Y'},
                'success': True}
            }
    """
    status = False
    data = {'company_code' : companyId,'nik': nik, 'app_code': appCode,'menu_id': menuId}

    saltedData = saltedhash.create(globalVar.APP_ID, data)
    saltedData = saltedData.get("data", "")
    if saltedData != "":
        try:
            """
            Get api get_menu_access di server sso verify (IP internal)
            """
            beginGetMenuAccess = time.time()
            # print("getMenuAccess =====", beginGetMenuAccess, "=====")
            response = requests.get(f'{globalVar.URL_SERVER_VERIFY}/get_menu_access?data={saltedData}')
            endGetMenuAccess = time.time()
            print("getMenuAccess =====", endGetMenuAccess-beginGetMenuAccess, "=====")
            dataResponse = json.loads(response.text)
            status, code, data = ServerRequest.validate(dataResponse)
            dataTemp = json.loads(data.get('data', dict()))
            data.update({'data': dataTemp})
            data.pop('appId')
            data.pop('datetime')
            data.pop('responsecode')
            data.pop('saltedHash')
            data.pop('status')
            Log.info(f'{status} | {code} | {nik} |  {data}')
            return status, data
        except Exception as exp:
            Log.error(f'{nik} | GAGAL REQUEST API MENU ACCESS | {exp} |')
            return status, data
    else:
        Log.warning(f'{nik} | DATA AKSES MENU | GAGAL SALTED DATA | |')
        return status, data


def odenAuthorize(sso,cookie,menuId):
    """
    Fungsi authorize ini digunakan untuk memvalidasi pengguna aplikasi dan mengembalikan data dari sso
    , menu dan hak akses menu dari pengguna yang masuk.

    :param sso: objek sso
    :param cookie: objek cookie
    :type sso: objek class sso
    :type cookie: str
    :return: status, data
    :rtype: bool, dict
    """
    """
    Output dari kondisi-kondisi yang ada:
        - Jika menu dari pengguna tidak ada (menuId is None), maka output berupa:
            > bool status (statusMenuAcess) keberhasilan mendapatkan menu dari getMenu 
            > dict data (kwargs) dari getMenu
        - Jika ada menu dari pengguna, maka output berupa:
            > bool status (statusMenuAcess) keberhasilan mendapatkan menu dari getMenuAccess
            > dict data (kwargs) dari getMenuAccess
        - Jika gagal validasi/autentikasi pengguna sso, maka output berupa:
            > bool status (statusMenuAcess) kegagalan validasi/autentikasi sso
            > dict data (kwargs) berisi key 'continue_url' value string url 
                yang nanti dimanfaatkan sebagai url tujuan menuju (redirect) ke halaman login sso
                di main
    """

    if globalVar.PRODUCTION_ODEN.upper() == "Y":
        """
        kondisi pengguna ada dalam tahap production (PRODUCTION_ODEN adalah Y)
        """
        # autentikasi sso dari cookie milik pengguna
        beginodenAuthorized = time.time()
        # print("odenAuthorized =====", beginodenAuthorized, "=====")
        dataVerify = sso.authenticate(cookie)
        endodenAuthorized = time.time()
        print("odenAuthorized =====", endodenAuthorized-beginodenAuthorized, "=====")
        statusMenuAccess = False

        if dataVerify[0] == True:
            """
            kondisi jika berhasil melakukan autentikasi sso
            """
            datas = dataVerify[1]
            attributes = datas.get('attributes')
            companyId = attributes.get("company_code", "")
            nik = datas.get("nik", "")
            appCode = globalVar.APP_ID
            """
            kondisi mendapatkan menu-menu
            """
            getListMenu = getMenu(companyId, nik, appCode)
            
            if getListMenu[0]:
                statusMenuAccess = True

            kwargs = {'attributes':attributes,'nik':nik}
            kwargs.update({'list_menu':getListMenu})
            print(179, menuId)
            if menuId is not None:
                """
                kondisi mendapatkan akses menu
                """
                statusMenuAccess, resultMenuAccess = getMenuAccess(companyId, nik, appCode, menuId)
                print(185,statusMenuAccess)
                print(186,resultMenuAccess)
                resultMenuAccess = resultMenuAccess.get("data", dict())
                kwargs.update({'access_menu': resultMenuAccess,'nik':nik,'menuId':menuId})
                message = f'{nik} | {statusMenuAccess} | {resultMenuAccess}'
                Log.info(message)

            return statusMenuAccess,kwargs
        else:
            """
            kondisi jika gagal melakukan autentikasi sso, maka return berupa dictionary dengan key 'continue_url' 
            dengan isi string url beserta parameter data menuju server sso
            > example :
                authData = odenAuthorize(sso,cookie,menuId)
                if authData[0] == False:
                    return redirect(authData[1]['continue_url'])
                kwargs = authData[1]
            """
            Log.warning('Gagal Autentikasi Ke Server SSO ')
            kwargs = {'continue_url': dataVerify[1]}

            return statusMenuAccess, kwargs
    
    else:
        """
        kondisi jika pengguna ada dalam tahap development (PRODUCTION_ODEN bukan Y)
        
        > True 
        > {'access_menu': 
            {'branch': ['MZ01', '1GZ1', ... ], 
            'msg': 'success', 
            'short_desc': 'Y', 
            'status_access': 
                {'delete': 'Y', 
                'insert': 'Y', 
                'update': 'Y'}, 
                'success': True}, 
            'attributes': 
                {'branch_code': 'Z001', 
                'company': 'SAT', 
                'company_code': '01', 
                'name': 'Guest Development Oden', 
                'present_store_code': 'Z001', 
                'section': 'C2271', 
                'tittle_code': 'C2271'}, 
                'message': 'Ada Session ID', 
                'nik': '2209116', 
                'list_menu': 
                    (True, 
                    {'data': 
                        {'datetime': '26-08-22 03:57:53:576864', 
                        'menu_id': 
                            [['MENU_DEV', 'List Menu', ''], 
                            ['MS_DETAIL', 'MS_DETAIL', 'MENU_DEV'], 
                            ['samplegenerate', 'samplegenerate', 'MENU_DEV'], 
                            ['sample2', 'sample2', 'MENU_DEV'], 
                            ['history_perjanjian_kerja', 'history_perjanjian_kerja', 'MENU_DEV'], 
                            ['sample1', 'sample1', 'MENU_DEV'], 
                            ['DATAGRID', 'DATAGRID', 'MENU_DEV'], 
                            ['sample3', 'sample3', 'MENU_DEV'], 
                            ['persetujuan_perjanjian_kerja', 'persetujuan_perjanjian_kerja', 'MENU_DEV'], 
                            ['FORM', 'FORM', 'MENU_DEV']], 
                        'msg': 'success', 
                        'success': True}
                        })
            }
        
        """
        import staticOdenMenu
        userAttributes = staticOdenMenu.kwargs
        userAttributes.update({'list_menu':staticOdenMenu.list_menu})
        
        return True, userAttributes