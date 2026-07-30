"""
Update : 2022-10-07
Library untuk request/menerima response memakai encapsulate
Library : satgetdatetime, satLog
"""
import base64
import binascii
import bz2
import copy
import hashlib
import json
import traceback
import requests
import sys
from flask import jsonify


Log = Logger()

if globalVar.LOGIN.upper() == "WEB":
    globalVar.BASE64 = "Y"

class Signature:

    @staticmethod
    def get(appId):
        """
        Fungsi untuk mendapatkan signature key sesuai app id yang dimasukkan

        :param appId: id aplikasi
        :type appId: str
        :return: string value dari __list
        :rtype: str
        """
        return Signature.__list.get(appId,"")

    __list = {
        "asl": "lldwsA92dU1RDjGV7bFDM9kX3Y",
        "lo-stag" :  "SadLiH0CbaD4JVCnR6zIVBsCaNbbRXngtwHZRVO3tuJzRVD5dD7bBzuhUZY3wyRo",
        "sat-file-manager" :  "qzG7BM0ghuKaO2hbtJEyhTiR3SnWToN190GCuIZ3uroziiiwTGXK9ITM1X2TcnHK",
    }

class Saltedhash() :

    def mergeTwoDicts(self,data1, data2):
        result = data1.copy()
        result.update(data2)
        return result

    def stringify(self,data):
        """
        terdapat json.dumps agar saltedhash ini bisa digunakan untuk mobile
        """
        return json.dumps(data, sort_keys=True)

    def toObject(self,string):
        return json.loads(string)

    def changeDictToSortedlist(self,dictData):
        listResult = list()
        listKey = sorted(dictData.keys())
        for key in listKey:
            listResult.append(key)
            value = dictData.get(key)
            listResult.append(value)
        return listResult

    """
    string -> md5
    1. hashlib.md5() butuh parameter bertipe data bytes
    2. string ke bytes menggunakan encode("utf-8")
    3. return haslib.md5() masih berupa objek hash, perlu diubah ke string agar bisa digunakan
        dalam concatenation
    4. objek hash ke string menggunakan hexdigest()
    contoh : - hashlib.md5("kalimat".encode("utf-8")) 
                return hash >> <md5 _hashlib.HASH object @ 0x000001FA32091A50>
             - hashlib.md5("kalimat".encode("utf-8")).hexdigest() 
                return string >> "33f00a51fd62aea8b050a910d8fffcd6"             

    string -> bz2
    1. bz2.compress() butuh parameter bertipe data bytes
    2. string ke bytes menggunakan encode("utf-8")
    3. return bz2.compress() masih berupa data bertipe bytes, perlu diubah ke string 
        agar bisa digunakan dalam concatenation
    4. bytes ke string menggunakan decode("latin_1")
    contoh : - bz2.compress("kalimat".encode("utf-8"))
                return bytes >> b"BZh91AY&SY....."
             - bz2.compress("kalimat".encode("utf-8")).decode("latin_1")
                return string >> "BZh91AY&SY..."

    string -> base64
    1. base64.urlsafe_b64encode() butuh parameter bertipe data bytes
    2. string ke bytes menggunakan encode("utf-8")
    3. return base64.urlsafe_b64encode() masih berupa data bertipe bytes, perlu diubah ke string
        agar bisa digunakan dalam concatenation
    4. bytes ke string menggunakan decode("utf-8")
    contoh : - base64.urlsafe_b64encode("kalimat".encode("utf-8"))
                return bytes >> b"a2FsaW1hdA=="
             - base64.urlsafe_b64encode("kalimat".encode("utf-8")).decode("utf-8")
                return string >> "a2FsaW1hdA=="
    """

    def create(self,appId, dictData):
        signatureKey = globalVar.SIGNATURE_KEY
        if signatureKey == "" and appId != "" and appId is not None:
            Log.warning("APP ID TIDAK TERDAFTAR")
            return {"data": ""}
        datetimeNow = getDateTimeNow().strftime("%Y%m%d%H%M%S%f")
        result = dictData
        if globalVar.MD5.upper() == "Y":
            try:
                md5Formula = signatureKey + appId + datetimeNow + self.stringify(self.changeDictToSortedlist(result))
                md5Result = hashlib.md5(md5Formula.encode("utf-8")).hexdigest()
                result = self.mergeTwoDicts({
                    "appId": appId,
                    "datetime": datetimeNow,
                    "saltedHash": md5Result,
                }, dictData)
            except Exception as e:
                Log.error(f"CREATE MD5 GAGAL | {traceback.format_exc()} | {e}")
                return {"data": ""}

        else:
            result.update({
                "appId": appId,
                "datetime": datetimeNow
            })

        if globalVar.BZ2.upper() == "Y":
            try:
                bz2Result = self.stringify(result).encode("utf-8")
                bz2Result = bz2.compress(bz2Result)
                result = bz2Result
            except Exception as e:
                Log.error(f"CREATE BZ2 GAGAL | {traceback.format_exc()} | {e}")
                return {"data": ""}

            if globalVar.BASE64.upper() == "Y":
                try:
                    base64Result = base64.urlsafe_b64encode(result)
                    result = base64Result.decode("utf-8")
                    return {"data": result}
                except Exception as e:
                    Log.error(f"CREATE BASE64 GAGAL | {traceback.format_exc()} | {e}")
                    return {"data": ""}

            else:
                result = result.decode("latin_1")
                return {"data": result}
        else:
            if globalVar.BASE64.upper() == "Y":
                try:
                    base64Result = self.stringify(result).encode("utf-8")
                    base64Result = base64.urlsafe_b64encode(base64Result)
                    result = base64Result.decode("utf-8")
                    return {"data": result}
                except Exception as e:
                    Log.error(f"CREATE BASE64 GAGAL | {traceback.format_exc()} | {e}")
                    return {"data": ""}

            else:
                return result

    """
    base64 -> string
    1. base64.urlsafe_b64decode() menerima parameter bertipe data bytes/string yang menggunakan
        URL-safe base-64 alphabet
    2. return base64.urlsafe_b64decode() berupa tipe data bytes, perlu menggunakan decode("utf-8")
        agar bisa digunakan dalam concatenation
    contoh : - base64.urlsafe_b64decode("a2FsaW1hdA==")
                return bytes >> b"kalimat"
             - base64.urlsafe_b64decode(b"a2FsaW1hdA==").decode("utf-8")
                return string >> "kalimat"

    bz2 -> string
    1. bz2.decompress() menerima parameter bertipe data bytes
    2. return bz2.decompress() berupa tipe data bytes, perlu menggunakan decode("utf-8")
        agar bisa digunakan dalam concatenation
    contoh : - bz2.decompress(b"BZh91AY&SY\\\xba\x00\xda\x00\x00\x01\x81\x80 .\x04\x00 \x000\xc0\x08cC\nU\x85\xdc\x91N\x14$\x17.\x806\x80")
                return bytes >> b"kalimat"
             - bz2.decompress(b"BZh91AY&SY\\\xba\x00\xda\x00\x00\x01\x81\x80 .\x04\x00 \x000\xc0\x08cC\nU\x85\xdc\x91N\x14$\x17.\x806\x80").decode("utf-8")
                return string >> "kalimat"
    """

    def check(self,dictData):
        dictData = copy.deepcopy(dictData)
        try:
            stringData = dictData.get("data")
        except AttributeError as error:
            Log.error(f"TIPE DATA TIDAK SESUAI | {traceback.format_exc()} | {error}")
            return False, {}
        except Exception as exception:
            Log.error(f"TIPE DATA TIDAK SESUAI | {traceback.format_exc()} | {exception}")
            return False, {}
        if stringData is None:
            if globalVar.MD5.upper() == "Y":
                try:
                    dictDataTemp = copy.deepcopy(dictData)
                    dataAppId = dictData.pop("appId", "")
                    dataSaltedHash = dictData.pop("saltedHash", "")
                    dataDatetime = dictData.pop("datetime", "")
                    signatureKey = Signature.get(dataAppId)
                    if signatureKey == "" and dataAppId != "" and dataAppId is not None:
                        if globalVar.APP_ID == dataAppId:
                            signatureKey = globalVar.SIGNATURE_KEY
                        if signatureKey == "" and dataAppId != "" and dataAppId is not None:
                            Log.warning("APP ID TIDAK TERDAFTAR")
                            return False, {}
                    md5Formula = signatureKey + dataAppId + dataDatetime + self.stringify(self.changeDictToSortedlist(dictData))
                    md5Result = hashlib.md5(md5Formula.encode("utf-8")).hexdigest()
                    if dataSaltedHash == md5Result:
                        return True, dictDataTemp
                    else:
                        return False, {}
                except KeyError as keyErr:
                    Log.error(f"CHECK MD5 GAGAL | {traceback.format_exc()} | {keyErr}")
                    return False, {}
                except Exception as e:
                    Log.error(f"CHECK MD5 GAGAL | {traceback.format_exc()} | {e}")
                    return False, {}
            else:
                return True, dictData
        elif stringData == "":
            Log.error("CHECK GAGAL KARENA VALUE KOSONG")
            return False, {}
        else:
            if globalVar.BASE64.upper() == "Y":
                try:
                    base64Result = base64.urlsafe_b64decode(stringData)
                except binascii.Error as binasciiErr:
                    Log.error(f"CHECK BASE64 GAGAL | {traceback.format_exc()} | {binasciiErr}")
                    return False, {}
                except Exception as e:
                    Log.error(f"CHECK BASE64 GAGAL | {traceback.format_exc()} | {e}")
                    return False, {}

                if globalVar.BZ2.upper() == "Y":
                    try:
                        bz2Result = bz2.decompress(base64Result)
                        bz2Result = bz2Result.decode("utf-8")
                        dictData = self.toObject(bz2Result)
                    except OSError as osErr:
                        Log.error(f"CHECK BZ2 DECOMPRESS GAGAL | {traceback.format_exc()} | {osErr}")
                        return False, {}
                    except AttributeError as attErr:
                        Log.error(f"CHECK BZ2 DECOMPRESS GAGAL | {traceback.format_exc()} | {attErr}")
                        return False, {}
                    except Exception as e:
                        Log.error(f"CHECK BZ2 DECOMPRESS GAGAL | {traceback.format_exc()} | {e}")
                        return False, {}

                    if globalVar.MD5.upper() == "Y":
                        try:
                            dictDataTemp = copy.deepcopy(dictData)
                            dataAppId = dictData.pop("appId")
                            dataSaltedHash = dictData.pop("saltedHash")
                            dataDatetime = dictData.pop("datetime")
                            signatureKey = Signature.get(dataAppId)
                            if signatureKey == "" and dataAppId != "" and dataAppId is not None:
                                if globalVar.APP_ID == dataAppId:
                                    signatureKey = globalVar.SIGNATURE_KEY
                                if signatureKey == "" and dataAppId != "" and dataAppId is not None:
                                    Log.warning("APP ID TIDAK TERDAFTAR")
                                    return False, {}
                            md5Formula = signatureKey + dataAppId + dataDatetime + self.stringify(
                                self.changeDictToSortedlist(dictData))
                            md5Result = hashlib.md5(md5Formula.encode("utf-8")).hexdigest()
                            if dataSaltedHash == md5Result:
                                return True, dictDataTemp
                            else:
                                return False, {}
                        except KeyError as keyErr:
                            Log.error(f"CHECK MD5 GAGAL | {traceback.format_exc()} | {keyErr}")
                            return False, {}
                        except Exception as e:
                            Log.error(f"CHECK MD5 GAGAL | {traceback.format_exc()} | {e}")
                            return False, {}
                    else:
                        return True, dictData
                else:
                    try:
                        base64Result = base64Result.decode("utf-8")
                        dictData = self.toObject(base64Result)
                    except binascii.Error as binasciiErr:
                        Log.error(f"CHECK BASE64 GAGAL | {traceback.format_exc()} | {binasciiErr}")
                        return False, {}
                    except Exception as e:
                        Log.error(f"CHECK BASE64 GAGAL | {traceback.format_exc()} | {e}")
                        return False, {}

                    if globalVar.MD5.upper() == "Y":
                        try:
                            dictDataTemp = copy.deepcopy(dictData)
                            dataAppId = dictData.pop("appId", "")
                            dataSaltedHash = dictData.pop("saltedHash", "")
                            dataDatetime = dictData.pop("datetime", "")
                            signatureKey = Signature.get(dataAppId)
                            if signatureKey == "" and dataAppId != "" and dataAppId is not None:
                                if globalVar.APP_ID == dataAppId:
                                    signatureKey = globalVar.SIGNATURE_KEY
                                if signatureKey == "" and dataAppId != "" and dataAppId is not None:
                                    Log.warning("APP ID TIDAK TERDAFTAR")
                                    return False, {}
                            md5Formula = signatureKey + dataAppId + dataDatetime + self.stringify(
                                self.changeDictToSortedlist(dictData))
                            md5Result = hashlib.md5(md5Formula.encode("utf-8")).hexdigest()
                            if dataSaltedHash == md5Result:
                                return True, dictDataTemp
                            else:
                                return False, {}
                        except KeyError as keyErr:
                            Log.error(f"CHECK MD5 GAGAL | {traceback.format_exc()} | {keyErr}")
                            return False, {}
                        except Exception as e:
                            Log.error(f"CHECK MD5 GAGAL | {traceback.format_exc()} | {e}")
                            return False, {}
                    else:
                        return True, dictData
            else:
                if globalVar.BZ2.upper() == "Y":
                    try:
                        bz2Result = stringData.encode("latin_1")
                        bz2Result = bz2.decompress(bz2Result)
                        bz2Result = bz2Result.decode("utf-8")
                        dictData = self.toObject(bz2Result)
                    except OSError as osErr:
                        Log.error(f"CHECK BZ2 GAGAL | {traceback.format_exc()} | {osErr}")
                        return False, {}
                    except AttributeError as attErr:
                        Log.error(f"CHECK BZ2 GAGAL | {traceback.format_exc()} | {attErr}")
                        return False, {}
                    except Exception as e:
                        Log.error(f"CHECK BZ2 GAGAL | {traceback.format_exc()} | {e}")
                        return False, {}

                    if globalVar.MD5.upper() == "Y":
                        try:
                            dictDataTemp = copy.deepcopy(dictData)
                            dataAppId = dictData.pop("appId", "")
                            dataSaltedHash = dictData.pop("saltedHash", "")
                            dataDatetime = dictData.pop("datetime", "")
                            signatureKey = Signature.get(dataAppId)
                            if signatureKey == "" and dataAppId != "" and dataAppId is not None:
                                if globalVar.APP_ID == dataAppId:
                                    signatureKey = globalVar.SIGNATURE_KEY
                                if signatureKey == "" and dataAppId != "" and dataAppId is not None:
                                    Log.warning("APP ID TIDAK TERDAFTAR")
                                    return False, {}
                            md5Formula = signatureKey + dataAppId + dataDatetime + self.stringify(
                                self.changeDictToSortedlist(dictData))
                            md5Result = hashlib.md5(md5Formula.encode("utf-8")).hexdigest()
                            if dataSaltedHash == md5Result:
                                return True, dictDataTemp
                            else:
                                return False, {}
                        except KeyError as keyErr:
                            Log.error(f"CHECK MD5 GAGAL | {traceback.format_exc()} | {keyErr}")
                            return False, {}
                        except Exception as e:
                            Log.error(f"CHECK MD5 GAGAL | {traceback.format_exc()} | {e}")
                            return False, {}
                    else:
                        return True, dictData
                else:
                    return True, dictData

# __all__ = ["ClientResponse"]

saltedhash = Saltedhash()

class ClientResponse:
    """
    Class ini digunakan untuk menerima umpan balik
    dari HTTP server ke client
    """

    def __init__(self, code=None, headers=None, text=None, success=False, error=None, json = None):
        """
        Inisialisasi atribut-atribut yang dikembalikan dari
        class :class:`common.saturl.client.request.Request`
        untuk kemudian diolah menjadi tipe data string ataupun JSON

        :param code: HTTP status code yang diterima setelah melakukan request
        :param headers: HTTP headers yang diterima setelah melakukan request
        :param text: data umpan balik bertipe string yang
            dikembalikan oleh class :class:`common.saturl.client.request.Request`
        :param error: pesan kesalahan bertipe string yang
            dikembalikan oleh class :class:`common.saturl.client.request.Request`
        :type code: int
        :type headers: dict
        :type text: str
        :type error: str
        """

        if headers is None:
            headers = {}
        self.__code = code
        self.__headers = headers
        self.__text = text
        self.__success = success
        self.__error = error
        self.__json = json

    @property
    def code(self):
        """
        Property yang digunakan untuk mendapatkan HTTP status coded
        yang diterima setelah melakukan request

        :return: HTTP status code yang diterima setelah melakukan request
        :rtype: int
        """

        return self.__code

    @property
    def headers(self):
        """
        Property yang digunakan untuk mendapatkan HTTP headers
        yang diterima setelah melakukan request

        :return: HTTP headers yang diterima setelah melakukan request
        :rtype: dict
        """

        return self.__headers

    @property
    def text(self):
        """
        Property yang digunakan untuk mendapatkan data bertipe
        string yang dikembalikan oleh class :class:`common.saturl.client.request.Request`

        :return: data umpan balik bertipe string yang
            dikembalikan oleh class :class:`common.saturl.client.request.Request`
        :rtype: str
        """

        return self.__text

    @property
    def success(self):
        """
        Property yang digunakan untuk mendapatkan status sukses
        bertipe boolean yang dikembalikan oleh class :class:`common.saturl.client.request.Request`

        :return: status error bertipe boolean yang
            dikembalikan oleh class :class:`common.saturl.client.request.Request`
        :rtype: bool
        """

        return self.__success

    @property
    def error(self):
        """
        Property yang digunakan untuk mendapatkan pesan kesalahan
        bertipe string yang dikembalikan oleh class :class:`common.saturl.client.request.Request`

        :return: pesan kesalahan bertipe string yang
            dikembalikan oleh class :class:`common.saturl.client.request.Request`
        :rtype: str
        """

        return self.__error

    def json(self):
        """
        Fungsi yang digunakan untuk mendapatkan data bertipe
        JSON yang dikembalikan oleh class :class:`common.saturl.client.request.Request`.
        Balikan bertipe tuple yang memiliki 3 elemen antara lain:

          status:
            - True: tidak ada error
            - False: terdapat error
          code:
            - 00: sukses
            - 01: gagal decompress
            - 02: saltedhash tidak valid
          result:
            data umpan balik bertipe JSON

        :return: status, code & result
        :rtype: tuple[bool, str, dict]
        """

        status = False
        code = "02"
        result = self.__json
        try:
            checkStatus, result = saltedhash.check(result)
            if checkStatus:
                status = True
                code = "00"
        except (OSError, SyntaxError, TypeError, ValueError, binascii.Error):
            status = False
            code = "01"
        return status, code, result

# __all__ = ["ClientRequest"]

class ClientRequest:
    """
    Class ini digunakan untuk melakukan request ke server HTTP
    dengan pilihan method yang telah disediakan
    """

    @staticmethod
    def post(url=None, headers=None, data=None, appId=None):
        """
        Fungsi yang digunakan untuk melakukan request ke HTPP server
        menggunakan method POST

        :param url: alamat URL yang digunakan untuk melakukan request
        :param headers: HTTP headers yang dikirimkan saat melakukan request
        :param data: data yang dikirimkan (harus bertipe application/x-www-form-urlencoded)
        :param appId: identitas aplikasi yang digunakan untuk enkripsi data
        :return: object dari class :class:`common.saturl.client.response.Response`
        :type url: str
        :type headers: dict
        :type data: dict
        :type appId: str
        :rtype: common.saturl.client.response.ClientResponse
        """

        if headers is None:
            headers = {}
        if data is None:
            data = {}
        try:
            data = saltedhash.create(appId, data)
            response = requests.post(url=url, data=data, headers=headers, timeout=10)
            if sys.version_info.major == 3:
                responseJson = response.json()
            else:
                # jika menggunakan python 2
                responseJson = response.json(cls=CustomDecoder)
            return ClientResponse(
                code=response.status_code,
                headers=dict(response.headers),
                json=responseJson,
                text=response.text,
                success=True)
        except (requests.ConnectionError, requests.exceptions.ReadTimeout) as e:
            return ClientResponse(error=str(e))
        except requests.exceptions.MissingSchema as e:
            return ClientResponse(error=str(e))

class CustomDecoder(json.JSONDecoder):

    def __init__(self, *args, **kwargs):
        json.JSONDecoder.__init__(
            self,
            object_hook=self.custom_object_hook,
            *args,
            **kwargs)

    def custom_object_hook(self, data):
        if isinstance(data, dict):
            encodedData = {}
            for key, value in data.iteritems():
                key = self.custom_object_hook(key)
                value = self.custom_object_hook(value)
                encodedData[key] = value
            return encodedData
        elif isinstance(data, list):
            encodedData = []
            for rawDatum in data:
                encodedDatum = self.custom_object_hook(rawDatum)
                encodedData.append(encodedDatum)
            return encodedData
        elif type(data).__name__ == "unicode":
            encodedData = data.encode("utf-8")
            return encodedData
        else:
            return data

# __all__ = ["ServerResponse"]

class ServerResponse:
    """
    Class ini digunakan untuk mengirim data dari HTTP server ke client
    setelah client melakukan request
    """

    @staticmethod
    def data(appId, data=None):
        """
        Fungsi yang digunakan untuk mengirimkan data bertipe
        string atau JSON dari HTTP server ke client

        :param data: data yang dikirimkan
        :param appId: identitas aplikasi yang digunakan untuk enkripsi data
        :return: data bertipe string jika dikompres atau bertipe JSON jika tidak dikompres
        :type data: dict
        :type appId: str
        :rtype: str, dict
        """

        if data is None:
            data = {}
        result = saltedhash.create(appId, data)
        if type(result) is str:
            return result
        elif type(result) is dict:
            return jsonify(result)

# __all__ = ["ServerRequest"]

class ServerRequest:
    """
    Class ini digunakan untuk menerima HTTP request dari client
    dengan pilihan method yang telah disediakan
    """

    @staticmethod
    def validate(parameters):
        """
        .. _validate:

        Fungsi yang digunakan untuk mendapatkan parameter yang dikirimkan oleh client.
        Balikan bertipe tuple yang memiliki 3 elemen antara lain:

          status:
            - True: tidak ada error
            - False: terdapat error
          code:
            - 00: sukses
            - 01: gagal decompress
            - 02: saltedhash tidak valid
            - 03: saltedhash kedaluwarsa
          result:
            data umpan balik bertipe JSON

        :param parameters: data yang akan di validasi
        :return: status, code & result
        :type parameters: dict
        :rtype: tuple[bool, str, dict]
        """
        status = False
        code = "02"
        result = parameters
        try:
            result = dict(result)
            # tahap validasi data
            # 1.1 Decompress data (encapsulate.py)
            # 1.2 Menerjemahkan saltedhash (saltedhash.py --> check())
            # 1.3 Mencocokkan data (saltedhash.py --> check())
            checkStatus, result = saltedhash.check(result)
            if checkStatus:
                # melakukan pengecekan datetime
                # Melakukan pengecekan selisih waktu request antara client & server
                # original
                currentDatetime = getDateTimeNow()
                dataDatetime = datetime.strptime(result.get("datetime"), "%Y%m%d%H%M%S%f")
                timeDifference = (currentDatetime - dataDatetime).total_seconds()

                if (timeDifference >= globalVar.MINIMAL_TIME_DIFFERENCE) and (globalVar.SALTED_HASH_EXPIRES > timeDifference):
                    status = True
                    code = "00"
                else:
                    status = False
                    code = "03"
                    Log.error(" SALTED HASH EXPIRED ")

        except (OSError, SyntaxError, TypeError, ValueError, binascii.Error) as e:
            status = False
            code = "01"
            Log.error(f" ERROR VALIDASI DATA | {e}")

        # 1.3 status true/false
        # sukses = requestStatus : true, requestCode : 00, requestData : data siap pakai (hasil decompress dan terjemahan dari saltedhash)
        # gagal decompress = status : False, code : 01, data : data yang sudah di-decompress (saltedHash)
        # saltedhash tidak valid = status : False, code : 02, data : data yang belum di-decompress (saltedHash)
        # saltedhash kedaluwarsa = status : False, code : 03, data : data yang belum di-decompress (saltedHash)

        return status, code, result