'use client'

import React from 'react'
import Image from 'next/image'
import { Video } from 'types/video'

type NextProfileVideoProps = {
  videos: Video[]
  currentVideo: Video | null
  onNextVideo: (video: Video) => void
}

export default function NextProfileVideo({ videos, currentVideo, onNextVideo }: NextProfileVideoProps) {
  if (!currentVideo) return null

  function handleClick() {
    if (!currentVideo) return
    const userVideos = videos.filter(
      v => v.userID === currentVideo.userID && v.videoID !== currentVideo.videoID
    )

    if (userVideos.length > 0) {
      const randomIndex = Math.floor(Math.random() * userVideos.length)
      onNextVideo(userVideos[randomIndex])
    } else {
      alert('Nenhum outro vídeo deste usuário.')
    }
  }

  const buttonStyle: React.CSSProperties = {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: '50%',
    padding: 10,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  return (
    <div
      style={buttonStyle}
      onClick={handleClick}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)')}
    >
      <Image
        src="/icon/outro-video-do-perfil.svg"
        alt="Próximo vídeo"
        width={32}
        height={32}
        style={{ filter: 'invert(1)' }}
        unoptimized
      />
    </div>
  )
}
