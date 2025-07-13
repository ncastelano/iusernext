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
        // Definir currentTime após metadados para capturar frame
        try {
          video.currentTime = 1;
        } catch (err) {
          reject("Erro ao definir o tempo do vídeo para captura.");
        }
      };

      video.onseeked = () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("Erro ao criar canvas para thumbnail.");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject("Falha ao gerar thumbnail do vídeo.");
        }, "image/jpeg");
      };

      video.onerror = () =>
        reject("Erro ao carregar vídeo para gerar thumbnail.");
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
      setLocationError("Geolocalização não suportada neste navegador.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const q = query(
            collection(db, "videos"),
            where("isStore", "==", true)
          );
          const querySnapshot = await getDocs(q);

          const nearbyStores: Store[] = querySnapshot.docs
            .map((doc) => {
              const data = doc.data();
              // Validação dos dados antes de usar
              if (
                typeof data.latitude !== "number" ||
                typeof data.longitude !== "number" ||
                typeof data.artistSongName !== "string" ||
                typeof data.thumbnailUrl !== "string"
              ) {
                return null;
              }
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
            .filter((store): store is Store => store !== null) // filtra nulos
            .filter((store) => store.distance < 5)
            .sort((a, b) => a.distance - b.distance);

          setStoreList(nearbyStores);
          setLocationError(null);
        } catch (firestoreError) {
          console.error("Erro ao buscar lojas próximas:", firestoreError);
          setLocationError(
            "Erro ao buscar lojas próximas. Tente novamente mais tarde."
          );
        }
      },
      (err) => {
        console.error("Erro ao obter localização:", err);
        if (err.code === 1)
          setLocationError("Permissão para localização negada.");
        else setLocationError("Não foi possível obter sua localização.");
      }
    );
  }, [user]);

  const handleUpload = async () => {
    if (!videoFile || !artistSongName.trim() || !descriptionTags.trim()) {
      alert("Por favor, preencha todos os campos antes de enviar.");
      return;
    }

    if (!user) {
      alert("Usuário não autenticado.");
      return;
    }

    try {
      setUploadProgress(0);

      const newDocRef = doc(collection(db, "videos"));
      const videoID = newDocRef.id;

      // Buscando dados do usuário com tratamento de erro
      let userData;
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists()) {
          console.warn("Dados do usuário não encontrados.");
          userData = { name: "Anônimo", image: "" };
        } else {
          userData = userDoc.data();
        }
      } catch (userFetchError) {
        console.error("Erro ao buscar dados do usuário:", userFetchError);
        userData = { name: "Anônimo", image: "" };
      }

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
            console.error("Erro no upload do vídeo:", error);
            alert(
              `Erro ao enviar o vídeo: ${
                error.code || error.message || "Erro desconhecido"
              }`
            );
            setUploadProgress(null);
            reject(error);
          },
          () => resolve()
        );
      });

      const videoDownloadURL = await getDownloadURL(uploadTask.snapshot.ref);

      // Gerar thumbnail e enviar para Storage
      let thumbDownloadURL = "";
      try {
        const thumbnailBlob = await generateThumbnailFromVideo(videoFile);
        const thumbRef = ref(storage, `All Thumbnails/${videoID}.jpg`);
        const thumbUploadTask = uploadBytesResumable(thumbRef, thumbnailBlob);

        await new Promise<void>((resolve, reject) => {
          thumbUploadTask.on(
            "state_changed",
            () => {}, // você pode querer mostrar progresso da thumbnail, mas é opcional
            (error) => {
              console.warn("Erro no upload da thumbnail:", error);
              reject(error);
            },
            () => resolve()
          );
        });

        thumbDownloadURL = await getDownloadURL(thumbUploadTask.snapshot.ref);
      } catch (thumbError) {
        console.warn("Falha ao gerar ou enviar thumbnail:", thumbError);
        // Não falhar o upload todo por causa da thumbnail
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
      console.error("Erro desconhecido ao enviar vídeo:", error);
      alert(
        `Erro inesperado ao enviar vídeo: ${
          (error as Error).message || "Erro desconhecido"
        }`
      );
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
                style={{ borderRadius: 8, objectFit: "cover" }}
              />
              <p style={{ marginTop: 8, fontWeight: "bold", fontSize: 14 }}>
                {store.artistSongName}
              </p>
              <p style={{ fontSize: 12, color: "#aaa" }}>
                {store.distance.toFixed(2)} km
              </p>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleUpload}
        style={{
          marginTop: 24,
          padding: "12px 32px",
          backgroundColor: "#2ecc71",
          borderRadius: 10,
          fontWeight: "bold",
          cursor: "pointer",
          border: "none",
          color: "#121212",
        }}
        disabled={uploadProgress !== null && uploadProgress < 100}
      >
        {uploadProgress !== null
          ? `Enviando... ${uploadProgress.toFixed(1)}%`
          : "Enviar Vídeo"}
      </button>
    </main>
  );
}
