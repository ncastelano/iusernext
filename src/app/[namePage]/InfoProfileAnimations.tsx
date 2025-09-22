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

  // estilo base de box estatística
  const statBox: React.CSSProperties = {
    flex: "1",
    minWidth: "120px",
    background: "rgba(255,255,255,0.05)",
    borderRadius: "12px",
    padding: "1rem",
    textAlign: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
  };

  return (
    <section
      style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
    >
      {/* STATUS + LOCALIZAÇÃO */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          color: "#fff",
        }}
      >
        {safeUser.visible &&
          safeUser.latitude !== null &&
          safeUser.longitude !== null && (
            <>
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <FaMapMarkerAlt
                  style={{ color: "#ef4444", fontSize: "1.25rem" }}
                />
                <p style={{ margin: 0 }}>
                  <strong>Localização:</strong> Lat:{" "}
                  {safeUser.latitude.toFixed(6)}, Lng:{" "}
                  {safeUser.longitude.toFixed(6)}
                </p>
              </div>

              <button
                onClick={handleComoChegar}
                disabled={loadingRoute}
                style={{
                  background: loadingRoute ? "#818cf8" : "#4f46e5",
                  color: "#fff",
                  fontWeight: 600,
                  padding: "0.6rem 1.2rem",
                  borderRadius: "9999px",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#4338ca")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#4f46e5")
                }
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
        style={{
          borderTop: "1px solid rgba(255,255,255,0.2)",
          paddingTop: "1rem",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {/* Botão seguir */}
        {currentUid && currentUid !== safeUser.uid && !loadingFollow && (
          <div>
            <button
              onClick={toggleFollow}
              style={{
                background: isFollowing ? "#ef4444" : "#16a34a",
                color: "#fff",
                fontWeight: 600,
                padding: "0.5rem 1.2rem",
                borderRadius: "9999px",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = isFollowing
                  ? "#dc2626"
                  : "#15803d")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = isFollowing
                  ? "#ef4444"
                  : "#16a34a")
              }
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

        {/* Estatísticas */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div style={statBox}>
            {loadingFollow ? (
              <span style={{ fontSize: "0.9rem" }}>Carregando...</span>
            ) : (
              <>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                  {followersCount}
                </div>
                <div style={{ fontSize: "0.9rem", color: "#9ca3af" }}>
                  Seguidores
                </div>
              </>
            )}
          </div>
          <div style={statBox}>
            {loadingFollow ? (
              <span style={{ fontSize: "0.9rem" }}>Carregando...</span>
            ) : (
              <>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                  {followingCount}
                </div>
                <div style={{ fontSize: "0.9rem", color: "#9ca3af" }}>
                  Seguindo
                </div>
              </>
            )}
          </div>
          <div style={statBox}>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              {videosCount}
            </div>
            <span style={{ fontSize: "0.9rem", color: "#9ca3af" }}>Vídeos</span>
          </div>
        </div>
      </motion.div>

      {/* REDES SOCIAIS */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        style={{
          display: "flex",
          gap: "1rem",
          marginTop: "1rem",
          fontSize: "1.6rem",
        }}
      >
        <FaInstagram style={{ color: "#ec4899", cursor: "pointer" }} />
        <FaFacebookF style={{ color: "#3b82f6", cursor: "pointer" }} />
        <FaWhatsapp style={{ color: "#22c55e", cursor: "pointer" }} />
        <FaTwitter style={{ color: "#e5e7eb", cursor: "pointer" }} />
        <FaYoutube style={{ color: "#ef4444", cursor: "pointer" }} />
        <FaSnapchatGhost style={{ color: "#facc15", cursor: "pointer" }} />
      </motion.div>
    </section>
  );
}
