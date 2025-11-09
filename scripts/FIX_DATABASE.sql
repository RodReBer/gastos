-- Script de reparación para la base de datos
-- Ejecuta este script en Supabase SQL Editor

-- 1. Arreglar la foreign key faltante en group_invitations
DO $$
BEGIN
    -- Verificar y crear la constraint si no existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'group_invitations_invited_by_fkey'
        AND table_name = 'group_invitations'
    ) THEN
        -- Primero, limpiar datos inválidos si existen
        DELETE FROM group_invitations 
        WHERE invited_by NOT IN (SELECT id FROM users);
        
        -- Crear la foreign key
        ALTER TABLE group_invitations 
        ADD CONSTRAINT group_invitations_invited_by_fkey 
        FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Foreign key group_invitations_invited_by_fkey created successfully';
    ELSE
        RAISE NOTICE 'Foreign key group_invitations_invited_by_fkey already exists';
    END IF;
END $$;

-- 2. Arreglar la foreign key faltante en group_expenses
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'group_expenses_paid_by_fkey'
        AND table_name = 'group_expenses'
    ) THEN
        -- Limpiar datos inválidos
        DELETE FROM group_expenses 
        WHERE paid_by NOT IN (SELECT id FROM users);
        
        -- Crear la foreign key
        ALTER TABLE group_expenses 
        ADD CONSTRAINT group_expenses_paid_by_fkey 
        FOREIGN KEY (paid_by) REFERENCES users(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Foreign key group_expenses_paid_by_fkey created successfully';
    ELSE
        RAISE NOTICE 'Foreign key group_expenses_paid_by_fkey already exists';
    END IF;
END $$;

-- 3. Crear índices para mejorar performance de JOINs
CREATE INDEX IF NOT EXISTS idx_group_invitations_invited_by 
ON group_invitations(invited_by);

CREATE INDEX IF NOT EXISTS idx_group_expenses_paid_by 
ON group_expenses(paid_by);

-- 4. Verificar que la estructura sea correcta
DO $$
DECLARE
    invitations_fkey_count INTEGER;
    expenses_fkey_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO invitations_fkey_count
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'group_invitations_invited_by_fkey'
    AND table_name = 'group_invitations';
    
    SELECT COUNT(*) INTO expenses_fkey_count
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'group_expenses_paid_by_fkey'
    AND table_name = 'group_expenses';
    
    IF invitations_fkey_count > 0 THEN
        RAISE NOTICE '✓ group_invitations_invited_by_fkey verificada correctamente';
    ELSE
        RAISE WARNING '✗ group_invitations_invited_by_fkey NO encontrada';
    END IF;
    
    IF expenses_fkey_count > 0 THEN
        RAISE NOTICE '✓ group_expenses_paid_by_fkey verificada correctamente';
    ELSE
        RAISE WARNING '✗ group_expenses_paid_by_fkey NO encontrada';
    END IF;
END $$;

-- 5. Mostrar estadísticas
SELECT 
    'group_invitations' as tabla,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pendientes,
    COUNT(CASE WHEN status = 'accepted' THEN 1 END) as aceptadas,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rechazadas
FROM group_invitations;

SELECT 
    'group_expenses' as tabla,
    COUNT(*) as total_registros
FROM group_expenses;
