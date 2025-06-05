'use client'

import { useEffect, useState } from 'react'

export default function HomePage() {
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const [bgColor, setBgColor] = useState('#ff0000') // vermelho por padrão

  useEffect(() => {
    function updateSize() {
      const newWidth = window.innerWidth
      const newHeight = window.innerHeight

      setWidth(newWidth)
      setHeight(newHeight)
      setBgColor(newWidth > 980 ? '#FFD700' : '#FF0000') // amarelo ou vermelho
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
        backgroundColor: bgColor,
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif',
        color: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        transition: 'background-color 0.3s ease',
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
