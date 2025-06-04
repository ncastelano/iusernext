'use client'

import { useEffect, useState } from 'react'

export default function HomePage() {
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    function updateSize() {
      setWidth(window.innerWidth)
      setHeight(window.innerHeight)
    }

    updateSize()
    window.addEventListener('resize', updateSize)

    return () => window.removeEventListener('resize', updateSize)
  }, [])

  return (
    <main
      style={{
        padding: '32px 16px',
        maxWidth: '100%',
        backgroundColor: '#121212',
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <h1 style={{ marginBottom: 24 }}>📏 Dimensões da Tela</h1>
      <p style={{ fontSize: 20, marginBottom: 8 }}>
        <strong>Largura:</strong> {width}px
      </p>
      <p style={{ fontSize: 20 }}>
        <strong>Altura:</strong> {height}px
      </p>
    </main>
  )
}
