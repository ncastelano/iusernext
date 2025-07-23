"use client";

import React, { useEffect, useState } from "react";
import { GoogleMap, OverlayView, useJsApiLoader } from "@react-google-maps/api";
import { User, Zap, Store, Package, Landmark } from "lucide-react";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import BottomBar from "../components/Bottombar";
import FilterMap from "../components/FilterMap";
import AvatarListView from "../components/AvatarListView";

// Posição padrão do mapa
const defaultCenter = {
  lat: -16.843212,
  lng: -53.905319,
};

// Filtros disponíveis no menu horizontal
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

// Tipagem dos dados dos marcadores
type MarkerData = {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  image?: string; // avatar para usuários
};

type VideoData = MarkerData & {
  videoID?: string;
  thumbnailUrl?: string; // imagem do vídeo
  isFlash?: boolean;
  isPlace?: boolean;
  isStore?: boolean;
  isProduct?: boolean;
};

export default function HomePage() {
  // ------------------------------
  // ESTADOS GERAIS DO COMPONENTE
  // ------------------------------
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("flash");
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [allMarkers, setAllMarkers] = useState<MarkerData[]>([]);
  const [videosCache, setVideosCache] = useState<VideoData[]>([]);
  const [usersCache, setUsersCache] = useState<MarkerData[]>([]);

  // Carregamento da API do Google Maps
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey ?? "",
    libraries: ["places"],
  });

  // Ajuste dinâmico de escala de fonte com base no tamanho da tela
  useEffect(() => {
    const newScale =
      window.innerWidth < 400 ? 1 : window.innerWidth < 768 ? 1.2 : 1.5;
    document.body.style.fontSize = `${newScale}rem`;
  }, []);

  // ------------------------------
  // CARREGAMENTO DOS DADOS (Vídeos e Usuários)
  // ------------------------------
  useEffect(() => {
    const loadMarkers = async () => {
      const newVideoMarkers: VideoData[] = [];
      const newUserMarkers: MarkerData[] = [];

      const videosSnapshot = await getDocs(collection(db, "videos"));
      videosSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.latitude && data.longitude) {
          newVideoMarkers.push({
            id: data.videoID || doc.id,
            latitude: data.latitude,
            longitude: data.longitude,
            title: data.artistSongName || "Vídeo",
            thumbnailUrl: data.thumbnailUrl,
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
            id: data.uid || doc.id,
            latitude: data.latitude,
            longitude: data.longitude,
            title: data.name || "Usuário",
            image: data.image,
          });
        }
      });

      // Combinação e cache
      const combined = [...newVideoMarkers, ...newUserMarkers];
      setVideosCache(newVideoMarkers);
      setUsersCache(newUserMarkers);
      setAllMarkers(combined);
      setMarkers(combined);
    };

    loadMarkers();
  }, []);

  // ------------------------------
  // FILTRO DE MARCADORES COM BASE NA BUSCA E FILTRO SELECIONADO
  // ------------------------------
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

  const inputFontSize = 40;
  const inputHeight = inputFontSize * 1.5;

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
      {/* ========================================
         1. MAPA INTERATIVO COM MARCADORES
         ======================================== */}
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={defaultCenter}
        zoom={4}
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
        {/* Marcadores visuais sobre o mapa */}
        {markers.map((marker) => {
          const videoMarker = videosCache.find((v) => v.id === marker.id);
          const imgSrc =
            videoMarker?.thumbnailUrl ??
            usersCache.find((u) => u.id === marker.id)?.image ??
            "";

          return (
            <OverlayView
              key={`marker-${marker.id}`}
              position={{ lat: marker.latitude, lng: marker.longitude }}
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
                  console.log("Clicou em", marker.title);
                }}
              >
                {imgSrc ? (
                  <Image
                    src={imgSrc}
                    alt={marker.title}
                    width={50}
                    height={50}
                    style={{ borderRadius: "50%", objectFit: "cover" }}
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

      {/* ========================================
         2. LISTA HORIZONTAL DE AVATARES (LISTVIEW)
         ======================================== */}
      <AvatarListView
        items={
          selectedFilter === "users"
            ? usersCache.map((u) => ({
                id: u.id,
                title: u.title,
                image: u.image,
              }))
            : markers.map((m) => {
                const video = videosCache.find((v) => v.id === m.id);
                return {
                  id: m.id,
                  title: m.title,
                  image: video?.thumbnailUrl,
                };
              })
        }
        onAvatarClick={(item) => {
          // Exemplo: loga o clique, você pode implementar centralizar no mapa ou abrir modal
          console.log("Avatar clicado:", item.title);
        }}
      />

      {/* ========================================
         3. ÁREA DE FILTROS E BARRA DE BUSCA
         ======================================== */}
      <FilterMap
        filters={filters}
        selectedFilter={selectedFilter}
        setSelectedFilter={setSelectedFilter}
        search={search}
        setSearch={setSearch}
        inputFontSize={inputFontSize}
        inputHeight={inputHeight}
      />

      {/* ========================================
         4. NAVBAR INFERIOR (RODAPÉ)
         ======================================== */}
      <BottomBar />
    </div>
  );
}
