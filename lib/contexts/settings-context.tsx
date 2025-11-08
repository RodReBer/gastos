"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import useSWR from "swr"
import { fetcher } from "@/lib/utils/fetcher"

interface SettingsContextType {
  language: string
  currency: string
  setLanguage: (lang: string) => Promise<void>
  setCurrency: (curr: string) => Promise<void>
  isLoading: boolean
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { data: settings, mutate, isLoading } = useSWR("/api/user/settings", fetcher)
  const [language, setLanguageState] = useState("es")
  const [currency, setCurrencyState] = useState("UYU")

  useEffect(() => {
    if (settings) {
      setLanguageState(settings.language || "es")
      setCurrencyState(settings.currency || "UYU")
    }
  }, [settings])

  const setLanguage = async (lang: string) => {
    setLanguageState(lang)
    try {
      await fetch("/api/user/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: lang, currency }),
      })
      mutate()
    } catch (error) {
      console.error("Error updating language:", error)
    }
  }

  const setCurrency = async (curr: string) => {
    setCurrencyState(curr)
    try {
      await fetch("/api/user/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, currency: curr }),
      })
      mutate()
    } catch (error) {
      console.error("Error updating currency:", error)
    }
  }

  return (
    <SettingsContext.Provider
      value={{ language, currency, setLanguage, setCurrency, isLoading }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
