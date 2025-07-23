"use client";

import React from "react";
import { GoogleMap, OverlayView } from "@react-google-maps/api";
import { MarkerData, VideoData } from "types/markerTypes";

type Props = {
  markers: MarkerData[];
  videosCache: VideoData[];
  usersCache: MarkerData[];
  defaultCenter: { lat: number; lng: number };
};

export default function Mapa({
  markers,
  videosCache,
  usersCache,
  defaultCenter,
}: Props) {
  return (
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
              onClick={() => console.log("Clicou em", marker.title)}
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
  );
}
