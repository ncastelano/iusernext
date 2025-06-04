'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import VideoCard from '@/app/components/VideoCard'

type Video = {
  id: string
  videoUrl?: string
  thumbnailUrl?: string
  artistSongName: string
  userName: string
}

type DestaquesProps = {
  videos: Video[]
  limit?: number
  showSeeMoreButton?: boolean
}

export default function Destaques({
  videos,
  limit = 5,
  showSeeMoreButton = false,
}: DestaquesProps) {
  const limitedVideos = videos.slice(0, limit)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

  useEffect(() => {
    videoRefs.current.forEach((videoEl, idx) => {
      if (!videoEl) return

      if (hoveredIndex === idx && videoEl.src) {
        videoEl.currentTime = 0
        videoEl.muted = true
        videoEl.play().catch((err) => {
          if (
            !err.message.includes(
              'interrupted because video-only background media'
            )
          ) {
            console.error('Erro ao reproduzir vídeo:', err)
          }
        })
      } else {
        videoEl.pause()
        videoEl.currentTime = 0
      }
    })
  }, [hoveredIndex])

  if (limitedVideos.length === 0) {
    return <p>Carregando vídeos...</p>
  }

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl text-blue-600 dark:text-blue-400">Destaques</h2>
        {showSeeMoreButton && (
          <Link
            href="/todos-videos"
            className="text-sm text-blue-500 hover:underline"
          >
            Ver todos
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {limitedVideos.map((video, idx) => (
          <VideoCard
            key={video.id}
            video={video}
            index={idx}
            isHovered={hoveredIndex === idx}
            onHoverStart={() => setHoveredIndex(idx)}
            onHoverEnd={() => setHoveredIndex(null)}
            videoRef={(el) => (videoRefs.current[idx] = el)}
          />
        ))}
      </div>
    </section>
  )
}
