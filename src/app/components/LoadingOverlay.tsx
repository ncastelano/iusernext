// components/LoadingOverlay.tsx
import Image from 'next/image'
import React from 'react'

export const LoadingOverlay: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      bottom: 120,
      right: 200,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      zIndex: 10,
      whiteSpace: 'nowrap',
    }}
  >
    <span
      style={{
        fontSize: 30,
        color: 'white',
        userSelect: 'none',
        fontWeight: 'bold',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      Carregando vídeo
    </span>
    <Image
      src="/loading100px.svg"
      alt="Loading"
      width={80}
      height={80}
      style={{ opacity: 0.8, pointerEvents: 'none' }}
      priority
    />
  </div>
)
