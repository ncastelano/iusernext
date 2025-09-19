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
  FaBolt,
} from "react-icons/fa";
import Image from "next/image";

export default function Fotografar() {
  const router = useRouter();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const trackRef = useRef<MediaStreamTrack | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [loadingCamera, setLoadingCamera] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment"
  );
  const [flashOn, setFlashOn] = useState(false);

  const startCamera = useCallback(async () => {
    setError(null);
    setLoadingCamera(true);

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false,
      });

      streamRef.current = stream;
      trackRef.current = stream.getVideoTracks()[0];

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      setLoadingCamera(false);
    } catch (err) {
      console.error(err);
      setError(
        (err as Error)?.message ||
          "Não foi possível acessar a câmera. Verifique permissões."
      );
      setLoadingCamera(false);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      trackRef.current = null;
    }
  }, []);

  const takePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const w = videoRef.current.videoWidth || 1280;
    const h = videoRef.current.videoHeight || 720;

    canvasRef.current.width = w;
    canvasRef.current.height = h;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, w, h);
    setPreviewDataUrl(canvasRef.current.toDataURL("image/jpeg", 0.92));
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
      console.error(err);
      setError("Falha ao baixar a imagem.");
    }
  }, [previewDataUrl]);

  const toggleFacingMode = useCallback(() => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  }, []);

  const toggleFlash = useCallback(async () => {
    if (!trackRef.current) return;
    try {
      // Forçar TypeScript a aceitar torch
      await trackRef.current.applyConstraints({
        advanced: [{ torch: !flashOn } as any],
      });
      setFlashOn((prev) => !prev);
    } catch (err) {
      console.warn("Flash não suportado ou não permitido neste dispositivo");
    }
  }, [flashOn]);

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
            marginRight: 40,
          }}
        >
          <FaArrowLeft />
        </button>

        <div style={{ fontWeight: 700, fontSize: 90 }}>Fotografar</div>
      </div>

      {/* Main area */}
      <div
        style={{
          flex: 1,
          position: "relative",
        }}
      >
        {/* Video / Preview */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />

        {previewDataUrl && (
          <Image
            src={previewDataUrl}
            alt="Preview da foto"
            fill
            unoptimized
            style={{ objectFit: "cover" }}
          />
        )}

        {/* Stack de botões */}
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 40,
            display: "flex",
            flexDirection: "column",
            gap: 40,
            paddingBottom: 100,
            zIndex: 60,
          }}
        >
          <div style={{ display: "flex", gap: 20 }}>
            <button
              onClick={toggleFacingMode}
              style={{
                padding: "20px",
                borderRadius: 40,
                border: "none",
                background: "rgba(255,255,255,0.06)",
                color: "#fff",
                fontSize: 40,
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
              }}
            >
              <FaSyncAlt /> {facingMode === "user" ? "Frontal" : "Traseira"}
            </button>

            <button
              onClick={toggleFlash}
              style={{
                padding: "20px",
                borderRadius: 40,
                border: "none",
                background: "rgba(255,255,255,0.06)",
                color: flashOn ? "#facc15" : "#fff",
                fontSize: 40,
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
              }}
            >
              <FaBolt /> Flash
            </button>
          </div>

          {previewDataUrl ? (
            <>
              <button
                onClick={retake}
                style={{
                  padding: "30px",
                  borderRadius: 40,
                  border: "none",
                  background: "rgba(255,255,255,0.06)",
                  color: "#fff",
                  fontSize: 50,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <FaRedo /> Refazer
              </button>

              <button
                onClick={downloadPhoto}
                style={{
                  padding: "30px",
                  borderRadius: 40,
                  border: "none",
                  background: "#22c55e",
                  color: "#000",
                  fontWeight: 700,
                  fontSize: 50,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <FaDownload /> Baixar
              </button>

              <button
                onClick={() => alert("Foto aceita — implementar upload.")}
                style={{
                  padding: "30px",
                  borderRadius: 40,
                  border: "none",
                  background: "#2563eb",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 50,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <FaCamera /> Aceitar
              </button>

              <button
                onClick={() => setPreviewDataUrl(null)}
                style={{
                  padding: "30px",
                  borderRadius: 40,
                  border: "1px solid rgba(255,255,255,0.06)",
                  background: "transparent",
                  color: "#fff",
                  fontSize: 50,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <FaTrash /> Excluir
              </button>
            </>
          ) : (
            <button
              onClick={takePhoto}
              style={{
                padding: "50px",
                borderRadius: "50%",
                background: "linear-gradient(180deg,#22c55e,#16a34a)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                boxShadow: "0 20px 60px rgba(34,197,94,0.25)",
                cursor: "pointer",
                fontSize: 80,
                color: "#000",
              }}
            >
              <FaCamera />
            </button>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
