// components/CustomInfoWindow.tsx
import React from 'react'

type Video = {
  id: string
  videoUrl?: string
  thumbnailUrl?: string
  artistSongName: string
  userName: string
}

export const CustomInfoWindow = ({
  video,
  onClose,
}: {
  video: Video
  onClose: () => void
}) => {
  return (
    <div style={{
      position: 'absolute',
      transform: 'translate(-50%, -100%)',
      backgroundColor: '#1a1a1a',
      border: '1px solid #333',
      borderRadius: '10px',
      padding: '8px',
      width: '220px',
      maxWidth: '90vw',
      zIndex: 100,
      display: 'flex',
      gap: '12px',
      color: '#fff',
      boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
    }}>
      <div style={{ width: '100px', height: '100px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden' }}>
        {video.videoUrl && (
          <video
            src={video.videoUrl}
            width="100%"
            height="100%"
            controls
            style={{ objectFit: 'cover' }}
            muted
            playsInline
          />
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h4 style={{
          margin: '0 0 4px 0',
          fontSize: '14px',
          fontWeight: 600,
          lineHeight: '1.2',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {video.artistSongName}
        </h4>
        <p style={{
          margin: 0,
          fontSize: '12px',
          color: '#aaa',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          @{video.userName}
        </p>
      </div>

      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '4px',
          right: '4px',
          background: 'transparent',
          border: 'none',
          color: '#ccc',
          fontSize: '18px',
          cursor: 'pointer',
          lineHeight: 1,
        }}
        aria-label="Fechar"
      >
        ×
      </button>
    </div>
  )
}
