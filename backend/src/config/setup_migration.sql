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
