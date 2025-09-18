"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import {
  onAuthStateChanged,
  getRedirectResult,
  User as FirebaseUser,
} from "firebase/auth";
import { getUserFromFirestore } from "src/app/components/GetUserFromFirestore";
import { User } from "types/users";

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
          email: firebaseUser.email ?? "",
          name: data.name,
          namePage: data.namePage ?? "",
          username: data.username ?? "",
          image: data.image,
          latitude: data.latitude,
          longitude: data.longitude,
          visible: data.visible,
        });
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Erro ao buscar perfil do usuário:", err);
      setUser(null);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        loadUser(firebaseUser).finally(() => setLoading(false));
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    getRedirectResult(auth).catch((error) =>
      console.error("Erro ao obter resultado de redirect:", error)
    );

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
