"use client"

import { useI18n } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"

const FLAGS: Record<string, string> = {
  en: "🇺🇸",
  ru: "🇷🇺",
}

export function LanguageSwitcher() {
  const { language, setLanguage } = useI18n()

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ru" : "en")
  }

  const nextLanguage = language === "en" ? "Russian" : "English"

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-secondary/80 border border-border rounded-full"
      aria-label={`Switch to ${nextLanguage}`}
      title={`Switch to ${nextLanguage}`}
    >
      <span className="text-sm leading-none">{FLAGS[language]}</span>
    </Button>
  )
}
