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

export default function Flashs() {
  const [videos, setVideos] = useState<Video[]>([])
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const [loading, setLoading] = useState(true)

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

  if (loading) return <p className="p-4 text-white">Carregando vídeos...</p>

  return (
    <section className="px-4 py-6">
      <h2 className="text-xl text-white text-center mb-4">🎬 Todos os Vídeos</h2>

      <div className="flex overflow-x-auto gap-4 video-scrollbar">
        {videos.map((video, idx) => (
          <div
            key={video.id}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex((prev) => (prev === idx ? null : prev))}
            className="relative bg-black rounded-lg overflow-hidden shadow-md aspect-[9/16] w-40 shrink-0 border border-gray-700 hover:shadow-xl transition-shadow"
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

      {/* CSS da scrollbar aqui mesmo no componente */}
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
      `}</style>
    </section>
  )
}
