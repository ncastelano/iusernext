"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";

type UserSettingsButtonProps = {
  profileUid: string;
};

export function UserSettingsButton({ profileUid }: UserSettingsButtonProps) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  if (!currentUser || currentUser.uid !== profileUid) return null;

  return (
    <button
      onClick={() => router.push("/settings")}
      className="btn btn-primary btn-sm"
    >
      Configurações
    </button>
  );
}
