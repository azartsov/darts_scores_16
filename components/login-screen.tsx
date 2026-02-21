"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { useI18n } from "@/lib/i18n/context"
import { Target, LogIn, UserPlus, Loader2 } from "lucide-react"

export function LoginScreen() {
  const { signIn, signUp, enterGuestMode, error, clearError } = useAuth()
  const { t } = useI18n()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return
    setBusy(true)
    clearError()
    try {
      if (mode === "signin") {
        await signIn(email.trim(), password)
      } else {
        await signUp(email.trim(), password)
      }
    } catch {
      // error is set in auth context
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-card border-border">
        <CardHeader className="text-center space-y-3 pb-4">
          <div className="flex items-center justify-center gap-2.5">
            <Target className="w-8 h-8 text-primary" />
            <CardTitle className="text-2xl font-bold text-foreground">{t.appTitle}</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">{t.loginSubtitle}</p>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              type="email"
              placeholder={t.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-input border-border text-foreground h-11"
              autoComplete="email"
            />
            <Input
              type="password"
              placeholder={t.passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-input border-border text-foreground h-11"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />

            {error && (
              <p className="text-xs text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
            )}

            <Button
              type="submit"
              disabled={busy || !email.trim() || !password.trim()}
              className="w-full h-11 bg-primary text-primary-foreground font-medium"
            >
              {busy ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{mode === "signin" ? t.signingIn : t.signingUp}</>
              ) : mode === "signin" ? (
                <><LogIn className="w-4 h-4 mr-2" />{t.signIn}</>
              ) : (
                <><UserPlus className="w-4 h-4 mr-2" />{t.signUp}</>
              )}
            </Button>
          </form>

          {/* Toggle sign-in / sign-up */}
          <button
            type="button"
            onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); clearError() }}
            className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            {mode === "signin" ? t.noAccountYet : t.alreadyHaveAccount}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">{t.orContinueAsGuest}</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <Button
            variant="secondary"
            onClick={enterGuestMode}
            className="w-full h-10 bg-secondary text-secondary-foreground text-sm"
          >
            {t.playAsGuest}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
