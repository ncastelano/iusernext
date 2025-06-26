'use client'

import React from 'react'

type SegmentedProgressRingProps = {
  segments: number
  radius: number
  strokeWidth: number
  color: string
  style?: React.CSSProperties
}

export function SegmentedProgressRing({
  segments,
  radius,
  strokeWidth,
  color,
  style = {},
}: SegmentedProgressRingProps) {
  if (segments <= 0) return null

  const normalizedRadius = radius - strokeWidth / 2
  const circumference = normalizedRadius * 2 * Math.PI
  const segmentLength = circumference / segments

  // Gap dinâmico para não "colar" quando muitos segmentos
  const gapRatio = Math.min(0.5, 0.2 + segments * 0.02)
  const gap = segmentLength * gapRatio

  const dashArray = `${segmentLength - gap} ${gap}`

  return (
    <svg
      height={radius * 2}
      width={radius * 2}
      style={{ position: 'absolute', top: 0, left: 0, ...style }}
    >
      <circle
        stroke={color}
        fill="transparent"
        strokeWidth={strokeWidth}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        strokeDasharray={dashArray}
        strokeDashoffset={0}
        strokeLinecap="round"
        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
      />
    </svg>
  )
}
