"use client"

import { Button } from "@/components/ui/button"

export function LoginButton() {
  const handleLogin = () => {
    window.location.href = "/api/auth/login"
  }

  return (
    <Button onClick={handleLogin}>Login</Button>
  )
}
