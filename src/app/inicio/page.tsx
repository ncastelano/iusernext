'use client'

import { useEffect, useState, useRef } from 'react'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Image from 'next/image'
import 'bootstrap/dist/css/bootstrap.min.css'

type Video = {
  id: string
  thumbnailUrl: string
  userProfileImage: string
  publishedDateTime: number
}

export default function InicioPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchVideos = async () => {
      const q = query(
        collection(db, 'videos'),
        where('publishedDateTime', '!=', null),
        orderBy('publishedDateTime', 'desc')
      )

      const snapshot = await getDocs(q)
      const fetchedVideos: Video[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Video[]

      setVideos(fetchedVideos)
    }

    fetchVideos()
  }, [])

  // Navegação touch horizontal
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let startX = 0
    let scrollLeft = 0

    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX
      scrollLeft = container.scrollLeft
    }

    const onTouchMove = (e: TouchEvent) => {
      const x = e.touches[0].clientX
      const walk = startX - x
      container.scrollLeft = scrollLeft + walk
    }

    container.addEventListener('touchstart', onTouchStart)
    container.addEventListener('touchmove', onTouchMove)

    return () => {
      container.removeEventListener('touchstart', onTouchStart)
      container.removeEventListener('touchmove', onTouchMove)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="d-flex flex-row overflow-auto vh-100"
      style={{ scrollSnapType: 'x mandatory' }}
    >
      {videos.map(video => (
        <div
          key={video.id}
          className="flex-shrink-0 w-100 d-flex align-items-center justify-content-center position-relative"
          style={{ scrollSnapAlign: 'center' }}
        >
          <Image
            src={video.thumbnailUrl}
            alt="Thumbnail"
            fill
            className="object-fit-cover"
            style={{ zIndex: 0 }}
            sizes="100vw"
          />

          <div
            className="position-absolute rounded-circle border border-light overflow-hidden"
            style={{
              top: 20,
              left: 20,
              width: 'clamp(60px, 10vw, 120px)',
              height: 'clamp(60px, 10vw, 120px)',
              boxShadow: '0 0 10px rgba(0,0,0,0.5)',
              zIndex: 10,
            }}
          >
            <Image
              src={video.userProfileImage}
              alt="User avatar"
              width={120}
              height={120}
              style={{ objectFit: 'cover' }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
