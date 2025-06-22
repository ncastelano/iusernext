'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged, getRedirectResult, User as FirebaseUser } from 'firebase/auth'
import { User } from 'types/user' // 👉 Aqui é o seu User, com image, latitude etc.
import { getUserFromFirestore } from 'src/app/components/GetUserFromFirestore' // 👉 Exemplo de função para buscar Firestore (ajuste ao seu)

interface UserContextType {
  user: User | null
  loading: boolean
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
})

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadUser(firebaseUser: FirebaseUser) {
    try {
      const data = await getUserFromFirestore(firebaseUser.uid) // 👈 Você busca o perfil do Firestore
      if (data) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? '',
          name: data.name,
          username: data.username ?? null,
          image: data.image,
          latitude: data.latitude,
          longitude: data.longitude,
          visible: data.visible,
        })
      } else {
        setUser(null)
      }
    } catch (err) {
      console.error('Erro ao buscar perfil do usuário:', err)
      setUser(null)
    }
  }

  useEffect(() => {
    getRedirectResult(auth).then((result) => {
      if (result?.user) loadUser(result.user)
    })

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        loadUser(firebaseUser)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
