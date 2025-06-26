'use client'

import React, { useEffect, useState, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { Home, MapPin, Search, LogOut, Download } from 'lucide-react'

// Definição manual do tipo BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

function Navbar() {
  const pathname = usePathname()
  const router = useRouter()

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)

  // Inicializa com 0 para evitar mismatch SSR/CSR
  const [windowWidth, setWindowWidth] = useState<number>(0)

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    handleResize() // Atualiza o valor logo que o componente monta no client
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      const promptEvent = e as BeforeInstallPromptEvent
      e.preventDefault()
      setDeferredPrompt(promptEvent)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const getIconSize = () => {
    if (windowWidth === 0) return 24
    if (windowWidth < 400) return 24
    if (windowWidth < 600) return 30
    if (windowWidth < 900) return 40
    return 50
  }

  const getButtonPadding = () => {
    if (windowWidth < 400) return '6px'
    if (windowWidth < 600) return '8px'
    if (windowWidth < 900) return '10px'
    return '12px'
  }

  const buttons = [
    { key: 'inicio', path: '/inicio', title: 'Início', Icon: Home },
    { key: 'mapa', path: '/mapa', title: 'Mapa', Icon: MapPin },
    { key: 'tudo', path: '/tudo', title: 'Pesquisar', Icon: Search },
    { key: 'logout', path: '/login', title: 'Sair', Icon: LogOut },
    ...(isInstallable ? [{ key: 'install', path: '', title: 'Baixar', Icon: Download }] : []),
  ]

  const activeIndex = buttons.findIndex(btn => pathname === btn.path)

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
    height: '50px',
    position: 'relative' as const,
  }

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: windowWidth < 400 ? '6px 10px' : windowWidth < 600 ? '8px 16px' : '10px 20px',
        borderRadius: '16px',
        display: 'flex',
        gap: windowWidth < 400 ? '8px' : windowWidth < 600 ? '12px' : '14px',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        userSelect: 'none',
        width: windowWidth < 400 ? '95%' : windowWidth < 600 ? '90%' : '600px',
        maxWidth: '100%',
        boxShadow: '0 0 10px rgba(0,0,0,0.5)',
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
            : key === 'install'
            ? async () => {
                if (deferredPrompt) {
                  deferredPrompt.prompt()
                  const result = await deferredPrompt.userChoice
                  if (result.outcome === 'accepted') {
                    setIsInstallable(false)
                    setDeferredPrompt(null)
                  }
                }
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

      {/* Underline animado */}
      <div
        style={{
          position: 'absolute',
          bottom: 8,
          left: underlineStyle.left,
          width: underlineStyle.width,
          height: 3,
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
    </nav>
  )
}
export default Navbar
