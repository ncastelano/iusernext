"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import PersonalAvatar from "@/app/components/PersonalAvatar";
import AddOrMyLink from "@/app/components/AddOrMyLink";
import AlunosPendentes from "@/app/components/StudentsPending";
import AlunosAceitos from "@/app/components/Students";

interface Personal {
  uid: string;
  name: string;
  email: string;
  image: string;
  personalPage: string;
  alunos?: string[];
}

export default function PersonalHome() {
  const [personal, setPersonal] = useState<Personal | null>(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("Olá");
  const [showDialog, setShowDialog] = useState(false);
  const [telefone, setTelefone] = useState("");
  const [anamneseOption, setAnamneseOption] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting("Bom dia");
    else if (hour >= 12 && hour < 18) setGreeting("Boa tarde");
    else setGreeting("Boa noite");
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "training", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) setPersonal(docSnap.data() as Personal);
        } catch (err) {
          console.error("Erro ao buscar personal:", err);
        } finally {
          setLoading(false);
        }
      } else setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleEnviarWhatsapp = () => {
    if (!personal || !telefone) return;
    const mensagem = `Olá, estou te convidando para ser meu aluno. Link: https://www.iuser.com.br/convite/${
      personal.email
    }\nOpção de Anamnese: ${anamneseOption || "Nenhuma"}`;
    const numero = telefone.replace(/\D/g, "");
    window.open(
      `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`,
      "_blank"
    );
    alert("Pedido enviado com sucesso!");
    setShowDialog(false);
    setTelefone("");
    setAnamneseOption("");
  };

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100dvh",
          height: "100vh", // fallback
          color: "#fff",
          overflow: "hidden",
        }}
      >
        Carregando...
      </div>
    );

  if (!personal)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100dvh",
          height: "100vh", // fallback
          color: "#fff",
        }}
      >
        Personal não encontrado.
      </div>
    );

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100dvh", // garante pelo menos a altura da tela
        display: "flex",
        flexDirection: "column",
        padding: "2rem 1rem",
        gap: "2rem",
        boxSizing: "border-box",
      }}
    >
      {/* Fundo animado */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg,#0f5976,#0f766e,#0f7646,#0f7625)",
          backgroundSize: "400% 400%",
          animation: "gradientFlow 60s ease infinite",
          zIndex: 1,
          overflow: "hidden",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 2,
        }}
      />

      {/* Conteúdo principal */}
      <main
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2rem",
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <PersonalAvatar personal={personal} greeting={greeting} />
        <AddOrMyLink
          personalEmail={personal.email}
          personalPage={personal.personalPage}
        />
        <AlunosPendentes />
        <AlunosAceitos />
      </main>

      {/* Dialog Modal */}
      {showDialog && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 50,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(15px) saturate(180%)",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.18)",
              boxShadow: "0 6px 20px rgba(0,0,0,0.5)",
              width: "100%",
              maxWidth: 400,
              color: "#fff",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              padding: "2rem",
              position: "relative",
            }}
          >
            <button
              onClick={() => setShowDialog(false)}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                background: "rgba(255,255,255,0.15)",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: 32,
                height: 32,
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              ✕
            </button>
            <h3>Adicionar Aluno</h3>
            <input
              type="tel"
              placeholder="Telefone / WhatsApp"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              style={{
                padding: 12,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                outline: "none",
                fontSize: "1rem",
                backdropFilter: "blur(10px)",
              }}
            />
            <label>Adicionar Anamnese?</label>
            <select
              value={anamneseOption}
              onChange={(e) => setAnamneseOption(e.target.value)}
              style={{
                padding: 12,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                outline: "none",
                fontSize: "1rem",
                backdropFilter: "blur(10px)",
              }}
            >
              <option value="">Selecionar...</option>
              <option value="padrao">Padrão</option>
              <option value="parq">PAR-Q</option>
            </select>
            <button
              onClick={handleEnviarWhatsapp}
              style={{
                background: "#16a34a",
                color: "#fff",
                border: "none",
                padding: 12,
                borderRadius: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Enviar Convite
            </button>
          </div>
        </div>
      )}

      {/* Inline keyframes */}
      <style>{`
        @keyframes gradientFlow {
          0% {background-position:0% 50%}
          50% {background-position:100% 50%}
          100% {background-position:0% 50%}
        }
      `}</style>
    </div>
  );
}
