"use client";

import React from "react";
import Image from "next/image";
import { Video } from "types/video";
import { User } from "types/user";

type FilterOption = "users" | "flash" | "store" | "place" | "product";

type FilteredListProps = {
  filter: FilterOption;
  videos: Video[];
  users: User[];
  onSelectVideo: (id: string) => void;
  onSelectUser: (id: string) => void;
  goToLocation: (latLng: { lat: number; lng: number }) => void;
  searchTerm: string;
};

export function FilteredList({
  filter,
  videos,
  users,
  onSelectVideo,
  onSelectUser,
  goToLocation,
  searchTerm,
}: FilteredListProps) {
  let items: (Video | User)[] = [];

  const normalizedSearch = searchTerm.trim().toLowerCase();

  if (filter === "users") {
    items = users.filter((user) =>
      user.namePage.toLowerCase().includes(normalizedSearch)
    );
  } else {
    items = videos
      .filter((video) => {
        if (filter === "flash") return video.isFlash;
        if (filter === "store") return video.isStore;
        if (filter === "place") return video.isPlace;
        if (filter === "product") return video.isProduct;
        return false;
      })
      .filter((video) =>
        video.artistSongName?.toLowerCase().includes(normalizedSearch)
      );
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 80,
        zIndex: 1000,
        width: "100%",
        maxWidth: "100vw",
        boxSizing: "border-box",
        padding: "0 12px", // padding horizontal para evitar corte
        overflowX: "auto",
        display: "flex",
        gap: "clamp(8px, 2vw, 16px)",
        backgroundColor: "transparent",
        borderRadius: "12px",
        scrollbarWidth: "none",
        whiteSpace: "nowrap", // para itens na horizontal
      }}
    >
      <style>{`
      @keyframes marquee {
        0% { transform: translateX(100%); }
        100% { transform: translateX(-100%); }
      }
      .marquee-container {
        width: 60px;
        overflow: hidden;
        white-space: nowrap;
        position: relative;
        text-align: center;
      }
      .marquee-text {
        display: inline-block;
        animation: marquee 6s linear infinite;
        padding-left: 100%;
      }
      /* Oculta scrollbar no Webkit */
      div::-webkit-scrollbar {
        display: none;
      }
    `}</style>

      {items.map((item) =>
        filter === "users" ? (
          <div
            key={(item as User).uid}
            onClick={() => {
              const user = item as User;
              onSelectUser(user.uid);
              if (user.latitude && user.longitude) {
                goToLocation({ lat: user.latitude, lng: user.longitude });
              }
            }}
            title={(item as User).namePage}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              minWidth: 60,
              flexShrink: 0, // importante para evitar encolhimento
            }}
          >
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: "50%",
                overflow: "hidden",
                border: "3px solid #2ecc71",
                boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
                position: "relative",
              }}
            >
              <Image
                src={(item as User).image}
                alt={(item as User).namePage}
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className="marquee-container">
              <span
                className={
                  (item as User).namePage.split(" ")[0].length > 8
                    ? "marquee-text"
                    : ""
                }
              >
                {(item as User).namePage.split(" ")[0]}
              </span>
            </div>
          </div>
        ) : (
          (() => {
            const video = item as Video;
            let borderColor = "#00ff00";
            if (video.isFlash) borderColor = "white";
            else if (video.isStore) borderColor = "orange";
            else if (video.isPlace) borderColor = "#add8e6";
            else if (video.isProduct) borderColor = "yellow";

            const artistName =
              video.artistSongName?.split("-")[0]?.trim() || "Vídeo";

            return (
              <div
                key={video.videoID}
                onClick={() => {
                  onSelectVideo(video.videoID);
                  if (video.latitude && video.longitude) {
                    goToLocation({ lat: video.latitude, lng: video.longitude });
                  }
                }}
                title={video.artistSongName || "Vídeo"}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  cursor: "pointer",
                  minWidth: 60,
                  flexShrink: 0, // evita encolhimento
                }}
              >
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: "10px",
                    overflow: "hidden",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
                    position: "relative",
                    border: `3px solid ${borderColor}`,
                  }}
                >
                  <Image
                    src={video.thumbnailUrl || "/fallback-thumbnail.jpg"}
                    alt={video.artistSongName || "Vídeo"}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className="marquee-container">
                  <span className={artistName.length > 8 ? "marquee-text" : ""}>
                    {artistName}
                  </span>
                </div>
              </div>
            );
          })()
        )
      )}
    </div>
  );
}
