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
          padding: "clamp(14px,2vw,20px) clamp(16px,6vw,28px)",
          borderBottom: "1px solid #333",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            fontSize: "clamp(28px,6vw,36px)",
            marginRight: "clamp(12px,4vw,16px)",
            color: "white",
          }}
        >
          {icon}
        </div>
        <div
          style={{
            flex: 1,
            fontSize: "clamp(20px,6vw,26px)",
            color: "white",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: "clamp(22px,5vw,26px)",
            color: "white",
          }}
        >
          {">"}
        </div>
      </div>
    ),
    []
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh", // altura total responsiva
        backgroundColor: "black",
        color: "white",
      }}
    >
      {/* AppBar */}
      <header
        style={{
          backgroundColor: "black",
          padding: "clamp(12px,3vw,20px)",
          borderBottom: "1px solid #333",
          fontSize: "clamp(32px,8vw,40px)",
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
