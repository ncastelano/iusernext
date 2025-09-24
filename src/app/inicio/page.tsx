"use client";

import React, { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

interface UserData {
  name: string;
  image?: string;
}

export default function DashboardPage() {
  const [userData, setUserData] = useState<UserData | null>(null);

  // =========================
  // Autenticação e dados do usuário
  // =========================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUserData(null);
        return;
      }

      try {
        const userRef = doc(db, "users", currentUser.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          const data = snap.data() as UserData;
          setUserData({ name: data.name, image: data.image });
        } else {
          console.warn("Usuário não encontrado no Firestore");
        }
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
      }
    });

    return () => unsubscribe();
  }, []);

  // =========================
  // Renderização
  // =========================
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100dvh",
        gap: "1rem", // espaçamento entre elementos
        padding: "1rem",
        width: "100%",
        boxSizing: "border-box",
        backgroundColor: "#000", // fundo preto
      }}
    >
      {/* Card do usuário */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "1rem",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "16px",
          padding: "clamp(1rem, 2vw, 2rem) clamp(2rem, 4vw, 3rem)", // Espaço interno (top/bottom e left/right)
          width: "80%", // Largura relativa ao container (ajustável)
          maxWidth: "500px", // Máximo 500px para manter retângulo horizontal
          //boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
        }}
      >
        <img
          src={userData?.image || "/default-profile.png"}
          alt="Foto de perfil"
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            border: "2px solid #22c55e",
            objectFit: "cover",
          }}
        />
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "1.2rem",
              fontWeight: 600,
              color: "#fff",
            }}
          >
            {userData?.name || "Usuário"}
          </h2>
        </div>
      </div>
    </main>
  );
}
