'use client'

import React, { useEffect, useState, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { Home, MapPin, Search, LogOut, Upload } from 'lucide-react'
import IuserEnterLogin from '@/app/components/IuserEnterLogin'

function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState(() => auth.currentUser)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser)
    return () => unsubscribe()
  }, [])

  const normalizePath = (path: string) => path.replace(/\/+$/, '')
  const cleanPathname = normalizePath(pathname === '/' ? '/inicio' : pathname || '')

  const buttons = [
    { key: 'inicio', path: '/inicio', title: 'Início', Icon: Home },
    { key: 'mapa', path: '/mapa', title: 'Mapa', Icon: MapPin },
    ...(user ? [{ key: 'upload', path: '/upload', title: 'Upload', Icon: Upload }] : []),
    { key: 'tudo', path: '/tudo', title: 'Pesquisar', Icon: Search },
    ...(user ? [{ key: 'logout', path: '/login', title: 'Sair', Icon: LogOut }] : []),
  ]

  const activeIndex = buttons.findIndex(btn => normalizePath(btn.path) === cleanPathname)

  const containerRef = useRef<HTMLDivElement>(null)
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 })

  useEffect(() => {
    const container = containerRef.current
    if (!container || activeIndex === -1) return

    const activeButton = container.children[activeIndex] as HTMLElement
    if (!activeButton) return

    setUnderlineStyle({
      left: activeButton.offsetLeft,
      width: activeButton.offsetWidth,
    })
  }, [activeIndex])

  return (
    <nav
      style={{
        position: 'fixed',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 'clamp(12px, 3vw, 20px) clamp(16px, 6vw, 40px)',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'clamp(16px, 5vw, 48px)',
        zIndex: 1000,
        userSelect: 'none',
        width: 'clamp(320px, 90vw, 600px)',
        boxShadow: '0 0 10px rgba(0,0,0,0.5)',
      }}
    >
      {/* BOTÕES */}
      <div
        ref={containerRef}
        style={{
          display: 'flex',
          gap: 'clamp(12px, 4vw, 32px)',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {buttons.map(({ key, path, title, Icon }) => {
          const onClick =
            key === 'logout'
              ? async () => {
                  await signOut(auth)
                  router.push('/login')
                }
              : () => router.push(path)

          return (
            <button
              key={key}
              onClick={onClick}
              title={title}
              style={{
                backgroundColor: 'transparent',
                color: 'white',
                border: 'none',
                padding: 'clamp(8px, 2vw, 16px)',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: 'clamp(50px, 8vw, 70px)',
                position: 'relative',
              }}
            >
              <Icon
                style={{
                  width: 'clamp(40px, 6vw, 80px)',
                  height: 'clamp(40px, 6vw, 80px)',
                }}
                color="#fff"
              />
            </button>
          )
        })}

        {/* UNDERLINE */}
        <div
          style={{
            position: 'absolute',
            bottom: '6px',
            left: underlineStyle.left,
            width: underlineStyle.width,
            height: '3px',
            borderRadius: 2,
            backgroundColor: 'white',
            boxShadow: `
              0 -4px 6px rgba(255, 255, 255, 0.9),
              0 -8px 12px rgba(255, 255, 255, 0.6),
              0 -14px 20px rgba(255, 255, 255, 0.3)
            `,
            transition: 'left 0.3s ease, width 0.3s ease',
            pointerEvents: 'none',
            zIndex: 1100,
          }}
        />
      </div>

      {/* LOGIN / AVATAR */}
      <div
        style={{
          width: 'clamp(60px, 10vw, 120px)',
          height: 'clamp(60px, 10vw, 120px)',
          borderRadius: '50%',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <IuserEnterLogin />
      </div>
    </nav>
  )
}

export default Navbar
