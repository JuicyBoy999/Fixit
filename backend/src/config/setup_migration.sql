-- Migration for US-34: Admin Message Moderation

-- Migration for US-45: Admin Account Suspension
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
UPDATE users SET status = 'active' WHERE status IS NULL;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check;
ALTER TABLE users ADD CONSTRAINT users_status_check CHECK (status IN ('active','suspended','deactivated'));

ALTER TABLE technician_profiles ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
UPDATE technician_profiles SET status = 'active' WHERE status IS NULL;
ALTER TABLE technician_profiles DROP CONSTRAINT IF EXISTS technician_profiles_status_check;
ALTER TABLE technician_profiles ADD CONSTRAINT technician_profiles_status_check CHECK (status IN ('active','suspended','deactivated'));

-- Migration for US-44: Technician Credential Verification
ALTER TABLE technician_profiles ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20);
UPDATE technician_profiles SET verification_status = 'approved' WHERE verification_status IS NULL;
ALTER TABLE technician_profiles ALTER COLUMN verification_status SET DEFAULT 'pending';
ALTER TABLE technician_profiles DROP CONSTRAINT IF EXISTS technician_profiles_verification_status_check;
ALTER TABLE technician_profiles ADD CONSTRAINT technician_profiles_verification_status_check CHECK (verification_status IN ('pending','approved','rejected'));
ALTER TABLE technician_profiles ADD COLUMN IF NOT EXISTS credential_documents JSONB DEFAULT '[]'::jsonb;

-- Create messages table to hold chat logs for repairs
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    repair_id INTEGER REFERENCES repairs(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    flagged BOOLEAN DEFAULT FALSE,
    flagged_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_warnings table to record warnings issued to users by admins
CREATE TABLE IF NOT EXISTS user_warnings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    admin_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Migration for US-41/US-42: Customer Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER UNIQUE,
    customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    technician_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    body TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    edited_at TIMESTAMP,
    original_body TEXT
);

-- Fix reviews.booking_id FK to point to repair_requests (not repairs)
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_booking_id_fkey;
ALTER TABLE reviews ADD CONSTRAINT reviews_booking_id_fkey
  FOREIGN KEY (booking_id) REFERENCES repair_requests(id) ON DELETE CASCADE;

-- Fix technician_id FK to reference users directly (repair_requests.technician_id = users.id)
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_technician_id_fkey;
ALTER TABLE reviews ADD CONSTRAINT reviews_technician_id_fkey
  FOREIGN KEY (technician_id) REFERENCES users(id) ON DELETE CASCADE;

-- Fix repair_requests.customer_id / technician_id: table was originally created with
-- these as TEXT, but every reader (listMyBookings, listRepairRequests, notifications)
-- compares them against integer user ids, causing "operator does not exist: integer = text"
-- on every read and hiding all bookings from customers and technicians.
ALTER TABLE repair_requests
  ALTER COLUMN customer_id TYPE INTEGER USING NULLIF(customer_id, '')::INTEGER;
ALTER TABLE repair_requests
  ALTER COLUMN technician_id TYPE INTEGER USING NULLIF(technician_id, '')::INTEGER;
