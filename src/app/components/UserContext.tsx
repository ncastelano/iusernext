'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, getRedirectResult, User as FirebaseUser } from 'firebase/auth';
import { User } from 'types/user';
import { getUserFromFirestore } from 'src/app/components/GetUserFromFirestore';

interface UserContextType {
  user: User | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadUser(firebaseUser: FirebaseUser) {
    try {
      const data = await getUserFromFirestore(firebaseUser.uid);
      if (data) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? '',
          name: data.name,
          username: data.username ?? '',
          image: data.image,
          latitude: data.latitude,
          longitude: data.longitude,
          visible: data.visible,
        });
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Erro ao buscar perfil do usuário:', err);
      setUser(null);
    }
  }

 useEffect(() => {
  let unsubscribe: () => void;

  const checkRedirectAndAuth = async () => {
    try {
      await getRedirectResult(auth);
    } catch (error) {
      console.error('Erro ao obter resultado de redirect:', error);
    }

    unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await loadUser(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
  };

  checkRedirectAndAuth();

  return () => {
    if (unsubscribe) unsubscribe();
  };
}, []);


  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
