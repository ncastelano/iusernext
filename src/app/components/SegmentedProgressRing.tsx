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
  if (segments <= 0) return null

  // Define quantos segmentos serão exibidos (até maxSegments)
  const displayCount = Math.min(segments, maxSegments)

  // Seleciona as últimas cores correspondentes aos segmentos exibidos
  const displayColors = colors.slice(-displayCount)

  const normalizedRadius = radius - strokeWidth / 2
  const circumference = normalizedRadius * 2 * Math.PI
  const segmentLength = circumference / displayCount

  const gapRatio = Math.min(0.5, 0.2 + displayCount * 0.02)
  const gap = segmentLength * gapRatio
  const visibleLength = segmentLength - gap

  return (
    <svg
      height={radius * 2}
      width={radius * 2}
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
            strokeWidth={isActive ? strokeWidth + 1.5 : strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
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
    </svg>
  )
}
