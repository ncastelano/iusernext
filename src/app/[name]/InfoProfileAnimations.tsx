"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FaInstagram,
  FaFacebookF,
  FaWhatsapp,
  FaTwitter,
  FaYoutube,
  FaSnapchatGhost,
  FaMapMarkerAlt,
  FaUserFriends,
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
  const [loadingRoute, setLoadingRoute] = useState(false);

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
  ];

  const statsList = [
    { label: "Seguidores", content: "1.2k" },
    { label: "Seguindo", content: "320" },
    { label: "Curtidas", content: "4.5k" },
    { label: "Desejados", content: "78" },
    { label: "Vídeos", content: videosCount },
  ];

  return (
    <section className="space-y-6">
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="flex justify-around text-white border-t border-gray-700 pt-4"
      >
        {statsList.map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            <span className="text-xl font-bold">{item.content}</span>
            <span className="text-sm text-gray-400">{item.label}</span>
          </div>
        ))}
      </motion.div>

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
        <button
          onClick={handleComoChegar}
          disabled={loadingRoute}
          className={`${
            loadingRoute ? "bg-indigo-400" : "bg-indigo-600 hover:bg-indigo-700"
          } text-white font-semibold px-4 py-2 rounded-full transition flex items-center gap-2`}
        >
          <FaMapMarkerAlt />
          {loadingRoute ? "Carregando..." : "Como chegar"}
        </button>
      </motion.div>
    </section>
  );
}
