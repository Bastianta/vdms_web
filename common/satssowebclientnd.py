"""
Update : 2022-10-07
Desc : Single Sign On Web Client Without Decorator Versi 2 untuk exec
Versi : 1.0.0
Requirements : flask, requests, satlog, satgetdatetime, saturl
Cara Penggunaan :
    cookie = request.cookies.get('ALFAMART') #Mendapatkan cookie dari request
    dataVerify = sso.authenticate(cookie)
    Nilai dataverify = [Boolean, Data dari hasil verifikasi]
url :
 - /login       : route login
 - /api/verify  : route validasi session
 - /logout      : route logout
"""

from flask import Flask, make_response, abort, redirect, request

Log = Logger()

app = Flask(import_name=__name__)

class SSO:

    def __init__(self, app):
        self.__urlLogin = globalVar.URL_SERVER + "/login"
        self.__urlVerify = globalVar.URL_SERVER_VERIFY + "/api/verify"
        # self.__urlVerify = globalVar.URL_SERVER + "/api/verify"
        self.__urlLogout = globalVar.URL_SERVER + "/logout"

        @app.route("/sso", methods=['GET'])
        def setSSOCookie():
            status, code, data = ServerRequest.validate(dict(request.args))
            objectResponse = make_response(redirect(globalVar.CONTINUE_URL))
            if status:
                sessionId = data.get("cookie")
                if globalVar.PRODUCTION.upper() == "Y":
                    isCookieSecure = True
                else:
                    isCookieSecure = False
                objectResponse.set_cookie(key='ALFAMART', value=sessionId, secure=False, httponly=True) #varible secure harus nya isinya isCookieSecure 
            return objectResponse

    @property
    def urlLogin(self):
        return self.__urlLogin

    @property
    def urlVerify(self):
        return self.__urlVerify

    @property
    def urlLogout(self):
        return self.__urlLogout

    def authenticate(self,cookie=''):
        # cek exist cookie
        data = {'cookie': cookie}
        headers = {}
        if globalVar.MD5.upper() == 'N':
            headers['signature-key'] = globalVar.SIGNATURE_KEY
        response = ClientRequest.post(url=self.urlVerify, headers=headers, data=data, appId=globalVar.APP_ID)
        # response.success false jika terjadi error / kesalahan dari server
        if response.success:
            responseStatus, responseCode, responseData = response.json()
            if (responseStatus is True) and (responseCode == '00'):
                statusExistsSession = responseData.get("status")

                # A.14
                if statusExistsSession == "T":
                    return True, responseData
                elif statusExistsSession == "F":
                    dataTemp = {'continueUrl': globalVar.CONTINUE_URL}
                    saltedData = saltedhash.create(globalVar.APP_ID, dataTemp)
                    saltedData = saltedData.get("data", "")
                    return False, f"{globalVar.URL_SERVER}/?data={saltedData}"
            else:
                return False , f'{globalVar.URL_SERVER}'
        else:
            return abort(400)