# SETTING MODUL APLIKASI
MD5 = 'Y'
BASE64 = 'Y'
BZ2 = 'Y'

LOGIN = 'WEB'
MINIMAL_TIME_DIFFERENCE = -60
SALTED_HASH_EXPIRES = 900
LOG_NAME = 'SSO_' + str(LOGIN)
URL_SERVER = "https://stag-asl.sat.co.id"
URL_SERVER_VERIFY = "http://10.176.42.34"
PRODUCTION = "N"       # localhost 'N' / app engine 'Y'
PRODUCTION_ODEN = "N"  # dev mode: bypass SSO

# SIGNATURE KEY
APP_ID = ""
SIGNATURE_KEY = ""
CONTINUE_URL = "http://localhost:8000"

# =================================================== END OF SSO =================================================

import sys

# MULTILANGUAGE
MULTILANGUAGE = False
ALWAYS_UPDATE_MULTILANGUAGE = "N"
MENU_TYPE = 'NAVBAR'  # NAVBAR/SIDEBAR

connRO = None
if PRODUCTION == "N":
    URL = 'http://localhost:8000'
    URL_LIB = "http://34.101.215.169:6000"
    URL_CDN = '/static/oden-stable/v.1.2'
    URL_REPORT = "https://10.176.42.10/cgi-bin/fw_report.py"
    HOST_REDIS = "127.0.0.1"
    PORT_REDIS = 6379
    PASSWORD_REDIS = ""
    TIME_EXPIRED_REDIS = 900
    DEFAULT_BUCKET = "sat-oden-upload"
    SATBUCKET_DESTINATION_LOCAL_FOLDER = ""
    DEFAULT_LOCAL = "/home/juan"
    DB_NAME = 'vdmsdb'  # Must match alias in config/Connection2.cfg
elif PRODUCTION == "Y":
    URL = ''
    URL_LIB = "http://10.176.39.45"
    URL_CDN = '/static/oden-stable/v.1.2'  # was: https://hocdnoden0201.sat.co.id/js-dev (internal-network only)
    URL_REPORT = "https://horeporthc0201.sat.co.id/cgi-bin/fw_report.py"  # internal report server, not used unless you call the report feature
    HOST_REDIS = '127.0.0.1'
    PORT_REDIS = 6379
    PASSWORD_REDIS = None
    TIME_EXPIRED_REDIS = 900
    DEFAULT_BUCKET = "sat-oden-upload"
    DEFAULT_LOCAL = "/home/juan"
    SATBUCKET_DESTINATION_LOCAL_FOLDER = ""
    DB_NAME = 'vdmsdb'
else:
    print('konfigurasi globalVar.PRODUCTION tidak sesuai')
    sys.exit()

# Allow a real host's managed Redis to be plugged in via env vars, e.g.:
#   REDIS_HOST=red-xxxx.render.com  REDIS_PORT=6379  REDIS_PASSWORD=xxxx
# Falls back to the 127.0.0.1 dev values above when unset.
import os as _os
HOST_REDIS = _os.environ.get("REDIS_HOST", HOST_REDIS)
PORT_REDIS = int(_os.environ.get("REDIS_PORT", PORT_REDIS))
PASSWORD_REDIS = _os.environ.get("REDIS_PASSWORD", PASSWORD_REDIS)
