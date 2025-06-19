'use client'

import { usePathname, useRouter } from 'next/navigation'
import { signOut, getAuth } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const watchIdRef = useRef<number | null>(null)

  const [trackingActive, setTrackingActive] = useState(false)
  const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null)

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push('/login')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const startTracking = () => {
    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          console.log('Posição rastreada:', position)
        },
        (error) => {
          console.error('Erro ao rastrear localização:', error)
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      )
    }
  }

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
  }

  

  useEffect(() => {
    const fetchUserData = async () => {
      const authInstance = getAuth()
      const user = authInstance.currentUser

      if (!user) return

      const userRef = doc(db, 'users', user.uid)
      const snapshot = await getDoc(userRef)

      if (snapshot.exists()) {
        const data = snapshot.data()
        if (data.visible !== undefined) {
          setTrackingActive(data.visible)
          if (data.visible) startTracking()
        }
        if (data.image) {
          setUserPhotoUrl(data.image)
        }
      }
    }

    fetchUserData()
  }, [])

  const isActive = (path: string) => pathname === path

  const navButtonStyle = (active: boolean) => ({
    backgroundColor: active ? '#00ffff' : '#1a1a1a',
    color: active ? '#000' : '#ccc',
    border: active ? '1px solid #00ffff' : '1px solid #444',
    fontWeight: 500,
    padding: '10px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    transition: 'all 0.2s ease-in-out',
  })

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#121212',
        padding: '12px 20px',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <button onClick={() => router.push('/home')} style={navButtonStyle(isActive('/home'))}>
        Home
      </button>
      <button onClick={() => router.push('/azul')} style={navButtonStyle(isActive('/azul'))}>
        Azul
      </button>
      <button onClick={() => router.push('/amarelo')} style={navButtonStyle(isActive('/amarelo'))}>
        Amarelo
      </button>
      <button onClick={() => router.push('/tudo')} style={navButtonStyle(isActive('/tudo'))}>
        Tudo
      </button>

      <button
        onClick={handleLogout}
        style={{
          
          backgroundColor: '#1a1a1a',
          color: '#ccc',
          border: '1px solid #444',
          padding: '10px 16px',
          borderRadius: '8px',
          fontSize: '14px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          transition: 'all 0.2s ease-in-out',
          fontWeight: 500,
        }}
      >
        Logout
      </button>

      {userPhotoUrl && (
  <div
    style={{
      width: 54, // aumenta o tamanho total
      height: 54,
      borderRadius: '50%',
      backgroundColor: '#00ff00', // a cor da borda
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    <div
      style={{
        width: 48, // espaço interno que cria a "distância" da borda
        height: 48,
        borderRadius: '50%',
        backgroundColor: '#121212', // mesma cor do navbar ou fundo
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Image
        src={userPhotoUrl}
        alt="Eu"
        width={40}
        height={40}
        style={{
          objectFit: 'cover',
          borderRadius: '50%',
        }}
      />
    </div>
  </div>
)}


    </nav>
  )
}
