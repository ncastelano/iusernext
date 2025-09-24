"use client";

import { useRouter } from "next/navigation";
import {
  FaCamera,
  FaVideo,
  FaMicrophone,
  FaMusic,
  FaFilePdf,
  FaEdit,
  FaStore,
} from "react-icons/fa";
import { MdVideoLibrary, MdImage } from "react-icons/md";
import { useCallback } from "react";

export default function Publicar() {
  const router = useRouter();

  // 🔹 Variáveis de estilo responsivo
  const titleFontSize = "clamp(26px,7vw,36px)";
  const iconSize = "clamp(40px,10vw,56px)";
  const labelFontSize = "clamp(40px,10vw,56px)";

  const buildOption = useCallback(
    ({
      icon,
      label,
      onClick,
    }: {
      icon: React.ReactNode;
      label: string;
      onClick: () => void;
    }) => (
      <div
        onClick={onClick}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "start",
          justifyContent: "center",
          padding: "clamp(20px,6vw,32px)",
          cursor: "pointer",
          borderRadius: "16px",
          backgroundColor: "#111", // card mais sutil
          transition: "transform 0.2s ease, background 0.2s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.backgroundColor = "#222";
          (e.currentTarget as HTMLDivElement).style.transform = "scale(1.03)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.backgroundColor = "#111";
          (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
        }}
      >
        <div
          style={{
            fontSize: iconSize,
            color: "#fff",
            marginBottom: "12px",
          }}
        >
          {icon}
        </div>
        <div
          style={{
            fontSize: labelFontSize,
            color: "white",
            textAlign: "center",
          }}
        >
          {label}
        </div>
      </div>
    ),
    [iconSize, labelFontSize]
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        backgroundColor: "black",
        color: "white",
        padding: "clamp(20px,6vw,32px)",
        gap: "clamp(20px,5vw,28px)",
        overflowY: "auto",
      }}
    >
      {/* Título como item da lista */}
      <div
        style={{
          fontSize: titleFontSize,
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: "clamp(10px,4vw,20px)",
        }}
      >
        Escolha o jeito de compartilhar
      </div>

      {buildOption({
        icon: <FaCamera />,
        label: "Tirar Foto",
        onClick: () => router.push("/publicar/fotografar"),
      })}
      {buildOption({
        icon: <FaVideo />,
        label: "Gravar Vídeo",
        onClick: () => router.push("/publicar/filmar"),
      })}
      {buildOption({
        icon: <FaMicrophone />,
        label: "Gravar Áudio",
        onClick: () => router.push("/publicar/gravar_som"),
      })}
      {buildOption({
        icon: <MdVideoLibrary />,
        label: "Vídeo da Galeria",
        onClick: () => alert("Abrir file picker de vídeo"),
      })}
      {buildOption({
        icon: <MdImage />,
        label: "Imagem da Galeria",
        onClick: () => alert("Abrir file picker de imagem"),
      })}
      {buildOption({
        icon: <FaMusic />,
        label: "Escolher Som",
        onClick: () => alert("Abrir file picker de áudio"),
      })}
      {buildOption({
        icon: <FaFilePdf />,
        label: "Escolher PDF",
        onClick: () => alert("Abrir file picker de PDF"),
      })}
      {buildOption({
        icon: <FaEdit />,
        label: "Escrever Texto",
        onClick: () => router.push("/publicar/escrever"),
      })}
      {buildOption({
        icon: <FaStore />,
        label: "Criar Loja",
        onClick: () => router.push("/publicar/criar_loja"),
      })}

      {/* Espaço extra no fim */}
      <div style={{ height: "100px" }} />
    </div>
  );
}
