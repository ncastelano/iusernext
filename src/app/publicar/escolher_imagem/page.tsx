"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaCamera, FaArrowLeft, FaShare } from "react-icons/fa";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { doc, collection, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db, storage } from "@/lib/firebase";
import Image from "next/image";

export default function EscolherImagem() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const router = useRouter();
  const auth = getAuth();

  const handlePickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setSelectedImage(file);
    setIsUploading(true);

    const storageRef = ref(storage, `imagepublication/${Date.now()}.jpg`);
    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);
    setSelectedImageUrl(downloadUrl);
    setIsUploading(false);
  };

  const handlePublish = async () => {
    if (!selectedImageUrl) return;

    setIsPublishing(true);
    try {
      const newDocRef = doc(collection(db, "publications"));
      await setDoc(newDocRef, {
        imageUrl: selectedImageUrl,
        userID: auth.currentUser?.uid || "",
        createdDateTime: new Date(),
        publicationType: "image",
        active: true,
      });

      alert("Imagem publicada com sucesso!");
      setSelectedImage(null);
      setSelectedImageUrl(null);
    } catch (error) {
      console.error(error);
      alert("Erro ao publicar imagem");
    } finally {
      setIsPublishing(false);
    }
  };

  const canPublish = !!selectedImageUrl && !isPublishing;

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
          Escolher Imagem
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
        <label style={{ cursor: "pointer", width: "100%", maxWidth: "400px" }}>
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handlePickImage}
          />
          <div
            style={{
              width: "100%",
              paddingTop: "100%", // quadrado responsivo
              position: "relative",
              backgroundColor: "#111",
              border: "2px solid #fff",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 4px 12px rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isUploading ? (
              <span style={{ color: "#fff" }}>Carregando...</span>
            ) : selectedImageUrl ? (
              <Image
                src={selectedImageUrl}
                alt="Imagem selecionada"
                fill
                style={{ objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  color: "#fff",
                }}
              >
                <FaCamera style={{ fontSize: "32px", marginBottom: "8px" }} />
                <span>Selecionar imagem</span>
              </div>
            )}
          </div>
        </label>

        <button
          onClick={handlePublish}
          disabled={!canPublish}
          style={{
            width: "100%",
            maxWidth: "400px",
            padding: "12px",
            borderRadius: "12px",
            backgroundColor: canPublish ? "#fff" : "rgba(128,128,128,0.5)",
            color: "#000",
            fontWeight: "bold",
            cursor: canPublish ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <FaShare />
          {isPublishing ? "Publicando..." : "Publicar"}
        </button>
      </div>
    </div>
  );
}
