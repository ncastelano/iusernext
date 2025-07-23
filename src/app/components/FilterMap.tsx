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
  inputFontSize?: number;
  inputHeight?: number;
};

export default function FilterMap({
  filters,
  selectedFilter,
  setSelectedFilter,
  search,
  setSearch,
  inputFontSize = 40,
  inputHeight = 60,
}: FilterMapProps) {
  return (
    <>
      {/* Estilo para esconder scrollbar */}
      <style>{`
        .no-scrollbar {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none;  /* IE 10+ */
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari e Edge */
        }
      `}</style>

      <div
        style={{
          position: "fixed",
          bottom: 90,
          left: 0,
          width: "100%",
          background: "transparent",
          padding: "1vh 2vw",
          display: "flex",
          alignItems: "center",
          gap: "1vw",
          overflowX: "auto",
          zIndex: 10,
        }}
      >
        {/* Campo de busca */}
        <div
          style={{
            position: "relative",
            flexGrow: 1,
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
              background: "transparent",
              color: "black",
              height: `${inputHeight}px`,
            }}
          />
        </div>

        {/* Botões de filtro */}
        <div
          className="no-scrollbar"
          style={{ display: "flex", gap: "0.8vw", overflowX: "auto" }}
        >
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
              }}
            >
              {f.icon}
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
