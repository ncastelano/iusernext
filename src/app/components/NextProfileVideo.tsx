import React from 'react'
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


  return (
    <div
      style={{ cursor: 'pointer', color: '#fff', fontSize: 16, textShadow: '0 0 4px black' }}
      onClick={handleClick}
    >
      Proximo Video
    </div>
  )
}
