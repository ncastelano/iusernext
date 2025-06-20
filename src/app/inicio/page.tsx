'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'
import { Dice5, Play, Pause, Volume, VolumeX, Loader2 } from 'lucide-react'
import Image from 'next/image'

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
  const [isBuffering, setIsBuffering] = useState(false) // controla o loading do video

  const videoRef = useRef<HTMLVideoElement>(null)
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

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted
      if (!isPlaying) {
        videoRef.current.pause()
      }
    }
  }, [isMuted, randomVideo, isPlaying])

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
        // dobra o delay e tenta de novo
        tryAutoplay(delay * 2)
      }
    }, delay)
  }, [])

  useEffect(() => {
    if (randomVideo?.videoUrl) {
      setIsPlaying(false)
      setIsBuffering(true)
      tryAutoplay(2000)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [randomVideo])

  function togglePlayPause() {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true)
        })
        .catch(() => {
          setIsPlaying(false)
        })
    }
  }

  function toggleMute() {
    setIsMuted(prev => !prev)
  }

  function handleRefreshVideo() {
    if (videos.length === 0) return
    setIsLoading(true)

    if (autoplayAttemptTimeout.current) {
      clearTimeout(autoplayAttemptTimeout.current)
      autoplayAttemptTimeout.current = null
    }
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

  // Para mostrar largura e altura da tela no canto superior direito
  const [windowWidth, setWindowWidth] = useState(0)
  const [windowHeight, setWindowHeight] = useState(0)

  useEffect(() => {
    function updateSize() {
      setWindowWidth(window.innerWidth)
      setWindowHeight(window.innerHeight)
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // Define altura do container conforme proporção da tela
  // Define altura e largura do container conforme proporção da tela
const containerHeight =
  windowHeight > windowWidth ? windowHeight * 0.8 : 420

const containerWidth =
  windowHeight > windowWidth ? Math.min(windowWidth * 0.9, 600) : '100%'


  return (
    <div
      style={{
        backgroundColor: '#000',
        color: '#fff',
        height: '100vh',
        padding: '100px 50px 200px',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      {/* Largura e altura no canto superior direito */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          color: 'white',
          fontSize: 14,
          fontWeight: 'bold',
          textAlign: 'right',
          userSelect: 'none',
          zIndex: 110,
          lineHeight: 1.2,
          whiteSpace: 'nowrap',
        }}
      >
        <div>W: {windowWidth}px</div>
        <div>H: {windowHeight}px</div>
      </div>

      <div
  style={{
    width: containerWidth,
    maxWidth: '100%', // para garantir responsividade
    borderRadius: '20px',
    padding: '20px 1px',
    textAlign: 'center',
    border: '1px solid #222',
    fontSize: '24px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: containerHeight,
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
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  marginTop: '30px',
                  borderRadius: '20px',
                  overflow: 'hidden',
                }}
              >
                <Image
                  src={randomVideo.thumbnailUrl}
                  alt="Thumbnail"
                  fill
                  sizes="(max-width: 400px) 100vw, 400px"
                  style={{
                    objectFit: 'cover',
                    borderRadius: '20px',
                  }}
                  priority
                />
              </div>
            ) : (
              <div
                style={{
                  marginTop: '30px',
                  width: '100%',
                  height: '100%',
                  position: 'relative',
                }}
              >
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
                    {/* Se estiver carregando, mostra ampulheta animada */}
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
