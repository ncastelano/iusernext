"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import Image from "next/image";
import { db } from "@/lib/firebase";

interface Exercicio {
  nome: string;
  periodo: string; // "5x10" ou "20 minutos"
}

interface Treino {
  [dia: string]: Exercicio[];
}

interface Aluno {
  uid: string;
  name: string;
  image?: string;
  personalPage?: string;
  alunoPage?: string;
  whatsapp?: string;
  createdAt?: Timestamp | string;
  treino?: Treino;
  personalUID: string;
}

export default function AlunoPage() {
  const { alunoPage, name } = useParams(); // pegando o parâmetro name
  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [loading, setLoading] = useState(true);
  const [personalImage, setPersonalImage] = useState<string | null>(null);

  const diasSemana = [
    "segunda",
    "terca",
    "quarta",
    "quinta",
    "sexta",
    "sabado",
    "domingo",
  ];

  useEffect(() => {
    if (!alunoPage) return;
    const fetchAluno = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "training"),
          where("alunoPage", "==", alunoPage)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data() as Aluno;
          setAluno(data);
        } else setAluno(null);
      } catch (err) {
        console.error("Erro ao buscar aluno:", err);
        setAluno(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAluno();
  }, [alunoPage]);

  useEffect(() => {
    if (!aluno?.personalUID) return;
    const fetchPersonalImage = async () => {
      try {
        const q = query(
          collection(db, "training"),
          where("uid", "==", aluno.personalUID)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data();
          if (data.image) setPersonalImage(data.image);
        }
      } catch (err) {
        console.error("Erro ao buscar imagem do personal:", err);
        setPersonalImage(null);
      }
    };
    fetchPersonalImage();
  }, [aluno?.personalUID]);

  if (loading)
    return (
      <p style={{ color: "#fff", textAlign: "center", marginTop: "5rem" }}>
        Carregando...
      </p>
    );

  if (!aluno)
    return (
      <p style={{ color: "red", textAlign: "center", marginTop: "5rem" }}>
        Aluno não encontrado
      </p>
    );

  const formatarDataCompleta = (createdAt?: Timestamp | string) => {
    if (!createdAt) return "";
    const date =
      createdAt instanceof Timestamp ? createdAt.toDate() : new Date(createdAt);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const tempoDecorrido = (createdAt?: Timestamp | string) => {
    if (!createdAt) return "";
    const date =
      createdAt instanceof Timestamp ? createdAt.toDate() : new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);

    if (diffYear > 0) return `há ${diffYear} ano${diffYear > 1 ? "s" : ""}`;
    if (diffMonth > 0) return `há ${diffMonth} mês${diffMonth > 1 ? "es" : ""}`;
    if (diffDay > 0) return `há ${diffDay} dia${diffDay > 1 ? "s" : ""}`;
    if (diffHour > 0) return `há ${diffHour} hora${diffHour > 1 ? "s" : ""}`;
    if (diffMin > 0) return `há ${diffMin} minuto${diffMin > 1 ? "s" : ""}`;
    return `há alguns segundos`;
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "linear-gradient(160deg, #0f2027, #203a43, #2c5364)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "2rem",
        color: "#f5f5f5",
        gap: "2rem",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* ALUNO */}
      <div
        style={{
          textAlign: "center",
          width: "100%",
          maxWidth: "420px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        {aluno.image && (
          <div
            style={{
              width: "140px",
              height: "140px",
              borderRadius: "50%",
              overflow: "hidden",
              border: "3px solid #22c55e",
              boxShadow: "0 0 15px rgba(34, 197, 94, 0.5)",
              position: "relative",
            }}
          >
            <Image
              src={aluno.image! || "/default-avatar.png"}
              alt={aluno.name || "Foto do aluno"}
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
        )}

        {/* Nome do aluno vindo do parâmetro "name" */}
        {name && (
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 600,
              color: "#fff",
              marginTop: "0.5rem",
            }}
          >
            {name}
          </h2>
        )}

        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            color: "#22c55e",
            marginBottom: "1rem",
          }}
        >
          {aluno.name}
        </h1>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.8rem",
            alignItems: "center",
          }}
        >
          {aluno.whatsapp && (
            <a
              href={`https://wa.me/${aluno.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                padding: "0.5rem 1rem",
                background: "#25d366",
                color: "#fff",
                fontWeight: 600,
                borderRadius: "12px",
                textDecoration: "none",
                transition: "0.3s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "#1ebe5d")
              }
              onMouseOut={(e) => (e.currentTarget.style.background = "#25d366")}
            >
              Conversar no WhatsApp
            </a>
          )}

          {aluno.personalPage && personalImage && (
            <div
              style={{
                background:
                  "linear-gradient(135deg, rgb(7, 209, 41), rgb(10, 187, 178))",
                padding: "1rem 1.5rem",
                borderRadius: "20px",
                boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
                maxWidth: "320px",
                margin: "1rem auto",
                color: "#fff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    flexShrink: 0,
                    width: "70px",
                    height: "70px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "3px solid rgba(255,255,255,0.8)",
                    boxShadow: "0 0 10px rgba(255,255,255,0.5)",
                    position: "relative",
                  }}
                >
                  <Image
                    src={personalImage || "/default-avatar.png"}
                    alt={aluno.personalPage || "Foto do personal"}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div>
                  <h3
                    style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}
                  >
                    {aluno.personalPage}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.85rem",
                      opacity: 0.85,
                      letterSpacing: "0.5px",
                    }}
                  >
                    Personal
                  </p>
                </div>
              </div>
            </div>
          )}

          {aluno.createdAt && (
            <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.7)" }}>
              Desde: {formatarDataCompleta(aluno.createdAt)} (
              {tempoDecorrido(aluno.createdAt)})
            </p>
          )}
        </div>
      </div>

      {/* TREINO */}
      {aluno.treino && (
        <div style={{ width: "100%", maxWidth: "600px" }}>
          <h2
            style={{
              textAlign: "center",
              fontSize: "1.8rem",
              marginBottom: "1.5rem",
              color: "#22c55e",
              fontWeight: 700,
            }}
          >
            Treino Semanal
          </h2>

          {diasSemana.map((dia) => {
            const exercicios = aluno.treino?.[dia] || [];
            if (exercicios.length === 0) return null;

            return (
              <div key={dia} style={{ marginBottom: "1.2rem" }}>
                <h3
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: 600,
                    color: "#16a34a",
                    marginBottom: "0.5rem",
                  }}
                >
                  {dia.toUpperCase()}
                </h3>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {exercicios.map((ex, idx) => (
                    <li
                      key={idx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "0.6rem 1rem",
                        marginBottom: "0.4rem",
                        background: "rgba(34,197,94,0.1)",
                        borderRadius: "12px",
                        fontWeight: 500,
                        transition: "0.3s",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(34,197,94,0.2)")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(34,197,94,0.1)")
                      }
                    >
                      <span style={{ color: "#f5f5f5" }}>{ex.nome}</span>
                      <span style={{ color: "#e0e0e0", fontSize: "0.9rem" }}>
                        {ex.periodo}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
