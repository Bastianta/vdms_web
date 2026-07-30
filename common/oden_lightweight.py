import json
# noinspection PyUnresolvedReferences
from datetime import date, datetime

import redis
import requests
from flask import redirect, request, session, jsonify
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

class Oden:

    name = 'ODEN'

    def __init__(self, *args, **kwargs):
        """
        """

        self.__createRoute()
        if __name__ == '__main__':
            app.run(*args, **kwargs)

    def fileToString(self,filename):
        nik = session['loggedId']['nik']
        try:

            fin = open(filename,'r')
            data = fin.readlines()
            fin.close()
            hasil = ""
            for baris in data:
                hasil = hasil+baris
            hasil = hasil.replace('{urllogout}', f'"{sso.urlLogout}"')
            return hasil

        except Exception as exp:
            print(f"GAGAL MENGUBAH FILE TO STRING - {traceback.format_exc()}")
            Log.error(f'{nik} | GAGAL MENGUBAH FILE TO STRING | {traceback.format_exc()}')
            Log.error(f'{nik} | GAGAL MENGUBAH FILE MENJADI BENTUK STRING | Error on line {sys.exc_info()[-1].tb_lineno}, {type(exp).__name__,} {exp}')
            return {"status":False, "msg":f'Gagal Mengubah File Menjadi Bentuk String'}

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
            userSession = session['loggedId']
            nik = session['loggedId']['nik']
            companyCode = session['loggedId']['attributes']['company_code']
            requestData = {'nik': nik, 'company_code': companyCode, 'app_code': globalVar.APP_ID}

            saltedData = saltedhash.create(globalVar.APP_ID, requestData)
            saltedData = saltedData.get('data')
            if saltedData is None:
                Log.error(f'Error Create Salted Data!\nSession: {userSession}')
                return False, 'internal server error!<br>code: 21.'

            url = f'{globalVar.URL_SERVER_VERIFY}/get_menu?data={saltedData}'
            response = requests.get(url)
            status, code, data = ServerRequest.validate(json.loads(response.text))
            data.update({'data': json.loads(data.get('data', {}))})
            if status is False:
                Log.error(f'Error Validate Salted Data!\nCode: {code}; Data: {data}; Session: {userSession}')
                return False, 'internal server error!<br>code: 22.'

            if data.get('status') is not True:
                Log.error(f'Error Get Menu!\nCode: {code}; Data: {data}; Session: {userSession}')
                return False, 'you do not have permission to view this form!'

            data.pop('appId', None)
            data.pop('datetime', None)
            data.pop('responsecode', None)
            data.pop('saltedHash', None)
            data.pop('status', None)
            data.get('data', {}).pop('datetime', None)
            data.get('data', {}).pop('msg', None)
            data = data.get('data', {}).get('menu_id', [])
            return True, data

        except Exception as error:
            Log.error(f'Error Get Menu!\n{error}')
            return False, 'internal server error!<br>code: 24.'

    def customView(self, menuId, html):
        """
        
        """

        stringHtml = html
        stringHtml.replace('[CONTENT]', """
        """)
        return html

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

    def __setListMenu(self, data):
        """
        """

        session['loggedId']['list_menu'] = data

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
            if requestType == 'API':
                return self.__api()
            elif requestType == 'CUSTOM_VIEW':
                return self.__customView(menuId)
            elif requestType == 'LOGOUT':
                return self.__logout()
            else:
                return self.__index()

        @app.route('/', methods=['POST'])
        def indexPost():
            # Authentication
            resultAuthenticate, responseAuthenticate = self.authenticate()
            if not resultAuthenticate:
                return {'status': False, 'msg': 'your session has expired. please log in again.'}
            self.__setAuthenticateData(responseAuthenticate)

            # Authorization
            menuId = request.json.get('menuId')
            resultAuthorize, responseAuthorize = self.authorize(menuId)
            if not resultAuthorize:
                return {'status': False, 'msg': 'you do not have permission to view this form!'}
            self.__setAuthorizeData(responseAuthorize)

            requestType = request.json.get('type')
            if requestType == 'API':
                return self.__api()
            elif requestType == 'CUSTOM_VIEW':
                return self.__customView(menuId)

    def __index(self):
        """
        """

        resultMenuStatus, resultMenuResponse = self.getMenu()
        resultMenuMessage = resultMenuResponse
        resultMenuData = {'data': {'menu_id': resultMenuResponse}}
        if resultMenuStatus is False:
            resultMenuData = {'data': {'menu_id': []}}
        userMenu = resultMenuStatus, resultMenuData
        self.__setListMenu(userMenu)

        customIndex = self.index()
        if customIndex is not False:
            if os.path.exists("./templates/custom_index.html"):
                dynamicVal = self.fileToString(f'./templates/custom_index.html')
                dynamicVal = dynamicVal.replace('[USER_NIK]', session['loggedId']['nik'])
                dynamicVal = dynamicVal.replace('[USER_NAMA]', session['loggedId']['attributes']['name'])
                dynamicVal = dynamicVal.replace('[USER_MENU]', json.dumps(resultMenuData))
                return dynamicVal
            else:
                dynamicVal = customIndex
                return dynamicVal

        stringHtml = 'let content = {}'
        if resultMenuStatus is False:
            stringHtml = '''
                let message = %r
                let content = webix.alert({title: 'Error', ok: 'Logout', text: message, type:'alert-warning'})
                    .then(function(){
                        webix.send('/', {'type': 'LOGOUT'}, 'GET')
                    })
            ''' % resultMenuMessage

        baseScript = TEMPLATE_HOME
        baseScript = baseScript.replace('[URL_CDN]', globalVar.URL_CDN)
        baseScript = baseScript.replace('[APP_NAME]', self.name)
        baseScript = baseScript.replace('[contentCustom]', stringHtml)
        sideBar = baseScript.replace('[sidebarCustom]', set_user_menu(userMenu))
        content = sideBar.replace('[formId]', '')
        script = content.replace('[NIK_SSO]', session['loggedId']['nik'])
        script = script.replace('[NAMA_SSO]', session['loggedId']['attributes']['name'])
        dynamicVal = script
        return dynamicVal

    def __customView(self, menuId):
        """
        """

        resultMenuStatus, resultMenuResponse = self.getMenu()
        resultMenuMessage = resultMenuResponse
        resultMenuData = {'data': {'menu_id': resultMenuResponse}}
        if resultMenuStatus is False:
            resultMenuData = {'data': {'menu_id': []}}
        userMenu = resultMenuStatus, resultMenuData
        self.__setListMenu(userMenu)

        stringExec = self.fileToString(f'./application/{menuId}.py')
        exec(stringExec, globals())

        dynamicVal = self.fileToString(f'./templates/{menuId}.html')
        print(311, dynamicVal)
        if isinstance(dynamicVal, str):
            dynamicVal = self.customView(menuId, dynamicVal)
            dynamicVal = dynamicVal.replace('[USER_NIK]', session['loggedId']['nik'])
            dynamicVal = dynamicVal.replace('[USER_NAMA]', session['loggedId']['attributes']['name'])
            dynamicVal = dynamicVal.replace('[USER_MENU]', json.dumps(resultMenuData))
            return dynamicVal
        else:
            dynamicVal = self.customView(menuId, 'Form Tidak Ditemukan!')
            return dynamicVal

    def __api(self):
        """
        """

        ajaxData = request.json.get('data', {})
        menuId = request.json.get('menuId')
        allowCharacter = self.__checkSpecialChar(ajaxData)
        
        stringExec = self.fileToString(f'./application/{menuId}.py')
        exec(stringExec, globals())

        if allowCharacter['status']:
            apiNewInstacne = request.json.get('apiName')
            functionApi = globals()[apiNewInstacne]
            if functionApi.__name__ == "checkExternalApi":
                dynamicVal = globals()[apiNewInstacne]()
            else:
                return {"status":False,"data":{},"msg":"api is not found in the menu or not public"} 
        else:
            dynamicVal = allowCharacter
        return dynamicVal

    def __callform(self):
        """
        """

        ajaxData = request.json.get('data', {})
        allowCharacter = self.__checkSpecialChar(ajaxData)
        if allowCharacter['status']:
            validateCallForm = validatePkCallForm()
            addOnApi = None
            if validateCallForm['status']:
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

    def __checkSpecialChar(self,ajaxData):
        if isinstance(ajaxData,list):
            if len(ajaxData)!=0:
                for data in ajaxData:
                    for key in data.keys():
                        for char in str(data[key]):
                            if char in ['<','>']:
                                return {"status":False,"data":{"code":200,"msg":f"Special Character Detected!"},"msg":f"Special Character Detected! {key}"}  
        else:      
            for key in ajaxData.keys():
                    for char in str(ajaxData[key]):
                        if char in ['<','>']:
                            return {"status":False,"data":{"code":200,"msg":f"Special Character Detected!"},"msg":f"Special Character Detected! {key}"}
        return{"status":True,"data":{},"msg":"No Special Character Detected"}

def exposeApi(function):
    def checkExternalApi(*args, **kwargs):
        menuId = request.json.get('menuId')
        apiName = request.json.get('apiName')
        if(apiName.endswith(menuId)):
            return function(*args,**kwargs)
        else:
            return {"status":False,"data":{},"msg":"apiName not found"}  
    function.__name__ = 'checkExternalApi'
    return checkExternalApi