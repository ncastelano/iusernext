"use client";
import { useRouter } from "next/navigation";
import { GeoPoint } from "firebase/firestore";
import { useState, useRef, useEffect } from "react";
import {
  FaCamera,
  FaPlay,
  FaPause,
  FaShare,
  FaArrowLeft,
} from "react-icons/fa";
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
  const [isPlaying, setIsPlaying] = useState(false);
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

  const handleTogglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const handlePublish = async () => {
    if (!audioFile || !selectedImageUrl || songName.trim().length < 4) return;
    if (!position || !geohash) {
      alert("Aguardando geolocalização...");
      return;
    }

    setIsPublishing(true);
    try {
      // Upload do áudio
      const storageRef = ref(
        storage,
        `songpublication/${Date.now()}_${audioFile.name}`
      );
      await uploadBytes(storageRef, audioFile);
      const songUrl = await getDownloadURL(storageRef);

      // Cria o documento com ID manual para usar como songID
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
        songID: newDocRef.id, // ID já definido
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
        height: "100dvh",
        background: "#000",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* AppBar com botão de voltar */}
      <div
        style={{
          height: "clamp(40px,6vh,80px)",
          display: "flex",
          alignItems: "center",
          padding: "0 clamp(20px,5vw,60px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(0,0,0,0.7)",
          fontSize: "clamp(24px,4vw,50px)",
        }}
      >
        <button
          onClick={() => {
            router.back();
          }}
          aria-label="Voltar"
          style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            fontSize: "clamp(24px,4vw,50px)",
            cursor: "pointer",
            marginRight: "2vw",
            marginTop: "1vw",
          }}
        >
          <FaArrowLeft />
        </button>
        <div style={{ fontWeight: 700, fontSize: "clamp(24px,4vw,50px)" }}>
          Escolher Som
        </div>
      </div>

      <input
        type="file"
        accept=".mp3,.wav,.m4a,.aac,.ogg"
        onChange={handlePickAudio}
        style={{
          padding: "clamp(6px,1.5vw,12px)",
          borderRadius: "clamp(8px,1.5vw,12px)",
          backgroundColor: "#111",
          color: "#fff",
          border: "1px solid #444",
          cursor: "pointer",
        }}
      />

      {audioFile && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "clamp(12px,2vw,16px)",
            width: "100%",
            maxWidth: "clamp(320px,80%,400px)",
          }}
        >
          <label style={{ cursor: "pointer" }}>
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handlePickImage}
            />
            <div
              style={{
                width: "clamp(160px, 40vw, 192px)",
                height: "clamp(160px, 40vw, 192px)",
                backgroundColor: "#111",
                border: "2px solid #fff",
                borderRadius: "clamp(12px,4vw,16px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0,0,0,0.6)",
              }}
            >
              {isUploadingImage ? (
                <span>Carregando...</span>
              ) : selectedImageUrl ? (
                <Image
                  src={selectedImageUrl}
                  alt="Capa"
                  width={192}
                  height={192}
                  style={{ objectFit: "cover", width: "100%", height: "100%" }}
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
                  <FaCamera
                    style={{
                      fontSize: "clamp(24px,6vw,32px)",
                      marginBottom: "8px",
                    }}
                  />
                  <span>Selecionar capa</span>
                </div>
              )}
            </div>
          </label>

          <input
            type="text"
            placeholder="Digite o nome ou título do som..."
            value={songName}
            onChange={(e) => setSongName(e.target.value)}
            style={{
              width: "100%",
              padding: "clamp(10px,2vw,12px)",
              borderRadius: "clamp(8px,2vw,12px)",
              backgroundColor: "rgba(255,255,255,0.1)",
              border: "1.5px solid rgba(255,255,255,0.3)",
              color: "#fff",
              fontSize: "clamp(0.9rem,2vw,1rem)",
            }}
          />

          <div
            style={{
              display: "flex",
              gap: "clamp(12px,2vw,16px)",
              alignItems: "center",
            }}
          >
            <button
              onClick={handleTogglePlay}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "clamp(8px,1.5vw,10px) clamp(12px,2vw,16px)",
                backgroundColor: "#FFD700",
                color: "#000",
                borderRadius: "clamp(8px,2vw,12px)",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
              }}
            >
              {isPlaying ? (
                <FaPause style={{ marginRight: "8px" }} />
              ) : (
                <FaPlay style={{ marginRight: "8px" }} />
              )}
              {isPlaying ? "Pause" : "Play"}
            </button>
            <audio ref={audioRef} src={URL.createObjectURL(audioFile)} />
          </div>

          <button
            onClick={handlePublish}
            disabled={!canPublish}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              padding: "clamp(12px,2.5vw,14px)",
              borderRadius: "clamp(12px,3vw,16px)",
              backgroundColor: canPublish ? "#fff" : "rgba(128,128,128,0.5)",
              color: "#000",
              fontWeight: "bold",
              cursor: canPublish ? "pointer" : "not-allowed",
              gap: "8px",
              marginTop: "clamp(12px,2vw,16px)",
              boxShadow: canPublish ? "0 4px 12px rgba(0,0,0,0.5)" : "none",
              transition: "all 0.2s ease-in-out",
            }}
          >
            <FaShare />
            {isPublishing ? "Publicando..." : "Publicar"}
          </button>
        </div>
      )}
    </div>
  );
}
