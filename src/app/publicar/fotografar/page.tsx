// app/fotografar/page.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaCamera,
  FaRedo,
  FaDownload,
  FaTrash,
  FaSyncAlt,
  FaArrowLeft,
} from "react-icons/fa";
import Image from "next/image";

export default function Fotografar() {
  const router = useRouter();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [loadingCamera, setLoadingCamera] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment"
  );

  // Inicia a câmera
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

      setIsCameraOn(true);
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
    setIsCameraOn(false);
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

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setPreviewDataUrl(dataUrl);
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

  // Reinicia câmera sempre que facingMode mudar
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [facingMode, startCamera, stopCamera]);

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
          height: 160,
          display: "flex",
          alignItems: "center",
          padding: "0 80px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          gap: 60,
          background: "rgba(0,0,0,0.7)",
          fontSize: 90,
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
            fontSize: 90,
            cursor: "pointer",
          }}
        >
          <FaArrowLeft />
        </button>

        <div style={{ fontWeight: 700, fontSize: 90 }}>Fotografar</div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 40 }}>
          <button
            onClick={toggleFacingMode}
            style={{
              padding: "40px 50px",
              borderRadius: 40,
              border: "none",
              background: "rgba(255,255,255,0.06)",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 20,
              fontSize: 80,
            }}
          >
            <FaSyncAlt /> {facingMode === "user" ? "Frontal" : "Traseira"}
          </button>
        </div>
      </div>

      {/* Main area */}
      <div
        style={{
          flex: 1,
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#111",
            position: "relative",
          }}
        >
          {!previewDataUrl && (
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                background: "#000",
              }}
            />
          )}

          {previewDataUrl && (
            <Image
              src={previewDataUrl}
              alt="Preview da foto"
              fill
              unoptimized
              style={{ objectFit: "cover" }}
            />
          )}

          {error && (
            <div
              style={{
                position: "absolute",
                top: 20,
                left: 20,
                background: "#ff4d4f",
                color: "#fff",
                padding: "30px 50px",
                borderRadius: 30,
                fontSize: 60,
                zIndex: 50,
              }}
            >
              {error}
            </div>
          )}

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
                fontSize: 60,
              }}
            >
              Carregando câmera...
            </div>
          )}
        </div>

        {/* Controls */}
        <div
          style={{
            height: 400,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 60,
            padding: "60px",
            boxSizing: "border-box",
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.0), rgba(0,0,0,0.6))",
          }}
        >
          <div />

          <div style={{ display: "flex", gap: 60, alignItems: "center" }}>
            {previewDataUrl ? (
              <>
                <button
                  onClick={retake}
                  style={{
                    padding: "40px 50px",
                    borderRadius: 40,
                    border: "none",
                    background: "rgba(255,255,255,0.06)",
                    color: "#fff",
                    fontSize: 80,
                    cursor: "pointer",
                  }}
                >
                  <FaRedo /> Refazer
                </button>

                <button
                  onClick={downloadPhoto}
                  style={{
                    padding: "40px 50px",
                    borderRadius: 40,
                    border: "none",
                    background: "#22c55e",
                    color: "#000",
                    fontWeight: 700,
                    fontSize: 80,
                    cursor: "pointer",
                  }}
                >
                  <FaDownload /> Baixar
                </button>

                <button
                  onClick={() => alert("Foto aceita — implementar upload.")}
                  style={{
                    padding: "40px 50px",
                    borderRadius: 40,
                    border: "none",
                    background: "#2563eb",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 80,
                    cursor: "pointer",
                  }}
                >
                  <FaCamera /> Aceitar
                </button>

                <button
                  onClick={() => setPreviewDataUrl(null)}
                  style={{
                    padding: "30px",
                    borderRadius: 30,
                    border: "1px solid rgba(255,255,255,0.06)",
                    background: "transparent",
                    color: "#fff",
                    fontSize: 80,
                    cursor: "pointer",
                  }}
                >
                  <FaTrash />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={takePhoto}
                  style={{
                    width: 250,
                    height: 250,
                    borderRadius: "50%",
                    background: "linear-gradient(180deg,#22c55e,#16a34a)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "none",
                    boxShadow: "0 20px 60px rgba(34,197,94,0.25)",
                    cursor: "pointer",
                    fontSize: 120,
                    color: "#000",
                  }}
                >
                  <FaCamera />
                </button>

                <button
                  onClick={() => {
                    if (isCameraOn) stopCamera();
                    else startCamera();
                  }}
                  style={{
                    padding: "40px 50px",
                    borderRadius: 40,
                    border: "none",
                    background: "rgba(255,255,255,0.06)",
                    color: "#fff",
                    fontSize: 80,
                    cursor: "pointer",
                  }}
                >
                  {isCameraOn ? "Desligar" : "Ligar câmera"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
