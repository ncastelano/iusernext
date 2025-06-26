'use client'

import React, { useEffect, useState, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { Home, MapPin, Search, LogOut, Download, Upload } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from 'src/app/context/auth-context'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading } = useUser()

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [windowWidth, setWindowWidth] = useState<number>(0)

  const containerRef = useRef<HTMLDivElement>(null)
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 })

  // Atualiza largura da janela
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Captura evento de instalação PWA
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

  // Ajusta underline no botão ativo
  useEffect(() => {
    if (containerRef.current == null || pathname == null) {
      setUnderlineStyle({ left: 0, width: 0 })
      return
    }
    const baseButtons = [...containerRef.current.children].filter(
      (child) => (child as HTMLElement).getAttribute('data-key') !== 'upload'
    )

    const activeIndex = baseButtons.findIndex((btn) => {
      return (btn as HTMLElement).getAttribute('data-path') === pathname
    })

    if (activeIndex === -1) {
      setUnderlineStyle({ left: 0, width: 0 })
      return
    }

    const activeButton = baseButtons[activeIndex] as HTMLElement
    setUnderlineStyle({
      left: activeButton.offsetLeft,
      width: activeButton.offsetWidth,
    })
  }, [pathname, windowWidth])

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

  // Botões básicos do navbar
  const baseButtons = [
    { key: 'inicio', path: '/inicio', title: 'Início', Icon: Home },
    { key: 'mapa', path: '/mapa', title: 'Mapa', Icon: MapPin },
    { key: 'tudo', path: '/tudo', title: 'Pesquisar', Icon: Search },
    { key: 'logout', path: '/login', title: 'Sair', Icon: LogOut },
  ]

  if (isInstallable) {
    baseButtons.push({ key: 'install', path: '', title: 'Baixar', Icon: Download })
  }

  const navButtonStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
    color: 'white',
    border: 'none',
    padding: getButtonPadding(),
    borderRadius: 12,
    fontSize: 16,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.3s ease',
    height: 50,
    position: 'relative',
  }

  const handleClick = (key: string, path: string) => {
    if (key === 'logout') {
      signOut(auth).then(() => router.push('/login'))
    } else if (key === 'install' && deferredPrompt) {
      deferredPrompt.prompt().then(() => {
        deferredPrompt.userChoice.then((result) => {
          if (result.outcome === 'accepted') {
            setIsInstallable(false)
            setDeferredPrompt(null)
          }
        })
      })
    } else if (path) {
      router.push(path)
    }
  }

  // Evita renderizar enquanto carrega user para não "sumir" botão de upload
  if (loading) return null

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding:
          windowWidth < 400 ? '6px 10px' : windowWidth < 600 ? '8px 16px' : '10px 20px',
        borderRadius: 16,
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
      {baseButtons.map(({ key, path, title, Icon }) => (
        <button
          key={key}
          data-key={key}
          data-path={path}
          onClick={() => handleClick(key, path)}
          style={navButtonStyle}
          title={title}
        >
          <Icon size={getIconSize()} color="#fff" />
        </button>
      ))}

      {/* Botão de Upload aparece somente se usuário logado e loading false */}
      <AnimatePresence>
        {user && (
          <motion.button
            key="upload"
            data-key="upload"
            onClick={() => router.push('/upload')}
            style={navButtonStyle}
            title="Upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <Upload size={getIconSize()} color="#fff" />
          </motion.button>
        )}
      </AnimatePresence>

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
