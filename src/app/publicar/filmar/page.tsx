"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaVideo,
  FaRedo,
  FaDownload,
  FaArrowLeft,
  FaSyncAlt,
  FaShare,
  FaStop,
} from "react-icons/fa";
import { motion } from "framer-motion";

import { db, storage, auth } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, GeoPoint } from "firebase/firestore";
import GeoHashHelper from "../fotografar/geohash";

export default function Filmar() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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
        audio: true,
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

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;
    recordedChunksRef.current = [];
    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: "video/webm;codecs=vp9",
    });
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    };

    mediaRecorder.start();
    setRecording(true);
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      stopCamera();
    }
  }, [recording, stopCamera]);

  const retake = useCallback(() => {
    setPreviewUrl(null);
    setError(null);
    startCamera();
  }, [startCamera]);

  const downloadVideo = useCallback(() => {
    if (!previewUrl) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = `video_${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [previewUrl]);

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [facingMode, startCamera, stopCamera]);

  const publishVideo = useCallback(async () => {
    if (!previewUrl) return alert("Grave um vídeo antes de publicar.");
    if (!auth.currentUser) return alert("Você precisa estar logado.");

    setUploading(true);
    setError(null);

    try {
      const res = await fetch(previewUrl);
      const blob = await res.blob();
      const videoID = `vid_${Date.now()}`;
      const storageRef = ref(storage, `videos/${videoID}.webm`);
      await uploadBytes(storageRef, blob);
      const videoUrl = await getDownloadURL(storageRef);

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
        publicationType: "video",
        ownerType: "user",
        userID: auth.currentUser.uid,
        createdDateTime: new Date(),
        visibleOnMap: showOnMap,
        videoUrl,
        videoName: name || `Video_${Date.now()}`,
      };

      await addDoc(collection(db, "publications"), publication);

      alert("Vídeo publicado com sucesso!");
      retake();
    } catch (err) {
      console.error("Erro ao publicar vídeo:", err);
      setError("Falha ao publicar o vídeo.");
    } finally {
      setUploading(false);
    }
  }, [previewUrl, name, showOnMap, retake]);

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
        touchAction: "manipulation",
        userSelect: "none",
        WebkitTouchCallout: "none",
        WebkitUserSelect: "none",
        msTouchAction: "manipulation",
      }}
      onTouchStart={(e) => {
        if (e.touches.length > 1) e.preventDefault();
      }}
      onTouchMove={(e) => {
        if (e.touches.length > 1) e.preventDefault();
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
          Filmar
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
        {!previewUrl ? (
          <motion.div
            animate={{ width: "100%", height: "80vh" }}
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
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
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
            {!recording ? (
              <button
                onClick={startRecording}
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
                <FaVideo />
              </button>
            ) : (
              <button
                onClick={stopRecording}
                style={{
                  position: "absolute",
                  bottom: 20,
                  width: "clamp(60px,12vw,80px)",
                  height: "clamp(60px,12vw,80px)",
                  borderRadius: "50%",
                  background: "#f87171",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "24px",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FaStop />
              </button>
            )}
          </motion.div>
        ) : (
          <>
            <div
              style={{
                width: "100%",
                maxWidth: "600px",
                aspectRatio: "3/4",
                borderRadius: "16px",
                overflow: "hidden",
                background: "#111",
                border: "2px solid #fff",
                position: "relative",
              }}
            >
              <video
                src={previewUrl}
                controls
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>

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
                onClick={downloadVideo}
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

            <input
              type="text"
              placeholder="Digite o nome do vídeo"
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
                WebkitTextSizeAdjust: "100%",
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

            <button
              onClick={publishVideo}
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

        {loadingCamera && !previewUrl && (
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
    </div>
  );
}
