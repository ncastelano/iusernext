'use client'

import React, { useRef, useEffect, useCallback, useState } from 'react'
import { Dice5, Play, Pause, Volume, VolumeX, Loader2, Heart, MessageCircle } from 'lucide-react'
import { Video } from 'types/video'


type RandomVideoProps = {
  video: Video | null
  isMuted: boolean
  onToggleMute: () => void
  isPlaying: boolean
  setIsPlaying: (playing: boolean) => void
  onRefreshVideo: () => void
}

export default function RandomVideo({
  video,
  isMuted,
  onToggleMute,
  isPlaying,
  setIsPlaying,
  onRefreshVideo,
}: RandomVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isBuffering, setIsBuffering] = useState(false)
  const autoplayAttemptTimeout = useRef<number | null>(null)

  const tryAutoplay = useCallback((delay: number) => {
    if (!videoRef.current) return
    autoplayAttemptTimeout.current = window.setTimeout(async () => {
      try {
        await videoRef.current!.play()
        setIsPlaying(true)
        if (autoplayAttemptTimeout.current) {
          clearTimeout(autoplayAttemptTimeout.current)
          autoplayAttemptTimeout.current = null
        }
      } catch {
        tryAutoplay(delay * 2)
      }
    }, delay)
  }, [setIsPlaying])

  useEffect(() => {
    if (video?.videoUrl) {
      setIsPlaying(false)
      setIsBuffering(true)
      tryAutoplay(2000)
    }
  }, [video, tryAutoplay, setIsPlaying])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted
      if (!isPlaying) videoRef.current.pause()
    }
  }, [isMuted, video, isPlaying])

  function togglePlayPause() {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
    }
  }

  function handleWaiting() {
    setIsBuffering(true)
  }

  function handlePlaying() {
    setIsBuffering(false)
    setIsPlaying(true)
  }

  const buttonStyle: React.CSSProperties = {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: '50%',
    padding: 10,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {video?.videoUrl && (
        <video
          ref={videoRef}
          src={video.videoUrl}
          muted={isMuted}
          onWaiting={handleWaiting}
          onPlaying={handlePlaying}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
        />
      )}

      {/* Gradiente no fundo */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: 150,
          background: 'linear-gradient(to top, black, transparent)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Botões no topo direito (coluna, estilo padrão) */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          zIndex: 3,
          color: '#fff',
          alignItems: 'center',
        }}
      >
        <div
          onClick={onToggleMute}
          style={buttonStyle}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)')}
        >
          {isMuted ? <VolumeX size={24} /> : <Volume size={24} />}
        </div>

        <div
          onClick={() => console.log('Comentário')}
          style={buttonStyle}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)')}
        >
          <MessageCircle size={24} />
        </div>

        <div
          onClick={() => console.log('Curtir')}
          style={buttonStyle}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)')}
        >
          <Heart size={24} />
        </div>
      </div>

      {/* Play/Pause central */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 3,
          color: '#fff',
          cursor: 'pointer',
        }}
        onClick={togglePlayPause}
      >
        {isBuffering ? (
          <Loader2 size={36} className="animate-spin" />
        ) : isPlaying ? (
          <Pause size={36} color="transparent" />
        ) : (
          <Play size={36} color="#fff" />
        )}
      </div>

      {/* Botão refresh */}
      <div
        style={{
          position: 'absolute',
          bottom: 30,
          right: 20,
          zIndex: 3,
          color: '#fff',
          cursor: 'pointer',
        }}
        onClick={onRefreshVideo}
      >
        <Dice5 size={28} />
      </div>
    </div>
  )
}
