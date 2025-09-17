"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

interface Aluno {
  uid: string;
  nome: string;
  whatsapp?: string;
  image?: string;
  personalUID: string;
  statusPersonal?: string;
  studentPage?: string; // Adicionado
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

  const handleEditarAluno = (studentPage?: string) => {
    if (!studentPage) return;
    window.location.href = `/editar/${studentPage}`;
  };

  if (loading) return <p className="loading-text">Carregando alunos...</p>;
  if (alunos.length === 0) return <p className="loading-text">Sem alunos.</p>;

  const currentUser = auth.currentUser;

  return (
    <div className="alunos-wrapper">
      <h2 className="alunos-title">Alunos ({alunos.length})</h2>
      <div className="alunos-container">
        {alunos.map((aluno) => {
          const whatsapp = aluno.whatsapp; // variável local
          const studentPage = aluno.studentPage; // variável local

          return (
            <div key={aluno.uid} className="aluno-card">
              {aluno.image && (
                <div className="avatar">
                  <img src={aluno.image} alt={aluno.nome} />
                </div>
              )}
              <strong className="aluno-nome">{aluno.nome}</strong>

              {/* Botões de ação */}
              {currentUser && aluno.personalUID === currentUser.uid && (
                <>
                  <button
                    className="editar-btn"
                    onClick={() => handleEditarAluno(studentPage)}
                  >
                    Editar
                  </button>

                  {whatsapp && (
                    <button
                      className="whatsapp-btn"
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
          margin-bottom: 1.5rem;
        }

        .alunos-container {
          display: flex;
          flex-direction: row;
          gap: 1rem;
          justify-content: flex-start;
          align-items: flex-start;
          width: 100%;
          overflow-x: auto;
          padding: 1rem;
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
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
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
          margin-bottom: 0.25rem;
          color: #22c55e;
        }

        .loading-text {
          color: #fff;
          text-align: center;
        }

        .editar-btn,
        .whatsapp-btn {
          margin-top: 0.5rem;
          background: #16a34a;
          color: #fff;
          border: none;
          border-radius: 9999px;
          padding: 0.4rem 1rem;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.9rem;
          transition: 0.3s;
        }

        .editar-btn:hover,
        .whatsapp-btn:hover {
          background: #22c55e;
        }
      `}</style>
    </div>
  );
}
