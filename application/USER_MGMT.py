# ─────────────────────────────────────────────────────────────
# USER_MGMT.py — User & Role Management
#
# Role permissions matrix:
#   admin  → full access (manage users, vehicles, prices, rentals, purchases)
#   sales  → can manage rentals & purchases, view vehicles/prices; cannot manage users
#   viewer → read-only access to vehicle list only
# ─────────────────────────────────────────────────────────────

VALID_ROLES = ('admin', 'sales', 'viewer')

ROLE_LABELS = {
    'admin':  'Administrator',
    'sales':  'Sales Staff',
    'viewer': 'View Only',
}

# Permissions: role → set of allowed actions
ROLE_PERMISSIONS = {
    'admin': {
        'manage_users', 'manage_vehicles', 'manage_prices',
        'manage_rentals', 'manage_purchases',
        'view_vehicles', 'view_prices', 'view_rentals', 'view_purchases',
    },
    'sales': {
        'manage_rentals', 'manage_purchases',
        'view_vehicles', 'view_prices', 'view_rentals', 'view_purchases',
    },
    'viewer': {
        'view_vehicles',
    },
}


def _get_role():
    logged = session.get("loggedId", {})
    return logged.get("attributes", {}).get("role", "") or logged.get("role", "")


def _has_permission(action):
    role = _get_role()
    return action in ROLE_PERMISSIONS.get(role, set())


def _auth_guard(required_action=None):
    """Returns (ok, error_response). If ok is False, return error_response immediately."""
    if not session.get("loggedId"):
        return False, {"status": False, "data": {}, "msg": "Unauthorized"}
    if required_action and not _has_permission(required_action):
        return False, {"status": False, "data": {}, "msg": "Forbidden: insufficient permissions"}
    return True, None


# ─────────────────────────────────────────────────────────────
# GET USERS
# ─────────────────────────────────────────────────────────────
@exposeApi
def getUsers_USER_MGMT():
    ok, err = _auth_guard("manage_users")
    if not ok:
        return err

    sql = """
        SELECT
            as_id::text  AS asid,
            as_name      AS asname,
            as_role      AS asrole
        FROM app_user
        ORDER BY as_id
    """
    result = selectHeaderQueryRO(sql)
    return {"status": True, "data": result["data"], "msg": ""}


# ─────────────────────────────────────────────────────────────
# ADD USER
# ─────────────────────────────────────────────────────────────
@exposeApi
def addUser_USER_MGMT():
    ok, err = _auth_guard("manage_users")
    if not ok:
        return err

    ajaxData = request.json.get("data")
    username = ajaxData.get("username", "").strip()
    password = ajaxData.get("password", "").strip()
    role     = ajaxData.get("role", "").strip()

    if not username or not password or not role:
        return {"status": False, "data": {}, "msg": "Username, password, and role are required"}

    if role not in VALID_ROLES:
        return {"status": False, "data": {}, "msg": "Role must be one of: " + ", ".join(VALID_ROLES)}

    if len(username) < 3:
        return {"status": False, "data": {}, "msg": "Username must be at least 3 characters"}

    if len(password) < 4:
        return {"status": False, "data": {}, "msg": "Password must be at least 4 characters"}

    check = selectDataHeaderQueryRO(
        "SELECT COUNT(*) AS cnt FROM app_user WHERE as_name = %(u)s",
        {"u": username}
    )
    if int(check["data"][0]["cnt"]) > 0:
        return {"status": False, "data": {}, "msg": "Username already exists"}

    result = executeDataQuery(
        "INSERT INTO app_user (as_name, as_pass, as_role) VALUES (%(u)s, %(p)s, %(r)s)",
        {"u": username, "p": password, "r": role}
    )
    return {"status": result["status"], "data": {}, "msg": "User added" if result["status"] else result["msg"]}


# ─────────────────────────────────────────────────────────────
# CHANGE ROLE
# ─────────────────────────────────────────────────────────────
@exposeApi
def changeRole_USER_MGMT():
    ok, err = _auth_guard("manage_users")
    if not ok:
        return err

    ajaxData = request.json.get("data")
    userid = ajaxData.get("userid", "")
    role   = ajaxData.get("role", "").strip()

    if not userid:
        return {"status": False, "data": {}, "msg": "User ID is required"}

    if role not in VALID_ROLES:
        return {"status": False, "data": {}, "msg": "Role must be one of: " + ", ".join(VALID_ROLES)}

    # Prevent admin from demoting themselves
    logged = session.get("loggedId", {})
    self_name = logged.get("nik", "")
    user_row = selectDataHeaderQueryRO(
        "SELECT as_name FROM app_user WHERE as_id = %(uid)s",
        {"uid": userid}
    )
    if user_row["data"] and user_row["data"][0]["asname"] == self_name and role != "admin":
        return {"status": False, "data": {}, "msg": "Cannot demote your own account from admin"}

    result = executeDataQuery(
        "UPDATE app_user SET as_role = %(r)s WHERE as_id = %(uid)s",
        {"r": role, "uid": userid}
    )
    return {"status": result["status"], "data": {}, "msg": "Role updated" if result["status"] else result["msg"]}


# ─────────────────────────────────────────────────────────────
# CHANGE PASSWORD
# ─────────────────────────────────────────────────────────────
@exposeApi
def changePassword_USER_MGMT():
    ok, err = _auth_guard("manage_users")
    if not ok:
        return err

    ajaxData = request.json.get("data")
    userid   = ajaxData.get("userid", "")
    new_pass = ajaxData.get("password", "").strip()

    if not userid or not new_pass:
        return {"status": False, "data": {}, "msg": "User ID and new password are required"}

    if len(new_pass) < 4:
        return {"status": False, "data": {}, "msg": "Password must be at least 4 characters"}

    result = executeDataQuery(
        "UPDATE app_user SET as_pass = %(p)s WHERE as_id = %(uid)s",
        {"p": new_pass, "uid": userid}
    )
    return {"status": result["status"], "data": {}, "msg": "Password updated" if result["status"] else result["msg"]}


# ─────────────────────────────────────────────────────────────
# DELETE USER
# ─────────────────────────────────────────────────────────────
@exposeApi
def deleteUser_USER_MGMT():
    ok, err = _auth_guard("manage_users")
    if not ok:
        return err

    ajaxData = request.json.get("data")
    userid = ajaxData.get("userid", "")

    if not userid:
        return {"status": False, "data": {}, "msg": "User ID is required"}

    logged    = session.get("loggedId", {})
    self_name = logged.get("nik", "")
    row = selectDataHeaderQueryRO(
        "SELECT as_name FROM app_user WHERE as_id = %(uid)s",
        {"uid": userid}
    )
    if row["data"] and row["data"][0]["asname"] == self_name:
        return {"status": False, "data": {}, "msg": "Cannot delete your own account"}

    result = executeDataQuery(
        "DELETE FROM app_user WHERE as_id = %(uid)s",
        {"uid": userid}
    )
    return {"status": result["status"], "data": {}, "msg": "User deleted" if result["status"] else result["msg"]}


# ─────────────────────────────────────────────────────────────
# GET PERMISSIONS (used by frontend to build role-aware UI)
# ─────────────────────────────────────────────────────────────
@exposeApi
def getPermissions_USER_MGMT():
    if not session.get("loggedId"):
        return {"status": False, "data": {}, "msg": "Unauthorized"}

    role = _get_role()
    perms = list(ROLE_PERMISSIONS.get(role, set()))
    return {
        "status": True,
        "data": {
            "role": role,
            "label": ROLE_LABELS.get(role, role),
            "permissions": perms,
        },
        "msg": ""
    }


execVcount = ""
