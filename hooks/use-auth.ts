"use client"

import useSWR from "swr"
import { useRouter } from "next/navigation"

const fetcher = async (url: string) => {
  const res = await fetch(url, {
    credentials: 'include', // Incluir cookies
  })
  
  if (!res.ok) {
    if (res.status === 401) {
      // Si es 401, retornar usuario nulo en lugar de error
      return { user: null }
    }
    throw new Error("Failed to fetch user")
  }
  
  return res.json()
}

export function useAuth() {
  const router = useRouter()
  const { data, error, isLoading, mutate } = useSWR("/auth/profile", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false, // No reintentar automáticamente
    dedupingInterval: 2000, // Reducir llamadas duplicadas
  })

  const logout = () => {
    // Limpiar cookies del cliente
    document.cookie = 'id_token=; Max-Age=0; path=/;'
    document.cookie = 'access_token=; Max-Age=0; path=/;'
    
    // Redirigir al logout
    window.location.href = "/api/auth/logout"
  }

  return {
    user: data?.user || null,
    isLoading,
    error,
    isAuthenticated: !!data?.user && !isLoading,
    userId: data?.user?.sub,
    logout,
    mutate,
  }
}
