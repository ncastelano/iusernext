'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()

  const linkStyle = (path: string) => ({
    color: 'white',
    fontWeight: pathname === path ? 'bold' as const : 'normal' as const,
    textDecoration: 'none',
  })

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push('/') // Redireciona para a página inicial ou login
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  return (
    <nav
      style={{
        padding: 16,
        display: 'flex',
        gap: 16,
        background: 'black',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', gap: 16 }}>
        <Link href="/home" style={linkStyle('/home')}>Home</Link>
        <Link href="/azul" style={linkStyle('/azul')}>Tela Azul</Link>
        <Link href="/amarelo" style={linkStyle('/amarelo')}>Tela Amarela</Link>
         <Link href="/tudo" style={linkStyle('/tudo')}>Tudo</Link>
      </div>
      <button
        onClick={handleLogout}
        style={{
          background: 'white',
          color: 'black',
          border: 'none',
          padding: '8px 12px',
          borderRadius: 4,
          cursor: 'pointer',
        }}
      >
        Logout
      </button>
    </nav>
  )
}
