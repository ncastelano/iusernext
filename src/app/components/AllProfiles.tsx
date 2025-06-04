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

export default function AllProfiles() {
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
      <ul
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 24,
          padding: 0,
          listStyle: 'none',
          margin: 0,
        }}
      >
        {users.map((user, idx) => (
          <li
            key={idx}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div style={{ position: 'relative', width: 72, height: 72 }}>
              <Image
                src={user.image}
                alt={`${user.name} avatar`}
                fill
                style={{ borderRadius: '50%', objectFit: 'cover' }}
                sizes="72px"
              />
            </div>
            <p style={{ color: '#fff', fontSize: 14, fontWeight: 400 }}>{user.name}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
