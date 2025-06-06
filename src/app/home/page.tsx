'use client'

import { useEffect, useRef, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

type Video = {
  id: string
  videoUrl?: string
  artistSongName: string
  userName: string
}

export default function HomePage() {
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const [bgColor, setBgColor] = useState('#ff0000')
  const [videos, setVideos] = useState<Video[]>([])
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    function updateSize() {
      const newWidth = window.innerWidth
      const newHeight = window.innerHeight

      setWidth(newWidth)
      setHeight(newHeight)
      setBgColor(newWidth > 980 ? '#FFD700' : '#FF0000')
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  useEffect(() => {
    async function fetchVideos() {
      try {
        const querySnapshot = await getDocs(collection(db, 'videos'))
        const data: Video[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Video[]
        setVideos(data)
      } catch (error) {
        console.error('Erro ao buscar vídeos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [])

  useEffect(() => {
    videos.forEach((_, idx) => {
      const vidEl = videoRefs.current[idx]
      if (!vidEl) return

      if (hoveredIndex === idx && vidEl.src) {
        vidEl.currentTime = 0
        vidEl.muted = true
        vidEl.play().catch((err) => {
          if (
            !err.message.includes(
              'interrupted because video-only background media'
            )
          ) {
            console.error('Erro ao reproduzir vídeo:', err)
          }
        })
      } else {
        vidEl?.pause()
        if (vidEl) vidEl.currentTime = 0
      }
    })
  }, [hoveredIndex, videos])

  return (
    <main
      style={{
        padding: '32px 16px',
        backgroundColor: bgColor,
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif',
        color: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        transition: 'background-color 0.3s ease',
        overflowX: 'hidden', // impede scroll horizontal geral
      }}
    >
      <h1 style={{ marginBottom: 24 }}>📏 Dimensões da Tela</h1>
      <p style={{ fontSize: 20, marginBottom: 8 }}>
        <strong>Largura:</strong> {width}px
      </p>
      <p style={{ fontSize: 20 }}>
        <strong>Altura:</strong> {height}px
      </p>

      <section className="px-4 py-6 w-full max-w-screen">
        <h2 className="text-xl text-white text-center mb-4">🎬 Todos os Vídeos</h2>

        {loading ? (
          <p className="p-4 text-white">Carregando vídeos...</p>
        ) : (
          <div className="flex overflow-x-auto gap-4 video-scrollbar w-full max-w-full min-w-0 px-2">
            {videos.map((video, idx) => (
              <div
                key={video.id}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex((prev) => (prev === idx ? null : prev))}
                className="video-card relative bg-black rounded-lg overflow-hidden shadow-md shrink-0 border border-gray-700 hover:shadow-xl transition-shadow"
              >
                <video
                  ref={(el) => {
                    videoRefs.current[idx] = el
                  }}
                  src={video.videoUrl}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                  preload="metadata"
                  loop
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                  <p className="text-white text-xs text-center truncate">{video.artistSongName}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <style jsx>{`
          .video-scrollbar::-webkit-scrollbar {
            height: 8px;
          }

          .video-scrollbar::-webkit-scrollbar-track {
            background: #000;
          }

          .video-scrollbar::-webkit-scrollbar-thumb {
            background-color: #777;
            border-radius: 8px;
          }

          .video-scrollbar::-webkit-scrollbar-thumb:hover {
            background-color: #aaa;
          }

          .video-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #777 #000;
          }

          .video-card {
            width: 160px;
            aspect-ratio: 9 / 16;
          }

          @media (max-width: 982px) {
            .video-card {
              width: 200px;
              aspect-ratio: 9 / 16;
            }
          }

          @media (max-width: 500px) {
            .video-card {
              width: 110px;
              aspect-ratio: 9 / 16;
            }
          }
        `}</style>
      </section>
    </main>
  )
}
