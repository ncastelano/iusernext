"use client";
import { useRouter } from "next/navigation";
import { GeoPoint } from "firebase/firestore";
import { useState, useEffect, useRef } from "react";
import { FaCamera, FaShare, FaArrowLeft } from "react-icons/fa";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { doc, collection, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db, storage } from "@/lib/firebase";
import { Publication } from "types/publication";
import Image from "next/image";

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

export default function EscolherSom() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [songName, setSongName] = useState("");
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [geohash, setGeohash] = useState<string | null>(null);

  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);
  const auth = getAuth();

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition(pos);
        setGeohash(encodeGeoHash(pos.coords.latitude, pos.coords.longitude));
      },
      (err) => console.warn("Erro ao obter localização:", err.message)
    );
  }, []);

  const handlePickAudio = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setAudioFile(e.target.files[0]);
  };

  const handlePickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setIsUploadingImage(true);
    const storageRef = ref(storage, `imagepublication/${Date.now()}.jpg`);
    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);
    setSelectedImageUrl(downloadUrl);
    setIsUploadingImage(false);
  };

  const handlePublish = async () => {
    if (!audioFile || !selectedImageUrl || songName.trim().length < 4) return;
    if (!position || !geohash) {
      alert("Aguardando geolocalização...");
      return;
    }

    setIsPublishing(true);
    try {
      const storageRef = ref(
        storage,
        `songpublication/${Date.now()}_${audioFile.name}`
      );
      await uploadBytes(storageRef, audioFile);
      const songUrl = await getDownloadURL(storageRef);

      const newDocRef = doc(collection(db, "publications"));

      const publication: Publication = {
        position: new GeoPoint(
          position.coords.latitude,
          position.coords.longitude
        ),
        geohash,
        ranking: 0,
        publicationType: "song",
        ownerType: "user",
        userID: auth.currentUser?.uid || "",
        createdDateTime: new Date(),
        active: true,
        visibleOnMap: true,
        deleted: false,
        songID: newDocRef.id,
        songUrl,
        songDuration: audioRef.current?.duration || 0,
        songName,
        imageUrl: selectedImageUrl,
      };

      await setDoc(newDocRef, publication);

      alert("Som publicado com sucesso!");
      setAudioFile(null);
      setSongName("");
      setSelectedImageUrl(null);
    } catch (error) {
      console.error(error);
      alert("Erro ao publicar som");
    } finally {
      setIsPublishing(false);
    }
  };

  const canPublish =
    !!audioFile &&
    !!selectedImageUrl &&
    songName.trim().length >= 4 &&
    !isPublishing;

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
          Escolher Som
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
          gap: "clamp(16px,2vw,32px)",
          padding: "16px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Input do áudio */}
        <input
          type="file"
          accept=".mp3,.wav,.m4a,.aac,.ogg"
          onChange={handlePickAudio}
          style={{
            width: "80%",
            padding: "12px",
            borderRadius: "8px",
            backgroundColor: "rgba(255,255,255,0.1)",
            border: "1.5px solid rgba(255,255,255,0.3)",
            color: "#fff",
            fontSize: "18px", // >= 18px
            lineHeight: "1.4",
            boxSizing: "border-box",
            touchAction: "manipulation", // evita zoom em alguns navegadores
          }}
        />

        {/* Preview da capa e player nativo */}
        {audioFile && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
              width: "100%",
              maxWidth: "400px",
            }}
          >
            {/* Capa da música */}
            <label style={{ cursor: "pointer", width: "100%" }}>
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
                }}
              >
                {isUploadingImage ? (
                  <span
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      color: "#fff",
                    }}
                  >
                    Carregando...
                  </span>
                ) : selectedImageUrl ? (
                  <Image
                    src={selectedImageUrl}
                    alt="Capa"
                    fill
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      color: "#fff",
                    }}
                  >
                    <FaCamera
                      style={{ fontSize: "32px", marginBottom: "8px" }}
                    />
                    <span>Selecionar capa</span>
                  </div>
                )}
              </div>
            </label>

            {/* Nome da música */}
            <input
              type="text"
              placeholder="Digite o nome ou título do som..."
              value={songName}
              onChange={(e) => setSongName(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                backgroundColor: "rgba(255,255,255,0.1)",
                border: "1.5px solid rgba(255,255,255,0.3)",
                color: "#fff",
                fontSize: "18px",
                lineHeight: "1.4",
                boxSizing: "border-box",
              }}
            />

            {/* Player de áudio nativo */}
            <audio
              ref={audioRef}
              src={URL.createObjectURL(audioFile)}
              controls
              style={{
                width: "100%",
                borderRadius: "8px",
                backgroundColor: "#111",
              }}
            />

            {/* Botão publicar */}
            <button
              onClick={handlePublish}
              disabled={!canPublish}
              style={{
                width: "100%",
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
        )}
      </div>
    </div>
  );
}
