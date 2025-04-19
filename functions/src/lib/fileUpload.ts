import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Upload a file to Firebase Storage
 * @param file The file to upload
 * @param path The path in storage where the file should be saved
 * @param onProgress Optional callback function for upload progress
 * @returns Promise that resolves with the download URL
 */
export async function uploadFile(
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const storageRef = ref(storage, path);
  
  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    // Register three observers:
    // 1. 'state_changed' observer, called any time the state changes
    // 2. Error observer, called on failure
    // 3. Completion observer, called on successful completion
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) {
          onProgress(progress);
        }
        console.log('Upload is ' + progress + '% done');
      },
      (error) => {
        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        console.error('Upload error:', error);
        reject(error);
      },
      async () => {
        // Upload completed successfully, now we can get the download URL
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
}

/**
 * Generate a unique file path for storage
 * @param file The file to upload
 * @param userId Optional user ID to include in the path
 * @param folder The folder in storage
 * @returns The unique file path
 */
export function generateFilePath(file: File, userId?: string, folder = 'uploads'): string {
  const timestamp = Date.now();
  const extension = file.name.split('.').pop();
  const fileName = `${file.name.split('.')[0]}-${timestamp}.${extension}`;
  
  if (userId) {
    return `${folder}/${userId}/${fileName}`;
  }
  
  return `${folder}/${fileName}`;
} 