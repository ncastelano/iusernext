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

// Função para gerar geohash (adaptado do Dart)
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
      } else {
        lonInterval[1] = mid;
      }
    } else {
      mid = (latInterval[0] + latInterval[1]) / 2;
      if (latitude > mid) {
        ch |= 1 << (4 - bit);
        latInterval[0] = mid;
      } else {
        latInterval[1] = mid;
      }
    }
    isEven = !isEven;
    if (bit < 4) {
      bit++;
    } else {
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

  // Pega localização ao montar o componente
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

      // Criação do documento no Firestore
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
      // Reset
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
    <div className="min-h-screen bg-black text-white p-6 flex flex-col gap-4">
      <h1 className="text-2xl font-bold mb-4">Escolher Som</h1>

      <input
        type="file"
        accept=".mp3,.wav,.m4a,.aac,.ogg"
        onChange={handlePickAudio}
        className="mb-2"
      />
      {audioFile && (
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Digite o nome ou título do som..."
            value={songName}
            onChange={(e) => setSongName(e.target.value)}
            className="w-full p-3 rounded-md bg-white/10 border border-white/40"
          />

          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePickImage}
            />
            <div className="h-40 w-40 bg-gray-800 border-2 border-white rounded-lg flex items-center justify-center">
              {isUploadingImage ? (
                <span>Carregando...</span>
              ) : selectedImageUrl ? (
                <Image
                  src={selectedImageUrl}
                  alt="Capa"
                  className="h-40 w-40 object-cover rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center">
                  <FaCamera className="text-white text-3xl" />
                  <span>Selecionar capa</span>
                </div>
              )}
            </div>
          </label>

          <div className="flex items-center gap-4">
            <button
              onClick={handleTogglePlay}
              className="flex items-center px-4 py-2 bg-yellow-500 text-black rounded-md"
            >
              {isPlaying ? (
                <FaPause className="mr-2" />
              ) : (
                <FaPlay className="mr-2" />
              )}
              {isPlaying ? "Pause" : "Play"}
            </button>
            <audio ref={audioRef} src={URL.createObjectURL(audioFile)} />
          </div>

          <button
            onClick={handlePublish}
            disabled={!canPublish}
            className={`flex items-center px-4 py-2 rounded-md mt-4 ${
              canPublish ? "bg-white text-black" : "bg-gray-500 text-black/50"
            }`}
          >
            <FaShare className="mr-2" />{" "}
            {isPublishing ? "Publicando..." : "Publicar"}
          </button>
        </div>
      )}
    </div>
  );
}
