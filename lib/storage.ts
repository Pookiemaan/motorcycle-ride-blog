import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
export function createS3Client() {
  const endpoint = process.env.S3_ENDPOINT;
  return new S3Client({
    region: process.env.S3_REGION || 'auto',
    endpoint,
    forcePathStyle: !!endpoint,
    credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID || '', secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '' },
  });
}
export function storageConfig() { return { bucket: process.env.S3_BUCKET || '' }; }
export async function signUploadUrl(key: string, contentType: string) {
  const s3 = createS3Client();
  const { bucket } = storageConfig();
  return getSignedUrl(s3, new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType, ACL: 'private' }), { expiresIn: 300 });
}
export async function signDownloadUrl(key: string) {
  const s3 = createS3Client();
  const { bucket } = storageConfig();
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: 900 });
}
