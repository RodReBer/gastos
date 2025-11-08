import { cookies } from 'next/headers'
import { jwtDecode } from 'jwt-decode'

export interface Session {
  user: {
    sub: string
    name?: string
    email?: string
    picture?: string
    email_verified?: boolean
  }
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const idToken = cookieStore.get('id_token')?.value
  const accessToken = cookieStore.get('access_token')?.value

  if (!idToken && !accessToken) {
    return null
  }

  try {
    if (idToken) {
      const decoded = jwtDecode(idToken) as any
      return {
        user: {
          sub: decoded.sub,
          name: decoded.name,
          email: decoded.email,
          picture: decoded.picture,
          email_verified: decoded.email_verified,
        },
      }
    }

    if (accessToken) {
      // Fallback: llamar al endpoint /userinfo de Auth0
      const response = await fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/userinfo`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (response.ok) {
        const user = await response.json()
        return { user }
      }
    }

    return null
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}
