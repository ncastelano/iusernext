"use client";

import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { FaCut, FaPlay, FaPause, FaCamera, FaShare } from "react-icons/fa";

export default function EscolherSom() {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [songName, setSongName] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [cutMode, setCutMode] = useState(false);

  // init WaveSurfer
  useEffect(() => {
    if (audioFile && waveformRef.current) {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
      }

      const ws = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "#666",
        progressColor: "#facc15", // amarelo
        cursorColor: "#fff",
        height: 100,
      });

      ws.load(URL.createObjectURL(audioFile));
      ws.on("ready", () => {
        setDuration(ws.getDuration());
        setEnd(ws.getDuration());
      });

      ws.on("finish", () => setIsPlaying(false));
      wavesurfer.current = ws;
    }
  }, [audioFile]);

  const togglePlay = () => {
    if (wavesurfer.current) {
      wavesurfer.current.playPause();
      setIsPlaying(!isPlaying);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setAudioFile(e.target.files[0]);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const handleCut = () => {
    if (!wavesurfer.current) return;
    alert(
      `Corte de ${formatTime(start)} até ${formatTime(
        end
      )} ainda não implementado.`
    );
    // Aqui entraria ffmpeg.wasm para cortar realmente
  };

  const canPublish = imageFile && songName.trim().length >= 4 && !cutMode;

  return (
    <div
      style={{
        minHeight: "100dvh",
        backgroundColor: "black",
        color: "white",
        padding: "20px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
          alignItems: "center",
        }}
      >
        <h2>Editar Som</h2>
        <button
          onClick={canPublish ? () => alert("Publicar no Firebase") : undefined}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 12px",
            backgroundColor: canPublish ? "white" : "gray",
            color: "black",
            border: "1px solid black",
            borderRadius: "8px",
            cursor: canPublish ? "pointer" : "not-allowed",
          }}
        >
          <FaShare /> Publicar
        </button>
      </div>

      {/* Upload audio */}
      {!audioFile && (
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          style={{ marginBottom: "20px" }}
        />
      )}

      {/* Audio info */}
      {audioFile && (
        <>
          <p style={{ fontSize: "14px", marginBottom: "10px" }}>
            Arquivo: {audioFile.name}
          </p>

          {/* Capa */}
          <div
            style={{
              height: "150px",
              width: "150px",
              border: "2px solid white",
              borderRadius: "12px",
              marginBottom: "20px",
              backgroundSize: "cover",
              backgroundImage: imageFile
                ? `url(${URL.createObjectURL(imageFile)})`
                : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            onClick={() => document.getElementById("imageInput")?.click()}
          >
            {!imageFile && (
              <div style={{ textAlign: "center" }}>
                <FaCamera size={24} />
                <p style={{ fontSize: "14px" }}>Selecionar capa</p>
              </div>
            )}
          </div>
          <input
            type="file"
            id="imageInput"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageChange}
          />

          {/* Waveform */}
          <div ref={waveformRef} style={{ marginBottom: "20px" }} />

          {/* Cut mode */}
          {cutMode ? (
            <div>
              <p>
                Corte de: {formatTime(start)} / {formatTime(end)}
              </p>
              <button
                onClick={() => setCutMode(false)}
                style={{
                  backgroundColor: "red",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  marginRight: "10px",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCut}
                style={{
                  backgroundColor: "blue",
                  padding: "8px 16px",
                  borderRadius: "8px",
                }}
              >
                Confirmar Corte
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCutMode(true)}
              style={{
                backgroundColor: "blue",
                padding: "10px 20px",
                borderRadius: "8px",
                marginBottom: "20px",
              }}
            >
              <FaCut /> Recortar
            </button>
          )}

          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            style={{
              backgroundColor: "yellow",
              color: "black",
              padding: "10px 20px",
              borderRadius: "8px",
              marginLeft: "10px",
            }}
          >
            {isPlaying ? <FaPause /> : <FaPlay />}{" "}
            {isPlaying ? "Pause" : "Play"}
          </button>

          {/* Nome do som */}
          <input
            type="text"
            value={songName}
            onChange={(e) => setSongName(e.target.value)}
            placeholder="Digite o nome do som..."
            style={{
              marginTop: "20px",
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid gray",
              backgroundColor: "rgba(255,255,255,0.1)",
              color: "white",
            }}
          />
        </>
      )}
    </div>
  );
}
