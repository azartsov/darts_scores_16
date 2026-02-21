"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { GameSetup } from "@/components/game-setup"
import { GameBoard } from "@/components/game-board"
import { VictoryScreen } from "@/components/victory-screen"
import { LegTransition } from "@/components/leg-transition"
import { LoginScreen } from "@/components/login-screen"
import { UserInfoBar } from "@/components/user-info-bar"
import type { GameState, Player, GameType, TurnHistory, DartInput, FinishMode, TotalLegs } from "@/lib/game-types"
import { saveGameState, loadGameState, clearGameState } from "@/lib/game-storage"
import { useAuth } from "@/lib/auth-context"
import { saveGameToFirestore } from "@/lib/game-firestore"
import { useI18n } from "@/lib/i18n/context"

const initialGameState: GameState = {
  phase: "setup",
  gameType: 501,
  finishMode: "double",
  totalLegs: 1,
  currentLeg: 1,
  players: [],
  activePlayerIndex: 0,
  winner: null,
  legWinner: null,
  startTime: Date.now(),
}

export default function DartMasterPro() {
  const { user, isGuest, loading: authLoading } = useAuth()
  const { t } = useI18n()
  const [gameState, setGameState] = useState<GameState>(initialGameState)
  const [undoStack, setUndoStack] = useState<GameState[]>([])
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const savedGameRef = useRef(false)

  // Show login screen if not authenticated and not guest
  const isAuthenticated = !!user || isGuest

  // Load game state from session storage on mount
  useEffect(() => {
    const saved = loadGameState()
    if (saved) {
      if (!saved.finishMode) {
        saved.finishMode = "double"
      }
      if (!saved.totalLegs) {
        saved.totalLegs = 1
      }
      if (!saved.currentLeg) {
        saved.currentLeg = 1
      }
      if (!saved.startTime) {
        saved.startTime = Date.now()
      }
      // Ensure players have legsWon
      saved.players = saved.players.map(p => ({
        ...p,
        legsWon: p.legsWon ?? 0,
      }))
      setGameState(saved)
    }
  }, [])

  // Save game state whenever it changes
  useEffect(() => {
    if (gameState.phase !== "setup") {
      saveGameState(gameState)
    }
  }, [gameState])

  // Auto-save to Firestore when game finishes (logged-in users only)
  useEffect(() => {
    if (gameState.phase === "finished" && user && !savedGameRef.current) {
      savedGameRef.current = true
      setSaveStatus("saving")
      saveGameToFirestore(
        user.uid,
        gameState.players,
        gameState.gameType,
        gameState.finishMode,
        gameState.totalLegs,
      )
        .then(() => setSaveStatus("saved"))
        .catch(() => setSaveStatus("error"))
    }
  }, [gameState.phase, gameState.players, gameState.gameType, gameState.finishMode, gameState.totalLegs, user])

  const handleStartGame = useCallback((players: Player[], gameType: GameType, finishMode: FinishMode, totalLegs: TotalLegs) => {
    savedGameRef.current = false
    setSaveStatus("idle")
    const newState: GameState = {
      phase: "playing",
      gameType,
      finishMode,
      totalLegs,
      currentLeg: 1,
      players,
      activePlayerIndex: 0,
      winner: null,
      legWinner: null,
      startTime: Date.now(),
    }
    setGameState(newState)
    setUndoStack([])
  }, [])

  const handleSubmitTurn = useCallback((darts: [number, number, number], dartDetails: [DartInput, DartInput, DartInput]) => {
    setGameState((prev) => {
      setUndoStack((stack) => [...stack.slice(-9), prev])

      const activePlayer = prev.players[prev.activePlayerIndex]
      const totalScore = darts.reduce((sum, d) => sum + d, 0)
      const newScore = activePlayer.currentScore - totalScore

      const dartsActuallyThrown = dartDetails.filter(d => d.state !== "empty").length

      let isWin = false
      let isBust: boolean

      if (prev.finishMode === "simple") {
        isBust = newScore < 0
        if (newScore === 0) isWin = true
      } else {
        // Double-out mode
        if (newScore < 0 || newScore === 1) {
          isBust = true
        } else if (newScore === 0) {
          // Check if the last scoring dart is a double or bullseye
          let lastScoringDartIndex = -1
          for (let i = dartDetails.length - 1; i >= 0; i--) {
            const dart = dartDetails[i]
            if (dart && dart.state === "scored" && dart.value !== null && dart.value > 0) {
              lastScoringDartIndex = i
              break
            }
          }
          
          if (lastScoringDartIndex >= 0) {
            const lastDart = dartDetails[lastScoringDartIndex]
            if (lastDart && lastDart.value !== null) {
              isWin = lastDart.multiplier === 2 || lastDart.value === 50
            }
          }
          
          // If score reached 0 but last dart wasn't a valid double finish, it's a bust
          isBust = !isWin
        } else {
          isBust = false
        }
      }

      const turnHistory: TurnHistory = {
        darts,
        dartDetails,
        total: totalScore,
        scoreAfter: isBust ? activePlayer.currentScore : newScore,
        wasBust: isBust,
        isWinningRound: isWin,
        dartsActuallyThrown,
        legNumber: prev.currentLeg,
      }

      const updatedPlayers = prev.players.map((player, index) => {
        if (index === prev.activePlayerIndex) {
          return {
            ...player,
            currentScore: isBust ? player.currentScore : newScore,
            history: [...player.history, turnHistory],
          }
        }
        return player
      })

      if (isWin) {
        const winningPlayer = updatedPlayers[prev.activePlayerIndex]
        const updatedWithLeg = updatedPlayers.map((player, index) => {
          if (index === prev.activePlayerIndex) {
            return { ...player, legsWon: player.legsWon + 1 }
          }
          return player
        })
        
        const legsToWin = Math.ceil(prev.totalLegs / 2)
        const playerLegsAfterWin = winningPlayer.legsWon + 1
        
        if (prev.totalLegs === 1 || playerLegsAfterWin >= legsToWin) {
          // Match is over
          return {
            ...prev,
            phase: "finished" as const,
            players: updatedWithLeg,
            winner: updatedWithLeg[prev.activePlayerIndex],
            legWinner: null,
          }
        }
        
        // Leg won, but match continues - show leg transition
        return {
          ...prev,
          phase: "legFinished" as const,
          players: updatedWithLeg,
          legWinner: updatedWithLeg[prev.activePlayerIndex],
        }
      }

      const nextPlayerIndex = (prev.activePlayerIndex + 1) % prev.players.length

      return {
        ...prev,
        players: updatedPlayers,
        activePlayerIndex: nextPlayerIndex,
      }
    })
  }, [])

  const handleNextLeg = useCallback(() => {
    setGameState((prev) => {
      const nextLeg = prev.currentLeg + 1
      
      // Reset player scores for new leg, keep history and legsWon
      const resetPlayers = prev.players.map((player) => ({
        ...player,
        currentScore: player.startingScore,
      }))

      return {
        ...prev,
        phase: "playing" as const,
        currentLeg: nextLeg,
        players: resetPlayers,
        activePlayerIndex: 0,
        legWinner: null,
      }
    })
    setUndoStack([])
  }, [])

  const handleUndo = useCallback(() => {
    const prevState = undoStack[undoStack.length - 1]
    if (prevState) {
      setGameState(prevState)
      setUndoStack((stack) => stack.slice(0, -1))
    }
  }, [undoStack])

  const handleNewGame = useCallback(() => {
    clearGameState()
    savedGameRef.current = false
    setSaveStatus("idle")
    setGameState(initialGameState)
    setUndoStack([])
  }, [])

  const handleResetGame = useCallback(() => {
    savedGameRef.current = false
    setSaveStatus("idle")
    setGameState((prev) => ({
      ...prev,
      phase: "playing" as const,
      currentLeg: 1,
      activePlayerIndex: 0,
      winner: null,
      legWinner: null,
      startTime: Date.now(),
      players: prev.players.map((player) => ({
        ...player,
        currentScore: player.startingScore,
        history: [],
        legsWon: 0,
      })),
    }))
    setUndoStack([])
  }, [])

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Login screen
  if (!isAuthenticated) {
    return <LoginScreen />
  }

  // Save status toast
  const saveToast = saveStatus === "saved" ? t.gameSaved :
                    saveStatus === "error" ? t.gameSaveError : null

  // Render based on game phase
  if (gameState.phase === "setup") {
    return (
      <div className="flex flex-col min-h-screen">
        <UserInfoBar />
        <div className="flex-1">
          <GameSetup onStartGame={handleStartGame} />
        </div>
      </div>
    )
  }

  if (gameState.phase === "legFinished" && gameState.legWinner) {
    return (
      <div className="flex flex-col min-h-screen">
        <UserInfoBar />
        <div className="flex-1 flex items-center justify-center">
          <LegTransition
            legWinner={gameState.legWinner}
            players={gameState.players}
            currentLeg={gameState.currentLeg}
            totalLegs={gameState.totalLegs}
            gameType={gameState.gameType}
            finishMode={gameState.finishMode}
            onNextLeg={handleNextLeg}
            onNewGame={handleNewGame}
          />
        </div>
      </div>
    )
  }

  if (gameState.phase === "finished" && gameState.winner) {
    return (
      <div className="flex flex-col min-h-screen">
        <UserInfoBar />
        <div className="flex-1 flex items-center justify-center">
          <VictoryScreen 
            winner={gameState.winner} 
            players={gameState.players}
            gameType={gameState.gameType}
            finishMode={gameState.finishMode}
            totalLegs={gameState.totalLegs}
            currentLeg={gameState.currentLeg}
            onRematch={handleResetGame} 
            onNewGame={handleNewGame}
            saveStatus={saveStatus}
          />
        </div>
        {/* Save toast */}
        {saveToast && (
          <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg text-sm font-medium shadow-lg transition-opacity ${
            saveStatus === "saved" ? "bg-primary/90 text-primary-foreground" : "bg-destructive/90 text-destructive-foreground"
          }`}>
            {saveToast}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <UserInfoBar />
      <GameBoard
        players={gameState.players}
        activePlayerIndex={gameState.activePlayerIndex}
        gameType={gameState.gameType}
        finishMode={gameState.finishMode}
        totalLegs={gameState.totalLegs}
        currentLeg={gameState.currentLeg}
        onSubmitTurn={handleSubmitTurn}
        onUndo={handleUndo}
        onNewGame={handleNewGame}
        onResetGame={handleResetGame}
        canUndo={undoStack.length > 0}
      />
    </>
  )
}
