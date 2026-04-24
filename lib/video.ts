import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import fs from 'fs/promises';
import path from 'path';
import { tmpdir } from 'os';
if (ffmpegPath) ffmpeg.setFfmpegPath(ffmpegPath);

export async function processVideo(inputPath: string) {
  const outputDir = await fs.mkdtemp(path.join(tmpdir(), 'ride-video-'));
  const thumbnail = path.join(outputDir, 'thumb.jpg');
  const compressed = path.join(outputDir, 'compressed.mp4');

  await new Promise<void>((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions(['-preset medium', '-crf 28', '-movflags +faststart', '-pix_fmt yuv420p', "-vf scale='min(1280,iw)':-2"])
      .output(compressed)
      .on('end', () => resolve())
      .on('error', reject)
      .run();
  });

  await new Promise<void>((resolve, reject) => {
    ffmpeg(inputPath)
      .screenshots({ timestamps: ['20%'], filename: 'thumb.jpg', folder: outputDir, size: '1280x?' })
      .on('end', () => resolve())
      .on('error', reject);
  });

  return { compressed, thumbnail };
}
