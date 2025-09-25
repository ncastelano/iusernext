"use client";

import { useRouter } from "next/navigation";
import { GeoPoint } from "firebase/firestore";
import { useState, useEffect } from "react";
import {
  FaShare,
  FaArrowLeft,
  FaBold,
  FaItalic,
  FaListUl,
  FaListOl,
} from "react-icons/fa";
import { doc, collection, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "@/lib/firebase";
import { Publication } from "types/publication";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

// Geohash
const base32 = "0123456789bcdefghjkmnpqrstuvwxyz";
function encodeGeoHash(latitude: number, longitude: number, precision = 9) {
  const latInterval = [-90.0, 90.0];
  const lonInterval = [-180.0, 180.0];
  let geohash = "";
  let isEven = true;
  let bit = 0;
  let ch = 0;

  while (geohash.length < precision) {
    let mid: number;
    if (isEven) {
      mid = (lonInterval[0] + lonInterval[1]) / 2;
      if (longitude > mid) {
        ch |= 1 << (4 - bit);
        lonInterval[0] = mid;
      } else lonInterval[1] = mid;
    } else {
      mid = (latInterval[0] + latInterval[1]) / 2;
      if (latitude > mid) {
        ch |= 1 << (4 - bit);
        latInterval[0] = mid;
      } else latInterval[1] = mid;
    }
    isEven = !isEven;
    if (bit < 4) bit++;
    else {
      geohash += base32[ch];
      bit = 0;
      ch = 0;
    }
  }
  return geohash;
}

export default function EscreverTexto() {
  const [textTitle, setTextTitle] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [geohash, setGeohash] = useState<string | null>(null);

  const router = useRouter();
  const auth = getAuth();

  // Tiptap editor
  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
  });

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition(pos);
        setGeohash(encodeGeoHash(pos.coords.latitude, pos.coords.longitude));
      },
      (err) => console.warn("Erro ao obter localização:", err.message)
    );
  }, []);

  const handlePublish = async () => {
    if (!editor) return;
    if (textTitle.trim().length < 4 || editor.getText().trim().length < 4)
      return;
    if (!position || !geohash) {
      alert("Aguardando geolocalização...");
      return;
    }

    setIsPublishing(true);
    try {
      const newDocRef = doc(collection(db, "publications"));

      const publication: Publication = {
        position: new GeoPoint(
          position.coords.latitude,
          position.coords.longitude
        ),
        geohash,
        ranking: 0,
        publicationType: "text",
        ownerType: "user",
        userID: auth.currentUser?.uid || "",
        createdDateTime: new Date(),
        active: true,
        visibleOnMap: true,
        deleted: false,
        textID: newDocRef.id,
        textTitle,
        textContent: editor.getHTML(),
      };

      await setDoc(newDocRef, publication);

      alert("Texto publicado com sucesso!");
      setTextTitle("");
      editor.commands.setContent("");
    } catch (error) {
      console.error(error);
      alert("Erro ao publicar texto");
    } finally {
      setIsPublishing(false);
    }
  };

  const canPublish =
    editor &&
    textTitle.trim().length >= 4 &&
    editor.getText().trim().length >= 4 &&
    !isPublishing;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100dvh",
        background: "#000",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
        overflowX: "hidden",
      }}
    >
      {/* AppBar */}
      <div
        style={{
          height: "clamp(40px,6vh,80px)",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(0,0,0,0.7)",
          fontSize: "clamp(24px,4vw,50px)",
        }}
      >
        <button
          onClick={() => router.back()}
          aria-label="Voltar"
          style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            fontSize: "clamp(24px,4vw,50px)",
            cursor: "pointer",
            marginRight: "12px",
          }}
        >
          <FaArrowLeft />
        </button>
        <div style={{ fontWeight: 700, fontSize: "clamp(24px,4vw,50px)" }}>
          Escrever
        </div>
      </div>

      {/* Conteúdo */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: "clamp(16px,2vw,32px)",
          padding: "16px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Título */}
        <input
          type="text"
          placeholder="Digite o título do texto..."
          value={textTitle}
          onChange={(e) => setTextTitle(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "400px",
            padding: "12px",
            borderRadius: "8px",
            backgroundColor: "rgba(255,255,255,0.1)",
            border: "1.5px solid rgba(255,255,255,0.3)",
            color: "#fff",
            fontSize: "18px",
            boxSizing: "border-box",
          }}
        />

        {/* Toolbar Tiptap */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
          <button
            onClick={() => editor?.chain().focus().toggleBold().run()}
            style={{
              color: editor?.isActive("bold") ? "#fff" : "#888",
              background: "transparent",
              border: "1px solid #888",
              padding: "4px",
              borderRadius: "4px",
            }}
          >
            <FaBold />
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            style={{
              color: editor?.isActive("italic") ? "#fff" : "#888",
              background: "transparent",
              border: "1px solid #888",
              padding: "4px",
              borderRadius: "4px",
            }}
          >
            <FaItalic />
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            style={{
              color: editor?.isActive("bulletList") ? "#fff" : "#888",
              background: "transparent",
              border: "1px solid #888",
              padding: "4px",
              borderRadius: "4px",
            }}
          >
            <FaListUl />
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            style={{
              color: editor?.isActive("orderedList") ? "#fff" : "#888",
              background: "transparent",
              border: "1px solid #888",
              padding: "4px",
              borderRadius: "4px",
            }}
          >
            <FaListOl />
          </button>
        </div>

        {/* Editor */}
        <div
          style={{
            width: "100%",
            maxWidth: "400px",
            backgroundColor: "rgba(255,255,255,0.05)",
            border: "1.5px solid rgba(255,255,255,0.3)",
            borderRadius: "8px",
            minHeight: "200px",
            overflow: "hidden",
            color: "#fff",
            padding: "8px",
          }}
        >
          <EditorContent editor={editor} />
        </div>

        {/* Botão publicar */}
        <button
          onClick={handlePublish}
          disabled={!canPublish}
          style={{
            width: "100%",
            maxWidth: "400px",
            padding: "12px",
            borderRadius: "12px",
            backgroundColor: canPublish ? "#fff" : "rgba(128,128,128,0.5)",
            color: "#000",
            fontWeight: "bold",
            cursor: canPublish ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <FaShare />
          {isPublishing ? "Publicando..." : "Publicar"}
        </button>
      </div>
    </div>
  );
}
