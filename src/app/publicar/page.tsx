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
          padding: "12px 16px",
          borderBottom: "1px solid #333",
          cursor: "pointer",
        }}
      >
        <div style={{ fontSize: "28px", marginRight: "16px", color: "white" }}>
          {icon}
        </div>
        <div style={{ flex: 1, fontSize: "18px", color: "white" }}>{label}</div>
        <div style={{ fontSize: "22px", color: "white" }}>{">"}</div>
      </div>
    ),
    []
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh", // 🔹 usa dvh para altura total responsiva
        backgroundColor: "black",
        color: "white",
      }}
    >
      {/* AppBar */}
      <header
        style={{
          backgroundColor: "black",
          padding: "16px",
          borderBottom: "1px solid #333",
          fontSize: "20px",
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
      <footer
        style={{
          backgroundColor: "#111",
          padding: "12px",
          borderTop: "1px solid #333",
          textAlign: "center",
        }}
      >
        BottomNavBar aqui
      </footer>
    </div>
  );
}
