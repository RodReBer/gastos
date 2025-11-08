-- Add configuration columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS monthly_income DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'es';
ALTER TABLE users ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'UYU';

-- Update existing users to have defaults
UPDATE users SET monthly_income = 0 WHERE monthly_income IS NULL;
UPDATE users SET language = 'es' WHERE language IS NULL;
UPDATE users SET currency = 'UYU' WHERE currency IS NULL;
