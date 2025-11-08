-- Create users table (synced from Auth0)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth0_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vendor_name TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  invoice_date DATE NOT NULL,
  invoice_number TEXT,
  image_url TEXT,
  extracted_text TEXT,
  description TEXT,
  status TEXT DEFAULT 'pending', -- pending, partial, paid
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payment_date DATE NOT NULL,
  payment_type TEXT NOT NULL, -- cash, card, transfer, check, other
  amount_paid DECIMAL(12, 2) NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, completed, failed
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create audit log table for GRASP Observer pattern
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  changes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid()::text = auth0_id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid()::text = auth0_id);

-- RLS Policies for invoices
CREATE POLICY "Users can view their own invoices" ON invoices
  FOR SELECT USING (user_id = (SELECT id FROM users WHERE auth0_id = auth.uid()::text));

CREATE POLICY "Users can create invoices" ON invoices
  FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE auth0_id = auth.uid()::text));

CREATE POLICY "Users can update their own invoices" ON invoices
  FOR UPDATE USING (user_id = (SELECT id FROM users WHERE auth0_id = auth.uid()::text));

CREATE POLICY "Users can delete their own invoices" ON invoices
  FOR DELETE USING (user_id = (SELECT id FROM users WHERE auth0_id = auth.uid()::text));

-- RLS Policies for payments
CREATE POLICY "Users can view their own payments" ON payments
  FOR SELECT USING (user_id = (SELECT id FROM users WHERE auth0_id = auth.uid()::text));

CREATE POLICY "Users can create payments" ON payments
  FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE auth0_id = auth.uid()::text));

CREATE POLICY "Users can update their own payments" ON payments
  FOR UPDATE USING (user_id = (SELECT id FROM users WHERE auth0_id = auth.uid()::text));

CREATE POLICY "Users can delete their own payments" ON payments
  FOR DELETE USING (user_id = (SELECT id FROM users WHERE auth0_id = auth.uid()::text));

-- RLS Policies for audit logs
CREATE POLICY "Users can view their own audit logs" ON audit_logs
  FOR SELECT USING (user_id = (SELECT id FROM users WHERE auth0_id = auth.uid()::text));
