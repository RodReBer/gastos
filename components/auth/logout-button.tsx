"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"

export function LogoutButton() {
  const { logout } = useAuth()

  return (
    <Button variant="outline" onClick={logout}>
      Logout
    </Button>
  )
}
