"use client"

import { Button } from "@/components/ui/button"

export function LogoutButton() {
  const handleLogout = () => {
    // Primero eliminar las cookies del lado del cliente
    document.cookie = 'id_token=; Max-Age=0; path=/;'
    document.cookie = 'access_token=; Max-Age=0; path=/;'
    
    // Redirigir a Auth0 logout
    window.location.href = "/api/auth/logout"
  }

  return (
    <Button variant="outline" onClick={handleLogout}>
      Logout
    </Button>
  )
}
