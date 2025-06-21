'use client'

import React, { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'
import RandomVideo from 'src/app/components/RandomVideo'
import DistanceOrLocation from 'src/app/components/DistanceOrLocation'
import NextProfileVideo from 'src/app/components/NextProfileVideo'
import TimeAgoCustom from 'src/app/components/TimeAgoCustom'
import { Video } from 'types/video'

export default function TelaInicio() {
  const [randomVideo, setRandomVideo] = useState<Video | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)

  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [distance, setDistance] = useState<number | null>(null)

  function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const toRad = (x: number) => (x * Math.PI) / 180
    const R = 6371
    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      position => {
        setUserLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        })
      },
      error => {
        console.error('Erro ao obter localização:', error)
      }
    )
  }, [])

  useEffect(() => {
    if (userLocation && randomVideo) {
      const dist = haversineDistance(
        userLocation.lat,
        userLocation.lon,
        randomVideo.latitude,
        randomVideo.longitude
      )
      setDistance(dist)
    }
  }, [userLocation, randomVideo])

  async function fetchVideos() {
    setIsLoading(true)
    try {
      const snapshot = await getDocs(collection(db, 'videos'))
      const vids = snapshot.docs.map(doc => doc.data() as Video)
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

  function toggleMute() {
    setIsMuted(prev => !prev)
  }

  function handleRefreshVideo() {
    if (videos.length === 0 || !randomVideo) return

    setIsLoading(true)

    setTimeout(() => {
      const differentUserVideos = videos.filter(
        v => v.userID !== randomVideo.userID && v.videoID !== randomVideo.videoID
      )

      let nextVideo: Video | null = null

      if (differentUserVideos.length > 0) {
        const randomIndex = Math.floor(Math.random() * differentUserVideos.length)
        nextVideo = differentUserVideos[randomIndex]
      } else {
        const otherVideos = videos.filter(v => v.videoID !== randomVideo.videoID)
        if (otherVideos.length > 0) {
          const randomIndex = Math.floor(Math.random() * otherVideos.length)
          nextVideo = otherVideos[randomIndex]
        } else {
          nextVideo = randomVideo
        }
      }

      setRandomVideo(nextVideo)
      setIsPlaying(false)
      setIsMuted(true)
      setIsLoading(false)
    }, 800)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', margin: 0, padding: 0, backgroundColor: '#000' }}>
      <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 100px)', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        {/* RandomVideo Component */}
        <RandomVideo
          video={randomVideo}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          onRefreshVideo={handleRefreshVideo}
        />

        {/* Overlay de info topo esquerda */}
        <div style={{ position: 'absolute', top: 10, left: 20, zIndex: 3, color: '#fff', fontSize: 16, fontWeight: 'bold', textShadow: '0 0 6px black', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {randomVideo && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', border: '4px solid green', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', border: '4px solid rgba(255, 255, 255, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={randomVideo.userProfileImage} alt={`${randomVideo.userName} profile`} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 'bold', fontSize: 20 }}>{randomVideo.userName}</span>
                  <span style={{ fontWeight: 'normal', fontSize: 12, opacity: 0.7 }}>
                    <TimeAgoCustom timestamp={randomVideo.publishedDateTime} />
                  </span>
                </div>
              </div>

              <DistanceOrLocation
                latitude={randomVideo.latitude}
                longitude={randomVideo.longitude}
                distance={distance}
              />

              <span style={{ fontSize: 14 }}>{randomVideo.artistSongName}</span>
            </>
          )}
        </div>

        {/* Botão "Próximo vídeo do mesmo usuário" */}
        <div style={{ position: 'absolute', bottom: 30, left: 20, zIndex: 3 }}>
          <NextProfileVideo
            videos={videos}
            currentVideo={randomVideo}
            onNextVideo={video => {
              setRandomVideo(video)
              setIsPlaying(false)
              setIsMuted(true)
            }}
          />
        </div>
      </div>
    </div>
  )
}
