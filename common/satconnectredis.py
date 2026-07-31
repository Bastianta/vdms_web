class DatabaseRedis:

    def hgetall(self, field, db=0):
        """
        """
        success = False
        result = None
        try:
            conn = redis.StrictRedis(host=globalVar.HOST_REDIS, port=globalVar.PORT_REDIS, password=globalVar.PASSWORD_REDIS, db=db, ssl=globalVar.REDIS_SSL)
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
            conn = redis.StrictRedis(host=globalVar.HOST_REDIS, port=globalVar.PORT_REDIS, password=globalVar.PASSWORD_REDIS, db=db, ssl=globalVar.REDIS_SSL)
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
            conn = redis.StrictRedis(host=globalVar.HOST_REDIS, port=globalVar.PORT_REDIS, password=globalVar.PASSWORD_REDIS, db=db, ssl=globalVar.REDIS_SSL)
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
            conn = redis.StrictRedis(host=globalVar.HOST_REDIS, port=globalVar.PORT_REDIS, password=globalVar.PASSWORD_REDIS, db=db, ssl=globalVar.REDIS_SSL)
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
            conn = redis.StrictRedis(host=globalVar.HOST_REDIS, port=globalVar.PORT_REDIS, password=globalVar.PASSWORD_REDIS, db=db, ssl=globalVar.REDIS_SSL)
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
            conn = redis.StrictRedis(host=globalVar.HOST_REDIS, port=globalVar.PORT_REDIS, password=globalVar.PASSWORD_REDIS, db=db, ssl=globalVar.REDIS_SSL)
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
            conn = redis.StrictRedis(host=globalVar.HOST_REDIS, port=globalVar.PORT_REDIS, password=globalVar.PASSWORD_REDIS, db=db, ssl=globalVar.REDIS_SSL)
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
            conn = redis.StrictRedis(host=globalVar.HOST_REDIS, port=globalVar.PORT_REDIS, password=globalVar.PASSWORD_REDIS, db=db, ssl=globalVar.REDIS_SSL)
            result = conn.expire(key, globalVar.TIME_EXPIRED_REDIS)
            success = True
        except redis.exceptions.RedisError as err:
            Log.error(f' GAGAL EXPIRE | {key} | {err}')
        return success, result
