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
  const iconSize = "clamp(28px,7vw,40px)";
  const labelFontSize = "clamp(18px,5vw,24px)";
  const optionPadding = "clamp(16px,5vw,24px)"; // usado também no espaço final

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
          flexDirection: "row",
          alignItems: "center",
          gap: "clamp(12px,3vw,20px)",
          padding: optionPadding,
          cursor: "pointer",
          borderRadius: "12px",
          backgroundColor: "#111",
          transition: "transform 0.2s ease, background 0.2s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.backgroundColor = "#222";
          (e.currentTarget as HTMLDivElement).style.transform = "scale(1.02)";
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
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div
          style={{
            fontSize: labelFontSize,
            color: "white",
          }}
        >
          {label}
        </div>
      </div>
    ),
    [iconSize, labelFontSize, optionPadding]
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
        gap: "clamp(16px,4vw,24px)",
        overflowY: "auto",
        paddingBottom: `calc(${optionPadding} * 2)`, // 🔹 espaço de 2 opções no final
      }}
    >
      {/* Título */}
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
      <div style={{ height: "150px" }} />
    </div>
  );
}
