"use client"

import { useState, useCallback } from "react"
import { useI18n } from "@/lib/i18n/context"

interface MobileDartboardProps {
  onDartSelected: (value: number, multiplier: 1 | 2 | 3) => void
}

// Dartboard order: numbers arranged in standard dartboard sequence (clockwise from top)
const NUMBER_ROWS = [
  [20, 1, 18, 4, 13],
  [6, 10, 15, 2, 17],
  [3, 19, 7, 16, 8],
  [11, 14, 9, 12, 5],
]

type Multiplier = 1 | 2 | 3

export function MobileDartboard({ onDartSelected }: MobileDartboardProps) {
  const { t } = useI18n()
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null)
  const [selectedMultiplier, setSelectedMultiplier] = useState<Multiplier>(1)
  const [lastSubmitted, setLastSubmitted] = useState<string | null>(null)

  const submit = useCallback(
    (value: number, mult: Multiplier) => {
      onDartSelected(value, mult)
      const score = value === 25 || value === 50 ? value : value * mult
      const prefix = mult === 2 ? "D" : mult === 3 ? "T" : ""
      setLastSubmitted(
        value === 0
          ? t.miss
          : value === 25
            ? t.bull
            : value === 50
              ? t.bullseye
              : `${prefix}${value} = ${score}`,
      )
      setSelectedNumber(null)
      setSelectedMultiplier(1)
      setTimeout(() => setLastSubmitted(null), 1200)
    },
    [onDartSelected, t],
  )

  const handleNumberTap = (num: number) => {
    // If the same number is tapped again while already selected, submit it
    if (selectedNumber === num) {
      submit(num, selectedMultiplier)
      return
    }
    setSelectedNumber(num)
  }

  const handleMultiplierTap = (mult: Multiplier) => {
    setSelectedMultiplier(mult)
    // If a number is already selected, submit immediately
    if (selectedNumber !== null) {
      submit(selectedNumber, mult)
    }
  }

  const handleBull = () => submit(25, 1)
  const handleBullseye = () => submit(50, 1)
  const handleMiss = () => submit(0, 1)

  const getMultiplierStyle = (mult: Multiplier) => {
    const isActive = selectedMultiplier === mult
    if (mult === 1)
      return isActive
        ? "bg-secondary ring-2 ring-foreground/40 text-foreground"
        : "bg-secondary/50 text-muted-foreground"
    if (mult === 2)
      return isActive
        ? "bg-sky-600 ring-2 ring-sky-400/50 text-white"
        : "bg-sky-600/20 text-sky-400"
    return isActive
      ? "bg-orange-600 ring-2 ring-orange-400/50 text-white"
      : "bg-orange-600/20 text-orange-400"
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Feedback flash */}
      <div className="h-5 flex items-center justify-center">
        {lastSubmitted ? (
          <span className="text-sm font-bold text-primary animate-in fade-in zoom-in-95 duration-200">
            {lastSubmitted}
          </span>
        ) : selectedNumber !== null ? (
          <span className="text-xs text-muted-foreground">
            {selectedNumber} x {selectedMultiplier} ={" "}
            <span className="text-foreground font-semibold">
              {selectedNumber * selectedMultiplier}
            </span>
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">{t.tapToSelect}</span>
        )}
      </div>

      {/* Number grid: 4 rows x 5 columns */}
      <div className="flex flex-col gap-1.5">
        {NUMBER_ROWS.map((row, rowIdx) => (
          <div key={rowIdx} className="grid grid-cols-5 gap-1.5">
            {row.map((num) => {
              const isSelected = selectedNumber === num
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleNumberTap(num)}
                  className={`flex items-center justify-center rounded-lg text-base font-bold transition-all select-none active:scale-95 h-11 ${
                    isSelected
                      ? "bg-primary text-primary-foreground ring-2 ring-primary/50 scale-[1.02]"
                      : "bg-secondary/70 text-secondary-foreground hover:bg-secondary"
                  }`}
                >
                  {num}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* Multiplier row */}
      <div className="grid grid-cols-3 gap-1.5">
        {([1, 2, 3] as Multiplier[]).map((mult) => (
          <button
            key={mult}
            type="button"
            onClick={() => handleMultiplierTap(mult)}
            className={`flex flex-col items-center justify-center rounded-lg h-10 font-semibold transition-all select-none active:scale-95 ${getMultiplierStyle(mult)}`}
          >
            <span className="text-sm leading-none">
              {mult === 1 ? t.single : mult === 2 ? t.double : t.triple}
            </span>
          </button>
        ))}
      </div>

      {/* Bull / Bullseye / Miss row */}
      <div className="grid grid-cols-3 gap-1.5">
        <button
          type="button"
          onClick={handleBull}
          className="flex flex-col items-center justify-center rounded-lg h-10 bg-emerald-700/30 text-emerald-400 font-semibold transition-all select-none active:scale-95 hover:bg-emerald-700/40"
        >
          <span className="text-sm leading-none">{t.bull}</span>
          <span className="text-[10px] opacity-70 leading-none mt-0.5">25</span>
        </button>
        <button
          type="button"
          onClick={handleBullseye}
          className="flex flex-col items-center justify-center rounded-lg h-10 bg-red-700/30 text-red-400 font-semibold transition-all select-none active:scale-95 hover:bg-red-700/40"
        >
          <span className="text-sm leading-none">{t.bullseye}</span>
          <span className="text-[10px] opacity-70 leading-none mt-0.5">50</span>
        </button>
        <button
          type="button"
          onClick={handleMiss}
          className="flex flex-col items-center justify-center rounded-lg h-10 bg-destructive/20 text-destructive font-semibold transition-all select-none active:scale-95 hover:bg-destructive/30"
        >
          <span className="text-sm leading-none">{t.miss}</span>
          <span className="text-[10px] opacity-70 leading-none mt-0.5">0</span>
        </button>
      </div>
    </div>
  )
}
