-- =============================================================
-- VDMS — Vehicle Dealer Management System
-- Fixed DDL (vmd_fixed.sql)
--
-- Bugs fixed from original vmd.sql:
--   1. CHECK (role IN ...) → CHECK (as_role IN ('admin', 'user'))
--   2. Missing comma in vehicle_image after FK constraint line
--   3. Added vehicle_create_user VARCHAR(50) to vehicle table
--   4. Added vehicle_update_user VARCHAR(50) to vehicle table
-- =============================================================

CREATE TABLE vehicle (
    vehicle_id           SERIAL         PRIMARY KEY,
    vehicle_type         VARCHAR(20)    NOT NULL,
    vehicle_brand        VARCHAR(50)    NOT NULL,
    vehicle_name         VARCHAR(100)   NOT NULL,
    vehicle_trim         VARCHAR(50)    NOT NULL,
    vehicle_year         INT            NOT NULL,
    vehicle_price        NUMERIC(15,2)  NOT NULL,
    vehicle_condition    VARCHAR(100),
    vehicle_is_new       BOOLEAN        NOT NULL DEFAULT TRUE,
    vehicle_mileage      INT            DEFAULT 0,
    vehicle_image_path   VARCHAR(255),
    vehicle_availability BOOLEAN        NOT NULL DEFAULT TRUE,
    vehicle_is_deleted   BOOLEAN        NOT NULL DEFAULT FALSE,
    vehicle_create_user  VARCHAR(50),
    vehicle_update_user  VARCHAR(50)
);

CREATE TABLE app_user (
    as_id    SERIAL       PRIMARY KEY,
    as_name  VARCHAR(50)  UNIQUE NOT NULL,
    as_pass  VARCHAR(255) NOT NULL,
    as_role  VARCHAR(20)  NOT NULL CHECK (as_role IN ('admin', 'user'))
);

CREATE TABLE vehicle_image (
    image_id   SERIAL       PRIMARY KEY,
    vehicle_id INT          NOT NULL REFERENCES vehicle(vehicle_id),
    image_path VARCHAR(255) NOT NULL,
    sort_order INT          DEFAULT 0
);

-- =============================================================
-- Seed Data: Users
-- =============================================================
INSERT INTO app_user (as_name, as_pass, as_role) VALUES
    ('admin', 'admin', 'admin'),
    ('user',  'user', 'user'),
    ('userguy', 'user', 'admin'),
    ('test', 'test', 'admin');

-- =============================================================
-- Seed Data: Vehicles (14 rows — enough to span 2 pages at 8/page)
-- Mix of types, brands, new/used, available/not available
-- =============================================================
INSERT INTO vehicle (
    vehicle_type, vehicle_brand, vehicle_name, vehicle_trim,
    vehicle_year, vehicle_price,
    vehicle_condition, vehicle_is_new, vehicle_mileage,
    vehicle_availability, vehicle_is_deleted,
    vehicle_create_user, vehicle_update_user
) VALUES
    ('Car',        'Toyota',   'Camry',       'V6 XSE',         2024, 650000000,  'Pristine condition, no scratches',      TRUE,  0,     TRUE,  FALSE, 'admin', 'admin'),
    ('Car',        'Honda',    'Civic',        'RS Turbo',       2023, 420000000,  NULL,                                    TRUE,  0,     TRUE,  FALSE, 'admin', 'admin'),
    ('Car',        'BMW',      '3 Series',     '330i M Sport',   2023, 890000000,  'Ex-display unit, low mileage',          FALSE, 8500,  TRUE,  FALSE, 'admin', 'admin'),
    ('Car',        'Mercedes', 'C-Class',      'C200 AMG Line',  2022, 920000000,  'Single owner, full service history',    FALSE, 21000, TRUE,  FALSE, 'admin', 'admin'),
    ('Car',        'Toyota',   'Fortuner',     'VRZ 4x4',        2024, 580000000,  NULL,                                    TRUE,  0,     TRUE,  FALSE, 'admin', 'admin'),
    ('Car',        'Hyundai',  'Tucson',       'Prime PHEV',     2023, 560000000,  'Hybrid, very low fuel cost',            FALSE, 4200,  TRUE,  FALSE, 'admin', 'admin'),
    ('Car',        'Mitsubishi','Pajero Sport','Dakar 4x4',      2022, 510000000,  'Good condition, full spec',             FALSE, 33000, FALSE, FALSE, 'admin', 'admin'),
    ('Car',        'Honda',    'HR-V',         'SE CVT',         2024, 380000000,  NULL,                                    TRUE,  0,     TRUE,  FALSE, 'admin', 'admin'),
    ('Motorcycle', 'Ducati',   'Panigale',     'V4 S',           2023, 750000000,  'Track-ready, serviced at 5k km',        FALSE, 5100,  TRUE,  FALSE, 'admin', 'admin'),
    ('Motorcycle', 'Honda',    'CBR1000RR',    'SP Fireblade',   2022, 480000000,  'Excellent condition, all original',     FALSE, 11200, TRUE,  FALSE, 'admin', 'admin'),
    ('Motorcycle', 'Kawasaki', 'Ninja',        'ZX-10R SE',      2023, 390000000,  NULL,                                    TRUE,  0,     TRUE,  FALSE, 'admin', 'admin'),
    ('Motorcycle', 'Yamaha',   'R1',           'M Edition',      2024, 430000000,  NULL,                                    TRUE,  0,     FALSE, FALSE, 'admin', 'admin'),
    ('Motorcycle', 'Suzuki',   'GSX-R1000',    'R ABS',          2021, 310000000,  'Two owners, all service records intact',FALSE, 18700, TRUE,  FALSE, 'admin', 'admin'),
    ('Car',        'Lexus',    'RX',           '350 F Sport',    2023, 1150000000, 'Luxury SUV, panoramic roof, HUD',       FALSE, 9800,  TRUE,  FALSE, 'admin', 'admin');
