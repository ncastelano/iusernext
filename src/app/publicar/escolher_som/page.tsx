"use client";
import { GeoPoint } from "firebase/firestore";
import { useState, useRef, useEffect } from "react";
import { FaCamera, FaPlay, FaPause, FaShare } from "react-icons/fa";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { addDoc, collection } from "firebase/firestore";
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
      const storageRef = ref(
        storage,
        `songpublication/${Date.now()}_${audioFile.name}`
      );
      await uploadBytes(storageRef, audioFile);
      const songUrl = await getDownloadURL(storageRef);

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
        songID: "",
        songUrl,
        songDuration: audioRef.current?.duration || 0,
        songName,
        imageUrl: selectedImageUrl,
      };

      await addDoc(collection(db, "publications"), publication);
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
        minHeight: "100vh",
        backgroundColor: "#000",
        color: "#fff",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "24px",
      }}
    >
      <h1 style={{ fontSize: "2.5rem", fontWeight: "bold" }}>Escolher Som</h1>

      <input
        type="file"
        accept=".mp3,.wav,.m4a,.aac,.ogg"
        onChange={handlePickAudio}
        style={{
          padding: "8px",
          borderRadius: "8px",
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
            gap: "16px",
            width: "100%",
            maxWidth: "400px",
          }}
        >
          <p
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: "0.875rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              width: "100%",
            }}
          >
            {audioFile.name}
          </p>

          <label style={{ cursor: "pointer" }}>
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handlePickImage}
            />
            <div
              style={{
                width: "192px",
                height: "192px",
                backgroundColor: "#111",
                border: "2px solid #fff",
                borderRadius: "16px",
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
                  <FaCamera style={{ fontSize: "32px", marginBottom: "8px" }} />
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
              padding: "12px",
              borderRadius: "12px",
              backgroundColor: "rgba(255,255,255,0.1)",
              border: "1.5px solid rgba(255,255,255,0.3)",
              color: "#fff",
              fontSize: "1rem",
            }}
          />

          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <button
              onClick={handleTogglePlay}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "10px 16px",
                backgroundColor: "#FFD700",
                color: "#000",
                borderRadius: "12px",
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
              padding: "14px",
              borderRadius: "16px",
              backgroundColor: canPublish ? "#fff" : "rgba(128,128,128,0.5)",
              color: "#000",
              fontWeight: "bold",
              cursor: canPublish ? "pointer" : "not-allowed",
              gap: "8px",
              marginTop: "16px",
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
