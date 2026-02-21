"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { type Language, type Translations, translations } from "./translations"

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translations
  formatString: (template: string, params: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextType | null>(null)

const STORAGE_KEY = "dartsLang"

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")
  const [isHydrated, setIsHydrated] = useState(false)

  // Initialize language from localStorage or browser preference
  useEffect(() => {
    const savedLang = localStorage.getItem(STORAGE_KEY) as Language | null
    if (savedLang && (savedLang === "en" || savedLang === "ru")) {
      setLanguageState(savedLang)
    } else {
      // Detect browser language
      const browserLang = navigator.language.split("-")[0]
      if (browserLang === "ru") {
        setLanguageState("ru")
      }
    }
    setIsHydrated(true)
  }, [])

  // Update HTML lang attribute when language changes
  useEffect(() => {
    if (isHydrated) {
      document.documentElement.setAttribute("lang", language)
    }
  }, [language, isHydrated])

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem(STORAGE_KEY, lang)
  }, [])

  const formatString = useCallback(
    (template: string, params: Record<string, string | number>) => {
      let result = template
      Object.entries(params).forEach(([key, value]) => {
        result = result.replace(`{${key}}`, String(value))
      })
      return result
    },
    []
  )

  const value: I18nContextType = {
    language,
    setLanguage,
    t: translations[language],
    formatString,
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}
