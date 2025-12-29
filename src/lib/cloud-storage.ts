import { Storage } from "@google-cloud/storage";

const storage = new Storage({
  projectId: process.env.FIREBASE_PROJECT_ID,
  credentials: {
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
});

const bucketName = process.env.GCS_BUCKET_NAME;

export async function uploadImage(
  file: File | Blob,
  path: string
): Promise<string> {
  if (!bucketName) {
    throw new Error("GCS_BUCKET_NAME is not defined");
  }

  const bucket = storage.bucket(bucketName);
  const fileBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(fileBuffer);

  const blob = bucket.file(path);
  const blobStream = blob.createWriteStream({
    resumable: false,
    metadata: {
      contentType: file.type,
    },
  });

  return new Promise((resolve, reject) => {
    blobStream.on("error", (err) => {
      reject(err);
    });

    blobStream.on("finish", async () => {
      // Generate a signed URL that expires in 7 days
      const [signedUrl] = await blob.getSignedUrl({
        action: 'read',
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      resolve(signedUrl);
    });

    blobStream.end(buffer);
  });
}

// Helper function to generate signed URLs for existing files
export async function getSignedUrl(filePath: string): Promise<string> {
  if (!bucketName) {
    throw new Error("GCS_BUCKET_NAME is not defined");
  }

  const bucket = storage.bucket(bucketName);
  const file = bucket.file(filePath);

  const [signedUrl] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return signedUrl;
}

// Delete an image from GCS
export async function deleteImage(filePath: string): Promise<void> {
  if (!bucketName) {
    throw new Error("GCS_BUCKET_NAME is not defined");
  }

  const bucket = storage.bucket(bucketName);
  const file = bucket.file(filePath);

  await file.delete();
}
