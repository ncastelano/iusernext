import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import ffmpegPath from 'ffmpeg-static';
import { ObjectMetadata } from 'firebase-functions/lib/providers/storage';

admin.initializeApp();

if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
} else {
  throw new Error('ffmpeg static binary not found');
}

export const compressVideo = functions
  .region('southamerica-east1')
  .storage
  .object()
  .onFinalize(async (object: ObjectMetadata) => {
    const fileBucket = object.bucket;
    const filePath = object.name;
    const contentType = object.contentType;

    if (!filePath || !contentType || !contentType.startsWith('video/')) {
      console.log('Arquivo não é vídeo. Saindo.');
      return;
    }

    if (!filePath.startsWith('originals/')) {
      console.log('Pasta não é originals/. Saindo.');
      return;
    }

    const bucket = admin.storage().bucket(fileBucket!);
    const fileName = path.basename(filePath);
    const tmpFilePath = path.join(os.tmpdir(), fileName);
    const compressedFileName = `compressed-${fileName}`;
    const tmpCompressedPath = path.join(os.tmpdir(), compressedFileName);
    const destination = `compressed/${compressedFileName}`;

    await bucket.file(filePath).download({ destination: tmpFilePath });

    await new Promise<void>((resolve, reject) => {
  (ffmpeg as any)(tmpFilePath)
    .outputOptions([
      '-vf', 'scale=640:-2',
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '28',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-movflags', '+faststart',
    ])
    .output(tmpCompressedPath)
    .on('end', () => {
      console.log('✔️ Compressão concluída');
      resolve();
    })
    .on('error', (err: any) => {
      console.error('❌ Erro na compressão:', err);
      reject(err);
    })
    .run();
});


    await bucket.upload(tmpCompressedPath, {
      destination,
      metadata: { contentType },
    });

    fs.unlinkSync(tmpFilePath);
    fs.unlinkSync(tmpCompressedPath);

    console.log(`✔️ Arquivo compactado enviado para: ${destination}`);
  });
