// app/publicar/fotografar/enviar_imagem/page.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { FaPlus, FaSync, FaTimes, FaClock } from "react-icons/fa";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Song {
  id: string;
  songName: string;
  imageUrl: string;
  songDuration: number;
}

export default function EnviarImagem() {
  const searchParams = useSearchParams();
  const imageSrc = searchParams.get("image") || ""; // pega a imagem da query

  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [totalSongDuration, setTotalSongDuration] = useState<number>(0);
  const [songs, setSongs] = useState<Song[]>([]);

  // Buscar músicas do Firestore
  useEffect(() => {
    const fetchSongs = async () => {
      const querySnapshot = await getDocs(collection(db, "publications"));
      const docs = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          songName: data.songName || "Sem nome",
          imageUrl:
            data.imageUrl ||
            "https://via.placeholder.com/100x100.png?text=No+Thumb",
          songDuration: data.songDuration || 0,
        } as Song;
      });
      setSongs(docs);
    };
    fetchSongs();
  }, []);

  const handleAddSound = () => {
    if (songs.length === 0) {
      alert("Nenhuma música disponível.");
      return;
    }
    const songName = prompt(
      "Digite o nome da música ou selecione uma:\n" +
        songs.map((s) => s.songName).join("\n")
    );
    const selected = songs.find((s) => s.songName === songName);
    if (selected) {
      setSelectedSong(selected);
      setTotalSongDuration(selected.songDuration);
      alert(`Selecionou: ${selected.songName} (${selected.songDuration}s)`);
    }
  };

  const handleRemoveSong = () => {
    setSelectedSong(null);
    setTotalSongDuration(0);
  };

  const handleAddLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocalização não suportada neste navegador.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        alert(
          `Latitude: ${pos.coords.latitude}\nLongitude: ${pos.coords.longitude}`
        );
      },
      (err) => {
        alert("Erro ao obter localização: " + err.message);
      },
      { enableHighAccuracy: true }
    );
  };

  if (!imageSrc) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
        }}
      >
        Nenhuma imagem encontrada.
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100dvh",
        position: "relative",
        backgroundColor: "#000",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Imagem de fundo */}
      <Image
        src={imageSrc}
        alt="Imagem selecionada"
        fill
        style={{ objectFit: "cover" }}
      />

      {/* Botão Adicionar Som */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          left: 20,
        }}
      >
        {!selectedSong ? (
          <button
            onClick={handleAddSound}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              backgroundColor: "green",
              color: "#000",
              padding: "14px 24px",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            <FaPlus /> Adicionar Som
          </button>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={handleAddSound}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                backgroundColor: "green",
                color: "#000",
                padding: "12px 20px",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              <FaSync /> {selectedSong.songName}
            </button>
            <button
              onClick={handleRemoveSong}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "red",
                color: "#000",
                border: "none",
                borderRadius: "50%",
                width: 40,
                height: 40,
                cursor: "pointer",
              }}
            >
              <FaTimes />
            </button>
          </div>
        )}
      </div>

      {/* Botão Adicionar Localização */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: 20,
        }}
      >
        <button
          onClick={handleAddLocation}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            backgroundColor: "green",
            color: "#000",
            padding: "14px 24px",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          <FaPlus /> Adicionar Localidade
        </button>
      </div>

      {/* Duração da música */}
      {selectedSong && (
        <div
          style={{
            position: "absolute",
            top: 20,
            right: 20,
          }}
        >
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              backgroundColor: "green",
              color: "#000",
              padding: "14px 24px",
              border: "none",
              borderRadius: 8,
            }}
          >
            <FaClock />{" "}
            {totalSongDuration > 0
              ? `${totalSongDuration}s`
              : "Duração não disponível"}
          </button>
        </div>
      )}
    </div>
  );
}
