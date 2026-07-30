# ─────────────────────────────────────────────────────────────
# RENTAL.py — Vehicle Rental Management
#
# Permissions:
#   admin  → full access
#   sales  → full access
#   viewer → no access
# ─────────────────────────────────────────────────────────────

VALID_STATUSES = ('pending', 'confirmed', 'ongoing', 'completed', 'cancelled')


def _get_role():
    logged = session.get("loggedId", {})
    return logged.get("attributes", {}).get("role", "") or logged.get("role", "")


def _auth_guard():
    if not session.get("loggedId"):
        return False, {"status": False, "data": {}, "msg": "Unauthorized"}
    role = _get_role()
    if role == "viewer":
        return False, {"status": False, "data": {}, "msg": "Forbidden: insufficient permissions"}
    return True, None


def _get_username():
    return session.get("loggedId", {}).get("nik", "system")


# ─────────────────────────────────────────────────────────────
# GET RENTALS (paginated, filterable)
# ─────────────────────────────────────────────────────────────
@exposeApi
def getRentals_RENTAL():
    ok, err = _auth_guard()
    if not ok:
        return err

    ajaxData = request.json.get("data") or {}
    search   = ajaxData.get("search", "")
    status   = ajaxData.get("status", "")
    page     = int(ajaxData.get("page", 1) or 1)
    per_page = 10
    offset   = (page - 1) * per_page
    searchlike = "%" + search + "%"

    sql_data = """
        SELECT
            r.rental_id::text           AS rentalid,
            r.rental_cust_name          AS rentalcustname,
            r.rental_cust_phone         AS rentalcustphone,
            v.vehicle_brand             AS vehiclebrand,
            v.vehicle_name              AS vehiclename,
            v.vehicle_trim              AS vehicletrim,
            v.vehicle_year::text        AS vehicleyear,
            r.rental_start_date::text   AS rentalstartdate,
            r.rental_end_date::text     AS rentalenddate,
            r.rental_duration_days::text AS rentaldurationdays,
            r.rental_daily_rate::text   AS rentaldailyrate,
            r.rental_total_price::text  AS rentaltotalprice,
            r.rental_deposit::text      AS rentaldeposit,
            r.rental_status             AS rentalstatus,
            r.rental_notes              AS rentalnotes,
            r.rental_created_at::text   AS rentalcreatedat
        FROM rental r
        JOIN vehicle v ON v.vehicle_id = r.rental_vehicle_id
        WHERE (%(search)s = ''
               OR r.rental_cust_name ILIKE %(searchlike)s
               OR v.vehicle_brand    ILIKE %(searchlike)s
               OR v.vehicle_name     ILIKE %(searchlike)s)
          AND (%(status)s = '' OR r.rental_status = %(status)s)
        ORDER BY r.rental_created_at DESC
        OFFSET %(offset)s LIMIT %(perpage)s
    """

    sql_count = """
        SELECT COUNT(*) AS total
        FROM rental r
        JOIN vehicle v ON v.vehicle_id = r.rental_vehicle_id
        WHERE (%(search)s = ''
               OR r.rental_cust_name ILIKE %(searchlike)s
               OR v.vehicle_brand    ILIKE %(searchlike)s
               OR v.vehicle_name     ILIKE %(searchlike)s)
          AND (%(status)s = '' OR r.rental_status = %(status)s)
    """

    params = {
        "search": search, "searchlike": searchlike,
        "status": status, "offset": offset, "perpage": per_page
    }

    r_data  = selectDataHeaderQueryRO(sql_data, params)
    r_count = selectDataHeaderQueryRO(sql_count, params)

    if not r_data["status"]:
        return {"status": False, "data": {}, "msg": "Database error"}

    total = int(r_count["data"][0]["total"]) if r_count["data"] else 0
    return {
        "status": True,
        "data": {"rentals": r_data["data"], "total": total, "page": page, "per_page": per_page},
        "msg": ""
    }


# ─────────────────────────────────────────────────────────────
# GET SINGLE RENTAL DETAIL
# ─────────────────────────────────────────────────────────────
@exposeApi
def getRentalDetail_RENTAL():
    ok, err = _auth_guard()
    if not ok:
        return err

    ajaxData  = request.json.get("data") or {}
    rental_id = ajaxData.get("rentalid", "")

    if not rental_id:
        return {"status": False, "data": {}, "msg": "rentalid required"}

    sql = """
        SELECT
            r.rental_id::text           AS rentalid,
            r.rental_vehicle_id::text   AS rentalvehicleid,
            r.rental_cust_id::text      AS rentalcustid,
            r.rental_cust_name          AS rentalcustname,
            r.rental_cust_phone         AS rentalcustphone,
            v.vehicle_brand             AS vehiclebrand,
            v.vehicle_name              AS vehiclename,
            v.vehicle_trim              AS vehicletrim,
            v.vehicle_year::text        AS vehicleyear,
            v.vehicle_image_path        AS vehicleimagepath,
            r.rental_start_date::text   AS rentalstartdate,
            r.rental_end_date::text     AS rentalenddate,
            r.rental_duration_days::text AS rentaldurationdays,
            r.rental_daily_rate::text   AS rentaldailyrate,
            r.rental_total_price::text  AS rentaltotalprice,
            r.rental_deposit::text      AS rentaldeposit,
            r.rental_status             AS rentalstatus,
            r.rental_notes              AS rentalnotes,
            r.rental_created_at::text   AS rentalcreatedat,
            r.rental_create_user        AS rentalcreateuser
        FROM rental r
        JOIN vehicle v ON v.vehicle_id = r.rental_vehicle_id
        WHERE r.rental_id = %(rid)s
    """
    result = selectDataHeaderQueryRO(sql, {"rid": rental_id})

    if not result["data"]:
        return {"status": False, "data": {}, "msg": "Rental not found"}

    return {"status": True, "data": result["data"][0], "msg": ""}


# ─────────────────────────────────────────────────────────────
# GET AVAILABLE VEHICLES FOR RENTAL (date-range check)
# ─────────────────────────────────────────────────────────────
@exposeApi
def getAvailableVehicles_RENTAL():
    ok, err = _auth_guard()
    if not ok:
        return err

    ajaxData   = request.json.get("data") or {}
    start_date = ajaxData.get("startdate", "")
    end_date   = ajaxData.get("enddate", "")

    if not start_date or not end_date:
        # Return all available vehicles if no dates given
        sql = """
            SELECT
                vehicle_id::text    AS vehicleid,
                vehicle_brand       AS vehiclebrand,
                vehicle_name        AS vehiclename,
                vehicle_trim        AS vehicletrim,
                vehicle_year::text  AS vehicleyear,
                vehicle_price::text AS vehicleprice,
                vehicle_type        AS vehicletype
            FROM vehicle
            WHERE vehicle_is_deleted = false
              AND vehicle_availability = true
            ORDER BY vehicle_brand, vehicle_name
        """
        result = selectHeaderQueryRO(sql)
    else:
        # Exclude vehicles already rented in overlapping range
        sql = """
            SELECT
                v.vehicle_id::text    AS vehicleid,
                v.vehicle_brand       AS vehiclebrand,
                v.vehicle_name        AS vehiclename,
                v.vehicle_trim        AS vehicletrim,
                v.vehicle_year::text  AS vehicleyear,
                v.vehicle_price::text AS vehicleprice,
                v.vehicle_type        AS vehicletype
            FROM vehicle v
            WHERE v.vehicle_is_deleted = false
              AND v.vehicle_availability = true
              AND v.vehicle_id NOT IN (
                  SELECT rental_vehicle_id
                  FROM rental
                  WHERE rental_status IN ('confirmed','ongoing')
                    AND rental_start_date <= %(end)s
                    AND rental_end_date   >= %(start)s
              )
            ORDER BY v.vehicle_brand, v.vehicle_name
        """
        result = selectDataHeaderQueryRO(sql, {"start": start_date, "end": end_date})

    return {"status": True, "data": result["data"] if result["status"] else [], "msg": ""}


# ─────────────────────────────────────────────────────────────
# CREATE RENTAL
# ─────────────────────────────────────────────────────────────
@exposeApi
def createRental_RENTAL():
    ok, err = _auth_guard()
    if not ok:
        return err

    ajaxData   = request.json.get("data") or {}
    vehicle_id = ajaxData.get("vehicleid", "")
    cust_name  = ajaxData.get("custname", "").strip()
    cust_phone = ajaxData.get("custphone", "").strip()
    start_date = ajaxData.get("startdate", "")
    end_date   = ajaxData.get("enddate", "")
    daily_rate = ajaxData.get("dailyrate", "")
    deposit    = ajaxData.get("deposit", 0)
    notes      = ajaxData.get("notes", "").strip()

    errors = []
    if not vehicle_id:  errors.append("Vehicle is required")
    if not cust_name:   errors.append("Customer name is required")
    if not start_date:  errors.append("Start date is required")
    if not end_date:    errors.append("End date is required")
    if not daily_rate:  errors.append("Daily rate is required")

    if start_date and end_date and end_date <= start_date:
        errors.append("End date must be after start date")

    if errors:
        return {"status": False, "data": {}, "msg": "; ".join(errors)}

    try:
        daily_f   = float(daily_rate)
        deposit_f = float(deposit) if deposit else 0
    except (ValueError, TypeError):
        return {"status": False, "data": {}, "msg": "Invalid rate or deposit value"}

    username = _get_username()

    # Compute derived fields in Python (columns are plain, not GENERATED)
    try:
        from datetime import date as _date
        sd = _date.fromisoformat(start_date)
        ed = _date.fromisoformat(end_date)
        duration_days = (ed - sd).days
        total_price   = round(duration_days * daily_f, 2)
    except Exception:
        duration_days = 0
        total_price   = 0

    result = executeDataQuery(
        """INSERT INTO rental
               (rental_vehicle_id, rental_cust_name, rental_cust_phone,
                rental_start_date, rental_end_date,
                rental_duration_days, rental_daily_rate,
                rental_total_price, rental_deposit, rental_notes,
                rental_create_user, rental_update_user)
           VALUES
               (%(vid)s, %(cname)s, %(cphone)s,
                %(sdate)s, %(edate)s,
                %(days)s, %(rate)s,
                %(total)s, %(deposit)s, %(notes)s,
                %(user)s, %(user)s)""",
        {
            "vid": vehicle_id, "cname": cust_name, "cphone": cust_phone,
            "sdate": start_date, "edate": end_date,
            "days": duration_days, "rate": daily_f,
            "total": total_price, "deposit": deposit_f,
            "notes": notes, "user": username
        }
    )

    return {
        "status": result["status"],
        "data": {},
        "msg": "Rental created" if result["status"] else result["msg"]
    }


# ─────────────────────────────────────────────────────────────
# UPDATE RENTAL STATUS
# ─────────────────────────────────────────────────────────────
@exposeApi
def updateRentalStatus_RENTAL():
    ok, err = _auth_guard()
    if not ok:
        return err

    ajaxData  = request.json.get("data") or {}
    rental_id = ajaxData.get("rentalid", "")
    status    = ajaxData.get("status", "").strip()

    if not rental_id or not status:
        return {"status": False, "data": {}, "msg": "rentalid and status are required"}

    if status not in VALID_STATUSES:
        return {"status": False, "data": {}, "msg": "Invalid status. Must be one of: " + ", ".join(VALID_STATUSES)}

    username = _get_username()

    # Update vehicle_status based on rental status transition
    r_rental = selectDataHeaderQueryRO(
        "SELECT rental_vehicle_id FROM rental WHERE rental_id = %(rid)s",
        {"rid": rental_id}
    )
    if r_rental["data"]:
        vid = r_rental["data"][0]["rentalvehicleid"]
        if status in ("confirmed", "ongoing"):
            executeDataQuery(
                "UPDATE vehicle SET vehicle_status='rented', vehicle_availability=false, vehicle_update_user=%(u)s WHERE vehicle_id=%(vid)s",
                {"u": username, "vid": vid}
            )
        elif status in ("completed", "cancelled"):
            executeDataQuery(
                "UPDATE vehicle SET vehicle_status='available', vehicle_availability=true, vehicle_update_user=%(u)s WHERE vehicle_id=%(vid)s",
                {"u": username, "vid": vid}
            )

    result = executeDataQuery(
        """UPDATE rental
           SET rental_status = %(s)s,
               rental_update_user = %(u)s,
               rental_updated_at = NOW()
           WHERE rental_id = %(rid)s""",
        {"s": status, "u": username, "rid": rental_id}
    )

    return {
        "status": result["status"],
        "data": {},
        "msg": "Status updated" if result["status"] else result["msg"]
    }


# ─────────────────────────────────────────────────────────────
# DELETE RENTAL (only pending/cancelled can be deleted)
# ─────────────────────────────────────────────────────────────
@exposeApi
def deleteRental_RENTAL():
    ok, err = _auth_guard()
    if not ok:
        return err

    role = _get_role()
    if role != "admin":
        return {"status": False, "data": {}, "msg": "Only admin can delete rental records"}

    ajaxData  = request.json.get("data") or {}
    rental_id = ajaxData.get("rentalid", "")

    if not rental_id:
        return {"status": False, "data": {}, "msg": "rentalid required"}

    # Check current status
    r_check = selectDataHeaderQueryRO(
        "SELECT rental_status FROM rental WHERE rental_id = %(rid)s",
        {"rid": rental_id}
    )
    if not r_check["data"]:
        return {"status": False, "data": {}, "msg": "Rental not found"}

    curr_status = r_check["data"][0]["rentalstatus"]
    if curr_status not in ("pending", "cancelled"):
        return {"status": False, "data": {}, "msg": "Only pending or cancelled rentals can be deleted"}

    result = executeDataQuery(
        "DELETE FROM rental WHERE rental_id = %(rid)s",
        {"rid": rental_id}
    )
    return {
        "status": result["status"],
        "data": {},
        "msg": "Rental deleted" if result["status"] else result["msg"]
    }


# ─────────────────────────────────────────────────────────────
# GET RENTAL SUMMARY STATS
# ─────────────────────────────────────────────────────────────
@exposeApi
def getRentalStats_RENTAL():
    ok, err = _auth_guard()
    if not ok:
        return err

    sql = """
        SELECT
            COUNT(*) FILTER (WHERE rental_status = 'pending')::text   AS pending,
            COUNT(*) FILTER (WHERE rental_status = 'confirmed')::text AS confirmed,
            COUNT(*) FILTER (WHERE rental_status = 'ongoing')::text   AS ongoing,
            COUNT(*) FILTER (WHERE rental_status = 'completed')::text AS completed,
            COUNT(*) FILTER (WHERE rental_status = 'cancelled')::text AS cancelled,
            COUNT(*)::text                                             AS total,
            COALESCE(SUM(rental_total_price) FILTER (WHERE rental_status = 'completed'), 0)::text AS totalrevenue
        FROM rental
    """
    result = selectHeaderQueryRO(sql)
    return {"status": True, "data": result["data"][0] if result["data"] else {}, "msg": ""}


execVcount = ""
