// components/Outdoor.tsx
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

export default function Outdoor() {
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

  if (loading) {
    return <p style={{ color: '#fff', textAlign: 'center' }}>Carregando usuários...</p>
  }

  return (
    <section style={{ padding: '16px 0' }}>
      <h2 style={{ color: '#fff', marginBottom: 16, textAlign: 'center' }}>👥 Usuários </h2>
      <ul
        style={{
          display: 'flex',
          overflowX: 'auto',
          gap: 16,
          padding: '8px 0',
          listStyle: 'none',
          margin: 0,
        }}
      >
        {users.map((user, idx) => (
          <li
            key={idx}
            style={{
              flex: '0 0 auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: 16,
              minWidth: 160,
              borderRadius: 12,
              boxShadow: '0 4px 12px rgba(255,255,255,0.05)',
              backgroundColor: '#1e1e1e',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(255,255,255,0.08)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(255,255,255,0.05)'
            }}
          >
            <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
              <Image
                src={user.image}
                alt={`${user.name} avatar`}
                fill
                style={{ borderRadius: '50%', objectFit: 'cover' }}
                sizes="64px"
              />
            </div>
            <p style={{ marginTop: 12, fontSize: 16, fontWeight: 500 }}>{user.name}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
