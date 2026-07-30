"""
Update : 2022-10-07
Fungsi untuk merubah timezone mengikuti asia jakarta
Library : pytz
"""

import pytz

def getDateTimeNow() :
    nowutc = datetime.utcnow()
    nowutc = nowutc.replace(tzinfo=pytz.utc)
    currentDatetime = nowutc.astimezone(pytz.timezone("Asia/Jakarta"))
    currentDatetime = datetime.strftime(currentDatetime, '%Y%m%d%H%M%S%f')
    currentDatetime = datetime.strptime(currentDatetime, '%Y%m%d%H%M%S%f')
    return currentDatetime