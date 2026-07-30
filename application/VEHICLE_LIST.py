def _get_role():
    logged = session.get("loggedId", {})
    return logged.get("attributes", {}).get("role", "") or logged.get("role", "")


@exposeApi
def getVehicles_VEHICLE_LIST():
    if not session.get("loggedId"):
        return {"status": False, "data": {}, "msg": "Unauthorized"}

    ajaxData = request.json.get("data") or {}

    search       = ajaxData.get("search", "")
    brand        = ajaxData.get("brand", "")
    vtype        = ajaxData.get("type", "")
    availability = ajaxData.get("availability", "")
    sort_col     = ajaxData.get("sortcol", "")
    sort_dir     = ajaxData.get("sortdir", "asc")
    page         = int(ajaxData.get("page", 1) or 1)

    per_page   = 8
    offset     = (page - 1) * per_page
    searchlike = "%" + search + "%"

    # Safe whitelist — never interpolate user strings directly
    sort_dir_sql = "ASC" if sort_dir != "desc" else "DESC"
    sort_map = {
        "type":      "v.vehicle_type {dir}, v.vehicle_brand ASC",
        "condition": "v.vehicle_is_new {dir}, v.vehicle_brand ASC",
        "price":     "v.vehicle_price {dir}",
        "status":    "v.vehicle_status {dir}, v.vehicle_brand ASC",
    }
    if sort_col in sort_map:
        order_clause = sort_map[sort_col].replace("{dir}", sort_dir_sql)
    else:
        order_clause = "v.vehicle_id DESC"

    sql_data = """
        SELECT
            v.vehicle_id::text            AS vehicleid,
            v.vehicle_type                AS vehicletype,
            v.vehicle_brand               AS vehiclebrand,
            v.vehicle_name                AS vehiclename,
            v.vehicle_trim                AS vehicletrim,
            v.vehicle_year::text          AS vehicleyear,
            v.vehicle_price::text         AS vehicleprice,
            v.vehicle_is_new::text        AS vehicleisnew,
            v.vehicle_mileage::text       AS vehiclemileage,
            v.vehicle_image_path          AS vehicleimagepath,
            v.vehicle_availability::text  AS vehicleavailability,
            v.vehicle_status              AS vehiclestatus,
            vi.image_path                 AS firstimage
        FROM vehicle v
        LEFT JOIN vehicle_image vi
            ON vi.vehicle_id = v.vehicle_id
           AND vi.sort_order = (
               SELECT MIN(sort_order)
               FROM vehicle_image
               WHERE vehicle_id = v.vehicle_id
           )
        WHERE v.vehicle_is_deleted = false
          AND (%(search)s = '' OR v.vehicle_brand ILIKE %(searchlike)s
                               OR v.vehicle_name  ILIKE %(searchlike)s
                               OR v.vehicle_trim  ILIKE %(searchlike)s)
          AND (%(brand)s = '' OR v.vehicle_brand = %(brand)s)
          AND (%(type)s  = '' OR v.vehicle_type  = %(type)s)
          AND (%(availability)s = '' OR v.vehicle_status = %(availability)s)
        ORDER BY {order_clause}
        OFFSET %(offset)s LIMIT 8
    """.format(order_clause=order_clause)

    sql_count = """
        SELECT COUNT(*) AS total
        FROM vehicle v
        WHERE v.vehicle_is_deleted = false
          AND (%(search)s = '' OR v.vehicle_brand ILIKE %(searchlike)s
                               OR v.vehicle_name  ILIKE %(searchlike)s
                               OR v.vehicle_trim  ILIKE %(searchlike)s)
          AND (%(brand)s = '' OR v.vehicle_brand = %(brand)s)
          AND (%(type)s  = '' OR v.vehicle_type  = %(type)s)
          AND (%(availability)s = '' OR v.vehicle_status = %(availability)s)
    """

    params = {
        "search":       search,
        "searchlike":   searchlike,
        "brand":        brand,
        "type":         vtype,
        "availability": availability,
        "offset":       offset,
    }

    result_data  = selectDataHeaderQueryRO(sql_data,  params)
    result_count = selectDataHeaderQueryRO(sql_count, params)

    if not result_data["status"] or not result_count["status"]:
        return {"status": False, "data": {}, "msg": "Database error"}

    total = int(result_count["data"][0]["total"]) if result_count["data"] else 0

    return {
        "status": True,
        "data": {
            "vehicles": result_data["data"],
            "total":    total,
            "page":     page,
            "per_page": per_page
        },
        "msg": ""
    }


@exposeApi
def getGroupedVehicles_VEHICLE_LIST():
    """
    Returns vehicles grouped by brand+name+trim+type.
    Pagination is at GROUP level (8 groups per page).
    Flat mode (price/condition sort) paginates at UNIT level.
    """
    if not session.get("loggedId"):
        return {"status": False, "data": {}, "msg": "Unauthorized"}

    ajaxData      = request.json.get("data") or {}
    search        = ajaxData.get("search", "")
    brand         = ajaxData.get("brand", "")
    vtype         = ajaxData.get("type", "")
    status_filter = ajaxData.get("availability", "")
    sort_col      = ajaxData.get("sortcol", "")
    sort_dir      = ajaxData.get("sortdir", "asc")
    page          = int(ajaxData.get("page", 1) or 1)
    per_page      = 8
    searchlike    = "%" + search + "%"

    sort_dir_sql = "ASC" if sort_dir != "desc" else "DESC"
    unit_order_map = {
        "condition": "v.vehicle_is_new {dir}, v.vehicle_price ASC",
        "price":     "v.vehicle_price {dir}",
        "status":    "v.vehicle_status {dir}, v.vehicle_price ASC",
    }
    unit_order = unit_order_map.get(sort_col, "v.vehicle_id ASC")
    unit_order = unit_order.replace("{dir}", sort_dir_sql)

    sql = """
        SELECT
            v.vehicle_id::text            AS vehicleid,
            v.vehicle_type                AS vehicletype,
            v.vehicle_brand               AS vehiclebrand,
            v.vehicle_name                AS vehiclename,
            v.vehicle_trim                AS vehicletrim,
            v.vehicle_year::text          AS vehicleyear,
            v.vehicle_price::text         AS vehicleprice,
            v.vehicle_is_new::text        AS vehicleisnew,
            v.vehicle_mileage::text       AS vehiclemileage,
            v.vehicle_availability::text  AS vehicleavailability,
            v.vehicle_status              AS vehiclestatus,
            v.vehicle_cost_price::text    AS vehiclecostprice,
            v.vehicle_condition           AS vehiclecondition,
            vi.image_path                 AS firstimage
        FROM vehicle v
        LEFT JOIN vehicle_image vi
            ON vi.vehicle_id = v.vehicle_id
           AND vi.sort_order = (
               SELECT MIN(sort_order)
               FROM vehicle_image
               WHERE vehicle_id = v.vehicle_id
           )
        WHERE v.vehicle_is_deleted = false
          AND (%(search)s = '' OR v.vehicle_brand ILIKE %(searchlike)s
                               OR v.vehicle_name  ILIKE %(searchlike)s
                               OR v.vehicle_trim  ILIKE %(searchlike)s)
          AND (%(brand)s = '' OR v.vehicle_brand = %(brand)s)
          AND (%(type)s  = '' OR v.vehicle_type  = %(type)s)
          AND (%(status_filter)s = '' OR v.vehicle_status = %(status_filter)s)
        ORDER BY v.vehicle_type ASC, v.vehicle_brand ASC,
                 v.vehicle_name ASC, v.vehicle_trim ASC, {unit_order}
    """.format(unit_order=unit_order)

    params = {
        "search": search, "searchlike": searchlike,
        "brand": brand, "type": vtype, "status_filter": status_filter
    }

    result = selectDataHeaderQueryRO(sql, params)
    if not result["status"]:
        return {"status": False, "data": {}, "msg": "Database error"}

    # Group in Python
    from collections import OrderedDict
    groups = OrderedDict()
    for v in result["data"]:
        key = "{}_{}_{}_{}".format(
            v["vehiclebrand"], v["vehiclename"],
            v["vehicletrim"],  v["vehicletype"]
        )
        if key not in groups:
            groups[key] = {
                "groupkey":        key,
                "vehicletype":     v["vehicletype"],
                "vehiclebrand":    v["vehiclebrand"],
                "vehiclename":     v["vehiclename"],
                "vehicletrim":     v["vehicletrim"],
                "firstimage":      v["firstimage"] or "",
                "count_total":     0,
                "count_available": 0,
                "count_rented":    0,
                "count_sold":      0,
                "units": []
            }
        g = groups[key]
        g["count_total"] += 1
        st = v["vehiclestatus"]
        if st == "available": g["count_available"] += 1
        elif st == "rented":  g["count_rented"]    += 1
        elif st == "sold":    g["count_sold"]       += 1
        g["units"].append(v)
        if not g["firstimage"] and v["firstimage"]:
            g["firstimage"] = v["firstimage"]

    group_list = list(groups.values())

    # Sort groups
    if sort_col == "type":
        reverse = (sort_dir_sql == "DESC")
        group_list.sort(key=lambda g: g["vehicletype"], reverse=reverse)
    elif sort_col == "status":
        reverse = (sort_dir_sql == "DESC")
        group_list.sort(key=lambda g: g["count_available"], reverse=not reverse)

    total_units  = len(result["data"])
    total_models = len(group_list)

    # Read gridmode early — grid view always wants ALL units (no server-side pagination)
    gridmode = bool(ajaxData.get("gridmode", False))

    # Flat mode: paginate by units (skip pagination when gridmode=True)
    FLAT_COLS = ("price", "condition")
    if sort_col in FLAT_COLS:
        all_units = []
        for g in group_list:
            for u in g["units"]:
                u["_grouplabel"] = g["vehiclebrand"] + " " + g["vehiclename"] + " " + g["vehicletrim"]
                u["_firstimage"] = g["firstimage"]
                all_units.append(u)
        def unit_sort_key(u):
            if sort_col == "price":     return float(u["vehicleprice"]) if u["vehicleprice"] else 0
            if sort_col == "condition": return 0 if u["vehicleisnew"] == "true" else 1
            return 0
        all_units.sort(key=unit_sort_key, reverse=(sort_dir_sql == "DESC"))
        total_flat = len(all_units)
        if gridmode:
            # Return ALL units unpaginated so client can sort+paginate freely
            return {
                "status": True,
                "data": {
                    "mode":         "flat",
                    "units":        all_units,
                    "total_units":  total_flat,
                    "total_models": total_models,
                    "page":         1,
                    "per_page":     total_flat or 1,
                },
                "msg": ""
            }
        offset      = (page - 1) * per_page
        paged_units = all_units[offset: offset + per_page]
        return {
            "status": True,
            "data": {
                "mode":        "flat",
                "units":       paged_units,
                "total_units": total_flat,
                "total_models": total_models,
                "page":        page,
                "per_page":    per_page,
            },
            "msg": ""
        }
    if gridmode:
        # Return all groups unpaginated for grid view
        return {
            "status": True,
            "data": {
                "mode":         "grouped",
                "groups":       group_list,
                "total_units":  total_units,
                "total_models": total_models,
                "page":         1,
                "per_page":     total_models or 1,
            },
            "msg": ""
        }

    offset        = (page - 1) * per_page
    paged_groups  = group_list[offset: offset + per_page]
    return {
        "status": True,
        "data": {
            "mode":         "grouped",
            "groups":       paged_groups,
            "total_units":  total_units,
            "total_models": total_models,
            "page":         page,
            "per_page":     per_page,
        },
        "msg": ""
    }


@exposeApi
def getBrands_VEHICLE_LIST():
    if not session.get("loggedId"):
        return {"status": False, "data": {}, "msg": "Unauthorized"}

    sql = """
        SELECT DISTINCT vehicle_brand AS vehiclebrand
        FROM vehicle
        WHERE vehicle_is_deleted = false
        ORDER BY vehicle_brand
    """
    result = selectHeaderQueryRO(sql)
    if not result["status"]:
        return {"status": False, "data": [], "msg": "Database error"}
    return {"status": True, "data": result["data"], "msg": ""}


@exposeApi
def getVehicleDetail_VEHICLE_LIST():
    if not session.get("loggedId"):
        return {"status": False, "data": {}, "msg": "Unauthorized"}

    ajaxData   = request.json.get("data") or {}
    vehicle_id = ajaxData.get("vehicle_id", "")

    if not vehicle_id:
        return {"status": False, "data": {}, "msg": "vehicle_id is required"}

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
            vehicle_image_path          AS vehicleimagepath,
            vehicle_availability::text  AS vehicleavailability,
            vehicle_status              AS vehiclestatus,
            vehicle_cost_price::text    AS vehiclecostprice
        FROM vehicle
        WHERE vehicle_id = %(vehicleid)s
          AND vehicle_is_deleted = false
    """

    sql_images = """
        SELECT
            image_path   AS imagepath,
            sort_order::text AS sortorder
        FROM vehicle_image
        WHERE vehicle_id = %(vehicleid)s
        ORDER BY sort_order
    """

    params = {"vehicleid": vehicle_id}

    result_vehicle = selectDataHeaderQueryRO(sql_vehicle, params)
    result_images  = selectDataHeaderQueryRO(sql_images,  params)

    if not result_vehicle["status"]:
        return {"status": False, "data": {}, "msg": "Database error"}

    if not result_vehicle["data"]:
        return {"status": False, "data": {}, "msg": "Vehicle not found"}

    return {
        "status": True,
        "data": {
            "vehicle": result_vehicle["data"][0],
            "images":  result_images["data"] if result_images["status"] else []
        },
        "msg": ""
    }


@exposeApi
def deleteVehicle_VEHICLE_LIST():
    if not session.get("loggedId"):
        return {"status": False, "data": {}, "msg": "Unauthorized"}

    if _get_role() != "admin":
        return {"status": False, "data": {}, "msg": "Forbidden"}

    ajaxData   = request.json.get("data") or {}
    vehicle_id = ajaxData.get("vehicleid", "")

    if not vehicle_id:
        return {"status": False, "data": {}, "msg": "vehicleid is required"}

    sql = """
        UPDATE vehicle
        SET vehicle_is_deleted = true
        WHERE vehicle_id = %(vehicleid)s
    """

    result = executeDataQuery(sql, {"vehicleid": vehicle_id})

    if not result["status"]:
        return {"status": False, "data": {}, "msg": "Failed to delete vehicle"}

    return {"status": True, "data": {}, "msg": "Vehicle removed"}


execVcount = ""
