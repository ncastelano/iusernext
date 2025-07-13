"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import { Video } from "types/video";
import { User } from "types/user";
import { darkThemeStyleArray } from "@/lib/darkThemeStyleArray";

import { FilterMap } from "../components/FilterMap";
import { FilteredList } from "../components/FilteredList";
import { CustomInfoWindowUser } from "../components/CustomInfoWindowUser";
import { CustomInfoWindowVideo } from "../components/CustomInfoWindow";

const containerStyle = {
  width: "100%",
  height: "100vh",
};

interface VideoRawData {
  videoID: string;
  userProfileImage: string;
  userName: string;
  userID: string;
  latitude: number;
  longitude: number;
  artistSongName: string;
  isFlash?: boolean;
  isStore?: boolean;
  isPlace?: boolean;
  isProduct?: boolean;
  thumbnailUrl: string;
  publishedDateTime?: number | Timestamp | Date;
}

function convertVideoRawToVideo(id: string, data: VideoRawData): Video {
  return {
    videoID: data.videoID,
    userProfileImage: data.userProfileImage,
    userName: data.userName,
    userID: data.userID,
    latitude: data.latitude,
    longitude: data.longitude,
    artistSongName: data.artistSongName,
    isFlash: data.isFlash ?? false,
    isStore: data.isStore ?? false,
    isPlace: data.isPlace ?? false,
    isProduct: data.isProduct ?? false,
    thumbnailUrl: data.thumbnailUrl,
    publishedDateTime:
      data.publishedDateTime instanceof Timestamp
        ? data.publishedDateTime.toDate().getTime()
        : typeof data.publishedDateTime === "number"
        ? data.publishedDateTime
        : undefined,
  };
}

export default function Mapa() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<
    "users" | "flash" | "store" | "place" | "product"
  >("users");
  const [searchTerm, setSearchTerm] = useState("");

  const mapRef = useRef<google.maps.Map | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey ?? "",
    libraries: ["places"],
  });

  const onLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };

  const goToLocationWithZoom = ({ lat, lng }: { lat: number; lng: number }) => {
    if (mapRef.current) {
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(17);
    }
  };

  const goToMyLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          goToLocationWithZoom({ lat: latitude, lng: longitude });
        },
        (error) => console.error("Erro ao obter localização:", error),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const videoSnapshot = await getDocs(collection(db, "videos"));
        const videoData: Video[] = videoSnapshot.docs.map((doc) => {
          const data = doc.data() as VideoRawData;
          return convertVideoRawToVideo(doc.id, data);
        });
        setVideos(videoData);

        const userSnapshot = await getDocs(collection(db, "users"));
        const userData = userSnapshot.docs
          .map((doc) => {
            const data = doc.data();
            if (
              typeof data.latitude === "number" &&
              typeof data.longitude === "number"
            ) {
              return {
                uid: data.uid,
                username: data.username ?? "",
                visible: data.visible ?? [],
                name: data.name || "",
                email: data.email || "",
                image: data.image || "",
                latitude: data.latitude,
                longitude: data.longitude,
              } as User;
            }
            return null;
          })
          .filter((u): u is User => u !== null);
        setUsers(userData);

        goToMyLocation();
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [goToMyLocation]);

  if (!apiKey) return <p>Chave da API do Google Maps não definida.</p>;
  if (!isLoaded)
    return (
      <div style={{ color: "white", textAlign: "center", paddingTop: "50vh" }}>
        Carregando mapa...
      </div>
    );

  const videosWithLocation = videos.filter(
    (v) => typeof v.latitude === "number" && typeof v.longitude === "number"
  );

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredVideos = videosWithLocation.filter((video) => {
    const matchesFilter =
      (selectedFilter === "flash" && video.isFlash) ||
      (selectedFilter === "store" && video.isStore) ||
      (selectedFilter === "place" && video.isPlace) ||
      (selectedFilter === "product" && video.isProduct);

    const matchesSearch = video.artistSongName
      ?.toLowerCase()
      .includes(normalizedSearch);

    return matchesFilter && matchesSearch;
  });

  const filteredUsers =
    selectedFilter === "users"
      ? users.filter((user) =>
          user.name.toLowerCase().includes(normalizedSearch)
        )
      : [];

  const sortedVideos = [...filteredVideos];
  if (selectedVideoId) {
    const index = sortedVideos.findIndex((v) => v.videoID === selectedVideoId);
    if (index > -1) {
      const [clicked] = sortedVideos.splice(index, 1);
      sortedVideos.push(clicked);
    }
  }

  const sortedUsers = [...filteredUsers];
  if (selectedUserId) {
    const index = sortedUsers.findIndex((u) => u.uid === selectedUserId);
    if (index > -1) {
      const [clicked] = sortedUsers.splice(index, 1);
      sortedUsers.push(clicked);
    }
  }

  return (
    <main style={{ position: "relative" }}>
      <FilterMap
        selected={selectedFilter}
        onChange={setSelectedFilter}
        onSearchChange={(term: string) => setSearchTerm(term.toLowerCase())}
      />
      <FilteredList
        filter={selectedFilter}
        users={users}
        videos={videosWithLocation}
        onSelectUser={setSelectedUserId}
        onSelectVideo={setSelectedVideoId}
        goToLocation={goToLocationWithZoom}
        searchTerm={searchTerm}
      />
      <button
        onClick={goToMyLocation}
        style={{
          position: "fixed",
          bottom: 90,
          left: 20,
          zIndex: 1000,
          padding: "10px 16px",
          backgroundColor: "#1a1a1a",
          color: "#ccc",
          border: "1px solid #444",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        📍 Minha localização
      </button>

      {deferredPrompt && (
        <button
          onClick={async () => {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            setDeferredPrompt(null);
          }}
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            zIndex: 1000,
            backgroundColor: "#1a1a1a",
            color: "#fff",
            padding: "12px 16px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          📲 Instalar iUser
        </button>
      )}

      {loading ? (
        <p style={{ textAlign: "center" }}>Carregando vídeos...</p>
      ) : (
        <GoogleMap
          mapContainerStyle={containerStyle}
          mapTypeId="satellite"
          options={{
            tilt: 45,
            heading: 0,
            zoom: 18,
            styles: darkThemeStyleArray,
            rotateControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          }}
          onLoad={onLoad}
        >
          {selectedFilter === "users"
            ? sortedUsers.map((user) => (
                <CustomInfoWindowUser
                  user={user}
                  onClose={() => setSelectedUserId(null)}
                  selected={selectedUserId === user.uid}
                />
              ))
            : sortedVideos.map((video) => (
                <CustomInfoWindowVideo
                  video={video}
                  onClose={() => setSelectedVideoId(null)}
                  selected={selectedVideoId === video.videoID}
                />
              ))}
        </GoogleMap>
      )}
    </main>
  );
}
