import json
# noinspection PyUnresolvedReferences
from datetime import date, datetime

import redis
import requests
from flask import redirect, request, session
from flask_session import Session

import globalVar

app.config['PERMANENT_SESSION_LIFETIME'] = globalVar.TIME_EXPIRED_REDIS
app.config['SESSION_COOKIE_NAME'] = 'CLIENT'
app.config['SESSION_TYPE'] = 'redis'
app.config['SESSION_REDIS'] = redis.from_url(
    url=f'redis://{globalVar.HOST_REDIS}:{globalVar.PORT_REDIS}',
    password=globalVar.PASSWORD_REDIS)

Session(app)
sso = SSO(app)

menuActive = {}


class Oden:

    def __init__(self, *args, **kwargs):
        """
        """

        self.__createRoute()
        if __name__ == '__main__':
            app.run(*args, **kwargs)

    def authenticate(self):
        """
        Otentikasi ke Server SSO

        :rtype: bool, dict
        :return:
            index 0: return True jika session valid, False jika session habis
            index 1: {
                'nik': '20124017',
                'attributes': {
                    'company_code': '01',
                    'name': 'RICKY AFDITA A P',
                },
            }
        """

        sessionId = request.cookies.get('ALFAMART')
        resultStatus, resultData = sso.authenticate(sessionId)
        if resultStatus is True:
            return True, resultData
        else:
            session.clear()
            return False, redirect(resultData)

    def authorize(self, menuId):
        """
        Otorisasi ke Server Hak Akses

        :rtype: bool, dict
        :return:
            index 0: return True jika memiliki akses, False jika tidak memiliki akses
            index 1: {
                'status_access': {
                    'delete': 'N',
                    'insert': 'N',
                    'update': 'N',
                }
            }
        """

        try:
            nik = session['loggedId']['nik']
            companyCode = session['loggedId']['attributes']['company_code']
            requestData = {'nik': nik, 'company_code': companyCode, 'app_code': globalVar.APP_ID, 'menu_id': menuId}

            saltedData = saltedhash.create(globalVar.APP_ID, requestData)
            saltedData = saltedData.get('data')
            if saltedData is None:
                Log.error(f'Error Create Salted Data!')
                return False, redirect(globalVar.CONTINUE_URL)

            url = f'{globalVar.URL_SERVER_VERIFY}/get_menu_access?data={saltedData}'
            response = requests.get(url)
            status, code, data = ServerRequest.validate(json.loads(response.text))
            data.update({'data': json.loads(data.get('data', {}))})
            if status is False:
                Log.error(f'Error Validate Salted Data!\nCode: {code} Data: {data}')
                return False, redirect(globalVar.CONTINUE_URL)

            if data.get('status') is not True:
                Log.error(f'Error Access!\nCode: {code} Data: {data}')
                return False, redirect(globalVar.CONTINUE_URL)

            data = data.get('data', {})
            data.pop('datetime', None)
            data.pop('success', None)
            data.pop('msg', None)
            return True, data

        except Exception as error:
            Log.error(f'Error Request Access Menu!\n{error}')
            return False, redirect(globalVar.CONTINUE_URL)

    def getMenu(self):
        """
        Get List Menu

        :rtype: bool, dict
        :return:
            index 0: return True jika tidak ada error, False jika ada error
            index 1: [
                ['MENU_ID_1', 'Menu Desc 1', '', 'Y'],
                ['MENU_ID_2', 'Menu Desc 2', 'MENU_PARENT_ID_1', 'Y'],
            ]
        """

        try:
            nik = session['loggedId']['nik']
            companyCode = session['loggedId']['attributes']['company_code']
            requestData = {'nik': nik, 'company_code': companyCode, 'app_code': globalVar.APP_ID}

            saltedData = saltedhash.create(globalVar.APP_ID, requestData)
            saltedData = saltedData.get('data')
            if saltedData is None:
                Log.error(f'Error Create Salted Data!')
                return False, redirect(globalVar.CONTINUE_URL)

            url = f'{globalVar.URL_SERVER_VERIFY}/get_menu?data={saltedData}'
            response = requests.get(url)
            status, code, data = ServerRequest.validate(json.loads(response.text))
            data.update({'data': json.loads(data.get('data', {}))})
            if status is False:
                Log.error(f'Error Validate Salted Data!\nCode: {code} Data: {data}')
                return False, redirect(globalVar.CONTINUE_URL)

            if data.get('status') is not True:
                Log.error(f'Error Get Menu!\nCode: {code} Data: {data}')
                return False, redirect(globalVar.CONTINUE_URL)

            data.pop('appId', None)
            data.pop('datetime', None)
            data.pop('responsecode', None)
            data.pop('saltedHash', None)
            data.pop('status', None)
            data.get('data', {}).pop('datetime', None)
            data.get('data', {}).pop('msg', None)
            data.get('data', {}).pop('success', None)
            data = data.get('data', {}).get('menu_id', [])
            return True, data

        except Exception as error:
            Log.error(f'Error Get Menu!\n{error}')
            return False, redirect(globalVar.CONTINUE_URL)

    def __setAuthenticateData(self, data):
        """
        """

        session['loggedId'] = {}
        session['loggedId']['nik'] = data['nik']
        session['loggedId']['attributes'] = data['attributes']

    def __setAuthorizeData(self, data):
        """
        """

        session['loggedId']['access_menu'] = data

    def __createRoute(self):
        """
        """

        @app.route('/', methods=['GET'])
        def indexGet():
            # Authentication
            resultAuthenticate, responseAuthenticate = self.authenticate()
            if not resultAuthenticate:
                return responseAuthenticate
            self.__setAuthenticateData(responseAuthenticate)

            # Authorization
            menuId = request.args.get('menuId')
            if menuId is not None:
                resultAuthorize, responseAuthorize = self.authorize(menuId)
                if not resultAuthorize:
                    return responseAuthorize
                self.__setAuthorizeData(responseAuthorize)

            requestType = request.args.get('type')
            if requestType == 'VIEW':
                return self.__view()
            elif requestType == 'LOGOUT':
                return self.__logout()
            else:
                return self.__index()

        @app.route('/', methods=['POST'])
        def indexPost():
            # Authentication
            resultAuthenticate, responseAuthenticate = self.authenticate()
            if not resultAuthenticate:
                return {'status': False, 'msg': 'Session Login Sudah Habis!'}
            self.__setAuthenticateData(responseAuthenticate)

            # Authorization
            menuId = request.json.get('menuId')
            resultAuthorize, responseAuthorize = self.authorize(menuId)
            if not resultAuthorize:
                return {'status': False, 'msg': 'Anda Tidak Memiliki Akses!'}
            self.__setAuthorizeData(responseAuthorize)

            requestType = request.json.get('type')
            if requestType == 'SELECT':
                return self.__select()
            elif requestType == 'INSERT':
                return self.__insert()
            elif requestType == 'UPDATE':
                return self.__update()
            elif requestType == 'DELETE':
                return self.__delete()
            elif requestType == 'API':
                return self.__api()
            elif requestType == 'REPORT':
                return self.__report()
            elif requestType == 'CALL_FORM':
                return self.__callform()

    def __index(self):
        """
        """

        resultMenuStatus, resultMenuData = self.getMenu()
        resultMenuData = {'data': {'menu_id': resultMenuData}}
        if resultMenuStatus is False:
            resultMenuData = {'data': {'menu_id': []}}
        userMenu = resultMenuStatus, resultMenuData

        baseScript = fileToString("templates/index.html")
        baseScript = baseScript.replace("[URL_CDN]", globalVar.URL_CDN)
        stringHtml = "let content = {}"
        baseScript = baseScript.replace("[contentCustom]", stringHtml)
        sideBar = baseScript.replace("[sidebarCustom]", set_user_menu(userMenu))
        content = sideBar.replace("[formId]", '')
        script = content.replace("[NIK_SSO]", session["loggedId"]["nik"])
        script = script.replace("[NAMA_SSO]", session["loggedId"]["attributes"]["name"])
        dynamicVal = script
        return dynamicVal

    def __view(self):
        """
        """

        resultMenuStatus, resultMenuData = self.getMenu()
        resultMenuData = {'data': {'menu_id': resultMenuData}}
        if resultMenuStatus is False:
            resultMenuData = {'data': {'menu_id': []}}
        userMenu = resultMenuStatus, resultMenuData

        kwargs = session['loggedId']
        menuId = request.args.get('menuId')
        if menuId not in menuActive.keys():
            stringExec = fileToString(f'./application/{menuId}.py')  # kolom db
            exec(stringExec, globals())
            menuActive.update({menuId: {"vCount": execVcount}})
        exec(menuActive[menuId]["vCount"])
        baseScript = fileToString("templates/baseExec.html")
        baseScript = baseScript.replace("[URL_CDN]", globalVar.URL_CDN)
        stringHtml = fileToString(f'./static/application/{menuId}.js')  # kolom db
        baseScript = baseScript.replace("[contentCustom]", stringHtml)
        baseScript = baseScript.replace("[COMPANY]", kwargs["attributes"]["company_code"])
        sideBar = baseScript.replace("[sidebarCustom]", set_user_menu(userMenu))
        content = sideBar.replace("[formId]", menuId)
        script = content.replace("[NIK_SSO]", kwargs["nik"])
        dynamicVal = script.replace("[NAMA_SSO]", kwargs["attributes"]["name"])
        return dynamicVal

    def __select(self):
        """
        """
        menuId = request.args.get('menuId') or request.json.get('menuId')
        vContainer = Container()
        ajaxData = request.json.get('data', {})
        allowCharacter = checkSpecialChar(ajaxData)
        if allowCharacter["status"]:
            if session.get("gVar") is not None:
                if len(session["gVar"]["gCallForm"]) != 0:
                    dataCall = session["gVar"]["gCallForm"][len(session["gVar"]["gCallForm"]) - 1]
                    print(292,dataCall)
                    print(293,session["gVar"]["gCallForm"])
                    for gCallForm in reversed(session["gVar"]["gCallForm"]):
                        print(295,gCallForm,gCallForm["menuId"],menuId)
                        if gCallForm["menuId"] == menuId:
                            ajaxData["data"].update(dataCall["callFormParam"]["bindParamCallForm"])
                            print(296,ajaxData["data"])
                            break
                        else:
                            ajaxData["data"].update(dataCall["callFormParam"]["bindParamCallBack"])
                            if session["vForm"].callFormLevel == 0:
                                del session["gVar"]
                                break
                            session["gVar"]["gCallForm"].pop()
                            break
                elif len(session["gVar"]["gCallForm"]) == 0:
                    del session["gVar"]
            print(306,ajaxData)
            dynamicVal = vContainer.selectDataStatement(ajaxData, ajaxData['blockName'])
        else:
            dynamicVal = allowCharacter
        print(308,ajaxData)
        return dynamicVal

    def __insert(self):
        """
        """

        vContainer = Container()
        ajaxData = request.json.get('data', {})
        dynamicVal = vContainer.insertDataStatement(ajaxData)
        return dynamicVal

    def __update(self):
        """
        """

        vContainer = Container()
        ajaxData = request.json.get('data', {})
        dynamicVal = vContainer.updateDataStatement(ajaxData)
        return dynamicVal

    def __delete(self):
        """
        """

        vContainer = Container()
        ajaxData = request.json.get('data', {})
        dynamicVal = vContainer.deleteDataStatement(ajaxData)
        return dynamicVal

    def __api(self):
        """
        """

        menuId = request.json.get('menuId')
        ajaxData = request.json.get('data', {})
        allowCharacter = checkSpecialChar(ajaxData)
        if allowCharacter["status"]:
            apiNewInstacne = request.json.get('apiName')
            if(apiNewInstacne.endswith(menuId) or apiNewInstacne.startswith("newInstance_"+menuId)):
                dynamicVal = globals()[apiNewInstacne]()
            else:
                return {"status":False,"data":{},"msg":"api not found in selected menu"}  
        else:
            dynamicVal = allowCharacter
        return dynamicVal

    def __report(self):
        """
        """

        vContainer = Container()
        cookie = request.cookies.get('ALFAMART')
        menuId = request.json.get('menuId')
        ajaxData = request.json.get('data', {})
        nonBaseResult = vContainer.validateNonBase(ajaxData)
        if nonBaseResult['status']:
            dynamicVal = sendApiPrintReport(session["loggedId"], menuId, nonBaseResult['data'][0], cookie)
        else:
            dynamicVal = rMsgBox(nonBaseResult['msg'])
        return dynamicVal

    def __callform(self):
        """
        """

        ajaxData = request.json.get('data', {})
        allowCharacter = checkSpecialChar(ajaxData)
        if allowCharacter["status"]:
            validateCallForm = validatePkCallForm()
            addOnApi = None
            if validateCallForm["status"]:
                apiNewInstacne = request.json.get('apiName')
                addOnApi = globals()[apiNewInstacne]()
            if addOnApi is None:
                dynamicVal = validateCallForm
            else:
                dynamicVal = addOnApi
        else:
            dynamicVal = allowCharacter
        return dynamicVal

    def __logout(self):
        """
        """

        session.clear()
        return redirect(sso.urlLogout)
