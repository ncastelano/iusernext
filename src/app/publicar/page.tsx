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

export default function Publicar() {
  const router = useRouter();

  // 🔹 Variáveis de estilo responsivo
  const titleFontSize = "clamp(26px,7vw,36px)";
  const iconSize = "clamp(28px,7vw,40px)";
  const labelFontSize = "clamp(18px,5vw,24px)";
  const optionPadding = "clamp(16px,5vw,24px)";

  // 🔹 Estilo base para cada opção
  const optionStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "clamp(12px,3vw,20px)",
    padding: optionPadding,
    cursor: "pointer",
    borderRadius: "12px",
    backgroundColor: "#111",
    transition: "transform 0.2s ease, background 0.2s ease",
  };

  const hoverIn = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.backgroundColor = "#222";
    e.currentTarget.style.transform = "scale(1.02)";
  };

  const hoverOut = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.backgroundColor = "#111";
    e.currentTarget.style.transform = "scale(1)";
  };

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
        paddingBottom: `calc(${optionPadding} * 2)`,
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

      {/* Tirar Foto */}
      <div
        style={optionStyle}
        onClick={() => router.push("/publicar/fotografar")}
        onMouseEnter={hoverIn}
        onMouseLeave={hoverOut}
      >
        <div style={{ fontSize: iconSize, color: "#fff" }}>
          <FaCamera />
        </div>
        <div style={{ fontSize: labelFontSize, color: "white" }}>
          Fotografar
        </div>
      </div>

      {/* Gravar Vídeo */}
      <div
        style={optionStyle}
        onClick={() => router.push("/publicar/filmar")}
        onMouseEnter={hoverIn}
        onMouseLeave={hoverOut}
      >
        <div style={{ fontSize: iconSize, color: "#fff" }}>
          <FaVideo />
        </div>
        <div style={{ fontSize: labelFontSize, color: "white" }}>Filmar</div>
      </div>

      {/* Gravar Áudio */}
      <div
        style={optionStyle}
        onClick={() => router.push("/publicar/gravar_som")}
        onMouseEnter={hoverIn}
        onMouseLeave={hoverOut}
      >
        <div style={{ fontSize: iconSize, color: "#fff" }}>
          <FaMicrophone />
        </div>
        <div style={{ fontSize: labelFontSize, color: "white" }}>
          Gravar Áudio
        </div>
      </div>

      {/* Vídeo da Galeria */}
      <div
        style={optionStyle}
        onClick={() => alert("Abrir file picker de vídeo")}
        onMouseEnter={hoverIn}
        onMouseLeave={hoverOut}
      >
        <div style={{ fontSize: iconSize, color: "#fff" }}>
          <MdVideoLibrary />
        </div>
        <div style={{ fontSize: labelFontSize, color: "white" }}>
          Escolher Vídeo
        </div>
      </div>

      {/* Imagem da Galeria */}
      <div
        style={optionStyle}
        onClick={() => router.push("/publicar/escolher_imagem")}
        onMouseEnter={hoverIn}
        onMouseLeave={hoverOut}
      >
        <div style={{ fontSize: iconSize, color: "#fff" }}>
          <MdImage />
        </div>
        <div style={{ fontSize: labelFontSize, color: "white" }}>
          Escolher Imagem
        </div>
      </div>

      {/* Escolher Som */}
      <div
        style={optionStyle}
        onClick={() => router.push("/publicar/escolher_som")}
        onMouseEnter={hoverIn}
        onMouseLeave={hoverOut}
      >
        <div style={{ fontSize: iconSize, color: "#fff" }}>
          <FaMusic />
        </div>
        <div style={{ fontSize: labelFontSize, color: "white" }}>
          Escolher Som
        </div>
      </div>

      {/* Escolher PDF */}
      <div
        style={optionStyle}
        onClick={() => alert("Abrir file picker de PDF")}
        onMouseEnter={hoverIn}
        onMouseLeave={hoverOut}
      >
        <div style={{ fontSize: iconSize, color: "#fff" }}>
          <FaFilePdf />
        </div>
        <div style={{ fontSize: labelFontSize, color: "white" }}>
          Escolher PDF
        </div>
      </div>

      {/* Escrever Texto */}
      <div
        style={optionStyle}
        onClick={() => router.push("/publicar/escrever")}
        onMouseEnter={hoverIn}
        onMouseLeave={hoverOut}
      >
        <div style={{ fontSize: iconSize, color: "#fff" }}>
          <FaEdit />
        </div>
        <div style={{ fontSize: labelFontSize, color: "white" }}>
          Escrever Texto
        </div>
      </div>

      {/* Criar Loja */}
      <div
        style={optionStyle}
        onClick={() => router.push("/publicar/criar_loja")}
        onMouseEnter={hoverIn}
        onMouseLeave={hoverOut}
      >
        <div style={{ fontSize: iconSize, color: "#fff" }}>
          <FaStore />
        </div>
        <div style={{ fontSize: labelFontSize, color: "white" }}>
          Criar Loja
        </div>
      </div>
    </div>
  );
}
