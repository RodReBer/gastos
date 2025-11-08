// Configuración de Auth0
export const auth0Config = {
  domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN || process.env.AUTH0_DOMAIN || '',
  clientId: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || process.env.AUTH0_CLIENT_ID || '',
  issuerBaseUrl: process.env.AUTH0_ISSUER_BASE_URL || `https://${process.env.AUTH0_DOMAIN}` || '',
  baseUrl: process.env.AUTH0_BASE_URL || 'http://localhost:3000',
}

export default auth0Config
