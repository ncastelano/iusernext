'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Destaques from '@/app/components/Destaques'
import { Video } from 'types/video'
import Image from 'next/image'

export default function TelaAzul() {
  const [videos, setVideos] = useState<Video[]>([])

  useEffect(() => {
    async function fetchVideos() {
      const querySnapshot = await getDocs(collection(db, 'videos'))
      const fetchedVideos: Video[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        fetchedVideos.push({
          id: doc.id,
          videoUrl: data.videoUrl || '',
          thumbnailUrl: data.thumbnailUrl || '',
          artistSongName: data.artistSongName || '',
          userName: data.userName || '',
        })
      })
      setVideos(fetchedVideos)
    }

    fetchVideos()
  }, [])

  const populares = videos.filter((_, i) => i % 2 === 0)
  const novos = videos.filter((_, i) => i % 2 !== 0)

  return (
    <main className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen p-8">
      <h1 className="text-2xl mb-6">Vitrine de Vídeos</h1>

      <Destaques videos={videos} limit={5} showSeeMoreButton />

      <section className="mb-8">
        <h2 className="text-xl mb-4 text-blue-600 dark:text-blue-400">Populares</h2>
        <VideoGrid videos={populares} />
      </section>

      <section>
        <h2 className="text-xl mb-4 text-blue-600 dark:text-blue-400">Novos</h2>
        <VideoGrid videos={novos} />
      </section>
    </main>
  )
}

function VideoGrid({ videos }: { videos: Video[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6">
      {videos.map((video) => (
        <div
          key={video.id}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
        >
          <div className="w-full aspect-video bg-gray-300 dark:bg-gray-700 relative">
            {video.thumbnailUrl ? (
              <Image
                src={video.thumbnailUrl}
                alt={video.artistSongName}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 320px"
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
            <p className="text-sm text-gray-600 dark:text-gray-400">por {video.userName}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
