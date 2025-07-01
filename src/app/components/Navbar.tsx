'use client'

import React, { useEffect, useState, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { Home, MapPin, Search, LogOut, Upload } from 'lucide-react'
import IuserEnterLogin from '@/app/components/IuserEnterLogin' // ajuste o caminho se necessário

function Navbar() {
  const pathname = usePathname()
  const router = useRouter()

  const [windowWidth, setWindowWidth] = useState<number>(0)
  const [devicePixelRatio, setDevicePixelRatio] = useState<number>(1)
  const [user, setUser] = useState(() => auth.currentUser)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser)
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
      setDevicePixelRatio(window.devicePixelRatio)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const getResponsiveScale = () => {
    if (windowWidth <= 400 && devicePixelRatio >= 2) {
      return 2
    }
    return 1
  }

  const scale = getResponsiveScale()

  const getIconSize = () => {
    if (windowWidth === 0) return 48 * scale
    if (windowWidth < 400) return 48 * scale
    if (windowWidth < 600) return 60 * scale
    if (windowWidth < 900) return 80 * scale
    return 50 * scale
  }

  const getButtonPadding = () => {
    if (windowWidth < 400) return `${12 * scale}px`
    if (windowWidth < 600) return `${16 * scale}px`
    if (windowWidth < 900) return `${20 * scale}px`
    return `${12 * scale}px`
  }

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
    if (activeIndex === -1) {
      setUnderlineStyle({ left: 0, width: 0 })
      return
    }
    const container = containerRef.current
    if (!container) return

    const activeButton = container.children[activeIndex] as HTMLElement
    if (!activeButton) return

    setUnderlineStyle({
      left: activeButton.offsetLeft,
      width: activeButton.offsetWidth,
    })
  }, [activeIndex, windowWidth])

  const navButtonStyle = {
    backgroundColor: 'transparent',
    color: 'white',
    border: 'none',
    padding: getButtonPadding(),
    borderRadius: '12px',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.3s ease',
    height: `${50 * scale}px`,
    position: 'relative' as const,
  }

  return (
  <nav
    style={{
      position: 'fixed',
      top: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'rgba(0,0,0,0.6)',
      padding:
        windowWidth < 400
          ? `${12 * scale}px ${10 * scale}px`
          : windowWidth < 600
          ? `${16 * scale}px ${32 * scale}px`
          : `${20 * scale}px ${40 * scale}px`,
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: `${24 * scale}px`,
      zIndex: 1000,
      userSelect: 'none',
      width:
        windowWidth < 400
          ? `${190 * scale}%`
          : windowWidth < 600
          ? `${180 * scale}%`
          : `${600 * scale}px`,
      maxWidth: '100%',
      boxShadow: '0 0 10px rgba(0,0,0,0.5)',
    }}
  >
    {/* GRUPO DE BOTÕES */}
    <div
      style={{
        display: 'flex',
        gap:
          windowWidth < 400
            ? `${12 * scale}px`
            : windowWidth < 600
            ? `${24 * scale}px`
            : `${48 * scale}px`,
        alignItems: 'center',
        position: 'relative',
      }}
      ref={containerRef}
    >
      {buttons.map(({ key, path, title, Icon }) => {
        const onClick =
          key === 'logout'
            ? async () => {
                await signOut(auth)
                router.push('/login')
              }
            : () => {
                if (path) router.push(path)
              }

        return (
          <button key={key} onClick={onClick} style={navButtonStyle} title={title}>
            <Icon size={getIconSize()} color="#fff" />
          </button>
        )
      })}

      {/* Underline */}
      <div
        style={{
          position: 'absolute',
          bottom: 8 * scale,
          left: underlineStyle.left,
          width: underlineStyle.width,
          height: 3 * scale,
          borderRadius: 2,
          backgroundColor: 'rgb(255, 255, 255)',
          boxShadow: `
            0 -4px 6px rgba(255, 255, 255, 0.9),
            0 -8px 12px rgba(255, 255, 255, 0.6),
            0 -14px 20px rgba(255, 255, 255, 0.3)
          `,
          transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: 'none',
          zIndex: 1100,
        }}
      />
    </div>

    {/* AVATAR OU LOGIN */}
    <div>
      <IuserEnterLogin />
    </div>
  </nav>
)

}

export default Navbar
