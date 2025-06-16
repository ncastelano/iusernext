'use client'

import React from 'react'
import Image from 'next/image'
import { Video } from 'types/video'
import { User } from 'types/user'

type FilterOption = 'users' | 'flash' | 'store' | 'place' | 'product'

type FilteredListProps = {
  filter: FilterOption
  videos: Video[]
  users: User[]
  onSelectVideo: (id: string) => void
  onSelectUser: (id: string) => void
}

export function FilteredList({ filter, videos, users, onSelectVideo, onSelectUser }: FilteredListProps) {
  let items: (Video | User)[] = []

  if (filter === 'users') {
    items = users
  } else {
    items = videos.filter((video) => {
      if (filter === 'flash') return video.isFlash
      if (filter === 'store') return video.isStore
      if (filter === 'place') return video.isPlace
      if (filter === 'product') return video.isProduct
      return false
    })
  }

  return (
    <div
      style={{
         position: 'fixed',
        top: 80,
        //left: 90,
        zIndex: 1000,
        
      
        display: 'flex',
        gap: '16px',
        overflowX: 'auto',
        padding: '12px 16px',
        backgroundColor: 'transparent',
        borderRadius: '12px',
        maxWidth: '90vw',
        scrollbarWidth: 'none',
      }}
    >
      {items.map((item) =>
        filter === 'users' ? (
          <div
            key={(item as User).id}
            onClick={() => onSelectUser((item as User).id)}
            title={(item as User).name}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              minWidth: 60,
            }}
          >
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid #2ecc71',
                boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                position: 'relative',
              }}
            >
              <Image
                src={(item as User).image}
                alt={(item as User).name}
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
            <span style={{ color: '#ccc', fontSize: '12px', textAlign: 'center', maxWidth: 60 }}>
              {(item as User).name.split(' ')[0]}
            </span>
          </div>
        ) : (
          (() => {
            const video = item as Video
            let borderColor = '#00ff00'
            if (video.isFlash) borderColor = 'white'
            else if (video.isStore) borderColor = 'red'
            else if (video.isPlace) borderColor = '#add8e6'
            else if (video.isProduct) borderColor = 'yellow'

            return (
              <div
                key={video.id}
                onClick={() => onSelectVideo(video.id)}
                title={video.artistSongName || 'Vídeo'}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  minWidth: 60,
                }}
              >
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: '10px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                    position: 'relative',
                    border: `3px solid ${borderColor}`,
                  }}
                >
                  <Image
                    src={video.thumbnailUrl || '/fallback-thumbnail.jpg'}
                    alt={video.artistSongName || 'Vídeo'}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <span style={{ color: '#ccc', fontSize: '12px', textAlign: 'center', maxWidth: 60 }}>
                  {video.artistSongName?.split('-')[0] || 'Vídeo'}
                </span>
              </div>
            )
          })()
        )
      )}
    </div>
  )
}
