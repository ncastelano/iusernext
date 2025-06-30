// components/VideoPlayer.tsx
'use client'

import { motion } from 'framer-motion'
import React from 'react'

interface VideoPlayerProps {
  videoUrl: string
  videoRef: React.RefObject<HTMLVideoElement | null>
  onEnded: () => void
  onCanPlay: () => void
  onTimeUpdate: () => void
  onLoadedMetadata: () => void
  swipeDirection: 'left' | 'right' | 'up' | 'down' | null
  videoLoaded: boolean
}


export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  videoRef,
  onEnded,
  onCanPlay,
  onTimeUpdate,
  onLoadedMetadata,
  swipeDirection,
  videoLoaded,
}) => {
  return (
    <motion.video
      key={videoUrl}
      ref={videoRef}
      src={videoUrl}
      preload="auto"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1,
        display: videoLoaded ? 'block' : 'none',
      }}
      muted
      autoPlay
      loop={false}
      playsInline
      onEnded={onEnded}
      onCanPlay={onCanPlay}
      onTimeUpdate={onTimeUpdate}
      onLoadedMetadata={onLoadedMetadata}
      initial={{
        opacity: 0,
        x: swipeDirection === 'left' ? 300 : swipeDirection === 'right' ? -300 : 0,
        y: swipeDirection === 'up' ? 300 : swipeDirection === 'down' ? -300 : 0,
      }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{
        opacity: 0,
        x: swipeDirection === 'left' ? -300 : swipeDirection === 'right' ? 300 : 0,
        y: swipeDirection === 'up' ? -300 : swipeDirection === 'down' ? 300 : 0,
      }}
      transition={{ duration: 0.3 }}
    />
  )
}
