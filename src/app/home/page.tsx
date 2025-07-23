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

const mapContainerStyle = {
  width: "100vw",
  height: `calc(100vh - ${NAVBAR_HEIGHT * 2}px)`,
};

const defaultCenter = {
  lat: -16.843212,
  lng: -53.905319,
};

const filters = [
  { label: "Flash", icon: <Zap size={16} />, key: "flash" },
  { label: "Usuários", icon: <User size={16} />, key: "users" },
  { label: "Lojas", icon: <Store size={16} />, key: "store" },
  { label: "Produtos", icon: <Package size={16} />, key: "product" },
  { label: "Lugares", icon: <Landmark size={16} />, key: "place" },
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

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Filtros e Input */}
      <div
        style={{
          background: "black",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexWrap: "wrap",
          overflowX: "auto",
        }}
      >
        <div
          style={{
            position: "relative",
            flexGrow: 1,
            minWidth: 0,
            maxWidth: "300px",
            background: "rgba(255, 255, 255, 0.6)",
            borderRadius: "8px",
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
              padding: "8px 8px 8px 28px",
              borderRadius: "8px",
              border: "none",
              width: "100%",
              fontSize: "14px",
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

        <div style={{ display: "flex", gap: "8px", overflowX: "auto" }}>
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setSelectedFilter(f.key)}
              style={{
                flexShrink: 0,
                backgroundColor: selectedFilter === f.key ? "#fff" : "#222",
                color: selectedFilter === f.key ? "#000" : "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "6px 10px",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
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

      {/* Mapa cresce para ocupar altura restante */}
      <div style={{ flexGrow: 1 }}>
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={defaultCenter}
          zoom={4}
        >
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              position={{ lat: marker.lat, lng: marker.lng }}
              title={marker.title}
            />
          ))}
        </GoogleMap>
      </div>

      {/* Navbar */}
      <div
        style={{
          height: NAVBAR_HEIGHT,
          background: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(12px)",
          padding: "6px 0",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          borderTop: "1px solid #444",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <NavIcon
          icon={<Home size={24} />}
          label="Home"
          onClick={() => handleNavigate("/home")}
        />
        <NavIcon
          icon={<MapPin size={24} />}
          label="Mapa"
          onClick={() => handleNavigate("/mapa")}
        />
        <NavIcon
          icon={<User size={24} />}
          label="Perfil"
          onClick={() => handleNavigate("/me")}
        />
        <NavIcon
          icon={<Plus size={24} />}
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
        color: "#fff",
        fontSize: "12px",
        cursor: "pointer",
        flexShrink: 0,
        padding: "6px 12px",
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
