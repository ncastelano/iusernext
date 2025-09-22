"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, ChangeEvent } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  setDoc,
  doc,
} from "firebase/firestore";
import { db, auth, storage } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Image from "next/image";
import { FiCamera } from "react-icons/fi";
import { FaEye, FaEyeSlash } from "react-icons/fa";

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

  const [name, setName] = useState("");
  const [alunoPage, setAlunoPage] = useState(""); // alterado
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [bgPosition, setBgPosition] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  // Carregar dados do personal
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

  // Animação de background
  useEffect(() => {
    const interval = setInterval(() => {
      setBgPosition((prev) => (prev >= 100 ? 0 : prev + 0.1));
    }, 16);
    return () => clearInterval(interval);
  }, []);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personal) return alert("Personal não carregado ainda.");
    if (password !== repeatPassword) return alert("As senhas não coincidem!");
    if (!imageFile) return alert("Selecione uma imagem de perfil.");
    if (!alunoPage.trim()) return alert("Escolha o seu link de aluno"); // alterado

    try {
      // Verifica se o alunoPage já existe
      const q = query(
        collection(db, "training"),
        where("personalPage", "==", alunoPage.trim().toLowerCase()) // alterado
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty)
        return alert("Esse link já está em uso, escolha outro!");

      // Criar usuário no Firebase Auth
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = userCred.user.uid;

      // Upload da imagem
      const storageRef = ref(storage, `imagestraining/${uid}`);
      await uploadBytes(storageRef, imageFile);
      const imageUrl = await getDownloadURL(storageRef);

      // Salvar no Firestore
      const alunoData = {
        uid,
        name,
        email,
        image: imageUrl,
        alunoPage: alunoPage.trim().toLowerCase(), // alterado
        personalUID: personal.uid,
        createdAt: new Date(),
        role: "aluno",
        statusPersonal: "pendente",
      };

      await setDoc(doc(db, "training", uid), alunoData);
      alert("Cadastro realizado com sucesso!");
      router.push("/training/login");
    } catch (err: unknown) {
      console.error("Erro ao cadastrar:", err);
      alert(err instanceof Error ? err.message : "Erro ao cadastrar");
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
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        padding: "3rem",
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
          display: "flex",
          gap: "2rem",
          zIndex: 10,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {/* Card Personal */}
        <div
          style={{
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(15px) saturate(180%)",
            WebkitBackdropFilter: "blur(15px) saturate(180%)",
            padding: "2rem 1.5rem",
            borderRadius: "16px",
            width: "280px",
            border: "1px solid rgba(255,255,255,0.18)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 100,
              height: 100,
              marginBottom: "1rem",
              borderRadius: "50%",
              overflow: "hidden",
              border: "3px solid #22c55e",
            }}
          >
            <Image
              src={personal.image || "/default-avatar.png"}
              alt={personal.name}
              width={100}
              height={100}
              style={{ objectFit: "cover" }}
            />
          </div>
          <h2 style={{ fontSize: "1.3rem", marginBottom: "0.5rem" }}>
            {personal.name} convida você a treinar 🚀
          </h2>
          <p style={{ fontSize: "0.9rem", color: "#e5f5eb" }}>
            {personal.bio || "Treine com dedicação e supere seus limites!"}
          </p>
        </div>

        {/* Card Cadastro */}
        <div
          style={{
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(15px) saturate(180%)",
            WebkitBackdropFilter: "blur(15px) saturate(180%)",
            padding: "2rem 1.5rem",
            borderRadius: "16px",
            width: "320px",
            border: "1px solid rgba(255,255,255,0.18)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Foto */}
          <label
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "120px",
              height: "120px",
              border: "2px dashed #22c55e",
              borderRadius: "50%",
              marginBottom: "1.5rem",
              cursor: "pointer",
              color: "#fff",
              fontSize: "0.9rem",
              textAlign: "center",
              overflow: "hidden",
              background: "rgba(0,0,0,0.4)",
            }}
          >
            {preview ? (
              <Image
                src={preview}
                alt="Preview"
                width={120}
                height={120}
                style={{ objectFit: "cover", borderRadius: "50%" }}
              />
            ) : (
              <>
                <FiCamera size={36} style={{ marginBottom: "0.3rem" }} />
                <span>Selecionar</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
          </label>

          <form
            onSubmit={handleSubmit}
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "0.8rem",
            }}
          >
            {[
              {
                type: "text",
                placeholder: "Nome",
                value: name,
                onChange: setName,
              },
              {
                type: "text",
                placeholder: "/SeuPerfil",
                value: alunoPage,
                onChange: setAlunoPage,
              },
              {
                type: "email",
                placeholder: "Email",
                value: email,
                onChange: setEmail,
              },
            ].map((input, idx) => (
              <input
                key={idx}
                type={input.type}
                placeholder={input.placeholder}
                value={input.value}
                onChange={(e) => input.onChange(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  background: "rgba(0,0,0,0.3)",
                  color: "white",
                  fontSize: "1rem",
                  outline: "none",
                }}
              />
            ))}

            {/* Senha */}
            <div style={{ position: "relative", width: "100%" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px 40px 12px 16px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  background: "rgba(0,0,0,0.3)",
                  color: "white",
                  fontSize: "1rem",
                  outline: "none",
                }}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  color: "#ccc",
                }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {/* Repetir Senha */}
            <div style={{ position: "relative", width: "100%" }}>
              <input
                type={showRepeatPassword ? "text" : "password"}
                placeholder="Repetir Senha"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px 40px 12px 16px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  background: "rgba(0,0,0,0.3)",
                  color: "white",
                  fontSize: "1rem",
                  outline: "none",
                }}
              />
              <span
                onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  color: "#ccc",
                }}
              >
                {showRepeatPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "12px",
                background: "#22c55e",
                border: "none",
                borderRadius: 8,
                fontWeight: 700,
                color: "white",
                fontSize: "1rem",
                cursor: "pointer",
                marginTop: "0.5rem",
              }}
            >
              Cadastrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
