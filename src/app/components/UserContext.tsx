'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

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

const UserContext = createContext<UserContextType | null>(null)

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState<UserContextType | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid)
        const snapshot = await getDoc(userRef)

        if (snapshot.exists()) {
          const data = snapshot.data()

          setUserData({
            uid: user.uid,
            email: user.email || null,
            name: data.name || null,
            username: data.username || null,
            image: data.image || null,
            latitude: data.latitude ?? null,
            longitude: data.longitude ?? null,
            visible: data.visible ?? false,
          })
        } else {
          setUserData(null)
        }
      } else {
        setUserData(null)
      }
    })

    return () => unsubscribe()
  }, [])

  return (
    <UserContext.Provider value={userData}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
