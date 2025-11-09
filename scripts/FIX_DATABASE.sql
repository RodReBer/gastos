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

-- 2. Crear índice para mejorar performance de JOINs
CREATE INDEX IF NOT EXISTS idx_group_invitations_invited_by 
ON group_invitations(invited_by);

-- 3. Verificar que la estructura sea correcta
DO $$
DECLARE
    constraint_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO constraint_count
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'group_invitations_invited_by_fkey'
    AND table_name = 'group_invitations';
    
    IF constraint_count > 0 THEN
        RAISE NOTICE '✓ Foreign key constraint verificada correctamente';
    ELSE
        RAISE WARNING '✗ Foreign key constraint NO encontrada - ejecuta el script nuevamente';
    END IF;
END $$;

-- 4. Mostrar estadísticas
SELECT 
    'group_invitations' as tabla,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pendientes,
    COUNT(CASE WHEN status = 'accepted' THEN 1 END) as aceptadas,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rechazadas
FROM group_invitations;
