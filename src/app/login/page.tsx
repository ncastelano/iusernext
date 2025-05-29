'use client'

import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signInWithEmailAndPassword(auth, email, senha)
      router.push('/home')
    } catch (error: any) {
      alert(error.message)
    }
  }

  return (
   <main style={{
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: 'rgba(245, 241, 5, 0.5)',
}}>
  <div style={{
    padding: 24,
    borderRadius: 12,
    backgroundColor: '#1e1e1e',
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    width: '100%',
    maxWidth: 400,
    height: '100%',
    maxHeight: 600,
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'center',
    color: '#ffffff',
    overflow: 'auto',  // caso ainda precise rolar no mobile
  }}>
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
      <img
        src="/icon/icon-512x512.png"
        alt="Logo"
        style={{
          width: 150,
          height: 150,
          borderRadius: 8,
          filter: 'invert(1)',
        }}
      />
    </div>

{/* <h1 style={{ marginBottom: 16, fontSize: '1.8rem' }}>iUser</h1> */}


    <form onSubmit={handleLogin} style={{ flexGrow: 1 }}>
      <input
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={{
          width: '100%',
          padding: 10,
          marginBottom: 12,
          backgroundColor: '#2a2a2a',
          border: '1px solid #444',
          color: '#fff',
          borderRadius: 6,
          fontSize: '1rem',
        }}
      />
      <input
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        required
        style={{
          width: '100%',
          padding: 10,
          marginBottom: 20,
          backgroundColor: '#2a2a2a',
          border: '1px solid #444',
          color: '#fff',
          borderRadius: 6,
          fontSize: '1rem',
        }}
      />
      <button
        type="submit"
        style={{
          width: '100%',
          padding: 12,
          backgroundColor: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'background 0.3s',
          fontSize: '1rem',
        }}
      >
        Entrar
      </button>
    </form>

    <p style={{ marginTop: 16, fontSize: 14 }}>
      Não tem uma conta?{' '}
      <Link href="/cadastro" style={{ color: '#4ea1f3', textDecoration: 'underline' }}>
        Cadastre-se
      </Link>
    </p>
  </div>
</main>

  )
}
