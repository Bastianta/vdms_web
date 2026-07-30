class DatabaseConnectorRO:
    def __init__(self, dbalias, dbtype):
        self.dbalias = dbalias
        self.dbtype = dbtype
        self.createDBConnection()

    def createDBConnection(self):
        if(self.dbtype == "PG"):
            self.connection = DatabaseRO(self.dbalias)
        elif(self.dbtype == "MONGO"):
            self.connection =  SatMongoDB(connectionname=self.dbalias)
        
    def generateSelect(self,vTable,vColumn,vAliasCol,vWhereClause,vOrderBy,vLimit,vNoDBItems,vDatas, vSubDocument):
        vColumnTemp = []
        vAliasColTemp = {}
        for col in vColumn:
            vColumnTemp.append(col[1])
            vAliasColTemp.update({col[1]:col[0]})

        nik = session['loggedId']['nik']
        pipelines = []
        whereClause = ""

        bindParams = vDatas["data"].copy()
        dataRecord = vDatas["data"].copy()
        if(self.dbtype == "PG"):
            try:
                for data,value in vDatas["data"].items():
                    if data in vNoDBItems or data not in vColumnTemp:
                        print(33,data, vNoDBItems, vColumnTemp)
                        del dataRecord[data]

                convertDict = dictParamGenerator(vColumn)

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
                Log.error(f'{nik} | GAGAL GENERATE SELECT | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
                return rMsgBox(f'Gagal Generate Select<br>{exp}') 
        elif(self.dbtype == "MONGO"):
            try:
                for data,value in vDatas["data"].items():
                    if data in vNoDBItems or data not in vColumnTemp:
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
                            # if(len(pipelines) != 0 and any("$match" in key for key in pipelines)):
                            #     pipelines[0]["$match"].update(getPipeline[0]["$match"])
                            # else:
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
                                # if(any("$match" in key for key in pipelines)):
                                #     pipelines[0]["$match"].update(getPipeline[0]["$match"])
                                # else:
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
                print(812,pipelines)
                return [vTable,pipelines]
            except Exception as exp:
                Log.error(f'{nik} | GAGAL GENERATE SELECT | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
                return rMsgBox(f'Gagal Generate Select<br>{exp}')      
    
    def selectDataHeader(self, query_or_collection, param_or_pipelines):
        nik = session['loggedId']['nik']
        dictResult = {}
        if(self.dbtype == "PG"):
            try:
                result = self.connection.selectDataHeader(query_or_collection, param_or_pipelines)
            except psycopg2.InterfaceError as exp:
                Log.error(f'{nik} Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
                print(exp)                                        #new
                self.connection.close()
                self.connection =  DatabaseRO(globalVar.DB_NAME)
                return selectHeaderQueryRO(query)
            except psycopg2.OperationalError as exp:
                Log.error(f'{nik} Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
                print(exp)
                self.connection.close()
                self.connection =  DatabaseRO(globalVar.DB_NAME)
                return selectHeaderQueryRO(query)
            except psycopg2.errors.InFailedSqlTransaction as exp:
                Log.error(f'{nik} Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
                print(exp)
                self.connection.close()
                self.connection =  DatabaseRO(globalVar.DB_NAME)
                return selectHeaderQueryRO(query)
            except Exception as exp:
                Log.error(f'{nik} Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
                print(exp)
            if result['status']:    
                data = convertDictKeyVal(result['data'])
                status = True
            else:
                data = result['msg']
                status = False
        elif(self.dbtype == "MONGO"):
            dbname = session["vForm"].databaseName
            dictResult = checkDatabaseCollectionMongo(self.dbalias, dbname, query_or_collection)
            if(dictResult["status"]):
                try:
                    result = self.connection.aggregate(dbname,query_or_collection, param_or_pipelines)
                except Exception as e:
                    dictResult["status"] = False
                    print(f"selectDataHeaderQueryRO - {traceback.format_exc()}")
                    Log.error(f'{nik} | selectDataHeaderQueryRO | {str(traceback.format_exc())} {e}')

                if result["code"] is None:
                    data = list(result["object"])
                    data = checkTypeDatasMongo(data)
                    status = True
                else:
                    data = result["message"]
                    status = False
            else:
                status = dictResult["status"]
                data = dictResult["data"]
        dictResult.update({'status':status,'data':data})
        return dictResult
   
    def checkCount(self, block, bindParam):
        resultCount = {"status":False, "data":{}, "msg":""}
        if(self.dbtype == "PG"):
            table = block.databaseTable
            blockWhereClause = block.whereclause
            whereClause = ""
            if blockWhereClause!="":
                whereClause = " WHERE "+blockWhereClause
            sql = f"""select count(*) from {table}
            {whereClause}
            """
            countData = selectDataHeaderQueryRO(sql,bindParam)["data"][0]["count"]
        elif(self.dbtype == "MONGO"):
            collection = block.databaseTable
            blockWhereClause = block.whereclause
            countClause = {}
            for key,value in bindParam.items():
                if(value != ""):
                    countClause.update({key:value})
            countClause.update(blockWhereClause)
            countData = self.connection.client[self.dbalias][collection].count_documents(countClause)
        resultCount["status"] = True
        resultCount["data"] = [{"count":str(countData)}]
        return resultCount
    
class DatabaseConnector:
    def __init__(self, dbalias):
        self.dbalias = dbalias
        for database in globalVar.DB_LIST:
            if(dbalias == database[0]):
                self.dbtype = database[1]
        self.createDBConnection()
        if(self.dbtype == "MONGO"):
            self.session = self.connection.startSession()
            self.databaseName = session["vForm"].databaseName
        else:
            self.session = {"session": None}

    def createDBConnection(self):
        if(self.dbtype == "PG"):
            self.connection =  Database(self.dbalias)
        elif(self.dbtype == "MONGO"):
            self.connection =  SatMongoDB(connectionname=self.dbalias)
        
    def startTransaction(self):
        if(self.dbtype == "PG"):
            pass
        elif(self.dbtype == "MONGO"):
            return self.connection.startTransaction(self.session["session"])
        
    def abortTransaction(self):
        if(self.dbtype == "PG"):
            pass
        elif(self.dbtype == "MONGO"):
            return self.connection.abortTransaction(self.session["session"])

    def endSession(self):
        if(self.dbtype == "PG"):
            pass
        elif(self.dbtype == "MONGO"):
            return self.connection.endSession(self.session["session"])
        
    def commit(self):
        if(self.dbtype == "PG"):
            return self.connection.forCommit()
        elif(self.dbtype == "MONGO"):
            commitTransaction = self.connection.commitTransaction(self.session["session"])
            commitTransaction["msg"] = commitTransaction["message"]
            return commitTransaction
        
    def insert(self, dictParam):
        mainInsert = {"status": True, "data":[], "msg":""}
        if(self.dbtype == "PG"):
            sqlStatement = dictParam["query"]
            bindParameter = dictParam["newData"]
            mainInsert = self.connection.executeDataNoCommit(sqlStatement,bindParameter)
            if mainInsert['status'] is False:
                mainInsert["msg"] = f"{datetime.now().strftime('%d-%m-%Y | %H:%M:%S')} | {mainInsert['errorcode']}<br>{libDict[mainInsert['errorcode']]}"
            return mainInsert
        elif(self.dbtype == "MONGO"):
            table = dictParam["table"]
            subDocument = dictParam["subDocument"]
            document = dictParam["document"]
            pk = dictParam["pk"]
            if(len(subDocument) == 0 and len(pk) == 0):
                resultinsert = self.connection.insertOne(self.databaseName, table, document, session=self.session["session"])
                messageinsert = resultinsert["message"]
                if not resultinsert["object"] or not resultinsert["object"].acknowledged:
                    Log.error(f'{nik} | GAGAL INSERT DATA IN RECORD | {messageinsert}')
                    if(resultinsert["code"] == "E11000"):
                        messageinsert = f"Error! Duplicate key value {messageinsert}"
                    Log.error(f'{nik} | GAGAL INSERT DATA IN RECORD | {messageinsert}')
                    return {'status':False,'msg':f"{datetime.now().strftime('%d-%m-%Y | %H:%M:%S')} | {messageinsert}"}
            else:

                from pymongo.collection import ReturnDocument
                resultinsert = self.connection.findOneAndUpdate(self.databaseName,vCollection, vPK, vSubDocument, session=sessionMongoDB, return_document = ReturnDocument.AFTER)
                messageinsert = resultinsert["message"]
                if not resultinsert["object"]:
                    Log.error(f'{nik} | GAGAL INSERT DATA IN RECORD | {messageinsert}')
                    return {'status':False,'msg':f"{datetime.now().strftime('%d-%m-%Y | %H:%M:%S')} | {messageinsert}"}
            mainInsert["msg"] = messageinsert
            return mainInsert
    
    def update(self, dictParam):
        print(390, dictParam)
        mainUpdate = {"status": True, "data":[], "msg":""}
        if(self.dbtype == "PG"):
            sqlStatement = dictParam["query"]
            bindParameter = dictParam["newData"]
            mainUpdate = self.connection.executeDataNoCommit(sqlStatement,bindParameter)
            if mainUpdate['status'] is False:
                mainUpdate["msg"] = f"{datetime.now().strftime('%d-%m-%Y | %H:%M:%S')} | {mainUpdate['errorcode']}<br>{libDict[mainUpdate['errorcode']]}"
            return mainUpdate
        elif(self.dbtype == "MONGO"):
            table = dictParam["table"]
            pkParam = dictParam["pkParam"]
            setParam = dictParam["setParam"]
            
            from pymongo.collection import ReturnDocument
            resultUpdate = self.connection.findOneAndUpdate(self.databaseName, table, pkParam, setParam, session=self.session, return_document = ReturnDocument.AFTER)
            messageUpdate = resultUpdate["message"]
            Log.info(f"RESULT SQL UPDATE - {str(resultUpdate)}")
            if not resultUpdate["object"]:
                return{'status':False,'msg':f"{datetime.now().strftime('%d-%m-%Y | %H:%M:%S')} {messageUpdate or 'Data modified not found in database'}"}
        mainUpdate["msg"] = messageUpdate
        return mainUpdate

    def generateInsertRecord(self,vTable,vColumn,vNoDBItems,vData,vNonVisibleColumns,sessionId,paramSubDocument):
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
            if self.dbtype == "PG":
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
                return {"query": query, "newData":vNewData}
            elif self.dbtype == "MONGO":
                documentToInsert = {}
                dataSubDocument = {}
                pkParam = {}

                for key,value in dataNotNull.items():
                    if isinstance(value, date):
                        value = changeDateToDatetime(value)
                    if key in newConvertDict:
                        getDictInsert = generateNestedDictDocument(documentToInsert, newConvertDict[key], value)
                        documentToInsert.update(getDictInsert)
                
                for key,value in dict(vNonVisibleColumns).items():
                    getDictInsert = generateNestedDictDocument(documentToInsert,key, vNewData[value])
                    documentToInsert.update(getDictInsert)

                if(len(paramSubDocument) != 0): 
                    vDataSubDocument = paramSubDocument["dataSubDocument"]
                    vDataSubDocumentAlias = paramSubDocument["dataSubDocumentAlias"]
                    vPK = paramSubDocument["primaryKeys"]
                
                    if(len(vDataSubDocument) != 0):
                        dictToUpdate = {}
                        for key,value in vDataSubDocument.items():
                            getDictUpdate = generateNestedDictDocument(dictToUpdate, key, value)
                            dictToUpdate.update(getDictUpdate)
                        dataSubDocument["$push"] = dictToUpdate

                        for pk in vPK:
                            pkString = pk[1]
                            if(pkString in vDataSubDocumentAlias.keys()):
                                vPK.remove(pk)
                        for pk in vPK:
                            if ObjectId.is_valid(vNewData[pk[1]]):
                                pkParam.update({pk[0]:ObjectId(vNewData[pk[1]])})
                            else:
                                if isinstance(vNewData[pk[1]], date):
                                    vNewData[pk[1]] = changeDateToDatetime(vNewData[pk[1]])
                                pkParam.update({pk[0]:vNewData[pk[1]]})
                return {"table":vTable, "document":documentToInsert, "newData":vNewData, "subDocument":dataSubDocument, "pk":pkParam}
        except Exception as exp:
            Log.error(f'{nik} | GAGAL GENERATE INSERT RECORD | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return rMsgBox(f'Gagal Generate Insert Record<br>{exp}')

    def generateUpdateRecord(self,vTable,vColumn,vPK,vNoDBItems,vDatas,vNonVisibleColumns,sessionId,paramSubDocument):
        nik = session['loggedId']['nik']
        vData = vDatas.copy()
        vNewData = vData

        try: 
            for key in vNoDBItems:
                if key in vNewData.keys():
                    del vNewData[key]
            
            datasNoPK = vNewData.copy()
            print(508, datasNoPK)
            for pk in vPK:
                pkString = pk[1]
                del datasNoPK[pkString]
            
            convertDict = dictParamGenerator(vColumn)

            if self.dbtype == "PG":
                whereClause = ""
                for pk in vPK:
                    whereClause += f" {pk[0]} = %({pk[1]})s and "
                whereClause=whereClause[:-5]
                
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
                    
                return {"query": query, "newData":vNewData}
            elif self.dbtype == "MONGO":
                pkParam = {}
                for pk in vPK:
                    if ObjectId.is_valid(vNewData[pk[1]]):
                        pkParam.update({pk[0]:ObjectId(vNewData[pk[1]])})
                    else:
                        if isinstance(vNewData[pk[1]], date):
                            vNewData[pk[1]] = changeDateToDatetime(vNewData[pk[1]])
                        pkParam.update({pk[0]:vNewData[pk[1]]})
                
                setParam = {"$set":{}}
                for data,value in datasNoPK.items():
                    if isinstance(value, date):
                        value = changeDateToDatetime(value)
                    setParam["$set"].update({convertDict[data]:value})
                    
                if(len(paramSubDocument) != 0): 
                    vDataSubDocument = paramSubDocument["dataSubDocument"]
                    vDataSubDocumentAlias = paramSubDocument["dataSubDocumentAlias"]
                    vDataSubDocumentIndex = paramSubDocument["dataSubDocumentIndex"]
                    pkParam.update(vDataSubDocument)

                    for pk in vPK:
                        if(pkString not in vDataSubDocumentAlias.keys()):
                            del datasNoPK[pkString]
                        if(pkString in vDataSubDocumentAlias.keys()):
                            vPK.remove(pk)

                    convertDict = dictParamGenerator(vColumn)
                    for data,value in datasNoPK.items():
                        if(convertDict[data] in vDataSubDocumentIndex.keys()):
                            del setParam["$set"][convertDict[data]]
                            setParam["$set"].update({vDataSubDocumentIndex[convertDict[data]]:value})
                vNewData["updateUser"] = sessionId
                setParam["$set"].update({vNonVisibleColumns[0]:vNewData[vNonVisibleColumns[1]]})

                return {"table":vTable, "pkParam":pkParam, "setParam":setParam, "newData":vNewData}
        except Exception as exp:
            Log.error(f'{nik} | GAGAL GENERATE UPDATE RECORD | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return rMsgBox(f'Gagal Generate Update Record<br>{exp}')
    
    def checkTypeData(self, param):
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        if(self.dbtype == "PG"):
            return checkTypeDatas([(param[0][next(iter(param[0]))],)])[0][0]
        elif(self.dbtype == "MONGO"):
            return checkTypeDatasMongo(param)[0][next(iter(param[0]))]

        
def checkDatabaseCollectionMongo(databasealias, databasename, collection):
    nik = session['loggedId']['nik']
    resultCheck = {}
    try:
        if databasename in globalVar.CONN_RO_DICT[databasealias].connection.client.list_database_names():
            resultCheck["status"] = True
        else:
            resultCheck["status"] = False
            resultCheck["data"] = "Database not found"
            Log.error(f'{nik} | checkDatabaseCollectionMongo| Database {databasename} not found')
        if collection in globalVar.CONN_RO_DICT[databasealias].connection.client[databasename].list_collection_names():
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

def checkTypeDatasMongo(param) :
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
        
        print(241,value, type(value))
        return value
    except Exception as e:
        print("Error convertStringDateIntFloat", e)
        Log.error('ERROR convertStringDateIntFloat')

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
    
def convertDictKeyVal(param):
    nik = session['loggedId']['nik']
    """

    :param :  [['LOVDIVISICODE', 'LOVDIVISIDESC'], [('Q0000', 'SMS OPERATIONAL')]]

    :type  :  list

    :return:  [{'lovdivisicode': 'Q0000', 'lovdivisidesc': 'SMS OPERATIONAL'}]
    """

    coll, data = param

    print(494,param)
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
        Log.error(f'{nik} | GAGAL CONVERT DICTIONARY KEY VALUE | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
        return rMsgBox(f'Gagal Convert Dictionary Key Value <br>{exp}')
    
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
    
def changeDateToDatetime(date):
    try:
        datetimeObject = datetime.combine(date, datetime.min.time())
        return datetimeObject
    except Exception as e:
        print("Error changeDateToDatetime", e)
        Log.error('ERROR changeDateToDatetime')

def addCreateUserForInsert(protoQuery,vNonVisibleColumns):
    nik = session['loggedId']['nik']

    try:
        if not vNonVisibleColumns:
            return protoQuery
        for column in vNonVisibleColumns:
            protoQuery=protoQuery + column[0] + ', '
        return protoQuery
    except Exception as exp:
            Log.error(f'{nik} | GAGAL ADD CREATE USER FOR INSERT | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return rMsgBox(f'Gagal Add Create User For Insert<br>{exp}')

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