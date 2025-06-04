'use client'


import Outdoor from '@/app/components/Outdoor'



export default function HomePage() {
  return (
    <main
      style={{
        padding: '32px 16px',
        maxWidth: '100%',
        backgroundColor: '#121212',
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif',
        color: '#fff',
      }}
    >
      <h1 style={{ textAlign: 'center', marginBottom: 32 }}>🏠 Bem-vindo à Home</h1>
      <Outdoor />
    </main>
  )
}