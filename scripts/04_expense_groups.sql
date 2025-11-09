-- Sistema de Grupos de Gastos Compartidos

-- Tabla de grupos de gastos
CREATE TABLE IF NOT EXISTS expense_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID NOT NULL,
    currency VARCHAR(10) DEFAULT 'UYU',
    split_method VARCHAR(20) DEFAULT 'equal', -- 'equal' o 'proportional'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla de miembros del grupo
CREATE TABLE IF NOT EXISTS group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role VARCHAR(20) DEFAULT 'member', -- 'admin' o 'member'
    monthly_income DECIMAL(10,2) DEFAULT 0, -- Para división proporcional
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_group_members_group FOREIGN KEY (group_id) REFERENCES expense_groups(id) ON DELETE CASCADE,
    CONSTRAINT fk_group_members_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT unique_group_member UNIQUE(group_id, user_id)
);

-- Tabla de invitaciones a grupos
CREATE TABLE IF NOT EXISTS group_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL,
    invited_by UUID NOT NULL,
    email VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
    responded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_invitations_group FOREIGN KEY (group_id) REFERENCES expense_groups(id) ON DELETE CASCADE,
    CONSTRAINT fk_invitations_invited_by FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla de gastos del grupo
CREATE TABLE IF NOT EXISTS group_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL,
    paid_by UUID NOT NULL, -- Usuario que pagó
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'UYU',
    expense_date DATE NOT NULL,
    category VARCHAR(50),
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_interval VARCHAR(20), -- 'daily', 'weekly', 'monthly', 'yearly'
    recurrence_day INTEGER, -- Día del mes/semana para recurrencia
    next_occurrence DATE, -- Próxima fecha de recurrencia
    invoice_id UUID, -- Referencia a factura escaneada (opcional)
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_group_expenses_group FOREIGN KEY (group_id) REFERENCES expense_groups(id) ON DELETE CASCADE,
    CONSTRAINT fk_group_expenses_paid_by FOREIGN KEY (paid_by) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_group_expenses_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL
);

-- Tabla de división de gastos (quién debe cuánto)
CREATE TABLE IF NOT EXISTS expense_splits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_id UUID NOT NULL,
    user_id UUID NOT NULL,
    amount_owed DECIMAL(10,2) NOT NULL, -- Cuánto debe este usuario
    is_paid BOOLEAN DEFAULT FALSE,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_splits_expense FOREIGN KEY (expense_id) REFERENCES group_expenses(id) ON DELETE CASCADE,
    CONSTRAINT fk_splits_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT unique_expense_split UNIQUE(expense_id, user_id)
);

-- Índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_expense_groups_created_by ON expense_groups(created_by);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_invitations_email ON group_invitations(email);
CREATE INDEX IF NOT EXISTS idx_group_invitations_status ON group_invitations(status);
CREATE INDEX IF NOT EXISTS idx_group_expenses_group_id ON group_expenses(group_id);
CREATE INDEX IF NOT EXISTS idx_group_expenses_paid_by ON group_expenses(paid_by);
CREATE INDEX IF NOT EXISTS idx_group_expenses_recurring ON group_expenses(is_recurring, next_occurrence);
CREATE INDEX IF NOT EXISTS idx_expense_splits_expense_id ON expense_splits(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_splits_user_id ON expense_splits(user_id);
CREATE INDEX IF NOT EXISTS idx_expense_splits_unpaid ON expense_splits(user_id, is_paid);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
CREATE TRIGGER update_expense_groups_updated_at
    BEFORE UPDATE ON expense_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_invitations_updated_at
    BEFORE UPDATE ON group_invitations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_expenses_updated_at
    BEFORE UPDATE ON group_expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentarios
COMMENT ON TABLE expense_groups IS 'Grupos de gastos compartidos entre usuarios';
COMMENT ON TABLE group_members IS 'Miembros de cada grupo con sus roles e ingresos';
COMMENT ON TABLE group_invitations IS 'Invitaciones pendientes, aceptadas o rechazadas a grupos';
COMMENT ON TABLE group_expenses IS 'Gastos compartidos del grupo, pueden ser recurrentes';
COMMENT ON TABLE expense_splits IS 'División del gasto entre miembros (quién debe cuánto)';
COMMENT ON COLUMN expense_groups.split_method IS 'Método de división: equal (50-50) o proportional (según ingresos)';
COMMENT ON COLUMN group_expenses.is_recurring IS 'Si es TRUE, el gasto se repite automáticamente';
COMMENT ON COLUMN group_expenses.recurrence_interval IS 'Frecuencia: daily, weekly, monthly, yearly';
