# 🔧 Arreglos de Base de Datos - Auth0 & Invitaciones

## ✅ Cambios Realizados

### 1. **Auth0 Local Development** 
Se configuró `AUTH0_BASE_URL=http://localhost:3000` en `.env` para evitar redirects a producción.

### 2. **Fix: UUID vs Auth0 ID**
Se corrigió `/api/dashboard/categories` para primero obtener el UUID del usuario antes de consultar facturas.

**Antes:**
```typescript
.eq("user_id", session.user.sub) // ❌ Auth0 ID (string) vs UUID
```

**Después:**
```typescript
// Primero obtener UUID
const { data: user } = await supabase
  .from("users")
  .select("id")
  .eq("auth0_id", session.user.sub)
  .single()

// Luego usar UUID correcto
.eq("user_id", user.id) // ✅ UUID
```

---

## 🔴 Errores Actuales

### Error 1: Foreign Key Faltante
```
Could not find a relationship between 'group_invitations' and 'users' 
using the hint 'group_invitations_invited_by_fkey'
```

**Causa:** La tabla `group_invitations` tiene la columna `invited_by` pero le falta la constraint de foreign key.

### Error 2: Invalid UUID
```
invalid input syntax for type uuid: "google-oauth2|108552409206874468381"
```

**Causa:** Se intentaba usar el Auth0 ID directamente en lugar del UUID de la tabla users.

---

## 🛠️ Solución: Ejecutar Script SQL

### Pasos:

1. **Ir a Supabase Dashboard**
   - Abre https://supabase.com/dashboard
   - Selecciona tu proyecto: `wsdzvhnjymqmgwnyykzy`

2. **SQL Editor**
   - Click en "SQL Editor" en el menú lateral
   - Click en "New query"

3. **Copiar y Ejecutar**
   - Abre el archivo `scripts/FIX_DATABASE.sql`
   - Copia TODO el contenido
   - Pégalo en el SQL Editor
   - Click en **RUN** (o Ctrl+Enter)

4. **Verificar Resultados**
   Deberías ver:
   ```
   ✓ Foreign key constraint verificada correctamente
   ```

---

## 📋 Checklist Post-Fix

- [ ] Ejecutar `scripts/FIX_DATABASE.sql` en Supabase
- [ ] Reiniciar el servidor de desarrollo: `npm run dev`
- [ ] Refrescar la página del dashboard
- [ ] Verificar que no aparezcan errores 500 en la consola
- [ ] Verificar que la campana de notificaciones funcione
- [ ] Probar crear una invitación a un grupo

---

## 🔍 Verificación Manual

Después de ejecutar el script, puedes verificar en Supabase SQL Editor:

```sql
-- Verificar que la foreign key existe
SELECT 
    constraint_name,
    table_name
FROM information_schema.table_constraints 
WHERE constraint_name = 'group_invitations_invited_by_fkey';

-- Debe retornar 1 fila con:
-- constraint_name: group_invitations_invited_by_fkey
-- table_name: group_invitations
```

---

## 📝 Notas Adicionales

### Auth0 Allowed Callback URLs

Si todavía ves el error de "Callback URL mismatch", asegúrate de agregar en Auth0:

**Applications → [Tu App] → Settings → Application URIs:**

- **Allowed Callback URLs:**
  ```
  http://localhost:3000/api/auth/callback,
  https://gastos-seguimiento.netlify.app/api/auth/callback
  ```

- **Allowed Logout URLs:**
  ```
  http://localhost:3000,
  https://gastos-seguimiento.netlify.app
  ```

- **Allowed Web Origins:**
  ```
  http://localhost:3000,
  https://gastos-seguimiento.netlify.app
  ```

### Limpiar Cookies

Si después de los cambios sigues teniendo problemas:

1. Abre DevTools (F12)
2. Application → Cookies
3. Elimina todas las cookies de `localhost:3000`
4. Cierra el navegador completamente
5. Vuelve a iniciar sesión

---

## 🎯 Próximos Pasos

Una vez arreglado esto, los próximos objetivos son:

1. ✅ Mejorar el UI del login/register
2. ✅ Ajustar los retry de SWR para evitar cascadas de requests
3. ✅ Agregar más validaciones en los formularios
4. ✅ Mejorar el manejo de errores en el frontend
