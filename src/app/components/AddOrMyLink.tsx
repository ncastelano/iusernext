"use client";

import React, { useState } from "react";

interface AddOrMyLinkProps {
  personalEmail?: string;
  personalPage?: string;
}

export default function AddOrMyLink({
  personalEmail,
  personalPage,
}: AddOrMyLinkProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [telefone, setTelefone] = useState("");
  const [anamneseOption, setAnamneseOption] = useState("");

  const buttonStyle: React.CSSProperties = {
    background: "#16a34a",
    color: "#fff",
    border: "none",
    padding: "8px 20px",
    borderRadius: "9999px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "0.3s",
  };

  // Formata telefone no input (ex: (69) 99999-3632)
  const formatTelefone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    const match = digits.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
    if (!match) return "";
    return !match[2]
      ? match[1]
      : `(${match[1]}) ${match[2]}${match[3] ? "-" + match[3] : ""}`;
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelefone(formatTelefone(e.target.value));
  };

  const handleEnviarWhatsapp = () => {
    if (!personalEmail || !telefone) return;

    // Remove tudo que não for número
    let numero = telefone.replace(/\D/g, "");

    // Adiciona código do país Brasil se não existir
    if (!numero.startsWith("55")) {
      numero = "55" + numero;
    }

    // Monta mensagem
    let mensagem = `Olá, estou te convidando para ser meu aluno. Para prosseguir com o cadastro, entre no link: http://192.168.1.4:3000/convite/${personalPage}`;

    // Só adiciona anamnese se houver seleção
    if (anamneseOption) {
      mensagem += `\nOpção de Anamnese: ${anamneseOption}`;
    }

    const whatsappURL = `https://wa.me/${numero}?text=${encodeURIComponent(
      mensagem
    )}`;

    window.open(whatsappURL, "_blank");
    alert("Pedido enviado com sucesso!");
    setShowDialog(false);
    setTelefone("");
    setAnamneseOption("");
  };

  const handleShareLink = () => {
    if (!personalPage) {
      alert("Link indisponível");
      return;
    }
    const link = `${window.location.origin}/personal/${personalPage}`;
    navigator.clipboard.writeText(link).then(() => {
      alert("Link copiado!");
    });
  };

  return (
    <>
      {/* Container de botões centralizado */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          zIndex: 10,
        }}
      >
        <button style={buttonStyle} onClick={() => setShowDialog(true)}>
          Convidar Aluno
        </button>
        <button style={buttonStyle} onClick={handleShareLink}>
          Compartilhar Link
        </button>
      </div>

      {/* Modal Adicionar Aluno */}
      {showDialog && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(15px) saturate(180%)",
              WebkitBackdropFilter: "blur(15px) saturate(180%)",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.18)",
              boxShadow: "0 6px 20px rgba(0,0,0,0.5)",
              width: "100%",
              maxWidth: "400px",
              textAlign: "center",
              color: "#fff",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              position: "relative",
              padding: "2rem",
            }}
          >
            <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem" }}>
              Adicionar Novo Aluno
            </h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEnviarWhatsapp();
              }}
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <input
                type="tel"
                placeholder="Telefone / WhatsApp"
                value={telefone}
                onChange={handleTelefoneChange}
                style={{
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.3)",
                  background: "rgba(0,0,0,0.6)",
                  color: "#fff",
                  outline: "none",
                  fontSize: "1rem",
                  backdropFilter: "blur(10px)",
                  transition: "0.3s",
                }}
                required
              />

              <select
                value={anamneseOption}
                onChange={(e) => setAnamneseOption(e.target.value)}
                style={{
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.3)",
                  background: "#000",
                  color: "#fff",
                  outline: "none",
                  fontSize: "1rem",
                  transition: "0.3s",
                }}
              >
                <option value="" style={{ background: "#000", color: "#fff" }}>
                  Selecionar Anamnese...
                </option>
                <option
                  value="padrao"
                  style={{ background: "#000", color: "#fff" }}
                >
                  Padrão
                </option>
                <option
                  value="parq"
                  style={{ background: "#000", color: "#fff" }}
                >
                  PAR-Q
                </option>
              </select>

              <button type="submit" style={buttonStyle}>
                Enviar Convite pelo WhatsApp
              </button>
            </form>

            <button
              onClick={() => setShowDialog(false)}
              style={{
                marginTop: "1rem",
                background: "#dc2626",
                border: "none",
                borderRadius: "12px",
                padding: "0.5rem 1rem",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
