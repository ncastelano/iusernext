'use client'

import React, { useEffect, useState } from 'react'

type SegmentedProgressRingProps = {
  segments: number
  radius: number
  strokeWidth: number
  colors: string[]
  activeIndex?: number
  maxSegments?: number
  style?: React.CSSProperties
}

export function SegmentedProgressRing({
  segments,
  radius,
  strokeWidth,
  colors,
  activeIndex = -1,
  maxSegments = 10,
  style = {},
}: SegmentedProgressRingProps) {
  const [windowWidth, setWindowWidth] = useState(0)
  const [devicePixelRatio, setDevicePixelRatio] = useState(1)

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
      setDevicePixelRatio(window.devicePixelRatio)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const getResponsiveScale = () => {
    if (windowWidth <= 400 && devicePixelRatio >= 2) {
      return 2
    }
    return 1
  }

  const scale = getResponsiveScale()

  // Mesma lógica do Navbar: radius e strokeWidth escaláveis
  const getRadius = () => {
    if (windowWidth < 400) return radius * scale * 0.8
    if (windowWidth < 600) return radius * scale * 1
    if (windowWidth < 900) return radius * scale * 1.2
    return radius * scale
  }

  const getStrokeWidth = () => {
    if (windowWidth < 400) return strokeWidth * scale * 0.9
    if (windowWidth < 600) return strokeWidth * scale * 1
    if (windowWidth < 900) return strokeWidth * scale * 1.2
    return strokeWidth * scale
  }

  const getFontSize = () => {
    if (windowWidth < 400) return 16 * scale
    if (windowWidth < 600) return 18 * scale
    if (windowWidth < 900) return 20 * scale
    return 20 * scale
  }

  if (segments <= 0) return null

  const scaledRadius = getRadius()
  const scaledStrokeWidth = getStrokeWidth()
  const normalizedRadius = scaledRadius - scaledStrokeWidth / 2
  const circumference = normalizedRadius * 2 * Math.PI

  const displayCount = Math.min(segments, maxSegments)
  const displayColors = colors.slice(-displayCount)

  const segmentLength = circumference / displayCount
  const gapRatio = Math.min(0.5, 0.2 + displayCount * 0.02)
  const gap = segmentLength * gapRatio
  const visibleLength = segmentLength - gap

  const plusX = scaledRadius + normalizedRadius * Math.cos(-Math.PI / 4)
  const plusY = scaledRadius + normalizedRadius * Math.sin(-Math.PI / 4)
  const plusColor = segments > maxSegments ? colors[colors.length - maxSegments - 1] ?? 'white' : null

  return (
    <svg
      height={scaledRadius * 2}
      width={scaledRadius * 2}
      style={{ position: 'absolute', top: 0, left: 0, ...style }}
    >
      {displayColors.map((color, i) => {
        const startOffset = i * segmentLength
        const isActive = i === activeIndex
        return (
          <circle
            key={i}
            stroke={isActive ? 'white' : color}
            fill="transparent"
            strokeWidth={isActive ? scaledStrokeWidth + 1.5 * scale : scaledStrokeWidth}
            r={normalizedRadius}
            cx={scaledRadius}
            cy={scaledRadius}
            strokeDasharray={`${visibleLength} ${circumference}`}
            strokeDashoffset={-startOffset}
            strokeLinecap="round"
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: '50% 50%',
              opacity: isActive ? 1 : 0.6,
            }}
          />
        )
      })}

      {plusColor && (
        <text
          x={plusX + 5 * scale}
          y={plusY + 2 * scale}
          textAnchor="middle"
          fontSize={getFontSize()}
          fontWeight="bold"
          fill={plusColor}
          pointerEvents="none"
          style={{ userSelect: 'none' }}
        >
          +
        </text>
      )}
    </svg>
  )
}
