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

const NAVBAR_HEIGHT = 60;

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
  const [scale, setScale] = useState(1);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey ?? "",
    libraries: ["places"],
  });

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

  useEffect(() => {
    const newScale =
      window.innerWidth < 400 ? 1 : window.innerWidth < 768 ? 1.2 : 1.5;
    setScale(newScale);
    document.body.style.fontSize = `${newScale}rem`;
  }, []);

  const handleNavigate = (path: string) => router.push(path);

  if (!isLoaded) return <div>Carregando mapa...</div>;

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
          gestureHandling: "greedy",
          fullscreenControl: false,
          streetViewControl: false,
          zoomControl: true,
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
          bottom: NAVBAR_HEIGHT,
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
          }}
        >
          <Search
            size={16}
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
              padding: "0.8rem 0.8rem 0.8rem 2rem",
              borderRadius: "0.5rem",
              border: "none",
              width: "100%",
              fontSize: "40px",
              minWidth: 0,
              boxSizing: "border-box",
              background: "transparent",
              color: "black",
            }}
          />
        </div>

        <style>{`
          input::placeholder {
            color: black;
            opacity: 0.7;
          }
        `}</style>

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
                padding: `${0.4 * scale}rem ${0.8 * scale}rem`,
                fontSize: `${0.7 * scale}rem`,
                display: "flex",
                alignItems: "center",
                gap: `${0.5 * scale}rem`,
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
          background: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(12px)",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          borderTop: "1px solid #444",
          zIndex: 10,
        }}
      >
        <NavIcon
          icon={<Home size={24} />}
          label="Home"
          onClick={() => handleNavigate("/home")}
          scale={scale}
        />
        <NavIcon
          icon={<MapPin size={24} />}
          label="Mapa"
          onClick={() => handleNavigate("/mapa")}
          scale={scale}
        />
        <NavIcon
          icon={<User size={24} />}
          label="Perfil"
          onClick={() => handleNavigate("/me")}
          scale={scale}
        />
        <NavIcon
          icon={<Plus size={24} />}
          label="Upload"
          onClick={() => handleNavigate("/upload")}
          scale={scale}
        />
      </div>
    </div>
  );
}

function NavIcon({
  icon,
  label,
  onClick,
  scale,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  scale: number;
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
        color: "#fff",
        fontSize: `${0.75 * scale}rem`,
        cursor: "pointer",
        flexShrink: 0,
        padding: `${0.4 * scale}rem ${0.6 * scale}rem`,
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
