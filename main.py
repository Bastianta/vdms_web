from flask import Flask, request, redirect, session
import globalVar

APP_NAME = 'VDMS'

# Vercel's Python builder statically scans this entrypoint file for a
# top-level "<name> = Flask(...)" assignment to detect the WSGI app -- it
# does not execute the file to find one. This line exists purely to satisfy
# that scan. The real, fully-routed Flask app is built a few lines down by
# getLibrary("satssowebclientnd"), which runs via exec() in this module's
# global namespace and rebinds `app` to the actual instance the framework
# registers all routes on. Python keeps whichever assignment runs last, so
# this placeholder is overwritten before any request is served -- it never
# handles traffic itself.
app = Flask(__name__)


def getLibrary(param):
    try:
        with open(f"common/{param}.py", "r") as file:
            exec(file.read(), globals())
    except Exception as e:
        raise Exception(f"Check requirements yang diperlukan / jalankan debug source: {e}")


getLibrary("satlog")
getLibrary("satgetdatetime")
getLibrary("saturl")
getLibrary("satssowebclientnd")
getLibrary("satconnectserver2RO")
getLibrary("satconnectserver2")
getLibrary("lib_errorCodePG")
getLibrary("utilities_v1.2")
getLibrary("base")
getLibrary("satconnectredis")
getLibrary("satconnectbucket")
getLibrary("oden_v1.2")


class CustomOden(Oden):

    def authenticate(self):
        """
        Dev mode: bypass SSO.
        Role is stored inside attributes so it survives __setAuthenticateData,
        which wipes session['loggedId'] and only restores nik + attributes.

        If user has an existing session with a real role (e.g. logged in via
        LOGIN form), preserve that session as-is.
        Otherwise fall back to the dev bypass with role="admin" so all features
        work out-of-the-box during development without requiring a login.
        """
        existing = session.get("loggedId", {})
        role = existing.get("attributes", {}).get("role", "")
        if role:
            # Preserve existing logged-in session
            return True, {
                "nik": existing.get("nik", "dev"),
                "attributes": existing.get("attributes", {}),
            }
        # No session — return dev bypass with admin role for development
        return True, {
            "nik": "dev",
            "attributes": {
                "name": "Dev User",
                "company_code": "01",
                "company": "VDMS",
                "role": "admin",
            },
        }

    def authorize(self, menuId):
        """Return full access for all menus."""
        return True, {
            "access_menu": {
                "msg": "success",
                "short_desc": "Y",
                "status_access": {
                    "delete": "Y",
                    "insert": "Y",
                    "update": "Y",
                },
                "success": True,
            }
        }

    def getMenu(self):
        import staticOdenMenu
        userAttributes = staticOdenMenu.kwargs
        userAttributes.update({"list_menu": staticOdenMenu.list_menu})
        return True, userAttributes["list_menu"][1]["data"]["menu_id"]

    def index(self):
        """
        Landing page hook.
        - If user explicitly logged in (real nik, not the dev bypass) → redirect to VEHICLE_LIST
        - Otherwise → serve LOGIN.html
        """
        logged = session.get("loggedId", {})
        role = logged.get("attributes", {}).get("role", "") or logged.get("role", "")
        nik = logged.get("nik", "")
        # Only redirect if the user logged in for real (not the dev bypass nik)
        if logged and role and nik and nik != "dev":
            return redirect("/?type=CUSTOM_VIEW&menuId=VEHICLE_LIST")
        html = fileToString('./templates/LOGIN.html')
        return html

    def customView(self, menuId, html):
        """
        Inject shared sidebar into all authenticated pages.
        Replaces [USER_ROLE] and [USER_NAMA] with session values.
        """
        SIDEBAR_MENUS = (
            "VEHICLE_LIST", "VEHICLE_ADD",
            "USER_MGMT", "PRICE_MGMT", "RENTAL", "PURCHASE", "DASHBOARD",
        )
        if menuId in SIDEBAR_MENUS:
            sidebar_html = fileToString('./templates/common/sidebar.html')
            html = html.replace("[SIDEBAR]", sidebar_html)

        role = ""
        name = ""
        try:
            logged = session.get("loggedId", {})
            role = logged.get("attributes", {}).get("role", "") or logged.get("role", "")
            name = logged.get("attributes", {}).get("name", "") or logged.get("nik", "")
        except Exception:
            pass

        html = html.replace("[USER_ROLE]", role)
        html = html.replace("[USER_NAMA]", name)

        return html

    def view(self, menuId, html):
        """Standard Webix view — return unchanged (no standard Webix forms in this app)."""
        return html


CustomOden.name = "VDMS"
CustomOden(host='0.0.0.0', port=8000, debug=True)
