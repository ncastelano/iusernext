"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  getDocs,
  collection,
} from "firebase/firestore";
import { UserPlus, UserMinus } from "lucide-react";

interface FollowMapProps {
  targetUid: string;
}

export default function FollowMap({ targetUid }: FollowMapProps) {
  const [currentUid, setCurrentUid] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user && user.uid !== targetUid) {
        setCurrentUid(user.uid);

        // Verifica se current user segue o target
        const followerDocRef = doc(
          db,
          "users",
          targetUid,
          "followers",
          user.uid
        );
        const docSnap = await getDoc(followerDocRef);
        setIsFollowing(docSnap.exists());

        // Contagem de seguidores do target
        const followersSnap = await getDocs(
          collection(db, "users", targetUid, "followers")
        );
        setFollowersCount(followersSnap.size);

        // Contagem de usuários que target está seguindo
        const followingSnap = await getDocs(
          collection(db, "users", targetUid, "following")
        );
        setFollowingCount(followingSnap.size);
      } else {
        setCurrentUid(user ? user.uid : null);
        setIsFollowing(false);

        // Se quiser mostrar contadores mesmo que seja o próprio user ou deslogado,
        // pode buscar os counts aqui também (opcional)
        const followersSnap = await getDocs(
          collection(db, "users", targetUid, "followers")
        );
        setFollowersCount(followersSnap.size);

        const followingSnap = await getDocs(
          collection(db, "users", targetUid, "following")
        );
        setFollowingCount(followingSnap.size);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [targetUid]);

  const toggleFollow = async () => {
    if (!currentUid) return;

    const followerRef = doc(db, "users", targetUid, "followers", currentUid);
    const followingRef = doc(db, "users", currentUid, "following", targetUid);

    try {
      const followerSnap = await getDoc(followerRef);

      if (followerSnap.exists()) {
        await deleteDoc(followerRef);
        await deleteDoc(followingRef);
        setIsFollowing(false);
        setFollowersCount((prev) => prev - 1);
      } else {
        await setDoc(followerRef, {});
        await setDoc(followingRef, {});
        setIsFollowing(true);
        setFollowersCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Erro ao seguir/deixar de seguir:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center p-4 rounded-xl shadow-md w-full max-w-[200px] text-white">
        Carregando...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-between w-[115px] h-[70px] bg-black/40 rounded-md text-white text-[11px] p-[6px] shadow">
      {/* Botão seguir/desseguir */}
      {currentUid && currentUid !== targetUid && (
        <button
          onClick={toggleFollow}
          className={`w-5 h-5 flex items-center justify-center rounded-full text-white
          ${
            isFollowing
              ? "bg-red-500 hover:bg-red-600"
              : "bg-green-500 hover:bg-green-600"
          }`}
          title={isFollowing ? "Deixar de seguir" : "Seguir"}
        >
          {isFollowing ? <UserMinus size={10} /> : <UserPlus size={10} />}
        </button>
      )}

      {/* Contadores */}
      <div className="flex justify-between w-full mt-1 gap-1">
        <div className="flex-1 flex flex-col items-center">
          <div className="font-bold leading-none">{followersCount}</div>
          <span className="text-[9px] text-gray-300 leading-none">Seguid.</span>
        </div>
        <div className="flex-1 flex flex-col items-center">
          <div className="font-bold leading-none">{followingCount}</div>
          <span className="text-[9px] text-gray-300 leading-none">
            Seguindo
          </span>
        </div>
      </div>
    </div>
  );
}
