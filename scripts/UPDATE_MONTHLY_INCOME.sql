-- Script para configurar ingresos mensuales
-- Esto permite que la división proporcional funcione correctamente

-- PASO 1: Ver usuarios actuales y sus ingresos
SELECT 
    id,
    email,
    name,
    monthly_income
FROM users
ORDER BY email;

-- PASO 2: Actualizar tu ingreso mensual en la tabla users
-- REEMPLAZA 'tu-email@gmail.com' y el monto según corresponda
-- Ejemplo para Rodrigo (100000 UYU) y Belu (75000 UYU)

UPDATE users 
SET monthly_income = 100000 
WHERE email = 'rodrigorey2005@gmail.com';

UPDATE users 
SET monthly_income = 75000 
WHERE email = 'belu@example.com';  -- Cambia esto por el email real de Belu

-- PASO 3: Ver miembros de grupos y sus ingresos actuales
SELECT 
    gm.id,
    eg.name as group_name,
    u.email,
    u.name,
    gm.monthly_income as income_in_group,
    u.monthly_income as income_in_users
FROM group_members gm
JOIN expense_groups eg ON gm.group_id = eg.id
JOIN users u ON gm.user_id = u.id
ORDER BY eg.name, u.email;

-- PASO 4: Sincronizar monthly_income de users a group_members
-- Esto actualiza todos los grupos con los ingresos actuales de cada usuario
UPDATE group_members gm
SET monthly_income = u.monthly_income
FROM users u
WHERE gm.user_id = u.id;

-- PASO 5: Verificar que se actualizó correctamente
SELECT 
    eg.name as group_name,
    eg.split_method,
    u.email,
    u.name,
    gm.monthly_income as income_in_group,
    gm.role
FROM group_members gm
JOIN expense_groups eg ON gm.group_id = eg.id
JOIN users u ON gm.user_id = u.id
ORDER BY eg.name, u.email;

-- PASO 6 (OPCIONAL): Ver cómo se dividiría un gasto de ejemplo
-- Por ejemplo, un gasto de 10000 UYU en un grupo con división proporcional
SELECT 
    eg.name as group_name,
    u.email,
    u.name,
    gm.monthly_income,
    CASE 
        WHEN (SELECT SUM(monthly_income) FROM group_members WHERE group_id = gm.group_id) = 0 
        THEN 10000.0 / (SELECT COUNT(*) FROM group_members WHERE group_id = gm.group_id)
        ELSE 10000.0 * gm.monthly_income / (SELECT SUM(monthly_income) FROM group_members WHERE group_id = gm.group_id)
    END as amount_owed
FROM group_members gm
JOIN expense_groups eg ON gm.group_id = eg.id
JOIN users u ON gm.user_id = u.id
WHERE eg.split_method = 'proportional'
ORDER BY eg.name, u.email;
