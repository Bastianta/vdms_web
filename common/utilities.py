"""
Update : 2023-09-05
Common Util Oden V3
Update :    - Ubah fungsi sendApiReport
            - fix uploader ke bucket
            - add extension csv
            - add baseAllowAllCharKeyboard
"""
import traceback

globalVar.CONN_RO = DatabaseRO(globalVar.DB_NAME)
if(globalVar.CONN_RO.status):
    pass
else:
    sys.exit()

allowOthers = [32] #SPASI

allowALFA = list(range(65,91))+allowOthers #ABC...

allowalfa = list(range(97,123))+allowOthers #abc...

allowNUM =  list(range(48,58))+allowOthers #123...

allowAlfaNum = allowALFA+allowalfa+allowNUM+allowOthers

baseAllowAllCharKeyboard = []
allowAllCharKeyboard = [ "`", "~" , "!" , "@" , "#" , "$" , "%" , "^" , "&" , "*" , "(" , ")" , "_" , "-" , "+" , "=" , "," , "." , ";" , ":"  , "/" , "?" , "'" , '"' , "{" , "}" , "[" , "]" , "|" ]
baseAllowAllCharKeyboard.extend(ord(a) for a in allowAllCharKeyboard)


def exposeApi(function):
    def checkExternalApi(*args, **kwargs):
        whiteListFunc = ['getCountData']
        menuId = request.json.get('menuId')
        apiName = request.json.get('apiName')
        if(apiName is None):
            return function(*args,**kwargs)
        else:
            if apiName.endswith(menuId) or apiName in whiteListFunc:
                return function(*args,**kwargs)
            else:
                return {"status":False,"data":{},"msg":"apiName not found"}  
    function.__name__ = 'checkExternalApi'
    return checkExternalApi

def convertErrorMessage(result, libDictParam):
    returnMessage = libDictParam[result["errorcode"]]
    print("45 ======= convertErrorMessage =======",returnMessage)
    if returnMessage=="" or returnMessage==None:
        returnMessage = result['errorenduser']
    resultErrorMsg = result['errormsg']
    print("49 ======= resultErrorMsg =======",resultErrorMsg)
    
    splittedMsg = resultErrorMsg.split("||")
    print("50 ======= convertErrorMessage =======",splittedMsg)
    print(51,len(splittedMsg))
    if len(splittedMsg)>2:
        print("51 ======= convertErrorMessage =======",splittedMsg)
        returnMessage = splittedMsg[1]
    print("55 ======= convertErrorMessage =======",returnMessage)
    return returnMessage


def checkIsGridToGrid(listBlock):
    """
        Fungsi untuk check apakah grid to grid

        return status apakah grid to grid
            - True: grid to grid
            - False: bukan grid to grid
        
        :param listBlock: list yang berisi tiap object block. Contoh: [objBlockHead, objBlockDet]
        :type listBlock: list

        :return: status apakah grid to grid
        :rtype: bool
    """
    isGridToGrid = False

    if len(listBlock) == 1:
        return isGridToGrid
    blockMaster = None
    blockChild = None
    blockGrandChild = None
    blockMasterType = None
    blockChildType = None
    blockGrandChildType = None

    for block in listBlock:
        if block.relationBlock is None:
            blockMaster = block.blockId
            blockMasterType = block.blockType
            break

    for block in listBlock:
        if block.relationBlock and block.relationBlock.blockId == blockMaster:
            blockChild = block.blockId
            blockChildType = block.blockType
            break

    for block in listBlock:
        if block.relationBlock and block.relationBlock.blockId == blockChild:
            blockGrandChild = block.blockId
            blockGrandChildType = block.blockType
            break

    if (blockMasterType == blockChildType) and (blockMasterType == "datagrid" and blockChildType == "datagrid"):
        isGridToGrid = True
    elif (blockChildType == blockGrandChildType) and (blockChildType == "datagrid" and blockGrandChildType == "datagrid"):
        isGridToGrid = True

    return isGridToGrid
    
def validateTransactionDataGridToGrid(listBlock, ajaxData):
    """
        Fungsi untuk validasi transaksi grid to grid

        return status apakah grid to grid
            - True: grid to grid
            - False: bukan grid to grid
        return message
        
        :param listBlock: list yang berisi tiap object block. Contoh: [objBlockHead, objBlockDet]
        :param ajaxData: dict yang berisi data yang diupdate/diinsert. Contoh: {'ODENTABLEHEAD': {'column1': 'value1', 'column2': 'value2'}}}
        :type listBlock: list
        :type ajaxData: dict

        :return: status apakah grid to grid, message
        :rtype: dict[bool, str]
    """
    statusValidasi = False
    blockMaster = None
    blockChild = []
    blockGrandChild = []
    print(listBlock)
    for block in listBlock:
        if block.relationBlock is None:
            blockMaster = block.blockId
            break

    for block in listBlock:
        if block.relationBlock and block.relationBlock.blockId == blockMaster:
            blockChild.append(block.blockId)

    for block in listBlock:
        print(143, blockChild, block.relationBlock)
        if block.relationBlock and block.relationBlock.blockId in blockChild:
            blockGrandChild.append(block.blockId)
    print(blockMaster)
    print(blockChild)
    print(blockGrandChild)
    # ----------------- VALIDASI 1 -----------------
    # PROTEKSI KETIKA INSERT 3 LEVEL BLOCK
    if len(ajaxData) > 2 and blockGrandChild:
        return {"status":False, "data":{"code":200,"msg":f"Hanya boleh insert/update 2 block level!"},"msg":f"Hanya boleh insert/update 2 block level!"} 
    # ----------------- VALIDASI 1 -----------------

    # ----------------- VALIDASI 2 -----------------
    # PROTEKSI KETIKA MASTER DIINSERT 2 ROWS
    ajaxBlockMaster = None
    ajaxBlockChild = []
    ajaxBlockGrandchild = []
    for index, blockName in enumerate(ajaxData):
        if blockName == blockMaster:
            ajaxBlockMaster = blockMaster
        elif blockName in blockChild:
            ajaxBlockChild.append(blockName)
        elif blockName in blockGrandChild:
            ajaxBlockGrandchild.append(blockName)

    # if ajaxBlockMaster != None and len(ajaxData.get(ajaxBlockMaster).get('data')) > 1:
    #     return {"status":False, "data":{"code":400,"msg":f"Hanya boleh insert/update 1 row untuk block master!"},"msg":f"Hanya boleh insert/update 1 row untuk block master!"} 
    # ----- UPDATE VALIDASI: 30 Juli 2025 -----
    if ajaxBlockMaster != None and len(ajaxBlockChild) == 0:
        # INSERT HANYA MASTER SAJA, MAKA MASTER BOLEH BANYAK ROW
        if len(ajaxData.get(ajaxBlockMaster).get('data')) == 0:
            return {"status":False, "data":{"code":400,"msg":f"Tidak ada data!"}}
    
    if ajaxBlockMaster != None and len(ajaxBlockChild) != 0:
        # INSERT MASTER DAN CHILD, MAKA MASTER HANYA BOLEH 1 ROW
        if len(ajaxData.get(ajaxBlockMaster).get('data')) > 1:
            return {"status":False, "data":{"code":400,"msg":f"Hanya boleh insert/update 1 row untuk block master!"},"msg":f"Hanya boleh insert/update 1 row untuk block master!"} 
    # ----- UPDATE VALIDASI: 30 Juli 2025 -----

    # ----------------- VALIDASI 2 -----------------
    # ----------------- VALIDASI 3 -----------------
    # PROTEKSI KETIKA DATA YANG TIDAK MENGIKUTI HIRARKI PARENT-CHILD
    print(181,"!!!!!!!!!!!!", ajaxBlockMaster, ajaxBlockChild, ajaxBlockGrandchild)
    if ajaxBlockMaster is not None and len(ajaxBlockChild) != 0:
        if ajaxBlockMaster == blockMaster and any(item in ajaxBlockChild for item in blockChild):
            statusValidasi = True
        elif ajaxBlockMaster == blockChild and any(item in ajaxBlockChild for item in blockGrandChild):
            statusValidasi = True
        else:
            return {"status":False, "data":{"code":400,"msg":f"Hanya boleh insert/update 2 level block yang berelasi!"},"msg":f"Hanya boleh insert/update 2 level block yang berelasi!"}
    elif ajaxBlockMaster is not None and len(ajaxBlockChild) == 0:
        # 1 LEVEL INSERT
        statusValidasi = True
    elif ajaxBlockMaster is None and len(ajaxBlockChild) != 0:
        # 1 LEVEL INSERT
        statusValidasi = True
    elif ajaxBlockMaster is None and (len(ajaxBlockChild) == 0 or len(ajaxBlockChild) != 0) and len(ajaxBlockGrandchild) != 0:
        # 3 LEVEL INSERT
        statusValidasi = True
    # ----------------- VALIDASI 3 -----------------
    
    return {"status": statusValidasi, "msg": "Grid to grid valid"}


def getCountData():
    # print(32,"============== getCountData ==============")
    nik = session['loggedId']['nik']
    if request.method == 'GET':
        ajaxData = json.loads(request.args.get("data"))
    else:
        ajaxData = request.json.get('data')
    # print(37,"============== getCountData ==============")
    bindParam = ajaxData["param"]
    # print(40,bindParam)
    try:
        blockName = ajaxData["blockName"]
        
        block = session["vForm"].getBlock(blockName)

        table = block.databaseTable
        blockWhereClause = block.whereclause
        whereClause = ""
        if blockWhereClause!="":
            whereClause = " WHERE "+blockWhereClause
        sql = f"""select count(*) from {table}
        {whereClause}
        """
        countData = selectDataHeaderQueryRO(sql,bindParam)
        return countData
    except Exception as exp: 
        
        print(f"GAGAL GET COUNT DATA - {traceback.format_exc()}")
        Log.error(f'{nik} | GAGAL GET COUNT DATA | {traceback.format_exc()}')
        Log.error(f'{nik} | GAGAL GET COUNT DATA | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Gagal Get Total Data')
    
def checkSpecialChar(ajaxData):
    if isinstance(ajaxData,list):
        if len(ajaxData)!=0:
            for data in ajaxData:
                for key in data.keys():
                    for char in str(data[key]):
                        if char in ['<','>']:
                            return {"status":False,"data":{"code":200,"msg":f"Special Character Detected!"},"msg":f"Special Character Detected! {key}"}  
    else:      
        for key in ajaxData.keys():
                for char in str(ajaxData[key]):
                    if char in ['<','>']:
                        return {"status":False,"data":{"code":200,"msg":f"Special Character Detected!"},"msg":f"Special Character Detected! {key}"}
    return{"status":True,"data":{},"msg":"No Special Character Detected"}

def validatePkCallForm():
    nik = session['loggedId']['nik']
    try:
        if session["vForm"].callFormLevel == 0:
            session["gVar"] = {"gCallForm":[]}
            
        if request.method == 'GET':
            ajaxData = json.loads(request.args.get("data"))
        else:
            ajaxData = request.json.get('data')
        checkValidate = {"status":False,"data":{},"msg":"FALSE"}
        # print(50, f' - {ajaxData["blockNameCallForm"]} - {ajaxData["callFormData"]}')
        checkValidate = session["vForm"].validatePkCallForm(ajaxData["blockNameCallForm"],ajaxData["callFormData"])
        # print(52, checkValidate)
        if checkValidate["status"]:
            # print(54, f' - {ajaxData["blockNameCallBack"]} - {ajaxData["callBackData"]}')
            checkValidateNd = session["vForm"].validatePkCallForm(ajaxData["blockNameCallBack"],ajaxData["callBackData"]) #validatecallbackdata
            # print(56, checkValidateNd)
            if checkValidateNd["status"]:
                session["gVar"]["gCallForm"].append({"menuId":ajaxData["callFormId"],"callFormParam":{"bindParamCallForm":checkValidate["data"],"bindParamCallBack":checkValidateNd["data"]}})
            checkValidate = checkValidateNd
        # print(60, session["gVar"])
        return checkValidate
    except Exception as exp:
        print(f"Gagal Validate PK Call Form - {traceback.format_exc()}")
        Log.error(f'{nik} | Gagal Validate PK Call Form | {traceback.format_exc()}')
        return rMsgBox(f'Gagal Validate PK Call Form')

def nonBaseBlockValidate(blockName):
    nik = session['loggedId']['nik']
    try:
        if request.method == 'GET':
            ajaxData = json.loads(request.args.get("data"))
        else:
            ajaxData = request.json.get('data')
        blockNonBase = session["vForm"].getBlock(blockName)
        blockNonBase.setDataNonBase(session["vForm"],{"data":[ajaxData]})
        val = blockNonBase.validateBase("NON-BASE")
        return val
    except Exception as exp:
        print(f"Gagal Validate Non Base - {traceback.format_exc()}")
        Log.error(f'{nik} | Gagal Validate Non Base | {traceback.format_exc()}')
        return rMsgBox(f'Gagal Validate Non Base')

def castListToDict(key,data):
    nik = session['loggedId']['nik']
    """
    fungsi ini digunakan untuk mengubah bentuk data yang semula [[]] list dalam list -> menjadi [{}] dictionary dalam list
    @param : - key  -> list dari key untuk dictionary, ex: ['nik','nama','jabatan']
             - data -> [[]] list data dalam list,      ex: [["13044632","MUHAMMAD KEMIS","YY258"],["09011066","ABDUL AJIS","YY239"]]
    """
    result = []

    try:

        for values in data:
            tempDict = {}
            for idx,value in enumerate(values):
                tempDict.update({key[idx]:value})
            result.append(tempDict)
        return result

    except Exception as exp:
        print(f"GAGAL MERUBAH LIST TO DICTIONARY - {traceback.format_exc()}")
        Log.error(f'{nik} | GAGAL MERUBAH LIST TO DICTIONARY | {traceback.format_exc()}')
        Log.error(f'{nik} | GAGAL MERUBAH LIST TO DICTIONARY | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Gagal Merubah List Menjadi Dictionary')

def deleteSpecialChar(data):
    nik = session['loggedId']['nik']
    blockList = [34,39,40,41,60,62]
    
    try:
        for key, item in data.copy()['data'].items():
            if key != 'offsetNumber':
                for char in blockList:
                    item = item.replace(chr(char),"")
                data['data'][key] = item
        return data

    except Exception as exp:
        print(f"GAGAL MENGHAPUS SPECIAL KARAKTER - {traceback.format_exc()}")
        Log.error(f'{nik} | GAGAL MENGHAPUS SPECIAL KARAKTER | {traceback.format_exc()}')
        Log.error(f'{nik} | GAGAL MENGHAPUS SPECIAL KARAKTER | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Gagal Menghapus Special Karakter')

def fileToString(filename):
    nik = session['loggedId']['nik']
    try:

        fin = open(filename,'r')
        data = fin.readlines()
        fin.close()
        hasil = ""
        for baris in data:
            hasil = hasil+baris
        hasil = hasil.replace('{urllogout}', f'"{sso.urlLogout}"')
        return hasil

    except Exception as exp:
        print(f"GAGAL MENGUBAH FILE TO STRING - {traceback.format_exc()}")
        Log.error(f'{nik} | GAGAL MENGUBAH FILE TO STRING | {traceback.format_exc()}')
        Log.error(f'{nik} | GAGAL MENGUBAH FILE MENJADI BENTUK STRING | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Gagal Mengubah File Menjadi Bentuk String')
    
def set_user_menu(getmenu):
    nik = session['loggedId']['nik']
    menu = []
    dataCek = []
    sortMenu = []
    sortMenuCek = []

    try:
        for i in range(len(getmenu[1]['data']['menu_id'])):
            for data in getmenu[1]['data']['menu_id']:
                if data[0].find('_ND') ==-1:
                    if (data[2]=="" or data[2] is None) and data[0] not in sortMenuCek :
                        sortMenu.append(data)
                        sortMenuCek.append(data[0])
                    if (data[2]!="" or data[2] is not None) and data[2] in sortMenuCek and data[0] not in sortMenuCek:
                        sortMenu.append(data)
                        sortMenuCek.append(data[0])

        for data in sortMenu:
            # print(143,"SET USER MENU")
            dataCek.append(data[2])

        for data in sortMenu:
            if data[2]=="" or data[2] is None:
                if data[0] in dataCek:
                    menu.append({'id':data[0],'value':data[1],'icon': "mdi mdi-book",'data':[]})
                else:
                    menu.append({'id':data[0],'value':data[1],'href':'/?type=VIEW&menuId='+data[0],'icon': "mdi mdi-rhombus-medium"})
            elif data[2]!="" or data[2] is not None:
                for menuList in menu:
                    if data[2] == menuList['id']:
                        if data[0] in dataCek:
                            menuList['data'].append({'id':data[0],'value':data[1],'icon': "mdi mdi-book",'data':[]})
                        else:
                            menuList['data'].append({'id':data[0],'value':data[1],'href':'/?type=VIEW&menuId='+data[0],'icon': "mdi mdi-rhombus-medium"})
                    else:
                        if "data" in menuList:
                            for menuList2 in menuList['data']:
                                if menuList2['id']==data[2]:
                                    menuList2['data'].append({'id':data[0],'value':data[1],'href':'/?type=VIEW&menuId='+data[0],'icon': "mdi mdi-rhombus-medium"})
                        else:
                            pass
        return json.dumps(menu)

    except Exception as exp:
        print(f"GAGAL SET USER MENU - {traceback.format_exc()}")
        Log.error(f'{nik} | GAGAL SET USER MENU | {traceback.format_exc()}')
        Log.error(f'{nik} | GAGAL SET USER MENU | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Gagal Set User Menu')

def sendApiPrintReport(kwargs,menuId,web_data,cookie):
    nik = session['loggedId']['nik']
    data = dict()
    data['status'] = False
    data['url'] = ''
    data['message'] = 'Error'

    try:
        # if request.method == 'GET':
        attributes = kwargs.get("attributes", {})
        companyId = attributes.get("company_code", "")
        companyDesc = attributes.get("company", "")
        web_data["company_code"]=companyId
        web_data["company"]=companyDesc
        nik = kwargs.get('nik')
        urlClient = globalVar.URL_REPORT #urlReport
        appId = globalVar.APP_ID
        report_code = web_data.get("report_code", menuId) # get report code from url path

        for x, y in web_data.items() :
            if isinstance(y, date) :
                ytemp = y.strftime("%Y-%m-%d")
                web_data.update({x:ytemp})
        if report_code == '':
            report_code = menuId
        ip = request.environ.get("HTTP_X_FORWARDED_FOR", request.remote_addr)
        userAgent = request.environ.get("HTTP_USER_AGENT", None)
        request_data = {'report_code': report_code,'params': web_data,'nik':nik, 'cookies':cookie,'ip':ip,'userAgent':userAgent} # parameter url client
        saltedhashTemp = saltedhash.create(appId, request_data)
        saltedhashTemp = saltedhashTemp.get('data', '')      
        data['status'] = True
        data['url'] = urlClient + "/?data=" + str(saltedhashTemp)
        data['message'] = 'Success'
        return jsonify(data)
    except Exception as exp:
        print(f"GAGAL SEND API REPORT - {traceback.format_exc()}")
        Log.error(f'{nik} | GAGAL SEND API REPORT | {traceback.format_exc()}')
        Log.error(f'{nik} | GAGAL SEND API REPORT | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Gagal Send Api Report')

def convertDictKeyVal(param):
    nik = session['loggedId']['nik']
    """

    :param :  [['LOVDIVISICODE', 'LOVDIVISIDESC'], [('Q0000', 'SMS OPERATIONAL')]]

    :type  :  list

    :return:  [{'lovdivisicode': 'Q0000', 'lovdivisidesc': 'SMS OPERATIONAL'}]
    """

    coll, data = param
    result = list()

    try:
        for value in data:
            new_item = {}
            for idx, key in enumerate(coll):
                key = key.lower().replace('_','')
                new_item.update({key: value[idx]})
            result.append(new_item)
        return result
    except Exception as exp:
        print(f"GAGAL CONVERT DICTIONARY KEY VALUE - {traceback.format_exc()}")
        Log.error(f'{nik} | GAGAL CONVERT DICTIONARY KEY VALUE | {traceback.format_exc()}')
        Log.error(f'{nik} | GAGAL CONVERT DICTIONARY KEY VALUE | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Gagal Convert Dictionary Key Value')

def selectHeaderQuery(query):
    nik = session['loggedId']['nik']
    conn = Database(globalVar.DB_NAME)
    dictResult = {}
    
    try:
        result = conn.selectHeader(query)
        if result['status']:
            data = convertDictKeyVal(result['data'])
            status = True
        else:
            data = 'error query '
            status = False
        conn.close()
        dictResult.update({'status':status,'data':data})
        return dictResult

    except Exception as exp:
        print(f"GAGAL SELECT HEADER QUERY - {traceback.format_exc()}")
        Log.error(f'{nik} | GAGAL SELECT HEADER QUERY | {traceback.format_exc()}')
        Log.error(f'{nik} | GAGAL SELECT HEADER QUERY | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Gagal Select Header Query')

def selectHeaderQueryRO(query):
    nik = session['loggedId']['nik']
    dictResult = {}
    try:
        result = globalVar.CONN_RO.selectHeader(query)
    
    except psycopg2.InterfaceError as exp:
        print(f"GAGAL SELECT HEADER QUERY RO - {traceback.format_exc()}")
        Log.error(f'{nik} | GAGAL SELECT HEADER QUERY RO | {traceback.format_exc()}')
        Log.error(f'{nik} Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        globalVar.CONN_RO.close()
        globalVar.CONN_RO =  DatabaseRO(globalVar.DB_NAME)
        return selectHeaderQueryRO(query)
    except psycopg2.OperationalError as exp:
        print(f"GAGAL SELECT HEADER QUERY RO - {traceback.format_exc()}")
        Log.error(f'{nik} | GAGAL SELECT HEADER QUERY RO | {traceback.format_exc()}')
        Log.error(f'{nik} Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        globalVar.CONN_RO.close()
        globalVar.CONN_RO =  DatabaseRO(globalVar.DB_NAME)
        return selectHeaderQueryRO(query)
    except psycopg2.errors.InFailedSqlTransaction as exp:
        print(f"GAGAL SELECT HEADER QUERY RO - {traceback.format_exc()}")
        Log.error(f'{nik} | GAGAL SELECT HEADER QUERY RO | {traceback.format_exc()}')
        Log.error(f'{nik} Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        globalVar.CONN_RO.close()
        globalVar.CONN_RO =  DatabaseRO(globalVar.DB_NAME)
        return selectHeaderQueryRO(query)
    except Exception as exp:
        print(f"GAGAL SELECT HEADER QUERY RO - {traceback.format_exc()}")
        Log.error(f'{nik} | GAGAL SELECT HEADER QUERY RO | {traceback.format_exc()}')
        Log.error(f'{nik} Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')

    if result['status']:
        data = convertDictKeyVal(result['data'])
        status = True
    else:
        data = result['msg']
        status = False
    dictResult.update({'status':status,'data':data})
    return dictResult

def selectDataHeaderQueryRO(query,param):
    # print(286, query, param)
    nik = session['loggedId']['nik']
    try:
        dictResult = {"msg":"Error Select Data"}

        result = globalVar.CONN_RO.selectDataHeader(query,param)
    except psycopg2.InterfaceError as exp:
        print(f"psycopg2.InterfaceError - {traceback.format_exc()}")
        Log.error(f'{nik} | psycopg2.InterfaceError | {str(traceback.format_exc())}')
        Log.error(f'{nik} Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        globalVar.CONN_RO.close()
        globalVar.CONN_RO =  DatabaseRO(globalVar.DB_NAME)
        return selectDataHeaderQueryRO(query,param)
    except psycopg2.OperationalError as exp:
        print(f"psycopg2.OperationalError - {traceback.format_exc()}")
        Log.error(f'{nik} | OperationalError | {str(traceback.format_exc())}')
        Log.error(f'{nik} Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        globalVar.CONN_RO.close()
        globalVar.CONN_RO =  DatabaseRO(globalVar.DB_NAME)
        return selectDataHeaderQueryRO(query,param)
    except psycopg2.errors.InFailedSqlTransaction as exp:
        print(f"psycopg2.errors.InFailedSqlTransaction - {traceback.format_exc()}")
        Log.error(f'{nik} | psycopg2.errors.InFailedSqlTransaction | {str(traceback.format_exc())}')
        Log.error(f'{nik} Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        globalVar.CONN_RO.close()
        globalVar.CONN_RO =  DatabaseRO(globalVar.DB_NAME)
        return selectDataHeaderQueryRO(query,param)
    except Exception as exp:
        print(f"selectDataHeaderQueryRO - {traceback.format_exc()}")
        Log.error(f'{nik} | selectDataHeaderQueryRO | {str(traceback.format_exc())}')
        Log.error(f'{nik} Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')


    # print(391, result)
    Log.info(f"Select Data Header Query RO - {str(result)}")
    if result['status']:
        del dictResult['msg']
        data = convertDictKeyVal(result['data'])
        status = True
        dictResult.update({'status':status,'data':data})
    else:
        data = result['msg']
        status = False
        dictResult.update({'status':status,'data':data, 'msg':data})
    return dictResult

def selectDataHeaderQuery(query,param):
    nik = session['loggedId']['nik']
    conn = Database(globalVar.DB_NAME)
    dictResult = {}

    try:
        # print(343,"-----------", "Masukkk")
        result = conn.selectDataHeader(query,param)
        if result['status']:
            data = convertDictKeyVal(result['data'])
            status = True
        else:
            data = result['msg']
            status = False
        conn.close()
        dictResult.update({'status':status,'data':data})
        return dictResult
    except Exception as exp:
        print(f"GAGAL SELECT DATA HEADER QUERY - {traceback.format_exc()}")
        Log.error(f'{nik} | GAGAL SELECT DATA HEADER QUERY | {traceback.format_exc()}')
        Log.error(f'{nik} | GAGAL SELECT DATA HEADER QUERY | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Gagal Select Data Header Query')

def selectQuery(query):
    nik = session['loggedId']['nik']
    conn = Database(globalVar.DB_NAME)
    dictResult = {}
    result = conn.select(query)
    
    try: 

        if result['status']:
            data = result['data']
            status = True
        else:
            status = False
            data = result['msg']

        conn.close()
        dictResult.update({'status':status, 'data':data})
        return dictResult
    except Exception as exp:
        print(f"GAGAL SELECT QUERY - {traceback.format_exc()}")
        Log.error(f'{nik} | GAGAL SELECT QUERY | {traceback.format_exc()}')
        Log.error(f'{nik} | GAGAL SELECT QUERY | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Gagal Select Query')

def selectDataQuery(query,param):
    nik = session['loggedId']['nik']
    conn = Database(globalVar.DB_NAME)
    dictResult = {}
    result = conn.selectData(query,param)

    try:
        if result['status']:
            data = result['data']
            status = True
        else:
            status = False
            data = result['msg']
        conn.close()
        dictResult.update({'status':status, 'data':data})
        return dictResult

    except Exception as exp:
        print(f"GAGAL SELECT DATA QUERY - {traceback.format_exc()}")
        Log.error(f'{nik} | GAGAL SELECT DATA QUERY | {traceback.format_exc()}')
        Log.error(f'{nik} | GAGAL SELECT DATA QUERY | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Gagal Select Data Query')        

def selectDataQueryRO(query,param):
    nik = session['loggedId']['nik']
    dictResult = {}
    try:
        result = globalVar.CONN_RO.selectData(query,param)
    except psycopg2.InterfaceError as exp:
        print(f"GAGAL SELECT DATA QUERY RO - {traceback.format_exc()}")
        Log.error(f'{nik} | GAGAL SELECT DATA QUERY RO | {traceback.format_exc()}')
        Log.error(f'{nik} | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        globalVar.CONN_RO.close()
        globalVar.CONN_RO =  DatabaseRO(globalVar.DB_NAME)
        return selectDataQueryRO(query,param)
    except psycopg2.OperationalError as exp:
        print(f"GAGAL SELECT DATA QUERY RO - {traceback.format_exc()}")
        Log.error(f'{nik} | GAGAL SELECT DATA QUERY RO | {traceback.format_exc()}')
        Log.error(f'{nik} | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        globalVar.CONN_RO.close()
        globalVar.CONN_RO =  DatabaseRO(globalVar.DB_NAME)
        return selectDataQueryRO(query,param)
    except psycopg2.errors.InFailedSqlTransaction as exp:
        print(f"GAGAL SELECT DATA QUERY RO - {traceback.format_exc()}")
        Log.error(f'{nik} | GAGAL SELECT DATA QUERY RO | {traceback.format_exc()}')
        Log.error(f'{nik} | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        globalVar.CONN_RO.close()
        globalVar.CONN_RO =  DatabaseRO(globalVar.DB_NAME)
        return selectDataQueryRO(query,param)
    except Exception as exp:
        print(f"GAGAL SELECT DATA QUERY RO - {traceback.format_exc()}")
        Log.error(f'{nik} | GAGAL SELECT DATA QUERY RO | {traceback.format_exc()}')
        Log.error(f'{nik} | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        print(exp)
        
    if result['status']:
        data = result['data']
        status = True
    else:
        status = False
        data = result['msg']
    dictResult.update({'status':status, 'data':data})
    return dictResult

def executeQuery(query):
    nik = session['loggedId']['nik']
    """

            Fungsi ini digunakan untuk execute save / update data

            @param select_string: Merupakan statement query yang dipakai

            @param param: Merupakan inputan parameter yang dibutuhkan

            @return: status = nilai boolean (True = berhasil, False = gagal)

                     result = hasil nilai data yang didapatkan

    """
    conn = Database(globalVar.DB_NAME)
    dictResult = {}
    result = conn.execute(query)
    try:
        if result['status']:
            msg = result['msg']
            status = True
        else:
            status = False
            msg = result['msg']
        conn.close()
        dictResult.update({'status':status, 'msg':msg})
        return dictResult
    except Exception as exp:
        print(f"GAGAL EXECUTE QUERY - {traceback.format_exc()}")
        Log.error(f'{nik} | GAGAL EXECUTE QUERY | {traceback.format_exc()}')
        Log.error(f'{nik} | GAGAL EXECUTE QUERY | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Gagal Execute Query')

def executeDataQuery(query,param):
    nik = session['loggedId']['nik']
    """

            Fungsi ini digunakan untuk execute save / update data

            @param select_string: Merupakan statement query yang dipakai

            @param param: Merupakan inputan parameter yang dibutuhkan

            @return: status = nilai boolean (True = berhasil, False = gagal)

                     result = hasil nilai data yang didapatkan

    """
    conn = Database(globalVar.DB_NAME)
    dictResult = {}
    result = conn.executeData(query,param)
    
    try:
        if result['status']:
            msg = result['msg']
            status = True
        else:
            status = False
            msg = result['msg']
        conn.close()
        dictResult.update({'status':status, 'msg':msg})
        return dictResult

    except Exception as exp:
        print(f"GAGAL EXECUTE DATA QUERY - {traceback.format_exc()}")
        Log.error(f'{nik} | GAGAL EXECUTE DATA QUERY | {traceback.format_exc()}')
        Log.error(f'{nik} | GAGAL EXECUTE DATA QUERY | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Gagal Execute Data Query')

def executeDataMany(query,param,blocks):
    nik = session['loggedId']['nik']
    """

            Fungsi ini digunakan untuk execute save / update data

            @param select_string: Merupakan statement query yang dipakai

            @param param: Merupakan inputan parameter yang dibutuhkan

            @return: status = nilai boolean (True = berhasil, False = gagal)

                     result = hasil nilai data yang didapatkan

    """
    conn = Database(globalVar.DB_NAME)
    dictResult = {}
    listStatus = []
    message = ""

    try:

        if False in listStatus:
            conn.close()
            dictResult.update({'status':False, 'data':message})
        else:
            conn.forCommit()
            conn.close()
            dictResult.update({'status':True, 'data':result})
        return dictResult
    except Exception as exp:
        print(f"GAGAL EXECUTE DATA MANY - {traceback.format_exc()}")
        Log.error(f'{nik} | GAGAL EXECUTE DATA MANY | {traceback.format_exc()}')
        Log.error(f'{nik} | GAGAL EXECUTE DATA MANY | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Gagal Execute Data Query')

def dictParamGenerator(columns):
    nik = session['loggedId']['nik']
    dictColumns = {}

    try:
        for column in columns:
            if type(column[1])==list:
                dictColumns[column[1][0]] = column[0][0]
            else:
                dictColumns[column[1]] = column[0]
        return dictColumns
    except Exception as exp:
        print(f"dictParamGenerator - {traceback.format_exc()}")
        Log.error(f'{nik} | dictParamGenerator |{str(traceback.format_exc())}')
        Log.error(f'{nik} | DICTIONARY PARAM GENERATOR | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Gagal Pada Dictionary Param Generator')    

def addCreateUserForInsert(protoQuery,vNonVisibleColumns):
    nik = session['loggedId']['nik']

    try:
        if not vNonVisibleColumns:
            return protoQuery
        for column in vNonVisibleColumns:
            protoQuery=protoQuery + column[0] + ', '
        return protoQuery
    except Exception as exp:
        print(f"GAGAL ADD CREATE USER FOR INSERT - {traceback.format_exc()}")
        Log.error(f'{nik} | GAGAL ADD CREATE USER FOR INSERT | {traceback.format_exc()}')
        Log.error(f'{nik} | GAGAL ADD CREATE USER FOR INSERT | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Gagal Add Create User For Insert')

def generateInsert(vTable,vColumn,vNoDBItems,vData,vNonVisibleColumns,sessionId,blocks):
    nik = session['loggedId']['nik']
    import ast
    queryInsert = {}
    dataInsert = {}
    try:
        for table in list(vTable):
            vDataInsrt = vData[table].copy()
            listQuery = []
            listData = []
            if len(vDataInsrt["data"])>1:
                for data in vDataInsrt["data"]:
                    dictVal = []
                    vNewData = data
                    vNewData["createUser"] = sessionId
                    vNewData["updateUser"] = sessionId

                    for key in vNoDBItems[table]:
                        if key in vNewData.keys():
                            del vNewData[key]

                    dataNotNull = vNewData.copy()
                    
                    dataNotNull = vNewData.copy()

                    convertDict = dictParamGenerator(vColumn[table])

                    for nulable in vNewData:
                        if not vNewData[nulable]:
                            del convertDict[nulable]
                            del dataNotNull[nulable]
                
                    newConvertDict = {}
                    for coll in convertDict:
                        if coll in vNewData.keys():
                            newConvertDict.update({coll:convertDict[coll]})
                            
                    for key,value in dataNotNull.items():
                        dictVal.append(f"%({key})s")
                    columnString = ""
                    for key in newConvertDict.keys():
                        columnString=columnString+newConvertDict[key]+', '
                    columnString=addCreateUserForInsert(columnString, vNonVisibleColumns[table])
                    columnString=columnString[:-2]
                    query = f"""INSERT INTO {vTable[table]}
                    ({columnString}) 
                    VALUES({",".join(dictVal)})
                    """
                    listQuery.append(query)
                    listData.append(vNewData)
            elif len(vDataInsrt["data"])==1:
                dictVal = []
                vNewData = vDataInsrt["data"][0]
                vNewData["createUser"] = sessionId
                vNewData["updateUser"] = sessionId
                for key in vNoDBItems[table]:
                    if key in vNewData.keys():
                        del vNewData[key]

                dataNotNull = vNewData.copy()
                convertDict = dictParamGenerator(vColumn[table])

                dataNotNull = vNewData.copy()

                for nulable in vNewData:
                    if not vNewData[nulable]:
                        del convertDict[nulable]
                        del dataNotNull[nulable]
                
                newConvertDict = {}
                for coll in convertDict:
                    if coll in vNewData.keys():
                        newConvertDict.update({coll:convertDict[coll]})

                for key,value in dataNotNull.items():
                    dictVal.append(f"%({key})s")
                columnString = ""
                for key in newConvertDict.keys():
                    columnString=columnString+newConvertDict[key]+', '
                columnString=addCreateUserForInsert(columnString, vNonVisibleColumns[table])
                columnString=columnString[:-2]

                query = f"""INSERT INTO {vTable[table]}
                ({columnString}) 
                VALUES({",".join(dictVal)})
                """
                listQuery.append(query)
                listData.append(vNewData)
            queryInsert[table] = listQuery
            dataInsert[table] = listData
        
        return [queryInsert,dataInsert,blocks]
    except Exception as exp:
        print(f"GAGAL GENERATE INSERT - {traceback.format_exc()}")
        Log.error(f'{nik} | GAGAL GENERATE INSERT | {traceback.format_exc()}')
        Log.error(f'{nik} | GAGAL GENERATE INSERT | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Gagal Generate Insert')
    
def generateInsertRecord(vTable,vColumn,vNoDBItems,vData,vNonVisibleColumns,sessionId):
    nik = session['loggedId']['nik']
    vDataInsrt = vData.copy()
    dictVal = []
    vNewData = vDataInsrt
    vNewData["createUser"] = sessionId
    vNewData["updateUser"] = sessionId
    
    try:

        for key in vNoDBItems:
            if key in vNewData.keys():
                del vNewData[key]

        dataNotNull = vNewData.copy()
        convertDict = dictParamGenerator(vColumn)

        dataNotNull = vNewData.copy()

        for nulable in vNewData:
            if vNewData[nulable] == "":
                del convertDict[nulable]
                del dataNotNull[nulable]
        
        newConvertDict = {}
        for coll in convertDict:
            if coll in vNewData.keys():
                newConvertDict.update({coll:convertDict[coll]})

        for key,value in dataNotNull.items():
            dictVal.append(f"%({key})s")
        columnString = ""
        for key in newConvertDict.keys():
            columnString=columnString+newConvertDict[key]+', '
        columnString=addCreateUserForInsert(columnString, vNonVisibleColumns)
        columnString=columnString[:-2]

        query = f"""INSERT INTO {vTable}
        ({columnString}) 
        VALUES({",".join(dictVal)})
        """
        return [query,vNewData]
    except Exception as exp:
        print(f"Generate Insert Record - {traceback.format_exc()}")
        Log.error(f'{nik} | Generate Insert Record | {traceback.format_exc()}')
        Log.error(f'{nik} | GAGAL GENERATE INSERT RECORD | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Gagal Generate Insert Record')
    
def addCreateOrUpdateUser(protoQuery, vNonVisibleColumns, isUpdate=True):
    nik = session['loggedId']['nik']
    
    try:
        if not vNonVisibleColumns:
            return protoQuery
        updOrCreateUser=vNonVisibleColumns[0]
        protoQuery= protoQuery + updOrCreateUser + " = %("+vNonVisibleColumns[1]+")s, "
        return protoQuery
    except Exception as exp:
        print(f"GAGAL CREATE ATAU UPDATE USER - {traceback.format_exc()}")
        Log.error(f'{nik} | GAGAL CREATE ATAU UPDATE USER | {traceback.format_exc()}')
        Log.error(f'{nik} | GAGAL CREATE ATAU UPDATE USER | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Gagal Create Atau Update User')
    
def generateUpdate(vTable,vColumn,vPK,vNoDBItems,vDatas,vNonVisibleColumns,sessionId,blocks):
    nik = session['loggedId']['nik']
    queryUpdate = {}
    dataUpdate = {}
    
    try:
        for table in list(vTable):
            listQuery = []
            listData = []
            vData = vDatas[table].copy()
        
            if len(vData["data"])==1:
                vNewData = vData["data"][0]
                
                for key in vNoDBItems[table]:
                    if key in vNewData.keys():
                        del vNewData[key]
                
                datasNoPK = vNewData.copy()
                for pk in vPK[table]:
                    pkString = pk[1]
                    del datasNoPK[pkString]


                dataNotNull = datasNoPK.copy()

                for nulable in datasNoPK:
                    if datasNoPK[nulable]=='':
                        del dataNotNull[nulable]

                whereClause = ""
                for pk in vPK[table]:
                    whereClause += f" {pk[0]} = %({pk[1]})s and "
                whereClause=whereClause[:-5]
                convertDict = dictParamGenerator(vColumn[table])
                
                setString = ""
                for data,value in dataNotNull.items():
                    setString=setString+convertDict[data]+" = %("+data+")s, "
                
                setString=addCreateOrUpdateUser(setString,vNonVisibleColumns[table])
                setString=setString[:-2]
                
                query = f"""UPDATE {vTable[table]}
                SET {setString}
                WHERE {whereClause}
                """
                vNewData["updateUser"] = sessionId
                
                listQuery.append(query)
                listData.append(vNewData)
            elif len(vData["data"])>1:
                for dataaa in vData["data"]:
                    vNewData = dataaa
                    
                    for key in vNoDBItems[table]:
                        if key in vNewData.keys():
                            del vNewData[key]
                
                    datasNoPK = vNewData.copy()
                    for pk in vPK[table]:
                        pkString = pk[1]
                        del datasNoPK[pkString]

                    dataNotNull = datasNoPK.copy()

                    for nulable in datasNoPK:
                        if not datasNoPK[nulable]:
                            del dataNotNull[nulable]

                    whereClause = ""
                    for pk in vPK[table]:
                        whereClause += f" {pk[0]} = %({pk[1]})s and "
                    whereClause=whereClause[:-5]
                    convertDict = dictParamGenerator(vColumn[table])
                    
                    setString = ""
                    
                    for data,value in dataNotNull.items():
                        setString=setString+convertDict[data]+" = %("+data+")s, "
                    setString=addCreateOrUpdateUser(setString,vNonVisibleColumns[table])
                    setString=setString[:-2]
                    query = f"""UPDATE {vTable[table]}
                    SET {setString}
                    WHERE {whereClause}
                    """
                    vNewData["updateUser"] = sessionId
                    listQuery.append(query)
                    listData.append(vNewData)
            
            queryUpdate[table] = listQuery
            dataUpdate[table] = listData        
        return [queryUpdate, dataUpdate, blocks]
    except Exception as exp:
            Log.error(f'{nik} | GAGAL GENERATE UPDATE | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return rMsgBox(f'Gagal Generate Update<br>{exp}')

def generateUpdateRecord(vTable,vColumn,vPK,vNoDBItems,vDatas,vNonVisibleColumns,sessionId):
    nik = session['loggedId']['nik']
    vData = vDatas.copy()
    vNewData = vData
    
    try: 
        for key in vNoDBItems:
            if key in vNewData.keys():
                del vNewData[key]
        
        datasNoPK = vNewData.copy()
        for pk in vPK:
            pkString = pk[1]
            del datasNoPK[pkString]

        whereClause = ""
        for pk in vPK:
            whereClause += f" {pk[0]} = %({pk[1]})s and "
        whereClause=whereClause[:-5]
        convertDict = dictParamGenerator(vColumn)
        
        setString = ""
        for data,value in datasNoPK.items():
            setString=setString+convertDict[data]+" = %("+data+")s, "
        
        setString=addCreateOrUpdateUser(setString,vNonVisibleColumns)
        setString=setString[:-2]
        
        query = f"""UPDATE {vTable}
        SET {setString}
        WHERE {whereClause}
        """
        vNewData["updateUser"] = sessionId
            
        return [query, vNewData]
    except Exception as exp:
        print(f"Generate Update Record - {traceback.format_exc()}")
        Log.error(f'{nik} | Generate Update Record | {traceback.format_exc()}')
        Log.error(f'{nik} | GAGAL GENERATE UPDATE RECORD | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Gagal Generate Update Record')

def generateSelect(vTable,vColumn,vAliasCol,vWhereClause,vOrderBy,vLimit,vNoDBItems,vDatas):
    try:
        vColumnTemp = []
        for col in vColumn:
            vColumnTemp.append(col[1])

        nik = session['loggedId']['nik']
        whereClause = ""

        bindParams = vDatas["data"].copy()
        dataRecord = vDatas["data"].copy()
        
        for data,value in vDatas["data"].items():
            if data in vNoDBItems or data not in vColumnTemp:
                del dataRecord[data]

        convertDict = dictParamGenerator(vColumn)
        if "status" in convertDict:
            if convertDict['status'] is False:
                return convertDict

        # print(872)
        tableString = vTable
        if vDatas['blockType'] == "form":
            for data,value in dataRecord.items():
                if value != '' and data!="offsetNumber":
                    if isinstance(value, int):
                        whereClause=whereClause+convertDict[data]+"::integer = %("+data+")s and "
                    elif isinstance(value, float):
                        whereClause=whereClause+convertDict[data]+"::float = %("+data+")s and "
                    else:
                        if '%' in value or '_' in value:
                            whereClause=whereClause+convertDict[data]+"::varchar like %("+data+")s and "
                        else:
                            whereClause=whereClause+convertDict[data]+" = %("+data+")s and "
        elif vDatas['blockType'] == "datagrid":
            for data,value in dataRecord.items():
                if data in convertDict.keys():
                    if value != '' and data!="offsetNumber":
                        if isinstance(value, int):
                            whereClause=whereClause+convertDict[data]+"::integer = %("+data+")s and "
                        elif isinstance(value, float):
                            whereClause=whereClause+convertDict[data]+"::float = %("+data+")s and "
                        else:
                            if '%' in value or '_' in value:
                                whereClause=whereClause+convertDict[data]+"::varchar like %("+data+")s and "
                            else:
                                whereClause=whereClause+convertDict[data]+" = %("+data+")s and "
        # print(899)
        whereClause=whereClause[:-5]

        if whereClause!="" and vWhereClause=="": #tidak kosong
            whereClause =  " WHERE "+ whereClause
        elif whereClause!="" and vWhereClause!="":
            whereClause = " WHERE " + vWhereClause + " and " +whereClause
        else:
            if vWhereClause!="":
                whereClause = " WHERE "+vWhereClause
        # print(909)
        #create bind param
        for data,value in dataRecord.copy().items():
            if value == '':
                del dataRecord[data]
                del bindParams[data]

        #orderBy condition
        if vOrderBy !="":
            vOrderBy = " order by "+vOrderBy
        # print(919)
        if vDatas['blockType'] == "form":
            columnString = ""
            a=0
            for key in vColumn:
                columnString=columnString+key[0]+' as '+vAliasCol[a]+', '
                a+=1
            columnString=columnString[:-2]
        
            querySearch = f"""SELECT {columnString}
            FROM {tableString}
            {whereClause}
            {vOrderBy}
            limit 1
            offset %(offsetNumber)s
            """
            # print(919, querySearch%bindParams)
        elif vDatas['blockType'] == "datagrid":
            # print(937)
            offsetParam = ""
            limitParam = ""
            if "offsetNumber" in bindParams:
                offsetParam = "offset %(offsetNumber)s"
                limitParam = "limit 500"
            if vLimit != "":
                limitParam = "limit "+str(vLimit)
            # print(945)
            columnString = ""
            a=0
            for key in vColumn:
                columnString=columnString+key[0]+' as '+vAliasCol[a]+', '
                a+=1
            columnString=columnString[:-2]
            # print(952, 1,columnString)
            # print(952, 2,tableString)
            # print(952, 3,whereClause)
            # print(952, 4,vOrderBy)
            # print(952, 5,offsetParam)
            # print(952, 6,limitParam)

            querySearch = f"""SELECT {columnString}
            FROM {tableString}
            {whereClause}
            {vOrderBy}
            {offsetParam}
            {limitParam}
            """
            # print(966, querySearch, bindParams)
            # print(942, querySearch%bindParams)
        return [querySearch,bindParams]
    except Exception as exp:
        print(f"Generate Select - {traceback.format_exc()}")
        Log.error(f'{nik} | Generate Select | {traceback.format_exc()}')
        Log.error(f'{nik} | GAGAL GENERATE SELECT | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Gagal Generate Select')      

def generateDelete(vTable,vPk,vDatas):
    nik = session['loggedId']['nik']
    whereClause = ""
    try:
        for pk in vPk:
            whereClause += f" {pk[0]} = %({pk[1]})s and "
        whereClause=whereClause[:-5]

        queryDelete = f"""DELETE FROM {vTable}
        WHERE {whereClause}
        """
        return [queryDelete,vDatas]
    except Exception as exp:
        print(f"GAGAL GENERATE DELETE - {traceback.format_exc()}")
        Log.error(f'{nik} | GAGAL GENERATE DELETE | {traceback.format_exc()}')
        Log.error(f'{nik} | GAGAL GENERATE DELETE | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Gagal Generate Delete')

def generateElement(coloumns):
    nik = session['loggedId']['nik']
    elementFunc = ""
    stringElement = ""
    try: 
        for element in coloumns:
            elementFunc = element[2]+"("
            for i in range(len(element)):
                if(i!=0 and i!=2 and i!=(len(element)-1)):
                    if type(element[i])==list:
                        elementFunc+=""+str(element[i])+","
                    else:
                        elementFunc+="'"+element[i]+"',"
                if(i==(len(element)-1)):
                    if type(element[i])==list:
                        elementFunc+=""+str(element[i])+"), "
                    else:
                        elementFunc+="'"+element[i]+"'), "
                    stringElement+=elementFunc
                    
        return stringElement
    except Exception as exp:
        print(f"GAGAL GENERATE ELEMENT - {traceback.format_exc()}")
        Log.error(f'{nik} | GAGAL GENERATE ELEMENT | {traceback.format_exc()}')
        Log.error(f'{nik} | GAGAL GENERATE ELEMENT | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Gagal Generate Element')
    
def getModulScript(id):
    nik = session['loggedId']['nik']
    try:
        conn = Database(globalVar.DB_NAME)
        sql = """
            select mwm_desc,mwm_url,mwm_script_file,mwm_dictparam,mwm_trigger 
            from dmhr.ms_web_modul
            where mwm_id = %(id)s
        """
        param = {'id':id}
        is_select_valid, result = conn.selectData(sql,param)
        conn.close()
        dictData = {}
    
        if is_select_valid:
            dictResult = {}
            for desc,url,script,dictParam,trigger in result:
                dictResult['desc']=desc
                dictResult['url']=url
                dictResult['script']=script
                dictResult['dictParam']=dictParam
                dictResult['trigger']=trigger
                dictData.update(dictResult)
        return dictData 
    except Exception as exp:
        print(f"GAGAL GET MODUL SCRIPT - {traceback.format_exc()}")
        Log.error(f'{nik} | GAGAL GET MODUL SCRIPT | {traceback.format_exc()}')
        Log.error(f'{nik} | GAGAL GET MODUL SCRIPT | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Gagal Get Modul Script')

def setData(data,newData,indeks):
    nik = session['loggedId']['nik']
    dataResult=[]
    newData=list(newData['data'][0])

    try:
        for i in newData:
            data.insert(indeks,i)
            indeks+=1

        dataResult.append(tuple(data))
        return dataResult
    except Exception as exp:
        print(f"GAGAL SET DATA - {traceback.format_exc()}")
        Log.error(f'{nik} | GAGAL SET DATA | {traceback.format_exc()}')
        Log.error(f'{nik} | GAGAL SET DATA | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Gagal Set Data')    

def getSelectStatement(vBlock,data):
    try:
        nik = session['loggedId']['nik']
        block = vBlock
        table = block.databaseTable
        columns = []
    
        for idx,cols in enumerate(block.listObjItem):
            if cols.databaseItem is True:
                columns.append([block.databaseColumns[idx],cols.itemId])
        whereclause = block.whereclause
        aliasColumns = []
        for i in block.listObjItem:
            if i.databaseItem is True:
                aliasColumns.append(i.itemId)
        if whereclause=="None":
            whereclause = ""
        orderBy = block.orderBy
        if orderBy=="None":
            orderBy = ""
        noDBItems = block.noDbItems
        limit = block.limit

        return generateSelect(table,columns,aliasColumns,whereclause,orderBy,limit,noDBItems,data)
    except Exception as exp:
        print(f"getSelectStatement - {traceback.format_exc()}")
        Log.error(f'{nik} | getSelectStatement |{str(traceback.format_exc())}')
        Log.error(f'{nik} | GAGAL GET SELECT STATEMENT | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Gagal Get Select Statement')

def getDeleteStatement(vBlock,data):
    nik = session['loggedId']['nik']
    block = vBlock
    table = block.databaseTable
    columns = []
    primaryKeys = []
    
    try:
        for idx,cols in enumerate(block.listObjItem):
            if cols.databaseItem is True:
                columns.append([block.databaseColumns[idx],cols.itemId])
                if cols.primaryKey is True:
                    primaryKeys.append([block.databaseColumns[idx],cols.itemId])
        aliasColumns = []
        for i in block.listObjItem:
            if i.databaseItem is True:
                aliasColumns.append(i.itemId)
        
        return generateDelete(table,primaryKeys,data[0])
    except Exception as exp:
        print(f"GAGAL GET DELETE STATEMENT - {traceback.format_exc()}")
        Log.error(f'{nik} | GAGAL GET DELETE STATEMENT | {traceback.format_exc()}')
        Log.error(f'{nik} | GAGAL GET DELETE STATEMENT | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Gagal Get Delete Statement<br>{exp}')    

def getInsertStatement(vContainer,data,user):
    nik = session['loggedId']['nik']
    blocksId = []
    blocks = vContainer.getBlocks()
    tableBlocks = {}
    columns = {}
    noDbItems = {}
    nonVisibleItems = {}

    try:
        for block in blocks:
            blocksId.append(block.blockId)
            tableBlocks[block.blockId] = block.databaseTable
            columns[block.blockId] = []
            for idx,cols in enumerate(block.listObjItem):
                if cols.databaseItem is True:
                    # print("ITEM ID DATABASEITEM : ",cols.itemId)
                    columns[block.blockId].append([block.databaseColumns[idx],cols.itemId])

            noDbItems[block.blockId] = block.noDbItems
            nonVisibleItems[block.blockId] = block.nonVisibleItems
        return generateInsert(tableBlocks,columns,noDbItems,data,
        nonVisibleItems,user,blocksId)
    except Exception as exp:
        print(f"GAGAL GET INSERT STATEMENT - {traceback.format_exc()}")
        Log.error(f'{nik} | GAGAL GET INSERT STATEMENT | {traceback.format_exc()}')
        Log.error(f'{nik} | GAGAL GET INSERT STATEMENT | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Gagal Get Insert Statement')    

def getUpdateStatement(vContainer,data,user):
    nik = session['loggedId']['nik']
    blocksId = []
    blocks = vContainer.getBlocks()
    tableBlocks = {}
    columns = {}
    noDbItems = {}
    nonVisibleItems = {}
    primaryKeys = {}

    try:
        for block in blocks:
            blocksId.append(block.blockId)
            tableBlocks[block.blockId] = block.databaseTable
            columns[block.blockId] = []
            noDbItems[block.blockId] = block.noDbItems
            primaryKeys[block.blockId] = []

            for idx,cols in enumerate(block.listObjItem):
                if cols.databaseItem is True:
                    columns[block.blockId].append([block.databaseColumns[idx],cols.itemId])
                    if cols.primaryKey is True:
                        primaryKeys.append([block.databaseColumns[idx],cols.itemId])
            nonVisibleItems[block.blockId] = block.nonVisibleItems[1]

        return generateUpdate(tableBlocks,columns,primaryKeys,noDbItems,data,
            nonVisibleItems,user, blocksId)
    except Exception as exp:
        print(f"GAGAL GET UPDATE STATEMENT - {traceback.format_exc()}")
        Log.error(f'{nik} | GAGAL GET UPDATE STATEMENT | {traceback.format_exc()}')
        Log.error(f'{nik} | GAGAL GET UPDATE STATEMENT | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Gagal Get Update Statement')

def genDictUpdate(vContainer):
    nik = session['loggedId']['nik']
    editedData = {}
    
    try:
        for block in vContainer.getBlocks():
            blockId = block.blockId
            changeRecords = []
            if block.changeStatus is True:
                for record in block.records:
                    if record.changeStatus is True:
                        changeItems = {}
                        for item in record.items:
                            if item.changeStatus == True or item.primaryKey == True:
                                changeItems.update({item.itemId:item.valueItem})
                        changeRecords.append(changeItems)
            editedDataBlock = {'blockType':block.blockType,'data':changeRecords}  
            editedDataBlock['data'] = changeRecords
            editedData.update({blockId:editedDataBlock})
        return editedData
    except Exception as exp:
        print(f"GAGAL GENERATE DICTIONARY UPDATE - {traceback.format_exc()}")
        Log.error(f'{nik} | GAGAL GENERATE DICTIONARY UPDATE | {traceback.format_exc()}')
        Log.error(f'{nik} | GAGAL GENERATE DICTIONARY UPDATE | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Gagal Generate Dictionary Update')

def genBindParamUpdate(vRecord):
    nik = session['loggedId']['nik']
    changeItems = {}
    
    try:
        for item in vRecord.items:
            if item.changeStatus == True or item.primaryKey == True:
                changeItems.update({item.itemId:item.valueItem})
        return changeItems
    except Exception as exp:
        print(f"GAGAL GENERATE BIND PARAM UPDATE - {traceback.format_exc()}")
        Log.error(f'{nik} | GAGAL GENERATE BIND PARAM UPDATE | {traceback.format_exc()}')
        Log.error(f'{nik} | GAGAL GENERATE BIND PARAM UPDATE | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Gagal Generate Bind Param Update')

def genBindParamInsert(vRecord):
    nik = session['loggedId']['nik']
    changeItems = {}
    # print(1217, vRecord)
    try:
        for item in vRecord.insertItems:
            if item.changeStatus == True or item.primaryKey == True:
                changeItems.update({item.itemId:item.valueItem})
        # print(1223, changeItems)
        return changeItems
    except Exception as exp:
        print(f"GAGAL GENERATE BIND PARAM INSERT - {traceback.format_exc()}")
        Log.error(f'{nik} | GAGAL GENERATE BIND PARAM INSERT | {traceback.format_exc()}')
        Log.error(f'{nik} | GAGAL GENERATE BIND PARAM INSERT | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Gagal Generate Bind Param Insert')

def getInsertStatementRecord(vRecord,user):
    # print("\n\n\n====== getInsertStatementRecord ======\n\n\n")
    nik = session['loggedId']['nik']
    data = genBindParamInsert(vRecord)
    block = vRecord.parentObj
    tableBlock = block.databaseTable
    nonVisibleItems = {}
    columns = []
    noDbItems = block.noDbItems
    # print("util", data)
    try:
        for idx,cols in enumerate(block.listObjItem):
            if cols.databaseItem is True:
                # print("ITEM ID DATABASE : ",cols.itemId)
                columns.append([block.databaseColumns[idx],cols.itemId])
        nonVisibleItems = block.nonVisibleItems

        resultGenerateInsert = generateInsertRecord(tableBlock,columns,noDbItems,data,nonVisibleItems,user)
        if isinstance(resultGenerateInsert,dict):
            if "status" in resultGenerateInsert:
                if resultGenerateInsert['status'] is False:
                    # print(f"generateInsert (Utilities) - {str(resultGenerateInsert)}")
                    Log.error(f"{nik} | generateInsert (Utilities) - | {str(resultGenerateInsert)}")
                    return rMsgBox('Gagal Generate Insert Statement')
        return resultGenerateInsert
    except Exception as exp:
        print(f"GAGAL GET INSERT STATEMENT RECORD (Utilities) - {traceback.format_exc()}")
        Log.error(f"{nik} | GAGAL GET INSERT STATEMENT RECORD (Utilities) - | {traceback.format_exc()}")
        Log.error(f'{nik} | GAGAL GET INSERT STATEMENT RECORD | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Gagal Get Insert Statement Record')

def getUpdateStatementRecord(vRecord,user):
    nik = session['loggedId']['nik']
    data = genBindParamUpdate(vRecord)
    block = vRecord.parentObj
    tableBlock = block.databaseTable
    nonVisibleItems = {}
    columns = []
    noDbItems = block.noDbItems
    primaryKeys = []

    try:
        for idx,cols in enumerate(block.listObjItem):
            if cols.databaseItem is True:
                columns.append([block.databaseColumns[idx],cols.itemId])
                if cols.primaryKey is True:
                    primaryKeys.append([block.databaseColumns[idx],cols.itemId])
        nonVisibleItems = block.nonVisibleItems[1]

        resultGenerateUpdate = generateUpdateRecord(tableBlock,columns,primaryKeys,noDbItems,data,nonVisibleItems,user)
        if isinstance(resultGenerateUpdate,dict):
            if "status" in resultGenerateUpdate:
                if resultGenerateUpdate['status'] is False:
                    # print(f"generateUpdate (Utilities) - {str(resultGenerateUpdate)}")
                    Log.error(f"{nik} | generateUpdate (Utilities) - | {str(resultGenerateUpdate)}")
                    return rMsgBox('Gagal Generate Update Statement')
        return resultGenerateUpdate
    except Exception as exp:
        print(f"GAGAL GET UPDATE STATEMENT RECORD (Utilities) - {traceback.format_exc()}")
        Log.error(f"{nik} | GAGAL GET UPDATE STATEMENT RECORD (Utilities) - | {traceback.format_exc()}")
        Log.error(f'{nik} | GAGAL GET UPDATE STATEMENT RECORD | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Gagal Get Update Statement Record')

def genDictInsert(vContainer):
    nik = session['loggedId']['nik']
    editedData = {}
    
    try:
        for block in vContainer.getBlocks():
            blockId = block.blockId
            changeRecords = []
            if block.changeStatus is True:
                for record in block.recordsInsert:
                    if record.changeStatus is True:
                        changeItems = {}
                        for item in record.insertItems:
                            if item.changeStatus == True or item.primaryKey == True:
                                changeItems.update({item.itemId:item.valueItem})
                        changeRecords.append(changeItems)
            editedDataBlock = {'blockType':block.blockType,'data':changeRecords}
            editedDataBlock['data'] = changeRecords
            editedData.update({blockId:editedDataBlock})
        return editedData
    except Exception as exp:
        print(f"GAGAL GENERATE DICTIONARY INSERT - {traceback.format_exc()}")
        Log.error(f'{nik} | GAGAL GENERATE DICTIONARY INSERT | {traceback.format_exc()}')
        Log.error(f'{nik} | GAGAL GENERATE DICTIONARY INSERT | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Gagal Generate Dictionary Insert')    

def rMsgBox(msg):
    return {'status':False,'msg':msg}

def getDataDisplayItem(vData):
    nik = session['loggedId']['nik']
    
    try:
        if len(vData['DATA']['data']) != 0:
            
            a = datetime.now() 
            if vData['BLOCK_TYPE'] =='form':
                    dictData = vData['DATA']['data'][0]
                    bindParam = {}
                    for param in vData['PARAM']:
                        bindParam.update({param:dictData[param]})
                    dataPost = selectDataHeaderQueryRO(vData["SQL"],bindParam)
                    # print(1599, dataPost)
                    # print(1600, vData['SET_DESC'])
                    if len(dataPost['data'])>0 and dataPost['status']:
                        for setDesc in vData['SET_DESC']:
                            dictData.update({setDesc:dataPost['data'][0][setDesc]}) 
                    vData['DATA']['data'][0] = dictData
                    result = {'status':vData['DATA']['status'],'data':vData['DATA']['data']}

            elif vData['BLOCK_TYPE'] == 'datagrid':
                    for dat in vData['DATA']['data']:
                        bindParam = {}
                        for param in vData['PARAM']:
                            bindParam.update({param:dat[param]})
                        dataPost = selectDataHeaderQueryRO(vData["SQL"],bindParam)
                        if len(dataPost['data'])>0 and dataPost['status']:
                            for setDesc in vData['SET_DESC']:
                                dat.update({setDesc:dataPost['data'][0][setDesc]})
                        result = {'status':vData['DATA']['status'],'data':vData['DATA']['data']}
            # print("display item "+vData["SQL"],datetime.now()-a)
            return result
        else:
            return {'status':vData['DATA']['status'],'data':vData['DATA']['data']}
    except Exception as exp:
        print(f"GAGAL GET DATA DISPLAY ITEM - {traceback.format_exc()}")
        Log.error(f'{nik} | GAGAL GET DATA DISPLAY ITEM | {traceback.format_exc()}')    
        Log.error(f'{nik} | GAGAL GET DATA DISPLAY ITEM | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return {'status':False,'data':{},'msg':f'Gagal Get Data Display Item'}       


def checkExtension(file):

    """
    Args:
        file (fileStorage) : Berisi file storage yang didapat dari request

    Returns:
        result (dict) : status = nilai boolean (True = ekstensi valid, False = ekstensi tidak valid)
                        msg = message informasi
    """
    fileExt = (file.filename).split('.')[-1].lower()
    fileHex = (file.read(15)).hex()
    # print(1406,"FILE HEX ",fileHex)
    result = {'status':True, 'msg':'valid'} 
    
    #List file signature = https://en.wikipedia.org/wiki/List_of_file_signatures
    dictExtensionSignature={
        'pdf':['efbbbf255044462d','255044462d'],
        'xlsx':['504b0304','efbbbf504b0304'],
        'docx':['504b0304','efbbbf504b0304'],
        'pptx':['504b0304','efbbbf504b0304'],
        'xls':['d0cf11e0a1b11ae1'],
        'doc':['d0cf11e0a1b11ae1'],
        'ppt':['d0cf11e0a1b11ae1'],
        'jpg':['ffd8ffe0','ffd8ffee','ffd8ffe1????457869660000'],
        'jpeg':['ffd8ffee','ffd8ffe000104a4649460001','ffd8ffe1????457869660000'],
        'gif':['474946383761','474946383961'],
        'png':['89504e470d0a1a0a'],
        'rar':['526172211a0700','526172211a070100'],
        'zip':['504b0304','504b0506','504b0708'],
        '3gp':['667479703367'],      
        'mkv':['1a45dfa3'],
        'dwg':['414331303'],
        'mp4':['6674797069736F6d','667479704d534e56','000000246674797069736f6d000002'],
        
    }
    # This Extension have random File Hex (signature) 
    listExtensionWithoutHeader= ['csv']
    
    if not dictExtensionSignature.get(fileExt):
        result['status'] = False
        result['msg'] = 'Ekstensi tidak diperbolehkan!'
    else:
        if not fileHex.startswith(tuple(dictExtensionSignature.get(fileExt))):
            result['status'] = False
            result['msg'] = 'File signature berbeda!'

    # Check the special Character in the file
    if fileExt in listExtensionWithoutHeader:
        result = {'status':True, 'msg':'valid'}
        for char in str(file.read()):
            if char in ['<','>']:
                result['status'] = False
                result['msg'] = 'Special character detected in file' 
    
    return result        



def checkingAllowedExtension(extension, file):
    extension = [x.lower() for x in extension]
    fileExt = (file.filename).split('.')[-1].lower()
    if fileExt in extension:
        return {"status":True}
    else:
        allowedExtension = ""
        for ext in extension:
            allowedExtension = allowedExtension+ext+" " 
        return {"status":False, "msg":"Jenis File Tidak Diperbolehkan.<br> Allowed File "+allowedExtension}

def preTransactionFileData(self,method,param):
    # param = {"coluodenFileToBucket("preTransaction",{"querySequence":param["sqlSequence"], "sequenceFile": sequenceFile, "bucketName": param["bucketName"], "folderName":param["folderName"]})mnIdSequence":"othsequencefile","bucketName":"sat-oden-upload", "folderName":"realPathFolder/", "sqlSequence":sqlSequence}
    
    sequenceFileName = self.item(param["columnIdSequence"]).value
    if sequenceFileName!=None:
        sequenceFile = sequenceFileName.split("|")
    else:
        sequenceFile = []
    sequenceName = param.get('sequenceName',None)
    querySequence = param.get('sqlSequence',None)
    
    if method=="insert":
        # cek string kosong
        if self.item(param["columnIdSequence"]).value!="":
            if("file-manager" in param["bucketName"]):
                return{"status":True, "msg":""}
            else:
                resultMoveFile = odenFileToBucket("preTransaction",{"querySequence":querySequence, "sequenceName":sequenceName,"sequenceFile": sequenceFile, "bucketName": param["bucketName"], "tempFolderName":param['tempFolderName'],"folderName":param["folderName"]})
                if resultMoveFile['status']:
                    newSequenceFileName = ""

                    for fileSuccess in resultMoveFile['data']:
                        newSequenceFileName+=(fileSuccess['sequenceName']+"|")
                
                    newSequenceFileName = newSequenceFileName[:-1]
                    self.item(param["columnIdSequence"]).value = newSequenceFileName
                    return{"status":True, "msg":""}
                else:
                    return {"status":False, "msg":"pre-Transaction File Gagal"}
        else:
            return{"status":True, "msg":""}
    elif method=="update":
        # cek status change
        if self.item(param["columnIdSequence"]).changeStatus:
            if("file-manager" in param["bucketName"]):
                return{"status":True, "msg":""}
            else:
                print(1746,"preTransaction",{"querySequence":querySequence, "sequenceName":sequenceName,"sequenceFile": sequenceFile, "bucketName": param["bucketName"], "tempFolderName":param['tempFolderName'],"folderName":param["folderName"]})
                resultMoveFile = odenFileToBucket("preTransaction",{"querySequence":querySequence, "sequenceName":sequenceName,"sequenceFile": sequenceFile, "bucketName": param["bucketName"], "tempFolderName":param['tempFolderName'],"folderName":param["folderName"]})
                print(1747,resultMoveFile)
                if resultMoveFile['status']:
                    newSequenceFileName = ""

                    for fileSuccess in resultMoveFile['data']:
                        newSequenceFileName+=(fileSuccess['sequenceName']+"|")
                
                    print("newSequenceFileName BEFORE",newSequenceFileName)
                    newSequenceFileName = newSequenceFileName[:-1]
                    print("newSequenceFileName AFTER",newSequenceFileName)
                    
                    self.item(param["columnIdSequence"]).value = newSequenceFileName
                    return{"status":True, "msg":""}
                else:
                    return {"status":False, "msg":"pre-Transaction File Gagal"}
        else:
            return{"status":True, "msg":""}
    
    

def is_base64(file_object):
    try:
        file_object.seek(0)  # Ensure we're at the start of the file-like object
        data = file_object.read()
        
        # Check if the content is ASCII (for Base64 check)
        if all(32 <= byte <= 126 or byte == 10 or byte == 13 for byte in data):
            # Try decoding as Base64
            try:
                base64.b64decode(data, validate=True)
                return True  # It's Base64 encoded
            except base64.binascii.Error:
                return False  # Not Base64
        else:
            return False  # Contains non-ASCII, likely binary
    except Exception as e:
        print(f"Error reading the file object: {e}")
        return False

def is_binary(file_object):
    try:
        file_object.seek(0)  # Ensure we're at the start of the file-like object
        data = file_object.read()
        
        # If any byte is outside the printable ASCII range, assume binary
        if any(byte > 127 for byte in data):
            return True  # It's binary
        else:
            return False  # Likely text or Base64
    except Exception as e:
        print(f"Error reading the file object: {e}")
        return False

def odenFileToBucket(typeFunc, valueFunc):
    import datetime
    # print(1465, valueFunc)
    # print(1470, typeFunc)
    nik = session['loggedId']['nik']
    accessUser = False
    listMenu = session["loggedId"].get("list_menu",None)
    # print(1792)
    if listMenu is None:
        accessUser = True
    else:
        listMenuAcc = []
        for menu in listMenu[1]['data']['menu_id']:
            listMenuAcc.append(menu[0])
        
        try:
            if request.json.get("menuId") in listMenuAcc:
                accessUser = True
        except:
            if request.form.get("menuId") in listMenuAcc:
                accessUser = True
    print(1801,typeFunc)
    try:
        if typeFunc=="uploadFile":
            print(1847)
            if session['loggedId']['access_menu']['status_access'].get('insert') == 'Y' and session['loggedId']['access_menu']['status_access'].get('update') == 'Y':
                print(1849)
                returnValue = ""
                fileAPI = request.files
                # fileObject
                for key,value in fileAPI.items():
                    fileObject = value

                checkingAllowExt = checkingAllowedExtension(valueFunc["allowedExtension"],fileObject)
                fileObject.seek(0)
                if checkingAllowExt['status']:
                    #checking Hex Extension
                    statusCheckingHex = checkExtension(fileObject)
                    fileObject.seek(0)

                    if statusCheckingHex['status']:
                        # tampungan apabila berhasil lolos pengecekan hex
                        # waitingListBucket.append((value,"pathFolderName/"+value.filename))
                        checkingFile = {"status":True}
                    else:
                        # gagal ceking hex
                        checkingFile = {"status":False, "oldfilename":fileObject.filename, "msg":statusCheckingHex['msg']+"<br>"+fileObject.filename}
                else:
                    # gagal ceking allow extension
                    checkingFile = {"status":False, "oldfilename":fileObject.filename, "msg":"Jenis File Tidak Diperbolehkan"+"<br>"+fileObject.filename}
                
                # raise ValueError("error")
                if checkingFile["status"]:
                    if valueFunc['bucketName'] != "local":
                        if "file-manager" in valueFunc['bucketName']:
                            # print(1496,valueFunc)
                            file_content = fileObject.read()
                            # Define the payload for the POST request
                            jsonParam = {
                                'filter': valueFunc['filterParam'],
                                'value': valueFunc['idParam'],
                                'type': valueFunc['jenisFile'],
                                'filename':fileObject.filename,
                                'create_user': session['loggedId']['nik'],
                                'file': base64.b64encode(file_content).decode('utf-8'),
                                'properties': valueFunc.get("properties",None)
                                
                            }
                            
                            # print(1518, valueFunc)

                            # jsonParam['file'] = base64.b64encode(file_content).decode('utf-8')

                            # print(1536, jsonParam)

                            # awdawdwda

                            # memasukan parameter dalam custom param pada jsonParam -- TAMBAHAN
                            if 'customParam' in valueFunc.keys():
                                jsonParam.update(valueFunc['customParam'])
                            print(1901)
                            respond = ClientRequest().post(
                                appId=globalVar.APP_ID, 
                                url=valueFunc['urlFileManager'], 
                                data=jsonParam,
                                headers={
                                    'appId':globalVar.APP_ID
                                }
                            )

                            responseUpload = respond.json()



                            # print(1524, responseUpload)
                            # (True, '00', {'appId': 'oden-v3', 'datetime': '20240605163511236170', 'destination': '3233/DATA_PRIBADI/a28c5a7a63d6682e18f8f02957521e71.pdf', 'file_id': ['a28c5a7a63d6682e18f8f02957521e71.pdf'], 'message': 'Upload Success', 'saltedHash': '8d0d281ed26224ece40c32922a0c75c5', 'status': True})

                            if responseUpload[0]:
                                if type(responseUpload[2]['file_id']) != list:
                                    responseFilename = [responseUpload[2]['file_id']]
                                else:
                                    responseFilename = responseUpload[2]['file_id']

                                # return {"status":responseUpload[2]['status'],"msg":responseUpload[2]['message'], "filename":[{
                                # "oldfilename":fileObject.filename,
                                # "newfilename":responseUpload[2]['file_id']
                                # }]}
                                return {"status":responseUpload[2]['status'],"msg":responseUpload[2]['message'], "filename":responseFilename}
                            else:
                                return {"status":False, "oldfilename":fileObject.filename, "msg":responseUpload[2]['message']}

                            # Send the POST request
                            # response = requests.post(valueFunc['url'], json=jsonParam)
                            # pass
                            
                        else:
                            print(1937)
                            bucketName = valueFunc['bucketName']
                            folderName = valueFunc["folderName"]
                            if folderName[len(folderName) - 1] != '/':
                                folderName+="/"
                            folderName = folderName+valueFunc["tempFolderName"]
                            uploadedInBucket = []
                            # make connection
                            print(1944)
                            connBucket = SatBucket(bucketName)
                            print(1946)
                            # upload bucket
                            extfile = (fileObject.filename).split('.')[-1]

                            current_time = datetime.datetime.now().strftime('%Y%m%d%H%M%S%f')
                            tempName = request.form.get('menuId')+"-"+(fileObject.filename).split('.')[0]+"-"+current_time

                            if folderName[len(folderName) - 1] != '/':
                                folderName+="/"

                            # print(1565, "==========================================")
                            # print(request.form.get('sizeFile'))
                            sizeFileJS = request.form.get('sizeFile')
                            # print(1565, "==========================================")
                            # print(type(fileObject))
                            fileObj = request.files[list(request.files.keys())[0]]
                            # Get the file size in bytes
                            fileObj.seek(0, 2)  # Move the cursor to the end of the file
                            file_size = fileObj.tell()  # Get the cursor position, which represents the file size
                            fileObj.seek(0)  # Reset the cursor to the start of the file for future use

                            # print(file_size)
                            if int(sizeFileJS)!=int(file_size):
                                return {"status":False, "msg":f"File Size Corrupt, it must be {sizeFileJS} - actually {file_size}"}
                            
                            statusUploadBucket = connBucket.uploadFromBytesFile(fileObject,folderName+tempName+"."+extfile)
                            # print(1557, statusUploadBucket)
                            if statusUploadBucket[0]:
                                # berhasil upload bucket
                                uploadedInBucket.append({"oldfilename":fileObject.filename, "newfilename":statusUploadBucket[1]['file_name'], "msg":statusUploadBucket[1]['message']})
                                returnValue = {"status":statusUploadBucket[0],"msg":statusUploadBucket[1]['message'], "filename":uploadedInBucket}
                            else:
                                # gagal upload bucket
                                uploadedInBucket.append({"oldfilename":fileObject.filename, "newfilename":statusUploadBucket[1]['file_name'], "msg":statusUploadBucket[1]['reason']})
                                returnValue = {"status":False, "oldfilename":fileObject.filename, "msg":statusUploadBucket[1]['reason']+"<br>"+fileObject.filename}
                            if returnValue["status"]:
                                return returnValue
                            else:
                                successDel = []
                                for file in uploadedInBucket:
                                    for x in range(0,2):
                                        returnDelBucket = connBucket.deleteFile(file['newfilename'])
                                        if returnDelBucket[0] or x==2:
                                            successDel.append(file['newfilename'])
                                            break
                                if len(successDel) == len(uploadedInBucket):
                                    return returnValue
                            return returnValue
                    else:
                        # upload file di local 
                        # upload bucket
                        extfile = (fileObject.filename).split('.')[-1]
                        
                        current_time = datetime.datetime.now().strftime('%Y%m%d%H%M%S%f')
                        tempName = request.form.get('menuId')+"-"+(fileObject.filename).split('.')[0]+"-"+current_time

                        folderName = globalVar.DEFAULT_LOCAL+"/"+valueFunc["folderName"] 
                        if folderName[len(folderName) - 1] != '/':
                            folderName+="/"
                        folderName+=valueFunc["tempFolderName"]
                        if folderName[len(folderName) - 1] != '/':
                            folderName+="/"
                        try:
                            fileObject.save(folderName+tempName+"."+extfile) #save file ke local
                            return {"status":True,"msg":"", "filename":[{
                                "oldfilename":fileObject.filename,
                                "newfilename":folderName+tempName+"."+extfile
                            }]}
                        except Exception as e:
                            # print(f"Upload File Local - {traceback.format_exc()}")
                            Log.error(f'{nik} | Upload File Local | {traceback.format_exc()}')
                            return {"status":False, "msg":"Gagal Upload Data in Local"}
                        
                else:
                    return {"status":False, "msg":checkingFile["msg"]}
            else:
                return {"status":False, "msg":"Anda tidak memiliki akses untuk Upload File"}
        elif typeFunc=="preTransaction":
            # print(1611)
            if session['loggedId']['access_menu']['status_access'].get('insert') == 'Y' and session['loggedId']['access_menu']['status_access'].get('update') == 'Y':
                if valueFunc["bucketName"]!= "local":
                    # print(1614)
                    successMoveFile = []
                    connBucket = SatBucket(valueFunc['bucketName'])
                    client = connBucket.storage_client
                    bucket = client.bucket(valueFunc['bucketName'])
                    for fileItemName in valueFunc["sequenceFile"]:
                        print(2010,fileItemName)
                        statusFile = False
                        folderName = valueFunc["folderName"]
                        if folderName[len(folderName) - 1] != '/':
                            folderName+="/"
                        folderName = folderName+valueFunc["tempFolderName"]
                        # print(1995)
                        # print(1996,client.list_blobs(valueFunc['bucketName'], prefix=folderName))
                        for source_blob in client.list_blobs(valueFunc['bucketName'], prefix=folderName):
                            if source_blob.name == folderName+fileItemName:
                                # print(2020,source_blob.name,folderName+fileItemName)
                                # Log.info(f"2020,{source_blob.name},{folderName+fileItemName}") 
                                extfile = str(fileItemName).split('.')[-1]
                                # print(1625,valueFunc["sequenceName"])
                                if valueFunc["sequenceName"]!=None: 
                                    # print(1627)                                   #CUMA 1 FILE PER UPLOAD
                                    newFileNameSequence = valueFunc["sequenceName"]+"."+extfile
                                else:
                                    # print(1630, valueFunc['querySequence'])
                                    # connNew = Database(globalVar.DB_NAME)
                                    # connNew.selectHeader
                                    result = selectHeaderQuery(valueFunc['querySequence']) 
                                    # print(2026,result['data'],datetime.datetime.now()) 
                                    Log.info(f"\n\n2026,{result['data']},{datetime.datetime.now()}\n\n") 
                                    # print(1632, result['data'][0]['sequence'])
                                    newFileNameSequence = result['data'][0]['sequence']+"."+extfile
                                # print(2007,folderName+fileItemName,"|",valueFunc["folderName"]+newFileNameSequence)
                                dest_name = source_blob.name.replace(folderName+fileItemName, valueFunc["folderName"]+newFileNameSequence)
                                bucket.copy_blob(source_blob, bucket, new_name=dest_name)
                                successMoveFile.append({"tempName":fileItemName, "sequenceName":newFileNameSequence})
                                statusFile = True
                                print(2040,"BEFORE PASS",fileItemName,newFileNameSequence)
                                
                                pass
                        
                        
                        print(2040,"AFTER PASS",fileItemName)
                        if statusFile==False:
                            successMoveFile.append({"tempName":"", "sequenceName":fileItemName})
                    return {"status":True, "data":successMoveFile}
                else:
                    successMoveFile = []
                    for fileItemName in valueFunc["sequenceFile"]:
                        folderName = globalVar.DEFAULT_LOCAL+"/"+valueFunc['folderName']
                        if folderName[len(folderName) - 1] != '/':
                            folderName+="/"
                        localFolderName = globalVar.DEFAULT_LOCAL+"/"+valueFunc['folderName']
                        if localFolderName[len(localFolderName) - 1] != '/':
                            localFolderName+="/"
                        localFolderName+=valueFunc["tempFolderName"]
                        if localFolderName[len(localFolderName) - 1] != '/':
                            localFolderName+="/"

                        if os.path.isfile(localFolderName+fileItemName):
                            extfile = fileItemName.split('.')[-1]
                            if valueFunc["sequenceName"]!=None:                                    #CUMA 1 FILE PER UPLOAD
                                newFileNameSequence = valueFunc["sequenceName"]+"."+extfile
                            else:
                                result = selectHeaderQueryRO(valueFunc['querySequence'])  
                                newFileNameSequence = result['data'][0]['sequence']+"."+extfile
                            shutil.copy2(localFolderName+fileItemName, folderName+newFileNameSequence)  
                            successMoveFile.append({"tempName":fileItemName, "sequenceName":newFileNameSequence})
                            pass
                        else:
                            successMoveFile.append({"tempName":"", "sequenceName":fileItemName})
                    return {"status":True, "data":successMoveFile}
            else:
                return {"status":False, "msg":"Anda tidak memiliki akses untuk transaction File"}
        elif typeFunc=="downloadFile":
            # check menuId
            if accessUser:
                if valueFunc['bucketName']!="local":
                    if "file-manager" in valueFunc['bucketName']:
                        # print(1666, valueFunc)
                        jsonParam = {
                            'filter': valueFunc['filterParam'],
                            'file_id':valueFunc["idFile"],
                            'value': valueFunc['idParam'],
                            'type': valueFunc['jenisFile']
                        }

                        print(1686, jsonParam,globalVar.APP_ID,valueFunc['urlDownloadFileManager'])
                        responseDownload = ClientRequest().post(
                            appId=globalVar.APP_ID, 
                            url=valueFunc['urlDownloadFileManager'], 
                            data=jsonParam,
                            headers={
                                'appId':globalVar.APP_ID
                            }
                        ).json()

                        # print(1685,responseDownload)
                        if responseDownload[0]:
                            # # Step 1: Decode the base64 string to binary data
                            # binary_data = base64.b64decode(responseDownload[2]['data'])

                            # # print(1704,binary_data)

                            # # Step 2: Create a BytesIO object from the binary data
                            # mem = io.BytesIO(binary_data)
                            # mem.seek(0)
                            # # print(1709,mem.read())  # or any other file operation

                            # # Write the file-like object to a temporary file
                            # runningNumber = str(uuid.uuid4())
                            # print(1699, runningNumber)
                            # with open(runningNumber, 'wb') as temp_file:
                            #     temp_file.write(binary_data)

                            # # Use the 'file' command to determine the MIME type
                            # result = subprocess.run(['file', '--mime-type', '-b', runningNumber], capture_output=True, text=True)
                            # os.remove(runningNumber)
                            # # Extract the MIME type from the command output
                            # mime_type = result.stdout.strip()

                            # # print(1721,mime_type)

                            # return send_file(mem, as_attachment=True, download_name=f'aaaaa', mimetype=mime_type)
                            # print(responseDownload[2])
                            if responseDownload[2]['status']:
                                # Step 1: Decode the base64 string to binary data
                                binary_data = base64.b64decode(responseDownload[2]['data'])

                                print(2159)
                                # Step 2: Create a BytesIO object from the binary data
                                mem = io.BytesIO(binary_data)
                                print(2162)
                                mem.seek(0)

                                # Write the file-like object to a temporary file (if needed)
                                # with open('/tmp/tempfile', 'wb') as temp_file:
                                #     temp_file.write(binary_data)

                                # Use python-magic to determine the MIME type
                                print(2168)
                                mime = magic.Magic(mime=True)
                                print(2169)
                                mime_type = mime.from_buffer(binary_data)
                                print(2170)

                                # Send the file with the determined MIME type
                                
                                # return send_file(mem, as_attachment=True, download_name='aaaaa', mimetype=mime_type)
                                
                                return {"status":True, "data":{"mimetype":mime_type}, "file":responseDownload[2]['data'], "msg":""}

                            else:
                                return {"status":False, "msg":responseDownload[2]['message']}

                        # if responseDownload['status']

                        # Decode the Base64 string to bytes
                    else:
                        print(2076,valueFunc['bucketName'])
                        connBucket = SatBucket(valueFunc['bucketName'])
                        print(2185,connBucket)
                        folderName = valueFunc['folderName']
                        statusDataDB = request.json['data'][0].get("sequenceName", False)
                        if statusDataDB:
                            fileName = request.json['data'][0]['sequenceName']
                            bucketfilename = valueFunc['folderName']+fileName
                        else:
                            fileName = request.json['data'][0]['tempName']
                            bucketfilename = valueFunc['folderName']+valueFunc['tempFolderName']+fileName

                        downloadName = request.json['data'][0]['oldName']
                        # print(2090,bucketfilename)
                        try:
                            print(2198,bucketfilename)
                            statusDownload,fileDownloaded = connBucket.downloadBytesFile(bucketfilename)
                        except Exception as e:
                            # print(1852, e)
                            return {"status": False, "data":{}, "msg":"File not found in bucket"}
                        # print(1850, statusDownload)
                        # print(1759, statusDownload)
                        # print(1759, fileDownloaded)
                        # Simulate an in-memory file (BytesIO object)
                        file_object = fileDownloaded["file"]  # This is 'Hello world!' in Base6
                        # Convert bytes to Base64
                        base64_encoded = base64.b64encode(file_object)
                        # If you need the result as a string
                        base64_string = base64_encoded.decode('utf-8')
                        if statusDownload:
                            # mem = io.BytesIO()
                            # mem.write(fileDownloaded.get('file'))
                            # mem.seek(0)
                            # responseFile = send_file(mem, as_attachment=True, download_name=f'{downloadName}', mimetype=fileDownloaded.get('content_type'))
                            # print(1853,responseFile.headers)
                            # print(1853,type(responseFile.headers))
                            # print(1855,dir(responseFile.headers))
                            # responseFile.headers.pop('Content-Disposition')
                            # return responseFile
                            return {"status":True, "data":{"mimetype":fileDownloaded.get('content_type')}, "file":base64_string, "msg":""}
                else:
                    
                    folderName = globalVar.DEFAULT_LOCAL+"/"+valueFunc['folderName']
                    # print(1890,request.json['data'][0])
                    if folderName[len(folderName) - 1] != '/':
                            folderName+="/"
                    tempFolderName = globalVar.DEFAULT_LOCAL+"/"+valueFunc['folderName']
                    if tempFolderName[len(tempFolderName) - 1] != '/':
                            tempFolderName+="/"
                    tempFolderName+=valueFunc['tempFolderName']
                    # folderName = folderName+tempFolderName
                    seqNameStatus = request.json['data'][0].get("sequenceName", False)
                    if seqNameStatus:
                        fileName = request.json['data'][0]['sequenceName']
                        downloadName = request.json['data'][0]['oldName']
                    else:
                        fileName = request.json['data'][0]['tempName']
                    downloadName = request.json['data'][0]['oldName']
                    

                    binary_data= ''
                    fileReturn = ''
                    if os.path.isfile(folderName+fileName):
                        with open(folderName+fileName, 'rb') as file:
                            fileRead = file.read()
                            fileReturn =base64.b64encode(fileRead).decode('utf-8')
                            binary_data = base64.b64decode(fileReturn)

                        mem = io.BytesIO(binary_data)
                        mem.seek(0)
                        mime = magic.Magic(mime=True)
                        mime_type = mime.from_buffer(binary_data)
                        
                    elif os.path.isfile(tempFolderName+fileName):
                        with open(tempFolderName+fileName, 'rb') as file:
                            fileRead = file.read()
                            fileReturn = base64.b64encode(fileRead).decode('utf-8')
                            binary_data = base64.b64decode(fileReturn)
                        mem = io.BytesIO(binary_data)
                        # print(1929)
                        mem.seek(0)
                        # print(1931)
                        mime = magic.Magic(mime=True)
                        # print(1933)
                        mime_type = mime.from_buffer(binary_data)
                        # print(1935)
                    else:
                        return {"status":False, "msg":"File not found."}
                    # print(1934)
                    return {"status":True, "data":{"mimetype":mime_type}, "file":str(fileReturn), "msg":""}
            else:
                return {"status":False, "msg":"Anda tidak memiliki akses untuk View File"}
            
        elif typeFunc=="deleteFile":
            # print(1780,session)
            if session['loggedId']['access_menu']['status_access'].get('delete') == 'Y' :
                if valueFunc['bucketName']!="local":
                    if "file-manager" in valueFunc['bucketName']:
                        # print(1792, "masuk")
                        jsonParam = {
                            'file_id':valueFunc["idFile"],
                            'type': valueFunc['jenisFile'],
                            'filter': valueFunc['filterParam'],
                            'value': valueFunc['idParam'],
                            'update_user': session['loggedId']['nik']
                        }

                        # print(1797, jsonParam)

                        responseDelete = ClientRequest().post(
                            appId=globalVar.APP_ID, 
                            url=valueFunc['urlDeleteFileManager'], 
                            data=jsonParam,
                            headers={
                                'appId':globalVar.APP_ID
                            }
                        ).json()

                        # print(1808, responseDelete)

                        if responseDelete[0]:
                            if responseDelete[2]['status']:
                                # return {"status":True, "filename":valueFunc["idFile"]}
                                statusDelete, fileDeleted = (True, {"file_name":valueFunc["idFile"], "file":valueFunc["idFile"]})
                            else:
                                return {"status":False, "msg":responseDelete[2]['message']}

                    else:
                        print(2295,valueFunc['bucketName'])
                        connBucket = SatBucket(valueFunc['bucketName'])
                        folderName = valueFunc['folderName']
                        fileName = request.json['data'][0]
                        client = connBucket.storage_client
                        bucket = client.bucket(valueFunc['bucketName'])
                        for fileItemName in request.json['data']:
                            statusFile = False

                            for source_blob in client.list_blobs(valueFunc['bucketName'], prefix=valueFunc['folderName']):
                                if source_blob.name == valueFunc["folderName"]+fileItemName:
                                    extfile = fileItemName.split('.')[-1]
                                    deleteFolder = valueFunc["folderName"]
                                    if deleteFolder[len(deleteFolder) - 1] != '/':
                                        deleteFolder+="/"
                                    deleteFolder = deleteFolder+"logDelFile/"
                                    dest_name = source_blob.name.replace(valueFunc["folderName"]+fileItemName, deleteFolder+fileItemName)
                                    bucket.copy_blob(source_blob, bucket, new_name=dest_name)
                                    statusDelete, fileDeleted = connBucket.deleteFile(valueFunc["folderName"]+fileItemName)
                            for source_blob in client.list_blobs(valueFunc['bucketName'], prefix=valueFunc['folderName']+valueFunc['tempFolderName']):
                                if source_blob.name == valueFunc['folderName']+valueFunc["tempFolderName"]+fileItemName:
                                    extfile = fileItemName.split('.')[-1]
                                    deleteFolder = valueFunc["folderName"]
                                    if deleteFolder[len(deleteFolder) - 1] != '/':
                                        deleteFolder+="/"
                                    deleteFolder = deleteFolder+"logDelFile/"
                                    dest_name = source_blob.name.replace(valueFunc['folderName']+valueFunc['tempFolderName']+fileItemName, deleteFolder+fileItemName)
                                    bucket.copy_blob(source_blob, bucket, new_name=dest_name)
                                    statusDelete, fileDeleted = connBucket.deleteFile(valueFunc['folderName']+valueFunc['tempFolderName']+fileItemName)
                else:
                    folderName = globalVar.DEFAULT_LOCAL+"/"+valueFunc['folderName']
                    if folderName[len(folderName) - 1] != '/':
                            folderName+="/"
                    tempFolderName = globalVar.DEFAULT_LOCAL+"/"+valueFunc['folderName']
                    if tempFolderName[len(tempFolderName) - 1] != '/':
                            tempFolderName+="/"
                    tempFolderName+=valueFunc['tempFolderName']
                    fileName = request.json['data'][0]


                    if os.path.isfile(folderName+fileName):
                        shutil.copy2(folderName+fileName, folderName+"logDelFile/"+fileName)
                        os.remove(folderName+fileName)
                        statusDelete, fileDeleted = (True,{"file":folderName+fileName, "file_name":folderName+fileName})
                    elif os.path.isfile(tempFolderName+fileName):
                        shutil.copy2(tempFolderName+fileName, folderName+"logDelFile/"+fileName)
                        os.remove(tempFolderName+fileName)
                        statusDelete, fileDeleted = (True,{"file":tempFolderName+fileName, "file_name":tempFolderName+fileName})
                    else:
                        return {"status":False, "msg":"Gagal menghapus file, file tidak ditemukan"}
                if statusDelete:
                    return {"status":statusDelete, "filename":fileDeleted}
                else:
                    return {"status":statusDelete, "msg":fileDeleted}
            else:
                return {"status":False, "msg":"Anda tidak memiliki akses untuk delete File"}
        elif typeFunc=="loadphoto":
            if accessUser:
                if valueFunc['bucketName']!="local":
                    connBucket = SatBucket(valueFunc['bucketName'])
                    folderName = valueFunc['folderName']

                    #check file exist in storage
                    bucketfilename = valueFunc['folderName']+request.json.get("data")[0]['FILE_NAME']
                    storage_client = connBucket.storage_client
                    bucket = storage_client.bucket(valueFunc['bucketName'])
                    # print(1963, bucketfilename)
                    stats = storage.Blob(bucket=bucket, name=bucketfilename).exists(storage_client)
                    
                    if stats:
                        downloadName = request.json.get("data")[0]['TEMPLATE_ID']
                        statusDownload,fileDownloaded = connBucket.downloadBytesFile(bucketfilename)
                        if statusDownload:
                            mem = io.BytesIO()
                            mem.write(fileDownloaded.get('file'))
                            mem.seek(0)
                            return send_file(mem, as_attachment=True, download_name=f'{downloadName}', mimetype=fileDownloaded.get('content_type'))
                    else:
                        return {"status":False, "msg":"File Foto tidak ditemukan"}
            else:
                return {"status":False, "msg":"Anda tidak memiliki akses untuk View File"}
    except Exception as exp:
        # print(f"Generate Insert Record - {traceback.format_exc()}")
        Log.error(f'{nik} | Generate Insert Record | {traceback.format_exc()}')
        return {"status":False, "msg": "Other error in odenFileToBucket"}


def sendMail(recipients=[], cc=[], subject='', body='', alias='autoemail_satbi@sat.co.id', attachments=[]):
    nik = session['loggedId']['nik']

    try:
        rs = [False, '']
        
        if(recipients == [] or subject == "" or body == ""):
            Log.error(f'{nik} | GAGAL MENGIRIM EMAIL (Recipients, Subject, Body Email cannot be empty)')
            return rMsgBox(f'Recipients, Subject, Body Email cannot be empty!<br>')
        
        sender = alias
        # check parameter recipients, if string then convert to list
        if isinstance(recipients, str):
            recipients = [recipients]
        if isinstance(cc, str):
            cc = [cc]

        autoEmailSender = 'autoemail_satbi@sat.co.id'
        # add sender as recipients to (for logging)
        recipients.append(autoEmailSender)
        if isinstance(attachments, str):
            attachments = [attachments]

        uniq = uuid.uuid4().hex 
        ip = socket.gethostbyname(socket.gethostname())
        now = datetime.now().strftime('%Y%m%d_%H%M%S')

        outer = MIMEMultipart()
        outer['Subject'] = subject
        outer['To'] = COMMASPACE.join(recipients)
        outer['cc'] = COMMASPACE.join(cc)
        outer['From'] = sender
        outer.preamble = 'You will not see this in a MIME-aware mail reader.\n'
        outer['Message-ID'] = "{0}_{1}_{2}".format(ip, now, uniq)

        recipients = recipients + cc

        for filename in attachments:
            path = filename
            # if filename doesn't exist, then skip
            if not os.path.isfile(filename):
                continue
            # Guess the content type based on the file's extension.  Encoding will be ignored, although we should check for simple things like gzip'd or compressed files.
            ctype, encoding = mimetypes.guess_type(filename)
            if ctype is None or encoding is not None:
                # No guess could be made, or the file is encoded (compressed), so use a generic bag-of-bits type. 
                ctype = 'application/octet-stream'
            maintype, subtype = ctype.split('/', 1)
            if maintype == 'text':
                fp = open(path)
                # Note: we should handle calculating the charset
                msg = MIMEText(fp.read(), _subtype=subtype)
                fp.close()
            elif maintype == 'image':
                fp = open(path, 'rb')
                msg = MIMEImage(fp.read(), _subtype=subtype)
                fp.close()
            elif maintype == 'audio':
                fp = open(path, 'rb')
                msg = MIMEAudio(fp.read(), _subtype=subtype)
                fp.close()
            else:
                msg = MIMEBase('application', "octet-stream")
                with open(path, 'rb') as file:
                    msg.set_payload(file.read())
                encoders.encode_base64(msg)
            msg.add_header('Content-Disposition', 'attachment; filename="{}"'.format(os.path.basename(path)))
            outer.attach(msg)

        html_body = body
        if not '</html>' in body:
            html_body = """ <html><body><tr>{0}</tr><br></body></html> """.format(body)

        body = MIMEText(html_body, 'html')
        outer.attach(body)
        composed = outer.as_string()
        server = smtplib.SMTP("smtp.gmail.com",587)

        server.ehlo()
        server.starttls()
        server.ehlo
        server.login('autoemail_satbi@sat.co.id', 'qihb zdzs mjsk xzmp')

        sender = 'autoemail_satbi@sat.co.id'  # customizeable
        try:
            server.sendmail(sender, recipients, composed)
            server.quit()
            rs[0] = True
            rs[1] = 'Email berhasil dikirim !'
            Log.info(f'{nik} | BERHASIL MENGIRIM EMAIL |')
        except Exception as e:
            rs[1] = 'Email gagal dikirim ! Error : '+str(e)
            Log.error(f'{nik} | GAGAL MENGIRIM EMAIL | Error on line {sys.exc_info()[-1].tb_lineno}, {type(e).__name__,} {e}')
        
        return {"status":rs[0],"msg":rs[1]}

    except Exception as e:
            Log.error(f'{nik} | GAGAL FUNGSI SEND MAIL | Error on line {sys.exc_info()[-1].tb_lineno}, {type(e).__name__,} {e}')
            return rMsgBox(f'GAGAL FUNGSI SEND MAIL<br>')






# multilanguage
# def load_json(file_path):
#     """Load JSON data from a file."""
#     with open(file_path, 'r', encoding='utf-8') as file:
#         return json.load(file)

# def save_json(file_path, data):
#     """Save JSON data to a file."""
#     with open(file_path, 'w', encoding='utf-8') as file:
#         json.dump(data, file, ensure_ascii=False, indent=4)

# # Function to update the language history JSON file
# def update_language_history(file_path, ajax_data, default_language='ID'):
#     # Load existing data if the file exists, otherwise create a new structure
#     if os.path.exists(file_path):
#         with open(file_path, 'r', encoding='utf-8') as file:
#             language_history = json.load(file)
#     else:
#         language_history = {"ID": {}, "VN": {}, "EN": {}, "PH": {}}
#         with open(file_path, 'w', encoding='utf-8') as file:
#             json.dump(language_history, file, ensure_ascii=False, indent=4)
    
#     # Create the default language section if it doesn't exist
#     if default_language not in language_history:
#         language_history[default_language] = {}
    
#     # Update the default language section with ajax_data
#     for key, value in ajax_data.items():
#         exists = False
#         for lang in language_history:
#             if value in language_history[lang].values():
#                 exists = True
#                 break
#         if not exists:
#             # Add new data to all languages only if the key doesn't exist
#             if value not in language_history[default_language]:
#                 language_history[default_language][value] = value
#                 for lang in language_history:
#                     if lang != default_language and value not in language_history[lang]:
#                         language_history[lang][value] = ""  # Initialize with empty string
    
#     # Save the updated data back to the file
#     with open(file_path, 'w', encoding='utf-8') as file:
#         json.dump(language_history, file, ensure_ascii=False, indent=4)

# def multilanguageUpdater(menuId):

#     ajaxData = request.json.get('data')
#     oldLanguage = request.json.get('oldLanguage')
#     newLanguage = request.json.get('newLanguage')

#     # Create a temporary file path
#     file_path_apps_FORM = f'multilanguage/application/multi_language_{menuId}.json'
#     file_path_apps_CORE = f'multilanguage/core/CORE.json'
#     if oldLanguage=='' and newLanguage=='ID':
#         update_language_history(file_path_apps_FORM, ajaxData['FORM'])
#         update_language_history(file_path_apps_CORE, ajaxData['CORE'])

#     return {"status":True}

# def translate_string(file_paths, string_value, target_language):
#     """Translate or update strings in multiple JSON files."""
#     updated = False
    
#     for file_path in file_paths:
#         # Load JSON data from the current file
#         json_data = load_json(file_path)

#         # Check if the string exists in the ID (default language)
#         if string_value in json_data['ID']:
#             # If the string exists, return the translation from the target language
#             result = json_data[target_language].get(string_value, json_data['ID'][string_value])
#         else:
#             # If the string doesn't exist, update all languages with the new string
#             for lang in json_data:
#                 json_data[lang][string_value] = string_value
#             # Save the updated JSON data back to the file
#             save_json(file_path, json_data)
#             updated = True
#             result = json_data['ID'][string_value]

#     if not updated:
#         # If no file was updated, this means the string was found and translated in all files
#         return result
#     else:
#         # Return the result from the first file processed, assuming consistency
#         return result

# def extract_dict_from_string(input_string):
#     # Regular expression to match a dictionary in the string
#     match = re.search(r'\{.*\}', input_string.strip())
    
#     if match:
#         dict_string = match.group(0)
#         try:

#             clean_dict_string = re.sub(r'("msg_Param"\s*:\s*\{.*?\},?)', '', dict_string).strip()

#             # Convert the extracted string to a dictionary
#             dictionary = ast.literal_eval(clean_dict_string)

#             return dictionary
#         except (ValueError, SyntaxError) as e:
#             # Handle the error by printing and returning None
#             return None
#     else:
#         # Return None if no dictionary is found in the string
#         return None

# def scanMsgFromFile(menuId):
#     listMessage = []
#     with open('application/'+menuId+'.py', 'r') as file:
#         source_code = file.read()
#         tree = ast.parse(source_code)
            
#         # Function to extract return statements from the AST
#         class ReturnVisitor(ast.NodeVisitor):
#             def __init__(self):
#                 self.returns = []
            
#             def visit_Return(self, node):
#                 # Convert AST node to a source code string
#                 return_code = ast.get_source_segment(source_code, node)
#                 self.returns.append(return_code)
#                 self.generic_visit(node)
        
#         visitor = ReturnVisitor()
#         visitor.visit(tree)
        
#         for allreturn in visitor.returns:
#             dictionary = extract_dict_from_string(allreturn)
#             if isinstance(dictionary, dict):
#                 if "msg" in dictionary and dictionary["msg"] != "":
#                     listMessage.append(dictionary['msg'])
        
#         return listMessage
    
# def updateMultilanguageByMessagePY(file_path, string_list, language_history = None):
#     if language_history!=None:
#         with open(file_path, 'w', encoding='utf-8') as file:
#             json.dump(language_history, file, ensure_ascii=False, indent=4)
    
#     # Step 1: Read JSON data from the file
#     with open(file_path, 'r', encoding='utf-8') as file:
#         json_data = json.load(file)

#     # Step 2: Check for missing keys in the "ID" section
#     for string in string_list:
#         if string not in json_data["ID"]:
#             # Add the string as a new key with placeholder values in all language sections
#             json_data["ID"][string] = string  # Placeholder value
#             json_data["VN"][string] = ""  # Placeholder value or Vietnamese translation
#             json_data["EN"][string] = ""  # Placeholder value or English translation
#             json_data["PH"][string] = ""  # Placeholder value or Tagalog translation
    
#     # Step 3: Write the updated JSON data back to the file
#     with open(file_path, 'w', encoding='utf-8') as file:
#         json.dump(json_data, file, ensure_ascii=False, indent=4)

# def merge_json_files(file_paths):
#     """Merge multiple JSON files into a single dictionary."""
#     merged_data = {}
    
#     for file_path in file_paths:
#         # Load JSON data from the current file
#         json_data = load_json(file_path)
        
#         # Merge the data with the existing merged_data
#         for key, value in json_data.items():
#             if key in merged_data:
#                 if isinstance(merged_data[key], dict) and isinstance(value, dict):
#                     merged_data[key].update(value)
#                 elif isinstance(merged_data[key], list) and isinstance(value, list):
#                     merged_data[key].extend(value)
#                 else:
#                     merged_data[key] = value
#             else:
#                 merged_data[key] = value
#     return merged_data

# def process_and_update_multilanguage(file_path_form, string_value, target_language, custom=True):
#     """Process and update JSON files based on the custom flag."""
#     defaultCoreFilePath = 'multilanguage/core/CORE.json'
    
#     file_paths = []
#     file_paths.append(file_path_form)
#     file_paths.append(defaultCoreFilePath)

#     # Merge the JSON files
#     merged_data = merge_json_files(file_paths)
    
#     # Check if the string exists in ID section
#     if string_value in merged_data['ID']:
#         # Return the translation from the target language
#         return merged_data[target_language].get(string_value, merged_data['ID'][string_value])
#     else:
#         result = merged_data['ID'].get(string_value, string_value)
        
#         if custom:
#             # Update only the specific JSON file
#             # for file_path in file_paths:
#             json_data = load_json(file_path_form)
#             if string_value not in json_data['ID']:
#                 for lang in json_data:
#                     if lang=='ID':
#                         json_data[lang][string_value] = string_value
#                     else:
#                         json_data[lang][string_value] = ""
#                 save_json(file_path_form, json_data)
#         else:
#             # Update all JSON files
#             # for file_path in file_paths:
#             json_data = load_json(defaultCoreFilePath)
#             for lang in json_data:
#                 json_data[lang][string_value] = string_value
#             save_json(defaultCoreFilePath, json_data)

#         return result
    
# # Function to update the JSON data
# def update_json_API(file_path, language_id, updates):
#     # Step 1: Read the JSON data from the file
#     with open(file_path, 'r', encoding='utf-8') as file:
#         json_data = json.load(file)
    
#     # Step 2: Update the JSON data for the given language_id
#     if language_id in json_data:
#         for key, value in updates.items():
#             if key in json_data[language_id]:
#                 json_data[language_id][key] = value
#             else:
#                 print(f"Warning: '{key}' not found in '{language_id}' language keys")
#     else:
#         print(f"Error: Language ID '{language_id}' not found in the JSON data")
    
#     # Step 3: Write the updated JSON data back to the file
#     with open(file_path, 'w', encoding='utf-8') as file:
#         json.dump(json_data, file, ensure_ascii=False, indent=4)

#     return {'status':True,'msg':''}


def load_json_file(menuId):
    """Load JSON data from a file."""
    print(2709, f"========= Multilanguage - Load Json File by Menu Id {menuId} =========")
    file_path_apps_FORM = f'multilanguage/application/multi_language_{menuId}.json'
    file_path_apps_CORE = f'multilanguage/core/CORE.json'

    if menuId != 'CORE':
        with open(file_path_apps_FORM, 'r', encoding='utf-8') as file:
            return json.load(file), 1
    else:
        with open(file_path_apps_CORE, 'r', encoding='utf-8') as file:
            return json.load(file), 1

def save_json_file(data, menuId):
    """Save JSON data to a file."""
    file_path_apps_FORM = f'multilanguage/application/multi_language_{menuId}.json'
    file_path_apps_CORE = f'multilanguage/core/CORE.json'

    if menuId != 'CORE':
        with open(file_path_apps_FORM, 'w', encoding='utf-8') as file:
            json.dump(data, file, ensure_ascii=False, indent=4)
    else:
        with open(file_path_apps_CORE, 'w', encoding='utf-8') as file:
            json.dump(data, file, ensure_ascii=False, indent=4)

def load_json(connectionDb,menuId):
    """
    Load JSON data from a file.
    """

    print(2711, f"========= Multilanguage - Load Json Database by Menu Id {menuId} =========")

    nik = session['loggedId']['nik']

    #Get JSON from DB
    sql= """
    SELECT COALESCE(
        (
            SELECT oml_json_multilanguage
            FROM dmhr.oden_multi_language
            WHERE oml_menu_id = %(menuId)s
            and oml_app_id = %(appId)s
        ),
        '{}'::json
    ) as jsonfile, 
    (
        SELECT COUNT(*)
        FROM dmhr.oden_multi_language
        WHERE oml_menu_id = %(menuId)s
        and oml_app_id = %(appId)s
    ) as count
    """
    ajax_data = {}
    ajax_data["menuId"] = menuId
    ajax_data["appId"] = globalVar.APP_ID

    resultData =  connectionDb.selectDataHeader(sql,ajax_data)
    print("resultData === ",resultData)
    if resultData['status']:
        data = convertDictKeyVal(resultData['data'])

        # Step 1: Read JSON data from the DB
        if data[0]['jsonfile']!=None and data[0]['jsonfile']!='' and data[0]['jsonfile']!={}:
            return data[0]['jsonfile'], data[0]['count']
        else:
            multilanguageDict = {}

            if globalVar.MULTI_LANGUAGE_ID==None:
                globalVar.MULTI_LANGUAGE_ID = ["ID", "EN"]

            for idLanguage in globalVar.MULTI_LANGUAGE_ID:
                multilanguageDict[idLanguage] = {}

            return multilanguageDict, 0
    else:
        print(f"{nik} | UTILITIES | load_json | Error: Query Error Get Data JSON")
        Log.error(f"{nik} | UTILITIES | load_json | Error: Query Error Get Data JSON")
    
def save_json(connectionDb,menuId, language_history, statusTransactionJSON):
    
    """
    Save JSON data to a file.
    """

    print(2764, f"========= Multilanguage - Save Json Database by Menu Id {menuId} - {statusTransactionJSON} =========")
    
    nik = session['loggedId']['nik']
    
    if statusTransactionJSON=="UPDATE":
        sqlTransaction = """
        UPDATE dmhr.oden_multi_language
        SET oml_json_multilanguage=%(languageHistory)s::json
        WHERE oml_menu_id=%(menuId)s AND oml_app_id=%(appId)s;
        """
    elif statusTransactionJSON=="INSERT":
        sqlTransaction = """
        INSERT INTO dmhr.oden_multi_language
        (oml_menu_id, oml_app_id, oml_json_multilanguage, oml_create_user, oml_create_date, oml_update_user, oml_update_date)
        VALUES(%(menuId)s, %(appId)s, %(languageHistory)s::json, %(nik)s, NOW() AT TIME ZONE 'Asia/Jakarta', %(nik)s, NOW() AT TIME ZONE 'Asia/Jakarta');
        """

    paramTransaction = {
        'languageHistory':json.dumps(language_history,ensure_ascii=False),
        'menuId':menuId,
        'appId':globalVar.APP_ID,
        'nik':nik
    }

    # print(2324, sqlTransaction%paramTransaction)    
    connectionDb.executeData(sqlTransaction,paramTransaction)




def update_language_history(menuId, ajax_data, default_language='ID'):
    """
    Function to update the language history JSON DB
    """

    print(2797, f"========= Multilanguage - Update Language History by Menu Id {menuId} =========")


    connUpdateLanguageHistory = Database(globalVar.DB_NAME)
    if globalVar.PRODUCTION == 'N':
        if globalVar.ALWAYS_UPDATE_MULTILANGUAGE == "N":
            #Get JSON from DB
            language_history,countData = load_json(connUpdateLanguageHistory, menuId)
        else:
            language_history = {"ID":{}}
            countData = 0
    else:
        #Get JSON from DB
        language_history,countData = load_json_file(menuId)
        connUpdateLanguageHistory.close()
        return language_history

    # Create the default language section if it doesn't exist
    if default_language not in language_history:
        language_history[default_language] = {}

    if globalVar.MULTI_LANGUAGE_ID==None:
        globalVar.MULTI_LANGUAGE_ID = ["ID", "EN"]

    for langId in globalVar.MULTI_LANGUAGE_ID:
        if langId not in language_history.keys():
            language_history[langId] = {}

    # Update the default language section with ajax_data
    for key, value in ajax_data.items():
        exists = False
        for lang in language_history:
            if value in language_history[lang].values():
                exists = True
                break
        if not exists:
            # Add new data to all languages only if the key doesn't exist
            if value not in language_history[default_language]:
                language_history[default_language][value] = value
                for lang in language_history:
                    if lang != default_language and value not in language_history[lang]:
                        language_history[lang][value] = ""  # Initialize with empty string
            else:
                for lang in language_history:
                    if lang != default_language and value not in language_history[lang]:
                        language_history[lang][value] = ""  # Initialize with empty string
    
    for stringLangId in language_history['ID']:
        for idLanguange in globalVar.MULTI_LANGUAGE_ID:
            if idLanguange!="ID":
                if idLanguange not in language_history:
                    language_history[idLanguange] = {}
                
                if stringLangId not in language_history[idLanguange]:
                    language_history[idLanguange][stringLangId] = ""

    
    language_history = translateJSON(language_history)

    if globalVar.PRODUCTION == 'N':
        if globalVar.ALWAYS_UPDATE_MULTILANGUAGE == "N":
            if int(countData)!=0:
                save_json(connUpdateLanguageHistory,menuId,language_history,"UPDATE")
            else:
                save_json(connUpdateLanguageHistory,menuId,language_history,"INSERT")

    connUpdateLanguageHistory.close()

    return language_history

def multilanguageUpdater(menuId):
    """
    Updater Multilanguage Form Tujuan dan CORE
    """

    print(2856, f"========= Multilanguage - Multilanguage Updater by Menu Id {menuId} =========")

    ajaxData = request.json.get('data')
    oldLanguage = request.json.get('oldLanguage')
    newLanguage = request.json.get('newLanguage')

    if oldLanguage=='' and newLanguage=='ID':
        formMultiLanguage = update_language_history(menuId, ajaxData['FORM'])
        coreMultiLanguage = update_language_history('CORE', ajaxData['CORE'])

        if globalVar.PRODUCTION == 'N':
            #write ke file local
            save_json_file(formMultiLanguage,menuId)
            save_json_file(coreMultiLanguage,'CORE')

        #merge and backdata to JS
        merged = {}
        for lang in set(formMultiLanguage) | set(coreMultiLanguage):  # union of language keys
            merged[lang] = {**formMultiLanguage.get(lang, {}), **coreMultiLanguage.get(lang, {})}
        
        return {"status":True, "data":merged}

    return {"status":True}

# belum ketemu pakai dimana
# def translate_string(file_paths, string_value, target_language):
#     """Translate or update strings in multiple JSON files."""
#     updated = False
    
#     for file_path in file_paths:
#         # Load JSON data from the current file
#         json_data = load_json(file_path)

#         # Check if the string exists in the ID (default language)
#         if string_value in json_data['ID']:
#             # If the string exists, return the translation from the target language
#             result = json_data[target_language].get(string_value, json_data['ID'][string_value])
#         else:
#             # If the string doesn't exist, update all languages with the new string
#             for lang in json_data:
#                 json_data[lang][string_value] = string_value
#             # Save the updated JSON data back to the file
#             save_json(file_path, json_data)
#             updated = True
#             result = json_data['ID'][string_value]

#     if not updated:
#         # If no file was updated, this means the string was found and translated in all files
#         return result
#     else:
#         # Return the result from the first file processed, assuming consistency
#         return result

# def extract_dict_from_string(input_string):
#     """
#     Function untuk membuat dictionary dari string msg_Param
#     """
    
#     # Regular expression to match a dictionary in the string
#     match = re.search(r'\{.*\}', input_string.strip())
    
#     if match:
#         dict_string = match.group(0)
#         try:

#             clean_dict_string = re.sub(r'("msg_Param"\s*:\s*\{.*?\},?)', '', dict_string).strip()

#             # Convert the extracted string to a dictionary
#             dictionary = ast.literal_eval(clean_dict_string)

#             return dictionary
#         except (ValueError, SyntaxError) as e:
#             # Handle the error by printing and returning None
#             return None
#     else:
#         # Return None if no dictionary is found in the string
#         return None
        
#         return listMessage
def scanMsgFromFile(menuId):
    """
    Scan from file PY each FORM
    """

    print(2928, f"========= Multilanguage - Scan Message From File PY by Menu Id {menuId} =========")

    listMessage = []
    datetimeNow = datetime.now()
   
    print(f'================== START SCAN FILE {datetimeNow} ==================')
    with open('application/'+menuId+'.py', 'r') as file:
        source_code = file.read()
        pattern = r'["\']msg["\']\s*:\s*f"""(.*?)"""|["\']msg["\']\s*:\s*f\'(.*?)\'|["\']msg["\']\s*:\s*[\'\"](.*?)[\'\"]'
        matches = re.findall(pattern, source_code, re.DOTALL)
        for match in matches:
            for stringFound in match:
                if stringFound != "":
                    stringFormat = stringFound.strip()
                    cleaned_text = stringFormat.replace(r'\n', '')
                    stringFormat = re.sub(r'\s+', ' ', cleaned_text)
                    listMessage.append(stringFormat)
        print(2523, listMessage)
        datetimeEND = datetime.now()
        print(f'================== END SCAN FILE {datetimeEND} ==================')
        print(f'================== {datetimeEND-datetimeNow} ==================')
        
        return listMessage
    
def scanMsgFromFileJS(menuId):
    """
    Scan from file JS each FORM
    """

    print(2957, f"========= Multilanguage - Scan Message From File JS by Menu Id {menuId} =========")
    
    tempReturnPesan = []
    with open('static/application/'+menuId+'.js', 'r') as file:
        content = file.read()
        
    pattern = r'["\']pesan["\']\s*:\s*["\']([^"\']*)["\']'
    matches = re.findall(pattern, content)
    for match in matches:
        if match not in tempReturnPesan:
            matchNew = match.strip()
            tempReturnPesan.append(matchNew)
            
    patternMSGPsn = r'["\']msg["\']\s*:\s*["\']([^"\']*)["\']'
    matches = re.findall(patternMSGPsn, content)
    for match in matches:
        if match not in tempReturnPesan:
            matchNew = match.strip()
            tempReturnPesan.append(matchNew)

    patternRMSG = r'RMSGBOX\((["\'])(.*?)\1\)'
    matches = re.findall(patternRMSG, content)
    for match in matches:
        if match not in tempReturnPesan:
            matchNew = match[1].strip()
            tempReturnPesan.append(matchNew)
        
    patternMSG = r'MSGBOX\((["\'])(.*?)\1\)'
    matches = re.findall(patternMSG, content)
    for match in matches:
        if match not in tempReturnPesan:
            matchNew = match[1].strip()
            tempReturnPesan.append(matchNew)
    
    return tempReturnPesan
    
def updateMultilanguageByMessagePY(menuId, string_list):
    
    connUpdateMultilanguageByMessagePY = Database(globalVar.DB_NAME)
    if globalVar.PRODUCTION == 'N':
        if globalVar.ALWAYS_UPDATE_MULTILANGUAGE == "N":
            language_history = {"ID":{}}
            countData = 0
        else:
            #Get JSON from DB
            language_history,countData = load_json(connUpdateMultilanguageByMessagePY, menuId)
    else:
        if globalVar.ALWAYS_UPDATE_MULTILANGUAGE == "N":
            #Get JSON from File
            language_history,countData = load_json_file(menuId)
            connUpdateMultilanguageByMessagePY.close()
            return language_history
        else:
            return {"ID":{}}
        
    print(3097, "===========")

    print(language_history)

    # Step 2: Check for missing keys in the "ID" section
    print(2992, "========= Multilanguage - Comparasi Hasil Scan File PY dengan Json Database =========")
    for string in string_list:
        if string not in language_history["ID"]:
            # Add the string as a new key with placeholder values in all language sections
            language_history["ID"][string] = string  # Placeholder value
            if globalVar.MULTI_LANGUAGE_ID==None:
                globalVar.MULTI_LANGUAGE_ID = ["ID", "EN"]
            for idLanguange in globalVar.MULTI_LANGUAGE_ID:
                if idLanguange != 'ID':
                    if idLanguange not in language_history:
                        language_history[idLanguange] = {}
                    language_history[idLanguange][string] = ""  # Placeholder value or Vietnamese translation
        else:
            for idLanguange in globalVar.MULTI_LANGUAGE_ID:
                if idLanguange!="ID":
                    if idLanguange not in language_history:
                        language_history[idLanguange] = {}
                    
                    if string not in language_history[idLanguange]:
                        language_history[idLanguange][string] = ""
    
    print(3016, "========= Multilanguage - Menambahkan Code Bahasa Baru selain ID =========")
    for stringLangId in language_history['ID']:
        for idLanguange in globalVar.MULTI_LANGUAGE_ID:
            if idLanguange!="ID":
                if idLanguange not in language_history:
                    language_history[idLanguange] = {}
                
                if stringLangId not in language_history[idLanguange]:
                    language_history[idLanguange][stringLangId] = ""
    
    # Step 3: Write the updated JSON data back to the DB
    language_history = translateJSON(language_history)
    if globalVar.PRODUCTION == 'N':
        if globalVar.ALWAYS_UPDATE_MULTILANGUAGE != "N":
            if int(countData)!=0:
                save_json(connUpdateMultilanguageByMessagePY,menuId,language_history,"UPDATE")
            else:
                save_json(connUpdateMultilanguageByMessagePY,menuId,language_history,"INSERT")
    

    print(3037, "========= Multilanguage - Merge Data Form dengan Core =========")
    print(3143, language_history)
    language_history = merge_json_files(connUpdateMultilanguageByMessagePY,[menuId,"CORE"])

    connUpdateMultilanguageByMessagePY.close()

    return language_history

def merge_json_files(connectionDb,file_JSON_DB):
    """
    Merge multiple JSON files into a single dictionary.
    """

    print(3052, f"========= Multilanguage - Merge JSON olahan dengan JSON database Id =========")
    
    merged_data = {}    
    
    for menuId in file_JSON_DB:
        if globalVar.PRODUCTION == 'N':
            #Get JSON from DB
            language_history,countData = load_json(connectionDb, menuId)
        else:
            language_history,countData = load_json_file(menuId)
        
        # Merge the data with the existing merged_data
        for key, value in language_history.items():
            if key in merged_data:
                if isinstance(merged_data[key], dict) and isinstance(value, dict):
                    merged_data[key].update(value)
                elif isinstance(merged_data[key], list) and isinstance(value, list):
                    merged_data[key].extend(value)
                else:
                    merged_data[key] = value
            else:
                merged_data[key] = value
            
    return merged_data

def process_and_update_multilanguage(menuId, string_value, target_language, custom=True):
    """
    Process and update JSON files based on the custom flag
    """

    print(3079, f"========= Multilanguage - Process and Update Multilanguage by Menu Id {menuId} - {target_language} - {custom} =========")
    
    file_JSON_DB = []
    file_JSON_DB.append(menuId)
    file_JSON_DB.append('CORE')

    connProcessAndUpdateMultilanguage = Database(globalVar.DB_NAME)

    # Merge the JSON files
    merged_data = merge_json_files(connProcessAndUpdateMultilanguage,file_JSON_DB)
    
    # Check if the string exists in ID section
    if string_value in merged_data['ID']:
        # Return the translation from the target language
        return merged_data[target_language].get(string_value, merged_data['ID'][string_value])
    else:
        result = merged_data['ID'].get(string_value, string_value)
        
        if custom:
            # Update only the specific JSON file
            if globalVar.PRODUCTION == 'N':
                # for file_path in file_JSON_DB:
                json_data,countData = load_json(connProcessAndUpdateMultilanguage,menuId)
            else:
                json_data,countData = load_json_file(menuId)
            if globalVar.MULTI_LANGUAGE_ID==None:
                globalVar.MULTI_LANGUAGE_ID = ["ID", "EN"]

            for langId in globalVar.MULTI_LANGUAGE_ID:
                if langId not in json_data.keys():
                    json_data[langId] = {}
            if string_value not in json_data['ID']:
                for lang in json_data:
                    if lang=='ID':
                        json_data[lang][string_value] = string_value
                    else:
                        json_data[lang][string_value] = ""
            else:
                for lang in json_data:
                    if lang!='ID':
                        json_data[lang][string_value] = ""   
            # API translate
            json_data = translateJSON(json_data)
            if globalVar.PRODUCTION == 'N':
                save_json(connProcessAndUpdateMultilanguage, menuId, json_data, "UPDATE")
        else:
            # Update all JSON files
            if globalVar.PRODUCTION == 'N':
                # for file_path in file_JSON_DB:
                json_data,countData = load_json(connProcessAndUpdateMultilanguage, 'CORE')
            else:
                json_data,countData = load_json_file('CORE')
            
            if globalVar.MULTI_LANGUAGE_ID==None:
                globalVar.MULTI_LANGUAGE_ID = ["ID", "EN"]

            for langId in globalVar.MULTI_LANGUAGE_ID:
                if langId not in json_data.keys():
                    json_data[langId] = {}

            for lang in json_data:
                json_data[lang][string_value] = string_value

            json_data = translateJSON(json_data)
            if globalVar.PRODUCTION == 'N':
                # merge ke json_data
                save_json(connProcessAndUpdateMultilanguage, 'CORE', json_data, "UPDATE")

        return result
    
def update_json_API(menuId, language_id, updates):
    """
    Function to update the JSON data
    """

    print(3146, f"========= Multilanguage - Updater JSON API by Menu Id {menuId} =========")

    nik = session['loggedId']['nik']
    connUpdate_json_API = Database(globalVar.DB_NAME)

    # try:

    #Get JSON from DB
    sql= """
    SELECT COALESCE(
        (
            SELECT oml_json_multilanguage
            FROM dmhr.oden_multi_language
            WHERE oml_menu_id = %(menuId)s
            and oml_app_id = %(appId)s
        ),
        '{}'::json
    ) as jsonfile, 
    (
        SELECT COUNT(*)
        FROM dmhr.oden_multi_language
        WHERE oml_menu_id = %(menuId)s
        and oml_app_id = %(appId)s
    ) as count
    """
    ajax_data = {}
    ajax_data["menuId"] = menuId
    ajax_data["appId"] = globalVar.APP_ID

    resultData =  connUpdate_json_API.selectDataHeader(sql,ajax_data)
    if resultData['status']:
        data = convertDictKeyVal(resultData['data'])

        # Step 1: Read JSON data from the DB
        if data[0]['jsonfile']!=None and data[0]['jsonfile']!='' and data[0]['jsonfile']!={}:
            language_history = data[0]['jsonfile']
        else:
            language_history = {}
            print(2649, globalVar.MULTI_LANGUAGE_ID)
            if globalVar.MULTI_LANGUAGE_ID==None:
                globalVar.MULTI_LANGUAGE_ID = ["ID", "EN"]

            for idLanguage in globalVar.MULTI_LANGUAGE_ID:
                language_history[idLanguage] = {}
    
        # Step 2: Update the JSON data for the given language_id
        if language_id in language_history:
            for key, value in updates.items():
                if key in language_history[language_id]:
                    language_history[language_id][key] = value
                else:
                    print(f"Warning: '{key}' not found in '{language_id}' language keys")
        else:
            print(f"Error: Language ID '{language_id}' not found in the JSON data")
            Log.error(f"{nik} | UTILITIES | update_json_API | Error: Language ID '{language_id}' not found in the JSON data")
    
        # Step 3: Write the updated JSON data back to the DB
        if int(data[0]['count'])!=0:
            sqlTransaction = """
            UPDATE dmhr.oden_multi_language
            SET oml_json_multilanguage=%(languageHistory)s::json
            WHERE oml_menu_id=%(menuId)s AND oml_app_id=%(appId)s;

            """
        else:
            sqlTransaction = """
            INSERT INTO dmhr.oden_multi_language
            (oml_menu_id, oml_app_id, oml_json_multilanguage, oml_create_user, oml_create_date, oml_update_user, oml_update_date)
            VALUES(%(menuId)s, %(appId)s, %(languageHistory)s::json, %(nik)s, NOW() AT TIME ZONE 'Asia/Jakarta', %(nik)s, NOW() AT TIME ZONE 'Asia/Jakarta');
            """

        paramTransaction = {
            'languageHistory':json.dumps(language_history),
            'menuId':menuId,
            'appId':globalVar.APP_ID,
            'nik':nik
        }
        
        resultSaveJSON = connUpdate_json_API.executeData(sqlTransaction,paramTransaction)
        connUpdate_json_API.close()
        if resultSaveJSON['status'] is False:
            print(f"{nik} | UTILITIES | update_json_API | Error: Gagal Save Data JSON")
            Log.error(f"{nik} | UTILITIES | update_json_API | Error: Gagal Save Data JSON")
            Log.error(f"{nik} | UTILITIES | update_json_API | {str(resultSaveJSON)}")
            return {"status":False, "msg":"update_json_API | Gagal Save Data JSON"}
        else:
            return {"status":True}
    else:
        connUpdate_json_API.close()
        print(f"{nik} | UTILITIES | update_json_API | Error: Query Error Get Data JSON")
        Log.error(f"{nik} | UTILITIES | update_json_API | Error: Query Error Get Data JSON - {str(sql%ajax_data)}")
        Log.error(f"{nik} | UTILITIES | update_json_API | {str(resultData)}")
        

def translateJSON(json_lang) -> dict:
    """Translates text into the target language.

    Target must be an ISO 639-1 language code.
    See https://g.co/cloud/translate/v2/translate-reference#supported_languages

    Example of use:
        {
            "ID": {
                    "Contoh 1": "Contoh 1",
                    "Contoh 2": "Contoh 2",
                    "Contoh 3": "Contoh 3"
            },
            "EN": {
                    "Contoh 1": "Example 1",
                    "Contoh 2": "Example 2",
                    "Contoh 3": "Example 3"
            },
            "VI": {
                    "Contoh 1": "Ví dụ 1",
                    "Contoh 2": "Ví dụ 2",
                    "Contoh 3": "Ví dụ 3"
            },
        }

    """
    print(3369,"========= +++++++++++++ =========== TRANSLATE JSON LIB")
    if globalVar.ALWAYS_UPDATE_MULTILANGUAGE!="Y":
        print(3370, "LANGSUNG OUT")
        return json_lang
    print(3266, f"========= Multilanguage - Translate JSON =========")

    # Log.info(f"JSON_LANG = {str(json_lang)}")

    # try:
    #     from google.cloud import translate_v2 as translate
    # except ImportError:
    #     import subprocess
    #     import sys
    #     subprocess.check_call([sys.executable, "-m", "pip", "install", "google-cloud-translate==2.0.1"])
    #     from google.cloud import translate_v2 as translate

    # from google.cloud import translate_v2 as translate

    translate_client = translate.Client()
    tampunganLogTranslate = {}
    
    datetimeNow = datetime.now()
   
    print(f'============== API TRANSLATE START | {datetimeNow}')
    Log.info(f'============== API TRANSLATE START | {datetimeNow}')
    for lan in json_lang.keys():
        if lan != "ID":
            tampunganLogTranslate[lan] = {}
            for key in json_lang[lan].keys():
                if json_lang[lan][key] == "":
                    translateString = translate_client.translate(
                        json_lang["ID"][key], target_language=lan
                    )
                    json_lang[lan][key] = translateString["translatedText"]
                    tampunganLogTranslate[lan][key] = translateString["translatedText"]
                    
    datetimeEnd = datetime.now()
    print(f'============== TIME | {datetimeEnd - datetimeNow }')
    print(f'============== API TRANSLATE END | {datetimeEnd}')
    Log.info(f"============== TIME | {datetimeEnd - datetimeNow }")
    Log.info(f"'============== API TRANSLATE END | {datetimeEnd}")
    return json_lang


def getMultilanguageOptionsJS():
    
    print(3302, f"========= Multilanguage - Get Data Multilanguage Combo =========")
    tempDictMultilanguage = {} 
    listLang = []

    sqlLanguage = """
    SELECT mloml_language_id as code, mloml_language_desc as desc
    FROM master_language_oden_multi_language
    """
    resultQuerry = selectHeaderQueryRO(sqlLanguage)
    if resultQuerry['status']:
        listdataLanguage = resultQuerry['data']
        for objLanguage in listdataLanguage:
            listLang.append(objLanguage['code'])
            tempDictMultilanguage[objLanguage['code']] = objLanguage['desc'] 
    else:
        Log.error(f"ERROR GET DATA MASTER MULTILANGUAGE | {str(resultQuerry)}")
        listLang = ['ID','EN']
        tempDictMultilanguage['ID'] = "Indonesia"
        tempDictMultilanguage['EN'] = "English"
    
    # {id:"ID", value:"Indonesia"},{id:"EN", value:"English"},{id:"VN", value:"Vietnam"},{id:"PH", value:"Philippines"}
    # tempDictMultilanguage = {
    #     "ID":"Indonesia",
    #     "EN":"English",
    #     "VI":"Vietnamese",
    #     "ZH":"Chinese",
    #     "JA":"Japanese",
    #     "AR":"Arabic"
    # }



    returnOptionsMultilanguage = []
    for langId in listLang:
        valueLanguage = tempDictMultilanguage[langId]
        if valueLanguage==None:
            valueLanguage = "-"
        returnOptionsMultilanguage.append({"id":langId, "value":valueLanguage})
    
    return returnOptionsMultilanguage, listLang

