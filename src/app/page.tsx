"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  // estilo compartilhado para os cards
  const cardStyle: React.CSSProperties = {
    cursor: "pointer",
    padding: "2rem 3rem",
    borderRadius: "16px",
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "white",
    minWidth: "220px",
    maxWidth: "250px",
    textAlign: "center",
    transition: "transform 0.3s, box-shadow 0.3s",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "0.5rem",
    flexDirection: "row", // só para o iUser vai manter row
    height: "120px", // altura fixa para ambos
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100dvh",
        gap: "2rem",
        flexWrap: "wrap",
        padding: "1rem",
        background: "linear-gradient(135deg, #0f766e, #0f5976, #000000)",
      }}
    >
      {/* Card iUser */}
      <div
        style={cardStyle}
        onClick={() => router.push("/inicio")}
        onMouseEnter={(e) => {
          const target = e.currentTarget as HTMLDivElement;
          target.style.transform = "scale(1.05)";
          target.style.boxShadow = "0 8px 20px rgba(0,0,0,0.4)";
        }}
        onMouseLeave={(e) => {
          const target = e.currentTarget as HTMLDivElement;
          target.style.transform = "scale(1)";
          target.style.boxShadow = "none";
        }}
      >
        <Image src="/icon/icon1.png" alt="Logo iUser" width={50} height={50} />
        <h2 style={{ margin: 0, fontSize: "1.5rem" }}>iUser</h2>
      </div>

      {/* Card iUser Training */}
      <div
        style={{
          ...cardStyle,
          flexDirection: "row", // texto sozinho
          fontFamily: '"Caveat", cursive',
          fontSize: "2rem",
          fontWeight: 600,
          textShadow: "0 4px 20px rgba(0,0,0,0.9)",
        }}
        onClick={() => router.push("/training/login")}
        onMouseEnter={(e) => {
          const target = e.currentTarget as HTMLDivElement;
          target.style.transform = "scale(1.05)";
          target.style.boxShadow = "0 8px 20px rgba(0,0,0,0.4)";
        }}
        onMouseLeave={(e) => {
          const target = e.currentTarget as HTMLDivElement;
          target.style.transform = "scale(1)";
          target.style.boxShadow = "none";
        }}
      >
        iUser <span style={{ color: "#22c55e" }}>Training</span>
      </div>
    </div>
  );
}
