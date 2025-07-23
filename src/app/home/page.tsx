"use client";

import React, { useEffect, useRef, useState } from "react";
import { GoogleMap, OverlayView, useJsApiLoader } from "@react-google-maps/api";
import { User, Zap, Store, Package, Landmark } from "lucide-react";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import BottomBar from "../components/Bottombar";
import FilterMap from "../components/FilterMap";
import AvatarListView from "./AvatarListView";
import CustomInfoWindowUser from "./CustomInfoWindowUser";
import CustomInfoWindowFlash from "./CustomInfoWindowFlash";
import CustomInfoWindowStore from "./CustomInfoWindowStore";
import CustomInfoWindowProduct from "./CustomInfoWindowProduct";
import CustomInfoWindowPlace from "./CustomInfoWindowPlace";
import { MarkerData, VideoData } from "types/markerTypes";

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

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("flash");
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [allMarkers, setAllMarkers] = useState<MarkerData[]>([]);
  const [videosCache, setVideosCache] = useState<VideoData[]>([]);
  const [usersCache, setUsersCache] = useState<MarkerData[]>([]);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [selectedUserMarker, setSelectedUserMarker] =
    useState<MarkerData | null>(null);
  const [selectedFlashMarker, setSelectedFlashMarker] =
    useState<VideoData | null>(null);
  const [selectedStoreMarker, setSelectedStoreMarker] =
    useState<VideoData | null>(null);
  const [selectedProductMarker, setSelectedProductMarker] =
    useState<VideoData | null>(null);
  const [selectedPlaceMarker, setSelectedPlaceMarker] =
    useState<VideoData | null>(null);

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
            uid: data.uid || "",
            username: data.username || "",
            name: data.name || "",
            email: data.email || "",
            namePage: data.namePage || "Vídeo",
            image: data.userProfileImage || "",
            latitude: data.latitude,
            longitude: data.longitude,
            visible: true,
            videoID: data.videoID || doc.id,
            userProfileImage: data.userProfileImage || "",
            userName: data.userName || "",
            thumbnailUrl: data.thumbnailUrl || "",
            publishedDateTime: data.publishedDateTime || 0,
            artistSongName: data.artistSongName || "Vídeo",
            isFlash: data.isFlash || false,
            isPlace: data.isPlace || false,
            isStore: data.isStore || false,
            isProduct: data.isProduct || false,
            videoUrl: data.videoUrl || "",
            visaID: data.visaID || [],
          });
        }
      });

      const usersSnapshot = await getDocs(collection(db, "users"));
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.latitude && data.longitude) {
          newUserMarkers.push({
            id: data.uid || doc.id,
            uid: data.uid || "",
            username: data.username || "",
            name: data.name || "",
            email: data.email || "",
            latitude: data.latitude,
            longitude: data.longitude,
            namePage: data.namePage || "Usuário",
            image: data.image || "",
            visible: data.visible ?? true,
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
    // Limpa todos os selected markers quando o filtro mudar
    setSelectedUserMarker(null);
    setSelectedFlashMarker(null);
    setSelectedStoreMarker(null);
    setSelectedProductMarker(null);
    setSelectedPlaceMarker(null);

    const lowerSearch = search.toLowerCase();
    let filtered: MarkerData[] = [];

    if (selectedFilter === "users") {
      filtered = usersCache.filter((user) =>
        user.namePage.toLowerCase().includes(lowerSearch)
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
          video.namePage.toLowerCase().includes(lowerSearch)
      );
    } else {
      filtered = allMarkers.filter((marker) =>
        marker.namePage.toLowerCase().includes(lowerSearch)
      );
    }

    setMarkers(filtered);
  }, [search, selectedFilter, allMarkers, videosCache, usersCache]);

  const focusOnMarker = (marker: MarkerData) => {
    if (!mapRef.current) return;

    const startZoom = mapRef.current.getZoom() ?? 4;
    const targetZoom = 16;
    const steps = 10;
    const stepDuration = 50;

    mapRef.current.panTo({ lat: marker.latitude, lng: marker.longitude });

    for (let i = 1; i <= steps; i++) {
      setTimeout(() => {
        const zoom = startZoom + ((targetZoom - startZoom) * i) / steps;
        mapRef.current?.setZoom(zoom);
      }, i * stepDuration);
    }
  };

  const handleMapLoad = (map: google.maps.Map): void => {
    mapRef.current = map;
  };

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
        onLoad={handleMapLoad}
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
        {markers.map((marker) => {
          const videoMarker = videosCache.find((v) => v.videoID === marker.id);
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
                title={marker.namePage}
                onClick={() => {
                  if (selectedFilter === "users") {
                    const clickedUser = usersCache.find(
                      (u) => u.id === marker.id
                    );
                    if (clickedUser) {
                      setSelectedUserMarker(clickedUser);
                      setSelectedFlashMarker(null);
                      setSelectedStoreMarker(null);
                    }
                  } else if (selectedFilter === "flash") {
                    const clickedVideo = videosCache.find(
                      (v) => v.id === marker.id
                    );
                    if (clickedVideo) {
                      setSelectedFlashMarker(clickedVideo);
                      setSelectedUserMarker(null);
                      setSelectedStoreMarker(null);
                    }
                  } else if (selectedFilter === "store") {
                    const clickedStore = videosCache.find(
                      (v) => v.id === marker.id && v.isStore
                    );
                    if (clickedStore) {
                      setSelectedStoreMarker(clickedStore);
                      setSelectedUserMarker(null);
                      setSelectedFlashMarker(null);
                    }
                  } else if (selectedFilter === "product") {
                    const clickedProduct = videosCache.find(
                      (v) => v.id === marker.id && v.isProduct
                    );
                    if (clickedProduct) {
                      setSelectedProductMarker(clickedProduct);
                      setSelectedUserMarker(null);
                      setSelectedFlashMarker(null);
                      setSelectedStoreMarker(null);
                    }
                  }
                  if (selectedFilter === "place") {
                    const clickedPlace = videosCache.find(
                      (v) => v.id === marker.id && v.isPlace
                    );
                    if (clickedPlace) {
                      setSelectedPlaceMarker(clickedPlace);
                      setSelectedUserMarker(null);
                      setSelectedFlashMarker(null);
                      setSelectedStoreMarker(null);
                      setSelectedProductMarker(null);
                    }
                  }
                }}
              >
                {imgSrc ? (
                  <Image
                    src={imgSrc}
                    alt={marker.namePage}
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

        {selectedUserMarker && (
          <OverlayView
            position={{
              lat: selectedUserMarker.latitude,
              lng: selectedUserMarker.longitude,
            }}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <CustomInfoWindowUser
              user={selectedUserMarker}
              onClose={() => setSelectedUserMarker(null)}
            />
          </OverlayView>
        )}
        {selectedFlashMarker && (
          <OverlayView
            position={{
              lat: selectedFlashMarker.latitude,
              lng: selectedFlashMarker.longitude,
            }}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <CustomInfoWindowFlash
              video={selectedFlashMarker}
              onClose={() => setSelectedFlashMarker(null)}
            />
          </OverlayView>
        )}
        {selectedStoreMarker && (
          <OverlayView
            position={{
              lat: selectedStoreMarker.latitude,
              lng: selectedStoreMarker.longitude,
            }}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <CustomInfoWindowStore
              video={selectedStoreMarker}
              onClose={() => setSelectedStoreMarker(null)}
            />
          </OverlayView>
        )}
        {selectedProductMarker && (
          <OverlayView
            position={{
              lat: selectedProductMarker.latitude,
              lng: selectedProductMarker.longitude,
            }}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <CustomInfoWindowProduct
              video={selectedProductMarker}
              onClose={() => setSelectedProductMarker(null)}
            />
          </OverlayView>
        )}
        {selectedPlaceMarker && (
          <OverlayView
            position={{
              lat: selectedPlaceMarker.latitude,
              lng: selectedPlaceMarker.longitude,
            }}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <CustomInfoWindowPlace
              video={selectedPlaceMarker}
              onClose={() => setSelectedPlaceMarker(null)}
            />
          </OverlayView>
        )}
      </GoogleMap>

      <AvatarListView
        items={
          selectedFilter === "users"
            ? usersCache.map((u) => ({
                id: u.id,
                title: u.namePage,
                image: u.image,
              }))
            : markers.map((m) => {
                const video = videosCache.find((v) => v.id === m.id);
                return {
                  id: m.id,
                  title: m.namePage,
                  image: video?.thumbnailUrl,
                };
              })
        }
        onAvatarClick={(item) => {
          const marker = markers.find((m) => m.id === item.id);
          if (marker) {
            focusOnMarker(marker);
          }
        }}
      />

      <FilterMap
        filters={filters}
        selectedFilter={selectedFilter}
        setSelectedFilter={setSelectedFilter}
        search={search}
        setSearch={setSearch}
      />

      <BottomBar />
    </div>
  );
}
