-- =============================================================
-- VDMS v2 Migration — run this in psql or pgAdmin
-- Safe to run multiple times (uses IF NOT EXISTS / ON CONFLICT)
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. Fix app_user role constraint
-- ─────────────────────────────────────────────────────────────
-- Drop old constraint (whichever name it has)
ALTER TABLE app_user DROP CONSTRAINT IF EXISTS app_user_as_role_check;
ALTER TABLE app_user DROP CONSTRAINT IF EXISTS app_user_role_check;

-- Some schemas named it differently; this covers both
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'app_user_as_role_check1'
    ) THEN
        ALTER TABLE app_user DROP CONSTRAINT app_user_as_role_check1;
    END IF;
END$$;

ALTER TABLE app_user
    ADD CONSTRAINT app_user_as_role_check
    CHECK (as_role IN ('admin', 'sales', 'viewer'));

-- Migrate any old 'user' roles to 'viewer'
UPDATE app_user SET as_role = 'viewer' WHERE as_role = 'user';

-- Add a sales demo account
INSERT INTO app_user (as_name, as_pass, as_role)
VALUES ('sales', 'sales', 'sales')
ON CONFLICT (as_name) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- 2. PRICE HISTORY TABLE
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS price_history (
    ph_id           SERIAL          PRIMARY KEY,
    ph_vehicle_id   INT             NOT NULL REFERENCES vehicle(vehicle_id),
    ph_old_price    NUMERIC(15,2)   NOT NULL,
    ph_new_price    NUMERIC(15,2)   NOT NULL,
    ph_change_pct   NUMERIC(6,2),
    ph_reason       VARCHAR(255),
    ph_changed_by   VARCHAR(50)     NOT NULL,
    ph_changed_at   TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 3. CUSTOMER TABLE
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customer (
    cust_id          SERIAL        PRIMARY KEY,
    cust_name        VARCHAR(100)  NOT NULL,
    cust_phone       VARCHAR(30),
    cust_email       VARCHAR(100),
    cust_address     TEXT,
    cust_id_number   VARCHAR(50),
    cust_create_at   TIMESTAMP     NOT NULL DEFAULT NOW(),
    cust_create_user VARCHAR(50),
    cust_update_user VARCHAR(50)
);

-- ─────────────────────────────────────────────────────────────
-- 4. RENTAL TABLE
--    NOTE: duration_days and total_price are plain columns
--    (computed by INSERT or trigger) — avoids GENERATED issues.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rental (
    rental_id            SERIAL        PRIMARY KEY,
    rental_vehicle_id    INT           NOT NULL REFERENCES vehicle(vehicle_id),
    rental_cust_id       INT           REFERENCES customer(cust_id),
    rental_cust_name     VARCHAR(100)  NOT NULL,
    rental_cust_phone    VARCHAR(30),
    rental_start_date    DATE          NOT NULL,
    rental_end_date      DATE          NOT NULL,
    rental_duration_days INT,
    rental_daily_rate    NUMERIC(15,2) NOT NULL,
    rental_total_price   NUMERIC(15,2),
    rental_deposit       NUMERIC(15,2) NOT NULL DEFAULT 0,
    rental_status        VARCHAR(20)   NOT NULL DEFAULT 'pending'
                             CHECK (rental_status IN
                                 ('pending','confirmed','ongoing','completed','cancelled')),
    rental_notes         TEXT,
    rental_create_user   VARCHAR(50),
    rental_update_user   VARCHAR(50),
    rental_created_at    TIMESTAMP     NOT NULL DEFAULT NOW(),
    rental_updated_at    TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────
-- 5. PURCHASE TABLE
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS purchase (
    purchase_id                 SERIAL        PRIMARY KEY,
    purchase_vehicle_id         INT           NOT NULL REFERENCES vehicle(vehicle_id),
    purchase_cust_id            INT           REFERENCES customer(cust_id),
    purchase_cust_name          VARCHAR(100)  NOT NULL,
    purchase_cust_phone         VARCHAR(30),
    purchase_sale_price         NUMERIC(15,2) NOT NULL,
    purchase_down_payment       NUMERIC(15,2) NOT NULL DEFAULT 0,
    purchase_payment_type       VARCHAR(20)   NOT NULL DEFAULT 'cash'
                                    CHECK (purchase_payment_type IN
                                        ('cash','installment','leasing')),
    purchase_installment_months INT           DEFAULT 0,
    purchase_monthly_payment    NUMERIC(15,2) DEFAULT 0,
    purchase_status             VARCHAR(20)   NOT NULL DEFAULT 'pending'
                                    CHECK (purchase_status IN
                                        ('pending','deposit','completed','cancelled')),
    purchase_notes              TEXT,
    purchase_sale_date          DATE          NOT NULL DEFAULT CURRENT_DATE,
    purchase_create_user        VARCHAR(50),
    purchase_update_user        VARCHAR(50),
    purchase_created_at         TIMESTAMP     NOT NULL DEFAULT NOW(),
    purchase_updated_at         TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────
-- 6. Sample customers
-- ─────────────────────────────────────────────────────────────
INSERT INTO customer (cust_name, cust_phone, cust_email, cust_address, cust_id_number, cust_create_user, cust_update_user)
VALUES
    ('Budi Santoso',  '081234567890', 'budi@example.com',  'Jl. Sudirman No.1, Jakarta',   '3175012345678901', 'admin', 'admin'),
    ('Siti Rahayu',   '082345678901', 'siti@example.com',  'Jl. Gatot Subroto No.5, Bdg',  '3273056789012345', 'admin', 'admin'),
    ('Ahmad Fauzi',   '083456789012', 'ahmad@example.com', 'Jl. Diponegoro No.10, Sby',    '3578090123456789', 'admin', 'admin'),
    ('Dewi Lestari',  '084567890123', 'dewi@example.com',  'Jl. Pemuda No.20, Semarang',   '3374023456789012', 'admin', 'admin')
ON CONFLICT DO NOTHING;
