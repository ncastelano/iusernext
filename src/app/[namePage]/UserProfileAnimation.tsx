"use client";

import { motion } from "framer-motion";
import { Fullscreen } from "lucide-react";
import Image from "next/image";

interface UserProfileAnimationsProps {
  imageUrl: string;
  userName: string;
}

export default function UserProfileAnimations({
  imageUrl,
  userName,
}: UserProfileAnimationsProps) {
  // Função para abrir a imagem original em nova aba
  const abrirImagemOriginal = () => {
    window.open(imageUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "16/9",
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: "0 12px 30px rgba(0,0,0,0.5)",
      }}
    >
      {/* Imagem de fundo */}
      <Image
        src={imageUrl}
        alt={`Foto de ${userName}`}
        fill
        priority
        style={{
          objectFit: "cover",
          filter: "brightness(0.85)",
        }}
      />

      {/* Ícone no canto superior direito */}
      <button
        onClick={abrirImagemOriginal}
        aria-label="Abrir imagem original"
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          background: "rgba(255, 255, 255, 0)",
          border: "1px solid rgba(255, 255, 255, 0)",
          borderRadius: "12px",
          padding: "0px",
          cursor: "pointer",
          color: "#fff",
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.3)";
          e.currentTarget.style.transform = "scale(1.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.15)";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <Fullscreen size={20} />
      </button>

      {/* Nome do usuário com @ no rodapé */}
      <motion.h1
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        style={{
          position: "absolute",
          bottom: "0px",
          left: "20px",
          color: "#fff",
          fontSize: "1.8rem",
          fontWeight: 700,
          textShadow: "0 4px 10px rgba(0,0,0,0.6)",
          userSelect: "none",
        }}
      >
        @{userName}
      </motion.h1>
    </motion.div>
  );
}
