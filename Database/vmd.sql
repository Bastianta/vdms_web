CREATE TABLE vehicle (
	vehicle_id SERIAL PRIMARY KEY,
	vehicle_type VARCHAR(20) NOT NULL,
	vehicle_brand VARCHAR(50) NOT NULL,
	vehicle_name VARCHAR(100) NOT NULL,
	vehicle_trim VARCHAR(50) NOT NULL,
	vehicle_year INT NOT NULL,
	vehicle_price NUMERIC(15, 2) NOT NULL,
	vehicle_condition VARCHAR(100), 
	vehicle_is_new BOOLEAN NOT NULL DEFAULT TRUE,
	vehicle_mileage INT DEFAULT 0,
	vehicle_image_path VARCHAR(255),
	vehicle_availability BOOLEAN NOT NULL DEFAULT TRUE, 
vehicle_Is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE app_user (
			as_id SERIAL PRIMARY KEY,
			as_name VARCHAR(50) UNIQUE NOT NULL,
			as_pass VARCHAR(255) NOT NULL,
			as_role VARCHAR(20) NOT NULL CHECK (role IN(‘admin’, ‘user’))
);

CREATE TABLE vehicle_image (
	image_id SERIAL PRIMARY KEY,
	vehicle_id INT NOT NULL REFERENCES vehicle (vehicle_id)
 	image_path VARCHAR(255) NOT NULL,
	sort_order INT DEFAULT 0
);
