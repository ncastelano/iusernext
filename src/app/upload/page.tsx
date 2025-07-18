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
  const [showOnMap, setShowOnMap] = useState(false);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);

  const router = useRouter();
  const { user } = useUser();

  const generateThumbnailFromVideo = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.src = URL.createObjectURL(file);
      video.crossOrigin = "anonymous";
      video.muted = true;
      video.playsInline = true;

      video.onloadeddata = () => {
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
  ) => {
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
    if (!user || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLat(latitude);
        setUserLng(longitude);

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
        latitude: showOnMap && userLat !== null ? userLat : 0,
        longitude: showOnMap && userLng !== null ? userLng : 0,
      };

      await setDoc(newDocRef, postData);
      alert("Vídeo enviado com sucesso!");
      setUploadProgress(null);
      router.push("/");
    } catch (error) {
      console.error("Erro desconhecido:", error);
      alert("Erro ao enviar vídeo.");
      setUploadProgress(null);
    }
  };

  if (!user)
    return (
      <main className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e] text-white p-10">
        <h1 className="text-xl mb-6">
          Você precisa estar logado para fazer upload.
        </h1>
        <button
          onClick={() => router.push("/login")}
          className="px-6 py-3 rounded-xl bg-purple-700 hover:bg-purple-600 transition"
        >
          Ir para Login
        </button>
      </main>
    );

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e] text-white p-10 flex justify-center items-center">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-xl p-8 max-w-lg w-full flex flex-col items-center space-y-6">
        <h1 className="text-2xl font-semibold">Upload de Vídeo</h1>

        {videoURL && (
          <video
            controls
            playsInline
            muted
            className="w-full rounded-lg"
            style={{ maxHeight: "300px" }}
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
              setVideoFile(file);
              const url = URL.createObjectURL(file);
              setVideoURL(url);
            }
          }}
          className="w-full rounded-lg bg-[#2a2a3d] text-white px-4 py-3 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <input
          type="text"
          placeholder="Título"
          value={artistSongName}
          onChange={(e) => setArtistSongName(e.target.value)}
          className="w-full rounded-lg bg-[#2a2a3d] text-white px-4 py-3 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <input
          type="text"
          placeholder="Descrição"
          value={descriptionTags}
          onChange={(e) => setDescriptionTags(e.target.value)}
          className="w-full rounded-lg bg-[#2a2a3d] text-white px-4 py-3 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <label className="flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            checked={showOnMap}
            onChange={() => setShowOnMap((prev) => !prev)}
            className="rounded"
          />
          <span>Mostrar no mapa?</span>
        </label>

        {locationError && (
          <p className="text-red-500 text-sm">{locationError}</p>
        )}

        {storeList.length > 0 && (
          <div className="grid grid-cols-2 gap-4 w-full max-h-64 overflow-auto">
            {storeList.map((store) => (
              <div
                key={store.id}
                onClick={() => setSelectedStoreID(store.id)}
                className={`cursor-pointer rounded-lg overflow-hidden border ${
                  selectedStoreID === store.id
                    ? "border-purple-500"
                    : "border-white/20"
                }`}
              >
                <Image
                  src={store.thumbnailUrl}
                  alt={store.artistSongName}
                  width={200}
                  height={150}
                  className="w-full h-auto"
                  unoptimized
                />
                <p className="text-center text-sm p-2">
                  {store.artistSongName}
                </p>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={uploadProgress !== null}
          className={`w-full py-3 rounded-xl font-semibold transition ${
            uploadProgress !== null
              ? "bg-purple-800 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          {uploadProgress !== null
            ? `Enviando... ${Math.round(uploadProgress)}%`
            : "Enviar"}
        </button>

        {uploadProgress !== null && (
          <div className="w-full mt-2">
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-2 bg-purple-500 transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-center mt-1">
              {Math.round(uploadProgress)}%
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
