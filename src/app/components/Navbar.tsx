'use client'

import { usePathname, useRouter } from 'next/navigation'
import { signOut, getAuth } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { useEffect, useRef, useState } from 'react'
import { TrackingToggleButton } from '@/app/components/TrackingToggleButton'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()

  const watchIdRef = useRef<number | null>(null)

  const [trackingActive, setTrackingActive] = useState(false)

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

  const toggleTracking = () => {
    if (trackingActive) {
      stopTracking()
      setTrackingActive(false)
    } else {
      startTracking()
      setTrackingActive(true)
    }
  }

  useEffect(() => {
    const fetchUserVisibility = async () => {
      const auth = getAuth()
      const user = auth.currentUser

      if (!user) return

      const userRef = doc(db, 'users', user.uid)
      const snapshot = await getDoc(userRef)

      if (snapshot.exists()) {
        const data = snapshot.data()
        if (data.visible !== undefined) {
          setTrackingActive(data.visible)
          if (data.visible) startTracking()
        }
      }
    }

    fetchUserVisibility()
  }, [])

  const isActive = (path: string) => pathname === path

  const navButtonStyle = (active: boolean) => ({
    backgroundColor: active ? '#00ffff' : '#333',
    color: active ? '#000' : 'white',
    fontWeight: active ? 'bold' : 'normal',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
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
      <button
        onClick={() => router.push('/home')}
        style={navButtonStyle(isActive('/home'))}
      >
        Home
      </button>
      <button
        onClick={() => router.push('/azul')}
        style={navButtonStyle(isActive('/azul'))}
      >
        Azul
      </button>
      <button
        onClick={() => router.push('/amarelo')}
        style={navButtonStyle(isActive('/amarelo'))}
      >
        Amarelo
      </button>
      <button
        onClick={() => router.push('/tudo')}
        style={navButtonStyle(isActive('/tudo'))}
      >
        Tudo
      </button>

      <button
        onClick={handleLogout}
        style={{
          backgroundColor: '#ff4d4d',
          color: 'white',
          border: 'none',
          padding: '6px 10px',
          borderRadius: '8px',
          fontSize: '13px',
          cursor: 'pointer',
        }}
      >
        Logout
      </button>

      <TrackingToggleButton
        trackingActive={trackingActive}
        toggleTracking={toggleTracking}
      />
    </nav>
  )
}
