"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaCamera,
  FaRedo,
  FaDownload,
  FaArrowLeft,
  FaSyncAlt,
  FaShare,
} from "react-icons/fa";
import Image from "next/image";
import { motion } from "framer-motion";

import { db, storage, auth } from "@/lib/firebase";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { collection, addDoc, GeoPoint } from "firebase/firestore";
import GeoHashHelper from "./geohash";

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
  const [uploading, setUploading] = useState(false);

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
  }, [previewDataUrl]);

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [facingMode, startCamera, stopCamera]);

  // ================================
  // PUBLICAR FOTO
  // ================================
  const publishPhoto = useCallback(async () => {
    if (!previewDataUrl) return alert("Tire uma foto antes de publicar.");
    if (!auth.currentUser) return alert("Você precisa estar logado.");

    setUploading(true);
    setError(null);

    try {
      const imageID = `img_${Date.now()}`;
      const storageRef = ref(storage, `images/${imageID}.jpg`);
      await uploadString(storageRef, previewDataUrl, "data_url");
      const imageUrl = await getDownloadURL(storageRef);

      let position = new GeoPoint(0, 0);
      let geohash = "";
      if ("geolocation" in navigator) {
        const pos = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          }
        );
        position = new GeoPoint(pos.coords.latitude, pos.coords.longitude);
        geohash = GeoHashHelper.encode(
          pos.coords.latitude,
          pos.coords.longitude
        );
      }

      const publication = {
        position,
        geohash,
        ranking: 0,
        publicationType: "image",
        ownerType: "user",
        userID: auth.currentUser.uid,
        createdDateTime: new Date(),
        visibleOnMap: showOnMap,
        imageUrl,
        imageName: name || `Foto_${Date.now()}`,
      };

      await addDoc(collection(db, "publications"), publication);

      alert("Foto publicada com sucesso!");
      retake();
    } catch (err) {
      console.error("Erro ao publicar foto:", err);
      setError("Falha ao publicar a foto.");
    } finally {
      setUploading(false);
    }
  }, [previewDataUrl, name, showOnMap, retake]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100dvh",
        background: "#000",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
        overflowX: "hidden",
      }}
    >
      {/* AppBar */}
      <div
        style={{
          height: "clamp(40px,6vh,80px)",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
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
            fontSize: "clamp(24px,4vw,50px)",
            cursor: "pointer",
            marginRight: "12px",
          }}
        >
          <FaArrowLeft />
        </button>
        <div style={{ fontWeight: 700, fontSize: "clamp(24px,4vw,50px)" }}>
          Fotografar
        </div>
      </div>

      {/* Conteúdo */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: "16px",
          padding: "16px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {!previewDataUrl ? (
          <motion.div
            animate={{ width: "100%", height: "60vh" }} // altura maior
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{
              position: "relative",
              backgroundColor: "#111",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              border: "2px solid #fff",
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
              }}
            />
            <button
              onClick={toggleFacingMode}
              style={{
                position: "absolute",
                top: 20,
                right: 20,
                padding: "8px 16px",
                borderRadius: "9999px",
                border: "none",
                background: "rgba(0,0,0,0.6)",
                color: "#fff",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              <FaSyncAlt /> {facingMode === "user" ? "Frontal" : "Traseira"}
            </button>
            <button
              onClick={takePhoto}
              style={{
                position: "absolute",
                bottom: 20,
                width: "clamp(60px,12vw,80px)",
                height: "clamp(60px,12vw,80px)",
                borderRadius: "50%",
                background: "#fff",
                border: "none",
                cursor: "pointer",
                fontSize: "24px",
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
          <>
            {/* Foto tirada */}
            <div
              style={{
                width: "100%",
                maxWidth: "600px", // maior que antes
                aspectRatio: "3/4",
                borderRadius: "16px",
                overflow: "hidden",
                background: "#111",
                border: "2px solid #fff",
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

            {/* Botões */}
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={retake}
                style={{
                  padding: "10px 20px",
                  borderRadius: "9999px",
                  border: "none",
                  background: "rgba(255,255,255,0.2)",
                  color: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <FaRedo /> Refazer
              </button>
              <button
                onClick={downloadPhoto}
                style={{
                  padding: "10px 20px",
                  borderRadius: "9999px",
                  border: "none",
                  background: "#22c55e",
                  color: "#000",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <FaDownload /> Baixar
              </button>
            </div>

            {/* Inputs */}
            <input
              type="text"
              placeholder="Digite o nome da foto"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: "100%",
                maxWidth: "400px",
                padding: "12px",
                borderRadius: "12px",
                border: "2px solid #fff",
                background: "#111",
                color: "#fff",
                fontSize: "16px",
              }}
            />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                color: "#fff",
              }}
              onClick={() => setShowOnMap(!showOnMap)}
            >
              <div
                style={{
                  width: "40px",
                  height: "20px",
                  background: showOnMap ? "#4ade80" : "#6b7280",
                  borderRadius: "999px",
                  position: "relative",
                  transition: "background 0.3s",
                }}
              >
                <div
                  style={{
                    width: "18px",
                    height: "18px",
                    background: "#fff",
                    borderRadius: "50%",
                    position: "absolute",
                    top: "1px",
                    left: showOnMap ? "20px" : "2px",
                    transition: "left 0.3s",
                  }}
                />
              </div>
              <span>Mostrar no mapa</span>
            </div>

            {/* Publicar */}
            <button
              onClick={publishPhoto}
              disabled={uploading}
              style={{
                width: "100%",
                maxWidth: "400px",
                padding: "12px",
                borderRadius: "9999px",
                backgroundColor: uploading ? "#999" : "#fff",
                color: "#000",
                fontWeight: "bold",
                cursor: uploading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <FaShare />
              {uploading ? "Publicando..." : "Publicar"}
            </button>
          </>
        )}

        {/* Mostra erro */}
        {error && (
          <div
            style={{
              color: "#f87171",
              background: "rgba(255,0,0,0.1)",
              padding: "8px 12px",
              borderRadius: "8px",
              fontSize: "14px",
              marginTop: "8px",
              maxWidth: "400px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {/* Loading da câmera */}
        {loadingCamera && !previewDataUrl && (
          <div
            style={{
              marginTop: "16px",
              fontSize: "16px",
              color: "#9ca3af",
              fontStyle: "italic",
            }}
          >
            Iniciando câmera...
          </div>
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
