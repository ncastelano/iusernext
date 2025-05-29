'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Destaques from 'src/app/components/Destaques'

type Video = {
  id: string
  thumbnailUrl?: string
  artistSongName: string
  userName: string
}

export default function DestaquesPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const router = useRouter()

  useEffect(() => {
    async function fetchVideos() {
      const querySnapshot = await getDocs(collection(db, 'videos'))
      const fetchedVideos: Video[] = []
      querySnapshot.forEach(doc => {
        const data = doc.data()
        fetchedVideos.push({
          id: doc.id,
          thumbnailUrl: data.thumbnailUrl,
          artistSongName: data.artistSongName,
          userName: data.userName,
        })
      })
      setVideos(fetchedVideos)
    }
    fetchVideos()
  }, [])

  return (
    <main className="p-8 bg-white text-black min-h-screen dark:bg-gray-900 dark:text-white">
      <h1 className="text-2xl font-bold mb-8">Todos os Destaques</h1>
      
      <Destaques videos={videos} limit={videos.length} />

      <div className="mt-8 text-center">
        <button
          onClick={() => router.back()}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg text-base hover:bg-blue-700 transition"
        >
          Ver menos
        </button>
      </div>
    </main>
  )
}
