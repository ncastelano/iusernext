'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { collection, getDocs, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import Image from 'next/image'
import Link from 'next/link'
import { SegmentedProgressRing } from '@/app/components/SegmentedProgressRing'
import { Video } from 'types/video'

export default function TelaSimplificada() {
  const [video, setVideo] = useState<Video | null>(null)
  const [segmentColors, setSegmentColors] = useState<string[]>([])
  const [isChecked, setIsChecked] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)

  const [userVideosMap, setUserVideosMap] = useState<Map<string, Video[]>>(new Map())
  const [userList, setUserList] = useState<string[]>([])
  const [currentUserIndex, setCurrentUserIndex] = useState(0)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)

  const videoRef = useRef<HTMLVideoElement>(null)
  const touchStartX = useRef<number | null>(null)

  const getSegmentColors = useCallback((videos: Video[]): string[] => {
    return videos.map(v => {
      if (v.isFlash) return 'limegreen'
      if (v.isPlace) return 'deepskyblue'
      if (v.isProduct) return 'gold'
      if (v.isStore) return 'magenta'
      return 'gray'
    })
  }, [])

  const updateUserByIndex = useCallback(async (userIndex: number, videoIndex: number = 0) => {
    const userID = userList[userIndex]
    const videos = userVideosMap.get(userID) || []
    const selectedVideo = videos[videoIndex]

    setCurrentUserIndex(userIndex)
    setCurrentVideoIndex(videoIndex)
    setVideo(selectedVideo)
    setSegmentColors(getSegmentColors(videos))
    setVideoLoaded(false)
  }, [userList, userVideosMap, getSegmentColors])

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const diff = e.changedTouches[0].clientX - touchStartX.current

    if (Math.abs(diff) < 50) return

    if (diff > 0 && currentUserIndex > 0) {
      updateUserByIndex(currentUserIndex - 1)
    } else if (diff < 0 && currentUserIndex < userList.length - 1) {
      updateUserByIndex(currentUserIndex + 1)
    }

    touchStartX.current = null
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft' && currentUserIndex > 0) {
        updateUserByIndex(currentUserIndex - 1)
      }
      if (e.key === 'ArrowRight' && currentUserIndex < userList.length - 1) {
        updateUserByIndex(currentUserIndex + 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [currentUserIndex, userList, updateUserByIndex])

  const handleVideoEnd = async () => {
    const userID = userList[currentUserIndex]
    const videos = userVideosMap.get(userID) || []

    if (video && auth.currentUser?.uid) {
      try {
        const videoDocRef = doc(db, 'videos', video.videoID)
        await updateDoc(videoDocRef, {
          visaID: arrayUnion(auth.currentUser.uid),
        })
        setIsChecked(true)
        setVideo(prev => prev ? {
          ...prev,
          visaID: [...(prev.visaID || []), auth.currentUser!.uid]
        } : null)
      } catch (err) {
        console.error('Erro ao adicionar visaID:', err)
      }
    }

    if (currentVideoIndex < videos.length - 1) {
      updateUserByIndex(currentUserIndex, currentVideoIndex + 1)
    } else if (currentUserIndex < userList.length - 1) {
      updateUserByIndex(currentUserIndex + 1, 0)
    }
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

  // ✅ Atualiza isChecked em tempo real sempre que video muda
  useEffect(() => {
    async function updateCheckStatus() {
      if (!video || !auth.currentUser) return

      try {
        const latestDoc = await getDoc(doc(db, 'videos', video.videoID))
        const latestData = latestDoc.data() as Video
        const isInVisaID = latestData.visaID?.includes(auth.currentUser.uid) ?? false
        setIsChecked(isInVisaID)
      } catch (err) {
        console.error('Erro ao verificar visaID:', err)
      }
    }

    updateCheckStatus()
  }, [video])

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
      }}
    >
      {/* Áreas clicáveis para navegação */}
      <div onClick={() => {
      
        if (currentVideoIndex > 0) {
          updateUserByIndex(currentUserIndex, currentVideoIndex - 1)
        } else if (currentUserIndex > 0) {
          const prevUserVideos = userVideosMap.get(userList[currentUserIndex - 1]) || []
          updateUserByIndex(currentUserIndex - 1, prevUserVideos.length - 1)
        } else {
          alert('Não há mais vídeos disponíveis para voltar.')
        }
      }} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '50%', zIndex: 1 }} />

      <div onClick={() => {
        const videos = userVideosMap.get(userList[currentUserIndex]) || []
        if (currentVideoIndex < videos.length - 1) {
          updateUserByIndex(currentUserIndex, currentVideoIndex + 1)
        } else if (currentUserIndex < userList.length - 1) {
          updateUserByIndex(currentUserIndex + 1, 0)
        } else {
          alert('Não há mais vídeos disponíveis para ver.')
        }
      }} style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '50%', zIndex: 1 }} />

      {/* Thumbnail + loading enquanto vídeo carrega */}
      {video && !videoLoaded && video.thumbnailUrl && (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <Image src={video.thumbnailUrl} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} fill priority />
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

      {/* Vídeo */}
      {video && (
        <video
          ref={videoRef}
          src={video.videoUrl}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: videoLoaded ? 'block' : 'none' }}
          muted
          autoPlay
          loop={false}
          playsInline
          onEnded={handleVideoEnd}
          onCanPlay={() => setVideoLoaded(true)}
        />
      )}

      {/* ✅ Botão de Check sempre visível */}
      {video && (
  <button
    onClick={async () => {
      if (!auth.currentUser || !video) return

      const uid = auth.currentUser.uid
      const videoDocRef = doc(db, 'videos', video.videoID)

      try {
        const currentVisaID = video.visaID ?? []

        if (currentVisaID.includes(uid)) {
          // ✅ Se já está no visaID, remove
          const updatedVisaID = currentVisaID.filter(id => id !== uid)
          await updateDoc(videoDocRef, { visaID: updatedVisaID })

          setIsChecked(false)
          setVideo(prev =>
            prev ? { ...prev, visaID: updatedVisaID } : null
          )
        } else {
          // ✅ Se não está, adiciona
          await updateDoc(videoDocRef, {
            visaID: arrayUnion(uid),
          })

          setIsChecked(true)
          setVideo(prev =>
            prev ? { ...prev, visaID: [...currentVisaID, uid] } : null
          )
        }
      } catch (err) {
        console.error('Erro ao atualizar visaID:', err)
      }
    }}
    style={{
      position: 'absolute',
      top: 20,
      right: 20,
      zIndex: 3,
      background: 'transparent',
      border: 'none',
      fontSize: 28,
      color: isChecked ? 'limegreen' : 'white',
      cursor: 'pointer',
      transition: 'color 0.2s ease-in-out',
    }}
  >
    {isChecked ? '✔️' : '☐'}
  </button>
)}


      {/* Anel de progresso + avatar */}
      {video && (
        <div
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
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
      )}
    </div>
  )
}
