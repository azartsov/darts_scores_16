import type { GameState } from "./game-types"

const STORAGE_KEY = "dartmaster-game-state"

export function saveGameState(state: GameState): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }
}

export function loadGameState(): GameState | null {
  if (typeof window !== "undefined") {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        return JSON.parse(saved) as GameState
      } catch {
        return null
      }
    }
  }
  return null
}

export function clearGameState(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(STORAGE_KEY)
  }
}
