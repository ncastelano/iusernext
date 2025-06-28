'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Image from 'next/image'
import Link from 'next/link'
import { SegmentedProgressRing } from '@/app/components/SegmentedProgressRing'
import { Video } from 'types/video'
import { motion, AnimatePresence } from 'framer-motion'

export default function TelaSimplificada() {
  const [video, setVideo] = useState<Video | null>(null)
  const [prevVideo, setPrevVideo] = useState<Video | null>(null)
  const [segmentColors, setSegmentColors] = useState<string[]>([])
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | 'down' | null>(null)

  const [userVideosMap, setUserVideosMap] = useState<Map<string, Video[]>>(new Map())
  const [userList, setUserList] = useState<string[]>([])
  const [currentUserIndex, setCurrentUserIndex] = useState(0)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)

  const videoRef = useRef<HTMLVideoElement>(null)
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  // Controle de tempo do vídeo
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const getSegmentColors = useCallback((videos: Video[]): string[] => {
    return videos.map(v => {
      if (v.isFlash) return 'limegreen'
      if (v.isPlace) return 'deepskyblue'
      if (v.isProduct) return 'gold'
      if (v.isStore) return 'magenta'
      return 'gray'
    })
  }, [])

  const updateUserByIndex = useCallback(
    (userIndex: number, videoIndex: number = 0, direction: 'left' | 'right' | 'up' | 'down' | null = null) => {
      const userID = userList[userIndex]
      const videos = userVideosMap.get(userID) || []
      const selectedVideo = videos[videoIndex]

      setPrevVideo(video)
      setSwipeDirection(direction)
      setCurrentUserIndex(userIndex)
      setCurrentVideoIndex(videoIndex)
      setVideo(selectedVideo)
      setSegmentColors(getSegmentColors(videos))
      setVideoLoaded(false)

      // Resetar tempo ao mudar vídeo
      setCurrentTime(0)
      setDuration(0)
    },
    [userList, userVideosMap, getSegmentColors, video]
  )

  function handleTouchStart(e: React.TouchEvent) {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (!touchStart.current) return

    const dx = e.changedTouches[0].clientX - touchStart.current.x
    const dy = e.changedTouches[0].clientY - touchStart.current.y
    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)
    const SWIPE_THRESHOLD = 50

    if (absDx > absDy && absDx > SWIPE_THRESHOLD) {
      // Horizontal
      if (dx > 0 && currentVideoIndex > 0) {
        updateUserByIndex(currentUserIndex, currentVideoIndex - 1, 'right')
      } else if (dx < 0) {
        const videos = userVideosMap.get(userList[currentUserIndex]) || []
        if (currentVideoIndex < videos.length - 1) {
          updateUserByIndex(currentUserIndex, currentVideoIndex + 1, 'left')
        } else if (currentUserIndex < userList.length - 1) {
          updateUserByIndex(currentUserIndex + 1, 0, 'left')
        }
      }
    } else if (absDy > absDx && absDy > SWIPE_THRESHOLD) {
      // Vertical
      if (dy < 0 && currentUserIndex < userList.length - 1) {
        updateUserByIndex(currentUserIndex + 1, 0, 'up')
      } else if (dy > 0 && currentUserIndex > 0) {
        updateUserByIndex(currentUserIndex - 1, 0, 'down')
      }
    }

    touchStart.current = null
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft' && currentVideoIndex > 0) {
        updateUserByIndex(currentUserIndex, currentVideoIndex - 1, 'right')
      }
      if (e.key === 'ArrowRight') {
        const videos = userVideosMap.get(userList[currentUserIndex]) || []
        if (currentVideoIndex < videos.length - 1) {
          updateUserByIndex(currentUserIndex, currentVideoIndex + 1, 'left')
        } else if (currentUserIndex < userList.length - 1) {
          updateUserByIndex(currentUserIndex + 1, 0, 'left')
        }
      }
      if (e.key === 'ArrowUp' && currentUserIndex > 0) {
        updateUserByIndex(currentUserIndex - 1, 0, 'down')
      }
      if (e.key === 'ArrowDown' && currentUserIndex < userList.length - 1) {
        updateUserByIndex(currentUserIndex + 1, 0, 'up')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentUserIndex, currentVideoIndex, userList, userVideosMap, updateUserByIndex])

  const handleVideoEnd = () => {
    const videos = userVideosMap.get(userList[currentUserIndex]) || []
    if (currentVideoIndex < videos.length - 1) {
      updateUserByIndex(currentUserIndex, currentVideoIndex + 1, 'left')
    } else if (currentUserIndex < userList.length - 1) {
      updateUserByIndex(currentUserIndex + 1, 0, 'up')
    }
  }

  // Atualiza currentTime conforme vídeo toca
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  // Continua como fallback para garantir duração correta
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  // Formatar tempo em mm:ss
  function formatTime(seconds: number) {
    if (isNaN(seconds)) return '0:00'
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const snapshot = await getDocs(collection(db, 'videos'))
        const allVideos = snapshot.docs
          .map(doc => doc.data() as Video)
          .filter(v => v.publishedDateTime && v.videoUrl && v.userID)

        const grouped = new Map<string, Video[]>()
        for (const vid of allVideos) {
          if (!grouped.has(vid.userID)) grouped.set(vid.userID, [])
          grouped.get(vid.userID)!.push(vid)
        }

        for (const [uid, vids] of grouped.entries()) {
          grouped.set(uid, vids.sort((a, b) => b.publishedDateTime! - a.publishedDateTime!))
        }

        const sortedUsers = Array.from(grouped.entries())
          .sort(([, a], [, b]) => b[0].publishedDateTime! - a[0].publishedDateTime!)
          .map(([uid]) => uid)

        setUserVideosMap(grouped)
        setUserList(sortedUsers)

        const firstUser = sortedUsers[0]
        const firstVids = grouped.get(firstUser) || []
        setCurrentUserIndex(0)
        setCurrentVideoIndex(0)
        setVideo(firstVids[0])
        setSegmentColors(getSegmentColors(firstVids))
        setVideoLoaded(false)
      } catch (err) {
        console.error(err)
      }
    }

    fetchData()
  }, [getSegmentColors])

  // *** NOVO: carrega duration antes do vídeo estar pronto ***
  useEffect(() => {
    if (!video || !video.videoUrl) return

    const tempVideo = document.createElement('video')
    tempVideo.src = video.videoUrl
    tempVideo.preload = 'metadata'
    tempVideo.onloadedmetadata = () => {
      setDuration(tempVideo.duration)
    }

    return () => {
      tempVideo.src = ''
    }
  }, [video])

  // --------- Lazy loading: pre-carrega o próximo vídeo -----------
  const nextVideo =
    userList.length > 0 && userVideosMap.size > 0
      ? (() => {
          const videos = userVideosMap.get(userList[currentUserIndex]) || []
          if (currentVideoIndex < videos.length - 1) {
            return videos[currentVideoIndex + 1]
          } else if (currentUserIndex < userList.length - 1) {
            const nextUserVideos = userVideosMap.get(userList[currentUserIndex + 1]) || []
            return nextUserVideos[0] || null
          }
          return null
        })()
      : null

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        backgroundColor: '#000',
        overflow: 'hidden',
        touchAction: 'none',
      }}
    >
      {/* Thumbnail + loading */}
      {video && !videoLoaded && video.thumbnailUrl && (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <Image
            src={video.thumbnailUrl}
            alt="Thumbnail"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            fill
            priority
          />
          <Image
            src="/loading100px.svg"
            alt="Loading"
            width={300}
            height={300}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 10,
              opacity: 0.8,
            }}
            priority
          />
        </div>
      )}

      {/* Vídeo com animação */}
      <AnimatePresence mode="wait">
        {video && (
          <motion.video
            key={video.videoUrl}
            ref={videoRef}
            src={video.videoUrl}
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
            onEnded={handleVideoEnd}
            onCanPlay={() => {
              setVideoLoaded(true)
              videoRef.current?.play()
            }}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
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
        )}
      </AnimatePresence>

      {/* Pré-carrega próximo vídeo (lazy loading) */}
      {nextVideo && (
        <video
          src={nextVideo.videoUrl}
          preload="auto"
          style={{ display: 'none' }}
          muted
          // só pré-carregar, não toca
        />
      )}

      {/* Progresso + avatar */}
      {video && (
        <>
          <div
            style={{
              position: 'absolute',
              bottom: 10,
              right: 20,
              width: 72,
              height: 72,
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SegmentedProgressRing
              segments={segmentColors.length}
              radius={36}
              strokeWidth={4}
              colors={segmentColors}
              activeIndex={currentVideoIndex}
            />
            <Link
              href={`/${video.userName}`}
              style={{
                display: 'block',
                width: 60,
                height: 60,
                borderRadius: '50%',
                overflow: 'hidden',
                position: 'relative',
                zIndex: 2,
              }}
            >
              <Image
                src={video.userProfileImage || '/default-profile.png'}
                alt="Perfil"
                fill
                style={{ objectFit: 'cover', borderRadius: '50%' }}
              />
            </Link>
          </div>

          {/* Controle de tempo (slider + tempo) */}
          <div
            style={{
              position: 'absolute',
              bottom: 100,
              left: 20,
              right: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              zIndex: 10,
              color: 'white',
              userSelect: 'none',
            }}
          >
            <span style={{ minWidth: 40, textAlign: 'right', fontFamily: 'monospace', fontSize: 14 }}>
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={e => {
                const val = Number(e.target.value)
                setCurrentTime(val)
                if (videoRef.current) videoRef.current.currentTime = val
              }}
              step={0.1}
              style={{ flexGrow: 1 }}
            />
            <span style={{ minWidth: 40, textAlign: 'left', fontFamily: 'monospace', fontSize: 14 }}>
              {formatTime(duration)}
            </span>
          </div>
        </>
      )}
    </div>
  )
}
