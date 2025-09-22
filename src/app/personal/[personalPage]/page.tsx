"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import AlunosDoPersonal from "@/app/components/StudentosForPersonalPage";

interface Personal {
  name: string;
  image: string;
  personalPage: string;
  uid: string;
  email: string;
}

export default function PersonalPage() {
  const { personalPage } = useParams();
  const router = useRouter();

  const [personal, setPersonal] = useState<Personal | null>(null);
  const [loadingPersonal, setLoadingPersonal] = useState(true);

  useEffect(() => {
    if (!personalPage) return;
    const fetchPersonal = async () => {
      setLoadingPersonal(true);
      try {
        const q = query(
          collection(db, "training"),
          where("personalPage", "==", personalPage)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) setPersonal(snapshot.docs[0].data() as Personal);
        else setPersonal(null);
      } catch (err) {
        console.error("Erro ao buscar personal:", err);
        setPersonal(null);
      } finally {
        setLoadingPersonal(false);
      }
    };
    fetchPersonal();
  }, [personalPage]);

  const handleShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copiado!");
    } catch {
      alert("Não foi possível copiar o link. Tente manualmente.");
    }
  };

  const handleJoinTeam = () => {
    if (personal?.personalPage)
      router.push(`/convite/${personal.personalPage}`);
  };

  if (loadingPersonal)
    return (
      <p style={{ color: "white", textAlign: "center", marginTop: 80 }}>
        Carregando...
      </p>
    );
  if (!personal)
    return (
      <p style={{ color: "red", textAlign: "center", marginTop: 80 }}>
        Personal não encontrado
      </p>
    );

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "linear-gradient(135deg,#0f5976,#0f766e,#0f7646,#0f7625)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "2rem",
        color: "white",
        gap: "2rem",
      }}
    >
      {/* Hero */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "2rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            width: 150,
            height: 150,
            borderRadius: "50%",
            overflow: "hidden",
            border: "4px solid #22c55e",
            boxShadow: "0 8px 20px rgba(0,0,0,0.6)",
          }}
        >
          <Image
            src={personal.image || "/default-avatar.png"}
            alt={personal.name || "Avatar do personal"}
            fill
            style={{ objectFit: "cover" }}
          />
        </div>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            textShadow: "0 4px 10px rgba(0,0,0,0.8)",
          }}
        >
          {personal.name}
        </h1>

        <div
          style={{
            marginTop: "1rem",
            display: "flex",
            gap: "0.75rem",
            justifyContent: "center",
          }}
        >
          <button
            onClick={handleJoinTeam}
            style={{
              background: "#16a34a",
              color: "#fff",
              border: "none",
              padding: "8px 20px",
              borderRadius: 9999,
              fontWeight: 600,
              cursor: "pointer",
              transition: "0.2s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background =
                "#22c55e")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background =
                "#16a34a")
            }
          >
            Entrar para o time
          </button>
          <button
            onClick={handleShareLink}
            style={{
              background: "#16a34a",
              color: "#fff",
              border: "none",
              padding: "8px 20px",
              borderRadius: 9999,
              fontWeight: 600,
              cursor: "pointer",
              transition: "0.2s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background =
                "#22c55e")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background =
                "#16a34a")
            }
          >
            Compartilhar
          </button>
        </div>
      </div>

      {/* Students */}
      <div style={{ width: "100%", marginBottom: "1rem" }}>
        {personal?.personalPage && <AlunosDoPersonal />}
      </div>
    </div>
  );
}
