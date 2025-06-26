'use client'

import React, { useEffect, useState, useRef } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Image from 'next/image'
import Link from 'next/link'
import { SegmentedProgressRing } from '@/app/components/SegmentedProgressRing'
import { Video } from 'types/video'

export default function TelaSimplificada() {
  const [video, setVideo] = useState<Video | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const segmentsCount = 8 // Exemplo: você pode dinamizar depois com base nos dados

  useEffect(() => {
    async function fetchLatestVideo() {
      try {
        const snapshot = await getDocs(collection(db, 'videos'))
        const videos = snapshot.docs
          .map(doc => doc.data() as Video)
          .filter(v => v.publishedDateTime !== undefined && v.videoUrl !== undefined)

        const sorted = videos.sort((a, b) => (b.publishedDateTime! - a.publishedDateTime!))
        setVideo(sorted[0] || null)
      } catch (error) {
        console.error('Erro ao carregar vídeos:', error)
      }
    }

    fetchLatestVideo()
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', backgroundColor: '#000' }}>
      {video && (
        <>
          {/* Vídeo em tela cheia */}
          <video
            ref={videoRef}
            src={video.videoUrl}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            muted
            autoPlay
            loop
            playsInline
          />

          {/* Container do anel e imagem */}
          <div
            style={{
              position: 'absolute',
              top: 20,
              left: 20,
              width: 72,
              height: 72,
              zIndex: 2,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Anel Segmentado */}
            <SegmentedProgressRing
              segments={segmentsCount}
              radius={36} // (72/2)
              strokeWidth={4}
              color="limegreen"
            />

            {/* Imagem de Perfil */}
            <Link
              href={`/${video.userName}`}
              style={{
                display: 'block',
                width: 60,
                height: 60,
                borderRadius: '50%',
                overflow: 'hidden',
                position: 'relative',
                zIndex: 2,
                boxShadow: '0 0 8px rgba(0, 255, 0, 0.6)',
                backgroundColor: '#111',
              }}
            >
              <Image
                src={video.userProfileImage || '/default-profile.png'}
                alt="Perfil"
                fill
                style={{
                  objectFit: 'cover',
                  borderRadius: '50%',
                }}
              />
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
