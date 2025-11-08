import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  // Rutas públicas que no requieren autenticación
  const publicPaths = ['/login', '/api/auth']
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))
  
  if (isPublicPath) {
    return NextResponse.next()
  }
  
  // Verificar si hay tokens de sesión
  const hasIdToken = req.cookies.get('id_token')
  const hasAccessToken = req.cookies.get('access_token')
  
  // Si está intentando acceder a rutas protegidas sin autenticación
  if (!hasIdToken && !hasAccessToken && pathname.startsWith('/dashboard')) {
    const loginUrl = new URL('/login', req.url)
    return NextResponse.redirect(loginUrl)
  }
  
  // Si está autenticado e intenta ir a /login, redirigir al dashboard
  if ((hasIdToken || hasAccessToken) && pathname === '/login') {
    const dashboardUrl = new URL('/dashboard', req.url)
    return NextResponse.redirect(dashboardUrl)
  }
  
  // Si está en la raíz y autenticado, redirigir al dashboard
  if ((hasIdToken || hasAccessToken) && pathname === '/') {
    const dashboardUrl = new URL('/dashboard', req.url)
    return NextResponse.redirect(dashboardUrl)
  }
  
  // Si está en la raíz sin autenticación, redirigir al login
  if (!hasIdToken && !hasAccessToken && pathname === '/') {
    const loginUrl = new URL('/login', req.url)
    return NextResponse.redirect(loginUrl)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/login"],
}
