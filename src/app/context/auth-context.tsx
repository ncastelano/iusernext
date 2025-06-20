'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { onAuthStateChanged, User } from 'firebase/auth'

type UserContextType = {
  user: User | null
  image: string | null
  loading: boolean
}

const UserContext = createContext<UserContextType>({
  user: null,
  image: null,
  loading: true,
})

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [image, setImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)

      if (firebaseUser) {
        try {
          const userRef = doc(db, 'users', firebaseUser.uid)
          const snapshot = await getDoc(userRef)
          setImage(snapshot.exists() ? snapshot.data().image || null : null)
        } catch {
          setImage(null)
        }
      } else {
        setImage(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <UserContext.Provider value={{ user, image, loading }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
