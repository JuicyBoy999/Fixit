CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    city VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
