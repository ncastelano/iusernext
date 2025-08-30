// app/personal/page.tsx
import React from "react";
import { FaWhatsapp, FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";

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
  photoUrl: "/images/personal.jpg",
  socialLinks: {
    whatsapp: "https://wa.me/559999999999",
    facebook: "https://facebook.com/usuario",
    instagram: "https://instagram.com/usuario",
    youtube: "https://youtube.com/usuario",
    x: "https://twitter.com/usuario",
  },
};

const PersonalPage: React.FC = () => {
  const { name, age, profession, photoUrl, socialLinks } = personalData;

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen p-6
      bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white"
    >
      {/* Foto do perfil */}
      <div className="w-44 h-44 rounded-full border-4 border-white overflow-hidden mb-4 shadow-lg">
        <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
      </div>

      {/* Nome e descrição */}
      <h1 className="text-4xl font-bold mb-2">{name}</h1>
      <p className="text-gray-300 mb-4">
        {age} anos - {profession}
      </p>

      {/* Redes sociais */}
      <div className="flex space-x-6 mt-4">
        {socialLinks.whatsapp && (
          <a
            href={socialLinks.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaWhatsapp
              size={30}
              className="text-green-400 hover:scale-110 transition-transform"
            />
          </a>
        )}
        {socialLinks.facebook && (
          <a
            href={socialLinks.facebook}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFacebook
              size={30}
              className="text-blue-500 hover:scale-110 transition-transform"
            />
          </a>
        )}
        {socialLinks.instagram && (
          <a
            href={socialLinks.instagram}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram
              size={30}
              className="text-pink-400 hover:scale-110 transition-transform"
            />
          </a>
        )}
        {socialLinks.youtube && (
          <a
            href={socialLinks.youtube}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaYoutube
              size={30}
              className="text-red-500 hover:scale-110 transition-transform"
            />
          </a>
        )}
      </div>
    </div>
  );
};

export default PersonalPage;
