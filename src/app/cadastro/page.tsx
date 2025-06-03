'use client'

import { useState } from 'react'
import { auth, db, storage } from '@/lib/firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { collection, doc, setDoc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'

export default function CadastroPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [name, setName] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const router = useRouter()

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, senha)
      const uid = cred.user.uid

      let imageURL = ''

      if (imageFile) {
        const imageRef = ref(storage, `users/${uid}/profile.jpg`)
        await uploadBytes(imageRef, imageFile)
        imageURL = await getDownloadURL(imageRef)
      }

      await setDoc(doc(collection(db, 'users'), uid), {
        uid,
        name,
        email,
        image: imageURL,
      })

      router.push('/home')
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message)
      } else {
        alert('Erro desconhecido ao cadastrar usuário.')
      }
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
        padding: 16,
      }}
    >
      <div
        style={{
          backgroundColor: '#22272e',
          padding: 40,
          borderRadius: 16,
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          width: '100%',
          maxWidth: 420,
          color: 'white',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}
      >
        <h1
          style={{
            marginBottom: 32,
            fontSize: '2rem',
            fontWeight: 'bold',
            textAlign: 'center',
            letterSpacing: '1.5px',
            color: '#4f46e5',
          }}
        >
          Criar Conta
        </h1>

        <form onSubmit={handleCadastro} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <input
            type="text"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={inputStyle}
            onFocus={e => (e.currentTarget.style.backgroundColor = '#3c4653')}
            onBlur={e => (e.currentTarget.style.backgroundColor = '#323b47')}
          />

          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
            onFocus={e => (e.currentTarget.style.backgroundColor = '#3c4653')}
            onBlur={e => (e.currentTarget.style.backgroundColor = '#323b47')}
          />

          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            style={inputStyle}
            onFocus={e => (e.currentTarget.style.backgroundColor = '#3c4653')}
            onBlur={e => (e.currentTarget.style.backgroundColor = '#323b47')}
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            required
            style={{
              color: 'white',
              fontSize: 14,
              borderRadius: 10,
              backgroundColor: '#323b47',
              padding: 8,
              cursor: 'pointer',
              boxShadow: 'inset 0 0 6px rgba(255, 255, 255, 0.1)',
              border: 'none',
            }}
          />

          <button
            type="submit"
            style={{
              marginTop: 12,
              padding: 14,
              borderRadius: 12,
              border: 'none',
              backgroundColor: '#4f46e5',
              color: 'white',
              fontSize: 18,
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 6px 15px #4f46e5',
              transition: 'background-color 0.3s',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#4338ca')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#4f46e5')}
          >
            Cadastrar
          </button>
        </form>
      </div>
    </main>
  )
}

const inputStyle: React.CSSProperties = {
  padding: 14,
  borderRadius: 10,
  border: 'none',
  backgroundColor: '#323b47',
  color: 'white',
  fontSize: 16,
  boxShadow: 'inset 0 0 6px rgba(255, 255, 255, 0.1)',
  outline: 'none',
  transition: 'background-color 0.3s',
}
