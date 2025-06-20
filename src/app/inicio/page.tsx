'use client'

import React, { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'

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

  useEffect(() => {
    async function fetchRandomVideo() {
      try {
        const videosSnapshot = await getDocs(collection(db, 'videos'))
        const videos = videosSnapshot.docs.map(doc => doc.data() as Video)

        if (videos.length === 0) {
          setRandomVideo(null)
          return
        }

        const randomIndex = Math.floor(Math.random() * videos.length)
        setRandomVideo(videos[randomIndex])
      } catch (error) {
        console.error('Erro ao buscar vídeos:', error)
      }
    }

    fetchRandomVideo()
  }, [])

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
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          //backgroundColor: 'rgb(0, 0, 0)',
          borderRadius: '20px',
          padding: '20px 1px',
          textAlign: 'center',
          //boxShadow: '0 8px 24px rgba(255, 255, 255, 0.15)',
          border: '1px solid #222',
          fontSize: '24px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '420px',
          boxSizing: 'border-box',
          flexDirection: 'column',
          position: 'relative', // necessário para o stack
        }}
      >
        {randomVideo?.videoUrl ? (
          <>
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                padding: '10px 10px',
                //backgroundColor: 'rgba(0, 0, 0, 0.6)',
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

            <video
              src={randomVideo.videoUrl}
              controls
              width="100%"
              height="100%"
              style={{
                borderRadius: '20px',
                objectFit: 'cover',
                // para não ficar atrás do texto, dar um padding no topo do vídeo:
                paddingTop: '30px',
              }}
            />
          </>
        ) : (
          <p>Nenhum vídeo disponível</p>
        )}
      </div>
    </div>
  )
}
