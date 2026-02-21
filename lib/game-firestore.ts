import { collection, addDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore"
import { db } from "./firebase"
import type { Player, GameType, FinishMode, TotalLegs } from "./game-types"

export interface SavedPlayerStats {
  name: string
  legsWon: number
  average: number
  totalDarts: number
  remaining: number
  busts: number
  checkoutPct: number | null
}

export interface SavedGame {
  id: string
  userId: string
  timestamp: { seconds: number } | null
  gameMode: string
  finishMode: string
  legsPlayed: number
  winner: string
  players: SavedPlayerStats[]
}

const MAX_CHECKOUT = 170

export async function saveGameToFirestore(
  userId: string,
  players: Player[],
  gameType: GameType,
  finishMode: FinishMode,
  totalLegs: TotalLegs,
): Promise<string> {
  const winner = players.reduce((best, p) =>
    p.legsWon > best.legsWon ? p :
    p.legsWon === best.legsWon && p.currentScore < best.currentScore ? p : best
  , players[0])

  const startingScore = gameType === 301 ? 301 : 501

  const playerStats: SavedPlayerStats[] = players.map((p) => {
    const totalDarts = p.history.reduce((sum, h) => sum + (h.dartsActuallyThrown || 3), 0)
    const totalPoints = p.history.reduce((sum, h) => sum + (h.wasBust ? 0 : h.total), 0)
    const avg = totalDarts > 0 ? (totalPoints / totalDarts) * 3 : 0
    const busts = p.history.filter((h) => h.wasBust).length

    // Compute checkout percentage
    let checkoutAttempts = 0
    let checkoutSuccesses = 0
    let runningScore = startingScore
    for (const h of p.history) {
      if (runningScore <= MAX_CHECKOUT && runningScore >= 2) {
        checkoutAttempts++
        if (!h.wasBust && h.scoreAfter === 0) {
          checkoutSuccesses++
        }
      }
      runningScore = h.scoreAfter
    }

    return {
      name: p.name,
      legsWon: p.legsWon,
      average: Math.round(avg * 100) / 100,
      totalDarts,
      remaining: p.currentScore,
      busts,
      checkoutPct: checkoutAttempts > 0
        ? Math.round((checkoutSuccesses / checkoutAttempts) * 1000) / 10
        : null,
    }
  })

  const payload = {
    userId,
    timestamp: serverTimestamp(),
    gameMode: String(gameType),
    finishMode,
    legsPlayed: totalLegs,
    winner: winner.name,
    players: playerStats,
  }

  const doc = await addDoc(collection(db, "games"), payload)
  return doc.id
}

export async function fetchUserGames(userId: string, count = 50): Promise<SavedGame[]> {
  // Simple query without orderBy -- avoids need for a composite index.
  // We sort client-side instead.
  const q = query(
    collection(db, "games"),
    where("userId", "==", userId),
  )
  const snapshot = await getDocs(q)
  const games = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as SavedGame[]
  // Sort by timestamp descending client-side
  games.sort((a, b) => {
    const ta = a.timestamp?.seconds ?? 0
    const tb = b.timestamp?.seconds ?? 0
    return tb - ta
  })
  return games.slice(0, count)
}
