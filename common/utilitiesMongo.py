"""
Update : 2025-03-06
Common Util Oden Mongo
Update :    - all
"""

import decimal, re, ast
from bson import ObjectId

globalVar.CONN_RO = SatMongoDB(connectionname=globalVar.DB_ALIAS)
if(globalVar.CONN_RO.statusconnection):
    pass
else:
    Log.error("STATUS KONEKSI DATABASE GAGAL")
    sys.exit()

if hasattr(globalVar, 'DB_LIST'):
    globalVar.CONN_RO_DICT = {}
    try:
        for database in globalVar.DB_LIST:
            globalVar.CONN_RO_DICT[database[0]] = DatabaseConnectorRO(database[0], database[1])
    except Exception as e:
        Log.error(f"22, Error koneksi readonly database Oden {e}")


allowOthers = [32] #SPASI

allowALFA = list(range(65,91))+allowOthers #ABC...

allowalfa = list(range(97,123))+allowOthers #abc...

allowNUM =  list(range(48,58))+allowOthers #123...

allowAlfaNum = allowALFA+allowalfa+allowNUM+allowOthers

baseAllowAllCharKeyboard = []
allowAllCharKeyboard = [ "`", "~" , "!" , "@" , "#" , "$" , "%" , "^" , "&" , "*" , "(" , ")" , "_" , "-" , "+" , "=" , "," , "." , ";" , ":"  , "/" , "?" , "'" , '"' , "{" , "}" , "[" , "]" , "|", "\n",chr(133), chr(92) ]
baseAllowAllCharKeyboard.extend(ord(a) for a in allowAllCharKeyboard)

def exposeApi(function):
    def checkExternalApi(*args, **kwargs):
        menuId = request.json.get('menuId')
        apiName = request.json.get('apiName')
        if(apiName.endswith(menuId)):
            return function(*args,**kwargs)
        else:
            return {"status":False,"data":{},"msg":"apiName not found"}  
    function.__name__ = 'checkExternalApi'
    return checkExternalApi

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

    for block in listBlock:
        if block.relationBlock is None:
            blockMaster = block.blockId
            break

    for block in listBlock:
        if block.relationBlock and block.relationBlock.blockId == blockMaster:
            blockChild.append(block.blockId)

    for block in listBlock:
        if block.relationBlock and block.relationBlock.blockId == blockChild:
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
    for index, blockName in enumerate(ajaxData):
        if blockName == blockMaster:
            ajaxBlockMaster = blockMaster
        elif blockName in blockChild:
            ajaxBlockChild.append(blockName)

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
    print(181,"!!!!!!!!!!!!", ajaxBlockMaster, ajaxBlockChild)
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
    # ----------------- VALIDASI 3 -----------------
    
    return {"status": statusValidasi, "msg": "Grid to grid valid"}

def getCountData():
    nik = session['loggedId']['nik']
    if request.method == 'GET':
        ajaxData = json.loads(request.args.get("data"))
    else:
        ajaxData = request.json.get('data')

    try:
        bindParam = ajaxData["param"]
        blockName = ajaxData["blockName"]
        block = session["vForm"].getBlock(blockName)
        collection = block.databaseTable
        countClause = {}
        for key,value in bindParam.items():
            if(value != ""):
                countClause.update({key:value})
        countData = globalVar.CONN_RO.client[globalVar.DB_NAME][collection].count_documents(countClause)
        return {"status":True, "data":[{"count":countData}], "msg":""}
    except Exception as exp:
        Log.error(f'{nik} | GAGAL GET COUNT DATA | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Gagal Get Total Data<br>{exp}')

def checkTypeDatas(param) :
    temp1 = []
    temp2 = {}
    try:
        for datas in param :
            for key,value in datas.items() :
                if isinstance(value, dict):
                    data = checkDictTypeDatas(value)
                    temp2.update({key:data})
                elif isinstance(value, (datetime)):
                    temp2.update({key:value.strftime("%Y-%m-%d %H:%M:%S")})
                elif isinstance(value, (date)):
                    temp2.update({key:value.strftime("%Y-%m-%d")})
                elif isinstance(value, (int, float,decimal.Decimal)):
                    temp2.update({key:str(value)})
                elif isinstance(value,ObjectId):
                    temp2.update({key:str(value)})
                else:
                    temp2.update({key:value})
            temp1.append(temp2)
            temp2 = {}
        return temp1
    except Exception as e:
        print("Error check type data", e)
        Log.error('ERROR CHECK TYPE DATA')

def checkDictTypeDatas(paramDict):
    try:
        temp = {}
        for key,value in paramDict.items() :
            if isinstance(value, dict):
                temp.update({key:checkDictTypeDatas(value)})
            if isinstance(value, (datetime)):
                temp.update({key:value.strftime("%Y-%m-%d %H:%M:%S")})
            elif isinstance(value, (date)):
                temp.update({key:value.strftime("%Y-%m-%d")})
            elif isinstance(value, (int, float,decimal.Decimal)):
                temp.update({key:str(value)})
            elif isinstance(value,ObjectId):
                temp.update({key:str(value)})
            else:
                temp.update({key:value})
        return temp
    except Exception as e:
        print("Error check dict data", e)
        Log.error('ERROR CHECK dict DATA')

def changeDateToDatetime(dateObj):
    try:
        if type(dateObj) is date:
            datetimeObject = datetime.combine(dateObj, datetime.min.time())
            return datetimeObject
        elif type(dateObj) is datetime:
            return dateObj
    except Exception as e:
        print("Error changeDateToDatetime", e)
        Log.error('ERROR changeDateToDatetime')

def convertStringDateIntFloat(value):
    try:
        if isinstance(value, ObjectId):
            return value
        try:
            return datetime.strptime(value, "%Y-%m-%d %H:%M:%S")  
        except ValueError:
            pass
            
        try:
            return datetime.strptime(value, "%d-%m-%Y %H:%M:%S")  
        except ValueError:
            pass

        try:
            return datetime.strptime(value, "%Y-%m-%d")  
        except ValueError:
            pass
        
        try:
            return datetime.strptime(value, "%d-%m-%Y")  
        except ValueError:
            pass
        
        try:
            if "." not in value:  
                return int(value) 
        except ValueError:
            pass

        try:
            return float(value) 
        except ValueError:
            pass

        if isinstance(value, str):
            return value
        else:
            pass
        

        return value
    except Exception as e:
        print("Error convertStringDateIntFloat", e)
        Log.error('ERROR convertStringDateIntFloat')


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
    if session["vForm"].callFormLevel == 0:
        session["gVar"] = {"gCallForm":[]}
    if request.method == 'GET':
        ajaxData = json.loads(request.args.get("data"))
    else:
        ajaxData = request.json.get('data')
    checkValidate = {"status":False,"data":{},"msg":"FALSE"}
    checkValidate = session["vForm"].validatePkCallForm(ajaxData["blockNameCallForm"],ajaxData["callFormData"])
    if checkValidate["status"]:
        checkValidateNd = session["vForm"].validatePkCallForm(ajaxData["blockNameCallBack"],ajaxData["callBackData"]) #validatecallbackdata
        if checkValidateNd["status"]:
            session["gVar"]["gCallForm"].append({"menuId": ajaxData["callFormId"], "callFormParam": {"bindParamCallForm": checkValidate["data"], "bindParamCallBack": checkValidateNd["data"]}})
        checkValidate = checkValidateNd
    return checkValidate

def nonBaseBlockValidate(blockName):
    if request.method == 'GET':
        ajaxData = json.loads(request.args.get("data"))
    else:
        ajaxData = request.json.get('data')
    blockNonBase = session["vForm"].getBlock(blockName)
    blockNonBase.setDataNonBase(session["vForm"],{"data":[ajaxData]})
    val = blockNonBase.validateBase("NON-BASE")
    return val

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
            Log.error(f'{nik} | GAGAL MENGHAPUS SPECIAL KARAKTER | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return rMsgBox(f'Gagal Menghapus Special Karakter<br>{exp}')

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
            Log.error(f'{nik} | GAGAL MENGUBAH FILE MENJADI BENTUK STRING | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return rMsgBox(f'Gagal Mengubah File Menjadi Bentuk String<br>{exp}')
    
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

    # print(138, getmenu)
    nik = session['loggedId']['nik']
    # menu = []
    # dataCek = []
    # sortMenu = []
    # sortMenuCek = []

    try:

        # print(147, build_menu(getmenu[1]['data']['menu_id']))

        return str(build_menu(getmenu[1]['data']['menu_id']))

        # for i in range(len(getmenu[1]['data']['menu_id'])):
        #     for data in getmenu[1]['data']['menu_id']:
        #         if data[0].find('_ND') ==-1:
        #             if (data[2]=="" or data[2] is None) and data[0] not in sortMenuCek :
        #                 sortMenu.append(data)
        #                 sortMenuCek.append(data[0])
        #             if (data[2]!="" or data[2] is not None) and data[2] in sortMenuCek and data[0] not in sortMenuCek:
        #                 sortMenu.append(data)
        #                 sortMenuCek.append(data[0])

        # for data in sortMenu:
        #     dataCek.append(data[2])

        # for data in sortMenu:
        #     if data[2]=="" or data[2] is None:
        #         if data[0] in dataCek:
        #             menu.append({'id':data[0],'value':data[1],'icon': "mdi mdi-book",'data':[]})
        #         else:
        #             menu.append({'id':data[0],'value':data[1],'href':'/?type=VIEW&menuId='+data[0],'icon': "mdi mdi-rhombus-medium"})
        #     elif data[2]!="" or data[2] is not None:
        #         for menuList in menu:
        #             if data[2] == menuList['id']:
        #                 if data[0] in dataCek:
        #                     menuList['data'].append({'id':data[0],'value':data[1],'icon': "mdi mdi-book",'data':[]})
        #                 else:
        #                     menuList['data'].append({'id':data[0],'value':data[1],'href':'/?type=VIEW&menuId='+data[0],'icon': "mdi mdi-rhombus-medium"})
        #             else:
        #                 if "data" in menuList:
        #                     for menuList2 in menuList['data']:
        #                         if menuList2['id']==data[2]:
        #                             menuList2['data'].append({'id':data[0],'value':data[1],'href':'/?type=VIEW&menuId='+data[0],'icon': "mdi mdi-rhombus-medium"})
        #                 else:
        #                     pass
        
        # print(183, type(json.dumps(menu)))
        # return json.dumps(menu)

    except Exception as exp:
            Log.error(f'{nik} | GAGAL SET USER MENU | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return rMsgBox(f'Gagal Set User Menu<br>{exp}')

def sendApiPrintReport(kwargs,menuId,web_data,cookie):
    nik = session['loggedId']['nik']
    data = dict()
    data['status'] = False
    data['url'] = ''
    data['message'] = 'Error'

    try:
        if request.method == 'GET':
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
            Log.error(f'{nik} | GAGAL PADA SEND API REPORT | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return rMsgBox(f'Gagal Pada Send Api Report<br>{exp}')

def selectDataHeaderQueryRO(databasename, collectionname, pipelines):
    nik = session['loggedId']['nik']
    dictResult = {}
    dictResult = checkDatabaseCollectionMongo(databasename, collectionname)
    if(dictResult["status"]):
        try:
            result = globalVar.CONN_RO.aggregate(databasename,collectionname, pipelines)
        except Exception as e:
            dictResult["status"] = False
            print(f"selectDataHeaderQueryRO - {traceback.format_exc()}")
            Log.error(f'{nik} | selectDataHeaderQueryRO | {str(traceback.format_exc())}')
            Log.error(f'{nik} Error on line {sys.exc_info()[-1].tb_lineno}, {type(e).__name__,} {e}')

        if result["code"] is None:
            data = list(result["object"])
            data = checkTypeDatas(data)
        else:
            data = result["message"]
        dictResult.update({"data":data})
    else:
        dictResult["status"] = False
    return dictResult
  

def selectDataQueryRO(databasename, collectionname, pipelines):
    nik = session['loggedId']['nik']
    dictResult = {}
    dictResult = checkDatabaseCollectionMongo(databasename, collectionname)
    if(dictResult["status"]):
        try:
            result = globalVar.CONN_RO.aggregate(databasename,collectionname, pipelines)
            print(498,result)
        except PyMongoError as e:
            dictResult["status"] = False
            print(f"selectDataQueryRO - {traceback.format_exc()}")
            Log.error(f'{nik} | selectDataQueryRO | {str(traceback.format_exc())}')
            Log.error(f'{nik} Error on line {sys.exc_info()[-1].tb_lineno}, {type(e).__name__,} {e}')

        if dictResult['status']:
            data = list(result["object"])
            data = checkTypeDatas(data)
            formatListTuple = []
            for dict in data:
                formatListTuple.append(tuple(dict.values()))
            data = formatListTuple
        else:
            data = result["message"]
        dictResult.update({"data":data})
    else:
        dictResult["status"] = False
    return dictResult

def executeInsertOne(databasename, collectionname, document:dict):
    nik = session['loggedId']['nik']
    """

            Fungsi ini digunakan untuk insert document pada Mongo,
            @param databasename: Merupakan database yang dituju

            @param collectionname: Merupakan nama collection yang dituju

            @param document: Merupakan dictionary document yang ingin di insert

            @return: status = nilai boolean (True = berhasil, False = gagal)

            result = hasil nilai data yang didapatkan

    """
    conn = SatMongoDB(connectionname=globalVar.DB_ALIAS)
    sessionMongo = conn.startSession()
    conn.startTransaction(sessionMongo["session"])
    dictResult = {}
    print(556, "Masuk execute insert one")
    result = conn.insertOne(databasename, collectionname, document, session=sessionMongo["session"])
    print(558, result)
    try:
        if result["object"]:
            conn.commitTransaction(sessionMongo["session"])
            msg = result["message"]
            status = True
        else:
            status = False
            msg = result["message"]
            conn.abortTransaction(sessionMongo["session"])
        conn.endSession(sessionMongo["session"])
        del(conn)
        dictResult.update({'status':status, 'msg':msg})
        return dictResult
    except Exception as exp:
        Log.error(f'{nik} | GAGAL INSERT ONE | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Gagal Insert One<br>{exp}')

def executeInsertMany(databasename, collectionname, listOfDocument:list):
    nik = session['loggedId']['nik']
    """

            Fungsi ini digunakan untuk insert document pada Mongo,
            @param databasename: Merupakan database yang dituju

            @param collectionname: Merupakan nama collection yang ingin di insert

            @param document: Merupakan list of dictionary document yang ingin di insert secara batch

            @return: status = nilai boolean (True = berhasil, False = gagal)

            result = hasil nilai data yang didapatkan

    """
    conn = SatMongoDB(connectionname=globalVar.DB_ALIAS)
    sessionMongo = conn.startSession()
    conn.startTransaction(sessionMongo["session"])
    dictResult = {}
    result = conn.insertMany(databasename, collectionname, listOfDocument, session=sessionMongo["session"])
    try:
        if result["object"]:
            conn.commitTransaction(sessionMongo["session"])
            msg = result["message"]
            status = True
        else:
            status = False
            msg = result["message"]
            conn.abortTransaction(sessionMongo["session"])
        conn.endSession(sessionMongo["session"])
        del(conn)
        dictResult.update({'status':status, 'msg':msg})
        return dictResult
    except Exception as exp:
        Log.error(f'{nik} | GAGAL INSERT MANY | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Gagal Insert Many<br>{exp}')
    
def executeUpdateOne(databasename, collectionname, filter, update):
    nik = session['loggedId']['nik']
    """

            Fungsi ini digunakan untuk insert document pada Mongo,
            @param databasename: Merupakan database yang dituju

            @param collectionname: Merupakan nama collection yang ingin di insert

            @param filter: Merupakan filter untuk update document

            @param update: Merupakan parameter set data yang berubah

            @return: status = nilai boolean (True = berhasil, False = gagal)

            result = hasil nilai data yang didapatkan

    """
    conn = SatMongoDB(connectionname=globalVar.DB_ALIAS)
    sessionMongo = conn.startSession()
    conn.startTransaction(sessionMongo["session"])
    dictResult = {}
    result = conn.updateOne(databasename, collectionname, filter, update, session=sessionMongo["session"])
    try:
        Log.info(f"652, CEK {result}")
        if result["object"]:
            conn.commitTransaction(sessionMongo["session"])
            msg = result["message"]
            status = True
        else:
            status = False
            msg = result["message"]
            conn.abortTransaction(sessionMongo["session"])
        conn.endSession(sessionMongo["session"])
        del(conn)
        dictResult.update({'status':status, 'msg':msg})
        return dictResult
    except Exception as exp:
        Log.error(f'{nik} | GAGAL UPDATE ONE | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Gagal Update One<br>{exp}')


def executeUpdateMany(databasename, collectionname, filter, update):
    print(646, "!!!!!", "execute update many")
    nik = session['loggedId']['nik']
    """

            Fungsi ini digunakan untuk insert document pada Mongo,
            @param databasename: Merupakan database yang dituju

            @param collectionname: Merupakan nama collection yang ingin di insert

            @param filter: Merupakan filter untuk update document

            @param update: Merupakan parameter set data yang berubah

            @return: status = nilai boolean (True = berhasil, False = gagal)

            result = hasil nilai data yang didapatkan

    """
    conn = SatMongoDB(connectionname=globalVar.DB_ALIAS)
    sessionMongo = conn.startSession()
    conn.startTransaction(sessionMongo["session"])
    dictResult = {}
    result = conn.updateMany(databasename, collectionname, filter, update, session=sessionMongo["session"])
    try:
        if result["object"]:
            conn.commitTransaction(sessionMongo["session"])
            msg = result["message"]
            status = True
        else:
            status = False
            msg = result["message"]
            conn.abortTransaction(sessionMongo["session"])
        conn.endSession(sessionMongo["session"])
        del(conn)
        dictResult.update({'status':status, 'msg':msg})
        return dictResult
    except Exception as exp:
        Log.error(f'{nik} | GAGAL UPDATE MANY | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Gagal Update Many<br>{exp}')

def executeDeleteOne(databasename, collectionname, filter):
    nik = session['loggedId']['nik']
    """

            Fungsi ini digunakan untuk insert document pada Mongo,
            @param databasename: Merupakan database yang dituju

            @param collectionname: Merupakan nama collection yang ingin di insert

            @param filter: Merupakan filter untuk update document

            @param update: Merupakan parameter set data yang berubah

            @return: status = nilai boolean (True = berhasil, False = gagal)

            result = hasil nilai data yang didapatkan

    """
    conn = SatMongoDB(connectionname=globalVar.DB_ALIAS)
    sessionMongo = conn.startSession()
    conn.startTransaction(sessionMongo["session"])
    dictResult = {}
    result = conn.deleteOne(databasename, collectionname, filter, session=sessionMongo["session"])
    try:
        if result["object"]:
            conn.commitTransaction(sessionMongo["session"])
            msg = result["message"]
            status = True
        else:
            status = False
            msg = result["message"]
            conn.abortTransaction(sessionMongo["session"])
        conn.endSession(sessionMongo["session"])
        del(conn)
        dictResult.update({'status':status, 'msg':msg})
        return dictResult
    except Exception as exp:
        Log.error(f'{nik} | GAGAL DELETE ONE | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Gagal Delete One<br>{exp}')
    
def executeDeleteMany(databasename, collectionname, filter):
    nik = session['loggedId']['nik']
    """

            Fungsi ini digunakan untuk insert document pada Mongo,
            @param databasename: Merupakan database yang dituju

            @param collectionname: Merupakan nama collection yang ingin di insert

            @param filter: Merupakan filter untuk update document

            @param update: Merupakan parameter set data yang berubah

            @return: status = nilai boolean (True = berhasil, False = gagal)

            result = hasil nilai data yang didapatkan

    """
    conn = SatMongoDB(connectionname=globalVar.DB_ALIAS)
    sessionMongo = conn.startSession()
    conn.startTransaction(sessionMongo["session"])
    dictResult = {}
    result = conn.deleteMany(databasename, collectionname, filter, session=sessionMongo["session"])
    try:
        if result["object"]:
            conn.commitTransaction(sessionMongo["session"])
            msg = result["message"]
            status = True
        else:
            status = False
            msg = result["message"]
            conn.abortTransaction(sessionMongo["session"])
        conn.endSession(sessionMongo["session"])
        del(conn)
        dictResult.update({'status':status, 'msg':msg})
        return dictResult
    except Exception as exp:
        Log.error(f'{nik} | GAGAL DELETE Many | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Gagal Delete Many<br>{exp}')

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
            Log.error(f'{nik} | GAGAL PADA DICTIONARY PARAM GENERATOR | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return rMsgBox(f'Gagal Pada Dictionary Param Generator<br>{exp}')    


def generateInsertRecord(vCollection,vColumn,vNoDBItems,vData,vNonVisibleColumns,sessionId, dataSubDocument,dataSubDocumentAlias, vPK):
    nik = session['loggedId']['nik']
    vDataInsrt = vData.copy()
    print(808,vData)
    dictVal = []
    vNewData = vDataInsrt
    vNewData["createUser"] = sessionId
    vNewData["updateUser"] = sessionId
    vDataSubDocument = dataSubDocument
    vdataSubDocumentAlias = dataSubDocumentAlias
    dataSubDocument = {}
    pkParam = {}
    try:
        
        for key in vNoDBItems:
            if key in vNewData.keys():
                del vNewData[key]

        dataNotNull = vNewData.copy()
        convertDict = dictParamGenerator(vColumn)

        for nulable in vNewData:
            if vNewData[nulable] == "":
                del convertDict[nulable]
                del dataNotNull[nulable]
        newConvertDict = {}
        for coll in convertDict:
            if coll in vNewData.keys():
                newConvertDict.update({coll:convertDict[coll]})

        documentToInsert = {}
        for key,value in dataNotNull.items():
            if isinstance(value, date):
                value = changeDateToDatetime(value)
            if key in newConvertDict:
                getDictInsert = generateNestedDictDocument(documentToInsert, newConvertDict[key], value)
                documentToInsert.update(getDictInsert)
        
        for key,value in dict(vNonVisibleColumns).items():
            getDictInsert = generateNestedDictDocument(documentToInsert,key, vNewData[value])
            documentToInsert.update(getDictInsert)

        if(len(vDataSubDocument) != 0):
            dictToUpdate = {}
            for key,value in vDataSubDocument.items():
                getDictUpdate = generateNestedDictDocument(dictToUpdate, key, value)
                dictToUpdate.update(getDictUpdate)
            dataSubDocument["$push"] = dictToUpdate

            for pk in vPK:
                pkString = pk[1]
                if(pkString in vdataSubDocumentAlias.keys()):
                    vPK.remove(pk)
            for pk in vPK:
                if ObjectId.is_valid(vNewData[pk[1]]):
                    pkParam.update({pk[0]:ObjectId(vNewData[pk[1]])})
                else:
                    if isinstance(vNewData[pk[1]], date):
                        vNewData[pk[1]] = changeDateToDatetime(vNewData[pk[1]])
                    pkParam.update({pk[0]:vNewData[pk[1]]})
        print(864, pkParam)
        return vCollection, documentToInsert, vNewData, dataSubDocument, pkParam
    except Exception as exp:
        Log.error(f'{nik} | GAGAL GENERATE INSERT RECORD | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Gagal Generate Insert Record<br>{exp}')
    
def generateUpdateRecord(vCollection,vColumn,vPK,vNoDBItems,vDatas,vNonVisibleColumns,sessionId, dataSubDocument, subDocumentAlias, subDocumentIndex):
    nik = session['loggedId']['nik']
    vData = vDatas.copy()
    vNewData = vData
    vDataSubDocument = dataSubDocument
    vsubDocumentAlias = subDocumentAlias
    vsubDocumentIndex = subDocumentIndex

    try: 
        for key in vNoDBItems:
            if key in vNewData.keys():
                del vNewData[key]
        
        datasNoPK = vNewData.copy()
        for pk in vPK:
            pkString = pk[1]
            if(pkString not in vsubDocumentAlias.keys()):
                del datasNoPK[pkString]
            if(pkString in vsubDocumentAlias.keys()):
                vPK.remove(pk)

        pkParam = {}
        for pk in vPK:
            if ObjectId.is_valid(vNewData[pk[1]]):
                pkParam.update({pk[0]:ObjectId(vNewData[pk[1]])})
            else:
                if isinstance(vNewData[pk[1]], date):
                    vNewData[pk[1]] = changeDateToDatetime(vNewData[pk[1]])
                pkParam.update({pk[0]:vNewData[pk[1]]})
        
        pkParam.update(vDataSubDocument)

        convertDict = dictParamGenerator(vColumn)
        setParam = {"$set":{}}
        for data,value in datasNoPK.items():
            if isinstance(value, date):
                value = changeDateToDatetime(value)
            setParam["$set"].update({convertDict[data]:value})
            if(convertDict[data] in vsubDocumentIndex.keys()):
                del setParam["$set"][convertDict[data]]
                setParam["$set"].update({vsubDocumentIndex[convertDict[data]]:value})
        vNewData["updateUser"] = sessionId
        setParam["$set"].update({vNonVisibleColumns[0]:vNewData[vNonVisibleColumns[1]]})
        return vCollection, pkParam, setParam, vNewData
    except Exception as exp:
        Log.error(f'{nik} | GAGAL GENERATE UPDATE RECORD | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Gagal Generate Update Record<br>{exp}')

def generateSelect(vTable,vColumn,vAliasCol,vWhereClause,vOrderBy,vLimit,vNoDBItems,vDatas, vSubDocument):
    vAliasTemp = []
    vColumnTemp = []
    vAliasColTemp = {}
    for col in vColumn:
        vColumnTemp.append(col[0])
        vAliasTemp.append(col[1])
        vAliasColTemp.update({col[1]:col[0]})

    nik = session['loggedId']['nik']
    pipelines = []

    bindParams = vDatas["data"].copy()
    dataRecord = vDatas["data"].copy()
    try:
        for data,value in vDatas["data"].items():
            if data in vNoDBItems or data not in vAliasTemp:
                del dataRecord[data]

        if vWhereClause!= []:
            pipelines+=(vWhereClause)  

        if vSubDocument != None and vSubDocument != "":
            pipelines.append({"$unwind": "$"+vSubDocument})
            pipelines.append({"$setWindowFields": { 
                        "partitionBy": "$_id",
                        "sortBy": {"_id": 1},
                        "output": {
                            "raw_index": {"$documentNumber": {}} 
                        }
                    }})
            pipelines.append({"$addFields": { 
                "index": {"$subtract": ["$raw_index", 1]}
            }})
        for data,value in dataRecord.items():
            if value != '' and data!="offsetNumber":
                if isinstance(value, int) or isinstance(value, float):
                    getPipeline = generateMongoPipeline(
                        match = {
                            vAliasColTemp[data]: value
                        }
                    )
                    pipelines.extend(getPipeline)  
                else:
                    if '%' in value or '_' in value:
                        value = value.replace("%", ".*")
                        getPipeline = generateMongoPipeline(
                            match = {
                                "$expr": {
                                    "$and": [
                                        {
                                            "$regexMatch": {
                                                "input": "$"+vAliasColTemp[data],  # First field
                                                "regex": value,  # LIKE '%10%'
                                                "options": "i"
                                            }
                                        },
                                    ]
                                }
                            }
                        )
                        if(len(pipelines)!= 0 and any("$match" in key for key in pipelines) and "$expr" in pipelines[0]["$match"] and "$and" in pipelines[0]["$match"]["$expr"]):
                            pipelines[0]["$match"]["$expr"]["$and"].append(getPipeline[0]["$match"]["$expr"]["$and"])
                        else:
                            pipelines.extend(getPipeline)
                    else:
                        if ObjectId.is_valid(value):
                            value = ObjectId(value)
                        
                        getPipeline = generateMongoPipeline(
                            match = {
                                vAliasColTemp[data]: convertStringDateIntFloat(value)
                            }   
                        )
                        pipelines.extend(getPipeline)  
        
        #Define kolom yang akan di select dari class-class item
        pipelines.extend(generateMongoPipeline(
            project = {col[1]: "$"+col[0] for col in vColumn},
        ))
        if vSubDocument != None and vSubDocument != "":
            pipelines[len(pipelines)-1]["$project"].update({"index":"$index"})

        # orderBy condition
        if len(vOrderBy) != 0:
            getPipelineOrderBy = generateMongoPipeline(
                sort = vOrderBy
            )
            pipelines.extend(getPipelineOrderBy)
        if vDatas['blockType'] == "form":
            getPipelinePagination = generateMongoPipeline(
                skip = bindParams["offsetNumber"],
                limit = 1
            )
            pipelines.extend(getPipelinePagination)
        elif vDatas['blockType'] == "datagrid":
            limitParam = 500
            if vLimit != "":
                limitParam = vLimit
            getPipelinePagination = generateMongoPipeline(
                skip = bindParams["offsetNumber"],
                limit = limitParam
            )
            pipelines.extend(getPipelinePagination)
        return pipelines
    except Exception as exp:
            Log.error(f'{nik} | GAGAL GENERATE SELECT | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return rMsgBox(f'Gagal Generate Select<br>{exp}')      

def generateDelete(vCollection,vPk,vDatas, vSubDocumentObject):
    nik = session['loggedId']['nik']
    try:
        pkParam = {}
        updateParam = {}
        for pk in vPk:
            if ObjectId.is_valid(vDatas[pk[1]]):
                pkParam.update({pk[0]:ObjectId(vDatas[pk[1]])})
            else:
                pkParam.update({pk[0]:vDatas[pk[1]]})
        
        if(len(vSubDocumentObject) != 0):
            dictToUpdate = {}
            for key,value in vSubDocumentObject.items():
                getDictUpdate = generateNestedDictDocument(dictToUpdate, key, value)
                dictToUpdate.update(getDictUpdate)

            updateParam.update(generateMongoPipeline(pull = dictToUpdate)[0])
            

        return vCollection, pkParam, vDatas, updateParam
    except Exception as exp:
            Log.error(f'{nik} | GAGAL GENERATE DELETE | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return rMsgBox(f'Gagal Generate Delete<br>{exp}')

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
            Log.error(f'{nik} | GAGAL GENERATE ELEMENT | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return rMsgBox(f'Gagal Generate Element<br>{exp}')

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
            Log.error(f'{nik} | GAGAL SET DATA | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return rMsgBox(f'Gagal Set Data<br>{exp}')    

def getSelectStatement(vBlock,data):
    print(" ============ getSelectStatement ============")
    nik = session['loggedId']['nik']
    block = vBlock
    table = block.databaseTable
    columns = []
    
    try:
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
            orderBy = {}
        noDBItems = block.noDbItems
        limit = block.limit

        subDocument = block.subDocument
        
        return generateSelect(table,columns,aliasColumns,whereclause,orderBy,limit,noDBItems,data,subDocument)
    except Exception as exp:
            Log.error(f'{nik} | GAGAL GET SELECT STATEMENT | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return rMsgBox(f'Gagal Get Select Statement<br>{exp}')

def getDeleteStatement(vBlock,data):
    nik = session['loggedId']['nik']
    block = vBlock
    table = block.databaseTable
    columns = []
    primaryKeys = []
    subDocument = block.subDocument
    subDocumentObject = {}
    
    try:
        if subDocument:
            objRecord = None
            for record in block.records:
                pkJs = list(data[0].values())
                print(1140, set(record.primaryKey), set(pkJs))
                Log.error(f"{set(record.primaryKey)}, {set(pkJs)}")
                if(set(record.primaryKey) == set(pkJs)):
                    print(1142, record)
                    objRecord = record
            
            if(objRecord is None):
                Log.error(f'{nik} | OBJRECORD NOT FOUND IN DELETE, PLEASE CHECK PRIMARY KEY PY AND JS |')

            for item in objRecord.items:
                if item.databaseItem is True and block.subDocument in item.databaseColumn:
                    subDocumentObject.update({item.databaseColumn:item.value})
                
            for idx,cols in enumerate(block.listObjItem):
                if cols.databaseItem is True:
                    columns.append([block.databaseColumns[idx],cols.itemId])
                    if cols.primaryKey is True and subDocument not in cols.databaseColumn:
                        primaryKeys.append([block.databaseColumns[idx],cols.itemId])
                        if(issubclass(cols, Calendar) or issubclass(cols, NumericNormal)):
                            data[0][cols.itemId] = convertStringDateIntFloat(data[0][cols.itemId])
        else:
            for idx,cols in enumerate(block.listObjItem):
                if cols.databaseItem is True:
                    columns.append([block.databaseColumns[idx],cols.itemId])
                    if cols.primaryKey is True:
                        primaryKeys.append([block.databaseColumns[idx],cols.itemId])
                        if(issubclass(cols, Calendar) or issubclass(cols, NumericNormal)):
                            data[0][cols.itemId] = convertStringDateIntFloat(data[0][cols.itemId])
        aliasColumns = []
        for i in block.listObjItem:
            if i.databaseItem is True:
                aliasColumns.append(i.itemId)
            
        return generateDelete(table,primaryKeys,data[0],subDocumentObject)
    except Exception as exp:
            Log.error(f'{nik} | GAGAL GET DELETE STATEMENT | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return rMsgBox(f'Gagal Get Delete Statement<br>{exp}')    

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
            Log.error(f'{nik} | GAGAL GET UPDATE STATEMENT | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return rMsgBox(f'Gagal Get Update Statement<br>{exp}')

def genBindParamUpdate(vRecord):
    nik = session['loggedId']['nik']
    changeItems = {}
    subDocument = vRecord.parentObj.subDocument

    try:
        for item in vRecord.items:
            if item.changeStatus == True or item.primaryKey == True:
                changeItems.update({item.itemId:item.valueItem})
        return changeItems
    except Exception as exp:
            Log.error(f'{nik} | GAGAL GENERATE BIND PARAM UPDATE | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return rMsgBox(f'Gagal Generate Bind Param Update<br>{exp}')

def genBindParamInsert(vRecord):
    nik = session['loggedId']['nik']
    changeItems = {}
    
    try:
        for item in vRecord.insertItems:
            if item.changeStatus == True or item.primaryKey == True:
                changeItems.update({item.itemId:item.valueItem})
        return changeItems
    except Exception as exp:
            Log.error(f'{nik} | GAGAL GENERATE BIND PARAM INSERT | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return rMsgBox(f'Gagal Generate Bind Param Insert<br>{exp}')

def getInsertStatementRecord(vRecord,user):
    nik = session['loggedId']['nik']
    data = genBindParamInsert(vRecord)
    block = vRecord.parentObj
    tableBlock = block.databaseTable
    nonVisibleItems = {}
    columns = []
    primaryKeys = []
    noDbItems = block.noDbItems
    subDocument = block.subDocument
    dataSubDocument = {}
    dataSubDocumentAlias = {}

    try:
        for idx,cols in enumerate(block.listObjItem):
            if cols.databaseItem is True:
                columns.append([block.databaseColumns[idx],cols.itemId])
        nonVisibleItems = block.nonVisibleItems

        if subDocument:
            for item in vRecord.insertItems:
                if item.databaseItem is True and block.subDocument in item.databaseColumn:
                    dataSubDocument.update({item.databaseColumn:item.value})
                    dataSubDocumentAlias.update({item.itemId:item.value})
            for idx,cols in enumerate(block.listObjItem):
                if cols.databaseItem is True:
                    columns.append([block.databaseColumns[idx],cols.itemId])
                    if cols.primaryKey is True:
                        primaryKeys.append([block.databaseColumns[idx],cols.itemId])
        return generateInsertRecord(tableBlock,columns,noDbItems,data,nonVisibleItems,user,dataSubDocument,dataSubDocumentAlias, primaryKeys)
    except Exception as exp:
            Log.error(f'{nik} | GAGAL GET INSERT STATEMENT RECORD | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return rMsgBox(f'Gagal Get Insert Statement Record<br>{exp}')

def getUpdateStatementRecord(vRecord,user):
    nik = session['loggedId']['nik']
    data = genBindParamUpdate(vRecord)
    block = vRecord.parentObj
    tableBlock = block.databaseTable
    nonVisibleItems = {}
    columns = []
    noDbItems = block.noDbItems
    primaryKeys = []
    subDocument = block.subDocument
    indexRecord = None
    if(subDocument):
        indexRecord = vRecord.indexSubDocument
    dataSubDocument = {}
    subDocumentAlias = {}
    subDocumentIndex = {}

    try:
        for idx,cols in enumerate(block.listObjItem):
            if cols.databaseItem is True:
                columns.append([block.databaseColumns[idx],cols.itemId])
                if cols.primaryKey is True:
                    primaryKeys.append([block.databaseColumns[idx],cols.itemId])
        if subDocument:
            for item in vRecord.items:
                if item.databaseItem is True and block.subDocument in item.databaseColumn and item.changeStatus == True:
                    splitList = item.databaseColumn.split(".")
                    splitList.insert(1, str(indexRecord))
                    databaseColumnIndexed = ".".join(splitList)

                    originValue = item.value
                    if(item.changeStatus == False):
                        dataSubDocument.update({databaseColumnIndexed:originValue})
                    subDocumentAlias.update({item.itemId:databaseColumnIndexed})
                    subDocumentIndex.update({item.databaseColumn:databaseColumnIndexed})
        try:
            nonVisibleItems = next(nonvisibleitem for nonvisibleitem in block.nonVisibleItems if "updateUser" in nonvisibleitem)
        except Exception as e:
            Log.error(f'{nik} | GAGAL CHECK NON VISIBLE ITEM | Error on line {sys.exc_info()[-1].tb_lineno}, {type(e).__name__,} {e}')

        return generateUpdateRecord(tableBlock,columns,primaryKeys,noDbItems,data,nonVisibleItems,user, dataSubDocument,subDocumentAlias, subDocumentIndex)
    except Exception as exp:
            Log.error(f'{nik} | GAGAL GET UPDATE STATEMENT RECORD | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return rMsgBox(f'Gagal Get Update Statement Record<br>{exp}')

def rMsgBox(msg):
    return {'status':False,'msg':msg}

def getDataDisplayItem(vData):
    nik = session['loggedId']['nik']
    try:
        if len(vData['DATA']['data']) != 0:
            vData['DATA']['data']
            param = vData["PARAM"]
            addPipe = vData.get("PIPELINE")
            
            pipeline = []
            paramList = []
            for itemParam in param.items():
                paramList.append(itemParam[0])
                getPipeline = generateMongoPipeline(match = {
                    itemParam[1] : { "$in": []}
                })
                if addPipe :
                    for additional in addPipe :
                        getPipeline.append(additional)

                if(len(pipeline) != 0 and any("$match" in key for key in pipeline)):
                    pipeline[0]["$match"].update(getPipeline[0]["$match"])
                elif (len(pipeline) == 0):
                    pipeline.extend(getPipeline)

            itemClass = {}
            for classItem in vData["DATABLOCK"].listObjItem:
                for itemId, field in vData["PARAM"].items():
                    if(classItem.itemId == itemId):
                        itemClass.update({itemId:classItem})

            for data in vData["DATA"]["data"]:
                for itemId, field in vData["PARAM"].items():
                    if itemId in paramList:
                        convertParam = data[itemId]
                        if(issubclass(itemClass[itemId], Calendar) or issubclass(itemClass[itemId], NumericNormal)):
                            convertParam = convertStringDateIntFloat(data[itemId])
                        pipeline[0]["$match"][field]["$in"].append(convertParam)
            
            pipeline.append({"$project" : vData["SET_DESC"]})

            dataPost = selectDataHeaderQueryRO(vData["DB"], vData["COLLECTION"], pipeline)
            for row, dat in enumerate(vData["DATA"]["data"]) :
                if (len(dataPost["data"]) > 0 and dataPost["status"]) :
                    for recordPostSelect in dataPost["data"]:
                        paramTrue = 0
                        for itemParam in param.items():
                            value = getValueNestedField(recordPostSelect, itemParam[1])
                            if dat[itemParam[0]] == value:
                                paramTrue +=1
                        if paramTrue == len(paramList): 
                            for desc in vData["SET_DESC"].keys():
                                dat[desc] = recordPostSelect[desc]

            result =  {'status':vData['DATA']['status'],'data':vData['DATA']['data']}
            return result
        else:
            return {'status':vData['DATA']['status'],'data':vData['DATA']['data']}
    except Exception as exp:
            Log.error(f'{nik} | GAGAL GET DATA DISPLAY ITEM | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return {'status':False,'data':{},'msg':f'Gagal Get Data Display Item<br>{exp}'}       

def checkExtension(file):

    """
    Args:
        file (fileStorage) : Berisi file storage yang didapat dari request

    Returns:
        result (dict) : status = nilai boolean (True = ekstensi valid, False = ekstensi tidak valid)
                        msg = message informasi
    """
    fileExt = (file.filename).split('.')[-1]
    fileHex = (file.read(15)).hex()
    
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
        'mp4':['6674797069736F6d','667479704d534e56','000000246674797069736f6d000002']
    }
    
    # listExtensionWithoutHeader= ['csv']
    
    if not dictExtensionSignature.get(fileExt):
        result['status'] = False
        result['msg'] = 'Ekstensi tidak diperbolehkan!'
    else:
        if not fileHex.startswith(tuple(dictExtensionSignature.get(fileExt))):
            result['status'] = False
            result['msg'] = 'File signature berbeda!'

    # if fileExt in listExtensionWithoutHeader:
    #     result = {'status':True, 'msg':'valid'} 
    #     for char in str(file.read()):
    #         if char in ['<','>']:
    #             result['status'] = False
    #             result['msg'] = 'Special character detected in file' 
    
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
                        print(1496,valueFunc)
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

                        print(1518, valueFunc)


                        respond = ClientRequest().post(
                            appId=globalVar.APP_ID, 
                            url=valueFunc['urlFileManager'], 
                            data=jsonParam,
                            headers={
                                'appId':globalVar.APP_ID
                            }
                        )

                        responseUpload = respond.json()



                        print(1524, responseUpload)
                        # (True, '00', {'appId': 'oden-v3', 'datetime': '20240605163511236170', 'destination': '3233/DATA_PRIBADI/a28c5a7a63d6682e18f8f02957521e71.pdf', 'file_id': ['a28c5a7a63d6682e18f8f02957521e71.pdf'], 'message': 'Upload Success', 'saltedHash': '8d0d281ed26224ece40c32922a0c75c5', 'status': True})

                        if responseUpload[0]:
                            return {"status":responseUpload[2]['status'],"msg":responseUpload[2]['message'], "filename":[{
                            "oldfilename":fileObject.filename,
                            "newfilename":responseUpload[2]['file_id']
                            }]}
                            # return {"status":responseUpload[2]['status'],"msg":responseUpload[2]['message'], "filename":responseUpload[2]['file_id']}
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

                        sizeFileJS = request.form.get('sizeFile')
                        fileObj = request.files[list(request.files.keys())[0]]
                        # Get the file size in bytes
                        fileObj.seek(0, 2)  # Move the cursor to the end of the file
                        file_size = fileObj.tell()  # Get the cursor position, which represents the file size
                        fileObj.seek(0)  # Reset the cursor to the start of the file for future use

                        if int(sizeFileJS)!=int(file_size):
                            return {"status":False, "msg":f"File Size Corrupt, it must be {sizeFileJS} - actually {file_size}"}
                        
                        statusUploadBucket = connBucket.uploadFromBytesFile(fileObject,folderName+tempName+"."+extfile)
                        print(1557, statusUploadBucket)
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
                        nik = session['loggedId']['nik']
                        print(f"Upload File Local - {traceback.format_exc()}")
                        Log.error(f'{nik} | Upload File Local | {traceback.format_exc()}')
                        return {"status":False, "msg":"Gagal Upload Data in Local"}
                    
            else:
                return {"status":False, "msg":checkingFile["msg"]}
        else:
            return {"status":False, "msg":"Anda tidak memiliki akses untuk Upload File"}
    elif typeFunc=="preTransaction":
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
                            extfile = str(fileItemName).split('.')[-1]

                            if valueFunc["sequenceName"]!=None: 
                                # print(1567)                                   #CUMA 1 FILE PER UPLOAD
                                newFileNameSequence = valueFunc["sequenceName"]+"."+extfile
                            else:
                                result = selectHeaderQueryRO(valueFunc['querySequence'])  
                                newFileNameSequence = result['data'][0]['sequence']+"."+extfile
                            dest_name = source_blob.name.replace(folderName+fileItemName, valueFunc["folderName"]+newFileNameSequence)
                            bucket.copy_blob(source_blob, bucket, new_name=dest_name)
                            successMoveFile.append({"tempName":fileItemName, "sequenceName":newFileNameSequence})
                            statusFile = True
                            pass
                        
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
        if valueFunc['bucketName']!="local":
            if "file-manager" in valueFunc['bucketName']:
                print(1666, valueFunc)
                jsonParam = {
                    'filter': valueFunc['filterParam'],
                    'file_id':valueFunc["idFile"],
                    'value': valueFunc['idParam'],
                    'type': valueFunc['jenisFile']
                }

                print(1686, jsonParam)

                responseDownload = ClientRequest().post(
                    appId=globalVar.APP_ID, 
                    url=valueFunc['urlDownloadFileManager'], 
                    data=jsonParam,
                    headers={
                        'appId':globalVar.APP_ID
                    }
                ).json()

                print(1685,responseDownload)
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
                try:
                    statusDownload,fileDownloaded = connBucket.downloadBytesFile(bucketfilename)
                except Exception as e:
                    print(1852, e)
                    return {"status": False, "data":{}, "msg":"File not found in bucket"}
                # print(1759, statusDownload)
                # print(1759, fileDownloaded)
                # Simulate an in-memory file (BytesIO object)
                file_object = fileDownloaded["file"]  # This is 'Hello world!' in Base64

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
                mem.seek(0)
                mime = magic.Magic(mime=True)
                mime_type = mime.from_buffer(binary_data)
            else:
                return {"status":False, "msg":"File not found."}
            return {"status":True, "data":{"mimetype":mime_type}, "file":str(fileReturn), "msg":""}
        
    elif typeFunc=="deleteFile":
        if session['loggedId']['access_menu']['status_access'].get('delete') == 'Y' :
            if valueFunc['bucketName']!="local":
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
        if valueFunc['bucketName']!="local":
            connBucket = SatBucket(valueFunc['bucketName'])
            folderName = valueFunc['folderName']

            #check file exist in storage
            bucketfilename = valueFunc['folderName']+request.json.get("data")[0]['FILE_NAME']
            storage_client = connBucket.storage_client
            bucket = storage_client.bucket(valueFunc['bucketName'])
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
    return {"status":False, "msg": "Other error in odenFileToBucket"}

def generateMongoPipeline(match=None, lookup=None, unwind=None, group=None, sort=None,skip=None, limit=None, project=None, pull=None ):
    """
    Generate MongoDB aggregation pipeline.
    
    Parameters:
    - match (dict): Match digunakan untuk clause dalam mencari data yang sesuai.
    - lookup (dict): Lookup digunakan untuk join tabel lainnya ke dalam collection yg diambil.
    - unwind (str): Mengubah array menjadi dokumen baru.
    - group (dict): Group dan aggregate function.
    - sort (dict): Sorting.
    - limit (int): Limit.
    - project (dict): Fields to include/exclude in $project.

    Returns:
    - list: Aggregation pipeline.
    """
    pipeline = []
    if match:
        pipeline.append({"$match": match})

    if lookup != None:
        pipeline.append({"$lookup": lookup})

    if unwind != None:
        pipeline.append({"$unwind": f"${unwind}"})

    if group != None:
        pipeline.append({"$group": group})

    if sort != None:
        pipeline.append({"$sort": sort})
    
    if skip != None:
        pipeline.append({"$skip": skip})

    if limit != None:
        pipeline.append({"$limit": limit})

    if project != None:
        pipeline.append({"$project": project})

    if pull != None:
        pipeline.append({"$pull": pull})

    return pipeline

def checkKeyInCollectionExists(vBlock, vData):
    block = vBlock
    listItemId = []
    data = vData
    
    try:
        for idx,cols in enumerate(block.listObjItem):
            if cols.databaseItem is True:
                listItemId.append(cols.itemId)

        for record in data:
            for itemId in listItemId:
                if itemId not in record:
                    record[itemId] = ""
        return data
    except Exception as exp:
        Log.error(f'| GAGAL GET SELECT STATEMENT | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Gagal Get Select Statement<br>{exp}')

def checkErrorMessageMongo(message):
    messageFixed = re.sub(r"datetime\.datetime\((\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\)", r"'\1-\2-\3 \4:\5:00'", message)
    match = re.search(r"'keyValue':\s*(\{(?:[^{}]*|\{[^{}]*\})*\})", messageFixed)
    if match:
        error_dict_str = match.group(1)  # Extract matched dictionary string
        print(1937, error_dict_str)
        error_dict = ast.literal_eval(error_dict_str)  # Convert string to dictionary
        return error_dict
    else:
        return message
    
def generateNestedDictDocument(dict, field, value):
    try:
        nestedDict = dict 
        if "." in field:
            nestedStr = field.split(".")
            current = nestedDict

            for k in nestedStr[:-1]:
                current = current.setdefault(k, {})

            current[nestedStr[-1]] = value
            return nestedDict
        else:
            return {field:value}
    except Exception as e:
        Log.error(f'{nik} | GAGAL GENERATE NESTED DICT INSERT | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Gagal Generate Nested Dict Inseert<br>{e}')
    
def getValueNestedField(data, fieldName):

    nik = session['loggedId']['nik']
    try:
        if("." in fieldName):
            keys = fieldName.split(".") 
            for key in keys:
                if isinstance(data, dict) and key in data:
                    data = data[key]
                else:
                    return None  
        else:
            return data[fieldName]
        return data
    except Exception as e:
        Log.error(f'{nik} | GAGAL GET VALUE NESTED FIELD | Error on line {sys.exc_info()[-1].tb_lineno}, {type(e).__name__,} {e}')
        return rMsgBox(f'Gagal Get Value Nested Dict<br>{e}')
    
def checkDatabaseCollectionMongo(database,collection):
    nik = session['loggedId']['nik']
    resultCheck = {}
    try:
        print(2085, database)
        if database in globalVar.CONN_RO.client.list_database_names():
            resultCheck["status"] = True
        else:
            resultCheck["status"] = False
            resultCheck["data"] = "Database not found"
            Log.error(f'{nik} | checkDatabaseCollectionMongo |Database {database} not found')
        if collection in globalVar.CONN_RO.client[database].list_collection_names():
            resultCheck["status"] = True
        else:
            resultCheck["status"] = False
            resultCheck["data"] = "Collection not found"
            print(f"checkDatabaseCollectionMongo - Collection not found")
            Log.error(f'{nik} | checkDatabaseCollectionMongo | Collection {collection} not found')
    except Exception as e:
        resultCheck["status"] = False
        print(f"checkDatabaseCollectionMongo - {traceback.format_exc()}")
        Log.error(f'{nik} | checkDatabaseCollectionMongo - Database Collection Check Fail| {str(traceback.format_exc())} Error on line {sys.exc_info()[-1].tb_lineno}, {type(e).__name__,} {e}')
    return resultCheck