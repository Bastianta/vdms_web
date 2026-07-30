"""
Update : 2025-10-08
Common Base(Tree) Oden V3
Update :    - Delete tampungan record insert block after commit
            - Add base Allow All Keyboard to each Obj Item
            - Numeric bisa minus
            - Multilanguage bahasa corenya
"""
from flask import session

import traceback  

class Container():
    
    def debugEks(self):
        print("\nOBJ FORM",self.getForm())
        self.getForm().debugEks()

    def update(self,vForm):
        if vForm is None:
            return
        session['vForm'] = vForm
        
    def getForm(self):
        nik = session['loggedId']['nik']
        odenRedis = DatabaseRedis()
        redisKey = "session:"+str(request.cookies.get("CLIENT"))
        try:
            return session['vForm']
        except Exception as exp:
            print(f"{nik} | getForm | {traceback.format_exc()}")
            Log.error(f"{nik} | getForm | {str(traceback.format_exc())}")
            if odenRedis.exists(redisKey)[1] == 1:
                Log.error(f"{nik} | FAILED GET VFORM IN CONTAINER | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp} {redisKey}")
                return {"status":False,"erroden":"535510N","msg":f'object session container tidak ditemukan<br>Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}'}  
            else:
                Log.error(f"{nik} | FAILED GET VFORM IN CONTAINER | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp} redis session not found")
                return rMsgBox(f"object session container not found <br>Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp} redis session not found")
    
    def getBlocks(self):
        nik = session['loggedId']['nik']
        try:
            blockObj =  self.getForm().dataBlocks
            return blockObj
        except Exception as exp:
            print(f"{nik} | getBlocks | {traceback.format_exc()}")
            Log.error(f"{nik} | getBlocks | {traceback.format_exc()}")
            return rMsgBox('Error GetBlocks')
    
    def getBlock(self,blockId):
        nik = session['loggedId']['nik']
        try:
            for block in self.getBlocks():
                if block.blockId == blockId:
                    return block
            print(f"{nik} | Block id  | Block id {blockId} not found")
            Log.error(f"{nik} | getBlock | Block id {blockId} not found")
            return rMsgBox(f"Block id {blockId} not found")
        except Exception as exp:
            print(f"{nik} | getBlock | {traceback.format_exc()}")
            Log.error(f"{nik} | getBlock | {traceback.format_exc()}")
            return rMsgBox('Error GetBlocks')
    
    def block(self,blockId):
        return self.getBlock(blockId) 
      
    def selectDataStatement(self,data,blockName):
        beginTimeSelectDatastatement = datetime.now()
        nik = session['loggedId']['nik']
        try:
            returnSelect = self.getBlock(blockName).selectStatmentBlock(data,self.getForm())
            print(f"[Total SelectDataStatement] - {blockName} - {datetime.now()-beginTimeSelectDatastatement}")
            Log.info(f"[Total SelectDataStatement] - {blockName} - {datetime.now()-beginTimeSelectDatastatement}")
            return returnSelect
        except Exception as exp:
            print(f"{nik} | selectDataStatement (Container) | {traceback.format_exc()}")
            Log.error(f"{nik} | selectDataStatement (Container) | {str(traceback.format_exc())}")
            Log.error(f"{nik} | FAILED SELECT DATA IN CONTAINER | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}")
            return {"status":False,"erroden":"535510N","msg":f'Failed Select Data in Container<br>Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}'}

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
                    print(88,ajaxData)
                    statusValidateGridToGrid = validateTransactionDataGridToGrid(listBlock, ajaxData)
                    if statusValidateGridToGrid.get('status') == False:
                        return statusValidateGridToGrid
                    
                self.getForm().setDataInsert(ajaxData)
                Log.info(f"{nik} | SUCCESS SET DATA INSERT |")
                val = self.getForm().validate("INSERT")
                if val['status'] and self.getForm().changeStatus is True:
                    returnInsert = self.getForm().insertStatement()
                    print(f"[Total InsertDataStatement] - {str(returnInsert)} - {datetime.now()-beginTimeInsertDatastatement}")
                    Log.info(f"[Total InsertDataStatement] - {str(returnInsert)} - {datetime.now()-beginTimeInsertDatastatement}")
                    return returnInsert
                else:
                    return val
            else:
                print(f"{nik} | Dont Have Insert Data Access | {str(session['loggedId']['access_menu'])}")
                
                Log.error(f"{nik} | Dont Have Insert Data Access | {str(session['loggedId']['access_menu'])}")
                return rMsgBox('Sorry, You Dont Have Access To Input Data!!')
        except Exception as exp:
            print(f"{nik} | insertDataStatement (Container) | {traceback.format_exc()}")
            Log.error(f"{nik} | insertDataStatement (Container) | {str(traceback.format_exc())}")
            Log.error(f"{nik} | FAILED INSERT DATA IN CONTAINER | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}")
            return {"status":False,"erroden":"535510N","msg":f'Failed Insert Data in Containerr<br>Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}'}

    def updateDataStatement(self,ajaxData):
        beginTimeUpdateDatastatement = datetime.now()
        nik = session['loggedId']['nik']
        try:
            listBlock = []
            for block in self.getBlocks():
                listBlock.append(block)
            isGridToGrid = checkIsGridToGrid(listBlock)
            
            print(" ========= updateDataStatement =======",isGridToGrid)
            if session['loggedId']['access_menu']['status_access'].get('update') == 'Y':
                if isGridToGrid:
                    print(125,ajaxData)
                    statusValidateGridToGrid = validateTransactionDataGridToGrid(listBlock, ajaxData)
                    if statusValidateGridToGrid.get('status') == False:
                        return statusValidateGridToGrid
                    
                self.getForm().setDataUpdate(ajaxData)
                Log.info(f"{nik} | SUCCESS SET DATA UPDATE |")
                val = self.getForm().validate("UPDATE")
                print(134,val,self.getForm().changeStatus)
                if val['status'] and self.getForm().changeStatus is True:
                    print(135)
                    returnUpdate = self.getForm().updateStatement()
                    print(f"[Total UpdateDataStatement] - {str(returnUpdate)} - {datetime.now()-beginTimeUpdateDatastatement}")
                    Log.info(f"[Total UpdateDataStatement] - {str(returnUpdate)} - {datetime.now()-beginTimeUpdateDatastatement}")
                    return returnUpdate
                else:
                    return val
            else:
                print(f"{nik} | Dont Have Acess To Update Data | {str(session['loggedId']['access_menu'])}")
                Log.error(f"{nik} | Dont Have Acess To Update Data | {str(session['loggedId']['access_menu'])}")
                return rMsgBox('Sorry, your dont have access to Update Data!!')
        except Exception as exp:
            Log.error(f'{nik} | FAILED UPDATE DATA IN CONTAINER | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return {"status":False,"erroden":"535510N","msg":f'Failed Update Data in Container<br>Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}'}

    def deleteDataStatement(self,ajaxData):
        nik = session['loggedId']['nik']
        try:
            if session['loggedId']['access_menu']['status_access'].get('delete') == 'Y':
                return self.getForm().deleteStatement(ajaxData,"DELETE")
            else:
                print(f"{nik} | Dont Have Acess To Delete Data | {str(session['loggedId']['access_menu'])}")
                Log.error(f"{nik} | Dont Have Acess To Delete Data | {str(session['loggedId']['access_menu'])}")
                return rMsgBox('Sorry, your dont have access to Delete Data!!')
        except Exception as exp:
            Log.error(f'{nik} | FAILED DELETE DATA IN CONTAINER | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return {"status":False,"erroden":"535510N","msg":f'Failed Delete Data in Container<br>Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}'}

    def validateNonBase(self,ajaxData):
        nik = session['loggedId']['nik']
        try:
            Log.info(f"166,{session['loggedId']['access_menu']}")
            if session['loggedId']['access_menu']['success'] == True:
                Log.error(f"{ajaxData}")
                self.getForm().setDataNonBase(ajaxData)
                val = self.getForm().validate("NON-BASE")
                if val["status"]:
                    for key in ajaxData.keys():
                        self.getForm().block(key).rollBackData()
                return val
            else:
                print(f"{nik} | Dont Have Acess To Non-Base Transaction| {str(session['loggedId']['access_menu'])}")
                Log.error(f"{nik} | Dont Have Acess To Non-Base Transaction| {str(session['loggedId']['access_menu'])}")
                return rMsgBox('Sorry, your dont have access to Non-Base Transaction!!')
        except Exception as exp:
            print(f"{nik} | validateNonBase (Container) | {traceback.format_exc()}")
            Log.error(f"{nik} | validateNonBase (Container) | {str(traceback.format_exc())}")
            return rMsgBox('Failed Validate Non Base!!')
            

#CLASS FORM==============================================================
class Form():
    changeStatus = False #boolean

    def __init__(self):
        self.dataBlocks = []
        self.actionActive = ""
        self.connActive = ""
        self.callFormLevel = 0

    def __getstate__(self):
        attr = dict(self.__dict__)
        print(attr)
        attr.pop('connActive',None) 
        return attr
        pass

    def debugEks(self):
        print("\nOBJ BLOCK",self.dataBlocks)
        for block in self.dataBlocks:
            print("BLOCK ID",block.blockId)
        for block in self.dataBlocks:
            block.debugEks()

    def getBlock(self,blockId):
        for block in self.dataBlocks:
            if block.blockId == blockId:
                print(212,block.pkActive)
                return block
        raise Exception('Block id is not found')
    
    def block(self,blockId):
        
        return self.getBlock(blockId)
        
    def insertStatement(self):
        nik = session['loggedId']['nik']
        try:
            finalResult = {}
            self.connActive = Database(globalVar.DB_NAME)
            for block in self.dataBlocks:
                try:
                    if block.changeStatus is True and len(block.recordsInsert)!=0:
                        mainResult = block.insertStatement()
                    else:
                        continue
                    if mainResult['status'] is False:
                        del(self.connActive)
                        return mainResult
                except Exception as exp:
                    del(self.connActive)
                    print(f"{nik} | block.insertStatement (Form) | {block.blockId} | {traceback.format_exc()}")
                    Log.error(f"{nik} | block.insertStatement (Form) | {block.blockId} | {str(traceback.format_exc())}")
                    return rMsgBox('Failed to Insert Data in Form')
            if mainResult['status'] is True:
                finalResult =  self.connActive.forCommit()
                self.setDataAfterMain()
            for block in self.dataBlocks:
                block.recordsInsert.clear()
            del(self.connActive)
            return {'status':finalResult['status'],'msg':finalResult['msg'],'data':mainResult['data']}
        except Exception as exp:
            print(f"insertStatement INSERT (Form) - {traceback.format_exc()}")
            Log.error(f"{nik} | insertStatement INSERT (Form) | {traceback.format_exc()}")
            Log.error(f"{nik} | FAILED INSERT DATA IN FORM | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}")
            return rMsgBox('Failed to Insert Data in Form')

    def updateStatement(self):
        print("updateStatement FORM")
        nik = session['loggedId']['nik']
        try:
            finalResult={}
            self.connActive = Database(globalVar.DB_NAME)
            for block in self.dataBlocks:
                try:
                    if block.changeStatus is True and len(block.records)!=0:
                        mainResult = block.updateStatement()
                    else:
                        continue
                    if mainResult['status'] is False:
                        del(self.connActive)
                        return mainResult
                except Exception as exp:
                    del(self.connActive)
                    print(f"{nik} | block.updateStatement (Form) | {block.blockId} | {traceback.format_exc()}")
                    Log.error(f"{nik} | block.updateStatement (Form) | {block.blockId} | {str(traceback.format_exc())}")
                    return rMsgBox('Failed To Update Data in Form')
            if mainResult['status'] is True:
                finalResult =  self.connActive.forCommit()
                self.setDataAfterMain()
                Log.info(f"{nik} | SUCCESS UPDATE DATA|")
            del(self.connActive)
            return {'status':finalResult['status'],'msg':finalResult['msg'],'data':mainResult['data']}  
        except Exception as exp:
            print(f"{nik} | updateStatement (Form) | {traceback.format_exc()}")
            Log.error(f"{nik} | updateStatement (Form) | {str(traceback.format_exc())}")
            Log.error(f"{nik} | FAILED UPDATE DATA IN FORM | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}")
            return rMsgBox('Failed to Update Data in Form')
            

    def deleteStatement(self,data,actionType):
        nik = session['loggedId']['nik']
        try: 
            self.actionActive = actionType
            for blockName in data.keys():
                try:
                    if data[blockName]['data']!=[]:
                        deleteResult =  self.block(blockName).deleteStatementBlock(data[blockName]['data'])
                        return deleteResult
                except Exception as exp:
                    print(f"{nik} | deleteStatement (Form) | {blockName} | {traceback.format_exc()}")
                    Log.error(f"{nik} | deleteStatement (Form) | {blockName} | {str(traceback.format_exc())}")
                    return rMsgBox('Failed to Delete Data in Form')
        except Exception as exp:
            Log.error(f"{nik} | FAILED DELETE DATA IN FORM | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}")
            return rMsgBox('Failed to Delete Data in Form')

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
                        print(326,block.pkActive)
                        returnVal = block.validateBase(validateType)
                        print(327,block.pkActive)
                        
                    
                    else:
                        Log.info(f"{block.blockId} - {str(block.changeStatus)} - {str(len(block.records))}")
                except Exception as exp:
                    print(f"{nik} | validate UPDATE (Form) - {block.blockId} | {str(traceback.format_exc())}")
                    Log.error(f"{nik} | validate UPDATE (Form) - {block.blockId} | {str(traceback.format_exc())}")
            elif validateType=="NON-BASE":
                if block.changeStatus is True and block.recordsNonBase!=[]:
                    returnVal =  block.validateBase(validateType)
                    return returnVal
                else:
                    Log.warning(f"{block} - {str(block.changeStatus)} - {str(len(block.recordsNonBase))}")
            print(350,returnVal)
            if returnVal['status']:
                if idx+1 == len(self.dataBlocks):
                    return returnVal
            else:
                return returnVal
        return {'status':False,'msg':'Primary Key cannot be changed!'}
    
    def setDataInsert(self,data):
        nik = session['loggedId']['nik']
        try: 
            for blockName in data.keys():
                self.block(blockName).setDataInsert(data[blockName],self)
                if self.block(blockName).changeStatus is True:
                    self.changeStatus = True
            print("setDataInsert Form Done")
            Log.info(f"setDataInsert Form Done")
        except Exception as exp:
            print(f"{nik} | setDataInsert (Form) | {traceback.format_exc()}")
            Log.error(f"{nik} | setDataInsert (Form) | {traceback.format_exc()}")
            Log.error(f"{nik} | FAILED SET DATA INSERT IN FORM | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}")
            return rMsgBox('Failed to Set Data Insert in Form')

    def setDataUpdate(self,data):
        print("setDataUpdate FORM")
        nik =  session['loggedId']['nik']
        try:
            for blockName in data.keys():
                print(377,self.block(blockName),self.block(blockName).records)
                self.block(blockName).setDataUpdate(data[blockName])
            print("setDataUpdate Form Done")
            Log.info(f"setDataUpdate Form Done")
        except Exception as exp:
            print(f"{nik} | setDataUpdate (Form) | {str(traceback.format_exc())}")
            Log.error(f"{nik} | setDataUpdate (Form) | {str(traceback.format_exc())}")
            Log.error(f"{nik} | FAILED SET DATA UPDATE IN FORM | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}")
            return rMsgBox('Failed to set data update in form')
    
    def setDataNonBase(self,data):
        Log.error(f"| setDataNonBase |")
        Log.error(f"| setDataNonBase | {type(data),data}")
        print("\n\n\n","==========",371,type(data),data)
        for blockName in data.keys():
            print(373,blockName)
            self.block(blockName).setDataNonBase(self,data[blockName])
            if self.block(blockName).changeStatus is True:
                self.changeStatus = True
        
    def changeStatusUpdate(self):
        self.changeStatus = True

    def resetValue(self):
        print(274, "resetValue Form")
        for block in self.dataBlocks:
            if self.actionActive == "UPDATE":
                print(277, f"{block.blockId} - {block.changeStatus} - {len(block.records)}")
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
        print(398, blockName)
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
        self.orderBy = ""
        self.limit = ""
        self.nonVisibleItems = []
        self.noDbItems = []
        self.relationBlock = None
        self.recordsNonBase = []
        self.dataNonBase = []

    def debugEks(self):
        print("\nOBJ RECORDS",self.records)
        for record in self.records:
            record.debugEks()

    def item(self,itemId):
        print(457, itemId)
        if self.parentObj.actionActive == "UPDATE":
            return self.itemUpdate(itemId)
        elif self.parentObj.actionActive == "INSERT":
            return self.itemInsert(itemId)
        elif self.parentObj.actionActive == "DELETE":
            return self.itemDelete(itemId)
        elif self.parentObj.actionActive == "NON-BASE":
            print("masuk item non base")
            return self.itemNonBase(itemId)


    def itemUpdate(self,itemId):
        print(460,self.blockType)
        if self.blockType == "form":
            for record in self.records:
                for item in record.items:
                    if item.itemId == itemId:
                        print(464,item)
                        return item
        elif self.blockType == "datagrid":
            print(459,set(self.pkActive))
            for record in self.records:
                print(460,set(record.primaryKey),set(self.pkActive))
                if set(record.primaryKey) == set(self.pkActive):
                    print(462,record.primaryKey)
                    for item in record.items:
                        if item.itemId == itemId:
                            return item
    
    def itemInsert(self,itemId):
        print("ITEM INSERT",itemId)
        if self.blockType == "form" and self.recordsInsert ==[]:
            print("if")
            for record in self.records:
                for item in record.items:
                    if item.itemId == itemId:
                        print(item)
                        return item
        elif self.blockType == "datagrid" and self.recordsInsert ==[]:
            print("elif")
            for record in self.records:
                if set(record.primaryKey) == set(self.pkActive):
                    for item in record.items:
                        if item.itemId == itemId:
                            print(item)
                            return item
        else:
            print("else")
            for record in self.recordsInsert:
                if set(record.primaryKey) == set(self.pkActive):
                    for item in record.insertItems:
                        if item.itemId == itemId:
                            print(item)
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
        
        print("| 521 | PRE SELECT DEFAULT",self)
        return {'status':True,'data':data,'msg':''}
    
    def postSelect(self,data):
        return {'status':data['status'],'data':data['data']}

    def preQuery(self,data):
        return self.preSelect(data)
    
    def postQuery(self,data):
        return self.postSelect(data)
    
    def preInsert(self):
        print("542 --- PRE INSERT DEFAULT")
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
            # print(388)
            self.records = []
            for record in dataSelect['data']:
                vRecord = self.ObjRecord(record,self)
                self.append(vRecord)
            Log.info(f"{nik} | SUCCESS SELECT DATA |")
            return dataSelect
        except Exception as exp:
            Log.error(f"{nik} | FAILED SELECT DATA IN BLOCK | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}")
            return rMsgBox('Failed to Select Data in Block')

    def selectStatmentBlock(self,data,parentObj):
        nik = session['loggedId']['nik']
        try:
            beginSelectStatementBlock = datetime.now()

            dataSelect = self.mainSelectStatement(data)
            
            print(f"[SelectStatementBlock - {self.blockId}] - {datetime.now()-beginSelectStatementBlock}")
            Log.info(f"[SelectStatementBlock - {self.blockId}] - {datetime.now()-beginSelectStatementBlock}")
            
            self.parentObj = parentObj
            if dataSelect["status"]:
                
                
                
                for record in dataSelect['data']:
                    vRecord = self.ObjRecord(record,self)
                    self.append(vRecord)
                print(f"{nik} | SUCCESS SELECT DATA {self.blockId} | {len(self.records)} records")
                Log.info(f"{nik} | SUCCESS SELECT DATA {self.blockId} | {len(self.records)} records")
                
                
                # debugPotentialRC(self)
                
                return dataSelect
            else:
                Log.info(f"473 - {nik} | ERROR SELECT DATA {self.blockId} | {str(self.records)}")
                return dataSelect
        except Exception as exp:
            print(f"selectStatmentBlock - {traceback.format_exc()}")
            Log.error(f"{nik} | {traceback.format_exc()}")
            Log.error(f"{nik} | FAILED SELECT DATA IN BLOCK | selectStatmentBlock | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}")
            return rMsgBox('Failed to Select Data in Block')

    def mainSelectStatement(self,param):
        nik = session['loggedId']['nik']
        try:
            if param['data']['offsetNumber'] == 0 or param['blockType']== 'form':
                self.records = []             #=> karena tiap dia load next data tidak bisa update karena records nya jadi kosong
            
            beginPreSelect = datetime.now()
            try:
                Log.info(f"BEFORE PRESELECT || {self.databaseTable} {self.whereclause} ||")
                preSelect = self.preSelect(param)
            except Exception as exp:
                print(traceback.format_exc())
                Log.error(f"{nik} | preSelect | {str(traceback.format_exc())}")
                return rMsgBox('Failed to Select Data in Main Block')
            Log.info(f"AFTER PRESELECT || {self.databaseTable} {self.whereclause} ||")
            print(f"[PreSelect - {self.blockId}] - {datetime.now()-beginPreSelect}")
            Log.info(f"[PreSelect - {self.blockId}] - {datetime.now()-beginPreSelect}")
            
            if preSelect['status']:
                beginMainSelect = datetime.now()    
                selectStatement = getSelectStatement(self,preSelect['data'])
                print(593,selectStatement,preSelect['data'])
                if isinstance(selectStatement,dict):
                    if "status" in selectStatement:
                        if selectStatement['status'] is False:
                            return rMsgBox('Failed Select Data in Main Block')
                print(597,selectStatement[0]%selectStatement[1])
                mainSelect = selectDataHeaderQueryRO(selectStatement[0],selectStatement[1])
                
                print(f"[MainSelect - {self.blockId}] - {datetime.now()-beginMainSelect}")
                Log.info(f"[MainSelect - {self.blockId}] - {datetime.now()-beginMainSelect}")
            else:
                return{'status':preSelect['status'],'msg':preSelect['msg']}  
            
            if mainSelect['status']:
                beginPostSelect = datetime.now()
                try:
                    returnpostSelect = self.postSelect(mainSelect)
                except Exception as exp: 
                    print(traceback.format_exc())
                    Log.error(f"{nik} | postSelect | {str(traceback.format_exc())}")
                    return rMsgBox('Failed to Select Data in Main Block')

                print(f"[PostSelect - {self.blockId} - {datetime.now()-beginPostSelect}")
                Log.info(f"[PostSelect - {self.blockId} - {datetime.now()-beginPostSelect}")
                return returnpostSelect
            else:
                print(f"MAIN_SELECT - {str(mainSelect)}")
                Log.info(f"MAIN_SELECT - {str(mainSelect)}")
                return{'status':mainSelect['status'],'msg':f"{datetime.now().strftime('%d-%m-%Y | %H:%M:%S')} | {mainSelect['errorcode']}<br>{convertErrorMessage(mainSelect, libDict)}"}
        except Exception as exp:
            print(traceback.format_exc())
            Log.error(f"{nik} | {str(traceback.format_exc())}")
            Log.error(f"{nik} | FAILED SELECT DATA IN MAIN BLOCK | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}")
            return rMsgBox('Failed to Select Data in Main Block')

    def updateStatement(self):
        print("updateStatement DATABLOCK")
        nik = session['loggedId']['nik']
        try:
            beginTimeUpdateDatastatement = datetime.now()
            updateResult = {}
            recordUpdate = []
            for record in self.records:
                print("updateStatement",record)
                if record.changeStatus is True:
                    recordUpdate.append(record)
                    updateResult = record.updateStatement()
                    if updateResult['status'] is False:
                        print(f"[Update Block] - {str(updateResult)} - {self.blockId} - {datetime.now()-beginTimeUpdateDatastatement}")
                        Log.info(f"[Update Block] - {str(updateResult)} - {self.blockId} - {datetime.now()-beginTimeUpdateDatastatement}")
                        # return updateResult
                        break
                else:
                    continue
            
            # if updateResult['status']:
            #     self.setDataAfterMain()
            #     for record in recordUpdate:
            #         for item in record.items:
            #             if(item.changeStatus is True):
            #                 item.setDataAfterMain()
            # else:
            #     for record in recordUpdate:
            #         record.resetValue()
            print(f"[Update Block] - {str(updateResult)} - {self.blockId} - {datetime.now()-beginTimeUpdateDatastatement}")
            Log.info(f"[Update Block] - {str(updateResult)} - {self.blockId} - {datetime.now()-beginTimeUpdateDatastatement}")
            return updateResult
        except Exception as exp:
            Log.error(f"{nik} | FAILED UPDATE DATA IN BLOCK | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}")
            return rMsgBox('Failed to update data in block')

    def insertStatement(self):
        beginTimeInsertDatastatement = datetime.now()
        nik = session['loggedId']['nik']
        try:
            insertResult = {}
            for record in self.recordsInsert:
                if record.changeStatus is True:
                    insertResult = record.insertStatement()
                    if insertResult['status'] is False:
                        print(f"[Insert Block] - {str(insertResult)} - {self.blockId} - {datetime.now()-beginTimeInsertDatastatement}")
                        Log.info(f"[Insert Block] - {str(insertResult)} - {self.blockId} - {datetime.now()-beginTimeInsertDatastatement}")
                        return insertResult
                else:
                    continue
            # if insertResult['status']:
            #     self.setDataAfterMain()
            print(f"[Insert Block] - {str(insertResult)} - {self.blockId} - {datetime.now()-beginTimeInsertDatastatement}")
            Log.info(f"[Insert Block] - {str(insertResult)} - {self.blockId} - {datetime.now()-beginTimeInsertDatastatement}")
            return insertResult
        except Exception as exp:
            print(f"insertStatement (Block) - {self.blockId} - {traceback.format_exc()}")
            Log.error(f"{nik} | insertStatement (Block) - {self.blockId} - | {traceback.format_exc()}")
            Log.error(f"{nik} | FAILED INSERT DATA IN BLOCK | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}")
            return rMsgBox('Failed to Insert Data in Block')

        
    def deleteStatementBlock(self,data):
        nik = session['loggedId']['nik']
        try:
            deleteStatement = getDeleteStatement(self,data)
            print(738)
            return self.mainDeleteStatement(deleteStatement[0],deleteStatement[1])
        except Exception as exp:
            Log.error(f"{nik} | FAILED DELETE DATA IN BLOCK | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}")
            return rMsgBox('Failed to Delete Data in Block')

    def mainDeleteStatement(self, query, param):
        nik = session['loggedId']['nik']
        try:
            print(746," ============ mainDeleteStatement ============")
            self.pkActive = self.getPkJs(param, self.primaryKeyId)
            self.setPkParentRelation(param)
            preDelete = self.preDelete(param)
            recordDelete = None
            conn = Database(globalVar.DB_NAME)
            if preDelete['status']:
                if self.databaseTableHistory:
                    sql = f"""select * from {self.databaseTable} where """
                    for pkObj in self.listObjItem:
                        if pkObj.primaryKey is True:
                            sql += f"{pkObj.databaseColumn} = '{param[pkObj.itemId]}' and "
                    sql = sql.rstrip(" and ")
                    recordDelete = globalVar.CONN_RO.selectHeader(sql)["data"]
                mainDelete = conn.executeDataNoCommit(query, preDelete['data'])
                print(760,"============ TRACING ERROR CORE ============",query,mainDelete)
                
            else:
                return {'status': preDelete['status'], 'msg': preDelete['msg']}
            if mainDelete['status']:
                if self.blockType == "datagrid":
                    for record in self.records:
                        if set(record.primaryKey) == set(self.pkActive):
                            del record
                if recordDelete:
                    prefixDb = None
                    columns = []
                    values = []
                    for column in recordDelete[0]:
                        columns.append(column)
                    for value in recordDelete[1][0]:
                        values.append(value)
                    prefixDb = columns[0].split("_")[0]
                    columns.extend([prefixDb + "_user_proses", prefixDb + "_flag_proses"])
                    values.extend([session["loggedId"]["nik"], 'D'])
                    param = dict(zip(columns, values))
                    bindParam = [f'%({column})s' for column in columns]
                    bindParam = ','.join(bindParam)
                    columns = ",".join(columns)
                    sql = f"""INSERT INTO {self.databaseTableHistory} ({columns}) VALUES ({bindParam})"""
                    insertToHistory = conn.executeDataNoCommit(sql, param)
                    if (insertToHistory['status']):
                        Log.info(f"{nik} | SUCCESS HISTORY DATA |")
                    else:
                        del (conn)
                        Log.error(f"{nik} | FAILED TO INSERT HISTORY DATA IN MAIN BLOCK")
                        return rMsgBox('Failed To Insert History Data in Main Block')
                conn.forCommit()
                Log.info(f"{nik} | SUCCESS DELETE DATA |")
                del (conn)
                return self.postDelete(mainDelete)
            else:
                del (conn)
                print(f"MAIN_DELETE - {str(mainDelete)}")
                Log.info(f"MAIN_DELETE - {str(mainDelete)}")
                return {'status': mainDelete['status'],
                        'msg': f"{datetime.now().strftime('%d-%m-%Y | %H:%M:%S')} | {mainDelete['errorcode']}<br>{convertErrorMessage(mainDelete, libDict)}"}
        except Exception as exp:
            Log.error(
                f'{nik} | FAILED DELETE DATA IN MAIN BLOCK | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return rMsgBox('Failed to Delete Data in Main Block')

    def setListObj(self,listObj):
        self.listObjItem = listObj
        print("\n\n\n\n========== setListObj ==========",760,self.listObjItem,"\n\n\n")
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
        # print(668, f"{self.blockId} - {str(record)}")
        self.records.append(record)
    
    def setDataAfterMain(self):
        self.changeStatus = False               #setelah forCommit -> changeStatus = False
        for record in self.records:
            record.setDataAfterMain()
        # self.parentObj.setDataAfterMain()
    
    def setPkParentRelation(self,data):
        # GRID TO GRID
        # 2 LEVEL GRID (G G G)
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
                    

                
                blockRelationLvlOne.pkActive = fkLevelOne
                
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
                        
    def setDataUpdate(self,data):
        print("setDataUpdate DATABLOCK")
        nik = session['loggedId']['nik']
        try:
            if len(data['data']) != 0:
                for data in data['data']:
                    try:
                        pkData = self.getPkJs(data, self.primaryKeyId)
                        self.setPkParentRelation(data)
                        print(901,self.records)
                        for record in self.records:
                            print(888,record.primaryKey,pkData,set(record.primaryKey),set(pkData))
                            if record.primaryKey == pkData and set(record.primaryKey) == set(pkData):
                                record.setDataUpdate(data)
                                print(f"setDataInsert (Block) - {str(data)} - {traceback.format_exc()}") 
                                Log.info(f"{nik} | setDataInsert (Block) | {str(data)} |{traceback.format_exc()}")
                    except Exception as exp:
                        print(f"setDataUpdate (Block) - {traceback.format_exc()}")
                        Log.error(f"{nik} | setDataUpdate (Block) | {traceback.format_exc()}")
        except Exception as exp:
            print(f"setDataUpdate (Block) - {traceback.format_exc()}")
            Log.error(f"{nik} | setDataUpdate (Block) | {traceback.format_exc()}")
            Log.error(f"{nik} | FAILED SET DATA UPDATE IN BLOCK | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}")
            return rMsgBox('Failed to set data update in block')

    
    def setDataInsert(self,data,parentObj):
        nik = session['loggedId']['nik']
        try:
            self.parentObj = parentObj
            self.recordsInsert = []
            if len(data['data']) != 0:
                for data in data['data']:
                    try:
                        print(848,data,self.primaryKeyId)
                        pkData = self.getPkJs(data, self.primaryKeyId)
                        newRecord = self.ObjRecord(data,self)
                        newRecord.setDataInsert(pkData,data)
                        self.recordsInsert.append(newRecord)
                        self.changeStatus = True
                        self.setPkParentRelation(data)
                    except Exception as exp:
                        print(f"Loop Set Data Insert (Block) - {str(data)} - {traceback.format_exc()}")
                        Log.error(f"{nik} | Loop Set Data Insert (Block) | {str(data)} - {traceback.format_exc()}")  
        except Exception as exp:
            print(f"setDataInsert (Block) - {traceback.format_exc()}")
            Log.error(f"{nik} | setDataInsert (Block) | {traceback.format_exc()}")
            Log.error(f"{nik} | FAILED SET DATA INSERT IN BLOCK | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}")
            return rMsgBox('Failed to Set Data Insert in Block')
    
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
        print(878,pkData)
        return pkData
    
    def validateBase(self,validateType):
        nik = session['loggedId']['nik']
        val = {}
        print(844,validateType)
        if validateType=="UPDATE":
            try:
                for record in self.records:
                    if record.changeStatus is True:
                        self.pkActive = record.primaryKey
                        val = record.validateBase(validateType)
                        if val['status'] is False:
                            self.parentObj.resetValue()
                            # print(f"validateBase UPDATE (Block) - {str(val)}")
                            # Log.error(f"{nik} | validateBase UPDATE (Block) | {str(val)}")
                            return val
                print(579,self.pkActive)
                
            except Exception as exp:
                print(f"validateBase UPDATE (Block) - {self.blockId} - {traceback.format_exc()}")
                Log.error(f"{nik} | validateBase UPDATE (Block) | {str(traceback.format_exc())}")
        elif validateType=="INSERT":
            try:
                for recordInsert in self.recordsInsert:
                    if recordInsert.changeStatus is True:
                        self.pkActive = recordInsert.primaryKey
                        val = recordInsert.validateBase(validateType)
                        print(972,recordInsert,val)
                        if val['status'] is False:
                            self.parentObj.resetValue()
                            return val
            except Exception as exp:
                print(f"validateBase INSERT (Block) - {self.blockId} - {traceback.format_exc()}")
                Log.error(f"{nik} | validateBase INSERT (Block) | {traceback.format_exc()}") 
                return val
        elif validateType=="NON-BASE":
            if len(self.listObjItem) == 0:
                val.update({'data':[{}],'status':True})
            else:
                for recordNonBase in self.recordsNonBase:
                    print(879,recordNonBase.changeStatus)
                    if recordNonBase.changeStatus is True:
                        val = recordNonBase.validateBase(validateType)
                        if val['status'] is False:
                            return val
                val.update({'data':self.dataNonBase})
                
        print(f"validateBase (Block) - before return - {self.blockId} - {str(val)}")
        Log.info(f"{nik} | validateBase (Block) | before return |{str(val)}")
        return val

    def getPkDb(self):
        pass

    def getPkPy(self):
        pass
    
    def changeStatusUpdate(self):
        self.changeStatus = True
        # print(self.changeStatus)
        self.parentObj.changeStatusUpdate()
    
    def resetValue(self):
        print(736, f"resetValue Block - {self.blockId}")
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
        # print("\n\n\n",647, self,self.records,"\n\n\n")
        if len(self.records)!=0:
            for record in self.records:
                # print(742, "pk", set(record.primaryKey), set(pkData),record.primaryKey, pkData )
                if set(record.primaryKey) == set(pkData):
                    return record.validatePkCallForm()
        else:
            print(747, " - record block kosong") 
        return{"status":False,"data":{},"msg":"DATA IS NOT VALID"}
        
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

    def debugEks(self):
        print("\nPK RECORD",self.primaryKey)
        print("OBJ ITEMS IN RECORD", self.items)
        for item in self.items:
            print("ITEM ID",item.itemId,"| VALUE ITEM",item.valueItem)
    
    def item(self,itemId):
        return self.parentObj.item(itemId)

    def getItem(self,itemId):
        return self.parentObj.item(itemId)

    def updateStatement(self):
        print("updateStatement Record")
        nik = session['loggedId']['nik']
        try:
            # print(1002,self.parentObj.pkActive)
            self.parentObj.pkActive = self.primaryKey
            # print(1004,self.parentObj.pkActive)
            try:
                preUpdate = self.parentObj.preUpdate()
            except Exception as exp:
                print(f"preUpdate (Record) - {traceback.format_exc()}")
                Log.error(f"{nik} | preUpdate (Record) - | {traceback.format_exc()}")
                return rMsgBox('Failed to Update Data in Record')
            if preUpdate['status']:
                sqlStatement = getUpdateStatementRecord(self,session['loggedId']['nik'])
                if isinstance(sqlStatement,dict):
                    if "status" in sqlStatement:
                        if sqlStatement['status'] is False:
                            return rMsgBox('Failed to Update Data in Record')
                try:
                    mainUpdate = self.parentObj.parentObj.connActive.executeDataNoCommit(sqlStatement[0],sqlStatement[1])
                except Exception as exp:
                    print(f"mainUpdate (Record) - {traceback.format_exc()}")
                    Log.error(f"{nik} | mainUpdate (Record) - | {traceback.format_exc()}")
                    return rMsgBox('Failed to Update Data in Record')
                if mainUpdate['status'] is False:
                    print(f"MAIN_UPDATE - {str(mainUpdate)}")
                    Log.info(f"MAIN_UPDATE - {str(mainUpdate)}")
                    return{'status':mainUpdate['status'],'msg':f"{datetime.now().strftime('%d-%m-%Y | %H:%M:%S')} | {mainUpdate['errorcode']}<br>{convertErrorMessage(mainUpdate, libDict)}"}
            else:
                self.parentObj.parentObj.resetValue()
                if "msg_Param" in preUpdate:
                    return {'status':preUpdate['status'], 'msg':preUpdate['msg'], 'msg_Param':preUpdate["msg_Param"]}
                else:
                    return {'status':preUpdate['status'], 'msg':preUpdate['msg']}
            if mainUpdate['status']:
                try:
                    dataAfterMain = {}
                    # print("\n\n\n\n",1016,sqlStatement[1])
                    self.setDataAfterMain(sqlStatement[1])

                    if self.parentObj.blockType == "form":
                        if self.parentObj.relationBlock is None:
                            for data in self.items:
                                if data.valueItem != '' and data.databaseItem is True:
                                    dataAfterMain.update({data.itemId:checkTypeDatas([(data.valueItem,)])[0][0]})
                        else:
                            for data in self.parentObj.relationBlock.records[0].items:
                                dataAfterMain.update({data.itemId:checkTypeDatas([(data.valueItem,)])[0][0]})
                    elif self.parentObj.blockType == "datagrid":
                        if len(session['vForm'].dataBlocks) != 1:
                            for block in session['vForm'].dataBlocks:
                                if block.blockType == "form" and len(block.records)!=0:
                                    for data in block.records[0].items:
                                        if data.valueItem != '' and data.databaseItem is True:
                                            dataAfterMain.update({data.itemId:checkTypeDatas([(data.valueItem,)])[0][0]})
                                elif block.blockType == "datagrid" and len(block.records)!=0 and block.relationBlock:
                                    for record in block.records:
                                        if(set(record.primaryKey) == set(block.pkActive)):
                                            for data in record.items:
                                                if data.valueItem != '' and data.databaseItem is True:
                                                    dataAfterMain.update({data.itemId:checkTypeDatas([(data.valueItem,)])[0][0]})
                    mainUpdate.update(data=dataAfterMain)
                    Log.info(f"{nik} | SUCCESS UPDATE DATA |")
                except Exception as exp:
                    # print(f"afterUpdate (Record) - {traceback.format_exc()}")
                    Log.error(f"{nik} | afterUpdate (Record) - | {traceback.format_exc()}")
                try:
                    postUpdate = self.parentObj.postUpdate(mainUpdate)
                except Exception as exp:
                    # print(f"postUpdate - {traceback.format_exc()}")
                    Log.error(f"{nik} | postUpdate - | {traceback.format_exc()}")
                    return rMsgBox('Failed to Update Data in Record')
                if "msg_Param" in postUpdate:
                    return {'status':postUpdate['status'], 'msg':postUpdate['msg'], 'msg_Param':postUpdate["msg_Param"], 'data':postUpdate['data']}
                else:
                    return {'status':postUpdate['status'], 'msg':postUpdate['msg'], 'data':postUpdate['data']}
        except Exception as exp:
            print(f"FAILED UPDATE DATA IN RECORD - {traceback.format_exc()}")
            Log.error(f"{nik} | FAILED UPDATE DATA IN RECORD - | {traceback.format_exc()}")
            Log.error(f"{nik} | FAILED UPDATE DATA IN RECORD | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}")
            return rMsgBox('Failed to update data in record')

    def insertStatement(self):
        nik = session['loggedId']['nik']
        try:
            self.parentObj.pkActive = self.primaryKey
            try:
                preInsert = self.parentObj.preInsert()
            except Exception as exp:
                # print(f"preInsert (Record) - {traceback.format_exc()}")
                Log.error(f"{nik} | preInsert (Record) - | {traceback.format_exc()}")
                return rMsgBox('Failed to Insert Data in Record')
            if preInsert['status']:
                sqlStatement = getInsertStatementRecord(self,session['loggedId']['nik'])
                # print(1074,"!!!!!!!!!!!!!!!!!!!!", sqlStatement)
                if isinstance(sqlStatement,dict):
                    if "status" in sqlStatement:
                        if sqlStatement['status'] is False:
                            return rMsgBox('Failed to Insert Data in Record')
                try:
                    mainInsert = self.parentObj.parentObj.connActive.executeDataNoCommit(sqlStatement[0],sqlStatement[1])
                except Exception as exp:
                    print(f"mainInsert (Record) - {traceback.format_exc()}")
                    Log.error(f"{nik} | mainInsert (Record) - | {traceback.format_exc()}")
                    return rMsgBox('Failed to Insert Data in Record')
                if mainInsert['status'] is False:
                    self.parentObj.parentObj.resetValue()
                    print(f"MAIN_INSERT - {str(mainInsert)}")
                    Log.info(f"MAIN_INSERT - {str(mainInsert)}")
                    return{'status':mainInsert['status'],'msg':f"{datetime.now().strftime('%d-%m-%Y | %H:%M:%S')} | {mainInsert['errorcode']}<br>{convertErrorMessage(mainInsert, libDict)}"}
            else:
                self.parentObj.parentObj.resetValue()
                if "msg_Param" in preInsert:
                    return {'status':preInsert['status'], 'msg':preInsert['msg'], 'msg_Param':preInsert["msg_Param"]}
                else:
                    return {'status':preInsert['status'], 'msg':preInsert['msg']}
            if mainInsert['status']:
                dataAfterMain = {}
                try:
                    if self.parentObj.blockType == "form": 
                        self.parentObj.records = []
                    self.setDataAfterMain(sqlStatement[1])
                    self.parentObj.append(self)
                    print("\n\n=========================== INSERT STATEMENT ===========================\n\n")
                    print(1102,sqlStatement[1])
                    if self.parentObj.blockType == "form":
                        if self.parentObj.relationBlock is None:
                            for data in self.items:
                                # print(1195, data.valueItem)
                                if data.valueItem != '' and data.databaseItem is True:
                                    dataAfterMain.update({data.itemId:checkTypeDatas([(data.valueItem,)])[0][0]})
                        else:
                            for data in self.parentObj.relationBlock.records[0].items:
                                dataAfterMain.update({data.itemId:data.valueItem})
                    elif self.parentObj.blockType == "datagrid":
                        if len(session['vForm'].dataBlocks) != 1:
                            for block in session['vForm'].dataBlocks:
                                if block.blockType == "form" and len(block.records)!=0:
                                    for data in block.records[0].items:
                                        # print(1213, data.valueItem)
                                        if data.valueItem != '' and data.databaseItem is True:
                                            dataAfterMain.update({data.itemId:checkTypeDatas([(data.valueItem,)])[0][0]})
                                elif block.blockType == "datagrid" and len(block.records)!=0 and block.relationBlock:
                                    for data in block.records[len(block.records)-1].items:
                                        # print(1213, data.valueItem)
                                        if data.valueItem != '' and data.databaseItem is True:
                                            dataAfterMain.update({data.itemId:checkTypeDatas([(data.valueItem,)])[0][0]})
                    print(1126,dataAfterMain)
                    mainInsert.update(data=dataAfterMain)
                    Log.info(f"{nik} | SUCCESS INSERT DATA |")
                except Exception as exp:
                    print(f"afterInsert (Record) - {traceback.format_exc()}")
                    Log.error(f"{nik} | afterInsert (Record) - | {traceback.format_exc()}")

                try:
                    postInsert = self.parentObj.postInsert(mainInsert)
                except Exception as exp:
                    print(f"postInsert - {traceback.format_exc()}")
                    Log.error(f"{nik} | postInsert - | {traceback.format_exc()}")
                    return rMsgBox('Failed to Insert Data in Record')
                if "msg_Param" in postInsert:
                    return {'status':postInsert['status'], 'msg':postInsert['msg'], 'msg_Param':postInsert["msg_Param"], 'data':postInsert['data']}
                else:
                    return {'status':postInsert['status'], 'msg':postInsert['msg'], 'data':postInsert['data']}
        except Exception as exp:
            print(f"insertStatement (Record) - {traceback.format_exc()}")
            Log.error(f"{nik} | insertStatement (Record) | {traceback.format_exc()}")
            Log.error(f"{nik} | FAILED INSERT DATA IN RECORD | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}")
            return rMsgBox('Failed to Insert Data in Record')
    
    def getInsertItem(self,idObj):
        for item in self.insertItems:
            if item.itemId == idObj:
                return item.valueItem

    def validateBase(self,validateType):
        nik = session['loggedId']['nik']
        val = {}
        if validateType=="UPDATE":
            try:
                print(1167,self.parentObj.pkActive)
                for item in self.items:
                    if item.changeStatus is True and item.databaseItem is True:
                        val = item.validateBase()
                        if val['status'] is False:
                            self.parentObj.parentObj.resetValue()
                            # print(f"Validate UPDATE (Record) - {str(val)}")
                            # Log.error(f"{nik} | Validate UPDATE (Record) | {str(val)}")
                            return val
                try:
                    val = self.validate()
                except Exception as exp:
                    print(f"Validate UPDATE (Record) - {traceback.format_exc()}")
                    Log.error(f"{nik} | Validate UPDATE (Record) | {str(traceback.format_exc())}")
                    return rMsgBox('Validate Error in Validate Update Record')
            except Exception as exp:
                print(f"validateBase UPDATE (Record) - {traceback.format_exc()}")
                Log.error(f"{nik} | validateBase UPDATE (Record) | {str(traceback.format_exc())}")
        elif validateType=="INSERT":
            try:
                for itemInsert in self.insertItems:
                    if itemInsert.changeStatus is True and itemInsert.databaseItem is True:
                        val = itemInsert.validateBase()
                        print(1292,val)
                        if val['status'] is False:
                            self.parentObj.parentObj.resetValue()
                            return val
                try:
                    val = self.validate()
                except Exception as exp:
                    print(f"Validate INSERT (Record) - {traceback.format_exc()}")
                    Log.error(f"{nik} | Validate INSERT (Record) | {str(traceback.format_exc())}")
                    return rMsgBox('Validate Error in Validate Insert Record')
            except Exception as exp:
                print(f"validateBase INSERT (Record) - {traceback.format_exc()}")
                Log.error(f"{nik} | validateBase INSERT (Record) | {traceback.format_exc()}")
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
        print(1317,"VALIDATE BASE RECORD",val)
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
        nik = session['loggedId']['nik']
        try:
            if data!=None:
                for key in data.keys():
                    # print(1312, "LOGLOG", key)
                    for item in self.items:
                        # print(1314, "LOGLOG", item)
                        if item.itemId==key:
                            # print(1314, "LOGLOG", item.itemId, data[key])
                            item.valueItem = data[key]
            else:
                self.changeStatus = False                  
                for item in self.items:
                    item.setDataAfterMain()
        except Exception as exp:
            print(f"{nik} | setDataAfterMain (Record) | {str(traceback.format_exc())}")
            Log.error(f"{nik} | setDataAfterMain (Record) | {str(traceback.format_exc())}")

    def setDataUpdate(self,data):
        print("setDataUpdate Record")
        nik = session['loggedId']['nik']
        try:
            for key in data.keys(): 
                for item in self.items: 
                    if item.itemId==key:
                        print(1365,item.itemId,key)
                        item.changeStatusUpdate(data[key])
        except Exception as exp:
            print(f"{nik} | setDataUpdate (Record) | {str(traceback.format_exc())}")
            Log.error(f"{nik} | setDataUpdate (Record) | {str(traceback.format_exc())}")
            Log.error(f"{nik} | FAILED SET DATA UPDATE IN RECORD | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}")
            return rMsgBox('Failed to set data update in record')

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
            print("setDataInsert Record Done")
        except Exception as exp:
            print(f"setDataInsert (Record) - {traceback.format_exc()}")
            Log.error(f"{nik} | setDataInsert (Record) | {traceback.format_exc()}")
            Log.error(f"{nik} | FAILED SET DATA INSERT IN RECORD | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}")
            return rMsgBox('Failed to Set Data Insert in Record')

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
        print("changeStatusUpdate RECORD")
        self.changeStatus = True
        print(1022, self.changeStatus)
        self.parentObj.changeStatusUpdate()

    def rollBackData(self):
        self.changeStatus = False
        self.parentObj.rollBackData()

    def resetValue(self):
        print(1016, "resetValue Record")
        if self.parentObj.parentObj.actionActive == "UPDATE":
            for item in self.items:
                if item.changeStatus is True:
                    print(1020)
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
            Log.info(f"{nik} | changeStatusUpdate (Item) | {str(self.value)} -> {str(data)}")
            self.value = data
            Log.info(f"{nik} | changeStatusUpdate (Item) | self.value = {str(self.value)}")
            self.parentObj.changeStatusUpdate()
        except Exception as exp:
            print(traceback.format_exc())
            Log.error(f"{nik} | changeStatusUpdate (Item) | {str(traceback.format_exc())}")
            Log.error(f"{nik} | FAILED SET DATA UPDATE IN ITEM | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}")
            return rMsgBox('Failed to set data update in item')

    def resetValue(self):
        print(1124, f"resetValue Item {self.valueItem} -> {self.oldValueItem}")
        if self.parentObj.parentObj.parentObj.actionActive == "UPDATE":
            print(1126)
            self.valueItem = self.oldValueItem
        self.rollBackData()

    def rollBackData(self):
        self.changeStatus = False
        self.parentObj.rollBackData()

    def checkSpecialChar(self):
        nik = session['loggedId']['nik']
        result = True
        if self.valueItem is not None:
            for char in str(self.valueItem):                
                if ord(char) not in self.baseAllowSpecialChar:
                    result = False
                    Log.warning(f'{nik} | SPECIAL CHARACTER DETECTED | Item: {self.itemId} | Character: {char} | Ordinal: {ord(char)}')
        return result

    def validateBase(self):
        print(1436,"BF ITEM ",self.parentObj.parentObj.pkActive)
        valResult = {'status':False,'msg':''}
        if(self.databaseItem is True and self.changeStatus is True):
            if(self.nullable is False and self.valueItem == ""):
                self.parentObj.parentObj.parentObj.resetValue()
                return {'status':False,'msg':'Field '+self.itemId+' cannot be empty', 'errItem':self.itemId}
            if(self.lengthItem < len(str(self.valueItem))):
                self.parentObj.parentObj.parentObj.resetValue()
                return {'status':False,'msg':'Field '+self.itemId+' cannot be longer than '+str(self.lengthItem), 'errItem':self.itemId}
            if self.checkSpecialChar() is False:
                self.parentObj.parentObj.parentObj.resetValue()
                return {'status':False,'msg':'Special Character Detected!<br>'+self.itemId, 'errItem':self.itemId}
            try:
                valResult = self.validate()
            except Exception as exp:
                print(f"validate (Item) - {self.itemId} - {traceback.format_exc()}")
                Log.error(f"{nik} | validate (Item) | {self.itemId} |{str(traceback.format_exc())}")
                return rMsgBox('Validate Item Error')
        print(1453,"AF ITEM ",self.parentObj.parentObj.pkActive)
        print(1565,valResult)
        return valResult

    def validateNonBase(self):
        valResult = {'status':False,'msg':''}
        if(self.changeStatus is True):
            if(self.nullable is False and self.valueItem == ""):
                return {'status':False,'msg':'Field '+self.itemId+' cannot be empty'}
            if(self.lengthItem < len(str(self.valueItem))):
                return {'status':False,'msg':'Field '+self.itemId+' cannot be longer than '+str(self.lengthItem)}
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
                    Log.error('Date Format Failure'+ value)
            
        if not hasattr(self,'valueItem'):
            self.valueItem = value
        else:
            # print(1213,self.valueItem)
            # print(1214, value)
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
                    Log.error('Date Format Failure'+ value)
            
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
    
    
    
def debugPotentialRC(self):
    """
        The Parameter is self of datablocks 
    """
    for block in self.parentObj.dataBlocks:
        print("\n\n\n=======================DEBUG CHECK RECORD BLOCK START ==================")
        print(f" | BLOCK TRANSACTION = {self.blockId}")
        print(f" | BLOCK LOOP        = {block.blockId}")
        print(f" | COUNT RECORD      = {len(block.records)}")
        print(f" | DETAIL RECORD     = {block.records}")
        print("======================= DEBUG CHECK RECORD BLOCK END ==================\n\n\n")
    