"use client"

import { useEffect, useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useI18n } from "@/lib/i18n/context"
import { fetchUserGames, type SavedGame } from "@/lib/game-firestore"
import { BarChart3, X, Loader2, Trophy, Calendar, ChevronDown, ChevronRight } from "lucide-react"

interface StatsModalProps {
  userId: string
  onClose: () => void
}

interface PlayerRanking {
  name: string
  gamesPlayed: number
  wins: number
  winPct: number
  avgPer3: number
  checkoutPct: number | null
}

interface MonthGroup {
  label: string
  sortKey: string
  games: SavedGame[]
}

export function StatsModal({ userId, onClose }: StatsModalProps) {
  const { t, language } = useI18n()
  const [games, setGames] = useState<SavedGame[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<"ranking" | "history">("ranking")
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set())

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchUserGames(userId, 200)
      .then((data) => {
        if (!cancelled) {
          setGames(data)
          // Auto-expand the most recent month
          if (data.length > 0) {
            const first = data[0]
            if (first.timestamp) {
              const d = new Date(first.timestamp.seconds * 1000)
              setExpandedMonths(new Set([`${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`]))
            }
          }
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const fe = err as { code?: string; message?: string }
          setError(fe.code === "permission-denied"
            ? (language === "ru" ? "Нет доступа. Проверьте правила Firestore." : "Permission denied. Check Firestore rules.")
            : t.statsLoadError)
        }
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [userId, t.statsLoadError, language])

  // Tab 1: Compute player rankings across all games
  const rankings = useMemo((): PlayerRanking[] => {
    const map = new Map<string, {
      games: number; wins: number;
      totalPoints: number; totalDarts: number;
      checkoutSuccesses: number; checkoutAttempts: number;
    }>()

    for (const game of games) {
      for (const p of game.players) {
        const entry = map.get(p.name) || {
          games: 0, wins: 0,
          totalPoints: 0, totalDarts: 0,
          checkoutSuccesses: 0, checkoutAttempts: 0,
        }
        entry.games++
        if (p.name === game.winner) entry.wins++
        // Re-derive avg from stored average and darts:
        // stored avg = (points / darts) * 3, so points = avg * darts / 3
        entry.totalPoints += (p.average * p.totalDarts) / 3
        entry.totalDarts += p.totalDarts
        // CO%: accumulate from saved value
        if (p.checkoutPct !== null && p.checkoutPct !== undefined) {
          // We can only estimate: treat each game as 1 attempt for weighting
          entry.checkoutSuccesses += p.checkoutPct
          entry.checkoutAttempts++
        }
        map.set(p.name, entry)
      }
    }

    return Array.from(map.entries())
      .map(([name, s]) => ({
        name,
        gamesPlayed: s.games,
        wins: s.wins,
        winPct: s.games > 0 ? Math.round((s.wins / s.games) * 1000) / 10 : 0,
        avgPer3: s.totalDarts > 0 ? Math.round((s.totalPoints / s.totalDarts) * 3 * 10) / 10 : 0,
        checkoutPct: s.checkoutAttempts > 0
          ? Math.round((s.checkoutSuccesses / s.checkoutAttempts) * 10) / 10
          : null,
      }))
      .sort((a, b) => b.winPct - a.winPct || b.avgPer3 - a.avgPer3)
  }, [games])

  // Tab 2: Group games by month
  const monthGroups = useMemo((): MonthGroup[] => {
    const map = new Map<string, SavedGame[]>()
    const months = language === "ru"
      ? ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"]
      : ["January","February","March","April","May","June","July","August","September","October","November","December"]

    for (const game of games) {
      if (!game.timestamp) continue
      const d = new Date(game.timestamp.seconds * 1000)
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`
      const arr = map.get(key) || []
      arr.push(game)
      map.set(key, arr)
    }

    return Array.from(map.entries())
      .map(([key, groupGames]) => {
        const [year, month] = key.split("-")
        return {
          label: `${months[parseInt(month)]} ${year}`,
          sortKey: key,
          games: groupGames,
        }
      })
      .sort((a, b) => b.sortKey.localeCompare(a.sortKey))
  }, [games, language])

  const toggleMonth = (key: string) => {
    setExpandedMonths((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const formatDate = (ts: { seconds: number } | null) => {
    if (!ts) return "-"
    const d = new Date(ts.seconds * 1000)
    return d.toLocaleDateString(language === "ru" ? "ru-RU" : "en-US", {
      day: "2-digit", month: "2-digit",
    }) + " " + d.toLocaleTimeString(language === "ru" ? "ru-RU" : "en-US", {
      hour: "2-digit", minute: "2-digit",
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg bg-card border-border max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">{t.myStats}</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7 text-muted-foreground hover:text-foreground bg-transparent"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Tabs */}
        {!loading && !error && games.length > 0 && (
          <div className="flex border-b border-border shrink-0">
            <button
              type="button"
              onClick={() => setTab("ranking")}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${
                tab === "ranking"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.statsRanking}
            </button>
            <button
              type="button"
              onClick={() => setTab("history")}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${
                tab === "history"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.statsByMonth}
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive text-center py-8">{error}</p>
          )}

          {!loading && !error && games.length === 0 && (
            <div className="text-center py-12 space-y-2">
              <Trophy className="w-8 h-8 text-muted-foreground/30 mx-auto" />
              <p className="text-sm text-muted-foreground">{t.noGamesYet}</p>
            </div>
          )}

          {/* Tab 1: Ranking */}
          {!loading && !error && games.length > 0 && tab === "ranking" && (
            <div className="overflow-x-auto -mx-4 px-4">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="text-muted-foreground border-b border-border/50">
                    <th className="text-left py-2 font-medium">#</th>
                    <th className="text-left py-2 font-medium">{t.playerName}</th>
                    <th className="text-center py-2 font-medium">{t.statsGames}</th>
                    <th className="text-center py-2 font-medium">{t.statsWins}</th>
                    <th className="text-center py-2 font-medium">%</th>
                    <th className="text-right py-2 font-medium">{t.avgPer3Darts}</th>
                    <th className="text-right py-2 font-medium">CO%</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.map((r, i) => (
                    <tr key={r.name} className={`border-b border-border/20 ${i === 0 ? "text-primary" : "text-foreground"}`}>
                      <td className="py-2 text-muted-foreground">{i + 1}</td>
                      <td className="py-2 font-medium truncate max-w-[100px]">{r.name}</td>
                      <td className="py-2 text-center">{r.gamesPlayed}</td>
                      <td className="py-2 text-center">{r.wins}</td>
                      <td className="py-2 text-center font-medium">{r.winPct.toFixed(1)}</td>
                      <td className="py-2 text-right font-medium">{r.avgPer3.toFixed(1)}</td>
                      <td className="py-2 text-right text-muted-foreground">{r.checkoutPct !== null ? r.checkoutPct.toFixed(1) : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 2: Monthly history */}
          {!loading && !error && games.length > 0 && tab === "history" && (
            <div className="space-y-2">
              {monthGroups.map((group) => {
                const isExpanded = expandedMonths.has(group.sortKey)
                return (
                  <div key={group.sortKey} className="rounded-lg border border-border/50 overflow-hidden">
                    {/* Month header */}
                    <button
                      type="button"
                      onClick={() => toggleMonth(group.sortKey)}
                      className="w-full flex items-center justify-between px-3 py-2.5 bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs font-medium text-foreground">{group.label}</span>
                        <span className="text-[10px] text-muted-foreground">
                          ({group.games.length})
                        </span>
                      </div>
                      {isExpanded
                        ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                        : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                      }
                    </button>

                    {/* Expanded games */}
                    {isExpanded && (
                      <div className="divide-y divide-border/30">
                        {group.games.map((game) => (
                          <GameCard key={game.id} game={game} t={t} language={language} formatDate={formatDate} />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border shrink-0">
          <Button
            variant="secondary"
            onClick={onClose}
            className="w-full h-9 text-sm bg-secondary text-secondary-foreground"
          >
            {t.close}
          </Button>
        </div>
      </Card>
    </div>
  )
}

function GameCard({ game, t, language, formatDate }: {
  game: SavedGame
  t: ReturnType<typeof useI18n>["t"]
  language: string
  formatDate: (ts: { seconds: number } | null) => string
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="px-3 py-2.5 space-y-1.5">
      {/* Row: date + mode + winner */}
      <button type="button" onClick={() => setExpanded(!expanded)} className="w-full text-left">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">{formatDate(game.timestamp)}</span>
            <span className="px-1.5 py-0.5 bg-primary/15 text-primary rounded text-[10px] font-medium shrink-0">
              {game.gameMode} {game.finishMode === "double" ? "D" : "S"}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Trophy className="w-3 h-3 text-primary" />
            <span className="text-[11px] font-medium text-primary truncate max-w-[80px]">{game.winner}</span>
            {expanded
              ? <ChevronDown className="w-3 h-3 text-muted-foreground" />
              : <ChevronRight className="w-3 h-3 text-muted-foreground" />
            }
          </div>
        </div>
      </button>

      {/* Expanded: full player stats */}
      {expanded && (
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="text-muted-foreground">
                <th className="text-left py-0.5 font-medium">{t.playerName}</th>
                <th className="text-right py-0.5 font-medium">{t.avgPer3Darts}</th>
                <th className="text-right py-0.5 font-medium">{t.dartsThrown}</th>
                <th className="text-right py-0.5 font-medium">{t.busts}</th>
                <th className="text-right py-0.5 font-medium">CO%</th>
                {game.legsPlayed > 1 && (
                  <th className="text-right py-0.5 font-medium">{t.legsHeader}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {game.players.map((p, i) => (
                <tr key={i} className={p.name === game.winner ? "text-primary" : "text-foreground"}>
                  <td className="py-0.5 truncate max-w-[80px]">{p.name}</td>
                  <td className="py-0.5 text-right font-medium">{p.average.toFixed(1)}</td>
                  <td className="py-0.5 text-right">{p.totalDarts}</td>
                  <td className="py-0.5 text-right text-muted-foreground">{p.busts}</td>
                  <td className="py-0.5 text-right text-muted-foreground">{p.checkoutPct != null ? `${p.checkoutPct.toFixed(1)}` : "-"}</td>
                  {game.legsPlayed > 1 && (
                    <td className="py-0.5 text-right">{p.legsWon}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
