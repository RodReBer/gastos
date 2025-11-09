import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ auth0: string }> }
) {
  const { auth0: action } = await params
  const { searchParams } = new URL(request.url)
  
  if (action === 'login') {
    // Generar un state aleatorio para seguridad
    const state = Math.random().toString(36).substring(7)
    
    const redirectUrl = `${process.env.AUTH0_ISSUER_BASE_URL}/authorize?` +
      `client_id=${process.env.AUTH0_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(`${process.env.AUTH0_BASE_URL}/api/auth/callback`)}&` +
      `response_type=code&` +
      `scope=openid%20profile%20email%20offline_access&` +
      `state=${state}`
    
    console.log('Login redirect URL:', redirectUrl)
    console.log('Client ID:', process.env.AUTH0_CLIENT_ID)
    console.log('Redirect URI:', `${process.env.AUTH0_BASE_URL}/api/auth/callback`)
    return NextResponse.redirect(redirectUrl)
  }
  
  if (action === 'logout') {
    console.log('Logging out user...')
    
    // Crear respuesta que redirige directamente a la página de login
    const response = NextResponse.redirect(`${process.env.AUTH0_BASE_URL}/login`)
    
    // Eliminar las cookies de sesión estableciendo maxAge a 0
    response.cookies.set('access_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })
    
    response.cookies.set('id_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })
    
    console.log('Cookies deleted, redirecting to login page...')
    
    return response
  }
  
  if (action === 'callback') {
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    
    if (error) {
      console.error('Auth0 callback error:', error, searchParams.get('error_description'))
      return NextResponse.redirect(`${process.env.AUTH0_BASE_URL}/login?error=${error}`)
    }
    
    if (!code) {
      return NextResponse.redirect(`${process.env.AUTH0_BASE_URL}/login?error=no_code`)
    }
    
    try {
      // Intercambiar el código por tokens
      console.log('Exchanging code for tokens...')
      console.log('Redirect URI:', `${process.env.AUTH0_BASE_URL}/api/auth/callback`)
      
      const tokenResponse = await fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          client_id: process.env.AUTH0_CLIENT_ID,
          client_secret: process.env.AUTH0_CLIENT_SECRET,
          code,
          redirect_uri: `${process.env.AUTH0_BASE_URL}/api/auth/callback`,
        }),
      })
      
      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.text()
        console.error('Token exchange failed!')
        console.error('Status:', tokenResponse.status)
        console.error('Error:', errorData)
        return NextResponse.redirect(`${process.env.AUTH0_BASE_URL}/login?error=token_exchange_failed`)
      }
      
      const tokens = await tokenResponse.json()
      console.log('Tokens received successfully!')
      
      // Decodificar el ID token para obtener info del usuario
      if (tokens.id_token) {
        try {
          const payload = JSON.parse(
            Buffer.from(tokens.id_token.split('.')[1], 'base64').toString()
          )
          
          console.log('JWT Payload:', payload)
          
          // Extraer el nombre del usuario (puede venir en diferentes campos)
          const userName = payload.name || payload.nickname || payload.given_name || payload.email?.split('@')[0] || 'User'
          
          console.log('Creating/updating user in database...', payload.sub, userName)
          
          // Crear o actualizar usuario en Supabase usando admin client para bypass RLS
          const supabase = getSupabaseAdminClient()
          const { error: upsertError } = await supabase
            .from('users')
            .upsert(
              {
                auth0_id: payload.sub,
                email: payload.email,
                name: userName,
                updated_at: new Date().toISOString(),
              } as any,
              {
                onConflict: 'auth0_id'
              }
            )
          
          if (upsertError) {
            console.error('Error creating/updating user:', upsertError)
          } else {
            console.log('User created/updated successfully!')
          }
        } catch (err) {
          console.error('Error processing user data:', err)
        }
      }
      
      // Crear respuesta y establecer cookies
      const response = NextResponse.redirect(`${process.env.AUTH0_BASE_URL}/dashboard`)
      
      // Guardar tokens en cookies seguras con maxAge de 7 días
      const cookieMaxAge = 7 * 24 * 60 * 60 // 7 días en segundos
      
      response.cookies.set('access_token', tokens.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: cookieMaxAge,
        path: '/',
      })
      
      if (tokens.id_token) {
        response.cookies.set('id_token', tokens.id_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: cookieMaxAge,
          path: '/',
        })
      }
      
      // Si hay refresh token, guardarlo también
      if (tokens.refresh_token) {
        response.cookies.set('refresh_token', tokens.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: cookieMaxAge,
          path: '/',
        })
      }
      
      return response
    } catch (error) {
      console.error('Callback processing error:', error)
      return NextResponse.redirect(`${process.env.AUTH0_BASE_URL}/login?error=callback_failed`)
    }
  }
  
  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
