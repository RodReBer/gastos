-- Script para crear una invitación PARA rodrigorey2005@gmail.com
-- Así podrás ver y probar el sistema de notificaciones

-- Opción 1: Usar el grupo "los novios" existente para invitarte
-- (Asumiendo que belugomez177@gmail.com es la creadora del grupo)

-- Primero, verificar quién creó el grupo "los novios"
SELECT 
    eg.id,
    eg.name,
    eg.created_by,
    u.email as creator_email,
    u.name as creator_name
FROM expense_groups eg
LEFT JOIN users u ON eg.created_by = u.id
WHERE eg.name = 'los novios';

-- Ahora crear una invitación de belugomez177@gmail.com PARA rodrigorey2005@gmail.com
-- (Simulando que ella te invita al grupo)
INSERT INTO group_invitations (group_id, invited_by, email, status)
SELECT 
    eg.id,
    eg.created_by,
    'rodrigorey2005@gmail.com', -- TU email
    'pending'
FROM expense_groups eg
WHERE eg.name = 'los novios'
ON CONFLICT DO NOTHING
RETURNING 
    id,
    email as "Tu email (invitado)",
    (SELECT name FROM expense_groups WHERE id = group_id) as "Grupo",
    'INVITACIÓN CREADA ✓' as status;

-- Opción 2: Crear un grupo nuevo donde TÚ invitas a belugomez177@gmail.com
-- Y luego ella te invita de vuelta
INSERT INTO expense_groups (name, description, created_by, currency, split_method)
SELECT 
    'Gastos Compartidos Belu & Rodri 💑',
    'Gastos compartidos de pareja',
    u.id,
    'UYU',
    'equal'
FROM users u
WHERE u.email = 'rodrigorey2005@gmail.com'
ON CONFLICT DO NOTHING
RETURNING id, name, 'GRUPO CREADO ✓' as status;

-- Y crear una invitación DE belugomez PARA ti en el grupo original
DO $$
DECLARE
    belu_user_id UUID;
    los_novios_group_id UUID;
BEGIN
    -- Obtener el ID de belugomez si existe
    SELECT id INTO belu_user_id FROM users WHERE email = 'belugomez177@gmail.com';
    SELECT id INTO los_novios_group_id FROM expense_groups WHERE name = 'los novios';
    
    IF belu_user_id IS NOT NULL AND los_novios_group_id IS NOT NULL THEN
        -- Crear invitación para ti
        INSERT INTO group_invitations (group_id, invited_by, email, status)
        VALUES (
            los_novios_group_id,
            belu_user_id,
            'rodrigorey2005@gmail.com',
            'pending'
        )
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Invitación creada: belugomez177@gmail.com te invitó al grupo "los novios"';
    ELSE
        RAISE WARNING 'No se pudo crear la invitación. Usuario o grupo no encontrado.';
    END IF;
END $$;

-- Ver todas las invitaciones PARA rodrigorey2005@gmail.com
SELECT 
    gi.email as "Tu Email",
    eg.name as "Grupo",
    u.email as "Invitado Por",
    u.name as "Nombre Invitador",
    gi.status as "Estado",
    gi.created_at as "Fecha"
FROM group_invitations gi
JOIN expense_groups eg ON gi.group_id = eg.id
LEFT JOIN users u ON gi.invited_by = u.id
WHERE LOWER(gi.email) = 'rodrigorey2005@gmail.com'
ORDER BY gi.created_at DESC;
