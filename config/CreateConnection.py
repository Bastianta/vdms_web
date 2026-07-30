import getpass
import sys

def encoder(data):
    """
    Fungsi ini untuk encode str atau list menjadi bentuk ordinal
    @param data: string panjang atau list
    @type data: str or list or tuple
    @return: encoded string
    @rtype: str
    """
    result = []
    if isinstance(data, str):
        data = data.strip().split(" ")
    for datum in data:
        temp = []
        for x in datum:
            temp.append(str(ord(x)))
        result.append('+'.join(temp))
    return ' '.join(result)

def interactive(mode='r', filename=''):
    """
    Interactive mode untuk enkripsi
    @param mode: r -> read | w -> write
    @type mode: str
    @param filename: name of output file
    @type filename: str
    """
    try:
        postgres = {
            "1": "Alias\t: ",
            "2": "Nama Database\t: ",
            "3": "Instance Database / Host\t: ",
            "4": "Username\t: ",
            "5": "Password \t: ",
            "6": "Port (ex:5432)\t: ",
            "7": "Schema (ex:public)\t: "
        }

        mongos = {
            "1": "Alias\t\t\t: ",
            "2": "Host\t\t\t\t: ",
            "3": "Username\t\t\t: ",
            "4": "Password\t\t\t: ",
            "5": "Default Auth DB (optional)\t: ",
            "6": "Options (optional)\t\t: ",
        }
        # catatan : nomer (7) digunakan untuk tipe srv / standart
        data = {}
        status = True
        while status:
            try:
                print('Selamat datang di Common Library-Encoder')
                print('1. Postgres\n\n2. Mongo\n\n99. Exit')

                source = int(input('>>> Masukan pilihan Anda [1,99]: ')) or 9999
                if source == 1:
                    status = False
                    conf = postgres
                    print('\nKonfigurasi Database: ')
                    idx = 0
                    for (k, v) in conf.items():
                        if v.startswith('Password'):
                            data.update({k: getpass.getpass(f'{idx + 1}. {v}') or ' '})
                        else:
                            data.update({k: str(input(f'{idx + 1}. {v}')) or ' '})
                        idx += 1
                    result = [item for k, item in sorted(data.items())]
                    config = encoder(result)
                    print(f'\nKonfigurasi:\n{config}')
                    if mode == 'w':
                        try:
                            file = open(f'{filename}', 'w')
                            file.write(config)
                            file.close()
                        except OSError:
                            print('Terjadi kesalahan saat menyimpan konfigurasi.')
                elif source == 2:
                    print('Selamat Datang di Setting Koneksi Mongo')
                    print("===[ TIPE KONEKSI MONGODB ]======================================")
                    print('1. SRV Connection String')
                    print('2. Standard Connection String / Local')
                    print('\n\n99. Exit')
                    nexQuestion = False
                    sourceSrv = int(input('>>> Masukan pilihan Anda [1,99]: ')) or 9999
                    statusSrv = "N"
                    if sourceSrv == 1:
                        statusSrv = "Y"
                        nexQuestion = True
                    elif sourceSrv == 2:
                        statusSrv = "N"
                        nexQuestion = True
                    elif sourceSrv == 99:
                        print('\nProgram berhasil berhenti')
                        sys.exit()
                    else:
                        print('Salah, pilihan tidak tersedia!')
                    if nexQuestion:
                        print("===[ TIPE KONEKSI STRING ]=======================================")
                        print('1. MongoDB Stand Alone (single-host)')
                        print('2. MongoDB Sharded Cluster & Replica Set (multi-host)')
                        print('\n\n99. Exit')
                        source = int(input('>>> Masukan pilihan Anda [1,99]: ')) or 9999
                        if source == 1:
                            status = False
                            data = setStandAlone(mongos, data)
                            data["7"] = statusSrv
                            print("\nPreview Uri : \n", previewUri(data))
                            changeDataToCfg(mode, filename, data)
                        elif source == 2:
                            status = False
                            data = setShardedClusterAndReplicaSet(mongos, data)
                            data["7"] = statusSrv
                            print("\nPreview Uri : \n", previewUri(data))
                            changeDataToCfg(mode, filename, data)
                        elif source == 99 or str(source).lower() == "exit":
                            print('\nProgram berhasil berhenti')
                            sys.exit()
                        else:
                            print('Salah, pilihan tidak tersedia!')
                elif source == 99:
                    print('\nProgram berhasil berhenti')
                    sys.exit()
                else:
                    print('Pilihan tidak tersedia salah!')
            except ValueError:
                print('Input berupa angka!\n')
            except KeyboardInterrupt:
                print('\nProgram berhasil berhenti')
                sys.exit()
    except ValueError:
        print('Input berupa angka!\n')
    except KeyboardInterrupt:
        print('\nProgram berhasil berhenti')
        sys.exit()

def previewUri(data):
    return validatingUri({
        "alias": data['1'],
        "host": data['2'],
        "username": data['3'],
        "password": data['4'],
        "defaultauthdb": data['5'],
        "options": data['6'],
        "srv": data['7'],
    })

def validatingUri(valparser):
    host = valparser.get("host")
    username = valparser.get("username")
    password = valparser.get("password")
    defaultauthdb = valparser.get("defaultauthdb")
    options = valparser.get("options")
    srv = valparser.get("srv")
    if srv in ("Y", "y"):
        connectionFormat = "mongodb+srv://"
    else:
        connectionFormat = "mongodb://"
    authenticate = ""
    if username is not None and username!=" ":
        authenticate += username
    elif username is None or username==" ":
        authenticate += ""
    if password is not None and password!=" ":
        codedPassword = ""
        for _ in list(password):
            codedPassword += "*"
        authenticate += f":{codedPassword}@"
    elif password is None or password==" ":
        authenticate += ""
    if defaultauthdb is not None and defaultauthdb!=" ":
        defaultauthdb = f"/{defaultauthdb}"
    elif defaultauthdb is None or defaultauthdb==" ":
        defaultauthdb = ""
    if options is not None and options!=" " and options!="":
        if defaultauthdb is not None and defaultauthdb!="" and defaultauthdb!=" ":
            options = f"?{options}"
        else:
            options = f"/?{options}"
    else:
        if srv in ("Y", "y") and (options == " " or options == ""):
            if defaultauthdb is not None and defaultauthdb != "" and defaultauthdb != " ":
                options = "?retryWrites=true&w=majority"
            else:
                options = "/?retryWrites=true&w=majority"
        elif options is None or options==" ":
            options = ""
    uriMongo = f"{connectionFormat}{authenticate}{host}{defaultauthdb}{options}"
    return uriMongo

def setStandAlone(conf, data):
    print('\nKonfigurasi Database: ')
    idx = 0
    for (k, v) in conf.items():
        if v.startswith('Password'):
            data.update({k: getpass.getpass(f'{idx + 1}. {v}') or ' '})
        else:
            data.update({k: str(input(f'{idx + 1}. {v}')) or ' '})
        idx += 1
    return data

def setShardedClusterAndReplicaSet(conf, data):
    print('\nKonfigurasi Database: ')
    idx = 0
    for (k, v) in conf.items():
        if v.startswith('Password'):
            data.update({k: getpass.getpass(f'{idx + 1}. {v}') or ' '})
        elif v.startswith('Host'):
            idxHost = 1
            statusHost = True
            allHost = ' '
            while statusHost:
                if idxHost >= 2:
                    v = v.replace(f"{idxHost - 1} :", f"{idxHost} :")
                    inputHost = str(input(f'   {v}'))
                else:
                    v = v.replace(f":", f"{idxHost} :")
                    inputHost = str(input(f'{idx + 1}. {v}'))
                if idxHost > 1 and inputHost != "":
                    allHost += f",{inputHost}"
                else:
                    allHost = allHost.replace(' ', "")
                    allHost += f"{inputHost}"
                if str(input(f'   >>> Apakah ingin menambah host ? [Y/N]\t: ')) not in ("Y", "y"):
                    statusHost = False
                idxHost += 1
            data.update({k: allHost or ' '})
        else:
            data.update({k: str(input(f'{idx + 1}. {v}')) or ' '})
        idx += 1
    return data

def changeDataToCfg(mode, filename, data):
    result = [item for k, item in sorted(data.items())]
    config = encoder(result)
    print(f'\n>>> Konfigurasi untuk dimasukkan ke file Connection.cfg:\n{config}')
    if mode == 'w':
        try:
            file = open(f'{filename}', 'w')
            file.write(config)
            file.close()
        except OSError:
            print('Terjadi kesalahan saat menyimpan konfigurasi.')

if __name__ == '__main__':
    if len(sys.argv) == 1:
        interactive()
    elif len(sys.argv) == 3:
        if sys.argv[1] == '-o':
            interactive('w', str(sys.argv[2]))
    else:
        print('Usage: python encoder.py [-o filename]')