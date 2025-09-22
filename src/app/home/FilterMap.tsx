"use client";

import React from "react";
import { Search } from "lucide-react";

type Filter = {
  label: string;
  icon: React.ReactNode;
  key: string;
};

type FilterMapProps = {
  filters: Filter[];
  selectedFilter: string;
  setSelectedFilter: (key: string) => void;
  search: string;
  setSearch: (value: string) => void;
};

export default function FilterMap({
  filters,
  selectedFilter,
  setSelectedFilter,
  search,
  setSearch,
}: FilterMapProps) {
  const inputFontSize = "clamp(14px, 2.5vw, 18px)";
  const inputHeight = "clamp(40px, 5vh, 30px)";

  const pillPadding = "0.5rem 1rem";
  const pillBorderRadius = "9999px";

  const scrollContainerStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.8rem",
    overflowX: "auto",
    paddingBottom: "0.5rem",
    scrollbarWidth: "thin",
    scrollbarColor: "#fff #000",
  };

  // Cor do input conforme botão selecionado
  const inputBackgroundColor =
    selectedFilter !== "" ? "#fff" : "rgba(34,34,34,0.8)";
  const inputTextColor = selectedFilter !== "" ? "#000" : "#fff";

  // Placeholder dinâmico: usa label do filtro selecionado ou "Buscar..."
  const placeholderText =
    filters.find((f) => f.key === selectedFilter)?.label || "Buscar...";

  return (
    <div
      style={{
        position: "fixed",
        bottom: `calc(clamp(60px, 10vh, 90px) + 1.5vh)`,
        left: 0,
        width: "100vw",
        padding: "1vh 3vw",
        display: "flex",
        alignItems: "center",
        gap: "1vw",
        overflow: "hidden",
        zIndex: 50,
        background: "transparent",
        boxSizing: "border-box",
      }}
    >
      {/* Campo de busca estilo pílula */}
      <div
        style={{
          position: "relative",
          flexGrow: 1,
          minWidth: 0,
          height: inputHeight,
          borderRadius: pillBorderRadius,
          background: inputBackgroundColor,
          display: "flex",
          alignItems: "center",
          paddingLeft: `calc(${inputFontSize} + 1.2rem)`,
          boxSizing: "border-box",
          color: inputTextColor,
          marginTop: "-6px", // <-- sobe todo o input
        }}
      >
        <Search
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: inputTextColor,
            fontSize: inputFontSize,
          }}
        />
        <input
          type="text"
          placeholder={placeholderText}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            border: "none",
            outline: "none",
            fontSize: inputFontSize,
            background: "transparent",
            color: inputTextColor,
            height: "100%",
            borderRadius: pillBorderRadius,
            padding: "0 0.5rem", // padding vertical 0, horizontal 0.5rem
          }}
        />
      </div>

      {/* Botões de filtro */}
      <div style={scrollContainerStyle}>
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setSelectedFilter(f.key)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: pillPadding,
              borderRadius: pillBorderRadius,
              border: "none",
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontSize: inputFontSize,
              backgroundColor:
                selectedFilter === f.key ? "#fff" : "rgba(34,34,34,0.8)",
              color: selectedFilter === f.key ? "#000" : "#fff",
              transition: "all 0.3s ease",
              flexShrink: 0,
            }}
          >
            {f.icon}
            {f.label}
          </button>
        ))}

        <style>{`
          div::-webkit-scrollbar {
            height: 8px;
          }
          div::-webkit-scrollbar-track {
            background: #000;
            border-radius: 4px;
            margin-top: 6px;
          }
          div::-webkit-scrollbar-thumb {
            background-color: #fff;
            border-radius: 4px;
          }
          div::-webkit-scrollbar-thumb:hover {
            background-color: #eee;
          }
        `}</style>
      </div>
    </div>
  );
}
