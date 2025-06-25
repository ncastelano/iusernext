'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import { Video } from 'types/video'

interface VideoSwiperProps {
  videos: Video[]
  initialIndex: number
}

export default function VideoSwiper({ videos, initialIndex }: VideoSwiperProps) {
  return (
    <div className="bg-black min-h-screen flex flex-col items-center justify-center text-white">
      <Swiper
        initialSlide={initialIndex}
        onSlideChange={() => {}} // ou simplesmente remova esta linha se o índice não for necessário
        spaceBetween={50}
        slidesPerView={1}
      >
        {videos.map((video) => (
          <SwiperSlide key={video.videoID}>
            <div className="flex flex-col items-center justify-center space-y-4">
              <video
                src={video.videoUrl}
                controls
                className="max-h-[80vh] rounded-lg shadow-lg"
                autoPlay
                muted
              />
              <h2 className="text-xl font-semibold">{video.artistSongName}</h2>
              <p>
                Publicado em:{' '}
                {video.publishedDateTime
                  ? new Date(video.publishedDateTime).toLocaleDateString('pt-BR')
                  : '-'}
              </p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
