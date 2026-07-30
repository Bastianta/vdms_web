@exposeApi
def login_LOGIN():
    ajaxData = request.json.get("data")
    username = ajaxData.get("username", "")
    password = ajaxData.get("password", "")

    if not username or not password:
        return {"status": False, "data": {}, "msg": "Username and password are required"}

    sql = """
        SELECT as_id::text AS asid, as_name AS asname, as_role AS asrole
        FROM app_user
        WHERE as_name = %(username)s
          AND as_pass = %(password)s
    """
    result = selectDataHeaderQueryRO(sql, {"username": username, "password": password})

    if not result["status"]:
        return {"status": False, "data": {}, "msg": "Database error"}

    if not result["data"]:
        return {"status": False, "data": {}, "msg": "Invalid credentials"}

    row = result["data"][0]
    session["loggedId"] = {
        "nik": row["asname"],
        "role": row["asrole"],
        "name": row["asname"],
        "attributes": {
            "name": row["asname"],
            "company_code": "01",
            "company": "VDMS",
            "role": row["asrole"],
        }
    }

    return {
        "status": True,
        "data": {"role": row["asrole"], "name": row["asname"]},
        "msg": ""
    }


@exposeApi
def logout_LOGIN():
    session.pop("loggedId", None)
    return {"status": True, "data": {}, "msg": "Logged out"}


execVcount = ""
