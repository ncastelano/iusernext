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
  const trackRef = useRef<MediaStreamTrack | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [loadingCamera, setLoadingCamera] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment"
  );
  const [flashOn, setFlashOn] = useState(false);

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
      trackRef.current = stream.getVideoTracks()[0];

      // Se flash estiver ativo, aplica
      if (flashOn) toggleFlash(true);

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
  }, [facingMode, flashOn]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      trackRef.current = null;
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

  // Função para ligar/desligar flash real
  const toggleFlash = useCallback(
    async (forceState?: boolean) => {
      if (!trackRef.current) return;
      const imageCapture = new ImageCapture(trackRef.current);
      const photoCapabilities = await imageCapture.getPhotoCapabilities();

      if (!photoCapabilities.torch) {
        console.warn("Flash não suportado neste dispositivo");
        return;
      }

      const state = forceState !== undefined ? forceState : !flashOn;
      try {
        await trackRef.current.applyConstraints({
          advanced: [{ torch: state }],
        });
        setFlashOn(state);
      } catch (err) {
        console.error("Erro ao alternar flash:", err);
      }
    },
    [flashOn]
  );

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
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Video / Preview */}
        {!previewDataUrl && (
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
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
              padding: "20px 30px",
              borderRadius: 30,
              fontSize: 40,
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
              fontSize: 40,
            }}
          >
            Carregando câmera...
          </div>
        )}

        {/* Stack de botões */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 40,
            display: "flex",
            flexDirection: "column",
            gap: 30,
            zIndex: 50,
          }}
        >
          <button
            onClick={toggleFacingMode}
            style={{
              padding: "30px",
              borderRadius: 40,
              border: "none",
              background: "rgba(255,255,255,0.06)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: 20,
              fontSize: 50,
              cursor: "pointer",
            }}
          >
            <FaSyncAlt /> {facingMode === "user" ? "Frontal" : "Traseira"}
          </button>

          <button
            onClick={() => toggleFlash()}
            style={{
              padding: "30px",
              borderRadius: 40,
              border: "none",
              background: flashOn ? "#ffe066" : "rgba(255,255,255,0.06)",
              color: flashOn ? "#000" : "#fff",
              display: "flex",
              alignItems: "center",
              gap: 20,
              fontSize: 50,
              cursor: "pointer",
            }}
          >
            ⚡ {flashOn ? "Ligado" : "Desligado"}
          </button>

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
