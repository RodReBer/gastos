-- Arreglar la foreign key faltante en group_invitations
-- Esta foreign key permite hacer JOINs con la tabla users usando invited_by

-- Primero, verificar si ya existe la constraint
DO $$
BEGIN
    -- Si la constraint no existe, crearla
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'group_invitations_invited_by_fkey'
        AND table_name = 'group_invitations'
    ) THEN
        -- Crear la foreign key
        ALTER TABLE group_invitations 
        ADD CONSTRAINT group_invitations_invited_by_fkey 
        FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Foreign key group_invitations_invited_by_fkey created successfully';
    ELSE
        RAISE NOTICE 'Foreign key group_invitations_invited_by_fkey already exists';
    END IF;
END $$;

-- Crear un índice para mejorar el performance de los JOINs
CREATE INDEX IF NOT EXISTS idx_group_invitations_invited_by 
ON group_invitations(invited_by);

COMMENT ON CONSTRAINT group_invitations_invited_by_fkey ON group_invitations 
IS 'Usuario que envió la invitación al grupo';
