# ─────────────────────────────────────────────────────────────
# PURCHASE.py — Vehicle Purchase / Buying Transactions
#
# Permissions:
#   admin  → full access
#   sales  → full access
#   viewer → no access
# ─────────────────────────────────────────────────────────────

VALID_STATUSES      = ('pending', 'deposit', 'completed', 'cancelled')
VALID_PAYMENT_TYPES = ('cash', 'installment', 'leasing')


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
# GET PURCHASES (paginated, filterable)
# ─────────────────────────────────────────────────────────────
@exposeApi
def getPurchases_PURCHASE():
    ok, err = _auth_guard()
    if not ok:
        return err

    ajaxData     = request.json.get("data") or {}
    search       = ajaxData.get("search", "")
    status       = ajaxData.get("status", "")
    payment_type = ajaxData.get("paymenttype", "")
    page         = int(ajaxData.get("page", 1) or 1)
    per_page     = 10
    offset       = (page - 1) * per_page
    searchlike   = "%" + search + "%"

    sql_data = """
        SELECT
            p.purchase_id::text             AS purchaseid,
            p.purchase_cust_name            AS purchasecustname,
            p.purchase_cust_phone           AS purchasecustphone,
            v.vehicle_brand                 AS vehiclebrand,
            v.vehicle_name                  AS vehiclename,
            v.vehicle_trim                  AS vehicletrim,
            v.vehicle_year::text            AS vehicleyear,
            v.vehicle_image_path            AS vehicleimagepath,
            p.purchase_sale_price::text     AS purchasesaleprice,
            p.purchase_down_payment::text   AS purchasedownpayment,
            p.purchase_payment_type         AS purchasepaymenttype,
            p.purchase_installment_months::text AS purchaseinstallmentmonths,
            p.purchase_monthly_payment::text    AS purchasemonthlypayment,
            p.purchase_status               AS purchasestatus,
            p.purchase_sale_date::text      AS purchasesaledate,
            p.purchase_notes                AS purchasenotes,
            p.purchase_created_at::text     AS purchasecreatedat
        FROM purchase p
        JOIN vehicle v ON v.vehicle_id = p.purchase_vehicle_id
        WHERE (%(search)s = ''
               OR p.purchase_cust_name ILIKE %(searchlike)s
               OR v.vehicle_brand      ILIKE %(searchlike)s
               OR v.vehicle_name       ILIKE %(searchlike)s)
          AND (%(status)s = '' OR p.purchase_status = %(status)s)
          AND (%(paymenttype)s = '' OR p.purchase_payment_type = %(paymenttype)s)
        ORDER BY p.purchase_created_at DESC
        OFFSET %(offset)s LIMIT %(perpage)s
    """

    sql_count = """
        SELECT COUNT(*) AS total
        FROM purchase p
        JOIN vehicle v ON v.vehicle_id = p.purchase_vehicle_id
        WHERE (%(search)s = ''
               OR p.purchase_cust_name ILIKE %(searchlike)s
               OR v.vehicle_brand      ILIKE %(searchlike)s
               OR v.vehicle_name       ILIKE %(searchlike)s)
          AND (%(status)s = '' OR p.purchase_status = %(status)s)
          AND (%(paymenttype)s = '' OR p.purchase_payment_type = %(paymenttype)s)
    """

    params = {
        "search": search, "searchlike": searchlike,
        "status": status, "paymenttype": payment_type,
        "offset": offset, "perpage": per_page
    }

    r_data  = selectDataHeaderQueryRO(sql_data, params)
    r_count = selectDataHeaderQueryRO(sql_count, params)

    if not r_data["status"]:
        return {"status": False, "data": {}, "msg": "Database error"}

    total = int(r_count["data"][0]["total"]) if r_count["data"] else 0
    return {
        "status": True,
        "data": {"purchases": r_data["data"], "total": total, "page": page, "per_page": per_page},
        "msg": ""
    }


# ─────────────────────────────────────────────────────────────
# GET SINGLE PURCHASE DETAIL
# ─────────────────────────────────────────────────────────────
@exposeApi
def getPurchaseDetail_PURCHASE():
    ok, err = _auth_guard()
    if not ok:
        return err

    ajaxData    = request.json.get("data") or {}
    purchase_id = ajaxData.get("purchaseid", "")

    if not purchase_id:
        return {"status": False, "data": {}, "msg": "purchaseid required"}

    sql = """
        SELECT
            p.purchase_id::text             AS purchaseid,
            p.purchase_vehicle_id::text     AS purchasevehicleid,
            p.purchase_cust_id::text        AS purchasecustid,
            p.purchase_cust_name            AS purchasecustname,
            p.purchase_cust_phone           AS purchasecustphone,
            v.vehicle_brand                 AS vehiclebrand,
            v.vehicle_name                  AS vehiclename,
            v.vehicle_trim                  AS vehicletrim,
            v.vehicle_year::text            AS vehicleyear,
            v.vehicle_price::text           AS vehicleprice,
            v.vehicle_image_path            AS vehicleimagepath,
            p.purchase_sale_price::text     AS purchasesaleprice,
            p.purchase_down_payment::text   AS purchasedownpayment,
            p.purchase_payment_type         AS purchasepaymenttype,
            p.purchase_installment_months::text AS purchaseinstallmentmonths,
            p.purchase_monthly_payment::text    AS purchasemonthlypayment,
            p.purchase_status               AS purchasestatus,
            p.purchase_sale_date::text      AS purchasesaledate,
            p.purchase_notes                AS purchasenotes,
            p.purchase_created_at::text     AS purchasecreatedat,
            p.purchase_create_user          AS purchasecreateuser
        FROM purchase p
        JOIN vehicle v ON v.vehicle_id = p.purchase_vehicle_id
        WHERE p.purchase_id = %(pid)s
    """
    result = selectDataHeaderQueryRO(sql, {"pid": purchase_id})

    if not result["data"]:
        return {"status": False, "data": {}, "msg": "Purchase not found"}

    return {"status": True, "data": result["data"][0], "msg": ""}


# ─────────────────────────────────────────────────────────────
# GET AVAILABLE VEHICLES FOR PURCHASE
# ─────────────────────────────────────────────────────────────
@exposeApi
def getAvailableVehicles_PURCHASE():
    ok, err = _auth_guard()
    if not ok:
        return err

    ajaxData = request.json.get("data") or {}
    search   = ajaxData.get("search", "")
    vtype    = ajaxData.get("type", "")
    searchlike = "%" + search + "%"

    sql = """
        SELECT
            v.vehicle_id::text    AS vehicleid,
            v.vehicle_brand       AS vehiclebrand,
            v.vehicle_name        AS vehiclename,
            v.vehicle_trim        AS vehicletrim,
            v.vehicle_year::text  AS vehicleyear,
            v.vehicle_price::text AS vehicleprice,
            v.vehicle_type        AS vehicletype,
            v.vehicle_is_new::text AS vehicleisnew,
            v.vehicle_image_path  AS vehicleimagepath
        FROM vehicle v
        WHERE v.vehicle_is_deleted = false
          AND v.vehicle_availability = true
          AND (%(search)s = '' OR v.vehicle_brand ILIKE %(searchlike)s
                               OR v.vehicle_name  ILIKE %(searchlike)s)
          AND (%(type)s = '' OR v.vehicle_type = %(type)s)
        ORDER BY v.vehicle_brand, v.vehicle_name
    """
    result = selectDataHeaderQueryRO(sql, {
        "search": search, "searchlike": searchlike, "type": vtype
    })
    return {"status": True, "data": result["data"] if result["status"] else [], "msg": ""}


# ─────────────────────────────────────────────────────────────
# CREATE PURCHASE
# ─────────────────────────────────────────────────────────────
@exposeApi
def createPurchase_PURCHASE():
    ok, err = _auth_guard()
    if not ok:
        return err

    ajaxData            = request.json.get("data") or {}
    vehicle_id          = ajaxData.get("vehicleid", "")
    cust_name           = ajaxData.get("custname", "").strip()
    cust_phone          = ajaxData.get("custphone", "").strip()
    sale_price          = ajaxData.get("saleprice", "")
    down_payment        = ajaxData.get("downpayment", 0)
    payment_type        = ajaxData.get("paymenttype", "cash").strip()
    installment_months  = ajaxData.get("installmentmonths", 0)
    monthly_payment     = ajaxData.get("monthlypayment", 0)
    sale_date           = ajaxData.get("saledate", "")
    notes               = ajaxData.get("notes", "").strip()

    errors = []
    if not vehicle_id:   errors.append("Vehicle is required")
    if not cust_name:    errors.append("Customer name is required")
    if not sale_price:   errors.append("Sale price is required")
    if not sale_date:    errors.append("Sale date is required")
    if payment_type not in VALID_PAYMENT_TYPES:
        errors.append("Payment type must be: cash, installment, or leasing")

    if errors:
        return {"status": False, "data": {}, "msg": "; ".join(errors)}

    try:
        sale_price_f = float(sale_price)
        dp_f = float(down_payment) if down_payment else 0
        mp_f = float(monthly_payment) if monthly_payment else 0
        im   = int(installment_months) if installment_months else 0
        if sale_price_f <= 0:
            return {"status": False, "data": {}, "msg": "Sale price must be greater than 0"}
    except (ValueError, TypeError):
        return {"status": False, "data": {}, "msg": "Invalid numeric value"}

    username = _get_username()

    result = executeDataQuery(
        """INSERT INTO purchase
               (purchase_vehicle_id, purchase_cust_name, purchase_cust_phone,
                purchase_sale_price, purchase_down_payment,
                purchase_payment_type, purchase_installment_months, purchase_monthly_payment,
                purchase_sale_date, purchase_notes,
                purchase_create_user, purchase_update_user)
           VALUES
               (%(vid)s, %(cname)s, %(cphone)s,
                %(sprice)s, %(dp)s,
                %(ptype)s, %(im)s, %(mp)s,
                %(sdate)s, %(notes)s,
                %(user)s, %(user)s)""",
        {
            "vid": vehicle_id, "cname": cust_name, "cphone": cust_phone,
            "sprice": sale_price_f, "dp": dp_f,
            "ptype": payment_type, "im": im, "mp": mp_f,
            "sdate": sale_date, "notes": notes, "user": username
        }
    )

    return {
        "status": result["status"],
        "data": {},
        "msg": "Purchase created" if result["status"] else result["msg"]
    }


# ─────────────────────────────────────────────────────────────
# UPDATE PURCHASE STATUS
# ─────────────────────────────────────────────────────────────
@exposeApi
def updatePurchaseStatus_PURCHASE():
    ok, err = _auth_guard()
    if not ok:
        return err

    ajaxData    = request.json.get("data") or {}
    purchase_id = ajaxData.get("purchaseid", "")
    status      = ajaxData.get("status", "").strip()

    if not purchase_id or not status:
        return {"status": False, "data": {}, "msg": "purchaseid and status required"}

    if status not in VALID_STATUSES:
        return {"status": False, "data": {}, "msg": "Invalid status. Must be one of: " + ", ".join(VALID_STATUSES)}

    username = _get_username()

    # If completing the sale, mark vehicle as sold
    if status == "completed":
        r_check = selectDataHeaderQueryRO(
            "SELECT purchase_vehicle_id FROM purchase WHERE purchase_id = %(pid)s",
            {"pid": purchase_id}
        )
        if r_check["data"]:
            vid = r_check["data"][0]["purchasevehicleid"]
            executeDataQuery(
                "UPDATE vehicle SET vehicle_status='sold', vehicle_availability=false, vehicle_update_user=%(u)s WHERE vehicle_id=%(vid)s",
                {"u": username, "vid": vid}
            )
    elif status == "cancelled":
        # Restore availability if sale is cancelled
        r_check = selectDataHeaderQueryRO(
            "SELECT purchase_vehicle_id FROM purchase WHERE purchase_id = %(pid)s",
            {"pid": purchase_id}
        )
        if r_check["data"]:
            vid = r_check["data"][0]["purchasevehicleid"]
            executeDataQuery(
                "UPDATE vehicle SET vehicle_status='available', vehicle_availability=true, vehicle_update_user=%(u)s WHERE vehicle_id=%(vid)s",
                {"u": username, "vid": vid}
            )

    result = executeDataQuery(
        """UPDATE purchase
           SET purchase_status = %(s)s,
               purchase_update_user = %(u)s,
               purchase_updated_at = NOW()
           WHERE purchase_id = %(pid)s""",
        {"s": status, "u": username, "pid": purchase_id}
    )

    return {
        "status": result["status"],
        "data": {},
        "msg": "Status updated" if result["status"] else result["msg"]
    }


# ─────────────────────────────────────────────────────────────
# DELETE PURCHASE (admin only, pending/cancelled only)
# ─────────────────────────────────────────────────────────────
@exposeApi
def deletePurchase_PURCHASE():
    ok, err = _auth_guard()
    if not ok:
        return err

    if _get_role() != "admin":
        return {"status": False, "data": {}, "msg": "Only admin can delete purchase records"}

    ajaxData    = request.json.get("data") or {}
    purchase_id = ajaxData.get("purchaseid", "")

    if not purchase_id:
        return {"status": False, "data": {}, "msg": "purchaseid required"}

    r_check = selectDataHeaderQueryRO(
        "SELECT purchase_status FROM purchase WHERE purchase_id = %(pid)s",
        {"pid": purchase_id}
    )
    if not r_check["data"]:
        return {"status": False, "data": {}, "msg": "Purchase not found"}

    curr_status = r_check["data"][0]["purchasestatus"]
    if curr_status not in ("pending", "cancelled"):
        return {"status": False, "data": {}, "msg": "Only pending or cancelled purchases can be deleted"}

    result = executeDataQuery(
        "DELETE FROM purchase WHERE purchase_id = %(pid)s",
        {"pid": purchase_id}
    )
    return {
        "status": result["status"],
        "data": {},
        "msg": "Purchase deleted" if result["status"] else result["msg"]
    }


# ─────────────────────────────────────────────────────────────
# GET PURCHASE SUMMARY STATS
# ─────────────────────────────────────────────────────────────
@exposeApi
def getPurchaseStats_PURCHASE():
    ok, err = _auth_guard()
    if not ok:
        return err

    sql = """
        SELECT
            COUNT(*) FILTER (WHERE purchase_status = 'pending')::text    AS pending,
            COUNT(*) FILTER (WHERE purchase_status = 'deposit')::text    AS deposit,
            COUNT(*) FILTER (WHERE purchase_status = 'completed')::text  AS completed,
            COUNT(*) FILTER (WHERE purchase_status = 'cancelled')::text  AS cancelled,
            COUNT(*)::text                                                AS total,
            COALESCE(SUM(purchase_sale_price) FILTER (WHERE purchase_status = 'completed'), 0)::text AS totalrevenue,
            COUNT(*) FILTER (WHERE purchase_payment_type = 'cash')::text         AS cashcount,
            COUNT(*) FILTER (WHERE purchase_payment_type = 'installment')::text  AS installmentcount,
            COUNT(*) FILTER (WHERE purchase_payment_type = 'leasing')::text      AS leasingcount
        FROM purchase
    """
    result = selectHeaderQueryRO(sql)
    return {"status": True, "data": result["data"][0] if result["data"] else {}, "msg": ""}


execVcount = ""
