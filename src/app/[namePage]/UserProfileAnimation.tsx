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
      className="relative w-full aspect-[16/9] overflow-hidden"
    >
      <Image
        src={imageUrl}
        alt={`Foto de ${userName}`}
        fill
        className="object-cover"
        priority
      />

      {/* Ícone no canto superior direito */}
      <button
        onClick={abrirImagemOriginal}
        aria-label="Abrir imagem original"
        className="absolute top-4 right-4 text-white bg-transparent bg-opacity-40 rounded p-2 hover:bg-opacity-70 transition"
        style={{ userSelect: "none" }}
      >
        <Fullscreen />
      </button>

      {/* Nome do usuário com @ no rodapé */}
      <motion.h1
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="absolute bottom-4 left-4 text-white text-2xl font-semibold"
        style={{ userSelect: "none" }}
      >
        @{userName}
      </motion.h1>
    </motion.div>
  );
}
