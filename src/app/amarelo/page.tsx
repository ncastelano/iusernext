'use client';

import { useState } from 'react';
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
import { db, storage } from '@/lib/firebase';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import { useUser } from 'src/app/context/auth-context';

export default function TelaAmarela() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoURL, setVideoURL] = useState('');
  const [artistSongName, setArtistSongName] = useState('');
  const [descriptionTags, setDescriptionTags] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [compressing, setCompressing] = useState(false);

  const router = useRouter();
  const { user, loading } = useUser();

  const ffmpeg = createFFmpeg({ log: true });

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

  async function compressVideo(file: File): Promise<Blob> {
    if (!ffmpeg.isLoaded()) {
      setCompressing(true);
      await ffmpeg.load();
      setCompressing(false);
    }

    ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(file));
    await ffmpeg.run(
      '-i', 'input.mp4',
      '-vf', 'scale=640:-2',
      '-preset', 'veryfast',
      '-crf', '28',
      '-c:a', 'aac',
      '-b:a', '96k',
      'output.mp4'
    );

    const data = ffmpeg.FS('readFile', 'output.mp4');
    return new Blob([data], { type: 'video/mp4' });
  }

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

      setCompressing(true);
      const compressedVideoBlob = await compressVideo(videoFile);
      setCompressing(false);

      const newDocRef = doc(collection(db, 'videos'));
      const videoID = newDocRef.id;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();

      const videoRef = ref(storage, `All Videos/${videoID}.mp4`);
      const uploadTask = uploadBytesResumable(videoRef, compressedVideoBlob);

      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            console.error('Erro no upload:', error);
            alert('Erro ao enviar o vídeo. Verifique sua conexão.');
            setUploadProgress(null);
            reject(error);
          },
          () => resolve()
        );
      });

      const videoDownloadURL = await getDownloadURL(uploadTask.snapshot.ref);

      let thumbDownloadURL = '';
      try {
        const thumbnailBlob = await generateThumbnailFromVideo(videoFile);
        const thumbRef = ref(storage, `All Thumbnails/${videoID}.jpg`);
        const thumbUpload = await uploadBytesResumable(thumbRef, thumbnailBlob);
        thumbDownloadURL = await getDownloadURL(thumbUpload.ref);
      } catch (thumbError) {
        console.warn('Falha ao gerar thumbnail, continuando sem ela:', thumbError);
      }

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
      router.push('/tudo');
    } catch (error: unknown) {
      console.error('Erro desconhecido:', error);
      alert('Erro ao enviar vídeo.');
      setUploadProgress(null);
      setCompressing(false);
    }
  };

  if (loading) {
    return <main style={{ padding: 32, backgroundColor: '#121212', color: '#e0e0e0', minHeight: '100vh' }}>Carregando...</main>;
  }

  if (!user) {
    return (
      <main style={{ padding: 32, backgroundColor: '#121212', color: '#e0e0e0', minHeight: '100vh' }}>
        <h1>Você precisa estar logado para fazer upload.</h1>
        <button
          onClick={() => router.push('/login')}
          style={{ marginTop: 16, padding: 12, backgroundColor: '#444', borderRadius: 10, fontWeight: 'bold', cursor: 'pointer', color: '#fff' }}
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
        <video controls playsInline muted width="100%" height="400" style={{ marginTop: 16 }}>
          <source src={videoURL} type="video/mp4" />
          Seu navegador não suporta vídeo.
        </video>
      )}

      <input
        type="file"
        accept="video/mp4,video/webm"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const url = URL.createObjectURL(file);
            const video = document.createElement('video');
            video.src = url;
            video.onloadedmetadata = () => {
              setVideoFile(file);
              setVideoURL(url);
            };
          }
        }}
        style={{ marginTop: 16, display: 'block', backgroundColor: '#222', borderRadius: 5, padding: 8, width: '100%' }}
      />

      <input
        type="text"
        placeholder="Artist - Song"
        value={artistSongName}
        onChange={(e) => setArtistSongName(e.target.value)}
        style={{ display: 'block', marginTop: 16, width: '100%', padding: 8, borderRadius: 5, border: 'none', backgroundColor: '#222', color: '#e0e0e0' }}
      />

      <input
        type="text"
        placeholder="Description - Tags"
        value={descriptionTags}
        onChange={(e) => setDescriptionTags(e.target.value)}
        style={{ display: 'block', marginTop: 8, width: '100%', padding: 8, borderRadius: 5, border: 'none', backgroundColor: '#222', color: '#e0e0e0' }}
      />

      <button
        onClick={handleUpload}
        disabled={uploadProgress !== null || compressing}
        style={{
          marginTop: 16,
          padding: 12,
          backgroundColor: uploadProgress !== null || compressing ? '#555' : '#fff',
          borderRadius: 10,
          fontWeight: 'bold',
          cursor: uploadProgress !== null || compressing ? 'not-allowed' : 'pointer',
          color: uploadProgress !== null || compressing ? '#ccc' : '#000',
        }}
      >
        {compressing
          ? 'Comprimindo vídeo...'
          : uploadProgress !== null
          ? `Enviando... ${Math.round(uploadProgress)}%`
          : 'Upload Now'}
      </button>

      {(uploadProgress !== null || compressing) && (
        <div style={{ marginTop: 12 }}>
          <div style={{ height: '8px', backgroundColor: '#333', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                width: compressing ? '100%' : `${uploadProgress}%`,
                height: '100%',
                backgroundColor: '#2ecc71',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <p style={{ fontSize: 12, marginTop: 4 }}>
            {compressing ? 'Processando...' : `${Math.round(uploadProgress ?? 0)}%`}
          </p>
        </div>
      )}
    </main>
  );
}

