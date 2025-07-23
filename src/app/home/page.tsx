"use client";

import React, { useEffect, useState } from "react";
import { GoogleMap, OverlayView, useJsApiLoader } from "@react-google-maps/api";
import {
  Home,
  MapPin,
  Plus,
  User,
  Search,
  Zap,
  Store,
  Package,
  Landmark,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

const NAVBAR_HEIGHT = 90;

const defaultCenter = {
  lat: -16.843212,
  lng: -53.905319,
};

const filters = [
  {
    label: "Flash",
    icon: <Zap size={16} className="lucide-icon" />,
    key: "flash",
  },
  {
    label: "Usuários",
    icon: <User size={16} className="lucide-icon" />,
    key: "users",
  },
  {
    label: "Lojas",
    icon: <Store size={16} className="lucide-icon" />,
    key: "store",
  },
  {
    label: "Produtos",
    icon: <Package size={16} className="lucide-icon" />,
    key: "product",
  },
  {
    label: "Lugares",
    icon: <Landmark size={16} className="lucide-icon" />,
    key: "place",
  },
];

type MarkerData = {
  id: string;
  lat: number;
  lng: number;
  title: string;
  image?: string; // avatar image for users
};

type VideoData = MarkerData & {
  thumbnailUrl?: string; // vídeo thumbnail
  isFlash?: boolean;
  isPlace?: boolean;
  isStore?: boolean;
  isProduct?: boolean;
};

export default function HomePage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("flash");
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [allMarkers, setAllMarkers] = useState<MarkerData[]>([]);
  const [videosCache, setVideosCache] = useState<VideoData[]>([]);
  const [usersCache, setUsersCache] = useState<MarkerData[]>([]);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey ?? "",
    libraries: ["places"],
  });

  useEffect(() => {
    const newScale =
      window.innerWidth < 400 ? 1 : window.innerWidth < 768 ? 1.2 : 1.5;
    document.body.style.fontSize = `${newScale}rem`;
  }, []);

  useEffect(() => {
    const loadMarkers = async () => {
      const newVideoMarkers: VideoData[] = [];
      const newUserMarkers: MarkerData[] = [];

      const videosSnapshot = await getDocs(collection(db, "videos"));
      videosSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.latitude && data.longitude) {
          newVideoMarkers.push({
            id: doc.id,
            lat: data.latitude,
            lng: data.longitude,
            title: data.artistSongName || "Vídeo",
            thumbnailUrl: data.thumbnailUrl, // imagem do vídeo
            isFlash: data.isFlash,
            isPlace: data.isPlace,
            isStore: data.isStore,
            isProduct: data.isProduct,
          });
        }
      });

      const usersSnapshot = await getDocs(collection(db, "users"));
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.latitude && data.longitude) {
          newUserMarkers.push({
            id: doc.id,
            lat: data.latitude,
            lng: data.longitude,
            title: data.name || "Usuário",
            image: data.image, // imagem do usuário
          });
        }
      });

      const combined = [...newVideoMarkers, ...newUserMarkers];
      setVideosCache(newVideoMarkers);
      setUsersCache(newUserMarkers);
      setAllMarkers(combined);
      setMarkers(combined);
    };

    loadMarkers();
  }, []);

  useEffect(() => {
    const lowerSearch = search.toLowerCase();

    let filtered: MarkerData[] = [];

    if (selectedFilter === "users") {
      filtered = usersCache.filter((user) =>
        user.title.toLowerCase().includes(lowerSearch)
      );
    } else if (
      selectedFilter === "flash" ||
      selectedFilter === "place" ||
      selectedFilter === "store" ||
      selectedFilter === "product"
    ) {
      const filterKey = {
        flash: "isFlash",
        place: "isPlace",
        store: "isStore",
        product: "isProduct",
      }[selectedFilter] as keyof VideoData;

      filtered = videosCache.filter(
        (video) =>
          video[filterKey] === true &&
          video.title.toLowerCase().includes(lowerSearch)
      );
    } else {
      filtered = allMarkers.filter((marker) =>
        marker.title.toLowerCase().includes(lowerSearch)
      );
    }

    setMarkers(filtered);
  }, [search, selectedFilter, allMarkers, videosCache, usersCache]);

  const handleNavigate = (path: string) => router.push(path);

  if (!isLoaded) return <div>Carregando mapa...</div>;

  const inputFontSize = 40;
  const inputHeight = inputFontSize * 1.5;

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={defaultCenter}
        zoom={5}
        options={{
          tilt: 45,
          heading: 45,
          backgroundColor: "#000000",
          mapTypeControl: false,
          keyboardShortcuts: false,
          fullscreenControl: false,
          disableDefaultUI: true,
          clickableIcons: false,
          gestureHandling: "greedy",
        }}
      >
        {markers.map((marker) => {
          const videoMarker = videosCache.find((v) => v.id === marker.id);
          const imgSrc =
            videoMarker?.thumbnailUrl ??
            usersCache.find((u) => u.id === marker.id)?.image ??
            "";

          return (
            <OverlayView
              key={marker.id}
              position={{ lat: marker.lat, lng: marker.lng }}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "2px solid white",
                  boxShadow: "0 0 4px rgba(0,0,0,0.3)",
                  cursor: "pointer",
                  backgroundColor: "#eee",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title={marker.title}
                onClick={() => {
                  // Exemplo: navegue para o perfil ou detalhe do vídeo aqui
                  console.log("Clicou em", marker.title);
                }}
              >
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={marker.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      backgroundColor: "#ccc",
                    }}
                  />
                )}
              </div>
            </OverlayView>
          );
        })}
      </GoogleMap>
      {(selectedFilter === "users" ? usersCache : markers).length > 0 && (
        <div
          className="avatar-scroll"
          style={{
            position: "fixed",
            bottom: NAVBAR_HEIGHT + inputHeight + 40,
            left: 0,
            width: "100%",
            padding: "0 2vw",
            overflowX: "auto",
            display: "flex",
            gap: "0.8rem",
            zIndex: 11,
          }}
        >
          {(selectedFilter === "users" ? usersCache : markers).map((item) => {
            const imgSrc =
              selectedFilter === "users"
                ? item.image
                : videosCache.find((v) => v.id === item.id)?.thumbnailUrl;

            return (
              <div
                key={item.id}
                style={{
                  flexShrink: 0,
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "2px solid white",
                  backgroundColor: "#ccc",
                  cursor: "pointer",
                }}
                title={item.title}
                onClick={() => console.log("Clicou em:", item.title)}
              >
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={item.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div style={{ width: "100%", height: "100%" }} />
                )}
              </div>
            );
          })}
        </div>
      )}

      <div
        style={{
          position: "fixed",
          bottom: NAVBAR_HEIGHT + 20,
          left: 0,
          width: "100%",
          background: "transparent",
          padding: "1vh 2vw",
          display: "flex",
          alignItems: "center",
          gap: "1vw",
          flexWrap: "nowrap", // 👈 impede que quebre de linha
          overflowX: "auto", // 👈 permite scroll lateral
          zIndex: 10,
        }}
      >
        <div
          style={{
            position: "relative",
            flexGrow: 1,
            minWidth: 0,
            maxWidth: "80vw",
            background: "rgba(255, 255, 255, 0.6)",
            borderRadius: "0.5rem",
            backdropFilter: "blur(8px)",
            height: `${inputHeight}px`,
          }}
        >
          <Search
            size={inputFontSize}
            style={{
              position: "absolute",
              top: "50%",
              left: 8,
              transform: "translateY(-50%)",
              color: "black",
            }}
          />
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: `0.4rem 0.8rem 0.4rem ${inputFontSize + 12}px`,
              borderRadius: "0.5rem",
              border: "none",
              width: "100%",
              fontSize: `${inputFontSize}px`,
              minWidth: 0,
              boxSizing: "border-box",
              background: "transparent",
              color: "black",
              height: `${inputHeight}px`,
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "0.8vw", overflowX: "auto" }}>
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setSelectedFilter(f.key)}
              style={{
                flexShrink: 0,
                backgroundColor: selectedFilter === f.key ? "#fff" : "#222",
                color: selectedFilter === f.key ? "#000" : "#fff",
                border: "none",
                borderRadius: "0.5rem",
                height: `${inputHeight}px`,
                padding: `0 1rem`,
                fontSize: `${inputFontSize * 0.5}px`,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {f.icon}
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          height: NAVBAR_HEIGHT,
          width: "100%",
          background:
            "linear-gradient(to top, rgba(0, 0, 0, 1.0), rgba(0, 0, 0, 0.8), rgba(0,0,0, 0.5), transparent)",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          zIndex: 10,
        }}
      >
        <NavIcon
          icon={<Home size={40} />}
          label="Home"
          onClick={() => handleNavigate("/home")}
        />
        <NavIcon
          icon={<MapPin size={40} />}
          label="Mapa"
          onClick={() => handleNavigate("/mapa")}
        />
        <NavIcon
          icon={<User size={40} />}
          label="Perfil"
          onClick={() => handleNavigate("/me")}
        />
        <NavIcon
          icon={<Plus size={40} />}
          label="Upload"
          onClick={() => handleNavigate("/upload")}
        />
      </div>

      {/* Estilo CSS puro para esconder scrollbar, embutido diretamente na página */}
      <style>
        {`
          .avatar-scroll {
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* IE e Edge */
          }
          .avatar-scroll::-webkit-scrollbar {
            display: none; /* Chrome, Safari */
          }
        `}
      </style>
    </div>
  );
}

function NavIcon({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "none",
        border: "none",
        color: "white",
        fontSize: "0.875rem",
        cursor: "pointer",
        flexShrink: 0,
        padding: "0.5rem 0.75rem",
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
