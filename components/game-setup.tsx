"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { GameType, Player, FinishMode, TotalLegs } from "@/lib/game-types"
import { useI18n } from "@/lib/i18n/context"
import { LanguageSwitcher } from "@/components/language-switcher"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Target, Plus, Trash2, Users, Play, GripVertical, CircleDot, Circle, HelpCircle } from "lucide-react"

const MAX_NAME_LENGTH = 10

interface GameSetupProps {
  onStartGame: (players: Player[], gameType: GameType, finishMode: FinishMode, totalLegs: TotalLegs) => void
}

export function GameSetup({ onStartGame }: GameSetupProps) {
  const { t, formatString } = useI18n()
  const [gameType, setGameType] = useState<GameType>(501)
  const [finishMode, setFinishMode] = useState<FinishMode>("double")
  const [totalLegs, setTotalLegs] = useState<TotalLegs>(1)
  const [playerNames, setPlayerNames] = useState<string[]>([
    formatString(t.playerPlaceholder, { num: 1 }),
    formatString(t.playerPlaceholder, { num: 2 }),
  ])
  const [newPlayerName, setNewPlayerName] = useState("")

  const legsOptions: TotalLegs[] = [1, 3, 5, 7, 9]
  const legsToWin = Math.ceil(totalLegs / 2)

  const addPlayer = () => {
    if (playerNames.length >= 10) return
    const name = newPlayerName.trim() || formatString(t.playerPlaceholder, { num: playerNames.length + 1 })
    setPlayerNames([...playerNames, name])
    setNewPlayerName("")
  }

  const removePlayer = (index: number) => {
    if (playerNames.length <= 2) return
    setPlayerNames(playerNames.filter((_, i) => i !== index))
  }

  const updatePlayerName = (index: number, name: string) => {
    if (name.length > MAX_NAME_LENGTH) return
    const updated = [...playerNames]
    updated[index] = name
    setPlayerNames(updated)
  }

  const handleStartGame = () => {
    const players: Player[] = playerNames.map((name, index) => ({
      id: `player-${index}-${Date.now()}`,
      name: name.trim() || formatString(t.playerPlaceholder, { num: index + 1 }),
      startingScore: gameType,
      currentScore: gameType,
      history: [],
      legsWon: 0,
    }))
    onStartGame(players, gameType, finishMode, totalLegs)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-card border-border relative">
        {/* Language Switcher + Help */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground h-8 w-8"
                aria-label={t.helpTitle}
              >
                <HelpCircle className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-md max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-foreground flex items-center gap-2 text-base">
                  <HelpCircle className="w-4 h-4 text-primary" />
                  {t.helpTitle}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <section className="rounded-lg bg-secondary/50 p-3 border-l-2 border-primary">
                  <h4 className="font-semibold text-foreground mb-1">{t.helpSetupTitle}</h4>
                  <p className="text-muted-foreground leading-relaxed">{t.helpSetupDesc}</p>
                </section>
                <section className="rounded-lg bg-secondary/50 p-3 border-l-2 border-primary">
                  <h4 className="font-semibold text-foreground mb-1">{t.helpRulesTitle}</h4>
                  <div className="space-y-1.5 text-muted-foreground leading-relaxed">
                    <p>{t.helpSimpleRuleDesc}</p>
                    <p>{t.helpDoubleRuleDesc}</p>
                    <p>{t.helpBustDesc}</p>
                  </div>
                </section>
                <section className="rounded-lg bg-secondary/50 p-3 border-l-2 border-primary">
                  <h4 className="font-semibold text-foreground mb-1">{t.helpInputTitle}</h4>
                  <p className="text-muted-foreground leading-relaxed">{t.helpInputDesc}</p>
                </section>
                {/* Dartboard Scoring Guide */}
                <section className="rounded-lg bg-secondary/50 p-3 border-l-2 border-primary">
                  <h4 className="font-semibold text-foreground mb-2">{t.helpScoringGuideTitle}</h4>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: "#f5f0e1" }} />
                      <span className="text-muted-foreground text-xs">{t.helpSingleZone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: "#1e8449" }} />
                      <span className="text-muted-foreground text-xs">{t.helpDoubleZone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: "#c0392b" }} />
                      <span className="text-muted-foreground text-xs">{t.helpTripleZone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: "#1e8449" }} />
                      <span className="text-muted-foreground text-xs">{t.helpBullZone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: "#c0392b" }} />
                      <span className="text-muted-foreground text-xs">{t.helpBullseyeZone}</span>
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-border/50">
                    <p className="font-medium text-foreground text-xs mb-1">{t.helpExamplesTitle}</p>
                    <div className="space-y-0.5 text-muted-foreground text-xs">
                      <p>{t.helpExample1}</p>
                      <p>{t.helpExample2}</p>
                      <p>{t.helpExample3}</p>
                      <p>{t.helpExample4}</p>
                    </div>
                  </div>
                </section>
                <section className="rounded-lg bg-secondary/50 p-3 border-l-2 border-primary">
                  <h4 className="font-semibold text-foreground mb-1">{t.helpStatsTitle}</h4>
                  <p className="text-muted-foreground leading-relaxed">{t.helpStatsDesc}</p>
                </section>
              </div>
            </DialogContent>
          </Dialog>
          <LanguageSwitcher />
        </div>

        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Target className="w-10 h-10 text-primary" />
            <CardTitle className="text-3xl font-bold text-foreground">{t.appTitle}</CardTitle>
          </div>
          <p className="text-muted-foreground">{t.appSubtitle}</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Game Type Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Target className="w-4 h-4" />
              {t.gameType}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={gameType === 301 ? "default" : "secondary"}
                className={`h-16 text-2xl font-bold ${
                  gameType === 301
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
                onClick={() => setGameType(301)}
              >
                301
              </Button>
              <Button
                type="button"
                variant={gameType === 501 ? "default" : "secondary"}
                className={`h-16 text-2xl font-bold ${
                  gameType === 501
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
                onClick={() => setGameType(501)}
              >
                501
              </Button>
            </div>
          </div>

          {/* Number of Legs Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Target className="w-4 h-4" />
              {t.numberOfLegs}
            </label>
            <div className="grid grid-cols-5 gap-2">
              {legsOptions.map((legs) => (
                <Button
                  key={legs}
                  type="button"
                  variant={totalLegs === legs ? "default" : "secondary"}
                  className={`h-12 text-lg font-bold ${
                    totalLegs === legs
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                  onClick={() => setTotalLegs(legs)}
                >
                  {legs}
                </Button>
              ))}
            </div>
            {totalLegs > 1 && (
              <p className="text-xs text-muted-foreground text-center">
                {formatString(t.legsHint, { count: legsToWin })}
              </p>
            )}
          </div>

          {/* Finish Mode Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <CircleDot className="w-4 h-4" />
              {t.finishMode}
            </label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setFinishMode("simple")}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  finishMode === "simple"
                    ? "border-primary bg-primary/10"
                    : "border-border bg-secondary/30 hover:border-muted-foreground/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${finishMode === "simple" ? "text-primary" : "text-muted-foreground"}`}>
                    {finishMode === "simple" ? (
                      <CircleDot className="w-5 h-5" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${finishMode === "simple" ? "text-foreground" : "text-muted-foreground"}`}>
                      {t.finishSimple}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {t.finishSimpleDesc}
                    </div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFinishMode("double")}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  finishMode === "double"
                    ? "border-primary bg-primary/10"
                    : "border-border bg-secondary/30 hover:border-muted-foreground/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${finishMode === "double" ? "text-primary" : "text-muted-foreground"}`}>
                    {finishMode === "double" ? (
                      <CircleDot className="w-5 h-5" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${finishMode === "double" ? "text-foreground" : "text-muted-foreground"}`}>
                      {t.finishDouble}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {t.finishDoubleDesc}
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Player List */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              {formatString(t.playersCount, { count: playerNames.length })}
            </label>
            <div className="space-y-2">
              {playerNames.map((name, index) => (
                <div key={index} className="flex items-center gap-2 bg-secondary/50 rounded-lg p-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground w-6">#{index + 1}</span>
                  <div className="flex-1 relative">
                    <Input
                      value={name}
                      onChange={(e) => updatePlayerName(index, e.target.value)}
                      maxLength={MAX_NAME_LENGTH}
                      className="bg-input border-border text-foreground pr-9"
                      placeholder={formatString(t.playerPlaceholder, { num: index + 1 })}
                    />
                    <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] tabular-nums pointer-events-none ${
                      name.length >= MAX_NAME_LENGTH ? "text-destructive" : "text-muted-foreground/50"
                    }`}>
                      {name.length}/{MAX_NAME_LENGTH}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removePlayer(index)}
                    disabled={playerNames.length <= 2}
                    className="text-muted-foreground hover:text-destructive disabled:opacity-30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Add Player */}
            {playerNames.length < 10 && (
              <div className="flex gap-2">
                <Input
                  value={newPlayerName}
                  onChange={(e) => { if (e.target.value.length <= MAX_NAME_LENGTH) setNewPlayerName(e.target.value) }}
                  maxLength={MAX_NAME_LENGTH}
                  placeholder={formatString(t.playerPlaceholder, { num: playerNames.length + 1 })}
                  className="flex-1 bg-input border-border text-foreground"
                  onKeyDown={(e) => e.key === "Enter" && addPlayer()}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addPlayer}
                  className="bg-secondary text-secondary-foreground"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {t.add}
                </Button>
              </div>
            )}
          </div>

          {/* Start Game Button */}
          <Button
            onClick={handleStartGame}
            className="w-full h-14 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={playerNames.length < 2}
          >
            <Play className="w-5 h-5 mr-2" />
            {totalLegs > 1 ? t.startMatch : t.startGame}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
