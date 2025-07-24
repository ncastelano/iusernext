"use client";

import React, { useEffect, useRef } from "react";
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
  const inputFontSize = "clamp(16px, 4vw, 40px)";
  const inputHeight = "clamp(40px, 7vh, 60px)";

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const handleMouseDown = (e: MouseEvent) => {
      isDown = true;
      el.classList.add("dragging");
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
    };

    const handleMouseLeave = () => {
      isDown = false;
      el.classList.remove("dragging");
    };

    const handleMouseUp = () => {
      isDown = false;
      el.classList.remove("dragging");
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1;
      el.scrollLeft = scrollLeft - walk;
    };

    el.addEventListener("mousedown", handleMouseDown);
    el.addEventListener("mouseleave", handleMouseLeave);
    el.addEventListener("mouseup", handleMouseUp);
    el.addEventListener("mousemove", handleMouseMove);

    return () => {
      el.removeEventListener("mousedown", handleMouseDown);
      el.removeEventListener("mouseleave", handleMouseLeave);
      el.removeEventListener("mouseup", handleMouseUp);
      el.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <>
      <style>{`
        .no-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .dragging {
          cursor: grabbing !important;
          user-select: none;
        }

        .filter-bar {
          position: fixed;
          bottom: calc(clamp(60px, 10vh, 90px) + 1.5vh);
          left: 0;
          width: 100%;
          background: transparent;
          padding: 1vh 3vw;
          display: flex;
          align-items: center;
          gap: 2vw;
          overflow-x: auto;
          z-index: 10;
          flex-wrap: nowrap;
        }

        .filter-input {
          position: relative;
          flex-grow: 1;
          max-width: clamp(200px, 70vw, 600px);
          background: rgba(255, 255, 255, 0.6);
          border-radius: 0.5rem;
          backdrop-filter: blur(8px);
        }

        .filter-button {
          flex-shrink: 0;
          border: none;
          border-radius: 0.5rem;
          padding: 0 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-size: clamp(12px, 2vw, 20px);
          height: ${inputHeight};
        }

        @media (min-width: 768px) {
          .filter-bar {
            padding: 1.5vh 5vw;
            gap: 1.5vw;
            bottom: 6vh;
          }

          .filter-button {
            padding: 0 1.5rem;
          }
        }

        @media (min-width: 1200px) {
          .filter-bar {
            padding: 2vh 8vw;
            bottom: 8vh;
          }
        }
      `}</style>

      <div className="filter-bar no-scrollbar">
        <div className="filter-input" style={{ height: inputHeight }}>
          <Search
            style={{
              position: "absolute",
              top: "50%",
              left: 8,
              transform: "translateY(-50%)",
              color: "black",
              fontSize: inputFontSize,
            }}
          />
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: `0.4rem 0.8rem 0.4rem calc(${inputFontSize} + 12px)`,
              borderRadius: "0.5rem",
              border: "none",
              width: "100%",
              fontSize: inputFontSize,
              background: "transparent",
              color: "black",
              height: inputHeight,
            }}
          />
        </div>

        <div
          ref={scrollRef}
          className="no-scrollbar"
          style={{
            display: "flex",
            gap: "1vw",
            overflowX: "auto",
            cursor: "grab",
            minWidth: "fit-content",
            maxWidth: "100%", // Garante que ele respeita a largura da tela
            flexShrink: 0, // Evita encolhimento
          }}
        >
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setSelectedFilter(f.key)}
              className="filter-button"
              style={{
                backgroundColor: selectedFilter === f.key ? "#fff" : "#222",
                color: selectedFilter === f.key ? "#000" : "#fff",
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
