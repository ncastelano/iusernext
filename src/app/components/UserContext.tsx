'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth'

type UserContextType = {
  uid: string | null
  email: string | null
  name: string | null
  username: string | null
  image: string | null
  latitude: number | null
  longitude: number | null
  visible: boolean
}

type ContextValue = {
  user: UserContextType | null
  loading: boolean
}

const UserContext = createContext<ContextValue>({ user: null, loading: true })

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserContextType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initUser = async () => {
      try {
        const result = await getRedirectResult(auth)
        const firebaseUser = result?.user ?? auth.currentUser

        if (firebaseUser) {
          const userRef = doc(db, 'users', firebaseUser.uid)
          const snapshot = await getDoc(userRef)

          if (snapshot.exists()) {
            const data = snapshot.data()
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || null,
              name: data.name || null,
              username: data.username || null,
              image: data.image || null,
              latitude: data.latitude ?? null,
              longitude: data.longitude ?? null,
              visible: data.visible ?? false,
            })
          } else {
            setUser(null)
          }
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Erro ao processar redirecionamento do Google:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    const unsubscribe = onAuthStateChanged(auth, () => {
      initUser()
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
