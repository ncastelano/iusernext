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
  const headerFontSize = "clamp(36px,10vw,52px)";
  const optionPaddingY = "clamp(14px,2vw,20px)";
  const optionPaddingX = "clamp(16px,6vw,28px)";
  const iconSize = "clamp(36px,9vw,40px)";
  const labelFontSize = "clamp(30px,8vw,38px)";
  const arrowFontSize = "clamp(30px,8vw,38px)";

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
          alignItems: "center",
          padding: `${optionPaddingY} ${optionPaddingX}`,
          borderBottom: "1px solid #333",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            fontSize: iconSize,
            marginRight: "clamp(20px,4vw,24px)",
            color: "white",
          }}
        >
          {icon}
        </div>
        <div
          style={{
            flex: 1,
            fontSize: labelFontSize,
            color: "white",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: arrowFontSize,
            color: "white",
          }}
        >
          {">"}
        </div>
      </div>
    ),
    [iconSize, labelFontSize, arrowFontSize, optionPaddingY, optionPaddingX]
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        backgroundColor: "black",
        color: "white",
      }}
    >
      {/* AppBar */}
      <header
        style={{
          backgroundColor: "black",
          padding: "clamp(20px,6vw,40px)",
          borderBottom: "1px solid #333",
          fontSize: headerFontSize,
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        Escolha o jeito de compartilhar
      </header>

      {/* Lista de opções */}
      <div style={{ flex: 1, overflowY: "auto" }}>
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
          label: "Escolher Vídeo da Galeria",
          onClick: () => alert("Abrir file picker de vídeo"),
        })}
        {buildOption({
          icon: <MdImage />,
          label: "Escolher Imagem da Galeria",
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
      </div>
    </div>
  );
}
