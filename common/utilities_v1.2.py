"""
Update : 2025-10-01
Common Util Oden V3
Update :    - NON RO Multilanguage
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
        print("checkExternalApi")
        whiteListFunc = ['getCountData']
        
        if(request.method == 'GET'):
            ajaxData = json.loads(request.args.get('data'))
            menuId = request.args.get('menuId')
            apiName = request.args.get('apiName')
        elif(request.method == 'POST'):
            ajaxData = request.json.get('data', {})
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
    # print(listBlock)
    for block in listBlock:
        if block.relationBlock is None:
            blockMaster = block.blockId
            break

    for block in listBlock:
        if block.relationBlock and block.relationBlock.blockId == blockMaster:
            blockChild.append(block.blockId)

    for block in listBlock:
        # print(143, blockChild, block.relationBlock)
        if block.relationBlock and block.relationBlock.blockId in blockChild:
            blockGrandChild.append(block.blockId)
    # print(blockMaster)
    # print(blockChild)
    # print(blockGrandChild)
    # ----------------- VALIDASI 1 -----------------
    # PROTEKSI KETIKA INSERT 3 LEVEL BLOCK
    if len(ajaxData) > 2 and blockGrandChild:
        return {"status":False, "data":{"code":200,"msg":f"Maximum insert or update is 2 block once a time!"},"msg":f"Maximum insert or update is 2 block once a time!"} 
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
            return {"status":False, "data":{"code":400,"msg":f"No data found!"}}
    
    if ajaxBlockMaster != None and len(ajaxBlockChild) != 0:
        # INSERT MASTER DAN CHILD, MAKA MASTER HANYA BOLEH 1 ROW
        if len(ajaxData.get(ajaxBlockMaster).get('data')) > 1:
            return {"status":False, "data":{"code":400,"msg":f"Maximum insert or update is 1 row for master block!"},"msg":f"Maximum insert or update is 1 row for master block!"} 
    # ----- UPDATE VALIDASI: 30 Juli 2025 -----

    # ----------------- VALIDASI 2 -----------------
    # ----------------- VALIDASI 3 -----------------
    # PROTEKSI KETIKA DATA YANG TIDAK MENGIKUTI HIRARKI PARENT-CHILD
    # print(181,"!!!!!!!!!!!!", ajaxBlockMaster, ajaxBlockChild, ajaxBlockGrandchild)
    if ajaxBlockMaster is not None and len(ajaxBlockChild) != 0:
        if ajaxBlockMaster == blockMaster and any(item in ajaxBlockChild for item in blockChild):
            statusValidasi = True
        elif ajaxBlockMaster == blockChild and any(item in ajaxBlockChild for item in blockGrandChild):
            statusValidasi = True
        else:
            return {"status":False, "data":{"code":400,"msg":f"Only two levels of related blocks can be inserted or updated!"},"msg":f"Only two levels of related blocks can be inserted or updated!"}
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

@exposeApi
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
        
        print(f"FAILED GET COUNT DATA - {traceback.format_exc()}")
        Log.error(f'{nik} | FAILED GET COUNT DATA | {traceback.format_exc()}')
        Log.error(f'{nik} | FAILED GET COUNT DATA | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Failed to Get Total Data')
    
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
        print(f"FAILED Validate PK Call Form - {traceback.format_exc()}")
        Log.error(f'{nik} | FAILED Validate PK Call Form | {traceback.format_exc()}')
        return rMsgBox(f'Failed to Validate PK Call Form')

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
        print(f"Failed To Validate Non Base - {traceback.format_exc()}")
        Log.error(f'{nik} | Failed To Validate Non Base | {traceback.format_exc()}')
        return rMsgBox(f'Failed To Validate Non Base')

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
        print(f"FAILED MODIFY LIST TO DICTIONARY - {traceback.format_exc()}")
        Log.error(f'{nik} | FAILED MODIFY LIST TO DICTIONARY | {traceback.format_exc()}')
        Log.error(f'{nik} | FAILED MODIFY LIST TO DICTIONARY | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Failed Modify List To Dictionary')

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
        print(f"FAILED TO DELETE SPECIAL CHARACTER - {traceback.format_exc()}")
        Log.error(f'{nik} | FAILED TO DELETE SPECIAL CHARACTER | {traceback.format_exc()}')
        Log.error(f'{nik} | FAILED TO DELETE SPECIAL CHARACTER | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Failed To Delete Special Character')

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
        print(f"FAILED TO CHANGE FILE TO STRING - {traceback.format_exc()}")
        Log.error(f'{nik} | FAILED TO CHANGE FILE TO STRING | {traceback.format_exc()}')
        Log.error(f'{nik} | FAILED TO CHANGE FILE TO STRING | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Failed To Change File To String')
    
def build_menu(menu_data, parent_id=''):
    menu = []
    for data in menu_data:
        if "_ND" in data[0]:
            continue
        if data[2] == parent_id or (data[2] == '' and parent_id == '') or (data[2] is None and parent_id == ''):
            submenu = build_menu(menu_data, parent_id=data[0])
            if submenu:
                menu.append({'id': data[0], 'value': data[1], 'icon': "mdi mdi-book", 'data': submenu})
            else:
                menu.append({'id': data[0], 'value': data[1], 'href': '/?type=VIEW&menuId=' + data[0],'icon': "mdi mdi-rhombus-medium"})
    return menu

def set_user_menu(getmenu):
    nik = session['loggedId']['nik']
    try:
        return str(build_menu(getmenu[1]['data']['menu_id']))


    except Exception as exp:
        print(f"FAILED TO SET USER MENU ACCESS - {traceback.format_exc()}")
        Log.error(f'{nik} | FAILED TO SET USER MENU ACCESS | {traceback.format_exc()}')
        Log.error(f'{nik} | FAILED TO SET USER MENU ACCESS | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Failed to set user menu access')

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
        # print(f"SEND API PRINT REPORT - {appId} - {request_data}")
        saltedhashTemp = saltedhash.create(appId, request_data)
        # print(f"SEND API PRINT REPORT - {saltedhashTemp}")
        saltedhashTemp = saltedhashTemp.get('data', '')      
        data['status'] = True
        data['url'] = urlClient + "/?data=" + str(saltedhashTemp)
        data['message'] = 'Success'
        return jsonify(data)
    except Exception as exp:
        print(f"FAILED API PRINT REPORT - {traceback.format_exc()}")
        Log.error(f'{nik} | FAILED API PRINT REPORT | {traceback.format_exc()}')
        Log.error(f'{nik} | FAILED API PRINT REPORT | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Failed Api Print Report')

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
        print(f"FAILED TO CONVERT DICT KEY VALUE - {traceback.format_exc()}")
        Log.error(f'{nik} | FAILED TO CONVERT DICT KEY VALUE | {traceback.format_exc()}')
        Log.error(f'{nik} | FAILED TO CONVERT DICT KEY VALUE | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Failed To Convert Dict Key Value')

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
        print(f"FAILED SELECT HEADER QUERY - {traceback.format_exc()}")
        Log.error(f'{nik} | FAILED SELECT HEADER QUERY | {traceback.format_exc()}')
        Log.error(f'{nik} | FAILED SELECT HEADER QUERY | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Failed To Select Header Query')

def selectHeaderQueryRO(query):
    nik = session['loggedId']['nik']
    dictResult = {}
    try:
        result = globalVar.CONN_RO.selectHeader(query)
    
    except psycopg2.InterfaceError as exp:
        print(f"FAILED SELECT HEADER QUERY RO - {traceback.format_exc()}")
        Log.error(f'{nik} | FAILED SELECT HEADER QUERY RO | {traceback.format_exc()}')
        Log.error(f'{nik} Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        globalVar.CONN_RO.close()
        globalVar.CONN_RO =  DatabaseRO(globalVar.DB_NAME)
        return selectHeaderQueryRO(query)
    except psycopg2.OperationalError as exp:
        print(f"FAILED SELECT HEADER QUERY RO - {traceback.format_exc()}")
        Log.error(f'{nik} | FAILED SELECT HEADER QUERY RO | {traceback.format_exc()}')
        Log.error(f'{nik} Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        globalVar.CONN_RO.close()
        globalVar.CONN_RO =  DatabaseRO(globalVar.DB_NAME)
        return selectHeaderQueryRO(query)
    except psycopg2.errors.InFailedSqlTransaction as exp:
        print(f"FAILED SELECT HEADER QUERY RO - {traceback.format_exc()}")
        Log.error(f'{nik} | FAILED SELECT HEADER QUERY RO | {traceback.format_exc()}')
        Log.error(f'{nik} Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        globalVar.CONN_RO.close()
        globalVar.CONN_RO =  DatabaseRO(globalVar.DB_NAME)
        return selectHeaderQueryRO(query)
    except Exception as exp:
        print(f"FAILED SELECT HEADER QUERY RO - {traceback.format_exc()}")
        Log.error(f'{nik} | FAILED SELECT HEADER QUERY RO | {traceback.format_exc()}')
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
        print(f"FAILED SELECT DATA HEADER QUERY - {traceback.format_exc()}")
        Log.error(f'{nik} | FAILED SELECT DATA HEADER QUERY | {traceback.format_exc()}')
        Log.error(f'{nik} | FAILED SELECT DATA HEADER QUERY | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Failed To Select Data Header Query')

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
        print(f"FAILED SELECT QUERY - {traceback.format_exc()}")
        Log.error(f'{nik} | FAILED SELECT QUERY | {traceback.format_exc()}')
        Log.error(f'{nik} | FAILED SELECT QUERY | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Failed To Select Query')

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
        print(f"FAILED SELECT DATA QUERY - {traceback.format_exc()}")
        Log.error(f'{nik} | FAILED SELECT DATA QUERY | {traceback.format_exc()}')
        Log.error(f'{nik} | FAILED SELECT DATA QUERY | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Failed To Select Data Query')        

def selectDataQueryRO(query,param):
    nik = session['loggedId']['nik']
    dictResult = {}
    try:
        result = globalVar.CONN_RO.selectData(query,param)
    except psycopg2.InterfaceError as exp:
        print(f"FAILED SELECT DATA QUERY RO - {traceback.format_exc()}")
        Log.error(f'{nik} | FAILED SELECT DATA QUERY RO | {traceback.format_exc()}')
        Log.error(f'{nik} | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        globalVar.CONN_RO.close()
        globalVar.CONN_RO =  DatabaseRO(globalVar.DB_NAME)
        return selectDataQueryRO(query,param)
    except psycopg2.OperationalError as exp:
        print(f"FAILED SELECT DATA QUERY RO - {traceback.format_exc()}")
        Log.error(f'{nik} | FAILED SELECT DATA QUERY RO | {traceback.format_exc()}')
        Log.error(f'{nik} | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        globalVar.CONN_RO.close()
        globalVar.CONN_RO =  DatabaseRO(globalVar.DB_NAME)
        return selectDataQueryRO(query,param)
    except psycopg2.errors.InFailedSqlTransaction as exp:
        print(f"FAILED SELECT DATA QUERY RO - {traceback.format_exc()}")
        Log.error(f'{nik} | FAILED SELECT DATA QUERY RO | {traceback.format_exc()}')
        Log.error(f'{nik} | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        globalVar.CONN_RO.close()
        globalVar.CONN_RO =  DatabaseRO(globalVar.DB_NAME)
        return selectDataQueryRO(query,param)
    except Exception as exp:
        print(f"FAILED SELECT DATA QUERY RO - {traceback.format_exc()}")
        Log.error(f'{nik} | FAILED SELECT DATA QUERY RO | {traceback.format_exc()}')
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
        print(f"FAILED EXECUTE QUERY - {traceback.format_exc()}")
        Log.error(f'{nik} | FAILED EXECUTE QUERY | {traceback.format_exc()}')
        Log.error(f'{nik} | FAILED EXECUTE QUERY | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Failed To Execute Query')

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
        print(f"FAILED EXECUTE DATA QUERY - {traceback.format_exc()}")
        Log.error(f'{nik} | FAILED EXECUTE DATA QUERY | {traceback.format_exc()}')
        Log.error(f'{nik} | FAILED EXECUTE DATA QUERY | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Failed To Execute Data Query')

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
        print(f"FAILED EXECUTE DATA MANY - {traceback.format_exc()}")
        Log.error(f'{nik} | FAILED EXECUTE DATA MANY | {traceback.format_exc()}')
        Log.error(f'{nik} | FAILED EXECUTE DATA MANY | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Failed To Execute Data Query')

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
        return rMsgBox(f'Failed To Dictionary Param Generator')    

def addCreateUserForInsert(protoQuery,vNonVisibleColumns):
    nik = session['loggedId']['nik']

    try:
        if not vNonVisibleColumns:
            return protoQuery
        for column in vNonVisibleColumns:
            protoQuery=protoQuery + column[0] + ', '
        return protoQuery
    except Exception as exp:
        print(f"FAILED ADD CREATE USER FOR INSERT - {traceback.format_exc()}")
        Log.error(f'{nik} | FAILED ADD CREATE USER FOR INSERT | {traceback.format_exc()}')
        Log.error(f'{nik} | FAILED ADD CREATE USER FOR INSERT | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Failed To Add Create User For Insert')

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
        print(f"FAILED GENERATE INSERT - {traceback.format_exc()}")
        Log.error(f'{nik} | FAILED GENERATE INSERT | {traceback.format_exc()}')
        Log.error(f'{nik} | FAILED GENERATE INSERT | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Failed To Generate Insert')
    
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
        Log.error(f'{nik} | FAILED GENERATE INSERT RECORD | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Failed To Generate Insert Record')
    
def addCreateOrUpdateUser(protoQuery, vNonVisibleColumns, isUpdate=True):
    nik = session['loggedId']['nik']
    
    try:
        if not vNonVisibleColumns:
            return protoQuery
        updOrCreateUser=vNonVisibleColumns[0]
        protoQuery= protoQuery + updOrCreateUser + " = %("+vNonVisibleColumns[1]+")s, "
        return protoQuery
    except Exception as exp:
        print(f"FAILED CREATE ATAU UPDATE USER - {traceback.format_exc()}")
        Log.error(f'{nik} | FAILED CREATE ATAU UPDATE USER | {traceback.format_exc()}')
        Log.error(f'{nik} | FAILED CREATE ATAU UPDATE USER | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Failed To Create Atau Update User')
    
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
            Log.error(f'{nik} | FAILED GENERATE UPDATE | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return rMsgBox(f'Failed To Generate Update<br>{exp}')

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
        Log.error(f'{nik} | FAILED GENERATE UPDATE RECORD | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Failed To Generate Update Record')

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
        Log.error(f'{nik} | FAILED GENERATE SELECT | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Failed To Generate Select')      

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
        print(f"FAILED GENERATE DELETE - {traceback.format_exc()}")
        Log.error(f'{nik} | FAILED GENERATE DELETE | {traceback.format_exc()}')
        Log.error(f'{nik} | FAILED GENERATE DELETE | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Failed To Generate Delete')

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
        print(f"FAILED GENERATE ELEMENT - {traceback.format_exc()}")
        Log.error(f'{nik} | FAILED GENERATE ELEMENT | {traceback.format_exc()}')
        Log.error(f'{nik} | FAILED GENERATE ELEMENT | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Failed To Generate Element')
    
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
        print(f"FAILED GET MODUL SCRIPT - {traceback.format_exc()}")
        Log.error(f'{nik} | FAILED GET MODUL SCRIPT | {traceback.format_exc()}')
        Log.error(f'{nik} | FAILED GET MODUL SCRIPT | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Failed To Get Modul Script')

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
        print(f"FAILED SET DATA - {traceback.format_exc()}")
        Log.error(f'{nik} | FAILED SET DATA | {traceback.format_exc()}')
        Log.error(f'{nik} | FAILED SET DATA | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Failed To Set Data')    

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
        Log.error(f'{nik} | FAILED GET SELECT STATEMENT | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Failed To Get Select Statement')

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
        print(f"FAILED GET DELETE STATEMENT - {traceback.format_exc()}")
        Log.error(f'{nik} | FAILED GET DELETE STATEMENT | {traceback.format_exc()}')
        Log.error(f'{nik} | FAILED GET DELETE STATEMENT | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Failed To Get Delete Statement<br>{exp}')    

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
        print(f"FAILED GET INSERT STATEMENT - {traceback.format_exc()}")
        Log.error(f'{nik} | FAILED GET INSERT STATEMENT | {traceback.format_exc()}')
        Log.error(f'{nik} | FAILED GET INSERT STATEMENT | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Failed To Get Insert Statement')    

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
        print(f"FAILED GET UPDATE STATEMENT - {traceback.format_exc()}")
        Log.error(f'{nik} | FAILED GET UPDATE STATEMENT | {traceback.format_exc()}')
        Log.error(f'{nik} | FAILED GET UPDATE STATEMENT | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Failed To Get Update Statement')

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
        print(f"FAILED GENERATE DICTIONARY UPDATE - {traceback.format_exc()}")
        Log.error(f'{nik} | FAILED GENERATE DICTIONARY UPDATE | {traceback.format_exc()}')
        Log.error(f'{nik} | FAILED GENERATE DICTIONARY UPDATE | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Failed To Generate Dictionary Update')

def genBindParamUpdate(vRecord):
    nik = session['loggedId']['nik']
    changeItems = {}
    
    try:
        for item in vRecord.items:
            if item.changeStatus == True or item.primaryKey == True:
                changeItems.update({item.itemId:item.valueItem})
        return changeItems
    except Exception as exp:
        print(f"FAILED GENERATE BIND PARAM UPDATE - {traceback.format_exc()}")
        Log.error(f'{nik} | FAILED GENERATE BIND PARAM UPDATE | {traceback.format_exc()}')
        Log.error(f'{nik} | FAILED GENERATE BIND PARAM UPDATE | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Failed To Generate Bind Param Update')

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
        print(f"FAILED GENERATE BIND PARAM INSERT - {traceback.format_exc()}")
        Log.error(f'{nik} | FAILED GENERATE BIND PARAM INSERT | {traceback.format_exc()}')
        Log.error(f'{nik} | FAILED GENERATE BIND PARAM INSERT | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Failed To Generate Bind Param Insert')

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
                    return rMsgBox('Failed To Generate Insert Statement')
        return resultGenerateInsert
    except Exception as exp:
        print(f"FAILED GET INSERT STATEMENT RECORD (Utilities) - {traceback.format_exc()}")
        Log.error(f"{nik} | FAILED GET INSERT STATEMENT RECORD (Utilities) - | {traceback.format_exc()}")
        Log.error(f'{nik} | FAILED GET INSERT STATEMENT RECORD | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Failed To Get Insert Statement Record')

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
                    return rMsgBox('Failed To Generate Update Statement')
        return resultGenerateUpdate
    except Exception as exp:
        print(f"FAILED GET UPDATE STATEMENT RECORD (Utilities) - {traceback.format_exc()}")
        Log.error(f"{nik} | FAILED GET UPDATE STATEMENT RECORD (Utilities) - | {traceback.format_exc()}")
        Log.error(f'{nik} | FAILED GET UPDATE STATEMENT RECORD | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Failed To Get Update Statement Record')

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
        print(f"FAILED GENERATE DICTIONARY INSERT - {traceback.format_exc()}")
        Log.error(f'{nik} | FAILED GENERATE DICTIONARY INSERT | {traceback.format_exc()}')
        Log.error(f'{nik} | FAILED GENERATE DICTIONARY INSERT | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Failed To Generate Dictionary Insert')    

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
        print(f"FAILED GET DATA DISPLAY ITEM - {traceback.format_exc()}")
        Log.error(f'{nik} | FAILED GET DATA DISPLAY ITEM | {traceback.format_exc()}')    
        Log.error(f'{nik} | FAILED GET DATA DISPLAY ITEM | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return {'status':False,'data':{},'msg':f'Failed To Get Data Display Item'}       
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
    print(1406,"FILE HEX ",fileHex)
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
        'mp4':['69736f6d','4d534e56','6d703431','6d703432','4d344120','33677035'],
        'mov':['71742020','6d703432','69736f6d']
    }
    
    dictExtensionRegexCheck = {
        'jpg':'^ffd8ffe1.*457869660000'
    }
    
    # Special handling for MP4/MOV files
    def checkMp4MovSignature(hex_string, file_ext):
        if len(hex_string) >= 16 and hex_string[8:16] == "66747970":
            if len(hex_string) >= 24:
                brand = hex_string[16:24]
                return brand in dictExtensionSignature.get(file_ext, [])
            return True  # Has ftyp signature
        return False
    
    listExtensionWithoutHeader= ['csv']
    
    # Special check for MP4/MOV
    if fileExt in ['mp4', 'mov']:
        if checkMp4MovSignature(fileHex, fileExt):
            result = {'status': True, 'msg': 'valid'}
        else:
            result = {'status': False, 'msg': 'Invalid MP4/MOV file signature!'}
    elif not dictExtensionSignature.get(fileExt):
        result['status'] = False
        result['msg'] = 'Ekstensi tidak diperbolehkan!'
    else:
        if not fileHex.startswith(tuple(dictExtensionSignature.get(fileExt))):
            if dictExtensionRegexCheck.get(fileExt):
                match = re.search(dictExtensionRegexCheck[fileExt], fileHex)
                if match:
                    result['status'] = True
                else:
                    result['status'] = False
                    result['msg'] = 'File signature berbeda!'
            else:
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
                    return {"status":False, "msg":"pre-Transaction File Failed To"}
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
                    return {"status":False, "msg":"pre-Transaction File Failed To"}
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
    # print(1801)
    try:
        if typeFunc=="uploadFile":
            if session['loggedId']['access_menu']['status_access'].get('insert') == 'Y' and session['loggedId']['access_menu']['status_access'].get('update') == 'Y':
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
                            bucketName = valueFunc['bucketName']
                            folderName = valueFunc["folderName"]
                            if folderName[len(folderName) - 1] != '/':
                                folderName+="/"
                            folderName = folderName+valueFunc["tempFolderName"]
                            uploadedInBucket = []
                            # make connection
                            connBucket = SatBucket(bucketName)
                            
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
                            return {"status":False, "msg":"Failed To Upload Data in Local"}
                        
                else:
                    return {"status":False, "msg":checkingFile["msg"]}
            else:
                return {"status":False, "msg":"You Dont Have Access To Upload File"}
        elif typeFunc=="preTransaction":
            # print(1611)
            if session['loggedId']['access_menu']['status_access'].get('insert') == 'Y' and session['loggedId']['access_menu']['status_access'].get('update') == 'Y':
                if valueFunc["bucketName"]!= "local":
                    successMoveFile = []
                    connBucket = SatBucket(valueFunc['bucketName'])
                    client = connBucket.storage_client
                    bucket = client.bucket(valueFunc['bucketName'])
                    
                    for fileItemName in valueFunc["sequenceFile"]:
                        statusFile = False
                        folderName = valueFunc["folderName"]
                        if folderName[len(folderName) - 1] != '/':
                            folderName+="/"
                        folderName = folderName+valueFunc["tempFolderName"]
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
                        
                        
                        print(2040,"AFTER PASS",fileItemName, statusFile)
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
                return {"status":False, "msg":"You Dont Have Access to transaction File"}
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

                        # print(1686, jsonParam)

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
                            if responseDownload[2]['status']:
                                # Step 1: Decode the base64 string to binary data
                                binary_data = base64.b64decode(responseDownload[2]['data'])

                                # Step 2: Create a BytesIO object from the binary data
                                mem = io.BytesIO(binary_data)
                                mem.seek(0)

                                # Write the file-like object to a temporary file (if needed)
                                # with open('/tmp/tempfile', 'wb') as temp_file:
                                #     temp_file.write(binary_data)

                                # Use python-magic to determine the MIME type
                                mime = magic.Magic(mime=True)
                                mime_type = mime.from_buffer(binary_data)

                                # Send the file with the determined MIME type
                                
                                # return send_file(mem, as_attachment=True, download_name='aaaaa', mimetype=mime_type)
                                return {"status":True, "data":{"mimetype":mime_type}, "file":responseDownload[2]['data'], "msg":""}

                            else:
                                return {"status":False, "msg":responseDownload[2]['message']}

                        # if responseDownload['status']

                        # Decode the Base64 string to bytes
                    else:
                        # print(2076,valueFunc['bucketName'])
                        connBucket = SatBucket(valueFunc['bucketName'])
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
                return {"status":False, "msg":"You Dont Have Access To View File!"}
            
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
                        return {"status":False, "msg":"Failed To menghapus file, file tidak ditemukan"}
                if statusDelete:
                    return {"status":statusDelete, "filename":fileDeleted}
                else:
                    return {"status":statusDelete, "msg":fileDeleted}
            else:
                return {"status":False, "msg":"You Dont Have Access To Delete File"}
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
                return {"status":False, "msg":"You dont have access to View File"}
    except Exception as exp:
        # print(f"Generate Insert Record - {traceback.format_exc()}")
        Log.error(f'{nik} | Generate Insert Record | {traceback.format_exc()}')
        return {"status":False, "msg": "Other error in odenFileToBucket"}


def sendMail(recipients=[], cc=[], subject='', body='', alias='autoemail_satbi@sat.co.id', attachments=[]):
    nik = session['loggedId']['nik']

    try:
        rs = [False, '']
        
        if(recipients == [] or subject == "" or body == ""):
            Log.error(f'{nik} | FAILED MENGIRIM EMAIL (Recipients, Subject, Body Email cannot be empty)')
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
            rs[1] = 'Email successfully sended !'
            Log.info(f'{nik} | SUCCESS SEND EMAIL |')
        except Exception as e:
            rs[1] = 'Email failed to send ! Error : '+str(e)
            Log.error(f'{nik} | FAILED SEND EMAIL | Error on line {sys.exc_info()[-1].tb_lineno}, {type(e).__name__,} {e}')
        
        return {"status":rs[0],"msg":rs[1]}

    except Exception as e:
            Log.error(f'{nik} | FAILED FUNCTION SEND MAIL | Error on line {sys.exc_info()[-1].tb_lineno}, {type(e).__name__,} {e}')
            return rMsgBox(f'FAILED FUNCTION SEND MAIL<br>')





def update_language_history_old(menuId, ajax_data, default_language='ID'):
    """
    Function to update the language history JSON DB
    """

    print(2797, f"========= Multilanguage - Update Language History by Menu Id {menuId} =========")


    # connUpdateLanguageHistory = Database(globalVar.DB_NAME)

    getJSONMultilanguage = requests.post("https://translator-231387403177.asia-southeast2.run.app/loadJsonMultilanguage", 
        json={"data": {"menuId": menuId,"appId":globalVar.APP_ID,"requestLang": getattr(globalVar,"MULTI_LANGUAGE_ID",[])}},
        headers={"Content-Type": "application/json"}
    )
    getJSONMultilanguage = getJSONMultilanguage.json()
    language_history = getJSONMultilanguage['data'][0]
    countData = getJSONMultilanguage['data'][1]

    if globalVar.PRODUCTION == 'Y':
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

    print(f"2912 - 'json_lang': 'language_history'")
    print(f"language_history - {str(language_history)}")
    resultTranslate = requests.post("https://translator-231387403177.asia-southeast2.run.app/translate", 
        json={"data": {"json_lang": language_history}},
        headers={"Content-Type": "application/json"}
    )
    resultTranslate = resultTranslate.json()
    language_history = resultTranslate['data']

    if globalVar.PRODUCTION == 'N':
        if globalVar.ALWAYS_UPDATE_MULTILANGUAGE == "Y":
            # if int(countData)!=0:
            #     save_json(connUpdateLanguageHistory,menuId,language_history,"UPDATE")
            # else:
            #     save_json(connUpdateLanguageHistory,menuId,language_history,"INSERT")

            if int(countData)!=0:
                requests.post("https://translator-231387403177.asia-southeast2.run.app/saveJsonMultilanguage", 
                    json={"data": {"menuId":menuId, "languageHistory":language_history, "statusTransactionJSON":"UPDATE", "nik":session['loggedId']['nik'],"appId":globalVar.APP_ID}},
                    headers={"Content-Type": "application/json"}
                )
            else:
                requests.post("https://translator-231387403177.asia-southeast2.run.app/saveJsonMultilanguage", 
                    json={"data": {"menuId":menuId, "languageHistory":language_history, "statusTransactionJSON":"INSERT", "nik":session['loggedId']['nik'],"appId":globalVar.APP_ID}},
                    headers={"Content-Type": "application/json"}
                )

    return language_history

# After
def update_language_history(menuId, ajax_data, default_language='ID'):
    """
    Function to update the language history JSON DB
    """

    print(2797, f"========= Multilanguage - Update Language History by Menu Id {menuId} =========")


    # connUpdateLanguageHistory = Database(globalVar.DB_NAME)

    getJSONMultilanguage = requests.post("https://translator-231387403177.asia-southeast2.run.app/loadJsonMultilanguage", 
        json={"data": {"menuId": menuId,"appId":globalVar.APP_ID,"requestLang": getattr(globalVar,"MULTI_LANGUAGE_ID",[])}},
        headers={"Content-Type": "application/json"}
    )
    getJSONMultilanguage = getJSONMultilanguage.json()
    language_history = getJSONMultilanguage['data'][0]
    print(2579,language_history)
    countData = getJSONMultilanguage['data'][1]
    if globalVar.PRODUCTION == 'Y':
        return language_history

    # Create the default language section if it doesn't exist
    if default_language not in language_history:
        language_history[default_language] = {}

    if globalVar.MULTI_LANGUAGE_ID==None:
        globalVar.MULTI_LANGUAGE_ID = ["ID", "EN"]

    for langId in globalVar.MULTI_LANGUAGE_ID:
        if langId not in language_history.keys():
            language_history[langId] = {}

    newKeyTranslate= {}
    for key, value in ajax_data.items():
        # KEY TIDAK DIPAKAI, KARENA KEY DISINI ADALAH PENANDA ELEMENT DI JS
        exists = False
        for lang in language_history:
            if value in language_history[lang].values():
                exists = True
                break
        print("EXISTS",exists)
        if not exists:
            # Add new data to all languages only if the key doesn't exist
            if value not in language_history[default_language]:
                if default_language not in newKeyTranslate:
                    newKeyTranslate[default_language] = {}    
                newKeyTranslate[default_language][value] = value
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

    print(f"2912 - 'json_lang': 'language_history'")
    
    if len(newKeyTranslate) !=0:
        for langId in language_history.keys():
            if langId not in newKeyTranslate.keys():
                newKeyTranslate[langId] = {}
            for value in newKeyTranslate[default_language].keys():
                if langId != default_language:
                    newKeyTranslate[langId][value]=''
                
                
    
    resultTranslate = requests.post("https://translator-231387403177.asia-southeast2.run.app/translate", 
        json={"data": {"json_lang": newKeyTranslate}},
        headers={"Content-Type": "application/json"}
    )
    resultTranslate = resultTranslate.json()
    if not resultTranslate['status']:
        return resultTranslate
    
    afterTranslateJson = resultTranslate['data']
    if len(afterTranslateJson) != 0:
        Log.info(f"\n UTILITIES | update_language_history | NEW KEY LANGUAGE DETECTED FROM FILE PYTHON {menuId} | ")
        Log.info(f" {newKeyTranslate} \n")
        
        print(f"\n\n\n================================= LOG NEW KEY LANGUAGE (JAVASCRIPT {menuId}) =========================================")
        print(f"UTILITIES | update_language_history | NEW KEY LANGUAGE DETECTED FROM FILE JAVASCRIPT {menuId} | ")
        print(f" {newKeyTranslate} \n\n\n")
        
        for langId in language_history:
            for val in afterTranslateJson[langId]:
                if val in language_history[langId].keys():
                    language_history[langId][val] = afterTranslateJson[langId][val]
    print("2662,language_history",language_history)
    if globalVar.PRODUCTION == 'N':
        if globalVar.ALWAYS_UPDATE_MULTILANGUAGE == "Y":
            # if int(countData)!=0:
            #     save_json(connUpdateLanguageHistory,menuId,language_history,"UPDATE")
            # else:
            #     save_json(connUpdateLanguageHistory,menuId,language_history,"INSERT")
            print(2671,int(countData))
            if int(countData)!=0:
                requests.post("https://translator-231387403177.asia-southeast2.run.app/saveJsonMultilanguage", 
                    json={"data": {"menuId":menuId, "languageHistory":language_history, "statusTransactionJSON":"UPDATE", "nik":session['loggedId']['nik'],"appId":globalVar.APP_ID}},
                    headers={"Content-Type": "application/json"}
                )
            else:
                requests.post("https://translator-231387403177.asia-southeast2.run.app/saveJsonMultilanguage", 
                    json={"data": {"menuId":menuId, "languageHistory":language_history, "statusTransactionJSON":"INSERT", "nik":session['loggedId']['nik'],"appId":globalVar.APP_ID}},
                    headers={"Content-Type": "application/json"}
                )

    return language_history
def multilanguageUpdater(menuId):
    """
    Updater Multilanguage Form Tujuan dan CORE
    """

    print(2856, f"========= Multilanguage - Multilanguage Updater by Menu Id {menuId} =========")

    ajaxData = request.json.get('data')
    oldLanguage = request.json.get('oldLanguage')
    newLanguage = request.json.get('newLanguage')
    print("ajaxData = ",ajaxData['FORM'])
    if oldLanguage=='' and newLanguage=='ID':
        formMultiLanguage = update_language_history(menuId, ajaxData['FORM'])
        coreMultiLanguage = update_language_history('CORE', ajaxData['CORE'])
            

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
def scanMsgFromFilePY(menuId):
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
        # print(2523, listMessage)
        datetimeEND = datetime.now()
        print(f'================== END SCAN FILE {datetimeEND} ==================')
        print(f'================== {datetimeEND-datetimeNow} ==================')
        
        return listMessage
    
def scanMsgFromFileJS(menuId):
    """
    Scan from file JS each FORM
    """

    print(2957, f"========= Multilanguage - Scan Message From File JS by Menu Id {menuId} =========")
    messages = set()
    
    with open('static/application/'+menuId+'.js', 'r') as file:
        content = file.read()
        
    patterns = [
            r'["\']pesan["\']\s*:\s*["\']([^"\']*)["\']',
            r'["\']msg["\']\s*:\s*["\']([^"\']*)["\']',
            r'RMSGBOX\((["\'])(.*?)\1\)',
            r'MSGBOX\((["\'])(.*?)\1\)',
            r'pesan\s*:\s*["\']([^"\']*)["\']',
            r'msg\s*:\s*["\']([^"\']*)["\']'
        ]
        
    for pattern in patterns:
        matches = re.findall(pattern, content)
        for match in matches:
            msg = match[1] if isinstance(match, tuple) else match
            messages.add(msg.strip())
    return list(messages)
    
def updateMultilanguageByMessage(menuId, string_list):

    getJSONMultilanguage = requests.post("https://translator-231387403177.asia-southeast2.run.app/loadJsonMultilanguage", 
        json={"data": {"menuId": menuId,"appId":globalVar.APP_ID,"requestLang": getattr(globalVar,"MULTI_LANGUAGE_ID",[])}},
        headers={"Content-Type": "application/json"}
    )
    getJSONMultilanguage = getJSONMultilanguage.json()
    language_history = getJSONMultilanguage['data'][0]
    countData = getJSONMultilanguage['data'][1]

    print(f"HASIL - {str(language_history)}")
    if globalVar.PRODUCTION == 'Y':
        #Get JSON from DB
        language_history = merge_json_files([menuId, "CORE"])
        return language_history
        
        
    # Step 2: Check for missing keys in the "ID" section
    print(2992, "========= Multilanguage - Comparasi Hasil Scan File PY & JS dengan Json Database =========")

    print(3100, f"globalVar.MULTI_LANGUAGE_ID - {str(globalVar.MULTI_LANGUAGE_ID)}")
    newKeyTranslate = {}
    for string in string_list:
        if string not in language_history["ID"]:
            # Add the string as a new key with placeholder values in all language sections
            if globalVar.MULTI_LANGUAGE_ID==None:
                globalVar.MULTI_LANGUAGE_ID = ["ID", "EN"]
                
            for idLanguange in globalVar.MULTI_LANGUAGE_ID:
                if idLanguange != 'ID':
                    if idLanguange not in newKeyTranslate:
                        newKeyTranslate[idLanguange] = {}
                    newKeyTranslate[idLanguange][string] = ""  # Placeholder value 
                else:
                    if idLanguange not in newKeyTranslate:
                        newKeyTranslate[idLanguange] = {}
                    newKeyTranslate[idLanguange][string] = string
 
    
    # Step 3: Write the updated JSON data back to the DB
    
    resultTranslate = requests.post("https://translator-231387403177.asia-southeast2.run.app/translate", 
        json={"data": {"json_lang": newKeyTranslate}},
        headers={"Content-Type": "application/json"}
    )
    resultTranslate = resultTranslate.json()
    if not resultTranslate['status']:
        return resultTranslate
    
    afterTranslateJson = resultTranslate['data']
    if len(afterTranslateJson) != 0:
        Log.info(f"\n UTILITIES | updateMultilanguageByMessage | NEW KEY LANGUAGE DETECTED FROM FILE PYTHON & JS {menuId} | ")
        Log.info(f" {newKeyTranslate} \n")
        print(f"\n\n\n================================= LOG NEW KEY LANGUAGE (PYTHON & JS {menuId}) =========================================")
        print(f"UTILITIES | updateMultilanguageByMessage | NEW KEY LANGUAGE DETECTED FROM FILE PYTHON & JS {menuId} | ")
        print(f" {newKeyTranslate} \n\n\n")
        print(f"UTILITIES | updateMultilanguageByMessage | HASIL {menuId} | ")
        print(f" {afterTranslateJson} \n\n\n")
        for langId in language_history:
            if langId in afterTranslateJson.keys():
                for val in afterTranslateJson[langId]:
                    if val not in language_history[langId].keys():
                        language_history[langId].update(afterTranslateJson[langId])
   
    if globalVar.PRODUCTION == 'N':
        if globalVar.ALWAYS_UPDATE_MULTILANGUAGE == "Y":
            if int(countData)!=0:
                requests.post("https://translator-231387403177.asia-southeast2.run.app/saveJsonMultilanguage", 
                    json={"data": {"menuId":menuId, "languageHistory":language_history, "statusTransactionJSON":"UPDATE", "nik":session['loggedId']['nik'],"appId":globalVar.APP_ID}},
                    headers={"Content-Type": "application/json"}
                )
            else:
                requests.post("https://translator-231387403177.asia-southeast2.run.app/saveJsonMultilanguage", 
                    json={"data": {"menuId":menuId, "languageHistory":language_history, "statusTransactionJSON":"INSERT", "nik":session['loggedId']['nik'],"appId":globalVar.APP_ID}},
                    headers={"Content-Type": "application/json"}
                )
    

    print(3037, "========= Multilanguage - Merge Data Form dengan Core =========")
    # language_history = merge_json_files(connUpdateMultilanguageByMessagePY,[menuId,"CORE"])
    language_history = merge_json_files([menuId, "CORE"])

    # print(3143, language_history)
    return language_history

# BEFORE
# def updateMultilanguageByMessagePY(menuId, string_list):

#     getJSONMultilanguage = requests.post("https://translator-231387403177.asia-southeast2.run.app/loadJsonMultilanguage", 
#         json={"data": {"menuId": menuId}},
#         headers={"Content-Type": "application/json"}
#     )
#     getJSONMultilanguage = getJSONMultilanguage.json()
#     language_history = getJSONMultilanguage['data'][0]
#     countData = getJSONMultilanguage['data'][1]
#     newKeyTranslate = {}
#     print(f"HASIL - {str(language_history)}")
#     if globalVar.PRODUCTION == 'Y':
#         #Get JSON from DB
#         language_history = merge_json_files([menuId, "CORE"])
#         return language_history
        
        
#     # Step 2: Check for missing keys in the "ID" section
#     print(2992, "========= Multilanguage - Comparasi Hasil Scan File PY dengan Json Database =========")

#     print(3100, f"globalVar.MULTI_LANGUAGE_ID - {str(globalVar.MULTI_LANGUAGE_ID)}")
#     for string in string_list:
#         if string not in language_history["ID"]:
#             # Add the string as a new key with placeholder values in all language sections
#             language_history["ID"][string] = string  # Placeholder value
#             newKeyTranslate["ID"][string] = string  # Placeholder value
            
#             if globalVar.MULTI_LANGUAGE_ID==None:
#                 globalVar.MULTI_LANGUAGE_ID = ["ID", "EN"]
#             for idLanguange in globalVar.MULTI_LANGUAGE_ID:
#                 if idLanguange != 'ID':
#                     if idLanguange not in language_history:
#                         language_history[idLanguange] = {}
#                     language_history[idLanguange][string] = ""  # Placeholder value or Vietnamese translation
                        
#                     if idLanguange not in newKeyTranslate:
#                         newKeyTranslate[idLanguange] = {}
#                     newKeyTranslate[idLanguange][string] = ""
                    
#         else:
#             for idLanguange in globalVar.MULTI_LANGUAGE_ID:
#                 if idLanguange!="ID":
#                     if idLanguange not in language_history:
#                         language_history[idLanguange] = {}
#                     if string not in language_history[idLanguange]:
#                         language_history[idLanguange][string] = ""
                        
    
#     print(3016, "========= Multilanguage - Menambahkan Code Bahasa Baru selain ID =========")
#     for stringLangId in language_history['ID']:
#         for idLanguange in globalVar.MULTI_LANGUAGE_ID:
#             if idLanguange!="ID":
#                 if idLanguange not in language_history:
#                     language_history[idLanguange] = {}
                
#                 if stringLangId not in language_history[idLanguange]:
#                     language_history[idLanguange][stringLangId] = ""
                    
    
    
#     # Step 3: Write the updated JSON data back to the DB
#     print(3144, "TRANSLATE")
#     print("updateMultilanguageByMessagePY DATA YANG AKAN DI TRANSLATE ",newKeyTranslate)
#     resultTranslate = requests.post("https://translator-231387403177.asia-southeast2.run.app/translate", 
#         json={"data": {"json_lang": newKeyTranslate}},
#         headers={"Content-Type": "application/json"}
#     )
#     resultTranslate = resultTranslate.json()
#     print(2997,resultTranslate)
#     language_history = resultTranslate['data']
#     print(f"HASIL TRANSLATE - {str(language_history)}")
#     return language_history
#     if globalVar.PRODUCTION == 'N':
#         if globalVar.ALWAYS_UPDATE_MULTILANGUAGE == "Y":
#             print(3153, countData)
#             print(3154, type(countData))
#             if int(countData)!=0:
#                 requests.post("https://translator-231387403177.asia-southeast2.run.app/saveJsonMultilanguage", 
#                     json={"data": {"menuId":menuId, "languageHistory":language_history, "statusTransactionJSON":"UPDATE", "nik":session['loggedId']['nik']}},
#                     headers={"Content-Type": "application/json"}
#                 )
#             else:
#                 requests.post("https://translator-231387403177.asia-southeast2.run.app/saveJsonMultilanguage", 
#                     json={"data": {"menuId":menuId, "languageHistory":language_history, "statusTransactionJSON":"INSERT", "nik":session['loggedId']['nik']}},
#                     headers={"Content-Type": "application/json"}
#                 )
    

#     print(3037, "========= Multilanguage - Merge Data Form dengan Core =========")
#     # language_history = merge_json_files(connUpdateMultilanguageByMessagePY,[menuId,"CORE"])
#     language_history = merge_json_files([menuId, "CORE"])

#     print(3143, language_history)
#     return language_history

def merge_json_files(file_JSON_DB):
    """
    Merge multiple JSON files into a single dictionary.
    """
    print("merge_json_files     AMBIL JSON LANG")
    print(3052, f"========= Multilanguage - Merge JSON olahan dengan JSON database Id =========")
    
    merged_data = {}    
    
    for menuId in file_JSON_DB:
        # if globalVar.PRODUCTION == 'N':
        #Get JSON from DB
        print(f" ======= LOAD KE CLOUD RUN {menuId}=======",)
        getJSONMultilanguage = requests.post("https://translator-231387403177.asia-southeast2.run.app/loadJsonMultilanguage", 
            json={"data": {"menuId": menuId,"appId":globalVar.APP_ID,"requestLang": getattr(globalVar,"MULTI_LANGUAGE_ID",[])}},
            headers={"Content-Type": "application/json"}
        )
        getJSONMultilanguage = getJSONMultilanguage.json()
        print(f" ======= SELESAI LOAD KE CLOUD RUN {menuId} =======",)
        language_history = getJSONMultilanguage['data'][0]
        countData = getJSONMultilanguage['data'][1]
        
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

    # connProcessAndUpdateMultilanguage = Database(globalVar.DB_NAME)

    # Merge the JSON files
    merged_data = merge_json_files(file_JSON_DB)
    # Check if the string exists in ID section
    if string_value in merged_data['ID']:
        # Return the translation from the target language
        return merged_data[target_language].get(string_value, merged_data['ID'][string_value])
    else:
        result = merged_data['ID'].get(string_value, string_value)
        if custom:
            # Update only the specific JSON file
            #Get JSON from DB
            getJSONMultilanguage = requests.post("https://translator-231387403177.asia-southeast2.run.app/loadJsonMultilanguage", 
                json={"data": {"menuId": menuId,"appId":globalVar.APP_ID,"requestLang": getattr(globalVar,"MULTI_LANGUAGE_ID",[])}},
                headers={"Content-Type": "application/json"}
            )
            getJSONMultilanguage = getJSONMultilanguage.json()
            json_data = getJSONMultilanguage['data'][0]
            old_data = getJSONMultilanguage['data'][0]
            countData = getJSONMultilanguage['data'][1]

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
            # 
            # print("json_lang = ",json_data) --> SEHARUSNYA DATA YANG BERUBAH AJA
            
            # ^ AMBIL YANG BERUBAH
            json_new = {}
            if string_value not in old_data['ID'].keys():
                for lang in json_new:
                    if lang=='ID':
                        json_new[lang][string_value] = string_value
                    else:
                        json_new[lang][string_value] = ""
            print("JSON BARU YANG AKAN DI TRANSLATE",json_new)
            if globalVar.PRODUCTION == 'N':
                # existing_keys = set(existing_data.get("ID", {}).keys())
                # new_keys = set(messages.keys())
                # missing_keys = new_keys - existing_keys
                # ^ KIRIM KE API TRANSLATE HANYA YANG BERUBAH SAJA
                
                
                
                resultTranslate = requests.post("https://translator-231387403177.asia-southeast2.run.app/translate", 
                    json={"data": {"json_lang": json_data}},
                    headers={"Content-Type": "application/json"}
                )
                resultTranslate = resultTranslate.json()
                language_history = resultTranslate['data']
                
                # ^ CONCAT KE JSON YANG LAMA
                # ^ SAVE JSON 
                # save_json(connProcessAndUpdateMultilanguage, menuId, json_data, "UPDATE")
                requests.post("https://translator-231387403177.asia-southeast2.run.app/saveJsonMultilanguage", 
                    json={"data": {"menuId":menuId, "language_history":json_data, "statusTransactionJSON":"UPDATE", "nik":session['loggedId']['nik'],"appId":globalVar.APP_ID}},
                    headers={"Content-Type": "application/json"}
                )
            
        else:
            # Update all JSON files
            
            #Get JSON from DB
            getJSONMultilanguage = requests.post("https://translator-231387403177.asia-southeast2.run.app/loadJsonMultilanguage", 
                json={"data": {"menuId": "CORE","appId":globalVar.APP_ID,"requestLang":getattr(globalVar,"MULTI_LANGUAGE_ID",[])}},
                headers={"Content-Type": "application/json"}
            )
            getJSONMultilanguage = getJSONMultilanguage.json()
            json_data = getJSONMultilanguage['data'][0]
            countData = getJSONMultilanguage['data'][1]
            
            if globalVar.MULTI_LANGUAGE_ID==None:
                globalVar.MULTI_LANGUAGE_ID = ["ID", "EN"]

            for langId in globalVar.MULTI_LANGUAGE_ID:
                if langId not in json_data.keys():
                    json_data[langId] = {}

            for lang in json_data:
                json_data[lang][string_value] = string_value

            if globalVar.PRODUCTION == 'N':
                # merge ke json_data
                # save_json(connProcessAndUpdateMultilanguage, 'CORE', json_data, "UPDATE")
                requests.post("https://translator-231387403177.asia-southeast2.run.app/saveJsonMultilanguage", 
                    json={"data": {"menuId":"CORE", "language_history":json_data, "statusTransactionJSON":"UPDATE", "nik":session['loggedId']['nik'],"appId":globalVar.APP_ID}},
                    headers={"Content-Type": "application/json"}
                )

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
            # print(2649, globalVar.MULTI_LANGUAGE_ID)
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
            print(f"{nik} | UTILITIES | update_json_API | Error: Failed To Save Data JSON")
            Log.error(f"{nik} | UTILITIES | update_json_API | Error: Failed To Save Data JSON")
            Log.error(f"{nik} | UTILITIES | update_json_API | {str(resultSaveJSON)}")
            return {"status":False, "msg":"update_json_API | Failed To Save Data JSON"}
        else:
            return {"status":True}
    else:
        connUpdate_json_API.close()
        print(f"{nik} | UTILITIES | update_json_API | Error: Query Error Get Data JSON")
        Log.error(f"{nik} | UTILITIES | update_json_API | Error: Query Error Get Data JSON - {str(sql%ajax_data)}")
        Log.error(f"{nik} | UTILITIES | update_json_API | {str(resultData)}")
        

def getMultilanguageOptionsJS():
    
    print(f"========= Multilanguage - Get Data Multilanguage Combo =========")
    datetimeNow = datetime.now()
    if globalVar.PRODUCTION == 'N':
        keyRequestLang = []
    else:
        keyRequestLang = getattr(globalVar,"MULTI_LANGUAGE_ID",[])
    resultQuery = requests.post("https://translator-231387403177.asia-southeast2.run.app/getComboMultilanguage", 
        json={"data": {"requestLang":keyRequestLang}},
        headers={"Content-Type": "application/json"}
    )
    resultQuery = resultQuery.json()
    datetimeEnd = datetime.now()

    Log.info(f'============== TIME | {datetimeEnd - datetimeNow }')
    Log.info(f'============== API TRANSLATE END')

    return resultQuery['returnOptionsMultilanguage'], resultQuery['listLang']

