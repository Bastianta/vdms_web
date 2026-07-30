import os
from flask import request

kwargs = {
    "access_menu": {
        "msg": "success",
        "short_desc": "Y",
        "status_access": {
            "delete": "Y",
            "insert": "Y",
            "update": "Y"
        },
        "success": True
    },
    "attributes": {
        "company": "VDMS",
        "company_code": "01",
        "name": "Dev User",
    },
    "message": "Dev Session",
    "nik": "dev",
}

menu = [
    # ── Root entries (need a .py file in application/) ──────────────────
    ['LOGIN',        'Login',            ''],

    # ── Inventory ───────────────────────────────────────────────────────
    ['VEHICLES',     'Vehicles',         ''],
    ['VEHICLE_LIST', 'Inventory',        'VEHICLES'],
    ['VEHICLE_ADD',  'Add Vehicle',      'VEHICLES'],

    # ── Transactions ────────────────────────────────────────────────────
    ['TRANSACTIONS', 'Transactions',     ''],
    ['RENTAL',       'Rentals',          'TRANSACTIONS'],
    ['PURCHASE',     'Purchases',        'TRANSACTIONS'],

    # ── Management ──────────────────────────────────────────────────────
    ['MANAGEMENT',   'Management',       ''],
    ['DASHBOARD',    'Financial Dashboard', 'MANAGEMENT'],
    ['PRICE_MGMT',   'Price Manager',    'MANAGEMENT'],
    ['USER_MGMT',    'User Management',  'MANAGEMENT'],
]

list_menu = (True, {'data': {
    'datetime': '01-01-25 00:00:00',
    'menu_id': menu,
    'msg': 'success',
    'success': True
}})
