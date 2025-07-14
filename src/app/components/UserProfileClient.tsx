"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { User } from "types/user";
import { Video } from "types/video";
import { UserSettingsButton } from "../components/UserSettingsButton";
import { AgendaOf } from "./AgendaOf";

interface UserProfileClientProps {
  safeUser: User & {
    latitude: number | null;
    longitude: number | null;
    visible: boolean;
  };
  videos: Video[];
}

export default function UserProfileClient({
  safeUser,
  videos,
}: UserProfileClientProps) {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const listItemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  };

  return (
    <main className="max-w-5xl mx-auto p-8 min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Perfil */}
      <motion.section
        className="relative mb-12 overflow-hidden rounded-xl shadow-2xl"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.div
          className="w-full relative"
          style={{ height: 200 }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Image
            src={safeUser.image || "/default-profile.png"}
            alt={`Foto de ${safeUser.name}`}
            fill
            style={{ objectFit: "cover" }}
            priority
          />
          {/* Degradê no topo */}
          <div
            className="absolute bottom-0 left-0 w-full h-20 pointer-events-none"
            style={{
              background: "linear-gradient(to top, rgb(0, 0, 0), transparent)", // 0.95 é mais escuro
            }}
          />
        </motion.div>

        {/* Rodapé com nome e username */}
        <motion.div
          className="absolute bottom-0 left-0 w-full flex items-center justify-start px-6 gap-3"
          style={{ bottom: "8px" }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h1 className="text-white text-4xl font-extrabold drop-shadow-lg">
            @{safeUser.name}
          </h1>
        </motion.div>
      </motion.section>

      {/* Informações */}
      <motion.section
        className="bg-transparent rounded-xl p-6 shadow-xl space-y-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <h2 className="text-3xl font-semibold text-white border-b border-white/20 pb-2">
          Informações
        </h2>
        <AgendaOf username={safeUser.name} />
        <p className="text-white text-lg">
          <strong>Email:</strong>{" "}
          <span className="text-white/80">{safeUser.email}</span>
        </p>

        <p className="text-white text-lg">
          <strong>Localização:</strong>{" "}
          <span className="text-white/80">
            {safeUser.latitude !== null && safeUser.longitude !== null
              ? `Latitude: ${safeUser.latitude.toFixed(
                  6
                )}, Longitude: ${safeUser.longitude.toFixed(6)}`
              : "Não informado"}
          </span>
        </p>

        <p className="text-white text-lg">
          <strong>Status:</strong>{" "}
          <span
            className={`inline-block px-5 py-1 rounded-full text-white font-semibold transition-colors duration-300 ${
              safeUser.visible ? "bg-green-600" : "bg-gray-500"
            }`}
          >
            {safeUser.visible ? "Visível" : "Oculto / Não informado"}
          </span>
        </p>

        <UserSettingsButton profileUid={safeUser.uid} />
      </motion.section>

      {/* Vídeos */}
      <motion.section
        className="mt-12"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <h2 className="text-3xl font-semibold mb-6 text-white flex items-center gap-3">
          Vídeos de {safeUser.name}
          <span className="bg-indigo-700 text-sm px-3 py-1 rounded-full font-mono">
            {videos.length}
          </span>
        </h2>

        {videos.length === 0 ? (
          <p className="text-gray-400 text-center text-lg">
            Nenhum vídeo encontrado.
          </p>
        ) : (
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {videos.map((video, i) => (
              <motion.li
                key={video.videoID}
                className="aspect-video w-full rounded-lg shadow-2xl overflow-hidden cursor-pointer hover:scale-105 transform transition-transform duration-300"
                variants={listItemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  href={`/${encodeURIComponent(
                    safeUser.name
                  )}/${encodeURIComponent(video.videoID)}`}
                  className="block w-full h-full"
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={video.thumbnailUrl || "/default-thumbnail.png"}
                      alt={`Thumbnail do vídeo: ${video.artistSongName}`}
                      fill
                      className="object-cover"
                      priority={i < 3}
                    />
                  </div>
                </Link>
              </motion.li>
            ))}
          </ul>
        )}
      </motion.section>
    </main>
  );
}
