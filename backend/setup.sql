CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    city VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','suspended','deactivated')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check;
ALTER TABLE users ADD CONSTRAINT users_status_check CHECK (status IN ('active','suspended','deactivated'));

CREATE TABLE IF NOT EXISTS password_resets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (first_name, last_name, email, phone, city, password, role)
VALUES ('Admin', 'User', 'admin@fixit.com', '1234567890', 'New York', '$2a$12$L4UxTxFS4M9rhNh2f2.kT.v8gdUpkyB7aONOzjo2L.8HkRU0y787i', 'admin');

CREATE TABLE IF NOT EXISTS repairs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    device_name VARCHAR(255) NOT NULL,
    issue_description TEXT,
    city VARCHAR(100),
    preferred_date DATE,
    contact_name VARCHAR(255),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    address TEXT,
    technician_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','cancelled')),
    cost DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE repairs ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS preferred_date DATE;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS contact_name VARCHAR(255);
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20);
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255);
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS address TEXT;

CREATE TABLE IF NOT EXISTS technician_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    full_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    bio TEXT NOT NULL,
    skills TEXT[] DEFAULT '{}',
    location VARCHAR(100),
    years_experience INTEGER DEFAULT 0,
    hourly_rate DECIMAL(10,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','suspended','deactivated')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE technician_profiles ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
ALTER TABLE technician_profiles DROP CONSTRAINT IF EXISTS technician_profiles_status_check;
ALTER TABLE technician_profiles ADD CONSTRAINT technician_profiles_status_check CHECK (status IN ('active','suspended','deactivated'));

CREATE TABLE IF NOT EXISTS technician_certifications (
    id SERIAL PRIMARY KEY,
    technician_id INTEGER REFERENCES technician_profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    issuer VARCHAR(255),
    issued_on DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS technician_reviews (
    id SERIAL PRIMARY KEY,
    technician_id INTEGER REFERENCES technician_profiles(id) ON DELETE CASCADE,
    reviewer_name VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER UNIQUE REFERENCES repairs(id) ON DELETE CASCADE,
    customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    technician_id INTEGER REFERENCES technician_profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    body TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    edited_at TIMESTAMP,
    original_body TEXT
);

INSERT INTO technician_profiles (full_name, title, bio, skills, location, years_experience, hourly_rate)
SELECT
    'Aarav Shrestha',
    'Senior Mobile and Laptop Repair Specialist',
    'Aarav specializes in board-level diagnostics, screen replacement, charging faults, and water damage recovery. He focuses on clear estimates and tidy same-day service.',
    ARRAY['Smartphone repair','Laptop diagnostics','Board repair','Data recovery'],
    'Kathmandu',
    6,
    800.00
WHERE NOT EXISTS (
    SELECT 1 FROM technician_profiles WHERE full_name = 'Aarav Shrestha'
);

INSERT INTO technician_profiles (full_name, title, bio, skills, location, years_experience, hourly_rate)
SELECT
    'Maya Gurung',
    'Home Appliance and TV Technician',
    'Maya handles LED TV, refrigerator, washing machine, and small appliance issues with a strong focus on warranty-safe parts and preventive care.',
    ARRAY['TV repair','Home appliances','Power supply diagnosis','Preventive maintenance'],
    'Lalitpur',
    5,
    1000.00
WHERE NOT EXISTS (
    SELECT 1 FROM technician_profiles WHERE full_name = 'Maya Gurung'
);

INSERT INTO technician_certifications (technician_id, name, issuer, issued_on)
SELECT tp.id, 'Certified Electronics Repair Technician', 'Nepal Technical Training Center', DATE '2024-02-15'
FROM technician_profiles tp
WHERE tp.full_name = 'Aarav Shrestha'
  AND NOT EXISTS (
      SELECT 1 FROM technician_certifications tc
      WHERE tc.technician_id = tp.id AND tc.name = 'Certified Electronics Repair Technician'
  );

INSERT INTO technician_certifications (technician_id, name, issuer, issued_on)
SELECT tp.id, 'Mobile Device Board Repair', 'Fixit Academy', DATE '2025-04-20'
FROM technician_profiles tp
WHERE tp.full_name = 'Aarav Shrestha'
  AND NOT EXISTS (
      SELECT 1 FROM technician_certifications tc
      WHERE tc.technician_id = tp.id AND tc.name = 'Mobile Device Board Repair'
  );

INSERT INTO technician_certifications (technician_id, name, issuer, issued_on)
SELECT tp.id, 'Appliance Safety and Diagnostics', 'Nepal Skill Council', DATE '2023-11-12'
FROM technician_profiles tp
WHERE tp.full_name = 'Maya Gurung'
  AND NOT EXISTS (
      SELECT 1 FROM technician_certifications tc
      WHERE tc.technician_id = tp.id AND tc.name = 'Appliance Safety and Diagnostics'
  );

INSERT INTO technician_certifications (technician_id, name, issuer, issued_on)
SELECT tp.id, 'LED TV Service Certification', 'Fixit Academy', DATE '2024-08-05'
FROM technician_profiles tp
WHERE tp.full_name = 'Maya Gurung'
  AND NOT EXISTS (
      SELECT 1 FROM technician_certifications tc
      WHERE tc.technician_id = tp.id AND tc.name = 'LED TV Service Certification'
  );

INSERT INTO technician_reviews (technician_id, reviewer_name, rating, comment, created_at)
SELECT tp.id, 'Nisha K.', 5, 'Explained the laptop issue clearly and fixed it the same day.', CURRENT_TIMESTAMP - INTERVAL '18 days'
FROM technician_profiles tp
WHERE tp.full_name = 'Aarav Shrestha'
  AND NOT EXISTS (
      SELECT 1 FROM technician_reviews tr
      WHERE tr.technician_id = tp.id AND tr.reviewer_name = 'Nisha K.'
  );

INSERT INTO technician_reviews (technician_id, reviewer_name, rating, comment, created_at)
SELECT tp.id, 'Ramesh B.', 4, 'Good repair quality and careful handling of my phone.', CURRENT_TIMESTAMP - INTERVAL '32 days'
FROM technician_profiles tp
WHERE tp.full_name = 'Aarav Shrestha'
  AND NOT EXISTS (
      SELECT 1 FROM technician_reviews tr
      WHERE tr.technician_id = tp.id AND tr.reviewer_name = 'Ramesh B.'
  );

INSERT INTO technician_reviews (technician_id, reviewer_name, rating, comment, created_at)
SELECT tp.id, 'Sita M.', 5, 'Professional visit and the TV has worked perfectly since.', CURRENT_TIMESTAMP - INTERVAL '9 days'
FROM technician_profiles tp
WHERE tp.full_name = 'Maya Gurung'
  AND NOT EXISTS (
      SELECT 1 FROM technician_reviews tr
      WHERE tr.technician_id = tp.id AND tr.reviewer_name = 'Sita M.'
  );

INSERT INTO technician_reviews (technician_id, reviewer_name, rating, comment, created_at)
SELECT tp.id, 'Anil P.', 5, 'Fast diagnosis, fair price, and very polite service.', CURRENT_TIMESTAMP - INTERVAL '26 days'
FROM technician_profiles tp
WHERE tp.full_name = 'Maya Gurung'
  AND NOT EXISTS (
      SELECT 1 FROM technician_reviews tr
      WHERE tr.technician_id = tp.id AND tr.reviewer_name = 'Anil P.'
  );
