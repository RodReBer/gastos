// i18n Helper - SOLID Open/Closed Principle
import { translations } from "@/lib/constants/i18n"

export type Language = "en" | "es"

export function t(key: string, lang: Language = "en"): string {
  const keys = key.split(".")
  let value: any = translations[lang]

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k]
    } else {
      return key // Fallback to key if translation not found
    }
  }

  return typeof value === "string" ? value : key
}
