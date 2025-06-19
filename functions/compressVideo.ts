import * as functions from 'firebase-functions/v1'; // Força v1
import * as admin from 'firebase-admin';
import ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import ffmpegPath from 'ffmpeg-static';

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
  .onFinalize(async (object: functions.storage.ObjectMetadata) => {
    const fileBucket = object.bucket;
    const filePath = object.name;
    const contentType = object.contentType;

    if (!filePath || !contentType?.startsWith('video/')) {
      console.log('Não é vídeo. Ignorando.');
      return;
    }

    if (!filePath.startsWith('originals/')) {
      console.log('O vídeo não está na pasta "originals/". Ignorando.');
      return;
    }

    const bucket = admin.storage().bucket(fileBucket);
    const fileName = path.basename(filePath);
    const tmpFilePath = path.join(os.tmpdir(), fileName);
    const compressedFileName = `compressed-${fileName}`;
    const tmpCompressedPath = path.join(os.tmpdir(), compressedFileName);
    const destination = `compressed/${compressedFileName}`;

    await bucket.file(filePath).download({ destination: tmpFilePath });

    await new Promise<void>((resolve, reject) => {
      ffmpeg(tmpFilePath)
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
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    await bucket.upload(tmpCompressedPath, {
      destination,
      metadata: { contentType },
    });

    fs.unlinkSync(tmpFilePath);
    fs.unlinkSync(tmpCompressedPath);

    console.log(`✔️ Vídeo compactado enviado para: ${destination}`);
  });
