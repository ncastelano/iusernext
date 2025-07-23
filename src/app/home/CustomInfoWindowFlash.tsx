"use client";

import Image from "next/image";

import { VideoData } from "types/markerTypes";

interface Props {
  video: VideoData;
  onClose: () => void;
}

export default function CustomInfoWindowFlash({ video, onClose }: Props) {
  return (
    <div
      style={{
        position: "relative",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        background: "rgba(255, 255, 255, 0.15)",
        borderRadius: 16,
        padding: 12,
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        width: 240,
        textAlign: "center",
        color: "#000", // Texto preto
        fontFamily: "sans-serif",
      }}
    >
      {/* Botão de fechar com círculo vermelho */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          background: "rgba(255, 0, 0, 0.1)",
          backdropFilter: "blur(4px)",
          border: "1px solid rgba(255, 0, 0, 0.3)",
          color: "red",
          borderRadius: "50%",
          width: 28,
          height: 28,
          fontWeight: "bold",
          fontSize: 18,
          cursor: "pointer",
        }}
        aria-label="Fechar"
      >
        ×
      </button>

      {/* Imagem ou placeholder */}
      {video.thumbnailUrl ? (
        <Image
          src={video.thumbnailUrl}
          alt={video.thumbnailUrl}
          width={100}
          height={60}
          style={{
            borderRadius: 12,
            objectFit: "cover",
            marginBottom: 8,
            border: "1px solid rgba(255, 255, 255, 0.3)",
          }}
        />
      ) : (
        <div
          style={{
            width: 100,
            height: 60,
            backgroundColor: "#ccc",
            borderRadius: 12,
            marginBottom: 8,
          }}
        />
      )}

      {/* Título */}
      <p
        style={{
          fontWeight: 600,
          fontSize: "1rem",
          color: "#000", // texto preto
          margin: 0,
        }}
      >
        {video.namePage}
      </p>
    </div>
  );
}
