import { Video } from 'types/video'
import Image from 'next/image'

export const VideoMarker = ({ video, onClick }: { video: Video; onClick: () => void }) => {
  let borderColor = '#00ff00'
  if (video.isFlash) borderColor = 'white'
  else if (video.isStore) borderColor = 'orange'
  else if (video.isPlace) borderColor = '#add8e6'
  else if (video.isProduct) borderColor = 'yellow'

  return (
    <div onClick={onClick} style={{ ...styles.marker, border: `3px solid ${borderColor}` }}>
      <Image
        src={video.thumbnailUrl || '/fallback.jpg'}
        alt="thumbnail"
        width={60}
        height={60}
        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
      />
    </div>
  )
}

const styles = {
  marker: {
    overflow: 'hidden',
    cursor: 'pointer',
    boxShadow: '0 0 5px rgba(0,0,0,0.3)',
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    width: 60,
    height: 60,
    borderRadius: '8px',
  } as React.CSSProperties
}
