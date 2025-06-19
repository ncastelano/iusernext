'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      router.push('/home');
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Erro inesperado ao fazer login.');
      }
    }
  };

const handleGoogleLogin = async () => {
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    router.push('/home');
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Erro ao fazer login com Google:', error.message);
      alert(`Erro ao entrar com Google: ${error.message}`);
    } else {
      console.error('Erro desconhecido ao fazer login com Google:', error);
      alert('Erro desconhecido ao entrar com Google');
    }
  }
};


  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(to bottom right, #0e0e0e, #1a1a1a)',
        padding: '16px',
      }}
    >
      <div
        style={{
          padding: 24,
          borderRadius: 16,
          backgroundColor: '#1a1a1a',
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          width: '100%',
          maxWidth: 400,
          display: 'flex',
          flexDirection: 'column',
          textAlign: 'center',
          color: '#ccc',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <Image
            src="/icon/icon-512x512.png"
            alt="Logo"
            width={200}
            height={200}
            style={{
              borderRadius: 12,
              filter: 'invert(1)',
            }}
          />
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            style={inputStyle}
          />
          <button type="submit" style={buttonStyle}>
            Entrar
          </button>
        </form>

        <hr style={{ margin: '16px 0', borderColor: '#444' }} />

        <button onClick={handleGoogleLogin} style={googleButtonStyle}>
          <span style={{ marginRight: 8 }}>🔵</span> Entrar com Google
        </button>

        <p style={{ marginTop: 20, fontSize: 14, color: '#aaa' }}>
          Não tem uma conta?{' '}
          <Link href="/cadastro" style={{ color: '#4ea1f3', textDecoration: 'underline' }}>
            Cadastre-se
          </Link>
        </p>
      </div>
    </main>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px',
  backgroundColor: '#2a2a2a',
  border: '1px solid #444',
  borderRadius: 8,
  color: '#ccc',
  fontSize: '14px',
  outline: 'none',
};

const buttonStyle = {
  padding: '12px',
  backgroundColor: '#1a1a1a',
  color: '#ccc',
  border: '1px solid #444',
  borderRadius: 8,
  cursor: 'pointer',
  fontWeight: 500,
  fontSize: '14px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  transition: 'all 0.2s ease-in-out',
};

const googleButtonStyle = {
  ...buttonStyle,
  backgroundColor: '#fff',
  color: '#000',
  border: '1px solid #ccc',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
