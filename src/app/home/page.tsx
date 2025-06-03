'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@lib/firebase'
import Image from 'next/image'

type User = {
  name: string
  image: string
  email: string
}

export default function HomePage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUsers() {
      try {
        const usersCol = collection(db, 'users')
        const userSnapshot = await getDocs(usersCol)
        const userList = userSnapshot.docs.map(doc => doc.data() as User)
        setUsers(userList)
      } catch (error) {
        console.error('Erro ao buscar usuários:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  if (loading) return <p>Carregando usuários...</p>

  return (
    <main style={{ padding: 32, maxWidth: 600, margin: '0 auto' }}>
      <h1>🏠 Bem-vindo à Home</h1>

      <ul style={{ listStyle: 'none', padding: 0, marginTop: 24 }}>
        {users.map((user, idx) => (
          <li
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: 12,
              marginBottom: 12,
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              backgroundColor: '#fff',
              gap: 16,
            }}
          >
            <div style={{ position: 'relative', width: 64, height: 64 }}>
              <Image
                src={user.image}
                alt={`${user.name} avatar`}
                fill
                style={{ borderRadius: '50%', objectFit: 'cover' }}
                sizes="64px"
              />
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: 18 }}>{user.name}</p>
              <p style={{ margin: 0, color: '#555' }}>{user.email}</p>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
