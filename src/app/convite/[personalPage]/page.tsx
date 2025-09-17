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

  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [idade, setIdade] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [senha2, setSenha2] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [bgPosition, setBgPosition] = useState(0);

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
        studentPage: personalPage,
      };

      await setDoc(doc(db, "training", uid), alunoData);
      alert("Cadastro realizado com sucesso!");

      // Reset form
      setNome("");
      setWhatsapp("");
      setIdade("");
      setEmail("");
      setSenha("");
      setSenha2("");
      setImageFile(null);
      setPreview(null);

      router.push("/training/login");
    } catch (err: unknown) {
      console.error("Erro ao cadastrar:", err);
      if (err instanceof Error) {
        alert("Erro ao cadastrar: " + err.message);
      } else {
        alert("Erro ao cadastrar");
      }
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
      {/* Background */}
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
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  style={{ objectFit: "cover", borderRadius: "50%" }}
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

            {/* Inputs */}
            {[
              {
                placeholder: "Nome",
                value: nome,
                setter: setNome,
                type: "text",
              },
              {
                placeholder: "Whatsapp",
                value: whatsapp,
                setter: setWhatsapp,
                type: "text",
              },
              {
                placeholder: "Idade",
                value: idade,
                setter: setIdade,
                type: "text",
              },
              {
                placeholder: "Email",
                value: email,
                setter: setEmail,
                type: "email",
              },
              {
                placeholder: "Senha",
                value: senha,
                setter: setSenha,
                type: "password",
              },
              {
                placeholder: "Confirmar senha",
                value: senha2,
                setter: setSenha2,
                type: "password",
              },
            ].map((input, idx) => (
              <input
                key={idx}
                type={input.type}
                placeholder={input.placeholder}
                value={input.value}
                onChange={(e) => input.setter(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: 8,
                  border: "none",
                  marginBottom: 12,
                  background: "rgba(255,255,255,0.1)",
                  color: "white",
                }}
              />
            ))}

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
                cursor: "pointer",
              }}
            >
              Cadastrar
            </button>
          </form>
        </div>

        <div style={{ height: 100 }} />
      </div>
    </div>
  );
}
