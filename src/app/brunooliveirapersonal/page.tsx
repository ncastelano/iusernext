// app/personal/page.tsx

"use client";

import React from "react";
import { FaWhatsapp, FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import { motion } from "framer-motion";

interface PersonalProfileProps {
  name: string;
  age: number;
  profession: string;
  photoUrl: string;
  socialLinks: {
    whatsapp?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
    x?: string;
  };
}

const personalData: PersonalProfileProps = {
  name: "João Silva",
  age: 28,
  profession: "Personal Trainer",
  photoUrl:
    "https://i.pinimg.com/736x/de/9a/30/de9a30541e46b1ba789732de6e415a1c.jpg",
  socialLinks: {
    whatsapp: "https://wa.me/559999999999",
    facebook: "https://facebook.com/usuario",
    instagram: "https://instagram.com/usuario",
    youtube: "https://youtube.com/usuario",
  },
};

const PersonalPage: React.FC = () => {
  const { name, age, profession, photoUrl, socialLinks } = personalData;

  // Variants para animação sequencial
  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.2, // cada filho entra com delay de 0.2s
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen p-6
      bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Foto do perfil */}
      <motion.div
        variants={item} // entrada fade+slide
      >
        <motion.div
          animate={{ y: [0, 5, 0, 5, 0] }} // flutuação contínua
          transition={{
            delay: 0.6, // espera terminar a entrada
            duration: 4,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
          className="w-44 h-44 rounded-full border-4 border-white overflow-hidden mb-4 shadow-lg"
        >
          <img
            src={photoUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        </motion.div>
      </motion.div>

      {/* Nome e descrição */}
      <motion.h1 className="text-4xl font-bold mb-2" variants={item}>
        {name}
      </motion.h1>
      <motion.p className="text-gray-300 mb-4" variants={item}>
        {age} anos - {profession}
      </motion.p>

      {/* Redes sociais */}
      <motion.div className="flex space-x-6 mt-4" variants={item}>
        {socialLinks.whatsapp && (
          <motion.a
            href={socialLinks.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.2 }}
          >
            <FaWhatsapp size={30} className="text-green-400" />
          </motion.a>
        )}
        {socialLinks.facebook && (
          <motion.a
            href={socialLinks.facebook}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.2 }}
          >
            <FaFacebook size={30} className="text-blue-500" />
          </motion.a>
        )}
        {socialLinks.instagram && (
          <motion.a
            href={socialLinks.instagram}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.2 }}
          >
            <FaInstagram size={30} className="text-pink-400" />
          </motion.a>
        )}
        {socialLinks.youtube && (
          <motion.a
            href={socialLinks.youtube}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.2 }}
          >
            <FaYoutube size={30} className="text-red-500" />
          </motion.a>
        )}
      </motion.div>
    </motion.div>
  );
};

export default PersonalPage;
