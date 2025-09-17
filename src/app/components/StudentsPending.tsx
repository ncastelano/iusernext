"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

interface Aluno {
  uid: string;
  nome: string;
  email: string;
  telefone?: string;
  image?: string;
  personalUID: string;
  statusPersonal?: string;
}

export default function AlunosPendentes() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlunos = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const q = query(
        collection(db, "training"),
        where("personalUID", "==", currentUser.uid),
        where("statusPersonal", "==", "pendente")
      );

      const snapshot = await getDocs(q);
      const fetched: Aluno[] = snapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      })) as Aluno[];

      setAlunos(fetched);
    } catch (err) {
      console.error("Erro ao buscar alunos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlunos();
  }, []);

  const handleAction = async (
    alunoId: string,
    action: "aceito" | "sem personal"
  ) => {
    try {
      const alunoRef = doc(db, "training", alunoId);
      await updateDoc(alunoRef, { statusPersonal: action });
      setAlunos((prev) => prev.filter((a) => a.uid !== alunoId));
    } catch (err) {
      console.error("Erro ao atualizar status do aluno:", err);
    }
  };

  if (loading)
    return (
      <p style={{ color: "#fff", textAlign: "center" }}>Carregando alunos...</p>
    );
  if (alunos.length === 0) return null;

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginBottom: "2rem",
      }}
    >
      <h2
        style={{
          color: "#22c55e",
          fontSize: "1.5rem",
          fontWeight: 700,
          textAlign: "center",
          marginBottom: "1rem",
        }}
      >
        Pedidos para ser aluno ({alunos.length})
      </h2>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "1rem",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          width: "100%",
          overflowX: "auto",
          padding: "0.5rem",
          boxSizing: "border-box",
          scrollBehavior: "smooth",
        }}
      >
        {alunos.map((aluno) => (
          <div
            key={aluno.uid}
            style={{
              flex: "0 0 auto",
              width: "200px",
              background: "rgba(0,0,0,0.6)",
              borderRadius: "16px",
              boxShadow: "0 6px 20px rgba(0,0,0,0.5)",
              padding: "1rem",
              textAlign: "center",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform =
                "translateY(-4px)";
              (e.currentTarget as HTMLDivElement).style.boxShadow =
                "0 10px 25px rgba(0,0,0,0.6)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform =
                "translateY(0)";
              (e.currentTarget as HTMLDivElement).style.boxShadow =
                "0 6px 20px rgba(0,0,0,0.5)";
            }}
          >
            {aluno.image && (
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  margin: "0 auto 0.5rem",
                  border: "3px solid #22c55e",
                  position: "relative", // necessário para Image fill
                }}
              >
                <Image
                  src={aluno.image}
                  alt={aluno.nome}
                  fill
                  style={{ objectFit: "cover", borderRadius: "50%" }}
                />
              </div>
            )}

            <strong
              style={{
                fontSize: "1.2rem",
                marginBottom: "0.5rem",
                color: "#22c55e",
              }}
            >
              {aluno.nome}
            </strong>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              <button
                style={{
                  padding: "0.4rem 0.8rem",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "opacity 0.2s",
                  backgroundColor: "#22c55e",
                  color: "white",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                onClick={() => handleAction(aluno.uid, "aceito")}
              >
                Aceitar
              </button>

              <button
                style={{
                  padding: "0.4rem 0.8rem",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "opacity 0.2s",
                  backgroundColor: "#ef4444",
                  color: "white",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                onClick={() => handleAction(aluno.uid, "sem personal")}
              >
                Recusar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
