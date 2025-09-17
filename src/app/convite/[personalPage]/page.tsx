"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, ChangeEvent } from "react";
import { useParams } from "next/navigation";
import {
  collection,
  getDocs,
  query,
  where,
  setDoc,
  doc,
} from "firebase/firestore";
import Image from "next/image";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { db, auth, storage } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface Personal {
  name: string;
  image: string;
  personalPage: string;
  uid: string;
  email: string;
  bio: string;
}

export default function ConvitePage() {
  const params = useParams();
  const personalPage = params.personalPage as string;
  const router = useRouter();

  const [personal, setPersonal] = useState<Personal | null>(null);
  const [loading, setLoading] = useState(true);
  const [studentPage, setStudentPage] = useState("");
  const [showInfoCard, setShowInfoCard] = useState(false);

  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [idade, setIdade] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [senha2, setSenha2] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [showSenha2, setShowSenha2] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [bgPosition, setBgPosition] = useState(0);

  useEffect(() => {
    const fetchPersonal = async () => {
      if (!personalPage) return;
      try {
        const q = query(
          collection(db, "training"),
          where("personalPage", "==", personalPage)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) setPersonal(snapshot.docs[0].data() as Personal);
      } catch (err) {
        console.error("Erro ao carregar personal:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPersonal();
  }, [personalPage]);

  // Background animation
  useEffect(() => {
    const interval = setInterval(() => {
      setBgPosition((prev) => (prev >= 100 ? 0 : prev + 0.1));
    }, 16);
    return () => clearInterval(interval);
  }, []);

  const formatDateInput = (value: string) => {
    let digits = value.replace(/\D/g, "").slice(0, 8);
    if (digits.length >= 5)
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(
        4,
        8
      )}`;
    if (digits.length >= 3)
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
    return digits;
  };

  const maskWhatsapp = (value: string) => {
    let digits = value.replace(/\D/g, "").slice(0, 13);
    if (!digits.startsWith("55")) digits = "55" + digits;
    if (digits.length >= 13)
      return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(
        4,
        9
      )}-${digits.slice(9)}`;
    if (digits.length >= 7)
      return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(
        4
      )}`;
    if (digits.length >= 4) return `+${digits.slice(0, 2)} (${digits.slice(2)}`;
    return `+${digits}`;
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personal) {
      alert("Personal não carregado ainda.");
      return;
    }
    if (senha !== senha2) {
      alert("As senhas não coincidem!");
      return;
    }
    if (!imageFile) {
      alert("Por favor, selecione uma imagem de perfil.");
      return;
    }

    try {
      setSubmitting(true);
      const userCred = await createUserWithEmailAndPassword(auth, email, senha);
      const uid = userCred.user.uid;

      const storageRef = ref(storage, `imagestraining/${uid}`);
      await uploadBytes(storageRef, imageFile);
      const imageUrl = await getDownloadURL(storageRef);

      const alunoData = {
        uid,
        nome,
        whatsapp,
        idade,
        email,
        image: imageUrl,
        personalPage,
        personalUID: personal.uid,
        createdAt: new Date(),
        role: "aluno",
        statusPersonal: "pendente",
        studentPage,
      };

      await setDoc(doc(db, "training", uid), alunoData);
      alert("Cadastro realizado com sucesso!");
      setNome("");
      setWhatsapp("");
      setIdade("");
      setEmail("");
      setSenha("");
      setSenha2("");
      setImageFile(null);
      setPreview(null);
      router.push("/training/login");
    } catch (err: any) {
      console.error("Erro ao cadastrar:", err);
      alert("Erro ao cadastrar: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
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
        position: "relative",
        minHeight: "100dvh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "2rem",
        color: "white",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg,#0f5976,#0f766e,#0f7646,#0f7625)",
          backgroundSize: "400% 400%",
          backgroundPosition: `${bgPosition}% 50%`,
          transition: "background-position 0.1s linear",
          zIndex: 1,
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

      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          width: "100%",
          maxWidth: 500,
          gap: "2rem",
        }}
      >
        {/* Personal Card */}
        <div
          style={{
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(15px) saturate(180%)",
            padding: "1.5rem",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.18)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            width: "100%",
            gap: "1rem",
          }}
        >
          <div
            style={{
              position: "relative",
              width: 80,
              height: 80,
              borderRadius: "50%",
              overflow: "hidden",
              border: "3px solid #22c55e",
              flexShrink: 0,
            }}
          >
            <Image
              src={personal.image || "/default-avatar.png"}
              alt={personal.name}
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              textAlign: "left",
            }}
          >
            <p style={{ fontSize: 14, color: "#e5f5eb", marginBottom: 4 }}>
              {personal.bio || "Treine com dedicação e supere seus limites!"}
            </p>
            <h2 style={{ fontSize: 20, fontWeight: 600 }}>
              Venha treinar com{" "}
              <span style={{ color: "#22c55e" }}>{personal.name}</span> 🚀
            </h2>
          </div>
        </div>

        {/* Form Card */}
        <div
          style={{
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(15px) saturate(180%)",
            padding: "2rem 1.5rem",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.18)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <form
            style={{ width: "100%", display: "flex", flexDirection: "column" }}
            onSubmit={handleSubmit}
          >
            {/* Image selector */}
            <label
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: 100,
                height: 100,
                border: "2px dashed #22c55e",
                borderRadius: "50%",
                margin: "0 auto 1rem",
                cursor: "pointer",
                color: "#fff",
                fontSize: 14,
                textAlign: "center",
                overflow: "hidden",
                position: "relative",
                background: "rgba(0,0,0,0.4)",
              }}
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "50%",
                  }}
                />
              ) : (
                <>
                  <span style={{ fontSize: 24, marginBottom: 2 }}>📷</span>
                  <span>Escolher</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
            </label>

            <input
              type="text"
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              style={{
                width: "100%",
                padding: 12,
                marginBottom: 12,
                borderRadius: 8,
                border: "none",
                outline: "none",
                background: "rgba(255,255,255,0.1)",
                color: "white",
                fontSize: 16,
                boxSizing: "border-box",
              }}
            />

            <div
              style={{ position: "relative", width: "100%", marginBottom: 12 }}
            >
              <input
                type="text"
                placeholder="/sua_pagina_de_aluno"
                value={studentPage}
                onChange={(e) => setStudentPage(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 8,
                  border: "none",
                  outline: "none",
                  background: "rgba(255,255,255,0.1)",
                  color: "white",
                  fontSize: 16,
                  boxSizing: "border-box",
                }}
              />
              <span
                onClick={() => setShowInfoCard(!showInfoCard)}
                style={{
                  position: "absolute",
                  top: "50%",
                  right: 12,
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  fontWeight: "bold",
                  color: "#22c55e",
                  fontSize: 18,
                  userSelect: "none",
                }}
              >
                ?
              </span>
              {showInfoCard && (
                <div
                  style={{
                    position: "absolute",
                    top: "110%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "rgba(30,30,30,0.95)",
                    color: "#fff",
                    padding: "1rem 1.2rem",
                    borderRadius: 12,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
                    width: "max-content",
                    maxWidth: "90vw",
                    textAlign: "left",
                    zIndex: 30,
                    animation: "fadein 0.25s ease",
                    wordBreak: "break-word",
                  }}
                >
                  <p style={{ fontSize: 14, marginBottom: 4 }}>
                    Você pode escolher como vai ficar sua página de aluno. Esse
                    será o link que poderá compartilhar:
                  </p>
                  <a
                    href={`https://iuser.com.br/aluno/${
                      studentPage || "nome_da_sua_pagina"
                    }`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#22c55e",
                      textDecoration: "underline",
                      fontSize: 13,
                    }}
                  >
                    https://iuser.com.br/aluno/
                    {studentPage || "nome_da_sua_pagina"}
                  </a>
                </div>
              )}
            </div>

            <input
              type="text"
              placeholder="Whatsapp"
              value={whatsapp}
              onChange={(e) => setWhatsapp(maskWhatsapp(e.target.value))}
              required
              style={{
                width: "100%",
                padding: 12,
                marginBottom: 12,
                borderRadius: 8,
                border: "none",
                outline: "none",
                background: "rgba(255,255,255,0.1)",
                color: "white",
                fontSize: 16,
                boxSizing: "border-box",
              }}
            />

            <input
              type="text"
              placeholder="Data de nascimento (DD/MM/AAAA)"
              value={idade}
              onChange={(e) => setIdade(formatDateInput(e.target.value))}
              maxLength={10}
              required
              style={{
                width: "100%",
                padding: 12,
                marginBottom: 12,
                borderRadius: 8,
                border: "none",
                outline: "none",
                background: "rgba(255,255,255,0.1)",
                color: "white",
                fontSize: 16,
                boxSizing: "border-box",
              }}
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: 12,
                marginBottom: 12,
                borderRadius: 8,
                border: "none",
                outline: "none",
                background: "rgba(255,255,255,0.1)",
                color: "white",
                fontSize: 16,
                boxSizing: "border-box",
              }}
            />

            {/* Password fields */}
            {[
              {
                value: senha,
                setValue: setSenha,
                show: showSenha,
                setShow: setShowSenha,
                placeholder: "Senha",
              },
              {
                value: senha2,
                setValue: setSenha2,
                show: showSenha2,
                setShow: setShowSenha2,
                placeholder: "Repetir senha",
              },
            ].map((field, idx) => (
              <div key={idx} style={{ position: "relative", marginBottom: 12 }}>
                <input
                  type={field.show ? "text" : "password"}
                  placeholder={field.placeholder}
                  value={field.value}
                  onChange={(e) => field.setValue(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: 12,
                    paddingRight: 40,
                    borderRadius: 8,
                    border: "none",
                    outline: "none",
                    background: "rgba(255,255,255,0.1)",
                    color: "white",
                    fontSize: 16,
                    boxSizing: "border-box",
                  }}
                />
                <span
                  onClick={() => field.setShow(!field.show)}
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: 12,
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    color: "#fff",
                    fontSize: 18,
                  }}
                >
                  {field.show ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            ))}

            <button
              type="submit"
              disabled={submitting || !personal}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 8,
                fontWeight: 700,
                color: "white",
                background: "#22c55e",
                border: "none",
                cursor: "pointer",
                fontSize: 16,
                transition: "0.3s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "#16a34a";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "#22c55e";
              }}
            >
              {submitting ? "Enviando..." : "Enviar cadastro"}
            </button>
          </form>
        </div>

        <div style={{ height: 100 }} />
      </div>
    </div>
  );
}
