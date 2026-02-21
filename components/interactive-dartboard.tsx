"use client"

import React from "react"
import { useRef, useState, useCallback, useMemo, useEffect } from "react"
import { useI18n } from "@/lib/i18n/context"

interface InteractiveDartboardProps {
  onDartSelected: (value: number, multiplier: 1 | 2 | 3) => void
}

// Standard dartboard sector layout (clockwise from top)
const SECTORS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5]

// ── Desktop proportions (official) ──────────────────────────
const DESKTOP = {
  BULLSEYE_R: 0.037,     // 6.35mm / 170mm
  BULL_R: 0.094,          // 15.9mm / 170mm
  TRIPLE_START: 0.63,     // 107mm / 170mm
  TRIPLE_END: 0.676,      // 115mm / 170mm
  DOUBLE_START: 0.953,    // 162mm / 170mm
  DOUBLE_END: 1.0,
}

// ── Mobile proportions (enlarged targets) ───────────────────
// Bullseye: ~12mm radius = 0.07 (comfortable finger tap)
// Bull: ~28mm radius = 0.165
// Remaining: 1.0 - 0.165 = 0.835, divided into 3 equal rings:
//   Triple:  0.165 -> 0.443  (starts right at bull edge)
//   Single:  0.443 -> 0.722
//   Double:  0.722 -> 1.000
const MOBILE = {
  BULLSEYE_R: 0.07,
  BULL_R: 0.165,
  TRIPLE_START: 0.165,  // starts at bull outer edge (no gap)
  TRIPLE_END: 0.443,
  SINGLE_START: 0.443,
  DOUBLE_START: 0.722,
  DOUBLE_END: 1.0,
}

// ── Constants ─────────────────────────────────────────────
const BOARD_SIZE = 360
const CENTER = BOARD_SIZE / 2
const R = 155
const SECTOR_ANGLE = (2 * Math.PI) / 20

function sectorColors(idx: number): { single: string; ring: string } {
  return idx % 2 === 0
    ? { single: "#1a1a1a", ring: "#c0392b" }
    : { single: "#f5f0e1", ring: "#1e8449" }
}

function arcPath(
  cx: number, cy: number,
  r1: number, r2: number,
  a1: number, a2: number,
): string {
  const x1i = cx + r1 * Math.cos(a1)
  const y1i = cy + r1 * Math.sin(a1)
  const x1o = cx + r2 * Math.cos(a1)
  const y1o = cy + r2 * Math.sin(a1)
  const x2o = cx + r2 * Math.cos(a2)
  const y2o = cy + r2 * Math.sin(a2)
  const x2i = cx + r1 * Math.cos(a2)
  const y2i = cy + r1 * Math.sin(a2)
  const lg = a2 - a1 > Math.PI ? 1 : 0
  return [
    `M ${x1i} ${y1i}`,
    `L ${x1o} ${y1o}`,
    `A ${r2} ${r2} 0 ${lg} 1 ${x2o} ${y2o}`,
    `L ${x2i} ${y2i}`,
    `A ${r1} ${r1} 0 ${lg} 0 ${x1i} ${y1i}`,
    "Z",
  ].join(" ")
}

interface HitInfo {
  value: number
  multiplier: 1 | 2 | 3
  label: string
  zone: string
}

export function InteractiveDartboard({ onDartSelected }: InteractiveDartboardProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hovered, setHovered] = useState<HitInfo | null>(null)
  const [flash, setFlash] = useState<{ x: number; y: number; label: string } | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const { t } = useI18n()

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 1024)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const Z = isMobile ? MOBILE : null
  const D = DESKTOP

  // ── Hit detection ─────────────────────────────────────────
  const getHit = useCallback(
    (clientX: number, clientY: number): HitInfo | null => {
      if (!svgRef.current) return null
      const rect = svgRef.current.getBoundingClientRect()
      const scale = BOARD_SIZE / rect.width
      const x = (clientX - rect.left) * scale - CENTER
      const y = (clientY - rect.top) * scale - CENTER
      const dist = Math.sqrt(x * x + y * y)
      const norm = dist / R

      if (norm > 1.02) return null

      const bullseyeR = Z ? Z.BULLSEYE_R : D.BULLSEYE_R
      const bullR = Z ? Z.BULL_R : D.BULL_R

      // Bullseye (50)
      if (norm <= bullseyeR) {
        return { value: 50, multiplier: 1, label: "Bull", zone: "bullseye" }
      }
      // Bull (25)
      if (norm <= bullR) {
        return { value: 25, multiplier: 1, label: "25", zone: "bull" }
      }

      // Determine sector from angle
      let angle = Math.atan2(y, x) + Math.PI / 2
      if (angle < 0) angle += 2 * Math.PI
      const adjusted = (angle + SECTOR_ANGLE / 2) % (2 * Math.PI)
      const idx = Math.floor(adjusted / SECTOR_ANGLE)
      const sector = SECTORS[idx]

      if (Z) {
        // MOBILE hit detection: triple starts right at bull edge
        if (norm <= Z.TRIPLE_END) {
          return { value: sector, multiplier: 3, label: `T${sector}`, zone: "triple" }
        }
        if (norm <= Z.DOUBLE_START) {
          return { value: sector, multiplier: 1, label: `${sector}`, zone: "outerSingle" }
        }
        return { value: sector, multiplier: 2, label: `D${sector}`, zone: "double" }
      }

      // DESKTOP hit detection (standard):
      if (norm <= D.TRIPLE_START) {
        return { value: sector, multiplier: 1, label: `${sector}`, zone: "innerSingle" }
      }
      if (norm <= D.TRIPLE_END) {
        return { value: sector, multiplier: 3, label: `T${sector}`, zone: "triple" }
      }
      if (norm <= D.DOUBLE_START) {
        return { value: sector, multiplier: 1, label: `${sector}`, zone: "outerSingle" }
      }
      return { value: sector, multiplier: 2, label: `D${sector}`, zone: "double" }
    },
    [Z, D],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => setHovered(getHit(e.clientX, e.clientY)),
    [getHit],
  )
  const handlePointerLeave = useCallback(() => setHovered(null), [])

  const handleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const hit = getHit(e.clientX, e.clientY)
      if (!hit) return
      onDartSelected(hit.value, hit.multiplier)

      const rect = svgRef.current?.getBoundingClientRect()
      if (rect) {
        const scale = BOARD_SIZE / rect.width
        const fx = (e.clientX - rect.left) * scale
        const fy = (e.clientY - rect.top) * scale
        const score = hit.value === 50 || hit.value === 25
            ? hit.value
            : hit.value * hit.multiplier
        setFlash({ x: fx, y: fy, label: `${score}` })
        setTimeout(() => setFlash(null), 600)
      }
    },
    [getHit, onDartSelected],
  )

  // ── SVG rendering ───────────────────────────────────────
  const sectors = useMemo(() => {
    const result: React.ReactNode[] = []
    const bullR = isMobile ? MOBILE.BULL_R : D.BULL_R
    const tripleStart = isMobile ? MOBILE.TRIPLE_START : D.TRIPLE_START
    const tripleEnd = isMobile ? MOBILE.TRIPLE_END : D.TRIPLE_END
    const doubleStart = isMobile ? MOBILE.DOUBLE_START : D.DOUBLE_START
    const doubleEnd = isMobile ? MOBILE.DOUBLE_END : D.DOUBLE_END

    for (let i = 0; i < 20; i++) {
      const a1 = -Math.PI / 2 + i * SECTOR_ANGLE - SECTOR_ANGLE / 2
      const a2 = a1 + SECTOR_ANGLE
      const col = sectorColors(i)

      if (!isMobile) {
        // Desktop: inner single between bull and triple
        result.push(
          <path
            key={`is-${i}`}
            d={arcPath(CENTER, CENTER, R * bullR, R * tripleStart, a1, a2)}
            fill={col.single}
            stroke="#333"
            strokeWidth={0.5}
          />,
        )
      }
      // Triple ring (on mobile: starts right at bull edge)
      result.push(
        <path
          key={`tr-${i}`}
          d={arcPath(CENTER, CENTER, R * tripleStart, R * tripleEnd, a1, a2)}
          fill={col.ring}
          stroke="#333"
          strokeWidth={0.5}
        />,
      )
      // Outer single (between triple and double)
      result.push(
        <path
          key={`os-${i}`}
          d={arcPath(CENTER, CENTER, R * tripleEnd, R * doubleStart, a1, a2)}
          fill={col.single}
          stroke="#333"
          strokeWidth={0.5}
        />,
      )
      // Double ring
      result.push(
        <path
          key={`db-${i}`}
          d={arcPath(CENTER, CENTER, R * doubleStart, R * doubleEnd, a1, a2)}
          fill={col.ring}
          stroke="#333"
          strokeWidth={0.5}
        />,
      )
    }

    return result
  }, [isMobile, D])

  const numberLabels = useMemo(() => {
    return SECTORS.map((num, i) => {
      const angle = -Math.PI / 2 + i * SECTOR_ANGLE
      const labelR = R * 1.09
      const x = CENTER + labelR * Math.cos(angle)
      const y = CENTER + labelR * Math.sin(angle)
      return (
        <text
          key={`lbl-${num}`}
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="central"
          className="select-none pointer-events-none"
          fill="#e0e0e0"
          fontSize={13}
          fontWeight={700}
        >
          {num}
        </text>
      )
    })
  }, [])

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Hovered / last-hit label */}
      <div className="h-5 flex items-center justify-center">
        {hovered ? (
          <span
            className={`text-sm font-bold px-3 py-0.5 rounded-full ${
              hovered.zone === "triple"
                ? "bg-orange-500/30 text-orange-400"
                : hovered.zone === "double"
                  ? "bg-sky-500/30 text-sky-400"
                  : hovered.zone === "bullseye"
                    ? "bg-destructive/30 text-destructive"
                    : hovered.zone === "bull"
                      ? "bg-primary/30 text-primary"
                      : "bg-secondary text-secondary-foreground"
            }`}
          >
            {hovered.label}
            {hovered.zone === "triple" && " (x3)"}
            {hovered.zone === "double" && " (x2)"}
            {" = "}
            {hovered.value === 50 || hovered.value === 25
              ? hovered.value
              : hovered.value * hovered.multiplier}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">{t.tapToSelect}</span>
        )}
      </div>

      {/* SVG Dartboard */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${BOARD_SIZE} ${BOARD_SIZE}`}
        className="w-full max-w-[340px] aspect-square cursor-pointer touch-manipulation select-none"
        style={{ shapeRendering: "geometricPrecision" }}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
        role="img"
        aria-label="Interactive dartboard"
      >
        {/* Board background */}
        <circle cx={CENTER} cy={CENTER} r={R + 2} fill="#222" stroke="#555" strokeWidth={1} />

        {/* Rendered sectors */}
        {sectors}

        {/* Bull outer (25) */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={R * (isMobile ? MOBILE.BULL_R : D.BULL_R)}
          fill="#1e8449"
          stroke="#333"
          strokeWidth={0.8}
        />

        {/* Bullseye inner (50) */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={R * (isMobile ? MOBILE.BULLSEYE_R : D.BULLSEYE_R)}
          fill="#c0392b"
          stroke="#333"
          strokeWidth={0.8}
        />

        {/* Bull "25" label on mobile */}
        {isMobile && (
          <text
            x={CENTER}
            y={CENTER + R * MOBILE.BULL_R * 0.55}
            textAnchor="middle"
            dominantBaseline="central"
            fill="rgba(255,255,255,0.45)"
            fontSize={8}
            fontWeight={700}
            className="pointer-events-none select-none"
          >
            25
          </text>
        )}

        {/* Number labels around the rim */}
        {numberLabels}

        {/* Click/tap flash animation */}
        {flash && (
          <g>
            <circle cx={flash.x} cy={flash.y} r={6} fill="var(--primary)" opacity={0.4}>
              <animate attributeName="r" from="6" to="28" dur="0.4s" fill="freeze" />
              <animate attributeName="opacity" from="0.4" to="0" dur="0.4s" fill="freeze" />
            </circle>
            <circle cx={flash.x} cy={flash.y} r={8} fill="none" stroke="var(--primary)" strokeWidth={2.5} opacity={0.9}>
              <animate attributeName="r" from="4" to="22" dur="0.5s" fill="freeze" />
              <animate attributeName="opacity" from="0.9" to="0" dur="0.5s" fill="freeze" />
            </circle>
            <text
              x={flash.x}
              y={flash.y - 16}
              textAnchor="middle"
              dominantBaseline="central"
              fill="var(--primary)"
              fontSize={16}
              fontWeight={800}
              className="pointer-events-none"
            >
              <animate attributeName="y" from={flash.y - 10} to={flash.y - 30} dur="0.5s" fill="freeze" />
              <animate attributeName="opacity" from="1" to="0" dur="0.5s" fill="freeze" />
              {flash.label}
            </text>
          </g>
        )}
      </svg>

      {/* Miss button */}
      <button
        type="button"
        onClick={() => onDartSelected(0, 1)}
        className="w-full max-w-[340px] h-10 rounded-lg bg-destructive/20 text-destructive text-sm font-semibold hover:bg-destructive/30 active:scale-[0.98] transition-all select-none"
      >
        {t.dartboardMiss}
      </button>
    </div>
  )
}
