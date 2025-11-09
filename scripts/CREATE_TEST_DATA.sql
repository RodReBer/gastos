-- Script para crear datos de prueba: grupos e invitaciones
-- Ejecuta este script DESPUÉS de verificar con CHECK_INVITATIONS.sql

-- NOTA: Este script usa el email rodrigorey2005@gmail.com
-- Si quieres probar con otro email, cámbialo en las líneas correspondientes

-- 1. Verificar que tu usuario existe
DO $$
DECLARE
    user_exists BOOLEAN;
    user_uuid UUID;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM users 
        WHERE email = 'rodrigorey2005@gmail.com'
    ) INTO user_exists;
    
    IF user_exists THEN
        SELECT id INTO user_uuid FROM users WHERE email = 'rodrigorey2005@gmail.com';
        RAISE NOTICE 'Usuario encontrado: % (UUID: %)', 'rodrigorey2005@gmail.com', user_uuid;
    ELSE
        RAISE WARNING 'Usuario NO encontrado: %', 'rodrigorey2005@gmail.com';
        RAISE NOTICE 'Primero inicia sesión en la app para crear tu usuario';
    END IF;
END $$;

-- 2. Crear un grupo de ejemplo (si no existe)
INSERT INTO expense_groups (name, description, created_by, currency, split_method)
SELECT 
    'Casa Compartida 🏠',
    'Gastos del apartamento compartido - alquiler, servicios, comida',
    u.id,
    'UYU',
    'proportional'
FROM users u
WHERE u.email = 'rodrigorey2005@gmail.com'
ON CONFLICT DO NOTHING
RETURNING id, name;

-- 3. Crear otro grupo de ejemplo
INSERT INTO expense_groups (name, description, created_by, currency, split_method)
SELECT 
    'Viaje a la Costa ✈️',
    'Gastos compartidos del viaje de verano',
    u.id,
    'USD',
    'equal'
FROM users u
WHERE u.email = 'rodrigorey2005@gmail.com'
ON CONFLICT DO NOTHING
RETURNING id, name;

-- 4. Agregar al usuario como miembro admin de sus propios grupos
INSERT INTO group_members (group_id, user_id, role, monthly_income)
SELECT 
    eg.id,
    u.id,
    'admin',
    50000.00
FROM expense_groups eg
JOIN users u ON eg.created_by = u.id
WHERE u.email = 'rodrigorey2005@gmail.com'
ON CONFLICT (group_id, user_id) DO NOTHING;

-- 5. Crear invitación de prueba (tú invitándote a ti mismo con otro email)
-- Cambia 'otro_email@ejemplo.com' por un email de prueba
INSERT INTO group_invitations (group_id, invited_by, email, status)
SELECT 
    eg.id,
    u.id,
    'test@example.com', -- Email de prueba
    'pending'
FROM expense_groups eg
JOIN users u ON eg.created_by = u.id
WHERE u.email = 'rodrigorey2005@gmail.com'
    AND eg.name = 'Casa Compartida 🏠'
LIMIT 1
ON CONFLICT DO NOTHING
RETURNING id, email, (SELECT name FROM expense_groups WHERE id = group_id) as group_name;

-- 6. Crear una segunda invitación
INSERT INTO group_invitations (group_id, invited_by, email, status)
SELECT 
    eg.id,
    u.id,
    'amigo@gmail.com', -- Otro email de prueba
    'pending'
FROM expense_groups eg
JOIN users u ON eg.created_by = u.id
WHERE u.email = 'rodrigorey2005@gmail.com'
    AND eg.name = 'Viaje a la Costa ✈️'
LIMIT 1
ON CONFLICT DO NOTHING
RETURNING id, email, (SELECT name FROM expense_groups WHERE id = group_id) as group_name;

-- 7. Crear gastos de ejemplo en el grupo
INSERT INTO group_expenses (
    group_id, 
    paid_by, 
    description, 
    amount, 
    currency, 
    expense_date, 
    category
)
SELECT 
    eg.id,
    u.id,
    'Supermercado Devoto',
    2500.00,
    'UYU',
    CURRENT_DATE,
    'food'
FROM expense_groups eg
JOIN users u ON eg.created_by = u.id
WHERE u.email = 'rodrigorey2005@gmail.com'
    AND eg.name = 'Casa Compartida 🏠'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO group_expenses (
    group_id, 
    paid_by, 
    description, 
    amount, 
    currency, 
    expense_date, 
    category
)
SELECT 
    eg.id,
    u.id,
    'UTE - Electricidad',
    1800.00,
    'UYU',
    CURRENT_DATE - INTERVAL '2 days',
    'utilities'
FROM expense_groups eg
JOIN users u ON eg.created_by = u.id
WHERE u.email = 'rodrigorey2005@gmail.com'
    AND eg.name = 'Casa Compartida 🏠'
LIMIT 1
ON CONFLICT DO NOTHING;

-- 8. Mostrar resumen de lo creado
SELECT 
    '=== RESUMEN DE DATOS CREADOS ===' as info
UNION ALL
SELECT '---'
UNION ALL
SELECT 'Grupos: ' || COUNT(*)::text
FROM expense_groups eg
JOIN users u ON eg.created_by = u.id
WHERE u.email = 'rodrigorey2005@gmail.com'
UNION ALL
SELECT 'Invitaciones Pendientes: ' || COUNT(*)::text
FROM group_invitations gi
JOIN users u ON gi.invited_by = u.id
WHERE u.email = 'rodrigorey2005@gmail.com'
    AND gi.status = 'pending'
UNION ALL
SELECT 'Gastos Registrados: ' || COUNT(*)::text
FROM group_expenses ge
JOIN users u ON ge.paid_by = u.id
WHERE u.email = 'rodrigorey2005@gmail.com';

-- 9. Ver invitaciones creadas
SELECT 
    gi.email as invited_email,
    eg.name as group_name,
    gi.status,
    gi.created_at
FROM group_invitations gi
JOIN expense_groups eg ON gi.group_id = eg.id
JOIN users u ON gi.invited_by = u.id
WHERE u.email = 'rodrigorey2005@gmail.com'
ORDER BY gi.created_at DESC;
