'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

type UserContextType = {
  image: string | null
}

const UserContext = createContext<UserContextType>({ image: null })

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [image, setImage] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid)
        const snapshot = await getDoc(userRef)
        if (snapshot.exists()) {
          const data = snapshot.data()
          setImage(data.image || null)
        } else {
          setImage(null)
        }
      } else {
        setImage(null)
      }
    })

    return () => unsubscribe()
  }, [])

  return <UserContext.Provider value={{ image }}>{children}</UserContext.Provider>
}

export const useUser = () => useContext(UserContext)
