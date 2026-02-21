"use client"

import { type Player, type FinishMode, type TotalLegs, CHECKOUT_MAP, getSimpleFinishSuggestion } from "@/lib/game-types"
import { useI18n } from "@/lib/i18n/context"
import { Card, CardContent } from "@/components/ui/card"
import { User, History } from "lucide-react"

interface PlayerCardProps {
  player: Player
  isActive: boolean
  position: number
  finishMode: FinishMode
  totalLegs: TotalLegs
}

export function PlayerCard({ player, isActive, position, finishMode, totalLegs }: PlayerCardProps) {
  const { t } = useI18n()
  const isMultiLeg = totalLegs > 1
  
  const getCheckout = (): string | null => {
    if (player.currentScore < 1) return null
    if (finishMode === "simple") {
      return getSimpleFinishSuggestion(player.currentScore)
    }
    if (player.currentScore > 170) return null
    return CHECKOUT_MAP[player.currentScore] || null
  }
  
  const checkout = getCheckout()
  const lastTurn = player.history[player.history.length - 1]

  return (
    <Card
      className={`transition-all duration-300 ${
        isActive
          ? "ring-2 ring-primary bg-card border-primary shadow-md shadow-primary/10"
          : "bg-card/50 border-border opacity-75"
      }`}
    >
      <CardContent className="px-2.5 py-2">
        <div className="flex items-center justify-between gap-2">
          {/* Player Info */}
          <div className="flex items-center gap-1.5 min-w-0">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
              }`}
            >
              {position}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <User className="w-3 h-3 text-muted-foreground shrink-0" />
                <span className="font-medium text-foreground truncate text-sm">{player.name}</span>
                {isActive && <span className="text-[9px] text-primary font-medium">{t.nowThrowing}</span>}
              </div>
              <div className="flex items-center gap-1.5">
                {isMultiLeg && (
                  <span className="text-[9px] text-accent font-medium">
                    {t.legsWonLabel}: {player.legsWon}/{totalLegs}
                  </span>
                )}
                {lastTurn && (
                  <span
                    className={`text-[10px] flex items-center gap-0.5 ${
                      lastTurn.wasBust ? "text-destructive" : "text-muted-foreground"
                    }`}
                  >
                    <History className="w-2.5 h-2.5 shrink-0" />
                    {lastTurn.darts.join(",")}={lastTurn.wasBust ? t.bust : `-${lastTurn.total}`}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Score Display */}
          <div className="text-right shrink-0">
            <div
              className={`text-2xl font-bold tabular-nums leading-none ${
                isActive ? "text-foreground" : "text-foreground/70"
              }`}
            >
              {player.currentScore}
            </div>
            {checkout && <div className="text-[9px] text-accent font-medium mt-0.5">{checkout}</div>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
