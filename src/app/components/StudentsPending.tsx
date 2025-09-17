"use client";

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

  if (loading) return <p className="loading-text">Carregando alunos...</p>;
  if (alunos.length === 0) return null;

  return (
    <div className="alunos-wrapper">
      <h2 className="alunos-title">Pedidos para ser aluno ({alunos.length})</h2>
      <div className="alunos-container">
        {alunos.map((aluno) => (
          <div key={aluno.uid} className="aluno-card">
            {aluno.image && (
              <div className="avatar">
                <img src={aluno.image} alt={aluno.nome} />
              </div>
            )}
            <strong className="aluno-nome">{aluno.nome}</strong>
            <div className="botoes">
              <button
                className="btn aceitar"
                onClick={() => handleAction(aluno.uid, "aceito")}
              >
                Aceitar
              </button>
              <button
                className="btn recusar"
                onClick={() => handleAction(aluno.uid, "sem personal")}
              >
                Recusar
              </button>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .alunos-wrapper {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 2rem;
        }

        .alunos-title {
          color: #22c55e;
          font-size: 1.5rem;
          font-weight: 700;
          text-align: center;
          margin-bottom: 1rem;
        }

        .alunos-container {
          display: flex;
          flex-direction: row;
          gap: 1rem;
          justify-content: flex-start;
          align-items: flex-start;
          width: 100%;
          overflow-x: auto;
          padding: 0.5rem 0.5rem; /* menor espaço lateral */
          box-sizing: border-box;
          scroll-behavior: smooth;

          scrollbar-width: thin;
          scrollbar-color: #22c55e rgba(0, 0, 0, 0.3);
        }

        .aluno-card {
          flex: 0 0 auto;
          width: 200px;
          background: rgba(0, 0, 0, 0.6);
          border-radius: 16px;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
          padding: 1rem;
          text-align: center;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .aluno-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.6);
        }

        .avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          overflow: hidden;
          margin: 0 auto 0.5rem;
          border: 3px solid #22c55e;
        }

        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .aluno-nome {
          font-size: 1.2rem;
          margin-bottom: 0.5rem;
          color: #22c55e;
        }

        .botoes {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
        }

        .btn {
          padding: 0.4rem 0.8rem;
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: bold;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .btn:hover {
          opacity: 0.8;
        }

        .aceitar {
          background-color: #22c55e;
          color: white;
        }

        .recusar {
          background-color: #ef4444;
          color: white;
        }

        .loading-text {
          color: #fff;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
