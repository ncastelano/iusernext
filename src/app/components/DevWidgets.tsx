'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

export default function DevWidget() {
  const [image, setImage] = useState<string | null>(null)
  const [name, setName] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)

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

  if (process.env.NODE_ENV !== 'development' || !image) return null

  return (
    <div
      title={`Usuário: ${name ?? 'desconhecido'}\nEmail: ${email ?? '---'}`}
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: '50%',
        border: '2px solid rgba(255, 255, 255, 0.5)',
        overflow: 'hidden',
        cursor: 'pointer',
        //boxShadow: '0 0 12px rgba(255, 255, 255, 0.3)',
        transition: 'transform 0.2s ease',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)'
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'scale(1)'
      }}
    >
     <Image
  src={image}
  alt={`Foto de perfil de ${name ?? 'usuário'}`}
  width={60}
  height={60}
  style={{
    borderRadius: '50%',
    objectFit: 'cover',
    width: '100%',
    height: '100%',
  }}
/>

    </div>
  )
}
