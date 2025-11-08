import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const idToken = cookieStore.get('id_token')?.value
    const accessToken = cookieStore.get('access_token')?.value
    
    console.log('Profile endpoint called')
    console.log('Has ID token:', !!idToken)
    console.log('Has access token:', !!accessToken)
    
    if (!idToken && !accessToken) {
      console.log('No tokens found, returning 401')
      return NextResponse.json({ user: null }, { status: 401 })
    }
    
    // Decodificar el ID token para obtener la información del usuario
    if (idToken) {
      try {
        const payload = JSON.parse(
          Buffer.from(idToken.split('.')[1], 'base64').toString()
        )
        
        return NextResponse.json({
          user: {
            sub: payload.sub,
            name: payload.name,
            email: payload.email,
            picture: payload.picture,
            email_verified: payload.email_verified,
          }
        })
      } catch (error) {
        console.error('Error decoding token:', error)
      }
    }
    
    // Si solo tenemos access token, obtener info del usuario de Auth0
    if (accessToken) {
      try {
        const userInfoResponse = await fetch(
          `${process.env.AUTH0_ISSUER_BASE_URL}/userinfo`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )
        
        if (userInfoResponse.ok) {
          const user = await userInfoResponse.json()
          return NextResponse.json({ user })
        }
      } catch (error) {
        console.error('Error fetching user info:', error)
      }
    }
    
    return NextResponse.json({ user: null }, { status: 401 })
  } catch (error) {
    console.error('Profile endpoint error:', error)
    return NextResponse.json({ user: null }, { status: 500 })
  }
}
