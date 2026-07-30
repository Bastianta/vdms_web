"""
Update : 2023-07-04
SatBucket untuk exec
Version : 1.0.0
Requirements :
 Standard Lib : satlog
 Library : google-cloud-storage
Configuration:
 globalVar:
  SATBUCKET_DESTINATION_LOCAL_FOLDER
  SATBUCKET_FILE_EXTENSION
"""
import json
from google.oauth2 import service_account
from google.cloud import storage
# from globalVar import SATBUCKET_DESTINATION_LOCAL_FOLDER, SATBUCKET_FILE_EXTENSION
import os
import sys
# from satlog import Logger

Log = Logger()

class SatBucket() : 
    def __init__(self, bucket) :
       try :
           self.bucket_name = bucket
           creds_json = os.environ.get("GOOGLE_CREDENTIALS_JSON")
           if creds_json:
               credentials = service_account.Credentials.from_service_account_info(json.loads(creds_json))
               self.storage_client = storage.Client(credentials=credentials, project=credentials.project_id)
           else:
               self.storage_client = storage.Client()
           self.bucket = self.storage_client.bucket(self.bucket_name)
           self.status = True
       except Exception as error:
           self.status = False
           Log.error(f"[SATBUCKET] Fail to Connect Bucket | {error} | {sys.exc_info()} |")

    def getListObject(self, folder, filename):
        """
        Fungsi untuk mengecek ada atau tidaknya objek yang ada di sebuah direktori di cloud storage bucket

        return status ada atau tidaknya objek
            - True, jika ada objek di direktori tsb
            - False, jika tidak ada objek di direktori tsb

        return path direktori di bucket
            - Nama Folder/File_Saya.pdf

        :param folder: nama folder yang ada di bucket. Contoh: Nama Folder
        :param filename: nama file yang ada di bucket. Contoh: File_Saya.pdf 
        :type folder: str
        :type filename: str

        :return: status ada atau tidaknya objek, path direktori di bucket
        :rtype: bool, str
        """
        status = False
        folderindex = f"{folder}/{filename}"
        blobs = self.storage_client.list_blobs(f"{self.bucket_name}", prefix=folder)
        for blob in blobs:
            if blob.name == folderindex :
                status = True 
                break
        return status, folderindex

    def downloadToFileName(self, bucketfilename, localfilename):
        """
        Fungsi untuk download file dari cloud storage bucket ke local 

        return status keberhasilan download file
            - True, jika berhasil download file
            - False, jika gagal download file

        return dictionary data file yang didownload
            - {"file_name": "File_Saya.pdf", "file": "D://Projek/File_Saya.pdf", "content_type": "application/pdf", "message": "Success Download File"}, jika berhasil download file
            - {"message": "Fail Download File"}, jika gagal download file

        :param bucketfilename: nama file yang ada di bucket. Contoh: File_Saya.pdf
        :param localfilename: nama file setelah di download. Contoh: File_Saya.pdf
        :type bucketfilename: str
        :type localfilename: str

        :return: status keberhasilan download file, dictionary data file yang didownload
        :rtype: bool, dict
        """
        status = False
        contents = {}
        contentType = None
        vPath = ""
        try :
            vPath = f"{os.getcwd()}/{SATBUCKET_DESTINATION_LOCAL_FOLDER}/{localfilename}.{SATBUCKET_FILE_EXTENSION}"
        except Exception as error:
            Log.error(f"[SATBUCKET] Fail Download File, check your download destination | {error} | {sys.exc_info()} |")
        try :
            blob = self.bucket.blob(bucketfilename)
            blob.download_to_filename(vPath)
            contentType = blob.content_type
            status = True
            contents = {"file_name": f"{localfilename}", "file": f"{vPath}", "content_type": contentType, "message": "Success Download File"}
        except Exception as error:
            status = False
            responseError = error._response.json()
            contents = {"message": "Fail Download File", "reason": responseError.get("error").get("message")}
            Log.error(f"[SATBUCKET] Fail Download File | {error} | {sys.exc_info()} |")
        return status, contents

    def uploadFromFileName(self, localfilename, bucketfilename):
        """
        Fungsi untuk upload file dari local ke cloud storage bucket

        return status keberhasilan upload file
            - True, jika berhasil upload file
            - False, jika gagal upload file

        return dictionary data file yang diupload
            - {"file_name": "File_Saya.pdf", "file": "File_Saya.pdf", "content_type": "application/pdf", "message": "Success Upload File"}, jika berhasil upload file
            - {"message": "Fail Upload File"}, jika gagal upload file

        :param localfilename: nama file local yang akan di upload. Contoh: File_Saya.pdf
        :param bucketfilename: nama file yang akan disimpan di bucket. Contoh: File_Saya.pdf
        :type localfilename: str
        :type bucketfilename: str

        :return: status keberhasilan upload file, dictionary data file yang diupload
        :rtype: bool, dict
        """
        status = False
        contents = {}
        contentType = None
        try :
            blob = self.bucket.blob(bucketfilename)
            blob.upload_from_filename(localfilename)
            contentType = localfilename.content_type
            status = True
            contents = {"file_name": f"{bucketfilename}", "content_type": contentType, "message": "Success Upload File"}
        except Exception as error:
            status = False
            responseError = error._response.json()
            contents = {"message": "Fail Upload File", "reason": responseError.get("error").get("message")}
            Log.error(f"[SATBUCKET] Fail Upload File | {error} | {sys.exc_info()} |")
        return status, contents

    ###############################

    def uploadFromFile(self, localfilename, bucketfilename):
        """
        Fungsi untuk upload file dari local ke cloud storage bucket

        return status keberhasilan upload file
            - True, jika berhasil upload file
            - False, jika gagal upload file

        return dictionary data file yang diupload
            - {"file_name": "File_Saya.pdf", "file": "File_Saya.pdf", "content_type": "application/pdf", "message": "Success Upload File"}, jika berhasil upload file
            - {"message": "Fail Upload File"}, jika gagal upload file

        :param localfilename: nama file local yang akan di upload. Contoh: File_Saya.pdf
        :param bucketfilename: nama file yang akan disimpan di bucket. Contoh: File_Saya.pdf
        :type localfilename: str
        :type bucketfilename: str

        :return: status keberhasilan upload file, dictionary data file yang diupload
        :rtype: bool, dict
        """
        status = False
        contents = {}
        contentType = None
        try :
            blob = self.bucket.blob(bucketfilename)
            blob.upload_from_file(localfilename)
            contentType = localfilename.content_type
            status = True
            contents = {"file_name": f"{bucketfilename}", "content_type": contentType, "message": "Success Upload File"}
        except Exception as error:
            responseError = error._response.json()
            contents = {"message": "Fail Upload File", "reason": responseError.get("error").get("message")}
            Log.error(f"[SATBUCKET] Fail Upload File | {error} | {sys.exc_info()} |")
        return status, contents

    ################### BYTES

    def downloadBytesFile(self, bucketfilename):
        """
        Fungsi untuk download file dari cloud storage bucket dan dikembalikan dalam bentuk bytes (tidak disave ke local) 

        return status keberhasilan download file
            - True, jika berhasil download file
            - False, jika gagal download file

        return dictionary data file yang didownload
            - {"file_name": "File_Saya.pdf", "file": bytes, "content_type": "application/pdf", "message": "Success Download File"}, jika berhasil download file
            - {"message": "Fail Download File"}, jika gagal download file

        :param bucketfilename: nama file yang ada di bucket. Contoh: File_Saya.pdf
        :type bucketfilename: str

        :return: status keberhasilan download file, dictionary data file yang didownload
        :rtype: bool, dict
        """
        status = False
        contents = {}
        contentType = None
        try :
            print(198, bucketfilename)
            blob = self.bucket.get_blob(bucketfilename)
            print(199, blob)
            contentType = blob.content_type
            print(202,dir(blob))
            file = blob.download_as_bytes()
            status = True
            contents = {"file_name" : f"{bucketfilename}", "file": file, "content_type": contentType, "message": "Success Download File"}
            
        except Exception as error:
            print(206, error)
            responseError = error._response.json()
            contents = {"message": "Fail Download File", "reason": responseError.get("error").get("message")}
            Log.error(f"[SATBUCKET] Fail Download File | {error} | {sys.exc_info()} |")
        return status, contents

    def uploadFromBytesFile(self, localfilename, bucketfilename):
        """
        Fungsi untuk upload file dari bytes file ke cloud storage bucket

        return status keberhasilan upload file
            - True, jika berhasil upload file
            - False, jika gagal upload file

        return dictionary data file yang diupload
            - {"file_name": "File_Saya.pdf", "file": "File_Saya.pdf", "content_type": "application/pdf", "message": "Success Upload File"}, jika berhasil upload file
            - {"message": "Fail Upload File"}, jika gagal upload file

        :param localfilename: nama file local yang akan di upload. Contoh: File_Saya.pdf
        :param bucketfilename: nama file yang akan disimpan di bucket. Contoh: File_Saya.pdf
        :type localfilename: str
        :type bucketfilename: str

        :return: status keberhasilan upload file, dictionary data file yang diupload
        :rtype: bool, dict
        """
        status = False
        contents = {}
        contentType = None
        try :
            blob = self.bucket.blob(bucketfilename)
            contentType = localfilename.content_type
            blob.upload_from_string(
                localfilename.read(),
                content_type=localfilename.content_type
            )
            status = True
            contents = {"file_name": f"{bucketfilename}", "content_type": contentType, "message": "Success Upload File"}
        except Exception as error:
            responseError = error._response.json()
            contents = {"message": "Fail Upload File", "reason": responseError.get("error").get("message")}
            Log.error(f"[SATBUCKET] Fail Upload File | {error} | {sys.exc_info()} |")
        return status, contents
    
    ############################### STRING

    def downloadStringFile(self, bucketfilename) :
        """
        Fungsi untuk download file dari cloud storage bucket dan dikembalikan dalam bentuk string (tidak disave ke local) 

        return status keberhasilan download file
            - True, jika berhasil download file
            - False, jika gagal download file

        return dictionary data file yang didownload
            - {"file_name": "File_Saya.pdf", "file": string, "content_type": "application/pdf", "message": "Success Download File"}, jika berhasil download file
            - {"message": "Fail Download File"}, jika gagal download file

        :param bucketfilename: nama file yang ada di bucket. Contoh: File_Saya.pdf
        :type bucketfilename: str

        :return: status keberhasilan download file, dictionary data file yang didownload
        :rtype: bool, dict
        """
        status = False
        contents = {}
        contentType = None
        try :
            blob = self.bucket.get_blob(bucketfilename)
            contentType = blob.content_type
            file = blob.download_as_string()
            status = True
            contents = {"file_name": f"{bucketfilename}", "file": file, "content_type": contentType, "message": "Success Download File"}
        except Exception as error:
            status = False
            responseError = error._response.json()
            contents = {"message": "Fail Download File", "reason": responseError.get("error").get("message")}
            Log.error(f"[SATBUCKET] Fail Download File | {error} | {sys.exc_info()} |")
        return status, contents

    def uploadFromStringFile(self, localfilename, bucketfilename):
        """
        Fungsi untuk upload file dari string file ke cloud storage bucket

        return status keberhasilan upload file
            - True, jika berhasil upload file
            - False, jika gagal upload file

        return dictionary data file yang diupload
            - {"file_name": "File_Saya.pdf", "file": "File_Saya.pdf", "content_type": "application/pdf", "message": "Success Upload File"}, jika berhasil upload file
            - {"message": "Fail Upload File"}, jika gagal upload file

        :param localfilename: nama file local yang akan di upload. Contoh: File_Saya.pdf
        :param bucketfilename: nama file yang akan disimpan di bucket. Contoh: File_Saya.pdf
        :type localfilename: str
        :type bucketfilename: str

        :return: status keberhasilan upload file, dictionary data file yang diupload
        :rtype: bool, dict
        """
        status = False
        contents = {}
        contentType = None
        try :
            blob = self.bucket.blob(bucketfilename)
            blob.upload_from_string(localfilename)
            contentType = localfilename.content_type
            status = True
            contents = {"file_name": f"{bucketfilename}", "content_type": contentType, "message": "Success Upload File"}
        except Exception as error:
            status = False
            responseError = error._response.json()
            contents = {"message": "Fail Upload File", "reason": responseError.get("error").get("message")}
            Log.error(f"[SATBUCKET] Fail Upload File | {error} | {sys.exc_info()} |")
        return status, contents
    
    ###############################

    def deleteFile(self, bucketfilename):
        """
        Fungsi untuk menghapus file di cloud storage bucket

        return status keberhasilan hapus file
            - True, jika berhasil hapus file
            - False, jika gagal hapus file

        return dictionary data file yang dihapus
            - {"file_name": "File_Saya.pdf", "file": "File_Saya.pdf", "content_type": "application/pdf", "message": "Success Delete File"}, jika berhasil hapus file
            - {"message": "Fail Delete File"}, jika gagal hapus file

        :param bucketfilename: nama file yang akan dihapus di bucket. Contoh: File_Saya.pdf
        :type bucketfilename: str

        :return: status keberhasilan hapus file, dictionary data file yang dihapus
        :rtype: bool, dict
        """
        status = False
        contents = {}
        contentType = None
        try:
            blob = self.bucket.blob(bucketfilename)
            contentType = blob.content_type
            blob.delete()
            status = True
            contents = {"file_name": f"{bucketfilename}", "file": bucketfilename, "content_type": contentType, "message": "Success Delete File"}
        except Exception as error:
            responseError = error._response.json()
            contents = {"message": "Fail Delete File", "reason": responseError.get("error").get("message")}
            Log.error(f"[SATBUCKET] Fail Delete File | {error} | {sys.exc_info()} |")
        return status, contents
