'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

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
    limitedVideos.forEach((_, idx) => {
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
        vidEl.pause()
        vidEl.currentTime = 0
      }
    })
  }, [hoveredIndex, limitedVideos])

  if (limitedVideos.length === 0) {
    return <p>Carregando vídeos...</p>
  }

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl text-blue-600 dark:text-blue-400">Destaques</h2>
        {showSeeMoreButton && (
          <Link href="/todos-videos" className="text-sm text-blue-500 hover:underline">
            Ver todos
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {limitedVideos.map((video, idx) => (
          <div
            key={video.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden cursor-pointer"
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex((prev) => (prev === idx ? null : prev))}
          >
            <div className="w-full aspect-video bg-gray-300 dark:bg-gray-700 relative flex items-center justify-center">
              {hoveredIndex === idx && video.videoUrl ? (
                <video
                  ref={(el) => {
                    videoRefs.current[idx] = el
                  }}
                  src={video.videoUrl}
                  muted
                  className="w-full h-full object-cover"
                  playsInline
                />
              ) : video.thumbnailUrl ? (
                <Image
                  src={video.thumbnailUrl}
                  alt={`${video.artistSongName} thumbnail`}
                  className="w-full h-full object-cover"
                  width={400}
                  height={225}
                  unoptimized
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-500 text-sm">
                  Sem capa
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">
                {video.artistSongName}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                por {video.userName}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
