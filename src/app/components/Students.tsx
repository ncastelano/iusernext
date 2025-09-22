"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

interface Aluno {
  uid: string;
  name: string;
  whatsapp?: string;
  image?: string;
  personalUID: string;
  statusPersonal?: string;
  alunoPage?: string; // Alterado de studentPage
}

export default function AlunosAceitos() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const q = query(
      collection(db, "training"),
      where("personalUID", "==", currentUser.uid),
      where("statusPersonal", "==", "aceito")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched: Aluno[] = snapshot.docs.map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        })) as Aluno[];
        setAlunos(fetched);
        setLoading(false);
      },
      (err) => {
        console.error("Erro ao buscar alunos:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleEditarAluno = (alunoPage?: string) => {
    if (!alunoPage) return;
    window.location.href = `/editar/${alunoPage}`;
  };

  if (loading)
    return (
      <p style={{ color: "#fff", textAlign: "center" }}>Carregando alunos...</p>
    );
  if (alunos.length === 0)
    return <p style={{ color: "#fff", textAlign: "center" }}>Sem alunos.</p>;

  const currentUser = auth.currentUser;

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
          marginBottom: "1.5rem",
        }}
      >
        Alunos ({alunos.length})
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
          padding: "1rem",
          boxSizing: "border-box",
          scrollBehavior: "smooth",
        }}
      >
        {alunos.map((aluno) => {
          const whatsapp = aluno.whatsapp;
          const alunoPage = aluno.alunoPage; // Alterado

          return (
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
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
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
                    position: "relative",
                  }}
                >
                  <Image
                    src={aluno.image || "/default-avatar.png"}
                    alt={aluno.name || "Foto do aluno"}
                    fill
                    style={{ objectFit: "cover", borderRadius: "50%" }}
                  />
                </div>
              )}

              <strong
                style={{
                  fontSize: "1.2rem",
                  marginBottom: "0.25rem",
                  color: "#22c55e",
                }}
              >
                {aluno.name}
              </strong>

              {currentUser && aluno.personalUID === currentUser.uid && (
                <>
                  <button
                    style={{
                      marginTop: "0.5rem",
                      background: "#16a34a",
                      color: "#fff",
                      border: "none",
                      borderRadius: "9999px",
                      padding: "0.4rem 1rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      transition: "0.3s",
                    }}
                    onClick={() => handleEditarAluno(alunoPage)}
                  >
                    Editar
                  </button>

                  {whatsapp && (
                    <button
                      style={{
                        marginTop: "0.5rem",
                        background: "#16a34a",
                        color: "#fff",
                        border: "none",
                        borderRadius: "9999px",
                        padding: "0.4rem 1rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        transition: "0.3s",
                      }}
                      onClick={() =>
                        window.open(
                          `https://wa.me/${whatsapp.replace(/\D/g, "")}`,
                          "_blank"
                        )
                      }
                    >
                      {whatsapp}
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
