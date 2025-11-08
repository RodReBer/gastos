// Auth0 configuration constants
export const auth0Config = {
  domain: process.env.AUTH0_DOMAIN || "",
  clientId: process.env.AUTH0_CLIENT_ID || "",
  baseURL: process.env.AUTH0_BASE_URL || "http://localhost:3000",
  secret: process.env.AUTH0_CLIENT_SECRET || "",
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL || "",
  clientSecret: process.env.AUTH0_CLIENT_SECRET || "",
}
