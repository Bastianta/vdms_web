"""
Update : 2022-27-09
SatLog Versi 2 untuk exec
Return GAE : StackDriver, GCE : Folder Log
"""

from datetime import datetime
import os
try :
    from config import LOG_NAME
except :
    LOG_NAME = "SKELETON"
from pathlib import Path

class Logger :
    """
    Class Logger digunakan sebagai menyimpan log yang diperlukan ke stackdriver untuk Google App Engine atau File Log berdasarkan tanggal untuk Apps yang bersifat Compute
    Cara penggunaan :
        Log = Logger()
        Log.info("sukses koneksi")
    Class yang tidak memerlukan inisialisasi log adalah class / obj dari standard library
    Fungsi : debug, info, warning, error, critical (untuk mengetahui bisa jalankan fungsi print(dir(Log))
    @param logName : Wajib memiliki file Config\__init__.py yang berisi variable LOG_NAME jika tidak maka variable tersebut bernilai "SKELETON"
    """

    __version__ = "1.0.0"
    __requirements__ = "google-cloud-logging"

    def __init__(self):
        self.__logger = ""
        self.createLogger()

    def createLogger(self, logName = LOG_NAME):
        if os.environ.get("GAE_ENV") == "standard":
            from google.cloud import logging_v2
            from google.cloud.logging_v2.resource import Resource
            self.__client = logging_v2.Client()
            self.__logger = self.__client.logger(logName)
            self.__resource = Resource(
                type="gae_app",
                labels={
                    "module_id": os.environ.get("GAE_SERVICE"),
                    "project_id": os.environ.get("GOOGLE_CLOUD_PROJECT"),
                    "version_id": os.environ.get("GAE_VERSION")})
        else :
            base_dir = "/tmp" if os.environ.get("VERCEL") else os.getcwd()
            Path(f"{base_dir}/log").mkdir(parents=True, exist_ok=True)
            self.__logger = f"{base_dir}/log/{datetime.now().strftime('%Y-%m-%d')}.txt"

    def __logStruct(self, severity, msg):
        if os.environ.get("GAE_ENV") == "standard":
            self.__logger.log_struct(info=msg, severity=severity, resource=self.__resource)
        else :
            fileOpen = open(self.__logger, "a")
            dictParam = f"{severity} | {datetime.now().strftime('%Y-%m-%d')} | {datetime.now().strftime('%H:%M:%S')} | {msg}"
            fileOpen.write(f"{str(dictParam)}\n")
            fileOpen.close()

    def debug(self, message):
        self.__logStruct(severity="DEBUG", msg=message)

    def info(self, message):
        self.__logStruct(severity="INFO", msg=message)

    def warning(self, message):
        self.__logStruct(severity="WARNING", msg=message)

    def error(self, message):
        self.__logStruct(severity="ERROR", msg=message)
        print(message)

    def critical(self, message):
        self.__logStruct(severity="CRITICAL", msg=message)
