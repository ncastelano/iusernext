import { Video } from 'types/video'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'


export const CustomInfoWindowVideo = ({ video, onClose }: { video: Video; onClose: () => void }) => {
  const [showVideo, setShowVideo] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowVideo(true)
    }, 1000) // 1 segundo

    return () => clearTimeout(timeout)
  }, [])

  return (
    <div style={styles.container}>
      <div style={styles.videoWrapper}>
        {showVideo && video.videoUrl ? (
          <video
            src={video.videoUrl}
            width="100%"
            height="100%"
            controls
            autoPlay
            muted
            playsInline
            style={{ objectFit: 'cover' }}
          />
        ) : (
        <Image
  src={video.thumbnailUrl || '/fallback.jpg'}
  alt="thumbnail"
  width={100}
  height={100}
  style={{ objectFit: 'cover' }}
/>

        )}
      </div>
      <div style={styles.textWrapper}>
        <h4 style={styles.title}>{video.artistSongName}</h4>
        <p style={styles.subtitle}>@{video.userName}</p>
      </div>
      <button onClick={onClose} style={styles.closeButton} aria-label="Fechar">×</button>
    </div>
  )
}


const styles: Record<string, React.CSSProperties> = {
  container: {
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
  },
  videoWrapper: {
    width: '100px',
    height: '100px',
    flexShrink: 0,
    borderRadius: '8px',
    overflow: 'hidden',
  },
  textWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  title: {
    margin: '0 0 4px 0',
    fontSize: '14px',
    fontWeight: 600,
    lineHeight: '1.2',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  subtitle: {
    margin: 0,
    fontSize: '12px',
    color: '#aaa',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  closeButton: {
    position: 'absolute',
    top: '4px',
    right: '4px',
    background: 'transparent',
    border: 'none',
    color: '#ccc',
    fontSize: '18px',
    cursor: 'pointer',
    lineHeight: 1,
  },
}

