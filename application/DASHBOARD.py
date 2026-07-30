# ─────────────────────────────────────────────────────────────
# DASHBOARD.py — Admin Financial Overview
# Admin only: asset value + sell revenue + rental revenue + profit
# ─────────────────────────────────────────────────────────────

def _require_admin():
    logged = session.get("loggedId", {})
    if not logged:
        return False, {"status": False, "data": {}, "msg": "Unauthorized"}
    role = logged.get("attributes", {}).get("role", "") or logged.get("role", "")
    if role != "admin":
        return False, {"status": False, "data": {}, "msg": "Forbidden: admin only"}
    return True, None


@exposeApi
def getFinancialSummary_DASHBOARD():
    """
    Returns:
    - asset_total      : sum of vehicle_price for all non-deleted vehicles
    - asset_available  : sum of vehicle_price for available vehicles
    - asset_rented     : sum of vehicle_price for rented vehicles
    - asset_sold_book  : sum of vehicle_price for sold vehicles (book value)
    - sell_revenue     : sum of purchase_sale_price for completed sales
    - sell_count       : number of completed sales
    - rental_revenue   : sum of rental_total_price for completed rentals
    - rental_count     : number of completed rentals
    - total_profit     : sell_revenue + rental_revenue
    - vehicle_count    : total vehicles
    - available_count  : available vehicles
    - rented_count     : rented vehicles
    - sold_count       : sold vehicles
    """
    ok, err = _require_admin()
    if not ok:
        return err

    sql = """
        SELECT
            -- Asset value breakdown
            COALESCE(SUM(vehicle_price), 0)::text                                          AS asset_total,
            COALESCE(SUM(vehicle_price) FILTER (WHERE vehicle_status = 'available'), 0)::text AS asset_available,
            COALESCE(SUM(vehicle_price) FILTER (WHERE vehicle_status = 'rented'),    0)::text AS asset_rented,
            COALESCE(SUM(vehicle_price) FILTER (WHERE vehicle_status = 'sold'),      0)::text AS asset_sold_book,
            -- Vehicle counts
            COUNT(*)::text                                                              AS vehicle_count,
            COUNT(*) FILTER (WHERE vehicle_status = 'available')::text                AS available_count,
            COUNT(*) FILTER (WHERE vehicle_status = 'rented')::text                   AS rented_count,
            COUNT(*) FILTER (WHERE vehicle_status = 'sold')::text                     AS sold_count
        FROM vehicle
        WHERE vehicle_is_deleted = false
    """
    r_asset = selectHeaderQueryRO(sql)

    sql_sell = """
        SELECT
            COALESCE(SUM(p.purchase_sale_price), 0)::text AS sell_revenue,
            COUNT(*)::text                                 AS sell_count,
            COALESCE(SUM(v.vehicle_cost_price), 0)::text  AS sell_cost,
            COALESCE(SUM(p.purchase_sale_price - v.vehicle_cost_price), 0)::text AS sell_profit
        FROM purchase p
        JOIN vehicle v ON v.vehicle_id = p.purchase_vehicle_id
        WHERE p.purchase_status = 'completed'
    """
    r_sell = selectHeaderQueryRO(sql_sell)

    sql_rent = """
        SELECT
            COALESCE(SUM(rental_total_price), 0)::text AS rental_revenue,
            COUNT(*)::text                              AS rental_count
        FROM rental
        WHERE rental_status = 'completed'
    """
    r_rent = selectHeaderQueryRO(sql_rent)

    if not (r_asset["status"] and r_sell["status"] and r_rent["status"]):
        return {"status": False, "data": {}, "msg": "Database error"}

    asset = r_asset["data"][0]
    sell  = r_sell["data"][0]
    rent  = r_rent["data"][0]

    sell_rev    = float(sell["sellrevenue"]    or 0)
    sell_profit = float(sell.get("sellprofit","0") or 0)
    rent_rev    = float(rent["rentalrevenue"]   or 0)
    total_profit = sell_profit + rent_rev  # real profit after cost

    return {
        "status": True,
        "data": {
            "asset_total":     asset["assettotal"],
            "asset_available": asset["assetavailable"],
            "asset_rented":    asset["assetrented"],
            "asset_sold_book": asset["assetsoldbook"],
            "vehicle_count":   asset["vehiclecount"],
            "available_count": asset["availablecount"],
            "rented_count":    asset["rentedcount"],
            "sold_count":      asset["soldcount"],
            "sell_revenue":    sell["sellrevenue"],
            "sell_count":      sell["sellcount"],
            "sell_cost":       sell.get("sellcost","0"),
            "sell_profit":     sell.get("sellprofit","0"),
            "rental_revenue":  rent["rentalrevenue"],
            "rental_count":    rent["rentalcount"],
            "total_profit":    str(round(total_profit, 2)),
        },
        "msg": ""
    }


@exposeApi
def getMonthlyBreakdown_DASHBOARD():
    """
    Returns last 12 months of sell + rental revenue, grouped by month.
    """
    ok, err = _require_admin()
    if not ok:
        return err

    sql = """
        SELECT
            TO_CHAR(month_date, 'Mon YYYY') AS month,
            month_date::text                AS monthdate,
            COALESCE(sell_rev,   0)::text   AS sellrev,
            COALESCE(rental_rev, 0)::text   AS rentalrev,
            COALESCE(sell_rev + rental_rev, 0)::text AS totalrev
        FROM (
            SELECT generate_series(
                DATE_TRUNC('month', CURRENT_DATE - INTERVAL '11 months'),
                DATE_TRUNC('month', CURRENT_DATE),
                INTERVAL '1 month'
            ) AS month_date
        ) months
        LEFT JOIN (
            SELECT DATE_TRUNC('month', purchase_created_at) AS m,
                   SUM(purchase_sale_price) AS sell_rev
            FROM purchase
            WHERE purchase_status = 'completed'
            GROUP BY 1
        ) s ON s.m = months.month_date
        LEFT JOIN (
            SELECT DATE_TRUNC('month', rental_created_at) AS m,
                   SUM(rental_total_price) AS rental_rev
            FROM rental
            WHERE rental_status = 'completed'
            GROUP BY 1
        ) r ON r.m = months.month_date
        ORDER BY month_date ASC
    """

    result = selectHeaderQueryRO(sql)
    if not result["status"]:
        return {"status": False, "data": [], "msg": "Database error"}

    return {"status": True, "data": result["data"], "msg": ""}


@exposeApi
def getRecentTransactions_DASHBOARD():
    """
    Returns last 10 completed transactions (sales + rentals combined).
    """
    ok, err = _require_admin()
    if not ok:
        return err

    sql = """
        SELECT * FROM (
            SELECT
                'sale'                          AS txtype,
                p.purchase_id::text             AS txid,
                p.purchase_cust_name            AS custname,
                v.vehicle_brand || ' ' || v.vehicle_name AS vehicle,
                p.purchase_sale_price::text     AS amount,
                p.purchase_sale_date::text      AS txdate,
                p.purchase_created_at::text     AS createdat
            FROM purchase p
            JOIN vehicle v ON v.vehicle_id = p.purchase_vehicle_id
            WHERE p.purchase_status = 'completed'

            UNION ALL

            SELECT
                'rental'                        AS txtype,
                r.rental_id::text               AS txid,
                r.rental_cust_name              AS custname,
                v.vehicle_brand || ' ' || v.vehicle_name AS vehicle,
                r.rental_total_price::text      AS amount,
                r.rental_end_date::text         AS txdate,
                r.rental_created_at::text       AS createdat
            FROM rental r
            JOIN vehicle v ON v.vehicle_id = r.rental_vehicle_id
            WHERE r.rental_status = 'completed'
        ) combined
        ORDER BY createdat DESC
        LIMIT 10
    """

    result = selectHeaderQueryRO(sql)
    return {
        "status": True,
        "data": result["data"] if result["status"] else [],
        "msg": ""
    }


@exposeApi
def getPendingTransactions_DASHBOARD():
    """Counts pending rentals and purchases."""
    ok, err = _require_admin()
    if not ok:
        return err

    sql = """
        SELECT
            (SELECT COUNT(*) FROM purchase WHERE purchase_status IN ('pending','deposit'))::text AS pending_sales,
            (SELECT COUNT(*) FROM rental   WHERE rental_status   IN ('pending','confirmed','ongoing'))::text AS active_rentals
    """
    result = selectHeaderQueryRO(sql)
    return {
        "status": True,
        "data": result["data"][0] if result["status"] and result["data"] else {},
        "msg": ""
    }


execVcount = ""
