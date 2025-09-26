"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { FaCamera, FaArrowLeft, FaShare, FaTimes } from "react-icons/fa";
import {
  ref as storageRefFn,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
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
// use <img> for preview to accept blob URLs easily

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

// Interface local (ajuste se você já tem types/publication)
interface Publication {
  imageID: string;
  imageUrl: string;
  storeName: string;
  storePage: string;
  ranking: number;
  publicationType: "image";
  ownerType: "store" | "user";
  userID: string;
  createdDateTime: Date;
  publishedDateTime: Date;
  active: boolean;
  position?: GeoPoint;
  geohash?: string;
}

export default function CriarLoja() {
  const router = useRouter();
  const auth = getAuth();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null); // preview (local blob or uploaded url)
  const previewUrlRef = useRef<string | null>(null); // para revogar o objectURL

  const [imageName, setImageName] = useState<string>("");
  const [storePage, setStorePage] = useState<string>("");

  const [useLocation, setUseLocation] = useState<boolean>(true);
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [geohash, setGeohash] = useState<string | null>(null);

  const [isCheckingPage, setIsCheckingPage] = useState(false);
  const [isPageAvailable, setIsPageAvailable] = useState<boolean | null>(null);

  const [isUploading, setIsUploading] = useState(false); // upload -> storage
  const [isPublishing, setIsPublishing] = useState(false); // saving doc

  // pega localização (se habilitado)
  useEffect(() => {
    if (!useLocation) return;
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition(pos);
        setGeohash(encodeGeoHash(pos.coords.latitude, pos.coords.longitude));
      },
      (err) => {
        console.warn("Erro ao obter localização:", err.message);
        // não interrompe fluxo — usuário pode desativar "Mostrar no mapa"
      }
    );
  }, [useLocation]);

  // Verificação em tempo real do storePage (debounce)
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
      } catch (err) {
        console.error("Erro verificando storePage:", err);
        if (active) setIsPageAvailable(null);
      } finally {
        if (active) setIsCheckingPage(false);
      }
    };

    const timeout = setTimeout(checkPage, 500); // 500ms debounce
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [storePage]);

  // limpa objectURL quando componente desmonta
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, []);

  // seleção de arquivo -> cria preview local (sem upload)
  const handlePickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // revoga preview anterior, se existir
    if (previewUrlRef.current) {
      try {
        URL.revokeObjectURL(previewUrlRef.current);
      } catch (err) {
        /* ignore */
      }
      previewUrlRef.current = null;
    }

    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;

    setSelectedFile(file);
    setSelectedImageUrl(url);
  };

  const handleRemoveImage = () => {
    if (previewUrlRef.current) {
      try {
        URL.revokeObjectURL(previewUrlRef.current);
      } catch (err) {
        /* ignore */
      }
      previewUrlRef.current = null;
    }
    setSelectedFile(null);
    setSelectedImageUrl(null);
  };

  const handlePublish = async () => {
    if (!selectedFile) {
      alert("Selecione uma imagem antes de publicar.");
      return;
    }
    if (!imageName.trim()) {
      alert("Digite o nome da loja.");
      return;
    }
    if (!storePage.trim()) {
      alert("Escolha um /storePage.");
      return;
    }
    if (isPageAvailable === false) {
      alert("Esse /storePage já está em uso.");
      return;
    }

    // se usuário pediu uso de localização, garanta que a posição esteja obtida (ou dê opção)
    if (useLocation && (!position || !geohash)) {
      alert(
        "Aguardando geolocalização... permita localização ou desative 'Mostrar no mapa'."
      );
      return;
    }

    setIsUploading(true);
    setIsPublishing(true);
    try {
      // upload para storage
      const sRef = storageRefFn(
        storage,
        `stores/${Date.now()}_${selectedFile.name}`
      );
      await uploadBytes(sRef, selectedFile);
      const downloadUrl = await getDownloadURL(sRef);

      // criar documento
      const newDocRef = doc(collection(db, "publications"));
      const imageID = newDocRef.id;

      const publication: Publication = {
        imageID,
        imageUrl: downloadUrl,
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

      alert("Loja criada com sucesso!");
      // limpar estados e revogar preview (se for blob)
      if (previewUrlRef.current) {
        try {
          URL.revokeObjectURL(previewUrlRef.current);
        } catch (err) {
          /* ignore */
        }
        previewUrlRef.current = null;
      }
      setSelectedFile(null);
      setSelectedImageUrl(null);
      setImageName("");
      setStorePage("");
      setIsPageAvailable(null);
    } catch (err) {
      console.error(err);
      alert("Erro ao criar loja. Veja console para detalhes.");
    } finally {
      setIsUploading(false);
      setIsPublishing(false);
    }
  };

  const canPublish =
    !!selectedFile &&
    imageName.trim().length >= 1 &&
    storePage.trim().length >= 1 &&
    isPageAvailable === true &&
    !isPublishing &&
    !isUploading;

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
        {/* Preview / seletor */}
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
                <img
                  src={selectedImageUrl}
                  alt="Preview"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                <button
                  type="button"
                  onClick={(ev) => {
                    ev.stopPropagation(); // evita reabrir picker
                    handleRemoveImage();
                  }}
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
                {isUploading && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "8px",
                      left: "8px",
                      padding: "6px 8px",
                      borderRadius: 8,
                      background: "rgba(0,0,0,0.6)",
                      fontSize: 12,
                    }}
                  >
                    Enviando...
                  </div>
                )}
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

        {/* Nome da loja */}
        <input
          type="text"
          placeholder="Digite o nome da loja"
          value={imageName}
          onChange={(e) => setImageName(e.target.value)}
          style={{
            width: "80%",
            maxWidth: "400px",
            padding: "12px",
            borderRadius: "8px",
            backgroundColor: "rgba(255,255,255,0.1)",
            border: "1.5px solid rgba(255,255,255,0.3)",
            color: "#fff",
            fontSize: "18px",
            boxSizing: "border-box",
          }}
        />

        {/* storePage */}
        <input
          type="text"
          placeholder="Escolha seu /NomeDeLoja (sem espaços)"
          value={storePage}
          onChange={(e) =>
            setStorePage(e.target.value.toLowerCase().replace(/\s+/g, ""))
          }
          style={{
            width: "80%",
            maxWidth: "400px",
            padding: "12px",
            borderRadius: "8px",
            backgroundColor: "rgba(255,255,255,0.1)",
            border: "1.5px solid rgba(255,255,255,0.3)",
            color: "#fff",
            fontSize: "18px",
            boxSizing: "border-box",
          }}
        />
        {storePage.trim() && (
          <span
            style={{
              fontSize: 14,
              color: isCheckingPage
                ? "yellow"
                : isPageAvailable
                ? "limegreen"
                : "salmon",
            }}
          >
            {isCheckingPage
              ? "Verificando disponibilidade..."
              : isPageAvailable
              ? "✅ Disponível"
              : "❌ Já está em uso"}
          </span>
        )}

        {/* Mostrar no mapa */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            cursor: "pointer",
            color: "#fff",
            marginBottom: "16px",
          }}
          onClick={() => setUseLocation((s) => !s)}
        >
          <div
            style={{
              width: 40,
              height: 20,
              background: useLocation ? "#4ade80" : "#6b7280",
              borderRadius: 999,
              position: "relative",
              transition: "background 0.3s",
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                background: "#fff",
                borderRadius: "50%",
                position: "absolute",
                top: 1,
                left: useLocation ? 20 : 2,
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
          {isPublishing ? "Publicando..." : "Criar Loja"}
        </button>
      </div>
    </div>
  );
}
