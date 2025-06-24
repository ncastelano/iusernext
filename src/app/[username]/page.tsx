'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { User } from 'types/user'
import Image from 'next/image'

export default function UserProfilePage() {
  const { username } = useParams<{ username: string }>()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUser() {
      try {
        const usersRef = collection(db, 'users')
        const q = query(usersRef, where('username', '==', username))
        const snapshot = await getDocs(q)
        if (!snapshot.empty) {
          const userData = snapshot.docs[0].data() as User
          setUser(userData)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Erro ao buscar usuário:', error)
      }
      setLoading(false)
    }

    fetchUser()
  }, [username])

  if (loading) return <div>Carregando perfil...</div>

  if (!user) return <div>Usuário não encontrado!</div>

  return (
    <div style={{ padding: 20 }}>
      <h1>Perfil de {user.username}</h1>
      <Image
        src={user.image || '/default-profile.png'}
        alt={`Foto de ${user.username}`}
        width={100}
        height={100}
        style={{ borderRadius: '50%' }}
      />
      <p>Nome: {user.name}</p>
      <p>Email: {user.email}</p>
      <p>Localização: {user.latitude}, {user.longitude}</p>
      <p>Status: {user.visible ? 'Visível' : 'Oculto'}</p>
    </div>
  )
}
