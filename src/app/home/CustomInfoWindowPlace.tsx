"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { VideoData } from "types/markerTypes";

interface Props {
  video: VideoData;
  onClose: () => void;
}

export default function CustomInfoWindowPlace({ video, onClose }: Props) {
  return (
    <div
      style={{
        position: "relative",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        background: "rgba(255, 255, 255, 0.15)",
        borderRadius: 16,
        padding: 12,
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        width: 240,
        textAlign: "center",
        color: "#000",
        fontFamily: "sans-serif",
      }}
    >
      {/* Botão de fechar */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          background: "rgba(255, 0, 0, 0.15)",
          border: "1px solid rgba(255, 0, 0, 0.4)",
          borderRadius: "50%",
          padding: 4,
          width: 28,
          height: 28,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "red",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          borderWidth: 1,
          borderStyle: "solid",
        }}
        aria-label="Fechar"
      >
        <X size={16} color="red" />
      </button>

      {/* Imagem */}
      {video.thumbnailUrl ? (
        <Image
          src={video.thumbnailUrl}
          alt={video.namePage}
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
          margin: "0 0 6px 0",
          color: "#000",
        }}
      >
        {video.namePage}
      </p>

      {/* Descrição - se quiser usar algum campo para descrição, pode ser o artistSongName ou outro */}
      {video.artistSongName && (
        <p
          style={{
            fontWeight: 400,
            fontSize: "0.85rem",
            color: "#222",
            margin: 0,
          }}
        >
          {video.artistSongName}
        </p>
      )}
    </div>
  );
}
