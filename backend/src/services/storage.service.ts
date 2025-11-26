import { firebaseStorage } from '../config/firebase.js';
import fs from 'fs';
import path from 'path';

export const uploadToFirebase = async (
  localPath: string,
  destinationPath: string
): Promise<string> => {
  try {
    const bucket = firebaseStorage.bucket();
    const blob = bucket.file(destinationPath);

    await bucket.upload(localPath, {
      destination: destinationPath,
      metadata: {
        contentType: getContentType(localPath),
      },
    });

    // Make the file publicly accessible
    await blob.makePublic();

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destinationPath}`;
    return publicUrl;
  } catch (error: any) {
    console.error('Firebase upload error:', error);
    throw new Error(`Failed to upload to Firebase: ${error.message}`);
  }
};

export const deleteFromFirebase = async (filePath: string): Promise<void> => {
  try {
    const bucket = firebaseStorage.bucket();
    await bucket.file(filePath).delete();
    console.log(`Deleted file from Firebase: ${filePath}`);
  } catch (error: any) {
    console.error('Firebase delete error:', error);
    throw new Error(`Failed to delete from Firebase: ${error.message}`);
  }
};

export const deleteLocalFile = (filePath: string): void => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted local file: ${filePath}`);
    }
  } catch (error: any) {
    console.error('Local file delete error:', error);
  }
};

const getContentType = (filePath: string): string => {
  const ext = path.extname(filePath).toLowerCase();
  const contentTypes: { [key: string]: string } = {
    '.mp4': 'video/mp4',
    '.mov': 'video/quicktime',
    '.avi': 'video/x-msvideo',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
  };
  return contentTypes[ext] || 'application/octet-stream';
};
