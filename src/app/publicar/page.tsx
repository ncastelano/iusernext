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
import BottomBar from "../components/Bottombar";

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
          padding: "clamp(10px,2vw,16px) clamp(12px,4vw,24px)",
          borderBottom: "1px solid #333",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            fontSize: "clamp(24px,5vw,32px)",
            marginRight: "clamp(12px,4vw,16px)",
            color: "white",
          }}
        >
          {icon}
        </div>
        <div
          style={{
            flex: 1,
            fontSize: "clamp(16px,4vw,20px)",
            color: "white",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: "clamp(18px,4vw,22px)",
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
          fontSize: "clamp(18px,4vw,22px)",
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

      {/* BottomNav */}
      <BottomBar />
    </div>
  );
}
