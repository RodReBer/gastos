-- Agregar campo de categoría a invoices
ALTER TABLE IF EXISTS invoices 
ADD COLUMN IF NOT EXISTS category VARCHAR(50);

-- Crear tabla para items de factura
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,2) DEFAULT 1,
    unit_price DECIMAL(10,2),
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_category ON invoice_items(category);
CREATE INDEX IF NOT EXISTS idx_invoices_category ON invoices(category);

-- Comentarios de las categorías comunes
COMMENT ON COLUMN invoices.category IS 'Categorías: food, tech, transport, entertainment, health, clothing, home, services, utilities, other';
COMMENT ON COLUMN invoice_items.category IS 'Categorías: food, tech, transport, entertainment, health, clothing, home, services, utilities, other';
