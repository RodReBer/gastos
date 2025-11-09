-- Script para LIMPIAR TODAS LAS TABLAS (EMPEZAR DE CERO)
-- ⚠️ ADVERTENCIA: Esto borrará TODOS los datos de las tablas
-- ⚠️ NO ejecutes esto en producción sin backup

-- 1. Desactivar temporalmente RLS para poder borrar todo
ALTER TABLE group_invitations DISABLE ROW LEVEL SECURITY;
ALTER TABLE group_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE expense_splits DISABLE ROW LEVEL SECURITY;
ALTER TABLE group_expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE expense_groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. Borrar todos los datos (en orden correcto por foreign keys)
TRUNCATE TABLE expense_splits CASCADE;
TRUNCATE TABLE group_expenses CASCADE;
TRUNCATE TABLE group_invitations CASCADE;
TRUNCATE TABLE group_members CASCADE;
TRUNCATE TABLE expense_groups CASCADE;
TRUNCATE TABLE payments CASCADE;
TRUNCATE TABLE invoices CASCADE;
TRUNCATE TABLE audit_logs CASCADE;
TRUNCATE TABLE users CASCADE;

-- 3. Reactivar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_splits ENABLE ROW LEVEL SECURITY;

-- 4. Verificar que todo está vacío
SELECT 
    'users' as tabla,
    COUNT(*) as registros
FROM users
UNION ALL
SELECT 'invoices', COUNT(*) FROM invoices
UNION ALL
SELECT 'payments', COUNT(*) FROM payments
UNION ALL
SELECT 'expense_groups', COUNT(*) FROM expense_groups
UNION ALL
SELECT 'group_members', COUNT(*) FROM group_members
UNION ALL
SELECT 'group_invitations', COUNT(*) FROM group_invitations
UNION ALL
SELECT 'group_expenses', COUNT(*) FROM group_expenses
UNION ALL
SELECT 'expense_splits', COUNT(*) FROM expense_splits
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM audit_logs;

-- 5. Mensaje de confirmación
SELECT '✓ TODAS LAS TABLAS HAN SIDO VACIADAS' as resultado;
SELECT '✓ Ahora puedes iniciar sesión nuevamente para crear tu usuario desde cero' as siguiente_paso;
