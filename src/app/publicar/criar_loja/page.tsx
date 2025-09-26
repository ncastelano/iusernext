"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FaCamera, FaArrowLeft, FaShare, FaTimes } from "react-icons/fa";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import {
  doc,
  collection,
  setDoc,
  GeoPoint,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db, storage } from "@/lib/firebase";
import Image from "next/image";

// Base32 para geohash
const base32 = "0123456789bcdefghjkmnpqrstuvwxyz";
function encodeGeoHash(latitude: number, longitude: number, precision = 9) {
  const latInterval = [-90.0, 90.0];
  const lonInterval = [-180.0, 180.0];
  let geohash = "";
  let isEven = true;
  let bit = 0;
  let ch = 0;

  while (geohash.length < precision) {
    let mid: number;
    if (isEven) {
      mid = (lonInterval[0] + lonInterval[1]) / 2;
      if (longitude > mid) {
        ch |= 1 << (4 - bit);
        lonInterval[0] = mid;
      } else lonInterval[1] = mid;
    } else {
      mid = (latInterval[0] + latInterval[1]) / 2;
      if (latitude > mid) {
        ch |= 1 << (4 - bit);
        latInterval[0] = mid;
      } else latInterval[1] = mid;
    }
    isEven = !isEven;
    if (bit < 4) bit++;
    else {
      geohash += base32[ch];
      bit = 0;
      ch = 0;
    }
  }
  return geohash;
}

// Interface para tipar a publicação
interface Publication {
  imageID: string;
  imageUrl: string;
  storeName: string;
  storePage: string;
  ranking: number;
  publicationType: "image";
  ownerType: "store";
  userID: string;
  createdDateTime: Date;
  publishedDateTime: Date;
  active: boolean;
  position?: GeoPoint;
  geohash?: string;
}

export default function CriarLoja() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [geohash, setGeohash] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("");
  const [useLocation, setUseLocation] = useState<boolean>(true);
  const [storePage, setStorePage] = useState<string>("");

  // 🔍 estados para validação em tempo real
  const [isCheckingPage, setIsCheckingPage] = useState(false);
  const [isPageAvailable, setIsPageAvailable] = useState<boolean | null>(null);

  const router = useRouter();
  const auth = getAuth();

  // Captura geolocalização se habilitado
  useEffect(() => {
    if (!useLocation) return;
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition(pos);
        setGeohash(encodeGeoHash(pos.coords.latitude, pos.coords.longitude));
      },
      (err) => console.error("Erro ao obter localização:", err) // ✅ usando o err
    );
  }, [useLocation]);

  // 🔍 Verificação em tempo real do storePage
  useEffect(() => {
    if (!storePage.trim()) {
      setIsPageAvailable(null);
      return;
    }

    let active = true;
    setIsCheckingPage(true);

    const checkPage = async () => {
      try {
        const q = query(
          collection(db, "publications"),
          where("storePage", "==", storePage)
        );
        const snap = await getDocs(q);

        if (!active) return;
        setIsPageAvailable(snap.empty);
        setIsCheckingPage(false);
      } catch (err) {
        console.error("Erro ao verificar storePage:", err);
      }
    };

    const delay = setTimeout(checkPage, 500);
    return () => {
      active = false;
      clearTimeout(delay);
    };
  }, [storePage]);

  const handlePickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setSelectedFile(file);

    // gera preview local sem upload
    const localUrl = URL.createObjectURL(file);
    setSelectedImageUrl(localUrl);
  };

  const handlePublish = async () => {
    if (!selectedFile) {
      alert("Selecione uma imagem primeiro");
      return;
    }
    if (useLocation && (!position || !geohash)) {
      alert("Aguardando geolocalização...");
      return;
    }
    if (!storePage.trim()) {
      alert("Escolha um @storePage");
      return;
    }
    if (!isPageAvailable) {
      alert("Esse @storePage já está em uso!");
      return;
    }

    setIsPublishing(true);
    try {
      // 🔼 agora só faz upload no momento da publicação
      const storageRef = ref(
        storage,
        `imagepublication/${Date.now()}_${selectedFile.name}`
      );
      await uploadBytes(storageRef, selectedFile);
      const downloadUrl = await getDownloadURL(storageRef);

      const newDocRef = doc(collection(db, "publications"));
      const imageID = newDocRef.id;

      const publication: Publication = {
        imageID,
        imageUrl: downloadUrl, // 🔗 link real do storage
        storeName: imageName || selectedFile.name,
        storePage,
        ranking: 0,
        publicationType: "image",
        ownerType: "store",
        userID: auth.currentUser?.uid || "",
        createdDateTime: new Date(),
        publishedDateTime: new Date(),
        active: true,
      };

      if (useLocation && position && geohash) {
        publication.position = new GeoPoint(
          position.coords.latitude,
          position.coords.longitude
        );
        publication.geohash = geohash;
      }

      await setDoc(newDocRef, publication);

      alert("Loja Criada com sucesso!");
      setSelectedFile(null);
      setSelectedImageUrl(null);
      setImageName("");
      setStorePage("");
      setIsPageAvailable(null);
    } catch (err) {
      console.error("Erro ao publicar imagem:", err);
      alert("Erro ao publicar imagem");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setSelectedImageUrl(null);
  };

  const canPublish =
    !!selectedImageUrl &&
    !!selectedFile &&
    !isPublishing &&
    imageName.trim() !== "" &&
    storePage.trim() !== "" &&
    isPageAvailable === true;

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
          Criar Loja
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
        {/* Pré-visualização da imagem */}
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
              paddingTop: "100%",
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
            {selectedImageUrl ? (
              <>
                <Image
                  src={selectedImageUrl}
                  alt="Imagem selecionada"
                  fill
                  style={{ objectFit: "cover" }}
                />
                <button
                  onClick={handleRemoveImage}
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    background: "rgba(0,0,0,0.5)",
                    border: "none",
                    borderRadius: "50%",
                    padding: "6px",
                    cursor: "pointer",
                    color: "#fff",
                  }}
                >
                  <FaTimes />
                </button>
              </>
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

        {/* Input nome da loja */}
        <input
          type="text"
          placeholder="Digite o nome da loja"
          value={imageName}
          onChange={(e) => setImageName(e.target.value)}
          style={{
            width: "80%",
            padding: "12px",
            borderRadius: "8px",
            backgroundColor: "rgba(255,255,255,0.1)",
            border: "1.5px solid rgba(255,255,255,0.3)",
            color: "#fff",
            fontSize: "18px",
            lineHeight: "1.4",
            boxSizing: "border-box",
            touchAction: "manipulation",
          }}
        />

        {/* Input storePage */}
        <input
          type="text"
          placeholder="Escolha seu /NomeDeLoja"
          value={storePage}
          onChange={(e) =>
            setStorePage(e.target.value.toLowerCase().replace(/\s+/g, ""))
          }
          style={{
            width: "80%",
            padding: "12px",
            borderRadius: "8px",
            backgroundColor: "rgba(255,255,255,0.1)",
            border: "1.5px solid rgba(255,255,255,0.3)",
            color: "#fff",
            fontSize: "18px",
            lineHeight: "1.4",
            boxSizing: "border-box",
            touchAction: "manipulation",
          }}
        />
        {/* Status do storePage */}
        {storePage.trim() && (
          <span
            style={{
              fontSize: "14px",
              color: isCheckingPage
                ? "yellow"
                : isPageAvailable
                ? "limegreen"
                : "red",
            }}
          >
            {isCheckingPage
              ? "Verificando disponibilidade..."
              : isPageAvailable
              ? "✅ Disponível"
              : "❌ Já está em uso"}
          </span>
        )}

        {/* Switch moderno */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            cursor: "pointer",
            color: "#fff",
            marginBottom: "16px",
          }}
          onClick={() => setUseLocation(!useLocation)}
        >
          <div
            style={{
              width: "40px",
              height: "20px",
              background: useLocation ? "#4ade80" : "#6b7280",
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
                left: useLocation ? "20px" : "2px",
                transition: "left 0.3s",
              }}
            />
          </div>
          <span>Mostrar no mapa</span>
        </div>

        {/* Botão publicar */}
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
