def _get_role():
    logged = session.get("loggedId", {})
    return logged.get("attributes", {}).get("role", "") or logged.get("role", "")


@exposeApi
def uploadVehicleImage_VEHICLE_ADD():
    loggedId = session.get("loggedId", {})
    if not loggedId:
        return {"status": False, "data": {}, "msg": "Unauthorized"}
    if _get_role() != "admin":
        return {"status": False, "data": {}, "msg": "Forbidden"}

    ajaxData = request.json.get("data")
    filename = ajaxData.get("filename", "")
    filedata = ajaxData.get("filedata", "")
    mimetype = ajaxData.get("mimetype", "image/jpeg")

    if not filedata:
        return {"status": False, "data": {}, "msg": "No file data provided"}

    # Determine extension from filename or mimetype
    ext = "jpg"
    if filename:
        parts = filename.rsplit(".", 1)
        if len(parts) == 2:
            ext = parts[1].lower()
            if ext not in ("jpg", "jpeg", "png", "webp"):
                ext = "jpg"
    elif mimetype:
        mime_map = {
            "image/jpeg": "jpg",
            "image/jpg": "jpg",
            "image/png": "png",
            "image/webp": "webp"
        }
        ext = mime_map.get(mimetype, "jpg")

    # Decode base64 data
    import base64
    import time
    import os

    try:
        data = base64.b64decode(filedata)
    except Exception:
        return {"status": False, "data": {}, "msg": "Invalid base64 data"}

    # Generate timestamped filename
    timestamp = str(int(time.time() * 1000))
    new_filename = "vehicle_{}.{}".format(timestamp, ext)

    # Vercel's filesystem is read-only at request time, so local disk saves
    # silently don't persist there. When Cloudinary credentials are present
    # (works on Vercel or anywhere), upload there instead. Everywhere else
    # (Render, a VPS, local dev without Cloudinary set up) keeps saving to
    # static/uploads/vehicles exactly as before.
    use_cloudinary = os.environ.get("CLOUDINARY_CLOUD_NAME") and os.environ.get("CLOUDINARY_API_KEY") and os.environ.get("CLOUDINARY_API_SECRET")

    if use_cloudinary:
        try:
            import cloudinary
            import cloudinary.uploader
            import io

            cloudinary.config(
                cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME"),
                api_key=os.environ.get("CLOUDINARY_API_KEY"),
                api_secret=os.environ.get("CLOUDINARY_API_SECRET"),
                secure=True
            )

            upload_result = cloudinary.uploader.upload(
                io.BytesIO(data),
                public_id="vehicles/vehicle_{}".format(timestamp),
                folder="vdms",
                resource_type="image"
            )

            return {"status": True, "data": {"path": upload_result.get("secure_url")}, "msg": ""}
        except Exception as e:
            return {"status": False, "data": {}, "msg": "Failed to upload to storage: {}".format(str(e))}

    save_folder = "static/uploads/vehicles"
    os.makedirs(save_folder, exist_ok=True)
    save_path = os.path.join(save_folder, new_filename)

    try:
        with open(save_path, "wb") as f:
            f.write(data)
    except Exception as e:
        return {"status": False, "data": {}, "msg": "Failed to save file: {}".format(str(e))}

    return {
        "status": True,
        "data": {"path": "static/uploads/vehicles/{}".format(new_filename)},
        "msg": ""
    }


@exposeApi
def getVehicleForEdit_VEHICLE_ADD():
    loggedId = session.get("loggedId", {})
    if not loggedId:
        return {"status": False, "data": {}, "msg": "Unauthorized"}
    if _get_role() != "admin":
        return {"status": False, "data": {}, "msg": "Forbidden"}

    ajaxData = request.json.get("data")
    vehicle_id = ajaxData.get("vehicle_id", "")

    if not vehicle_id:
        return {"status": False, "data": {}, "msg": "Vehicle ID is required"}

    sql_vehicle = """
        SELECT
            vehicle_id::text            AS vehicleid,
            vehicle_type                AS vehicletype,
            vehicle_brand               AS vehiclebrand,
            vehicle_name                AS vehiclename,
            vehicle_trim                AS vehicletrim,
            vehicle_year::text          AS vehicleyear,
            vehicle_price::text         AS vehicleprice,
            vehicle_condition           AS vehiclecondition,
            vehicle_is_new::text        AS vehicleisnew,
            vehicle_mileage::text       AS vehiclemileage,
            vehicle_availability::text  AS vehicleavailability,
            vehicle_status              AS vehiclestatus,
            vehicle_cost_price::text    AS vehiclecostprice,
            vehicle_is_deleted::text    AS vehicleisdeleted
        FROM vehicle
        WHERE vehicle_id = %(vehicleid)s
          AND vehicle_is_deleted = false
    """
    result_vehicle = selectDataHeaderQueryRO(sql_vehicle, {"vehicleid": vehicle_id})

    if not result_vehicle["status"]:
        return {"status": False, "data": {}, "msg": "Database error"}

    if not result_vehicle["data"]:
        return {"status": False, "data": {}, "msg": "Vehicle not found"}

    sql_images = """
        SELECT
            image_path  AS imagepath,
            sort_order::text AS sortorder
        FROM vehicle_image
        WHERE vehicle_id = %(vehicleid)s
        ORDER BY sort_order ASC
    """
    result_images = selectDataHeaderQueryRO(sql_images, {"vehicleid": vehicle_id})

    images = result_images["data"] if result_images["status"] else []

    return {
        "status": True,
        "data": {
            "vehicle": result_vehicle["data"][0],
            "images": images
        },
        "msg": ""
    }


@exposeApi
def saveVehicle_VEHICLE_ADD():
    loggedId = session.get("loggedId", {})
    if not loggedId:
        return {"status": False, "data": {}, "msg": "Unauthorized"}
    if _get_role() != "admin":
        return {"status": False, "data": {}, "msg": "Forbidden"}

    ajaxData = request.json.get("data")

    vtype        = str(ajaxData.get("type", "")).strip()
    vbrand       = str(ajaxData.get("brand", "")).strip()
    vname        = str(ajaxData.get("name", "")).strip()
    vtrim        = str(ajaxData.get("trim", "")).strip()
    vyear        = str(ajaxData.get("year", "")).strip() if ajaxData.get("year") is not None else ""
    vprice       = str(ajaxData.get("price", "")).strip() if ajaxData.get("price") is not None else ""
    vcondition   = str(ajaxData.get("condition", "")).strip()
    visnew       = ajaxData.get("isnew", True)
    vmileage     = ajaxData.get("mileage", 0)
    vavailability = ajaxData.get("availability", True)
    vstatus      = ajaxData.get("vstatus", "available")
    if vstatus not in ("available", "rented", "sold"):
        vstatus = "available"
    vcostprice   = ajaxData.get("costprice", "0") or "0"
    images       = ajaxData.get("images", [])

    # Server-side validation
    errors = []
    if not vbrand:   errors.append("Brand is required")
    if not vname:    errors.append("Vehicle Name is required")
    if not vtrim:    errors.append("Trim is required")
    if not vyear:    errors.append("Year is required")
    if not vprice:   errors.append("Price is required")
    if vyear:
        try:
            year_int = int(vyear)
            if year_int < 1900 or year_int > 2030:
                errors.append("Year must be between 1900 and 2030")
        except ValueError:
            errors.append("Year must be a valid number")
    if vprice:
        try:
            price_float = float(vprice)
            if price_float <= 0:
                errors.append("Price must be greater than 0")
        except ValueError:
            errors.append("Price must be a valid number")
    if errors:
        return {"status": False, "data": {}, "msg": "Validation error: " + "; ".join(errors)}

    username = loggedId.get("nik", "") or "admin"
    vavailability = (vstatus == "available")

    # Step 1: Pre-fetch next ID
    seq_result = selectHeaderQuery("SELECT nextval('vehicle_vehicle_id_seq') AS newid")
    if not seq_result["status"] or not seq_result["data"]:
        return {"status": False, "data": {}, "msg": "Failed to generate vehicle ID"}
    new_id = seq_result["data"][0]["newid"]

    # Step 2: INSERT
    sql_insert = """
        INSERT INTO vehicle (
            vehicle_id,
            vehicle_type, vehicle_brand, vehicle_name, vehicle_trim,
            vehicle_year, vehicle_price, vehicle_condition, vehicle_is_new,
            vehicle_mileage, vehicle_availability, vehicle_status, vehicle_cost_price,
            vehicle_create_user, vehicle_update_user
        ) VALUES (
            %(vid)s,
            %(vtype)s, %(vbrand)s, %(vname)s, %(vtrim)s,
            %(vyear)s, %(vprice)s, %(vcondition)s, %(visnew)s,
            %(vmileage)s, %(vavailability)s, %(vstatus)s, %(vcostprice)s,
            %(user)s, %(user)s
        )
    """
    params = {
        "vid": new_id, "vtype": vtype, "vbrand": vbrand, "vname": vname,
        "vtrim": vtrim, "vyear": int(vyear), "vprice": float(vprice),
        "vcondition": vcondition, "visnew": visnew,
        "vmileage": int(vmileage) if vmileage else 0,
        "vavailability": vavailability, "vstatus": vstatus,
        "vcostprice": float(vcostprice) if vcostprice else 0,
        "user": username
    }

    result = executeDataQuery(sql_insert, params)

    if not result["status"]:
        return {"status": False, "data": {}, "msg": "Failed to save vehicle: " + str(result.get("msg", ""))}

    # Step 3: Insert images using the known new_id
    for idx, img in enumerate(images):
        img_path = img.get("path", "")
        if img_path:
            sql_img = """
                INSERT INTO vehicle_image (vehicle_id, image_path, sort_order)
                VALUES (%(vehicleid)s, %(imgpath)s, %(sortorder)s)
            """
            executeDataQuery(sql_img, {
                "vehicleid": new_id,
                "imgpath": img_path,
                "sortorder": idx
            })

    return {
        "status": True,
        "data": {"vehicleid": str(new_id)},
        "msg": "Vehicle saved"
    }


@exposeApi
def updateVehicle_VEHICLE_ADD():
    loggedId = session.get("loggedId", {})
    if not loggedId:
        return {"status": False, "data": {}, "msg": "Unauthorized"}
    if _get_role() != "admin":
        return {"status": False, "data": {}, "msg": "Forbidden"}

    ajaxData = request.json.get("data")

    vehicleid    = ajaxData.get("vehicleid", "")
    vtype        = str(ajaxData.get("type", "")).strip()
    vbrand       = str(ajaxData.get("brand", "")).strip()
    vname        = str(ajaxData.get("name", "")).strip()
    vtrim        = str(ajaxData.get("trim", "")).strip()
    vyear        = str(ajaxData.get("year", "")).strip() if ajaxData.get("year") is not None else ""
    vprice       = str(ajaxData.get("price", "")).strip() if ajaxData.get("price") is not None else ""
    vcondition   = str(ajaxData.get("condition", "")).strip()
    visnew       = ajaxData.get("isnew", True)
    vmileage     = ajaxData.get("mileage", 0)
    vavailability = ajaxData.get("availability", True)
    vstatus      = ajaxData.get("vstatus", "available")
    if vstatus not in ("available", "rented", "sold"):
        vstatus = "available"
    vavailability = (vstatus == "available")
    vcostprice   = ajaxData.get("costprice", "0") or "0"
    images       = ajaxData.get("images", [])

    if not vehicleid:
        return {"status": False, "data": {}, "msg": "Vehicle ID is required"}

    # Server-side validation
    errors = []
    if not vbrand:
        errors.append("Brand is required")
    if not vname:
        errors.append("Vehicle Name is required")
    if not vtrim:
        errors.append("Trim is required")
    if not vyear:
        errors.append("Year is required")
    if not vprice:
        errors.append("Price is required")

    if vyear:
        try:
            year_int = int(vyear)
            if year_int < 1900 or year_int > 2030:
                errors.append("Year must be between 1900 and 2030")
        except ValueError:
            errors.append("Year must be a valid number")

    if vprice:
        try:
            price_float = float(vprice)
            if price_float <= 0:
                errors.append("Price must be greater than 0")
        except ValueError:
            errors.append("Price must be a valid number")

    if errors:
        return {"status": False, "data": {}, "msg": "Validation error: " + "; ".join(errors)}

    username = loggedId.get("nik", "") or "admin"

    sql_update = """
        UPDATE vehicle SET
            vehicle_type         = %(vtype)s,
            vehicle_brand        = %(vbrand)s,
            vehicle_name         = %(vname)s,
            vehicle_trim         = %(vtrim)s,
            vehicle_year         = %(vyear)s,
            vehicle_price        = %(vprice)s,
            vehicle_condition    = %(vcondition)s,
            vehicle_is_new       = %(visnew)s,
            vehicle_mileage      = %(vmileage)s,
            vehicle_availability = %(vavailability)s,
            vehicle_status       = %(vstatus)s,
            vehicle_cost_price   = %(vcostprice)s,
            vehicle_update_user  = %(user)s
        WHERE vehicle_id = %(vehicleid)s
    """
    params = {
        "vtype": vtype, "vbrand": vbrand, "vname": vname, "vtrim": vtrim,
        "vyear": int(vyear), "vprice": float(vprice), "vcondition": vcondition,
        "visnew": visnew, "vmileage": int(vmileage) if vmileage else 0,
        "vavailability": vavailability, "vstatus": vstatus,
        "vcostprice": float(vcostprice) if vcostprice else 0,
        "user": username, "vehicleid": vehicleid
    }

    result_update = executeDataQuery(sql_update, params)

    if not result_update["status"]:
        return {"status": False, "data": {}, "msg": "Failed to update vehicle"}

    # Delete old images and re-insert
    sql_del_img = "DELETE FROM vehicle_image WHERE vehicle_id = %(vehicleid)s"
    executeDataQuery(sql_del_img, {"vehicleid": vehicleid})

    for idx, img in enumerate(images):
        img_path = img.get("path", "")
        if img_path:
            sql_img = """
                INSERT INTO vehicle_image (vehicle_id, image_path, sort_order)
                VALUES (%(vehicleid)s, %(imgpath)s, %(sortorder)s)
            """
            executeDataQuery(sql_img, {
                "vehicleid": vehicleid,
                "imgpath": img_path,
                "sortorder": idx
            })

    return {
        "status": True,
        "data": {},
        "msg": "Vehicle updated"
    }


@exposeApi
def removeVehicle_VEHICLE_ADD():
    loggedId = session.get("loggedId", {})
    if not loggedId:
        return {"status": False, "data": {}, "msg": "Unauthorized"}
    if _get_role() != "admin":
        return {"status": False, "data": {}, "msg": "Forbidden"}

    ajaxData = request.json.get("data")
    vehicleid = ajaxData.get("vehicleid", "")

    if not vehicleid:
        return {"status": False, "data": {}, "msg": "Vehicle ID is required"}

    sql = "UPDATE vehicle SET vehicle_is_deleted = true WHERE vehicle_id = %(vehicleid)s"
    result = executeDataQuery(sql, {"vehicleid": vehicleid})

    if not result["status"]:
        return {"status": False, "data": {}, "msg": "Failed to remove vehicle"}

    return {
        "status": True,
        "data": {},
        "msg": "Vehicle removed"
    }


execVcount = ""
