"use client"

import type { Player, FinishMode, GameType, TotalLegs } from "@/lib/game-types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useI18n } from "@/lib/i18n/context"
import { LanguageSwitcher } from "./language-switcher"
import { GameStatistics } from "./game-statistics"
import { Trophy, ArrowRight, Home } from "lucide-react"

interface LegTransitionProps {
  legWinner: Player
  players: Player[]
  currentLeg: number
  totalLegs: TotalLegs
  gameType: GameType
  finishMode: FinishMode
  onNextLeg: () => void
  onNewGame: () => void
}

export function LegTransition({ 
  legWinner, 
  players, 
  currentLeg, 
  totalLegs,
  gameType,
  finishMode,
  onNextLeg, 
  onNewGame,
}: LegTransitionProps) {
  const { t, formatString } = useI18n()
  const legsToWin = Math.ceil(totalLegs / 2)

  return (
    <div className="w-full bg-background flex items-center justify-center p-3 relative">
      {/* Language Switcher */}
      <div className="absolute top-3 right-3 z-10">
        <LanguageSwitcher />
      </div>

      <Card className="w-full max-w-sm bg-card border-border text-center">
        <CardContent className="pt-6 pb-4 space-y-4">
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
              <Trophy className="w-7 h-7 text-primary" />
            </div>
          </div>

          <div>
            <h1 className="text-xl font-bold text-foreground mb-1">{t.legWinner}</h1>
            <p className="text-lg text-primary font-medium">
              {formatString(t.wonLegMessage, { player: legWinner.name, leg: currentLeg })}
            </p>
          </div>

          {/* Scoreboard */}
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="grid grid-cols-3 bg-secondary/50 text-xs font-medium text-muted-foreground px-3 py-2">
              <span className="text-left">{t.playerName}</span>
              <span className="text-center">{t.legsHeader}</span>
              <span className="text-right">{formatString(t.firstTo, { count: legsToWin })}</span>
            </div>
            {players.map((player) => (
              <div 
                key={player.id} 
                className={`grid grid-cols-3 px-3 py-2.5 border-t border-border/50 items-center ${
                  player.id === legWinner.id ? "bg-primary/10" : ""
                }`}
              >
                <span className="text-left text-sm text-foreground truncate">{player.name}</span>
                <span className="text-center text-lg font-bold text-foreground">{player.legsWon}</span>
                <div className="flex justify-end gap-1">
                  {Array.from({ length: legsToWin }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-3 h-3 rounded-full ${
                        i < player.legsWon ? "bg-primary" : "bg-secondary"
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Statistics Button */}
          <GameStatistics
            players={players}
            gameType={gameType}
            finishMode={finishMode}
            winner={legWinner}
            totalLegs={totalLegs}
            currentLeg={currentLeg}
          />

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button variant="secondary" className="h-10 bg-secondary text-secondary-foreground text-sm" onClick={onNewGame}>
              <Home className="w-3.5 h-3.5 mr-1.5" />
              {t.newGame}
            </Button>
            <Button className="h-10 bg-primary text-primary-foreground text-sm" onClick={onNextLeg}>
              <ArrowRight className="w-3.5 h-3.5 mr-1.5" />
              {t.nextLeg}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
