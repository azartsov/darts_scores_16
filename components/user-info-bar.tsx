"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useI18n } from "@/lib/i18n/context"
import { BarChart3, LogOut, User } from "lucide-react"
import { StatsModal } from "./stats-modal"

export function UserInfoBar() {
  const { user, isGuest, signOut } = useAuth()
  const { t } = useI18n()
  const [showStats, setShowStats] = useState(false)

  if (!user && !isGuest) return null

  const displayName = user?.email?.split("@")[0] || t.guest
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <>
      <div className="flex items-center justify-between px-3 py-1.5 bg-card/80 border-b border-border/50 min-h-[40px]">
        <div className="flex items-center gap-2 min-w-0">
          {/* Avatar */}
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            {user ? (
              <span className="text-[11px] font-bold text-primary">{initial}</span>
            ) : (
              <User className="w-3 h-3 text-muted-foreground" />
            )}
          </div>
          {/* Username */}
          <span className="text-xs text-foreground truncate max-w-[120px]">
            {isGuest ? t.guest : displayName}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* My Stats button -- only for logged-in users */}
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowStats(true)}
              className="text-muted-foreground hover:text-foreground h-7 gap-1 px-2 bg-transparent"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="text-[11px]">{t.myStats}</span>
            </Button>
          )}
          {/* Logout */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut()}
            className="text-muted-foreground hover:text-destructive h-7 w-7 bg-transparent shrink-0"
            aria-label={t.logout}
          >
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Stats Modal */}
      {showStats && user && (
        <StatsModal userId={user.uid} onClose={() => setShowStats(false)} />
      )}
    </>
  )
}
