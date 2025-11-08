// Server-side Supabase Client
import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

let serverClient: ReturnType<typeof createServerClient> | null = null
let adminClient: ReturnType<typeof createClient> | null = null

export async function getSupabaseServerClient() {
  if (serverClient) return serverClient

  const cookieStore = await cookies()

  serverClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    },
  )

  return serverClient
}

// Admin client with service role key that bypasses RLS
export function getSupabaseAdminClient() {
  if (adminClient) return adminClient

  adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  return adminClient
}

// Helper para obtener el usuario actual en rutas API
export async function getCurrentUser() {
  const supabase = await getSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  return user
}
