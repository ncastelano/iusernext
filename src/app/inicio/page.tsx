'use client'

import React, { useEffect, useState, useRef } from 'react'
import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'
import { Dice5, Play, Pause, Volume, VolumeX, Loader2 } from 'lucide-react'

type Video = {
  videoID: string
  userProfileImage: string
  userName: string
  userID: string
  thumbnailUrl: string
  publishedDateTime: number
  latitude: number
  longitude: number
  artistSongName: string
  isFlash: boolean
  isPlace: boolean
  isStore: boolean
  videoUrl?: string
}

export default function TelaInicio() {
  const [randomVideo, setRandomVideo] = useState<Video | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isBuffering, setIsBuffering] = useState(false)

  const [windowWidth, setWindowWidth] = useState<number>(0)
  const [windowHeight, setWindowHeight] = useState<number>(0)

  const videoRef = useRef<HTMLVideoElement>(null)
  const [autoPlayDelay, setAutoPlayDelay] = useState(2000)
  const autoplayAttemptTimeout = useRef<number | null>(null)

  async function fetchVideos() {
    setIsLoading(true)
    try {
      const videosSnapshot = await getDocs(collection(db, 'videos'))
      const vids = videosSnapshot.docs.map(doc => doc.data() as Video)
      setVideos(vids)
      if (vids.length > 0) {
        const randomIndex = Math.floor(Math.random() * vids.length)
        setRandomVideo(vids[randomIndex])
      } else {
        setRandomVideo(null)
      }
    } catch (error) {
      console.error('Erro ao buscar vídeos:', error)
      setRandomVideo(null)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchVideos()
  }, [])

  // Atualiza largura e altura da tela
  useEffect(() => {
    function updateWindowSize() {
      setWindowWidth(window.innerWidth)
      setWindowHeight(window.innerHeight)
    }
    updateWindowSize()
    window.addEventListener('resize', updateWindowSize)
    return () => window.removeEventListener('resize', updateWindowSize)
  }, [])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted
      if (!isPlaying) {
        videoRef.current.pause()
      }
    }
  }, [isMuted, randomVideo])

  function tryAutoplay(delay: number) {
    if (!videoRef.current) return

    autoplayAttemptTimeout.current = window.setTimeout(async () => {
      try {
        await videoRef.current!.play()
        setIsPlaying(true)
        if (autoplayAttemptTimeout.current) {
          clearTimeout(autoplayAttemptTimeout.current)
          autoplayAttemptTimeout.current = null
        }
        setAutoPlayDelay(2000)
      } catch {
        setAutoPlayDelay((oldDelay) => {
          const newDelay = oldDelay * 2
          tryAutoplay(newDelay)
          return newDelay
        })
      }
    }, delay)
  }

  useEffect(() => {
    if (randomVideo?.videoUrl) {
      setIsPlaying(false)
      setIsBuffering(true)
      tryAutoplay(2000)
    }
  }, [randomVideo])

  function togglePlayPause() {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true)
      }).catch(() => {
        setIsPlaying(false)
      })
    }
  }

  function toggleMute() {
    setIsMuted((prev) => !prev)
  }

  function handleRefreshVideo() {
    if (videos.length === 0) return
    setIsLoading(true)

    if (autoplayAttemptTimeout.current) {
      clearTimeout(autoplayAttemptTimeout.current)
      autoplayAttemptTimeout.current = null
    }
    setAutoPlayDelay(2000)
    setIsBuffering(false)

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * videos.length)
      setRandomVideo(videos[randomIndex])
      setIsPlaying(false)
      setIsMuted(true)
      setIsLoading(false)
    }, 800)
  }

  function handleWaiting() {
    setIsBuffering(true)
  }

  function handlePlaying() {
    setIsBuffering(false)
    setIsPlaying(true)
  }

  return (
    <div
      style={{
        backgroundColor: '#000',
        color: 'rgb(255, 255, 255)', // branco
        height: '100vh',
        padding: '100px 50px 200px',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      {/* Exibir largura e altura da tela no canto superior direito */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          color: 'white',
          fontSize: 14,
          fontWeight: 'bold',
          backgroundColor: 'rgba(0,0,0,0.4)',
          padding: '4px 8px',
          borderRadius: 8,
          userSelect: 'none',
          display: 'flex',
          gap: 12,
        }}
      >
        <div>Largura: {windowWidth}px</div>
        <div>Altura: {windowHeight}px</div>
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          borderRadius: '20px',
          padding: '20px 1px',
          textAlign: 'center',
          border: '1px solid rgb(0, 0, 0)',
          fontSize: '24px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '420px',
          boxSizing: 'border-box',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {randomVideo ? (
          <>
            {/* Título */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                padding: '10px 10px',
                color: '#fff',
                fontSize: '16px',
                fontWeight: 'bold',
                borderTopLeftRadius: '20px',
                borderTopRightRadius: '20px',
                textAlign: 'left',
                zIndex: 10,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={`${randomVideo.artistSongName} - ${randomVideo.userName}`}
            >
              {randomVideo.artistSongName} - {randomVideo.userName}
            </div>

            {/* Mostrar thumbnail enquanto carrega */}
            {isLoading && randomVideo.thumbnailUrl ? (
              <img
                src={randomVideo.thumbnailUrl}
                alt="Thumbnail"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '20px',
                  marginTop: '30px',
                }}
              />
            ) : (
              <div style={{ marginTop: '30px', width: '100%', height: '100%', position: 'relative' }}>
                <video
                  ref={videoRef}
                  src={randomVideo.videoUrl}
                  controls={false}
                  muted={isMuted}
                  onWaiting={handleWaiting}
                  onPlaying={handlePlaying}
                  style={{
                    borderRadius: '20px',
                    objectFit: 'cover',
                    width: '100%',
                    height: '100%',
                  }}
                />

                {/* Controles customizados */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 12,
                    left: 12,
                    display: 'flex',
                    gap: 12,
                    zIndex: 20,
                  }}
                >
                  <button
                    onClick={togglePlayPause}
                    title={isPlaying ? 'Pause' : 'Play'}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      border: '1px solid #222',
                      backgroundColor: 'black',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isBuffering ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : isPlaying ? (
                      <Pause size={20} />
                    ) : (
                      <Play size={20} />
                    )}
                  </button>

                  <button
                    onClick={toggleMute}
                    title={isMuted ? 'Unmute' : 'Mute'}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      border: '1px solid #222',
                      backgroundColor: 'black',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isMuted ? <VolumeX size={20} /> : <Volume size={20} />}
                  </button>
                </div>
              </div>
            )}

            {/* Botão do dado no canto inferior direito */}
            <button
              onClick={handleRefreshVideo}
              title="Vídeo aleatório"
              style={{
                position: 'absolute',
                bottom: 12,
                right: 12,
                width: 44,
                height: 44,
                borderRadius: '50%',
                border: '1px solid #222',
                backgroundColor: 'black',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
                zIndex: 100,
                transition: 'background-color 0.2s ease, transform 0.2s ease',
              }}
              onMouseEnter={e =>
                (e.currentTarget.style.backgroundColor = '#111')
              }
              onMouseLeave={e =>
                (e.currentTarget.style.backgroundColor = 'black')
              }
            >
              <Dice5 size={20} color="white" />
            </button>
          </>
        ) : (
          <p>Nenhum vídeo disponível</p>
        )}
      </div>
    </div>
  )
}
