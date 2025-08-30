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
  photoUrl: "/images/personal.jpg", // coloque sua imagem na pasta public/images
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      {/* Foto do perfil */}
      <img
        src={photoUrl}
        alt={name}
        className="w-40 h-40 rounded-full border-4 border-indigo-500 object-cover mb-4"
      />

      {/* Nome e descrição */}
      <h1 className="text-3xl font-bold mb-2">{name}</h1>
      <p className="text-gray-700 mb-2">
        {age} anos - {profession}
      </p>

      {/* Redes sociais */}
      <div className="flex space-x-4 mt-4">
        {socialLinks.whatsapp && (
          <a
            href={socialLinks.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaWhatsapp
              size={28}
              className="text-green-500 hover:scale-110 transition-transform"
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
              size={28}
              className="text-blue-600 hover:scale-110 transition-transform"
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
              size={28}
              className="text-pink-500 hover:scale-110 transition-transform"
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
              size={28}
              className="text-red-600 hover:scale-110 transition-transform"
            />
          </a>
        )}
      </div>
    </div>
  );
};

export default PersonalPage;
