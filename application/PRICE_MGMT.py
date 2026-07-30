# ─────────────────────────────────────────────────────────────
# PRICE_MGMT.py — Vehicle Price Management
#
# Permissions:
#   admin  → full access (update prices, view history)
#   sales  → view prices and history only
#   viewer → no access
# ─────────────────────────────────────────────────────────────

def _get_role():
    logged = session.get("loggedId", {})
    return logged.get("attributes", {}).get("role", "") or logged.get("role", "")


def _auth_guard(write=False):
    if not session.get("loggedId"):
        return False, {"status": False, "data": {}, "msg": "Unauthorized"}
    role = _get_role()
    if role == "viewer":
        return False, {"status": False, "data": {}, "msg": "Forbidden: insufficient permissions"}
    if write and role != "admin":
        return False, {"status": False, "data": {}, "msg": "Forbidden: admin only"}
    return True, None


# ─────────────────────────────────────────────────────────────
# GET ALL VEHICLES WITH CURRENT PRICE
# ─────────────────────────────────────────────────────────────
@exposeApi
def getVehiclePrices_PRICE_MGMT():
    ok, err = _auth_guard(write=False)
    if not ok:
        return err

    ajaxData = request.json.get("data") or {}
    search = ajaxData.get("search", "")
    vtype  = ajaxData.get("type", "")
    page   = int(ajaxData.get("page", 1) or 1)
    per_page = 15
    offset   = (page - 1) * per_page
    searchlike = "%" + search + "%"

    sql_data = """
        SELECT
            v.vehicle_id::text         AS vehicleid,
            v.vehicle_type             AS vehicletype,
            v.vehicle_brand            AS vehiclebrand,
            v.vehicle_name             AS vehiclename,
            v.vehicle_trim             AS vehicletrim,
            v.vehicle_year::text       AS vehicleyear,
            v.vehicle_price::text      AS vehicleprice,
            v.vehicle_is_new::text     AS vehicleisnew,
            v.vehicle_availability::text AS vehicleavailability,
            (SELECT ph_new_price::text
               FROM price_history
              WHERE ph_vehicle_id = v.vehicle_id
              ORDER BY ph_changed_at DESC
              LIMIT 1)                 AS lastpricechange,
            (SELECT ph_changed_at::text
               FROM price_history
              WHERE ph_vehicle_id = v.vehicle_id
              ORDER BY ph_changed_at DESC
              LIMIT 1)                 AS lastchangedat,
            (SELECT COUNT(*)::text
               FROM price_history
              WHERE ph_vehicle_id = v.vehicle_id) AS changecount
        FROM vehicle v
        WHERE v.vehicle_is_deleted = false
          AND (%(search)s = '' OR v.vehicle_brand ILIKE %(searchlike)s
                               OR v.vehicle_name  ILIKE %(searchlike)s
                               OR v.vehicle_trim  ILIKE %(searchlike)s)
          AND (%(type)s = '' OR v.vehicle_type = %(type)s)
        ORDER BY v.vehicle_brand, v.vehicle_name
        OFFSET %(offset)s LIMIT %(perpage)s
    """

    sql_count = """
        SELECT COUNT(*) AS total
        FROM vehicle v
        WHERE v.vehicle_is_deleted = false
          AND (%(search)s = '' OR v.vehicle_brand ILIKE %(searchlike)s
                               OR v.vehicle_name  ILIKE %(searchlike)s
                               OR v.vehicle_trim  ILIKE %(searchlike)s)
          AND (%(type)s = '' OR v.vehicle_type = %(type)s)
    """

    params = {
        "search": search, "searchlike": searchlike,
        "type": vtype, "offset": offset, "perpage": per_page
    }

    r_data  = selectDataHeaderQueryRO(sql_data, params)
    r_count = selectDataHeaderQueryRO(sql_count, params)

    if not r_data["status"]:
        return {"status": False, "data": {}, "msg": "Database error"}

    total = int(r_count["data"][0]["total"]) if r_count["data"] else 0
    return {
        "status": True,
        "data": {"vehicles": r_data["data"], "total": total, "page": page, "per_page": per_page},
        "msg": ""
    }


# ─────────────────────────────────────────────────────────────
# GET PRICE HISTORY FOR ONE VEHICLE
# ─────────────────────────────────────────────────────────────
@exposeApi
def getPriceHistory_PRICE_MGMT():
    ok, err = _auth_guard(write=False)
    if not ok:
        return err

    ajaxData   = request.json.get("data") or {}
    vehicle_id = ajaxData.get("vehicleid", "")

    if not vehicle_id:
        return {"status": False, "data": {}, "msg": "vehicleid required"}

    sql = """
        SELECT
            ph.ph_id::text          AS phid,
            ph.ph_old_price::text   AS phold,
            ph.ph_new_price::text   AS phnew,
            ph.ph_change_pct::text  AS phchangepct,
            ph.ph_reason            AS phreason,
            ph.ph_changed_by        AS phchangedby,
            ph.ph_changed_at::text  AS phchangedat
        FROM price_history ph
        WHERE ph.ph_vehicle_id = %(vid)s
        ORDER BY ph.ph_changed_at DESC
    """
    result = selectDataHeaderQueryRO(sql, {"vid": vehicle_id})

    # Also fetch vehicle summary
    sql_v = """
        SELECT
            vehicle_id::text    AS vehicleid,
            vehicle_brand       AS vehiclebrand,
            vehicle_name        AS vehiclename,
            vehicle_trim        AS vehicletrim,
            vehicle_year::text  AS vehicleyear,
            vehicle_price::text AS vehicleprice
        FROM vehicle
        WHERE vehicle_id = %(vid)s AND vehicle_is_deleted = false
    """
    r_v = selectDataHeaderQueryRO(sql_v, {"vid": vehicle_id})

    return {
        "status": True,
        "data": {
            "history": result["data"] if result["status"] else [],
            "vehicle": r_v["data"][0] if r_v["status"] and r_v["data"] else {}
        },
        "msg": ""
    }


# ─────────────────────────────────────────────────────────────
# UPDATE SINGLE VEHICLE PRICE
# ─────────────────────────────────────────────────────────────
@exposeApi
def updatePrice_PRICE_MGMT():
    ok, err = _auth_guard(write=True)
    if not ok:
        return err

    ajaxData   = request.json.get("data") or {}
    vehicle_id = ajaxData.get("vehicleid", "")
    new_price  = ajaxData.get("newprice", "")
    reason     = ajaxData.get("reason", "").strip()

    if not vehicle_id or not new_price:
        return {"status": False, "data": {}, "msg": "vehicleid and newprice are required"}

    try:
        new_price_f = float(new_price)
        if new_price_f <= 0:
            return {"status": False, "data": {}, "msg": "Price must be greater than 0"}
    except ValueError:
        return {"status": False, "data": {}, "msg": "Invalid price value"}

    # Fetch current price
    r_cur = selectDataHeaderQueryRO(
        "SELECT vehicle_price::text AS vp FROM vehicle WHERE vehicle_id = %(vid)s AND vehicle_is_deleted = false",
        {"vid": vehicle_id}
    )
    if not r_cur["data"]:
        return {"status": False, "data": {}, "msg": "Vehicle not found"}

    old_price_f = float(r_cur["data"][0]["vp"])
    change_pct  = round((new_price_f - old_price_f) / old_price_f * 100, 2) if old_price_f else 0

    logged   = session.get("loggedId", {})
    username = logged.get("nik", "admin")

    # Update price
    r_upd = executeDataQuery(
        "UPDATE vehicle SET vehicle_price = %(p)s, vehicle_update_user = %(u)s WHERE vehicle_id = %(vid)s",
        {"p": new_price_f, "u": username, "vid": vehicle_id}
    )
    if not r_upd["status"]:
        return {"status": False, "data": {}, "msg": "Failed to update price"}

    # Insert history
    executeDataQuery(
        """INSERT INTO price_history
               (ph_vehicle_id, ph_old_price, ph_new_price, ph_change_pct, ph_reason, ph_changed_by)
           VALUES (%(vid)s, %(old)s, %(new)s, %(pct)s, %(reason)s, %(user)s)""",
        {"vid": vehicle_id, "old": old_price_f, "new": new_price_f,
         "pct": change_pct, "reason": reason, "user": username}
    )

    return {"status": True, "data": {"changepct": change_pct}, "msg": "Price updated"}


# ─────────────────────────────────────────────────────────────
# BULK PRICE UPDATE (percentage adjustment)
# ─────────────────────────────────────────────────────────────
@exposeApi
def bulkUpdatePrice_PRICE_MGMT():
    ok, err = _auth_guard(write=True)
    if not ok:
        return err

    ajaxData    = request.json.get("data") or {}
    vehicle_ids = ajaxData.get("vehicleids", [])   # list of id strings
    adjustment  = ajaxData.get("adjustment", "")   # percentage, e.g. 5 = +5%, -3 = -3%
    reason      = ajaxData.get("reason", "").strip()

    if not vehicle_ids:
        return {"status": False, "data": {}, "msg": "No vehicles selected"}

    try:
        adj_f = float(adjustment)
    except (ValueError, TypeError):
        return {"status": False, "data": {}, "msg": "Invalid adjustment percentage"}

    logged   = session.get("loggedId", {})
    username = logged.get("nik", "admin")

    updated = 0
    for vid in vehicle_ids:
        r_cur = selectDataHeaderQueryRO(
            "SELECT vehicle_price::text AS vp FROM vehicle WHERE vehicle_id = %(vid)s AND vehicle_is_deleted = false",
            {"vid": vid}
        )
        if not r_cur["data"]:
            continue

        old_price_f = float(r_cur["data"][0]["vp"])
        new_price_f = round(old_price_f * (1 + adj_f / 100), 2)
        if new_price_f <= 0:
            continue

        executeDataQuery(
            "UPDATE vehicle SET vehicle_price = %(p)s, vehicle_update_user = %(u)s WHERE vehicle_id = %(vid)s",
            {"p": new_price_f, "u": username, "vid": vid}
        )
        executeDataQuery(
            """INSERT INTO price_history
                   (ph_vehicle_id, ph_old_price, ph_new_price, ph_change_pct, ph_reason, ph_changed_by)
               VALUES (%(vid)s, %(old)s, %(new)s, %(pct)s, %(reason)s, %(user)s)""",
            {"vid": vid, "old": old_price_f, "new": new_price_f,
             "pct": adj_f, "reason": reason or "Bulk adjustment {}%".format(adj_f), "user": username}
        )
        updated += 1

    return {
        "status": True,
        "data": {"updated": updated},
        "msg": "Updated {} vehicle(s)".format(updated)
    }


execVcount = ""
