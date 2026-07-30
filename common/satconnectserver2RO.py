"""
Update : 2022-27-09
SatConnectServer Versi 2 untuk exec
Library : postgresql, oracle dihilangkan.
Return dictionary
"""

import psycopg2
import os
import decimal

Log = Logger()

def checkTypeDatas(param) :
    temp1 = []
    temp2 = []
    try:
        for datas in param :
            for data in datas :
                # if isinstance(data, (datetime,date)):
                #     temp2.append(data.strftime("%Y-%m-%d"))
                if isinstance(data, (datetime)):
                    temp2.append(data.strftime("%Y-%m-%d %H:%M:%S"))
                elif isinstance(data, (date)):
                    temp2.append(data.strftime("%Y-%m-%d"))
                elif isinstance(data, (int, float,decimal.Decimal)):
                    temp2.append(str(data))
                else:
                    temp2.append(data)
            temp1.append(temp2)
            temp2 = []
        return temp1
    except:
        Log.error('ERROR CHECK TYPE DATE')

class DatabaseRO() :
    """
    Class Database digunakan untuk obj koneksi ke database postgres
    Cara penggunaan : conn = Database("param_database")
    Syarat : Harus memiliki file Connection2.cfg didalam folder /config dan standard library satlog
    Cara pembuatan Connection String pada file Connection2.cfg, jalankan perintah 'python CreateConnection2.py' pada terminal, ikuti semua langkah-langkahnya dan copy paste configuration ke file COnnection2.cfg
    @param param_database : Merupakan parameter alias database dari file Connection2.cfg yang ada di client
    @return: status = nilai boolean (True = berhasil, False = gagal)
            data = Hasil select statement
            msg = message informasi
            notice = return message dari procedure database
            rowcount = jumlah baris
            errorcode = code error dari postgres
            errormsg = msg error yang dapat ditampilkan ke user/client
    @rtype: dict
    """

    __version__ = "1.0.0"
    __requirements__ = "psycopg2, standard library satlog"


    def __init__(self, paramDatabase, autocommit = False):
        self.__paramDatabase = paramDatabase
        self.status = {"status":False,"msg":"","errorcode":""}
        self.__ConnectDatabase(autocommit)

    def __ConnectDatabase(self, autocommit):
        try :
            dictParser = DictParserCFG()._main(self.__paramDatabase)
            # print(65,dictParser)
            if dictParser[0] :
                valParser = dictParser[1].get(self.__paramDatabase.upper(),None)
                try:
                    username = valParser.get("username")
                    database_name = valParser.get("databaseName")
                    password = valParser.get("password")
                    host = valParser.get("host", "127.0.0.1")
                    port = valParser.get("port")
                    
                    _param_string = "host='{host}' port='{port}' dbname='{dbname}' user='{user}' password='{password}' sslmode='prefer'".format(
                                    host=host,
                                    port=port,
                                    dbname=database_name,
                                    user=username,
                                    password=password
                                )
                    try:
                        self._conn = psycopg2.connect(_param_string)
                        self._conn.autocommit = autocommit
                        # self._curs = self._conn.cursor()
                        self.status = {"status":True, "msg":"Koneksi Database Postgres Berhasil","errorcode":"00"}
                    except psycopg2.Error as e:
                        Log.error(message=e)
                        self.status = {"status": False, "msg": "Koneksi Database Error, Terdapat kesalahan Koneksi","errorcode":"01"}
                except Exception as e:
                    Log.error(message=e)
                    self.status = {"status": False, "msg": "Error Konfigurasi Database","errorcode":"02"}
            else :
                Log.error(message = "File Not Found")
                self.status = {"status": False, "msg": "File Not Found","errorcode":"03"}
        except Exception as e:
            Log.error(message=e)
            self.status = {"status": False, "msg": "Error database init konfigurasi","errorcode":"04"}

    def select(self, select_string):
        """
            Fungsi ini digunakan untuk select query yang tidak membutuhkan parameter
            @param select_string: Merupakan statement query yang dipakai
            @return: status = nilai boolean (True = berhasil, False = gagal)
                    data = Hasil select statement
                    msg = message informasi
                    notice = return message dari procedure database
                    rowcount = jumlah baris
                    errorcode = code error dari postgres
                    errormsg = msg error yang dapat ditampilkan ke user/client
            @rtype: dict
        """
        result = {"status":False,"data":"","msg":"","notices":"","rowcount":"","errorcode":"","errormsg":""}
        if self.status["status"] :
            try:
                curs = self._conn.cursor()
                curs.execute(select_string)
                data = curs.fetchall()
                result['data'] = checkTypeDatas(data)
                result["notices"] = self._conn.notices
                result["rowcount"] = curs.rowcount
                result["status"] = True
                result["msg"] = "select statement berhasil"
                result["errorcode"] = "0"
                curs.close()
            except Exception as e :
                curs.execute("rollback")
                nilai = "Log Error PGCode : %s - query: %s - PGError : %s " % (e.pgcode, select_string, e.pgerror)
                msgerror = e.pgerror
                Log.error(message=nilai)
                result["errorcode"] = e.pgcode
                result["msg"] = msgerror
                result["errormsg"] = msgerror.split("\n")[0]
                curs.close()
            return result
        else :
            return self.status

    def selectData(self, select_string, param, rownum="ALL"):
        """
            Fungsi ini digunakan untuk select query yang membutuhkan parameter
            @param select_string: Merupakan statement query yang dipakai
            @param param: Merupakan inputan parameter yang dibutuhkan
            @param rownum: jumlah baris yang akan dipilih
            @return: status = nilai boolean (True = berhasil, False = gagal)
                    data = Hasil select statement
                    msg = message informasi
                    notice = return message dari procedure database
                    rowcount = jumlah baris
                    errorcode = code error dari postgres
                    errormsg = msg error yang dapat ditampilkan ke user/client
            @rtype: dict
        """
        result = {"status":False,"data":"","msg":"","notices":"","rowcount":"","errorcode":"","errormsg":""}
        if self.status["status"]:
            try:
                curs = self._conn.cursor()
                curs.execute(select_string, param)
                if rownum == "ALL":
                    data = curs.fetchall()
                else:
                    data = curs.fetchmany(int(rownum))
                result["data"] = checkTypeDatas(data)
                result["notices"] = self._conn.notices
                result["rowcount"] = curs.rowcount
                result["status"] = True
                result["msg"] = "select statement berhasil"
                result["errorcode"] = "0"
                curs.close()
            except Exception as e :
                curs.execute("rollback")
                nilai = "Log Error PGCode : %s - query: %s - PGError : %s " % (e.pgcode, select_string, e.pgerror)
                msgerror = e.pgerror
                Log.error(message=nilai)
                result["errorcode"] = e.pgcode
                result["msg"] = msgerror
                result["errormsg"] = msgerror.split("\n")[0]
                curs.close()
            return result
        else :
            return self.status

    def selectHeader(self, select_string):
        """
            Fungsi ini digunakan untuk select query yang tidak membutuhkan parameter dan membutuhkan header
            @param select_string: Merupakan statement query yang dipakai
            @return: status = nilai boolean (True = berhasil, False = gagal)
                    data = Hasil select statement
                    msg = message informasi
                    notice = return message dari procedure database
                    rowcount = jumlah baris
                    errorcode = code error dari postgres
                    errormsg = msg error yang dapat ditampilkan ke user/client
            @rtype: dict
        """
        result = {"status":False,"data":"","msg":"","notices":"","rowcount":"","errorcode":"","errormsg":""}
        data = []
        if self.status["status"]:
            try:
                curs = self._conn.cursor()
                curs.execute(select_string)
                header = []
                for col in curs.description:
                    header.append(col[0])
                dataTemp = curs.fetchall()
                dataTemp = checkTypeDatas(dataTemp)
                data.append(header)
                data.append(dataTemp)
                result["data"] = data
                result["notices"] = self._conn.notices
                result["rowcount"] = curs.rowcount
                result["status"] = True
                result["msg"] = "select statement berhasil"
                result["errorcode"] = "0"
                curs.close()
            except Exception as e :
                curs.execute("rollback")
                nilai = "Log Error PGCode : %s - query: %s - PGError : %s " % (e.pgcode, select_string, e.pgerror)
                msgerror = e.pgerror
                Log.error(message=nilai)
                result["errorcode"] = e.pgcode
                result["msg"] = msgerror
                result["errormsg"] = msgerror.split("\n")[0]
                curs.close()
            return result
        else :
            return self.status

    def selectDataHeader(self, select_string, param):
        """
            Fungsi ini digunakan untuk select query yang membutuhkan parameter dan membutuhkan header
            @param select_string: Merupakan statement query yang dipakai
            @param param: Merupakan inputan parameter yang dibutuhkan
            @return: status = nilai boolean (True = berhasil, False = gagal)
                    data = Hasil select statement
                    msg = message informasi
                    notice = return message dari procedure database
                    rowcount = jumlah baris
                    errorcode = code error dari postgres
                    errormsg = msg error yang dapat ditampilkan ke user/client
            @rtype: dict
        """
        result = {"status":False,"data":"","msg":"","notices":"","rowcount":"","errorcode":"","errormsg":""}
        data = []
        if self.status["status"]:
            try:
                curs = self._conn.cursor()
                curs.execute(select_string, param)
                header = []
                for col in curs.description:
                    header.append(col[0])
                dataTemp = curs.fetchall()
                dataTemp = checkTypeDatas(dataTemp)
                data.append(header)
                data.append(dataTemp)
                result['data'] = data
                result["notices"] = self._conn.notices
                result["rowcount"] = curs.rowcount
                result["status"] = True
                result["msg"] = "select statement berhasil"
                result["errorcode"] = "0"
                curs.close()
            except Exception as e :
                curs.execute("rollback")
                nilai = f"Log Error SelectDataHeader {e}"
                if hasattr(e, 'pgcode'):
                    nilai = "Log Error PGCode : %s - query: %s - PGError : %s " % (e.pgcode, select_string, e.pgerror)
                    result["errorcode"] = e.pgcode
                if hasattr(e, 'pgerror'):
                    msgerror = e.pgerror
                    result["msg"] = msgerror
                    result["errormsg"] = msgerror
                Log.error(message=nilai)
                curs.close()
                # result["errormsg"] = msgerror.split("\n")[0]

            return result
        else :
            return self.status

    def close(self):
        """
            Fungsi ini digunakan menutup koneksi
            @return: status = nilai boolean (True = berhasil, False = gagal)
                    data = Hasil select statement
                    msg = message informasi
                    notice = return message dari procedure database
                    rowcount = jumlah baris
                    errorcode = code error dari postgres
                    errormsg = msg error yang dapat ditampilkan ke user/client
            @rtype: dict
        """
        result = {"status":False,"data":"","msg":"","notices":"","rowcount":"","errorcode":"","errormsg":""}
        if self.status["status"]:
            try:
                self._conn.close()
                result["status"] = True
                result["msg"] = "Berhasil Menutup Koneksi"
                result["errorcode"] = "0"
            except Exception as e :
                nilai = "Log Error PGCode : %s - query: %s - PGError : %s " % (e.pgcode, "Delete Connection", e.pgerror)
                msgerror = e.pgerror
                Log.error(message=nilai)
                result["errorcode"] = e.pgcode
                result["msg"] = msgerror
                result["errormsg"] = msgerror.split("\n")[0]
            return result

    def __delete__(self):
        self.close()


class DictParserCFG() :
    def __init__(self):
        self.__dict = {}

    def _main(self,param):
        try :
            with open(f"{os.getcwd()}/config/Connection2.cfg", "r") as stream:
                line = stream.read()
            listLine = line.split("\n")
            for val in listLine :
                valDB = decoder(val.split(" "))
                if valDB[0].upper() == param.upper() :
                    dictValDB = self.__split(valDB)
                    self.__dict[valDB.pop(0).upper()] = dictValDB
                    return True,self.__dict
            return False, self.__dict
        except :
            return False,self.__dict

    def __split(self,param):
        databaseAlias, databaseName, host, username, password, port, schema = param
        if os.environ.get("GAE_ENV") == "standard" or os.environ.get("CLOUD_APPS") == "CLOUD_RUN":
            if ":" in host :
                host = "/cloudsql/{instance}".format(instance=host)
        return {
            "databaseName": databaseName.lower(),
            "host": host,
            "username": username.lower(),
            "password": password,
            "port": port,
            "schema": schema.lower()
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

