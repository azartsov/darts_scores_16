"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useI18n } from "@/lib/i18n/context"
import type { FinishMode } from "@/lib/game-types"
import { Undo2, MoreVertical, RotateCcw, Home, HelpCircle } from "lucide-react"

interface GameControlsProps {
  onUndo: () => void
  onNewGame: () => void
  onResetGame: () => void
  canUndo: boolean
  finishMode: FinishMode
}

export function GameControls({ onUndo, onNewGame, onResetGame, canUndo, finishMode }: GameControlsProps) {
  const { t } = useI18n()
  const [showRules, setShowRules] = useState(false)

  // Get dynamic content based on finish mode
  const rulesSubtitle = finishMode === "simple" ? t.rulesSimpleSubtitle : t.rulesDoubleSubtitle
  const objectiveDesc = finishMode === "simple" ? t.objectiveSimpleDesc : t.objectiveDoubleDesc
  const bustDesc = finishMode === "simple" ? t.bustSimpleDesc : t.bustDoubleDesc
  const checkoutDesc = finishMode === "simple" ? t.checkoutSimpleDesc : t.checkoutDoubleDesc

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={onUndo}
        disabled={!canUndo}
        className="text-muted-foreground hover:text-foreground disabled:opacity-30 h-7 w-7"
        aria-label={t.undo}
        title={t.undo}
      >
        <Undo2 className="w-4 h-4" />
      </Button>

      <Dialog open={showRules} onOpenChange={setShowRules}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-7 w-7">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border">
            <DialogTrigger asChild>
              <DropdownMenuItem className="cursor-pointer">
                <HelpCircle className="w-4 h-4 mr-2" />
                {t.howToPlay}
              </DropdownMenuItem>
            </DialogTrigger>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onResetGame} className="cursor-pointer">
              <RotateCcw className="w-4 h-4 mr-2" />
              {t.resetScores}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onNewGame} className="cursor-pointer">
              <Home className="w-4 h-4 mr-2" />
              {t.newGame}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">{t.rulesTitle}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {rulesSubtitle}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm text-foreground">
            <div>
              <h4 className="font-semibold text-primary mb-1">{t.objective}</h4>
              <p className="text-muted-foreground">
                {objectiveDesc}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-primary mb-1">{t.scoring}</h4>
              <p className="text-muted-foreground">
                {t.scoringDesc}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-primary mb-1">{t.bustRule}</h4>
              <p className="text-muted-foreground">
                {bustDesc}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-primary mb-1">{t.checkout}</h4>
              <p className="text-muted-foreground">
                {checkoutDesc}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
