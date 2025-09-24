"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaCamera,
  FaRedo,
  FaDownload,
  FaArrowLeft,
  FaSyncAlt,
} from "react-icons/fa";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Fotografar() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [loadingCamera, setLoadingCamera] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment"
  );

  const [name, setName] = useState("");
  const [showOnMap, setShowOnMap] = useState(true);

  const startCamera = useCallback(async () => {
    setError(null);
    setLoadingCamera(true);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setLoadingCamera(false);
    } catch (err) {
      console.error("Erro ao iniciar câmera:", err);
      setLoadingCamera(false);
      setError(
        (err as Error)?.message ||
          "Não foi possível acessar a câmera. Verifique permissões."
      );
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const takePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 720;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    setPreviewDataUrl(canvas.toDataURL("image/jpeg", 0.92));
    stopCamera();
  }, [stopCamera]);

  const retake = useCallback(() => {
    setPreviewDataUrl(null);
    setError(null);
    startCamera();
  }, [startCamera]);

  const downloadPhoto = useCallback(async () => {
    if (!previewDataUrl) return;
    try {
      const res = await fetch(previewDataUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `photo_${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erro ao baixar imagem:", err);
      setError("Falha ao baixar a imagem.");
    }
  }, [previewDataUrl]);

  const toggleFacingMode = useCallback(() => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [facingMode, startCamera, stopCamera]);

  const btnSize = "clamp(32px,8vw,40px)";
  const textFont = "clamp(18px,3vw,22px)";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        background: "#000",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* AppBar */}
      <div
        style={{
          height: "clamp(40px,6vh,80px)",
          display: "flex",
          alignItems: "center",
          padding: "0 clamp(20px,5vw,60px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(0,0,0,0.7)",
          fontSize: "clamp(24px,4vw,50px)",
        }}
      >
        <button
          onClick={() => {
            stopCamera();
            router.back();
          }}
          aria-label="Voltar"
          style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            fontSize: btnSize,
            cursor: "pointer",
            marginRight: "2vw",
          }}
        >
          <FaArrowLeft />
        </button>
        <div style={{ fontWeight: 700, fontSize: "clamp(24px,4vw,50px)" }}>
          Fotografar
        </div>
      </div>

      {/* Área de preview */}
      <div
        style={{
          flex: previewDataUrl ? "0" : 1, // ocupa espaço só antes de tirar foto
          position: "relative",
          display: "flex",
          alignItems: previewDataUrl ? "flex-start" : "center",
          justifyContent: "center",
          flexDirection: "column",
          padding: "2vh 2vw",
          gap: "2vh",
        }}
      >
        {!previewDataUrl ? (
          // ======= MODO "ANTES DE TIRAR FOTO" =======
          <motion.div
            animate={{ width: "95%", height: "95%" }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{
              position: "relative",
              backgroundColor: "#111",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "16px",
              }}
            />
            <button
              onClick={toggleFacingMode}
              style={{
                position: "absolute",
                top: 20,
                right: 20,
                padding: "0.5em 1em",
                borderRadius: 8,
                border: "none",
                background: "rgba(0,0,0,0.5)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: textFont,
                cursor: "pointer",
                backdropFilter: "blur(6px)",
              }}
            >
              <FaSyncAlt /> {facingMode === "user" ? "Frontal" : "Traseira"}
            </button>
            <button
              onClick={takePhoto}
              style={{
                position: "absolute",
                bottom: 60,
                width: "clamp(50px,10vw,80px)",
                height: "clamp(50px,10vw,80px)",
                borderRadius: "50%",
                background: "linear-gradient(180deg,#22c55e,#16a34a)",
                border: "none",
                boxShadow: "0 20px 60px rgba(34,197,94,0.25)",
                cursor: "pointer",
                fontSize: "clamp(20px,8vw,25px)",
                color: "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FaCamera />
            </button>
          </motion.div>
        ) : (
          // ======= MODO "DEPOIS DE TIRAR FOTO" =======
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
              gap: "2vh",
              marginTop: "2vh",
            }}
          >
            {/* Foto tirada */}
            <div
              style={{
                width: "90%",
                aspectRatio: "3/4",
                borderRadius: "16px",
                overflow: "hidden",
                background: "#111",
                position: "relative",
              }}
            >
              <Image
                src={previewDataUrl}
                alt="Preview da foto"
                fill
                unoptimized
                style={{ objectFit: "cover" }}
              />
            </div>

            {/* Botões refazer / baixar */}
            <div style={{ display: "flex", gap: "1em" }}>
              <button
                onClick={retake}
                style={{
                  padding: "0.6em 1.2em",
                  borderRadius: "8px",
                  border: "none",
                  background: "rgba(255,255,255,0.2)",
                  color: "#fff",
                  fontSize: textFont,
                  cursor: "pointer",
                }}
              >
                <FaRedo /> Refazer
              </button>
              <button
                onClick={downloadPhoto}
                style={{
                  padding: "0.6em 1.2em",
                  borderRadius: "8px",
                  border: "none",
                  background: "#22c55e",
                  color: "#000",
                  fontWeight: 700,
                  fontSize: textFont,
                  cursor: "pointer",
                }}
              >
                <FaDownload /> Baixar
              </button>
            </div>

            {/* Inputs */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "80%",
                gap: "1em",
              }}
            >
              <input
                type="text"
                placeholder="Nome da foto"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  padding: "0.5em",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  fontSize: textFont,
                }}
              />
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: textFont,
                }}
              >
                Mostrar no mapa
                <input
                  type="checkbox"
                  checked={showOnMap}
                  onChange={() => setShowOnMap(!showOnMap)}
                />
              </label>
            </div>

            {/* Botão publicar */}
            <button
              onClick={() => alert("Foto aceita — implementar upload.")}
              style={{
                padding: "0.6em 1.5em",
                borderRadius: "12px",
                border: "none",
                background: "#2563eb",
                color: "#fff",
                fontWeight: 700,
                fontSize: textFont,
                cursor: "pointer",
              }}
            >
              <FaCamera /> Publicar
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            style={{
              position: "absolute",
              top: 20,
              left: 20,
              background: "#ff4d4f",
              color: "#fff",
              padding: "20px 30px",
              borderRadius: 30,
              fontSize: 40,
              zIndex: 50,
            }}
          >
            {error}
          </div>
        )}

        {/* Loading */}
        {loadingCamera && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              zIndex: 40,
              background: "rgba(0,0,0,0.6)",
              padding: 50,
              borderRadius: 30,
              fontSize: 40,
            }}
          >
            Carregando câmera...
          </div>
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
