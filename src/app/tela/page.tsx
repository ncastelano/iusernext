'use client'

import React, { useEffect, useState, useRef } from 'react'
import { collection, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import Image from 'next/image'
import Link from 'next/link'
import { SegmentedProgressRing } from '@/app/components/SegmentedProgressRing'
import { Video } from 'types/video'

export default function TelaSimplificada() {
  const [video, setVideo] = useState<Video | null>(null)
  const [segmentColors, setSegmentColors] = useState<string[]>([])

  const [userVideosMap, setUserVideosMap] = useState<Map<string, Video[]>>(new Map())
  const [userList, setUserList] = useState<string[]>([])
  const [currentUserIndex, setCurrentUserIndex] = useState(0)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)

  const videoRef = useRef<HTMLVideoElement>(null)
  const touchStartX = useRef<number | null>(null)

  // Swipe handlers
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

  // Keyboard navigation
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
  }, [currentUserIndex, userList])

  // Gera cores com base nas flags
  function getSegmentColors(videos: Video[]): string[] {
    return videos.map(v => {
      if (v.isFlash) return 'limegreen'
      if (v.isPlace) return 'deepskyblue'
      if (v.isProduct) return 'gold'
      if (v.isStore) return 'magenta'
      return 'gray'
    })
  }

  // Quando um vídeo termina, avança e registra no Firestore
  async function handleVideoEnd() {
  const userID = userList[currentUserIndex]
  const videos = userVideosMap.get(userID) || []

  if (video && auth.currentUser?.uid) {
    try {
      const videoDocRef = doc(db, 'videos', video.videoID)
      await updateDoc(videoDocRef, {
        visaID: arrayUnion(auth.currentUser.uid),
      })
      console.log('visaID adicionado com sucesso')
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


  // Atualiza para um usuário e índice de vídeo
  function updateUserByIndex(userIndex: number, videoIndex: number = 0) {
    const userID = userList[userIndex]
    const videos = userVideosMap.get(userID) || []
    const selectedVideo = videos[videoIndex]

    setCurrentUserIndex(userIndex)
    setCurrentVideoIndex(videoIndex)
    setVideo(selectedVideo)
    setSegmentColors(getSegmentColors(videos))
  }

  // Carrega vídeos do Firestore
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

        // primeira carga
        const firstUser = sortedUsers[0]
        const firstVids = grouped.get(firstUser) || []
        setCurrentUserIndex(0)
        setCurrentVideoIndex(0)
        setVideo(firstVids[0])
        setSegmentColors(getSegmentColors(firstVids))
      } catch (err) {
        console.error(err)
      }
    }
    fetchData()
  }, [])

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ width: '100vw', height: '100vh', position: 'relative', backgroundColor: '#000' }}
    >
      {video && (
        <video
          ref={videoRef}
          src={video.videoUrl}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          muted
          autoPlay
          loop={false}
          playsInline
          onEnded={handleVideoEnd}
        />
      )}

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
