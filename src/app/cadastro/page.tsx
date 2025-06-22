'use client';

import { useState } from 'react';
import { auth, db, storage } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function CadastroPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const router = useRouter();

  const customLoader = ({ src }: { src: string }) => {
    return src;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    if (file) {
      if (file.size > 6 * 1024 * 1024) {
        alert('Arquivo muito grande! Máximo permitido: 6MB.');
        e.target.value = '';
        setImageFile(null);
        setPreviewURL(null);
        return;
      }

      setImageFile(file);
      const url = URL.createObjectURL(file);
      setPreviewURL(url);
    } else {
      setImageFile(null);
      setPreviewURL(null);
    }
  };

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, senha);
      const uid = cred.user.uid;

      let imageURL = '';

      if (imageFile) {
        const imageRef = ref(storage, `users/${uid}/profile.jpg`);
        await uploadBytes(imageRef, imageFile);
        imageURL = await getDownloadURL(imageRef);
      }

      await setDoc(doc(collection(db, 'users'), uid), {
        uid,
        name,
        email,
        image: imageURL,
      });

      router.push('/inicio');
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Erro desconhecido ao cadastrar usuário.');
      }
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(to bottom right, #0e0e0e, #1a1a1a)',
        padding: '16px',
      }}
    >
      <div
        style={{
          padding: 24,
          borderRadius: 16,
          backgroundColor: '#1a1a1a',
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          width: '100%',
          maxWidth: 400,
          display: 'flex',
          flexDirection: 'column',
          textAlign: 'center',
          color: '#ccc',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          {/* Avatar circular com preview */}
          <label htmlFor="avatarInput" style={avatarLabelStyle}>
            {previewURL ? (
              <Image
                src={previewURL}
                alt="Preview Avatar"
                width={200}
                height={200}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
                loader={customLoader}
                unoptimized
              />
            ) : (
              'Escolher Avatar'
            )}
          </label>
        </div>

        <form onSubmit={handleCadastro} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="text"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            style={inputStyle}
          />

          {/* Input de arquivo escondido */}
          <input
            id="avatarInput"
            type="file"
            accept="image/gif,image/bmp,image/jpeg,image/png,image/jpg"
            onChange={handleImageChange}
            style={{ display: 'none' }}
            required
          />

          <button type="submit" style={buttonStyle}>
            Cadastrar
          </button>
        </form>

        <p style={{ marginTop: 20, fontSize: 14, color: '#aaa' }}>
          Já tem uma conta?{' '}
          <Link href="/login" style={{ color: '#4ea1f3', textDecoration: 'underline' }}>
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}

const avatarLabelStyle: React.CSSProperties = {
  width: 200,
  height: 200,
  borderRadius: '50%',
  backgroundColor: '#2a2a2a',
  border: '2px dashed #444',
  color: '#ccc',
  fontSize: 16,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
  userSelect: 'none',
  margin: '0 auto',
  transition: 'background-color 0.2s',
};

const inputStyle = {
  width: '100%',
  padding: '12px',
  backgroundColor: '#2a2a2a',
  border: '1px solid #444',
  borderRadius: 8,
  color: '#ccc',
  fontSize: '14px',
  outline: 'none',
} as React.CSSProperties;

const buttonStyle = {
  padding: '12px',
  backgroundColor: '#1a1a1a',
  color: '#ccc',
  border: '1px solid #444',
  borderRadius: 8,
  cursor: 'pointer',
  fontWeight: 500,
  fontSize: '14px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  transition: 'all 0.2s ease-in-out',
} as React.CSSProperties;
