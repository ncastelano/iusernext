'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { motion, AnimatePresence } from 'framer-motion'

export default function DevWidget() {
  const [image, setImage] = useState<string | null>(null)
  const [name, setName] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [showText, setShowText] = useState(false)
  const router = useRouter()

  const fallbackImage = '/icon/icon-white-512x512.png'

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid)
        const userSnap = await getDoc(userDocRef)

        if (userSnap.exists()) {
          const userData = userSnap.data()
          setImage(userData.image || null)
          setName(userData.name || null)
          setEmail(userData.email || null)
        }
      }
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!image) {
      const interval = setInterval(() => setShowText(prev => !prev), 2500)
      return () => clearInterval(interval)
    }
  }, [image])

  if (process.env.NODE_ENV !== 'development') return null

  return (
    <div
      title={`Usuário: ${name ?? 'desconhecido'}\nEmail: ${email ?? '---'}`}
      style={{
        position: 'fixed',
        bottom: 30,
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
      onClick={() => router.push('/perfil')}
    >
      <div
        style={{
          width: 54,
          height: 54,
          borderRadius: '50%',
          backgroundColor: image ? '#00ff00' : '#fff', // ✅ alterna verde e branco
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
            {image ? (
              <motion.div
                key="photo"
                initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 30, scale: 0.5 }}
                transition={{ duration: 0.6 }}
              >
                <Image
                  src={image}
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
