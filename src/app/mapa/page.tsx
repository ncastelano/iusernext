"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { GoogleMap, OverlayView, useJsApiLoader } from "@react-google-maps/api";
import Image from "next/image";
import { CustomInfoWindowVideo } from "@/app/mapa/CustomInfoWindow";
import { darkThemeStyleArray } from "@/lib/darkThemeStyleArray";
import { Video } from "types/video";
import { User } from "types/user";
import { FilterMap } from "@/app/mapa/FilterMap";
import { VideoMarker } from "../components/VideoMaker";
import { CustomInfoWindowUser } from "@/app/mapa/CustomInfoWindowUser";
import { FilteredList } from "@/app/mapa/FilteredList";
import { SendOrDeleteLocation } from "./SendOrDeleteLocation";
import { useUser } from "../components/UserContext";

const containerStyle = {
  width: "100%",
  height: "100vh",
};

interface VideoRawData {
  videoID: string;
  userProfileImage: string;
  userName: string;
  namePage: string;
  userID: string;
  latitude: number;
  longitude: number;
  artistSongName: string;
  isFlash?: boolean;
  isStore?: boolean;
  isPlace?: boolean;
  isProduct?: boolean;
  thumbnailUrl: string;
  createdAt?: Timestamp | Date;
  publishedDateTime?: number | Timestamp | Date;
}

function convertVideoRawToVideo(id: string, data: VideoRawData): Video {
  return {
    videoID: data.videoID,
    userProfileImage: data.userProfileImage,
    userName: data.userName,
    namePage: data.namePage,
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
  const { user: currentUser } = useUser();

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

  const goToLocationWithZoom = ({
    lat,
    lng,
  }: {
    lat: number | null;
    lng: number | null;
  }) => {
    if (lat != null && lng != null) {
      if (mapRef.current) {
        mapRef.current.panTo({ lat, lng });
        mapRef.current.setZoom(24);
      }
    }
  };

  const goToMyLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          goToLocationWithZoom({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error("Erro ao obter localização atual:", error);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const videoSnapshot = await getDocs(collection(db, "videos"));
      const videoData: Video[] = videoSnapshot.docs.map((doc) => {
        const data = doc.data() as VideoRawData;
        return convertVideoRawToVideo(doc.id, data);
      });
      setVideos(videoData);

      const userSnapshot = await getDocs(collection(db, "users"));
      const userData: User[] = userSnapshot.docs
        .map((doc) => {
          const data = doc.data();
          if (
            typeof data.latitude === "number" &&
            typeof data.longitude === "number"
          ) {
            return {
              uid: data.uid,
              username: data.username ?? "",
              visible: data.visible ?? true,
              namePage: data.namePage || "",
              email: data.email || "",
              image: data.image || "",
              latitude: data.latitude,
              longitude: data.longitude,
            } as User;
          } else {
            return null;
          }
        })
        .filter((u): u is User => u !== null);

      setUsers(userData);
      goToMyLocation();
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  }, [goToMyLocation]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!apiKey) return <p>Chave da API do Google Maps não definida.</p>;
  if (!isLoaded) {
    return (
      <div
        style={{
          backgroundColor: "#000",
          color: "#fff",
          height: "100vh",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
          fontWeight: 500,
          letterSpacing: "1px",
          fontFamily: "Arial, sans-serif",
          animation: "pulse 2s infinite",
        }}
      >
        Explorando território...
        <style>{`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.6; }
            100% { opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  const videosWithLocation = videos.filter(
    (video) =>
      typeof video.latitude === "number" && typeof video.longitude === "number"
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

  const usersWithLocation =
    selectedFilter === "users"
      ? users.filter(
          (user) =>
            typeof user.latitude === "number" &&
            typeof user.longitude === "number" &&
            user.namePage.toLowerCase().includes(normalizedSearch)
        )
      : [];

  const usersWithoutLocation =
    selectedFilter === "users"
      ? users.filter(
          (user) =>
            (user.latitude === null || user.longitude === null) &&
            user.namePage.toLowerCase().includes(normalizedSearch)
        )
      : [];

  return (
    <main
      style={{
        padding: 0,
        fontFamily: "Arial, sans-serif",
        position: "relative",
      }}
    >
      <FilterMap
        selected={selectedFilter}
        onChange={setSelectedFilter}
        onSearchChange={(term) => setSearchTerm(term.toLowerCase())}
      />

      <FilteredList
        filter={selectedFilter}
        users={usersWithLocation}
        videos={videosWithLocation}
        onSelectUser={setSelectedUserId}
        onSelectVideo={setSelectedVideoId}
        goToLocation={goToLocationWithZoom}
        searchTerm={searchTerm}
      />

      <SendOrDeleteLocation onUpdate={fetchData} />

      {deferredPrompt && (
        <button
          onClick={async () => {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === "accepted") {
              console.log("Usuário aceitou instalar o PWA");
            } else {
              console.log("Usuário recusou instalar o PWA");
            }
            setDeferredPrompt(null);
          }}
          style={{
            position: "fixed",
            bottom: 80,
            right: 20,
            zIndex: 1000,
            backgroundColor: "#1a1a1a",
            color: "#fff",
            padding: "12px 16px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
          }}
        >
          📲 Instalar iUser
        </button>
      )}

      {loading ? (
        <p style={{ textAlign: "center" }}>Carregando vídeos...</p>
      ) : (
        <>
          <GoogleMap
            mapContainerStyle={containerStyle}
            mapTypeId="hybrid"
            options={{
              tilt: 45,
              heading: 45,
              styles: darkThemeStyleArray,
              backgroundColor: "#000000",
              mapTypeControl: false,
              keyboardShortcuts: false,
              fullscreenControl: false,
              disableDefaultUI: true,
              clickableIcons: false,
              gestureHandling: "greedy",
            }}
            onLoad={onLoad}
          >
            {filteredVideos.map((video) => (
              <OverlayView
                key={video.videoID}
                position={{ lat: video.latitude!, lng: video.longitude! }}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              >
                <div
                  style={{
                    position: "relative",
                    zIndex: selectedVideoId === video.videoID ? 1000 : 1,
                    transition: "z-index 0.3s ease",
                  }}
                >
                  <VideoMarker
                    video={video}
                    onClick={() => setSelectedVideoId(video.videoID)}
                  />
                  {selectedVideoId === video.videoID && (
                    <OverlayView
                      position={{
                        lat: video.latitude!,
                        lng: video.longitude!,
                      }}
                      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                    >
                      <CustomInfoWindowVideo
                        video={video}
                        onClose={() => setSelectedVideoId(null)}
                      />
                    </OverlayView>
                  )}
                </div>
              </OverlayView>
            ))}

            {usersWithLocation.map((user) => (
              <OverlayView
                key={user.uid}
                position={{ lat: user.latitude!, lng: user.longitude! }}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              >
                <div
                  style={{
                    position: "relative",
                    zIndex: selectedUserId === user.uid ? 1000 : 1,
                    transition: "z-index 0.3s ease",
                  }}
                >
                  <div
                    onClick={() => setSelectedUserId(user.uid)}
                    title={user.namePage}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      overflow: "hidden",
                      border:
                        currentUser?.uid === user.uid
                          ? "3px solid red"
                          : "3px solid #2ecc71",
                      boxShadow: "0 0 5px rgba(0,0,0,0.3)",
                      cursor: "pointer",
                      backgroundColor: "#fff",
                    }}
                  >
                    <Image
                      src={user.image}
                      alt={user.namePage}
                      width={60}
                      height={60}
                      style={{ objectFit: "cover" }}
                    />
                  </div>

                  {selectedUserId === user.uid && (
                    <OverlayView
                      position={{
                        lat: user.latitude!,
                        lng: user.longitude!,
                      }}
                      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                    >
                      <CustomInfoWindowUser
                        user={user}
                        onClose={() => setSelectedUserId(null)}
                      />
                    </OverlayView>
                  )}
                </div>
              </OverlayView>
            ))}
          </GoogleMap>

          {selectedFilter === "users" && usersWithoutLocation.length > 0 && (
            <section
              style={{
                maxHeight: "30vh",
                overflowY: "auto",
                backgroundColor: "#111",
                color: "#eee",
                padding: "12px 20px",
                fontSize: 14,
              }}
            >
              <h3>Usuários sem localização</h3>
              {usersWithoutLocation.map((user) => (
                <div
                  key={user.uid}
                  style={{
                    padding: "6px 0",
                    borderBottom: "1px solid #333",
                  }}
                >
                  {user.namePage} (Localização não disponível)
                </div>
              ))}
            </section>
          )}
        </>
      )}
    </main>
  );
}
