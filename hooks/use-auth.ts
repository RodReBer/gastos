"use client"

import { useUser } from "@auth0/nextjs-auth0/client"

export function useAuth() {
  const { user, error, isLoading } = useUser()

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user && !isLoading,
    userId: user?.sub,
  }
}
