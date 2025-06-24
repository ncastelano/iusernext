// src/app/components/SkeletonLoader.tsx
'use client'

import React from 'react'

export default function SkeletonInicio() {
  return (
    <div style={{ position: 'absolute', top: 10, left: 20, zIndex: 3, color: '#fff', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Avatar Skeleton */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          backgroundColor: '#333',
          animation: 'pulse 1.5s infinite'
        }}></div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ width: 120, height: 16, backgroundColor: '#333', borderRadius: 4, animation: 'pulse 1.5s infinite' }}></div>
          <div style={{ width: 80, height: 12, backgroundColor: '#333', borderRadius: 4, animation: 'pulse 1.5s infinite' }}></div>
        </div>
      </div>

      {/* Distance Skeleton */}
      <div style={{ width: 100, height: 14, backgroundColor: '#333', borderRadius: 4, animation: 'pulse 1.5s infinite' }}></div>

      {/* Song Name Skeleton */}
      <div style={{ width: 180, height: 14, backgroundColor: '#333', borderRadius: 4, animation: 'pulse 1.5s infinite' }}></div>

     <style>{`
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.4; }
    100% { opacity: 1; }
  }
`}</style>

    </div>
  )
}
