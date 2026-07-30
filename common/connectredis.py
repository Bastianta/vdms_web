"""
Update : 2023-10-17
satconnectredis untuk exec
Version : 1.0.0
Requirements :
 Standard Lib : satlog
 Library : redis
Configuration:
 globalVar:
  HOST_REDIS          : string IP/Host redis
  PORT_REDIS          : int port redis
  PASSWORD_REDIS      : string password redis
  SSL_REDIS           : boolean apakah redis menggunakan ssl atau tidak
  SSL_CA_CERTS_REDIS  : string path ke file .pem / .crt
"""
class DatabaseRedis:

    def hgetall(self, field, db=0):
        """
        """
        success = False
        result = None
        try:
            conn = redis.StrictRedis(host=globalVar.HOST_REDIS, port=globalVar.PORT_REDIS, password=globalVar.PASSWORD_REDIS, db=db)
            result = conn.hgetall(field)
            success = True
        except redis.exceptions.RedisError as err:
            Log.error(f' GAGAL GET | {field} | {err}')
        return success, result

    def hset(self, field, key, value, db=0):
        """
        """
        success = False
        result = None
        try:
            conn = redis.StrictRedis(host=globalVar.HOST_REDIS, port=globalVar.PORT_REDIS, password=globalVar.PASSWORD_REDIS, db=db)
            result = conn.hset(field, key, value)
            conn.expire(field, globalVar.TIME_EXPIRED_REDIS)
            success = True
        except redis.exceptions.RedisError as err:
            Log.error(f' GAGAL HSET | {field} | {key} | {value} | {err}')
        return success, result

    def hget(self, field, key, db=0):
        """
        """
        success = False
        result = None
        try:
            conn = redis.StrictRedis(host=globalVar.HOST_REDIS, port=globalVar.PORT_REDIS, password=globalVar.PASSWORD_REDIS, db=db)
            result = conn.hget(field, key)
            success = True
        except redis.exceptions.RedisError as err:
            Log.error(f' GAGAL HGET | {field} | {key} | {err}')
        return success, result

    def set(self, key, value, db=0):
        """
        """
        success = False
        result = None
        try:
            conn = redis.StrictRedis(host=globalVar.HOST_REDIS, port=globalVar.PORT_REDIS, password=globalVar.PASSWORD_REDIS, db=db)
            result = conn.set(key, value)
            conn.expire(key, globalVar.TIME_EXPIRED_REDIS)
            success = True
        except redis.exceptions.RedisError as err:
            Log.error(f' GAGAL SET | {key} | {value} | {err}')
        return success, result

    def get(self, key, db=0):
        """
        """
        success = False
        result = None
        try:
            conn = redis.StrictRedis(host=globalVar.HOST_REDIS, port=globalVar.PORT_REDIS, password=globalVar.PASSWORD_REDIS, db=db)
            result = conn.get(key)
            success = True
        except redis.exceptions.RedisError as err:
            Log.error(f' GAGAL GET | {key} | {err}')
        return success, result

    def exists(self, key, db=0):
        """
        Output :
            * 1 = ada
            * 0 = tidak ada
        """
        success = False
        result = None
        try:
            conn = redis.StrictRedis(host=globalVar.HOST_REDIS, port=globalVar.PORT_REDIS, password=globalVar.PASSWORD_REDIS, db=db)
            result = conn.exists(key)
            success = True
        except redis.exceptions.RedisError as err:
            Log.error(f' GAGAL EXISTS | {key} | {err}')
        return success, result

    def delete(self, key, db=0):
        """
        """
        success = False
        result = None
        try:
            conn = redis.StrictRedis(host=globalVar.HOST_REDIS, port=globalVar.PORT_REDIS, password=globalVar.PASSWORD_REDIS, db=db)
            result = conn.delete(key)
            success = True
        except redis.exceptions.RedisError as err:
            Log.error(f' GAGAL DELETE | {key} | {err}')
        return success, result

    def expire(self, key, db=0):
        """
        """
        success = False
        result = None
        try:
            conn = redis.StrictRedis(host=globalVar.HOST_REDIS, port=globalVar.PORT_REDIS, password=globalVar.PASSWORD_REDIS, db=db)
            result = conn.expire(key, globalVar.TIME_EXPIRED_REDIS)
            success = True
        except redis.exceptions.RedisError as err:
            Log.error(f' GAGAL EXPIRE | {key} | {err}')
        return success, result

class RedisConnectionPool(DatabaseRedis):
    _instance = None
    
    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(RedisConnectionPool, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self, db:int=0, useConnectionPool:bool=False):
        if self._initialized:
            return
        self.__pool = None
        self.useConnectionPool = useConnectionPool
        if useConnectionPool:
            self.__pool = redis.ConnectionPool(host=globalVar.HOST_REDIS, port=globalVar.PORT_REDIS, db=db, max_connections=10)
        
        self.__conn = redis.StrictRedis(
            host=globalVar.HOST_REDIS, 
            port=globalVar.PORT_REDIS, 
            password=globalVar.PASSWORD_REDIS, 
            ssl=globalVar.SSL_REDIS,
            ssl_ca_certs=globalVar.SSL_CA_CERTS_REDIS,
            db=db,
            connection_pool=self.__pool
        )
        self._initialized = True
        import random
        self.random = random.randint(1000, 100000)

    def checkConnection(self):
        """
            Fungsi untuk cek koneksi ke database redis

            return status keberhasilan mengecek koneksi
                - True, jika berhasil
                - False, jika gagal

            return pesan keberhasilan koneksi ke redis
                - Success to connect, jika berhasil
                - Failed to connect, jika gagal

            :return: status keberhasilan mengecek koneksi, pesan keberhasilan koneksi ke redis
            :rtype: tuple(bool, str)
        """
        success = False
        result = "Failed to connect"
        try:
            success = self.__conn.ping()
            result = "Success to connect"
        except Exception as e:
            Log.error(f'GAGAL CEK KONEKSI | {e}')
        return success, result

    def hgetall(self, field):
        """
            Fungsi untuk mengambil semua key dan valuenya dari sebuah map (field).

            return status keberhasilan mengambil field
                - True, jika berhasil
                - False, jika gagal

            return dictionary data dengan key dan value yang masing-masing berupa byte
                {
                    b'key1': b'value1', 
                    b'key2': b'value2'
                }

            :param field: string/bytes nama field yang mau diambil semua key dan valuenya
            :type field: str | bytes

            :return: status keberhasilan mengambil field, dictionary data dengan key dan value yang masing-masing berupa byte
            :rtype: tuple(bool, dict)
        """
        success = False
        result = None

        statusConnection = self.checkConnection()[0]
        if statusConnection:
            try:
                result = self.__conn.hgetall(field)
                success = True
            except redis.exceptions.RedisError as err:
                Log.error(f' GAGAL HGETALL | {field} | {err}')
        else:
            Log.error(f'GAGAL HGETALL KARENA KONEKSI')
        return success, result

    def hset(self, field, key, value):
        """
            Fungsi untuk mengisi sebuah map (field) dengan key dan value.

            return status keberhasilan mengisi field
                - True, jika berhasil
                - False, jika gagal

            return integer yang merepresentasikan status keberhasilan mengisi field
                - 1, jika berhasil
                - 0, jika gagal

            :param field: string/bytes nama field yang mau diset key dan valuenya
            :param key: string/bytes nama key yang mau diset
            :param value: string/bytes/float/integer value yang mau diset
            :type field: str | bytes
            :type key: str | bytes
            :type value: bytes | float | int | str

            :return: status keberhasilan mengisi field, integer yang merepresentasikan status keberhasilan mengisi field
            :rtype: tuple(bool, int)
        """
        success = False
        result = None

        try:
            result = self.__conn.hset(field, key, value)
            self.__conn.expire(field, globalVar.TIME_EXPIRED_REDIS)
            success = True
        except redis.exceptions.RedisError as err:
            Log.error(f' GAGAL HSET | {field} | {key} | {value} | {err}')
        return success, result

    def hget(self, field, key):
        """
        """
        success = False
        result = None
        try:
            result = self.__conn.hget(field, key)
            success = True
        except redis.exceptions.RedisError as err:
            Log.error(f' GAGAL HGET | {field} | {key} | {err}')
        return success, result

    def set(self, key, value):
        """
            Fungsi untuk menambahkan data dengan format key dan value

            return status keberhasilan set data

            return

            :param key:
            :param value:
            :type key: str
            :type value: str
        """
        success = False
        result = None
        try:
            
            result = self.__conn.set(key, value)
            self.__conn.expire(key, globalVar.TIME_EXPIRED_REDIS)
            success = True
        except redis.exceptions.RedisError as err:
            Log.error(f' GAGAL SET | {key} | {value} | {err}')
        return success, result

    def get(self, key):
        """
        """
        success = False
        result = None
        try:
            result = self.__conn.get(key)
            success = True
        except redis.exceptions.RedisError as err:
            Log.error(f' GAGAL GET | {key} | {err}')
        return success, result

    def exists(self, key):
        """
        Output :
            * 1 = ada
            * 0 = tidak ada
        """
        success = False
        result = None
        try:
            result = self.__conn.exists(key)
            success = True
        except redis.exceptions.RedisError as err:
            Log.error(f' GAGAL EXISTS | {key} | {err}')
        return success, result

    def delete(self, key):
        """
        """
        success = False
        result = None
        try:
            result = self.__conn.delete(key)
            success = True
        except redis.exceptions.RedisError as err:
            Log.error(f' GAGAL DELETE | {key} | {err}')
        return success, result

    def expire(self, key):
        """
        """
        success = False
        result = None
        try:
            result = self.__conn.expire(key, globalVar.TIME_EXPIRED_REDIS)
            success = True
        except redis.exceptions.RedisError as err:
            Log.error(f' GAGAL EXPIRE | {key} | {err}')
        return success, result
