import cloudinary
import cloudinary.uploader
import cloudinary.api
import os
import sys
import urllib.request

Log = Logger()

cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME"),
    api_key=os.environ.get("CLOUDINARY_API_KEY"),
    api_secret=os.environ.get("CLOUDINARY_API_SECRET"),
    secure=True
)

class SatBucket():
    def __init__(self, bucket):
        try:
            self.bucket_name = bucket
            self.status = True
        except Exception as error:
            self.status = False
            Log.error(f"[SATBUCKET] Fail to Connect Bucket | {error} | {sys.exc_info()} |")

    def _public_id(self, filename):
        name, _ext = os.path.splitext(filename)
        return f"{self.bucket_name}/{name}"

    def getListObject(self, folder, filename):
        status = False
        folderindex = f"{folder}/{filename}"
        try:
            result = cloudinary.api.resources(type="upload", prefix=f"{self.bucket_name}/{folder}", max_results=500)
            target = self._public_id(f"{folder}/{filename}")
            for res in result.get("resources", []):
                if res["public_id"] == target:
                    status = True
                    break
        except Exception as error:
            Log.error(f"[SATBUCKET] Fail List Object | {error} | {sys.exc_info()} |")
        return status, folderindex

    def uploadFromFileName(self, localfilename, bucketfilename):
        return self._upload(localfilename, bucketfilename)

    def uploadFromFile(self, localfilename, bucketfilename):
        return self._upload(localfilename, bucketfilename)

    def uploadFromBytesFile(self, localfilename, bucketfilename):
        return self._upload(localfilename, bucketfilename)

    def uploadFromStringFile(self, localfilename, bucketfilename):
        return self._upload(localfilename, bucketfilename)

    def _upload(self, localfilename, bucketfilename):
        status = False
        contents = {}
        try:
            result = cloudinary.uploader.upload(localfilename, public_id=self._public_id(bucketfilename), resource_type="auto")
            status = True
            contents = {"file_name": bucketfilename, "content_type": result.get("resource_type"), "url": result.get("secure_url"), "message": "Success Upload File"}
        except Exception as error:
            contents = {"message": "Fail Upload File", "reason": str(error)}
            Log.error(f"[SATBUCKET] Fail Upload File | {error} | {sys.exc_info()} |")
        return status, contents

    def downloadBytesFile(self, bucketfilename):
        status = False
        contents = {}
        try:
            resource = cloudinary.api.resource(self._public_id(bucketfilename))
            with urllib.request.urlopen(resource["secure_url"]) as response:
                file_bytes = response.read()
            status = True
            contents = {"file_name": bucketfilename, "file": file_bytes, "content_type": resource.get("resource_type"), "message": "Success Download File"}
        except Exception as error:
            contents = {"message": "Fail Download File", "reason": str(error)}
            Log.error(f"[SATBUCKET] Fail Download File | {error} | {sys.exc_info()} |")
        return status, contents

    def downloadStringFile(self, bucketfilename):
        return self.downloadBytesFile(bucketfilename)

    def downloadToFileName(self, bucketfilename, localfilename):
        status = False
        contents = {}
        try:
            resource = cloudinary.api.resource(self._public_id(bucketfilename))
            vPath = f"{os.getcwd()}/{localfilename}"
            urllib.request.urlretrieve(resource["secure_url"], vPath)
            status = True
            contents = {"file_name": localfilename, "file": vPath, "content_type": resource.get("resource_type"), "message": "Success Download File"}
        except Exception as error:
            contents = {"message": "Fail Download File", "reason": str(error)}
            Log.error(f"[SATBUCKET] Fail Download File | {error} | {sys.exc_info()} |")
        return status, contents

    def deleteFile(self, bucketfilename):
        status = False
        contents = {}
        try:
            result = cloudinary.uploader.destroy(self._public_id(bucketfilename))
            status = result.get("result") == "ok"
            contents = {"file_name": bucketfilename, "message": "Success Delete File" if status else "Fail Delete File"}
        except Exception as error:
            contents = {"message": "Fail Delete File", "reason": str(error)}
            Log.error(f"[SATBUCKET] Fail Delete File | {error} | {sys.exc_info()} |")
        return status, contents
