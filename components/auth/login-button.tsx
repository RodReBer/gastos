"use client"

import { Button } from "@/components/ui/button"
import { LogIn } from "lucide-react"
import { useState } from "react"

export function LoginButton() {
  const [isLoading, setIsLoading] = useState(false)
  
  const handleLogin = () => {
    setIsLoading(true)
    window.location.href = "/api/auth/login"
  }

  return (
    <Button 
      onClick={handleLogin} 
      disabled={isLoading}
      className="w-full h-12 text-base font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
          Redirigiendo...
        </>
      ) : (
        <>
          <LogIn className="mr-2 h-5 w-5" />
          Iniciar Sesión con Auth0
        </>
      )}
    </Button>
  )
}
