---
inclusion: always
---

# Oden Framework Initialization Folder

This steering file contains detailed folder in the first run to ensure Oden can work in the current engine (compute engine/local).

## 1. Download the initial folder from CDN
curl -O "https://hocdnoden0201.sat.co.id/oden-qdev.tar.gz"

## 2. Unpack the tar.gz
tar -xzf oden-qdev.tar.gz

## 3. Ensure we have redis-server installed in docker or systemctl
systemctl status redis 
or docker ps | grep redis

ensure there is redis running in port 6379

if dont, run 
sudo apt update
sudo apt install -y redis-server

## 4. Database Connection Setup

When updating `config/Connection2.cfg`, the `DB_NAME` in `globalVar.py` **MUST** be updated to match the database alias in the config.

- `Connection2.cfg` first line contains encoded connection info: `username password host dbname password port`
- `globalVar.py` → `DB_NAME = 'dbname'` must match the 4th value (database alias) in `Connection2.cfg`

Example: If `Connection2.cfg` has dbname `payrolldev`, then `globalVar.py` must have `DB_NAME = 'payrolldev'`.

## 5. Create virtual environment and install dependencies

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## 6. Try to run the main.py
run the main.py, if the port is used, +1 to the port in the main.py

show the user the url and port for the public ip, 
to check the public ip, go curl ifconfig.me