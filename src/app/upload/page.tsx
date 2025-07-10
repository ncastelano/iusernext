"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { useUser } from "src/app/components/UserContext";
import Image from "next/image";

// Interface para evitar uso de any
interface Store {
  id: string;
  artistSongName: string;
  thumbnailUrl: string;
  latitude: number;
  longitude: number;
  distance: number;
}

export default function UploadPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoURL, setVideoURL] = useState("");
  const [artistSongName, setArtistSongName] = useState("");
  const [descriptionTags, setDescriptionTags] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const [storeList, setStoreList] = useState<Store[]>([]);
  const [selectedStoreID, setSelectedStoreID] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const router = useRouter();
  const { user, loading } = useUser();

  const generateThumbnailFromVideo = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.src = URL.createObjectURL(file);
      video.crossOrigin = "anonymous";
      video.muted = true;
      video.playsInline = true;

      video.onloadedmetadata = () => {
        video.currentTime = 1;
      };

      video.onseeked = () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("Erro ao criar canvas");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject("Falha ao gerar thumbnail");
        }, "image/jpeg");
      };

      video.onerror = () => reject("Erro ao carregar vídeo");
    });
  };

  const getDistanceFromLatLonInKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    if (!user) return;

    if (!navigator.geolocation) {
      setLocationError("Geolocalização não suportada.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        const q = query(collection(db, "videos"), where("isStore", "==", true));
        const querySnapshot = await getDocs(q);

        const nearbyStores: Store[] = querySnapshot.docs
          .map((doc) => {
            const data = doc.data();
            const distance = getDistanceFromLatLonInKm(
              latitude,
              longitude,
              data.latitude,
              data.longitude
            );
            return {
              id: doc.id,
              artistSongName: data.artistSongName,
              thumbnailUrl: data.thumbnailUrl,
              latitude: data.latitude,
              longitude: data.longitude,
              distance,
            };
          })
          .filter((store) => store.distance < 5)
          .sort((a, b) => a.distance - b.distance);

        setStoreList(nearbyStores);
      },
      (err) => {
        console.error("Erro ao obter localização:", err);
        setLocationError("Não foi possível obter sua localização.");
      }
    );
  }, [user]);

  const handleUpload = async () => {
    if (!videoFile || !artistSongName || !descriptionTags) {
      alert("Preencha todos os campos.");
      return;
    }

    if (!user) {
      alert("Usuário não autenticado");
      return;
    }

    try {
      setUploadProgress(0);

      const newDocRef = doc(collection(db, "videos"));
      const videoID = newDocRef.id;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();

      const videoRef = ref(storage, `All Videos/${videoID}.mp4`);
      const uploadTask = uploadBytesResumable(videoRef, videoFile);

      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            console.error("Erro no upload:", error);
            alert("Erro ao enviar o vídeo.");
            setUploadProgress(null);
            reject(error);
          },
          () => resolve()
        );
      });

      const videoDownloadURL = await getDownloadURL(uploadTask.snapshot.ref);

      let thumbDownloadURL = "";
      try {
        const thumbnailBlob = await generateThumbnailFromVideo(videoFile);
        const thumbRef = ref(storage, `All Thumbnails/${videoID}.jpg`);
        const thumbUpload = await uploadBytesResumable(thumbRef, thumbnailBlob);
        thumbDownloadURL = await getDownloadURL(thumbUpload.ref);
      } catch (thumbError) {
        console.warn("Falha ao gerar thumbnail:", thumbError);
      }

      const postData = {
        userID: user.uid,
        userName: userData?.name || "Anônimo",
        userProfileImage: userData?.image || "",
        postID: videoID,
        totalComments: 0,
        likesList: [],
        artistSongName,
        descriptionTags,
        videoUrl: videoDownloadURL,
        thumbnailUrl: thumbDownloadURL,
        publishedDateTime: Date.now(),
        storeID: selectedStoreID || null,
      };

      await setDoc(newDocRef, postData);

      alert("Vídeo enviado com sucesso!");
      setUploadProgress(null);
      router.push("/tudo");
    } catch (error) {
      console.error("Erro desconhecido:", error);
      alert("Erro ao enviar vídeo.");
      setUploadProgress(null);
    }
  };

  if (loading) {
    return (
      <main
        style={{ padding: 32, backgroundColor: "#121212", color: "#e0e0e0" }}
      >
        Carregando...
      </main>
    );
  }

  if (!user) {
    return (
      <main
        style={{ padding: 32, backgroundColor: "#121212", color: "#e0e0e0" }}
      >
        <h1>Você precisa estar logado para fazer upload.</h1>
        <button
          onClick={() => router.push("/login")}
          style={{
            marginTop: 16,
            padding: 12,
            backgroundColor: "#444",
            borderRadius: 10,
            fontWeight: "bold",
            cursor: "pointer",
            color: "#fff",
          }}
        >
          Ir para Login
        </button>
      </main>
    );
  }

  return (
    <main style={{ padding: 32, backgroundColor: "#121212", color: "#e0e0e0" }}>
      <h1 style={{ fontSize: 24, fontWeight: "bold" }}>Upload de Vídeo</h1>

      {videoURL && (
        <video
          controls
          playsInline
          muted
          width="100%"
          style={{ marginTop: 16 }}
        >
          <source src={videoURL} type="video/mp4" />
          Seu navegador não suporta vídeo.
        </video>
      )}

      <input
        type="file"
        accept="video/mp4,video/webm"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const url = URL.createObjectURL(file);
            const video = document.createElement("video");
            video.src = url;
            video.onloadedmetadata = () => {
              setVideoFile(file);
              setVideoURL(url);
            };
          }
        }}
        style={{
          marginTop: 16,
          display: "block",
          backgroundColor: "#222",
          borderRadius: 5,
          padding: 8,
          width: "100%",
        }}
      />

      <input
        type="text"
        placeholder="Artist - Song"
        value={artistSongName}
        onChange={(e) => setArtistSongName(e.target.value)}
        style={{
          display: "block",
          marginTop: 16,
          width: "100%",
          padding: 8,
          borderRadius: 5,
          backgroundColor: "#222",
          color: "#e0e0e0",
        }}
      />

      <input
        type="text"
        placeholder="Description - Tags"
        value={descriptionTags}
        onChange={(e) => setDescriptionTags(e.target.value)}
        style={{
          display: "block",
          marginTop: 8,
          width: "100%",
          padding: 8,
          borderRadius: 5,
          backgroundColor: "#222",
          color: "#e0e0e0",
        }}
      />

      <h2 style={{ marginTop: 16 }}>Selecione a loja próxima:</h2>
      {locationError && (
        <p style={{ color: "red", marginBottom: 8 }}>{locationError}</p>
      )}
      {storeList.length === 0 && !locationError ? (
        <p>Você está em alguma dessas lojas? </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
            gap: 12,
            marginTop: 8,
          }}
        >
          {storeList.map((store) => (
            <div
              key={store.id}
              onClick={() => setSelectedStoreID(store.id)}
              style={{
                border:
                  selectedStoreID === store.id
                    ? "2px solid #2ecc71"
                    : "1px solid #555",
                borderRadius: 8,
                padding: 8,
                cursor: "pointer",
                backgroundColor: "#1e1e1e",
                textAlign: "center",
              }}
            >
              <Image
                src={store.thumbnailUrl}
                alt={store.artistSongName}
                width={200}
                height={150}
                style={{ width: "100%", borderRadius: 4, height: "auto" }}
                unoptimized
              />
              <p style={{ marginTop: 4, fontSize: 12 }}>
                {store.artistSongName}
              </p>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={uploadProgress !== null}
        style={{
          marginTop: 16,
          padding: 12,
          backgroundColor: uploadProgress !== null ? "#555" : "#fff",
          borderRadius: 10,
          fontWeight: "bold",
          cursor: uploadProgress !== null ? "not-allowed" : "pointer",
          color: uploadProgress !== null ? "#ccc" : "#000",
        }}
      >
        {uploadProgress !== null
          ? `Enviando... ${Math.round(uploadProgress)}%`
          : "Upload Now"}
      </button>

      {uploadProgress !== null && (
        <div style={{ marginTop: 12 }}>
          <div
            style={{
              height: "8px",
              backgroundColor: "#333",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${uploadProgress}%`,
                height: "100%",
                backgroundColor: "#2ecc71",
                transition: "width 0.3s ease",
              }}
            />
          </div>
          <p style={{ fontSize: 12, marginTop: 4 }}>
            {`${Math.round(uploadProgress ?? 0)}%`}
          </p>
        </div>
      )}
    </main>
  );
}
