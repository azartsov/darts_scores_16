"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DartInput, DartState, FinishMode } from "@/lib/game-types"
import { CHECKOUT_MAP, getSimpleFinishSuggestion } from "@/lib/game-types"
import { useI18n } from "@/lib/i18n/context"
import { InteractiveDartboard } from "./interactive-dartboard"
import { Target, Send, RotateCcw, TrendingDown, Trophy, AlertTriangle, X, Grid3X3, CircleDot } from "lucide-react"

type InputMode = "buttons" | "dartboard"

interface ScoringInputProps {
  playerName: string
  currentScore: number
  finishMode: FinishMode
  onSubmitTurn: (darts: [number, number, number], dartDetails: [DartInput, DartInput, DartInput]) => void
}

const HIGH_VALUES = [20, 19, 18, 17, 16, 15]
const LOW_VALUES = [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
const SPECIAL_VALUES = [25, 50, 0]

const createEmptyDart = (): DartInput => ({ value: null, multiplier: 1, state: "empty" })

export function ScoringInput({ playerName, currentScore, finishMode, onSubmitTurn }: ScoringInputProps) {
  const { t, formatString } = useI18n()
  const [darts, setDarts] = useState<[DartInput, DartInput, DartInput]>([
    createEmptyDart(),
    createEmptyDart(),
    createEmptyDart(),
  ])
  const [activeDart, setActiveDart] = useState<0 | 1 | 2>(0)
  const [inputMode, setInputMode] = useState<InputMode>("buttons")

  // Load saved input mode preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem("dartsInputMode")
      if (saved === "dartboard" || saved === "buttons") {
        setInputMode(saved)
      }
    } catch {
      // localStorage not available
    }
  }, [])

  const toggleInputMode = () => {
    const newMode: InputMode = inputMode === "buttons" ? "dartboard" : "buttons"
    setInputMode(newMode)
    try {
      localStorage.setItem("dartsInputMode", newMode)
    } catch {
      // localStorage not available
    }
  }

  // Track last tap time for double-tap detection on dart cards
  const lastTapTime = useRef<{ [key: number]: number }>({ 0: 0, 1: 0, 2: 0 })
  const DOUBLE_TAP_DELAY = 300

  const specialLabels: Record<number, string> = {
    25: t.bull,
    50: t.bullseye,
    0: t.miss,
  }

  const calculateDartScore = (dart: DartInput): number => {
    if (dart.value === null || dart.value === 0) return 0
    if (dart.value === 25) return dart.multiplier === 2 ? 50 : 25
    if (dart.value === 50) return 50
    return dart.value * dart.multiplier
  }

  // Shared handler for both button and dartboard input
  const handleDartInput = useCallback((value: number, multiplier: 1 | 2 | 3 = 1) => {
    setDarts(prev => {
      const newDarts = [...prev] as [DartInput, DartInput, DartInput]
      let state: DartState
      let finalMultiplier = multiplier

      if (value === 0) {
        state = "miss"
        finalMultiplier = 1
      } else {
        state = "scored"
        if (value === 50) finalMultiplier = 1
        else if (value === 25 && finalMultiplier === 3) finalMultiplier = 2
      }

      newDarts[activeDart] = { value, multiplier: finalMultiplier as 1 | 2 | 3, state }
      return newDarts
    })

    // Auto-advance to next empty dart
    setActiveDart(prev => {
      if (prev < 2) return (prev + 1) as 0 | 1 | 2
      return prev
    })
  }, [activeDart])

  // Button mode: value click (uses current dart's existing multiplier for single values)
  const handleValueClick = (value: number) => {
    const currentMultiplier = darts[activeDart].multiplier
    let state: DartState
    let multiplier = currentMultiplier

    if (value === 0) {
      state = "miss"
      multiplier = 1
    } else {
      state = "scored"
      if (value === 50) multiplier = 1
      else if (value === 25 && multiplier === 3) multiplier = 2
    }

    const newDarts = [...darts] as [DartInput, DartInput, DartInput]
    newDarts[activeDart] = { value, multiplier, state }
    setDarts(newDarts)

    // Only auto-advance if next dart is empty
    if (activeDart < 2) {
      const nextDart = darts[activeDart + 1]
      if (nextDart.state === "empty") {
        setActiveDart((activeDart + 1) as 0 | 1 | 2)
      }
    }
  }

  // Dartboard mode: value + multiplier come from the board.
  // Respects activeDart so users can click a dart card, then pick a value on the board.
  const handleDartboardInput = useCallback((value: number, multiplier: 1 | 2 | 3) => {
    const state: DartState = value === 0 ? "miss" : "scored"

    setDarts(prev => {
      const newDarts = [...prev] as [DartInput, DartInput, DartInput]
      newDarts[activeDart] = { value, multiplier, state }
      return newDarts
    })

    // Auto-advance: move to next dart only if it's empty
    setActiveDart(prev => {
      if (prev < 2) {
        // Check the next dart in the *current* state (before this update).
        // Since setDarts runs first in the same tick, we read darts from the outer scope
        // which is the pre-update snapshot -- same approach as handleValueClick.
        const nextDart = darts[prev + 1]
        if (nextDart && nextDart.state === "empty") {
          return (prev + 1) as 0 | 1 | 2
        }
      }
      return prev
    })
  }, [activeDart, darts])

  const handleClearDart = (index: 0 | 1 | 2) => {
    const newDarts = [...darts] as [DartInput, DartInput, DartInput]
    newDarts[index] = createEmptyDart()
    setDarts(newDarts)
    setActiveDart(index)
  }

  const handleDartCardTap = useCallback((index: 0 | 1 | 2) => {
    const now = Date.now()
    const lastTap = lastTapTime.current[index] || 0
    const timeSinceLastTap = now - lastTap

    if (timeSinceLastTap < DOUBLE_TAP_DELAY && timeSinceLastTap > 0) {
      const newDarts = [...darts] as [DartInput, DartInput, DartInput]
      const currentDart = newDarts[index]
      if (currentDart.value === null || currentDart.value === 50 || currentDart.value === 0) {
        lastTapTime.current[index] = 0
        return
      }
      let nextMultiplier: 1 | 2 | 3
      if (currentDart.multiplier === 1) nextMultiplier = 2
      else if (currentDart.multiplier === 2) nextMultiplier = currentDart.value === 25 ? 1 : 3
      else nextMultiplier = 1
      newDarts[index] = { ...currentDart, multiplier: nextMultiplier }
      setDarts(newDarts)
      lastTapTime.current[index] = 0
    } else {
      setActiveDart(index)
      lastTapTime.current[index] = now
    }
  }, [darts])

  const allDartsFilled = darts.every(d => d.state !== "empty")
  const totalScore = darts.reduce((sum, dart) => sum + calculateDartScore(dart), 0)
  const projectedScore = currentScore - totalScore
  const isBust = finishMode === "simple" ? projectedScore < 0 : projectedScore < 0 || projectedScore === 1
  const isWinningProjection = projectedScore === 0
  const canSubmit = allDartsFilled || isWinningProjection

  const getCheckoutSuggestion = (score: number): string | null => {
    if (score < 1) return null
    if (finishMode === "simple") return getSimpleFinishSuggestion(score)
    if (score > 170) return null
    return CHECKOUT_MAP[score] || null
  }
  const checkoutSuggestion = getCheckoutSuggestion(projectedScore)
  const hasCheckout = projectedScore >= 1 && projectedScore <= 170 && checkoutSuggestion

  const handleSubmit = () => {
    if (!canSubmit) return
    const scores: [number, number, number] = [
      calculateDartScore(darts[0]),
      calculateDartScore(darts[1]),
      calculateDartScore(darts[2]),
    ]
    onSubmitTurn(scores, darts)
    setDarts([createEmptyDart(), createEmptyDart(), createEmptyDart()])
    setActiveDart(0)
  }

  const handleClear = () => {
    setDarts([createEmptyDart(), createEmptyDart(), createEmptyDart()])
    setActiveDart(0)
  }

  const formatDartDisplay = (dart: DartInput): string => {
    if (dart.state === "empty") return t.dartEmpty
    if (dart.state === "miss") return "0"
    if (dart.value === 50) return t.bull
    if (dart.value === 25) return dart.multiplier === 2 ? "D25" : "25"
    const prefix = dart.multiplier === 2 ? "D" : dart.multiplier === 3 ? "T" : ""
    return `${prefix}${dart.value}`
  }

  const getMultiplierShort = (mult: 1 | 2 | 3): string => `x${mult}`

  const getMultiplierColor = (mult: 1 | 2 | 3): string => {
    if (mult === 2) return "bg-sky-500/30 text-sky-400 border-sky-500/50"
    if (mult === 3) return "bg-orange-500/30 text-orange-400 border-orange-500/50"
    return "bg-secondary/50 text-muted-foreground border-border"
  }

  const getDartStateStyle = (dart: DartInput, isActive: boolean): string => {
    if (dart.state === "empty") {
      return isActive
        ? "bg-secondary border-dashed border-primary/50"
        : "bg-secondary/50 border-dashed border-border"
    }
    if (dart.state === "miss") {
      return isActive
        ? "bg-destructive/20 border-destructive text-destructive"
        : "bg-destructive/10 border-destructive/50 text-destructive/70"
    }
    return isActive
      ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-1 ring-offset-background"
      : "bg-primary/20 border-primary/50 text-primary"
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="py-2 px-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground text-base">
            <Target className="w-4 h-4 text-primary" />
            <span className="truncate">{formatString(t.playerTurn, { player: playerName })}</span>
          </CardTitle>

          {/* Input Mode Toggle */}
          <button
            type="button"
            onClick={toggleInputMode}
            className="flex items-center gap-0.5 h-7 px-1 rounded-full border border-border bg-secondary/50 hover:bg-secondary transition-colors"
            title={t.switchInputMode}
            aria-label={t.switchInputMode}
          >
            <span className={`flex items-center justify-center w-6 h-5 rounded-full text-xs transition-all ${
              inputMode === "buttons"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground"
            }`}>
              <Grid3X3 className="w-3.5 h-3.5" />
            </span>
            <span className={`flex items-center justify-center w-6 h-5 rounded-full text-xs transition-all ${
              inputMode === "dartboard"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground"
            }`}>
              <CircleDot className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-1.5 px-3 pb-3">
        {/* Projected Score Display - compact */}
        <div
          className={`px-2 py-1.5 rounded-lg border transition-all ${
            isWinningProjection
              ? "bg-primary/20 border-primary"
              : isBust
                ? "bg-destructive/20 border-destructive"
                : hasCheckout
                  ? "bg-amber-500/20 border-amber-500"
                  : "bg-secondary/50 border-border"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{t.projectedScore}</span>
              {isWinningProjection && (
                <span className="flex items-center gap-1 text-primary text-xs font-medium">
                  <Trophy className="w-3 h-3" />
                  {t.winningThrow}
                </span>
              )}
              {isBust && (
                <span className="flex items-center gap-1 text-destructive text-xs font-medium">
                  <AlertTriangle className="w-3 h-3" />
                  {t.bustScoreRevert}
                </span>
              )}
              {!isBust && !isWinningProjection && checkoutSuggestion && (
                <span className="text-xs">
                  <span className="text-muted-foreground">{t.finish}: </span>
                  <span className="text-amber-500 font-medium">{checkoutSuggestion}</span>
                </span>
              )}
            </div>
            <span className={`text-2xl font-bold ${
              isWinningProjection ? "text-primary" : isBust ? "text-destructive" : "text-foreground"
            }`}>
              {projectedScore}
            </span>
          </div>
        </div>

        {/* Dart Input Cards + Total in a single row */}
        <div className="flex items-stretch gap-1.5">
          {[0, 1, 2].map((index) => {
            const dart = darts[index]
            const isActive = activeDart === index
            const canChangeMultiplier = dart.state === "scored" && dart.value !== 50

            return (
              <div key={index} className="relative flex-1">
                <button
                  type="button"
                  onClick={() => handleDartCardTap(index as 0 | 1 | 2)}
                  className={`relative w-full px-1.5 py-1 rounded-lg text-center transition-all select-none border-2 ${getDartStateStyle(dart, isActive)}`}
                >
                  <div className={`text-[9px] leading-none ${isActive ? "opacity-90" : "opacity-60"}`}>
                    {t.dart} {index + 1}
                  </div>
                  <div className="text-base font-bold leading-tight">{formatDartDisplay(dart)}</div>
                  <div className={`text-[10px] font-medium leading-none ${isActive ? "opacity-90" : "opacity-60"}`}>
                    {calculateDartScore(dart)}
                  </div>
                  {canChangeMultiplier && (
                    <div className={`absolute -top-1 -right-1 px-1 py-0.5 text-[9px] font-bold rounded border ${getMultiplierColor(dart.multiplier)}`}>
                      {getMultiplierShort(dart.multiplier)}
                    </div>
                  )}
                </button>
                {dart.state !== "empty" && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleClearDart(index as 0 | 1 | 2) }}
                    className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-secondary border border-border rounded-full flex items-center justify-center hover:bg-destructive/20 hover:border-destructive/50 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )
          })}
          {/* Total inline */}
          <div className="flex flex-col items-center justify-center px-2 bg-secondary/50 rounded-lg min-w-[52px]">
            <span className="text-[9px] text-muted-foreground leading-none">{t.total}</span>
            <span className="text-lg font-bold text-foreground leading-tight">{totalScore}</span>
          </div>
        </div>

        {/* === INPUT AREA: Button mode or Dartboard mode === */}
        {inputMode === "buttons" ? (
          <>
            {/* High Value Buttons (15-20) */}
            <div className="grid grid-cols-6 gap-1">
              {HIGH_VALUES.map((value) => (
                <Button
                  key={value}
                  variant="secondary"
                  className="h-8 text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 px-0"
                  onClick={() => handleValueClick(value)}
                >
                  {value}
                </Button>
              ))}
            </div>

            {/* Low Value Buttons (1-14) */}
            <div className="grid grid-cols-7 gap-1">
              {LOW_VALUES.map((value) => (
                <Button
                  key={value}
                  variant="secondary"
                  className="h-7 text-xs font-medium bg-secondary/70 text-secondary-foreground hover:bg-secondary/50 px-0"
                  onClick={() => handleValueClick(value)}
                >
                  {value}
                </Button>
              ))}
            </div>

            {/* Special Buttons (Bull, Bullseye, Miss) */}
            <div className="grid grid-cols-3 gap-1">
              {SPECIAL_VALUES.map((value) => (
                <Button
                  key={value}
                  variant="secondary"
                  className={`h-8 text-sm font-medium ${
                    value === 0
                      ? "bg-destructive/20 text-destructive hover:bg-destructive/30"
                      : "bg-amber-500/20 text-amber-500 hover:bg-amber-500/30"
                  }`}
                  onClick={() => handleValueClick(value)}
                >
                  {specialLabels[value]}
                </Button>
              ))}
            </div>
          </>
        ) : (
          /* Dartboard Mode — enhanced visual dartboard on all devices */
          <InteractiveDartboard onDartSelected={handleDartboardInput} />
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-1.5">
          <Button
            variant="secondary"
            className="h-9 bg-secondary text-secondary-foreground text-sm"
            onClick={handleClear}
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            {t.clear}
          </Button>
          <Button
            className={`h-9 text-sm ${
              canSubmit
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            <Send className="w-3.5 h-3.5 mr-1.5" />
            {canSubmit ? t.submitTurn : t.fillAllDarts}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
