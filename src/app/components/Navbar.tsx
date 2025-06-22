'use client'

import React, { useEffect, useState, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { Home, MapPin, Search, LogOut, Download } from 'lucide-react'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)

  // Capturar o evento beforeinstallprompt
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const result = await deferredPrompt.userChoice
      if (result.outcome === 'accepted') {
        console.log('Usuário instalou o PWA')
      } else {
        console.log('Usuário recusou a instalação')
      }
      setDeferredPrompt(null)
      setIsInstallable(false)
    }
  }

  const buttons = [
    { key: 'inicio', path: '/inicio', title: 'Início', Icon: Home },
    { key: 'home', path: '/home', title: 'Mapa', Icon: MapPin },
    { key: 'tudo', path: '/tudo', title: 'Pesquisar', Icon: Search },
    { key: 'logout', path: '/login', title: 'Sair', Icon: LogOut },
  ]

  // Adiciona o botão de download dinamicamente
  if (isInstallable) {
    buttons.unshift({
      key: 'install',
      path: '',
      title: 'Baixar',
      Icon: Download,
      onClick: handleInstallClick,
    })
  }

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
  }, [activeIndex])

  const navButtonStyle = {
    backgroundColor: 'transparent',
    color: 'transparent',
    border: 'none',
    padding: '10px',
    borderRadius: '12px',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.3s ease',
    height: '60px',
    position: 'relative' as const,
  }

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'transparent',
        padding: '10px 75px',
        borderRadius: '16px',
        display: 'flex',
        gap: '14px',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        userSelect: 'none',
      }}
      ref={containerRef}
    >
      {buttons.map(({ key, path, title, Icon, onClick }) => {
        const handleClick =
          key === 'logout'
            ? async () => {
                await signOut(auth)
                router.push('/login')
              }
            : key === 'install'
            ? onClick
            : () => router.push(path)

        return (
          <button key={key} onClick={handleClick} style={navButtonStyle} title={title}>
            <Icon size={24} color="#fff" />
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
