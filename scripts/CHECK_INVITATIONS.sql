-- Script para verificar invitaciones y estructura de tablas

-- 1. Ver todas las invitaciones en el sistema
SELECT 
    gi.id,
    gi.email as invited_email,
    gi.status,
    gi.created_at,
    eg.name as group_name,
    u.email as invited_by_email,
    u.name as invited_by_name
FROM group_invitations gi
LEFT JOIN expense_groups eg ON gi.group_id = eg.id
LEFT JOIN users u ON gi.invited_by = u.id
ORDER BY gi.created_at DESC;

-- 2. Ver específicamente invitaciones para rodrigorey2005@gmail.com
SELECT 
    gi.*,
    eg.name as group_name,
    u.email as invited_by_email
FROM group_invitations gi
LEFT JOIN expense_groups eg ON gi.group_id = eg.id
LEFT JOIN users u ON gi.invited_by = u.id
WHERE LOWER(gi.email) IN ('rodrigorey2005@gmail.com')
ORDER BY gi.created_at DESC;

-- 3. Ver todos los usuarios registrados
SELECT 
    id,
    auth0_id,
    email,
    name,
    created_at
FROM users
ORDER BY created_at DESC;

-- 4. Ver todos los grupos existentes
SELECT 
    eg.*,
    u.email as created_by_email,
    u.name as created_by_name,
    (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = eg.id) as member_count
FROM expense_groups eg
LEFT JOIN users u ON eg.created_by = u.id
ORDER BY eg.created_at DESC;

-- 5. Ver miembros de grupos
SELECT 
    gm.*,
    u.email as member_email,
    u.name as member_name,
    eg.name as group_name
FROM group_members gm
LEFT JOIN users u ON gm.user_id = u.id
LEFT JOIN expense_groups eg ON gm.group_id = eg.id
ORDER BY gm.joined_at DESC;

-- 6. Estadísticas generales
SELECT 
    'Total Usuarios' as metric,
    COUNT(*)::text as value
FROM users
UNION ALL
SELECT 
    'Total Grupos',
    COUNT(*)::text
FROM expense_groups
UNION ALL
SELECT 
    'Total Invitaciones',
    COUNT(*)::text
FROM group_invitations
UNION ALL
SELECT 
    'Invitaciones Pendientes',
    COUNT(*)::text
FROM group_invitations
WHERE status = 'pending'
UNION ALL
SELECT 
    'Total Miembros en Grupos',
    COUNT(*)::text
FROM group_members;

-- 7. Verificar foreign keys
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('group_invitations', 'expense_groups', 'group_members')
ORDER BY tc.table_name, tc.constraint_name;
