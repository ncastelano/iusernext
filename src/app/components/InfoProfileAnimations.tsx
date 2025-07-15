"use client";

import { motion } from "framer-motion";
import {
  FaInstagram,
  FaFacebookF,
  FaWhatsapp,
  FaTwitter,
  FaYoutube,
  FaSnapchatGhost,
  FaMapMarkerAlt,
  FaHeart,
  FaGift,
  FaUserFriends,
  FaUserPlus,
} from "react-icons/fa";
import { User } from "types/user";

export default function InfoProfileAnimations({
  safeUser,
  videosCount,
}: {
  safeUser: User & {
    latitude: number | null;
    longitude: number | null;
    visible: boolean;
  };
  videosCount: number;
}) {
  const infoList = [
    {
      label: "Email",
      content: safeUser.email,
      icon: <FaUserFriends className="text-blue-400" />,
    },
    {
      label: "Localização",
      content:
        safeUser.latitude !== null && safeUser.longitude !== null
          ? `Latitude: ${safeUser.latitude.toFixed(
              6
            )}, Longitude: ${safeUser.longitude.toFixed(6)}`
          : "Não informado",
      icon: <FaMapMarkerAlt className="text-red-500" />,
    },
    {
      label: "Status",
      content: safeUser.visible ? "Visível" : "Oculto / Não informado",
      icon: (
        <span
          className={`text-white px-2 py-1 rounded-full text-sm ${
            safeUser.visible ? "bg-green-600" : "bg-gray-500"
          }`}
        >
          {safeUser.visible ? "Visível" : "Oculto"}
        </span>
      ),
    },
    {
      label: "Seguidores",
      content: "1.2k",
      icon: <FaUserFriends className="text-yellow-400" />,
    },
    {
      label: "Seguindo",
      content: "320",
      icon: <FaUserPlus className="text-purple-400" />,
    },
    {
      label: "Curtidas",
      content: "4.5k",
      icon: <FaHeart className="text-pink-500" />,
    },
    {
      label: "Desejados",
      content: "78",
      icon: <FaGift className="text-orange-400" />,
    },
    {
      label: "Vídeos",
      content: videosCount,
      icon: <FaYoutube className="text-red-500" />,
    },
  ];

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold border-b border-gray-700 pb-2 text-white">
        Informações
      </h2>

      {infoList.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 * index, duration: 0.5 }}
          className="flex items-center gap-4 text-white"
        >
          <span className="text-xl">{item.icon}</span>
          <p>
            <strong>{item.label}:</strong> <span>{item.content}</span>
          </p>
        </motion.div>
      ))}

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

      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="flex gap-4 mt-6"
      >
        <button className="bg-white text-black font-semibold px-4 py-2 rounded-full hover:bg-gray-200 transition">
          Seguir
        </button>
        <button className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-full hover:bg-indigo-700 transition flex items-center gap-2">
          <FaMapMarkerAlt /> Como chegar
        </button>
      </motion.div>
    </section>
  );
}
