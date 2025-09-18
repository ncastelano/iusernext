"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaInstagram,
  FaFacebookF,
  FaWhatsapp,
  FaTwitter,
  FaYoutube,
  FaSnapchatGhost,
  FaMapMarkerAlt,
} from "react-icons/fa";
import {
  UserPlus as LucideUserPlus,
  UserMinus as LucideUserMinus,
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  getDocs,
  collection,
} from "firebase/firestore";
import { User } from "types/users";

export default function InfoProfileAnimations({
  safeUser,
  videosCount,
}: {
  safeUser: User;
  videosCount: number;
}) {
  const [loadingRoute, setLoadingRoute] = useState(false);

  const [currentUid, setCurrentUid] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(true);
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);

  // Lógica de localização
  const handleComoChegar = () => {
    if (safeUser.latitude === null || safeUser.longitude === null) {
      alert("Localização do usuário de destino não informada.");
      return;
    }

    if (!navigator.geolocation) {
      alert("Geolocalização não suportada pelo seu navegador.");
      return;
    }

    setLoadingRoute(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: originLat, longitude: originLng } = position.coords;
        const destLat = safeUser.latitude!;
        const destLng = safeUser.longitude!;

        const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&travelmode=driving`;

        window.open(mapsUrl, "_blank");
        setLoadingRoute(false);
      },
      () => {
        alert("Erro ao obter sua localização.");
        setLoadingRoute(false);
      }
    );
  };

  // Lógica do botão de seguir
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setCurrentUid(user.uid);

        const followerRef = doc(
          db,
          "users",
          safeUser.uid,
          "followers",
          user.uid
        );
        const docSnap = await getDoc(followerRef);
        setIsFollowing(docSnap.exists());
      } else {
        setCurrentUid(null);
        setIsFollowing(false);
      }

      const followersSnap = await getDocs(
        collection(db, "users", safeUser.uid, "followers")
      );
      setFollowersCount(followersSnap.size);

      const followingSnap = await getDocs(
        collection(db, "users", safeUser.uid, "following")
      );
      setFollowingCount(followingSnap.size);

      setLoadingFollow(false);
    });

    return () => unsubscribe();
  }, [safeUser.uid]);

  const toggleFollow = async () => {
    if (!currentUid) return;

    const followerRef = doc(db, "users", safeUser.uid, "followers", currentUid);
    const followingRef = doc(
      db,
      "users",
      currentUid,
      "following",
      safeUser.uid
    );

    try {
      const snap = await getDoc(followerRef);

      if (snap.exists()) {
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

  return (
    <section className="space-y-6">
      {/* STATUS + LOCALIZAÇÃO (condicional) */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center gap-4 text-white"
      >
        {safeUser.visible &&
          safeUser.latitude !== null &&
          safeUser.longitude !== null && (
            <>
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-red-500 text-xl" />
                <p>
                  <strong>Localização:</strong> Latitude:{" "}
                  {safeUser.latitude.toFixed(6)}, Longitude:{" "}
                  {safeUser.longitude.toFixed(6)}
                </p>
              </div>

              <button
                onClick={handleComoChegar}
                disabled={loadingRoute}
                className={`${
                  loadingRoute
                    ? "bg-indigo-400"
                    : "bg-indigo-600 hover:bg-indigo-700"
                } text-white font-semibold px-4 py-2 rounded-full transition flex items-center gap-2`}
              >
                <FaMapMarkerAlt />
                {loadingRoute ? "Carregando..." : "Como chegar"}
              </button>
            </>
          )}
      </motion.div>

      {/* ESTATÍSTICAS E BOTÃO */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="space-y-4 text-white border-t border-gray-700 pt-4"
      >
        {/* Linha 1: Botão seguir (centralizado) */}
        {currentUid && currentUid !== safeUser.uid && !loadingFollow && (
          <div className="flex justify-start">
            <button
              onClick={toggleFollow}
              className={`flex items-center gap-2 px-4 py-1 text-sm font-semibold rounded-full transition duration-300
      ${
        isFollowing
          ? "bg-red-500 hover:bg-red-600"
          : "bg-green-600 hover:bg-green-700"
      } text-white`}
            >
              {isFollowing ? (
                <>
                  <LucideUserMinus size={16} /> Deixar de seguir
                </>
              ) : (
                <>
                  <LucideUserPlus size={16} /> Seguir
                </>
              )}
            </button>
          </div>
        )}

        {/* Linha 2: Seguidores, Seguindo, Vídeos (na mesma linha) */}
        <div className="flex justify-center gap-6 flex-wrap">
          {/* Seguidores */}
          <div className="flex flex-col items-center p-4 rounded-xl shadow-md bg-white/5 min-w-[120px]">
            {loadingFollow ? (
              <span className="text-sm">Carregando...</span>
            ) : (
              <>
                <div className="text-2xl font-bold">{followersCount}</div>
                <div className="text-sm text-gray-400">Seguidores</div>
              </>
            )}
          </div>

          {/* Seguindo */}
          <div className="flex flex-col items-center p-4 rounded-xl shadow-md bg-white/5 min-w-[120px]">
            {loadingFollow ? (
              <span className="text-sm">Carregando...</span>
            ) : (
              <>
                <div className="text-2xl font-bold">{followingCount}</div>
                <div className="text-sm text-gray-400">Seguindo</div>
              </>
            )}
          </div>

          {/* Vídeos */}
          <div className="flex flex-col items-center p-4 rounded-xl shadow-md bg-white/5 min-w-[120px]">
            <div className="text-2xl font-bold text-white">{videosCount}</div>
            <span className="text-sm text-gray-400">Vídeos</span>
          </div>
        </div>
      </motion.div>

      {/* REDES SOCIAIS */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="flex gap-4 mt-4"
      >
        <FaInstagram className="text-pink-500 text-2xl cursor-pointer" />
        <FaFacebookF className="text-blue-600 text-2xl cursor-pointer" />
        <FaWhatsapp className="text-green-500 text-2xl cursor-pointer" />
        <FaTwitter className="text-white text-2xl cursor-pointer" />
        <FaYoutube className="text-red-600 text-2xl cursor-pointer" />
        <FaSnapchatGhost className="text-yellow-400 text-2xl cursor-pointer" />
      </motion.div>
    </section>
  );
}
