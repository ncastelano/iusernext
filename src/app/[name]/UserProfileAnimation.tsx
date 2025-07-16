"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface UserProfileAnimationsProps {
  imageUrl: string;
  userName: string;
}

export default function UserProfileAnimations({
  imageUrl,
  userName,
}: UserProfileAnimationsProps) {
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
        className="object-cover" // sem rounded!
        priority
      />

      {/* Gradiente escurecendo de cima para baixo */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black pointer-events-none" />

      {/* Nome do usuário com @, no rodapé da imagem */}
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
