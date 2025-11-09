# Sistema de Notificaciones e Invitaciones

## ✅ Cambios Implementados

### 1. **Campanita de Notificaciones** 🔔

Se ha agregado una campanita de notificaciones en la barra de navegación superior (`dashboard-nav.tsx`) que:

- **Muestra el número de invitaciones pendientes** con un badge rojo
- **Se actualiza automáticamente** cada 60 segundos
- **Muestra un menú desplegable** al hacer clic con las invitaciones recientes
- **Redirige a la página de invitaciones** cuando se hace clic en "Ver todas las invitaciones"

### 2. **Página de Invitaciones** 📬

Nueva página en `/dashboard/invitations` donde los usuarios pueden:

- **Ver todas las invitaciones pendientes**
- **Aceptar o rechazar invitaciones** con botones claros
- **Ver detalles del grupo**: nombre, descripción, moneda, fecha de invitación
- **Ver quién los invitó**

### 3. **Correcciones de Errores** 🔧

Se han corregido los problemas de autenticación:

- **Mejorado el manejo de errores 401** en `use-auth.ts`
- **Agregado manejo de credenciales** en todas las peticiones fetch
- **Mejorado el logging** en endpoints para facilitar debugging
- **Reducido el spam de reintentos** en SWR para evitar sobrecarga

## 📁 Archivos Creados/Modificados

### Nuevos Archivos:
1. `components/layout/notifications-bell.tsx` - Componente de la campanita
2. `app/dashboard/invitations/page.tsx` - Página de gestión de invitaciones

### Archivos Modificados:
1. `lib/utils.ts` - Agregado fetcher para SWR
2. `hooks/use-auth.ts` - Mejorado manejo de errores
3. `components/layout/dashboard-nav.tsx` - Agregada campanita de notificaciones
4. `app/api/invitations/route.ts` - Mejorado manejo de errores y logging

## 🚀 Cómo Usar

### Para el Usuario Final:

1. **Ver Notificaciones:**
   - Mira la campanita en la esquina superior derecha
   - El número rojo indica cuántas invitaciones tienes pendientes
   - Haz clic para ver un resumen rápido

2. **Gestionar Invitaciones:**
   - Haz clic en "Ver todas las invitaciones" en el menú de la campanita
   - O navega directamente a `/dashboard/invitations`
   - Haz clic en "Aceptar" para unirte al grupo
   - Haz clic en "Rechazar" para declinar la invitación

### Para Desarrollo:

1. **Verificar que Auth0 esté configurado correctamente:**
   ```bash
   # Asegúrate de tener estas variables de entorno
   AUTH0_SECRET=your_secret
   AUTH0_BASE_URL=https://gastos-seguimiento.netlify.app
   AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com
   AUTH0_CLIENT_ID=your_client_id
   AUTH0_CLIENT_SECRET=your_client_secret
   ```

2. **Verificar cookies después del login:**
   - Debe haber una cookie `id_token` o `access_token`
   - Si no existen, revisa la configuración de Auth0

3. **Ver logs en Netlify:**
   - Ve a Functions logs para ver los console.log
   - Busca `[Invitations]` para ver el flujo de las invitaciones

## 🐛 Solución de Problemas

### Si sigues viendo errores 401:

1. **Limpia las cookies y vuelve a iniciar sesión:**
   ```javascript
   // En la consola del navegador:
   document.cookie.split(";").forEach(c => document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"));
   ```

2. **Verifica que Auth0 esté retornando tokens:**
   - Abre DevTools → Network
   - Busca la llamada a `/api/auth/callback`
   - Verifica que se estén estableciendo las cookies

### Si sigues viendo errores 500:

1. **Revisa los logs de Netlify Functions**
2. **Verifica la conexión a Supabase**
3. **Asegúrate de que las tablas existan en la base de datos**

## 📊 Flujo del Sistema

```
Usuario invita a alguien
    ↓
Se crea registro en group_invitations
    ↓
El invitado ve la campanita con notificación (1)
    ↓
Hace clic y ve el resumen
    ↓
Va a /dashboard/invitations
    ↓
Acepta o rechaza
    ↓
Se actualiza group_members (si acepta)
    ↓
La notificación desaparece
```

## 🎨 Personalización

### Cambiar el intervalo de actualización:

En `components/layout/notifications-bell.tsx`:
```typescript
refreshInterval: 60000, // Cambiar a los milisegundos deseados
```

### Cambiar el límite de notificaciones mostradas:

En `components/layout/notifications-bell.tsx`:
```typescript
{pendingCount > 9 ? "9+" : pendingCount} // Cambiar el 9 al número deseado
```

## 📝 Notas Adicionales

- Las invitaciones se actualizan automáticamente sin necesidad de recargar la página
- El sistema maneja correctamente casos donde el email en Auth0 difiere del email en la base de datos
- Las notificaciones se marcan automáticamente como leídas cuando se aceptan o rechazan
- El sistema es responsive y funciona en mobile
