// components/Avatar.tsx
'use client'

import Image from 'next/image'

type AvatarProps = {
  src: string
  alt?: string
  size?: number | string
  position?: {
    top?: number
    left?: number
    right?: number
    bottom?: number
  }
}

export default function Avatar({ src, alt = 'User avatar', size = 'clamp(60px, 10vw, 120px)', position }: AvatarProps) {
  return (
    <div
      className="position-absolute rounded-circle border border-light overflow-hidden"
      style={{
        width: size,
        height: size,
        boxShadow: '0 0 10px rgba(0,0,0,0.5)',
        zIndex: 10,
        ...position, // optional absolute positioning
      }}
    >
      <Image
        src={src}
        alt={alt}
        width={120}
        height={120}
        style={{ objectFit: 'cover' }}
      />
    </div>
  )
}
