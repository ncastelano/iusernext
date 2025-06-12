import React from 'react'
import { User } from 'types/user'
import Image from 'next/image'

export const CustomInfoWindowUser = ({
  user,
  onClose,
}: {
  user: User
  onClose: () => void
}) => {
  return (
    <div style={styles.container}>
      <div style={styles.imageWrapper}>
       <Image
  src={user.image}
  alt={user.name}
  width={100}
  height={100}
  style={{ objectFit: 'cover' }}
/>
      </div>
      <div style={styles.textWrapper}>
        <h4 style={styles.title}>{user.name}</h4>
        <p style={styles.subtitle}>Email: {user.email}</p>
      </div>
      <button onClick={onClose} style={styles.closeButton} aria-label="Fechar">
        ×
      </button>
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
  imageWrapper: {
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
