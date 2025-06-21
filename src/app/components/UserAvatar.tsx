'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '@/app/components/UserContext'

export default function UserAvatar() {
  const { user } = useUser()

  const [showText, setShowText] = useState(false)
  const router = useRouter()

  const fallbackImage = '/icon/icon-white-512x512.png'

  useEffect(() => {
    if (!user?.image) {
      const interval = setInterval(() => setShowText((prev) => !prev), 2500)
      return () => clearInterval(interval)
    }
  }, [user?.image])

  return (
    <div
      title={`Usuário: ${user?.name ?? 'desconhecido'}\nEmail: ${user?.email ?? '---'}`}
      style={{
        position: 'fixed',
        bottom: 10,
        left: 20,
        width: 64,
        height: 64,
        borderRadius: '50%',
        padding: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 11000,
      }}
      onClick={() => router.push('/login')}
    >
      <div
        style={{
          width: 54,
          height: 54,
          borderRadius: '50%',
          backgroundColor: user?.image ? '#00ff00' : '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            backgroundColor: '#121212',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <AnimatePresence mode="wait">
            {user?.image ? (
              <motion.div
                key="photo"
                initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 30, scale: 0.5 }}
                transition={{ duration: 0.6 }}
              >
                <Image
                  src={user.image}
                  alt="Foto do Usuário"
                  width={40}
                  height={40}
                  style={{ objectFit: 'cover', borderRadius: '50%' }}
                />
              </motion.div>
            ) : (
              <motion.div
                key={showText ? 'text' : 'fallback'}
                initial={{ opacity: 0, y: 10, scale: 0.7 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.5 }}
                transition={{ duration: 0.6 }}
                style={{
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                  textAlign: 'center',
                }}
              >
                {showText ? (
                  'Entrar'
                ) : (
                  <Image
                    src={fallbackImage}
                    alt="Anônimo"
                    width={40}
                    height={40}
                    style={{ objectFit: 'cover', borderRadius: '50%' }}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
