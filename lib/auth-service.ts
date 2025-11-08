// Singleton pattern for Auth0 management
import { ManagementClient } from "auth0"

let managementClient: ManagementClient | null = null

export async function getManagementClient(): Promise<ManagementClient> {
  if (managementClient) return managementClient

  managementClient = new ManagementClient({
    domain: process.env.AUTH0_DOMAIN || "",
    clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID || "",
    clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET || "",
  })

  return managementClient
}

export async function getUserById(userId: string) {
  const client = await getManagementClient()
  return client.users.get(userId)
}

export async function listUsers() {
  const client = await getManagementClient()
  return client.users.list()
}
