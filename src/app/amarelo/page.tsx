'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import {
  collection,
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import { auth, db, storage } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function TelaAmarela() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoURL, setVideoURL] = useState('');
  const [artistSongName, setArtistSongName] = useState('');
  const [descriptionTags, setDescriptionTags] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const generateThumbnailFromVideo = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(file);
      video.crossOrigin = 'anonymous';
      video.muted = true;
      video.playsInline = true;

      video.onloadedmetadata = () => {
        video.currentTime = 1;
      };

      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('Erro ao criar canvas');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject('Falha ao gerar thumbnail');
        }, 'image/jpeg');
      };

      video.onerror = () => reject('Erro ao carregar vídeo');
    });
  };

  const handleUpload = async () => {
    if (!videoFile || !artistSongName || !descriptionTags) {
      alert('Preencha todos os campos.');
      return;
    }

    if (!user) {
      alert('Usuário não autenticado');
      return;
    }

    try {
      setUploadProgress(0);

      const newDocRef = doc(collection(db, 'videos'));
      const videoID = newDocRef.id;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();

      const videoRef = ref(storage, `All Videos/${videoID}`);
      const uploadTask = uploadBytesResumable(videoRef, videoFile);

      // Monitoramento do progresso
      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            reject(error);
          },
          async () => {
            resolve();
          }
        );
      });

      const videoDownloadURL = await getDownloadURL(uploadTask.snapshot.ref);

      const thumbnailBlob = await generateThumbnailFromVideo(videoFile);
      const thumbRef = ref(storage, `All Thumbnails/${videoID}.jpg`);
      const thumbUpload = await uploadBytesResumable(thumbRef, thumbnailBlob);
      const thumbDownloadURL = await getDownloadURL(thumbUpload.ref);

      const postData = {
        userID: user.uid,
        userName: userData?.name || 'Desconhecido',
        userProfileImage: userData?.image || '',
        postID: videoID,
        totalComments: 0,
        likesList: [],
        artistSongName,
        descriptionTags,
        videoUrl: videoDownloadURL,
        thumbnailUrl: thumbDownloadURL,
        publishedDateTime: Date.now(),
      };

      await setDoc(newDocRef, postData);

      alert('Vídeo enviado com sucesso!');
      setUploadProgress(null);
      router.push('/home');
    } catch (error: any) {
      console.error('Erro ao enviar vídeo:', error?.message || error);
      alert('Erro ao enviar vídeo: ' + (error?.message || 'Erro desconhecido'));
      setUploadProgress(null);
    }
  };

  if (loadingAuth) {
    return (
      <main style={{ padding: 32, backgroundColor: '#121212', color: '#e0e0e0', minHeight: '100vh' }}>
        <p>Carregando...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main style={{ padding: 32, backgroundColor: '#121212', color: '#e0e0e0', minHeight: '100vh' }}>
        <h1>Você precisa estar logado para fazer upload.</h1>
        <button
          onClick={() => router.push('/login')}
          style={{
            marginTop: 16,
            padding: 12,
            backgroundColor: '#444',
            borderRadius: 10,
            fontWeight: 'bold',
            cursor: 'pointer',
            color: '#fff',
          }}
        >
          Ir para Login
        </button>
      </main>
    );
  }

  return (
    <main style={{ padding: 32, backgroundColor: '#121212', color: '#e0e0e0', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 24, fontWeight: 'bold' }}>Upload de Vídeo</h1>

      {videoURL && (
        <video width="100%" height="400" controls src={videoURL} style={{ marginTop: 16 }} />
      )}

      <input
        type="file"
        accept="video/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            setVideoFile(file);
            setVideoURL(URL.createObjectURL(file));
          }
        }}
        style={{
          marginTop: 16,
          display: 'block',
          backgroundColor: '#222',
          borderRadius: 5,
          padding: 8,
          width: '100%',
        }}
      />

      <input
        type="text"
        placeholder="Artist - Song"
        value={artistSongName}
        onChange={(e) => setArtistSongName(e.target.value)}
        style={{
          display: 'block',
          marginTop: 16,
          width: '100%',
          padding: 8,
          borderRadius: 5,
          border: 'none',
          backgroundColor: '#222',
          color: '#e0e0e0',
        }}
      />

      <input
        type="text"
        placeholder="Description - Tags"
        value={descriptionTags}
        onChange={(e) => setDescriptionTags(e.target.value)}
        style={{
          display: 'block',
          marginTop: 8,
          width: '100%',
          padding: 8,
          borderRadius: 5,
          border: 'none',
          backgroundColor: '#222',
          color: '#e0e0e0',
        }}
      />

      <button
        onClick={handleUpload}
        disabled={uploadProgress !== null}
        style={{
          marginTop: 16,
          padding: 12,
          backgroundColor: uploadProgress !== null ? '#555' : '#fff',
          borderRadius: 10,
          fontWeight: 'bold',
          cursor: uploadProgress !== null ? 'not-allowed' : 'pointer',
          color: uploadProgress !== null ? '#ccc' : '#000',
        }}
      >
        {uploadProgress !== null ? `Enviando... ${Math.round(uploadProgress)}%` : 'Upload Now'}
      </button>
    </main>
  );
}
