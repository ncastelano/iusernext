"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface UserData {
  uid: string;
  name: string;
  image?: string;
  namePage?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);

  // estilo base de cards
  const cardStyle: React.CSSProperties = {
    flex: "1",
    minWidth: "220px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "16px",
    padding: "1.5rem",
    backdropFilter: "blur(10px)",
    boxShadow: "0 8px 20px rgba(0,0,0,0.35)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.8rem",
    cursor: "pointer",
    transition: "transform 0.3s, box-shadow 0.3s",
  };

  const hoverEffect = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    el.style.transform = "translateY(-6px)";
    el.style.boxShadow = "0 12px 25px rgba(0,0,0,0.5)";
  };

  const leaveEffect = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    el.style.transform = "translateY(0)";
    el.style.boxShadow = "0 8px 20px rgba(0,0,0,0.35)";
  };

  // Buscar usuário no Firestore
  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        const userRef = doc(db, "users", currentUser.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          setUserData(snap.data() as UserData);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
      }
    };

    fetchUser();
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
        color: "#fff",
        padding: "2rem",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
        }}
      >
        {/* Header Perfil */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "16px",
            padding: "1.5rem",
            boxShadow: "0 8px 20px rgba(0,0,0,0.35)",
          }}
        >
          <img
            src={userData?.image || "/default-profile.png"}
            alt="Foto de perfil"
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              border: "3px solid #22c55e",
              objectFit: "cover",
            }}
          />
          <div>
            <h2 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 600 }}>
              {userData?.name || "Usuário"}
            </h2>
            <p style={{ margin: 0, opacity: 0.8 }}>
              @{userData?.namePage || "meuPerfil"}
            </p>
          </div>
        </header>

        {/* Cards de estatísticas */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <div
            style={cardStyle}
            onMouseEnter={hoverEffect}
            onMouseLeave={leaveEffect}
          >
            <h3 style={{ margin: 0, fontSize: "1.2rem" }}>Exibições</h3>
            <p style={{ fontSize: "2rem", fontWeight: 700, color: "#22c55e" }}>
              1.254
            </p>
          </div>
          <div
            style={cardStyle}
            onMouseEnter={hoverEffect}
            onMouseLeave={leaveEffect}
          >
            <h3 style={{ margin: 0, fontSize: "1.2rem" }}>Mensagens</h3>
            <p style={{ fontSize: "2rem", fontWeight: 700, color: "#3b82f6" }}>
              87
            </p>
          </div>
          <div
            style={cardStyle}
            onMouseEnter={hoverEffect}
            onMouseLeave={leaveEffect}
          >
            <h3 style={{ margin: 0, fontSize: "1.2rem" }}>Seguidores</h3>
            <p style={{ fontSize: "2rem", fontWeight: 700, color: "#fbbf24" }}>
              2.430
            </p>
          </div>
          <div
            style={cardStyle}
            onMouseEnter={hoverEffect}
            onMouseLeave={leaveEffect}
          >
            <h3 style={{ margin: 0, fontSize: "1.2rem" }}>Seguindo</h3>
            <p style={{ fontSize: "2rem", fontWeight: 700, color: "#ec4899" }}>
              321
            </p>
          </div>
        </section>

        {/* Atalhos de navegação */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <div
            style={cardStyle}
            onClick={() => router.push("/profile/videos")}
            onMouseEnter={hoverEffect}
            onMouseLeave={leaveEffect}
          >
            🎥 Vídeos
          </div>
          <div
            style={cardStyle}
            onClick={() => router.push("/profile/comments")}
            onMouseEnter={hoverEffect}
            onMouseLeave={leaveEffect}
          >
            💬 Comentários
          </div>
          <div
            style={cardStyle}
            onClick={() => router.push("/profile/settings")}
            onMouseEnter={hoverEffect}
            onMouseLeave={leaveEffect}
          >
            ⚙️ Configurações
          </div>
          <div
            style={cardStyle}
            onClick={() => router.push("/profile/market")}
            onMouseEnter={hoverEffect}
            onMouseLeave={leaveEffect}
          >
            🛒 Loja / Produtos
          </div>
        </section>
      </div>
    </main>
  );
}
