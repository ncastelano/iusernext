'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'

type Video = {
  id: string
  videoUrl: string
  artistSongName: string
  userName: string
}

type DestaquesProps = {
  videos: Video[]
  limit?: number
  showSeeMoreButton?: boolean
}

export default function Destaques({ videos, limit = 5, showSeeMoreButton = false }: DestaquesProps) {
  const videosToShow = limit ? videos.slice(0, limit) : videos

  return (
    <section className="mb-8">
      <h2 className="text-xl mb-4 text-blue-600 dark:text-blue-400">Destaques</h2>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6">
        {videosToShow.map((video) => (
          <VideoPlayer key={video.id} video={video} />
        ))}
      </div>

      {showSeeMoreButton && (
        <div className="mt-8 text-center">
          <Link href="/destaques">
            <button className="px-6 py-3 text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Ver mais destaques
            </button>
          </Link>
        </div>
      )}
    </section>
  )
}

function VideoPlayer({ video }: { video: Video }) {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    if (videoRef.current) {
      // autoplay muted
      videoRef.current.muted = true
      videoRef.current.play().catch(() => {
        // autoplay pode falhar dependendo do navegador
      })
    }
  }, [])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
      <div className="w-full aspect-video bg-gray-300 dark:bg-gray-700 relative">
        <video
          ref={videoRef}
          src={video.videoUrl}
          muted
          loop
          className="w-full h-full object-cover"
          playsInline
        />
      </div>
      <div className="p-4">
        <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">
          {video.artistSongName}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">por {video.userName}</p>
      </div>
    </div>
  )
}
