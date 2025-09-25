"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaRedo,
  FaDownload,
  FaArrowLeft,
  FaMicrophone,
  FaStop,
  FaShare,
} from "react-icons/fa";

import { db, storage, auth } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, GeoPoint } from "firebase/firestore";
import GeoHashHelper from "../fotografar/geohash";

export default function Microfone() {
  const router = useRouter();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const [recording, setRecording] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [showOnMap, setShowOnMap] = useState(true);
  const [uploading, setUploading] = useState(false);

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordedChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: "audio/webm",
        });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error("Erro ao iniciar microfone:", err);
      setError("Não foi possível acessar o microfone. Verifique permissões.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  }, [recording]);

  const retake = useCallback(() => {
    setPreviewUrl(null);
    setError(null);
  }, []);

  const downloadAudio = useCallback(() => {
    if (!previewUrl) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = `audio_${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [previewUrl]);

  const publishAudio = useCallback(async () => {
    if (!previewUrl) return alert("Grave um áudio antes de publicar.");
    if (!auth.currentUser) return alert("Você precisa estar logado.");

    setUploading(true);
    setError(null);

    try {
      const res = await fetch(previewUrl);
      const blob = await res.blob();
      const audioID = `audio_${Date.now()}`;
      const storageRef = ref(storage, `audios/${audioID}.webm`);
      await uploadBytes(storageRef, blob);
      const audioUrl = await getDownloadURL(storageRef);

      let position = new GeoPoint(0, 0);
      let geohash = "";
      if ("geolocation" in navigator) {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject)
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
        publicationType: "audio",
        ownerType: "user",
        userID: auth.currentUser.uid,
        createdDateTime: new Date(),
        visibleOnMap: showOnMap,
        audioUrl,
        audioName: name || `Audio_${Date.now()}`,
      };

      await addDoc(collection(db, "publications"), publication);
      alert("Áudio publicado com sucesso!");
      retake();
    } catch (err) {
      console.error("Erro ao publicar áudio:", err);
      setError("Falha ao publicar o áudio.");
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
          onClick={() => router.back()}
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
          Microfone
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
          <div
            style={{
              width: "100%",
              maxWidth: "400px",
              height: "200px",
              borderRadius: "16px",
              background: "#111",
              border: "2px solid #fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              color: "#fff",
            }}
          >
            {!recording ? "Pressione para gravar" : "Gravando..."}
          </div>
        ) : (
          <audio
            src={previewUrl}
            controls
            style={{ width: "100%", maxWidth: "400px" }}
          />
        )}

        <div style={{ display: "flex", gap: "12px" }}>
          {!recording ? (
            <button
              onClick={startRecording}
              style={{
                padding: "10px 20px",
                borderRadius: "9999px",
                border: "none",
                background: "#fff",
                color: "#000",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <FaMicrophone /> Gravar
            </button>
          ) : (
            <button
              onClick={stopRecording}
              style={{
                padding: "10px 20px",
                borderRadius: "9999px",
                border: "none",
                background: "#f87171",
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <FaStop /> Parar
            </button>
          )}

          {previewUrl && (
            <>
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
                onClick={downloadAudio}
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
            </>
          )}
        </div>

        {/* Nome do áudio */}
        <input
          type="text"
          placeholder="Digite o nome do áudio"
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
            MozTextSizeAdjust: "100%",
            textSizeAdjust: "100%",
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
          onClick={publishAudio}
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
      </div>
    </div>
  );
}
