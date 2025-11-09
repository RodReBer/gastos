-- Hacer invoice_id opcional en la tabla payments
-- Esto permite registrar pagos de gastos de grupo que no tienen factura asociada

-- Eliminar la restricción NOT NULL de invoice_id
ALTER TABLE payments 
ALTER COLUMN invoice_id DROP NOT NULL;

-- Verificar el cambio
SELECT 
    column_name, 
    is_nullable, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'payments' 
AND column_name = 'invoice_id';
