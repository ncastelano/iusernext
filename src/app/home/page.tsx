"use client";

import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
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
};

export default function HomePage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("flash");
  const [markers, setMarkers] = useState<MarkerData[]>([]);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey ?? "",
    libraries: ["places"],
  });

  useEffect(() => {
    // Apenas para ajustar o tamanho da fonte globalmente, se quiser
    const newScale =
      window.innerWidth < 400 ? 1 : window.innerWidth < 768 ? 1.2 : 1.5;
    document.body.style.fontSize = `${newScale}rem`;
  }, []);

  useEffect(() => {
    const loadMarkers = async () => {
      const newMarkers: MarkerData[] = [];

      const videosSnapshot = await getDocs(collection(db, "videos"));
      videosSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.latitude && data.longitude) {
          newMarkers.push({
            id: doc.id,
            lat: data.latitude,
            lng: data.longitude,
            title: data.artistSongName || "Vídeo",
          });
        }
      });

      const usersSnapshot = await getDocs(collection(db, "users"));
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.latitude && data.longitude) {
          newMarkers.push({
            id: doc.id,
            lat: data.latitude,
            lng: data.longitude,
            title: data.name || "Usuário",
          });
        }
      });

      setMarkers(newMarkers);
    };

    loadMarkers();
  }, []);

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
          //styles: darkThemeStyleArray,
          backgroundColor: "#000000",
          mapTypeControl: false,
          keyboardShortcuts: false,
          fullscreenControl: false,
          disableDefaultUI: true,
          clickableIcons: false,
          gestureHandling: "greedy",
        }}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={{ lat: marker.lat, lng: marker.lng }}
            title={marker.title}
          />
        ))}
      </GoogleMap>

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
          flexWrap: "wrap",
          overflowX: "auto",
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
