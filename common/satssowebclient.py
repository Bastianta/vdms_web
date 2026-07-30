"""
Update : 2022-10-07
Desc : Single Sign On Web Client With Decorator Versi 2 untuk exec
Versi : 1.0.0
Requirements : flask, requests, satlog, satgetdatetime, saturl
Cara Penggunaan :
    @sso.authenticate # ---> yang perlu ditambahkan di source code developer
    def indexData(**kwargs) :
url :
 - /login       : route login
 - /api/verify  : route validasi session
 - /logout      : route logout

"""

from functools import wraps

from flask import Flask, make_response, abort, redirect, request

import globalvar_sso

Log = Logger()

app = Flask(import_name=__name__)


class SSO:

    def __init__(self, app):
        self.__urlLogin = globalvar_sso.URL_SERVER + "/login"
        self.__urlVerify = globalvar_sso.URL_SERVER + "/api/verify"
        self.__urlLogout = globalvar_sso.URL_SERVER + "/logout"

        @app.route("/sso", methods=["GET"])
        def setSSOCookie():
            status, code, data = ServerRequest.validate(dict(request.args))
            objectResponse = make_response(redirect(globalvar_sso.CONTINUE_URL))
            if status:
                sessionId = data.get("cookie")
                if globalvar_sso.PRODUCTION.upper() == "Y":
                    isCookieSecure = True
                else:
                    isCookieSecure = False
                objectResponse.set_cookie(key="ALFAMART", value=sessionId, secure=isCookieSecure, httponly=True)
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

    def authenticate(self, route):

        @wraps(route)
        def inner(*args):
            # cek exist cookie
            data = {"cookie": request.cookies.get("ALFAMART")}
            headers = {}
            if globalvar_sso.MD5.upper() == "N":
                headers["signature-key"] = globalvar_sso.SIGNATURE_KEY
            response = ClientRequest.post(url=self.urlVerify, headers=headers, data=data, appId=globalvar_sso.APP_ID)
            # response.success false jika terjadi error / kesalahan dari server
            if response.success:
                responseStatus, responseCode, responseData = response.json()
                if (responseStatus is True) and (responseCode == "00"):
                    statusExistsSession = responseData.get("status")

                    # A.14
                    if statusExistsSession == "T":
                        return route(*args, **responseData)
                    elif statusExistsSession == "F":
                        dataTemp = {"continueUrl": globalvar_sso.CONTINUE_URL}
                        saltedData = saltedhash.create(globalvar_sso.APP_ID, dataTemp)
                        saltedData = saltedData.get("data", "")
                        return redirect(f"{globalvar_sso.URL_SERVER}/?data={saltedData}")
                else:
                    return redirect(f"{globalvar_sso.URL_SERVER}")
            else:
                return abort(400)

        return inner