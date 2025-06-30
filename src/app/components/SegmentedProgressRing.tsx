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

  const displayCount = Math.min(segments, maxSegments)
  const displayColors = colors.slice(-displayCount)

  const normalizedRadius = radius - strokeWidth / 2
  const circumference = normalizedRadius * 2 * Math.PI
  const segmentLength = circumference / displayCount

  const gapRatio = Math.min(0.5, 0.2 + displayCount * 0.02)
  const gap = segmentLength * gapRatio
  const visibleLength = segmentLength - gap

  // Calcula posição do "+" no canto superior direito do círculo principal
  // 45 graus em radianos para posicionar no canto superior direito
  const plusX = radius + normalizedRadius * Math.cos(-Math.PI / 4)
  const plusY = radius + normalizedRadius * Math.sin(-Math.PI / 4)

  // Cor do primeiro vídeo fora dos maxSegments
  // Se não existir, usa cor branca como fallback
  const plusColor = segments > maxSegments ? colors[colors.length - maxSegments - 1] ?? 'white' : null

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

      {plusColor && (
        <text
          x={plusX + 5}
          y={plusY + 2} // ajustar vertical para centralizar visualmente o "+"
          textAnchor="middle"
          fontSize={20}
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
