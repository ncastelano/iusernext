'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { onAuthStateChanged, getRedirectResult, User as FirebaseUser } from 'firebase/auth'

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

  const fetchUserData = async (firebaseUser: FirebaseUser) => {
    try {
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
    } catch (error) {
      console.error('Erro ao buscar dados do Firestore:', error)
      setUser(null)
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      try {
        // 1. Primeiro: Verifica se houve login por redirect
        const redirectResult = await getRedirectResult(auth)

        if (redirectResult?.user) {
          await fetchUserData(redirectResult.user)
        } else if (auth.currentUser) {
          // 2. Se não houve redirect, mas já tem um usuário logado
          await fetchUserData(auth.currentUser)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Erro ao processar resultado de redirect:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }

      // 3. Escuta mudanças futuras (ex: logout, login manual, etc)
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          await fetchUserData(firebaseUser)
        } else {
          setUser(null)
        }
      })

      return unsubscribe
    }

    const unsubscribePromise = initAuth()

    return () => {
      unsubscribePromise.then((unsubscribe) => {
        if (typeof unsubscribe === 'function') {
          unsubscribe()
        }
      })
    }
  }, [])

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
