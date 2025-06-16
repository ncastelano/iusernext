'use client'

import React from 'react'

export function MarqueeText({ text }: { text: string }) {
  const shouldScroll = text.length > 8

  const containerStyle: React.CSSProperties = {
    width: '60px',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    position: 'relative',
  }

  const scrollingWrapperStyle: React.CSSProperties = {
    display: 'flex',
    width: 'max-content',
    animation: shouldScroll ? 'scrollText 6s linear infinite' : 'none',
  }

  const spanStyle: React.CSSProperties = {
    paddingRight: '30px', // espaço entre os textos duplicados
  }

  return (
    <div style={containerStyle}>
      <div style={scrollingWrapperStyle}>
        <span style={spanStyle}>{text}</span>
        {shouldScroll && <span>{text}</span>}
      </div>

      <style>{`
        @keyframes scrollText {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  )
}
