"""
Update : 2023-02-08 (YYYY-MM-DD)
SatMongoDB untuk local
Version : 1.0.0
Requirements :
 Standard Lib : satlog
 Library : pymongo
Configuration:
 globalVar:
  APP_NAME
  LOG_NAME
  URI_MONGODB
  TIMEOUT_MS_MONGODB
=================================
Update : 2023-07-27 (YYYY-MM-DD)
Version : 1.0.1
Configuration:
 globalVar:
  URI_MONGODB mulai tidak digunakan
Update :
 pembacaan konfigurasi disamakan dengan satconnectserver, agar bisa melakukan koneksi lebih dari satu object koneksi
=================================
Update : 2023-10-18 (YYYY-MM-DD)
Version : 2.0.0
Update:
 parameter value di fungsi update, updateMany, selectUpdate
 fitur session: fungsi startSession, endSession, startTransaction, commitTransaction, dan abortTransaction
=================================
Update : 2023-11-11 (YYYY-MM-DD)
Version : 2.0.1
Update :
 selectAggregate untuk mewakili fungsi aggregate dari mongodb
=================================
Update : 2023-11-13 (YYYY-MM-DD)
Version : 2.0.2
Update :
 pembuatan koneksi dan bagaimana membaca string koneksi
=================================
Update : 2023-11-14 (YYYY-MM-DD)
Version : 2.0.3
Update :
 pembuatan fungsi CRUD pure dari pymongo
=================================
Update : 2023-02-21 (YYYY-MM-DD)
Version : 2.0.4
Update :
 update parameter upsert pada fungsi update & updateMany
=================================
Update : 2024-03-25 (YYYY-MM-DD)
Version : 3.0.0
Update :
 update semua fungsi sesuai pymongo
================================= [this is the last version]
Update : 2024-07-26 (YYYY-MM-DD)
Version : 3.0.1
Update :
 Dokumentasi fungsi ada di "version.md".
 User dibebaskan dengan konfigurasi/parameter saat membuat koneksi sesuai pymongo.
 User dibebaskan dengan konfigurasi/parameter ketika menggunakan setiap fungsi sesuai pymongo.
 User dibebaskan dalam mengolah objek hasil fungsi.
 Penghapusan konfigurasi URI_MONGODB, TIMEOUT_MS_MONGODB, IS_MONGODB_FORCED_EXIT di globalVar.py. Hanya ada APP_NAME & LOG_NAME.
 Perubahan nama fungsi (disesuikan dengan nama dari pymongo):
  select menjadi findOne.
  selectMany menjadi find.
  insert menjadi insertOne.
  update menjadi updateOne.
  delete menjadi deleteOne.
 Penambahan fungsi:
  replaceOne.
  findOneAndUpdate.
  findOneAndDelete.
  findOneAndReplace.
 Perubahan nama file koneksi ConnectionMongo.cfg menjadi Connection.cfg untuk keseragaman semua library koneksi
 Perubahan nama pembuat string koneksi CreateConnectionMongo.py menjadi CreateConnection.py untuk keseragaman semua library koneksi
 Perubahan cara untuk melakukan transaksi ulang setiap fungsi dalam Exception ConnectionFailure

================================= [this is under development]
Update : 2025-04-10 (YYYY-MM-DD)
Version : 4
Update :
- masih belum semua ada update
- return dict
- 
"""

import os
import sys

import pymongo
from pymongo.errors import ConnectionFailure, PyMongoError

class SatMongoDB:

    def __init__(self, *args, **kwargs):
        """
        :param connectionname: nama koneksi / alias database yang ingin digunakan
        :type connectionname: str
        :param closeconnection: otomatis melakukan close connection setelah transaksi CRUD
        :type closeconnection: str
        :param forcedexit: melakukan raise dari setiap fungsi yang error
        :type forcedexit: str
        """
        self.connectionname = kwargs.pop("connectionname", None)
        self.closeconnection = kwargs.pop("closeconnection", False)
        self.forcedexit = kwargs.pop("forcedexit", False)
        self.argsConnection = args
        self.kwargsConnection = kwargs
        resultConnection = self.getConnection()
        print(109, resultConnection)
        self.statusconnection, self.client, self.messageconnection, self.codeconnection = resultConnection.get("status"), resultConnection.get("client"), resultConnection.get("message"), resultConnection.get("code")

    def executeRaiseError(self, strmessage=""):
        """
        Fungsi executeRaiseError digunakan untuk melakukan raise dari setiap fungsi yang error

        :param strmessage: pesan yang ingin disampaikan/error yang ingin diperlihatkan
        :type strmessage: str
        """
        if strmessage != "" and self.forcedexit is True:
            expError = Exception(strmessage)
            raise expError
    
    def getErrorDetails(self, errors):
        code = getattr(errors, "code", None)
        message = str(errors)
        details = getattr(errors, "details", None)
        if isinstance(details, dict):
            code = details.get("code", code)
            message = details.get("errmsg", message)
        elif isinstance(details, list):
            message_list = []
            for item in details:
                message_list.append(str(item))
            message = "; ".join(message_list)
        return {"code": code, "message": message}

    def getConnection(self):
        result = {"client": None, "status": False, "message": "", "code": None}
        client = None
        if self.connectionname is not None:
            dictParser = SatmongoDictParserCFG().main(self.connectionname)
            statusConnectionConfig = dictParser[0]
            if statusConnectionConfig is False:
                result["message"] = dictParser[1].get("message", "Connection Fail")
                self.executeRaiseError(result["message"])
                return result
            valParser = dictParser[1].get(self.connectionname, None)
            uriMongo = self.validatingUri(valParser)
            self.argsConnection = [uriMongo]
            
        try:
            client = pymongo.MongoClient(*self.argsConnection, **self.kwargsConnection)
            if client is not None:
                client.admin.command('ping')
                serverInfo = client.server_info()
                if serverInfo is not None:
                    result["status"] = True
                    result["client"] = client
        except ConnectionFailure as saterror:
            result["message_connection"] = saterror
            try:
                client = pymongo.MongoClient(*self.argsConnection, **self.kwargsConnection)
                if client is not None:
                    client.admin.command('ping')
                    serverInfo = client.server_info()
                    if serverInfo is not None:
                        result["status"] = True
                        result["client"] = client
            except Exception as saterror:
                result["message"] = saterror
        except PyMongoError as saterror:
            dictError = self.getErrorDetails(saterror)
            result["code"] = dictError.get("code")
            result["message"] = dictError.get("message")
        except Exception as saterror:
            result["message"] = saterror
        self.executeRaiseError(result["message"])
        return result

    def closeDB(self):
        """
        Fungsi closeDB digunakan untuk memutuskan koneksi dengan database mongo

        :return: status koneksi database
        :rtype: bool
        """
        result = {"status": False, "message": ""}
        try:
            self.client.close()
            result["status"] = True
        except ConnectionFailure as saterror:
            result["message_connection"] = saterror
            resultConnection = self.getConnection()
            _, self.client, _ = resultConnection.get("status"), resultConnection.get("client"), resultConnection.get("message")
            try:
                self.client.close()
                result["status"] = True
            except PyMongoError as saterror:
                dictError = self.getErrorDetails(saterror)
                result["code"] = dictError.get("code")
                result["message"] = dictError.get("message")
            except Exception as saterror:
                result["message"] = saterror
        except PyMongoError as saterror:
            dictError = self.getErrorDetails(saterror)
            result["code"] = dictError.get("code")
            result["message"] = dictError.get("message")
        except Exception as saterror:
            result["message"] = saterror
        self.executeRaiseError(result["message"])
        return result

    def startSession(self):
        """
        Fungsi startSession untuk memulai menggunakan session. Termasuk (optional) jika usesession class SatMongoDB
        berupa True

        :return: object session
        :rtype: object
        """
        result = {"session": None, "message": ""}
        try:
            result["session"] = self.client.start_session()
        except ConnectionFailure as saterror:
            result["message_connection"] = saterror
            resultConnection = self.getConnection()
            _, self.client, _ = resultConnection.get("status"), resultConnection.get("client"), resultConnection.get("message")
            try:
                result["session"] = self.client.start_session()
            except PyMongoError as saterror:
                dictError = self.getErrorDetails(saterror)
                result["code"] = dictError.get("code")
                result["message"] = dictError.get("message")
            except Exception as saterror:
                result["message"] = saterror
        except PyMongoError as saterror:
            dictError = self.getErrorDetails(saterror)
            result["code"] = dictError.get("code")
            result["message"] = dictError.get("message")
        except Exception as saterror:
            result["message"] = saterror
        self.executeRaiseError(result["message"])
        return result

    def endSession(self, session=None):
        """
        Fungsi endSession untuk mengakhiri menggunakan session.

        :param session: object session mandiri dari user (optional). Tidak perlu diisi jika usesession is True
        :type session: object
        :return: status aktif session
        :rtype: bool
        """
        result = {"status": False, "message": "", "code": None}
        if session is not None:
            try:
                session.end_session()
                result["status"] = session.has_ended
            except ConnectionFailure as saterror:
                result["message_connection"] = saterror
                resultConnection = self.getConnection()
                _, self.client, _ = resultConnection.get("status"), resultConnection.get("client"), resultConnection.get("message")
                try:
                    session.end_session()
                    result["status"] = session.has_ended
                except Exception as saterror:
                    result["message"] = saterror
            except PyMongoError as saterror:
                dictError = self.getErrorDetails(saterror)
                result["code"] = dictError.get("code")
                result["message"] = dictError.get("message")
            except Exception as saterror:
                result["message"] = saterror
        self.executeRaiseError(result["message"])
        return result

    def startTransaction(self, session=None):
        """
        Fungsi startTransaction digunakan untuk memulai transaksi menggunakan session. Termasuk (optional) jika
        usesession class SatMongoDB berupa True

        :param session: object session mandiri dari user (optional). Tidak perlu diisi jika usesession is True
        :type session: object
        :return: status aktif transaksi
        :rtype: bool
        """
        result = {"object": None, "message": "", "code": None}
        if session is not None:
            try:
                session.start_transaction()
                result["object"] = session.in_transaction
            except ConnectionFailure as saterror:
                result["message_connection"] = saterror
                resultConnection = self.getConnection()
                _, self.client, _ = resultConnection.get("status"), resultConnection.get("client"), resultConnection.get("message")
                try:
                    session.start_transaction()
                    result["object"] = session.in_transaction
                except PyMongoError as saterror:
                    dictError = self.getErrorDetails(saterror)
                    result["code"] = dictError.get("code")
                    result["message"] = dictError.get("message")
                except Exception as saterror:
                    result["message"] = saterror
            except PyMongoError as saterror:
                dictError = self.getErrorDetails(saterror)
                result["code"] = dictError.get("code")
                result["message"] = dictError.get("message")
            except Exception as saterror:
                result["message"] = saterror
        self.executeRaiseError(result["message"])
        return result

    def commitTransaction(self, session=None):
        """
        Fungsi commitTransaction digunakan untuk commit transaksi menggunakan session

        :param session: object session mandiri dari user (optional). Tidak perlu diisi jika usesession is True
        :type session: object
        :return: status success commit
        :rtype: bool
        """
        result = {"status": False, "message": "", "code": None}
        if session is not None:
            try:
                session.commit_transaction()
                if session.in_transaction is False:
                    result["status"] = True
            except ConnectionFailure as saterror:
                result["message_connection"] = saterror
                resultConnection = self.getConnection()
                _, self.client, _ = resultConnection.get("status"), resultConnection.get("client"), resultConnection.get("message")
                try:
                    session.commit_transaction()
                    if session.in_transaction is False:
                        result["status"] = True
                except PyMongoError as saterror:
                    dictError = self.getErrorDetails(saterror)
                    result["code"] = dictError.get("code")
                    result["message"] = dictError.get("message")
                except Exception as saterror:
                    result["message"] = saterror
            except PyMongoError as saterror:
                dictError = self.getErrorDetails(saterror)
                result["code"] = dictError.get("code")
                result["message"] = dictError.get("message")
            except Exception as saterror:
                result["message"] = saterror
        self.executeRaiseError(result["message"])
        return result

    def abortTransaction(self, session=None):
        """
        Fungsi abortTransaction digunakan untuk abort/membatalkan transaksi menggunakan session

        :param session: object session mandiri dari user (optional). Tidak perlu diisi jika usesession is True
        :type session: object
        :return: status success abort
        :rtype: bool
        """
        result = {"status": False, "message": ""}
        if session is not None:
            try:
                session.abort_transaction()
                if session.in_transaction is False:
                    result["status"] = True
            except ConnectionFailure as saterror:
                result["message_connection"] = saterror
                resultConnection = self.getConnection()
                _, self.client, _ = resultConnection.get("status"), resultConnection.get("client"), resultConnection.get("message")
                try:
                    session.abort_transaction()
                    if session.in_transaction is False:
                        result["status"] = True
                except PyMongoError as saterror:
                    dictError = self.getErrorDetails(saterror)
                    result["code"] = dictError.get("code")
                    result["message"] = dictError.get("message")
                except Exception as saterror:
                    result["message"] = saterror
            except PyMongoError as saterror:
                dictError = self.getErrorDetails(saterror)
                result["code"] = dictError.get("code")
                result["message"] = dictError.get("message")
            except Exception as saterror:
                result["message"] = saterror
        self.executeRaiseError(result["message"])
        return result

    def createIndex(self, databasename, collectionname, *args, **kwargs):
        result = {"object": None, "message": "", "code": None}
        closeconnection = kwargs.pop("closeconnection", self.closeconnection)
        databasename = kwargs.pop("databasename", databasename)
        collectionname = kwargs.pop("collectionname", collectionname)
        try:
            result[object] = self.client[databasename][collectionname].create_index(*args, **kwargs)
        except ConnectionFailure as saterror:
            result["message_connection"] = saterror
            resultConnection = self.getConnection()
            _, self.client, _ = resultConnection.get("status"), resultConnection.get("client"), resultConnection.get("message")
            try:
                result[object] = self.client[databasename][collectionname].create_index(*args, **kwargs)
            except PyMongoError as saterror:
                dictError = self.getErrorDetails(saterror)
                result["code"] = dictError.get("code")
                result["message"] = dictError.get("message")
            except Exception as saterror:
                result["message"] = saterror
        except PyMongoError as saterror:
            dictError = self.getErrorDetails(saterror)
            result["code"] = dictError.get("code")
            result["message"] = dictError.get("message")
        except Exception as saterror:
            result["message"] = saterror
        if closeconnection is True:
            try:
                self.client.close()
            except Exception as saterror:
                result["message"] = saterror
        self.executeRaiseError(result["message"])
        return result

    def listCollectionNames(self, databasename, *args, **kwargs):
        result = {"object": None, "message": "", "code": None}
        closeconnection = kwargs.pop("closeconnection", self.closeconnection)
        databasename = kwargs.pop("databasename", databasename)
        kwargs.pop("collectionname", "")
        try:
            result["object"] = self.client[databasename].list_collection_names(*args, **kwargs)
        except ConnectionFailure as saterror:
            result["message_connection"] = saterror
            resultConnection = self.getConnection()
            _, self.client, _ = resultConnection.get("status"), resultConnection.get("client"), resultConnection.get("message")
            try:
                result["object"] = self.client[databasename].list_collection_names(*args, **kwargs)
            except PyMongoError as saterror:
                dictError = self.getErrorDetails(saterror)
                result["code"] = dictError.get("code")
                result["message"] = dictError.get("message")
            except Exception as saterror:
                result["message"] = saterror
        except PyMongoError as saterror:
            dictError = self.getErrorDetails(saterror)
            result["code"] = dictError.get("code")
            result["message"] = dictError.get("message")
        except Exception as saterror:
            result["message"] = saterror
        if closeconnection is True:
            try:
                self.client.close()
            except Exception as saterror:
                result["message"] = saterror
        self.executeRaiseError(result["message"])
        return result

    def validateCollection(self, databasename, collectionname, *args, **kwargs):
        result = {"object": None, "message": "", "code": None}
        closeconnection = kwargs.pop("closeconnection", self.closeconnection)
        databasename = kwargs.pop("databasename", databasename)
        collectionname = kwargs.pop("collectionname", collectionname)
        try:
            result["object"] = self.client[databasename].validate_collection(collectionname, *args, **kwargs)
        except ConnectionFailure as saterror:
            result["message_connection"] = saterror
            resultConnection = self.getConnection()
            _, self.client, _ = resultConnection.get("status"), resultConnection.get("client"), resultConnection.get("message")
            try:
                result["object"] = self.client[databasename].validate_collection(collectionname, *args, **kwargs)
            except PyMongoError as saterror:
                dictError = self.getErrorDetails(saterror)
                result["code"] = dictError.get("code")
                result["message"] = dictError.get("message")
            except Exception as saterror:
                result["message"] = saterror
        except PyMongoError as saterror:
            dictError = self.getErrorDetails(saterror)
            result["code"] = dictError.get("code")
            result["message"] = dictError.get("message")
        except Exception as saterror:
            result["message"] = saterror
        if closeconnection is True:
            try:
                self.client.close()
            except Exception as saterror:
                result["message"] = saterror
        self.executeRaiseError(result["message"])
        return result

    def aggregate(self, databasename, collectionname, *args, **kwargs):
        result = {"object": None, "message": "", "code": None}
        closeconnection = kwargs.pop("closeconnection", self.closeconnection)
        databasename = kwargs.pop("databasename", databasename)
        collectionname = kwargs.pop("collectionname", collectionname)
        try:
            result["object"] = self.client[databasename][collectionname].aggregate(*args, **kwargs)
        except ConnectionFailure as saterror:
            result["message_connection"] = saterror
            resultConnection = self.getConnection()
            _, self.client, _ = resultConnection.get("status"), resultConnection.get("client"), resultConnection.get("message")
            try:
                result["object"] = self.client[databasename][collectionname].aggregate(*args, **kwargs)
            except PyMongoError as saterror:
                dictError = self.getErrorDetails(saterror)
                result["code"] = dictError.get("code")
                result["message"] = dictError.get("message")
            except Exception as saterror:
                result["message"] = saterror
        except PyMongoError as saterror:
            dictError = self.getErrorDetails(saterror)
            result["code"] = dictError.get("code")
            result["message"] = dictError.get("message")
        except Exception as saterror:
            result["message"] = saterror
        if closeconnection is True:
            try:
                self.client.close()
            except Exception as saterror:
                result["message"] = saterror
        self.executeRaiseError(result["message"])
        return result

    def replaceOne(self, databasename, collectionname, *args, **kwargs):
        result = {"object": None, "message": "", "code": None}
        closeconnection = kwargs.pop("closeconnection", self.closeconnection)
        databasename = kwargs.pop("databasename", databasename)
        collectionname = kwargs.pop("collectionname", collectionname)
        try:
            result["object"] = self.client[databasename][collectionname].replace_one(*args, **kwargs)
        except ConnectionFailure as saterror:
            result["message_connection"] = saterror
            resultConnection = self.getConnection()
            _, self.client, _ = resultConnection.get("status"), resultConnection.get("client"), resultConnection.get("message")
            try:
                result["object"] = self.client[databasename][collectionname].replace_one(*args, **kwargs)
            except PyMongoError as saterror:
                dictError = self.getErrorDetails(saterror)
                result["code"] = dictError.get("code")
                result["message"] = dictError.get("message")
            except Exception as saterror:
                result["message"] = saterror
        except PyMongoError as saterror:
            dictError = self.getErrorDetails(saterror)
            result["code"] = dictError.get("code")
            result["message"] = dictError.get("message")
        except Exception as saterror:
            result["message"] = saterror
        if closeconnection is True:
            try:
                self.client.close()
            except Exception as saterror:
                result["message"] = saterror
        self.executeRaiseError(result["message"])
        return result

    def insertOne(self, databasename, collectionname, *args, **kwargs):
        result = {"object": None, "message": "", "code": None}
        closeconnection = kwargs.pop("closeconnection", self.closeconnection)
        databasename = kwargs.pop("databasename", databasename)
        collectionname = kwargs.pop("collectionname", collectionname)
        try:
            result["object"] = self.client[databasename][collectionname].insert_one(*args, **kwargs)
        except ConnectionFailure as saterror:
            result["message_connection"] = saterror
            resultConnection = self.getConnection()
            _, self.client, _ = resultConnection.get("status"), resultConnection.get("client"), resultConnection.get("message")
            try:
                result["object"] = self.client[databasename][collectionname].insert_one(*args, **kwargs)
            except PyMongoError as saterror:
                dictError = self.getErrorDetails(saterror)
                result["code"] = dictError.get("code")
                result["message"] = dictError.get("message")
            except Exception as saterror:
                result["message"] = saterror
        except PyMongoError as saterror:
            dictError = self.getErrorDetails(saterror)
            result["code"] = dictError.get("code")
            result["message"] = dictError.get("message")
        except Exception as saterror:
            result["message"] = saterror
        if closeconnection is True:
            try:
                self.client.close()
            except PyMongoError as saterror:
                dictError = self.getErrorDetails(saterror)
                result["code"] = dictError.get("code")
                result["message"] = dictError.get("message")
            except Exception as saterror:
                result["message"] = saterror
        self.executeRaiseError(result["message"])
        return result

    def insertMany(self, databasename, collectionname, *args, **kwargs):
        result = {"object": None, "message": "", "code": None}
        closeconnection = kwargs.pop("closeconnection", self.closeconnection)
        databasename = kwargs.pop("databasename", databasename)
        collectionname = kwargs.pop("collectionname", collectionname)
        try:
            result["object"] = self.client[databasename][collectionname].insert_many(*args, **kwargs)
        except ConnectionFailure as saterror:
            result["message_connection"] = saterror
            resultConnection = self.getConnection()
            _, self.client, _ = resultConnection.get("status"), resultConnection.get("client"), resultConnection.get("message")
            try:
                result["object"] = self.client[databasename][collectionname].insert_many(*args, **kwargs)
            except PyMongoError as saterror:
                code = getattr(saterror, "code", None)
                if not code and hasattr(saterror, "details"):
                    code = saterror.details.get("code")
                    result["code"] = code
                    result["message"] = saterror
            except Exception as saterror:
                result["message"] = saterror
        except PyMongoError as saterror:
            code = getattr(saterror, "code", None)
            if not code and hasattr(saterror, "details"):
                code = saterror.details.get("code")
                result["code"] = code
                result["message"] = saterror
        except Exception as saterror:
            result["message"] = saterror
        if closeconnection is True:
            try:
                self.client.close()
            except PyMongoError as saterror:
                code = getattr(saterror, "code", None)
                if not code and hasattr(saterror, "details"):
                    code = saterror.details.get("code")
                    result["code"] = code
                    result["message"] = saterror
            except Exception as saterror:
                result["message"] = saterror
        self.executeRaiseError(result["message"])
        return result

    def updateOne(self, databasename, collectionname, *args, **kwargs):
        result = {"object": None, "message": "", "code": None}
        closeconnection = kwargs.pop("closeconnection", self.closeconnection)
        databasename = kwargs.pop("databasename", databasename)
        collectionname = kwargs.pop("collectionname", collectionname)
        try:
            result["object"] = self.client[databasename][collectionname].update_one(*args, **kwargs)
        except ConnectionFailure as saterror:
            result["message_connection"] = saterror
            resultConnection = self.getConnection()
            _, self.client, _ = resultConnection.get("status"), resultConnection.get("client"), resultConnection.get("message")
            try:
                result["object"] = self.client[databasename][collectionname].update_one(*args, **kwargs)
            except PyMongoError as saterror:
                code = getattr(saterror, "code", None)
                if not code and hasattr(saterror, "details"):
                    code = saterror.details.get("code")
                    result["code"] = code
                    result["message"] = saterror
            except Exception as saterror:
                result["message"] = saterror
        except PyMongoError as saterror:
            code = getattr(saterror, "code", None)
            if not code and hasattr(saterror, "details"):
                code = saterror.details.get("code")
                result["code"] = code
                result["message"] = saterror
        except Exception as saterror:
            result["message"] = saterror
        if closeconnection is True:
            try:
                self.client.close()
            except Exception as saterror:
                result["message"] = saterror
        self.executeRaiseError(result["message"])
        return result

    def updateMany(self, databasename, collectionname, *args, **kwargs):
        result = {"object": None, "message": "", "code": None}
        closeconnection = kwargs.pop("closeconnection", self.closeconnection)
        databasename = kwargs.pop("databasename", databasename)
        collectionname = kwargs.pop("collectionname", collectionname)
        try:
            result["object"] = self.client[databasename][collectionname].update_many(*args, **kwargs)
        except ConnectionFailure as saterror:
            result["message_connection"] = saterror
            resultConnection = self.getConnection()
            _, self.client, _ = resultConnection.get("status"), resultConnection.get("client"), resultConnection.get("message")
            try:
                result["object"] = self.client[databasename][collectionname].update_many(*args, **kwargs)
            except PyMongoError as saterror:
                dictError = self.getErrorDetails(saterror)
                result["code"] = dictError.get("code")
                result["message"] = dictError.get("message")
            except Exception as saterror:
                result["message"] = saterror
        except PyMongoError as saterror:
            dictError = self.getErrorDetails(saterror)
            result["code"] = dictError.get("code")
            result["message"] = dictError.get("message")
        except Exception as saterror:
            result["message"] = saterror
        if closeconnection is True:
            try:
                self.client.close()
            except Exception as saterror:
                result["message"] = saterror
        self.executeRaiseError(result["message"])
        return result

    def findOne(self, databasename, collectionname, *args, **kwargs):
        result = {"object": None, "message": "", "code": None}
        closeconnection = kwargs.pop("closeconnection", self.closeconnection)
        databasename = kwargs.pop("databasename", databasename)
        collectionname = kwargs.pop("collectionname", collectionname)
        try:
            result["object"] = self.client[databasename][collectionname].find_one(*args, **kwargs)
        except ConnectionFailure as saterror:
            result["message_connection"] = saterror
            resultConnection = self.getConnection()
            _, self.client, _ = resultConnection.get("status"), resultConnection.get("client"), resultConnection.get("message")
            try:
                result["object"] = self.client[databasename][collectionname].find_one(*args, **kwargs)
            except PyMongoError as saterror:
                dictError = self.getErrorDetails(saterror)
                result["code"] = dictError.get("code")
                result["message"] = dictError.get("message")
            except Exception as saterror:
                result["message"] = saterror
        except PyMongoError as saterror:
            dictError = self.getErrorDetails(saterror)
            result["code"] = dictError.get("code")
            result["message"] = dictError.get("message")
        except Exception as saterror:
            result["message"] = saterror
        if closeconnection is True:
            try:
                self.client.close()
            except Exception as saterror:
                result["message"] = saterror
        self.executeRaiseError(result["message"])
        return result

    def find(self, databasename, collectionname, *args, **kwargs):
        result = {"object": None, "message": "", "code": None}
        closeconnection = kwargs.pop("closeconnection", self.closeconnection)
        databasename = kwargs.pop("databasename", databasename)
        collectionname = kwargs.pop("collectionname", collectionname)
        try:
            result = self.client[databasename][collectionname].find(*args, **kwargs)
        except ConnectionFailure as saterror:
            result["message_connection"] = saterror
            resultConnection = self.getConnection()
            _, self.client, _ = resultConnection.get("status"), resultConnection.get("client"), resultConnection.get("message")
            try:
                result = self.client[databasename][collectionname].find(*args, **kwargs)
            except PyMongoError as saterror:
                dictError = self.getErrorDetails(saterror)
                result["code"] = dictError.get("code")
                result["message"] = dictError.get("message")
            except Exception as saterror:
                result["message"] = saterror
        except PyMongoError as saterror:
            dictError = self.getErrorDetails(saterror)
            result["code"] = dictError.get("code")
            result["message"] = dictError.get("message")
        except Exception as saterror:
            result["message"] = saterror
        if closeconnection is True:
            try:
                self.client.close()
            except Exception as saterror:
                result["message"] = saterror
        self.executeRaiseError(result["message"])
        return result

    def findOneAndUpdate(self, databasename, collectionname, *args, **kwargs):
        result = {"object": None, "message": "", "code": None}
        closeconnection = kwargs.pop("closeconnection", self.closeconnection)
        databasename = kwargs.pop("databasename", databasename)
        collectionname = kwargs.pop("collectionname", collectionname)
        try:
            result["object"] = self.client[databasename][collectionname].find_one_and_update(*args, **kwargs)
        except ConnectionFailure as saterror:
            result["message_connection"] = saterror
            resultConnection = self.getConnection()
            _, self.client, _ = resultConnection.get("status"), resultConnection.get("client"), resultConnection.get("message")
            try:
                result = self.client[databasename][collectionname].find_one_and_update(*args, **kwargs)
            except PyMongoError as saterror:
                dictError = self.getErrorDetails(saterror)
                result["code"] = dictError.get("code")
                result["message"] = dictError.get("message")
            except Exception as saterror:
                result["message"] = saterror
        except PyMongoError as saterror:
            dictError = self.getErrorDetails(saterror)
            result["code"] = dictError.get("code")
            result["message"] = dictError.get("message")
        except Exception as saterror:
            result["message"] = saterror
        if closeconnection is True:
            try:
                self.client.close()
            except Exception as saterror:
                result["message"] = saterror
        self.executeRaiseError(result["message"])
        return result

    def findOneAndDelete(self, databasename, collectionname, *args, **kwargs):
        result = {"object": None, "message": "", "code": None}
        closeconnection = kwargs.pop("closeconnection", self.closeconnection)
        databasename = kwargs.pop("databasename", databasename)
        collectionname = kwargs.pop("collectionname", collectionname)
        try:
            result["object"] = self.client[databasename][collectionname].find_one_and_delete(*args, **kwargs)
            print(811,self.client[databasename][collectionname].find_one_and_delete(*args, **kwargs))
        except ConnectionFailure as saterror:
            result["message_connection"] = saterror
            resultConnection = self.getConnection()
            _, self.client, _ = resultConnection.get("status"), resultConnection.get("client"), resultConnection.get("message")
            try:
                result["message"] = self.client[databasename][collectionname].find_one_and_delete(*args, **kwargs)
            except PyMongoError as saterror:
                dictError = self.getErrorDetails(saterror)
                result["code"] = dictError.get("code")
                result["message"] = dictError.get("message")
            except Exception as saterror:
                result["message"] = saterror
        except PyMongoError as saterror:
            dictError = self.getErrorDetails(saterror)
            result["code"] = dictError.get("code")
            result["message"] = dictError.get("message")
        except Exception as saterror:
            result["message"] = saterror
        if closeconnection is True:
            try:
                self.client.close()
            except Exception as saterror:
                result["message"] = saterror
        self.executeRaiseError(result["message"])
        return result

    def findOneAndReplace(self, databasename, collectionname, *args, **kwargs):
        result = {"object": None, "message": "", "code": None}
        closeconnection = kwargs.pop("closeconnection", self.closeconnection)
        databasename = kwargs.pop("databasename", databasename)
        collectionname = kwargs.pop("collectionname", collectionname)
        try:
            result["object"] = self.client[databasename][collectionname].find_one_and_replace(*args, **kwargs)
        except ConnectionFailure as saterror:
            result["message_connection"] = saterror
            resultConnection = self.getConnection()
            _, self.client, _ = resultConnection.get("status"), resultConnection.get("client"), resultConnection.get("message")
            try:
                result["object"] = self.client[databasename][collectionname].find_one_and_replace(*args, **kwargs)
            except PyMongoError as saterror:
                dictError = self.getErrorDetails(saterror)
                result["code"] = dictError.get("code")
                result["message"] = dictError.get("message")
            except Exception as saterror:
                result["message"] = saterror
        except PyMongoError as saterror:
            dictError = self.getErrorDetails(saterror)
            result["code"] = dictError.get("code")
            result["message"] = dictError.get("message")
        except Exception as saterror:
            result["message"] = saterror
        if closeconnection is True:
            try:
                self.client.close()
            except Exception as saterror:
                result["message"] = saterror
        self.executeRaiseError(result["message"])
        return result

    def deleteOne(self, databasename, collectionname, *args, **kwargs):
        result = {"object": None, "message": "", "code": None}
        closeconnection = kwargs.pop("closeconnection", self.closeconnection)
        databasename = kwargs.pop("databasename", databasename)
        collectionname = kwargs.pop("collectionname", collectionname)
        try:
            result["object"] = self.client[databasename][collectionname].delete_one(*args, **kwargs)
        except ConnectionFailure as saterror:
            result["message_connection"] = saterror
            resultConnection = self.getConnection()
            _, self.client, _ = resultConnection.get("status"), resultConnection.get("client"), resultConnection.get("message")
            try:
                result["object"] = self.client[databasename][collectionname].delete_one(*args, **kwargs)
            except PyMongoError as saterror:
                dictError = self.getErrorDetails(saterror)
                result["code"] = dictError.get("code")
                result["message"] = dictError.get("message")
            except Exception as saterror:
                result["message"] = saterror
        except PyMongoError as saterror:
            dictError = self.getErrorDetails(saterror)
            result["code"] = dictError.get("code")
            result["message"] = dictError.get("message")
        except Exception as saterror:
            result["message"] = saterror
        if closeconnection is True:
            try:
                self.client.close()
            except Exception as saterror:
                result["message"] = saterror
        self.executeRaiseError(result["message"])
        return result

    def deleteMany(self, databasename, collectionname, *args, **kwargs):
        result = {"object": None, "message": "", "code": None}
        closeconnection = kwargs.pop("closeconnection", self.closeconnection)
        databasename = kwargs.pop("databasename", databasename)
        collectionname = kwargs.pop("collectionname", collectionname)
        try:
            result["object"] = self.client[databasename][collectionname].delete_many(*args, **kwargs)
        except ConnectionFailure as saterror:
            result["message_connection"] = saterror
            resultConnection = self.getConnection()
            _, self.client, _ = resultConnection.get("status"), resultConnection.get("client"), resultConnection.get("message")
            try:
                result = self.client[databasename][collectionname].delete_many(*args, **kwargs)
            except PyMongoError as saterror:
                dictError = self.getErrorDetails(saterror)
                result["code"] = dictError.get("code")
                result["message"] = dictError.get("message")
            except Exception as saterror:
                result["message"] = saterror
        except PyMongoError as saterror:
            dictError = self.getErrorDetails(saterror)
            result["code"] = dictError.get("code")
            result["message"] = dictError.get("message")
        except Exception as saterror:
            result["message"] = saterror
        if closeconnection is True:
            try:
                self.client.close()
            except Exception as saterror:
                result["message"] = saterror
        self.executeRaiseError(result["message"])
        return result

    def validatingUri(self, valparser):
        host = valparser.get("host")
        username = valparser.get("username")
        password = valparser.get("password")
        defaultauthdb = valparser.get("defaultauthdb")
        options = valparser.get("options")
        srv = valparser.get("srv")
        if srv in ("Y", "y"):
            connectionFormat = "mongodb+srv://"
        else:
            connectionFormat = "mongodb://"
        authenticate = ""
        if username is not None and username != " ":
            authenticate += username
        elif username is None or username == " ":
            authenticate += ""
        if password is not None and password != " ":
            authenticate += f":{password}@"
        elif password is None or password == " ":
            authenticate += ""
        if defaultauthdb is not None and defaultauthdb != " ":
            defaultauthdb = f"/{defaultauthdb}"
        elif defaultauthdb is None or defaultauthdb == " ":
            defaultauthdb = ""
        if options is not None and options != " " and options != "":
            if defaultauthdb is not None and defaultauthdb != "" and defaultauthdb != " ":
                options = f"?{options}"
            else:
                options = f"/?{options}"
        else:
            if srv in ("Y", "y") and (options == " " or options == ""):
                if defaultauthdb is not None and defaultauthdb != "" and defaultauthdb != " ":
                    options = "?retryWrites=true&w=majority"
                else:
                    options = "/?retryWrites=true&w=majority"
            elif options is None or options == " " or options == "":
                options = ""
        uriMongo = f"{connectionFormat}{authenticate}{host}{defaultauthdb}{options}"
        return uriMongo


class SatmongoDictParserCFG():
    def __init__(self):
        self.__dict = {}

    def main(self, param):
        try:
            with open(f"{os.getcwd()}/config/Connection2.cfg", "r") as stream:
                line = stream.read()
            listLine = line.split("\n")
            # print(985, listLine)
            for val in listLine:
                valDB = decoder(val.split(" "))
                if valDB[0] == param:
                    dictValDB = self.__split(valDB)
                    self.__dict[valDB.pop(0)] = dictValDB
                    return True, self.__dict
            return False, self.__dict
        except Exception as saterror:
            self.__dict["message"] = saterror
            return False, self.__dict

    def __split(self, param):
        if len(param) <= 5:
            """
            Format Baru:
            * [Alias][Host][Username][Password][Default-Auth-DB][Options][Srv]
            Update untuk string koneksi:
            - default auth db
            - options
            - srv (default "Y" / menggunakan srv)
            """
            # untuk default auth db
            param.append(" ")
            # untuk options
            param.append(" ")
            # untuk srv
            param.append("Y")
        databaseAlias, host, username, password, defaultauthdb, options, srv = param
        return {
            "host": host,
            "username": username,
            "password": password,
            "defaultauthdb": defaultauthdb,
            "options": options,
            "srv": srv,
        }

def decoder(data):
    """
    Fungsi ini untuk decode ordinal menjadi char
    @param data: list of encoded string
    @type data: list[str]
    @return: decoded list of string
    @rtype: list[str]
    """
    result = []
    for datum in data:
        temp = ""
        for x in datum.strip().split("+"):
            temp = temp + chr(int(x))
        result.append(temp)
    return result
# end of file
