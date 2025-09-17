"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

interface Exercicio {
  nome: string;
  periodo: string;
}

interface Treino {
  [dia: string]: Exercicio[];
}

interface Aluno {
  uid: string;
  nome: string;
  email: string;
  personalUID: string;
  studentPage: string;
  image?: string;
  treino?: Treino;
}

export default function EditarAluno() {
  const { studentPage } = useParams();
  const router = useRouter();

  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [loading, setLoading] = useState(true);
  const [treino, setTreino] = useState<Treino>({});

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
    const fetchAluno = async () => {
      const studentPageString = Array.isArray(studentPage)
        ? studentPage[0]
        : studentPage;
      if (!studentPageString) return;

      setLoading(true);

      try {
        const q = query(
          collection(db, "training"),
          where("studentPage", "==", studentPageString)
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          setAluno(null);
          setLoading(false);
          return;
        }

        const docData = snapshot.docs[0];
        const data = docData.data() as Omit<Aluno, "uid">;
        const currentUser = auth.currentUser;

        if (!currentUser || currentUser.uid !== data.personalUID) {
          alert("Você não tem permissão para editar este aluno.");
          router.push("/");
          return;
        }

        setAluno({ uid: docData.id, ...data });
        setTreino(data.treino || {});
      } catch (err) {
        console.error("Erro ao buscar aluno:", err);
        setAluno(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAluno();
  }, [studentPage, router]);

  const handleExercicioChange = (
    dia: string,
    index: number,
    field: keyof Exercicio,
    value: string
  ) => {
    setTreino((prev) => {
      const novoTreino = { ...prev };
      const exercicios = Array.isArray(novoTreino[dia])
        ? [...novoTreino[dia]]
        : [];
      exercicios[index] = { ...exercicios[index], [field]: value };
      novoTreino[dia] = exercicios;
      return novoTreino;
    });
  };

  const adicionarExercicio = (dia: string) => {
    setTreino((prev) => {
      const novoTreino = { ...prev };
      const exercicios = Array.isArray(novoTreino[dia])
        ? [...novoTreino[dia]]
        : [];
      exercicios.push({ nome: "", periodo: "" });
      novoTreino[dia] = exercicios;
      return novoTreino;
    });
  };

  const handleSalvar = async () => {
    if (!aluno) return;

    try {
      const alunoRef = doc(db, "training", aluno.uid);
      await updateDoc(alunoRef, { treino });
      alert("Treino atualizado com sucesso!");
      router.push(`/aluno/${aluno.studentPage}`);
    } catch (err) {
      console.error("Erro ao atualizar treino:", err);
      alert("Erro ao atualizar treino.");
    }
  };

  if (loading)
    return (
      <p style={{ color: "white", textAlign: "center", marginTop: 80 }}>
        Carregando...
      </p>
    );

  if (!aluno)
    return (
      <p style={{ color: "red", textAlign: "center", marginTop: 80 }}>
        Aluno não encontrado
      </p>
    );

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "2rem",
        background: "linear-gradient(135deg,#0f5976,#0f766e,#0f7646,#0f7625)",
        color: "white",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Botão de voltar no canto esquerdo */}
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "flex-start",
          marginBottom: "1rem",
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            width: "150px",
            padding: "0.6rem",
            background: "#16a34a",
            border: "none",
            borderRadius: 12,
            color: "white",
            fontWeight: 600,
            cursor: "pointer",
            transition: "0.3s",
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
          Voltar
        </button>
      </div>

      {/* Avatar + Nome */}
      {aluno.image && (
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            overflow: "hidden",
            border: "3px solid white",
            marginBottom: "1rem",
          }}
        >
          <img
            src={aluno.image}
            alt={aluno.nome}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}

      <h1 style={{ fontSize: "2rem", marginBottom: "2rem", color: "#22c55e" }}>
        Editar Treino de {aluno.nome}
      </h1>

      {diasSemana.map((dia) => (
        <div
          key={dia}
          style={{
            width: "100%",
            maxWidth: 500,
            marginBottom: "1.5rem",
            background: "rgba(0,0,0,0.3)",
            padding: "1rem 1.2rem",
            borderRadius: 12,
            boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
          }}
        >
          <h2
            style={{
              marginBottom: "1rem",
              color: "#22c55e",
              fontSize: "1.3rem",
            }}
          >
            {dia.toUpperCase()}
          </h2>

          {(Array.isArray(treino[dia]) ? treino[dia] : []).map((ex, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                gap: "0.8rem",
                marginBottom: "0.6rem",
                alignItems: "center",
              }}
            >
              <input
                type="text"
                value={ex?.nome || ""}
                onChange={(e) =>
                  handleExercicioChange(dia, index, "nome", e.target.value)
                }
                placeholder="Nome do exercício"
                style={{
                  flex: "0 0 55%",
                  padding: "0.45rem 0.6rem",
                  borderRadius: 8,
                  border: "none",
                }}
              />
              <input
                type="text"
                value={ex?.periodo || ""}
                onChange={(e) =>
                  handleExercicioChange(dia, index, "periodo", e.target.value)
                }
                placeholder="Ex: 4x12 ou 20 min"
                style={{
                  flex: "1 1 35%",
                  padding: "0.45rem 0.6rem",
                  borderRadius: 8,
                  border: "none",
                  minWidth: 0,
                  boxSizing: "border-box",
                }}
              />
            </div>
          ))}

          <button
            onClick={() => adicionarExercicio(dia)}
            style={{
              width: "100%",
              marginTop: "0.5rem",
              padding: "0.6rem",
              background: "#16a34a",
              border: "none",
              borderRadius: 12,
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
              transition: "0.3s",
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
            + Adicionar exercício
          </button>
        </div>
      ))}

      <button
        onClick={handleSalvar}
        style={{
          width: "100%",
          maxWidth: 500,
          marginTop: "1rem",
          padding: "0.6rem",
          background: "#16a34a",
          border: "none",
          borderRadius: 12,
          color: "white",
          fontWeight: 600,
          cursor: "pointer",
          transition: "0.3s",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.background = "#22c55e")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.background = "#16a34a")
        }
      >
        Salvar Treino
      </button>

      <div style={{ height: 100, width: "100%" }} />
    </div>
  );
}
