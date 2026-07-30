"""
PROD
Update : 2025-01-31
Common Base(Tree) Oden V3
Update :    - change status after forCommit Transaction
"""
from flask import session
from pymongo.collection import ReturnDocument

class Container():
    
    def debugEks(self):
        print("\nOBJ FORM",self.getForm())
        self.getForm().debugEks()

    def update(self,vForm):
        session['vForm'] = vForm
        

    def getForm(self):
        nik = session['loggedId']['nik']
        odenRedis = DatabaseRedis()
        redisKey = "session:"+str(request.cookies.get("CLIENT"))
        try:
            return session['vForm']
        except Exception as exp:
            if odenRedis.exists(redisKey)[1] == 1:
                Log.error(f'{nik} | GAGAL GET VFORM IN CONTAINER | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp} {redisKey}')
                return rMsgBox(f'object session container tidak ditemukan <br>Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp} {redisKey}')
            else:
                Log.error(f'{nik} | GAGAL GET VFORM IN CONTAINER | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp} redis session tidak ditemukan')
                return rMsgBox(f'object session container tidak ditemukan <br>Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp} redis session tidak ditemukan')
    
    def getBlocks(self):
        return self.getForm().dataBlocks
    
    def getBlock(self,blockId):
        for block in self.getBlocks():
            if block.blockId == blockId:
                return block
        raise Exception('Block id tidak ditemukan')
    
    def block(self,blockId):
        return self.getBlock(blockId) 
      
    def selectDataStatement(self,data,blockName):
        beginTimeSelectDatastatement = datetime.now()
        nik = session['loggedId']['nik']
        try:
            returnSelect = self.getBlock(blockName).selectStatmentBlock(data,self.getForm())
            # print(f"[Total SelectDataStatement] - {blockName} - {datetime.now()-beginTimeSelectDatastatement}")
            Log.info(f"[Total SelectDataStatement] - {blockName} - {datetime.now()-beginTimeSelectDatastatement}")
            return returnSelect
        except Exception as exp:
            Log.error(f'{nik} | GAGAL SELECT DATA IN CONTAINER | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return rMsgBox(f'Gagal Select Data in Container<br>Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')

    def insertDataStatement(self,ajaxData):
        beginTimeInsertDatastatement = datetime.now()
        nik = session['loggedId']['nik']
        try:
            listBlock = []
            for block in self.getBlocks():
                listBlock.append(block)
            isGridToGrid = checkIsGridToGrid(listBlock)
            if session['loggedId']['access_menu']['status_access'].get('insert') == 'Y':
                if isGridToGrid:
                    statusValidateGridToGrid = validateTransactionDataGridToGrid(listBlock, ajaxData)
                    if statusValidateGridToGrid.get('status') == False:
                        return statusValidateGridToGrid
                self.getForm().setDataInsert(ajaxData)
                Log.info(f'{nik} | BERHASIL SET DATA INSERT |')
                val = self.getForm().validate("INSERT")
                if val['status'] and self.getForm().changeStatus is True:
                    returnInsert = self.getForm().insertStatement()
                    # print(f"[Total InsertDataStatement] - {str(returnInsert)} - {datetime.now()-beginTimeInsertDatastatement}")
                    Log.info(f"[Total InsertDataStatement] - {str(returnInsert)} - {datetime.now()-beginTimeInsertDatastatement}")
                    return returnInsert
                else:
                    return val
            else:
                return rMsgBox('ANDA TIDAK PUNYA AKSES UNTUK MENAMBAHKAN DATA!!')
        except Exception as exp:
            Log.error(f'{nik} | GAGAL INSERT DATA IN CONTAINER | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return rMsgBox(f'Gagal Insert Data in Containerr<br>Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')

    def updateDataStatement(self,ajaxData):
        beginTimeUpdateDatastatement = datetime.now()
        nik = session['loggedId']['nik']
        try:
            listBlock = []
            for block in self.getBlocks():
                listBlock.append(block)
            isGridToGrid = checkIsGridToGrid(listBlock)
            
            if session['loggedId']['access_menu']['status_access'].get('update') == 'Y':
                if isGridToGrid:
                    statusValidateGridToGrid = validateTransactionDataGridToGrid(listBlock, ajaxData)
                    if statusValidateGridToGrid.get('status') == False:
                        return statusValidateGridToGrid
                for block in self.getForm().dataBlocks:
                    # print(f'{nik} | BEFORE SET_DATA_UPDATE | {block.blockId} | {str(block.records)}')
                    Log.info(f'{nik} | BEFORE SET_DATA_UPDATE | {block.blockId} | {str(block.records)}')
                self.getForm().setDataUpdate(ajaxData)
                for block in self.getForm().dataBlocks:
                    # print(f'{nik} | AFTER SET_DATA_UPDATE | {block.blockId} | {str(block.records)}')
                    Log.info(f'{nik} | AFTER SET_DATA_UPDATE | {block.blockId} | {str(block.records)}')
                Log.info(f'{nik} | BERHASIL SET DATA UPDATE |')



                val = self.getForm().validate("UPDATE")
                Log.info(f'{nik} | VALIDATE UPDATE - VAL {str(val)} - CHANGE STATUS FORM - {self.getForm().changeStatus}')
                if val['status'] and self.getForm().changeStatus is True:
                    returnUpdate = self.getForm().updateStatement()
                    # print(f"[Total UpdateDataStatement] - {str(returnUpdate)} - {datetime.now()-beginTimeUpdateDatastatement}")
                    Log.info(f"[Total UpdateDataStatement] - {str(returnUpdate)} - {datetime.now()-beginTimeUpdateDatastatement}")
                    return returnUpdate
                else:
                    return val
            else:
                return rMsgBox('ANDA TIDAK PUNYA AKSES UNTUK MENGUBAH DATA!!')
        except Exception as exp:
            Log.error(f'{nik} | GAGAL UPDATE DATA IN CONTAINER | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return rMsgBox(f'Gagal Update Data in Container<br>Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')

    def deleteDataStatement(self,ajaxData):
        nik = session['loggedId']['nik']
        try:
            if session['loggedId']['access_menu']['status_access'].get('delete') == 'Y':
                return self.getForm().deleteStatement(ajaxData,"DELETE")
            else:
                return rMsgBox('ANDA TIDAK PUNYA AKSES UNTUK MENGHAPUS DATA!!')
        except Exception as exp:
            Log.error(f'{nik} | GAGAL DELETE DATA IN CONTAINER | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return rMsgBox(f'Gagal Delete Data in Container<br>Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')

    def validateNonBase(self,ajaxData):
        if session['loggedId']['access_menu']['success'] == True:
            self.getForm().setDataNonBase(ajaxData)
            val = self.getForm().validate("NON-BASE")
            if val["status"]:
                for key in ajaxData.keys():
                    self.getForm().block(key).rollBackData()
            return val
        else:
            return rMsgBox('ANDA TIDAK PUNYA AKSES UNTUK MENAMBAHKAN DATA!!')
            

#CLASS FORM==============================================================
class Form():
    changeStatus = False #boolean

    def __init__(self):
        self.dataBlocks = []
        self.actionActive = ""
        self.connActive = ""
        self.sessionActive = ""
        self.callFormLevel = 0
        self.databaseName = ""

    def debugEks(self):
        print("\nOBJ BLOCK",self.dataBlocks)
        for block in self.dataBlocks:
            print("BLOCK ID",block.blockId)
        for block in self.dataBlocks:
            block.debugEks()

    def getBlock(self,blockId):
        for block in self.dataBlocks:
            if block.blockId == blockId:
                return block
        raise Exception('Block id tidak ditemukan')
    
    def block(self,blockId):
        return self.getBlock(blockId)
        
    def insertStatement(self):
        nik = session['loggedId']['nik']
        try:
            finalResult = {}
            self.connActive = SatMongoDB(connectionname=globalVar.DB_ALIAS)
            sessionMongo = self.connActive.startSession()
            self.sessionActive = sessionMongo["session"]
            self.connActive.startTransaction(sessionMongo["session"])

            print(184,sessionMongo)
            for block in self.dataBlocks:
                if block.changeStatus is True and len(block.recordsInsert)!=0:
                    mainResult = block.insertStatement(sessionMongo["session"])
                else:
                    continue
                if mainResult['status'] is False:
                    self.connActive.abortTransaction(sessionMongo["session"])
                    self.connActive.endSession(sessionMongo["session"])
                    del(self.connActive)
                    del(self.sessionActive)
                    return {'status':mainResult['status'],'msg':mainResult['msg']}
            if mainResult['status'] is True:
                print(194,mainResult)
                finalResult = self.connActive.commitTransaction(sessionMongo["session"])
                self.setDataAfterMain()
            for block in self.dataBlocks:
                block.recordsInsert.clear()
            
            self.connActive.endSession(sessionMongo["session"])
            print(203, "before delete connactive")
            del(self.connActive)
            del(self.sessionActive)
            return {'status':finalResult['status'],'msg':finalResult['message'],'data':mainResult['data']}
        except Exception as exp:
            Log.error(f'{nik} | GAGAL INSERT DATA IN FORM | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return rMsgBox('Gagal Insert Data in Form')

    def updateStatement(self):
        nik = session['loggedId']['nik']
        try:
            finalResult={}
            self.connActive = SatMongoDB(connectionname=globalVar.DB_ALIAS)
            sessionMongo = self.connActive.startSession()
            self.sessionActive = sessionMongo["session"]
            self.connActive.startTransaction(sessionMongo["session"])
            for block in self.dataBlocks:
                if block.changeStatus is True and len(block.records)!=0:
                    mainResult = block.updateStatement(sessionMongo["session"])
                else:
                    continue
                if mainResult['status'] is False:
                    self.connActive.abortTransaction(sessionMongo["session"])
                    self.connActive.endSession(sessionMongo["session"])
                    del(self.connActive)
                    del(self.sessionActive)
                    return {'status':mainResult['status'],'msg':mainResult['msg']}
            if mainResult['status'] is True:
                Log.info(f'{nik} | {str(mainResult)}')
                finalResult =  self.connActive.commitTransaction(sessionMongo["session"])
                self.setDataAfterMain()
                Log.info(f'{nik} | UPDATE STATEMENT FORM | BERHASIL UPDATE DATA |')
                
            self.connActive.endSession(sessionMongo["session"])
            del(self.connActive)
            del(self.sessionActive)
            return {'status':finalResult['status'],'msg':finalResult['message'],'data':mainResult['data']}  
        except Exception as exp:
            Log.error(f'{nik} | GAGAL UPDATE DATA IN FORM | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return rMsgBox('Gagal update data in form')
             

    def deleteStatement(self,data,actionType):
        nik = session['loggedId']['nik']
        try: 
            self.actionActive = actionType
            for blockName in data.keys():
                if data[blockName]['data']!=[]:
                    return self.block(blockName).deleteStatementBlock(data[blockName]['data'])
        except Exception as exp:
            Log.error(f'{nik} | GAGAL DELETE DATA IN FORM | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return rMsgBox('Gagal Delete Data in Form')

    def setDataAfterMain(self):
        self.changeStatus = False
        for block in self.dataBlocks:
            block.setDataAfterMain()

    def append(self,block):
        self.dataBlocks.append(block)
    
    def validate(self,validateType):
        nik = session['loggedId']['nik']
        self.actionActive = validateType
        for idx,block in enumerate(self.dataBlocks):
            returnVal = {"status":True}
            if validateType=="INSERT":
                try:
                    if block.changeStatus is True and block.recordsInsert!=[]:
                        returnVal = block.validateBase(validateType) 
                    else:
                        Log.info(f"{block.blockId} - {str(block.changeStatus)} - {str(len(block.recordsInsert))}") 
                except Exception as exp:
                    print(f"validate INSERT (Form) - {block.blockId} - {traceback.format_exc()}")
                    Log.error(f"{nik} | validate INSERT (Form) - {block.blockId} | {traceback.format_exc()}") 
            elif validateType=="UPDATE":
                try:
                    if block.changeStatus is True and block.records!=[]:
                        returnVal = block.validateBase(validateType)
                    else:
                        Log.info(f"{block.blockId} - {str(block.changeStatus)} - {str(len(block.records))}")
                except Exception as exp:
                    print(f"{nik} | validate UPDATE (Form) - {block.blockId} | {str(traceback.format_exc())}")
                    Log.error(f"{nik} | validate UPDATE (Form) - {block.blockId} | {str(traceback.format_exc())}")
            elif validateType=="NON-BASE":
                if block.changeStatus is True and block.recordsNonBase!=[]:
                    returnVal =  block.validateBase(validateType)
                else:
                    Log.warning(f"{block} - {str(block.changeStatus)} - {str(len(block.recordsNonBase))}")
            
            if returnVal['status']:
                if idx+1 == len(self.dataBlocks):
                    return returnVal
            else:
                return returnVal
        return {'status':False,'msg':'primaryKey tidak bisa diubah pada odenV2'}
    
    def setDataInsert(self,data):
        nik = session['loggedId']['nik']
        try:
            for blockName in data.keys():
                self.block(blockName).setDataInsert(data[blockName],self)
                if self.block(blockName).changeStatus is True:
                    self.changeStatus = True
        except Exception as exp:
            Log.error(f'{nik} | GAGAL SET DATA INSERT IN FORM | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return rMsgBox('Gagal Set Data Insert in Form')

    def setDataUpdate(self,data):
        nik =  session['loggedId']['nik']
        try:
            for blockName in data.keys():
                self.block(blockName).setDataUpdate(data[blockName])
        except Exception as exp:
            Log.error(f'{nik} | GAGAL SET DATA UPDATE IN FORM | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return rMsgBox('Gagal set data update in form')
    
    def setDataNonBase(self,data):
        for blockName in data.keys():
            self.block(blockName).setDataNonBase(self,data[blockName])
            if self.block(blockName).changeStatus is True:
                self.changeStatus = True
        
    def changeStatusUpdate(self):
        self.changeStatus = True
        

    def resetValue(self):
        for block in self.dataBlocks:
            if self.actionActive == "UPDATE":
                if block.changeStatus is True and block.records!=[]:
                    block.resetValue()
            elif self.actionActive == "INSERT":
                if block.changeStatus is True and block.recordsInsert!=[]:
                    block.resetValue()

    def rollBackData(self):
        self.changeStatus = False

    def clearPkAjax(self):
        for block in self.dataBlocks:
            block.pkAjax = []

    def validatePkCallForm(self,blockName,pkData):
        if len(pkData)!=0:
            return self.getBlock(blockName).validatePkCallForm(pkData)
        else:
            return {"status":True,"data":{},"msg":""}
    

#CLASS BLOCK==============================================================
class DataBlock():
    def __init__(self,blockId):
        self.pkActive = []
        self.parentObj = None
        self.databaseTable = ""
        self.databaseTableHistory = ""
        self.blockId = blockId
        self.pythonId = ""
        self.JavascriptId = ""
        self.primaryKeyId = []
        self.listObjItem = []
        self.ObjRecord = None
        self.changeStatus = False 
        self.records = [] 
        self.recordsInsert = []
        self.databaseColumns = []
        self.whereclause = ""
        self.orderBy = {}
        self.limit = ""
        self.nonVisibleItems = []
        self.noDbItems = []
        self.relationBlock = None
        self.recordsNonBase = []
        self.dataNonBase = []
        self.usingObjectId = False
        self.subDocument = None

    # @property
    # def records(self):
    #     # print(320,f"PROPERTY - {self.blockId} - {self._records}")
    #     return self._records
    
    # @records.setter
    # def records(self,value):
    #     print(325, f"SETTER - {self.blockId} - _RECORDS - {self._records}")
    #     print(326, f"SETTER - VALUE - {self.blockId} - {value}")
    #     self._records = value

    def debugEks(self):
        print("\nOBJ RECORDS",self.records)
        for record in self.records:
            record.debugEks()

    def item(self,itemId):
        Log.info(f'self.Item | {str(self.parentObj.actionActive)}')
        if self.parentObj.actionActive == "UPDATE":
            return self.itemUpdate(itemId)
        elif self.parentObj.actionActive == "INSERT":
            return self.itemInsert(itemId)
        elif self.parentObj.actionActive == "DELETE":
            return self.itemDelete(itemId)
        elif self.parentObj.actionActive == "NON-BASE":
            return self.itemNonBase(itemId)


    def itemUpdate(self,itemId):
        if self.blockType == "form":
            for record in self.records:
                for item in record.items:
                    if item.itemId == itemId:
                        return item
        elif self.blockType == "datagrid":
            for record in self.records:
                if set(record.primaryKey) == set(self.pkActive):
                    for item in record.items:
                        if item.itemId == itemId:
                            return item
    
    def itemInsert(self,itemId):
        if self.blockType == "form" and self.recordsInsert ==[]:
            for record in self.records:
                for item in record.items:
                    if item.itemId == itemId:
                        return item
        elif self.blockType == "datagrid" and self.recordsInsert ==[]:
            for record in self.records:
                if set(record.primaryKey) == set(self.pkActive):
                    for item in record.items:
                        if item.itemId == itemId:
                            print(item)
                            return item
        else:
            for record in self.recordsInsert:
                if set(record.primaryKey) == set(self.pkActive):
                    for item in record.insertItems:
                        if item.itemId == itemId:
                            return item

    def itemDelete(self, itemId):
        if self.blockType == "form":
            for record in self.records:
                for item in record.items:
                    if item.itemId == itemId:
                        return item
        elif self.blockType == "datagrid":
            for record in self.records:
                if set(record.primaryKey) == set(self.pkActive):
                    for item in record.items:
                        if item.itemId == itemId:
                            return item

    def itemNonBase(self, itemId):
        if self.blockType == "form":
            for record in self.recordsNonBase:
                for item in record.nonBaseItems:
                    if item.itemId == itemId:
                        return item

    def preSelect(self,data):
        return {'status':True,'data':data,'msg':''}
    
    def postSelect(self,data):
        return {'status':data['status'],'data':data['data']}

    def preQuery(self,data):
        return self.preSelect(data)
    
    def postQuery(self,data):
        return self.postSelect(data)
    
    def preInsert(self):
        return {'status':True,'msg':''}
    
    def postInsert(self,data):
        return {'status':data['status'],'msg':data['msg'],'data':data['data']}

    def preUpdate(self):
        return {'status':True,'msg':''}
    
    def postUpdate(self,data):
        return {'status':data['status'],'msg':data['msg'],'data':data['data']}

    def preDelete(self,data):
        return {'status':True,'data':data,'msg':''}
    
    def postDelete(self,data):
        
        return {'status':data['status'],'msg':data['msg']}
            
    def createObjItem(self,dataSelect):
        nik = session['loggedId']['nik']
        try:
            self.records = []
            for record in dataSelect['data']:
                vRecord = self.ObjRecord(record,self)
                self.append(vRecord)
            Log.info(f'{nik} | BERHASIL SELECT DATA |')
            return dataSelect
        except Exception as exp:
            Log.error(f'{nik} | GAGAL SELECT DATA IN BLOCK | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return rMsgBox('Gagal Select Data in Block')

    def selectStatmentBlock(self,data,parentObj):
        nik = session['loggedId']['nik']
        try:
            beginSelectStatementBlock = datetime.now()
            dataSelect = self.mainSelectStatement(data)
            # print(f"[SelectStatementBlock - {self.blockId}] - {datetime.now()-beginSelectStatementBlock}")
            Log.info(f"[SelectStatementBlock - {self.blockId}] - {datetime.now()-beginSelectStatementBlock}")
            try:
                self.parentObj = parentObj
                if dataSelect["status"]:
                    for record in dataSelect['data']:
                        vRecord = self.ObjRecord(record,self)
                        Log.info(f'CEK ERROR RECORD KOSONG, {vRecord}')
                        self.append(vRecord)
                    Log.info(f'{nik} | BERHASIL SELECT DATA {self.blockId} | {str(len(self.records))}')                   
                    for block in self.parentObj.dataBlocks:
                        Log.info(f'LOOP CEK ERROR RECORD KOSONG, {block.blockId}, {block.records}, | {str(len(block.records))}')
                    return dataSelect
                else:
                    return dataSelect
            except Exception as exp:
                Log.warning(f'{nik} | GAGAL SELECT DATA (DATA TIDAK DITEMUKAN) | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
                return dataSelect
        except Exception as exp:
            Log.error(f'{nik} | GAGAL SELECT DATA IN BLOCK | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return rMsgBox('Gagal Select Data in Block')

    def mainSelectStatement(self,param):
        nik = session['loggedId']['nik']
        try:
            if param['data']['offsetNumber'] == 0 or param['blockType']== 'form':
                self.records = []             #=> karena tiap dia load next data tidak bisa update karena records nya jadi kosong
            beginPreSelect = datetime.now()
            preSelect = self.preSelect(param)
            print(507, preSelect, self.preSelect)
            # print(f"[PreSelect - {self.blockId}] - {datetime.now()-beginPreSelect}")
            Log.info(f"[PreSelect - {self.blockId}] - {datetime.now()-beginPreSelect}")
            if preSelect['status']:
                beginMainSelect = datetime.now()
                # print("mainSelect =====", beginMainSelect, "=====")
                selectStatement = getSelectStatement(self,preSelect['data'])
                print(541, selectStatement, "CORE")
                dbName = globalVar.DB_NAME
                mainSelect = selectDataHeaderQueryRO(dbName, self.databaseTable, selectStatement)
                # print(f"[MainSelect - {self.blockId}] - {datetime.now()-beginMainSelect}")
                Log.info(f"[MainSelect - {self.blockId}] - {datetime.now()-beginMainSelect}")
            else:
                return{'status':preSelect['status'],'msg':preSelect['msg']}  
            if mainSelect['status']:
                beginPostSelect = datetime.now()
                print(543, mainSelect["data"])
                mainSelect["data"] = checkKeyInCollectionExists(self,mainSelect["data"]) 
                returnpostSelect = self.postSelect(mainSelect)
                # print(f"[PostSelect - {self.blockId} - {datetime.now()-beginPostSelect}")
                Log.info(f"[PostSelect - {self.blockId} - {datetime.now()-beginPostSelect}")
                return returnpostSelect
            else:
                Log.info(f"{mainSelect}")
                return{'status':mainSelect['status'],'msg':f"{datetime.now().strftime('%d-%m-%Y | %H:%M:%S')} | {mainSelect['data']}"}
        except Exception as exp:
            Log.error(f'{nik} | GAGAL SELECT DATA IN MAIN BLOCK | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return rMsgBox('Gagal Select Data in Main Block')

    def updateStatement(self, sessionMongoDB):
        beginTimeUpdateDatastatement = datetime.now()
        nik = session['loggedId']['nik']
        try:
            updateResult = {}
            recordUpdate = []
            for record in self.records:
                if record.changeStatus is True:
                    recordUpdate.append(record)
                    Log.info(f'{nik} | BEFORE STATEMENT RECORD | UPDATE DATA')
                    updateResult = record.updateStatement(sessionMongoDB)
                    Log.info(f'{nik} | UPDATE STATEMENT BLOCK | UPDATE DATA - {str(updateResult)}')
                    if updateResult['status'] is False:
                        # print(f"[Update Block] - {str(updateResult)} - {self.blockId} - {datetime.now()-beginTimeUpdateDatastatement}")
                        Log.info(f"[Update Block] - {str(updateResult)} - {self.blockId} - {datetime.now()-beginTimeUpdateDatastatement}")
                        # return updateResult
                        break
                else:
                    continue
            # print(f"[Update Block] - {str(updateResult)} - {self.blockId} - {datetime.now()-beginTimeUpdateDatastatement}")
            Log.info(f"[Update Block] - {str(updateResult)} - {self.blockId} - {datetime.now()-beginTimeUpdateDatastatement}")
            return updateResult
        except Exception as exp:
            Log.error(f'{nik} | GAGAL UPDATE DATA IN BLOCK | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return rMsgBox('Gagal update data in block')

    def insertStatement(self, sessionMongoDB):
        beginTimeInsertDatastatement = datetime.now()
        nik = session['loggedId']['nik']
        try:
            insertResult = {}
            for record in self.recordsInsert:
                if record.changeStatus is True:
                    insertResult = record.insertStatement(sessionMongoDB)
                    if insertResult['status'] is False:
                        Log.info(f"[Insert Block] - {str(insertResult)} - {self.blockId} - {datetime.now()-beginTimeInsertDatastatement}")
                        return insertResult
                else:
                    continue
            Log.info(f"[Insert Block] - {str(insertResult)} - {self.blockId} - {datetime.now()-beginTimeInsertDatastatement}")
            return insertResult
        except Exception as exp:
            Log.error(f'{nik} | GAGAL INSERT DATA IN BLOCK | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return rMsgBox('Gagal Insert Data in Block')

        
    def deleteStatementBlock(self,data):
        nik = session['loggedId']['nik']
        try:
            vCollection,vParam, vDatas, vUpdateParam = getDeleteStatement(self,data)
            print(612, vCollection,vParam, vDatas, vUpdateParam)
            return self.mainDeleteStatement(vCollection, vParam, vDatas, vUpdateParam)
        except Exception as exp:
            Log.error(f'{nik} | GAGAL DELETE DATA IN BLOCK | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return rMsgBox('Gagal Delete Data in Block')

    def mainDeleteStatement(self, vCollection, param, data, updateParam):
        nik = session['loggedId']['nik']
        try:
            mainDelete = {"status": True, "data":[], "msg":""}
            self.pkActive = self.getPkJs(data, self.primaryKeyId)
            self.setPkParentRelation(param)
            preDelete = self.preDelete(data)
            recordDelete = None
            conn = SatMongoDB(connectionname=globalVar.DB_ALIAS)
            sessionMongo = conn.startSession()
            conn.startTransaction(sessionMongo["session"])
            if preDelete['status']:
                if(len(updateParam) == 0):
                    resultdel = conn.findOneAndDelete(globalVar.DB_NAME, vCollection, preDelete["data"], session=sessionMongo["session"])
                    messagedel = resultdel["message"]
                else:
                    resultdel = conn.findOneAndUpdate(globalVar.DB_NAME,vCollection, preDelete["data"], updateParam, session=sessionMongo["session"], return_document = ReturnDocument.AFTER)
                    messagedel = resultdel["message"]
            else:
                conn.endSession(sessionMongo["session"])
                return {'status': preDelete['status'], 'msg': preDelete['msg']}
            if resultdel["object"]:
                mainDelete["data"] = resultdel["object"]
                if self.blockType == "datagrid":
                    for record in self.records:
                        if set(record.primaryKey) == set(self.pkActive):
                            del record
                if self.databaseTableHistory:
                    print(656, "!!!!!!!!!!!!!!",recordDelete, updateParam, param)
                    recordDelete = globalVar.CONN_RO.findOne(globalVar.DB_NAME, vCollection, param)
                    if recordDelete["object"]:
                        document = recordDelete["object"]
                        document.update({"user_proses":session["loggedId"]["nik"], "flag_proses":"DELETE"})
                        if len(updateParam) == 0:
                            if("_id" in document):
                                document["_idCopy"] = document["_id"]
                                del document["_id"]
                            resultinsert = conn.insertOne(globalVar.DB_NAME, self.databaseTableHistory, document, session=sessionMongo["session"])
                            messageinsert = resultinsert["message"]
                            if (resultinsert["object"].acknowledged):
                                Log.info(f'{nik} | BERHASIL HISTORY DATA |')
                            else:
                                del (conn)
                                Log.error(f'{nik} | GAGAL INSERT HISTORY DATA IN MAIN BLOCK {messageinsert}')
                                return rMsgBox('Gagal Insert History Data in Main Block {messageinsert}')
                        else:
                            document = {}
                            document.update({"user_proses":session["loggedId"]["nik"], "flag_proses":"DELETE"})
                            document.update(updateParam["$pull"])
                            
                            if("_id" in param):
                                document["_idCopy"] = param["_id"]
                            else:
                                document["_idCopy"] = param
                            resultinsert = conn.insertOne(globalVar.DB_NAME, self.databaseTableHistory, document, session=sessionMongo["session"])
                            messageinsert = resultinsert["message"]
                            if (resultinsert["object"].acknowledged):
                                Log.info(f'{nik} | BERHASIL HISTORY DATA |')
                            else:
                                del (conn)
                                Log.error(f'{nik} | GAGAL INSERT HISTORY DATA IN MAIN BLOCK {messageinsert}')
                                return rMsgBox('Gagal Insert History Data in Main Block {messageinsert}')
                            # historyUpdate = {"$push": {}}
                            # historyUpdate["$push"] = {**updateParam["$pull"], **{"user_delete_item."+str(session["loggedId"]["nik"]):updateParam["$pull"]}}
                            # historyUpdate.update({"$set": {"flag_proses":"DELETE"}})
                            # if("_id" in param):
                            #     param["_idCopy"] = param["_id"]
                            #     del param["_id"]
                            # resulthistory = conn.findOneAndUpdate(globalVar.DB_NAME,self.databaseTableHistory, param, historyUpdate, session=sessionMongo["session"], upsert=True, return_document = ReturnDocument.AFTER)
                            # messagehistory = resulthistory["message"]
                            # if (resulthistory["object"]):
                            #     Log.info(f'{nik} | BERHASIL HISTORY SUBDOCUMENT DATA |')
                            # else:
                            #     del (conn)
                            #     Log.error(f'{nik} | GAGAL INSERT HISTORY SUBDOCUMENT DATA IN MAIN BLOCK {messagehistory}')
                            #     return rMsgBox('Gagal Insert History SUBDOCUMENT Data in Main Block {messagehistory}')
                conn.commitTransaction(sessionMongo["session"])
                conn.endSession(sessionMongo["session"])
                Log.info(f'{nik} | BERHASIL DELETE DATA |')
                del (conn)
                return self.postDelete(mainDelete)
            else:
                mainDelete.update({"status":"False", "msg":messagedel})
                conn.abortTransaction(sessionMongo["session"])
                conn.endSession(sessionMongo["session"])
                del (conn)
                return {'status': mainDelete['status'],'msg': f"{datetime.now().strftime('%d-%m-%Y | %H:%M:%S')} | "}
        except Exception as exp:
            Log.error(
                f'{nik} | GAGAL DELETE DATA IN MAIN BLOCK | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return rMsgBox('Gagal Delete Data in Main Block')

    def setListObj(self,listObj):
        self.listObjItem = listObj
        self.getPrimaryKeyId()
        self.getDatabaseColumns()
        self.getNoDbItems()

    def getNoDbItems(self):
        for item in self.listObjItem:
            if item.databaseItem is False:
                self.noDbItems.append(item.itemId)

    def getPrimaryKeyId(self):
        for item in self.listObjItem:
            if item.primaryKey is True:
                self.primaryKeyId.append([item.databaseColumn,item.itemId])

    def getDatabaseColumns(self):
        for item in self.listObjItem:
            self.databaseColumns.append(item.databaseColumn)

    def append(self,record):
        self.records.append(record)

        Log.info(f'CEK ERROR RECORD KOSONG APPEND, {self.records}')
    
    def setDataAfterMain(self):
        self.changeStatus = False
        for record in self.records:
            record.setDataAfterMain()
        # self.parentObj.setDataAfterMain()
    
    def setPkParentRelation(self,data):
        # GRID TO GRID
        print(821,data)
        # 2 LEVEL GRID (G G G)
        print(835,"SET ONE LEVEL PK ACTIVE")
        if self.relationBlock is not None:
            blockRelationLvlOne = self.relationBlock
            if blockRelationLvlOne.blockType == 'datagrid':
                recordActiveLvlOne = ''
                fkLevelOne = []
                for record in blockRelationLvlOne.records:
                    for item in record.items:
                        itemId = item.itemId
                        if (itemId in data.keys()) and (data[itemId] == item.value) and (item.primaryKey is True):
                            fkLevelOne.append(item.value)
                            recordActiveLvlOne = record
                    
                print(835,"RESULT ONE LEVEL PK ACTIVE",fkLevelOne)

                
                blockRelationLvlOne.pkActive = fkLevelOne
                
                print("SET TWO LEVEL")
                # ^ GET PK LevelTwo
                # 3 LEVEL GRID (G G G)
                if blockRelationLvlOne.relationBlock is not None:
                    blockRelationLvlTwo = blockRelationLvlOne.relationBlock
                    if blockRelationLvlTwo.blockType == 'datagrid':
                        fkLevelTwo = []
                        pkParent = []
                        
                        for pk in blockRelationLvlTwo.primaryKeyId:
                            pkParent.append(pk[1])
                        for item in recordActiveLvlOne.items:
                            if item.itemId in pkParent:
                                fkLevelTwo.append(item.value)
                        blockRelationLvlTwo.pkActive = fkLevelTwo
                        
                        print(858,"RESULT TWO LEVEL PK ACTIVE",fkLevelTwo)
    def setDataUpdate(self,data):
        nik = session['loggedId']['nik']
        try:
            if len(data['data']) != 0:
                for data in data['data']:
                    pkData = self.getPkJs(data, self.primaryKeyId)
                    self.setPkParentRelation(data)
                    for record in self.records:
                        print(800, record.primaryKey, pkData)
                        print(801, record.primaryKey == pkData)
                        print(802, set(record.primaryKey), set(pkData))
                        print(803, set(record.primaryKey) == set(pkData))
                        if record.primaryKey == pkData and set(record.primaryKey) == set(pkData):                           
                            record.setDataUpdate(data)
        except Exception as exp:
            Log.error(f'{nik} | GAGAL SET DATA UPDATE IN BLOCK | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return rMsgBox('Gagal set data update in block')

    
    def setDataInsert(self,data,parentObj):
        nik = session['loggedId']['nik']
        try:
            self.parentObj = parentObj
            self.recordsInsert = []
            if len(data['data']) != 0:
                for data in data['data']:
                    newRecord = self.ObjRecord(data,self)
                    if self.usingObjectId is False:
                        pkData = self.getPkJs(data, self.primaryKeyId)
                    else:
                        pkData = []
                        for primaryKey in self.primaryKeyId:
                            if primaryKey[1] in data.keys():
                                del data[primaryKey[1]]
                    newRecord.setDataInsert(pkData,data)
                    self.recordsInsert.append(newRecord)
                    self.changeStatus = True
                    self.setPkParentRelation(data)
                Log.info(f'{nik} | set recordInsert | {str(self.recordsInsert)}')
        except Exception as exp:
            Log.error(f'{nik} | GAGAL SET DATA INSERT IN BLOCK | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return rMsgBox('Gagal Set Data Insert in Block')
    
    def setDataNonBase(self,parentObj,data):
        self.recordsNonBase = []
        self.dataNonBase = []
        self.parentObj = parentObj
        if len(data['data']) != 0:
            for data in data['data']:
                pkData = []
                newRecord = self.ObjRecord(data,self)
                newRecord.setDataNonBase(pkData,data)
                self.recordsNonBase.append(newRecord)
                self.changeStatus = True

    def getPkJs(self,data,primaryKeyId):
        pkData = []
        for pk in primaryKeyId:
            pkData.append(data[pk[1]])
        return pkData
    
    def validateBase(self,validateType):
        val = {}
        if validateType=="UPDATE":
            for record in self.records:
                if record.changeStatus is True:
                    self.pkActive = record.primaryKey
                    val = record.validateBase(validateType)
                    print(f"717 - val - {str(val)}")
                    if val['status'] is False:
                        self.parentObj.resetValue()
                        return val
        elif validateType=="INSERT":
            for recordInsert in self.recordsInsert:
                if recordInsert.changeStatus is True:
                    self.pkActive = recordInsert.primaryKey
                    val = recordInsert.validateBase(validateType)
                    if val['status'] is False:
                        self.parentObj.resetValue()
                        return val
        elif validateType=="NON-BASE":
            if len(self.listObjItem) == 0:
                val.update({'data':[{}],'status':True})
            else:
                for recordNonBase in self.recordsNonBase:
                    if recordNonBase.changeStatus is True:
                        val = recordNonBase.validateBase(validateType)
                        if val['status'] is False:
                            return val
                val.update({'data':self.dataNonBase})
        return val

    
    def getPkDb(self):
        pass

    def getPkPy(self):
        pass
    
    def changeStatusUpdate(self):
        self.changeStatus = True
        self.parentObj.changeStatusUpdate()
    
    def resetValue(self):
        if self.parentObj.actionActive == "UPDATE":
            for record in self.records:
                if record.changeStatus is True:
                    record.resetValue()
        elif self.parentObj.actionActive == "INSERT":
            for record in self.recordsInsert:
                del record
            self.recordsInsert = []
            self.rollBackData()

    def rollBackData(self):
        self.changeStatus = False
        self.parentObj.rollBackData()

    def validatePkCallForm(self,pkData):
        if self.databaseTable == "":
            return{"status":True,"data":pkData,"msg":"DATA FILTER"}
        if len(self.records)!=0:
            for record in self.records:
                if set(record.primaryKey) == set(pkData):
                    return record.validatePkCallForm()
        else:
            Log.info("747 - record block kosong") 
        return{"status":False,"data":{},"msg":"DATA TIDAK VALID"}
class FormLayout(DataBlock):
    blockType = "form" 
    multiRecord = False
    pass

class DataGridLayout(DataBlock):
    blockType = "datagrid"
    multiRecord = True
    pass


#CLASS RECORD==============================================================
class Record():
  
    def __init__(self, record, parentObj):
        self.parentObj = parentObj
        self.primaryKey = []
        self.changeStatus = False #boolean
        self.items = []
        self.insertItems = []
        self.nonBaseItems = []
        self.dataNonBase = {}
        self.indexSubDocument = None

        listItemObj = []
        for item in self.parentObj.listObjItem:
            vItem = item()
            if vItem.itemId in record:
                if record[vItem.itemId] is None:
                    vItem.value = ''
                else:
                    vItem.value = record[vItem.itemId]
            else:
                vItem.value = ''
            vItem.parentObj = self
            self.items.append(vItem)
            listItemObj.append(vItem)
        self.getPkValue(listItemObj) 
        if self.parentObj.subDocument is not None and "index" in record:
            self.indexSubDocument = int(record["index"])

    def debugEks(self):
        print("\nPK RECORD",self.primaryKey)
        print("OBJ ITEMS IN RECORD", self.items)
        for item in self.items:
            print("ITEM ID",item.itemId,"| VALUE ITEM",item.valueItem)
    
    def item(self,itemId):
        return self.parentObj.item(itemId)

    def getItem(self,itemId):
        return self.parentObj.item(itemId)

    def updateStatement(self, sessionMongoDB):
        nik = session['loggedId']['nik']
        try:
            mainUpdate = {"status": True, "data":[], "msg":""}
            self.parentObj.pkActive = self.primaryKey
            preUpdate = self.parentObj.preUpdate()
            if preUpdate['status']:
                vCollection, pkParam, setParam, vNewData = getUpdateStatementRecord(self,session['loggedId']['nik'])
                Log.info(f"SQL UPDATE - {vCollection, pkParam, setParam, vNewData}")
                resultUpdate = self.parentObj.parentObj.connActive.findOneAndUpdate(globalVar.DB_NAME,vCollection, pkParam, setParam, session=sessionMongoDB, return_document = ReturnDocument.AFTER)
                messageUpdate = resultUpdate["message"]
                Log.info(f"RESULT SQL UPDATE - {str(resultUpdate)}")
                if not resultUpdate["object"]:
                    return{'status':False,'msg':f"{datetime.now().strftime('%d-%m-%Y | %H:%M:%S')} {messageUpdate or 'Data modified not found in database'}"}
            else:
                self.parentObj.parentObj.resetValue()
                return{'status':preUpdate['status'], 'msg':preUpdate['msg']}
            if resultUpdate["object"]:
                dataAfterMain = {}
                mainUpdate.update(msg=messageUpdate)
                self.setDataAfterMain(vNewData)

                if self.parentObj.blockType == "form":
                    if self.parentObj.relationBlock is None:
                        for data in self.items:
                            if data.valueItem != '' and data.databaseItem is True:
                               dataAfterMain.update({data.itemId:checkTypeDatas([{data.itemId:data.valueItem}])[0][data.itemId]})
                    else:
                        for data in self.parentObj.relationBlock.records[0].items:
                           dataAfterMain.update({data.itemId:checkTypeDatas([{data.itemId:data.valueItem}])[0][data.itemId]})
                elif self.parentObj.blockType == "datagrid":
                    if len(session['vForm'].dataBlocks) != 1:
                        for block in session['vForm'].dataBlocks:
                            if block.blockType == "form" and len(block.records)!=0:
                                for data in block.records[0].items:
                                    # print(1213, data.valueItem)
                                    if data.valueItem != '' and data.databaseItem is True:
                                        dataAfterMain.update({data.itemId:checkTypeDatas([{data.itemId:data.valueItem}])[0][data.itemId]})
                            elif block.blockType == "datagrid" and len(block.records)!=0 and block.relationBlock:

                                print(972, "!!!!!!!!!!!! MASUK !!!!!!!!!!!!!!!!!!!!")
                                for record in block.records:
                                    if(set(record.primaryKey) == set(block.pkActive)):
                                        for data in record.items:
                                            if data.valueItem != '' and data.databaseItem is True:
                                                dataAfterMain.update({data.itemId:checkTypeDatas([{data.itemId:data.valueItem}])[0][data.itemId]})
                mainUpdate.update(data=dataAfterMain)
                Log.info(f'{nik} | UPDATE DATA |')
                return self.parentObj.postUpdate(mainUpdate)
        except Exception as exp:
            Log.error(f'{nik} | GAGAL UPDATE DATA IN RECORD | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return rMsgBox('Gagal update data in record')

    def insertStatement(self, sessionMongoDB):
        nik = session['loggedId']['nik']
        try:
            mainInsert = {"status": True, "data":[], "msg":""}
            self.parentObj.pkActive = self.primaryKey
            preInsert = self.parentObj.preInsert()
            if preInsert['status']:
                vCollection, document, vNewData, vSubDocument, vPK = getInsertStatementRecord(self,session['loggedId']['nik'])
                # print(933, vCollection, document, vNewData, vSubDocument, vPK)
                if(len(vSubDocument) == 0 and len(vPK) == 0):
                    resultinsert = self.parentObj.parentObj.connActive.insertOne(globalVar.DB_NAME, vCollection, document, session=sessionMongoDB)
                    messageinsert = resultinsert["message"]
                    if not resultinsert["object"] or not resultinsert["object"].acknowledged:
                        if(resultinsert["code"] == "E11000"):
                            messageinsert = f"Error! Duplicate key value {messageinsert}"
                        self.parentObj.parentObj.resetValue()
                        Log.error(f'{nik} | GAGAL INSERT DATA IN RECORD | {messageinsert}')
                        return {'status':False,'msg':f"{datetime.now().strftime('%d-%m-%Y | %H:%M:%S')} | {messageinsert}"}
                else:

                    resultinsert = self.parentObj.parentObj.connActive.findOneAndUpdate(globalVar.DB_NAME,vCollection, vPK, vSubDocument, session=sessionMongoDB, return_document = ReturnDocument.AFTER)
                    messageinsert = resultinsert["message"]
                    if not resultinsert["object"]:
                        Log.error(f'{nik} | GAGAL INSERT DATA IN RECORD | {messageinsert}')
                        return {'status':False,'msg':f"{datetime.now().strftime('%d-%m-%Y | %H:%M:%S')} | {messageinsert}"}
            else:
                self.parentObj.parentObj.resetValue()
                return{'status':preInsert['status'], 'msg':preInsert['msg']}
            if resultinsert["object"]:
                mainInsert.update(msg=messageinsert)
                dataAfterMain = {}

                if self.parentObj.blockType == "form": 
                    self.parentObj.records = []

                self.setDataAfterMain(vNewData)
                self.parentObj.append(self)

                if self.parentObj.blockType == "form":
                    if self.parentObj.relationBlock is None:
                        for data in self.items:
                            if data.valueItem != '' and data.databaseItem is True:
                                dataAfterMain.update({data.itemId:checkTypeDatas([{data.itemId:data.valueItem}])[0][data.itemId]})
                    else:
                        for data in self.parentObj.relationBlock.records[0].items:
                            dataAfterMain.update({data.itemId:checkTypeDatas([{data.itemId:data.valueItem}])[0][data.itemId]})
                elif self.parentObj.blockType == "datagrid":
                    if len(session['vForm'].dataBlocks) != 1:
                        for block in session['vForm'].dataBlocks:
                            if block.blockType == "form" and len(block.records)!=0:
                                for data in block.records[0].items:
                                    if data.valueItem != '' and data.databaseItem is True:
                                        dataAfterMain.update({data.itemId:checkTypeDatas([{data.itemId:data.valueItem}])[0][data.itemId]})
                            elif block.blockType == "datagrid" and len(block.records)!=0:
                                for data in block.records[len(block.records) -1].items:
                                    if data.valueItem != '' and data.databaseItem is True:
                                        dataAfterMain.update({data.itemId:checkTypeDatas([{data.itemId:data.valueItem}])[0][data.itemId]})
                mainInsert.update(data=dataAfterMain)
                print(964, "!!!!",dataAfterMain)
                Log.info(f'{nik} | BERHASIL INSERT DATA |')
                return self.parentObj.postInsert(mainInsert)
        except Exception as exp:
            Log.error(f'{nik} | GAGAL INSERT DATA IN RECORD | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return rMsgBox('Gagal Insert Data in Record')
    
    def getInsertItem(self,idObj):
        for item in self.insertItems:
            if item.itemId == idObj:
                return item.valueItem

    def validateBase(self,validateType):
        val = {}
        if validateType=="UPDATE": 
            for item in self.items:
                if item.changeStatus is True and item.databaseItem is True:
                    val = item.validateBase()
                    if val['status'] is False:
                        self.parentObj.parentObj.resetValue()
                        return val
            val = self.validate()
        elif validateType=="INSERT":
            for itemInsert in self.insertItems:
                if itemInsert.changeStatus is True and itemInsert.databaseItem is True:
                    val = itemInsert.validateBase()
                    if val['status'] is False:
                        self.parentObj.parentObj.resetValue()
                        return val
            val = self.validate()
        elif validateType=="NON-BASE":
            for nonBaseItem in self.nonBaseItems:
                if nonBaseItem.changeStatus is True:
                    val = nonBaseItem.validateNonBase()
                    if val['status'] is False:
                        return val
            for nonBaseItem in self.nonBaseItems:
                if nonBaseItem.changeStatus is True:
                    
                    self.dataNonBase.update({nonBaseItem.itemId:nonBaseItem.valueItem})
            self.parentObj.dataNonBase.append(self.dataNonBase)
            val = self.validate()
        return val
    
    def validate(self):
        return {'status':True, 'msg':''}
    
    def validateRecord(self):
        return self.validateBase()
    
    def getPkValue(self,listItemObj):
        for item in listItemObj:
            if item.primaryKey == True:
                self.primaryKey.append(str(item.valueItem))

    def setDataAfterMain(self,data=None):
        if data!=None:
            for key in data.keys():
                for item in self.items:
                    if item.itemId==key:
                        item.valueItem = data[key]
        else:
            self.changeStatus = False                  
            for item in self.items:
                item.setDataAfterMain()

    def setDataUpdate(self,data):
        nik = session['loggedId']['nik']
        try:
            for key in data.keys():
                for item in self.items:
                    if item.itemId==key:
                        item.changeStatusUpdate(data[key])
        except Exception as exp:
            Log.error(f'{nik} | GAGAL SET DATA UPDATE IN RECORD | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return rMsgBox('Gagal set data update in record')

    def setDataInsert(self,pkData,data):
        nik = session['loggedId']['nik']
        try:
            self.primaryKey = pkData
            for itemObj in self.parentObj.listObjItem:
                newObjItem = itemObj()
                self.changeStatus = True
                for key,value in data.items():
                    if newObjItem.itemId == key:
                        if value is None:
                            value = ''   
                        newObjItem.valueItem = ""  
                        newObjItem.insertValue(value)
                        newObjItem.parentObj = self
                    elif newObjItem.itemId not in data.keys():
                        newObjItem.valueItem = ""
                        newObjItem.parentObj = self
                self.insertItems.append(newObjItem)
        except Exception as exp:
            Log.error(f'{nik} | GAGAL SET DATA INSERT IN RECORD | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return rMsgBox('Gagal Set Data Insert in Record')

    def setDataNonBase(self,pkData,data):
        self.primaryKey = pkData
        for itemObj in self.parentObj.listObjItem:
            newObjItem = itemObj()
            self.changeStatus = True
            for key,value in data.items():
                if newObjItem.itemId == key:
                    if value is None:
                        value = ''     
                    newObjItem.nonBaseValue(value)
                    newObjItem.parentObj = self
            self.nonBaseItems.append(newObjItem)
        
    def changeStatusUpdate(self):
        self.changeStatus = True
        self.parentObj.changeStatusUpdate()

    def rollBackData(self):
        self.changeStatus = False
        self.parentObj.rollBackData()

    def resetValue(self):
        if self.parentObj.parentObj.actionActive == "UPDATE":
            for item in self.items:
                if item.changeStatus is True:
                    item.resetValue()
    
    def resetRecords(self):
        self.records = {}
    
    def resetpkActive(self):
        self.pkActive = []

    def validatePkCallForm(self):
        dataCallForm = {}
        for item in self.items:
            if item.primaryKey is True:
                dataCallForm.update({item.itemId:str(item.valueItem)})
        return {"status":True,"data":dataCallForm,"msg":"DATA VALID"}


#CLASS ITEM==============================================================
class Item():
    parentObj = None
    itemId = ""
    databaseColumn = ""
    pythonId = ""
    JavascriptId = ""
    parentId = ""
    lengthItem = 0
    databaseItem = False #boolean basetableitem
    oldValueItem = ""
    nullable = False #boolean
    statusInsert = False #boolean
    primaryKey = False #boolean
    parentField = None
    baseAllowSpecialChar = []
    allowSpecialChar = []

    def __init__(self):
        self.changeStatus = False #boolean

    @property
    def value(self):
        if not hasattr(self,'valueItem'):
            self.valueItem = ""

        return self.valueItem

    @value.setter
    def value(self,value):
        if not hasattr(self,'valueItem'):
            self.valueItem = value
        else:
            if self.valueItem != value:
                self.oldValueItem = self.valueItem
                self.valueItem = value
                self.changeStatus = True

    def validateForeignKey(self,sql,bindParam,msg):
        if self.valueItem != '':
            dataCek = selectDataHeaderQueryRO(sql, bindParam)
            if not dataCek['data']:
                return rMsgBox(msg)
            else:
                return {"status": True, "msg": ""}
        else:
            return rMsgBox('Erorr item '+self.itemId)

    def item(self,itemId):
        return self.parentObj.parentObj.item(itemId)

    def getItem(self,itemId):
        return self.parentObj.parentObj.item(itemId)
    
    def append(self,value):
        """:Merupakan hasil select"""
        self.valueItem = value
        self.changeStatus = False

    def setDataAfterMain(self):
        self.changeStatus = False
    
    def updateChangeValue(self,valueNew):
        """:Merupakan update data client
           :Cek perubahan data lama dengan baru"""
        self.valueItem = valueNew
        self.changeStatus = True
        self.validate()
    
    def insertValue(self,value):
        self.value = value
        self.changeStatus = True

    def nonBaseValue(self,value):
        self.value = value
        self.changeStatus = True
    
    def changeStatusUpdate(self,data):
        nik = session['loggedId']['nik']
        try:
            self.value = data
            self.parentObj.changeStatusUpdate()
        except Exception as exp:
            Log.error(f'{nik} | GAGAL SET DATA UPDATE IN ITEM | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return rMsgBox('Gagal set data update in item')

    def resetValue(self):
        if self.parentObj.parentObj.parentObj.actionActive == "UPDATE":
            self.valueItem = self.oldValueItem
        self.rollBackData()

    def rollBackData(self):
        self.changeStatus = False
        self.parentObj.rollBackData()

    def checkSpecialChar(self):
        result = True
        if self.valueItem is not None:
            for char in str(self.valueItem):                
                if ord(char) not in self.baseAllowSpecialChar:
                    result = False 
        return result

    def validateBase(self):
        valResult = {'status':False,'msg':''}
        if(self.databaseItem is True and self.changeStatus is True):
            if(self.nullable is False and self.valueItem == ""):
                self.parentObj.parentObj.parentObj.resetValue()
                return {'status':False,'msg':'kolom '+self.itemId+' tidak boleh kosong'}
            if(self.lengthItem < len(str(self.valueItem))):
                self.parentObj.parentObj.parentObj.resetValue()
                return {'status':False,'msg':'kolom '+self.itemId+' tidak boleh lebih panjang dari '+str(self.lengthItem)}
            if self.checkSpecialChar() is False:
                self.parentObj.parentObj.parentObj.resetValue()
                return {'status':False,'msg':'Special Character Detected!<br>'+self.itemId}
            valResult = self.validate()
        return valResult

    def validateNonBase(self):
        valResult = {'status':False,'msg':''}
        if(self.changeStatus is True):
            if(self.nullable is False and self.valueItem == ""):
                return {'status':False,'msg':'kolom '+self.itemId+' tidak boleh kosong'}
            if(self.lengthItem < len(str(self.valueItem))):
                return {'status':False,'msg':'kolom '+self.itemId+' tidak boleh lebih panjang dari '+str(self.lengthItem)}
            if self.checkSpecialChar() is False:
                return {'status':False,'msg':'Special Character Detected!'}
            valResult = self.validate()
        return valResult

    def validate(self):
        return {'status':True,'msg':''}
    

#CLASS TEXT ITEM========================================================
class TextItem(Item):
    def __init__(self):
        super().__init__()
        self.baseAllowSpecialChar = []
        self.specialChar = allowAlfaNum
        self.baseAllowSpecialChar.extend(self.specialChar)
        self.baseAllowSpecialChar.extend(ord(a) for a in self.allowSpecialChar)
        self.baseAllowAllCharKeyboard = baseAllowAllCharKeyboard
        self.baseAllowSpecialChar.extend(self.baseAllowAllCharKeyboard)

    def validate(self):
        return {'status':True, 'msg':''}

class TextNormal(TextItem):
    def __init__(self):
        super().__init__()
        # self.baseAllowAllCharKeyboard = baseAllowAllCharKeyboard
        # self.baseAllowSpecialChar.extend(self.baseAllowAllCharKeyboard)
        
    def validate(self):
        return {'status':True, 'msg':''}

class TextUpper(TextItem):
    def __init__(self):
        super().__init__()
        self.baseAllowSpecialChar = []
        self.specialChar = allowALFA
        self.baseAllowSpecialChar.extend(self.specialChar)
        self.baseAllowSpecialChar.extend(ord(a) for a in self.allowSpecialChar)
        self.baseAllowAllCharKeyboard = baseAllowAllCharKeyboard
        self.baseAllowSpecialChar.extend(self.baseAllowAllCharKeyboard)

    def validate(self):
        return {'status':True, 'msg':''}

class TextLower(TextItem):
    def __init__(self):
        super().__init__()
        self.baseAllowSpecialChar = []
        self.specialChar = allowalfa
        self.baseAllowSpecialChar.extend(self.specialChar)
        self.baseAllowSpecialChar.extend(ord(a) for a in self.allowSpecialChar)
        self.baseAllowAllCharKeyboard = baseAllowAllCharKeyboard
        self.baseAllowSpecialChar.extend(self.baseAllowAllCharKeyboard)
        
    def validate(self):
        return {'status':True, 'msg':''}

class TextArea(TextItem):
    def __init__(self):
        super().__init__()
        self.baseAllowSpecialChar.extend([92,10])
        self.baseAllowAllCharKeyboard = baseAllowAllCharKeyboard
        self.baseAllowSpecialChar.extend(self.baseAllowAllCharKeyboard)
        
    def validate(self):
        return {'status':True, 'msg':''}

class TextPrimary(TextItem):
    def __init__(self):
        super().__init__()
        self.baseAllowAllCharKeyboard = baseAllowAllCharKeyboard
        self.baseAllowSpecialChar.extend(self.baseAllowAllCharKeyboard)

    def validate(self):
        return {'status':True, 'msg':''}

#CLASS NUMERIC============================================================
class NumericNormal(Item):
    def __init__(self):
        super().__init__()
        self.baseAllowSpecialChar = [45]
        self.specialChar = allowNUM
        self.baseAllowSpecialChar.extend(self.specialChar)
        self.baseAllowSpecialChar.extend(ord(a) for a in self.allowSpecialChar)
    
    @property
    def value(self):
        return self.valueItem
    
    @value.setter
    def value(self,value):
        if value != '' and value != None:
            if isinstance(value, (int)) or isinstance(value,(float)):
                value = value
            else:
                try:
                    try:
                        value = int(value)
                    except ValueError:
                        value = float(value)  
                except:
                    Log.error('FORMAT NUMERIC NORMAL / FLOAT SALAH'+ value)

        if not hasattr(self,'valueItem'):
            self.valueItem = value
        else:
            if self.valueItem != value:
                self.oldValueItem = self.valueItem
                self.valueItem = value
                self.changeStatus = True

    def validate(self):
        return {'status':True, 'msg':''}

class Currency(Item):
    def __init__(self):
        super().__init__()
        self.baseAllowSpecialChar = []
        self.specialChar = allowNUM
        self.baseAllowSpecialChar.extend(self.specialChar)
        self.baseAllowSpecialChar.extend(ord(a) for a in self.allowSpecialChar)

    def validate(self):
        return {'status':True, 'msg':''}

#CLASS LOV================================================================
class Lov(TextItem):
    def __init__(self):
        super().__init__()
        self.baseAllowAllCharKeyboard = baseAllowAllCharKeyboard
        self.baseAllowSpecialChar.extend(self.baseAllowAllCharKeyboard)
        
    def validate(self):
        return {'status':True, 'msg':''}


#CLASS COMBOLIST==========================================================
class ComboList(TextItem):
    def __init__(self):
        super().__init__()
        self.baseAllowAllCharKeyboard = baseAllowAllCharKeyboard
        self.baseAllowSpecialChar.extend(self.baseAllowAllCharKeyboard)

    def validate(self):
        return {'status':True, 'msg':''}



#CLASS RADIO BUTTON========================================================
class Radio(TextItem):
    def __init__(self):
        super().__init__()
        self.baseAllowAllCharKeyboard = baseAllowAllCharKeyboard
        self.baseAllowSpecialChar.extend(self.baseAllowAllCharKeyboard)

    def validate(self):
        return {'status':True, 'msg':''}


#CLASS CHECKBOX============================================================
class CheckBox(Item):
    def __init__(self):
        super().__init__()
        self.baseAllowSpecialChar = []
        self.specialChar = [48,49,78,89,70,84]
        self.baseAllowSpecialChar.extend(self.specialChar)
        self.baseAllowSpecialChar.extend(ord(a) for a in self.allowSpecialChar)

    def validate(self):
        return {'status':True, 'msg':''}

#CLASS CALENDER===========================================================
class Calendar(Item):
    @property
    def value(self):
        return self.valueItem

    @value.setter
    def value(self,value):
        if value != '' and value != None:
            if isinstance(value, (datetime,date)):
                value = value
            else:
                try:
                    tempVal = value.split(" ")
                    value = tempVal[0]
                    value = datetime.strptime(value, "%Y-%m-%d").date()
                except:
                    Log.error('FORMAT DATE SALAH'+ value)
            
        if not hasattr(self,'valueItem'):
            self.valueItem = value
        else:
            if self.valueItem != value:
                self.oldValueItem = self.valueItem
                self.valueItem = value
                self.changeStatus = True

    def __init__(self):
        super().__init__()
        self.baseAllowSpecialChar = []
        self.specialChar = allowNUM.copy()
        self.specialChar.append(45)
        self.baseAllowSpecialChar.extend(self.specialChar)
        self.baseAllowSpecialChar.extend(ord(a) for a in self.allowSpecialChar)

    def validate(self):
        return {'status':True, 'msg':''}

class CalendarDDMMYYYY(Calendar):
    def __init__(self):
        super().__init__()

    def validate(self):
        return {'status':True, 'msg':''}

class CalendarMMYYYY(Calendar):
    def __init__(self):
        super().__init__()

    def validate(self):
        return {'status':True, 'msg':''}

class CalendarYYYY(Calendar):
    def __init__(self):
        super().__init__()

    def validate(self):
        return {'status':True, 'msg':''}

#CLASS TIME================================================================
class Time(Item):
    @property
    def value(self):
        return self.valueItem

    @value.setter
    def value(self,value):
        if value != '' and value != None:
            if isinstance(value, datetime):
                value = value
            else:
                try:
                    value = datetime.strptime(value, "%Y-%m-%d %H:%M:%S")
                except:
                    Log.error('FORMAT DATE SALAH'+ value)
            
        if not hasattr(self,'valueItem'):
            self.valueItem = value
        else:
            if self.valueItem != value:
                self.oldValueItem = self.valueItem
                self.valueItem = value
                self.changeStatus = True

    def __init__(self):
        super().__init__()
        self.baseAllowSpecialChar = []
        self.specialChar = allowNUM.copy()
        self.specialChar.extend([45,58,32])
        self.baseAllowSpecialChar.extend(self.specialChar)
        self.baseAllowSpecialChar.extend(ord(a) for a in self.allowSpecialChar)

    def validate(self):
        return {'status':True, 'msg':''}


#CLASS BUTTON===============================================================
class Button(Item):
    def validate(self):
        return {'status':True, 'msg':''}
